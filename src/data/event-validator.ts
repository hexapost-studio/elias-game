/**
 * @file event-validator.ts
 * @description Validation des événements générés par IA avant insertion dans events.ts.
 *
 * Chaque fonction retourne un tableau d'erreurs humainement lisibles.
 * Un tableau vide = événement valide.
 *
 * ─── USAGE TYPIQUE ───────────────────────────────────────────────────────────
 *
 * ```typescript
 * import { validateGeneratedEvent } from './event-validator';
 * import { VERSE_DATABASE } from './verses';
 *
 * const errors = validateGeneratedEvent(candidate, VERSE_DATABASE);
 * if (errors.length > 0) {
 *   console.error('Événement rejeté:', errors);
 * } else {
 *   // injecter dans events.ts
 * }
 * ```
 *
 * @see src/data/event-schema.ts  — constantes BALANCE_RULES, NARRATIVE_RULES, EJP_RULES
 * @see scripts/generate-events.ts — consommateur principal de ce module
 */

import type { VerseEntry } from '../types/game';
import {
  BALANCE_RULES,
  NARRATIVE_RULES,
  EJP_RULES,
  CATEGORY_META,
  type GeneratedEvent,
} from './event-schema';

// ─── TYPES ────────────────────────────────────────────────────────────────────

/** Un problème trouvé dans un événement candidat */
export interface ValidationError {
  field: string;
  message: string;
  value?: unknown;
}

/** Résultat complet de validation */
export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
}

// ─── VALIDATOR PRINCIPAL ──────────────────────────────────────────────────────

/**
 * Valide un événement généré par IA contre toutes les règles du jeu.
 *
 * @param event    Événement candidat (sorti du modèle IA)
 * @param verses   Pool de versets actuel (pour vérifier correctVerseId)
 * @param existingIds  IDs déjà existants dans events.ts (pour détecter doublons)
 */
export function validateGeneratedEvent(
  event: GeneratedEvent,
  verses: VerseEntry[],
  existingIds: Set<string> = new Set(),
): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];

  validateId(event, existingIds, errors);
  validateTitle(event, errors);
  validateDescription(event, errors, warnings);
  validateAgeRange(event, errors);
  validateCategory(event, errors, warnings);
  validateVerse(event, verses, errors, warnings);
  validateStatImpact(event, errors);
  validateEjpRules(event, warnings);

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

// ─── SOUS-VALIDATORS ──────────────────────────────────────────────────────────

/**
 * Vérifie l'unicité et le format de l'ID.
 * Format attendu: "e-{idShort}-{3digits}" ex: "e-priere-042"
 */
function validateId(
  event: GeneratedEvent,
  existingIds: Set<string>,
  errors: ValidationError[],
): void {
  if (!event.id) {
    errors.push({ field: 'id', message: 'ID manquant' });
    return;
  }

  if (!/^e-[a-z]+-\d{3}$/.test(event.id)) {
    errors.push({
      field: 'id',
      message: `Format invalide. Attendu: "e-{catShort}-{3digits}", reçu: "${event.id}"`,
      value: event.id,
    });
  }

  if (existingIds.has(event.id)) {
    errors.push({
      field: 'id',
      message: `ID en doublon: "${event.id}" existe déjà dans events.ts`,
      value: event.id,
    });
  }
}

/**
 * Vérifie que le titre est présent et assez court.
 * Max 7 mots — c'est un titre de rubrique, pas une phrase.
 */
function validateTitle(event: GeneratedEvent, errors: ValidationError[]): void {
  if (!event.title?.trim()) {
    errors.push({ field: 'title', message: 'Titre manquant' });
    return;
  }

  const words = event.title.trim().split(/\s+/).length;
  if (words > NARRATIVE_RULES.titleMaxWords) {
    errors.push({
      field: 'title',
      message: `Titre trop long (${words} mots, max ${NARRATIVE_RULES.titleMaxWords})`,
      value: event.title,
    });
  }
}

/**
 * Vérifie que la description respecte les longueurs et la vue subjective.
 */
function validateDescription(
  event: GeneratedEvent,
  errors: ValidationError[],
  warnings: ValidationError[],
): void {
  const desc = event.description?.trim() ?? '';

  if (!desc) {
    errors.push({ field: 'description', message: 'Description manquante' });
    return;
  }

  if (desc.length < NARRATIVE_RULES.descriptionMinChars) {
    errors.push({
      field: 'description',
      message: `Description trop courte (${desc.length} chars, min ${NARRATIVE_RULES.descriptionMinChars})`,
      value: desc,
    });
  }

  if (desc.length > NARRATIVE_RULES.descriptionMaxChars) {
    errors.push({
      field: 'description',
      message: `Description trop longue (${desc.length} chars, max ${NARRATIVE_RULES.descriptionMaxChars})`,
      value: desc.slice(0, 50) + '...',
    });
  }

  // Vérification vue subjective — doit commencer par un pattern autorisé
  const hasValidStart = EJP_RULES.allowedStartPatterns.some(pattern =>
    desc.startsWith(pattern)
  );
  if (!hasValidStart) {
    warnings.push({
      field: 'description',
      message: `La description ne commence pas par un pattern subjectif (Tu/Ton/Ta/Une/Un…). Début reçu: "${desc.slice(0, 30)}"`,
    });
  }
}

