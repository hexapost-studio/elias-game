import type {
  GameState,
  AfflictionEvent,
  StatName,
  DifficultyLevel,
  JournalEntry,
  FlowPalier,
  CodexEntry,
  Title,
  Inheritance,
  RunMetrics,
  QueuedCascade,
  LifeContext,
  AfflictionCategory,
  SpiritualSeasonName,
  SpiritualSeason,
} from '../types/game';
import { getEventsForAge, pickDecoys, getEventById, resolveEventForAge } from '../data/events';
import { getVerseById, VERSE_DATABASE } from '../data/verses';
import { getArcById } from '../data/storyArcs';
import { getMicroEventForAge } from '../data/microEvents';
import { CONFIG } from '../../game/data/loader';
import { pickCalling } from '../data/callings';
import { evaluateTraitAwards, getTraitCategoryBias } from '../data/traits';
import { mulberry32, makeSeed, rngWeightedPick, rngPick, type Rng } from './rng';
import { buildEchoLinkEntry } from './echoLink';
import { resolveQuestionType } from './verseProgression';
import { getChapterIntro, getDecadeCliffhanger, isDecadeStart, isDecadeEnd } from './lifeChapters';
import { revealsAtAge } from './reveals';
import { countUnlocked, collectionRewardText } from './collection';
import { generateOpeningVignette } from './opening';
import { resolvePlayerName, personalize } from './identity';
import type { Calling } from '../types/game';

const MAX_STAT = CONFIG.maxStat;
const MIN_STAT = CONFIG.minStat;
const MAX_AGE = CONFIG.maxAge;

/* ─── JAUGE DE FLOW ─── */

const T = CONFIG.flow.thresholds;

const FLOW_GAIN_BASE = CONFIG.flow.baseGain;
const FLOW_MAX_TIME = CONFIG.flow.maxTime;
const FLOW_PALIER_BONUS: Record<FlowPalier, number> = {
  1: CONFIG.flow.multipliers.palier1,
  2: CONFIG.flow.multipliers.palier2,
  3: CONFIG.flow.multipliers.palier3,
};

/** Détermine le palier de Flow à partir de la valeur */
export function getFlowPalier(value: number): FlowPalier {
  if (value <= T.palier1) return 1;
  if (value <= T.palier2) return 2;
  return 3;
}

/** Calcule le gain de Flow selon le temps de réponse */
export function calculateFlowGain(
  timeToAnswer: number
): number {
  const ratio = Math.max(0, (FLOW_MAX_TIME - timeToAnswer) / FLOW_MAX_TIME);
  return Math.round(FLOW_GAIN_BASE * (1 + ratio));
}

/** Pénalité asymétrique — retombe au seuil inférieur du palier */
export function calculateFlowPenalty(currentFlow: number): number {
  const palier = getFlowPalier(currentFlow);
  if (palier === 3) return CONFIG.flow.penaltyPalier3;
  if (palier === 2) return CONFIG.flow.penaltyPalier2;
  return 0;
}

/* ─── NOMS DES PARENTS ─── */

const FATHER_NAMES = [
  'Samuel', 'Emmanuel', 'Joël', 'Nathan', 'Daniel', 'Caleb', 'David',
  'Gidéon', 'Jonas', 'Aaron', 'Élie', 'Moïse', 'Matthieu', 'Marc', 'Luc',
  'Pierre', 'Jean', 'André', 'Simon', 'Jacques', 'Abdias', 'Siméon', 'Ézéchiel',
];

const MOTHER_NAMES = [
  'Marie', 'Rachel', 'Naomi', 'Rébecca', 'Esther', 'Léa', 'Marthe',
  'Lydie', 'Anne', 'Priscille', 'Suzanne', 'Déborah', 'Miriam', 'Élisabeth',
  'Abigaïl', 'Ruth', 'Sophie', 'Grâce', 'Christiane', 'Joie', 'Joyeuse', 'Béatrice',
];

function generateParentNames(rng: Rng): { father: string; mother: string } {
  return {
    father: rngPick(rng, FATHER_NAMES),
    mother: rngPick(rng, MOTHER_NAMES),
  };
}

/* ─── CONTEXTE DE VIE ─── */

const FRIEND_NAMES = [
  'Jonas', 'Thomas', 'Caleb', 'Nathanaël', 'Isaac', 'Amos', 'Ezra', 'Barnabas',
  'Timothée', 'Esther', 'Déborah', 'Abigaïl', 'Lydie', 'Priscille', 'Suzanne', 'Joanna',
];

const CITIES = [
  'Abidjan', 'Dakar', 'Yaoundé', 'Kinshasa', 'Brazzaville', 'Lomé', 'Cotonou',
  'Douala', 'Libreville', 'Bamako', 'Conakry', 'Kigali', 'Bujumbura', 'Montréal',
];

const PROFESSIONS = [
  'enseignant', 'médecin', 'ingénieur', 'comptable', 'infirmier', 'juriste',
  'entrepreneur', 'architecte', 'informaticien', 'économiste', 'pharmacien',
  'développeur', 'biologiste', 'évangéliste',
];

const CHURCH_NAMES = [
  'Église de la Grâce', 'Assemblée de la Foi', 'Centre Chrétien', 'Tabernacle de la Victoire',
  'Église du Rocher', 'Maison de Prière', 'Communauté Chrétienne', 'Église Vivante',
  'Centre de Vie', 'Temple de la Paix', 'Bergers de Jésus', 'Mission Évangélique',
];

const SPOUSE_NAMES = [
  'Sarah', 'Élise', 'Chloé', 'Marie-Claire', 'Joëlle', 'Grâce', 'Esther', 'Naomi',
  'Abigaïl', 'Lydie', 'Priscille', 'Béatrice', 'Christiane', 'Joyeuse', 'Ange',
  'Gloria', 'Ruth', 'Marthe', 'Suzanne', 'Léa', 'Rébecca', 'Miriam', 'Joanna',
];

function generateLifeContext(rng: Rng): LifeContext {
  return {
    friendName: rngPick(rng, FRIEND_NAMES),
    city:       rngPick(rng, CITIES),
    profession: rngPick(rng, PROFESSIONS),
    churchName: rngPick(rng, CHURCH_NAMES),
    spouseName: rngPick(rng, SPOUSE_NAMES),
  };
}

/* ─── STATS DE NAISSANCE RNG ─── */

interface BirthProfile {
  name: string;
  stats: Record<StatName, [number, number]>; // [min, max]
  weight: number; // probabilité relative
}

const BIRTH_PROFILES: BirthProfile[] = [
  { name: 'Foi de fer',     stats: { foi: [70, 95], paix: [50, 70], physique: [60, 80], finances: [30, 50] }, weight: 20 },
  { name: 'Équilibré',     stats: { foi: [50, 70], paix: [50, 70], physique: [50, 70], finances: [50, 70] }, weight: 35 },
  { name: 'Santé fragile',  stats: { foi: [60, 80], paix: [50, 70], physique: [30, 50], finances: [50, 70] }, weight: 15 },
  { name: 'Financier',      stats: { foi: [40, 60], paix: [40, 60], physique: [50, 70], finances: [70, 95] }, weight: 15 },
  { name: 'Éprouvé',        stats: { foi: [80, 95], paix: [30, 50], physique: [40, 60], finances: [30, 50] }, weight: 10 },
  { name: 'Prodige',        stats: { foi: [60, 80], paix: [60, 80], physique: [60, 80], finances: [60, 80] }, weight: 5 },
];

function pickBirthProfile(rng: Rng): BirthProfile {
  return rngWeightedPick(rng, BIRTH_PROFILES, BIRTH_PROFILES.map((p) => p.weight));
}

/** Tirage entier dans [min, max[ (exclusif en haut) — préserve la distribution d'origine. */
function rngInRange(rng: Rng, [min, max]: [number, number]): number {
  return Math.floor(min + rng() * (max - min));
}

export function generateBirthStats(rng: Rng): {
  stats: Record<StatName, number>;
  profileName: string;
} {
  const profile = pickBirthProfile(rng);
  const stats: Record<StatName, number> = {
    foi: rngInRange(rng, profile.stats.foi),
    paix: rngInRange(rng, profile.stats.paix),
    physique: rngInRange(rng, profile.stats.physique),
    finances: rngInRange(rng, profile.stats.finances),
  };
  return { stats, profileName: profile.name };
}

/* ─── TITRES ET HÉRITAGE ─── */

