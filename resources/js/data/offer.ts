import type { LucideIcon } from 'lucide-react';
import { getExamPackage, type ExamLevel } from '@/data/exam-booking';
import {
    BookOpen,
    CalendarDays,
    Compass,
    FileText,
    Flame,
    GraduationCap,
    MessagesSquare,
    Rocket,
    Target,
    TrendingUp,
    Trophy,
    Users,
    Video,
    Zap,
} from 'lucide-react';

export type LevelSlug = 'a1' | 'a2' | 'b1' | 'b2';
export type TierKey = 'solo' | 'group';

export interface PriceSet {
    solo: number;
    group: number;
}

export interface Accent {
    text: string;
    bg: string;
    border: string;
    dot: string;
    gradient: string;
}

export interface ProgramLesson {
    title: string;
    description: string;
}

export interface ProgramModule {
    title: string;
    hours: number;
    description: string;
    lessons: ProgramLesson[];
}

export interface SubLevel {
    code: string;
    title: string;
    hours: number;
    focus: string[];
    outcome: string;
    image: string;
    program: ProgramModule[];
}

export interface CourseLevel {
    slug: LevelSlug;
    code: string;
    name: string;
    tagline: string;
    description: string;
    hours: number;
    image: string;
    subLevels: SubLevel[];
    canDo: string[];
    price: PriceSet;
    nextCohort: string;
    seats: { total: number; left: number };
    icon: LucideIcon;
    accent: Accent;
    featured?: boolean;
}

export interface TrainingFormat {
    id: string;
    name: string;
    icon: LucideIcon;
    schedule: string;
    subLevel: string;
    level: string;
    description: string;
    ideal: string;
}

export interface ExamPrep {
    id: ExamLevel;
    level: string;
    title: string;
    subtitle: string;
    volume: string;
    sessions: number;
    image: string;
    price: PriceSet;
    description: string;
    includes: string[];
    accent: Accent;
    popular?: boolean;
}

export interface Testimonial {
    initials: string;
    name: string;
    city: string;
    objective: string;
    quote: string;
}

export interface FaqItem {
    question: string;
    answer: string;
}

export const accents = {
    primary: {
        text: 'text-primary',
        bg: 'bg-primary/10',
        border: 'border-primary/25',
        dot: 'bg-primary',
        gradient: 'from-primary/15 via-primary/[0.05] to-transparent',
    },
    chart1: {
        text: 'text-chart-1',
        bg: 'bg-chart-1/10',
        border: 'border-chart-1/25',
        dot: 'bg-chart-1',
        gradient: 'from-chart-1/15 via-chart-1/[0.05] to-transparent',
    },
    chart2: {
        text: 'text-chart-2',
        bg: 'bg-chart-2/10',
        border: 'border-chart-2/25',
        dot: 'bg-chart-2',
        gradient: 'from-chart-2/15 via-chart-2/[0.05] to-transparent',
    },
    chart3: {
        text: 'text-chart-3',
        bg: 'bg-chart-3/10',
        border: 'border-chart-3/25',
        dot: 'bg-chart-3',
        gradient: 'from-chart-3/15 via-chart-3/[0.05] to-transparent',
    },
    chart4: {
        text: 'text-chart-4',
        bg: 'bg-chart-4/10',
        border: 'border-chart-4/25',
        dot: 'bg-chart-4',
        gradient: 'from-chart-4/15 via-chart-4/[0.05] to-transparent',
    },
    chart5: {
        text: 'text-chart-5',
        bg: 'bg-chart-5/10',
        border: 'border-chart-5/25',
        dot: 'bg-chart-5',
        gradient: 'from-chart-5/15 via-chart-5/[0.05] to-transparent',
    },
} as const;

