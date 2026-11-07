<?php

declare(strict_types=1);

namespace App\Actions;

use App\Models\CourseCohort;

/** The teacher updates a group's visio link, its number of seats or whether it is open for booking. */
final readonly class UpdateCourseCohort
{
    /** @param array{meeting_url?: ?string, capacity?: int, is_published?: bool} $attributes */
    public function handle(CourseCohort $cohort, array $attributes): CourseCohort
    {
        $cohort->update($attributes);

        return $cohort;
    }
}
