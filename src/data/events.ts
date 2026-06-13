/**
 * Chargeur d'événements — point d'accès unique.
 * Les données sont en JSON dans game/data/events.json.
 * Plus de dual source of truth — le JSON est la seule source.
 */
import type { AfflictionEvent, LifeStage } from '../types/game';
import { VERSE_DATABASE } from './verses';
import RAW_EVENTS from '../../game/data/events.json';

export const EVENT_DATABASE: AfflictionEvent[] = RAW_EVENTS as AfflictionEvent[];
export const TOTAL_EVENTS = EVENT_DATABASE.length;

export function pickDecoys(
  correctId: string,
  category: string,
  count: number = 3,
  excludeIds: string[] = []
): string[] {
  const exclude = new Set([correctId, ...excludeIds]);
  const sameCategory = VERSE_DATABASE.filter(
    (v) => !exclude.has(v.id) && v.category === category
  );
  const others = VERSE_DATABASE.filter((v) => !exclude.has(v.id) && v.category !== category);

  const shuffledSame = [...sameCategory].sort(() => Math.random() - 0.5);
  const shuffledOthers = [...others].sort(() => Math.random() - 0.5);

  const result: string[] = [];
  for (const v of shuffledSame) {
    if (result.length >= count) break;
    result.push(v.id);
  }
  for (const v of shuffledOthers) {
    if (result.length >= count) break;
    result.push(v.id);
  }
  return result;
}

/** Récupère un événement par son ID */
export function getEventById(id: string): AfflictionEvent | undefined {
  return EVENT_DATABASE.find((e) => e.id === id);
}

/** Récupère tous les événements disponibles pour un âge donné */
export function getEventsForAge(age: number): AfflictionEvent[] {
  return EVENT_DATABASE.filter(
    (e) => age >= e.ageRange[0] && age <= e.ageRange[1]
  );
}

/** Retourne tous les événements avec leurs leurres assignés */
export function assignDecoys(): AfflictionEvent[] {
  return EVENT_DATABASE.map((event) => {
    if (event.decoyVerseIds.length > 0) return event;
    return {
      ...event,
      decoyVerseIds: pickDecoys(event.correctVerseId, event.category),
    };
  });
}

/** Résout un événement pour un âge spécifique (variante par stade de vie) */
function getLifeStage(age: number): LifeStage {
  if (age <= 11) return 'enfant';
  if (age <= 17) return 'ado';
  if (age <= 59) return 'adulte';
  return 'senior';
}

export function resolveEventForAge(
  event: AfflictionEvent,
  age: number
): AfflictionEvent {
  const stage = ['enfant', 'ado', 'adulte', 'senior'].includes(
    getLifeStage(age)
  )
    ? getLifeStage(age)
    : 'adulte';

  const variant = event.byAge?.[stage as LifeStage];
  if (!variant) return event;

  return {
    ...event,
    description: variant.description,
    thematicFlavor: variant.thematicFlavor ?? event.thematicFlavor,
    statImpactOnFail: variant.statImpactOnFail
      ? {
          foi: (event.statImpactOnFail.foi ?? 0) + (variant.statImpactOnFail.foi ?? 0),
          paix: (event.statImpactOnFail.paix ?? 0) + (variant.statImpactOnFail.paix ?? 0),
          physique: (event.statImpactOnFail.physique ?? 0) + (variant.statImpactOnFail.physique ?? 0),
          finances: (event.statImpactOnFail.finances ?? 0) + (variant.statImpactOnFail.finances ?? 0),
        }
      : event.statImpactOnFail,
  };
}
