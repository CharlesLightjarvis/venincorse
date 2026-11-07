<?php

declare(strict_types=1);

namespace App\Actions;

use App\Models\CourseCohort;

/** A group nobody joined can be deleted with its schedule. */
final readonly class DeleteCourseCohort
{
    public function handle(CourseCohort $cohort): void
    {
        $cohort->delete();
    }
}
