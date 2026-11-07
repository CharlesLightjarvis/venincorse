export type CourseCohort = {
    id: number;
    level: string;
    level_label: string;
    format: 'group' | 'solo';
    format_label: string;
    rhythm: string;
    rhythm_label: string;
    starts_at: string;
    ends_at: string;
    capacity: number;
    seats_left: number;
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
