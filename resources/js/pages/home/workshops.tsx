import { Head, Link } from '@inertiajs/react';
import {
    ArrowRight,
    BookOpen,
    Check,
    Clock,
    Gamepad2,
    MessagesSquare,
    PenLine,
} from 'lucide-react';
import { useState } from 'react';
import { CtaBand } from '@/components/marketing/cta-band';
import { FaqSection } from '@/components/marketing/faq-section';
import { OfferCard } from '@/components/marketing/offer-card';
import { PageHero } from '@/components/marketing/page-hero';
import { SectionHeading } from '@/components/marketing/section-heading';
import { TierSwitcher } from '@/components/marketing/tier-switcher';
import { selectClassName } from '@/components/trial-slot-picker';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
    formatPrice,
    tierLabels,
    type FaqItem,
    type LevelSlug,
    type TierKey,
} from '@/data/offer';
import {
    grammarPacks,
    practiceWorkshops,
    workshopLevels,
    workshopVolume,
} from '@/data/workshop-catalog';
import { courses, levelTest } from '@/routes';
import { show as workshopDetail } from '@/routes/workshops';

const practiceIcons = {
    sprechen: MessagesSquare,
    schreiben: PenLine,
    wortschatz: Gamepad2,
};

const workshopFaqs: FaqItem[] = [
    {
        question: 'Le pack de grammaire remplace-t-il un parcours complet ?',
        answer: 'Non. Il sert à travailler les structures essentielles d’un niveau avec des explications et des exercices. Il ne couvre pas à lui seul toute la compréhension, le vocabulaire et la communication d’un parcours A1 à B2, et ne certifie pas un niveau.',
    },
    {
        question: 'Puis-je venir uniquement à un atelier pratique ?',
        answer: 'Oui. Tu peux choisir Sprechen, Schreiben ou Wortschatz sans acheter un pack de grammaire ni suivre un parcours chez nous. Tu sélectionnes simplement le niveau qui te correspond.',
    },
    {
        question: 'Les niveaux sont-ils mélangés dans un groupe ?',
        answer: 'Non. Une séance de groupe réunit 3 à 6 personnes de niveau comparable, sur le même objectif. Les thèmes et les consignes changent entre A1, A2, B1 et B2.',
    },
    {
        question: 'Comment choisir mon niveau ?',
        answer: 'Pars du niveau que tu travailles actuellement. Si les bases restent fragiles, prends le pack du niveau précédent. Le test gratuit peut t’orienter ; on peut aussi en discuter avant de choisir une séance.',
    },
    {
        question: 'Est-ce un cours enregistré ou un atelier en direct ?',
        answer: 'Les deux offres sont animées en direct, en visio, avec un professeur. Le pack se suit sur plusieurs séances ; les ateliers pratiques peuvent se prendre à l’unité. Les supports et les retours utiles sont inclus.',
    },
    {
        question: 'Puis-je déjà réserver et payer ?',
        answer: 'Oui, dans cette démonstration : les fiches permettent de choisir un créneau et de simuler un paiement. Aucun débit réel, aucun email et aucune réunion Meet ne sont créés. La réservation reste enregistrée dans ce navigateur.',
    },
];

