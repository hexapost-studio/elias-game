import type { FC } from 'react';
import { useState, useEffect, useRef } from 'react';
import { XIcon } from './IconSystem';

const BIBLE_QUOTES = [
  '"Car je connais les projets que j\'ai formés pour vous, dit l\'Éternel, projets de paix et non de malheur, afin de vous donner un avenir et de l\'espérance." — Jérémie 29:11',
  '"Je puis tout par celui qui me fortifie." — Philippiens 4:13',
  '"L\'Éternel est mon berger: je ne manquerai de rien." — Psaume 23:1',
  '"Ne crains rien, car je suis avec toi; ne promène pas des regards inquiets, car je suis ton Dieu." — Ésaïe 41:10',
  '"Tout est possible à celui qui croit." — Marc 9:23',
  '"Dieu est notre refuge et notre force, un secours qui ne manque jamais dans la détresse." — Psaume 46:2',
  '"Heureux ceux qui pleurent, car ils seront consolés." — Matthieu 5:4',
  '"La foi est une ferme assurance des choses qu\'on espère, une démonstration de celles qu\'on ne voit pas." — Hébreux 11:1',
  '"Que votre lumière luise ainsi devant les hommes, afin qu\'ils voient vos bonnes œuvres, et qu\'ils glorifient votre Père qui est dans les cieux." — Matthieu 5:16',
  '"L\'amour de Dieu est répandu dans nos cœurs par le Saint-Esprit qui nous a été donné." — Romains 5:5',
  '"Cherchez premièrement le royaume et la justice de Dieu; et toutes ces choses vous seront données par-dessus." — Matthieu 6:33',
  '"Sois fort et courageux, ne t\'effraie point et ne t\'épouvante point, car l\'Éternel, ton Dieu, est avec toi dans tout ce que tu entreprendras." — Josué 1:9',
];

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
  const quoteRef = useRef(BIBLE_QUOTES[Math.floor(Math.random() * BIBLE_QUOTES.length)]);

  const parts = [
    `✦ La vie d'Élias ✦`,
    `Âge : ${age} ans${isVictory ? ' · VICTOIRE' : ''}`,
  ];
  if (titleName) parts.push(`Titre : ${titleName}`);
  parts.push(`Réussite : ${successRate}% · Combo max : ×${maxCombo}`);
  if (completedArcsCount > 0) parts.push(`Arcs complétés : ${completedArcsCount}`);
  parts.push('', `${quoteRef.current}`);
  parts.push('', `Joue Élias ➜ https://la-vie-d-elias.jouons.cc`);
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

  // Auto-copie au montage
  useEffect(() => {
    const timer = setTimeout(() => { handleCopy(); }, 300);
    return () => clearTimeout(timer);
  }, []);

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
