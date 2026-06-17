import { describe, it, expect } from 'vitest';
import { validateStoryGraph } from '../src/engine/storyGraph';
import { STORY_ARCS } from '../src/data/storyArcs';
import { EVENT_DATABASE, getEventById } from '../src/data/events';
import {
  createInitialState,
  validateChoice,
  filterEventsByPrerequisites,
  isArcStepUnlocked,
} from '../src/engine/gameEngine';
import type { StoryArc, AfflictionEvent } from '../src/types/game';

/* Fabriques minimales pour les cas synthétiques */
const mkEvent = (over: Partial<AfflictionEvent>): AfflictionEvent => ({
  id: 'x',
  title: 't',
  description: 'd',
  ageRange: [0, 100],
  category: 'amertume_rejet',
  correctVerseId: 'v-amer-001',
  decoyVerseIds: [],
  statImpactOnFail: { foi: 0, paix: 0, physique: 0, finances: 0 },
  ...over,
});
const mkArc = (over: Partial<StoryArc>): StoryArc => ({
  id: 'a',
  name: 'n',
  description: 'd',
  eventIds: [],
  rewardVerseId: 'v-amer-001',
  rewardTitle: 'T',
  ...over,
});

/* ═══════════════════════════════
   SG1 — Garde d'intégrité (CI)
   ═══════════════════════════════ */
describe('SG1: validateStoryGraph sur les données réelles', () => {
  it('le graphe narratif complet est cohérent (atteignable, sans orphelin, flags posés)', () => {
    const report = validateStoryGraph(STORY_ARCS, EVENT_DATABASE);
    if (!report.ok) console.error('storyGraph errors:', report.errors);
    expect(report.errors).toEqual([]);
    expect(report.ok).toBe(true);
  });
});

/* ═══════════════════════════════
   SG2 — Cas synthétiques d'échec
   ═══════════════════════════════ */
describe('SG2: détection de contenu incohérent', () => {
  it('flag requis « à vrai » jamais posé → contenu mort détecté', () => {
    const arcs = [mkArc({ id: 'arcX', eventIds: ['x1', 'x2'] })];
    const events = [
      mkEvent({ id: 'x1', storyArcId: 'arcX', arcSequence: 1 }),
      mkEvent({
        id: 'x2',
        storyArcId: 'arcX',
        arcSequence: 2,
        prerequisites: [{ kind: 'flag', flagId: 'jamais_pose' }],
      }),
    ];
    const report = validateStoryGraph(arcs, events);
    expect(report.ok).toBe(false);
    expect(report.errors.some((e) => e.includes('jamais_pose'))).toBe(true);
  });

  it('séquence orpheline (trou) → détectée', () => {
    const arcs = [mkArc({ id: 'arcY', eventIds: ['y1', 'y2', 'y3'] })];
    const events = [
      mkEvent({ id: 'y1', storyArcId: 'arcY', arcSequence: 1 }),
      // y2 manquant → trou ; y3 en séquence 3 orpheline
      mkEvent({ id: 'y3', storyArcId: 'arcY', arcSequence: 3 }),
    ];
    const report = validateStoryGraph(arcs, events);
    expect(report.ok).toBe(false);
    expect(report.errors.some((e) => e.includes('orpheline') || e.includes('introuvable'))).toBe(
      true
    );
  });

  it('prérequis « flag à faux » ne réclame aucun poseur (absence = défaut) → cohérent', () => {
    const arcs = [mkArc({ id: 'arcZ', eventIds: ['z1', 'z2'] })];
    const events = [
      mkEvent({ id: 'z1', storyArcId: 'arcZ', arcSequence: 1 }),
      mkEvent({
        id: 'z2',
        storyArcId: 'arcZ',
        arcSequence: 2,
        prerequisites: [{ kind: 'flag', flagId: 'optionnel', value: false }],
      }),
    ];
    const report = validateStoryGraph(arcs, events);
    expect(report.ok).toBe(true);
  });
});

/* ═══════════════════════════════
   SG3 — Pose de flag (validateChoice)
   ═══════════════════════════════ */
