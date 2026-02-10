<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    use HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'username',
        'email',
        'password',
        'institute_id',
        'email_verified_at',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    /**
     * Get the user's profile
     */
    public function profile()
    {
        return $this->hasOne(UserProfile::class);
    }

    /**
     * Get the user's academic information
     */
    public function academicInformation()
    {
        return $this->hasMany(AcademicInformation::class);
    }

    /**
     * Get the user's affiliation details
     */
    public function affiliationDetails()
    {
        return $this->hasOne(AffiliationDetail::class);
    }

    /**
     * Get the user's project details
     */
    public function projectDetails()
    {
        return $this->hasMany(ProjectDetail::class);
    }

    /**
     * Get the user's roles
     */
    public function roles()
    {
        return $this->belongsToMany(Role::class)
                    ->withPivot(['institute_id', 'department_id', 'sub_department_id'])
                    ->withTimestamps();
    }

    /**
     * Check if user has a specific role
     */
    public function hasRole($roleSlug)
    {
        return $this->roles()->where('slug', $roleSlug)->exists();
    }

    /**
     * Check if user has a specific permission
     */
    public function hasPermission($permissionSlug)
    {
        foreach ($this->roles as $role) {
            if ($role->permissions()->where('slug', $permissionSlug)->exists()) {
                return true;
            }
        }
        return false;
    }

    /**
     * Get the user's institute
     */
    public function institute()
    {
        return $this->belongsTo(Institute::class);
    }

    /**
     * Get the user's registration data
     */
    public function registrationData()
    {
        return $this->hasOne(RegistrationData::class);
    }

    /**
     * Get the user's SSH keys
     */
    public function sshKeys()
    {
        return $this->hasMany(SSHKey::class);
    }

    /**
     * Check if user is Super Admin
     */
    public function isSuperAdmin()
    {
        return $this->hasRole('super_admin');
    }
}
