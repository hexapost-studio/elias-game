#!/usr/bin/env npx tsx
/**
 * @file generate-events.ts
 * @description CLI de génération d'événements via Claude API.
 *
 * Génère des événements Élias à partir des versets existants,
 * les valide, et les affiche en JSON prêt à copier dans events.ts.
 *
 * ─── PRÉREQUIS ────────────────────────────────────────────────────────────────
 *
 *   npm install -D @anthropic-ai/sdk ts-node @types/node
 *   export ANTHROPIC_API_KEY="sk-ant-..."
 *
 * ─── USAGE ────────────────────────────────────────────────────────────────────
 *
 *   # Générer 3 événements pour la catégorie "priere"
 *   npx ts-node scripts/generate-events.ts --cat priere --count 3
 *
 *   # Toutes les catégories, 2 événements chacune
 *   npx ts-node scripts/generate-events.ts --all --count 2
 *
 *   # Mode dry-run (ne consomme pas d'API — génère un exemple local)
 *   npx ts-node scripts/generate-events.ts --cat priere --dry-run
 *
 *   # Forcer un ton narratif
 *   npx ts-node scripts/generate-events.ts --cat priere --tone intime
 *
 * ─── RÉSULTAT ─────────────────────────────────────────────────────────────────
 *
 *   Le script affiche :
 *     • Un rapport de validation par événement
 *     • Le JSON final des événements valides (prêt à copier dans events.ts)
 *     • Le résumé : X valides / Y rejetés
 *
 * @see src/data/event-schema.ts   — contrat de données + prompt template
 * @see src/data/event-validator.ts — fonctions de validation
 * @see src/data/events.ts          — destination finale des événements
 */

import Anthropic from '@anthropic-ai/sdk';
import type { AfflictionCategory, EventTone, StatName, VerseEntry } from '../src/types/game';
import {
  SYSTEM_PROMPT,
  buildGenerationPrompt,
  CATEGORY_META,
  type GeneratedEvent,
} from '../src/data/event-schema';
import {
  validateBatch,
  formatValidationReport,
} from '../src/data/event-validator';
import { VERSE_DATABASE } from '../src/data/verses';

// ─── CONFIG ────────────────────────────────────────────────────────────────────

/** Modèle recommandé : claude-opus-4-8 pour la créativité narrative */
const MODEL = 'claude-opus-4-8';
const MAX_TOKENS = 4096;

/** Température : 0.85 — créatif mais pas incohérent */
const TEMPERATURE = 0.85;

// ─── PARSEUR D'ARGUMENTS ───────────────────────────────────────────────────────

interface CliArgs {
  category: AfflictionCategory | 'all';
  count: number;
  tone: EventTone | 'random';
  dryRun: boolean;
  ageMin: number;
  ageMax: number;
  startId: number;
}

function parseArgs(): CliArgs {
  const args = process.argv.slice(2);
  const get = (flag: string): string | undefined => {
    const idx = args.indexOf(flag);
    return idx !== -1 ? args[idx + 1] : undefined;
  };
  const has = (flag: string): boolean => args.includes(flag);

  const catRaw = get('--cat') ?? (has('--all') ? 'all' : undefined);
  if (!catRaw) {
    console.error('Usage: npx ts-node scripts/generate-events.ts --cat <category> [--count N] [--tone <tone>] [--dry-run]');
    console.error('       npx ts-node scripts/generate-events.ts --all [--count N]');
    console.error('\nCatégories disponibles:', Object.keys(CATEGORY_META).join(', '));
    process.exit(1);
  }

  return {
    category: catRaw as AfflictionCategory | 'all',
    count: parseInt(get('--count') ?? '3', 10),
    tone: (get('--tone') ?? 'random') as EventTone | 'random',
    dryRun: has('--dry-run'),
    ageMin: parseInt(get('--age-min') ?? '18', 10),
    ageMax: parseInt(get('--age-max') ?? '65', 10),
    startId: parseInt(get('--start-id') ?? '001', 10),
  };
}

// ─── GÉNÉRATION ────────────────────────────────────────────────────────────────

/** Sélectionne un ton aléatoire si non fourni */
function pickTone(tone: EventTone | 'random'): EventTone {
  if (tone !== 'random') return tone;
  const tones: EventTone[] = ['intime', 'communautaire', 'familial', 'professionnel', 'ministeriel', 'corporel'];
  return tones[Math.floor(Math.random() * tones.length)];
}

/** Trouve les versets disponibles pour une catégorie */
function getVersesForCategory(category: AfflictionCategory): VerseEntry[] {
  return VERSE_DATABASE.filter(v => v.category === category);
}

/**
 * Appelle Claude API pour générer des événements pour un verset donné.
 * Retourne un tableau de GeneratedEvent (non validés).
 */
