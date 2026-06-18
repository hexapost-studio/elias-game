/**
 * moralChoice.test.ts — Tests unitaires pour src/engine/moralChoice.ts (T-29).
 *
 * Couvre :
 * - isMoralEvent : prédicat d'identification des dilemmes moraux
 * - applyMoralChoice : application des flags + deltas de stats + journal
 */

import { describe, it, expect } from 'vitest';
import { isMoralEvent, applyMoralChoice } from '../src/engine/moralChoice';
import type { AfflictionEvent, GameState, MoralChoice } from '../src/types/game';

/* ─── Fixtures ────────────────────────────────────────────────────────────── */

function makeMoralEvent(overrides: Partial<AfflictionEvent> = {}): AfflictionEvent {
  return {
    id: 'e-moral-test-001',
    title: 'Test dilemme',
    description: 'Une situation difficile.',
    ageRange: [20, 35],
    category: 'amertume_rejet',
    correctVerseId: '',
    decoyVerseIds: [],
    statImpactOnFail: { foi: 0, paix: 0, physique: 0, finances: 0 },
    moralChoices: [
      {
        id: 'mc-test-a',
        label: 'Agir avec grâce',
        description: 'Choisir la voie haute.',
        flagsSet: ['test_flag_grace'],
        statDeltas: { foi: 3, paix: 2 },
      },
      {
        id: 'mc-test-b',
        label: 'Agir par peur',
        description: 'Choisir la voie facile.',
        flagsSet: ['test_flag_peur'],
        statDeltas: { foi: -2, paix: -1 },
      },
    ],
    ...overrides,
  };
}

function makeVerseEvent(): AfflictionEvent {
  return {
    id: 'e-verse-test-001',
    title: 'Test verset',
    description: 'Une épreuve classique.',
    ageRange: [18, 40],
    category: 'peur_angoisse',
    correctVerseId: 'v-peur-001',
    decoyVerseIds: ['v-peur-002', 'v-peur-003'],
    statImpactOnFail: { foi: -3, paix: -3, physique: 0, finances: 0 },
  };
}

function makeBaseState(overrides: Partial<GameState> = {}): GameState {
  return {
    age: 25,
    playerName: 'Élias',
    profileName: 'Équilibré',
    parentNames: { father: 'Daniel', mother: 'Marie' },
    lifeContext: {
      friendName: 'Jonas',
      city: 'Abidjan',
      profession: 'enseignant',
      churchName: 'Église de la Grâce',
      spouseName: 'Sarah',
    },
    stats: { foi: 50, paix: 50, physique: 50, finances: 50 },
    difficulty: 2,
    actionPoints: 2,
    actionsThisYear: [],
    amiRelationship: 50,
    crisesRemaining: 2,
    flow: { value: 33, palier: 1, timeToAnswer: 0, burnoutRate: 0 },
    combo: 0,
    maxCombo: 0,
    journal: [],
    currentEvent: null,
    phase: 'event',
    lastEventResult: null,
    totalEvents: 5,
    successRate: 60,
    failedVerseIds: [],
    codex: {},
    currentTitle: null,
    inheritance: { title: null, bonus: {}, used: false },
    queuedCascadeEvents: [],
    completedArcs: [],
    encounteredArcIds: [],
    recentEventIds: [],
    recentVerseIds: [],
    answeredArcEventIds: [],
    flags: {},
    consecutiveFails: 0,
    reliefActive: false,
    spiritualSeason: 'Réveil',
    amiDecayStreak: 0,
    callFriendCount: 0,
    friendIntroduced: false,
    traits: [],
    seed: 12345,
    metrics: {
      ageAtDeath: 0,
      totalEvents: 0,
      successRate: 0,
      maxCombo: 0,
      maxFlow: 33,
      dominantCategory: null,
      totalVersesUnlocked: 0,
      causeOfDeath: null,
    },
    ...overrides,
  };
}

/* ─── isMoralEvent ─────────────────────────────────────────────────────────── */

describe('isMoralEvent', () => {
  it('retourne true pour un event avec moralChoices non vide', () => {
    expect(isMoralEvent(makeMoralEvent())).toBe(true);
  });

  it('retourne false pour un event verset classique (sans moralChoices)', () => {
    expect(isMoralEvent(makeVerseEvent())).toBe(false);
  });

  it('retourne false pour un event avec moralChoices vide []', () => {
    const ev = makeMoralEvent({ moralChoices: [] });
    expect(isMoralEvent(ev)).toBe(false);
  });

  it('retourne false pour un event sans champ moralChoices', () => {
    const ev = makeMoralEvent();
    delete (ev as Partial<AfflictionEvent>).moralChoices;
    expect(isMoralEvent(ev)).toBe(false);
  });
});

/* ─── applyMoralChoice ─────────────────────────────────────────────────────── */

