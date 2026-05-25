<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'phone',
    ];

    // SECURITY COMPLIANCE CHECK: hide password from JSON responses
    protected $hidden = [
        'password',
        'remember_token',
    ];

    public function orders()
    {
        return $this->hasMany(Order::class, 'customer_id');
    }

    public function activityLogs()
    {
        return $this->hasMany(ActivityLog::class);
    }
}
