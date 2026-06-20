import { describe, it, expect } from 'vitest';
import { getArcShape, getArcProgress } from '../src/engine/arcProgress';
import { STORY_ARCS } from '../src/data/storyArcs';
import { EVENT_DATABASE } from '../src/data/events';

const arc = (id: string) => STORY_ARCS.find((a) => a.id === id)!;

/* ═══════════════════════════════
   AP1 — Forme de l'arc (getArcShape)
   ═══════════════════════════════ */
describe('AP1: getArcShape — bifurcation détectée', () => {
  it('arc-louise : 4 positions, la séquence 3 est une bifurcation (2 variantes)', () => {
    const shape = getArcShape(arc('arc-louise'), EVENT_DATABASE);
    expect(shape.length).toBe(4);
    expect(shape.steps.map((s) => s.seq)).toEqual([1, 2, 3, 4]);

    const seq3 = shape.steps.find((s) => s.seq === 3)!;
    expect(seq3.variantIds).toContain('arc-louise-3');
    expect(seq3.variantIds).toContain('arc-louise-3-hard');
    expect(seq3.spineId).toBe('arc-louise-3'); // spine en tête

    // les autres séquences sont linéaires (une seule variante)
    expect(shape.steps.find((s) => s.seq === 1)!.variantIds).toEqual(['arc-louise-1']);
    expect(shape.steps.find((s) => s.seq === 4)!.variantIds).toEqual(['arc-louise-4']);
  });

  it('arc-heritage : aucun embranchement (non-régression linéaire)', () => {
    const shape = getArcShape(arc('arc-heritage'), EVENT_DATABASE);
    expect(shape.length).toBe(3);
    for (const step of shape.steps) {
      expect(step.variantIds.length).toBe(1);
    }
  });
});

/* ═══════════════════════════════
   AP2 — Overlay joueur (getArcProgress)
   ═══════════════════════════════ */
describe('AP2: getArcProgress — vécu / en cours / à venir + variante grisée', () => {
  const shape = getArcShape(arc('arc-louise'), EVENT_DATABASE);

  it('voie de grâce : la variante apaisée est prise, l’exigeante est grisée', () => {
    const answered = ['arc-louise-1', 'arc-louise-2', 'arc-louise-3'];
    const views = getArcProgress(shape, answered, 'arc-louise-4');

    const seq3 = views.find((v) => v.seq === 3)!;
    expect(seq3.status).toBe('done');
    expect(seq3.isFork).toBe(true);
    expect(seq3.takenId).toBe('arc-louise-3');
    expect(seq3.skippedIds).toEqual(['arc-louise-3-hard']);

    const seq4 = views.find((v) => v.seq === 4)!;
    expect(seq4.status).toBe('current'); // event courant
  });

  it('voie exigeante : la variante hard est prise, l’apaisée est grisée', () => {
    const answered = ['arc-louise-1', 'arc-louise-2', 'arc-louise-3-hard'];
    const views = getArcProgress(shape, answered, null);

    const seq3 = views.find((v) => v.seq === 3)!;
    expect(seq3.takenId).toBe('arc-louise-3-hard');
    expect(seq3.skippedIds).toEqual(['arc-louise-3']);
  });

  it('avant la bifurcation : aucune variante grisée (la branche ne se révèle qu’une fois choisie)', () => {
    const views = getArcProgress(shape, ['arc-louise-1'], 'arc-louise-2');
    const seq3 = views.find((v) => v.seq === 3)!;
    expect(seq3.status).toBe('todo');
    expect(seq3.takenId).toBeUndefined();
    expect(seq3.skippedIds).toEqual([]);
    // mais la bifurcation reste structurellement visible (◆)
    expect(seq3.isFork).toBe(true);

    const seq2 = views.find((v) => v.seq === 2)!;
    expect(seq2.status).toBe('current');
    const seq1 = views.find((v) => v.seq === 1)!;
    expect(seq1.status).toBe('done');
  });

  it('arc-heritage progresse sans aucune fork (non-régression)', () => {
    const hShape = getArcShape(arc('arc-heritage'), EVENT_DATABASE);
    const views = getArcProgress(hShape, ['arc-heritage-1'], 'arc-heritage-2');
    expect(views.every((v) => v.isFork === false)).toBe(true);
    expect(views.find((v) => v.seq === 1)!.status).toBe('done');
    expect(views.find((v) => v.seq === 2)!.status).toBe('current');
    expect(views.find((v) => v.seq === 3)!.status).toBe('todo');
  });
});
