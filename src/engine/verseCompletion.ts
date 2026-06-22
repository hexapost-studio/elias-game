/**
 * verseCompletion.ts — Mécanique "complétion de verset" (questionType: 'completion').
 *
 * Le début du verset est affiché, le joueur choisit la bonne fin parmi 4 options.
 * Principe ⑤ (effet de génération) : produire soi-même la fin est plus efficace
 * que reconnaître le verset entier.
 *
 * Stratégie de découpe : trouver la virgule/point-virgule le plus proche du milieu.
 * Les leurres sont des fins d'autres versets de la même catégorie (plausibles mais faux).
 */
import { mulberry32, hashSeed } from './rng';
import { seededShuffle } from './choiceOrder';

export interface CompletionChallenge {
  /** Début du verset affiché, se terminant par "___" */
  prefix: string;
  /** Options mélangées : [correcte, ...3 leurres] */
  options: string[];
  /** La fin correcte du verset */
  correctOption: string;
}

/**
 * Découpe un verset en (prefix, suffix) sur la frontière la plus naturelle
 * après le milieu du texte.
 */
export function splitVerseForCompletion(text: string): [string, string] {
  const mid = Math.floor(text.length * 0.42);
  const separators = [',', ';', '—', ':'];

  let bestIdx = -1;
  for (const sep of separators) {
    const idx = text.indexOf(sep, mid);
    if (idx !== -1 && (bestIdx === -1 || idx < bestIdx)) {
      bestIdx = idx;
    }
  }

  if (bestIdx !== -1) {
    const prefix = text.slice(0, bestIdx + 1).trim();
    const suffix = text.slice(bestIdx + 1).trim();
    // Suffixe trop court (< 10 car) → on prend plus large
    if (suffix.length >= 10) return [prefix, suffix];
  }

  // Repli : coupure au premier espace après 52 % du texte
  const fallbackAt = Math.floor(text.length * 0.52);
  const spaceIdx = text.indexOf(' ', fallbackAt);
  if (spaceIdx !== -1) {
    return [text.slice(0, spaceIdx).trim(), text.slice(spaceIdx + 1).trim()];
  }

  // Dernier recours : coupure brute au milieu
  const half = Math.floor(text.length / 2);
  return [text.slice(0, half).trim(), text.slice(half).trim()];
}

/**
 * Construit le challenge de complétion.
 *
 * @param verseText       Texte complet du verset correct
 * @param otherVerseTexts Textes d'autres versets (même catégorie) pour les leurres
 * @param eventId         ID de l'event (pour seedage déterministe)
 */
export function buildCompletionChallenge(
  verseText: string,
  otherVerseTexts: string[],
  eventId: string,
): CompletionChallenge {
  const [prefix, correctOption] = splitVerseForCompletion(verseText);

  // Générer des leurres depuis les fins d'autres versets
  const seed = hashSeed(eventId + correctOption);
  const rng = mulberry32(seed);

  const candidateEndings = otherVerseTexts
    .map((t) => splitVerseForCompletion(t)[1])
    .filter((e) => e !== correctOption && e.length >= 8 && e.length <= 120);

  // Mélanger et prendre 3 leurres
  const shuffledDecoys = seededShuffle(candidateEndings, Math.floor(rng() * 0xffffffff));
  const decoys = shuffledDecoys.slice(0, 3);

  // Si pas assez de leurres (catégorie trop petite), compléter avec des tronçons génériques
  while (decoys.length < 3) {
    decoys.push(['tu seras victorieux.', 'il te guidera.', 'ta foi sera récompensée.'][decoys.length]);
  }

  const options = seededShuffle([correctOption, ...decoys], seed ^ 0xdeadbeef);

  return { prefix, options, correctOption };
}
