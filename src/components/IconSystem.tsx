/**
 * Système d'icônes — Kenney SVGs + Lucide pour le reste.
 *
 * Les maps catégorie → composant / couleur (AFFLICTION_ICONS, AFFLICTION_COLORS,
 * STAT_ICONS, STAT_COLORS, ENEMY_COMPONENTS) vivent dans `./iconMeta` pour que ce
 * fichier n'exporte que des composants (compat fast-refresh).
 */

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

/* ─── Lucide exports for compatibility ─── */
export {
  Heart, ShieldCheck, Sword, Coins, Flame, Brain, Cross, Lightbulb, Eye, Skull,
  Leaf, Anchor, Star, Sun, Cloud, Lock, Unlock, BookOpen, Zap, Award,
  ChevronRight, XIcon, Check, AlertTriangle, Clock, Sparkles, Feather,
  Crown, ScrollText, Music, Moon, SunDim, User, Users, Church, Bookmark,
  Compass, Target, Wind, Mountain, Scale, GripHorizontal, RefreshCw,
  Volume2, Handshake, Phone, Landmark, Hammer, Home, Building2,
  RotateCw, MessageSquare, Bug, Send, Copy, Mail, ChevronDown, Loader,
} from 'lucide-react';
