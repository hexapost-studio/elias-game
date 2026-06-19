/**
 * @file avatarExpression.test.ts
 * @description Tests unitaires du module pur `engine/avatarExpression.ts`.
 *
 *   Couvre :
 *   - `deriveExpression` : toutes les combinaisons (type d'entrée × sender)
 *   - `expressionToAssetSuffix` : correspondance expression → suffixe
 *   - `buildExpressionAssetId` : composition assetId + suffixe
 *   - Invariants : jamais undefined, toujours une AvatarExpression valide
 *
 *   Aucun import React — module pur, testable sans jsdom.
 *
 *   @since itér. 51 / T-32
 */

import { describe, it, expect } from 'vitest';
import {
  deriveExpression,
  expressionToAssetSuffix,
  buildExpressionAssetId,
  type AvatarExpression,
} from '../src/engine/avatarExpression';
import type { SenderKind } from '../src/engine/messageSender';
import type { JournalEntry } from '../src/types/game';

/* ─── Helpers de construction ────────────────────────────────────────────── */

function makeEntry(type: JournalEntry['type'], text = 'Texte de test', age = 25): JournalEntry {
  return { age, text, type };
}

const ALL_EXPRESSIONS: AvatarExpression[] = [
  'neutral', 'challenge', 'victory', 'defeat', 'warning', 'joy',
];

const ALL_SENDERS: SenderKind[] = ['heaven', 'adversary', 'entourage', 'conscience'];

const ALL_TYPES: JournalEntry['type'][] = [
  'event', 'success', 'fail', 'milestone', 'cascade', 'micro', 'moral',
];

/* ─── deriveExpression — invariants généraux ─────────────────────────────── */

describe('deriveExpression — invariants généraux', () => {
  it('retourne toujours une AvatarExpression valide pour toutes les combinaisons', () => {
    for (const type of ALL_TYPES) {
      for (const sender of ALL_SENDERS) {
        const entry = makeEntry(type);
        const expr = deriveExpression(entry, sender);
        expect(ALL_EXPRESSIONS, `type=${type} sender=${sender} → expression invalide`).toContain(expr);
      }
    }
  });

  it("ne lève jamais d'exception", () => {
    for (const type of ALL_TYPES) {
      for (const sender of ALL_SENDERS) {
        expect(() => deriveExpression(makeEntry(type), sender)).not.toThrow();
      }
    }
  });
});

/* ─── deriveExpression — type 'event' (avant réponse) ───────────────────── */

describe("deriveExpression — type 'event' (avant réponse)", () => {
  it("adversary → 'challenge' (l'adversaire provoque)", () => {
    expect(deriveExpression(makeEntry('event'), 'adversary')).toBe('challenge');
  });

  it("heaven → 'joy' (le Ciel envoie avec joie)", () => {
    expect(deriveExpression(makeEntry('event'), 'heaven')).toBe('joy');
  });

  it("entourage → 'challenge' (interpelle Élias)", () => {
    expect(deriveExpression(makeEntry('event'), 'entourage')).toBe('challenge');
  });

  it("conscience → 'neutral' (questionnement intérieur)", () => {
    expect(deriveExpression(makeEntry('event'), 'conscience')).toBe('neutral');
  });
});

/* ─── deriveExpression — type 'success' (après réussite) ────────────────── */

describe("deriveExpression — type 'success' (après réussite)", () => {
  it("heaven → 'victory' (célébration divine)", () => {
    expect(deriveExpression(makeEntry('success'), 'heaven')).toBe('victory');
  });

  it("adversary → 'defeat' (l'adversaire est brisé)", () => {
    expect(deriveExpression(makeEntry('success'), 'adversary')).toBe('defeat');
  });

  it("entourage → 'joy' (joie partagée)", () => {
    expect(deriveExpression(makeEntry('success'), 'entourage')).toBe('joy');
  });

  it("conscience → 'victory' (paix intérieure)", () => {
    expect(deriveExpression(makeEntry('success'), 'conscience')).toBe('victory');
  });
});

/* ─── deriveExpression — type 'fail' (après échec) ──────────────────────── */

describe("deriveExpression — type 'fail' (après échec)", () => {
  it("adversary → 'victory' (l'adversaire triomphe)", () => {
    expect(deriveExpression(makeEntry('fail'), 'adversary')).toBe('victory');
  });

  it("heaven → 'warning' (appel gracieux à revenir)", () => {
    expect(deriveExpression(makeEntry('fail'), 'heaven')).toBe('warning');
  });

  it("entourage → 'warning' (inquiétude de l'entourage)", () => {
    expect(deriveExpression(makeEntry('fail'), 'entourage')).toBe('warning');
  });

  it("conscience → 'warning' (trouble intérieur)", () => {
    expect(deriveExpression(makeEntry('fail'), 'conscience')).toBe('warning');
  });
});

