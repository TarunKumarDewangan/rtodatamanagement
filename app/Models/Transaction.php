<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Transaction extends Model
{
    use HasFactory;

    protected $fillable = [
        'amount_paid',
        'payment_date',
        'remarks',
        'payable_id',
        'payable_type'
    ];

    // Links back to Tax, Insurance, etc.
    public function payable()
    {
        return $this->morphTo();
    }
}
