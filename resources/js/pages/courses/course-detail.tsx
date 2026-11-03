import { Head, Link, usePage } from '@inertiajs/react';
import { motion } from 'framer-motion';
import {
    ArrowLeft,
    ArrowRight,
    Blocks,
    BookOpen,
    Briefcase,
    CalendarDays,
    Check,
    ChevronRight,
    ChevronUp,
    Clock,
    FileText,
    GraduationCap,
    MapPin,
    MessageCircle,
    MessagesSquare,
    Sparkles,
    SpellCheck,
    Users,
    Video,
    type LucideIcon,
} from 'lucide-react';
import { useState } from 'react';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { courses as coursesRoute } from '@/routes';
import { allCourses, prof, type Course } from './courses-data';
import { CourseCard } from './partials/course-card';

const typeMeta: Record<
    string,
    { icon: LucideIcon; text: string; tile: string }
> = {
    Standard: {
        icon: BookOpen,
        text: 'text-primary',
        tile: 'bg-primary/10 text-primary',
    },
    Grammaire: {
        icon: SpellCheck,
        text: 'text-chart-4',
        tile: 'bg-chart-4/10 text-chart-4',
    },
    Conversation: {
        icon: MessagesSquare,
        text: 'text-chart-2',
        tile: 'bg-chart-2/10 text-chart-2',
    },
    Examens: {
        icon: GraduationCap,
        text: 'text-chart-1',
        tile: 'bg-chart-1/10 text-chart-1',
    },
    Affaires: {
        icon: Briefcase,
        text: 'text-chart-3',
        tile: 'bg-chart-3/10 text-chart-3',
    },
    Soutien: {
        icon: Blocks,
        text: 'text-chart-5',
        tile: 'bg-chart-5/10 text-chart-5',
    },
};

const levelClasses: Record<string, string> = {
    A1: 'bg-chart-2/10 text-chart-2',
    A2: 'bg-chart-4/10 text-chart-4',
    B1: 'bg-chart-1/10 text-chart-1',
    B2: 'bg-chart-3/10 text-chart-3',
};

const statusClasses: Record<
    Course['status'],
    { text: string; dot: string }
> = {
    Ouvert: { text: 'text-primary', dot: 'bg-primary' },
    Bientôt: { text: 'text-chart-1', dot: 'bg-chart-1' },
    Complet: { text: 'text-destructive', dot: 'bg-destructive' },
    Terminé: { text: 'text-foreground/50', dot: 'bg-foreground/40' },
};

const includedPerCourse = [
    {
        icon: Video,
        title: 'Visio en direct',
        detail: 'Chaque séance se tient en visioconférence, sans déplacement.',
    },
    {
        icon: CalendarDays,
        title: 'Planning flexible',
        detail: 'Les créneaux sont calés ensemble, selon ton agenda.',
    },
    {
        icon: FileText,
        title: 'Supports dédiés',
        detail: 'Fiches, exercices et corrections envoyés après chaque cours.',
    },
    {
        icon: MessageCircle,
        title: 'Suivi personnalisé',
        detail: 'Un compte-rendu clair après chaque séance et un point régulier.',
    },
] as const;

const teacherStats = [
    { value: '7 ans', label: "d'enseignement de l'allemand" },
    { value: '200+', label: 'élèves accompagnés' },
    { value: '5,0', label: 'note moyenne des élèves' },
] as const;

function levelGroup(level: string): string {
    return level.split('.')[0];
}

function seatsLabel(seats: number, capacity: number): string {
    if (seats === 0) {
        return 'Complet';
    }

    if (capacity <= 1) {
        return 'Disponible';
    }

    return `${seats} place${seats > 1 ? 's' : ''} restante${seats > 1 ? 's' : ''} sur ${capacity}`;
}

function seatsBarClass(seats: number, capacity: number): string {
    const ratio = seats / capacity;

    if (ratio <= 0.2) {
        return 'bg-destructive';
    }

    if (ratio <= 0.5) {
        return 'bg-chart-4';
    }

    return 'bg-primary';
}

