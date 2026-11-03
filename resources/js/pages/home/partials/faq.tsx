import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { Plus } from "lucide-react";

const questions = [
    {
        question: "Comment se déroule un cours privé ?",
        reponse:
            "Chaque séance se déroule en visio avec ton professeur : reprise de la séance précédente, points de grammaire ciblés, pratique orale guidée et corrections personnalisées. Un compte-rendu détaillé te parvient après chaque séance.",
    },
    {
        question: "Comment réserver un cours ?",
        reponse:
            "Choisis ton format (cours privé, mini-groupe ou stage intensif), sélectionne un créneau disponible et confirme ta réservation. Tu reçois une confirmation avec le lien de ta session en visio.",
    },
    {
        question: "Faut-il déjà avoir des bases pour commencer ?",
        reponse:
            "Non. Tu peux démarrer à zéro : la première séance sert à évaluer ton niveau et à construire un plan sur mesure — grammaire, vocabulaire, oral. Aucune connaissance préalable n'est requise.",
    },
    {
        question:
            "Quelle est la différence entre un cours privé et un mini-groupe ?",
        reponse:
            "Le cours privé est taillé sur mesure : contenu, rythme et horaires sont construits autour de toi. Le mini-groupe (4 à 6 élèves maximum) mise sur la dynamique du collectif, avec un tarif réduit à la séance.",
    },
    {
        question: "Peut-on annuler ou déplacer une séance ?",
        reponse:
            "Oui. Tu peux reporter ou déplacer une séance sans frais jusqu'à 24 h avant son début. En cas d'impondérable, un report est proposé dans la mesure du possible.",
    },
    {
        question: "Quels examens préparez-vous ?",
        reponse:
            "Nous préparons principalement le Goethe-Zertifikat, le TELC, l'ÖSD et le DSD. Le stage intensif comprend des mock tests complets corrigés et un entraînement ciblé aux épreuves orales de chaque examen.",
    },
    {
        question: "Les cours conviennent-ils aux enfants et adolescents ?",
        reponse:
            "Oui. Le soutien scolaire démarre dès 8 ans et suit les programmes de l'école avec des méthodes adaptées : jeux, exercices courts et encouragements. Les parents reçoivent un bilan régulier des progrès.",
    },
    {
        question: "Comment suis-je mes progrès ?",
        reponse:
            "Après chaque séance, tu reçois un compte-rendu avec tes points forts, ton exercice personnalisé et le prochain objectif. Chaque mois, un bilan complet permet d'ajuster le rythme et le contenu.",
    },
] as const;

export function Faq() {
    const [ouvert, setOuvert] = useState<number | null>(null);

    return (
        <section className="relative bg-muted/30 py-24 md:py-32 dark:bg-foreground/[0.02]">
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <div className="absolute bottom-0 left-1/2 h-[380px] w-[380px] -translate-x-1/2 rounded-full bg-foreground/[0.02] blur-[130px] dark:bg-foreground/[0.04]" />
            </div>

            <div className="relative mx-auto max-w-3xl px-6 md:px-8 lg:px-12">
                {/* en-tête */}
                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.7 }}
                    className="mb-14 text-center"
                >
                    <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-border/40 bg-secondary px-4 py-2 text-xs font-semibold tracking-[0.25em] text-secondary-foreground uppercase backdrop-blur dark:border-border/60 dark:bg-secondary">
                        Questions fréquentes
                    </div>

                    <h2 className="mb-4 text-3xl font-semibold tracking-tight text-foreground md:text-5xl">
                        Avant de réserver, tout doit être clair
                    </h2>

                    <p className="mx-auto max-w-xl text-lg text-foreground/60">
                        Retrouve les réponses essentielles sur les cours privés,
                        les sessions en visio, la réservation, les examens et le
                        suivi de progression.
                    </p>
                </motion.div>

                {/* accordéon */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.15 }}
                    className="flex flex-col gap-3"
                >
                    {questions.map((item, index) => (
                        <div
                            key={index}
                            className="overflow-hidden rounded-2xl border border-border/40 bg-background/60 backdrop-blur-sm dark:border-border/50 dark:bg-background/50"
                        >
                            <button
                                type="button"
                                onClick={() =>
                                    setOuvert(ouvert === index ? null : index)
                                }
                                className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
                                aria-expanded={ouvert === index}
                            >
                                <span className="text-sm font-semibold text-foreground md:text-base">
                                    {item.question}
                                </span>

                                <span
                                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-border/40 bg-background/60 text-foreground/60 transition-transform duration-300 dark:border-border/50 dark:bg-background/40 ${
                                        ouvert === index ? "rotate-45" : ""
                                    }`}
                                    aria-hidden="true"
                                >
                                    <Plus className="h-4 w-4" />
                                </span>
                            </button>

                            <AnimatePresence initial={false}>
                                {ouvert === index && (
                                    <motion.div
                                        key="content"
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{
                                            duration: 0.3,
                                            ease: "easeInOut",
                                        }}
                                    >
                                        <div className="border-t border-border/30 px-6 pt-4 pb-5 text-sm leading-relaxed text-foreground/60">
                                            {item.reponse}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
}
