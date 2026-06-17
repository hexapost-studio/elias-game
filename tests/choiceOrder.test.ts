/**
 * @file choiceOrder.test.ts
 * @description Ordre déterministe des propositions (itér. 26) — mélange seedé extrait
 *   de `DebugView` pour dériver l'ordre au rendu (plus de setState dans l'effet).
 */
import { describe, it, expect } from 'vitest';
import { seededShuffle, shuffledChoiceIds } from '../src/engine/choiceOrder';

describe('seededShuffle — déterminisme & conservation', () => {
  it('même seed → même ordre', () => {
    const a = seededShuffle([1, 2, 3, 4, 5], 42);
    const b = seededShuffle([1, 2, 3, 4, 5], 42);
    expect(a).toEqual(b);
  });

  it('seeds différents → ordres (en général) différents', () => {
    const a = seededShuffle([1, 2, 3, 4, 5, 6, 7, 8], 1);
    const b = seededShuffle([1, 2, 3, 4, 5, 6, 7, 8], 999);
    expect(a).not.toEqual(b);
  });

  it('conserve tous les éléments (permutation)', () => {
    const src = ['a', 'b', 'c', 'd'];
    const out = seededShuffle(src, 7);
    expect([...out].sort()).toEqual([...src].sort());
    expect(out).toHaveLength(src.length);
  });

  it('ne mute pas l’entrée', () => {
    const src = [1, 2, 3];
    seededShuffle(src, 3);
    expect(src).toEqual([1, 2, 3]);
  });
});

describe('shuffledChoiceIds — stable par événement', () => {
  it('inclut le correct + tous les leurres', () => {
    const out = shuffledChoiceIds('evt-1', 'v-correct', ['v-a', 'v-b', 'v-c']);
    expect([...out].sort()).toEqual(['v-a', 'v-b', 'v-c', 'v-correct'].sort());
  });

  it('même id d’événement → même ordre (stable durant l’affichage)', () => {
    const a = shuffledChoiceIds('evt-x', 'c', ['d1', 'd2', 'd3']);
    const b = shuffledChoiceIds('evt-x', 'c', ['d1', 'd2', 'd3']);
    expect(a).toEqual(b);
  });
});