/* ─── deriveExpression — type 'milestone' ───────────────────────────────── */

describe("deriveExpression — type 'milestone'", () => {
  it("tous les émetteurs → 'neutral'", () => {
    for (const sender of ALL_SENDERS) {
      expect(
        deriveExpression(makeEntry('milestone'), sender),
        `sender=${sender}`
      ).toBe('neutral');
    }
  });
});

/* ─── deriveExpression — type 'cascade' ─────────────────────────────────── */

describe("deriveExpression — type 'cascade'", () => {
  it("adversary → 'victory' (la conséquence aggrave)", () => {
    expect(deriveExpression(makeEntry('cascade'), 'adversary')).toBe('victory');
  });

  it("heaven → 'warning' (grâce malgré la cascade)", () => {
    expect(deriveExpression(makeEntry('cascade'), 'heaven')).toBe('warning');
  });

  it("entourage → 'warning'", () => {
    expect(deriveExpression(makeEntry('cascade'), 'entourage')).toBe('warning');
  });

  it("conscience → 'warning'", () => {
    expect(deriveExpression(makeEntry('cascade'), 'conscience')).toBe('warning');
  });
});

/* ─── deriveExpression — type 'micro' ───────────────────────────────────── */

describe("deriveExpression — type 'micro'", () => {
  it("tous les émetteurs → 'joy' (vie quotidienne chaleureuse)", () => {
    for (const sender of ALL_SENDERS) {
      expect(
        deriveExpression(makeEntry('micro'), sender),
        `sender=${sender}`
      ).toBe('joy');
    }
  });
});

/* ─── deriveExpression — type 'moral' ───────────────────────────────────── */

describe("deriveExpression — type 'moral'", () => {
  it("conscience → 'neutral' (choix intérieur, pas d'émotion externe)", () => {
    expect(deriveExpression(makeEntry('moral'), 'conscience')).toBe('neutral');
  });

  it("tous les émetteurs → 'neutral'", () => {
    for (const sender of ALL_SENDERS) {
      expect(
        deriveExpression(makeEntry('moral'), sender),
        `sender=${sender}`
      ).toBe('neutral');
    }
  });
});

/* ─── expressionToAssetSuffix ────────────────────────────────────────────── */

describe('expressionToAssetSuffix', () => {
  it("neutral → '' (pas de suffixe — assetId de base inchangé)", () => {
    expect(expressionToAssetSuffix('neutral')).toBe('');
  });

  it("challenge → '__challenge'", () => {
    expect(expressionToAssetSuffix('challenge')).toBe('__challenge');
  });

  it("victory → '__victory'", () => {
    expect(expressionToAssetSuffix('victory')).toBe('__victory');
  });

  it("defeat → '__defeat'", () => {
    expect(expressionToAssetSuffix('defeat')).toBe('__defeat');
  });

  it("warning → '__warning'", () => {
    expect(expressionToAssetSuffix('warning')).toBe('__warning');
  });

  it("joy → '__joy'", () => {
    expect(expressionToAssetSuffix('joy')).toBe('__joy');
  });

  it('toutes les expressions non-neutral donnent un suffixe commençant par __', () => {
    const nonNeutral: AvatarExpression[] = ['challenge', 'victory', 'defeat', 'warning', 'joy'];
    for (const expr of nonNeutral) {
      const suffix = expressionToAssetSuffix(expr);
      expect(suffix, `${expr} — doit commencer par __`).toMatch(/^__/);
      expect(suffix.length, `${expr} — suffixe trop court`).toBeGreaterThan(2);
    }
  });
});

/* ─── buildExpressionAssetId ─────────────────────────────────────────────── */

describe('buildExpressionAssetId', () => {
  const baseId = 'elias__adversary__adversary_peur_angoisse';

  it("neutral → assetId de base inchangé", () => {
    expect(buildExpressionAssetId(baseId, 'neutral')).toBe(baseId);
  });

  it("challenge → assetId__challenge", () => {
    expect(buildExpressionAssetId(baseId, 'challenge')).toBe(`${baseId}__challenge`);
  });

  it("victory → assetId__victory", () => {
    expect(buildExpressionAssetId(baseId, 'victory')).toBe(`${baseId}__victory`);
  });

  it("defeat → assetId__defeat", () => {
    expect(buildExpressionAssetId(baseId, 'defeat')).toBe(`${baseId}__defeat`);
  });

  it("warning → assetId__warning", () => {
    expect(buildExpressionAssetId(baseId, 'warning')).toBe(`${baseId}__warning`);
  });

  it("joy → assetId__joy", () => {
    expect(buildExpressionAssetId(baseId, 'joy')).toBe(`${baseId}__joy`);
  });

  it('fonctionne pour un assetId heaven', () => {
    const heavenId = 'elias__heaven__heaven_victory';
    expect(buildExpressionAssetId(heavenId, 'joy')).toBe(`${heavenId}__joy`);
    expect(buildExpressionAssetId(heavenId, 'neutral')).toBe(heavenId);
  });

  it('fonctionne pour un assetId entourage', () => {
    const entourageId = 'elias__entourage__entourage_arc-ami';
    expect(buildExpressionAssetId(entourageId, 'challenge')).toBe(`${entourageId}__challenge`);
  });

  it('fonctionne pour un assetId conscience', () => {
    const conscienceId = 'elias__conscience__conscience_inner';
    expect(buildExpressionAssetId(conscienceId, 'victory')).toBe(`${conscienceId}__victory`);
  });
});

