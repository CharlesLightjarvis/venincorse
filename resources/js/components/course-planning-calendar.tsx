import 'calendarkit-pro/styles.css';
import {
    Scheduler,
    type CalendarEvent,
    type CalendarTheme,
    type ViewType,
} from 'calendarkit-pro';
import { fr } from 'date-fns/locale';
import { router, useForm } from '@inertiajs/react';
import {
    type CSSProperties,
    type FormEvent,
    type ReactNode,
    useEffect,
    useId,
    useLayoutEffect,
    useRef,
    useState,
} from 'react';
import {
    CalendarDays,
    CalendarX,
    Clock,
    Refresh,
    UserCheck,
    Video,
    X,
    type IconComponent,
} from 'reicon-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CourseSessionAttendanceDialog } from '@/components/course-session-attendance-form';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { Textarea } from '@/components/ui/textarea';
import { useUserTimezone } from '@/hooks/use-browser-timezone';
import { useIsMobile } from '@/hooks/use-mobile';
import {
    attendanceStatusLabels,
    describeAttendance,
    type CourseAttendanceStatus,
    type CourseAttendanceStudent,
    type CourseSession,
} from '@/lib/course-cohorts';
import { update as updateSession } from '@/routes/course-sessions';

export type CoursePlanningSession = CourseSession;

export type CoursePlanningStudent = CourseAttendanceStudent;

/** CalendarKit's colours follow the shadcn tokens, so the calendar matches the rest of the app. */
const theme: CalendarTheme = {
    preset: 'calm',
    colors: {
        primary: 'var(--primary)',
        primaryForeground: 'var(--primary-foreground)',
        secondary: 'var(--secondary)',
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        border: 'var(--border)',
        muted: 'var(--muted)',
        mutedForeground: 'var(--muted-foreground)',
        accent: 'var(--accent)',
        destructive: 'var(--destructive)',
        ring: 'var(--ring)',
    },
    fontFamily: 'var(--font-sans)',
    borderRadius: 'var(--radius)',
};

/** The native CalendarKit popover lives inside its themed root; give the same tokens to our card. */
const popoverTheme: CSSProperties = {
    '--ck-primary': 'var(--primary)',
    '--ck-primary-foreground': 'var(--primary-foreground)',
    '--ck-secondary': 'var(--secondary)',
    '--ck-background': 'var(--background)',
    '--ck-foreground': 'var(--foreground)',
    '--ck-border': 'var(--border)',
    '--ck-muted': 'var(--muted)',
    '--ck-muted-foreground': 'var(--muted-foreground)',
    '--ck-accent': 'var(--accent)',
    '--ck-destructive': 'var(--destructive)',
    '--ck-ring': 'var(--ring)',
    '--ck-radius': 'var(--radius)',
    '--ck-font': 'var(--font-sans)',
    '--ck-font-display': 'var(--font-sans)',
} as CSSProperties;

const POPOVER_WIDTH = 360;
const POPOVER_MARGIN = 8;
const POPOVER_GAP = 12;
const FOCUSABLE =
    'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

type AnchorBox = {
    left: number;
    top: number;
    right: number;
    bottom: number;
};

