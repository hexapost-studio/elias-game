// @vitest-environment jsdom
/**
 * @file shareCard.test.tsx
 * @description ShareCard — verrouille le comportement après le refactor itér. 28
 *   (purity/refs/exhaustive-deps → 0) : citation tirée UNE fois (init paresseuse, plus de
 *   Math.random au rendu ni de ref lue au rendu) et auto-copie au montage. Hermétique :
 *   clipboard et timers mockés.
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { ShareCard } from '../src/components/ShareCard';

const baseProps = {
  playerName: 'Élias',
  seed: 12345,
  age: 42,
  successRate: 80,
  maxCombo: 7,
  titleName: null,
  isVictory: false,
  completedArcsCount: 0,
  onClose: () => {},
};

beforeEach(() => {
  vi.useFakeTimers();
  Object.assign(navigator, {
    clipboard: { writeText: vi.fn().mockResolvedValue(undefined) },
  });
});

afterEach(() => {
  vi.runOnlyPendingTimers();
  vi.useRealTimers();
  cleanup();
  vi.restoreAllMocks();
});

describe('ShareCard — rendu pur', () => {
  it('affiche le résumé de la vie (nom, âge, graine)', () => {
    render(<ShareCard {...baseProps} />);
    const pre = document.querySelector('pre');
    expect(pre?.textContent).toContain('Élias');
    expect(pre?.textContent).toContain('42 ans');
    expect(pre?.textContent).toContain('12345');
  });

  it('la citation reste stable entre deux rendus (tirée une seule fois)', () => {
    const { rerender } = render(<ShareCard {...baseProps} />);
    const first = document.querySelector('pre')?.textContent;
    rerender(<ShareCard {...baseProps} age={43} />);
    const second = document.querySelector('pre')?.textContent;
    // Même citation (un seul tirage), même si l'âge a changé.
    const quoteOf = (t?: string | null) => t?.split('\n').find((l) => l.includes('—'));
    expect(quoteOf(first)).toBe(quoteOf(second));
  });

  it('affiche le bouton COPIER', () => {
    render(<ShareCard {...baseProps} />);
    expect(screen.getByText('COPIER')).toBeTruthy();
  });
});

describe('ShareCard — auto-copie au montage', () => {
  it('copie le texte ~300ms après le montage', () => {
    render(<ShareCard {...baseProps} />);
    expect(navigator.clipboard.writeText).not.toHaveBeenCalled();
    vi.advanceTimersByTime(350);
    expect(navigator.clipboard.writeText).toHaveBeenCalledTimes(1);
    const arg = (navigator.clipboard.writeText as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(arg).toContain('Élias');
  });
});
