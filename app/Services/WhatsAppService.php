<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use App\Models\User;

class WhatsAppService
{
    /**
     * Send using System Default Credentials (.env)
     * Useful for Tinker testing or Admin alerts.
     */
    public function sendTextMessage(string $phoneNumber, string $message): bool
    {
        // Use default config values
        $apiKey = config('services.conic.key');
        $host = config('services.conic.host');

        return $this->executeSend($apiKey, $host, $phoneNumber, $message, 'System');
    }

    /**
     * Send using a specific User's credentials.
     * Falls back to System Default if user has no keys.
     */
    public function sendToUserCustomer(User $user, string $phoneNumber, string $message): bool
    {
        $apiKey = $user->whatsapp_key ?? config('services.conic.key');
        $host = $user->whatsapp_host ?? config('services.conic.host');

        return $this->executeSend($apiKey, $host, $phoneNumber, $message, "User {$user->id}");
    }

    /**
     * Internal Helper to actually send the request
     */
    private function executeSend($apiKey, $host, $phoneNumber, $message, $senderLabel): bool
    {
        if (empty($apiKey) || empty($host)) {
            Log::warning("[WhatsApp] Skipped ({$senderLabel}): Missing API Key/Host.");
            return false;
        }

        $endpoint = "https://{$host}/wapp/api/send/json";

        try {
            $response = Http::timeout(10)->withHeaders([
                'X-API-KEY' => $apiKey,
                'Content-Type' => 'application/json',
            ])->post($endpoint, [
                        'mobile' => $phoneNumber,
                        'msg' => $message,
                    ]);

            $data = $response->json();

            if ($response->successful()) {
                if (isset($data['status']) && strtoupper($data['status']) === 'ERROR') {
                    Log::error("[WhatsApp] API Error ({$senderLabel}): " . json_encode($data));
                    return false;
                }

                Log::info("[WhatsApp] Sent successfully ({$senderLabel}) to {$phoneNumber}");
                return true;
            }

            Log::error("[WhatsApp] HTTP Error {$response->status()} ({$senderLabel})");
            return false;

        } catch (\Exception $e) {
            Log::error("[WhatsApp] Exception: " . $e->getMessage());
            return false;
        }
    }
}
