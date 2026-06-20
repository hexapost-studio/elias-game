/**
 * moralChoice.ts — Module pur pour les dilemmes moraux (T-29).
 *
 * Un dilemme moral est un type d'event spécial où le joueur choisit un ACTE concret
 * (pas un verset). Le choix pose des flags et peut modifier les stats.
 *
 * Invariant : pur, sans état, testable hors navigateur.
 */

import type { GameState, AfflictionEvent, MoralChoice, StatName } from '../types/game';

const MAX_STAT = 100;
const MIN_STAT = 0;

/**
 * Prédicat : retourne true si l'event est un dilemme moral
 * (possède au moins un MoralChoice déclaré).
 */
export function isMoralEvent(event: AfflictionEvent): boolean {
  return Array.isArray(event.moralChoices) && event.moralChoices.length > 0;
}

/**
 * Applique un choix moral à l'état courant.
 *
 * - Pose les flags déclarés dans `choice.flagsSet` → true
 * - Applique les `statDeltas` (clampés dans [MIN_STAT, MAX_STAT])
 * - Ajoute une entrée de journal de type 'moral'
 * - Ferme l'event (phase → 'result', lastEventResult → 'success')
 *
 * Retourne un nouvel état (pur — pas de mutation).
 */
export function applyMoralChoice(
  state: GameState,
  choice: MoralChoice,
): GameState {
  const event = state.currentEvent;
  if (!event || !isMoralEvent(event)) return state;

  // Flags
  const newFlags: Record<string, boolean> = {
    ...(state.flags ?? {}),
    ...Object.fromEntries(choice.flagsSet.map((f) => [f, true])),
  };

  // Stats
  const newStats = { ...state.stats };
  if (choice.statDeltas) {
    for (const [key, delta] of Object.entries(choice.statDeltas)) {
      if (delta === undefined) continue;
      const k = key as StatName;
      newStats[k] = Math.min(MAX_STAT, Math.max(MIN_STAT, (newStats[k] ?? 0) + delta));
    }
  }

  // Journal
  const statSummary = buildStatSummary(choice.statDeltas);
  const journalText = `[CHOIX] ${state.playerName} a choisi : « ${choice.label} »${statSummary ? ` — ${statSummary}` : ''}.`;

  const newJournal = [
    ...state.journal,
    {
      age: state.age,
      text: journalText,
      type: 'moral' as const,
    },
  ];

  return {
    ...state,
    flags: newFlags,
    stats: newStats,
    journal: newJournal,
    phase: 'result' as const,
    lastEventResult: 'success' as const,
    totalEvents: state.totalEvents + 1,
  };
}

/** Résume les deltas de stats en une chaîne lisible, ex. "Foi +3, Paix -2". */
function buildStatSummary(
  deltas: Partial<Record<StatName, number>> | undefined,
): string {
  if (!deltas) return '';
  const LABELS: Record<StatName, string> = {
    foi: 'Foi',
    paix: 'Paix',
    physique: 'Corps',
    finances: 'Finances',
  };
  return Object.entries(deltas)
    .filter(([, v]) => v !== undefined && v !== 0)
    .map(([k, v]) => `${LABELS[k as StatName] ?? k} ${v! > 0 ? '+' : ''}${v}`)
    .join(', ');
}