export const TITLES: Title[] = [
  {
    id: 'prodige',
    name: 'Le Prodige',
    description: 'Atteint 100 ans avec les 4 jauges > 50%',
    priority: 100,
    condition: (m) => m.ageAtDeath >= 100 && m.successRate >= 60,
    bonus: { foi: 5, paix: 5 },
  },
  {
    id: 'star',
    name: 'La Star',
    description: 'Taux de réussite > 85%',
    priority: 90,
    condition: (m) => m.successRate > 85 && m.totalEvents >= 15,
    bonus: { foi: 4, paix: 4, finances: 4 },
  },
  {
    id: 'anakazo',
    name: 'L\'Anakazo',
    description: 'Combo max ≥ 10',
    priority: 80,
    condition: (m) => m.maxCombo >= 10,
    bonus: { physique: 3, finances: 3 },
  },
  {
    id: 'fervent',
    name: 'Le Fervent',
    description: 'A atteint le Flow max (100) au moins une fois',
    priority: 70,
    condition: (m) => m.maxFlow >= 100,
    bonus: { foi: 8 },
  },
  {
    id: 'combattant',
    name: 'Le Combattant',
    description: 'A survécu à 30+ événements avec un taux > 70%',
    priority: 60,
    condition: (m) => m.totalEvents >= 30 && m.successRate >= 70,
    bonus: { physique: 5, foi: 3 },
  },
  {
    id: 'sage',
    name: 'Le Sage',
    description: 'A débloqué 30+ versets dans le Codex',
    priority: 50,
    condition: (m) => m.totalVersesUnlocked >= 30,
    bonus: { paix: 5, foi: 3 },
  },
  {
    id: 'survivant',
    name: 'Le Survivant',
    description: 'A survécu à 20+ événements sans mourir',
    priority: 40,
    condition: (m) => m.causeOfDeath === null && m.ageAtDeath < 100 && m.totalEvents >= 20,
    bonus: { physique: 8 },
  },
];

/* ─── CODE X ─── */

export function createInitialCodex(): Record<string, CodexEntry> {
  const codex: Record<string, CodexEntry> = {};
  for (const v of VERSE_DATABASE) {
    codex[v.id] = {
      verseId: v.id,
      unlocked: false,
      timesUsed: 0,
      errorCount: 0,
    };
  }
  return codex;
}

export function unlockVerseInCodex(
  codex: Record<string, CodexEntry>,
  verseId: string,
  age: number
): Record<string, CodexEntry> {
  const entry = codex[verseId];
  if (!entry) return codex;
  return {
    ...codex,
    [verseId]: {
      ...entry,
      unlocked: true,
      unlockedAtAge: entry.unlocked ? entry.unlockedAtAge : age,
      timesUsed: entry.timesUsed + 1,
    },
  };
}

export function recordVerseError(
  codex: Record<string, CodexEntry>,
  verseId: string,
  age: number
): Record<string, CodexEntry> {
  const entry = codex[verseId];
  if (!entry) return codex;
  return {
    ...codex,
    [verseId]: {
      ...entry,
      errorCount: entry.errorCount + 1,
      lastErrorAge: age,
    },
  };
}

/* ─── ÉTAT INITIAL ─── */

export function createInitialState(inheritance?: Inheritance, forcedSeed?: number, playerName?: string): GameState {
  // Seed de run + PRNG seedé pour la « colonne vertébrale » (Appel, saisons, traits).
  const seed = forcedSeed ?? makeSeed();
  const rng: Rng = mulberry32(seed);
  const name = resolvePlayerName(playerName);

  // Toute la naissance passe par le MÊME rng seedé → même graine = même destinée
  // (itér. 10 / proposition A — graines partageables).
  const { stats, profileName } = generateBirthStats(rng);
  const parentNames = generateParentNames(rng);
  const lifeContext = generateLifeContext(rng);

  // Appel / Destinée — tiré pondéré (Partie 2 : choisi par le joueur).
  const calling: Calling = pickCalling(rng);

  // Stats de départ = naissance + héritage + bonus d'Appel.
  const b = inheritance?.bonus ?? {};
  const cb = calling.startBonus ?? {};
  const startStats = {
    foi: Math.min(100, stats.foi + (b.foi || 0) + (cb.foi || 0)),
    paix: Math.min(100, stats.paix + (b.paix || 0) + (cb.paix || 0)),
    physique: Math.min(100, stats.physique + (b.physique || 0) + (cb.physique || 0)),
    finances: Math.min(100, stats.finances + (b.finances || 0) + (cb.finances || 0)),
  };

  const state: GameState = {
    age: 0,
    playerName: name,
    profileName,
    parentNames,
    lifeContext,
    actionPoints: 2,
    actionsThisYear: [],
    amiRelationship: 50,
    crisesRemaining: 2,
    stats: startStats,
    calling,
    traits: [],
    seed,
    difficulty: 1,
    flow: { value: 33, palier: 1, timeToAnswer: 0, burnoutRate: 0 },
    combo: 0,
    maxCombo: 0,
    journal: [
      {
        age: 0,
        text: `${generateOpeningVignette({ city: lifeContext.city, calling, name }, rng)} Ses parents, ${parentNames.father} et ${parentNames.mother}, l'accueillent ; il grandira vers ${lifeContext.profession}.${
          inheritance?.title
            ? ` Héritage : « ${inheritance.title.name} » (bonus actif).`
            : ''
        }`,
        type: 'milestone',
      },
    ],
    currentEvent: null,
    phase: 'idle',
    lastEventResult: null,
    totalEvents: 0,
    successRate: 0,
    failedVerseIds: [],
    codex: createInitialCodex(),
    currentTitle: null,
    inheritance: inheritance || { title: null, bonus: {}, used: false },
    queuedCascadeEvents: [],
    completedArcs: [],
    encounteredArcIds: [],
    recentEventIds: [],
    recentVerseIds: [],
    answeredArcEventIds: [],
    flags: {},
    consecutiveFails: 0,
    reliefActive: false,
    spiritualSeason: 'Réveil' as SpiritualSeasonName,
    amiDecayStreak: 0,
    callFriendCount: 0,
    friendIntroduced: false,
    discoveryMode: false,
    metrics: {
      ageAtDeath: 0,
      totalEvents: 0,
      successRate: 0,
      maxCombo: 0,
      maxFlow: 33,
      dominantCategory: null,
      totalVersesUnlocked: 0,
      causeOfDeath: null,
    },
  };
  return state;
}

/* ─── DIFFICULTÉ ─── */

export function getDifficultyForAge(age: number): DifficultyLevel {
  if (age <= 15) return 1;
  if (age <= 60) return 2;
  return 3;
}

/* ─── CODE VERSETS ─── */

/** Retourne les versets les plus prioritaires pour SRS (ceux avec le plus d'erreurs) */
export function getSrsPriorityVerses(
  codex: Record<string, CodexEntry>,
  limit: number = 5
): string[] {
  const entries = Object.values(codex)
    .filter((e) => e.errorCount > 0)
    .sort((a, b) => b.errorCount - a.errorCount || (b.lastErrorAge || 0) - (a.lastErrorAge || 0));
  return entries.slice(0, limit).map((e) => e.verseId);
}

/* ─── CASCADE ─── */

/** Vérifie si des événements en cascade sont programmés pour l'âge actuel */
export function getCascadeEventsForAge(
  queued: QueuedCascade[],
  age: number
): QueuedCascade[] {
  return queued.filter((q) => q.triggerAge === age);
}

/* ─── BURNOUT ─── */

export function calculateBurnoutRate(palier: FlowPalier): number {
  if (palier === 3) return CONFIG.burnout.palier3;
  if (palier === 2) return CONFIG.burnout.palier2;
  return CONFIG.burnout.palier1;
}

/* ─── GAME OVER ─── */

export function checkGameOver(state: GameState): {
  isOver: boolean;
  reason?: string;
} {
  if (state.age >= MAX_AGE) {
    return { isOver: true, reason: 'victory' };
  }

  for (const [stat, value] of Object.entries(state.stats)) {
    // Les finances ne tuent JAMAIS : la pauvreté est une contrainte narrative,
    // pas une fin de partie (« grâce > punition » ; cf. les béatitudes). Seules
    // les jauges spirituelles/physiques (foi, paix, physique) sont vitales.
    if (stat === 'finances') continue;
    if (value <= 0) {
      return { isOver: true, reason: `La jauge de ${stat} est tombée à zéro — les grâces sont épuisées.` };
    }
  }

  return { isOver: false };
}

const STAT_LABELS: Record<string, string> = {
  foi: 'Foi', paix: 'Paix', physique: 'Corps', finances: 'Finances',
};

/**
 * Après application des malus d'un event, vérifie si une stat est tombée à ≤ 0.
 * Si des grâces restent, remonte la stat à 3 et consomme une grâce.
 * Retourne le state corrigé + un message de crise (ou null si pas de crise).
 */
