import { Head, useForm } from '@inertiajs/react';
import { type FormEvent, type ReactNode, useMemo } from 'react';
import { fr } from 'react-day-picker/locale';
import { CalendarPlus, X } from 'reicon-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { formatCoursePrice } from '@/lib/course-cohorts';
import { create, index, store } from '@/routes/course-cohorts';

type Option = { value: string; label: string };
type Level = Option & { prices: Record<'group' | 'solo', number> };
type Format = Option & { max_capacity: number };
type Rhythm = Option & { weekdays: number[]; session_hours: number };

type CohortForm = {
    level: string;
    format: 'group' | 'solo';
    rhythm: string;
    starts_on: string;
    start_hour: number;
    capacity: number;
    skipped_dates: string[];
};

const weekdayNames = [
    '',
    'lun.',
    'mar.',
    'mer.',
    'jeu.',
    'ven.',
    'sam.',
    'dim.',
];

const tileClassName =
    'h-11 rounded-md shadow-none data-[variant=outline]:border-l data-[state=on]:border-primary data-[state=on]:bg-primary/10 data-[state=on]:text-foreground';

/** Dates are calendar days (YYYY-MM-DD), read and written without any time zone shift. */
function toDate(value: string): Date {
    const [year, month, day] = value.split('-').map(Number);

    return new Date(year, month - 1, day);
}

function toDateString(date: Date): string {
    return [
        date.getFullYear(),
        String(date.getMonth() + 1).padStart(2, '0'),
        String(date.getDate()).padStart(2, '0'),
    ].join('-');
}

const longDate = (date: Date) =>
    new Intl.DateTimeFormat('fr-FR', {
        weekday: 'short',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    }).format(date);

/** Same layout as the server: 60 hours on the rhythm's weekdays, skipping the days off. */
function previewSchedule(
    rhythm: Rhythm | undefined,
    startsOn: string,
    skipped: string[],
    totalHours: number,
) {
    if (!rhythm || !startsOn) {
        return null;
    }
    const sessions: Date[] = [];
    let remaining = totalHours;
    const day = toDate(startsOn);
    while (remaining > 0) {
        const iso = day.getDay() === 0 ? 7 : day.getDay();
        if (
            rhythm.weekdays.includes(iso) &&
            !skipped.includes(toDateString(day))
        ) {
            sessions.push(new Date(day));
            remaining -= Math.min(rhythm.session_hours, remaining);
        }
        day.setDate(day.getDate() + 1);
    }

    return {
        count: sessions.length,
        first: sessions[0],
        last: sessions.at(-1)!,
    };
}

function Section({
    title,
    description,
    error,
    children,
}: {
    title: string;
    description: string;
    error?: string;
    children: ReactNode;
}) {
    return (
        <section className="flex flex-col gap-4 p-5 lg:flex-row lg:items-start lg:justify-between lg:gap-10 lg:p-6">
            <div className="lg:max-w-sm">
                <h2 className="font-medium">{title}</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                    {description}
                </p>
            </div>
            <div className="flex w-full flex-col gap-3 lg:w-[34rem] lg:items-end">
                {children}
                {error && (
                    <p role="alert" className="text-sm text-destructive">
                        {error}
                    </p>
                )}
            </div>
        </section>
    );
}

