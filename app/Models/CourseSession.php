<?php

declare(strict_types=1);

namespace App\Models;

use Carbon\CarbonImmutable;
use Database\Factories\CourseSessionFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['course_cohort_id', 'position', 'starts_at', 'duration_minutes', 'meeting_url', 'cancelled_at', 'cancellation_reason'])]
final class CourseSession extends Model
{
    /** @use HasFactory<CourseSessionFactory> */
    use HasFactory;

    protected function casts(): array
    {
        return [
            'starts_at' => 'immutable_datetime',
            'position' => 'integer',
            'duration_minutes' => 'integer',
            'cancelled_at' => 'immutable_datetime',
        ];
    }

    public function endsAt(): CarbonImmutable
    {
        return $this->starts_at->addMinutes($this->duration_minutes);
    }

    public function isCancelled(): bool
    {
        return $this->cancelled_at !== null;
    }

    public function isPast(): bool
    {
        return $this->endsAt()->isPast();
    }

    public function cohort(): BelongsTo
    {
        return $this->belongsTo(CourseCohort::class, 'course_cohort_id');
    }

    public function attendances(): HasMany
    {
        return $this->hasMany(CourseSessionAttendance::class);
    }
}
