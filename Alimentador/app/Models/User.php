<?php

namespace App\Models;

use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasManyThrough;
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
    ];

    

    protected $hidden = [
        'password',
        'remember_token',
    ];

    

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    

    public function devices(): HasMany
    {
        return $this->hasMany(Device::class);
    }

    

    public function alerts(): HasManyThrough
    {
        return $this->hasManyThrough(Alert::class, Device::class);
    }
}
