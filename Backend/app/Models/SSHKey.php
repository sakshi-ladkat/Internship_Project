<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SSHKey extends Model
{
    use HasFactory;

    protected $table = 'ssh_keys';

    protected $fillable = [
        'user_id',
        'name',
        'public_key',
        'fingerprint',
        'is_active',
        'last_used_at',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'last_used_at' => 'datetime',
    ];

    /**
     * Get the user that owns the SSH key
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Generate fingerprint from public key
     */
    public static function generateFingerprint($publicKey)
    {
        return md5($publicKey);
    }
}
