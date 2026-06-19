/**
 * Tests du mode découverte (T-17).
 * Vérifient la logique pure de applyDiscoveryChoice et son intégration dans validateChoice.
 */
import { describe, it, expect } from 'vitest';
import {
  createInitialState,
  applyDiscoveryChoice,
  validateChoice,
} from '../src/engine/gameEngine';
import { getEventById } from '../src/data/events';
import type { GameState, AfflictionEvent } from '../src/types/game';

/* ─── helpers ─── */

/** Construit un état minimal avec un événement actif et le mode découverte activé. */
function makeDiscoveryState(overrides: Partial<GameState> = {}): GameState {
  const base = createInitialState();
  // Prendre un event simple (e-infant-001 est toujours présent dans le DATA)
  const firstEvent = getEventById('e-infant-001') ?? null;
  return {
    ...base,
    age: 5,
    phase: 'event',
    currentEvent: firstEvent as AfflictionEvent | null,
    discoveryMode: true,
    ...overrides,
  };
}

describe('Mode Découverte — applyDiscoveryChoice (logique pure)', () => {
  it('createInitialState initialise discoveryMode à false', () => {
    const state = createInitialState();
    expect(state.discoveryMode).toBe(false);
  });

  it('retourne toujours correct=true (affiche le bon verset)', () => {
    const state = makeDiscoveryState();
    if (!state.currentEvent) return; // skip si pas d'event
    const { correct } = applyDiscoveryChoice(state, 'mauvais-verset-id');
    expect(correct).toBe(true);
  });

  it('ne modifie pas les stats en cas de bonne réponse', () => {
    const state = makeDiscoveryState();
    if (!state.currentEvent) return;
    const { newState } = applyDiscoveryChoice(state, state.currentEvent.correctVerseId);
    expect(newState.stats).toEqual(state.stats);
  });

  it('ne modifie pas les stats en cas de mauvaise réponse', () => {
    const state = makeDiscoveryState();
    if (!state.currentEvent) return;
    const wrongId = state.currentEvent.decoyVerseIds[0] ?? 'inexistant';
    const { newState } = applyDiscoveryChoice(state, wrongId);
    expect(newState.stats).toEqual(state.stats);
  });

  it('débloque le bon verset dans le codex', () => {
    const state = makeDiscoveryState();
    if (!state.currentEvent) return;
    const verseId = state.currentEvent.correctVerseId;
    expect(state.codex[verseId]?.unlocked).toBe(false);
    const { newState } = applyDiscoveryChoice(state, verseId);
    expect(newState.codex[verseId]?.unlocked).toBe(true);
  });

  it('ajoute une entrée [DÉCOUVERTE] dans le journal', () => {
    const state = makeDiscoveryState();
    if (!state.currentEvent) return;
    const { newState } = applyDiscoveryChoice(state, state.currentEvent.correctVerseId);
    const entry = newState.journal.at(-1);
    expect(entry?.text).toMatch(/\[DÉCOUVERTE\]/);
    expect(entry?.type).toBe('milestone');
  });

  it('le journal indique la bonne réponse quand le joueur a raison', () => {
    const state = makeDiscoveryState();
    if (!state.currentEvent) return;
    const { newState } = applyDiscoveryChoice(state, state.currentEvent.correctVerseId);
    const entry = newState.journal.at(-1);
    expect(entry?.text).toMatch(/Bonne réponse/);
  });

  it('le journal indique la mauvaise réponse quand le joueur se trompe', () => {
    const state = makeDiscoveryState();
    if (!state.currentEvent) return;
    const wrongId = state.currentEvent.decoyVerseIds[0] ?? 'inexistant';
    const { newState } = applyDiscoveryChoice(state, wrongId);
    const entry = newState.journal.at(-1);
    expect(entry?.text).toMatch(/Réponse incorrecte/);
  });

  it('ne change pas lastEventResult du bon état pour afficher le verset', () => {
    const state = makeDiscoveryState();
    if (!state.currentEvent) return;
    const { newState } = applyDiscoveryChoice(state, state.currentEvent.correctVerseId);
    expect(newState.lastEventResult).toBe('success');
  });

  it('met à jour la fenêtre recentEventIds', () => {
    const state = makeDiscoveryState();
    if (!state.currentEvent) return;
    const { newState } = applyDiscoveryChoice(state, state.currentEvent.correctVerseId);
    expect(newState.recentEventIds[0]).toBe(state.currentEvent.id);
  });
});

describe('Mode Découverte — validateChoice délègue à applyDiscoveryChoice', () => {
  it('validateChoice ne modifie pas les stats quand discoveryMode=true', () => {
    const state = makeDiscoveryState();
    if (!state.currentEvent) return;
    const wrongId = state.currentEvent.decoyVerseIds[0] ?? 'inexistant';
    const { newState } = validateChoice(state, wrongId, 5);
    expect(newState.stats).toEqual(state.stats);
  });

  it('validateChoice modifie les stats quand discoveryMode=false (comportement normal)', () => {
    const state = makeDiscoveryState({ discoveryMode: false });
    if (!state.currentEvent) return;
    // Mauvaise réponse → malus de stats attendu
    const wrongId = state.currentEvent.decoyVerseIds[0] ?? 'inexistant';
    const { newState } = validateChoice(state, wrongId, 5);
    // Au moins une stat doit avoir changé (malus d'un event normal)
    const changed = (Object.keys(state.stats) as Array<keyof typeof state.stats>).some(
      (k) => newState.stats[k] !== state.stats[k]
    );
    expect(changed).toBe(true);
  });
});
