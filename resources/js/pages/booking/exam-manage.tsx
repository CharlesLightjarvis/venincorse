import { Head, Link, usePage } from '@inertiajs/react';
import { CalendarCheck } from 'reicon-react';
import { useState } from 'react';
import { BookingShell } from '@/components/booking-shell';
import { ExamBookingDetails } from '@/components/exam-booking-details';
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
    canCancelExam,
    examProviderLabels,
    examScopeLabels,
    readExamBookings,
    saveExamBookings,
} from '@/data/exam-booking';
import { useExamBookings } from '@/hooks/use-exam-bookings';
import { exam } from '@/routes/booking';

export default function ManageExam() {
    const page = usePage();
    const id = new URLSearchParams(page.url.split('?')[1]).get('id');
    const bookings = useExamBookings();
    const booking = bookings.find((item) => item.id === id);
    const [confirmCancel, setConfirmCancel] = useState(false);
    const [showEmail, setShowEmail] = useState(false);
    const [error, setError] = useState('');
    function cancel() {
        const latest = readExamBookings();
        const current = latest.find((item) => item.id === id);
        if (!current || !canCancelExam(current)) {
            setError(
                'Le délai d’annulation est dépassé. Contacte le professeur.',
            );
            return;
        }
        saveExamBookings(
            latest.map((item) =>
                item.id === id ? { ...item, status: 'cancelled' } : item,
            ),
        );
        setConfirmCancel(false);
    }
    return (
        <BookingShell>
            <Head title="Mon inscription à la préparation" />
            {!booking ? (
                <div className="flex flex-col items-start gap-4">
                    <h1 className="text-3xl font-semibold">
                        Inscription introuvable
                    </h1>
                    <p className="text-muted-foreground">
                        Seules les inscriptions de démonstration de ce
                        navigateur sont disponibles.
                    </p>
                    <Button asChild>
                        <Link href={exam()}>Choisir une préparation</Link>
                    </Button>
                </div>
            ) : (
                <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
                    <span className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                        <CalendarCheck />
                    </span>
                    <h1 className="text-3xl font-semibold">
                        {booking.status === 'cancelled'
                            ? 'Ta préparation a été annulée.'
                            : 'Ta préparation est réservée !'}
                    </h1>
                    <p className="text-muted-foreground">
                        {booking.status === 'cancelled'
                            ? 'La place est libérée. Le remboursement des échéances réglées est simulé et les échéances restantes sont annulées.'
                            : 'Voici ton récapitulatif et ton planning. Aucun compte créé, débit bancaire ou email envoyé.'}
                    </p>
                    <section className="rounded-3xl border border-border/60 bg-background p-6">
                        <ExamBookingDetails booking={booking} />
                    </section>
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
                        <div className="flex flex-col gap-3 rounded-xl bg-muted/50 p-5 text-sm">
                            <p className="font-semibold">
                                Aperçu uniquement — aucun envoi
                            </p>
                            <p>À : {booking.email}</p>
                            <p>
                                Bonjour {booking.name}, ton inscription à la
                                préparation{' '}
                                {examProviderLabels[booking.provider]}{' '}
                                {booking.level.toUpperCase()} (
                                {examScopeLabels[booking.scope]}) est{' '}
                                {booking.status === 'cancelled'
                                    ? 'annulée'
                                    : 'confirmée dans cette démo'}
                                . Le planning et les échéances sont disponibles
                                sur ta page de réservation. L’inscription à
                                l’examen officiel n’est pas incluse.
                            </p>
                        </div>
                    )}
                    {booking.status === 'confirmed' && (
                        <>
                            <p className="text-sm text-muted-foreground">
                                Annulation de démonstration sous 14 jours et
                                avant le début de la préparation. Pour modifier
                                le certificat, les épreuves ou le rythme,
                                contacte le professeur.
                            </p>
                            <Button
                                variant="outline"
                                disabled={!canCancelExam(booking)}
                                className="self-start rounded-full"
                                onClick={() => setConfirmCancel(true)}
                            >
                                Annuler ma préparation
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
                        <DialogTitle>Annuler cette préparation ?</DialogTitle>
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
