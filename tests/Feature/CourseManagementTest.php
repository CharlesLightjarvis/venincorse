<?php

use App\Enums\CourseAttendanceStatus;
use App\Enums\CourseEnrollmentStatus;
use App\Enums\CourseInstallmentStatus;
use App\Enums\CoursePaymentPlan;
use App\Enums\CourseRhythm;
use App\Models\CourseCohort;
use App\Models\CourseEnrollment;
use App\Models\CourseInstallment;
use App\Models\CourseSession;
use App\Models\CourseSessionAttendance;
use App\Models\User;
use App\Notifications\CourseEnrollmentCancelled;
use App\Notifications\CourseMeetingLinkShared;
use App\Notifications\CourseScheduleChanged;
use App\Notifications\CourseSessionCancelled;
use App\Notifications\CourseSessionMeetingLinkShared;
use App\Notifications\CourseSessionRescheduled;
use App\Notifications\TrialPaymentAlert;
use App\Services\CoursePaymentGateway;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Support\Facades\Notification;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function () {
    $this->seed(RolesAndPermissionsSeeder::class);
    Notification::fake();
    $this->teacher = User::factory()->create();
    $this->teacher->assignRole('administrator');
});

test('students cannot manage enrollments', function () {
    $enrollment = CourseEnrollment::factory()->confirmed()->create();
    $student = User::factory()->create();
    $student->assignRole('student');

    $this->actingAs($student)->patch(route('course-enrollment-management.update', $enrollment), ['notes' => 'x'])->assertForbidden();
    $this->post(route('course-enrollment-cancellations.store', $enrollment), ['refund_cents' => 0, 'reason' => 'Je pars'])->assertForbidden();
});

test('a withdrawal after the course started refunds the part not followed, and the student is emailed', function () {
    $cohort = CourseCohort::factory()->create(['starts_at' => now()->subDays(2)]);
    CourseSession::factory()->create(['course_cohort_id' => $cohort->id, 'starts_at' => now()->subDays(2), 'duration_minutes' => 360]);
    $enrollment = CourseEnrollment::factory()->confirmed()->create(['course_cohort_id' => $cohort->id, 'amount_cents' => 72000]);
    $gateway = Mockery::mock(CoursePaymentGateway::class);
    $gateway->shouldReceive('session')->andReturn(['payment_intent' => 'pi_full']);
    $gateway->shouldReceive('refund')->once()->withArgs(fn ($refunded, $paymentIntent, $amount) => $paymentIntent === 'pi_full' && $amount === 64800);
    app()->instance(CoursePaymentGateway::class, $gateway);
    $this->actingAs($this->teacher);

    // 6 hours out of 60 followed: 10 % of the price is owed, 90 % refunded.
    $this->get(route('course-cohorts.show', $cohort))
        ->assertInertia(fn (Assert $page) => $page->where('enrollments.0.management.prorata_refund_cents', 64800));
    $this->post(route('course-enrollment-cancellations.store', $enrollment), [
        'refund_cents' => 64800, 'reason' => 'Rétractation demandée par email.',
    ])->assertSessionHasNoErrors();

    expect($enrollment->fresh())
        ->status->toBe(CourseEnrollmentStatus::Cancelled)
        ->refunded_cents->toBe(64800)
        ->cancellation_reason->toBe('Rétractation demandée par email.')
        ->and($cohort->fresh()->seatsLeft())->toBe(6);
    Notification::assertSentTo($enrollment->user, CourseEnrollmentCancelled::class, fn ($mail) => $mail->refundCents === 64800);
});

test('instalments are refunded latest first and the remaining ones are cancelled', function () {
    $enrollment = CourseEnrollment::factory()->confirmed()->create(['payment_plan' => CoursePaymentPlan::Installments, 'amount_cents' => 72000]);
    foreach ([1 => 'pi_one', 2 => 'pi_two'] as $position => $paymentIntent) {
        CourseInstallment::factory()->create([
            'course_enrollment_id' => $enrollment->id, 'position' => $position, 'status' => CourseInstallmentStatus::Paid,
            'paid_at' => now(), 'stripe_payment_intent_id' => $paymentIntent,
        ]);
    }
    $last = CourseInstallment::factory()->create(['course_enrollment_id' => $enrollment->id, 'position' => 3, 'due_at' => now()->addMonth()]);
    $refunds = [];
    $gateway = Mockery::mock(CoursePaymentGateway::class);
    $gateway->shouldReceive('refund')->twice()->andReturnUsing(function ($refunded, $paymentIntent, $amount) use (&$refunds): void {
        $refunds[] = [$paymentIntent, $amount];
    });
    app()->instance(CoursePaymentGateway::class, $gateway);

    $this->actingAs($this->teacher)->post(route('course-enrollment-cancellations.store', $enrollment), [
        'refund_cents' => 30000, 'reason' => 'Le groupe est annulé par l’école.',
    ])->assertSessionHasNoErrors();

    expect($refunds)->toBe([['pi_two', 24000], ['pi_one', 6000]])
        ->and($last->fresh()->status)->toBe(CourseInstallmentStatus::Cancelled)
        ->and($enrollment->fresh()->refunded_cents)->toBe(30000);
});

