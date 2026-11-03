import { motion } from 'framer-motion';
import { MapPin } from 'lucide-react';
import type { ReactNode } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export interface OfferCardChip {
    value: string;
    label: string;
}

export function OfferCard({
    image,
    alt,
    badge,
    chip,
    flag,
    room = '100 % en visio',
    index = 0,
    className,
    children,
}: {
    image: string;
    alt: string;
    badge: { label: string; className?: string };
    chip?: OfferCardChip;
    flag?: string;
    room?: string;
    index?: number;
    className?: string;
    children: ReactNode;
}) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, ease: 'easeOut', delay: index * 0.06 }}
        >
            <Card
                className={cn(
                    'group gap-0 flex h-full flex-col overflow-hidden rounded-xl p-0 border-border/40 bg-background/60 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-border/60 hover:shadow-lg dark:border-border/50 dark:bg-background/50',
                    className,
                )}
            >
                {/* Image */}
                <div className="relative h-52 shrink-0 overflow-hidden">
                    <img
                        src={image}
                        alt={alt}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

                    {/* Type badge */}
                    <div className="absolute top-4 left-4 flex items-start gap-2">
                        <Badge
                            variant="secondary"
                            className={cn(
                                'border-white/20 bg-white/10 font-mono text-white backdrop-blur hover:bg-white/20',
                                badge.className,
                            )}
                        >
                            {badge.label}
                        </Badge>

                        {flag ? (
                            <Badge
                                variant="secondary"
                                className="border-white/20 bg-white/10 text-[10px] font-semibold text-white uppercase tracking-wider backdrop-blur hover:bg-white/20"
                            >
                                {flag}
                            </Badge>
                        ) : null}
                    </div>

                    {/* Date-like chip block */}
                    {chip ? (
                        <div className="absolute top-4 right-4 flex flex-col items-center rounded-xl border border-white/20 bg-black/30 px-2.5 py-1.5 text-center backdrop-blur">
                            <span className="font-mono text-lg leading-none font-bold text-white">
                                {chip.value}
                            </span>
                            <span className="mt-0.5 text-[10px] font-semibold tracking-wider text-white/70 uppercase">
                                {chip.label}
                            </span>
                        </div>
                    ) : null}

                    {/* Format */}
                    <div className="absolute bottom-3 left-4 flex items-center gap-1.5 text-xs text-white/80">
                        <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
                        {room}
                    </div>
                </div>

                <CardContent className="flex flex-1 flex-col p-5">
                    {children}
                </CardContent>
            </Card>
        </motion.div>
    );
}
