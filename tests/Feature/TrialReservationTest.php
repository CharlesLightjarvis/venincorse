<?php

use App\Enums\TrialReservationStatus;
use App\Models\TrialReservation;
use App\Models\TrialSlot;
use App\Models\TrialSlotHold;
use App\Models\User;
use App\Services\TrialPaymentGateway;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Inertia\Testing\AssertableInertia as Assert;
use KenDeNigerian\PayZephyr\DataObjects\ChargeResponseDTO;
use KenDeNigerian\PayZephyr\Events\WebhookReceived;
use Stripe\Exception\ApiConnectionException;

beforeEach(function () {
    $this->seed(RolesAndPermissionsSeeder::class);
    config(['idempotency.cache_store' => 'array']);
});

function trialStudent(): User
{
    $user = User::factory()->create();
    $user->assignRole('student');

    return $user;
}

function trialPayload(TrialSlot $slot): array
{
    return ['slot_id' => $slot->id, 'level' => 'a1', 'goal' => 'Préparer mon examen', 'timezone' => 'Europe/Paris', 'terms' => true];
}

function trialSession(TrialReservation $reservation, array $overrides = []): array
{
    return array_replace([
        'id' => 'cs_test_trial', 'livemode' => false, 'client_reference_id' => $reservation->id,
        'metadata' => ['reservation_id' => $reservation->id], 'amount_total' => 3900,
        'currency' => 'eur', 'status' => 'complete', 'payment_status' => 'paid',
    ], $overrides);
}

test('public selection is available and authentication retains the chosen slot', function () {
    $slot = TrialSlot::factory()->create();

    $this->get(route('trial-reservations.create'))->assertOk();
    $this->get(route('trial-reservations.prepare', ['slot' => $slot->id]))
        ->assertRedirect(route('login'))
        ->assertSessionHas('url.intended', route('trial-reservations.prepare', ['slot' => $slot->id]));
});

test('reservation requires authentication verification and permission', function () {
    $this->postJson(route('trial-reservations.store'))->assertUnauthorized();
    $user = User::factory()->unverified()->create();
    $user->assignRole('student');
    $this->actingAs($user)->postJson(route('trial-reservations.store'))->assertForbidden();
    $this->actingAs(User::factory()->create())->postJson(route('trial-reservations.store'))->assertForbidden();
    $this->assertDatabaseCount('trial_reservations', 0);
});

test('reservation validates the input and requires an idempotency key', function () {
    $this->actingAs(trialStudent())->postJson(route('trial-reservations.store'))->assertBadRequest();
    $this->postJson(route('trial-reservations.store'), [], ['Idempotency-Key' => (string) Str::uuid()])
        ->assertInvalid(['slot_id', 'level', 'goal', 'timezone', 'terms']);
    $this->assertDatabaseCount('trial_reservations', 0);
});

test('a validation error does not prevent correcting a submission with the same key', function () {
    $slot = TrialSlot::factory()->create();
    $headers = ['Idempotency-Key' => (string) Str::uuid()];
    $this->actingAs(trialStudent())->postJson(route('trial-reservations.store'), array_replace(trialPayload($slot), ['goal' => '']), $headers)->assertInvalid(['goal']);

    $this->postJson(route('trial-reservations.store'), trialPayload($slot), $headers)->assertCreated();

    $this->assertDatabaseCount('trial_reservations', 1);
});

test('reservation is durable and replayed without duplication even after cache eviction', function () {
    $student = trialStudent();
    $slot = TrialSlot::factory()->create();
    $headers = ['Idempotency-Key' => (string) Str::uuid()];
    $this->actingAs($student);
    $first = $this->postJson(route('trial-reservations.store'), trialPayload($slot), $headers)->assertCreated();
    Cache::store('array')->flush();

    $this->postJson(route('trial-reservations.store'), trialPayload($slot), $headers)
        ->assertCreated()->assertJsonPath('reservation_id', $first->json('reservation_id'));
    $this->assertDatabaseCount('trial_reservations', 1);
    $this->assertDatabaseHas('trial_slot_holds', ['trial_slot_id' => $slot->id, 'trial_reservation_id' => $first->json('reservation_id')]);
    $this->assertDatabaseHas('trial_reservations', ['user_id' => $student->id, 'amount_cents' => 3900, 'currency' => 'EUR', 'status' => 'pending']);
});

