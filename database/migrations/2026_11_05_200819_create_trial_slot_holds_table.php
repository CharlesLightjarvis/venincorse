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
        Schema::create('trial_slot_holds', function (Blueprint $table) {
            $table->foreignId('trial_slot_id')->primary()->constrained()->cascadeOnDelete();
            $table->foreignUuid('trial_reservation_id')->unique()->constrained()->cascadeOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('trial_slot_holds');
    }
};
