<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class System extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'institute_id',
        'name',
        'description',
        'is_active',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'is_active' => 'boolean',
    ];

    /**
     * Get the institute that owns the system.
     */
    public function institute(): BelongsTo
    {
        return $this->belongsTo(Institute::class);
    }

    /**
     * Get all subsystems for this system.
     */
    public function subSystems(): HasMany
    {
        return $this->hasMany(SubSystem::class);
    }

    /**
     * Get only active subsystems for this system.
     */
    public function activeSubSystems(): HasMany
    {
        return $this->hasMany(SubSystem::class)->where('is_active', true);
    }

    /**
     * Get project details associated with this system.
     */
    public function projectDetails(): HasMany
    {
        return $this->hasMany(ProjectDetail::class);
    }

    /**
     * Scope to get only active systems.
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope to get systems by institute.
     */
    public function scopeByInstitute($query, $instituteId)
    {
        return $query->where('institute_id', $instituteId);
    }
}
