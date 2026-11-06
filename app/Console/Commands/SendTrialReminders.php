<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Actions\CreateTrialOutcomeReminders;
use App\Actions\CreateTrialReminders;
use Illuminate\Console\Command;

final class SendTrialReminders extends Command
{
    protected $signature = 'trials:send-reminders';

    protected $description = 'Queue the student reminder before each paid session, and the teacher reminder for past sessions left unclosed';

    public function handle(CreateTrialReminders $createReminders, CreateTrialOutcomeReminders $createOutcomeReminders): int
    {
        $this->info('Session reminders queued: '.$createReminders->handle().'.');
        $this->info('Closing reminders queued: '.$createOutcomeReminders->handle().'.');

        return self::SUCCESS;
    }
}
