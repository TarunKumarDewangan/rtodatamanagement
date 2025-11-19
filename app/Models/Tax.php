<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class Tax extends Model
{
    protected $fillable = ['vehicle_id', 'tax_mode', 'from_date', 'upto_date', 'amount', 'vehicle_type_opt'];
    protected $casts = ['from_date' => 'date', 'upto_date' => 'date'];
}
