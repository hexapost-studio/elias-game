#!/usr/bin/env node
//
// status.mjs — État du projet DÉRIVÉ, pas narré (G-2).
//
// Le suivi de statut était de la prose tenue à la main (CLAUDE.md / ROADMAP) qui DÉRIVE :
// compteurs d'events/versets/tests recopiés, « réconciliations » à répétition. Ce module
// GÉNÈRE l'état depuis les vraies sources (game/data/* + git + ITERATION_LOG), une seule fois,
// sans le réécrire. `--check` échoue si la prose canonique contredit le réel (porte anti-dérive).
//
//   node tools/status.mjs            # tableau de bord dérivé
//   node tools/status.mjs --check    # exit 1 si CLAUDE.md contredit le réel
//   node tools/status.mjs --tests    # ajoute le compte réel de tests (lance vitest — lent)
//
// Pur & testable : deriveStatus() / checkDocs() ne font que LIRE (zéro écriture, zéro effet).
import { readFileSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

function git(args, fallback = '?') {
  try {
    return execSync(`git ${args}`, { cwd: ROOT, stdio: ['ignore', 'pipe', 'ignore'] })
      .toString().trim();
  } catch { return fallback; }
}
function readJSON(rel) { return JSON.parse(readFileSync(join(ROOT, rel), 'utf8')); }
function readText(rel) { try { return readFileSync(join(ROOT, rel), 'utf8'); } catch { return ''; } }

/** Dérivation pure (lecture seule) de l'état courant depuis les sources de vérité. */
export function deriveStatus() {
  const events = readJSON('game/data/events.json');
  const verses = readJSON('game/data/verses.json');
  const moralDilemmas = events
    .filter((e) => Array.isArray(e.moralChoices) && e.moralChoices.length > 0).length;
  const log = readText('docs/ITERATION_LOG.md');
  const iters = [...log.matchAll(/^## Itération (\d+)/gm)].map((m) => Number(m[1]));
  const lastIteration = iters.length ? Math.max(...iters) : null;
  return {
    branch: git('rev-parse --abbrev-ref HEAD'),
    head: git('rev-parse --short HEAD'),
    lastCommit: git('log -1 --pretty=%s'),
    events: events.length,
    verses: verses.length,
    moralDilemmas,
    lastIteration,
  };
}

/** Compte réel de tests via vitest (lent — opt-in seulement). null si indisponible. */
export function deriveTestCount() {
  try {
    const out = execSync('npx vitest run', { cwd: ROOT, stdio: ['ignore', 'pipe', 'pipe'] }).toString();
    const m = out.match(/Tests\s+(\d+)\s+passed/);
    return m ? Number(m[1]) : null;
  } catch (e) {
    const out = `${e.stdout ?? ''}${e.stderr ?? ''}`;
    const m = out.match(/Tests\s+(\d+)\s+passed/);
    return m ? Number(m[1]) : null;
  }
}

/**
 * Confronte les assertions « ÉTAT COURANT » de CLAUDE.md au réel. On ne vise QUE les formes
 * canoniques (`events.json` (N)`, `(N v / N e)`) — jamais les compteurs HISTORIQUES de la
 * ROADMAP (« 320→342 », « Total X→Y ») qui sont des traces de process et doivent rester figés.
 * @returns {{where:string,label:string,claimed:number,real:number}[]} les écarts (vide = OK).
 */
export function checkDocs(status) {
  const mismatches = [];
  const claude = readText('CLAUDE.md');
  const add = (where, label, claimed, real) => {
    if (claimed != null && Number(claimed) !== real) {
      mismatches.push({ where, label, claimed: Number(claimed), real });
    }
  };
  const mEvents = claude.match(/events\.json`?\s*\((\d+)\)/);
  add('CLAUDE.md', 'events.json (N)', mEvents && mEvents[1], status.events);
  const mVerses = claude.match(/verses\.json`?\s*\((\d+)\)/);
  add('CLAUDE.md', 'verses.json (N)', mVerses && mVerses[1], status.verses);
  const mValidate = claude.match(/\((\d+)\s*v\s*\/\s*(\d+)\s*e\)/);
  if (mValidate) {
    add('CLAUDE.md', 'validate (N v / …)', mValidate[1], status.verses);
    add('CLAUDE.md', 'validate (… / N e)', mValidate[2], status.events);
  }
  return mismatches;
}

// — CLI (gardée : pas d'effet à l'import, pour que les tests puissent importer les fonctions pures) —
const isMain = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];
if (isMain) {
  const args = process.argv.slice(2);
  const status = deriveStatus();

  if (args.includes('--check')) {
    const mismatches = checkDocs(status);
    if (mismatches.length === 0) {
      console.log('✅ status --check : la doc canonique reflète le réel.');
      process.exit(0);
    }
    console.error('❌ status --check : la doc contredit le réel —');
    for (const m of mismatches) {
      console.error(`  ${m.where} : « ${m.label} » dit ${m.claimed}, réel = ${m.real}`);
    }
    console.error('  → mets à jour la prose, ou régénère depuis « node tools/status.mjs ».');
    process.exit(1);
  }

  const rows = [
    ['Branche', status.branch],
    ['HEAD', `${status.head} — ${status.lastCommit}`],
    ['Dernière itération', status.lastIteration ?? '?'],
    ['Événements', status.events],
    ['Versets', status.verses],
    ['Dilemmes moraux', status.moralDilemmas],
  ];
  if (args.includes('--tests')) {
    const n = deriveTestCount();
    rows.push(['Tests (vitest)', n ?? '? (vitest indisponible)']);
  }
  const width = Math.max(...rows.map(([k]) => k.length));
  console.log('— ÉTAT ÉLIAS (dérivé des sources, pas narré) —');
  for (const [k, v] of rows) console.log(`  ${String(k).padEnd(width)} : ${v}`);
  if (!args.includes('--tests')) console.log('  (ajoute --tests pour le compte réel de tests)');
}