test('a refund above what was paid, or a refund Stripe refuses, changes nothing', function () {
    $enrollment = CourseEnrollment::factory()->confirmed()->create(['amount_cents' => 72000]);
    $gateway = Mockery::mock(CoursePaymentGateway::class);
    $gateway->shouldReceive('session')->andReturn(['payment_intent' => 'pi_full']);
    $gateway->shouldReceive('refund')->andThrow(new RuntimeException('Stripe down'));
    app()->instance(CoursePaymentGateway::class, $gateway);
    $this->actingAs($this->teacher);

    $this->post(route('course-enrollment-cancellations.store', $enrollment), ['refund_cents' => 80000, 'reason' => 'Trop rembourser'])
        ->assertInvalid(['refund_cents' => 'Le remboursement ne peut pas dépasser ce que l’élève a payé.']);
    $this->post(route('course-enrollment-cancellations.store', $enrollment), ['refund_cents' => 72000, 'reason' => 'Groupe annulé'])
        ->assertInvalid(['refund_cents']);

    expect($enrollment->fresh())->status->toBe(CourseEnrollmentStatus::Confirmed)->refunded_cents->toBe(0);
    Notification::assertNothingSent();
});

test('the teacher keeps private notes about a student', function () {
    $enrollment = CourseEnrollment::factory()->confirmed()->create();

    $this->actingAs($this->teacher)->patch(route('course-enrollment-management.update', $enrollment), ['notes' => 'Très à l’aise à l’oral'])
        ->assertSessionHasNoErrors();

    expect($enrollment->fresh()->notes)->toBe('Très à l’aise à l’oral');
});

test('enrolled students are emailed when the visio link is added or changed, not otherwise', function () {
    $cohort = CourseCohort::factory()->create();
    $enrolled = CourseEnrollment::factory()->confirmed()->create(['course_cohort_id' => $cohort->id]);
    $paying = CourseEnrollment::factory()->create(['course_cohort_id' => $cohort->id]);
    $this->actingAs($this->teacher);
    $payload = fn (?string $url) => ['meeting_url' => $url, 'capacity' => 6, 'is_published' => true];

    $this->put(route('course-cohorts.update', $cohort), $payload('https://meet.google.com/abc-defg-hij'));
    $this->put(route('course-cohorts.update', $cohort), $payload('https://meet.google.com/abc-defg-hij'));
    $this->put(route('course-cohorts.update', $cohort), $payload('https://meet.google.com/new-link-xyz'));

    Notification::assertSentToTimes($enrolled->user, CourseMeetingLinkShared::class, 2);
    Notification::assertNotSentTo($paying->user, CourseMeetingLinkShared::class);
});

test('the course page shows the next open group of each format', function () {
    $group = CourseCohort::factory()->create(['level' => 'b1', 'capacity' => 6]);
    CourseEnrollment::factory()->confirmed()->create(['course_cohort_id' => $group->id]);

    $this->get(route('courses.show', 'b1'))
        ->assertInertia(fn (Assert $page) => $page->component('courses/course-detail')
            ->where('upcoming.group.seats_left', 5)
            ->where('upcoming.solo', null));
});

test('an account following a course cannot be deleted; once it is over, it is anonymised', function () {
    $enrollment = CourseEnrollment::factory()->confirmed()->create();
    $user = $enrollment->user;

    $this->actingAs($user)->from(route('profile.edit'))
        ->delete(route('profile.destroy'), ['password' => 'password'])
        ->assertSessionHasErrors('password');

    $enrollment->cohort->update(['starts_at' => now()->subMonths(3), 'ends_at' => now()->subMonth()]);
    $this->delete(route('profile.destroy'), ['password' => 'password'])->assertSessionHasNoErrors();

    expect($user->fresh()->name)->toBe('Compte supprimé')
        ->and($enrollment->fresh()->goal)->toBe('—');
});

