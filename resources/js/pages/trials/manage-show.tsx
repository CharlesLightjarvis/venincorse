import { Form, Head, setLayoutProps } from '@inertiajs/react';
import { useState } from 'react';
import {
    CalendarDays,
    CalendarRemove,
    CheckCircle,
    Clock,
    CreditCard,
    Hourglass,
    Video,
    Warning,
} from 'reicon-react';
import { TrialInfoCard } from '@/components/trial-info-card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { Textarea } from '@/components/ui/textarea';
import { useUserTimezone } from '@/hooks/use-browser-timezone';
import { useInitials } from '@/hooks/use-initials';
import {
    formatReservationPrice,
    reservationStatusBadgeVariant,
    reservationStatusLabels,
    type TrialReservation,
} from '@/lib/trial-reservations';
import { cn } from '@/lib/utils';
import { store as storeCancellation } from '@/routes/trial-cancellations';
import { index, show, update } from '@/routes/trial-management';
import { update as updateOutcome } from '@/routes/trial-outcomes';
import { store as storeRebookOffer } from '@/routes/trial-rebook-offers';
import { update as updatePaymentReview } from '@/routes/trial-payment-reviews';

export default function ManageTrial({
    reservation,
}: {
    reservation: TrialReservation;
}) {
    const timezone = useUserTimezone();
    const getInitials = useInitials();
    const name = reservation.student?.name ?? '';
    const format = (value: string, options: Intl.DateTimeFormatOptions) =>
        new Intl.DateTimeFormat('fr-FR', {
            timeZone: timezone,
            ...options,
        }).format(new Date(value));
    const price = formatReservationPrice(
        reservation.amount_cents,
        reservation.currency,
    );
    const copy = describe(reservation);
    setLayoutProps({
        breadcrumbs: [
            { title: 'Gestion des essais', href: index() },
            { title: name || 'Essai', href: show(reservation.id) },
        ],
    });

    return (
        <div className="flex h-full flex-1 flex-col gap-6 p-4">
            <Head title={`Essai de ${name}`} />
            <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                    <div className="flex flex-wrap items-center gap-3">
                        <h1 className="text-3xl font-semibold">
                            Essai de {name}
                        </h1>
                        <Badge
                            variant={
                                reservationStatusBadgeVariant[
                                    reservation.status
                                ]
                            }
                        >
                            {reservationStatusLabels[reservation.status]}
                        </Badge>
                    </div>
                    <p className="mt-3 text-muted-foreground">
                        {copy.subtitle}
                    </p>
                </div>
                <div className="flex flex-wrap gap-2">
                    {reservation.actions?.cancel && (
                        <CancelDialog reservation={reservation} />
                    )}
                    {reservation.actions?.edit_meeting_link &&
                        reservation.meeting_url && (
                            <Button asChild>
                                <a
                                    href={reservation.meeting_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <Video data-icon="inline-start" />
                                    Ouvrir la visio
                                </a>
                            </Button>
                        )}
                </div>
            </div>

            {reservation.actions?.resolve_review && (
                <PaymentReviewPanel reservation={reservation} />
            )}
            {reservation.actions?.record_outcome && (
                <OutcomePanel reservation={reservation} />
            )}
            {reservation.actions?.offer_rebook && (
                <RebookOfferPanel reservation={reservation} />
            )}
            {reservation.status === 'completed' &&
                reservation.session_summary && (
                    <div className="rounded-lg border border-border p-5">
                        <p className="text-sm text-muted-foreground">
                            Bilan envoyé à l’élève
                        </p>
                        <p className="mt-2 break-words whitespace-pre-line">
                            {reservation.session_summary}
                        </p>
                    </div>
                )}

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <TrialInfoCard
                    icon={CalendarDays}
                    label="Jour"
                    value={format(reservation.starts_at, {
                        weekday: 'long',
                        day: 'numeric',
                        month: 'long',
                    })}
                    caption={format(reservation.starts_at, { year: 'numeric' })}
                />
                <TrialInfoCard
                    icon={Clock}
                    label="Heure"
                    value={format(reservation.starts_at, {
                        timeStyle: 'short',
                    })}
                    caption={timezone}
                />
                <TrialInfoCard
                    icon={Hourglass}
                    label="Durée"
                    value="60 min"
                    caption="Cours individuel en visio"
                />
                <TrialInfoCard
                    icon={
                        reservation.paid_at &&
                        ['confirmed', 'ended', 'completed', 'no_show'].includes(
                            reservation.status,
                        )
                            ? CheckCircle
                            : CreditCard
                    }
                    label="Statut"
                    value={reservationStatusLabels[reservation.status]}
                    caption={
                        reservation.status === 'pending'
                            ? `Créneau réservé jusqu’à ${format(reservation.expires_at, { timeStyle: 'short' })}`
                            : [
                                    'confirmed',
                                    'ended',
                                    'completed',
                                    'no_show',
                                ].includes(reservation.status)
                              ? reservation.status === 'confirmed' &&
                                reservation.has_started
                                  ? `Séance en cours · ${price}`
                                  : `Payé · ${price}`
                              : price
                    }
                />
            </div>

            <section className="mt-6 flex flex-col gap-12 pb-6">
                <div className="mx-auto max-w-2xl text-center">
                    <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-border/40 bg-secondary px-4 py-2 text-xs font-semibold tracking-[0.25em] text-secondary-foreground uppercase">
                        {copy.pill}
                    </div>
                    <h2 className="mb-4 text-3xl font-semibold tracking-tight">
                        {copy.title}
                    </h2>
                    <p className="text-foreground/60">{copy.text}</p>
                </div>

                <div className="grid gap-8 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)]">
                    <div className="flex flex-col items-center self-start rounded-2xl border border-border/40 bg-background/70 p-6 text-center dark:border-border/50 dark:bg-background/40">
                        <Avatar className="size-16">
                            <AvatarFallback className="text-lg">
                                {getInitials(name)}
                            </AvatarFallback>
                        </Avatar>
                        <h3 className="mt-4 font-semibold">{name}</h3>
                        <p className="mt-1 text-sm break-all text-muted-foreground">
                            {reservation.student?.email}
                        </p>
                        <StudentGoal goal={reservation.goal} />
                    </div>

                    <PreparationForm reservation={reservation} />
                </div>
            </section>
        </div>
    );
}

/** Long goals are clamped to three lines and can be unfolded, so the card keeps its shape. */
function StudentGoal({ goal }: { goal: string }) {
    const [expanded, setExpanded] = useState(false);
    const isLong = goal.length > 120 || goal.split('\n').length > 3;

    return (
        <div className="mt-2 flex w-full flex-col items-center gap-1">
            <p
                className={cn(
                    'text-sm break-words whitespace-pre-line text-muted-foreground',
                    isLong && !expanded && 'line-clamp-3',
                )}
            >
                <span className="font-semibold text-foreground">
                    Objectif :
                </span>{' '}
                {goal}
            </p>
            {isLong && (
                <Button
                    type="button"
                    variant="link"
                    size="sm"
                    className="h-auto p-0"
                    aria-expanded={expanded}
                    onClick={() => setExpanded(!expanded)}
                >
                    {expanded ? 'Voir moins' : 'Voir plus'}
                </Button>
            )}
        </div>
    );
}

/** What the page says about the trial, depending on where it stands. */
function describe(reservation: TrialReservation): {
    subtitle: string;
    pill: string;
    title: string;
    text: string;
} {
    switch (reservation.status) {
        case 'completed':
            return {
                subtitle:
                    'Séance réalisée. Garde une trace de ce qui a été vu.',
                pill: 'Suivi',
                title: 'Séance réalisée',
                text: 'Note le niveau constaté et la suite conseillée : ces notes restent privées.',
            };
        case 'no_show':
            return {
                subtitle: 'L’élève ne s’est pas présenté.',
                pill: 'Suivi',
                title: 'Élève absent',
                text: reservation.rebook_offered
                    ? 'Un nouveau créneau a été offert : l’élève le choisira lui-même.'
                    : 'La séance est restée payée. Note ici les échanges éventuels avec l’élève.',
            };
        case 'cancelled':
            if (reservation.cancelled_by === 'student') {
                return {
                    subtitle:
                        'L’élève a annulé dans les délais. Il a été remboursé automatiquement.',
                    pill: 'Suivi',
                    title: 'Annulée par l’élève',
                    text: 'Le créneau est de nouveau libre. L’élève peut réserver un nouveau cours d’essai.',
                };
            }

            return {
                subtitle:
                    'Tu as annulé cette séance. L’élève a été remboursé et prévenu.',
                pill: 'Suivi',
                title: 'Séance annulée',
                text: reservation.cancellation_reason
                    ? `Motif communiqué à l’élève : « ${reservation.cancellation_reason} »`
                    : 'L’élève a été remboursé intégralement.',
            };
        case 'refunded':
            return {
                subtitle:
                    'Cet essai n’aura pas lieu. Tu peux encore y consigner des notes privées.',
                pill: 'Suivi',
                title: 'Essai remboursé',
                text: 'Le paiement n’a pas pu être conservé et a été remboursé intégralement. L’élève a été prévenu.',
            };
        case 'expired':
            return {
                subtitle:
                    'Cet essai n’aura pas lieu. Tu peux encore y consigner des notes privées.',
                pill: 'Suivi',
                title: 'Essai expiré',
                text: 'L’élève n’a pas payé dans le délai : le créneau a été libéré. Aucun lien de visio n’est nécessaire.',
            };
        case 'payment_review':
            return {
                subtitle:
                    'Le paiement demande une vérification avant de confirmer la séance.',
                pill: 'Vérification',
                title: 'Paiement à vérifier',
                text: reservation.paid_at
                    ? 'Confirme la séance si le créneau est encore libre, sinon rembourse l’élève.'
                    : 'Libère le créneau si rien n’a été débité, sinon rembourse l’élève.',
            };
        case 'ended':
        case 'confirmed':
            if (reservation.status === 'ended' || reservation.has_ended) {
                return {
                    subtitle:
                        'La séance est terminée : indique si elle a eu lieu.',
                    pill: 'Suivi',
                    title: 'Séance terminée',
                    text: 'Le lien de la visio n’est plus modifiable. Tes notes privées restent éditables.',
                };
            }
            if (reservation.has_started) {
                return {
                    subtitle: reservation.meeting_url
                        ? 'La séance est en cours. L’élève a le lien dans son espace.'
                        : 'La séance a commencé mais aucun lien de visio n’a été envoyé.',
                    pill: 'En ce moment',
                    title: 'Séance en cours',
                    text: 'Tu peux la clôturer dès maintenant si elle s’est terminée plus tôt.',
                };
            }

            return {
                subtitle: reservation.is_rebooked
                    ? 'Nouveau créneau choisi après une absence : ajoute le lien de la visio.'
                    : 'Prépare la séance : ajoute le lien de la visio et tes notes privées.',
                pill: 'Préparation',
                title: reservation.meeting_url
                    ? 'La séance est prête'
                    : 'Prépare la séance',
                text: 'L’élève reçoit le lien par email et dans son espace dès que tu l’enregistres.',
            };
        default:
            if (!reservation.is_active) {
                return describe({ ...reservation, status: 'expired' });
            }

            return {
                subtitle:
                    'Prépare la séance : ajoute le lien de la visio et tes notes privées.',
                pill: 'Préparation',
                title: 'Prépare la séance',
                text: 'Le lien sera visible par l’élève une fois son paiement confirmé.',
            };
    }
}

function CancelDialog({ reservation }: { reservation: TrialReservation }) {
    const [open, setOpen] = useState(false);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline">
                    <CalendarRemove data-icon="inline-start" />
                    Annuler la séance
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Annuler la séance ?</DialogTitle>
                    <DialogDescription>
                        L’élève est remboursé intégralement par Stripe, prévenu
                        par email, et le créneau redevient libre. Cette action
                        est définitive.
                    </DialogDescription>
                </DialogHeader>
                <Form
                    {...storeCancellation.form(reservation.id)}
                    options={{ preserveScroll: true }}
                    onSuccess={() => setOpen(false)}
                    className="flex flex-col gap-4"
                >
                    {({ processing, errors }) => (
                        <>
                            <div className="flex flex-col gap-2">
                                <Label htmlFor="reason">
                                    Motif communiqué à l’élève
                                </Label>
                                <Textarea
                                    id="reason"
                                    name="reason"
                                    required
                                    minLength={5}
                                    maxLength={500}
                                    rows={3}
                                    placeholder="Ex. : je suis malade, désolé pour ce contretemps."
                                    aria-invalid={
                                        errors.reason ? true : undefined
                                    }
                                />
                                {errors.reason && (
                                    <p
                                        role="alert"
                                        className="text-sm text-destructive"
                                    >
                                        {errors.reason}
                                    </p>
                                )}
                            </div>
                            <DialogFooter>
                                <DialogClose asChild>
                                    <Button type="button" variant="ghost">
                                        Garder la séance
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
                                    Annuler et rembourser
                                </Button>
                            </DialogFooter>
                        </>
                    )}
                </Form>
            </DialogContent>
        </Dialog>
    );
}

