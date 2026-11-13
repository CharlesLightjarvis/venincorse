import { Head, Link, usePage } from '@inertiajs/react';
import {
    Warning,
    BookOpen,
    CalendarCheck,
    CalendarDay,
    CalendarDays,
    CalendarPlus,
    Clock,
    Coins,
    Sliders,
    UserCheck,
    Users,
    type IconComponent,
} from 'reicon-react';
import { Button } from '@/components/ui/button';
import {
    Empty,
    EmptyContent,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
} from '@/components/ui/empty';
import { TrialInfoCard } from '@/components/trial-info-card';
import { useUserTimezone } from '@/hooks/use-browser-timezone';
import {
    formatReservationDate,
    formatReservationPrice,
    reservationStatusLabels,
    type TrialReservation,
} from '@/lib/trial-reservations';
import { dashboard } from '@/routes';
import { index as manageCohorts } from '@/routes/course-cohorts';
import { edit as editAvailability } from '@/routes/trial-availability';
import {
    index as manageTrials,
    show as showTrial,
} from '@/routes/trial-management';
import { create, index } from '@/routes/trial-reservations';
import type { Auth } from '@/types';

type StudentDashboard = {
    reservations: TrialReservation[];
    overview: { confirmed: number; pending: number; paidCents: number };
};

type ManagementDashboard = {
    upcoming: TrialReservation[];
    overview: {
        upcoming: number;
        paymentReview: number;
        awaitingOutcome: number;
        monthRevenueCents: number;
        freeSlots: number;
    };
};

type CourseDashboard = {
    monthRevenueCents: number;
    activeEnrollments: number;
    fillRate: number;
    attendanceRate: number | null;
    paymentReview: number;
    failedInstallments: number;
};

type Stat = { label: string; value: string | number; icon: IconComponent };

function StatCards({ stats }: { stats: Stat[] }) {
    return (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map(({ label, value, icon: Icon }) => (
                <div
                    key={label}
                    className="rounded-lg border border-border p-5"
                >
                    <div className="flex items-center justify-between gap-3">
                        <p className="text-sm text-muted-foreground">{label}</p>
                        <Icon
                            className="size-5 text-muted-foreground"
                            aria-hidden="true"
                        />
                    </div>
                    <p className="mt-3 text-3xl font-semibold">{value}</p>
                </div>
            ))}
        </div>
    );
}

function ManagementSection({
    management,
    canManageAvailability,
}: {
    management: ManagementDashboard;
    canManageAvailability: boolean;
}) {
    const timezone = useUserTimezone();
    const { overview, upcoming } = management;
    return (
        <>
            <div>
                <h1 className="text-3xl font-semibold">
                    Les cours d’essai, en un coup d’œil.
                </h1>
                <p className="mt-3 text-muted-foreground">
                    Prochaines séances, paiements à vérifier et créneaux encore
                    libres.
                </p>
            </div>
            <StatCards
                stats={[
                    {
                        label: 'Séances à venir',
                        value: overview.upcoming,
                        icon: CalendarCheck,
                    },
                    {
                        label: 'Paiements à vérifier',
                        value: overview.paymentReview,
                        icon: Warning,
                    },
                    {
                        label: 'Encaissé ce mois-ci',
                        value: formatReservationPrice(
                            overview.monthRevenueCents,
                        ),
                        icon: Coins,
                    },
                    {
                        label: 'Créneaux libres',
                        value: overview.freeSlots,
                        icon: CalendarDay,
                    },
                ]}
            />
            {overview.paymentReview > 0 && (
                <p className="rounded-lg border border-amber-500/40 bg-amber-500/10 p-4 text-sm">
                    {overview.paymentReview === 1
                        ? 'Un paiement demande une vérification manuelle'
                        : `${overview.paymentReview} paiements demandent une vérification manuelle`}{' '}
                    dans la gestion des essais.
                </p>
            )}
            {overview.awaitingOutcome > 0 && (
                <p className="rounded-lg border border-border bg-muted/30 p-4 text-sm">
                    {overview.awaitingOutcome === 1
                        ? 'Une séance passée attend d’être clôturée'
                        : `${overview.awaitingOutcome} séances passées attendent d’être clôturées`}
                    .{' '}
                    <Link
                        href={manageTrials({ query: { category: 'done' } })}
                        className="font-medium text-foreground underline underline-offset-4"
                    >
                        Les clôturer
                    </Link>
                </p>
            )}
            {canManageAvailability && overview.freeSlots === 0 && (
                <p className="rounded-lg border border-dashed border-border p-4 text-sm text-muted-foreground">
                    Aucun créneau n’est proposé aux élèves pour le moment.{' '}
                    <Link
                        href={editAvailability()}
                        className="font-medium text-foreground underline underline-offset-4"
                    >
                        Définir les disponibilités
                    </Link>
                </p>
            )}
            <section className="flex flex-col gap-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <h2 className="text-2xl font-semibold">
                        Prochaines séances
                    </h2>
                    <div className="flex flex-wrap gap-2 text-sm">
                        <Link
                            href={manageTrials()}
                            className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 hover:bg-muted/30"
                        >
                            <CalendarDays
                                className="size-4"
                                aria-hidden="true"
                            />
                            Gestion des essais
                        </Link>
                        {canManageAvailability && (
                            <Link
                                href={editAvailability()}
                                className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 hover:bg-muted/30"
                            >
                                <Sliders
                                    className="size-4"
                                    aria-hidden="true"
                                />
                                Disponibilités
                            </Link>
                        )}
                    </div>
                </div>
                {upcoming.length === 0 && (
                    <Empty className="border">
                        <EmptyHeader>
                            <EmptyMedia variant="icon">
                                <CalendarCheck />
                            </EmptyMedia>
                            <EmptyTitle>Aucune séance à venir</EmptyTitle>
                            <EmptyDescription>
                                Les cours d’essai payés et confirmés
                                apparaîtront ici.
                            </EmptyDescription>
                        </EmptyHeader>
                    </Empty>
                )}
                {upcoming.map((reservation) => (
                    <Link
                        key={reservation.id}
                        href={showTrial(reservation.id)}
                        className="flex flex-col gap-3 rounded-lg border border-border p-5 transition-colors hover:bg-muted/30 sm:flex-row sm:items-center sm:justify-between"
                    >
                        <div>
                            <h3 className="font-semibold">
                                {formatReservationDate(
                                    reservation.starts_at,
                                    timezone,
                                )}
                            </h3>
                            <p className="mt-2 text-sm text-muted-foreground">
                                {reservation.student?.name} ·{' '}
                                {reservation.student?.email}
                            </p>
                        </div>
                        <p
                            className={
                                reservation.meeting_url
                                    ? 'text-sm text-muted-foreground'
                                    : 'text-sm font-medium text-amber-600 dark:text-amber-400'
                            }
                        >
                            {reservation.meeting_url
                                ? 'Lien de visio prêt'
                                : 'Lien de visio à ajouter'}
                        </p>
                    </Link>
                ))}
            </section>
        </>
    );
}

