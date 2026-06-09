/**
 * @file EliasPortrait.tsx
 * @description Portrait pixel art d'Élias — sprite adventurer-neutral.
 *
 * Réagit visuellement à l'état du jeu :
 *  - idle    : affichage normal
 *  - success : lueur verte + bounce
 *  - fail    : tremblement + teinte rouge
 *  - event   : légère pulsation (en attente de réponse)
 *
 * Le sprite est un PNG 128×128px affiché avec image-rendering: pixelated.
 */

import { useGameStore } from '../stores/gameStore';

interface EliasPortraitProps {
  size?: number;
}

export function EliasPortrait({ size = 72 }: EliasPortraitProps) {
  const age = useGameStore((s) => s.age);
  const phase = useGameStore((s) => s.phase);
  const lastEventResult = useGameStore((s) => s.lastEventResult);

  // Filtre CSS selon l'état de jeu
  let filter = 'none';
  let animation = '';
  let shadow = 'none';

  if (lastEventResult === 'success') {
    filter = 'brightness(1.2) drop-shadow(0 0 8px rgba(101,163,13,0.9))';
    shadow = '0 0 20px rgba(101,163,13,0.4), 0 0 40px rgba(101,163,13,0.15)';
    animation = 'portraitBounce 0.4s ease';
  } else if (lastEventResult === 'fail') {
    filter = 'brightness(0.85) sepia(0.4) hue-rotate(350deg) drop-shadow(0 0 6px rgba(220,107,61,0.8))';
    shadow = '0 0 20px rgba(220,107,61,0.4)';
    animation = 'portraitShake 0.4s ease';
  } else if (phase === 'event') {
    filter = 'brightness(1.05) drop-shadow(0 0 4px rgba(245,158,11,0.5))';
    animation = 'portraitPulse 2s ease infinite';
  }

  // Badge d'âge sous le portrait (petit indicateur de progression)
  const lifeStageColor =
    age >= 80 ? '#fb923c'
    : age >= 60 ? '#fde68a'
    : age >= 30 ? '#c4b5fd'
    : age >= 18 ? '#a78bfa'
    : age >= 12 ? '#93c5fd'
    : '#86efac';

  return (
    <div
      id="elias-portrait-container"
      style={{
        position: 'relative',
        width: size,
        height: size,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* Halo de fond selon l'état */}
      <div style={{
        position: 'absolute',
        inset: -4,
        borderRadius: '50%',
        boxShadow: shadow,
        transition: 'box-shadow 0.3s ease',
        pointerEvents: 'none',
      }} />

      {/* Cercle de fond dans le thème violet du jeu */}
      <div style={{
        position: 'absolute',
        inset: 0,
        borderRadius: '50%',
        background: 'radial-gradient(circle at 40% 35%, #3d2408 0%, #120d07 100%)',
        border: `1px solid ${lifeStageColor}30`,
      }} />

      {/* Sprite pixel art du personnage */}
      <img
        src="/elias-avatar.png"
        alt="Élias"
        style={{
          position: 'relative',
          width: size * 0.88,
          height: size * 0.88,
          imageRendering: 'pixelated',
          filter,
          animation,
          objectFit: 'contain',
          zIndex: 1,
        }}
      />

      {/* Indicator d'âge — petit point coloré */}
      <div style={{
        position: 'absolute',
        bottom: 2,
        right: 2,
        width: 8,
        height: 8,
        borderRadius: '50%',
        background: lifeStageColor,
        border: '1px solid #120d07',
        boxShadow: `0 0 6px ${lifeStageColor}`,
        zIndex: 2,
        transition: 'background 0.5s ease, box-shadow 0.5s ease',
      }} />
    </div>
  );
}