test('a session can be moved to a new date, and the enrolled students are emailed', function () {
    $cohort = CourseCohort::factory()->create(['starts_at' => now()->addWeek(), 'ends_at' => now()->addMonth()]);
    $session = CourseSession::factory()->create([
        'course_cohort_id' => $cohort->id, 'position' => 1,
        'starts_at' => now()->addWeek()->setTime(9, 0), 'duration_minutes' => 180,
    ]);
    $student = CourseEnrollment::factory()->confirmed()->create(['course_cohort_id' => $cohort->id])->user;
    $this->actingAs($this->teacher);
    $previous = $session->starts_at;
    $newDate = now()->addWeeks(2)->setTime(14, 0);

    $this->put(route('course-sessions.update', $session), ['starts_at' => $newDate->toIso8601String()])
        ->assertSessionHasNoErrors();

    expect($session->fresh()->starts_at->equalTo($newDate))->toBeTrue()
        ->and($cohort->fresh()->starts_at->equalTo($newDate))->toBeTrue();
    Notification::assertSentTo($student, CourseSessionRescheduled::class, fn ($mail) => $mail->previousStartsAt->equalTo($previous));

    $this->put(route('course-sessions.update', $session), ['starts_at' => now()->subDay()->toIso8601String()])
        ->assertInvalid(['starts_at']);
});

test('a session can be cancelled with a reason and restored, but a past one cannot be cancelled', function () {
    $cohort = CourseCohort::factory()->create();
    $session = CourseSession::factory()->create([
        'course_cohort_id' => $cohort->id, 'starts_at' => now()->addWeek(), 'duration_minutes' => 180,
    ]);
    $student = CourseEnrollment::factory()->confirmed()->create(['course_cohort_id' => $cohort->id])->user;
    $this->actingAs($this->teacher);

    $this->put(route('course-sessions.update', $session), [
        'is_cancelled' => true, 'cancellation_reason' => 'Professeur absent, s�ance report�e.',
    ])->assertSessionHasNoErrors();

    expect($session->fresh()->cancelled_at)->not->toBeNull()
        ->and($session->fresh()->cancellation_reason)->toBe('Professeur absent, s�ance report�e.');
    Notification::assertSentTo($student, CourseSessionCancelled::class);

    $this->put(route('course-sessions.update', $session), ['is_cancelled' => false])
        ->assertSessionHasNoErrors();
    expect($session->fresh()->cancelled_at)->toBeNull()
        ->and($session->fresh()->cancellation_reason)->toBeNull();

    $past = CourseSession::factory()->create([
        'course_cohort_id' => $cohort->id, 'position' => 2,
        'starts_at' => now()->subDay(), 'duration_minutes' => 180,
    ]);
    $this->put(route('course-sessions.update', $past), [
        'is_cancelled' => true, 'cancellation_reason' => 'Trop tard pour annuler.',
    ])->assertInvalid(['is_cancelled']);

    expect($past->fresh()->cancelled_at)->toBeNull();
});

test('changing the visio link of a future session emails students; a past session only records it', function () {
    $cohort = CourseCohort::factory()->create();
    $future = CourseSession::factory()->create([
        'course_cohort_id' => $cohort->id, 'position' => 1,
        'starts_at' => now()->addWeek(), 'duration_minutes' => 180,
    ]);
    $past = CourseSession::factory()->create([
        'course_cohort_id' => $cohort->id, 'position' => 2,
        'starts_at' => now()->subWeek(), 'duration_minutes' => 180,
    ]);
    $student = CourseEnrollment::factory()->confirmed()->create(['course_cohort_id' => $cohort->id])->user;
    $this->actingAs($this->teacher);

    $this->put(route('course-sessions.update', $future), [
        'meeting_url' => 'https://meet.google.com/session-link',
    ])->assertSessionHasNoErrors();
    $this->put(route('course-sessions.update', $past), [
        'meeting_url' => 'https://meet.google.com/past-link',
    ])->assertSessionHasNoErrors();

    expect($future->fresh()->meeting_url)->toBe('https://meet.google.com/session-link')
        ->and($past->fresh()->meeting_url)->toBe('https://meet.google.com/past-link');
    Notification::assertSentToTimes($student, CourseSessionMeetingLinkShared::class, 1);
});

