import { Head, InfiniteScroll, Link, usePage } from '@inertiajs/react';
import { useRef } from 'react';
import {
    CalendarCheck,
    CalendarDays,
    CalendarRemove,
    CheckCircle,
    ChevronRight,
    Clock,
    CreditCard,
    Sliders,
    Video,
    type IconComponent,
} from 'reicon-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Empty,
    EmptyContent,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
} from '@/components/ui/empty';
import { Spinner } from '@/components/ui/spinner';
import { useUserTimezone } from '@/hooks/use-browser-timezone';
import { useInitials } from '@/hooks/use-initials';
import {
    reservationStatusBadgeVariant,
    reservationStatusLabels,
    type TrialReservation,
} from '@/lib/trial-reservations';
import { cn } from '@/lib/utils';
import { edit as editAvailability } from '@/routes/trial-availability';
import { index, show } from '@/routes/trial-management';
import type { Auth } from '@/types';

type Category = 'upcoming' | 'paying' | 'done' | 'cancelled';

const categories: {
    id: Category;
    label: string;
    caption: string;
    icon: IconComponent;
}[] = [
    {
        id: 'upcoming',
        label: 'À venir',
        caption: 'Payées, à préparer',
        icon: CalendarCheck,
    },
    {
        id: 'paying',
        label: 'Paiement en cours',
        caption: 'Pas encore payé ou à vérifier',
        icon: CreditCard,
    },
    {
        id: 'done',
        label: 'Réalisés',
        caption: 'Séances passées, à clôturer ou clôturées',
        icon: CheckCircle,
    },
    {
        id: 'cancelled',
        label: 'Annulés',
        caption: 'Expirés, annulés ou remboursés',
        icon: CalendarRemove,
    },
];

