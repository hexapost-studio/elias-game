/**
 * @file collection.test.ts
 * @description Récompense de collection (itér. 16) — comptage + texte par tier.
 */
import { describe, it, expect } from 'vitest';
import { countUnlocked, collectionRewardText } from '../src/engine/collection';
import type { CodexEntry } from '../src/types/game';

function codexOf(unlockedIds: string[], lockedIds: string[] = []): Record<string, CodexEntry> {
  const codex: Record<string, CodexEntry> = {};
  for (const id of unlockedIds) codex[id] = { verseId: id, unlocked: true, timesUsed: 1, errorCount: 0 };
  for (const id of lockedIds) codex[id] = { verseId: id, unlocked: false, timesUsed: 0, errorCount: 0 };
  return codex;
}

describe('countUnlocked', () => {
  it('ne compte que les versets débloqués', () => {
    expect(countUnlocked(codexOf(['a', 'b'], ['c', 'd', 'e']))).toBe(2);
  });
  it('zéro sur un codex tout verrouillé', () => {
    expect(countUnlocked(codexOf([], ['a', 'b']))).toBe(0);
  });
});

describe('collectionRewardText — tiers', () => {
  const TOTAL = 118;

  it('1er verset → ouverture du Grimoire', () => {
    const txt = collectionRewardText('Psaume 27.1', 1, TOTAL);
    expect(txt).toContain("s'ouvre");
    expect(txt).toContain('Psaume 27.1');
  });

  it('paliers 10 / 25 / 50 → rassemblement marqué', () => {
    for (const n of [10, 25, 50]) {
      const txt = collectionRewardText('Jean 3.16', n, TOTAL);
      expect(txt).toContain(`${n} versets rassemblés`);
    }
  });

  it('Grimoire complet (= total) → fermeture du livre', () => {
    const txt = collectionRewardText('Apocalypse 22.21', TOTAL, TOTAL);
    expect(txt).toContain('COMPLET');
    expect(txt).toContain(String(TOTAL));
  });

  it('entrée ordinaire → progression (n/total)', () => {
    const txt = collectionRewardText('Romains 8.28', 7, TOTAL);
    expect(txt).toContain(`(7/${TOTAL})`);
    expect(txt).not.toContain('rassemblés');
  });
});
