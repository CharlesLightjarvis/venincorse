import { Link } from '@inertiajs/react';
import { useState } from 'react';
import { toast } from 'sonner';
import { CourseSchedule } from '@/components/course-schedule';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { formatCourseMoney } from '@/data/course-booking';
import { tierLabels } from '@/data/offer';
import { formatTrialDate } from '@/data/trial-booking';
import {
    readWorkshopBookings,
    saveWorkshopBookings,
    workshopScheduleSummary,
} from '@/data/workshop-booking';
import { useWorkshopBookings } from '@/hooks/use-workshop-bookings';
import { workshop } from '@/routes/booking';

export function WorkshopBookingsPanel() {
    const bookings = useWorkshopBookings();
    const [search, setSearch] = useState('');
    const [id, setId] = useState<string | null>(null);
    const [notes, setNotes] = useState('');
    const [confirmCancel, setConfirmCancel] = useState(false);
    const selected = bookings.find((booking) => booking.id === id);
    const visible = bookings.filter((booking) =>
        `${booking.name} ${booking.email} ${booking.title} ${booking.level}`
            .toLowerCase()
            .includes(search.toLowerCase()),
    );

    return (
        <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <h2 className="text-2xl font-semibold">
                        Réservations des packs & ateliers
                    </h2>
                    <p className="mt-2 text-sm text-muted-foreground">
                        Offre choisie, niveau, planning et échéances de chaque
                        élève.
                    </p>
                </div>
                <Button asChild variant="outline">
                    <Link href={workshop()}>Tester une réservation</Link>
                </Button>
            </div>

            <div className="flex max-w-sm flex-col gap-2">
                <Label htmlFor="workshop-search">
                    Rechercher une réservation
                </Label>
                <Input
                    id="workshop-search"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Nom, email, offre ou niveau"
                />
            </div>

            {visible.length === 0 && (
                <p
                    role="status"
                    className="rounded-2xl border border-dashed border-border p-8 text-muted-foreground"
                >
                    Aucune réservation à afficher. Réserve un pack ou un atelier
                    dans la vue visiteur pour le voir ici.
                </p>
            )}

            <div className="flex flex-col gap-3">
                {visible.map((booking) => (
                    <button
                        key={booking.id}
                        onClick={() => {
                            setId(booking.id);
                            setNotes(booking.notes);
                            setConfirmCancel(false);
                        }}
                        className="flex flex-col gap-3 rounded-2xl border border-border/60 bg-background p-5 text-left hover:border-primary/40 focus-visible:outline-2 focus-visible:outline-primary sm:flex-row sm:items-center sm:justify-between"
                    >
                        <div>
                            <p className="font-semibold">
                                {booking.name} · {booking.title}
                            </p>
                            <p className="mt-1 text-sm text-muted-foreground">
                                {tierLabels[booking.tier]} ·{' '}
                                {booking.level.toUpperCase()} ·{' '}
                                {workshopScheduleSummary(booking)}
                            </p>
                            <p className="mt-1 text-xs text-muted-foreground">
                                Début :{' '}
                                {formatTrialDate(
                                    booking.cohort.startsAt,
                                    'UTC',
                                )}{' '}
                                · UTC
                            </p>
                        </div>
                        <div className="flex flex-col gap-2 sm:items-end">
                            <Badge variant="secondary">
                                {booking.category === 'grammar'
                                    ? 'Pack de grammaire'
                                    : 'Atelier pratique'}
                            </Badge>
                            <span className="text-sm">
                                {formatCourseMoney(booking.totalCents)} ·{' '}
                                {booking.installments
                                    ? '3 échéances'
                                    : 'en une fois'}
                            </span>
                            <span className="text-xs text-muted-foreground">
                                {booking.status === 'confirmed'
                                    ? 'Confirmée (démo)'
                                    : 'Annulée (démo)'}
                            </span>
                        </div>
                    </button>
                ))}
            </div>

            <Dialog
                open={Boolean(selected)}
                onOpenChange={(open) => {
                    if (!open) {
                        setId(null);
                    }
                }}
            >
                <DialogContent className="max-h-[90svh] overflow-y-auto sm:max-w-xl">
                    <DialogHeader>
                        <DialogTitle>
                            {selected?.name} · {selected?.title}
                        </DialogTitle>
                        <DialogDescription>
                            Réservation locale de démonstration. Aucun compte
                            élève ni paiement réel.
                        </DialogDescription>
                    </DialogHeader>
                    {selected && (
                        <div className="flex flex-col gap-5">
                            <p className="text-sm break-words">
                                {selected.email}
                                <br />
                                {selected.goal}
                            </p>
                            <p className="text-sm">
                                {selected.title} ·{' '}
                                {selected.level.toUpperCase()} ·{' '}
                                {tierLabels[selected.tier]} ·{' '}
                                {workshopScheduleSummary(selected)}
                            </p>
                            <p className="text-sm">
                                Total {formatCourseMoney(selected.totalCents)} ·
                                échéances :{' '}
                                {selected.paymentsCents
                                    .map(formatCourseMoney)
                                    .join(' / ')}
                            </p>
                            <p className="text-xs text-muted-foreground">
                                {selected.status === 'cancelled'
                                    ? 'Annulation et remboursement simulés.'
                                    : 'Seule la première échéance est considérée réglée dans cette simulation.'}
                            </p>
                            <CourseSchedule
                                sessions={selected.cohort.sessions}
                                timezone="UTC"
                            />
                            <div className="flex flex-col gap-2">
                                <Label htmlFor="workshop-notes">
                                    Notes privées simulées
                                </Label>
                                <textarea
                                    id="workshop-notes"
                                    rows={3}
                                    value={notes}
                                    onChange={(event) =>
                                        setNotes(event.target.value)
                                    }
                                    className="rounded-md border border-input bg-background p-3 text-sm"
                                />
                            </div>
                            <Button
                                onClick={() => {
                                    saveWorkshopBookings(
                                        readWorkshopBookings().map((item) =>
                                            item.id === selected.id
                                                ? { ...item, notes }
                                                : item,
                                        ),
                                    );
                                    toast.success(
                                        'Notes enregistrées dans cette démo.',
                                    );
                                }}
                            >
                                Enregistrer les notes
                            </Button>
                            {selected.status === 'confirmed' &&
                                (confirmCancel ? (
                                    <div className="flex flex-wrap gap-2">
                                        <Button
                                            variant="destructive"
                                            onClick={() => {
                                                saveWorkshopBookings(
                                                    readWorkshopBookings().map(
                                                        (item) =>
                                                            item.id ===
                                                            selected.id
                                                                ? {
                                                                      ...item,
                                                                      status: 'cancelled',
                                                                  }
                                                                : item,
                                                    ),
                                                );
                                                setConfirmCancel(false);
                                                toast.success(
                                                    'Annulation et remboursement simulés.',
                                                );
                                            }}
                                        >
                                            Confirmer l’annulation
                                        </Button>
                                        <Button
                                            variant="outline"
                                            onClick={() =>
                                                setConfirmCancel(false)
                                            }
                                        >
                                            Garder la réservation
                                        </Button>
                                    </div>
                                ) : (
                                    <Button
                                        variant="outline"
                                        onClick={() => setConfirmCancel(true)}
                                    >
                                        Annuler et simuler le remboursement
                                    </Button>
                                ))}
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
