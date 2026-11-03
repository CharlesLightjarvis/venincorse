import { Head, Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import {
    ArrowRight,
    CalendarCheck,
    Check,
    CheckCircle2,
    Clock,
    FileText,
    Mail,
    Route,
    Target,
    Wallet,
} from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { CtaBand } from '@/components/marketing/cta-band';
import { FaqSection } from '@/components/marketing/faq-section';
import { OfferCard } from '@/components/marketing/offer-card';
import { SectionHeading } from '@/components/marketing/section-heading';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import type { FaqItem } from '@/data/offer';

const deliverables = [
    {
        icon: Target,
        title: 'Ton niveau réel',
        detail: 'A1 à B2, avec les points forts et les lacunes précises qui bloquent la suite.',
    },
    {
        icon: Route,
        title: 'Le parcours adapté',
        detail: 'Le niveau par lequel commencer, le nombre d’heures et le rythme réaliste.',
    },
    {
        icon: Wallet,
        title: 'Le budget clair',
        detail: 'Le prix de la formule recommandée, sans option cachée ni mauvaise surprise.',
    },
    {
        icon: FileText,
        title: 'Un plan écrit',
        detail: 'Un document synthétique envoyé sous 48 h : objectifs, étapes et échéances.',
    },
] as const;

const steps = [
    {
        number: '01',
        title: 'Tu réserves un créneau',
        detail: 'Choisis un horaire dans le formulaire. Tu reçois un lien visio et un court questionnaire de préparation.',
    },
    {
        number: '02',
        title: 'On échange 45 minutes',
        detail: 'Mises en situation, compréhension orale et écrite, discussion sur ton objectif et ton agenda.',
    },
    {
        number: '03',
        title: 'Tu reçois ton plan',
        detail: 'Sous 48 h, un document écrit avec ton niveau, le parcours recommandé et le budget associé.',
    },
] as const;

const bilanFaqs: FaqItem[] = [
    {
        question: 'Le bilan est-il obligatoire pour s’inscrire ?',
        answer:
            'Non. Si tu connais déjà ton niveau, tu peux t’inscrire directement dans un parcours ou une prépa. Le bilan est recommandé quand tu hésites entre deux niveaux ou entre plusieurs formats.',
    },
    {
        question: 'Et si je ne connais pas du tout mon niveau ?',
        answer:
            'C’est exactement l’objet du bilan. On part de mises en situation concrètes, pas d’un test académique. En 45 minutes, on sait si tu peux attaquer en A2, en B1 ou si A1 est le bon point de départ.',
    },
    {
        question: 'Les 39 € sont-ils vraiment crédités ?',
        answer:
            'Oui. Si tu t’inscris dans un parcours ou une prépa sous 7 jours après le bilan, les 39 € sont déduits du prix. Le crédit est automatique, tu n’as rien à réclamer.',
    },
    {
        question: 'Le bilan se passe comment, en visio ?',
        answer:
            'Par visioconférence, avec un lien envoyé après la réservation. Il faut une connexion stable, un micro et idéalement une caméra. Aucun support à préparer à l’avance.',
    },
];

const levelOptions = [
    'Je pars de zéro',
    'A1 — débutant',
    'A2 — faux débutant',
    'B1 — intermédiaire',
    'B2 — avancé',
    'Je ne sais pas',
];

const goalOptions = [
    'Voyager / vivre en Allemagne',
    'Études ou visa',
    'Travail / entretien',
    'Examen ÖSD ou TELC',
    'Conversation quotidienne',
    'Autre objectif',
];

const availabilityOptions = [
    'En matinée',
    'L’après-midi',
    'En soirée',
    'Le week-end',
];

const inputClasses =
    'w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40';

export default function LevelTest() {
    const [sent, setSent] = useState(false);

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setSent(true);
    };

    return (
        <>
            <Head title="Bilan de niveau" />

            <section className="relative overflow-hidden pt-16 pb-16 md:pt-24 md:pb-20">
                <div className="pointer-events-none absolute inset-0 overflow-hidden">
                    <div className="absolute top-0 right-1/4 h-[460px] w-[460px] rounded-full bg-primary/[0.04] blur-[150px] dark:bg-primary/[0.07]" />
                    <div className="absolute bottom-0 left-1/4 h-[360px] w-[360px] rounded-full bg-foreground/[0.025] blur-[130px] dark:bg-foreground/[0.05]" />
                </div>

                <div className="relative mx-auto max-w-7xl px-6 md:px-8 lg:px-12">
                    <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
                        <motion.div
                            initial={{ opacity: 0, y: 24 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.7 }}
                        >
                            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-border/40 bg-secondary px-4 py-2 text-xs font-semibold tracking-[0.25em] text-secondary-foreground uppercase backdrop-blur dark:border-border/60 dark:bg-secondary">
                                Bilan de niveau
                            </div>

                            <h1 className="text-3xl font-semibold tracking-tight text-foreground md:text-5xl lg:text-6xl">
                                45 minutes pour arrêter de deviner.
                            </h1>

                            <p className="mt-5 max-w-xl text-base leading-relaxed text-foreground/60 md:text-lg">
                                Tu sais que tu veux progresser en allemand, mais
                                pas exactement par où commencer ? Le bilan
                                mesure ton niveau réel, puis construit un plan
                                écrit — niveau, heures, rythme et budget.
                            </p>

                            <div className="mt-7 space-y-2.5">
                                {[
                                    'Un niveau CECRL fiable, pas une impression',
                                    'Un plan écrit envoyé sous 48 h',
                                    'Les 39 € crédités sur ton premier parcours',
                                ].map((point) => (
                                    <p
                                        key={point}
                                        className="flex items-center gap-2.5 text-sm text-foreground/65"
                                    >
                                        <Check
                                            className="h-4 w-4 shrink-0 text-primary"
                                            aria-hidden="true"
                                        />
                                        {point}
                                    </p>
                                ))}
                            </div>

                            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                                <Button
                                    size="lg"
                                    className="group gap-2 rounded-full"
                                    asChild
                                >
                                    <a href="#reserver">
                                        Réserver mon bilan
                                        <ArrowRight
                                            className="h-4 w-4 transition-transform group-hover:translate-x-1"
                                            aria-hidden="true"
                                        />
                                    </a>
                                </Button>

                                <Button
                                    size="lg"
                                    variant="outline"
                                    className="rounded-full border-border/50 bg-background/60 backdrop-blur-sm"
                                    asChild
                                >
                                    <Link href="/contact">
                                        Poser une question
                                    </Link>
                                </Button>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: 24 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.75, delay: 0.15 }}
                            className="relative mx-auto w-full max-w-md lg:mx-0"
                        >
                            <OfferCard
                                image="https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=1200&q=80"
                                alt="Bilan de niveau d'allemand en visio"
                                badge={{ label: 'Bilan complet' }}
                                chip={{ value: '39', label: '€ / 45 min' }}
                                index={0}
                            >
                                <p className="mb-4 text-xs text-foreground/55">
                                    Crédité sur ton premier parcours si tu
                                    t’inscris sous 7 jours.
                                </p>

                                <ul className="space-y-2.5">
                                    {[
                                        '45 minutes en visio, en 1:1',
                                        'Test oral et écrit adapté',
                                        'Plan de progression écrit',
                                        'Recommandation de format et budget',
                                    ].map((item) => (
                                        <li
                                            key={item}
                                            className="flex items-start gap-2.5 text-sm text-foreground/60"
                                        >
                                            <Check
                                                className="mt-0.5 h-4 w-4 shrink-0 text-primary"
                                                aria-hidden="true"
                                            />
                                            {item}
                                        </li>
                                    ))}
                                </ul>

                                <Button
                                    className="mt-6 w-full rounded-full"
                                    size="lg"
                                    asChild
                                >
                                    <a href="#reserver">
                                        Choisir un créneau
                                    </a>
                                </Button>

                                <p className="mt-3 text-center text-[11px] text-foreground/50">
                                    Réponse sous 24 h ouvrées
                                </p>
                            </OfferCard>
                        </motion.div>
                    </div>
                </div>
            </section>

            <section className="relative overflow-hidden bg-muted/30 py-20 md:py-28 dark:bg-foreground/[0.02]">
                <div className="relative mx-auto max-w-7xl px-6 md:px-8 lg:px-12">
                    <SectionHeading
                        eyebrow="Ce que tu reçois"
                        title="Pas un score. Un plan."
                        description="Le bilan ne sert pas à te coller une étiquette, mais à choisir le chemin le plus court vers ton objectif."
                        align="center"
                        className="mb-12"
                    />

                    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                        {deliverables.map((item, index) => (
                            <motion.div
                                key={item.title}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{
                                    duration: 0.5,
                                    delay: index * 0.06,
                                }}
                                className="rounded-2xl border border-border/40 bg-background/70 p-5 backdrop-blur-sm dark:border-border/50 dark:bg-background/40"
                            >
                                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                    <item.icon
                                        className="h-5 w-5"
                                        aria-hidden="true"
                                    />
                                </span>

                                <h3 className="mt-4 text-sm font-semibold text-foreground">
                                    {item.title}
                                </h3>

                                <p className="mt-1.5 text-xs leading-relaxed text-foreground/55">
                                    {item.detail}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="relative py-20 md:py-28">
                <div className="relative mx-auto max-w-7xl px-6 md:px-8 lg:px-12">
                    <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
                        <div className="lg:sticky lg:top-24 lg:self-start">
                            <SectionHeading
                                eyebrow="Le déroulé"
                                title="Trois étapes, zéro pression."
                                description="Un échange humain, pas un test automatisé. On parle de ton objectif avant de parler de grammaire."
                            />

                            <div className="mt-7 inline-flex items-center gap-2 rounded-full border border-border/40 bg-background/60 px-4 py-2 text-xs text-foreground/55 backdrop-blur-sm dark:border-border/50 dark:bg-background/40">
                                <Clock
                                    className="h-3.5 w-3.5 text-primary"
                                    aria-hidden="true"
                                />
                                45 minutes · en visio · 1:1
                            </div>
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
                                        duration: 0.5,
                                        delay: index * 0.07,
                                    }}
                                    className="relative flex gap-5 rounded-2xl border border-border/40 bg-card p-5 dark:border-border/50"
                                >
                                    <span className="relative z-10 flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-border/40 bg-background text-primary dark:border-border/50">
                                        <span className="font-mono text-sm font-semibold">
                                            {step.number}
                                        </span>
                                    </span>

                                    <div>
                                        <h3 className="font-semibold text-foreground">
                                            {step.title}
                                        </h3>
                                        <p className="mt-1.5 text-sm leading-relaxed text-foreground/60">
                                            {step.detail}
                                        </p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            <section
                id="reserver"
                className="relative overflow-hidden bg-muted/30 py-20 md:py-28 dark:bg-foreground/[0.02]"
            >
                <div className="pointer-events-none absolute inset-0 overflow-hidden">
                    <div className="absolute top-0 left-1/4 h-[360px] w-[360px] rounded-full bg-primary/[0.04] blur-[140px] dark:bg-primary/[0.06]" />
                </div>

                <div className="relative mx-auto max-w-7xl px-6 md:px-8 lg:px-12">
                    <div className="grid items-start gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
                        <div className="lg:sticky lg:top-24">
                            <SectionHeading
                                eyebrow="Réserver"
                                title="Choisis ton créneau."
                                description="Remplis le formulaire : on te confirme l’horaire par email sous 24 h ouvrées, avec le lien visio."
                            />

                            <div className="mt-7 space-y-3">
                                <div className="flex items-start gap-3 rounded-2xl border border-border/40 bg-background/60 p-4 backdrop-blur-sm dark:border-border/50 dark:bg-background/40">
                                    <CalendarCheck
                                        className="mt-0.5 h-5 w-5 shrink-0 text-primary"
                                        aria-hidden="true"
                                    />
                                    <div>
                                        <p className="text-sm font-semibold text-foreground">
                                            Créneaux en semaine et le samedi
                                        </p>
                                        <p className="text-xs text-foreground/55">
                                            9 h – 21 h (GMT) · visio
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3 rounded-2xl border border-border/40 bg-background/60 p-4 backdrop-blur-sm dark:border-border/50 dark:bg-background/40">
                                    <Mail
                                        className="mt-0.5 h-5 w-5 shrink-0 text-primary"
                                        aria-hidden="true"
                                    />
                                    <div>
                                        <p className="text-sm font-semibold text-foreground">
                                            Une question avant ?
                                        </p>
                                        <p className="text-xs text-foreground/55">
                                            Écris à contact@venincorse.com
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <OfferCard
                            image="https://images.unsplash.com/photo-1506784983877-45594efa4cbe?auto=format&fit=crop&w=1200&q=80"
                            alt="Réserver le bilan de niveau"
                            badge={{ label: 'Réservation' }}
                            chip={{ value: '39', label: '€ / 45 min' }}
                            index={1}
                        >
                            {sent ? (
                                <div className="flex flex-col items-center py-10 text-center">
                                    <span className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
                                        <CheckCircle2
                                            className="h-7 w-7"
                                            aria-hidden="true"
                                        />
                                    </span>

                                    <h2 className="mt-5 text-xl font-semibold text-foreground">
                                        Demande enregistrée.
                                    </h2>

                                    <p className="mt-2 max-w-sm text-sm text-foreground/60">
                                        On revient vers toi sous 24 h ouvrées
                                        avec un créneau confirmé et le lien
                                        visio. Pense à vérifier tes spams.
                                    </p>

                                    <Button
                                        variant="outline"
                                        className="mt-6 rounded-full border-border/50"
                                        onClick={() => setSent(false)}
                                    >
                                        Envoyer une autre demande
                                    </Button>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit}>
                                    <h2 className="text-xl font-semibold text-foreground">
                                        Réserver le bilan — 39 €
                                    </h2>

                                    <p className="mt-1 text-sm text-foreground/60">
                                        Aucun paiement n’est demandé maintenant.
                                        On confirme le créneau avant.
                                    </p>

                                    <div className="mt-6 grid gap-4 sm:grid-cols-2">
                                        <div className="flex flex-col gap-2">
                                            <label
                                                htmlFor="first-name"
                                                className="text-sm font-medium text-foreground"
                                            >
                                                Prénom
                                            </label>
                                            <Input
                                                id="first-name"
                                                name="first-name"
                                                placeholder="Ton prénom"
                                                autoComplete="given-name"
                                                required
                                            />
                                        </div>

                                        <div className="flex flex-col gap-2">
                                            <label
                                                htmlFor="email"
                                                className="text-sm font-medium text-foreground"
                                            >
                                                Email
                                            </label>
                                            <Input
                                                id="email"
                                                name="email"
                                                type="email"
                                                placeholder="ton@email.com"
                                                autoComplete="email"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="mt-4 grid gap-4 sm:grid-cols-2">
                                        <div className="flex flex-col gap-2">
                                            <label
                                                htmlFor="current-level"
                                                className="text-sm font-medium text-foreground"
                                            >
                                                Ton niveau actuel
                                            </label>
                                            <Select name="current-level">
                                                <SelectTrigger
                                                    id="current-level"
                                                    className="w-full"
                                                >
                                                    <SelectValue placeholder="Choisis" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {levelOptions.map(
                                                        (option) => (
                                                            <SelectItem
                                                                key={option}
                                                                value={option}
                                                            >
                                                                {option}
                                                            </SelectItem>
                                                        ),
                                                    )}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="flex flex-col gap-2">
                                            <label
                                                htmlFor="goal"
                                                className="text-sm font-medium text-foreground"
                                            >
                                                Ton objectif
                                            </label>
                                            <Select name="goal">
                                                <SelectTrigger
                                                    id="goal"
                                                    className="w-full"
                                                >
                                                    <SelectValue placeholder="Choisis" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {goalOptions.map(
                                                        (option) => (
                                                            <SelectItem
                                                                key={option}
                                                                value={option}
                                                            >
                                                                {option}
                                                            </SelectItem>
                                                        ),
                                                    )}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    <div className="mt-4 flex flex-col gap-2">
                                        <label
                                            htmlFor="availability"
                                            className="text-sm font-medium text-foreground"
                                        >
                                            Tes disponibilités
                                        </label>
                                        <Select name="availability">
                                            <SelectTrigger
                                                id="availability"
                                                className="w-full"
                                            >
                                                <SelectValue placeholder="Choisis un moment" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {availabilityOptions.map(
                                                    (option) => (
                                                        <SelectItem
                                                            key={option}
                                                            value={option}
                                                        >
                                                            {option}
                                                        </SelectItem>
                                                    ),
                                                )}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="mt-4 flex flex-col gap-2">
                                        <label
                                            htmlFor="message"
                                            className="text-sm font-medium text-foreground"
                                        >
                                            Un détail à nous dire ?{' '}
                                            <span className="text-foreground/40">
                                                (facultatif)
                                            </span>
                                        </label>
                                        <textarea
                                            id="message"
                                            name="message"
                                            rows={4}
                                            placeholder="Ex : je vise le TELC B1 en mars, je travaille en horaires décalés…"
                                            className={`${inputClasses} resize-none`}
                                        />
                                    </div>

                                    <Button
                                        type="submit"
                                        size="lg"
                                        className="group mt-6 w-full gap-2 rounded-full"
                                    >
                                        Envoyer ma demande
                                        <ArrowRight
                                            className="h-4 w-4 transition-transform group-hover:translate-x-1"
                                            aria-hidden="true"
                                        />
                                    </Button>

                                    <p className="mt-3 text-center text-xs text-foreground/50">
                                        Réponse sous 24 h ouvrées · aucune
                                        donnée partagée
                                    </p>
                                </form>
                            )}
                        </OfferCard>
                    </div>
                </div>
            </section>

            <FaqSection
                items={bilanFaqs}
                title="Le bilan, sans malentendu"
                description="Obligation, crédit, déroulé : les réponses avant de réserver."
            />

            <CtaBand
                eyebrow="Après le bilan"
                title="Le bon parcours, au bon niveau."
                description="Tu repars avec un plan écrit et un budget. Si tu t’inscris sous 7 jours, les 39 € du bilan sont déduits du parcours."
                primary={{ label: 'Voir les parcours', href: '/courses' }}
                secondary={{ label: 'Voir les tarifs', href: '/tarifs' }}
            />
        </>
    );
}
