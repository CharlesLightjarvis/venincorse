import { motion, type Variants } from 'framer-motion';
import {
    MapPoint,
    ArrowRight,
    CalendarDays,
    Ticket,
    Sparkles,
    Users,
} from 'reicon-react';
import { Button } from '@/components/ui/button';
import { Link } from '@inertiajs/react';

type SessionItem = {
    id: number;
    image: string;
    type: string;
    title: string;
    description: string;
    country: string;
    city: string;
    location?: string;
    startDate: string;
    days: number;
    capacity: number;
    seatsLeft: number;
    priceFrom: string;
    featured?: boolean;
};

const sessions: SessionItem[] = [
    {
        id: 1,
        image: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=1200&q=80',
        type: "Cours d'essai",
        title: "Cours d'essai : une heure pour tester la méthode",
        description:
            "60 minutes en visio, en 1:1 : ton niveau, ton objectif et un plan clair pour la suite. Les 39 € sont crédités si tu t'inscris sous 7 jours.",
        country: '100 % visio',
        city: 'En ligne',
        startDate: '8 janvier 2027',
        days: 1,
        capacity: 8,
        seatsLeft: 6,
        priceFrom: '39 €',
        featured: true,
    },
    {
        id: 2,
        image: 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&w=800&q=80',
        type: 'Pack de grammaire',
        title: 'Grammaire A1 : remettre les bases dans le bon ordre',
        description:
            'Quatre séances de 90 minutes : articles, présent, négation et accusatif, avec des exercices et de courtes mises en pratique.',
        country: '100 % visio',
        city: 'En ligne',
        startDate: '1 février 2027',
        days: 4,
        capacity: 6,
        seatsLeft: 4,
        priceFrom: '120 €',
    },
    {
        id: 3,
        image: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&w=800&q=80',
        type: 'Cohorte A1',
        title: 'Parcours A1 — Premiers pas : cohorte de janvier',
        description:
            '60 heures pour poser les fondations, de zéro à ta première vraie conversation. Un checkpoint à mi-parcours, un objectif clair à la fin.',
        country: '100 % visio',
        city: 'En ligne',
        startDate: '11 janvier 2027',
        days: 10,
        capacity: 6,
        seatsLeft: 4,
        priceFrom: '720 €',
    },
    {
        id: 4,
        image: 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&w=800&q=80',
        type: 'Atelier',
        title: 'Sprechen : une séance pour prendre la parole',
        description:
            '90 minutes de dialogues et de jeux de rôle à ton niveau. Une séance pratique, indépendante des packs de grammaire.',
        country: '100 % visio',
        city: 'En ligne',
        startDate: '19 janvier 2027',
        days: 1,
        capacity: 6,
        seatsLeft: 5,
        priceFrom: '30 €',
    },
];

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

const itemVariants: Variants = {
    hidden: { opacity: 0, y: 24 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.6, ease: 'easeOut' },
    },
};

const sessionLinks: Record<number, string> = {
    1: '/trial',
    2: '/workshops#grammar',
    3: '/courses/a1',
    4: '/workshops#practice',
};

