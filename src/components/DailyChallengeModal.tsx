/**
 * DailyChallengeModal.tsx — Épreuve du jour (Design V2).
 *
 * Modal autonome : sélectionne l'event du jour, présente la situation,
 * laisse choisir un verset parmi 4, révèle la réponse, propose le partage.
 * Aucun impact sur les stats de la partie en cours (mode entraînement pur).
 */
import { useState, type FC } from 'react';
import { getDailyChallengeEvent, todayLabel, buildChallengeShareText } from '../engine/dailyChallenge';
import { pickDecoys } from '../data/events';
import { getVerseById, VERSE_DATABASE } from '../data/verses';
import { shuffledChoiceIds } from '../engine/choiceOrder';
import { XIcon } from './IconSystem';
import type { AfflictionEvent } from '../types/game';

// Charge les events une seule fois (module-level, hors rendu)
let _cachedEvents: AfflictionEvent[] | null = null;
function getEvents(): AfflictionEvent[] {
  if (!_cachedEvents) {
    // Import dynamique synchrone — les events sont déjà chargés dans le bundle
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    _cachedEvents = (require('../../game/data/events.json') as AfflictionEvent[]);
  }
  return _cachedEvents ?? [];
}

async function copyToClipboard(text: string): Promise<void> {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.cssText = 'position:fixed;opacity:0;';
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
  }
}

interface Props {
  playerName: string;
  onClose: () => void;
}

