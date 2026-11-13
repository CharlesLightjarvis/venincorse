import { Head, Link } from '@inertiajs/react';
import type { ColumnDef } from '@tanstack/react-table';
import { Clock, Users, UserCheck, Warning } from 'reicon-react';
import { CourseEnrollmentDialog } from '@/components/course-enrollment-dialog';
import { DataTable } from '@/components/data-table';
import { DataTableColumnHeader } from '@/components/data-table-column-header';
import {
    ManualEnrollmentDialog,
    type ManualEnrollmentCohort,
} from '@/components/manual-enrollment-dialog';
import { Badge } from '@/components/ui/badge';
import { TrialInfoCard } from '@/components/trial-info-card';
import { useUserTimezone } from '@/hooks/use-browser-timezone';
import {
    enrollmentStatusLabels,
    enrollmentStatusVariant,
    formatCoursePrice,
    paymentMethodLabels,
    summarizeAttendance,
    type CourseEnrollment,
} from '@/lib/course-cohorts';
import { index } from '@/routes/course-enrollment-management';
import { show as showCohort } from '@/routes/course-cohorts';

type PaymentState = 'paid' | 'unpaid' | 'failed';

const paymentStateLabels: Record<PaymentState, string> = {
    paid: 'Payé',
    unpaid: 'Impayé',
    failed: 'Échéance en échec',
};

function paymentStates(enrollment: CourseEnrollment): PaymentState[] {
    const states: PaymentState[] = [
        enrollment.paid_at ? 'paid' : 'unpaid',
    ];

    if (
        enrollment.installments?.some(
            (installment) => installment.status === 'failed',
        )
    ) {
        states.push('failed');
    }

    return states;
}

