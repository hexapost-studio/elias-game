/**
 * Catégories d'épreuves d'Élias.
 *
 * Chaque catégorie correspond à un thème de verset du livre de référence EJP/ICC.
 * Elle détermine :
 *  - Quel pool de versets est utilisé pour les leurres (decoys)
 *  - La couleur et l'icône affichées dans le HUD
 *  - Le "ton" narratif attendu dans les descriptions d'événements
 *
 * ── CATÉGORIES ORIGINALES (8) ────────────────────────────────────────────────
 *  Couvrent les afflictions classiques de la vie chrétienne quotidienne.
 *
 * ── NOUVELLES CATÉGORIES (15) — thèmes positifs et croissance ────────────────
 *  Issues du livre de versets EJP/ICC (pages 1–95).
 *  Contrairement aux catégories originales (vaincre X), ces thèmes incluent
 *  aussi des dimensions positives : manifester, recevoir, vivre, expérimenter.
 *
 * @see src/data/verses.ts    — pool de versets par catégorie
 * @see src/components/IconSystem.tsx — couleurs et icônes associées
 * @see src/data/event-schema.ts — règles de génération d'événements IA
 */
export type AfflictionCategory =
  // ── Catégories originales ──────────────────────────────────────────────────
  | 'peur_angoisse'           // Peur, angoisse, inquiétude (p.45)
  | 'impudicite_addiction'    // Impudicité, addictions (p.52, p.95)
  | 'finances_paresse'        // Pauvreté, manque, paresse (p.56, p.62)
  | 'amertume_rejet'          // Amertume, manque de pardon, rejet (p.42, p.75)
  | 'combat_spirituel'        // Oppression, attaques de l'ennemi (p.90)
  | 'identite_appel'          // Identité en Christ, destinée (p.1, p.20)
  | 'doute_incredulite'       // Doute, incrédulité, manque de foi (p.13)
  | 'orgueil_independance'    // Orgueil, autosuffisance (p.78)
  // ── Nouvelles catégories — croissance et victoire ─────────────────────────
  | 'saint_esprit'            // Vie et dons du Saint-Esprit (p.6)
  | 'parole_de_dieu'          // Connaissance et pratique de la Parole (p.9)
  | 'amour_de_dieu'           // Manifester l'amour de Dieu envers autrui (p.17)
  | 'direction_divine'        // Recevoir la direction de Dieu (p.23)
  | 'priere'                  // Vie de prière, intercession (p.26)
  | 'soif_de_dieu'            // Désir de Dieu, intimité spirituelle (p.29)
  | 'obeissance'              // Obéissance à Dieu et à l'autorité (p.32)
  | 'culpabilite'             // Vaincre la culpabilité, la condamnation (p.38)
  | 'sterilite'               // Stérilité physique ou spirituelle (p.59)
  | 'abondance_financiere'    // Dîme, offrandes, prospérité divine (p.66)
  | 'maladie_guerison'        // Maladies, guérison divine (p.69)
  | 'echec_reussite'          // Vaincre l'échec, marcher dans la réussite (p.72)
  | 'tristesse_joie'          // Tristesse, manifester la joie de Dieu (p.81)
  | 'decouragement'           // Découragement, persévérance (p.84)
  | 'lourdeur_fatigue';       // Fatigue, lourdeur, vigueur divine (p.87)

/**
 * Ton narratif d'un événement.
 * Utilisé par le moteur IA pour garantir la cohérence du style.
 *
 * - `intime`        : Élias seul face à Dieu. Chambre, prière, nuit.
 * - `communautaire` : Contexte d'église, cellule, groupe de prière.
 * - `familial`      : Interactions avec parents, conjoint, enfants, fratrie.
 * - `professionnel` : Travail, université, argent, carrière.
 * - `ministeriel`   : Service, vision, leadership, appel à servir.
 * - `corporel`      : Santé physique, maladie, fatigue, corps.
 */
