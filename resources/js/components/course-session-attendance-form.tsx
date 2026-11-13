import { router } from '@inertiajs/react';
import { type FormEvent, useState } from 'react';
import { UserCheck } from 'reicon-react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Spinner } from '@/components/ui/spinner';
import {
    attendanceStatusLabels,
    type CourseAttendanceStatus,
    type CourseAttendanceStudent,
    type CourseSession,
} from '@/lib/course-cohorts';
import { update as updateAttendance } from '@/routes/course-sessions/attendance';

/** The teacher's call for one session: every confirmed student gets a status, and saving replaces the call. */
export function CourseSessionAttendanceForm({
    session,
    students,
    className = '',
    onSaved,
}: {
    session: CourseSession;
    students: CourseAttendanceStudent[];
    className?: string;
    onSaved?: () => void;
}) {
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
                    onSaved?.();
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
        <form
            onSubmit={submit}
            className={`flex flex-col gap-2 ${className}`.trim()}
        >
            <div className="flex items-center justify-between gap-2">
                <Label>Appel de la séance</Label>
                <span className="text-xs text-muted-foreground">
                    {students.length} élève{students.length > 1 ? 's' : ''}
                </span>
            </div>
            <ul className="flex flex-col gap-2">
                {students.map((student) => (
                    <li
                        key={student.enrollmentId}
                        className="flex items-center justify-between gap-3"
                    >
                        <span className="min-w-0 flex-1 truncate text-sm">
                            {student.name}
                        </span>
                        <Select
                            value={statuses[student.enrollmentId] ?? 'present'}
                            onValueChange={(value) =>
                                setStatuses((current) => ({
                                    ...current,
                                    [student.enrollmentId]:
                                        value as CourseAttendanceStatus,
                                }))
                            }
                        >
                            <SelectTrigger
                                size="sm"
                                className="w-40"
                                aria-label={`Présence de ${student.name}`}
                            >
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {(
                                    [
                                        'present',
                                        'absent',
                                        'excused',
                                    ] as CourseAttendanceStatus[]
                                ).map((status) => (
                                    <SelectItem key={status} value={status}>
                                        {attendanceStatusLabels[status]}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </li>
                ))}
            </ul>
            {error && (
                <p role="alert" className="text-sm text-destructive">
                    {error}
                </p>
            )}
            <Button
                type="submit"
                size="sm"
                variant="outline"
                className="self-end"
                disabled={processing}
            >
                {processing && <Spinner data-icon="inline-start" />}
                Enregistrer l’appel
            </Button>
        </form>
    );
}

/** The call in a dialog, so the calendar popover stays compact. */
export function CourseSessionAttendanceDialog({
    session,
    students,
    dateLabel,
}: {
    session: CourseSession;
    students: CourseAttendanceStudent[];
    dateLabel: string;
}) {
    const [open, setOpen] = useState(false);
    const hasCall = (session.attendances?.length ?? 0) > 0;

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button type="button" size="sm" variant="outline">
                    <UserCheck data-icon="inline-start" />
                    {hasCall ? 'Modifier l’appel' : 'Faire l’appel'}
                </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>
                        Appel de la séance {session.position}
                    </DialogTitle>
                    <DialogDescription>
                        {dateLabel} · {students.length} élève
                        {students.length > 1 ? 's' : ''} confirmé
                        {students.length > 1 ? 's' : ''}.
                    </DialogDescription>
                </DialogHeader>
                <CourseSessionAttendanceForm
                    session={session}
                    students={students}
                    onSaved={() => setOpen(false)}
                />
            </DialogContent>
        </Dialog>
    );
}
