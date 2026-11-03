import { motion, type Variants } from 'framer-motion'
import { ArrowRight, Clock } from 'lucide-react'
import { Link } from '@inertiajs/react'
import type { Article } from '../blog-data'

export const cardVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: 'easeOut' } },
}

export function ArticleCard({ article }: { article: Article }) {
  return (
    <motion.article variants={cardVariants} className="group cursor-pointer">
      {/* image with grayscale on idle */}
      <div className="mb-7 aspect-video overflow-hidden rounded-xl border border-border/30 bg-muted/40">
        <img
          src={article.image}
          alt={article.titre}
          className="h-full w-full object-cover grayscale transition-all duration-500 group-hover:grayscale-0 group-hover:scale-105"
        />
      </div>

      {/* categories */}
      <div className="mb-4 flex flex-wrap gap-2">
        {article.categories.map((cat) => (
          <span
            key={cat}
            className="rounded-sm border border-border/40 bg-background/80 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-foreground/50"
          >
            {cat}
          </span>
        ))}
      </div>

      {/* titre */}
      <h3 className="mb-3 text-base font-semibold leading-snug text-foreground transition-colors group-hover:text-primary">
        {article.titre}
      </h3>

      {/* description */}
      <p className="mb-6 line-clamp-2 text-sm leading-relaxed text-foreground/55">
        {article.description}
      </p>

      {/* footer */}
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-1.5 text-xs text-primary">
          <Clock className="h-3 w-3" />
          {article.duree}
        </span>
        <Link
          href={`/blog/${article.slug}`}
          className="flex items-center gap-1 text-xs font-bold uppercase tracking-[0.15em] text-foreground/60 transition-all group-hover:gap-2 group-hover:text-foreground"
        >
          Découvrir
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
    </motion.article>
  )
}
