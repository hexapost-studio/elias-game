/**
 * tutorialSeen.ts — Persistance « tutorial déjà vu ».
 * Pattern identique à seenText.ts : module autonome, localStorage, pas de React.
 */
const KEY = 'elias-tutorial-done';

export function isTutorialDone(): boolean {
  try { return localStorage.getItem(KEY) === '1'; } catch { return false; }
}

export function markTutorialDone(): void {
  try { localStorage.setItem(KEY, '1'); } catch {}
}

export function resetTutorial(): void {
  try { localStorage.removeItem(KEY); } catch {}
}