test('reloading before payment reuses the student own pending reservation for the slot', function () {
    $this->freezeTime();
    $student = trialStudent();
    $slot = TrialSlot::factory()->create();
    $this->actingAs($student);
    $first = $this->postJson(route('trial-reservations.store'), trialPayload($slot), ['Idempotency-Key' => (string) Str::uuid()])->assertCreated();
    $this->travel(20)->minutes();

    $this->postJson(route('trial-reservations.store'), array_replace(trialPayload($slot), ['goal' => 'Objectif corrigé']), ['Idempotency-Key' => (string) Str::uuid()])
        ->assertCreated()->assertJsonPath('reservation_id', $first->json('reservation_id'));

    $this->assertDatabaseCount('trial_reservations', 1);
    $reservation = TrialReservation::query()->findOrFail($first->json('reservation_id'));
    expect($reservation->goal)->toBe('Objectif corrigé');
    expect($reservation->expires_at->timestamp)->toBe(now()->addMinutes(45)->timestamp);
});

test('a started checkout is reused as is when the student submits the slot again', function () {
    $student = trialStudent();
    $reservation = TrialReservation::factory()->create(['user_id' => $student->id, 'goal' => 'Objectif initial', 'checkout_started_at' => now()]);
    TrialSlotHold::query()->create(['trial_slot_id' => $reservation->trial_slot_id, 'trial_reservation_id' => $reservation->id]);

    $this->actingAs($student)->postJson(route('trial-reservations.store'), array_replace(trialPayload($reservation->slot), ['goal' => 'Autre objectif']), ['Idempotency-Key' => (string) Str::uuid()])
        ->assertCreated()->assertJsonPath('reservation_id', $reservation->id);

    expect($reservation->fresh()->goal)->toBe('Objectif initial');
});

test('the tunnel exposes payment availability so it never reserves without a usable payment', function (?string $secretKey, ?string $webhookSecret, bool $ready) {
    config([
        'payments.providers.stripe.secret_key' => $secretKey,
        'payments.providers.stripe.webhook_secret' => $webhookSecret,
    ]);

    $this->get(route('trial-reservations.create'))
        ->assertInertia(fn (Assert $page) => $page->where('paymentReady', $ready)->has('checkoutKey'));
})->with([
    'not configured' => [null, null, false],
    'missing webhook secret' => ['sk_test_placeholder', null, false],
    'live key refused' => ['sk_live_placeholder', 'whsec_placeholder', false],
    'test mode configured' => ['rk_test_placeholder', 'whsec_placeholder', true],
]);

test('the tunnel shows the student own active payment and ignores expired or foreign ones', function () {
    $this->freezeTime();
    $student = trialStudent();
    $pending = TrialReservation::factory()->create(['user_id' => $student->id]);
    TrialReservation::factory()->create(['user_id' => $student->id, 'expires_at' => now()->subMinute()]);
    TrialReservation::factory()->create(['status' => TrialReservationStatus::Confirmed]);

    $this->actingAs($student)->get(route('trial-reservations.create'))
        ->assertInertia(fn (Assert $page) => $page
            ->where('pendingPayment.id', $pending->id)
            ->where('bookedTrial', null));
});

test('the tunnel shows the booked trial instead of a new booking', function (TrialReservationStatus $status) {
    $student = trialStudent();
    $trial = TrialReservation::factory()->create(['user_id' => $student->id, 'status' => $status]);

    $this->actingAs($student)->get(route('trial-reservations.create'))
        ->assertInertia(fn (Assert $page) => $page->where('bookedTrial.id', $trial->id)->where('bookedTrial.status', $status->value));
})->with([TrialReservationStatus::Confirmed, TrialReservationStatus::Processing, TrialReservationStatus::PaymentReview]);

test('guests see neither a booked trial nor a pending payment', function () {
    TrialReservation::factory()->create();

    $this->get(route('trial-reservations.create'))
        ->assertInertia(fn (Assert $page) => $page->where('bookedTrial', null)->where('pendingPayment', null));
});

test('a student who already booked a trial cannot book another one', function (TrialReservationStatus $status) {
    $student = trialStudent();
    TrialReservation::factory()->create(['user_id' => $student->id, 'status' => $status]);
    $slot = TrialSlot::factory()->create(['starts_at' => now()->addDays(4)->startOfHour()]);

    $this->actingAs($student)->postJson(route('trial-reservations.store'), trialPayload($slot), ['Idempotency-Key' => (string) Str::uuid()])
        ->assertInvalid(['slot_id' => 'Tu as déjà réservé ton cours d’essai. Retrouve-le dans ton espace.']);

    $this->assertDatabaseCount('trial_reservations', 1);
    $this->assertDatabaseMissing('trial_slot_holds', ['trial_slot_id' => $slot->id]);
})->with([TrialReservationStatus::Confirmed, TrialReservationStatus::Processing, TrialReservationStatus::PaymentReview]);

