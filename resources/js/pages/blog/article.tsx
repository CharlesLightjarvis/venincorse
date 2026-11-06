import { motion } from 'framer-motion';
import {
    ArrowLeft,
    ArrowRight,
    ArrowUpRight,
    CalendarDays,
    Check,
    Clock,
} from 'reicon-react';
import { Head, Link, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import {
    allArticles,
    relatedCourses,
    trendingArticles,
    type Article,
} from './blog-data';
import { formatPrice, getLevel } from '@/data/offer';

const related = (article: Article) =>
    getLevel(relatedCourses[article.categories[0]]);

const trending = (current: Article) =>
    trendingArticles
        .filter((t) => t.id !== current.id)
        .map((t) => allArticles.find((a) => a.id === t.id))
        .filter((a): a is Article => Boolean(a));

export default function BlogArticle() {
    const slug = usePage().url.split('/').filter(Boolean).pop();
    const article = allArticles.find((a) => a.slug === slug) ?? allArticles[0];
    const course = related(article);
    const others = trending(article);

    return (
        <div className="relative min-h-screen">
            <Head title={article.title} />
            {/* blob décoratif */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <div className="absolute top-0 left-1/2 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-primary/[0.03] blur-[160px] dark:bg-primary/[0.06]" />
            </div>

            <div className="relative mx-auto max-w-6xl px-4 py-12 md:px-6 lg:px-8">
                {/* ── Fil d'ariane ─────────────────────────────────────── */}
                <nav className="mb-10 flex items-center gap-1.5 text-xs text-foreground/40">
                    <Link
                        href="/blog"
                        className="font-medium transition-colors hover:text-foreground"
                    >
                        Blog
                    </Link>
                    <span className="text-foreground/25">/</span>
                    <span className="uppercase">{article.categories[0]}</span>
                    <span className="text-foreground/25">/</span>
                    <span className="hidden truncate sm:inline">
                        {article.title}
                    </span>
                </nav>

                <div className="flex flex-col gap-14 lg:flex-row lg:items-start">
                    {/* ── Corps de l'article ──────────────────────────────── */}
                    <main className="min-w-0 flex-1">
                        {/* en-tête */}
                        <motion.header
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                        >
                            <div className="mb-5 flex flex-wrap gap-2">
                                {article.categories.map((cat) => (
                                    <span
                                        key={cat}
                                        className="rounded-sm border border-border/40 bg-background/80 px-2 py-1 text-[10px] font-bold tracking-wider text-foreground/50 uppercase"
                                    >
                                        {cat}
                                    </span>
                                ))}
                            </div>
                            <h1 className="mb-6 text-3xl leading-snug font-semibold tracking-tight text-foreground md:text-4xl lg:text-5xl">
                                {article.title}
                            </h1>
                            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-b border-border/30 pb-10 text-sm text-foreground/45">
                                <span className="flex items-center gap-1.5">
                                    <CalendarDays className="h-3.5 w-3.5" />
                                    {article.date}
                                </span>
                                <span className="flex items-center gap-1.5">
                                    <Clock className="h-3.5 w-3.5" />
                                    {article.duration} de lecture
                                </span>
                                <span>Par le prof de VéninCorsé</span>
                            </div>
                        </motion.header>

                        {/* image pleine largeur */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.55, delay: 0.1 }}
                            className="my-10 aspect-video overflow-hidden rounded-2xl border border-border/30 bg-muted/40"
                        >
                            <img
                                src={article.image}
                                alt={article.title}
                                className="h-full w-full object-cover"
                            />
                        </motion.div>

                        {/* chapô */}
                        <p className="mb-14 text-lg leading-relaxed text-foreground/70">
                            {article.content?.intro ?? article.description}
                        </p>

                        {/* sections */}
                        <div className="space-y-14">
                            {article.content?.sections.map((section, i) => (
                                <motion.section
                                    key={section.title}
                                    initial={{ opacity: 0, y: 24 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true, margin: '-60px' }}
                                    transition={{ duration: 0.5 }}
                                >
                                    <div className="mb-4 flex items-baseline gap-4">
                                        <span className="text-sm font-bold tracking-[0.2em] text-primary">
                                            {String(i + 1).padStart(2, '0')}
                                        </span>
                                        <h2 className="text-xl font-semibold tracking-tight text-foreground md:text-2xl">
                                            {section.title}
                                        </h2>
                                    </div>
                                    <div className="space-y-3 leading-relaxed text-foreground/60">
                                        {section.text.map((p, j) => (
                                            <p key={j}>{p}</p>
                                        ))}
                                    </div>
                                    {section.points && (
                                        <ul className="mt-5 space-y-2.5">
                                            {section.points.map((point) => (
                                                <li
                                                    key={point}
                                                    className="flex items-start gap-2.5 text-sm text-foreground/70"
                                                >
                                                    <span className="mt-0.5 flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-full bg-primary/10">
                                                        <Check className="h-3 w-3 text-primary" />
                                                    </span>
                                                    {point}
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </motion.section>
                            ))}
                        </div>

                        {/* cours lié */}
                        {course && (
                            <motion.div
                                initial={{ opacity: 0, y: 24 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: '-60px' }}
                                transition={{ duration: 0.5 }}
                                className="mt-16 flex flex-col items-start gap-4 rounded-2xl border border-primary/25 bg-primary/[0.04] p-6 md:flex-row md:items-center md:justify-between md:p-8 dark:border-primary/20 dark:bg-primary/[0.06]"
                            >
                                <div>
                                    <p className="mb-1 text-[11px] font-bold tracking-[0.2em] text-primary uppercase">
                                        Va plus loin
                                    </p>
                                    <p className="text-lg font-semibold text-foreground">
                                        Parcours {course.code} — {course.name}
                                    </p>
                                    <p className="mt-0.5 text-sm text-foreground/50">
                                        Dès {formatPrice(course.price.group)} ·
                                        60 h par niveau
                                    </p>
                                </div>
                                <Button
                                    className="shrink-0 gap-2 rounded-full"
                                    asChild
                                >
                                    <Link href={`/courses/${course.slug}`}>
                                        Voir le parcours
                                        <ArrowRight className="h-4 w-4" />
                                    </Link>
                                </Button>
                            </motion.div>
                        )}

                        {/* retour blog */}
                        <div className="mt-14 flex justify-center">
                            <Button
                                variant="outline"
                                className="gap-2 rounded-full border-border/40 bg-background/60 backdrop-blur-sm"
                                asChild
                            >
                                <Link href="/blog">
                                    <ArrowLeft className="h-4 w-4" />
                                    Tous les articles
                                </Link>
                            </Button>
                        </div>
                    </main>

                    {/* ── Aside sticky ────────────────────────────────────── */}
                    <aside className="shrink-0 self-start lg:sticky lg:top-24 lg:w-60 xl:w-72">
                        {course && (
                            <div className="mb-8 rounded-2xl border border-border/40 bg-background/80 p-5 backdrop-blur-sm">
                                <p className="mb-3 flex items-center justify-between text-[10px] font-bold tracking-[0.2em] text-foreground/35 uppercase">
                                    Parcours lié
                                    <ArrowUpRight className="h-3 w-3 text-primary" />
                                </p>
                                <p className="mb-1 text-sm leading-snug font-semibold text-foreground">
                                    Parcours {course.code} — {course.name}
                                </p>
                                <p className="mb-4 text-xs text-foreground/45">
                                    Dès {formatPrice(course.price.group)} · 60 h
                                    par niveau
                                </p>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="w-full rounded-full border-border/40"
                                    asChild
                                >
                                    <Link href={`/courses/${course.slug}`}>
                                        Voir le parcours
                                    </Link>
                                </Button>
                            </div>
                        )}

                        {others.length > 0 && (
                            <div className="border-t border-border/30 pt-8">
                                <p className="mb-5 text-[10px] font-bold tracking-[0.2em] text-foreground/35 uppercase">
                                    Tendances
                                </p>
                                <div className="space-y-6">
                                    {others.map((other, i) => (
                                        <Link
                                            key={other.id}
                                            href={`/blog/${other.slug}`}
                                            className="group flex items-start gap-3.5"
                                        >
                                            <span className="text-xs font-bold tracking-widest text-primary/70">
                                                {String(i + 1).padStart(2, '0')}
                                            </span>
                                            <span className="min-w-0">
                                                <span className="mb-1 block text-[10px] font-bold tracking-[0.15em] text-foreground/35 uppercase">
                                                    {other.categories[0]}
                                                </span>
                                                <span className="block text-sm leading-snug font-semibold text-foreground/80 transition-colors group-hover:text-primary">
                                                    {other.title}
                                                </span>
                                            </span>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}
                    </aside>
                </div>
            </div>
        </div>
    );
}
