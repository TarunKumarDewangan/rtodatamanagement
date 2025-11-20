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
            // ... other fields ...
            'tax_mode' => 'required|string',
            'from_date' => 'nullable|date',
            'upto_date' => 'required|date',
            'amount' => 'nullable|numeric',
            'vehicle_type_opt' => 'nullable|string',

            'total_amount' => 'nullable|numeric', // Validation allows it
        ]);

        // FORCE 0 if null
        $validated['total_amount'] = $request->input('total_amount', 0);

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
            'total_amount' => 'nullable|numeric',
            'vehicle_type_opt' => 'nullable|string',
        ]);

        $tax->update($validated);
        return response()->json($tax);
    }

    public function destroy(Tax $tax)
    {
        $tax->delete();
        return response()->json(['message' => 'Tax record deleted']);
    }
}
