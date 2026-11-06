import { Head, Link, usePage } from '@inertiajs/react';
import { CalendarCheck } from 'reicon-react';
import { useState } from 'react';
import { BookingShell } from '@/components/booking-shell';
import { CourseSchedule } from '@/components/course-schedule';
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
import { formatCourseMoney } from '@/data/course-booking';
import { tierLabels } from '@/data/offer';
import {
    canCancelWorkshop,
    readWorkshopBookings,
    saveWorkshopBookings,
    workshopScheduleSummary,
} from '@/data/workshop-booking';
import { useWorkshopBookings } from '@/hooks/use-workshop-bookings';
import { workshop } from '@/routes/booking';
import { workshops as workshopsRoute } from '@/routes';
import { show as workshopDetail } from '@/routes/workshops';

export default function ManageWorkshop() {
    const page = usePage();
    const id = new URLSearchParams(page.url.split('?')[1]).get('id');
    const bookings = useWorkshopBookings();
    const booking = bookings.find((item) => item.id === id);
    const [confirmCancel, setConfirmCancel] = useState(false);
    const [showEmail, setShowEmail] = useState(false);
    const [error, setError] = useState('');

    function cancel() {
        const latest = readWorkshopBookings();
        const current = latest.find((item) => item.id === id);
        if (!current || !canCancelWorkshop(current)) {
            setError(
                'Le délai d’annulation est dépassé. Contacte le professeur.',
            );
            return;
        }
        saveWorkshopBookings(
            latest.map((item) =>
                item.id === id ? { ...item, status: 'cancelled' } : item,
            ),
        );
        setConfirmCancel(false);
    }

    return (
        <BookingShell>
            <Head title="Ma réservation d’atelier" />
            {!booking ? (
                <div className="flex flex-col items-start gap-4">
                    <h1 className="text-3xl font-semibold">
                        Réservation introuvable
                    </h1>
                    <p className="text-muted-foreground">
                        Seules les réservations de démonstration de ce
                        navigateur sont disponibles.
                    </p>
                    <Button asChild>
                        <Link href={workshopsRoute()}>Choisir un atelier</Link>
                    </Button>
                </div>
            ) : (
                <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
                    <span className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                        <CalendarCheck />
                    </span>
                    <h1 className="text-3xl font-semibold">
                        {booking.status === 'cancelled'
                            ? 'Ta réservation a été annulée.'
                            : 'C’est réservé !'}
                    </h1>
                    <p className="text-muted-foreground">
                        {booking.status === 'cancelled'
                            ? 'La place a été libérée. Le remboursement des échéances déjà réglées est simulé ; les échéances restantes sont annulées.'
                            : `${booking.name}, ta réservation est confirmée dans cette démo. Aucun compte n’a été créé et aucun email envoyé.`}
                    </p>

                    <section className="flex flex-col gap-5 rounded-3xl border border-border/60 bg-background p-6">
                        <div className="flex flex-wrap items-center gap-2">
                            <Badge variant="secondary">
                                {booking.category === 'grammar'
                                    ? 'Pack de grammaire'
                                    : 'Atelier pratique'}
                            </Badge>
                            <Badge variant="outline">
                                {booking.level.toUpperCase()}
                            </Badge>
                        </div>
                        <h2 className="text-2xl font-semibold">
                            {booking.title}
                        </h2>
                        <p>
                            {tierLabels[booking.tier]} ·{' '}
                            {workshopScheduleSummary(booking)}
                        </p>
                        <p className="text-sm break-words text-muted-foreground">
                            {booking.email}
                            <br />
                            Objectif : {booking.goal}
                        </p>
                        <p className="text-lg font-semibold">
                            Total : {formatCourseMoney(booking.totalCents)}
                        </p>
                        <ol className="flex flex-col gap-2 text-sm">
                            {booking.paymentsCents.map((amount, index) => (
                                <li key={index}>
                                    Échéance {index + 1} ·{' '}
                                    {index === 0
                                        ? 'à la réservation'
                                        : `à J+${index * 30}`}{' '}
                                    : {formatCourseMoney(amount)} (
                                    {booking.status === 'cancelled'
                                        ? index === 0
                                            ? 'remboursement simulé'
                                            : 'annulée'
                                        : index === 0
                                          ? 'paiement simulé'
                                          : 'prévue, sans prélèvement réel'}
                                    )
                                </li>
                            ))}
                        </ol>
                        <p className="text-xs break-all text-muted-foreground">
                            Référence : {booking.id}
                        </p>
                        <Alert>
                            <AlertDescription>
                                Les séances se tiendraient sur Google Meet.
                                Aucun lien réel n’est créé dans cette démo.
                            </AlertDescription>
                        </Alert>
                        <div className="flex flex-wrap gap-2">
                            <Button
                                variant="outline"
                                className="rounded-full"
                                onClick={() => setShowEmail(!showEmail)}
                            >
                                {showEmail
                                    ? 'Masquer l’aperçu d’email'
                                    : 'Voir l’aperçu d’email'}
                            </Button>
                            <Button
                                variant="ghost"
                                className="rounded-full"
                                asChild
                            >
                                <Link
                                    href={workshopDetail.url(booking.offerId, {
                                        query: {
                                            tier: booking.tier,
                                            level: booking.level,
                                        },
                                    })}
                                >
                                    Revoir la fiche
                                </Link>
                            </Button>
                        </div>
                        {showEmail && (
                            <p className="rounded-xl bg-muted/50 p-4 text-sm">
                                Aperçu non envoyé à {booking.email} : Bonjour{' '}
                                {booking.name}, ta réservation pour{' '}
                                {booking.title} ({booking.level.toUpperCase()}),
                                en {tierLabels[booking.tier]}, est{' '}
                                {booking.status === 'cancelled'
                                    ? 'annulée'
                                    : 'confirmée'}
                                . Retrouve ton planning sur ta page de
                                réservation. Aucun lien Meet réel pour le
                                moment.
                            </p>
                        )}
                    </section>

                    <section className="rounded-3xl border border-border/60 bg-background p-6">
                        <CourseSchedule
                            sessions={booking.cohort.sessions}
                            timezone={booking.timezone}
                        />
                    </section>

                    {booking.status === 'confirmed' && (
                        <>
                            <p className="text-sm text-muted-foreground">
                                {booking.category === 'practice'
                                    ? 'Annulation de démonstration possible jusqu’à 24 h avant la séance.'
                                    : 'Annulation de démonstration possible jusqu’à 7 jours avant la première séance.'}{' '}
                                Pour déplacer une séance, contacte le
                                professeur.
                            </p>
                            <Button
                                variant="outline"
                                disabled={!canCancelWorkshop(booking)}
                                className="self-start rounded-full"
                                onClick={() => setConfirmCancel(true)}
                            >
                                Annuler ma réservation
                            </Button>
                        </>
                    )}

                    <Button
                        asChild
                        variant="ghost"
                        className="self-start rounded-full"
                    >
                        <Link href={workshop()}>Réserver un autre atelier</Link>
                    </Button>

                    <p className="text-xs text-muted-foreground">
                        Prototype local : cette page n’est pas un lien sécurisé.
                        N’utilise pas de données personnelles réelles.
                    </p>
                </div>
            )}

            <Dialog open={confirmCancel} onOpenChange={setConfirmCancel}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Annuler cette réservation ?</DialogTitle>
                        <DialogDescription>
                            La place sera libérée et le remboursement simulé.
                            Aucun mouvement bancaire réel.
                        </DialogDescription>
                    </DialogHeader>
                    {error && <p role="alert">{error}</p>}
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setConfirmCancel(false)}
                        >
                            Garder ma réservation
                        </Button>
                        <Button variant="destructive" onClick={cancel}>
                            Confirmer l’annulation
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </BookingShell>
    );
}
