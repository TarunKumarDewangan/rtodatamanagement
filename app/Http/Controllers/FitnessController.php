<?php

namespace App\Http\Controllers;

use App\Models\Fitness;
use App\Models\Vehicle;
use Illuminate\Http\Request;

class FitnessController extends Controller
{
    public function store(Request $request, Vehicle $vehicle)
    {
        $validated = $request->validate([
            'certificate_no' => 'nullable|string',
            'issue_date' => 'nullable|date',
            'expiry_date' => 'required|date',
            'total_amount' => 'nullable|numeric', // <--- ADD THIS
        ]);
        $fitness = $vehicle->fitnesses()->create($validated);
        return response()->json($fitness, 201);
    }

    public function update(Request $request, Fitness $fitness)
    {
        $validated = $request->validate([
            'certificate_no' => 'nullable|string',
            'issue_date' => 'nullable|date',
            'expiry_date' => 'required|date',
            'total_amount' => 'nullable|numeric', // <--- ADD THIS
        ]);
        $fitness->update($validated);
        return response()->json($fitness);
    }

    public function destroy(Fitness $fitness)
    {
        $fitness->delete();
        return response()->json(['message' => 'Fitness deleted']);
    }
}
