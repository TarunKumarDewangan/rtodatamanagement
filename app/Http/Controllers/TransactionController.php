<?php

namespace App\Http\Controllers;

use App\Models\Transaction;
use Illuminate\Http\Request;
use Illuminate\Database\Eloquent\Relations\Relation;

class TransactionController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'amount_paid' => 'required|numeric|min:1',
            'payment_date' => 'required|date',
            'remarks' => 'nullable|string|max:255',
            // Polymorphic fields
            'payable_type' => 'required|string', // e.g., 'tax', 'insurance'
            'payable_id' => 'required|integer',
        ]);

        // Map simple names to actual Model classes
        $modelMap = [
            'tax' => \App\Models\Tax::class,
            'insurance' => \App\Models\Insurance::class,
            'fitness' => \App\Models\Fitness::class,
            'permit' => \App\Models\Permit::class,
            'pucc' => \App\Models\Pucc::class,
            'speed_gov' => \App\Models\SpeedGovernor::class,
            'vltd' => \App\Models\Vltd::class,
        ];

        if (!array_key_exists($validated['payable_type'], $modelMap)) {
            return response()->json(['message' => 'Invalid document type'], 400);
        }

        $modelClass = $modelMap[$validated['payable_type']];
        $document = $modelClass::findOrFail($validated['payable_id']);

        // Create the transaction linked to this document
        $transaction = $document->transactions()->create([
            'amount_paid' => $validated['amount_paid'],
            'payment_date' => $validated['payment_date'],
            'remarks' => $validated['remarks'],
        ]);

        return response()->json($transaction, 201);
    }

    public function update(Request $request, Transaction $transaction)
    {
        $validated = $request->validate([
            'amount_paid' => 'required|numeric|min:1',
            'payment_date' => 'required|date',
            'remarks' => 'nullable|string|max:255',
        ]);

        $transaction->update($validated);

        return response()->json($transaction);
    }

    public function destroy(Transaction $transaction)
    {
        $transaction->delete();
        return response()->json(['message' => 'Transaction deleted']);
    }
}
