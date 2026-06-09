/**
 * @file MainMenu.tsx
 * @description Menu principal accessible via le bouton burger pendant la partie.
 *
 * Équivalent du "Main Menu" de BitLife — adapté à Élias :
 *  - Nouvelle Partie (avec confirmation, préserve l'héritage)
 *  - Codex (versets débloqués)
 *  - Lexique (vocabulaire EJP/ICC)
 *  - Son (toggle ambiance musicale)
 *  - Titre actuel (si débloqué)
 *
 * Slide-in depuis la gauche avec overlay sombre.
 */

import type { FC } from 'react';
import { useState } from 'react';
import {
  BookOpen, ScrollText, Music, Moon, Award, Star, RefreshCw, XIcon,
} from './IconSystem';
import { setAmbientVolume, getAmbientVolume } from '../engine/juice';

interface MainMenuProps {
  onClose: () => void;
  onOpenCodex: () => void;
  onOpenLexicon: () => void;
  onNewGame: () => void;
  ambientOn: boolean;
  onToggleAmbient: () => void;
  currentTitle: string | null;
  age: number;
  successRate: number;
}

export const MainMenu: FC<MainMenuProps> = ({
  onClose,
  onOpenCodex,
  onOpenLexicon,
  onNewGame,
  ambientOn,
  onToggleAmbient,
  currentTitle,
  age,
  successRate,
}) => {
  const [volume, setVolume] = useState(Math.round(getAmbientVolume() * 100));

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 200,
        display: 'flex',
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* Overlay sombre */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(5,2,12,0.75)',
          animation: 'fadeIn 0.15s ease',
        }}
        onClick={onClose}
      />

      {/* Panel slide-in depuis la gauche */}
      <div
        style={{
          position: 'relative',
          width: 260,
          maxWidth: '78vw',
          height: '100%',
          background: 'linear-gradient(170deg, #2a1a08 0%, #120d07 100%)',
          borderRight: '1px solid rgba(245,158,11,0.25)',
          display: 'flex',
          flexDirection: 'column',
          animation: 'slideInLeft 0.2s ease',
          boxShadow: '4px 0 40px rgba(0,0,0,0.6)',
          paddingBottom: 24,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          padding: '20px 20px 16px',
          borderBottom: '1px solid rgba(245,158,11,0.15)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700, color: 'var(--accent-gold)', letterSpacing: 2 }}>
              ÉLIAS
            </div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 3 }}>
              {age} ans · {successRate}% de réussite
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--text-muted)', padding: 6, borderRadius: 8,
              display: 'flex', alignItems: 'center',
            }}
          >
            <XIcon size={16} strokeWidth={2} />
          </button>
        </div>

        {/* Titre actuel */}
        {currentTitle && (
          <div style={{
            margin: '12px 16px',
            padding: '10px 14px',
            background: 'rgba(251,191,36,0.08)',
            border: '1px solid rgba(251,191,36,0.25)',
            borderRadius: 10,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}>
            <Star size={12} strokeWidth={1.5} style={{ color: 'var(--accent-gold)', flexShrink: 0 }} />
            <div>
              <div style={{ fontSize: 9, color: 'var(--accent-gold)', letterSpacing: 1, fontWeight: 600 }}>TITRE ACTUEL</div>
              <div style={{ fontSize: 11, color: '#fde68a', marginTop: 2 }}>{currentTitle}</div>
            </div>
          </div>
        )}

        {/* Options */}
        <div style={{ flex: 1, padding: '8px 12px', display: 'flex', flexDirection: 'column', gap: 4, overflowY: 'auto' }}>

          <MenuSection label="JOUER" />

          <MenuButton
            icon={<BookOpen size={15} strokeWidth={1.5} />}
            label="Codex"
            sublabel="Versets débloqués"
            color="var(--accent-gold-light)"
            onClick={() => { onClose(); onOpenCodex(); }}
          />
          <MenuButton
            icon={<ScrollText size={15} strokeWidth={1.5} />}
            label="Lexique"
            sublabel="Vocabulaire EJP/ICC"
            color="#86efac"
            onClick={() => { onClose(); onOpenLexicon(); }}
          />

          <MenuSection label="PARAMÈTRES" />

          <MenuButton
            icon={
              <img
                src={ambientOn
                  ? '/ui/travelbook/UI_TravelBook_IconPause01a.png'
                  : '/ui/travelbook/UI_TravelBook_IconPlay01a.png'}
                alt=""
                style={{
                  height: 15, imageRendering: 'pixelated',
                  filter: ambientOn
                    ? 'brightness(2) hue-rotate(260deg) saturate(3)'
                    : 'brightness(1.4) saturate(0.4)',
                }}
              />
            }
            label={ambientOn ? 'Ambiance : ON' : 'Ambiance : OFF'}
            sublabel="Musique de fond"
            color={ambientOn ? 'var(--accent-violet-light)' : 'var(--text-muted)'}
            onClick={onToggleAmbient}
            active={ambientOn}
          />

          {ambientOn && (
            <div style={{ padding: '4px 16px 8px', display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 11, color: 'var(--text-muted)', minWidth: 28 }}>🔈</span>
              <input
                type="range"
                min={0}
                max={100}
                value={volume}
                onChange={(e) => {
                  const v = Number(e.target.value);
                  setVolume(v);
                  setAmbientVolume(v / 100);
                }}
                style={{ flex: 1, accentColor: 'var(--accent-gold)', cursor: 'pointer' }}
              />
              <span style={{ fontSize: 11, color: 'var(--text-muted)', minWidth: 28, textAlign: 'right' }}>{volume}%</span>
            </div>
          )}

          <MenuSection label="PARTIE" />

          <MenuButton
            icon={<Award size={15} strokeWidth={1.5} />}
            label="Héritage"
            sublabel="Bonus de la prochaine vie"
            color="var(--accent-gold)"
            onClick={onClose}
          />
          <MenuButton
            icon={
              <img
                src="/ui/travelbook/UI_TravelBook_IconRestart01a.png"
                alt=""
                style={{
                  height: 15, imageRendering: 'pixelated',
                  filter: 'brightness(1.5) saturate(2) hue-rotate(320deg)',
                }}
              />
            }
            label="Nouvelle Partie"
            sublabel="Recommencer (héritage préservé)"
            color="#fb923c"
            onClick={onNewGame}
            danger
          />
        </div>
      </div>
    </div>
  );
};

