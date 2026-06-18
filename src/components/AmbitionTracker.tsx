/**
 * AmbitionTracker.tsx — Objectif multi-étapes de l'Appel (T-25)
 *
 * Composant LÉGER : zéro state interne propre à la logique métier.
 * La progression est dérivée via runAmbition.ts (module pur) depuis le store.
 * Seul le toggle d'ouverture du panneau est stocké localement (UI pure).
 *
 * Accessibilité :
 *  - prefers-reduced-motion : les transitions sont désactivées.
 *  - role="dialog" + aria-label + focus-trap minimal (Escape pour fermer).
 *  - Bouton déclencheur discret — ne surcharge pas l'écran principal.
 */
import { useState, useEffect, useCallback } from 'react';
import { useGameStore } from '../stores/gameStore';
import { deriveRunAmbition, getCallingProgress } from '../engine/runAmbition';
import { STORY_ARCS } from '../data/storyArcs';
import type { AmbitionStep } from '../engine/runAmbition';

/* ─── Icônes de statut ─── */

function IconDone() {
  return <span aria-hidden="true" style={{ color: '#34d399', fontWeight: 700, fontSize: 12 }}>✓</span>;
}
function IconActive() {
  return <span aria-hidden="true" style={{ color: '#fbbf24', fontSize: 12 }}>●</span>;
}
function IconLocked() {
  return <span aria-hidden="true" style={{ color: 'var(--text-muted)', fontSize: 12, opacity: 0.5 }}>○</span>;
}

/* ─── Résolution des templates d'arc ─── */

function resolveLabel(
  label: string,
  city: string,
  friendName: string,
  profession: string,
  churchName: string,
  spouseName: string,
): string {
  return label
    .replace(/\{ville\}/g, city)
    .replace(/\{ami\}/g, friendName)
    .replace(/\{métier\}/g, profession)
    .replace(/\{église\}/g, churchName)
    .replace(/\{conjoint\}/g, spouseName);
}

/* ─── Sous-composant : une étape ─── */

interface StepRowProps {
  step: AmbitionStep;
  city: string;
  friendName: string;
  profession: string;
  churchName: string;
  spouseName: string;
}

