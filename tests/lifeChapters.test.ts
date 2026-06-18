/**
 * @file lifeChapters.test.ts
 * @description Tests unitaires du module pur `engine/lifeChapters.ts`.
 *   Couvre : getChapterIntro, getDecadeCliffhanger, isDecadeStart, isDecadeEnd.
 *
 *   Aucun import React — module pur, testable sans jsdom.
 *
 *   @since itér. 41 / T-24
 */
import { describe, it, expect } from 'vitest';
import {
  getChapterIntro,
  getDecadeCliffhanger,
  isDecadeStart,
  isDecadeEnd,
} from '../src/engine/lifeChapters';

/* ─── isDecadeStart ─────────────────────────────────────────────────────── */

describe('isDecadeStart', () => {
  it('retourne true aux multiples de 10 >= 10', () => {
    expect(isDecadeStart(10)).toBe(true);
    expect(isDecadeStart(20)).toBe(true);
    expect(isDecadeStart(30)).toBe(true);
    expect(isDecadeStart(90)).toBe(true);
  });

  it('retourne false à 0', () => {
    expect(isDecadeStart(0)).toBe(false);
  });

  it('retourne false aux âges non multiples de 10', () => {
    expect(isDecadeStart(15)).toBe(false);
    expect(isDecadeStart(9)).toBe(false);
    expect(isDecadeStart(11)).toBe(false);
    expect(isDecadeStart(25)).toBe(false);
  });
});

/* ─── isDecadeEnd ───────────────────────────────────────────────────────── */

describe('isDecadeEnd', () => {
  it('retourne true aux âges X9 < 90', () => {
    expect(isDecadeEnd(9)).toBe(true);
    expect(isDecadeEnd(19)).toBe(true);
    expect(isDecadeEnd(29)).toBe(true);
    expect(isDecadeEnd(79)).toBe(true);
    expect(isDecadeEnd(89)).toBe(true);
  });

  it('retourne false à 99', () => {
    expect(isDecadeEnd(99)).toBe(false);
  });

  it('retourne false aux âges non-X9', () => {
    expect(isDecadeEnd(10)).toBe(false);
    expect(isDecadeEnd(20)).toBe(false);
    expect(isDecadeEnd(50)).toBe(false);
    expect(isDecadeEnd(35)).toBe(false);
  });
});

/* ─── getChapterIntro ───────────────────────────────────────────────────── */

describe('getChapterIntro', () => {
  it('retourne une JournalEntry de type milestone', () => {
    const entry = getChapterIntro(10, 'Désert');
    expect(entry.type).toBe('milestone');
    expect(entry.age).toBe(10);
  });

  it('contient le tag [CHAPITRE]', () => {
    const entry = getChapterIntro(10, 'Désert');
    expect(entry.text).toContain('[CHAPITRE]');
  });

  it('contient le titre de la décennie — La Formation à 10 ans', () => {
    const entry = getChapterIntro(10, 'Désert');
    expect(entry.text).toContain('La Formation');
  });

  it('contient le titre — L\'Éveil à 0 ans (clamp à index 0)', () => {
    // Cas limite : age=0 → index 0
    const entry = getChapterIntro(0, 'Réveil');
    expect(entry.text).toContain("L'Éveil");
  });

  it('contient le titre — L\'Envol à 20 ans', () => {
    const entry = getChapterIntro(20, 'Réveil');
    expect(entry.text).toContain("L'Envol");
  });

  it('contient le titre — Le Combat à 30 ans', () => {
    const entry = getChapterIntro(30, 'Persécution');
    expect(entry.text).toContain('Le Combat');
  });

  it('contient le titre — L\'Épreuve à 40 ans', () => {
    const entry = getChapterIntro(40, 'Désert');
    expect(entry.text).toContain("L'Épreuve");
  });

  it('contient le titre — La Maturité à 50 ans', () => {
    const entry = getChapterIntro(50, 'Abondance');
    expect(entry.text).toContain('La Maturité');
  });

  it('contient le titre — La Sagesse à 60 ans', () => {
    const entry = getChapterIntro(60, 'Grâce');
    expect(entry.text).toContain('La Sagesse');
  });

  it('contient le titre — Le Crépuscule à 70 ans', () => {
    const entry = getChapterIntro(70, 'Désert');
    expect(entry.text).toContain('Le Crépuscule');
  });

  it('contient le titre — L\'Héritage à 80 ans', () => {
    const entry = getChapterIntro(80, 'Abondance');
    expect(entry.text).toContain("L'Héritage");
  });

  it('contient le titre — L\'Accomplissement à 90 ans', () => {
    const entry = getChapterIntro(90, 'Grâce');
    expect(entry.text).toContain("L'Accomplissement");
  });

  it('contient le libellé de la saison — Désert', () => {
    const entry = getChapterIntro(10, 'Désert');
    expect(entry.text).toContain('Désert');
  });

  it('contient le libellé de la saison — Persécution affiché comme Épreuve', () => {
    const entry = getChapterIntro(30, 'Persécution');
    expect(entry.text).toContain('Épreuve');
  });

  it('contient le libellé de la saison — Abondance', () => {
    const entry = getChapterIntro(50, 'Abondance');
    expect(entry.text).toContain('Abondance');
  });

  it('contient l\'âge dans le texte', () => {
    const entry = getChapterIntro(50, 'Abondance');
    expect(entry.text).toContain('50 ans');
  });

  it('accepte un callingId optionnel sans erreur', () => {
    expect(() => getChapterIntro(20, 'Réveil', 'prophete')).not.toThrow();
  });

  it('est toujours cohérent pour l\'âge 100 (clamp)', () => {
    const entry = getChapterIntro(100, 'Grâce');
    expect(entry.text).toContain("L'Accomplissement");
  });
});

