import { motion } from 'framer-motion';
import { ArrowRight, Clock } from 'reicon-react';
import { Link } from '@inertiajs/react';
import type { Article } from '../blog-data';
import { Button } from '@/components/ui/button';

export function FeaturedArticle({ article }: { article: Article }) {
    return (
        <motion.section
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="relative mb-20 h-[70vh] min-h-[480px] overflow-hidden rounded-2xl"
        >
            {/* image de fond */}
            <img
                src={article.image}
                alt={article.title}
                className="absolute inset-0 h-full w-full object-cover"
            />

            {/* gradients */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-transparent to-transparent" />

            {/* badge à la une */}
            <div className="absolute top-7 left-7">
                <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-[11px] font-bold tracking-[0.2em] text-white/90 uppercase backdrop-blur">
                    À la une — {article.categories[0]}
                </span>
            </div>

            {/* contenu bas */}
            <div className="absolute inset-x-0 bottom-0 p-8 md:p-12">
                <div className="max-w-2xl">
                    <h1 className="mb-4 text-2xl leading-snug font-semibold tracking-tight text-white md:text-4xl lg:text-5xl">
                        {article.title}
                    </h1>
                    <p className="mb-8 max-w-xl leading-relaxed text-white/65 md:text-lg">
                        {article.description}
                    </p>
                    <div className="flex items-center gap-5">
                        <Button
                            size="lg"
                            className="gap-2 rounded-full bg-white px-7 text-black hover:bg-white/90"
                            asChild
                        >
                            <Link href={`/blog/${article.slug}`}>
                                Lire l'article
                                <ArrowRight className="h-4 w-4" />
                            </Link>
                        </Button>
                        <span className="flex items-center gap-1.5 text-sm text-white/45">
                            <Clock className="h-3.5 w-3.5" />
                            {article.duration} de lecture
                        </span>
                    </div>
                </div>
            </div>
        </motion.section>
    );
}
