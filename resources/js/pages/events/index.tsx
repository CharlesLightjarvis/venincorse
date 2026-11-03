import { useState, useMemo } from 'react';
import { EventCard } from './partials/event-card';
import { EventsHeader, type EventFilters } from './partials/events-header';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { allEvents } from './events-data';
import { Button } from '@/components/ui/button';

const PER_PAGE = 6;

const defaultFilters: EventFilters = { types: [], pays: [], statut: '' };

const mois: Record<string, number> = {
    janvier: 1, février: 2, mars: 3, avril: 4, mai: 5, juin: 6,
    juillet: 7, août: 8, septembre: 9, octobre: 10, novembre: 11, décembre: 12,
};

function parseFrenchDate(dateStr: string): number {
    const parts = dateStr.toLowerCase().split(' ');
    const day = parseInt(parts[0] ?? '1');
    const month = mois[parts[1] ?? ''] ?? 1;
    const year = parseInt(parts[2] ?? '2026');
    return new Date(year, month - 1, day).getTime();
}

export default function Events() {
    const [filters, setFilters] = useState<EventFilters>(defaultFilters);
    const [search, setSearch] = useState('');
    const [sort, setSort] = useState('date-asc');
    const [page, setPage] = useState(1);

    const filtered = useMemo(() => {
        let list = [...allEvents];

        if (filters.types.length)
            list = list.filter((e) => filters.types.includes(e.type));
        if (filters.pays.length)
            list = list.filter((e) => filters.pays.includes(e.pays));
        if (filters.statut)
            list = list.filter((e) => e.status === filters.statut);
        if (search.trim())
            list = list.filter(
                (e) =>
                    e.titre.toLowerCase().includes(search.toLowerCase()) ||
                    e.ville.toLowerCase().includes(search.toLowerCase()) ||
                    e.pays.toLowerCase().includes(search.toLowerCase()),
            );

        if (sort === 'date-asc')
            list.sort(
                (a, b) =>
                    parseFrenchDate(a.dateDebut) -
                    parseFrenchDate(b.dateDebut),
            );
        if (sort === 'date-desc')
            list.sort(
                (a, b) =>
                    parseFrenchDate(b.dateDebut) -
                    parseFrenchDate(a.dateDebut),
            );
        if (sort === 'places-asc')
            list.sort((a, b) => a.placesRestantes - b.placesRestantes);

        return list;
    }, [filters, search, sort]);

    const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
    const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

    const handleFilters = (f: EventFilters) => {
        setFilters(f);
        setPage(1);
    };
    const handleSearch = (v: string) => {
        setSearch(v);
        setPage(1);
    };

    return (
        <div className="relative min-h-screen">
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <div className="absolute top-0 left-1/2 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-primary/[0.03] blur-[150px] dark:bg-primary/[0.06]" />
            </div>

            <div className="relative w-full px-4 py-10 md:px-6 lg:px-10">
                <EventsHeader
                    search={search}
                    onSearch={handleSearch}
                    sort={sort}
                    onSort={(v) => {
                        setSort(v);
                        setPage(1);
                    }}
                    filters={filters}
                    onFilters={handleFilters}
                    total={filtered.length}
                />

                {paginated.length > 0 ? (
                    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                        {paginated.map((event, i) => (
                            <EventCard key={event.id} event={event} index={i} />
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center rounded-2xl border border-border/40 bg-background/60 py-20 text-center backdrop-blur-sm">
                        <p className="text-lg font-medium text-foreground/60">
                            Aucun événement trouvé
                        </p>
                        <p className="mt-1 text-sm text-foreground/40">
                            Essayez de modifier vos filtres
                        </p>
                    </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="mt-10 flex items-center justify-center gap-2">
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className="border-border/40 bg-background/60 backdrop-blur-sm"
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </Button>

                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                            (p) => (
                                <Button
                                    key={p}
                                    variant={p === page ? 'default' : 'outline'}
                                    size="icon"
                                    onClick={() => setPage(p)}
                                    className={
                                        p !== page
                                            ? 'border-border/40 bg-background/60 backdrop-blur-sm'
                                            : ''
                                    }
                                >
                                    {p}
                                </Button>
                            ),
                        )}

                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() =>
                                setPage((p) => Math.min(totalPages, p + 1))
                            }
                            disabled={page === totalPages}
                            className="border-border/40 bg-background/60 backdrop-blur-sm"
                        >
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}
