/**
 * @file statFloats.test.ts
 * @description Logique pure des indicateurs flottants `+N/-N` des jauges (itér. 23).
 *   Extraite de `StatBar` pour être testée hors React et garder le composant en simple
 *   mappeur (invariant 2).
 */
import { describe, it, expect } from 'vitest';
import {
  STAT_KEYS,
  emptyFloatMap,
  diffStatFloats,
  addFloats,
  removeFloat,
} from '../src/engine/statFloats';
import type { StatName } from '../src/types/game';

function stats(p: Partial<Record<StatName, number>> = {}): Record<StatName, number> {
  return { foi: 50, paix: 50, physique: 50, finances: 50, ...p };
}

// Générateur d'ids déterministe pour les tests.
function counter() {
  let n = 0;
  return () => ++n;
}

describe('diffStatFloats — détection de transitions', () => {
  it('aucun changement → aucune entrée', () => {
    expect(diffStatFloats(stats(), stats(), counter())).toEqual([]);
  });

  it('une stat en hausse → un float positif', () => {
    const out = diffStatFloats(stats(), stats({ foi: 57 }), counter());
    expect(out).toEqual([['foi', { id: 1, delta: 7 }]]);
  });

  it('une stat en baisse → un float négatif', () => {
    const out = diffStatFloats(stats(), stats({ paix: 38 }), counter());
    expect(out).toEqual([['paix', { id: 1, delta: -12 }]]);
  });

  it('plusieurs stats changent → une entrée chacune, ids distincts', () => {
    const out = diffStatFloats(
      stats(),
      stats({ foi: 60, finances: 40 }),
      counter(),
    );
    expect(out).toEqual([
      ['foi', { id: 1, delta: 10 }],
      ['finances', { id: 2, delta: -10 }],
    ]);
  });
});

describe('addFloats / removeFloat — gestion immutable de la map', () => {
  it('emptyFloatMap est vide pour toutes les stats', () => {
    const m = emptyFloatMap();
    for (const k of STAT_KEYS) expect(m[k]).toEqual([]);
  });

  it('addFloats ajoute sans muter l’original', () => {
    const base = emptyFloatMap();
    const next = addFloats(base, [['foi', { id: 1, delta: 5 }]]);
    expect(next.foi).toEqual([{ id: 1, delta: 5 }]);
    expect(base.foi).toEqual([]); // immutabilité
  });

  it('addFloats sans entrée renvoie la même référence', () => {
    const base = emptyFloatMap();
    expect(addFloats(base, [])).toBe(base);
  });

  it('removeFloat retire par (stat, id) et préserve le reste', () => {
    let m = addFloats(emptyFloatMap(), [
      ['foi', { id: 1, delta: 5 }],
      ['foi', { id: 2, delta: -3 }],
    ]);
    m = removeFloat(m, 'foi', 1);
    expect(m.foi).toEqual([{ id: 2, delta: -3 }]);
  });
});
