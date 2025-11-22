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
        'status',
        'whatsapp_key',
        'whatsapp_host' // <--- Add these
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'password' => 'hashed',
    ];

    // Relationship to permissions
    public function activities()
    {
        return $this->belongsToMany(Activity::class, 'user_activity');
    }

    // Helper to check role
    public function isAdmin()
    {
        return $this->role === 'admin';
    }
    public function citizens()
    {
        return $this->hasMany(Citizen::class);
    }
}