export function CoursePlanningCalendar({
    sessions,
    defaultMeetingUrl = null,
    canManage = false,
    canJoin = false,
    students = [],
    selfAttendances = [],
}: {
    sessions: CoursePlanningSession[];
    defaultMeetingUrl?: string | null;
    canManage?: boolean;
    canJoin?: boolean;
    /** The confirmed students of the group, for the attendance call. */
    students?: CoursePlanningStudent[];
    /** The student's own attendance, to show them whether they were marked present. */
    selfAttendances?: { session_id: number; status: CourseAttendanceStatus }[];
}) {
    const browserTimezone = useUserTimezone();
    const [timezone, setTimezone] = useState(browserTimezone);
    const [selected, setSelected] = useState<{
        id: number;
        anchor: AnchorBox | null;
    } | null>(null);
    const selectedSession =
        sessions.find((session) => session.id === selected?.id) ?? null;
    const events: CalendarEvent[] = sessions.map((session) => {
        const start = new Date(session.starts_at);

        return {
            id: `session-${session.id}`,
            title: `Séance ${session.position}${session.cancelled_at ? ' · annulée' : ''}`,
            start,
            end: new Date(start.getTime() + session.duration_minutes * 60_000),
            color: session.cancelled_at ? 'var(--destructive)' : undefined,
            draggable: false,
            resizable: false,
        };
    });
    // Open on the next session (or the first one) rather than an empty current month.
    const focus = sessions.reduce<Date | null>((next, session) => {
        const start = new Date(session.starts_at);

        if (
            session.cancelled_at ||
            start.getTime() + session.duration_minutes * 60_000 < Date.now()
        ) {
            return next;
        }

        return !next || start < next ? start : next;
    }, null);
    // The week and day views open one hour before the session instead of at the current time.
    const focusHour = focus ? Math.max(0, focus.getHours() - 1) : 8;
    const [view, setView] = useState<ViewType>('month');
    const [date, setDate] = useState<Date>(
        () => focus ?? new Date(sessions[0]?.starts_at ?? Date.now()),
    );

    // CalendarKit anchors its popover on the event box, not on the pointer.
    function openSession(event: CalendarEvent) {
        const id = Number(event.id.replace('session-', '')) || null;

        if (!id) {
            return;
        }

        const node = document.querySelector<HTMLElement>(
            `[data-ck-event-id="${event.id}"]`,
        );
        const box = node?.getBoundingClientRect();

        setSelected({
            id,
            anchor: box
                ? {
                      left: box.left,
                      top: box.top,
                      right: box.right,
                      bottom: box.bottom,
                  }
                : null,
        });
    }

    return (
        <>
            <div className="h-[34rem] overflow-hidden rounded-lg border border-border lg:h-[44rem]">
                <Scheduler
                    key={view}
                    events={events}
                    view={view}
                    onViewChange={setView}
                    date={date}
                    onDateChange={setDate}
                    onEventClick={openSession}
                    language="fr"
                    locale={fr}
                    timezone={timezone}
                    onTimezoneChange={setTimezone}
                    theme={theme}
                    layout="classic"
                    dayStartHour={7}
                    dayEndHour={22}
                    scrollToHour={focusHour}
                    injectStyles={false}
                    readOnly
                />
            </div>
            {selectedSession && selected && (
                <SessionPopover
                    session={selectedSession}
                    totalSessions={sessions.length}
                    anchor={selected.anchor}
                    timezone={timezone}
                    defaultMeetingUrl={defaultMeetingUrl}
                    canManage={canManage}
                    canJoin={canJoin}
                    students={students}
                    selfAttendance={
                        selfAttendances.find(
                            (attendance) =>
                                attendance.session_id === selectedSession.id,
                        )?.status ?? null
                    }
                    onClose={() => setSelected(null)}
                />
            )}
        </>
    );
}

