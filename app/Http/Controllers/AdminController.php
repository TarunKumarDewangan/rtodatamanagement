<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Activity;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class AdminController extends Controller
{
    // --- User Management ---

    public function getUserLevel1Users()
    {
        $users = User::where('role', 'userlevel1')
            // Select the whatsapp fields too
            ->select('id', 'name', 'email', 'status', 'whatsapp_key', 'whatsapp_host')
            ->orderBy('name')
            ->get();
        return response()->json($users);
    }

    public function getSingleUser(User $user)
    {
        return response()->json($user->load('activities'));
    }

    public function createUser(Request $request)
    {
        $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
            'whatsapp_key' => ['nullable', 'string'],
            'whatsapp_host' => ['nullable', 'string'],
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => 'userlevel1',
            'status' => 'active',
            'whatsapp_key' => $request->whatsapp_key,
            'whatsapp_host' => $request->whatsapp_host,
        ]);

        return response()->json($user, 201);
    }

    public function updateUser(Request $request, User $user)
    {
        $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', Rule::unique('users')->ignore($user->id)],
            'password' => ['nullable', 'string', 'min:8', 'confirmed'],
            'whatsapp_key' => ['nullable', 'string'],
            'whatsapp_host' => ['nullable', 'string'],
        ]);

        $user->name = $request->name;
        $user->email = $request->email;

        // Update keys
        $user->whatsapp_key = $request->whatsapp_key;
        $user->whatsapp_host = $request->whatsapp_host;

        if ($request->filled('password')) {
            $user->password = Hash::make($request->password);
        }
        $user->save();

        return response()->json($user);
    }

    public function deleteUser(User $user)
    {
        if ($user->role === 'admin') {
            return response()->json(['message' => 'Cannot delete admin.'], 403);
        }
        $user->delete();
        return response()->json(['message' => 'User deleted.']);
    }

    public function toggleStatus(User $user)
    {
        $user->status = ($user->status === 'active') ? 'deactivated' : 'active';
        $user->save();
        return response()->json($user);
    }

    // --- Activity Assignment ---

    public function getActivities()
    {
        return response()->json(Activity::all());
    }

    public function syncUserActivities(Request $request, User $user)
    {
        $request->validate([
            'activity_ids' => ['array'],
            'activity_ids.*' => ['exists:activities,id'],
        ]);

        $user->activities()->sync($request->input('activity_ids', []));

        return response()->json($user->load('activities'));
    }
}
