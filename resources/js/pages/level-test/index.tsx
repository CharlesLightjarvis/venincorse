import { Head, Link, router } from '@inertiajs/react';
import { motion } from 'framer-motion';
import {
    ArrowLeft,
    ArrowRight,
    Check,
    CheckCircle,
    Clock,
    ListCheck,
    RotateLeft,
    Sparkles,
    Target,
    Trophy,
    X,
} from 'reicon-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import {
    getLevelTestOutcome,
    levelTestQuestions,
    levelsPerTest,
    type LevelCode,
} from '@/data/level-test';
import { accents, type Accent } from '@/data/offer';
import Logo from '@/layouts/home/partials/logo';

type Stage = 'intro' | 'quiz' | 'result';

const levelOrder: LevelCode[] = ['a1', 'a2', 'b1', 'b2'];

const levelAccents: Record<LevelCode, Accent> = {
    a1: accents.chart2,
    a2: accents.chart4,
    b1: accents.chart1,
    b2: accents.chart3,
};

const instructions = [
    {
        icon: ListCheck,
        title: '60 questions',
        detail: '15 questions par niveau, de A1 à B2.',
    },
    {
        icon: Clock,
        title: 'Environ 10 minutes',
        detail: 'Sans chrono : tu avances à ton rythme.',
    },
    {
        icon: Target,
        title: 'Résultat immédiat',
        detail: 'Ton niveau estimé et le parcours recommandé.',
    },
] as const;