function SessionPopover({
    session,
    totalSessions,
    anchor,
    timezone,
    defaultMeetingUrl,
    canManage,
    canJoin,
    students,
    selfAttendance,
    onClose,
}: {
    session: CoursePlanningSession;
    totalSessions: number;
    anchor: AnchorBox | null;
    timezone: string;
    defaultMeetingUrl: string | null;
    canManage: boolean;
    canJoin: boolean;
    students: CoursePlanningStudent[];
    selfAttendance: CourseAttendanceStatus | null;
    onClose: () => void;
}) {
    const docked = useIsMobile();
    const titleId = useId();
    const ref = useRef<HTMLDivElement>(null);
    const onCloseRef = useRef(onClose);
    onCloseRef.current = onClose;
    const [height, setHeight] = useState(0);
    const [viewport, setViewport] = useState(() =>
        typeof window === 'undefined'
            ? { width: 1024, height: 768 }
            : { width: window.innerWidth, height: window.innerHeight },
    );

    useEffect(() => {
        const onResize = () =>
            setViewport({
                width: window.innerWidth,
                height: window.innerHeight,
            });

        window.addEventListener('resize', onResize);

        return () => window.removeEventListener('resize', onResize);
    }, []);

    // Focus the card once, trap Tab, close on Escape and give focus back to the event.
    useEffect(() => {
        const origin =
            document.activeElement instanceof HTMLElement
                ? document.activeElement
                : null;
        const node = ref.current;

        node?.focus();

        const onKey = (event: KeyboardEvent) => {
            // Let a dialog opened from the card keep its own focus trap and Escape handling.
            if (
                event.target instanceof Element &&
                event.target.closest('[data-slot="dialog-content"]')
            ) {
                return;
            }

            if (event.key === 'Escape') {
                onCloseRef.current();

                return;
            }

            if (event.key !== 'Tab' || !node) {
                return;
            }

            const items = [
                ...node.querySelectorAll<HTMLElement>(FOCUSABLE),
            ].filter((element) => !element.closest('[hidden]'));
            const edge = event.shiftKey ? items[0] : items[items.length - 1];
            const active = document.activeElement;

            if (
                edge &&
                (active === edge || active === node || !node.contains(active))
            ) {
                event.preventDefault();
                (event.shiftKey ? items[items.length - 1] : items[0])?.focus();
            }
        };

        document.addEventListener('keydown', onKey);

        return () => {
            document.removeEventListener('keydown', onKey);
            origin?.focus();
        };
    }, []);

    // The card grows when an error appears: keep its placement true to its size.
    useLayoutEffect(() => {
        const node = ref.current;

        if (!node) {
            return;
        }

        const measure = () => setHeight(node.offsetHeight);
        const observer = new ResizeObserver(measure);

        measure();
        observer.observe(node);

        return () => observer.disconnect();
    }, []);

    const start = new Date(session.starts_at);
    const end = new Date(start.getTime() + session.duration_minutes * 60_000);
    const date = new Intl.DateTimeFormat('fr-FR', {
        timeZone: timezone,
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    }).format(start);
    const time = new Intl.DateTimeFormat('fr-FR', {
        timeZone: timezone,
        hour: '2-digit',
        minute: '2-digit',
    });
    const meetingUrl = session.meeting_url || defaultMeetingUrl;
    const cancelled = Boolean(session.cancelled_at);
    const started = start.getTime() <= Date.now();
    const upcoming = start.getTime() > Date.now();
    const attendanceRecords = session.attendances ?? [];
    const dateLabel = `${date.charAt(0).toUpperCase()}${date.slice(1)} à ${time.format(start)}`;
    const width = Math.min(POPOVER_WIDTH, viewport.width - 2 * POPOVER_MARGIN);
    const place = anchor
        ? placeBeside(anchor, { width, height }, viewport)
        : {
              left: Math.max(
                  POPOVER_MARGIN,
                  (viewport.width - POPOVER_WIDTH) / 2,
              ),
              top: 80,
          };

    return (
        <>
            <div
                data-ck-backdrop
                aria-hidden="true"
                className={
                    docked
                        ? 'ck:fixed ck:inset-0 ck:z-40 ck:animate-fade-in ck:bg-black/20'
                        : 'ck:fixed ck:inset-0 ck:z-40'
                }
                onClick={onClose}
            />
            <div
                ref={ref}
                role="dialog"
                aria-modal="true"
                aria-labelledby={titleId}
                tabIndex={-1}
                data-ck-docked={docked || undefined}
                className={
                    docked
                        ? 'ck:fixed ck:inset-x-0 ck:bottom-0 ck:z-50 ck:flex ck:max-h-[85%] ck:flex-col ck:overflow-y-auto ck:rounded-t-3xl ck:border-t ck:border-border ck:bg-background ck:p-5 ck:animate-rise-in ck:outline-none'
                        : 'ck:fixed ck:z-50 ck:flex ck:flex-col ck:overflow-y-auto ck:rounded-2xl ck:border ck:border-border ck:bg-background ck:p-4 ck:animate-pop-in ck:outline-none'
                }
                style={
                    docked
                        ? {
                              ...popoverTheme,
                              boxShadow: '0 -20px 50px -20px rgb(0 0 0 / 0.4)',
                          }
                        : {
                              ...popoverTheme,
                              left: place.left,
                              top: place.top,
                              width,
                              maxWidth: `calc(100vw - ${2 * POPOVER_MARGIN}px)`,
                              maxHeight: viewport.height - 2 * POPOVER_MARGIN,
                              scrollbarGutter: 'stable',
                              boxShadow:
                                  '0 18px 40px -16px rgb(0 0 0 / 0.35), 0 2px 6px -2px rgb(0 0 0 / 0.12)',
                          }
                }
            >
                <div className="ck:flex ck:items-start ck:gap-3">
                    <span
                        className="ck:mt-2 ck:h-3 ck:w-3 ck:shrink-0 ck:rounded-[4px]"
                        style={{
                            backgroundColor: cancelled
                                ? 'var(--destructive)'
                                : 'var(--primary)',
                        }}
                        aria-hidden="true"
                    />
                    <h2
                        id={titleId}
                        className="ck:flex-1 ck:min-w-0 ck:font-display ck:text-xl ck:font-semibold ck:leading-snug ck:break-words ck:text-balance ck:text-foreground"
                    >
                        Séance {session.position}
                    </h2>
                    {cancelled && <Badge variant="destructive">Annulée</Badge>}
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Fermer"
                        className="ck:-mt-0.5 ck:-mr-1.5 ck:inline-flex ck:h-8 ck:w-8 ck:items-center ck:justify-center ck:rounded-lg ck:text-muted-foreground ck:transition-colors ck:hover:bg-muted ck:hover:text-foreground"
                    >
                        <X className="ck:h-4 ck:w-4" aria-hidden="true" />
                    </button>
                </div>

                <div className="ck:mt-2">
                    <PopoverRow icon={Clock}>
                        <p className="ck:font-medium ck:text-foreground ck:first-letter:uppercase">
                            {date}
                        </p>
                        <p className="ck:tabular-nums">
                            {time.format(start)} – {time.format(end)} ·{' '}
                            {formatDuration(session.duration_minutes)}
                        </p>
                        <p className="ck:text-xs">{timezone}</p>
                    </PopoverRow>
                    <PopoverRow icon={CalendarDays}>
                        <p className="ck:text-foreground">
                            Séance {session.position} sur {totalSessions}
                        </p>
                    </PopoverRow>
                    {cancelled && session.cancellation_reason && (
                        <PopoverRow icon={CalendarX}>
                            <p className="ck:text-foreground">Séance annulée</p>
                            <p className="ck:text-xs">
                                {session.cancellation_reason}
                            </p>
                        </PopoverRow>
                    )}
                    {selfAttendance && (
                        <PopoverRow icon={UserCheck}>
                            <p className="ck:text-foreground">
                                Présence :{' '}
                                {attendanceStatusLabels[selfAttendance]}
                            </p>
                        </PopoverRow>
                    )}
                </div>

                {canManage && (
                    <div className="mt-3 flex flex-col gap-3 border-t border-border pt-3">
                        <SessionMeetingLinkForm
                            key={session.id}
                            session={session}
                            defaultMeetingUrl={defaultMeetingUrl}
                        />
                        {started && !cancelled && students.length > 0 && (
                            <div className="flex flex-wrap items-start justify-between gap-3 border-t border-border pt-3">
                                <div className="min-w-0 flex-1">
                                    <p className="text-sm font-medium text-foreground">
                                        Appel de la séance
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {attendanceRecords.length === 0
                                            ? 'Appel non fait'
                                            : describeAttendance(
                                                  attendanceRecords,
                                              )}
                                    </p>
                                </div>
                                <CourseSessionAttendanceDialog
                                    key={`attendance-${session.id}`}
                                    session={session}
                                    students={students}
                                    dateLabel={dateLabel}
                                />
                            </div>
                        )}
                        {upcoming && !cancelled && students.length > 0 && (
                            <p className="border-t border-border pt-3 text-xs text-muted-foreground">
                                L’appel sera disponible dès le début de la
                                séance.
                            </p>
                        )}
                        {upcoming && !cancelled && (
                            <div className="flex flex-wrap gap-2 border-t border-border pt-3">
                                <SessionRescheduleDialog
                                    key={`reschedule-${session.id}`}
                                    session={session}
                                    timezone={timezone}
                                />
                                <SessionCancellationDialog
                                    key={`cancel-${session.id}`}
                                    session={session}
                                />
                            </div>
                        )}
                        {upcoming && cancelled && (
                            <SessionRestoreButton
                                key={`restore-${session.id}`}
                                session={session}
                            />
                        )}
                    </div>
                )}

                {!canManage &&
                    (cancelled ? (
                        <p className="mt-3 border-t border-border pt-3 text-sm text-muted-foreground">
                            Cette séance est annulée.
                            {session.cancellation_reason
                                ? ` ${session.cancellation_reason}`
                                : ''}
                        </p>
                    ) : canJoin && meetingUrl ? (
                        <div className="mt-3 flex flex-wrap items-center gap-1.5 border-t border-border pt-3">
                            <Button asChild>
                                <a
                                    href={meetingUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <Video data-icon="inline-start" />
                                    Rejoindre la visio
                                </a>
                            </Button>
                        </div>
                    ) : (
                        <p className="mt-3 border-t border-border pt-3 text-sm text-muted-foreground">
                            {canJoin
                                ? 'Ton professeur ajoutera le lien de cette séance avant qu’elle ne commence.'
                                : 'Le lien de visio sera disponible une fois ton inscription confirmée.'}
                        </p>
                    ))}
            </div>
        </>
    );
}

function PopoverRow({
    icon: Icon,
    children,
}: {
    icon: IconComponent;
    children: ReactNode;
}) {
    return (
        <div className="ck:flex ck:items-start ck:gap-3 ck:py-1 ck:text-sm ck:text-muted-foreground">
            <Icon
                className="ck:mt-0.5 ck:h-4 ck:w-4 ck:shrink-0 ck:opacity-80"
                aria-hidden="true"
            />
            <div className="ck:min-w-0 ck:flex-1">{children}</div>
        </div>
    );
}

function SessionMeetingLinkForm({
    session,
    defaultMeetingUrl,
}: {
    session: CoursePlanningSession;
    defaultMeetingUrl: string | null;
}) {
    const form = useForm({ meeting_url: session.meeting_url ?? '' });

    function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        form.put(updateSession.url(session.id), {
            preserveScroll: true,
            onSuccess: () => form.setDefaults(),
        });
    }

    return (
        <form onSubmit={submit} className="flex flex-col gap-2">
            <Label htmlFor={`session-meeting-url-${session.id}`}>
                Lien visio de cette séance
            </Label>
            <div className="flex items-center gap-2">
                <Input
                    id={`session-meeting-url-${session.id}`}
                    type="url"
                    inputMode="url"
                    placeholder={
                        defaultMeetingUrl ?? 'https://meet.google.com/…'
                    }
                    maxLength={2048}
                    className="flex-1"
                    value={form.data.meeting_url}
                    onChange={(event) =>
                        form.setData('meeting_url', event.target.value)
                    }
                    aria-invalid={form.errors.meeting_url ? true : undefined}
                />
                <Button
                    type="submit"
                    disabled={form.processing || !form.isDirty}
                >
                    {form.processing && <Spinner data-icon="inline-start" />}
                    Enregistrer
                </Button>
            </div>
            <p className="text-xs text-muted-foreground">
                {defaultMeetingUrl
                    ? 'Laisse vide pour utiliser le lien par défaut du groupe.'
                    : 'Sans lien, les élèves ne pourront pas rejoindre cette séance.'}
            </p>
            {form.errors.meeting_url && (
                <p role="alert" className="text-sm text-destructive">
                    {form.errors.meeting_url}
                </p>
            )}
        </form>
    );
}

