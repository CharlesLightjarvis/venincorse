<?php

declare(strict_types=1);

namespace App\Enums;

enum TrialReservationStatus: string
{
    case Pending = 'pending';
    case Processing = 'processing';
    case Confirmed = 'confirmed';
    case Expired = 'expired';
    case PaymentReview = 'payment_review';
    case Refunded = 'refunded';

    /**
     * Statuses meaning the student already holds their single trial lesson, or is paying for it.
     *
     * @return list<self>
     */
    public static function bookedCases(): array
    {
        return [self::Processing, self::Confirmed, self::PaymentReview];
    }
}
