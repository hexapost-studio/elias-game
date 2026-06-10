import type { FC } from 'react';
import { useState } from 'react';
import { XIcon } from './IconSystem';

interface ShareCardProps {
  age: number;
  successRate: number;
  maxCombo: number;
  titleName: string | null;
  isVictory: boolean;
  completedArcsCount: number;
  onClose: () => void;
}

export const ShareCard: FC<ShareCardProps> = ({
  age, successRate, maxCombo, titleName, isVictory, completedArcsCount, onClose,
}) => {
  const [copied, setCopied] = useState(false);

  const parts = [
    `✦ La vie d'Élias ✦`,
    `Âge : ${age} ans${isVictory ? ' · VICTOIRE 🏆' : ''}`,
  ];
  if (titleName) parts.push(`Titre : ${titleName}`);
  parts.push(`Réussite : ${successRate}% · Combo max : ×${maxCombo}`);
  if (completedArcsCount > 0) parts.push(`Arcs complétés : ${completedArcsCount}`);
  parts.push('', `Joue Élias ➜ ${window.location.origin}`);
  const shareText = parts.join('\n');

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareText);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = shareText;
      ta.style.cssText = 'position:fixed;opacity:0;';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  const handleShare = async () => {
    if ('share' in navigator) {
      try {
        await navigator.share({ text: shareText });
        return;
      } catch { /* cancelled */ }
    }
    handleCopy();
  };

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 500,
        background: 'rgba(5,2,12,0.92)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 24, animation: 'fadeIn 0.2s ease',
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{
        background: 'linear-gradient(170deg, #2a1a08 0%, #120d07 100%)',
        border: '1px solid rgba(245,158,11,0.35)',
        borderRadius: 16, padding: '24px 20px',
        maxWidth: 320, width: '100%',
        boxShadow: '0 0 40px rgba(245,158,11,0.12)',
        animation: 'fadeIn 0.25s ease',
      }}>
        <div style={{
          display: 'flex', justifyContent: 'space-between',
          alignItems: 'center', marginBottom: 16,
        }}>
          <div style={{
            fontFamily: 'var(--font-display)', fontSize: 12,
            color: 'var(--accent-gold)', letterSpacing: 2,
          }}>
            PARTAGER MA VIE
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--text-muted)', padding: 4, display: 'flex',
            }}
          >
            <XIcon size={14} strokeWidth={2} />
          </button>
        </div>

        <pre style={{
          background: 'rgba(0,0,0,0.4)',
          border: '1px solid rgba(245,158,11,0.15)',
          borderRadius: 10,
          padding: '14px 16px',
          fontSize: 12,
          color: 'var(--text-secondary)',
          lineHeight: 1.9,
          whiteSpace: 'pre-wrap',
          fontFamily: 'var(--font-body)',
          marginBottom: 16,
          userSelect: 'text',
          WebkitUserSelect: 'text',
          wordBreak: 'break-word',
        }}>
          {shareText}
        </pre>

        <div style={{ display: 'flex', gap: 10 }}>
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
                border: '1px solid rgba(124,58,237,0.3)',
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
      </div>
    </div>
  );
};
