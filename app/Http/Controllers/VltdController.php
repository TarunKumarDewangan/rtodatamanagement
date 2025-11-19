<?php

namespace App\Http\Controllers;

use App\Models\Vltd;
use App\Models\Vehicle;
use Illuminate\Http\Request;

class VltdController extends Controller
{
    public function store(Request $request, Vehicle $vehicle)
    {
        $validated = $request->validate([
            'vendor_name' => 'nullable|string',
            'issue_date' => 'nullable|date',
            'expiry_date' => 'required|date',
        ]);

        $vltd = $vehicle->vltds()->create($validated);
        return response()->json($vltd, 201);
    }

    public function update(Request $request, Vltd $vltd)
    {
        $validated = $request->validate([
            'vendor_name' => 'nullable|string',
            'issue_date' => 'nullable|date',
            'expiry_date' => 'required|date',
        ]);

        $vltd->update($validated);
        return response()->json($vltd);
    }

    public function destroy(Vltd $vltd)
    {
        $vltd->delete();
        return response()->json(['message' => 'VLTd deleted']);
    }
}
