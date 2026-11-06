import { useSyncExternalStore } from 'react';
import { usePage } from '@inertiajs/react';
import type { Auth } from '@/types';

const subscribe = () => () => {};

export function browserTimeZone(): string {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
}

export function useBrowserTimezone(): string {
    return useSyncExternalStore(subscribe, browserTimeZone, () => 'UTC');
}

export function useUserTimezone(): string {
    const { auth } = usePage<{ auth: Auth }>().props;
    const detected = useBrowserTimezone();

    return auth.user?.timezone ?? detected;
}

export function timezoneIdentifiers(current?: string | null): string[] {
    return [
        ...new Set([
            'UTC',
            ...(current ? [current] : []),
            ...Intl.supportedValuesOf('timeZone'),
        ]),
    ].sort();
}
