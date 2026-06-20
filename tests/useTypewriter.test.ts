// @vitest-environment jsdom
/**
 * @file useTypewriter.test.ts
 * @description Hook de révélation « machine à écrire ». On vérifie ici le COMPORTEMENT
 *   du hook (rendu pur, dérivation hors animation, reset au changement de texte, skip),
 *   désormais sans aucun set-state-in-effect (itér. 22). rAF/performance sont stubés
 *   pour un test hermétique et déterministe — aucune dépendance au temps réel.
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTypewriter } from '../src/hooks/useTypewriter';
import { setReadingSpeed } from '../src/settings/textSpeed';

/* ─── Pilotage déterministe du temps et de rAF ─── */
let now = 0;
let rafQueue: FrameRequestCallback[] = [];

function flushFrame(advanceMs: number) {
  now += advanceMs;
  const due = rafQueue;
  rafQueue = [];
  act(() => {
    for (const cb of due) cb(now);
  });
}

beforeEach(() => {
  now = 0;
  rafQueue = [];
  vi.spyOn(performance, 'now').mockImplementation(() => now);
  vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
    rafQueue.push(cb);
    return rafQueue.length;
  });
  vi.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => {});
  // matchMedia absent de jsdom : on simule « pas de reduced-motion ».
  window.matchMedia = vi.fn().mockImplementation((q: string) => ({
    matches: false,
    media: q,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  }));
  setReadingSpeed('natural'); // 45 c/s, animé
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('useTypewriter — révélation animée', () => {
  it('part vide puis révèle progressivement à la cadence', () => {
    const { result } = renderHook(() => useTypewriter('Bonjour', { cps: 10 }));
    // Avant tout frame : rien de révélé (compte dérivé = revealed = 0).
    expect(result.current.shown).toBe('');
    expect(result.current.done).toBe(false);

    flushFrame(0); // 1er tick à elapsed 0 → 0 caractère
    expect(result.current.shown).toBe('');

    flushFrame(300); // 10 c/s → 3 caractères
    expect(result.current.shown).toBe('Bon');
    expect(result.current.done).toBe(false);
  });

  it('done devient vrai quand tout est révélé', () => {
    const { result } = renderHook(() => useTypewriter('Foi', { cps: 10 }));
    flushFrame(0);
    flushFrame(10_000); // largement de quoi tout révéler
    expect(result.current.shown).toBe('Foi');
    expect(result.current.done).toBe(true);
  });

  it('skip() révèle tout immédiatement', () => {
    const { result } = renderHook(() => useTypewriter('Espérance', { cps: 10 }));
    flushFrame(0);
    expect(result.current.shown).toBe('');
    act(() => result.current.skip());
    expect(result.current.shown).toBe('Espérance');
    expect(result.current.done).toBe(true);
  });

  it('repart de zéro quand le texte change (pas de flash de l’ancien compte)', () => {
    const { result, rerender } = renderHook(
      ({ t }) => useTypewriter(t, { cps: 10 }),
      { initialProps: { t: 'Premier' } },
    );
    flushFrame(0);
    flushFrame(10_000);
    expect(result.current.shown).toBe('Premier'); // tout révélé

    rerender({ t: 'Second' });
    // Reset pendant le rendu : le compte ne déborde jamais sur le nouveau texte.
    expect(result.current.shown).toBe('');
    expect(result.current.done).toBe(false);
  });
});

describe('useTypewriter — hors animation (dérivé pendant le rendu)', () => {
  it('cps infini → tout affiché d’emblée, sans frame', () => {
    const { result } = renderHook(() =>
      useTypewriter('Grâce', { cps: Infinity }),
    );
    expect(result.current.shown).toBe('Grâce');
    expect(result.current.done).toBe(true);
  });

  it('enabled:false → tout affiché d’emblée', () => {
    const { result } = renderHook(() =>
      useTypewriter('Paix', { enabled: false }),
    );
    expect(result.current.shown).toBe('Paix');
    expect(result.current.done).toBe(true);
  });
});
