import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

type PageHeroProps = {
    eyebrow: string;
    title: ReactNode;
    description: string;
    children?: ReactNode;
    className?: string;
};

export function PageHero({
    eyebrow,
    title,
    description,
    children,
    className,
}: PageHeroProps) {
    return (
        <section
            className={cn(
                'relative overflow-hidden pt-16 pb-14 md:pt-24 md:pb-20',
                className,
            )}
        >
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <div className="absolute top-0 right-1/4 h-[420px] w-[420px] rounded-full bg-primary/[0.04] blur-[150px] dark:bg-primary/[0.07]" />
                <div className="absolute bottom-0 left-1/4 h-[360px] w-[360px] rounded-full bg-foreground/[0.025] blur-[130px] dark:bg-foreground/[0.05]" />
            </div>

            <div className="relative mx-auto max-w-7xl px-6 md:px-8 lg:px-12">
                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7 }}
                    className="mx-auto max-w-3xl text-center"
                >
                    <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border/40 bg-secondary px-4 py-2 text-xs font-semibold tracking-[0.25em] text-secondary-foreground uppercase backdrop-blur dark:border-border/60 dark:bg-secondary">
                        {eyebrow}
                    </div>

                    <h1 className="mb-5 text-3xl font-semibold tracking-tight text-foreground md:text-5xl lg:text-6xl">
                        {title}
                    </h1>

                    <p className="mx-auto max-w-2xl text-base text-foreground/60 md:text-lg">
                        {description}
                    </p>

                    {children ? (
                        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                            {children}
                        </div>
                    ) : null}
                </motion.div>
            </div>
        </section>
    );
}
