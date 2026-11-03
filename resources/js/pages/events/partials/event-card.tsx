import { motion } from 'framer-motion';
import { MapPin, ArrowRight, CalendarDays } from 'lucide-react';
import type { ClaudelEvent } from '../events-data';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link } from '@inertiajs/react';

export type { ClaudelEvent };

function parseDate(dateStr: string) {
    const parts = dateStr.split(' ');
    return {
        day: parts[0] ?? '',
        month: (parts[1] ?? '').substring(0, 3).toUpperCase(),
    };
}

function seatsColorText(remaining: number, total: number) {
    const pct = remaining / total;
    if (pct <= 0.2) return 'text-rose-500';
    if (pct <= 0.5) return 'text-amber-500 dark:text-amber-400';
    return 'text-emerald-600 dark:text-emerald-400';
}

function seatsDotClass(remaining: number, total: number) {
    const pct = remaining / total;
    if (pct <= 0.2) return 'bg-rose-500';
    if (pct <= 0.5) return 'bg-amber-500';
    return 'bg-emerald-500';
}

export function EventCard({
    event,
    index,
}: {
    event: ClaudelEvent;
    index: number;
}) {
    const minPrice = event.tickets?.[0]?.prix;
    const { day, month } = parseDate(event.dateDebut);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut', delay: index * 0.06 }}
        >
            <Card className="group flex h-full flex-col overflow-hidden border-border/40 bg-background/60 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-border/60 hover:shadow-lg dark:border-border/50 dark:bg-background/50">
                {/* Image */}
                <div className="relative h-52 overflow-hidden">
                    <img
                        src={event.image}
                        alt={event.titre}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

                    {/* Type badge */}
                    <div className="absolute top-4 left-4">
                        <Badge
                            variant="secondary"
                            className="border-white/20 bg-white/10 text-white backdrop-blur hover:bg-white/20"
                        >
                            {event.type}
                        </Badge>
                    </div>

                    {/* Date block */}
                    <div className="absolute top-4 right-4 flex flex-col items-center rounded-xl border border-white/20 bg-black/30 px-2.5 py-1.5 text-center backdrop-blur">
                        <span className="text-lg font-bold leading-none text-white">
                            {day}
                        </span>
                        <span className="mt-0.5 text-[10px] font-semibold uppercase tracking-wider text-white/70">
                            {month}
                        </span>
                    </div>

                    {/* Location */}
                    <div className="absolute bottom-3 left-4 flex items-center gap-1.5 text-xs text-white/80">
                        <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
                        {event.ville}, {event.pays}
                    </div>
                </div>

                <CardContent className="flex flex-1 flex-col p-5">
                    <h3 className="mb-2 text-base leading-snug font-semibold text-foreground">
                        {event.titre}
                    </h3>
                    <p className="mb-4 line-clamp-2 flex-1 text-sm leading-relaxed text-foreground/60">
                        {event.description}
                    </p>

                    <div className="mb-4 space-y-2">
                        <div className="flex items-center gap-1.5 text-xs text-foreground/50">
                            <CalendarDays
                                className="h-3.5 w-3.5"
                                aria-hidden="true"
                            />
                            {event.dateDebut}
                            {event.nbJours > 1 && ` · ${event.nbJours} jours`}
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                            <span
                                className={`h-1.5 w-1.5 shrink-0 rounded-full ${seatsDotClass(event.placesRestantes, event.capacite)}`}
                            />
                            <span
                                className={`font-medium ${seatsColorText(event.placesRestantes, event.capacite)}`}
                            >
                                {event.placesRestantes === 0
                                    ? 'Complet'
                                    : `${event.placesRestantes} place${event.placesRestantes > 1 ? 's' : ''} restante${event.placesRestantes > 1 ? 's' : ''}`}
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center justify-between">
                        {minPrice ? (
                            <div>
                                <p className="text-[10px] uppercase tracking-wider text-foreground/40">
                                    À partir de
                                </p>
                                <p className="text-sm font-semibold text-foreground">
                                    {minPrice}
                                </p>
                            </div>
                        ) : (
                            <span className="text-sm text-foreground/40">
                                Entrée libre
                            </span>
                        )}
                        <Button variant="secondary" size="sm" asChild>
                            <Link href={`/events/${event.id}`}>
                                Voir l'événement
                                <ArrowRight
                                    className="h-3.5 w-3.5"
                                    aria-hidden="true"
                                />
                            </Link>
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
}
