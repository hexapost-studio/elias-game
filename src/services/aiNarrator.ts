/**
 * @file aiNarrator.ts
 * @description Service d'IA narratif — journal vivant + événements dynamiques.
 *
 * Backends supportés (par ordre de priorité) :
 *  1. Ollama (auto-hébergé, gratuit, local ou sur Proxmox)
 *     → VITE_OLLAMA_URL=http://localhost:11434  +  VITE_OLLAMA_MODEL=llama3.2
 *  2. Groq (cloud, gratuit avec compte, ultra-rapide)
 *     → VITE_GROQ_API_KEY=gsk_xxx
 *  3. OpenRouter (cloud, modèles gratuits disponibles)
 *     → VITE_AI_ENDPOINT=https://openrouter.ai/api/v1/chat/completions
 *        VITE_AI_KEY=sk-or-v1-xxx  +  VITE_AI_MODEL=mistralai/mistral-7b-instruct:free
 *     Ou via localStorage : elias-or-key + elias-or-model (mode dev à la volée)
 *  4. OpenAI-compatible custom (n8n, LM Studio, etc.)
 *     → VITE_AI_ENDPOINT=https://...  +  VITE_AI_KEY=xxx  +  VITE_AI_MODEL=xxx
 *
 * Sans aucune variable → AI_AVAILABLE = false, le jeu fonctionne sans IA.
 */

import type { StatImpact, AfflictionCategory } from '../types/game';
import { VERSE_DATABASE } from '../data/verses';

// ── Détection du backend disponible ───────────────────────────────────────────

const OR_ENDPOINT = 'https://openrouter.ai/api/v1/chat/completions';
const LS_KEY_NAME  = 'elias-or-key';
const LS_MODEL_NAME = 'elias-or-model';

type Backend =
  | { type: 'ollama';      url: string; model: string }
  | { type: 'groq';        key: string; model: string }
  | { type: 'openrouter';  key: string; model: string }
  | { type: 'custom';      endpoint: string; key: string; model: string };

function detectBackend(): Backend | null {
  const ollamaUrl   = import.meta.env.VITE_OLLAMA_URL   as string | undefined;
  const ollamaModel = import.meta.env.VITE_OLLAMA_MODEL  as string | undefined;
  if (ollamaUrl) {
    return { type: 'ollama', url: ollamaUrl, model: ollamaModel ?? 'llama3.2' };
  }

  const groqKey = import.meta.env.VITE_GROQ_API_KEY as string | undefined;
  if (groqKey) {
    return { type: 'groq', key: groqKey, model: 'llama-3.1-8b-instant' };
  }

  const customEndpoint = import.meta.env.VITE_AI_ENDPOINT as string | undefined;
  const customKey      = import.meta.env.VITE_AI_KEY      as string | undefined;
  const customModel    = import.meta.env.VITE_AI_MODEL    as string | undefined;
  if (customEndpoint && customModel) {
    const isOpenRouter = customEndpoint.includes('openrouter.ai');
    if (isOpenRouter) {
      return { type: 'openrouter', key: customKey ?? '', model: customModel };
    }
    return { type: 'custom', endpoint: customEndpoint, key: customKey ?? '', model: customModel };
  }

  // Fallback : clé OpenRouter stockée dans localStorage (mode dev runtime)
  try {
    const lsKey   = localStorage.getItem(LS_KEY_NAME);
    const lsModel = localStorage.getItem(LS_MODEL_NAME) ?? 'mistralai/mistral-7b-instruct:free';
    if (lsKey) {
      return { type: 'openrouter', key: lsKey, model: lsModel };
    }
  } catch { /* localStorage non dispo (SSR, tests) */ }

  return null;
}

/** Recalculé à chaque appel — reflète les changements de localStorage en temps réel */
export function isAiEnabled(): boolean {
  return detectBackend() !== null;
}

/** @deprecated Utiliser isAiEnabled() — gardé pour compatibilité */
export const AI_AVAILABLE = detectBackend() !== null;

// ── Activation/désactivation runtime (dev mode) ───────────────────────────────

export function activateAiRuntime(key: string, model?: string): void {
  localStorage.setItem(LS_KEY_NAME, key);
  if (model) localStorage.setItem(LS_MODEL_NAME, model);
}

export function deactivateAiRuntime(): void {
  localStorage.removeItem(LS_KEY_NAME);
  localStorage.removeItem(LS_MODEL_NAME);
}

