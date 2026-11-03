import { Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatPrice, type ParcoursLevel } from '@/data/offer';

type LevelCardProps = {
    level: ParcoursLevel;
    index?: number;
};

export function LevelCard({ level, index = 0 }: LevelCardProps) {
    const Icon = level.icon;

    return (
        <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55, delay: index * 0.07 }}
            className="h-full"
        >
            <Link
                href={`/courses/${level.slug}`}
                className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-border/40 bg-card p-6 transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-sm dark:border-border/50"
            >
                <div
                    className={cn(
                        'pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b opacity-80',
                        level.accent.gradient,
                    )}
                    aria-hidden="true"
                />

                <div className="relative flex items-center justify-between gap-3">
                    <span
                        className={cn(
                            'inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold',
                            level.accent.bg,
                            level.accent.text,
                        )}
                    >
                        <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                        Niveau {level.code}
                    </span>

                    <span className="font-mono text-xs text-foreground/50">
                        {level.hours} h
                    </span>
                </div>

                <h3 className="relative mt-5 text-2xl font-semibold tracking-tight text-foreground">
                    {level.name}
                </h3>

                <p className="relative mt-1.5 text-sm leading-relaxed text-foreground/60">
                    {level.tagline}
                </p>

                <div className="relative mt-5 flex flex-wrap gap-2">
                    {level.subLevels.map((subLevel) => (
                        <span
                            key={subLevel.code}
                            className="rounded-full border border-border/50 bg-background/60 px-2.5 py-1 font-mono text-[11px] font-medium text-foreground/60 dark:border-border/60 dark:bg-background/30"
                        >
                            {subLevel.code}
                        </span>
                    ))}
                </div>

                <div className="relative mt-auto flex items-end justify-between gap-4 border-t border-border/30 pt-5">
                    <div>
                        <p className="text-[10px] font-semibold tracking-[0.2em] text-foreground/40 uppercase">
                            Dès
                        </p>
                        <p className="font-mono text-xl font-semibold text-foreground">
                            {formatPrice(level.price.group)}
                        </p>
                        <p className="text-xs text-foreground/50">
                            en groupe · 60 h
                        </p>
                    </div>

                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border/50 text-foreground/60 transition-colors group-hover:border-primary group-hover:bg-primary group-hover:text-primary-foreground">
                        <ArrowRight
                            className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                            aria-hidden="true"
                        />
                    </span>
                </div>
            </Link>
        </motion.div>
    );
}
