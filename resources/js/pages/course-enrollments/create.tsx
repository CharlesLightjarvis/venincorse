import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { type FormEvent, useState } from 'react';
import {
    ArrowLeft,
    ArrowRight,
    BookOpen,
    CalendarDays,
    Check,
    Clock,
    Users,
} from 'reicon-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Empty,
    EmptyContent,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
} from '@/components/ui/empty';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { useBrowserTimezone } from '@/hooks/use-browser-timezone';
import { usePageRestore } from '@/hooks/use-page-restore';
import {
    describeRhythm,
    formatCoursePrice,
    type CourseCohort,
} from '@/lib/course-cohorts';
import { cn } from '@/lib/utils';
import { contact } from '@/routes';
import {
    index as myCourses,
    prepare,
    store,
} from '@/routes/course-enrollments';
import { sales } from '@/routes/legal';
import { create as trial } from '@/routes/trial-reservations';
import type { Auth } from '@/types';

type Level = {
    value: string;
    label: string;
    prices: Record<'group' | 'solo', number>;
};

type Props = {
    cohorts: CourseCohort[];
    levels: Level[];
    selected: {
        level: string;
        format: 'group' | 'solo';
        cohort: number | null;
    };
    enrolledCohortIds: number[];
    paymentReady: boolean;
    withdrawalDays: number;
    holdMinutes: number;
    totalHours: number;
};

const steps = ['Ton groupe', 'À propos de toi', 'Récapitulatif'];
const goalLetters = /\p{L}/gu;
const tileClassName =
    'h-11 rounded-md shadow-none data-[variant=outline]:border-l data-[state=on]:border-primary data-[state=on]:bg-primary/10 data-[state=on]:text-foreground';

