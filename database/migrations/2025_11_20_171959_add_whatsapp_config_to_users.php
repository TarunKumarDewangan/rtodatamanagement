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
        Schema::table('users', function (Blueprint $table) {
            $table->string('whatsapp_key')->nullable()->after('status');
            $table->string('whatsapp_host')->nullable()->after('whatsapp_key');
            // If Conic/Other API needs a sender ID, add it here too.
        });
    }

    public function down()
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['whatsapp_key', 'whatsapp_host']);
        });
    }
};