function PaymentReviewPanel({
    reservation,
}: {
    reservation: TrialReservation;
}) {
    return (
        <Alert variant="destructive">
            <Warning aria-hidden="true" />
            <AlertTitle>Paiement à vérifier</AlertTitle>
            <AlertDescription>
                <p>
                    {reservation.paid_at
                        ? 'Le paiement a été reçu mais la séance n’a pas pu être confirmée automatiquement (créneau déjà pris ou trop proche, ou remboursement échoué). Vérifie dans Stripe si besoin, puis décide.'
                        : 'Aucun paiement n’est enregistré pour cet essai : l’élève a quitté le paiement, ou le montant reçu ne correspond pas au prix. Vérifie dans Stripe : libère le créneau si rien n’a été débité, sinon rembourse l’élève.'}
                </p>
                <Form
                    {...updatePaymentReview.form(reservation.id)}
                    options={{ preserveScroll: true }}
                    className="mt-3 flex flex-col gap-2"
                >
                    {({ processing, errors }) => (
                        <>
                            <div className="flex flex-wrap gap-2">
                                {reservation.actions?.confirm_review && (
                                    <Button
                                        type="submit"
                                        name="decision"
                                        value="confirm"
                                        size="sm"
                                        disabled={processing}
                                    >
                                        Confirmer la séance
                                    </Button>
                                )}
                                {reservation.actions?.release_review && (
                                    <Button
                                        type="submit"
                                        name="decision"
                                        value="release"
                                        size="sm"
                                        disabled={processing}
                                    >
                                        Libérer le créneau (rien n’a été débité)
                                    </Button>
                                )}
                                <Button
                                    type="submit"
                                    name="decision"
                                    value="refund"
                                    size="sm"
                                    variant="outline"
                                    disabled={processing}
                                >
                                    Rembourser l’élève
                                </Button>
                            </div>
                            {errors.decision && (
                                <p role="alert" className="text-sm">
                                    {errors.decision}
                                </p>
                            )}
                        </>
                    )}
                </Form>
            </AlertDescription>
        </Alert>
    );
}

