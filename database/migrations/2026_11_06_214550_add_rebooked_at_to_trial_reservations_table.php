<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('trial_reservations', function (Blueprint $table) {
            $table->timestamp('rebooked_at')->nullable()->after('rebook_offered_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('trial_reservations', function (Blueprint $table) {
            $table->dropColumn('rebooked_at');
        });
    }
};