export const levels: CourseLevel[] = [
    {
        slug: 'a1',
        code: 'A1',
        name: 'Premiers pas',
        tagline: 'De zéro à ta première vraie conversation.',
        description:
            "Le niveau qui pose les fondations sans t'écraser de règles. Tu parles dès la première séance, tu comprends les situations du quotidien et tu écris tes premiers messages.",
        hours: 60,
        image: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=1200&q=80',
        subLevels: [
            {
                code: 'A1.1',
                title: 'Les fondations',
                hours: 30,
                focus: [
                    'Se présenter',
                    'Alphabet & nombres',
                    'Présent',
                    'Questions simples',
                ],
                outcome:
                    'Tu te présentes, tu épelles ton nom et tu poses tes premières questions.',
                image: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=1200&q=80',
                program: [
                    {
                        title: 'Premiers contacts',
                        hours: 15,
                        description:
                            'Se présenter, épeler, compter et poser les premières questions.',
                        lessons: [
                            {
                                title: 'Se présenter',
                                description:
                                    'Nom, origine, âge : les phrases indispensables pour un premier échange.',
                            },
                            {
                                title: 'Alphabet & sons',
                                description:
                                    'Épeler son nom et reconnaître les sons qui n’existent pas en français.',
                            },
                            {
                                title: 'Nombres & heures',
                                description:
                                    'Compter, donner un prix, dire l’heure et fixer un rendez-vous.',
                            },
                            {
                                title: 'Articles définis',
                                description:
                                    'Der, die, das : reconnaître le genre et choisir le bon article.',
                            },
                        ],
                    },
                    {
                        title: 'Mon quotidien',
                        hours: 15,
                        description:
                            'Parler de sa journée, de ses goûts et de son environnement proche.',
                        lessons: [
                            {
                                title: 'Présent régulier',
                                description:
                                    'Conjuguer les verbes du quotidien et construire une phrase simple.',
                            },
                            {
                                title: 'Questions simples',
                                description:
                                    'W-Fragen et questions fermées pour demander une information.',
                            },
                            {
                                title: 'Famille & logement',
                                description:
                                    'Décrire les personnes et le lieu où tu vis avec un vocabulaire de base.',
                            },
                            {
                                title: 'Accusatif',
                                description:
                                    'Comprendre le complément d’objet direct et les premiers changements de forme.',
                            },
                        ],
                    },
                ],
            },
            {
                code: 'A1.2',
                title: 'Le quotidien',
                hours: 30,
                focus: ['Achats', 'Se déplacer', 'Accusatif', 'Parfait'],
                outcome:
                    'Tu commandes, tu demandes ton chemin et tu racontes ta journée au passé.',
                image: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&w=1200&q=80',
                program: [
                    {
                        title: 'Se déplacer et acheter',
                        hours: 15,
                        description:
                            'Demander son chemin, commander et gérer les achats du quotidien.',
                        lessons: [
                            {
                                title: 'Villes & transports',
                                description:
                                    'Demander son chemin, acheter un billet et comprendre une annonce.',
                            },
                            {
                                title: 'Au restaurant',
                                description:
                                    'Commander, demander l’addition et exprimer une préférence.',
                            },
                            {
                                title: 'Articles partitifs',
                                description:
                                    'Parler de quantités et commander sans te tromper.',
                            },
                            {
                                title: 'Verbes de modalité',
                                description:
                                    'Pouvoir, devoir, vouloir : exprimer une capacité ou une obligation.',
                            },
                        ],
                    },
                    {
                        title: 'Raconter sa journée',
                        hours: 15,
                        description:
                            'Utiliser le passé et les repères de temps pour raconter ton quotidien.',
                        lessons: [
                            {
                                title: 'Parfait',
                                description:
                                    'Former le passé composé et raconter ce que tu as fait.',
                            },
                            {
                                title: 'Heures & rendez-vous',
                                description:
                                    'Situer une action dans la journée et confirmer un horaire.',
                            },
                            {
                                title: 'Loisirs',
                                description:
                                    'Parler de ce que tu aimes et proposer une activité.',
                            },
                            {
                                title: 'Messages courts',
                                description:
                                    'Écrire un SMS ou un email simple avec les bonnes formules.',
                            },
                        ],
                    },
                ],
            },
        ],
        canDo: [
            'Te présenter et parler de toi sans paniquer',
            'Commander, acheter et demander un prix',
            'Comprendre une annonce ou un message court',
            'Écrire un message simple et correct',
            'Poser des questions et répondre au présent',
            'Tenir cinq minutes de conversation guidée',
        ],
        price: { solo: 2090, group: 720 },
        nextCohort: '11 janvier 2027',
        seats: { total: 6, left: 4 },
        icon: BookOpen,
        accent: accents.chart2,
    },
    {
        slug: 'a2',
        code: 'A2',
        name: 'Autonomie',
        tagline: "Raconter, se débrouiller, comprendre l'imprévu.",
        description:
            'Tu sors des phrases apprises par cœur. Tu racontes ton passé, tu donnes ton avis et tu gères les situations qui ne sont pas dans le livre.',
        hours: 60,
        image: 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?auto=format&fit=crop&w=1200&q=80',
        subLevels: [
            {
                code: 'A2.1',
                title: 'Raconter',
                hours: 30,
                focus: ['Passé', 'Datif', 'Voyages', 'Santé'],
                outcome:
                    'Tu racontes un week-end, tu décris un problème et tu demandes de l’aide.',
                image: 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?auto=format&fit=crop&w=1200&q=80',
                program: [
                    {
                        title: 'Récits du passé',
                        hours: 15,
                        description:
                            'Raconter une histoire, un voyage ou une anecdote avec les temps du passé.',
                        lessons: [
                            {
                                title: 'Prétérit',
                                description:
                                    'Raconter une histoire avec les verbes forts et faibles.',
                            },
                            {
                                title: 'Parfait vs prétérit',
                                description:
                                    'Choisir le temps juste à l’oral et à l’écrit.',
                            },
                            {
                                title: 'Datif',
                                description:
                                    'Identifier le complément d’attribution et les prépositions du datif.',
                            },
                            {
                                title: 'Week-end & vacances',
                                description:
                                    'Décrire un voyage et raconter une anecdote au passé.',
                            },
                        ],
                    },
                    {
                        title: 'Situations de la vie',
                        hours: 15,
                        description:
                            'Se débrouiller dans les situations concrètes : santé, logement, administration.',
                        lessons: [
                            {
                                title: 'Santé',
                                description:
                                    'Décrire un symptôme et comprendre les consignes d’un médecin.',
                            },
                            {
                                title: 'Logement',
                                description:
                                    'Chercher un appartement, comprendre une annonce et poser des questions.',
                            },
                            {
                                title: 'Administration',
                                description:
                                    'Comprendre un formulaire et expliquer une situation simple.',
                            },
                            {
                                title: 'Prépositions de lieu',
                                description:
                                    'Situer, orienter et décrire un trajet sans hésiter.',
                            },
                        ],
                    },
                ],
            },
            {
                code: 'A2.2',
                title: 'Argumenter simplement',
                hours: 30,
                focus: ['Subordonnées', 'Comparatif', 'Travail', 'Projets'],
                outcome:
                    'Tu expliques un choix, tu compares deux options et tu parles de tes projets.',
                image: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a2f9?auto=format&fit=crop&w=1200&q=80',
                program: [
                    {
                        title: 'Donner son avis',
                        hours: 15,
                        description:
                            'Comparer, justifier un choix et relier ses idées simplement.',
                        lessons: [
                            {
                                title: 'Comparatif',
                                description:
                                    'Comparer deux options et justifier un choix.',
                            },
                            {
                                title: 'Subordonnées avec weil/dass',
                                description:
                                    'Relier deux idées et expliquer une raison.',
                            },
                            {
                                title: 'Connecteurs simples',
                                description:
                                    'Structurer un propos avec d’abord, ensuite, enfin.',
                            },
                            {
                                title: 'Emails personnels',
                                description:
                                    'Répondre, remercier et proposer quelque chose par écrit.',
                            },
                        ],
                    },
                    {
                        title: 'Projets & travail',
                        hours: 15,
                        description:
                            'Parler de son avenir professionnel et se préparer aux premiers entretiens.',
                        lessons: [
                            {
                                title: 'Futur',
                                description:
                                    'Parler de tes projets avec le futur et le présent.',
                            },
                            {
                                title: 'Travail',
                                description:
                                    'Décrire ton métier, tes missions et tes conditions de travail.',
                            },
                            {
                                title: 'Entretien simple',
                                description:
                                    'Répondre aux questions classiques d’un premier entretien.',
                            },
                            {
                                title: 'Modaux au passé',
                                description:
                                    'Nuancer une obligation ou une possibilité au passé.',
                            },
                        ],
                    },
                ],
            },
        ],
        canDo: [
            'Raconter une expérience au passé',
            'Gérer un rendez-vous, un achat ou un imprévu',
            'Comprendre un email ou un article court',
            'Donner ton avis avec des phrases simples',
            'Décrire tes projets personnels et professionnels',
            'Tenir dix minutes d’échange sans revenir au français',
        ],
        price: { solo: 2090, group: 720 },
        nextCohort: '18 janvier 2027',
        seats: { total: 6, left: 3 },
        icon: MessagesSquare,
        accent: accents.chart4,
    },
    {
        slug: 'b1',
        code: 'B1',
        name: 'Confiance',
        tagline: 'Tenir un échange, défendre une idée, comprendre le réel.',
        description:
            "Le cap où l'allemand devient un outil. Tu comprends des textes authentiques, tu écris des emails et tu tiens un échange de quinze minutes sans traduire dans ta tête.",
        hours: 60,
        image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80',
        subLevels: [
            {
                code: 'B1.1',
                title: "S'exprimer",
                hours: 30,
                focus: ['Prétérit', 'Konjunktiv II', 'Médias', 'Récit'],
                outcome:
                    'Tu racontes une histoire, tu donnes ton opinion et tu réagis à l’actualité.',
                image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80',
                program: [
                    {
                        title: 'Raconter et réagir',
                        hours: 15,
                        description:
                            'Donner du relief à un récit et réagir à une information entendue.',
                        lessons: [
                            {
                                title: 'Prétérit narratif',
                                description:
                                    'Enchaîner les actions et donner du rythme à un récit.',
                            },
                            {
                                title: 'Konjunktiv II',
                                description:
                                    'Formuler une hypothèse, un souhait ou une demande polie.',
                            },
                            {
                                title: 'Discours indirect',
                                description:
                                    'Rapporter les paroles de quelqu’un sans déformer l’idée.',
                            },
                            {
                                title: 'Réagir à l’actualité',
                                description:
                                    'Donner son point de vue sur une information entendue.',
                            },
                        ],
                    },
                    {
                        title: 'Médias & société',
                        hours: 15,
                        description:
                            'Comprendre les médias et participer à un échange sur des sujets de société.',
                        lessons: [
                            {
                                title: 'Compréhension orale',
                                description:
                                    'Repérer l’essentiel d’une émission ou d’un reportage court.',
                            },
                            {
                                title: 'Vocabulaire des médias',
                                description:
                                    'Comprendre les titres, les rubriques et les opinions.',
                            },
                            {
                                title: 'Relatifs',
                                description:
                                    'Préciser une personne ou une chose avec der, die, das, den…',
                            },
                            {
                                title: 'Débat simple',
                                description:
                                    'Donner un avis, rebondir et concéder un point.',
                            },
                        ],
                    },
                ],
            },
            {
                code: 'B1.2',
                title: 'Argumenter',
                hours: 30,
                focus: ['Passif', 'Relatifs', 'Lettre formelle', 'Société'],
                outcome:
                    'Tu écris un email formel, tu structures un argument et tu défends une position.',
                image: 'https://images.unsplash.com/photo-1471107340929-a87cd0f5b5f3?auto=format&fit=crop&w=1200&q=80',
                program: [
                    {
                        title: 'Argumenter à l’écrit',
                        hours: 15,
                        description:
                            'Écrire des textes structurés et défendre une position avec les bons connecteurs.',
                        lessons: [
                            {
                                title: 'Lettre formelle',
                                description:
                                    'Choisir les formules, structurer une demande et conclure.',
                            },
                            {
                                title: 'Passif',
                                description:
                                    'Mettre l’action au premier plan et adapter le registre.',
                            },
                            {
                                title: 'Connecteurs logiques',
                                description:
                                    'Enchaîner cause, conséquence, opposition et but.',
                            },
                            {
                                title: 'Correction & style',
                                description:
                                    'Relire un texte et corriger les erreurs récurrentes.',
                            },
                        ],
                    },
                    {
                        title: 'Débattre à l’oral',
                        hours: 15,
                        description:
                            'Prendre la parole, nuancer son avis et défendre une idée en interaction.',
                        lessons: [
                            {
                                title: 'Opinion nuancée',
                                description:
                                    'Employer einerseits, andererseits et les formules d’accord partiel.',
                            },
                            {
                                title: 'Réunion courte',
                                description:
                                    'Prendre la parole, reformuler et proposer une solution.',
                            },
                            {
                                title: 'Société',
                                description:
                                    'Parler de sujets de société avec un vocabulaire précis.',
                            },
                            {
                                title: 'Présentation',
                                description:
                                    'Présenter un sujet en trois minutes avec un plan clair.',
                            },
                        ],
                    },
                ],
            },
        ],
        canDo: [
            'Comprendre un article de presse ou une émission courte',
            'Écrire un email formel clair et structuré',
            'Défendre une opinion avec des arguments simples',
            'Raconter une histoire au passé avec fluidité',
            'Gérer un entretien ou une réunion courte',
            'Tenir quinze minutes de conversation spontanée',
        ],
        price: { solo: 2090, group: 840 },
        nextCohort: '25 janvier 2027',
        seats: { total: 6, left: 4 },
        icon: Compass,
        accent: accents.chart1,
    },
    {
        slug: 'b2',
        code: 'B2',
        name: 'Précision',
        tagline: "Nuancer, structurer, viser l'examen ou le travail.",
        description:
            "Le niveau des études, du travail et des certificats. Tu structures un discours, tu nuances une idée et tu arrives le jour de l'examen avec des réflexes.",
        hours: 60,
        image: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1200&q=80',
        subLevels: [
            {
                code: 'B2.1',
                title: 'Structurer',
                hours: 30,
                focus: ['Nominalisation', 'Connecteurs', 'Débat', 'Études'],
                outcome:
                    'Tu construis un exposé, tu relies tes idées et tu argumentes avec nuance.',
                image: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1200&q=80',
                program: [
                    {
                        title: 'Structurer le discours',
                        hours: 15,
                        description:
                            'Construire un propos clair et varier le registre à l’écrit comme à l’oral.',
                        lessons: [
                            {
                                title: 'Nominalisation',
                                description:
                                    'Transformer les phrases et varier le registre à l’écrit.',
                            },
                            {
                                title: 'Connecteurs avancés',
                                description:
                                    'Exprimer la concession, la restriction et la finalité avec précision.',
                            },
                            {
                                title: 'Exposé',
                                description:
                                    'Construire une introduction, un développement et une conclusion.',
                            },
                            {
                                title: 'Études & travail',
                                description:
                                    'Présenter un parcours et argumenter un projet professionnel.',
                            },
                        ],
                    },
                    {
                        title: 'Débat & nuance',
                        hours: 15,
                        description:
                            'Défendre une position complexe et choisir le mot juste.',
                        lessons: [
                            {
                                title: 'Débat contradictoire',
                                description:
                                    'Réfuter, concéder et défendre une position structurée.',
                            },
                            {
                                title: 'Nuances lexicales',
                                description:
                                    'Distinguer les synonymes et choisir le mot juste.',
                            },
                            {
                                title: 'Subordonnées complexes',
                                description:
                                    'Maîtriser les constructions imbriquées à l’écrit.',
                            },
                            {
                                title: 'Oral spontané',
                                description:
                                    'Gagner en fluidité et gérer les hésitations.',
                            },
                        ],
                    },
                ],
            },
            {
                code: 'B2.2',
                title: 'Maîtriser',
                hours: 30,
                focus: [
                    'Style',
                    'Synthèse',
                    'Oral d’examen',
                    'Tâches TELC/ÖSD',
                ],
                outcome:
                    'Tu gères les épreuves complexes et tu adaptes ton registre au contexte.',
                image: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=1200&q=80',
                program: [
                    {
                        title: 'Style & synthèse',
                        hours: 15,
                        description:
                            'Lire des textes longs, synthétiser et soigner la forme de tes écrits.',
                        lessons: [
                            {
                                title: 'Synthèse de documents',
                                description:
                                    'Comparer plusieurs sources et rédiger une synthèse.',
                            },
                            {
                                title: 'Style formel',
                                description:
                                    'Adapter le registre, la ponctuation et les formules.',
                            },
                            {
                                title: 'Lecture longue',
                                description:
                                    'Repérer la thèse, les arguments et les nuances d’un texte.',
                            },
                            {
                                title: 'Correction autonome',
                                description:
                                    'Diagnostiquer et corriger tes erreurs sans aide.',
                            },
                        ],
                    },
                    {
                        title: 'Épreuves d’examen',
                        hours: 15,
                        description:
                            'Se préparer aux quatre épreuves TELC ou ÖSD en conditions réelles.',
                        lessons: [
                            {
                                title: 'Compréhension écrite TELC/ÖSD',
                                description:
                                    'Gérer le temps et repérer les pièges du format.',
                            },
                            {
                                title: 'Compréhension orale',
                                description:
                                    'Prendre des notes et répondre sous pression.',
                            },
                            {
                                title: 'Expression écrite',
                                description:
                                    'Planifier, rédiger et relire une tâche d’examen.',
                            },
                            {
                                title: 'Expression orale',
                                description:
                                    'Simuler l’entretien et l’exposé en conditions réelles.',
                            },
                        ],
                    },
                ],
            },
        ],
        canDo: [
            'Comprendre un texte long ou un débat',
            'Écrire une synthèse ou une lettre argumentée',
            'Défendre une position nuancée à l’oral',
            'Gérer les quatre épreuves d’un examen B2',
            'Adapter ton registre au contexte professionnel',
            'Parler trente minutes sans perdre le fil',
        ],
        price: { solo: 2090, group: 900 },
        nextCohort: '1 février 2027',
        seats: { total: 6, left: 2 },
        icon: Trophy,
        accent: accents.chart3,
        featured: true,
    },
];

