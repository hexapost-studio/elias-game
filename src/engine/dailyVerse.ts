/**
 * @file dailyVerse.ts
 * @description Sélection PURE du « verset du jour » — déterministe à partir d'une date.
 *   Extraite du composant pour être dérivée pendant le rendu (plus de state+effet) et
 *   testable hors React (invariants 2/3).
 */
export interface DailyVerseEntry {
  ref: string;
  text: string;
}

/** Numéro du jour dans l'année (1 = 1ᵉʳ janvier), basé sur l'heure locale. */
export function dayOfYear(date: Date): number {
  const startOfYear = new Date(date.getFullYear(), 0, 0);
  return Math.floor((date.getTime() - startOfYear.getTime()) / 86_400_000);
}

/**
 * Verset du jour : indexé cycliquement par le jour de l'année sur le pool fourni.
 * Stable pour une date donnée → le même verset toute la journée, change chaque jour.
 */
export function verseOfDay<T extends DailyVerseEntry>(date: Date, pool: T[]): T {
  return pool[dayOfYear(date) % pool.length];
}
