<?php

namespace App\Http\Controllers;

use App\Models\Citizen;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class CitizenController extends Controller
{
    public function index()
    {
        // ONLY get citizens created by the logged-in user
        return response()->json(
            Citizen::where('user_id', Auth::id())->latest()->get()
        );
    }

    public function show(Citizen $citizen)
    {
        // SECURITY CHECK: If this citizen does not belong to the user, block access
        if ($citizen->user_id !== Auth::id() && Auth::user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $citizen->load([
            'vehicles.taxes',
            'vehicles.insurances',
            'vehicles.puccs',
            'vehicles.fitnesses',
            'vehicles.permits',
            'vehicles.speedGovernors',
            'vehicles.vltds'
        ]);

        return response()->json($citizen);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'mobile_number' => 'required|string|max:20',
            'email' => 'nullable|email',
            'birth_date' => 'nullable|date',
            'relation_type' => 'nullable|string',
            'relation_name' => 'nullable|string',
            'address' => 'nullable|string',
            'state' => 'nullable|string',
            'city_district' => 'nullable|string',
        ]);

        // AUTOMATICALLY assign the logged-in user's ID
        $validated['user_id'] = Auth::id();

        $citizen = Citizen::create($validated);

        return response()->json($citizen, 201);
    }
}
