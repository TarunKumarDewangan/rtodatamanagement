<?php

namespace App\Http\Controllers;

use App\Models\Insurance;
use App\Models\Vehicle;
use Illuminate\Http\Request;

class InsuranceController extends Controller
{
    public function store(Request $request, Vehicle $vehicle)
    {
        $validated = $request->validate([
            'company' => 'nullable|string',
            'type' => 'nullable|string',
            'start_date' => 'nullable|date',
            'end_date' => 'required|date',
            'status' => 'nullable|string',
            'total_amount' => 'nullable|numeric', // <--- ADD THIS
        ]);

        $insurance = $vehicle->insurances()->create($validated);
        return response()->json($insurance, 201);
    }

    public function update(Request $request, Insurance $insurance)
    {
        $validated = $request->validate([
            'company' => 'nullable|string',
            'type' => 'nullable|string',
            'start_date' => 'nullable|date',
            'end_date' => 'required|date',
            'status' => 'nullable|string',
            'total_amount' => 'nullable|numeric', // <--- ADD THIS
        ]);

        $insurance->update($validated);
        return response()->json($insurance);
    }

    public function destroy(Insurance $insurance)
    {
        $insurance->delete();
        return response()->json(['message' => 'Insurance deleted']);
    }
}
