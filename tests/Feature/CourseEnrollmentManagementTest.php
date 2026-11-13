<?php

use App\Enums\CourseAttendanceStatus;
use App\Enums\CourseEnrollmentStatus;
use App\Enums\CourseInstallmentStatus;
use App\Enums\CoursePaymentMethod;
use App\Models\CourseCohort;
use App\Models\CourseEnrollment;
use App\Models\CourseInstallment;
use App\Models\CourseSession;
use App\Models\CourseSessionAttendance;
use App\Models\User;
use App\Notifications\CourseEnrolled;
use App\Notifications\CourseEnrolledForTeacher;
use App\Notifications\CourseEnrollmentCancelled;
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

test('the team sees every enrollment with its student, group, payment and attendance', function () {
    $cohort = CourseCohort::factory()->create(['capacity' => 6]);
    $enrollment = CourseEnrollment::factory()->confirmed()->create([
        'course_cohort_id' => $cohort->id,
        'payment_method' => CoursePaymentMethod::BankTransfer,
        'payment_reference' => 'VIR-42',
    ]);
    $session = CourseSession::factory()->create([
        'course_cohort_id' => $cohort->id,
        'position' => 1,
        'starts_at' => now()->subDay(),
    ]);
    CourseSessionAttendance::query()->create([
        'course_session_id' => $session->id,
        'course_enrollment_id' => $enrollment->id,
        'status' => CourseAttendanceStatus::Present,
    ]);

    $this->actingAs($this->teacher)
        ->get(route('course-enrollment-management.index'))
        ->assertInertia(fn (Assert $page) => $page
            ->component('course-enrollments/manage')
            ->has('enrollments', 1)
            ->where('enrollments.0.student.email', $enrollment->user->email)
            ->where('enrollments.0.payment_method', 'bank_transfer')
            ->where('enrollments.0.payment_reference', 'VIR-42')
            ->where('enrollments.0.attendances.0.status', 'present')
            ->where('enrollments.0.attendances.0.session.position', 1)
            ->has('cohorts', 1)
            ->where('cohorts.0.id', $cohort->id));
});

test('students cannot open the enrollment management page nor add an enrollment', function () {
    $student = User::factory()->create();
    $student->assignRole('student');
    $cohort = CourseCohort::factory()->create();

    $this->actingAs($student)->get(route('course-enrollment-management.index'))->assertForbidden();
    $this->actingAs($student)->post(route('manual-course-enrollments.store'), [
        'email' => $student->email,
        'cohort_id' => $cohort->id,
        'payment_method' => 'offer',
    ])->assertForbidden();
});

test('the team enrolls a student by bank transfer or for free without Stripe', function () {
    $cohort = CourseCohort::factory()->create(['capacity' => 2]);
    $student = User::factory()->create();
    $this->actingAs($this->teacher);

    $this->from(route('course-enrollment-management.index'))
        ->post(route('manual-course-enrollments.store'), [
            'email' => $student->email,
            'cohort_id' => $cohort->id,
            'payment_method' => 'bank_transfer',
            'payment_reference' => 'VIR-2026-11',
            'goal' => 'Préparer un entretien professionnel.',
        ])
        ->assertRedirect(route('course-enrollment-management.index'))
        ->assertSessionHasNoErrors();

    $enrollment = CourseEnrollment::query()->where('user_id', $student->id)->sole();
    expect($enrollment)
        ->status->toBe(CourseEnrollmentStatus::Confirmed)
        ->payment_method->toBe(CoursePaymentMethod::BankTransfer)
        ->payment_reference->toBe('VIR-2026-11')
        ->amount_cents->toBe($cohort->price_cents)
        ->goal->toBe('Préparer un entretien professionnel.')
        ->and($enrollment->paid_at)->not->toBeNull()
        ->and($cohort->fresh()->seatsLeft())->toBe(1);
    Notification::assertSentTo($student, CourseEnrolled::class);
    Notification::assertSentTo($this->teacher, CourseEnrolledForTeacher::class);

    $offered = User::factory()->create();
    $this->post(route('manual-course-enrollments.store'), [
        'email' => $offered->email,
        'cohort_id' => $cohort->id,
        'payment_method' => 'offer',
    ])->assertSessionHasNoErrors();

    expect(CourseEnrollment::query()->where('user_id', $offered->id)->sole())
        ->status->toBe(CourseEnrollmentStatus::Confirmed)
        ->payment_method->toBe(CoursePaymentMethod::Offer)
        ->payment_reference->toBeNull()
        ->amount_cents->toBe(0)
        ->and($cohort->fresh()->seatsLeft())->toBe(0);
});

