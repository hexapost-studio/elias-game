/**
 * Chargeur de données — point d'accès unique à toutes les données du jeu.
 * Les données sont en JSON, validées au build.
 * Une IA peut modifier les JSON sans risque.
 */
import verses from './verses.json';
import balance from '../config/balance.json';

import type { VerseEntry, AfflictionEvent, StoryArc, AfflictionCategory } from '../../src/types/game';

/** Forme brute d'un verset dans verses.json (clés courtes), avant normalisation. */
interface RawVerse {
  id: string;
  ref: string;
  text: string;
  cat: string;
  tags?: string[];
  impact?: { foi?: number; paix?: number; physique?: number; finances?: number };
  diff: 1 | 2 | 3;
  weight?: number;
}

/* ─── VERSETS ─── */

export const VERSE_DATABASE: VerseEntry[] = (verses as RawVerse[]).map((v) => ({
  id: v.id,
  reference: v.ref,
  text: v.text,
  category: v.cat as AfflictionCategory,
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
  _events = mod.default as unknown as AfflictionEvent[];
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

/** Forme brute d'une entrée de lexicon.json. */
export interface RawLexiconEntry {
  term: string;
  meaning: string;
  commonMisinterpretation: string;
  category: string;
  usageInGame: string;
  verseReference: string;
}

let _lexicon: RawLexiconEntry[] | null = null;

export async function loadLexicon(): Promise<RawLexiconEntry[]> {
  if (_lexicon) return _lexicon;
  const mod = await import('./lexicon.json');
  _lexicon = mod.default as RawLexiconEntry[];
  return _lexicon;
}
