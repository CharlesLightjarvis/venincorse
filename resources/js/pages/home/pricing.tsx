import { Head, Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import {
    ArrowRight,
    CalendarDays,
    Check,
    Clock,
    CreditCard,
    FileText,
    GraduationCap,
    Sparkles,
    Target,
} from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { CtaBand } from '@/components/marketing/cta-band';
import { FaqSection } from '@/components/marketing/faq-section';
import { OfferCard } from '@/components/marketing/offer-card';
import { PageHero } from '@/components/marketing/page-hero';
import { SectionHeading } from '@/components/marketing/section-heading';
import { TierSwitcher } from '@/components/marketing/tier-switcher';
import { cn } from '@/lib/utils';
import {
    ateliers,
    examPreps,
    faqs,
    formatPrice,
    levels,
    pricePerHour,
    stage,
    tierLabels,
    tierShortLabels,
    type TierKey,
} from '@/data/offer';

const tierOrder: TierKey[] = ['group', 'duo', 'solo'];

const services = [
    {
        icon: Target,
        title: 'Bilan de niveau',
        price: '39 €',
        detail: '45 minutes en visio, plan écrit sous 48 h. Crédité sur ton premier parcours sous 7 jours.',
    },
    {
        icon: Sparkles,
        title: 'Pack découverte',
        price: '140 €',
        detail: 'Bilan + première séance de 60 minutes en 1:1. Tarif duo : 100 €.',
    },
    {
        icon: FileText,
        title: 'Suivi écrit',
        price: '59 €/mois',
        detail: 'Corrections d’emails, de lettres et de textes d’examen, avec retour détaillé sous 48 h.',
    },
    {
        icon: CreditCard,
        title: 'Paiement en 3×',
        price: '+5 %',
        detail: 'Trois échéances mensuelles, sans dossier bancaire. À choisir à l’inscription.',
    },
] as const;

const pricingFaqs = [faqs[2], faqs[5], faqs[6], faqs[7]];

const includedPoints = [
    'Supports et exercices inclus',
    'Corrections personnalisées',
    'Replay 30 jours',
    'Deux checkpoints par niveau',
] as const;

export default function Pricing() {
    const [tier, setTier] = useState<TierKey>('group');

    return (
        <>
            <Head title="Tarifs" />

            <PageHero
                eyebrow="Tarifs"
                title={
                    <>
                        Des prix clairs,{' '}
                        <span className="text-primary">en euros.</span>
                    </>
                }
                description="Groupe, duo ou 1:1 : le prix baisse quand le groupe grandit, jamais l’exigence. Tous les tarifs sont par personne, sans frais cachés."
            >
                <Button size="lg" className="group gap-2 rounded-full" asChild>
                    <Link href="/bilan">
                        Faire le bilan de niveau
                        <ArrowRight
                            className="h-4 w-4 transition-transform group-hover:translate-x-1"
                            aria-hidden="true"
                        />
                    </Link>
                </Button>

                <Button
                    size="lg"
                    variant="outline"
                    className="rounded-full border-border/50 bg-background/60 backdrop-blur-sm"
                    asChild
                >
                    <Link href="/contact">Poser une question</Link>
                </Button>
            </PageHero>

            <div className="sticky top-14 z-30 border-y border-border/40 bg-background/90 backdrop-blur-lg dark:border-border/50">
                <div className="mx-auto flex max-w-7xl flex-col gap-2 px-6 py-3 sm:flex-row sm:items-center sm:justify-between md:px-8 lg:px-12">
                    <p className="text-xs text-foreground/55">
                        Afficher les prix pour{' '}
                        <span className="font-semibold text-foreground">
                            {tierLabels[tier]}
                        </span>
                    </p>

                    <TierSwitcher value={tier} onChange={setTier} />

                    <p className="hidden text-xs text-foreground/45 lg:block">
                        Paiement en 3× possible · +5 %
                    </p>
                </div>
            </div>

            <section className="relative py-16 md:py-24">
                <div className="relative mx-auto max-w-7xl px-6 md:px-8 lg:px-12">
                    <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                        <SectionHeading
                            eyebrow="Parcours A1 → B2"
                            title="Un niveau complet, 60 heures."
                            description="Deux sous-niveaux de 30 heures, deux checkpoints, un prix unique par formule."
                        />

                        <p className="shrink-0 rounded-full border border-border/40 bg-background/60 px-4 py-2 font-mono text-xs text-foreground/50 backdrop-blur-sm dark:border-border/50 dark:bg-background/40">
                            {tierLabels[tier]}
                        </p>
                    </div>

                    <div className="grid gap-5 sm:grid-cols-2">
                        {levels.map((level, index) => (
                            <OfferCard
                                key={level.slug}
                                index={index}
                                image={level.image}
                                alt={`Parcours ${level.code} — ${level.name}`}
                                badge={{ label: level.code }}
                                chip={{ value: String(level.hours), label: 'h' }}
                                flag={
                                    level.featured
                                        ? 'Le plus demandé'
                                        : undefined
                                }
                            >
                                <h3 className="mb-1 text-base leading-snug font-semibold text-foreground">
                                    {level.code} — {level.name}
                                </h3>

                                <p className="mb-4 text-sm leading-relaxed text-foreground/60">
                                    {level.tagline}
                                </p>

                                <div className="mb-4 rounded-2xl border border-border/40 bg-muted/30 p-4 dark:border-border/50 dark:bg-foreground/[0.02]">
                                    <p className="text-[10px] font-semibold tracking-[0.2em] text-foreground/40 uppercase">
                                        {tierLabels[tier]}
                                    </p>

                                    <div className="mt-1 flex flex-wrap items-end gap-2">
                                        <p className="font-mono text-2xl font-semibold text-foreground">
                                            {formatPrice(level.price[tier])}
                                        </p>
                                        <p className="pb-1 text-xs text-foreground/50">
                                            {pricePerHour(
                                                level.price[tier],
                                                level.hours,
                                            )}{' '}
                                            / h
                                        </p>
                                    </div>
                                </div>

                                <div className="mb-4 space-y-2 flex-1">
                                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-foreground/50">
                                        {tierOrder.map((priceTier) => (
                                            <span
                                                key={priceTier}
                                                className={cn(
                                                    priceTier === tier &&
                                                        'font-semibold text-primary',
                                                )}
                                            >
                                                {tierShortLabels[priceTier]}{' '}
                                                <span className="font-mono">
                                                    {formatPrice(
                                                        level.price[priceTier],
                                                    )}
                                                </span>
                                            </span>
                                        ))}
                                    </div>

                                    <div className="flex items-center gap-1.5 text-xs text-foreground/50">
                                        <CalendarDays
                                            className="h-3.5 w-3.5"
                                            aria-hidden="true"
                                        />
                                        Cohorte du {level.nextCohort}
                                    </div>
                                </div>

                                <Button
                                    variant="secondary"
                                    size="sm"
                                    className="w-full"
                                    asChild
                                >
                                    <Link href={`/courses/${level.slug}`}>
                                        Voir le parcours
                                        <ArrowRight
                                            className="h-3.5 w-3.5"
                                            aria-hidden="true"
                                        />
                                    </Link>
                                </Button>
                            </OfferCard>
                        ))}
                    </div>

                    <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 rounded-2xl border border-border/40 bg-muted/20 px-5 py-4 dark:border-border/50 dark:bg-foreground/[0.015]">
                        {includedPoints.map((point) => (
                            <span
                                key={point}
                                className="inline-flex items-center gap-2 text-xs text-foreground/60"
                            >
                                <Check
                                    className="h-3.5 w-3.5 text-primary"
                                    aria-hidden="true"
                                />
                                {point}
                            </span>
                        ))}
                    </div>
                </div>
            </section>

            <section className="relative overflow-hidden bg-muted/30 py-16 md:py-24 dark:bg-foreground/[0.02]">
                <div className="relative mx-auto max-w-7xl px-6 md:px-8 lg:px-12">
                    <SectionHeading
                        eyebrow="Prépa examens"
                        title="ÖSD & TELC, du format court au complet."
                        description="Les prix sont par personne. L’inscription à l’examen reste à ta charge."
                        className="mb-10"
                    />

                    <div className="overflow-hidden rounded-3xl border border-border/40 bg-background/70 backdrop-blur-sm dark:border-border/50 dark:bg-background/40">
                        {examPreps.map((prep, index) => (
                            <div
                                key={prep.id}
                                className={cn(
                                    'flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between md:px-6',
                                    index > 0 && 'border-t border-border/30',
                                )}
                            >
                                <div className="min-w-0">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <span
                                            className={cn(
                                                'rounded-full px-2.5 py-1 font-mono text-[11px] font-semibold',
                                                prep.accent.bg,
                                                prep.accent.text,
                                            )}
                                        >
                                            {prep.level}
                                        </span>
                                        <p className="text-sm font-semibold text-foreground">
                                            {prep.title}
                                        </p>
                                        {prep.popular ? (
                                            <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-semibold text-primary">
                                                Le plus choisi
                                            </span>
                                        ) : null}
                                    </div>

                                    <p className="mt-1 flex items-center gap-1.5 text-xs text-foreground/50">
                                        <Clock
                                            className="h-3.5 w-3.5"
                                            aria-hidden="true"
                                        />
                                        {prep.volume} · {prep.subtitle}
                                    </p>
                                </div>

                                <div className="flex items-center justify-between gap-4 sm:justify-end">
                                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-foreground/50">
                                        {tierOrder.map((priceTier) => (
                                            <span
                                                key={priceTier}
                                                className={cn(
                                                    priceTier === tier &&
                                                        'font-semibold text-primary',
                                                )}
                                            >
                                                {tierShortLabels[priceTier]}{' '}
                                                <span className="font-mono">
                                                    {formatPrice(
                                                        prep.price[priceTier],
                                                    )}
                                                </span>
                                            </span>
                                        ))}
                                    </div>

                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="shrink-0 rounded-full border-border/50"
                                        asChild
                                    >
                                        <Link href="/examens">Voir</Link>
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="relative py-16 md:py-24">
                <div className="relative mx-auto max-w-7xl px-6 md:px-8 lg:px-12">
                    <SectionHeading
                        eyebrow="Ateliers & stage"
                        title="Les formats courts."
                        description="Par personne, supports et replay inclus. Les groupes ouvrent à partir de 3 inscrits."
                        className="mb-10"
                    />

                    <div className="overflow-hidden rounded-3xl border border-border/40 bg-card dark:border-border/50">
                        {[...ateliers, { ...stage, id: 'stage' }].map(
                            (item, index) => (
                                <div
                                    key={item.id}
                                    className={cn(
                                        'flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between md:px-6',
                                        index > 0 &&
                                            'border-t border-border/30',
                                    )}
                                >
                                    <div className="min-w-0">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <p className="text-sm font-semibold text-foreground">
                                                {item.title}
                                            </p>
                                            <span className="rounded-full border border-border/50 px-2.5 py-1 text-[10px] font-medium text-foreground/50 dark:border-border/60">
                                                {item.volume}
                                            </span>
                                        </div>

                                        <p className="mt-1 text-xs text-foreground/50">
                                            {item.description}
                                        </p>
                                    </div>

                                    <div className="flex items-center justify-between gap-4 sm:justify-end">
                                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-foreground/50">
                                            {tierOrder.map((priceTier) => (
                                                <span
                                                    key={priceTier}
                                                    className={cn(
                                                        priceTier === tier &&
                                                            'font-semibold text-primary',
                                                    )}
                                                >
                                                    {tierShortLabels[
                                                        priceTier
                                                    ]}{' '}
                                                    <span className="font-mono">
                                                        {formatPrice(
                                                            item.price[
                                                                priceTier
                                                            ],
                                                        )}
                                                    </span>
                                                </span>
                                            ))}
                                        </div>

                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="shrink-0 rounded-full border-border/50"
                                            asChild
                                        >
                                            <Link href="/ateliers">
                                                Voir
                                            </Link>
                                        </Button>
                                    </div>
                                </div>
                            ),
                        )}
                    </div>
                </div>
            </section>

            <section className="relative overflow-hidden bg-muted/30 py-16 md:py-24 dark:bg-foreground/[0.02]">
                <div className="relative mx-auto max-w-7xl px-6 md:px-8 lg:px-12">
                    <SectionHeading
                        eyebrow="Options & services"
                        title="Le complément, seulement si utile."
                        description="Pas de pack imposé. Tu ajoutes ce qui correspond à ton objectif."
                        className="mb-10"
                    />

                    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                        {services.map((service, index) => (
                            <motion.div
                                key={service.title}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{
                                    duration: 0.5,
                                    delay: index * 0.06,
                                }}
                                className="rounded-2xl border border-border/40 bg-background/70 p-5 backdrop-blur-sm dark:border-border/50 dark:bg-background/40"
                            >
                                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                    <service.icon
                                        className="h-5 w-5"
                                        aria-hidden="true"
                                    />
                                </span>

                                <h3 className="mt-4 text-sm font-semibold text-foreground">
                                    {service.title}
                                </h3>

                                <p className="mt-1 font-mono text-lg font-semibold text-foreground">
                                    {service.price}
                                </p>

                                <p className="mt-2 text-xs leading-relaxed text-foreground/55">
                                    {service.detail}
                                </p>
                            </motion.div>
                        ))}
                    </div>

                    <div className="mt-8 flex flex-col items-start justify-between gap-4 rounded-2xl border border-border/40 bg-background/60 p-5 sm:flex-row sm:items-center dark:border-border/50 dark:bg-background/40">
                        <div className="flex items-start gap-3">
                            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-chart-1/10 text-chart-1">
                                <CalendarDays
                                    className="h-5 w-5"
                                    aria-hidden="true"
                                />
                            </span>
                            <div>
                                <p className="text-sm font-semibold text-foreground">
                                    Tu hésites encore sur le format ?
                                </p>
                                <p className="text-xs text-foreground/55">
                                    Le bilan de niveau recommande la formule la
                                    plus économique pour ton objectif — pas la
                                    plus chère.
                                </p>
                            </div>
                        </div>

                        <Button className="rounded-full" asChild>
                            <Link href="/bilan">Faire le bilan — 39 €</Link>
                        </Button>
                    </div>
                </div>
            </section>

            <section className="relative py-16 md:py-20">
                <div className="relative mx-auto max-w-7xl px-6 md:px-8 lg:px-12">
                    <div className="grid gap-4 sm:grid-cols-3">
                        {[
                            {
                                icon: GraduationCap,
                                title: 'Sans frais cachés',
                                detail: 'Le prix affiché inclut supports, corrections et checkpoints.',
                            },
                            {
                                icon: CreditCard,
                                title: 'Paiement flexible',
                                detail: 'Carte, PayPal ou virement. Trois fois possible avec +5 %.',
                            },
                            {
                                icon: Check,
                                title: 'Annulation 14 jours',
                                detail: 'Rétractation européenne, puis report de séance jusqu’à 24 h avant.',
                            },
                        ].map((item) => (
                            <div
                                key={item.title}
                                className="flex items-start gap-3 rounded-2xl border border-border/40 bg-card p-5 dark:border-border/50"
                            >
                                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                    <item.icon
                                        className="h-5 w-5"
                                        aria-hidden="true"
                                    />
                                </span>
                                <div>
                                    <p className="text-sm font-semibold text-foreground">
                                        {item.title}
                                    </p>
                                    <p className="mt-1 text-xs text-foreground/55">
                                        {item.detail}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <FaqSection
                items={pricingFaqs}
                eyebrow="Tarifs & paiement"
                title="Questions d’argent, réponses claires."
                description="Bilan, euros, ouverture des groupes et annulation : on ne laisse pas de flou."
            />

            <CtaBand
                eyebrow="Le bon point de départ"
                title="Un bilan, un plan, un budget."
                description="En 45 minutes, tu sais quel niveau viser, combien d’heures prévoir et quelle formule est la plus économique pour toi. Les 39 € sont crédités si tu t’inscris sous 7 jours."
                primary={{ label: 'Réserver le bilan', href: '/bilan' }}
                secondary={{ label: 'Voir les parcours', href: '/courses' }}
            />
        </>
    );
}
