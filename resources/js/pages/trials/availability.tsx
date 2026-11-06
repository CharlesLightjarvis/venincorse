import { Head, useForm } from '@inertiajs/react';
import {
    CalendarCheck,
    CalendarDay,
    CalendarPlus,
    CalendarDate,
    X,
    type IconComponent,
} from 'reicon-react';
import { type FormEvent, type ReactNode } from 'react';
import { fr } from 'react-day-picker/locale';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { edit, update } from '@/routes/trial-availability';

type Availability = {
    weekdays: number[];
    hours: number[];
    closed_dates: string[];
};

/** Monday first, as on a French calendar. Values follow JavaScript/Carbon: 0 = Sunday. */
const weekdays = [
    { value: 1, short: 'Lun', long: 'Lundi' },
    { value: 2, short: 'Mar', long: 'Mardi' },
    { value: 3, short: 'Mer', long: 'Mercredi' },
    { value: 4, short: 'Jeu', long: 'Jeudi' },
    { value: 5, short: 'Ven', long: 'Vendredi' },
    { value: 6, short: 'Sam', long: 'Samedi' },
    { value: 0, short: 'Dim', long: 'Dimanche' },
];

const tileClassName =
    'h-11 rounded-md shadow-none data-[variant=outline]:border-l data-[state=on]:border-primary data-[state=on]:bg-primary/10 data-[state=on]:text-foreground';

/** Closed days are calendar dates (YYYY-MM-DD), so they are read and written without any time zone shift. */
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

