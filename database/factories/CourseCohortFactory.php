<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Enums\CourseFormat;
use App\Enums\CourseLevel;
use App\Enums\CourseRhythm;
use App\Models\CourseCohort;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<CourseCohort>
 */
final class CourseCohortFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $startsAt = now()->addWeeks(2)->setTime(9, 0);

        return [
            'level' => CourseLevel::A1,
            'format' => CourseFormat::Group,
            'rhythm' => CourseRhythm::Intensive,
            'starts_at' => $startsAt,
            'ends_at' => $startsAt->addWeeks(4),
            'capacity' => 6,
            'price_cents' => CourseLevel::A1->priceCents(CourseFormat::Group),
            'currency' => 'EUR',
            'meeting_url' => null,
            'is_published' => true,
        ];
    }

    public function solo(): static
    {
        return $this->state(fn (): array => [
            'format' => CourseFormat::Solo,
            'capacity' => 1,
            'price_cents' => CourseLevel::A1->priceCents(CourseFormat::Solo),
        ]);
    }
}