test('the teacher records who attended a started session, replacing the previous call', function () {
    $cohort = CourseCohort::factory()->create();
    $session = CourseSession::factory()->create([
        'course_cohort_id' => $cohort->id, 'starts_at' => now()->subHour(), 'duration_minutes' => 180,
    ]);
    $enrollment = CourseEnrollment::factory()->confirmed()->create(['course_cohort_id' => $cohort->id]);
    $paying = CourseEnrollment::factory()->create(['course_cohort_id' => $cohort->id]);
    $future = CourseSession::factory()->create([
        'course_cohort_id' => $cohort->id, 'position' => 2,
        'starts_at' => now()->addDay(), 'duration_minutes' => 180,
    ]);
    $student = $enrollment->user;
    $this->actingAs($this->teacher);

    $this->put(route('course-sessions.attendance.update', $session), [
        'attendances' => [$enrollment->id => 'present'],
    ])->assertSessionHasNoErrors();

    expect(CourseSessionAttendance::query()->where('course_session_id', $session->id)->sole())
        ->status->toBe(CourseAttendanceStatus::Present)
        ->course_enrollment_id->toBe($enrollment->id);

    $this->put(route('course-sessions.attendance.update', $session), [
        'attendances' => [$enrollment->id => 'excused'],
    ])->assertSessionHasNoErrors();

    expect($session->attendances()->count())->toBe(1)
        ->and($session->attendances()->sole()->status)->toBe(CourseAttendanceStatus::Excused);

    $this->put(route('course-sessions.attendance.update', $session), [
        'attendances' => [$paying->id => 'present'],
    ])->assertInvalid(['attendances']);

    $this->put(route('course-sessions.attendance.update', $future), [
        'attendances' => [$enrollment->id => 'present'],
    ])->assertInvalid(['attendances']);

    $student->assignRole('student');
    $this->actingAs($student)->put(route('course-sessions.attendance.update', $session), [
        'attendances' => [$enrollment->id => 'present'],
    ])->assertForbidden();
});

test('cancelling a whole group refunds confirmed students, releases holds and cancels future sessions', function () {
    $cohort = CourseCohort::factory()->create(['starts_at' => now()->addWeek(), 'ends_at' => now()->addMonth()]);
    $first = CourseSession::factory()->create([
        'course_cohort_id' => $cohort->id, 'position' => 1, 'starts_at' => now()->addWeek(), 'duration_minutes' => 180,
    ]);
    $second = CourseSession::factory()->create([
        'course_cohort_id' => $cohort->id, 'position' => 2, 'starts_at' => now()->addWeeks(2), 'duration_minutes' => 180,
    ]);
    $confirmed = CourseEnrollment::factory()->confirmed()->create([
        'course_cohort_id' => $cohort->id, 'amount_cents' => 72000, 'stripe_session_id' => 'cs_full',
    ]);
    $pending = CourseEnrollment::factory()->create(['course_cohort_id' => $cohort->id]);
    $gateway = Mockery::mock(CoursePaymentGateway::class);
    $gateway->shouldReceive('session')->andReturn(['payment_intent' => 'pi_full']);
    $gateway->shouldReceive('refund')->once()
        ->withArgs(fn ($enrollment, $paymentIntent, $amount) => $paymentIntent === 'pi_full' && $amount === 72000);
    app()->instance(CoursePaymentGateway::class, $gateway);
    $this->actingAs($this->teacher);

    $this->post(route('course-cohort-cancellations.store', $cohort), [
        'reason' => 'Nombre d’inscrits insuffisant pour ouvrir le groupe.',
    ])->assertSessionHasNoErrors();

    expect($cohort->fresh()->cancelled_at)->not->toBeNull()
        ->and($cohort->fresh()->is_published)->toBeFalse()
        ->and($first->fresh()->cancelled_at)->not->toBeNull()
        ->and($second->fresh()->cancelled_at)->not->toBeNull()
        ->and($confirmed->fresh())->status->toBe(CourseEnrollmentStatus::Cancelled)
        ->and($confirmed->fresh()->refunded_cents)->toBe(72000)
        ->and($pending->fresh())->status->toBe(CourseEnrollmentStatus::Expired)
        ->and($cohort->fresh()->seatsLeft())->toBe(6);
    Notification::assertSentTo($confirmed->user, CourseEnrollmentCancelled::class, fn ($mail) => $mail->refundCents === 72000);
    Notification::assertSentTo($pending->user, CourseEnrollmentCancelled::class);
    Notification::assertNotSentTo($this->teacher, TrialPaymentAlert::class);
});

