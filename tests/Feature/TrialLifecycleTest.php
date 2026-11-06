<?php

use App\Actions\ApplyTrialPayment;
use App\Enums\TrialReservationStatus;
use App\Models\TrialReservation;
use App\Models\TrialSlot;
use App\Models\TrialSlotHold;
use App\Models\User;
use App\Notifications\TrialBooked;
use App\Notifications\TrialBookedForTeacher;
use App\Notifications\TrialCancelled;
use App\Notifications\TrialChangedForTeacher;
use App\Notifications\TrialCompleted;
use App\Notifications\TrialMeetingLinkShared;
use App\Notifications\TrialMissed;
use App\Notifications\TrialOutcomeReminder;
use App\Notifications\TrialPaymentAlert;
use App\Notifications\TrialRebookOffered;
use App\Notifications\TrialRefunded;
use App\Notifications\TrialReminder;
use App\Notifications\TrialRescheduled;
use App\Services\TrialPaymentGateway;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Str;
use Inertia\Testing\AssertableInertia as Assert;
use KenDeNigerian\PayZephyr\Events\WebhookReceived;
use Stripe\Exception\ApiConnectionException;

beforeEach(function () {
    $this->seed(RolesAndPermissionsSeeder::class);
    Notification::fake();
});

function lifecycleTeacher(): User
{
    $teacher = User::factory()->create();
    $teacher->assignRole('administrator');

    return $teacher;
}

function paidSession(TrialReservation $reservation): array
{
    return [
        'id' => 'cs_test_paid', 'livemode' => false, 'client_reference_id' => $reservation->id,
        'metadata' => ['reservation_id' => $reservation->id], 'amount_total' => 3900, 'currency' => 'eur',
        'status' => 'complete', 'payment_status' => 'paid', 'payment_intent' => 'pi_test_paid',
    ];
}

function refundingGateway(int $refunds = 1): void
{
    $gateway = Mockery::mock(TrialPaymentGateway::class);
    $gateway->shouldReceive('ready')->andReturnTrue();
    $gateway->shouldReceive('session')->andReturn(['payment_intent' => 'pi_test_paid']);
    $gateway->shouldReceive('refund')->times($refunds);
    app()->instance(TrialPaymentGateway::class, $gateway);
}

test('every trial email is queued so it never slows down or breaks the request', function (string $notification) {
    expect(new $notification(TrialReservation::factory()->confirmed()->create()))->toBeInstanceOf(ShouldQueue::class);
})->with([
    TrialBooked::class, TrialBookedForTeacher::class, TrialMeetingLinkShared::class, TrialReminder::class,
    TrialCancelled::class, TrialRefunded::class, TrialRescheduled::class, TrialCompleted::class, TrialMissed::class,
    TrialRebookOffered::class, TrialOutcomeReminder::class,
]);

test('a verified payment emails the student and the teaching team', function () {
    $teacher = lifecycleTeacher();
    $reservation = TrialReservation::factory()->create();
    TrialSlotHold::query()->create(['trial_slot_id' => $reservation->trial_slot_id, 'trial_reservation_id' => $reservation->id]);

    app(ApplyTrialPayment::class)->handle(paidSession($reservation), 'checkout.session.completed');
    app(ApplyTrialPayment::class)->handle(paidSession($reservation), 'checkout.session.completed');

    expect($reservation->fresh()->status)->toBe(TrialReservationStatus::Confirmed);
    Notification::assertSentToTimes($reservation->user, TrialBooked::class, 1);
    Notification::assertSentTo($teacher, TrialBookedForTeacher::class);
    Notification::assertNotSentTo($reservation->user, TrialBookedForTeacher::class);
});

