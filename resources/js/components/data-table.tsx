import {
    flexRender,
    getCoreRowModel,
    getFacetedRowModel,
    getFacetedUniqueValues,
    getFilteredRowModel,
    getExpandedRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
} from '@tanstack/react-table';
import type {
    ColumnDef,
    ColumnFiltersState,
    Row,
    SortingState,
    VisibilityState,
} from '@tanstack/react-table';
import * as React from 'react';
import { cn } from '@/lib/utils';

import { DataTablePagination } from './data-table-pagination';
import { DataTableToolbar } from './data-table-toolbar';
import type {
    SearchFilterConfig,
    FacetedFilterConfig,
    ActionButtonConfig,
} from './data-table-toolbar';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from './ui/table';

interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[];
    data: TData[];
    searchFilter?: SearchFilterConfig;
    facetedFilters?: FacetedFilterConfig[];
    actionButton?: ActionButtonConfig;
    enablePagination?: boolean;
    renderSubComponent?: (props: { row: Row<TData> }) => React.ReactNode;
    onRowClick?: (row: Row<TData>) => void;
}

export function DataTable<TData, TValue>({
    columns,
    data,
    searchFilter,
    facetedFilters,
    actionButton,
    enablePagination = true,
    renderSubComponent,
    onRowClick,
}: DataTableProps<TData, TValue>) {
    const [rowSelection, setRowSelection] = React.useState({});
    const [columnVisibility, setColumnVisibility] =
        React.useState<VisibilityState>({});
    const [columnFilters, setColumnFilters] =
        React.useState<ColumnFiltersState>([]);
    const [sorting, setSorting] = React.useState<SortingState>([]);
    const [globalFilter, setGlobalFilter] = React.useState('');

    // Keep a ref so the globalFilterFn closure always reads the latest columnIds
    const searchColumnIdsRef = React.useRef<string[]>(
        searchFilter?.columnIds ?? [],
    );
    searchColumnIdsRef.current = searchFilter?.columnIds ?? [];

    const table = useReactTable({
        data,
        columns,
        state: {
            sorting,
            columnVisibility,
            rowSelection,
            columnFilters,
            globalFilter,
        },
        initialState: {
            pagination: {
                pageSize: 10,
            },
        },
        enableRowSelection: true,
        onRowSelectionChange: setRowSelection,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        onColumnVisibilityChange: setColumnVisibility,
        onGlobalFilterChange: setGlobalFilter,
        // OR logic: row passes if ANY of the specified columnIds matches
        globalFilterFn: (row, columnId, value) => {
            const ids = searchColumnIdsRef.current;

            if (!value || ids.length === 0) {
                return true;
            }

            if (!ids.includes(columnId)) {
                return false;
            }

            const search = String(value).toLowerCase();

            return String(row.getValue(columnId) ?? '')
                .toLowerCase()
                .includes(search);
        },
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: enablePagination
            ? getPaginationRowModel()
            : undefined,
        getSortedRowModel: getSortedRowModel(),
        getFacetedRowModel: getFacetedRowModel(),
        getFacetedUniqueValues: getFacetedUniqueValues(),
        getExpandedRowModel: getExpandedRowModel(),
        getRowCanExpand: renderSubComponent ? () => true : undefined,
        paginateExpandedRows: false,
    });

    return (
        <div className="flex flex-col gap-4">
            <DataTableToolbar
                table={table}
                searchFilter={searchFilter}
                facetedFilters={facetedFilters}
                actionButton={actionButton}
            />
            <div className="overflow-hidden rounded-md border">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => {
                                    return (
                                        <TableHead
                                            key={header.id}
                                            colSpan={header.colSpan}
                                        >
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(
                                                      header.column.columnDef
                                                          .header,
                                                      header.getContext(),
                                                  )}
                                        </TableHead>
                                    );
                                })}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <React.Fragment key={row.id}>
                                    <TableRow
                                        data-state={
                                            row.getIsSelected() && 'selected'
                                        }
                                        className={cn(
                                            onRowClick &&
                                                'cursor-pointer focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none',
                                        )}
                                        tabIndex={onRowClick ? 0 : undefined}
                                        onClick={() => onRowClick?.(row)}
                                        onKeyDown={(event) => {
                                            if (
                                                onRowClick &&
                                                (event.key === 'Enter' ||
                                                    event.key === ' ')
                                            ) {
                                                event.preventDefault();
                                                onRowClick(row);
                                            }
                                        }}
                                    >
                                        {row.getVisibleCells().map((cell) => (
                                            <TableCell key={cell.id}>
                                                {flexRender(
                                                    cell.column.columnDef.cell,
                                                    cell.getContext(),
                                                )}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                    {row.getIsExpanded() &&
                                        renderSubComponent && (
                                            <TableRow>
                                                <TableCell
                                                    colSpan={
                                                        row.getVisibleCells()
                                                            .length
                                                    }
                                                    className="bg-muted/30 p-0"
                                                >
                                                    {renderSubComponent({
                                                        row,
                                                    })}
                                                </TableCell>
                                            </TableRow>
                                        )}
                                </React.Fragment>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell
                                    colSpan={columns.length}
                                    className="h-24 text-center"
                                >
                                    Aucun résultat.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
            {enablePagination && <DataTablePagination table={table} />}
        </div>
    );
}