function seatsTextClass(seats: number, capacity: number): string {
    const ratio = seats / capacity;

    if (ratio <= 0.2) {
        return 'text-destructive';
    }

    if (ratio <= 0.5) {
        return 'text-chart-4';
    }

    return 'text-primary';
}

function FormulePicker({ course }: { course: Course }) {
    const [selected, setSelected] = useState(0);
    const formules = course.formules ?? [];

    if (formules.length === 0) {
        return null;
    }

    return (
        <div className="flex flex-col gap-3">
            <p className="text-[10px] font-semibold tracking-[0.2em] text-foreground/40 uppercase">
                Choisir une formule
            </p>

            <div className="flex flex-col gap-2">
                {formules.map((formule, index) => {
                    const isSelected = index === selected;

                    return (
                        <button
                            key={formule.nom}
                            type="button"
                            onClick={() => setSelected(index)}
                            aria-pressed={isSelected}
                            className={`flex items-start justify-between gap-3 rounded-xl border px-4 py-3 text-left transition-colors ${
                                isSelected
                                    ? 'border-primary bg-primary/[0.04] dark:bg-primary/[0.08]'
                                    : 'border-border/40 bg-background/60 hover:border-primary/30 dark:border-border/50'
                            }`}
                        >
                            <span className="flex items-start gap-2.5">
                                <span
                                    className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border transition-colors ${
                                        isSelected
                                            ? 'border-primary'
                                            : 'border-border/60'
                                    }`}
                                    aria-hidden="true"
                                >
                                    {isSelected && (
                                        <span className="h-2 w-2 rounded-full bg-primary" />
                                    )}
                                </span>

                                <span>
                                    <span className="block text-sm font-semibold text-foreground">
                                        {formule.nom}
                                    </span>

                                    {formule.avantages && (
                                        <span className="mt-0.5 block text-xs leading-relaxed text-foreground/50">
                                            {formule.avantages}
                                        </span>
                                    )}
                                </span>
                            </span>

                            <span className="shrink-0 font-mono text-xs font-semibold text-foreground">
                                {formule.prix}
                            </span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

function BookingDetails({ course }: { course: Course }) {
    const minPrice = course.formules?.[0]?.prix;

    return (
        <div className="flex flex-col gap-5 p-6 md:p-7">
            <div>
                <div className="flex items-baseline gap-2">
                    {minPrice ? (
                        <>
                            <span className="text-[10px] font-semibold tracking-[0.2em] text-foreground/40 uppercase">
                                À partir de
                            </span>
                            <span className="font-mono text-2xl font-semibold text-foreground">
                                {minPrice}
                            </span>
                        </>
                    ) : (
                        <span className="text-lg font-semibold text-foreground">
                            Tarifs sur demande
                        </span>
                    )}
                </div>

                <p className="mt-1 text-sm text-foreground/50">
                    {course.nbSeances > 1
                        ? `${course.nbSeances} séances en visio`
                        : 'Séance en visio · 100 % à distance'}
                </p>
            </div>

            <div className="flex items-start gap-3 rounded-xl border border-primary/20 bg-primary/[0.05] px-4 py-3 text-sm dark:border-primary/25 dark:bg-primary/[0.08]">
                <CalendarDays
                    className="mt-0.5 h-4 w-4 shrink-0 text-primary"
                    aria-hidden="true"
                />

                <span className="text-foreground/70">
                    Début :{' '}
                    <strong className="text-foreground">
                        {course.dateDebut}
                    </strong>
                    {course.dateFin && ` jusqu'au ${course.dateFin}`}
                </span>
            </div>

            <FormulePicker course={course} />

            <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                    <span
                        className={`font-medium ${seatsTextClass(course.placesRestantes, course.capacite)}`}
                    >
                        {seatsLabel(
                            course.placesRestantes,
                            course.capacite,
                        )}
                    </span>

                    <span className="font-mono text-xs text-foreground/40">
                        {course.capacite > 1
                            ? `${course.capacite} max`
                            : 'Cours privé'}
                    </span>
                </div>

                <div className="h-1.5 overflow-hidden rounded-full bg-foreground/10">
                    <div
                        className={`h-full rounded-full ${seatsBarClass(course.placesRestantes, course.capacite)}`}
                        style={{
                            width: `${((course.capacite - course.placesRestantes) / course.capacite) * 100}%`,
                        }}
                    />
                </div>
            </div>

            <div className="flex flex-col gap-3">
                {course.placesRestantes === 0 ? (
                    <Button
                        size="lg"
                        className="w-full rounded-full"
                        disabled
                    >
                        Complet
                    </Button>
                ) : (
                    <Button
                        size="lg"
                        className="w-full rounded-full"
                        asChild
                    >
                        <Link href="/contact">Réserver ce cours</Link>
                    </Button>
                )}

                <Button
                    size="lg"
                    variant="outline"
                    className="w-full rounded-full"
                    asChild
                >
                    <Link href="/contact">Poser une question</Link>
                </Button>
            </div>

            <ul className="space-y-2 text-sm text-foreground/60">
                <li className="flex items-center gap-2">
                    <Check
                        className="h-4 w-4 shrink-0 text-primary"
                        aria-hidden="true"
                    />
                    Annulation gratuite jusqu'à 24 h avant
                </li>

                <li className="flex items-center gap-2">
                    <Check
                        className="h-4 w-4 shrink-0 text-primary"
                        aria-hidden="true"
                    />
                    Compte-rendu envoyé après chaque séance
                </li>

                <li className="flex items-center gap-2">
                    <Check
                        className="h-4 w-4 shrink-0 text-primary"
                        aria-hidden="true"
                    />
                    Supports et exercices inclus
                </li>
            </ul>
        </div>
    );
}

function BookingCard({ course }: { course: Course }) {
    const meta = typeMeta[course.type] ?? typeMeta.Standard;
    const TypeIcon = meta.icon;

    return (
        <div className="overflow-hidden rounded-3xl border border-border/40 bg-card dark:border-border/50">
            <div className="relative h-44 overflow-hidden bg-muted">
                <img
                    src={course.image}
                    alt={course.titre}
                    className="h-full w-full object-cover"
                    loading="lazy"
                    decoding="async"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-black/30 px-3 py-1 text-xs font-semibold text-white backdrop-blur">
                        <TypeIcon className="h-3 w-3" aria-hidden="true" />
                        {course.type}
                    </span>

                    {course.featured && (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
                            <Sparkles
                                className="h-3 w-3"
                                aria-hidden="true"
                            />
                            Populaire
                        </span>
                    )}
                </div>

                <span
                    className={`absolute top-4 right-4 inline-flex items-center gap-1.5 rounded-full bg-background/90 px-3 py-1 text-xs font-semibold backdrop-blur ${statusClasses[course.status].text}`}
                >
                    <span
                        className={`h-1.5 w-1.5 rounded-full ${statusClasses[course.status].dot}`}
                        aria-hidden="true"
                    />
                    {course.status}
                </span>

                <span className="absolute bottom-4 left-4 inline-flex items-center gap-1.5 text-xs font-medium text-white/85">
                    <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
                    {course.ville}
                </span>
            </div>

            <BookingDetails course={course} />
        </div>
    );
}

function CourseNotFound() {
    return (
        <div className="relative py-20 md:py-28">
            <Head title="Cours introuvable" />

            <div className="relative mx-auto max-w-3xl px-6 text-center md:px-8">
                <div className="rounded-3xl border border-dashed border-border/60 bg-card/50 px-6 py-16">
                    <span className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-muted text-foreground/40">
                        <BookOpen className="h-6 w-6" aria-hidden="true" />
                    </span>

                    <h1 className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
                        Ce cours n'existe pas encore
                    </h1>

                    <p className="mx-auto mt-3 max-w-md text-foreground/60">
                        Le lien a peut-être changé. Retrouve toutes les
                        formations disponibles dans le catalogue.
                    </p>

                    <Button className="mt-8 gap-2 rounded-full" asChild>
                        <Link href={coursesRoute.url()}>
                            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                            Retour au catalogue
                        </Link>
                    </Button>
                </div>
            </div>
        </div>
    );
}

export default function CourseDetail() {
    const url = usePage().url;
    const slug = url.split('/').filter(Boolean).pop() ?? '';
    const [isBookingExpanded, setIsBookingExpanded] = useState(false);
    const course = allCourses.find((item) => item.slug === slug);

    if (!course) {
        return <CourseNotFound />;
    }

    const meta = typeMeta[course.type] ?? typeMeta.Standard;
    const TypeIcon = meta.icon;
    const firstLevel = course.niveaux[0] ?? 'A1.1';
    const levelBadge = levelClasses[levelGroup(firstLevel)] ?? levelClasses.A1;
    const formules = course.formules ?? [];
    const minPrice = formules[0]?.prix;
    const teachers = course.intervenants?.length
        ? course.intervenants
        : [prof];
    const relatedCourses = [
        ...allCourses.filter(
            (item) =>
                item.slug !== course.slug &&
                item.type === course.type &&
                item.status !== 'Terminé',
        ),
        ...allCourses.filter(
            (item) =>
                item.slug !== course.slug &&
                item.type !== course.type &&
                item.status !== 'Terminé',
        ),
    ].slice(0, 3);

    return (
        <div className="relative min-h-screen pt-16 pb-28 md:pt-24 md:pb-28 lg:pb-0">
            <Head title={course.titre} />

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

                    <span className={meta.text}>{course.type}</span>

                    <ChevronRight className="h-4 w-4" aria-hidden="true" />

                    <span className="truncate text-foreground/70">
                        {course.titre}
                    </span>
                </motion.nav>

                <div className="grid items-start gap-10 lg:grid-cols-[1.05fr_0.95fr]">
                    {/* en-tête */}
                    <motion.div
                        initial={{ opacity: 0, y: 24 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7 }}
                    >
                        <div className="flex flex-wrap items-center gap-2">
                            <span
                                className={`inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-background px-3 py-1.5 text-xs font-semibold ${meta.text} dark:bg-background/40`}
                            >
                                <TypeIcon
                                    className="h-3.5 w-3.5"
                                    aria-hidden="true"
                                />
                                {course.type}
                            </span>

                            <span
                                className={`rounded-full px-3 py-1.5 text-xs font-semibold ${levelBadge}`}
                            >
                                Niveau {course.niveaux.join(' · ')}
                            </span>

                            <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1.5 text-xs font-medium text-foreground/70">
                                <Video
                                    className="h-3.5 w-3.5"
                                    aria-hidden="true"
                                />
                                {course.ville}
                            </span>
                        </div>

                        <h1 className="mt-6 text-3xl font-semibold tracking-tight text-foreground md:text-5xl">
                            {course.titre}
                        </h1>

                        <p className="mt-5 max-w-xl text-lg text-foreground/60">
                            {course.description}
                        </p>

                        <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 border-y border-border/30 py-5 text-sm text-foreground/60">
                            <span className="flex items-center gap-2">
                                <CalendarDays
                                    className="h-4 w-4 text-primary"
                                    aria-hidden="true"
                                />
                                Début le {course.dateDebut}
                            </span>

                            <span className="flex items-center gap-2">
                                <Clock
                                    className="h-4 w-4 text-primary"
                                    aria-hidden="true"
                                />
                                {course.nbSeances > 1
                                    ? `${course.nbSeances} séances`
                                    : 'Séance à l’unité'}
                            </span>

                            <span className="flex items-center gap-2">
                                <Users
                                    className="h-4 w-4 text-primary"
                                    aria-hidden="true"
                                />
                                {course.capacite > 1
                                    ? `${course.capacite} places max`
                                    : 'Cours privé 1:1'}
                            </span>
                        </div>

                        {course.objectifs && (
                            <ul className="mt-8 space-y-3">
                                {course.objectifs.map((objective) => (
                                    <li
                                        key={objective.titre}
                                        className="flex items-start gap-3"
                                    >
                                        <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                                            <Check
                                                className="h-3.5 w-3.5"
                                                aria-hidden="true"
                                            />
                                        </span>

                                        <span className="text-sm text-foreground/70 md:text-base">
                                            <strong className="font-semibold text-foreground">{`${objective.titre}.`}</strong>{' '}
                                            {objective.description}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </motion.div>

                    {/* carte réservation sticky */}
                    <motion.aside
                        initial={{ opacity: 0, y: 24 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, delay: 0.15 }}
                        className="hidden lg:sticky lg:top-24 lg:block"
                    >
                        <BookingCard course={course} />
                    </motion.aside>
                </div>

                {/* au programme */}
                {course.programme && course.programme.length > 0 && (
                    <motion.section
                        id="programme"
                        initial={{ opacity: 0, y: 24 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: '-60px' }}
                        transition={{ duration: 0.6 }}
                        className="mt-20 scroll-mt-28"
                    >
                        <div className="mb-6">
                            <p className="mb-1 text-[10px] font-semibold tracking-[0.25em] text-foreground/40 uppercase">
                                Déroulement
                            </p>
                            <h2 className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
                                Au programme
                            </h2>
                        </div>

                        <Accordion
                            type="single"
                            collapsible
                            defaultValue="seance-0"
                        >
                            {course.programme.map((bloc, index) => (
                                <AccordionItem
                                    key={bloc.numero}
                                    value={`seance-${index}`}
                                    className="mb-3 overflow-hidden rounded-2xl border border-border/40 bg-card px-5 dark:border-border/50"
                                >
                                    <AccordionTrigger className="hover:no-underline">
                                        <span className="flex items-center gap-4 text-left">
                                            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 font-mono text-sm font-semibold text-primary">
                                                {bloc.numero}
                                            </span>

                                            <span className="font-semibold text-foreground">
                                                {bloc.label}
                                            </span>
                                        </span>
                                    </AccordionTrigger>

                                    <AccordionContent>
                                        <div className="divide-y divide-border/30 border-t border-border/30">
                                            {bloc.sessions.map((seance) => (
                                                <div
                                                    key={`${bloc.numero}-${seance.titre}`}
                                                    className="flex flex-col gap-1 py-3 sm:flex-row sm:items-start sm:gap-4"
                                                >
                                                    <span className="shrink-0 pt-0.5 font-mono text-xs text-foreground/40 sm:w-28">
                                                        {seance.heure}
                                                    </span>

                                                    <span>
                                                        <span className="block text-sm font-medium text-foreground">
                                                            {seance.titre}
                                                        </span>

                                                        {seance.intervenant && (
                                                            <span className="mt-0.5 block text-xs text-foreground/50">
                                                                {
                                                                    seance.intervenant
                                                                }
                                                            </span>
                                                        )}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>
                            ))}
                        </Accordion>
                    </motion.section>
                )}

                {/* inclus */}
                <motion.section
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-60px' }}
                    transition={{ duration: 0.6 }}
                    className="mt-20"
                >
                    <div className="mb-6">
                        <p className="mb-1 text-[10px] font-semibold tracking-[0.25em] text-foreground/40 uppercase">
                            Tout est prévu
                        </p>
                        <h2 className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
                            Inclus dans ce cours
                        </h2>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        {includedPerCourse.map((item) => (
                            <div
                                key={item.title}
                                className="rounded-2xl border border-border/40 bg-card p-5 transition-colors hover:border-primary/30 dark:border-border/50"
                            >
                                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                    <item.icon
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
                        ))}
                    </div>
                </motion.section>

                {/* prof */}
                <motion.section
                    id="professeur"
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-60px' }}
                    transition={{ duration: 0.6 }}
                    className="mt-20 scroll-mt-28"
                >
                    <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14">
                        <div>
                            <p className="mb-1 text-[10px] font-semibold tracking-[0.25em] text-foreground/40 uppercase">
                                Qui t'accompagne
                            </p>

                            <h2 className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
                                {teachers.length > 1
                                    ? 'Tes professeurs'
                                    : 'Ton professeur'}
                            </h2>

                            <p className="mt-4 flex flex-wrap items-baseline gap-x-2 text-sm">
                                <span className="font-semibold text-foreground">
                                    {teachers[0].nom}
                                </span>
                                <span className="text-foreground/45">
                                    · {teachers[0].role}
                                </span>
                            </p>

                            {teachers[0].bio && (
                                <p className="mt-5 max-w-xl text-lg text-foreground/60">
                                    {teachers[0].bio}
                                </p>
                            )}

                            <div className="mt-8 grid grid-cols-2 gap-x-6 gap-y-4 border-t border-border/30 pt-6 sm:grid-cols-3">
                                {teacherStats.map((stat) => (
                                    <div key={stat.label}>
                                        <div className="text-2xl font-semibold text-foreground">
                                            {stat.value}
                                        </div>

                                        <div className="mt-1 text-sm text-foreground/50">
                                            {stat.label}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {teachers.length > 1 && (
                                <ul className="mt-6 flex flex-wrap gap-2">
                                    {teachers.slice(1).map((teacher) => (
                                        <li
                                            key={teacher.nom}
                                            className="rounded-full border border-border/40 bg-background px-3 py-1.5 text-xs font-medium text-foreground/60"
                                        >
                                            {teacher.nom} · {teacher.role}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>

                        <div className="relative mx-auto w-full max-w-md lg:max-w-none">
                            <div
                                className="pointer-events-none absolute -inset-6 rounded-full bg-primary/[0.05] blur-3xl dark:bg-primary/[0.08]"
                                aria-hidden="true"
                            />

                            <div className="relative overflow-hidden rounded-3xl border border-border/40 bg-background/80 dark:border-border/50">
                                <img
                                    src="/images/hero-ref.png"
                                    alt={`Portrait de ${teachers[0].nom}`}
                                    className="w-full object-cover"
                                    loading="lazy"
                                    decoding="async"
                                />
                            </div>
                        </div>
                    </div>
                </motion.section>

                {/* témoignages */}
                {course.temoignages && course.temoignages.length > 0 && (
                    <motion.section
                        initial={{ opacity: 0, y: 24 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: '-60px' }}
                        transition={{ duration: 0.6 }}
                        className="mt-20"
                    >
                        <div className="mb-6">
                            <p className="mb-1 text-[10px] font-semibold tracking-[0.25em] text-foreground/40 uppercase">
                                Retours d'expérience
                            </p>
                            <h2 className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
                                Ils ont suivi ce cours
                            </h2>
                        </div>

                        <div className="grid gap-5 md:grid-cols-2">
                            {course.temoignages.map((testimonial) => (
                                <div
                                    key={testimonial.nom}
                                    className="rounded-2xl border border-border/40 bg-card p-6 dark:border-border/50"
                                >
                                    <div className="mb-4 flex items-center gap-3">
                                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                                            {testimonial.initiales}
                                        </span>

                                        <div>
                                            <p className="text-sm font-semibold text-foreground">
                                                {testimonial.nom}
                                            </p>
                                            <p className="text-xs text-foreground/50">
                                                {testimonial.role}
                                            </p>
                                        </div>
                                    </div>

                                    <p className="text-sm leading-relaxed text-foreground/70 italic">
                                        « {testimonial.texte} »
                                    </p>
                                </div>
                            ))}
                        </div>
                    </motion.section>
                )}

                {/* CTA */}
                <motion.section
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-60px' }}
                    transition={{ duration: 0.6 }}
                    className="mt-20 flex flex-col items-center gap-6 rounded-3xl border border-border/40 bg-muted/30 p-8 text-center md:p-10 dark:border-border/50 dark:bg-foreground/[0.02]"
                >
                    <h2 className="max-w-2xl text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
                        Prêt(e) à rejoindre {course.titre} ?
                    </h2>

                    <p className="max-w-xl text-foreground/60">
                        Une question sur le niveau, le planning ou les tarifs ?
                        Écris-nous, la réponse arrive en quelques heures.
                    </p>

                    <div className="flex flex-col justify-center gap-3 sm:flex-row">
                        {course.placesRestantes === 0 ? (
                            <Button
                                size="lg"
                                className="rounded-full"
                                disabled
                            >
                                Complet
                            </Button>
                        ) : (
                            <Button
                                size="lg"
                                className="group gap-2 rounded-full"
                                asChild
                            >
                                <Link href="/contact">
                                    Réserver ce cours
                                    <ArrowRight
                                        className="h-4 w-4 transition-transform group-hover:translate-x-1"
                                        aria-hidden="true"
                                    />
                                </Link>
                            </Button>
                        )}

                        <Button
                            size="lg"
                            variant="outline"
                            className="rounded-full"
                            asChild
                        >
                            <Link href={coursesRoute.url()}>
                                Voir tous les cours
                            </Link>
                        </Button>
                    </div>
                </motion.section>

                {/* autres cours */}
                {relatedCourses.length > 0 && (
                    <motion.section
                        initial={{ opacity: 0, y: 24 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: '-60px' }}
                        transition={{ duration: 0.6 }}
                        className="mt-20"
                    >
                        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
                            <div>
                                <p className="mb-1 text-[10px] font-semibold tracking-[0.25em] text-foreground/40 uppercase">
                                    À découvrir
                                </p>
                                <h2 className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
                                    Autres cours
                                </h2>
                            </div>

                            <Button
                                variant="outline"
                                className="group gap-2 rounded-full"
                                asChild
                            >
                                <Link href={coursesRoute.url()}>
                                    Tout le catalogue
                                    <ArrowRight
                                        className="h-4 w-4 transition-transform group-hover:translate-x-1"
                                        aria-hidden="true"
                                    />
                                </Link>
                            </Button>
                        </div>

                        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                            {relatedCourses.map((relatedCourse, index) => (
                                <CourseCard
                                    key={relatedCourse.slug}
                                    course={relatedCourse}
                                    index={index}
                                />
                            ))}
                        </div>
                    </motion.section>
                )}
            </div>

            {/* barre de réservation mobile */}
            <div className="fixed inset-x-0 bottom-0 z-40 lg:hidden">
                {isBookingExpanded && (
                    <div
                        id="reservation-mobile"
                        className="max-h-[68dvh] overflow-y-auto overscroll-contain rounded-t-3xl border-t border-border/40 bg-background shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.15)]"
                    >
                        <div className="sticky top-0 z-10 flex justify-center border-b border-border/30 bg-background/95 py-2.5 backdrop-blur">
                            <span
                                className="h-1.5 w-10 rounded-full bg-foreground/15"
                                aria-hidden="true"
                            />
                        </div>

                        <div className="border-b border-border/30 px-6 pt-4 pb-3">
                            <p className="text-sm font-semibold text-foreground">
                                {course.titre}
                            </p>
                            <p className="mt-0.5 text-xs text-foreground/50">
                                {minPrice ?? 'Tarifs sur demande'} ·{' '}
                                {course.ville}
                            </p>
                        </div>

                        <BookingDetails course={course} />
                    </div>
                )}

                <div className="border-t border-border/40 bg-background shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.15)]">
                    <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3">
                        <button
                            type="button"
                            onClick={() =>
                                setIsBookingExpanded((current) => !current)
                            }
                            aria-expanded={isBookingExpanded}
                            aria-controls="reservation-mobile"
                            className="flex items-center gap-2.5 text-left"
                        >
                            <span>
                                <span className="block text-[10px] font-semibold tracking-[0.2em] text-foreground/40 uppercase">
                                    À partir de
                                </span>
                                <span className="block font-mono text-sm font-semibold text-foreground">
                                    {minPrice ?? 'Sur demande'}
                                </span>
                            </span>

                            <ChevronUp
                                className={`h-4 w-4 text-foreground/40 transition-transform ${isBookingExpanded ? 'rotate-180' : ''}`}
                                aria-hidden="true"
                            />
                        </button>

                        {course.placesRestantes === 0 ? (
                            <Button
                                size="lg"
                                className="rounded-full px-6"
                                disabled
                            >
                                Complet
                            </Button>
                        ) : (
                            <Button
                                size="lg"
                                className="rounded-full px-6"
                                onClick={() => setIsBookingExpanded(true)}
                            >
                                Réserver
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
