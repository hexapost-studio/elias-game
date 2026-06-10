import { useGameStore } from '../stores/gameStore';
import { Zap, Brain, Flame } from './IconSystem';

const PALIER_CONFIG: Record<number, {
  color: string; bg: string; label: string; multiplier: string;
  hint: string; Icon: typeof Zap;
}> = {
  1: {
    color: 'var(--flow-palier1)',
    bg: 'rgba(107, 114, 128, 0.2)',
    label: 'REPOS',
    multiplier: 'x1',
    hint: 'Bonus versets normaux',
    Icon: Brain,
  },
  2: {
    color: 'var(--flow-palier2)',
    bg: 'rgba(245, 158, 11, 0.2)',
    label: 'FERVEUR',
    multiplier: 'x1.5',
    hint: 'Bonus versets ×1.5',
    Icon: Zap,
  },
  3: {
    color: 'var(--flow-palier3)',
    bg: 'rgba(251, 146, 60, 0.25)',
    label: 'FEU DE DIEU',
    multiplier: 'x2.5',
    hint: 'Bonus ×2.5 — Corps -3/succès',
    Icon: Flame,
  },
};

export function FlowBar() {
  const flow = useGameStore((s) => s.flow);
  const p = PALIER_CONFIG[flow.palier];

  return (
    <div id="flow-bar">
      <div className="flow-container">
        <span className="flow-icon" style={{ color: p.color }}>
          <p.Icon size={12} strokeWidth={2} />
        </span>
        <div className="flow-track" style={{ background: p.bg }} title={p.hint}>
          <div
            className="flow-fill"
            style={{
              width: `${flow.value}%`,
              background: `linear-gradient(90deg, ${p.color}, ${flow.palier === 3 ? '#fbbf24' : p.color})`,
              boxShadow: flow.palier === 3 ? `0 0 10px ${p.color}` : `0 0 6px ${p.color}`,
            }}
          />
        </div>
        <span className="flow-palier-label" style={{ color: p.color }}>
          <span>{p.label}</span>
          <span style={{ opacity: 0.7, fontFamily: 'var(--font-body)', letterSpacing: 0 }}>{p.multiplier}</span>
        </span>
      </div>
    </div>
  );
}
