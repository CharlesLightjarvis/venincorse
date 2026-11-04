import { Head, Link, usePage } from '@inertiajs/react';
import { CalendarCheck } from 'lucide-react';
import { useState } from 'react';
import { BookingShell } from '@/components/booking-shell';
import { CourseSchedule } from '@/components/course-schedule';
import { Alert, AlertDescription } from '@/components/ui/alert';
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
    canCancelCourse,
    formatCourseMoney,
    readCourseBookings,
    saveCourseBookings,
} from '@/data/course-booking';
import { formats, getLevel, tierLabels } from '@/data/offer';
import { useCourseBookings } from '@/hooks/use-course-bookings';
import { course } from '@/routes/booking';

export default function ManageCourse() {
    const page = usePage();
    const id = new URLSearchParams(page.url.split('?')[1]).get('id');
    const bookings = useCourseBookings();
    const booking = bookings.find((item) => item.id === id);
    const [confirmCancel, setConfirmCancel] = useState(false);
    const [showEmail, setShowEmail] = useState(false);
    const [error, setError] = useState('');
    const level = getLevel(booking?.level);
    function cancel() {
        const latest = readCourseBookings();
        const current = latest.find((item) => item.id === id);
        if (!current || !canCancelCourse(current)) {
            setError(
                'Le délai d’annulation est dépassé. Contacte le professeur.',
            );
            return;
        }
        saveCourseBookings(
            latest.map((item) =>
                item.id === id ? { ...item, status: 'cancelled' } : item,
            ),
        );
        setConfirmCancel(false);
    }
    return (
        <BookingShell>
            <Head title="Mon inscription au parcours" />
            {!booking || !level ? (
                <div className="flex flex-col items-start gap-4">
                    <h1 className="text-3xl font-semibold">
                        Inscription introuvable
                    </h1>
                    <p className="text-muted-foreground">
                        Seules les inscriptions de démonstration de ce
                        navigateur sont disponibles.
                    </p>
                    <Button asChild>
                        <Link href={course()}>Choisir un parcours</Link>
                    </Button>
                </div>
            ) : (
                <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
                    <span className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                        <CalendarCheck />
                    </span>
                    <h1 className="text-3xl font-semibold">
                        {booking.status === 'cancelled'
                            ? 'Ton inscription a été annulée.'
                            : 'Bienvenue dans ton parcours !'}
                    </h1>
                    <p className="text-muted-foreground">
                        {booking.status === 'cancelled'
                            ? 'La place a été libérée. Le remboursement des échéances déjà réglées est simulé ; les échéances restantes sont annulées.'
                            : `${booking.name}, ton inscription est confirmée dans cette démo. Aucun compte n’a été créé et aucun email envoyé.`}
                    </p>
                    <section className="flex flex-col gap-5 rounded-3xl border border-border/60 bg-background p-6">
                        <h2 className="text-2xl font-semibold">
                            {level.code} — {level.name}
                        </h2>
                        <p>
                            {tierLabels[booking.tier]} ·{' '}
                            {
                                formats.find(
                                    (item) => item.id === booking.rhythm,
                                )?.name
                            }{' '}
                            · 60 h
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
                                Les cours se tiendront sur Google Meet. Aucun
                                lien réel n’est créé dans cette démo. L’accès à
                                l’espace élève et les invitations seront ajoutés
                                lors du développement backend.
                            </AlertDescription>
                        </Alert>
                        <Button
                            variant="outline"
                            className="self-start rounded-full"
                            onClick={() => setShowEmail(!showEmail)}
                        >
                            {showEmail
                                ? 'Masquer l’aperçu d’email'
                                : 'Voir l’aperçu d’email'}
                        </Button>
                        {showEmail && (
                            <p className="rounded-xl bg-muted/50 p-4 text-sm">
                                Aperçu non envoyé à {booking.email} : Bonjour{' '}
                                {booking.name}, ton inscription au parcours{' '}
                                {level.code}, en {tierLabels[booking.tier]}, est{' '}
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
                                Annulation de démonstration possible sous 14
                                jours et avant le début du parcours. Pour
                                modifier le rythme ou la formule, contacte le
                                professeur.
                            </p>
                            <Button
                                variant="outline"
                                disabled={!canCancelCourse(booking)}
                                className="self-start rounded-full"
                                onClick={() => setConfirmCancel(true)}
                            >
                                Annuler mon inscription
                            </Button>
                        </>
                    )}
                    <p className="text-xs text-muted-foreground">
                        Prototype local : cette page n’est pas un lien sécurisé.
                        N’utilise pas de données personnelles réelles.
                    </p>
                </div>
            )}
            <Dialog open={confirmCancel} onOpenChange={setConfirmCancel}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Annuler cette inscription ?</DialogTitle>
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
                            Garder mon inscription
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
