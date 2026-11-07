<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Enums\CourseInstallmentStatus;
use App\Models\CourseEnrollment;
use App\Models\CourseInstallment;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<CourseInstallment>
 */
final class CourseInstallmentFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'course_enrollment_id' => CourseEnrollment::factory(),
            'position' => 2,
            'amount_cents' => 24000,
            'status' => CourseInstallmentStatus::Scheduled,
            'due_at' => now()->subHour(),
        ];
    }
}