export default function CreateCourseEnrollment({
    cohorts,
    levels,
    selected,
    enrolledCohortIds,
    paymentReady,
    withdrawalDays,
    holdMinutes,
    totalHours,
}: Props) {
    const { auth } = usePage<{ auth: Auth }>().props;
    const detectedTimezone = useBrowserTimezone();
    const timezone = auth.user?.timezone ?? detectedTimezone;
    const preselected = cohorts.find((cohort) => cohort.id === selected.cohort);
    const [level, setLevel] = useState(preselected?.level ?? selected.level);
    const [format, setFormat] = useState<'group' | 'solo'>(
        preselected?.format ?? selected.format,
    );
    const [step, setStep] = useState(
        auth.user && preselected?.is_bookable ? 1 : 0,
    );
    const form = useForm({
        cohort_id: preselected?.is_bookable ? preselected.id : 0,
        goal: '',
        timezone,
        terms: false,
        early_start: false,
    });
    const [goalError, setGoalError] = useState('');
    // Back from Stripe: reload so the seats and the "processing" state reflect the server again.
    usePageRestore(() => window.location.reload());
    const visible = cohorts.filter(
        (cohort) => cohort.level === level && cohort.format === format,
    );
    const cohort = cohorts.find((item) => item.id === form.data.cohort_id);
    const levelInfo = levels.find((item) => item.value === level);
    const startsWithinWithdrawal =
        cohort !== undefined &&
        new Date(cohort.starts_at).getTime() <
            Date.now() + withdrawalDays * 24 * 60 * 60 * 1000;
    const format_ = (value: string, options: Intl.DateTimeFormatOptions) =>
        new Intl.DateTimeFormat('fr-FR', {
            timeZone: timezone,
            ...options,
        }).format(new Date(value));
    const shortDate = (value: string) =>
        format_(value, { weekday: 'short', day: 'numeric', month: 'long' });
    const errors = Object.entries({
        ...form.errors,
        ...(goalError ? { goal: goalError } : {}),
    });

    function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (!cohort || !auth.user || form.processing) {
            return;
        }
        if (
            step === 1 &&
            (form.data.goal.match(goalLetters)?.length ?? 0) < 3
        ) {
            setGoalError(
                'Décris ton objectif en quelques mots (5 à 2 000 caractères).',
            );
            return;
        }
        setGoalError('');
        if (step < 2) {
            form.clearErrors();
            setStep(step + 1);
            return;
        }
        form.post(store.url());
    }

    return (
        <div className="mx-auto flex max-w-6xl flex-col gap-8 px-5 py-10 sm:px-8 sm:py-14">
            <Head title="S’inscrire à un parcours" />
            <div className="flex flex-col gap-3">
                <p className="text-sm font-medium text-primary">
                    Un niveau complet en {totalHours} heures
                </p>
                <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                    Rejoins ton groupe.
                </h1>
                <p className="max-w-xl text-muted-foreground">
                    Choisis ton niveau, ton format et le groupe dont le planning
                    te convient. Connecte-toi avant de poursuivre vers le
                    paiement.
                </p>
            </div>
            <div className="grid items-start gap-8 lg:grid-cols-[1fr_300px]">
                <section className="min-w-0 overflow-hidden rounded-3xl border border-border/60 bg-background">
                    <ol
                        aria-label="Étapes de l’inscription"
                        className="grid grid-cols-3 border-b border-border/60"
                    >
                        {steps.map((title, index) => (
                            <li
                                key={title}
                                aria-current={
                                    step === index ? 'step' : undefined
                                }
                                className={cn(
                                    'flex flex-col gap-2 p-4 text-xs sm:flex-row sm:items-center sm:text-sm',
                                    step === index
                                        ? 'bg-primary/5 font-semibold text-primary'
                                        : 'text-muted-foreground',
                                )}
                            >
                                <span className="flex size-6 shrink-0 items-center justify-center rounded-full border border-current">
                                    {step > index ? (
                                        <Check
                                            className="size-3"
                                            aria-hidden="true"
                                        />
                                    ) : (
                                        index + 1
                                    )}
                                </span>
                                {title}
                            </li>
                        ))}
                    </ol>
                    <form
                        onSubmit={submit}
                        className="flex flex-col gap-6 p-5 sm:p-8"
                    >
                        <h2 className="text-2xl font-semibold">
                            {steps[step]}
                        </h2>
                        {errors.length > 0 && (
                            <Alert variant="destructive">
                                <AlertDescription>
                                    <ul>
                                        {errors.map(([key, message]) => (
                                            <li key={key}>{message}</li>
                                        ))}
                                    </ul>
                                </AlertDescription>
                            </Alert>
                        )}
                        {step === 0 && (
                            <div className="flex flex-col gap-6">
                                <div className="flex flex-col gap-2">
                                    <Label>Niveau</Label>
                                    <ToggleGroup
                                        type="single"
                                        variant="outline"
                                        aria-label="Niveau"
                                        className="grid w-full grid-cols-4 gap-2 shadow-none"
                                        value={level}
                                        onValueChange={(value) => {
                                            if (value) {
                                                setLevel(value);
                                                form.setData('cohort_id', 0);
                                            }
                                        }}
                                    >
                                        {levels.map((item) => (
                                            <ToggleGroupItem
                                                key={item.value}
                                                value={item.value}
                                                className={tileClassName}
                                            >
                                                {item.value.toUpperCase()}
                                            </ToggleGroupItem>
                                        ))}
                                    </ToggleGroup>
                                    {levelInfo && (
                                        <p className="text-sm text-muted-foreground">
                                            {levelInfo.label}
                                        </p>
                                    )}
                                </div>
                                <div className="flex flex-col gap-2">
                                    <Label>Format</Label>
                                    <ToggleGroup
                                        type="single"
                                        variant="outline"
                                        aria-label="Format"
                                        className="grid w-full grid-cols-2 gap-2 shadow-none"
                                        value={format}
                                        onValueChange={(value) => {
                                            if (value) {
                                                setFormat(
                                                    value as 'group' | 'solo',
                                                );
                                                form.setData('cohort_id', 0);
                                            }
                                        }}
                                    >
                                        <ToggleGroupItem
                                            value="group"
                                            className={tileClassName}
                                        >
                                            Groupe (3 à 6)
                                            {levelInfo &&
                                                ` · ${formatCoursePrice(levelInfo.prices.group, 'EUR')}`}
                                        </ToggleGroupItem>
                                        <ToggleGroupItem
                                            value="solo"
                                            className={tileClassName}
                                        >
                                            Individuel
                                            {levelInfo &&
                                                ` · ${formatCoursePrice(levelInfo.prices.solo, 'EUR')}`}
                                        </ToggleGroupItem>
                                    </ToggleGroup>
                                </div>
                                <div className="flex flex-col gap-3">
                                    <Label>Groupes ouverts</Label>
                                    {visible.length === 0 ? (
                                        <Empty className="border">
                                            <EmptyHeader>
                                                <EmptyMedia variant="icon">
                                                    <Users />
                                                </EmptyMedia>
                                                <EmptyTitle>
                                                    Aucun groupe ouvert pour le
                                                    moment
                                                </EmptyTitle>
                                                <EmptyDescription>
                                                    De nouveaux groupes ouvrent
                                                    régulièrement. Écris-nous
                                                    pour être prévenu, ou
                                                    commence par un cours
                                                    d’essai.
                                                </EmptyDescription>
                                            </EmptyHeader>
                                            <EmptyContent className="flex-row justify-center">
                                                <Button
                                                    asChild
                                                    variant="outline"
                                                    className="rounded-full"
                                                >
                                                    <Link href={contact()}>
                                                        Nous contacter
                                                    </Link>
                                                </Button>
                                                <Button
                                                    asChild
                                                    className="rounded-full"
                                                >
                                                    <Link href={trial()}>
                                                        Réserver un essai
                                                    </Link>
                                                </Button>
                                            </EmptyContent>
                                        </Empty>
                                    ) : (
                                        <div
                                            className="grid gap-3"
                                            role="radiogroup"
                                            aria-label="Groupes ouverts"
                                        >
                                            {visible.map((item) => {
                                                const enrolled =
                                                    enrolledCohortIds.includes(
                                                        item.id,
                                                    );
                                                const disabled =
                                                    enrolled ||
                                                    !item.is_bookable;
                                                const active =
                                                    form.data.cohort_id ===
                                                    item.id;

                                                return (
                                                    <button
                                                        key={item.id}
                                                        type="button"
                                                        role="radio"
                                                        aria-checked={active}
                                                        disabled={disabled}
                                                        onClick={() =>
                                                            form.setData(
                                                                'cohort_id',
                                                                item.id,
                                                            )
                                                        }
                                                        className={cn(
                                                            'flex flex-col gap-3 rounded-2xl border p-4 text-left transition-colors sm:flex-row sm:items-center sm:justify-between',
                                                            active
                                                                ? 'border-primary bg-primary/5'
                                                                : 'border-border hover:border-primary/40',
                                                            disabled &&
                                                                'cursor-not-allowed opacity-60 hover:border-border',
                                                        )}
                                                    >
                                                        <span className="flex flex-col gap-1">
                                                            <span className="font-semibold">
                                                                {
                                                                    item.rhythm_label
                                                                }{' '}
                                                                · du{' '}
                                                                {shortDate(
                                                                    item.starts_at,
                                                                )}{' '}
                                                                au{' '}
                                                                {shortDate(
                                                                    item.ends_at,
                                                                )}
                                                            </span>
                                                            <span className="text-sm text-muted-foreground">
                                                                {describeRhythm(
                                                                    item,
                                                                )}
                                                                , à{' '}
                                                                {format_(
                                                                    item.starts_at,
                                                                    {
                                                                        timeStyle:
                                                                            'short',
                                                                    },
                                                                )}
                                                            </span>
                                                        </span>
                                                        <Badge
                                                            variant={
                                                                enrolled ||
                                                                item.seats_left ===
                                                                    0
                                                                    ? 'outline'
                                                                    : 'secondary'
                                                            }
                                                            className="shrink-0"
                                                        >
                                                            {enrolled
                                                                ? 'Déjà inscrit'
                                                                : item.seats_left ===
                                                                    0
                                                                  ? 'Complet'
                                                                  : format ===
                                                                      'solo'
                                                                    ? 'Disponible'
                                                                    : `${item.seats_left} place${item.seats_left > 1 ? 's' : ''}`}
                                                        </Badge>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    )}
                                    <p className="text-xs text-muted-foreground">
                                        Horaires affichés dans ton fuseau :{' '}
                                        {timezone}.
                                    </p>
                                </div>
                                {!auth.user && (
                                    <p className="text-sm text-muted-foreground">
                                        Connecte-toi ou crée ton compte pour
                                        continuer. Ton choix est conservé, mais
                                        la place n’est pas encore réservée.
                                    </p>
                                )}
                            </div>
                        )}
                        {step === 1 && (
                            <div className="flex flex-col gap-2">
                                <p className="text-sm text-muted-foreground">
                                    Ton professeur s’en servira pour adapter les
                                    séances.
                                </p>
                                <Label htmlFor="course-goal">
                                    Qu’aimerais-tu atteindre avec ce parcours ?
                                </Label>
                                <Textarea
                                    id="course-goal"
                                    required
                                    minLength={5}
                                    maxLength={2000}
                                    rows={4}
                                    value={form.data.goal}
                                    onChange={(event) =>
                                        form.setData('goal', event.target.value)
                                    }
                                    placeholder="Ex. être à l’aise en réunion avec mes collègues allemands"
                                />
                            </div>
                        )}
                        {step === 2 && cohort && (
                            <div className="flex flex-col gap-5">
                                <dl className="grid grid-cols-[110px_1fr] gap-x-4 gap-y-3 text-sm">
                                    <dt className="text-muted-foreground">
                                        Parcours
                                    </dt>
                                    <dd>
                                        {cohort.level_label}
                                        <span className="block text-xs text-muted-foreground">
                                            {cohort.format_label} ·{' '}
                                            {cohort.rhythm_label}
                                        </span>
                                    </dd>
                                    <dt className="text-muted-foreground">
                                        Dates
                                    </dt>
                                    <dd>
                                        Du {shortDate(cohort.starts_at)} au{' '}
                                        {shortDate(cohort.ends_at)}
                                        <span className="block text-xs text-muted-foreground">
                                            {describeRhythm(cohort)}, à{' '}
                                            {format_(cohort.starts_at, {
                                                timeStyle: 'short',
                                            })}{' '}
                                            ({timezone})
                                        </span>
                                    </dd>
                                    <dt className="text-muted-foreground">
                                        Objectif
                                    </dt>
                                    <dd className="break-words">
                                        {form.data.goal}
                                    </dd>
                                    <dt className="text-muted-foreground">
                                        Total
                                    </dt>
                                    <dd className="text-lg font-semibold">
                                        {formatCoursePrice(
                                            cohort.price_cents,
                                            cohort.currency,
                                        )}
                                        <span className="block text-xs font-normal text-muted-foreground">
                                            Paiement en une fois
                                        </span>
                                    </dd>
                                </dl>
                                <Alert>
                                    <AlertDescription>
                                        {paymentReady
                                            ? `Tu vas être redirigé vers la page de paiement sécurisée Stripe. Ta place est réservée ${holdMinutes} minutes le temps du paiement ; ton inscription est confirmée dès que le paiement est vérifié.`
                                            : 'Le paiement en ligne n’est pas encore disponible. Aucune inscription ne sera enregistrée pour le moment.'}
                                    </AlertDescription>
                                </Alert>
                                <label className="flex items-start gap-3 text-sm leading-relaxed">
                                    <input
                                        type="checkbox"
                                        required
                                        checked={form.data.terms}
                                        onChange={(event) =>
                                            form.setData(
                                                'terms',
                                                event.target.checked,
                                            )
                                        }
                                        className="mt-1 size-4 shrink-0 accent-primary"
                                    />
                                    <span>
                                        J’accepte les{' '}
                                        <a
                                            href={sales.url()}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="font-medium text-primary underline underline-offset-4"
                                        >
                                            conditions générales de vente
                                        </a>
                                        . Je peux me rétracter dans les{' '}
                                        {withdrawalDays} jours suivant mon
                                        inscription, en écrivant à l’école ;
                                        passé ce délai, l’inscription n’est plus
                                        remboursable.
                                    </span>
                                </label>
                                {startsWithinWithdrawal && (
                                    <label className="flex items-start gap-3 text-sm leading-relaxed">
                                        <input
                                            type="checkbox"
                                            checked={form.data.early_start}
                                            onChange={(event) =>
                                                form.setData(
                                                    'early_start',
                                                    event.target.checked,
                                                )
                                            }
                                            className="mt-1 size-4 shrink-0 accent-primary"
                                        />
                                        <span>
                                            Ce groupe commence avant la fin de
                                            mon délai de rétractation : je
                                            demande expressément que le parcours
                                            commence dès la première séance. Si
                                            je me rétracte ensuite, je reste
                                            redevable de la part des séances
                                            déjà suivies.
                                        </span>
                                    </label>
                                )}
                            </div>
                        )}
                        {auth.user && !auth.can?.enrollInCourses && (
                            <p
                                role="alert"
                                className="text-sm text-destructive"
                            >
                                Ton compte n’a pas l’autorisation de s’inscrire.
                                Contacte l’administrateur.
                            </p>
                        )}
                        <div className="flex items-center justify-between gap-3 pt-2">
                            <Button
                                type="button"
                                variant="ghost"
                                className="rounded-full"
                                disabled={step === 0 || form.processing}
                                onClick={() => {
                                    form.clearErrors();
                                    setGoalError('');
                                    setStep(step - 1);
                                }}
                            >
                                <ArrowLeft aria-hidden="true" />
                                Retour
                            </Button>
                            {!auth.user ? (
                                cohort ? (
                                    <Button asChild className="rounded-full">
                                        <Link
                                            href={prepare({
                                                query: { cohort: cohort.id },
                                            })}
                                        >
                                            Se connecter pour continuer
                                            <ArrowRight aria-hidden="true" />
                                        </Link>
                                    </Button>
                                ) : (
                                    <Button
                                        type="button"
                                        disabled
                                        className="rounded-full"
                                    >
                                        Continuer
                                        <ArrowRight aria-hidden="true" />
                                    </Button>
                                )
                            ) : (
                                <Button
                                    type="submit"
                                    className="rounded-full"
                                    disabled={
                                        form.processing ||
                                        !cohort ||
                                        !auth.can?.enrollInCourses ||
                                        (step === 2 &&
                                            (!paymentReady ||
                                                !form.data.terms ||
                                                (startsWithinWithdrawal &&
                                                    !form.data.early_start)))
                                    }
                                >
                                    {form.processing
                                        ? 'Ouverture du paiement…'
                                        : step === 2 && cohort
                                          ? `Payer ${formatCoursePrice(cohort.price_cents, cohort.currency)}`
                                          : 'Continuer'}
                                    <ArrowRight aria-hidden="true" />
                                </Button>
                            )}
                        </div>
                    </form>
                </section>
                <aside className="flex flex-col gap-5 rounded-3xl border border-border/60 bg-background p-6 lg:sticky lg:top-8">
                    <span className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                        <BookOpen className="size-6" aria-hidden="true" />
                    </span>
                    <h2 className="text-xl font-semibold">
                        {levelInfo?.label ?? 'Ton parcours'}
                    </h2>
                    <p className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="size-4" aria-hidden="true" />
                        {totalHours} heures ·{' '}
                        {format === 'group'
                            ? 'en groupe de 3 à 6'
                            : 'en individuel'}
                    </p>
                    <p className="flex items-start gap-2 text-sm text-muted-foreground">
                        <CalendarDays
                            className="mt-0.5 size-4 shrink-0"
                            aria-hidden="true"
                        />
                        {cohort
                            ? `Du ${shortDate(cohort.starts_at)} au ${shortDate(cohort.ends_at)}`
                            : 'Ton groupe apparaîtra ici.'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                        En visio, avec supports et corrections. Le lien de la
                        visio est communiqué dans ton espace.
                    </p>
                    <div className="flex items-baseline justify-between border-t border-border pt-4">
                        <span className="text-sm">Prix du parcours</span>
                        <span className="text-3xl font-semibold">
                            {levelInfo
                                ? formatCoursePrice(
                                      levelInfo.prices[format],
                                      'EUR',
                                  )
                                : '—'}
                        </span>
                    </div>
                    <p className="text-xs leading-relaxed text-muted-foreground">
                        Par personne, paiement unique. Rétractation possible
                        pendant {withdrawalDays} jours.
                    </p>
                    {auth.user && auth.can?.viewOwnCourses && (
                        <Link
                            href={myCourses()}
                            className="text-sm text-primary underline underline-offset-4"
                        >
                            Mes parcours
                        </Link>
                    )}
                </aside>
            </div>
        </div>
    );
}
