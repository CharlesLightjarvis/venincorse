import { Link } from '@inertiajs/react';
import { useState } from 'react';
import { toast } from 'sonner';
import { ExamBookingDetails } from '@/components/exam-booking-details';
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
import {
    examProviderLabels,
    examScopeLabels,
    readExamBookings,
    saveExamBookings,
} from '@/data/exam-booking';
import { tierLabels } from '@/data/offer';
import { useExamBookings } from '@/hooks/use-exam-bookings';
import { exam } from '@/routes/booking';

export function ExamBookingsPanel() {
    const bookings = useExamBookings();
    const [search, setSearch] = useState('');
    const [id, setId] = useState<string | null>(null);
    const [notes, setNotes] = useState('');
    const [confirmCancel, setConfirmCancel] = useState(false);
    const selected = bookings.find((booking) => booking.id === id);
    const visible = bookings.filter((booking) =>
        `${booking.name} ${booking.email} ${booking.provider} ${booking.level} ${examScopeLabels[booking.scope]}`
            .toLowerCase()
            .includes(search.toLowerCase()),
    );
    return (
        <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <h2 className="text-2xl font-semibold">
                        Préparations aux examens
                    </h2>
                    <p className="mt-2 text-sm text-muted-foreground">
                        Certificat, niveau, épreuves, planning et paiements
                        simulés.
                    </p>
                </div>
                <Button asChild variant="outline">
                    <Link href={exam()}>Tester une inscription</Link>
                </Button>
            </div>
            <div className="flex max-w-sm flex-col gap-2">
                <Label htmlFor="exam-search">Rechercher une préparation</Label>
                <Input
                    id="exam-search"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Nom, certificat, niveau, épreuves…"
                />
            </div>
            {visible.length === 0 && (
                <p
                    role="status"
                    className="rounded-2xl border border-dashed border-border p-8 text-muted-foreground"
                >
                    Aucune inscription à afficher. Réserve une préparation dans
                    la vue visiteur pour la retrouver ici.
                </p>
            )}
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
                            {booking.name} ·{' '}
                            {examProviderLabels[booking.provider]}{' '}
                            {booking.level.toUpperCase()}
                        </p>
                        <p className="mt-1 text-sm text-muted-foreground">
                            {examScopeLabels[booking.scope]} ·{' '}
                            {tierLabels[booking.tier]}
                        </p>
                    </div>
                    <div className="flex flex-col gap-2">
                        <Badge variant="secondary">
                            {booking.status === 'confirmed'
                                ? 'Confirmée (démo)'
                                : 'Annulée (démo)'}
                        </Badge>
                        <span className="text-sm">
                            {formatCourseMoney(booking.totalCents)} ·{' '}
                            {booking.installments
                                ? '3 échéances'
                                : 'en une fois'}
                        </span>
                    </div>
                </button>
            ))}
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
                            {selected?.name} · préparation d’examen
                        </DialogTitle>
                        <DialogDescription>
                            Inscription locale de démonstration. Aucun paiement
                            réel.
                        </DialogDescription>
                    </DialogHeader>
                    {selected && (
                        <div className="flex flex-col gap-5">
                            <ExamBookingDetails
                                booking={{ ...selected, timezone: 'UTC' }}
                            />
                            <div className="flex flex-col gap-2">
                                <Label htmlFor="exam-notes">
                                    Notes privées simulées
                                </Label>
                                <textarea
                                    id="exam-notes"
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
                                    saveExamBookings(
                                        readExamBookings().map((item) =>
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
                                                saveExamBookings(
                                                    readExamBookings().map(
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
                                            Garder l’inscription
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
                            <p className="text-xs text-muted-foreground">
                                Ces notes ne sont pas affichées dans la vue
                                visiteur. Ce prototype public n’offre pas de
                                confidentialité réelle.
                            </p>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