export function applyCrisisGrace(
  state: GameState,
  stats: Record<StatName, number>,
): { stats: Record<StatName, number>; newCrises: number; crisisMessage: string | null } {
  let newCrises = state.crisesRemaining;
  let crisisMessage: null | string = null;
  const corrected = { ...stats };

  for (const [key, val] of Object.entries(corrected)) {
    // Les finances ne déclenchent pas de crise (elles ne tuent pas) — ne pas
    // gaspiller une grâce de crise dessus. On laisse simplement la jauge basse.
    if (key === 'finances') continue;
    if (val <= 0 && newCrises > 0) {
      corrected[key as StatName] = 3;
      newCrises--;
      const label = STAT_LABELS[key] ?? key;
      crisisMessage = `[CRISE] La jauge de ${label} a touché zéro. Une grâce divine a relevé ${state.playerName} (${newCrises} grâce${newCrises !== 1 ? 's' : ''} restante${newCrises !== 1 ? 's' : ''}).`;
    }
  }

  return { stats: corrected, newCrises, crisisMessage };
}

/* ─── VARIANTES NARRATIVES ─── */

/** Applique les variantes narratives à un événement selon le profil/stats */
export function applyNarrativeVariant(
  event: AfflictionEvent,
  state: GameState
): AfflictionEvent {
  if (!event.narrativeVariants || event.narrativeVariants.length === 0) {
    return event;
  }

  for (const variant of event.narrativeVariants) {
    const c = variant.condition;
    let match = false;
    if (c.type === 'birth_profile') {
      match = state.profileName === c.profileName;
    } else if (c.type === 'stat_check' && c.stat && c.operator && c.value !== undefined) {
      const statValue = state.stats[c.stat];
      match =
        (c.operator === 'gt' && statValue > c.value) ||
        (c.operator === 'lt' && statValue < c.value) ||
        (c.operator === 'gte' && statValue >= c.value) ||
        (c.operator === 'lte' && statValue <= c.value);
    } else if (c.type === 'season' && c.season) {
      match = state.spiritualSeason === c.season;
    } else if (c.type === 'has_trait' && c.traitId) {
      match = (state.traits ?? []).some((t) => t.id === c.traitId);
    } else if (c.type === 'calling' && c.callingId) {
      match = state.calling?.id === c.callingId;
    }
    if (match) {
      return { ...event, title: variant.title, description: variant.description };
    }
  }
  return event;
}

/* ─── SAISONS SPIRITUELLES (Système 3) ─── */

interface CategoryAffinity {
  primaryStat: StatName;
  orientation: 'victoire' | 'croissance';
  threshold: number;
}

const CATEGORY_AFFINITY: Partial<Record<AfflictionCategory, CategoryAffinity>> = {
  peur_angoisse:        { primaryStat: 'paix',     orientation: 'victoire',   threshold: 45 },
  doute_incredulite:    { primaryStat: 'foi',      orientation: 'victoire',   threshold: 50 },
  combat_spirituel:     { primaryStat: 'foi',      orientation: 'victoire',   threshold: 50 },
  amertume_rejet:       { primaryStat: 'paix',     orientation: 'victoire',   threshold: 40 },
  finances_paresse:     { primaryStat: 'finances', orientation: 'victoire',   threshold: 40 },
  impudicite_addiction: { primaryStat: 'foi',      orientation: 'victoire',   threshold: 45 },
  maladie_guerison:     { primaryStat: 'physique', orientation: 'victoire',   threshold: 40 },
  tristesse_joie:       { primaryStat: 'paix',     orientation: 'victoire',   threshold: 35 },
  decouragement:        { primaryStat: 'paix',     orientation: 'victoire',   threshold: 40 },
  lourdeur_fatigue:     { primaryStat: 'physique', orientation: 'victoire',   threshold: 35 },
  culpabilite:          { primaryStat: 'paix',     orientation: 'victoire',   threshold: 40 },
  echec_reussite:       { primaryStat: 'finances', orientation: 'victoire',   threshold: 35 },
  saint_esprit:         { primaryStat: 'foi',      orientation: 'croissance', threshold: 60 },
  parole_de_dieu:       { primaryStat: 'foi',      orientation: 'croissance', threshold: 55 },
  amour_de_dieu:        { primaryStat: 'paix',     orientation: 'croissance', threshold: 60 },
  direction_divine:     { primaryStat: 'paix',     orientation: 'croissance', threshold: 55 },
  priere:               { primaryStat: 'foi',      orientation: 'croissance', threshold: 50 },
  soif_de_dieu:         { primaryStat: 'foi',      orientation: 'croissance', threshold: 65 },
  abondance_financiere: { primaryStat: 'finances', orientation: 'croissance', threshold: 60 },
  identite_appel:       { primaryStat: 'foi',      orientation: 'croissance', threshold: 40 },
  obeissance:           { primaryStat: 'foi',      orientation: 'croissance', threshold: 50 },
};

export const SPIRITUAL_SEASONS: Record<SpiritualSeasonName, SpiritualSeason> = {
  Réveil: {
    name: 'Réveil', label: 'RÉVEIL', icon: '✦', color: '#fbbf24',
    description: 'Une saison de réveil spirituel s\'ouvre. Les bases de la foi se posent.',
    categoryMultipliers: { identite_appel: 2.0, saint_esprit: 1.8, parole_de_dieu: 1.6, soif_de_dieu: 1.5, peur_angoisse: 0.6 },
  },
  Désert: {
    name: 'Désert', label: 'DÉSERT', icon: '◈', color: '#d97706',
    description: 'Élias entre dans une saison de désert. Les épreuves intérieures s\'intensifient.',
    categoryMultipliers: { doute_incredulite: 2.0, soif_de_dieu: 2.0, decouragement: 1.8, tristesse_joie: 1.6, lourdeur_fatigue: 1.5, abondance_financiere: 0.5 },
  },
  Persécution: {
    name: 'Persécution', label: 'ÉPREUVE', icon: '⚔', color: '#ef4444',
    description: 'Une saison d\'épreuve extérieure. La foi d\'Élias est testée publiquement.',
    categoryMultipliers: { combat_spirituel: 2.5, amertume_rejet: 2.0, obeissance: 1.8, identite_appel: 1.4, echec_reussite: 1.5, abondance_financiere: 0.4 },
  },
  Abondance: {
    name: 'Abondance', label: 'ABONDANCE', icon: '✧', color: '#34d399',
    description: 'Une saison de bénédiction s\'ouvre. Dieu multiplie sur la fidélité.',
    categoryMultipliers: { abondance_financiere: 2.5, amour_de_dieu: 2.0, direction_divine: 1.8, priere: 1.5, orgueil_independance: 1.6, finances_paresse: 0.5 },
  },
  Grâce: {
    name: 'Grâce', label: 'GRÂCE', icon: '◎', color: '#c084fc',
    description: 'La grâce de Dieu couvre cette saison. Le repos et le renouveau arrivent.',
    categoryMultipliers: { saint_esprit: 2.0, parole_de_dieu: 1.8, amour_de_dieu: 1.8, impudicite_addiction: 1.5, culpabilite: 0.3, tristesse_joie: 0.4 },
  },
};

const SEASON_SEQUENCE: SpiritualSeasonName[] = [
  'Réveil',       // 0-9   — éveil de l'enfance
  'Désert',       // 10-19 — doutes de l'adolescence
  'Réveil',       // 20-29 — jeune adulte, renouveau
  'Persécution',  // 30-39 — apogée, épreuves publiques
  'Désert',       // 40-49 — désert du milieu de vie
  'Abondance',    // 50-59 — fruit de la fidélité
  'Grâce',        // 60-69 — grâce du senior
  'Désert',       // 70-79 — dernier affinage
  'Abondance',    // 80-89 — moisson finale
  'Grâce',        // 90-99 — grâce ultime
];

/** @deprecated Trajectoire figée — conservé pour compat. Voir computeSeasonTransition. */
export function getSeasonForAge(age: number): SpiritualSeasonName {
  return SEASON_SEQUENCE[Math.min(Math.floor(age / 10), 9)];
}

/* ─── SAISONS ÉMERGENTES ─── */

const SEASON_NAMES: SpiritualSeasonName[] = ['Réveil', 'Désert', 'Persécution', 'Abondance', 'Grâce'];

/** Tendance douce de saison par stade de vie (remplace la table 100% figée). */
function seasonBaseWeights(age: number): Record<SpiritualSeasonName, number> {
  if (age <= 12) return { 'Réveil': 2.0, 'Grâce': 1.2, 'Désert': 0.8, 'Abondance': 0.7, 'Persécution': 0.6 };
  if (age <= 25) return { 'Désert': 1.6, 'Réveil': 1.4, 'Persécution': 1.1, 'Grâce': 1.0, 'Abondance': 0.8 };
  if (age <= 45) return { 'Persécution': 1.5, 'Abondance': 1.2, 'Désert': 1.2, 'Réveil': 1.0, 'Grâce': 0.9 };
  if (age <= 65) return { 'Abondance': 1.5, 'Grâce': 1.3, 'Désert': 1.1, 'Persécution': 1.0, 'Réveil': 0.9 };
  return { 'Grâce': 1.8, 'Désert': 1.2, 'Abondance': 1.1, 'Réveil': 1.0, 'Persécution': 0.8 };
}

