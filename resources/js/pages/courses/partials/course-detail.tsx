import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    CalendarDays,
    MapPin,
    ArrowRight,
    Users,
    Ticket,
    ChevronLeft,
    Clock,
    Share2,
    Copy,
    Check,
    MessageCircle,
    Facebook,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion';
import { allCourses, type Course } from '../courses-data';
import { Link } from '@inertiajs/react';
import { cn } from '@/lib/utils';

/* ─── Helpers ────────────────────────────────────────────────── */

const moisMap: Record<string, number> = {
    janvier: 1, février: 2, mars: 3, avril: 4, mai: 5, juin: 6,
    juillet: 7, août: 8, septembre: 9, octobre: 10, novembre: 11, décembre: 12,
};

function parseFrenchDate(s: string): number {
    const p = s.toLowerCase().split(' ');
    return new Date(+p[2], (moisMap[p[1]] ?? 1) - 1, +p[0]).getTime();
}

const statusStyle: Record<Course['status'], string> = {
    Ouvert: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    Bientôt: 'border-blue-500/40 bg-blue-500/10 text-blue-600 dark:text-blue-400',
    Complet: 'border-rose-500/40 bg-rose-500/10 text-rose-500',
    Terminé: 'border-foreground/20 bg-foreground/5 text-foreground/50',
};

/* ─── Countdown ──────────────────────────────────────────────── */

type Countdown = { days: number; hours: number; minutes: number; seconds: number };

function useCountdown(dateStr: string): Countdown | null {
    const [value, setValue] = useState<Countdown | null>(null);

    useEffect(() => {
        const target = parseFrenchDate(dateStr);
        const tick = () => {
            const diff = target - Date.now();
            if (diff <= 0) { setValue(null); return; }
            setValue({
                days: Math.floor(diff / 86_400_000),
                hours: Math.floor((diff % 86_400_000) / 3_600_000),
                minutes: Math.floor((diff % 3_600_000) / 60_000),
                seconds: Math.floor((diff % 60_000) / 1000),
            });
        };
        tick();
        const id = setInterval(tick, 1000);
        return () => clearInterval(id);
    }, [dateStr]);

    return value;
}

function CountdownBlock({ label, value }: { label: string; value: number }) {
    return (
        <div className="flex flex-col items-center gap-1">
            <span className="tabular-nums text-2xl font-bold text-foreground md:text-3xl">
                {String(value).padStart(2, '0')}
            </span>
            <span className="text-[10px] uppercase tracking-widest text-foreground/40">
                {label}
            </span>
        </div>
    );
}

/* ─── Seats bar ──────────────────────────────────────────────── */

function SeatsBar({ remaining, total }: { remaining: number; total: number }) {
    const pct = remaining / total;
    const bar = pct <= 0.2 ? 'bg-rose-500' : pct <= 0.5 ? 'bg-amber-500' : 'bg-emerald-500';
    const text = pct <= 0.2 ? 'text-rose-500' : pct <= 0.5 ? 'text-amber-500 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400';
    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
                <span className={`font-medium ${text}`}>
                    {remaining === 0 ? 'Complet' : `${remaining} place${remaining > 1 ? 's' : ''} restante${remaining > 1 ? 's' : ''}`}
                </span>
                <span className="text-foreground/40">{total} max</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-foreground/10">
                <div className={`h-full rounded-full ${bar}`} style={{ width: `${((total - remaining) / total) * 100}%` }} />
            </div>
        </div>
    );
}

/* ─── Formule selector ───────────────────────────────────────── */

