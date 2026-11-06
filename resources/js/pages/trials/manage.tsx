import { Form, Head, Link, usePage } from '@inertiajs/react';
import { CalendarDays, Sliders } from 'reicon-react';
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
import { Label } from '@/components/ui/label';
import {
    formatReservationDate,
    formatReservationPrice,
    reservationStatusLabels,
    type TrialReservation,
} from '@/lib/trial-reservations';
import { edit as editAvailability } from '@/routes/trial-availability';
import { index, update } from '@/routes/trial-management';
import type { Auth } from '@/types';
import { useUserTimezone } from '@/hooks/use-browser-timezone';

export default function ManageTrials({
    reservations,
}: {
    reservations: TrialReservation[];
}) {
    const { auth } = usePage<{ auth: Auth }>().props;
    const timezone = useUserTimezone();
    return (
        <div className="flex h-full flex-1 flex-col gap-6 p-4">
            <Head title="Gestion des essais" />
            <div>
                <h1 className="text-3xl font-semibold">
                    Les cours d’essai, côté professeur.
                </h1>
                <p className="mt-3 text-muted-foreground">
                    Ajoute le lien de la visio et tes notes privées. Un paiement
                    ne peut pas être marqué comme réglé manuellement depuis cet
                    écran.
                </p>
            </div>
            {reservations.length === 0 && (
                <Empty className="border">
                    <EmptyHeader>
                        <EmptyMedia variant="icon">
                            <CalendarDays />
                        </EmptyMedia>
                        <EmptyTitle>
                            Aucune réservation pour le moment
                        </EmptyTitle>
                        <EmptyDescription>
                            Les cours d’essai réservés par les élèves
                            apparaîtront ici, avec leur paiement et leur lien de
                            visio.
                        </EmptyDescription>
                    </EmptyHeader>
                    {auth.can?.manageAvailability && (
                        <EmptyContent>
                            <Button asChild variant="outline">
                                <Link href={editAvailability()}>
                                    <Sliders data-icon="inline-start" />
                                    Gérer mes disponibilités
                                </Link>
                            </Button>
                        </EmptyContent>
                    )}
                </Empty>
            )}
            {reservations.map((reservation) => (
                <article
                    key={reservation.id}
                    className="rounded-lg border border-border p-5"
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
        </div>
    );
}

ManageTrials.layout = {
    breadcrumbs: [{ title: 'Gestion des essais', href: index() }],
};

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
                    <Label htmlFor={`meeting-url-${reservation.id}`}>
                        Lien de la visio
                    </Label>
                    <Input
                        id={`meeting-url-${reservation.id}`}
                        name="meeting_url"
                        type="url"
                        inputMode="url"
                        placeholder="https://meet.google.com/…"
                        defaultValue={reservation.meeting_url ?? ''}
                        maxLength={2048}
                        aria-invalid={errors.meeting_url ? true : undefined}
                    />
                    <p className="text-xs text-muted-foreground">
                        Visible par l’élève une fois son cours confirmé.
                    </p>
                    {errors.meeting_url && (
                        <p role="alert" className="text-sm text-destructive">
                            {errors.meeting_url}
                        </p>
                    )}
                    <div className="flex items-center gap-3">
                        <Button
                            type="submit"
                            disabled={processing}
                            variant="outline"
                        >
                            Enregistrer
                        </Button>
                        {recentlySuccessful && (
                            <p role="status" className="text-sm text-primary">
                                Modifications enregistrées.
                            </p>
                        )}
                    </div>
                </>
            )}
        </Form>
    );
}
