<?php

declare(strict_types=1);

namespace App\Enums;

enum CoursePaymentPlan: string
{
    case Full = 'full';
    /** Three monthly instalments: the first at enrollment, the next ones charged on the saved card. */
    case Installments = 'installments';

    /** Total paid by the student for a course of this price. */
    public function totalCents(int $priceCents): int
    {
        return match ($this) {
            self::Full => $priceCents,
            self::Installments => (int) round($priceCents * (100 + (float) config('courses.installments.surcharge_percent')) / 100),
        };
    }

    /**
     * The amount of each payment, the remainder of the split going on the last one.
     *
     * @return list<int>
     */
    public function amountsCents(int $totalCents): array
    {
        if ($this === self::Full) {
            return [$totalCents];
        }
        $count = (int) config('courses.installments.count');
        $base = intdiv($totalCents, $count);
        $amounts = array_fill(0, $count, $base);
        $amounts[$count - 1] += $totalCents - $base * $count;

        return $amounts;
    }
}
