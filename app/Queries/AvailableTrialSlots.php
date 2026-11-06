<?php

declare(strict_types=1);

namespace App\Queries;

use App\Models\TrialSlot;
use Illuminate\Database\Eloquent\Collection;

final readonly class AvailableTrialSlots
{
    /** @return Collection<int, TrialSlot> */
    public function get(): Collection
    {
        return TrialSlot::query()
            ->where('is_published', true)
            ->where('starts_at', '>=', now()->addHours(config('trials.minimum_notice_hours')))
            ->whereDoesntHave('hold')
            ->orderBy('starts_at')->limit(100)->get();
    }
}
