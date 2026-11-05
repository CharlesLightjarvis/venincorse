import { Head } from '@inertiajs/react';
import {
    CalendarDays,
    ClipboardList,
    Clock,
    Search,
    SlidersHorizontal,
} from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { toast } from 'sonner';
import { BookingShell } from '@/components/booking-shell';
import { CourseBookingsPanel } from '@/components/course-bookings-panel';
import { ExamBookingsPanel } from '@/components/exam-bookings-panel';
import { WorkshopBookingsPanel } from '@/components/workshop-bookings-panel';
import { PartnerRequestsPanel } from '@/components/partner-requests-panel';
import { selectClassName } from '@/components/trial-slot-picker';
import { Alert, AlertDescription } from '@/components/ui/alert';
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
import {
    formatTrialDate,
    readTrialState,
    saveTrialState,
    type TrialAvailability,
    type TrialBooking,
} from '@/data/trial-booking';
import { useTrialBooking } from '@/hooks/use-trial-booking';
import { cn } from '@/lib/utils';

const tabs = [
    { id: 'calendar', label: 'Agenda', icon: CalendarDays },
    { id: 'bookings', label: 'Réservations', icon: ClipboardList },
    { id: 'availability', label: 'Disponibilités', icon: SlidersHorizontal },
    { id: 'courses', label: 'Parcours', icon: ClipboardList },
    { id: 'workshops', label: 'Ateliers', icon: ClipboardList },
    { id: 'exams', label: 'Prépas examens', icon: ClipboardList },
    { id: 'partners', label: 'Partenariats', icon: ClipboardList },
] as const;
const statusLabels = {
    confirmed: 'À venir',
    completed: 'Réalisée',
    cancelled: 'Annulée',
};

