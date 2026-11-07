<?php

use App\Enums\CourseEnrollmentStatus;
use App\Enums\CourseInstallmentStatus;
use App\Enums\CoursePaymentPlan;
use App\Models\CourseCohort;
use App\Models\CourseEnrollment;
use App\Models\CourseInstallment;
use App\Models\CourseSession;
use App\Models\User;
use App\Notifications\CourseEnrollmentCancelled;
use App\Notifications\CourseMeetingLinkShared;
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
