import { Head, Link, useForm } from '@inertiajs/react';
import { useState, type FormEvent } from 'react';
import { CalendarDays } from 'reicon-react';
import { AvailableTrialSlotPicker } from '@/components/trial-slot-picker';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import {
    timezoneIdentifiers,
    useUserTimezone,
} from '@/hooks/use-browser-timezone';
import {
    formatReservationDate,
    type TrialReservation,
} from '@/lib/trial-reservations';
import { index } from '@/routes/trial-reservations';
import { store } from '@/routes/trial-reschedules';

export default function RescheduleTrial({
    reservation,
    slots,
}: {
    reservation: TrialReservation;
    slots: { id: number; starts_at: string }[];
}) {
    const userTimezone = useUserTimezone();
    const [timezoneOverride, setTimezoneOverride] = useState<string | null>(
        null,
    );
    const timezone = timezoneOverride ?? userTimezone;
    const [startsAt, setStartsAt] = useState('');
    const form = useForm<{ slot_id: number | null }>({ slot_id: null });
    const isRebook = reservation.status === 'no_show';

    function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        form.post(store.url(reservation.id));
    }

    return (
        <div className="flex h-full flex-1 flex-col gap-6 p-4">
            <Head title="Déplacer mon cours d’essai" />
            <div>
                <h1 className="text-3xl font-semibold">
                    {isRebook
                        ? 'Choisis ton nouveau créneau'
                        : 'Déplacer mon cours d’essai'}
                </h1>
                <p className="mt-3 text-muted-foreground">
                    {isRebook
                        ? 'Ton professeur t’offre un nouveau créneau, sans frais.'
                        : `Actuellement prévu le ${formatReservationDate(reservation.starts_at, timezone)}. Le report est gratuit, une seule fois, jusqu’à 24 h avant la séance.`}
                </p>
            </div>

            <form
                onSubmit={submit}
                className="flex flex-col gap-6 rounded-lg border border-border p-5"
            >
                <AvailableTrialSlotPicker
                    slots={slots.map((slot) => slot.starts_at)}
                    value={startsAt}
                    onChange={(value) => {
                        setStartsAt(value);
                        form.setData(
                            'slot_id',
                            slots.find((slot) => slot.starts_at === value)
                                ?.id ?? null,
                        );
                    }}
                    timezone={timezone}
                    onTimezoneChange={setTimezoneOverride}
                    timezones={timezoneIdentifiers(timezone)}
                    emptyMessage="Aucun autre créneau disponible pour le moment. Reviens un peu plus tard ou contacte-nous."
                />
                {form.errors.slot_id && (
                    <Alert variant="destructive">
                        <AlertDescription>
                            {form.errors.slot_id}
                        </AlertDescription>
                    </Alert>
                )}
                <p className="text-sm text-muted-foreground">
                    {isRebook
                        ? 'Ce créneau offert ne pourra plus être déplacé ni remboursé : choisis-le bien.'
                        : 'Après ce report, ton cours ne pourra plus être déplacé en ligne.'}{' '}
                    Ton professeur t’enverra le lien de la visio de la nouvelle
                    séance par email.
                </p>
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <Button asChild variant="ghost">
                        <Link href={index()}>Garder mon créneau actuel</Link>
                    </Button>
                    <Button
                        type="submit"
                        disabled={form.data.slot_id === null || form.processing}
                    >
                        {form.processing ? (
                            <Spinner data-icon="inline-start" />
                        ) : (
                            <CalendarDays data-icon="inline-start" />
                        )}
                        {isRebook
                            ? 'Confirmer ce créneau'
                            : 'Déplacer mon cours'}
                    </Button>
                </div>
            </form>
        </div>
    );
}

RescheduleTrial.layout = {
    breadcrumbs: [{ title: 'Ma réservation d’essai', href: index() }],
};
