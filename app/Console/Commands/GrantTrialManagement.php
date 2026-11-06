<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Enums\RoleEnum;
use App\Models\User;
use Illuminate\Console\Command;

final class GrantTrialManagement extends Command
{
    protected $signature = 'trials:grant-management {email}';

    protected $description = 'Grant trial management permissions to an existing account';

    public function handle(): int
    {
        $user = User::query()->where('email', $this->argument('email'))->first();
        if (! $user) {
            $this->error('Create this account before granting management access.');

            return self::FAILURE;
        }
        $user->assignRole(RoleEnum::Administrator);
        $this->info('Trial management permissions granted.');

        return self::SUCCESS;
    }
}
