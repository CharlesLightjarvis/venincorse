<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Models\TrialSlot;
use Illuminate\Console\Command;

final class PublishTrialSlots extends Command
{
    protected $signature = 'trials:publish-slots {--days=14}';

    protected $description = 'Publish the next trial slots from the configured UTC schedule without modifying existing slots';

    public function handle(): int
    {
        $days = filter_var($this->option('days'), FILTER_VALIDATE_INT, ['options' => ['min_range' => 1, 'max_range' => 90]]);
        if ($days === false) {
            $this->error('The days option must be between 1 and 90.');

            return self::FAILURE;
        }
        for ($offset = 0; $offset < $days; $offset++) {
            $day = now('UTC')->startOfDay()->addDays($offset);
            if (! in_array($day->dayOfWeek, config('trials.weekdays'), true)) {
                continue;
            }
            foreach (config('trials.hours') as $hour) {
                $start = $day->copy()->setHour($hour);
                if ($start->gte(now()->addHours(config('trials.minimum_notice_hours')))) {
                    TrialSlot::query()->firstOrCreate(['starts_at' => $start], ['is_published' => true]);
                }
            }
        }
        $this->info('Trial slots published. Existing reservations and unpublished slots were preserved.');

        return self::SUCCESS;
    }
}
