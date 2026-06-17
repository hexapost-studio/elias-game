import { useEffect, useRef, useState } from 'react';
import { useGameStore } from '../stores/gameStore';
import type { StatName } from '../types/game';

const statKeys: StatName[] = ['foi', 'paix', 'physique', 'finances'];

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

type FloatItem = { id: number; delta: number };

export function StatBar() {
  const stats = useGameStore((s) => s.stats);
  const prevStatsRef = useRef<Record<StatName, number> | null>(null);
  const [floats, setFloats] = useState<Record<StatName, FloatItem[]>>({
    foi: [], paix: [], physique: [], finances: [],
  });

  useEffect(() => {
    if (prevStatsRef.current === null) {
      prevStatsRef.current = { ...stats };
      return;
    }
    const prev = prevStatsRef.current;
    const newEntries: Array<[StatName, FloatItem]> = [];

    for (const key of statKeys) {
      const delta = stats[key] - prev[key];
      if (delta !== 0) {
        const id = performance.now() + Math.random();
        newEntries.push([key, { id, delta }]);
        setTimeout(() => {
          setFloats(f => ({ ...f, [key]: f[key].filter(i => i.id !== id) }));
        }, 800);
      }
    }

    prevStatsRef.current = { ...stats };

    if (newEntries.length > 0) {
      setFloats(f => {
        const next = { ...f };
        for (const [key, item] of newEntries) {
          next[key] = [...f[key], item];
        }
        return next;
      });
    }
  }, [stats]);

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