function CourseSection({ courses }: { courses: CourseDashboard }) {
    return (
        <section className="flex flex-col gap-4">
            <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                    <h2 className="text-2xl font-semibold">Parcours</h2>
                    <p className="mt-2 text-muted-foreground">
                        Le chiffre d’affaires, les places et l’assiduité des
                        groupes.
                    </p>
                </div>
                <div className="flex flex-wrap gap-2 text-sm">
                    <Link
                        href={manageCohorts()}
                        className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 hover:bg-muted/30"
                    >
                        <Users className="size-4" aria-hidden="true" />
                        Groupes
                    </Link>
                </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                <TrialInfoCard
                    icon={Coins}
                    label="CA parcours ce mois-ci"
                    value={formatReservationPrice(courses.monthRevenueCents)}
                    caption="Inscriptions et échéances encaissées"
                />
                <TrialInfoCard
                    icon={BookOpen}
                    label="Inscriptions actives"
                    value={String(courses.activeEnrollments)}
                    caption="Élèves confirmés sur un groupe en cours"
                />
                <TrialInfoCard
                    icon={Users}
                    label="Taux de remplissage"
                    value={`${courses.fillRate} %`}
                    caption="Places prises sur les groupes à venir"
                />
                <TrialInfoCard
                    icon={UserCheck}
                    label="Taux de présence"
                    value={
                        courses.attendanceRate === null
                            ? '—'
                            : `${courses.attendanceRate} %`
                    }
                    caption={
                        courses.attendanceRate === null
                            ? 'Aucun appel enregistré'
                            : 'Sur les séances déjà appelées'
                    }
                />
                <TrialInfoCard
                    icon={Warning}
                    label="Paiements à vérifier"
                    value={String(courses.paymentReview)}
                    caption="Inscriptions en attente de décision"
                />
                <TrialInfoCard
                    icon={Clock}
                    label="Échéances en échec"
                    value={String(courses.failedInstallments)}
                    caption="Prélèvements à relancer"
                />
            </div>
            {(courses.paymentReview > 0 || courses.failedInstallments > 0) && (
                <p className="rounded-lg border border-amber-500/40 bg-amber-500/10 p-4 text-sm">
                    {courses.paymentReview > 0 &&
                        (courses.paymentReview === 1
                            ? 'Un paiement de parcours demande une vérification manuelle. '
                            : `${courses.paymentReview} paiements de parcours demandent une vérification manuelle. `)}
                    {courses.failedInstallments > 0 &&
                        (courses.failedInstallments === 1
                            ? 'Une échéance n’a pas pu être prélevée. '
                            : `${courses.failedInstallments} échéances n’ont pas pu être prélevées. `)}{' '}
                    <Link
                        href={manageCohorts()}
                        className="font-medium text-foreground underline underline-offset-4"
                    >
                        Voir les groupes
                    </Link>
                </p>
            )}
        </section>
    );
}

