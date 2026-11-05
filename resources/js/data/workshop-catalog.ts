import type { LevelSlug, PriceSet, TierKey } from './offer';

export interface GrammarPack {
    id: string;
    level: LevelSlug;
    title: string;
    description: string;
    image: string;
    sessions: number;
    durationMinutes: number;
    price: PriceSet;
    outcome: string;
    focus: string[];
    canDo: string[];
    program: { title: string; description: string }[];
}

export interface PracticeWorkshop {
    id: string;
    title: string;
    subtitle: string;
    description: string;
    focus: string[];
    image: string;
    durationMinutes: number;
    price: PriceSet;
    levels: Record<
        LevelSlug,
        { task: string; outcome: string; activities: string[] }
    >;
}

export const workshopLevels: LevelSlug[] = ['a1', 'a2', 'b1', 'b2'];

export const grammarPacks: GrammarPack[] = [
    {
        id: 'grammar-a1',
        level: 'a1',
        title: 'Grammaire A1',
        description:
            'Les bases pour comprendre comment une phrase allemande se construit, sans apprendre des tableaux au hasard.',
        image: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=1200&q=80',
        sessions: 4,
        durationMinutes: 90,
        price: { solo: 240, group: 120 },
        outcome:
            'Construire tes premières phrases et repérer les erreurs de base.',
        focus: ['Articles', 'Présent', 'Négation', 'Accusatif'],
        canDo: [
            'Choisir entre der, die et das avec des repères fiables.',
            'Construire une phrase simple et poser une question.',
            'Utiliser nicht et kein sans confondre les deux.',
            'Employer les modaux et l’accusatif dans un dialogue court.',
        ],
        program: [
            {
                title: 'Articles, genres et pronoms',
                description:
                    'Der, die, das, ein, eine : associer le nom à son article et remplacer une personne par un pronom.',
            },
            {
                title: 'Présent et place du verbe',
                description:
                    'Conjuguer les verbes fréquents, poser une question et organiser une phrase affirmative.',
            },
            {
                title: 'Négation et possessifs',
                description:
                    'Choisir entre nicht et kein, dire ce qui t’appartient et corriger des phrases du quotidien.',
            },
            {
                title: 'Accusatif et verbes de modalité',
                description:
                    'Comprendre den/einen, utiliser können, müssen et wollen dans des mini-dialogues.',
            },
        ],
    },
    {
        id: 'grammar-a2',
        level: 'a2',
        title: 'Grammaire A2',
        description:
            'Le passé, le datif et les premières phrases complexes : relier les règles pour mieux les utiliser.',
        image: 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?auto=format&fit=crop&w=1200&q=80',
        sessions: 5,
        durationMinutes: 90,
        price: { solo: 300, group: 150 },
        outcome:
            'Raconter une expérience et relier tes idées avec des structures plus sûres.',
        focus: ['Perfekt', 'Datif', 'Prépositions', 'Subordonnées'],
        canDo: [
            'Raconter une expérience au passé avec le bon auxiliaire.',
            'Repérer à qui s’adresse l’action et utiliser le datif.',
            'Choisir la bonne préposition selon le lieu ou le déplacement.',
            'Relier deux idées avec weil, dass ou wenn.',
        ],
        program: [
            {
                title: 'Le Perfekt, sans deviner',
                description:
                    'Choisir haben ou sein, former le participe et raconter ce que tu as fait.',
            },
            {
                title: 'Datif et prépositions',
                description:
                    'Repérer à qui s’adresse l’action et utiliser mit, nach, bei, zu, von…',
            },
            {
                title: 'Position ou déplacement ?',
                description:
                    'Distinguer wo et wohin avec les prépositions à deux cas, à partir de situations concrètes.',
            },
            {
                title: 'Weil, dass et wenn',
                description:
                    'Construire une subordonnée avec le verbe à la fin et expliquer une raison ou une condition.',
            },
            {
                title: 'Comparer et nuancer',
                description:
                    'Comparatif, superlatif et modaux au passé : choisir une option et expliquer pourquoi.',
            },
        ],
    },
    {
        id: 'grammar-b1',
        level: 'b1',
        title: 'Grammaire B1',
        description:
            'Donner de la structure à tes récits, tes opinions et tes messages, au-delà des phrases simples.',
        image: 'https://images.unsplash.com/photo-1471107340929-a87cd0f5b5f3?auto=format&fit=crop&w=1200&q=80',
        sessions: 6,
        durationMinutes: 90,
        price: { solo: 360, group: 180 },
        outcome:
            'Organiser un récit et expliquer un avis en variant les constructions.',
        focus: ['Temps du récit', 'Relatives', 'Konjunktiv II', 'Passif'],
        canDo: [
            'Situer les événements d’un récit dans le bon ordre.',
            'Préciser une personne ou un objet avec une relative.',
            'Formuler un conseil ou une hypothèse au Konjunktiv II.',
            'Décrire une procédure au passif sans alourdir la phrase.',
        ],
        program: [
            {
                title: 'Les temps du récit',
                description:
                    'Articuler Perfekt, Präteritum et Plusquamperfekt pour raconter les événements dans le bon ordre.',
            },
            {
                title: 'Les propositions relatives',
                description:
                    'Préciser une personne ou un objet sans répéter le même nom dans chaque phrase.',
            },
            {
                title: 'Le Konjunktiv II',
                description:
                    'Formuler un conseil, un souhait ou une hypothèse avec les structures adaptées.',
            },
            {
                title: 'Le passif',
                description:
                    'Décrire une procédure et mettre l’action au premier plan.',
            },
            {
                title: 'But, opposition et concession',
                description:
                    'Utiliser um…zu, damit, obwohl et trotzdem dans des phrases qui tiennent ensemble.',
            },
            {
                title: 'Les terminaisons de l’adjectif',
                description:
                    'Relier article, cas et terminaison, puis apprendre à relire tes propres phrases.',
            },
        ],
    },
    {
        id: 'grammar-b2',
        level: 'b2',
        title: 'Grammaire B2',
        description:
            'Des structures plus fines pour gagner en précision et adapter ton allemand au contexte.',
        image: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=1200&q=80',
        sessions: 6,
        durationMinutes: 90,
        price: { solo: 390, group: 195 },
        outcome:
            'Nuancer un argument et reformuler des phrases complexes avec plus de précision.',
        focus: [
            'Connecteurs',
            'Nominalisation',
            'Discours indirect',
            'Reformulation',
        ],
        canDo: [
            'Enchaîner des arguments avec des connecteurs variés.',
            'Passer d’une formulation verbale à une formulation nominale.',
            'Rapporter un propos en respectant le registre.',
            'Reformuler une phrase complexe sans en perdre le sens.',
        ],
        program: [
            {
                title: 'Connecteurs avancés',
                description:
                    'Exprimer la concession, la conséquence et la restriction en variant les constructions.',
            },
            {
                title: 'Nominalisation et verbalisation',
                description:
                    'Passer d’une structure verbale à une structure nominale pour adapter le registre.',
            },
            {
                title: 'Le passif et ses alternatives',
                description:
                    'Reformuler avec sich lassen, sein…zu et d’autres structures selon le sens visé.',
            },
            {
                title: 'Rapporter un propos',
                description:
                    'Travailler le discours indirect et les usages du Konjunktiv I dans les textes.',
            },
            {
                title: 'Groupes participiaux',
                description:
                    'Comprendre les groupes complexes et les transformer en phrases plus lisibles.',
            },
            {
                title: 'Atelier de reformulation',
                description:
                    'Réviser un texte, corriger les erreurs récurrentes et justifier ses choix de structure.',
            },
        ],
    },
];

