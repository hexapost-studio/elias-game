#!/usr/bin/env node
/**
 * Amorce la VARIÉTÉ DE TEXTE : injecte des narrativeVariants (conditionnées
 * saison / appel) et un byAge de démonstration dans game/data/events.json.
 *
 * Idempotent : n'ajoute une variante que si l'event n'en a pas déjà avec le
 * même type+clé. Lance : node tools/seed-variants.cjs
 */
const fs = require('fs');
const path = require('path');

const FILE = path.join(__dirname, '..', 'game', 'data', 'events.json');
const events = JSON.parse(fs.readFileSync(FILE, 'utf8'));

/** variantes par event : title/description réécrits selon la condition. */
const VARIANTS = {
  'e-prod-001': [
    { condition: { type: 'season', season: 'Désert' },
      title: 'Le licenciement, en plein désert',
      description: "L'entreprise licencie alors que tout semblait déjà sec. Pas de filet, pas de réponse du ciel — juste les factures et le silence. Tiendras-tu sans rien voir ?" },
    { condition: { type: 'calling', callingId: 'batisseur' },
      title: "L'œuvre s'effondre",
      description: "Le projet que tu bâtissais s'écroule du jour au lendemain. Toi qui construis, te voilà les mains vides. La peur du lendemain te paralyse." },
  ],
  'e-prod-002': [
    { condition: { type: 'season', season: 'Abondance' },
      title: 'La porte dérobée de la réussite',
      description: "Tout te sourit, et c'est justement là qu'une porte s'entrouvre. Un(e) collègue s'intéresse de près. Personne ne le saurait. L'abondance teste le cœur autant que le manque." },
    { condition: { type: 'calling', callingId: 'berger' },
      title: 'La brèche du berger',
      description: "Toi qui veilles sur les autres, voilà que ta propre maison vacille. Un(e) collègue s'approche au mauvais moment. Qui garde le gardien ?" },
  ],
  'e-prod-004': [
    { condition: { type: 'calling', callingId: 'intercesseur' },
      title: 'Cloué au lit, toi qui portais les autres',
      description: "Le diagnostic tombe. Toi qui intercédais pour tous, te voilà à ton tour sur le lit. Les nuits sont longues. Sauras-tu recevoir ce que tu donnais ?" },
    { condition: { type: 'season', season: 'Grâce' },
      title: 'La maladie sous la grâce',
      description: "Le diagnostic tombe en pleine saison de repos. Le corps faiblit, mais une paix étrange t'enveloppe. Le découragement guette pourtant aux heures sombres." },
  ],
  'e-prod-005': [
    { condition: { type: 'calling', callingId: 'evangeliste' },
      title: 'Le feu qui vacille',
      description: "Toi qui annonçais avec flamme, tu te surprends à réciter sans brûler. Le service continue, mécanique. Comment rallumer ce qui faisait ta force ?" },
    { condition: { type: 'season', season: 'Désert' },
      title: 'Servir à sec',
      description: "Tu sers, tu travailles, tu gères tout — et le puits semble vide. Ta foi était vive ; maintenant chaque geste coûte. Le désert t'apprend autre chose." },
  ],
  'e-prod-007': [
    { condition: { type: 'calling', callingId: 'disciple' },
      title: "L'élève qu'on appelle à conduire",
      description: "Toi qui aimais apprendre dans l'ombre, on te pousse devant. Un ministère, une responsabilité. La peur de n'être pas prêt te serre la gorge." },
    { condition: { type: 'has_trait', traitId: 'incassable' },
      title: 'Appelé, et cette fois sans trembler',
      description: "On te propose un poste à responsabilité. Tu as déjà touché le fond et tu t'es relevé : la peur frappe encore, mais elle ne commande plus. Diras-tu oui ?" },
  ],
  'e-gueris-001': [
    { condition: { type: 'season', season: 'Désert' },
      title: 'Malade, et le ciel se tait',
      description: "Une maladie te cloue au lit en pleine traversée aride. {mère} veille, {père} prie, mais le ciel paraît silencieux. Continueras-tu d'espérer la guérison ?" },
  ],
};

/** byAge de démonstration sur l'event qui couvre enfant→senior. */
const BY_AGE = {
  'e-gueris-001': {
    enfant: {
      description: "Tu es petit, et la fièvre ne tombe pas. {mère} pose une main fraîche sur ton front, {père} murmure une prière près de ton lit. Tu ne comprends pas tout, mais tu sens qu'on te porte.",
      thematicFlavor: 'fièvre d\'enfant',
    },
    ado: {
      description: "Cloué au lit alors que tes amis vivent dehors, tu rumines. Pourquoi toi ? {mère} veille, {père} prie, mais tu voudrais surtout comprendre. La guérison viendra-t-elle ?",
    },
    senior: {
      description: "Le corps, fidèle si longtemps, déclare forfait. Allongé, tu repasses ta vie. {mère} n'est plus là pour veiller, mais d'autres prient à ton chevet. Tu sais désormais Qui tient ton souffle.",
      thematicFlavor: 'le corps qui lâche',
    },
  },
};

let addedV = 0, addedA = 0;
for (const ev of events) {
  const vs = VARIANTS[ev.id];
  if (vs) {
    ev.narrativeVariants = ev.narrativeVariants || [];
    for (const v of vs) {
      const key = JSON.stringify(v.condition);
      const exists = ev.narrativeVariants.some((x) => JSON.stringify(x.condition) === key);
      if (!exists) { ev.narrativeVariants.push(v); addedV++; }
    }
  }
  if (BY_AGE[ev.id] && !ev.byAge) { ev.byAge = BY_AGE[ev.id]; addedA++; }
}

fs.writeFileSync(FILE, JSON.stringify(events, null, 2) + '\n', 'utf8');
console.log(`✅ ${addedV} narrativeVariants ajoutées, ${addedA} byAge ajoutés. Total events: ${events.length}`);
