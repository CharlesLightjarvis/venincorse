<?php

declare(strict_types=1);

namespace App\Enums;

enum CoursePaymentMethod: string
{
    case Stripe = 'stripe';
    /** A free seat granted by the school. */
    case Offer = 'offer';
    /** The student paid by bank transfer, outside Stripe. */
    case BankTransfer = 'bank_transfer';
    /** The student moves from another enrollment, so nothing new is collected. */
    case Transfer = 'transfer';

    public function label(): string
    {
        return match ($this) {
            self::Stripe => 'Carte bancaire',
            self::Offer => 'Offert',
            self::BankTransfer => 'Virement',
            self::Transfer => 'Transfert',
        };
    }

    /** Money that did not go through Stripe: a refund is settled by the school itself. */
    public function isManual(): bool
    {
        return $this !== self::Stripe;
    }
}
