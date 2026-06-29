/**
 * codexMemory.ts — Mémoire du codex ENTRE les vies (module pur, testable).
 *
 * Le codex d'une run accumule `timesUsed` / `errorCount` / `unlocked` par verset. Sans persistance
 * cross-parties, il repart à zéro à chaque vie → les types de question à difficulté croissante
 * (`completion` à ≥3 vues, `reference` à ≥5) n'étaient quasi jamais atteints (cf. itér.81, décision
 * produit). Ce module fusionne le codex d'une vie dans une mémoire « à vie » accumulée, réalisant
 * l'ambition de répétition espacée du Design V2 (mémorisation sur N parties).
 *
 * `mergeCodex` est PUR, idempotent et ordre-indépendant (sémantique d'accumulation par `max` /
 * `OR`) : rejouer la même fusion ne change rien, et l'ordre des vies n'altère pas le résultat.
 */
import type { CodexEntry } from '../types/game';

/**
 * Fusionne `incoming` dans `base` en ACCUMULANT l'apprentissage par verset :
 *   - `unlocked`   → OR logique (un verset connu reste connu)
 *   - `timesUsed`  → max (les vues totales ne décroissent jamais)
 *   - `errorCount` → max (l'historique d'erreurs nourrit le SRS)
 *   - `unlockedAtAge` → premier âge de découverte connu (`??`)
 *   - `lastErrorAge`  → max (simple tiebreaker de tri SRS, intra-vie — non critique)
 *
 * Renvoie un NOUVEL objet (aucune mutation des entrées). `incoming` null/undefined → `base` tel quel.
 */
export function mergeCodex(
  base: Record<string, CodexEntry>,
  incoming: Record<string, CodexEntry> | null | undefined,
): Record<string, CodexEntry> {
  if (!incoming) return base;
  const out: Record<string, CodexEntry> = { ...base };
  for (const id of Object.keys(incoming)) {
    const inc = incoming[id];
    const cur = out[id];
    if (!cur) { out[id] = { ...inc }; continue; }
    const lastErrorAge = Math.max(cur.lastErrorAge ?? 0, inc.lastErrorAge ?? 0);
    out[id] = {
      verseId: id,
      unlocked: cur.unlocked || inc.unlocked,
      timesUsed: Math.max(cur.timesUsed, inc.timesUsed),
      errorCount: Math.max(cur.errorCount, inc.errorCount),
      unlockedAtAge: cur.unlockedAtAge ?? inc.unlockedAtAge,
      ...(lastErrorAge > 0 ? { lastErrorAge } : {}),
    };
  }
  return out;
}
