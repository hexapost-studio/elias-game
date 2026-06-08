import { useGameStore } from '../stores/gameStore';

interface EliasPortraitProps {
  size?: number;
}

export function EliasPortrait({ size = 64 }: EliasPortraitProps) {
  const age = useGameStore((s) => s.age);
  const phase = useGameStore((s) => s.phase);
  const lastEventResult = useGameStore((s) => s.lastEventResult);

  // L'âge détermine l'apparence
  const isChild = age < 16;
  const isYoung = age < 25;
  const isAdult = age < 60;
  const isElder = age >= 60;

  const glowClass =
    lastEventResult === 'success'
      ? 'success-glow'
      : lastEventResult === 'fail'
      ? 'fail-glow'
      : '';

  // Couleur des yeux selon l'état
  const eyeColor = lastEventResult === 'fail' ? '#ef4444' : '#a78bfa';
  const skinColor = isChild ? '#f5d6c6' : isElder ? '#d4b89a' : '#e8c9b9';
  const hairColor = isElder ? '#9ca3af' : '#4a3728';
  const shirtColor = isChild ? '#7c3aed' : isAdult ? '#5b21b6' : '#3b0764';

  return (
    <div
      id="elias-portrait-container"
      className={glowClass}
      style={{ width: size, height: size }}
    >
      <svg
        id="elias-portrait-svg"
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Fond cercle */}
        <circle cx="50" cy="50" r="48" fill="#1a1228" stroke={eyeColor} strokeWidth="0.5" />

        {/* Corps */}
        <rect x="30" y="62" width="40" height="30" rx="8" fill={shirtColor} opacity={0.8} />

        {/* Cou */}
        <rect x="42" y="48" width="16" height="16" rx="4" fill={skinColor} />

        {/* Tête */}
        <ellipse cx="50" cy="35" rx="22" ry="24" fill={skinColor} />

        {/* Cheveux */}
        {isChild ? (
          <ellipse cx="50" cy="18" rx="22" ry="12" fill={hairColor} />
        ) : (
          <>
            <ellipse cx="50" cy="16" rx="22" ry="14" fill={hairColor} />
            {isElder && (
              <ellipse cx="50" cy="18" rx="16" ry="8" fill="#d4b89a" opacity={0.5} />
            )}
          </>
        )}

        {/* Sourcils */}
        <line
          x1={isChild ? "38" : "36"}
          y1={isChild ? "28" : "27"}
          x2={isChild ? "45" : "44"}
          y2={isChild ? "30" : "29"}
          stroke="#2d1b0e"
          strokeWidth="1.5"
          strokeLinecap="round"
          opacity={lastEventResult === 'fail' ? 0.4 : 0.8}
        />
        <line
          x1={isChild ? "55" : "56"}
          y1={isChild ? "30" : "29"}
          x2={isChild ? "62" : "64"}
          y2={isChild ? "28" : "27"}
          stroke="#2d1b0e"
          strokeWidth="1.5"
          strokeLinecap="round"
          opacity={lastEventResult === 'fail' ? 0.4 : 0.8}
        />

        {/* Yeux */}
        <ellipse cx="41" cy="34" rx="3" ry={lastEventResult === 'fail' ? 2.5 : 3.5} fill="white" />
        <ellipse cx="59" cy="34" rx="3" ry={lastEventResult === 'fail' ? 2.5 : 3.5} fill="white" />
        <circle cx="41" cy="34" r="2" fill={eyeColor} />
        <circle cx="59" cy="34" r="2" fill={eyeColor} />

        {/* Bouche */}
        {lastEventResult === 'success' ? (
          <path d="M44 44 Q50 50 56 44" stroke="#2d1b0e" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        ) : lastEventResult === 'fail' ? (
          <path d="M44 48 Q50 44 56 48" stroke="#2d1b0e" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        ) : (
          <line x1="45" y1="46" x2="55" y2="46" stroke="#2d1b0e" strokeWidth="1" strokeLinecap="round" />
        )}

        {/* Lueur autour (état) */}
        {lastEventResult === 'success' && (
          <circle cx="50" cy="50" r="48" stroke="#10b981" strokeWidth="1" opacity={0.5}>
            <animate attributeName="r" values="48;52;48" dur="1.5s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.5;0.2;0.5" dur="1.5s" repeatCount="indefinite" />
          </circle>
        )}
      </svg>
    </div>
  );
}
