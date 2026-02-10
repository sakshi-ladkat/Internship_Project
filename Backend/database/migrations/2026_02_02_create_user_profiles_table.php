<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('user_profiles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            
            // Personal Information
            $table->string('first_name')->nullable();
            $table->string('middle_name')->nullable();
            $table->string('last_name')->nullable();
            $table->date('date_of_birth')->nullable();
            $table->enum('gender', ['Male', 'Female', 'Prefer not to say'])->nullable();
            $table->string('country_code', 10)->nullable();
            $table->string('mobile_number', 20)->nullable();
            $table->boolean('mobile_verified')->default(false);
            $table->string('personal_email')->nullable();
            $table->string('alternate_email')->nullable();
            $table->boolean('alternate_email_verified')->default(false);
            
            // Address
            $table->string('address_line1')->nullable();
            $table->string('address_line2')->nullable();
            $table->string('address_line3')->nullable();
            $table->string('city')->nullable();
            $table->string('state')->nullable();
            $table->string('country')->nullable();
            $table->string('postal_code', 20)->nullable();
            
            // Additional Info
            $table->string('profile_photo')->nullable();
            $table->string('nationality')->nullable();
            $table->string('country_of_citizenship')->nullable();
            $table->enum('student_type', ['Internal Student', 'External Student'])->nullable();
            
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('user_profiles');
    }
};
