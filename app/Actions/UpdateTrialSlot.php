<?php

declare(strict_types=1);

namespace App\Actions;

use App\Enums\PermissionEnum;
use App\Enums\TrialReservationStatus;
use App\Models\TrialReservation;
use App\Models\TrialSlot;
use App\Models\TrialSlotHold;
use App\Models\User;
use App\Notifications\TrialChangedForTeacher;
use App\Notifications\TrialRescheduled;
use Illuminate\Database\UniqueConstraintViolationException;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Notification;
use Illuminate\Validation\ValidationException;

/**
 * The student moves their paid session to another free slot: once for free before the change deadline,
 * or after a missed session when the teacher offered a new slot. The old slot is released atomically, and the
 * previous visio link is cleared so the student never joins a stale room: the teacher shares a new one.
 */
final readonly class UpdateTrialSlot
{
    public function handle(TrialReservation $reservation, int $slotId): TrialReservation
    {
        try {
            DB::transaction(function () use ($reservation, $slotId): void {
                $reservation = TrialReservation::query()->with('slot')->lockForUpdate()->findOrFail($reservation->id);
                if (! $reservation->canBeRescheduledByStudent()) {
                    throw ValidationException::withMessages(['slot_id' => __('trials.reschedule_unavailable', [], 'fr')]);
                }
                $slot = TrialSlot::query()->lockForUpdate()->find($slotId);
                if (! $slot || $slot->id === $reservation->trial_slot_id || ! $slot->is_published
                    || $slot->starts_at->lt(now()->addHours((int) config('trials.minimum_notice_hours')))) {
                    throw ValidationException::withMessages(['slot_id' => __('trials.slot_unavailable', [], 'fr')]);
                }
                $usesRebookOffer = $reservation->hasRebookOffer();

                TrialSlotHold::query()->where('trial_reservation_id', $reservation->id)->delete();
                TrialSlotHold::query()->create(['trial_slot_id' => $slot->id, 'trial_reservation_id' => $reservation->id]);
                $reservation->update([
                    'trial_slot_id' => $slot->id,
                    'status' => TrialReservationStatus::Confirmed,
                    'reschedule_count' => $usesRebookOffer ? $reservation->reschedule_count : $reservation->reschedule_count + 1,
                    'rebook_offered_at' => null,
                    'rebooked_at' => $usesRebookOffer ? now() : $reservation->rebooked_at,
                    'meeting_url' => null,
                    'reminder_sent_at' => null,
                    'outcome_reminder_sent_at' => null,
                ]);
            }, 5);
        } catch (UniqueConstraintViolationException) {
            throw ValidationException::withMessages(['slot_id' => __('trials.slot_unavailable', [], 'fr')]);
        }

        $reservation->refresh()->load(['slot', 'user']);
        $reservation->user->notify(new TrialRescheduled($reservation));
        Notification::send(
            User::permission(PermissionEnum::UpdateTrials->value)->get(),
            new TrialChangedForTeacher($reservation, cancelled: false),
        );

        return $reservation;
    }
}
