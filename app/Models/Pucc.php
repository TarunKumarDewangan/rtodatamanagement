<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Pucc extends Model
{
    use HasFactory;

    protected $fillable = ['vehicle_id', 'pucc_number', 'valid_from', 'valid_until', 'status', 'total_amount'];

    protected $casts = ['valid_from' => 'date', 'valid_until' => 'date'];

    public function transactions()
    {
        return $this->morphMany(Transaction::class, 'payable');
    }
    public function vehicle()
    {
        return $this->belongsTo(Vehicle::class);
    }
}
