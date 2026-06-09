/**
 * @file aiNarrator.ts
 * @description Service d'IA narratif — deux fonctionnalités en jeu :
 *
 *  1. Journal vivant : à chaque anniversaire d'Élias, Claude génère
 *     une entrée de journal intime à la 1ère personne, adaptée aux
 *     stats et au stade de vie du personnage.
 *
 *  2. Événements dynamiques : à partir d'un verset sélectionné en
 *     fonction des stats faibles, Claude génère un événement de vie
 *     inédit qui amène naturellement ce verset comme réponse.
 *
 * Requiert VITE_ANTHROPIC_API_KEY dans .env.local.
 * Utilise claude-haiku pour la vitesse et le coût.
 */

import Anthropic from '@anthropic-ai/sdk';
import type { StatImpact, AfflictionCategory } from '../types/game';
import { VERSE_DATABASE } from '../data/verses';

// ── Client ────────────────────────────────────────────────────────────────────

const _client = (() => {
  const key = import.meta.env.VITE_ANTHROPIC_API_KEY as string | undefined;
  if (!key) return null;
  return new Anthropic({ apiKey: key, dangerouslyAllowBrowser: true });
})();

export const AI_AVAILABLE = _client !== null;

// ── Types locaux ──────────────────────────────────────────────────────────────

export type LifeStageLabel = 'enfant' | 'ado' | 'adulte' | 'senior';

export interface AiEventNarrative {
  title: string;
  description: string;
  thematicFlavor: string;
  verseId: string;
  category: AfflictionCategory;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function lifeStage(age: number): LifeStageLabel {
  if (age >= 60) return 'senior';
  if (age >= 18) return 'adulte';
  if (age >= 12) return 'ado';
  return 'enfant';
}

const STAGE_TONE: Record<LifeStageLabel, string> = {
  enfant:  'simple, concret, émotions primaires',
  ado:     'tourmenté, identitaire, cherche sa place',
  adulte:  'mature, responsable, face à des choix lourds',
  senior:  'contemplatif, sage, regard sur ce qui reste',
};

const STAT_TO_CATEGORIES: Record<string, AfflictionCategory[]> = {
  foi:      ['doute_incredulite', 'peur_angoisse', 'soif_de_dieu'],
  paix:     ['amertume_rejet', 'tristesse_joie', 'culpabilite'],
  physique: ['maladie_guerison', 'lourdeur_fatigue', 'decouragement'],
  finances: ['finances_paresse', 'abondance_financiere'],
};

/** Sélectionne un verset en ciblant la stat la plus faible du joueur. */
export function pickVerseForAge(
  age: number,
  stats: StatImpact,
): typeof VERSE_DATABASE[number] | null {
  // Stat la plus basse (hors finances, moins liée aux catégories)
  const weakStat = (
    Object.entries({ foi: stats.foi, paix: stats.paix, physique: stats.physique })
      .sort(([, a], [, b]) => a - b)[0][0]
  );

  const preferredCats = STAT_TO_CATEGORIES[weakStat] ?? [];
  const pool = VERSE_DATABASE.filter((v) =>
    preferredCats.includes(v.category) &&
    /* exclure les versets avec difficulté trop haute pour l'âge */
    (age >= 18 || v.difficulty <= 2)
  );

  const chosen = (pool.length > 0 ? pool : VERSE_DATABASE)[
    Math.floor(Math.random() * (pool.length > 0 ? pool.length : VERSE_DATABASE.length))
  ];
  return chosen ?? null;
}

// ── 1. Journal vivant ─────────────────────────────────────────────────────────

/**
 * Génère une entrée de journal intime personnalisée pour Élias.
 * Retourne null si l'IA est indisponible ou échoue.
 */
export async function generateJournalEntry(
  age: number,
  stats: StatImpact,
  recentEventTitles: string[],
  successRate: number,
): Promise<string | null> {
  if (!_client) return null;

  const stage  = lifeStage(age);
  const events = recentEventTitles.slice(-4).join(', ') || 'aucune épreuve notable';

  try {
    const resp = await _client.messages.create({
      model:      'claude-haiku-4-5-20251001',
      max_tokens: 200,
      messages: [{
        role:    'user',
        content: `Tu es Élias, ${age} ans (stade de vie : ${stage}).
Stats intérieures : Foi ${stats.foi}/100 · Paix ${stats.paix}/100 · Corps ${stats.physique}/100 · Finances ${stats.finances}/100.
Dernières épreuves vécues : ${events}.
Taux de victoire dans les épreuves : ${successRate}%.

Écris UNE entrée de journal intime à la 1ère personne (je / mon / ma).
Contraintes strictes :
• 2-3 phrases, 50-80 mots maximum
• Ton : ${STAGE_TONE[stage]}
• Vocabulaire EJP/ICC autorisé : Prodige, Couloir, Saison, Ferveur, Anakazo, chair, ennemi
• PAS de citation biblique explicite, PAS de formule d'introduction
• Commence directement par "Je" ou par une situation`,
      }],
    });

    const block = resp.content[0];
    return block.type === 'text' ? block.text.trim() : null;
  } catch {
    return null;
  }
}

// ── 2. Événements dynamiques ──────────────────────────────────────────────────

/**
 * Génère un événement de vie inédit adapté à l'âge et aux stats d'Élias.
 * Sélectionne d'abord un verset cible, puis demande à l'IA d'écrire
 * la situation qui y conduit naturellement.
 * Retourne null si l'IA est indisponible ou si le JSON est invalide.
 */
export async function generateDynamicEvent(
  age: number,
  stats: StatImpact,
): Promise<AiEventNarrative | null> {
  if (!_client) return null;

  const verse = pickVerseForAge(age, stats);
  if (!verse) return null;

  const stage = lifeStage(age);

  try {
    const resp = await _client.messages.create({
      model:      'claude-haiku-4-5-20251001',
      max_tokens: 250,
      messages: [{
        role:    'user',
        content: `Jeu Élias — simulateur de vie EJP/ICC.
Élias a ${age} ans (${stage}). Stats : Foi ${stats.foi} · Paix ${stats.paix} · Corps ${stats.physique} · Finances ${stats.finances}.
Verset réponse : "${verse.text}" (${verse.reference}).

Génère un événement concret de vie qui AMÈNE à ce verset comme réponse naturelle.
Réponds UNIQUEMENT en JSON valide, sans markdown :
{"title":"max 5 mots","description":"80-160 caractères, 2e personne du singulier","thematicFlavor":"2-3 mots"}

Règles :
• Situation réaliste — vie africaine ou diaspora
• Adapté au stade ${stage}
• PAS de jargon religieux dans la description
• Mots interdits : péché, Satan, démon, enfer, malédiction`,
      }],
    });

    const block = resp.content[0];
    if (block.type !== 'text') return null;

    // Extraire le JSON même si l'IA ajoute du texte autour
    const jsonMatch = block.text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;

    const parsed = JSON.parse(jsonMatch[0]) as Partial<AiEventNarrative>;
    if (!parsed.title || !parsed.description || !parsed.thematicFlavor) return null;

    return {
      title:          parsed.title,
      description:    parsed.description,
      thematicFlavor: parsed.thematicFlavor,
      verseId:        verse.id,
      category:       verse.category,
    };
  } catch {
    return null;
  }
}
