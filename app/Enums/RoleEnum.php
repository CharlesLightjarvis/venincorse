<?php

declare(strict_types=1);

namespace App\Enums;

enum RoleEnum: string
{
    case Administrator = 'administrator';
    case Student = 'student';

    public function label(): string
    {
        return match ($this) {
            self::Administrator => 'Administrateur',
            self::Student => 'Élève',
        };
    }

    /** @return list<PermissionEnum> */
    public function permissions(): array
    {
        return match ($this) {
            self::Administrator => [
                PermissionEnum::ViewAllTrials,
                PermissionEnum::UpdateTrials,
                PermissionEnum::ManageAvailability,
                PermissionEnum::ManageCourses,
            ],
            self::Student => [
                PermissionEnum::ReserveTrial,
                PermissionEnum::ViewOwnTrials,
                PermissionEnum::EnrollInCourses,
                PermissionEnum::ViewOwnCourses,
            ],
        };
    }

    /** @return list<self> */
    public static function activeCases(): array
    {
        return self::cases();
    }
}
