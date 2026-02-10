<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('academic_information', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            
            // Academic Details
            $table->enum('degree_level', [
                'High School',
                'Bachelors',
                'Masters',
                'Doctorate',
                'Postdoc'
            ])->nullable();
            $table->string('degree_title')->nullable();
            $table->string('specialization')->nullable();
            $table->string('institute_name')->nullable();
            $table->string('institute_country')->nullable();
            $table->date('start_date')->nullable();
            $table->date('end_date')->nullable();
            $table->enum('grading_system', [
                'Percentage',
                'CGPA (10-point)',
                'CGPA (4-point)',
                'GPA',
                'Letter Grades'
            ])->nullable();
            $table->string('grade_value')->nullable();
            $table->boolean('is_current')->default(false);
            
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('academic_information');
    }
};