test('an expired or refunded attempt does not prevent booking the trial', function (TrialReservationStatus $status) {
    $student = trialStudent();
    TrialReservation::factory()->create(['user_id' => $student->id, 'status' => $status]);
    $slot = TrialSlot::factory()->create(['starts_at' => now()->addDays(4)->startOfHour()]);

    $this->actingAs($student)->postJson(route('trial-reservations.store'), trialPayload($slot), ['Idempotency-Key' => (string) Str::uuid()])
        ->assertCreated();
})->with([TrialReservationStatus::Expired, TrialReservationStatus::Refunded]);

test('choosing another slot cancels the previous unpaid attempt and frees its slot', function () {
    $student = trialStudent();
    $previous = TrialReservation::factory()->create(['user_id' => $student->id]);
    TrialSlotHold::query()->create(['trial_slot_id' => $previous->trial_slot_id, 'trial_reservation_id' => $previous->id]);
    $slot = TrialSlot::factory()->create(['starts_at' => now()->addDays(4)->startOfHour()]);

    $response = $this->actingAs($student)->postJson(route('trial-reservations.store'), trialPayload($slot), ['Idempotency-Key' => (string) Str::uuid()])
        ->assertCreated();

    expect($previous->fresh()->status)->toBe(TrialReservationStatus::Expired);
    $this->assertDatabaseMissing('trial_slot_holds', ['trial_slot_id' => $previous->trial_slot_id]);
    $this->assertDatabaseHas('trial_slot_holds', ['trial_slot_id' => $slot->id, 'trial_reservation_id' => $response->json('reservation_id')]);
});

test('choosing another slot closes the previous Stripe session before freeing its slot', function () {
    $student = trialStudent();
    $previous = TrialReservation::factory()->create(['user_id' => $student->id, 'checkout_started_at' => now(), 'stripe_session_id' => 'cs_test_trial']);
    TrialSlotHold::query()->create(['trial_slot_id' => $previous->trial_slot_id, 'trial_reservation_id' => $previous->id]);
    $slot = TrialSlot::factory()->create(['starts_at' => now()->addDays(4)->startOfHour()]);
    $gateway = $this->mock(TrialPaymentGateway::class);
    $gateway->shouldReceive('ready')->andReturnTrue();
    $gateway->shouldReceive('expireSession')->once()->with('cs_test_trial')
        ->andReturn(trialSession($previous, ['status' => 'expired', 'payment_status' => 'unpaid']));

    $this->actingAs($student)->postJson(route('trial-reservations.store'), trialPayload($slot), ['Idempotency-Key' => (string) Str::uuid()])
        ->assertCreated();

    expect($previous->fresh()->status)->toBe(TrialReservationStatus::Expired);
    $this->assertDatabaseMissing('trial_slot_holds', ['trial_slot_id' => $previous->trial_slot_id]);
});

test('a previous attempt paid in the meantime is confirmed and blocks a second trial', function () {
    $student = trialStudent();
    $previous = TrialReservation::factory()->create(['user_id' => $student->id, 'checkout_started_at' => now(), 'stripe_session_id' => 'cs_test_trial']);
    TrialSlotHold::query()->create(['trial_slot_id' => $previous->trial_slot_id, 'trial_reservation_id' => $previous->id]);
    $slot = TrialSlot::factory()->create(['starts_at' => now()->addDays(4)->startOfHour()]);
    $gateway = $this->mock(TrialPaymentGateway::class);
    $gateway->shouldReceive('ready')->andReturnTrue();
    $gateway->shouldReceive('expireSession')->once()->andReturn(trialSession($previous));

    $this->actingAs($student)->postJson(route('trial-reservations.store'), trialPayload($slot), ['Idempotency-Key' => (string) Str::uuid()])
        ->assertInvalid(['slot_id' => 'Tu as déjà réservé ton cours d’essai. Retrouve-le dans ton espace.']);

    expect($previous->fresh()->status)->toBe(TrialReservationStatus::Confirmed);
    $this->assertDatabaseCount('trial_reservations', 1);
});

test('a previous attempt cannot be cancelled when Stripe is unreachable', function () {
    $student = trialStudent();
    $previous = TrialReservation::factory()->create(['user_id' => $student->id, 'checkout_started_at' => now(), 'stripe_session_id' => 'cs_test_trial']);
    TrialSlotHold::query()->create(['trial_slot_id' => $previous->trial_slot_id, 'trial_reservation_id' => $previous->id]);
    $slot = TrialSlot::factory()->create(['starts_at' => now()->addDays(4)->startOfHour()]);
    $gateway = $this->mock(TrialPaymentGateway::class);
    $gateway->shouldReceive('ready')->andReturnTrue();
    $gateway->shouldReceive('expireSession')->once()->andThrow(new ApiConnectionException('Network'));

    $this->actingAs($student)->postJson(route('trial-reservations.store'), trialPayload($slot), ['Idempotency-Key' => (string) Str::uuid()])
        ->assertInvalid(['slot_id' => 'Impossible d’annuler ta tentative de paiement précédente. Réessaie dans quelques instants.']);

    expect($previous->fresh()->status)->toBe(TrialReservationStatus::Pending);
    $this->assertDatabaseCount('trial_reservations', 1);
});

