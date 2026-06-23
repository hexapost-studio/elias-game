/**
 * ChapterCard.tsx — Carte d'intro de décennie (Design V2 — roman visuel).
 *
 * S'affiche automatiquement à chaque tranche de 10 ans (10, 20, 30…).
 * Bloque le jeu jusqu'au tap → renforce la sensation de "chapitre" qui commence.
 * Données depuis lifeChapters.ts (titre, thème, cliffhanger, saison).
 * prefers-reduced-motion : transitions désactivées.
 */
import type { FC } from 'react';
import type { SpiritualSeasonName } from '../types/game';

const REDUCED = typeof window !== 'undefined'
  && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Couleurs des saisons (cohérentes avec le reste de l'UI)
const SEASON_COLORS: Record<SpiritualSeasonName, string> = {
  Réveil:       '#f59e0b',
  Désert:       '#a16207',
  Persécution:  '#dc2626',
  Abondance:    '#16a34a',
  Grâce:        '#7c3aed',
};

const SEASON_ICONS: Record<SpiritualSeasonName, string> = {
  Réveil:       '✦',
  Désert:       '◇',
  Persécution:  '⚔',
  Abondance:    '❧',
  Grâce:        '◈',
};

interface Props {
  chapterTitle: string;
  chapterTheme: string;
  age: number;
  season: SpiritualSeasonName;
  callingName?: string;
  onContinue: () => void;
}

export const ChapterCard: FC<Props> = ({
  chapterTitle, chapterTheme, age, season, callingName, onContinue,
}) => {
  const seasonColor = SEASON_COLORS[season] ?? '#f59e0b';
  const seasonIcon  = SEASON_ICONS[season]  ?? '✦';

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 700,
        background: 'rgba(5,2,12,0.94)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 24,
        animation: REDUCED ? 'none' : 'fadeIn 0.35s ease',
      }}
      onClick={onContinue}
      role="button"
      aria-label="Continuer"
    >
      <div
        style={{
          maxWidth: 300, width: '100%', textAlign: 'center',
          animation: REDUCED ? 'none' : 'fadeIn 0.45s ease 0.1s both',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Numéro de décennie */}
        <div style={{
          fontFamily: 'var(--font-display)',
          fontSize: 10,
          letterSpacing: 4,
          color: 'var(--text-muted)',
          marginBottom: 6,
        }}>
          {age} ANS
        </div>

        {/* Icône de saison */}
        <div style={{
          fontSize: 32,
          color: seasonColor,
          marginBottom: 12,
          lineHeight: 1,
          filter: `drop-shadow(0 0 12px ${seasonColor}88)`,
        }}>
          {seasonIcon}
        </div>

        {/* Titre du chapitre */}
        <h2 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 26,
          fontWeight: 800,
          color: 'var(--text-primary)',
          margin: '0 0 6px',
          letterSpacing: 1,
        }}>
          {chapterTitle}
        </h2>

        {/* Saison */}
        <div style={{
          fontSize: 11,
          fontFamily: 'var(--font-display)',
          letterSpacing: 2,
          color: seasonColor,
          marginBottom: 20,
        }}>
          SAISON : {season.toUpperCase()}
          {callingName && <span style={{ color: 'var(--text-muted)' }}> · {callingName}</span>}
        </div>

        {/* Séparateur */}
        <div style={{
          height: 1,
          background: `linear-gradient(90deg, transparent, ${seasonColor}55, transparent)`,
          marginBottom: 20,
        }} />

        {/* Thème du chapitre */}
        <p style={{
          fontSize: 14,
          color: 'var(--text-secondary)',
          lineHeight: 1.7,
          fontStyle: 'italic',
          margin: '0 0 28px',
          padding: '0 8px',
        }}>
          {chapterTheme}
        </p>

        {/* CTA */}
        <button
          onClick={onContinue}
          style={{
            padding: '12px 32px',
            background: `${seasonColor}18`,
            border: `1px solid ${seasonColor}44`,
            borderRadius: 12,
            cursor: 'pointer',
            fontFamily: 'var(--font-display)',
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: 2,
            color: seasonColor,
            transition: REDUCED ? 'none' : 'background 0.15s ease',
          }}
        >
          CONTINUER →
        </button>

        <div style={{
          marginTop: 16,
          fontSize: 10,
          color: 'var(--text-muted)',
          letterSpacing: 0.5,
        }}>
          ou touche n'importe où
        </div>
      </div>
    </div>
  );
};
