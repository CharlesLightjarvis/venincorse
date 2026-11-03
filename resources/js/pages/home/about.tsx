import { motion } from "framer-motion";
import {
    ArrowRight,
    MessageSquareQuote,
    Mic,
    SlidersHorizontal,
    Star,
    Target,
} from "lucide-react";
import { Head, Link } from "@inertiajs/react";
import { Button } from "@/components/ui/button";

const methodPillars = [
    {
        icon: SlidersHorizontal,
        title: "Sur mesure",
        detail: "Un plan construit sur ton niveau, tes objectifs et ton agenda — pas un programme générique.",
    },
    {
        icon: Mic,
        title: "L'oral d'abord",
        detail: "Tu parles dès la première séance : la grammaire travaille pour la conversation, pas l'inverse.",
    },
    {
        icon: MessageSquareQuote,
        title: "Feedback continu",
        detail: "Compte-rendu après chaque séance, corrections précises et exercices ciblés entre les cours.",
    },
    {
        icon: Target,
        title: "Objectifs & examens",
        detail: "A1.1 → B2.2 du CECRL, préparation Goethe, TELC, ÖSD et DSD avec mock tests corrigés.",
    },
] as const;

const highlightStats = [
    { value: "7 ans", label: "d'enseignement de l'allemand" },
    { value: "1 500+", label: "heures de cours en visio" },
    { value: "200+", label: "élèves accompagnés" },
    { value: "5,0", label: "note moyenne des élèves" },
] as const;

export default function About() {
    return (
        <div className="relative py-20 md:py-28">
            <Head title="À propos" />

            {/* blobs décoratifs */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <div className="absolute top-0 right-1/4 h-[420px] w-[420px] rounded-full bg-primary/[0.04] blur-[150px] dark:bg-primary/[0.07]" />
                <div className="absolute bottom-0 left-1/4 h-[360px] w-[360px] rounded-full bg-foreground/[0.025] blur-[130px] dark:bg-foreground/[0.05]" />
            </div>

            <div className="relative mx-auto max-w-7xl px-6 md:px-8 lg:px-12">
                {/* en-tête */}
                <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
                    <motion.div
                        initial={{ opacity: 0, y: 24 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7 }}
                    >
                        <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-border/40 bg-secondary px-4 py-2 text-xs font-semibold tracking-[0.25em] text-secondary-foreground uppercase backdrop-blur dark:border-border/60 dark:bg-secondary">
                            Ton professeur
                        </div>

                        <h1 className="mb-6 text-3xl font-semibold tracking-tight text-foreground md:text-5xl">
                            Une prof, une méthode, ta progression
                        </h1>

                        <p className="mb-4 max-w-xl text-lg text-foreground/60">
                            Depuis sept ans, j'accompagne des élèves de tous
                            horizons : débutants complets, cadres en entreprise,
                            adolescents du lycée francophone et candidats aux
                            examens Goethe.
                        </p>

                        <p className="mb-8 max-w-xl text-lg text-foreground/60">
                            Ma conviction : on n'apprend pas une langue en
                            collectionnant les règles — on l'apprend en la
                            parlant, tôt et souvent, avec quelqu'un qui corrige
                            exactement ce qui bloque.
                        </p>

                        <div className="grid grid-cols-2 gap-x-8 gap-y-5 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
                            {highlightStats.map((item) => (
                                <div key={item.label}>
                                    <div className="text-2xl font-semibold text-foreground">
                                        {item.value}
                                    </div>

                                    <div className="mt-1 text-sm text-foreground/50">
                                        {item.label}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    {/* visuel */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.96 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8, delay: 0.15 }}
                        className="relative mx-auto w-full max-w-md lg:max-w-none"
                    >
                        <div className="overflow-hidden rounded-3xl border border-border/40 bg-background/80  ">
                            <img
                                src="/images/hero-ref.png"
                                alt="Ton professeur d'allemand"
                                className="w-full object-cover"
                                loading="lazy"
                                decoding="async"
                            />
                        </div>
                    </motion.div>
                </div>

                {/* méthode */}
                <motion.section
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.7 }}
                    className="mt-32"
                >
                    <div className="mb-12 text-center">
                        <h2 className="mb-3 text-2xl font-semibold tracking-tight text-foreground md:text-4xl">
                            La méthode en quatre piliers
                        </h2>

                        <p className="mx-auto max-w-xl text-foreground/60">
                            Le même fil rouge dans chaque cours, de A1.1 à B2.2
                            — quel que soit le format que tu choisis.
                        </p>
                    </div>

                    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                        {methodPillars.map((pillar) => (
                            <div
                                key={pillar.title}
                                className="rounded-2xl border border-border/40 bg-card p-6 transition-colors hover:border-primary/30 dark:border-border/50"
                            >
                                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                    <pillar.icon
                                        className="h-5 w-5"
                                        aria-hidden="true"
                                    />
                                </span>

                                <h3 className="mt-5 font-semibold text-foreground">
                                    {pillar.title}
                                </h3>

                                <p className="mt-2 text-sm leading-relaxed text-foreground/60">
                                    {pillar.detail}
                                </p>
                            </div>
                        ))}
                    </div>
                </motion.section>

                {/* CTA */}
                <motion.section
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.7 }}
                    className="mt-24 flex flex-col items-center gap-6 rounded-3xl border border-border/40 bg-muted/30 p-8 text-center md:p-12 dark:border-border/50 dark:bg-foreground/[0.02]"
                >
                    <h2 className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
                        Discutons de ton objectif d'allemand
                    </h2>

                    <p className="max-w-xl text-foreground/60">
                        Un examen à passer, une mutation professionnelle, le
                        lycée pour ta fille ? Dis-moi où tu veux aller, je
                        construis le chemin.
                    </p>

                    <div className="flex flex-col justify-center gap-3 sm:flex-row">
                        <Button
                            size="lg"
                            className="group gap-2 rounded-full"
                            asChild
                        >
                            <Link href="/contact">
                                Poser une question
                                <ArrowRight
                                    className="h-4 w-4 transition-transform group-hover:translate-x-1"
                                    aria-hidden="true"
                                />
                            </Link>
                        </Button>

                        <Button
                            size="lg"
                            variant="outline"
                            className="rounded-full"
                            asChild
                        >
                            <Link href="/courses">Voir les cours</Link>
                        </Button>
                    </div>
                </motion.section>
            </div>
        </div>
    );
}