export const formats: TrainingFormat[] = [
    {
        id: 'extensif',
        name: 'Extensif',
        icon: CalendarDays,
        schedule: '3 × 60 min / semaine',
        subLevel: '10 semaines',
        level: '20 semaines',
        description:
            'Le rythme des salariés et des étudiants. Tu progresses sans saturer, avec le temps d’assimiler entre les séances.',
        ideal: 'Salariés, étudiants',
    },
    {
        id: 'accelere',
        name: 'Accéléré',
        icon: Zap,
        schedule: '2 × 3 h / semaine',
        subLevel: '5 semaines',
        level: '10 semaines',
        description:
            'Deux blocs de trois heures : assez pour avancer vite, assez espacé pour laisser le cerveau digérer.',
        ideal: 'Disponibilité partielle',
    },
    {
        id: 'intensif',
        name: 'Intensif',
        icon: Flame,
        schedule: '5 × 3 h / semaine',
        subLevel: '2 semaines',
        level: '4 semaines',
        description:
            'Un niveau en un mois. Le format des vacances, des mutations et des deadlines qui ne se déplacent pas.',
        ideal: 'Vacances, mutation',
    },
    {
        id: 'super-intensif',
        name: 'Super intensif',
        icon: Rocket,
        schedule: '5 × 5 h / semaine',
        subLevel: '1–2 semaines',
        level: '2–3 semaines',
        description:
            'Le format examen : immersif, exigeant, avec un vrai travail personnel entre les séances.',
        ideal: 'Urgence examen',
    },
];

