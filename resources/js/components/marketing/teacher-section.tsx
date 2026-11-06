import { Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'reicon-react';
import { Button } from '@/components/ui/button';
import { teacher } from '@/data/offer';

export function TeacherSection() {
    return (
        <section className="relative overflow-hidden py-20 md:py-28">
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <div className="absolute top-1/3 left-1/4 h-[380px] w-[380px] rounded-full bg-primary/[0.03] blur-[140px] dark:bg-primary/[0.05]" />
            </div>

            <div className="relative mx-auto max-w-7xl px-6 md:px-8 lg:px-12">
                <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.97 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.7 }}
                        className="relative mx-auto w-full max-w-md lg:mx-0"
                    >
                        <div className="overflow-hidden rounded-3xl border border-border/40 bg-background/80 dark:border-border/50">
                            <img
                                src="/images/hero-ref.png"
                                alt="Ton professeur d'allemand en visio"
                                className="w-full object-cover"
                                loading="lazy"
                                decoding="async"
                            />
                        </div>

                        <div className="absolute -right-3 -bottom-6 rounded-2xl border border-border/40 bg-card/95 p-4 shadow-sm backdrop-blur-md sm:right-6 dark:border-border/50">
                            <div className="flex items-center gap-4">
                                {teacher.stats.map((stat) => (
                                    <div key={stat.label}>
                                        <p className="font-mono text-lg font-semibold text-foreground">
                                            {stat.value}
                                        </p>
                                        <p className="text-[10px] text-foreground/50">
                                            {stat.label}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 24 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.7, delay: 0.1 }}
                    >
                        <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-border/40 bg-secondary px-4 py-2 text-xs font-semibold tracking-[0.25em] text-secondary-foreground uppercase backdrop-blur dark:border-border/60 dark:bg-secondary">
                            La prof
                        </div>

                        <h2 className="mb-5 text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
                            Une méthode, une voix, pas un programme anonyme.
                        </h2>

                        <p className="mb-4 text-foreground/60">{teacher.bio}</p>

                        <p className="mb-8 text-foreground/60">
                            Chaque parcours démarre par un diagnostic honnête et
                            se termine par un objectif mesurable : tenir une
                            conversation, réussir l’ÖSD B2, écrire un email
                            professionnel. Entre les deux, on ajuste — sans
                            jamais te laisser seul face à la grammaire.
                        </p>

                        <div className="flex flex-col gap-3 sm:flex-row">
                            <Button
                                className="group gap-2 rounded-full"
                                asChild
                            >
                                <Link href="/about">
                                    Découvrir la méthode
                                    <ArrowRight
                                        className="h-4 w-4 transition-transform group-hover:translate-x-1"
                                        aria-hidden="true"
                                    />
                                </Link>
                            </Button>

                            <Button
                                variant="outline"
                                className="rounded-full border-border/50 bg-background/60 backdrop-blur-sm"
                                asChild
                            >
                                <Link href="/courses">Voir les parcours</Link>
                            </Button>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