export const DailyChallengeModal: FC<Props> = ({ playerName, onClose }) => {
  const [answered, setAnswered] = useState<'correct' | 'wrong' | null>(null);
  const [chosenVerseId, setChosenVerseId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const today = todayLabel();
  const event = getDailyChallengeEvent(getEvents());

  if (!event) {
    return (
      <div style={overlayStyle} onClick={onClose}>
        <div style={cardStyle} onClick={(e) => e.stopPropagation()}>
          <p style={{ color: 'var(--text-muted)', textAlign: 'center' }}>
            Aucune épreuve disponible aujourd'hui.
          </p>
          <button onClick={onClose} style={closeBtnStyle}>Fermer</button>
        </div>
      </div>
    );
  }

  const correctVerse = getVerseById(event.correctVerseId);
  const decoyIds = pickDecoys(event.correctVerseId, event.category, 3, []);
  const allIds = shuffledChoiceIds(event.id + today, event.correctVerseId, decoyIds);

  const handleChoice = (verseId: string) => {
    if (answered !== null) return;
    setChosenVerseId(verseId);
    setAnswered(verseId === event.correctVerseId ? 'correct' : 'wrong');
  };

  const shareText = answered !== null && correctVerse
    ? buildChallengeShareText(playerName, answered === 'correct', correctVerse.reference, today)
    : '';

  const handleShare = async () => {
    if ('share' in navigator) {
      try { await navigator.share({ text: shareText }); return; } catch { /* annulé */ }
    }
    await copyToClipboard(shareText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={cardStyle} onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 9, letterSpacing: 3, color: 'var(--accent-gold)' }}>
              ÉPREUVE DU JOUR
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{today}</div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex' }}>
            <XIcon size={14} strokeWidth={2} />
          </button>
        </div>

        {/* Situation */}
        <div style={{
          background: 'rgba(245,158,11,0.06)',
          border: '1px solid rgba(245,158,11,0.15)',
          borderRadius: 10,
          padding: '12px 14px',
          fontSize: 13,
          color: 'var(--text-secondary)',
          lineHeight: 1.65,
          marginBottom: 16,
        }}>
          <div style={{ fontSize: 11, color: 'var(--accent-gold)', fontFamily: 'var(--font-display)', letterSpacing: 1, marginBottom: 6 }}>
            {event.title}
          </div>
          {event.description.replace(/\{ami\}/g, 'ton ami').replace(/\{conjoint\}/g, 'ton conjoint').replace(/\{église\}/g, "l'église").replace(/\{ville\}/g, 'ta ville')}
        </div>

        {/* Verse choices */}
        {!answered && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', textAlign: 'center', marginBottom: 4 }}>
              Quel verset répond à cette situation ?
            </div>
            {allIds.map((verseId) => {
              const v = getVerseById(verseId);
              if (!v) return null;
              return (
                <button
                  key={verseId}
                  onClick={() => handleChoice(verseId)}
                  style={{
                    padding: '10px 14px', minHeight: 44,
                    borderRadius: 10,
                    border: '1.5px solid rgba(245,158,11,0.22)',
                    background: 'var(--bg-card)',
                    color: 'var(--text-secondary)',
                    fontFamily: 'var(--font-body)',
                    fontSize: 12, fontStyle: 'italic',
                    textAlign: 'left', cursor: 'pointer',
                    lineHeight: 1.5,
                  }}
                >
                  {v.reference} — « {v.text.slice(0, 55)}{v.text.length > 55 ? '…' : ''} »
                </button>
              );
            })}
          </div>
        )}

        {/* Result */}
        {answered !== null && correctVerse && (
          <div style={{ textAlign: 'center' }}>
            <div style={{
              fontSize: 28, marginBottom: 8,
              color: answered === 'correct' ? '#4ade80' : '#f87171',
            }}>
              {answered === 'correct' ? '✓' : '✗'}
            </div>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
              {answered === 'correct' ? 'Bien répondu !' : 'Pas tout à fait…'}
            </div>
            {answered === 'wrong' && chosenVerseId && (() => {
              const chosen = getVerseById(chosenVerseId);
              return chosen ? (
                <div style={{ fontSize: 11, color: '#f87171', marginBottom: 8 }}>
                  Tu as choisi : {chosen.reference}
                </div>
              ) : null;
            })()}
            <div style={{
              background: 'rgba(74,222,128,0.08)',
              border: '1px solid rgba(74,222,128,0.2)',
              borderRadius: 10,
              padding: '12px 14px',
              fontSize: 13, fontStyle: 'italic',
              color: 'var(--text-secondary)',
              lineHeight: 1.65,
              marginBottom: 16,
              textAlign: 'left',
            }}>
              <div style={{ fontSize: 11, color: '#4ade80', fontFamily: 'var(--font-display)', letterSpacing: 1, marginBottom: 4 }}>
                {correctVerse.reference}
              </div>
              « {correctVerse.text} »
            </div>

            <div style={{ display: 'flex', gap: 8 }}>
              {'share' in navigator ? (
                <button onClick={handleShare} style={shareBtnStyle('#7c3aed', 'rgba(124,58,237,0.10)', 'rgba(124,58,237,0.3)', '#a78bfa')}>
                  PARTAGER
                </button>
              ) : (
                <button onClick={handleShare} style={shareBtnStyle('#f59e0b', 'rgba(245,158,11,0.10)', 'rgba(245,158,11,0.28)', 'var(--accent-gold)')}>
                  {copied ? '✓ COPIÉ' : 'COPIER'}
                </button>
              )}
              <button onClick={onClose} style={shareBtnStyle('#6b7280', 'transparent', 'rgba(107,114,128,0.3)', '#9ca3af')}>
                FERMER
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ── Styles partagés ──────────────────────────────────────────────────────────

const overlayStyle: React.CSSProperties = {
  position: 'fixed', inset: 0, zIndex: 800,
  background: 'rgba(5,2,12,0.92)',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  padding: 16, overflowY: 'auto',
};

const cardStyle: React.CSSProperties = {
  background: 'linear-gradient(170deg, #1e140a 0%, #0c0807 100%)',
  border: '1px solid rgba(245,158,11,0.35)',
  borderRadius: 16, padding: '20px 18px',
  maxWidth: 340, width: '100%',
  boxShadow: '0 0 40px rgba(245,158,11,0.10)',
};

const closeBtnStyle: React.CSSProperties = {
  marginTop: 12, width: '100%', padding: '10px 0',
  background: 'transparent', border: '1px solid rgba(107,114,128,0.3)',
  borderRadius: 10, cursor: 'pointer',
  color: '#9ca3af', fontFamily: 'var(--font-display)', fontSize: 10,
};

function shareBtnStyle(
  _color: string, bg: string, border: string, textColor: string,
): React.CSSProperties {
  return {
    flex: 1, padding: '11px 0',
    background: bg, border: `1px solid ${border}`,
    borderRadius: 10, cursor: 'pointer',
    fontFamily: 'var(--font-display)', fontSize: 10,
    fontWeight: 700, letterSpacing: 1,
    color: textColor,
  };
}
