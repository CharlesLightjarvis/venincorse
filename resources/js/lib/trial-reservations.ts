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
        | 'ended'
        | 'expired'
        | 'payment_review'
        | 'refunded'
        | 'completed'
        | 'no_show'
        | 'cancelled';
    expires_at: string;
    paid_at: string | null;
    is_active: boolean;
    has_started: boolean;
    has_ended: boolean;
    cancellation_reason: string | null;
    cancelled_by: 'student' | 'teacher' | null;
    cancelled_at: string | null;
    reschedule_count: number;
    /** Until this moment the student may move or cancel the session themselves. */
    change_deadline: string;
    session_summary: string | null;
    rebook_offered: boolean;
    rebook_offer_expires_at: string | null;
    is_rebooked: boolean;
    /** Only sent to the student who booked. */
    student_actions?: {
        reschedule: boolean;
        cancel: boolean;
        rebook: boolean;
    };
    can_checkout: boolean;
    meeting_url?: string | null;
    student?: { name: string; email: string };
    notes?: string;
    /** What the teaching team may still do; only sent to people allowed to update trials. */
    actions?: {
        edit_meeting_link: boolean;
        cancel: boolean;
        record_outcome: boolean;
        resolve_review: boolean;
        confirm_review: boolean;
        release_review: boolean;
        offer_rebook: boolean;
    };
};

export const reservationStatusLabels: Record<
    TrialReservation['status'],
    string
> = {
    pending: 'En attente de paiement',
    processing: 'Paiement en cours de vérification',
    confirmed: 'Confirmée',
    ended: 'Séance terminée',
    expired: 'Expirée',
    payment_review: 'Vérification manuelle nécessaire',
    refunded: 'Remboursée',
    completed: 'Réalisée',
    no_show: 'Élève absent',
    cancelled: 'Annulée',
};

export const reservationStatusBadgeVariant: Record<
    TrialReservation['status'],
    'default' | 'secondary' | 'outline' | 'destructive'
> = {
    confirmed: 'default',
    ended: 'secondary',
    pending: 'secondary',
    processing: 'secondary',
    payment_review: 'destructive',
    expired: 'outline',
    refunded: 'outline',
    completed: 'secondary',
    no_show: 'outline',
    cancelled: 'outline',
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
