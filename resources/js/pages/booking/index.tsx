import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, ArrowRight, Check, Clock, Video } from 'reicon-react';
import { useState, type FormEvent } from 'react';
import { BookingShell } from '@/components/booking-shell';
import {
    TrialSlotPicker,
    selectClassName,
} from '@/components/trial-slot-picker';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useTrialBooking } from '@/hooks/use-trial-booking';
import {
    formatTrialDate,
    getTrialSlots,
    readTrialState,
    saveTrialState,
    trialPrice,
    type TrialBooking,
} from '@/data/trial-booking';
import { cn } from '@/lib/utils';
import { manage } from '@/routes/booking';
import { levelTest } from '@/routes';

const steps = ['Ton créneau', 'À propos de toi', 'Récapitulatif'];

export default function TrialBookingPage() {
    const state = useTrialBooking();
    const [step, setStep] = useState(0);
    const [slot, setSlot] = useState('');
    const [timezone, setTimezone] = useState('Europe/Paris');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [level, setLevel] = useState('Je ne sais pas');
    const [goal, setGoal] = useState('');
    const [error, setError] = useState('');
    const slotAvailable = getTrialSlots(state).includes(slot);

    function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setError('');
        if (!getTrialSlots(readTrialState()).includes(slot)) {
            setError(
                'Ce créneau n’est plus disponible. Choisis un autre horaire.',
            );
            setStep(0);
            return;
        }
        if (step === 1 && (!name.trim() || !email.trim() || !goal.trim())) {
            setError(
                'Renseigne ton prénom, ton email fictif et ton objectif pour continuer.',
            );
            return;
        }
        if (step < 2) {
            setStep(step + 1);
            return;
        }
        const formData = new FormData(event.currentTarget);
        if (!formData.has('terms')) {
            return;
        }
        if (formData.has('payment-fails')) {
            setError(
                'Paiement refusé (simulation). Aucun créneau réservé. Désactive la simulation de refus pour réessayer.',
            );
            return;
        }
        const booking: TrialBooking = {
            id: `demo-${Date.now().toString(36)}-${crypto.getRandomValues(new Uint32Array(1))[0].toString(36)}`,
            startsAt: slot,
            name: name.trim(),
            email: email.trim(),
            level,
            goal: goal.trim(),
            timezone,
            status: 'confirmed',
            payment: 'paid',
            notes: '',
            recommendation: '',
        };
        const latest = readTrialState();
        saveTrialState({ ...latest, bookings: [...latest.bookings, booking] });
        router.visit(manage({ query: { id: booking.id, confirmed: '1' } }));
    }

    return (
        <BookingShell>
            <Head title="Réserver un cours d’essai" />
            <div className="flex flex-col gap-3">
                <p className="text-sm font-medium text-primary">
                    Ton premier rendez-vous avec l’allemand
                </p>
                <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                    Une heure pour essayer.
                </h1>
                <p className="max-w-xl text-muted-foreground">
                    Choisis ton horaire, parle-nous de ton objectif et teste la
                    méthode. Sans compte et sans engagement.
                </p>
            </div>
            <div className="grid items-start gap-8 lg:grid-cols-[1fr_300px]">
                <section className="overflow-hidden rounded-3xl border border-border/60 bg-background">
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
                            <TrialSlotPicker
                                state={state}
                                value={slot}
                                onChange={setSlot}
                                timezone={timezone}
                                onTimezoneChange={setTimezone}
                            />
                        )}
                        {step === 1 && (
                            <div className="flex flex-col gap-5">
                                <p className="text-sm text-muted-foreground">
                                    Quelques repères pour préparer une séance
                                    adaptée à toi. Le test de niveau n’est pas
                                    obligatoire.
                                </p>
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="flex flex-col gap-2">
                                        <Label htmlFor="name">Prénom</Label>
                                        <Input
                                            id="name"
                                            name="name"
                                            autoComplete="given-name"
                                            required
                                            maxLength={80}
                                            value={name}
                                            onChange={(event) =>
                                                setName(event.target.value)
                                            }
                                            placeholder="Ex. Camille"
                                        />
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <Label htmlFor="email">
                                            Email fictif
                                        </Label>
                                        <Input
                                            id="email"
                                            name="email"
                                            type="email"
                                            autoComplete="email"
                                            required
                                            maxLength={200}
                                            value={email}
                                            onChange={(event) =>
                                                setEmail(event.target.value)
                                            }
                                            placeholder="camille@example.test"
                                        />
                                    </div>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <Label htmlFor="level">
                                        Ton niveau estimé
                                    </Label>
                                    <select
                                        id="level"
                                        className={selectClassName}
                                        value={level}
                                        onChange={(event) =>
                                            setLevel(event.target.value)
                                        }
                                    >
                                        {[
                                            'Je ne sais pas',
                                            'Je pars de zéro',
                                            'A1',
                                            'A2',
                                            'B1',
                                            'B2',
                                        ].map((option) => (
                                            <option key={option}>
                                                {option}
                                            </option>
                                        ))}
                                    </select>
                                    <Link
                                        href={levelTest()}
                                        className="text-xs text-primary underline underline-offset-4"
                                    >
                                        Tu peux aussi passer le test gratuit
                                        avant de réserver.
                                    </Link>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <Label htmlFor="goal">
                                        Qu’aimerais-tu travailler ?
                                    </Label>
                                    <Input
                                        id="goal"
                                        name="goal"
                                        required
                                        maxLength={300}
                                        value={goal}
                                        onChange={(event) =>
                                            setGoal(event.target.value)
                                        }
                                        placeholder="Ex. préparer un entretien en allemand"
                                    />
                                </div>
                            </div>
                        )}
                        {step === 2 && (
                            <div className="flex flex-col gap-5">
                                <dl className="grid grid-cols-[100px_1fr] gap-x-4 gap-y-3 text-sm">
                                    <dt className="text-muted-foreground">
                                        Créneau
                                    </dt>
                                    <dd>
                                        {formatTrialDate(slot, timezone)}
                                        <span className="block text-xs text-muted-foreground">
                                            {timezone}
                                        </span>
                                    </dd>
                                    <dt className="text-muted-foreground">
                                        Participant
                                    </dt>
                                    <dd className="break-words">
                                        {name}
                                        <br />
                                        {email}
                                    </dd>
                                    <dt className="text-muted-foreground">
                                        Objectif
                                    </dt>
                                    <dd className="break-words">
                                        {goal} · {level}
                                    </dd>
                                    <dt className="text-muted-foreground">
                                        Total
                                    </dt>
                                    <dd className="text-lg font-semibold">
                                        {trialPrice} €
                                    </dd>
                                </dl>
                                <Alert>
                                    <AlertDescription>
                                        Aucune information bancaire n’est
                                        demandée. Le bouton ci-dessous simule
                                        uniquement un paiement réussi.
                                    </AlertDescription>
                                </Alert>
                                <label className="flex items-start gap-3 text-sm">
                                    <input
                                        type="checkbox"
                                        required
                                        name="terms"
                                        className="mt-1 accent-primary"
                                    />
                                    <span>
                                        J’accepte les conditions de
                                        démonstration : report ou annulation
                                        jusqu’à 24 h avant le cours,
                                        remboursement simulé en cas
                                        d’annulation.
                                    </span>
                                </label>
                                <label className="flex items-center gap-3 text-xs text-muted-foreground">
                                    <input
                                        id="payment-fails"
                                        type="checkbox"
                                        name="payment-fails"
                                        className="accent-primary"
                                    />
                                    Tester un paiement refusé
                                </label>
                            </div>
                        )}
                        <div className="flex items-center justify-between gap-3 pt-2">
                            <Button
                                type="button"
                                variant="ghost"
                                className="rounded-full"
                                disabled={step === 0}
                                onClick={() => {
                                    setError('');
                                    setStep(step - 1);
                                }}
                            >
                                <ArrowLeft />
                                Retour
                            </Button>
                            <Button
                                type="submit"
                                className="rounded-full"
                                disabled={step === 0 && !slotAvailable}
                            >
                                {step === 2
                                    ? 'Simuler le paiement · 39 €'
                                    : 'Continuer'}
                                <ArrowRight />
                            </Button>
                        </div>
                    </form>
                </section>
                <aside className="flex flex-col gap-5 rounded-3xl border border-border/60 bg-background p-6 lg:sticky lg:top-8">
                    <span className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                        <Video className="size-6" />
                    </span>
                    <h2 className="text-xl font-semibold">Ton cours d’essai</h2>
                    <p className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="size-4" />
                        60 minutes · en individuel
                    </p>
                    <p className="text-sm text-muted-foreground">
                        En visio sur Google Meet. Le lien sera fourni pour un
                        vrai rendez-vous ; aucun lien réel dans cette démo.
                    </p>
                    <p className="text-sm">
                        {slot
                            ? formatTrialDate(slot, timezone)
                            : 'Ton créneau apparaîtra ici.'}
                    </p>
                    <div className="flex items-baseline justify-between border-t border-border pt-4">
                        <span className="text-sm">Prix de la séance</span>
                        <span className="text-3xl font-semibold">39 €</span>
                    </div>
                    <p className="text-xs leading-relaxed text-muted-foreground">
                        Déduits de ton parcours si tu t’inscris sous 7 jours.
                        Aucun abonnement.
                    </p>
                </aside>
            </div>
        </BookingShell>
    );
}
