/**
 * @file opening.ts
 * @description Vignette d'ouverture — « à chaque lancement, une nouvelle aventure ».
 *
 * Force des grands jeux à rejouabilité (80 Days) : l'OUVERTURE donne le ton et diffère
 * à chaque partie. La naissance d'Élias affichait une ligne factuelle identique en
 * structure à chaque run. Cette vignette compose une amorce évocatrice + un pressentiment
 * d'Appel, variée selon le seed de run (donc partie de la colonne vertébrale déterministe :
 * même seed → même ouverture).
 *
 * Pure, seedée, sans IA. Réversible : revenir à un texte factuel dans createInitialState.
 */
import type { Calling } from '../types/game';
import type { Rng } from './rng';

const ATMOSPHERE = [
  'Le jour se lève sur {ville}. Un enfant y ouvre les yeux : {nom}.',
  'À {ville}, un nouveau souffle s\'élève — {nom} vient au monde.',
  'C\'est à {ville} que tout commence pour {nom}.',
  'Une lumière de plus s\'allume à {ville} : {nom} est né.',
  'Dans le matin calme de {ville}, le premier cri de {nom} résonne.',
];

const CALLING_HINT = [
  'Déjà, sans le savoir, sa route penche vers celle {of} — {tagline}.',
  'Quelque chose en lui pressent un appel : {tagline}.',
  'Le ciel semble murmurer sur lui une vocation : {tagline}.',
];

/** Article + nom d'appel (« du Berger », « de l'Évangéliste »). */
function aOf(calling: Calling): string {
  const n = calling.name.replace(/^(Le |La |L'|Les )/, '');
  return /^[aeiouéèêh]/i.test(n) ? `de l'${n}` : `du ${n}`;
}

function pick(rng: Rng, arr: readonly string[]): string {
  return arr[Math.floor(rng() * arr.length)] ?? arr[0];
}

export interface OpeningContext {
  city: string;
  calling: Calling;
  /** Nom du personnage — défaut « Élias » si non fourni (itér. 9). */
  name?: string;
}

/**
 * Compose la vignette d'ouverture (1–2 phrases). Seedée → reproductible par run.
 * Ne remplit que {ville}/{nom}/{of}/{tagline} ; les autres slots restent au narrateur.
 */
export function generateOpeningVignette(ctx: OpeningContext, rng: Rng): string {
  const atmosphere = pick(rng, ATMOSPHERE)
    .replace(/\{ville\}/g, ctx.city)
    .replace(/\{nom\}/g, ctx.name ?? 'Élias');
  const hint = pick(rng, CALLING_HINT)
    .replace(/\{of\}/g, aOf(ctx.calling))
    .replace(/\{tagline\}/g, ctx.calling.tagline.toLowerCase());
  return `${atmosphere} ${hint}`;
}