export default function ManageTrials({
    category,
    counts,
    reservations,
}: {
    category: Category | null;
    counts: Record<Category, number>;
    reservations: { data: TrialReservation[] };
}) {
    const { auth } = usePage<{ auth: Auth }>().props;
    const grid = useRef<HTMLDivElement>(null);
    const active = categories.find((item) => item.id === category);
    const total = Object.values(counts).reduce((sum, value) => sum + value, 0);

    return (
        <div className="flex h-full flex-1 flex-col gap-6 p-4">
            <Head title="Gestion des essais" />
            <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-semibold">
                        Gestion des essais
                    </h1>
                    <p className="mt-3 text-muted-foreground">
                        Tous les cours d’essai réservés. Ouvre une séance pour
                        ajouter le lien de la visio, tes notes, ou la clôturer.
                    </p>
                </div>
                {auth.can?.manageAvailability && (
                    <Button asChild variant="outline">
                        <Link href={editAvailability()}>
                            <Sliders data-icon="inline-start" />
                            Disponibilités
                        </Link>
                    </Button>
                )}
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {categories.map((item) => {
                    const selected = category === item.id;
                    return (
                        <Link
                            key={item.id}
                            href={index({
                                query: selected ? {} : { category: item.id },
                            })}
                            preserveScroll
                            aria-current={selected ? 'true' : undefined}
                            className={cn(
                                'rounded-lg border p-5 text-left transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none',
                                selected
                                    ? 'border-primary bg-primary/5'
                                    : 'border-border hover:bg-muted/30',
                            )}
                        >
                            <span className="flex items-center justify-between gap-3">
                                <span className="text-sm text-muted-foreground">
                                    {item.label}
                                </span>
                                <item.icon
                                    className={cn(
                                        'size-5',
                                        selected
                                            ? 'text-primary'
                                            : 'text-muted-foreground',
                                    )}
                                    aria-hidden="true"
                                />
                            </span>
                            <span className="mt-3 block text-2xl font-semibold">
                                {counts[item.id]}
                            </span>
                            <span className="mt-1 block text-sm text-muted-foreground">
                                {item.caption}
                            </span>
                        </Link>
                    );
                })}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-xl font-semibold">
                    {active ? active.label : 'Tous les essais'}{' '}
                    <span className="text-muted-foreground">
                        ({active ? counts[active.id] : total})
                    </span>
                </h2>
                {category && (
                    <Button asChild variant="ghost" size="sm">
                        <Link href={index()} preserveScroll>
                            Voir tous les essais
                        </Link>
                    </Button>
                )}
            </div>

            {reservations.data.length === 0 ? (
                <Empty className="border">
                    <EmptyHeader>
                        <EmptyMedia variant="icon">
                            <CalendarDays />
                        </EmptyMedia>
                        <EmptyTitle>
                            {category
                                ? 'Aucun essai dans cette catégorie'
                                : 'Aucune réservation pour le moment'}
                        </EmptyTitle>
                        <EmptyDescription>
                            {category
                                ? 'Choisis une autre catégorie ou affiche tous les essais.'
                                : 'Les cours d’essai réservés par les élèves apparaîtront ici, avec leur paiement et leur lien de visio.'}
                        </EmptyDescription>
                    </EmptyHeader>
                    {!category && auth.can?.manageAvailability && (
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
            ) : (
                <InfiniteScroll
                    data="reservations"
                    itemsElement={grid}
                    onlyNext
                    preserveUrl
                    loading={
                        <div className="flex justify-center py-4">
                            <Spinner />
                        </div>
                    }
                >
                    <div
                        ref={grid}
                        className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3"
                    >
                        {reservations.data.map((reservation) => (
                            <TrialCard
                                key={reservation.id}
                                reservation={reservation}
                            />
                        ))}
                    </div>
                </InfiniteScroll>
            )}
        </div>
    );
}

ManageTrials.layout = {
    breadcrumbs: [{ title: 'Gestion des essais', href: index() }],
};

/** The next thing the teacher has to do for this trial, or where it stands. */
function nextStep(reservation: TrialReservation): {
    label: string;
    pressing: boolean;
} {
    if (reservation.status === 'payment_review') {
        return { label: 'Paiement à vérifier', pressing: true };
    }
    if (reservation.status === 'confirmed' && reservation.has_started) {
        return reservation.meeting_url
            ? { label: 'Séance en cours', pressing: false }
            : { label: 'En cours sans lien de visio', pressing: true };
    }
    if (reservation.actions?.record_outcome) {
        return { label: 'À clôturer : a-t-elle eu lieu ?', pressing: true };
    }
    if (reservation.status === 'completed') {
        return { label: 'Séance réalisée', pressing: false };
    }
    if (reservation.status === 'no_show') {
        return { label: 'Élève absent', pressing: false };
    }
    if (!reservation.is_active) {
        return { label: 'Essai annulé', pressing: false };
    }
    if (reservation.meeting_url) {
        return { label: 'Lien de visio prêt', pressing: false };
    }
    if (reservation.status === 'confirmed') {
        return { label: 'Lien de visio à ajouter', pressing: true };
    }

    return { label: 'Pas encore de lien', pressing: false };
}

function TrialCard({ reservation }: { reservation: TrialReservation }) {
    const timezone = useUserTimezone();
    const getInitials = useInitials();
    const name = reservation.student?.name ?? '';
    const format = (options: Intl.DateTimeFormatOptions) =>
        new Intl.DateTimeFormat('fr-FR', {
            timeZone: timezone,
            ...options,
        }).format(new Date(reservation.starts_at));
    const step = nextStep(reservation);

    return (
        <Link
            href={show(reservation.id)}
            className="group flex flex-col rounded-lg border border-border transition-colors hover:border-primary/40 hover:bg-muted/20"
        >
            <div className="flex items-start justify-between gap-3 p-5">
                <div className="flex min-w-0 items-center gap-3">
                    <Avatar className="size-10 shrink-0">
                        <AvatarFallback className="text-sm">
                            {getInitials(name)}
                        </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                        <p className="truncate font-semibold">{name}</p>
                        <p className="truncate text-sm text-muted-foreground">
                            {reservation.student?.email}
                        </p>
                    </div>
                </div>
                <Badge
                    variant={reservationStatusBadgeVariant[reservation.status]}
                    className="shrink-0"
                >
                    {reservationStatusLabels[reservation.status]}
                </Badge>
            </div>

            <div className="grid grid-cols-2 gap-4 px-5 pb-5">
                <div>
                    <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <CalendarDays className="size-3.5" aria-hidden="true" />
                        Jour
                    </p>
                    <p className="mt-1 truncate font-medium first-letter:uppercase">
                        {format({
                            weekday: 'long',
                            day: 'numeric',
                            month: 'long',
                        })}
                    </p>
                </div>
                <div>
                    <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Clock className="size-3.5" aria-hidden="true" />
                        Heure
                    </p>
                    <p className="mt-1 font-medium">
                        {format({ timeStyle: 'short' })}
                    </p>
                </div>
            </div>

            <div className="mt-auto flex items-center justify-between gap-3 border-t border-border px-5 py-3 text-sm">
                <span
                    className={cn(
                        'flex items-center gap-1.5',
                        step.pressing
                            ? 'font-medium text-foreground'
                            : 'text-muted-foreground',
                    )}
                >
                    <Video className="size-4" aria-hidden="true" />
                    {step.label}
                </span>
                <span className="flex items-center gap-1 text-muted-foreground transition-colors group-hover:text-foreground">
                    Ouvrir
                    <ChevronRight className="size-4" aria-hidden="true" />
                </span>
            </div>
        </Link>
    );
}
