<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
use App\Models\Citizen;
use App\Models\Transaction;

class DashboardController extends Controller
{
    public function getStats()
    {
        $userId = Auth::id();
        $today = Carbon::today();
        $upcomingDate = Carbon::today()->addDays(15);

        // 1. Basic Counts
        $totalCitizens = Citizen::where('user_id', $userId)->count();
        $totalVehicles = DB::table('vehicles')
            ->join('citizens', 'vehicles.citizen_id', '=', 'citizens.id')
            ->where('citizens.user_id', $userId)
            ->count();

        // 2. Revenue (Today) - Using Transactions
        // We need to join all the way back to citizens to ensure data isolation
        // But since transactions are polymorphic, it's tricky to do in one query efficiently.
        // A simpler way for "Today" is to fetch transactions where payable belongs to a user's vehicle.
        // OPTIMIZED: We can assume if you created the transaction, it's yours (if we added user_id to tx),
        // but we didn't. So we query based on the relation.

        // For simplicity and performance in this phase, we will fetch transactions filtered by date
        // and then filter by ownership in PHP (or enhance schema later).
        // ACTUALLY: Let's do a rigorous check:

        $todayRevenue = Transaction::whereDate('payment_date', $today)
            ->whereHasMorph('payable', '*', function ($q) use ($userId) {
                // This verifies the document belongs to a vehicle owned by the user's citizen
                $q->whereHas('vehicle.citizen', function ($c) use ($userId) {
                    $c->where('user_id', $userId);
                });
            })->sum('amount_paid');

        // 3. Expiring Soon (Next 15 Days)
        // We need to sum up counts from all 7 tables
        $expiringCount = 0;

        $checkExpiry = function ($table, $col) use ($userId, $today, $upcomingDate) {
            return DB::table($table)
                ->join('vehicles', "$table.vehicle_id", '=', 'vehicles.id')
                ->join('citizens', 'vehicles.citizen_id', '=', 'citizens.id')
                ->where('citizens.user_id', $userId)
                ->whereBetween("$table.$col", [$today, $upcomingDate])
                ->count();
        };

        $expiringCount += $checkExpiry('taxes', 'upto_date');
        $expiringCount += $checkExpiry('insurances', 'end_date');
        $expiringCount += $checkExpiry('fitnesses', 'expiry_date');
        $expiringCount += $checkExpiry('permits', 'expiry_date');
        $expiringCount += $checkExpiry('puccs', 'valid_until');
        $expiringCount += $checkExpiry('speed_governors', 'expiry_date');
        $expiringCount += $checkExpiry('vltds', 'expiry_date');

        return response()->json([
            'citizens' => $totalCitizens,
            'vehicles' => $totalVehicles,
            'revenue_today' => $todayRevenue,
            'expiring_soon' => $expiringCount
        ]);
    }
}
