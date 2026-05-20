<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. Update institutes table
        Schema::table('institutes', function (Blueprint $table) {
            if (!Schema::hasColumn('institutes', 'has_li_coordinator')) {
                $table->boolean('has_li_coordinator')->default(false)->after('is_active');
            }
        });

        // 2. Update user_roles table to support history queries
        Schema::table('user_roles', function (Blueprint $table) {
            if (!Schema::hasColumn('user_roles', 'institute_id')) {
                $table->foreignId('institute_id')
                    ->nullable()
                    ->after('role_id')
                    ->constrained('institutes')
                    ->onDelete('set null');
            }
            if (!Schema::hasColumn('user_roles', 'role')) {
                $table->string('role')->nullable()->after('institute_id');
            }
            if (!Schema::hasColumn('user_roles', 'assigned_by')) {
                $table->foreignUlid('assigned_by')
                    ->nullable()
                    ->after('role')
                    ->references('user_id')->on('users')
                    ->onDelete('set null');
            }
        });

        // 3. Create role_assignment_logs audit table
        Schema::create('role_assignment_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignUlid('assigned_by')
                ->references('user_id')->on('users')
                ->onDelete('cascade');
            $table->foreignUlid('user_id')
                ->references('user_id')->on('users')
                ->onDelete('cascade');
            $table->string('previous_role')->nullable();
            $table->string('new_role');
            $table->foreignId('institute_id')
                ->nullable()
                ->constrained('institutes')
                ->onDelete('set null');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('role_assignment_logs');

        Schema::table('user_roles', function (Blueprint $table) {
            $table->dropForeign(['institute_id']);
            $table->dropForeign(['assigned_by']);
            $table->dropColumn(['institute_id', 'role', 'assigned_by']);
        });

        Schema::table('institutes', function (Blueprint $table) {
            $table->dropColumn('has_li_coordinator');
        });
    }
};
