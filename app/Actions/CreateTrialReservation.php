<?php

declare(strict_types=1);

namespace App\Actions;

use App\Enums\TrialReservationStatus;
use App\Models\TrialReservation;
use App\Models\TrialSlot;
use App\Models\TrialSlotHold;
use App\Models\User;
use App\Services\TrialPaymentGateway;
use Illuminate\Database\UniqueConstraintViolationException;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Stripe\Exception\ApiErrorException;

/**
 * A student books a single trial lesson and has at most one unpaid attempt at a time:
 * choosing another slot closes the previous attempt, including its Stripe session.
 */
final readonly class CreateTrialReservation
{
    public function __construct(
        private TrialPaymentGateway $gateway,
        private ApplyTrialPayment $applyPayment,
    ) {}

    /** @param array{slot_id: int, level: string, goal: string, timezone: string} $data */
    public function handle(User $user, array $data, string $submissionKey): TrialReservation
    {
        $hash = hash('sha256', json_encode($data, JSON_THROW_ON_ERROR));
        $replayed = $this->replay($user, $submissionKey, $hash);
        if ($replayed) {
            return $replayed;
        }
        $this->ensureNoBookedTrial($user);
        $this->releaseOtherAttempts($user, $data['slot_id']);

        try {
            return DB::transaction(function () use ($user, $data, $submissionKey, $hash): TrialReservation {
                User::query()->lockForUpdate()->whereKey($user->id)->first();
                $replayed = $this->replay($user, $submissionKey, $hash);
                if ($replayed) {
                    return $replayed;
                }
                $this->ensureNoBookedTrial($user);
                $hasOtherAttempt = TrialReservation::query()->where('user_id', $user->id)
                    ->where('status', TrialReservationStatus::Pending)
                    ->where('trial_slot_id', '!=', $data['slot_id'])
                    ->exists();
                if ($hasOtherAttempt) {
                    throw ValidationException::withMessages(['slot_id' => __('trials.previous_attempt_busy', [], 'fr')]);
                }
                $slot = TrialSlot::query()->lockForUpdate()->findOrFail($data['slot_id']);
                if (! $slot->is_published || $slot->starts_at->lt(now()->addHours(config('trials.minimum_notice_hours')))) {
                    throw ValidationException::withMessages(['slot_id' => __('trials.slot_unavailable', [], 'fr')]);
                }
                $hold = TrialSlotHold::query()->where('trial_slot_id', $slot->id)->first();
                if ($hold) {
                    return $this->reuseOwnPendingReservation($user, $hold, $data);
                }
                $reservation = TrialReservation::query()->create([
                    'user_id' => $user->id,
                    'trial_slot_id' => $slot->id,
                    'submission_key' => $submissionKey,
                    'submission_hash' => $hash,
                    'level' => $data['level'], 'goal' => trim($data['goal']), 'timezone' => $data['timezone'],
                    'terms_accepted_at' => now(), 'terms_version' => config('trials.terms_version'),
                    'amount_cents' => config('trials.amount_cents'), 'currency' => config('trials.currency'),
                    'status' => TrialReservationStatus::Pending,
                    'expires_at' => now()->addMinutes(config('trials.hold_minutes')),
                ]);
                TrialSlotHold::query()->create(['trial_slot_id' => $slot->id, 'trial_reservation_id' => $reservation->id]);

                return $reservation;
            }, 5);
        } catch (UniqueConstraintViolationException) {
            throw ValidationException::withMessages(['slot_id' => __('trials.slot_unavailable', [], 'fr')]);
        }
    }

    private function replay(User $user, string $submissionKey, string $hash): ?TrialReservation
    {
        $existing = TrialReservation::query()->where('user_id', $user->id)->where('submission_key', $submissionKey)->first();
        if ($existing) {
            abort_unless(hash_equals($existing->submission_hash, $hash), 409, __('trials.key_conflict', [], 'fr'));
        }

        return $existing;
    }

    private function ensureNoBookedTrial(User $user): void
    {
        $booked = TrialReservation::query()->where('user_id', $user->id)
            ->whereIn('status', TrialReservationStatus::bookedCases())
            ->exists();
        if ($booked) {
            throw ValidationException::withMessages(['slot_id' => __('trials.already_booked', [], 'fr')]);
        }
    }

    /** Close the student's unpaid attempts on other slots; a payment completed meanwhile is applied, not lost. */
    private function releaseOtherAttempts(User $user, int $slotId): void
    {
        $attempts = TrialReservation::query()->where('user_id', $user->id)
            ->where('status', TrialReservationStatus::Pending)
            ->where('trial_slot_id', '!=', $slotId)
            ->get();
        foreach ($attempts as $attempt) {
            if ($attempt->checkout_started_at === null) {
                $this->expire($attempt);

                continue;
            }
            if (! $attempt->stripe_session_id || ! $this->gateway->ready()) {
                throw ValidationException::withMessages(['slot_id' => __('trials.previous_attempt_busy', [], 'fr')]);
            }
            try {
                $session = $this->gateway->expireSession($attempt->stripe_session_id);
            } catch (ApiErrorException $exception) {
                report($exception);
                throw ValidationException::withMessages(['slot_id' => __('trials.previous_attempt_failed', [], 'fr')]);
            }
            $this->applyPayment->handle($session, ($session['status'] ?? '') === 'expired'
                ? 'checkout.session.expired' : 'checkout.session.completed');
        }
        $this->ensureNoBookedTrial($user);
    }

    private function expire(TrialReservation $attempt): void
    {
        DB::transaction(function () use ($attempt): void {
            $updated = TrialReservation::query()->whereKey($attempt->id)
                ->whereNull('checkout_started_at')
                ->where('status', TrialReservationStatus::Pending)
                ->update(['status' => TrialReservationStatus::Expired]);
            if ($updated > 0) {
                TrialSlotHold::query()->where('trial_reservation_id', $attempt->id)->delete();
            }
        }, 5);
    }

    /**
     * A reload before payment produces a new submission key; the student's own unpaid hold must not block them.
     *
     * @param  array{slot_id: int, level: string, goal: string, timezone: string}  $data
     */
    private function reuseOwnPendingReservation(User $user, TrialSlotHold $hold, array $data): TrialReservation
    {
        $reservation = TrialReservation::query()->lockForUpdate()
            ->whereKey($hold->trial_reservation_id)
            ->where('user_id', $user->id)
            ->where('status', TrialReservationStatus::Pending)
            ->first();
        if (! $reservation) {
            throw ValidationException::withMessages(['slot_id' => __('trials.slot_unavailable', [], 'fr')]);
        }
        if ($reservation->checkout_started_at === null) {
            $reservation->update([
                'level' => $data['level'], 'goal' => trim($data['goal']), 'timezone' => $data['timezone'],
                'terms_accepted_at' => now(), 'terms_version' => config('trials.terms_version'),
                'expires_at' => now()->addMinutes(config('trials.hold_minutes')),
            ]);
        }

        return $reservation;
    }
}
