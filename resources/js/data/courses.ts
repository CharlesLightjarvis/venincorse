import type { LucideIcon } from "lucide-react";
import {
    Blocks,
    BookOpen,
    Briefcase,
    Flame,
    GraduationCap,
    MessagesSquare,
    SpellCheck,
    User,
    Users,
} from "lucide-react";

export const levelOrder = [
    "A1.1",
    "A1.2",
    "A2.1",
    "A2.2",
    "B1.1",
    "B1.2",
    "B2.1",
    "B2.2",
] as const;

export type Level = (typeof levelOrder)[number];
export type LevelGroup = "A1" | "A2" | "B1" | "B2";
export type Category =
    | "standard"
    | "grammaire"
    | "conversation"
    | "examens"
    | "affaires"
    | "soutien";
export type CourseFormat = "prive" | "mini_groupe" | "stage";

export const groupOf = (level: Level): LevelGroup =>
    level.slice(0, 2) as LevelGroup;

export interface CourseMock {
    slug: string;
    title: string;
    category: Category;
    levels: Level[];
    format: CourseFormat;
    price: string;
    sessionLabel: string;
    durationMin: number;
    description: string;
    isPopular?: boolean;
}

export const categoryMeta: Record<
    Category,
    { label: string; icon: LucideIcon; tile: string; text: string }
> = {
    standard: {
        label: "Cours standard",
        icon: BookOpen,
        tile: "bg-gradient-to-br from-primary/15 to-primary/[0.04]",
        text: "text-primary",
    },
    grammaire: {
        label: "Grammaire",
        icon: SpellCheck,
        tile: "bg-gradient-to-br from-chart-4/15 to-chart-4/[0.04]",
        text: "text-chart-4",
    },
    conversation: {
        label: "Conversation",
        icon: MessagesSquare,
        tile: "bg-gradient-to-br from-chart-2/15 to-chart-2/[0.04]",
        text: "text-chart-2",
    },
    examens: {
        label: "Examens",
        icon: GraduationCap,
        tile: "bg-gradient-to-br from-chart-1/15 to-chart-1/[0.04]",
        text: "text-chart-1",
    },
    affaires: {
        label: "Affaires",
        icon: Briefcase,
        tile: "bg-gradient-to-br from-chart-3/15 to-chart-3/[0.04]",
        text: "text-chart-3",
    },
    soutien: {
        label: "Soutien",
        icon: Blocks,
        tile: "bg-gradient-to-br from-chart-5/15 to-chart-5/[0.04]",
        text: "text-chart-5",
    },
};

export const levelClasses: Record<LevelGroup, string> = {
    A1: "bg-chart-2/10 text-chart-2",
    A2: "bg-chart-4/10 text-chart-4",
    B1: "bg-chart-1/10 text-chart-1",
    B2: "bg-chart-3/10 text-chart-3",
};

export const formatMeta: Record<CourseFormat, { label: string; icon: LucideIcon }> =
    {
        prive: { label: "Cours privé 1:1", icon: User },
        mini_groupe: { label: "Mini-groupe 4–6", icon: Users },
        stage: { label: "Stage intensif", icon: Flame },
    };

