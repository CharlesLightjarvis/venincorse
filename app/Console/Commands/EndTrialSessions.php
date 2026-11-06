<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Actions\UpdateEndedTrialSessions;
use Illuminate\Console\Command;

final class EndTrialSessions extends Command
{
    protected $signature = 'trials:end-sessions';

    protected $description = 'Mark paid trial sessions whose end time has passed as ended, waiting to be closed';

    public function handle(UpdateEndedTrialSessions $updateEnded): int
    {
        $this->info('Trial sessions ended: '.$updateEnded->handle().'.');

        return self::SUCCESS;
    }
}
