import { useMemo, useSyncExternalStore } from 'react';
import {
    readExamSnapshot,
    subscribeToExamBookings,
    type ExamEnrollment,
} from '@/data/exam-booking';

export function useExamBookings(): ExamEnrollment[] {
    const snapshot = useSyncExternalStore(
        subscribeToExamBookings,
        readExamSnapshot,
        () => '[]',
    );
    return useMemo(() => JSON.parse(snapshot) as ExamEnrollment[], [snapshot]);
}
