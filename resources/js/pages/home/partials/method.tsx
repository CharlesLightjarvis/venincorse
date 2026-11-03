import { Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { ArrowRight, ClipboardCheck, Route, TrendingUp } from 'lucide-react';
import { SectionHeading } from '@/components/marketing/section-heading';

const steps = [
    {
        number: '01',
        icon: ClipboardCheck,
        title: 'On mesure le point de départ',
        description:
            'Un échange de 45 minutes pour situer ton niveau réel, ton objectif et le temps dont tu disposes. Pas de test interminable : des mises en situation concrètes.',
    },
    {
        number: '02',
        icon: Route,
        title: 'On choisit le parcours et le rythme',
        description:
            'Un niveau, deux sous-niveaux, un format. Extensif, accéléré, intensif ou super intensif : c’est ton agenda qui décide, pas l’inverse.',
    },
    {
        number: '03',
        icon: TrendingUp,
        title: 'On valide à chaque checkpoint',
        description:
            'Toutes les 30 heures, un point oral et écrit. Tu sais exactement où tu en es, ce qui bloque et ce qu’on attaque ensuite.',
    },
] as const;

export function Method() {
    return (
        <section className="relative overflow-hidden bg-muted/30 py-20 md:py-28 dark:bg-foreground/[0.02]">
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <div className="absolute top-0 right-1/4 h-[380px] w-[380px] rounded-full bg-primary/[0.03] blur-[140px] dark:bg-primary/[0.05]" />
            </div>

            <div className="relative mx-auto max-w-7xl px-6 md:px-8 lg:px-12">
                <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
                    <div className="lg:sticky lg:top-24 lg:self-start">
                        <SectionHeading
                            eyebrow="La méthode"
                            title="Un cap, trois étapes, zéro flou."
                            description="Pas de cours à rallonge ni de programme anonyme. On mesure, on construit, on valide — et on ajuste à chaque étape."
                        />

                        <Link
                            href="/about"
                            className="group mt-7 inline-flex items-center gap-2 text-sm font-semibold text-foreground/60 transition-colors hover:text-foreground"
                        >
                            Voir la méthode complète
                            <ArrowRight
                                className="h-4 w-4 text-primary transition-transform group-hover:translate-x-1"
                                aria-hidden="true"
                            />
                        </Link>
                    </div>

                    <div className="relative flex flex-col gap-4">
                        <div
                            className="absolute top-6 bottom-6 left-[27px] w-px bg-border/50"
                            aria-hidden="true"
                        />

                        {steps.map((step, index) => (
                            <motion.div
                                key={step.number}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{
                                    duration: 0.55,
                                    delay: index * 0.08,
                                }}
                                className="relative flex gap-5 rounded-2xl border border-border/40 bg-background/70 p-5 backdrop-blur-sm dark:border-border/50 dark:bg-background/40"
                            >
                                <span className="relative z-10 flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-border/40 bg-card text-primary dark:border-border/50">
                                    <step.icon
                                        className="h-5 w-5"
                                        aria-hidden="true"
                                    />
                                </span>

                                <div>
                                    <p className="font-mono text-[10px] font-semibold tracking-[0.2em] text-foreground/35">
                                        ÉTAPE {step.number}
                                    </p>
                                    <h3 className="mt-1 font-semibold text-foreground">
                                        {step.title}
                                    </h3>
                                    <p className="mt-1.5 text-sm leading-relaxed text-foreground/60">
                                        {step.description}
                                    </p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
