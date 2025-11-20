<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        // 1. Create Transactions Table (For Installments)
        Schema::create('transactions', function (Blueprint $table) {
            $table->id();
            // This creates 'payable_id' and 'payable_type' to link to ANY document
            $table->morphs('payable');
            $table->decimal('amount_paid', 10, 2);
            $table->date('payment_date');
            $table->string('remarks')->nullable(); // Cash, UPI, etc.
            $table->timestamps();
        });

        // 2. Add 'total_amount' (Billable Price) to all document tables
        $tables = [
            'taxes',
            'insurances',
            'fitnesses',
            'permits',
            'puccs',
            'speed_governors',
            'vltds'
        ];

        foreach ($tables as $tableName) {
            Schema::table($tableName, function (Blueprint $table) {
                // Adding it after 'id' or 'vehicle_id' just to be safe
                $table->decimal('total_amount', 10, 2)->default(0)->after('vehicle_id');
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('transactions');

        $tables = ['taxes', 'insurances', 'fitnesses', 'permits', 'puccs', 'speed_governors', 'vltds'];
        foreach ($tables as $tableName) {
            Schema::table($tableName, function (Blueprint $table) {
                $table->dropColumn('total_amount');
            });
        }
    }
};
