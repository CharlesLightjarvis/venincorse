<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Enums\CourseFormat;
use App\Enums\CourseLevel;
use App\Models\CourseCohort;
use Inertia\Inertia;
use Inertia\Response;

final readonly class CourseCatalogController
{
    /** The public page of a level, with the next group still open for each format. */
    public function show(string $slug): Response
    {
        $level = CourseLevel::tryFrom($slug);
        $upcoming = [];
        if ($level) {
            foreach (CourseFormat::cases() as $format) {
                $cohort = CourseCohort::query()
                    ->withCount(['enrollments as taken_seats' => fn ($query) => $query->holdingSeat()])
                    ->where('level', $level)->where('format', $format)
                    ->where('is_published', true)->whereNull('cancelled_at')->where('starts_at', '>', now())
                    ->orderBy('starts_at')->get()
                    ->first(fn (CourseCohort $cohort): bool => $cohort->seatsLeft() > 0);
                $upcoming[$format->value] = $cohort ? [
                    'starts_at' => $cohort->starts_at->toIso8601String(),
                    'seats_left' => $cohort->seatsLeft(),
                    'capacity' => $cohort->capacity,
                ] : null;
            }
        }

        return Inertia::render('courses/course-detail', ['upcoming' => $upcoming]);
    }
}
