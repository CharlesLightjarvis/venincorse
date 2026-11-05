import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    ArrowLeft,
    ArrowRight,
    BookOpen,
    Check,
    Gamepad2,
    MessagesSquare,
    PenLine,
    Users,
    UserRound,
} from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { BookingShell } from '@/components/booking-shell';
import { CourseSchedule } from '@/components/course-schedule';
import { TierSwitcher } from '@/components/marketing/tier-switcher';
import {
    selectClassName,
    timezoneOptions,
} from '@/components/trial-slot-picker';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { formatCourseMoney, getCourseQuote } from '@/data/course-booking';
import { tierLabels, type LevelSlug, type TierKey } from '@/data/offer';
import { formatTrialDate } from '@/data/trial-booking';
import {
    getWorkshopCohorts,
    readWorkshopBookings,
    remainingWorkshopSeats,
    saveWorkshopBookings,
    type WorkshopEnrollment,
} from '@/data/workshop-booking';
import {
    getWorkshopOffer,
    workshopLevels,
    workshopVolume,
} from '@/data/workshop-catalog';
import { useWorkshopBookings } from '@/hooks/use-workshop-bookings';
import { cn } from '@/lib/utils';
import { workshops as workshopsRoute } from '@/routes';
import { workshopManage } from '@/routes/booking';
import { show as workshopDetail } from '@/routes/workshops';

const steps = ['Ta formule', 'Ton planning', 'Tes infos', 'Paiement'];

const icons = {
    grammar: BookOpen,
    sprechen: MessagesSquare,
    schreiben: PenLine,
    wortschatz: Gamepad2,
};

