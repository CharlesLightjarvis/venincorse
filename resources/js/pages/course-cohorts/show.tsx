import { Head, router, setLayoutProps, useForm } from '@inertiajs/react';
import { type FormEvent, useState } from 'react';
import {
    CalendarDays,
    CalendarEdit,
    CalendarX,
    ClipboardCheck,
    Euro,
    Grid,
    Repeat,
    Trash,
    Users,
} from 'reicon-react';
import { CourseEnrollmentDialog } from '@/components/course-enrollment-dialog';
import { CoursePlanningCalendar } from '@/components/course-planning-calendar';
import { ManualEnrollmentDialog } from '@/components/manual-enrollment-dialog';
import { TrialInfoCard } from '@/components/trial-info-card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Spinner } from '@/components/ui/spinner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { useUserTimezone } from '@/hooks/use-browser-timezone';
import {
    Empty,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
} from '@/components/ui/empty';
import {
    cohortState,
    formatCoursePrice,
    type CourseCohort,
    type CourseEnrollment,
} from '@/lib/course-cohorts';
import { store as storeCohortCancellation } from '@/routes/course-cohort-cancellations';
import { update as updateSchedule } from '@/routes/course-cohort-schedules';
import { destroy, index, show, update } from '@/routes/course-cohorts';
import { update as updateManualVisibility } from '@/routes/course-manual-visibility';
import { AttendancePanel } from './partials/attendance-panel';
import { StudentsTable } from './partials/students-table';

type Rhythm = {
    value: string;
    label: string;
    weekdays: number[];
    session_hours: number;
};

