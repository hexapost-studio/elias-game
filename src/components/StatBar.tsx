import { useEffect, useState } from 'react';
import { useGameStore } from '../stores/gameStore';
import type { StatName } from '../types/game';
import {
  STAT_KEYS,
  emptyFloatMap,
  diffStatFloats,
  addFloats,
  removeFloat,
} from '../engine/statFloats';

const statKeys: StatName[] = STAT_KEYS;

const STAT_LABELS: Record<StatName, string> = {
  foi: 'Foi', paix: 'Paix', physique: 'Physique', finances: 'Finances',
};

const STAT_COLORS: Record<StatName, string> = {
  foi: 'var(--color-foi)',
  paix: 'var(--color-paix)',
  physique: 'var(--color-physique)',
  finances: 'var(--color-finances)',
};

const TB_ICONS: Record<StatName, string> = {
  foi:       '/ui/travelbook/UI_TravelBook_IconStar01a.png',
  paix:      '/ui/travelbook/UI_TravelBook_IconHeart01e.png',
  physique:  '/ui/travelbook/UI_TravelBook_IconHeart01a.png',
  finances:  '/ui/travelbook/UI_TravelBook_IconCoin01a.png',
};

const TB_FILTERS: Record<StatName, string> = {
  foi:      'hue-rotate(185deg) saturate(4) brightness(2.8)',
  paix:     'hue-rotate(115deg) saturate(3) brightness(2.2)',
  physique: 'brightness(2.8) saturate(0.9)',
  finances: 'brightness(1.6) saturate(1.8)',
};

export function StatBar() {
  const stats = useGameStore((s) => s.stats);
  const [floats, setFloats] = useState(emptyFloatMap);

  // Les floats `+N/-N` réagissent à la *transition* des stats (pas dérivables de l'état
  // présent). On les pilote via une souscription au store : le listener s'exécute HORS
  // du cycle de rendu React (comme un gestionnaire d'événement), donc aucun
  // set-state-in-effect. L'effet ne fait que poser/retirer la souscription.
  useEffect(() => {
    let idSeed = 0;
    const nextId = () => {
      idSeed += 1;
      return performance.now() + idSeed;
    };
    const unsubscribe = useGameStore.subscribe((state, prevState) => {
      const entries = diffStatFloats(prevState.stats, state.stats, nextId);
      if (entries.length === 0) return;
      setFloats((f) => addFloats(f, entries));
      for (const [key, item] of entries) {
        setTimeout(() => {
          setFloats((f) => removeFloat(f, key, item.id));
        }, 800);
      }
    });
    return unsubscribe;
  }, []);

  return (
    <div id="stat-bar">
      {statKeys.map((key) => {
        const value = stats[key];
        const danger = value <= 25;
        const warning = value < 20;
        const critical = value < 10;
        const dangerClass = critical ? 'stat-danger-critical' : warning ? 'stat-danger-warning' : '';
        const color = STAT_COLORS[key];

        return (
          <div key={key} className={`stat-item ${dangerClass}`} style={{ position: 'relative' }}>
            {floats[key].map((fi) => (
              <span
                key={fi.id}
                style={{
                  position: 'absolute',
                  right: 2,
                  top: -4,
                  color: fi.delta > 0 ? '#6ee7b7' : '#fca5a5',
                  fontSize: 9,
                  fontWeight: 600,
                  opacity: 0.7,
                  pointerEvents: 'none',
                  zIndex: 10,
                  animation: 'floatStat 0.75s ease-out forwards',
                  whiteSpace: 'nowrap',
                  textShadow: '0 1px 2px rgba(0,0,0,0.5)',
                  lineHeight: 1,
                  letterSpacing: '0.3px',
                }}
              >
                {fi.delta > 0 ? `+${fi.delta}` : fi.delta}
              </span>
            ))}
            <div className="stat-icon">
              <img
                src={TB_ICONS[key]}
                alt={key}
                style={{
                  width: 16,
                  height: 16,
                  imageRendering: 'pixelated',
                  objectFit: 'contain',
                  filter: TB_FILTERS[key] + (danger ? ` drop-shadow(0 0 3px ${color})` : ''),
                  animation: danger ? 'iconPulse 1s ease-in-out infinite alternate' : 'none',
                }}
              />
            </div>
            <div className="stat-info">
              <span className="stat-label" style={{ color: danger ? color : 'var(--text-muted)' }}>
                {STAT_LABELS[key]}
              </span>
              <div
                className="stat-track"
                style={{
                  backgroundImage: 'url(/ui/travelbook/UI_TravelBook_Bar01a.png)',
                  backgroundSize: '100% 100%',
                  imageRendering: 'pixelated',
                }}
              >
                <div
                  className="stat-fill"
                  style={{
                    width: `${Math.max(0, value)}%`,
                    background: `linear-gradient(90deg, ${color}cc, ${color})`,
                    boxShadow: danger ? `0 0 6px ${color}` : 'none',
                  }}
                />
              </div>
            </div>
            <span
              className="stat-value"
              style={{ color, fontFamily: "'Kenney Future', monospace", fontSize: 11 }}
            >
              {value}
            </span>
          </div>
        );
      })}

      <style>{`
        @keyframes iconPulse {
          from { transform: scale(1); }
          to   { transform: scale(1.15); }
        }
      `}</style>
    </div>
  );
}
