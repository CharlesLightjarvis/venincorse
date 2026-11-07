<?php

use App\Actions\ApplyCourseEnrollmentPayment;
use App\Enums\CourseEnrollmentStatus;
use App\Models\CourseCohort;
use App\Models\CourseEnrollment;
use App\Models\User;
use App\Notifications\CourseEnrolled;
use App\Notifications\CourseEnrolledForTeacher;
use App\Notifications\CourseEnrollmentRefunded;
use App\Services\CoursePaymentGateway;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Support\Facades\Notification;
use Inertia\Testing\AssertableInertia as Assert;
use Mockery\MockInterface;
use Stripe\Checkout\Session;

beforeEach(function () {
    $this->seed(RolesAndPermissionsSeeder::class);
    Notification::fake();
});

function courseStudent(): User
{
    $student = User::factory()->create();
    $student->assignRole('student');

    return $student;
}

function enrollmentPayload(CourseCohort $cohort, array $overrides = []): array
{
    return [
        'cohort_id' => $cohort->id, 'goal' => 'Parler allemand au travail', 'timezone' => 'Europe/Paris',
        'terms' => true, 'early_start' => false, 'payment_plan' => 'full', ...$overrides,
    ];
}

function checkoutGateway(): MockInterface
{
    $gateway = Mockery::mock(CoursePaymentGateway::class);
    $gateway->shouldReceive('ready')->andReturnTrue();
    $gateway->shouldReceive('create')->andReturnUsing(fn (CourseEnrollment $enrollment) => Session::constructFrom([
        'id' => 'cs_test_'.substr($enrollment->id, -8), 'url' => 'https://checkout.stripe.com/c/pay/cs_test_'.substr($enrollment->id, -8),
    ]));
    app()->instance(CoursePaymentGateway::class, $gateway);

    return $gateway;
}

function paidCourseSession(CourseEnrollment $enrollment, array $overrides = []): array
{
    return [
        'id' => $enrollment->stripe_session_id ?? 'cs_test_paid', 'livemode' => false, 'client_reference_id' => $enrollment->id,
        'metadata' => ['course_enrollment_id' => $enrollment->id], 'amount_total' => $enrollment->amount_cents, 'currency' => 'eur',
        'status' => 'complete', 'payment_status' => 'paid', 'payment_intent' => 'pi_test_course', ...$overrides,
    ];
}

test('the enrollment page lists the open groups that have not started, with their free seats', function () {
    $open = CourseCohort::factory()->create(['capacity' => 3]);
    CourseEnrollment::factory()->confirmed()->create(['course_cohort_id' => $open->id]);
    CourseCohort::factory()->create(['is_published' => false]);
    CourseCohort::factory()->create(['starts_at' => now()->subDay()]);

    $this->get(route('course-enrollments.create', ['level' => 'a1']))
        ->assertInertia(fn (Assert $page) => $page->component('course-enrollments/create')
            ->has('cohorts', 1)
            ->where('cohorts.0.id', $open->id)
            ->where('cohorts.0.seats_left', 2)
            ->where('selected.level', 'a1')
            ->where('choiceLocked', false));
});

test('the enrollment page does not ask again for the level and format chosen on the course page', function () {
    $this->get(route('course-enrollments.create', ['level' => 'a1', 'format' => 'group']))
        ->assertInertia(fn (Assert $page) => $page
            ->where('selected.level', 'a1')
            ->where('selected.format', 'group')
            ->where('choiceLocked', true));
});

test('a student enrolls: the seat is held and they are sent to the Stripe payment page', function () {
    $cohort = CourseCohort::factory()->create(['starts_at' => now()->addWeeks(3)]);
    checkoutGateway();
    $student = courseStudent();

    $response = $this->actingAs($student)->post(route('course-enrollments.store'), enrollmentPayload($cohort));

    $enrollment = CourseEnrollment::query()->sole();
    $response->assertRedirect($enrollment->checkout_url);
    expect($enrollment)
        ->status->toBe(CourseEnrollmentStatus::Pending)
        ->user_id->toBe($student->id)
        ->amount_cents->toBe($cohort->price_cents)
        ->terms_version->toBe(config('trials.terms_version'))
        ->early_start_requested_at->toBeNull()
        ->and($cohort->fresh()->seatsLeft())->toBe(5);
});

