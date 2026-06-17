/**
 * @file reactions.test.ts
 * @description Réactions de victoire contextuelles — bannière + sous-ligne.
 */
import { describe, it, expect } from 'vitest';
import { pickVictoryBanner, pickVictorySubline } from '../src/engine/reactions';
import { mulberry32 } from '../src/engine/rng';

describe('pickVictoryBanner — selon le combo', () => {
  it('combo épique (≥10) puise dans le palier le plus fort', () => {
    const epic = new Set<string>();
    for (let s = 0; s < 30; s++) epic.add(pickVictoryBanner(12, mulberry32(s)));
    // « VICTOIRE » (palier de base) ne doit jamais sortir en combo épique.
    expect(epic.has('VICTOIRE')).toBe(false);
  });

  it('combo faible reste sur le palier de base', () => {
    const base = pickVictoryBanner(1, mulberry32(3));
    expect(['VICTOIRE', 'SURMONTÉ', 'TENU BON', 'DEBOUT']).toContain(base);
  });

  it('déterministe pour un même seed', () => {
    expect(pickVictoryBanner(6, mulberry32(9))).toBe(pickVictoryBanner(6, mulberry32(9)));
  });

  it('génère de la variété entre seeds', () => {
    const out = new Set<string>();
    for (let s = 0; s < 30; s++) out.add(pickVictoryBanner(1, mulberry32(s)));
    expect(out.size).toBeGreaterThan(1);
  });
});

describe('pickVictorySubline — saveur contextuelle', () => {
  it('renvoie une saveur pour une catégorie connue', () => {
    const out = pickVictorySubline({ category: 'peur_angoisse', combo: 1 }, mulberry32(1));
    expect(out.length).toBeGreaterThan(0);
  });

  it('chaîne vide si catégorie sans saveur dédiée et pas de saison', () => {
    const out = pickVictorySubline({ category: 'obeissance', combo: 1 }, mulberry32(1));
    expect(out).toBe('');
  });

  it('ne plante pas sans catégorie ni saison', () => {
    expect(pickVictorySubline({ combo: 1 }, mulberry32(1))).toBe('');
  });

  it('déterministe pour un même seed', () => {
    const a = pickVictorySubline({ category: 'doute_incredulite', combo: 1, season: 'Désert' }, mulberry32(5));
    const b = pickVictorySubline({ category: 'doute_incredulite', combo: 1, season: 'Désert' }, mulberry32(5));
    expect(a).toBe(b);
  });
});