export const practiceWorkshops: PracticeWorkshop[] = [
    {
        id: 'sprechen',
        title: 'Sprechen',
        subtitle: 'Le rendez-vous pour parler',
        focus: ['Jeux de rôle', 'Fluidité', 'Prononciation'],
        description:
            'Mises en situation, échanges guidés puis spontanés : tu passes la séance à prendre la parole, pas à écouter un cours.',
        image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80',
        durationMinutes: 90,
        price: { solo: 65, group: 30 },
        levels: {
            a1: {
                task: 'Au café : commander, demander un prix et se présenter.',
                outcome:
                    'Repartir avec un mini-dialogue que tu sais réutiliser.',
                activities: [
                    'Échauffement avec des questions simples',
                    'Jeux de rôle en binômes ou avec le professeur',
                    'Retour ciblé sur les expressions et la prononciation',
                ],
            },
            a2: {
                task: 'En voyage : raconter un week-end et gérer un petit imprévu.',
                outcome:
                    'Raconter une expérience et demander de l’aide plus facilement.',
                activities: [
                    'Questions-réponses au passé',
                    'Jeux de rôle à l’hôtel et dans les transports',
                    'Reformulations et expressions à retenir',
                ],
            },
            b1: {
                task: 'Donner son avis : faut-il changer nos habitudes de travail ?',
                outcome:
                    'Défendre une idée et rebondir sur l’avis de quelqu’un.',
                activities: [
                    'Préparer quelques arguments',
                    'Discussion guidée et réactions spontanées',
                    'Retour sur la fluidité et les connecteurs',
                ],
            },
            b2: {
                task: 'Débat : télétravail, intelligence artificielle et société.',
                outcome: 'Nuancer ton propos et répondre à une objection.',
                activities: [
                    'Prendre position à partir d’un document court',
                    'Débat contradictoire et reformulation',
                    'Feedback sur la précision et le registre',
                ],
            },
        },
    },
    {
        id: 'schreiben',
        title: 'Schreiben',
        subtitle: 'Écrire, corriger, réécrire',
        focus: ['Structure', 'Registre', 'Relecture'],
        description:
            'Une consigne concrète, un premier texte, des corrections expliquées : tu repars avec une version améliorée et des repères.',
        image: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=1200&q=80',
        durationMinutes: 90,
        price: { solo: 65, group: 30 },
        levels: {
            a1: {
                task: 'Écrire un message pour te présenter et proposer un rendez-vous.',
                outcome: 'Un message court corrigé, avec les formules utiles.',
                activities: [
                    'Lire un modèle simple',
                    'Rédiger ton propre message pendant la séance',
                    'Corriger et réécrire avec le professeur',
                ],
            },
            a2: {
                task: 'Rédiger une invitation ou un email pour organiser un séjour.',
                outcome:
                    'Un email clair avec les informations dans le bon ordre.',
                activities: [
                    'Repérer les informations indispensables',
                    'Rédiger avec des connecteurs simples',
                    'Relire et améliorer le texte',
                ],
            },
            b1: {
                task: 'Écrire une demande formelle ou une réclamation argumentée.',
                outcome: 'Un email structuré avec un registre adapté.',
                activities: [
                    'Construire un plan en trois parties',
                    'Rédiger une demande et la justifier',
                    'Travailler les formulations et corriger les erreurs',
                ],
            },
            b2: {
                task: 'Rédiger une prise de position sur un sujet de société.',
                outcome:
                    'Un texte argumenté révisé, avec une grille de relecture.',
                activities: [
                    'Organiser les arguments et les contre-arguments',
                    'Rédiger une première version',
                    'Reformuler pour gagner en nuance et en précision',
                ],
            },
        },
    },
    {
        id: 'wortschatz',
        title: 'Wortschatz',
        subtitle: 'Du vocabulaire qui revient en jouant',
        focus: ['Jeux', 'Mémorisation', 'Réemploi'],
        description:
            'Bingo, devinettes, associations et défis : tu retrouves les mots, tu les expliques et tu les réutilises dans une vraie phrase.',
        image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80',
        durationMinutes: 60,
        price: { solo: 45, group: 20 },
        levels: {
            a1: {
                task: 'Le quotidien : objets, aliments, famille et actions simples.',
                outcome:
                    'Une fiche de mots réutilisés dans des phrases personnelles.',
                activities: [
                    'Bingo des mots et des images',
                    'Associations et mémoire',
                    'Mini-défis : décrire sans montrer',
                ],
            },
            a2: {
                task: 'Voyages et métiers : retrouver le mot utile dans une situation.',
                outcome: 'Des expressions prêtes à réutiliser au quotidien.',
                activities: [
                    'Devinettes autour des métiers',
                    'Défis de catégories',
                    'Scènes courtes avec les mots gagnés',
                ],
            },
            b1: {
                task: 'Exprimer une idée sans répéter toujours les mêmes mots.',
                outcome:
                    'Un petit répertoire de synonymes et de familles de mots.',
                activities: [
                    'Tabou : faire deviner sans les mots interdits',
                    'Jeux de familles de mots',
                    'Défis de reformulation en contexte',
                ],
            },
            b2: {
                task: 'Nuances, expressions et associations naturelles de mots.',
                outcome:
                    'Des collocations et expressions utilisées dans un échange.',
                activities: [
                    'Faire deviner un concept abstrait',
                    'Associer verbes, noms et prépositions',
                    'Débat express avec des expressions imposées',
                ],
            },
        },
    },
];

