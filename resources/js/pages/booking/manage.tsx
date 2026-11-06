import { Head, Link, usePage } from '@inertiajs/react';
import { CalendarCheck, Envelope, Video } from 'reicon-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { BookingShell } from '@/components/booking-shell';
import { TrialSlotPicker } from '@/components/trial-slot-picker';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    canChangeTrial,
    formatTrialDate,
    getTrialSlots,
    readTrialState,
    saveTrialState,
} from '@/data/trial-booking';
import { useTrialBooking } from '@/hooks/use-trial-booking';
import { trial } from '@/routes';

export default function ManageTrialBooking() {
    const state = useTrialBooking();
    const page = usePage();
    const params = new URLSearchParams(page.url.split('?')[1]);
    const booking = state.bookings.find((item) => item.id === params.get('id'));
    const [action, setAction] = useState<'cancel' | 'reschedule' | null>(null);
    const [slot, setSlot] = useState('');
    const [timezone, setTimezone] = useState(
        booking?.timezone ?? 'Europe/Paris',
    );
    const [error, setError] = useState('');
    const [showEmail, setShowEmail] = useState(false);

    function applyChange() {
        const latest = readTrialState();
        const current = latest.bookings.find((item) => item.id === booking?.id);
        if (!current || !canChangeTrial(current)) {
            setError('Cette réservation ne peut plus être modifiée.');
            return;
        }
        if (action === 'reschedule' && !getTrialSlots(latest).includes(slot)) {
            setError(
                'Ce créneau n’est plus disponible. Choisis un autre horaire.',
            );
            return;
        }
        saveTrialState({
            ...latest,
            bookings: latest.bookings.map((item) =>
                item.id !== current.id
                    ? item
                    : action === 'cancel'
                      ? { ...item, status: 'cancelled', payment: 'refunded' }
                      : { ...item, startsAt: slot, timezone },
            ),
        });
        setAction(null);
        setSlot('');
        toast.success(
            action === 'cancel'
                ? 'Annulation et remboursement simulés.'
                : 'Créneau modifié dans cette démo.',
        );
    }

    return (
        <BookingShell>
            <Head title="Mon cours d’essai" />
            {!booking ? (
                <section className="flex flex-col items-start gap-4 py-10">
                    <h1 className="text-3xl font-semibold">
                        Réservation introuvable
                    </h1>
                    <p className="text-muted-foreground">
                        Cette démo ne retrouve que les réservations enregistrées
                        dans ce navigateur.
                    </p>
                    <Button asChild className="rounded-full">
                        <Link href={trial()}>Choisir un créneau</Link>
                    </Button>
                </section>
            ) : (
                <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
                    <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                        <CalendarCheck className="size-7" />
                    </div>
                    <div className="flex flex-col gap-3">
                        <Badge variant="secondary" className="self-start">
                            {booking.status === 'cancelled'
                                ? 'Annulée · remboursement simulé'
                                : booking.status === 'completed'
                                  ? 'Séance réalisée'
                                  : 'Confirmée · paiement simulé'}
                        </Badge>
                        <h1 className="text-3xl font-semibold sm:text-4xl">
                            {booking.status === 'cancelled'
                                ? 'Ton cours a été annulé.'
                                : params.get('confirmed') &&
                                    booking.status === 'confirmed'
                                  ? 'Ton rendez-vous est réservé.'
                                  : 'Ton cours d’essai'}
                        </h1>
                        <p className="text-muted-foreground">
                            {booking.status === 'cancelled'
                                ? 'Le créneau a été libéré dans cette démonstration.'
                                : `À bientôt, ${booking.name}. Retrouve ici les détails de ta séance.`}
                        </p>
                    </div>
                    <section className="flex flex-col gap-5 rounded-3xl border border-border/60 bg-background p-6 sm:p-8">
                        <h2 className="text-xl font-semibold">
                            {formatTrialDate(
                                booking.startsAt,
                                booking.timezone,
                            )}
                        </h2>
                        <p className="text-sm text-muted-foreground">
                            {booking.timezone} · 60 minutes · individuel
                        </p>
                        <dl className="grid grid-cols-[90px_1fr] gap-3 text-sm">
                            <dt className="text-muted-foreground">
                                Participant
                            </dt>
                            <dd className="break-words">
                                {booking.name}
                                <br />
                                {booking.email}
                            </dd>
                            <dt className="text-muted-foreground">Objectif</dt>
                            <dd className="break-words">{booking.goal}</dd>
                            <dt className="text-muted-foreground">Niveau</dt>
                            <dd>{booking.level}</dd>
                            <dt className="text-muted-foreground">Montant</dt>
                            <dd>
                                39 € ·{' '}
                                {booking.payment === 'paid'
                                    ? 'paiement simulé'
                                    : 'remboursement simulé'}
                            </dd>
                        </dl>
                        <p className="text-xs break-all text-muted-foreground">
                            Référence démo : {booking.id}
                        </p>
                        {booking.status === 'confirmed' && (
                            <Alert>
                                <Video />
                                <AlertDescription>
                                    Visio sur Google Meet. Aucun lien de réunion
                                    réel n’est créé dans cette démo. En
                                    production, tu le recevras avec la
                                    confirmation.
                                </AlertDescription>
                            </Alert>
                        )}
                        <Button
                            variant="outline"
                            className="self-start rounded-full"
                            onClick={() => setShowEmail(!showEmail)}
                        >
                            <Envelope />
                            {showEmail
                                ? 'Masquer l’aperçu d’email'
                                : 'Voir l’aperçu d’email'}
                        </Button>
                        {showEmail && (
                            <div className="flex flex-col gap-3 rounded-xl bg-muted/50 p-5 text-sm">
                                <p className="font-semibold">
                                    Aperçu uniquement — aucun email envoyé
                                </p>
                                <p>À : {booking.email}</p>
                                <p>
                                    Bonjour {booking.name}, ton cours d’essai
                                    est{' '}
                                    {booking.status === 'cancelled'
                                        ? 'annulé'
                                        : booking.status === 'completed'
                                          ? 'terminé'
                                          : `confirmé pour le ${formatTrialDate(booking.startsAt, booking.timezone)} (${booking.timezone})`}
                                    .
                                </p>
                                <p>
                                    Tu pourras retrouver les informations et
                                    gérer ta séance grâce au lien de
                                    réservation. Le lien Meet réel sera ajouté
                                    avant l’envoi en production.
                                </p>
                            </div>
                        )}
                    </section>
                    {booking.status === 'confirmed' && (
                        <>
                            <p className="text-sm text-muted-foreground">
                                Report et annulation jusqu’à 24 h avant le
                                cours. Remboursement simulé en cas d’annulation.
                            </p>
                            <div className="flex flex-wrap gap-3">
                                <Button
                                    variant="outline"
                                    className="rounded-full"
                                    disabled={!canChangeTrial(booking)}
                                    onClick={() => {
                                        setError('');
                                        setAction('reschedule');
                                    }}
                                >
                                    Reporter la séance
                                </Button>
                                <Button
                                    variant="ghost"
                                    className="rounded-full"
                                    disabled={!canChangeTrial(booking)}
                                    onClick={() => {
                                        setError('');
                                        setAction('cancel');
                                    }}
                                >
                                    Annuler la réservation
                                </Button>
                            </div>
                            {!canChangeTrial(booking) && (
                                <p className="text-sm text-muted-foreground">
                                    Le délai de modification est dépassé.
                                    Contacte le professeur pour un changement.
                                </p>
                            )}
                        </>
                    )}
                    {booking.status === 'cancelled' && (
                        <Button asChild className="self-start rounded-full">
                            <Link href={trial()}>
                                Réserver une autre séance
                            </Link>
                        </Button>
                    )}
                    <p className="text-xs leading-relaxed text-muted-foreground">
                        Cette page est une simulation locale, pas un lien de
                        gestion sécurisé. Aucun compte n’a été créé.
                    </p>
                </div>
            )}
            <Dialog
                open={action !== null}
                onOpenChange={(open) => {
                    if (!open) {
                        setAction(null);
                        setSlot('');
                    }
                }}
            >
                <DialogContent className="max-h-[90svh] overflow-y-auto sm:max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>
                            {action === 'cancel'
                                ? 'Annuler ce cours d’essai ?'
                                : 'Choisir un nouveau créneau'}
                        </DialogTitle>
                        <DialogDescription>
                            {action === 'cancel'
                                ? 'Le créneau sera libéré et le remboursement sera simulé. Aucun mouvement bancaire réel.'
                                : 'Ton ancien créneau reste réservé jusqu’à la confirmation du nouveau.'}
                        </DialogDescription>
                    </DialogHeader>
                    {error && (
                        <p role="alert" className="text-sm text-destructive">
                            {error}
                        </p>
                    )}
                    {action === 'reschedule' && (
                        <TrialSlotPicker
                            state={state}
                            value={slot}
                            onChange={setSlot}
                            timezone={timezone}
                            onTimezoneChange={setTimezone}
                        />
                    )}
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setAction(null)}
                        >
                            Garder ma réservation
                        </Button>
                        <Button
                            variant={
                                action === 'cancel' ? 'destructive' : 'default'
                            }
                            disabled={
                                action === 'reschedule' &&
                                !getTrialSlots(state).includes(slot)
                            }
                            onClick={applyChange}
                        >
                            {action === 'cancel'
                                ? 'Confirmer l’annulation'
                                : 'Confirmer le report'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </BookingShell>
    );
}
