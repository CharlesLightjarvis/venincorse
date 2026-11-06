<?php

declare(strict_types=1);

namespace App\Enums;

enum PermissionEnum: string
{
    case ReserveTrial = 'trial-reservations.create';
    case ViewOwnTrials = 'trial-reservations.view-own';
    case ViewAllTrials = 'trial-reservations.view-all';
    case UpdateTrials = 'trial-reservations.update';
}