test('a late payment is confirmed when its released slot is still free', function () {
    $reservation = TrialReservation::factory()->create(['status' => TrialReservationStatus::Expired]);

    event(new WebhookReceived('stripe', ['type' => 'checkout.session.completed', 'data' => ['object' => trialSession($reservation)]]));

    expect($reservation->fresh()->status)->toBe(TrialReservationStatus::Confirmed);
    $this->assertDatabaseHas('trial_slot_holds', ['trial_slot_id' => $reservation->trial_slot_id, 'trial_reservation_id' => $reservation->id]);
});

test('a late payment for a slot given to someone else is refunded', function () {
    $reservation = TrialReservation::factory()->create(['status' => TrialReservationStatus::Expired]);
    $other = TrialReservation::factory()->create(['trial_slot_id' => $reservation->trial_slot_id, 'status' => TrialReservationStatus::Confirmed]);
    TrialSlotHold::query()->create(['trial_slot_id' => $reservation->trial_slot_id, 'trial_reservation_id' => $other->id]);
    $gateway = $this->mock(TrialPaymentGateway::class);
    $gateway->shouldReceive('ready')->andReturnTrue();
    $gateway->shouldReceive('refund')->once()->with(Mockery::on(fn (TrialReservation $refunded): bool => $refunded->is($reservation)), 'pi_test_trial');

    event(new WebhookReceived('stripe', ['type' => 'checkout.session.completed', 'data' => ['object' => trialSession($reservation, ['payment_intent' => 'pi_test_trial'])]]));

    expect($reservation->fresh()->status)->toBe(TrialReservationStatus::Refunded);
    $this->assertDatabaseHas('trial_slot_holds', ['trial_slot_id' => $reservation->trial_slot_id, 'trial_reservation_id' => $other->id]);
});

test('a failed refund stays visible for manual review', function () {
    $reservation = TrialReservation::factory()->create(['status' => TrialReservationStatus::Expired]);
    $other = TrialReservation::factory()->create(['trial_slot_id' => $reservation->trial_slot_id, 'status' => TrialReservationStatus::Confirmed]);
    TrialSlotHold::query()->create(['trial_slot_id' => $reservation->trial_slot_id, 'trial_reservation_id' => $other->id]);
    $gateway = $this->mock(TrialPaymentGateway::class);
    $gateway->shouldReceive('ready')->andReturnTrue();
    $gateway->shouldReceive('refund')->once()->andThrow(new ApiConnectionException('Network'));

    event(new WebhookReceived('stripe', ['type' => 'checkout.session.completed', 'data' => ['object' => trialSession($reservation, ['payment_intent' => 'pi_test_trial'])]]));

    expect($reservation->fresh()->status)->toBe(TrialReservationStatus::PaymentReview);
});

