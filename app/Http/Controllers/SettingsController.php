<?php
namespace App\Http\Controllers;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class SettingsController extends Controller
{
    public function getSettings()
    {
        $user = Auth::user();
        return response()->json([
            'whatsapp_key' => $user->whatsapp_key,
            'whatsapp_host' => $user->whatsapp_host
        ]);
    }

    public function updateSettings(Request $request)
    {
        $user = Auth::user();
        $data = $request->validate([
            'whatsapp_key' => 'nullable|string',
            'whatsapp_host' => 'nullable|string',
        ]);

        $user->update($data);
        return response()->json(['message' => 'Settings updated']);
    }
}
