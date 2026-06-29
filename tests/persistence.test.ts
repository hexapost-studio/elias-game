import { describe, it, expect, beforeEach, vi } from 'vitest';

/**
 * Garde de SAVE-COMPAT (itér.81). La whitelist de `saveGame` doit persister l'IDENTITÉ de la run.
 * Sans `playerName` / `calling` / `seed` / `traits`, `hydrateFromSave` les reprenait de
 * `createInitialState()` au rechargement → nom réinitialisé, vocation re-tirée au hasard
 * (incohérente avec les arcs complétés), graine partageable changée, traits/échos perdus.
 * Ce test rejoue le round-trip réel save → load et échoue si un de ces champs est à nouveau lâché.
 */

// localforage en mémoire (même patron que feedback.test.ts)
const { mem } = vi.hoisted(() => ({ mem: new Map<string, unknown>() }));
vi.mock('localforage', () => ({
  default: {
    getItem: async (k: string) => (mem.has(k) ? mem.get(k) : null),
    setItem: async (k: string, v: unknown) => { mem.set(k, v); return v; },
    removeItem: async (k: string) => { mem.delete(k); },
    config: () => {},
  },
}));

import { saveGame, loadGame, getLifetimeCodex, mergeAndSaveLifetimeCodex, initLifetimeCodex } from '../src/data/persistence';
import { createInitialState } from '../src/engine/gameEngine';
import type { GameState, CodexEntry } from '../src/types/game';

describe('persistence — round-trip de l\'identité de run (itér.81)', () => {
  beforeEach(() => mem.clear());

  function craftedState(): GameState {
    const s = createInitialState(undefined, 424242, 'Mathéo');
    // Forcer une identité distincte de celle qu'un createInitialState() frais produirait.
    s.calling = { id: 'berger', name: 'Le Berger', tagline: 't', description: 'd', icon: '✦', color: '#fff', weight: 1 };
    s.traits = [{ id: 'fidele', label: 'Fidèle', description: 'd', earnedAtAge: 20, icon: '✦' } as GameState['traits'][number]];
    s.age = 40;
    return s;
  }

  it('save → load préserve playerName / calling / seed / traits', async () => {
    const s = craftedState();
    await saveGame(s);
    const loaded = await loadGame();

    expect(loaded).not.toBeNull();
    expect(loaded!.playerName).toBe('Mathéo');
    expect(loaded!.seed).toBe(424242);
    expect(loaded!.calling?.id).toBe('berger');
    expect(loaded!.traits?.[0]?.id).toBe('fidele');
  });

  it('hydratation simulée ({...createInitialState(), ...saved}) NE réécrase PAS l\'identité', async () => {
    const s = craftedState();
    await saveGame(s);
    const saved = await loadGame();

    // Reproduit hydrateFromSave : un état frais (seed/nom/vocation DIFFÉRENTS) recouvert par la save.
    const fresh = createInitialState(undefined, 999, 'AutreNom');
    const hydrated = { ...fresh, ...saved } as GameState;

    expect(hydrated.playerName).toBe('Mathéo');   // pas 'AutreNom'
    expect(hydrated.seed).toBe(424242);            // pas 999
    expect(hydrated.calling?.id).toBe('berger');   // pas la vocation re-tirée
    expect(hydrated.traits).toHaveLength(1);       // pas vidé
  });
});

describe('persistence — garde systémique anti-régression (G-5, prévention > réaction)', () => {
  beforeEach(() => mem.clear());

  // Champs d'état VOLONTAIREMENT non persistés (éphémères / dérivés / re-init au chargement).
  // Y ajouter un champ est un CHOIX documenté ; sinon la garde force à le whitelister dans saveGame.
  // → Le bug save-compat de l'itér.81 (nom/vocation/graine/traits lâchés) aurait été IMPOSSIBLE.
  // Vide aujourd'hui : la whitelist de saveGame couvre 100 % des champs de createInitialState
  // (vérifié par cette garde). Tout futur champ devra être whitelisté OU ajouté ici avec sa raison.
  const INTENTIONALLY_NOT_PERSISTED = new Set<string>([]);

  it('tout champ de createInitialState est soit persisté, soit explicitement exclu', async () => {
    const s = createInitialState(undefined, 7, 'Garde');
    await saveGame(s);
    const saved = mem.get('elias-save-v1') as Record<string, unknown>;
    const persisted = new Set(Object.keys(saved));
    const unclassified = Object.keys(s).filter(
      (k) => !persisted.has(k) && !INTENTIONALLY_NOT_PERSISTED.has(k),
    );
    expect(
      unclassified,
      `Champs d'état NI persistés NI exclus — whiteliste-les dans saveGame() ou ajoute-les à `
      + `INTENTIONALLY_NOT_PERSISTED avec justification : [${unclassified.join(', ')}]`,
    ).toEqual([]);
  });
});

describe('persistence — codex « à vie » cross-parties (itér.84)', () => {
  function codex(over: Record<string, Partial<CodexEntry>>): Record<string, CodexEntry> {
    const out: Record<string, CodexEntry> = {};
    for (const id of Object.keys(over)) out[id] = { verseId: id, unlocked: false, timesUsed: 0, errorCount: 0, ...over[id] };
    return out;
  }

  it('mergeAndSaveLifetimeCodex ACCUMULE entre deux vies (le cache reflète le max)', async () => {
    await mergeAndSaveLifetimeCodex(codex({ v1: { unlocked: true, timesUsed: 2, errorCount: 1 } }));
    await mergeAndSaveLifetimeCodex(codex({ v1: { timesUsed: 5 }, v2: { unlocked: true, timesUsed: 1 } }));
    const life = getLifetimeCodex();
    expect(life.v1.timesUsed).toBe(5);   // max(2,5)
    expect(life.v1.errorCount).toBe(1);  // conservé
    expect(life.v1.unlocked).toBe(true); // OR
    expect(life.v2.timesUsed).toBe(1);   // nouveau verset
  });

  it('initLifetimeCodex recharge la mémoire persistée (round-trip storage→cache)', async () => {
    await mergeAndSaveLifetimeCodex(codex({ v9: { unlocked: true, timesUsed: 4 } }));
    await initLifetimeCodex(); // relit depuis localforage mocké
    expect(getLifetimeCodex().v9?.timesUsed).toBe(4);
  });

  it('saveGame alimente la mémoire à vie (capture continue de l\'apprentissage)', async () => {
    const s = createInitialState(undefined, 1, 'Léa');
    s.codex = { ...s.codex, ...codex({ vsave: { unlocked: true, timesUsed: 3, errorCount: 1 } }) };
    await saveGame(s);
    // saveGame déclenche un merge fire-and-forget ; on laisse la microtask se résoudre.
    await Promise.resolve();
    expect(getLifetimeCodex().vsave?.timesUsed).toBeGreaterThanOrEqual(3);
  });
});