test('the booking email is written in French with the session in the student time zone', function () {
    $reservation = TrialReservation::factory()->confirmed(now()->addDays(2)->setTime(18, 0))->create();
    $reservation->user->update(['timezone' => 'Europe/Paris']);

    $mail = (new TrialBooked($reservation))->toMail($reservation->user->fresh());

    expect($mail->subject)->toBe('Ton cours d’essai est confirmé')
        ->and(implode(' ', $mail->introLines))->toContain('(Europe/Paris)')
        ->and($mail->actionUrl)->toBe(route('trial-reservations.index'));
});

test('a late payment that is refunded tells the student', function () {
    $other = TrialReservation::factory()->confirmed()->create();
    $reservation = TrialReservation::factory()->create(['trial_slot_id' => $other->trial_slot_id, 'expires_at' => now()->subMinute()]);
    refundingGateway();

    app(ApplyTrialPayment::class)->handle(paidSession($reservation), 'checkout.session.completed');

    expect($reservation->fresh()->status)->toBe(TrialReservationStatus::Refunded);
    Notification::assertSentTo($reservation->user, TrialRefunded::class);
    Notification::assertNotSentTo($reservation->user, TrialBooked::class);
});

test('the student is emailed when the visio link of a paid session is added or changed, not otherwise', function () {
    $teacher = lifecycleTeacher();
    $reservation = TrialReservation::factory()->confirmed()->create();
    $pending = TrialReservation::factory()->create();
    $this->actingAs($teacher);

    $this->patch(route('trial-management.update', $reservation), ['meeting_url' => 'https://meet.example.com/a'])->assertRedirect();
    $this->patch(route('trial-management.update', $reservation), ['meeting_url' => 'https://meet.example.com/a', 'notes' => 'A2'])->assertRedirect();
    $this->patch(route('trial-management.update', $reservation), ['meeting_url' => 'https://meet.example.com/b'])->assertRedirect();
    $this->patch(route('trial-management.update', $pending), ['meeting_url' => 'https://meet.example.com/c'])->assertRedirect();

    Notification::assertSentToTimes($reservation->user, TrialMeetingLinkShared::class, 2);
    Notification::assertNotSentTo($pending->user, TrialMeetingLinkShared::class);
});

test('each paid session is reminded once, the day before', function () {
    $tomorrow = TrialReservation::factory()->confirmed(now()->addHours(20))->create(['paid_at' => now()->subDays(3)]);
    $justPaid = TrialReservation::factory()->confirmed(now()->addHours(22))->create(['paid_at' => now()->subHour()]);
    $later = TrialReservation::factory()->confirmed(now()->addDays(3))->create();
    $unpaid = TrialReservation::factory()->create(['trial_slot_id' => TrialSlot::factory()->create(['starts_at' => now()->addHours(21)])]);

    $this->artisan('trials:send-reminders')->assertSuccessful();
    $this->artisan('trials:send-reminders')->assertSuccessful();

    Notification::assertSentToTimes($tomorrow->user, TrialReminder::class, 1);
    Notification::assertNotSentTo($justPaid->user, TrialReminder::class);
    Notification::assertNotSentTo($later->user, TrialReminder::class);
    Notification::assertNotSentTo($unpaid->user, TrialReminder::class);
    expect($tomorrow->fresh()->reminder_sent_at)->not->toBeNull();
});

test('the teacher cancels a paid session: the student is refunded, emailed, and the slot freed', function () {
    $reservation = TrialReservation::factory()->confirmed()->create();
    refundingGateway();

    $this->actingAs(lifecycleTeacher())
        ->post(route('trial-cancellations.store', $reservation), ['reason' => 'Professeur malade'])
        ->assertRedirect()->assertSessionHasNoErrors();

    expect($reservation->fresh())
        ->status->toBe(TrialReservationStatus::Cancelled)
        ->cancellation_reason->toBe('Professeur malade')
        ->cancelled_at->not->toBeNull();
    $this->assertDatabaseMissing('trial_slot_holds', ['trial_reservation_id' => $reservation->id]);
    Notification::assertSentTo($reservation->user, TrialCancelled::class);
});