export default function BookWorkshop() {
    const page = usePage();
    const query = new URLSearchParams(page.url.split('?')[1]);
    const [offerId] = useState(query.get('offer') ?? 'grammar-a1');
    const [tier, setTier] = useState<TierKey>(
        query.get('tier') === 'solo' ? 'solo' : 'group',
    );
    const [level, setLevel] = useState<LevelSlug>(() => {
        const requested = workshopLevels.find(
            (item) => item === query.get('level'),
        );
        return requested ?? 'a1';
    });
    const [step, setStep] = useState(0);
    const [cohortId, setCohortId] = useState('');
    const [timezone, setTimezone] = useState('Europe/Paris');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [goal, setGoal] = useState('');
    const [installments, setInstallments] = useState(false);
    const [error, setError] = useState('');
    const bookings = useWorkshopBookings();
    const offer = getWorkshopOffer(offerId);
    const grammar = offer?.category === 'grammar' ? offer.pack : undefined;
    const practice =
        offer?.category === 'practice' ? offer.workshop : undefined;
    const currentLevel = grammar?.level ?? level;
    const title = grammar?.title ?? practice?.title ?? '';
    const volume = grammar
        ? workshopVolume(grammar.sessions, grammar.durationMinutes)
        : practice
          ? workshopVolume(1, practice.durationMinutes)
          : '';
    const basePrice = grammar
        ? grammar.price[tier]
        : practice
          ? practice.price[tier]
          : 0;
    const cohorts = offer ? getWorkshopCohorts(offer, tier, { level }) : [];
    const cohort = cohorts.find((item) => item.id === cohortId);
    const payInInstallments = Boolean(grammar) && installments;
    const quote = getCourseQuote(basePrice, payInInstallments);
    const Icon = grammar
        ? icons.grammar
        : (icons[practice?.id as keyof typeof icons] ?? BookOpen);
    const levelDetail = practice?.levels[currentLevel];

    function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setError('');
        if (!offer) {
            return;
        }
        if (step === 0) {
            setStep(1);
            return;
        }
        const latest = readWorkshopBookings();
        if (
            !cohort ||
            remainingWorkshopSeats(cohort, latest) === 0 ||
            new Date(cohort.startsAt).getTime() <= Date.now()
        ) {
            setStep(1);
            setError(
                'Ce créneau n’est plus disponible. Choisis un autre horaire.',
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
                'Paiement refusé (simulation). Aucune place réservée et aucune réservation créée. Tu peux réessayer.',
            );
            return;
        }
        const booking: WorkshopEnrollment = {
            id: `workshop-${Date.now().toString(36)}-${crypto.getRandomValues(new Uint32Array(1))[0].toString(36)}`,
            offerId,
            category: grammar ? 'grammar' : 'practice',
            title,
            level: currentLevel,
            tier,
            cohort,
            name: name.trim(),
            email: email.trim(),
            goal: goal.trim(),
            timezone,
            installments: payInInstallments,
            ...quote,
            createdAt: new Date().toISOString(),
            status: 'confirmed',
            notes: '',
        };
        saveWorkshopBookings([...latest, booking]);
        router.visit(workshopManage({ query: { id: booking.id } }));
    }

    if (!offer || !cohorts.length) {
        return (
            <BookingShell>
                <Head title="Réserver un atelier" />
                <div className="flex flex-col items-start gap-4">
                    <h1 className="text-3xl font-semibold">
                        Cette offre est introuvable.
                    </h1>
                    <p className="text-muted-foreground">
                        Choisis un pack de grammaire ou un atelier pratique pour
                        continuer.
                    </p>
                    <Button asChild>
                        <Link href={workshopsRoute()}>Voir les ateliers</Link>
                    </Button>
                </div>
            </BookingShell>
        );
    }

    return (
        <BookingShell>
            <Head title={`Réserver · ${title}`} />
            <div className="flex flex-col gap-3">
                <p className="text-sm font-medium text-primary">
                    Packs de grammaire & ateliers pratiques
                </p>
                <h1 className="text-3xl font-semibold sm:text-4xl">
                    Ton offre. Ton créneau. Ton paiement.
                </h1>
                <p className="max-w-2xl text-muted-foreground">
                    Une réservation de démonstration, enregistrée uniquement
                    dans ce navigateur. Aucun débit réel, aucun email envoyé.
                </p>
            </div>
            <div className="grid items-start gap-8 lg:grid-cols-[1fr_300px]">
                <section className="overflow-hidden rounded-3xl border border-border/60 bg-background">
                    <ol
                        aria-label="Étapes de réservation"
                        className="grid grid-cols-4 border-b border-border/60"
                    >
                        {steps.map((stepTitle, index) => (
                            <li
                                key={stepTitle}
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
                                {stepTitle}
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
                                <div className="flex flex-col gap-4 rounded-2xl border border-border/50 bg-muted/30 p-5">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <Badge variant="secondary">
                                            {grammar
                                                ? 'Pack de grammaire'
                                                : 'Atelier pratique'}
                                        </Badge>
                                        <Badge variant="outline">
                                            {currentLevel.toUpperCase()}
                                        </Badge>
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-semibold">
                                            {title}
                                        </h3>
                                        <p className="mt-1 text-sm text-muted-foreground">
                                            {grammar?.description ??
                                                practice?.description}
                                        </p>
                                    </div>
                                    <p className="text-sm">
                                        {volume} · en visio
                                    </p>
                                    <Link
                                        href={workshopDetail.url(offerId, {
                                            query: {
                                                tier,
                                                level: currentLevel,
                                            },
                                        })}
                                        className="text-xs font-semibold text-primary underline underline-offset-4"
                                    >
                                        Voir le programme complet
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
                                            ? 'Toute l’attention du professeur : le tarif est plus élevé.'
                                            : '3 à 6 élèves de même niveau : le tarif est par personne.'}
                                    </p>
                                </div>

                                {practice && levelDetail && (
                                    <div className="flex flex-col gap-2">
                                        <Label htmlFor="workshop-level">
                                            Ton niveau
                                        </Label>
                                        <select
                                            id="workshop-level"
                                            className={selectClassName}
                                            value={level}
                                            onChange={(event) => {
                                                setLevel(
                                                    event.target
                                                        .value as LevelSlug,
                                                );
                                                setCohortId('');
                                            }}
                                        >
                                            {workshopLevels.map((item) => (
                                                <option key={item} value={item}>
                                                    {item.toUpperCase()}
                                                </option>
                                            ))}
                                        </select>
                                        <p className="text-sm text-muted-foreground">
                                            Exemple de séance :{' '}
                                            {levelDetail.task}
                                        </p>
                                    </div>
                                )}

                                <Alert>
                                    <AlertDescription>
                                        {grammar
                                            ? 'Le pack se déroule sur plusieurs séances. Choisis un départ à l’étape suivante.'
                                            : 'Une seule séance. Choisis un créneau à l’étape suivante.'}{' '}
                                        Les programmes et tarifs sont des
                                        démonstrations.
                                    </AlertDescription>
                                </Alert>
                            </>
                        )}
                        {step === 1 && (
                            <>
                                <div className="flex flex-col gap-2">
                                    <Label htmlFor="workshop-timezone">
                                        Fuseau d’affichage
                                    </Label>
                                    <select
                                        id="workshop-timezone"
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
                                    {grammar
                                        ? 'Choisis un départ. Les séances se suivent une fois par semaine, au même horaire.'
                                        : 'Choisis la séance qui t’arrange. Les créneaux ci-dessous sont fictifs.'}
                                </p>
                                <fieldset>
                                    <legend className="mb-3 text-sm font-medium">
                                        {grammar
                                            ? 'Départs proposés'
                                            : 'Créneaux proposés'}
                                    </legend>
                                    <div className="flex flex-col gap-3">
                                        {cohorts.map((item) => {
                                            const seats =
                                                remainingWorkshopSeats(
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
                                                            {grammar
                                                                ? `${item.sessions.length} séances · ${grammar.durationMinutes} min · 1 par semaine`
                                                                : `Séance de ${practice?.durationMinutes} min`}
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
                                    Aucun compte obligatoire dans cette démo.
                                    Utilise des coordonnées fictives.
                                </p>
                                <div className="flex flex-col gap-2">
                                    <Label htmlFor="workshop-name">
                                        Prénom
                                    </Label>
                                    <Input
                                        id="workshop-name"
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
                                    <Label htmlFor="workshop-email">
                                        Email fictif
                                    </Label>
                                    <Input
                                        id="workshop-email"
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
                                    <Label htmlFor="workshop-goal">
                                        Ton objectif
                                    </Label>
                                    <Input
                                        id="workshop-goal"
                                        required
                                        maxLength={300}
                                        value={goal}
                                        onChange={(event) =>
                                            setGoal(event.target.value)
                                        }
                                        placeholder="Ex. consolider le passé, parler plus facilement…"
                                    />
                                </div>
                            </>
                        )}
                        {step === 3 && cohort && (
                            <>
                                <dl className="grid grid-cols-[95px_1fr] gap-3 text-sm">
                                    <dt className="text-muted-foreground">
                                        Offre
                                    </dt>
                                    <dd>
                                        {title} · {currentLevel.toUpperCase()}
                                    </dd>
                                    <dt className="text-muted-foreground">
                                        Formule
                                    </dt>
                                    <dd>
                                        {tierLabels[tier]} · {volume}
                                    </dd>
                                    <dt className="text-muted-foreground">
                                        Début
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

                                {grammar ? (
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
                                ) : (
                                    <p className="rounded-xl bg-muted/50 p-4 text-sm">
                                        Paiement en une fois pour une séance à
                                        l’unité.
                                    </p>
                                )}

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
                                    {payInInstallments && (
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
                                        {tier === 'group' && grammar
                                            ? 'Si le groupe n’ouvre pas, report ou remboursement intégral simulé. '
                                            : ''}
                                        Aucun paiement réel, email ou lien Meet
                                        n’est créé.
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
                                        démonstration : annulation simulée avant
                                        la première séance, dans les délais
                                        indiqués sur la page de suivi.
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
                                        remainingWorkshopSeats(
                                            cohort,
                                            bookings,
                                        ) === 0)
                                }
                            >
                                {step === 3
                                    ? 'Simuler le paiement'
                                    : 'Continuer'}
                                <ArrowRight />
                            </Button>
                        </div>
                    </form>
                </section>

                <aside className="flex flex-col gap-4 rounded-3xl border border-border/60 bg-background p-6 lg:sticky lg:top-8">
                    <span className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                        <Icon />
                    </span>
                    <div>
                        <Badge variant="outline">
                            {grammar ? 'Pack de grammaire' : 'Atelier pratique'}
                        </Badge>
                        <h2 className="mt-2 text-xl font-semibold">{title}</h2>
                        <p className="mt-1 text-sm text-muted-foreground">
                            {currentLevel.toUpperCase()} · {volume}
                        </p>
                    </div>
                    <p className="flex items-center gap-2 text-sm">
                        {tier === 'solo' ? <UserRound /> : <Users />}
                        {tierLabels[tier]} · en visio
                    </p>
                    {cohort && (
                        <p className="text-sm">
                            Début : {formatTrialDate(cohort.startsAt, timezone)}
                        </p>
                    )}
                    <div className="border-t border-border pt-4">
                        <p className="text-xs text-muted-foreground">
                            {payInInstallments
                                ? 'Total avec frais de 5 %'
                                : 'Prix total'}
                            {tier === 'group' ? ' · par personne' : ''}
                        </p>
                        <p className="mt-1 text-3xl font-semibold">
                            {formatCourseMoney(quote.totalCents)}
                        </p>
                    </div>
                    <p className="text-xs text-muted-foreground">
                        Supports, exercices et corrections inclus. Tarifs de
                        démonstration, sans engagement.
                    </p>
                    <Button
                        asChild
                        variant="ghost"
                        className="justify-start rounded-full px-0"
                    >
                        <Link href={workshopsRoute()}>
                            <ArrowLeft />
                            Changer d’offre
                        </Link>
                    </Button>
                </aside>
            </div>
        </BookingShell>
    );
}
