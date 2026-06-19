/**
 * @file illustrationRegistry.test.ts
 * @description Tests unitaires du module pur `assets/illustrationRegistry.ts`.
 *
 *   Couvre :
 *   - La présence de toutes les entrées générées par messageSender.ts
 *   - Le type 'placeholder' sur toutes les entrées actuelles
 *   - La structure valide de chaque IllustrationEntry
 *   - La fonction resolveAsset (résolution + fallbacks)
 *   - Les invariants asset-ready (jamais undefined, toujours un label non vide)
 *
 *   Aucun import React — module pur, testable sans jsdom.
 *
 *   @since itér. 50 / T-31
 */

import { describe, it, expect } from 'vitest';
import {
  ILLUSTRATION_REGISTRY,
  resolveAsset,
  type IllustrationEntry,
} from '../src/assets/illustrationRegistry';

/* ─── Helper de validation d'une entrée ─────────────────────────────────── */

function assertValidEntry(entry: IllustrationEntry, context: string): void {
  // type valide
  expect(['placeholder', 'image', 'svg']).toContain(entry.type);
  // value non vide
  expect(entry.value.length, `${context} — value vide`).toBeGreaterThan(0);
  // label non vide
  expect(entry.label.length, `${context} — label vide`).toBeGreaterThan(0);
}

