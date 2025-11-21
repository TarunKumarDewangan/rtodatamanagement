<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Vltd extends Model
{
    use HasFactory;

    protected $fillable = ['vehicle_id', 'vendor_name', 'issue_date', 'expiry_date', 'total_amount'];

    protected $casts = ['issue_date' => 'date', 'expiry_date' => 'date'];

    public function transactions()
    {
        return $this->morphMany(Transaction::class, 'payable');
    }
    public function vehicle()
    {
        return $this->belongsTo(Vehicle::class);
    }
}