export default function TeacherTrials() {
    const state = useTrialBooking();
    const [tab, setTab] = useState<
        | 'calendar'
        | 'bookings'
        | 'availability'
        | 'courses'
        | 'workshops'
        | 'exams'
        | 'partners'
    >('calendar');
    const [search, setSearch] = useState('');
    const [status, setStatus] = useState('all');
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const selected = state.bookings.find(
        (booking) => booking.id === selectedId,
    );
    const [notes, setNotes] = useState('');
    const [recommendation, setRecommendation] = useState('');
    const [availability, setAvailability] = useState<TrialAvailability>(
        state.availability,
    );
    const [absence, setAbsence] = useState('');
    const [availabilityError, setAvailabilityError] = useState('');
    const [cancelConfirm, setCancelConfirm] = useState(false);
    const now = Date.now();
    const visible = state.bookings
        .filter(
            (booking) =>
                (tab !== 'calendar' ||
                    (booking.status === 'confirmed' &&
                        new Date(booking.startsAt).getTime() > now)) &&
                (tab !== 'bookings' ||
                    status === 'all' ||
                    booking.status === status) &&
                `${booking.name} ${booking.email} ${booking.goal}`
                    .toLocaleLowerCase('fr')
                    .includes(search.toLocaleLowerCase('fr')),
        )
        .sort((a, b) => a.startsAt.localeCompare(b.startsAt));

    function openBooking(booking: TrialBooking) {
        setSelectedId(booking.id);
        setNotes(booking.notes);
        setRecommendation(booking.recommendation);
        setCancelConfirm(false);
    }

    function updateSelected(changes: Partial<TrialBooking>) {
        const latest = readTrialState();
        saveTrialState({
            ...latest,
            bookings: latest.bookings.map((booking) =>
                booking.id === selectedId
                    ? { ...booking, ...changes }
                    : booking,
            ),
        });
        toast.success('Réservation mise à jour dans cette démo.');
    }

    function saveAvailability(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setAvailabilityError('');
        if (
            availability.weekdays.length === 0 ||
            availability.hours.length === 0
        ) {
            setAvailabilityError(
                'Choisis au moins un jour et une heure. Utilise les absences pour fermer une journée.',
            );
            return;
        }
        saveTrialState({ ...readTrialState(), availability });
        toast.success(
            'Disponibilités enregistrées. Les réservations existantes sont conservées.',
        );
    }

    return (
        <BookingShell teacherView>
            <Head title="Cours d’essai — gestion démo" />
            <div className="flex flex-col gap-3">
                <p className="text-sm font-medium text-primary">
                    Espace professeur · démonstration publique
                </p>
                <h1 className="text-3xl font-semibold sm:text-4xl">
                    Tes réservations, au même endroit.
                </h1>
                <p className="max-w-2xl text-muted-foreground">
                    Prépare tes prochaines séances et garde une trace de chaque
                    rencontre. Les modifications restent dans ce navigateur.
                </p>
            </div>
            <div
                role="tablist"
                aria-label="Gestion des essais"
                className="flex flex-wrap gap-2 border-b border-border/60 pb-4"
            >
                {tabs.map((item) => (
                    <Button
                        key={item.id}
                        id={`tab-${item.id}`}
                        role="tab"
                        aria-selected={tab === item.id}
                        aria-controls={`panel-${item.id}`}
                        variant={tab === item.id ? 'default' : 'ghost'}
                        className="rounded-full"
                        onClick={() => {
                            setTab(item.id);
                            if (item.id === 'availability') {
                                setAvailability(readTrialState().availability);
                            }
                        }}
                    >
                        <item.icon />
                        {item.label}
                    </Button>
                ))}
            </div>
            <section
                role="tabpanel"
                id={`panel-${tab}`}
                aria-labelledby={`tab-${tab}`}
                className="flex flex-col gap-6"
            >
                {tab === 'partners' ? (
                    <PartnerRequestsPanel />
                ) : tab === 'exams' ? (
                    <ExamBookingsPanel />
                ) : tab === 'workshops' ? (
                    <WorkshopBookingsPanel />
                ) : tab === 'courses' ? (
                    <CourseBookingsPanel />
                ) : tab !== 'availability' ? (
                    <>
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                            <div>
                                <h2 className="text-2xl font-semibold">
                                    {tab === 'calendar'
                                        ? 'Prochaines séances'
                                        : 'Toutes les réservations'}
                                </h2>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    {visible.length} séance(s) · horaires du
                                    professeur en UTC
                                </p>
                            </div>
                            <div className="flex flex-wrap gap-3">
                                <div className="flex flex-col gap-2">
                                    <Label htmlFor="booking-search">
                                        <Search className="inline size-3.5" />{' '}
                                        Rechercher un élève
                                    </Label>
                                    <Input
                                        id="booking-search"
                                        value={search}
                                        onChange={(event) =>
                                            setSearch(event.target.value)
                                        }
                                        placeholder="Nom, email, objectif…"
                                    />
                                </div>
                                {tab === 'bookings' && (
                                    <div className="flex flex-col gap-2">
                                        <Label htmlFor="status">Statut</Label>
                                        <select
                                            id="status"
                                            className={selectClassName}
                                            value={status}
                                            onChange={(event) =>
                                                setStatus(event.target.value)
                                            }
                                        >
                                            <option value="all">Tous</option>
                                            <option value="confirmed">
                                                À venir
                                            </option>
                                            <option value="completed">
                                                Réalisées
                                            </option>
                                            <option value="cancelled">
                                                Annulées
                                            </option>
                                        </select>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="overflow-hidden rounded-3xl border border-border/60 bg-background">
                            {visible.length === 0 && (
                                <div
                                    role="status"
                                    className="flex flex-col gap-3 p-8"
                                >
                                    <h3 className="text-lg font-semibold">
                                        Aucune séance à afficher
                                    </h3>
                                    <p className="text-sm text-muted-foreground">
                                        Modifie tes filtres ou crée une
                                        réservation depuis la vue visiteur.
                                    </p>
                                </div>
                            )}
                            {visible.map((booking) => (
                                <button
                                    key={booking.id}
                                    onClick={() => openBooking(booking)}
                                    className="flex w-full flex-col gap-4 border-b border-border/40 p-5 text-left transition-colors last:border-b-0 hover:bg-muted/40 focus-visible:outline-2 focus-visible:outline-primary sm:flex-row sm:items-center sm:p-6"
                                >
                                    <div className="flex items-center gap-4 sm:w-56 sm:shrink-0">
                                        <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-lg font-semibold text-primary">
                                            {new Date(
                                                booking.startsAt,
                                            ).getUTCDate()}
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium">
                                                {new Intl.DateTimeFormat(
                                                    'fr-FR',
                                                    {
                                                        weekday: 'short',
                                                        month: 'short',
                                                        day: 'numeric',
                                                        timeZone: 'UTC',
                                                    },
                                                ).format(
                                                    new Date(booking.startsAt),
                                                )}
                                            </p>
                                            <p className="mt-1 text-xs text-muted-foreground">
                                                {new Intl.DateTimeFormat(
                                                    'fr-FR',
                                                    {
                                                        hour: '2-digit',
                                                        minute: '2-digit',
                                                        timeZone: 'UTC',
                                                    },
                                                ).format(
                                                    new Date(booking.startsAt),
                                                )}{' '}
                                                · 60 min
                                            </p>
                                        </div>
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <h3 className="font-semibold">
                                            {booking.name}
                                        </h3>
                                        <p className="mt-1 truncate text-sm text-muted-foreground">
                                            {booking.goal}
                                        </p>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-2">
                                        <Badge variant="outline">
                                            {booking.level}
                                        </Badge>
                                        <Badge variant="secondary">
                                            {statusLabels[booking.status]}
                                        </Badge>
                                        <span className="text-xs text-muted-foreground">
                                            {booking.payment === 'paid'
                                                ? '39 € · payé (démo)'
                                                : '39 € · remboursé (démo)'}
                                        </span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </>
                ) : (
                    <form
                        onSubmit={saveAvailability}
                        className="flex max-w-3xl flex-col gap-7 rounded-3xl border border-border/60 bg-background p-5 sm:p-8"
                    >
                        <div>
                            <h2 className="text-2xl font-semibold">
                                Quand souhaites-tu enseigner ?
                            </h2>
                            <p className="mt-2 text-sm text-muted-foreground">
                                Horaires en UTC. Les visiteurs les voient dans
                                leur fuseau. Réservation au moins 24 h à
                                l’avance, sur les 14 prochains jours.
                            </p>
                        </div>
                        <fieldset>
                            <legend className="mb-3 text-sm font-medium">
                                Jours ouverts
                            </legend>
                            <div className="flex flex-wrap gap-2">
                                {[
                                    'Dimanche',
                                    'Lundi',
                                    'Mardi',
                                    'Mercredi',
                                    'Jeudi',
                                    'Vendredi',
                                    'Samedi',
                                ].map((day, index) => (
                                    <label
                                        key={day}
                                        className={cn(
                                            'cursor-pointer rounded-xl border px-3 py-2 text-sm has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring',
                                            availability.weekdays.includes(
                                                index,
                                            )
                                                ? 'border-primary bg-primary/10'
                                                : 'border-border',
                                        )}
                                    >
                                        <input
                                            type="checkbox"
                                            className="sr-only"
                                            checked={availability.weekdays.includes(
                                                index,
                                            )}
                                            onChange={(event) =>
                                                setAvailability({
                                                    ...availability,
                                                    weekdays: event.target
                                                        .checked
                                                        ? [
                                                              ...availability.weekdays,
                                                              index,
                                                          ]
                                                        : availability.weekdays.filter(
                                                              (item) =>
                                                                  item !==
                                                                  index,
                                                          ),
                                                })
                                            }
                                        />
                                        {day}
                                    </label>
                                ))}
                            </div>
                        </fieldset>
                        <fieldset>
                            <legend className="mb-3 text-sm font-medium">
                                Débuts de séance proposés (UTC)
                            </legend>
                            <div className="flex flex-wrap gap-2">
                                {[9, 11, 14, 16, 18].map((hour) => (
                                    <label
                                        key={hour}
                                        className={cn(
                                            'cursor-pointer rounded-xl border px-4 py-2 text-sm has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring',
                                            availability.hours.includes(hour)
                                                ? 'border-primary bg-primary/10'
                                                : 'border-border',
                                        )}
                                    >
                                        <input
                                            type="checkbox"
                                            className="sr-only"
                                            checked={availability.hours.includes(
                                                hour,
                                            )}
                                            onChange={(event) =>
                                                setAvailability({
                                                    ...availability,
                                                    hours: event.target.checked
                                                        ? [
                                                              ...availability.hours,
                                                              hour,
                                                          ]
                                                        : availability.hours.filter(
                                                              (item) =>
                                                                  item !== hour,
                                                          ),
                                                })
                                            }
                                        />
                                        {hour}:00
                                    </label>
                                ))}
                            </div>
                            <p className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                                <Clock className="size-4" />
                                Séances de 60 min, avec au moins 60 min entre
                                deux séances proposées.
                            </p>
                        </fieldset>
                        <div className="flex flex-col gap-3">
                            <Label htmlFor="absence">
                                Ajouter une journée d’absence (UTC)
                            </Label>
                            <div className="flex flex-wrap gap-2">
                                <Input
                                    id="absence"
                                    className="w-auto"
                                    type="date"
                                    min={new Date().toISOString().slice(0, 10)}
                                    value={absence}
                                    onChange={(event) =>
                                        setAbsence(event.target.value)
                                    }
                                />
                                <Button
                                    type="button"
                                    variant="outline"
                                    disabled={!absence}
                                    onClick={() => {
                                        setAvailability({
                                            ...availability,
                                            blockedDates: [
                                                ...new Set([
                                                    ...availability.blockedDates,
                                                    absence,
                                                ]),
                                            ],
                                        });
                                        setAbsence('');
                                    }}
                                >
                                    Ajouter
                                </Button>
                            </div>
                            {availability.blockedDates.map((date) => (
                                <div
                                    key={date}
                                    className="flex items-center justify-between gap-3 rounded-xl bg-muted/40 px-3 py-2 text-sm"
                                >
                                    <span>
                                        {new Intl.DateTimeFormat('fr-FR', {
                                            dateStyle: 'long',
                                            timeZone: 'UTC',
                                        }).format(
                                            new Date(`${date}T12:00:00Z`),
                                        )}
                                    </span>
                                    <Button
                                        type="button"
                                        size="sm"
                                        variant="ghost"
                                        onClick={() =>
                                            setAvailability({
                                                ...availability,
                                                blockedDates:
                                                    availability.blockedDates.filter(
                                                        (item) => item !== date,
                                                    ),
                                            })
                                        }
                                    >
                                        Retirer
                                    </Button>
                                </div>
                            ))}
                        </div>
                        <Alert>
                            <AlertDescription>
                                Ces réglages ne déplacent ni n’annulent les
                                séances déjà réservées. Aucun agenda externe
                                n’est synchronisé.
                            </AlertDescription>
                        </Alert>
                        {availabilityError && (
                            <p
                                role="alert"
                                className="text-sm text-destructive"
                            >
                                {availabilityError}
                            </p>
                        )}
                        <Button
                            type="submit"
                            className="self-start rounded-full"
                        >
                            Enregistrer les disponibilités
                        </Button>
                    </form>
                )}
            </section>
            <Dialog
                open={Boolean(selected)}
                onOpenChange={(open) => {
                    if (!open) {
                        setSelectedId(null);
                    }
                }}
            >
                <DialogContent className="max-h-[90svh] overflow-y-auto sm:max-w-xl">
                    <DialogHeader>
                        <DialogTitle>
                            {selected?.name} · cours d’essai
                        </DialogTitle>
                        <DialogDescription>
                            {selected &&
                                formatTrialDate(selected.startsAt, 'UTC')}{' '}
                            · UTC
                        </DialogDescription>
                    </DialogHeader>
                    {selected && (
                        <div className="flex flex-col gap-5">
                            <dl className="grid grid-cols-[90px_1fr] gap-3 text-sm">
                                <dt className="text-muted-foreground">Email</dt>
                                <dd className="break-all">{selected.email}</dd>
                                <dt className="text-muted-foreground">
                                    Niveau
                                </dt>
                                <dd>{selected.level}</dd>
                                <dt className="text-muted-foreground">
                                    Objectif
                                </dt>
                                <dd>{selected.goal}</dd>
                                <dt className="text-muted-foreground">
                                    Paiement
                                </dt>
                                <dd>
                                    39 € ·{' '}
                                    {selected.payment === 'paid'
                                        ? 'payé'
                                        : 'remboursé'}{' '}
                                    (simulation)
                                </dd>
                                <dt className="text-muted-foreground">
                                    Statut
                                </dt>
                                <dd>{statusLabels[selected.status]}</dd>
                            </dl>
                            <Alert>
                                <AlertDescription>
                                    Google Meet : aucun lien réel configuré dans
                                    cette démo. Aucun email ou rappel n’est
                                    envoyé.
                                </AlertDescription>
                            </Alert>
                            <div className="flex flex-col gap-2">
                                <Label htmlFor="private-notes">
                                    Notes privées du professeur (simulées)
                                </Label>
                                <textarea
                                    id="private-notes"
                                    rows={4}
                                    value={notes}
                                    onChange={(event) =>
                                        setNotes(event.target.value)
                                    }
                                    className="rounded-md border border-input bg-background p-3 text-sm focus-visible:outline-2 focus-visible:outline-ring"
                                    placeholder="Points à travailler, aisance à l’oral…"
                                />
                            </div>
                            <div className="flex flex-col gap-2">
                                <Label htmlFor="recommendation">
                                    Parcours recommandé
                                </Label>
                                <select
                                    id="recommendation"
                                    className={selectClassName}
                                    value={recommendation}
                                    onChange={(event) =>
                                        setRecommendation(event.target.value)
                                    }
                                >
                                    <option value="">À déterminer</option>
                                    {['A1', 'A2', 'B1', 'B2'].map((level) => (
                                        <option key={level}>{level}</option>
                                    ))}
                                </select>
                            </div>
                            <Button
                                onClick={() =>
                                    updateSelected({ notes, recommendation })
                                }
                            >
                                Enregistrer le retour
                            </Button>
                            {selected.status === 'confirmed' && (
                                <div className="flex flex-col gap-3">
                                    <Button
                                        variant="outline"
                                        onClick={() =>
                                            updateSelected({
                                                status: 'completed',
                                                notes,
                                                recommendation,
                                            })
                                        }
                                    >
                                        Marquer comme réalisée (démo)
                                    </Button>
                                    {cancelConfirm ? (
                                        <Alert>
                                            <AlertDescription>
                                                Confirmer l’annulation et le
                                                remboursement simulé ?
                                            </AlertDescription>
                                            <div className="col-start-2 mt-3 flex gap-2">
                                                <Button
                                                    size="sm"
                                                    variant="destructive"
                                                    onClick={() => {
                                                        updateSelected({
                                                            status: 'cancelled',
                                                            payment: 'refunded',
                                                        });
                                                        setCancelConfirm(false);
                                                    }}
                                                >
                                                    Confirmer
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() =>
                                                        setCancelConfirm(false)
                                                    }
                                                >
                                                    Garder la séance
                                                </Button>
                                            </div>
                                        </Alert>
                                    ) : (
                                        <Button
                                            variant="ghost"
                                            onClick={() =>
                                                setCancelConfirm(true)
                                            }
                                        >
                                            Annuler la séance (démo)
                                        </Button>
                                    )}
                                </div>
                            )}
                            <p className="text-xs text-muted-foreground">
                                Les notes ne sont pas affichées dans la vue
                                visiteur. Ce prototype public n’offre aucune
                                confidentialité réelle.
                            </p>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </BookingShell>
    );
}