test('a refund refused by the bank still cancels the group and alerts the team', function () {
    $cohort = CourseCohort::factory()->create(['starts_at' => now()->addWeek(), 'ends_at' => now()->addMonth()]);
    CourseSession::factory()->create(['course_cohort_id' => $cohort->id, 'starts_at' => now()->addWeek()]);
    $confirmed = CourseEnrollment::factory()->confirmed()->create([
        'course_cohort_id' => $cohort->id, 'amount_cents' => 72000, 'stripe_session_id' => 'cs_full',
    ]);
    $gateway = Mockery::mock(CoursePaymentGateway::class);
    $gateway->shouldReceive('session')->andReturn(['payment_intent' => 'pi_full']);
    $gateway->shouldReceive('refund')->andThrow(new RuntimeException('Stripe down'));
    app()->instance(CoursePaymentGateway::class, $gateway);
    $this->actingAs($this->teacher);

    $this->post(route('course-cohort-cancellations.store', $cohort), [
        'reason' => 'Le groupe est annulé par l’école.',
    ])->assertSessionHasNoErrors();

    expect($cohort->fresh()->cancelled_at)->not->toBeNull()
        ->and($confirmed->fresh())->status->toBe(CourseEnrollmentStatus::Confirmed)
        ->and($confirmed->fresh()->refunded_cents)->toBe(0);
    Notification::assertSentTo($this->teacher, TrialPaymentAlert::class);
});

test('the remaining schedule can be replanned without touching sessions already started', function () {
    $cohort = CourseCohort::factory()->create([
        'rhythm' => CourseRhythm::Extensive,
        'starts_at' => now()->subWeek(), 'ends_at' => now()->addMonths(3),
    ]);
    $past = CourseSession::factory()->create([
        'course_cohort_id' => $cohort->id, 'position' => 1,
        'starts_at' => now()->subWeek(), 'duration_minutes' => 180,
    ]);
    $future = CourseSession::factory()->create([
        'course_cohort_id' => $cohort->id, 'position' => 2,
        'starts_at' => now()->addWeek(), 'duration_minutes' => 180,
    ]);
    $student = CourseEnrollment::factory()->confirmed()->create(['course_cohort_id' => $cohort->id])->user;
    $this->actingAs($this->teacher);

    $this->put(route('course-cohort-schedules.update', $cohort), [
        'rhythm' => 'intensif', 'starts_on' => now()->addDays(2)->toDateString(), 'start_hour' => 14,
    ])->assertSessionHasNoErrors();

    $sessions = $cohort->fresh()->sessions()->orderBy('position')->get();
    expect($future->fresh())->toBeNull()
        ->and($sessions)->toHaveCount(20)
        ->and($sessions->first()->id)->toBe($past->id)
        ->and($sessions->last()->starts_at->setTimezone(config('trials.timezone'))->format('H:i'))->toBe('14:00')
        ->and($cohort->fresh()->rhythm)->toBe(CourseRhythm::Intensive);
    Notification::assertSentTo($student, CourseScheduleChanged::class);
});

test('a cancelled group cannot be cancelled twice, replanned or have its sessions changed', function () {
    $cohort = CourseCohort::factory()->create([
        'starts_at' => now()->addWeek(), 'ends_at' => now()->addMonth(),
        'cancelled_at' => now(), 'cancellation_reason' => 'Groupe annulé.',
    ]);
    $session = CourseSession::factory()->create(['course_cohort_id' => $cohort->id, 'starts_at' => now()->addWeek()]);
    $this->actingAs($this->teacher);

    $this->post(route('course-cohort-cancellations.store', $cohort), ['reason' => 'Encore une fois.'])
        ->assertInvalid(['cohort']);
    $this->put(route('course-cohort-schedules.update', $cohort), [
        'rhythm' => 'intensif', 'starts_on' => now()->addDays(2)->toDateString(), 'start_hour' => 9,
    ])->assertInvalid(['starts_on']);
    $this->put(route('course-sessions.update', $session), [
        'meeting_url' => 'https://meet.google.com/locked',
    ])->assertInvalid(['session']);
});
