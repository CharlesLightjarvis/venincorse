import { motion } from 'framer-motion';
import {
    ArrowRight,
    CalendarDays,
    Check,
    ChevronRight,
    Clock,
    FileText,
    MessageCircle,
    PencilLine,
    TrendingUp,
} from 'lucide-react';
import { Head, Link, usePage } from '@inertiajs/react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { courses as coursesRoute } from '@/routes';
import {
    categoryMeta,
    courses,
    formatMeta,
    groupOf,
    includedPerCourse,
    levelClasses,
    levelLabel,
    modulesByCategory,
    objectivesByCategory,
    type CourseMock,
} from '@/data/courses';

const iconMap = {
    FileText,
    PencilLine,
    MessageCircle,
    TrendingUp,
} as const;

const mockSessions = [
    {
        day: '05',
        month: 'nov',
        weekday: 'Jeudi',
        time: '18 h 30 – 20 h 30',
        seats: 3,
    },
    {
        day: '07',
        month: 'nov',
        weekday: 'Samedi',
        time: '10 h 00 – 12 h 00',
        seats: 0,
    },
    {
        day: '12',
        month: 'nov',
        weekday: 'Jeudi',
        time: '18 h 30 – 20 h 30',
        seats: 5,
    },
    {
        day: '19',
        month: 'nov',
        weekday: 'Jeudi',
        time: '18 h 30 – 20 h 30',
        seats: 6,
    },
] as const;

function seatsLabel(seats: number): string {
    if (seats === 0) return 'Complet';

    if (seats <= 3) return `Dernières places — ${seats}`;

    return `${seats} places libres`;
}

function seatsClasses(seats: number): string {
    if (seats === 0) return 'bg-destructive/10 text-destructive';

    if (seats <= 3) return 'bg-chart-4/10 text-chart-4';

    return 'bg-primary/10 text-primary';
}

