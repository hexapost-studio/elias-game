/**
 * @file callings.ts
 * @description Chargeur des « Appels » (destinées de run).
 *
 * Un Appel est tiré à la naissance (pondéré) et recadre toute la partie :
 *  - biais de probabilité des saisons spirituelles,
 *  - biais de poids de sélection des catégories d'événements,
 *  - bonus de stats de départ,
 *  - saveur du titre de fin.
 *
 * Source unique : game/data/callings.json (modifiable par une IA sans risque).
 *
 * @see src/engine/gameEngine.ts — createInitialState (tirage), computeEventWeight (biais),
 *      computeSeasonTransition (biais saisons).
 * Partie 2 (roadmap) : le joueur pourra CHOISIR son Appel — getCallingById sert déjà à ça.
 */
import type { Calling } from '../types/game';
import type { Rng } from '../engine/rng';
import { rngWeightedPick } from '../engine/rng';
import RAW_CALLINGS from '../../game/data/callings.json';

export const CALLINGS: Calling[] = RAW_CALLINGS as Calling[];

export function getCallingById(id: string): Calling | undefined {
  return CALLINGS.find((c) => c.id === id);
}

/** Tire un Appel pondéré via un PRNG seedé (reproductible). */
export function pickCalling(rng: Rng): Calling {
  return rngWeightedPick(rng, CALLINGS, CALLINGS.map((c) => c.weight));
}
