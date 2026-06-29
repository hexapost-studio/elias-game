import { describe, it, expect } from 'vitest';
// @ts-expect-error — outil ESM en .mjs (hors tsconfig.app), importé pour test comportemental.
import { deriveStatus, checkDocs } from '../tools/status.mjs';

describe('status (G-2) — état dérivé, pas narré', () => {
  it('dérive des compteurs cohérents depuis les sources de vérité', () => {
    const s = deriveStatus();
    expect(s.events).toBeGreaterThan(300);
    expect(s.verses).toBeGreaterThan(100);
    expect(s.moralDilemmas).toBeGreaterThanOrEqual(0);
    expect(typeof s.head).toBe('string');
    expect(s.lastIteration).toBeGreaterThanOrEqual(87);
  });

  it('checkDocs ne signale AUCUN écart quand CLAUDE.md reflète le réel (porte anti-dérive)', () => {
    const s = deriveStatus();
    expect(checkDocs(s)).toEqual([]);
  });

  it('checkDocs DÉTECTE une assertion stale (garde : la porte doit rougir sur dérive)', () => {
    const fabriqué = { events: 999999, verses: 888888 };
    const écarts = checkDocs(fabriqué);
    expect(écarts.length).toBeGreaterThan(0);
    expect(écarts.every((m: { real: number }) => m.real === 999999 || m.real === 888888)).toBe(true);
  });
});