test('my trial page separates the booked trial, the payment to finish and the history', function () {
    $student = trialStudent();
    $confirmed = TrialReservation::factory()->create(['user_id' => $student->id, 'status' => TrialReservationStatus::Confirmed]);
    $expired = TrialReservation::factory()->create(['user_id' => $student->id, 'status' => TrialReservationStatus::Expired]);
    TrialReservation::factory()->create(['status' => TrialReservationStatus::Expired]);

    $this->actingAs($student)->get(route('trial-reservations.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('trials/index')
            ->where('bookedTrial.id', $confirmed->id)
            ->where('pendingPayment', null)
            ->has('history', 1)
            ->where('history.0.id', $expired->id));
});

test('my trial page offers to finish an active payment', function () {
    $student = trialStudent();
    $pending = TrialReservation::factory()->create(['user_id' => $student->id]);

    $this->actingAs($student)->get(route('trial-reservations.index'))
        ->assertInertia(fn (Assert $page) => $page
            ->where('bookedTrial', null)
            ->where('pendingPayment.id', $pending->id)
            ->has('history', 0));
});

test('my trial page requires authentication and the permission to view own trials', function () {
    $this->get(route('trial-reservations.index'))->assertRedirect(route('login'));

    $this->actingAs(User::factory()->create())->get(route('trial-reservations.index'))->assertForbidden();
});

test('the dashboard lists only the student own reservations with an overview', function () {
    $this->freezeTime();
    $student = trialStudent();
    TrialReservation::factory()->create(['user_id' => $student->id, 'status' => TrialReservationStatus::Confirmed]);
    TrialReservation::factory()->create(['user_id' => $student->id]);
    TrialReservation::factory()->create(['user_id' => $student->id, 'expires_at' => now()->subMinute()]);
    TrialReservation::factory()->create(['user_id' => $student->id, 'status' => TrialReservationStatus::Refunded, 'paid_at' => now()]);
    TrialReservation::factory()->create(['status' => TrialReservationStatus::Confirmed]);

    $this->actingAs($student)->get(route('dashboard'))
        ->assertInertia(fn (Assert $page) => $page
            ->component('dashboard')
            ->has('student.reservations', 4)
            ->where('student.overview.confirmed', 1)
            ->where('student.overview.pending', 1)
            ->where('student.overview.paidCents', 3900)
            ->where('management', null));
});

test('the dashboard shows the management overview to trial managers without student content', function () {
    $this->freezeTime();
    $admin = User::factory()->create();
    $admin->assignRole('administrator');
    $upcoming = TrialReservation::factory()->create(['status' => TrialReservationStatus::Confirmed, 'paid_at' => now()]);
    TrialReservation::factory()->create(['status' => TrialReservationStatus::PaymentReview]);
    TrialReservation::factory()->create([
        'status' => TrialReservationStatus::Confirmed,
        'paid_at' => now(),
        'trial_slot_id' => TrialSlot::factory()->create(['starts_at' => now()->subDay()])->id,
    ]);

    $this->actingAs($admin)->get(route('dashboard'))
        ->assertInertia(fn (Assert $page) => $page
            ->component('dashboard')
            ->where('student', null)
            ->has('management.upcoming', 1)
            ->where('management.upcoming.0.id', $upcoming->id)
            ->where('management.overview.upcoming', 1)
            ->where('management.overview.paymentReview', 1)
            ->where('management.overview.monthRevenueCents', 7800)
            ->where('canManageAvailability', true));
});

test('trial managers cannot book a trial for themselves', function () {
    $admin = User::factory()->create();
    $admin->assignRole('administrator');
    $slot = TrialSlot::factory()->create();

    $this->actingAs($admin)->get(route('trial-reservations.index'))->assertForbidden();
    $this->postJson(route('trial-reservations.store'), trialPayload($slot), ['Idempotency-Key' => (string) Str::uuid()])->assertForbidden();
    $this->assertDatabaseCount('trial_reservations', 0);
});

test('the meeting link must be a secure address and is shown to the student only once confirmed', function () {
    $manager = User::factory()->create();
    $manager->givePermissionTo(['trial-reservations.view-all', 'trial-reservations.update']);
    $student = trialStudent();
    $reservation = TrialReservation::factory()->create(['user_id' => $student->id]);

    $this->actingAs($manager)->patch(route('trial-management.update', $reservation), ['meeting_url' => 'http://meet.example.com/abc'])
        ->assertInvalid(['meeting_url' => 'Le lien de la visio doit être une adresse sécurisée commençant par https://.']);
    $this->patch(route('trial-management.update', $reservation), ['meeting_url' => 'https://meet.example.com/abc'])->assertRedirect();
    expect($reservation->fresh()->meeting_url)->toBe('https://meet.example.com/abc');

    $this->actingAs($student)->get(route('trial-reservations.show', $reservation))
        ->assertInertia(fn (Assert $page) => $page->missing('reservation.meeting_url'));
    $reservation->update(['status' => TrialReservationStatus::Confirmed, 'paid_at' => now()]);
    $this->get(route('trial-reservations.show', $reservation))
        ->assertInertia(fn (Assert $page) => $page->where('reservation.meeting_url', 'https://meet.example.com/abc'));
});

test('an objective without real words is refused', function (string $goal) {
    $slot = TrialSlot::factory()->create();

    $this->actingAs(trialStudent())
        ->postJson(route('trial-reservations.store'), array_replace(trialPayload($slot), ['goal' => $goal]), ['Idempotency-Key' => (string) Str::uuid()])
        ->assertInvalid(['goal' => 'Décris ton objectif en quelques mots (5 à 2 000 caractères).']);

    $this->assertDatabaseCount('trial_reservations', 0);
})->with([',,,,,', '12345', '  !! ?  ']);

test('another user cannot replay a cached reservation or reserve an occupied slot', function () {
    $slot = TrialSlot::factory()->create();
    $headers = ['Idempotency-Key' => (string) Str::uuid()];
    $this->actingAs(trialStudent())->postJson(route('trial-reservations.store'), trialPayload($slot), $headers)->assertCreated();

    $this->actingAs(trialStudent())->postJson(route('trial-reservations.store'), trialPayload($slot), $headers)
        ->assertInvalid(['slot_id' => 'Ce créneau n’est plus disponible. Choisis un autre horaire.']);
    $this->assertDatabaseCount('trial_reservations', 1);
});

test('changed payload cannot reuse a durable submission key', function () {
    $slot = TrialSlot::factory()->create();
    $headers = ['Idempotency-Key' => (string) Str::uuid()];
    $this->actingAs(trialStudent())->postJson(route('trial-reservations.store'), trialPayload($slot), $headers)->assertCreated();
    Cache::store('array')->flush();

    $this->postJson(route('trial-reservations.store'), array_replace(trialPayload($slot), ['goal' => 'Un autre objectif']), $headers)->assertConflict();
    $this->assertDatabaseCount('trial_reservations', 1);
});

test('students cannot access other reservations or private notes', function () {
    $student = trialStudent();
    $reservation = TrialReservation::factory()->create(['user_id' => $student->id, 'notes' => 'Confidentiel']);
    $this->actingAs($student)->get(route('trial-reservations.show', $reservation))->assertOk()
        ->assertInertia(fn (Assert $page) => $page->component('trials/show')->missing('reservation.notes'));

    $this->actingAs(trialStudent())->get(route('trial-reservations.show', $reservation))->assertNotFound();
    $this->postJson(route('trial-checkout.store', $reservation), [], ['Idempotency-Key' => (string) Str::uuid()])->assertNotFound();
    $this->patch(route('trial-management.update', $reservation), ['notes' => 'Changed'])->assertForbidden();
    $this->get(route('trial-management.index'))->assertForbidden();
    expect($reservation->fresh()->notes)->toBe('Confidentiel');
});

test('direct management permissions allow private note updates without an administrator role', function () {
    $user = User::factory()->create();
    $user->givePermissionTo(['trial-reservations.view-all', 'trial-reservations.update']);
    $reservation = TrialReservation::factory()->create();

    $this->actingAs($user)->get(route('trial-management.index'))->assertOk();
    $this->patch(route('trial-management.update', $reservation), ['notes' => 'Préparer le niveau A1'])->assertRedirect();
    expect($reservation->fresh()->notes)->toBe('Préparer le niveau A1');
});

test('payment events confirm only matching paid test sessions and ignore repeated or older events', function () {
    $reservation = TrialReservation::factory()->create();
    TrialSlotHold::query()->create(['trial_slot_id' => $reservation->trial_slot_id, 'trial_reservation_id' => $reservation->id]);
    $session = trialSession($reservation);

    foreach (['checkout.session.completed', 'checkout.session.completed', 'checkout.session.expired'] as $type) {
        event(new WebhookReceived('stripe', ['type' => $type, 'data' => ['object' => $session]]));
    }

    expect($reservation->fresh()->status)->toBe(TrialReservationStatus::Confirmed);
    $this->assertDatabaseCount('trial_slot_holds', 1);
});

test('delayed payment remains reserved until asynchronous success', function () {
    $reservation = TrialReservation::factory()->create();
    TrialSlotHold::query()->create(['trial_slot_id' => $reservation->trial_slot_id, 'trial_reservation_id' => $reservation->id]);
    event(new WebhookReceived('stripe', ['type' => 'checkout.session.completed', 'data' => ['object' => trialSession($reservation, ['payment_status' => 'unpaid'])]]));
    expect($reservation->fresh()->status)->toBe(TrialReservationStatus::Processing);

    event(new WebhookReceived('stripe', ['type' => 'checkout.session.async_payment_succeeded', 'data' => ['object' => trialSession($reservation)]]));

    expect($reservation->fresh()->status)->toBe(TrialReservationStatus::Confirmed);
    $this->assertDatabaseCount('trial_slot_holds', 1);
});

test('wrong amounts require review and never release a held slot', function () {
    $reservation = TrialReservation::factory()->create();
    TrialSlotHold::query()->create(['trial_slot_id' => $reservation->trial_slot_id, 'trial_reservation_id' => $reservation->id]);

    event(new WebhookReceived('stripe', ['type' => 'checkout.session.completed', 'data' => ['object' => trialSession($reservation, ['amount_total' => 1])]]));

    expect($reservation->fresh()->status)->toBe(TrialReservationStatus::PaymentReview);
    $this->assertDatabaseCount('trial_slot_holds', 1);
});

test('local expiration releases only reservations whose checkout never started', function () {
    $this->freezeTime();
    $reservation = TrialReservation::factory()->create(['expires_at' => now()->subMinute()]);
    TrialSlotHold::query()->create(['trial_slot_id' => $reservation->trial_slot_id, 'trial_reservation_id' => $reservation->id]);

    $this->artisan('trials:expire-reservations')->assertSuccessful();

    expect($reservation->fresh()->status)->toBe(TrialReservationStatus::Expired);
    $this->assertDatabaseCount('trial_slot_holds', 0);
});

test('checkout reuses its persisted session across different HTTP keys', function () {
    $this->freezeTime();
    $student = trialStudent();
    $reservation = TrialReservation::factory()->create(['user_id' => $student->id]);
    $gateway = $this->mock(TrialPaymentGateway::class);
    $gateway->shouldReceive('ready')->andReturnTrue();
    $gateway->shouldReceive('create')->once()->andReturn(new ChargeResponseDTO(
        reference: $reservation->id, authorizationUrl: 'https://checkout.stripe.com/c/pay/test', accessCode: 'cs_test_trial', status: 'pending',
    ));
    $gateway->shouldReceive('session')->once()->with('cs_test_trial')
        ->andReturn(trialSession($reservation, ['status' => 'open', 'payment_status' => 'unpaid']));

    $this->actingAs($student);
    foreach (range(1, 2) as $attempt) {
        $this->postJson(route('trial-checkout.store', $reservation), [], ['Idempotency-Key' => (string) Str::uuid()])
            ->assertOk()->assertJsonPath('checkout_url', 'https://checkout.stripe.com/c/pay/test');
    }

    $this->assertDatabaseHas('trial_reservations', ['id' => $reservation->id, 'stripe_session_id' => 'cs_test_trial', 'status' => 'pending']);
});

test('returning to the reservation confirms a payment whose webhook never arrived', function () {
    $student = trialStudent();
    $reservation = TrialReservation::factory()->create(['user_id' => $student->id, 'checkout_started_at' => now(), 'stripe_session_id' => 'cs_test_trial', 'checkout_url' => 'https://checkout.stripe.com/c/pay/test']);
    TrialSlotHold::query()->create(['trial_slot_id' => $reservation->trial_slot_id, 'trial_reservation_id' => $reservation->id]);
    $gateway = $this->mock(TrialPaymentGateway::class);
    $gateway->shouldReceive('ready')->andReturnTrue();
    $gateway->shouldReceive('session')->once()->with('cs_test_trial')->andReturn(trialSession($reservation));

    $this->actingAs($student)->get(route('trial-reservations.show', $reservation))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->where('reservation.status', 'confirmed')->where('reservation.can_checkout', false));

    expect($reservation->fresh()->paid_at)->not->toBeNull();
});