function FormuleSelector({ course }: { course: Course }) {
    const [selected, setSelected] = useState(0);
    const formules = course.formules ?? [];
    const formule = formules[selected];

    if (!formule) return null;

    return (
        <div className="space-y-3">
            {formules.map((f, i) => (
                <button
                    key={f.nom}
                    type="button"
                    onClick={() => setSelected(i)}
                    className={cn(
                        'w-full rounded-xl border p-4 text-left transition-all',
                        i === selected
                            ? 'border-primary bg-primary/5 dark:bg-primary/10'
                            : 'border-border/40 bg-background/40 hover:border-border/70 dark:border-border/50',
                    )}
                >
                    <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                            {/* Radio dot */}
                            <span className={cn(
                                'mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 transition-colors',
                                i === selected ? 'border-primary' : 'border-border/50',
                            )}>
                                {i === selected && (
                                    <span className="h-2 w-2 rounded-full bg-primary" />
                                )}
                            </span>
                            <div>
                                <p className="text-sm font-semibold text-foreground">
                                    {f.nom}
                                </p>
                                {f.avantages && i === selected && (
                                    <p className="mt-1 text-xs leading-relaxed text-foreground/55">
                                        {f.avantages}
                                    </p>
                                )}
                            </div>
                        </div>
                        <p className="shrink-0 text-sm font-bold text-foreground">
                            {f.prix}
                        </p>
                    </div>
                </button>
            ))}

            <div className="pt-2">
                <SeatsBar remaining={course.placesRestantes} total={course.capacite} />
            </div>

            {course.placesRestantes > 0 ? (
                <Button size="lg" className="mt-1 w-full gap-2 rounded-full" asChild>
                    <Link href="/contact">
                        Réserver maintenant
                        <ArrowRight className="h-4 w-4" />
                    </Link>
                </Button>
            ) : (
                <Button size="lg" className="mt-1 w-full rounded-full" disabled>
                    Complet
                </Button>
            )}

            <p className="text-center text-xs text-foreground/40">
                Formule sélectionnée :{' '}
                <span className="font-medium text-foreground/60">{formule.nom} — {formule.prix}</span>
            </p>
        </div>
    );
}

/* ─── Share buttons ──────────────────────────────────────────── */

