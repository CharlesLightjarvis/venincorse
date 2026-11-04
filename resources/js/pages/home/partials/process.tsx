import { motion } from 'framer-motion';
import { BookOpen, CalendarCheck, TrendingUp, Video } from 'lucide-react';

const steps = [
    {
        number: '01',
        icon: BookOpen,
        title: 'Teste ton niveau',
        description:
            'Soixante questions, dix minutes, résultat immédiat de A1 à B2. Gratuit, sans inscription — tu sais par où commencer.',
    },
    {
        number: '02',
        icon: CalendarCheck,
        title: 'Essaie une heure',
        description:
            'Une séance de 60 minutes en 1:1 pour tester la méthode, confirmer ton niveau et repartir avec un plan clair. 39 €, crédités si tu t’inscris sous 7 jours.',
    },
    {
        number: '03',
        icon: Video,
        title: 'Choisis ton parcours',
        description:
            'A1 à B2 : tu choisis le format — 1:1 ou groupe de 3 à 6 — et le rythme qui correspond à ton objectif.',
    },
    {
        number: '04',
        icon: TrendingUp,
        title: 'Mesure ta progression',
        description:
            'Un checkpoint tous les 30 heures, des corrections précises entre les séances et un objectif mesurable à chaque niveau.',
    },
] as const;

export function Process() {
    return (
        <section className="relative bg-muted/30 py-24 md:py-12 dark:bg-foreground/[0.02]">
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <div className="absolute bottom-0 left-1/3 h-[360px] w-[360px] rounded-full bg-primary/[0.03] blur-[120px] dark:bg-primary/[0.05]" />
            </div>

            <div className="relative mx-auto max-w-7xl px-6 md:px-8 lg:px-12">
                {/* en-tête */}
                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.7 }}
                    className="mb-20 text-center"
                >
                    <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-border/40 bg-secondary px-4 py-2 text-xs font-semibold tracking-[0.25em] text-secondary-foreground uppercase backdrop-blur dark:border-border/60 dark:bg-secondary">
                        Comment ça marche
                    </div>

                    <h2 className="mb-4 text-3xl font-semibold tracking-tight text-foreground md:text-5xl">
                        Commencer, c'est simple
                    </h2>

                    <p className="mx-auto max-w-2xl text-lg text-foreground/60">
                        Pas de dossier compliqué ni de calendrier imposé : tu
                        testes ton niveau, tu essaies une heure et tu choisis
                        ton parcours. Tes progrès se mesurent au même endroit.
                    </p>
                </motion.div>

                {/* timeline */}
                <div className="relative">
                    {/* ligne horizontale — visible seulement lg */}
                    <div className="absolute top-[2.6rem] right-0 left-0 hidden h-px bg-border/50 lg:block" />

                    <div className="grid gap-10 lg:grid-cols-4 lg:gap-6">
                        {steps.map((step, index) => {
                            const Icon = step.icon;

                            return (
                                <motion.div
                                    key={step.number}
                                    initial={{ opacity: 0, y: 28 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true, margin: '-60px' }}
                                    transition={{
                                        duration: 0.6,
                                        ease: 'easeOut',
                                        delay: index * 0.12,
                                    }}
                                    className="relative flex flex-col items-center text-center lg:items-start lg:text-left"
                                >
                                    {/* nœud timeline */}
                                    <div className="relative z-10 mb-6 flex h-[5.2rem] w-[5.2rem] items-center justify-center rounded-2xl border border-border/40 bg-background backdrop-blur-sm dark:border-border/50 dark:bg-background/80">
                                        <Icon
                                            className="h-7 w-7 text-primary"
                                            aria-hidden="true"
                                        />

                                        <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                                            {index + 1}
                                        </span>
                                    </div>

                                    <h3 className="mb-2 text-lg font-semibold text-foreground">
                                        {step.title}
                                    </h3>

                                    <p className="text-sm leading-relaxed text-foreground/60">
                                        {step.description}
                                    </p>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </section>
    );
}
