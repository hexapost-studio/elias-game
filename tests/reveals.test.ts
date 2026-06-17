/**
 * @file reveals.test.ts
 * @description Révélations de capacités — table déclarative + intégration advanceAge.
 */
import { describe, it, expect } from 'vitest';
import { CAPABILITY_REVEALS, revealsAtAge, revealsUpToAge } from '../src/engine/reveals';
import { createInitialState, advanceAge } from '../src/engine/gameEngine';

describe('revealsAtAge — table déclarative', () => {
  it('chaque âge de révélation est unique (pas de doublon de palier)', () => {
    const ages = CAPABILITY_REVEALS.map((r) => r.age);
    expect(new Set(ages).size).toBe(ages.length);
  });

  it('retourne la révélation pile à l\'âge du palier, rien autour', () => {
    expect(revealsAtAge(8)).toHaveLength(1);
    expect(revealsAtAge(7)).toHaveLength(0);
    expect(revealsAtAge(9)).toHaveLength(0);
  });

  it('un âge sans palier ne révèle rien', () => {
    expect(revealsAtAge(33)).toHaveLength(0);
  });
});

describe('revealsUpToAge — rattrapage du handoff Prologue (itér. 15)', () => {
  it('à 14 ans (départ Prologue) rattrape les paliers déjà actifs : 8 et 10', () => {
    const ups = revealsUpToAge(14);
    expect(ups.map((r) => r.age).sort((a, b) => a - b)).toEqual([8, 10]);
  });

  it('n\'inclut jamais un palier futur (16/51/60) au départ', () => {
    const ages = revealsUpToAge(14).map((r) => r.age);
    expect(ages).not.toContain(16);
    expect(ages).not.toContain(51);
    expect(ages).not.toContain(60);
  });

  it('avant tout palier (âge 7) ne rattrape rien', () => {
    expect(revealsUpToAge(7)).toHaveLength(0);
  });

  it('inclut le palier pile à son âge (borne ≤)', () => {
    expect(revealsUpToAge(8).map((r) => r.age)).toEqual([8]);
  });
});

describe('intégration advanceAge — annonce au palier', () => {
  it('pousse un milestone quand on franchit l\'âge 8 (actions)', () => {
    const state = createInitialState(undefined, 1);
    state.age = 7;
    const { newState } = advanceAge(state);
    expect(newState.age).toBe(8);
    const milestone = newState.journal.find(
      (e) => e.age === 8 && e.type === 'milestone' && e.text.includes('[ÉVEIL]'),
    );
    expect(milestone).toBeTruthy();
  });

  it('n\'annonce rien lors d\'une année ordinaire', () => {
    const state = createInitialState(undefined, 1);
    state.age = 32;
    const before = state.journal.length;
    const { newState } = advanceAge(state);
    const added = newState.journal.slice(before);
    expect(added.some((e) => /\[(ÉVEIL|SAISONS|MÉMOIRE|MAÎTRISE|TRANSMETTRE)\]/.test(e.text)))
      .toBe(false);
  });
});
