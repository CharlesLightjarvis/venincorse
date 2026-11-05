export type TextbookCollectionSlug =
    | 'menschen'
    | 'sicher'
    | 'netzwerk-neu'
    | 'studio-21';

export type TextbookLevel = 'A1' | 'A2' | 'B1' | 'B1+' | 'B2' | 'C1';

export type CourseLevelSlug = 'a1' | 'a2' | 'b1' | 'b2';

export type TextbookStatus = 'selected' | 'alternative';

export interface TextbookVolume {
    level: TextbookLevel;
    title: string;
    cover: string;
    /** Height divided by width. Used by the 3D book to keep the cover undistorted. */
    ratio: number;
    courseHref?: string;
}

export interface TextbookCollectionComparison {
    levels: string;
    format: string;
    approach: string;
    strengths: string;
    limits: string;
    usage: string;
}

export interface TextbookCollection {
    slug: TextbookCollectionSlug;
    order: string;
    name: string;
    publisher: string;
    levels: string;
    format: string;
    tagline: string;
    description: string;
    strengths: string[];
    limits: string[];
    verdict: string;
    badge: string;
    status: TextbookStatus;
    accent: string;
    accentDark: string;
    volumes: TextbookVolume[];
    comparison: TextbookCollectionComparison;
}

export interface TextbookPick {
    level: CourseLevelSlug;
    collection: TextbookCollectionSlug;
    volumeLevel: TextbookLevel;
    headline: string;
    description: string;
    points: string[];
}

