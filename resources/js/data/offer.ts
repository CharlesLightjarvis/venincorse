import type { LucideIcon } from 'lucide-react';
import {
    BookOpen,
    CalendarDays,
    Compass,
    FileText,
    Flame,
    GraduationCap,
    MessagesSquare,
    Rocket,
    Sparkles,
    Target,
    TrendingUp,
    Trophy,
    Users,
    Video,
    Zap,
} from 'lucide-react';

export type LevelSlug = 'a1' | 'a2' | 'b1' | 'b2';
export type TierKey = 'solo' | 'duo' | 'group';

export interface PriceSet {
    solo: number;
    duo: number;
    group: number;
}

export interface Accent {
    text: string;
    bg: string;
    border: string;
    dot: string;
    gradient: string;
}

export interface SubLevel {
    code: string;
    title: string;
    hours: number;
    focus: string[];
    outcome: string;
    image: string;
}

export interface ParcoursLevel {
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
    id: string;
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

export interface Atelier {
    id: string;
    title: string;
    level: string;
    volume: string;
    sessions: number;
    image: string;
    price: PriceSet;
    description: string;
    outcomes: string[];
    accent: Accent;
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

export const levels: ParcoursLevel[] = [
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
            },
            {
                code: 'A1.2',
                title: 'Le quotidien',
                hours: 30,
                focus: ['Achats', 'Se déplacer', 'Accusatif', 'Parfait'],
                outcome:
                    'Tu commandes, tu demandes ton chemin et tu racontes ta journée au passé.',
                image: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&w=1200&q=80',
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
        price: { solo: 2090, duo: 1080, group: 720 },
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
            "Tu sors des phrases apprises par cœur. Tu racontes ton passé, tu donnes ton avis et tu gères les situations qui ne sont pas dans le livre.",
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
            },
            {
                code: 'A2.2',
                title: 'Argumenter simplement',
                hours: 30,
                focus: [
                    'Subordonnées',
                    'Comparatif',
                    'Travail',
                    'Projets',
                ],
                outcome:
                    'Tu expliques un choix, tu compares deux options et tu parles de tes projets.',
                image: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a2f9?auto=format&fit=crop&w=1200&q=80',
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
        price: { solo: 2090, duo: 1080, group: 720 },
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
            },
            {
                code: 'B1.2',
                title: 'Argumenter',
                hours: 30,
                focus: [
                    'Passif',
                    'Relatifs',
                    'Lettre formelle',
                    'Société',
                ],
                outcome:
                    'Tu écris un email formel, tu structures un argument et tu défends une position.',
                image: 'https://images.unsplash.com/photo-1471107340929-a87cd0f5b5f3?auto=format&fit=crop&w=1200&q=80',
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
        price: { solo: 2090, duo: 1080, group: 840 },
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
                focus: [
                    'Nominalisation',
                    'Connecteurs',
                    'Débat',
                    'Études',
                ],
                outcome:
                    'Tu construis un exposé, tu relies tes idées et tu argumentes avec nuance.',
                image: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1200&q=80',
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
        price: { solo: 2090, duo: 1080, group: 900 },
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

export const examPreps: ExamPrep[] = [
    {
        id: 'a1-a2',
        level: 'A1–A2',
        title: 'Prépa découverte',
        subtitle: 'Se familiariser avec le format',
        volume: '4 × 90 min + 1 examen blanc',
        sessions: 4,
        image: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=1200&q=80',
        price: { solo: 350, duo: 240, group: 170 },
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
        id: 'b1',
        level: 'B1',
        title: 'Prépa B1',
        subtitle: 'Le socle pour travailler et voyager',
        volume: '10 × 90 min + 2 examens blancs',
        sessions: 10,
        image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80',
        price: { solo: 890, duo: 610, group: 430 },
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
        price: { solo: 950, duo: 650, group: 460 },
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
    {
        id: 'focus',
        level: 'B1–B2',
        title: 'Focus oral ou écrit',
        subtitle: 'Débloquer une épreuve précise',
        volume: '4 × 90 min',
        sessions: 4,
        image: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&w=1200&q=80',
        price: { solo: 290, duo: 200, group: 140 },
        description:
            'Tu as déjà le niveau, mais une épreuve te bloque. On cible uniquement l’oral ou uniquement l’écrit.',
        includes: [
            '4 séances ciblées',
            'Diagnostic de l’épreuve',
            'Exercices chronométrés',
            'Plan de révision J-7',
        ],
        accent: accents.primary,
    },
];

export const ateliers: Atelier[] = [
    {
        id: 'articles',
        title: 'Articles & cas',
        level: 'A1–A2',
        volume: '4 × 90 min',
        sessions: 4,
        image: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=1200&q=80',
        price: { solo: 240, duo: 165, group: 120 },
        description:
            'Der, die, das et les cas : arrête de deviner. Des astuces visuelles, des exercices courts et un système pour retenir.',
        outcomes: [
            'Choisir le bon article sans hésiter',
            'Maîtriser nominatif, accusatif et datif',
            'Repérer les terminaisons qui donnent le genre',
            'Auto-corriger tes erreurs à l’oral',
        ],
        accent: accents.chart4,
    },
    {
        id: 'temps',
        title: 'Temps & subordonnées',
        level: 'B1–B2',
        volume: '4 × 90 min',
        sessions: 4,
        image: 'https://images.unsplash.com/photo-1471107340929-a87cd0f5b5f3?auto=format&fit=crop&w=1200&q=80',
        price: { solo: 240, duo: 165, group: 120 },
        description:
            'Parfait, prétérit, weil, dass, obwohl : construis des phrases qui tiennent debout, à l’écrit comme à l’oral.',
        outcomes: [
            'Choisir le bon temps du passé',
            'Construire des subordonnées correctes',
            'Utiliser les connecteurs logiques',
            'Gagner en précision à l’écrit',
        ],
        accent: accents.chart1,
    },
];

export const stage = {
    title: 'Stage de vacances',
    subtitle: 'Cinq jours pour débloquer un niveau',
    volume: '5 × 3 h',
    image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80',
    price: { solo: 525, duo: 330, group: 240 },
    description:
        'Un stage intensif en mini-groupe, pendant les vacances scolaires. Le matin, on apprend ; l’après-midi, on pratique. Idéal avant un examen ou une rentrée.',
    dates: ['Février 2027', 'Avril 2027', 'Juillet 2027'],
    accent: accents.chart3,
};

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
        objective: 'Soutien scolaire',
        quote: "Ma fille détestait l'allemand. Avec les séances du mercredi et les bilans réguliers, elle est remontée de 8 à 15 en un semestre.",
    },
    {
        initials: 'DJ',
        name: 'David J.',
        city: 'Londres',
        objective: 'A1 en cours du soir',
        quote: "Le bilan de niveau m'a évité de payer pour un parcours inutile. J'ai commencé au bon endroit, avec le bon rythme.",
    },
    {
        initials: 'LF',
        name: 'Léa F.',
        city: 'Lyon',
        objective: 'Conversation B1',
        quote: "Les séances de conversation me débloquent : je parle enfin sans traduire mot à mot dans ma tête.",
    },
];

export const faqs: FaqItem[] = [
    {
        question: 'Comment se déroule un parcours ?',
        answer:
            'Chaque parcours couvre un niveau complet en 60 heures, divisé en deux sous-niveaux de 30 heures. Tu suis deux séances de 90 minutes ou trois séances d’une heure par semaine, selon le rythme choisi. Chaque sous-niveau se termine par un checkpoint oral et écrit.',
    },
    {
        question: 'Quelle est la différence entre le 1:1, le duo et le groupe ?',
        answer:
            'Le 1:1 est entièrement personnalisé. Le duo permet de partager le cours avec une autre personne de ton niveau. Le groupe réunit 3 à 6 élèves : le tarif baisse, la dynamique change, et tu bénéficies quand même des corrections individuelles.',
    },
    {
        question: 'Pourquoi le bilan de niveau est-il payant ?',
        answer:
            'Parce qu’il dure 45 minutes et qu’il produit un plan écrit : ton niveau réel, ton objectif, le nombre d’heures nécessaires et le budget. Les 39 € sont intégralement déduits de ton premier parcours si tu t’inscris sous 7 jours.',
    },
    {
        question: 'Puis-je commencer à n’importe quel moment ?',
        answer:
            'Les cohortes de parcours démarrent en janvier, avril et septembre. Les formats accéléré et intensif ont des rentrées plus fréquentes. Si tu as déjà le niveau, tu peux rejoindre un sous-niveau en cours après un checkpoint d’entrée.',
    },
    {
        question: 'Comment se passe la préparation ÖSD ou TELC ?',
        answer:
            'La prépa est calée sur ta date d’examen. On commence 8 à 10 semaines avant : stratégie par épreuve, entraînement chronométré, deux examens blancs corrigés et un plan de révision pour les derniers jours.',
    },
    {
        question: 'Les cours sont-ils payés en euros ?',
        answer:
            'Oui, tous les tarifs sont en euros, pensés pour la diaspora francophone en Europe et au Canada. Le paiement se fait par carte, PayPal ou virement. Un paiement en trois fois est possible avec +5 %.',
    },
    {
        question: 'Que se passe-t-il si le groupe n’ouvre pas ?',
        answer:
            'Un groupe ouvre à partir de 3 inscrits. À 2, tu peux démarrer au tarif Duo. Si le groupe ne peut pas ouvrir, tu choisis entre un report à la cohorte suivante et un remboursement intégral.',
    },
    {
        question: 'Puis-je annuler ou déplacer une séance ?',
        answer:
            'Tu peux reporter une séance sans frais jusqu’à 24 heures avant. Les séances manquées en groupe sont enregistrées et disponibles pendant 30 jours. Un parcours peut être annulé dans les 14 jours suivant l’inscription, conformément au droit de rétractation européen.',
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
        title: 'Deux bilans par niveau',
        detail: 'Un checkpoint et un bilan écrit à chaque sous-niveau.',
    },
    {
        icon: Users,
        title: 'Mini-groupe 2–6',
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
        title: 'Bilan crédité',
        detail: 'Les 39 € du bilan sont déduits de ton parcours si tu t’inscris sous 7 jours.',
    },
] as const;

export const tierLabels: Record<TierKey, string> = {
    solo: '1:1',
    duo: 'Duo (2)',
    group: 'Groupe (3–6)',
};

export const tierShortLabels: Record<TierKey, string> = {
    solo: '1:1',
    duo: 'Duo',
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

export function getLevel(slug: string | undefined): ParcoursLevel | undefined {
    return levels.find((level) => level.slug === slug);
}
