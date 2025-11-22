<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        // 1. Validate request
        $credentials = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required'],
        ]);

        // 2. Try login (session-based)
        if (!Auth::attempt($credentials, true)) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials do not match our records.'],
            ]);
        }

        // 3. Regenerate session ID (CRITICAL FIX !!!)
        $request->session()->regenerate();

        $user = Auth::user();

        // 4. Check if deactivated
        if ($user->status !== 'active') {
            Auth::logout();
            return response()->json(['message' => 'Account is deactivated.'], 403);
        }

        // 5. Return logged-in user + permissions
        return response()->json([
            'message' => 'Logged in successfully.',
            'user' => $user->load('activities'),
        ]);
    }

    public function logout(Request $request)
    {
        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return response()->json(['message' => 'Logged out successfully.']);
    }

    public function user(Request $request)
    {
        return response()->json(
            $request->user()->load('activities')
        );
    }
}
