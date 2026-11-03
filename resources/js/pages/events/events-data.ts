import { CheckCircle2 } from 'lucide-react'

export type EventStatus = 'Bientôt' | 'Ouvert' | 'Complet' | 'Terminé'

export type TicketType = {
  nom: string
  prix: string
  quota: number
  avantages?: string
}

export type EventSession = {
  heure: string
  titre: string
  intervenant?: string
}

export type ProgrammeJour = {
  numero: number
  label: string
  sessions: EventSession[]
}

export type EventSpeaker = {
  initiales: string
  nom: string
  role: string
  bio?: string
}

export type ClaudelEvent = {
  id: number
  image: string
  type: string
  titre: string
  description: string
  pays: string
  ville: string
  lieu?: string
  adresse?: string
  dateDebut: string
  dateFin?: string
  nbJours: number
  capacite: number
  placesRestantes: number
  status: EventStatus
  featured?: boolean
  tickets?: TicketType[]
  programme?: ProgrammeJour[]
  speakers?: EventSpeaker[]
  objectifs?: { icon: typeof CheckCircle2; titre: string; description: string }[]
  temoignages?: { initiales: string; nom: string; role: string; texte: string }[]
}

export const allEvents: ClaudelEvent[] = [
  {
    id: 1,
    image: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=800&q=80',
    type: 'Masterclass',
    titre: 'Business Management : Lancer et Structurer son Business',
    description: "Une masterclass intensive sur les fondamentaux du business : démarrer, structurer et faire croître son entreprise avec les méthodes du Dr Claudel Noubissie.",
    pays: 'Cameroun',
    ville: 'Douala',
    lieu: 'Hôtel La Falaise',
    adresse: 'Boulevard de la Liberté, Douala',
    dateDebut: '15 juin 2026',
    dateFin: '16 juin 2026',
    nbJours: 2,
    capacite: 350,
    placesRestantes: 87,
    status: 'Ouvert',
    featured: true,
    tickets: [
      { nom: 'Standard', prix: '25 000 FCFA', quota: 250, avantages: "Accès à l'événement, place standard, support de cours" },
      { nom: 'VIP', prix: '75 000 FCFA', quota: 80, avantages: "Accès prioritaire, meilleure place, rediffusion disponible, session Q&R privée" },
      { nom: 'Premium', prix: '150 000 FCFA', quota: 20, avantages: "Tout le VIP + dîner avec le Dr Claudel, accès backstage, dédicace" },
    ],
    programme: [
      {
        numero: 1,
        label: 'Jour 1 — Lundi 15 juin',
        sessions: [
          { heure: '09:00 - 10:30', titre: "Introduction : Pourquoi la majorité des business échouent", intervenant: 'Dr Claudel Noubissie' },
          { heure: '11:00 - 13:00', titre: 'Business Management : les bases qui changent tout', intervenant: 'Dr Claudel Noubissie' },
          { heure: '14:30 - 16:30', titre: 'Structurer son offre et trouver ses premiers clients', intervenant: 'Dr Claudel Noubissie' },
          { heure: '17:00 - 18:00', titre: 'Session Q&R ouverte', intervenant: 'Dr Claudel Noubissie' },
        ],
      },
      {
        numero: 2,
        label: 'Jour 2 — Mardi 16 juin',
        sessions: [
          { heure: '09:00 - 11:00', titre: "Stratégies de croissance et scaling", intervenant: 'Dr Claudel Noubissie' },
          { heure: '11:30 - 13:00', titre: "Leadership et management d'équipe", intervenant: 'Intervenant invité' },
          { heure: '14:30 - 16:00', titre: 'Financement et gestion financière', intervenant: 'Dr Claudel Noubissie' },
          { heure: '16:30 - 18:00', titre: "Plan d'action personnel — Atelier pratique", intervenant: 'Dr Claudel Noubissie' },
        ],
      },
    ],
    speakers: [
      {
        initiales: 'CN',
        nom: 'Dr Claudel Noubissie',
        role: "Conférencier principal · Entrepreneur & Auteur",
        bio: "Expert en business management, entrepreneuriat et développement personnel. Auteur de plusieurs ouvrages sur la réussite entrepreneuriale en Afrique.",
      },
    ],
    objectifs: [
      { icon: CheckCircle2, titre: 'Lancer son business', description: "Maîtriser les étapes clés pour démarrer un business viable dès le premier jour." },
      { icon: CheckCircle2, titre: 'Structurer son activité', description: "Mettre en place des systèmes et processus qui permettent de scaler." },
      { icon: CheckCircle2, titre: 'Trouver ses clients', description: "Développer une stratégie commerciale adaptée au marché africain." },
      { icon: CheckCircle2, titre: "Passer à l'action", description: "Repartir avec un plan d'action personnel concret et applicable immédiatement." },
    ],
    temoignages: [
      { initiales: 'AB', nom: 'Arnaud Bekolo', role: 'Entrepreneur — Douala', texte: "La masterclass du Dr Claudel m'a donné les clés que je cherchais depuis des années. J'ai lancé mon business 3 semaines après l'événement." },
      { initiales: 'MC', nom: 'Marie-Claire Essono', role: 'Commerciale reconvertie — Yaoundé', texte: "Incroyable densité d'informations sur 2 jours. Le Dr Claudel a une façon unique de rendre le business accessible à tous." },
    ],
  },
  {
    id: 2,
    image: 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&w=800&q=80',
    type: 'Conférence',
    titre: 'Entrepreneuriat, Leadership et Croissance Personnelle',
    description: "Une grande conférence sur l'entrepreneuriat africain, le leadership transformationnel et le développement de la mindset gagnante.",
    pays: 'Cameroun',
    ville: 'Yaoundé',
    lieu: 'Palais des Congrès',
    dateDebut: '28 juin 2026',
    nbJours: 1,
    capacite: 500,
    placesRestantes: 218,
    status: 'Ouvert',
    tickets: [
      { nom: 'Standard', prix: '15 000 FCFA', quota: 400 },
      { nom: 'VIP', prix: '50 000 FCFA', quota: 80 },
      { nom: 'Premium', prix: '100 000 FCFA', quota: 20 },
    ],
    speakers: [
      { initiales: 'CN', nom: 'Dr Claudel Noubissie', role: 'Conférencier principal' },
      { initiales: 'II', nom: 'Intervenant invité', role: 'Expert en leadership' },
    ],
    temoignages: [
      { initiales: 'PK', nom: 'Pierre Kamga', role: 'Manager — Yaoundé', texte: "Une conférence qui change la perspective sur ce qu'il est possible d'accomplir." },
    ],
  },
  {
    id: 3,
    image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80',
    type: 'Séminaire VIP',
    titre: 'Stratégies Avancées pour Entrepreneurs Ambitieux',
    description: "Un séminaire exclusif en petit groupe pour les entrepreneurs qui veulent passer au niveau supérieur. Accès limité à 80 participants.",
    pays: "Côte d'Ivoire",
    ville: 'Abidjan',
    lieu: 'Hôtel Ivoire',
    dateDebut: '12 juillet 2026',
    dateFin: '13 juillet 2026',
    nbJours: 2,
    capacite: 80,
    placesRestantes: 23,
    status: 'Ouvert',
    tickets: [
      { nom: 'VIP', prix: '200 000 FCFA', quota: 60, avantages: "Accès complet, repas inclus, session Q&R exclusive" },
      { nom: 'Premium', prix: '350 000 FCFA', quota: 20, avantages: "Tout le VIP + accompagnement post-séminaire, dîner privé" },
    ],
    speakers: [
      { initiales: 'CN', nom: 'Dr Claudel Noubissie', role: 'Conférencier exclusif', bio: "Séminaire exclusif animé personnellement par le Dr Claudel Noubissie en comité restreint." },
    ],
    temoignages: [],
  },
  {
    id: 4,
    image: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=800&q=80',
    type: 'Atelier pratique',
    titre: "Passer de l'Idée au Plan d'Action Concret",
    description: "Un atelier intensif et pratique pour transformer votre idée de business en plan d'action structuré et exécutable.",
    pays: 'France',
    ville: 'Paris',
    lieu: 'Espace Champerret',
    dateDebut: '03 août 2026',
    nbJours: 1,
    capacite: 120,
    placesRestantes: 45,
    status: 'Ouvert',
    tickets: [
      { nom: 'Standard', prix: '120 €', quota: 80 },
      { nom: 'VIP', prix: '280 €', quota: 40, avantages: "Accès prioritaire, session privée, support de travail inclus" },
    ],
    speakers: [
      { initiales: 'CN', nom: 'Dr Claudel Noubissie', role: 'Formateur' },
    ],
    temoignages: [],
  },
  {
    id: 5,
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=800&q=80',
    type: 'Conférence',
    titre: 'Finance Personnelle et Investissement en Afrique',
    description: "Comprendre les mécanismes de la finance personnelle, apprendre à investir intelligemment et construire sa richesse durablement.",
    pays: 'Sénégal',
    ville: 'Dakar',
    lieu: 'King Fahd Palace Hôtel',
    dateDebut: '20 septembre 2026',
    nbJours: 1,
    capacite: 300,
    placesRestantes: 300,
    status: 'Bientôt',
    tickets: [
      { nom: 'Standard', prix: '20 000 FCFA', quota: 220 },
      { nom: 'VIP', prix: '60 000 FCFA', quota: 80 },
    ],
    speakers: [
      { initiales: 'CN', nom: 'Dr Claudel Noubissie', role: 'Conférencier principal' },
    ],
    temoignages: [],
  },
  {
    id: 6,
    image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=800&q=80',
    type: 'Masterclass',
    titre: 'Marketing Digital pour Entrepreneurs Africains',
    description: "Maîtrisez les outils du marketing digital pour acquérir des clients en ligne, développer votre audience et booster vos ventes.",
    pays: 'Cameroun',
    ville: 'Douala',
    lieu: 'Akwa Palace',
    dateDebut: '10 octobre 2026',
    dateFin: '11 octobre 2026',
    nbJours: 2,
    capacite: 200,
    placesRestantes: 200,
    status: 'Bientôt',
    tickets: [
      { nom: 'Standard', prix: '30 000 FCFA', quota: 150 },
      { nom: 'VIP', prix: '80 000 FCFA', quota: 50 },
    ],
    speakers: [
      { initiales: 'CN', nom: 'Dr Claudel Noubissie', role: 'Formateur' },
    ],
    temoignages: [],
  },
]