test('a cancellation whose refund fails keeps the session and tells the teacher', function () {
    $reservation = TrialReservation::factory()->confirmed()->create();
    $gateway = $this->mock(TrialPaymentGateway::class);
    $gateway->shouldReceive('ready')->andReturnTrue();
    $gateway->shouldReceive('session')->andReturn(['payment_intent' => 'pi_test_paid']);
    $gateway->shouldReceive('refund')->andThrow(new ApiConnectionException('Network down'));

    $this->actingAs(lifecycleTeacher())
        ->post(route('trial-cancellations.store', $reservation), ['reason' => 'Professeur malade'])
        ->assertInvalid(['reason' => 'Le remboursement n’a pas abouti : la séance est conservée. Réessaie dans quelques instants ou rembourse depuis Stripe.']);

    expect($reservation->fresh()->status)->toBe(TrialReservationStatus::Confirmed);
    Notification::assertNothingSent();
});

test('a session that has started cannot be cancelled and students cannot cancel', function () {
    $started = TrialReservation::factory()->confirmed(now()->subMinutes(10))->create();
    $future = TrialReservation::factory()->confirmed()->create();

    $this->actingAs(lifecycleTeacher())
        ->post(route('trial-cancellations.store', $started), ['reason' => 'Trop tard'])
        ->assertInvalid(['reason' => 'Cette séance ne peut plus être annulée : seules les séances payées qui n’ont pas commencé peuvent l’être.']);
    $this->actingAs($future->user)
        ->post(route('trial-cancellations.store', $future), ['reason' => 'Je ne peux plus'])
        ->assertForbidden();

    expect($started->fresh()->status)->toBe(TrialReservationStatus::Confirmed)
        ->and($future->fresh()->status)->toBe(TrialReservationStatus::Confirmed);
});

test('the teacher records the outcome only once the session has started', function (string $outcome) {
    $teacher = lifecycleTeacher();
    $future = TrialReservation::factory()->confirmed()->create();
    $started = TrialReservation::factory()->confirmed(now()->subMinutes(70))->create();

    $this->actingAs($teacher)->put(route('trial-outcomes.update', $future), ['outcome' => $outcome])
        ->assertInvalid(['outcome' => 'Tu pourras indiquer si la séance a eu lieu une fois qu’elle aura commencé.']);
    $this->put(route('trial-outcomes.update', $started), ['outcome' => $outcome])->assertSessionHasNoErrors();

    expect($future->fresh()->status)->toBe(TrialReservationStatus::Confirmed)
        ->and($started->fresh()->status->value)->toBe($outcome);
})->with(['completed', 'no_show']);

test('a payment under review can be confirmed when its slot is still free', function () {
    $teacher = lifecycleTeacher();
    $reservation = TrialReservation::factory()->create(['status' => TrialReservationStatus::PaymentReview, 'paid_at' => now()]);

    $this->actingAs($teacher)->put(route('trial-payment-reviews.update', $reservation), ['decision' => 'confirm'])
        ->assertSessionHasNoErrors();

    expect($reservation->fresh()->status)->toBe(TrialReservationStatus::Confirmed);
    $this->assertDatabaseHas('trial_slot_holds', ['trial_reservation_id' => $reservation->id]);
    Notification::assertSentTo($reservation->user, TrialBooked::class);
});

test('a payment under review whose slot was taken cannot be confirmed, only refunded', function () {
    $other = TrialReservation::factory()->confirmed()->create();
    $reservation = TrialReservation::factory()->create([
        'trial_slot_id' => $other->trial_slot_id, 'status' => TrialReservationStatus::PaymentReview,
        'paid_at' => now(), 'stripe_session_id' => 'cs_test_review',
    ]);
    refundingGateway();
    $this->actingAs(lifecycleTeacher());

    $this->put(route('trial-payment-reviews.update', $reservation), ['decision' => 'confirm'])
        ->assertInvalid(['decision' => 'Impossible de confirmer : le créneau n’est plus libre, la séance a commencé ou le paiement n’est pas enregistré. Rembourse l’élève.']);
    $this->put(route('trial-payment-reviews.update', $reservation), ['decision' => 'refund'])->assertSessionHasNoErrors();

    expect($reservation->fresh()->status)->toBe(TrialReservationStatus::Refunded)
        ->and($other->fresh()->status)->toBe(TrialReservationStatus::Confirmed);
    Notification::assertSentTo($reservation->user, TrialRefunded::class);
});

