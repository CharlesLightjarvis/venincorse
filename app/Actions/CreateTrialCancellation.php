<?php

declare(strict_types=1);

namespace App\Actions;

use App\Enums\PermissionEnum;
use App\Enums\TrialReservationStatus;
use App\Exceptions\TrialRefundFailed;
use App\Models\TrialReservation;
use App\Models\TrialSlotHold;
use App\Models\User;
use App\Notifications\TrialCancelled;
use App\Notifications\TrialChangedForTeacher;
use App\Services\TrialReservationLock;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Notification;

/**
 * A paid session is cancelled and refunded: by the teacher until it starts, by the student until the
 * change deadline. The refund comes first; nothing changes if it fails. Then the slot is released and
 * the people concerned are emailed.
 */
final readonly class CreateTrialCancellation
{
    public const string ByTeacher = 'teacher';

    public const string ByStudent = 'student';

    public function __construct(
        private CreateTrialRefund $createRefund,
        private CreateTrialPaymentAlert $alert,
        private TrialReservationLock $lock,
    ) {}

    /** @throws TrialRefundFailed */
    public function handle(TrialReservation $reservation, string $reason, string $cancelledBy = self::ByTeacher): bool
    {
        $cancelled = $this->lock->run($reservation->id, function () use ($reservation, $reason, $cancelledBy): bool {
            $reservation->refresh()->load('slot');
            $allowed = $cancelledBy === self::ByStudent
                ? $reservation->canBeCancelledByStudent()
                : $reservation->isCancellable();
            if (! $allowed) {
                return false;
            }
            $this->createRefund->handle($reservation);

            $cancelled = DB::transaction(function () use ($reservation, $reason, $cancelledBy): bool {
                $updated = TrialReservation::query()->whereKey($reservation->id)
                    ->where('status', TrialReservationStatus::Confirmed)
                    ->update([
                        'status' => TrialReservationStatus::Cancelled,
                        'cancelled_at' => now(),
                        'cancelled_by' => $cancelledBy,
                        'cancellation_reason' => $reason,
                    ]);
                if ($updated > 0) {
                    TrialSlotHold::query()->where('trial_reservation_id', $reservation->id)->delete();
                }

                return $updated > 0;
            });
            if (! $cancelled) {
                $this->alert->handle($reservation, 'l’élève a été remboursé mais l’annulation n’a pas pu être enregistrée. Vérifie le statut de l’essai.');
            }

            return $cancelled;
        });

        if ($cancelled) {
            $reservation->refresh()->load(['slot', 'user'])->user->notify(new TrialCancelled($reservation));
            if ($cancelledBy === self::ByStudent) {
                Notification::send(
                    User::permission(PermissionEnum::UpdateTrials->value)->get(),
                    new TrialChangedForTeacher($reservation, cancelled: true),
                );
            }
        }

        return $cancelled;
    }
}
