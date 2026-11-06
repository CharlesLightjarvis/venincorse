import { Head, Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { ArrowRight, CalendarDays } from 'reicon-react';
import { Button } from '@/components/ui/button';
import { CtaBand } from '@/components/marketing/cta-band';
import { FaqSection } from '@/components/marketing/faq-section';
import { OfferCard } from '@/components/marketing/offer-card';
import { PageHero } from '@/components/marketing/page-hero';
import { SectionHeading } from '@/components/marketing/section-heading';
import { faqs, formatPrice, formats, included, levels } from '@/data/offer';

function seatsColorClass(remaining: number, total: number) {
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

const parcoursFaqs = [faqs[0], faqs[1], faqs[3], faqs[7]];

export default function Courses() {
    return (
        <>
            <Head title="Parcours A1 → B2" />

            <PageHero
                eyebrow="Les parcours"
                title={
                    <>
                        De zéro à B2,{' '}
                        <span className="text-primary">
                            sans sauter d’étape.
                        </span>
                    </>
                }
                description="Quatre niveaux de 60 heures, deux sous-niveaux par niveau et un checkpoint toutes les 30 heures. Tu sais toujours où tu en es — et ce qu’on attaque ensuite."
            >
                <Button size="lg" className="group gap-2 rounded-full" asChild>
                    <Link href="/trial">
                        Réserver un cours d’essai
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
                    <Link href="/level-test">Tester mon niveau — gratuit</Link>
                </Button>
            </PageHero>

            <section className="relative pb-20 md:pb-28">
                <div className="relative mx-auto max-w-7xl px-6 md:px-8 lg:px-12">
                    <div className="mb-10 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
                        <SectionHeading
                            eyebrow="Les quatre niveaux"
                            title="Un niveau, un cap, deux checkpoints."
                            description="Chaque parcours couvre un niveau complet du CECRL. Le prix baisse en groupe, l’exigence reste la même."
                        />

                        <p className="shrink-0 rounded-full border border-border/40 bg-background/60 px-4 py-2 font-mono text-xs text-foreground/50 backdrop-blur-sm dark:border-border/50 dark:bg-background/40">
                            4 × 60 h = 240 h
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
                                chip={{
                                    value: String(level.hours),
                                    label: 'h',
                                }}
                                flag={
                                    level.featured
                                        ? 'Le plus demandé'
                                        : undefined
                                }
                            >
                                <h3 className="mb-2 text-base leading-snug font-semibold text-foreground">
                                    {level.code} — {level.name}
                                </h3>

                                <p className="mb-4 line-clamp-2 flex-1 text-sm leading-relaxed text-foreground/60">
                                    {level.tagline}
                                </p>

                                <div className="mb-4 space-y-2">
                                    <div className="flex items-center gap-1.5 text-xs text-foreground/50">
                                        <CalendarDays
                                            className="h-3.5 w-3.5"
                                            aria-hidden="true"
                                        />
                                        Cohorte du {level.nextCohort} ·{' '}
                                        {level.hours} h
                                    </div>

                                    <div className="flex items-center gap-2 text-xs">
                                        <span
                                            className={`h-1.5 w-1.5 shrink-0 rounded-full ${seatsDotClass(level.seats.left, level.seats.total)}`}
                                        />
                                        <span
                                            className={`font-medium ${seatsColorClass(level.seats.left, level.seats.total)}`}
                                        >
                                            {level.seats.left} place
                                            {level.seats.left > 1
                                                ? 's'
                                                : ''}{' '}
                                            restante
                                            {level.seats.left > 1 ? 's' : ''}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-[10px] tracking-wider text-foreground/40 uppercase">
                                            Dès (groupe 3–6)
                                        </p>
                                        <p className="text-sm font-semibold text-foreground">
                                            {formatPrice(level.price.group)}
                                        </p>
                                    </div>

                                    <Button
                                        variant="secondary"
                                        size="sm"
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
                                </div>
                            </OfferCard>
                        ))}
                    </div>

                    <Link
                        href="/manuels"
                        className="group mt-8 flex flex-col gap-4 rounded-2xl border border-border/40 bg-background/60 p-5 backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-border/70 hover:shadow-md sm:flex-row sm:items-center sm:justify-between dark:border-border/50 dark:bg-background/40"
                    >
                        <div className="flex items-center gap-4">
                            <div className="flex shrink-0 -space-x-4">
                                {[
                                    '/images/books/menschen-a1.jpg',
                                    '/images/books/menschen-a2.jpg',
                                    '/images/books/menschen-b1.jpg',
                                    '/images/books/sicher-b2.jpg',
                                ].map((cover) => (
                                    <img
                                        key={cover}
                                        src={cover}
                                        alt=""
                                        loading="lazy"
                                        decoding="async"
                                        className="h-14 w-10 rounded-sm border border-white/60 object-cover shadow-sm first:rotate-[-4deg] last:rotate-[4deg] dark:border-border/60"
                                    />
                                ))}
                            </div>

                            <div>
                                <p className="font-mono text-[10px] tracking-[0.18em] text-foreground/40 uppercase">
                                    Les manuels
                                </p>
                                <p className="mt-1 text-sm font-semibold text-foreground">
                                    Menschen A1–B1, puis Sicher! B2 : le
                                    parcours tient sur quatre volumes.
                                </p>
                                <p className="mt-1 text-xs text-foreground/50">
                                    Couvertures, comparatif des quatre
                                    collections et passerelle B1+.
                                </p>
                            </div>
                        </div>

                        <span className="inline-flex shrink-0 items-center gap-2 text-sm font-semibold text-primary">
                            Voir les manuels
                            <ArrowRight
                                className="h-4 w-4 transition-transform group-hover:translate-x-1"
                                aria-hidden="true"
                            />
                        </span>
                    </Link>
                </div>
            </section>

            <section className="relative overflow-hidden bg-muted/30 py-20 md:py-28 dark:bg-foreground/[0.02]">
                <div className="pointer-events-none absolute inset-0 overflow-hidden">
                    <div className="absolute top-0 right-1/4 h-[360px] w-[360px] rounded-full bg-primary/[0.03] blur-[140px] dark:bg-primary/[0.05]" />
                </div>

                <div className="relative mx-auto max-w-7xl px-6 md:px-8 lg:px-12">
                    <SectionHeading
                        eyebrow="Le rythme"
                        title="Quatre rythmes, un même programme."
                        description="Le rythme est une modalité de livraison, pas un produit séparé. Le contenu et le prix du parcours ne changent pas."
                        align="center"
                        className="mb-12"
                    />

                    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                        {formats.map((format, index) => (
                            <motion.div
                                key={format.id}
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
                                    <format.icon
                                        className="h-5 w-5"
                                        aria-hidden="true"
                                    />
                                </span>

                                <h3 className="mt-4 font-semibold text-foreground">
                                    {format.name}
                                </h3>

                                <p className="mt-1 font-mono text-xs text-foreground/50">
                                    {format.schedule}
                                </p>

                                <p className="mt-3 text-sm leading-relaxed text-foreground/60">
                                    {format.description}
                                </p>

                                <div className="mt-4 space-y-1 border-t border-border/30 pt-4 text-xs text-foreground/50">
                                    <p>
                                        Sous-niveau :{' '}
                                        <span className="font-medium text-foreground/80">
                                            {format.subLevel}
                                        </span>
                                    </p>
                                    <p>
                                        Niveau complet :{' '}
                                        <span className="font-medium text-foreground/80">
                                            {format.level}
                                        </span>
                                    </p>
                                    <p className="text-foreground/40">
                                        Idéal : {format.ideal}
                                    </p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="relative py-20 md:py-28">
                <div className="relative mx-auto max-w-7xl px-6 md:px-8 lg:px-12">
                    <SectionHeading
                        eyebrow="Inclus"
                        title="Tout ce qu’il faut pour avancer."
                        description="Quel que soit le format choisi, le socle est identique. Pas de supplément caché pour les supports ou le suivi."
                        align="center"
                        className="mb-12"
                    />

                    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                        {included.map((item, index) => (
                            <motion.div
                                key={item.title}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{
                                    duration: 0.5,
                                    delay: index * 0.05,
                                }}
                                className="flex gap-4 rounded-2xl border border-border/40 bg-card p-5 transition-colors hover:border-primary/30 dark:border-border/50"
                            >
                                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                    <item.icon
                                        className="h-5 w-5"
                                        aria-hidden="true"
                                    />
                                </span>

                                <div>
                                    <h3 className="text-sm font-semibold text-foreground">
                                        {item.title}
                                    </h3>
                                    <p className="mt-1 text-sm leading-relaxed text-foreground/60">
                                        {item.detail}
                                    </p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            <FaqSection
                items={parcoursFaqs}
                title="Le parcours, en pratique"
                description="Rythme, formats, cohortes et checkpoints : ce qu’il faut savoir avant de choisir."
            />

            <CtaBand
                eyebrow="Tu ne sais pas où commencer ?"
                title="Le test gratuit te situe en dix minutes."
                description="Soixante questions, un résultat immédiat de A1 à B2 et le parcours recommandé. Ensuite, tu peux réserver une heure d’essai pour confirmer ton niveau à l’oral."
                primary={{
                    label: 'Passer le test gratuit',
                    href: '/level-test',
                }}
                secondary={{
                    label: 'Réserver un cours d’essai',
                    href: '/trial',
                }}
            />
        </>
    );
}