function OutcomePanel({ reservation }: { reservation: TrialReservation }) {
    return (
        <Alert>
            <CheckCircle aria-hidden="true" />
            <AlertTitle>
                {reservation.status === 'confirmed'
                    ? 'Séance terminée plus tôt ?'
                    : 'La séance a-t-elle eu lieu ?'}
            </AlertTitle>
            <AlertDescription>
                <p>
                    L’élève reçoit un email : ton bilan si la séance a eu lieu,
                    un message bienveillant s’il était absent.
                </p>
                <Form
                    {...updateOutcome.form(reservation.id)}
                    options={{ preserveScroll: true }}
                    className="mt-3 flex w-full flex-col gap-3"
                >
                    {({ processing, errors }) => (
                        <>
                            <div className="flex flex-col gap-2">
                                <Label
                                    htmlFor="summary"
                                    className="text-foreground"
                                >
                                    Bilan pour l’élève (facultatif, envoyé
                                    seulement si la séance a eu lieu)
                                </Label>
                                <Textarea
                                    id="summary"
                                    name="summary"
                                    maxLength={2000}
                                    rows={4}
                                    placeholder="Niveau constaté, points forts, ce qu’il faut travailler, le parcours conseillé…"
                                    aria-invalid={
                                        errors.summary ? true : undefined
                                    }
                                    className="bg-background"
                                />
                                {errors.summary && (
                                    <p
                                        role="alert"
                                        className="text-sm text-destructive"
                                    >
                                        {errors.summary}
                                    </p>
                                )}
                            </div>
                            <div className="flex flex-wrap gap-2">
                                <Button
                                    type="submit"
                                    name="outcome"
                                    value="completed"
                                    size="sm"
                                    disabled={processing}
                                >
                                    Oui, séance réalisée
                                </Button>
                                <Button
                                    type="submit"
                                    name="outcome"
                                    value="no_show"
                                    size="sm"
                                    variant="outline"
                                    disabled={processing}
                                >
                                    L’élève était absent
                                </Button>
                            </div>
                            {errors.outcome && (
                                <p
                                    role="alert"
                                    className="text-sm text-destructive"
                                >
                                    {errors.outcome}
                                </p>
                            )}
                        </>
                    )}
                </Form>
            </AlertDescription>
        </Alert>
    );
}

