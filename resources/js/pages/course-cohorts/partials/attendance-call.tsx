import { router } from '@inertiajs/react';
import { type FormEvent, useState } from 'react';
import { ArrowLeft, Check, FileCheck, X } from 'reicon-react';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import {
    type CourseAttendanceStatus,
    type CourseAttendanceStudent,
    type CourseSession,
} from '@/lib/course-cohorts';
import { update as updateAttendance } from '@/routes/course-sessions/attendance';

type AttendanceCallProps = {
    session: CourseSession;
    students: CourseAttendanceStudent[];
    dateLabel: string;
    onDone: () => void;
};

/** The centered call for one session, replacing the list inside the same tab. */
export function AttendanceCall({
    session,
    students,
    dateLabel,
    onDone,
}: AttendanceCallProps) {
    const saved = new Map(
        (session.attendances ?? []).map((attendance) => [
            attendance.enrollment_id,
            attendance.status,
        ]),
    );
    const [statuses, setStatuses] = useState<
        Record<string, CourseAttendanceStatus>
    >(() =>
        Object.fromEntries(
            students.map((student) => [
                student.enrollmentId,
                saved.get(student.enrollmentId) ?? 'present',
            ]),
        ),
    );
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        router.put(
            updateAttendance.url(session.id),
            { attendances: statuses },
            {
                preserveScroll: true,
                onStart: () => setProcessing(true),
                onFinish: () => setProcessing(false),
                onSuccess: () => {
                    setError(null);
                    onDone();
                },
                onError: (errors) =>
                    setError(
                        errors.attendances ??
                            'L’appel n’a pas pu être enregistré.',
                    ),
            },
        );
    }

    return (
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
            <div>
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={onDone}
                >
                    <ArrowLeft data-icon="inline-start" />
                    Retour aux présences
                </Button>
                <h2 className="mt-2 text-2xl font-semibold">
                    Prendre les présences
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                    Séance {session.position} · {dateLabel} · {students.length}{' '}
                    élève{students.length > 1 ? 's' : ''} confirmé
                    {students.length > 1 ? 's' : ''}.
                </p>
            </div>

            <form
                onSubmit={submit}
                className="flex flex-col gap-4 rounded-lg border border-border p-5"
            >
                <p className="text-sm text-muted-foreground">
                    Tous les élèves sont marqués présents par défaut. Modifie
                    uniquement les absents.
                </p>

                {students.length === 0 ? (
                    <p className="rounded-md border border-dashed border-border p-4 text-sm text-muted-foreground">
                        Aucun élève confirmé dans ce groupe.
                    </p>
                ) : (
                    <div className="divide-y divide-border rounded-md border border-border">
                        {students.map((student) => (
                            <div
                                key={student.enrollmentId}
                                className="flex flex-wrap items-center justify-between gap-3 p-3"
                            >
                                <span className="min-w-0 flex-1 truncate font-medium">
                                    {student.name}
                                </span>
                                <ToggleGroup
                                    type="single"
                                    variant="outline"
                                    size="sm"
                                    value={
                                        statuses[student.enrollmentId] ??
                                        'present'
                                    }
                                    onValueChange={(value) => {
                                        if (value) {
                                            setStatuses((current) => ({
                                                ...current,
                                                [student.enrollmentId]:
                                                    value as CourseAttendanceStatus,
                                            }));
                                        }
                                    }}
                                    aria-label={`Présence de ${student.name}`}
                                >
                                    <ToggleGroupItem value="present">
                                        <Check />
                                        Présent
                                    </ToggleGroupItem>
                                    <ToggleGroupItem value="absent">
                                        <X />
                                        Absent
                                    </ToggleGroupItem>
                                    <ToggleGroupItem value="excused">
                                        <FileCheck />
                                        Justifié
                                    </ToggleGroupItem>
                                </ToggleGroup>
                            </div>
                        ))}
                    </div>
                )}

                {error && (
                    <p role="alert" className="text-sm text-destructive">
                        {error}
                    </p>
                )}

                <div className="flex flex-wrap justify-end gap-3">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onDone}
                        disabled={processing}
                    >
                        Annuler
                    </Button>
                    <Button
                        type="submit"
                        disabled={processing || students.length === 0}
                    >
                        {processing && <Spinner data-icon="inline-start" />}
                        Enregistrer les présences
                    </Button>
                </div>
            </form>
        </div>
    );
}
