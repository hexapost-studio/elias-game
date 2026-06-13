#!/usr/bin/env node
/**
 * Ajoute un événement à game/data/events.json.
 * Usage : node tools/add-event.mjs
 * 
 * Pose des questions et génère un événement valide.
 * Validateur intégré : run `node tools/validate-data.cjs` après.
 */
import fs from 'fs';
import path from 'path';
import { createInterface } from 'readline';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const EVENTS_PATH = path.join(__dirname, '..', 'game', 'data', 'events.json');
const VERSES_PATH = path.join(__dirname, '..', 'game', 'data', 'verses.json');

const rl = createInterface({ input: process.stdin, output: process.stdout });

function ask(q) {
  return new Promise(resolve => rl.question(q, resolve));
}

function pick(list, label) {
  console.log(`\n${label} :`);
  list.forEach((item, i) => console.log(`  ${i + 1}. ${item}`));
  return ask(`Choix (1-${list.length}) : `).then(a => list[parseInt(a) - 1] || list[0]);
}

async function main() {
  console.log('\n═══════════════════════════════════');
  console.log('  AJOUT D\'ÉVÉNEMENT — Élias');
  console.log('═══════════════════════════════════\n');

  // Charger les données existantes
  const events = JSON.parse(fs.readFileSync(EVENTS_PATH, 'utf8'));
  const verses = JSON.parse(fs.readFileSync(VERSES_PATH, 'utf8'));
  
  // Récupérer les catégories disponibles depuis les versets
  const categories = [...new Set(verses.map(v => v.cat))].sort();
  const categoryLabels = categories.map(c => c.replace(/_/g, ' '));

  // Récupérer les versets par catégorie
  const versesByCat = {};
  for (const v of verses) {
    if (!versesByCat[v.cat]) versesByCat[v.cat] = [];
    versesByCat[v.cat].push(v);
  }

  // ── ID ──
  const catShort = await pick(categories.map((c, i) => `${categoryLabels[i]} (${c})`), 'CATÉGORIE');
  const cat = catShort.match(/\(([^)]+)\)/)?.[1] || categories[0];
  const prefix = cat.substring(0, 4);
  const existing = events.filter(e => e.id.startsWith(prefix));
  const nextNum = String(existing.length + 1).padStart(3, '0');
  const defaultId = `${prefix}-${nextNum}`;
  const id = await ask(`ID [${defaultId}] : `) || defaultId;

  // ── TITRE ──
  let title = '';
  while (!title || title.length < 3) {
    title = await ask('Titre de l\'épreuve : ');
  }

  // ── DESCRIPTION ──
  console.log('\nDescription (utilise {ami}, {ville}, {métier}, {église}, {conjoint}, {père}, {mère}) :');
  const description = await ask('> ');

  // ── TRANCHE D'ÂGE ──
  const ageMin = parseInt(await ask('Âge minimum [0] : ') || '0');
  const ageMax = parseInt(await ask('Âge maximum [99] : ') || '99');

  // ── VERSETS ──
  const catVerses = versesByCat[cat] || [];
  console.log(`\nVersets disponibles pour ${cat} :`);
  catVerses.forEach((v, i) => console.log(`  ${i + 1}. ${v.ref} — ${v.text.substring(0, 60)}...`));
  
  const correctIdx = parseInt(await ask('Numéro du verset correct : ')) - 1;
  const correctVerse = catVerses[correctIdx] || catVerses[0];

  // ── STATS ──
  console.log('\nMalus en cas d\'échec (valeurs négatives, ex: -3) :');
  const foi = parseInt(await ask('  Foi [-3] : ') || '-3');
  const paix = parseInt(await ask('  Paix [-3] : ') || '-3');
  const physique = parseInt(await ask('  Physique [-1] : ') || '-1');
  const finances = parseInt(await ask('  Finances [-1] : ') || '-1');

  // ── BONUS (optionnel) ──
  const hasBonus = (await ask('\nAjouter un bonus en cas de succès ? (o/N) : ')).toLowerCase() === 'o';
  let statImpactOnSuccess = undefined;
  if (hasBonus) {
    console.log('Bonus (valeurs positives) :');
    const bFoi = parseInt(await ask('  Foi [0] : ') || '0');
    const bPaix = parseInt(await ask('  Paix [0] : ') || '0');
    const bPhysique = parseInt(await ask('  Physique [0] : ') || '0');
    const bFinances = parseInt(await ask('  Finances [0] : ') || '0');
    const bonus = {};
    if (bFoi) bonus.foi = bFoi;
    if (bPaix) bonus.paix = bPaix;
    if (bPhysique) bonus.physique = bPhysique;
    if (bFinances) bonus.finances = bFinances;
    if (Object.keys(bonus).length > 0) statImpactOnSuccess = bonus;
  }

  // ── FLAVOR ──
  const flavor = await ask('\nThematic flavor (1 phrase, optionnel) : ');

  // ── STAT MIN (optionnel) ──
  const hasMinStat = (await ask('Stat minimum requise ? (o/N) : ')).toLowerCase() === 'o';
  let minStat = undefined;
  if (hasMinStat) {
    const s = {};
    const statFoi = parseInt(await ask('  Foi min [0] : ') || '0');
    const statPaix = parseInt(await ask('  Paix min [0] : ') || '0');
    const statPhysique = parseInt(await ask('  Physique min [0] : ') || '0');
    const statFinances = parseInt(await ask('  Finances min [0] : ') || '0');
    if (statFoi) s.foi = statFoi;
    if (statPaix) s.paix = statPaix;
    if (statPhysique) s.physique = statPhysique;
    if (statFinances) s.finances = statFinances;
    if (Object.keys(s).length > 0) minStat = s;
  }

  // ── PRÉREQUIS (optionnel) ──
  const hasPrereq = (await ask('\nPrérequis (event requis avant) ? (o/N) : ')).toLowerCase() === 'o';
  let prerequisites = undefined;
  if (hasPrereq) {
    const prereqEventId = await ask('  ID de l\'event requis : ');
    if (prereqEventId) {
      prerequisites = [{ kind: 'event_completed', eventId: prereqEventId }];
    }
  }

  // ── CONDUIRE LE RÉSULTAT ──
  console.log('\n═══════════════════════════════════');
  console.log('  RÉSULTAT');
  console.log('═══════════════════════════════════');

  const newEvent = {
    id,
    title,
    description,
    ageRange: [ageMin, ageMax],
    category: cat,
    correctVerseId: correctVerse.id,
    decoyVerseIds: [],
    statImpactOnFail: { foi, paix, physique, finances },
  };
  if (statImpactOnSuccess) newEvent.statImpactOnSuccess = statImpactOnSuccess;
  if (flavor) newEvent.thematicFlavor = flavor;
  if (minStat) newEvent.minStat = minStat;
  if (prerequisites) newEvent.prerequisites = prerequisites;

  console.log(JSON.stringify(newEvent, null, 2));
  const confirm = (await ask('\nAjouter cet événement ? (O/n) : ')).toLowerCase();
  if (confirm === 'n') {
    console.log('Annulé.');
    rl.close();
    return;
  }

  events.push(newEvent);
  fs.writeFileSync(EVENTS_PATH, JSON.stringify(events, null, 2));
  console.log(`\n✅ Événement "${title}" ajouté à game/data/events.json`);

  // Copier aussi dans src/data/events.ts si besoin
  const tsPath = path.join(__dirname, '..', 'src', 'data', 'events.ts');
  if (fs.existsSync(tsPath)) {
    console.log('ℹ  src/data/events.ts importe depuis le JSON — déjà synchronisé');
  }

  console.log('\nPour valider : node tools/validate-data.cjs\n');
  rl.close();
}

main().catch(e => { console.error(e); process.exit(1); });
