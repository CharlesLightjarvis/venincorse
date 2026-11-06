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
            $table->unsignedTinyInteger('reschedule_count')->default(0)->after('cancellation_reason');
            $table->string('cancelled_by', 20)->nullable()->after('cancellation_reason');
            $table->timestamp('rebook_offered_at')->nullable()->after('reschedule_count');
            $table->text('session_summary')->nullable()->after('notes');
            $table->timestamp('outcome_reminder_sent_at')->nullable()->after('reminder_sent_at');
            $table->timestamp('terms_accepted_at')->nullable()->after('timezone');
            $table->string('terms_version', 20)->nullable()->after('terms_accepted_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('trial_reservations', function (Blueprint $table) {
            $table->dropColumn([
                'reschedule_count', 'cancelled_by', 'rebook_offered_at', 'session_summary',
                'outcome_reminder_sent_at', 'terms_accepted_at', 'terms_version',
            ]);
        });
    }
};
