<?php

use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

test('timezone settings require authentication', function () {
    $this->put(route('user-timezone.update'), ['timezone' => 'Europe/Paris'])->assertRedirect(route('login'));
});

test('a user can save a timezone without modifying another account', function () {
    $user = User::factory()->create();
    $other = User::factory()->create(['timezone' => 'UTC']);

    $this->actingAs($user)->from(route('profile.edit'))->put(route('user-timezone.update'), ['timezone' => 'America/Montreal', 'user_id' => $other->id])->assertValid()->assertRedirect(route('profile.edit'));

    expect($user->fresh()->timezone)->toBe('America/Montreal');
    expect($other->fresh()->timezone)->toBe('UTC');
    $this->get(route('profile.edit'))->assertInertia(fn (Assert $page) => $page->where('auth.user.timezone', 'America/Montreal'));
});

test('a user can clear the saved timezone to follow the browser', function (?string $timezone) {
    $user = User::factory()->create(['timezone' => 'Europe/Paris']);

    $this->actingAs($user)->put(route('user-timezone.update'), ['timezone' => $timezone])->assertRedirect();

    expect($user->fresh()->timezone)->toBeNull();
})->with([null, '']);

test('invalid timezone settings do not change the profile', function (array $payload) {
    $user = User::factory()->create(['timezone' => 'Europe/Paris']);

    $this->actingAs($user)->put(route('user-timezone.update'), $payload)->assertInvalid(['timezone']);

    expect($user->fresh()->timezone)->toBe('Europe/Paris');
})->with([
    'missing field' => [[]],
    'unknown zone' => [['timezone' => 'Mars/Olympus']],
    'array value' => [['timezone' => ['UTC']]],
]);

test('public selection accepts a valid carried timezone and discards invalid query values', function () {
    $this->get(route('trial-reservations.create', ['timezone' => 'Africa/Douala']))
        ->assertInertia(fn (Assert $page) => $page->where('selectedTimezone', 'Africa/Douala'));
    $this->get(route('trial-reservations.create', ['timezone' => 'Mars/Olympus']))
        ->assertInertia(fn (Assert $page) => $page->where('selectedTimezone', null));
});