function SessionRescheduleDialog({
    session,
    timezone,
}: {
    session: CoursePlanningSession;
    timezone: string;
}) {
    const [open, setOpen] = useState(false);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button type="button" size="sm" variant="outline">
                    <Refresh data-icon="inline-start" />
                    Déplacer
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        Déplacer la séance {session.position}
                    </DialogTitle>
                    <DialogDescription>
                        Les élèves inscrits reçoivent un email avec l’ancienne
                        et la nouvelle date.
                    </DialogDescription>
                </DialogHeader>
                <SessionRescheduleForm
                    session={session}
                    timezone={timezone}
                    onSaved={() => setOpen(false)}
                />
            </DialogContent>
        </Dialog>
    );
}

function SessionRescheduleForm({
    session,
    timezone,
    onSaved,
}: {
    session: CoursePlanningSession;
    timezone: string;
    onSaved?: () => void;
}) {
    const initial = zonedInputs(session.starts_at, timezone);
    const [date, setDate] = useState(initial.date);
    const [time, setTime] = useState(initial.time);
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        if (!date || !time) {
            setError('Choisis la nouvelle date et l’heure de la séance.');

            return;
        }

        router.put(
            updateSession.url(session.id),
            { starts_at: fromZonedInputs(date, time, timezone).toISOString() },
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
                        errors.starts_at ??
                            'La séance n’a pas pu être déplacée.',
                    ),
            },
        );
    }

    return (
        <form onSubmit={submit} className="flex flex-col gap-3">
            <div className="flex flex-col gap-2">
                <Label htmlFor={`session-date-${session.id}`}>
                    Nouvelle date et heure
                </Label>
                <div className="flex flex-wrap items-end gap-2">
                    <Input
                        id={`session-date-${session.id}`}
                        type="date"
                        className="w-auto flex-1"
                        value={date}
                        onChange={(event) => setDate(event.target.value)}
                        aria-invalid={error ? true : undefined}
                    />
                    <Input
                        type="time"
                        className="w-auto"
                        value={time}
                        onChange={(event) => setTime(event.target.value)}
                        aria-invalid={error ? true : undefined}
                    />
                </div>
            </div>
            {error && (
                <p role="alert" className="text-sm text-destructive">
                    {error}
                </p>
            )}
            <div className="flex flex-wrap justify-end gap-2">
                <DialogClose asChild>
                    <Button type="button" variant="ghost">
                        Retour
                    </Button>
                </DialogClose>
                <Button type="submit" disabled={processing}>
                    {processing && <Spinner data-icon="inline-start" />}
                    Déplacer la séance
                </Button>
            </div>
        </form>
    );
}

