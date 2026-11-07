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
        Schema::create('course_installments', function (Blueprint $table) {
            $table->id();
            $table->foreignUuid('course_enrollment_id')->constrained()->cascadeOnDelete();
            $table->unsignedTinyInteger('position');
            $table->unsignedInteger('amount_cents');
            $table->string('status', 20)->default('scheduled');
            $table->timestamp('due_at');
            $table->timestamp('paid_at')->nullable();
            $table->string('stripe_payment_intent_id')->nullable();
            $table->string('stripe_session_id')->nullable()->unique();
            $table->text('checkout_url')->nullable();
            $table->unsignedTinyInteger('attempts')->default(0);
            $table->timestamp('next_attempt_at')->nullable();
            $table->string('failure_message')->nullable();
            $table->timestamps();

            $table->unique(['course_enrollment_id', 'position']);
            $table->index(['status', 'due_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('course_installments');
    }
};
