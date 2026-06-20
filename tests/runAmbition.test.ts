/**
 * Tests pour src/engine/runAmbition.ts (T-25)
 *
 * Module pur — testé sans navigateur ni React.
 */
import { describe, it, expect } from 'vitest';
import { deriveRunAmbition, getCallingProgress } from '../src/engine/runAmbition';
import { STORY_ARCS } from '../src/data/storyArcs';
import type { GameState } from '../src/types/game';

/** État minimal pour les tests — seuls les champs utilisés par runAmbition sont renseignés */
function makeState(overrides: Partial<Pick<GameState, 'completedArcs' | 'encounteredArcIds' | 'answeredArcEventIds'>> = {}): Pick<GameState, 'completedArcs' | 'encounteredArcIds' | 'answeredArcEventIds'> {
  return {
    completedArcs: [],
    encounteredArcIds: [],
    answeredArcEventIds: [],
    ...overrides,
  };
}

describe('deriveRunAmbition', () => {
  it('retourne autant d\'étapes que d\'arcs dans STORY_ARCS', () => {
    const steps = deriveRunAmbition(makeState() as GameState);
    expect(steps).toHaveLength(STORY_ARCS.length);
  });

  it('tous les arcs sont "locked" quand aucun n\'est rencontré', () => {
    const steps = deriveRunAmbition(makeState() as GameState);
    expect(steps.every((s) => s.status === 'locked')).toBe(true);
  });

  it('un arc rencontré (non terminé) a le statut "active"', () => {
    const firstArcId = STORY_ARCS[0].id;
    const steps = deriveRunAmbition(
      makeState({ encounteredArcIds: [firstArcId] }) as GameState,
    );
    const step = steps.find((s) => s.arcId === firstArcId);
    expect(step?.status).toBe('active');
  });

  it('un arc complété a le statut "done"', () => {
    const firstArcId = STORY_ARCS[0].id;
    const steps = deriveRunAmbition(
      makeState({
        encounteredArcIds: [firstArcId],
        completedArcs: [{ arcId: firstArcId, completedAtAge: 30 }],
      }) as GameState,
    );
    const step = steps.find((s) => s.arcId === firstArcId);
    expect(step?.status).toBe('done');
  });

  it('les arcs actifs apparaissent AVANT les arcs complétés et verrouillés', () => {
    const arcs = STORY_ARCS;
    const completedId = arcs[0].id;
    const activeId = arcs[1].id;
    const steps = deriveRunAmbition(
      makeState({
        encounteredArcIds: [completedId, activeId],
        completedArcs: [{ arcId: completedId, completedAtAge: 25 }],
      }) as GameState,
    );
    const activeIdx = steps.findIndex((s) => s.arcId === activeId);
    const completedIdx = steps.findIndex((s) => s.arcId === completedId);
    expect(activeIdx).toBeLessThan(completedIdx);
  });

  it('stepsCompleted reflète les événements répondus de l\'arc', () => {
    const arc = STORY_ARCS[0];
    const answeredId = arc.eventIds[0];
    const steps = deriveRunAmbition(
      makeState({
        encounteredArcIds: [arc.id],
        answeredArcEventIds: [answeredId],
      }) as GameState,
    );
    const step = steps.find((s) => s.arcId === arc.id);
    expect(step?.stepsCompleted).toBe(1);
    expect(step?.stepsTotal).toBe(arc.eventIds.length);
  });

  it('un arc complété a stepsCompleted === stepsTotal', () => {
    const arc = STORY_ARCS[0];
    const steps = deriveRunAmbition(
      makeState({
        encounteredArcIds: [arc.id],
        completedArcs: [{ arcId: arc.id, completedAtAge: 40 }],
      }) as GameState,
    );
    const step = steps.find((s) => s.arcId === arc.id);
    expect(step?.stepsCompleted).toBe(step?.stepsTotal);
  });

  it('le label de chaque étape correspond au nom de l\'arc', () => {
    const steps = deriveRunAmbition(makeState() as GameState);
    for (const step of steps) {
      const arc = STORY_ARCS.find((a) => a.id === step.arcId);
      expect(step.label).toBe(arc?.name);
    }
  });
});

describe('getCallingProgress', () => {
  it('retourne completed=0, active=0, percent=0 au départ', () => {
    const progress = getCallingProgress(makeState() as GameState);
    expect(progress.completed).toBe(0);
    expect(progress.active).toBe(0);
    expect(progress.percent).toBe(0);
    expect(progress.total).toBe(STORY_ARCS.length);
  });

  it('active est le nombre d\'arcs rencontrés non terminés', () => {
    const firstId = STORY_ARCS[0].id;
    const secondId = STORY_ARCS[1].id;
    const progress = getCallingProgress(
      makeState({
        encounteredArcIds: [firstId, secondId],
        completedArcs: [{ arcId: firstId, completedAtAge: 30 }],
      }) as GameState,
    );
    expect(progress.completed).toBe(1);
    expect(progress.active).toBe(1);
  });

  it('percent est le ratio des arcs complétés (arrondi)', () => {
    const completedId = STORY_ARCS[0].id;
    const progress = getCallingProgress(
      makeState({
        encounteredArcIds: [completedId],
        completedArcs: [{ arcId: completedId, completedAtAge: 30 }],
      }) as GameState,
    );
    const expected = Math.round((1 / STORY_ARCS.length) * 100);
    expect(progress.percent).toBe(expected);
  });

  it('percent est 100 quand tous les arcs sont terminés', () => {
    const progress = getCallingProgress(
      makeState({
        encounteredArcIds: STORY_ARCS.map((a) => a.id),
        completedArcs: STORY_ARCS.map((a) => ({ arcId: a.id, completedAtAge: 50 })),
      }) as GameState,
    );
    expect(progress.percent).toBe(100);
    expect(progress.completed).toBe(STORY_ARCS.length);
    expect(progress.active).toBe(0);
  });
});
