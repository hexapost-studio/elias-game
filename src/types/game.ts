/** Catégories d'afflictions spirituelles */
export type AfflictionCategory =
  | 'peur_angoisse'
  | 'impudicite_addiction'
  | 'finances_paresse'
  | 'amertume_rejet'
  | 'combat_spirituel'
  | 'identite_appel'
  | 'doute_incredulite'
  | 'orgueil_independance';

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

export interface AfflictionEvent {
  id: string;
  title: string;
  description: string;
  ageRange: [number, number];
  category: AfflictionCategory;
  correctVerseId: string;
  decoyVerseIds: string[];
  statImpactOnFail: StatImpact;
  thematicFlavor?: string;
  /** Événement déclenché si le joueur échoue */
  cascadeEventId?: string;
  /** ID d'arc narratif pour les histoires multi-événements */
  storyArcId?: string;
  /** Position dans l'arc (1-indexed) */
  arcSequence?: number;
  /** Texte alternatif selon des conditions de stats */
  narrativeVariants?: NarrativeVariant[];
  /** Stat minimum pour que cet événement apparaisse */
  minStat?: Partial<Record<StatName, number>>;
  /** Stat maximum pour que cet événement apparaisse */
  maxStat?: Partial<Record<StatName, number>>;
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

export interface GameState {
  age: number;
  stats: Record<StatName, number>;
  profileName: string;       // Profil de naissance
  difficulty: DifficultyLevel;
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
  type: 'event' | 'success' | 'fail' | 'milestone' | 'cascade';
  verseRef?: string;
}
