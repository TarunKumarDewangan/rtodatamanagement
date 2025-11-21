<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class Insurance extends Model
{
    // Add 'total_amount' to fillable
    protected $fillable = ['vehicle_id', 'company', 'type', 'start_date', 'end_date', 'status', 'total_amount'];
    protected $casts = ['start_date' => 'date', 'end_date' => 'date'];

    // Relationship to Payments
    public function transactions()
    {
        return $this->morphMany(Transaction::class, 'payable');
    }
    public function vehicle()
    {
        return $this->belongsTo(Vehicle::class);
    }
}
