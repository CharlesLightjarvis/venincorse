import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { getTrialSlots, type TrialDemoState } from '@/data/trial-booking';

export const timezoneOptions = [
    'UTC',
    'Europe/Paris',
    'Europe/Brussels',
    'Europe/Zurich',
    'America/Montreal',
    'Africa/Abidjan',
];
export const selectClassName =
    'h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring';

export function TrialSlotPicker({
    state,
    value,
    onChange,
    timezone,
    onTimezoneChange,
}: {
    state: TrialDemoState;
    value: string;
    onChange: (slot: string) => void;
    timezone: string;
    onTimezoneChange: (zone: string) => void;
}) {
    const [selectedDay, setSelectedDay] = useState('');
    const slots = getTrialSlots(state);
    const dayFormatter = new Intl.DateTimeFormat('en-CA', {
        timeZone: timezone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    });
    const groups = new Map<string, string[]>();
    for (const slot of slots) {
        const day = dayFormatter.format(new Date(slot));
        groups.set(day, [...(groups.get(day) ?? []), slot]);
    }
    const days = [...groups.keys()];
    const activeDay = days.includes(selectedDay)
        ? selectedDay
        : value && slots.includes(value)
          ? dayFormatter.format(new Date(value))
          : days[0];
    const activeSlots = groups.get(activeDay) ?? [];

    return (
        <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-2 sm:max-w-xs">
                <Label htmlFor="timezone">
                    Horaires affichés dans le fuseau
                </Label>
                <select
                    id="timezone"
                    value={timezone}
                    onChange={(event) => {
                        setSelectedDay('');
                        onTimezoneChange(event.target.value);
                    }}
                    className={selectClassName}
                >
                    {timezoneOptions.map((zone) => (
                        <option key={zone} value={zone}>
                            {zone.replaceAll('_', ' ')}
                        </option>
                    ))}
                </select>
            </div>
            {days.length === 0 ? (
                <p role="status" className="py-8 text-sm text-muted-foreground">
                    Aucun créneau disponible sur les 14 prochains jours. Reviens
                    plus tard ou modifie les disponibilités dans la démo
                    professeur.
                </p>
            ) : (
                <>
                    <fieldset className="flex flex-col gap-3">
                        <legend className="mb-3 text-sm font-medium">
                            Choisis un jour
                        </legend>
                        <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
                            {days.map((day) => {
                                const slot = groups.get(day)![0];
                                return (
                                    <label
                                        key={day}
                                        className={cn(
                                            'relative cursor-pointer rounded-xl border p-3 text-center has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring',
                                            activeDay === day
                                                ? 'border-primary bg-primary/10'
                                                : 'border-border bg-background hover:border-primary/40',
                                        )}
                                    >
                                        <input
                                            className="sr-only"
                                            type="radio"
                                            name="booking-day"
                                            value={day}
                                            checked={activeDay === day}
                                            onChange={() => setSelectedDay(day)}
                                        />
                                        <span className="block text-xs text-muted-foreground">
                                            {new Intl.DateTimeFormat('fr-FR', {
                                                weekday: 'short',
                                                timeZone: timezone,
                                            }).format(new Date(slot))}
                                        </span>
                                        <span className="mt-1 block text-lg font-semibold">
                                            {new Intl.DateTimeFormat('fr-FR', {
                                                day: 'numeric',
                                                month: 'short',
                                                timeZone: timezone,
                                            }).format(new Date(slot))}
                                        </span>
                                    </label>
                                );
                            })}
                        </div>
                    </fieldset>
                    <fieldset>
                        <legend className="mb-3 text-sm font-medium">
                            Choisis une heure · séance de 60 minutes
                        </legend>
                        <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
                            {activeSlots.map((slot) => (
                                <label
                                    key={slot}
                                    className={cn(
                                        'cursor-pointer rounded-xl border px-3 py-3 text-center text-sm has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring',
                                        value === slot
                                            ? 'border-primary bg-primary/10 font-semibold text-primary'
                                            : 'border-border bg-background hover:border-primary/40',
                                    )}
                                >
                                    <input
                                        className="sr-only"
                                        type="radio"
                                        name="booking-slot"
                                        value={slot}
                                        checked={value === slot}
                                        onChange={() => onChange(slot)}
                                    />
                                    {new Intl.DateTimeFormat('fr-FR', {
                                        hour: '2-digit',
                                        minute: '2-digit',
                                        timeZone: timezone,
                                    }).format(new Date(slot))}
                                </label>
                            ))}
                        </div>
                    </fieldset>
                </>
            )}
            {value && !slots.includes(value) && (
                <p role="alert" className="text-sm text-destructive">
                    Ce créneau n’est plus disponible. Choisis un autre horaire.
                </p>
            )}
            {value && (
                <Button
                    variant="ghost"
                    size="sm"
                    className="self-start"
                    onClick={() => onChange('')}
                >
                    Effacer le créneau choisi
                </Button>
            )}
        </div>
    );
}