test('a manual enrollment is refused when the group is full, started, or the student is already enrolled', function () {
    $started = CourseCohort::factory()->create([
        'starts_at' => now()->subDay(),
        'ends_at' => now()->addMonth(),
    ]);
    $full = CourseCohort::factory()->create(['capacity' => 1]);
    CourseEnrollment::factory()->confirmed()->create(['course_cohort_id' => $full->id]);
    $open = CourseCohort::factory()->create(['capacity' => 6]);
    $enrolled = CourseEnrollment::factory()->confirmed()->create(['course_cohort_id' => $open->id]);
    $newcomer = User::factory()->create();
    $unknown = User::factory()->make();
    $this->actingAs($this->teacher);

    $this->post(route('manual-course-enrollments.store'), [
        'email' => $newcomer->email,
        'cohort_id' => $open->id,
        'payment_method' => 'bank_transfer',
        'payment_reference' => '',
    ])->assertInvalid(['payment_reference']);

    $this->post(route('manual-course-enrollments.store'), [
        'email' => $newcomer->email,
        'cohort_id' => $started->id,
        'payment_method' => 'offer',
    ])->assertInvalid(['cohort_id']);

    $this->post(route('manual-course-enrollments.store'), [
        'email' => $newcomer->email,
        'cohort_id' => $full->id,
        'payment_method' => 'offer',
    ])->assertInvalid(['cohort_id']);

    $this->post(route('manual-course-enrollments.store'), [
        'email' => $enrolled->user->email,
        'cohort_id' => $open->id,
        'payment_method' => 'offer',
    ])->assertInvalid(['email']);

    $this->post(route('manual-course-enrollments.store'), [
        'email' => $unknown->email,
        'cohort_id' => $open->id,
        'payment_method' => 'offer',
    ])->assertInvalid(['email']);

    expect(CourseEnrollment::query()->where('course_cohort_id', $open->id)->count())->toBe(1);
});

test('cancelling a manual enrollment records the refund without calling Stripe', function () {
    $cohort = CourseCohort::factory()->create([
        'starts_at' => now()->addWeek(),
        'ends_at' => now()->addMonth(),
    ]);
    $enrollment = CourseEnrollment::factory()->confirmed()->create([
        'course_cohort_id' => $cohort->id,
        'payment_method' => CoursePaymentMethod::BankTransfer,
        'payment_reference' => 'VIR-77',
        'amount_cents' => 72000,
        'paid_at' => now(),
    ]);
    $gateway = Mockery::mock(CoursePaymentGateway::class);
    $gateway->shouldNotReceive('refund');
    app()->instance(CoursePaymentGateway::class, $gateway);

    $this->actingAs($this->teacher)->post(route('course-enrollment-cancellations.store', $enrollment), [
        'refund_cents' => 72000,
        'reason' => 'Remboursement effectué par virement.',
    ])->assertSessionHasNoErrors();

    expect($enrollment->fresh())
        ->status->toBe(CourseEnrollmentStatus::Cancelled)
        ->refunded_cents->toBe(72000)
        ->and($cohort->fresh()->seatsLeft())->toBe(6);
    Notification::assertSentTo($enrollment->user, CourseEnrollmentCancelled::class);
});

test('the cancellation email describes refunds according to the payment method', function (CoursePaymentMethod $method, string $expected) {
    $enrollment = CourseEnrollment::factory()->confirmed()->create([
        'payment_method' => $method,
        'cancellation_reason' => 'Annulation demandée.',
    ]);

    $mail = (new CourseEnrollmentCancelled($enrollment, 12000))->toMail($enrollment->user);

    expect(implode(' ', $mail->introLines))->toContain($expected);
})->with([
    'card' => [CoursePaymentMethod::Stripe, 'sur le moyen de paiement utilisé'],
    'bank transfer' => [CoursePaymentMethod::BankTransfer, 'L’école te contactera pour les modalités'],
    'transfer' => [CoursePaymentMethod::Transfer, 'L’école te contactera pour les modalités'],
]);

test('the dashboard shows course metrics to managers but not to students', function () {
    $cohort = CourseCohort::factory()->create(['capacity' => 4]);
    $first = CourseEnrollment::factory()->confirmed()->create([
        'course_cohort_id' => $cohort->id,
        'amount_cents' => 72000,
        'paid_at' => now(),
    ]);
    $second = CourseEnrollment::factory()->confirmed()->create([
        'course_cohort_id' => $cohort->id,
        'amount_cents' => 36000,
        'paid_at' => now(),
    ]);
    CourseEnrollment::factory()->create([
        'course_cohort_id' => $cohort->id,
        'status' => CourseEnrollmentStatus::PaymentReview,
    ]);
    CourseInstallment::factory()->create([
        'course_enrollment_id' => $first->id,
        'status' => CourseInstallmentStatus::Failed,
        'due_at' => now()->subDay(),
    ]);
    $session = CourseSession::factory()->create([
        'course_cohort_id' => $cohort->id,
        'starts_at' => now()->subDay(),
    ]);
    CourseSessionAttendance::query()->create([
        'course_session_id' => $session->id,
        'course_enrollment_id' => $first->id,
        'status' => CourseAttendanceStatus::Present,
    ]);
    CourseSessionAttendance::query()->create([
        'course_session_id' => $session->id,
        'course_enrollment_id' => $second->id,
        'status' => CourseAttendanceStatus::Absent,
    ]);

    $this->actingAs($this->teacher)
        ->get(route('dashboard'))
        ->assertInertia(fn (Assert $page) => $page
            ->component('dashboard')
            ->where('courses.monthRevenueCents', 108000)
            ->where('courses.activeEnrollments', 2)
            ->where('courses.fillRate', 75)
            ->where('courses.attendanceRate', 50)
            ->where('courses.paymentReview', 1)
            ->where('courses.failedInstallments', 1));

    $student = User::factory()->create();
    $student->assignRole('student');
    $this->actingAs($student)
        ->get(route('dashboard'))
        ->assertInertia(fn (Assert $page) => $page->where('courses', null));
});
