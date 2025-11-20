<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class Tax extends Model
{
    // Add 'total_amount' to fillable
    protected $fillable = ['vehicle_id', 'tax_mode', 'from_date', 'upto_date', 'amount', 'vehicle_type_opt', 'total_amount'];
    protected $casts = ['from_date' => 'date', 'upto_date' => 'date'];

    // Relationship to Payments
    public function transactions()
    {
        return $this->morphMany(Transaction::class, 'payable');
    }
}
