/**
 * @file seenText.ts
 * @description Système « texte déjà-lu » — mémorise les beats narratifs déjà révélés.
 *
 * Optimisation VN « smart skip / s'arrêter au non-lu » : un texte déjà lu se ré-affiche
 * d'un bloc (pas de frappe), le texte vraiment nouveau s'anime et porte un repère « ✦ nouveau ».
 * On indexe par EMPREINTE de contenu (`hashSeed`), pas par position : un même beat est reconnu
 * d'une partie à l'autre (clé de la rejouabilité une fois les graines déterministes, itér. 10).
 *
 * Module autonome, persisté en localStorage. Découplé → réversible : retirer ce fichier et son
 * import dans VerseChoices rend tout le texte « neuf » à nouveau, sans rien casser d'autre.
 */
import { hashSeed } from '../engine/rng';

const STORAGE_KEY = 'elias-seen-text';
/** Plafond souple : borne la mémoire pour éviter une croissance illimitée (events IA = texte unique). */
const MAX_KEYS = 4000;

/**
 * Empreinte stable d'un beat narratif (insensible aux espaces parasites). PUR, testable.
 * Chaîne vide → `''` (jamais mémorisée, jamais « déjà-lue »).
 */
export function textKey(text: string): string {
  const norm = text.replace(/\s+/g, ' ').trim();
  return norm === '' ? '' : hashSeed(norm).toString(36);
}

function load(): Set<string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const arr: unknown = JSON.parse(raw);
      if (Array.isArray(arr)) {
        return new Set(arr.filter((k): k is string => typeof k === 'string'));
      }
    }
  } catch { /* localStorage indisponible ou JSON corrompu : on repart à vide */ }
  return new Set();
}

let seen: Set<string> = load();

function persist(): void {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify([...seen])); }
  catch { /* best-effort : la mémoire de lecture n'est pas critique */ }
}

/** Le beat a-t-il déjà été lu ? (lecture pure, hors React) */
export function isSeen(key: string): boolean {
  return key !== '' && seen.has(key);
}

/** Marque un beat comme lu. No-op si vide ou déjà connu. */
export function markSeen(key: string): void {
  if (key === '' || seen.has(key)) return;
  seen.add(key);
  if (seen.size > MAX_KEYS) {
    // FIFO souple : on retire les plus anciens (le Set préserve l'ordre d'insertion).
    seen = new Set([...seen].slice(seen.size - MAX_KEYS));
  }
  persist();
}

/** Vide la mémoire de lecture (tests, et futur réglage « tout marquer comme neuf »). */
export function clearSeen(): void {
  seen = new Set();
  persist();
}
