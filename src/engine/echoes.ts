/**
 * @file echoes.ts
 * @description Mémoire narrative à rappels (« echoes »).
 *
 * Force des grands jeux textuels (Citizen Sleeper, Steins;Gate) : les moments pivots
 * RÉSONNENT plus tard. Ici, un écho est un instant marquant DÉRIVÉ de l'état structuré
 * et daté (traits acquis, arcs complétés) — exactement comme `traits.ts` dérive ses
 * conditions. Donc :
 *   - aucun nouveau champ d'état à maintenir → rétro-compatible avec les saves,
 *   - le narrateur offline peut tisser un rappel d'un moment ancien → continuité narrative.
 *
 * Pur et testable hors React. Réversible : retirer ce module + son usage dans le
 * narrateur, et la narration redevient sans rappels (sans rien casser).
 *
 * @see src/services/offlineNarrator.ts — consomme pickEchoCallback().
 */
import type { GameState } from '../types/game';
import { getTraitById } from '../data/traits';
import { getArcById } from '../data/storyArcs';
import type { Rng } from './rng';

export type EchoKind = 'trait' | 'arc';

export interface Echo {
  kind: EchoKind;
  /** Âge auquel le moment a eu lieu. */
  age: number;
  /** Libellé court (nom du trait / de l'arc) ; peut contenir des slots {ville}/{conjoint}. */
  label: string;
}

/** Construit la timeline des moments marquants, triée du plus ancien au plus récent. */
export function deriveEchoes(state: Pick<GameState, 'traits' | 'completedArcs'>): Echo[] {
  const out: Echo[] = [];
  for (const t of state.traits ?? []) {
    const def = getTraitById(t.id);
    if (def) out.push({ kind: 'trait', age: t.earnedAtAge, label: def.name });
  }
  for (const a of state.completedArcs ?? []) {
    const def = getArcById(a.arcId);
    if (def) out.push({ kind: 'arc', age: a.completedAtAge, label: def.name });
  }
  return out.sort((a, b) => a.age - b.age);
}

/** Un écho ne « résonne » que quelques années après — un rappel doit avoir du recul. */
export const ECHO_MIN_GAP = 5;

const TRAIT_CALLBACKS = [
  'Je repense à mes {age} ans, quand je suis devenu « {label} ». Cette grâce me porte encore.',
  'Ce que j\'ai reçu il y a {years} ans en devenant « {label} » ne m\'a jamais quitté.',
  'Devenir « {label} », vers mes {age} ans, a marqué qui je suis aujourd\'hui.',
];

const ARC_CALLBACKS = [
  'Le chemin traversé vers mes {age} ans — {label} — a laissé sa marque sur moi.',
  'Je n\'oublie pas {label} : il y a {years} ans, cela a changé ma route.',
  'Ce que j\'ai vécu à {age} ans ({label}) résonne encore en moi.',
];

/**
 * Choisit un écho ASSEZ ancien (≥ ECHO_MIN_GAP ans de recul) et en formule un rappel.
 * Retourne `null` s'il n'y a aucun moment assez lointain à évoquer.
 */
export function pickEchoCallback(
  echoes: Echo[],
  currentAge: number,
  rng: Rng,
): string | null {
  const eligible = echoes.filter((e) => e.age <= currentAge - ECHO_MIN_GAP);
  if (eligible.length === 0) return null;
  const e = eligible[Math.floor(rng() * eligible.length)] ?? eligible[0];
  const years = currentAge - e.age;
  const bank = e.kind === 'trait' ? TRAIT_CALLBACKS : ARC_CALLBACKS;
  const tpl = bank[Math.floor(rng() * bank.length)] ?? bank[0];
  return tpl
    .replace(/\{label\}/g, e.label)
    .replace(/\{age\}/g, String(e.age))
    .replace(/\{years\}/g, String(years));
}
