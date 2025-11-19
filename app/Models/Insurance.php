<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class Insurance extends Model
{
    protected $fillable = ['vehicle_id', 'company', 'type', 'start_date', 'end_date', 'status'];
    protected $casts = ['start_date' => 'date', 'end_date' => 'date'];
}
