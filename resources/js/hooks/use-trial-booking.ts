import { useMemo, useSyncExternalStore } from 'react';
import {
    readTrialSnapshot,
    subscribeToTrialState,
    type TrialDemoState,
} from '@/data/trial-booking';

export function useTrialBooking(): TrialDemoState {
    const snapshot = useSyncExternalStore(
        subscribeToTrialState,
        readTrialSnapshot,
        readTrialSnapshot,
    );
    return useMemo(() => JSON.parse(snapshot) as TrialDemoState, [snapshot]);
}
