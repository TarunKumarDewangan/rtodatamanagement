<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;

class ReportController extends Controller
{
    public function expiryReport(Request $request)
    {
        $userId = Auth::id();
        $isAdmin = Auth::user()->role === 'admin';

        // Helper to build sub-query
        $build = function ($table, $type, $dateCol) use ($userId, $isAdmin) {
            $query = DB::table($table)
                ->join('vehicles', "$table.vehicle_id", '=', 'vehicles.id')
                ->join('citizens', 'vehicles.citizen_id', '=', 'citizens.id')
                ->select(
                    'citizens.id as citizen_id',
                    'citizens.name as owner_name',
                    'citizens.mobile_number',
                    'citizens.user_id', // Select user_id to filter later if needed
                    'vehicles.registration_no as vehicle_no',
                    DB::raw("'$type' as doc_type"),
                    "$table.$dateCol as expiry_date"
                );

            // SECURITY: Filter by User ID immediately inside the subquery
            if (!$isAdmin) {
                $query->where('citizens.user_id', $userId);
            }

            return $query;
        };

        // Combine all documents
        $query = $build('taxes', 'Tax', 'upto_date')
            ->union($build('insurances', 'Insurance', 'end_date'))
            ->union($build('puccs', 'PUCC', 'valid_until'))
            ->union($build('fitnesses', 'Fitness', 'expiry_date'))
            ->union($build('permits', 'Permit', 'expiry_date'))
            ->union($build('speed_governors', 'Speed Gov', 'expiry_date'))
            ->union($build('vltds', 'VLTd', 'expiry_date'));

        // Wrap and Filter
        $finalQuery = DB::query()->fromSub($query, 'report');

        // Basic Filters
        if ($request->filled('owner_name')) {
            $finalQuery->where('owner_name', 'like', '%' . $request->owner_name . '%');
        }
        if ($request->filled('vehicle_no')) {
            $finalQuery->where('vehicle_no', 'like', '%' . $request->vehicle_no . '%');
        }
        if ($request->filled('doc_type')) {
            $finalQuery->where('doc_type', $request->doc_type);
        }
        if ($request->filled('expiry_from') && $request->filled('expiry_upto')) {
            $finalQuery->whereBetween('expiry_date', [$request->expiry_from, $request->expiry_upto]);
        }

        return response()->json($finalQuery->orderBy('expiry_date', 'asc')->paginate(20));
    }
}
