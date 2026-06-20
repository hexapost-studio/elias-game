/**
 * @file reviewPrompts.ts
 * @description Codex vivant — variété + encouragement à la révision des versets.
 *
 * Force des grands jeux textuels (80 Days, codex vivant) : un moment RÉPÉTÉ ne doit
 * jamais sonner deux fois pareil. La révision flash-card du Grimoire (cœur évangéliste :
 * mémoriser la Parole) affichait des invites figées (« Appuyer pour révéler »,
 * « Essaie de réciter… ») et aucune respiration spirituelle au moment de la révélation.
 *
 * Ce module compose, pour une carte donnée, des invites variées + un court encouragement
 * sur-mesure selon la catégorie d'affliction. PUR et déterministe par carte (seedé via
 * l'id du verset → ne clignote pas au re-render, mais diffère d'une carte à l'autre).
 *
 * Sans IA. Réversible : retirer l'import dans CodexMenu = retour aux textes figés.
 */
import type { AfflictionCategory } from '../types/game';
import { mulberry32, hashSeed, type Rng } from './rng';

/** Invite du recto (verset caché) — « montre que tu te souviens d'abord ». */
const REVEAL_PROMPTS = [
  'Appuyer pour révéler',
  'Touche pour dévoiler',
  'Révéler la Parole',
  'Découvrir le verset',
];

/** Sous-invite d'effort de mémoire. */
const RECITE_HINTS = [
  'Essaie de réciter le verset avant de regarder',
  'Récite-le de mémoire, puis vérifie',
  'Ferme les yeux, redis-le, puis dévoile',
  'Que dit ton cœur avant tes yeux ?',
];

/** Encouragement affiché à la révélation, par catégorie d'affliction. */
const REVEAL_ENCOURAGEMENT: Partial<Record<AfflictionCategory, readonly string[]>> = {
  peur_angoisse: [
    'Cette parole chasse la crainte.',
    'À garder pour les nuits sans sommeil.',
  ],
  impudicite_addiction: [
    'Une arme pour rester pur.',
    'Cache-la quand la tentation appelle.',
  ],
  finances_paresse: [
    'À se rappeler quand tout manque.',
    'La provision se médite avant de se voir.',
  ],
  amertume_rejet: [
    'Le pardon commence par cette parole.',
    'À relire quand la blessure remonte.',
  ],
  combat_spirituel: [
    'Ton épée pour le combat.',
    'Brandis-la quand l\'ennemi insiste.',
  ],
  identite_appel: [
    'Voilà qui tu es vraiment.',
    'À redire quand tu doutes de ton appel.',
  ],
  doute_incredulite: [
    'L\'ancre quand la foi vacille.',
    'À tenir ferme les jours de brouillard.',
  ],
  orgueil_independance: [
    'Un appel à plier les genoux.',
    'À méditer quand on se croit fort seul.',
  ],
};

/** Encouragement générique (catégorie sans saveur dédiée). */
const REVEAL_GENERIC = [
  'Cache cette parole dans ton cœur.',
  'Une de plus, gravée en toi.',
  'La Parole demeure.',
];

function pick(rng: Rng, arr: readonly string[]): string {
  return arr[Math.floor(rng() * arr.length)] ?? arr[0];
}

export interface ReviewCardPrompts {
  /** Invite du recto (verset caché). */
  revealPrompt: string;
  /** Sous-invite d'effort de mémoire. */
  reciteHint: string;
  /** Court encouragement affiché une fois le verset révélé. */
  encouragement: string;
}

/**
 * Compose les invites « vivantes » d'une carte de révision, déterministes par carte.
 * @param verseId  id du verset (seed stable → pas de clignotement au re-render).
 * @param category catégorie d'affliction du verset (oriente l'encouragement).
 */
export function reviewPromptsFor(verseId: string, category: AfflictionCategory): ReviewCardPrompts {
  const rng = mulberry32(hashSeed(verseId));
  const pool = REVEAL_ENCOURAGEMENT[category] ?? REVEAL_GENERIC;
  return {
    revealPrompt: pick(rng, REVEAL_PROMPTS),
    reciteHint: pick(rng, RECITE_HINTS),
    encouragement: pick(rng, pool),
  };
}