test('paying again for a session already paid at Stripe never reopens Stripe', function () {
    $student = trialStudent();
    $reservation = TrialReservation::factory()->create(['user_id' => $student->id, 'checkout_started_at' => now(), 'stripe_session_id' => 'cs_test_trial', 'checkout_url' => 'https://checkout.stripe.com/c/pay/test']);
    TrialSlotHold::query()->create(['trial_slot_id' => $reservation->trial_slot_id, 'trial_reservation_id' => $reservation->id]);
    $gateway = $this->mock(TrialPaymentGateway::class);
    $gateway->shouldReceive('ready')->andReturnTrue();
    $gateway->shouldReceive('session')->once()->andReturn(trialSession($reservation));
    $gateway->shouldNotReceive('create');

    $this->actingAs($student)->postJson(route('trial-checkout.store', $reservation), [], ['Idempotency-Key' => (string) Str::uuid()])
        ->assertInvalid(['payment' => 'Ce paiement est déjà terminé : ta réservation est confirmée. Aucun nouveau paiement n’est nécessaire.']);

    expect($reservation->fresh()->status)->toBe(TrialReservationStatus::Confirmed);
});

test('the scheduler confirms a started payment whose webhook was missed before its hold expires', function () {
    $reservation = TrialReservation::factory()->create(['checkout_started_at' => now()->subMinutes(10), 'stripe_session_id' => 'cs_test_trial']);
    TrialSlotHold::query()->create(['trial_slot_id' => $reservation->trial_slot_id, 'trial_reservation_id' => $reservation->id]);
    $gateway = $this->mock(TrialPaymentGateway::class);
    $gateway->shouldReceive('ready')->andReturnTrue();
    $gateway->shouldReceive('session')->once()->with('cs_test_trial')->andReturn(trialSession($reservation));

    $this->artisan('trials:expire-reservations')->assertSuccessful();

    expect($reservation->fresh()->status)->toBe(TrialReservationStatus::Confirmed);
});

