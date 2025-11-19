<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Vehicle extends Model
{
    use HasFactory;

    protected $fillable = [
        'citizen_id',
        'registration_no',
        'type',
        'make_model',
        'chassis_no',
        'engine_no'
    ];

    public function citizen()
    {
        return $this->belongsTo(Citizen::class);
    }

    // Relationships ordered by latest expiry first for the UI
    public function taxes()
    {
        return $this->hasMany(Tax::class)->orderBy('upto_date', 'desc');
    }
    public function insurances()
    {
        return $this->hasMany(Insurance::class)->orderBy('end_date', 'desc');
    }
    public function puccs()
    {
        return $this->hasMany(Pucc::class)->orderBy('valid_until', 'desc');
    }
    public function fitnesses()
    {
        return $this->hasMany(Fitness::class)->orderBy('expiry_date', 'desc');
    }
    public function permits()
    {
        return $this->hasMany(Permit::class)->orderBy('expiry_date', 'desc');
    }
    public function speedGovernors()
    {
        return $this->hasMany(SpeedGovernor::class)->orderBy('expiry_date', 'desc');
    }
    public function vltds()
    {
        return $this->hasMany(Vltd::class)->orderBy('expiry_date', 'desc');
    }
}
