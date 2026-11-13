import { Head, Link } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import { CalendarDays, Plus, Search, Users } from 'reicon-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Empty,
    EmptyContent,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
} from '@/components/ui/empty';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useUserTimezone } from '@/hooks/use-browser-timezone';
import {
    cohortState,
    cohortStateFilterLabels,
    cohortStateKey,
    formatCoursePrice,
    type CohortStateKey,
    type CourseCohort,
} from '@/lib/course-cohorts';
import { create, index, show } from '@/routes/course-cohorts';
import { index as manageManuals } from '@/routes/course-manual-management';

const stateOptions: { value: CohortStateKey | 'all'; label: string }[] = [
    { value: 'all', label: 'Tous les états' },
    ...(
        [
            'open',
            'closed',
            'running',
            'finished',
            'cancelled',
        ] as CohortStateKey[]
    ).map((state) => ({
        value: state,
        label: cohortStateFilterLabels[state],
    })),
];

export default function CourseCohorts({
    cohorts,
}: {
    cohorts: CourseCohort[];
}) {
    const timezone = useUserTimezone();
    const [search, setSearch] = useState('');
    const [state, setState] = useState<CohortStateKey | 'all'>('all');
    const filteredCohorts = useMemo(() => {
        const needle = search.trim().toLowerCase();

        return cohorts.filter((cohort) => {
            if (state !== 'all' && cohortStateKey(cohort) !== state) {
                return false;
            }
            if (needle === '') {
                return true;
            }

            return `${cohort.level_label} ${cohort.level} ${cohort.format_label} ${cohort.rhythm_label}`
                .toLowerCase()
                .includes(needle);
        });
    }, [cohorts, search, state]);
    const hasFilters = search !== '' || state !== 'all';
    const date = (value: string) =>
        new Intl.DateTimeFormat('fr-FR', {
            timeZone: timezone,
            weekday: 'short',
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        }).format(new Date(value));

    return (
        <div className="flex h-full flex-1 flex-col gap-6 p-4">
            <Head title="Groupes des parcours" />
            <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-semibold">
                        Groupes des parcours
                    </h1>
                    <p className="mt-3 text-muted-foreground">
                        Chaque groupe suit un niveau complet de 60 heures, à un
                        rythme et des horaires fixes. Les élèves s’inscrivent
                        aux groupes ouverts.
                    </p>
                </div>
                <div className="flex flex-wrap gap-2">
                    <Button variant="outline" asChild>
                        <Link href={manageManuals()}>Gérer les manuels</Link>
                    </Button>
                    <Button asChild>
                        <Link href={create()}>
                            <Plus data-icon="inline-start" />
                            Nouveau groupe
                        </Link>
                    </Button>
                </div>
            </div>

            {cohorts.length > 0 && (
                <div className="flex flex-col gap-3">
                    <div className="flex flex-wrap items-center gap-3">
                        <div className="relative w-full max-w-sm">
                            <Search
                                className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
                                aria-hidden="true"
                            />
                            <Input
                                value={search}
                                onChange={(event) =>
                                    setSearch(event.target.value)
                                }
                                placeholder="Rechercher un niveau, un format, un rythme…"
                                className="pl-9"
                                aria-label="Rechercher un groupe"
                            />
                        </div>
                        <Select
                            value={state}
                            onValueChange={(value) =>
                                setState(value as CohortStateKey | 'all')
                            }
                        >
                            <SelectTrigger
                                className="w-56"
                                aria-label="Filtrer par état"
                            >
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {stateOptions.map((option) => (
                                    <SelectItem
                                        key={option.value}
                                        value={option.value}
                                    >
                                        {option.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {hasFilters && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                    setSearch('');
                                    setState('all');
                                }}
                            >
                                Réinitialiser
                            </Button>
                        )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                        {filteredCohorts.length} groupe
                        {filteredCohorts.length > 1 ? 's' : ''} affiché
                        {filteredCohorts.length > 1 ? 's' : ''} sur{' '}
                        {cohorts.length}
                    </p>
                </div>
            )}

            {cohorts.length === 0 ? (
                <Empty className="border">
                    <EmptyHeader>
                        <EmptyMedia variant="icon">
                            <Users />
                        </EmptyMedia>
                        <EmptyTitle>Aucun groupe pour le moment</EmptyTitle>
                        <EmptyDescription>
                            Crée un premier groupe : niveau, rythme, date de
                            début et horaires. Le planning des 60 heures est
                            calculé automatiquement.
                        </EmptyDescription>
                    </EmptyHeader>
                    <EmptyContent>
                        <Button asChild>
                            <Link href={create()}>Créer un groupe</Link>
                        </Button>
                    </EmptyContent>
                </Empty>
            ) : filteredCohorts.length === 0 ? (
                <Empty className="border">
                    <EmptyHeader>
                        <EmptyMedia variant="icon">
                            <Search />
                        </EmptyMedia>
                        <EmptyTitle>Aucun groupe ne correspond</EmptyTitle>
                        <EmptyDescription>
                            Essaie un autre niveau, format ou rythme, ou change
                            l’état sélectionné.
                        </EmptyDescription>
                    </EmptyHeader>
                    <EmptyContent>
                        <Button
                            variant="outline"
                            onClick={() => {
                                setSearch('');
                                setState('all');
                            }}
                        >
                            Réinitialiser les filtres
                        </Button>
                    </EmptyContent>
                </Empty>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {filteredCohorts.map((cohort) => {
                        const state = cohortState(cohort);

                        return (
                            <Link
                                key={cohort.id}
                                href={show(cohort.id)}
                                className="flex flex-col gap-4 rounded-lg border border-border p-5 transition-colors hover:border-primary/40 hover:bg-muted/20"
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0">
                                        <p className="truncate font-semibold">
                                            {cohort.level_label}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            {cohort.format_label} ·{' '}
                                            {cohort.rhythm_label}
                                        </p>
                                    </div>
                                    <Badge
                                        variant={state.variant}
                                        className="shrink-0"
                                    >
                                        {state.label}
                                    </Badge>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <CalendarDays
                                        className="size-4"
                                        aria-hidden="true"
                                    />
                                    Du {date(cohort.starts_at)} au{' '}
                                    {date(cohort.ends_at)}
                                </div>
                                <div className="mt-auto flex items-center justify-between border-t border-border pt-3 text-sm">
                                    <span className="text-muted-foreground">
                                        {cohort.seats_left} / {cohort.capacity}{' '}
                                        place(s) libre(s)
                                    </span>
                                    <span className="font-medium">
                                        {formatCoursePrice(
                                            cohort.price_cents,
                                            cohort.currency,
                                        )}
                                    </span>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

CourseCohorts.layout = {
    breadcrumbs: [{ title: 'Groupes des parcours', href: index() }],
};
