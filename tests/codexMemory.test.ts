import { describe, it, expect } from 'vitest';
import { mergeCodex } from '../src/engine/codexMemory';
import type { CodexEntry } from '../src/types/game';

/**
 * mergeCodex (itér.84) — accumulation de l'apprentissage du codex ENTRE les vies.
 * Sémantique : unlocked = OR, timesUsed/errorCount = max, pur & idempotent.
 */
function e(verseId: string, over: Partial<CodexEntry> = {}): CodexEntry {
  return { verseId, unlocked: false, timesUsed: 0, errorCount: 0, ...over };
}

describe('codexMemory.mergeCodex (itér.84)', () => {
  it('accumule timesUsed/errorCount par max et unlocked par OR', () => {
    const base = { v1: e('v1', { unlocked: true, timesUsed: 5, errorCount: 2 }) };
    const inc = { v1: e('v1', { unlocked: false, timesUsed: 7, errorCount: 1 }) };
    const out = mergeCodex(base, inc);
    expect(out.v1.timesUsed).toBe(7);
    expect(out.v1.errorCount).toBe(2);
    expect(out.v1.unlocked).toBe(true);
  });

  it('ajoute les versets présents seulement dans incoming', () => {
    const base = { v1: e('v1', { timesUsed: 3 }) };
    const inc = { v2: e('v2', { unlocked: true, timesUsed: 1 }) };
    const out = mergeCodex(base, inc);
    expect(out.v1.timesUsed).toBe(3);
    expect(out.v2.unlocked).toBe(true);
    expect(out.v2.timesUsed).toBe(1);
  });

  it('est idempotent : merge(a, a) == a', () => {
    const a = { v1: e('v1', { unlocked: true, timesUsed: 4, errorCount: 1, lastErrorAge: 30 }) };
    const out = mergeCodex(a, a);
    expect(out.v1).toEqual(a.v1);
  });

  it('est ordre-indépendant : merge(merge({},A),B) accumule comme merge(merge({},B),A)', () => {
    const A = { v1: e('v1', { timesUsed: 2, errorCount: 1 }) };
    const B = { v1: e('v1', { unlocked: true, timesUsed: 5, errorCount: 0 }) };
    const ab = mergeCodex(mergeCodex({}, A), B);
    const ba = mergeCodex(mergeCodex({}, B), A);
    expect(ab.v1).toEqual(ba.v1);
    expect(ab.v1.timesUsed).toBe(5);
    expect(ab.v1.errorCount).toBe(1);
    expect(ab.v1.unlocked).toBe(true);
  });

  it('incoming null/undefined → base inchangée', () => {
    const base = { v1: e('v1', { timesUsed: 3 }) };
    expect(mergeCodex(base, null)).toBe(base);
    expect(mergeCodex(base, undefined)).toBe(base);
  });

  it('ne mute pas les objets d\'entrée', () => {
    const base = { v1: e('v1', { timesUsed: 5 }) };
    const inc = { v1: e('v1', { timesUsed: 9 }) };
    const snapBase = JSON.stringify(base);
    const snapInc = JSON.stringify(inc);
    mergeCodex(base, inc);
    expect(JSON.stringify(base)).toBe(snapBase);
    expect(JSON.stringify(inc)).toBe(snapInc);
  });

  it('lastErrorAge absent des deux côtés → omis (pas de 0 parasite)', () => {
    const out = mergeCodex({ v1: e('v1') }, { v1: e('v1', { timesUsed: 1 }) });
    expect(out.v1.lastErrorAge).toBeUndefined();
  });
});
