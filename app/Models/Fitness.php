<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class Fitness extends Model
{
    protected $fillable = ['vehicle_id', 'certificate_no', 'issue_date', 'expiry_date'];
    protected $casts = ['issue_date' => 'date', 'expiry_date' => 'date'];
}
