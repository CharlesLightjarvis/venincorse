import type { ColumnDef } from '@tanstack/react-table';
import { UserCheck } from 'reicon-react';
import { DataTable } from '@/components/data-table';
import { DataTableColumnHeader } from '@/components/data-table-column-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { describeAttendance, type CourseSession } from '@/lib/course-cohorts';

type AttendanceTableProps = {
    sessions: CourseSession[];
    formatDate: (value: string, options: Intl.DateTimeFormatOptions) => string;
    onOpen: (session: CourseSession) => void;
};

/** The sessions that already started, with the state of their call. */
export function AttendanceTable({
    sessions,
    formatDate,
    onOpen,
}: AttendanceTableProps) {
    const durationLabel = (minutes: number): string =>
        `${new Intl.NumberFormat('fr-FR', {
            maximumFractionDigits: 2,
        }).format(minutes / 60)} h`;

    const columns: ColumnDef<CourseSession>[] = [
        {
            accessorKey: 'position',
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Séance" />
            ),
            cell: ({ row }) => (
                <span className="font-medium">
                    Séance {row.original.position}
                </span>
            ),
            meta: { label: 'Séance' },
        },
        {
            accessorKey: 'starts_at',
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Date" />
            ),
            cell: ({ row }) =>
                formatDate(row.original.starts_at, { dateStyle: 'long' }),
            meta: { label: 'Date' },
        },
        {
            id: 'starts_at_time',
            accessorFn: (session) => session.starts_at,
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Heure" />
            ),
            cell: ({ row }) =>
                formatDate(row.original.starts_at, { timeStyle: 'short' }),
            meta: { label: 'Heure' },
        },
        {
            accessorKey: 'duration_minutes',
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Durée" />
            ),
            cell: ({ row }) => durationLabel(row.original.duration_minutes),
            meta: { label: 'Durée' },
        },
        {
            id: 'call',
            accessorFn: (session) => session.attendances?.length ?? 0,
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Appel" />
            ),
            cell: ({ row }) => {
                const records = row.original.attendances ?? [];

                if (records.length === 0) {
                    return <Badge variant="secondary">Appel non fait</Badge>;
                }

                return (
                    <span className="text-sm text-muted-foreground">
                        {describeAttendance(records)}
                    </span>
                );
            },
            meta: { label: 'Appel' },
        },
        {
            id: 'actions',
            header: () => <span className="sr-only">Actions</span>,
            cell: ({ row }) => {
                const hasCall = (row.original.attendances?.length ?? 0) > 0;

                return (
                    <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={(event) => {
                            event.stopPropagation();
                            onOpen(row.original);
                        }}
                    >
                        <UserCheck data-icon="inline-start" />
                        {hasCall ? 'Modifier l’appel' : 'Faire l’appel'}
                    </Button>
                );
            },
            enableSorting: false,
            enableHiding: false,
            meta: { label: 'Actions' },
        },
    ];

    return (
        <DataTable
            columns={columns}
            data={sessions}
            onRowClick={(row) => onOpen(row.original)}
        />
    );
}
