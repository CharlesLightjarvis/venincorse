import { Head, Link, usePage } from '@inertiajs/react';
import { ArrowLeft, ArrowRight, Check, Clock, Video } from 'reicon-react';
import { useState, type FormEvent } from 'react';
import {
    AvailableTrialSlotPicker,
    selectClassName,
} from '@/components/trial-slot-picker';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
    timezoneIdentifiers,
    useBrowserTimezone,
} from '@/hooks/use-browser-timezone';
import { usePageRestore } from '@/hooks/use-page-restore';
import {
    formatReservationDate,
    formatReservationPrice,
    postTrialRequest,
    reservationStatusLabels,
    TrialRequestError,
    type TrialReservationSummary,
} from '@/lib/trial-reservations';
import { cn } from '@/lib/utils';
import { courses } from '@/routes';
import { sales } from '@/routes/legal';
import { trial as demoTrial } from '@/routes/demo';
import { store as checkoutStore } from '@/routes/trial-checkout';
import { index as myTrial, prepare, store } from '@/routes/trial-reservations';
import type { Auth } from '@/types';

const steps = ['Ton créneau', 'À propos de toi', 'Récapitulatif'];

type Props = {
    slots: { id: number; starts_at: string }[];
    selectedSlotId: number | null;
    selectedTimezone: string | null;
    submissionKey: string;
    checkoutKey: string;
    paymentReady: boolean;
    amountCents: number;
    currency: string;
    bookedTrial: TrialReservationSummary | null;
    pendingPayment: TrialReservationSummary | null;
};

const goalLetters = /\p{L}/gu;

