import { useState } from 'react';
import { LEXICON_EJP_ICC, type LexiconEntry } from '../data/lexicon-ejp-icc';
import { XIcon, BookOpen, ScrollText } from './IconSystem';

interface LexiconMenuProps {
  onClose: () => void;
}

const CATEGORIES = [
  { key: 'all', label: 'Tous' },
  { key: 'doctrine', label: 'Doctrine' },
  { key: 'pratique', label: 'Pratique' },
  { key: 'sociolecte', label: 'Sociolecte' },
] as const;

const CATEGORY_COLORS: Record<string, string> = {
  doctrine: '#a78bfa',
  pratique: '#34d399',
  sociolecte: '#fbbf24',
  personnage: '#f87171',
};

const CATEGORY_BG: Record<string, string> = {
  doctrine: 'rgba(167,139,250,0.12)',
  pratique: 'rgba(52,211,153,0.12)',
  sociolecte: 'rgba(251,191,36,0.12)',
  personnage: 'rgba(248,113,113,0.12)',
};

function EntryCard({ entry, expanded, onClick }: { entry: LexiconEntry; expanded: boolean; onClick: () => void }) {
  const color = CATEGORY_COLORS[entry.category] || '#a78bfa';
  const bg = CATEGORY_BG[entry.category] || 'rgba(167,139,250,0.12)';

  return (
    <div
      onClick={onClick}
      style={{
        padding: '10px 12px',
        marginBottom: 7,
        borderRadius: 6,
        background: expanded ? 'rgba(255,255,255,0.65)' : 'rgba(255,255,255,0.45)',
        border: `1px solid ${expanded ? color + '66' : 'rgba(139,58,38,0.18)'}`,
        cursor: 'pointer',
        transition: 'all 0.2s',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: color, flexShrink: 0 }} />
          <span
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 13,
              fontWeight: 700,
              letterSpacing: 1,
              color: '#3a1f10',
            }}
          >
            {entry.term}
          </span>
          {entry.phonetic && (
            <span style={{ fontSize: 10, color: '#8b5a38', fontStyle: 'italic' }}>
              [{entry.phonetic}]
            </span>
          )}
        </div>
        <span
          style={{
            fontSize: 9,
            padding: '2px 7px',
            borderRadius: 10,
            background: color + '33',
            color: color,
            fontWeight: 600,
            letterSpacing: 0.5,
            textTransform: 'uppercase',
            filter: 'saturate(0.8) brightness(0.7)',
          }}
        >
          {entry.category}
        </span>
      </div>

      {expanded && (
        <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div>
            <div style={{ fontSize: 9, color: '#6b2020', fontWeight: 700, marginBottom: 3, textTransform: 'uppercase', letterSpacing: 0.8 }}>
              Sens
            </div>
            <div style={{ fontSize: 12, color: '#3a1f10', lineHeight: 1.65 }}>
              {entry.meaning}
            </div>
          </div>

          <div
            style={{
              padding: '8px 10px',
              borderRadius: 6,
              background: 'rgba(160,40,20,0.07)',
              borderLeft: '3px solid rgba(160,40,20,0.35)',
            }}
          >
            <div style={{ fontSize: 9, color: '#8b2010', fontWeight: 700, marginBottom: 3, letterSpacing: 0.5 }}>
              ERREUR FRÉQUENTE
            </div>
            <div style={{ fontSize: 11, color: '#5a3020', lineHeight: 1.55 }}>
              {entry.commonMisinterpretation}
            </div>
          </div>

          {entry.verseReference && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <BookOpen size={10} color="#6b2020" strokeWidth={1.5} />
              <span style={{ fontSize: 11, color: '#6b2020', fontWeight: 700 }}>
                {entry.verseReference}
              </span>
            </div>
          )}

          <div
            style={{
              padding: '6px 10px',
              borderRadius: 6,
              background: 'rgba(80,40,10,0.06)',
              borderLeft: '3px solid rgba(80,40,10,0.25)',
            }}
          >
            <div style={{ fontSize: 9, color: '#8b5a10', fontWeight: 700, marginBottom: 3, letterSpacing: 0.5 }}>
              DANS LE JEU
            </div>
            <div style={{ fontSize: 11, color: '#5a3820', lineHeight: 1.55 }}>
              {entry.usageInGame}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function LexiconMenu({ onClose }: LexiconMenuProps) {
  const [filter, setFilter] = useState<'all' | 'doctrine' | 'pratique' | 'sociolecte'>('all');
  const [expandedTerm, setExpandedTerm] = useState<string | null>(null);

  const filtered = filter === 'all'
    ? LEXICON_EJP_ICC
    : LEXICON_EJP_ICC.filter((e) => e.category === filter);

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
      {/* Header */}
      <div
        style={{
          padding: '16px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexShrink: 0,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <ScrollText size={18} color="var(--accent-violet-light)" strokeWidth={1.5} />
          <div>
            <div
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 16,
                fontWeight: 700,
                color: 'var(--accent-violet-light)',
                letterSpacing: 2,
              }}
            >
              LEXIQUE EJP / ICC
            </div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 1 }}>
              {LEXICON_EJP_ICC.length} termes · Cliquer pour détails
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

      {/* Filters */}
      <div style={{ display: 'flex', gap: 6, padding: '10px 16px 6px', flexShrink: 0 }}>
        {CATEGORIES.map((cat) => (
          <button
            key={cat.key}
            onClick={() => setFilter(cat.key as typeof filter)}
            style={{
              padding: '4px 12px',
              border: 'none',
              borderRadius: 14,
              fontSize: 11,
              fontWeight: 500,
              cursor: 'pointer',
              fontFamily: 'var(--font-body)',
              background: filter === cat.key
                ? (cat.key === 'all' ? 'var(--accent-violet)' : CATEGORY_COLORS[cat.key] || 'var(--accent-violet)')
                : 'var(--bg-card)',
              color: filter === cat.key ? 'white' : 'var(--text-muted)',
              transition: 'all 0.15s',
            }}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Entries — page droite du livre */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          backgroundImage: 'url(/ui/travelbook/UI_TravelBook_BookPageRight01a.png)',
          backgroundSize: 'cover',
          backgroundColor: '#f5d4a0',
          imageRendering: 'pixelated',
          padding: '8px 16px 16px',
        }}
      >
        <div style={{ height: 6, background: 'linear-gradient(to bottom, rgba(100,50,20,0.15), transparent)', marginBottom: 6, borderRadius: 2 }} />
        {filtered.map((entry) => (
          <EntryCard
            key={entry.term}
            entry={entry}
            expanded={expandedTerm === entry.term}
            onClick={() => setExpandedTerm(expandedTerm === entry.term ? null : entry.term)}
          />
        ))}
        <div style={{ height: 8, background: 'linear-gradient(to top, rgba(100,50,20,0.1), transparent)', borderRadius: 2, marginTop: 4 }} />
      </div>
    </div>
  );
}
