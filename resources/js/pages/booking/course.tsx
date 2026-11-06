import { Head, Link, router, usePage } from '@inertiajs/react';
import { ArrowLeft, ArrowRight, Check, Users, User } from 'reicon-react';
import { useState, type FormEvent } from 'react';
import { BookingShell } from '@/components/booking-shell';
import { CourseSchedule } from '@/components/course-schedule';
import { TierSwitcher } from '@/components/marketing/tier-switcher';
import {
    selectClassName,
    timezoneOptions,
} from '@/components/trial-slot-picker';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    formats,
    getLevel,
    levels,
    tierLabels,
    type TierKey,
} from '@/data/offer';
import {
    formatCourseMoney,
    getCourseCohorts,
    getCourseQuote,
    readCourseBookings,
    remainingCourseSeats,
    saveCourseBookings,
    type CourseEnrollment,
    type CourseRhythm,
} from '@/data/course-booking';
import { formatTrialDate } from '@/data/trial-booking';
import { useCourseBookings } from '@/hooks/use-course-bookings';
import { cn } from '@/lib/utils';
import { levelTest } from '@/routes';
import { courseManage } from '@/routes/booking';

const steps = ['Ta formule', 'Ton planning', 'Tes infos', 'Paiement'];

export default function BookCourse() {
    const page = usePage();
    const query = new URLSearchParams(page.url.split('?')[1]);
    const [levelSlug, setLevelSlug] = useState(
        getLevel(query.get('level') ?? undefined)?.slug ?? 'a1',
    );
    const [tier, setTier] = useState<TierKey>(
        query.get('tier') === 'solo' ? 'solo' : 'group',
    );
    const [rhythm, setRhythm] = useState<CourseRhythm>('extensif');
    const [step, setStep] = useState(0);
    const [cohortId, setCohortId] = useState('');
    const [timezone, setTimezone] = useState('Europe/Paris');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [goal, setGoal] = useState('');
    const [installments, setInstallments] = useState(false);
    const [credit, setCredit] = useState(false);
    const [error, setError] = useState('');
    const bookings = useCourseBookings();
    const level = getLevel(levelSlug)!;
    const format = formats.find((item) => item.id === rhythm)!;
    const cohorts = getCourseCohorts(levelSlug, rhythm, tier);
    const cohort = cohorts.find((item) => item.id === cohortId);
    const quote = getCourseQuote(
        level.price[tier],
        installments,
        credit ? 39 : 0,
    );

    function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setError('');
        if (step === 0) {
            setStep(1);
            return;
        }
        const latest = readCourseBookings();
        if (
            !cohort ||
            remainingCourseSeats(cohort, latest) === 0 ||
            new Date(cohort.startsAt).getTime() <= Date.now()
        ) {
            setStep(1);
            setError(
                'Ce planning n’est plus disponible. Choisis un autre départ.',
            );
            return;
        }
        if (step === 2 && (!name.trim() || !email.trim() || !goal.trim())) {
            setError('Renseigne ton prénom, ton email fictif et ton objectif.');
            return;
        }
        if (step < 3) {
            setStep(step + 1);
            return;
        }
        const data = new FormData(event.currentTarget);
        if (!data.has('terms')) {
            return;
        }
        if (data.has('payment-fails')) {
            setError(
                'Paiement refusé (simulation). Aucune inscription créée et aucune place bloquée. Tu peux réessayer.',
            );
            return;
        }
        const booking: CourseEnrollment = {
            id: `course-${Date.now().toString(36)}-${crypto.getRandomValues(new Uint32Array(1))[0].toString(36)}`,
            level: levelSlug,
            tier,
            rhythm,
            cohort,
            name: name.trim(),
            email: email.trim(),
            goal: goal.trim(),
            timezone,
            installments,
            credit: credit ? 39 : 0,
            ...quote,
            createdAt: new Date().toISOString(),
            status: 'confirmed',
            notes: '',
        };
        saveCourseBookings([...latest, booking]);
        router.visit(courseManage({ query: { id: booking.id } }));
    }

    return (
        <BookingShell>
            <Head title="Réserver mon parcours" />
            <div className="flex flex-col gap-3">
                <p className="text-sm font-medium text-primary">
                    Parcours A1 → B2 · 60 heures
                </p>
                <h1 className="text-3xl font-semibold sm:text-4xl">
                    Ton niveau. Ta formule. Ton rythme.
                </h1>
                <p className="max-w-2xl text-muted-foreground">
                    Un programme complet, en individuel ou en groupe. Choisis un
                    planning qui tient dans ta vie.
                </p>
            </div>
            <div className="grid items-start gap-8 lg:grid-cols-[1fr_300px]">
                <section className="overflow-hidden rounded-3xl border border-border/60 bg-background">
                    <ol
                        aria-label="Étapes de réservation"
                        className="grid grid-cols-4 border-b border-border/60"
                    >
                        {steps.map((title, index) => (
                            <li
                                key={title}
                                aria-current={
                                    step === index ? 'step' : undefined
                                }
                                className={cn(
                                    'flex flex-col gap-2 p-3 text-xs sm:p-4',
                                    step === index
                                        ? 'bg-primary/5 font-semibold text-primary'
                                        : 'text-muted-foreground',
                                )}
                            >
                                <span className="flex size-6 items-center justify-center rounded-full border border-current">
                                    {step > index ? (
                                        <Check className="size-3" />
                                    ) : (
                                        index + 1
                                    )}
                                </span>
                                {title}
                            </li>
                        ))}
                    </ol>
                    <form
                        className="flex flex-col gap-6 p-5 sm:p-8"
                        onSubmit={submit}
                    >
                        <h2 className="text-2xl font-semibold">
                            {steps[step]}
                        </h2>
                        {error && (
                            <Alert variant="destructive">
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}
                        {step === 0 && (
                            <>
                                <div className="flex flex-col gap-2">
                                    <Label htmlFor="course-level">
                                        Ton niveau
                                    </Label>
                                    <select
                                        id="course-level"
                                        className={selectClassName}
                                        value={levelSlug}
                                        onChange={(event) => {
                                            setLevelSlug(
                                                getLevel(event.target.value)!
                                                    .slug,
                                            );
                                            setCohortId('');
                                        }}
                                    >
                                        {levels.map((item) => (
                                            <option
                                                key={item.slug}
                                                value={item.slug}
                                            >
                                                {item.code} — {item.name}
                                            </option>
                                        ))}
                                    </select>
                                    <Link
                                        className="text-xs text-primary underline underline-offset-4"
                                        href={levelTest()}
                                    >
                                        Tu hésites ? Passe le test gratuit avant
                                        de réserver.
                                    </Link>
                                </div>
                                <div className="flex flex-col gap-3">
                                    <p className="text-sm font-medium">
                                        Ta formule
                                    </p>
                                    <TierSwitcher
                                        value={tier}
                                        onChange={(value) => {
                                            setTier(value);
                                            setCohortId('');
                                        }}
                                    />
                                    <p className="text-sm text-muted-foreground">
                                        {tier === 'solo'
                                            ? 'Toute l’attention du professeur, un suivi individuel : le tarif est plus élevé.'
                                            : '3 à 6 élèves de ton niveau. Le tarif est par personne et le groupe ouvre à partir de 3 inscrits.'}
                                    </p>
                                </div>
                                <fieldset>
                                    <legend className="mb-3 text-sm font-medium">
                                        Ton rythme
                                    </legend>
                                    <div className="grid gap-3 sm:grid-cols-2">
                                        {formats.map((item) => (
                                            <label
                                                key={item.id}
                                                className={cn(
                                                    'flex cursor-pointer flex-col gap-2 rounded-2xl border p-4 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring',
                                                    rhythm === item.id
                                                        ? 'border-primary bg-primary/5'
                                                        : 'border-border hover:border-primary/40',
                                                )}
                                            >
                                                <input
                                                    type="radio"
                                                    name="rhythm"
                                                    className="sr-only"
                                                    checked={rhythm === item.id}
                                                    onChange={() => {
                                                        setRhythm(
                                                            item.id as CourseRhythm,
                                                        );
                                                        setCohortId('');
                                                    }}
                                                />
                                                <span className="flex items-center gap-2 font-semibold">
                                                    <item.icon className="size-4 text-primary" />
                                                    {item.name}
                                                </span>
                                                <span className="text-sm">
                                                    {item.schedule}
                                                </span>
                                                <span className="text-xs text-muted-foreground">
                                                    60 h en {item.level} ·{' '}
                                                    {item.ideal}
                                                </span>
                                            </label>
                                        ))}
                                    </div>
                                </fieldset>
                                <Alert>
                                    <AlertDescription>
                                        Le rythme change ton planning, pas le
                                        prix. Les 60 h, les supports et les deux
                                        checkpoints restent inclus.
                                    </AlertDescription>
                                </Alert>
                            </>
                        )}
                        {step === 1 && (
                            <>
                                <div className="flex flex-col gap-2">
                                    <Label htmlFor="course-timezone">
                                        Fuseau d’affichage
                                    </Label>
                                    <select
                                        id="course-timezone"
                                        value={timezone}
                                        onChange={(event) =>
                                            setTimezone(event.target.value)
                                        }
                                        className={selectClassName}
                                    >
                                        {timezoneOptions.map((zone) => (
                                            <option key={zone}>{zone}</option>
                                        ))}
                                    </select>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    {tier === 'group'
                                        ? 'Choisis une cohorte avec des horaires fixes partagés par tout le groupe.'
                                        : 'Choisis un planning individuel réservé pour toi.'}{' '}
                                    Les départs et disponibilités ci-dessous
                                    sont fictifs.
                                </p>
                                <fieldset>
                                    <legend className="mb-3 text-sm font-medium">
                                        {tier === 'group'
                                            ? 'Départs en groupe'
                                            : 'Plannings 1:1'}
                                    </legend>
                                    <div className="flex flex-col gap-3">
                                        {cohorts.map((item) => {
                                            const seats = remainingCourseSeats(
                                                item,
                                                bookings,
                                            );
                                            return (
                                                <label
                                                    key={item.id}
                                                    className={cn(
                                                        'flex cursor-pointer items-start gap-3 rounded-2xl border p-4 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring',
                                                        cohortId === item.id
                                                            ? 'border-primary bg-primary/5'
                                                            : 'border-border',
                                                        !seats &&
                                                            'cursor-not-allowed opacity-50',
                                                    )}
                                                >
                                                    <input
                                                        type="radio"
                                                        name="cohort"
                                                        disabled={!seats}
                                                        checked={
                                                            cohortId === item.id
                                                        }
                                                        onChange={() =>
                                                            setCohortId(item.id)
                                                        }
                                                        className="mt-1 accent-primary"
                                                    />
                                                    <span className="flex flex-col gap-1">
                                                        <span className="font-medium">
                                                            {formatTrialDate(
                                                                item.startsAt,
                                                                timezone,
                                                            )}
                                                        </span>
                                                        <span className="text-sm text-muted-foreground">
                                                            {format.name} ·{' '}
                                                            {format.schedule}
                                                        </span>
                                                        <span className="text-xs text-primary">
                                                            {seats
                                                                ? tier ===
                                                                  'group'
                                                                    ? `${seats} places disponibles (démo)`
                                                                    : 'Disponible en individuel (démo)'
                                                                : 'Complet'}
                                                        </span>
                                                    </span>
                                                </label>
                                            );
                                        })}
                                    </div>
                                </fieldset>
                                {cohort && (
                                    <CourseSchedule
                                        key={cohort.id}
                                        sessions={cohort.sessions}
                                        timezone={timezone}
                                    />
                                )}
                            </>
                        )}
                        {step === 2 && (
                            <>
                                <p className="text-sm text-muted-foreground">
                                    Aucun compte obligatoire dans cette démo. En
                                    production, l’accès à ton espace élève sera
                                    proposé après l’inscription.
                                </p>
                                <div className="flex flex-col gap-2">
                                    <Label htmlFor="course-name">Prénom</Label>
                                    <Input
                                        id="course-name"
                                        required
                                        maxLength={80}
                                        value={name}
                                        onChange={(event) =>
                                            setName(event.target.value)
                                        }
                                        autoComplete="given-name"
                                    />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <Label htmlFor="course-email">
                                        Email fictif
                                    </Label>
                                    <Input
                                        id="course-email"
                                        required
                                        type="email"
                                        maxLength={200}
                                        value={email}
                                        onChange={(event) =>
                                            setEmail(event.target.value)
                                        }
                                        placeholder="camille@example.test"
                                        autoComplete="email"
                                    />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <Label htmlFor="course-goal">
                                        Ton objectif
                                    </Label>
                                    <Input
                                        id="course-goal"
                                        required
                                        maxLength={300}
                                        value={goal}
                                        onChange={(event) =>
                                            setGoal(event.target.value)
                                        }
                                        placeholder="Ex. vivre en Allemagne, préparer mes études…"
                                    />
                                </div>
                            </>
                        )}
                        {step === 3 && cohort && (
                            <>
                                <dl className="grid grid-cols-[95px_1fr] gap-3 text-sm">
                                    <dt className="text-muted-foreground">
                                        Parcours
                                    </dt>
                                    <dd>
                                        {level.code} — {level.name} · 60 h
                                    </dd>
                                    <dt className="text-muted-foreground">
                                        Formule
                                    </dt>
                                    <dd>
                                        {tierLabels[tier]} · {format.name}
                                    </dd>
                                    <dt className="text-muted-foreground">
                                        Départ
                                    </dt>
                                    <dd>
                                        {formatTrialDate(
                                            cohort.startsAt,
                                            timezone,
                                        )}
                                        <br />
                                        {timezone}
                                    </dd>
                                    <dt className="text-muted-foreground">
                                        Participant
                                    </dt>
                                    <dd className="min-w-0 break-words">
                                        {name}
                                        <br />
                                        {email}
                                    </dd>
                                </dl>
                                <fieldset>
                                    <legend className="mb-3 text-sm font-medium">
                                        Paiement simulé
                                    </legend>
                                    <div className="flex flex-col gap-3">
                                        <label className="flex items-center gap-3 text-sm">
                                            <input
                                                type="radio"
                                                name="installments"
                                                checked={!installments}
                                                onChange={() =>
                                                    setInstallments(false)
                                                }
                                            />
                                            En une fois · sans frais
                                        </label>
                                        <label className="flex items-center gap-3 text-sm">
                                            <input
                                                type="radio"
                                                name="installments"
                                                checked={installments}
                                                onChange={() =>
                                                    setInstallments(true)
                                                }
                                            />
                                            En 3 fois · +5 % sur le total
                                        </label>
                                    </div>
                                </fieldset>
                                <label className="flex items-start gap-3 text-sm">
                                    <input
                                        type="checkbox"
                                        checked={credit}
                                        onChange={(event) =>
                                            setCredit(event.target.checked)
                                        }
                                        className="mt-1"
                                    />
                                    <span>
                                        Simuler un crédit de cours d’essai de 39
                                        €
                                        <span className="mt-1 block text-xs text-muted-foreground">
                                            Démo uniquement. En production, un
                                            essai éligible sous 7 jours devra
                                            être vérifié.
                                        </span>
                                    </span>
                                </label>
                                <div className="rounded-xl bg-muted/50 p-4">
                                    <p className="font-semibold">
                                        Total :{' '}
                                        {formatCourseMoney(quote.totalCents)}
                                    </p>
                                    <p className="mt-2 text-sm">
                                        À payer aujourd’hui (simulation) :{' '}
                                        {formatCourseMoney(
                                            quote.paymentsCents[0],
                                        )}
                                    </p>
                                    {installments && (
                                        <p className="mt-2 text-xs text-muted-foreground">
                                            Puis{' '}
                                            {formatCourseMoney(
                                                quote.paymentsCents[1],
                                            )}{' '}
                                            à J+30 et{' '}
                                            {formatCourseMoney(
                                                quote.paymentsCents[2],
                                            )}{' '}
                                            à J+60. Aucun prélèvement réel.
                                        </p>
                                    )}
                                </div>
                                <Alert>
                                    <AlertDescription>
                                        {tier === 'group'
                                            ? 'Si le groupe n’ouvre pas, report ou remboursement intégral. '
                                            : ''}
                                        Aucun paiement réel, email ou réunion
                                        Meet n’est créé.
                                    </AlertDescription>
                                </Alert>
                                <label className="flex items-start gap-3 text-sm">
                                    <input
                                        type="checkbox"
                                        name="terms"
                                        required
                                        className="mt-1"
                                    />
                                    <span>
                                        J’accepte les conditions de
                                        démonstration : annulation dans les 14
                                        jours suivant la réservation et avant le
                                        début du parcours, avec remboursement
                                        simulé.
                                    </span>
                                </label>
                                <label className="flex items-center gap-3 text-xs text-muted-foreground">
                                    <input
                                        type="checkbox"
                                        name="payment-fails"
                                    />
                                    Tester un paiement refusé
                                </label>
                            </>
                        )}
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <Button
                                type="button"
                                variant="ghost"
                                className="rounded-full"
                                disabled={!step}
                                onClick={() => {
                                    setStep(step - 1);
                                    setError('');
                                }}
                            >
                                <ArrowLeft />
                                Retour
                            </Button>
                            <Button
                                type="submit"
                                className="rounded-full"
                                disabled={
                                    step === 1 &&
                                    (!cohort ||
                                        remainingCourseSeats(
                                            cohort,
                                            bookings,
                                        ) === 0)
                                }
                            >
                                {step === 3
                                    ? 'Simuler l’inscription'
                                    : 'Continuer'}
                                <ArrowRight />
                            </Button>
                        </div>
                    </form>
                </section>
                <aside className="flex flex-col gap-4 rounded-3xl border border-border/60 bg-background p-6 lg:sticky lg:top-8">
                    <span className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                        {tier === 'solo' ? <User /> : <Users />}
                    </span>
                    <h2 className="text-xl font-semibold">
                        {level.code} — {level.name}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                        {tierLabels[tier]} · 60 heures en visio
                    </p>
                    <p className="text-sm">
                        {format.name}
                        <br />
                        <span className="text-muted-foreground">
                            {format.schedule}
                            <br />
                            Niveau complet : {format.level}
                        </span>
                    </p>
                    {cohort && (
                        <p className="text-sm">
                            Départ :{' '}
                            {formatTrialDate(cohort.startsAt, timezone)}
                        </p>
                    )}
                    <div className="border-t border-border pt-4">
                        <p className="text-xs text-muted-foreground">
                            {installments
                                ? 'Total avec frais de 5 %'
                                : 'Prix du parcours'}
                            {tier === 'group' ? ' · par personne' : ''}
                        </p>
                        <p className="mt-1 text-3xl font-semibold">
                            {formatCourseMoney(quote.totalCents)}
                        </p>
                        {credit && (
                            <p className="mt-2 text-xs text-primary">
                                Crédit essai simulé : −39 €
                            </p>
                        )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                        Supports, corrections et deux checkpoints inclus. Tarifs
                        de démonstration, sans supplément lié au rythme.
                    </p>
                </aside>
            </div>
        </BookingShell>
    );
}
