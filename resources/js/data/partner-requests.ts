export interface PartnerProfile {
    name: string;
    email: string;
    country: string;
    role: string;
    experience: string;
    students: string;
    levels: string[];
    format: string;
    needs: string[];
    project: string;
    timeline: string;
    consent: boolean;
}

export interface PartnerRequest extends PartnerProfile {
    id: string;
    createdAt: string;
    status: 'pending' | 'reviewing' | 'contacted';
    notes: string;
}

export const emptyPartnerProfile: PartnerProfile = {
    name: '',
    email: '',
    country: '',
    role: '',
    experience: '',
    students: '',
    levels: [],
    format: '',
    needs: [],
    project: '',
    timeline: '',
    consent: false,
};

export function isPartnerStepComplete(
    profile: PartnerProfile,
    step: number,
): boolean {
    if (step === 0) {
        return Boolean(
            profile.name.trim() &&
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email.trim()) &&
            profile.country.trim() &&
            profile.role &&
            profile.experience,
        );
    }
    if (step === 1) {
        return Boolean(
            profile.students && profile.levels.length && profile.format,
        );
    }
    if (step === 2) {
        return Boolean(
            profile.needs.length &&
            profile.project.trim().length >= 20 &&
            profile.timeline,
        );
    }
    return (
        step === 3 &&
        profile.consent &&
        [0, 1, 2].every((index) => isPartnerStepComplete(profile, index))
    );
}

const storageKey = 'venincorse-partner-requests';
const changeEvent = 'venincorse-partner-requests-change';
let memory = '[]';

export function readPartnerSnapshot(): string {
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

export function readPartnerRequests(): PartnerRequest[] {
    return JSON.parse(readPartnerSnapshot()) as PartnerRequest[];
}

export function savePartnerRequests(requests: PartnerRequest[]): void {
    memory = JSON.stringify(requests);
    try {
        localStorage.setItem(storageKey, memory);
    } catch {
        /* Keep the mock usable without persistent storage. */
    }
    window.dispatchEvent(new Event(changeEvent));
}

export function submitPartnerRequest(profile: PartnerProfile): PartnerRequest {
    if (!isPartnerStepComplete(profile, 3)) {
        throw new Error('Incomplete partner request');
    }
    const request: PartnerRequest = {
        ...profile,
        name: profile.name.trim(),
        email: profile.email.trim(),
        country: profile.country.trim(),
        project: profile.project.trim(),
        id: `partner-${Date.now().toString(36)}-${crypto.getRandomValues(new Uint32Array(1))[0].toString(36)}`,
        createdAt: new Date().toISOString(),
        status: 'pending',
        notes: '',
    };
    savePartnerRequests([request, ...readPartnerRequests()]);
    return request;
}

export function subscribeToPartnerRequests(callback: () => void): () => void {
    window.addEventListener(changeEvent, callback);
    window.addEventListener('storage', callback);
    return () => {
        window.removeEventListener(changeEvent, callback);
        window.removeEventListener('storage', callback);
    };
}
