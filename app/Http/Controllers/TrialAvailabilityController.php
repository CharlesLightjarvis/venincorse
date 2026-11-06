<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Actions\SyncTrialSlots;
use App\Http\Requests\UpdateTrialAvailabilityRequest;
use App\Models\TrialAvailability;
use App\Models\TrialSlot;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

final readonly class TrialAvailabilityController
{
    public function edit(): Response
    {
        $availability = TrialAvailability::current();
        $upcoming = TrialSlot::query()->where('starts_at', '>=', now());

        return Inertia::render('trials/availability', [
            'availability' => [
                'weekdays' => $availability->weekdays,
                'hours' => $availability->hours,
                'closed_dates' => array_values(array_filter(
                    $availability->closed_dates,
                    fn (string $date): bool => $date >= now((string) config('trials.timezone'))->toDateString(),
                )),
            ],
            'timezone' => config('trials.timezone'),
            'selectableHours' => config('trials.selectable_hours'),
            'windowDays' => config('trials.window_days'),
            'noticeHours' => config('trials.minimum_notice_hours'),
            'overview' => [
                'freeSlots' => (clone $upcoming)->where('is_published', true)
                    ->where('starts_at', '>=', now()->addHours((int) config('trials.minimum_notice_hours')))
                    ->whereDoesntHave('hold')->count(),
                'reservedSlots' => (clone $upcoming)->whereHas('hold')->count(),
            ],
        ]);
    }

    public function update(UpdateTrialAvailabilityRequest $request, SyncTrialSlots $syncSlots): RedirectResponse
    {
        $availability = TrialAvailability::current();
        $availability->update([
            'weekdays' => $request->weekdays(),
            'hours' => $request->hours(),
            'closed_dates' => $request->closedDates(),
        ]);
        $bookedOutside = $syncSlots->handle($availability)['booked_outside'];
        Inertia::flash('toast', $bookedOutside > 0
            ? ['type' => 'warning', 'message' => __('trials.availability_booked_outside', ['count' => $bookedOutside], 'fr')]
            : ['type' => 'success', 'message' => __('trials.availability_saved', [], 'fr')]);

        return back();
    }
}
