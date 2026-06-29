import { useState } from 'react';
import { useGameStore } from '../stores/gameStore';
import { VERSE_DATABASE } from '../data/verses';
import { BookOpen, Lock, AlertTriangle, XIcon, Check, Bookmark, Sparkles } from './IconSystem';
import type { AfflictionCategory } from '../types/game';
import { reviewPromptsFor } from '../engine/reviewPrompts';
import { color, font, fontSize, weight, radius } from '../styles/tokens';

interface CodexMenuProps {
  onClose: () => void;
}

const BOOK_BG    = '#f5d4a0';
const BOOK_TEXT  = '#3a1f10';
const BOOK_MUTED = '#8b5a38';
const BOOK_ACCENT = '#6b2020';

const CAT_LABELS: Partial<Record<AfflictionCategory, string>> = {
  peur_angoisse:        'Peur & Angoisse',
  impudicite_addiction: 'Impudicité',
  finances_paresse:     'Finances',
  amertume_rejet:       'Amertume',
  combat_spirituel:     'Combat',
  identite_appel:       'Identité',
  doute_incredulite:    'Doute',
  orgueil_independance: 'Orgueil',
};

const CAT_COLORS: Partial<Record<AfflictionCategory, string>> = {
  peur_angoisse:        '#8b5cf6',
  impudicite_addiction: '#ef4444',
  finances_paresse:     '#f59e0b',
  amertume_rejet:       '#6b7280',
  combat_spirituel:     '#f97316',
  identite_appel:       '#a78bfa',
  doute_incredulite:    '#94a3b8',
  orgueil_independance: '#dc2626',
};

