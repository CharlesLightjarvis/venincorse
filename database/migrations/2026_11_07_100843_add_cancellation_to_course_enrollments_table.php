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
        Schema::table('course_enrollments', function (Blueprint $table) {
            $table->unsignedInteger('refunded_cents')->default(0)->after('paid_at');
            $table->timestamp('cancelled_at')->nullable()->after('refunded_cents');
            $table->string('cancellation_reason', 500)->nullable()->after('cancelled_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('course_enrollments', function (Blueprint $table) {
            $table->dropColumn(['refunded_cents', 'cancelled_at', 'cancellation_reason']);
        });
    }
};