export default function ShowCourseCohort({
    cohort,
    enrollments,
    rhythms,
    startHours,
    timezone: schoolTimezone,
}: {
    cohort: CourseCohort;
    enrollments: CourseEnrollment[];
    rhythms: Rhythm[];
    startHours: number[];
    timezone: string;
}) {
    const timezone = useUserTimezone();
    const state = cohortState(cohort);
    const format = (value: string, options: Intl.DateTimeFormatOptions) =>
        new Intl.DateTimeFormat('fr-FR', {
            timeZone: timezone,
            ...options,
        }).format(new Date(value));
    const sessions = cohort.sessions ?? [];
    const students = enrollments
        .filter((enrollment) => enrollment.status === 'confirmed')
        .map((enrollment) => ({
            enrollmentId: enrollment.id,
            name:
                enrollment.student?.name ??
                enrollment.student?.email ??
                'Élève',
        }));
    const upcoming = sessions.filter(
        (session) =>
            !session.cancelled_at && new Date(session.starts_at) > new Date(),
    ).length;
    const startedSessions = sessions
        .filter(
            (session) =>
                !session.cancelled_at &&
                new Date(session.starts_at) <= new Date(),
        )
        .sort(
            (left, right) =>
                new Date(right.starts_at).getTime() -
                new Date(left.starts_at).getTime(),
        );
    setLayoutProps({
        breadcrumbs: [
            { title: 'Groupes des parcours', href: index() },
            { title: cohort.level_label, href: show(cohort.id) },
        ],
    });

    return (
        <div className="flex h-full flex-1 flex-col gap-6 p-4">
            <Head title={`Groupe ${cohort.level_label}`} />
            <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                    <div className="flex flex-wrap items-center gap-3">
                        <h1 className="text-3xl font-semibold">
                            {cohort.level_label}
                        </h1>
                        <Badge variant={state.variant}>{state.label}</Badge>
                    </div>
                    <p className="mt-3 text-muted-foreground">
                        {cohort.format_label} · {cohort.rhythm_label} ·{' '}
                        {sessions.length} séances
                    </p>
                </div>
                <div className="flex flex-wrap gap-2">
                    {!cohort.cancelled_at && (
                        <CancelCohortDialog cohort={cohort} />
                    )}
                    <DeleteDialog cohort={cohort} />
                </div>
            </div>

            {cohort.cancelled_at && (
                <Alert variant="destructive">
                    <CalendarX aria-hidden="true" />
                    <AlertTitle>Groupe annulé</AlertTitle>
                    <AlertDescription>
                        <p>
                            Annulé le{' '}
                            {format(cohort.cancelled_at, {
                                dateStyle: 'long',
                            })}
                            .{' '}
                            {cohort.cancellation_reason ??
                                'Aucun motif renseigné.'}
                        </p>
                        <p className="mt-1">
                            Les séances à venir sont annulées, les élèves
                            inscrits ont été remboursés et prévenus par email.
                            Vérifie les remboursements en échec dans la fiche de
                            chaque élève.
                        </p>
                    </AlertDescription>
                </Alert>
            )}

            <Tabs defaultValue="overview" className="gap-6">
                <TabsList
                    aria-label="Sections du groupe"
                    className="grid h-auto w-full grid-cols-2 gap-1 p-1 sm:grid-cols-4"
                >
                    <TabsTrigger
                        value="overview"
                        className="h-auto min-h-9 py-2"
                    >
                        <Grid aria-hidden="true" />
                        Vue d’ensemble
                    </TabsTrigger>
                    <TabsTrigger
                        value="enrollments"
                        className="h-auto min-h-9 py-2"
                    >
                        <Users aria-hidden="true" />
                        Inscriptions
                    </TabsTrigger>
                    <TabsTrigger
                        value="attendance"
                        className="h-auto min-h-9 py-2"
                    >
                        <ClipboardCheck aria-hidden="true" />
                        Présences
                    </TabsTrigger>
                    <TabsTrigger
                        value="planning"
                        className="h-auto min-h-9 py-2"
                    >
                        <CalendarDays aria-hidden="true" />
                        Planning
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="flex flex-col gap-6">
                    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                        <TrialInfoCard
                            icon={CalendarDays}
                            label="Dates"
                            value={format(cohort.starts_at, {
                                day: 'numeric',
                                month: 'long',
                            })}
                            caption={`Fin le ${format(cohort.ends_at, { day: 'numeric', month: 'long', year: 'numeric' })}`}
                        />
                        <TrialInfoCard
                            icon={Repeat}
                            label="Séances"
                            value={`${upcoming} à venir`}
                            caption={`Sur ${sessions.length}, à ${format(cohort.starts_at, { timeStyle: 'short' })} (${timezone})`}
                        />
                        <TrialInfoCard
                            icon={Users}
                            label="Places"
                            value={`${cohort.seats_left} libre(s)`}
                            caption={`Sur ${cohort.capacity}`}
                        />
                        <TrialInfoCard
                            icon={Euro}
                            label="Prix par élève"
                            value={formatCoursePrice(
                                cohort.price_cents,
                                cohort.currency,
                            )}
                            caption="Niveau complet, 60 heures"
                        />
                    </div>
                    <SettingsForm cohort={cohort} />
                    <ManualVisibility cohort={cohort} />
                </TabsContent>

                <TabsContent
                    value="enrollments"
                    className="flex flex-col gap-6"
                >
                    <section className="flex flex-col gap-3">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <div>
                                <h2 className="font-semibold">Inscriptions</h2>
                                <p className="text-sm text-muted-foreground">
                                    Les inscriptions du groupe, tous statuts
                                    confondus.
                                </p>
                            </div>
                            <div className="flex flex-wrap items-center gap-2">
                                {!cohort.cancelled_at &&
                                    !cohort.has_started &&
                                    cohort.seats_left > 0 && (
                                        <ManualEnrollmentDialog
                                            cohorts={[
                                                {
                                                    id: cohort.id,
                                                    label: cohort.level_label,
                                                    format_label:
                                                        cohort.format_label,
                                                    rhythm_label:
                                                        cohort.rhythm_label,
                                                    starts_at: cohort.starts_at,
                                                    price_cents:
                                                        cohort.price_cents,
                                                    currency: cohort.currency,
                                                    seats_left:
                                                        cohort.seats_left,
                                                },
                                            ]}
                                            defaultCohortId={cohort.id}
                                            triggerSize="sm"
                                        />
                                    )}
                                <Badge variant="outline">
                                    {cohort.capacity - cohort.seats_left} /{' '}
                                    {cohort.capacity}
                                </Badge>
                            </div>
                        </div>
                        {enrollments.length === 0 ? (
                            <Empty>
                                <EmptyHeader>
                                    <EmptyMedia variant="icon">
                                        <Users />
                                    </EmptyMedia>
                                    <EmptyTitle>Aucun élève inscrit</EmptyTitle>
                                    <EmptyDescription>
                                        {cohort.is_published
                                            ? 'Le groupe est ouvert : les élèves peuvent s’inscrire depuis la page du parcours.'
                                            : 'Le groupe est fermé aux inscriptions.'}
                                    </EmptyDescription>
                                </EmptyHeader>
                            </Empty>
                        ) : (
                            <StudentsTable
                                enrollments={enrollments}
                                formatDate={format}
                                renderActions={(enrollment) => (
                                    <CourseEnrollmentDialog
                                        enrollment={enrollment}
                                    />
                                )}
                            />
                        )}
                    </section>
                </TabsContent>

                <TabsContent value="attendance" className="flex flex-col gap-6">
                    <AttendancePanel
                        sessions={startedSessions}
                        students={students}
                    />
                </TabsContent>

                <TabsContent value="planning" className="flex flex-col gap-6">
                    <section className="flex flex-col gap-3">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <div>
                                <h2 className="font-semibold">Planning</h2>
                                <p className="text-sm text-muted-foreground">
                                    Ouvre une séance pour modifier son lien, la
                                    déplacer, l’annuler ou faire l’appel.
                                </p>
                            </div>
                            <div className="flex items-center gap-2">
                                <Badge variant="outline">
                                    {sessions.length}
                                </Badge>
                                {!cohort.cancelled_at && (
                                    <EditScheduleDialog
                                        cohort={cohort}
                                        rhythms={rhythms}
                                        startHours={startHours}
                                        schoolTimezone={schoolTimezone}
                                    />
                                )}
                            </div>
                        </div>
                        <CoursePlanningCalendar
                            sessions={sessions}
                            defaultMeetingUrl={cohort.meeting_url ?? null}
                            canManage
                            students={students}
                        />
                    </section>
                </TabsContent>
            </Tabs>
        </div>
    );
}

