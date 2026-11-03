import { motion } from "framer-motion";
import { Quote } from "lucide-react";

const avis = [
    {
        initiales: "AK",
        nom: "Amina K.",
        role: "Débutante complète",
        entreprise: "A1 → A2 en 4 mois",
        contenu:
            "Je partais de zéro et je pensais l'allemand impossible. En quatre mois de parcours, je tiens une conversation simple et je regarde des séries sans sous-titres.",
    },
    {
        initiales: "GM",
        nom: "Grâce M.",
        role: "Prépa TELC B2",
        entreprise: "TELC B2 obtenu",
        contenu:
            "Les examens blancs corrigés et l'entraînement à l'oral m'ont vraiment préparée : je suis arrivée le jour J en connaissant déjà le format par cœur.",
    },
    {
        initiales: "TB",
        nom: "Thomas B.",
        role: "B1 professionnel",
        entreprise: "1:1 du soir, en visio",
        contenu:
            "Mes cours après le travail, 100 % en visio. En quatre mois, je menais mes réunions avec l'équipe de Munich sans traducteur.",
    },
    {
        initiales: "SN",
        nom: "Sarah N.",
        role: "Bilan de niveau",
        entreprise: "Partie du bon niveau",
        contenu:
            "Le bilan m'a évité de payer pour un parcours inutile. J'ai commencé au bon endroit, avec le bon rythme, et je progresse depuis sans décrocher.",
    },
    {
        initiales: "DJ",
        nom: "David J.",
        role: "Cohorte A1",
        entreprise: "Groupe de 4, janvier",
        contenu:
            "J'ai rejoint la cohorte de janvier et dès la première semaine je livrais mes premières phrases. Le checkpoint à mi-parcours fait toute la différence.",
    },
    {
        initiales: "LF",
        nom: "Léa F.",
        role: "Conversation orale B1",
        entreprise: "Ateliers ciblés",
        contenu:
            "Les ateliers et les séances de conversation me débloquent : je parle enfin sans traduire mot à mot dans ma tête.",
    },
] as const;

const avisLoop = [...avis, ...avis];

export function Testimonials() {
    return (
        <section className="relative overflow-hidden py-24 md:py-32">
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <div className="absolute top-0 right-1/3 h-[400px] w-[400px] rounded-full bg-primary/[0.03] blur-[140px] dark:bg-primary/[0.05]" />
            </div>

            <div className="relative mx-auto max-w-7xl px-6 md:px-8 lg:px-12">
                <div className="mb-16 text-center">
                    <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-border/40 bg-secondary px-4 py-2 text-xs font-semibold tracking-[0.25em] text-secondary-foreground uppercase backdrop-blur dark:border-border/60 dark:bg-secondary">
                        Avis élèves
                    </div>

                    <h2 className="mb-4 text-3xl font-semibold tracking-tight text-foreground md:text-5xl">
                        Des élèves qui avancent vraiment
                    </h2>

                    <p className="mx-auto max-w-xl text-lg text-foreground/60">
                        Du bilan de niveau jusqu'à l'examen ÖSD ou TELC : chaque
                        parcours est différent, mais les résultats sont là.
                    </p>
                </div>
            </div>

            <div className="relative overflow-hidden">
                <motion.div
                    className="flex w-max gap-5 px-6 md:px-8 lg:px-12"
                    animate={{ x: ["0%", "-50%"] }}
                    transition={{
                        duration: 30,
                        ease: "linear",
                        repeat: Infinity,
                    }}
                >
                    {avisLoop.map((temoignage, index) => (
                        <div
                            key={`${temoignage.nom}-${index}`}
                            className="flex min-h-[260px] w-[320px] shrink-0 flex-col gap-5 rounded-2xl border border-border/40 bg-background/60 p-7 backdrop-blur-sm dark:border-border/50 dark:bg-background/50"
                        >
                            <Quote
                                className="h-7 w-7 text-primary/40"
                                aria-hidden="true"
                            />

                            <p className="flex-1 text-sm leading-relaxed text-foreground/70">
                                {temoignage.contenu}
                            </p>

                            <div className="flex items-center gap-3 border-t border-border/30 pt-5">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                                    {temoignage.initiales}
                                </div>

                                <div>
                                    <div className="text-sm font-semibold text-foreground">
                                        {temoignage.nom}
                                    </div>

                                    <div className="text-xs text-foreground/50">
                                        {temoignage.role} ·{" "}
                                        {temoignage.entreprise}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
}
