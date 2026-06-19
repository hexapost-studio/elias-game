/**
 * @file avatarExpression.ts
 * @module engine/avatarExpression
 * @description Module pur (zéro React, zéro state) — dérive l'expression émotionnelle
 *   d'un avatar en fonction du ton de l'event et du résultat du choix.
 *
 *   3-4 expressions par émetteur :
 *   - heaven    : joy (avant), victory (après succès), neutral (milestone)
 *   - adversary : challenge (avant), defeat (après succès Élias), victory (après échec Élias)
 *   - entourage : neutral (avant), joy (après succès), warning (après échec)
 *   - conscience: neutral (avant), victory (après succès), warning (après échec)
 *
 *   Principe ASSET-READY : `expressionToAssetSuffix` produit un suffixe stable
 *   (`__challenge`, `__joy`…) qui s'ajoute à l'assetId de base pour cibler
 *   une variante d'illustration. L'art réel peut se brancher sans refactor.
 *
 *   @see src/engine/messageSender.ts     — SenderKind
 *   @see src/assets/illustrationRegistry.ts — registre des variantes
 *   @see src/components/JournalBubble.tsx   — consommateur
 *   @see docs/ROADMAP.md T-32
 *   @since itér. 51
 */

import type { JournalEntry } from '../types/game';
import type { SenderKind } from './messageSender';

/* ─── Type principal ──────────────────────────────────────────────────────── */

/**
 * Expression émotionnelle d'un avatar.
 *
 * - `neutral`   : état par défaut / jalon de vie / conscience équilibrée
 * - `challenge` : avant la réponse d'Élias — l'adversaire défie, l'entourage interpelle
 * - `victory`   : après une réussite — le Ciel célèbre, l'adversaire est brisé
 * - `defeat`    : après un échec d'Élias côté adversaire (l'adversaire gagne)
 * - `warning`   : mise en garde — après un échec côté Élias/entourage/conscience
 * - `joy`       : joie proactive — le Ciel envoie, l'entourage encourage
 */
export type AvatarExpression =
  | 'neutral'
  | 'challenge'
  | 'victory'
  | 'defeat'
  | 'warning'
  | 'joy';

/* ─── Suffixes d'asset ────────────────────────────────────────────────────── */

/**
 * Convertit une expression en suffixe d'assetId.
 *
 * Le suffixe s'ajoute à l'`assetId` de base pour cibler la variante :
 *   `elias__adversary__adversary_peur_angoisse` + `__challenge`
 *   → `elias__adversary__adversary_peur_angoisse__challenge`
 *
 * L'expression `neutral` retourne `''` (pas de suffixe) — l'assetId de base
 * est utilisé tel quel, préservant la compatibilité avec le registre existant.
 *
 * @param expr - L'expression à convertir
 * @returns Le suffixe (ex. `__challenge`) ou `''` pour neutral
 */
export function expressionToAssetSuffix(expr: AvatarExpression): string {
  if (expr === 'neutral') return '';
  return `__${expr}`;
}

/* ─── Dérivation de l'expression ─────────────────────────────────────────── */

/**
 * Dérive l'expression émotionnelle d'un avatar à partir d'une entrée de journal
 * et de l'identité de l'émetteur.
 *
 * Règles (par priorité) :
 *
 * | type d'entrée | sender     | expression            |
 * |---------------|------------|-----------------------|
 * | 'event'       | adversary  | challenge             |
 * | 'event'       | heaven     | joy                   |
 * | 'event'       | entourage  | challenge             |
 * | 'event'       | conscience | neutral               |
 * | 'success'     | heaven     | victory               |
 * | 'success'     | adversary  | defeat                |
 * | 'success'     | entourage  | joy                   |
 * | 'success'     | conscience | victory               |
 * | 'fail'        | heaven     | warning               |
 * | 'fail'        | adversary  | victory               |
 * | 'fail'        | entourage  | warning               |
 * | 'fail'        | conscience | warning               |
 * | 'milestone'   | *          | neutral               |
 * | 'cascade'     | adversary  | victory               |
 * | 'cascade'     | *          | warning               |
 * | 'micro'       | *          | joy                   |
 * | 'moral'       | conscience | neutral               |
 * | autre         | *          | neutral               |
 *
 * @param entry  - Entrée du journal (type + contenu)
 * @param sender - Identité de l'émetteur (SenderKind)
 * @returns L'expression émotionnelle dérivée (toujours définie)
 */
export function deriveExpression(
  entry: JournalEntry,
  sender: SenderKind,
): AvatarExpression {
  const { type } = entry;

  /* ── Avant réponse : l'event arrive ──────────────────────────────────── */
  if (type === 'event') {
    if (sender === 'adversary') return 'challenge';
    if (sender === 'heaven')    return 'joy';
    if (sender === 'entourage') return 'challenge';
    return 'neutral'; // conscience
  }

  /* ── Après réponse : succès ──────────────────────────────────────────── */
  if (type === 'success') {
    if (sender === 'adversary') return 'defeat';
    if (sender === 'heaven')    return 'victory';
    if (sender === 'entourage') return 'joy';
    return 'victory'; // conscience
  }

  /* ── Après réponse : échec ───────────────────────────────────────────── */
  if (type === 'fail') {
    if (sender === 'adversary') return 'victory';
    // heaven, entourage, conscience → avertissement gracieux
    return 'warning';
  }

  /* ── Cascade de conséquence (après un échec) ─────────────────────────── */
  if (type === 'cascade') {
    if (sender === 'adversary') return 'victory';
    return 'warning';
  }

  /* ── Micro-event (vie quotidienne) ───────────────────────────────────── */
  if (type === 'micro') {
    return 'joy';
  }

  /* ── Milestone (jalon de vie) + Moral (choix d'action) ──────────────── */
  // milestone, moral → neutre pour tous
  return 'neutral';
}

/* ─── Composition assetId + expression ───────────────────────────────────── */

/**
 * Compose l'`assetId` de variante en combinant l'assetId de base et l'expression.
 *
 * Si l'expression est `neutral`, l'assetId de base est retourné tel quel
 * (l'entrée de base du registre est déjà le placeholder neutre).
 *
 * @example
 *   buildExpressionAssetId('elias__adversary__adversary_peur_angoisse', 'challenge')
 *   // → 'elias__adversary__adversary_peur_angoisse__challenge'
 *
 * @example
 *   buildExpressionAssetId('elias__heaven__heaven_victory', 'neutral')
 *   // → 'elias__heaven__heaven_victory'
 */
export function buildExpressionAssetId(
  baseAssetId: string,
  expr: AvatarExpression,
): string {
  return baseAssetId + expressionToAssetSuffix(expr);
}
