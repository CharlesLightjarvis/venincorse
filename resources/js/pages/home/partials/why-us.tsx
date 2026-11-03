import { motion, type Variants } from "framer-motion";
import {
    CalendarDays,
    FileCheck2,
    GraduationCap,
    MessagesSquare,
    TrendingUp,
    UserCheck,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const services = [
    {
        icon: UserCheck,
        title: "Cours privés 1:1",
        description:
            "Un enseignement individualisé qui s'adapte à ton niveau, tes objectifs et ton rythme d'apprentissage.",
    },
    {
        icon: CalendarDays,
        title: "Horaires flexibles",
        description:
            "Réserve tes sessions quand tu veux — en semaine, le soir ou le week-end, selon tes disponibilités.",
    },
    {
        icon: GraduationCap,
        title: "Préparation aux examens",
        description:
            "Goethe, TELC, ÖSD ou DSD : des exercices ciblés et des mock tests corrigés pour réussir le jour J.",
    },
    {
        icon: MessagesSquare,
        title: "Conversation active",
        description:
            "Pratique l'oral dès la première séance : prononciation, vocabulaire utile et mises en situation réelles.",
    },
    {
        icon: TrendingUp,
        title: "Suivi de progression",
        description:
            "Des bilans réguliers te montrent où tu en es et ce qu'il reste à travailler pour atteindre ton objectif.",
    },
    {
        icon: FileCheck2,
        title: "Grammaire pas à pas",
        description:
            "Des explications claires, des tableaux synthétiques et des exercices appliqués pour ancrer chaque règle.",
    },
] as const;

const containerVariants: Variants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.1 } },
};

const itemVariants: Variants = {
    hidden: { opacity: 0, y: 24 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.6, ease: "easeOut" },
    },
};

export function WhyUs() {
    return (
        <section className="relative py-24 md:py-32">
            {/* blob décoratif */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <div className="absolute top-0 right-1/4 h-[400px] w-[400px] rounded-full bg-primary/[0.03] blur-[140px] dark:bg-primary/[0.06]" />
            </div>

            <div className="relative mx-auto max-w-7xl px-6 md:px-8 lg:px-12">
                {/* en-tête */}
                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.7 }}
                    className="mb-16 text-center"
                >
                    <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-border/40 bg-secondary px-4 py-2 text-xs font-semibold tracking-[0.25em] text-secondary-foreground uppercase backdrop-blur dark:border-border/60 dark:bg-secondary">
                        Pourquoi nous
                    </div>

                    <h2 className="mb-4 text-3xl font-semibold tracking-tight text-foreground md:text-5xl">
                        Tout pour progresser en allemand
                    </h2>

                    <p className="mx-auto max-w-2xl text-lg text-foreground/60">
                        Une plateforme pensée pour avancer efficacement : ton
                        niveau, tes objectifs et ton rythme sont respectés à
                        chaque séance, avec un accompagnement clair du premier
                        cours jusqu'à l'examen.
                    </p>
                </motion.div>

                {/* grille */}
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-80px" }}
                    className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
                >
                    {services.map((service) => {
                        const Icon = service.icon;

                        return (
                            <motion.div
                                key={service.title}
                                variants={itemVariants}
                            >
                                <Card className="group h-full border-border/40 bg-background/60 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-border/60 hover:shadow-lg dark:border-border/50 dark:bg-background/50">
                                    <CardContent className="p-7">
                                        <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary/15">
                                            <Icon
                                                className="h-6 w-6"
                                                aria-hidden="true"
                                            />
                                        </div>

                                        <h3 className="mb-2 text-lg font-semibold text-foreground">
                                            {service.title}
                                        </h3>

                                        <p className="text-sm leading-relaxed text-foreground/60">
                                            {service.description}
                                        </p>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        );
                    })}
                </motion.div>
            </div>
        </section>
    );
}
