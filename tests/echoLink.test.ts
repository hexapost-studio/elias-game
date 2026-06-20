/**
 * @file echoLink.test.ts
 * @description Tests unitaires du module pur `engine/echoLink.ts`.
 *   Couvre la génération des bulles de rappel de causalité (T-22).
 *
 *   Aucun import React — module pur, testable sans jsdom.
 *
 *   @since itér. 39 / T-22
 */
import { describe, it, expect } from 'vitest';
import { buildEchoLinkEntry, hasEchoLink } from '../src/engine/echoLink';
import { createInitialState } from '../src/engine/gameEngine';
import type { AfflictionEvent, GameState, JournalEntry } from '../src/types/game';

/* ─── Helpers de construction ────────────────────────────────────────────── */

function makeEvent(overrides: Partial<AfflictionEvent>): AfflictionEvent {
  return {
    id: 'test-echo-event',
    title: 'Test Echo Event',
    description: 'Description de test',
    ageRange: [25, 50],
    category: 'amertume_rejet',
    correctVerseId: 'v-amertume-001',
    decoyVerseIds: [],
    statImpactOnFail: { foi: -2, paix: -3, physique: -1, finances: 0 },
    ...overrides,
  };
}

/** État de base : état initial enrichi avec quelques entrées de journal. */
function makeState(overrides: Partial<GameState> = {}): GameState {
  const base = createInitialState();
  return { ...base, age: 35, ...overrides };
}

/* ─── hasEchoLink ─────────────────────────────────────────────────────────── */

describe('hasEchoLink — prédicat', () => {
  it('retourne false si pas de prerequisites', () => {
    const event = makeEvent({ prerequisites: undefined });
    expect(hasEchoLink(event)).toBe(false);
  });

  it('retourne false si prerequisites est un tableau vide', () => {
    const event = makeEvent({ prerequisites: [] });
    expect(hasEchoLink(event)).toBe(false);
  });

  it('retourne true si prerequisites contient au moins un item', () => {
    const event = makeEvent({
      prerequisites: [{ kind: 'flag', flagId: 'louise_pardonnee', value: true }],
    });
    expect(hasEchoLink(event)).toBe(true);
  });

  it('retourne true pour event_completed', () => {
    const event = makeEvent({
      prerequisites: [{ kind: 'event_completed', eventId: 'arc-louise-2' }],
    });
    expect(hasEchoLink(event)).toBe(true);
  });
});

/* ─── buildEchoLinkEntry — pas de prerequisites ──────────────────────────── */

describe('buildEchoLinkEntry — sans prerequisites', () => {
  it('retourne null si pas de prerequisites', () => {
    const event = makeEvent({ prerequisites: undefined });
    const state = makeState();
    expect(buildEchoLinkEntry(event, state)).toBeNull();
  });

  it('retourne null si prerequisites est vide', () => {
    const event = makeEvent({ prerequisites: [] });
    const state = makeState();
    expect(buildEchoLinkEntry(event, state)).toBeNull();
  });
});

/* ─── buildEchoLinkEntry — prerequisite de type flag ─────────────────────── */

