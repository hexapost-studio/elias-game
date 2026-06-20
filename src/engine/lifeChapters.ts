/**
 * @file lifeChapters.ts
 * @module engine/lifeChapters
 * @description Module pur — chapitres de vie d'Élias.
 *
 *   - `getChapterIntro(age, season, callingId?)` → carte d'intro de décennie
 *     (JournalEntry `[CHAPITRE]` type milestone) aux bornes 10, 20, …, 90 ans.
 *   - `getDecadeCliffhanger(age, state)` → JournalEntry sobre de fin de décennie
 *     (épreuve-capstone à venir) aux âges 9, 19, 29, …, 89 ans ; null sinon.
 *
 *   Les 10 décennies :
 *     L'Éveil (0-9) / La Formation (10-19) / L'Envol (20-29) / Le Combat (30-39)
 *     L'Épreuve (40-49) / La Maturité (50-59) / La Sagesse (60-69) / Le Crépuscule (70-79)
 *     L'Héritage (80-89) / L'Accomplissement (90-100)
 *
 *   Pas de React, pas de state. Pur : entrées primitives → sortie `JournalEntry`.
 *
 *   @since itér. 41 / T-24
 */

import type { JournalEntry, SpiritualSeasonName } from '../types/game';

/* ─── Données des décennies ─────────────────────────────────────────────── */

interface ChapterData {
  title: string;
  theme: string;
  /** Texte de cliffhanger sobre envoyé à la fin de la décennie (âge X9) */
  cliffhanger: string;
}

/**
 * Index 0 = décennie 0-9 (L'Éveil), index 1 = 10-19 (La Formation), …, index 9 = 90-99.
 */
const CHAPTERS: ChapterData[] = [
  {
    title: "L'Éveil",
    theme: "Les premières racines se posent. L'enfance est un sol.",
    cliffhanger: "Une nouvelle saison s'ouvre. Les fondations seront testées.",
  },
  {
    title: "La Formation",
    theme: "Le caractère se forge dans l'épreuve et la question.",
    cliffhanger: "Les choix de l'adolescence portent leurs fruits. Un carrefour approche.",
  },
  {
    title: "L'Envol",
    theme: "Le monde s'ouvre. L'appel prend forme, la foi doit voler seule.",
    cliffhanger: "La vie adulte apporte ses propres batailles. Le feu du combat attend.",
  },
  {
    title: "Le Combat",
    theme: "Tout ce qui a été cru est testé publiquement. La foi se prouve.",
    cliffhanger: "Le milieu de vie approche. Ce qui est construit sur le sable va trembler.",
  },
  {
    title: "L'Épreuve",
    theme: "Le désert du milieu de vie. Dieu travaille dans le silence.",
    cliffhanger: "La traversée touche à sa fin. La fidélité sera récompensée.",
  },
  {
    title: "La Maturité",
    theme: "Les fruits de la fidélité mûrissent. La profondeur dépasse la performance.",
    cliffhanger: "La sagesse attend ceux qui ont tenu. Les dernières grandes batailles commencent.",
  },
  {
    title: "La Sagesse",
    theme: "Ce qui compte a été purifié. La grâce rayonne depuis un cœur posé.",
    cliffhanger: "L'héritage se prépare. Une dernière traversée se profile à l'horizon.",
  },
  {
    title: "Le Crépuscule",
    theme: "L'heure de l'affinage final. Dieu sculpte jusqu'à la dernière heure.",
    cliffhanger: "La moisson finale approche. Ce qui a été semé pendant toute une vie va être récolté.",
  },
  {
    title: "L'Héritage",
    theme: "Transmettre la flamme. La vie vécue devient un message vivant.",
    cliffhanger: "L'accomplissement s'approche. La course touche à son ultime ligne droite.",
  },
  {
    title: "L'Accomplissement",
    theme: "La course est presque achevée. Chaque pas est une offrande.",
    cliffhanger: "La victoire finale est au bout. Tenir jusqu'à la dernière étape.",
  },
];

/* ─── Helpers internes ─────────────────────────────────────────────────────── */

/** Retourne l'index de décennie (0–9) depuis l'âge (0..99). */
function decadeIndex(age: number): number {
  return Math.min(Math.floor(age / 10), 9);
}

/** Libellé de saison courte en français. */
function seasonLabel(season: SpiritualSeasonName): string {
  const labels: Record<SpiritualSeasonName, string> = {
    Réveil: 'Réveil',
    Désert: 'Désert',
    Persécution: 'Épreuve',
    Abondance: 'Abondance',
    Grâce: 'Grâce',
  };
  return labels[season] ?? season;
}

/* ─── API publique ──────────────────────────────────────────────────────── */

/**
 * Retourne la carte d'intro d'une décennie — injectée dans le journal à l'entrée
 * d'une nouvelle décennie (âges 10, 20, 30, …, 90).
 *
 * @param age       - Nouvel âge (doit être un multiple de 10 et ≥ 10).
 * @param season    - Saison spirituelle déjà calculée pour cette décennie.
 * @param callingId - Identifiant d'Appel (optionnel, pour usage futur).
 * @returns JournalEntry de type `milestone` marquée `[CHAPITRE]`.
 */
export function getChapterIntro(
  age: number,
  season: SpiritualSeasonName,
  callingId?: string,
): JournalEntry {
  void callingId; // réservé pour personnalisation future (Phase 3)
  const idx = decadeIndex(age);
  const chapter = CHAPTERS[idx];
  return {
    age,
    text: `[CHAPITRE] ${chapter.title} (${age} ans) — ${chapter.theme} Saison : ${seasonLabel(season)}.`,
    type: 'milestone',
  };
}

/**
 * Retourne le cliffhanger de fin de décennie — injecté dans le journal aux âges
 * 9, 19, 29, 39, 49, 59, 69, 79, 89.
 *
 * @param age   - Nouvel âge. Retourne `null` si l'âge n'est pas en X9.
 * @param playerName - Nom du joueur pour personnaliser le texte.
 * @returns JournalEntry de type `milestone` marquée `[CLIFFHANGER]`, ou `null`.
 */
export function getDecadeCliffhanger(
  age: number,
  playerName: string,
): JournalEntry | null {
  // Déclencher aux âges 9, 19, 29, …, 89 (age % 10 === 9 ET age < 90)
  if (age % 10 !== 9 || age >= 90) return null;

  const idx = decadeIndex(age); // à 9 ans → index 0 (L'Éveil) → cliffhanger annonce La Formation
  const chapter = CHAPTERS[idx];
  const name = playerName || 'Élias';
  return {
    age,
    text: `[CLIFFHANGER] ${name} termine ${chapter.title}. ${chapter.cliffhanger}`,
    type: 'milestone',
  };
}

/**
 * Prédicat : l'âge est-il une borne de début de décennie (multiple de 10, ≥ 10) ?
 * Utilisé par `advanceAge` pour injecter la carte d'intro.
 */
export function isDecadeStart(age: number): boolean {
  return age >= 10 && age % 10 === 0;
}

/**
 * Prédicat : l'âge est-il une borne de fin de décennie (X9, < 90) ?
 * Utilisé par `advanceAge` pour injecter le cliffhanger.
 */
export function isDecadeEnd(age: number): boolean {
  return age % 10 === 9 && age < 90;
}
