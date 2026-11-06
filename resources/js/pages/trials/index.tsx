import { Form, Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import {
    BookOpen,
    CalendarDays,
    CalendarPlus,
    MessageCircle,
    CheckCircle,
    Clock,
    CreditCard,
    Hourglass,
    VideoPlay,
    Notebook,
    Refresh,
    ShieldCheck,
    Video,
    type IconComponent,
} from 'reicon-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
import {
    Empty,
    EmptyContent,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
} from '@/components/ui/empty';
import { TrialInfoCard as InfoCard } from '@/components/trial-info-card';
import { Spinner } from '@/components/ui/spinner';
import { useUserTimezone } from '@/hooks/use-browser-timezone';
import { usePageRestore } from '@/hooks/use-page-restore';
import {
    formatReservationDate,
    postTrialRequest,
    reservationStatusBadgeVariant,
    reservationStatusLabels,
    TrialRequestError,
    type TrialReservation,
} from '@/lib/trial-reservations';
import { cn } from '@/lib/utils';
import { contact, courses } from '@/routes';
import { sales } from '@/routes/legal';
import { store } from '@/routes/trial-checkout';
import { create, index } from '@/routes/trial-reservations';
import { create as reschedule } from '@/routes/trial-reschedules';
import { store as cancelOwn } from '@/routes/trial-student-cancellations';

const statusBadgeVariant = reservationStatusBadgeVariant;

type Step = { icon: IconComponent; title: string; description: string };

const historyNotes: Partial<Record<TrialReservation['status'], string>> = {
    expired: 'Non payée, aucun montant débité.',
    refunded:
        'Le paiement n’a pas pu être conservé : remboursée intégralement.',
    cancelled: 'Annulée par le professeur : remboursée intégralement.',
};

export default function MyTrial({
    bookedTrial,
    pendingPayment,
    history,
    paymentReady,
    checkoutKey,
}: {
    bookedTrial: TrialReservation | null;
    pendingPayment: TrialReservation | null;
    history: TrialReservation[];
    paymentReady: boolean;
    checkoutKey: string;
}) {
    const timezone = useUserTimezone();
    const current = bookedTrial ?? pendingPayment;
    const sessionOver =
        current !== null &&
        (current.status === 'ended' ||
            current.status === 'completed' ||
            current.status === 'no_show');
    const inProgress =
        current?.status === 'confirmed' &&
        current.has_started &&
        !current.has_ended;
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState('');
    const refresh = () =>
        router.reload({
            data: { refresh: 1 },
            onFinish: () => setProcessing(false),
        });
    usePageRestore(() => {
        setProcessing(false);
        refresh();
    });

    async function checkout(reservation: TrialReservation) {
        setProcessing(true);
        setError('');
        try {
            const response = await postTrialRequest<{ checkout_url: string }>(
                store.url(reservation.id),
                checkoutKey,
                {},
            );
            window.location.assign(response.checkout_url);
        } catch (exception) {
            setError(
                exception instanceof TrialRequestError
                    ? exception.message
                    : 'Connexion interrompue. Réessaie depuis cette page, sans créer une autre réservation.',
            );
            router.reload({ onFinish: () => setProcessing(false) });
        }
    }
    const format = (value: string, options: Intl.DateTimeFormatOptions) =>
        new Intl.DateTimeFormat('fr-FR', {
            timeZone: timezone,
            ...options,
        }).format(new Date(value));

    return (
        <div className="flex h-full flex-1 flex-col gap-6 p-4">
            <Head title="Ma réservation d’essai" />
            <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                    <div className="flex flex-wrap items-center gap-3">
                        <h1 className="text-3xl font-semibold">
                            Ma réservation d’essai
                        </h1>
                        {current && (
                            <Badge variant={statusBadgeVariant[current.status]}>
                                {reservationStatusLabels[current.status]}
                            </Badge>
                        )}
                    </div>
                    <p className="mt-3 text-muted-foreground">
                        Retrouve ton cours d’essai et le suivi de ton paiement.
                    </p>
                </div>
                {pendingPayment && (
                    <div className="flex flex-wrap gap-2">
                        <Button asChild variant="ghost">
                            <Link href={create()}>
                                Choisir un autre créneau
                            </Link>
                        </Button>
                        {pendingPayment.can_checkout && (
                            <Button
                                onClick={() => checkout(pendingPayment)}
                                disabled={!paymentReady || processing}
                            >
                                {processing ? (
                                    <Spinner data-icon="inline-start" />
                                ) : (
                                    <CreditCard data-icon="inline-start" />
                                )}
                                {processing
                                    ? 'Ouverture de Stripe…'
                                    : 'Reprendre le paiement'}
                            </Button>
                        )}
                    </div>
                )}
                {current?.status === 'processing' && (
                    <Button
                        variant="outline"
                        disabled={processing}
                        onClick={() => {
                            setProcessing(true);
                            refresh();
                        }}
                    >
                        {processing ? (
                            <Spinner data-icon="inline-start" />
                        ) : (
                            <Refresh data-icon="inline-start" />
                        )}
                        Actualiser le statut
                    </Button>
                )}
                {current?.student_actions &&
                    !current.student_actions.rebook &&
                    (current.student_actions.reschedule ||
                        current.student_actions.cancel) && (
                        <div className="flex flex-wrap gap-2">
                            {current.student_actions.cancel && (
                                <StudentCancelDialog reservation={current} />
                            )}
                            {current.student_actions.reschedule && (
                                <Button asChild>
                                    <Link href={reschedule(current.id)}>
                                        <CalendarDays data-icon="inline-start" />
                                        Déplacer mon cours
                                    </Link>
                                </Button>
                            )}
                        </div>
                    )}
            </div>

            {current?.status === 'confirmed' && !current.has_ended && (
                <p className="text-sm text-muted-foreground">
                    {current.is_rebooked ? (
                        <>
                            Ce créneau t’a été offert après une absence : il ne
                            peut plus être déplacé ni remboursé. En cas
                            d’imprévu,{' '}
                            <Link
                                href={contact()}
                                className="font-medium text-primary underline underline-offset-4"
                            >
                                contacte-nous
                            </Link>
                            .
                        </>
                    ) : current.student_actions?.cancel ? (
                        <>
                            {current.student_actions.reschedule
                                ? 'Tu peux déplacer gratuitement ton cours (une fois) ou l’annuler avec remboursement intégral'
                                : 'Ton report gratuit est utilisé. Tu peux encore annuler avec remboursement intégral'}{' '}
                            jusqu’au{' '}
                            {format(current.change_deadline, {
                                dateStyle: 'long',
                                timeStyle: 'short',
                            })}
                            .
                        </>
                    ) : (
                        <>
                            Il est trop tard pour déplacer ou annuler ton cours
                            en ligne. En cas d’imprévu,{' '}
                            <Link
                                href={contact()}
                                className="font-medium text-primary underline underline-offset-4"
                            >
                                contacte-nous
                            </Link>
                            .
                        </>
                    )}{' '}
                    <Link
                        href={sales()}
                        className="underline underline-offset-4"
                    >
                        Voir les conditions
                    </Link>
                </p>
            )}

            {pendingPayment && !paymentReady && (
                <Alert>
                    <AlertDescription>
                        Le paiement n’est pas disponible pour le moment. Ton
                        créneau reste réservé jusqu’à la fin du délai.
                    </AlertDescription>
                </Alert>
            )}
            {error && (
                <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            {current ? (
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <InfoCard
                        icon={CalendarDays}
                        label="Jour"
                        value={format(current.starts_at, {
                            weekday: 'long',
                            day: 'numeric',
                            month: 'long',
                        })}
                        caption={format(current.starts_at, { year: 'numeric' })}
                    />
                    <InfoCard
                        icon={Clock}
                        label="Heure"
                        value={format(current.starts_at, {
                            timeStyle: 'short',
                        })}
                        caption={timezone}
                    />
                    <InfoCard
                        icon={Hourglass}
                        label="Durée"
                        value="60 min"
                        caption="Cours individuel en visio"
                    />
                    <InfoCard
                        icon={
                            current.status === 'pending' ||
                            current.status === 'processing' ||
                            current.status === 'payment_review'
                                ? CreditCard
                                : CheckCircle
                        }
                        label="Statut"
                        value={reservationStatusLabels[current.status]}
                        caption={
                            current.status === 'pending'
                                ? `Créneau réservé jusqu’à ${format(current.expires_at, { timeStyle: 'short' })}`
                                : current.status === 'no_show'
                                  ? 'Séance manquée'
                                  : current.status === 'ended'
                                    ? 'Bilan bientôt disponible'
                                    : sessionOver
                                      ? 'Merci pour ta présence'
                                      : inProgress
                                        ? 'Séance en cours'
                                        : current.status === 'confirmed'
                                          ? 'Paiement vérifié'
                                          : 'Ne règle pas une deuxième fois'
                        }
                    />
                </div>
            ) : (
                <Empty className="border">
                    <EmptyHeader>
                        <EmptyMedia variant="icon">
                            <CalendarPlus />
                        </EmptyMedia>
                        <EmptyTitle>Pas encore de cours d’essai</EmptyTitle>
                        <EmptyDescription>
                            Une heure en individuel pour faire le point sur ton
                            niveau et tes objectifs.
                        </EmptyDescription>
                    </EmptyHeader>
                    <EmptyContent>
                        <Button asChild>
                            <Link href={create()}>
                                Réserver mon cours d’essai
                            </Link>
                        </Button>
                    </EmptyContent>
                </Empty>
            )}

            {current && (
                <section className="mt-6 flex flex-col gap-12 pb-6">
                    <div className="mx-auto max-w-2xl text-center">
                        <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-border/40 bg-secondary px-4 py-2 text-xs font-semibold tracking-[0.25em] text-secondary-foreground uppercase">
                            {inProgress ? 'En ce moment' : 'La suite'}
                        </div>
                        <h2 className="mb-4 text-3xl font-semibold tracking-tight">
                            {current.status === 'no_show'
                                ? 'On s’est manqués'
                                : sessionOver
                                  ? 'Et maintenant ?'
                                  : inProgress
                                    ? 'Ta séance est en cours'
                                    : current.status === 'confirmed'
                                      ? 'Tout est prêt de ton côté'
                                      : current.status === 'pending'
                                        ? 'Plus qu’une étape'
                                        : 'On vérifie ton paiement'}
                        </h2>
                        <p className="text-foreground/60">
                            {sessionOver
                                ? 'Une question sur la suite ? '
                                : inProgress
                                  ? 'Ton professeur t’attend. Un souci pour te connecter ? '
                                  : 'Une question avant la séance ? '}
                            <Link
                                href={contact()}
                                className="font-medium text-primary underline underline-offset-4"
                            >
                                Contacte-nous
                            </Link>
                            .
                        </p>
                    </div>
                    {sessionOver ? (
                        <SessionOver reservation={current} />
                    ) : current.status === 'confirmed' ? (
                        <ConfirmedTimeline
                            meetingUrl={current.meeting_url ?? null}
                            inProgress={inProgress}
                        />
                    ) : (
                        <div className="grid gap-5 md:grid-cols-3">
                            {nextSteps(current, (value) =>
                                format(value, { timeStyle: 'short' }),
                            ).map((step, index) => (
                                <div
                                    key={step.title}
                                    className="flex flex-col items-center rounded-2xl border border-border/40 bg-background/70 p-5 text-center backdrop-blur-sm dark:border-border/50 dark:bg-background/40"
                                >
                                    <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                        <step.icon
                                            className="size-5"
                                            aria-hidden="true"
                                        />
                                    </span>
                                    <h3 className="mt-4 font-semibold text-foreground">
                                        {step.title}
                                    </h3>
                                    <p className="mt-1 font-mono text-xs text-foreground/50">
                                        Étape {index + 1}
                                    </p>
                                    <p className="mt-3 text-sm leading-relaxed text-foreground/60">
                                        {step.description}
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            )}

            {history.length > 0 && (
                <section className="flex flex-col rounded-lg border border-border">
                    <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-4">
                        <h2 className="font-semibold">Historique</h2>
                        <Badge variant="outline">{history.length}</Badge>
                    </div>
                    <ul className="flex flex-col divide-y divide-border">
                        {history.map((reservation) => (
                            <li
                                key={reservation.id}
                                className="flex flex-wrap items-center justify-between gap-3 px-5 py-3 text-sm"
                            >
                                <span className="flex flex-col">
                                    {formatReservationDate(
                                        reservation.starts_at,
                                        timezone,
                                    )}
                                    {reservation.status === 'cancelled' &&
                                    reservation.cancelled_by === 'student' ? (
                                        <span className="text-muted-foreground">
                                            Annulée par toi : remboursée
                                            intégralement.
                                        </span>
                                    ) : (
                                        <>
                                            {historyNotes[
                                                reservation.status
                                            ] && (
                                                <span className="text-muted-foreground">
                                                    {
                                                        historyNotes[
                                                            reservation.status
                                                        ]
                                                    }
                                                </span>
                                            )}
                                            {reservation.cancellation_reason && (
                                                <span className="text-muted-foreground">
                                                    Motif :{' '}
                                                    {
                                                        reservation.cancellation_reason
                                                    }
                                                </span>
                                            )}
                                        </>
                                    )}
                                </span>
                                <Badge
                                    variant={
                                        statusBadgeVariant[reservation.status]
                                    }
                                >
                                    {
                                        reservationStatusLabels[
                                            reservation.status
                                        ]
                                    }
                                </Badge>
                            </li>
                        ))}
                    </ul>
                </section>
            )}
        </div>
    );
}

const timelineCard =
    'flex flex-col items-center rounded-2xl border border-border/40 bg-background/70 p-5 text-center backdrop-blur-sm md:flex-1 dark:border-border/50 dark:bg-background/40';

function TimelineConnector() {
    return (
        <div
            aria-hidden="true"
            className="mx-auto h-6 w-px bg-border md:mx-0 md:mt-10 md:h-px md:w-10 md:shrink-0 md:self-start"
        />
    );
}

function StepIcon({
    icon: Icon,
    pulse = false,
}: {
    icon: IconComponent;
    pulse?: boolean;
}) {
    return (
        <span className="relative flex size-10 items-center justify-center">
            {pulse && (
                <>
                    <span
                        aria-hidden="true"
                        className="absolute inset-0 animate-ping rounded-xl bg-primary/30 motion-reduce:animate-none"
                    />
                    <span
                        aria-hidden="true"
                        className="absolute -inset-1.5 rounded-2xl bg-primary/10 blur-sm"
                    />
                </>
            )}
            <span className="relative flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Icon className="size-5" aria-hidden="true" />
            </span>
        </span>
    );
}

/**
 * Once paid: the payment, the visio link, then joining the session.
 * The join step only pulses and offers its button once a visio link exists.
 */
function ConfirmedTimeline({
    meetingUrl,
    inProgress,
}: {
    meetingUrl: string | null;
    inProgress: boolean;
}) {
    return (
        <ol className="flex flex-col md:flex-row md:items-stretch">
            <li className={timelineCard}>
                <StepIcon icon={CheckCircle} />
                <h3 className="mt-4 font-semibold text-foreground">
                    Paiement effectué
                </h3>
                <p className="mt-1 font-mono text-xs text-foreground/50">
                    Étape 1
                </p>
                <p className="mt-3 text-sm leading-relaxed text-foreground/60">
                    Ton créneau est réservé à ton nom. Aucun autre paiement
                    n’est nécessaire.
                </p>
            </li>

            <TimelineConnector />

            <li
                aria-disabled={meetingUrl === null}
                className={cn(
                    timelineCard,
                    meetingUrl === null && 'opacity-55 grayscale select-none',
                )}
            >
                <StepIcon icon={Video} />
                <h3 className="mt-4 font-semibold text-foreground">
                    Lien de la visio
                </h3>
                <p className="mt-1 font-mono text-xs text-foreground/50">
                    Étape 2
                </p>
                <p className="mt-3 text-sm leading-relaxed text-foreground/60">
                    {meetingUrl
                        ? 'Le professeur a communiqué le lien de la séance.'
                        : 'Le professeur te communiquera les modalités de connexion avant la séance.'}
                </p>
            </li>

            <TimelineConnector />

            <li
                aria-disabled={meetingUrl === null}
                className={cn(
                    timelineCard,
                    meetingUrl === null && 'opacity-55 grayscale select-none',
                )}
            >
                <StepIcon icon={VideoPlay} pulse={meetingUrl !== null} />
                <h3 className="mt-4 font-semibold text-foreground">
                    Rejoindre la séance
                </h3>
                <p className="mt-1 font-mono text-xs text-foreground/50">
                    Étape 3
                </p>
                <p className="mt-3 text-sm leading-relaxed text-foreground/60">
                    {meetingUrl && inProgress
                        ? 'Ta séance a commencé : rejoins-la maintenant.'
                        : meetingUrl
                          ? 'Le lien est prêt : rejoins la visio à l’heure du cours.'
                          : 'Tu pourras rejoindre la séance ici dès que le lien sera disponible.'}
                </p>
                {meetingUrl && (
                    <Button asChild className="mt-4">
                        <a
                            href={meetingUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            Rejoindre la séance
                        </a>
                    </Button>
                )}
            </li>
        </ol>
    );
}

/** After the session (or a missed one): what the student can do next. */
function SessionOver({ reservation }: { reservation: TrialReservation }) {
    const noShow = reservation.status === 'no_show';

    return (
        <div className="flex flex-col gap-5">
            {reservation.session_summary && (
                <div className="rounded-2xl border border-primary/15 bg-primary/[0.05] p-6 dark:bg-primary/[0.07]">
                    <p className="text-xs font-semibold tracking-[0.25em] text-primary uppercase">
                        Le bilan de ton professeur
                    </p>
                    <p className="mt-3 leading-relaxed break-words whitespace-pre-line text-foreground/80">
                        {reservation.session_summary}
                    </p>
                </div>
            )}
            {reservation.student_actions?.rebook && (
                <div className="flex flex-col items-start gap-3 rounded-2xl border border-primary/15 bg-primary/[0.05] p-6 sm:flex-row sm:items-center sm:justify-between dark:bg-primary/[0.07]">
                    <p className="text-foreground/80">
                        Ton professeur t’offre un nouveau créneau, sans frais
                        {reservation.rebook_offer_expires_at &&
                            `, à choisir avant le ${new Intl.DateTimeFormat(
                                'fr-FR',
                                { dateStyle: 'long' },
                            ).format(
                                new Date(reservation.rebook_offer_expires_at),
                            )}`}
                        . Il ne pourra plus être déplacé ni remboursé.
                    </p>
                    <Button asChild>
                        <Link href={reschedule(reservation.id)}>
                            Choisir mon nouveau créneau
                        </Link>
                    </Button>
                </div>
            )}
            <div className="grid gap-5 md:grid-cols-2">
                <div className={timelineCard}>
                    <StepIcon icon={noShow ? MessageCircle : BookOpen} />
                    <h3 className="mt-4 font-semibold text-foreground">
                        {noShow
                            ? 'Tu n’as pas pu venir ?'
                            : 'Continue sur ta lancée'}
                    </h3>
                    <p className="mt-3 text-sm leading-relaxed text-foreground/60">
                        {noShow
                            ? 'Écris-nous : nous verrons ensemble comment reprogrammer un échange.'
                            : 'Découvre les parcours pour progresser régulièrement, en individuel ou en groupe.'}
                    </p>
                    <Button
                        asChild
                        className="mt-4"
                        variant={noShow ? 'default' : 'outline'}
                    >
                        <Link href={noShow ? contact() : courses()}>
                            {noShow
                                ? 'Nous contacter'
                                : 'Découvrir les parcours'}
                        </Link>
                    </Button>
                </div>
                <div className={timelineCard}>
                    <StepIcon icon={noShow ? BookOpen : MessageCircle} />
                    <h3 className="mt-4 font-semibold text-foreground">
                        {noShow ? 'Découvre les parcours' : 'Une question ?'}
                    </h3>
                    <p className="mt-3 text-sm leading-relaxed text-foreground/60">
                        {noShow
                            ? 'Des cours réguliers, en individuel ou en groupe, pour avancer à ton rythme.'
                            : 'Un doute sur ton niveau ou sur le parcours qui te convient ? Nous te répondons rapidement.'}
                    </p>
                    <Button asChild className="mt-4" variant="outline">
                        <Link href={noShow ? courses() : contact()}>
                            {noShow ? 'Voir les parcours' : 'Nous contacter'}
                        </Link>
                    </Button>
                </div>
            </div>
        </div>
    );
}

/** The student cancels their own paid session before the deadline; the refund is full and automatic. */
function StudentCancelDialog({
    reservation,
}: {
    reservation: TrialReservation;
}) {
    const [open, setOpen] = useState(false);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost">Annuler</Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Annuler ton cours d’essai ?</DialogTitle>
                    <DialogDescription>
                        Tu seras remboursé intégralement, sous quelques jours
                        selon ta banque, et le créneau sera libéré. Tu pourras
                        réserver un nouveau cours d’essai plus tard.
                        {reservation.student_actions?.reschedule &&
                            ' Tu peux aussi simplement le déplacer gratuitement.'}
                    </DialogDescription>
                </DialogHeader>
                <Form
                    {...cancelOwn.form(reservation.id)}
                    onSuccess={() => setOpen(false)}
                >
                    {({ processing, errors }) => (
                        <div className="flex flex-col gap-4">
                            {errors.cancellation && (
                                <Alert variant="destructive">
                                    <AlertDescription>
                                        {errors.cancellation}
                                    </AlertDescription>
                                </Alert>
                            )}
                            <DialogFooter>
                                <DialogClose asChild>
                                    <Button type="button" variant="ghost">
                                        Garder mon cours
                                    </Button>
                                </DialogClose>
                                <Button
                                    type="submit"
                                    variant="destructive"
                                    disabled={processing}
                                >
                                    {processing && (
                                        <Spinner data-icon="inline-start" />
                                    )}
                                    Annuler et être remboursé
                                </Button>
                            </DialogFooter>
                        </div>
                    )}
                </Form>
            </DialogContent>
        </Dialog>
    );
}

function nextSteps(
    reservation: TrialReservation,
    formatTime: (value: string) => string,
): Step[] {
    const visio: Step = {
        icon: Video,
        title: 'Le lien de la visio',
        description:
            'Le professeur te communiquera les modalités de connexion avant la séance.',
    };
    const prepare: Step = {
        icon: Notebook,
        title: 'Prépare ta séance',
        description: `Garde ton objectif en tête : « ${reservation.goal} ». La séance partira de là.`,
    };

    if (reservation.status === 'pending') {
        return [
            {
                icon: CreditCard,
                title: 'Finalise le paiement',
                description: `Ton créneau t’attend jusqu’à ${formatTime(reservation.expires_at)}. Passé ce délai, il sera proposé à d’autres élèves.`,
            },
            {
                icon: ShieldCheck,
                title: 'Confirmation automatique',
                description:
                    'Ta réservation est confirmée dès que le paiement est vérifié, sans autre démarche.',
            },
            visio,
        ];
    }

    return [
        {
            icon: ShieldCheck,
            title: 'Vérification en cours',
            description:
                'Ton paiement est en cours de vérification. Ne règle pas une deuxième fois : ce statut se met à jour automatiquement.',
        },
        visio,
        prepare,
    ];
}

MyTrial.layout = {
    breadcrumbs: [{ title: 'Ma réservation d’essai', href: index() }],
};
