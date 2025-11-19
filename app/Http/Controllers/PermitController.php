<?php

namespace App\Http\Controllers;

use App\Models\Permit;
use App\Models\Vehicle;
use Illuminate\Http\Request;

class PermitController extends Controller
{
    public function store(Request $request, Vehicle $vehicle)
    {
        $validated = $request->validate([
            'permit_no' => 'nullable|string',
            'issue_date' => 'nullable|date',
            'expiry_date' => 'required|date',
        ]);

        $permit = $vehicle->permits()->create($validated);
        return response()->json($permit, 201);
    }

    public function update(Request $request, Permit $permit)
    {
        $validated = $request->validate([
            'permit_no' => 'nullable|string',
            'issue_date' => 'nullable|date',
            'expiry_date' => 'required|date',
        ]);

        $permit->update($validated);
        return response()->json($permit);
    }

    public function destroy(Permit $permit)
    {
        $permit->delete();
        return response()->json(['message' => 'Permit deleted']);
    }
}