test('the management list counts every trial by category and filters on the server', function () {
    $this->freezeTime();
    TrialReservation::factory()->confirmed()->count(2)->create();
    TrialReservation::factory()->create();
    TrialReservation::factory()->confirmed(now()->subHours(3))->create();
    TrialReservation::factory()->create(['status' => TrialReservationStatus::Completed]);
    TrialReservation::factory()->create(['status' => TrialReservationStatus::Cancelled]);
    TrialReservation::factory()->create(['expires_at' => now()->subMinute()]);

    $this->actingAs(lifecycleTeacher())->get(route('trial-management.index', ['category' => 'done']))
        ->assertInertia(fn (Assert $page) => $page
            ->component('trials/manage')
            ->where('category', 'done')
            ->where('counts', ['upcoming' => 2, 'paying' => 1, 'done' => 2, 'cancelled' => 2])
            ->has('reservations.data', 2));
});

function lifecycleStudent(TrialReservation $reservation): User
{
    $reservation->user->assignRole('student');

    return $reservation->user;
}

test('a student moves their session once for free, until 24 hours before', function () {
    $teacher = lifecycleTeacher();
    $reservation = TrialReservation::factory()->confirmed(now()->addDays(3))->create();
    $student = lifecycleStudent($reservation);
    $newSlot = TrialSlot::factory()->create(['starts_at' => now()->addDays(4)]);
    $anotherSlot = TrialSlot::factory()->create(['starts_at' => now()->addDays(5)]);

    $this->actingAs($student)->get(route('trial-reschedules.create', $reservation))->assertOk()
        ->assertInertia(fn (Assert $page) => $page->component('trials/reschedule')->has('slots', 2));
    $this->post(route('trial-reschedules.store', $reservation), ['slot_id' => $newSlot->id])
        ->assertRedirect(route('trial-reservations.index'));

    expect($reservation->fresh())->trial_slot_id->toBe($newSlot->id)->reschedule_count->toBe(1);
    $this->assertDatabaseHas('trial_slot_holds', ['trial_slot_id' => $newSlot->id, 'trial_reservation_id' => $reservation->id]);
    Notification::assertSentTo($student, TrialRescheduled::class);
    Notification::assertSentTo($teacher, TrialChangedForTeacher::class);

    $this->post(route('trial-reschedules.store', $reservation), ['slot_id' => $anotherSlot->id])
        ->assertInvalid(['slot_id' => 'Ce cours ne peut plus être déplacé : le report gratuit est possible une fois, jusqu’à 24 h avant la séance. Contacte-nous en cas d’imprévu.']);
    expect($reservation->fresh()->trial_slot_id)->toBe($newSlot->id);
});

test('within 24 hours of the session the student can neither move nor cancel it', function () {
    $reservation = TrialReservation::factory()->confirmed(now()->addHours(20))->create();
    $student = lifecycleStudent($reservation);
    $slot = TrialSlot::factory()->create(['starts_at' => now()->addDays(4)]);

    $this->actingAs($student)->post(route('trial-reschedules.store', $reservation), ['slot_id' => $slot->id])
        ->assertInvalid(['slot_id']);
    $this->post(route('trial-student-cancellations.store', $reservation))
        ->assertInvalid(['cancellation' => 'Il est trop tard pour annuler : l’annulation remboursée est possible jusqu’à 24 h avant la séance. Contacte-nous en cas d’imprévu.']);

    expect($reservation->fresh()->status)->toBe(TrialReservationStatus::Confirmed);
});

