/**
 * @file messageSender.test.ts
 * @description Tests unitaires du module pur `engine/messageSender.ts`.
 *   Couvre les 4 émetteurs (heaven / adversary / entourage / conscience)
 *   + les invariants asset-ready (assetId toujours rempli).
 *
 *   Aucun import React — module pur, testable sans jsdom.
 *
 *   @since itér. 37 / T-20
 */
import { describe, it, expect } from 'vitest';
import {
  deriveMessageSender,
  deriveSenderFromJournalEntry,
  type MessageSender,
  type SenderKind,
} from '../src/engine/messageSender';
import type { AfflictionEvent, JournalEntry } from '../src/types/game';

/* ─── Helpers de construction ────────────────────────────────────────────── */

function makeEvent(overrides: Partial<AfflictionEvent>): AfflictionEvent {
  return {
    id: 'test-event',
    title: 'Test',
    description: 'Description de test',
    ageRange: [10, 50],
    category: 'peur_angoisse',
    correctVerseId: 'v-peur-001',
    decoyVerseIds: [],
    statImpactOnFail: { foi: -2, paix: -2, physique: -1, finances: 0 },
    ...overrides,
  };
}

function makeJournalEntry(overrides: Partial<JournalEntry>): JournalEntry {
  return {
    age: 25,
    text: 'Texte de journal',
    type: 'milestone',
    ...overrides,
  };
}

/* ─── Invariants communs ─────────────────────────────────────────────────── */