describe('buildEchoLinkEntry — flag connu (louise_pardonnee)', () => {
  it('génère une JournalEntry de type milestone', () => {
    const event = makeEvent({
      prerequisites: [{ kind: 'flag', flagId: 'louise_pardonnee', value: true }],
    });
    const state = makeState({ age: 45, flags: { louise_pardonnee: true } });
    const entry = buildEchoLinkEntry(event, state);
    expect(entry).not.toBeNull();
    expect(entry!.type).toBe('milestone');
    expect(entry!.age).toBe(45);
  });

  it('le texte contient le marqueur [ECHO_LINK]', () => {
    const event = makeEvent({
      prerequisites: [{ kind: 'flag', flagId: 'louise_pardonnee', value: true }],
    });
    const state = makeState({ age: 45, flags: { louise_pardonnee: true } });
    const entry = buildEchoLinkEntry(event, state);
    expect(entry!.text).toContain('[ECHO_LINK]');
  });

  it('le texte mentionne le pardon de Louise', () => {
    const event = makeEvent({
      prerequisites: [{ kind: 'flag', flagId: 'louise_pardonnee', value: true }],
    });
    const state = makeState({ age: 45, flags: { louise_pardonnee: true } });
    const entry = buildEchoLinkEntry(event, state);
    expect(entry!.text.toLowerCase()).toContain('louise');
    expect(entry!.text.toLowerCase()).toContain('pardon');
  });

  it('le texte inclut l\'âge passé si disponible dans le journal', () => {
    const event = makeEvent({
      prerequisites: [{ kind: 'flag', flagId: 'louise_pardonnee', value: true }],
    });
    const journalEntry: JournalEntry = {
      age: 32,
      text: '[VICTOIRE] "arc-louise-2" surmonté par...',
      type: 'success',
    };
    const state = makeState({ age: 45, flags: { louise_pardonnee: true }, journal: [journalEntry] });
    const entry = buildEchoLinkEntry(event, state);
    // Doit mentionner l'âge 32 ou la durée écoulée
    const text = entry!.text;
    expect(text.includes('32') || text.includes('13')).toBe(true); // 13 ans d'écart
  });
});

/* ─── buildEchoLinkEntry — prerequisite flag inconnu ─────────────────────── */

describe('buildEchoLinkEntry — flag inconnu', () => {
  it('retourne null pour un flag sans libellé connu', () => {
    const event = makeEvent({
      prerequisites: [{ kind: 'flag', flagId: 'unknown_flag_xyz', value: true }],
    });
    const state = makeState({ age: 40, flags: { unknown_flag_xyz: true } });
    // Flag sans libellé défini → pas de texte formulable → null
    expect(buildEchoLinkEntry(event, state)).toBeNull();
  });
});

/* ─── buildEchoLinkEntry — prerequisite event_completed ──────────────────── */

describe('buildEchoLinkEntry — event_completed (event connu)', () => {
  it('génère une entrée si l\'event source est reconnu', () => {
    const event = makeEvent({
      // arc-louise-2 est un event existant dans la base
      prerequisites: [{ kind: 'event_completed', eventId: 'arc-louise-2' }],
    });
    const state = makeState({ age: 40 });
    const entry = buildEchoLinkEntry(event, state);
    // arc-louise-2 est « Les retrouvailles » — il doit être formulé
    expect(entry).not.toBeNull();
    expect(entry!.type).toBe('milestone');
    expect(entry!.text).toContain('[ECHO_LINK]');
  });

  it('retourne null si l\'event source est inconnu', () => {
    const event = makeEvent({
      prerequisites: [{ kind: 'event_completed', eventId: 'e-inexistant-9999' }],
    });
    const state = makeState({ age: 40 });
    expect(buildEchoLinkEntry(event, state)).toBeNull();
  });
});

/* ─── buildEchoLinkEntry — prerequisite event_succeeded / event_failed ───── */

describe('buildEchoLinkEntry — event_succeeded', () => {
  it('génère une entrée avec le mot "surmonté" pour event_succeeded', () => {
    const event = makeEvent({
      prerequisites: [{ kind: 'event_succeeded', eventId: 'arc-louise-2' }],
    });
    const state = makeState({ age: 40 });
    const entry = buildEchoLinkEntry(event, state);
    expect(entry).not.toBeNull();
    expect(entry!.text).toContain('surmonté');
  });

  it('génère une entrée avec le mot "traversé" pour event_failed', () => {
    const event = makeEvent({
      prerequisites: [{ kind: 'event_failed', eventId: 'arc-louise-2' }],
    });
    const state = makeState({ age: 40 });
    const entry = buildEchoLinkEntry(event, state);
    expect(entry).not.toBeNull();
    expect(entry!.text).toContain('traversé');
  });
});

