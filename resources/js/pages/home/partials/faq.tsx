import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { Plus } from 'reicon-react';

const faqs = [
    {
        question: 'Comment se déroule un parcours ?',
        answer: 'Chaque parcours couvre un niveau complet en 60 heures, divisé en deux sous-niveaux de 30 heures. Tu suis deux à trois séances par semaine en visio, et chaque sous-niveau se termine par un checkpoint oral et écrit.',
    },
    {
        question: 'Comment réserver ?',
        answer: "Réserve d'abord une heure d'essai si tu veux tester la méthode, ou passe le test de niveau gratuit pour situer ton point de départ. Ensuite, choisis ton parcours, ta prépa ou un atelier : tu confirmes ton créneau et tu reçois le lien visio.",
    },
    {
        question: 'Faut-il déjà avoir des bases pour commencer ?',
        answer: "Non. Le test gratuit te donne ton point de départ et le cours d'essai part de ton niveau réel. Aucune connaissance préalable n'est requise.",
    },
    {
        question: 'Quelle est la différence entre le 1:1 et le groupe ?',
        answer: 'Le 1:1 est entièrement taillé sur mesure et coûte plus cher : toute la séance t’est consacrée. Le groupe réunit 3 à 6 élèves : tu partages le coût et tu gardes les corrections individuelles.',
    },
    {
        question: 'Peut-on annuler ou déplacer une séance ?',
        answer: "Oui. Tu peux reporter une séance sans frais jusqu'à 24 h avant son début. Les séances manquées en groupe sont enregistrées et disponibles pendant 30 jours.",
    },
    {
        question: 'Quels examens préparez-vous ?',
        answer: 'Goethe-Institut, ÖSD ou TELC, de A1 à B2. Tu peux préparer toutes les épreuves ou cibler l’écrit ou l’oral, avec un tarif adapté. Les simulations et corrections suivent le certificat visé. L’inscription à l’examen officiel reste à ta charge.',
    },
    {
        question: 'Peut-on payer en plusieurs fois ?',
        answer: 'Oui. Le paiement en trois fois sans frais est possible, par carte sur la page sécurisée de Stripe. Les tarifs sont en euros, pensés pour la diaspora francophone en Europe et au Canada.',
    },
    {
        question: 'Comment suis-je mes progrès ?',
        answer: 'Après chaque séance, tu reçois un compte-rendu avec tes points forts et tes exercices. Tous les 30 heures, un checkpoint valide ta progression et prépare le sous-niveau suivant.',
    },
] as const;

export function Faq() {
    const [openIndex, setOpenIndex] = useState<number | null>(null);

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
                        Retrouve les réponses essentielles sur les parcours, la
                        prépa ÖSD & TELC, le cours d'essai, le test gratuit, le
                        paiement et le suivi de progression.
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
                    {faqs.map((item, index) => (
                        <div
                            key={index}
                            className="overflow-hidden rounded-2xl border border-border/40 bg-background/60 backdrop-blur-sm dark:border-border/50 dark:bg-background/50"
                        >
                            <button
                                type="button"
                                onClick={() =>
                                    setOpenIndex(
                                        openIndex === index ? null : index,
                                    )
                                }
                                className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
                                aria-expanded={openIndex === index}
                            >
                                <span className="text-sm font-semibold text-foreground md:text-base">
                                    {item.question}
                                </span>

                                <span
                                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-border/40 bg-background/60 text-foreground/60 transition-transform duration-300 dark:border-border/50 dark:bg-background/40 ${
                                        openIndex === index ? 'rotate-45' : ''
                                    }`}
                                    aria-hidden="true"
                                >
                                    <Plus className="h-4 w-4" />
                                </span>
                            </button>

                            <AnimatePresence initial={false}>
                                {openIndex === index && (
                                    <motion.div
                                        key="content"
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{
                                            duration: 0.3,
                                            ease: 'easeInOut',
                                        }}
                                    >
                                        <div className="border-t border-border/30 px-6 pt-4 pb-5 text-sm leading-relaxed text-foreground/60">
                                            {item.answer}
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