/**
 * Détermine la prochaine saison spirituelle de façon ÉMERGENTE :
 * tendance d'âge × état intérieur d'Élias × biais d'Appel × anti-répétition,
 * tiré via un PRNG seedé (reproductible). Chaque run vit une trajectoire différente.
 */
export function computeSeasonTransition(
  state: GameState,
  newAge: number,
  rng: Rng,
): SpiritualSeasonName {
  const w = seasonBaseWeights(newAge);
  const { foi, paix, finances } = state.stats;

  // L'état intérieur appelle certaines saisons.
  if (foi < 40) w['Désert'] *= 1.6;
  if (paix < 40) { w['Persécution'] *= 1.5; w['Désert'] *= 1.3; }
  if (finances > 70) w['Abondance'] *= 1.6;
  if (finances < 35) w['Abondance'] *= 0.5;
  if (foi > 70 && paix > 60) { w['Grâce'] *= 1.6; w['Réveil'] *= 1.3; }
  if ((state.consecutiveFails ?? 0) >= 2) w['Persécution'] *= 1.4;
  if (state.reliefActive) w['Grâce'] *= 1.8; // après la traversée dure, la grâce vient

  // Biais d'Appel / Destinée.
  const cb = state.calling?.seasonBias;
  if (cb) for (const s of SEASON_NAMES) if (cb[s] !== undefined) w[s] *= cb[s]!;

  // Anti-répétition — éviter de revivre 2× d'affilée la même saison (sauf forte attraction).
  const current = state.spiritualSeason;
  if (current) w[current] *= 0.45;

  return rngWeightedPick(rng, SEASON_NAMES, SEASON_NAMES.map((s) => w[s]));
}

function getSeasonMultipliers(season: SpiritualSeasonName): Partial<Record<AfflictionCategory, number>> {
  return SPIRITUAL_SEASONS[season].categoryMultipliers;
}

/* ─── SÉLECTION PONDÉRÉE (Système 1) ─── */

function computeEventWeight(
  event: AfflictionEvent,
  state: GameState,
  seasonMult: Partial<Record<AfflictionCategory, number>>
): number {
  const affinity = CATEGORY_AFFINITY[event.category];
  let weight = 1.0;

  if (affinity) {
    const val = state.stats[affinity.primaryStat];
    if (affinity.orientation === 'victoire' && val < affinity.threshold) {
      // Plus le stat est bas, plus l'événement est probable
      weight = 1.0 + 1.5 * ((affinity.threshold - val) / affinity.threshold);
    } else if (affinity.orientation === 'croissance' && val >= affinity.threshold) {
      // Plus le stat est haut, plus l'enseignement profond est probable
      weight = 1.0 + 0.8 * ((val - affinity.threshold) / (100 - affinity.threshold));
    }
  }

  // Cas spécial : orgueil boost quand foi est élevée (piège du pharisien)
  if (event.category === 'orgueil_independance') {
    weight = 1.0 + 1.2 * (state.stats.foi / 100);
  }

  weight *= (seasonMult[event.category] ?? 1.0);
  // Biais d'Appel (destinée) + traits gagnés — façonnent le contenu propre à la run.
  weight *= (state.calling?.categoryBias?.[event.category] ?? 1.0);
  weight *= getTraitCategoryBias(state.traits, event.category);
  return Math.max(0.1, weight);
}

function weightedPick<T>(items: T[], weights: number[]): T {
  const total = weights.reduce((s, w) => s + w, 0);
  let r = Math.random() * total;
  for (let i = 0; i < items.length; i++) {
    r -= weights[i];
    if (r <= 0) return items[i];
  }
  return items[items.length - 1];
}

/* ─── GÉNÉRATION D'ÉVÉNEMENT ─── */

/** Filtre les événements selon les conditions de stats */
function filterEventsByStats(
  events: AfflictionEvent[],
  state: GameState
): AfflictionEvent[] {
  return events.filter((e) => {
    // Min stat
    if (e.minStat) {
      for (const [stat, value] of Object.entries(e.minStat)) {
        if ((state.stats[stat as StatName] || 0) < value) return false;
      }
    }
    // Max stat
    if (e.maxStat) {
      for (const [stat, value] of Object.entries(e.maxStat)) {
        if ((state.stats[stat as StatName] || 0) > value) return false;
      }
    }
    // Relation avec {ami}
    if (e.minAmiRelationship !== undefined) {
      if (state.amiRelationship < e.minAmiRelationship) return false;
    }
    return true;
  });
}

/**
 * Filtre les événements selon leurs prérequis (système d'arbre de déblocage).
 * Un event avec des prerequisites[] caché tant que toutes les conditions ne sont pas remplies.
 */
export function filterEventsByPrerequisites(
  events: AfflictionEvent[],
  state: GameState
): AfflictionEvent[] {
  // Collecte des IDs d'events déjà rencontrés dans le journal
  const answeredEventIds = new Set(state.answeredArcEventIds);
  // Versets débloqués dans le codex
  const unlockedVerses = new Set(
    Object.entries(state.codex)
      .filter(([, e]) => e.unlocked)
      .map(([id]) => id)
  );
  // Arcs complétés
  const completedArcIds = new Set(state.completedArcs.map(a => a.arcId));

  return events.filter((e) => {
    if (!e.prerequisites || e.prerequisites.length === 0) return true;
    return e.prerequisites.every((req) => {
      switch (req.kind) {
        case 'event_completed':
          return answeredEventIds.has(req.eventId);
        case 'event_succeeded':
          // Vérifie dans le journal si l'event a été réussi
          return state.journal.some(
            (j) => j.type === 'success' && j.text.includes(req.eventId.substring(0, 12))
          );
        case 'event_failed':
          // Vérifie dans le journal si l'event a échoué
          return state.journal.some(
            (j) => j.type === 'fail' && j.text.includes(req.eventId.substring(0, 12))
          );
        case 'verse_unlocked':
          return unlockedVerses.has(req.verseId);
        case 'arc_completed':
          return completedArcIds.has(req.arcId);
        case 'flag':
          // Branchement narratif (B) : le flag de conséquence doit valoir la valeur attendue.
          return (state.flags?.[req.flagId] ?? false) === (req.value ?? true);
        default:
          return true;
      }
    });
  });
}

/**
 * Prédicat de déverrouillage d'une étape d'arc (Ajustement A — branchement B).
 * Pur : ne dépend que de l'état. Une étape N>1 est ouverte si l'arc est en cours ET qu'UN
 * event répondu de cet arc était à la séquence N-1 — robuste aux variantes hors-spine (même
 * arcSequence, absentes de `eventIds`). Équivaut au déverrouillage par id positionnel pour les
 * arcs linéaires (un event par séquence). Les events hors-arc retournent false ; l'exclusion des
 * arcs déjà terminés reste à la charge de l'appelant.
 */
export function isArcStepUnlocked(state: GameState, e: AfflictionEvent): boolean {
  if (!e.storyArcId || !e.arcSequence) return false;
  // Séquence 1 : arc non encore commencé
  if (e.arcSequence === 1) {
    return !state.encounteredArcIds.includes(e.storyArcId);
  }
  // Séquence N > 1 : l'arc doit être en cours ET l'étape précédente avoir été répondue.
  if (!state.encounteredArcIds.includes(e.storyArcId)) return false;
  return (state.answeredArcEventIds ?? []).some((id) => {
    const ev = getEventById(id);
    return ev?.storyArcId === e.storyArcId && ev?.arcSequence === e.arcSequence! - 1;
  });
}

