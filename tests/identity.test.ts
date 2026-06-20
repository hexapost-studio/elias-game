/**
 * @file identity.test.ts
 * @description Identité du personnage (itér. 9 / proposition D) — normalisation du nom
 * (défaut « Élias » → zéro régression) et personnalisation narrative.
 */
import { describe, it, expect } from 'vitest';
import { resolvePlayerName, personalize, DEFAULT_NAME, MAX_NAME_LEN } from '../src/engine/identity';
import { createInitialState, applyCrisisGrace, advanceAge } from '../src/engine/gameEngine';
import { generateOpeningVignette } from '../src/engine/opening';
import { mulberry32 } from '../src/engine/rng';
import { CALLINGS } from '../src/data/callings';

describe('resolvePlayerName', () => {
  it('retombe sur le nom par défaut quand vide / nul / blancs', () => {
    expect(resolvePlayerName(undefined)).toBe(DEFAULT_NAME);
    expect(resolvePlayerName(null)).toBe(DEFAULT_NAME);
    expect(resolvePlayerName('')).toBe(DEFAULT_NAME);
    expect(resolvePlayerName('   ')).toBe(DEFAULT_NAME);
  });

  it('trim + compresse les espaces internes', () => {
    expect(resolvePlayerName('  Marie  ')).toBe('Marie');
    expect(resolvePlayerName('Jean   Paul')).toBe('Jean Paul');
  });

  it('borne la longueur', () => {
    const long = 'A'.repeat(MAX_NAME_LEN + 10);
    expect(resolvePlayerName(long).length).toBeLessThanOrEqual(MAX_NAME_LEN);
  });
});

describe('personalize', () => {
  it('est un no-op pour le nom par défaut', () => {
    const t = "Le cœur d'Élias s'est réchauffé. Élias a souri.";
    expect(personalize(t, DEFAULT_NAME)).toBe(t);
  });

  it('substitue le nom et gère l\'élision « d\'Élias »', () => {
    const out = personalize("Le cœur d'Élias s'est réchauffé. Élias a souri.", 'Marie');
    expect(out).toBe('Le cœur de Marie s\'est réchauffé. Marie a souri.');
    expect(out).not.toContain('Élias');
  });
});

describe('intégration createInitialState — nom', () => {
  it('défaut « Élias » sans saisie → zéro régression dans la vignette', () => {
    const s = createInitialState(undefined, 12345);
    expect(s.playerName).toBe(DEFAULT_NAME);
    expect(s.journal[0].text).toContain('Élias');
  });

  it('propage le nom saisi dans la vignette d\'ouverture', () => {
    const s = createInitialState(undefined, 12345, 'Noé');
    expect(s.playerName).toBe('Noé');
    expect(s.journal[0].text).toContain('Noé');
    expect(s.journal[0].text).not.toContain('Élias');
  });

  it('le message de crise (en cours de partie) utilise le nom du joueur', () => {
    const s = createInitialState(undefined, 1, 'Noé');
    const { crisisMessage } = applyCrisisGrace(s, { ...s.stats, foi: 0 });
    expect(crisisMessage).toContain('Noé');
    expect(crisisMessage).not.toContain('Élias');
  });

  it('les jalons d\'âge (en cours de partie) utilisent le nom du joueur', () => {
    const s = { ...createInitialState(undefined, 1, 'Noé'), age: 14 };
    const { newState } = advanceAge(s);
    const milestone = newState.journal.find((e) => e.text.includes('[JALON]'));
    expect(milestone?.text).toContain('Noé');
    expect(milestone?.text).not.toContain('Élias');
  });

  // NB : la ville/les parents viennent encore de Math.random (cf. proposition A — graines
  // partageables, cycle suivant) ; seule la vignette PURE (gabarit + Appel + nom) est seedée.
  it('le nom est injecté de façon déterministe dans la vignette seedée', () => {
    const ctx = { city: 'Béthel', calling: CALLINGS[0], name: 'Noé' };
    const a = generateOpeningVignette(ctx, mulberry32(777));
    const b = generateOpeningVignette(ctx, mulberry32(777));
    expect(a).toBe(b);
    expect(a).toContain('Noé');
    expect(a).not.toMatch(/\{nom\}/);
  });
});