export const courses: CourseMock[] = [
    {
        slug: "allemand-a1-1",
        title: "Allemand A1.1 — Premiers pas",
        category: "standard",
        levels: ["A1.1"],
        format: "prive",
        price: "44 000",
        sessionLabel: "pack de 8 séances",
        durationMin: 60,
        description:
            "Alphabet, conjugaison du présent et premières phrases : tu te présentes et tu poses tes premières questions.",
    },
    {
        slug: "allemand-a1-2",
        title: "Allemand A1.2 — Bases solides",
        category: "standard",
        levels: ["A1.2"],
        format: "prive",
        price: "44 000",
        sessionLabel: "pack de 8 séances",
        durationMin: 60,
        description:
            "Accusatif, parfait et dialogues du quotidien : courses, rendez-vous, s'orienter en ville.",
    },
    {
        slug: "allemand-a2-1",
        title: "Allemand A2.1 — Quotidien",
        category: "standard",
        levels: ["A2.1"],
        format: "prive",
        price: "48 000",
        sessionLabel: "pack de 8 séances",
        durationMin: 60,
        description:
            "Datif, prétérit et écrit simple : tu racontes ton quotidien et tu gères les situations courantes.",
    },
    {
        slug: "allemand-a2-2",
        title: "Allemand A2.2 — Autonomie",
        category: "standard",
        levels: ["A2.2"],
        format: "prive",
        price: "48 000",
        sessionLabel: "pack de 8 séances",
        durationMin: 60,
        description:
            "Prépositions, subordonnées et passé : tu décris ton parcours, tes envies et tes projets.",
    },
    {
        slug: "allemand-b1-1",
        title: "Allemand B1.1 — Approfondir",
        category: "standard",
        levels: ["B1.1"],
        format: "prive",
        price: "52 000",
        sessionLabel: "pack de 8 séances",
        durationMin: 60,
        description:
            "Verbes à préfixe et Konjunktiv II naissant : tu donnes ton avis et tu t'exprimes avec nuance.",
    },
    {
        slug: "allemand-b1-2",
        title: "Allemand B1.2 — Nuance",
        category: "standard",
        levels: ["B1.2"],
        format: "prive",
        price: "52 000",
        sessionLabel: "pack de 8 séances",
        durationMin: 60,
        description:
            "Passif, textes argumentés et débats guidés : tu défends un point de vue en complet.",
    },
    {
        slug: "allemand-b2-1",
        title: "Allemand B2.1 — Précision",
        category: "standard",
        levels: ["B2.1"],
        format: "prive",
        price: "56 000",
        sessionLabel: "pack de 8 séances",
        durationMin: 60,
        description:
            "Structures complexes et textes longs : tu argumentes, tu négocies, tu nuances.",
    },
    {
        slug: "allemand-b2-2",
        title: "Allemand B2.2 — Maîtrise",
        category: "standard",
        levels: ["B2.2"],
        format: "prive",
        price: "56 000",
        sessionLabel: "pack de 8 séances",
        durationMin: 60,
        description:
            "Style soutenu, rédaction avancée et oraux de haut niveau : prêt pour le C1.",
    },
    {
        slug: "atelier-der-die-das",
        title: "Atelier Der-Die-Das",
        category: "grammaire",
        levels: ["A1.1", "A1.2", "A2.1", "A2.2"],
        format: "mini_groupe",
        price: "4 000",
        sessionLabel: "par séance",
        durationMin: 90,
        description:
            "Le genre et les articles, enfin intuitifs : astuces visuelles et exercices corrigés en direct.",
    },
    {
        slug: "atelier-cas-declinaisons",
        title: "Atelier cas & déclinaisons",
        category: "grammaire",
        levels: ["B1.1", "B1.2", "B2.1"],
        format: "mini_groupe",
        price: "5 000",
        sessionLabel: "par séance",
        durationMin: 90,
        description:
            "Nominatif, accusatif, datif, génitif : les déclinaisons deviennent des réflexes.",
    },
    {
        slug: "conversation-orale-jeudis",
        title: "Conversation orale — jeudis",
        category: "conversation",
        levels: ["B1.1", "B1.2", "B2.1", "B2.2"],
        format: "mini_groupe",
        price: "5 000",
        sessionLabel: "par séance",
        durationMin: 60,
        description:
            "Débats, jeux de rôle et feedback individuel : tu parles 80 % du temps de la séance.",
    },
    {
        slug: "table-conversation-debutants",
        title: "Table de conversation débutants",
        category: "conversation",
        levels: ["A2.1", "A2.2"],
        format: "mini_groupe",
        price: "4 000",
        sessionLabel: "par séance",
        durationMin: 60,
        description:
            "Dialogues guidés et petites histoires pour oser tes premières phrases en groupe.",
    },
    {
        slug: "stage-goethe-b2",
        title: "Stage Goethe-Zertifikat B2",
        category: "examens",
        levels: ["B2.1", "B2.2"],
        format: "stage",
        price: "45 000",
        sessionLabel: "stage de 10 jours",
        durationMin: 120,
        description:
            "Mock tests complets corrigés, stratégie des 4 épreuves et entraînement oral intensif.",
        isPopular: true,
    },
    {
        slug: "preparation-goethe-b1",
        title: "Préparation Goethe B1",
        category: "examens",
        levels: ["B1.1", "B1.2"],
        format: "prive",
        price: "30 000",
        sessionLabel: "6 séances",
        durationMin: 90,
        description:
            "Oral en binôme, écrits corrigés et simulations d'examen chronométrées.",
    },
    {
        slug: "allemand-des-affaires",
        title: "Allemand des affaires",
        category: "affaires",
        levels: ["B1.1", "B1.2", "B2.1", "B2.2"],
        format: "prive",
        price: "6 500",
        sessionLabel: "par séance",
        durationMin: 60,
        description:
            "Réunions, emails et négociation : le vocabulaire professionnel en mises en situation.",
    },
    {
        slug: "soutien-scolaire",
        title: "Soutien scolaire (8–15 ans)",
        category: "soutien",
        levels: ["A1.1", "A1.2", "A2.1"],
        format: "prive",
        price: "3 500",
        sessionLabel: "par séance",
        durationMin: 45,
        description:
            "Programme scolaire, méthodes ludiques et bilan de progression envoyé aux parents.",
    },
];