export function workshopVolume(
    sessions: number,
    durationMinutes: number,
): string {
    return sessions === 1
        ? `${durationMinutes} min · une séance`
        : `${sessions} × ${durationMinutes} min · ${((sessions * durationMinutes) / 60).toLocaleString('fr-FR')} h`;
}

export type WorkshopOffer =
    | { category: 'grammar'; pack: GrammarPack }
    | { category: 'practice'; workshop: PracticeWorkshop };

export function getWorkshopOffer(slug: string): WorkshopOffer | undefined {
    const pack = grammarPacks.find((item) => item.id === slug);
    if (pack) {
        return { category: 'grammar', pack };
    }
    const workshop = practiceWorkshops.find((item) => item.id === slug);
    return workshop ? { category: 'practice', workshop } : undefined;
}

export function getWorkshopSelection(
    id: string,
    level: LevelSlug,
    tier: TierKey,
) {
    const pack = grammarPacks.find((item) => item.id === id);
    if (pack) {
        return {
            id: pack.id,
            title: pack.title,
            level: pack.level,
            price: pack.price[tier],
            volume: workshopVolume(pack.sessions, pack.durationMinutes),
            outcome: pack.outcome,
            category: 'grammar' as const,
        };
    }
    const workshop = practiceWorkshops.find((item) => item.id === id);
    if (!workshop || !workshop.levels[level]) {
        return undefined;
    }
    return {
        id: workshop.id,
        title: workshop.title,
        level,
        price: workshop.price[tier],
        volume: workshopVolume(1, workshop.durationMinutes),
        outcome: workshop.levels[level].outcome,
        category: 'practice' as const,
    };
}
