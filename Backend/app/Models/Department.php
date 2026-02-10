<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Department extends Model
{
    use HasFactory;

    protected $fillable = ['institute_id', 'name'];

    public function institute()
    {
        return $this->belongsTo(Institute::class);
    }

    public function subDepartments()
    {
        return $this->hasMany(SubDepartment::class);
    }

    public function projectDetails()
    {
        return $this->hasMany(ProjectDetail::class);
    }
}
