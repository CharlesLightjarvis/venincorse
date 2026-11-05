import { useMemo, useSyncExternalStore } from 'react';
import {
    readWorkshopSnapshot,
    subscribeToWorkshopBookings,
    type WorkshopEnrollment,
} from '@/data/workshop-booking';

export function useWorkshopBookings(): WorkshopEnrollment[] {
    const snapshot = useSyncExternalStore(
        subscribeToWorkshopBookings,
        readWorkshopSnapshot,
        () => '[]',
    );
    return useMemo(
        () => JSON.parse(snapshot) as WorkshopEnrollment[],
        [snapshot],
    );
}
