import { motion } from "framer-motion";
import { ArrowRight, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "@inertiajs/react";

export function Cta() {
    return (
        <section className="relative py-24 md:py-32">
            {/* blobs décoratifs */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <div className="absolute top-0 left-1/4 h-[440px] w-[440px] rounded-full bg-primary/[0.04] blur-[150px] dark:bg-primary/[0.07]" />
                <div className="absolute right-1/4 bottom-0 h-[360px] w-[360px] rounded-full bg-foreground/[0.025] blur-[130px] dark:bg-foreground/[0.05]" />
            </div>

            <div className="relative mx-auto max-w-7xl px-6 md:px-8 lg:px-12">
                <motion.div
                    initial={{ opacity: 0, y: 28 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.75 }}
                    className="mx-auto max-w-3xl rounded-3xl border border-border/40 bg-background/60 px-8 py-16 text-center backdrop-blur-sm md:px-16 dark:border-border/50 dark:bg-background/50"
                >
                    <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border/40 bg-secondary px-4 py-2 text-xs font-semibold tracking-[0.25em] text-secondary-foreground uppercase backdrop-blur dark:border-border/60 dark:bg-secondary">
                        Prêt à apprendre ?
                    </div>

                    <h2 className="mb-5 text-3xl font-semibold tracking-tight text-foreground md:text-5xl">
                        Fais ton premier pas en allemand
                    </h2>

                    <p className="mx-auto mb-10 max-w-xl text-lg text-foreground/60">
                        Choisis ton parcours, réserve ta place et rejoins ta
                        cohorte en visio. Ton plan est écrit, ton budget clair —
                        tu avances à ton rythme, une séance après l'autre.
                    </p>

                    <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                        <Button
                            size="lg"
                            className="group gap-2 rounded-full px-8 text-base tracking-[0.2em] uppercase"
                            asChild
                        >
                            <Link href="/bilan">
                                Commencer par le bilan
                                <ArrowRight
                                    className="h-4 w-4 transition-transform group-hover:translate-x-1"
                                    aria-hidden="true"
                                />
                            </Link>
                        </Button>

                        <Button
                            size="lg"
                            variant="secondary"
                            className="gap-2 rounded-full"
                            asChild
                        >
                            <Link href="/contact">
                                <MessageCircle
                                    className="h-4 w-4"
                                    aria-hidden="true"
                                />
                                Poser une question
                            </Link>
                        </Button>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
