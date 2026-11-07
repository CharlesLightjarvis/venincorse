import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import {
    BookOpen,
    CalendarDays,
    ChevronDown,
    Clock,
    CreditCard,
    Users,
    Video,
} from 'reicon-react';
import { TrialInfoCard } from '@/components/trial-info-card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
    Empty,
    EmptyContent,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
} from '@/components/ui/empty';
import { Spinner } from '@/components/ui/spinner';
import { useUserTimezone } from '@/hooks/use-browser-timezone';
import {
    describeRhythm,
    enrollmentStatusLabels,
    enrollmentStatusVariant,
    formatCoursePrice,
    type CourseEnrollment,
} from '@/lib/course-cohorts';
import { contact, courses } from '@/routes';
import { checkout, index } from '@/routes/course-enrollments';
import { sales } from '@/routes/legal';

export default function MyCourses({
    enrollments,
}: {
    enrollments: CourseEnrollment[];
}) {
    return (
        <div className="flex h-full flex-1 flex-col gap-6 p-4">
            <Head title="Mes parcours" />
            <div>
                <h1 className="text-3xl font-semibold">Mes parcours</h1>
                <p className="mt-3 text-muted-foreground">
                    Retrouve ton groupe, ton planning et le lien de la visio.
                </p>
            </div>
            {enrollments.length === 0 ? (
                <Empty className="border">
                    <EmptyHeader>
                        <EmptyMedia variant="icon">
                            <BookOpen />
                        </EmptyMedia>
                        <EmptyTitle>Pas encore de parcours</EmptyTitle>
                        <EmptyDescription>
                            Un niveau complet de 60 heures, en groupe ou en
                            individuel, au rythme qui te convient.
                        </EmptyDescription>
                    </EmptyHeader>
                    <EmptyContent>
                        <Button asChild>
                            <Link href={courses()}>Découvrir les parcours</Link>
                        </Button>
                    </EmptyContent>
                </Empty>
            ) : (
                enrollments.map((enrollment) => (
                    <EnrollmentCard
                        key={enrollment.id}
                        enrollment={enrollment}
                    />
                ))
            )}
        </div>
    );
}

function EnrollmentCard({ enrollment }: { enrollment: CourseEnrollment }) {
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

    return (
        <section className="flex flex-col gap-5 rounded-lg border border-border p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                    <div className="flex flex-wrap items-center gap-3">
                        <h2 className="text-2xl font-semibold">
                            {cohort.level_label}
                        </h2>
                        <Badge
                            variant={enrollmentStatusVariant[enrollment.status]}
                        >
                            {enrollmentStatusLabels[enrollment.status]}
                        </Badge>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                        {cohort.format_label} · {cohort.rhythm_label}
                    </p>
                </div>
                {confirmed && enrollment.meeting_url && (
                    <Button asChild>
                        <a
                            href={enrollment.meeting_url}
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
                        enrollment.paid_at
                            ? `Payé le ${format(enrollment.paid_at, { day: 'numeric', month: 'long' })}`
                            : 'Paiement en une fois'
                    }
                />
            </div>

            {confirmed && !enrollment.meeting_url && (
                <p className="text-sm text-muted-foreground">
                    Ton professeur ajoutera le lien de la visio avant la
                    première séance.
                </p>
            )}

            {sessions.length > 0 && (
                <Collapsible className="rounded-lg border border-border">
                    <CollapsibleTrigger className="group flex w-full items-center justify-between gap-3 px-5 py-3 text-left font-medium">
                        Planning complet ({sessions.length} séances)
                        <ChevronDown
                            className="size-4 transition-transform group-data-[state=open]:rotate-180"
                            aria-hidden="true"
                        />
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                        <ol className="grid max-h-96 divide-y divide-border overflow-y-auto border-t border-border">
                            {sessions.map((session) => {
                                const past =
                                    new Date(session.starts_at).getTime() +
                                        session.duration_minutes * 60_000 <=
                                    now;

                                return (
                                    <li
                                        key={session.position}
                                        className={`flex items-center justify-between gap-3 px-5 py-2.5 text-sm ${past ? 'text-muted-foreground' : ''}`}
                                    >
                                        <span className="flex items-center gap-3">
                                            <span className="w-8 font-mono text-xs text-muted-foreground">
                                                {session.position}
                                            </span>
                                            <span className="first-letter:uppercase">
                                                {format(session.starts_at, {
                                                    weekday: 'long',
                                                    day: 'numeric',
                                                    month: 'long',
                                                })}
                                            </span>
                                        </span>
                                        <span className="tabular-nums">
                                            {format(session.starts_at, {
                                                timeStyle: 'short',
                                            })}{' '}
                                            · {session.duration_minutes / 60} h
                                        </span>
                                    </li>
                                );
                            })}
                        </ol>
                    </CollapsibleContent>
                </Collapsible>
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
        </section>
    );
}

MyCourses.layout = {
    breadcrumbs: [{ title: 'Mes parcours', href: index() }],
};