function SettingsForm({ cohort }: { cohort: CourseCohort }) {
    const form = useForm({
        meeting_url: cohort.meeting_url ?? '',
        capacity: cohort.capacity,
        is_published: cohort.is_published,
    });

    function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        form.put(update.url(cohort.id), {
            preserveScroll: true,
            onSuccess: () => form.setDefaults(),
        });
    }

    return (
        <form
            onSubmit={submit}
            className="flex flex-col gap-5 rounded-lg border border-border p-5"
        >
            <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="font-semibold">Réglages</h2>
                <Button
                    type="submit"
                    disabled={form.processing || !form.isDirty}
                >
                    {form.processing && <Spinner data-icon="inline-start" />}
                    Enregistrer
                </Button>
            </div>
            <div className="flex flex-wrap items-start gap-5">
                <div className="flex min-w-72 flex-1 flex-col gap-2">
                    <Label htmlFor="meeting_url">Lien visio par défaut</Label>
                    <Input
                        id="meeting_url"
                        type="url"
                        inputMode="url"
                        placeholder="https://meet.google.com/…"
                        maxLength={2048}
                        value={form.data.meeting_url}
                        onChange={(event) =>
                            form.setData('meeting_url', event.target.value)
                        }
                        aria-invalid={
                            form.errors.meeting_url ? true : undefined
                        }
                    />
                    <p className="text-xs text-muted-foreground">
                        Sert de lien par défaut : chaque séance peut avoir le
                        sien depuis le planning.
                    </p>
                    {form.errors.meeting_url && (
                        <p role="alert" className="text-sm text-destructive">
                            {form.errors.meeting_url}
                        </p>
                    )}
                </div>
                {cohort.format === 'group' && (
                    <div className="flex flex-col gap-2">
                        <Label htmlFor="capacity">Places</Label>
                        <Input
                            id="capacity"
                            type="number"
                            min={1}
                            max={6}
                            className="w-28"
                            value={form.data.capacity}
                            onChange={(event) =>
                                form.setData(
                                    'capacity',
                                    Number(event.target.value),
                                )
                            }
                            aria-invalid={
                                form.errors.capacity ? true : undefined
                            }
                        />
                        {form.errors.capacity && (
                            <p
                                role="alert"
                                className="text-sm text-destructive"
                            >
                                {form.errors.capacity}
                            </p>
                        )}
                    </div>
                )}
                <div className="flex flex-col gap-2 xl:max-w-xs">
                    <span
                        className="invisible text-sm leading-none font-medium select-none"
                        aria-hidden="true"
                    >
                        Inscriptions
                    </span>
                    <div className="flex items-start gap-3">
                        <Checkbox
                            id="is_published"
                            checked={form.data.is_published}
                            onCheckedChange={(checked) =>
                                form.setData('is_published', checked === true)
                            }
                        />
                        <div className="grid gap-1">
                            <Label htmlFor="is_published">
                                Ouvert aux inscriptions
                            </Label>
                            <p className="text-xs text-muted-foreground">
                                Décoche pour masquer le groupe aux élèves.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </form>
    );
}

