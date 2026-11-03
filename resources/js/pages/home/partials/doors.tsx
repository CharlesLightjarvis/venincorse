import { Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import {
    ArrowRight,
    GraduationCap,
    Sparkles,
    Target,
    type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { SectionHeading } from '@/components/marketing/section-heading';

type Door = {
    title: string;
    description: string;
    meta: string;
    href: string;
    icon: LucideIcon;
    text: string;
    bg: string;
    gradient: string;
};

const doors: Door[] = [
    {
        title: 'Parcours A1 → B2',
        description:
            'Quatre niveaux de 60 heures, découpés en deux sous-niveaux. Un checkpoint à chaque étape, un objectif mesurable à la fin.',
        meta: 'Dès 720 € · 60 h par niveau',
        href: '/courses',
        icon: GraduationCap,
        text: 'text-chart-2',
        bg: 'bg-chart-2/10',
        gradient: 'from-chart-2/15 via-chart-2/[0.04] to-transparent',
    },
    {
        title: 'Prépa examens',
        description:
            'ÖSD et TELC : stratégie par épreuve, entraînement chronométré et deux examens blancs corrigés en détail.',
        meta: 'Dès 170 € · 4 à 10 séances',
        href: '/examens',
        icon: Target,
        text: 'text-chart-1',
        bg: 'bg-chart-1/10',
        gradient: 'from-chart-1/15 via-chart-1/[0.04] to-transparent',
    },
    {
        title: 'Ateliers & stage',
        description:
            'Articles, temps, subordonnées : un point précis, réglé en quatre séances. Ou cinq jours pour débloquer un niveau.',
        meta: 'Dès 120 € · 4 × 90 min',
        href: '/ateliers',
        icon: Sparkles,
        text: 'text-chart-4',
        bg: 'bg-chart-4/10',
        gradient: 'from-chart-4/15 via-chart-4/[0.04] to-transparent',
    },
];

export function Doors() {
    return (
        <section className="relative py-20 md:py-28">
            <div className="relative mx-auto max-w-7xl px-6 md:px-8 lg:px-12">
                <div className="mb-12 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
                    <SectionHeading
                        eyebrow="Trois façons d’avancer"
                        title="Choisis la porte d’entrée."
                        description="Un parcours complet, une prépa ciblée ou un atelier ponctuel : chaque offre a sa page, ses prix et son rythme."
                    />

                    <Link
                        href="/tarifs"
                        className="group inline-flex shrink-0 items-center gap-2 text-sm font-semibold text-foreground/60 transition-colors hover:text-foreground"
                    >
                        Voir tous les tarifs
                        <ArrowRight
                            className="h-4 w-4 text-primary transition-transform group-hover:translate-x-1"
                            aria-hidden="true"
                        />
                    </Link>
                </div>

                <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                    {doors.map((door, index) => (
                        <motion.div
                            key={door.title}
                            initial={{ opacity: 0, y: 24 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{
                                duration: 0.55,
                                delay: index * 0.08,
                            }}
                            className="h-full"
                        >
                            <Link
                                href={door.href}
                                className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-border/40 bg-card p-7 transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-sm dark:border-border/50"
                            >
                                <div
                                    className={cn(
                                        'pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b',
                                        door.gradient,
                                    )}
                                    aria-hidden="true"
                                />

                                <span
                                    className={cn(
                                        'relative flex h-12 w-12 items-center justify-center rounded-2xl',
                                        door.bg,
                                        door.text,
                                    )}
                                >
                                    <door.icon
                                        className="h-5 w-5"
                                        aria-hidden="true"
                                    />
                                </span>

                                <h3 className="relative mt-6 text-xl font-semibold tracking-tight text-foreground">
                                    {door.title}
                                </h3>

                                <p className="relative mt-2 flex-1 text-sm leading-relaxed text-foreground/60">
                                    {door.description}
                                </p>

                                <div className="relative mt-7 flex items-center justify-between gap-4 border-t border-border/30 pt-5">
                                    <span className="font-mono text-[11px] text-foreground/50">
                                        {door.meta}
                                    </span>

                                    <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
                                        Découvrir
                                        <ArrowRight
                                            className="h-4 w-4 transition-transform group-hover:translate-x-1"
                                            aria-hidden="true"
                                        />
                                    </span>
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.55, delay: 0.2 }}
                    className="mt-5 flex flex-col items-start justify-between gap-3 rounded-2xl border border-primary/15 bg-primary/[0.05] px-5 py-4 sm:flex-row sm:items-center dark:border-primary/20 dark:bg-primary/[0.07]"
                >
                    <p className="text-sm text-foreground/70">
                        <span className="font-semibold text-foreground">
                            Tu hésites sur ton niveau ?
                        </span>{' '}
                        Le bilan de 45 minutes est crédité sur ton premier
                        parcours.
                    </p>

                    <Link
                        href="/bilan"
                        className="group inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold text-primary"
                    >
                        Réserver le bilan — 39 €
                        <ArrowRight
                            className="h-4 w-4 transition-transform group-hover:translate-x-1"
                            aria-hidden="true"
                        />
                    </Link>
                </motion.div>
            </div>
        </section>
    );
}
