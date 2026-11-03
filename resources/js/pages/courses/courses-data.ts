import { CheckCircle2 } from 'lucide-react';

export type CourseStatus = 'Bientôt' | 'Ouvert' | 'Complet' | 'Terminé';

export type Formule = {
    nom: string;
    prix: string;
    quota: number;
    avantages?: string;
};

export type Seance = {
    heure: string;
    titre: string;
    intervenant?: string;
};

export type ProgrammeBloc = {
    numero: number;
    label: string;
    sessions: Seance[];
};

export type Intervenant = {
    initiales: string;
    nom: string;
    role: string;
    bio?: string;
};

export type Course = {
    id: number;
    slug: string;
    image: string;
    type: string;
    niveaux: string[];
    titre: string;
    description: string;
    ville: string;
    pays: string;
    dateDebut: string;
    dateFin?: string;
    nbSeances: number;
    capacite: number;
    placesRestantes: number;
    status: CourseStatus;
    featured?: boolean;
    formules?: Formule[];
    programme?: ProgrammeBloc[];
    intervenants?: Intervenant[];
    objectifs?: readonly {
        icon: typeof CheckCircle2;
        titre: string;
        description: string;
    }[];
    temoignages?: {
        initiales: string;
        nom: string;
        role: string;
        texte: string;
    }[];
};

export const prof: Intervenant = {
    initiales: 'VP',
    nom: 'Ton prof de VéninCorsé',
    role: 'Professeur certifié Goethe',
    bio: "7 ans d'enseignement du français vers l'allemand, spécialiste de la grammaire visuelle et de la préparation aux examens Goethe et TELC.",
};

const objectifsParCategorie = {
    Standard: [
        {
            icon: CheckCircle2,
            titre: 'Te présenter',
            description:
                'Parler de toi, poser des questions et tenir une première conversation.',
        },
        {
            icon: CheckCircle2,
            titre: 'Comprendre le quotidien',
            description:
                'Saisir les annonces et conversations courtes de la vie de tous les jours.',
        },
        {
            icon: CheckCircle2,
            titre: 'Écrire sans blocage',
            description:
                'Rédiger des messages simples et valider ton niveau en fin de pack.',
        },
    ],
    Grammaire: [
        {
            icon: CheckCircle2,
            titre: 'Le bon article',
            description:
                'Employer der, die, das sans hésiter grâce à des astuces visuelles.',
        },
        {
            icon: CheckCircle2,
            titre: 'Les cas en réflexe',
            description:
                'Maîtriser nominatif, accusatif et datif dans des phrases réelles.',
        },
        {
            icon: CheckCircle2,
            titre: 'Auto-correction',
            description:
                'Repérer et corriger tes erreurs d’article à l’oral, tout seul.',
        },
    ],
    Conversation: [
        {
            icon: CheckCircle2,
            titre: 'Parler longtemps',
            description:
                'Tenir une conversation de plus de 10 minutes sans revenir au français.',
        },
        {
            icon: CheckCircle2,
            titre: 'Réagir vite',
            description: 'Répondre naturellement aux questions inattendues.',
        },
        {
            icon: CheckCircle2,
            titre: 'Gagner en fluidité',
            description:
                'T’échanger 80 % de la séance avec un locuteur natif à tes côtés.',
        },
    ],
    Examens: [
        {
            icon: CheckCircle2,
            titre: 'Le format',
            description:
                'Connaître la structure exacte et la stratégie des 4 épreuves.',
        },
        {
            icon: CheckCircle2,
            titre: 'Gérer le temps',
            description:
                'Répartir tes minutes le jour J et ne plus jamais finir à moitié.',
        },
        {
            icon: CheckCircle2,
            titre: 'Mock tests corrigés',
            description:
                'S’entraîner en conditions réelles avec des corrections détaillées.',
        },
    ],
    Affaires: [
        {
            icon: CheckCircle2,
            titre: 'Animer une réunion',
            description:
                'Piloter un point d’équipe et exprimer ton avis professionnellement.',
        },
        {
            icon: CheckCircle2,
            titre: 'Emails impeccables',
            description: 'Rédiger des messages pro aux tournures natives.',
        },
        {
            icon: CheckCircle2,
            titre: 'Négocier',
            description:
                'Utiliser le vocabulaire approprié dans chaque situation pro.',
        },
    ],
    Soutien: [
        {
            icon: CheckCircle2,
            titre: 'Reprendre confiance',
            description:
                'Revenir sur le programme scolaire sans jugement, pas à pas.',
        },
        {
            icon: CheckCircle2,
            titre: 'Oser en classe',
            description:
                'Prendre la parole à l’école sans crainte de se tromper.',
        },
        {
            icon: CheckCircle2,
            titre: 'Bilan aux parents',
            description:
                'Un point de progression clair chaque mois, envoyé à la famille.',
        },
    ],
} as const;

