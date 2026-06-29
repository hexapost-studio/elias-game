/**
 * TutorialOverlay.tsx — Tour guidé de l'interface (T-43).
 *
 * Spotlight via box-shadow géant sur l'élément cible + bulle tooltip positionnée.
 * Zéro lib externe. prefers-reduced-motion respecté (transitions désactivées).
 * 6 étapes déclaratives dans tutorialSteps.ts.
 */
import { useState, useEffect, useCallback } from 'react';
import { TUTORIAL_STEPS, type TutorialStep } from '../engine/tutorialSteps';
import { markTutorialDone } from '../settings/tutorialSeen';

interface Props {
  onDone: () => void;
}

interface TargetRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

const PADDING = 6; // px autour de l'élément spotlighté
const REDUCED = typeof window !== 'undefined'
  && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** `measured` distingue « pas encore mesuré » (rect null transitoire) de « cible absente »
 *  (rect null APRÈS mesure) — indispensable pour ne pas sauter une étape avant le 1ᵉʳ rendu. */
function useTargetRect(selector: string): { rect: TargetRect | null; measured: boolean } {
  const [state, setState] = useState<{ rect: TargetRect | null; measured: boolean }>(
    { rect: null, measured: false },
  );

  useEffect(() => {
    function measure() {
      const el = document.querySelector(selector);
      if (!el) { setState({ rect: null, measured: true }); return; }
      const r = el.getBoundingClientRect();
      setState({ rect: { top: r.top, left: r.left, width: r.width, height: r.height }, measured: true });
    }
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [selector]);

  return state;
}

function StepBubble({
  step,
  rect,
  stepIndex,
  total,
  onNext,
  onSkip,
}: {
  step: TutorialStep;
  rect: TargetRect;
  stepIndex: number;
  total: number;
  onNext: () => void;
  onSkip: () => void;
}) {
  const isLast = stepIndex === total - 1;
  const bubbleWidth = Math.min(300, window.innerWidth * 0.88);
  const bubbleLeft = Math.max(16, Math.min(
    window.innerWidth - bubbleWidth - 16,
    rect.left + rect.width / 2 - bubbleWidth / 2,
  ));

  const isBelow = step.position === 'bottom';
  const bubbleTop = isBelow
    ? rect.top + rect.height + PADDING + 12
    : rect.top - PADDING - 12 - 160; // hauteur estimée de la bulle

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      style={{
        position: 'fixed',
        top: Math.max(12, Math.min(window.innerHeight - 200, bubbleTop)),
        left: bubbleLeft,
        width: bubbleWidth,
        zIndex: 1002,
        background: 'var(--bg-card, #1e1508)',
        border: '1px solid rgba(245,158,11,0.4)',
        borderRadius: 14,
        padding: '16px 16px 12px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
        transition: REDUCED ? 'none' : 'opacity 0.2s ease',
      }}
    >
      {/* Indicateur d'étapes */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 10 }}>
        {Array.from({ length: total }).map((_, i) => (
          <div
            key={i}
            style={{
              height: 3,
              flex: 1,
              borderRadius: 2,
              background: i <= stepIndex ? '#f59e0b' : 'rgba(245,158,11,0.2)',
              transition: REDUCED ? 'none' : 'background 0.2s',
            }}
          />
        ))}
      </div>

      {/* Titre */}
      <div style={{
        fontSize: 14,
        fontWeight: 700,
        color: '#f59e0b',
        marginBottom: 6,
        fontFamily: 'var(--font-display)',
        letterSpacing: 0.5,
      }}>
        {step.title}
      </div>

      {/* Corps */}
      <div style={{
        fontSize: 13,
        color: 'var(--text-secondary, #c9a97e)',
        lineHeight: 1.55,
      }}>
        {step.body}
      </div>

      {/* Boutons */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 14,
        gap: 8,
      }}>
        <button
          onClick={onSkip}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-muted, #6b7280)',
            fontSize: 11,
            cursor: 'pointer',
            padding: '6px 0',
            letterSpacing: 0.5,
          }}
        >
          Passer le tutorial
        </button>
        <button
          onClick={onNext}
          style={{
            padding: '8px 18px',
            background: '#f59e0b',
            color: '#120d07',
            border: 'none',
            borderRadius: 8,
            fontWeight: 700,
            fontSize: 12,
            cursor: 'pointer',
            letterSpacing: 0.5,
            minHeight: 36,
          }}
        >
          {isLast ? 'Terminer ✓' : 'Suivant →'}
        </button>
      </div>
    </div>
  );
}

export function TutorialOverlay({ onDone }: Props) {
  const [stepIndex, setStepIndex] = useState(0);
  const step = TUTORIAL_STEPS[stepIndex];
  const { rect, measured } = useTargetRect(step.targetSelector);

  const finish = useCallback(() => {
    markTutorialDone();
    onDone();
  }, [onDone]);

  // Cible de la DERNIÈRE étape introuvable (après mesure) → terminer. `finish()` touche le
  // parent (App) : on l'exécute en EFFET, jamais pendant le rendu — sinon React lève
  // « Cannot update a component (App) while rendering a different component (TutorialOverlay) ».
  useEffect(() => {
    if (measured && !rect && stepIndex >= TUTORIAL_STEPS.length - 1) finish();
  }, [measured, rect, stepIndex, finish]);

  const handleNext = useCallback(() => {
    if (stepIndex < TUTORIAL_STEPS.length - 1) {
      setStepIndex((i) => i + 1);
    } else {
      finish();
    }
  }, [stepIndex, finish]);

  // Escape pour passer
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') finish(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [finish]);

  // Body scroll lock
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  if (!rect) {
    // Pas encore mesuré → on attend (rien à peindre). Mesuré mais cible absente sur une étape
    // intermédiaire → avancer : `setStepIndex` met à jour CE composant (pattern autorisé par
    // React en rendu). La dernière étape absente est gérée par l'effet ci-dessus (`finish`).
    if (measured && stepIndex < TUTORIAL_STEPS.length - 1) {
      setStepIndex((i) => i + 1);
    }
    return null;
  }

  return (
    <>
      {/* Fond sombre — clic pour passer */}
      <div
        onClick={finish}
        aria-hidden="true"
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 1000,
          background: 'rgba(0,0,0,0.01)', // presque transparent — le box-shadow fait le travail
        }}
      />

      {/* Spotlight : un div positionné sur la cible avec un box-shadow immense */}
      <div
        aria-hidden="true"
        style={{
          position: 'fixed',
          top: rect.top - PADDING,
          left: rect.left - PADDING,
          width: rect.width + PADDING * 2,
          height: rect.height + PADDING * 2,
          borderRadius: 10,
          boxShadow: '0 0 0 4000px rgba(0,0,0,0.78)',
          zIndex: 1001,
          pointerEvents: 'none',
          border: '2px solid rgba(245,158,11,0.6)',
          transition: REDUCED ? 'none' : 'top 0.25s ease, left 0.25s ease, width 0.25s ease, height 0.25s ease',
        }}
      />

      {/* Bulle tooltip */}
      <StepBubble
        step={step}
        rect={rect}
        stepIndex={stepIndex}
        total={TUTORIAL_STEPS.length}
        onNext={handleNext}
        onSkip={finish}
      />
    </>
  );
}