export type EventTone =
  | 'intime'
  | 'communautaire'
  | 'familial'
  | 'professionnel'
  | 'ministeriel'
  | 'corporel';

export type StatName = 'foi' | 'paix' | 'physique' | 'finances';

export interface StatImpact {
  foi: number;
  paix: number;
  physique: number;
  finances: number;
}

export type DifficultyLevel = 1 | 2 | 3;

export type FlowPalier = 1 | 2 | 3; // Apprentissage | Transition | Hardcore

export interface FlowState {
  value: number;         // 0-100
  palier: FlowPalier;
  timeToAnswer: number;  // secondes pour répondre
  burnoutRate: number;   // % de physique perdu par tour en Palier 3
}

export interface VerseEntry {
  id: string;
  reference: string;
  text: string;
  category: AfflictionCategory;
  tags: string[];
  statImpact: Partial<StatImpact>;
  difficulty: 1 | 2 | 3;
  weight?: number;         // Pour SRS — priorité de réapparition
  cascadeFailId?: string;  // Événement déclenché si échec
}

/** Les 4 stades de vie utilisés pour adapter les événements */
export type LifeStage = 'enfant' | 'ado' | 'adulte' | 'senior';

/**
 * Variante d'un événement propre à un stade de vie.
 * Remplace description, impact et flavor du stade correspondant.
 * Les champs absents héritent des valeurs racine de l'événement.
 */
export interface AgeVariant {
  description: string;
  /** Impact partiel — fusionné avec statImpactOnFail racine */
  statImpactOnFail?: Partial<StatImpact>;
  thematicFlavor?: string;
}

export interface MicroEvent {
  id: string;
  text: string;
  ageRange: [number, number];
  probability?: number;
  statBonus?: Partial<StatImpact>;
}

export interface AfflictionEvent {
  id: string;
  title: string;
  description: string;
  ageRange: [number, number];
  category: AfflictionCategory;
  correctVerseId: string;
  decoyVerseIds: string[];
  statImpactOnFail: StatImpact;
  /** Boosts de stats appliqués en cas de bonne réponse (événements bénédiction) */
  statImpactOnSuccess?: Partial<StatImpact>;
  thematicFlavor?: string;
  /** Événement déclenché si le joueur échoue */
  cascadeEventId?: string;
  /** ID d'arc narratif pour les histoires multi-événements */
  storyArcId?: string;
  /** Position dans l'arc (1-indexed) */
  arcSequence?: number;
  /** Texte alternatif selon des conditions de stats */
  narrativeVariants?: NarrativeVariant[];
  /** Probabilité d'entrer dans le pool de sélection (0–1). Absent = toujours éligible. */
  spawnProbability?: number;
  /** Stat minimum pour que cet événement apparaisse */
  minStat?: Partial<Record<StatName, number>>;
  /** Stat maximum pour que cet événement apparaisse */
  maxStat?: Partial<Record<StatName, number>>;
  /** Relation minimum avec {ami} pour que cet event apparaisse */
  minAmiRelationship?: number;
  /**
   * Surcharges par stade de vie (enfant 0-11, ado 12-17, adulte 18-59, senior 60+).
   * Quand un stade est absent, l'événement utilise ses champs racine.
   */
  byAge?: Partial<Record<LifeStage, AgeVariant>>;
}

export interface NarrativeVariant {
  condition: StatCondition;
  title: string;
  description: string;
}

export interface StatCondition {
  type: 'birth_profile' | 'stat_check';
  profileName?: string;     // ex: 'Équilibré', 'Foi de fer'
  stat?: StatName;
  operator?: 'lt' | 'gt' | 'lte' | 'gte';
  value?: number;
}

export interface StoryArc {
  id: string;
  name: string;
  description: string;
  eventIds: string[];  // ordonnés
  rewardVerseId?: string;  // verset bonus après completion
  rewardTitle?: string;
}

export interface CompletedArc {
  arcId: string;
  completedAtAge: number;
}