test('a student cannot move or cancel someone else’s session', function () {
    $reservation = TrialReservation::factory()->confirmed(now()->addDays(3))->create();
    $other = TrialReservation::factory()->confirmed(now()->addDays(4))->create();
    $this->actingAs(lifecycleStudent($other));

    $this->get(route('trial-reschedules.create', $reservation))->assertNotFound();
    $this->post(route('trial-student-cancellations.store', $reservation))->assertNotFound();
});

test('a student cancels before the deadline and is refunded', function () {
    $teacher = lifecycleTeacher();
    $reservation = TrialReservation::factory()->confirmed(now()->addDays(3))->create();
    $student = lifecycleStudent($reservation);
    refundingGateway();

    $this->actingAs($student)->post(route('trial-student-cancellations.store', $reservation))
        ->assertRedirect(route('trial-reservations.index'));

    expect($reservation->fresh())->status->toBe(TrialReservationStatus::Cancelled)->cancelled_by->toBe('student');
    $this->assertDatabaseMissing('trial_slot_holds', ['trial_reservation_id' => $reservation->id]);
    Notification::assertSentTo($student, TrialCancelled::class);
    Notification::assertSentTo($teacher, TrialChangedForTeacher::class);
});

test('closing a session emails the student the summary, or a message when they were absent', function () {
    $teacher = lifecycleTeacher();
    $held = TrialReservation::factory()->confirmed(now()->subMinutes(70))->create();
    $missed = TrialReservation::factory()->confirmed(now()->subMinutes(80))->create();
    $this->actingAs($teacher);

    $this->put(route('trial-outcomes.update', $held), ['outcome' => 'completed', 'summary' => 'Niveau A2, travailler l’oral.'])
        ->assertSessionHasNoErrors();
    $this->put(route('trial-outcomes.update', $missed), ['outcome' => 'no_show', 'summary' => 'Ignoré'])
        ->assertSessionHasNoErrors();

    expect($held->fresh()->session_summary)->toBe('Niveau A2, travailler l’oral.')
        ->and($missed->fresh()->session_summary)->toBeNull();
    Notification::assertSentTo($held->user, TrialCompleted::class);
    Notification::assertSentTo($missed->user, TrialMissed::class);
});

test('after a missed session the teacher may offer one free new slot, which the student then picks', function () {
    $teacher = lifecycleTeacher();
    $reservation = TrialReservation::factory()->confirmed(now()->subHours(3))->create([
        'status' => TrialReservationStatus::NoShow, 'meeting_url' => 'https://meet.example.com/old',
    ]);
    $student = lifecycleStudent($reservation);
    $slot = TrialSlot::factory()->create(['starts_at' => now()->addDays(3)]);
    $anotherSlot = TrialSlot::factory()->create(['starts_at' => now()->addDays(4)]);

    $this->actingAs($student)->get(route('trial-reschedules.create', $reservation))->assertRedirect(route('trial-reservations.index'));
    $this->actingAs($teacher)->post(route('trial-rebook-offers.store', $reservation))->assertSessionHasNoErrors();
    $this->post(route('trial-rebook-offers.store', $reservation))->assertInvalid(['rebook']);
    Notification::assertSentToTimes($student, TrialRebookOffered::class, 1);

    $this->actingAs($student)->post(route('trial-reschedules.store', $reservation), ['slot_id' => $slot->id])
        ->assertRedirect(route('trial-reservations.index'));

    expect($reservation->fresh())
        ->status->toBe(TrialReservationStatus::Confirmed)
        ->trial_slot_id->toBe($slot->id)
        ->rebook_offered_at->toBeNull()
        ->rebooked_at->not->toBeNull()
        ->meeting_url->toBeNull();

    // The offered slot replaces a missed, unrefunded session: it can be neither moved nor refunded.
    $this->post(route('trial-reschedules.store', $reservation), ['slot_id' => $anotherSlot->id])->assertInvalid(['slot_id']);
    $this->post(route('trial-student-cancellations.store', $reservation))->assertInvalid(['cancellation']);
    expect($reservation->fresh())
        ->status->toBe(TrialReservationStatus::Confirmed)
        ->trial_slot_id->toBe($slot->id);
});

