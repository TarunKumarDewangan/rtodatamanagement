<?php

namespace App\Http\Controllers;

use App\Models\Tax;
use App\Models\Vehicle;
use Illuminate\Http\Request;

class TaxController extends Controller
{
    public function store(Request $request, Vehicle $vehicle)
    {
        $validated = $request->validate([
            'tax_mode' => 'required|string',
            'from_date' => 'nullable|date',
            'upto_date' => 'required|date',
            'amount' => 'nullable|numeric',
            'vehicle_type_opt' => 'nullable|string',
        ]);

        $tax = $vehicle->taxes()->create($validated);
        return response()->json($tax, 201);
    }

    public function update(Request $request, Tax $tax)
    {
        $validated = $request->validate([
            'tax_mode' => 'required|string',
            'from_date' => 'nullable|date',
            'upto_date' => 'required|date',
            'amount' => 'nullable|numeric',
            'vehicle_type_opt' => 'nullable|string',
        ]);

        $tax->update($validated);
        return response()->json($tax);
    }

    public function destroy(Tax $tax)
    {
        $tax->delete();
        return response()->json(['message' => 'Tax deleted']);
    }
}