function StudentSection({ student }: { student: StudentDashboard }) {
    const timezone = useUserTimezone();
    const { overview, reservations } = student;
    const canReserve =
        usePage<{ auth: Auth }>().props.auth.can?.reserveTrial ?? false;
    return (
        <>
            <div>
                <h1 className="text-3xl font-semibold">
                    Ton espace, tes rendez-vous.
                </h1>
                <p className="mt-3 text-muted-foreground">
                    Retrouve tes cours d’essai et leur paiement. Seules tes
                    propres réservations sont affichées ici.
                </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
                {[
                    {
                        label: 'Réservations confirmées',
                        value: overview.confirmed,
                        icon: CalendarCheck,
                    },
                    {
                        label: 'Paiements à suivre',
                        value: overview.pending,
                        icon: Clock,
                    },
                    {
                        label: 'Total réglé',
                        value: formatReservationPrice(overview.paidCents),
                        icon: Coins,
                    },
                ].map(({ label, value, icon: Icon }) => (
                    <div
                        key={label}
                        className="rounded-lg border border-border p-5"
                    >
                        <div className="flex items-center justify-between gap-3">
                            <p className="text-sm text-muted-foreground">
                                {label}
                            </p>
                            <Icon
                                className="size-5 text-muted-foreground"
                                aria-hidden="true"
                            />
                        </div>
                        <p className="mt-3 text-3xl font-semibold">{value}</p>
                    </div>
                ))}
            </div>
            <section className="flex flex-col gap-4">
                <h2 className="text-2xl font-semibold">
                    Ma réservation d’essai
                </h2>
                {reservations.length === 0 && (
                    <Empty className="border">
                        <EmptyHeader>
                            <EmptyMedia variant="icon">
                                <CalendarPlus />
                            </EmptyMedia>
                            <EmptyTitle>Pas encore de réservation</EmptyTitle>
                            <EmptyDescription>
                                Choisis un créneau pour ton premier cours
                                d’essai.
                            </EmptyDescription>
                        </EmptyHeader>
                        {canReserve && (
                            <EmptyContent>
                                <Button asChild>
                                    <Link href={create()}>
                                        Réserver mon cours d’essai
                                    </Link>
                                </Button>
                            </EmptyContent>
                        )}
                    </Empty>
                )}
                {reservations.map((reservation) => (
                    <Link
                        key={reservation.id}
                        href={index()}
                        className="flex flex-col gap-3 rounded-lg border border-border p-5 transition-colors hover:bg-muted/30 sm:flex-row sm:items-center sm:justify-between"
                    >
                        <div>
                            <h3 className="font-semibold">
                                {formatReservationDate(
                                    reservation.starts_at,
                                    timezone,
                                )}
                            </h3>
                            <p className="mt-2 text-sm text-muted-foreground">
                                Cours individuel · 60 minutes · {timezone}
                            </p>
                        </div>
                        <div>
                            <p className="font-medium text-primary">
                                {reservationStatusLabels[reservation.status]}
                            </p>
                            <p className="mt-1 text-sm text-muted-foreground">
                                {formatReservationPrice(
                                    reservation.amount_cents,
                                    reservation.currency,
                                )}
                            </p>
                        </div>
                    </Link>
                ))}
            </section>
        </>
    );
}

export default function Dashboard({
    student,
    management,
    courses,
    canManageAvailability,
}: {
    student: StudentDashboard | null;
    management: ManagementDashboard | null;
    courses: CourseDashboard | null;
    canManageAvailability: boolean;
}) {
    return (
        <div className="flex h-full flex-1 flex-col gap-6 p-4">
            <Head title="Mon espace" />
            {management && (
                <ManagementSection
                    management={management}
                    canManageAvailability={canManageAvailability}
                />
            )}
            {courses && <CourseSection courses={courses} />}
            {student && <StudentSection student={student} />}
            {!student && !management && !courses && (
                <div>
                    <h1 className="text-3xl font-semibold">Mon espace</h1>
                    <p className="mt-3 text-muted-foreground">
                        Aucun contenu n’est encore associé à ton compte.
                    </p>
                </div>
            )}
        </div>
    );
}

Dashboard.layout = {
    breadcrumbs: [{ title: 'Mon espace', href: dashboard() }],
};
