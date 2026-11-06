<?php

declare(strict_types=1);

namespace App\Policies;

use App\Enums\PermissionEnum;
use App\Models\TrialReservation;
use App\Models\User;
use Illuminate\Auth\Access\Response;

final class TrialReservationPolicy
{
    public function view(User $user, TrialReservation $reservation): Response
    {
        return $user->can(PermissionEnum::ViewAllTrials->value)
            || ($user->id === $reservation->user_id && $user->can(PermissionEnum::ViewOwnTrials->value))
            ? Response::allow() : Response::denyAsNotFound();
    }

    public function checkout(User $user, TrialReservation $reservation): Response
    {
        return $user->id === $reservation->user_id && $user->can(PermissionEnum::ReserveTrial->value)
            ? Response::allow() : Response::denyAsNotFound();
    }

    /** Only the student who booked may move or cancel their own trial; the timing rules live on the model. */
    public function changeOwn(User $user, TrialReservation $reservation): Response
    {
        return $user->id === $reservation->user_id && $user->can(PermissionEnum::ViewOwnTrials->value)
            ? Response::allow() : Response::denyAsNotFound();
    }

    public function update(User $user, TrialReservation $reservation): bool
    {
        return $user->can(PermissionEnum::UpdateTrials->value);
    }
}
