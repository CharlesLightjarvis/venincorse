<?php

use App\Actions\ApplyCourseEnrollmentPayment;
use App\Actions\ApplyCourseInstallmentPayment;
use App\Enums\CourseEnrollmentStatus;
use App\Enums\CourseInstallmentStatus;
use App\Enums\CoursePaymentPlan;
use App\Models\CourseCohort;
use App\Models\CourseEnrollment;
use App\Models\CourseInstallment;
use App\Models\User;
use App\Notifications\CourseInstallmentFailed;
use App\Notifications\CourseInstallmentPaid;
use App\Notifications\TrialPaymentAlert;
use App\Services\CoursePaymentGateway;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Support\Facades\Notification;
use Stripe\Checkout\Session;
use Stripe\Exception\CardException;

beforeEach(function () {
    $this->seed(RolesAndPermissionsSeeder::class);
    Notification::fake();
});

function installmentEnrollment(array $attributes = []): CourseEnrollment
{
    $enrollment = CourseEnrollment::factory()->confirmed()->create([
        'payment_plan' => CoursePaymentPlan::Installments, 'amount_cents' => 72000,
        'stripe_customer_id' => 'cus_test', 'stripe_payment_method_id' => 'pm_test', ...$attributes,
    ]);
    $enrollment->user->assignRole('student');

    return $enrollment;
}

function declined(string $message = 'Your card was declined.'): CardException
{
    return CardException::factory($message, 402, null, ['error' => ['message' => $message, 'code' => 'card_declined']]);
}

test('three instalments split the total, with the configured fee and the remainder on the last one', function () {
    expect(CoursePaymentPlan::Installments->totalCents(84000))->toBe(84000)
        ->and(CoursePaymentPlan::Installments->amountsCents(84000))->toBe([28000, 28000, 28000])
        ->and(CoursePaymentPlan::Installments->amountsCents(209000))->toBe([69666, 69666, 69668])
        ->and(CoursePaymentPlan::Full->amountsCents(84000))->toBe([84000]);

    config(['courses.installments.surcharge_percent' => 5]);
    expect(CoursePaymentPlan::Installments->totalCents(72000))->toBe(75600);
});

test('choosing three instalments charges only the first one on the Stripe page', function () {
    $cohort = CourseCohort::factory()->create(['price_cents' => 84000]);
    $gateway = Mockery::mock(CoursePaymentGateway::class);
    $gateway->shouldReceive('ready')->andReturnTrue();
    $gateway->shouldReceive('create')->once()
        ->withArgs(fn (CourseEnrollment $enrollment) => $enrollment->checkoutAmountCents() === 28000)
        ->andReturn(Session::constructFrom(['id' => 'cs_test_i', 'url' => 'https://checkout.stripe.com/c/pay/cs_test_i']));
    app()->instance(CoursePaymentGateway::class, $gateway);
    $student = User::factory()->create();
    $student->assignRole('student');

    $this->actingAs($student)->post(route('course-enrollments.store'), [
        'cohort_id' => $cohort->id, 'goal' => 'Parler allemand au travail', 'timezone' => 'Europe/Paris',
        'terms' => true, 'payment_plan' => 'installments',
    ])->assertRedirect('https://checkout.stripe.com/c/pay/cs_test_i');

    expect(CourseEnrollment::query()->sole())
        ->payment_plan->toBe(CoursePaymentPlan::Installments)
        ->amount_cents->toBe(84000);
});

test('once the first instalment is paid, the next ones are scheduled every 30 days on the saved card', function () {
    $enrollment = CourseEnrollment::factory()->create([
        'payment_plan' => CoursePaymentPlan::Installments, 'amount_cents' => 72000, 'stripe_session_id' => 'cs_test_i',
    ]);

    app(ApplyCourseEnrollmentPayment::class)->handle([
        'id' => 'cs_test_i', 'livemode' => false, 'client_reference_id' => $enrollment->id,
        'metadata' => ['course_enrollment_id' => $enrollment->id], 'amount_total' => 24000, 'currency' => 'eur',
        'status' => 'complete', 'payment_status' => 'paid', 'payment_intent' => 'pi_first', 'customer' => 'cus_saved',
    ], 'checkout.session.completed');

    $enrollment->refresh();
    $installments = $enrollment->installments;
    expect($enrollment)->status->toBe(CourseEnrollmentStatus::Confirmed)->stripe_customer_id->toBe('cus_saved')
        ->and($installments)->toHaveCount(3)
        ->and($installments->pluck('status')->all())->toBe([CourseInstallmentStatus::Paid, CourseInstallmentStatus::Scheduled, CourseInstallmentStatus::Scheduled])
        ->and($installments[0]->stripe_payment_intent_id)->toBe('pi_first')
        ->and((int) $enrollment->paid_at->diffInDays($installments[1]->due_at))->toBe(30)
        ->and((int) $enrollment->paid_at->diffInDays($installments[2]->due_at))->toBe(60);
});