function ManualVisibility({ cohort }: { cohort: CourseCohort }) {
    const form = useForm({ visible: cohort.second_manuals_visible ?? false });

    function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        form.put(updateManualVisibility.url(cohort.id), {
            preserveScroll: true,
            onSuccess: () => form.setDefaults(),
        });
    }

    return (
        <form
            onSubmit={submit}
            className="flex flex-col gap-4 rounded-lg border border-border p-5"
        >
            <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="font-semibold">Manuels du groupe</h2>
                <Button
                    type="submit"
                    size="sm"
                    disabled={form.processing || !form.isDirty}
                >
                    Enregistrer
                </Button>
            </div>
            <div className="flex items-start gap-3">
                <Checkbox
                    id="second-manuals"
                    checked={form.data.visible}
                    onCheckedChange={(checked) =>
                        form.setData('visible', checked === true)
                    }
                />
                <div className="grid gap-1">
                    <Label htmlFor="second-manuals">
                        Rendre les manuels {cohort.level.toUpperCase()}.2
                        visibles
                    </Label>
                    <p className="text-xs text-muted-foreground">
                        Les manuels {cohort.level.toUpperCase()}.1 sont
                        disponibles automatiquement pour les élèves confirmés.
                        Ce réglage concerne uniquement ce groupe.
                    </p>
                    {form.errors.visible && (
                        <p role="alert" className="text-sm text-destructive">
                            {form.errors.visible}
                        </p>
                    )}
                </div>
            </div>
        </form>
    );
}

