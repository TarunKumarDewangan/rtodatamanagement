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
            ->select('id', 'name', 'email', 'status')
            ->orderBy('name')
            ->get();
        return response()->json($users);
    }

    public function getSingleUser(User $user)
    {
        // Return user with their assigned activities
        return response()->json($user->load('activities'));
    }

    public function createUser(Request $request)
    {
        $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => 'userlevel1',
            'status' => 'active'
        ]);

        return response()->json($user, 201);
    }

    public function updateUser(Request $request, User $user)
    {
        $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', Rule::unique('users')->ignore($user->id)],
            'password' => ['nullable', 'string', 'min:8', 'confirmed'],
        ]);

        $user->name = $request->name;
        $user->email = $request->email;
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
