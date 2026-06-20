/**
 * @file traits.ts
 * @description Traits gagnés en cours de vie (inspiré de Wildermyth / Crusader Kings).
 *
 * Un trait est décerné quand Élias franchit un seuil VÉCU (combos, crises survécues,
 * maîtrise d'une catégorie, complétion d'arc…). Une fois acquis, il :
 *  - façonne le contenu suivant (categoryBias sur la sélection d'événements),
 *  - donne un petit bonus one-shot à l'acquisition (gainBonus),
 *  - nourrit le narrateur offline (narrationHook).
 *
 * Les conditions sont dérivées de l'ÉTAT (codex, métriques, arcs) — aucun compteur
 * dédié à maintenir, donc rétro-compatible avec les saves.
 *
 * @see src/engine/gameEngine.ts — evaluateTraitAwards appelé après chaque épreuve.
 */
import type { Trait, EarnedTrait, GameState, AfflictionCategory } from '../types/game';
import { getVerseById } from '../data/verses';

export const TRAITS: Trait[] = [
  {
    id: 'anakazo',
    name: 'Anakazo',
    description: 'Une série de victoires d\'affilée — la ferveur est devenue une seconde nature.',
    icon: '⚡', color: '#fbbf24',
    categoryBias: { echec_reussite: 1.2, decouragement: 0.8 },
    gainBonus: { physique: 2, finances: 2 },
    narrationHook: 'Une force tranquille m\'habite — je ne lâche plus.',
  },
  {
    id: 'fervent',
    name: 'Le Fervent',
    description: 'A touché le sommet du Flow — la présence l\'a saisi tout entier.',
    icon: '✦', color: '#f472b6',
    categoryBias: { soif_de_dieu: 1.3, priere: 1.2 },
    gainBonus: { foi: 3 },
    narrationHook: 'Quelque chose a brûlé en moi cette année, et je n\'ai pas voulu que ça s\'éteigne.',
  },
  {
    id: 'incassable',
    name: 'L\'Incassable',
    description: 'Tombé jusqu\'au bord du gouffre, relevé par grâce. La peur de la chute est partie.',
    icon: '🛡', color: '#60a5fa',
    categoryBias: { peur_angoisse: 0.8, decouragement: 0.8, combat_spirituel: 1.2 },
    gainBonus: { physique: 3 },
    narrationHook: 'J\'ai cru que c\'était fini. Ça ne l\'était pas. Je sais maintenant que je tiendrai.',
  },
  {
    id: 'sans_peur',
    name: 'Sans Peur',
    description: 'A vaincu l\'angoisse assez de fois pour ne plus la craindre.',
    icon: '🦁', color: '#fb7185',
    categoryBias: { peur_angoisse: 0.6, identite_appel: 1.2 },
    gainBonus: { paix: 3 },
    narrationHook: 'La peur frappe encore, mais elle ne commande plus.',
  },
  {
    id: 'veilleur',
    name: 'Le Veilleur',
    description: 'Une vie de prière s\'est creusée en profondeur.',
    icon: '◎', color: '#c084fc',
    categoryBias: { priere: 1.4, soif_de_dieu: 1.3, saint_esprit: 1.2 },
    gainBonus: { foi: 2, paix: 2 },
    narrationHook: 'Le secret est devenu ma maison.',
  },
  {
    id: 'vainqueur_doute',
    name: 'Vainqueur du Doute',
    description: 'A traversé l\'incrédulité et en est ressorti ancré.',
    icon: '✶', color: '#38bdf8',
    categoryBias: { doute_incredulite: 0.6, parole_de_dieu: 1.3 },
    gainBonus: { foi: 3 },
    narrationHook: 'Je ne comprends pas tout, mais je sais en qui j\'ai cru.',
  },
  {
    id: 'marque_parole',
    name: 'Marqué par la Parole',
    description: 'A gravé un trésor de versets dans son cœur.',
    icon: '📖', color: '#34d399',
    categoryBias: { parole_de_dieu: 1.3, doute_incredulite: 0.8 },
    gainBonus: { foi: 2, paix: 1 },
    narrationHook: 'Les mots que j\'ai appris remontent tout seuls, au bon moment.',
  },
  {
    id: 'prospere',
    name: 'Le Prospère Fidèle',
    description: 'A bâti l\'abondance sans laisser l\'abondance le bâtir.',
    icon: '◈', color: '#fbbf24',
    categoryBias: { abondance_financiere: 1.3, orgueil_independance: 1.2, finances_paresse: 0.7 },
    gainBonus: { finances: 2 },
    narrationHook: 'J\'ai de quoi vivre, et de quoi donner. C\'est ça, la vraie richesse.',
  },
  {
    id: 'pilier',
    name: 'Pilier de la Maison',
    description: 'A pris racine dans la communauté de Dieu.',
    icon: '⛪', color: '#a78bfa',
    categoryBias: { amour_de_dieu: 1.3, amertume_rejet: 0.8 },
    gainBonus: { paix: 2, foi: 1 },
    narrationHook: 'L\'église n\'est plus un lieu où je vais : c\'est une famille à qui j\'appartiens.',
  },
  {
    id: 'reconcilie',
    name: 'Le Réconcilié',
    description: 'A pardonné une vieille blessure et brisé la chaîne de l\'amertume.',
    icon: '🕊', color: '#86efac',
    categoryBias: { amertume_rejet: 0.6, amour_de_dieu: 1.2 },
    gainBonus: { paix: 4 },
    narrationHook: 'J\'ai posé un poids que je portais depuis trop longtemps.',
  },
  {
    id: 'ami_fidele',
    name: 'L\'Ami Fidèle',
    description: 'A cultivé une amitié de toute une vie.',
    icon: '🤝', color: '#fcd34d',
    categoryBias: { amour_de_dieu: 1.2, tristesse_joie: 0.8 },
    gainBonus: { paix: 3 },
    narrationHook: 'Il y a quelqu\'un qui répond toujours quand j\'appelle. Et moi de même.',
  },
  {
    id: 'eprouve',
    name: 'L\'Éprouvé',
    description: 'A connu beaucoup de chutes — et chaque chute lui a appris à se relever.',
    icon: '⚔', color: '#f87171',
    categoryBias: { decouragement: 0.8, combat_spirituel: 1.2, lourdeur_fatigue: 0.8 },
    gainBonus: { foi: 2, physique: 1 },
    narrationHook: 'Mes cicatrices racontent une histoire que je n\'ai pas honte de porter.',
  },
];

