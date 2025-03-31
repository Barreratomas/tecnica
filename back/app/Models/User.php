<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class User extends Model
{
    use HasFactory;

 
    protected $fillable = [
        'username',
        'email',
        'password',
        'token',
        'role'
    ];

    protected $hidden = [
        'password',
    ];

    public function reservations()
    {
        return $this->hasMany(Reservation::class);
    }

}
