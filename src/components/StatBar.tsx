import { useGameStore } from '../stores/gameStore';
import { STAT_ICONS, STAT_COLORS } from './IconSystem';
import type { StatName } from '../types/game';

const statKeys: StatName[] = ['foi', 'paix', 'physique', 'finances'];
const statLabels: Record<StatName, string> = {
  foi: 'Foi', paix: 'Paix', physique: 'Physique', finances: 'Finances',
};

export function StatBar() {
  const stats = useGameStore((s) => s.stats);

  return (
    <div id="stat-bar">
      {statKeys.map((key) => {
        const Icon = STAT_ICONS[key];
        const color = STAT_COLORS[key];
        const value = stats[key];
        const danger = value <= 25;

        return (
          <div key={key} className="stat-item">
            <div className="stat-icon" style={{ color }}>
              <Icon size={14} />
            </div>
            <div className="stat-info">
              <span className="stat-label" style={{ color: danger ? color : 'var(--text-muted)' }}>
                {statLabels[key]}
              </span>
              <div className="stat-track" style={{ background: 'rgba(255,255,255,0.08)', position: 'relative' }}>
                {/* Kenney bar background via CSS */}
                <div
                  className="stat-fill"
                  style={{
                    width: `${Math.max(0, value)}%`,
                    background: color,
                    boxShadow: danger ? `0 0 8px ${color}` : 'none',
                    position: 'relative',
                    zIndex: 1,
                  }}
                />
              </div>
            </div>
            <span className="stat-value" style={{ color, fontFamily: "'Kenney Future', monospace", fontSize: 11 }}>
              {value}
            </span>
          </div>
        );
      })}
    </div>
  );
}
