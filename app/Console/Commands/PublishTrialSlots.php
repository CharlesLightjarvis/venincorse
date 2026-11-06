<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Actions\SyncTrialSlots;
use Illuminate\Console\Command;

final class PublishTrialSlots extends Command
{
    protected $signature = 'trials:publish-slots';

    protected $description = 'Align the bookable trial slots with the saved availability, without touching reserved sessions';

    public function handle(SyncTrialSlots $syncSlots): int
    {
        $result = $syncSlots->handle();
        $this->info("Trial slots synchronised: {$result['published']} published, {$result['withdrawn']} withdrawn.");

        return self::SUCCESS;
    }
}
