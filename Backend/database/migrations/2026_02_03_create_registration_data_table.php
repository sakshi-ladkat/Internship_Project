<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('registration_data', function (Blueprint $table) {
            $table->id();
            $table->string('email')->unique();
            $table->foreignId('institute_id')->nullable()->constrained('institutes')->onDelete('set null');
            
            // Name fields
            $table->string('first_name');
            $table->string('middle_name')->nullable();
            $table->string('last_name');
            $table->string('suffix')->nullable(); // Jr., Sr., III, etc.
            
            // Contact Information
            $table->string('address_line1');
            $table->string('address_line2')->nullable();
            $table->string('address_line3')->nullable();
            $table->string('city');
            $table->string('state');
            $table->string('postal_code');
            $table->string('continent');
            $table->string('country');
            
            // Phone numbers
            $table->string('office_country_code');
            $table->string('office_city_code')->nullable();
            $table->string('office_number');
            $table->string('fax_number')->nullable();
            
            // Status tracking
            $table->enum('status', ['pending', 'email_verified', 'password_set', 'completed'])->default('pending');
            $table->timestamp('email_verified_at')->nullable();
            $table->timestamp('password_set_at')->nullable();
            $table->foreignId('user_id')->nullable()->constrained('users')->onDelete('cascade');
            
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('registration_data');
    }
};
