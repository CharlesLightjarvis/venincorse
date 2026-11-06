import { Head, Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import {
    ArrowRight,
    Check,
    FileCheck,
    Flag,
    Target,
    Timer,
    Users,
} from 'reicon-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { CtaBand } from '@/components/marketing/cta-band';
import { FaqSection } from '@/components/marketing/faq-section';
import { OfferCard } from '@/components/marketing/offer-card';
import { PageHero } from '@/components/marketing/page-hero';
import { SectionHeading } from '@/components/marketing/section-heading';
import { TierSwitcher } from '@/components/marketing/tier-switcher';
import { selectClassName } from '@/components/trial-slot-picker';
import {
    examProviders,
    examProviderLabels,
    examScopes,
    examScopeLabels,
    examScopeDescriptions,
    getExamPackage,
    type ExamProvider,
    type ExamScope,
    type ExamLevel,
} from '@/data/exam-booking';
import { formatCourseMoney } from '@/data/course-booking';
import { exam as bookExam } from '@/routes/booking';
import { examPreps, faqs, tierShortLabels, type TierKey } from '@/data/offer';

const timeline = [
    {
        number: '01',
        icon: Target,
        title: 'Diagnostic & stratégie',
        description:
            'On identifie l’examen exact, la date et les épreuves qui rapportent le plus de points. Le plan est écrit dès la première séance.',
    },
    {
        number: '02',
        icon: Timer,
        title: 'Entraînement par épreuve',
        description:
            'Une épreuve à la fois, chronométrée. On travaille les réflexes de lecture, les gabarits d’écrit et les phrases d’oral.',
    },
    {
        number: '03',
        icon: FileCheck,
        title: 'Simulations d’épreuves',
        description:
            'Une ou deux séances blanches selon la formule, avec correction détaillée et exercices adaptés aux épreuves choisies.',
    },
    {
        number: '04',
        icon: Flag,
        title: 'Révision ciblée',
        description:
            'On arrête d’apprendre du neuf. On consolide les points faibles, on répète les routines et on règle la logistique du jour J.',
    },
] as const;

const examFaqs = [faqs[4], faqs[5], faqs[6], faqs[7]];

export default function Exams() {
    const [tier, setTier] = useState<TierKey>('group');
    const [provider, setProvider] = useState<ExamProvider>('osd');
    const [scope, setScope] = useState<ExamScope>('full');

    return (
        <>
            <Head title="Prépa Goethe, ÖSD & TELC" />

            <PageHero
                eyebrow="Prépa examens"
                title={
                    <>
                        Le jour J,{' '}
                        <span className="text-primary">
                            tu connais déjà le format.
                        </span>
                    </>
                }
                description="Goethe-Institut, ÖSD ou TELC : choisis ton niveau, une préparation complète ou ciblée sur l’écrit ou l’oral. La préparation s’adapte au certificat visé et à ta date d’examen."
            >
                <Button size="lg" className="group gap-2 rounded-full" asChild>
                    <Link href={bookExam()}>
                        Réserver ma préparation
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
                    <div className="mb-10 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                        <SectionHeading
                            eyebrow="Les prépas"
                            title="De A1 à B2, à l’écrit comme à l’oral."
                            description="Tarifs par personne. L’inscription à l’examen reste à ta charge, on s’occupe de la préparation."
                        />

                        <div className="shrink-0">
                            <p className="mb-2 text-[10px] font-semibold tracking-[0.2em] text-foreground/40 uppercase">
                                Afficher les prix
                            </p>
                            <TierSwitcher value={tier} onChange={setTier} />
                        </div>
                    </div>

                    <div className="mb-6 grid gap-4 rounded-2xl border border-border/40 bg-muted/20 p-5 sm:grid-cols-2">
                        <label className="flex flex-col gap-2 text-sm font-medium">
                            Examen visé
                            <select
                                id="exam-provider-filter"
                                value={provider}
                                onChange={(event) =>
                                    setProvider(
                                        event.target.value as ExamProvider,
                                    )
                                }
                                className={selectClassName}
                            >
                                {examProviders.map((item) => (
                                    <option key={item} value={item}>
                                        {examProviderLabels[item]}
                                    </option>
                                ))}
                            </select>
                        </label>
                        <label className="flex flex-col gap-2 text-sm font-medium">
                            Épreuves à travailler
                            <select
                                id="exam-scope-filter"
                                value={scope}
                                onChange={(event) =>
                                    setScope(event.target.value as ExamScope)
                                }
                                className={selectClassName}
                            >
                                {examScopes.map((item) => (
                                    <option key={item} value={item}>
                                        {examScopeLabels[item]}
                                    </option>
                                ))}
                            </select>
                        </label>
                        <p className="text-xs leading-relaxed text-muted-foreground sm:col-span-2">
                            Tarifs de préparation fictifs, à valider avant
                            commercialisation. Les frais d’inscription au
                            certificat ne sont pas inclus. Choisir une
                            préparation ciblée ne signifie pas que le centre
                            autorise le passage séparé de ces épreuves.
                        </p>
                    </div>

                    <div className="grid gap-5 md:grid-cols-2">
                        {examPreps.map((prep, index) => (
                            <OfferCard
                                key={prep.id}
                                index={index}
                                image={prep.image}
                                alt={`Prépa examen ${prep.level}`}
                                badge={{ label: prep.level }}
                                chip={{
                                    value: String(
                                        getExamPackage(
                                            provider,
                                            prep.id as ExamLevel,
                                            scope,
                                            tier,
                                        ).sessionCount,
                                    ),
                                    label: 'séances',
                                }}
                                flag={
                                    prep.popular ? 'Le plus choisi' : undefined
                                }
                            >
                                <h3 className="mb-1 text-base leading-snug font-semibold text-foreground">
                                    {prep.title}
                                </h3>

                                <p className="mb-3 text-xs font-medium text-primary">
                                    {examProviderLabels[provider]} ·{' '}
                                    {examScopeLabels[scope]}
                                </p>

                                <p className="mb-4 text-sm leading-relaxed text-foreground/60">
                                    {examScopeDescriptions[scope]}
                                </p>

                                <ul className="mb-4 flex-1 space-y-1.5">
                                    {[
                                        `${getExamPackage(provider, prep.id as ExamLevel, scope, tier).trainingSessions} séances d’entraînement de 90 min`,
                                        `${getExamPackage(provider, prep.id as ExamLevel, scope, tier).mockSessions} séance(s) blanche(s) ciblée(s) de 90 min`,
                                        'Corrections et stratégie pour le certificat visé',
                                    ].map((item) => (
                                        <li
                                            key={item}
                                            className="flex items-start gap-2.5 text-sm text-foreground/60"
                                        >
                                            <Check
                                                className="mt-0.5 h-4 w-4 shrink-0 text-primary"
                                                aria-hidden="true"
                                            />
                                            {item}
                                        </li>
                                    ))}
                                </ul>

                                <div className="flex items-center justify-between border-t border-border/30 pt-4">
                                    <div>
                                        <p className="text-[10px] tracking-wider text-foreground/40 uppercase">
                                            Par personne ·{' '}
                                            {tierShortLabels[
                                                tier
                                            ].toLowerCase()}
                                        </p>
                                        <p className="font-mono text-sm font-semibold text-foreground">
                                            {formatCourseMoney(
                                                getExamPackage(
                                                    provider,
                                                    prep.id as ExamLevel,
                                                    scope,
                                                    tier,
                                                ).priceCents,
                                            )}
                                        </p>
                                    </div>

                                    <Button
                                        variant="secondary"
                                        size="sm"
                                        asChild
                                    >
                                        <Link
                                            href={bookExam({
                                                query: {
                                                    provider,
                                                    level: prep.id,
                                                    scope,
                                                    tier,
                                                },
                                            })}
                                        >
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

                    <p className="mt-5 flex items-center gap-2 text-xs text-foreground/50">
                        <Users
                            className="h-3.5 w-3.5 text-primary"
                            aria-hidden="true"
                        />
                        Les prépas se tiennent en mini-groupe de 3 à 6 ou en
                        1:1. Les prix affichés sont par personne.
                    </p>
                </div>
            </section>

            <section className="relative overflow-hidden bg-muted/30 py-20 md:py-28 dark:bg-foreground/[0.02]">
                <div className="pointer-events-none absolute inset-0 overflow-hidden">
                    <div className="absolute top-0 right-1/4 h-[360px] w-[360px] rounded-full bg-primary/[0.03] blur-[140px] dark:bg-primary/[0.05]" />
                </div>

                <div className="relative mx-auto max-w-7xl px-6 md:px-8 lg:px-12">
                    <SectionHeading
                        eyebrow="Le compte à rebours"
                        title="Un plan clair jusqu’au jour J."
                        description="Un cadre qui tient compte de ta date d’examen et de ton temps disponible. Le rythme s’adapte, pas l’exigence."
                        align="center"
                        className="mb-12"
                    />

                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        {timeline.map((step, index) => (
                            <motion.div
                                key={step.number}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{
                                    duration: 0.5,
                                    delay: index * 0.06,
                                }}
                                className="relative rounded-2xl border border-border/40 bg-background/70 p-5 backdrop-blur-sm dark:border-border/50 dark:bg-background/40"
                            >
                                <div className="flex items-center justify-between">
                                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                        <step.icon
                                            className="h-5 w-5"
                                            aria-hidden="true"
                                        />
                                    </span>
                                    <span className="font-mono text-xs font-semibold text-foreground/40">
                                        {step.number}
                                    </span>
                                </div>

                                <h3 className="mt-4 text-sm font-semibold text-foreground">
                                    {step.title}
                                </h3>

                                <p className="mt-1.5 text-sm leading-relaxed text-foreground/60">
                                    {step.description}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            <FaqSection
                items={examFaqs}
                title="La prépa, sans zone d’ombre"
                description="Examens, rythme, groupes et paiement : les réponses avant de bloquer une date."
            />

            <CtaBand
                eyebrow="Ta date d’examen approche ?"
                title="On construit le rétroplanning ensemble."
                description="Dis-nous l’examen visé et la date. On vérifie s’il reste assez de temps — et on te le dit honnêtement si ce n’est pas le cas."
                primary={{
                    label: 'Réserver ma préparation',
                    href: bookExam.url({ query: { provider, scope, tier } }),
                }}
                secondary={{ label: 'Tester mon niveau', href: '/level-test' }}
            />
        </>
    );
}
