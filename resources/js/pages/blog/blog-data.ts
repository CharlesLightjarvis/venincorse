export type Article = {
  id: number
  slug: string
  image: string
  categories: string[]
  titre: string
  description: string
  duree: string
  date: string
  featured?: boolean
  contenu?: {
    intro: string
    sections: { titre: string; texte: string[]; points?: string[] }[]
  }
}

export const allArticles: Article[] = [
  {
    id: 1,
    slug: 'reussir-goethe-b2-strategie',
    image: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=1400&q=80',
    categories: ['Examens', 'Goethe'],
    titre: 'Réussir le Goethe-Zertifikat B2 : la stratégie des quatre épreuves',
    description: 'Lire avec méthode, écrire structuré, parler long — chaque épreuve demande des réflexes différents. Les voici, éprouvés en stage avec plus de 200 élèves.',
    duree: '8 min',
    date: '2 nov. 2026',
    featured: true,
    contenu: {
      intro: 'Le Goethe-Zertifikat B2, ce n\'est pas un sprint : c\'est un match en quatre manches, et chaque manche se joue différemment. Voici la stratégie que je fais jouer à mes élèves pendant les dix jours de stage — celle qui permet d\'arriver au jour J avec des réflexes, pas des espoirs.',
      sections: [
        {
          titre: 'Lesen — lire vite, pas tout lire',
          texte: [
            'Les textes B2 sont longs et l\'horloge est courte. La technique : d\'abord les questions, ensuite les titres de paragraphes, enfin la lecture ciblée — jamais dans l\'autre sens.',
            'Les mots de liaison (deshalb, trotzdem, indem, während) annoncent presque toujours les bonnes réponses. On s\'entraîne à les repérer comme des panneaux sur l\'autoroute.',
          ],
          points: ['20 minutes par texte, chrono en main', 'Jamais plus de 90 secondes sur la même question'],
        },
        {
          titre: 'Schreiben — la structure sauve la note',
          texte: [
            'L\'évaluateur cherche une structure limpide : introduction, deux arguments avec exemples, position nuancée, conclusion. Le fond compte, mais la forme pèse lourd.',
            'On prépare deux gabarits types et on les remplit avec ses propres connecteurs — le jour J, il ne reste qu\'à adapter les mots du sujet.',
          ],
          points: ['Deux gabarits maîtrisés à la perfection', 'Un connecteur différent par paragraphe'],
        },
        {
          titre: 'Hören — deux passages, deux vitesses',
          texte: [
            'Le premier passage se joue sur les chiffres, les noms et les dates : on note au fil de l\'écoute, sans jamais lâcher son crayon.',
            'Le deuxième est plus rapide — on lit les questions AVANT l\'écoute pour savoir exactement quoi guetter, et on accepte de perdre une question pour ne pas en perdre trois.',
          ],
          points: ['Toujours lire les questions avant l\'écoute', 'Notes en abréviations allemandes (z. B. «Studio», «15.00 Uhr»)'],
        },
        {
          titre: 'Sprechen — quinze minutes décisives',
          texte: [
            'Présentation, débat, plaidoyer : chaque partie a son gabarit et ses phrases de transition qui doivent devenir automatiques.',
            'Mon conseil : vise le volume. Une opinion argumentée en trois phrases vaut toujours mieux qu\'un silence élégant.',
          ],
          points: ['Entraînement oral quotidien en binôme', 'Gabarits d\'accroche et de transition appris par cœurs'],
        },
      ],
    },
  },
  {
    id: 2,
    slug: 'der-die-das-astuces-visuelles',
    image: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=900&q=80',
    categories: ['Grammaire'],
    titre: 'Der, Die ou Das ? Quatre astuces visuelles pour enfin retenir les genres',
    description: 'Le genre allemand n\'est pas une loterie : couleurs, terminaisons et paires logiques transforment les articles en réflexe. On te montre comment.',
    duree: '6 min',
    date: '28 oct. 2026',
    contenu: {
      intro: 'Les genres, c\'est la première muraille du débutant — et la dernière du niveau B2. On retarriffe pas la muraille : on passe par quatre portes, les astuces de l\'atelier Der-Die-Das, testées chaque semaine avec les élèves.',
      sections: [
        {
          titre: 'L\'astuce des couleurs',
          texte: [
            'Une couleur par article : der en bleu, die en rouge, das en vert. On note TOUS les nouveaux mots sur une carte de cette couleur — le cerveau enregistre la couleur avant le sens.',
            'Au bout de trois semaines, les erreurs d\'article abandonnent la conversation pour devenir des coquilles rares à l\'écrit.',
          ],
          points: ['Un mot nouveau = une carte colorée', 'Relire ses cartes par couleur avant chaque session'],
        },
        {
          titre: 'Les terminaisons qui trahissent le genre',
          texte: [
            'Règle n° 1 : les mots en -ung, -heit, -keit, -schaft et -ion sont féminins (die Zeitung, die Freiheit). Règle n° 2 : ceux en -chen et -lein sont neutres (das Mädchen).',
            'Seuls quelques suffixes comme -ismus (der Optimismus) prennent der. C\'est une poignée d\'exceptions, pas une liste infinie.',
          ],
          points: ['-ung / -heit / -keit / -schaft → die', '-chen / -lein → das', '-ismus → der'],
        },
        {
          titre: 'Les paires logiques avec le français',
          texte: [
            'Sûr, ce n\'est pas systematique, mais beaucoup de genres se recoupent : die Schule comme l\'école, die Üniversité? die Universität comme l\'université.',
            'Attention aux pièges célèbres : das Buch alors que «livre» est masculin, die Sonne alors que «soleil» est masculin. On apprend les pièges comme des mots à part entière.',
          ],
          points: ['Comparer au français d\'abord, céder ensuite aux exceptions', 'Apprendre chaque piège avec son article en une carte'],
        },
        {
          titre: 'L\'ancrage visuel du quotidien',
          texte: [
            'Sticky-notes sur les objets du salon pour les locuteurs spécialement autodidactes, fin de session où on désigne cinq objets de la pièce avec leur article.',
            'Deux minutes par jour valent mieux que deux heures de tableau le dimanche : le genre est une habitude, pas une épreuve.',
          ],
          points: ['Sticky-notes colorées sur objets de la maison', 'Dénombrement express : 5 objets et leur article à la fin de chaque session'],
        },
      ],
    },
  },
]