function examReferencePrice(level: ExamLevel): PriceSet {
    return {
        solo: getExamPackage('osd', level, 'full', 'solo').priceCents / 100,
        group: getExamPackage('osd', level, 'full', 'group').priceCents / 100,
    };
}

export const examPreps: ExamPrep[] = [
    {
        id: 'a1',
        level: 'A1',
        title: 'Prépa A1',
        subtitle: 'Les premières épreuves, bien préparées',
        volume: '4 × 90 min + 1 examen blanc',
        sessions: 4,
        image: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=1200&q=80',
        price: examReferencePrice('a1'),
        description:
            'Une préparation courte pour comprendre les épreuves, éviter les pièges de format et arriver sans surprise.',
        includes: [
            'Les quatre épreuves expliquées',
            'Un examen blanc corrigé',
            'Stratégie de base',
            'Feedback individuel',
        ],
        accent: accents.chart2,
    },
    {
        id: 'a2',
        level: 'A2',
        title: 'Prépa A2',
        subtitle: 'Gagner en autonomie à l’écrit et à l’oral',
        volume: '6 × 90 min + 1 examen blanc',
        sessions: 6,
        image: 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?auto=format&fit=crop&w=1200&q=80',
        price: examReferencePrice('a2'),
        description:
            'Compréhension et expression, à l’écrit comme à l’oral : des entraînements ciblés pour arriver prêt aux épreuves A2.',
        includes: [
            '6 séances de 90 min',
            '1 examen blanc complet corrigé',
            'Expression écrite et orale',
            'Stratégies de compréhension',
        ],
        accent: accents.chart4,
    },
    {
        id: 'b1',
        level: 'B1',
        title: 'Prépa B1',
        subtitle: 'Le socle pour travailler et voyager',
        volume: '10 × 90 min + 2 examens blancs',
        sessions: 10,
        image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80',
        price: examReferencePrice('b1'),
        description:
            'Le format complet : stratégie par épreuve, entraînement chronométré et deux passages blancs corrigés en détail.',
        includes: [
            '10 séances de 90 min',
            '2 examens blancs complets',
            'Corrections écrites détaillées',
            'Entraînement oral en binôme',
        ],
        accent: accents.chart1,
    },
    {
        id: 'b2',
        level: 'B2',
        title: 'Prépa B2',
        subtitle: 'Études, visa, emploi',
        volume: '10 × 90 min + 2 examens blancs',
        sessions: 10,
        image: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=1200&q=80',
        price: examReferencePrice('b2'),
        description:
            'La prépa la plus complète. On travaille la précision, la structure et la gestion du temps le jour J.',
        includes: [
            '10 séances de 90 min',
            '2 examens blancs complets',
            'Corrections écrites détaillées',
            'Simulation orale individuelle',
        ],
        accent: accents.chart3,
        popular: true,
    },
];