test('a due instalment is charged on the saved card and the student gets a receipt', function () {
    $enrollment = installmentEnrollment();
    $installment = CourseInstallment::factory()->create(['course_enrollment_id' => $enrollment->id]);
    CourseInstallment::factory()->create(['course_enrollment_id' => $enrollment->id, 'position' => 3, 'due_at' => now()->addMonth()]);
    $gateway = Mockery::mock(CoursePaymentGateway::class);
    $gateway->shouldReceive('ready')->andReturnTrue();
    $gateway->shouldReceive('chargeInstallment')->once()
        ->withArgs(fn ($charged, $customer, $method) => $charged->is($installment) && $customer === 'cus_test' && $method === 'pm_test')
        ->andReturn(['id' => 'pi_second', 'status' => 'succeeded']);
    app()->instance(CoursePaymentGateway::class, $gateway);

    $this->artisan('courses:charge-installments')->assertSuccessful();
    $this->artisan('courses:charge-installments')->assertSuccessful();

    expect($installment->fresh())->status->toBe(CourseInstallmentStatus::Paid)->stripe_payment_intent_id->toBe('pi_second');
    Notification::assertSentToTimes($enrollment->user, CourseInstallmentPaid::class, 1);
});

test('a declined instalment is retried twice, the student can pay it, then the team is alerted', function () {
    $teacher = User::factory()->create();
    $teacher->assignRole('administrator');
    $enrollment = installmentEnrollment();
    $installment = CourseInstallment::factory()->create(['course_enrollment_id' => $enrollment->id]);
    $gateway = Mockery::mock(CoursePaymentGateway::class);
    $gateway->shouldReceive('ready')->andReturnTrue();
    $gateway->shouldReceive('chargeInstallment')->times(3)->andThrow(declined());
    app()->instance(CoursePaymentGateway::class, $gateway);

    $this->artisan('courses:charge-installments');
    expect($installment->fresh())->status->toBe(CourseInstallmentStatus::Failed)
        ->and((int) round(now()->diffInDays($installment->fresh()->next_attempt_at)))->toBe(3)
        ->and($installment->fresh()->failure_message)->toBe('Ta banque a refusé le prélèvement.');
    $this->artisan('courses:charge-installments');
    expect($installment->fresh()->attempts)->toBe(1);

    $this->travel(3)->days();
    $this->artisan('courses:charge-installments');
    $this->travel(4)->days();
    $this->artisan('courses:charge-installments');

    expect($installment->fresh())->attempts->toBe(3)->next_attempt_at->toBeNull();
    Notification::assertSentToTimes($enrollment->user, CourseInstallmentFailed::class, 3);
    Notification::assertSentTo($teacher, TrialPaymentAlert::class);
});

test('instalments of an enrollment that is not confirmed are never charged', function () {
    $enrollment = installmentEnrollment(['status' => CourseEnrollmentStatus::Refunded]);
    CourseInstallment::factory()->create(['course_enrollment_id' => $enrollment->id]);
    $gateway = Mockery::mock(CoursePaymentGateway::class);
    $gateway->shouldReceive('ready')->andReturnTrue();
    $gateway->shouldNotReceive('chargeInstallment');
    app()->instance(CoursePaymentGateway::class, $gateway);

    $this->artisan('courses:charge-installments')->assertSuccessful();
});

test('the student pays a failed instalment on a Stripe page; the card used is kept for the next ones', function () {
    $enrollment = installmentEnrollment();
    $installment = CourseInstallment::factory()->create([
        'course_enrollment_id' => $enrollment->id, 'status' => CourseInstallmentStatus::Failed, 'next_attempt_at' => now()->addDays(3),
    ]);
    $gateway = Mockery::mock(CoursePaymentGateway::class);
    $gateway->shouldReceive('ready')->andReturnTrue();
    $gateway->shouldReceive('createInstallmentCheckout')->once()
        ->andReturn(Session::constructFrom(['id' => 'cs_test_late', 'url' => 'https://checkout.stripe.com/c/pay/cs_test_late']));
    $gateway->shouldReceive('paymentIntent')->with('pi_manual')->andReturn(['payment_method' => 'pm_new']);
    app()->instance(CoursePaymentGateway::class, $gateway);

    $other = User::factory()->create();
    $other->assignRole('student');
    $this->actingAs($other)->post(route('course-installments.checkout', $installment))->assertNotFound();
    $this->actingAs($enrollment->user)->post(route('course-installments.checkout', $installment))
        ->assertRedirect('https://checkout.stripe.com/c/pay/cs_test_late');

    app(ApplyCourseInstallmentPayment::class)->handle([
        'object' => 'checkout.session', 'id' => 'cs_test_late', 'livemode' => false,
        'metadata' => ['course_installment_id' => (string) $installment->id],
        'payment_status' => 'paid', 'amount_total' => 24000, 'payment_intent' => 'pi_manual',
    ]);

    expect($installment->fresh())->status->toBe(CourseInstallmentStatus::Paid)->next_attempt_at->toBeNull()
        ->and($enrollment->fresh()->stripe_payment_method_id)->toBe('pm_new');
    Notification::assertSentTo($enrollment->user, CourseInstallmentPaid::class);
});
