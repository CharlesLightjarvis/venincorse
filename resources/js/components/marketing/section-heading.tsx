import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

type SectionHeadingProps = {
    eyebrow?: string;
    title: string;
    description?: string;
    align?: 'left' | 'center';
    className?: string;
};

export function SectionHeading({
    eyebrow,
    title,
    description,
    align = 'left',
    className,
}: SectionHeadingProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className={cn(
                'max-w-2xl',
                align === 'center' && 'mx-auto text-center',
                className,
            )}
        >
            {eyebrow ? (
                <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-border/40 bg-secondary px-4 py-2 text-xs font-semibold tracking-[0.25em] text-secondary-foreground uppercase backdrop-blur dark:border-border/60 dark:bg-secondary">
                    {eyebrow}
                </div>
            ) : null}

            <h2 className="mb-4 text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
                {title}
            </h2>

            {description ? (
                <p className="text-base text-foreground/60 md:text-lg">
                    {description}
                </p>
            ) : null}
        </motion.div>
    );
}
