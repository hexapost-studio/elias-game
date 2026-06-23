import { describe, it, expect } from 'vitest';
import { getDailyChallengeEvent, buildChallengeShareText } from '../src/engine/dailyChallenge';
import type { AfflictionEvent } from '../src/types/game';

function makeEvent(id: string, opts: Partial<AfflictionEvent> = {}): AfflictionEvent {
  return {
    id,
    title: `Event ${id}`,
    description: 'desc',
    ageRange: [20, 60],
    category: 'peur_angoisse',
    correctVerseId: 'v-test-001',
    decoyVerseIds: [],
    statImpactOnFail: { foi: -2, paix: -2, physique: 0, finances: 0 },
    ...opts,
  } as AfflictionEvent;
}

const BASE_EVENTS: AfflictionEvent[] = [
  makeEvent('e-001'),
  makeEvent('e-002'),
  makeEvent('e-003'),
  makeEvent('e-004'),
  makeEvent('e-arc', { storyArcId: 'arc-test' }),
  makeEvent('e-moral', { moralChoices: [{ id: 'm1', label: 'A', description: '', flagsSet: ['x'] }] }),
];

describe('getDailyChallengeEvent', () => {
  it('meme graine → meme event', () => {
    const r1 = getDailyChallengeEvent(BASE_EVENTS, 12345);
    const r2 = getDailyChallengeEvent(BASE_EVENTS, 12345);
    expect(r1?.id).toBe(r2?.id);
  });

  it('graine differente → peut donner un event different', () => {
    const ids = new Set(
      Array.from({ length: 30 }, (_, i) => getDailyChallengeEvent(BASE_EVENTS, i)?.id),
    );
    expect(ids.size).toBeGreaterThan(1);
  });

  it('exclut les events avec storyArcId', () => {
    for (let i = 0; i < 50; i++) {
      const e = getDailyChallengeEvent(BASE_EVENTS, i);
      expect(e?.storyArcId).toBeUndefined();
    }
  });

  it('exclut les events avec moralChoices', () => {
    for (let i = 0; i < 50; i++) {
      const e = getDailyChallengeEvent(BASE_EVENTS, i);
      expect(e?.moralChoices).toBeUndefined();
    }
  });

  it('retourne null si aucun event eligible', () => {
    const onlyArc = [makeEvent('e-arc', { storyArcId: 'arc-x' })];
    expect(getDailyChallengeEvent(onlyArc, 1)).toBeNull();
  });

  it('reste dans les bornes du tableau', () => {
    for (let i = 0; i < 100; i++) {
      const e = getDailyChallengeEvent(BASE_EVENTS, i);
      expect(e).not.toBeNull();
    }
  });
});

describe('buildChallengeShareText', () => {
  it('contient le statut succes', () => {
    const text = buildChallengeShareText('Élias', true, 'Jean 3.16', '23 juin');
    expect(text).toContain('✓');
    expect(text).toContain('23 juin');
    expect(text).toContain('Jean 3.16');
  });

  it('contient le statut echec', () => {
    const text = buildChallengeShareText('Élias', false, 'Jean 3.16', '23 juin');
    expect(text).toContain('✗');
  });

  it('contient le nom du joueur', () => {
    const text = buildChallengeShareText('Samuel', true, 'Prov 3.5', '1 juillet');
    expect(text).toContain('Samuel');
  });
});
