/**
 * @file echoes.test.ts
 * @description Mémoire narrative à rappels — dérivation + sélection de rappel.
 */
import { describe, it, expect } from 'vitest';
import { deriveEchoes, pickEchoCallback, ECHO_MIN_GAP } from '../src/engine/echoes';
import { mulberry32 } from '../src/engine/rng';
import { TRAITS } from '../src/data/traits';
import { STORY_ARCS } from '../src/data/storyArcs';

describe('deriveEchoes — timeline des moments marquants', () => {
  it('dérive traits + arcs et trie par âge croissant', () => {
    const trait = TRAITS[0].id;
    const arc = STORY_ARCS[0].id;
    const echoes = deriveEchoes({
      traits: [{ id: trait, earnedAtAge: 40 }],
      completedArcs: [{ arcId: arc, completedAtAge: 20 }],
    });
    expect(echoes.map((e) => e.age)).toEqual([20, 40]);
    expect(echoes[0].kind).toBe('arc');
    expect(echoes[1].kind).toBe('trait');
  });

  it('ignore les ids inconnus sans planter', () => {
    const echoes = deriveEchoes({
      traits: [{ id: 'inexistant', earnedAtAge: 10 }],
      completedArcs: [{ arcId: 'inexistant', completedAtAge: 12 }],
    });
    expect(echoes).toHaveLength(0);
  });

  it('tolère un état vide / partiel', () => {
    expect(deriveEchoes({ traits: undefined as never, completedArcs: undefined as never }))
      .toHaveLength(0);
  });
});

describe('pickEchoCallback — rappel avec recul', () => {
  const trait = TRAITS[0].id;
  const echoes = deriveEchoes({
    traits: [{ id: trait, earnedAtAge: 20 }],
    completedArcs: [],
  });

  it('retourne null si aucun écho n\'a assez de recul', () => {
    // Âge trop proche du moment (gap < ECHO_MIN_GAP).
    const out = pickEchoCallback(echoes, 20 + ECHO_MIN_GAP - 1, mulberry32(1));
    expect(out).toBeNull();
  });

  it('produit un rappel quand le recul est suffisant', () => {
    const out = pickEchoCallback(echoes, 20 + ECHO_MIN_GAP + 3, mulberry32(1));
    expect(out).toBeTruthy();
    expect(out).toContain(TRAITS[0].name);
  });

  it('ne laisse aucun slot {label}/{age}/{years} non résolu', () => {
    for (let s = 0; s < 20; s++) {
      const out = pickEchoCallback(echoes, 60, mulberry32(s));
      if (out) expect(out).not.toMatch(/\{(label|age|years)\}/);
    }
  });

  it('est déterministe pour un même seed', () => {
    const a = pickEchoCallback(echoes, 50, mulberry32(7));
    const b = pickEchoCallback(echoes, 50, mulberry32(7));
    expect(a).toBe(b);
  });

  it('liste vide → null', () => {
    expect(pickEchoCallback([], 50, mulberry32(1))).toBeNull();
  });
});
