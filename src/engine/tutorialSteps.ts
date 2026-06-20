/**
 * tutorialSteps.ts — Étapes déclaratives du tutorial d'interface (T-43).
 * Module PUR : tableau statique, zéro import React.
 */

export type TutorialPosition = 'top' | 'bottom';

export interface TutorialStep {
  id: string;
  /** Sélecteur CSS de l'élément à mettre en lumière. */
  targetSelector: string;
  title: string;
  body: string;
  /** Position de la bulle par rapport à l'élément cible. */
  position: TutorialPosition;
}

export const TUTORIAL_STEPS: TutorialStep[] = [
  {
    id: 'info-bar',
    targetSelector: '#info-bar',
    title: "L'essentiel d'un coup d'œil",
    body: "Ton âge, ta saison spirituelle et ton niveau de difficulté sont toujours visibles ici. La vie avance — chaque année compte.",
    position: 'bottom',
  },
  {
    id: 'stat-bar',
    targetSelector: '#stat-bar',
    title: 'Tes quatre jauges',
    body: "Foi, Paix, Physique, Finances. Si l'une tombe à zéro, la partie s'arrête. Réponds bien aux épreuves pour les maintenir.",
    position: 'bottom',
  },
  {
    id: 'flow-bar',
    targetSelector: '#flow-bar',
    title: 'Ton flux spirituel',
    body: "Chaque bonne réponse enchaînée fait monter le flux. À haut niveau tu gagnes des bonus — mais le timer se raccourcit.",
    position: 'bottom',
  },
  {
    id: 'event-card',
    targetSelector: '.event-card',
    title: "L'épreuve de ta vie",
    body: "Lis cette scène attentivement. Le contexte, les personnages, le lieu — tout t'aide à choisir le bon verset.",
    position: 'bottom',
  },
  {
    id: 'choices-area',
    targetSelector: '#choices-area',
    title: 'Réponds avec un verset',
    body: "Choisis le verset qui répond à l'épreuve. Parfois tu devras retrouver un mot-clé. Le bon choix renforce ta foi et ta paix.",
    position: 'top',
  },
  {
    id: 'btn-age',
    targetSelector: '.btn-age',
    title: 'Avancer dans la vie',
    body: "Quand il n'y a pas d'épreuve, ce bouton te fait vieillir d'un an. Tu peux aussi prier, jeûner ou appeler un ami pour te renforcer.",
    position: 'top',
  },
];
