<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class SpeedGovernor extends Model
{
    protected $fillable = ['vehicle_id', 'vendor_name', 'issue_date', 'expiry_date'];
    protected $casts = ['issue_date' => 'date', 'expiry_date' => 'date'];
}
