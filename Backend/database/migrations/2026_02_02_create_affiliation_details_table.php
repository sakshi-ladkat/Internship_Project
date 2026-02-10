<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('affiliation_details', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            
            // Affiliation Information
            $table->enum('current_affiliation', [
                'Student',
                'Researcher',
                'Faculty',
                'Industry Professional',
                'Independent Researcher'
            ])->nullable();
            $table->string('affiliated_organization')->nullable();
            $table->string('country')->nullable();
            $table->string('position_role')->nullable();
            $table->date('start_date')->nullable();
            $table->date('end_date')->nullable();
            
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('affiliation_details');
    }
};