export function generateEvent(state: GameState): AfflictionEvent | null {
  // Correcteur de frustration (Système 2) — 3 fails consécutifs → event de grâce
  if (state.reliefActive) {
    const blessingPool = filterEventsByStats(getEventsForAge(state.age), state)
      .filter((e) => e.statImpactOnSuccess && !state.recentEventIds.includes(e.id));
    if (blessingPool.length > 0) {
      const relief = blessingPool[Math.floor(Math.random() * blessingPool.length)];
      const resolved = resolveEventForAge(relief, state.age);
      const withVariant = applyNarrativeVariant(resolved, state);
      const withCtx = applyLifeContextToEvent(withVariant, state);
      return { ...withCtx, title: `[Grâce] ${withCtx.title}` };
    }
  }

  // D'abord vérifier les cascades
  const cascadeEvents = getCascadeEventsForAge(
    state.queuedCascadeEvents,
    state.age
  );
  if (cascadeEvents.length > 0) {
    const cascade = cascadeEvents[0];
    const event = getEventById(cascade.eventId);
    if (event) {
      const ageResolved = resolveEventForAge(event, state.age);
      const withVariant = applyNarrativeVariant(ageResolved, state);
      const withCtx = applyLifeContextToEvent(withVariant, state);
      return { ...withCtx, title: `[Cascade] ${withCtx.title}` };
    }
  }

  // Événements disponibles pour l'âge + filtrés par stats + spawnProbability + prérequis
  const statFiltered = filterEventsByStats(getEventsForAge(state.age), state)
    .filter((e) => e.spawnProbability === undefined || Math.random() < e.spawnProbability);
  const available = filterEventsByPrerequisites(statFiltered, state);
  if (available.length === 0) return null;

  // Priorité aux arcs en cours — en respectant l'ordre séquentiel
  const completedArcEventIds = state.completedArcs
    .flatMap((a) => {
      const arc = getArcById(a.arcId);
      return arc ? arc.eventIds : [];
    });
  const remainingArcEvents = available.filter((e) => {
    if (!e.storyArcId || !e.arcSequence) return false;
    // Ignorer les événements des arcs déjà terminés
    if (completedArcEventIds.includes(e.id)) return false;
    // Déverrouillage séquentiel robuste aux variantes de branche (Ajustement A — voir helper).
    return isArcStepUnlocked(state, e);
  });

  // SRS: priorité aux versets avec erreurs
  const srsPriorities = getSrsPriorityVerses(state.codex);
  const srsEvents = available.filter((e) =>
    srsPriorities.includes(e.correctVerseId)
  );

  // Choix du pool: arcs non finis > SRS > tout
  const pool = remainingArcEvents.length > 0
    ? remainingArcEvents
    : srsEvents.length > 0
    ? srsEvents
    : available;

  // Sélection aléatoire — exclure les 5 événements récents si le pool le permet
  const deduped = pool.filter((e) => !state.recentEventIds.includes(e.id));
  const finalPool = deduped.length > 0 ? deduped : pool;

  // Garde-fou verset — éviter le même verset correct que les 20 dernières questions
  const verseDeduped = finalPool.filter((e) => !state.recentVerseIds?.includes(e.correctVerseId));
  const poolFinal = verseDeduped.length > 0 ? verseDeduped : finalPool;
  // Sélection pondérée (Système 1) — poids basés sur les stats + saison spirituelle
  const seasonMult = getSeasonMultipliers(state.spiritualSeason ?? 'Réveil');
  const weights = poolFinal.map((e) => computeEventWeight(e, state, seasonMult));
  const event = weightedPick(poolFinal, weights);

  // Dilemmes moraux (T-29) : pas de leurres de verset — résolution par acte, pas par verset.
  const isMoral = Array.isArray(event.moralChoices) && event.moralChoices.length > 0;
  const fullEvent = isMoral
    ? event
    : (() => {
        // Leurres frais — exclure les versets récents pour éviter les répétitions de faux choix
        const freshDecoys = pickDecoys(event.correctVerseId, event.category, 3, state.recentVerseIds ?? []);
        return {
          ...event,
          decoyVerseIds: freshDecoys.length >= 3 ? freshDecoys : event.decoyVerseIds,
        };
      })();

  // Appliquer la variante d'âge, puis la variante narrative
  const ageResolved = resolveEventForAge(fullEvent, state.age);
  const withVariant = applyNarrativeVariant(ageResolved, state);
  return applyLifeContextToEvent(withVariant, state);
}

/** Remplace les templates {ami}/{père}/{mère}/{ville}/{métier}/{église}/{conjoint} dans un event */
function applyLifeContextToEvent(event: AfflictionEvent, state: GameState): AfflictionEvent {
  const { lifeContext, parentNames } = state;
  const replace = (s: string) =>
    s
      .replace(/\{ami\}/g,      lifeContext.friendName)
      .replace(/\{ville\}/g,    lifeContext.city)
      .replace(/\{métier\}/g,   lifeContext.profession)
      .replace(/\{église\}/g,   lifeContext.churchName)
      .replace(/\{conjoint\}/g, lifeContext.spouseName)
      .replace(/\{père\}/g,     parentNames.father)
      .replace(/\{mère\}/g,     parentNames.mother);

  return {
    ...event,
    title:          replace(event.title),
    description:    replace(event.description),
    thematicFlavor: event.thematicFlavor ? replace(event.thematicFlavor) : event.thematicFlavor,
  };
}

/* ─── MODE DÉCOUVERTE ─── */

/**
 * Logique pure du mode découverte (T-17).
 * Révèle le verset et l'enregistre dans le codex, mais N'APPLIQUE AUCUN delta de stat.
 * Retourne le nouvel état et un marqueur `correct = true` (pour afficher le bon verset).
 */
export function applyDiscoveryChoice(
  state: GameState,
  chosenVerseId: string,
): {
  correct: boolean;
  correctVerse: { reference: string; text: string };
  newState: GameState;
} {
  const event = state.currentEvent;
  if (!event) throw new Error('Aucun événement actif en mode découverte');

  const verse = getVerseById(event.correctVerseId)!;
  const correct = chosenVerseId === event.correctVerseId;
  const newState = { ...state };
  const newCodex = { ...state.codex };

  // Marquer le verset comme vu (apprentissage) — toujours le bon verset, quelle que soit la réponse.
  newCodex[verse.id] = {
    ...(newCodex[verse.id] || { verseId: verse.id, unlocked: false, timesUsed: 0, errorCount: 0 }),
    unlocked: true,
    unlockedAtAge: newCodex[verse.id]?.unlockedAtAge ?? state.age,
    timesUsed: (newCodex[verse.id]?.timesUsed ?? 0) + 1,
  };

  newState.codex = newCodex;
  newState.lastEventResult = 'success'; // affiche le verset dans l'UI résultat

  // Journal : entrée distinctive sans conséquence de stats
  const choiceLabel = correct
    ? `Bonne réponse : ${verse.reference}`
    : `Réponse incorrecte — le verset était ${verse.reference}`;

  newState.journal = [
    ...state.journal,
    {
      age: state.age,
      text: `[DÉCOUVERTE] Mode entraînement — sans conséquence. ${choiceLabel}: "${verse.text}"`,
      type: 'milestone' as const,
      verseRef: verse.reference,
    },
  ];

  // Fenêtre glissante : mise à jour pour éviter la répétition immédiate
  const R = CONFIG.recentSlots;
  newState.recentEventIds = [event.id, ...state.recentEventIds.slice(0, R - 1)];
  const allVerseIds = [verse.id, ...event.decoyVerseIds];
  newState.recentVerseIds = [
    ...allVerseIds,
    ...(state.recentVerseIds ?? []).slice(0, R - allVerseIds.length),
  ];

  return {
    correct: true, // toujours afficher comme "succès" pour révéler le verset
    correctVerse: { reference: verse.reference, text: verse.text },
    newState,
  };
}

/* ─── VALIDATION ─── */