export function getAiRuntimeStatus(): { active: boolean; model: string | null; source: string } {
  const b = detectBackend();
  if (!b) return { active: false, model: null, source: 'none' };
  const source = b.type === 'openrouter' && localStorage.getItem(LS_KEY_NAME) ? 'localStorage' : 'env';
  const model  = 'model' in b ? b.model : null;
  return { active: true, model, source };
}

// ── Appel unifié OpenAI-compatible ────────────────────────────────────────────

async function chat(prompt: string, maxTokens: number = 250): Promise<string | null> {
  const backend = detectBackend();
  if (!backend) return null;

  try {
    if (backend.type === 'ollama') {
      const res = await fetch(`${backend.url}/api/generate`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model:  backend.model,
          prompt,
          stream: false,
          options: { num_predict: maxTokens, temperature: 0.8 },
        }),
      });
      if (!res.ok) return null;
      const data = await res.json() as { response?: string };
      return data.response?.trim() ?? null;
    }

    // OpenRouter, Groq, custom → format OpenAI /chat/completions
    let endpoint: string;
    let key: string;
    const headers: Record<string, string> = {
      'Content-Type':  'application/json',
    };

    if (backend.type === 'openrouter') {
      endpoint = OR_ENDPOINT;
      key = backend.key;
      headers['HTTP-Referer'] = 'https://elias-game.app';
      headers['X-Title']      = 'Élias — Simulateur de vie';
    } else if (backend.type === 'groq') {
      endpoint = 'https://api.groq.com/openai/v1/chat/completions';
      key = backend.key;
    } else {
      endpoint = backend.endpoint;
      key = backend.key;
    }

    headers['Authorization'] = `Bearer ${key}`;

    const res = await fetch(endpoint, {
      method:  'POST',
      headers,
      body: JSON.stringify({
        model:       backend.model,
        max_tokens:  maxTokens,
        temperature: 0.8,
        messages:    [{ role: 'user', content: prompt }],
      }),
    });
    if (!res.ok) return null;
    const data = await res.json() as { choices?: { message?: { content?: string } }[] };
    return data.choices?.[0]?.message?.content?.trim() ?? null;

  } catch {
    return null;
  }
}

// ── Types & helpers ───────────────────────────────────────────────────────────

export type LifeStageLabel = 'enfant' | 'ado' | 'adulte' | 'senior';

export interface AiEventNarrative {
  title:          string;
  description:    string;
  thematicFlavor: string;
  verseId:        string;
  category:       AfflictionCategory;
}

function lifeStage(age: number): LifeStageLabel {
  if (age >= 60) return 'senior';
  if (age >= 18) return 'adulte';
  if (age >= 12) return 'ado';
  return 'enfant';
}

const STAGE_TONE: Record<LifeStageLabel, string> = {
  enfant:  'simple et concret, comme un enfant qui découvre le monde',
  ado:     'émotionnel et identitaire, cherche sa place',
  adulte:  'mature et responsable, face à des choix lourds',
  senior:  'contemplatif et sage, regard sur ce qui reste',
};

const STAT_TO_CATEGORIES: Record<string, AfflictionCategory[]> = {
  foi:      ['doute_incredulite', 'peur_angoisse', 'soif_de_dieu'],
  paix:     ['amertume_rejet',    'tristesse_joie', 'culpabilite'],
  physique: ['maladie_guerison',  'lourdeur_fatigue', 'decouragement'],
  finances: ['finances_paresse',  'abondance_financiere'],
};

/** Sélectionne un verset en ciblant la stat la plus faible. */
export function pickVerseForAge(
  age: number,
  stats: StatImpact,
): typeof VERSE_DATABASE[number] | null {
  const weakStat = Object.entries({
    foi: stats.foi, paix: stats.paix, physique: stats.physique,
  }).sort(([, a], [, b]) => a - b)[0][0];

  const preferredCats = STAT_TO_CATEGORIES[weakStat] ?? [];
  const pool = VERSE_DATABASE.filter((v) =>
    preferredCats.includes(v.category) && (age >= 18 || v.difficulty <= 2)
  );
  const src = pool.length > 0 ? pool : VERSE_DATABASE;
  return src[Math.floor(Math.random() * src.length)] ?? null;
}

// ── Types contexte de vie ─────────────────────────────────────────────────────