function SessionCancellationDialog({
    session,
}: {
    session: CoursePlanningSession;
}) {
    const [open, setOpen] = useState(false);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="text-destructive"
                >
                    <CalendarX data-icon="inline-start" />
                    Annuler
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        Annuler la séance {session.position}
                    </DialogTitle>
                    <DialogDescription>
                        Les élèves inscrits reçoivent un email avec le motif. Tu
                        pourras rétablir la séance ensuite.
                    </DialogDescription>
                </DialogHeader>
                <SessionCancellationForm
                    session={session}
                    onSaved={() => setOpen(false)}
                />
            </DialogContent>
        </Dialog>
    );
}

function SessionCancellationForm({
    session,
    onSaved,
}: {
    session: CoursePlanningSession;
    onSaved?: () => void;
}) {
    const [reason, setReason] = useState('');
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        if (reason.trim().length < 5) {
            setError('Explique en quelques mots la raison de l’annulation.');

            return;
        }

        router.put(
            updateSession.url(session.id),
            { is_cancelled: true, cancellation_reason: reason.trim() },
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
                        errors.cancellation_reason ??
                            errors.is_cancelled ??
                            'La séance n’a pas pu être annulée.',
                    ),
            },
        );
    }

    return (
        <form onSubmit={submit} className="flex flex-col gap-3">
            <div className="flex flex-col gap-2">
                <Label htmlFor={`session-cancel-reason-${session.id}`}>
                    Raison de l’annulation
                </Label>
                <Textarea
                    id={`session-cancel-reason-${session.id}`}
                    rows={3}
                    required
                    minLength={5}
                    maxLength={500}
                    value={reason}
                    onChange={(event) => setReason(event.target.value)}
                    placeholder="Ex. : professeur absent, séance reportée à la semaine suivante."
                    aria-invalid={error ? true : undefined}
                />
            </div>
            {error && (
                <p role="alert" className="text-sm text-destructive">
                    {error}
                </p>
            )}
            <div className="flex flex-wrap justify-end gap-2">
                <DialogClose asChild>
                    <Button type="button" variant="ghost">
                        Retour
                    </Button>
                </DialogClose>
                <Button
                    type="submit"
                    variant="destructive"
                    disabled={processing}
                >
                    {processing && <Spinner data-icon="inline-start" />}
                    Annuler la séance
                </Button>
            </div>
        </form>
    );
}

