/**
 * @file dailyVerse.test.ts
 * @description Sélection pure du verset du jour (itér. 24) — déterministe par date,
 *   extraite de `DailyVerse` pour dériver pendant le rendu (plus de state+effet).
 */
import { describe, it, expect } from 'vitest';
import { dayOfYear, verseOfDay } from '../src/engine/dailyVerse';

const POOL = [
  { ref: 'A', text: 'a' },
  { ref: 'B', text: 'b' },
  { ref: 'C', text: 'c' },
];

describe('dayOfYear', () => {
  it('1ᵉʳ janvier → 1', () => {
    expect(dayOfYear(new Date(2026, 0, 1))).toBe(1);
  });

  it('progresse d’un par jour', () => {
    expect(dayOfYear(new Date(2026, 0, 10))).toBe(10);
  });
});

describe('verseOfDay — déterminisme', () => {
  it('même date → même verset (stable dans la journée)', () => {
    const d = new Date(2026, 5, 18);
    expect(verseOfDay(d, POOL)).toBe(verseOfDay(d, POOL));
  });

  it('cycle sur le pool par jour de l’année', () => {
    // jour 1 → index 1 (1 % 3), jour 3 → index 0, jour 4 → index 1
    expect(verseOfDay(new Date(2026, 0, 1), POOL)).toBe(POOL[1]);
    expect(verseOfDay(new Date(2026, 0, 3), POOL)).toBe(POOL[0]);
    expect(verseOfDay(new Date(2026, 0, 4), POOL)).toBe(POOL[1]);
  });

  it('renvoie toujours un élément du pool', () => {
    for (let day = 0; day < 40; day++) {
      const v = verseOfDay(new Date(2026, 0, day), POOL);
      expect(POOL).toContain(v);
    }
  });
});
