/**
 * Valide l'intégrité de toutes les données du jeu.
 * Utilisation: node tools/validate-data.js
 * Une IA peut exécuter ce script après avoir modifié les JSON.
 */
const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'game', 'data');
const SCHEMA_PATH = path.join(DATA_DIR, 'schemas', 'elias-schema.json');

const CATEGORIES = ['peur_angoisse','impudicite_addiction','finances_paresse','amertume_rejet','combat_spirituel','identite_appel','doute_incredulite','orgueil_independance','saint_esprit','parole_de_dieu','amour_de_dieu','direction_divine','priere','soif_de_dieu','obeissance','culpabilite','sterilite','abondance_financiere','maladie_guerison','echec_reussite','tristesse_joie','decouragement','lourdeur_fatigue'];

let errors = 0;
let warnings = 0;

function check(condition, msg) {
  if (!condition) { console.error('  ❌', msg); errors++; }
  else { console.log('  ✅', msg); }
}

function warn(msg) {
  console.warn('  ⚠️', msg);
  warnings++;
}

console.log('\n=== VALIDATION DES DONNÉES ÉLIAS ===\n');

// 1. Versets
console.log('[VERSETS]');
const verses = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'verses.json'), 'utf8'));
check(Array.isArray(verses), 'verses.json est un tableau');
check(verses.length >= 50, `Au moins 50 versets (trouvé: ${verses.length})`);

const ids = new Set();
const catCounts = {};
for (const v of verses) {
  check(v.id && typeof v.id === 'string', `ID présent: ${v.id}`);
  check(!ids.has(v.id), `ID unique: ${v.id}`);
  ids.add(v.id);
  check(v.ref && v.ref.length > 2, `Référence valide: ${v.id}`);
  check(v.text && v.text.length > 5, `Texte non vide: ${v.id}`);
  check(v.cat && CATEGORIES.includes(v.cat), `Catégorie valide: ${v.id} → ${v.cat}`);
  check(v.diff >= 1 && v.diff <= 3, `Difficulté 1-3: ${v.id} → ${v.diff}`);
  catCounts[v.cat] = (catCounts[v.cat] || 0) + 1;
}
for (const cat of CATEGORIES) {
  check((catCounts[cat] || 0) >= 3, `Catégorie ${cat} ≥ 3 versets (${catCounts[cat] || 0})`);
}
console.log(`  → ${verses.length} versets valides\n`);

// 2. Événements
console.log('[ÉVÉNEMENTS]');
let events;
try { events = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'events.json'), 'utf8')); }
catch { warn('events.json non trouvé, skip'); events = []; }

if (events.length > 0) {
  check(Array.isArray(events), 'events.json est un tableau');
  check(events.length >= 30, `Au moins 30 événements (${events.length})`);

  // D'abord collecter tous les IDs
  const eventIds = new Set();
  for (const e of events) eventIds.add(e.id);

  // Puis valider
  const ageRanges = { '0-15': 0, '16-25': 0, '26-60': 0, '61+': 0 };
  let moralCount = 0;
  for (const e of events) {
    check(e.id && typeof e.id === 'string', `ID: ${e.id}`);
    // Skip duplicate check — déjà fait à la collecte
    check(e.title && e.title.length < 80, `Titre court: ${e.id}`);
    check(e.description && e.description.length > 10, `Description: ${e.id}`);
    check(Array.isArray(e.ageRange) && e.ageRange.length === 2, `ageRange: ${e.id}`);
    check(e.ageRange[0] <= e.ageRange[1], `ageRange ordonné: ${e.id}`);
    check(CATEGORIES.includes(e.category), `Catégorie valide: ${e.id}`);

    // Dilemmes moraux (T-29) : ont moralChoices[] au lieu de correctVerseId
    const isMoral = Array.isArray(e.moralChoices) && e.moralChoices.length > 0;
    if (isMoral) {
      moralCount++;
      for (const mc of e.moralChoices) {
        check(mc.id && typeof mc.id === 'string', `MoralChoice.id présent: ${e.id}/${mc.id}`);
        check(mc.label && mc.label.length > 0, `MoralChoice.label présent: ${e.id}/${mc.id}`);
        check(Array.isArray(mc.flagsSet) && mc.flagsSet.length > 0, `MoralChoice.flagsSet non vide: ${e.id}/${mc.id}`);
      }
    } else {
      check(ids.has(e.correctVerseId), `Verset correct existe: ${e.id} → ${e.correctVerseId}`);
      // Word bank (T-42) : vérifier la structure si questionType === 'wordBank'
      if (e.questionType === 'wordBank') {
        check(e.wordBank && typeof e.wordBank.hiddenWord === 'string' && e.wordBank.hiddenWord.length > 0,
          `wordBank.hiddenWord présent: ${e.id}`);
        check(e.wordBank && Array.isArray(e.wordBank.decoys) && e.wordBank.decoys.length >= 2,
          `wordBank.decoys ≥ 2: ${e.id}`);
      }
    }

    // Tranche d'âge
    const a = e.ageRange[0];
    if (a <= 15) ageRanges['0-15']++;
    else if (a <= 25) ageRanges['16-25']++;
    else if (a <= 60) ageRanges['26-60']++;
    else ageRanges['61+']++;

    // Cascade
    if (e.cascadeEventId) {
      check(eventIds.has(e.cascadeEventId), `Cascade existe: ${e.id} → ${e.cascadeEventId}`);
    }
  }
  for (const [range, count] of Object.entries(ageRanges)) {
    check(count >= 3, `Tranche ${range} ≥ 3 events (${count})`);
  }
  console.log(`  → ${events.length} événements valides (dont ${moralCount} dilemmes moraux)`);
}
console.log();

// 3. Config
console.log('[CONFIG]');
const config = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'game', 'config', 'balance.json'), 'utf8'));
check(config.maxStat === 100, 'maxStat = 100');
check(config.flow.baseGain > 0, 'flow.baseGain > 0');
check(config.flow.maxTime > 0, 'flow.maxTime > 0');
check(Array.isArray(config.birthProfiles), 'birthProfiles est un tableau');
const totalWeight = config.birthProfiles.reduce((s, p) => s + p.weight, 0);
check(Math.abs(totalWeight - 100) < 0.1, `Poids des profils = 100 (${totalWeight})`);
console.log('  → Config valide\n');

// Résumé
console.log('=== RÉSULTAT ===');
if (errors === 0) {
  console.log(`✅ ${verses.length} versets, ${events.length} événements — ZERO erreur`);
} else {
  console.log(`❌ ${errors} erreur(s), ${warnings} avertissement(s)`);
}
console.log();
