import { describe, it, expect } from 'vitest';
import {
  createInitialState,
  getDifficultyForAge,
  checkGameOver,
  generateEvent,
  validateChoice,
  advanceAge,
  generateBirthStats,
  getFlowPalier,
  calculateFlowGain,
  calculateFlowPenalty,
  calculateBurnoutRate,
  createInitialCodex,
  getSrsPriorityVerses,
  computeFinalMetrics,
  determineTitle,
  TITLES,
} from '../src/engine/gameEngine';
import { getEventsForAge, getEventById, TOTAL_EVENTS, EVENT_DATABASE } from '../src/data/events';
import { TOTAL_VERSES, VERSE_DATABASE } from '../src/data/verses';
import { mulberry32 } from '../src/engine/rng';

/* ═══════════════════
   T1 — Initialisation
   ═══════════════════ */
describe('T1: Initialisation du jeu', () => {
  it('crée un état initial valide', () => {
    const state = createInitialState();
    expect(state.age).toBe(0);
    expect(state.phase).toBe('idle');
    expect(state.flow.value).toBe(33);
    expect(state.flow.palier).toBe(1);
    expect(state.difficulty).toBe(1);
  });

  it('le RNG génère des stats de départ variées', () => {
    const profiles = new Set<string>();
    for (let i = 0; i < 20; i++) {
      const { profileName } = generateBirthStats(mulberry32(i));
      profiles.add(profileName);
    }
    // Au moins 2 profils différents sur 20 runs
    expect(profiles.size).toBeGreaterThanOrEqual(2);
  });

  it('toutes les jauges initiales sont entre 30 et 95', () => {
    for (let i = 0; i < 10; i++) {
      const { stats } = generateBirthStats(mulberry32(i));
      for (const value of Object.values(stats)) {
        expect(value).toBeGreaterThanOrEqual(30);
        expect(value).toBeLessThanOrEqual(95);
      }
    }
  });

  it('le Codex contient tous les versets', () => {
    const codex = createInitialCodex();
    expect(Object.keys(codex).length).toBe(TOTAL_VERSES);
    for (const entry of Object.values(codex)) {
      expect(entry.unlocked).toBe(false);
      expect(entry.timesUsed).toBe(0);
      expect(entry.errorCount).toBe(0);
    }
  });
});

/* ═══════════════════
   T2 — Système de Flow
   ═══════════════════ */
describe('T2: Système de Flow à 3 paliers', () => {
  it('Flow 0-33 → Palier 1 (Apprentissage)', () => {
    for (let v = 0; v <= 33; v++) {
      expect(getFlowPalier(v)).toBe(1);
    }
  });

  it('Flow 34-66 → Palier 2 (Transition)', () => {
    for (let v = 34; v <= 66; v++) {
      expect(getFlowPalier(v)).toBe(2);
    }
  });

  it('Flow 67-100 → Palier 3 (Hardcore)', () => {
    for (let v = 67; v <= 100; v++) {
      expect(getFlowPalier(v)).toBe(3);
    }
  });

  it('le gain de Flow est plus élevé pour une réponse rapide', () => {
    const slowGain = calculateFlowGain(12); // 3s left
    const fastGain = calculateFlowGain(2);  // 13s left
    expect(fastGain).toBeGreaterThan(slowGain);
  });

  it('le gain min = base (10) et max = 2x base (20)', () => {
    const minGain = calculateFlowGain(15); // 0s left
    const maxGain = calculateFlowGain(0);  // 15s left
    expect(minGain).toBe(10);
    expect(maxGain).toBe(20);
  });

  it('la pénalité asymétrique retombe au seuil inférieur du palier', () => {
    expect(calculateFlowPenalty(85)).toBe(66); // Palier 3 → 2
    expect(calculateFlowPenalty(50)).toBe(33); // Palier 2 → 1
    expect(calculateFlowPenalty(20)).toBe(0);  // Palier 1 → 0
  });
});

/* ═══════════════════
   T3 — Burnout
   ═══════════════════ */
describe('T3: Système de Burnout', () => {
  it('Palier 1 : pas de burn-out', () => {
    expect(calculateBurnoutRate(1)).toBe(0);
  });

  it('Palier 2 : -1 physique par tour', () => {
    expect(calculateBurnoutRate(2)).toBe(1);
  });

  it('Palier 3 : -3 physique par tour', () => {
    expect(calculateBurnoutRate(3)).toBe(3);
  });
});

/* ═══════════════════
   T4 — Difficulté
   ═══════════════════ */
describe('T4: Difficulté progressive par âge', () => {
  it('Niveau 1 pour les 0-15 ans', () => {
    for (let age = 0; age <= 15; age++) {
      expect(getDifficultyForAge(age)).toBe(1);
    }
  });

  it('Niveau 2 pour les 16-60 ans', () => {
    for (let age = 16; age <= 60; age++) {
      expect(getDifficultyForAge(age)).toBe(2);
    }
  });

  it('Niveau 3 pour les 61+ ans', () => {
    for (let age = 61; age <= 100; age++) {
      expect(getDifficultyForAge(age)).toBe(3);
    }
  });
});

