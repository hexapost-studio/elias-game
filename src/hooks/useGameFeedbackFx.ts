import { useEffect, useRef } from 'react';
import type { RefObject } from 'react';
import {
  playSuccess, playFail, playLevelUp, playCombo, spawnParticles, glowFlash, screenShake,
} from '../engine/juice';

interface GameOverLike {
  isOver: boolean;
  reason: string;
}

interface FeedbackFxArgs {
  phase: string;
  lastEventResult: string | null;
  dismissResult: () => void;
  gameOver: GameOverLike | null | undefined;
  combo: number;
  age: number;
  containerRef: RefObject<HTMLDivElement | null>;
}

/**
 * useGameFeedbackFx — effets impératifs de « juice » (son / particules / vibration / screen-shake)
 * joués SUR LES TRANSITIONS d'état. Extrait d'App.tsx (G-4 / itér.95), comportement IDENTIQUE.
 *
 * Règle AAA (cf. CLAUDE.md §4) : un effet sonore/visuel ne part jamais pendant le rendu, toujours
 * dans un effet. Les refs de garde (`gameOverSoundPlayed`, `prevCombo`, `prevAge`) sont internes
 * à ces effets → déplacées ici avec eux.
 */
export function useGameFeedbackFx({
  phase, lastEventResult, dismissResult, gameOver, combo, age, containerRef,
}: FeedbackFxArgs): void {
  // Effet de RÉSULTAT : ne fait QUE le juice impératif (son/particules/vibration) sur la
  // transition. La bannière et les modales sont dérivées au rendu (côté App) ; seul l'auto-dismiss
  // du succès reste ici, et son setState part du callback différé du timer.
  useEffect(() => {
    if (phase !== 'result' || !lastEventResult) return;
    if (lastEventResult === 'success') {
      playSuccess();
      try { navigator.vibrate([5, 50, 10]); } catch { /* vibrate non supporté */ }
      if (containerRef.current) {
        spawnParticles(containerRef.current, 'success', 10);
        glowFlash(containerRef.current, 'rgba(16, 185, 129, 0.3)');
      }
      const timer = setTimeout(() => dismissResult(), 1500);
      return () => clearTimeout(timer);
    } else {
      // Échec → confirmation manuelle, le joueur doit lire le verset.
      playFail();
      try { navigator.vibrate(20); } catch { /* vibrate non supporté */ }
      screenShake(6, 400);
      if (containerRef.current) {
        spawnParticles(containerRef.current, 'fail', 6);
      }
    }
  }, [phase, lastEventResult, dismissResult, containerRef]);

  // Son de fin de partie — joué une seule fois à la bascule en game over.
  const gameOverSoundPlayed = useRef(false);
  useEffect(() => {
    if (gameOver?.isOver && !gameOverSoundPlayed.current) {
      gameOverSoundPlayed.current = true;
      if (gameOver.reason === 'victory') playLevelUp();
      else playFail();
    }
  }, [gameOver?.isOver, gameOver?.reason]);
  // Reset de la garde quand une nouvelle partie commence.
  useEffect(() => {
    if (!gameOver?.isOver) gameOverSoundPlayed.current = false;
  }, [gameOver?.isOver]);

  // Combo sound
  const prevCombo = useRef(0);
  useEffect(() => {
    if (combo >= 5 && combo > prevCombo.current) {
      playCombo();
      if (containerRef.current) {
        spawnParticles(containerRef.current, 'combo', 5);
      }
    }
    prevCombo.current = combo;
  }, [combo, containerRef]);

  // Level up sound
  const prevAge = useRef(0);
  useEffect(() => {
    if (age > 0 && age !== prevAge.current && [15, 25, 60, 80].includes(age)) {
      playLevelUp();
    }
    prevAge.current = age;
  }, [age]);
}
