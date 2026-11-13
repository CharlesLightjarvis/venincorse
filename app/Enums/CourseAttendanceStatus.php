<?php

declare(strict_types=1);

namespace App\Enums;

enum CourseAttendanceStatus: string
{
    case Present = 'present';
    case Absent = 'absent';
    case Excused = 'excused';

    public function label(): string
    {
        return match ($this) {
            self::Present => 'Présent',
            self::Absent => 'Absent',
            self::Excused => 'Absence justifiée',
        };
    }
}
