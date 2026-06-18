/**
 * MoralChoicePanel.tsx — Panneau de choix moral (T-29).
 *
 * Affiché à la place de VerseChoices quand l'event courant est un dilemme moral.
 * Le joueur clique sur un acte concret (pas un verset) ; le choix est appliqué
 * via `chooseMoral()` du store.
 *
 * Style délibérément plus grave que les chips de versets : fond sombre, boutons pleins.
 * Respecte prefers-reduced-motion (pas d'animation de délai).
 */

import { useState } from 'react';
import { useGameStore } from '../stores/gameStore';
import { isMoralEvent } from '../engine/moralChoice';
import type { MoralChoice } from '../types/game';

export function MoralChoicePanel() {
  const currentEvent = useGameStore((s) => s.currentEvent);
  const phase = useGameStore((s) => s.phase);
  const chooseMoral = useGameStore((s) => s.chooseMoral);
  const lastEventResult = useGameStore((s) => s.lastEventResult);

  // État local : id du choix sélectionné (pendant le feedback visuel)
  const [chosenId, setChosenId] = useState<string | null>(null);

  const isActive = !!currentEvent && phase === 'event' && isMoralEvent(currentEvent);
  const hasAnswered = lastEventResult !== null;

  // Reset state-on-prop-change (pendant le rendu, pas dans un effet)
  const eventKey = isActive ? currentEvent.id : null;
  const [prevEventKey, setPrevEventKey] = useState(eventKey);
  if (prevEventKey !== eventKey) {
    setPrevEventKey(eventKey);
    setChosenId(null);
  }

  if (!isActive) return null;

  const choices: MoralChoice[] = currentEvent.moralChoices ?? [];

  function handleChoose(choice: MoralChoice) {
    if (hasAnswered || chosenId !== null) return;
    setChosenId(choice.id);
    chooseMoral(choice);
  }

  return (
    <div className="moral-panel">
      {/* Card de l'event */}
      <div className="event-card moral-event-card">
        <div className="event-title moral-event-title">{currentEvent.title}</div>
        <div className="event-description">{currentEvent.description}</div>
        {currentEvent.thematicFlavor && (
          <div className="event-flavor">{currentEvent.thematicFlavor}</div>
        )}
      </div>

      {/* Label de section */}
      <div className="moral-section-label">Que fait Élias ?</div>

      {/* Boutons d'acte */}
      {!hasAnswered && choices.map((choice) => {
        const isChosen = chosenId === choice.id;
        return (
          <button
            key={choice.id}
            className={`moral-choice-btn${isChosen ? ' moral-choice-btn--chosen' : ''}`}
            onClick={() => handleChoose(choice)}
            disabled={chosenId !== null}
            aria-label={choice.label}
          >
            <span className="moral-choice-label">{choice.label}</span>
            <span className="moral-choice-desc">{choice.description}</span>
          </button>
        );
      })}

      {/* Confirmation post-choix */}
      {hasAnswered && chosenId !== null && (() => {
        const chosen = choices.find((c) => c.id === chosenId);
        if (!chosen) return null;
        return (
          <div className="moral-chosen-bubble">
            Élias a choisi : <strong>{chosen.label}</strong>
          </div>
        );
      })()}
    </div>
  );
}