test('guests must sign in and only students can enroll', function () {
    $cohort = CourseCohort::factory()->create();

    $this->post(route('course-enrollments.store'), enrollmentPayload($cohort))->assertRedirect(route('login'));
    $admin = User::factory()->create();
    $admin->assignRole('administrator');
    $this->actingAs($admin)->post(route('course-enrollments.store'), enrollmentPayload($cohort))->assertForbidden();
});

test('a group starting within the withdrawal period requires the express request to start early', function () {
    $cohort = CourseCohort::factory()->create(['starts_at' => now()->addDays(5)]);
    checkoutGateway();
    $this->actingAs(courseStudent());

    $this->post(route('course-enrollments.store'), enrollmentPayload($cohort))->assertInvalid(['early_start']);
    $this->post(route('course-enrollments.store'), enrollmentPayload($cohort, ['early_start' => true]))->assertRedirect();

    expect(CourseEnrollment::query()->sole()->early_start_requested_at)->not->toBeNull();
});

test('a full group, a closed group or a group already joined cannot be booked', function () {
    checkoutGateway();
    $full = CourseCohort::factory()->solo()->create();
    CourseEnrollment::factory()->create(['course_cohort_id' => $full->id]);
    $closed = CourseCohort::factory()->create(['is_published' => false]);
    $student = courseStudent();
    $joined = CourseCohort::factory()->create();
    CourseEnrollment::factory()->confirmed()->create(['course_cohort_id' => $joined->id, 'user_id' => $student->id]);
    $this->actingAs($student);

    $this->post(route('course-enrollments.store'), enrollmentPayload($full))->assertInvalid(['cohort_id']);
    $this->post(route('course-enrollments.store'), enrollmentPayload($closed))->assertInvalid(['cohort_id']);
    $this->post(route('course-enrollments.store'), enrollmentPayload($joined))
        ->assertInvalid(['cohort_id' => 'Tu es déjà inscrit à ce groupe. Retrouve-le dans « Mes parcours ».']);
});

test('coming back to the same group reuses the unpaid attempt instead of taking a second seat', function () {
    $cohort = CourseCohort::factory()->create(['starts_at' => now()->addWeeks(3)]);
    checkoutGateway();
    $this->actingAs(courseStudent());

    $this->post(route('course-enrollments.store'), enrollmentPayload($cohort));
    $this->post(route('course-enrollments.store'), enrollmentPayload($cohort, ['goal' => 'Préparer le Goethe B1']));

    expect(CourseEnrollment::query()->count())->toBe(1)
        ->and($cohort->fresh()->seatsLeft())->toBe(5);
});

test('a verified payment confirms the enrollment and emails the student and the team', function () {
    $teacher = User::factory()->create();
    $teacher->assignRole('administrator');
    $enrollment = CourseEnrollment::factory()->create(['stripe_session_id' => 'cs_test_paid']);

    app(ApplyCourseEnrollmentPayment::class)->handle(paidCourseSession($enrollment), 'checkout.session.completed');
    app(ApplyCourseEnrollmentPayment::class)->handle(paidCourseSession($enrollment), 'checkout.session.completed');

    expect($enrollment->fresh())->status->toBe(CourseEnrollmentStatus::Confirmed)->paid_at->not->toBeNull();
    Notification::assertSentToTimes($enrollment->user, CourseEnrolled::class, 1);
    Notification::assertSentTo($teacher, CourseEnrolledForTeacher::class);
});

