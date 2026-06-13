import { create } from 'zustand';
import type { GameState, AfflictionEvent, PlayerAction } from '../types/game';
import type { PrologueResult } from '../components/Prologue';
import {
  createInitialState,
  advanceAge,
  validateChoice,
  checkGameOver,
  computeFinalMetrics,
  determineTitle,
  applyPlayerAction,
} from '../engine/gameEngine';
import { saveGame, logEvent, logRun, saveInheritance } from '../data/persistence';

interface GameStore extends GameState {
  gameOver: { isOver: boolean; reason?: string } | null;
  initGame: () => void;
  startWithPrologue: (result: PrologueResult) => void;
  ageUp: (aiEvent?: AfflictionEvent) => void;
  chooseVerse: (verseId: string, timeToAnswer?: number) => void;
  dismissResult: () => void;
  hydrateFromSave: (data: Partial<GameState>) => void;
  useAction: (action: PlayerAction) => boolean;
}

export const useGameStore = create<GameStore>((set, get) => ({
  ...createInitialState(),
  gameOver: null,

  hydrateFromSave: (data: Partial<GameState>) => {
    set({ ...createInitialState(), ...data, gameOver: null });
  },

  initGame: () => {
    const inheritance = get().inheritance;
    const used = inheritance?.used;
    const state = createInitialState(
      used ? { title: null, bonus: {}, used: false } : inheritance
    );
    set({ ...state, gameOver: null });
    saveGame(state).catch(() => {});
  },

  startWithPrologue: (result: PrologueResult) => {
    const inheritance = get().inheritance;
    const used = inheritance?.used;
    const state = createInitialState(
      used ? { title: null, bonus: {}, used: false } : inheritance
    );
    // Override RNG stats with prologue choices
    state.stats = result.stats;
    state.profileName = result.profileName;
    state.age = 14;
    // Prologue journal entries
    const storyEntries = result.storyBits.map((text) => ({
      age: 0, text: `✦ ${text}`, type: 'milestone' as const,
    }));
    const introEntry = {
      age: 0,
      text: `[NAISSANCE] Élias est né à ${state.lifeContext.city}. Ses parents : ${state.parentNames.father} et ${state.parentNames.mother}. Profil: ${result.profileName}.`,
      type: 'milestone' as const,
    };
    state.journal = [introEntry, ...storyEntries];
    state.difficulty = 2 as const; // Skip easy mode — prologue already prepared them
    set({ ...state, gameOver: null });
    saveGame(state).catch(() => {});
  },

  ageUp: (aiEvent?: AfflictionEvent) => {
    const state = get();
    const { newState } = advanceAge(state);
    // Si aucun événement statique n'a été généré et qu'un événement IA est prêt, l'injecter
    if (aiEvent && !newState.currentEvent) {
      newState.currentEvent = aiEvent;
      newState.phase = 'event';
    }
    const over = checkGameOver(newState);
    set({ ...newState, gameOver: over.isOver ? over : null });
    saveGame(get()).catch(() => {});
  },

  chooseVerse: (verseId: string, timeToAnswer: number = 0) => {
    const state = get();
    if (!state.currentEvent || state.phase !== 'event') return;

    const { correct, newState } = validateChoice(state, verseId, timeToAnswer);
    const over = checkGameOver(newState);

    // Analytics: log event
    logEvent({
      eventId: state.currentEvent.id,
      correct,
      timeToAnswer,
      age: state.age,
      flowLevel: state.flow.value,
      category: state.currentEvent.category,
      season: state.spiritualSeason,
      timestamp: Date.now(),
    }).catch(() => {});

    // Titre + héritage si game over
    let finalTitle = null;
    let finalInheritance = { ...newState.inheritance };
    if (over.isOver) {
      const metrics = computeFinalMetrics(newState, over.reason);
      finalTitle = determineTitle(metrics);
      if (finalTitle) {
        finalInheritance = {
          title: finalTitle,
          bonus: finalTitle.bonus,
          used: false,
        };
        saveInheritance(finalInheritance).catch(() => {});
      }

      // Analytics: log run
      logRun({
        ageAtDeath: state.age,
        totalEvents: newState.totalEvents,
        successRate: newState.successRate,
        maxCombo: newState.maxCombo,
        maxFlow: state.flow.value,
        cause: over.reason || null,
        title: finalTitle?.name || null,
        timestamp: Date.now(),
      }).catch(() => {});
    }

    const resultState = {
      ...newState,
      phase: 'result' as const,
      gameOver: over.isOver ? over : null,
      currentTitle: finalTitle,
      inheritance: finalInheritance,
    };

    set(resultState);
    saveGame(resultState).catch(() => {});
  },

  dismissResult: () => {
    set({ phase: 'idle', lastEventResult: null });
  },

  useAction: (action: PlayerAction) => {
    const state = get();
    const result = applyPlayerAction(state, action);
    if (!result) return false;
    set(result.newState);
    saveGame(result.newState).catch(() => {});
    return true;
  },
}));
