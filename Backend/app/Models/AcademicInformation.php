<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AcademicInformation extends Model
{
    use HasFactory;

    protected $table = 'academic_information';

    protected $fillable = [
        'user_id',
        'degree_level',
        'degree_title',
        'specialization',
        'institute_name',
        'institute_country',
        'start_date',
        'end_date',
        'grading_system',
        'grade_value',
        'is_current'
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'is_current' => 'boolean'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