export default function LevelTest() {
    const [stage, setStage] = useState<Stage>('intro');
    const [currentIndex, setCurrentIndex] = useState(0);
    const [answers, setAnswers] = useState<(number | null)[]>(() =>
        Array<number | null>(levelTestQuestions.length).fill(null),
    );
    const [confirmFinish, setConfirmFinish] = useState(false);
    const [confirmQuit, setConfirmQuit] = useState(false);

    const total = levelTestQuestions.length;
    const question = levelTestQuestions[currentIndex];
    const selectedAnswer = answers[currentIndex];
    const isLastQuestion = currentIndex === total - 1;
    const answeredCount = answers.filter((answer) => answer !== null).length;
    const progress = (answeredCount / total) * 100;
    const outcome = getLevelTestOutcome(answers);
    const resultAccent = levelAccents[outcome.result.code];

    const startTest = () => {
        setAnswers(Array<number | null>(total).fill(null));
        setCurrentIndex(0);
        setStage('quiz');
        window.scrollTo({ top: 0 });
    };

    const selectAnswer = (optionIndex: number) => {
        setAnswers((previous) => {
            const next = [...previous];
            next[currentIndex] = optionIndex;

            return next;
        });
    };

    const goPrevious = () => {
        setCurrentIndex((previous) => Math.max(0, previous - 1));
    };

    const finishTest = () => {
        setConfirmFinish(false);
        setStage('result');
        window.scrollTo({ top: 0 });
    };

    const goNext = () => {
        if (selectedAnswer === null) {
            return;
        }

        if (isLastQuestion) {
            finishTest();

            return;
        }

        setCurrentIndex((previous) => previous + 1);
    };

    const restart = () => {
        startTest();
    };

    const quitTest = () => {
        setConfirmQuit(false);
        router.visit('/');
    };

    return (
        <>
            <Head title="Test de niveau" />

            <div className="relative flex min-h-svh flex-col overflow-hidden">
                <div
                    className="pointer-events-none absolute inset-0 overflow-hidden"
                    aria-hidden="true"
                >
                    <div className="absolute -top-32 right-1/4 h-[480px] w-[480px] rounded-full bg-primary/[0.05] blur-[150px] dark:bg-primary/[0.08]" />
                    <div className="absolute bottom-0 left-1/4 h-[360px] w-[360px] rounded-full bg-foreground/[0.025] blur-[130px] dark:bg-foreground/[0.05]" />
                </div>

                {stage === 'quiz' ? (
                    <header className="sticky top-0 z-40 border-b border-border/40 bg-background/90 backdrop-blur-lg dark:border-border/50">
                        <div className="mx-auto flex h-16 w-full max-w-5xl items-center gap-2.5 px-4 sm:gap-4 sm:px-6">
                            <button
                                type="button"
                                onClick={() => setConfirmQuit(true)}
                                aria-label="Quitter le test"
                                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-foreground/50 transition-colors hover:bg-muted hover:text-foreground"
                            >
                                <X className="h-5 w-5" aria-hidden="true" />
                            </button>

                            <div className="flex min-w-0 flex-1 items-center gap-2.5 sm:gap-3">
                                <div
                                    className="h-2 flex-1 overflow-hidden rounded-full bg-muted"
                                    role="progressbar"
                                    aria-valuemin={0}
                                    aria-valuemax={total}
                                    aria-valuenow={answeredCount}
                                    aria-label="Progression du test"
                                >
                                    <div
                                        className="h-full rounded-full bg-primary transition-all duration-300"
                                        style={{ width: `${progress}%` }}
                                    />
                                </div>

                                <span className="font-mono text-xs text-foreground/50 tabular-nums">
                                    {answeredCount}/{total}
                                </span>
                            </div>

                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="shrink-0 rounded-full border-border/50 bg-background/60"
                                onClick={() => setConfirmFinish(true)}
                            >
                                Terminer
                            </Button>
                        </div>
                    </header>
                ) : (
                    <header className="relative z-10 flex items-center justify-between px-5 py-5 sm:px-8">
                        <Link
                            href="/"
                            aria-label="Fermer le test"
                            className="flex h-9 w-9 items-center justify-center rounded-full text-foreground/45 transition-colors hover:bg-muted hover:text-foreground"
                        >
                            <X className="h-5 w-5" aria-hidden="true" />
                        </Link>
                    </header>
                )}

                {stage === 'intro' && (
                    <main className="relative z-10 flex flex-1 items-center justify-center px-5 py-8 sm:px-6 sm:py-12">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                            className="w-full max-w-2xl text-center"
                        >
                            <div className="inline-flex items-center gap-2 rounded-full border border-border/40 bg-secondary px-4 py-2 text-[11px] font-semibold tracking-[0.22em] text-secondary-foreground uppercase backdrop-blur dark:border-border/60">
                                <Sparkles
                                    className="h-3.5 w-3.5 text-primary"
                                    aria-hidden="true"
                                />
                                Test de niveau gratuit
                            </div>

                            <h1 className="mt-6 text-3xl leading-tight font-semibold tracking-tight text-foreground sm:text-4xl md:text-5xl">
                                Quel est ton vrai niveau{' '}
                                <span className="text-primary">d’allemand</span>{' '}
                                ?
                            </h1>

                            <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-foreground/60 sm:text-base">
                                Soixante questions pour situer ton point de
                                départ, du premier mot jusqu’aux structures
                                avancées. Pas de piège, pas d’inscription : tu
                                réponds et tu obtiens ton résultat.
                            </p>

                            <div className="mt-8 grid gap-3 sm:grid-cols-3">
                                {instructions.map((item, index) => (
                                    <motion.div
                                        key={item.title}
                                        initial={{ opacity: 0, y: 14 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{
                                            duration: 0.45,
                                            delay: 0.15 + index * 0.08,
                                        }}
                                        className="rounded-2xl border border-border/40 bg-background/70 p-4 text-left backdrop-blur-sm dark:border-border/50 dark:bg-background/40"
                                    >
                                        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                            <item.icon
                                                className="h-4 w-4"
                                                aria-hidden="true"
                                            />
                                        </span>

                                        <p className="mt-3 text-sm font-semibold text-foreground">
                                            {item.title}
                                        </p>
                                        <p className="mt-1 text-xs leading-relaxed text-foreground/50">
                                            {item.detail}
                                        </p>
                                    </motion.div>
                                ))}
                            </div>

                            <div className="mt-8 rounded-2xl border border-border/40 bg-muted/30 p-5 text-left dark:border-border/50 dark:bg-foreground/[0.02]">
                                <p className="text-[10px] font-semibold tracking-[0.2em] text-foreground/40 uppercase">
                                    Comment ça se passe
                                </p>

                                <ul className="mt-3 space-y-2.5">
                                    {[
                                        'Une seule réponse par question, sans dictionnaire ni traduction.',
                                        'Tu peux revenir en arrière ou terminer à tout moment.',
                                        'À la fin, ton niveau est calculé sur les 15 questions de chaque palier.',
                                    ].map((point) => (
                                        <li
                                            key={point}
                                            className="flex items-start gap-2.5 text-sm leading-relaxed text-foreground/60"
                                        >
                                            <Check
                                                className="mt-0.5 h-4 w-4 shrink-0 text-primary"
                                                aria-hidden="true"
                                            />
                                            {point}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className="mt-7 flex flex-wrap items-center justify-center gap-2">
                                {levelOrder.map((level) => (
                                    <span
                                        key={level}
                                        className="rounded-full border border-border/50 bg-background/60 px-3 py-1 font-mono text-[11px] font-semibold text-foreground/55 dark:border-border/60 dark:bg-background/30"
                                    >
                                        {level.toUpperCase()}
                                    </span>
                                ))}
                            </div>

                            <Button
                                size="lg"
                                className="group mt-7 h-12 gap-2 rounded-full px-8 text-base"
                                onClick={startTest}
                            >
                                Commencer le test
                                <ArrowRight
                                    className="h-4 w-4 transition-transform group-hover:translate-x-1"
                                    aria-hidden="true"
                                />
                            </Button>

                            <p className="mt-4 text-xs text-foreground/45">
                                Gratuit · sans inscription · aucun email demandé
                            </p>
                        </motion.div>
                    </main>
                )}

                {stage === 'quiz' && (
                    <main className="relative z-10 mx-auto flex w-full max-w-4xl flex-1 flex-col justify-center px-5 py-10 sm:px-8 sm:py-14">
                        <motion.div
                            key={question.id}
                            initial={{ opacity: 0, y: 14 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, ease: 'easeOut' }}
                            className="w-full"
                        >
                            {/* Question : directement sur la page */}
                            <div className="mx-auto max-w-2xl text-center">
                                <h1 className="text-2xl leading-snug font-semibold tracking-tight text-balance text-foreground sm:text-3xl md:text-4xl">
                                    {question.prompt}
                                </h1>

                                <p className="mt-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
                                    Choisis une seule réponse.
                                </p>
                            </div>

                            {/* Réponses : grille 2 colonnes */}
                            <div
                                role="radiogroup"
                                aria-label={`Question ${currentIndex + 1}`}
                                className="mx-auto mt-10 grid w-full max-w-3xl grid-cols-1 gap-3 sm:mt-12 sm:grid-cols-2 sm:gap-4"
                            >
                                {question.options.map((option, optionIndex) => {
                                    const isSelected =
                                        selectedAnswer === optionIndex;

                                    return (
                                        <button
                                            key={`${question.id}-${optionIndex}`}
                                            type="button"
                                            role="radio"
                                            aria-checked={isSelected}
                                            onClick={() =>
                                                selectAnswer(optionIndex)
                                            }
                                            className={cn(
                                                'group relative flex min-h-[76px] w-full items-center gap-4 rounded-2xl border px-5 py-4 text-left transition-all duration-200',
                                                'focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:outline-none',
                                                isSelected
                                                    ? 'border-primary bg-primary/[0.07] shadow-sm ring-1 ring-primary/30'
                                                    : 'border-border/80 bg-background/70 hover:border-primary/50 hover:bg-muted/50 dark:border-border dark:bg-card/30 dark:hover:bg-muted/40',
                                            )}
                                        >
                                            {/* Lettre A, B, C, D */}
                                            <span
                                                aria-hidden="true"
                                                className={cn(
                                                    'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border font-mono text-xs font-semibold transition-colors duration-200',
                                                    isSelected
                                                        ? 'border-primary bg-primary text-primary-foreground'
                                                        : 'border-border bg-muted/50 text-muted-foreground group-hover:border-primary/40 group-hover:text-foreground',
                                                )}
                                            >
                                                {String.fromCharCode(
                                                    65 + optionIndex,
                                                )}
                                            </span>

                                            {/* Texte de la réponse */}
                                            <span
                                                className={cn(
                                                    'min-w-0 flex-1 text-sm leading-relaxed sm:text-base',
                                                    isSelected
                                                        ? 'font-medium text-foreground'
                                                        : 'text-foreground/75',
                                                )}
                                            >
                                                {option}
                                            </span>

                                            {/* Indicateur sélectionné */}
                                            <span
                                                aria-hidden="true"
                                                className={cn(
                                                    'flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-all duration-200',
                                                    isSelected
                                                        ? 'border-primary bg-primary text-primary-foreground'
                                                        : 'border-border/80 bg-background',
                                                )}
                                            >
                                                {isSelected && (
                                                    <Check
                                                        className="h-3 w-3"
                                                        strokeWidth={3}
                                                    />
                                                )}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Navigation */}
                            <div className="mx-auto mt-10 flex w-full max-w-3xl items-center justify-between gap-4 sm:mt-12">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="lg"
                                    className="gap-2 rounded-full px-4 text-muted-foreground hover:text-foreground sm:px-6"
                                    onClick={goPrevious}
                                    disabled={currentIndex === 0}
                                >
                                    <ArrowLeft
                                        className="h-4 w-4"
                                        aria-hidden="true"
                                    />
                                    Précédent
                                </Button>

                                <Button
                                    type="button"
                                    size="lg"
                                    className="group h-11 gap-2 rounded-full px-6 shadow-sm sm:px-8"
                                    onClick={goNext}
                                    disabled={selectedAnswer === null}
                                >
                                    {isLastQuestion
                                        ? 'Voir mon résultat'
                                        : 'Continuer'}

                                    <ArrowRight
                                        className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1"
                                        aria-hidden="true"
                                    />
                                </Button>
                            </div>

                            {/* Description sous la navigation */}
                            <p className="mx-auto mt-8 max-w-md text-center text-xs leading-relaxed text-muted-foreground/70 sm:text-sm">
                                Tu peux terminer le test à tout moment avec le
                                bouton « Terminer » en haut de la page.
                            </p>
                        </motion.div>
                    </main>
                )}

                {stage === 'result' && (
                    <main className="relative z-10 mx-auto w-full max-w-5xl flex-1 px-5 py-12 sm:px-8 sm:py-16 lg:py-20">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, ease: 'easeOut' }}
                            className="w-full"
                        >
                            {/* En-tête du résultat */}
                            <div className="mx-auto max-w-2xl text-center">
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.85 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: 0.45, delay: 0.1 }}
                                    className={cn(
                                        'mx-auto flex h-16 w-16 items-center justify-center rounded-2xl',
                                        resultAccent.bg,
                                        resultAccent.text,
                                    )}
                                >
                                    <Trophy
                                        className="h-8 w-8"
                                        strokeWidth={1.7}
                                        aria-hidden="true"
                                    />
                                </motion.div>

                                <p className="mt-7 text-xs font-semibold tracking-[0.2em] text-muted-foreground uppercase">
                                    Test terminé
                                </p>

                                <h1 className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                                    Voici ton niveau d'allemand
                                </h1>

                                <motion.div
                                    initial={{ opacity: 0, y: 12 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.45, delay: 0.2 }}
                                    className="mt-7"
                                >
                                    <p className="text-5xl font-bold tracking-tight text-primary sm:text-6xl lg:text-7xl">
                                        {outcome.result.code.toUpperCase()}
                                    </p>

                                    <p className="mt-3 text-lg font-medium text-foreground sm:text-xl">
                                        {outcome.result.label}
                                    </p>
                                </motion.div>

                                <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
                                    {outcome.result.headline}
                                </p>
                            </div>

                            {/* Statistiques */}
                            <div className="mx-auto mt-12 grid max-w-3xl grid-cols-3 gap-4 border-y border-border/70 py-7 sm:mt-14 sm:gap-8 sm:py-9">
                                <div className="text-center">
                                    <p className="font-mono text-2xl font-semibold tracking-tight text-foreground tabular-nums sm:text-4xl">
                                        {outcome.score}
                                        <span className="text-base font-normal text-muted-foreground sm:text-lg">
                                            /{outcome.total}
                                        </span>
                                    </p>
                                    <p className="mt-2 text-[10px] font-medium text-muted-foreground sm:text-sm">
                                        Bonnes réponses
                                    </p>
                                </div>

                                <div className="border-x border-border/70 text-center">
                                    <p className="font-mono text-2xl font-semibold tracking-tight text-primary tabular-nums sm:text-4xl">
                                        {outcome.percentage}%
                                    </p>
                                    <p className="mt-2 text-[10px] font-medium text-muted-foreground sm:text-sm">
                                        Taux de réussite
                                    </p>
                                </div>

                                <div className="text-center">
                                    <p className="font-mono text-2xl font-semibold tracking-tight text-foreground tabular-nums sm:text-4xl">
                                        {outcome.answered}
                                        <span className="text-base font-normal text-muted-foreground sm:text-lg">
                                            /{outcome.total}
                                        </span>
                                    </p>
                                    <p className="mt-2 text-[10px] font-medium text-muted-foreground sm:text-sm">
                                        Questions traitées
                                    </p>
                                </div>
                            </div>

                            {/* Description du résultat */}
                            <p className="mx-auto mt-9 max-w-2xl text-center text-sm leading-7 text-muted-foreground sm:text-base">
                                {outcome.result.description}
                            </p>

                            {/* Performances par niveau */}
                            <section className="mx-auto mt-16 max-w-3xl sm:mt-20">
                                <div className="text-center">
                                    <h2 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
                                        Tes performances par niveau
                                    </h2>
                                    <p className="mt-2 text-sm text-muted-foreground">
                                        Découvre comment tu as réussi à chaque
                                        étape du test.
                                    </p>
                                </div>

                                <div className="mt-9 space-y-7">
                                    {levelOrder.map((level, index) => {
                                        const correct =
                                            outcome.correctByLevel[level];
                                        const percentage =
                                            (correct / levelsPerTest) * 100;
                                        const isCurrentLevel =
                                            outcome.result.code === level;

                                        return (
                                            <motion.div
                                                key={level}
                                                initial={{ opacity: 0, x: -12 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{
                                                    duration: 0.35,
                                                    delay: 0.15 + index * 0.08,
                                                }}
                                            >
                                                <div className="mb-3 flex items-center justify-between gap-3">
                                                    <div className="flex items-center gap-3">
                                                        <span
                                                            className={cn(
                                                                'font-mono text-sm font-semibold',
                                                                isCurrentLevel
                                                                    ? 'text-primary'
                                                                    : 'text-foreground',
                                                            )}
                                                        >
                                                            {level.toUpperCase()}
                                                        </span>

                                                        {isCurrentLevel && (
                                                            <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-semibold text-primary">
                                                                Ton niveau
                                                            </span>
                                                        )}
                                                    </div>

                                                    <span className="font-mono text-xs text-muted-foreground tabular-nums">
                                                        {correct}/
                                                        {levelsPerTest}
                                                        <span className="ml-2 text-foreground/35">
                                                            {Math.round(
                                                                percentage,
                                                            )}
                                                            %
                                                        </span>
                                                    </span>
                                                </div>

                                                <div
                                                    className="h-2.5 overflow-hidden rounded-full bg-muted dark:bg-muted/60"
                                                    role="progressbar"
                                                    aria-label={`Performance ${level.toUpperCase()}`}
                                                    aria-valuemin={0}
                                                    aria-valuemax={
                                                        levelsPerTest
                                                    }
                                                    aria-valuenow={correct}
                                                >
                                                    <motion.div
                                                        initial={{ width: 0 }}
                                                        animate={{
                                                            width: `${percentage}%`,
                                                        }}
                                                        transition={{
                                                            duration: 0.8,
                                                            delay:
                                                                0.3 +
                                                                index * 0.1,
                                                            ease: 'easeOut',
                                                        }}
                                                        className={cn(
                                                            'h-full rounded-full',
                                                            isCurrentLevel
                                                                ? 'bg-primary'
                                                                : 'bg-foreground/30 dark:bg-foreground/40',
                                                        )}
                                                    />
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                </div>
                            </section>

                            {/* Points forts et recommandations */}
                            <section className="mx-auto mt-16 max-w-3xl border-t border-border/60 pt-12 sm:mt-20 sm:pt-14">
                                <div className="grid gap-12 sm:grid-cols-2 sm:gap-14">
                                    <div>
                                        <div className="flex items-center gap-2.5">
                                            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                                <CheckCircle
                                                    className="h-4 w-4"
                                                    aria-hidden="true"
                                                />
                                            </span>

                                            <h2 className="text-lg font-semibold tracking-tight text-foreground">
                                                Tes points forts
                                            </h2>
                                        </div>

                                        <ul className="mt-6 space-y-4">
                                            {outcome.result.strengths.map(
                                                (strength) => (
                                                    <li
                                                        key={strength}
                                                        className="flex items-start gap-3 text-sm leading-relaxed text-muted-foreground"
                                                    >
                                                        <Check
                                                            className="mt-0.5 h-4 w-4 shrink-0 text-primary"
                                                            aria-hidden="true"
                                                        />
                                                        <span>{strength}</span>
                                                    </li>
                                                ),
                                            )}
                                        </ul>
                                    </div>

                                    <div>
                                        <div className="flex items-center gap-2.5">
                                            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                                <Target
                                                    className="h-4 w-4"
                                                    aria-hidden="true"
                                                />
                                            </span>

                                            <h2 className="text-lg font-semibold tracking-tight text-foreground">
                                                Pour progresser
                                            </h2>
                                        </div>

                                        <ul className="mt-6 space-y-4">
                                            {outcome.result.nextSteps.map(
                                                (step) => (
                                                    <li
                                                        key={step}
                                                        className="flex items-start gap-3 text-sm leading-relaxed text-muted-foreground"
                                                    >
                                                        <ArrowRight
                                                            className="mt-0.5 h-4 w-4 shrink-0 text-primary"
                                                            aria-hidden="true"
                                                        />
                                                        <span>{step}</span>
                                                    </li>
                                                ),
                                            )}
                                        </ul>
                                    </div>
                                </div>
                            </section>

                            {/* Call to action */}
                            <section className="mx-auto mt-16 max-w-2xl border-t border-border/60 pt-12 text-center sm:mt-20 sm:pt-14">
                                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                                    <Sparkles
                                        className="h-6 w-6"
                                        aria-hidden="true"
                                    />
                                </div>

                                <h2 className="mt-5 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                                    Prêt à passer au niveau supérieur ?
                                </h2>

                                <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-muted-foreground sm:text-base">
                                    Tu connais maintenant ton point de départ.
                                    Découvre le parcours adapté à ton niveau et
                                    continue à progresser à ton rythme.
                                </p>

                                <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                                    <Button
                                        size="lg"
                                        className="group h-12 w-full gap-2 rounded-full px-7 sm:w-auto"
                                        asChild
                                    >
                                        <Link href={outcome.result.courseHref}>
                                            {outcome.result.courseLabel}
                                            <ArrowRight
                                                className="h-4 w-4 transition-transform group-hover:translate-x-1"
                                                aria-hidden="true"
                                            />
                                        </Link>
                                    </Button>

                                    <Button
                                        size="lg"
                                        variant="outline"
                                        className="h-12 w-full rounded-full border-border/80 bg-transparent px-7 sm:w-auto"
                                        asChild
                                    >
                                        <Link href="/trial">
                                            Réserver un cours d'essai
                                        </Link>
                                    </Button>
                                </div>

                                <p className="mx-auto mt-6 max-w-md text-xs leading-relaxed text-muted-foreground/70">
                                    Ce résultat est une estimation indicative.
                                    Un cours d'essai permet de confirmer ton
                                    niveau à l'oral.
                                </p>
                            </section>

                            {/* Recommencer */}
                            <div className="mt-12 flex justify-center sm:mt-14">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="gap-2 rounded-full px-5 text-muted-foreground hover:text-foreground"
                                    onClick={restart}
                                >
                                    <RotateLeft
                                        className="h-4 w-4"
                                        aria-hidden="true"
                                    />
                                    Refaire le test
                                </Button>
                            </div>
                        </motion.div>
                    </main>
                )}

                <Dialog open={confirmFinish} onOpenChange={setConfirmFinish}>
                    <DialogContent className="rounded-3xl sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle className="text-xl">
                                Terminer le test ?
                            </DialogTitle>
                            <DialogDescription>
                                Tu as répondu à {answeredCount} question
                                {answeredCount > 1 ? 's' : ''} sur {total}. Les
                                réponses manquantes seront comptées comme
                                fausses.
                            </DialogDescription>
                        </DialogHeader>

                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                className="rounded-full"
                                onClick={() => setConfirmFinish(false)}
                            >
                                Continuer le test
                            </Button>

                            <Button
                                type="button"
                                className="rounded-full"
                                onClick={finishTest}
                            >
                                Voir mon résultat
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                <Dialog open={confirmQuit} onOpenChange={setConfirmQuit}>
                    <DialogContent className="rounded-3xl sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle className="text-xl">
                                Quitter le test ?
                            </DialogTitle>
                            <DialogDescription>
                                Ta progression sera perdue. Tu pourras
                                recommencer depuis le début à tout moment.
                            </DialogDescription>
                        </DialogHeader>

                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                className="rounded-full"
                                onClick={() => setConfirmQuit(false)}
                            >
                                Continuer le test
                            </Button>

                            <Button
                                type="button"
                                variant="destructive"
                                className="rounded-full"
                                onClick={quitTest}
                            >
                                Quitter
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </>
    );
}
