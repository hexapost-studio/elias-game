/**
 * Dérivation pure de la PROGRESSION d'un arc ramifié — pour le visualizer (B-2).
 *
 * Module PUR : aucune dépendance React, aucun RNG, aucune mutation d'état. Il ne fait que
 * *dériver* l'affichage depuis ce que l'état contient déjà (`answeredArcEventIds`, l'event
 * courant) + la base d'events. Aucun nouveau champ d'état (patron « dériver plutôt qu'ajouter »).
 *
 * Deux étages :
 *  - `getArcShape` : la FORME statique d'un arc (positions 1..length + variantes par séquence),
 *    où une séquence à plusieurs events est une bifurcation (spine + variantes hors-spine) ;
 *  - `getArcProgress` : l'OVERLAY joueur (vécu / en cours / à venir + variante prise vs grisées).
 */
import type { StoryArc, AfflictionEvent } from '../types/game';

export interface ArcStep {
  seq: number;
  /** id de spine attendu en `eventIds[seq-1]` (peut manquer si la donnée est incohérente). */
  spineId?: string;
  /** tous les events de cette séquence (spine + variantes hors-spine), spine en tête. */
  variantIds: string[];
}

export interface ArcShape {
  arcId: string;
  length: number;
  steps: ArcStep[]; // ordonnés par séquence croissante 1..length
}

export type StepStatus = 'done' | 'current' | 'todo';

export interface StepView {
  seq: number;
  status: StepStatus;
  /** bifurcation = plus d'une variante possible à cette séquence. */
  isFork: boolean;
  /** variante effectivement vécue (répondue ou en cours), si connue. */
  takenId?: string;
  /** variantes NON prises à cette séquence (à griser dans le visualizer). */
  skippedIds: string[];
}

/** Forme statique d'un arc : positions 1..length, variantes regroupées par séquence.
 * Les events-cascade (cibles d'un `cascadeEventId`) sont EXCLUS : ce sont des détours d'échec,
 * pas de vrais embranchements de spine — sinon presque chaque pas paraîtrait bifurqué et noierait
 * la divergence signifiante (celle pilotée par les flags). */
export function getArcShape(arc: StoryArc, events: AfflictionEvent[]): ArcShape {
  const length = arc.eventIds.length;
  const cascadeIds = new Set<string>();
  for (const e of events) if (e.cascadeEventId) cascadeIds.add(e.cascadeEventId);

  const bySeq = new Map<number, string[]>();
  for (const e of events) {
    if (e.storyArcId !== arc.id || e.arcSequence == null) continue;
    if (cascadeIds.has(e.id)) continue; // détour d'échec, pas une variante de branche
    const list = bySeq.get(e.arcSequence);
    if (list) list.push(e.id);
    else bySeq.set(e.arcSequence, [e.id]);
  }

  const steps: ArcStep[] = [];
  for (let seq = 1; seq <= length; seq++) {
    const spineId = arc.eventIds[seq - 1];
    const all = bySeq.get(seq) ?? (spineId ? [spineId] : []);
    // spine en tête pour un ordre d'affichage stable
    const variantIds = [...all].sort((a, b) =>
      a === spineId ? -1 : b === spineId ? 1 : a.localeCompare(b)
    );
    steps.push({ seq, spineId, variantIds });
  }
  return { arcId: arc.id, length, steps };
}

/**
 * Overlay joueur sur la forme d'un arc.
 * - `done`    : une variante de cette séquence a été répondue ;
 * - `current` : l'event courant appartient à cette séquence ;
 * - `todo`    : pas encore atteinte.
 * `takenId` = la variante vécue (répondue, sinon l'event courant) ; `skippedIds` = les autres.
 */
export function getArcProgress(
  shape: ArcShape,
  answeredArcEventIds: string[],
  currentEventId: string | null
): StepView[] {
  const answered = new Set(answeredArcEventIds);
  return shape.steps.map((step) => {
    const takenId =
      step.variantIds.find((id) => answered.has(id)) ??
      (currentEventId && step.variantIds.includes(currentEventId) ? currentEventId : undefined);

    let status: StepStatus = 'todo';
    if (step.variantIds.some((id) => answered.has(id))) status = 'done';
    else if (currentEventId && step.variantIds.includes(currentEventId)) status = 'current';

    const skippedIds = takenId ? step.variantIds.filter((id) => id !== takenId) : [];

    return {
      seq: step.seq,
      status,
      isFork: step.variantIds.length > 1,
      takenId,
      skippedIds,
    };
  });
}
