/**
 * @file reveals.test.ts
 * @description Révélations de capacités — table déclarative + intégration advanceAge.
 */
import { describe, it, expect } from 'vitest';
import { CAPABILITY_REVEALS, revealsAtAge } from '../src/engine/reveals';
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
