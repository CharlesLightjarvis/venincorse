<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\CourseFormat;
use App\Enums\CourseLevel;
use App\Enums\CourseRhythm;
use Database\Factories\CourseCohortFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * A group (or a one-on-one learner) following one full level on a fixed schedule, created by the teacher.
 */
#[Fillable(['level', 'format', 'rhythm', 'starts_at', 'ends_at', 'capacity', 'price_cents', 'currency', 'meeting_url', 'is_published'])]
final class CourseCohort extends Model
{
    /** @use HasFactory<CourseCohortFactory> */
    use HasFactory;

    protected function casts(): array
    {
        return [
            'level' => CourseLevel::class,
            'format' => CourseFormat::class,
            'rhythm' => CourseRhythm::class,
            'starts_at' => 'immutable_datetime',
            'ends_at' => 'immutable_datetime',
            'capacity' => 'integer',
            'price_cents' => 'integer',
            'is_published' => 'boolean',
        ];
    }

    public function hasStarted(): bool
    {
        return $this->starts_at->isPast();
    }

    public function seatsLeft(): int
    {
        $taken = $this->taken_seats ?? $this->enrollments()->holdingSeat()->count();

        return max(0, $this->capacity - (int) $taken);
    }

    /** Students can join a published group that has not started and still has a free seat. */
    public function isBookable(): bool
    {
        return $this->is_published && ! $this->hasStarted() && $this->seatsLeft() > 0;
    }

    public function enrollments(): HasMany
    {
        return $this->hasMany(CourseEnrollment::class);
    }

    public function sessions(): HasMany
    {
        return $this->hasMany(CourseSession::class)->orderBy('position');
    }
}