export default function CreateCourseCohort({
    levels,
    formats,
    rhythms,
    startHours,
    totalHours,
    currency,
    timezone,
}: {
    levels: Level[];
    formats: Format[];
    rhythms: Rhythm[];
    startHours: number[];
    totalHours: number;
    currency: string;
    timezone: string;
}) {
    const form = useForm<CohortForm>({
        level: levels[0]?.value ?? '',
        format: 'group',
        rhythm: rhythms[0]?.value ?? '',
        starts_on: '',
        start_hour: 9,
        capacity:
            formats.find((format) => format.value === 'group')?.max_capacity ??
            6,
        skipped_dates: [],
    });
    const tomorrow = new Date();
    tomorrow.setHours(0, 0, 0, 0);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const level = levels.find((item) => item.value === form.data.level);
    const rhythm = rhythms.find((item) => item.value === form.data.rhythm);
    const groupMax =
        formats.find((format) => format.value === 'group')?.max_capacity ?? 6;
    const preview = useMemo(
        () =>
            previewSchedule(
                rhythm,
                form.data.starts_on,
                form.data.skipped_dates,
                totalHours,
            ),
        [rhythm, form.data.starts_on, form.data.skipped_dates, totalHours],
    );
    const skippedError = Object.entries(form.errors).find(([field]) =>
        field.startsWith('skipped_dates'),
    )?.[1];

    function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        form.post(store.url());
    }

    return (
        <div className="flex h-full flex-1 flex-col gap-6 p-4">
            <Head title="Nouveau groupe" />
            <div>
                <h1 className="text-3xl font-semibold">Nouveau groupe</h1>
                <p className="mt-3 text-muted-foreground">
                    Le planning des {totalHours} heures est calculé à partir de
                    la date de début, sur les jours du rythme choisi. Les
                    horaires sont à l’heure de {timezone} ; chaque élève les
                    voit dans son propre fuseau.
                </p>
            </div>

            <form
                onSubmit={submit}
                className="flex flex-col rounded-lg border border-border"
            >
                <Section
                    title="Niveau"
                    description="Le niveau complet suivi par le groupe."
                    error={form.errors.level}
                >
                    <ToggleGroup
                        type="single"
                        variant="outline"
                        aria-label="Niveau"
                        className="grid w-full grid-cols-2 gap-2 shadow-none sm:grid-cols-4"
                        value={form.data.level}
                        onValueChange={(value) =>
                            value && form.setData('level', value)
                        }
                    >
                        {levels.map((item) => (
                            <ToggleGroupItem
                                key={item.value}
                                value={item.value}
                                className={tileClassName}
                            >
                                {item.value.toUpperCase()}
                            </ToggleGroupItem>
                        ))}
                    </ToggleGroup>
                    {level && (
                        <p className="text-sm text-muted-foreground">
                            {level.label}
                        </p>
                    )}
                </Section>
                <Separator />
                <Section
                    title="Format"
                    description="Un groupe de 3 à 6 élèves, ou un élève seul en individuel."
                    error={form.errors.format}
                >
                    <ToggleGroup
                        type="single"
                        variant="outline"
                        aria-label="Format"
                        className="grid w-full grid-cols-2 gap-2 shadow-none"
                        value={form.data.format}
                        onValueChange={(value) => {
                            if (value) {
                                form.setData((data) => ({
                                    ...data,
                                    format: value as CohortForm['format'],
                                    capacity: value === 'solo' ? 1 : groupMax,
                                }));
                            }
                        }}
                    >
                        {formats.map((item) => (
                            <ToggleGroupItem
                                key={item.value}
                                value={item.value}
                                className={tileClassName}
                            >
                                {item.label}
                            </ToggleGroupItem>
                        ))}
                    </ToggleGroup>
                    {level && (
                        <p className="text-sm text-muted-foreground">
                            Prix par élève :{' '}
                            <span className="font-medium text-foreground">
                                {formatCoursePrice(
                                    level.prices[form.data.format],
                                    currency,
                                )}
                            </span>
                        </p>
                    )}
                </Section>
                <Separator />
                <Section
                    title="Rythme"
                    description="Les jours et la durée des séances, jusqu’à atteindre 60 heures."
                    error={form.errors.rhythm}
                >
                    <ToggleGroup
                        type="single"
                        variant="outline"
                        aria-label="Rythme"
                        className="grid w-full grid-cols-2 gap-2 shadow-none sm:grid-cols-4"
                        value={form.data.rhythm}
                        onValueChange={(value) =>
                            value && form.setData('rhythm', value)
                        }
                    >
                        {rhythms.map((item) => (
                            <ToggleGroupItem
                                key={item.value}
                                value={item.value}
                                className={tileClassName}
                            >
                                {item.label}
                            </ToggleGroupItem>
                        ))}
                    </ToggleGroup>
                    {rhythm && (
                        <p className="text-sm text-muted-foreground">
                            {rhythm.weekdays
                                .map((day) => weekdayNames[day])
                                .join(', ')}{' '}
                            · séances de {rhythm.session_hours} h
                        </p>
                    )}
                </Section>
                <Separator />
                <Section
                    title="Début"
                    description="La première séance a lieu le premier jour du rythme à partir de cette date."
                    error={form.errors.starts_on}
                >
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button type="button" variant="outline">
                                <CalendarPlus data-icon="inline-start" />
                                {form.data.starts_on
                                    ? longDate(toDate(form.data.starts_on))
                                    : 'Choisir la date de début'}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="end">
                            <Calendar
                                mode="single"
                                locale={fr}
                                selected={
                                    form.data.starts_on
                                        ? toDate(form.data.starts_on)
                                        : undefined
                                }
                                onSelect={(date) =>
                                    form.setData(
                                        'starts_on',
                                        date ? toDateString(date) : '',
                                    )
                                }
                                disabled={{ before: tomorrow }}
                                startMonth={tomorrow}
                            />
                        </PopoverContent>
                    </Popover>
                </Section>
                <Separator />
                <Section
                    title={`Heure des séances (${timezone})`}
                    description="Toutes les séances commencent à cette heure."
                    error={form.errors.start_hour}
                >
                    <ToggleGroup
                        type="single"
                        variant="outline"
                        aria-label="Heure des séances"
                        className="grid w-full grid-cols-4 gap-2 shadow-none sm:grid-cols-7"
                        value={String(form.data.start_hour)}
                        onValueChange={(value) =>
                            value && form.setData('start_hour', Number(value))
                        }
                    >
                        {startHours.map((hour) => (
                            <ToggleGroupItem
                                key={hour}
                                value={String(hour)}
                                className={`${tileClassName} tabular-nums`}
                            >
                                {String(hour).padStart(2, '0')}:00
                            </ToggleGroupItem>
                        ))}
                    </ToggleGroup>
                </Section>
                {form.data.format === 'group' && (
                    <>
                        <Separator />
                        <Section
                            title="Places"
                            description={`Nombre maximum d’élèves (${groupMax} au plus). Le groupe démarre quel que soit le nombre d’inscrits.`}
                            error={form.errors.capacity}
                        >
                            <Input
                                type="number"
                                min={1}
                                max={groupMax}
                                className="w-28"
                                aria-label="Places"
                                value={form.data.capacity}
                                onChange={(event) =>
                                    form.setData(
                                        'capacity',
                                        Number(event.target.value),
                                    )
                                }
                            />
                        </Section>
                    </>
                )}
                <Separator />
                <Section
                    title="Jours sans cours"
                    description="Jours fériés ou vacances : aucune séance ces jours-là, le planning est prolongé d’autant."
                    error={skippedError}
                >
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button type="button" variant="outline">
                                <CalendarPlus data-icon="inline-start" />
                                Choisir les jours sans cours
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="end">
                            <Calendar
                                mode="multiple"
                                locale={fr}
                                selected={form.data.skipped_dates.map(toDate)}
                                onSelect={(dates) =>
                                    form.setData(
                                        'skipped_dates',
                                        (dates ?? []).map(toDateString).sort(),
                                    )
                                }
                                disabled={{ before: tomorrow }}
                                startMonth={tomorrow}
                            />
                        </PopoverContent>
                    </Popover>
                    {form.data.skipped_dates.length > 0 && (
                        <ul className="flex flex-wrap gap-2 lg:justify-end">
                            {form.data.skipped_dates.map((date) => (
                                <li key={date}>
                                    <Badge
                                        variant="secondary"
                                        className="gap-1 py-1 pr-1 pl-2.5"
                                    >
                                        {longDate(toDate(date))}
                                        <button
                                            type="button"
                                            aria-label="Retirer ce jour"
                                            className="rounded-sm p-0.5 hover:bg-background/60"
                                            onClick={() =>
                                                form.setData(
                                                    'skipped_dates',
                                                    form.data.skipped_dates.filter(
                                                        (item) => item !== date,
                                                    ),
                                                )
                                            }
                                        >
                                            <X className="size-3" />
                                        </button>
                                    </Badge>
                                </li>
                            ))}
                        </ul>
                    )}
                </Section>
                <Separator />
                <div className="flex flex-col gap-3 bg-muted/30 p-5 sm:flex-row sm:items-center sm:justify-between lg:px-6">
                    <p className="text-sm text-muted-foreground">
                        {preview
                            ? `${preview.count} séances, du ${longDate(preview.first)} au ${longDate(preview.last)}, à ${String(form.data.start_hour).padStart(2, '0')}:00.`
                            : 'Choisis une date de début pour voir le planning.'}
                    </p>
                    <Button type="submit" disabled={form.processing}>
                        {form.processing ? 'Création…' : 'Créer le groupe'}
                    </Button>
                </div>
            </form>
        </div>
    );
}

CreateCourseCohort.layout = {
    breadcrumbs: [
        { title: 'Groupes des parcours', href: index() },
        { title: 'Nouveau groupe', href: create() },
    ],
};