describe('SG3: les flags de conséquence sont posés par le choix', () => {
  const setupLouise2 = () => {
    const s = createInitialState();
    s.age = 33;
    s.phase = 'event';
    s.currentEvent = getEventById('arc-louise-2')!;
    return s;
  };

  it('réussir arc-louise-2 pose louise_pardonnee=true', () => {
    const s = setupLouise2();
    const { correct, newState } = validateChoice(s, s.currentEvent!.correctVerseId);
    expect(correct).toBe(true);
    expect(newState.flags.louise_pardonnee).toBe(true);
  });

  it('échouer arc-louise-2 ne pose aucun flag (grâce, pas punition)', () => {
    const s = setupLouise2();
    const wrong = 'v-amer-001'; // ≠ v-amer-009
    const { correct, newState } = validateChoice(s, wrong);
    expect(correct).toBe(false);
    expect(newState.flags.louise_pardonnee ?? false).toBe(false);
  });

  it('les flags sont fonction pure de la séquence de choix, indépendants du seed', () => {
    const run = (seed: number) => {
      const s = createInitialState(undefined, seed);
      s.age = 33;
      s.phase = 'event';
      s.currentEvent = getEventById('arc-louise-2')!;
      return validateChoice(s, s.currentEvent.correctVerseId).newState.flags;
    };
    expect(run(1)).toEqual(run(987654));
  });
});

/* ═══════════════════════════════
   SG4 — Branchement par le flag
   ═══════════════════════════════ */
describe('SG4: le flag aiguille la variante de séquence 3', () => {
  const grace = () => getEventById('arc-louise-3')!;
  const hard = () => getEventById('arc-louise-3-hard')!;

  it('flag posé → variante apaisée éligible, variante exigeante exclue', () => {
    const s = createInitialState();
    s.flags = { louise_pardonnee: true };
    const ids = filterEventsByPrerequisites([grace(), hard()], s).map((e) => e.id);
    expect(ids).toContain('arc-louise-3');
    expect(ids).not.toContain('arc-louise-3-hard');
  });

  it('flag absent → variante exigeante éligible, variante apaisée exclue', () => {
    const s = createInitialState();
    const ids = filterEventsByPrerequisites([grace(), hard()], s).map((e) => e.id);
    expect(ids).toContain('arc-louise-3-hard');
    expect(ids).not.toContain('arc-louise-3');
  });
});

/* ═══════════════════════════════
   SG5 — Convergence (Ajustement A)
   ═══════════════════════════════ */
describe('SG5: les deux branches convergent vers le goulet final', () => {
  it('arc-louise-4 se déverrouille après N’IMPORTE QUELLE variante de séquence 3', () => {
    const base = () => {
      const s = createInitialState();
      s.encounteredArcIds = ['arc-louise'];
      return s;
    };
    const viaGrace = base();
    viaGrace.answeredArcEventIds = ['arc-louise-3'];
    expect(isArcStepUnlocked(viaGrace, getEventById('arc-louise-4')!)).toBe(true);

    const viaHard = base();
    viaHard.answeredArcEventIds = ['arc-louise-3-hard'];
    expect(isArcStepUnlocked(viaHard, getEventById('arc-louise-4')!)).toBe(true);
  });

  it('la séquence 4 reste verrouillée tant qu’aucune étape 3 n’est répondue', () => {
    const s = createInitialState();
    s.encounteredArcIds = ['arc-louise'];
    s.answeredArcEventIds = ['arc-louise-2'];
    expect(isArcStepUnlocked(s, getEventById('arc-louise-4')!)).toBe(false);
  });
});

/* ═══════════════════════════════
   SG6 — Non-régression linéaire
   ═══════════════════════════════ */
describe('SG6: un arc linéaire progresse 1→2→3 inchangé', () => {
  it('arc-heritage suit sa séquence sans saut', () => {
    const fresh = createInitialState();
    expect(isArcStepUnlocked(fresh, getEventById('arc-heritage-1')!)).toBe(true);

    const s = createInitialState();
    s.encounteredArcIds = ['arc-heritage'];
    s.answeredArcEventIds = ['arc-heritage-1'];
    expect(isArcStepUnlocked(s, getEventById('arc-heritage-2')!)).toBe(true);
    expect(isArcStepUnlocked(s, getEventById('arc-heritage-3')!)).toBe(false);

    s.answeredArcEventIds = ['arc-heritage-1', 'arc-heritage-2'];
    expect(isArcStepUnlocked(s, getEventById('arc-heritage-3')!)).toBe(true);
  });

  it('une fois l’arc commencé, la séquence 1 ne se redéclenche pas', () => {
    const s = createInitialState();
    s.encounteredArcIds = ['arc-heritage'];
    expect(isArcStepUnlocked(s, getEventById('arc-heritage-1')!)).toBe(false);
  });
});