test('an offer of a new slot after a missed session expires', function () {
    $reservation = TrialReservation::factory()->confirmed(now()->subDays(20))->create([
        'status' => TrialReservationStatus::NoShow, 'rebook_offered_at' => now()->subDays(15),
    ]);
    $slot = TrialSlot::factory()->create(['starts_at' => now()->addDays(3)]);

    $this->actingAs(lifecycleStudent($reservation))
        ->post(route('trial-reschedules.store', $reservation), ['slot_id' => $slot->id])
        ->assertInvalid(['slot_id']);
    expect($reservation->fresh()->status)->toBe(TrialReservationStatus::NoShow);
});

test('a payment under review with nothing charged can be released, so the student may book again', function () {
    $reservation = TrialReservation::factory()->create(['status' => TrialReservationStatus::PaymentReview, 'stripe_session_id' => null]);
    TrialSlotHold::query()->create(['trial_slot_id' => $reservation->trial_slot_id, 'trial_reservation_id' => $reservation->id]);
    $paid = TrialReservation::factory()->create(['status' => TrialReservationStatus::PaymentReview, 'paid_at' => now()]);
    $this->actingAs(lifecycleTeacher());

    $this->get(route('trial-management.show', $reservation))
        ->assertInertia(fn (Assert $page) => $page
            ->where('reservation.actions.release_review', true)
            ->where('reservation.actions.confirm_review', false));
    $this->put(route('trial-payment-reviews.update', $reservation), ['decision' => 'release'])->assertSessionHasNoErrors();
    $this->put(route('trial-payment-reviews.update', $paid), ['decision' => 'release'])->assertInvalid(['decision']);

    expect($reservation->fresh()->status)->toBe(TrialReservationStatus::Expired)
        ->and($paid->fresh()->status)->toBe(TrialReservationStatus::PaymentReview);
    $this->assertDatabaseMissing('trial_slot_holds', ['trial_reservation_id' => $reservation->id]);
});

test('a release is refused when Stripe shows the attempt was paid', function () {
    $reservation = TrialReservation::factory()->create(['status' => TrialReservationStatus::PaymentReview, 'stripe_session_id' => 'cs_test_paid']);
    $gateway = $this->mock(TrialPaymentGateway::class);
    $gateway->shouldReceive('expireSession')->once()->andReturn(['payment_status' => 'paid']);

    $this->actingAs(lifecycleTeacher())
        ->put(route('trial-payment-reviews.update', $reservation), ['decision' => 'release'])
        ->assertInvalid(['decision']);

    expect($reservation->fresh()->status)->toBe(TrialReservationStatus::PaymentReview);
});

test('a payment arriving too close to the session is refunded instead of confirmed', function () {
    $reservation = TrialReservation::factory()->create([
        'status' => TrialReservationStatus::Processing,
        'trial_slot_id' => TrialSlot::factory()->create(['starts_at' => now()->addHours(6)]),
    ]);
    TrialSlotHold::query()->create(['trial_slot_id' => $reservation->trial_slot_id, 'trial_reservation_id' => $reservation->id]);
    refundingGateway();

    app(ApplyTrialPayment::class)->handle(paidSession($reservation), 'checkout.session.async_payment_succeeded');

    expect($reservation->fresh()->status)->toBe(TrialReservationStatus::Refunded);
    $this->assertDatabaseMissing('trial_slot_holds', ['trial_reservation_id' => $reservation->id]);
    Notification::assertSentTo($reservation->user, TrialRefunded::class);
});