test('a repeated request is replayed from the database cache without a server error', function () {
    config(['idempotency.cache_store' => 'database']);
    $slot = TrialSlot::factory()->create();
    $headers = ['Idempotency-Key' => (string) Str::uuid()];
    $this->actingAs(trialStudent());
    $first = $this->postJson(route('trial-reservations.store'), trialPayload($slot), $headers)->assertCreated();

    $this->postJson(route('trial-reservations.store'), trialPayload($slot), $headers)
        ->assertCreated()
        ->assertJsonPath('reservation_id', $first->json('reservation_id'));

    $this->assertDatabaseCount('trial_reservations', 1);
});

test('an ambiguous checkout outcome keeps the slot blocked for manual review', function () {
    $this->freezeTime();
    $reservation = TrialReservation::factory()->create(['expires_at' => now()->subMinute(), 'checkout_started_at' => now()->subMinutes(40)]);
    TrialSlotHold::query()->create(['trial_slot_id' => $reservation->trial_slot_id, 'trial_reservation_id' => $reservation->id]);

    $this->artisan('trials:expire-reservations')->assertSuccessful();

    expect($reservation->fresh()->status)->toBe(TrialReservationStatus::PaymentReview);
    $this->assertDatabaseCount('trial_slot_holds', 1);
});

