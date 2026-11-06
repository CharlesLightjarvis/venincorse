<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Enums\RoleEnum;
use App\Models\User;
use Illuminate\Database\Seeder;

final class DemoUserSeeder extends Seeder
{
    public function run(): void
    {
        if (! app()->environment(['local', 'testing'])) {
            return;
        }

        $this->call(RolesAndPermissionsSeeder::class);
        foreach ([
            ['name' => 'Administrateur Démo', 'email' => 'admin@venincorse.test', 'role' => RoleEnum::Administrator],
            ['name' => 'Élève Démo 1', 'email' => 'student1@venincorse.test', 'role' => RoleEnum::Student],
            ['name' => 'Élève Démo 2', 'email' => 'student2@venincorse.test', 'role' => RoleEnum::Student],
        ] as $account) {
            $user = User::query()->firstOrCreate(['email' => $account['email']], [
                'name' => $account['name'], 'password' => 'password',
            ]);
            if ($user->wasRecentlyCreated) {
                $user->forceFill(['email_verified_at' => now()])->save();
                $user->assignRole($account['role']);
            }
        }
    }
}