export function Courses() {
    const featured =
        sessions.find((session) => session.featured) ?? sessions[0];
    const others = sessions
        .filter((session) => session.id !== featured.id)
        .slice(0, 3);

    return (
        <section className="relative py-24 md:py-32">
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <div className="absolute top-1/2 left-0 h-[440px] w-[440px] -translate-y-1/2 rounded-full bg-foreground/[0.025] blur-[150px] dark:bg-foreground/[0.04]" />
                <div className="absolute top-1/4 right-0 h-[360px] w-[360px] rounded-full bg-primary/[0.02] blur-[140px] dark:bg-primary/[0.04]" />
            </div>

            <div className="relative mx-auto max-w-7xl px-6 md:px-8 lg:px-12">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.7 }}
                    className="mb-14 flex flex-col items-center gap-6 text-center md:flex-row md:items-end md:justify-between md:text-left"
                >
                    <div>
                        <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-border/40 bg-secondary px-4 py-2 text-xs font-semibold tracking-[0.25em] text-secondary-foreground uppercase backdrop-blur dark:border-border/60 dark:bg-secondary">
                            Prochaines sessions
                        </div>
                        <h2 className="mb-4 text-3xl font-semibold tracking-tight text-foreground md:text-5xl">
                            Les prochaines dates à ne pas manquer
                        </h2>
                        <p className="max-w-xl text-lg text-foreground/60">
                            Cours d'essai, stages, cohortes de parcours et
                            ateliers : les dates de 2027, les places restantes
                            et la réservation au même endroit.
                        </p>
                    </div>
                    <Button
                        variant="secondary"
                        className="shrink-0 rounded-full"
                        asChild
                    >
                        <Link href="/courses" preserveState prefetch>
                            Voir les parcours
                            <ArrowRight
                                className="ml-2 h-4 w-4"
                                aria-hidden="true"
                            />
                        </Link>
                    </Button>
                </motion.div>

                {/* Featured event */}
                <motion.article
                    variants={itemVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: '-60px' }}
                    className="mb-5 overflow-hidden rounded-3xl border border-border/40 bg-background/70 backdrop-blur-sm dark:border-border/50 dark:bg-background/50"
                >
                    <div className="grid lg:grid-cols-[1.5fr_1fr]">
                        {/* Image */}
                        <div className="group relative min-h-[300px] overflow-hidden lg:min-h-[440px]">
                            <img
                                src={featured.image}
                                alt={featured.title}
                                className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-background/10 dark:to-background/20" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent lg:hidden" />

                            {/* Type badge */}
                            <div className="absolute top-5 left-5">
                                <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-semibold tracking-[0.18em] text-white uppercase backdrop-blur">
                                    {featured.type}
                                </span>
                            </div>

                            {/* À la une badge */}
                            <div className="absolute top-5 right-5">
                                <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/40 bg-primary/20 px-3 py-1 text-[11px] font-semibold text-primary backdrop-blur">
                                    <Sparkles
                                        className="h-3 w-3"
                                        aria-hidden="true"
                                    />
                                    À la une
                                </span>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="flex flex-col justify-between gap-6 p-7 md:p-10">
                            <div>
                                {/* Date */}
                                <div className="mb-5 flex items-center gap-2 text-sm font-medium text-foreground/60">
                                    <CalendarDays
                                        className="h-4 w-4 text-primary/70"
                                        aria-hidden="true"
                                    />
                                    {featured.startDate}
                                    {featured.days > 1 && (
                                        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary">
                                            {featured.days} jours
                                        </span>
                                    )}
                                </div>

                                <h3 className="mb-3 text-2xl leading-tight font-semibold tracking-tight text-foreground md:text-3xl">
                                    {featured.title}
                                </h3>

                                <p className="mb-6 text-sm leading-relaxed text-foreground/60 md:text-base">
                                    {featured.description}
                                </p>

                                {/* Location */}
                                <div className="mb-6 flex items-start gap-2 text-sm text-foreground/60">
                                    <MapPoint
                                        className="mt-0.5 h-4 w-4 shrink-0 text-foreground/40"
                                        aria-hidden="true"
                                    />
                                    <span>
                                        {featured.location && (
                                            <span className="font-medium text-foreground">
                                                {featured.location} ·{' '}
                                            </span>
                                        )}
                                        {featured.city}, {featured.country}
                                    </span>
                                </div>

                                {/* Seats */}
                                <div className="mb-2 flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-2">
                                        <Users
                                            className="h-4 w-4 text-foreground/40"
                                            aria-hidden="true"
                                        />
                                        <span
                                            className={`font-medium ${seatsColorText(featured.seatsLeft, featured.capacity)}`}
                                        >
                                            {featured.seatsLeft} places
                                            restantes
                                        </span>
                                    </div>
                                    <span className="text-xs text-foreground/40">
                                        {featured.capacity} max
                                    </span>
                                </div>
                                <div className="h-1.5 overflow-hidden rounded-full bg-foreground/10">
                                    <div
                                        className={`h-full rounded-full transition-all ${seatsDotClass(featured.seatsLeft, featured.capacity)}`}
                                        style={{
                                            width: `${((featured.capacity - featured.seatsLeft) / featured.capacity) * 100}%`,
                                        }}
                                    />
                                </div>
                            </div>

                            {/* Price + CTA */}
                            <div className="flex items-center justify-between gap-4">
                                <div>
                                    <p className="text-xs tracking-wider text-foreground/40 uppercase">
                                        À partir de
                                    </p>
                                    <div className="flex items-center gap-1.5">
                                        <Ticket
                                            className="h-4 w-4 text-primary/70"
                                            aria-hidden="true"
                                        />
                                        <span className="text-xl font-semibold text-foreground">
                                            {featured.priceFrom}
                                        </span>
                                    </div>
                                </div>
                                <Button className="rounded-full" asChild>
                                    <Link href={sessionLinks[featured.id]}>
                                        Réserver ma place
                                        <ArrowRight
                                            className="ml-2 h-4 w-4"
                                            aria-hidden="true"
                                        />
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    </div>
                </motion.article>

                {/* 3 upcoming events */}
                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: '-60px' }}
                    transition={{ staggerChildren: 0.1 }}
                    className="grid gap-5 sm:grid-cols-3"
                >
                    {others.map((event) => {
                        const { day, month } = parseDate(event.startDate);
                        return (
                            <motion.article
                                key={event.id}
                                variants={itemVariants}
                                className="group overflow-hidden rounded-2xl border border-border/40 bg-background/70 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-border/60 hover:shadow-md dark:border-border/50 dark:bg-background/50"
                            >
                                {/* Image */}
                                <div className="relative h-48 overflow-hidden">
                                    <img
                                        src={event.image}
                                        alt={event.title}
                                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/15 to-transparent" />

                                    {/* Type badge */}
                                    <div className="absolute top-3 left-3">
                                        <span className="rounded-full border border-white/20 bg-white/10 px-2.5 py-0.5 text-[10px] font-semibold tracking-[0.15em] text-white/90 uppercase backdrop-blur">
                                            {event.type}
                                        </span>
                                    </div>

                                    {/* Date block */}
                                    <div className="absolute top-3 right-3 flex flex-col items-center rounded-xl border border-white/20 bg-black/30 px-2.5 py-1.5 text-center backdrop-blur">
                                        <span className="text-base leading-none font-bold text-white">
                                            {day}
                                        </span>
                                        <span className="mt-0.5 text-[9px] font-semibold tracking-wider text-white/70 uppercase">
                                            {month}
                                        </span>
                                    </div>

                                    {/* Location */}
                                    <div className="absolute bottom-3 left-3 flex items-center gap-1.5 text-xs text-white/80">
                                        <MapPoint
                                            className="h-3.5 w-3.5"
                                            aria-hidden="true"
                                        />
                                        {event.city}, {event.country}
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="p-5">
                                    <h3 className="mb-3 line-clamp-2 text-sm leading-snug font-semibold text-foreground">
                                        {event.title}
                                    </h3>

                                    {/* Seats indicator */}
                                    <div className="mb-4 flex items-center gap-2 text-xs">
                                        <span
                                            className={`h-1.5 w-1.5 shrink-0 rounded-full ${seatsDotClass(event.seatsLeft, event.capacity)}`}
                                        />
                                        <span
                                            className={`font-medium ${seatsColorText(event.seatsLeft, event.capacity)}`}
                                        >
                                            {event.seatsLeft} places restantes
                                        </span>
                                    </div>

                                    {/* Price + CTA */}
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-[10px] tracking-wider text-foreground/40 uppercase">
                                                Dès
                                            </p>
                                            <p className="text-sm font-semibold text-foreground">
                                                {event.priceFrom}
                                            </p>
                                        </div>
                                        <Button
                                            variant="secondary"
                                            size="sm"
                                            className="rounded-full text-xs"
                                            asChild
                                        >
                                            <Link href={sessionLinks[event.id]}>
                                                Voir
                                                <ArrowRight
                                                    className="ml-1 h-3.5 w-3.5"
                                                    aria-hidden="true"
                                                />
                                            </Link>
                                        </Button>
                                    </div>
                                </div>
                            </motion.article>
                        );
                    })}
                </motion.div>
            </div>
        </section>
    );
}
