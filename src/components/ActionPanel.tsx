import { useGameStore } from '../stores/gameStore';
import type { PlayerAction } from '../types/game';
import { Heart, Handshake, Phone, BookOpen, Briefcase, Moon } from 'lucide-react';
import { color, space, radius, fontSize, weight, tracking, rgb, alpha } from '../styles/tokens';

interface ActionDef {
  id: PlayerAction;
  label: string;
  effect: string;
  icon: React.ReactNode;
}

const ACTIONS: ActionDef[] = [
  { id: 'pray',        label: 'Prier',        effect: '+Foi',      icon: <Heart size={14} strokeWidth={1.5} /> },
  { id: 'fast',        label: 'Jeûner',       effect: '+Foi −Corps', icon: <span style={{ fontSize: fontSize.base }}>✦</span> },
  { id: 'serve',       label: 'Servir',       effect: '+Paix',     icon: <Handshake size={14} strokeWidth={1.5} /> },
  { id: 'call_friend', label: 'Appeler',      effect: '+Paix +Lien', icon: <Phone size={14} strokeWidth={1.5} /> },
  { id: 'read_word',   label: 'Lire',         effect: '+Foi',      icon: <BookOpen size={14} strokeWidth={1.5} /> },
  { id: 'work',        label: 'Travailler',   effect: '+Argent −Corps', icon: <Briefcase size={14} strokeWidth={1.5} /> },
  { id: 'rest',        label: 'Se reposer',   effect: '+Corps · sabbat', icon: <Moon size={14} strokeWidth={1.5} /> },
];

export function ActionPanel() {
  const actionPoints    = useGameStore((s) => s.actionPoints);
  const actionsThisYear = useGameStore((s) => s.actionsThisYear);
  const friendName      = useGameStore((s) => s.lifeContext.friendName);
  // Lié sous un nom NON préfixé `use…` : c'est une action du store, pas un Hook React.
  // (`useAction` déclenchait à tort react-hooks/rules-of-hooks dans le onClick.)
  const runAction       = useGameStore((s) => s.useAction);
  const phase           = useGameStore((s) => s.phase);
  const amiRelationship = useGameStore((s) => s.amiRelationship);
  const friendIntroduced = useGameStore((s) => s.friendIntroduced);

  if (phase !== 'idle') return null;

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: space.sm,
      padding: `${space.md}px 0 ${space.xs}px`,
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: space.xxs,
      }}>
        <span style={{ fontSize: fontSize.sm, color: color.textMuted, letterSpacing: tracking.wide, textTransform: 'uppercase' }}>
          Actions cette année
        </span>
        <span style={{
          fontSize: fontSize.sm,
          fontWeight: weight.bold,
          color: actionPoints > 0 ? color.accentViolet : color.textMuted,
        }}>
          {actionPoints} point{actionPoints !== 1 ? 's' : ''}
        </span>
      </div>

      <div style={{ display: 'flex', gap: space.sm, flexWrap: 'wrap' }}>
        {ACTIONS.map((action) => {
          const used      = actionsThisYear.includes(action.id);
          const exhausted = actionPoints <= 0;
          const locked    = action.id === 'call_friend' && !friendIntroduced;
          const disabled  = used || exhausted || locked;
          const displayLabel = action.id === 'call_friend'
            ? locked ? '???' : `Appeler ${friendName}`
            : action.label;

          const isCallFriend = action.id === 'call_friend';
          const amiWeak = isCallFriend && amiRelationship < 25;
          const amiStrong = isCallFriend && amiRelationship >= 75;
          const displayEffect = locked
            ? '🔒 Enfant'
            : isCallFriend
            ? amiWeak   ? '+Paix ⚠ Lien faible'
            : amiStrong ? '+Paix ✦ Lien fort'
            : action.effect
            : action.effect;
          const callFriendBorder = isCallFriend && !used
            ? locked ? `1px solid ${alpha(rgb.locked, 0.3)}`
            : amiWeak   ? `1px solid ${alpha(rgb.amiWeak, 0.5)}`
            : amiStrong ? `1px solid ${alpha(rgb.amiStrong, 0.5)}`
            : `1px solid ${color.accentViolet}`
            : undefined;

          return (
            <button
              key={action.id}
              disabled={disabled}
              onClick={() => runAction(action.id)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: space.xxs,
                padding: `${space.sm}px ${space.md}px`,
                borderRadius: radius.md,
                border: callFriendBorder ?? (used
                  ? `1px solid ${color.textMuted}`
                  : `1px solid ${color.accentViolet}`),
                background: used
                  ? alpha(rgb.white, 0.04)
                  : exhausted
                  ? alpha(rgb.white, 0.04)
                  : locked
                  ? alpha(rgb.locked, 0.04)
                  : isCallFriend && amiWeak
                  ? alpha(rgb.amiWeak, 0.07)
                  : isCallFriend && amiStrong
                  ? alpha(rgb.amiStrong, 0.1)
                  : alpha(rgb.violet, 0.12),
                opacity: disabled ? 0.45 : 1,
                cursor: disabled ? 'not-allowed' : 'pointer',
                transition: 'all 0.15s',
                minWidth: 58,
              }}
            >
              <span style={{ fontSize: fontSize.lg, lineHeight: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{action.icon}</span>
              <span style={{
                fontSize: fontSize.xs,
                fontWeight: weight.bold,
                color: used ? color.textMuted : color.textPrimary,
                letterSpacing: tracking.tight,
                whiteSpace: 'nowrap',
              }}>
                {displayLabel}
              </span>
              <span style={{
                fontSize: fontSize.xxs,
                color: amiWeak ? alpha(rgb.amiWeak, 0.8) : amiStrong ? alpha(rgb.amiStrong, 0.8) : color.textMuted,
                whiteSpace: 'nowrap',
              }}>
                {displayEffect}
              </span>
              {used && (
                <span style={{ fontSize: fontSize.xxs, color: color.accentViolet }}>✓</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
