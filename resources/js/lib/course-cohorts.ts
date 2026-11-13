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
    second_manuals_visible?: boolean;
    cancelled_at: string | null;
    cancellation_reason: string | null;
    has_started: boolean;
    sessions_count?: number;
    sessions?: CourseSession[];
    meeting_url?: string | null;
};

export type CourseAttendanceStatus = 'present' | 'absent' | 'excused';

/** A confirmed student of a group, as listed in the teacher's attendance call. */
export type CourseAttendanceStudent = {
    enrollmentId: string;
    name: string;
};

export type CourseSession = {
    id: number;
    position: number;
    starts_at: string;
    duration_minutes: number;
    meeting_url?: string | null;
    cancelled_at: string | null;
    cancellation_reason: string | null;
    attendances?:
        | {
              enrollment_id: string;
              status: CourseAttendanceStatus;
          }[]
        | null;
};

export const attendanceStatusLabels: Record<CourseAttendanceStatus, string> = {
    present: 'Présent',
    absent: 'Absent',
    excused: 'Absence justifiée',
};

/** "1 présent · 0 absent · 0 absence justifiée" for a session's call. */
export function describeAttendance(
    records: { status: CourseAttendanceStatus }[],
): string {
    const count = (status: CourseAttendanceStatus) =>
        records.filter((record) => record.status === status).length;
    const present = count('present');
    const absent = count('absent');
    const excused = count('excused');

    return `${present} présent${present > 1 ? 's' : ''} · ${absent} absent${absent > 1 ? 's' : ''} · ${excused} absence${excused > 1 ? 's' : ''} justifiée${excused > 1 ? 's' : ''}`;
}

/** A student's attendance across the sessions already called. */
export function summarizeAttendance(
    records: CourseAttendanceRecord[],
): { present: number; absent: number; excused: number; total: number; rate: number } {
    const count = (status: CourseAttendanceStatus) =>
        records.filter((record) => record.status === status).length;
    const present = count('present');
    const absent = count('absent');
    const excused = count('excused');
    const total = present + absent + excused;

    return {
        present,
        absent,
        excused,
        total,
        rate: total > 0 ? Math.round((present / total) * 100) : 0,
    };
}

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

export type CoursePaymentMethod = 'stripe' | 'offer' | 'bank_transfer' | 'transfer';

export const paymentMethodLabels: Record<CoursePaymentMethod, string> = {
    stripe: 'Carte bancaire',
    offer: 'Offert',
    bank_transfer: 'Virement',
    transfer: 'Transfert',
};

export type CourseAttendanceRecord = {
    session_id: number;
    status: CourseAttendanceStatus;
    session: {
        position: number;
        starts_at: string;
        cancelled_at: string | null;
    } | null;
};

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
    payment_method: CoursePaymentMethod;
    payment_reference?: string | null;
    installments?: CourseInstallment[];
    goal: string;
    created_at: string;
    paid_at: string | null;
    expires_at: string;
    withdrawal_ends_at: string;
    can_pay: boolean;
    cohort: CourseCohort;
    meeting_url?: string | null;
    refunded_cents: number;
    cancellation_reason: string | null;
    cancelled_at: string | null;
    management?: {
        paid_cents: number;
        refundable_cents: number;
        prorata_refund_cents: number;
        hours_done: number;
        can_cancel: boolean;
        withdrawal_open: boolean;
    };
    attendances?: CourseAttendanceRecord[];
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
    failure_message: string | null;
    can_pay: boolean;
    can_retry: boolean;
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

export type CohortStateKey =
    | 'open'
    | 'closed'
    | 'running'
    | 'finished'
    | 'cancelled';

/** The state of a group as a stable key, used by the list filters. */
export function cohortStateKey(cohort: CourseCohort): CohortStateKey {
    if (cohort.cancelled_at) {
        return 'cancelled';
    }
    if (new Date(cohort.ends_at) < new Date()) {
        return 'finished';
    }
    if (cohort.has_started) {
        return 'running';
    }

    return cohort.is_published ? 'open' : 'closed';
}

export const cohortStateFilterLabels: Record<CohortStateKey, string> = {
    open: 'Ouvert aux inscriptions',
    closed: 'Fermé aux inscriptions',
    running: 'En cours',
    finished: 'Terminé',
    cancelled: 'Annulé',
};

/** Where a group stands, as the teacher reads it. */
export function cohortState(cohort: CourseCohort): {
    label: string;
    variant: 'default' | 'secondary' | 'outline' | 'destructive';
} {
    if (cohort.cancelled_at) {
        return { label: 'Annulé', variant: 'destructive' };
    }
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