async function generateForVerse(
  client: Anthropic,
  verse: VerseEntry,
  args: CliArgs,
): Promise<GeneratedEvent[]> {
  const tone = pickTone(args.tone);

  const userPrompt = buildGenerationPrompt({
    verse,
    ageMin: args.ageMin,
    ageMax: args.ageMax,
    tone,
    count: args.count,
    nextIdStart: args.startId,
  });

  console.log(`\n📖 Génération pour ${verse.reference} [${tone}]...`);

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: MAX_TOKENS,
    temperature: TEMPERATURE,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: userPrompt }],
  });

  const raw = response.content[0].type === 'text' ? response.content[0].text : '';

  try {
    // Extraire le JSON du texte (au cas où le modèle ajoute du texte avant/après)
    const jsonMatch = raw.match(/\[[\s\S]*\]/);
    if (!jsonMatch) throw new Error('Pas de tableau JSON trouvé dans la réponse');
    return JSON.parse(jsonMatch[0]) as GeneratedEvent[];
  } catch (err) {
    console.error('❌ Échec parsing JSON:', (err as Error).message);
    console.error('Réponse brute:', raw.slice(0, 300));
    return [];
  }
}

// ─── MODE DRY-RUN ─────────────────────────────────────────────────────────────

/**
 * Génère un exemple d'événement valide localement (sans API).
 * Utile pour tester la chaîne validation → sortie JSON.
 */
function generateDryRun(category: AfflictionCategory, verse: VerseEntry): GeneratedEvent[] {
  const meta = CATEGORY_META[category];
  const impact: Record<StatName, number> = { foi: -8, paix: -7, physique: 0, finances: 0 };

  return [{
    id: `e-${meta.idShort}-001`,
    title: 'Nuit de doute intérieur',
    description: `Tu te retrouves seul dans ta chambre, incapable de prier. Les mots ne viennent plus et le silence de Dieu pèse lourd. Comment as-tu pu croire aussi fort en quelque chose d'invisible ?`,
    ageRange: [20, 35],
    category,
    tone: 'intime',
    correctVerseId: verse.id,
    difficulty: verse.difficulty,
    statImpactOnFail: impact,
    thematicFlavor: 'Nuit spirituelle',
    ejpTerms: ['Saison'],
  }];
}

// ─── POINT D'ENTRÉE ────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  const args = parseArgs();

  // Déterminer les catégories à traiter
  const categories: AfflictionCategory[] =
    args.category === 'all'
      ? (Object.keys(CATEGORY_META) as AfflictionCategory[])
      : [args.category];

  // Vérifier que la/les catégorie(s) existe(nt)
  for (const cat of categories) {
    if (!CATEGORY_META[cat]) {
      console.error(`❌ Catégorie inconnue: "${cat}"`);
      console.error('Disponibles:', Object.keys(CATEGORY_META).join(', '));
      process.exit(1);
    }
  }

  const allGenerated: GeneratedEvent[] = [];

  if (args.dryRun) {
    console.log('\n🧪 MODE DRY-RUN — aucun appel API');
    for (const cat of categories) {
      const verses = getVersesForCategory(cat);
      if (verses.length === 0) {
        console.warn(`⚠️  Aucun verset pour "${cat}" — ajouter dans verses.ts`);
        continue;
      }
      allGenerated.push(...generateDryRun(cat, verses[0]));
    }
  } else {
    if (!process.env.ANTHROPIC_API_KEY) {
      console.error('❌ ANTHROPIC_API_KEY non définie.');
      console.error('   export ANTHROPIC_API_KEY="sk-ant-..."');
      process.exit(1);
    }

    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    for (const cat of categories) {
      const verses = getVersesForCategory(cat);
      if (verses.length === 0) {
        console.warn(`⚠️  Aucun verset pour "${cat}" — skipping (ajouter dans verses.ts)`);
        continue;
      }

      // Prendre le premier verset disponible pour cette catégorie
      const verse = verses[0];
      const generated = await generateForVerse(client, verse, args);
      allGenerated.push(...generated);
    }
  }

  if (allGenerated.length === 0) {
    console.error('\n❌ Aucun événement généré.');
    process.exit(1);
  }

  // ── Validation ────────────────────────────────────────────────────────────
  console.log('\n─── RAPPORT DE VALIDATION ───────────────────────────────────');
  const { passed, failed } = validateBatch(allGenerated, VERSE_DATABASE);

  for (const ev of passed) {
    console.log(formatValidationReport({ valid: true, errors: [], warnings: [] }, ev.id));
  }
  for (const { event, result } of failed) {
    console.log(formatValidationReport(result, event.id));
  }

  // ── Résumé ────────────────────────────────────────────────────────────────
  console.log('\n─── RÉSUMÉ ──────────────────────────────────────────────────');
  console.log(`  ✅ ${passed.length} événement(s) valide(s)`);
  console.log(`  ❌ ${failed.length} événement(s) rejeté(s)`);

  // ── Sortie JSON (prêt à copier dans events.ts) ────────────────────────────
  if (passed.length > 0) {
    console.log('\n─── JSON FINAL (copier dans src/data/events.ts) ─────────────');
    console.log(JSON.stringify(passed, null, 2));
  }

  process.exit(failed.length > 0 ? 1 : 0);
}

main().catch((err: unknown) => {
  console.error('Erreur inattendue:', err);
  process.exit(1);
});