function assertPlaceholderHex(entry: IllustrationEntry, context: string): void {
  expect(entry.type, `${context} — type`).toBe('placeholder');
  // value est une couleur hex CSS (#xxx ou #xxxxxx)
  expect(entry.value, `${context} — couleur hex`).toMatch(/^#[0-9a-fA-F]{3,8}$/);
}

/* ─── Structure du registre ─────────────────────────────────────────────── */

describe('ILLUSTRATION_REGISTRY — structure générale', () => {
  it('est un objet non vide', () => {
    expect(typeof ILLUSTRATION_REGISTRY).toBe('object');
    expect(Object.keys(ILLUSTRATION_REGISTRY).length).toBeGreaterThan(0);
  });

  it('toutes les clés commencent par "elias__"', () => {
    for (const key of Object.keys(ILLUSTRATION_REGISTRY)) {
      expect(key, `clé invalide : ${key}`).toMatch(/^elias__/);
    }
  });

  it('chaque entrée est une IllustrationEntry valide', () => {
    for (const [key, entry] of Object.entries(ILLUSTRATION_REGISTRY)) {
      assertValidEntry(entry, key);
    }
  });

  it('toutes les entrées actuelles sont des placeholders avec couleur hex', () => {
    for (const [key, entry] of Object.entries(ILLUSTRATION_REGISTRY)) {
      assertPlaceholderHex(entry, key);
    }
  });
});

/* ─── Couverture Heaven ──────────────────────────────────────────────────── */

describe('ILLUSTRATION_REGISTRY — émetteur heaven', () => {
  const heavenKeys = [
    'elias__heaven__heaven_saint_esprit',
    'elias__heaven__heaven_parole_de_dieu',
    'elias__heaven__heaven_amour_de_dieu',
    'elias__heaven__heaven_direction_divine',
    'elias__heaven__heaven_priere',
    'elias__heaven__heaven_soif_de_dieu',
    'elias__heaven__heaven_obeissance',
    'elias__heaven__heaven_identite_appel',
    'elias__heaven__heaven_abondance_financiere',
    'elias__heaven__heaven_victory',
    'elias__heaven__heaven_milestone',
  ];

  for (const key of heavenKeys) {
    it(`présent : ${key}`, () => {
      const entry = ILLUSTRATION_REGISTRY[key];
      expect(entry, `manquant : ${key}`).toBeDefined();
      assertValidEntry(entry!, key);
    });
  }

  it('toutes les entrées heaven ont une couleur différente du rouge adversaire', () => {
    const adversaryRed = '#ef4444';
    for (const key of heavenKeys) {
      const entry = ILLUSTRATION_REGISTRY[key];
      expect(entry?.value, `${key} — couleur inattendue`).not.toBe(adversaryRed);
    }
  });
});

/* ─── Couverture Adversary ───────────────────────────────────────────────── */

describe('ILLUSTRATION_REGISTRY — émetteur adversary', () => {
  const adversaryKeys = [
    'elias__adversary__adversary_peur_angoisse',
    'elias__adversary__adversary_impudicite_addiction',
    'elias__adversary__adversary_finances_paresse',
    'elias__adversary__adversary_amertume_rejet',
    'elias__adversary__adversary_combat_spirituel',
    'elias__adversary__adversary_doute_incredulite',
    'elias__adversary__adversary_orgueil_independance',
    'elias__adversary__adversary_culpabilite',
    'elias__adversary__adversary_sterilite',
    'elias__adversary__adversary_maladie_guerison',
    'elias__adversary__adversary_echec_reussite',
    'elias__adversary__adversary_tristesse_joie',
    'elias__adversary__adversary_decouragement',
    'elias__adversary__adversary_lourdeur_fatigue',
    'elias__adversary__adversary_generic',
    'elias__adversary__adversary_cascade',
  ];

  for (const key of adversaryKeys) {
    it(`présent : ${key}`, () => {
      const entry = ILLUSTRATION_REGISTRY[key];
      expect(entry, `manquant : ${key}`).toBeDefined();
      assertValidEntry(entry!, key);
    });
  }

  it('16 entrées adversary au total', () => {
    const count = Object.keys(ILLUSTRATION_REGISTRY).filter(k => k.includes('__adversary__')).length;
    expect(count).toBe(16);
  });
});

/* ─── Couverture Entourage ───────────────────────────────────────────────── */

describe('ILLUSTRATION_REGISTRY — émetteur entourage', () => {
  const entourageKeys = [
    'elias__entourage__entourage_arc-ami',
    'elias__entourage__entourage_arc-parents',
    'elias__entourage__entourage_arc-eglise',
    'elias__entourage__entourage_arc-metier',
    'elias__entourage__entourage_arc-ville',
    'elias__entourage__entourage_arc-conjoint',
    'elias__entourage__entourage_arc-mathias',
    'elias__entourage__entourage_arc-heritage',
    'elias__entourage__entourage_arc-louise',
  ];

  for (const key of entourageKeys) {
    it(`présent : ${key}`, () => {
      const entry = ILLUSTRATION_REGISTRY[key];
      expect(entry, `manquant : ${key}`).toBeDefined();
      assertValidEntry(entry!, key);
    });
  }

  it('9 entrées entourage (un arc par entrée)', () => {
    const count = Object.keys(ILLUSTRATION_REGISTRY).filter(k => k.includes('__entourage__')).length;
    expect(count).toBe(9);
  });

  it('les labels entourage sont des noms lisibles (pas des identifiants)', () => {
    const entry = ILLUSTRATION_REGISTRY['elias__entourage__entourage_arc-ami'];
    expect(entry?.label).toBe('Ton ami');
    const entryEglise = ILLUSTRATION_REGISTRY['elias__entourage__entourage_arc-eglise'];
    expect(entryEglise?.label).toBe("L'église");
  });
});

/* ─── Couverture Conscience ──────────────────────────────────────────────── */

describe('ILLUSTRATION_REGISTRY — émetteur conscience', () => {
  it('elias__conscience__conscience_inner est présent', () => {
    const entry = ILLUSTRATION_REGISTRY['elias__conscience__conscience_inner'];
    expect(entry).toBeDefined();
    assertValidEntry(entry!, 'conscience_inner');
    expect(entry!.label).toBe('Ta conscience');
  });

  it('couleur conscience distincte des autres émetteurs', () => {
    const conscience = ILLUSTRATION_REGISTRY['elias__conscience__conscience_inner'];
    const heaven = ILLUSTRATION_REGISTRY['elias__heaven__heaven_victory'];
    const adversary = ILLUSTRATION_REGISTRY['elias__adversary__adversary_generic'];
    expect(conscience?.value).not.toBe(heaven?.value);
    expect(conscience?.value).not.toBe(adversary?.value);
  });
});

/* ─── resolveAsset — résolution directe ─────────────────────────────────── */

describe('resolveAsset — résolution directe', () => {
  it('assetId connu → entrée du registre', () => {
    const entry = resolveAsset('elias__adversary__adversary_peur_angoisse');
    assertValidEntry(entry, 'peur_angoisse');
    expect(entry.label).toBe('La Peur');
    expect(entry.value).toBe('#8b5cf6');
  });

  it('assetId heaven_victory → label victoire', () => {
    const entry = resolveAsset('elias__heaven__heaven_victory');
    expect(entry.label).toBe('Victoire spirituelle');
  });

  it('assetId entourage arc-louise → label Louise', () => {
    const entry = resolveAsset('elias__entourage__entourage_arc-louise');
    expect(entry.label).toBe('Louise');
  });

  it('assetId conscience → label Ta conscience', () => {
    const entry = resolveAsset('elias__conscience__conscience_inner');
    expect(entry.label).toBe('Ta conscience');
  });
});

/* ─── resolveAsset — fallbacks ───────────────────────────────────────────── */

describe('resolveAsset — fallbacks (assetId inconnu)', () => {
  it('assetId inconnu avec préfixe heaven → placeholder or', () => {
    const entry = resolveAsset('elias__heaven__heaven_futur_categorie');
    assertValidEntry(entry, 'fallback heaven');
    expect(entry.type).toBe('placeholder');
    expect(entry.value).toMatch(/^#[0-9a-fA-F]{3,8}$/);
  });

  it('assetId inconnu avec préfixe adversary → placeholder', () => {
    const entry = resolveAsset('elias__adversary__adversary_nouvelle_affliction');
    assertValidEntry(entry, 'fallback adversary');
    expect(entry.type).toBe('placeholder');
  });

  it('assetId inconnu avec préfixe entourage → placeholder', () => {
    const entry = resolveAsset('elias__entourage__entourage_arc-futur');
    assertValidEntry(entry, 'fallback entourage');
    expect(entry.type).toBe('placeholder');
  });

  it('assetId inconnu avec préfixe conscience → placeholder', () => {
    const entry = resolveAsset('elias__conscience__conscience_futur');
    assertValidEntry(entry, 'fallback conscience');
    expect(entry.type).toBe('placeholder');
  });

  it('assetId totalement inconnu → placeholder neutre non vide', () => {
    const entry = resolveAsset('elias__unknown__something');
    assertValidEntry(entry, 'fallback total');
    expect(entry.type).toBe('placeholder');
  });

  it('chaîne vide → ne lève pas, retourne un placeholder', () => {
    const entry = resolveAsset('');
    expect(entry).toBeDefined();
    expect(entry.type).toBe('placeholder');
    expect(entry.value.length).toBeGreaterThan(0);
  });
});

/* ─── Invariant asset-ready ──────────────────────────────────────────────── */

describe('invariant asset-ready — resolveAsset ne retourne jamais undefined', () => {
  const sampleAssetIds = [
    'elias__heaven__heaven_saint_esprit',
    'elias__adversary__adversary_peur_angoisse',
    'elias__entourage__entourage_arc-ami',
    'elias__conscience__conscience_inner',
    'elias__heaven__heaven_victory',
    'elias__adversary__adversary_generic',
    'elias__adversary__adversary_cascade',
    // Cas inconnus (futurs assets)
    'elias__heaven__heaven_nouveau',
    'elias__adversary__adversary_inconnu',
    'elias__entourage__entourage_arc-futur',
  ];

  for (const assetId of sampleAssetIds) {
    it(`resolveAsset('${assetId}') — toujours défini`, () => {
      const entry = resolveAsset(assetId);
      expect(entry).toBeDefined();
      expect(entry.type.length).toBeGreaterThan(0);
      expect(entry.value.length).toBeGreaterThan(0);
      expect(entry.label.length).toBeGreaterThan(0);
    });
  }
});

/* ─── Labels nommés (noms évangélistes) ─────────────────────────────────── */

describe('labels nommés — vérification sémantique', () => {
  it("La Peur (pas 'Adversaire générique')", () => {
    expect(ILLUSTRATION_REGISTRY['elias__adversary__adversary_peur_angoisse']?.label).toBe('La Peur');
  });
  it("L'Amertume", () => {
    expect(ILLUSTRATION_REGISTRY['elias__adversary__adversary_amertume_rejet']?.label).toBe("L'Amertume");
  });
  it("Le Découragement", () => {
    expect(ILLUSTRATION_REGISTRY['elias__adversary__adversary_decouragement']?.label).toBe('Le Découragement');
  });
  it("L'Esprit Saint (catégorie heaven spéciale)", () => {
    expect(ILLUSTRATION_REGISTRY['elias__heaven__heaven_saint_esprit']?.label).toBe("L'Esprit Saint");
  });
  it("Mathias — personnage nommé", () => {
    expect(ILLUSTRATION_REGISTRY['elias__entourage__entourage_arc-mathias']?.label).toBe('Mathias');
  });
});