export const textbookCollections: TextbookCollection[] = [
    {
        slug: 'menschen',
        order: '01',
        name: 'Menschen',
        publisher: 'Hueber',
        levels: 'A1 → B1',
        format: '3 volumes ou 6 demi-volumes',
        tagline: 'Les fondations, marche par marche.',
        description:
            'La collection qui porte nos parcours A1, A2 et B1. Sa progression lente, ses reprises constantes et ses situations du quotidien laissent le temps de comprendre avant de produire — exactement ce qu’il faut quand on repart de zéro ou après une longue pause.',
        strengths: [
            'Progression très lisible, sans gouffre entre deux unités',
            'Vocabulaire et grammaire constamment recyclés',
            'Riche en audios et vidéos faciles à réécouter',
            'Existe en 3 ou 6 volumes selon le rythme',
        ],
        limits: [
            'S’arrête à B1 : il faut changer de collection pour le B2',
            'Les tâches très guidées laissent parfois peu de place à l’improvisation',
        ],
        verdict: 'Notre colonne vertébrale de A1 à B1.',
        badge: 'Notre base',
        status: 'selected',
        accent: '#C2410C',
        accentDark: '#FB923C',
        volumes: [
            {
                level: 'A1',
                title: 'Menschen A1',
                cover: '/images/books/menschen-a1.jpg',
                ratio: 1.333,
                courseHref: '/courses/a1',
            },
            {
                level: 'A2',
                title: 'Menschen A2',
                cover: '/images/books/menschen-a2.jpg',
                ratio: 1.333,
                courseHref: '/courses/a2',
            },
            {
                level: 'B1',
                title: 'Menschen B1',
                cover: '/images/books/menschen-b1.jpg',
                ratio: 1.333,
                courseHref: '/courses/b1',
            },
        ],
        comparison: {
            levels: 'A1 → B1',
            format: '3 volumes ou 6 demi-volumes',
            approach: 'Communicative, progressive, très guidée',
            strengths: 'Progression douce, recyclage constant, audios riches',
            limits: 'S’arrête à B1, tâches parfois très cadrées',
            usage: 'A1, A2 et B1 — notre base',
        },
    },
    {
        slug: 'sicher',
        order: '02',
        name: 'Sicher!',
        publisher: 'Hueber',
        levels: 'B1+ → C1',
        format: '3 volumes ou 5 demi-volumes',
        tagline: 'La langue de précision.',
        description:
            'Au B2, la priorité change : il ne s’agit plus de survivre à une conversation, mais de structurer, nuancer et défendre une idée. Sicher! propose des textes plus longs, un lexique exigeant et des tâches ouvertes. La série continue jusqu’au C1 ; notre parcours s’arrête au B2, avec B1+ comme passerelle.',
        strengths: [
            'Excellent entraînement à la compréhension de textes longs',
            'Vocabulaire thématique solide et réutilisable',
            'Préparation sérieuse aux épreuves de production',
            'Structure claire, facile à suivre en autonomie',
        ],
        limits: [
            'Aucun niveau débutant : la série commence à B1+',
            'La densité peut décourager sans accompagnement régulier',
        ],
        verdict:
            'Notre choix pour le B2 — et B1+ si le B1 demande encore un détour.',
        badge: 'Notre B2',
        status: 'selected',
        accent: '#1D4ED8',
        accentDark: '#60A5FA',
        volumes: [
            {
                level: 'B1+',
                title: 'Sicher! B1+',
                cover: '/images/books/sicher-b1plus.jpg',
                ratio: 1.333,
            },
            {
                level: 'B2',
                title: 'Sicher! B2',
                cover: '/images/books/sicher-b2.jpg',
                ratio: 1.333,
                courseHref: '/courses/b2',
            },
        ],
        comparison: {
            levels: 'B1+ → C1',
            format: '3 volumes ou 5 demi-volumes',
            approach: 'Textes longs, lexique exigeant, production',
            strengths: 'Compréhension fine, vocabulaire solide, préparation B2',
            limits: 'Pas de niveau débutant, densité élevée',
            usage: 'B2 — notre choix ; B1+ en passerelle',
        },
    },
    {
        slug: 'netzwerk-neu',
        order: '03',
        name: 'Netzwerk neu',
        publisher: 'Klett',
        levels: 'A1 → B1',
        format: '3 volumes ou 6 demi-volumes',
        tagline: 'L’alternative qui bouge.',
        description:
            'Une méthode actionnelle et très visuelle, organisée autour de tâches concrètes, de vidéos et de projets. On l’ouvre quand un élève a besoin de voir, de manipuler et de bouger pour retenir — avec des supports numériques parmi les plus soignés du marché.',
        strengths: [
            'Mise en page claire et très visuelle',
            'Bon équilibre entre communication et grammaire',
            'Vidéos et audios intégrés à chaque unité',
            'Tâches de groupe faciles à réutiliser en cours',
        ],
        limits: [
            'S’arrête à B1',
            'Progression parfois rapide pour un vrai débutant',
            'Certaines pages chargées demandent d’être guidé',
        ],
        verdict: 'Notre alternative A1–B1, selon le profil et le rythme.',
        badge: 'Alternative',
        status: 'alternative',
        accent: '#BE185D',
        accentDark: '#F472B6',
        volumes: [
            {
                level: 'A1',
                title: 'Netzwerk neu A1',
                cover: '/images/books/netzwerk-a1.jpg',
                ratio: 1.332,
                courseHref: '/courses/a1',
            },
            {
                level: 'A2',
                title: 'Netzwerk neu A2',
                cover: '/images/books/netzwerk-a2.jpg',
                ratio: 1.332,
                courseHref: '/courses/a2',
            },
            {
                level: 'B1',
                title: 'Netzwerk neu B1',
                cover: '/images/books/netzwerk-b1.jpg',
                ratio: 1.332,
                courseHref: '/courses/b1',
            },
        ],
        comparison: {
            levels: 'A1 → B1',
            format: '3 volumes ou 6 demi-volumes',
            approach: 'Actionnelle, visuelle, tâches et projets',
            strengths: 'Mise en page claire, vidéos, bon équilibre',
            limits: 'S’arrête à B1, rythme soutenu',
            usage: 'Alternative A1 → B1',
        },
    },
    {
        slug: 'studio-21',
        order: '04',
        name: 'Studio [21]',
        publisher: 'Cornelsen',
        levels: 'A1 → B1',
        format: '3 volumes',
        tagline: 'L’atelier d’oral.',
        description:
            'Une méthode communicative avec un travail marqué sur l’oral, la prononciation et les jeux de rôle. Les séquences courtes donnent un rythme très concret aux premières heures. L’édition a vieilli, mais la mécanique pédagogique reste solide, surtout en petit groupe.',
        strengths: [
            'Travail de prononciation et d’oral particulièrement soigné',
            'Séquences courtes, faciles à découper en ateliers',
            'Banque d’exercices et de jeux de rôle riche',
            'Très bon pour les cours en petit groupe',
        ],
        limits: [
            'Édition plus ancienne (2013–2016)',
            'Univers graphique daté par rapport aux autres séries',
            'S’arrête à B1',
        ],
        verdict: 'À feuilleter si tu veux une autre approche de l’oral.',
        badge: 'À feuilleter',
        status: 'alternative',
        accent: '#B45309',
        accentDark: '#FBBF24',
        volumes: [
            {
                level: 'A1',
                title: 'Studio [21] A1',
                cover: '/images/books/studio-a1.jpg',
                ratio: 0.992,
                courseHref: '/courses/a1',
            },
            {
                level: 'A2',
                title: 'Studio [21] A2',
                cover: '/images/books/studio-a2.jpg',
                ratio: 0.992,
                courseHref: '/courses/a2',
            },
            {
                level: 'B1',
                title: 'Studio [21] B1',
                cover: '/images/books/studio-b1.jpg',
                ratio: 0.988,
                courseHref: '/courses/b1',
            },
        ],
        comparison: {
            levels: 'A1 → B1',
            format: '3 volumes',
            approach: 'Communicative, oral et prononciation',
            strengths: 'Jeux de rôle, séquences courtes, oral',
            limits: 'Édition datée, s’arrête à B1',
            usage: 'À feuilleter, selon le profil',
        },
    },
];

