<?php

declare(strict_types=1);

namespace App\Enums;

enum CourseEnrollmentStatus: string
{
    /** Seat held while the student pays (45 minutes). */
    case Pending = 'pending';
    /** Payment sent, waiting for the bank (delayed payment methods). */
    case Processing = 'processing';
    case Confirmed = 'confirmed';
    /** Paid but not confirmable automatically; the team decides. */
    case PaymentReview = 'payment_review';
    case Expired = 'expired';
    case Refunded = 'refunded';
    case Cancelled = 'cancelled';

    /**
     * Statuses that keep a seat in the group.
     *
     * @return list<self>
     */
    public static function seatHoldingCases(): array
    {
        return [self::Processing, self::Confirmed, self::PaymentReview];
    }

    /**
     * Statuses a payment event can no longer change.
     *
     * @return list<self>
     */
    public static function finalCases(): array
    {
        return [self::Confirmed, self::Refunded, self::Cancelled];
    }
}
