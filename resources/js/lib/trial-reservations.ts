export type TrialReservation = {
    id: string;
    starts_at: string;
    duration_minutes: number;
    level: string;
    goal: string;
    timezone: string;
    amount_cents: number;
    currency: string;
    status:
        | 'pending'
        | 'processing'
        | 'confirmed'
        | 'expired'
        | 'payment_review'
        | 'refunded';
    expires_at: string;
    paid_at: string | null;
    can_checkout: boolean;
    meeting_url?: string | null;
    student?: { name: string; email: string };
    notes?: string;
};

export const reservationStatusLabels: Record<
    TrialReservation['status'],
    string
> = {
    pending: 'En attente de paiement',
    processing: 'Paiement en cours de vérification',
    confirmed: 'Confirmée',
    expired: 'Expirée',
    payment_review: 'Vérification manuelle nécessaire',
    refunded: 'Remboursée',
};

export type TrialReservationSummary = {
    id: string;
    starts_at: string;
    status: TrialReservation['status'];
    expires_at: string;
};

export function formatReservationDate(value: string, timezone: string): string {
    return new Intl.DateTimeFormat('fr-FR', {
        timeZone: timezone,
        dateStyle: 'full',
        timeStyle: 'short',
    }).format(new Date(value));
}

export function formatReservationPrice(
    cents: number,
    currency = 'EUR',
): string {
    return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency,
    }).format(cents / 100);
}

export class TrialRequestError extends Error {
    constructor(public errors: Record<string, string>) {
        super(Object.values(errors)[0]);
    }
}

export async function postTrialRequest<T>(
    url: string,
    key: string,
    data: Record<string, unknown>,
): Promise<T> {
    const cookie = document.cookie
        .split('; ')
        .find((item) => item.startsWith('XSRF-TOKEN='));
    const response = await fetch(url, {
        method: 'POST',
        credentials: 'same-origin',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
            'Idempotency-Key': key,
            'X-XSRF-TOKEN': cookie
                ? decodeURIComponent(cookie.slice('XSRF-TOKEN='.length))
                : '',
        },
        body: JSON.stringify(data),
    });
    const body = await response.json().catch(() => ({}));
    if (!response.ok) {
        const errors = Object.fromEntries(
            Object.entries(body.errors ?? {}).map(([field, messages]) => [
                field,
                Array.isArray(messages) ? messages[0] : String(messages),
            ]),
        );
        throw new TrialRequestError(
            Object.keys(errors).length
                ? errors
                : {
                      request:
                          response.status === 419 || response.status === 401
                              ? 'Ta session a expiré. Recharge la page et reconnecte-toi.'
                              : response.status === 503
                                ? 'Le paiement de test n’est pas encore configuré. Aucun paiement effectué.'
                                : response.status === 429
                                  ? 'Trop de tentatives. Patiente un instant avant de réessayer.'
                                  : 'La demande n’a pas abouti. Vérifie ton espace personnel avant de réessayer.',
                  },
        );
    }
    return body as T;
}
