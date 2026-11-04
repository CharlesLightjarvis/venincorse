export interface TrialBooking {
    id: string;
    startsAt: string;
    name: string;
    email: string;
    level: string;
    goal: string;
    timezone: string;
    status: 'confirmed' | 'completed' | 'cancelled';
    payment: 'paid' | 'refunded';
    notes: string;
    recommendation: string;
}

export interface TrialAvailability {
    weekdays: number[];
    hours: number[];
    blockedDates: string[];
}

export interface TrialDemoState {
    bookings: TrialBooking[];
    availability: TrialAvailability;
}

export const trialPrice = 39;
export const teacherTimezone = 'UTC';
export const demoStorageKey = 'venincorse.trial-booking.v1';
export const demoChangeEvent = 'trial-booking-change';
export const defaultAvailability: TrialAvailability = {
    weekdays: [1, 2, 3, 4, 5, 6],
    hours: [9, 11, 14, 16, 18],
    blockedDates: [],
};

export function getTrialSlots(
    state: TrialDemoState,
    now = new Date(),
): string[] {
    const slots: string[] = [];
    const occupied = new Set(
        state.bookings
            .filter((booking) => booking.status !== 'cancelled')
            .map((booking) => booking.startsAt),
    );

    for (let offset = 0; offset < 14; offset += 1) {
        const day = new Date(now);
        day.setUTCDate(day.getUTCDate() + offset);

        if (!state.availability.weekdays.includes(day.getUTCDay())) {
            continue;
        }

        for (const hour of [...state.availability.hours].sort(
            (a, b) => a - b,
        )) {
            day.setUTCHours(hour, 0, 0, 0);
            const slot = day.toISOString();
            if (
                day.getTime() >= now.getTime() + 24 * 60 * 60 * 1000 &&
                !state.availability.blockedDates.includes(slot.slice(0, 10)) &&
                !occupied.has(slot)
            ) {
                slots.push(slot);
            }
        }
    }

    return slots;
}

export function createTrialDemoState(now = new Date()): TrialDemoState {
    const state: TrialDemoState = {
        bookings: [],
        availability: structuredClone(defaultAvailability),
    };
    const slots = getTrialSlots(state, now);
    state.bookings = [
        {
            name: 'Amina K.',
            email: 'amina@example.test',
            level: 'A1',
            goal: 'Vivre en Allemagne',
            startsAt: slots[1],
        },
        {
            name: 'Thomas B.',
            email: 'thomas@example.test',
            level: 'B1',
            goal: 'Préparer un entretien',
            startsAt: slots[6],
        },
        {
            name: 'Sarah N.',
            email: 'sarah@example.test',
            level: 'Je ne sais pas',
            goal: 'Découvrir la méthode',
            startsAt: slots[10],
        },
    ].map((person, index) => ({
        ...person,
        id: `demo-${index + 1}`,
        timezone: 'Europe/Paris',
        status: 'confirmed',
        payment: 'paid',
        notes: '',
        recommendation: '',
    }));

    return state;
}

const initialSnapshot = JSON.stringify(createTrialDemoState());
let memorySnapshot = initialSnapshot;

export function readTrialSnapshot(): string {
    if (typeof window === 'undefined') {
        return initialSnapshot;
    }

    try {
        const stored = window.localStorage.getItem(demoStorageKey);
        if (stored) {
            const parsed = JSON.parse(stored) as Partial<TrialDemoState>;
            if (
                Array.isArray(parsed.bookings) &&
                Array.isArray(parsed.availability?.hours) &&
                Array.isArray(parsed.availability?.weekdays) &&
                Array.isArray(parsed.availability?.blockedDates)
            ) {
                return stored;
            }
        }
    } catch {
        return memorySnapshot;
    }

    return memorySnapshot;
}

export function readTrialState(): TrialDemoState {
    return JSON.parse(readTrialSnapshot()) as TrialDemoState;
}

export function saveTrialState(state: TrialDemoState): void {
    memorySnapshot = JSON.stringify(state);
    try {
        window.localStorage.setItem(demoStorageKey, memorySnapshot);
    } catch {
        // The demo remains usable in memory when browser storage is unavailable.
    }
    window.dispatchEvent(new Event(demoChangeEvent));
}

export function subscribeToTrialState(callback: () => void): () => void {
    window.addEventListener(demoChangeEvent, callback);
    window.addEventListener('storage', callback);
    return () => {
        window.removeEventListener(demoChangeEvent, callback);
        window.removeEventListener('storage', callback);
    };
}

export function formatTrialDate(value: string, timezone: string): string {
    return new Intl.DateTimeFormat('fr-FR', {
        timeZone: timezone,
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        hour: '2-digit',
        minute: '2-digit',
    }).format(new Date(value));
}

export function canChangeTrial(
    booking: TrialBooking,
    now = new Date(),
): boolean {
    return (
        booking.status === 'confirmed' &&
        new Date(booking.startsAt).getTime() - now.getTime() >=
            24 * 60 * 60 * 1000
    );
}
