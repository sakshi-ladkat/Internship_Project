<?php
// app/Models/PreRegistered.php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class PreRegistered extends Model
{
    protected $table = 'pre_registered';

    protected $fillable = [
        'email',
        'verification_code',
        'email_status',
        'verified_at',
        'verification_expires_at'
    ];

    protected $casts = [
        'verified_at' => 'datetime',
        'verification_expires_at' => 'datetime',
    ];

    /**
     * Check if the verification token has expired
     */
    public function isVerificationExpired(): bool
    {
        return Carbon::now()->isAfter($this->verification_expires_at);
    }

    /**
     * Check if email is verified
     */
    public function isVerified(): bool
    {
        return $this->email_status === 'verified';
    }

    /**
     * Scope to get unverified records older than specified minutes
     */
    public function scopeOldUnverified($query, $minutes = 60)
    {
        return $query->where('email_status', 'unverified')
                     ->where('created_at', '<', Carbon::now()->subMinutes($minutes));
    }
}