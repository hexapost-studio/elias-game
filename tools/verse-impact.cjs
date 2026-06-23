#!/usr/bin/env node
/**
 * verse-impact.cjs — Analyse d'impact avant de modifier un verset.
 *
 * Usage : node tools/verse-impact.cjs v-amer-003
 *         node tools/verse-impact.cjs --all       (liste tous les versets avec leur statut)
 *
 * Répond à : "si je change ce verset, qu'est-ce qui casse ?"
 * À lancer AVANT toute modification de game/data/verses.json.
 */
const fs = require('fs');
const path = require('path');

const DATA = path.join(__dirname, '..', 'game', 'data');
const verses = JSON.parse(fs.readFileSync(path.join(DATA, 'verses.json'), 'utf8'));
const events = JSON.parse(fs.readFileSync(path.join(DATA, 'events.json'), 'utf8'));

// Index : verseId → events qui en dépendent comme bonne réponse
const citedBy = {};
events.forEach(e => {
  if (e.correctVerseId) {
    if (!citedBy[e.correctVerseId]) citedBy[e.correctVerseId] = [];
    citedBy[e.correctVerseId].push({ id: e.id, title: e.title, category: e.category });
  }
});

const arg = process.argv[2];

if (!arg || arg === '--help') {
  console.log('Usage: node tools/verse-impact.cjs <verseId>');
  console.log('       node tools/verse-impact.cjs --all');
  process.exit(0);
}

if (arg === '--all') {
  // Liste complète avec statut
  const anchored = [];
  const decoyOnly = [];
  verses.forEach(v => {
    const deps = citedBy[v.id] || [];
    if (deps.length > 0) anchored.push({ v, deps });
    else decoyOnly.push(v);
  });

  console.log('\n=== VERSETS ANCRÉS (' + anchored.length + ') — NE PAS changer le texte sans vérifier ===\n');
  anchored.forEach(({ v, deps }) => {
    console.log('🔒 ' + v.id + ' [' + v.cat + '] ' + v.ref + ' — ' + deps.length + ' event(s)');
    deps.forEach(e => console.log('    ↳ ' + e.id + ' [' + e.category + '] ' + e.title));
  });

  console.log('\n=== VERSETS LEURRES SEULS (' + decoyOnly.length + ') — Modifiables librement ===\n');
  decoyOnly.forEach(v => {
    console.log('✏️  ' + v.id + ' [' + v.cat + '] ' + v.ref);
  });

  console.log('\nTotal : ' + verses.length + ' versets (' + anchored.length + ' ancrés, ' + decoyOnly.length + ' libres)');
  process.exit(0);
}

// Analyse d'un verset spécifique
const verse = verses.find(v => v.id === arg);
if (!verse) {
  console.error('Verset non trouvé : ' + arg);
  process.exit(1);
}

const deps = citedBy[verse.id] || [];

console.log('\n=== IMPACT DE LA MODIFICATION DE ' + verse.id + ' ===\n');
console.log('Référence : ' + verse.ref);
console.log('Catégorie : ' + verse.cat);
console.log('Texte     : "' + verse.text.slice(0, 80) + (verse.text.length > 80 ? '…' : '') + '"');
console.log('');

if (deps.length === 0) {
  console.log('✅ VERSET LIBRE — jamais bonne réponse dans un event.');
  console.log('   Utilisé uniquement comme leurre (pickDecoys). Modification sans risque.');
} else {
  console.log('🔒 VERSET ANCRÉ — bonne réponse dans ' + deps.length + ' event(s) :');
  console.log('');
  deps.forEach(e => {
    const ev = events.find(x => x.id === e.id);
    console.log('   ⚠️  ' + e.id + ' [' + e.category + '] "' + e.title + '"');
    if (ev?.thematicFlavor) console.log('      Flavor: "' + ev.thematicFlavor + '"');
  });
  console.log('');
  console.log('   → Changer le texte de ce verset changera la "bonne réponse" de ces events.');
  console.log('   → Seules les corrections de fautes sont autorisées.');
  console.log('   → Pour remplacer ce verset, créer un nouveau v-xxx-NNN et mettre à jour les events.');
}