export const teacher = {
    name: 'Ton prof de VéninCorsé',
    role: "Professeur d'allemand · prépa ÖSD & TELC",
    bio: "Sept ans à enseigner l'allemand à des francophones, du premier « Guten Tag » au B2. Ma spécialité : rendre la grammaire visuelle, et préparer les examens sans t'épuiser.",
    stats: [
        { value: '7 ans', label: "d'enseignement" },
        { value: '200+', label: 'élèves accompagnés' },
        { value: '5,0', label: 'note moyenne' },
    ],
};

export const testimonials: Testimonial[] = [
    {
        initials: 'AK',
        name: 'Amina K.',
        city: 'Paris',
        objective: 'A1 → A2 en 4 mois',
        quote: "Je partais de zéro et je pensais l'allemand impossible. Aujourd'hui, je tiens une conversation simple et je regarde des séries sans sous-titres.",
    },
    {
        initials: 'GM',
        name: 'Grâce M.',
        city: 'Bruxelles',
        objective: 'TELC B2 obtenu',
        quote: "Les examens blancs et les corrections détaillées m'ont vraiment préparée. Je suis arrivée le jour J en connaissant déjà le format par cœur.",
    },
    {
        initials: 'TB',
        name: 'Thomas B.',
        city: 'Genève',
        objective: 'B1 professionnel',
        quote: "Mes cours après le travail, 100 % en visio. En quatre mois, je menais mes réunions avec l'équipe de Munich sans traducteur.",
    },
    {
        initials: 'SN',
        name: 'Sarah N.',
        city: 'Montréal',
        objective: 'Cours d’essai 1 h',
        quote: "J'ai commencé par une heure d'essai pour voir si la méthode me convenait. Le courant est passé tout de suite : je me suis inscrite la semaine suivante.",
    },
    {
        initials: 'DJ',
        name: 'David J.',
        city: 'Londres',
        objective: 'A1 en cours du soir',
        quote: "Le test gratuit m'a évité de payer pour un parcours inutile. J'ai commencé au bon endroit, avec le bon rythme.",
    },
    {
        initials: 'LF',
        name: 'Léa F.',
        city: 'Lyon',
        objective: 'Conversation B1',
        quote: 'Les séances de conversation me débloquent : je parle enfin sans traduire mot à mot dans ma tête.',
    },
];

