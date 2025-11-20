<?php

namespace App\Http\Controllers;

use App\Models\Citizen;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class CitizenController extends Controller
{
    public function index(Request $request)
    {
        $query = Citizen::where('user_id', \Illuminate\Support\Facades\Auth::id())
            ->with('vehicles'); // Eager load vehicles for display

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                // Search Citizen Details
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('mobile_number', 'like', "%{$search}%")
                    // Search Related Vehicles
                    ->orWhereHas('vehicles', function ($v) use ($search) {
                        $v->where('registration_no', 'like', "%{$search}%")
                            ->orWhere('chassis_no', 'like', "%{$search}%");
                    });
            });
        }

        return response()->json($query->latest()->get());
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

    public function update(Request $request, Citizen $citizen)
    {
        // Security check
        if ($citizen->user_id !== auth()->id() && auth()->user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }
        $citizen->update($request->all());
        return response()->json($citizen);
    }

    public function destroy(Citizen $citizen)
    {
        if ($citizen->user_id !== auth()->id() && auth()->user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }
        $citizen->delete();
        return response()->json(['message' => 'Deleted']);
    }

}
