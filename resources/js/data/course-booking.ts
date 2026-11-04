export type CourseRhythm =
    | 'extensif'
    | 'accelere'
    | 'intensif'
    | 'super-intensif';
export type CourseTier = 'solo' | 'group';

export interface CourseSession {
    startsAt: string;
    hours: number;
}
export interface CourseCohort {
    id: string;
    startsAt: string;
    seats: number;
    sessions: CourseSession[];
}
export interface CourseEnrollment {
    id: string;
    level: string;
    tier: CourseTier;
    rhythm: CourseRhythm;
    cohort: CourseCohort;
    name: string;
    email: string;
    goal: string;
    timezone: string;
    installments: boolean;
    credit: number;
    totalCents: number;
    paymentsCents: number[];
    createdAt: string;
    status: 'confirmed' | 'cancelled';
    notes: string;
}

const rhythms: Record<CourseRhythm, { weekdays: number[]; hours: number }> = {
    extensif: { weekdays: [1, 3, 5], hours: 1 },
    accelere: { weekdays: [2, 4], hours: 3 },
    intensif: { weekdays: [1, 2, 3, 4, 5], hours: 3 },
    'super-intensif': { weekdays: [1, 2, 3, 4, 5], hours: 5 },
};

export function buildCourseSessions(
    start: string,
    rhythm: CourseRhythm,
): CourseSession[] {
    const plan = rhythms[rhythm];
    const date = new Date(start);
    const sessions: CourseSession[] = [];
    let remaining = 60;
    while (remaining > 0) {
        if (plan.weekdays.includes(date.getUTCDay())) {
            const hours = Math.min(plan.hours, remaining);
            sessions.push({ startsAt: date.toISOString(), hours });
            remaining -= hours;
        }
        date.setUTCDate(date.getUTCDate() + 1);
    }
    return sessions;
}

export function getCourseCohorts(
    level: string,
    rhythm: CourseRhythm,
    tier: CourseTier,
    now = new Date(),
): CourseCohort[] {
    const monday = new Date(now);
    monday.setUTCDate(
        monday.getUTCDate() + ((8 - monday.getUTCDay()) % 7 || 7),
    );
    monday.setUTCHours(9, 0, 0, 0);
    return [0, 1, 2].map((index) => {
        const date = new Date(monday);
        date.setUTCDate(date.getUTCDate() + index * 7);
        date.setUTCHours(index === 1 ? 14 : 9);
        const sessions = buildCourseSessions(date.toISOString(), rhythm);
        const startsAt = sessions[0].startsAt;
        return {
            id: `${level}-${tier}-${rhythm}-${startsAt}`,
            startsAt,
            sessions,
            seats: index === 2 ? 0 : tier === 'solo' ? 1 : index === 0 ? 4 : 2,
        };
    });
}

export function remainingCourseSeats(
    cohort: CourseCohort,
    bookings: CourseEnrollment[],
): number {
    return Math.max(
        0,
        cohort.seats -
            bookings.filter(
                (booking) =>
                    booking.cohort.id === cohort.id &&
                    booking.status === 'confirmed',
            ).length,
    );
}

export function getCourseQuote(
    basePrice: number,
    installments: boolean,
    credit = 0,
): { totalCents: number; paymentsCents: number[] } {
    const subtotal = Math.max(0, Math.round((basePrice - credit) * 100));
    const totalCents = installments ? Math.round(subtotal * 1.05) : subtotal;
    const first = Math.floor(totalCents / 3);
    return {
        totalCents,
        paymentsCents: installments
            ? [first, first, totalCents - 2 * first]
            : [totalCents],
    };
}

export function formatCourseMoney(cents: number): string {
    return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'EUR',
    }).format(cents / 100);
}

export function canCancelCourse(
    booking: CourseEnrollment,
    now = new Date(),
): boolean {
    return (
        booking.status === 'confirmed' &&
        now.getTime() <=
            new Date(booking.createdAt).getTime() + 14 * 86400000 &&
        now.getTime() < new Date(booking.cohort.startsAt).getTime()
    );
}

const storageKey = 'venincorse.course-booking.v1';
const changeEvent = 'course-booking-change';
let memory = '[]';

export function readCourseSnapshot(): string {
    if (typeof window === 'undefined') {
        return '[]';
    }
    try {
        const stored = localStorage.getItem(storageKey);
        if (stored && Array.isArray(JSON.parse(stored))) {
            return stored;
        }
    } catch {
        return memory;
    }
    return memory;
}

export function readCourseBookings(): CourseEnrollment[] {
    return JSON.parse(readCourseSnapshot()) as CourseEnrollment[];
}
export function saveCourseBookings(bookings: CourseEnrollment[]): void {
    memory = JSON.stringify(bookings);
    try {
        localStorage.setItem(storageKey, memory);
    } catch {
        /* Keep the mock usable without persistent storage. */
    }
    window.dispatchEvent(new Event(changeEvent));
}
export function subscribeToCourseBookings(callback: () => void): () => void {
    window.addEventListener(changeEvent, callback);
    window.addEventListener('storage', callback);
    return () => {
        window.removeEventListener(changeEvent, callback);
        window.removeEventListener('storage', callback);
    };
}