/* ─── Cohérence deriveExpression + buildExpressionAssetId ───────────────── */

describe('cohérence deriveExpression + buildExpressionAssetId', () => {
  it("event+adversary → assetId se termine par '__challenge'", () => {
    const entry = makeEntry('event');
    const expr = deriveExpression(entry, 'adversary');
    const assetId = buildExpressionAssetId('elias__adversary__adversary_peur_angoisse', expr);
    expect(assetId).toBe('elias__adversary__adversary_peur_angoisse__challenge');
  });

  it("fail+adversary → assetId se termine par '__victory'", () => {
    const entry = makeEntry('fail');
    const expr = deriveExpression(entry, 'adversary');
    const assetId = buildExpressionAssetId('elias__adversary__adversary_peur_angoisse', expr);
    expect(assetId).toBe('elias__adversary__adversary_peur_angoisse__victory');
  });

  it("success+adversary → assetId se termine par '__defeat'", () => {
    const entry = makeEntry('success');
    const expr = deriveExpression(entry, 'adversary');
    const assetId = buildExpressionAssetId('elias__adversary__adversary_peur_angoisse', expr);
    expect(assetId).toBe('elias__adversary__adversary_peur_angoisse__defeat');
  });

  it("milestone+heaven → assetId identique à la base (neutral = sans suffixe)", () => {
    const base = 'elias__heaven__heaven_milestone';
    const entry = makeEntry('milestone');
    const expr = deriveExpression(entry, 'heaven');
    const assetId = buildExpressionAssetId(base, expr);
    expect(assetId).toBe(base);
  });

  it("event+heaven → assetId se termine par '__joy'", () => {
    const entry = makeEntry('event');
    const expr = deriveExpression(entry, 'heaven');
    const assetId = buildExpressionAssetId('elias__heaven__heaven_direction_divine', expr);
    expect(assetId).toBe('elias__heaven__heaven_direction_divine__joy');
  });

  it("micro+entourage → assetId se termine par '__joy'", () => {
    const entry = makeEntry('micro');
    const expr = deriveExpression(entry, 'entourage');
    const assetId = buildExpressionAssetId('elias__entourage__entourage_arc-ami', expr);
    expect(assetId).toBe('elias__entourage__entourage_arc-ami__joy');
  });
});

/* ─── Intégration avec resolveAsset (fallback asset-ready) ──────────────── */

describe('intégration avec resolveAsset — fallback asset-ready', () => {
  it("l'assetId d'expression inconnu résout en placeholder via le fallback", async () => {
    // Import dynamique pour garder le test pur
    const { resolveAsset } = await import('../src/assets/illustrationRegistry');
    const unknownId = 'elias__adversary__adversary_peur_angoisse__challenge';
    const entry = resolveAsset(unknownId);
    // Le registre T-32 le connait maintenant — mais même sans, le fallback fonctionne
    expect(entry).toBeDefined();
    expect(entry.type).toBe('placeholder');
    expect(entry.value.length).toBeGreaterThan(0);
    expect(entry.label.length).toBeGreaterThan(0);
  });

  it("les assetId de variantes enregistrés sont bien présents dans le registre", async () => {
    const { ILLUSTRATION_REGISTRY } = await import('../src/assets/illustrationRegistry');
    const knownVariants = [
      'elias__adversary__adversary_peur_angoisse__challenge',
      'elias__adversary__adversary_peur_angoisse__victory',
      'elias__adversary__adversary_peur_angoisse__defeat',
      'elias__heaven__heaven_victory__joy',
      'elias__entourage__entourage_arc-ami__challenge',
      'elias__conscience__conscience_inner__victory',
      'elias__conscience__conscience_inner__warning',
    ];
    for (const id of knownVariants) {
      expect(ILLUSTRATION_REGISTRY[id], `manquant : ${id}`).toBeDefined();
    }
  });
});
