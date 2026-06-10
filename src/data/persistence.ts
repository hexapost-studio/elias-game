import localforage from 'localforage';
import type { GameState } from '../types/game';

const SAVE_KEY = 'elias-save-v1';
const ONBOARDING_KEY = 'elias-onboarding-v1';
const ANALYTICS_KEY = 'elias-analytics-v1';
const INHERITANCE_KEY = 'elias-inheritance-v1';

// Configure localforage
localforage.config({
  name: 'EliasGame',
  storeName: 'game_data',
});

/* ─── SAVE / LOAD ─── */

export async function saveGame(state: GameState): Promise<void> {
  const toSave = {
    age: state.age,
    stats: state.stats,
    profileName: state.profileName,
    parentNames: state.parentNames,
    lifeContext: state.lifeContext,
    amiRelationship: state.amiRelationship,
    crisesRemaining: state.crisesRemaining,
    flow: state.flow,
    combo: state.combo,
    maxCombo: state.maxCombo,
    journal: state.journal.slice(-50), // keep last 50 entries
    totalEvents: state.totalEvents,
    successRate: state.successRate,
    failedVerseIds: state.failedVerseIds,
    codex: state.codex,
    queuedCascadeEvents: state.queuedCascadeEvents,
    completedArcs: state.completedArcs,
    phase: state.phase,
    difficulty: state.difficulty,
    timestamp: Date.now(),
  };
  await localforage.setItem(SAVE_KEY, toSave);
}

export async function loadGame(): Promise<Partial<GameState> | null> {
  try {
    const data = await localforage.getItem<any>(SAVE_KEY);
    if (!data) return null;
    // Vérifier que le save a moins de 7 jours
    if (data.timestamp && Date.now() - data.timestamp > 7 * 24 * 60 * 60 * 1000) {
      await localforage.removeItem(SAVE_KEY);
      return null;
    }
    return data;
  } catch {
    return null;
  }
}

export async function deleteSave(): Promise<void> {
  await localforage.removeItem(SAVE_KEY);
}

/* ─── ONBOARDING ─── */

export async function hasSeenOnboarding(): Promise<boolean> {
  return (await localforage.getItem(ONBOARDING_KEY)) === true;
}

export async function markOnboardingDone(): Promise<void> {
  await localforage.setItem(ONBOARDING_KEY, true);
}

/* ─── ANALYTICS ─── */

export interface EventLog {
  eventId: string;
  correct: boolean;
  timeToAnswer: number;
  age: number;
  flowLevel: number;
  category: string;
  timestamp: number;
}

export interface RunLog {
  ageAtDeath: number;
  totalEvents: number;
  successRate: number;
  maxCombo: number;
  maxFlow: number;
  cause: string | null;
  title: string | null;
  timestamp: number;
}

export async function logEvent(data: EventLog): Promise<void> {
  const events = (await localforage.getItem<EventLog[]>(ANALYTICS_KEY)) || [];
  events.push(data);
  // Garder max 500 events
  if (events.length > 500) events.splice(0, events.length - 500);
  await localforage.setItem(ANALYTICS_KEY, events);
}

export async function logRun(data: RunLog): Promise<void> {
  const runs = (await localforage.getItem<RunLog[]>('elias-runs-v1')) || [];
  runs.push(data);
  if (runs.length > 20) runs.splice(0, runs.length - 20);
  await localforage.setItem('elias-runs-v1', runs);
}

export async function getAnalyticsSummary(): Promise<{
  totalEvents: number;
  successRate: number;
  avgTimeToAnswer: number;
  runsCompleted: number;
  topCategories: { category: string; count: number }[];
}> {
  const events = (await localforage.getItem<EventLog[]>(ANALYTICS_KEY)) || [];
  const runs = (await localforage.getItem<RunLog[]>('elias-runs-v1')) || [];

  const successes = events.filter((e) => e.correct).length;
  const avgTime = events.reduce((s, e) => s + e.timeToAnswer, 0) / (events.length || 1);

  const catCount: Record<string, number> = {};
  for (const e of events) {
    catCount[e.category] = (catCount[e.category] || 0) + 1;
  }
  const topCategories = Object.entries(catCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([category, count]) => ({ category, count }));

  return {
    totalEvents: events.length,
    successRate: events.length > 0 ? Math.round((successes / events.length) * 100) : 0,
    avgTimeToAnswer: Math.round(avgTime * 10) / 10,
    runsCompleted: runs.length,
    topCategories,
  };
}

/* ─── INHERITANCE ─── */

export async function saveInheritance(data: any): Promise<void> {
  await localforage.setItem(INHERITANCE_KEY, data);
}

export async function loadInheritance(): Promise<any | null> {
  return await localforage.getItem(INHERITANCE_KEY);
}
