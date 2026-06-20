/**
 * @file statFloats.ts
 * @description Logique PURE des indicateurs flottants `+N/-N` qui apparaissent sur les
 *   jauges quand une statistique change. Séparée du composant pour être testable hors
 *   React (et pour que `StatBar` reste un simple mappeur — invariant 2).
 *
 * Un « float » est un artefact d'animation éphémère lié à la *transition* entre deux
 * états de stats (pas dérivable du seul état présent), c'est pourquoi il est piloté par
 * une souscription au store plutôt que par un effet de rendu.
 */
import type { StatName } from '../types/game';

export const STAT_KEYS: StatName[] = ['foi', 'paix', 'physique', 'finances'];

export type FloatItem = { id: number; delta: number };
export type FloatMap = Record<StatName, FloatItem[]>;

/** État vide (aucun float affiché). */
export function emptyFloatMap(): FloatMap {
  return { foi: [], paix: [], physique: [], finances: [] };
}

/**
 * Calcule les nouveaux floats à émettre entre deux snapshots de stats.
 * `nextId` est injecté (pas de `performance.now`/`Math.random` ici) → déterministe et
 * testable. Renvoie une entrée par stat dont la valeur a changé (delta ≠ 0).
 */
export function diffStatFloats(
  prev: Record<StatName, number>,
  next: Record<StatName, number>,
  nextId: () => number,
): Array<[StatName, FloatItem]> {
  const entries: Array<[StatName, FloatItem]> = [];
  for (const key of STAT_KEYS) {
    const delta = next[key] - prev[key];
    if (delta !== 0) {
      entries.push([key, { id: nextId(), delta }]);
    }
  }
  return entries;
}

/** Ajoute les floats donnés à la map (immutable). */
export function addFloats(
  map: FloatMap,
  entries: Array<[StatName, FloatItem]>,
): FloatMap {
  if (entries.length === 0) return map;
  const next: FloatMap = { ...map };
  for (const [key, item] of entries) {
    next[key] = [...next[key], item];
  }
  return next;
}

/** Retire un float par (stat, id) — appelé à l'expiration de l'animation. */
export function removeFloat(map: FloatMap, key: StatName, id: number): FloatMap {
  return { ...map, [key]: map[key].filter((i) => i.id !== id) };
}
