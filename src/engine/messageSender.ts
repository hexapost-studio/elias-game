/**
 * @file messageSender.ts
 * @module engine/messageSender
 * @description Module pur (zéro React, zéro state) — dérive l'identité de l'émetteur
 *   d'un event ou d'une entrée de journal dans le cadre du « fil polyphonique » (Phase 3).
 *
 *   4 émetteurs :
 *   - heaven    : category `foi` / `saint_esprit` / `parole_de_dieu` / etc., ou arc `calling`
 *   - adversary : category `affliction` (peur, combat, orgueil, doute, etc.)
 *   - entourage : storyArcId ami / parents / église / métier / ville / conjoint
 *   - conscience: tout le reste
 *
 *   Principe ASSET-READY (non négociable) : `assetId` est TOUJOURS rempli (string derivée
 *   de sender + iconKey) — pointe aujourd'hui vers un placeholder, sera remplacé par de
 *   l'art sans refactor via `illustrationRegistry.ts` (T-31).
 *
 *   @see docs/ROADMAP.md T-20
 *   @since itér. 37
 */

import type { AfflictionCategory } from '../types/game';
import type { AfflictionEvent, JournalEntry } from '../types/game';
// T-28 : couleurs propres par affliction — module pur (zéro React) extrait pour éviter
// une dépendance de ce module engine sur JSX (principe invariant 2 : modulaire).
import { AFFLICTION_COLORS } from './afflictionColors';

/* ─── Types exportés ──────────────────────────────────────────────────────── */

export type SenderKind = 'heaven' | 'adversary' | 'entourage' | 'conscience';

export interface MessageSender {
  /** Identifiant structurel de l'émetteur (4 valeurs). */
  sender: SenderKind;
  /** Nom lisible affiché dans la bulle. */
  displayName: string;
  /** Couleur hex associée à cet émetteur (pour tinter l'avatar / la bulle). */
  color: string;
  /**
   * Clé d'icône lisible machine pour l'avatar (ex. `heaven_esprit`, `adversary_peur_angoisse`).
   * Stable même si displayName change selon l'arc — permet de cibler l'asset.
   */
  iconKey: string;
  /**
   * Identifiant d'asset pour l'illustration (avatar, icône émetteur).
   * Dérivé de sender + iconKey ; résout aujourd'hui en placeholder CSS/SVG,
   * pointera plus tard vers un fichier d'art réel (T-31 illustrationRegistry).
   * TOUJOURS rempli — jamais undefined.
   */
  assetId: string;
}

/* ─── Catégories « ciel » (croissance + foi) ──────────────────────────────── */

const HEAVEN_CATEGORIES = new Set<AfflictionCategory>([
  'saint_esprit',
  'parole_de_dieu',
  'amour_de_dieu',
  'direction_divine',
  'priere',
  'soif_de_dieu',
  'obeissance',
  'identite_appel',
  'abondance_financiere',
]);

/* ─── Catégories « adversaire » (afflictions) ─────────────────────────────── */

const ADVERSARY_CATEGORIES = new Set<AfflictionCategory>([
  'peur_angoisse',
  'impudicite_addiction',
  'finances_paresse',
  'amertume_rejet',
  'combat_spirituel',
  'doute_incredulite',
  'orgueil_independance',
  'culpabilite',
  'sterilite',
  'maladie_guerison',
  'echec_reussite',
  'tristesse_joie',
  'decouragement',
  'lourdeur_fatigue',
]);

/* ─── Arcs d'entourage (ami / famille / église / métier / lieu / conjoint) ── */

const ENTOURAGE_ARC_IDS = new Set<string>([
  'arc-ami',
  'arc-parents',
  'arc-eglise',
  'arc-metier',
  'arc-ville',
  'arc-conjoint',
  'arc-mathias',
  'arc-heritage',
  'arc-louise',
]);

/* ─── Noms d'adversaire par catégorie ─────────────────────────────────────── */

const ADVERSARY_NAMES: Partial<Record<AfflictionCategory, string>> = {
  peur_angoisse:        'La Peur',
  impudicite_addiction: 'La Convoitise',
  finances_paresse:     'La Paresse',
  amertume_rejet:       "L'Amertume",
  combat_spirituel:     "L'Adversaire",
  doute_incredulite:    'Le Doute',
  orgueil_independance: "L'Orgueil",
  culpabilite:          'La Condamnation',
  sterilite:            "L'Attente vide",
  maladie_guerison:     'La Souffrance',
  echec_reussite:       "L'Échec",
  tristesse_joie:       'La Tristesse',
  decouragement:        'Le Découragement',
  lourdeur_fatigue:     'La Fatigue',
};

