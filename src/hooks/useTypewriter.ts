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

  // `revealed` ne pilote QUE la révélation animée (rAF) : il part de 0 au montage et au
  // changement de `text` (l'effet redémarre, le 1er tick repose 0 — pas de setState
  // synchrone). Hors animation, le compte est DÉRIVÉ pendant le rendu (= text.length),
  // donc l'effet n'a alors aucun setState à faire → plus de set-state-in-effect.
  const [revealed, setRevealed] = useState(0);
  const rafRef = useRef<number | null>(null);

  // Reset state-on-prop-change (pattern React sanctionné, *pendant le rendu* — pas un
  // effet, et via un state-marqueur plutôt qu'une écriture de ref) : quand `text`
  // change, on repart de 0 immédiatement, sans flash de l'ancien compte sur le nouveau
  // texte et sans set-state-in-effect.
  const [prevText, setPrevText] = useState(text);
  if (prevText !== text) {
    setPrevText(text);
    setRevealed(0);
  }

  useEffect(() => {
    if (!animated) return; // rien à animer : le compte dérivé vaut déjà text.length
    const start = performance.now();
    const tick = (now: number) => {
      const shown = charsToShow(now - start, cps, text.length);
      setRevealed(shown);
      if (shown < text.length) {
        rafRef.current = requestAnimationFrame(tick);
      }
    };
    // 1er tick à elapsed≈0 : charsToShow → 0, repose le compte de départ sans setState sync.
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [text, cps, animated]);

  // Compte effectif dérivé du rendu : tout révélé hors animation, sinon l'avancée rAF.
  const count = animated ? revealed : text.length;
  const done = count >= text.length;

  const skip = () => {
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    setRevealed(text.length); // révèle tout ; un événement (clic) → setState hors effet, OK
  };

  return { shown: text.slice(0, count), done, skip };
}
