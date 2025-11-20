<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up()
    {
        $tables = ['taxes', 'insurances', 'fitnesses', 'permits', 'puccs', 'speed_governors', 'vltds'];
        foreach ($tables as $table) {
            Schema::table($table, function (Blueprint $t) {
                $t->decimal('total_amount', 10, 2)->nullable()->change();
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        //
    }
};
