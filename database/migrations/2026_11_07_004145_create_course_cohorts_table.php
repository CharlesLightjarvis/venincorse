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
        Schema::create('course_cohorts', function (Blueprint $table) {
            $table->id();
            $table->string('level', 5);
            $table->string('format', 10);
            $table->string('rhythm', 20);
            $table->timestamp('starts_at');
            $table->timestamp('ends_at');
            $table->unsignedTinyInteger('capacity');
            $table->unsignedInteger('price_cents');
            $table->string('currency', 3);
            $table->string('meeting_url', 2048)->nullable();
            $table->boolean('is_published')->default(true);
            $table->timestamps();

            $table->index(['is_published', 'level', 'starts_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('course_cohorts');
    }
};