test('signed webhook confirms payment while a forged webhook is refused', function () {
    config([
        'payments.providers.stripe.secret_key' => 'sk_test_placeholder',
        'payments.providers.stripe.webhook_secret' => 'whsec_test_placeholder',
        'queue.default' => 'sync',
        'payments.trace.enabled' => false,
    ]);
    $this->app->instance('payments.config', config('payments'));
    config(['database.connections.testing' => config('database.connections.'.config('database.default'))]);
    DB::connection('testing')->setPdo(DB::connection()->getPdo());
    $reservation = TrialReservation::factory()->create();
    TrialSlotHold::query()->create(['trial_slot_id' => $reservation->trial_slot_id, 'trial_reservation_id' => $reservation->id]);
    $payload = json_encode(['id' => 'evt_test_trial', 'object' => 'event', 'type' => 'checkout.session.completed', 'data' => ['object' => trialSession($reservation)]], JSON_THROW_ON_ERROR);
    $timestamp = time();
    $signature = hash_hmac('sha256', $timestamp.'.'.$payload, 'whsec_test_placeholder');

    $this->call('POST', '/payments/webhook/stripe', [], [], [], ['CONTENT_TYPE' => 'application/json', 'HTTP_ACCEPT' => 'application/json', 'HTTP_STRIPE_SIGNATURE' => 't='.$timestamp.',v1=forged'], $payload)->assertForbidden();
    expect($reservation->fresh()->status)->toBe(TrialReservationStatus::Pending);
    $this->call('POST', '/payments/webhook/stripe', [], [], [], ['CONTENT_TYPE' => 'application/json', 'HTTP_ACCEPT' => 'application/json', 'HTTP_STRIPE_SIGNATURE' => 't='.$timestamp.',v1='.$signature], $payload)->assertSuccessful();

    expect($reservation->fresh()->status)->toBe(TrialReservationStatus::Confirmed);
});

test('unrelated or live payment sessions cannot confirm a reservation', function (array $overrides) {
    $reservation = TrialReservation::factory()->create();
    TrialSlotHold::query()->create(['trial_slot_id' => $reservation->trial_slot_id, 'trial_reservation_id' => $reservation->id]);

    event(new WebhookReceived('stripe', ['type' => 'checkout.session.completed', 'data' => ['object' => trialSession($reservation, $overrides)]]));

    expect($reservation->fresh()->status)->toBe(TrialReservationStatus::Pending);
    $this->assertDatabaseCount('trial_slot_holds', 1);
})->with([
    'live mode' => [['livemode' => true]],
    'wrong reference' => [['client_reference_id' => 'unrelated']],
    'missing metadata' => [['metadata' => []]],
]);

test('asynchronous failure releases a slot and an older completion does not reopen payment', function () {
    $reservation = TrialReservation::factory()->create(['status' => TrialReservationStatus::Processing]);
    TrialSlotHold::query()->create(['trial_slot_id' => $reservation->trial_slot_id, 'trial_reservation_id' => $reservation->id]);
    $session = trialSession($reservation, ['payment_status' => 'unpaid']);

    foreach (['checkout.session.async_payment_failed', 'checkout.session.completed'] as $type) {
        event(new WebhookReceived('stripe', ['type' => $type, 'data' => ['object' => $session]]));
    }

    expect($reservation->fresh()->status)->toBe(TrialReservationStatus::Expired);
    $this->assertDatabaseCount('trial_slot_holds', 0);
});