test('a payment arriving for a reservation under review is recorded and the team is alerted', function () {
    $teacher = lifecycleTeacher();
    $reservation = TrialReservation::factory()->create(['status' => TrialReservationStatus::PaymentReview, 'stripe_session_id' => null]);

    app(ApplyTrialPayment::class)->handle(paidSession($reservation), 'checkout.session.completed');

    expect($reservation->fresh())
        ->status->toBe(TrialReservationStatus::PaymentReview)
        ->paid_at->not->toBeNull()
        ->stripe_session_id->toBe('cs_test_paid');
    Notification::assertSentTo($teacher, TrialPaymentAlert::class);
});

test('payment events from the other Stripe mode are ignored', function () {
    $reservation = TrialReservation::factory()->create();

    app(ApplyTrialPayment::class)->handle([...paidSession($reservation), 'livemode' => true], 'checkout.session.completed');

    expect($reservation->fresh()->status)->toBe(TrialReservationStatus::Pending);
});

test('live Stripe keys are only accepted once test mode is turned off', function () {
    config(['payments.providers.stripe.secret_key' => 'sk_live_123', 'payments.providers.stripe.webhook_secret' => 'whsec_123']);
    $gateway = app(TrialPaymentGateway::class);

    expect($gateway->ready())->toBeFalse();
    config(['trials.test_mode_only' => false]);
    expect($gateway->ready())->toBeTrue()
        ->and(TrialPaymentGateway::liveMode())->toBeTrue();
});

test('a failed refund or a dispute reported by Stripe alerts the team', function (string $type, array $object) {
    $teacher = lifecycleTeacher();
    $reservation = TrialReservation::factory()->create(['status' => TrialReservationStatus::Cancelled]);
    data_set($object, 'metadata.reservation_id', $reservation->id);

    event(new WebhookReceived('stripe', ['type' => $type, 'data' => ['object' => $object]]));

    Notification::assertSentTo($teacher, TrialPaymentAlert::class);
})->with([
    'failed refund' => ['refund.failed', ['id' => 're_test', 'status' => 'failed']],
    'dispute' => ['charge.dispute.created', ['id' => 'dp_test']],
]);

test('text typed by students is never turned into links in the team emails', function () {
    $reservation = TrialReservation::factory()->confirmed()->create(['goal' => 'Voir [mon dossier](https://evil.example)']);
    $reservation->user->update(['name' => '[Support](https://evil.example)']);

    $html = (string) (new TrialBookedForTeacher($reservation->fresh()))->toMail(lifecycleTeacher())->render();

    expect($html)->not->toContain('href="https://evil.example"')
        ->and($html)->toContain('mon dossier');
});

test('the team sees session dates in the school time zone, the student in their own', function () {
    $reservation = TrialReservation::factory()->confirmed(now()->addDays(2)->setTime(18, 0))->create(['timezone' => 'America/New_York']);
    $teacher = lifecycleTeacher();

    $teacherMail = (new TrialBookedForTeacher($reservation))->toMail($teacher);
    $studentMail = (new TrialBooked($reservation))->toMail($reservation->user);

    expect(implode(' ', $teacherMail->introLines))->toContain('(Europe/Paris)')
        ->and(implode(' ', $studentMail->introLines))->toContain('(America/New_York)');
});

test('the teaching team is reminded once to close a past session left open', function () {
    $teacher = lifecycleTeacher();
    $forgotten = TrialReservation::factory()->confirmed(now()->subHours(15))->create();
    $justEnded = TrialReservation::factory()->confirmed(now()->subHours(2))->create();

    $this->artisan('trials:send-reminders')->assertSuccessful();
    $this->artisan('trials:send-reminders')->assertSuccessful();

    Notification::assertSentToTimes($teacher, TrialOutcomeReminder::class, 1);
    expect($forgotten->fresh()->outcome_reminder_sent_at)->not->toBeNull()
        ->and($justEnded->fresh()->outcome_reminder_sent_at)->toBeNull();
});