function SessionRestoreButton({ session }: { session: CoursePlanningSession }) {
    const [processing, setProcessing] = useState(false);

    return (
        <Button
            type="button"
            variant="outline"
            className="self-start"
            disabled={processing}
            onClick={() =>
                router.put(
                    updateSession.url(session.id),
                    { is_cancelled: false },
                    {
                        preserveScroll: true,
                        onStart: () => setProcessing(true),
                        onFinish: () => setProcessing(false),
                    },
                )
            }
        >
            {processing ? (
                <Spinner data-icon="inline-start" />
            ) : (
                <Refresh data-icon="inline-start" />
            )}
            Rétablir la séance
        </Button>
    );
}

/** The same placement as CalendarKit's own popover: beside the event, clamped to the viewport. */
function placeBeside(
    anchor: AnchorBox,
    size: { width: number; height: number },
    area: { width: number; height: number },
): { left: number; top: number } {
    const clamp = (value: number, max: number) =>
        Math.max(POPOVER_MARGIN, Math.min(value, max));
    const top = clamp(anchor.top, area.height - size.height - POPOVER_MARGIN);

    if (
        anchor.right + POPOVER_GAP + size.width <=
        area.width - POPOVER_MARGIN
    ) {
        return { left: anchor.right + POPOVER_GAP, top };
    }

    if (anchor.left - POPOVER_GAP - size.width >= POPOVER_MARGIN) {
        return { left: anchor.left - POPOVER_GAP - size.width, top };
    }

    const left = clamp(anchor.left, area.width - size.width - POPOVER_MARGIN);

    if (
        anchor.bottom + POPOVER_GAP + size.height <=
        area.height - POPOVER_MARGIN
    ) {
        return { left, top: anchor.bottom + POPOVER_GAP };
    }

    if (anchor.top - POPOVER_GAP - size.height >= POPOVER_MARGIN) {
        return { left, top: anchor.top - POPOVER_GAP - size.height };
    }

    return { left, top };
}