export interface LifeContext {
  friendName: string;   // {ami}  — ami principal, généré à la naissance
  city: string;         // {ville} — ville natale
  profession: string;   // {métier} — vocation professionnelle
  churchName: string;   // {église} — communauté d'appartenance
  spouseName: string;   // {conjoint} — conjoint(e), généré(e) à la naissance
}

export type PlayerAction = 'pray' | 'fast' | 'serve' | 'call_friend' | 'read_word';

export interface GameState {
  age: number;
  stats: Record<StatName, number>;
  profileName: string;       // Profil de naissance
  parentNames: { father: string; mother: string };
  lifeContext: LifeContext;
  difficulty: DifficultyLevel;
  actionPoints: number;          // Points d'action disponibles cette année
  actionsThisYear: PlayerAction[]; // Actions déjà utilisées cette année
  amiRelationship: number;        // 0-100 — relation avec l'ami principal
  /**
   * Grâces de crise — quand une stat tombe à 0 via un event, au lieu de mourir
   * la stat est remontée à 3 et une grâce est consommée. À 0 grâce : mort réelle.
   * Commence à 2. Ne se recharge pas (sauf héritage spécial).
   */
  crisesRemaining: number;
  flow: FlowState;
  combo: number;
  maxCombo: number;
  journal: JournalEntry[];
  currentEvent: AfflictionEvent | null;
  phase: 'idle' | 'event' | 'choosing' | 'result';
  lastEventResult: 'success' | 'fail' | null;
  totalEvents: number;
  successRate: number;
  failedVerseIds: string[];
  codex: Record<string, CodexEntry>;
  currentTitle: Title | null;
  inheritance: Inheritance;
  queuedCascadeEvents: QueuedCascade[];
  completedArcs: CompletedArc[];
  encounteredArcIds: string[];
  /** Fenêtre glissante des 5 derniers événements vus — empêche les répétitions */
  recentEventIds: string[];
  /** IDs des événements d'arc déjà répondus — permet d'enforcer l'ordre séquentiel des arcs */
  answeredArcEventIds: string[];
  /** Nombre de fails consécutifs — réinitialisé au premier succès */
  consecutiveFails: number;
  /** True quand le correcteur de frustration est actif — force un événement de grâce */
  reliefActive: boolean;
  /** Saison spirituelle courante — déterminée par la décennie d'âge */
  spiritualSeason: SpiritualSeasonName;
  /** Nombre d'années consécutives avec amiRelationship < 20 */
  amiDecayStreak: number;
  metrics: RunMetrics;
}

export interface CodexEntry {
  verseId: string;
  unlocked: boolean;
  unlockedAtAge?: number;
  timesUsed: number;
  errorCount: number;
  lastErrorAge?: number;
}

export interface Title {
  id: string;
  name: string;
  description: string;
  priority: number;
  condition: (metrics: RunMetrics) => boolean;
  bonus: Partial<StatImpact>;
}

export interface Inheritance {
  title: Title | null;
  bonus: Partial<StatImpact>;
  used: boolean;
}

export interface QueuedCascade {
  eventId: string;
  triggerAge: number;
  sourceEventTitle: string;
}

export interface RunMetrics {
  ageAtDeath: number;
  totalEvents: number;
  successRate: number;
  maxCombo: number;
  maxFlow: number;
  dominantCategory: AfflictionCategory | null;
  totalVersesUnlocked: number;
  causeOfDeath: string | null;
}

export interface JournalEntry {
  age: number;
  text: string;
  type: 'event' | 'success' | 'fail' | 'milestone' | 'cascade' | 'micro';
  verseRef?: string;
}

export type SpiritualSeasonName =
  | 'Réveil'
  | 'Désert'
  | 'Persécution'
  | 'Abondance'
  | 'Grâce';

export interface SpiritualSeason {
  name: SpiritualSeasonName;
  label: string;
  icon: string;
  color: string;
  description: string;
  categoryMultipliers: Partial<Record<AfflictionCategory, number>>;
}
