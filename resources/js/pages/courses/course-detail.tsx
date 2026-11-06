import { Head, Link, usePage } from '@inertiajs/react';
import { motion } from 'framer-motion';
import {
    ArrowLeft,
    ArrowRight,
    CalendarDays,
    Check,
    ChevronRight,
    Clock,
    GraduationCap,
    Sparkles,
    Users,
} from 'reicon-react';
import { useState } from 'react';
import { course as bookCourse } from '@/routes/booking';
import { Button } from '@/components/ui/button';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion';
import { CtaBand } from '@/components/marketing/cta-band';
import { FaqSection } from '@/components/marketing/faq-section';
import { LevelCard } from '@/components/marketing/level-card';
import { SectionHeading } from '@/components/marketing/section-heading';
import { TierSwitcher } from '@/components/marketing/tier-switcher';
import { cn } from '@/lib/utils';
import {
    faqs,
    formatPrice,
    getLevel,
    included,
    levels,
    pricePerHour,
    tierLabels,
    type TierKey,
} from '@/data/offer';

export default function CourseDetail() {
    const slug = usePage().url.split('?')[0].split('/').filter(Boolean).pop();
    const level = getLevel(slug);
    const [tier, setTier] = useState<TierKey>('group');

    if (!level) {
        return (
            <>
                <Head title="Parcours introuvable" />

                <section className="relative overflow-hidden py-24 md:py-32">
                    <div className="pointer-events-none absolute inset-0 overflow-hidden">
                        <div className="absolute top-0 left-1/3 h-[420px] w-[420px] rounded-full bg-primary/[0.04] blur-[150px] dark:bg-primary/[0.07]" />
                    </div>

                    <div className="relative mx-auto max-w-xl px-6 text-center">
                        <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-border/40 bg-secondary px-4 py-2 text-xs font-semibold tracking-[0.25em] text-secondary-foreground uppercase">
                            Parcours
                        </div>

                        <h1 className="text-3xl font-semibold tracking-tight text-foreground md:text-5xl">
                            Ce parcours n’existe pas encore.
                        </h1>

                        <p className="mt-4 text-foreground/60">
                            Les quatre niveaux A1 à B2 sont en ligne. Si tu
                            cherches une ancienne fiche, le programme a été
                            réorganisé par niveau complet.
                        </p>

                        <Button
                            className="mt-8 gap-2 rounded-full"
                            size="lg"
                            asChild
                        >
                            <Link href="/courses">
                                Voir les quatre niveaux
                                <ArrowRight className="h-4 w-4" />
                            </Link>
                        </Button>
                    </div>
                </section>
            </>
        );
    }

    const otherLevels = levels.filter(
        (otherLevel) => otherLevel.slug !== level.slug,
    );
    const selectedPrice = level.price[tier];
    const Icon = level.icon;

    return (
        <div className="relative pb-20 lg:pb-0">
            <Head title={`Parcours ${level.code} — ${level.name}`} />

            <section className="relative overflow-hidden pt-8 pb-16 md:pt-12 md:pb-20">
                <div className="pointer-events-none absolute inset-0 overflow-hidden">
                    <div className="absolute top-0 right-1/4 h-[460px] w-[460px] rounded-full bg-primary/[0.04] blur-[150px] dark:bg-primary/[0.07]" />
                    <div className="absolute bottom-0 left-1/4 h-[360px] w-[360px] rounded-full bg-foreground/[0.025] blur-[130px] dark:bg-foreground/[0.05]" />
                </div>

                <div className="relative mx-auto max-w-7xl px-6 md:px-8 lg:px-12">
                    <nav
                        aria-label="Fil d’Ariane"
                        className="mb-8 flex flex-wrap items-center gap-1.5 text-xs text-foreground/50"
                    >
                        <Link
                            href="/"
                            className="transition-colors hover:text-foreground"
                        >
                            Accueil
                        </Link>
                        <ChevronRight
                            className="h-3.5 w-3.5 text-foreground/30"
                            aria-hidden="true"
                        />
                        <Link
                            href="/courses"
                            className="transition-colors hover:text-foreground"
                        >
                            Parcours
                        </Link>
                        <ChevronRight
                            className="h-3.5 w-3.5 text-foreground/30"
                            aria-hidden="true"
                        />
                        <span className="font-medium text-foreground/70">
                            Niveau {level.code}
                        </span>
                    </nav>

                    <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-start lg:gap-14">
                        <motion.div
                            initial={{ opacity: 0, y: 24 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.7 }}
                        >
                            <div
                                className={cn(
                                    'mb-5 inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold',
                                    level.accent.bg,
                                    level.accent.text,
                                )}
                            >
                                <Icon
                                    className="h-3.5 w-3.5"
                                    aria-hidden="true"
                                />
                                Niveau {level.code} · {level.hours} h
                            </div>

                            <h1 className="text-4xl font-semibold tracking-tight text-foreground md:text-5xl lg:text-6xl">
                                {level.name}
                            </h1>

                            <p className="mt-3 text-lg font-medium text-foreground/80 md:text-xl">
                                {level.tagline}
                            </p>

                            <p className="mt-5 max-w-2xl text-foreground/60">
                                {level.description}
                            </p>

                            <div className="mt-8 grid gap-3 sm:grid-cols-2">
                                <div className="flex items-center gap-3 rounded-2xl border border-border/40 bg-background/60 p-4 backdrop-blur-sm dark:border-border/50 dark:bg-background/40">
                                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                        <Clock
                                            className="h-5 w-5"
                                            aria-hidden="true"
                                        />
                                    </span>
                                    <div>
                                        <p className="text-[10px] font-semibold tracking-[0.16em] text-foreground/40 uppercase">
                                            Volume
                                        </p>
                                        <p className="text-sm font-semibold text-foreground">
                                            {level.hours} h · 2 sous-niveaux
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 rounded-2xl border border-border/40 bg-background/60 p-4 backdrop-blur-sm dark:border-border/50 dark:bg-background/40">
                                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                        <CalendarDays
                                            className="h-5 w-5"
                                            aria-hidden="true"
                                        />
                                    </span>
                                    <div>
                                        <p className="text-[10px] font-semibold tracking-[0.16em] text-foreground/40 uppercase">
                                            Prochaine cohorte
                                        </p>
                                        <p className="text-sm font-semibold text-foreground">
                                            {level.nextCohort}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 rounded-2xl border border-border/40 bg-background/60 p-4 backdrop-blur-sm dark:border-border/50 dark:bg-background/40">
                                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                        <Users
                                            className="h-5 w-5"
                                            aria-hidden="true"
                                        />
                                    </span>
                                    <div>
                                        <p className="text-[10px] font-semibold tracking-[0.16em] text-foreground/40 uppercase">
                                            Format
                                        </p>
                                        <p className="text-sm font-semibold text-foreground">
                                            1:1 ou groupe de 3 à 6
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 rounded-2xl border border-border/40 bg-background/60 p-4 backdrop-blur-sm dark:border-border/50 dark:bg-background/40">
                                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                        <GraduationCap
                                            className="h-5 w-5"
                                            aria-hidden="true"
                                        />
                                    </span>
                                    <div>
                                        <p className="text-[10px] font-semibold tracking-[0.16em] text-foreground/40 uppercase">
                                            Validation
                                        </p>
                                        <p className="text-sm font-semibold text-foreground">
                                            2 checkpoints oraux & écrits
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        <motion.aside
                            initial={{ opacity: 0, x: 24 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.75, delay: 0.15 }}
                            className="lg:sticky lg:top-24"
                        >
                            <div className="overflow-hidden rounded-3xl border border-border/40 bg-card shadow-sm dark:border-border/50">
                                <div
                                    className={cn(
                                        'border-b border-border/30 bg-gradient-to-br p-6',
                                        level.accent.gradient,
                                    )}
                                >
                                    <p className="text-[10px] font-semibold tracking-[0.2em] text-foreground/45 uppercase">
                                        Parcours complet · {level.hours} h
                                    </p>

                                    <div className="mt-3 flex items-end gap-2">
                                        <p className="font-mono text-4xl font-semibold tracking-tight text-foreground">
                                            {formatPrice(selectedPrice)}
                                        </p>
                                        <span className="pb-1 text-xs text-foreground/50">
                                            / parcours
                                        </span>
                                    </div>

                                    <p className="mt-1 text-xs text-foreground/55">
                                        {tierLabels[tier]} ·{' '}
                                        {pricePerHour(
                                            selectedPrice,
                                            level.hours,
                                        )}{' '}
                                        / h
                                    </p>
                                </div>

                                <div className="p-6">
                                    <TierSwitcher
                                        value={tier}
                                        onChange={setTier}
                                        className="w-full"
                                    />

                                    <ul className="mt-5 space-y-2.5">
                                        {[
                                            '60 h de cours en visio',
                                            'Supports et corrections inclus',
                                            '2 checkpoints par niveau',
                                            'Replay disponible 30 jours',
                                        ].map((feature) => (
                                            <li
                                                key={feature}
                                                className="flex items-start gap-2.5 text-sm text-foreground/60"
                                            >
                                                <Check
                                                    className="mt-0.5 h-4 w-4 shrink-0 text-primary"
                                                    aria-hidden="true"
                                                />
                                                {feature}
                                            </li>
                                        ))}
                                    </ul>

                                    <Button
                                        className="mt-6 w-full rounded-full"
                                        size="lg"
                                        asChild
                                    >
                                        <Link
                                            href={bookCourse({
                                                query: {
                                                    level: level.slug,
                                                    tier,
                                                },
                                            })}
                                        >
                                            Réserver une place
                                        </Link>
                                    </Button>

                                    <p className="mt-3 text-center text-[11px] text-foreground/50">
                                        Paiement en 3× possible · +5 %
                                    </p>

                                    <div className="mt-5 rounded-xl border border-border/40 bg-muted/30 p-3 dark:border-border/50 dark:bg-foreground/[0.02]">
                                        <div className="flex items-center justify-between text-xs">
                                            <span className="text-foreground/60">
                                                Cohorte du {level.nextCohort}
                                            </span>
                                            <span className="font-semibold text-primary">
                                                {level.seats.left} places
                                            </span>
                                        </div>

                                        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-border/60">
                                            <div
                                                className="h-full rounded-full bg-primary"
                                                style={{
                                                    width: `${(level.seats.left / level.seats.total) * 100}%`,
                                                }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.aside>
                    </div>
                </div>
            </section>

            <section className="relative overflow-hidden bg-muted/30 py-20 md:py-28 dark:bg-foreground/[0.02]">
                <div className="relative mx-auto max-w-7xl px-6 md:px-8 lg:px-12">
                    <SectionHeading
                        eyebrow="Le programme"
                        title="Deux sous-niveaux, deux caps."
                        description="Chaque bloc de 30 heures se termine par un checkpoint. Ouvre un sous-niveau pour parcourir les modules, les notions et les ateliers que tu verras."
                        className="mb-12"
                    />

                    <Accordion
                        type="single"
                        collapsible
                        defaultValue={level.subLevels[0]?.code}
                        className="space-y-4"
                    >
                        {level.subLevels.map((subLevel) => (
                            <AccordionItem
                                key={subLevel.code}
                                value={subLevel.code}
                                className="overflow-hidden rounded-3xl border border-border/40 bg-background/70 backdrop-blur-sm dark:border-border/50 dark:bg-background/40"
                            >
                                <AccordionTrigger className="px-5 py-5 hover:no-underline sm:px-7 sm:py-6">
                                    <div className="flex flex-1 items-start gap-4 pr-2 text-left">
                                        <span
                                            className={cn(
                                                'flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl font-mono text-xs font-bold',
                                                level.accent.bg,
                                                level.accent.text,
                                            )}
                                        >
                                            {subLevel.code}
                                        </span>

                                        <div className="min-w-0 flex-1">
                                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                                                <h3 className="text-lg font-semibold text-foreground">
                                                    {subLevel.title}
                                                </h3>

                                                <span className="rounded-full border border-border/50 bg-background/60 px-2.5 py-0.5 font-mono text-[11px] font-medium text-foreground/50 dark:border-border/60 dark:bg-background/30">
                                                    {subLevel.hours} h
                                                </span>
                                            </div>

                                            <p className="mt-1.5 text-sm leading-relaxed text-foreground/55">
                                                {subLevel.outcome}
                                            </p>

                                            <div className="mt-3 flex flex-wrap gap-1.5">
                                                {subLevel.focus.map((focus) => (
                                                    <span
                                                        key={focus}
                                                        className="rounded-full border border-border/50 bg-background/60 px-2 py-0.5 text-[11px] font-medium text-foreground/55 dark:border-border/60 dark:bg-background/30"
                                                    >
                                                        {focus}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </AccordionTrigger>

                                <AccordionContent className="px-5 pb-6 sm:px-7">
                                    <div className="border-t border-border/30 pt-6">
                                        <div className="grid gap-3 lg:grid-cols-2">
                                            {subLevel.program.map(
                                                (module, moduleIndex) => (
                                                    <div
                                                        key={module.title}
                                                        className="flex flex-col rounded-2xl border border-border/40 bg-background/70 p-5 dark:border-border/50 dark:bg-background/40"
                                                    >
                                                        <div className="flex items-center justify-between gap-3">
                                                            <span className="inline-flex items-center rounded-full bg-primary/[0.07] px-2.5 py-1 text-[10px] font-semibold tracking-[0.16em] text-primary uppercase">
                                                                Module{' '}
                                                                {moduleIndex +
                                                                    1}
                                                            </span>

                                                            <span className="font-mono text-[11px] text-foreground/40">
                                                                {module.hours} h
                                                            </span>
                                                        </div>

                                                        <h4 className="mt-3 text-base font-semibold text-foreground">
                                                            {module.title}
                                                        </h4>

                                                        <p className="mt-1 text-xs leading-relaxed text-foreground/50">
                                                            {module.description}
                                                        </p>

                                                        <ul className="mt-4 space-y-3 border-t border-border/30 pt-4">
                                                            {module.lessons.map(
                                                                (lesson) => (
                                                                    <li
                                                                        key={
                                                                            lesson.title
                                                                        }
                                                                        className="flex items-start gap-2.5"
                                                                    >
                                                                        <span
                                                                            className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary/60"
                                                                            aria-hidden="true"
                                                                        />

                                                                        <div>
                                                                            <p className="text-[13px] leading-snug font-medium text-foreground">
                                                                                {
                                                                                    lesson.title
                                                                                }
                                                                            </p>

                                                                            <p className="mt-0.5 text-[11px] leading-relaxed text-foreground/50">
                                                                                {
                                                                                    lesson.description
                                                                                }
                                                                            </p>
                                                                        </div>
                                                                    </li>
                                                                ),
                                                            )}
                                                        </ul>
                                                    </div>
                                                ),
                                            )}
                                        </div>

                                        <div className="mt-4 flex flex-col gap-2 rounded-2xl border border-border/40 bg-muted/30 p-4 sm:flex-row sm:items-center sm:justify-between dark:border-border/50 dark:bg-foreground/[0.02]">
                                            <p className="flex items-center gap-2 text-xs text-foreground/55">
                                                <GraduationCap
                                                    className="h-4 w-4 shrink-0 text-primary"
                                                    aria-hidden="true"
                                                />
                                                Checkpoint oral et écrit à la
                                                fin du {subLevel.code}
                                            </p>

                                            <p className="text-xs font-semibold text-foreground/70">
                                                {subLevel.hours} h en visio ·
                                                inclus dans le parcours{' '}
                                                {level.code}
                                            </p>
                                        </div>
                                    </div>
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                </div>
            </section>

            <section className="relative py-20 md:py-28">
                <div className="relative mx-auto max-w-7xl px-6 md:px-8 lg:px-12">
                    <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
                        <div className="lg:sticky lg:top-24 lg:self-start">
                            <SectionHeading
                                eyebrow="Les acquis"
                                title={`À la fin du ${level.code}, tu sauras…`}
                                description="Des compétences concrètes, vérifiées au checkpoint final — pas une liste de chapitres survolés."
                            />

                            <div className="mt-7 inline-flex items-center gap-2 rounded-full border border-border/40 bg-background/60 px-4 py-2 text-xs text-foreground/55 backdrop-blur-sm dark:border-border/50 dark:bg-background/40">
                                <Sparkles
                                    className="h-3.5 w-3.5 text-primary"
                                    aria-hidden="true"
                                />
                                Niveau {level.code} du CECRL · {level.hours} h
                            </div>
                        </div>

                        <div className="grid gap-3 sm:grid-cols-2">
                            {level.canDo.map((item, index) => (
                                <motion.div
                                    key={item}
                                    initial={{ opacity: 0, y: 16 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{
                                        duration: 0.45,
                                        delay: index * 0.05,
                                    }}
                                    className="flex items-start gap-3 rounded-2xl border border-border/40 bg-card p-4 dark:border-border/50"
                                >
                                    <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                                        <Check
                                            className="h-3.5 w-3.5"
                                            aria-hidden="true"
                                        />
                                    </span>

                                    <p className="text-sm leading-relaxed text-foreground/70">
                                        {item}
                                    </p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            <section className="relative border-y border-border/30 bg-muted/20 py-16 dark:bg-foreground/[0.015]">
                <div className="relative mx-auto max-w-7xl px-6 md:px-8 lg:px-12">
                    <div className="mb-9 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                            <p className="text-[11px] font-bold tracking-[0.22em] text-primary uppercase">
                                Inclus
                            </p>
                            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
                                Le socle, dans chaque formule.
                            </h2>
                        </div>

                        <Link
                            href="/pricing"
                            className="group inline-flex items-center gap-2 text-sm font-semibold text-foreground/60 transition-colors hover:text-foreground"
                        >
                            Voir les tarifs
                            <ArrowRight
                                className="h-4 w-4 text-primary transition-transform group-hover:translate-x-1"
                                aria-hidden="true"
                            />
                        </Link>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {included.map((item) => (
                            <div
                                key={item.title}
                                className="flex items-center gap-3 rounded-2xl border border-border/40 bg-background/60 p-4 backdrop-blur-sm dark:border-border/50 dark:bg-background/40"
                            >
                                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                    <item.icon
                                        className="h-4 w-4"
                                        aria-hidden="true"
                                    />
                                </span>

                                <div>
                                    <p className="text-sm font-semibold text-foreground">
                                        {item.title}
                                    </p>
                                    <p className="text-xs text-foreground/50">
                                        {item.detail}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="relative py-20 md:py-28">
                <div className="relative mx-auto max-w-7xl px-6 md:px-8 lg:px-12">
                    <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                        <SectionHeading
                            eyebrow="Continuer"
                            title="Les autres niveaux."
                            description="Un parcours peut commencer à n’importe quel niveau, après un checkpoint d’entrée."
                        />

                        <Link
                            href="/courses"
                            className="group inline-flex shrink-0 items-center gap-2 text-sm font-semibold text-foreground/60 transition-colors hover:text-foreground"
                        >
                            <ArrowLeft
                                className="h-4 w-4 text-primary transition-transform group-hover:-translate-x-1"
                                aria-hidden="true"
                            />
                            Tous les parcours
                        </Link>
                    </div>

                    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                        {otherLevels.map((otherLevel, index) => (
                            <LevelCard
                                key={otherLevel.slug}
                                level={otherLevel}
                                index={index}
                            />
                        ))}
                    </div>
                </div>
            </section>

            <FaqSection
                items={faqs.slice(0, 4)}
                title={`Le ${level.code}, en pratique`}
                description="Rythme, formats, annulation : les réponses avant de réserver."
            />

            <CtaBand
                eyebrow={`Niveau ${level.code}`}
                title="On commence quand tu veux."
                description="Choisis ta formule, ton rythme et ton planning pour rejoindre le parcours."
                primary={{
                    label: 'Réserver une place',
                    href: bookCourse.url({
                        query: { level: level.slug, tier },
                    }),
                }}
            />

            <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border/40 bg-background/95 px-4 py-3 backdrop-blur-lg lg:hidden dark:border-border/50">
                <div className="mx-auto flex max-w-7xl items-center gap-3">
                    <div className="min-w-0 flex-1">
                        <p className="text-[10px] font-semibold tracking-[0.16em] text-foreground/40 uppercase">
                            {level.code} · {tierLabels[tier]}
                        </p>
                        <p className="font-mono text-lg font-semibold text-foreground">
                            {formatPrice(selectedPrice)}
                        </p>
                    </div>

                    <Button className="rounded-full" asChild>
                        <Link
                            href={bookCourse({
                                query: { level: level.slug, tier },
                            })}
                        >
                            Réserver
                        </Link>
                    </Button>
                </div>
            </div>
        </div>
    );
}
