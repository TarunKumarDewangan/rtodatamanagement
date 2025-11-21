<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;
use App\Services\WhatsAppService;

// Import YOUR New Models
use App\Models\Tax;
use App\Models\Insurance;
use App\Models\Fitness;
use App\Models\Permit;
use App\Models\Pucc;
use App\Models\SpeedGovernor;
use App\Models\Vltd;

class SendExpiryNotifications extends Command
{
    protected $signature = 'notifications:send-expiries';
    protected $description = 'Scan for all expiring documents and send WhatsApp notifications.';

    public function handle(WhatsAppService $whatsAppService): void
    {
        $this->info('Starting to check for expiring documents...');
        Log::info('Running SendExpiryNotifications command.');

        // Define how many days before expiry to notify (e.g., 10 days)
        $daysBefore = 10;
        $targetDate = Carbon::today()->addDays($daysBefore)->toDateString();

        $this->info("Checking for documents expiring on: {$targetDate}");

        // We skipped LL/DL as they aren't in your new system yet.
        // $this->checkLearnerLicenses($whatsAppService, $targetDate);
        // $this->checkDrivingLicenses($whatsAppService, $targetDate);

        $this->checkInsurances($whatsAppService, $targetDate);
        $this->checkPuccs($whatsAppService, $targetDate);
        $this->checkFitnesses($whatsAppService, $targetDate);
        $this->checkTaxes($whatsAppService, $targetDate);
        $this->checkPermits($whatsAppService, $targetDate);
        $this->checkVltds($whatsAppService, $targetDate);
        $this->checkSpeedGovernors($whatsAppService, $targetDate);

        $this->info('Finished checking for expiring documents.');
        Log::info('Finished SendExpiryNotifications command.');
    }

    // --- 1. Tax ---
    private function checkTaxes(WhatsAppService $service, $date)
    {
        // Note: Your new DB uses 'upto_date', not 'tax_upto'
        $records = Tax::whereDate('upto_date', $date)->with('vehicle.citizen')->get();

        foreach ($records as $rec) {
            $this->sendVehicleNotification($service, $rec, 'Road Tax', $rec->upto_date);
        }
    }

    // --- 2. Insurance ---
    private function checkInsurances(WhatsAppService $service, $date)
    {
        $records = Insurance::whereDate('end_date', $date)->with('vehicle.citizen')->get();

        foreach ($records as $rec) {
            $this->sendVehicleNotification($service, $rec, 'Insurance', $rec->end_date);
        }
    }

    // --- 3. Fitness ---
    private function checkFitnesses(WhatsAppService $service, $date)
    {
        $records = Fitness::whereDate('expiry_date', $date)->with('vehicle.citizen')->get();

        foreach ($records as $rec) {
            $this->sendVehicleNotification($service, $rec, 'Fitness', $rec->expiry_date);
        }
    }

    // --- 4. Permit ---
    private function checkPermits(WhatsAppService $service, $date)
    {
        $records = Permit::whereDate('expiry_date', $date)->with('vehicle.citizen')->get();

        foreach ($records as $rec) {
            $this->sendVehicleNotification($service, $rec, 'Permit', $rec->expiry_date);
        }
    }

    // --- 5. PUCC ---
    private function checkPuccs(WhatsAppService $service, $date)
    {
        // Note: Your new DB uses 'valid_until'
        $records = Pucc::whereDate('valid_until', $date)->with('vehicle.citizen')->get();

        foreach ($records as $rec) {
            $this->sendVehicleNotification($service, $rec, 'PUCC', $rec->valid_until);
        }
    }

    // --- 6. Speed Governor ---
    private function checkSpeedGovernors(WhatsAppService $service, $date)
    {
        $records = SpeedGovernor::whereDate('expiry_date', $date)->with('vehicle.citizen')->get();

        foreach ($records as $rec) {
            $this->sendVehicleNotification($service, $rec, 'Speed Governor', $rec->expiry_date);
        }
    }

    // --- 7. VLTd ---
    private function checkVltds(WhatsAppService $service, $date)
    {
        $records = Vltd::whereDate('expiry_date', $date)->with('vehicle.citizen')->get();

        foreach ($records as $rec) {
            $this->sendVehicleNotification($service, $rec, 'VLTd', $rec->expiry_date);
        }
    }

    /**
     * Helper function to avoid repeating code for every document type
     */
    private function sendVehicleNotification($service, $record, $docName, $expiryDateObj)
    {
        $vehicle = $record->vehicle;

        // In new system, we check if vehicle exists and citizen exists
        if ($vehicle && $vehicle->citizen && $vehicle->citizen->mobile_number) {

            // Format date to Indian format (DD-MM-YYYY)
            $formattedDate = $expiryDateObj->format('d-m-Y');
            $regNo = $vehicle->registration_no;
            $mobile = $vehicle->citizen->mobile_number;

            $message = "प्रिय ग्राहक\nआपके वाहन {$regNo} के {$docName} की वैधता\n{$formattedDate} को समाप्त हो रही है।\n\nसमय पर नवीनीकरण कराएं और\nचालान/क्लेम रिजेक्शन से बचें\n\nHARSHIT RTO & INSURANCE SERVICES\n7000175067 | 7999664014";

            // Ensure country code 91 is added
            $finalMobile = '91' . $mobile;

            $service->sendTextMessage($finalMobile, $message);
            $this->info("Sent {$docName} alert to {$finalMobile} for {$regNo}");
        }
    }
}
