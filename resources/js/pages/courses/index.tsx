import { Head } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { allCourses } from './courses-data';
import { CourseCard } from './partials/course-card';
import { CoursesHeader, type CourseFilters } from './partials/courses-header';

const coursesPerPage = 6;
const initialFilters: CourseFilters = {
    categories: [],
    niveaux: [],
    statut: '',
};

const monthNumbers: Record<string, number> = {
    janvier: 1,
    février: 2,
    mars: 3,
    avril: 4,
    mai: 5,
    juin: 6,
    juillet: 7,
    août: 8,
    septembre: 9,
    octobre: 10,
    novembre: 11,
    décembre: 12,
};

function courseStartTime(date: string): number {
    const [day, month, year] = date.toLowerCase().split(' ');

    return new Date(
        Number(year),
        (monthNumbers[month] ?? 1) - 1,
        Number(day),
    ).getTime();
}

export default function Courses() {
    const [filters, setFilters] = useState<CourseFilters>(initialFilters);
    const [search, setSearch] = useState('');
    const [sort, setSort] = useState('date-asc');
    const [page, setPage] = useState(1);

    const filteredCourses = useMemo(() => {
        const query = search.trim().toLocaleLowerCase('fr');
        const result = allCourses.filter((course) => {
            const matchesCategory =
                filters.categories.length === 0 ||
                filters.categories.includes(course.type);
            const matchesLevel =
                filters.niveaux.length === 0 ||
                course.niveaux.some((level) =>
                    filters.niveaux.some((selected) =>
                        level.startsWith(selected),
                    ),
                );
            const matchesStatus =
                !filters.statut || course.status === filters.statut;
            const matchesSearch =
                !query ||
                [
                    course.titre,
                    course.description,
                    course.type,
                    ...course.niveaux,
                ]
                    .join(' ')
                    .toLocaleLowerCase('fr')
                    .includes(query);

            return (
                matchesCategory &&
                matchesLevel &&
                matchesStatus &&
                matchesSearch
            );
        });

        if (sort === 'date-desc') {
            result.sort(
                (a, b) =>
                    courseStartTime(b.dateDebut) - courseStartTime(a.dateDebut),
            );
        } else if (sort === 'places-asc') {
            result.sort((a, b) => a.placesRestantes - b.placesRestantes);
        } else if (sort === 'popularite') {
            result.sort(
                (a, b) =>
                    Number(Boolean(b.featured)) - Number(Boolean(a.featured)),
            );
        } else {
            result.sort(
                (a, b) =>
                    courseStartTime(a.dateDebut) - courseStartTime(b.dateDebut),
            );
        }

        return result;
    }, [filters, search, sort]);

    const totalPages = Math.ceil(filteredCourses.length / coursesPerPage);
    const visibleCourses = filteredCourses.slice(
        (page - 1) * coursesPerPage,
        page * coursesPerPage,
    );

    return (
        <div className="relative min-h-screen py-16 md:py-24">
            <Head title="Cours d'allemand" />

            <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <div className="absolute top-0 right-1/4 h-[420px] w-[420px] rounded-full bg-primary/[0.04] blur-[150px] dark:bg-primary/[0.07]" />
            </div>

            <div className="relative w-full px-4 md:px-6 lg:px-10">
                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7 }}
                    className="mx-auto mb-12 max-w-2xl text-center"
                >
                    <div className="mb-5 inline-flex items-center rounded-full border border-border/40 bg-secondary px-4 py-2 text-xs font-semibold tracking-[0.25em] text-secondary-foreground uppercase dark:border-border/60">
                        Catalogue
                    </div>
                    <h1 className="mb-4 text-3xl font-semibold tracking-tight text-foreground md:text-5xl">
                        Choisis ton cours d'allemand
                    </h1>
                    <p className="text-lg text-foreground/60">
                        De A1.1 à B2.2 — du parcours standard aux ateliers
                        ciblés : chaque cours indique son niveau, son format et
                        son tarif.
                    </p>
                </motion.div>

                <CoursesHeader
                    search={search}
                    onSearch={(value) => {
                        setSearch(value);
                        setPage(1);
                    }}
                    sort={sort}
                    onSort={(value) => {
                        setSort(value);
                        setPage(1);
                    }}
                    filters={filters}
                    onFilters={(value) => {
                        setFilters(value);
                        setPage(1);
                    }}
                />

                {visibleCourses.length > 0 ? (
                    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                        {visibleCourses.map((course, index) => (
                            <CourseCard
                                key={course.slug}
                                course={course}
                                index={index}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="rounded-2xl border border-border/40 bg-background/60 py-20 text-center">
                        <p className="text-lg font-medium text-foreground/60">
                            Aucun cours trouvé
                        </p>
                        <p className="mt-1 text-sm text-foreground/40">
                            Essaie un autre mot-clé ou modifie les filtres.
                        </p>
                    </div>
                )}

                {totalPages > 1 && (
                    <nav
                        aria-label="Pagination des cours"
                        className="mt-10 flex items-center justify-center gap-2"
                    >
                        <Button
                            variant="outline"
                            size="icon"
                            aria-label="Page précédente"
                            disabled={page === 1}
                            onClick={() => setPage((current) => current - 1)}
                        >
                            <ChevronLeft
                                className="h-4 w-4"
                                aria-hidden="true"
                            />
                        </Button>
                        {Array.from(
                            { length: totalPages },
                            (_, index) => index + 1,
                        ).map((number) => (
                            <Button
                                key={number}
                                variant={
                                    page === number ? 'default' : 'outline'
                                }
                                size="icon"
                                aria-label={`Page ${number}`}
                                aria-current={
                                    page === number ? 'page' : undefined
                                }
                                onClick={() => setPage(number)}
                            >
                                {number}
                            </Button>
                        ))}
                        <Button
                            variant="outline"
                            size="icon"
                            aria-label="Page suivante"
                            disabled={page === totalPages}
                            onClick={() => setPage((current) => current + 1)}
                        >
                            <ChevronRight
                                className="h-4 w-4"
                                aria-hidden="true"
                            />
                        </Button>
                    </nav>
                )}
            </div>
        </div>
    );
}