/* ─── getDecadeCliffhanger ──────────────────────────────────────────────── */

describe('getDecadeCliffhanger', () => {
  it('retourne null aux âges non-X9', () => {
    expect(getDecadeCliffhanger(10, 'Élias')).toBeNull();
    expect(getDecadeCliffhanger(20, 'Élias')).toBeNull();
    expect(getDecadeCliffhanger(50, 'Élias')).toBeNull();
    expect(getDecadeCliffhanger(35, 'Élias')).toBeNull();
  });

  it('retourne null à 99 ans (trop vieux pour un cliffhanger)', () => {
    expect(getDecadeCliffhanger(99, 'Élias')).toBeNull();
  });

  it('retourne une JournalEntry à 9 ans', () => {
    const entry = getDecadeCliffhanger(9, 'Élias');
    expect(entry).not.toBeNull();
    expect(entry!.type).toBe('milestone');
    expect(entry!.age).toBe(9);
  });

  it('contient le tag [CLIFFHANGER]', () => {
    const entry = getDecadeCliffhanger(9, 'Élias');
    expect(entry!.text).toContain('[CLIFFHANGER]');
  });

  it('contient le nom du joueur dans le texte', () => {
    const entry = getDecadeCliffhanger(29, 'Jonas');
    expect(entry!.text).toContain('Jonas');
  });

  it('utilise Élias comme fallback si nom vide', () => {
    const entry = getDecadeCliffhanger(9, '');
    expect(entry!.text).toContain('Élias');
  });

  it('retourne une entrée aux âges 9, 19, 29, 39, 49, 59, 69, 79, 89', () => {
    const ages = [9, 19, 29, 39, 49, 59, 69, 79, 89];
    for (const age of ages) {
      const entry = getDecadeCliffhanger(age, 'Élias');
      expect(entry, `Cliffhanger attendu à ${age} ans`).not.toBeNull();
      expect(entry!.age).toBe(age);
    }
  });

  it('le texte à 9 ans mentionne L\'Éveil (la décennie qui se termine)', () => {
    const entry = getDecadeCliffhanger(9, 'Élias');
    expect(entry!.text).toContain("L'Éveil");
  });

  it('le texte à 29 ans mentionne L\'Envol', () => {
    const entry = getDecadeCliffhanger(29, 'Élias');
    expect(entry!.text).toContain("L'Envol");
  });

  it('le texte à 59 ans mentionne La Maturité', () => {
    const entry = getDecadeCliffhanger(59, 'Élias');
    expect(entry!.text).toContain('La Maturité');
  });

  it('le texte à 89 ans mentionne L\'Héritage', () => {
    const entry = getDecadeCliffhanger(89, 'Élias');
    expect(entry!.text).toContain("L'Héritage");
  });
});