/* ─── buildEchoLinkEntry — prerequisite verse_unlocked ───────────────────── */

describe('buildEchoLinkEntry — verse_unlocked (verset connu)', () => {
  it('génère une entrée si le verset source est reconnu', () => {
    const event = makeEvent({
      // v-peur-001 doit exister dans la base
      prerequisites: [{ kind: 'verse_unlocked', verseId: 'v-peur-001' }],
    });
    const state = makeState({ age: 30 });
    const entry = buildEchoLinkEntry(event, state);
    expect(entry).not.toBeNull();
    expect(entry!.text).toContain('[ECHO_LINK]');
  });

  it('retourne null si le verset source est inconnu', () => {
    const event = makeEvent({
      prerequisites: [{ kind: 'verse_unlocked', verseId: 'v-inexistant-9999' }],
    });
    const state = makeState({ age: 30 });
    expect(buildEchoLinkEntry(event, state)).toBeNull();
  });
});

/* ─── buildEchoLinkEntry — format de la bulle ────────────────────────────── */

describe('buildEchoLinkEntry — format de la JournalEntry', () => {
  it('age de l\'entrée = age courant de l\'état', () => {
    const event = makeEvent({
      prerequisites: [{ kind: 'event_completed', eventId: 'arc-louise-2' }],
    });
    const state = makeState({ age: 55 });
    const entry = buildEchoLinkEntry(event, state);
    expect(entry!.age).toBe(55);
  });

  it('type est toujours milestone (pas un nouveau type)', () => {
    const event = makeEvent({
      prerequisites: [{ kind: 'event_completed', eventId: 'arc-louise-2' }],
    });
    const state = makeState({ age: 40 });
    const entry = buildEchoLinkEntry(event, state);
    expect(entry!.type).toBe('milestone');
  });

  it('pas de verseRef (la bulle de rappel ne pointe pas vers un verset)', () => {
    const event = makeEvent({
      prerequisites: [{ kind: 'event_completed', eventId: 'arc-louise-2' }],
    });
    const state = makeState({ age: 40 });
    const entry = buildEchoLinkEntry(event, state);
    expect(entry!.verseRef).toBeUndefined();
  });

  it('le texte mentionne le lien causal ("ouvre")', () => {
    const event = makeEvent({
      prerequisites: [{ kind: 'event_completed', eventId: 'arc-louise-2' }],
    });
    const state = makeState({ age: 40 });
    const entry = buildEchoLinkEntry(event, state);
    expect(entry!.text).toContain('ouvre');
  });
});

/* ─── buildEchoLinkEntry — robustesse multiple prerequisites ─────────────── */

describe('buildEchoLinkEntry — multiple prerequisites', () => {
  it('retourne une seule entrée même si plusieurs prereqs existent', () => {
    const event = makeEvent({
      prerequisites: [
        { kind: 'event_completed', eventId: 'arc-louise-2' },
        { kind: 'flag', flagId: 'louise_pardonnee', value: true },
      ],
    });
    const state = makeState({ age: 45, flags: { louise_pardonnee: true } });
    const entry = buildEchoLinkEntry(event, state);
    // Une seule entrée — le premier prereq formulable suffit
    expect(entry).not.toBeNull();
    expect(typeof entry!.text).toBe('string');
  });

  it('tombe sur le 2e prereq si le 1er n\'est pas formulable', () => {
    const event = makeEvent({
      prerequisites: [
        { kind: 'flag', flagId: 'unknown_flag_no_label', value: true },  // pas de label
        { kind: 'event_completed', eventId: 'arc-louise-2' },              // label connu
      ],
    });
    const state = makeState({ age: 40 });
    const entry = buildEchoLinkEntry(event, state);
    expect(entry).not.toBeNull();
    expect(entry!.text).toContain('[ECHO_LINK]');
  });
});
