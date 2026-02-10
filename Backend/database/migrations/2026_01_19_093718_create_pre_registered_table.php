<?php
// database/migrations/2026_01_12_093718_create_pre_registered_table.php

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
        Schema::create('pre_registered', function (Blueprint $table) {
            $table->id();    // primary key

            // Foreign key to users table (nullable until user is created)
            $table->foreignId('user_id')
                  ->nullable()
                  ->constrained('users')
                  ->nullOnDelete();

            $table->string('email', 255)
                  ->unique();

            $table->string('verification_code')
                  ->nullable(); // Hashed token

            $table->enum('email_status', ['verified', 'unverified'])
                  ->default('unverified')
                  ->index();

            $table->timestamp('verified_at')
                  ->nullable();

            $table->timestamp('verification_expires_at');
            
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pre_registered');
    }
};
