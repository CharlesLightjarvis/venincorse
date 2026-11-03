import { motion } from 'framer-motion';
import { BookOpen, CalendarCheck, TrendingUp, Video } from 'lucide-react';

const steps = [
    {
        number: '01',
        icon: BookOpen,
        title: 'Choisis ton cours',
        description:
            'Grammaire, conversation, examens ou allemand professionnel : trouve le format adapté à ton objectif et à ton niveau.',
    },
    {
        number: '02',
        icon: CalendarCheck,
        title: 'Réserve ta séance',
        description:
            'Sélectionne un créneau qui t’arrange — en semaine, le soir ou le week-end — et confirme ta réservation en quelques minutes.',
    },
    {
        number: '03',
        icon: Video,
        title: 'Rejoins ta session en visio',
        description:
            'Cours privé 1:1 avec ton professeur : prises de parole, corrections et supports adaptés à ton rythme, en direct.',
    },
    {
        number: '04',
        icon: TrendingUp,
        title: 'Suis ta progression',
        description:
            'Compte-rendu après chaque séance, exercices corrigés et bilans réguliers pour mesurer tes progrès vers ton objectif.',
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
                        Réserver ton cours devient simple
                    </h2>

                    <p className="mx-auto max-w-2xl text-lg text-foreground/60">
                        Pas de dossier compliqué ni de calendrier imposé : tu
                        trouves ton cours, tu fixes ton créneau, tu apprends et
                        tu mesures tes progrès au même endroit.
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
