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
        Schema::create('course_enrollments', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignId('user_id')->constrained()->restrictOnDelete();
            $table->foreignId('course_cohort_id')->constrained()->restrictOnDelete();
            $table->string('status', 30)->default('pending');
            $table->string('payment_plan', 20)->default('full');
            $table->text('goal');
            $table->string('timezone', 80);
            $table->unsignedInteger('amount_cents');
            $table->string('currency', 3);
            $table->timestamp('expires_at');
            $table->timestamp('checkout_started_at')->nullable();
            $table->string('stripe_session_id')->nullable()->unique();
            $table->text('checkout_url')->nullable();
            $table->timestamp('paid_at')->nullable();
            $table->timestamp('terms_accepted_at');
            $table->string('terms_version', 20);
            $table->timestamp('early_start_requested_at')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index(['course_cohort_id', 'status']);
            $table->index(['status', 'expires_at']);
            $table->index(['user_id', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('course_enrollments');
    }
};
