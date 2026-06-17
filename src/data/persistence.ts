import localforage from 'localforage';
import type { GameState, Inheritance } from '../types/game';

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
    difficulty: state.difficulty,
    actionPoints: state.actionPoints,
    actionsThisYear: state.actionsThisYear,
    amiRelationship: state.amiRelationship,
    crisesRemaining: state.crisesRemaining,
    flow: state.flow,
    combo: state.combo,
    maxCombo: state.maxCombo,
    journal: state.journal.slice(-50),
    currentEvent: state.currentEvent,
    lastEventResult: state.lastEventResult,
    totalEvents: state.totalEvents,
    successRate: state.successRate,
    failedVerseIds: state.failedVerseIds,
    codex: state.codex,
    currentTitle: state.currentTitle,
    inheritance: state.inheritance,
    queuedCascadeEvents: state.queuedCascadeEvents,
    completedArcs: state.completedArcs,
    encounteredArcIds: state.encounteredArcIds,
    answeredArcEventIds: state.answeredArcEventIds,
    flags: state.flags,
    recentEventIds: state.recentEventIds,
    recentVerseIds: state.recentVerseIds,
    consecutiveFails: state.consecutiveFails,
    reliefActive: state.reliefActive,
    spiritualSeason: state.spiritualSeason,
    amiDecayStreak: state.amiDecayStreak,
    callFriendCount: state.callFriendCount,
    friendIntroduced: state.friendIntroduced,
    metrics: state.metrics,
    phase: state.phase === 'event' || state.phase === 'result' ? 'idle' : state.phase,
    timestamp: Date.now(),
  };
  await localforage.setItem(SAVE_KEY, toSave);
}

export async function loadGame(): Promise<Partial<GameState> | null> {
  try {
    const data = await localforage.getItem<Partial<GameState> & { timestamp?: number }>(SAVE_KEY);
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
  season?: string;
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
  topCategories: { category: string; count: number; failRate: number }[];
  seasonFailRates: { season: string; failRate: number; count: number }[];
}> {
  const events = (await localforage.getItem<EventLog[]>(ANALYTICS_KEY)) || [];
  const runs = (await localforage.getItem<RunLog[]>('elias-runs-v1')) || [];

  const successes = events.filter((e) => e.correct).length;
  const avgTime = events.reduce((s, e) => s + e.timeToAnswer, 0) / (events.length || 1);

  const catData: Record<string, { count: number; fails: number }> = {};
  const seasonData: Record<string, { count: number; fails: number }> = {};
  for (const e of events) {
    if (!catData[e.category]) catData[e.category] = { count: 0, fails: 0 };
    catData[e.category].count++;
    if (!e.correct) catData[e.category].fails++;

    if (e.season) {
      if (!seasonData[e.season]) seasonData[e.season] = { count: 0, fails: 0 };
      seasonData[e.season].count++;
      if (!e.correct) seasonData[e.season].fails++;
    }
  }

  const topCategories = Object.entries(catData)
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 5)
    .map(([category, d]) => ({
      category,
      count: d.count,
      failRate: d.count > 0 ? Math.round((d.fails / d.count) * 100) : 0,
    }));

  const seasonFailRates = Object.entries(seasonData)
    .map(([season, d]) => ({
      season,
      count: d.count,
      failRate: d.count > 0 ? Math.round((d.fails / d.count) * 100) : 0,
    }))
    .sort((a, b) => b.failRate - a.failRate);

  return {
    totalEvents: events.length,
    successRate: events.length > 0 ? Math.round((successes / events.length) * 100) : 0,
    avgTimeToAnswer: Math.round(avgTime * 10) / 10,
    runsCompleted: runs.length,
    topCategories,
    seasonFailRates,
  };
}

/* ─── INHERITANCE ─── */

export async function saveInheritance(data: Inheritance): Promise<void> {
  await localforage.setItem(INHERITANCE_KEY, data);
}

export async function loadInheritance(): Promise<Inheritance | null> {
  return await localforage.getItem<Inheritance>(INHERITANCE_KEY);
}
