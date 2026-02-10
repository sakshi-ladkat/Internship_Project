<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class UserProfile extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'first_name',
        'middle_name',
        'last_name',
        'date_of_birth',
        'gender',
        'country_code',
        'mobile_number',
        'mobile_verified',
        'personal_email',
        'alternate_email',
        'alternate_email_verified',
        'address_line1',
        'address_line2',
        'address_line3',
        'city',
        'state',
        'country',
        'postal_code',
        'profile_photo',
        'nationality',
        'country_of_citizenship',
        'student_type'
    ];

    protected $casts = [
        'date_of_birth' => 'date',
        'mobile_verified' => 'boolean',
        'alternate_email_verified' => 'boolean'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