/**
 * Vérifie que la tranche d'âge est cohérente.
 */
function validateAgeRange(event: GeneratedEvent, errors: ValidationError[]): void {
  const [min, max] = event.ageRange ?? [];

  if (min === undefined || max === undefined) {
    errors.push({ field: 'ageRange', message: 'ageRange doit être [min, max]' });
    return;
  }

  if (min < BALANCE_RULES.minAge || max > BALANCE_RULES.maxAge) {
    errors.push({
      field: 'ageRange',
      message: `Âge hors limites [${BALANCE_RULES.minAge}–${BALANCE_RULES.maxAge}], reçu [${min}–${max}]`,
      value: event.ageRange,
    });
  }

  if (min >= max) {
    errors.push({
      field: 'ageRange',
      message: `ageRange[0] (${min}) doit être inférieur à ageRange[1] (${max})`,
      value: event.ageRange,
    });
  }

  // Cohérence sémantique : stérilité arrive rarement avant 20 ans
  if (event.category === 'sterilite' && min < 20) {
    errors.push({
      field: 'ageRange',
      message: `Catégorie "stérilité" : ageMin doit être ≥ 20 ans (reçu ${min})`,
    });
  }
}

/**
 * Vérifie que la catégorie existe dans le schéma.
 */
function validateCategory(
  event: GeneratedEvent,
  errors: ValidationError[],
  warnings: ValidationError[],
): void {
  if (!event.category) {
    errors.push({ field: 'category', message: 'Catégorie manquante' });
    return;
  }

  if (!CATEGORY_META[event.category]) {
    errors.push({
      field: 'category',
      message: `Catégorie inconnue: "${event.category}"`,
      value: event.category,
    });
    return;
  }

  // Cohérence ton/catégorie — alertes non-bloquantes
  const meta = CATEGORY_META[event.category];
  const catKeywords = meta.toneKeywords.join(' ');
  const descLower = event.description?.toLowerCase() ?? '';
  const matchCount = meta.toneKeywords.filter(kw => descLower.includes(kw.toLowerCase())).length;

  if (matchCount === 0) {
    warnings.push({
      field: 'description',
      message: `Aucun mot-clé thématique de "${event.category}" dans la description. Attendus: ${catKeywords}`,
    });
  }
}

/**
 * Vérifie que correctVerseId existe dans la base de versets.
 */
function validateVerse(
  event: GeneratedEvent,
  verses: VerseEntry[],
  errors: ValidationError[],
  warnings: ValidationError[],
): void {
  if (!event.correctVerseId) {
    errors.push({ field: 'correctVerseId', message: 'correctVerseId manquant' });
    return;
  }

  const verse = verses.find(v => v.id === event.correctVerseId);

  if (!verse) {
    errors.push({
      field: 'correctVerseId',
      message: `Verset "${event.correctVerseId}" non trouvé dans VERSE_DATABASE`,
      value: event.correctVerseId,
    });
    return;
  }

  // La catégorie du verset doit correspondre à celle de l'événement
  if (verse.category !== event.category) {
    warnings.push({
      field: 'correctVerseId',
      message: `Catégorie verset (${verse.category}) ≠ catégorie événement (${event.category})`,
    });
  }

  // Cohérence difficulté
  if (event.difficulty !== verse.difficulty) {
    warnings.push({
      field: 'difficulty',
      message: `Difficulté événement (${event.difficulty}) ≠ difficulté verset (${verse.difficulty})`,
    });
  }
}

/**
 * Vérifie les règles de balance des impacts sur les stats.
 *
 * Règles :
 *  - total absolu ≤ BALANCE_RULES.maxTotalStatLoss
 *  - total absolu ≥ BALANCE_RULES.minTotalStatLoss (événement trop doux)
 *  - chaque stat entre -BALANCE_RULES.maxSingleStatLoss et 0 (pas de gain au fail)
 *  - max BALANCE_RULES.maxStatsAffected stats ≠ 0
 *  - les 4 stats doivent être présentes (pas d'omission)
 */
