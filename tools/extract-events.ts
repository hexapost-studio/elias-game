/**
 * Extrait la base d'événements depuis events.ts vers events.json
 * Usage: npx tsx tools/extract-events.ts
 */
import { EVENT_DATABASE } from '../src/data/events';
import { writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Nettoyer les événements pour le format JSON
const clean = EVENT_DATABASE.map((e) => ({
  id: e.id,
  title: e.title,
  description: e.description,
  ageRange: e.ageRange,
  category: e.category,
  correctVerseId: e.correctVerseId,
  statImpactOnFail: e.statImpactOnFail,
  ...(e.thematicFlavor ? { thematicFlavor: e.thematicFlavor } : {}),
  ...(e.cascadeEventId ? { cascadeEventId: e.cascadeEventId } : {}),
  ...(e.storyArcId ? { storyArcId: e.storyArcId } : {}),
  ...(e.arcSequence ? { arcSequence: e.arcSequence } : {}),
  ...(e.minStat ? { minStat: e.minStat } : {}),
  ...(e.maxStat ? { maxStat: e.maxStat } : {}),
  ...(e.narrativeVariants ? { narrativeVariants: e.narrativeVariants } : {}),
  decoyVerseIds: [],
}));

const outPath = join(__dirname, '..', 'game', 'data', 'events.json');
writeFileSync(outPath, JSON.stringify(clean, null, 2), 'utf8');

console.log(`✅ ${clean.length} événements extraits vers game/data/events.json`);