function ShareButtons({ titre }: { titre: string }) {
    const [copied, setCopied] = useState(false);
    const url = typeof window !== 'undefined' ? window.location.href : '';

    const copyLink = async () => {
        await navigator.clipboard.writeText(url).catch(() => {});
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="flex flex-wrap items-center gap-2">
            <a
                href={`https://wa.me/?text=${encodeURIComponent(titre + ' — ' + url)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-border/40 bg-background/60 px-4 py-2 text-xs font-medium text-foreground/70 transition-colors hover:border-emerald-500/40 hover:bg-emerald-500/5 hover:text-emerald-600 dark:border-border/50"
            >
                <MessageCircle className="h-4 w-4" /> WhatsApp
            </a>
            <a
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-border/40 bg-background/60 px-4 py-2 text-xs font-medium text-foreground/70 transition-colors hover:border-blue-500/40 hover:bg-blue-500/5 hover:text-blue-600 dark:border-border/50"
            >
                <Facebook className="h-4 w-4" /> Facebook
            </a>
            <button
                type="button"
                onClick={copyLink}
                className="inline-flex items-center gap-2 rounded-full border border-border/40 bg-background/60 px-4 py-2 text-xs font-medium text-foreground/70 transition-colors hover:border-border/70 hover:text-foreground dark:border-border/50"
            >
                {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                {copied ? 'Copié !' : 'Copier le lien'}
            </button>
        </div>
    );
}

/* ─── Main component ─────────────────────────────────────────── */

export function CourseDetail({ courseSlug }: { courseSlug: string }) {
    const course = allCourses.find((c) => c.slug === courseSlug);
    const [activeSeance, setActiveSeance] = useState('seance-0');
    const countdown = useCountdown(course?.dateDebut ?? '');

    if (!course) {
        return (
            <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
                <p className="text-lg font-medium text-foreground/60">Cours introuvable</p>
                <Button asChild variant="outline" className="rounded-full">
                    <Link href="/courses">
                        <ChevronLeft className="mr-1 h-4 w-4" />
                        Retour aux cours
                    </Link>
                </Button>
            </div>
        );
    }

    const minPrice = course.formules?.[0]?.prix;

    return (
        <div className="relative min-h-screen">

            {/* ── Hero ─────────────────────────────────────────── */}
            <section className="relative h-[520px] overflow-hidden md:h-[600px]">
                {/* Image */}
                <img
                    src={course.image}
                    alt={course.titre}
                    className="absolute inset-0 h-full w-full object-cover"
                />
                {/* Overlays */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/20" />
                <div className="absolute inset-0 bg-gradient-to-r from-black/30 to-transparent" />

                {/* Content */}
                <div className="relative mx-auto flex h-full max-w-7xl flex-col justify-between px-6 py-8 md:px-8 lg:px-12">
                    {/* Back */}
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                    >
                        <Link
                            href="/courses"
                            className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-medium text-white/80 backdrop-blur transition-colors hover:bg-white/20"
                        >
                            <ChevronLeft className="h-3.5 w-3.5" />
                            Retour aux cours
                        </Link>
                    </motion.div>

                    {/* Bottom info */}
                    <motion.div
                        initial={{ opacity: 0, y: 24 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                    >
                        {/* Badges */}
                        <div className="mb-4 flex flex-wrap items-center gap-2">
                            <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold tracking-wider text-white uppercase backdrop-blur">
                                {course.type}
                            </span>
                            <span className={cn('rounded-full border px-3 py-1 text-xs font-semibold backdrop-blur', statusStyle[course.status])}>
                                {course.status}
                            </span>
                            {course.nbSeances > 1 && (
                                <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium text-white/80 backdrop-blur">
                                    {course.nbSeances} séances
                                </span>
                            )}
                        </div>

                        {/* Title */}
                        <h1 className="mb-5 max-w-3xl text-3xl font-semibold leading-tight tracking-tight text-white md:text-5xl">
                            {course.titre}
                        </h1>

                        {/* Date + format */}
                        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-white/75">
                            <span className="flex items-center gap-2">
                                <CalendarDays className="h-4 w-4 text-white/50" />
                                {course.dateDebut}
                                {course.dateFin ? ` → ${course.dateFin}` : ''}
                            </span>
                            <span className="flex items-center gap-2">
                                <Users className="h-4 w-4 text-white/50" />
                                {course.capacite > 1
                                    ? `${course.capacite} places max`
                                    : 'Séance privée 1:1'}
                            </span>
                            <span className="flex items-center gap-2">
                                <MapPin className="h-4 w-4 text-white/50" />
                                100 % en visio
                            </span>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* ── Quick stats bar ───────────────────────────────── */}
            <div className="border-b border-border/40 bg-background/80 backdrop-blur-sm">
                <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-8 gap-y-3 px-6 py-4 md:px-8 lg:px-12">
                    <div className="flex items-center gap-2 text-sm text-foreground/60">
                        <Clock className="h-4 w-4 text-primary/60" />
                        <span>{course.nbSeances > 1 ? `${course.nbSeances} séances` : 'Séances à l’unité'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-foreground/60">
                        <Users className="h-4 w-4 text-primary/60" />
                        <span>{course.capacite > 1 ? `${course.capacite} places max` : 'Privé 1:1'}</span>
                    </div>
                    {minPrice && (
                        <div className="flex items-center gap-2 text-sm text-foreground/60">
                            <Ticket className="h-4 w-4 text-primary/60" />
                            <span>À partir de <strong className="text-foreground">{minPrice}</strong></span>
                        </div>
                    )}
                    {course.intervenants && course.intervenants.length > 0 && (
                        <div className="flex items-center gap-2 text-sm text-foreground/60">
                            <Share2 className="h-4 w-4 text-primary/60" />
                            <span>{course.intervenants.length} prof</span>
                        </div>
                    )}
                </div>
            </div>

            {/* ── Countdown ────────────────────────────────────── */}
            {countdown && course.status !== 'Terminé' && (
                <div className="border-b border-border/40 bg-primary/5 dark:bg-primary/[0.07]">
                    <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-6 py-4 md:px-8 lg:px-12">
                        <p className="text-sm font-medium text-foreground/70">
                            La prochaine session commence dans
                        </p>
                        <div className="flex items-end gap-3">
                            <CountdownBlock label="Jours" value={countdown.days} />
                            <span className="mb-4 text-xl font-bold text-foreground/30">:</span>
                            <CountdownBlock label="Heures" value={countdown.hours} />
                            <span className="mb-4 text-xl font-bold text-foreground/30">:</span>
                            <CountdownBlock label="Min" value={countdown.minutes} />
                            <span className="mb-4 text-xl font-bold text-foreground/30">:</span>
                            <CountdownBlock label="Sec" value={countdown.seconds} />
                        </div>
                    </div>
                </div>
            )}

            {/* ── Main content ─────────────────────────────────── */}
            <div className="mx-auto max-w-7xl px-6 py-14 md:px-8 lg:px-12">
                <div className="flex flex-col gap-10 lg:flex-row lg:items-start">

                    {/* ── Left column ──────────────────────────── */}
                    <div className="min-w-0 flex-1 space-y-16">

                        {/* Description */}
                        <motion.section
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5 }}
                        >
                            <p className="text-lg leading-relaxed text-foreground/70">
                                {course.description}
                            </p>
                        </motion.section>

                        {/* Objectifs */}
                        {course.objectifs && (
                            <motion.section
                                initial={{ opacity: 0, y: 24 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6 }}
                            >
                                <div className="mb-8">
                                    <p className="mb-1 text-xs font-semibold uppercase tracking-[0.25em] text-foreground/40">
                                        Ce que tu vas travailler
                                    </p>
                                    <h2 className="text-2xl font-semibold text-foreground md:text-3xl">
                                        Objectifs du cours
                                    </h2>
                                </div>
                                <div className="grid gap-4 sm:grid-cols-2">
                                    {course.objectifs.map((obj) => {
                                        const Icon = obj.icon;
                                        return (
                                            <Card key={obj.titre} className="border-border/40 bg-background/60 backdrop-blur-sm dark:border-border/50 dark:bg-background/50">
                                                <CardContent className="p-6">
                                                    <Icon className="mb-4 h-6 w-6 text-primary" aria-hidden="true" />
                                                    <h3 className="mb-2 font-semibold text-foreground">{obj.titre}</h3>
                                                    <p className="text-sm leading-relaxed text-foreground/60">{obj.description}</p>
                                                </CardContent>
                                            </Card>
                                        );
                                    })}
                                </div>
                            </motion.section>
                        )}

                        {/* Programme */}
                        {course.programme && (
                            <motion.section
                                initial={{ opacity: 0, y: 24 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6 }}
                            >
                                <div className="mb-8">
                                    <p className="mb-1 text-xs font-semibold uppercase tracking-[0.25em] text-foreground/40">
                                        Déroulement
                                    </p>
                                    <h2 className="text-2xl font-semibold text-foreground md:text-3xl">
                                        Programme
                                    </h2>
                                </div>
                                <Accordion type="single" collapsible value={activeSeance} onValueChange={setActiveSeance}>
                                    {course.programme.map((bloc, i) => (
                                        <AccordionItem
                                            key={i}
                                            value={`seance-${i}`}
                                            className="mb-3 overflow-hidden rounded-2xl border border-border/40 bg-background/60 backdrop-blur-sm dark:border-border/50 dark:bg-background/50"
                                        >
                                            <AccordionTrigger className="px-6 py-5 hover:bg-muted/40 hover:no-underline">
                                                <div className="flex items-center gap-4 text-left">
                                                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-sm font-bold text-primary">
                                                        {bloc.numero}
                                                    </span>
                                                    <p className="font-semibold text-foreground">{bloc.label}</p>
                                                </div>
                                            </AccordionTrigger>
                                            <AccordionContent>
                                                <div className="divide-y divide-border/20 border-t border-border/30 px-6">
                                                    {bloc.sessions.map((seance, j) => (
                                                        <div key={j} className="flex items-start gap-4 py-4 text-sm">
                                                            <span className="shrink-0 w-28 pt-0.5 font-mono text-xs text-foreground/40">
                                                                {seance.heure}
                                                            </span>
                                                            <div>
                                                                <p className="font-medium text-foreground">{seance.titre}</p>
                                                                {seance.intervenant && (
                                                                    <p className="mt-0.5 text-xs text-foreground/50">{seance.intervenant}</p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </AccordionContent>
                                        </AccordionItem>
                                    ))}
                                </Accordion>
                            </motion.section>
                        )}

                        {/* Prof */}
                        {course.intervenants && course.intervenants.length > 0 && (
                            <motion.section
                                initial={{ opacity: 0, y: 24 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6 }}
                            >
                                <div className="mb-8">
                                    <p className="mb-1 text-xs font-semibold uppercase tracking-[0.25em] text-foreground/40">
                                        Qui t'accompagne
                                    </p>
                                    <h2 className="text-2xl font-semibold text-foreground md:text-3xl">
                                        Ton professeur
                                    </h2>
                                </div>
                                <div className="grid gap-5 sm:grid-cols-2">
                                    {course.intervenants.map((iri) => (
                                        <Card key={iri.nom} className="border-border/40 bg-background/60 backdrop-blur-sm dark:border-border/50 dark:bg-background/50">
                                            <CardContent className="p-6">
                                                <div className="mb-4 flex items-center gap-3">
                                                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-base font-semibold text-primary">
                                                        {iri.initiales}
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-foreground">{iri.nom}</p>
                                                        <p className="text-xs text-foreground/50">{iri.role}</p>
                                                    </div>
                                                </div>
                                                {iri.bio && (
                                                    <p className="text-sm leading-relaxed text-foreground/60">{iri.bio}</p>
                                                )}
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            </motion.section>
                        )}

                        {/* Témoignages */}
                        {course.temoignages && course.temoignages.length > 0 && (
                            <motion.section
                                initial={{ opacity: 0, y: 24 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6 }}
                            >
                                <div className="mb-8">
                                    <p className="mb-1 text-xs font-semibold uppercase tracking-[0.25em] text-foreground/40">
                                        Retours expérience
                                    </p>
                                    <h2 className="text-2xl font-semibold text-foreground md:text-3xl">
                                        Témoignages
                                    </h2>
                                </div>
                                <div className="grid gap-5 md:grid-cols-2">
                                    {course.temoignages.map((t) => (
                                        <Card key={t.nom} className="border-border/40 bg-background/60 backdrop-blur-sm dark:border-border/50 dark:bg-background/50">
                                            <CardContent className="p-6">
                                                <div className="mb-5 flex items-center gap-3">
                                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                                                        {t.initiales}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-semibold text-foreground">{t.nom}</p>
                                                        <p className="text-xs text-foreground/50">{t.role}</p>
                                                    </div>
                                                </div>
                                                <p className="text-sm leading-relaxed text-foreground/70 italic">"{t.texte}"</p>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            </motion.section>
                        )}

                        {/* Partager */}
                        <motion.section
                            initial={{ opacity: 0, y: 24 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                        >
                            <div className="mb-5">
                                <p className="mb-1 text-xs font-semibold uppercase tracking-[0.25em] text-foreground/40">
                                    Faire passer le mot
                                </p>
                                <h2 className="text-xl font-semibold text-foreground">
                                    Partager ce cours
                                </h2>
                            </div>
                            <ShareButtons titre={course.titre} />
                        </motion.section>
                    </div>

                    {/* ── Right column — sticky ─────────────────── */}
                    <div className="hidden shrink-0 lg:block lg:w-80 xl:w-96">
                        <div className="sticky top-20 space-y-4">

                            {/* Formule selector */}
                            {course.formules && course.formules.length > 0 && (
                                <Card className="border-border/40 bg-background/70 backdrop-blur-md dark:border-border/50 dark:bg-background/60">
                                    <CardContent className="p-6">
                                        <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-foreground/40">
                                            Choisir une formule
                                        </p>
                                        <FormuleSelector course={course} />
                                    </CardContent>
                                </Card>
                            )}

                            {/* Format */}
                            <Card className="border-border/40 bg-background/60 backdrop-blur-sm dark:border-border/50 dark:bg-background/50">
                                <CardContent className="p-6">
                                    <p className="mb-4 text-xs font-semibold uppercase tracking-[0.25em] text-foreground/40">
                                        Format du cours
                                    </p>
                                    <div className="space-y-3 text-sm">
                                        <p className="font-semibold text-foreground">100 % en visioconférence</p>
                                        <div className="flex items-start gap-2 text-foreground/60">
                                            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary/60" />
                                            <span>Depuis le Cameroun, disponible partout</span>
                                        </div>
                                        <div className="flex items-start gap-2 text-foreground/60">
                                            <CalendarDays className="mt-0.5 h-4 w-4 shrink-0 text-primary/60" />
                                            <span>
                                                {course.dateDebut}
                                                {course.dateFin ? ` au ${course.dateFin}` : ''}
                                                {course.nbSeances > 1 ? ` (${course.nbSeances} séances)` : ''}
                                            </span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Share (desktop) */}
                            <Card className="border-border/40 bg-background/60 backdrop-blur-sm dark:border-border/50 dark:bg-background/50">
                                <CardContent className="p-5">
                                    <p className="mb-3 text-xs font-semibold uppercase tracking-[0.25em] text-foreground/40">
                                        Partager
                                    </p>
                                    <ShareButtons titre={course.titre} />
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Mobile sticky CTA ────────────────────────────── */}
            <div className="sticky bottom-0 z-30 border-t border-border/40 bg-background/95 p-4 backdrop-blur-md lg:hidden">
                <div className="flex items-center justify-between gap-4">
                    <div>
                        <p className="text-xs text-foreground/50">À partir de</p>
                        <p className="font-semibold text-foreground">{minPrice ?? 'Tarifs sur demande'}</p>
                    </div>
                    {course.placesRestantes > 0 ? (
                        <Button size="lg" className="gap-2 rounded-full px-8" asChild>
                            <Link href="/contact">
                                Réserver <ArrowRight className="h-4 w-4" />
                            </Link>
                        </Button>
                    ) : (
                        <Button size="lg" className="rounded-full px-8" disabled>
                            Complet
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}
