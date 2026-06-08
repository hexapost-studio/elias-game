/**
 * Système d'icônes — Kenney SVGs + Lucide pour le reste.
 */
import type { FC } from 'react';
import { EnemyFear, EnemyAddiction, EnemyPride, EnemyRejection, EnemyBattle, EnemyDoubt } from './EnemyAssets';

/* ─── Kenney SVG Icons ─── */
export function KenneyIcon({ name, size = 16, style }: { name: string; size?: number; style?: React.CSSProperties }) {
  return (
    <img
      src={`/ui/${name}.svg`}
      alt=""
      style={{ width: size, height: size, display: 'inline-block', verticalAlign: 'middle', ...style }}
    />
  );
}

/* ─── Affliction icons → Kenney ─── */
export const AFFLICTION_ICONS: Record<string, FC<{ size?: number; strokeWidth?: number }>> = {
  peur_angoisse: () => <KenneyIcon name="icon_cross" size={18} style={{ filter: 'brightness(0.7)' }} />,
  impudicite_addiction: () => <KenneyIcon name="icon_cross" size={18} />,
  finances_paresse: () => <KenneyIcon name="icon_square" size={18} />,
  amertume_rejet: () => <KenneyIcon name="icon_circle" size={18} />,
  combat_spirituel: () => <KenneyIcon name="icon_cross" size={18} style={{ filter: 'invert(0.3)' }} />,
  identite_appel: () => <KenneyIcon name="icon_circle" size={18} style={{ filter: 'brightness(1.2)' }} />,
  doute_incredulite: () => <KenneyIcon name="icon_square" size={18} style={{ opacity: 0.5 }} />,
  orgueil_independance: () => <KenneyIcon name="icon_circle" size={18} style={{ filter: 'hue-rotate(30deg)' }} />,
};

export const AFFLICTION_COLORS: Record<string, string> = {
  peur_angoisse: '#8b5cf6',
  impudicite_addiction: '#ef4444',
  finances_paresse: '#f59e0b',
  amertume_rejet: '#6b7280',
  combat_spirituel: '#f97316',
  identite_appel: '#a78bfa',
  doute_incredulite: '#94a3b8',
  orgueil_independance: '#dc2626',
};

/* ─── Stats icons ─── */
export const STAT_ICONS: Record<string, FC<{ size?: number; strokeWidth?: number }>> = {
  foi: () => <KenneyIcon name="icon_cross" size={14} />,
  paix: () => <KenneyIcon name="icon_circle" size={14} />,
  physique: () => <KenneyIcon name="icon_square" size={14} />,
  finances: () => <KenneyIcon name="icon_square" size={14} style={{ filter: 'sepia(0.5)' }} />,
};

export const STAT_COLORS: Record<string, string> = {
  foi: 'var(--color-foi)',
  paix: 'var(--color-paix)',
  physique: 'var(--color-physique)',
  finances: 'var(--color-finances)',
};

/* ─── Enemy silhouettes ─── */
export const ENEMY_COMPONENTS: Record<string, FC<{ size?: number }>> = {
  peur_angoisse: EnemyFear,
  impudicite_addiction: EnemyAddiction,
  finances_paresse: EnemyPride,
  amertume_rejet: EnemyRejection,
  combat_spirituel: EnemyBattle,
  identite_appel: EnemyBattle,
  doute_incredulite: EnemyDoubt,
  orgueil_independance: EnemyPride,
};

/* ─── Lucide exports for compatibility ─── */
export {
  Heart, ShieldCheck, Sword, Coins, Flame, Brain, Cross, Lightbulb, Eye, Skull,
  Leaf, Anchor, Star, Sun, Cloud, Lock, Unlock, BookOpen, Zap, Award,
  ChevronRight, XIcon, Check, AlertTriangle, Clock, Sparkles, Feather,
  Crown, ScrollText, Music, Moon, SunDim, User, Users, Church, Bookmark,
  Compass, Target, Wind, Mountain, Scale, GripHorizontal,
} from 'lucide-react';
