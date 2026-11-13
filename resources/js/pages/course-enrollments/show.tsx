import { Head, Link, router, setLayoutProps } from "@inertiajs/react";
import type { ColumnDef } from "@tanstack/react-table";
import { useState } from "react";
import {
    ArrowLeft,
    CalendarDays,
    BookOpen,
    ClipboardCheck,
    Clock,
    CreditCard,
    Grid,
    Users,
    Video,
} from "reicon-react";
import { CoursePlanningCalendar } from "@/components/course-planning-calendar";
import { DataTable } from "@/components/data-table";
import { DataTableColumnHeader } from "@/components/data-table-column-header";
import { TrialInfoCard } from "@/components/trial-info-card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Empty,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
} from "@/components/ui/empty";
import { Spinner } from "@/components/ui/spinner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useUserTimezone } from "@/hooks/use-browser-timezone";
import {
    attendanceStatusLabels,
    describeRhythm,
    enrollmentStatusLabels,
    enrollmentStatusVariant,
    formatCoursePrice,
    paymentMethodLabels,
    type CourseEnrollment,
    type CourseInstallment,
    type CourseSession,
    type CourseAttendanceStatus,
} from "@/lib/course-cohorts";
import { checkout as installmentCheckout } from "@/routes/course-installments";
import { contact, courses } from "@/routes";
import { checkout, index, show } from "@/routes/course-enrollments";
import { sales } from "@/routes/legal";
import { show as showManual } from "@/routes/course-manuals";

type CourseManual = {
    id: number;
    part: number;
    type: "kursbuch" | "arbeitsbuch";
};

