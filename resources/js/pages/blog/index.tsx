import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Head } from '@inertiajs/react';
import { FeaturedArticle } from './partials/featured-article';
import { ArticleCard } from './partials/article-card';
import { BlogSidebar } from './partials/blog-sidebar';
import { allArticles } from './blog-data';
import { Button } from '@/components/ui/button';

const PER_PAGE = 4;

const featured = allArticles.find((a) => a.featured)!;
const rest = allArticles.filter((a) => !a.featured);

export default function Blog() {
    const [search, setSearch] = useState('');
    const [activeCategory, setActiveCategory] = useState('');
    const [page, setPage] = useState(1);

    const filtered = useMemo(() => {
        let list = rest;
        if (activeCategory)
            list = list.filter((a) => a.categories.includes(activeCategory));
        if (search.trim())
            list = list.filter(
                (a) =>
                    a.title.toLowerCase().includes(search.toLowerCase()) ||
                    a.description.toLowerCase().includes(search.toLowerCase()),
            );
        return list;
    }, [search, activeCategory]);

    const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
    const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

    const handleSearch = (v: string) => {
        setSearch(v);
        setPage(1);
    };
    const handleCategory = (cat: string) => {
        setActiveCategory(cat);
        setPage(1);
    };

    return (
        <div className="relative min-h-screen">
            <Head title="Blog" />
            {/* blob décoratif */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <div className="absolute top-0 left-1/2 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-primary/[0.03] blur-[160px] dark:bg-primary/[0.06]" />
            </div>

            <div className="relative mx-auto max-w-7xl px-4 py-14 md:px-6 lg:px-8">
                {/* ── En-tête page ─────────────────────────────────────── */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="mb-14 text-center"
                >
                    <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-border/40 bg-secondary px-4 py-2 text-xs font-semibold tracking-[0.25em] text-secondary-foreground uppercase backdrop-blur">
                        Le blog
                    </div>
                    <h1 className="text-4xl font-semibold tracking-tight text-foreground md:text-5xl">
                        Conseils d'allemand, par le prof
                    </h1>
                    <p className="mx-auto mt-4 max-w-xl text-foreground/55">
                        Des articles courts et concrets autour de la grammaire,
                        de l'oral et des examens — issus des questions des
                        élèves.
                    </p>
                </motion.div>

                {/* ── Layout deux colonnes ─────────────────────────────── */}
                <div className="flex flex-col gap-14 lg:flex-row lg:items-start">
                    {/* ── Sidebar gauche sticky ────────────────────────────── */}
                    <aside className="sticky top-20 shrink-0 self-start lg:w-64 xl:w-72">
                        <BlogSidebar
                            search={search}
                            onSearch={handleSearch}
                            activeCategory={activeCategory}
                            onCategory={handleCategory}
                        />
                    </aside>

                    {/* ── Contenu principal droite ─────────────────────────── */}
                    <div className="min-w-0 flex-1">
                        {/* Article en vedette */}
                        <FeaturedArticle article={featured} />

                        {/* Grille articles */}
                        <div className="mb-10 flex items-end justify-between border-b border-border/30 pb-4">
                            <h2 className="text-lg font-semibold text-foreground">
                                Dernières publications
                            </h2>
                            <span className="text-xs font-semibold tracking-widest text-foreground/35 uppercase">
                                {filtered.length} article
                                {filtered.length > 1 ? 's' : ''}
                            </span>
                        </div>

                        {paginated.length > 0 ? (
                            <motion.div
                                key={`${activeCategory}-${search}-${page}`}
                                initial="hidden"
                                animate="visible"
                                variants={{
                                    hidden: {},
                                    visible: {
                                        transition: { staggerChildren: 0.08 },
                                    },
                                }}
                                className="grid gap-x-10 gap-y-16 md:grid-cols-2"
                            >
                                {paginated.map((article) => (
                                    <ArticleCard
                                        key={article.id}
                                        article={article}
                                    />
                                ))}
                            </motion.div>
                        ) : (
                            <div className="flex flex-col items-center justify-center rounded-2xl border border-border/40 bg-background/60 py-20 text-center backdrop-blur-sm">
                                <p className="text-base font-medium text-foreground/50">
                                    Aucun article trouvé
                                </p>
                                <p className="mt-1 text-sm text-foreground/35">
                                    Essaie d'autres mots-clés
                                </p>
                            </div>
                        )}

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="mt-14 flex items-center justify-center gap-2">
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() =>
                                        setPage((p) => Math.max(1, p - 1))
                                    }
                                    disabled={page === 1}
                                    className="border-border/40 bg-background/60 backdrop-blur-sm"
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>
                                {Array.from(
                                    { length: totalPages },
                                    (_, i) => i + 1,
                                ).map((p) => (
                                    <Button
                                        key={p}
                                        variant={
                                            p === page ? 'default' : 'outline'
                                        }
                                        size="icon"
                                        onClick={() => setPage(p)}
                                        className={
                                            p !== page
                                                ? 'border-border/40 bg-background/60 backdrop-blur-sm'
                                                : ''
                                        }
                                    >
                                        {p}
                                    </Button>
                                ))}
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() =>
                                        setPage((p) =>
                                            Math.min(totalPages, p + 1),
                                        )
                                    }
                                    disabled={page === totalPages}
                                    className="border-border/40 bg-background/60 backdrop-blur-sm"
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
