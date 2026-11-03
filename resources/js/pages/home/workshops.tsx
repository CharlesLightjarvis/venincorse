import { Head, Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { ArrowRight, Check, Clock, Compass, Sparkles, Users } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { CtaBand } from '@/components/marketing/cta-band';
import { FaqSection } from '@/components/marketing/faq-section';
import { OfferCard } from '@/components/marketing/offer-card';
import { PageHero } from '@/components/marketing/page-hero';
import { SectionHeading } from '@/components/marketing/section-heading';
import { TierSwitcher } from '@/components/marketing/tier-switcher';
import {
    ateliers,
    faqs,
    formatPrice,
    stage,
    type TierKey,
} from '@/data/offer';

const workshopSteps = [
    {
        icon: Compass,
        title: 'Tu choisis le point qui bloque',
        description:
            'Articles, temps, subordonnées : un seul sujet par atelier. Pas de programme fourre-tout.',
    },
    {
        icon: Clock,
        title: 'Quatre séances de 90 minutes',
        description:
            'Chaque séance : un système visuel, des exercices courts et une mise en pratique orale immédiate.',
    },
    {
        icon: Sparkles,
        title: 'Tu repars avec une méthode',
        description:
            'Pas une liste de règles à oublier. Un réflexe utilisable le lendemain, à l’écrit comme à l’oral.',
    },
] as const;

const atelierFaqs = [faqs[1], faqs[2], faqs[6], faqs[7]];

export default function Workshops() {
    const [tier, setTier] = useState<TierKey>('group');

    return (
        <>
            <Head title="Ateliers & stage" />

            <PageHero
                eyebrow="Ateliers & stage"
                title={
                    <>
                        Un point précis.{' '}
                        <span className="text-primary">
                            Réglé en quatre séances.
                        </span>
                    </>
                }
                description="Les ateliers ciblent une difficulté concrète. Le stage de vacances débloque un niveau en cinq jours. Dans les deux cas, tu repars avec une méthode, pas une pile de photocopies."
            >
                <Button size="lg" className="group gap-2 rounded-full" asChild>
                    <Link href="/tarifs">
                        Voir les tarifs
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
                    <Link href="/contact">Nous écrire</Link>
                </Button>
            </PageHero>

            <section className="relative pb-20 md:pb-28">
                <div className="relative mx-auto max-w-7xl px-6 md:px-8 lg:px-12">
                    <div className="mb-10 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                        <SectionHeading
                            eyebrow="Les ateliers"
                            title="Deux blocages, deux réponses."
                            description="Les tarifs sont par personne et incluent les supports, les corrections et le replay."
                        />

                        <div className="shrink-0">
                            <p className="mb-2 text-[10px] font-semibold tracking-[0.2em] text-foreground/40 uppercase">
                                Afficher les prix
                            </p>
                            <TierSwitcher value={tier} onChange={setTier} />
                        </div>
                    </div>

                    <div className="grid gap-5 md:grid-cols-2">
                        {ateliers.map((atelier, index) => (
                            <OfferCard
                                key={atelier.id}
                                index={index}
                                image={atelier.image}
                                alt={`Atelier ${atelier.title}`}
                                badge={{ label: atelier.level }}
                                chip={{
                                    value: String(atelier.sessions),
                                    label: 'séances',
                                }}
                            >
                                <h3 className="mb-1 text-base leading-snug font-semibold text-foreground">
                                    {atelier.title}
                                </h3>

                                <p className="mb-3 text-sm leading-relaxed text-foreground/60">
                                    {atelier.description}
                                </p>

                                <ul className="mb-4 space-y-1.5 flex-1">
                                    {atelier.outcomes.map((outcome) => (
                                        <li
                                            key={outcome}
                                            className="flex items-start gap-2.5 text-sm text-foreground/60"
                                        >
                                            <Check
                                                className="mt-0.5 h-4 w-4 shrink-0 text-primary"
                                                aria-hidden="true"
                                            />
                                            {outcome}
                                        </li>
                                    ))}
                                </ul>

                                <div className="flex items-center justify-between border-t border-border/30 pt-4">
                                    <div>
                                        <p className="text-[10px] uppercase tracking-wider text-foreground/40">
                                            {atelier.volume} · par personne
                                        </p>
                                        <p className="font-mono text-sm font-semibold text-foreground">
                                            {formatPrice(atelier.price[tier])}
                                        </p>
                                    </div>

                                    <Button
                                        variant="secondary"
                                        size="sm"
                                        asChild
                                    >
                                        <Link href="/contact">
                                            Réserver
                                            <ArrowRight
                                                className="h-3.5 w-3.5"
                                                aria-hidden="true"
                                            />
                                        </Link>
                                    </Button>
                                </div>
                            </OfferCard>
                        ))}
                    </div>
                </div>
            </section>

            <section className="relative overflow-hidden bg-muted/30 py-20 md:py-28 dark:bg-foreground/[0.02]">
                <div className="pointer-events-none absolute inset-0 overflow-hidden">
                    <div className="absolute top-0 left-1/4 h-[380px] w-[380px] rounded-full bg-primary/[0.04] blur-[140px] dark:bg-primary/[0.06]" />
                </div>

                <div className="relative mx-auto max-w-7xl px-6 md:px-8 lg:px-12">
                    <div className="mx-auto max-w-xl">
                        <OfferCard
                            index={0}
                            image={stage.image}
                            alt="Stage de vacances d'allemand"
                            badge={{ label: 'Stage' }}
                            chip={{ value: '5', label: 'jours' }}
                        >
                            <h3 className="mb-1 text-base leading-snug font-semibold text-foreground">
                                {stage.title}
                            </h3>

                            <p className="mb-3 text-xs font-medium text-primary">
                                {stage.subtitle}
                            </p>

                            <p className="mb-4 text-sm leading-relaxed text-foreground/60">
                                {stage.description}
                            </p>

                            <div className="mb-4 flex flex-wrap gap-1.5 flex-1">
                                {stage.dates.map((date) => (
                                    <span
                                        key={date}
                                        className="rounded-full border border-border/50 bg-background/60 px-2 py-0.5 text-[11px] font-medium text-foreground/60 dark:border-border/60 dark:bg-background/30"
                                    >
                                        {date}
                                    </span>
                                ))}
                            </div>

                            <div className="flex items-center justify-between border-t border-border/30 pt-4">
                                <div>
                                    <p className="text-[10px] uppercase tracking-wider text-foreground/40">
                                        À partir de
                                    </p>
                                    <p className="font-mono text-sm font-semibold text-foreground">
                                        {formatPrice(stage.price.group)}{' '}
                                        <span className="text-foreground/50">
                                            · duo{' '}
                                            {formatPrice(stage.price.duo)} ·
                                            1:1{' '}
                                            {formatPrice(stage.price.solo)}
                                        </span>
                                    </p>
                                </div>

                                <Button variant="secondary" size="sm" asChild>
                                    <Link href="/bilan">
                                        Réserver
                                        <ArrowRight
                                            className="h-3.5 w-3.5"
                                            aria-hidden="true"
                                        />
                                    </Link>
                                </Button>
                            </div>
                        </OfferCard>
                    </div>
                </div>
            </section>

            <section className="relative py-20 md:py-28">
                <div className="relative mx-auto max-w-7xl px-6 md:px-8 lg:px-12">
                    <SectionHeading
                        eyebrow="Comment ça marche"
                        title="Trois séances pour comprendre, une pour ancrer."
                        description="Le format est court exprès : on cible, on pratique, on repart avec un réflexe."
                        align="center"
                        className="mb-12"
                    />

                    <div className="grid gap-5 md:grid-cols-3">
                        {workshopSteps.map((step, index) => (
                            <motion.div
                                key={step.title}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{
                                    duration: 0.5,
                                    delay: index * 0.07,
                                }}
                                className="rounded-2xl border border-border/40 bg-card p-6 dark:border-border/50"
                            >
                                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                                    <step.icon
                                        className="h-5 w-5"
                                        aria-hidden="true"
                                    />
                                </span>

                                <h3 className="mt-5 font-semibold text-foreground">
                                    {step.title}
                                </h3>

                                <p className="mt-2 text-sm leading-relaxed text-foreground/60">
                                    {step.description}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="relative pb-20 md:pb-28">
                <div className="relative mx-auto max-w-7xl px-6 md:px-8 lg:px-12">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="flex flex-col items-start justify-between gap-6 rounded-3xl border border-primary/15 bg-primary/[0.05] p-6 md:flex-row md:items-center md:p-8 dark:border-primary/20 dark:bg-primary/[0.07]"
                    >
                        <div className="max-w-xl">
                            <p className="text-[11px] font-bold tracking-[0.22em] text-primary uppercase">
                                Pack découverte
                            </p>
                            <h2 className="mt-2 text-xl font-semibold tracking-tight text-foreground md:text-2xl">
                                Bilan + première séance, pour tester avant de
                                t’engager.
                            </h2>
                            <p className="mt-2 text-sm text-foreground/60">
                                45 minutes de bilan, puis une séance de 60
                                minutes pour goûter à la méthode. Le montant est
                                crédité si tu poursuis.
                            </p>
                        </div>

                        <div className="flex shrink-0 flex-col items-start gap-1 sm:flex-row sm:items-end sm:gap-4">
                            <div>
                                <p className="text-[10px] font-semibold tracking-[0.16em] text-foreground/40 uppercase">
                                    1:1
                                </p>
                                <p className="font-mono text-2xl font-semibold text-foreground">
                                    140 €
                                </p>
                            </div>
                            <div>
                                <p className="text-[10px] font-semibold tracking-[0.16em] text-foreground/40 uppercase">
                                    Duo
                                </p>
                                <p className="font-mono text-2xl font-semibold text-foreground">
                                    100 €
                                </p>
                            </div>
                            <Button className="rounded-full" asChild>
                                <Link href="/bilan">Réserver</Link>
                            </Button>
                        </div>
                    </motion.div>

                    <p className="mt-4 flex items-center gap-2 text-xs text-foreground/50">
                        <Users
                            className="h-3.5 w-3.5 text-primary"
                            aria-hidden="true"
                        />
                        Les ateliers et stages ouvrent à partir de 3 inscrits.
                        En dessous, on bascule en duo au tarif correspondant.
                    </p>
                </div>
            </section>

            <FaqSection
                items={atelierFaqs}
                title="Ateliers & stage, en pratique"
                description="Prérequis, formats, ouverture des groupes et annulation."
            />

            <CtaBand
                eyebrow="Un blocage précis ?"
                title="Dis-nous ce qui coince."
                description="Articles, temps, oral, subordonnées : on identifie le point qui te bloque et on te propose l’atelier ou le stage le plus court pour le régler."
                primary={{ label: 'Décrire mon blocage', href: '/contact' }}
                secondary={{ label: 'Voir les parcours', href: '/courses' }}
            />
        </>
    );
}
