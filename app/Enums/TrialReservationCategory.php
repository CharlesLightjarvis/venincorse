<?php

declare(strict_types=1);

namespace App\Enums;

use App\Models\TrialReservation;
use App\Models\TrialSlot;
use Illuminate\Database\Eloquent\Builder;

/** How the teaching team sorts trials: what to prepare, what is being paid, what happened, what was dropped. */
enum TrialReservationCategory: string
{
    case Upcoming = 'upcoming';
    case Paying = 'paying';
    case Done = 'done';
    case Cancelled = 'cancelled';

    /**
     * @param  Builder<TrialReservation>  $query
     * @return Builder<TrialReservation>
     */
    public function scope(Builder $query): Builder
    {
        $sessionEndedBefore = now()->subMinutes((int) config('trials.duration_minutes'));

        return match ($this) {
            self::Upcoming => $query->where('status', TrialReservationStatus::Confirmed)
                ->whereHas('slot', fn (Builder $slot) => $slot->where('starts_at', '>', $sessionEndedBefore)),
            self::Paying => $query->where(fn (Builder $paying) => $paying
                ->whereIn('status', [TrialReservationStatus::Processing, TrialReservationStatus::PaymentReview])
                ->orWhere(fn (Builder $pending) => $pending
                    ->where('status', TrialReservationStatus::Pending)->where('expires_at', '>', now()))),
            self::Done => $query->where(fn (Builder $done) => $done
                ->whereIn('status', [TrialReservationStatus::Ended, TrialReservationStatus::Completed, TrialReservationStatus::NoShow])
                ->orWhere(fn (Builder $ended) => $ended
                    ->where('status', TrialReservationStatus::Confirmed)
                    ->whereHas('slot', fn (Builder $slot) => $slot->where('starts_at', '<=', $sessionEndedBefore)))),
            self::Cancelled => $query->where(fn (Builder $cancelled) => $cancelled
                ->whereIn('status', [TrialReservationStatus::Expired, TrialReservationStatus::Refunded, TrialReservationStatus::Cancelled])
                ->orWhere(fn (Builder $lapsed) => $lapsed
                    ->where('status', TrialReservationStatus::Pending)->where('expires_at', '<=', now()))),
        };
    }

    /**
     * Sessions to come are listed soonest first; finished ones most recent first.
     *
     * @param  Builder<TrialReservation>  $query
     * @return Builder<TrialReservation>
     */
    public static function order(Builder $query, ?self $category): Builder
    {
        return $query->orderBy(
            TrialSlot::query()->select('starts_at')->whereColumn('trial_slots.id', 'trial_reservations.trial_slot_id'),
            in_array($category, [self::Upcoming, self::Paying], true) ? 'asc' : 'desc',
        )->orderBy('id');
    }
}