export const textbookPicks: TextbookPick[] = [
    {
        level: 'a1',
        collection: 'menschen',
        volumeLevel: 'A1',
        headline: 'Poser les fondations.',
        description:
            'On commence par Menschen A1 : des situations du quotidien, des phrases courtes et beaucoup de reprises. L’objectif n’est pas d’aller vite, mais de rendre les bases solides.',
        points: [
            'Se présenter, demander, comprendre une consigne simple',
            'Vocabulaire recyclé à chaque unité',
            'Premiers dialogues guidés dès la première séance',
        ],
    },
    {
        level: 'a2',
        collection: 'menschen',
        volumeLevel: 'A2',
        headline: 'Gagner en autonomie.',
        description:
            'Menschen A2 garde la même logique : on élargit les situations sans casser les repères. À la fin, tu racontes, tu compares et tu te débrouilles dans l’imprévu du quotidien.',
        points: [
            'Raconter au passé, exprimer un avis simple',
            'Comprendre des annonces et des messages courts',
            'Passer de phrases apprises à des phrases construites',
        ],
    },
    {
        level: 'b1',
        collection: 'menschen',
        volumeLevel: 'B1',
        headline: 'Tenir un échange réel.',
        description:
            'Menschen B1 est le dernier volume de la série. On y travaille la longueur, l’argumentation simple et la compréhension de documents authentiques courts — le socle avant le B2.',
        points: [
            'Défendre une idée, réagir, nuancer',
            'Comprendre un article ou une émission courte',
            'Écrire un message structuré et un petit texte',
        ],
    },
    {
        level: 'b2',
        collection: 'sicher',
        volumeLevel: 'B2',
        headline: 'Viser la précision.',
        description:
            'On change de collection au B2. Sicher! B2 propose des textes plus longs et des tâches plus ouvertes : c’est le moment de structurer, de nuancer et de gagner en assurance à l’écrit comme à l’oral.',
        points: [
            'Argumenter avec des connecteurs précis',
            'Comprendre des textes longs et des documents spécialisés',
            'Préparer les épreuves de production du Goethe-Zertifikat B2',
        ],
    },
];

export function getTextbookCollection(
    slug: TextbookCollectionSlug,
): TextbookCollection {
    const collection = textbookCollections.find((item) => item.slug === slug);

    if (!collection) {
        throw new Error(`Unknown textbook collection: ${slug}`);
    }

    return collection;
}

export function getTextbookVolume(
    collection: TextbookCollection,
    level: TextbookLevel,
): TextbookVolume {
    const volume = collection.volumes.find((item) => item.level === level);

    if (!volume) {
        throw new Error(`Unknown textbook volume: ${collection.slug} ${level}`);
    }

    return volume;
}
