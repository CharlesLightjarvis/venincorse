import { Head, Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { ArrowDown, ArrowRight, Check, Minus } from 'lucide-react';
import type { CSSProperties } from 'react';
import { Book3D } from '@/components/marketing/book-3d';
import { CtaBand } from '@/components/marketing/cta-band';
import { SectionHeading } from '@/components/marketing/section-heading';
import { Button } from '@/components/ui/button';
import {
    getTextbookCollection,
    getTextbookVolume,
    textbookCollections,
    textbookPicks,
    type TextbookCollection,
} from '@/data/textbooks';
import { cn } from '@/lib/utils';

const comparisonRows: {
    label: string;
    value: (collection: TextbookCollection) => string;
    emphasis?: boolean;
}[] = [
    { label: 'Niveaux', value: (collection) => collection.comparison.levels },
    { label: 'Format', value: (collection) => collection.comparison.format },
    {
        label: 'Approche',
        value: (collection) => collection.comparison.approach,
    },
    {
        label: 'Points forts',
        value: (collection) => collection.comparison.strengths,
    },
    { label: 'Limites', value: (collection) => collection.comparison.limits },
    {
        label: 'Chez VéninCorsé',
        value: (collection) => collection.comparison.usage,
        emphasis: true,
    },
];

function collectionAccentStyle(collection: TextbookCollection): CSSProperties {
    return {
        '--collection-accent': collection.accent,
        '--collection-accent-dark': collection.accentDark,
    } as CSSProperties;
}

function CollectionBadge({ collection }: { collection: TextbookCollection }) {
    return (
        <span
            className={cn(
                'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-semibold tracking-[0.12em] uppercase',
                collection.status === 'selected'
                    ? 'border-primary/20 bg-primary/10 text-primary'
                    : 'border-border/50 bg-background/60 text-foreground/50',
            )}
            style={collectionAccentStyle(collection)}
        >
            <span
                className="collection-accent-bg h-1.5 w-1.5 rounded-full"
                aria-hidden="true"
            />
            {collection.badge}
        </span>
    );
}

function HeroShelf() {
    return (
        <div className="relative mx-auto mt-12 max-w-3xl md:mt-16">
            <div
                className="pointer-events-none absolute inset-x-4 bottom-12 h-40 rounded-[50%] bg-primary/[0.06] blur-3xl dark:bg-primary/[0.08]"
                aria-hidden="true"
            />

            <div className="relative flex items-end justify-center gap-3 sm:gap-5 md:gap-7">
                {textbookPicks.map((pick, index) => {
                    const collection = getTextbookCollection(pick.collection);
                    const volume = getTextbookVolume(
                        collection,
                        pick.volumeLevel,
                    );

                    return (
                        <motion.div
                            key={pick.level}
                            initial={{ opacity: 0, y: 24 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{
                                duration: 0.6,
                                delay: 0.2 + index * 0.08,
                                ease: 'easeOut',
                            }}
                            className="w-[clamp(70px,16vw,148px)]"
                        >
                            <Link
                                href={`/courses/${pick.level}`}
                                className="group block rounded-md focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-4 focus-visible:ring-offset-background focus-visible:outline-none"
                            >
                                <Book3D
                                    cover={volume.cover}
                                    title={volume.title}
                                    accent={collection.accent}
                                    ratio={volume.ratio}
                                    lean={index % 2 === 0 ? -1.5 : 1.5}
                                    priority
                                />

                                <span className="mt-3 block text-center font-display text-sm font-semibold text-foreground/80 transition-colors group-hover:text-primary">
                                    {pick.level.toUpperCase()}
                                </span>
                                <span className="mt-0.5 block text-center text-[10px] text-foreground/40">
                                    {collection.name}
                                </span>
                            </Link>
                        </motion.div>
                    );
                })}
            </div>

            <div className="relative mx-auto mt-8 flex max-w-md items-center gap-3 text-[10px] font-semibold tracking-[0.2em] text-foreground/35 uppercase">
                <span className="h-px flex-1 bg-border" />
                <span>A1 → B2</span>
                <span className="h-px flex-1 bg-border" />
            </div>
        </div>
    );
}

function CollectionShelf({ collection }: { collection: TextbookCollection }) {
    const leans = [-3, 1.5, 3];

    return (
        <div className="relative">
            <div
                className="pointer-events-none absolute inset-x-2 top-1/2 h-48 -translate-y-1/2 rounded-[50%] blur-3xl"
                style={{
                    backgroundColor: collection.accent,
                    opacity: 0.1,
                }}
                aria-hidden="true"
            />

            <div className="relative flex items-end justify-center gap-3 sm:gap-5">
                {collection.volumes.map((volume, index) => (
                    <div
                        key={volume.level}
                        className={cn(
                            'w-[28%] max-w-[150px]',
                            collection.volumes.length === 2 &&
                                'w-[34%] max-w-[175px]',
                        )}
                    >
                        <Book3D
                            cover={volume.cover}
                            title={volume.title}
                            accent={collection.accent}
                            ratio={volume.ratio}
                            lean={leans[index] ?? 0}
                        />

                        <span className="mt-3 block text-center font-mono text-[10px] tracking-[0.16em] text-foreground/45 uppercase">
                            {volume.level}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}

function CollectionSection({
    collection,
    reversed,
}: {
    collection: TextbookCollection;
    reversed: boolean;
}) {
    return (
        <article
            id={collection.slug}
            className="scroll-mt-28"
            style={collectionAccentStyle(collection)}
        >
            <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className={cn(reversed && 'lg:order-2')}
                >
                    <div className="flex flex-wrap items-center gap-3">
                        <span className="font-mono text-xs tracking-[0.2em] text-foreground/35">
                            {collection.order}
                        </span>
                        <span className="h-px w-8 bg-border" />
                        <span className="font-mono text-[10px] tracking-[0.2em] text-foreground/45 uppercase">
                            {collection.publisher}
                        </span>
                        <CollectionBadge collection={collection} />
                    </div>

                    <h3 className="mt-4 font-display text-4xl font-semibold tracking-tight text-foreground md:text-5xl">
                        {collection.name}
                    </h3>

                    <p className="collection-accent-text mt-2 font-display text-lg">
                        {collection.tagline}
                    </p>

                    <p className="mt-4 text-sm leading-relaxed text-foreground/60 md:text-base">
                        {collection.description}
                    </p>

                    <div className="mt-6 grid gap-5 sm:grid-cols-2">
                        <div>
                            <p className="mb-2 font-mono text-[10px] tracking-[0.18em] text-foreground/40 uppercase">
                                Ce qu’on aime
                            </p>
                            <ul className="space-y-2">
                                {collection.strengths.map((strength) => (
                                    <li
                                        key={strength}
                                        className="flex gap-2 text-sm leading-relaxed text-foreground/60"
                                    >
                                        <Check
                                            className="collection-accent-text mt-0.5 h-3.5 w-3.5 shrink-0"
                                            aria-hidden="true"
                                        />
                                        {strength}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div>
                            <p className="mb-2 font-mono text-[10px] tracking-[0.18em] text-foreground/40 uppercase">
                                Ce qui nous freine
                            </p>
                            <ul className="space-y-2">
                                {collection.limits.map((limit) => (
                                    <li
                                        key={limit}
                                        className="flex gap-2 text-sm leading-relaxed text-foreground/60"
                                    >
                                        <Minus className="mt-0.5 h-3.5 w-3.5 shrink-0 text-foreground/30" />
                                        {limit}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    <div className="mt-6 flex flex-wrap items-center gap-2">
                        {collection.volumes.map((volume) => (
                            <span
                                key={volume.level}
                                className="rounded-full border border-border/50 bg-background/60 px-2.5 py-1 font-mono text-[10px] font-medium text-foreground/60"
                            >
                                {volume.level}
                            </span>
                        ))}
                        <span className="text-xs text-foreground/40">
                            {collection.format}
                        </span>
                    </div>

                    <p
                        className="mt-5 border-l-2 pl-4 text-sm font-medium text-foreground/80"
                        style={{ borderColor: collection.accent }}
                    >
                        {collection.verdict}
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                    className={cn(reversed && 'lg:order-1')}
                >
                    <div className="rounded-3xl border border-border/40 bg-background/60 p-6 backdrop-blur-sm sm:p-8 dark:border-border/50 dark:bg-background/30">
                        <CollectionShelf collection={collection} />
                    </div>
                </motion.div>
            </div>
        </article>
    );
}

export default function Textbooks() {
    return (
        <>
            <Head title="Les manuels A1 → B2" />

            <section className="relative overflow-hidden pt-16 pb-16 md:pt-24 md:pb-20">
                <div
                    className="pointer-events-none absolute inset-0 overflow-hidden"
                    aria-hidden="true"
                >
                    <div className="absolute top-0 right-1/4 h-[420px] w-[420px] rounded-full bg-primary/[0.04] blur-[150px] dark:bg-primary/[0.07]" />
                    <div className="absolute bottom-0 left-1/4 h-[360px] w-[360px] rounded-full bg-foreground/[0.025] blur-[130px] dark:bg-foreground/[0.05]" />
                </div>

                <div className="relative mx-auto max-w-7xl px-6 md:px-8 lg:px-12">
                    <motion.div
                        initial={{ opacity: 0, y: 24 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7 }}
                        className="mx-auto max-w-4xl text-center"
                    >
                        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border/40 bg-secondary px-4 py-2 text-xs font-semibold tracking-[0.25em] text-secondary-foreground uppercase backdrop-blur dark:border-border/60 dark:bg-secondary">
                            Les manuels
                        </div>

                        <h1 className="mb-5 text-4xl font-semibold tracking-tight text-foreground md:text-5xl lg:text-6xl">
                            Quatre livres pour aller de{' '}
                            <span className="text-primary">A1 à B2.</span>
                        </h1>

                        <p className="mx-auto max-w-2xl text-base text-foreground/60 md:text-lg">
                            Menschen pour poser les bases de A1 à B1, Sicher!
                            pour viser la précision au B2. Les deux autres
                            collections ? On les a feuilletées, comparées, et on
                            te dit exactement ce qu’elles valent.
                        </p>

                        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                            <Button
                                size="lg"
                                className="group gap-2 rounded-full"
                                asChild
                            >
                                <a href="#selection">
                                    Voir la sélection
                                    <ArrowDown
                                        className="h-4 w-4 transition-transform group-hover:translate-y-0.5"
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
                                <a href="#comparatif">
                                    Comparer les collections
                                </a>
                            </Button>
                        </div>
                    </motion.div>

                    <HeroShelf />
                </div>
            </section>

            <section className="relative border-y border-border/30 bg-muted/20 py-10 dark:bg-foreground/[0.02]">
                <div className="mx-auto max-w-4xl px-6 md:px-8">
                    <motion.blockquote
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="border-l-2 border-primary/30 pl-6 md:pl-8"
                    >
                        <p className="font-display text-xl leading-relaxed text-foreground/80 md:text-2xl">
                            « Une méthode n’est pas une religion. On garde ce
                            qui marche à chaque étape, et on change quand la
                            marche suivante demande autre chose. »
                        </p>
                        <footer className="mt-4 font-mono text-[11px] tracking-[0.2em] text-foreground/40 uppercase">
                            La sélection VéninCorsé
                        </footer>
                    </motion.blockquote>
                </div>
            </section>

            <section
                id="selection"
                className="relative scroll-mt-24 py-20 md:py-28"
            >
                <div className="relative mx-auto max-w-7xl px-6 md:px-8 lg:px-12">
                    <div className="mb-10 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
                        <SectionHeading
                            eyebrow="La sélection"
                            title="Quatre marches, deux collections."
                            description="Le parcours principal tient sur quatre volumes. On change de collection au B2, quand l’objectif passe de « se débrouiller » à « structurer »."
                        />

                        <p className="shrink-0 rounded-full border border-border/40 bg-background/60 px-4 py-2 font-mono text-xs text-foreground/50 backdrop-blur-sm dark:border-border/50 dark:bg-background/40">
                            Menschen A1 → B1 · Sicher! B2
                        </p>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                        {textbookPicks.map((pick, index) => {
                            const collection = getTextbookCollection(
                                pick.collection,
                            );
                            const volume = getTextbookVolume(
                                collection,
                                pick.volumeLevel,
                            );

                            return (
                                <motion.article
                                    key={pick.level}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{
                                        duration: 0.5,
                                        delay: index * 0.06,
                                    }}
                                    style={collectionAccentStyle(collection)}
                                    className="group relative flex flex-col rounded-2xl border border-border/40 bg-background/70 p-5 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-border/70 hover:shadow-lg dark:border-border/50 dark:bg-background/40"
                                >
                                    <span
                                        className="absolute inset-x-5 top-0 h-0.5 rounded-full"
                                        style={{
                                            backgroundColor: collection.accent,
                                        }}
                                        aria-hidden="true"
                                    />

                                    <div className="flex items-baseline justify-between gap-3">
                                        <span className="collection-accent-text font-display text-4xl font-semibold">
                                            {pick.level.toUpperCase()}
                                        </span>
                                        <span className="font-mono text-[10px] tracking-[0.14em] text-foreground/40 uppercase">
                                            {collection.name}
                                        </span>
                                    </div>

                                    <div className="mx-auto my-6 w-[62%] max-w-[190px]">
                                        <Book3D
                                            cover={volume.cover}
                                            title={volume.title}
                                            accent={collection.accent}
                                            ratio={volume.ratio}
                                            lean={index % 2 === 0 ? -2 : 2}
                                        />
                                    </div>

                                    <h3 className="text-base font-semibold text-foreground">
                                        {pick.headline}
                                    </h3>

                                    <p className="mt-2 text-sm leading-relaxed text-foreground/60">
                                        {pick.description}
                                    </p>

                                    <ul className="mt-4 space-y-2">
                                        {pick.points.map((point) => (
                                            <li
                                                key={point}
                                                className="flex gap-2 text-xs leading-relaxed text-foreground/60"
                                            >
                                                <Check
                                                    className="collection-accent-text mt-0.5 h-3.5 w-3.5 shrink-0"
                                                    aria-hidden="true"
                                                />
                                                {point}
                                            </li>
                                        ))}
                                    </ul>

                                    <Link
                                        href={`/courses/${pick.level}`}
                                        className="mt-auto inline-flex items-center gap-2 pt-6 text-sm font-semibold text-primary transition-colors hover:text-primary/80"
                                    >
                                        Voir le parcours{' '}
                                        {pick.level.toUpperCase()}
                                        <ArrowRight
                                            className="h-4 w-4 transition-transform group-hover:translate-x-1"
                                            aria-hidden="true"
                                        />
                                    </Link>
                                </motion.article>
                            );
                        })}
                    </div>

                    <div className="mt-6 flex flex-col gap-5 rounded-2xl border border-dashed border-border/60 bg-muted/20 p-5 sm:flex-row sm:items-center">
                        <div className="w-16 shrink-0 sm:w-20">
                            <Book3D
                                cover={
                                    getTextbookVolume(
                                        getTextbookCollection('sicher'),
                                        'B1+',
                                    ).cover
                                }
                                title="Sicher! B1+"
                                accent={getTextbookCollection('sicher').accent}
                                ratio={1.333}
                                lean={-3}
                                decorative
                            />
                        </div>

                        <div className="flex-1">
                            <p className="font-mono text-[10px] tracking-[0.2em] text-foreground/40 uppercase">
                                La passerelle
                            </p>
                            <h3 className="mt-1 text-base font-semibold text-foreground">
                                Et si le B1 est encore fragile ?
                            </h3>
                            <p className="mt-1 text-sm leading-relaxed text-foreground/60">
                                On ajoute Sicher! B1+ avant le B2 : un volume de
                                transition pour consolider les acquis sans
                                refaire tout le B1. La décision se prend
                                ensemble, après le test de niveau.
                            </p>
                        </div>

                        <Button
                            variant="outline"
                            size="sm"
                            className="shrink-0 rounded-full border-border/50 bg-background/60"
                            asChild
                        >
                            <Link href="/level-test">Évaluer mon niveau</Link>
                        </Button>
                    </div>
                </div>
            </section>

            <section
                id="collections"
                className="relative scroll-mt-24 border-y border-border/30 bg-muted/20 py-20 md:py-28 dark:bg-foreground/[0.02]"
            >
                <div className="relative mx-auto max-w-7xl px-6 md:px-8 lg:px-12">
                    <SectionHeading
                        eyebrow="Les collections"
                        title="Quatre séries, quatre tempéraments."
                        description="Deux sont au cœur de nos parcours, deux sont nos alternatives. Voici ce qu’elles font bien, ce qu’elles font moins bien, et pour qui."
                        align="center"
                        className="mb-16"
                    />

                    <div className="space-y-20 md:space-y-28">
                        {textbookCollections.map((collection, index) => (
                            <CollectionSection
                                key={collection.slug}
                                collection={collection}
                                reversed={index % 2 === 1}
                            />
                        ))}
                    </div>
                </div>
            </section>

            <section
                id="comparatif"
                className="relative scroll-mt-24 py-20 md:py-28"
            >
                <div className="relative mx-auto max-w-7xl px-6 md:px-8 lg:px-12">
                    <SectionHeading
                        eyebrow="Le comparatif"
                        title="Quatre collections, un seul objectif."
                        description="Les mêmes critères pour toutes les séries : ce qu’elles couvrent, comment elles travaillent, et la place qu’elles occupent chez nous."
                        align="center"
                        className="mb-12"
                    />

                    <div className="hidden overflow-hidden rounded-3xl border border-border/40 bg-background/60 backdrop-blur-sm lg:block dark:border-border/50 dark:bg-background/30">
                        <table className="w-full table-fixed border-collapse text-left">
                            <caption className="sr-only">
                                Comparatif des collections de manuels d’allemand
                            </caption>

                            <thead>
                                <tr className="border-b border-border/40">
                                    <th
                                        scope="col"
                                        className="w-[16%] p-5 align-bottom text-xs font-semibold tracking-[0.16em] text-foreground/40 uppercase"
                                    >
                                        Critère
                                    </th>

                                    {textbookCollections.map((collection) => (
                                        <th
                                            key={collection.slug}
                                            scope="col"
                                            className="border-l border-border/30 p-5 align-top"
                                        >
                                            <span className="flex items-center gap-2">
                                                <span
                                                    className="h-2 w-2 shrink-0 rounded-full"
                                                    style={{
                                                        backgroundColor:
                                                            collection.accent,
                                                    }}
                                                    aria-hidden="true"
                                                />
                                                <span className="font-display text-lg font-semibold text-foreground">
                                                    {collection.name}
                                                </span>
                                            </span>
                                            <span className="mt-1 block text-xs text-foreground/40">
                                                {collection.publisher}
                                            </span>
                                            <span className="mt-2 block">
                                                <CollectionBadge
                                                    collection={collection}
                                                />
                                            </span>
                                        </th>
                                    ))}
                                </tr>
                            </thead>

                            <tbody>
                                {comparisonRows.map((row, rowIndex) => (
                                    <tr
                                        key={row.label}
                                        className={cn(
                                            'border-b border-border/30 last:border-0',
                                            rowIndex % 2 === 1 && 'bg-muted/20',
                                        )}
                                    >
                                        <th
                                            scope="row"
                                            className="p-5 align-top text-xs font-semibold tracking-[0.16em] text-foreground/40 uppercase"
                                        >
                                            {row.label}
                                        </th>

                                        {textbookCollections.map(
                                            (collection) => (
                                                <td
                                                    key={collection.slug}
                                                    className={cn(
                                                        'border-l border-border/30 p-5 align-top text-sm leading-relaxed text-foreground/65',
                                                        row.emphasis &&
                                                            'font-medium text-foreground',
                                                    )}
                                                >
                                                    {row.value(collection)}
                                                </td>
                                            ),
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2 lg:hidden">
                        {textbookCollections.map((collection) => (
                            <article
                                key={collection.slug}
                                className="rounded-2xl border border-border/40 bg-background/60 p-5 backdrop-blur-sm dark:border-border/50 dark:bg-background/30"
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span
                                                className="h-2 w-2 shrink-0 rounded-full"
                                                style={{
                                                    backgroundColor:
                                                        collection.accent,
                                                }}
                                                aria-hidden="true"
                                            />
                                            <h3 className="font-display text-lg font-semibold text-foreground">
                                                {collection.name}
                                            </h3>
                                        </div>
                                        <p className="mt-0.5 text-xs text-foreground/40">
                                            {collection.publisher}
                                        </p>
                                    </div>

                                    <CollectionBadge collection={collection} />
                                </div>

                                <dl className="mt-5 space-y-3">
                                    {comparisonRows.map((row) => (
                                        <div key={row.label}>
                                            <dt className="font-mono text-[10px] tracking-[0.16em] text-foreground/40 uppercase">
                                                {row.label}
                                            </dt>
                                            <dd
                                                className={cn(
                                                    'mt-0.5 text-sm leading-relaxed text-foreground/65',
                                                    row.emphasis &&
                                                        'font-medium text-foreground',
                                                )}
                                            >
                                                {row.value(collection)}
                                            </dd>
                                        </div>
                                    ))}
                                </dl>
                            </article>
                        ))}
                    </div>

                    <p className="mx-auto mt-8 max-w-3xl text-center text-xs leading-relaxed text-foreground/35">
                        Couvertures : © Hueber Verlag (Menschen, Sicher!), Klett
                        Sprachen (Netzwerk neu), Cornelsen Verlag (Studio [21]).
                        Images présentées à titre de référence ; les manuels
                        restent la propriété de leurs éditeurs.
                    </p>
                </div>
            </section>

            <CtaBand
                eyebrow="Pour finir"
                title="Le test te dit par où commencer."
                description="Dix minutes pour situer ton niveau de A1 à B2, puis une heure d’essai pour confirmer à l’oral. On choisit ensuite le volume — et la passerelle B1+ si elle est utile."
                primary={{
                    label: 'Tester mon niveau',
                    href: '/level-test',
                }}
                secondary={{
                    label: 'Réserver un cours d’essai',
                    href: '/trial',
                }}
            />
        </>
    );
}
