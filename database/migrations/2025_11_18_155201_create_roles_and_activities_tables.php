<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        // NOTE: 'role' and 'status' columns are now in the create_users_table migration.

        // Activities (Permissions)
        Schema::create('activities', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique();
            $table->string('description')->nullable();
            $table->timestamps();
        });

        // Pivot Table: User <-> Activity
        Schema::create('user_activity', function (Blueprint $table) {
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('activity_id')->constrained()->onDelete('cascade');
            $table->primary(['user_id', 'activity_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('user_activity');
        Schema::dropIfExists('activities');
    }
};