function Stat({
    label,
    hint,
    value,
    icon: Icon,
}: {
    label: string;
    hint: string;
    value: number;
    icon: IconComponent;
}) {
    return (
        <div className="rounded-lg border border-border p-5">
            <div className="flex items-center justify-between gap-3">
                <p className="text-sm text-muted-foreground">{label}</p>
                <Icon
                    className="size-5 text-muted-foreground"
                    aria-hidden="true"
                />
            </div>
            <p className="mt-3 text-3xl font-semibold">{value}</p>
            <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
        </div>
    );
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
            <div className="flex w-full flex-col gap-3 lg:w-auto lg:items-end">
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

export default function TrialAvailabilityPage({
    availability,
    selectableHours,
    windowDays,
    noticeHours,
    overview,
}: {
    availability: Availability;
    selectableHours: number[];
    windowDays: number;
    noticeHours: number;
    overview: { freeSlots: number; reservedSlots: number };
}) {
    const form = useForm<Availability>(availability);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const perWeek = form.data.weekdays.length * form.data.hours.length;
    const closedDatesError = Object.entries(form.errors).find(([field]) =>
        field.startsWith('closed_dates'),
    )?.[1];
    const hoursError = Object.entries(form.errors).find(([field]) =>
        field.startsWith('hours'),
    )?.[1];

    function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        form.put(update.url(), {
            preserveScroll: true,
            onSuccess: () => {
                form.setDefaults();
                toast.success(
                    'Disponibilités enregistrées. Les séances déjà réservées sont conservées.',
                );
            },
        });
    }

    return (
        <div className="flex h-full flex-1 flex-col gap-6 p-4">
            <Head title="Disponibilités" />
            <div>
                <h1 className="text-3xl font-semibold">
                    Quand souhaites-tu enseigner ?
                </h1>
                <p className="mt-3 text-muted-foreground">
                    Les élèves réservent parmi les créneaux générés à partir de
                    ces réglages, sur les {windowDays} prochains jours et au
                    moins {noticeHours} h à l’avance.
                </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
                <Stat
                    label="Créneaux ouverts à la réservation"
                    hint={`Encore libres sur les ${windowDays} prochains jours`}
                    value={overview.freeSlots}
                    icon={CalendarDay}
                />
                <Stat
                    label="Créneaux pris"
                    hint="Réservés ou en cours de paiement"
                    value={overview.reservedSlots}
                    icon={CalendarCheck}
                />
                <Stat
                    label="Séances proposées par semaine"
                    hint="Avec les réglages ci-dessous"
                    value={perWeek}
                    icon={CalendarDate}
                />
            </div>
            <form
                onSubmit={submit}
                className="flex flex-col rounded-lg border border-border"
            >
                <Section
                    title="Jours ouverts"
                    description="Les jours de la semaine où tu proposes des cours d’essai."
                    error={form.errors.weekdays}
                >
                    <ToggleGroup
                        type="multiple"
                        variant="outline"
                        aria-label="Jours ouverts"
                        className="grid w-full grid-cols-4 gap-2 shadow-none sm:grid-cols-7 lg:w-[34rem]"
                        value={form.data.weekdays.map(String)}
                        onValueChange={(values) =>
                            form.setData(
                                'weekdays',
                                values.map(Number).sort((a, b) => a - b),
                            )
                        }
                    >
                        {weekdays.map((day) => (
                            <ToggleGroupItem
                                key={day.value}
                                value={String(day.value)}
                                aria-label={day.long}
                                title={day.long}
                                className={tileClassName}
                            >
                                {day.short}
                            </ToggleGroupItem>
                        ))}
                    </ToggleGroup>
                </Section>
                <Separator />
                <Section
                    title="Heures de début (UTC)"
                    description="Séances de 60 min. Les heures trop proches d’un début déjà choisi sont désactivées pour garder 60 min de pause. Chaque élève voit les horaires dans son propre fuseau."
                    error={hoursError}
                >
                    <ToggleGroup
                        type="multiple"
                        variant="outline"
                        aria-label="Heures de début"
                        className="grid w-full grid-cols-4 gap-2 shadow-none sm:grid-cols-7 lg:w-[34rem]"
                        value={form.data.hours.map(String)}
                        onValueChange={(values) =>
                            form.setData(
                                'hours',
                                values.map(Number).sort((a, b) => a - b),
                            )
                        }
                    >
                        {selectableHours.map((hour) => {
                            const selected = form.data.hours.includes(hour);
                            const tooClose =
                                !selected &&
                                (form.data.hours.includes(hour - 1) ||
                                    form.data.hours.includes(hour + 1));
                            return (
                                <ToggleGroupItem
                                    key={hour}
                                    value={String(hour)}
                                    disabled={tooClose}
                                    className={`${tileClassName} tabular-nums`}
                                >
                                    {String(hour).padStart(2, '0')}:00
                                </ToggleGroupItem>
                            );
                        })}
                    </ToggleGroup>
                </Section>
                <Separator />
                <Section
                    title="Journées d’absence"
                    description="Aucun créneau n’est proposé ces jours-là, même s’ils sont ouverts."
                    error={closedDatesError}
                >
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button type="button" variant="outline">
                                <CalendarPlus data-icon="inline-start" />
                                Choisir les absences
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="end">
                            <Calendar
                                mode="multiple"
                                locale={fr}
                                selected={form.data.closed_dates.map(toDate)}
                                onSelect={(dates) =>
                                    form.setData(
                                        'closed_dates',
                                        (dates ?? []).map(toDateString).sort(),
                                    )
                                }
                                disabled={{ before: today }}
                                startMonth={today}
                            />
                        </PopoverContent>
                    </Popover>
                    {form.data.closed_dates.length === 0 ? (
                        <p className="text-sm text-muted-foreground">
                            Aucune absence prévue.
                        </p>
                    ) : (
                        <ul className="flex flex-wrap gap-2 lg:justify-end">
                            {form.data.closed_dates.map((date) => (
                                <li key={date}>
                                    <Badge
                                        variant="secondary"
                                        className="gap-1 py-1 pr-1 pl-2.5"
                                    >
                                        {new Intl.DateTimeFormat('fr-FR', {
                                            weekday: 'short',
                                            day: 'numeric',
                                            month: 'long',
                                        }).format(toDate(date))}
                                        <button
                                            type="button"
                                            aria-label="Retirer cette absence"
                                            className="rounded-sm p-0.5 hover:bg-background/60"
                                            onClick={() =>
                                                form.setData(
                                                    'closed_dates',
                                                    form.data.closed_dates.filter(
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
                        {form.isDirty
                            ? 'Modifications non enregistrées.'
                            : 'Les séances déjà réservées ne sont jamais déplacées ni annulées.'}
                    </p>
                    <Button
                        type="submit"
                        disabled={form.processing || !form.isDirty}
                    >
                        {form.processing
                            ? 'Enregistrement…'
                            : 'Enregistrer les disponibilités'}
                    </Button>
                </div>
            </form>
        </div>
    );
}

TrialAvailabilityPage.layout = {
    breadcrumbs: [{ title: 'Disponibilités', href: edit() }],
};