/* ═══════════════════
   T5 — Game Over
   ═══════════════════ */
describe('T5: Conditions de Game Over', () => {
  it('pas game over au début', () => {
    const state = createInitialState();
    expect(checkGameOver(state).isOver).toBe(false);
  });

  it('game over si une jauge tombe à 0', () => {
    const state = createInitialState();
    state.stats.foi = 0;
    const result = checkGameOver(state);
    expect(result.isOver).toBe(true);
    expect(result.reason).toContain('foi');
  });

  it('victoire à 100 ans', () => {
    const state = createInitialState();
    state.age = 100;
    expect(checkGameOver(state).isOver).toBe(true);
  });
});

/* ═══════════════════
   T6 — Base de données
   ═══════════════════ */
describe('T6: Base de versets et événements', () => {
  it('contient au moins 50 versets', () => {
    expect(TOTAL_VERSES).toBeGreaterThanOrEqual(50);
  });

  it('tous les IDs sont uniques', () => {
    const ids = VERSE_DATABASE.map((v) => v.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('au moins 30 événements dans la base', () => {
    expect(TOTAL_EVENTS).toBeGreaterThanOrEqual(30);
  });

  it('chaque tranche d\'âge a des événements', () => {
    const ranges = [
      [6, 15],
      [16, 25],
      [26, 60],
      [60, 90],
    ];
    for (const [min, max] of ranges) {
      const mid = Math.floor((min + max) / 2);
      expect(
        getEventsForAge(mid).length,
        `Tranche ${min}-${max} ans`
      ).toBeGreaterThan(0);
    }
  });

  it('les événements en cascade existent dans la base', () => {
    for (const event of EVENT_DATABASE) {
      if (event.cascadeEventId) {
        const cascade = getEventById(event.cascadeEventId);
        expect(
          cascade,
          `Cascade ${event.cascadeEventId} depuis ${event.id}`
        ).toBeTruthy();
      }
    }
  });
});

/* ═══════════════════
   T7 — Événements en cascade
   ═══════════════════ */
describe('T7: Système de cascade', () => {
  it('un échec programmé une cascade si l\'événement en a une', () => {
    const state = createInitialState();
    state.age = 10;
    const event = generateEvent(state);
    if (!event) return;

    state.currentEvent = event;
    state.phase = 'event';

    // Forcer un événement avec cascade
    const cascadeEvent = getEventById('e-fond-001');
    if (!cascadeEvent) return;
    state.currentEvent = cascadeEvent;
    state.phase = 'event';

    const wrongId = cascadeEvent.decoyVerseIds[0] || 'v-imput-001';
    const { newState } = validateChoice(state, wrongId);

    expect(newState.queuedCascadeEvents.length).toBeGreaterThanOrEqual(1);
    if (newState.queuedCascadeEvents.length > 0) {
      expect(newState.queuedCascadeEvents[0].triggerAge).toBe(state.age + 1);
    }
  });
});

/* ═══════════════════
   T8 — Codex & Collection
   ═══════════════════ */
describe('T8: Système de Codex', () => {
  it('une bonne réponse débloque le verset dans le Codex', () => {
    const state = createInitialState();
    state.age = 10;
    state.phase = 'event';

    const event = getEventById('e-fond-004'); // peur du noir → v-peur-001
    if (!event) return;
    state.currentEvent = event;

    const { newState } = validateChoice(state, event.correctVerseId);
    expect(newState.codex[event.correctVerseId].unlocked).toBe(true);
    expect(newState.codex[event.correctVerseId].timesUsed).toBe(1);
  });

  it('régression : un palier de combo conserve SON entrée de journal [COMBO xN] (itér. 17)', () => {
    const state = createInitialState();
    state.age = 10;
    state.phase = 'event';
    state.combo = 4; // ce succès porte le combo à 5 → palier (balance.json thresholds.5)

    const event = getEventById('e-fond-004');
    if (!event) return;
    state.currentEvent = event;

    const { newState } = validateChoice(state, event.correctVerseId);
    expect(newState.combo).toBe(5);
    // Les DEUX entrées doivent coexister (le bug rebâtissait le journal depuis state.journal,
    // écrasant l'entrée combo posée juste avant).
    const texts = newState.journal.map((e) => e.text);
    expect(texts.some((t) => t.includes('[COMBO x5]'))).toBe(true);
    expect(texts.some((t) => t.includes('[VICTOIRE]'))).toBe(true);
  });

  it('une erreur enregistre le comptage dans le Codex', () => {
    const state = createInitialState();
    state.age = 10;
    state.phase = 'event';

    const event = getEventById('e-fond-004');
    if (!event) return;
    state.currentEvent = event;

    const wrongId = event.decoyVerseIds[0] || 'v-imput-002';
    const { newState } = validateChoice(state, wrongId);

    expect(newState.codex[event.correctVerseId].errorCount).toBe(1);
    expect(newState.codex[event.correctVerseId].lastErrorAge).toBe(10);
  });
});

/* ═════════════════════╗
   T9 — SRS (Spaced Repetition)
   ═════════════════════╝ */
describe('T9: SRS — Priorisation des versets difficiles', () => {
  it('retourne les versets avec le plus d\'erreurs en priorité', () => {
    const state = createInitialState();
    // Simuler 2 erreurs sur un verset
    state.codex['v-peur-001'].errorCount = 2;
    state.codex['v-peur-001'].lastErrorAge = 10;
    state.codex['v-peur-002'].errorCount = 1;
    state.codex['v-peur-002'].lastErrorAge = 8;

    const priorities = getSrsPriorityVerses(state.codex, 2);
    expect(priorities[0]).toBe('v-peur-001');
    expect(priorities[1]).toBe('v-peur-002');
  });

  it('ne retourne que les versets avec des erreurs', () => {
    const state = createInitialState();
    state.codex['v-peur-001'].errorCount = 3;

    const priorities = getSrsPriorityVerses(state.codex, 5);
    expect(priorities.length).toBe(1);
    expect(priorities[0]).toBe('v-peur-001');
  });
});

/* ═══════════════════════════
   T10 — Titres et Héritage
   ═══════════════════════════ */
describe('T10: Système de Titres', () => {
  it('TITLES contient au moins 5 titres', () => {
    expect(TITLES.length).toBeGreaterThanOrEqual(5);
  });

  it('Le Prodige est débloqué si 100 ans + 60% réussite', () => {
    const metrics = {
      ageAtDeath: 100,
      totalEvents: 30,
      successRate: 65,
      maxCombo: 5,
      maxFlow: 80,
      dominantCategory: null,
      totalVersesUnlocked: 10,
      causeOfDeath: null,
    };
    const title = determineTitle(metrics);
    expect(title?.name).toBe('Le Prodige');
  });

  it('Le Combattant est débloqué si 30+ events et 70%+', () => {
    const metrics = {
      ageAtDeath: 50,
      totalEvents: 35,
      successRate: 75,
      maxCombo: 8,
      maxFlow: 50,
      dominantCategory: null,
      totalVersesUnlocked: 5,
      causeOfDeath: null,
    };
    const title = determineTitle(metrics);
    expect(title?.name).toBe('Le Combattant');
  });
});

/* ═══════════════════
   T11 — Vieillissement
   ═══════════════════ */
describe('T11: Vieillissement et milestones', () => {
  it('advanceAge augmente l\'âge de 1', () => {
    const state = createInitialState();
    const { newState } = advanceAge(state);
    expect(newState.age).toBe(1);
  });

  it('le physique décline après 40 ans', () => {
    const state = createInitialState();
    state.age = 41;
    state.stats.physique = 80;
    const { newState } = advanceAge(state);
    expect(newState.stats.physique).toBe(79);
  });

  it('le Flow décroît naturellement si inactif', () => {
    const state = createInitialState();
    state.flow.value = 50;
    state.flow.palier = 2;
    const { newState } = advanceAge(state);
    expect(newState.flow.value).toBeLessThan(50);
  });
});

/* ═══════════════════
   T12 — Validation
   ═══════════════════ */
describe('T12: Validation des choix', () => {
  it('réponse correcte augmente le combo', () => {
    const state = createInitialState();
    state.age = 10;
    state.phase = 'event';
    const event = getEventById('e-fond-004');
    if (!event) return;
    state.currentEvent = event;

    const { correct, newState } = validateChoice(state, event.correctVerseId);
    expect(correct).toBe(true);
    expect(newState.combo).toBe(1);
  });

  it('réponse incorrecte remet le combo à zéro et baisse le Flow', () => {
    const state = createInitialState();
    state.age = 10;
    state.phase = 'event';
    state.combo = 5;
    state.flow.value = 70;
    state.flow.palier = 3;

    const event = getEventById('e-fond-004');
    if (!event) return;
    state.currentEvent = event;

    const wrongId = event.decoyVerseIds[0] || 'v-imput-003';
    const { correct, newState } = validateChoice(state, wrongId);
    expect(correct).toBe(false);
    expect(newState.combo).toBe(0);
    expect(newState.flow.value).toBeLessThan(70);
  });

  it('ne dépasse pas les bornes des stats', () => {
    const state = createInitialState();
    state.age = 10;
    state.phase = 'event';
    state.stats.foi = 99;

    const event = getEventById('e-fond-004');
    if (!event) return;
    state.currentEvent = event;

    const { newState } = validateChoice(state, event.correctVerseId);
    expect(newState.stats.foi).toBeLessThanOrEqual(100);
  });
});
