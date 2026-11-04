import { Link } from '@inertiajs/react';
import { ArrowRight, CalendarDays } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { OfferCard } from '@/components/marketing/offer-card';
import { formatPrice, type CourseLevel } from '@/data/offer';
import { show } from '@/routes/courses';

export function LevelCard({
    level,
    index = 0,
}: {
    level: CourseLevel;
    index?: number;
}) {
    return (
        <OfferCard
            index={index}
            image={level.image}
            alt={`Parcours ${level.code} — ${level.name}`}
            badge={{ label: level.code }}
            chip={{ value: String(level.hours), label: 'h' }}
            flag={level.featured ? 'Le plus demandé' : undefined}
        >
            <h3 className="mb-2 text-base leading-snug font-semibold">
                {level.code} — {level.name}
            </h3>
            <p className="mb-4 flex-1 text-sm leading-relaxed text-muted-foreground">
                {level.tagline}
            </p>
            <p className="mb-3 flex items-center gap-2 text-xs text-muted-foreground">
                <CalendarDays className="size-3.5" />
                Cohorte du {level.nextCohort}
            </p>
            <p className="mb-4 text-xs text-primary">
                {level.seats.left} places restantes
            </p>
            <div className="flex items-center justify-between gap-3">
                <div>
                    <p className="text-xs text-muted-foreground">
                        Dès · groupe 3–6
                    </p>
                    <p className="text-sm font-semibold">
                        {formatPrice(level.price.group)}
                    </p>
                </div>
                <Button asChild size="sm" variant="secondary">
                    <Link href={show(level.slug)}>
                        Voir le parcours
                        <ArrowRight />
                    </Link>
                </Button>
            </div>
        </OfferCard>
    );
}
