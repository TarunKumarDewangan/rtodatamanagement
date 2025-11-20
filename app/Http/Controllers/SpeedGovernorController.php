<?php

namespace App\Http\Controllers;

use App\Models\SpeedGovernor;
use App\Models\Vehicle;
use Illuminate\Http\Request;

class SpeedGovernorController extends Controller
{
    public function store(Request $request, Vehicle $vehicle)
    {
        $validated = $request->validate([
            'vendor_name' => 'nullable|string',
            'issue_date' => 'nullable|date',
            'expiry_date' => 'required|date',
            'total_amount' => 'nullable|numeric', // <--- ADD THIS
        ]);
        $sg = $vehicle->speedGovernors()->create($validated);
        return response()->json($sg, 201);
    }

    public function update(Request $request, SpeedGovernor $speedGovernor)
    {
        $validated = $request->validate([
            'vendor_name' => 'nullable|string',
            'issue_date' => 'nullable|date',
            'expiry_date' => 'required|date',
            'total_amount' => 'nullable|numeric', // <--- ADD THIS
        ]);
        $speedGovernor->update($validated);
        return response()->json($speedGovernor);
    }

    public function destroy(SpeedGovernor $speedGovernor)
    {
        $speedGovernor->delete();
        return response()->json(['message' => 'Speed Governor deleted']);
    }
}
