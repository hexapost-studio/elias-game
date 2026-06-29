import { describe, it, expect } from 'vitest';
import { createInitialState } from '../src/engine/gameEngine';
import { generateTestimony } from '../src/engine/testimonyGenerator';
import type { JournalEntry, RunMetrics } from '../src/types/game';

/**
 * Le témoignage de fin de vie est un état VIRAL (partage WhatsApp) atteint à CHAQUE mort.
 * Il doit être incassable, y compris sur les fins de vie "pauvres" (mort précoce, journal vide,
 * pas de calling). Ces tests ferment ce trou de couverture (aucun avant itér.79).
 */
function metrics(over: Partial<RunMetrics> = {}): RunMetrics {
  return {
    ageAtDeath: 40,
    totalEvents: 0,
    successRate: 0,
    maxCombo: 0,
    maxFlow: 0,
    dominantCategory: null,
    totalVersesUnlocked: 0,
    causeOfDeath: 'physique',
    ...over,
  };
}

describe('testimonyGenerator (itér.79) — état viral incassable', () => {
  it('mort précoce, journal VIDE, sans calling → témoignage valide, zéro moment, pas de crash', () => {
    const state = createInitialState(undefined, 12345, 'Élie');
    state.journal = [];
    state.calling = undefined;
    const t = generateTestimony(state, metrics({ ageAtDeath: 9 }), null, 0);

    expect(t.identity).toContain('Élie');
    expect(t.identity).toContain('9 ans');
    expect(t.foundingTrial).toBeNull();
    expect(t.lifeTurning).toBeNull();
    expect(t.lastVictory).toBeNull();
    // Quote par défaut quand pas de calling
    expect(t.bibleQuote).toMatch(/Jérémie 29:11/);
    // fullText cohérent (identité + stats + quote + graine), jamais "undefined"
    expect(t.fullText).not.toMatch(/undefined|null|NaN/);
    expect(t.fullText).toContain('0 versets mémorisés');
    expect(t.replaySeed).toContain('12345');
  });

  it('victoire (100 ans) → ouverture de victoire, pas de saison', () => {
    const state = createInitialState(undefined, 7, 'Anne');
    state.journal = [];
    const t = generateTestimony(state, metrics({ ageAtDeath: 100 }), 'Le Fidèle', 42);
    // L'ouverture de victoire mentionne l'âge 100 et le nom
    expect(t.opening).toContain('Anne');
    expect(t.opening).toContain('100');
    expect(t.stats).toContain('42 versets mémorisés');
    expect(t.stats).toContain('titre : Le Fidèle');
  });

  it('vie pleine de succès → founding + turning + lastVictory distincts et datés', () => {
    const state = createInitialState(undefined, 99, 'Marc');
    const j: JournalEntry[] = [
      { age: 12, text: '[VICTOIRE] La peur vaincue', type: 'success', verseRef: 'Psaume 27.1' },
      { age: 45, text: '[VICTOIRE] Le pardon offert', type: 'success', verseRef: 'Éphésiens 4.32' },
      { age: 78, text: '[VICTOIRE] La paix gardée', type: 'success', verseRef: 'Jean 14.27' },
      { age: 30, text: 'Une année ordinaire', type: 'event' },
    ];
    state.journal = j;
    const t = generateTestimony(state, metrics({ ageAtDeath: 82, maxCombo: 6 }), 'Le Veilleur', 30);

    expect(t.foundingTrial).toContain('12 ans');
    expect(t.lifeTurning).toContain('45 ans');
    expect(t.lastVictory).toContain('78 ans');
    // Les trois moments sont distincts
    expect(t.foundingTrial).not.toEqual(t.lifeTurning);
    expect(t.lifeTurning).not.toEqual(t.lastVictory);
    // combo ≥ 5 apparaît
    expect(t.stats).toContain('combo max ×6');
  });

  it('un seul succès → founding rempli, turning et lastVictory restent null (pas de doublon)', () => {
    const state = createInitialState(undefined, 5, 'Ruth');
    state.journal = [
      { age: 20, text: '[VICTOIRE] Premier pas', type: 'success', verseRef: 'Romains 8.28' },
    ];
    const t = generateTestimony(state, metrics({ ageAtDeath: 25 }), null, 1);
    expect(t.foundingTrial).toContain('20 ans');
    expect(t.lifeTurning).toBeNull();
    expect(t.lastVictory).toBeNull();
  });
});