export const faqs: FaqItem[] = [
    {
        question: 'Comment se déroule un parcours ?',
        answer: 'Chaque parcours couvre un niveau complet en 60 heures, divisé en deux sous-niveaux de 30 heures. Tu choisis le 1:1 ou le groupe, puis ton rythme : extensif, accéléré, intensif ou super intensif. Chaque sous-niveau se termine par un checkpoint oral et écrit.',
    },
    {
        question: 'Quelle est la différence entre le 1:1 et le groupe ?',
        answer: 'Le 1:1 est entièrement personnalisé : le professeur te consacre toute la séance, à un tarif plus élevé. Le groupe réunit 3 à 6 élèves : tu partages le coût et tu bénéficies de la dynamique collective et des corrections individuelles.',
    },
    {
        question: 'Comment se passe le cours d’essai d’une heure ?',
        answer: 'C’est une séance de 60 minutes en visio, en 1:1. On part de ton niveau réel : mises en situation, test oral et écrit rapide, puis discussion sur ton objectif et ton rythme. Les 39 € sont intégralement déduits de ton parcours si tu t’inscris sous 7 jours.',
    },
    {
        question: 'Puis-je commencer à n’importe quel moment ?',
        answer: 'Les cohortes de parcours démarrent en janvier, avril et septembre. Les formats accéléré et intensif ont des rentrées plus fréquentes. Si tu as déjà le niveau, tu peux rejoindre un sous-niveau en cours après un checkpoint d’entrée.',
    },
    {
        question: 'Comment se passe la préparation Goethe, ÖSD ou TELC ?',
        answer: 'Choisis le certificat, le niveau A1 à B2 et les épreuves à travailler : préparation complète, écrit ou oral. Le prix et le nombre de séances s’adaptent à ces choix. Tu sélectionnes ensuite un planning compatible avec ta date d’examen. L’inscription officielle et les frais du centre ne sont pas inclus.',
    },
    {
        question: 'Le test de niveau est-il vraiment gratuit ?',
        answer: 'Oui. Soixante questions, environ dix minutes, résultat immédiat : aucun paiement, aucun email et aucune inscription. Il te donne une estimation A1–B2 et le parcours recommandé. Le cours d’essai permet ensuite de confirmer ton niveau à l’oral.',
    },
    {
        question: 'Que se passe-t-il si le groupe n’ouvre pas ?',
        answer: 'Un groupe ouvre à partir de 3 inscrits. Si le groupe ne peut pas ouvrir, tu choisis entre un report à la cohorte suivante et un remboursement intégral. Aucun changement vers le 1:1 ni supplément sans ton accord.',
    },
    {
        question: 'Puis-je annuler ou déplacer une séance ?',
        answer: 'Tu peux reporter une séance sans frais jusqu’à 24 heures avant. Les séances manquées en groupe sont enregistrées et disponibles pendant 30 jours. Un parcours peut être annulé dans les 14 jours suivant l’inscription, conformément au droit de rétractation européen.',
    },
    {
        question: 'Comment se passe le paiement ?',
        answer: 'Tous les tarifs sont en euros, pensés pour la diaspora francophone en Europe et au Canada. Le paiement se fait par carte, PayPal ou virement. Un paiement en trois fois est possible avec +5 %.',
    },
];

