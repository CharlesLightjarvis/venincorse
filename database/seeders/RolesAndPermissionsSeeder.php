<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Enums\PermissionEnum;
use App\Enums\RoleEnum;
use App\Models\User;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

final class RolesAndPermissionsSeeder extends Seeder
{
    public function run(): void
    {
        app(PermissionRegistrar::class)->forgetCachedPermissions();
        foreach (PermissionEnum::cases() as $permission) {
            Permission::firstOrCreate(['name' => $permission->value, 'guard_name' => 'web']);
        }
        foreach (RoleEnum::activeCases() as $roleEnum) {
            $role = Role::firstOrCreate(['name' => $roleEnum->value, 'guard_name' => 'web']);
            $role->syncPermissions(array_map(fn (PermissionEnum $permission): string => $permission->value, $roleEnum->permissions()));
        }
        User::query()->whereDoesntHave('roles')->each(function (User $user): void {
            $user->assignRole(RoleEnum::Student);
        });
        app(PermissionRegistrar::class)->forgetCachedPermissions();
    }
}
