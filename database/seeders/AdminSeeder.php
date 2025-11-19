<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Activity;
use Illuminate\Support\Facades\Hash;

class AdminSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Create the Main Admin
        // We use firstOrCreate to prevent duplicates if you run seeder twice
        User::firstOrCreate(
            ['email' => 'admin@example.com'],
            [
                'name' => 'System Admin',
                'password' => Hash::make('password'), // Default password
                'role' => 'admin',
                'status' => 'active',
            ]
        );

        // 2. Define System Activities (Permissions)
        // These match the logic we will use in the React frontend
        $activities = [
            [
                'name' => 'create_citizen',
                'description' => 'Allows user to add Citizens and Vehicles'
            ],
            [
                'name' => 'view_reports',
                'description' => 'Allows access to Document Expiry Reports'
            ],
            // Add more here if you expand features later
        ];

        foreach ($activities as $activity) {
            Activity::firstOrCreate(
                ['name' => $activity['name']],
                ['description' => $activity['description']]
            );
        }
    }
}
