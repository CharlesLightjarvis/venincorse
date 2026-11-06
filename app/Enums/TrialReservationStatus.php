<?php

declare(strict_types=1);

namespace App\Enums;

enum TrialReservationStatus: string
{
    case Pending = 'pending';
    case Processing = 'processing';
    case Confirmed = 'confirmed';
    /** The paid session's end time has passed; the teacher still has to say whether it took place. */
    case Ended = 'ended';
    case Expired = 'expired';
    case PaymentReview = 'payment_review';
    case Refunded = 'refunded';
    case Completed = 'completed';
    case NoShow = 'no_show';
    case Cancelled = 'cancelled';

    /**
     * Statuses meaning the student already holds their single trial lesson, is paying for it, or has had it.
     *
     * @return list<self>
     */
    public static function bookedCases(): array
    {
        return [self::Processing, self::Confirmed, self::Ended, self::PaymentReview, self::Completed, self::NoShow];
    }

    /**
     * Statuses a payment event can no longer change.
     *
     * @return list<self>
     */
    public static function finalCases(): array
    {
        return [self::Confirmed, self::Ended, self::Refunded, self::Completed, self::NoShow, self::Cancelled];
    }

    /**
     * Statuses of a paid session, counted as revenue.
     *
     * @return list<self>
     */
    public static function paidCases(): array
    {
        return [self::Confirmed, self::Ended, self::Completed, self::NoShow];
    }
}
