/**
 * verseProgression.ts — Résolution dynamique du type de question selon la maîtrise du verset.
 *
 * Principe (Design V2) :
 *   - jamais vu         → 'choice'   (4 versets complets, découverte)
 *   - vu, réussi ≥1     → 'wordBank' (mot-clé masqué)
 *   - vu, réussi ≥3     → 'completion' (fin du verset à retrouver)
 *   - vu, réussi ≥5 / 0 erreur → 'reference' (donner la référence)
 *
 * Règle de régression : trop d'erreurs → on redescend d'un niveau.
 * Règle éditoriale : si l'auteur a défini questionType dans le JSON
 *   ET que le verset est vu pour la 1ʳᵉ ou 2ᵉ fois → on respecte son intent.
 *
 * Les stats bougent toujours (toujours une épreuve narrative) —
 * c'est errorCount qui fait régresser le type, pas une pénalité séparée.
 */
import type { CodexEntry } from '../types/game';

export type QuestionType = 'choice' | 'wordBank' | 'completion' | 'reference';

/**
 * Détermine le type de question optimal pour un verset donné selon l'historique du joueur.
 *
 * @param verseId       ID du verset correct de l'event
 * @param codex         Entrées du codex (timesUsed, errorCount)
 * @param authorDefined Type défini par l'auteur dans le JSON (intention éditoriale)
 * @param canWordBank   L'event possède-t-il un champ `wordBank` ? Sans lui, le rendu
 *                      wordBank est impossible (VerseChoices exige `event.wordBank`) —
 *                      on ne doit JAMAIS résoudre vers 'wordBank' dans ce cas (écran vide).
 */
export function resolveQuestionType(
  verseId: string,
  codex: Record<string, CodexEntry>,
  authorDefined?: QuestionType,
  canWordBank: boolean = false,
): QuestionType {
  const entry = codex[verseId];

  // Intent éditorial respecté dès la 1ʳᵉ rencontre (et jusqu'à la 2ᵉ) : si l'auteur a
  // choisi un type, on l'honore — sinon le mode wordBank conçu à la main n'apparaîtrait
  // JAMAIS (les versets sont quasi toujours vus pour la 1ʳᵉ fois en une vie).
  if (authorDefined && (!entry || entry.timesUsed <= 2)) {
    if (authorDefined === 'wordBank' && !canWordBank) return 'choice';
    return authorDefined;
  }

  // Jamais vu, sans intent auteur → 'choice' (découverte en contexte émotionnel fort)
  if (!entry || entry.timesUsed === 0) return 'choice';

  const successes = Math.max(0, entry.timesUsed - entry.errorCount);
  const errorRate = entry.timesUsed > 0 ? entry.errorCount / entry.timesUsed : 0;

  // Taux d'erreur > 50 % → revenir aux bases
  if (errorRate > 0.5) return 'choice';

  // Progression par palier de maîtrise. wordBank n'est proposé que si l'event sait
  // le rendre (sinon on reste sur 'choice' jusqu'à la complétion, auto-suffisante).
  if (successes >= 5 && entry.errorCount === 0) return 'reference';
  if (successes >= 3) return 'completion';
  if (successes >= 1) return canWordBank ? 'wordBank' : 'choice';

  return 'choice';
}