/** A session's date and time as the teacher sees them in the chosen time zone. */
function zonedInputs(
    iso: string,
    timeZone: string,
): { date: string; time: string } {
    const value = new Date(iso);
    const parts = new Intl.DateTimeFormat('en-CA', {
        timeZone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    }).formatToParts(value);
    const timeParts = new Intl.DateTimeFormat('en-GB', {
        timeZone,
        hour: '2-digit',
        minute: '2-digit',
        hourCycle: 'h23',
    }).formatToParts(value);
    const get = (source: Intl.DateTimeFormatPart[], type: string) =>
        source.find((part) => part.type === type)?.value ?? '';

    return {
        date: `${get(parts, 'year')}-${get(parts, 'month')}-${get(parts, 'day')}`,
        time: `${get(timeParts, 'hour')}:${get(timeParts, 'minute')}`,
    };
}

/** The UTC instant matching a wall-clock date and time in the given time zone. */
function fromZonedInputs(date: string, time: string, timeZone: string): Date {
    const [year, month, day] = date.split('-').map(Number);
    const [hour, minute] = time.split(':').map(Number);
    const target = Date.UTC(year, month - 1, day, hour, minute);
    let timestamp = target;

    for (let attempt = 0; attempt < 2; attempt++) {
        const parts = new Intl.DateTimeFormat('en-US', {
            timeZone,
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            hourCycle: 'h23',
        }).formatToParts(new Date(timestamp));
        const get = (type: string) =>
            Number(parts.find((part) => part.type === type)?.value);
        const rendered = Date.UTC(
            get('year'),
            get('month') - 1,
            get('day'),
            get('hour'),
            get('minute'),
        );
        timestamp += target - rendered;
    }

    return new Date(timestamp);
}

/** "1 h", "1 h 30 min" or "45 min". */
function formatDuration(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const rest = minutes % 60;

    if (hours === 0) {
        return `${rest} min`;
    }

    return rest === 0 ? `${hours} h` : `${hours} h ${rest} min`;
}
