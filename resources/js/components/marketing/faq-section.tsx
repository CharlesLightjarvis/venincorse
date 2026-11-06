import { AnimatePresence, motion } from 'framer-motion';
import { Plus } from 'reicon-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import type { FaqItem } from '@/data/offer';

type FaqSectionProps = {
    items: FaqItem[];
    eyebrow?: string;
    title?: string;
    description?: string;
    className?: string;
};

export function FaqSection({
    items,
    eyebrow = 'Questions fréquentes',
    title = 'Avant de réserver, tout doit être clair',
    description,
    className,
}: FaqSectionProps) {
    const [open, setOpen] = useState<number | null>(0);

    return (
        <section
            className={cn(
                'relative overflow-hidden bg-muted/30 py-20 md:py-28 dark:bg-foreground/[0.02]',
                className,
            )}
        >
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <div className="absolute bottom-0 left-1/2 h-[380px] w-[380px] -translate-x-1/2 rounded-full bg-foreground/[0.02] blur-[130px] dark:bg-foreground/[0.04]" />
            </div>

            <div className="relative mx-auto max-w-3xl px-6 md:px-8 lg:px-12">
                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.7 }}
                    className="mb-12 text-center"
                >
                    <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-border/40 bg-secondary px-4 py-2 text-xs font-semibold tracking-[0.25em] text-secondary-foreground uppercase backdrop-blur dark:border-border/60 dark:bg-secondary">
                        {eyebrow}
                    </div>

                    <h2 className="text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
                        {title}
                    </h2>

                    {description ? (
                        <p className="mx-auto mt-4 max-w-xl text-foreground/60">
                            {description}
                        </p>
                    ) : null}
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                    className="flex flex-col gap-3"
                >
                    {items.map((item, index) => {
                        const isOpen = open === index;

                        return (
                            <div
                                key={item.question}
                                className="overflow-hidden rounded-2xl border border-border/40 bg-background/60 backdrop-blur-sm dark:border-border/50 dark:bg-background/50"
                            >
                                <button
                                    type="button"
                                    onClick={() =>
                                        setOpen(isOpen ? null : index)
                                    }
                                    className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
                                    aria-expanded={isOpen}
                                >
                                    <span className="text-sm font-semibold text-foreground md:text-base">
                                        {item.question}
                                    </span>

                                    <span
                                        className={cn(
                                            'flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-border/40 bg-background/60 text-foreground/60 transition-transform duration-300 dark:border-border/50 dark:bg-background/40',
                                            isOpen && 'rotate-45',
                                        )}
                                        aria-hidden="true"
                                    >
                                        <Plus className="h-4 w-4" />
                                    </span>
                                </button>

                                <AnimatePresence initial={false}>
                                    {isOpen ? (
                                        <motion.div
                                            key="content"
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{
                                                height: 'auto',
                                                opacity: 1,
                                            }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{
                                                duration: 0.3,
                                                ease: 'easeInOut',
                                            }}
                                        >
                                            <div className="border-t border-border/30 px-6 pt-4 pb-5 text-sm leading-relaxed text-foreground/60">
                                                {item.answer}
                                            </div>
                                        </motion.div>
                                    ) : null}
                                </AnimatePresence>
                            </div>
                        );
                    })}
                </motion.div>
            </div>
        </section>
    );
}
