import { Head, router, usePage } from '@inertiajs/react';
import { ArrowLeft, ArrowRight, GraduationCap } from 'reicon-react';
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
import { formatCourseMoney, getCourseQuote } from '@/data/course-booking';
import {
    examLevels,
    examProviders,
    examProviderLabels,
    examScopes,
    examScopeLabels,
    examScopeDescriptions,
    examPaceLabels,
    getExamPackage,
    getExamCohorts,
    isExamDateCompatible,
    readExamBookings,
    remainingExamSeats,
    saveExamBookings,
    type ExamProvider,
    type ExamLevel,
    type ExamScope,
    type ExamTier,
    type ExamPace,
    type ExamEnrollment,
} from '@/data/exam-booking';
import { tierLabels } from '@/data/offer';
import { formatTrialDate } from '@/data/trial-booking';
import { useExamBookings } from '@/hooks/use-exam-bookings';
import { cn } from '@/lib/utils';
import { examManage } from '@/routes/booking';

const steps = ['Ta prépa', 'Planning', 'Tes infos', 'Paiement'];

export default function BookExam() {
    const page = usePage();
    const query = new URLSearchParams(page.url.split('?')[1]);
    const [provider, setProvider] = useState<ExamProvider>(
        examProviders.find((item) => item === query.get('provider')) ?? 'osd',
    );
    const [level, setLevel] = useState<ExamLevel>(
        examLevels.find((item) => item === query.get('level')) ?? 'a1',
    );
    const [scope, setScope] = useState<ExamScope>(
        examScopes.find((item) => item === query.get('scope')) ?? 'full',
    );
    const [tier, setTier] = useState<ExamTier>(
        query.get('tier') === 'solo' ? 'solo' : 'group',
    );
    const [pace, setPace] = useState<ExamPace>('regular');
    const [cohortId, setCohortId] = useState('');
    const [timezone, setTimezone] = useState('Europe/Paris');
    const [step, setStep] = useState(0);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [goal, setGoal] = useState('');
    const [examDate, setExamDate] = useState('');
    const [installments, setInstallments] = useState(false);
    const [error, setError] = useState('');
    const bookings = useExamBookings();
    const pack = getExamPackage(provider, level, scope, tier);
    const cohorts = getExamCohorts(provider, level, scope, tier, pace);
    const cohort = cohorts.find((item) => item.id === cohortId);
    const quote = getCourseQuote(pack.priceCents / 100, installments);

    function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setError('');
        if (step === 0) {
            setStep(1);
            return;
        }
        const latest = readExamBookings();
        if (
            !cohort ||
            remainingExamSeats(cohort, latest) === 0 ||
            new Date(cohort.startsAt).getTime() <= Date.now()
        ) {
            setStep(1);
            setError(
                'Ce planning n’est plus disponible. Choisis un autre départ.',
            );
            return;
        }
        if (step >= 2 && !isExamDateCompatible(cohort, examDate)) {
            setStep(2);
            setError(
                'Ce planning se termine après la date d’examen visée. Choisis un départ plus tôt, un rythme plus rapide ou une autre date d’examen.',
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
                'Paiement refusé (simulation). Aucune place réservée et aucune inscription créée. Décoche le refus pour réessayer.',
            );
            return;
        }
        const booking: ExamEnrollment = {
            id: `exam-${Date.now().toString(36)}-${crypto.getRandomValues(new Uint32Array(1))[0].toString(36)}`,
            provider,
            level,
            scope,
            tier,
            pace,
            cohort,
            name: name.trim(),
            email: email.trim(),
            goal: goal.trim(),
            examDate,
            timezone,
            installments,
            ...quote,
            createdAt: new Date().toISOString(),
            status: 'confirmed',
            notes: '',
        };
        saveExamBookings([...latest, booking]);
        router.visit(examManage({ query: { id: booking.id } }));
    }

    return (
        <BookingShell>
            <Head title="Réserver ma préparation d’examen" />
            <div className="flex flex-col gap-3">
                <p className="text-sm font-medium text-primary">
                    Goethe-Institut · ÖSD · TELC
                </p>
                <h1 className="text-3xl font-semibold sm:text-4xl">
                    Prépare les épreuves dont tu as besoin.
                </h1>
                <p className="max-w-2xl text-muted-foreground">
                    De A1 à B2 : une préparation complète ou un travail ciblé
                    sur l’écrit ou l’oral, en 1:1 ou en groupe.
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
                                    {index + 1}
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
                        {error && (
                            <Alert variant="destructive">
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}
                        {step === 0 && (
                            <>
                                <div className="grid gap-5 sm:grid-cols-2">
                                    <div className="flex flex-col gap-2">
                                        <Label htmlFor="exam-provider">
                                            Examen visé
                                        </Label>
                                        <select
                                            id="exam-provider"
                                            className={selectClassName}
                                            value={provider}
                                            onChange={(event) => {
                                                setProvider(
                                                    event.target
                                                        .value as ExamProvider,
                                                );
                                                setCohortId('');
                                            }}
                                        >
                                            {examProviders.map((item) => (
                                                <option key={item} value={item}>
                                                    {examProviderLabels[item]}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <Label htmlFor="exam-level">
                                            Niveau du certificat
                                        </Label>
                                        <select
                                            id="exam-level"
                                            className={selectClassName}
                                            value={level}
                                            onChange={(event) => {
                                                setLevel(
                                                    event.target
                                                        .value as ExamLevel,
                                                );
                                                setCohortId('');
                                            }}
                                        >
                                            {examLevels.map((item) => (
                                                <option key={item} value={item}>
                                                    {item.toUpperCase()}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                <fieldset>
                                    <legend className="mb-3 text-sm font-medium">
                                        Quelles épreuves veux-tu préparer ?
                                    </legend>
                                    <div className="flex flex-col gap-3">
                                        {examScopes.map((item) => (
                                            <label
                                                key={item}
                                                className={cn(
                                                    'flex cursor-pointer items-start gap-3 rounded-2xl border p-4 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring',
                                                    scope === item
                                                        ? 'border-primary bg-primary/5'
                                                        : 'border-border',
                                                )}
                                            >
                                                <input
                                                    type="radio"
                                                    name="exam-scope"
                                                    value={item}
                                                    checked={scope === item}
                                                    onChange={() => {
                                                        setScope(item);
                                                        setCohortId('');
                                                    }}
                                                    className="mt-1 accent-primary"
                                                />
                                                <span className="flex flex-col gap-2">
                                                    <span className="font-semibold">
                                                        {examScopeLabels[item]}
                                                    </span>
                                                    <span className="text-sm text-muted-foreground">
                                                        {
                                                            examScopeDescriptions[
                                                                item
                                                            ]
                                                        }
                                                    </span>
                                                    <span className="text-sm font-medium text-primary">
                                                        {formatCourseMoney(
                                                            getExamPackage(
                                                                provider,
                                                                level,
                                                                item,
                                                                tier,
                                                            ).priceCents,
                                                        )}{' '}
                                                        ·{' '}
                                                        {
                                                            getExamPackage(
                                                                provider,
                                                                level,
                                                                item,
                                                                tier,
                                                            ).sessionCount
                                                        }{' '}
                                                        séances de 90 min
                                                    </span>
                                                </span>
                                            </label>
                                        ))}
                                    </div>
                                </fieldset>
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
                                            ? 'Toute l’attention du professeur en individuel, à un tarif plus élevé.'
                                            : 'Groupe de 3 à 6 élèves préparant le même certificat, le même niveau et les mêmes épreuves. Tarif par personne.'}
                                    </p>
                                </div>
                                <Alert>
                                    <AlertDescription>
                                        Tu réserves une préparation, pas
                                        l’inscription à l’examen officiel. Les
                                        modules et possibilités de passage
                                        séparé sont à vérifier auprès du centre.
                                        Tarifs de démonstration, à valider.
                                    </AlertDescription>
                                </Alert>
                            </>
                        )}
                        {step === 1 && (
                            <>
                                <div className="flex flex-col gap-2">
                                    <Label htmlFor="exam-timezone">
                                        Fuseau d’affichage
                                    </Label>
                                    <select
                                        id="exam-timezone"
                                        className={selectClassName}
                                        value={timezone}
                                        onChange={(event) =>
                                            setTimezone(event.target.value)
                                        }
                                    >
                                        {timezoneOptions.map((item) => (
                                            <option key={item}>{item}</option>
                                        ))}
                                    </select>
                                </div>
                                <fieldset>
                                    <legend className="mb-3 text-sm font-medium">
                                        Rythme d’entraînement
                                    </legend>
                                    <div className="flex flex-col gap-3">
                                        {(
                                            ['regular', 'intensive'] as const
                                        ).map((item) => (
                                            <label
                                                key={item}
                                                className={cn(
                                                    'flex cursor-pointer gap-3 rounded-xl border p-4 text-sm',
                                                    pace === item
                                                        ? 'border-primary bg-primary/5'
                                                        : 'border-border',
                                                )}
                                            >
                                                <input
                                                    type="radio"
                                                    name="exam-pace"
                                                    checked={pace === item}
                                                    onChange={() => {
                                                        setPace(item);
                                                        setCohortId('');
                                                    }}
                                                />
                                                {examPaceLabels[item]}
                                            </label>
                                        ))}
                                    </div>
                                    <p className="mt-3 text-xs text-muted-foreground">
                                        Le rythme change le planning, pas le
                                        prix ni le nombre de séances.
                                    </p>
                                </fieldset>
                                <fieldset>
                                    <legend className="mb-3 text-sm font-medium">
                                        {tier === 'group'
                                            ? 'Choisis ta cohorte'
                                            : 'Choisis ton planning individuel'}
                                    </legend>
                                    <div className="flex flex-col gap-3">
                                        {cohorts.map((item) => {
                                            const seats = remainingExamSeats(
                                                item,
                                                bookings,
                                            );
                                            return (
                                                <label
                                                    key={item.id}
                                                    className={cn(
                                                        'flex items-start gap-3 rounded-2xl border p-4',
                                                        cohortId === item.id
                                                            ? 'border-primary bg-primary/5'
                                                            : 'border-border',
                                                        !seats && 'opacity-50',
                                                    )}
                                                >
                                                    <input
                                                        type="radio"
                                                        name="exam-cohort"
                                                        disabled={!seats}
                                                        checked={
                                                            cohortId === item.id
                                                        }
                                                        onChange={() =>
                                                            setCohortId(item.id)
                                                        }
                                                        className="mt-1"
                                                    />
                                                    <span className="flex flex-col gap-1">
                                                        <span className="font-medium">
                                                            {formatTrialDate(
                                                                item.startsAt,
                                                                timezone,
                                                            )}
                                                        </span>
                                                        <span className="text-sm text-muted-foreground">
                                                            {pack.sessionCount}{' '}
                                                            séances de 90 min ·{' '}
                                                            {pack.hours.toLocaleString(
                                                                'fr-FR',
                                                            )}{' '}
                                                            h
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
                                <p className="text-xs text-muted-foreground">
                                    Planning fictif : les dernières séances sont
                                    consacrées aux simulations d’épreuves. Ces
                                    durées sont celles des cours, pas celles de
                                    l’examen officiel.
                                </p>
                            </>
                        )}
                        {step === 2 && (
                            <>
                                <div className="flex flex-col gap-2">
                                    <Label htmlFor="exam-name">Prénom</Label>
                                    <Input
                                        id="exam-name"
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
                                    <Label htmlFor="exam-email">
                                        Email fictif
                                    </Label>
                                    <Input
                                        id="exam-email"
                                        type="email"
                                        required
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
                                    <Label htmlFor="exam-goal">
                                        Ton objectif ou les difficultés à
                                        travailler
                                    </Label>
                                    <Input
                                        id="exam-goal"
                                        required
                                        maxLength={300}
                                        value={goal}
                                        onChange={(event) =>
                                            setGoal(event.target.value)
                                        }
                                        placeholder="Ex. gagner en aisance à l’oral"
                                    />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <Label htmlFor="exam-date">
                                        Date d’examen visée (facultative)
                                    </Label>
                                    <Input
                                        id="exam-date"
                                        type="date"
                                        min={new Date()
                                            .toISOString()
                                            .slice(0, 10)}
                                        value={examDate}
                                        onChange={(event) =>
                                            setExamDate(event.target.value)
                                        }
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        On vérifie que tes séances se terminent
                                        avant cette date. Ce champ ne réserve
                                        pas de place dans un centre d’examen.
                                    </p>
                                </div>
                            </>
                        )}
                        {step === 3 && cohort && (
                            <>
                                <dl className="grid grid-cols-[90px_1fr] gap-3 text-sm">
                                    <dt className="text-muted-foreground">
                                        Préparation
                                    </dt>
                                    <dd>
                                        {examProviderLabels[provider]}{' '}
                                        {level.toUpperCase()}
                                        <br />
                                        {examScopeLabels[scope]}
                                    </dd>
                                    <dt className="text-muted-foreground">
                                        Formule
                                    </dt>
                                    <dd>
                                        {tierLabels[tier]}
                                        <br />
                                        {examPaceLabels[pace]}
                                    </dd>
                                    <dt className="text-muted-foreground">
                                        Volume
                                    </dt>
                                    <dd>
                                        {pack.trainingSessions} séances
                                        d’entraînement + {pack.mockSessions}{' '}
                                        simulation(s) de 90 min
                                        <br />
                                        {pack.hours.toLocaleString(
                                            'fr-FR',
                                        )}{' '}
                                        heures au total
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
                                    {examDate && (
                                        <>
                                            <dt className="text-muted-foreground">
                                                Examen visé
                                            </dt>
                                            <dd>{examDate}</dd>
                                        </>
                                    )}
                                </dl>
                                <fieldset>
                                    <legend className="mb-3 text-sm font-medium">
                                        Paiement de la préparation
                                    </legend>
                                    <div className="flex flex-col gap-3">
                                        <label className="flex items-center gap-3 text-sm">
                                            <input
                                                type="radio"
                                                name="exam-installments"
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
                                                name="exam-installments"
                                                checked={installments}
                                                onChange={() =>
                                                    setInstallments(true)
                                                }
                                            />
                                            En 3 fois · total majoré de 5 %
                                        </label>
                                    </div>
                                </fieldset>
                                <div className="rounded-xl bg-muted/50 p-4">
                                    <p className="font-semibold">
                                        Total :{' '}
                                        {formatCourseMoney(quote.totalCents)}
                                    </p>
                                    <p className="mt-2 text-sm">
                                        Aujourd’hui :{' '}
                                        {formatCourseMoney(
                                            quote.paymentsCents[0],
                                        )}{' '}
                                        (simulation)
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
                                        Les frais d’examen officiel ne sont pas
                                        inclus. Aucun email, paiement réel ou
                                        réunion Meet n’est créé.
                                        {tier === 'group' &&
                                            ' Si le groupe n’ouvre pas, report ou remboursement intégral.'}
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
                                        démonstration : annulation sous 14 jours
                                        et avant le début de la préparation,
                                        avec remboursement simulé.
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
                                        remainingExamSeats(cohort, bookings) ===
                                            0)
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
                        <GraduationCap />
                    </span>
                    <h2 className="text-xl font-semibold">
                        {examProviderLabels[provider]} {level.toUpperCase()}
                    </h2>
                    <p className="font-medium">{examScopeLabels[scope]}</p>
                    <p className="text-sm text-muted-foreground">
                        {tierLabels[tier]} · {pack.sessionCount} séances de 90
                        min · {pack.hours.toLocaleString('fr-FR')} h
                    </p>
                    <p className="text-sm">{examPaceLabels[pace]}</p>
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
                                : 'Prix de la préparation'}
                            {tier === 'group' && ' · par personne'}
                        </p>
                        <p className="mt-1 text-3xl font-semibold">
                            {formatCourseMoney(quote.totalCents)}
                        </p>
                    </div>
                    <p className="text-xs text-muted-foreground">
                        Tarif fictif, à valider. Supports et corrections inclus.
                        Inscription officielle à l’examen non comprise.
                    </p>
                </aside>
            </div>
        </BookingShell>
    );
}