function RebookOfferPanel({ reservation }: { reservation: TrialReservation }) {
    return (
        <Alert>
            <CalendarDays aria-hidden="true" />
            <AlertTitle>Offrir un nouveau créneau ?</AlertTitle>
            <AlertDescription>
                <p>
                    Une absence n’est pas remboursée. En cas d’empêchement
                    sérieux, tu peux offrir à l’élève un nouveau créneau, sans
                    frais : il le choisira lui-même parmi les créneaux libres.
                </p>
                <Form
                    {...storeRebookOffer.form(reservation.id)}
                    options={{ preserveScroll: true }}
                    className="mt-3 flex flex-col gap-2"
                >
                    {({ processing, errors }) => (
                        <>
                            <Button
                                type="submit"
                                size="sm"
                                variant="outline"
                                disabled={processing}
                                className="self-start"
                            >
                                {processing && (
                                    <Spinner data-icon="inline-start" />
                                )}
                                Offrir un nouveau créneau
                            </Button>
                            {errors.rebook && (
                                <p
                                    role="alert"
                                    className="text-sm text-destructive"
                                >
                                    {errors.rebook}
                                </p>
                            )}
                        </>
                    )}
                </Form>
            </AlertDescription>
        </Alert>
    );
}

function PreparationForm({ reservation }: { reservation: TrialReservation }) {
    const editable = reservation.actions?.edit_meeting_link ?? false;

    return (
        <Form
            {...update.form(reservation.id)}
            options={{ preserveScroll: true }}
            className="flex flex-col gap-6"
        >
            {({ processing, errors }) => (
                <>
                    <div className="flex flex-col gap-2">
                        <Label htmlFor="meeting_url">Lien de la visio</Label>
                        <Input
                            id="meeting_url"
                            name="meeting_url"
                            type="url"
                            inputMode="url"
                            placeholder={
                                editable
                                    ? 'https://meet.google.com/…'
                                    : 'Aucun lien'
                            }
                            defaultValue={reservation.meeting_url ?? ''}
                            maxLength={2048}
                            disabled={!editable}
                            aria-describedby="meeting_url_hint"
                            aria-invalid={errors.meeting_url ? true : undefined}
                        />
                        <p
                            id="meeting_url_hint"
                            className="text-xs text-muted-foreground"
                        >
                            {editable
                                ? 'Une adresse sécurisée (https://) : Google Meet, Zoom, Teams…'
                                : reservation.is_active
                                  ? 'Non modifiable : la séance est terminée.'
                                  : 'Non modifiable : cet essai n’aura pas lieu.'}
                        </p>
                        {errors.meeting_url && (
                            <p
                                role="alert"
                                className="text-sm text-destructive"
                            >
                                {errors.meeting_url}
                            </p>
                        )}
                    </div>
                    <div className="flex flex-col gap-2">
                        <Label htmlFor="notes">Notes privées</Label>
                        <Textarea
                            id="notes"
                            name="notes"
                            defaultValue={reservation.notes}
                            maxLength={5000}
                            rows={6}
                            placeholder="Niveau constaté, points à travailler, suite proposée… Visible uniquement par l’équipe."
                            aria-invalid={errors.notes ? true : undefined}
                        />
                        {errors.notes && (
                            <p
                                role="alert"
                                className="text-sm text-destructive"
                            >
                                {errors.notes}
                            </p>
                        )}
                    </div>
                    <div className="flex justify-end">
                        <Button type="submit" disabled={processing}>
                            {processing && <Spinner data-icon="inline-start" />}
                            Enregistrer
                        </Button>
                    </div>
                </>
            )}
        </Form>
    );
}

ManageTrial.layout = {
    breadcrumbs: [{ title: 'Gestion des essais', href: index() }],
};