test('a payment arriving after the hold expired, when the group is now full, is refunded automatically', function () {
    $cohort = CourseCohort::factory()->solo()->create();
    $late = CourseEnrollment::factory()->create([
        'course_cohort_id' => $cohort->id, 'status' => CourseEnrollmentStatus::Expired,
        'expires_at' => now()->subHour(), 'stripe_session_id' => 'cs_test_late',
    ]);
    CourseEnrollment::factory()->confirmed()->create(['course_cohort_id' => $cohort->id]);
    $gateway = Mockery::mock(CoursePaymentGateway::class);
    $gateway->shouldReceive('refund')->once()->withArgs(fn ($enrollment, $paymentIntent) => $paymentIntent === 'pi_test_course');
    app()->instance(CoursePaymentGateway::class, $gateway);

    app(ApplyCourseEnrollmentPayment::class)->handle(paidCourseSession($late), 'checkout.session.completed');

    expect($late->fresh()->status)->toBe(CourseEnrollmentStatus::Refunded);
    Notification::assertSentTo($late->user, CourseEnrollmentRefunded::class);
    Notification::assertNotSentTo($late->user, CourseEnrolled::class);
});

test('events of trial lessons and course enrollments never touch each other', function () {
    $enrollment = CourseEnrollment::factory()->create(['stripe_session_id' => 'cs_test_paid']);

    app(ApplyCourseEnrollmentPayment::class)->handle([
        ...paidCourseSession($enrollment), 'metadata' => ['reservation_id' => $enrollment->id],
    ], 'checkout.session.completed');

    expect($enrollment->fresh()->status)->toBe(CourseEnrollmentStatus::Pending);
});

test('an unpaid hold expires and frees the seat', function () {
    $cohort = CourseCohort::factory()->solo()->create();
    $enrollment = CourseEnrollment::factory()->create(['course_cohort_id' => $cohort->id, 'expires_at' => now()->subMinute()]);

    expect($cohort->seatsLeft())->toBe(1);
    $this->artisan('courses:expire-enrollments')->assertSuccessful();

    expect($enrollment->fresh()->status)->toBe(CourseEnrollmentStatus::Expired);
});

test('the student sees their courses, and the visio link only once enrolled', function () {
    $student = courseStudent();
    $cohort = CourseCohort::factory()->create(['meeting_url' => 'https://meet.google.com/abc-defg-hij']);
    CourseEnrollment::factory()->confirmed()->create(['course_cohort_id' => $cohort->id, 'user_id' => $student->id]);
    $pending = CourseCohort::factory()->create(['meeting_url' => 'https://meet.google.com/zzz-zzzz-zzz']);
    CourseEnrollment::factory()->create(['course_cohort_id' => $pending->id, 'user_id' => $student->id]);
    CourseEnrollment::factory()->confirmed()->create();

    $this->actingAs($student)->get(route('course-enrollments.index'))
        ->assertInertia(fn (Assert $page) => $page->component('course-enrollments/index')
            ->has('enrollments', 2)
            ->where('enrollments.0.can_pay', true)
            ->missing('enrollments.0.meeting_url')
            ->where('enrollments.1.meeting_url', 'https://meet.google.com/abc-defg-hij'));
});

test('a student cannot reopen the payment of someone else’s enrollment', function () {
    $enrollment = CourseEnrollment::factory()->create();

    $this->actingAs(courseStudent())->post(route('course-enrollments.checkout', $enrollment))->assertNotFound();
});

test('the teacher sees who joined, cannot delete a group with students, nor lower its seats below them', function () {
    $teacher = User::factory()->create();
    $teacher->assignRole('administrator');
    $cohort = CourseCohort::factory()->create();
    CourseEnrollment::factory()->confirmed()->count(2)->create(['course_cohort_id' => $cohort->id]);
    $this->actingAs($teacher);

    $this->get(route('course-cohorts.show', $cohort))
        ->assertInertia(fn (Assert $page) => $page->has('enrollments', 2)->where('cohort.seats_left', 4)->has('enrollments.0.student'));
    $this->delete(route('course-cohorts.destroy', $cohort))->assertInvalid(['cohort']);
    $this->put(route('course-cohorts.update', $cohort), ['meeting_url' => null, 'capacity' => 1, 'is_published' => true])
        ->assertInvalid(['capacity']);

    expect($cohort->fresh())->not->toBeNull();
});
