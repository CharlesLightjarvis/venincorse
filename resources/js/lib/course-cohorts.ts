export type CourseCohort = {
    id: number;
    level: string;
    level_label: string;
    format: 'group' | 'solo';
    format_label: string;
    rhythm: string;
    rhythm_label: string;
    weekdays: number[];
    session_hours: number;
    starts_at: string;
    ends_at: string;
    capacity: number;
    seats_left: number;
    is_bookable: boolean;
    price_cents: number;
    currency: string;
    is_published: boolean;
    has_started: boolean;
    sessions_count?: number;
    sessions?: {
        position: number;
        starts_at: string;
        duration_minutes: number;
    }[];
    meeting_url?: string | null;
};

const weekdayNames = [
    '',
    'lun.',
    'mar.',
    'mer.',
    'jeu.',
    'ven.',
    'sam.',
    'dim.',
];

/** "lun., mer., ven. · 1 h" from ISO weekdays (1 = Monday). */
export function describeRhythm(cohort: CourseCohort): string {
    return `${cohort.weekdays.map((day) => weekdayNames[day]).join(', ')} · séances de ${cohort.session_hours} h`;
}

export type CourseEnrollment = {
    id: string;
    status:
        | 'pending'
        | 'processing'
        | 'confirmed'
        | 'payment_review'
        | 'expired'
        | 'refunded'
        | 'cancelled';
    amount_cents: number;
    currency: string;
    payment_plan: 'full' | 'installments';
    installments?: CourseInstallment[];
    goal: string;
    created_at: string;
    paid_at: string | null;
    expires_at: string;
    withdrawal_ends_at: string;
    can_pay: boolean;
    cohort: CourseCohort;
    meeting_url?: string | null;
    student?: { name: string; email: string };
    notes?: string;
};

export type CourseInstallment = {
    id: number;
    position: number;
    amount_cents: number;
    status: 'scheduled' | 'failed' | 'paid' | 'cancelled';
    due_at: string;
    paid_at: string | null;
    next_attempt_at: string | null;
    can_pay: boolean;
};

export type InstallmentSettings = {
    count: number;
    surcharge_percent: number;
    interval_days: number;
};

/** Same split as the server: total with the surcharge, the remainder on the last instalment. */
export function splitInstallments(
    priceCents: number,
    settings: InstallmentSettings,
): { total: number; amounts: number[] } {
    const total = Math.round(
        (priceCents * (100 + settings.surcharge_percent)) / 100,
    );
    const base = Math.floor(total / settings.count);
    const amounts = Array.from({ length: settings.count }, () => base);
    amounts[settings.count - 1] += total - base * settings.count;

    return { total, amounts };
}

export const enrollmentStatusLabels: Record<
    CourseEnrollment['status'],
    string
> = {
    pending: 'Paiement en attente',
    processing: 'Paiement en vérification',
    confirmed: 'Inscrit',
    payment_review: 'Paiement à vérifier',
    expired: 'Expirée',
    refunded: 'Remboursée',
    cancelled: 'Annulée',
};

export const enrollmentStatusVariant: Record<
    CourseEnrollment['status'],
    'default' | 'secondary' | 'outline' | 'destructive'
> = {
    pending: 'secondary',
    processing: 'secondary',
    confirmed: 'default',
    payment_review: 'destructive',
    expired: 'outline',
    refunded: 'outline',
    cancelled: 'outline',
};

export function formatCoursePrice(cents: number, currency: string): string {
    return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency,
        maximumFractionDigits: cents % 100 === 0 ? 0 : 2,
    }).format(cents / 100);
}

/** Where a group stands, as the teacher reads it. */
export function cohortState(cohort: CourseCohort): {
    label: string;
    variant: 'default' | 'secondary' | 'outline';
} {
    if (new Date(cohort.ends_at) < new Date()) {
        return { label: 'Terminé', variant: 'outline' };
    }
    if (cohort.has_started) {
        return { label: 'En cours', variant: 'default' };
    }

    return cohort.is_published
        ? { label: 'Ouvert aux inscriptions', variant: 'default' }
        : { label: 'Fermé aux inscriptions', variant: 'secondary' };
}
