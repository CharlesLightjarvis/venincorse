<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

/**
 * The teacher's weekly trial schedule and closed days, in the school's time zone (`trials.timezone`). A single row, created from the config defaults.
 *
 * @property list<int> $weekdays
 * @property list<int> $hours
 * @property list<string> $closed_dates
 */
#[Fillable(['weekdays', 'hours', 'closed_dates'])]
final class TrialAvailability extends Model
{
    protected function casts(): array
    {
        return [
            'weekdays' => 'array',
            'hours' => 'array',
            'closed_dates' => 'array',
        ];
    }

    public static function current(): self
    {
        return self::query()->oldest('id')->first() ?? self::query()->create([
            'weekdays' => config('trials.weekdays'),
            'hours' => config('trials.hours'),
            'closed_dates' => [],
        ]);
    }
}
