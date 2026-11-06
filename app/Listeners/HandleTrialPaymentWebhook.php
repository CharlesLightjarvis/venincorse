<?php

declare(strict_types=1);

namespace App\Listeners;

use App\Actions\ApplyTrialPayment;
use App\Actions\CreateTrialPaymentAlert;
use App\Models\TrialReservation;
use KenDeNigerian\PayZephyr\Events\WebhookReceived;

final readonly class HandleTrialPaymentWebhook
{
    private const array CheckoutEvents = [
        'checkout.session.completed', 'checkout.session.async_payment_succeeded',
        'checkout.session.async_payment_failed', 'checkout.session.expired',
    ];

    public function __construct(
        private ApplyTrialPayment $applyPayment,
        private CreateTrialPaymentAlert $alert,
    ) {}

    public function handle(WebhookReceived $event): void
    {
        $type = $event->payload['type'] ?? '';
        $object = data_get($event->payload, 'data.object');
        if ($event->provider !== 'stripe' || ! is_array($object)) {
            return;
        }

        if (in_array($type, self::CheckoutEvents, true)) {
            $this->applyPayment->handle($object, $type);
        } elseif ($type === 'refund.failed') {
            $reference = data_get($object, 'metadata.reservation_id');
            $this->alert->handle(
                is_string($reference) ? TrialReservation::query()->find($reference) : null,
                'Stripe n’a pas pu rembourser l’élève (remboursement '.($object['id'] ?? '?').'). Rembourse-le depuis Stripe ou contacte-le.',
            );
        } elseif ($type === 'charge.dispute.created') {
            $this->alert->handle(
                null,
                'un élève conteste un paiement auprès de sa banque (litige '.($object['id'] ?? '?').'). Réponds au litige depuis Stripe avant la date limite.',
            );
        }
    }
}