export default function ShowCourseEnrollment({
    enrollment,
    manuals,
}: {
    enrollment: CourseEnrollment;
    manuals: CourseManual[];
}) {
    const timezone = useUserTimezone();
    const [paying, setPaying] = useState(false);
    const [openManual, setOpenManual] = useState<CourseManual | null>(null);
    const cohort = enrollment.cohort;
    const format = (value: string, options: Intl.DateTimeFormatOptions) =>
        new Intl.DateTimeFormat("fr-FR", {
            timeZone: timezone,
            ...options,
        }).format(new Date(value));
    const sessions = cohort.sessions ?? [];
    const now = Date.now();
    const next = sessions.find(
        (session) =>
            !session.cancelled_at &&
            new Date(session.starts_at).getTime() +
                session.duration_minutes * 60_000 >
                now,
    );
    const done = sessions.filter(
        (session) =>
            !session.cancelled_at &&
            new Date(session.starts_at).getTime() +
                session.duration_minutes * 60_000 <=
                now,
    ).length;
    const attendanceBySession = new Map(
        (enrollment.attendances ?? []).map((attendance) => [
            attendance.session_id,
            attendance.status,
        ]),
    );
    const startedSessions = sessions
        .filter(
            (session) =>
                !session.cancelled_at &&
                new Date(session.starts_at).getTime() <= now,
        )
        .sort(
            (left, right) =>
                new Date(right.starts_at).getTime() -
                new Date(left.starts_at).getTime(),
        );
    const confirmed = enrollment.status === "confirmed";
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
            { title: "Mes parcours", href: index() },
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
                {confirmed &&
                    next &&
                    nextMeetingUrl &&
                    !cohort.cancelled_at && (
                        <div className="flex flex-col items-start gap-2 sm:items-end">
                            <Button asChild>
                                <a
                                    href={nextMeetingUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <Video data-icon="inline-start" />
                                    {new Date(next.starts_at).getTime() <= now
                                        ? "Rejoindre la séance en cours"
                                        : "Rejoindre la prochaine séance"}
                                </a>
                            </Button>
                            <p className="text-sm text-muted-foreground">
                                Séance {next.position} ·{" "}
                                {format(next.starts_at, {
                                    dateStyle: "long",
                                    timeStyle: "short",
                                })}
                            </p>
                        </div>
                    )}
            </div>

            {enrollment.can_pay && (
                <Alert>
                    <CreditCard aria-hidden="true" />
                    <AlertTitle>Paiement en attente</AlertTitle>
                    <AlertDescription>
                        <p>
                            Ta place est réservée jusqu’à{" "}
                            {format(enrollment.expires_at, {
                                timeStyle: "short",
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
            {enrollment.status === "processing" && (
                <Alert>
                    <AlertDescription>
                        Ton paiement est en cours de vérification par ta banque.
                        Ne règle pas une deuxième fois : ton inscription sera
                        confirmée automatiquement.
                    </AlertDescription>
                </Alert>
            )}
            {enrollment.status === "payment_review" && (
                <Alert>
                    <AlertDescription>
                        Ton paiement est bien reçu et demande une vérification
                        de notre part. Nous revenons vers toi très vite.
                    </AlertDescription>
                </Alert>
            )}
            {enrollment.status === "cancelled" && (
                <Alert>
                    <AlertTitle>Inscription annulée</AlertTitle>
                    <AlertDescription>
                        {enrollment.cancellation_reason}{" "}
                        {enrollment.refunded_cents > 0
                            ? enrollment.payment_method === "stripe"
                                ? `Remboursement : ${formatCoursePrice(enrollment.refunded_cents, enrollment.currency)}, sous quelques jours selon ta banque.`
                                : `Remboursement : ${formatCoursePrice(enrollment.refunded_cents, enrollment.currency)}. L’école te contactera pour les modalités.`
                            : "Aucun remboursement."}
                    </AlertDescription>
                </Alert>
            )}
            {enrollment.status === "refunded" && (
                <Alert>
                    <AlertDescription>
                        Ton paiement a été remboursé intégralement : le groupe
                        n’avait plus de place.{" "}
                        <Link
                            href={courses()}
                            className="font-medium text-primary underline underline-offset-4"
                        >
                            Choisir un autre groupe
                        </Link>
                    </AlertDescription>
                </Alert>
            )}
            {cohort.cancelled_at && enrollment.status !== "cancelled" && (
                <Alert variant="destructive">
                    <AlertTitle>Groupe annulé</AlertTitle>
                    <AlertDescription>
                        <p>
                            Ton professeur a annulé ce groupe
                            {cohort.cancellation_reason
                                ? ` : ${cohort.cancellation_reason}`
                                : "."}
                        </p>
                        <p className="mt-1">
                            Les séances à venir n’ont pas lieu. Si tu étais
                            inscrit, l’école te contactera au sujet de ton
                            remboursement.{" "}
                            <Link
                                href={courses()}
                                className="font-medium underline underline-offset-4"
                            >
                                Voir les autres parcours
                            </Link>
                        </p>
                    </AlertDescription>
                </Alert>
            )}

            <Tabs defaultValue="overview" className="gap-6">
                <TabsList
                    aria-label="Sections du parcours"
                    className="grid h-auto w-full grid-cols-2 gap-1 p-1 sm:grid-cols-5"
                >
                    <TabsTrigger
                        value="overview"
                        className="h-auto min-h-9 py-2"
                    >
                        <Grid aria-hidden="true" />
                        Vue d’ensemble
                    </TabsTrigger>
                    <TabsTrigger
                        value="payment"
                        className="h-auto min-h-9 py-2"
                    >
                        <CreditCard aria-hidden="true" />
                        Paiement
                    </TabsTrigger>
                    <TabsTrigger
                        value="attendance"
                        className="h-auto min-h-9 py-2"
                    >
                        <ClipboardCheck aria-hidden="true" />
                        Présences
                    </TabsTrigger>
                    <TabsTrigger
                        value="manuals"
                        className="h-auto min-h-9 py-2"
                    >
                        <BookOpen aria-hidden="true" />
                        Manuels
                    </TabsTrigger>
                    <TabsTrigger
                        value="planning"
                        className="h-auto min-h-9 py-2"
                    >
                        <CalendarDays aria-hidden="true" />
                        Planning
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="flex flex-col gap-6">
                    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                        <TrialInfoCard
                            icon={CalendarDays}
                            label="Dates"
                            value={`Du ${format(cohort.starts_at, { day: "numeric", month: "short" })}`}
                            caption={`Au ${format(cohort.ends_at, { day: "numeric", month: "long", year: "numeric" })}`}
                        />
                        <TrialInfoCard
                            icon={Clock}
                            label="Horaires"
                            value={format(cohort.starts_at, {
                                timeStyle: "short",
                            })}
                            caption={`${describeRhythm(cohort)} (${timezone})`}
                        />
                        <TrialInfoCard
                            icon={Users}
                            label="Prochaine séance"
                            value={
                                next
                                    ? format(next.starts_at, {
                                          weekday: "short",
                                          day: "numeric",
                                          month: "short",
                                      })
                                    : "Parcours terminé"
                            }
                            caption={`${done} séance${done > 1 ? "s" : ""} suivie${done > 1 ? "s" : ""} sur ${sessions.length}`}
                        />
                        <TrialInfoCard
                            icon={CreditCard}
                            label="Paiement"
                            value={formatCoursePrice(
                                enrollment.amount_cents,
                                enrollment.currency,
                            )}
                            caption={
                                enrollment.payment_plan === "installments"
                                    ? `En ${enrollment.installments?.length || 3} fois · ${enrollment.installments?.filter((item) => item.status === "paid").length ?? 0} échéance(s) réglée(s)`
                                    : enrollment.paid_at
                                      ? `Payé le ${format(enrollment.paid_at, { day: "numeric", month: "long" })}`
                                      : "Paiement en une fois"
                            }
                        />
                    </div>

                    {confirmed && !hasMeetingUrl && (
                        <p className="text-sm text-muted-foreground">
                            Ton professeur ajoutera les liens de visio avant les
                            séances.
                        </p>
                    )}
                </TabsContent>

                <TabsContent value="payment" className="flex flex-col gap-6">
                    <div>
                        <h2 className="font-semibold">Paiement</h2>
                        <p className="text-sm text-muted-foreground">
                            Retrouve le détail de ton paiement et de tes
                            échéances.
                        </p>
                    </div>
                    {enrollment.payment_plan === "installments" &&
                        (enrollment.installments ?? []).length > 0 && (
                            <InstallmentSchedule enrollment={enrollment} />
                        )}

                    {enrollment.payment_plan !== "installments" && (
                        <SinglePaymentTable
                            enrollment={enrollment}
                            formatDate={format}
                        />
                    )}

                    {confirmed && (
                        <p className="text-sm text-muted-foreground">
                            {withdrawalOpen ? (
                                <>
                                    Tu peux te rétracter jusqu’au{" "}
                                    {format(enrollment.withdrawal_ends_at, {
                                        dateStyle: "long",
                                    })}{" "}
                                    en{" "}
                                    <Link
                                        href={contact()}
                                        className="font-medium text-primary underline underline-offset-4"
                                    >
                                        nous écrivant
                                    </Link>
                                    . Si le parcours a commencé, seule la part
                                    non suivie est remboursée.
                                </>
                            ) : (
                                <>
                                    Le délai de rétractation est terminé :
                                    l’inscription n’est plus remboursable. Une
                                    question ?{" "}
                                    <Link
                                        href={contact()}
                                        className="font-medium text-primary underline underline-offset-4"
                                    >
                                        Contacte-nous
                                    </Link>
                                    .
                                </>
                            )}{" "}
                            <Link
                                href={sales()}
                                className="underline underline-offset-4"
                            >
                                Voir les conditions
                            </Link>
                        </p>
                    )}
                </TabsContent>

                <TabsContent value="attendance" className="flex flex-col gap-6">
                    {confirmed ? (
                        <section className="flex flex-col gap-3">
                            <div className="flex flex-wrap items-center justify-between gap-3">
                                <div>
                                    <h2 className="font-semibold">Présences</h2>
                                    <p className="text-sm text-muted-foreground">
                                        Ton statut apparaît ici après l’appel du
                                        professeur.
                                    </p>
                                </div>
                                <Badge variant="outline">
                                    {startedSessions.length} séance
                                    {startedSessions.length > 1 ? "s" : ""}{" "}
                                    commencée
                                    {startedSessions.length > 1 ? "s" : ""}
                                </Badge>
                            </div>
                            {startedSessions.length === 0 ? (
                                <Empty className="border">
                                    <EmptyHeader>
                                        <EmptyMedia variant="icon">
                                            <ClipboardCheck aria-hidden="true" />
                                        </EmptyMedia>
                                        <EmptyTitle>
                                            Aucune séance commencée
                                        </EmptyTitle>
                                        <EmptyDescription>
                                            Tes présences apparaîtront ici après
                                            le premier appel.
                                        </EmptyDescription>
                                    </EmptyHeader>
                                </Empty>
                            ) : (
                                <StudentAttendanceTable
                                    sessions={startedSessions}
                                    attendances={attendanceBySession}
                                    formatDate={format}
                                />
                            )}
                        </section>
                    ) : (
                        <Empty className="border">
                            <EmptyHeader>
                                <EmptyMedia variant="icon">
                                    <ClipboardCheck aria-hidden="true" />
                                </EmptyMedia>
                                <EmptyTitle>Présences indisponibles</EmptyTitle>
                                <EmptyDescription>
                                    Tes présences apparaîtront ici une fois ton
                                    inscription confirmée.
                                </EmptyDescription>
                            </EmptyHeader>
                        </Empty>
                    )}
                </TabsContent>

                <TabsContent value="manuals" className="flex flex-col gap-4">
                    {openManual ? (
                        <>
                            <div className="flex flex-wrap items-center justify-between gap-3">
                                <div className="flex items-center gap-3">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setOpenManual(null)}
                                    >
                                        <ArrowLeft data-icon="inline-start" />
                                        Retour aux manuels
                                    </Button>
                                    <h2 className="font-semibold">
                                        {openManual.type === "kursbuch"
                                            ? "Kursbuch"
                                            : "Arbeitsbuch"}{" "}
                                        · {cohort.level.toUpperCase()}.
                                        {openManual.part}
                                    </h2>
                                </div>
                            </div>
                            <iframe
                                src={showManual.url({
                                    enrollment: enrollment.id,
                                    manual: openManual.id,
                                })}
                                title="Manuel PDF"
                                className="h-[calc(100vh-12rem)] min-h-[32rem] w-full rounded-lg border border-border"
                            />
                        </>
                    ) : (
                        <>
                            <div>
                                <h2 className="font-semibold">
                                    Manuels du parcours
                                </h2>
                                <p className="text-sm text-muted-foreground">
                                    Retrouve ici les livres mis à disposition
                                    pour ton groupe.
                                </p>
                            </div>
                            {manuals.length === 0 ? (
                                <Empty className="border">
                                    <EmptyHeader>
                                        <EmptyMedia variant="icon">
                                            <BookOpen aria-hidden="true" />
                                        </EmptyMedia>
                                        <EmptyTitle>
                                            Aucun manuel disponible
                                        </EmptyTitle>
                                        <EmptyDescription>
                                            Les manuels apparaîtront ici
                                            lorsqu’ils seront disponibles pour
                                            ton parcours.
                                        </EmptyDescription>
                                    </EmptyHeader>
                                </Empty>
                            ) : (
                                <div className="grid gap-4 sm:grid-cols-2">
                                    {manuals.map((manual) => (
                                        <div
                                            key={manual.id}
                                            className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border p-5"
                                        >
                                            <div>
                                                <h3 className="font-medium">
                                                    {manual.type === "kursbuch"
                                                        ? "Kursbuch"
                                                        : "Arbeitsbuch"}{" "}
                                                    ·{" "}
                                                    {cohort.level.toUpperCase()}
                                                    .{manual.part}
                                                </h3>
                                                <p className="text-sm text-muted-foreground">
                                                    Document PDF
                                                </p>
                                            </div>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() =>
                                                    setOpenManual(manual)
                                                }
                                            >
                                                Ouvrir le PDF
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                </TabsContent>

                <TabsContent value="planning" className="flex flex-col gap-6">
                    {sessions.length > 0 ? (
                        <section className="flex flex-col gap-3">
                            <div className="flex items-center justify-between gap-3">
                                <h2 className="text-xl font-semibold">
                                    Planning
                                </h2>
                                <Badge variant="outline">
                                    {sessions.length} séances
                                </Badge>
                            </div>
                            <CoursePlanningCalendar
                                sessions={sessions}
                                defaultMeetingUrl={
                                    enrollment.meeting_url ?? null
                                }
                                canJoin={
                                    confirmed &&
                                    !cohort.cancelled_at &&
                                    new Date(cohort.ends_at).getTime() > now
                                }
                                selfAttendances={enrollment.attendances ?? []}
                            />
                        </section>
                    ) : (
                        <p className="rounded-lg border border-dashed border-border px-5 py-4 text-sm text-muted-foreground">
                            Le planning sera publié prochainement.
                        </p>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    );
}

function StudentAttendanceTable({
    sessions,
    attendances,
    formatDate,
}: {
    sessions: CourseSession[];
    attendances: Map<number, CourseAttendanceStatus>;
    formatDate: (value: string, options: Intl.DateTimeFormatOptions) => string;
}) {
    const columns: ColumnDef<CourseSession>[] = [
        {
            accessorKey: "position",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Séance" />
            ),
            cell: ({ row }) => (
                <span className="font-medium">
                    Séance {row.original.position}
                </span>
            ),
            meta: { label: "Séance" },
        },
        {
            accessorKey: "starts_at",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Date" />
            ),
            cell: ({ row }) =>
                formatDate(row.original.starts_at, { dateStyle: "long" }),
            meta: { label: "Date" },
        },
        {
            id: "time",
            accessorFn: (session) => session.starts_at,
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Heure" />
            ),
            cell: ({ row }) =>
                formatDate(row.original.starts_at, { timeStyle: "short" }),
            meta: { label: "Heure" },
        },
        {
            accessorKey: "duration_minutes",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Durée" />
            ),
            cell: ({ row }) =>
                `${new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 2 }).format(row.original.duration_minutes / 60)} h`,
            meta: { label: "Durée" },
        },
        {
            id: "status",
            accessorFn: (session) => attendances.get(session.id) ?? "pending",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Présence" />
            ),
            cell: ({ row }) => {
                const status = attendances.get(row.original.id);
                return (
                    <Badge
                        variant={
                            status === "absent"
                                ? "destructive"
                                : status
                                  ? "outline"
                                  : "secondary"
                        }
                    >
                        {status
                            ? attendanceStatusLabels[status]
                            : "Appel en attente"}
                    </Badge>
                );
            },
            filterFn: (row, id, value: string[]) =>
                value.includes(String(row.getValue(id))),
            meta: { label: "Présence" },
        },
    ];

    return (
        <DataTable
            columns={columns}
            data={sessions}
            facetedFilters={[
                {
                    columnId: "status",
                    title: "Présence",
                    options: [
                        {
                            value: "present",
                            label: attendanceStatusLabels.present,
                        },
                        {
                            value: "absent",
                            label: attendanceStatusLabels.absent,
                        },
                        {
                            value: "excused",
                            label: attendanceStatusLabels.excused,
                        },
                        { value: "pending", label: "Appel en attente" },
                    ],
                },
            ]}
        />
    );
}

function SinglePaymentTable({
    enrollment,
    formatDate,
}: {
    enrollment: CourseEnrollment;
    formatDate: (value: string, options: Intl.DateTimeFormatOptions) => string;
}) {
    const columns: ColumnDef<CourseEnrollment>[] = [
        {
            id: "payment",
            header: "Paiement",
            cell: () => (
                <span className="font-medium">Paiement en une fois</span>
            ),
            meta: { label: "Paiement" },
        },
        {
            accessorKey: "amount_cents",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Montant" />
            ),
            cell: ({ row }) =>
                formatCoursePrice(
                    row.original.amount_cents,
                    row.original.currency,
                ),
            meta: { label: "Montant" },
        },
        {
            accessorKey: "payment_method",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Mode" />
            ),
            cell: ({ row }) => paymentMethodLabels[row.original.payment_method],
            meta: { label: "Mode" },
        },
        {
            accessorKey: "paid_at",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Date" />
            ),
            cell: ({ row }) =>
                row.original.paid_at
                    ? formatDate(row.original.paid_at, { dateStyle: "long" })
                    : "—",
            meta: { label: "Date" },
        },
        {
            id: "status",
            header: "Statut",
            cell: ({ row }) => (
                <Badge variant={row.original.paid_at ? "default" : "secondary"}>
                    {row.original.payment_method === "offer"
                        ? "Offert"
                        : row.original.paid_at
                          ? "Payé"
                          : row.original.status === "processing" ||
                              row.original.status === "payment_review"
                            ? "En vérification"
                            : "Non payé"}
                </Badge>
            ),
            meta: { label: "Statut" },
        },
        {
            accessorKey: "refunded_cents",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Remboursement" />
            ),
            cell: ({ row }) =>
                row.original.refunded_cents > 0
                    ? formatCoursePrice(
                          row.original.refunded_cents,
                          row.original.currency,
                      )
                    : "—",
            meta: { label: "Remboursement" },
        },
    ];

    return <DataTable columns={columns} data={[enrollment]} />;
}

const installmentLabels: Record<CourseInstallment["status"], string> = {
    scheduled: "À venir",
    failed: "Échec du prélèvement",
    paid: "Réglée",
    cancelled: "Annulée",
};

const installmentVariants: Record<
    CourseInstallment["status"],
    "default" | "secondary" | "outline" | "destructive"
> = {
    scheduled: "secondary",
    failed: "destructive",
    paid: "default",
    cancelled: "outline",
};

function InstallmentSchedule({ enrollment }: { enrollment: CourseEnrollment }) {
    const timezone = useUserTimezone();
    const [payingId, setPayingId] = useState<number | null>(null);
    const installments = enrollment.installments ?? [];
    const date = (value: string) =>
        new Intl.DateTimeFormat("fr-FR", {
            timeZone: timezone,
            dateStyle: "long",
        }).format(new Date(value));
    const failed = installments.find((item) => item.status === "failed");
    const columns: ColumnDef<CourseInstallment>[] = [
        {
            accessorKey: "position",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Échéance" />
            ),
            cell: ({ row }) => (
                <span className="font-medium">
                    Échéance {row.original.position}
                </span>
            ),
            meta: { label: "Échéance" },
        },
        {
            accessorKey: "amount_cents",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Montant" />
            ),
            cell: ({ row }) =>
                formatCoursePrice(
                    row.original.amount_cents,
                    enrollment.currency,
                ),
            meta: { label: "Montant" },
        },
        {
            accessorKey: "due_at",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Date" />
            ),
            cell: ({ row }) =>
                row.original.paid_at
                    ? `Réglée le ${date(row.original.paid_at)}`
                    : `Prévue le ${date(row.original.due_at)}`,
            meta: { label: "Date" },
        },
        {
            accessorKey: "status",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Statut" />
            ),
            cell: ({ row }) => (
                <Badge variant={installmentVariants[row.original.status]}>
                    {installmentLabels[row.original.status]}
                </Badge>
            ),
            filterFn: (row, id, value: string[]) =>
                value.includes(String(row.getValue(id))),
            meta: { label: "Statut" },
        },
        {
            id: "actions",
            header: () => <span className="sr-only">Actions</span>,
            cell: ({ row }) => {
                const installment = row.original;
                return installment.can_pay ? (
                    <Button
                        size="sm"
                        disabled={payingId !== null}
                        onClick={() =>
                            router.post(
                                installmentCheckout.url(installment.id),
                                {},
                                {
                                    onStart: () => setPayingId(installment.id),
                                    onFinish: () => setPayingId(null),
                                },
                            )
                        }
                    >
                        {payingId === installment.id && (
                            <Spinner data-icon="inline-start" />
                        )}
                        Régler maintenant
                    </Button>
                ) : null;
            },
            enableSorting: false,
            enableHiding: false,
            meta: { label: "Actions" },
        },
    ];

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
                            : "Règle-la dès maintenant pour garder ta place dans le groupe."}
                    </AlertDescription>
                </Alert>
            )}
            <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between gap-3">
                    <h3 className="font-medium">Échéancier</h3>
                    <span className="text-sm text-muted-foreground">
                        Total{" "}
                        {formatCoursePrice(
                            enrollment.amount_cents,
                            enrollment.currency,
                        )}
                    </span>
                </div>
                <DataTable
                    columns={columns}
                    data={installments}
                    facetedFilters={[
                        {
                            columnId: "status",
                            title: "Statut",
                            options: (
                                [
                                    "scheduled",
                                    "failed",
                                    "paid",
                                    "cancelled",
                                ] as CourseInstallment["status"][]
                            ).map((status) => ({
                                value: status,
                                label: installmentLabels[status],
                            })),
                        },
                    ]}
                />
            </div>
        </div>
    );
}
