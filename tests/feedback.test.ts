import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

/* ─── Mocks (isolent feedback.ts du DOM / IndexedDB) ─── */

// File locale en mémoire (remplace localforage)
const { mem } = vi.hoisted(() => ({ mem: new Map<string, unknown>() }));

vi.mock('localforage', () => ({
  default: {
    getItem: async (k: string) => (mem.has(k) ? mem.get(k) : null),
    setItem: async (k: string, v: unknown) => { mem.set(k, v); return v; },
    removeItem: async (k: string) => { mem.delete(k); },
    config: () => {},
  },
}));

vi.mock('../src/stores/gameStore', () => ({
  useGameStore: {
    getState: () => ({
      age: 30,
      stats: { foi: 60, paix: 55, physique: 70, finances: 40 },
      difficulty: 2,
      flow: { value: 42.7, palier: 2 },
      combo: 3,
      maxCombo: 8,
      totalEvents: 25,
      successRate: 72,
      spiritualSeason: 'Désert',
      crisesRemaining: 2,
      phase: 'idle',
      currentTitle: null,
      currentEvent: null,
      lastEventResult: 'success',
      journal: [
        { age: 28, type: 'success', text: 'Victoire sur la peur' },
        { age: 29, type: 'fail', text: 'Échec sur le doute' },
      ],
      recentEventIds: ['event-peur-001', 'event-doute-002'],
      completedArcs: [{ arcId: 'arc-guerison', completedAtAge: 27 }],
    }),
  },
}));

vi.mock('../src/data/persistence', () => ({
  getAnalyticsSummary: async () => ({
    totalEvents: 25, successRate: 72, avgTimeToAnswer: 4.2,
    runsCompleted: 3, topCategories: [], seasonFailRates: [],
  }),
}));

vi.mock('../src/services/aiNarrator', () => ({
  getActiveBackendType: () => null,
}));

import {
  collectDiagnostics,
  buildPayload,
  submitFeedback,
  getLocalQueue,
  getMailtoFallback,
} from '../src/services/feedback';

beforeEach(() => {
  mem.clear();
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

/* ═══════════════════════════════
   D1 — collectDiagnostics
   ═══════════════════════════════ */
describe('D1: collectDiagnostics', () => {
  it('produit un objet sérialisable avec les champs attendus', async () => {
    const d = await collectDiagnostics();
    expect(d.game?.age).toBe(30);
    expect(d.game?.flow.value).toBe(43); // arrondi
    expect(d.game?.spiritualSeason).toBe('Désert');
    expect(d.history?.journalTail).toHaveLength(2);
    expect(d.history?.completedArcs).toBe(1);
    expect(d.tech.appVersion).toBeTruthy();
    expect(() => JSON.stringify(d)).not.toThrow();
  });

  it('ne contient aucune clé / secret', async () => {
    const json = JSON.stringify(await collectDiagnostics());
    expect(json).not.toMatch(/apikey|anon[_-]?key|authorization|bearer\s/i);
  });
});

/* ═══════════════════════════════
   D2 — submitFeedback : fallback local
   ═══════════════════════════════ */
describe('D2: submitFeedback sans Supabase', () => {
  it('retombe en local et met le retour en file', async () => {
    const payload = await buildPayload('bug', '  un bug ici  ', '', true);
    const res = await submitFeedback(payload);
    expect(res.via).toBe('local');
    const queue = await getLocalQueue();
    expect(queue).toHaveLength(1);
    expect(queue[0].message).toBe('un bug ici'); // trim
    expect(queue[0].kind).toBe('bug');
  });
});

/* ═══════════════════════════════
   D3 — submitFeedback : Supabase OK
   ═══════════════════════════════ */
describe('D3: submitFeedback avec Supabase', () => {
  it('envoie un POST conforme au schéma et renvoie via=supabase', async () => {
    vi.stubEnv('VITE_SUPABASE_URL', 'https://demo.supabase.co');
    vi.stubEnv('VITE_SUPABASE_ANON_KEY', 'anon-key-123');
    const fetchMock = vi.fn(async () => ({ ok: true }) as Response);
    vi.stubGlobal('fetch', fetchMock);

    const payload = await buildPayload('idea', 'une super idée', 'moi@exemple.com', true);
    const res = await submitFeedback(payload);

    expect(res.via).toBe('supabase');
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, opts] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe('https://demo.supabase.co/rest/v1/feedback');
    expect((opts.headers as Record<string, string>).apikey).toBe('anon-key-123');
    const body = JSON.parse(opts.body as string);
    expect(body.kind).toBe('idea');
    expect(body.message).toBe('une super idée');
    expect(body.contact).toBe('moi@exemple.com');
    expect(body.diagnostics).toBeTruthy();
    // rien n'est mis en file locale quand l'envoi distant réussit
    expect(await getLocalQueue()).toHaveLength(0);
  });

  it('retombe en local si le réseau échoue', async () => {
    vi.stubEnv('VITE_SUPABASE_URL', 'https://demo.supabase.co');
    vi.stubEnv('VITE_SUPABASE_ANON_KEY', 'anon-key-123');
    vi.stubGlobal('fetch', vi.fn(async () => { throw new Error('network down'); }));

    const payload = await buildPayload('praise', 'bravo', '', false);
    const res = await submitFeedback(payload);

    expect(res.via).toBe('local');
    expect(await getLocalQueue()).toHaveLength(1);
  });

  it('retombe en local si Supabase répond non-ok', async () => {
    vi.stubEnv('VITE_SUPABASE_URL', 'https://demo.supabase.co');
    vi.stubEnv('VITE_SUPABASE_ANON_KEY', 'anon-key-123');
    vi.stubGlobal('fetch', vi.fn(async () => ({ ok: false }) as Response));

    const payload = await buildPayload('bug', 'erreur 401', '', false);
    const res = await submitFeedback(payload);

    expect(res.via).toBe('local');
    expect(await getLocalQueue()).toHaveLength(1);
  });
});

/* ═══════════════════════════════
   D4 — getMailtoFallback
   ═══════════════════════════════ */
describe('D4: getMailtoFallback', () => {
  it('produit un lien mailto encodé valide', async () => {
    const payload = await buildPayload('bug', 'hello & world', '', false);
    const m = getMailtoFallback(payload);
    expect(m.startsWith('mailto:')).toBe(true);
    expect(m).toContain('subject=');
    expect(m).toContain('body=');
    // le '&' du message doit être encodé, pas interprété comme séparateur de params
    expect(m).toContain('hello%20%26%20world');
  });
});
