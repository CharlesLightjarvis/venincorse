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
        Schema::create('course_session_attendances', function (Blueprint $table) {
            $table->id();
            $table->foreignId('course_session_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('course_enrollment_id')->constrained()->cascadeOnDelete();
            $table->string('status', 20);
            $table->timestamps();

            $table->unique(
                ['course_session_id', 'course_enrollment_id'],
                'course_session_attendances_session_enrollment_unique',
            );
            $table->index('course_enrollment_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('course_session_attendances');
    }
};
