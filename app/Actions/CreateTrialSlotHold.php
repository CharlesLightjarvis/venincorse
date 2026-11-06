<?php

declare(strict_types=1);

namespace App\Actions;

use App\Enums\TrialReservationStatus;
use App\Models\TrialReservation;
use App\Models\TrialSlotHold;
use Illuminate\Database\UniqueConstraintViolationException;
use Illuminate\Support\Facades\DB;

/**
 * Keeps the slot for a paid reservation: its own hold, or the slot again if it is still free
 * and the student has no other trial lesson.
 */
final readonly class CreateTrialSlotHold
{
    public function handle(TrialReservation $reservation): bool
    {
        $hold = TrialSlotHold::query()->where('trial_reservation_id', $reservation->id)->first();
        if ($hold) {
            return $hold->trial_slot_id === $reservation->trial_slot_id;
        }
        $hasOtherTrial = TrialReservation::query()
            ->where('user_id', $reservation->user_id)
            ->whereKeyNot($reservation->id)
            ->whereIn('status', TrialReservationStatus::bookedCases())
            ->exists();
        if ($hasOtherTrial) {
            return false;
        }
        try {
            DB::transaction(fn () => TrialSlotHold::query()->create([
                'trial_slot_id' => $reservation->trial_slot_id,
                'trial_reservation_id' => $reservation->id,
            ]));
        } catch (UniqueConstraintViolationException) {
            return false;
        }

        return true;
    }
}
