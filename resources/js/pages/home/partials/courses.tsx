import { motion, type Variants } from "framer-motion";
import {
    MapPin,
    ArrowRight,
    CalendarDays,
    Ticket,
    Sparkles,
    Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "@inertiajs/react";

type EventItem = {
    id: number;
    image: string;
    type: string;
    titre: string;
    description: string;
    pays: string;
    ville: string;
    lieu?: string;
    dateDebut: string;
    nbJours: number;
    capacite: number;
    placesRestantes: number;
    prixDepuis: string;
    featured?: boolean;
};

const events: EventItem[] = [
    {
        id: 1,
        image: "https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&w=1200&q=80",
        type: "Stage intensif",
        titre: "Goethe-Zertifikat B2 : stage de préparation en mini-groupe",
        description:
            "Un stage intensif en visio pour travailler les 4 compétences, t'entraîner sur des sujets type examen et arriver serein le jour J.",
        pays: "100 % visio",
        ville: "En ligne",
        dateDebut: "15 juin 2026",
        nbJours: 10,
        capacite: 8,
        placesRestantes: 3,
        prixDepuis: "45 000 FCFA",
        featured: true,
    },
    {
        id: 2,
        image: "https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&w=800&q=80",
        type: "Mini-groupe",
        titre: "Conversation orale : sessions hebdomadaires",
        description:
            "Une séance par semaine pour gagner en confiance à l'oral : débats, mises en situation et corrections personnalisées.",
        pays: "100 % visio",
        ville: "En ligne",
        dateDebut: "12 juin 2026",
        nbJours: 1,
        capacite: 6,
        placesRestantes: 2,
        prixDepuis: "5 000 FCFA",
    },
    {
        id: 3,
        image: "https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&w=800&q=80",
        type: "Atelier pratique",
        titre: "Atelier grammaire : Der, Die, Das et déclinaisons",
        description:
            "Un atelier ciblé pour enfin maîtriser les cas allemands et construire des phrases solides sans hésiter.",
        pays: "100 % visio",
        ville: "En ligne",
        dateDebut: "18 juin 2026",
        nbJours: 1,
        capacite: 10,
        placesRestantes: 6,
        prixDepuis: "4 000 FCFA",
    },
    {
        id: 4,
        image: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=800&q=80",
        type: "Cours d'essai",
        titre: "Cours d'essai : l'allemand pour débutants complets",
        description:
            "Une première séance pour te lancer : prononciation, salutations et phrases utiles du quotidien.",
        pays: "100 % visio",
        ville: "En ligne",
        dateDebut: "05 juillet 2026",
        nbJours: 1,
        capacite: 12,
        placesRestantes: 9,
        prixDepuis: "3 000 FCFA",
    },
];

function parseDate(dateStr: string) {
    const parts = dateStr.split(" ");
    return {
        day: parts[0] ?? "",
        month: (parts[1] ?? "").substring(0, 3).toUpperCase(),
    };
}

function seatsColorText(remaining: number, total: number) {
    const pct = remaining / total;
    if (pct <= 0.2) return "text-rose-500";
    if (pct <= 0.5) return "text-amber-500 dark:text-amber-400";
    return "text-emerald-600 dark:text-emerald-400";
}

function seatsDotClass(remaining: number, total: number) {
    const pct = remaining / total;
    if (pct <= 0.2) return "bg-rose-500";
    if (pct <= 0.5) return "bg-amber-500";
    return "bg-emerald-500";
}

const itemVariants: Variants = {
    hidden: { opacity: 0, y: 24 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.6, ease: "easeOut" },
    },
};

