import { useState } from 'react';
import { CalendarCheck } from 'reicon-react';
import { Badge } from '@/components/ui/badge';
import {
    Empty,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
} from '@/components/ui/empty';
import { useUserTimezone } from '@/hooks/use-browser-timezone';
import type {
    CourseAttendanceStudent,
    CourseSession,
} from '@/lib/course-cohorts';
import { AttendanceCall } from './attendance-call';
import { AttendanceTable } from './attendance-table';

type AttendancePanelProps = {
    sessions: CourseSession[];
    students: CourseAttendanceStudent[];
};

/** Lists the sessions to call, or shows the centered call for the selected one. */
export function AttendancePanel({ sessions, students }: AttendancePanelProps) {
    const timezone = useUserTimezone();
    const [selectedSession, setSelectedSession] =
        useState<CourseSession | null>(null);
    const format = (value: string, options: Intl.DateTimeFormatOptions) =>
        new Intl.DateTimeFormat('fr-FR', {
            timeZone: timezone,
            ...options,
        }).format(new Date(value));

    if (selectedSession) {
        return (
            <AttendanceCall
                session={selectedSession}
                students={students}
                dateLabel={format(selectedSession.starts_at, {
                    dateStyle: 'long',
                    timeStyle: 'short',
                })}
                onDone={() => setSelectedSession(null)}
            />
        );
    }

    return (
        <section className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h2 className="font-semibold">Présences</h2>
                    <p className="text-sm text-muted-foreground">
                        L’appel s’ouvre dès qu’une séance a commencé. Un nouvel
                        appel remplace le précédent.
                    </p>
                </div>
                <Badge variant="outline">
                    {sessions.length} séance
                    {sessions.length > 1 ? 's' : ''} commencée
                    {sessions.length > 1 ? 's' : ''}
                </Badge>
            </div>

            {sessions.length === 0 ? (
                <Empty className="border">
                    <EmptyHeader>
                        <EmptyMedia variant="icon">
                            <CalendarCheck aria-hidden="true" />
                        </EmptyMedia>
                        <EmptyTitle>Aucune séance commencée</EmptyTitle>
                        <EmptyDescription>
                            L’appel sera disponible ici dès le début de la
                            première séance.
                        </EmptyDescription>
                    </EmptyHeader>
                </Empty>
            ) : (
                <AttendanceTable
                    sessions={sessions}
                    formatDate={format}
                    onOpen={setSelectedSession}
                />
            )}
        </section>
    );
}
