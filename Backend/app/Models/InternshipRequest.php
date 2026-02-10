<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class InternshipRequest extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'type',
        'details',
        'status',
        'institute_id',
        'department_id',
        'sub_department_id',
        'admin_remarks'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