export function Courses() {
    const featured = events.find((e) => e.featured) ?? events[0];
    const others = events.filter((e) => e.id !== featured.id).slice(0, 3);

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
                            Stages intensifs, mini-groupes et cours d'essai : les
                            dates à venir, le nombre de places et la réservation
                            au même endroit.
                        </p>
                    </div>
                    <Button
                        variant="secondary"
                        className="shrink-0 rounded-full"
                        asChild
                    >
                        <Link href="/courses" preserveState prefetch>
                            Voir toutes les sessions
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
                    viewport={{ once: true, margin: "-60px" }}
                    className="mb-5 overflow-hidden rounded-3xl border border-border/40 bg-background/70 backdrop-blur-sm dark:border-border/50 dark:bg-background/50"
                >
                    <div className="grid lg:grid-cols-[1.5fr_1fr]">
                        {/* Image */}
                        <div className="group relative min-h-[300px] overflow-hidden lg:min-h-[440px]">
                            <img
                                src={featured.image}
                                alt={featured.titre}
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
                                    {featured.dateDebut}
                                    {featured.nbJours > 1 && (
                                        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary">
                                            {featured.nbJours} jours
                                        </span>
                                    )}
                                </div>

                                <h3 className="mb-3 text-2xl leading-tight font-semibold tracking-tight text-foreground md:text-3xl">
                                    {featured.titre}
                                </h3>

                                <p className="mb-6 text-sm leading-relaxed text-foreground/60 md:text-base">
                                    {featured.description}
                                </p>

                                {/* Location */}
                                <div className="mb-6 flex items-start gap-2 text-sm text-foreground/60">
                                    <MapPin
                                        className="mt-0.5 h-4 w-4 shrink-0 text-foreground/40"
                                        aria-hidden="true"
                                    />
                                    <span>
                                        {featured.lieu && (
                                            <span className="font-medium text-foreground">
                                                {featured.lieu} ·{" "}
                                            </span>
                                        )}
                                        {featured.ville}, {featured.pays}
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
                                            className={`font-medium ${seatsColorText(featured.placesRestantes, featured.capacite)}`}
                                        >
                                            {featured.placesRestantes} places
                                            restantes
                                        </span>
                                    </div>
                                    <span className="text-xs text-foreground/40">
                                        {featured.capacite} max
                                    </span>
                                </div>
                                <div className="h-1.5 overflow-hidden rounded-full bg-foreground/10">
                                    <div
                                        className={`h-full rounded-full transition-all ${seatsDotClass(featured.placesRestantes, featured.capacite)}`}
                                        style={{
                                            width: `${((featured.capacite - featured.placesRestantes) / featured.capacite) * 100}%`,
                                        }}
                                    />
                                </div>
                            </div>

                            {/* Price + CTA */}
                            <div className="flex items-center justify-between gap-4">
                                <div>
                                    <p className="text-xs uppercase tracking-wider text-foreground/40">
                                        À partir de
                                    </p>
                                    <div className="flex items-center gap-1.5">
                                        <Ticket
                                            className="h-4 w-4 text-primary/70"
                                            aria-hidden="true"
                                        />
                                        <span className="text-xl font-semibold text-foreground">
                                            {featured.prixDepuis}
                                        </span>
                                    </div>
                                </div>
                                <Button className="rounded-full" asChild>
                                    <Link href={`/events/${featured.id}`}>
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
                    viewport={{ once: true, margin: "-60px" }}
                    transition={{ staggerChildren: 0.1 }}
                    className="grid gap-5 sm:grid-cols-3"
                >
                    {others.map((event) => {
                        const { day, month } = parseDate(event.dateDebut);
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
                                        alt={event.titre}
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
                                        <span className="text-base font-bold leading-none text-white">
                                            {day}
                                        </span>
                                        <span className="mt-0.5 text-[9px] font-semibold uppercase tracking-wider text-white/70">
                                            {month}
                                        </span>
                                    </div>

                                    {/* Location */}
                                    <div className="absolute bottom-3 left-3 flex items-center gap-1.5 text-xs text-white/80">
                                        <MapPin
                                            className="h-3.5 w-3.5"
                                            aria-hidden="true"
                                        />
                                        {event.ville}, {event.pays}
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="p-5">
                                    <h3 className="mb-3 line-clamp-2 text-sm leading-snug font-semibold text-foreground">
                                        {event.titre}
                                    </h3>

                                    {/* Seats indicator */}
                                    <div className="mb-4 flex items-center gap-2 text-xs">
                                        <span
                                            className={`h-1.5 w-1.5 shrink-0 rounded-full ${seatsDotClass(event.placesRestantes, event.capacite)}`}
                                        />
                                        <span
                                            className={`font-medium ${seatsColorText(event.placesRestantes, event.capacite)}`}
                                        >
                                            {event.placesRestantes} places
                                            restantes
                                        </span>
                                    </div>

                                    {/* Price + CTA */}
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-[10px] uppercase tracking-wider text-foreground/40">
                                                Dès
                                            </p>
                                            <p className="text-sm font-semibold text-foreground">
                                                {event.prixDepuis}
                                            </p>
                                        </div>
                                        <Button
                                            variant="secondary"
                                            size="sm"
                                            className="rounded-full text-xs"
                                            asChild
                                        >
                                            <Link href={`/events/${event.id}`}>
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
