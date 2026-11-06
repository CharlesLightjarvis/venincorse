<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Actions\UpdateTrialSlot;
use App\Http\Requests\UpdateTrialSlotRequest;
use App\Http\Resources\TrialReservationResource;
use App\Models\TrialReservation;
use App\Queries\AvailableTrialSlots;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

final readonly class TrialRescheduleController
{
    public function create(Request $request, TrialReservation $reservation, AvailableTrialSlots $slots): Response|RedirectResponse
    {
        Gate::authorize('changeOwn', $reservation);
        if (! $reservation->load('slot')->canBeRescheduledByStudent()) {
            Inertia::flash('toast', ['type' => 'error', 'message' => __('trials.reschedule_unavailable', [], 'fr')]);

            return to_route('trial-reservations.index');
        }

        return Inertia::render('trials/reschedule', [
            'reservation' => TrialReservationResource::make($reservation)->resolve($request),
            'slots' => $slots->get()
                ->reject(fn ($slot): bool => $slot->id === $reservation->trial_slot_id)
                ->values()
                ->map(fn ($slot): array => ['id' => $slot->id, 'starts_at' => $slot->starts_at->toIso8601String()]),
        ]);
    }

    public function store(UpdateTrialSlotRequest $request, TrialReservation $reservation, UpdateTrialSlot $updateSlot): RedirectResponse
    {
        $updateSlot->handle($reservation, $request->integer('slot_id'));
        Inertia::flash('toast', ['type' => 'success', 'message' => __('trials.rescheduled', [], 'fr')]);

        return to_route('trial-reservations.index');
    }
}
