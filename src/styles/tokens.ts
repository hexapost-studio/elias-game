/**
 * Design tokens — source unique des valeurs de style réutilisées (G-3, itér.90).
 *
 * Pourquoi : ~419 `style={{…}}` inline pour 27 variables CSS = pas de design system (valeurs en dur
 * dispersées, thème non changeable d'un seul endroit). Ces tokens donnent une abstraction TYPÉE et
 * découvrable, migrée composant par composant.
 *
 * Principe de sûreté (migration à rendu STRICTEMENT inchangé) :
 *  - `color.*` / `font.*` pointent vers les variables CSS de `:root` (src/index.css) → la source de
 *    vérité du thème reste le `:root` (1 endroit), et `tokens.color.x` résout à l'IDENTIQUE.
 *  - `space` / `radius` / `fontSize` / `weight` / `tracking` reprennent les valeurs littérales déjà
 *    présentes dans les styles inline → substitution byte-identique, jamais une nouvelle valeur.
 *  - `alpha(rgb, a)` compose les rgba sémantiques (états ami, etc.) à partir d'un triplet réutilisable.
 */

export const color = {
  bgMain: 'var(--bg-main)',
  bgSurface: 'var(--bg-surface)',
  bgCard: 'var(--bg-card)',
  bgElevated: 'var(--bg-elevated)',
  textPrimary: 'var(--text-primary)',
  textSecondary: 'var(--text-secondary)',
  textMuted: 'var(--text-muted)',
  accentViolet: 'var(--accent-violet)',
  accentVioletLight: 'var(--accent-violet-light)',
  accentGold: 'var(--accent-gold)',
  accentGoldLight: 'var(--accent-gold-light)',
  foi: 'var(--color-foi)',
  paix: 'var(--color-paix)',
  physique: 'var(--color-physique)',
  finances: 'var(--color-finances)',
  flow1: 'var(--flow-palier1)',
  flow2: 'var(--flow-palier2)',
  flow3: 'var(--flow-palier3)',
  success: 'var(--success)',
  danger: 'var(--danger)',
  warning: 'var(--warning)',
  borderSubtle: 'var(--border-subtle)',
  borderGlow: 'var(--border-glow)',
} as const;

export const font = {
  display: 'var(--font-display)',
  body: 'var(--font-body)',
} as const;

/** Échelle d'espacement (px) — valeurs réellement présentes dans les styles inline. */
export const space = {
  xxs: 2,
  xs: 4,
  sm: 6,
  md: 10,
  lg: 12,
  xl: 16,
  xxl: 24,
} as const;

export const radius = {
  sm: 6,
  md: 8,
  lg: 12,
  pill: 999,
} as const;

/** Tailles de police (px) du barème inline existant. */
export const fontSize = {
  xxs: 8,
  xs: 9,
  sm: 10,
  md: 12,
  base: 14,
  lg: 16,
} as const;

export const weight = {
  regular: 400,
  medium: 600,
  bold: 700,
} as const;

export const tracking = {
  tight: '0.04em',
  wide: '0.08em',
} as const;

/** Triplets RGB réutilisables (sémantiques) — composés via `alpha()` aux opacités voulues. */
export const rgb = {
  amiWeak: '239,68,68',
  amiStrong: '52,211,153',
  locked: '100,100,100',
  violet: '139,92,246',
  white: '255,255,255',
} as const;

/** Compose un rgba à partir d'un triplet RGB + alpha. `alpha(rgb.amiWeak, 0.5)` → `rgba(239,68,68,0.5)`. */
export const alpha = (triple: string, a: number): string => `rgba(${triple},${a})`;

export const tokens = { color, font, space, radius, fontSize, weight, tracking, rgb, alpha } as const;
export default tokens;