export function levelLabel(levels: Level[]): string {
    const groups = Array.from(new Set(levels.map(groupOf)));

    if (groups.length > 1) {
        return `${groups[0]} – ${groups[groups.length - 1]}`;
    }

    return levels.length === 1 ? levels[0] : groups[0];
}

export const objectivesByCategory: Record<Category, string[]> = {
    standard: [
        "Te présenter, parler de toi et poser des questions",
        "Comprendre les annonces et conversations courtes",
        "Écrire des messages simples et valider ton niveau",
    ],
    grammaire: [
        "Employer le bon article sans hésiter",
        "Maîtriser les cas dans des phrases réelles",
        "Auto-corriger tes erreurs d'article à l'oral",
    ],
    conversation: [
        "Tenir une conversation de plus de 10 minutes",
        "Réagir naturellement aux questions inattendues",
        "Gagner en fluidité face à des locuteurs natifs",
    ],
    examens: [
        "Connaître le format et la stratégie des 4 épreuves",
        "Gérer ton temps le jour de l'examen",
        "Réaliser des mock tests complets corrigés",
    ],
    affaires: [
        "Animer une réunion et t'exprimer en équipe",
        "Rédiger des emails professionnels irréprochables",
        "Négocier avec le vocabulaire approprié",
    ],
    soutien: [
        "Reprendre confiance avec le programme scolaire",
        "Oser prendre la parole en classe",
        "Progresser avec un bilan clair chaque mois",
    ],
};

export const includedPerCourse = [
    {
        icon: "FileText",
        title: "Compte-rendu",
        detail: "Un résumé détaillé après chaque séance",
    },
    {
        icon: "PencilLine",
        title: "Exercices",
        detail: "Des exercices personnalisés entre les séances",
    },
    {
        icon: "MessageCircle",
        title: "Accès prof",
        detail: "Ton prof répond à tes questions via WhatsApp",
    },
    {
        icon: "TrendingUp",
        title: "Bilan",
        detail: "Un bilan de progression chaque mois",
    },
] as const;

export const modulesByCategory: Record<Category, string[]> = {
    standard: [
        "Diagnostic : évaluation de ton niveau et de tes objectifs",
        "Notions clés : grammaire et vocabulaire avec exercices guidés",
        "Pratique orale avec feedback individualisé",
        "Consolidation : corrections, quiz et plan pour la semaine",
    ],
    grammaire: [
        "Réactivation : rappels express avant chaque atelier",
        "Astuce visuelle : la règle du jour, vue en une image",
        "Exercices corrigés en groupe, erreurs débattues",
        "Entraînement rapide : 10 flash questions pour ancrer",
    ],
    conversation: [
        "Mise en route : échauffement en petites phrases",
        "Thème du jour : vocabulaire et expressions utiles",
        "Débat ou jeu de rôle corrigé en direct",
        "Feedback individualisé et prochaine étape",
    ],
    examens: [
        "Mock test complet en conditions d'examen",
        "Correction détaillée épreuve par épreuve",
        "Stratégies et gestion du temps le jour J",
        "Entraînement oral intensif en binôme",
    ],
    affaires: [
        "Contexte pro : ton poste, ton secteur, tes besoins",
        "Vocabulaire ciblé et expressions professionnelles",
        "Mise en situation : réunion, appel ou email",
        "Corrections et plan d'action pour la semaine",
    ],
    soutien: [
        "Reprise du cours de l'école de la semaine",
        "Exercices ludiques sur les points faibles",
        "Petit défi oral pour créer la confiance",
        "Bilan simple envoyé aux parents",
    ],
};
