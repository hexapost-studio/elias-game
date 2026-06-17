/**
 * @file useTypewriter.ts
 * @description Révélation « machine à écrire » d'un texte, au service du pacing.
 *
 * - Cadence pilotée par le système `textSpeed` (réglage joueur, réactif).
 * - Respecte `prefers-reduced-motion` (affichage instantané, norme d'accessibilité).
 * - `skip()` révèle tout immédiatement (pattern Skip des VN).
 * - rAF (pas de setInterval) : fluide et économe.
 *
 * Graceful degradation : si le système de vitesse disparaît ou vaut `instant`, le texte
 * s'affiche d'un bloc — aucun composant ne casse.
 */
import { useEffect, useRef, useState } from 'react';
import { charsToShow, cpsFor, useReadingSpeed } from '../settings/textSpeed';

function prefersReducedMotion(): boolean {
  try {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  } catch {
    return false;
  }
}

export interface TypewriterResult {
  /** Portion de texte actuellement révélée. */
  shown: string;
  /** Vrai quand tout le texte est affiché. */
  done: boolean;
  /** Révèle instantanément la totalité du texte. */
  skip: () => void;
}

export function useTypewriter(
  text: string,
  opts: { cps?: number; enabled?: boolean } = {},
): TypewriterResult {
  const speed = useReadingSpeed();
  const cps = opts.cps ?? cpsFor(speed);
  const animated =
    (opts.enabled ?? true) && Number.isFinite(cps) && !prefersReducedMotion();

  const [count, setCount] = useState(animated ? 0 : text.length);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (!animated) {
      setCount(text.length);
      return;
    }
    setCount(0);
    const start = performance.now();
    const tick = (now: number) => {
      const shown = charsToShow(now - start, cps, text.length);
      setCount(shown);
      if (shown < text.length) {
        rafRef.current = requestAnimationFrame(tick);
      }
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [text, cps, animated]);

  const done = count >= text.length;

  const skip = () => {
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    setCount(text.length);
  };

  return { shown: text.slice(0, count), done, skip };
}
