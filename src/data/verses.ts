/**
 * Chargeur de versets — point d'accès unique.
 * Les données sont en JSON dans game/data/verses.json.
 * Plus de dual source of truth.
 */
import type { VerseEntry } from '../types/game';
import RAW_VERSES from '../../game/data/verses.json';

interface RawVerse {
  id: string;
  ref: string;
  text: string;
  cat: string;
  tags: string[];
  impact: { foi?: number; paix?: number; physique?: number; finances?: number };
  diff: 1 | 2 | 3;
}

export const VERSE_DATABASE: VerseEntry[] = (RAW_VERSES as RawVerse[]).map((v) => ({
  id: v.id,
  reference: v.ref,
  text: v.text,
  category: v.cat,
  tags: v.tags || [],
  statImpact: v.impact || {},
  difficulty: v.diff,
}));

export const TOTAL_VERSES = VERSE_DATABASE.length;

export const VERSES_BY_CATEGORY = VERSE_DATABASE.reduce<
  Record<string, VerseEntry[]>
>((acc, v) => {
  if (!acc[v.category]) acc[v.category] = [];
  acc[v.category].push(v);
  return acc;
}, {});

export function getVerseById(id: string): VerseEntry | undefined {
  return VERSE_DATABASE.find((v) => v.id === id);
}
