// @vitest-environment jsdom
/**
 * @file tutorialOverlay.test.tsx
 * @description Garde de régression (itér.82). Le tour guidé saute les étapes dont la cible est
 *   absente du DOM (ex. `.event-card`/`#choices-area` n'existent qu'en phase 'event', or le tuto
 *   tourne en phase 'idle'). Le bug : `useTargetRect` ne réinitialisait pas son état de mesure au
 *   changement de cible → pendant les re-rendus synchrones de `setStepIndex`, l'état « collé » de
 *   l'étape précédente faisait cascader le saut jusqu'à `finish()` AVANT que la dernière étape
 *   (présente) soit mesurée et affichée. Reproduit ici avec deux étapes absentes consécutives.
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, cleanup, act } from '@testing-library/react';

// jsdom n'implémente pas matchMedia ; le composant l'évalue à l'import (REDUCED). Stub avant import.
vi.hoisted(() => {
  if (typeof window !== 'undefined' && !window.matchMedia) {
    // @ts-expect-error — stub minimal pour jsdom
    window.matchMedia = () => ({ matches: false, addEventListener() {}, removeEventListener() {} });
  }
});

// Étapes de test : présente → absente → absente → présente. La cascade d'absences ne doit PAS
// déborder sur la dernière étape présente ni terminer le tuto prématurément.
vi.mock('../src/engine/tutorialSteps', () => ({
  TUTORIAL_STEPS: [
    { targetSelector: '#present-a', title: 'Étape A', body: 'a', position: 'bottom' },
    { targetSelector: '#absent-b',  title: 'Étape B', body: 'b', position: 'bottom' },
    { targetSelector: '#absent-c',  title: 'Étape C', body: 'c', position: 'bottom' },
    { targetSelector: '#present-d', title: 'Étape D', body: 'd', position: 'bottom' },
  ],
}));

const markTutorialDone = vi.fn();
vi.mock('../src/settings/tutorialSeen', () => ({
  markTutorialDone: () => markTutorialDone(),
}));

import { TutorialOverlay } from '../src/components/TutorialOverlay';

function addTarget(id: string) {
  const el = document.createElement('div');
  el.id = id;
  // getBoundingClientRect dans jsdom renvoie des zéros — suffisant (rect non-null).
  document.body.appendChild(el);
  return el;
}

describe('TutorialOverlay — saut d\'étapes absentes (itér.82)', () => {
  beforeEach(() => {
    markTutorialDone.mockClear();
    addTarget('present-a');
    addTarget('present-d');
    // #absent-b et #absent-c volontairement NON ajoutés.
  });
  afterEach(() => { cleanup(); document.body.innerHTML = ''; });

  it('affiche la 1ʳᵉ étape présente, saute les absentes, et N\'appelle PAS onDone prématurément', async () => {
    const onDone = vi.fn();
    await act(async () => { render(<TutorialOverlay onDone={onDone} />); });

    // Étape A (présente) visible
    expect(screen.getByText('Étape A')).toBeTruthy();
    expect(onDone).not.toHaveBeenCalled();

    // Avancer : B et C absentes → doivent être sautées, on arrive sur D (présente)
    await act(async () => { fireEvent.click(screen.getByText(/Suivant/i)); });

    // D doit être affichée — PAS sautée par la cascade, et le tuto PAS terminé
    expect(screen.getByText('Étape D')).toBeTruthy();
    expect(screen.queryByText('Étape B')).toBeNull();
    expect(screen.queryByText('Étape C')).toBeNull();
    expect(onDone).not.toHaveBeenCalled();
  });

  it('terminer la dernière étape appelle onDone une seule fois', async () => {
    const onDone = vi.fn();
    await act(async () => { render(<TutorialOverlay onDone={onDone} />); });
    await act(async () => { fireEvent.click(screen.getByText(/Suivant/i)); }); // A → D
    // Sur la dernière étape, le bouton devient "Terminer ✓"
    await act(async () => { fireEvent.click(screen.getByText(/Terminer/i)); });
    expect(onDone).toHaveBeenCalledTimes(1);
    expect(markTutorialDone).toHaveBeenCalledTimes(1);
  });
});