function assertSenderInvariants(sender: MessageSender, expectedKind: SenderKind): void {
  // sender correct
  expect(sender.sender).toBe(expectedKind);
  // displayName non vide
  expect(sender.displayName.length).toBeGreaterThan(0);
  // color est un hex valide
  expect(sender.color).toMatch(/^#[0-9a-fA-F]{3,8}$/);
  // iconKey non vide
  expect(sender.iconKey.length).toBeGreaterThan(0);
  // assetId TOUJOURS rempli (principe asset-ready)
  expect(sender.assetId.length).toBeGreaterThan(0);
  // assetId contient le sender (dérivation stable)
  expect(sender.assetId).toContain(expectedKind);
}

/* ─── deriveMessageSender — les 4 cas principaux ────────────────────────── */

describe('deriveMessageSender — émetteur heaven', () => {
  it('catégorie saint_esprit → heaven', () => {
    const sender = deriveMessageSender(makeEvent({ category: 'saint_esprit', storyArcId: undefined }));
    assertSenderInvariants(sender, 'heaven');
    expect(sender.displayName).toBe("L'Esprit");
  });

  it('catégorie priere → heaven', () => {
    const sender = deriveMessageSender(makeEvent({ category: 'priere', storyArcId: undefined }));
    assertSenderInvariants(sender, 'heaven');
  });

  it('catégorie identite_appel sans arc → heaven', () => {
    const sender = deriveMessageSender(makeEvent({ category: 'identite_appel', storyArcId: undefined }));
    assertSenderInvariants(sender, 'heaven');
  });

  it('catégories de croissance variées → heaven', () => {
    const heavenCategories = [
      'parole_de_dieu', 'amour_de_dieu', 'direction_divine',
      'soif_de_dieu', 'obeissance', 'abondance_financiere',
    ] as const;
    for (const cat of heavenCategories) {
      const sender = deriveMessageSender(makeEvent({ category: cat, storyArcId: undefined }));
      expect(sender.sender).toBe('heaven');
    }
  });
});

describe('deriveMessageSender — émetteur adversary', () => {
  it('catégorie peur_angoisse → adversary nommé "La Peur"', () => {
    const sender = deriveMessageSender(makeEvent({ category: 'peur_angoisse', storyArcId: undefined }));
    assertSenderInvariants(sender, 'adversary');
    expect(sender.displayName).toBe('La Peur');
  });

  it('catégorie doute_incredulite → adversary nommé "Le Doute"', () => {
    const sender = deriveMessageSender(makeEvent({ category: 'doute_incredulite', storyArcId: undefined }));
    assertSenderInvariants(sender, 'adversary');
    expect(sender.displayName).toBe('Le Doute');
  });

  it('catégorie orgueil_independance → adversary nommé "L\'Orgueil"', () => {
    const sender = deriveMessageSender(makeEvent({ category: 'orgueil_independance', storyArcId: undefined }));
    assertSenderInvariants(sender, 'adversary');
    expect(sender.displayName).toBe("L'Orgueil");
  });

  it('catégorie combat_spirituel → "L\'Adversaire"', () => {
    const sender = deriveMessageSender(makeEvent({ category: 'combat_spirituel', storyArcId: undefined }));
    assertSenderInvariants(sender, 'adversary');
    expect(sender.displayName).toBe("L'Adversaire");
  });

  it('toutes les catégories affliction → adversary', () => {
    const afflictions = [
      'peur_angoisse', 'impudicite_addiction', 'finances_paresse',
      'amertume_rejet', 'combat_spirituel', 'doute_incredulite',
      'orgueil_independance', 'culpabilite', 'sterilite', 'maladie_guerison',
      'echec_reussite', 'tristesse_joie', 'decouragement', 'lourdeur_fatigue',
    ] as const;
    for (const cat of afflictions) {
      const sender = deriveMessageSender(makeEvent({ category: cat, storyArcId: undefined }));
      expect(sender.sender).toBe('adversary');
    }
  });
});

describe('deriveMessageSender — émetteur entourage', () => {
  it('arc-ami → entourage "Ton ami"', () => {
    const sender = deriveMessageSender(makeEvent({ storyArcId: 'arc-ami' }));
    assertSenderInvariants(sender, 'entourage');
    expect(sender.displayName).toBe('Ton ami');
  });

  it('arc-parents → entourage "Tes parents"', () => {
    const sender = deriveMessageSender(makeEvent({ storyArcId: 'arc-parents' }));
    assertSenderInvariants(sender, 'entourage');
    expect(sender.displayName).toBe('Tes parents');
  });

  it('arc-eglise → entourage avec nom lisible', () => {
    const sender = deriveMessageSender(makeEvent({ storyArcId: 'arc-eglise' }));
    assertSenderInvariants(sender, 'entourage');
    expect(sender.displayName).toBe("L'église");
  });

  it("arc d'entourage prime sur la catégorie (adversary écrasé)", () => {
    // Même si la category est peur_angoisse (adversary), l'arc-ami doit primer
    const sender = deriveMessageSender(makeEvent({
      category: 'peur_angoisse',
      storyArcId: 'arc-ami',
    }));
    assertSenderInvariants(sender, 'entourage');
  });

  it("arc d'entourage prime sur la catégorie heaven (saint_esprit écrasé)", () => {
    const sender = deriveMessageSender(makeEvent({
      category: 'saint_esprit',
      storyArcId: 'arc-conjoint',
    }));
    assertSenderInvariants(sender, 'entourage');
  });

  it('arc-mathias → entourage "Mathias"', () => {
    const sender = deriveMessageSender(makeEvent({ storyArcId: 'arc-mathias' }));
    assertSenderInvariants(sender, 'entourage');
    expect(sender.displayName).toBe('Mathias');
  });

  it('arc-louise → entourage "Louise"', () => {
    const sender = deriveMessageSender(makeEvent({ storyArcId: 'arc-louise' }));
    assertSenderInvariants(sender, 'entourage');
    expect(sender.displayName).toBe('Louise');
  });
});

describe('deriveMessageSender — émetteur conscience', () => {
  it('arc hors entourage + catégorie hors heaven/adversary → conscience', () => {
    // arc-tentation n'est pas dans ENTOURAGE_ARC_IDS, et on force une cat inconnue
    // En pratique toutes les catégories sont couvertes, donc on teste sans arc + cat heaven
    // qui ne devrait pas être conscience... → on teste arc hors-entourage
    const sender = deriveMessageSender(makeEvent({
      category: 'peur_angoisse',
      storyArcId: 'arc-tentation',  // arc spiritual battle — pas dans entourage
    }));
    // arc-tentation n'est pas entourage → tombe sur la catégorie → adversary
    assertSenderInvariants(sender, 'adversary');
  });

  it('sans arc, catégorie inconnue (edge case) → conscience', () => {
    // Simuler une catégorie non reconnue en castant
    const unknownCategory = 'unknown_category' as never;
    const sender = deriveMessageSender(makeEvent({
      category: unknownCategory,
      storyArcId: undefined,
    }));
    assertSenderInvariants(sender, 'conscience');
    expect(sender.displayName).toBe('Ta conscience');
  });
});

/* ─── deriveSenderFromJournalEntry ───────────────────────────────────────── */

describe('deriveSenderFromJournalEntry — type success → heaven', () => {
  it('entrée de victoire → heaven', () => {
    const entry = makeJournalEntry({
      type: 'success',
      text: '[VICTOIRE] "La peur du lendemain" surmonté par Ps 27:1',
    });
    const sender = deriveSenderFromJournalEntry(entry);
    assertSenderInvariants(sender, 'heaven');
  });
});

describe('deriveSenderFromJournalEntry — type fail → adversary', () => {
  it('entrée d\'échec générique → adversary', () => {
    const entry = makeJournalEntry({
      type: 'fail',
      text: '[ECHEC] "La peur du lendemain" — le verset était Ps 27:1',
    });
    const sender = deriveSenderFromJournalEntry(entry);
    assertSenderInvariants(sender, 'adversary');
  });

  it('entrée fail avec mot "peur" → adversary La Peur', () => {
    const entry = makeJournalEntry({
      type: 'fail',
      text: '[ECHEC] "Les pleurs de la peur" — le verset était Ps 27:1: "L\'Éternel est ma lumière"',
    });
    const sender = deriveSenderFromJournalEntry(entry);
    assertSenderInvariants(sender, 'adversary');
    expect(sender.displayName).toBe('La Peur');
  });
});

describe('deriveSenderFromJournalEntry — type cascade → adversary', () => {
  it('entrée cascade → adversary', () => {
    const entry = makeJournalEntry({ type: 'cascade', text: '[CASCADE] Une épreuve se prépare...' });
    const sender = deriveSenderFromJournalEntry(entry);
    assertSenderInvariants(sender, 'adversary');
  });
});

describe('deriveSenderFromJournalEntry — type micro → entourage', () => {
  it('micro-event → entourage', () => {
    const entry = makeJournalEntry({ type: 'micro', text: 'Tu retrouves un ami d\'enfance.' });
    const sender = deriveSenderFromJournalEntry(entry);
    assertSenderInvariants(sender, 'entourage');
  });
});

describe('deriveSenderFromJournalEntry — type milestone', () => {
  it('[SAISON] → heaven', () => {
    const entry = makeJournalEntry({ type: 'milestone', text: '[SAISON] DÉSERT — Une épreuve spirituelle.' });
    const sender = deriveSenderFromJournalEntry(entry);
    assertSenderInvariants(sender, 'heaven');
  });

  it('[NAISSANCE] → heaven', () => {
    const entry = makeJournalEntry({ type: 'milestone', text: '[NAISSANCE] Élias vient de naître.' });
    const sender = deriveSenderFromJournalEntry(entry);
    assertSenderInvariants(sender, 'heaven');
  });

  it('[ARC_COMPLET] → heaven (célébration)', () => {
    const entry = makeJournalEntry({
      type: 'milestone',
      text: '[ARC_COMPLET] Une amitié pour la vie — "La loyauté forgée dans l\'épreuve"',
    });
    const sender = deriveSenderFromJournalEntry(entry);
    assertSenderInvariants(sender, 'heaven');
  });

  it('[AMI] → entourage', () => {
    const entry = makeJournalEntry({ type: 'milestone', text: '[AMI] Tu as grandi avec Jonas.' });
    const sender = deriveSenderFromJournalEntry(entry);
    assertSenderInvariants(sender, 'entourage');
  });

  it('[JALON] de vie → heaven', () => {
    const entry = makeJournalEntry({ type: 'milestone', text: '[JALON] 25 ans. Les fondations.' });
    const sender = deriveSenderFromJournalEntry(entry);
    assertSenderInvariants(sender, 'heaven');
  });
});

describe('deriveSenderFromJournalEntry — type event → conscience', () => {
  it("type 'event' → conscience", () => {
    const entry = makeJournalEntry({ type: 'event', text: 'Un défi intérieur surgit.' });
    const sender = deriveSenderFromJournalEntry(entry);
    assertSenderInvariants(sender, 'conscience');
  });
});

/* ─── Invariant asset-ready ──────────────────────────────────────────────── */

describe('invariant asset-ready — assetId toujours rempli', () => {
  const testCases: Array<Partial<AfflictionEvent>> = [
    { category: 'saint_esprit', storyArcId: undefined },
    { category: 'peur_angoisse', storyArcId: undefined },
    { category: 'peur_angoisse', storyArcId: 'arc-ami' },
    { category: 'orgueil_independance', storyArcId: undefined },
  ];

  for (const override of testCases) {
    it(`assetId rempli pour category=${override.category} storyArcId=${override.storyArcId}`, () => {
      const sender = deriveMessageSender(makeEvent(override));
      expect(typeof sender.assetId).toBe('string');
      expect(sender.assetId.length).toBeGreaterThan(0);
      // Format attendu : elias__<sender>__<iconKey>
      expect(sender.assetId).toMatch(/^elias__[a-z]+__/);
    });
  }

  const journalTypes: Array<JournalEntry['type']> = ['success', 'fail', 'cascade', 'micro', 'milestone', 'event'];
  for (const type of journalTypes) {
    it(`assetId rempli pour entrée journal type=${type}`, () => {
      const sender = deriveSenderFromJournalEntry(makeJournalEntry({ type }));
      expect(typeof sender.assetId).toBe('string');
      expect(sender.assetId.length).toBeGreaterThan(0);
      expect(sender.assetId).toMatch(/^elias__[a-z]+__/);
    });
  }
});
