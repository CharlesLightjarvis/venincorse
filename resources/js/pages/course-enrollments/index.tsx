import { Head, Link } from '@inertiajs/react';
import { BookOpen, CalendarDays } from 'reicon-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Empty,
    EmptyContent,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
} from '@/components/ui/empty';
import { useUserTimezone } from '@/hooks/use-browser-timezone';
import {
    enrollmentStatusLabels,
    enrollmentStatusVariant,
    formatCoursePrice,
    type CourseEnrollment,
} from '@/lib/course-cohorts';
import { courses } from '@/routes';
import { index, show } from '@/routes/course-enrollments';

export default function MyCourses({
    enrollments,
}: {
    enrollments: CourseEnrollment[];
}) {
    const timezone = useUserTimezone();
    const date = (value: string) =>
        new Intl.DateTimeFormat('fr-FR', {
            timeZone: timezone,
            weekday: 'short',
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        }).format(new Date(value));

    return (
        <div className="flex h-full flex-1 flex-col gap-6 p-4">
            <Head title="Mes parcours" />
            <div>
                <h1 className="text-3xl font-semibold">Mes parcours</h1>
                <p className="mt-3 text-muted-foreground">
                    Retrouve tes parcours, leur planning et leurs paiements.
                </p>
            </div>
            {enrollments.length === 0 ? (
                <Empty className="border">
                    <EmptyHeader>
                        <EmptyMedia variant="icon">
                            <BookOpen />
                        </EmptyMedia>
                        <EmptyTitle>Pas encore de parcours</EmptyTitle>
                        <EmptyDescription>
                            Un niveau complet de 60 heures, en groupe ou en
                            individuel, au rythme qui te convient.
                        </EmptyDescription>
                    </EmptyHeader>
                    <EmptyContent>
                        <Button asChild>
                            <Link href={courses()}>Découvrir les parcours</Link>
                        </Button>
                    </EmptyContent>
                </Empty>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {enrollments.map((enrollment) => {
                        const cohort = enrollment.cohort;
                        const next = (cohort.sessions ?? []).find(
                            (session) =>
                                !session.cancelled_at &&
                                new Date(session.starts_at).getTime() +
                                    session.duration_minutes * 60_000 >
                                Date.now(),
                        );

                        return (
                            <Link
                                key={enrollment.id}
                                href={show(enrollment.id)}
                                className="flex flex-col gap-4 rounded-lg border border-border p-5 transition-colors hover:border-primary/40 hover:bg-muted/20"
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0">
                                        <p className="truncate font-semibold">
                                            {cohort.level_label}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            {cohort.format_label} ·{' '}
                                            {cohort.rhythm_label}
                                        </p>
                                    </div>
                                    <Badge
                                        variant={
                                            enrollmentStatusVariant[
                                                enrollment.status
                                            ]
                                        }
                                        className="shrink-0"
                                    >
                                        {
                                            enrollmentStatusLabels[
                                                enrollment.status
                                            ]
                                        }
                                    </Badge>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <CalendarDays
                                        className="size-4"
                                        aria-hidden="true"
                                    />
                                    Du {date(cohort.starts_at)} au{' '}
                                    {date(cohort.ends_at)}
                                </div>
                                <div className="mt-auto flex items-center justify-between gap-3 border-t border-border pt-3 text-sm">
                                    <span className="text-muted-foreground">
                                        {enrollment.can_pay
                                            ? 'Paiement en attente'
                                            : next
                                              ? `Prochaine séance : ${date(next.starts_at)}`
                                              : 'Parcours terminé'}
                                    </span>
                                    <span className="font-medium">
                                        {formatCoursePrice(
                                            enrollment.amount_cents,
                                            enrollment.currency,
                                        )}
                                    </span>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

MyCourses.layout = {
    breadcrumbs: [{ title: 'Mes parcours', href: index() }],
};
