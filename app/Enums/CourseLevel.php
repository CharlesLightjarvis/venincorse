<?php

declare(strict_types=1);

namespace App\Enums;

enum CourseLevel: string
{
    case A1 = 'a1';
    case A2 = 'a2';
    case B1 = 'b1';
    case B2 = 'b2';

    public function label(): string
    {
        return strtoupper($this->value).' — '.config("courses.levels.{$this->value}.title");
    }

    /** The per-person price of the full level, in cents. */
    public function priceCents(CourseFormat $format): int
    {
        return (int) config("courses.levels.{$this->value}.{$format->value}_cents");
    }
}
