import { describe, it, expect } from 'vitest';
import { color, space, radius, fontSize, weight, rgb, alpha } from '../src/styles/tokens';

describe('design tokens (G-3) — contrat de valeurs', () => {
  it('les couleurs pointent vers les variables CSS de :root (rendu identique, thème en 1 endroit)', () => {
    for (const v of Object.values(color)) expect(v).toMatch(/^var\(--[a-z0-9-]+\)$/);
    expect(color.textMuted).toBe('var(--text-muted)');
    expect(color.accentViolet).toBe('var(--accent-violet)');
  });

  it('alpha() compose un rgba byte-identique aux littéraux migrés', () => {
    expect(alpha(rgb.amiWeak, 0.5)).toBe('rgba(239,68,68,0.5)');
    expect(alpha(rgb.amiStrong, 0.1)).toBe('rgba(52,211,153,0.1)');
    expect(alpha(rgb.locked, 0.3)).toBe('rgba(100,100,100,0.3)');
    expect(alpha(rgb.violet, 0.12)).toBe('rgba(139,92,246,0.12)');
    expect(alpha(rgb.white, 0.04)).toBe('rgba(255,255,255,0.04)');
  });

  it('les échelles sont des nombres (px) cohérents avec le barème inline', () => {
    expect(space.sm).toBe(6);
    expect(space.md).toBe(10);
    expect(radius.md).toBe(8);
    expect(fontSize.base).toBe(14);
    expect(weight.bold).toBe(700);
  });
});
