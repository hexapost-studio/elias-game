import type { StoryArc } from '../types/game';

/**
 * Arcs narratifs — histoires multi-événements.
 * Chaque arc est une séquence de 3-5 événements qui racontent
 * une histoire continue à travers les âges d'Élias.
 * Les événements d'un arc sont liés par storyArcId et arcSequence.
 */
export const STORY_ARCS: StoryArc[] = [
  {
    id: 'arc-louise',
    name: 'Le pardon de Louise',
    description: 'Une ancienne amie réapparaît et une blessure du passé doit être guérie.',
    eventIds: ['arc-louise-1', 'arc-louise-2', 'arc-louise-3'],
    rewardVerseId: 'v-amer-004',
    rewardTitle: 'Le Réconciliateur',
  },
  {
    id: 'arc-mathias',
    name: 'Le disciple Mathias',
    description: 'Un jeune homme cherche à être disciple. Le former demande patience et sagesse.',
    eventIds: ['arc-mathias-1', 'arc-mathias-2', 'arc-mathias-3', 'arc-mathias-4'],
    rewardVerseId: 'v-ident-004',
    rewardTitle: 'Le Mentor',
  },
  {
    id: 'arc-heritage',
    name: 'L\'héritage du père',
    description: 'Découvrir la vérité sur un secret de famille qui affecte la destinée.',
    eventIds: ['arc-heritage-1', 'arc-heritage-2', 'arc-heritage-3'],
    rewardVerseId: 'v-ident-003',
    rewardTitle: 'Le Révélateur',
  },
  {
    id: 'arc-tentation',
    name: 'La tentation du pouvoir',
    description: 'Une promotion rapide met la foi d\'Élias à l\'épreuve.',
    eventIds: ['arc-tentation-1', 'arc-tentation-2', 'arc-tentation-3', 'arc-tentation-4', 'arc-tentation-5'],
    rewardVerseId: 'v-orgueil-001',
    rewardTitle: 'L\'Humble',
  },
  {
    id: 'arc-guerison',
    name: 'Le chemin de guérison',
    description: 'Une maladie éprouve Élias et sa famille. La foi est mise à l\'épreuve sur la durée.',
    eventIds: ['arc-guerison-1', 'arc-guerison-2', 'arc-guerison-3'],
    rewardVerseId: 'v-peur-007',
    rewardTitle: 'Le Guéri',
  },
  {
    id: 'arc-ami',
    name: 'Une amitié pour la vie',
    description: 'Une amitié qui traverse enfance, crises, silences, retrouvailles et deuil.',
    eventIds: ['arc-ami-1', 'arc-ami-2', 'arc-ami-3', 'arc-ami-4', 'arc-ami-5', 'arc-ami-6', 'arc-ami-7', 'arc-ami-8'],
    rewardVerseId: 'v-amour-003',
    rewardTitle: 'L\'Ami Fidèle',
  },
  {
    id: 'arc-metier',
    name: 'Le chemin du métier',
    description: 'Vocation, épreuves professionnelles, dilemmes de foi et héritage transmis.',
    eventIds: ['arc-metier-1', 'arc-metier-2', 'arc-metier-3', 'arc-metier-4', 'arc-metier-5'],
    rewardVerseId: 'v-ident-003',
    rewardTitle: 'L\'Artisan Fidèle',
  },
  {
    id: 'arc-parents',
    name: 'L\'héritage des parents',
    description: 'Conflits, réconciliation, maladies, deuils et l\'héritage spirituel reçu.',
    eventIds: ['arc-parents-1', 'arc-parents-2', 'arc-parents-3', 'arc-parents-4', 'arc-parents-5', 'arc-parents-6'],
    rewardVerseId: 'v-ident-004',
    rewardTitle: 'Le Fils Fidèle',
  },
  {
    id: 'arc-eglise',
    name: 'La maison de Dieu',
    description: 'Premier service, leadership, crise interne, et renouveau de la communauté.',
    eventIds: ['arc-eglise-1', 'arc-eglise-2', 'arc-eglise-3', 'arc-eglise-4'],
    rewardVerseId: 'v-soif-001',
    rewardTitle: 'Le Pilier',
  },
  {
    id: 'arc-ville',
    name: 'Enfant de {ville}',
    description: 'Départ, vie en diaspora, retour aux racines — l\'identité forgée par un lieu.',
    eventIds: ['arc-ville-1', 'arc-ville-2', 'arc-ville-3'],
    rewardVerseId: 'v-ident-007',
    rewardTitle: 'L\'Enraciné',
  },
  {
    id: 'arc-conjoint',
    name: 'L\'alliance de {conjoint}',
    description: 'Rencontre, mariage, crise, renouveau et deuil d\'une vie partagée.',
    eventIds: ['arc-conjoint-1', 'arc-conjoint-2', 'arc-conjoint-3', 'arc-conjoint-4', 'arc-conjoint-5', 'arc-conjoint-6'],
    rewardVerseId: 'v-joie-003',
    rewardTitle: 'L\'Époux Fidèle',
  },
];

export function getArcById(id: string): StoryArc | undefined {
  return STORY_ARCS.find((a) => a.id === id);
}

export function getArcByEventId(eventId: string): StoryArc | undefined {
  return STORY_ARCS.find((a) => a.eventIds.includes(eventId));
}
