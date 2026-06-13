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

/**
 * Icônes de catégorie d'épreuve.
 * Utilise les sprites TravelBook pixel art quand disponibles,
 * sinon fallback Kenney SVG avec filtre couleur.
 *
 * Convention :
 *  - Catégories "victoire" (vaincre X) → IconEnergy (éclair) ou IconStar
 *  - Catégories "croissance" (manifester Y) → IconHeart ou IconCoin
 */
export const AFFLICTION_ICONS: Record<string, FC<{ size?: number; strokeWidth?: number }>> = {
  // ── Catégories originales ──────────────────────────────────────────────────
  peur_angoisse:        () => <img src="/ui/travelbook/UI_TravelBook_IconEnergy01d.png" alt="" style={{ width: 18, imageRendering: 'pixelated', filter: 'hue-rotate(260deg) saturate(3) brightness(1.8)' }} />,
  impudicite_addiction: () => <img src="/ui/travelbook/UI_TravelBook_IconEnergy01g.png" alt="" style={{ width: 18, imageRendering: 'pixelated', filter: 'hue-rotate(340deg) saturate(4) brightness(1.6)' }} />,
  finances_paresse:     () => <img src="/ui/travelbook/UI_TravelBook_IconCoin01a.png"   alt="" style={{ width: 18, imageRendering: 'pixelated', filter: 'brightness(1.4) saturate(1.6)' }} />,
  amertume_rejet:       () => <img src="/ui/travelbook/UI_TravelBook_IconHeart01i.png"  alt="" style={{ width: 18, imageRendering: 'pixelated', filter: 'grayscale(1) brightness(1.4)' }} />,
  combat_spirituel:     () => <img src="/ui/travelbook/UI_TravelBook_IconEnergy01a.png" alt="" style={{ width: 18, imageRendering: 'pixelated', filter: 'hue-rotate(30deg) saturate(3) brightness(1.8)' }} />,
  identite_appel:       () => <img src="/ui/travelbook/UI_TravelBook_IconStar01a.png"   alt="" style={{ width: 18, imageRendering: 'pixelated', filter: 'hue-rotate(260deg) saturate(3) brightness(2.2)' }} />,
  doute_incredulite:    () => <img src="/ui/travelbook/UI_TravelBook_IconStar01c.png"   alt="" style={{ width: 18, imageRendering: 'pixelated', filter: 'saturate(0.3) brightness(1.6)' }} />,
  orgueil_independance: () => <img src="/ui/travelbook/UI_TravelBook_IconStar01e.png"   alt="" style={{ width: 18, imageRendering: 'pixelated', filter: 'hue-rotate(340deg) saturate(4) brightness(1.5)' }} />,
  // ── Catégories croissance — intimité et doctrine ───────────────────────────
  saint_esprit:         () => <img src="/ui/travelbook/UI_TravelBook_IconEnergy01d.png" alt="" style={{ width: 18, imageRendering: 'pixelated', filter: 'hue-rotate(185deg) saturate(4) brightness(2.2)' }} />,
  parole_de_dieu:       () => <img src="/ui/travelbook/UI_TravelBook_IconStar01a.png"   alt="" style={{ width: 18, imageRendering: 'pixelated', filter: 'hue-rotate(40deg) saturate(3) brightness(2.4)' }} />,
  amour_de_dieu:        () => <img src="/ui/travelbook/UI_TravelBook_IconHeart01e.png"  alt="" style={{ width: 18, imageRendering: 'pixelated', filter: 'hue-rotate(340deg) saturate(3) brightness(1.8)' }} />,
  direction_divine:     () => <img src="/ui/travelbook/UI_TravelBook_IconStar01c.png"   alt="" style={{ width: 18, imageRendering: 'pixelated', filter: 'hue-rotate(140deg) saturate(4) brightness(2.0)' }} />,
  priere:               () => <img src="/ui/travelbook/UI_TravelBook_IconHeart01a.png"  alt="" style={{ width: 18, imageRendering: 'pixelated', filter: 'hue-rotate(260deg) saturate(3) brightness(2.0)' }} />,
  soif_de_dieu:         () => <img src="/ui/travelbook/UI_TravelBook_IconHeart01e.png"  alt="" style={{ width: 18, imageRendering: 'pixelated', filter: 'hue-rotate(190deg) saturate(4) brightness(2.2)' }} />,
  obeissance:           () => <img src="/ui/travelbook/UI_TravelBook_IconStar01e.png"   alt="" style={{ width: 18, imageRendering: 'pixelated', filter: 'hue-rotate(120deg) saturate(3) brightness(2.0)' }} />,
  // ── Catégories victoire — afflictions à surmonter ──────────────────────────
  culpabilite:          () => <img src="/ui/travelbook/UI_TravelBook_IconHeart01i.png"  alt="" style={{ width: 18, imageRendering: 'pixelated', filter: 'saturate(0.5) brightness(1.6)' }} />,
  sterilite:            () => <img src="/ui/travelbook/UI_TravelBook_IconHeart01a.png"  alt="" style={{ width: 18, imageRendering: 'pixelated', filter: 'hue-rotate(290deg) saturate(2) brightness(2.2)' }} />,
  abondance_financiere: () => <img src="/ui/travelbook/UI_TravelBook_IconCoin01a.png"   alt="" style={{ width: 18, imageRendering: 'pixelated', filter: 'hue-rotate(30deg) saturate(2) brightness(1.8)' }} />,
  maladie_guerison:     () => <img src="/ui/travelbook/UI_TravelBook_IconHeart01e.png"  alt="" style={{ width: 18, imageRendering: 'pixelated', filter: 'hue-rotate(120deg) saturate(4) brightness(2.2)' }} />,
  echec_reussite:       () => <img src="/ui/travelbook/UI_TravelBook_IconStar01a.png"   alt="" style={{ width: 18, imageRendering: 'pixelated', filter: 'hue-rotate(25deg) saturate(3) brightness(2.0)' }} />,
  tristesse_joie:       () => <img src="/ui/travelbook/UI_TravelBook_IconHeart01a.png"  alt="" style={{ width: 18, imageRendering: 'pixelated', filter: 'hue-rotate(320deg) saturate(4) brightness(2.0)' }} />,
  decouragement:        () => <img src="/ui/travelbook/UI_TravelBook_IconEnergy01g.png" alt="" style={{ width: 18, imageRendering: 'pixelated', filter: 'hue-rotate(210deg) saturate(3) brightness(2.0)' }} />,
  lourdeur_fatigue:     () => <img src="/ui/travelbook/UI_TravelBook_IconEnergy01a.png" alt="" style={{ width: 18, imageRendering: 'pixelated', filter: 'hue-rotate(80deg) saturate(3) brightness(2.0)' }} />,
};