export const included = [
    {
        icon: Video,
        title: 'Visio en direct',
        detail: 'Chaque séance se tient en visioconférence, sans déplacement.',
    },
    {
        icon: FileText,
        title: 'Supports dédiés',
        detail: 'Fiches, exercices et corrections envoyés après chaque cours.',
    },
    {
        icon: MessagesSquare,
        title: 'Corrections personnalisées',
        detail: 'Un retour précis sur tes erreurs, pas une note globale.',
    },
    {
        icon: TrendingUp,
        title: 'Deux checkpoints par niveau',
        detail: 'Un checkpoint et un retour écrit à chaque sous-niveau.',
    },
    {
        icon: Users,
        title: 'Mini-groupe 3–6',
        detail: 'Assez petit pour parler, assez grand pour progresser ensemble.',
    },
    {
        icon: CalendarDays,
        title: 'Replay 30 jours',
        detail: 'Tu revois chaque séance et tu rattrapes ce que tu as manqué.',
    },
] as const;

export const paymentOptions = [
    {
        icon: Target,
        title: 'Paiement en une fois',
        detail: 'Le prix affiché, sans frais cachés. Les supports et le suivi sont inclus.',
    },
    {
        icon: CalendarDays,
        title: 'Paiement en 3 fois',
        detail: 'Trois échéances mensuelles, avec +5 % pour couvrir les frais de gestion.',
    },
    {
        icon: GraduationCap,
        title: 'Cours d’essai crédité',
        detail: 'Les 39 € de l’heure d’essai sont déduits de ton parcours si tu t’inscris sous 7 jours.',
    },
] as const;

export const tierLabels: Record<TierKey, string> = {
    solo: '1:1',
    group: 'Groupe (3–6)',
};

export const tierShortLabels: Record<TierKey, string> = {
    solo: '1:1',
    group: 'Groupe',
};

export function formatPrice(value: number): string {
    return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'EUR',
        maximumFractionDigits: 0,
    }).format(value);
}

export function pricePerHour(value: number, hours: number): string {
    return formatPrice(Math.round(value / hours));
}

export function getLevel(slug: string | undefined): CourseLevel | undefined {
    return levels.find((level) => level.slug === slug);
}
