<?php

use App\Enums\TrialReservationStatus;
use App\Models\TrialAvailability;
use App\Models\TrialReservation;
use App\Models\TrialSlot;
use App\Models\TrialSlotHold;
use App\Models\User;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Support\Carbon;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function () {
    $this->seed(RolesAndPermissionsSeeder::class);
    // Monday 2 November 2026, 08:00 UTC.
    $this->travelTo(Carbon::parse('2026-11-02 08:00:00', 'UTC'));
});

function availabilityManager(): User
{
    $user = User::factory()->create();
    $user->assignRole('administrator');

    return $user;
}

test('only users allowed to manage availability can see or change it', function () {
    $student = User::factory()->create();
    $student->assignRole('student');

    $this->get(route('trial-availability.edit'))->assertRedirect(route('login'));
    $this->actingAs($student)->get(route('trial-availability.edit'))->assertForbidden();
    $this->put(route('trial-availability.update'), ['weekdays' => [1], 'hours' => [9], 'closed_dates' => []])->assertForbidden();

    $this->actingAs(availabilityManager())->get(route('trial-availability.edit'))
        ->assertInertia(fn (Assert $page) => $page
            ->component('trials/availability')
            ->where('availability.weekdays', config('trials.weekdays'))
            ->where('availability.hours', config('trials.hours')));
});

test('saving the availability publishes matching slots and withdraws free ones outside the schedule', function () {
    $outside = TrialSlot::factory()->create(['starts_at' => '2026-11-05 14:00:00', 'is_published' => true]);

    $this->actingAs(availabilityManager())->put(route('trial-availability.update'), [
        'weekdays' => [3, 1],
        'hours' => [11, 9],
        'closed_dates' => ['2026-11-11'],
    ])->assertRedirect()->assertSessionHasNoErrors();

    $availability = TrialAvailability::current();
    expect($availability->weekdays)->toBe([1, 3])
        ->and($availability->hours)->toBe([9, 11])
        ->and($outside->fresh()->is_published)->toBeFalse();
    // 14-day window: Monday 2 Nov is within the 24 h notice and Wednesday 11 Nov is closed.
    // Hours are Paris time, stored in UTC (Paris is UTC+1 in November).
    expect(TrialSlot::query()->where('is_published', true)->orderBy('starts_at')->pluck('starts_at')->map->format('Y-m-d H:i')->all())
        ->toBe(['2026-11-04 08:00', '2026-11-04 10:00', '2026-11-09 08:00', '2026-11-09 10:00']);
});

test('slots keep their local hour across a daylight saving change', function () {
    // Wednesday 25 March 2026; Paris moves to summer time on Sunday 29 March.
    $this->travelTo(Carbon::parse('2026-03-25 08:00:00', 'UTC'));

    $this->actingAs(availabilityManager())->put(route('trial-availability.update'), [
        'weekdays' => [1, 4], 'hours' => [9], 'closed_dates' => [],
    ])->assertSessionHasNoErrors();

    expect(TrialSlot::query()->where('is_published', true)->orderBy('starts_at')->limit(2)->pluck('starts_at')->map->format('Y-m-d H:i')->all())
        ->toBe(['2026-03-26 08:00', '2026-03-30 07:00']);
});

test('the teacher is warned when booked sessions fall outside the new schedule', function () {
    $reservation = TrialReservation::factory()->confirmed(Carbon::parse('2026-11-05 13:00:00', 'UTC'))->create();

    $this->actingAs(availabilityManager())->put(route('trial-availability.update'), [
        'weekdays' => [1], 'hours' => [9], 'closed_dates' => [],
    ])->assertSessionHasNoErrors()->assertInertiaFlash('toast.type', 'warning');

    $this->assertDatabaseHas('trial_slot_holds', ['trial_reservation_id' => $reservation->id]);
});

test('a reserved slot is kept even when it leaves the schedule', function () {
    $reservation = TrialReservation::factory()->create([
        'status' => TrialReservationStatus::Confirmed,
        'trial_slot_id' => TrialSlot::factory()->create(['starts_at' => '2026-11-05 14:00:00'])->id,
    ]);
    TrialSlotHold::query()->create(['trial_slot_id' => $reservation->trial_slot_id, 'trial_reservation_id' => $reservation->id]);

    $this->actingAs(availabilityManager())->put(route('trial-availability.update'), [
        'weekdays' => [1], 'hours' => [9], 'closed_dates' => [],
    ])->assertRedirect();

    expect($reservation->fresh()->trial_slot_id)->toBe($reservation->trial_slot_id)
        ->and($reservation->fresh()->status)->toBe(TrialReservationStatus::Confirmed);
    $this->assertDatabaseHas('trial_slot_holds', ['trial_reservation_id' => $reservation->id]);
});

test('invalid availability is refused with a clear message', function (array $payload, string $field, string $message) {
    $this->actingAs(availabilityManager())
        ->put(route('trial-availability.update'), array_replace(['weekdays' => [1], 'hours' => [9], 'closed_dates' => []], $payload))
        ->assertInvalid([$field => $message]);

    expect(TrialAvailability::query()->count())->toBeLessThanOrEqual(1)
        ->and(TrialAvailability::current()->hours)->toBe(config('trials.hours'));
})->with([
    'no day' => [['weekdays' => []], 'weekdays', 'Choisis au moins un jour ouvert.'],
    'hour outside the range' => [['hours' => [3]], 'hours.0', 'Choisis au moins une heure de début proposée.'],
    'sessions without a break' => [['hours' => [9, 10]], 'hours', 'Laisse au moins une heure de pause entre deux séances proposées : écarte les débuts d’au moins deux heures.'],
    'closed day in the past' => [['closed_dates' => ['2026-10-01']], 'closed_dates.0', 'Les journées d’absence doivent être des dates valides, à partir d’aujourd’hui.'],
]);