export function validateChoice(
  state: GameState,
  chosenVerseId: string,
  timeToAnswer: number = 0
): {
  correct: boolean;
  correctVerse: { reference: string; text: string };
  newState: GameState;
} {
  // Mode découverte (T-17) : entraînement sans conséquence de stats.
  if (state.discoveryMode) {
    return applyDiscoveryChoice(state, chosenVerseId);
  }

  const event = state.currentEvent;
  if (!event) throw new Error('Aucun événement actif');

  const correct = chosenVerseId === event.correctVerseId;
  const verse = getVerseById(event.correctVerseId)!;
  const newState = { ...state };
  const newStats = { ...state.stats };
  const newFlow = { ...state.flow };
  const newCodex = { ...state.codex };
  // Signal pour le trait « L'Éprouvé » : victoire après ≥3 échecs consécutifs.
  const brokeThenRose = correct && (state.consecutiveFails ?? 0) >= 3;

  if (correct) {
    // === SUCCÈS ===

    // État du verset AVANT déblocage — pour célébrer son entrée au Grimoire (itér. 16).
    const wasUnlocked = state.codex[verse.id]?.unlocked ?? false;

    // Correcteur de frustration (Système 2) — réinitialiser le compteur de fails
    newState.consecutiveFails = 0;
    newState.reliefActive = false;

    // Flow gain avec Time-to-Answer
    const flowGain = calculateFlowGain(timeToAnswer);
    newFlow.value = Math.min(100, newFlow.value + flowGain);
    newFlow.palier = getFlowPalier(newFlow.value);
    newFlow.timeToAnswer = timeToAnswer;

    // Stats bonus (x palier multiplier)
    const multiplier = FLOW_PALIER_BONUS[newFlow.palier];
    for (const [stat, impact] of Object.entries(verse.statImpact)) {
      newStats[stat as StatName] = Math.min(
        MAX_STAT,
        (newStats[stat as StatName] || 0) + Math.round(impact * multiplier)
      );
    }

    // Bonus événement bénédiction
    if (event.statImpactOnSuccess) {
      for (const [stat, val] of Object.entries(event.statImpactOnSuccess)) {
        if (val !== undefined) {
          newStats[stat as StatName] = Math.min(
            MAX_STAT,
            (newStats[stat as StatName] || 0) + val
          );
        }
      }
    }

    // Combo
    newState.combo = state.combo + 1;
    newState.maxCombo = Math.max(newState.maxCombo, newState.combo);

    // Bonus combo — paliers progressifs (depuis balance.json)
    const ct = CONFIG.combo.thresholds as Record<string, Record<string, number>>;
    if (ct[String(newState.combo)]) {
      const bonus = ct[String(newState.combo)];
      for (const [stat, val] of Object.entries(bonus)) {
        newStats[stat as StatName] = Math.min(MAX_STAT, newStats[stat as StatName] + val);
      }
      newState.journal = [...(newState.journal || state.journal), {
        age: state.age,
        text: `[COMBO x${newState.combo}] Bonus : ${Object.entries(bonus).map(([s, v]) => `${s} +${v}`).join(', ')}`,
        type: 'milestone' as const,
      }];
    } else if (newState.combo > 0 && newState.combo % CONFIG.combo.repeatEvery === 0) {
      // Paliers suivants : bonus répété
      const rb = CONFIG.combo.repeatBonus as Record<string, number>;
      for (const [stat, val] of Object.entries(rb)) {
        newStats[stat as StatName] = Math.min(MAX_STAT, newStats[stat as StatName] + val);
      }
    }

    // Codex: débloquer le verset
    newCodex[verse.id] = {
      ...(newCodex[verse.id] || { verseId: verse.id, unlocked: false, timesUsed: 0, errorCount: 0 }),
      unlocked: true,
      unlockedAtAge: newCodex[verse.id]?.unlockedAtAge || state.age,
      timesUsed: (newCodex[verse.id]?.timesUsed || 0) + 1,
    };

    newState.lastEventResult = 'success';
    // ...newState.journal (pas state.journal) — sinon l'entrée bonus [COMBO xN] posée juste
    // au-dessus serait écrasée et le bonus, bien qu'appliqué aux stats, n'apparaîtrait jamais.
    newState.journal = [
      ...newState.journal,
      {
        age: state.age,
        text: `[VICTOIRE] "${event.title}" surmonté par ${verse.reference}: "${verse.text}" (COMBO:${newState.combo})`,
        type: 'success',
        verseRef: verse.reference,
      },
    ];

    // Récompense de collection (itér. 16) : un verset qui REJOINT le Grimoire (1ʳᵉ fois)
    // est célébré, du tout premier au corpus complet — la promesse de l'onboarding rendue
    // tangible. `...newState.journal` pour survivre (le bloc précédent rebâtit le journal).
    if (!wasUnlocked) {
      newState.journal = [
        ...newState.journal,
        {
          age: state.age,
          text: collectionRewardText(verse.reference, countUnlocked(newCodex), VERSE_DATABASE.length),
          type: 'milestone' as const,
        },
      ];
    }

    // Flags de conséquence (B) : le succès pose les flags déclarés → branchement narratif.
    if (event.setsFlagsOnSuccess?.length) {
      newState.flags = {
        ...(state.flags ?? {}),
        ...Object.fromEntries(event.setsFlagsOnSuccess.map((f) => [f, true])),
      };
    }

    // Arc narratif: tracker complétion (la rencontre est tracée plus bas, hors du bloc correct)
    if (event.storyArcId && event.arcSequence) {
      const arc = getArcById(event.storyArcId);
      if (arc && event.arcSequence === arc.eventIds.length) {
        newState.completedArcs = [
          ...state.completedArcs,
          { arcId: event.storyArcId, completedAtAge: state.age },
        ];
        newState.journal = [
          ...newState.journal,
          {
            age: state.age,
            text: `[ARC_COMPLET] ${arc.name} — "${arc.description}"`,
            type: 'milestone',
          },
        ];
      }
    }

    newFlow.burnoutRate = calculateBurnoutRate(newFlow.palier);
    if (newFlow.burnoutRate > 0) {
      newStats.physique = Math.max(
        MIN_STAT,
        newStats.physique - newFlow.burnoutRate
      );
    }
  } else {
    // === ÉCHEC ===

    // Correcteur de frustration (Système 2) — incrémenter le compteur de fails
    const newConsecutiveFails = (state.consecutiveFails ?? 0) + 1;
    newState.consecutiveFails = newConsecutiveFails;
    newState.reliefActive = newConsecutiveFails >= 3;

    // Flow: pénalité asymétrique
    newFlow.value = calculateFlowPenalty(newFlow.value);
    newFlow.palier = getFlowPalier(newFlow.value);

    // Stats: malus avec softening progressif après 2 fails consécutifs
    const softening = newConsecutiveFails >= 2 ? 0.75 : 1.0;
    for (const [stat, impact] of Object.entries(event.statImpactOnFail)) {
      const adjustedImpact = Math.round(impact * softening);
      newStats[stat as StatName] = Math.max(
        MIN_STAT,
        (newStats[stat as StatName] || 0) + adjustedImpact
      );
    }

    // Grâce de crise : si une stat a touché 0 et qu'il reste des grâces
    const { stats: gracedStats, newCrises, crisisMessage } = applyCrisisGrace(state, newStats);
    Object.assign(newStats, gracedStats);
    newState.crisesRemaining = newCrises;
    if (crisisMessage) {
      newState.journal = [
        ...state.journal,
        { age: state.age, text: crisisMessage, type: 'cascade' as const },
      ];
    }

    // Combo reset
    newState.combo = 0;
    newState.lastEventResult = 'fail';

    // Codex: enregistrer l'erreur
    newCodex[verse.id] = {
      ...(newCodex[verse.id] || { verseId: verse.id, unlocked: false, timesUsed: 0, errorCount: 0 }),
      errorCount: (newCodex[verse.id]?.errorCount || 0) + 1,
      lastErrorAge: state.age,
    };

    // SRS: ajouter aux versets échoués
    newState.failedVerseIds = [
      ...new Set([...state.failedVerseIds, event.correctVerseId]),
    ];

    // Cascade: programmer l'événement dérivé
    const newQueued = [...state.queuedCascadeEvents];
    if (event.cascadeEventId) {
      const cascadeEvent = getEventById(event.cascadeEventId);
      if (cascadeEvent) {
        newQueued.push({
          eventId: event.cascadeEventId,
          triggerAge: state.age + 1,
          sourceEventTitle: event.title,
        });
        newState.journal = [
          ...state.journal,
          {
            age: state.age,
            text: `[CASCADE] "${cascadeEvent.title}" se prépare l'année prochaine...`,
            type: 'cascade',
          },
        ];
      }
    }

    newState.queuedCascadeEvents = newQueued;

    newState.journal = [
      ...newState.journal,
      {
        age: state.age,
        text: `[ECHEC] "${event.title}" — Le verset était ${verse.reference}: "${verse.text}"`,
        type: 'fail',
        verseRef: verse.reference,
      },
    ];

    // Flags de conséquence (B) : l'échec peut ouvrir une autre branche (jamais un « mauvais » flag punitif).
    if (event.setsFlagsOnFail?.length) {
      newState.flags = {
        ...(state.flags ?? {}),
        ...Object.fromEntries(event.setsFlagsOnFail.map((f) => [f, true])),
      };
    }
  }

  // Burnout rate update
  newFlow.burnoutRate = calculateBurnoutRate(newFlow.palier);

  // Tracker rencontre d'arc (success OU fail) — permet à l'event suivant de l'arc d'apparaître
  if (event.storyArcId && event.arcSequence) {
    if (!state.encounteredArcIds.includes(event.storyArcId)) {
      newState.encounteredArcIds = [...state.encounteredArcIds, event.storyArcId];
    }
    const existing = state.answeredArcEventIds ?? [];
    if (!existing.includes(event.id)) {
      newState.answeredArcEventIds = [...existing, event.id];
    }
  }

const R = CONFIG.recentSlots;

  // Fenêtre glissante des événements récents
  newState.recentEventIds = [
    event.id,
    ...state.recentEventIds.slice(0, R - 1),
  ];

  // Fenêtre glissante des versets récents (correct + leurres)
  const allVerseIds = [verse.id, ...event.decoyVerseIds];
  newState.recentVerseIds = [
    ...allVerseIds,
    ...(state.recentVerseIds ?? []).slice(0, R - allVerseIds.length),
  ];

  newState.stats = newStats;
  newState.flow = newFlow;
  newState.codex = newCodex;
  newState.totalEvents = state.totalEvents + 1;
  const successes = newState.journal.filter((j) => j.type === 'success').length;
  newState.successRate = Math.round((successes / newState.totalEvents) * 100);

  // Traits gagnés en cours de vie — évalués sur l'état mis à jour.
  const awards = evaluateTraitAwards(newState, { brokeThenRose });
  if (awards.length > 0) {
    newState.traits = [
      ...(state.traits ?? []),
      ...awards.map((t) => ({ id: t.id, earnedAtAge: state.age })),
    ];
    const traitStats = { ...newState.stats };
    for (const t of awards) {
      if (t.gainBonus) {
        for (const [s, v] of Object.entries(t.gainBonus)) {
          traitStats[s as StatName] = Math.min(MAX_STAT, (traitStats[s as StatName] || 0) + (v ?? 0));
        }
      }
      newState.journal = [
        ...newState.journal,
        { age: state.age, text: `[TRAIT] ${state.playerName} devient « ${t.name} » — ${t.description}`, type: 'milestone' as const },
      ];
    }
    newState.stats = traitStats;
  }

  return {
    correct,
    correctVerse: { reference: verse.reference, text: verse.text },
    newState,
  };
}