export function getTraitById(id: string): Trait | undefined {
  return TRAITS.find((t) => t.id === id);
}

/** Multiplicateur de poids agrégé des traits acquis pour une catégorie. */
export function getTraitCategoryBias(
  earned: EarnedTrait[] | undefined,
  category: AfflictionCategory,
): number {
  if (!earned || earned.length === 0) return 1.0;
  let mult = 1.0;
  for (const e of earned) {
    const def = getTraitById(e.id);
    const b = def?.categoryBias?.[category];
    if (b !== undefined) mult *= b;
  }
  return mult;
}

/** Compte les succès cumulés par catégorie via le codex (timesUsed sur succès). */
function categoryWins(state: GameState, category: AfflictionCategory): number {
  let n = 0;
  for (const entry of Object.values(state.codex)) {
    if (!entry.timesUsed) continue;
    const verse = getVerseById(entry.verseId);
    if (verse?.category === category) n += entry.timesUsed;
  }
  return n;
}

/**
 * Évalue les traits que l'état actuel rend éligibles et qui ne sont pas encore acquis.
 * Pur sur l'état (+ contexte transitoire optionnel). Retourne les définitions à décerner.
 */
export function evaluateTraitAwards(
  state: GameState,
  ctx: { brokeThenRose?: boolean } = {},
): Trait[] {
  const has = new Set((state.traits ?? []).map((t) => t.id));
  const out: Trait[] = [];
  const add = (id: string) => {
    if (has.has(id)) return;
    const def = getTraitById(id);
    if (def) { out.push(def); has.add(id); }
  };

  const unlocked = Object.values(state.codex).filter((c) => c.unlocked).length;

  if (state.maxCombo >= 10) add('anakazo');
  if (state.flow.value >= 100 || (state.metrics?.maxFlow ?? 0) >= 100) add('fervent');
  if (state.crisesRemaining < 2) add('incassable');
  if (ctx.brokeThenRose) add('eprouve');
  if (categoryWins(state, 'peur_angoisse') >= 4) add('sans_peur');
  if (categoryWins(state, 'priere') + categoryWins(state, 'soif_de_dieu') >= 6) add('veilleur');
  if (categoryWins(state, 'doute_incredulite') >= 4) add('vainqueur_doute');
  if (unlocked >= 30) add('marque_parole');
  if (state.stats.finances >= 85) add('prospere');
  if ((state.callFriendCount ?? 0) >= 20) add('ami_fidele');

  const arcs = new Set(state.completedArcs.map((a) => a.arcId));
  if (arcs.has('arc-eglise')) add('pilier');
  if (arcs.has('arc-louise')) add('reconcilie');

  return out;
}