export const trendingArticles = [
  { id: 1, titre: 'Réussir le Goethe B2 : la stratégie des 4 épreuves', categorie: 'Examens' },
  { id: 2, titre: 'Der, Die ou Das ? 4 astuces visuelles', categorie: 'Grammaire' },
]

export const relatedCourses: Record<string, string> = {
  Examens: 'stage-goethe-b2',
  Goethe: 'stage-goethe-b2',
  Grammaire: 'atelier-der-die-das',
}

export type SidebarSection =
  | { type: 'item'; label: string; value: string }
  | { type: 'group'; label: string; items: { label: string; value: string }[] }

export const sidebarSections: SidebarSection[] = [
  { type: 'item', label: 'Grammaire',  value: 'Grammaire' },
  { type: 'item', label: 'Examens',    value: 'Examens' },
  {
    type: 'group',
    label: 'Pratique de l\'oral',
    items: [
      { label: 'Conversation',   value: 'Conversation' },
      { label: 'Prononciation',  value: 'Prononciation' },
    ],
  },
  {
    type: 'group',
    label: 'Professionnel',
    items: [
      { label: 'Allemand des affaires', value: 'Affaires' },
      { label: 'Emails & réunions',     value: 'Affaires' },
    ],
  },
  {
    type: 'group',
    label: 'Publics',
    items: [
      { label: 'Débutants complets',   value: 'Débutants' },
      { label: 'Ados & scolaires',     value: 'Scolaire' },
      { label: 'Soutien dès 8 ans',    value: 'Scolaire' },
    ],
  },
]
