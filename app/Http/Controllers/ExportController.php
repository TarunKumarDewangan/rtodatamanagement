<?php

namespace App\Http\Controllers;

use App\Models\Citizen;
use App\Models\Tax;
use App\Models\Insurance;
use App\Models\Fitness;
use App\Models\Permit;
use App\Models\Pucc;
use App\Models\SpeedGovernor;
use App\Models\Vltd;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use ZipArchive;

class ExportController extends Controller
{
    public function downloadBackup(Request $request)
    {
        $userId = Auth::id();
        $zipFileName = 'rto_backup_' . date('Y-m-d_His') . '.zip';
        $zipPath = storage_path('app/public/' . $zipFileName);

        // What to include? (e.g., ?include=tax,citizen,master)
        $includes = $request->query('include') ? explode(',', $request->query('include')) : ['all'];
        $isAll = in_array('all', $includes);

        // Create ZIP
        $zip = new ZipArchive;
        if ($zip->open($zipPath, ZipArchive::CREATE) !== TRUE) {
            return response()->json(['message' => 'Could not create ZIP'], 500);
        }

        // --- HELPER: Create CSV String from Data ---
        $addCsvToZip = function ($filename, $headers, $dataCallback) use ($zip) {
            $fp = fopen('php://temp', 'r+');
            fputcsv($fp, $headers);

            // Execute the query/callback to get rows
            $rows = $dataCallback();
            foreach ($rows as $row) {
                fputcsv($fp, $row);
            }

            rewind($fp);
            $content = stream_get_contents($fp);
            fclose($fp);
            $zip->addFromString($filename, $content);
        };

        // --- 1. CITIZENS TABLE ---
        if ($isAll || in_array('citizen', $includes)) {
            $addCsvToZip('citizens.csv', ['ID', 'Name', 'Mobile', 'Email', 'Relation', 'Address', 'City', 'State'], function () use ($userId) {
                $data = [];
                $records = Citizen::where('user_id', $userId)->get();
                foreach ($records as $r)
                    $data[] = [$r->id, $r->name, $r->mobile_number, $r->email, "$r->relation_type $r->relation_name", $r->address, $r->city_district, $r->state];
                return $data;
            });
        }

        // --- 2. VEHICLES TABLE ---
        if ($isAll || in_array('vehicle', $includes)) {
            $addCsvToZip('vehicles.csv', ['ID', 'Citizen Name', 'Reg No', 'Type', 'Make/Model', 'Chassis', 'Engine'], function () use ($userId) {
                $data = [];
                $records = \App\Models\Vehicle::whereHas('citizen', fn($q) => $q->where('user_id', $userId))->with('citizen')->get();
                foreach ($records as $r)
                    $data[] = [$r->id, $r->citizen->name, $r->registration_no, $r->type, $r->make_model, $r->chassis_no, $r->engine_no];
                return $data;
            });
        }

        // --- 3. DOCUMENT TABLES (Loop for all types) ---
        $docTypes = [
            'tax' => [Tax::class, 'taxes.csv', ['ID', 'Reg No', 'Mode', 'From', 'Upto', 'Bill Amount']],
            'insurance' => [Insurance::class, 'insurance.csv', ['ID', 'Reg No', 'Company', 'Start', 'End', 'Bill Amount']],
            'fitness' => [Fitness::class, 'fitness.csv', ['ID', 'Reg No', 'Cert No', 'Issue', 'Expiry', 'Bill Amount']],
            'permit' => [Permit::class, 'permit.csv', ['ID', 'Reg No', 'Permit No', 'Issue', 'Expiry', 'Bill Amount']],
            'pucc' => [Pucc::class, 'pucc.csv', ['ID', 'Reg No', 'PUCC No', 'Valid From', 'Valid Until', 'Bill Amount']],
            'speed_gov' => [SpeedGovernor::class, 'speed_gov.csv', ['ID', 'Reg No', 'Vendor', 'Issue', 'Expiry', 'Bill Amount']],
            'vltd' => [Vltd::class, 'vltd.csv', ['ID', 'Reg No', 'Vendor', 'Issue', 'Expiry', 'Bill Amount']],
        ];

        foreach ($docTypes as $key => $conf) {
            if ($isAll || in_array($key, $includes)) {
                $addCsvToZip($conf[1], $conf[2], function () use ($userId, $conf) {
                    $model = $conf[0];
                    $records = $model::whereHas('vehicle.citizen', fn($q) => $q->where('user_id', $userId))->with('vehicle')->get();
                    $data = [];
                    foreach ($records as $r) {
                        // Generic mapping based on columns available
                        $col1 = $r->tax_mode ?? $r->company ?? $r->certificate_no ?? $r->permit_no ?? $r->pucc_number ?? $r->vendor_name ?? '-';
                        $date1 = $r->from_date ?? $r->start_date ?? $r->issue_date ?? $r->valid_from ?? '-';
                        $date2 = $r->upto_date ?? $r->end_date ?? $r->expiry_date ?? $r->valid_until ?? '-';

                        $data[] = [$r->id, $r->vehicle->registration_no, $col1, $date1, $date2, $r->total_amount];
                    }
                    return $data;
                });
            }
        }

        // --- 4. MASTER COMBINED TABLE (The Big One) ---
        if ($isAll || in_array('master', $includes)) {
            $addCsvToZip('master_combined.csv', ['Citizen Name', 'Mobile', 'City', 'Vehicle No', 'Doc Type', 'Start', 'Expiry', 'Bill'], function () use ($userId) {
                $data = [];
                $citizens = Citizen::where('user_id', $userId)->with('vehicles.taxes', 'vehicles.insurances', 'vehicles.fitnesses', 'vehicles.permits', 'vehicles.puccs')->get();

                foreach ($citizens as $c) {
                    foreach ($c->vehicles as $v) {
                        $add = fn($type, $s, $e, $amt) => $data[] = [$c->name, $c->mobile_number, $c->city_district, $v->registration_no, $type, $s, $e, $amt];

                        foreach ($v->taxes as $d)
                            $add('Tax', $d->from_date, $d->upto_date, $d->total_amount);
                        foreach ($v->insurances as $d)
                            $add('Insurance', $d->start_date, $d->end_date, $d->total_amount);
                        foreach ($v->fitnesses as $d)
                            $add('Fitness', $d->issue_date, $d->expiry_date, $d->total_amount);
                        foreach ($v->permits as $d)
                            $add('Permit', $d->issue_date, $d->expiry_date, $d->total_amount);
                        foreach ($v->puccs as $d)
                            $add('PUCC', $d->valid_from, $d->valid_until, $d->total_amount);
                        // ... add others if needed
                    }
                }
                return $data;
            });
        }

        $zip->close();

        return response()->download($zipPath)->deleteFileAfterSend(true);
    }
}
