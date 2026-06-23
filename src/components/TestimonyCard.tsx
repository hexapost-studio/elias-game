/**
 * TestimonyCard.tsx — Écran de témoignage de fin de vie (Design V2).
 *
 * Affiché AVANT l'écran game-over existant. Génère un "témoignage d'église"
 * partageable en un tap — format WhatsApp/réseaux EJP/ICC.
 */
import { useState, useEffect, type FC } from 'react';
import type { Testimony } from '../engine/testimonyGenerator';

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
  testimony: Testimony;
  onContinue: () => void;
}

export const TestimonyCard: FC<Props> = ({ testimony, onContinue }) => {
  const [copied, setCopied] = useState(false);

  // Auto-copie au montage — le joueur peut partager immédiatement
  useEffect(() => {
    const t = setTimeout(() => {
      void copyToClipboard(testimony.fullText).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      });
    }, 600);
    return () => clearTimeout(t);
  }, [testimony.fullText]);

  const handleShare = async () => {
    if ('share' in navigator) {
      try {
        await navigator.share({ text: testimony.fullText });
        return;
      } catch { /* annulé */ }
    }
    await copyToClipboard(testimony.fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleCopy = async () => {
    await copyToClipboard(testimony.fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 600,
      background: 'rgba(5,2,12,0.96)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '16px',
      overflowY: 'auto',
    }}>
      <div style={{
        background: 'linear-gradient(170deg, #1e140a 0%, #0c0807 100%)',
        border: '1px solid rgba(245,158,11,0.4)',
        borderRadius: 18,
        padding: '24px 20px 20px',
        maxWidth: 340, width: '100%',
        boxShadow: '0 0 60px rgba(245,158,11,0.10)',
      }}>

        {/* En-tête */}
        <div style={{
          textAlign: 'center',
          marginBottom: 20,
        }}>
          <div style={{
            fontFamily: 'var(--font-display)',
            fontSize: 10,
            letterSpacing: 3,
            color: 'var(--accent-gold)',
            marginBottom: 8,
          }}>
            TÉMOIGNAGE
          </div>
          <div style={{
            fontSize: 16,
            fontWeight: 700,
            color: 'var(--text-primary)',
            fontFamily: 'var(--font-display)',
            lineHeight: 1.3,
          }}>
            {testimony.identity}
          </div>
        </div>

        {/* Séparateur doré */}
        <div style={{
          height: 1,
          background: 'linear-gradient(90deg, transparent, rgba(245,158,11,0.4), transparent)',
          marginBottom: 16,
        }} />

        {/* Phrase d'ouverture */}
        <p style={{
          fontSize: 13,
          color: 'var(--text-secondary)',
          lineHeight: 1.65,
          fontStyle: 'italic',
          marginBottom: 16,
          textAlign: 'center',
        }}>
          {testimony.opening}
        </p>

        {/* Moments clés */}
        {[testimony.foundingTrial, testimony.lifeTurning, testimony.lastVictory]
          .filter(Boolean)
          .map((moment, i) => (
            <div key={i} style={{
              display: 'flex',
              gap: 10,
              marginBottom: 10,
              paddingLeft: 4,
            }}>
              <span style={{
                color: 'rgba(245,158,11,0.6)',
                fontSize: 14,
                flexShrink: 0,
                marginTop: 1,
              }}>◆</span>
              <p style={{
                fontSize: 12,
                color: 'var(--text-muted)',
                lineHeight: 1.6,
                margin: 0,
              }}>
                {moment}
              </p>
            </div>
          ))
        }

        {/* Stats */}
        <div style={{
          background: 'rgba(245,158,11,0.06)',
          border: '1px solid rgba(245,158,11,0.15)',
          borderRadius: 10,
          padding: '10px 14px',
          fontSize: 11,
          color: 'var(--text-muted)',
          marginTop: 14,
          marginBottom: 14,
          textAlign: 'center',
          lineHeight: 1.7,
        }}>
          {testimony.stats}
        </div>

        {/* Citation biblique */}
        <p style={{
          fontSize: 11,
          color: 'rgba(245,158,11,0.7)',
          fontStyle: 'italic',
          textAlign: 'center',
          lineHeight: 1.6,
          marginBottom: 20,
          padding: '0 4px',
        }}>
          {testimony.bibleQuote}
        </p>

        {/* Boutons */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
          <button
            onClick={handleCopy}
            style={{
              flex: 1, padding: '12px 0',
              background: copied ? 'rgba(74,222,128,0.12)' : 'rgba(245,158,11,0.10)',
              border: `1px solid ${copied ? 'rgba(74,222,128,0.35)' : 'rgba(245,158,11,0.28)'}`,
              borderRadius: 10, cursor: 'pointer',
              fontFamily: 'var(--font-display)', fontSize: 10,
              fontWeight: 700, letterSpacing: 1,
              color: copied ? '#4ade80' : 'var(--accent-gold)',
              transition: 'all 0.25s ease',
            }}
          >
            {copied ? '✓ COPIÉ' : 'COPIER'}
          </button>
          {'share' in navigator && (
            <button
              onClick={handleShare}
              style={{
                flex: 1, padding: '12px 0',
                background: 'rgba(124,58,237,0.10)',
                border: '1px solid rgba(124,58,237,0.30)',
                borderRadius: 10, cursor: 'pointer',
                fontFamily: 'var(--font-display)', fontSize: 10,
                fontWeight: 700, letterSpacing: 1,
                color: '#a78bfa',
              }}
            >
              PARTAGER
            </button>
          )}
        </div>

        <button
          onClick={onContinue}
          style={{
            width: '100%', padding: '14px 0',
            background: 'rgba(245,158,11,0.12)',
            border: '1px solid rgba(245,158,11,0.3)',
            borderRadius: 12, cursor: 'pointer',
            fontFamily: 'var(--font-display)', fontSize: 11,
            fontWeight: 700, letterSpacing: 1.5,
            color: 'var(--accent-gold)',
          }}
        >
          VOIR LE BILAN DE VIE →
        </button>
      </div>
    </div>
  );
};
