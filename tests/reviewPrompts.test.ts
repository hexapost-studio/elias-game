/**
 * @file reviewPrompts.test.ts
 * @description Codex vivant — invites de révision variées, stables par carte, encouragement.
 */
import { describe, it, expect } from 'vitest';
import { reviewPromptsFor } from '../src/engine/reviewPrompts';
import { hashSeed } from '../src/engine/rng';
import type { AfflictionCategory } from '../src/types/game';

const CATS: AfflictionCategory[] = [
  'peur_angoisse', 'impudicite_addiction', 'finances_paresse', 'amertume_rejet',
  'combat_spirituel', 'identite_appel', 'doute_incredulite', 'orgueil_independance',
];

describe('reviewPromptsFor', () => {
  it('est stable pour une même carte (pas de clignotement au re-render)', () => {
    const a = reviewPromptsFor('verse-42', 'peur_angoisse');
    const b = reviewPromptsFor('verse-42', 'peur_angoisse');
    expect(a).toEqual(b);
  });

  it('remplit les trois invites de façon non vide', () => {
    const p = reviewPromptsFor('verse-7', 'doute_incredulite');
    expect(p.revealPrompt.length).toBeGreaterThan(0);
    expect(p.reciteHint.length).toBeGreaterThan(0);
    expect(p.encouragement.length).toBeGreaterThan(0);
  });

  it('produit de la variété entre cartes', () => {
    const reveals = new Set<string>();
    const encs = new Set<string>();
    for (let i = 0; i < 40; i++) {
      const p = reviewPromptsFor(`v-${i}`, CATS[i % CATS.length]);
      reveals.add(p.revealPrompt);
      encs.add(p.encouragement);
    }
    expect(reveals.size).toBeGreaterThan(1);
    expect(encs.size).toBeGreaterThan(3);
  });

  it('toute catégorie connue donne un encouragement (fallback générique sinon)', () => {
    for (const cat of CATS) {
      const p = reviewPromptsFor('vx', cat);
      expect(p.encouragement.length).toBeGreaterThan(0);
    }
  });
});

describe('hashSeed', () => {
  it('est déterministe et renvoie un entier 32 bits non signé', () => {
    expect(hashSeed('abc')).toBe(hashSeed('abc'));
    const h = hashSeed('elias');
    expect(Number.isInteger(h)).toBe(true);
    expect(h).toBeGreaterThanOrEqual(0);
    expect(h).toBeLessThanOrEqual(0xffffffff);
  });

  it('distingue des chaînes différentes', () => {
    expect(hashSeed('verse-1')).not.toBe(hashSeed('verse-2'));
  });
});
