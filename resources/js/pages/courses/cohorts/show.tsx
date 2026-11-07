import { Head, router, setLayoutProps, useForm } from '@inertiajs/react';
import { type FormEvent, useState } from 'react';
import { CalendarDays, Euro, Repeat, Trash, Users } from 'reicon-react';
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
import { useUserTimezone } from '@/hooks/use-browser-timezone';
import {
    cohortState,
    formatCoursePrice,
    type CourseCohort,
} from '@/lib/course-cohorts';
import { destroy, index, show, update } from '@/routes/course-cohorts';

export default function ShowCourseCohort({ cohort }: { cohort: CourseCohort }) {
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

            <div className="grid gap-6 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)]">
                <SettingsForm cohort={cohort} />
                <section className="flex flex-col rounded-lg border border-border">
                    <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-4">
                        <h2 className="font-semibold">Planning</h2>
                        <Badge variant="outline">{sessions.length}</Badge>
                    </div>
                    <ol className="grid max-h-[32rem] divide-y divide-border overflow-y-auto">
                        {sessions.map((session) => {
                            const past =
                                new Date(session.starts_at) < new Date();

                            return (
                                <li
                                    key={session.position}
                                    className={`flex items-center justify-between gap-3 px-5 py-2.5 text-sm ${past ? 'text-muted-foreground' : ''}`}
                                >
                                    <span className="flex items-center gap-3">
                                        <span className="w-8 font-mono text-xs text-muted-foreground">
                                            {session.position}
                                        </span>
                                        <span className="first-letter:uppercase">
                                            {format(session.starts_at, {
                                                weekday: 'long',
                                                day: 'numeric',
                                                month: 'long',
                                            })}
                                        </span>
                                    </span>
                                    <span className="tabular-nums">
                                        {format(session.starts_at, {
                                            timeStyle: 'short',
                                        })}{' '}
                                        · {session.duration_minutes / 60} h
                                    </span>
                                </li>
                            );
                        })}
                    </ol>
                </section>
            </div>
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
            className="flex flex-col gap-5 self-start rounded-lg border border-border p-5"
        >
            <h2 className="font-semibold">Réglages</h2>
            <div className="flex flex-col gap-2">
                <Label htmlFor="meeting_url">Lien de la visio</Label>
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
                    aria-invalid={form.errors.meeting_url ? true : undefined}
                />
                <p className="text-xs text-muted-foreground">
                    Le même lien pour toutes les séances du groupe.
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
                            form.setData('capacity', Number(event.target.value))
                        }
                        aria-invalid={form.errors.capacity ? true : undefined}
                    />
                    {form.errors.capacity && (
                        <p role="alert" className="text-sm text-destructive">
                            {form.errors.capacity}
                        </p>
                    )}
                </div>
            )}
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
            <Button
                type="submit"
                disabled={form.processing || !form.isDirty}
                className="self-end"
            >
                {form.processing && <Spinner data-icon="inline-start" />}
                Enregistrer
            </Button>
        </form>
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
                        Seul un groupe sans inscrit peut l’être.
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
