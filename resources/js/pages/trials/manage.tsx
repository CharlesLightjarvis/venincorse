import { Form, Head, Link, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
    formatReservationDate,
    formatReservationPrice,
    reservationStatusLabels,
    type ReservationPage,
    type TrialReservation,
} from '@/lib/trial-reservations';
import { index, update } from '@/routes/trial-management';
import type { Auth } from '@/types';
import { useUserTimezone } from '@/hooks/use-browser-timezone';

export default function ManageTrials({
    reservations,
}: {
    reservations: ReservationPage;
}) {
    const { auth } = usePage<{ auth: Auth }>().props;
    const timezone = useUserTimezone();
    return (
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 p-6 md:p-10">
            <Head title="Gestion des cours d’essai" />
            <h1 className="text-3xl font-semibold">
                Les cours d’essai, côté professeur.
            </h1>
            <p className="text-muted-foreground">
                Réservations enregistrées en base. Un paiement ne peut pas être
                marqué comme réglé manuellement depuis cet écran.
            </p>
            {reservations.data.length === 0 && (
                <p className="rounded-2xl border border-dashed border-border p-6">
                    Aucune réservation pour le moment.
                </p>
            )}
            {reservations.data.map((reservation) => (
                <article
                    key={reservation.id}
                    className="rounded-2xl border border-border p-6"
                >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                            <h2 className="text-xl font-semibold">
                                {reservation.student?.name}
                            </h2>
                            <p className="mt-1 text-sm break-all text-muted-foreground">
                                {reservation.student?.email}
                            </p>
                        </div>
                        <p className="font-medium text-primary">
                            {reservationStatusLabels[reservation.status]}
                        </p>
                    </div>
                    <p className="mt-4 font-medium">
                        {formatReservationDate(reservation.starts_at, timezone)}
                    </p>
                    <p className="mt-2 text-sm text-muted-foreground">
                        60 minutes ·{' '}
                        {formatReservationPrice(
                            reservation.amount_cents,
                            reservation.currency,
                        )}{' '}
                        · {timezone}
                    </p>
                    <p className="mt-4 text-sm whitespace-pre-wrap">
                        {reservation.goal}
                    </p>
                    {auth.can?.updateTrials && (
                        <TrialNotes reservation={reservation} />
                    )}
                </article>
            ))}
            <div className="flex justify-between gap-3">
                <Button
                    asChild
                    variant="outline"
                    disabled={reservations.meta.current_page <= 1}
                >
                    <Link
                        href={index({
                            query: {
                                page: Math.max(
                                    1,
                                    reservations.meta.current_page - 1,
                                ),
                            },
                        })}
                    >
                        Précédent
                    </Link>
                </Button>
                <span className="text-sm text-muted-foreground">
                    Page {reservations.meta.current_page} /{' '}
                    {reservations.meta.last_page}
                </span>
                <Button
                    asChild
                    variant="outline"
                    disabled={
                        reservations.meta.current_page >=
                        reservations.meta.last_page
                    }
                >
                    <Link
                        href={index({
                            query: {
                                page: Math.min(
                                    reservations.meta.last_page,
                                    reservations.meta.current_page + 1,
                                ),
                            },
                        })}
                    >
                        Suivant
                    </Link>
                </Button>
            </div>
        </div>
    );
}

function TrialNotes({ reservation }: { reservation: TrialReservation }) {
    return (
        <Form
            {...update.form(reservation.id)}
            className="mt-5 flex flex-col gap-3"
        >
            {({ processing, errors, recentlySuccessful }) => (
                <>
                    <Label htmlFor={`notes-${reservation.id}`}>
                        Notes privées du professeur
                    </Label>
                    <textarea
                        id={`notes-${reservation.id}`}
                        name="notes"
                        defaultValue={reservation.notes}
                        maxLength={5000}
                        rows={3}
                        className="rounded-md border border-input bg-transparent p-3 focus-visible:outline-2 focus-visible:outline-primary"
                    />
                    {errors.notes && (
                        <p role="alert" className="text-sm text-destructive">
                            {errors.notes}
                        </p>
                    )}
                    <div className="flex items-center gap-3">
                        <Button
                            type="submit"
                            disabled={processing}
                            variant="outline"
                        >
                            Enregistrer les notes
                        </Button>
                        {recentlySuccessful && (
                            <p role="status" className="text-sm text-primary">
                                Notes enregistrées.
                            </p>
                        )}
                    </div>
                </>
            )}
        </Form>
    );
}
