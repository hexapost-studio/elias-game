/**
 * @file feedback.ts
 * @description Service de feedback / bug-report joueur.
 *
 * Mis en place suite au playtest : aucun moyen n'existait pour le joueur de
 * signaler un bug ou donner son avis depuis le jeu.
 *
 * Transport (même philosophie que aiNarrator.ts — tout est optionnel via VITE_*) :
 *  1. Supabase REST (primaire) → POST {VITE_SUPABASE_URL}/rest/v1/feedback
 *       headers : apikey + Authorization: Bearer <anon> + Prefer: return=minimal
 *  2. Notif Discord (optionnelle, best-effort) → VITE_FEEDBACK_DISCORD_WEBHOOK
 *  3. Fallback local (toujours) → file localforage 'elias-feedback-queue-v1'
 *       renvoyée au démarrage via flushLocalQueue() si Supabase est configuré.
 *
 * Sans aucune variable → le feedback est stocké localement et peut être
 * exporté via getMailtoFallback() (copier / envoyer par mail).
 *
 * Le diagnostic joint est ANONYME : pas d'IP, pas de clé, pas de contact sauf
 * si le joueur le saisit. Les noms du personnage (générés aléatoirement) sont
 * volontairement exclus pour anticiper la future personnalisation joueur.
 */

import localforage from 'localforage';
import { useGameStore } from '../stores/gameStore';
import { getAnalyticsSummary } from '../data/persistence';
import { getActiveBackendType } from './aiNarrator';

export const APP_VERSION =
  (import.meta.env.VITE_APP_VERSION as string | undefined) ?? '0.1.0-playtest';

const QUEUE_KEY = 'elias-feedback-queue-v1';
const FALLBACK_EMAIL =
  (import.meta.env.VITE_FEEDBACK_EMAIL as string | undefined) ?? 'andreaerick15@gmail.com';

// ── Types ──────────────────────────────────────────────────────────────────

export type FeedbackKind = 'bug' | 'idea' | 'praise';

export interface FeedbackDiagnostics {
  game: {
    age: number;
    stats: Record<string, number>;
    difficulty: number;
    flow: { value: number; palier: number };
    combo: number;
    maxCombo: number;
    totalEvents: number;
    successRate: number;
    spiritualSeason: string | null;
    crisesRemaining: number;
    phase: string;
    currentTitle: string | null;
    currentEventId: string | null;
    lastEventResult: string | null;
  } | null;
  history: {
    journalTail: { age: number; type: string; text: string }[];
    recentEventIds: string[];
    completedArcs: number;
  } | null;
  analytics: Awaited<ReturnType<typeof getAnalyticsSummary>> | null;
  tech: {
    appVersion: string;
    userAgent: string;
    language: string;
    screen: string;
    viewport: string;
    pwaStandalone: boolean;
    aiBackend: string | null;
    url: string;
    timestamp: string;
  };
}

export interface FeedbackPayload {
  kind: FeedbackKind;
  message: string;
  contact?: string;
  diagnostics: FeedbackDiagnostics | null;
  createdAt: string; // ISO
}

// ── Détection config distante (lue à l'appel pour testabilité) ───────────────

function remoteConfig(): { url: string; key: string } | null {
  const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;
  return url && key ? { url: url.replace(/\/$/, ''), key } : null;
}

/** True si un backend distant (Supabase) est configuré. */
export function isRemoteConfigured(): boolean {
  return remoteConfig() !== null;
}

// ── Collecte du diagnostic ───────────────────────────────────────────────────

export async function collectDiagnostics(): Promise<FeedbackDiagnostics> {
  let game: FeedbackDiagnostics['game'] = null;
  let history: FeedbackDiagnostics['history'] = null;

  try {
    const s = useGameStore.getState();
    game = {
      age: s.age,
      stats: s.stats,
      difficulty: s.difficulty,
      flow: { value: Math.round(s.flow.value), palier: s.flow.palier },
      combo: s.combo,
      maxCombo: s.maxCombo,
      totalEvents: s.totalEvents,
      successRate: s.successRate,
      spiritualSeason: s.spiritualSeason ?? null,
      crisesRemaining: s.crisesRemaining,
      phase: s.phase,
      currentTitle: s.currentTitle?.name ?? null,
      currentEventId: s.currentEvent?.id ?? null,
      lastEventResult: s.lastEventResult,
    };
    history = {
      journalTail: s.journal.slice(-8).map((e) => ({ age: e.age, type: e.type, text: e.text })),
      recentEventIds: s.recentEventIds ?? [],
      completedArcs: s.completedArcs.length,
    };
  } catch {
    /* store indisponible (tests, init) — on continue sans */
  }

  let analytics: FeedbackDiagnostics['analytics'] = null;
  try {
    analytics = await getAnalyticsSummary();
  } catch {
    /* analytics indisponibles */
  }

  const nav = typeof navigator !== 'undefined' ? navigator : ({} as Navigator);
  const win = typeof window !== 'undefined' ? window : undefined;

  const tech: FeedbackDiagnostics['tech'] = {
    appVersion: APP_VERSION,
    userAgent: nav.userAgent ?? 'unknown',
    language: nav.language ?? 'unknown',
    screen: win?.screen ? `${win.screen.width}x${win.screen.height}` : 'unknown',
    viewport: win ? `${win.innerWidth}x${win.innerHeight}` : 'unknown',
    pwaStandalone: Boolean(win?.matchMedia?.('(display-mode: standalone)').matches),
    aiBackend: safeBackendType(),
    url: win?.location?.href ?? 'unknown',
    timestamp: new Date().toISOString(),
  };

  return { game, history, analytics, tech };
}

