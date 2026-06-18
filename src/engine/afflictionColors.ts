/**
 * @file afflictionColors.ts
 * @module engine/afflictionColors
 * @description Palette de couleurs par catégorie d'affliction — module pur (zéro React, zéro state).
 *
 *   Extrait de `src/components/iconMeta.tsx` (T-28) afin que `messageSender.ts`
 *   (module engine pur) puisse l'importer sans dépendre de JSX.
 *   `iconMeta.tsx` ré-exporte ce record pour ne pas casser ses consommateurs existants.
 *
 *   Convention de palette :
 *   - Catégories « vaincre » (lutte, défense) → tons chauds / sombres
 *   - Catégories « manifester » (croissance)  → tons lumineux / froids
 *   - Toutes lisibles sur fond #0f0a1a
 *
 *   @since itér. 46 / T-28
 */

export const AFFLICTION_COLORS: Record<string, string> = {
  // ── Catégories originales ──────────────────────────────────────────────────
  peur_angoisse:        '#8b5cf6', // Violet — peur spirituelle
  impudicite_addiction: '#ef4444', // Rouge vif — brûlure charnelle
  finances_paresse:     '#f59e0b', // Ambre — or/argent, urgence
  amertume_rejet:       '#6b7280', // Gris — froideur, fermeture
  combat_spirituel:     '#f97316', // Orange — feu, bataille
  identite_appel:       '#a78bfa', // Violet clair — lumière intérieure
  doute_incredulite:    '#94a3b8', // Bleu-gris — brouillard, incertitude
  orgueil_independance: '#dc2626', // Rouge foncé — danger, arrogance
  // ── Nouvelles catégories — croissance ─────────────────────────────────────
  saint_esprit:         '#38bdf8', // Bleu ciel — souffle, eau vive
  parole_de_dieu:       '#fde68a', // Jaune pâle — lampe aux pieds
  amour_de_dieu:        '#fb7185', // Rose — agapé, chaleur
  direction_divine:     '#34d399', // Vert menthe — chemin tracé
  priere:               '#c4b5fd', // Lavande — intimité, encens
  soif_de_dieu:         '#7dd3fc', // Bleu clair — eau, désir
  obeissance:           '#86efac', // Vert doux — paix de l'obéissance
  culpabilite:          '#a8a29e', // Gris chaud — lourdeur levée
  sterilite:            '#e9d5ff', // Mauve pâle — attente, espoir
  abondance_financiere: '#fbbf24', // Or — bénédiction financière
  maladie_guerison:     '#4ade80', // Vert vif — guérison, vie
  echec_reussite:       '#fb923c', // Orange — résurrection après chute
  tristesse_joie:       '#f472b6', // Rose vif — larmes → danse
  decouragement:        '#60a5fa', // Bleu — profondeur, remontée
  lourdeur_fatigue:     '#a3e635', // Vert-lime — vigueur retrouvée
};
