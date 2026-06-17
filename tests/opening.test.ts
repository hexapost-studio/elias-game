/**
 * @file opening.test.ts
 * @description Vignette d'ouverture — variété seedée, slots résolus, déterminisme par run.
 */
import { describe, it, expect } from 'vitest';
import { generateOpeningVignette } from '../src/engine/opening';
import { createInitialState } from '../src/engine/gameEngine';
import { mulberry32 } from '../src/engine/rng';
import { CALLINGS } from '../src/data/callings';

const calling = CALLINGS[0];

describe('generateOpeningVignette', () => {
  it('intègre la ville et ne laisse aucun slot non résolu', () => {
    for (let s = 0; s < 20; s++) {
      const out = generateOpeningVignette({ city: 'Béthel', calling }, mulberry32(s));
      expect(out).toContain('Béthel');
      expect(out).not.toMatch(/\{(ville|of|tagline)\}/);
    }
  });

  it('est déterministe pour un même seed', () => {
    const a = generateOpeningVignette({ city: 'Béthel', calling }, mulberry32(42));
    const b = generateOpeningVignette({ city: 'Béthel', calling }, mulberry32(42));
    expect(a).toBe(b);
  });

  it('produit de la variété entre seeds', () => {
    const outs = new Set<string>();
    for (let s = 0; s < 30; s++) {
      outs.add(generateOpeningVignette({ city: 'Béthel', calling }, mulberry32(s)));
    }
    expect(outs.size).toBeGreaterThan(3);
  });
});

describe('intégration createInitialState', () => {
  // NB : depuis l'itér. 10 (proposition A), TOUTE la naissance — vignette, ville, parents,
  // profession, stats — passe par le même `Rng` seedé : même graine = même destinée
  // (déterminisme couvert par tests/seeds.test.ts).
  it('le journal de naissance utilise la vignette et intègre ville + parents', () => {
    const s = createInitialState(undefined, 12345);
    const text = s.journal[0].text;
    expect(text).toContain(s.lifeContext.city);
    expect(text).toContain(s.parentNames.father);
    expect(text).toContain('Élias');
    expect(text.length).toBeGreaterThan(40);
  });

  it('plusieurs créations ouvrent (très probablement) différemment', () => {
    const texts = new Set<string>();
    for (let s = 0; s < 12; s++) texts.add(createInitialState(undefined, s).journal[0].text);
    expect(texts.size).toBeGreaterThan(1);
  });
});