/* ─── Sous-composant Flash-card ─── */
function FlashCardMode({ onClose }: { onClose: () => void }) {
  const codex = useGameStore((s) => s.codex);
  const verseMap = new Map(VERSE_DATABASE.map((v) => [v.id, v]));
  const [revealed, setRevealed] = useState(false);
  const [index, setIndex] = useState(0);

  const cards = Object.values(codex)
    .filter((e) => e.unlocked)
    .map((e) => verseMap.get(e.verseId))
    .filter(Boolean) as typeof VERSE_DATABASE;

  if (cards.length === 0) {
    return (
      <div className="codex-empty-state">
        <BookOpen size={32} strokeWidth={1} style={{ opacity: 0.4 }} />
        <div className="codex-empty-text">
          Aucun verset débloqué encore.<br />Surmonte des épreuves pour remplir ton Codex.
        </div>
        <button onClick={onClose} className="btn-primary" style={{ padding: '10px 28px', fontSize: fontSize.md, letterSpacing: 1.5 }}>
          RETOUR
        </button>
      </div>
    );
  }

  const card = cards[index % cards.length];
  const total = cards.length;
  const prompts = reviewPromptsFor(card.id, card.category as AfflictionCategory);

  const next = () => { setRevealed(false); setTimeout(() => setIndex((i) => (i + 1) % total), 120); };
  const prev = () => { setRevealed(false); setTimeout(() => setIndex((i) => (i - 1 + total) % total), 120); };

  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 30, background: 'rgba(10,5,20,0.97)', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ padding: '14px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-subtle)', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Sparkles size={16} color="var(--accent-gold)" strokeWidth={1.5} />
          <span style={{ fontFamily: font.display, fontSize: 13, color: color.accentGold, letterSpacing: 2 }}>
            RÉVISION
          </span>
        </div>
        <span style={{ fontSize: 11, color: color.textMuted }}>{index + 1} / {total}</span>
        <button onClick={onClose} style={{ padding: '6px 10px', background: color.bgCard, border: '1px solid var(--border-subtle)', borderRadius: radius.md, cursor: 'pointer', color: color.textMuted, display: 'flex' }}>
          <XIcon size={13} strokeWidth={2} />
        </button>
      </div>

      {/* Barre de progression */}
      <div style={{ height: 3, background: 'rgba(255,255,255,0.06)', flexShrink: 0 }}>
        <div style={{ height: '100%', background: color.accentViolet, width: `${((index + 1) / total) * 100}%`, transition: 'width 0.3s ease' }} />
      </div>

      {/* Carte */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px 20px', gap: 0 }}>
        <div
          onClick={() => setRevealed((r) => !r)}
          style={{
            width: '100%',
            cursor: 'pointer',
            borderRadius: 14,
            overflow: 'hidden',
            boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
            transition: 'transform 0.2s ease',
          }}
        >
          {/* Recto — référence toujours visible */}
          <div style={{
            background: BOOK_BG,
            backgroundImage: 'url(/ui/travelbook/UI_TravelBook_BookPageLeft01a.png)',
            backgroundSize: 'cover',
            imageRendering: 'pixelated',
            padding: '24px 20px 20px',
          }}>
            <div style={{ fontSize: fontSize.xs, color: BOOK_MUTED, fontWeight: weight.bold, letterSpacing: 1, marginBottom: 10, textTransform: 'uppercase' }}>
              {CAT_LABELS[card.category as AfflictionCategory] ?? card.category}
            </div>
            <div style={{ fontFamily: font.display, fontSize: 20, fontWeight: weight.bold, color: BOOK_ACCENT, letterSpacing: 1, textAlign: 'center', marginBottom: 20 }}>
              {card.reference}
            </div>

            {/* Texte caché ou révélé */}
            {revealed ? (
              <div style={{ animation: 'fadeIn 0.3s ease' }}>
                <div style={{ fontSize: 13, color: BOOK_TEXT, lineHeight: 1.8, fontStyle: 'italic', textAlign: 'center' }}>
                  « {card.text} »
                </div>
                <div style={{ marginTop: 14, fontSize: fontSize.sm, color: BOOK_MUTED, textAlign: 'center', letterSpacing: 0.3 }}>
                  ✦ {prompts.encouragement}
                </div>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '12px 0' }}>
                <div style={{
                  display: 'inline-block',
                  padding: '8px 20px',
                  background: 'rgba(139,58,38,0.12)',
                  borderRadius: 20,
                  border: '1px dashed rgba(139,58,38,0.3)',
                  fontSize: 11,
                  color: BOOK_MUTED,
                  letterSpacing: 0.5,
                }}>
                  {prompts.revealPrompt}
                </div>
              </div>
            )}
          </div>

          {/* Pied de carte */}
          <div style={{ background: '#e8c088', padding: '8px 20px', display: 'flex', justifyContent: 'center' }}>
            <div style={{ width: 40, height: 3, background: 'rgba(139,58,38,0.25)', borderRadius: 2 }} />
          </div>
        </div>

        {/* Hint */}
        {!revealed && (
          <div style={{ marginTop: 16, fontSize: 11, color: color.textSecondary }}>
            {prompts.reciteHint}
          </div>
        )}
      </div>

      {/* Navigation */}
      <div style={{ padding: '16px 20px 32px', display: 'flex', gap: 12, flexShrink: 0 }}>
        <button onClick={prev} style={{ flex: 1, padding: '12px', background: color.bgCard, border: '1px solid var(--border-subtle)', borderRadius: radius.lg, color: color.textMuted, fontFamily: font.display, fontSize: fontSize.md, letterSpacing: 1, cursor: 'pointer' }}>
          ← PRÉCÉDENT
        </button>
        <button onClick={next} style={{ flex: 1, padding: '12px', background: color.accentViolet, border: 'none', borderRadius: radius.lg, color: 'white', fontFamily: font.display, fontSize: fontSize.md, letterSpacing: 1, cursor: 'pointer' }}>
          SUIVANT →
        </button>
      </div>
    </div>
  );
}