export interface AiLifeContext {
  friendName: string;
  city: string;
  profession: string;
  churchName: string;
  spouseName?: string;
}

export interface AiParentNames {
  father: string;
  mother: string;
}

function buildLifeContextLine(lc?: AiLifeContext, pn?: AiParentNames): string {
  if (!lc && !pn) return '';
  const parts: string[] = [];
  if (pn) parts.push(`Fils de ${pn.father} et ${pn.mother}`);
  if (lc?.city) parts.push(`né à ${lc.city}`);
  if (lc?.profession) parts.push(`${lc.profession} de métier`);
  if (lc?.churchName) parts.push(`membre de ${lc.churchName}`);
  if (lc?.friendName) parts.push(`ami proche : ${lc.friendName}`);
  if (lc?.spouseName) parts.push(`conjoint(e) : ${lc.spouseName}`);
  return parts.join(', ') + '.';
}

// ── 1. Journal vivant ─────────────────────────────────────────────────────────

export async function generateJournalEntry(
  age: number,
  stats: StatImpact,
  recentEventTitles: string[],
  successRate: number,
  lifeContext?: AiLifeContext,
  parentNames?: AiParentNames,
  actionsThisYear?: string[],
): Promise<string | null> {
  const stage  = lifeStage(age);
  const events = recentEventTitles.slice(-4).join(', ') || 'aucune épreuve notable';
  const ctxLine = buildLifeContextLine(lifeContext, parentNames);

  const ACTION_LABELS: Record<string, string> = {
    pray: 'prié', fast: 'jeûné', serve: 'servi à l\'église',
    call_friend: `appelé ${lifeContext?.friendName ?? 'son ami'}`, read_word: 'lu la Parole',
  };
  const actionsLine = actionsThisYear && actionsThisYear.length > 0
    ? `Cette année, Élias a : ${actionsThisYear.map(a => ACTION_LABELS[a] ?? a).join(', ')}.`
    : '';

  const prompt = `Tu es Élias, ${age} ans (stade : ${stage}).
${ctxLine}
Stats intérieures : Foi ${stats.foi}/100 · Paix ${stats.paix}/100 · Corps ${stats.physique}/100 · Finances ${stats.finances}/100.
Dernières épreuves : ${events}. Taux de victoire : ${successRate}%.
${actionsLine}

Écris UNE entrée de journal intime à la 1ère personne.
• 2-3 phrases, 50-80 mots maximum
• Ton : ${STAGE_TONE[stage]}
• Si tu mentionnes un ami, utilise le prénom fourni ci-dessus
• Vocabulaire EJP/ICC autorisé : Prodige, Couloir, Saison, Ferveur, Anakazo, chair, ennemi
• PAS de citation biblique explicite, PAS de formule d'introduction
• Commence directement par "Je" ou par une situation concrète`;

  return chat(prompt, 200);
}

// ── 2. Événements dynamiques ──────────────────────────────────────────────────

export async function generateDynamicEvent(
  age: number,
  stats: StatImpact,
  lifeContext?: AiLifeContext,
  parentNames?: AiParentNames,
): Promise<AiEventNarrative | null> {
  const verse = pickVerseForAge(age, stats);
  if (!verse) return null;

  const stage = lifeStage(age);
  const ctxLine = buildLifeContextLine(lifeContext, parentNames);

  const prompt = `Jeu Élias — simulateur de vie EJP/ICC.
Élias a ${age} ans (${stage}). ${ctxLine}
Stats : Foi ${stats.foi} · Paix ${stats.paix} · Corps ${stats.physique} · Finances ${stats.finances}.
Verset réponse : "${verse.text}" (${verse.reference}).

Génère un événement concret de vie qui AMÈNE à ce verset comme réponse naturelle.
Si tu mentionnes un ami ou une église, utilise les noms fournis ci-dessus.
Réponds UNIQUEMENT en JSON valide, sans markdown :
{"title":"max 5 mots","description":"80-160 caractères, 2e personne du singulier","thematicFlavor":"2-3 mots"}

Règles :
• Situation réaliste — vie africaine ou diaspora, adapté au stade ${stage}
• PAS de jargon religieux dans la description
• Mots interdits : péché, Satan, démon, enfer, malédiction`;

  const raw = await chat(prompt, 250);
  if (!raw) return null;

  try {
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
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
