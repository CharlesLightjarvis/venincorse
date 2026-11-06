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
            $table->timestamp('reminder_sent_at')->nullable()->after('meeting_url');
            $table->timestamp('cancelled_at')->nullable()->after('reminder_sent_at');
            $table->string('cancellation_reason', 500)->nullable()->after('cancelled_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('trial_reservations', function (Blueprint $table) {
            $table->dropColumn(['reminder_sent_at', 'cancelled_at', 'cancellation_reason']);
        });
    }
};