/* ─── Noms d'entourage par arc ─────────────────────────────────────────────── */

const ENTOURAGE_ARC_NAMES: Record<string, string> = {
  'arc-ami':      'Ton ami',
  'arc-parents':  'Tes parents',
  'arc-eglise':   "L'église",
  'arc-metier':   'Ton milieu professionnel',
  'arc-ville':    'Ta ville',
  'arc-conjoint': 'Ton conjoint(e)',
  'arc-mathias':  'Mathias',
  'arc-heritage': 'Ton héritage',
  'arc-louise':   'Louise',
};

/* ─── Couleurs par émetteur ────────────────────────────────────────────────── */

const SENDER_COLORS: Record<SenderKind, string> = {
  heaven:     '#fbbf24', // Or — lumière divine
  adversary:  '#ef4444', // Rouge — danger / opposition
  entourage:  '#34d399', // Vert menthe — chaleur humaine
  conscience: '#c084fc', // Violet doux — intériorité
};

/* ─── Helpers internes ─────────────────────────────────────────────────────── */

/**
 * Construit un `assetId` stable depuis l'émetteur et la clé d'icône.
 * Format : `elias__<sender>__<iconKey>` — stable, lisible, slugifiable.
 */
function buildAssetId(sender: SenderKind, iconKey: string): string {
  return `elias__${sender}__${iconKey}`;
}

function buildHeavenSender(iconKey: string): MessageSender {
  return {
    sender:      'heaven',
    displayName: "L'Esprit",
    color:       SENDER_COLORS.heaven,
    iconKey,
    assetId:     buildAssetId('heaven', iconKey),
  };
}

function buildAdversarySender(category: AfflictionCategory): MessageSender {
  const iconKey = `adversary_${category}`;
  // T-28 : couleur propre à chaque affliction (depuis AFFLICTION_COLORS),
  // sinon couleur générique adversaire comme fallback.
  const color = AFFLICTION_COLORS[category] ?? SENDER_COLORS.adversary;
  return {
    sender:      'adversary',
    displayName: ADVERSARY_NAMES[category] ?? "L'Adversaire",
    color,
    iconKey,
    assetId:     buildAssetId('adversary', iconKey),
  };
}

function buildEntourageSender(arcId: string): MessageSender {
  const iconKey = `entourage_${arcId}`;
  return {
    sender:      'entourage',
    displayName: ENTOURAGE_ARC_NAMES[arcId] ?? 'Ton entourage',
    color:       SENDER_COLORS.entourage,
    iconKey,
    assetId:     buildAssetId('entourage', iconKey),
  };
}

function buildConscienceSender(): MessageSender {
  return {
    sender:      'conscience',
    displayName: 'Ta conscience',
    color:       SENDER_COLORS.conscience,
    iconKey:     'conscience_inner',
    assetId:     buildAssetId('conscience', 'conscience_inner'),
  };
}

/* ─── API publique ─────────────────────────────────────────────────────────── */

/**
 * Dérive l'émetteur d'un `AfflictionEvent`.
 *
 * Règle de priorité :
 * 1. Arc entourage → `entourage` (le contexte relationnel prime)
 * 2. Catégorie « ciel » → `heaven`
 * 3. Catégorie « affliction » → `adversary`
 * 4. Sinon → `conscience`
 */
export function deriveMessageSender(event: AfflictionEvent): MessageSender {
  const { category, storyArcId } = event;

  // 1. Arc d'entourage — le contexte relationnel prime sur la catégorie
  if (storyArcId && ENTOURAGE_ARC_IDS.has(storyArcId)) {
    return buildEntourageSender(storyArcId);
  }

  // 2. Catégorie ciel (croissance / foi)
  if (HEAVEN_CATEGORIES.has(category)) {
    return buildHeavenSender(`heaven_${category}`);
  }

  // 3. Catégorie affliction → adversaire nommé
  if (ADVERSARY_CATEGORIES.has(category)) {
    return buildAdversarySender(category);
  }

  // 4. Conscience — tout le reste
  return buildConscienceSender();
}