/* ─── ACTIONS VOLONTAIRES ─── */

export type ActionEffect = {
  newState: GameState;
  label: string;
};

const ACTION_EFFECTS: Record<string, (s: GameState) => { statDelta: Partial<Record<string, number>>; label: string; amiDelta?: number }> = {
  pray:        () => ({ statDelta: { foi: 4, paix: 1 },        label: 'Temps de prière — Foi +4, Paix +1' }),
  fast:        () => ({ statDelta: { foi: 5, physique: -2 },   label: 'Jeûne — Foi +5, Corps -2' }),
  serve:       (s) => ({ statDelta: { paix: 4, finances: 1 },  label: `Service à ${s.lifeContext.churchName} — Paix +4, Finances +1` }),
  call_friend: (s) => {
    const count = s.callFriendCount || 0;
    let extraPaix = 0;
    let extraAmi = 0;
    let note = '';
    // Paliers de bonus passifs (depuis balance.json)
    const paliers = CONFIG.ami.paliers as Record<string, { extraPaix: number; extraAmi: number }>;
    const sortedKeys = Object.keys(paliers).map(Number).sort((a, b) => b - a);
    for (const threshold of sortedKeys) {
      if (count >= threshold) {
        extraPaix = paliers[String(threshold)].extraPaix;
        extraAmi = paliers[String(threshold)].extraAmi;
        note = ` (Ami fidèle ×${threshold / 5} — ${threshold}e appel)`;
        break;
      }
    }
    return {
      statDelta: { paix: 3 + extraPaix },
      label: `Appel à ${s.lifeContext.friendName} — Paix ${3 + extraPaix}${note}`,
      amiDelta: 8 + extraAmi,
    };
  },
  read_word:   () => ({ statDelta: { foi: 3, paix: 1 },        label: 'Lecture de la Parole — Foi +3, Paix +1' }),
  work:        () => ({ statDelta: { finances: 5, physique: -1 }, label: 'Travail honnête — Finances +5, Corps -1' }),
};

export function applyPlayerAction(
  state: GameState,
  action: import('../types/game').PlayerAction
): ActionEffect | null {
  if (state.actionPoints <= 0) return null;

  const effectFn = ACTION_EFFECTS[action];
  if (!effectFn) return null;

  const { statDelta, label, amiDelta } = effectFn(state);
  const newStats = { ...state.stats };

  // Comptage des actions consécutives du même type
  const consecutiveSameType = state.actionsThisYear.filter((a) => a === action).length + 1;
  let fidelityMultiplier = 1;
  let multiNote = '';
  if (action === 'pray') {
    if (consecutiveSameType >= 5) {
      fidelityMultiplier = 2;
      multiNote = ' (Fidélité ×2 — 5e prière)';
    } else if (consecutiveSameType >= 3) {
      fidelityMultiplier = 1.5;
      multiNote = ' (Fidélité ×1.5 — 3e prière)';
    }
  }

  for (const [stat, val] of Object.entries(statDelta)) {
    const k = stat as keyof typeof newStats;
    newStats[k] = Math.min(
      MAX_STAT,
      Math.max(MIN_STAT, (newStats[k] || 0) + Math.round((val ?? 0) * fidelityMultiplier))
    );
  }

  const journalEntry: import('../types/game').JournalEntry = {
    age: state.age,
    text: label + multiNote,
    type: 'micro',
  };

  return {
    label: label + multiNote,
    newState: {
      ...state,
      stats: newStats,
      actionPoints: state.actionPoints - 1,
      actionsThisYear: [...state.actionsThisYear, action],
      callFriendCount: action === 'call_friend'
        ? (state.callFriendCount ?? 0) + 1
        : (state.callFriendCount ?? 0),
      amiRelationship: amiDelta
        ? Math.min(100, state.amiRelationship + amiDelta)
        : state.amiRelationship,
      journal: [...state.journal, journalEntry],
    },
  };
}

/* ─── VIEILLISSEMENT ─── */

