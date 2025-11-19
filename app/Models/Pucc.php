<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class Pucc extends Model
{
    protected $fillable = ['vehicle_id', 'pucc_number', 'valid_from', 'valid_until', 'status'];
    protected $casts = ['valid_from' => 'date', 'valid_until' => 'date'];
}
