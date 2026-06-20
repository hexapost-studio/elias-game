/**
 * @file choiceOrder.ts
 * @description Ordre PUR et déterministe des propositions de versets pour un événement.
 *   Mélange seedé (Fisher–Yates piloté par `mulberry32`/`hashSeed`) → même événement,
 *   même ordre, sur toute la durée de son affichage. Permet de DÉRIVER l'ordre pendant
 *   le rendu au lieu de le poser en state dans un effet (invariant 3).
 */
import { mulberry32, hashSeed } from './rng';

/** Mélange Fisher–Yates déterministe (ne mute pas l'entrée). */
export function seededShuffle<T>(items: readonly T[], seed: number): T[] {
  const rng = mulberry32(seed);
  const out = items.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/**
 * Ids de versets (correct + leurres) mélangés de façon stable pour un événement donné.
 * La graine dérive de l'id de l'événement → réordonnancement déterministe, sans state.
 */
export function shuffledChoiceIds(
  eventId: string,
  correctVerseId: string,
  decoyVerseIds: readonly string[],
): string[] {
  return seededShuffle([correctVerseId, ...decoyVerseIds], hashSeed(eventId));
}
