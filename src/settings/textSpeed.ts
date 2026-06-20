/**
 * @file textSpeed.ts
 * @description Système de « vitesse de lecture » — le rythme de révélation du texte.
 *
 * Inspiré de l'optimisation n°1 des VN / fictions interactives : contrôler la vitesse
 * d'affichage du texte sert le *pacing* dramatique (impact comique, suspense, gravité).
 *
 * Module réactif autonome (pattern store via useSyncExternalStore) : n'importe quel
 * composant peut lire/écrire la préférence SANS prop-drilling. Persisté en localStorage.
 * Découplé → réversible : retirer ce module + ses imports suffit, le texte redevient
 * instantané partout.
 */
import { useSyncExternalStore } from 'react';

export type ReadingSpeed = 'instant' | 'natural' | 'slow';

/** Caractères par seconde pour chaque vitesse. `Infinity` = pas d'animation. */
export const READING_CPS: Record<ReadingSpeed, number> = {
  instant: Infinity,
  natural: 45,
  slow: 22,
};

export const READING_LABELS: Record<ReadingSpeed, string> = {
  instant: 'Instantané',
  natural: 'Naturel',
  slow: 'Lent',
};

/** Ordre de cycle pour un bouton « basculer ». */
export const READING_ORDER: ReadingSpeed[] = ['natural', 'slow', 'instant'];

const STORAGE_KEY = 'elias-reading-speed';

function load(): ReadingSpeed {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === 'instant' || raw === 'natural' || raw === 'slow') return raw;
  } catch { /* localStorage indisponible : on garde le défaut */ }
  return 'natural';
}

let current: ReadingSpeed = load();
const listeners = new Set<() => void>();

export function getReadingSpeed(): ReadingSpeed {
  return current;
}

export function setReadingSpeed(speed: ReadingSpeed): void {
  if (speed === current) return;
  current = speed;
  try { localStorage.setItem(STORAGE_KEY, speed); } catch { /* best-effort */ }
  listeners.forEach((fn) => fn());
}

/** Passe à la vitesse suivante dans READING_ORDER (pour un bouton de réglage). */
export function cycleReadingSpeed(): ReadingSpeed {
  const i = READING_ORDER.indexOf(current);
  const next = READING_ORDER[(i + 1) % READING_ORDER.length];
  setReadingSpeed(next);
  return next;
}

/** Caractères par seconde pour une vitesse donnée (défaut : la vitesse courante). */
export function cpsFor(speed: ReadingSpeed = current): number {
  return READING_CPS[speed];
}

function subscribe(fn: () => void): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

/** Hook React réactif : re-rend quand la préférence change. */
export function useReadingSpeed(): ReadingSpeed {
  return useSyncExternalStore(subscribe, getReadingSpeed, getReadingSpeed);
}

/**
 * Helper PUR (testable hors React) : nombre de caractères à afficher après `elapsedMs`,
 * à la cadence `cps`, borné par `total`. `Infinity` → tout, tout de suite.
 */
export function charsToShow(elapsedMs: number, cps: number, total: number): number {
  if (!Number.isFinite(cps)) return total;
  if (elapsedMs <= 0) return 0;
  return Math.min(total, Math.floor((elapsedMs * cps) / 1000));
}
