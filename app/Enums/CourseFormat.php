<?php

declare(strict_types=1);

namespace App\Enums;

enum CourseFormat: string
{
    case Group = 'group';
    case Solo = 'solo';

    public function label(): string
    {
        return match ($this) {
            self::Group => 'Groupe (3 à 6)',
            self::Solo => 'Individuel (1:1)',
        };
    }

    public function maxCapacity(): int
    {
        return (int) config("courses.capacity.{$this->value}");
    }
}