function safeBackendType(): string | null {
  try {
    return getActiveBackendType();
  } catch {
    return null;
  }
}

/** Construit un payload complet prêt à soumettre. */
export async function buildPayload(
  kind: FeedbackKind,
  message: string,
  contact: string | undefined,
  includeDiagnostics: boolean,
): Promise<FeedbackPayload> {
  return {
    kind,
    message: message.trim(),
    contact: contact?.trim() || undefined,
    diagnostics: includeDiagnostics ? await collectDiagnostics() : null,
    createdAt: new Date().toISOString(),
  };
}

// ── Envoi ────────────────────────────────────────────────────────────────────

function toRow(payload: FeedbackPayload) {
  return {
    kind: payload.kind,
    message: payload.message,
    contact: payload.contact ?? null,
    diagnostics: payload.diagnostics,
    app_version: payload.diagnostics?.tech.appVersion ?? APP_VERSION,
    created_at: payload.createdAt,
  };
}

async function postToSupabase(
  cfg: { url: string; key: string },
  payload: FeedbackPayload,
): Promise<boolean> {
  const res = await fetch(`${cfg.url}/rest/v1/feedback`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: cfg.key,
      Authorization: `Bearer ${cfg.key}`,
      Prefer: 'return=minimal',
    },
    body: JSON.stringify(toRow(payload)),
  });
  return res.ok;
}

async function notifyDiscord(payload: FeedbackPayload): Promise<void> {
  const webhook = import.meta.env.VITE_FEEDBACK_DISCORD_WEBHOOK as string | undefined;
  if (!webhook) return;
  const emoji: Record<FeedbackKind, string> = { bug: '🐛', idea: '💡', praise: '💬' };
  const g = payload.diagnostics?.game;
  const ctx = g
    ? `\n\`${g.age} ans · ${g.successRate}% · ${g.spiritualSeason ?? '—'} · v${payload.diagnostics?.tech.appVersion}\``
    : '';
  const contact = payload.contact ? `\n_contact : ${payload.contact}_` : '';
  const content = `${emoji[payload.kind]} **${payload.kind.toUpperCase()}**\n${payload.message}${contact}${ctx}`;
  try {
    await fetch(webhook, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: content.slice(0, 1900) }),
    });
  } catch {
    /* best-effort */
  }
}

/**
 * Soumet un feedback. Tente Supabase puis retombe sur la file locale.
 * Ne rejette jamais : un retour n'est jamais perdu.
 */
export async function submitFeedback(
  payload: FeedbackPayload,
): Promise<{ ok: boolean; via: 'supabase' | 'local' }> {
  const cfg = remoteConfig();
  if (cfg) {
    try {
      if (await postToSupabase(cfg, payload)) {
        void notifyDiscord(payload);
        return { ok: true, via: 'supabase' };
      }
    } catch {
      /* réseau KO → fallback local */
    }
  }
  await enqueueLocal(payload);
  return { ok: true, via: 'local' };
}

// ── File locale ──────────────────────────────────────────────────────────────

async function enqueueLocal(payload: FeedbackPayload): Promise<void> {
  const queue = (await localforage.getItem<FeedbackPayload[]>(QUEUE_KEY)) ?? [];
  queue.push(payload);
  if (queue.length > 50) queue.splice(0, queue.length - 50);
  await localforage.setItem(QUEUE_KEY, queue);
}

export async function getLocalQueue(): Promise<FeedbackPayload[]> {
  return (await localforage.getItem<FeedbackPayload[]>(QUEUE_KEY)) ?? [];
}

/**
 * Renvoie la file locale vers Supabase si configuré. Best-effort, appelé au
 * démarrage. Retourne le nombre de retours effectivement envoyés.
 */
export async function flushLocalQueue(): Promise<number> {
  const cfg = remoteConfig();
  if (!cfg) return 0;
  const queue = await getLocalQueue();
  if (queue.length === 0) return 0;

  const remaining: FeedbackPayload[] = [];
  let sent = 0;
  for (const item of queue) {
    try {
      if (await postToSupabase(cfg, item)) {
        sent++;
        void notifyDiscord(item);
      } else {
        remaining.push(item);
      }
    } catch {
      remaining.push(item);
    }
  }
  await localforage.setItem(QUEUE_KEY, remaining);
  return sent;
}

// ── Secours : mailto pré-rempli ──────────────────────────────────────────────

export function getMailtoFallback(payload: FeedbackPayload): string {
  const subject = `[Élias] ${payload.kind} — retour playtest`;
  const body = [
    payload.message,
    payload.contact ? `\nContact : ${payload.contact}` : '',
    '',
    '--- infos techniques ---',
    JSON.stringify(payload.diagnostics, null, 2),
  ].join('\n');
  return `mailto:${FALLBACK_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

/** Texte brut copiable (clipboard) — sujet + message + diagnostic. */
export function getPlainText(payload: FeedbackPayload): string {
  return [
    `[Élias] ${payload.kind} — ${payload.createdAt}`,
    payload.message,
    payload.contact ? `Contact : ${payload.contact}` : '',
    '',
    '--- infos techniques ---',
    JSON.stringify(payload.diagnostics, null, 2),
  ].join('\n');
}
