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
  BookOpen, ScrollText, Music, Moon, Award, Star, RefreshCw, XIcon, Volume2,
} from './IconSystem';
import { setAmbientVolume, getAmbientVolume } from '../engine/juice';
import { DailyVerse } from './DailyVerse';

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
  dyslexicMode: boolean;
  reducedSounds: boolean;
  slowTimer: boolean;
  onToggleDyslexic: () => void;
  onToggleReducedSounds: () => void;
  onToggleSlowTimer: () => void;
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
  dyslexicMode,
  reducedSounds,
  slowTimer,
  onToggleDyslexic,
  onToggleReducedSounds,
  onToggleSlowTimer,
}) => {
  const [volume, setVolume] = useState(Math.round(getAmbientVolume() * 100));

  return (
    <div
      className="menu-overlay"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* Overlay sombre */}
      <div
        className="menu-overlay-bg"
        onClick={onClose}
      />

      {/* Panel slide-in depuis la gauche */}
      <div
        className="menu-panel"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="menu-header">
          <div>
            <div className="menu-title">
              ÉLIAS
            </div>
            <div className="menu-subtitle">
              {age} ans · {successRate}% de réussite
            </div>
          </div>
          <button
            onClick={onClose}
            className="menu-close-btn"
          >
            <XIcon size={16} strokeWidth={2} />
          </button>
        </div>

        {/* Titre actuel */}
        {currentTitle && (
          <div className="menu-current-title-box">
            <Star size={12} strokeWidth={1.5} className="menu-star-icon" />
            <div>
              <div className="menu-current-title-label">TITRE ACTUEL</div>
              <div className="menu-current-title-value">{currentTitle}</div>
            </div>
          </div>
        )}

        <DailyVerse />

        {/* Options */}
        <div className="menu-options-area">

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
              <Volume2 size={14} strokeWidth={1.5} style={{ color: 'var(--text-muted)', minWidth: 28 }} />
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

          <MenuSection label="ACCESSIBILITÉ" />

          <MenuButton
            icon={
              <span style={{ fontSize: 15, color: dyslexicMode ? 'var(--accent-gold-light)' : 'var(--text-muted)' }}>
                Aa
              </span>
            }
            label={dyslexicMode ? 'Police dyslexique : ON' : 'Police dyslexique : OFF'}
            sublabel="OpenDyslexic pour une lecture facilitée"
            color={dyslexicMode ? 'var(--accent-gold-light)' : 'var(--text-muted)'}
            onClick={onToggleDyslexic}
            active={dyslexicMode}
          />

          <MenuButton
            icon={
              <span style={{ fontSize: 15, color: reducedSounds ? 'var(--accent-gold-light)' : 'var(--text-muted)' }}>
                ♪
              </span>
            }
            label={reducedSounds ? 'Sons réduits : ON' : 'Sons réduits : OFF'}
            sublabel="Coupe la musique ambiante, garde les effets"
            color={reducedSounds ? 'var(--accent-gold-light)' : 'var(--text-muted)'}
            onClick={onToggleReducedSounds}
            active={reducedSounds}
          />

          <MenuButton
            icon={
              <span style={{ fontSize: 15, color: slowTimer ? 'var(--accent-gold-light)' : 'var(--text-muted)' }}>
                ⏱
              </span>
            }
            label={slowTimer ? 'Timer long : ON' : 'Timer long : OFF'}
            sublabel="×2 pour les versets — plus de temps pour répondre"
            color={slowTimer ? 'var(--accent-gold-light)' : 'var(--text-muted)'}
            onClick={onToggleSlowTimer}
            active={slowTimer}
          />

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
  <div className="menu-section-label">
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
