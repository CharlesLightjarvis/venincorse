import type { CourseSession } from './course-booking';

export const examProviders = ['goethe', 'osd', 'telc'] as const;
export const examLevels = ['a1', 'a2', 'b1', 'b2'] as const;
export const examScopes = ['full', 'written', 'oral'] as const;
export type ExamProvider = (typeof examProviders)[number];
export type ExamLevel = (typeof examLevels)[number];
export type ExamScope = (typeof examScopes)[number];
export type ExamPace = 'regular' | 'intensive';
export type ExamTier = 'solo' | 'group';

export const examProviderLabels: Record<ExamProvider, string> = {
    goethe: 'Goethe-Institut',
    osd: 'ÖSD',
    telc: 'TELC',
};
export const examScopeLabels: Record<ExamScope, string> = {
    full: 'Préparation complète',
    written: 'Écrit · Schriftlich',
    oral: 'Oral · Mündlich',
};
export const examPaceLabels: Record<ExamPace, string> = {
    regular: 'Régulier · 2 × 90 min / semaine',
    intensive: 'Intensif · 5 × 90 min / semaine',
};
export const examScopeDescriptions: Record<ExamScope, string> = {
    full: 'Compréhension écrite et orale, expression écrite et orale : travailler toutes les compétences du certificat visé.',
    written:
        'Lecture, compréhension orale et production écrite selon le format visé. La répartition des épreuves varie selon le certificat.',
    oral: 'Expression orale : se présenter, interagir et prendre la parole selon les tâches du certificat visé.',
};

const basePrices: Record<ExamLevel, Record<ExamTier, number>> = {
    a1: { solo: 350, group: 170 },
    a2: { solo: 490, group: 240 },
    b1: { solo: 890, group: 430 },
    b2: { solo: 950, group: 460 },
};
const providerAdjustments: Record<ExamProvider, Record<ExamTier, number>> = {
    osd: { solo: 0, group: 0 },
    goethe: { solo: 40, group: 20 },
    telc: { solo: 20, group: 10 },
};
const scopeRatios: Record<ExamScope, number> = {
    full: 1,
    written: 0.65,
    oral: 0.45,
};
const trainingSessions: Record<ExamLevel, number> = {
    a1: 4,
    a2: 6,
    b1: 10,
    b2: 10,
};

export function getExamPackage(
    provider: ExamProvider,
    level: ExamLevel,
    scope: ExamScope,
    tier: ExamTier,
) {
    const training =
        scope === 'full'
            ? trainingSessions[level]
            : Math.ceil(
                  trainingSessions[level] * (scope === 'written' ? 0.6 : 0.4),
              );
    const mockSessions =
        scope === 'full' && ['b1', 'b2'].includes(level) ? 2 : 1;
    const sessionCount = training + mockSessions;
    return {
        priceCents: Math.round(
            (basePrices[level][tier] + providerAdjustments[provider][tier]) *
                scopeRatios[scope] *
                100,
        ),
        trainingSessions: training,
        mockSessions,
        sessionCount,
        hours: sessionCount * 1.5,
    };
}

export interface ExamCohort {
    id: string;
    startsAt: string;
    seats: number;
    sessions: CourseSession[];
}
export interface ExamEnrollment {
    id: string;
    provider: ExamProvider;
    level: ExamLevel;
    scope: ExamScope;
    tier: ExamTier;
    pace: ExamPace;
    cohort: ExamCohort;
    name: string;
    email: string;
    goal: string;
    examDate: string;
    timezone: string;
    installments: boolean;
    totalCents: number;
    paymentsCents: number[];
    createdAt: string;
    status: 'confirmed' | 'cancelled';
    notes: string;
}

export function getExamCohorts(
    provider: ExamProvider,
    level: ExamLevel,
    scope: ExamScope,
    tier: ExamTier,
    pace: ExamPace,
    now = new Date(),
): ExamCohort[] {
    const monday = new Date(now);
    monday.setUTCDate(
        monday.getUTCDate() + ((8 - monday.getUTCDay()) % 7 || 7),
    );
    const { sessionCount } = getExamPackage(provider, level, scope, tier);
    return [0, 1, 2].map((index) => {
        const date = new Date(monday);
        date.setUTCDate(date.getUTCDate() + index * 7);
        date.setUTCHours(index === 1 ? 15 : 10, 0, 0, 0);
        const sessions: CourseSession[] = [];
        while (sessions.length < sessionCount) {
            if (
                (pace === 'regular' ? [2, 4] : [1, 2, 3, 4, 5]).includes(
                    date.getUTCDay(),
                )
            ) {
                sessions.push({ startsAt: date.toISOString(), hours: 1.5 });
            }
            date.setUTCDate(date.getUTCDate() + 1);
        }
        const startsAt = sessions[0].startsAt;
        return {
            id: `${provider}-${level}-${scope}-${tier}-${pace}-${startsAt}`,
            startsAt,
            sessions,
            seats: index === 2 ? 0 : tier === 'solo' ? 1 : index === 0 ? 4 : 2,
        };
    });
}

export function remainingExamSeats(
    cohort: ExamCohort,
    bookings: ExamEnrollment[],
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

export function isExamDateCompatible(
    cohort: ExamCohort,
    examDate: string,
): boolean {
    if (!examDate) {
        return true;
    }
    const last = cohort.sessions.at(-1)!;
    return (
        new Date(`${examDate}T00:00:00Z`).getTime() >
        new Date(last.startsAt).getTime() + last.hours * 3600000
    );
}

export function canCancelExam(
    booking: ExamEnrollment,
    now = new Date(),
): boolean {
    return (
        booking.status === 'confirmed' &&
        now.getTime() <=
            new Date(booking.createdAt).getTime() + 14 * 86400000 &&
        now.getTime() < new Date(booking.cohort.startsAt).getTime()
    );
}

const storageKey = 'venincorse.exam-booking.v1';
const changeEvent = 'exam-booking-change';
let memory = '[]';
export function readExamSnapshot(): string {
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
export function readExamBookings(): ExamEnrollment[] {
    return JSON.parse(readExamSnapshot()) as ExamEnrollment[];
}
export function saveExamBookings(bookings: ExamEnrollment[]): void {
    memory = JSON.stringify(bookings);
    try {
        localStorage.setItem(storageKey, memory);
    } catch {
        /* The mock stays usable in memory when storage is unavailable. */
    }
    window.dispatchEvent(new Event(changeEvent));
}
export function subscribeToExamBookings(callback: () => void): () => void {
    window.addEventListener(changeEvent, callback);
    window.addEventListener('storage', callback);
    return () => {
        window.removeEventListener(changeEvent, callback);
        window.removeEventListener('storage', callback);
    };
}
