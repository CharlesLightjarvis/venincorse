import type { CourseSession } from './course-booking';
import type { LevelSlug, TierKey } from './offer';
import type {
    GrammarPack,
    PracticeWorkshop,
    WorkshopOffer,
} from './workshop-catalog';

export type WorkshopCategory = 'grammar' | 'practice';

export interface WorkshopCohort {
    id: string;
    startsAt: string;
    seats: number;
    sessions: CourseSession[];
}

export interface WorkshopEnrollment {
    id: string;
    offerId: string;
    category: WorkshopCategory;
    title: string;
    level: LevelSlug;
    tier: TierKey;
    cohort: WorkshopCohort;
    name: string;
    email: string;
    goal: string;
    timezone: string;
    installments: boolean;
    totalCents: number;
    paymentsCents: number[];
    createdAt: string;
    status: 'confirmed' | 'cancelled';
    notes: string;
}

function nextWeekday(now: Date, weekday: number, hour: number): Date {
    const date = new Date(now);
    date.setUTCDate(
        date.getUTCDate() + ((weekday - date.getUTCDay() + 7) % 7 || 7),
    );
    date.setUTCHours(hour, 0, 0, 0);
    return date;
}

function buildSchedule(
    start: Date,
    sessionCount: number,
    durationMinutes: number,
    intervalDays: number,
): CourseSession[] {
    return Array.from({ length: sessionCount }, (_, index) => {
        const date = new Date(start);
        date.setUTCDate(date.getUTCDate() + index * intervalDays);
        return {
            startsAt: date.toISOString(),
            hours: durationMinutes / 60,
        };
    });
}

function grammarCohorts(
    pack: GrammarPack,
    tier: TierKey,
    now: Date,
): WorkshopCohort[] {
    const firstStart = nextWeekday(now, 1, 18);
    // Leave at least a full week of lead time so the 7-day cancellation window
    // remains usable for the first demo cohort.
    firstStart.setUTCDate(firstStart.getUTCDate() + 7);
    return [0, 1, 2].map((index) => {
        const start = new Date(firstStart);
        start.setUTCDate(start.getUTCDate() + index * 7);
        const sessions = buildSchedule(
            start,
            pack.sessions,
            pack.durationMinutes,
            7,
        );
        return {
            id: `${pack.id}-${tier}-${sessions[0].startsAt}`,
            startsAt: sessions[0].startsAt,
            sessions,
            seats: index === 2 ? 0 : tier === 'solo' ? 1 : index === 0 ? 4 : 2,
        };
    });
}

function practiceCohorts(
    workshop: PracticeWorkshop,
    tier: TierKey,
    level: LevelSlug,
    now: Date,
): WorkshopCohort[] {
    const options = [
        { weekday: 2, hour: 18 },
        { weekday: 4, hour: 18 },
        { weekday: 6, hour: 10 },
    ];
    return options.map((option, index) => {
        const start = nextWeekday(now, option.weekday, option.hour);
        const sessions = buildSchedule(start, 1, workshop.durationMinutes, 7);
        return {
            id: `${workshop.id}-${level}-${tier}-${sessions[0].startsAt}`,
            startsAt: sessions[0].startsAt,
            sessions,
            seats: index === 2 ? 0 : tier === 'solo' ? 1 : index === 0 ? 4 : 2,
        };
    });
}

export function getWorkshopCohorts(
    offer: WorkshopOffer,
    tier: TierKey,
    { level = 'a1', now = new Date() }: { level?: LevelSlug; now?: Date } = {},
): WorkshopCohort[] {
    return offer.category === 'grammar'
        ? grammarCohorts(offer.pack, tier, now)
        : practiceCohorts(offer.workshop, tier, level, now);
}

export function remainingWorkshopSeats(
    cohort: WorkshopCohort,
    bookings: WorkshopEnrollment[],
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

export function canCancelWorkshop(
    booking: WorkshopEnrollment,
    now = new Date(),
): boolean {
    if (booking.status !== 'confirmed') {
        return false;
    }
    const notice =
        booking.category === 'practice' ? 24 * 60 * 60 * 1000 : 7 * 86400000;
    return (
        now.getTime() <
        new Date(booking.cohort.sessions[0].startsAt).getTime() - notice
    );
}

export function workshopScheduleSummary(
    booking: Pick<WorkshopEnrollment, 'category' | 'cohort'>,
): string {
    if (booking.category === 'practice') {
        return '1 séance';
    }
    return `${booking.cohort.sessions.length} séances · 1 par semaine`;
}

const storageKey = 'venincorse.workshop-booking.v1';
const changeEvent = 'workshop-booking-change';
let memory = '[]';

export function readWorkshopSnapshot(): string {
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

export function readWorkshopBookings(): WorkshopEnrollment[] {
    return JSON.parse(readWorkshopSnapshot()) as WorkshopEnrollment[];
}

export function saveWorkshopBookings(bookings: WorkshopEnrollment[]): void {
    memory = JSON.stringify(bookings);
    try {
        localStorage.setItem(storageKey, memory);
    } catch {
        /* Keep the mock usable without persistent storage. */
    }
    window.dispatchEvent(new Event(changeEvent));
}

export function subscribeToWorkshopBookings(callback: () => void): () => void {
    window.addEventListener(changeEvent, callback);
    window.addEventListener('storage', callback);
    return () => {
        window.removeEventListener(changeEvent, callback);
        window.removeEventListener('storage', callback);
    };
}
