/**
 * wordBank.ts — Mécanique « mot caché » style Duolingo (T-42).
 *
 * Module PUR : pas d'import React, pas d'effets de bord.
 * Entrée  : texte du verset + mot à masquer + leurres + id de l'event (seed)
 * Sortie  : texte avec ____ + chips mélangées de façon déterministe
 */
import { seededShuffle } from './choiceOrder';
import { hashSeed } from '../engine/rng';

export interface WordBankChallenge {
  /** Texte du verset avec le mot-clé remplacé par ____. */
  displayText: string;
  /** Chips mélangées de façon seedée : [mot_correct, ...leurres] dans un ordre aléatoire. */
  chips: string[];
  /** Le mot correct (pour valider le clic du joueur). */
  correctChip: string;
}

/**
 * Construit le défi word-bank à partir des données brutes.
 * La graine dérive de `eventId + hiddenWord` → stable pour un event donné.
 */
export function buildWordBankChallenge(
  verseText: string,
  hiddenWord: string,
  decoys: string[],
  eventId: string,
): WordBankChallenge {
  // Remplacer la PREMIÈRE occurrence du mot (insensible à la casse).
  const escaped = hiddenWord.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(escaped, 'i');
  const displayText = verseText.replace(regex, '____');

  // Mélange déterministe : même eventId + hiddenWord → même ordre de chips.
  const allChips = [hiddenWord, ...decoys];
  const chips = seededShuffle(allChips, hashSeed(eventId + hiddenWord));

  return { displayText, chips, correctChip: hiddenWord };
}