/**
 * Dérive l'émetteur d'une `JournalEntry`.
 *
 * Les entrées de journal n'ont pas de `category` directe : on s'appuie sur le
 * préfixe de `type` et quelques marqueurs textuels pour déterminer la bonne voix.
 *
 * Règle :
 * - type `success`   → heaven (victoire spirituelle)
 * - type `fail`      → adversary (chute)
 * - type `cascade`   → adversary (conséquence négative)
 * - type `milestone` contenant `[ARC` et arc entourage → entourage
 * - type `milestone` contenant `[SAISON]`/`[NAISSANCE]`/`[ÉVEIL]` → heaven
 * - type `micro`     → entourage (vie quotidienne / famille / contexte)
 * - type `event`     → conscience (question ouverte)
 * - par défaut       → conscience
 */
export function deriveSenderFromJournalEntry(entry: JournalEntry): MessageSender {
  const { type, text } = entry;

  if (type === 'success') {
    return buildHeavenSender('heaven_victory');
  }

  if (type === 'fail') {
    // Cherche une catégorie dans le texte de l'entrée pour personnaliser l'adversaire
    const adversaryCategory = detectCategoryFromText(text);
    if (adversaryCategory !== null) {
      return buildAdversarySender(adversaryCategory);
    }
    return {
      sender:      'adversary',
      displayName: "L'Adversaire",
      color:       SENDER_COLORS.adversary,
      iconKey:     'adversary_generic',
      assetId:     buildAssetId('adversary', 'adversary_generic'),
    };
  }

  if (type === 'cascade') {
    return {
      sender:      'adversary',
      displayName: "L'Adversaire",
      color:       SENDER_COLORS.adversary,
      iconKey:     'adversary_cascade',
      assetId:     buildAssetId('adversary', 'adversary_cascade'),
    };
  }

  if (type === 'micro') {
    return buildEntourageSender('arc-ami'); // Les micro-events sont contexte de vie / entourage
  }

  if (type === 'milestone') {
    // Marqueurs célestes (saisons, naissances, révélations d'Appel)
    const heavenMarkers = ['[SAISON]', '[NAISSANCE]', '[ÉVEIL]', '[SAISONS]', '[RÉVÉL', '[ARC_COMPLET]', '[GRIMOIRE]', '[TRAIT]', '[COMBO', '[ECHO_LINK]', '[CHAPITRE]', '[CLIFFHANGER]', '[JALON]'];
    for (const marker of heavenMarkers) {
      if (text.includes(marker)) {
        return buildHeavenSender('heaven_milestone');
      }
    }
    // Marqueurs d'arc entourage
    if (text.includes('[ARC]') || text.includes('[AMI]')) {
      return buildEntourageSender('arc-ami');
    }
    // Jalons de vie (adolescence, maturité…)
    return buildHeavenSender('heaven_milestone');
  }

  // type 'event' ou inconnu → conscience
  return buildConscienceSender();
}

/* ─── Helper interne : détection de catégorie dans le texte d'une entrée ──── */

/**
 * Tente de détecter la catégorie d'une entrée journal à partir de son texte.
 * Retourne null si aucune catégorie reconnue n'est trouvée.
 * Utilisé uniquement pour les entrées `fail` pour personnaliser l'adversaire.
 */
function detectCategoryFromText(text: string): AfflictionCategory | null {
  // Correspondances entre fragments de titre (tels que formatés dans gameEngine)
  // et catégories. On recherche dans le nom de l'adversaire ou des mots-clés communs.
  const patterns: Array<[string, AfflictionCategory]> = [
    ['peur', 'peur_angoisse'],
    ['angoisse', 'peur_angoisse'],
    ['addiction', 'impudicite_addiction'],
    ['impudicité', 'impudicite_addiction'],
    ['finance', 'finances_paresse'],
    ['paresse', 'finances_paresse'],
    ['amertume', 'amertume_rejet'],
    ['rejet', 'amertume_rejet'],
    ['combat spirituel', 'combat_spirituel'],
    ['oppression', 'combat_spirituel'],
    ['doute', 'doute_incredulite'],
    ['incrédulité', 'doute_incredulite'],
    ['orgueil', 'orgueil_independance'],
    ['culpabilité', 'culpabilite'],
    ['maladie', 'maladie_guerison'],
    ['tristesse', 'tristesse_joie'],
    ['découragement', 'decouragement'],
    ['fatigue', 'lourdeur_fatigue'],
  ];

  const lower = text.toLowerCase();
  for (const [fragment, category] of patterns) {
    if (lower.includes(fragment)) {
      return category;
    }
  }
  return null;
}
