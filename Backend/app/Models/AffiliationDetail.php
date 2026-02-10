<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AffiliationDetail extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'current_affiliation',
        'affiliated_organization',
        'country',
        'position_role',
        'start_date',
        'end_date'
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
