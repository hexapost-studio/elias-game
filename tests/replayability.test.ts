/**
 * @file replayability.test.ts
 * @description Couvre les 4 leviers « nouvelle aventure à chaque lancement » :
 *   1. Appel / Destinée seedé et varié
 *   2. Saisons spirituelles émergentes & déterministes pour un seed donné
 *   3. Traits gagnés en cours de vie
 *   4. Narrateur offline (variété + déterminisme seedé)
 */
import { describe, it, expect } from 'vitest';
import {
  createInitialState,
  computeSeasonTransition,
} from '../src/engine/gameEngine';
import { CALLINGS, pickCalling, getCallingById } from '../src/data/callings';
import { TRAITS, evaluateTraitAwards } from '../src/data/traits';
import { generateOfflineJournal } from '../src/services/offlineNarrator';
import { mulberry32 } from '../src/engine/rng';
import type { GameState, StatName } from '../src/types/game';

/* ═══════════════════════════════
   L1 — Appel / Destinée
   ═══════════════════════════════ */
describe('L1: Appel / Destinée par partie', () => {
  it('un seed fixé produit toujours le même Appel (reproductible)', () => {
    const a = createInitialState(undefined, 123456);
    const b = createInitialState(undefined, 123456);
    expect(a.calling?.id).toBeDefined();
    expect(a.calling?.id).toBe(b.calling?.id);
    expect(a.seed).toBe(b.seed);
  });

  it('pickCalling génère de la variété sur de nombreux seeds', () => {
    const ids = new Set<string>();
    for (let s = 0; s < 200; s++) {
      ids.add(pickCalling(mulberry32(s * 2654435761)).id);
    }
    // Au moins la moitié du catalogue doit apparaître.
    expect(ids.size).toBeGreaterThanOrEqual(Math.ceil(CALLINGS.length / 2));
  });

  it('chaque Appel est récupérable par id (plug pour le choix joueur en partie 2)', () => {
    for (const c of CALLINGS) {
      expect(getCallingById(c.id)?.id).toBe(c.id);
    }
  });

  it('le startBonus de l\'Appel est appliqué aux stats de départ', () => {
    // On reconstruit jusqu'à tomber sur un appel ayant un startBonus non vide.
    let found = false;
    for (let s = 0; s < 50 && !found; s++) {
      const st = createInitialState(undefined, s);
      const bonus = st.calling?.startBonus;
      if (bonus && Object.keys(bonus).length > 0) {
        found = true;
        for (const [k, v] of Object.entries(bonus)) {
          expect(st.stats[k as StatName]).toBeGreaterThanOrEqual(v as number);
        }
      }
    }
    expect(found).toBe(true);
  });
});

/* ═══════════════════════════════
   L2 — Saisons spirituelles émergentes
   ═══════════════════════════════ */
describe('L2: Saisons spirituelles émergentes', () => {
  it('est déterministe pour un même seed/âge/état', () => {
    const state = createInitialState(undefined, 999);
    const a = computeSeasonTransition(state, 30, mulberry32(42));
    const b = computeSeasonTransition(state, 30, mulberry32(42));
    expect(a).toBe(b);
  });

  it('retourne une saison valide', () => {
    const state = createInitialState(undefined, 7);
    const valid = ['Réveil', 'Désert', 'Persécution', 'Abondance', 'Grâce'];
    for (let seed = 0; seed < 30; seed++) {
      expect(valid).toContain(computeSeasonTransition(state, 40, mulberry32(seed)));
    }
  });

  it('une foi basse tire la trajectoire vers le Désert plus souvent', () => {
    const base = createInitialState(undefined, 1);
    const lowFaith: GameState = { ...base, stats: { ...base.stats, foi: 15, paix: 30 } };
    const highFaith: GameState = { ...base, stats: { ...base.stats, foi: 90, paix: 80 } };
    let desertLow = 0, desertHigh = 0;
    for (let seed = 0; seed < 120; seed++) {
      if (computeSeasonTransition(lowFaith, 30, mulberry32(seed)) === 'Désert') desertLow++;
      if (computeSeasonTransition(highFaith, 30, mulberry32(seed)) === 'Désert') desertHigh++;
    }
    expect(desertLow).toBeGreaterThan(desertHigh);
  });
});

/* ═══════════════════════════════
   L3 — Traits gagnés
   ═══════════════════════════════ */
describe('L3: Traits gagnés en cours de vie', () => {
  it('toutes les définitions de traits ont les champs requis', () => {
    for (const t of TRAITS) {
      expect(t.id).toBeTruthy();
      expect(t.name).toBeTruthy();
      expect(t.narrationHook).toBeTruthy();
    }
  });

  it('décerne « anakazo » à partir d\'un combo max ≥ 10', () => {
    const state = createInitialState(undefined, 3);
    state.maxCombo = 12;
    const awarded = evaluateTraitAwards(state).map((t) => t.id);
    expect(awarded).toContain('anakazo');
  });

  it('décerne « eprouve » via le contexte brokeThenRose', () => {
    const state = createInitialState(undefined, 3);
    const awarded = evaluateTraitAwards(state, { brokeThenRose: true }).map((t) => t.id);
    expect(awarded).toContain('eprouve');
  });

  it('ne re-décerne pas un trait déjà possédé', () => {
    const state = createInitialState(undefined, 3);
    state.maxCombo = 12;
    state.traits = [{ id: 'anakazo', earnedAtAge: 20 }];
    const awarded = evaluateTraitAwards(state).map((t) => t.id);
    expect(awarded).not.toContain('anakazo');
  });
});

/* ═══════════════════════════════
   L4 — Narrateur offline
   ═══════════════════════════════ */
describe('L4: Narrateur offline riche', () => {
  const stats: Record<StatName, number> = { foi: 50, paix: 50, physique: 50, finances: 50 };

  it('produit un texte non vide', () => {
    const out = generateOfflineJournal({ age: 25, stats }, mulberry32(1));
    expect(out.length).toBeGreaterThan(0);
  });

  it('est déterministe pour un même seed', () => {
    const a = generateOfflineJournal({ age: 25, stats, season: 'Désert' }, mulberry32(5));
    const b = generateOfflineJournal({ age: 25, stats, season: 'Désert' }, mulberry32(5));
    expect(a).toBe(b);
  });

  it('génère de la variété entre seeds différents', () => {
    const outs = new Set<string>();
    for (let s = 0; s < 40; s++) {
      outs.add(generateOfflineJournal({ age: 30, stats, season: 'Réveil' }, mulberry32(s)));
    }
    expect(outs.size).toBeGreaterThan(3);
  });

  it('met en avant le hook narratif d\'un trait fraîchement gagné (double poids)', () => {
    const hook = TRAITS.find((t) => t.id === 'incassable')!.narrationHook!;
    // Le hook est injecté en double poids : il doit ressortir nettement plus
    // qu'une simple ligne de musing (≈ 1/6 sans le double poids).
    let hits = 0;
    for (let s = 0; s < 60; s++) {
      const out = generateOfflineJournal(
        { age: 40, stats, newTraitIds: ['incassable'] }, mulberry32(s),
      );
      if (out.startsWith(hook)) hits++;
    }
    // ~2/6 attendus grâce au double poids → bien au-dessus de 1/6.
    expect(hits).toBeGreaterThan(60 / 6);
  });
});