export default function CourseShow() {
    const url = usePage().url;
    const slug = url.split('/').filter(Boolean).pop() ?? '';
    const course: CourseMock =
        courses.find((item) => item.slug === slug) ?? courses[0];

    const meta = categoryMeta[course.category];
    const format = formatMeta[course.format];
    const levelBadge = levelClasses[groupOf(course.levels[0])];

    return (
        <div className="relative py-16 md:py-24">
            <Head title={course.title} />

            {/* blobs décoratifs */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <div className="absolute top-0 right-1/4 h-[420px] w-[420px] rounded-full bg-primary/[0.04] blur-[150px] dark:bg-primary/[0.07]" />
                <div className="absolute bottom-0 left-1/4 h-[360px] w-[360px] rounded-full bg-foreground/[0.025] blur-[130px] dark:bg-foreground/[0.05]" />
            </div>

            <div className="relative mx-auto max-w-7xl px-6 md:px-8 lg:px-12">
                {/* fil d'Ariane */}
                <motion.nav
                    aria-label="Fil d'Ariane"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    className="mb-10 flex items-center gap-2 text-sm text-foreground/50"
                >
                    <Link
                        href={coursesRoute.url()}
                        className="transition-colors hover:text-foreground"
                    >
                        Catalogue
                    </Link>

                    <ChevronRight className="h-4 w-4" aria-hidden="true" />

                    <span className={meta.text}>{meta.label}</span>

                    <ChevronRight className="h-4 w-4" aria-hidden="true" />

                    <span className="truncate text-foreground/70">
                        {course.title}
                    </span>
                </motion.nav>

                {/* en-tête */}
                <div className="grid items-start gap-10 lg:grid-cols-[1.05fr_0.95fr]">
                    <motion.div
                        initial={{ opacity: 0, y: 24 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7 }}
                    >
                        <div className="flex flex-wrap items-center gap-2">
                            <span
                                className={`inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-background px-3 py-1.5 text-xs font-semibold ${meta.text} dark:bg-background/40`}
                            >
                                <meta.icon
                                    className="h-3.5 w-3.5"
                                    aria-hidden="true"
                                />
                                {meta.label}
                            </span>

                            <span
                                className={`rounded-full px-3 py-1.5 text-xs font-semibold ${levelBadge}`}
                            >
                                Niveau {levelLabel(course.levels)}
                            </span>

                            <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1.5 text-xs font-medium text-foreground/70">
                                <format.icon
                                    className="h-3.5 w-3.5"
                                    aria-hidden="true"
                                />
                                {format.label}
                            </span>
                        </div>

                        <h1 className="mt-6 text-3xl font-semibold tracking-tight text-foreground md:text-5xl">
                            {course.title}
                        </h1>

                        <p className="mt-5 max-w-xl text-lg text-foreground/60">
                            {course.description} Chaque séance suit ton plan
                            personnalisé, avec des corrections directes et des
                            objectifs clairs.
                        </p>

                        <ul className="mt-8 space-y-3">
                            {objectivesByCategory[course.category].map(
                                (objective) => (
                                    <li
                                        key={objective}
                                        className="flex items-start gap-3"
                                    >
                                        <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                                            <Check
                                                className="h-3.5 w-3.5"
                                                aria-hidden="true"
                                            />
                                        </span>

                                        <span className="text-sm text-foreground/70 md:text-base">
                                            {objective}
                                        </span>
                                    </li>
                                ),
                            )}
                        </ul>
                    </motion.div>

                    {/* carte prix */}
                    <motion.div
                        initial={{ opacity: 0, y: 24 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, delay: 0.15 }}
                        className="overflow-hidden rounded-3xl border border-border/40 bg-card lg:sticky lg:top-24 dark:border-border/50"
                    >
                        <div
                            className={`relative flex h-40 items-center justify-center ${meta.tile}`}
                        >
                            <div
                                className={`flex h-16 w-16 items-center justify-center rounded-3xl bg-background shadow-sm ${meta.text} dark:bg-background/80`}
                            >
                                <meta.icon
                                    className="h-8 w-8"
                                    aria-hidden="true"
                                />
                            </div>

                            {course.isPopular && (
                                <span className="absolute top-4 right-4 rounded-full bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground">
                                    Populaire
                                </span>
                            )}
                        </div>

                        <div className="flex flex-col gap-5 p-6 md:p-8">
                            <div>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-3xl font-semibold text-foreground">
                                        {course.price}
                                    </span>

                                    <span className="text-sm text-foreground/50">
                                        FCFA
                                    </span>
                                </div>

                                <p className="mt-1 text-sm text-foreground/50">
                                    {course.sessionLabel} · {course.durationMin}{' '}
                                    min par séance
                                </p>
                            </div>

                            <div className="flex items-start gap-3 rounded-xl border border-primary/20 bg-primary/[0.05] px-4 py-3 text-sm dark:border-primary/25 dark:bg-primary/[0.08]">
                                <CalendarDays
                                    className="mt-0.5 h-4 w-4 shrink-0 text-primary"
                                    aria-hidden="true"
                                />

                                <span className="text-foreground/70">
                                    Prochaine session :{' '}
                                    <strong className="text-foreground">
                                        jeu. 5 nov · 18 h 30
                                    </strong>{' '}
                                    — 3 places
                                </span>
                            </div>

                            <div className="flex flex-col gap-3">
                                <Button
                                    size="lg"
                                    className="w-full rounded-full"
                                >
                                    Réserver ce cours
                                </Button>

                                <Button
                                    size="lg"
                                    variant="outline"
                                    className="w-full rounded-full"
                                >
                                    Poser une question
                                </Button>
                            </div>

                            <ul className="space-y-2 text-sm text-foreground/60">
                                <li className="flex items-center gap-2">
                                    <Check
                                        className="h-4 w-4 text-primary"
                                        aria-hidden="true"
                                    />
                                    Annulation gratuite jusqu'à 24 h avant
                                </li>

                                <li className="flex items-center gap-2">
                                    <Check
                                        className="h-4 w-4 text-primary"
                                        aria-hidden="true"
                                    />
                                    Compte-rendu envoyé après chaque séance
                                </li>

                                <li className="flex items-center gap-2">
                                    <Check
                                        className="h-4 w-4 text-primary"
                                        aria-hidden="true"
                                    />
                                    Professeur certifié · 7 ans d'expérience
                                </li>
                            </ul>
                        </div>
                    </motion.div>
                </div>

                {/* prochaines sessions */}
                <motion.section
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.7 }}
                    className="mt-20"
                >
                    <h2 className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
                        Prochaines sessions
                    </h2>

                    <p className="mt-2 text-sm text-foreground/60">
                        Choisis une date, confirme et rejoins la session en
                        visio.
                    </p>

                    <div className="mt-6 flex flex-col gap-3">
                        {mockSessions.map((session) => (
                            <div
                                key={`${session.day}-${session.month}`}
                                className="flex flex-col gap-4 rounded-2xl border border-border/40 bg-card p-4 transition-colors hover:border-primary/30 sm:flex-row sm:items-center md:p-5 dark:border-border/50"
                            >
                                <div className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-xl bg-muted/60 text-center">
                                    <span className="text-lg leading-none font-bold text-foreground">
                                        {session.day}
                                    </span>

                                    <span className="text-[10px] font-semibold tracking-wider text-foreground/50 uppercase">
                                        {session.month}
                                    </span>
                                </div>

                                <div className="min-w-0 flex-1">
                                    <p className="font-semibold text-foreground">
                                        {session.weekday} · {session.time}
                                    </p>

                                    <p className="mt-0.5 flex items-center gap-1.5 text-xs text-foreground/50">
                                        <Clock
                                            className="h-3.5 w-3.5"
                                            aria-hidden="true"
                                        />
                                        Session en visio ·{' '}
                                        {format.label.toLowerCase()}
                                    </p>
                                </div>

                                <Badge
                                    variant="outline"
                                    className={`shrink-0 rounded-full border-transparent px-3 py-1 ${seatsClasses(session.seats)}`}
                                >
                                    {seatsLabel(session.seats)}
                                </Badge>

                                <Button
                                    size="sm"
                                    disabled={session.seats === 0}
                                    variant={
                                        session.seats === 0
                                            ? 'outline'
                                            : 'default'
                                    }
                                    className="shrink-0 rounded-full"
                                >
                                    {session.seats === 0
                                        ? 'Complet'
                                        : 'Réserver'}
                                </Button>
                            </div>
                        ))}
                    </div>
                </motion.section>

                {/* au programme */}
                <motion.section
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.7 }}
                    className="mt-20"
                >
                    <h2 className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
                        Au programme
                    </h2>

                    <div className="mt-6 grid gap-4 sm:grid-cols-2">
                        {modulesByCategory[course.category].map(
                            (module, index) => (
                                <div
                                    key={module}
                                    className="flex items-start gap-4 rounded-2xl border border-border/40 bg-card p-5 dark:border-border/50"
                                >
                                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                                        {index + 1}
                                    </span>

                                    <p className="text-sm leading-relaxed text-foreground/70">
                                        {module}
                                    </p>
                                </div>
                            ),
                        )}
                    </div>
                </motion.section>

                {/* inclus */}
                <motion.section
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.7 }}
                    className="mt-20"
                >
                    <h2 className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
                        Inclus dans chaque parcours
                    </h2>

                    <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        {includedPerCourse.map((item) => {
                            const Icon = iconMap[item.icon];

                            return (
                                <div
                                    key={item.icon}
                                    className="rounded-2xl border border-border/40 bg-card p-5 dark:border-border/50"
                                >
                                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                        <Icon
                                            className="h-5 w-5"
                                            aria-hidden="true"
                                        />
                                    </span>

                                    <h3 className="mt-4 font-semibold text-foreground">
                                        {item.title}
                                    </h3>

                                    <p className="mt-1 text-sm text-foreground/60">
                                        {item.detail}
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                </motion.section>

                {/* CTA */}
                <motion.section
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.7 }}
                    className="mt-20 flex flex-col items-center gap-6 rounded-3xl border border-border/40 bg-muted/30 p-8 text-center md:p-10 dark:border-border/50 dark:bg-foreground/[0.02]"
                >
                    <h2 className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
                        Prêt(e) à rejoindre {course.title} ?
                    </h2>

                    <p className="max-w-xl text-foreground/60">
                        Une question sur le niveau ou le planning ? Écris au
                        professeur, la réponse arrive en quelques heures.
                    </p>

                    <div className="flex flex-col justify-center gap-3 sm:flex-row">
                        <Button size="lg" className="group gap-2 rounded-full">
                            Réserver ce cours
                            <ArrowRight
                                className="h-4 w-4 transition-transform group-hover:translate-x-1"
                                aria-hidden="true"
                            />
                        </Button>

                        <Button
                            size="lg"
                            variant="outline"
                            className="rounded-full"
                        >
                            Poser une question
                        </Button>
                    </div>
                </motion.section>
            </div>
        </div>
    );
}
