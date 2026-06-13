import { useGameStore } from '../stores/gameStore';
import type { PlayerAction } from '../types/game';

interface ActionDef {
  id: PlayerAction;
  label: string;
  effect: string;
  icon: string;
}

const ACTIONS: ActionDef[] = [
  { id: 'pray',        label: 'Prier',        effect: '+Foi',      icon: '🙏' },
  { id: 'fast',        label: 'Jeûner',       effect: '+Foi −Corps', icon: '✦' },
  { id: 'serve',       label: 'Servir',       effect: '+Paix',     icon: '🤝' },
  { id: 'call_friend', label: 'Appeler',      effect: '+Paix +Lien', icon: '📞' },
  { id: 'read_word',   label: 'Lire',         effect: '+Foi',      icon: '📖' },
];

export function ActionPanel() {
  const actionPoints    = useGameStore((s) => s.actionPoints);
  const actionsThisYear = useGameStore((s) => s.actionsThisYear);
  const friendName      = useGameStore((s) => s.lifeContext.friendName);
  const useAction       = useGameStore((s) => s.useAction);
  const phase           = useGameStore((s) => s.phase);
  const amiRelationship = useGameStore((s) => s.amiRelationship);

  if (phase !== 'idle') return null;

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: 6,
      padding: '10px 0 4px',
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 2,
      }}>
        <span style={{ fontSize: 10, color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          Actions cette année
        </span>
        <span style={{
          fontSize: 10,
          fontWeight: 700,
          color: actionPoints > 0 ? 'var(--accent-violet)' : 'var(--text-muted)',
        }}>
          {actionPoints} point{actionPoints !== 1 ? 's' : ''}
        </span>
      </div>

      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {ACTIONS.map((action) => {
          const used      = actionsThisYear.includes(action.id);
          const exhausted = actionPoints <= 0;
          const disabled  = used || exhausted;
          const displayLabel = action.id === 'call_friend'
            ? `Appeler ${friendName}`
            : action.label;

          const isCallFriend = action.id === 'call_friend';
          const amiWeak = isCallFriend && amiRelationship < 25;
          const amiStrong = isCallFriend && amiRelationship >= 75;
          const displayEffect = isCallFriend
            ? amiWeak   ? '+Paix ⚠ Lien faible'
            : amiStrong ? '+Paix ✦ Lien fort'
            : action.effect
            : action.effect;
          const callFriendBorder = isCallFriend && !used
            ? amiWeak   ? '1px solid rgba(239,68,68,0.5)'
            : amiStrong ? '1px solid rgba(52,211,153,0.5)'
            : '1px solid var(--accent-violet)'
            : undefined;

          return (
            <button
              key={action.id}
              disabled={disabled}
              onClick={() => useAction(action.id)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 2,
                padding: '6px 10px',
                borderRadius: 8,
                border: callFriendBorder ?? (used
                  ? '1px solid var(--text-muted)'
                  : '1px solid var(--accent-violet)'),
                background: used
                  ? 'rgba(255,255,255,0.04)'
                  : exhausted
                  ? 'rgba(255,255,255,0.04)'
                  : isCallFriend && amiWeak
                  ? 'rgba(239,68,68,0.07)'
                  : isCallFriend && amiStrong
                  ? 'rgba(52,211,153,0.1)'
                  : 'rgba(139,92,246,0.12)',
                opacity: disabled ? 0.45 : 1,
                cursor: disabled ? 'not-allowed' : 'pointer',
                transition: 'all 0.15s',
                minWidth: 58,
              }}
            >
              <span style={{ fontSize: 16, lineHeight: 1 }}>{action.icon}</span>
              <span style={{
                fontSize: 9,
                fontWeight: 700,
                color: used ? 'var(--text-muted)' : 'var(--text-primary)',
                letterSpacing: '0.04em',
                whiteSpace: 'nowrap',
              }}>
                {displayLabel}
              </span>
              <span style={{
                fontSize: 8,
                color: amiWeak ? 'rgba(239,68,68,0.8)' : amiStrong ? 'rgba(52,211,153,0.8)' : 'var(--text-muted)',
                whiteSpace: 'nowrap',
              }}>
                {displayEffect}
              </span>
              {used && (
                <span style={{ fontSize: 8, color: 'var(--accent-violet)' }}>✓</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