function StepRow({ step, city, friendName, profession, churchName, spouseName }: StepRowProps) {
  const resolvedLabel = resolveLabel(step.label, city, friendName, profession, churchName, spouseName);
  const arc = STORY_ARCS.find((a) => a.id === step.arcId);
  const isDone = step.status === 'done';
  const isActive = step.status === 'active';
  const isLocked = step.status === 'locked';

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '5px 0',
        borderBottom: '1px solid rgba(245,158,11,0.08)',
        opacity: isLocked ? 0.45 : 1,
      }}
    >
      {/* Icône de statut */}
      <span style={{ minWidth: 16, textAlign: 'center' }}>
        {isDone ? <IconDone /> : isActive ? <IconActive /> : <IconLocked />}
      </span>

      {/* Label + mini barre d'étapes */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: 11,
            fontWeight: isActive ? 600 : 400,
            color: isDone
              ? '#34d399'
              : isActive
              ? '#fbbf24'
              : 'var(--text-muted)',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
          title={arc?.description}
        >
          {resolvedLabel}
        </div>

        {/* Barre de sous-étapes (visible si en cours ou complété) */}
        {!isLocked && (
          <div
            style={{
              display: 'flex',
              gap: 2,
              marginTop: 3,
            }}
            aria-label={`${step.stepsCompleted} étape${step.stepsCompleted !== 1 ? 's' : ''} sur ${step.stepsTotal}`}
          >
            {Array.from({ length: step.stepsTotal }).map((_, i) => (
              <div
                key={i}
                style={{
                  width: 6,
                  height: 4,
                  borderRadius: 2,
                  background: i < step.stepsCompleted
                    ? (isDone ? '#34d399' : '#fbbf24')
                    : 'rgba(245,158,11,0.2)',
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Compteur texte */}
      {!isLocked && (
        <span
          style={{
            fontSize: 9,
            color: 'var(--text-muted)',
            whiteSpace: 'nowrap',
          }}
        >
          {step.stepsCompleted}/{step.stepsTotal}
        </span>
      )}
    </div>
  );
}

/* ─── Composant principal ─── */

export function AmbitionTracker() {
  const [open, setOpen] = useState(false);

  // Données du store — lecture légère (sélecteurs atomiques)
  const calling         = useGameStore((s) => s.calling);
  const completedArcs   = useGameStore((s) => s.completedArcs);
  const encounteredArcIds = useGameStore((s) => s.encounteredArcIds);
  const answeredArcEventIds = useGameStore((s) => s.answeredArcEventIds);
  const lifeContext     = useGameStore((s) => s.lifeContext);

  // Dérivation pure — pas de state métier
  const stateSlice = { completedArcs, encounteredArcIds, answeredArcEventIds } as Parameters<typeof deriveRunAmbition>[0];
  const steps    = deriveRunAmbition(stateSlice);
  const progress = getCallingProgress(stateSlice);

  // Fermeture via Escape
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') setOpen(false);
  }, []);

  useEffect(() => {
    if (open) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, handleKeyDown]);

  // Aucun calling défini → ne rien afficher (rétro-compat saves anciennes)
  if (!calling) return null;

  const callingColor = calling.color ?? '#fbbf24';

  return (
    <>
      {/* Bouton déclencheur discret */}
      <button
        onClick={() => setOpen((v) => !v)}
        title={`Mon Appel : ${calling.name} — ${progress.completed}/${progress.total} arcs`}
        aria-expanded={open}
        aria-controls="ambition-panel"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 4,
          padding: '2px 8px',
          borderRadius: 10,
          fontSize: 9,
          fontWeight: 600,
          letterSpacing: 0.3,
          border: `1px solid ${callingColor}55`,
          background: open ? `${callingColor}28` : `${callingColor}12`,
          color: callingColor,
          cursor: 'pointer',
          verticalAlign: 'middle',
          transition: 'background 0.15s ease',
          fontFamily: 'var(--font-body)',
        }}
      >
        <span aria-hidden="true">{calling.icon}</span>
        <span>MON APPEL</span>
        <span
          style={{
            background: `${callingColor}33`,
            borderRadius: 8,
            padding: '0 4px',
            fontSize: 8,
          }}
        >
          {progress.completed}/{progress.total}
        </span>
      </button>

      {/* Panneau coulissant */}
      {open && (
        <div
          id="ambition-panel"
          role="dialog"
          aria-label={`Ambition de run — Appel : ${calling.name}`}
          aria-modal="false"
          style={{
            position: 'fixed',
            bottom: 0,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 'min(340px, 96vw)',
            maxHeight: '65vh',
            display: 'flex',
            flexDirection: 'column',
            background: 'var(--bg-card)',
            border: `1px solid ${callingColor}44`,
            borderBottom: 'none',
            borderRadius: '16px 16px 0 0',
            zIndex: 900,
            /* prefers-reduced-motion : pas d'animation sur le panneau */
          }}
        >
          {/* En-tête */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 14px 8px',
              borderBottom: `1px solid ${callingColor}22`,
              flexShrink: 0,
            }}
          >
            <div>
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: callingColor,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 5,
                }}
              >
                <span aria-hidden="true" style={{ fontSize: 15 }}>{calling.icon}</span>
                {calling.name}
              </div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 1 }}>
                {calling.tagline}
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              aria-label="Fermer le panneau"
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-muted)',
                fontSize: 16,
                cursor: 'pointer',
                padding: '2px 6px',
                borderRadius: 6,
                lineHeight: 1,
              }}
            >
              ✕
            </button>
          </div>

          {/* Barre de progression globale */}
          <div style={{ padding: '8px 14px 4px', flexShrink: 0 }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: 9,
                color: 'var(--text-muted)',
                marginBottom: 4,
              }}
            >
              <span>PROGRESSION DE LA DESTINÉE</span>
              <span style={{ color: callingColor, fontWeight: 600 }}>
                {progress.percent}%
              </span>
            </div>
            {/* Barre */}
            <div
              role="progressbar"
              aria-valuenow={progress.percent}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`${progress.percent}% de la destinée accomplie`}
              style={{
                height: 5,
                borderRadius: 3,
                background: 'rgba(245,158,11,0.12)',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  height: '100%',
                  width: `${progress.percent}%`,
                  borderRadius: 3,
                  background: `linear-gradient(90deg, ${callingColor}, ${callingColor}bb)`,
                  /* transition supprimée si prefers-reduced-motion (gérée par @media CSS) */
                  transition: 'width 0.4s ease',
                }}
              />
            </div>
            <div
              style={{
                display: 'flex',
                gap: 10,
                marginTop: 5,
                fontSize: 9,
                color: 'var(--text-muted)',
              }}
            >
              <span style={{ color: '#34d399' }}>✓ {progress.completed} terminé{progress.completed !== 1 ? 's' : ''}</span>
              {progress.active > 0 && (
                <span style={{ color: '#fbbf24' }}>● {progress.active} en cours</span>
              )}
              <span>
                {progress.total - progress.completed - progress.active} à venir
              </span>
            </div>
          </div>

          {/* Liste des étapes */}
          <div
            style={{
              overflowY: 'auto',
              padding: '4px 14px 16px',
              flex: 1,
            }}
          >
            {steps.map((step) => (
              <StepRow
                key={step.arcId}
                step={step}
                city={lifeContext.city}
                friendName={lifeContext.friendName}
                profession={lifeContext.profession}
                churchName={lifeContext.churchName}
                spouseName={lifeContext.spouseName}
              />
            ))}
          </div>
        </div>
      )}

      {/* Overlay de fond pour fermeture au clic extérieur */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          aria-hidden="true"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 899,
            background: 'rgba(0,0,0,0.3)',
          }}
        />
      )}

      {/* CSS prefers-reduced-motion */}
      <style>{`
        @media (prefers-reduced-motion: reduce) {
          #ambition-panel div[role="progressbar"] > div {
            transition: none !important;
          }
        }
      `}</style>
    </>
  );
}
