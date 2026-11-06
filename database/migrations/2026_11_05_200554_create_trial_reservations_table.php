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
        Schema::create('trial_reservations', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignId('user_id')->constrained()->restrictOnDelete();
            $table->foreignId('trial_slot_id')->constrained()->restrictOnDelete();
            $table->uuid('submission_key');
            $table->char('submission_hash', 64);
            $table->string('level', 20);
            $table->text('goal');
            $table->string('timezone', 80);
            $table->unsignedInteger('amount_cents');
            $table->char('currency', 3);
            $table->string('status', 30)->default('pending');
            $table->dateTime('expires_at');
            $table->dateTime('checkout_started_at')->nullable();
            $table->string('stripe_session_id')->nullable()->unique();
            $table->text('checkout_url')->nullable();
            $table->dateTime('paid_at')->nullable();
            $table->text('notes')->nullable();
            $table->unique(['user_id', 'submission_key']);
            $table->index(['user_id', 'created_at']);
            $table->index(['status', 'expires_at']);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('trial_reservations');
    }
};