test('the booking keeps a record of the accepted terms', function () {
    $slot = TrialSlot::factory()->create();
    $student = User::factory()->create();
    $student->assignRole('student');
    config(['idempotency.cache_store' => 'array']);

    $this->actingAs($student)->postJson(route('trial-reservations.store'), [
        'slot_id' => $slot->id, 'level' => 'a1', 'goal' => 'Préparer mon examen', 'timezone' => 'Europe/Paris', 'terms' => true,
    ], ['Idempotency-Key' => (string) Str::uuid()])->assertCreated();

    expect(TrialReservation::query()->sole())
        ->terms_accepted_at->not->toBeNull()
        ->terms_version->toBe(config('trials.terms_version'));
});

test('the legal pages are public', function (string $route, string $component) {
    $this->get(route($route))->assertOk()->assertInertia(fn (Assert $page) => $page->component($component));
})->with([
    ['legal.notice', 'home/legal/notice'],
    ['legal.terms', 'home/legal/terms'],
    ['legal.sales', 'home/legal/sales'],
    ['legal.privacy', 'home/legal/privacy'],
]);

test('a paid session whose end time has passed becomes ended, waiting to be closed', function () {
    $upcoming = TrialReservation::factory()->confirmed(now()->addDays(2))->create();
    $underWay = TrialReservation::factory()->confirmed(now()->subMinutes(30))->create();
    $over = TrialReservation::factory()->confirmed(now()->subMinutes(61))->create();

    $this->artisan('trials:end-sessions')->assertSuccessful();

    expect($upcoming->fresh()->status)->toBe(TrialReservationStatus::Confirmed)
        ->and($underWay->fresh()->status)->toBe(TrialReservationStatus::Confirmed)
        ->and($over->fresh()->status)->toBe(TrialReservationStatus::Ended);
});

test('a session under way stays confirmed, is flagged as started and can already be closed', function () {
    $reservation = TrialReservation::factory()->confirmed(now()->subMinutes(20))->create();

    $this->actingAs(lifecycleTeacher())->get(route('trial-management.show', $reservation))
        ->assertInertia(fn (Assert $page) => $page
            ->where('reservation.status', 'confirmed')
            ->where('reservation.has_started', true)
            ->where('reservation.has_ended', false)
            ->where('reservation.actions.record_outcome', true)
            ->where('reservation.actions.edit_meeting_link', true)
            ->where('reservation.actions.cancel', false));
});

test('opening the trial pages ends past sessions even if the scheduler is late, and they can then be closed', function () {
    $teacher = lifecycleTeacher();
    $reservation = TrialReservation::factory()->confirmed(now()->subHours(2))->create();

    $this->actingAs($teacher)->get(route('trial-management.show', $reservation))
        ->assertInertia(fn (Assert $page) => $page
            ->where('reservation.status', 'ended')
            ->where('reservation.actions.record_outcome', true)
            ->where('reservation.actions.edit_meeting_link', false));
    $this->get(route('dashboard'))->assertInertia(fn (Assert $page) => $page->where('management.overview.awaitingOutcome', 1));

    $this->put(route('trial-outcomes.update', $reservation), ['outcome' => 'completed'])->assertSessionHasNoErrors();
    expect($reservation->fresh()->status)->toBe(TrialReservationStatus::Completed);
});

test('once the session is over the student no longer gets the visio link', function () {
    $reservation = TrialReservation::factory()->confirmed(now()->subHours(2))->create(['meeting_url' => 'https://meet.example.com/a']);
    $reservation->user->assignRole('student');

    $this->actingAs($reservation->user)->get(route('trial-reservations.index'))
        ->assertInertia(fn (Assert $page) => $page
            ->where('bookedTrial.has_ended', true)
            ->missing('bookedTrial.meeting_url'));
});