/**
 * Couleurs HUD par catégorie d'épreuve.
 *
 * Convention de palette :
 *  - Catégories "vaincre" (lutte, défense)  → tons chauds / sombres
 *  - Catégories "manifester" (croissance)   → tons lumineux / froids
 *  - Toutes les couleurs doivent rester lisibles sur fond #0f0a1a
 *
 * Pour ajouter une catégorie : ajouter ici + dans AFFLICTION_ICONS ci-dessus.
 */
export const AFFLICTION_COLORS: Record<string, string> = {
  // ── Catégories originales ──────────────────────────────────────────────────
  peur_angoisse:        '#8b5cf6', // Violet — peur spirituelle
  impudicite_addiction: '#ef4444', // Rouge vif — brûlure charnelle
  finances_paresse:     '#f59e0b', // Ambre — or/argent, urgence
  amertume_rejet:       '#6b7280', // Gris — froideur, fermeture
  combat_spirituel:     '#f97316', // Orange — feu, bataille
  identite_appel:       '#a78bfa', // Violet clair — lumière intérieure
  doute_incredulite:    '#94a3b8', // Bleu-gris — brouillard, incertitude
  orgueil_independance: '#dc2626', // Rouge foncé — danger, arrogance
  // ── Nouvelles catégories — croissance ─────────────────────────────────────
  saint_esprit:         '#38bdf8', // Bleu ciel — souffle, eau vive
  parole_de_dieu:       '#fde68a', // Jaune pâle — lampe aux pieds
  amour_de_dieu:        '#fb7185', // Rose — agapé, chaleur
  direction_divine:     '#34d399', // Vert menthe — chemin tracé
  priere:               '#c4b5fd', // Lavande — intimité, encens
  soif_de_dieu:         '#7dd3fc', // Bleu clair — eau, désir
  obeissance:           '#86efac', // Vert doux — paix de l'obéissance
  culpabilite:          '#a8a29e', // Gris chaud — lourdeur levée
  sterilite:            '#e9d5ff', // Mauve pâle — attente, espoir
  abondance_financiere: '#fbbf24', // Or — bénédiction financière
  maladie_guerison:     '#4ade80', // Vert vif — guérison, vie
  echec_reussite:       '#fb923c', // Orange — résurrection après chute
  tristesse_joie:       '#f472b6', // Rose vif — larmes → danse
  decouragement:        '#60a5fa', // Bleu — profondeur, remontée
  lourdeur_fatigue:     '#a3e635', // Vert-lime — vigueur retrouvée
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
  Compass, Target, Wind, Mountain, Scale, GripHorizontal, RefreshCw,
  Volume2, Handshake, Phone, Landmark, Hammer, Home, Building2,
  RotateCw,
} from 'lucide-react';
