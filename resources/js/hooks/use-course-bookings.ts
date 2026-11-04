import { useMemo, useSyncExternalStore } from 'react';
import {
    readCourseSnapshot,
    subscribeToCourseBookings,
    type CourseEnrollment,
} from '@/data/course-booking';

export function useCourseBookings(): CourseEnrollment[] {
    const snapshot = useSyncExternalStore(
        subscribeToCourseBookings,
        readCourseSnapshot,
        () => '[]',
    );
    return useMemo(
        () => JSON.parse(snapshot) as CourseEnrollment[],
        [snapshot],
    );
}
