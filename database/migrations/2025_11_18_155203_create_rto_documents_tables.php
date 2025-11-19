<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        // 1. Tax
        Schema::create('taxes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('vehicle_id')->constrained()->cascadeOnDelete();
            $table->string('tax_mode'); // LTT, QTT, etc
            $table->date('from_date')->nullable();
            $table->date('upto_date'); // The Expiry
            $table->decimal('amount', 10, 2)->nullable(); // Just strictly the tax amount, no ledger
            $table->string('vehicle_type_opt')->nullable();
            $table->timestamps();
        });

        // 2. Insurance
        Schema::create('insurances', function (Blueprint $table) {
            $table->id();
            $table->foreignId('vehicle_id')->constrained()->cascadeOnDelete();
            $table->string('company')->nullable();
            $table->string('type')->nullable();
            $table->date('start_date')->nullable();
            $table->date('end_date'); // Expiry
            $table->string('status')->nullable();
            $table->timestamps();
        });

        // 3. PUCC
        Schema::create('puccs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('vehicle_id')->constrained()->cascadeOnDelete();
            $table->string('pucc_number')->nullable();
            $table->date('valid_from')->nullable();
            $table->date('valid_until'); // Expiry
            $table->string('status')->nullable();
            $table->timestamps();
        });

        // 4. Fitness
        Schema::create('fitnesses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('vehicle_id')->constrained()->cascadeOnDelete();
            $table->string('certificate_no')->nullable();
            $table->date('issue_date')->nullable();
            $table->date('expiry_date'); // Expiry
            $table->timestamps();
        });

        // 5. Permit
        Schema::create('permits', function (Blueprint $table) {
            $table->id();
            $table->foreignId('vehicle_id')->constrained()->cascadeOnDelete();
            $table->string('permit_no')->nullable();
            $table->date('issue_date')->nullable();
            $table->date('expiry_date'); // Expiry
            $table->timestamps();
        });

        // 6. Speed Governor
        Schema::create('speed_governors', function (Blueprint $table) {
            $table->id();
            $table->foreignId('vehicle_id')->constrained()->cascadeOnDelete();
            $table->string('vendor_name')->nullable();
            $table->date('issue_date')->nullable();
            $table->date('expiry_date'); // Expiry
            $table->timestamps();
        });

        // 7. VLTd
        Schema::create('vltds', function (Blueprint $table) {
            $table->id();
            $table->foreignId('vehicle_id')->constrained()->cascadeOnDelete();
            $table->string('vendor_name')->nullable();
            $table->date('issue_date')->nullable();
            $table->date('expiry_date'); // Expiry
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('vltds');
        Schema::dropIfExists('speed_governors');
        Schema::dropIfExists('permits');
        Schema::dropIfExists('fitnesses');
        Schema::dropIfExists('puccs');
        Schema::dropIfExists('insurances');
        Schema::dropIfExists('taxes');
    }
};