export default function Workshops() {
    const [tier, setTier] = useState<TierKey>('group');
    const [level, setLevel] = useState<LevelSlug>('a1');

    return (
        <>
            <Head title="Packs de grammaire & ateliers pratiques" />
            <PageHero
                eyebrow="À la carte"
                title={
                    <>
                        La grammaire à ton niveau.
                        <br />
                        L’allemand en pratique.
                    </>
                }
                description="Tu veux comprendre les règles sans suivre un parcours complet ? Ou simplement pratiquer davantage ? Choisis un pack de grammaire A1 à B2, ou un atelier pour parler, écrire et jouer avec les mots."
            >
                <Button asChild size="lg" className="rounded-full">
                    <a href="#grammar">
                        Explorer les packs de grammaire
                        <ArrowRight />
                    </a>
                </Button>
                <Button
                    asChild
                    size="lg"
                    variant="outline"
                    className="rounded-full"
                >
                    <a href="#practice">Trouver un atelier pratique</a>
                </Button>
            </PageHero>

            <section className="pb-14">
                <div className="mx-auto grid max-w-7xl gap-4 px-6 md:grid-cols-2 md:px-8 lg:px-12">
                    <a
                        href="#grammar"
                        className="flex items-start gap-4 rounded-2xl border border-border/50 bg-muted/20 p-5 transition-colors hover:border-primary/40 focus-visible:outline-2 focus-visible:outline-primary"
                    >
                        <BookOpen className="mt-1 size-6 shrink-0 text-primary" />
                        <div>
                            <h2 className="text-lg font-semibold">
                                « Je veux comprendre la grammaire. »
                            </h2>
                            <p className="mt-2 text-sm text-muted-foreground">
                                Un pack cohérent par niveau, plusieurs séances
                                et des règles appliquées à des exemples
                                concrets.
                            </p>
                        </div>
                    </a>
                    <a
                        href="#practice"
                        className="flex items-start gap-4 rounded-2xl border border-border/50 bg-muted/20 p-5 transition-colors hover:border-primary/40 focus-visible:outline-2 focus-visible:outline-primary"
                    >
                        <MessagesSquare className="mt-1 size-6 shrink-0 text-primary" />
                        <div>
                            <h2 className="text-lg font-semibold">
                                « Je veux surtout pratiquer. »
                            </h2>
                            <p className="mt-2 text-sm text-muted-foreground">
                                Une séance de Sprechen, Schreiben ou Wortschatz.
                                Un objectif précis, à ton niveau, sans pack
                                obligatoire.
                            </p>
                        </div>
                    </a>
                </div>
            </section>

            <section id="grammar" className="scroll-mt-24 pb-20 md:pb-28">
                <div className="mx-auto max-w-7xl px-6 md:px-8 lg:px-12">
                    <div className="mb-8 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                        <SectionHeading
                            eyebrow="Les packs de grammaire"
                            title="Remettre les règles dans le bon ordre."
                            description="Un pack par niveau, à prendre indépendamment. On explique, on s’exerce et on réutilise les structures dans de courtes productions."
                        />
                        <div className="flex shrink-0 flex-col gap-2">
                            <p className="text-xs text-muted-foreground">
                                Afficher les tarifs pour
                            </p>
                            <TierSwitcher value={tier} onChange={setTier} />
                        </div>
                    </div>
                    <p className="mb-6 text-sm text-muted-foreground">
                        Tarifs et programmes de démonstration, à affiner.{' '}
                        {tier === 'group'
                            ? 'Prix par personne, pour un groupe de 3 à 6 élèves de même niveau.'
                            : 'En 1:1, le professeur te consacre toute la séance ; le tarif est plus élevé.'}
                    </p>
                    <div className="grid gap-5 md:grid-cols-2">
                        {grammarPacks.map((pack, index) => (
                            <OfferCard
                                key={pack.id}
                                index={index}
                                image={pack.image}
                                alt={`Pack de grammaire ${pack.level.toUpperCase()}`}
                                badge={{ label: pack.level.toUpperCase() }}
                                chip={{
                                    value: String(pack.sessions),
                                    label: 'séances',
                                }}
                            >
                                <h3 className="text-xl font-semibold">
                                    {pack.title}
                                </h3>
                                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                                    {pack.description}
                                </p>
                                <p className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
                                    <Clock className="size-3.5" />
                                    {workshopVolume(
                                        pack.sessions,
                                        pack.durationMinutes,
                                    )}{' '}
                                    · en direct
                                </p>
                                <Accordion
                                    type="single"
                                    collapsible
                                    className="my-4"
                                >
                                    <AccordionItem
                                        value={pack.id}
                                        className="border-y border-border/40"
                                    >
                                        <AccordionTrigger className="text-sm hover:no-underline">
                                            Voir le programme des{' '}
                                            {pack.sessions} séances
                                        </AccordionTrigger>
                                        <AccordionContent>
                                            <ol className="flex flex-col gap-4">
                                                {pack.program.map(
                                                    (item, sessionIndex) => (
                                                        <li
                                                            key={item.title}
                                                            className="flex items-start gap-3"
                                                        >
                                                            <span className="flex size-6 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-xs font-semibold text-primary">
                                                                {sessionIndex +
                                                                    1}
                                                            </span>
                                                            <div>
                                                                <p className="text-sm font-medium">
                                                                    {item.title}
                                                                </p>
                                                                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                                                                    {
                                                                        item.description
                                                                    }
                                                                </p>
                                                            </div>
                                                        </li>
                                                    ),
                                                )}
                                            </ol>
                                        </AccordionContent>
                                    </AccordionItem>
                                </Accordion>
                                <p className="mb-5 flex flex-1 items-start gap-2 text-sm">
                                    <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                                    {pack.outcome}
                                </p>
                                <div className="flex flex-wrap items-end justify-between gap-3">
                                    <div>
                                        <p className="text-xs text-muted-foreground">
                                            Le pack · {tierLabels[tier]}
                                            {tier === 'group' &&
                                                ' · par personne'}
                                        </p>
                                        <p className="mt-1 font-mono text-xl font-semibold">
                                            {formatPrice(pack.price[tier])}
                                        </p>
                                    </div>
                                    <Button variant="secondary" asChild>
                                        <Link
                                            href={workshopDetail.url(pack.id, {
                                                query: { tier },
                                            })}
                                        >
                                            Voir le programme
                                            <ArrowRight />
                                        </Link>
                                    </Button>
                                </div>
                            </OfferCard>
                        ))}
                    </div>
                    <p className="mt-6 max-w-3xl text-sm leading-relaxed text-muted-foreground">
                        Ces packs consolident la grammaire d’un niveau. Ils ne
                        remplacent pas un parcours complet et ne promettent pas
                        de « passer B2 » en quelques séances.
                    </p>
                </div>
            </section>

            <section
                id="practice"
                className="scroll-mt-24 bg-muted/30 py-20 md:py-28"
            >
                <div className="mx-auto max-w-7xl px-6 md:px-8 lg:px-12">
                    <SectionHeading
                        eyebrow="Les ateliers pratiques"
                        title="Moins de théorie. À toi de jouer."
                        description="Un atelier à l’unité, une vraie mise en pratique. Choisis ton niveau pour découvrir les thèmes et les activités proposés."
                        className="mb-8"
                    />
                    <div className="mb-8 flex flex-col gap-5 rounded-2xl border border-border/50 bg-background/70 p-5 sm:flex-row sm:items-end sm:justify-between">
                        <div className="flex flex-col gap-2 sm:min-w-48">
                            <Label htmlFor="practice-level">
                                Ton niveau de pratique
                            </Label>
                            <select
                                id="practice-level"
                                className={selectClassName}
                                value={level}
                                onChange={(event) =>
                                    setLevel(event.target.value as LevelSlug)
                                }
                            >
                                {workshopLevels.map((item) => (
                                    <option key={item} value={item}>
                                        {item.toUpperCase()}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="flex flex-col gap-2">
                            <p className="text-xs text-muted-foreground">
                                Formule · prix par séance
                            </p>
                            <TierSwitcher value={tier} onChange={setTier} />
                        </div>
                    </div>
                    <div className="grid gap-5 lg:grid-cols-3">
                        {practiceWorkshops.map((workshop, index) => {
                            const detail = workshop.levels[level];
                            const Icon =
                                practiceIcons[
                                    workshop.id as keyof typeof practiceIcons
                                ];
                            return (
                                <OfferCard
                                    key={workshop.id}
                                    index={index}
                                    image={workshop.image}
                                    alt={`Atelier ${workshop.title}`}
                                    badge={{
                                        label: `${workshop.title} · ${level.toUpperCase()}`,
                                    }}
                                    chip={{
                                        value: String(workshop.durationMinutes),
                                        label: 'min',
                                    }}
                                >
                                    <div className="flex items-center gap-2">
                                        <Icon className="size-5 text-primary" />
                                        <h3 className="text-xl font-semibold">
                                            {workshop.title}
                                        </h3>
                                    </div>
                                    <p className="mt-1 text-sm font-medium text-primary">
                                        {workshop.subtitle}
                                    </p>
                                    <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                                        {workshop.description}
                                    </p>
                                    <div className="my-4 rounded-xl bg-muted/40 p-4">
                                        <Badge variant="secondary">
                                            Exemple de séance ·{' '}
                                            {level.toUpperCase()}
                                        </Badge>
                                        <p className="mt-3 text-sm font-medium">
                                            {detail.task}
                                        </p>
                                    </div>
                                    <ul className="mb-4 flex flex-col gap-2">
                                        {detail.activities.map((item) => (
                                            <li
                                                key={item}
                                                className="flex items-start gap-2 text-xs leading-relaxed text-muted-foreground"
                                            >
                                                <Check className="mt-0.5 size-3.5 shrink-0 text-primary" />
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                    <p className="mb-5 flex-1 text-sm">
                                        {detail.outcome}
                                    </p>
                                    <div className="flex flex-wrap items-end justify-between gap-3 border-t border-border/40 pt-4">
                                        <div>
                                            <p className="text-xs text-muted-foreground">
                                                La séance · {tierLabels[tier]}
                                            </p>
                                            <p className="mt-1 font-mono text-xl font-semibold">
                                                {formatPrice(
                                                    workshop.price[tier],
                                                )}
                                            </p>
                                        </div>
                                        <Button variant="secondary" asChild>
                                            <Link
                                                href={workshopDetail.url(
                                                    workshop.id,
                                                    {
                                                        query: { tier, level },
                                                    },
                                                )}
                                            >
                                                Voir la fiche
                                                <ArrowRight />
                                            </Link>
                                        </Button>
                                    </div>
                                </OfferCard>
                            );
                        })}
                    </div>
                    <p className="mt-5 text-xs text-muted-foreground">
                        En groupe, les participants travaillent le même niveau.
                        Chaque fiche permet de choisir un créneau de
                        démonstration et de simuler le paiement.
                    </p>
                </div>
            </section>

            <section className="py-16 md:py-20">
                <div className="mx-auto grid max-w-7xl gap-8 px-6 md:grid-cols-3 md:px-8 lg:px-12">
                    {[
                        {
                            title: 'Une explication qui sert',
                            description:
                                'Dans le pack, on part d’exemples concrets et on rend la règle lisible avant de l’utiliser.',
                            icon: BookOpen,
                        },
                        {
                            title: 'Tu produis pendant la séance',
                            description:
                                'Dialogue, texte, défi de vocabulaire : tu fais quelque chose en allemand, avec un retour du professeur.',
                            icon: PenLine,
                        },
                        {
                            title: 'Tu gardes de quoi réutiliser',
                            description:
                                'Supports, phrases utiles et corrections : une trace courte pour continuer entre les séances.',
                            icon: Gamepad2,
                        },
                    ].map((item) => (
                        <div key={item.title} className="flex flex-col gap-3">
                            <item.icon className="size-6 text-primary" />
                            <h2 className="text-xl font-semibold">
                                {item.title}
                            </h2>
                            <p className="text-sm leading-relaxed text-muted-foreground">
                                {item.description}
                            </p>
                        </div>
                    ))}
                </div>
            </section>

            <FaqSection
                items={workshopFaqs}
                title="À la carte, mais pas au hasard."
                description="Le niveau, le format et ce que tu peux attendre de chaque offre."
            />
            <CtaBand
                title="Tu cherches plutôt une progression complète ?"
                description="Les parcours A1 à B2 travaillent toutes les compétences sur 60 heures. Les packs et ateliers restent disponibles séparément, pour compléter ou renforcer un besoin précis."
                primary={{ label: 'Voir les parcours', href: courses.url() }}
                secondary={{
                    label: 'Tester mon niveau',
                    href: levelTest.url(),
                }}
            />
        </>
    );
}
