<?php

namespace App\Http\Controllers;

use App\Models\Pucc;
use App\Models\Vehicle;
use Illuminate\Http\Request;

class PuccController extends Controller
{
    public function store(Request $request, Vehicle $vehicle)
    {
        $validated = $request->validate([
            'pucc_number' => 'nullable|string',
            'valid_from' => 'nullable|date',
            'valid_until' => 'required|date',
            'status' => 'nullable|string',
        ]);

        $pucc = $vehicle->puccs()->create($validated);
        return response()->json($pucc, 201);
    }

    public function update(Request $request, Pucc $pucc)
    {
        $validated = $request->validate([
            'pucc_number' => 'nullable|string',
            'valid_from' => 'nullable|date',
            'valid_until' => 'required|date',
            'status' => 'nullable|string',
        ]);

        $pucc->update($validated);
        return response()->json($pucc);
    }

    public function destroy(Pucc $pucc)
    {
        $pucc->delete();
        return response()->json(['message' => 'PUCC deleted']);
    }
}
