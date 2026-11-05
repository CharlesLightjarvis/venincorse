import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { formatTrialDate } from '@/data/trial-booking';
import type { CourseSession } from '@/data/course-booking';

export function CourseSchedule({
    sessions,
    timezone,
}: {
    sessions: CourseSession[];
    timezone: string;
}) {
    const [expanded, setExpanded] = useState(false);
    return (
        <div className="flex flex-col gap-3">
            <h3 className="font-semibold">
                Ton planning · {sessions.length}{' '}
                {sessions.length > 1 ? 'séances' : 'séance'} ·{' '}
                {sessions
                    .reduce((total, session) => total + session.hours, 0)
                    .toLocaleString('fr-FR')}{' '}
                h
            </h3>
            <p className="text-xs text-muted-foreground">
                Horaires dans le fuseau {timezone}.
            </p>
            <ol className="divide-y divide-border/50">
                {(expanded ? sessions : sessions.slice(0, 4)).map(
                    (session, index) => (
                        <li
                            key={session.startsAt}
                            className="flex items-start justify-between gap-3 py-3 text-sm"
                        >
                            <span>
                                {index + 1}.{' '}
                                {formatTrialDate(session.startsAt, timezone)}
                            </span>
                            <span className="shrink-0 text-muted-foreground">
                                {session.hours.toLocaleString('fr-FR')} h
                            </span>
                        </li>
                    ),
                )}
            </ol>
            {sessions.length > 4 && (
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="self-start"
                    onClick={() => setExpanded(!expanded)}
                >
                    {expanded
                        ? 'Réduire le planning'
                        : `Voir les ${sessions.length} séances`}
                </Button>
            )}
        </div>
    );
}
