/**
 * @file reactions.ts
 * @description Réactions de victoire contextuelles — le « juice » du moment le plus répété.
 *
 * Surmonter une épreuve est le battement de dopamine central d'Élias. Afficher toujours
 * « VICTOIRE » use l'effet. Ce système produit une courte réaction VARIÉE selon le
 * contexte (intensité du combo, nature de l'épreuve vaincue, saison) — fraîcheur sans fin.
 *
 * Pur, testable, sans IA. Réversible : retirer l'appel dans le flash de succès et on
 * retombe sur le libellé statique.
 */
import type { AfflictionCategory, SpiritualSeasonName } from '../types/game';
import type { Rng } from './rng';

/** Bannière courte selon l'intensité du combo. */
const TIER_EPIC = [
  'INARRÊTABLE',
  'EN FEU',
  'INÉBRANLABLE',
];
const TIER_STRONG = [
  'ENCHAÎNÉ',
  'PORTÉ',
  'ÉLAN',
];
const TIER_BASE = [
  'VICTOIRE',
  'SURMONTÉ',
  'TENU BON',
  'DEBOUT',
];

/** Sous-ligne thématique selon l'épreuve vaincue (sous-ensemble parlant). */
const CATEGORY_FLAVOR: Partial<Record<AfflictionCategory, string[]>> = {
  peur_angoisse: ['La peur a reculé.', 'La crainte n\'a pas eu le dernier mot.'],
  doute_incredulite: ['Le doute s\'est tu.', 'La foi a tenu bon.'],
  decouragement: ['Le découragement n\'a pas gagné.', 'Relevé, une fois de plus.'],
  combat_spirituel: ['L\'ennemi a dû céder.', 'La victoire est à Christ.'],
  amertume_rejet: ['Le pardon a brisé la chaîne.', 'Le cœur s\'est allégé.'],
  finances_paresse: ['La paix a remplacé l\'inquiétude.', 'Pourvu, au bon moment.'],
  maladie_guerison: ['Le corps a repris souffle.', 'La guérison s\'est frayé un chemin.'],
  tristesse_joie: ['La joie a percé les nuages.', 'Le matin est revenu.'],
  priere: ['Le secret a porté du fruit.', 'La prière a ouvert le ciel.'],
  parole_de_dieu: ['La Parole a parlé plus fort.', 'Le verset est monté du cœur.'],
};

const SEASON_FLAVOR: Partial<Record<SpiritualSeasonName, string[]>> = {
  'Désert': ['Une eau vive dans le sec.'],
  'Persécution': ['La foi se trempe au feu.'],
  'Réveil': ['L\'élan du réveil l\'emporte.'],
};

/**
 * Libellé d'épreuve non surmontée — JAMAIS punitif (jeu évangéliste : l'échec ouvre
 * sur la grâce et le relèvement, pas sur la condamnation).
 */
const SETBACK_LABELS = [
  'Épreuve non surmontée',
  'Pas cette fois',
  'Un pas de trop',
  'Le combat continue',
];

/** Encouragement de grâce affiché sous le verset enseigné après un échec. */
const SETBACK_GRACE = [
  'La grâce est nouvelle chaque matin. Relève-toi.',
  'Tomber n\'est pas rester à terre. On apprend, on continue.',
  'Garde ce verset : il sera ton appui la prochaine fois.',
  'Christ relève ceux qui trébuchent. Reprends courage.',
  'Même les justes tombent sept fois et se relèvent.',
];

export interface VictoryContext {
  category?: AfflictionCategory;
  combo: number;
  season?: SpiritualSeasonName;
}

function pickFrom(rng: Rng, arr: readonly string[]): string {
  return arr[Math.floor(rng() * arr.length)] ?? arr[0];
}

/** Bannière courte (majuscules) selon le combo. */
export function pickVictoryBanner(combo: number, rng: Rng = Math.random): string {
  if (combo >= 10) return pickFrom(rng, TIER_EPIC);
  if (combo >= 5) return pickFrom(rng, TIER_STRONG);
  return pickFrom(rng, TIER_BASE);
}

/**
 * Sous-ligne contextuelle (peut être vide). Priorise la saveur de catégorie, avec une
 * touche de saison de temps en temps. Jamais obligatoire → la bannière suffit seule.
 */
export function pickVictorySubline(ctx: VictoryContext, rng: Rng = Math.random): string {
  const pool: string[] = [];
  const cat = ctx.category ? CATEGORY_FLAVOR[ctx.category] : undefined;
  if (cat) pool.push(...cat);
  const season = ctx.season ? SEASON_FLAVOR[ctx.season] : undefined;
  if (season && rng() < 0.4) pool.push(...season);
  if (pool.length === 0) return '';
  return pickFrom(rng, pool);
}

/** Libellé varié d'épreuve non surmontée (jamais punitif). */
export function pickSetbackLabel(rng: Rng = Math.random): string {
  return pickFrom(rng, SETBACK_LABELS);
}

/** Encouragement de grâce après un échec — toujours présent (relèvement). */
export function pickSetbackEncouragement(rng: Rng = Math.random): string {
  return pickFrom(rng, SETBACK_GRACE);
}
