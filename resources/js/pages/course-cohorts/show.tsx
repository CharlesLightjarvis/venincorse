import { Head, router, setLayoutProps, useForm } from '@inertiajs/react';
import { type FormEvent, useState } from 'react';
import { CalendarDays, Euro, Repeat, Trash, Users } from 'reicon-react';
import { CoursePlanningCalendar } from '@/components/course-planning-calendar';
import { TrialInfoCard } from '@/components/trial-info-card';
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
import { Spinner } from '@/components/ui/spinner';
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
    enrollmentStatusLabels,
    enrollmentStatusVariant,
    formatCoursePrice,
    type CourseCohort,
    type CourseEnrollment,
} from '@/lib/course-cohorts';
import { destroy, index, show, update } from '@/routes/course-cohorts';
import { store as storeCancellation } from '@/routes/course-enrollment-cancellations';
import { update as updateEnrollment } from '@/routes/course-enrollment-management';

export default function ShowCourseCohort({
    cohort,
    enrollments,
}: {
    cohort: CourseCohort;
    enrollments: CourseEnrollment[];
}) {
    const timezone = useUserTimezone();
    const state = cohortState(cohort);
    const format = (value: string, options: Intl.DateTimeFormatOptions) =>
        new Intl.DateTimeFormat('fr-FR', {
            timeZone: timezone,
            ...options,
        }).format(new Date(value));
    const sessions = cohort.sessions ?? [];
    const upcoming = sessions.filter(
        (session) => new Date(session.starts_at) > new Date(),
    ).length;
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
                <DeleteDialog cohort={cohort} />
            </div>

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

            <section className="flex flex-col rounded-lg border border-border">
                <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-4">
                    <h2 className="font-semibold">Élèves</h2>
                    <Badge variant="outline">
                        {cohort.capacity - cohort.seats_left} /{' '}
                        {cohort.capacity}
                    </Badge>
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
                    <ul className="divide-y divide-border">
                        {enrollments.map((enrollment) => (
                            <li
                                key={enrollment.id}
                                className="flex flex-wrap items-center justify-between gap-3 px-5 py-3"
                            >
                                <div className="min-w-0">
                                    <p className="truncate font-medium">
                                        {enrollment.student?.name}
                                    </p>
                                    <p className="truncate text-sm text-muted-foreground">
                                        {enrollment.student?.email}
                                    </p>
                                    <p className="mt-1 line-clamp-2 text-sm break-words text-muted-foreground">
                                        <span className="font-medium text-foreground">
                                            Objectif :
                                        </span>{' '}
                                        {enrollment.goal}
                                    </p>
                                </div>
                                <div className="flex flex-col items-end gap-1">
                                    <Badge
                                        variant={
                                            enrollmentStatusVariant[
                                                enrollment.status
                                            ]
                                        }
                                    >
                                        {
                                            enrollmentStatusLabels[
                                                enrollment.status
                                            ]
                                        }
                                    </Badge>
                                    <span className="text-xs text-muted-foreground">
                                        {enrollment.payment_plan ===
                                            'installments' &&
                                        enrollment.installments?.length
                                            ? `${enrollment.installments.filter((item) => item.status === 'paid').length}/${enrollment.installments.length} échéances réglées`
                                            : enrollment.paid_at
                                              ? `Payé le ${format(enrollment.paid_at, { day: 'numeric', month: 'short' })}`
                                              : 'Non payé'}
                                    </span>
                                    {enrollment.installments?.some(
                                        (item) => item.status === 'failed',
                                    ) && (
                                        <span className="text-xs font-medium text-destructive">
                                            Échéance impayée
                                        </span>
                                    )}
                                    <EnrollmentDialog enrollment={enrollment} />
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </section>

            <SettingsForm cohort={cohort} />

            <section className="flex flex-col gap-3">
                <div className="flex items-center justify-between gap-3">
                    <h2 className="font-semibold">Planning</h2>
                    <Badge variant="outline">{sessions.length}</Badge>
                </div>
                <CoursePlanningCalendar
                    sessions={sessions}
                    defaultMeetingUrl={cohort.meeting_url ?? null}
                    canManage
                />
            </section>
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

function EnrollmentDialog({ enrollment }: { enrollment: CourseEnrollment }) {
    const [open, setOpen] = useState(false);
    const management = enrollment.management;
    const notes = useForm({ notes: enrollment.notes ?? '' });
    const cancel = useForm({
        refund_euros: management?.withdrawal_open
            ? (management.prorata_refund_cents / 100).toFixed(2)
            : '0.00',
        reason: '',
    });
    const euros = (cents: number) =>
        formatCoursePrice(cents, enrollment.currency);

    if (!management) {
        return null;
    }

    function saveNotes(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        notes.patch(updateEnrollment.url(enrollment.id), {
            preserveScroll: true,
            onSuccess: () => notes.setDefaults(),
        });
    }

    function submitCancellation(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        cancel.transform((data) => ({
            refund_cents: Math.round(
                Number(data.refund_euros.replace(',', '.')) * 100,
            ),
            reason: data.reason,
        }));
        cancel.post(storeCancellation.url(enrollment.id), {
            preserveScroll: true,
            onSuccess: () => setOpen(false),
        });
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="mt-1">
                    Gérer
                </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{enrollment.student?.name}</DialogTitle>
                    <DialogDescription>
                        Payé : {euros(management.paid_cents)}
                        {enrollment.refunded_cents > 0 &&
                            ` · remboursé : ${euros(enrollment.refunded_cents)}`}{' '}
                        · {management.hours_done} h suivies sur 60 ·{' '}
                        {management.withdrawal_open
                            ? 'délai de rétractation en cours'
                            : 'délai de rétractation terminé'}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={saveNotes} className="flex flex-col gap-2">
                    <Label htmlFor={`notes-${enrollment.id}`}>
                        Notes privées
                    </Label>
                    <Textarea
                        id={`notes-${enrollment.id}`}
                        rows={4}
                        maxLength={5000}
                        value={notes.data.notes}
                        onChange={(event) =>
                            notes.setData('notes', event.target.value)
                        }
                        placeholder="Niveau, progrès, points à travailler… Visible uniquement par l’équipe."
                    />
                    {notes.errors.notes && (
                        <p role="alert" className="text-sm text-destructive">
                            {notes.errors.notes}
                        </p>
                    )}
                    <Button
                        type="submit"
                        size="sm"
                        variant="outline"
                        className="self-end"
                        disabled={notes.processing || !notes.isDirty}
                    >
                        Enregistrer les notes
                    </Button>
                </form>

                {management.can_cancel ? (
                    <form
                        onSubmit={submitCancellation}
                        className="flex flex-col gap-3 border-t border-border pt-4"
                    >
                        <h3 className="font-medium">Annuler l’inscription</h3>
                        <p className="text-sm text-muted-foreground">
                            Rétractation dans les 14 jours : rembourse la part
                            non suivie (au prorata). Groupe annulé par l’école :
                            remboursement intégral. Après le délai : aucun
                            remboursement n’est dû. Les échéances restantes sont
                            annulées.
                        </p>
                        <div className="flex flex-wrap gap-2">
                            <Button
                                type="button"
                                size="sm"
                                variant="secondary"
                                onClick={() =>
                                    cancel.setData(
                                        'refund_euros',
                                        (
                                            management.refundable_cents / 100
                                        ).toFixed(2),
                                    )
                                }
                            >
                                Intégral ({euros(management.refundable_cents)})
                            </Button>
                            <Button
                                type="button"
                                size="sm"
                                variant="secondary"
                                onClick={() =>
                                    cancel.setData(
                                        'refund_euros',
                                        (
                                            management.prorata_refund_cents /
                                            100
                                        ).toFixed(2),
                                    )
                                }
                            >
                                Au prorata (
                                {euros(management.prorata_refund_cents)})
                            </Button>
                            <Button
                                type="button"
                                size="sm"
                                variant="secondary"
                                onClick={() =>
                                    cancel.setData('refund_euros', '0.00')
                                }
                            >
                                Sans remboursement
                            </Button>
                        </div>
                        <div className="flex flex-col gap-2">
                            <Label htmlFor={`refund-${enrollment.id}`}>
                                Montant remboursé (€)
                            </Label>
                            <Input
                                id={`refund-${enrollment.id}`}
                                inputMode="decimal"
                                className="w-36"
                                value={cancel.data.refund_euros}
                                onChange={(event) =>
                                    cancel.setData(
                                        'refund_euros',
                                        event.target.value,
                                    )
                                }
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <Label htmlFor={`reason-${enrollment.id}`}>
                                Motif communiqué à l’élève
                            </Label>
                            <Textarea
                                id={`reason-${enrollment.id}`}
                                required
                                minLength={5}
                                maxLength={500}
                                rows={3}
                                value={cancel.data.reason}
                                onChange={(event) =>
                                    cancel.setData('reason', event.target.value)
                                }
                                placeholder="Ex. : rétractation demandée par email le 12 novembre."
                            />
                        </div>
                        {(cancel.errors as Record<string, string>)
                            .refund_cents && (
                            <p
                                role="alert"
                                className="text-sm text-destructive"
                            >
                                {
                                    (cancel.errors as Record<string, string>)
                                        .refund_cents
                                }
                            </p>
                        )}
                        {cancel.errors.reason && (
                            <p
                                role="alert"
                                className="text-sm text-destructive"
                            >
                                {cancel.errors.reason}
                            </p>
                        )}
                        <DialogFooter>
                            <DialogClose asChild>
                                <Button type="button" variant="ghost">
                                    Garder l’inscription
                                </Button>
                            </DialogClose>
                            <Button
                                type="submit"
                                variant="destructive"
                                disabled={cancel.processing}
                            >
                                {cancel.processing && (
                                    <Spinner data-icon="inline-start" />
                                )}
                                Annuler l’inscription
                            </Button>
                        </DialogFooter>
                    </form>
                ) : (
                    enrollment.cancellation_reason && (
                        <p className="border-t border-border pt-4 text-sm text-muted-foreground">
                            Annulée : {enrollment.cancellation_reason}
                        </p>
                    )
                )}
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
