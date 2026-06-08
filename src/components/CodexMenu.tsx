import { useState } from 'react';
import { useGameStore } from '../stores/gameStore';
import { VERSE_DATABASE } from '../data/verses';
import { BookOpen, Lock, AlertTriangle, Unlock, XIcon, Check, Bookmark } from './IconSystem';

interface CodexMenuProps {
  onClose: () => void;
}

export function CodexMenu({ onClose }: CodexMenuProps) {
  const codex = useGameStore((s) => s.codex);
  const [filter, setFilter] = useState<'all' | 'unlocked' | 'locked'>('all');

  const entries = Object.values(codex);

  const filtered = entries.filter((e) => {
    if (filter === 'unlocked') return e.unlocked;
    if (filter === 'locked') return !e.unlocked;
    return true;
  });

  const unlockedCount = entries.filter((e) => e.unlocked).length;
  const totalCount = entries.length;
  const progress = Math.round((unlockedCount / totalCount) * 100);

  const verseMap = new Map(VERSE_DATABASE.map((v) => [v.id, v]));

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        background: 'var(--bg-main)',
        zIndex: 20,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div
        style={{
          padding: '16px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <BookOpen size={18} color="var(--accent-gold)" strokeWidth={1.5} />
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, color: 'var(--accent-gold)', letterSpacing: 2 }}>
              GRIMOIRE
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
              {unlockedCount}/{totalCount} versets
            </div>
          </div>
        </div>
        <button
          onClick={onClose}
          style={{
            padding: '6px 12px',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 8,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            color: 'var(--text-muted)',
          }}
        >
          <XIcon size={14} strokeWidth={2} />
        </button>
      </div>

      <div style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ flex: 1, height: 4, background: 'rgba(255,255,255,0.08)', borderRadius: 2, overflow: 'hidden' }}>
          <div
            style={{
              width: `${progress}%`,
              height: '100%',
              background: progress === 100 ? 'var(--success)' : 'var(--accent-violet)',
              borderRadius: 2,
              transition: 'width 0.5s ease',
            }}
          />
        </div>
        <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--accent-violet-light)' }}>
          {progress}%
        </span>
      </div>

      <div style={{ display: 'flex', gap: 8, padding: '4px 16px 8px' }}>
        {(['all', 'unlocked', 'locked'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              padding: '4px 14px',
              border: 'none',
              borderRadius: 16,
              fontSize: 11,
              fontWeight: 500,
              cursor: 'pointer',
              fontFamily: 'var(--font-body)',
              background: filter === f ? 'var(--accent-violet)' : 'var(--bg-card)',
              color: filter === f ? 'white' : 'var(--text-muted)',
            }}
          >
            {f === 'all' ? 'Tous' : f === 'unlocked' ? 'Débloqués' : 'Verrouillés'}
          </button>
        ))}
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '0 16px 16px' }}>
        {filtered.sort((a, b) => (a.unlocked === b.unlocked ? 0 : a.unlocked ? -1 : 1)).map((entry) => {
          const verse = verseMap.get(entry.verseId);
          if (!verse) return null;

          return (
            <div
              key={entry.verseId}
              style={{
                padding: '10px 14px',
                marginBottom: 6,
                borderRadius: 10,
                background: entry.unlocked ? 'var(--bg-card)' : 'rgba(255,255,255,0.02)',
                opacity: entry.unlocked ? 1 : 0.35,
                border: '1px solid',
                borderColor: entry.unlocked ? 'var(--border-subtle)' : 'transparent',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {entry.unlocked ? (
                    <Unlock size={12} color="var(--accent-gold)" strokeWidth={2} />
                  ) : (
                    <Lock size={12} color="var(--text-muted)" strokeWidth={2} />
                  )}
                  <span
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontWeight: 600,
                      fontSize: 12,
                      letterSpacing: 1,
                      color: entry.unlocked ? 'var(--accent-gold)' : 'var(--text-muted)',
                    }}
                  >
                    {entry.unlocked ? verse.reference : '???'}
                  </span>
                </div>
                {entry.unlocked && (
                  <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>
                    {entry.errorCount > 0 ? (
                      <span style={{ color: 'var(--warning)' }}>
                        <AlertTriangle size={10} strokeWidth={2} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 2 }} />
                        {entry.errorCount}
                      </span>
                    ) : (
                      <Check size={10} strokeWidth={2} style={{ display: 'inline', verticalAlign: 'middle', color: 'var(--success)' }} />
                    )}
                  </span>
                )}
              </div>
              {entry.unlocked && (
                <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 4, lineHeight: 1.5, paddingLeft: 20 }}>
                  "{verse.text.slice(0, 80)}{verse.text.length > 80 ? '...' : ''}"
                </div>
              )}
              {!entry.unlocked && (
                <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 4, paddingLeft: 20, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Bookmark size={10} strokeWidth={1.5} />
                  Surmonter une épreuve
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
