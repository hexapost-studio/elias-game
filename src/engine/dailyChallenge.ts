/**
 * dailyChallenge.ts — Épreuve du jour (Design V2).
 *
 * Un event par jour, identique pour tous les joueurs.
 * Graine = nombre de jours depuis l'époque Unix → stable sur 24h.
 * Résultat partageable en texte : "J'ai répondu à l'épreuve du [date]".
 *
 * Module PUR — aucune dépendance React, testable.
 */
import { mulberry32 } from './rng';
import type { AfflictionEvent } from '../types/game';

/** Jours depuis l'époque Unix (stable sur toute la journée UTC). */
export function todayDaySeed(): number {
  return Math.floor(Date.now() / 86_400_000);
}

/**
 * Détermine l'event du jour de façon déterministe.
 * Exclut les events de dilemme moral (moralChoices) et les arcs (trop narratifs).
 */
export function getDailyChallengeEvent(
  events: AfflictionEvent[],
  daySeed?: number,
): AfflictionEvent | null {
  const eligible = events.filter(
    (e) => !e.moralChoices && !e.storyArcId && !!e.correctVerseId,
  );
  if (eligible.length === 0) return null;

  const seed = daySeed ?? todayDaySeed();
  const rng = mulberry32(seed);
  const idx = Math.floor(rng() * eligible.length);
  return eligible[idx];
}

/** Label de la date du jour en français (ex: "23 juin"). */
export function todayLabel(): string {
  return new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' });
}

/** Texte partageable du résultat du défi. */
export function buildChallengeShareText(
  playerName: string,
  success: boolean,
  verseRef: string,
  date: string,
): string {
  const emoji = success ? '✓' : '✗';
  return [
    `${emoji} Épreuve du ${date} — Élias`,
    success
      ? `${playerName} a répondu avec ${verseRef}`
      : `${playerName} a tenté l'épreuve avec ${verseRef}`,
    '',
    'Rejoins la communauté sur Élias — le jeu de vie chrétien',
  ].join('\n');
}