function validateStatImpact(event: GeneratedEvent, errors: ValidationError[]): void {
  const impact = event.statImpactOnFail;

  if (!impact) {
    errors.push({ field: 'statImpactOnFail', message: 'statImpactOnFail manquant' });
    return;
  }

  const requiredStats: Array<'foi' | 'paix' | 'physique' | 'finances'> = ['foi', 'paix', 'physique', 'finances'];
  const missing = requiredStats.filter(s => impact[s] === undefined);
  if (missing.length > 0) {
    errors.push({
      field: 'statImpactOnFail',
      message: `Stats manquantes: ${missing.join(', ')}. Mettre à 0 si non touchées.`,
    });
    return;
  }

  let totalAbs = 0;
  let affectedCount = 0;

  for (const stat of requiredStats) {
    const val = impact[stat] ?? 0;

    if (val > 0) {
      errors.push({
        field: `statImpactOnFail.${stat}`,
        message: `${stat}=${val} — pas de gain autorisé en cas d'échec (doit être ≤ 0)`,
      });
    }

    if (Math.abs(val) > BALANCE_RULES.maxSingleStatLoss) {
      errors.push({
        field: `statImpactOnFail.${stat}`,
        message: `${stat}=${val} dépasse la limite par stat (max ${BALANCE_RULES.maxSingleStatLoss} en valeur absolue)`,
      });
    }

    totalAbs += Math.abs(val);
    if (val !== 0) affectedCount++;
  }

  if (totalAbs > BALANCE_RULES.maxTotalStatLoss) {
    errors.push({
      field: 'statImpactOnFail',
      message: `Impact total trop fort (${totalAbs}, max ${BALANCE_RULES.maxTotalStatLoss})`,
      value: impact,
    });
  }

  if (totalAbs < BALANCE_RULES.minTotalStatLoss) {
    errors.push({
      field: 'statImpactOnFail',
      message: `Impact total trop faible (${totalAbs}, min ${BALANCE_RULES.minTotalStatLoss}) — l'épreuve n'a pas d'enjeu`,
      value: impact,
    });
  }

  if (affectedCount > BALANCE_RULES.maxStatsAffected) {
    errors.push({
      field: 'statImpactOnFail',
      message: `Trop de stats touchées (${affectedCount}, max ${BALANCE_RULES.maxStatsAffected})`,
      value: impact,
    });
  }
}

/**
 * Vérifie l'usage de vocabulaire EJP/ICC (avertissements seulement).
 */
function validateEjpRules(event: GeneratedEvent, warnings: ValidationError[]): void {
  const fullText = `${event.title} ${event.description}`.toLowerCase();

  for (const word of EJP_RULES.forbiddenWords) {
    if (fullText.includes(word.toLowerCase())) {
      warnings.push({
        field: 'description',
        message: `Mot interdit "${word}" détecté. Remplacer par: chair/ennemi/adversaire.`,
        value: word,
      });
    }
  }
}

// ─── UTILITAIRE — RAPPORT ─────────────────────────────────────────────────────

/**
 * Formate un résultat de validation en texte lisible pour la console.
 *
 * @example
 * ```typescript
 * const result = validateGeneratedEvent(event, verses);
 * console.log(formatValidationReport(result, event.id));
 * ```
 */
export function formatValidationReport(result: ValidationResult, eventId: string): string {
  const lines: string[] = [`\n─── ${eventId} ───`];

  if (result.valid && result.warnings.length === 0) {
    lines.push('  ✅ Valide');
    return lines.join('\n');
  }

  if (!result.valid) {
    lines.push(`  ❌ ${result.errors.length} erreur(s):`);
    for (const err of result.errors) {
      lines.push(`     [${err.field}] ${err.message}`);
    }
  }

  if (result.warnings.length > 0) {
    lines.push(`  ⚠️  ${result.warnings.length} avertissement(s):`);
    for (const w of result.warnings) {
      lines.push(`     [${w.field}] ${w.message}`);
    }
  }

  return lines.join('\n');
}

/**
 * Valide un lot d'événements et retourne le résumé.
 * Utile dans le script CLI pour le rapport final.
 */
export function validateBatch(
  events: GeneratedEvent[],
  verses: VerseEntry[],
): { passed: GeneratedEvent[]; failed: Array<{ event: GeneratedEvent; result: ValidationResult }> } {
  const existingIds = new Set<string>();
  const passed: GeneratedEvent[] = [];
  const failed: Array<{ event: GeneratedEvent; result: ValidationResult }> = [];

  for (const event of events) {
    const result = validateGeneratedEvent(event, verses, existingIds);
    if (result.valid) {
      passed.push(event);
      existingIds.add(event.id);
    } else {
      failed.push({ event, result });
    }
  }

  return { passed, failed };
}
