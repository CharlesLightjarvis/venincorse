import type { ColumnDef } from '@tanstack/react-table';
import type { ReactNode } from 'react';
import { DataTable } from '@/components/data-table';
import { DataTableColumnHeader } from '@/components/data-table-column-header';
import { Badge } from '@/components/ui/badge';
import {
    enrollmentStatusLabels,
    enrollmentStatusVariant,
    formatCoursePrice,
    paymentMethodLabels,
    summarizeAttendance,
    type CourseEnrollment,
} from '@/lib/course-cohorts';

type StudentsTableProps = {
    enrollments: CourseEnrollment[];
    formatDate: (value: string, options: Intl.DateTimeFormatOptions) => string;
    renderActions: (enrollment: CourseEnrollment) => ReactNode;
};

/** The group's enrollments, searchable by student and filterable by status. */
export function StudentsTable({
    enrollments,
    formatDate,
    renderActions,
}: StudentsTableProps) {
    const paymentLabel = (enrollment: CourseEnrollment): string => {
        if (
            enrollment.payment_plan === 'installments' &&
            enrollment.installments?.length
        ) {
            const paid = enrollment.installments.filter(
                (installment) => installment.status === 'paid',
            ).length;

            return `${paid}/${enrollment.installments.length} échéances réglées`;
        }

        return enrollment.paid_at
            ? `Payé le ${formatDate(enrollment.paid_at, {
                  day: 'numeric',
                  month: 'short',
              })}`
            : 'Non payé';
    };

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
            accessorKey: 'goal',
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Objectif" />
            ),
            cell: ({ row }) => (
                <p className="line-clamp-2 max-w-md text-sm whitespace-normal text-muted-foreground">
                    {row.original.goal || '—'}
                </p>
            ),
            meta: { label: 'Objectif' },
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
            accessorFn: (enrollment) => [
                enrollment.paid_at ? 'paid' : 'unpaid',
                ...(enrollment.installments?.some(
                    (installment) => installment.status === 'failed',
                ) ? ['failed'] : []),
            ],
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Paiement" />
            ),
            cell: ({ row }) => (
                <div className="flex flex-col gap-1">
                    <span className="text-sm whitespace-normal">
                        {paymentLabel(row.original)}
                    </span>
                    <span className="text-xs text-muted-foreground">
                        {paymentMethodLabels[row.original.payment_method]}
                        {row.original.payment_reference
                            ? ` · ${row.original.payment_reference}`
                            : ''}
                    </span>
                    <span className="text-xs text-muted-foreground">
                        {formatCoursePrice(
                            row.original.amount_cents,
                            row.original.currency,
                        )}
                        {row.original.payment_plan === 'installments'
                            ? ' · en plusieurs fois'
                            : ' · en une fois'}
                    </span>
                    {row.original.installments?.some(
                        (installment) => installment.status === 'failed',
                    ) && (
                        <span className="text-xs font-medium text-destructive">
                            Échéance impayée
                        </span>
                    )}
                </div>
            ),
            filterFn: (row, id, values: string[]) =>
                values.some((value) => row.getValue<string[]>(id).includes(value)),
            enableSorting: false,
            meta: { label: 'Paiement' },
        },
        {
            id: 'attendance',
            header: 'Assiduité',
            cell: ({ row }) => {
                const records = (row.original.attendances ?? []).filter(
                    (record) => record.session && record.session.cancelled_at === null,
                );
                const attendance = summarizeAttendance(records);

                return attendance.total > 0
                    ? `${attendance.rate} % de présence`
                    : 'Aucun appel';
            },
            meta: { label: 'Assiduité' },
        },
        {
            id: 'actions',
            header: () => <span className="sr-only">Actions</span>,
            cell: ({ row }) => renderActions(row.original),
            enableSorting: false,
            enableHiding: false,
            meta: { label: 'Actions' },
        },
    ];

    return (
        <DataTable
            columns={columns}
            data={enrollments}
            searchFilter={{
                columnIds: ['student', 'goal'],
                placeholder: 'Rechercher un élève…',
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
                    options: [
                        { value: 'paid', label: 'Payé' },
                        { value: 'unpaid', label: 'Impayé' },
                        { value: 'failed', label: 'Échéance en échec' },
                    ],
                },
            ]}
        />
    );
}
