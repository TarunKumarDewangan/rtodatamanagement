<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class Permit extends Model
{
    protected $fillable = ['vehicle_id', 'permit_no', 'issue_date', 'expiry_date'];
    protected $casts = ['issue_date' => 'date', 'expiry_date' => 'date'];
}