export function advanceAge(state: GameState): {
  newState: GameState;
  eventGenerated: boolean;
} {
  const newState = { ...state };
  const newStats = { ...state.stats };
  const newAge = state.age + 1;

  newState.age = newAge;
  newState.phase = 'idle';
  newState.currentEvent = null;
  newState.lastEventResult = null;
  // Reset actions volontaires — palier senior à 60 ans
  newState.actionPoints = newAge >= CONFIG.actionPoints.seniorMinAge
    ? CONFIG.actionPoints.seniorPoints
    : CONFIG.actionPoints.standard;
  newState.actionsThisYear = [];

  // Révélations de capacités (« l'univers s'étend ») — annonce des paliers franchis.
  const reveals = revealsAtAge(newAge);
  if (reveals.length > 0) {
    newState.journal = [
      ...newState.journal,
      ...reveals.map((r) => ({ age: newAge, text: personalize(r.text, newState.playerName), type: 'milestone' as const })),
    ];
  }

  // Retirer les cascades déclenchées
  newState.queuedCascadeEvents = state.queuedCascadeEvents.filter(
    (q) => q.triggerAge !== newAge
  );

  // Dépenses financières par âge (Système d'argent)
  const fc = CONFIG.aging.financeCost;
  if (newAge >= fc.youngAdult.minAge && newAge <= fc.youngAdult.maxAge) {
    newStats.finances = Math.max(MIN_STAT, newStats.finances - fc.youngAdult.cost);
  } else if (newAge >= fc.adult.minAge && newAge <= fc.adult.maxAge) {
    newStats.finances = Math.max(MIN_STAT, newStats.finances - fc.adult.cost);
  } else if (newAge >= fc.midlife.minAge && newAge <= fc.midlife.maxAge) {
    newStats.finances = Math.max(MIN_STAT, newStats.finances - fc.midlife.cost);
  }

  // Pénalité de vieillissement
  if (newAge >= CONFIG.aging.physiqueDeclineStart) {
    newStats.physique = Math.max(MIN_STAT, newStats.physique - CONFIG.aging.physiqueDeclineRate);
  }
  if (newAge >= CONFIG.aging.paixDeclineStart) {
    newStats.physique = Math.max(MIN_STAT, newStats.physique - CONFIG.aging.physiqueDeclineRateOld);
    newStats.paix     = Math.max(MIN_STAT, newStats.paix     - CONFIG.aging.paixDeclineRate);
  }

  // Introduction de l'ami d'enfance
  if (!state.friendIntroduced && newAge >= CONFIG.ami.friendIntroAge) {
    newState.friendIntroduced = true;
    newState.journal = [
      ...(newState.journal ?? state.journal),
      {
        age: newAge,
        text: `[AMI] Tu as grandi avec ${state.lifeContext.friendName}. Une amitié sincère est née au fil des années.`,
        type: 'milestone' as const,
      },
    ];
  }

  // Decay naturel — pression de fond (évite mid-game trop facile)
  // Foi : -1 tous les 2 ans à partir de 20 ans (vie adulte demande de nourrir sa foi)
  if (newAge >= 20 && newAge % 2 === 0) {
    newStats.foi = Math.max(1, newStats.foi - 1);  // floor à 1 — decay seul ne tue pas
  }
  // Paix : -1 tous les 2 ans à partir de 25 ans (pression et responsabilités de la vie)
  if (newAge >= 25 && newAge % 2 === 0) {
    newStats.paix = Math.max(1, newStats.paix - 1);
  }

  // Decay de l'amitié (Système 4) — perte par an sans contact, plancher
  const ami = CONFIG.ami;
  const usedCallFriend = state.actionsThisYear.includes('call_friend');
  if (!usedCallFriend && newAge >= ami.decayStartAge) {
    newState.amiRelationship = Math.max(ami.floor, (state.amiRelationship ?? 50) - ami.decayPerYear);
  }
  // Streak de froideur — journal si N années consécutives sous le seuil
  if (newState.amiRelationship < ami.streakThreshold) {
    newState.amiDecayStreak = (state.amiDecayStreak ?? 0) + 1;
    if (newState.amiDecayStreak >= ami.streakAlertAfter) {
      newState.journal = [
        ...newState.journal,
        {
          age: newAge,
          text: `[AMI] Tu réalises que tu n'as pas eu de vraies nouvelles de ${state.lifeContext.friendName} depuis longtemps. Le silence s'est installé.`,
          type: 'cascade' as const,
        },
      ];
    }
  } else {
    newState.amiDecayStreak = 0;
  }

  // Transition de saison ÉMERGENTE (Système 3) — re-roll aux paliers de décennie,
  // piloté par l'état d'Élias + l'Appel + le seed de run (trajectoire unique par partie).
  if (newAge >= 10 && newAge % 10 === 0) {
    const seasonRng = mulberry32(((state.seed ?? 0) ^ Math.imul(newAge, 0x9e3779b1)) >>> 0);
    const newSeason = computeSeasonTransition(
      { ...newState, stats: newStats },
      newAge,
      seasonRng,
    );
    if (newSeason !== (state.spiritualSeason ?? 'Réveil')) {
      newState.spiritualSeason = newSeason;
      const s = SPIRITUAL_SEASONS[newSeason];
      newState.journal = [
        ...(newState.journal ?? state.journal),
        {
          age: newAge,
          text: `[SAISON] ${s.label} — ${s.description}`,
          type: 'milestone' as const,
        },
      ];
    }
  }

  // Chapitres de vie (T-24) — carte d'intro de décennie (bornes 10, 20, …, 90 ans)
  if (isDecadeStart(newAge)) {
    const currentSeason = newState.spiritualSeason ?? state.spiritualSeason ?? 'Réveil';
    const chapterIntro = getChapterIntro(newAge, currentSeason, state.calling?.id);
    newState.journal = [
      ...(newState.journal ?? state.journal),
      chapterIntro,
    ];
  }

  // Cliffhanger de fin de décennie (âges 9, 19, 29, …, 89)
  if (isDecadeEnd(newAge)) {
    const cliffhanger = getDecadeCliffhanger(newAge, newState.playerName);
    if (cliffhanger) {
      newState.journal = [
        ...(newState.journal ?? state.journal),
        cliffhanger,
      ];
    }
  }

  // Flow décroît naturellement si inactif (phase = 'idle' à ce stade — cf. plus haut)
  if (newState.flow.value > 0) {
    newState.flow = {
      ...newState.flow,
      value: Math.max(0, newState.flow.value - 2),
      palier: getFlowPalier(Math.max(0, newState.flow.value - 2)),
    };
  }

  newState.difficulty = getDifficultyForAge(newAge);

  // Recharge d'une grâce aux jalons de vie (25, 50, 75 ans)
  if ([25, 50, 75].includes(newAge) && newState.crisesRemaining < 2) {
    newState.crisesRemaining = Math.min(2, newState.crisesRemaining + 1);
  }

  // Journal milestones
  const ageEvents: string[] = [];
  const name = newState.playerName;
  if (newAge === 0)  ageEvents.push(`[NAISSANCE] ${name} vient de naître.`);
  if (newAge === 15) ageEvents.push(`[JALON] ${name} entre dans l'adolescence. Les premiers choix commencent.`);
  if (newAge === 25) ageEvents.push(`[JALON] ${name} prend sa vie en main. Le combat intérieur s'intensifie.`);
  if (newAge === 30) ageEvents.push('[JALON] 30 ans. La vie forge ce que la foi doit porter. Les fondations se testent.');
  if (newAge === 40) ageEvents.push('[JALON] 40 ans. Le corps commence à parler. Ce qui était acquis doit être renouvelé.');
  if (newAge === 50) ageEvents.push('[JALON] 50 ans. Ce qui comptait avant compte moins. Ce qui était flou devient clair.');
  if (newAge === 60) ageEvents.push(`[JALON] 60 ans. ${name} marche vers la sagesse. Les dernières grandes batailles approchent.`);
  if (newAge === 80) ageEvents.push('[JALON] Les dernières forteresses tombent. Le Prodige achève sa course.');

  if (ageEvents.length > 0) {
    newState.journal = [
      ...state.journal,
      ...ageEvents.map(
        (text): JournalEntry => ({ age: newAge, text, type: 'milestone' })
      ),
    ];
  }

  newState.stats = newStats;

  // Générer un événement
  const hasCascade = newState.queuedCascadeEvents.some(
    (q) => q.triggerAge === newAge
  );
  // Pas d'épreuves interactives avant l'âge configuré
  const shouldGenerate =
    newAge >= CONFIG.firstEventAge &&
    (hasCascade || Math.random() < CONFIG.eventChancePerYear || state.failedVerseIds.length > 0);

  let eventGenerated = false;
  if (shouldGenerate) {
    const event = generateEvent(newState);
    if (event) {
      // Bulle de rappel causale (T-22) : si cet event est conditionné par un choix passé,
      // injecter une entrée de journal AVANT l'épreuve pour rendre le lien visible.
      const echoEntry = buildEchoLinkEntry(event, newState);
      if (echoEntry) {
        newState.journal = [...newState.journal, echoEntry];
      }
      // Progression de difficulté par verset (Design V2) :
      // le questionType peut être surclassé selon la maîtrise du joueur avec ce verset.
      const resolvedType = !event.moralChoices
        ? resolveQuestionType(event.correctVerseId, newState.codex, event.questionType)
        : undefined;
      newState.currentEvent = resolvedType
        ? { ...event, questionType: resolvedType }
        : event;
      newState.phase = 'event';
      eventGenerated = true;
    }
  }

  // Micro-événements passifs (indépendants des épreuves)
  if (Math.random() < CONFIG.microEventChance) {
    const micro = getMicroEventForAge(newAge, state.parentNames, state.lifeContext);
    if (micro) {
      newState.journal = [
        ...newState.journal,
        { age: newAge, text: micro.text, type: 'micro' },
      ];
      if (micro.statBonus) {
        const ns = { ...newState.stats };
        for (const [stat, val] of Object.entries(micro.statBonus)) {
          ns[stat as StatName] = Math.min(
            MAX_STAT,
            Math.max(MIN_STAT, (ns[stat as StatName] || 0) + (val ?? 0))
          );
        }
        newState.stats = ns;
      }
    }
  }

  return { newState, eventGenerated };
}

/* ─── MÉTRIQUES DE FIN ─── */

export function computeFinalMetrics(state: GameState, causeReason?: string): RunMetrics {
  // Catégorie dominante depuis les erreurs du codex
  let dominantCategory: AfflictionCategory | null = null;
  let maxErrors = 0;
  for (const entry of Object.values(state.codex)) {
    if (entry.errorCount > maxErrors) {
      maxErrors = entry.errorCount;
      const verse = getVerseById(entry.verseId);
      if (verse) dominantCategory = verse.category;
    }
  }

  // Cause de mort : stat tombée à 0 ou victoire
  let causeOfDeath: string | null = null;
  if (causeReason && causeReason !== 'victory') {
    causeOfDeath = causeReason;
  } else if (state.age < MAX_AGE) {
    for (const [stat, value] of Object.entries(state.stats)) {
      if (value <= 0) {
        causeOfDeath = `La jauge de ${stat.toUpperCase()} est tombée à zéro.`;
        break;
      }
    }
  }

  const unlocked = Object.values(state.codex).filter((c) => c.unlocked).length;

  return {
    ageAtDeath: state.age,
    totalEvents: state.totalEvents,
    successRate: state.successRate,
    maxCombo: state.maxCombo,
    maxFlow: state.flow.value,
    dominantCategory,
    totalVersesUnlocked: unlocked,
    causeOfDeath,
  };
}

export function determineTitle(metrics: RunMetrics): Title | null {
  const eligible = TITLES.filter((t) => t.condition(metrics));
  if (eligible.length === 0) return null;
  eligible.sort((a, b) => b.priority - a.priority);
  return eligible[0];
}
