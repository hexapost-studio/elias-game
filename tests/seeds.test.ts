/**
 * @file seeds.test.ts
 * @description Graines partageables (itér. 10 / proposition A) — toute la naissance passe
 * désormais par le `Rng` seedé : même graine = même destinée (monde + stats de départ).
 * Garde anti-régression du moteur de création de partie.
 */
import { describe, it, expect } from 'vitest';
import { createInitialState } from '../src/engine/gameEngine';

/** Empreinte de la naissance pertinente pour le partage (hors champs dérivés/aléa lifetime). */
function birthFingerprint(seed: number, name?: string) {
  const s = createInitialState(undefined, seed, name);
  return JSON.stringify({
    stats: s.stats,
    profileName: s.profileName,
    parents: s.parentNames,
    ctx: s.lifeContext,
    calling: s.calling?.name,
    seed: s.seed,
    playerName: s.playerName,
  });
}

describe('graines partageables — déterminisme de la naissance', () => {
  it('même graine → exactement la même destinée de départ', () => {
    for (const seed of [0, 1, 42, 777, 123456]) {
      expect(birthFingerprint(seed)).toBe(birthFingerprint(seed));
    }
  });

  it('même graine + même nom → identité de départ identique', () => {
    expect(birthFingerprint(2024, 'Noé')).toBe(birthFingerprint(2024, 'Noé'));
  });

  it('le seed est conservé dans l\'état (rejouable/partageable)', () => {
    expect(createInitialState(undefined, 98765).seed).toBe(98765);
  });

  it('des graines différentes produisent (très probablement) des destinées différentes', () => {
    const fps = new Set<string>();
    for (let seed = 0; seed < 24; seed++) fps.add(birthFingerprint(seed));
    // tolérant aux collisions rares, mais la diversité doit être nette
    expect(fps.size).toBeGreaterThan(18);
  });

  it('la ville, les parents et la profession sont désormais déterministes par graine', () => {
    const a = createInitialState(undefined, 555);
    const b = createInitialState(undefined, 555);
    expect(b.lifeContext.city).toBe(a.lifeContext.city);
    expect(b.parentNames.father).toBe(a.parentNames.father);
    expect(b.parentNames.mother).toBe(a.parentNames.mother);
    expect(b.lifeContext.profession).toBe(a.lifeContext.profession);
  });
});
