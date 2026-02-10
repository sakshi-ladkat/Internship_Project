<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Supervisor extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'email', 'department'];

    public function projectDetails()
    {
        return $this->hasMany(ProjectDetail::class);
    }
}

class Institute extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'country'];

    public function departments()
    {
        return $this->hasMany(Department::class);
    }

    public function projectDetails()
    {
        return $this->hasMany(ProjectDetail::class);
    }
}

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

class SubDepartment extends Model
{
    use HasFactory;

    protected $fillable = ['department_id', 'name'];

    public function department()
    {
        return $this->belongsTo(Department::class);
    }

    public function projectDetails()
    {
        return $this->hasMany(ProjectDetail::class);
    }
}