function EditScheduleDialog({
    cohort,
    rhythms,
    startHours,
    schoolTimezone,
}: {
    cohort: CourseCohort;
    rhythms: Rhythm[];
    startHours: number[];
    schoolTimezone: string;
}) {
    const [open, setOpen] = useState(false);
    const sessions = cohort.sessions ?? [];
    const next = sessions.find(
        (session) =>
            !session.cancelled_at && new Date(session.starts_at) > new Date(),
    );
    const firstHour = Number(
        new Intl.DateTimeFormat('en-GB', {
            timeZone: schoolTimezone,
            hour: '2-digit',
            hourCycle: 'h23',
        }).format(new Date(cohort.starts_at)),
    );
    const form = useForm({
        rhythm: cohort.rhythm,
        starts_on: zonedDate(
            next?.starts_at ?? cohort.starts_at,
            schoolTimezone,
        ),
        start_hour: startHours.includes(firstHour)
            ? firstHour
            : (startHours[0] ?? 9),
    });

    function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        form.put(updateSchedule.url(cohort.id), {
            preserveScroll: true,
            onSuccess: () => {
                setOpen(false);
                form.setDefaults();
            },
        });
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                    <CalendarEdit data-icon="inline-start" />
                    Modifier le planning
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        Modifier le planning des séances à venir
                    </DialogTitle>
                    <DialogDescription>
                        Les séances déjà commencées sont conservées. Les heures
                        restantes sont replanifiées à partir de la date choisie.
                        Les élèves inscrits reçoivent un email avec la prochaine
                        séance.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={submit} className="flex flex-col gap-4">
                    <div className="flex flex-col gap-2">
                        <Label htmlFor="schedule-rhythm">Rythme</Label>
                        <Select
                            value={form.data.rhythm}
                            onValueChange={(value) =>
                                form.setData('rhythm', value)
                            }
                        >
                            <SelectTrigger id="schedule-rhythm">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {rhythms.map((rhythm) => (
                                    <SelectItem
                                        key={rhythm.value}
                                        value={rhythm.value}
                                    >
                                        {rhythm.label} · {rhythm.session_hours}{' '}
                                        h par séance
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {form.errors.rhythm && (
                            <p
                                role="alert"
                                className="text-sm text-destructive"
                            >
                                {form.errors.rhythm}
                            </p>
                        )}
                    </div>
                    <div className="flex flex-wrap gap-4">
                        <div className="flex flex-1 flex-col gap-2">
                            <Label htmlFor="schedule-starts-on">
                                Reprise le
                            </Label>
                            <Input
                                id="schedule-starts-on"
                                type="date"
                                value={form.data.starts_on}
                                onChange={(event) =>
                                    form.setData(
                                        'starts_on',
                                        event.target.value,
                                    )
                                }
                                aria-invalid={
                                    form.errors.starts_on ? true : undefined
                                }
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="schedule-start-hour">Heure</Label>
                            <Select
                                value={String(form.data.start_hour)}
                                onValueChange={(value) =>
                                    form.setData('start_hour', Number(value))
                                }
                            >
                                <SelectTrigger
                                    id="schedule-start-hour"
                                    className="w-28"
                                >
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {startHours.map((hour) => (
                                        <SelectItem
                                            key={hour}
                                            value={String(hour)}
                                        >
                                            {String(hour).padStart(2, '0')}:00
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    {(form.errors.starts_on || form.errors.start_hour) && (
                        <p role="alert" className="text-sm text-destructive">
                            {form.errors.starts_on ?? form.errors.start_hour}
                        </p>
                    )}
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button type="button" variant="ghost">
                                Garder le planning actuel
                            </Button>
                        </DialogClose>
                        <Button type="submit" disabled={form.processing}>
                            {form.processing && (
                                <Spinner data-icon="inline-start" />
                            )}
                            Replanifier les séances
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

function CancelCohortDialog({ cohort }: { cohort: CourseCohort }) {
    const [open, setOpen] = useState(false);
    const form = useForm({ reason: '' });

    function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        form.post(storeCohortCancellation.url(cohort.id), {
            preserveScroll: true,
            onSuccess: () => setOpen(false),
        });
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="destructive">
                    <CalendarX data-icon="inline-start" />
                    Annuler le groupe
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Annuler ce groupe ?</DialogTitle>
                    <DialogDescription>
                        Les séances à venir sont annulées, les élèves inscrits
                        sont remboursés intégralement et prévenus par email. Les
                        places en attente de paiement sont libérées. Le groupe
                        et son historique restent consultables.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={submit} className="flex flex-col gap-3">
                    <div className="flex flex-col gap-2">
                        <Label htmlFor="cohort-cancellation-reason">
                            Motif communiqué aux élèves
                        </Label>
                        <Textarea
                            id="cohort-cancellation-reason"
                            rows={3}
                            required
                            minLength={5}
                            maxLength={500}
                            value={form.data.reason}
                            onChange={(event) =>
                                form.setData('reason', event.target.value)
                            }
                            placeholder="Ex. : nombre d’inscrits insuffisant pour ouvrir le groupe."
                            aria-invalid={form.errors.reason ? true : undefined}
                        />
                        {form.errors.reason && (
                            <p
                                role="alert"
                                className="text-sm text-destructive"
                            >
                                {form.errors.reason}
                            </p>
                        )}
                        {(form.errors as Record<string, string>).cohort && (
                            <p
                                role="alert"
                                className="text-sm text-destructive"
                            >
                                {(form.errors as Record<string, string>).cohort}
                            </p>
                        )}
                    </div>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button type="button" variant="ghost">
                                Garder le groupe
                            </Button>
                        </DialogClose>
                        <Button
                            type="submit"
                            variant="destructive"
                            disabled={form.processing}
                        >
                            {form.processing && (
                                <Spinner data-icon="inline-start" />
                            )}
                            Annuler et rembourser
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

function DeleteDialog({ cohort }: { cohort: CourseCohort }) {
    const [processing, setProcessing] = useState(false);

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline">
                    <Trash data-icon="inline-start" />
                    Supprimer
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Supprimer ce groupe ?</DialogTitle>
                    <DialogDescription>
                        Le groupe et son planning sont supprimés définitivement.
                        Seul un groupe sans inscrit peut l’être : sinon,
                        ferme-le aux inscriptions.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button type="button" variant="ghost">
                            Garder le groupe
                        </Button>
                    </DialogClose>
                    <Button
                        variant="destructive"
                        disabled={processing}
                        onClick={() =>
                            router.delete(destroy.url(cohort.id), {
                                onStart: () => setProcessing(true),
                                onFinish: () => setProcessing(false),
                            })
                        }
                    >
                        {processing && <Spinner data-icon="inline-start" />}
                        Supprimer le groupe
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

/** The date (YYYY-MM-DD) of an instant in the school's time zone. */
function zonedDate(value: string, timeZone: string): string {
    const parts = new Intl.DateTimeFormat('en-CA', {
        timeZone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    }).formatToParts(new Date(value));
    const get = (type: string) =>
        parts.find((part) => part.type === type)?.value ?? '';

    return `${get('year')}-${get('month')}-${get('day')}`;
}
