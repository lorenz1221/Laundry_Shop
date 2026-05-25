<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ActivityLog extends Model
{
    use HasFactory;

    public $timestamps = false;

    const CREATED_AT = 'created_at';

    protected $fillable = [
        'user_id',
        'action',
        'details',
        'ip_address',
    ];

    protected $dates = ['created_at'];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
