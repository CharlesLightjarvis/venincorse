import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, ChevronsUpDown, Check, X, ChevronDown } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from '@/components/ui/command';
import { cn } from '@/lib/utils';

const sortOptions = [
    { value: 'date-asc', label: 'Date la plus proche' },
    { value: 'date-desc', label: 'Date la plus lointaine' },
    { value: 'places-asc', label: "Places limitées d'abord" },
    { value: 'popularite', label: "Populaires d'abord" },
];

const categorieOptions = [
    'Standard',
    'Grammaire',
    'Conversation',
    'Examens',
    'Affaires',
    'Soutien',
];

const niveauOptions = ['A1', 'A2', 'B1', 'B2'];

const statutOptions = ['Ouvert', 'Bientôt', 'Complet'];

export type CourseFilters = {
    categories: string[];
    niveaux: string[];
    statut: string;
};

type MultiSelectProps = {
    label: string;
    options: string[];
    selected: string[];
    onChange: (selected: string[]) => void;
    searchable?: boolean;
};

function MultiSelect({
    label,
    options,
    selected,
    onChange,
    searchable = false,
}: MultiSelectProps) {
    const [open, setOpen] = useState(false);

    const toggle = (value: string) => {
        onChange(
            selected.includes(value)
                ? selected.filter((v) => v !== value)
                : [...selected, value],
        );
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className={cn(
                        'h-9 justify-between gap-2 border-border/40 bg-background/60 backdrop-blur-sm hover:bg-background/80 dark:border-border/50 dark:bg-background/50',
                        selected.length > 0 &&
                            'border-primary/40 bg-primary/5 dark:bg-primary/10',
                    )}
                >
                    <span className="text-sm font-medium text-foreground/80">
                        {label}
                    </span>
                    {selected.length > 0 && (
                        <Badge className="h-4 min-w-4 rounded-full px-1 text-[10px]">
                            {selected.length}
                        </Badge>
                    )}
                    <ChevronDown className="h-3.5 w-3.5 shrink-0 text-foreground/40" />
                </Button>
            </PopoverTrigger>
            <PopoverContent
                className="w-52 border-border/40 bg-background/95 p-0 backdrop-blur-md dark:border-border/50"
                align="start"
            >
                <Command>
                    {searchable && (
                        <CommandInput
                            placeholder={`Chercher un niveau...`}
                            className="h-9 text-sm"
                        />
                    )}
                    <CommandList>
                        {searchable && (
                            <CommandEmpty className="py-4 text-center text-sm text-foreground/50">
                                Aucun résultat
                            </CommandEmpty>
                        )}
                        <CommandGroup>
                            {options.map((option) => {
                                const active = selected.includes(option);
                                return (
                                    <CommandItem
                                        key={option}
                                        value={option}
                                        onSelect={() => toggle(option)}
                                        className="gap-2 text-sm"
                                    >
                                        <div
                                            className={cn(
                                                'flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors',
                                                active
                                                    ? 'border-primary bg-primary'
                                                    : 'border-border/60',
                                            )}
                                        >
                                            {active && (
                                                <Check className="h-2.5 w-2.5 text-primary-foreground" />
                                            )}
                                        </div>
                                        {option}
                                    </CommandItem>
                                );
                            })}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}

type Props = {
    search: string;
    onSearch: (v: string) => void;
    sort: string;
    onSort: (v: string) => void;
    filters: CourseFilters;
    onFilters: (f: CourseFilters) => void;
};

export function CoursesHeader({
    search,
    onSearch,
    sort,
    onSort,
    filters,
    onFilters,
}: Props) {
    const [sortOpen, setSortOpen] = useState(false);
    const current = sortOptions.find((o) => o.value === sort);

    const toggleStatut = (s: string) => {
        onFilters({ ...filters, statut: filters.statut === s ? '' : s });
    };

    const activeCount =
        filters.categories.length +
        filters.niveaux.length +
        (filters.statut ? 1 : 0);

    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-10"
        >
            {/* Search + sort */}
            <div className="mb-4 flex flex-col gap-3 sm:flex-row">
                <div className="relative flex-1">
                    <Search
                        className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-foreground/40"
                        aria-hidden="true"
                    />
                    <Input
                        type="search"
                        placeholder="Rechercher un cours, un niveau..."
                        value={search}
                        onChange={(e) => onSearch(e.target.value)}
                        className="border-border/40 bg-background/60 pl-9 backdrop-blur-sm placeholder:text-foreground/40 focus-visible:border-border/60 dark:border-border/50 dark:bg-background/50"
                    />
                </div>

                {/* Sort combobox */}
                <Popover open={sortOpen} onOpenChange={setSortOpen}>
                    <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={sortOpen}
                            className="w-full justify-between border-border/40 bg-background/60 backdrop-blur-sm hover:bg-background/80 sm:w-56 dark:border-border/50 dark:bg-background/50"
                        >
                            <span className="mr-1 text-xs text-foreground/50">
                                Trier :
                            </span>
                            <span className="flex-1 text-left text-sm font-medium text-foreground">
                                {current?.label ?? 'Date la plus proche'}
                            </span>
                            <ChevronsUpDown className="ml-2 h-3.5 w-3.5 shrink-0 text-foreground/40" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-56 border-border/40 bg-background/95 p-0 backdrop-blur-md dark:border-border/50">
                        <Command>
                            <CommandList>
                                <CommandGroup>
                                    {sortOptions.map((option) => (
                                        <CommandItem
                                            key={option.value}
                                            value={option.value}
                                            onSelect={(val) => {
                                                onSort(val);
                                                setSortOpen(false);
                                            }}
                                            className="gap-2 text-sm"
                                        >
                                            <Check
                                                className={cn(
                                                    'h-4 w-4 text-primary',
                                                    sort === option.value
                                                        ? 'opacity-100'
                                                        : 'opacity-0',
                                                )}
                                            />
                                            {option.label}
                                        </CommandItem>
                                    ))}
                                </CommandGroup>
                            </CommandList>
                        </Command>
                    </PopoverContent>
                </Popover>
            </div>

            {/* Filters row */}
            <div className="flex flex-wrap items-center gap-2">
                {/* Catégorie combobox */}
                <MultiSelect
                    label="Catégorie"
                    options={categorieOptions}
                    selected={filters.categories}
                    onChange={(categories) =>
                        onFilters({ ...filters, categories })
                    }
                />

                {/* Niveau combobox */}
                <MultiSelect
                    label="Niveau"
                    options={niveauOptions}
                    selected={filters.niveaux}
                    onChange={(niveaux) => onFilters({ ...filters, niveaux })}
                />

                <span className="h-4 w-px bg-border/40" />

                {/* Statut chips (3 options max, chips are fine) */}
                {statutOptions.map((s) => {
                    const active = filters.statut === s;
                    const colorClass =
                        s === 'Ouvert'
                            ? active
                                ? 'border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                                : 'border-border/40 bg-background/60 text-foreground/60 hover:border-emerald-400/60 dark:border-border/50 dark:bg-background/50'
                            : s === 'Bientôt'
                              ? active
                                  ? 'border-blue-500 bg-blue-500/10 text-blue-600 dark:text-blue-400'
                                  : 'border-border/40 bg-background/60 text-foreground/60 hover:border-blue-400/60 dark:border-border/50 dark:bg-background/50'
                              : active
                                ? 'border-rose-500 bg-rose-500/10 text-rose-600 dark:text-rose-400'
                                : 'border-border/40 bg-background/60 text-foreground/60 hover:border-rose-400/60 dark:border-border/50 dark:bg-background/50';
                    return (
                        <button
                            key={s}
                            type="button"
                            onClick={() => toggleStatut(s)}
                            className={cn(
                                'h-9 rounded-full border px-3 text-xs font-medium transition-all',
                                colorClass,
                            )}
                        >
                            {s}
                        </button>
                    );
                })}

                {/* Reset */}
                {activeCount > 0 && (
                    <button
                        type="button"
                        onClick={() =>
                            onFilters({
                                categories: [],
                                niveaux: [],
                                statut: '',
                            })
                        }
                        className="inline-flex h-9 items-center gap-1.5 rounded-full border border-border/40 bg-background/60 px-3 text-xs text-foreground/50 transition-colors hover:text-foreground dark:border-border/50 dark:bg-background/50"
                    >
                        <X className="h-3 w-3" />
                        Effacer ({activeCount})
                    </button>
                )}
            </div>
        </motion.div>
    );
}
