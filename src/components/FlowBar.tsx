import { useGameStore } from '../stores/gameStore';
import { Zap, Brain, Flame } from './IconSystem';

export function FlowBar() {
  const flow = useGameStore((s) => s.flow);

  const palierConfig: Record<number, { color: string; bg: string; label: string; Icon: typeof Zap }> = {
    1: { color: 'var(--flow-palier1)', bg: 'rgba(107, 114, 128, 0.2)', label: 'APPRENTISSAGE', Icon: Brain },
    2: { color: 'var(--flow-palier2)', bg: 'rgba(245, 158, 11, 0.2)', label: 'TRANSITION', Icon: Zap },
    3: { color: 'var(--flow-palier3)', bg: 'rgba(167, 139, 250, 0.2)', label: 'HARDCORE', Icon: Flame },
  };

  const p = palierConfig[flow.palier];

  return (
    <div id="flow-bar">
      <div className="flow-container">
        <span className="flow-icon" style={{ color: p.color }}>
          <p.Icon size={12} strokeWidth={2} />
        </span>
        <div className="flow-track" style={{ background: p.bg }}>
          <div
            className="flow-fill"
            style={{
              width: `${flow.value}%`,
              background: `linear-gradient(90deg, ${p.color}, ${flow.palier === 3 ? 'var(--accent-violet-light)' : p.color})`,
              boxShadow: `0 0 8px ${p.color}`,
            }}
          />
        </div>
        <span className="flow-palier-label" style={{ color: p.color }}>
          {p.label}
        </span>
      </div>
    </div>
  );
}
