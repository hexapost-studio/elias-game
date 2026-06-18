/**
 * runAmbition.ts — Ambition de run (T-25)
 *
 * Module PUR : aucune dépendance React, aucun effet de bord.
 * Dérive la progression des arcs narratifs depuis l'état présent.
 *
 * Un « Appel » ne filtre pas les arcs (les arcs sont universels) — il donne
 * le titre et la couleur de l'ambition, tandis que chaque arc est une étape
 * de la vie d'Élias dans laquelle l'Appel se manifeste différemment.
 *
 * Principe « dériver plutôt qu'ajouter du state » : toutes les données
 * sont calculées à partir de `completedArcs`, `encounteredArcIds` et
 * `answeredArcEventIds` qui existent déjà dans le GameState.
 */
import type { GameState } from '../types/game';
import { STORY_ARCS } from '../data/storyArcs';

/** Statut d'une étape de l'ambition */
export type AmbitionStepStatus = 'done' | 'active' | 'locked';

/** Une étape de l'ambition (= un arc narratif) */
export interface AmbitionStep {
  arcId: string;
  /** Nom court de l'arc (sans résolution des templates {ami}/{ville}/…) */
  label: string;
  status: AmbitionStepStatus;
  /** Nombre d'étapes répondues / total pour cet arc */
  stepsCompleted: number;
  stepsTotal: number;
}

/** Progression globale de l'Appel (tous les arcs) */
export interface CallingProgress {
  /** Nombre d'arcs complètement terminés */
  completed: number;
  /** Nombre d'arcs actifs (en cours) */
  active: number;
  /** Nombre total d'arcs */
  total: number;
  /** Pourcentage d'arcs terminés (0–100, entier) */
  percent: number;
}

/**
 * Dérive la liste des étapes de l'ambition depuis le GameState.
 * Seuls les arcs rencontrés ou complétés sont dans un état visible ;
 * les autres restent 'locked' (non encore croisés).
 *
 * L'ordre est : arcs actifs en tête, arcs complétés ensuite, arcs verrouillés en queue.
 */
export function deriveRunAmbition(state: GameState): AmbitionStep[] {
  const completedIds = new Set(state.completedArcs.map((a) => a.arcId));
  const encounteredIds = new Set(state.encounteredArcIds ?? []);
  const answered = new Set(state.answeredArcEventIds ?? []);

  const steps: AmbitionStep[] = STORY_ARCS.map((arc) => {
    const isDone = completedIds.has(arc.id);
    const isEncountered = encounteredIds.has(arc.id);

    let status: AmbitionStepStatus;
    if (isDone) {
      status = 'done';
    } else if (isEncountered) {
      status = 'active';
    } else {
      status = 'locked';
    }

    // Compter les événements de l'arc déjà répondus
    const stepsCompleted = arc.eventIds.filter((id) => answered.has(id)).length;
    const stepsTotal = arc.eventIds.length;

    return {
      arcId: arc.id,
      label: arc.name,
      status,
      stepsCompleted: isDone ? stepsTotal : stepsCompleted,
      stepsTotal,
    };
  });

  // Trier : actifs en premier, puis complétés, puis verrouillés
  const ORDER: Record<AmbitionStepStatus, number> = { active: 0, done: 1, locked: 2 };
  return steps.slice().sort((a, b) => ORDER[a.status] - ORDER[b.status]);
}

/**
 * Calcule la progression globale de l'Appel.
 * Utilisé pour la barre de progression principale.
 */
export function getCallingProgress(state: GameState): CallingProgress {
  const total = STORY_ARCS.length;
  const completedIds = new Set(state.completedArcs.map((a) => a.arcId));
  const encounteredIds = new Set(state.encounteredArcIds ?? []);

  const completed = completedIds.size;
  const active = [...encounteredIds].filter((id) => !completedIds.has(id)).length;
  const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

  return { completed, active, total, percent };
}
