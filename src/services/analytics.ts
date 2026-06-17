/**
 * Analytics basique — stocké en localStorage.
 * Permet de savoir ce qui se passe dans le jeu sans serveur.
 */
const ANALYTICS_KEY = 'elias-analytics';

interface AnalyticsEvent {
  type: 'death' | 'event_answered' | 'verse_error' | 'run_complete';
  age: number;
  detail?: string;
  timestamp: number;
}

export function trackEvent(evt: AnalyticsEvent): void {
  try {
    const raw = localStorage.getItem(ANALYTICS_KEY);
    const events: AnalyticsEvent[] = raw ? JSON.parse(raw) : [];
    events.push(evt);
    // Garder max 200 événements
    if (events.length > 200) events.splice(0, events.length - 200);
    localStorage.setItem(ANALYTICS_KEY, JSON.stringify(events));
  } catch { /* silencieux */ }
}

export function getAnalytics(): AnalyticsEvent[] {
  try {
    const raw = localStorage.getItem(ANALYTICS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

export function clearAnalytics(): void {
  localStorage.removeItem(ANALYTICS_KEY);
}

// Analyse rapide — accessible depuis la console navigateur
export function analyzeDeaths(): string {
  const events = getAnalytics().filter(e => e.type === 'death');
  if (events.length === 0) return 'Aucune mort enregistrée.';
  const avgAge = Math.round(events.reduce((s, e) => s + e.age, 0) / events.length);
  const causes = events.reduce<Record<string, number>>((acc, e) => {
    if (e.detail) acc[e.detail] = (acc[e.detail] || 0) + 1;
    return acc;
  }, {});
  const topCause = Object.entries(causes).sort((a, b) => b[1] - a[1])[0];
  return `Âge moyen de mort: ${avgAge} · Cause principale: ${topCause ? topCause[0] : 'N/A'} · Total: ${events.length} morts`;
}

// Exposer dans la console pour debug
if (typeof window !== 'undefined') {
  import('./analytics').then(mod => { (window as Window & { __eliasAnalytics?: unknown }).__eliasAnalytics = mod; }).catch(() => {});
}