/* ─── Composant principal ─── */
export function CodexMenu({ onClose }: CodexMenuProps) {
  const codex = useGameStore((s) => s.codex);
  const [filter, setFilter] = useState<'all' | 'unlocked' | 'locked'>('all');
  const [showCategoryStats, setShowCategoryStats] = useState(false);
  const [showFlashCards, setShowFlashCards] = useState(false);

  const entries = Object.values(codex);
  const verseMap = new Map(VERSE_DATABASE.map((v) => [v.id, v]));

  const filtered = entries.filter((e) => {
    if (filter === 'unlocked') return e.unlocked;
    if (filter === 'locked') return !e.unlocked;
    return true;
  });

  const unlockedCount = entries.filter((e) => e.unlocked).length;
  const totalCount = entries.length;
  const progress = Math.round((unlockedCount / totalCount) * 100);

  // Progression par catégorie
  const catStats = Object.entries(CAT_LABELS).map(([cat, label]) => {
    const catVerses = VERSE_DATABASE.filter((v) => v.category === cat);
    const catUnlocked = catVerses.filter((v) => codex[v.id]?.unlocked).length;
    const catErrors = catVerses.reduce((acc, v) => acc + (codex[v.id]?.errorCount || 0), 0);
    return { cat: cat as AfflictionCategory, label, total: catVerses.length, unlocked: catUnlocked, errors: catErrors };
  }).sort((a, b) => (b.unlocked / (b.total || 1)) - (a.unlocked / (a.total || 1)));

  return (
    <div style={{ position: 'absolute', inset: 0, background: color.bgMain, zIndex: 20, display: 'flex', flexDirection: 'column' }}>
      {showFlashCards && <FlashCardMode onClose={() => setShowFlashCards(false)} />}

      {/* Header */}
      <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <BookOpen size={18} color="var(--accent-gold)" strokeWidth={1.5} />
          <div>
            <div style={{ fontFamily: font.display, fontSize: fontSize.lg, fontWeight: weight.bold, color: color.accentGold, letterSpacing: 2 }}>
              GRIMOIRE
            </div>
            <div style={{ fontSize: fontSize.sm, color: color.textMuted, marginTop: 1 }}>
              {unlockedCount}/{totalCount} versets · {progress}%
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          {/* Bouton révision flash */}
          {unlockedCount > 0 && (
            <button
              onClick={() => setShowFlashCards(true)}
              style={{
                padding: '6px 12px',
                background: color.accentViolet,
                border: 'none',
                borderRadius: radius.md,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 5,
                color: 'white',
                fontSize: fontSize.sm,
                fontWeight: weight.medium,
                letterSpacing: 0.5,
              }}
            >
              <Sparkles size={11} strokeWidth={1.5} />
              RÉVISER
            </button>
          )}
          <button onClick={onClose} style={{ padding: '6px 10px', background: color.bgCard, border: '1px solid var(--border-subtle)', borderRadius: radius.md, cursor: 'pointer', display: 'flex', color: color.textMuted }}>
            <XIcon size={14} strokeWidth={2} />
          </button>
        </div>
      </div>

      {/* Barre de progression globale */}
      <div style={{ padding: '8px 16px 4px', display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
        <div style={{ flex: 1, height: 4, background: 'rgba(255,255,255,0.08)', borderRadius: 2, overflow: 'hidden' }}>
          <div style={{ width: `${progress}%`, height: '100%', background: progress === 100 ? color.success : color.accentViolet, borderRadius: 2, transition: 'width 0.5s ease' }} />
        </div>
        <span style={{ fontSize: 11, fontWeight: weight.medium, color: color.accentVioletLight }}>{progress}%</span>
      </div>

      {/* Toggle catégories */}
      <div style={{ padding: '4px 16px 6px', flexShrink: 0 }}>
        <button
          onClick={() => setShowCategoryStats((s) => !s)}
          style={{
            width: '100%',
            padding: '6px 12px',
            background: showCategoryStats ? 'rgba(124,58,237,0.15)' : color.bgCard,
            border: `1px solid ${showCategoryStats ? color.accentViolet : color.borderSubtle}`,
            borderRadius: radius.md,
            cursor: 'pointer',
            color: showCategoryStats ? color.accentVioletLight : color.textMuted,
            fontSize: fontSize.sm,
            fontWeight: weight.medium,
            letterSpacing: 0.5,
            textAlign: 'left',
          }}
        >
          {showCategoryStats ? '▲' : '▼'} PROGRESSION PAR CATÉGORIE
        </button>

        {showCategoryStats && (
          <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 4 }}>
            {catStats.map(({ cat, label, total, unlocked, errors }) => {
              const pct = total > 0 ? Math.round((unlocked / total) * 100) : 0;
              const catColor = CAT_COLORS[cat];
              return (
                <div key={cat}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                    <span style={{ fontSize: fontSize.xs, fontWeight: weight.medium, color: catColor, letterSpacing: 0.5 }}>{label}</span>
                    <span style={{ fontSize: fontSize.xs, color: color.textMuted }}>
                      {unlocked}/{total}
                      {errors > 0 && <span style={{ color: color.warning, marginLeft: 6 }}>⚠ {errors} err.</span>}
                    </span>
                  </div>
                  <div style={{ height: 3, background: 'rgba(255,255,255,0.06)', borderRadius: 2, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${pct}%`, background: catColor, borderRadius: 2, transition: 'width 0.4s ease', opacity: 0.85 }} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Filtres */}
      <div style={{ display: 'flex', gap: 6, padding: '2px 16px 8px', flexShrink: 0 }}>
        {(['all', 'unlocked', 'locked'] as const).map((f) => (
          <button key={f} onClick={() => setFilter(f)} style={{ padding: '4px 14px', border: 'none', borderRadius: 14, fontSize: fontSize.sm, fontWeight: 500, cursor: 'pointer', fontFamily: font.body, background: filter === f ? color.accentViolet : color.bgCard, color: filter === f ? 'white' : color.textMuted }}>
            {f === 'all' ? 'Tous' : f === 'unlocked' ? 'Débloqués' : 'Verrouillés'}
          </button>
        ))}
      </div>

      {/* Scrollable — book page */}
      <div style={{ flex: 1, overflowY: 'auto', backgroundImage: 'url(/ui/travelbook/UI_TravelBook_BookPageLeft01a.png)', backgroundSize: 'cover', backgroundColor: BOOK_BG, imageRendering: 'pixelated', padding: '8px 16px 16px' }}>
        <div style={{ height: 6, background: 'linear-gradient(to bottom, rgba(100,50,20,0.15), transparent)', marginBottom: 4, borderRadius: 2 }} />

        {filtered.sort((a, b) => (a.unlocked === b.unlocked ? 0 : a.unlocked ? -1 : 1)).map((entry) => {
          const verse = verseMap.get(entry.verseId);
          if (!verse) return null;
          return (
            <div key={entry.verseId} style={{ padding: '9px 12px', marginBottom: 6, borderRadius: radius.sm, background: entry.unlocked ? 'rgba(255,255,255,0.55)' : 'rgba(180,120,80,0.08)', opacity: entry.unlocked ? 1 : 0.62, border: '1px solid', borderColor: entry.unlocked ? 'rgba(139,58,38,0.2)' : 'rgba(139,58,38,0.08)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {entry.unlocked
                    ? <img src="/ui/travelbook/UI_TravelBook_IconStar01a.png" alt="" style={{ width: 12, height: 12, imageRendering: 'pixelated', filter: 'brightness(0.7) sepia(0.5)' }} />
                    : <Lock size={10} color={BOOK_MUTED} strokeWidth={2} />
                  }
                  <span style={{ fontFamily: font.display, fontWeight: weight.bold, fontSize: fontSize.md, letterSpacing: 1, color: entry.unlocked ? BOOK_ACCENT : BOOK_MUTED }}>
                    {entry.unlocked ? verse.reference : '???'}
                  </span>
                </div>
                {entry.unlocked && (
                  <span style={{ fontSize: 10 }}>
                    {entry.errorCount > 0
                      ? <span style={{ color: '#c04010', display: 'flex', alignItems: 'center', gap: 2 }}><AlertTriangle size={10} strokeWidth={2} />{entry.errorCount}</span>
                      : <Check size={10} strokeWidth={2} color="#2a7a40" />
                    }
                  </span>
                )}
              </div>
              {entry.unlocked && (
                <div style={{ fontSize: 11, color: BOOK_TEXT, marginTop: 5, lineHeight: 1.6, paddingLeft: 20, fontStyle: 'italic' }}>
                  "{verse.text.slice(0, 80)}{verse.text.length > 80 ? '...' : ''}"
                </div>
              )}
              {!entry.unlocked && (
                <div style={{ fontSize: fontSize.sm, color: BOOK_MUTED, marginTop: 4, paddingLeft: 20, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Bookmark size={10} strokeWidth={1.5} />
                  Surmonter une épreuve
                </div>
              )}
            </div>
          );
        })}

        <div style={{ height: 8, background: 'linear-gradient(to top, rgba(100,50,20,0.1), transparent)', borderRadius: 2, marginTop: 4 }} />
      </div>
    </div>
  );
}
