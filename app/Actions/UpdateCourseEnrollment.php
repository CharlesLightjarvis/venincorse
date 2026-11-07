<?php

declare(strict_types=1);

namespace App\Actions;

use App\Models\CourseEnrollment;

/** The teacher keeps private notes about a student of the group. */
final readonly class UpdateCourseEnrollment
{
    /** @param array{notes: ?string} $attributes */
    public function handle(CourseEnrollment $enrollment, array $attributes): CourseEnrollment
    {
        $enrollment->update($attributes);

        return $enrollment;
    }
}
