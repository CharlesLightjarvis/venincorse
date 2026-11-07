<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\CourseCohort;
use App\Models\CourseSession;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<CourseSession>
 */
final class CourseSessionFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'course_cohort_id' => CourseCohort::factory(),
            'position' => 1,
            'starts_at' => now()->addWeeks(2)->setTime(9, 0),
            'duration_minutes' => 180,
        ];
    }
}
