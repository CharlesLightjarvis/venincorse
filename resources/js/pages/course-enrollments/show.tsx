import { Head, Link, router, setLayoutProps } from '@inertiajs/react';
import { useState } from 'react';
import { CalendarDays, Clock, CreditCard, Users, Video } from 'reicon-react';
import { CoursePlanningCalendar } from '@/components/course-planning-calendar';
import { TrialInfoCard } from '@/components/trial-info-card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { useUserTimezone } from '@/hooks/use-browser-timezone';
import {
    describeRhythm,
    enrollmentStatusLabels,
    enrollmentStatusVariant,
    formatCoursePrice,
    type CourseEnrollment,
    type CourseInstallment,
} from '@/lib/course-cohorts';
import { checkout as installmentCheckout } from '@/routes/course-installments';
import { contact, courses } from '@/routes';
import { checkout, index, show } from '@/routes/course-enrollments';
import { sales } from '@/routes/legal';

export default function ShowCourseEnrollment({
    enrollment,
}: {
    enrollment: CourseEnrollment;
}) {
    const timezone = useUserTimezone();
    const [paying, setPaying] = useState(false);
    const cohort = enrollment.cohort;
    const format = (value: string, options: Intl.DateTimeFormatOptions) =>
        new Intl.DateTimeFormat('fr-FR', {
            timeZone: timezone,
            ...options,
        }).format(new Date(value));
    const sessions = cohort.sessions ?? [];
    const now = Date.now();
    const next = sessions.find(
        (session) =>
            new Date(session.starts_at).getTime() +
                session.duration_minutes * 60_000 >
            now,
    );
    const done = sessions.filter(
        (session) =>
            new Date(session.starts_at).getTime() +
                session.duration_minutes * 60_000 <=
            now,
    ).length;
    const confirmed = enrollment.status === 'confirmed';
    const withdrawalOpen =
        new Date(enrollment.withdrawal_ends_at).getTime() > now;
    // Each session can have its own link; the group's default link is the fallback.
    const nextMeetingUrl = next
        ? (next.meeting_url ?? enrollment.meeting_url ?? null)
        : null;
    const hasMeetingUrl =
        Boolean(enrollment.meeting_url) ||
        sessions.some((session) => Boolean(session.meeting_url));

    setLayoutProps({
        breadcrumbs: [
            { title: 'Mes parcours', href: index() },
            { title: cohort.level_label, href: show(enrollment.id) },
        ],
    });

    return (
        <div className="flex h-full flex-1 flex-col gap-6 p-4">
            <Head title={`Parcours ${cohort.level_label}`} />
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                    <div className="flex flex-wrap items-center gap-3">
                        <h1 className="text-3xl font-semibold">
                            {cohort.level_label}
                        </h1>
                        <Badge
                            variant={enrollmentStatusVariant[enrollment.status]}
                        >
                            {enrollmentStatusLabels[enrollment.status]}
                        </Badge>
                    </div>
                    <p className="mt-3 text-muted-foreground">
                        {cohort.format_label} · {cohort.rhythm_label}
                    </p>
                </div>
                {confirmed && nextMeetingUrl && (
                    <Button asChild>
                        <a
                            href={nextMeetingUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <Video data-icon="inline-start" />
                            Rejoindre la visio
                        </a>
                    </Button>
                )}
            </div>

            {enrollment.can_pay && (
                <Alert>
                    <CreditCard aria-hidden="true" />
                    <AlertTitle>Paiement en attente</AlertTitle>
                    <AlertDescription>
                        <p>
                            Ta place est réservée jusqu’à{' '}
                            {format(enrollment.expires_at, {
                                timeStyle: 'short',
                            })}
                            . Passé ce délai, elle est libérée.
                        </p>
                        <Button
                            size="sm"
                            className="mt-3"
                            disabled={paying}
                            onClick={() =>
                                router.post(
                                    checkout.url(enrollment.id),
                                    {},
                                    {
                                        onStart: () => setPaying(true),
                                        onFinish: () => setPaying(false),
                                    },
                                )
                            }
                        >
                            {paying && <Spinner data-icon="inline-start" />}
                            Reprendre le paiement
                        </Button>
                    </AlertDescription>
                </Alert>
            )}
            {enrollment.status === 'processing' && (
                <Alert>
                    <AlertDescription>
                        Ton paiement est en cours de vérification par ta banque.
                        Ne règle pas une deuxième fois : ton inscription sera
                        confirmée automatiquement.
                    </AlertDescription>
                </Alert>
            )}
            {enrollment.status === 'payment_review' && (
                <Alert>
                    <AlertDescription>
                        Ton paiement est bien reçu et demande une vérification
                        de notre part. Nous revenons vers toi très vite.
                    </AlertDescription>
                </Alert>
            )}
            {enrollment.status === 'cancelled' && (
                <Alert>
                    <AlertTitle>Inscription annulée</AlertTitle>
                    <AlertDescription>
                        {enrollment.cancellation_reason}{' '}
                        {enrollment.refunded_cents > 0
                            ? `Remboursement : ${formatCoursePrice(enrollment.refunded_cents, enrollment.currency)}, sous quelques jours selon ta banque.`
                            : 'Aucun remboursement.'}
                    </AlertDescription>
                </Alert>
            )}
            {enrollment.status === 'refunded' && (
                <Alert>
                    <AlertDescription>
                        Ton paiement a été remboursé intégralement : le groupe
                        n’avait plus de place.{' '}
                        <Link
                            href={courses()}
                            className="font-medium text-primary underline underline-offset-4"
                        >
                            Choisir un autre groupe
                        </Link>
                    </AlertDescription>
                </Alert>
            )}

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <TrialInfoCard
                    icon={CalendarDays}
                    label="Dates"
                    value={`Du ${format(cohort.starts_at, { day: 'numeric', month: 'short' })}`}
                    caption={`Au ${format(cohort.ends_at, { day: 'numeric', month: 'long', year: 'numeric' })}`}
                />
                <TrialInfoCard
                    icon={Clock}
                    label="Horaires"
                    value={format(cohort.starts_at, { timeStyle: 'short' })}
                    caption={`${describeRhythm(cohort)} (${timezone})`}
                />
                <TrialInfoCard
                    icon={Users}
                    label="Prochaine séance"
                    value={
                        next
                            ? format(next.starts_at, {
                                  weekday: 'short',
                                  day: 'numeric',
                                  month: 'short',
                              })
                            : 'Parcours terminé'
                    }
                    caption={`${done} séance${done > 1 ? 's' : ''} suivie${done > 1 ? 's' : ''} sur ${sessions.length}`}
                />
                <TrialInfoCard
                    icon={CreditCard}
                    label="Paiement"
                    value={formatCoursePrice(
                        enrollment.amount_cents,
                        enrollment.currency,
                    )}
                    caption={
                        enrollment.payment_plan === 'installments'
                            ? `En ${enrollment.installments?.length || 3} fois · ${enrollment.installments?.filter((item) => item.status === 'paid').length ?? 0} échéance(s) réglée(s)`
                            : enrollment.paid_at
                              ? `Payé le ${format(enrollment.paid_at, { day: 'numeric', month: 'long' })}`
                              : 'Paiement en une fois'
                    }
                />
            </div>

            {enrollment.payment_plan === 'installments' &&
                (enrollment.installments ?? []).length > 0 && (
                    <InstallmentSchedule enrollment={enrollment} />
                )}

            {confirmed && !hasMeetingUrl && (
                <p className="text-sm text-muted-foreground">
                    Ton professeur ajoutera les liens de visio avant les
                    séances.
                </p>
            )}

            {sessions.length > 0 && (
                <section className="flex flex-col gap-3">
                    <div className="flex items-center justify-between gap-3">
                        <h2 className="text-xl font-semibold">Planning</h2>
                        <Badge variant="outline">
                            {sessions.length} séances
                        </Badge>
                    </div>
                    <CoursePlanningCalendar
                        sessions={sessions}
                        defaultMeetingUrl={enrollment.meeting_url ?? null}
                        canJoin={
                            confirmed &&
                            new Date(cohort.ends_at).getTime() > now
                        }
                    />
                </section>
            )}

            {confirmed && (
                <p className="text-sm text-muted-foreground">
                    {withdrawalOpen ? (
                        <>
                            Tu peux te rétracter jusqu’au{' '}
                            {format(enrollment.withdrawal_ends_at, {
                                dateStyle: 'long',
                            })}{' '}
                            en{' '}
                            <Link
                                href={contact()}
                                className="font-medium text-primary underline underline-offset-4"
                            >
                                nous écrivant
                            </Link>
                            . Si le parcours a commencé, seule la part non
                            suivie est remboursée.
                        </>
                    ) : (
                        <>
                            Le délai de rétractation est terminé : l’inscription
                            n’est plus remboursable. Une question ?{' '}
                            <Link
                                href={contact()}
                                className="font-medium text-primary underline underline-offset-4"
                            >
                                Contacte-nous
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
        </div>
    );
}

const installmentLabels: Record<CourseInstallment['status'], string> = {
    scheduled: 'À venir',
    failed: 'Échec du prélèvement',
    paid: 'Réglée',
    cancelled: 'Annulée',
};

const installmentVariants: Record<
    CourseInstallment['status'],
    'default' | 'secondary' | 'outline' | 'destructive'
> = {
    scheduled: 'secondary',
    failed: 'destructive',
    paid: 'default',
    cancelled: 'outline',
};

function InstallmentSchedule({ enrollment }: { enrollment: CourseEnrollment }) {
    const timezone = useUserTimezone();
    const [payingId, setPayingId] = useState<number | null>(null);
    const installments = enrollment.installments ?? [];
    const date = (value: string) =>
        new Intl.DateTimeFormat('fr-FR', {
            timeZone: timezone,
            dateStyle: 'long',
        }).format(new Date(value));
    const failed = installments.find((item) => item.status === 'failed');

    return (
        <div className="flex flex-col gap-3">
            {failed && (
                <Alert variant="destructive">
                    <AlertTitle>
                        L’échéance {failed.position} n’a pas pu être prélevée
                    </AlertTitle>
                    <AlertDescription>
                        {failed.next_attempt_at
                            ? `Nouvelle tentative automatique le ${date(failed.next_attempt_at)}. Tu peux aussi la régler dès maintenant.`
                            : 'Règle-la dès maintenant pour garder ta place dans le groupe.'}
                    </AlertDescription>
                </Alert>
            )}
            <div className="rounded-lg border border-border">
                <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-3">
                    <h3 className="font-medium">Échéancier</h3>
                    <span className="text-sm text-muted-foreground">
                        Total{' '}
                        {formatCoursePrice(
                            enrollment.amount_cents,
                            enrollment.currency,
                        )}
                    </span>
                </div>
                <ul className="divide-y divide-border">
                    {installments.map((installment) => (
                        <li
                            key={installment.id}
                            className="flex flex-wrap items-center justify-between gap-3 px-5 py-3 text-sm"
                        >
                            <span className="flex flex-col">
                                <span className="font-medium">
                                    Échéance {installment.position} ·{' '}
                                    {formatCoursePrice(
                                        installment.amount_cents,
                                        enrollment.currency,
                                    )}
                                </span>
                                <span className="text-muted-foreground">
                                    {installment.paid_at
                                        ? `Réglée le ${date(installment.paid_at)}`
                                        : `Prélevée le ${date(installment.due_at)}`}
                                </span>
                            </span>
                            <span className="flex items-center gap-3">
                                <Badge
                                    variant={
                                        installmentVariants[installment.status]
                                    }
                                >
                                    {installmentLabels[installment.status]}
                                </Badge>
                                {installment.can_pay && (
                                    <Button
                                        size="sm"
                                        disabled={payingId !== null}
                                        onClick={() =>
                                            router.post(
                                                installmentCheckout.url(
                                                    installment.id,
                                                ),
                                                {},
                                                {
                                                    onStart: () =>
                                                        setPayingId(
                                                            installment.id,
                                                        ),
                                                    onFinish: () =>
                                                        setPayingId(null),
                                                },
                                            )
                                        }
                                    >
                                        {payingId === installment.id && (
                                            <Spinner data-icon="inline-start" />
                                        )}
                                        Régler maintenant
                                    </Button>
                                )}
                            </span>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}
