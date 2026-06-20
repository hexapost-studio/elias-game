/**
 * Métadonnées d'icônes (maps catégorie → composant / couleur).
 *
 * Séparé d'`IconSystem.tsx` pour respecter `react-refresh/only-export-components` :
 * un fichier qui exporte des composants ne doit pas aussi exporter des constantes.
 * Ici : uniquement des constantes (maps), donc compatible fast-refresh.
 *
 * T-28 : AFFLICTION_COLORS est également défini dans `src/engine/afflictionColors.ts`
 * (module pur sans JSX — consommé par messageSender.ts). Les deux doivent rester synchro.
 */
import type { FC } from 'react';
import { KenneyIcon } from './IconSystem';
import { EnemyFear, EnemyAddiction, EnemyPride, EnemyRejection, EnemyBattle, EnemyDoubt } from './EnemyAssets';

/**
 * Icônes de catégorie d'épreuve.
 * Utilise les sprites TravelBook pixel art quand disponibles,
 * sinon fallback Kenney SVG avec filtre couleur.
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
 * Couleurs HUD par catégorie d'épreuve (T-28 : source de vérité déplacée dans
 * `src/engine/afflictionColors.ts` — module pur sans JSX consommé par messageSender.ts).
 * Ici : ré-export via assignation pour conserver la rétrocompatibilité des imports.
 *
 * Convention de palette :
 *  - Catégories "vaincre" (lutte, défense)  → tons chauds / sombres
 *  - Catégories "manifester" (croissance)   → tons lumineux / froids
 *  - Toutes les couleurs doivent rester lisibles sur fond #0f0a1a
 *
 * Pour ajouter une catégorie : ajouter dans afflictionColors.ts ET dans AFFLICTION_ICONS ci-dessus.
 */
import { AFFLICTION_COLORS as _af } from '../engine/afflictionColors';
export const AFFLICTION_COLORS: Record<string, string> = _af;

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
