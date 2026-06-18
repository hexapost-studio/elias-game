/**
 * survival-sim.ts — Harnais de MESURE d'équilibrage (headless, hors bundle, hors porte QA).
 *
 *   npx tsx tools/survival-sim.ts            # défaut : N=1000, p ∈ {50,65,75,85}%
 *   N=2000 npx tsx tools/survival-sim.ts     # surcharge le nombre de vies par scénario
 *
 * Pur outil : NE MODIFIE AUCUNE DONNÉE de jeu. Rejoue des milliers de vies 0→100 en
 * pilotant directement l'engine (mêmes fonctions que le store), pour répondre
 * objectivement à deux questions de l'audit :
 *   1. ÉQUILIBRAGE — âge médian de mort par niveau de précision ; % atteignant 60/80/100 ;
 *      quelle stat tue (pression dominante, surtout au palier senior 61+).
 *   2. ROUTINE — nombre d'events DISTINCTS vus par vie (vs pool disponible).
 *
 * Deux scénarios par précision : « réponses seules » (isole le combat+vieillissement)
 * et « avec actions » (joueur sensé : dépense ses points d'action sur la stat la plus basse).
 */
import {
  createInitialState,
  advanceAge,
  validateChoice,
  applyPlayerAction,
  checkGameOver,
} from '../src/engine/gameEngine';
import type { GameState, PlayerAction } from '../src/types/game';

type StatName = 'foi' | 'paix' | 'physique' | 'finances';
const ACCURACIES = [0.5, 0.65, 0.75, 0.85];
const N = Number(process.env.N ?? 1000);

/** Choisit l'action qui relève le mieux la stat la plus basse (joueur « sensé »). */
function policyAction(state: GameState): PlayerAction {
  const s = state.stats;
  const lowest = (['physique', 'finances', 'paix', 'foi'] as StatName[])
    .sort((a, b) => s[a] - s[b])[0];
  switch (lowest) {
    case 'physique': return 'pray';        // évite jeûner (coûte physique) ; prier monte foi sans coût corps
    case 'finances': return 'serve';       // paix + finances
    case 'paix':     return 'serve';       // paix
    default:         return 'read_word';   // foi
  }
}

interface LifeResult { ageAtDeath: number; cause: string; distinctEvents: number; totalEvents: number; }

function runLife(p: number, withActions: boolean): LifeResult {
  let state = createInitialState(undefined, Math.floor(Math.random() * 2 ** 31));
  const seen = new Set<string>();
  let total = 0;

  while (state.age < 100) {
    state = advanceAge(state).newState;
    let over = checkGameOver(state);
    if (over.isOver) return { ageAtDeath: state.age, cause: over.reason ?? 'inconnu', distinctEvents: seen.size, totalEvents: total };

    // Actions volontaires (jusqu'à épuisement des points d'action de l'année).
    if (withActions) {
      let guard = 0;
      while (state.actionPoints > 0 && guard++ < 5) {
        const res = applyPlayerAction(state, policyAction(state));
        if (!res) break;
        state = res.newState;
      }
    }

    if (state.currentEvent) {
      const ev = state.currentEvent;
      seen.add(ev.id);
      total++;
      const correct = ev.correctVerseId;
      const decoys = ev.decoyVerseIds ?? [];
      const verseId = Math.random() < p
        ? correct
        : (decoys.length ? decoys[Math.floor(Math.random() * decoys.length)] : correct);
      state = validateChoice(state, verseId, 5).newState;
      over = checkGameOver(state);
      if (over.isOver) return { ageAtDeath: state.age, cause: over.reason ?? 'inconnu', distinctEvents: seen.size, totalEvents: total };
    }
  }
  return { ageAtDeath: 100, cause: 'victory', distinctEvents: seen.size, totalEvents: total };
}

function median(xs: number[]): number {
  const a = [...xs].sort((x, y) => x - y);
  const m = Math.floor(a.length / 2);
  return a.length % 2 ? a[m] : Math.round((a[m - 1] + a[m]) / 2);
}
function pct(xs: number[], pred: (x: number) => boolean): string {
  return (100 * xs.filter(pred).length / xs.length).toFixed(0) + '%';
}
/** Extrait la stat mise en cause par le message de mort (« La jauge de {stat} est tombée… »). */
function causeStat(cause: string): string {
  if (cause === 'victory') return 'victoire';
  const m = cause.match(/jauge de (\w+)/);
  return m ? m[1] : 'autre';
}
function dominantCause(results: LifeResult[]): string {
  const counts: Record<string, number> = {};
  for (const r of results) counts[causeStat(r.cause)] = (counts[causeStat(r.cause)] ?? 0) + 1;
  return Object.entries(counts).sort((a, b) => b[1] - a[1])
    .map(([k, v]) => `${k} ${(100 * v / results.length).toFixed(0)}%`).join(', ');
}

function scenario(name: string, withActions: boolean) {
  console.log(`\n### Scénario : ${name}  (N=${N}/précision)`);
  console.log('| précision | âge médian | ≥60 ans | ≥80 ans | =100 ans | events distincts/vie | cause de mort dominante |');
  console.log('|---|---|---|---|---|---|---|');
  for (const p of ACCURACIES) {
    const lives = Array.from({ length: N }, () => runLife(p, withActions));
    const ages = lives.map((l) => l.ageAtDeath);
    const distinct = lives.map((l) => l.distinctEvents);
    console.log(
      `| ${(p * 100).toFixed(0)}% | ${median(ages)} | ${pct(ages, (a) => a >= 60)} | ${pct(ages, (a) => a >= 80)} | ${pct(ages, (a) => a >= 100)} | ${(distinct.reduce((s, x) => s + x, 0) / N).toFixed(1)} | ${dominantCause(lives)} |`,
    );
  }
}

console.log(`# Simulation de survie Élias — ${new Date().toISOString().slice(0, 10)}`);
const t0 = Date.now();
scenario('réponses seules (combat + vieillissement isolés)', false);
scenario('avec actions (joueur sensé, actions sur la stat la plus basse)', true);
console.log(`\n(simulé en ${((Date.now() - t0) / 1000).toFixed(1)} s)`);
