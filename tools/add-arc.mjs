#!/usr/bin/env node
/**
 * Crée un arc narratif complet (multi-événements) pour Élias.
 * Usage : node tools/add-arc.mjs
 * 
 * Génère 3-5 événements liés + l'entrée storyArcs.json.
 * Chaque événement est automatiquement chainé au suivant.
 */
import fs from 'fs';
import path from 'path';
import { createInterface } from 'readline';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const EVENTS_PATH = path.join(__dirname, '..', 'game', 'data', 'events.json');
const ARCS_PATH = path.join(__dirname, '..', 'game', 'data', 'storyArcs.json');

const rl = createInterface({ input: process.stdin, output: process.stdout });

function ask(q) { return new Promise(resolve => rl.question(q, resolve)); }

async function main() {
  console.log('\n═══════════════════════════════════');
  console.log('  CRÉATION D\'ARC NARRATIF — Élias');
  console.log('═══════════════════════════════════\n');

  const events = JSON.parse(fs.readFileSync(EVENTS_PATH, 'utf8'));
  let arcs = [];
  try { arcs = JSON.parse(fs.readFileSync(ARCS_PATH, 'utf8')); } catch { arcs = []; }

  // ── INFOS DE BASE ──
  const name = await ask('Nom de l\'arc (ex: Le pardon de Louise) : ');
  const description = await ask('Description de l\'arc : ');
  const arcId = 'arc-' + (await ask('ID court (ex: louise) : ')).toLowerCase().replace(/[^a-z]/g, '_');

  // ── NOMBRE D'ÉVÉNEMENTS ──
  const count = parseInt(await ask('Nombre d\'événements (3-5) [3] : ') || '3');
  const actualCount = Math.max(3, Math.min(5, count));

  // ── CATÉGORIE ──
  const cat = await ask('Catégorie (ex: amertume_rejet) : ');

  // ── TRANCHE D'ÂGE ──
  const ageMin = parseInt(await ask('Âge minimum [16] : ') || '16');
  const ageMax = parseInt(await ask('Âge maximum [60] : ') || '60');

  // ── VERSET CORRECT ──
  const correctVerse = await ask('ID du verset correct (ex: v-amer-004) : ');

  // ── GÉNÉRATION DES ÉVÉNEMENTS ──
  const eventIds = [];
  const eventTemplates = [
    { suffix: '', titleSuffix: '', desc: 'première rencontre/confrontation' },
    { suffix: '-2', titleSuffix: ' — partie 2', desc: 'développement du conflit' },
    { suffix: '-3', titleSuffix: ' — partie 3', desc: 'point de rupture ou climax' },
    { suffix: '-4', titleSuffix: ' — partie 4', desc: 'dénouement' },
    { suffix: '-5', titleSuffix: ' — partie 5', desc: 'résolution finale' },
  ];

  const arcEvents = [];
  for (let i = 0; i < actualCount; i++) {
    const tpl = eventTemplates[i];
    const eventId = `${arcId}${tpl.suffix}`;
    eventIds.push(eventId);
    
    console.log(`\n--- Événement ${i + 1}/${actualCount} : ${tpl.desc} ---`);
    const eventTitle = await ask(`  Titre [${name}${tpl.titleSuffix}] : `) || `${name}${tpl.titleSuffix}`;
    const eventDesc = await ask('  Description : ');
    const flavor = await ask('  Thematic flavor (optionnel) : ');
    
    // Malus
    const foi = parseInt(await ask('  Malus Foi [-3] : ') || '-3');
    const paix = parseInt(await ask('  Malus Paix [-3] : ') || '-3');
    const physique = parseInt(await ask('  Malus Physique [-1] : ') || '-1');
    const finances = parseInt(await ask('  Malus Finances [-1] : ') || '-1');

    // Bonus ?
    const hasBonus = (await ask('  Bonus succès ? (o/N) : ')).toLowerCase() === 'o';
    let statImpactOnSuccess = undefined;
    if (hasBonus) {
      const bonus = {};
      const bFoi = parseInt(await ask('    Foi [0] : ') || '0');
      const bPaix = parseInt(await ask('    Paix [0] : ') || '0');
      if (bFoi) bonus.foi = bFoi;
      if (bPaix) bonus.paix = bPaix;
      if (Object.keys(bonus).length > 0) statImpactOnSuccess = bonus;
    }

    // Cascade ?
    const useCascade = i < actualCount - 1;
    const cascadeEventId = useCascade ? `${arcId}${eventTemplates[i + 1].suffix}` : undefined;

    const evt = {
      id: eventId,
      title: eventTitle,
      description: eventDesc,
      ageRange: [ageMin, ageMax - (actualCount - 1 - i) * 3],
      category: cat,
      correctVerseId: correctVerse,
      decoyVerseIds: [],
      statImpactOnFail: { foi, paix, physique, finances },
      storyArcId: arcId,
      arcSequence: i + 1,
    };
    if (statImpactOnSuccess) evt.statImpactOnSuccess = statImpactOnSuccess;
    if (cascadeEventId) evt.cascadeEventId = cascadeEventId;
    if (flavor) evt.thematicFlavor = flavor;
    
    // Prérequis : event précédent de l'arc
    if (i > 0) {
      evt.prerequisites = [{ kind: 'event_completed', eventId: eventIds[i - 1] }];
    }

    arcEvents.push(evt);
  }

  // ── CRÉER L'ARC ──
  const rewardVerse = await ask(`\nVerset de récompense [${correctVerse}] : `) || correctVerse;
  const rewardTitle = await ask('Titre de récompense (ex: Le Réconciliateur) : ');

  const arc = {
    id: arcId,
    name,
    description,
    eventIds,
    rewardVerseId: rewardVerse,
    rewardTitle: rewardTitle || undefined,
  };

  // ── AFFICHER LE RÉSULTAT ──
  console.log('\n═══════════════════════════════════');
  console.log('  RÉSULTAT');
  console.log('═══════════════════════════════════\n');

  console.log('ARC :');
  console.log(JSON.stringify(arc, null, 2));
  console.log(`\nÉVÉNEMENTS (${arcEvents.length}) :`);
  arcEvents.forEach(e => console.log(`  ${e.id} → ${e.title}`));

  const confirm = (await ask('\nTout ajouter ? (O/n) : ')).toLowerCase();
  if (confirm === 'n') {
    console.log('Annulé.');
    rl.close();
    return;
  }

  // Ajouter les événements
  events.push(...arcEvents);
  fs.writeFileSync(EVENTS_PATH, JSON.stringify(events, null, 2));
  console.log(`✅ ${arcEvents.length} événements ajoutés`);

  // Ajouter l'arc
  arcs.push(arc);
  fs.writeFileSync(ARCS_PATH, JSON.stringify(arcs, null, 2));
  console.log(`✅ Arc "${name}" ajouté`);

  console.log('\nÉtapes suivantes :');
  console.log(`  1. node tools/validate-data.cjs — tout valider`);
  console.log(`  2. Vérifier que les versets existent dans game/data/verses.json`);
  console.log(`  3. Si besoin, ajouter des leurres (decoyVerseIds) manuellement`);
  console.log('');
  rl.close();
}

main().catch(e => { console.error(e); process.exit(1); });