export default function CreateTrial({
    slots,
    selectedSlotId,
    selectedTimezone,
    submissionKey,
    checkoutKey,
    paymentReady,
    amountCents,
    currency,
    bookedTrial,
    pendingPayment,
}: Props) {
    const { auth } = usePage<{ auth: Auth }>().props;
    const [step, setStep] = useState(
        auth.user && slots.some((slot) => slot.id === selectedSlotId) ? 1 : 0,
    );
    const [slotId, setSlotId] = useState(selectedSlotId ?? 0);
    const detectedTimezone = useBrowserTimezone();
    const [timezoneOverride, setTimezoneOverride] = useState<string | null>(
        selectedTimezone,
    );
    const timezone =
        timezoneOverride ?? auth.user?.timezone ?? detectedTimezone;
    const [level, setLevel] = useState('unknown');
    const [goal, setGoal] = useState('');
    const [terms, setTerms] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [reservationId, setReservationId] = useState<string | null>(null);
    usePageRestore(() => setProcessing(false));
    const [errors, setErrors] = useState<Record<string, string>>({});
    const selected = slots.find((slot) => slot.id === slotId);

    async function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (processing || !selected || !auth.user) {
            return;
        }
        if (step === 1 && (goal.match(goalLetters)?.length ?? 0) < 3) {
            setErrors({
                goal: 'Décris ton objectif en quelques mots (5 à 2 000 caractères).',
            });
            return;
        }
        if (step < 2) {
            setErrors({});
            setStep(step + 1);
            return;
        }
        setProcessing(true);
        setErrors({});
        try {
            const id =
                reservationId ??
                (
                    await postTrialRequest<{ reservation_id: string }>(
                        store.url(),
                        submissionKey,
                        { slot_id: slotId, timezone, level, goal, terms },
                    )
                ).reservation_id;
            setReservationId(id);
            const checkout = await postTrialRequest<{ checkout_url: string }>(
                checkoutStore.url(id),
                checkoutKey,
                {},
            );
            window.location.assign(checkout.checkout_url);
        } catch (error) {
            setErrors(
                error instanceof TrialRequestError
                    ? error.errors
                    : {
                          request:
                              'Connexion interrompue. Réessaie : ta réservation ne sera pas dupliquée.',
                      },
            );
            setProcessing(false);
        }
    }

    if (bookedTrial) {
        return (
            <div className="mx-auto flex max-w-3xl flex-col gap-6 px-5 py-10 sm:px-8 sm:py-14">
                <Head title="Ton cours d’essai" />
                <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                    Ton cours d’essai est déjà réservé.
                </h1>
                <section className="flex flex-col gap-4 rounded-3xl border border-border/60 bg-background p-6 sm:p-8">
                    <p className="font-medium text-primary">
                        {reservationStatusLabels[bookedTrial.status]}
                    </p>
                    <p className="text-2xl font-semibold">
                        {formatReservationDate(bookedTrial.starts_at, timezone)}
                    </p>
                    <p className="text-muted-foreground">
                        Le cours d’essai est proposé une fois par élève. Pour
                        continuer après cette séance, découvre nos parcours.
                    </p>
                    <div className="flex flex-wrap gap-3">
                        <Button asChild className="rounded-full">
                            <Link href={myTrial()}>Voir mon cours d’essai</Link>
                        </Button>
                        <Button
                            asChild
                            variant="outline"
                            className="rounded-full"
                        >
                            <Link href={courses()}>Découvrir les parcours</Link>
                        </Button>
                    </div>
                </section>
            </div>
        );
    }

    return (
        <div className="mx-auto flex max-w-6xl flex-col gap-8 px-5 py-10 sm:px-8 sm:py-14">
            <Head title="Réserver une heure d’essai" />
            <div className="flex flex-col gap-3">
                <p className="text-sm font-medium text-primary">
                    Ton premier rendez-vous avec l’allemand
                </p>
                <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                    Une heure pour essayer.
                </h1>
                <p className="max-w-xl text-muted-foreground">
                    Choisis ton horaire, parle-nous de ton objectif et teste la
                    méthode. Connecte-toi avant de poursuivre vers le paiement,
                    sans abonnement.
                </p>
            </div>
            {pendingPayment && (
                <Alert>
                    <AlertDescription>
                        <p>
                            Tu as un paiement en attente pour le{' '}
                            {formatReservationDate(
                                pendingPayment.starts_at,
                                timezone,
                            )}
                            .{' '}
                            <Link
                                href={myTrial()}
                                className="font-medium text-primary underline underline-offset-4"
                            >
                                Reprendre le paiement
                            </Link>
                        </p>
                        <p className="mt-1 text-muted-foreground">
                            Si tu choisis un autre créneau, cette tentative sera
                            annulée et son créneau libéré.
                        </p>
                    </AlertDescription>
                </Alert>
            )}
            <div className="grid items-start gap-8 lg:grid-cols-[1fr_300px]">
                <section className="min-w-0 overflow-hidden rounded-3xl border border-border/60 bg-background">
                    <ol
                        aria-label="Étapes de réservation"
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
                        {Object.keys(errors).length > 0 && (
                            <Alert variant="destructive">
                                <AlertDescription>
                                    <ul>
                                        {Object.entries(errors).map(
                                            ([key, message]) => (
                                                <li key={key}>{message}</li>
                                            ),
                                        )}
                                    </ul>
                                </AlertDescription>
                            </Alert>
                        )}
                        {reservationId && Object.keys(errors).length > 0 && (
                            <Link
                                href={myTrial()}
                                className="text-sm text-primary underline underline-offset-4"
                            >
                                Retrouver cette réservation dans mon espace
                            </Link>
                        )}
                        {step === 0 && (
                            <>
                                <AvailableTrialSlotPicker
                                    slots={slots.map((slot) => slot.starts_at)}
                                    value={selected?.starts_at ?? ''}
                                    onChange={(value) =>
                                        setSlotId(
                                            slots.find(
                                                (slot) =>
                                                    slot.starts_at === value,
                                            )?.id ?? 0,
                                        )
                                    }
                                    timezone={timezone}
                                    onTimezoneChange={setTimezoneOverride}
                                    timezones={timezoneIdentifiers(timezone)}
                                    emptyMessage="Aucun créneau disponible pour le moment. Reviens prochainement ou contacte-nous."
                                />
                                {selectedSlotId &&
                                    !slots.some(
                                        (slot) => slot.id === selectedSlotId,
                                    ) && (
                                        <p
                                            role="alert"
                                            className="text-sm text-destructive"
                                        >
                                            Le créneau choisi avant ta connexion
                                            n’est plus disponible. Sélectionne
                                            un autre horaire.
                                        </p>
                                    )}
                                {!auth.user && (
                                    <p className="text-sm text-muted-foreground">
                                        Connecte-toi ou crée ton compte pour
                                        continuer. Ton créneau et ton fuseau
                                        seront conservés pendant la connexion,
                                        mais le créneau n’est pas encore bloqué.
                                    </p>
                                )}
                            </>
                        )}
                        {step === 1 && (
                            <div className="flex flex-col gap-5">
                                <p className="text-sm text-muted-foreground">
                                    Quelques repères pour préparer une séance
                                    adaptée à toi.
                                </p>
                                <div className="flex flex-col gap-2">
                                    <Label htmlFor="trial-level">
                                        Ton niveau estimé
                                    </Label>
                                    <select
                                        id="trial-level"
                                        className={selectClassName}
                                        value={level}
                                        onChange={(event) =>
                                            setLevel(event.target.value)
                                        }
                                    >
                                        <option value="unknown">
                                            Je ne sais pas
                                        </option>
                                        {['a1', 'a2', 'b1', 'b2'].map(
                                            (value) => (
                                                <option
                                                    key={value}
                                                    value={value}
                                                >
                                                    {value.toUpperCase()}
                                                </option>
                                            ),
                                        )}
                                    </select>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <Label htmlFor="trial-goal">
                                        Qu’aimerais-tu travailler ?
                                    </Label>
                                    <textarea
                                        id="trial-goal"
                                        required
                                        minLength={5}
                                        maxLength={2000}
                                        rows={4}
                                        value={goal}
                                        onChange={(event) =>
                                            setGoal(event.target.value)
                                        }
                                        className="rounded-md border border-input bg-transparent px-3 py-2 focus-visible:outline-2 focus-visible:outline-primary"
                                        placeholder="Ex. préparer un entretien en allemand"
                                    />
                                </div>
                            </div>
                        )}
                        {step === 2 && selected && (
                            <div className="flex flex-col gap-5">
                                <dl className="grid grid-cols-[100px_1fr] gap-x-4 gap-y-3 text-sm">
                                    <dt className="text-muted-foreground">
                                        Créneau
                                    </dt>
                                    <dd>
                                        {formatReservationDate(
                                            selected.starts_at,
                                            timezone,
                                        )}
                                        <span className="block text-xs text-muted-foreground">
                                            {timezone}
                                        </span>
                                    </dd>
                                    <dt className="text-muted-foreground">
                                        Objectif
                                    </dt>
                                    <dd className="break-words">
                                        {goal} ·{' '}
                                        {level === 'unknown'
                                            ? 'Niveau à évaluer'
                                            : level.toUpperCase()}
                                    </dd>
                                    <dt className="text-muted-foreground">
                                        Total
                                    </dt>
                                    <dd className="text-lg font-semibold">
                                        {formatReservationPrice(
                                            amountCents,
                                            currency,
                                        )}
                                    </dd>
                                </dl>
                                <Alert>
                                    <AlertDescription>
                                        {paymentReady
                                            ? 'Tu vas être redirigé vers la page de paiement sécurisée Stripe (mode test). Ta réservation sera confirmée après vérification du paiement, puis visible dans ton espace.'
                                            : 'Le paiement en ligne n’est pas encore disponible. Aucune réservation ne sera enregistrée pour le moment.'}
                                    </AlertDescription>
                                </Alert>
                                <label className="flex items-start gap-3 text-sm leading-relaxed">
                                    <input
                                        type="checkbox"
                                        required
                                        checked={terms}
                                        onChange={(event) =>
                                            setTerms(event.target.checked)
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
                                        </a>{' '}
                                        : report gratuit une fois et annulation
                                        remboursée jusqu’à 24 h avant la séance,
                                        cours non remboursé en cas d’absence. Je
                                        demande que le cours puisse avoir lieu
                                        avant la fin du délai de rétractation de
                                        14 jours. Le créneau est bloqué 45
                                        minutes le temps du paiement.
                                    </span>
                                </label>
                            </div>
                        )}
                        {auth.user && !auth.can?.reserveTrial && (
                            <p
                                role="alert"
                                className="text-sm text-destructive"
                            >
                                Ton compte n’a pas l’autorisation de réserver.
                                Contacte l’administrateur.
                            </p>
                        )}
                        <div className="flex items-center justify-between gap-3 pt-2">
                            <Button
                                type="button"
                                variant="ghost"
                                className="rounded-full"
                                disabled={step === 0 || processing}
                                onClick={() => {
                                    setErrors({});
                                    setStep(step - 1);
                                }}
                            >
                                <ArrowLeft aria-hidden="true" />
                                Retour
                            </Button>
                            {!auth.user ? (
                                selected ? (
                                    <Button asChild className="rounded-full">
                                        <Link
                                            href={prepare({
                                                query: {
                                                    slot: slotId,
                                                    timezone,
                                                },
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
                                        processing ||
                                        !selected ||
                                        !auth.can?.reserveTrial ||
                                        (step === 2 && !paymentReady)
                                    }
                                >
                                    {processing
                                        ? 'Ouverture du paiement…'
                                        : step === 2
                                          ? `${reservationId ? 'Reprendre le paiement' : 'Payer'} ${formatReservationPrice(amountCents, currency)}`
                                          : 'Continuer'}
                                    <ArrowRight aria-hidden="true" />
                                </Button>
                            )}
                        </div>
                    </form>
                </section>
                <aside className="flex flex-col gap-5 rounded-3xl border border-border/60 bg-background p-6 lg:sticky lg:top-8">
                    <span className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                        <Video className="size-6" aria-hidden="true" />
                    </span>
                    <h2 className="text-xl font-semibold">Ton cours d’essai</h2>
                    <p className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="size-4" aria-hidden="true" />
                        60 minutes · en individuel
                    </p>
                    <p className="text-sm text-muted-foreground">
                        En visio. Les modalités de connexion seront communiquées
                        par le professeur après confirmation.
                    </p>
                    <p className="text-sm">
                        {selected
                            ? formatReservationDate(
                                  selected.starts_at,
                                  timezone,
                              )
                            : 'Ton créneau apparaîtra ici.'}
                    </p>
                    <div className="flex items-baseline justify-between border-t border-border pt-4">
                        <span className="text-sm">Prix de la séance</span>
                        <span className="text-3xl font-semibold">
                            {formatReservationPrice(amountCents, currency)}
                        </span>
                    </div>
                    <p className="text-xs leading-relaxed text-muted-foreground">
                        Paiement unique. Aucun abonnement.
                    </p>
                    <Link
                        href={demoTrial()}
                        className="text-sm text-primary underline underline-offset-4"
                    >
                        Revoir le tunnel simulé de référence
                    </Link>
                    {auth.user && (
                        <Link
                            href={myTrial()}
                            className="text-sm text-primary underline underline-offset-4"
                        >
                            Ma réservation d’essai
                        </Link>
                    )}
                </aside>
            </div>
        </div>
    );
}