export const allCourses: Course[] = [
    {
        id: 1,
        slug: 'allemand-a1-1',
        image: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=1200&q=80',
        type: 'Standard',
        niveaux: ['A1.1'],
        titre: 'Allemand A1.1 — Premiers pas',
        description:
            'Alphabet, conjugaison du présent et premières phrases : tu te présentes et tu poses tes premières questions.',
        ville: '100 % en visio',
        pays: 'Cameroun',
        dateDebut: '10 novembre 2026',
        nbSeances: 8,
        capacite: 1,
        placesRestantes: 1,
        status: 'Ouvert',
        formules: [
            {
                nom: 'Cours d’essai',
                prix: '3 000 FCFA',
                quota: 1,
                avantages: 'Une séance de 60 min pour tester, sans engagement',
            },
            {
                nom: 'Pack de 8 séances',
                prix: '44 000 FCFA',
                quota: 8,
                avantages: '8 séances de 60 min + compte-rendu + accès prof',
            },
        ],
        programme: [
            {
                numero: 1,
                label: 'Séance 1 — Diagnostic et premiers mots',
                sessions: [
                    {
                        heure: '60 min',
                        titre: 'Ton niveau, tes objectifs, l’alphabet allemand',
                        intervenant: 'Ton prof',
                    },
                    {
                        heure: '60 min',
                        titre: 'Te présenter : nom, pays, métier',
                        intervenant: 'Ton prof',
                    },
                ],
            },
            {
                numero: 2,
                label: 'Séance 2 — Conjugaison du présent',
                sessions: [
                    {
                        heure: '60 min',
                        titre: 'Verbes réguliers et irréguliers de base',
                        intervenant: 'Ton prof',
                    },
                    {
                        heure: '60 min',
                        titre: 'Phrases simples : je, tu, nous',
                        intervenant: 'Ton prof',
                    },
                ],
            },
            {
                numero: 3,
                label: 'Séance 3 — Poser tes premières questions',
                sessions: [
                    {
                        heure: '60 min',
                        titre: 'W-Fragen et questions utiles',
                        intervenant: 'Ton prof',
                    },
                    {
                        heure: '60 min',
                        titre: 'Les chiffres, les prix, les heures',
                        intervenant: 'Ton prof',
                    },
                ],
            },
            {
                numero: 4,
                label: 'Séance 4 — Premiers dialogues',
                sessions: [
                    {
                        heure: '60 min',
                        titre: 'À la caisse : commander et payer',
                        intervenant: 'Ton prof',
                    },
                    {
                        heure: '60 min',
                        titre: 'Mini-conversation complète de bilan',
                        intervenant: 'Ton prof',
                    },
                ],
            },
        ],
        intervenants: [prof],
        objectifs: objectifsParCategorie.Standard,
        temoignages: [
            {
                initiales: 'SM',
                nom: 'Sarah M.',
                role: 'Débutante complète',
                texte: 'Après trois semaines, je me présente et je commande en allemand sans paniquer. Le compte-rendu après chaque séance change tout.',
            },
            {
                initiales: 'JA',
                nom: 'Jean-Alain B.',
                role: 'Apprenant, pack A1.1',
                texte: 'Les 8 séances sont allées vite : la méthode visuelle rend l’allemand bien moins effrayant qu’on le croit.',
            },
        ],
    },
    {
        id: 2,
        slug: 'allemand-a1-2',
        image: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&w=1200&q=80',
        type: 'Standard',
        niveaux: ['A1.2'],
        titre: 'Allemand A1.2 — Bases solides',
        description:
            'Accusatif, parfait et dialogues du quotidien : courses, rendez-vous, s’orienter en ville.',
        ville: '100 % en visio',
        pays: 'Cameroun',
        dateDebut: '12 novembre 2026',
        nbSeances: 8,
        capacite: 1,
        placesRestantes: 1,
        status: 'Ouvert',
        formules: [
            {
                nom: 'Cours d’essai',
                prix: '3 000 FCFA',
                quota: 1,
                avantages: 'Une séance de 60 min pour tester, sans engagement',
            },
            {
                nom: 'Pack de 8 séances',
                prix: '44 000 FCFA',
                quota: 8,
                avantages: '8 séances de 60 min + compte-rendu + accès prof',
            },
        ],
        objectifs: objectifsParCategorie.Standard,
    },
    {
        id: 3,
        slug: 'allemand-a2-1',
        image: 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?auto=format&fit=crop&w=1200&q=80',
        type: 'Standard',
        niveaux: ['A2.1'],
        titre: 'Allemand A2.1 — Quotidien',
        description:
            'Datif, prétérit et écrit simple : tu racontes ton quotidien et tu gères les situations courantes.',
        ville: '100 % en visio',
        pays: 'Cameroun',
        dateDebut: '17 novembre 2026',
        nbSeances: 8,
        capacite: 1,
        placesRestantes: 1,
        status: 'Ouvert',
        formules: [
            {
                nom: 'Cours d’essai',
                prix: '3 000 FCFA',
                quota: 1,
                avantages: 'Une séance de 60 min pour tester, sans engagement',
            },
            {
                nom: 'Pack de 8 séances',
                prix: '48 000 FCFA',
                quota: 8,
                avantages: '8 séances de 60 min + compte-rendu + accès prof',
            },
        ],
        objectifs: objectifsParCategorie.Standard,
    },
    {
        id: 4,
        slug: 'allemand-a2-2',
        image: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a2f9?auto=format&fit=crop&w=1200&q=80',
        type: 'Standard',
        niveaux: ['A2.2'],
        titre: 'Allemand A2.2 — Autonomie',
        description:
            'Prépositions, subordonnées et passé : tu décris ton parcours, tes envies et tes projets.',
        ville: '100 % en visio',
        pays: 'Cameroun',
        dateDebut: '19 novembre 2026',
        nbSeances: 8,
        capacite: 1,
        placesRestantes: 1,
        status: 'Ouvert',
        formules: [
            {
                nom: 'Cours d’essai',
                prix: '3 000 FCFA',
                quota: 1,
                avantages: 'Une séance de 60 min pour tester, sans engagement',
            },
            {
                nom: 'Pack de 8 séances',
                prix: '48 000 FCFA',
                quota: 8,
                avantages: '8 séances de 60 min + compte-rendu + accès prof',
            },
        ],
        objectifs: objectifsParCategorie.Standard,
    },
    {
        id: 5,
        slug: 'allemand-b1-1',
        image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80',
        type: 'Standard',
        niveaux: ['B1.1'],
        titre: 'Allemand B1.1 — Approfondir',
        description:
            'Verbes à préfixe et Konjunktiv II naissant : tu donnes ton avis et tu t’exprimes avec nuance.',
        ville: '100 % en visio',
        pays: 'Cameroun',
        dateDebut: '24 novembre 2026',
        nbSeances: 8,
        capacite: 1,
        placesRestantes: 1,
        status: 'Ouvert',
        formules: [
            {
                nom: 'Cours d’essai',
                prix: '3 000 FCFA',
                quota: 1,
                avantages: 'Une séance de 60 min pour tester, sans engagement',
            },
            {
                nom: 'Pack de 8 séances',
                prix: '52 000 FCFA',
                quota: 8,
                avantages: '8 séances de 60 min + compte-rendu + accès prof',
            },
        ],
        objectifs: objectifsParCategorie.Standard,
    },
    {
        id: 6,
        slug: 'allemand-b1-2',
        image: 'https://images.unsplash.com/photo-1471107340929-a87cd0f5b5f3?auto=format&fit=crop&w=1200&q=80',
        type: 'Standard',
        niveaux: ['B1.2'],
        titre: 'Allemand B1.2 — Nuance',
        description:
            'Passif, textes argumentés et débats guidés : tu défends un point de vue en complet.',
        ville: '100 % en visio',
        pays: 'Cameroun',
        dateDebut: '26 novembre 2026',
        nbSeances: 8,
        capacite: 1,
        placesRestantes: 1,
        status: 'Ouvert',
        formules: [
            {
                nom: 'Cours d’essai',
                prix: '3 000 FCFA',
                quota: 1,
                avantages: 'Une séance de 60 min pour tester, sans engagement',
            },
            {
                nom: 'Pack de 8 séances',
                prix: '52 000 FCFA',
                quota: 8,
                avantages: '8 séances de 60 min + compte-rendu + accès prof',
            },
        ],
        objectifs: objectifsParCategorie.Standard,
    },
    {
        id: 7,
        slug: 'allemand-b2-1',
        image: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1200&q=80',
        type: 'Standard',
        niveaux: ['B2.1'],
        titre: 'Allemand B2.1 — Précision',
        description:
            'Structures complexes et textes longs : tu argumentes, tu négocies, tu nuances.',
        ville: '100 % en visio',
        pays: 'Cameroun',
        dateDebut: '8 décembre 2026',
        nbSeances: 8,
        capacite: 1,
        placesRestantes: 1,
        status: 'Ouvert',
        formules: [
            {
                nom: 'Cours d’essai',
                prix: '3 000 FCFA',
                quota: 1,
                avantages: 'Une séance de 60 min pour tester, sans engagement',
            },
            {
                nom: 'Pack de 8 séances',
                prix: '56 000 FCFA',
                quota: 8,
                avantages: '8 séances de 60 min + compte-rendu + accès prof',
            },
        ],
        objectifs: objectifsParCategorie.Standard,
    },
    {
        id: 8,
        slug: 'allemand-b2-2',
        image: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=1200&q=80',
        type: 'Standard',
        niveaux: ['B2.2'],
        titre: 'Allemand B2.2 — Maîtrise',
        description:
            'Style soutenu, rédaction avancée et oraux de haut niveau : prêt pour le C1.',
        ville: '100 % en visio',
        pays: 'Cameroun',
        dateDebut: '10 décembre 2026',
        nbSeances: 8,
        capacite: 1,
        placesRestantes: 1,
        status: 'Bientôt',
        formules: [
            {
                nom: 'Cours d’essai',
                prix: '3 000 FCFA',
                quota: 1,
                avantages: 'Une séance de 60 min pour tester, sans engagement',
            },
            {
                nom: 'Pack de 8 séances',
                prix: '56 000 FCFA',
                quota: 8,
                avantages: '8 séances de 60 min + compte-rendu + accès prof',
            },
        ],
        objectifs: objectifsParCategorie.Standard,
    },
    {
        id: 9,
        slug: 'atelier-der-die-das',
        niveaux: ['A1.1', 'A1.2', 'A2.1', 'A2.2'],
        image: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=1200&q=80',
        type: 'Grammaire',
        titre: 'Atelier Der-Die-Das',
        description:
            'Le genre et les articles, enfin intuitifs : astuces visuelles et exercices corrigés en direct.',
        ville: '100 % en visio',
        pays: 'Cameroun',
        dateDebut: '12 novembre 2026',
        nbSeances: 4,
        capacite: 6,
        placesRestantes: 3,
        status: 'Ouvert',
        formules: [
            {
                nom: 'Cours d’essai',
                prix: '3 000 FCFA',
                quota: 1,
                avantages:
                    'Une séance de 90 min pour tester le rythme du groupe',
            },
            {
                nom: 'Séance à l’unité',
                prix: '4 000 FCFA',
                quota: 6,
                avantages:
                    '90 min en mini-groupe de 4 à 6, corrections en direct',
            },
            {
                nom: 'Pack 4 séances',
                prix: '14 000 FCFA',
                quota: 4,
                avantages:
                    '4 ateliers + fiches couleurs remises après chaque séance',
            },
        ],
        programme: [
            {
                numero: 1,
                label: 'Séance 1 — L’astuce des couleurs',
                sessions: [
                    {
                        heure: '90 min',
                        titre: 'Une couleur par article : dé, rouge, vert',
                        intervenant: 'Ton prof',
                    },
                    {
                        heure: '90 min',
                        titre: 'Créer ses cartes-mots et son premier lot',
                        intervenant: 'Ton prof',
                    },
                ],
            },
            {
                numero: 2,
                label: 'Séance 2 — Les terminaisons qui trahissent le genre',
                sessions: [
                    {
                        heure: '90 min',
                        titre: '-ung, -heit, -keit, -schaft → die ; -chen → das',
                        intervenant: 'Ton prof',
                    },
                    {
                        heure: '90 min',
                        titre: 'Flash-questions chronométrées en groupe',
                        intervenant: 'Ton prof',
                    },
                ],
            },
            {
                numero: 3,
                label: 'Séance 3 — Les paires logiques avec le français',
                sessions: [
                    {
                        heure: '90 min',
                        titre: 'Comparer les genres et repérer les pièges',
                        intervenant: 'Ton prof',
                    },
                    {
                        heure: '90 min',
                        titre: 'Jeu : article express en duo',
                        intervenant: 'Ton prof',
                    },
                ],
            },
            {
                numero: 4,
                label: 'Séance 4 — L’ancrage visuel du quotidien',
                sessions: [
                    {
                        heure: '90 min',
                        titre: 'Sticky-notes et dénombrement express (5 objets)',
                        intervenant: 'Ton prof',
                    },
                    {
                        heure: '90 min',
                        titre: 'Bilan : plan pour les 3 semaines suivantes',
                        intervenant: 'Ton prof',
                    },
                ],
            },
        ],
        intervenants: [prof],
        objectifs: objectifsParCategorie.Grammaire,
        temoignages: [
            {
                initiales: 'CM',
                nom: 'Clarisse M.',
                role: 'Étudiante — atelier grammaire',
                texte: 'Les couleurs ont débloqué les articles : à l’écrit, je n’hésite plus. Trois séances ont suffi pour sentir la différence.',
            },
        ],
    },
    {
        id: 10,
        slug: 'atelier-cas-declinaisons',
        niveaux: ['B1.1', 'B1.2', 'B2.1'],
        image: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&w=1200&q=80',
        type: 'Grammaire',
        titre: 'Atelier cas & déclinaisons',
        description:
            'Nominatif, accusatif, datif, génitif : les déclinaisons deviennent des réflexes.',
        ville: '100 % en visio',
        pays: 'Cameroun',
        dateDebut: '19 novembre 2026',
        nbSeances: 1,
        capacite: 6,
        placesRestantes: 0,
        status: 'Complet',
        formules: [
            {
                nom: 'Séance à l’unité',
                prix: '5 000 FCFA',
                quota: 6,
                avantages:
                    '90 min en mini-groupe de 4 à 6, corrections en direct',
            },
        ],
        objectifs: objectifsParCategorie.Grammaire,
    },
    {
        id: 11,
        slug: 'conversation-orale-jeudis',
        niveaux: ['B1.1', 'B1.2', 'B2.1', 'B2.2'],
        image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80',
        type: 'Conversation',
        titre: 'Conversation orale — jeudis',
        description:
            'Débats, jeux de rôle et feedback individuel : tu parles 80 % du temps de la séance.',
        ville: '100 % en visio',
        pays: 'Cameroun',
        dateDebut: '5 novembre 2026',
        nbSeances: 1,
        capacite: 6,
        placesRestantes: 2,
        status: 'Ouvert',
        formules: [
            {
                nom: 'Cours d’essai',
                prix: '3 000 FCFA',
                quota: 1,
                avantages: 'Une table d’essai de 60 min pour tester ton niveau',
            },
            {
                nom: 'Séance à l’unité',
                prix: '5 000 FCFA',
                quota: 6,
                avantages:
                    'Tables de conversation tous les jeudis, feedback individuel',
            },
            {
                nom: 'Pack 4 jeudis',
                prix: '17 000 FCFA',
                quota: 4,
                avantages:
                    '4 tables + fiche vocabulaire envoyée après chaque table',
            },
        ],
        programme: [
            {
                numero: 1,
                label: 'Séance 1 — Échauffement et thème',
                sessions: [
                    {
                        heure: '60 min',
                        titre: 'Échauffement en petites phrases',
                        intervenant: 'Ton prof',
                    },
                    {
                        heure: '60 min',
                        titre: 'Thème du jour : vocabulaire utile',
                        intervenant: 'Ton prof',
                    },
                ],
            },
            {
                numero: 2,
                label: 'Séance 2 — Débat ou jeu de rôle',
                sessions: [
                    {
                        heure: '60 min',
                        titre: 'Débat guidé corrigé en direct',
                        intervenant: 'Ton prof',
                    },
                    {
                        heure: '60 min',
                        titre: 'Retour sur les formules répétitives',
                        intervenant: 'Ton prof',
                    },
                ],
            },
            {
                numero: 3,
                label: 'Séance 3 — Vitesse et réactions',
                sessions: [
                    {
                        heure: '60 min',
                        titre: 'Questions rapides, réponses spontanées',
                        intervenant: 'Ton prof',
                    },
                    {
                        heure: '60 min',
                        titre: 'Connecteurs pour lier les phrases',
                        intervenant: 'Ton prof',
                    },
                ],
            },
            {
                numero: 4,
                label: 'Séance 4 — Feedback et étape suivante',
                sessions: [
                    {
                        heure: '60 min',
                        titre: 'Feedback individualisé personnalisé',
                        intervenant: 'Ton prof',
                    },
                    {
                        heure: '60 min',
                        titre: 'Bilan de fluidité et prochaine étape',
                        intervenant: 'Ton prof',
                    },
                ],
            },
        ],
        intervenants: [prof],
        objectifs: objectifsParCategorie.Conversation,
        temoignages: [
            {
                initiales: 'BT',
                nom: 'Benoît T.',
                role: 'Ingénieur — B2',
                texte: '80 % du temps à parler, zéro complaisance : en six séances mes appels pro en allemand se sont fluidifiés.',
            },
        ],
    },
    {
        id: 12,
        slug: 'table-conversation-debutants',
        niveaux: ['A2.1', 'A2.2'],
        image: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=1200&q=80',
        type: 'Conversation',
        titre: 'Table de conversation débutants',
        description:
            'Dialogues guidés et petites histoires pour oser tes premières phrases en groupe.',
        ville: '100 % en visio',
        pays: 'Cameroun',
        dateDebut: '5 novembre 2026',
        nbSeances: 1,
        capacite: 6,
        placesRestantes: 6,
        status: 'Ouvert',
        formules: [
            {
                nom: 'Cours d’essai',
                prix: '3 000 FCFA',
                quota: 1,
                avantages:
                    'Une table d’essai de 60 min, au calme et sans jugement',
            },
            {
                nom: 'Séance à l’unité',
                prix: '4 000 FCFA',
                quota: 6,
                avantages: 'Table douce en petit groupe, zéro jugement',
            },
        ],
        objectifs: objectifsParCategorie.Conversation,
    },
    {
        id: 13,
        slug: 'stage-goethe-b2',
        niveaux: ['B2.1', 'B2.2'],
        image: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=1200&q=80',
        type: 'Examens',
        titre: 'Stage Goethe-Zertifikat B2',
        description:
            'Mock tests complets corrigés, stratégie des 4 épreuves et entraînement oral intensif.',
        ville: '100 % en visio',
        pays: 'Cameroun',
        dateDebut: '27 novembre 2026',
        dateFin: '6 décembre 2026',
        nbSeances: 10,
        capacite: 15,
        placesRestantes: 4,
        status: 'Ouvert',
        featured: true,
        formules: [
            {
                nom: 'Cours d’essai',
                prix: '3 000 FCFA',
                quota: 1,
                avantages: 'Un diagnostic express de ton niveau avant le stage',
            },
            {
                nom: 'Stage 10 jours',
                prix: '45 000 FCFA',
                quota: 15,
                avantages:
                    'Mock tests complets corrigés + 2 séances d’oral en binôme',
            },
        ],
        programme: [
            {
                numero: 1,
                label: 'Jour 1 à 3 — Lesen : lire vite, pas tout',
                sessions: [
                    {
                        heure: '09:00 - 11:00',
                        titre: 'Stratégie de lecture ciblée',
                        intervenant: 'Ton prof',
                    },
                    {
                        heure: '14:00 - 16:00',
                        titre: 'Mock test lecture corrigé',
                        intervenant: 'Ton prof',
                    },
                ],
            },
            {
                numero: 2,
                label: 'Jour 4 à 5 — Schreiben : la structure',
                sessions: [
                    {
                        heure: '09:00 - 11:00',
                        titre: 'Gabarits d’écriture et connecteurs',
                        intervenant: 'Ton prof',
                    },
                    {
                        heure: '14:00 - 16:00',
                        titre: 'Corrections détaillées par copie',
                        intervenant: 'Ton prof',
                    },
                ],
            },
            {
                numero: 3,
                label: 'Jour 6 à 7 — Hören : deux vitesses',
                sessions: [
                    {
                        heure: '09:00 - 11:00',
                        titre: 'Prise de notes et chiffres',
                        intervenant: 'Ton prof',
                    },
                    {
                        heure: '14:00 - 16:00',
                        titre: 'Écoute intensive en plusieurs temps',
                        intervenant: 'Ton prof',
                    },
                ],
            },
            {
                numero: 4,
                label: 'Jour 8 à 10 — Sprechen : le jour J',
                sessions: [
                    {
                        heure: '09:00 - 11:00',
                        titre: 'Gabarits d’accroche, plaidoyer et débat',
                        intervenant: 'Ton prof',
                    },
                    {
                        heure: '14:00 - 16:00',
                        titre: 'Soutenance en binôme + mock oral complet',
                        intervenant: 'Ton prof',
                    },
                ],
            },
        ],
        intervenants: [prof],
        objectifs: objectifsParCategorie.Examens,
        temoignages: [
            {
                initiales: 'NA',
                nom: 'Nadine A.',
                role: 'Étudiante — stage B2',
                texte: 'Mock tests chaque matin, corrections le soir : le jour de l’examen n’était qu’une énième répétition, aucune panique.',
            },
        ],
    },
    {
        id: 14,
        slug: 'preparation-goethe-b1',
        niveaux: ['B1.1', 'B1.2'],
        image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80',
        type: 'Examens',
        titre: 'Préparation Goethe B1',
        description:
            'Oral en binôme, écrits corrigés et simulations d’examen chronométrées.',
        ville: '100 % en visio',
        pays: 'Cameroun',
        dateDebut: '16 novembre 2026',
        nbSeances: 6,
        capacite: 1,
        placesRestantes: 1,
        status: 'Ouvert',
        formules: [
            {
                nom: 'Cours d’essai',
                prix: '3 000 FCFA',
                quota: 1,
                avantages: 'Un diagnostic express de ton niveau en 60 min',
            },
            {
                nom: 'Formule 6 séances',
                prix: '30 000 FCFA',
                quota: 6,
                avantages:
                    '6 séances ciblées de 90 min + simulations chronométrées',
            },
        ],
        objectifs: objectifsParCategorie.Examens,
    },
    {
        id: 15,
        slug: 'allemand-des-affaires',
        niveaux: ['B1.1', 'B1.2', 'B2.1', 'B2.2'],
        image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80',
        type: 'Affaires',
        titre: 'Allemand des affaires',
        description:
            'Réunions, emails et négociation : le vocabulaire professionnel en mises en situation.',
        ville: '100 % en visio',
        pays: 'Cameroun',
        dateDebut: '1 décembre 2026',
        nbSeances: 1,
        capacite: 1,
        placesRestantes: 1,
        status: 'Bientôt',
        formules: [
            {
                nom: 'Cours d’essai',
                prix: '3 000 FCFA',
                quota: 1,
                avantages: 'Une séance d’essai sur TON poste et TON secteur',
            },
            {
                nom: 'Séance à l’unité',
                prix: '6 500 FCFA',
                quota: 1,
                avantages:
                    '60 min de mises en situation professionnelles ciblées',
            },
        ],
        objectifs: objectifsParCategorie.Affaires,
    },
    {
        id: 16,
        slug: 'soutien-scolaire',
        niveaux: ['A1.1', 'A1.2', 'A2.1'],
        image: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1200&q=80',
        type: 'Soutien',
        titre: 'Soutien scolaire (8–15 ans)',
        description:
            'Programme scolaire, méthodes ludiques et bilan de progression envoyé aux parents.',
        ville: '100 % en visio',
        pays: 'Cameroun',
        dateDebut: '3 novembre 2026',
        nbSeances: 1,
        capacite: 1,
        placesRestantes: 1,
        status: 'Ouvert',
        formules: [
            {
                nom: 'Séance d’essai',
                prix: '3 000 FCFA',
                quota: 1,
                avantages: '45 min d’essai ludique avec le parent présent',
            },
            {
                nom: 'Séance à l’unité',
                prix: '3 500 FCFA',
                quota: 1,
                avantages: '45 min adaptées au niveau de l’enfant',
            },
        ],
        objectifs: objectifsParCategorie.Soutien,
    },
];