describe('applyMoralChoice', () => {
  const moralEvent = makeMoralEvent();
  const choiceGrace: MoralChoice = moralEvent.moralChoices![0];
  const choicePeur: MoralChoice = moralEvent.moralChoices![1];

  it('pose les flags du choix → true', () => {
    const state = makeBaseState({ currentEvent: moralEvent, flags: {} });
    const result = applyMoralChoice(state, choiceGrace);
    expect(result.flags['test_flag_grace']).toBe(true);
    expect(result.flags['test_flag_peur']).toBeUndefined();
  });

  it('pose les flags du second choix → true', () => {
    const state = makeBaseState({ currentEvent: moralEvent, flags: {} });
    const result = applyMoralChoice(state, choicePeur);
    expect(result.flags['test_flag_peur']).toBe(true);
    expect(result.flags['test_flag_grace']).toBeUndefined();
  });

  it('applique les deltas de stats positifs', () => {
    const state = makeBaseState({ currentEvent: moralEvent, stats: { foi: 50, paix: 50, physique: 50, finances: 50 } });
    const result = applyMoralChoice(state, choiceGrace);
    expect(result.stats.foi).toBe(53);
    expect(result.stats.paix).toBe(52);
  });

  it('applique les deltas de stats négatifs', () => {
    const state = makeBaseState({ currentEvent: moralEvent, stats: { foi: 50, paix: 50, physique: 50, finances: 50 } });
    const result = applyMoralChoice(state, choicePeur);
    expect(result.stats.foi).toBe(48);
    expect(result.stats.paix).toBe(49);
  });

  it('clamp à 100 max', () => {
    const state = makeBaseState({
      currentEvent: moralEvent,
      stats: { foi: 99, paix: 99, physique: 50, finances: 50 },
    });
    const result = applyMoralChoice(state, choiceGrace);
    expect(result.stats.foi).toBe(100);
    expect(result.stats.paix).toBe(100);
  });

  it('clamp à 0 min (pas de stat négative)', () => {
    const state = makeBaseState({
      currentEvent: moralEvent,
      stats: { foi: 1, paix: 0, physique: 50, finances: 50 },
    });
    const result = applyMoralChoice(state, choicePeur);
    expect(result.stats.foi).toBe(0);  // 1 - 2 = -1, clampé à 0
    expect(result.stats.paix).toBe(0); // 0 - 1 = -1, clampé à 0
  });

  it('ajoute une entrée de journal de type moral', () => {
    const state = makeBaseState({ currentEvent: moralEvent, journal: [] });
    const result = applyMoralChoice(state, choiceGrace);
    expect(result.journal.length).toBe(1);
    expect(result.journal[0].type).toBe('moral');
    expect(result.journal[0].text).toContain('Agir avec grâce');
  });

  it('la bulle de journal contient le résumé des stats', () => {
    const state = makeBaseState({ currentEvent: moralEvent, journal: [] });
    const result = applyMoralChoice(state, choiceGrace);
    const text = result.journal[0].text;
    expect(text).toContain('Foi +3');
    expect(text).toContain('Paix +2');
  });

  it('passe phase à result et lastEventResult à success', () => {
    const state = makeBaseState({ currentEvent: moralEvent });
    const result = applyMoralChoice(state, choiceGrace);
    expect(result.phase).toBe('result');
    expect(result.lastEventResult).toBe('success');
  });

  it('incrémente totalEvents', () => {
    const state = makeBaseState({ currentEvent: moralEvent, totalEvents: 7 });
    const result = applyMoralChoice(state, choiceGrace);
    expect(result.totalEvents).toBe(8);
  });

  it('retourne l\'état inchangé si pas de currentEvent', () => {
    const state = makeBaseState({ currentEvent: null });
    const result = applyMoralChoice(state, choiceGrace);
    expect(result).toBe(state); // même référence
  });

  it('retourne l\'état inchangé si l\'event n\'est pas moral', () => {
    const state = makeBaseState({ currentEvent: makeVerseEvent() });
    const result = applyMoralChoice(state, choiceGrace);
    expect(result).toBe(state); // même référence
  });

  it('préserve les flags existants', () => {
    const state = makeBaseState({
      currentEvent: moralEvent,
      flags: { ancien_flag: true, autre_flag: false },
    });
    const result = applyMoralChoice(state, choiceGrace);
    expect(result.flags['ancien_flag']).toBe(true);
    expect(result.flags['autre_flag']).toBe(false);
    expect(result.flags['test_flag_grace']).toBe(true);
  });

  it('fonctionne sans statDeltas déclarés', () => {
    const choiceSansDeltas: MoralChoice = {
      id: 'mc-no-deltas',
      label: 'Neutre',
      description: 'Rien ne change statistiquement.',
      flagsSet: ['flag_neutre'],
    };
    const state = makeBaseState({ currentEvent: moralEvent, stats: { foi: 50, paix: 50, physique: 50, finances: 50 } });
    const result = applyMoralChoice(state, choiceSansDeltas);
    expect(result.stats.foi).toBe(50);
    expect(result.stats.paix).toBe(50);
    expect(result.flags['flag_neutre']).toBe(true);
  });
});
