import { Head, Link, usePage } from '@inertiajs/react';
import { motion } from 'framer-motion';
import {
    ArrowLeft,
    ArrowRight,
    BookOpen,
    CalendarDays,
    Check,
    ChevronRight,
    Clock,
    Gamepad,
    GraduationCap,
    Messages,
    Pen,
    Users,
} from 'reicon-react';
import { useState } from 'react';
import { CtaBand } from '@/components/marketing/cta-band';
import { SectionHeading } from '@/components/marketing/section-heading';
import { TierSwitcher } from '@/components/marketing/tier-switcher';
import { selectClassName } from '@/components/trial-slot-picker';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    formatPrice,
    tierLabels,
    type LevelSlug,
    type TierKey,
} from '@/data/offer';
import {
    getWorkshopOffer,
    grammarPacks,
    practiceWorkshops,
    workshopLevels,
    workshopVolume,
} from '@/data/workshop-catalog';
import { workshops as workshopsRoute } from '@/routes';
import { workshop as bookWorkshop } from '@/routes/booking';
import { show as workshopDetail } from '@/routes/workshops';
import { cn } from '@/lib/utils';

const practiceIcons = {
    sprechen: Messages,
    schreiben: Pen,
    wortschatz: Gamepad,
};

export default function WorkshopDetail() {
    const page = usePage();
    const slug = page.url.split('?')[0].split('/').filter(Boolean).pop();
    const query = new URLSearchParams(page.url.split('?')[1]);
    const offer = getWorkshopOffer(slug ?? '');
    const [tier, setTier] = useState<TierKey>(
        query.get('tier') === 'solo' ? 'solo' : 'group',
    );
    const [level, setLevel] = useState<LevelSlug>(() => {
        const requested = workshopLevels.find(
            (item) => item === query.get('level'),
        );
        return requested ?? 'a1';
    });

    if (!offer) {
        return (
            <>
                <Head title="Atelier introuvable" />
                <section className="relative overflow-hidden py-24 md:py-32">
                    <div className="relative mx-auto max-w-xl px-6 text-center">
                        <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-border/40 bg-secondary px-4 py-2 text-xs font-semibold tracking-[0.25em] text-secondary-foreground uppercase">
                            Ateliers
                        </div>
                        <h1 className="text-3xl font-semibold tracking-tight text-foreground md:text-5xl">
                            Cette offre n’existe pas encore.
                        </h1>
                        <p className="mt-4 text-foreground/60">
                            Les quatre packs de grammaire et les trois ateliers
                            pratiques sont en ligne.
                        </p>
                        <Button
                            className="mt-8 gap-2 rounded-full"
                            size="lg"
                            asChild
                        >
                            <Link href={workshopsRoute()}>
                                Voir les ateliers
                                <ArrowRight className="h-4 w-4" />
                            </Link>
                        </Button>
                    </div>
                </section>
            </>
        );
    }

    const isGrammar = offer.category === 'grammar';
    const grammar = isGrammar ? offer.pack : undefined;
    const practice = !isGrammar ? offer.workshop : undefined;
    const currentLevel = grammar?.level ?? level;
    const practiceDetail = practice?.levels[currentLevel];
    const CategoryIcon = grammar
        ? BookOpen
        : practiceIcons[practice!.id as keyof typeof practiceIcons];
    const title = grammar?.title ?? practice!.title;
    const description = grammar?.description ?? practice!.description;
    const image = grammar?.image ?? practice!.image;
    const selectedPrice = grammar ? grammar.price[tier] : practice!.price[tier];
    const volume = grammar
        ? workshopVolume(grammar.sessions, grammar.durationMinutes)
        : workshopVolume(1, practice!.durationMinutes);
    const focus = grammar?.focus ?? practice!.focus;
    const sessionCount = grammar?.sessions ?? 1;
    const durationMinutes =
        grammar?.durationMinutes ?? practice!.durationMinutes;
    const relatedGrammar = grammarPacks.filter(
        (item) => item.id !== grammar?.id,
    );
    const relatedPractice = practiceWorkshops.filter(
        (item) => item.id !== practice?.id,
    );

    return (
        <div className="relative pb-20 lg:pb-0">
            <Head
                title={
                    grammar ? title : `${title} — ${currentLevel.toUpperCase()}`
                }
            />

            <section className="relative overflow-hidden pt-8 pb-14 md:pt-12 md:pb-16">
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
                        <ChevronRight className="h-3.5 w-3.5 text-foreground/30" />
                        <Link
                            href={workshopsRoute()}
                            className="transition-colors hover:text-foreground"
                        >
                            Ateliers
                        </Link>
                        <ChevronRight className="h-3.5 w-3.5 text-foreground/30" />
                        <span className="font-medium text-foreground/70">
                            {title}
                        </span>
                    </nav>

                    <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-start lg:gap-14">
                        <motion.div
                            initial={{ opacity: 0, y: 24 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.7 }}
                        >
                            <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary">
                                <CategoryIcon className="h-3.5 w-3.5" />
                                {isGrammar
                                    ? 'Pack de grammaire'
                                    : 'Atelier pratique'}{' '}
                                · {currentLevel.toUpperCase()}
                            </div>

                            <h1 className="text-4xl font-semibold tracking-tight text-foreground md:text-5xl lg:text-6xl">
                                {title}
                            </h1>

                            <p className="mt-3 text-lg font-medium text-foreground/80 md:text-xl">
                                {grammar?.outcome ?? practice?.subtitle}
                            </p>

                            <p className="mt-5 max-w-2xl text-foreground/60">
                                {description}
                            </p>

                            <div className="mt-5 flex flex-wrap gap-1.5">
                                {focus.map((item) => (
                                    <span
                                        key={item}
                                        className="rounded-full border border-border/50 bg-background/60 px-2.5 py-1 text-[11px] font-medium text-foreground/55 dark:border-border/60 dark:bg-background/30"
                                    >
                                        {item}
                                    </span>
                                ))}
                            </div>

                            <div className="mt-8 grid gap-3 sm:grid-cols-2">
                                <div className="flex items-center gap-3 rounded-2xl border border-border/40 bg-background/60 p-4 backdrop-blur-sm dark:border-border/50 dark:bg-background/40">
                                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                        <Clock className="h-5 w-5" />
                                    </span>
                                    <div>
                                        <p className="text-[10px] font-semibold tracking-[0.16em] text-foreground/40 uppercase">
                                            Volume
                                        </p>
                                        <p className="text-sm font-semibold text-foreground">
                                            {volume}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 rounded-2xl border border-border/40 bg-background/60 p-4 backdrop-blur-sm dark:border-border/50 dark:bg-background/40">
                                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                        <CalendarDays className="h-5 w-5" />
                                    </span>
                                    <div>
                                        <p className="text-[10px] font-semibold tracking-[0.16em] text-foreground/40 uppercase">
                                            Rythme
                                        </p>
                                        <p className="text-sm font-semibold text-foreground">
                                            {isGrammar
                                                ? '1 séance par semaine'
                                                : 'Séance unique'}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 rounded-2xl border border-border/40 bg-background/60 p-4 backdrop-blur-sm dark:border-border/50 dark:bg-background/40">
                                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                        <Users className="h-5 w-5" />
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
                                        <GraduationCap className="h-5 w-5" />
                                    </span>
                                    <div>
                                        <p className="text-[10px] font-semibold tracking-[0.16em] text-foreground/40 uppercase">
                                            Niveau
                                        </p>
                                        <p className="text-sm font-semibold text-foreground">
                                            {currentLevel.toUpperCase()} · CECRL
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
                                <div className="border-b border-border/30 bg-gradient-to-br from-primary/[0.08] via-background to-background p-6">
                                    <p className="text-[10px] font-semibold tracking-[0.2em] text-foreground/45 uppercase">
                                        {isGrammar
                                            ? `${sessionCount} séances · pack complet`
                                            : `Séance de ${durationMinutes} min`}
                                    </p>

                                    <div className="mt-3 flex items-end gap-2">
                                        <p className="font-mono text-4xl font-semibold tracking-tight text-foreground">
                                            {formatPrice(selectedPrice)}
                                        </p>
                                        <span className="pb-1 text-xs text-foreground/50">
                                            {isGrammar ? '/ pack' : '/ séance'}
                                        </span>
                                    </div>

                                    <p className="mt-1 text-xs text-foreground/55">
                                        {tierLabels[tier]}
                                        {tier === 'group' &&
                                            ' · prix par personne'}
                                    </p>
                                </div>

                                <div className="p-6">
                                    <TierSwitcher
                                        value={tier}
                                        onChange={setTier}
                                        className="w-full"
                                    />

                                    {practice && (
                                        <div className="mt-5 flex flex-col gap-2">
                                            <label
                                                htmlFor="detail-level"
                                                className="text-sm font-medium"
                                            >
                                                Ton niveau
                                            </label>
                                            <select
                                                id="detail-level"
                                                className={selectClassName}
                                                value={level}
                                                onChange={(event) =>
                                                    setLevel(
                                                        event.target
                                                            .value as LevelSlug,
                                                    )
                                                }
                                            >
                                                {workshopLevels.map((item) => (
                                                    <option
                                                        key={item}
                                                        value={item}
                                                    >
                                                        {item.toUpperCase()}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    )}

                                    <ul className="mt-5 space-y-2.5">
                                        {(isGrammar
                                            ? [
                                                  `${sessionCount} séances de ${durationMinutes} min en visio`,
                                                  'Supports et exercices inclus',
                                                  'Corrections pendant les séances',
                                                  'Groupe de 3 à 6 ou 1:1',
                                              ]
                                            : [
                                                  `Une séance de ${durationMinutes} min en visio`,
                                                  'Mise en pratique guidée',
                                                  'Support et phrases utiles',
                                                  'Groupe de 3 à 6 ou 1:1',
                                              ]
                                        ).map((feature) => (
                                            <li
                                                key={feature}
                                                className="flex items-start gap-2.5 text-sm text-foreground/60"
                                            >
                                                <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
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
                                            href={bookWorkshop({
                                                query: {
                                                    offer:
                                                        grammar?.id ??
                                                        practice!.id,
                                                    tier,
                                                    level: currentLevel,
                                                },
                                            })}
                                        >
                                            {isGrammar
                                                ? 'Réserver ce pack'
                                                : 'Réserver cette séance'}
                                        </Link>
                                    </Button>

                                    <p className="mt-3 text-center text-[11px] text-foreground/50">
                                        {isGrammar
                                            ? 'Paiement en 3× possible · +5 %'
                                            : 'Paiement en une fois'}
                                    </p>

                                    <div className="mt-5 rounded-xl border border-border/40 bg-muted/30 p-3 dark:border-border/50 dark:bg-foreground/[0.02]">
                                        <div className="flex items-center justify-between text-xs">
                                            <span className="text-foreground/60">
                                                Prochain départ
                                            </span>
                                            <span className="font-semibold text-primary">
                                                {isGrammar
                                                    ? 'Lundi · 18 h UTC'
                                                    : 'Mardi · 18 h UTC'}
                                            </span>
                                        </div>
                                        <p className="mt-2 text-[11px] text-foreground/45">
                                            Créneaux de démonstration, affichés
                                            dans ton fuseau à l’étape suivante.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </motion.aside>
                    </div>
                </div>
            </section>

            <section className="pb-16 md:pb-20">
                <div className="mx-auto max-w-7xl px-6 md:px-8 lg:px-12">
                    <div className="relative aspect-[16/9] overflow-hidden rounded-3xl md:aspect-[21/9]">
                        <img
                            src={image}
                            alt={title}
                            className="h-full w-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                        <div className="absolute inset-x-0 bottom-0 flex flex-wrap items-end justify-between gap-4 p-5 md:p-7">
                            <p className="max-w-xl text-sm font-medium text-white md:text-base">
                                {isGrammar
                                    ? 'Des règles expliquées à partir d’exemples concrets, puis réutilisées dans de courtes productions.'
                                    : 'Une séance courte, active et guidée : tu produis en allemand dès les premières minutes.'}
                            </p>
                            <span className="rounded-full bg-white/15 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-sm">
                                {volume}
                            </span>
                        </div>
                    </div>
                </div>
            </section>

            {grammar ? (
                <>
                    <section className="relative overflow-hidden bg-muted/30 py-20 md:py-28 dark:bg-foreground/[0.02]">
                        <div className="relative mx-auto max-w-7xl px-6 md:px-8 lg:px-12">
                            <SectionHeading
                                eyebrow="Le programme"
                                title={`${grammar.sessions} séances, une progression.`}
                                description="Chaque séance part d’un problème concret, explique la règle puis la fait travailler à l’écrit et à l’oral."
                                className="mb-12"
                            />

                            <div className="grid gap-3 lg:grid-cols-2">
                                {grammar.program.map((session, index) => (
                                    <motion.article
                                        key={session.title}
                                        initial={{ opacity: 0, y: 16 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{
                                            duration: 0.45,
                                            delay: index * 0.05,
                                        }}
                                        className="flex flex-col rounded-2xl border border-border/40 bg-background/70 p-5 backdrop-blur-sm dark:border-border/50 dark:bg-background/40"
                                    >
                                        <div className="flex items-center justify-between gap-3">
                                            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 font-mono text-xs font-bold text-primary">
                                                {index + 1}
                                            </span>
                                            <span className="font-mono text-[11px] text-foreground/40">
                                                Séance {index + 1} ·{' '}
                                                {grammar.durationMinutes} min
                                            </span>
                                        </div>

                                        <h3 className="mt-4 text-lg font-semibold text-foreground">
                                            {session.title}
                                        </h3>
                                        <p className="mt-1.5 text-sm leading-relaxed text-foreground/55">
                                            {session.description}
                                        </p>
                                    </motion.article>
                                ))}
                            </div>

                            <div className="mt-4 flex flex-col gap-2 rounded-2xl border border-border/40 bg-muted/30 p-4 sm:flex-row sm:items-center sm:justify-between dark:border-border/50 dark:bg-foreground/[0.02]">
                                <p className="flex items-center gap-2 text-xs text-foreground/55">
                                    <GraduationCap className="h-4 w-4 shrink-0 text-primary" />
                                    Pack autonome : aucun parcours complet
                                    requis.
                                </p>
                                <p className="text-xs font-semibold text-foreground/70">
                                    {volume} en visio
                                </p>
                            </div>
                        </div>
                    </section>

                    <section className="relative py-20 md:py-28">
                        <div className="relative mx-auto max-w-7xl px-6 md:px-8 lg:px-12">
                            <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
                                <div className="lg:sticky lg:top-24 lg:self-start">
                                    <SectionHeading
                                        eyebrow="Les acquis"
                                        title={`À la fin du pack ${grammar.level.toUpperCase()}, tu sauras…`}
                                        description="Des compétences concrètes, travaillées séance après séance — pas une liste de règles survolées."
                                    />
                                </div>

                                <div className="grid gap-3 sm:grid-cols-2">
                                    {grammar.canDo.map((item, index) => (
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
                                                <Check className="h-3.5 w-3.5" />
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
                </>
            ) : (
                <section className="relative overflow-hidden bg-muted/30 py-20 md:py-28 dark:bg-foreground/[0.02]">
                    <div className="relative mx-auto max-w-7xl px-6 md:px-8 lg:px-12">
                        <div className="mb-8 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                            <SectionHeading
                                eyebrow="La séance"
                                title={`${practice!.title} en ${currentLevel.toUpperCase()}.`}
                                description="Une consigne, une mise en pratique, un retour. Le contenu s’adapte au niveau choisi."
                            />
                            <div className="flex shrink-0 flex-col gap-2 sm:min-w-44">
                                <label
                                    htmlFor="program-level"
                                    className="text-sm font-medium"
                                >
                                    Afficher le niveau
                                </label>
                                <select
                                    id="program-level"
                                    className={selectClassName}
                                    value={level}
                                    onChange={(event) =>
                                        setLevel(
                                            event.target.value as LevelSlug,
                                        )
                                    }
                                >
                                    {workshopLevels.map((item) => (
                                        <option key={item} value={item}>
                                            {item.toUpperCase()}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
                            <div className="rounded-3xl border border-border/40 bg-background/70 p-6 backdrop-blur-sm md:p-8 dark:border-border/50 dark:bg-background/40">
                                <Badge variant="secondary">
                                    Exemple de séance ·{' '}
                                    {currentLevel.toUpperCase()}
                                </Badge>
                                <h3 className="mt-4 text-2xl font-semibold text-foreground">
                                    {practiceDetail!.task}
                                </h3>
                                <ul className="mt-6 space-y-3 border-t border-border/30 pt-5">
                                    {practiceDetail!.activities.map(
                                        (activity, index) => (
                                            <li
                                                key={activity}
                                                className="flex items-start gap-3"
                                            >
                                                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 font-mono text-[11px] font-semibold text-primary">
                                                    {index + 1}
                                                </span>
                                                <p className="text-sm leading-relaxed text-foreground/65">
                                                    {activity}
                                                </p>
                                            </li>
                                        ),
                                    )}
                                </ul>
                            </div>

                            <div className="flex flex-col gap-4">
                                <div className="rounded-3xl border border-border/40 bg-background/70 p-6 backdrop-blur-sm dark:border-border/50 dark:bg-background/40">
                                    <p className="text-[11px] font-bold tracking-[0.22em] text-primary uppercase">
                                        Ce que tu emportes
                                    </p>
                                    <p className="mt-3 text-lg font-medium text-foreground">
                                        {practiceDetail!.outcome}
                                    </p>
                                </div>

                                <div className="rounded-3xl border border-border/40 bg-background/70 p-6 backdrop-blur-sm dark:border-border/50 dark:bg-background/40">
                                    <p className="text-[11px] font-bold tracking-[0.22em] text-primary uppercase">
                                        Pour qui ?
                                    </p>
                                    <p className="mt-3 text-sm leading-relaxed text-foreground/60">
                                        Pour les élèves de niveau{' '}
                                        {currentLevel.toUpperCase()} qui veulent
                                        pratiquer sans suivre un parcours
                                        complet. En groupe, tout le monde
                                        travaille le même niveau.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-10">
                            <h3 className="mb-4 text-lg font-semibold">
                                Les quatre niveaux
                            </h3>
                            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                                {workshopLevels.map((item) => {
                                    const detail = practice!.levels[item];
                                    return (
                                        <button
                                            key={item}
                                            type="button"
                                            onClick={() => setLevel(item)}
                                            className={cn(
                                                'rounded-2xl border p-4 text-left transition-colors focus-visible:outline-2 focus-visible:outline-primary',
                                                level === item
                                                    ? 'border-primary bg-primary/5'
                                                    : 'border-border/40 bg-background/60 hover:border-primary/40 dark:border-border/50 dark:bg-background/40',
                                            )}
                                        >
                                            <span className="font-mono text-xs font-semibold text-primary">
                                                {item.toUpperCase()}
                                            </span>
                                            <p className="mt-2 text-sm font-medium text-foreground">
                                                {detail.task}
                                            </p>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </section>
            )}

            <section className="relative py-20 md:py-28">
                <div className="relative mx-auto max-w-7xl px-6 md:px-8 lg:px-12">
                    <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                        <SectionHeading
                            eyebrow="Continuer"
                            title={
                                isGrammar
                                    ? 'Les autres packs.'
                                    : 'Les autres ateliers.'
                            }
                            description={
                                isGrammar
                                    ? 'Un pack par niveau, à prendre indépendamment selon le point qui bloque.'
                                    : 'Trois façons de pratiquer, à choisir selon ce que tu veux travailler.'
                            }
                        />
                        <Link
                            href={workshopsRoute()}
                            className="group inline-flex shrink-0 items-center gap-2 text-sm font-semibold text-foreground/60 transition-colors hover:text-foreground"
                        >
                            <ArrowLeft className="h-4 w-4 text-primary transition-transform group-hover:-translate-x-1" />
                            Tous les ateliers
                        </Link>
                    </div>

                    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                        {isGrammar
                            ? relatedGrammar.map((item) => (
                                  <Link
                                      key={item.id}
                                      href={workshopDetail.url(item.id, {
                                          query: { tier },
                                      })}
                                      className="group flex flex-col rounded-2xl border border-border/40 bg-card p-5 transition-colors hover:border-primary/40 dark:border-border/50"
                                  >
                                      <div className="flex items-center justify-between gap-3">
                                          <span className="font-mono text-xs font-semibold text-primary">
                                              {item.level.toUpperCase()}
                                          </span>
                                          <span className="text-xs text-foreground/45">
                                              {workshopVolume(
                                                  item.sessions,
                                                  item.durationMinutes,
                                              )}
                                          </span>
                                      </div>
                                      <h3 className="mt-3 text-lg font-semibold">
                                          {item.title}
                                      </h3>
                                      <p className="mt-2 flex-1 text-sm leading-relaxed text-foreground/55">
                                          {item.outcome}
                                      </p>
                                      <p className="mt-4 flex items-center justify-between border-t border-border/30 pt-4">
                                          <span className="font-mono text-sm font-semibold">
                                              {formatPrice(item.price[tier])}
                                          </span>
                                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary">
                                              Voir le pack
                                              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                                          </span>
                                      </p>
                                  </Link>
                              ))
                            : relatedPractice.map((item) => {
                                  const Icon =
                                      practiceIcons[
                                          item.id as keyof typeof practiceIcons
                                      ];
                                  return (
                                      <Link
                                          key={item.id}
                                          href={workshopDetail.url(item.id, {
                                              query: { tier, level },
                                          })}
                                          className="group flex flex-col rounded-2xl border border-border/40 bg-card p-5 transition-colors hover:border-primary/40 dark:border-border/50"
                                      >
                                          <div className="flex items-center justify-between gap-3">
                                              <span className="flex items-center gap-2 font-semibold">
                                                  <Icon className="h-4 w-4 text-primary" />
                                                  {item.title}
                                              </span>
                                              <span className="text-xs text-foreground/45">
                                                  {item.durationMinutes} min
                                              </span>
                                          </div>
                                          <p className="mt-1 text-xs font-medium text-primary">
                                              {item.subtitle}
                                          </p>
                                          <p className="mt-3 flex-1 text-sm leading-relaxed text-foreground/55">
                                              {
                                                  item.levels[currentLevel]
                                                      .outcome
                                              }
                                          </p>
                                          <p className="mt-4 flex items-center justify-between border-t border-border/30 pt-4">
                                              <span className="font-mono text-sm font-semibold">
                                                  {formatPrice(
                                                      item.price[tier],
                                                  )}
                                              </span>
                                              <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary">
                                                  Voir l’atelier
                                                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                                              </span>
                                          </p>
                                      </Link>
                                  );
                              })}
                    </div>
                </div>
            </section>

            <CtaBand
                title={
                    isGrammar
                        ? 'Tu veux aussi pratiquer à l’oral ?'
                        : 'Tu veux consolider les règles ?'
                }
                description={
                    isGrammar
                        ? 'Les ateliers Sprechen, Schreiben et Wortschatz complètent le pack sans engagement de parcours.'
                        : 'Les packs de grammaire A1 à B2 travaillent les structures d’un niveau, séance après séance.'
                }
                primary={{
                    label: isGrammar
                        ? 'Voir les ateliers pratiques'
                        : 'Voir les packs de grammaire',
                    href: `${workshopsRoute.url()}${isGrammar ? '#practice' : '#grammar'}`,
                }}
                secondary={{
                    label: 'Tous les ateliers',
                    href: workshopsRoute.url(),
                }}
            />

            <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border/40 bg-background/95 px-4 py-3 backdrop-blur-lg lg:hidden dark:border-border/50">
                <div className="mx-auto flex max-w-7xl items-center gap-3">
                    <div className="min-w-0 flex-1">
                        <p className="text-[10px] font-semibold tracking-[0.16em] text-foreground/40 uppercase">
                            {currentLevel.toUpperCase()} · {tierLabels[tier]}
                        </p>
                        <p className="font-mono text-lg font-semibold text-foreground">
                            {formatPrice(selectedPrice)}
                        </p>
                    </div>
                    <Button className="rounded-full" asChild>
                        <Link
                            href={bookWorkshop({
                                query: {
                                    offer: grammar?.id ?? practice!.id,
                                    tier,
                                    level: currentLevel,
                                },
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
