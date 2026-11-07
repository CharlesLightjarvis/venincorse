<?php

declare(strict_types=1);

namespace App\Enums;

enum CourseRhythm: string
{
    case Extensive = 'extensif';
    case Accelerated = 'accelere';
    case Intensive = 'intensif';
    case SuperIntensive = 'super-intensif';

    public function label(): string
    {
        return match ($this) {
            self::Extensive => 'Extensif',
            self::Accelerated => 'Accéléré',
            self::Intensive => 'Intensif',
            self::SuperIntensive => 'Super intensif',
        };
    }

    /** @return list<int> ISO weekdays (1 = Monday) of the sessions. */
    public function weekdays(): array
    {
        return config("courses.rhythms.{$this->value}.weekdays");
    }

    public function sessionHours(): int
    {
        return (int) config("courses.rhythms.{$this->value}.session_hours");
    }
}
