<?php

declare(strict_types=1);

namespace App\Actions;

use App\Enums\CourseEnrollmentStatus;
use App\Models\CourseSession;
use App\Models\User;
use App\Notifications\CourseSessionCancelled;
use App\Notifications\CourseSessionMeetingLinkShared;
use App\Notifications\CourseSessionRescheduled;
use Carbon\CarbonImmutable;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Notification;

/**
 * The teacher changes one session: its own visio link, its date and hour, or cancels it. Enrolled students are
 * emailed when a future session moves, is cancelled, or receives its own link. Past sessions keep their history.
 */
final readonly class UpdateCourseSession
{
    /**
     * @param  array{meeting_url?: ?string, starts_at?: CarbonImmutable, is_cancelled?: bool, cancellation_reason?: ?string}  $changes
     */
    public function handle(CourseSession $session, array $changes): CourseSession
    {
        return DB::transaction(function () use ($session, $changes): CourseSession {
            $session = CourseSession::query()->lockForUpdate()->findOrFail($session->id);
            $session->loadMissing('cohort');
            $previousStartsAt = $session->starts_at;
            $wasCancelled = $session->isCancelled();
            $linkChanged = array_key_exists('meeting_url', $changes)
                && $session->meeting_url !== $changes['meeting_url'];
            $rescheduled = array_key_exists('starts_at', $changes)
                && ! $session->starts_at->equalTo($changes['starts_at']);
            $cancelled = array_key_exists('is_cancelled', $changes) && $changes['is_cancelled'];

            $attributes = [];
            if (array_key_exists('meeting_url', $changes)) {
                $attributes['meeting_url'] = $changes['meeting_url'];
            }
            if ($rescheduled) {
                $attributes['starts_at'] = $changes['starts_at'];
            }
            if (array_key_exists('is_cancelled', $changes)) {
                $attributes['cancelled_at'] = $cancelled ? ($session->cancelled_at ?? now()) : null;
                $attributes['cancellation_reason'] = $cancelled ? $changes['cancellation_reason'] : null;
            }
            if ($attributes !== []) {
                $session->update($attributes);
            }

            $first = $session->cohort->sessions()->orderBy('starts_at')->first();
            $last = $session->cohort->sessions()->orderByDesc('starts_at')->first();
            if ($first && $last) {
                $session->cohort->update([
                    'starts_at' => $first->starts_at,
                    'ends_at' => $last->endsAt(),
                ]);
            }

            $students = $this->confirmedStudents($session);
            if ($cancelled && ! $wasCancelled) {
                Notification::send($students, new CourseSessionCancelled($session->refresh()));
            } elseif ($rescheduled && ! $session->isCancelled()) {
                Notification::send($students, new CourseSessionRescheduled($session->refresh(), $previousStartsAt));
            } elseif ($linkChanged && $session->meeting_url && ! $session->isCancelled() && $session->starts_at->isFuture()) {
                Notification::send($students, new CourseSessionMeetingLinkShared($session->refresh()));
            }

            return $session->refresh();
        });
    }

    /** @return Collection<int, User> */
    private function confirmedStudents(CourseSession $session): Collection
    {
        return User::query()->whereHas('courseEnrollments', fn ($query) => $query
            ->where('course_cohort_id', $session->course_cohort_id)
            ->where('status', CourseEnrollmentStatus::Confirmed))->get();
    }
}
