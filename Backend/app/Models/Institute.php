<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Institute extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'code',
        'country',
        'city',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    public function departments()
    {
        return $this->hasMany(Department::class);
    }

    public function projectDetails()
    {
        return $this->hasMany(ProjectDetail::class);
    }

    /**
     * Get users belonging to this institute
     */
    public function users()
    {
        return $this->hasMany(User::class);
    }

    /**
     * Get registration data for this institute
     */
    public function registrations()
    {
        return $this->hasMany(RegistrationData::class);
    }
}