export default function ManageCourseEnrollments({
    enrollments,
    cohorts,
}: {
    enrollments: CourseEnrollment[];
    cohorts: ManualEnrollmentCohort[];
}) {
    const timezone = useUserTimezone();
    const format = (value: string, options: Intl.DateTimeFormatOptions) =>
        new Intl.DateTimeFormat('fr-FR', {
            timeZone: timezone,
            ...options,
        }).format(new Date(value));
    const confirmed = enrollments.filter(
        (enrollment) => enrollment.status === 'confirmed',
    ).length;
    const unpaid = enrollments.filter(
        (enrollment) =>
            enrollment.paid_at === null &&
            !['cancelled', 'expired', 'refunded'].includes(enrollment.status),
    ).length;
    const failed = enrollments.filter((enrollment) =>
        enrollment.installments?.some(
            (installment) => installment.status === 'failed',
        ),
    ).length;

    const columns: ColumnDef<CourseEnrollment>[] = [
        {
            id: 'student',
            accessorFn: (enrollment) =>
                `${enrollment.student?.name ?? ''} ${enrollment.student?.email ?? ''}`,
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Élève" />
            ),
            cell: ({ row }) => (
                <div className="max-w-56">
                    <p className="truncate font-medium">
                        {row.original.student?.name}
                    </p>
                    <p className="truncate text-sm text-muted-foreground">
                        {row.original.student?.email}
                    </p>
                </div>
            ),
            meta: { label: 'Élève' },
        },
        {
            id: 'group',
            accessorFn: (enrollment) =>
                `${enrollment.cohort.level_label} ${enrollment.cohort.format_label} ${enrollment.cohort.rhythm_label}`,
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Groupe" />
            ),
            cell: ({ row }) => (
                <Link
                    href={showCohort(row.original.cohort.id)}
                    className="flex max-w-56 flex-col gap-1 hover:underline"
                >
                    <span className="font-medium">
                        {row.original.cohort.level_label}
                    </span>
                    <span className="text-sm text-muted-foreground">
                        {row.original.cohort.format_label} ·{' '}
                        {row.original.cohort.rhythm_label}
                    </span>
                </Link>
            ),
            meta: { label: 'Groupe' },
        },
        {
            id: 'status',
            accessorFn: (enrollment) => enrollment.status,
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Statut" />
            ),
            cell: ({ row }) => (
                <Badge variant={enrollmentStatusVariant[row.original.status]}>
                    {enrollmentStatusLabels[row.original.status]}
                </Badge>
            ),
            filterFn: (row, id, value: string[]) =>
                value.includes(String(row.getValue(id))),
            meta: { label: 'Statut' },
        },
        {
            id: 'payment',
            accessorFn: (enrollment) => paymentStates(enrollment),
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Paiement" />
            ),
            cell: ({ row }) => {
                const enrollment = row.original;
                const paidInstallments = (enrollment.installments ?? []).filter(
                    (installment) => installment.status === 'paid',
                ).length;
                const hasFailed = paymentStates(enrollment).includes('failed');

                return (
                    <div className="flex max-w-64 flex-col gap-1">
                        <span className="font-medium">
                            {formatCoursePrice(
                                enrollment.amount_cents,
                                enrollment.currency,
                            )}
                        </span>
                        <span className="text-xs text-muted-foreground">
                            {paymentMethodLabels[enrollment.payment_method]}
                            {enrollment.payment_reference
                                ? ` · ${enrollment.payment_reference}`
                                : ''}
                        </span>
                        <span className="text-xs text-muted-foreground">
                            {enrollment.paid_at
                                ? `Payé le ${format(enrollment.paid_at, {
                                      day: 'numeric',
                                      month: 'short',
                                      year: 'numeric',
                                  })}`
                                : 'Non payé'}
                            {enrollment.payment_plan === 'installments' &&
                            enrollment.installments?.length
                                ? ` · ${paidInstallments}/${enrollment.installments.length} échéances`
                                : ''}
                        </span>
                        {hasFailed && (
                            <span className="text-xs font-medium text-destructive">
                                Échéance en échec
                            </span>
                        )}
                    </div>
                );
            },
            filterFn: (row, id, value: string[]) => {
                const states = row.getValue<PaymentState[]>(id);

                return value.some((state) =>
                    states.includes(state as PaymentState),
                );
            },
            enableSorting: false,
            meta: { label: 'Paiement' },
        },
        {
            id: 'attendance',
            accessorFn: (enrollment) => {
                const records = (enrollment.attendances ?? []).filter(
                    (record) =>
                        record.session && record.session.cancelled_at === null,
                );

                return summarizeAttendance(records).rate;
            },
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Assiduité" />
            ),
            cell: ({ row }) => {
                const records = (row.original.attendances ?? []).filter(
                    (record) =>
                        record.session && record.session.cancelled_at === null,
                );
                const attendance = summarizeAttendance(records);

                if (attendance.total === 0) {
                    return (
                        <span className="text-sm text-muted-foreground">
                            Aucun appel
                        </span>
                    );
                }

                return (
                    <div className="flex flex-col gap-1">
                        <span className="font-medium">
                            {attendance.rate} % de présence
                        </span>
                        <span className="text-xs text-muted-foreground">
                            {attendance.present} présent
                            {attendance.present > 1 ? 's' : ''} ·{' '}
                            {attendance.absent} absent
                            {attendance.absent > 1 ? 's' : ''} sur{' '}
                            {attendance.total} séance
                            {attendance.total > 1 ? 's' : ''}
                        </span>
                    </div>
                );
            },
            meta: { label: 'Assiduité' },
        },
        {
            accessorKey: 'created_at',
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Inscription" />
            ),
            cell: ({ row }) =>
                format(row.original.created_at, {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                }),
            meta: { label: 'Inscription' },
        },
        {
            id: 'actions',
            header: () => <span className="sr-only">Actions</span>,
            cell: ({ row }) => (
                <CourseEnrollmentDialog enrollment={row.original} />
            ),
            enableSorting: false,
            enableHiding: false,
            meta: { label: 'Actions' },
        },
    ];

    return (
        <div className="flex h-full flex-1 flex-col gap-6 p-4">
            <Head title="Inscriptions aux parcours" />
            <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-semibold">
                        Inscriptions aux parcours
                    </h1>
                    <p className="mt-3 text-muted-foreground">
                        Toutes les inscriptions, tous groupes et tous statuts
                        confondus. Recherche un élève, repère les impayés et
                        ouvre sa fiche pour gérer son inscription.
                    </p>
                </div>
                <ManualEnrollmentDialog cohorts={cohorts} />
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <TrialInfoCard
                    icon={Users}
                    label="Inscriptions"
                    value={String(enrollments.length)}
                    caption="Tous groupes confondus"
                />
                <TrialInfoCard
                    icon={UserCheck}
                    label="Inscrits confirmés"
                    value={String(confirmed)}
                    caption="Places actives dans un groupe"
                />
                <TrialInfoCard
                    icon={Clock}
                    label="Impayés"
                    value={String(unpaid)}
                    caption="Paiement non encore reçu"
                />
                <TrialInfoCard
                    icon={Warning}
                    label="Échéances en échec"
                    value={String(failed)}
                    caption="Prélèvements à relancer"
                />
            </div>

            <DataTable
                columns={columns}
                data={enrollments}
                searchFilter={{
                    columnIds: ['student', 'group'],
                    placeholder: 'Rechercher un élève ou un groupe…',
                }}
                facetedFilters={[
                    {
                        columnId: 'status',
                        title: 'Statut',
                        options: (
                            [
                                'confirmed',
                                'pending',
                                'processing',
                                'payment_review',
                                'refunded',
                                'cancelled',
                                'expired',
                            ] as CourseEnrollment['status'][]
                        ).map((status) => ({
                            value: status,
                            label: enrollmentStatusLabels[status],
                        })),
                    },
                    {
                        columnId: 'payment',
                        title: 'Paiement',
                        options: (
                            ['unpaid', 'failed', 'paid'] as PaymentState[]
                        ).map((state) => ({
                            value: state,
                            label: paymentStateLabels[state],
                        })),
                    },
                ]}
            />
        </div>
    );
}

ManageCourseEnrollments.layout = {
    breadcrumbs: [{ title: 'Inscriptions aux parcours', href: index() }],
};
