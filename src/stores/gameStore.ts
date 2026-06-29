import { create } from 'zustand';
import type { GameState, AfflictionEvent, PlayerAction, MoralChoice } from '../types/game';
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
import { personalize } from '../engine/identity';
import { applyMoralChoice } from '../engine/moralChoice';
import { revealsUpToAge } from '../engine/reveals';
import { saveGame, logEvent, logRun, saveInheritance, getLifetimeCodex } from '../data/persistence';
import { mergeCodex } from '../engine/codexMemory';
import { trackEvent } from '../services/analytics';

/** Seede le codex d'une nouvelle run depuis la mémoire « à vie » (apprentissage cross-parties,
 *  itér.84) : un verset déjà travaillé démarre avec son historique → progression de difficulté
 *  (`wordBank`/`completion`/`reference`) et priorité SRS conservées d'une partie à l'autre. */
function seedCodexFromLifetime(state: GameState): GameState {
  state.codex = mergeCodex(state.codex, getLifetimeCodex());
  return state;
}

interface GameStore extends GameState {
  gameOver: { isOver: boolean; reason?: string } | null;
  initGame: () => void;
  initGameWithSeed: (seed: number, playerName?: string) => void;
  startWithPrologue: (result: PrologueResult) => void;
  ageUp: (aiEvent?: AfflictionEvent) => void;
  chooseVerse: (verseId: string, timeToAnswer?: number) => void;
  chooseMoral: (choice: MoralChoice) => void;
  dismissResult: () => void;
  hydrateFromSave: (data: Partial<GameState>) => void;
  useAction: (action: PlayerAction) => boolean;
  /** Bascule le mode découverte (T-17) — entraînement sans conséquence de stats. */
  toggleDiscoveryMode: () => void;
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
    // Préserve le nom du joueur au redémarrage (itér. 9) — pas de re-saisie au restart.
    const state = seedCodexFromLifetime(createInitialState(
      used ? { title: null, bonus: {}, used: false } : inheritance,
      undefined,
      get().playerName
    ));
    set({ ...state, gameOver: null });
    saveGame(state).catch(() => {});
  },

  initGameWithSeed: (seed: number, playerName?: string) => {
    // Rejouer une graine partagée (itér. 10 / proposition A) : même graine = même
    // monde + stats de départ. Sans prologue (la naissance est entièrement seedée).
    const inheritance = get().inheritance;
    const used = inheritance?.used;
    const state = seedCodexFromLifetime(createInitialState(
      used ? { title: null, bonus: {}, used: false } : inheritance,
      seed,
      playerName ?? get().playerName
    ));
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
    state.playerName = result.name;
    state.age = 14;
    // Prologue journal entries — narration personnalisée au nom du joueur (itér. 9).
    const name = result.name;
    const storyEntries = result.storyBits.map((text) => ({
      age: 0, text: `✦ ${personalize(text, name)}`, type: 'milestone' as const,
    }));
    const introEntry = {
      age: 0,
      text: `[NAISSANCE] ${name} est né à ${state.lifeContext.city}. Ses parents : ${state.parentNames.father} et ${state.parentNames.mother}. Profil: ${result.profileName}.`,
      type: 'milestone' as const,
    };
    // Feedback précoce (itér. 15) : le Prologue démarre à 14 ans et sauterait les annonces
    // de capacités déjà actives (ActionPanel dès 8, saisons dès 10). On les rattrape ici pour
    // que le joueur connaisse le mode d'emploi des mécaniques disponibles dès la 1ʳᵉ année jouée.
    const caughtUpReveals = revealsUpToAge(state.age).map((r) => ({
      age: 0, text: personalize(r.text, name), type: 'milestone' as const,
    }));
    state.journal = [introEntry, ...storyEntries, ...caughtUpReveals];
    state.difficulty = 2 as const; // Skip easy mode — prologue already prepared them
    seedCodexFromLifetime(state); // apprentissage cross-parties (itér.84)
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
    if (over.isOver) {
      trackEvent({ type: 'death', age: newState.age, detail: over.reason || undefined, timestamp: Date.now() });
      trackEvent({ type: 'run_complete', age: newState.age, detail: 'aged_out', timestamp: Date.now() });
    }
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

    // Analytics basique localStorage
    trackEvent({ type: 'event_answered', age: state.age, detail: correct ? 'success' : 'fail', timestamp: Date.now() });
    if (!correct) {
      trackEvent({ type: 'verse_error', age: state.age, detail: state.currentEvent.correctVerseId, timestamp: Date.now() });
    }

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

      // Analytics basique localStorage
      trackEvent({ type: 'death', age: state.age, detail: over.reason || undefined, timestamp: Date.now() });
      trackEvent({ type: 'run_complete', age: state.age, detail: finalTitle?.name || 'no_title', timestamp: Date.now() });
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

  chooseMoral: (choice: MoralChoice) => {
    const state = get();
    if (!state.currentEvent || state.phase !== 'event') return;
    const newState = applyMoralChoice(state, choice);
    const over = checkGameOver(newState);
    set({
      ...newState,
      phase: 'result' as const,
      gameOver: over.isOver ? over : null,
    });
    saveGame(newState).catch(() => {});
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

  toggleDiscoveryMode: () => {
    const state = get();
    const newState = { ...state, discoveryMode: !state.discoveryMode };
    set(newState);
    saveGame(newState).catch(() => {});
  },
}));
