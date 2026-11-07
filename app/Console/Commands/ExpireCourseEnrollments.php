<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Actions\ReconcileCourseEnrollmentPayment;
use App\Enums\CourseEnrollmentStatus;
use App\Models\CourseEnrollment;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Cache;

final class ExpireCourseEnrollments extends Command
{
    protected $signature = 'courses:expire-enrollments';

    protected $description = 'Release the seats of unpaid course enrollments and reconcile unfinished payments with Stripe, even when a webhook was missed';

    public function handle(ReconcileCourseEnrollmentPayment $reconcile): int
    {
        CourseEnrollment::query()
            ->whereIn('status', [CourseEnrollmentStatus::Pending, CourseEnrollmentStatus::Processing])
            ->where(fn ($query) => $query
                ->where('expires_at', '<', now())
                ->orWhere('checkout_started_at', '<', now()->subMinutes(5)))
            ->lazyById()
            ->each(function (CourseEnrollment $enrollment) use ($reconcile): void {
                if ($enrollment->stripe_session_id) {
                    // Delayed bank payments can stay "processing" for days: ask Stripe every 15 minutes, not every minute.
                    if ($enrollment->status === CourseEnrollmentStatus::Processing
                        && ! Cache::add('course-processing-check:'.$enrollment->id, true, now()->addMinutes(15))) {
                        return;
                    }
                    $reconcile->handle($enrollment, force: true);

                    return;
                }
                if ($enrollment->expires_at->isPast()) {
                    CourseEnrollment::query()->whereKey($enrollment->id)
                        ->whereNull('stripe_session_id')
                        ->where('status', CourseEnrollmentStatus::Pending)
                        ->update(['status' => CourseEnrollmentStatus::Expired]);
                }
            });

        return self::SUCCESS;
    }
}
