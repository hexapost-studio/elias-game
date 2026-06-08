/**
 * Chargeur de données — point d'accès unique à toutes les données du jeu.
 * Les données sont en JSON, validées au build.
 * Une IA peut modifier les JSON sans risque.
 */
import verses from './verses.json';
import balance from '../config/balance.json';

import type { VerseEntry, AfflictionEvent, StoryArc } from '../types/game';

/* ─── VERSETS ─── */

export const VERSE_DATABASE: VerseEntry[] = verses.map((v: any) => ({
  id: v.id,
  reference: v.ref,
  text: v.text,
  category: v.cat,
  tags: v.tags || [],
  statImpact: v.impact || {},
  difficulty: v.diff,
  weight: v.weight,
}));

export const TOTAL_VERSES = VERSE_DATABASE.length;
export const VERSES_BY_CATEGORY = VERSE_DATABASE.reduce<Record<string, VerseEntry[]>>((acc, v) => {
  if (!acc[v.category]) acc[v.category] = [];
  acc[v.category].push(v);
  return acc;
}, {});

export function getVerseById(id: string): VerseEntry | undefined {
  return VERSE_DATABASE.find((v) => v.id === id);
}

/* ─── CONFIG ─── */

export const CONFIG = balance;

/* ─── ÉVÉNEMENTS (importé depuis events.json) ─── */

let _events: AfflictionEvent[] | null = null;

export async function loadEvents(): Promise<AfflictionEvent[]> {
  if (_events) return _events;
  const mod = await import('./events.json');
  _events = mod.default as AfflictionEvent[];
  return _events;
}

export function getEventsSync(): AfflictionEvent[] {
  return _events || [];
}

/* ─── ARCS ─── */

let _arcs: StoryArc[] | null = null;

export async function loadArcs(): Promise<StoryArc[]> {
  if (_arcs) return _arcs;
  const mod = await import('./storyArcs.json');
  _arcs = mod.default as StoryArc[];
  return _arcs;
}

export function getArcById(id: string): StoryArc | undefined {
  return _arcs?.find((a) => a.id === id);
}

/* ─── LEXIQUE ─── */

let _lexicon: any[] | null = null;

export async function loadLexicon(): Promise<any[]> {
  if (_lexicon) return _lexicon;
  const mod = await import('./lexicon.json');
  _lexicon = mod.default;
  return _lexicon;
}
