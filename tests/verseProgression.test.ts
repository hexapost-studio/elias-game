import { describe, it, expect } from 'vitest';
import { resolveQuestionType } from '../src/engine/verseProgression';
import type { CodexEntry } from '../src/types/game';

function makeEntry(timesUsed: number, errorCount: number): Record<string, CodexEntry> {
  return {
    'v-test-001': {
      verseId: 'v-test-001',
      unlocked: true,
      timesUsed,
      errorCount,
    },
  };
}

const NEVER_SEEN: Record<string, CodexEntry> = {};

describe('resolveQuestionType', () => {
  it('jamais vu → choice', () => {
    expect(resolveQuestionType('v-test-001', NEVER_SEEN)).toBe('choice');
  });

  it('entrée présente mais timesUsed=0 → choice', () => {
    expect(resolveQuestionType('v-test-001', makeEntry(0, 0))).toBe('choice');
  });

  it('vu 1 fois, 0 erreur, event wordBank-capable → wordBank', () => {
    expect(resolveQuestionType('v-test-001', makeEntry(1, 0), undefined, true)).toBe('wordBank');
  });

  it('vu 1 fois, 0 erreur, SANS capacité wordBank → choice (pas d\'écran vide)', () => {
    expect(resolveQuestionType('v-test-001', makeEntry(1, 0), undefined, false)).toBe('choice');
  });

  it('vu 1 fois, 1 erreur → choice (taux erreur > 50%)', () => {
    expect(resolveQuestionType('v-test-001', makeEntry(1, 1), undefined, true)).toBe('choice');
  });

  it('vu 2 fois, 0 erreur, wordBank-capable → wordBank (successes=2 < 3)', () => {
    expect(resolveQuestionType('v-test-001', makeEntry(2, 0), undefined, true)).toBe('wordBank');
  });

  it('vu 3 fois, 0 erreur → completion', () => {
    expect(resolveQuestionType('v-test-001', makeEntry(3, 0))).toBe('completion');
  });

  it('vu 4 fois, 1 erreur → completion (successes=3)', () => {
    expect(resolveQuestionType('v-test-001', makeEntry(4, 1))).toBe('completion');
  });

  it('vu 5 fois, 0 erreur → reference', () => {
    expect(resolveQuestionType('v-test-001', makeEntry(5, 0))).toBe('reference');
  });

  it('vu 6 fois, 0 erreur → reference', () => {
    expect(resolveQuestionType('v-test-001', makeEntry(6, 0))).toBe('reference');
  });

  it('vu 5 fois, 1 erreur → completion (erreur break reference)', () => {
    expect(resolveQuestionType('v-test-001', makeEntry(5, 1))).toBe('completion');
  });

  it('taux erreur >50% → choice', () => {
    expect(resolveQuestionType('v-test-001', makeEntry(4, 3))).toBe('choice');
  });

  it('authorDefined wordBank honoré DÈS la 1ʳᵉ découverte (jamais vu) si capable', () => {
    // Le fix playtest : sans ça, le mode wordBank conçu à la main n'apparaissait jamais.
    expect(resolveQuestionType('v-test-001', NEVER_SEEN, 'wordBank', true)).toBe('wordBank');
  });

  it('authorDefined wordBank ignoré si l\'event n\'a pas de champ wordBank → choice', () => {
    expect(resolveQuestionType('v-test-001', NEVER_SEEN, 'wordBank', false)).toBe('choice');
  });

  it('authorDefined respecte lors de la 1ere rencontre', () => {
    expect(resolveQuestionType('v-test-001', makeEntry(1, 0), 'wordBank', true)).toBe('wordBank');
  });

  it('authorDefined respecte lors de la 2e rencontre', () => {
    expect(resolveQuestionType('v-test-001', makeEntry(2, 0), 'wordBank', true)).toBe('wordBank');
  });

  it('authorDefined ignore a la 3e rencontre - progression prend le dessus', () => {
    // timesUsed=3, successes=3 → completion même si author dit 'choice'
    expect(resolveQuestionType('v-test-001', makeEntry(3, 0), 'choice')).toBe('completion');
  });

  it('déterministe : même inputs → même output', () => {
    const codex = makeEntry(3, 0);
    const r1 = resolveQuestionType('v-test-001', codex);
    const r2 = resolveQuestionType('v-test-001', codex);
    expect(r1).toBe(r2);
  });
});
