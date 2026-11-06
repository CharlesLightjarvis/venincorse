<?php

declare(strict_types=1);

namespace App\Listeners;

use App\Actions\ApplyTrialPayment;
use KenDeNigerian\PayZephyr\Events\WebhookReceived;

final readonly class HandleTrialPaymentWebhook
{
    public function __construct(private ApplyTrialPayment $applyPayment) {}

    public function handle(WebhookReceived $event): void
    {
        $type = $event->payload['type'] ?? '';
        if ($event->provider !== 'stripe' || ! in_array($type, [
            'checkout.session.completed', 'checkout.session.async_payment_succeeded',
            'checkout.session.async_payment_failed', 'checkout.session.expired',
        ], true)) {
            return;
        }
        $session = data_get($event->payload, 'data.object');
        if (is_array($session)) {
            $this->applyPayment->handle($session, $type);
        }
    }
}
