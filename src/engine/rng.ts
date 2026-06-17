/**
 * @file rng.ts
 * @description Générateur pseudo-aléatoire seedé (mulberry32).
 *
 * Pourquoi : pour que « chaque lancement soit une nouvelle aventure » de façon
 * REPRODUCTIBLE. Un seed unique est tiré à la naissance ; les systèmes qui
 * façonnent l'identité d'une run (Appel, saisons émergentes, traits) tirent leur
 * hasard d'un PRNG seedé plutôt que de Math.random().
 *
 * Avantages :
 *  - Tests déterministes (même seed → même trajectoire).
 *  - Diagnostic feedback : on peut joindre le seed et rejouer une vie.
 *  - Base du futur partage « rejoue ma vie » (Partie 3+).
 *
 * Le reste du moteur (sélection fine d'événements, leurres…) continue d'utiliser
 * Math.random() — on ne seede que la « colonne vertébrale » de la run.
 */

/** PRNG mulberry32 — rapide, bonne distribution, 32 bits de state. */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Source de hasard injectable : () => [0,1). */
export type Rng = () => number;

/** Génère un seed de run à partir de l'horloge (32 bits). */
export function makeSeed(): number {
  return (Math.floor(Math.random() * 0xffffffff) ^ Date.now()) >>> 0;
}

/** Tire un entier dans [min, max] inclus. */
export function rngInt(rng: Rng, min: number, max: number): number {
  return Math.floor(min + rng() * (max - min + 1));
}

/** Choisit un élément au hasard dans un tableau non vide. */
export function rngPick<T>(rng: Rng, arr: readonly T[]): T {
  return arr[Math.floor(rng() * arr.length)];
}

/**
 * Hache une chaîne en seed 32 bits (FNV-1a). Pour seeder de façon STABLE un
 * élément identifié par une string (ex. un verset par son id) : même id → même
 * tirage, sans état ni Math.random — donc un texte « vivant » mais non clignotant.
 */
export function hashSeed(str: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/** Tirage pondéré : items[i] a un poids weights[i] (>= 0). */
export function rngWeightedPick<T>(rng: Rng, items: readonly T[], weights: readonly number[]): T {
  const total = weights.reduce((s, w) => s + Math.max(0, w), 0);
  if (total <= 0) return items[items.length - 1];
  let r = rng() * total;
  for (let i = 0; i < items.length; i++) {
    r -= Math.max(0, weights[i]);
    if (r <= 0) return items[i];
  }
  return items[items.length - 1];
}
