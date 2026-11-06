<?php

use App\Models\User;
use Database\Seeders\RolesAndPermissionsSeeder;

test('guests are redirected to the login page', function () {
    $response = $this->get(route('dashboard'));
    $response->assertRedirect(route('login'));
});

test('authenticated users can visit the dashboard', function () {
    $this->seed(RolesAndPermissionsSeeder::class);
    $user = User::factory()->create();
    $user->assignRole('student');
    $this->actingAs($user);

    $response = $this->get(route('dashboard'));
    $response->assertOk();
});
