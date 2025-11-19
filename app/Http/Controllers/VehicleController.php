<?php

namespace App\Http\Controllers;

use App\Models\Vehicle;
use App\Models\Citizen;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class VehicleController extends Controller
{
    public function store(Request $request, Citizen $citizen)
    {
        // Check if the logged-in user owns this citizen
        if ($citizen->user_id !== auth()->id() && auth()->user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            // OLD RULE: 'unique:vehicles,registration_no' (Global unique)
            // NEW RULE: Unique only for this specific citizen
            'registration_no' => [
                'required',
                'string',
                'max:255',
                Rule::unique('vehicles')->where(function ($query) use ($citizen) {
                    return $query->where('citizen_id', $citizen->id);
                })
            ],
            'type' => 'nullable|string',
            'make_model' => 'nullable|string',
            'chassis_no' => 'nullable|string',
            'engine_no' => 'nullable|string',
        ]);

        $vehicle = $citizen->vehicles()->create($validated);

        return response()->json($vehicle, 201);
    }

    public function update(Request $request, Vehicle $vehicle)
    {
        // Check ownership via the citizen relationship
        if ($vehicle->citizen->user_id !== auth()->id() && auth()->user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'registration_no' => [
                'required',
                'string',
                // Unique for this citizen, but ignore the current vehicle ID (so we can save without changing name)
                Rule::unique('vehicles')->where(function ($query) use ($vehicle) {
                    return $query->where('citizen_id', $vehicle->citizen_id);
                })->ignore($vehicle->id)
            ],
            'type' => 'nullable|string',
            'make_model' => 'nullable|string',
            'chassis_no' => 'nullable|string',
            'engine_no' => 'nullable|string',
        ]);

        $vehicle->update($validated);
        return response()->json($vehicle);
    }

    public function destroy(Vehicle $vehicle)
    {
        // Due to cascadeOnDelete in migration, this deletes all documents too
        $vehicle->delete();
        return response()->json(['message' => 'Vehicle and documents deleted.']);
    }
}
