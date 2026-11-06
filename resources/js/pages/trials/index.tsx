import { Head, Link } from '@inertiajs/react';
import {
    CalendarDays,
    CalendarPlus,
    ChevronRight,
    CheckCircle,
    Clock,
    CreditCard,
    Hourglass,
    VideoPlay,
    Notebook,
    ShieldCheck,
    Video,
    type IconComponent,
} from 'reicon-react';
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
import { useUserTimezone } from '@/hooks/use-browser-timezone';
import {
    formatReservationDate,
    reservationStatusLabels,
    type TrialReservation,
} from '@/lib/trial-reservations';
import { cn } from '@/lib/utils';
import { contact } from '@/routes';
import { create, index, show } from '@/routes/trial-reservations';

const statusBadgeVariant: Record<
    TrialReservation['status'],
    'default' | 'secondary' | 'outline'
> = {
    confirmed: 'default',
    pending: 'secondary',
    processing: 'secondary',
    payment_review: 'secondary',
    expired: 'outline',
    refunded: 'outline',
};

type Step = { icon: IconComponent; title: string; description: string };

export default function MyTrial({
    bookedTrial,
    pendingPayment,
    history,
}: {
    bookedTrial: TrialReservation | null;
    pendingPayment: TrialReservation | null;
    history: TrialReservation[];
}) {
    const timezone = useUserTimezone();
    const current = bookedTrial ?? pendingPayment;
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
                        <Button asChild>
                            <Link href={show(pendingPayment.id)}>
                                <CreditCard data-icon="inline-start" />
                                Reprendre le paiement
                            </Link>
                        </Button>
                    </div>
                )}
            </div>

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
                            current.status === 'confirmed'
                                ? CheckCircle
                                : CreditCard
                        }
                        label="Statut"
                        value={reservationStatusLabels[current.status]}
                        caption={
                            current.status === 'pending'
                                ? `Créneau réservé jusqu’à ${format(current.expires_at, { timeStyle: 'short' })}`
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

            {history.length > 0 && (
                <section className="flex flex-col rounded-lg border border-border">
                    <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-4">
                        <h2 className="font-semibold">Historique</h2>
                        <Badge variant="outline">{history.length}</Badge>
                    </div>
                    <ul className="flex flex-col divide-y divide-border">
                        {history.map((reservation) => (
                            <li key={reservation.id}>
                                <Link
                                    href={show(reservation.id)}
                                    className="flex items-center justify-between gap-3 px-5 py-3 text-sm transition-colors hover:bg-muted/30"
                                >
                                    <span>
                                        {formatReservationDate(
                                            reservation.starts_at,
                                            timezone,
                                        )}
                                    </span>
                                    <span className="flex items-center gap-2">
                                        <Badge
                                            variant={
                                                statusBadgeVariant[
                                                    reservation.status
                                                ]
                                            }
                                        >
                                            {
                                                reservationStatusLabels[
                                                    reservation.status
                                                ]
                                            }
                                        </Badge>
                                        <ChevronRight
                                            className="size-4 text-muted-foreground"
                                            aria-hidden="true"
                                        />
                                    </span>
                                </Link>
                            </li>
                        ))}
                    </ul>
                </section>
            )}

            {current && (
                <section className="mt-6 flex flex-col gap-12 pb-6">
                    <div className="mx-auto max-w-2xl text-center">
                        <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-border/40 bg-secondary px-4 py-2 text-xs font-semibold tracking-[0.25em] text-secondary-foreground uppercase">
                            La suite
                        </div>
                        <h2 className="mb-4 text-3xl font-semibold tracking-tight">
                            {current.status === 'confirmed'
                                ? 'Tout est prêt de ton côté'
                                : current.status === 'pending'
                                  ? 'Plus qu’une étape'
                                  : 'On vérifie ton paiement'}
                        </h2>
                        <p className="text-foreground/60">
                            Une question avant la séance ?{' '}
                            <Link
                                href={contact()}
                                className="font-medium text-primary underline underline-offset-4"
                            >
                                Contacte-nous
                            </Link>
                            .
                        </p>
                    </div>
                    {current.status === 'confirmed' ? (
                        <ConfirmedTimeline
                            meetingUrl={current.meeting_url ?? null}
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
function ConfirmedTimeline({ meetingUrl }: { meetingUrl: string | null }) {
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
                    {meetingUrl
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

function InfoCard({
    icon: Icon,
    label,
    value,
    caption,
}: {
    icon: IconComponent;
    label: string;
    value: string;
    caption: string;
}) {
    return (
        <div className="rounded-lg border border-border p-5">
            <div className="flex items-center justify-between gap-3">
                <p className="text-sm text-muted-foreground">{label}</p>
                <Icon
                    className="size-5 text-muted-foreground"
                    aria-hidden="true"
                />
            </div>
            <p className="mt-3 text-2xl font-semibold first-letter:uppercase">
                {value}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">{caption}</p>
        </div>
    );
}

MyTrial.layout = {
    breadcrumbs: [{ title: 'Ma réservation d’essai', href: index() }],
};
