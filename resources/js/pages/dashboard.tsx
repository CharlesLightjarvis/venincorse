import { Head, Link } from '@inertiajs/react';
import { CalendarCheck, Clock, Coins } from 'lucide-react';
import { useUserTimezone } from '@/hooks/use-browser-timezone';
import {
    formatReservationDate,
    formatReservationPrice,
    reservationStatusLabels,
    type ReservationPage,
} from '@/lib/trial-reservations';
import { dashboard } from '@/routes';
import { show } from '@/routes/trial-reservations';

export default function Dashboard({
    reservations,
    overview,
}: {
    reservations: ReservationPage;
    overview: { confirmed: number; pending: number; paidCents: number };
}) {
    const timezone = useUserTimezone();
    return (
        <div className="flex h-full flex-1 flex-col gap-6 p-4">
            <Head title="Mon espace" />
            <div>
                <h1 className="text-3xl font-semibold">
                    Ton espace, tes rendez-vous.
                </h1>
                <p className="mt-3 text-muted-foreground">
                    Retrouve tes cours d’essai et leur paiement. Seules tes
                    propres réservations sont affichées ici.
                </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
                {[
                    {
                        label: 'Réservations confirmées',
                        value: overview.confirmed,
                        icon: CalendarCheck,
                    },
                    {
                        label: 'Paiements à suivre',
                        value: overview.pending,
                        icon: Clock,
                    },
                    {
                        label: 'Total réglé',
                        value: formatReservationPrice(overview.paidCents),
                        icon: Coins,
                    },
                ].map(({ label, value, icon: Icon }) => (
                    <div
                        key={label}
                        className="rounded-lg border border-border p-5"
                    >
                        <div className="flex items-center justify-between gap-3">
                            <p className="text-sm text-muted-foreground">
                                {label}
                            </p>
                            <Icon
                                className="size-5 text-muted-foreground"
                                aria-hidden="true"
                            />
                        </div>
                        <p className="mt-3 text-3xl font-semibold">{value}</p>
                    </div>
                ))}
            </div>
            <section className="flex flex-col gap-4">
                <h2 className="text-2xl font-semibold">
                    Ma réservation d’essai
                </h2>
                {reservations.data.length === 0 && (
                    <p className="rounded-lg border border-dashed border-border p-6 text-muted-foreground">
                        Tu n’as pas encore de réservation. Choisis un créneau
                        pour ton premier cours.
                    </p>
                )}
                {reservations.data.map((reservation) => (
                    <Link
                        key={reservation.id}
                        href={show(reservation.id)}
                        className="flex flex-col gap-3 rounded-lg border border-border p-5 transition-colors hover:bg-muted/30 sm:flex-row sm:items-center sm:justify-between"
                    >
                        <div>
                            <h3 className="font-semibold">
                                {formatReservationDate(
                                    reservation.starts_at,
                                    timezone,
                                )}
                            </h3>
                            <p className="mt-2 text-sm text-muted-foreground">
                                Cours individuel · 60 minutes · {timezone}
                            </p>
                        </div>
                        <div>
                            <p className="font-medium text-primary">
                                {reservationStatusLabels[reservation.status]}
                            </p>
                            <p className="mt-1 text-sm text-muted-foreground">
                                {formatReservationPrice(
                                    reservation.amount_cents,
                                    reservation.currency,
                                )}
                            </p>
                        </div>
                    </Link>
                ))}
            </section>
        </div>
    );
}

Dashboard.layout = {
    breadcrumbs: [{ title: 'Mon espace', href: dashboard() }],
};
