<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        // Citizens Table
        Schema::create('citizens', function (Blueprint $table) {
            $table->id();

            // --- Links Citizen to the User who created them ---
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            // --------------------------------------------------

            $table->string('name');
            $table->string('mobile_number');
            $table->string('email')->nullable();
            $table->date('birth_date')->nullable();
            $table->string('relation_type')->nullable();
            $table->string('relation_name')->nullable();
            $table->text('address')->nullable();
            $table->string('state')->nullable();
            $table->string('city_district')->nullable();
            $table->timestamps();
        });

        // Vehicles Table
        Schema::create('vehicles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('citizen_id')->constrained('citizens')->cascadeOnDelete();

            // --- CHANGE IS HERE ---
            // Removed ->unique() from here
            $table->string('registration_no');
            // ----------------------

            $table->string('type')->nullable();
            $table->string('make_model')->nullable();
            $table->string('chassis_no')->nullable();
            $table->string('engine_no')->nullable();
            $table->timestamps();

            // --- NEW RULE ---
            // Combine Citizen ID + Registration No to be unique.
            // This means one person cannot own the same car twice,
            // BUT two different people (managed by different users) CAN own the same car number.
            $table->unique(['citizen_id', 'registration_no']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('vehicles');
        Schema::dropIfExists('citizens');
    }
};
