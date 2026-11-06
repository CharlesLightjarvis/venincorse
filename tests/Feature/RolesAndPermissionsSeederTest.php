<?php

use App\Enums\PermissionEnum;
use App\Enums\RoleEnum;
use App\Models\User;
use Database\Seeders\DemoUserSeeder;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;

test('roles are synchronized from the enums and existing accounts are never promoted', function () {
    $existing = User::factory()->create();
    $this->seed(RolesAndPermissionsSeeder::class);
    $this->seed(RolesAndPermissionsSeeder::class);

    $this->assertDatabaseCount('roles', 2);
    $this->assertDatabaseCount('permissions', count(PermissionEnum::cases()));
    expect($existing->fresh()->hasRole(RoleEnum::Student))->toBeTrue();
    expect($existing->fresh()->can(PermissionEnum::ViewAllTrials->value))->toBeFalse();
    foreach (RoleEnum::activeCases() as $roleEnum) {
        $role = Role::findByName($roleEnum->value, 'web');
        expect($role->permissions->pluck('name')->all())->toEqualCanonicalizing(array_map(fn (PermissionEnum $permission): string => $permission->value, $roleEnum->permissions()));
    }
});

test('demo seeding creates three verified accounts and is safe to rerun', function () {
    $this->seed(DemoUserSeeder::class);
    $this->seed(DemoUserSeeder::class);
    $admin = User::query()->where('email', 'admin@venincorse.test')->firstOrFail();

    $this->assertDatabaseCount('users', 3);
    expect($admin->hasVerifiedEmail())->toBeTrue();
    expect($admin->hasRole(RoleEnum::Administrator))->toBeTrue();
    expect(Hash::check('password', $admin->password))->toBeTrue();
    $this->actingAs($admin)->get(route('trial-management.index'))->assertOk();
    foreach (['student1@venincorse.test', 'student2@venincorse.test'] as $email) {
        $student = User::query()->where('email', $email)->firstOrFail();
        expect($student->hasVerifiedEmail())->toBeTrue();
        expect(Hash::check('password', $student->password))->toBeTrue();
        expect($student->can(PermissionEnum::ReserveTrial->value))->toBeTrue();
        $this->actingAs($student)->get(route('trial-management.index'))->assertForbidden();
    }
});

test('demo seeding preserves existing account passwords and does not promote an email collision', function () {
    $existing = User::factory()->create(['email' => 'admin@venincorse.test', 'password' => 'My-Own-Password!']);

    $this->seed(DemoUserSeeder::class);

    expect(Hash::check('My-Own-Password!', $existing->fresh()->password))->toBeTrue();
    expect($existing->fresh()->hasRole(RoleEnum::Administrator))->toBeFalse();
});

test('demo accounts are never seeded in production', function () {
    $this->app->instance('env', 'production');

    $this->artisan('db:seed', ['--class' => DemoUserSeeder::class, '--force' => true])->assertSuccessful();

    $this->assertDatabaseCount('users', 0);
});
