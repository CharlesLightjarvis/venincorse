import { Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'reicon-react';
import { Button } from '@/components/ui/button';

type CtaAction = {
    label: string;
    href: string;
};

type CtaBandProps = {
    eyebrow?: string;
    title: string;
    description: string;
    primary: CtaAction;
    secondary?: CtaAction;
};

export function CtaBand({
    eyebrow,
    title,
    description,
    primary,
    secondary,
}: CtaBandProps) {
    return (
        <section className="relative py-16 md:py-24">
            <div className="relative mx-auto max-w-7xl px-6 md:px-8 lg:px-12">
                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.7 }}
                    className="relative overflow-hidden rounded-3xl border border-border/40 bg-muted/30 p-8 md:p-12 dark:border-border/50 dark:bg-foreground/[0.02]"
                >
                    <div className="pointer-events-none absolute inset-0 overflow-hidden">
                        <div className="absolute -top-24 right-10 h-64 w-64 rounded-full bg-primary/[0.07] blur-[110px] dark:bg-primary/[0.1]" />
                        <div className="absolute -bottom-24 left-10 h-56 w-56 rounded-full bg-foreground/[0.03] blur-[100px] dark:bg-foreground/[0.05]" />
                    </div>

                    <div className="relative flex flex-col items-start justify-between gap-8 md:flex-row md:items-center">
                        <div className="max-w-xl">
                            {eyebrow ? (
                                <p className="mb-3 text-[11px] font-bold tracking-[0.22em] text-primary uppercase">
                                    {eyebrow}
                                </p>
                            ) : null}

                            <h2 className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
                                {title}
                            </h2>

                            <p className="mt-3 text-foreground/60">
                                {description}
                            </p>
                        </div>

                        <div className="flex shrink-0 flex-col gap-3 sm:flex-row">
                            <Button
                                size="lg"
                                className="group gap-2 rounded-full"
                                asChild
                            >
                                <Link href={primary.href}>
                                    {primary.label}
                                    <ArrowRight
                                        className="h-4 w-4 transition-transform group-hover:translate-x-1"
                                        aria-hidden="true"
                                    />
                                </Link>
                            </Button>

                            {secondary ? (
                                <Button
                                    size="lg"
                                    variant="outline"
                                    className="rounded-full border-border/50 bg-background/60 backdrop-blur-sm"
                                    asChild
                                >
                                    <Link href={secondary.href}>
                                        {secondary.label}
                                    </Link>
                                </Button>
                            ) : null}
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