// ── Sous-composants ─────────────────────────────────────────────────────────

const MenuSection: FC<{ label: string }> = ({ label }) => (
  <div style={{
    fontSize: 9, color: 'var(--text-muted)', fontWeight: 700,
    letterSpacing: 1.5, padding: '8px 8px 4px', marginTop: 4,
    borderBottom: '1px solid rgba(124,58,237,0.12)',
  }}>
    {label}
  </div>
);

const MenuButton: FC<{
  icon: React.ReactNode;
  label: string;
  sublabel: string;
  color: string;
  onClick: () => void;
  active?: boolean;
  danger?: boolean;
}> = ({ icon, label, sublabel, color, onClick, active, danger }) => (
  <button
    onClick={onClick}
    style={{
      width: '100%',
      background: active
        ? 'rgba(245,158,11,0.10)'
        : danger
          ? 'rgba(220,107,61,0.08)'
          : 'transparent',
      border: '1px solid',
      borderColor: active
        ? 'rgba(245,158,11,0.3)'
        : danger
          ? 'rgba(220,107,61,0.25)'
          : 'transparent',
      borderRadius: 10,
      padding: '10px 12px',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      textAlign: 'left',
      transition: 'background 0.15s ease',
    }}
    onMouseEnter={(e) => {
      (e.currentTarget as HTMLButtonElement).style.background =
        danger ? 'rgba(220,107,61,0.14)' : 'rgba(245,158,11,0.08)';
    }}
    onMouseLeave={(e) => {
      (e.currentTarget as HTMLButtonElement).style.background =
        active ? 'rgba(245,158,11,0.10)' : danger ? 'rgba(220,107,61,0.08)' : 'transparent';
    }}
  >
    <span style={{ color, flexShrink: 0 }}>{icon}</span>
    <span>
      <div style={{ fontSize: 12, color: danger ? '#fb923c' : 'var(--text-primary)', fontWeight: 600 }}>
        {label}
      </div>
      <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>
        {sublabel}
      </div>
    </span>
  </button>
);
