import type {
  GameState,
  AfflictionEvent,
  StatName,
  DifficultyLevel,
  JournalEntry,
  FlowPalier,
  FlowState,
  CodexEntry,
  Title,
  Inheritance,
  RunMetrics,
  QueuedCascade,
  LifeContext,
} from '../types/game';
import { getEventsForAge, assignDecoys, getEventById, resolveEventForAge } from '../data/events';
import { getVerseById, VERSE_DATABASE } from '../data/verses';
import { getArcById } from '../data/storyArcs';
import { getMicroEventForAge } from '../data/microEvents';

const MAX_STAT = 100;
const MIN_STAT = 0;
const MAX_AGE = 100;

/* ─── JAUGE DE FLOW ─── */

const FLOW_PALIER_THRESHOLDS: Record<FlowPalier, [number, number]> = {
  1: [0, 33],
  2: [34, 66],
  3: [67, 100],
};

const FLOW_GAIN_BASE = 10;
const FLOW_MAX_TIME = 15; // secondes max pour répondre
const FLOW_PALIER_BONUS: Record<FlowPalier, number> = {
  1: 1.0,
  2: 1.5,
  3: 2.5,
};

/** Détermine le palier de Flow à partir de la valeur */
export function getFlowPalier(value: number): FlowPalier {
  if (value <= 33) return 1;
  if (value <= 66) return 2;
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
  if (palier === 3) return 66; // retombe en début de palier 2
  if (palier === 2) return 33; // retombe en début de palier 1
  return 0; // déjà au palier 1, retombe à 0
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

function generateParentNames(): { father: string; mother: string } {
  return {
    father: FATHER_NAMES[Math.floor(Math.random() * FATHER_NAMES.length)],
    mother: MOTHER_NAMES[Math.floor(Math.random() * MOTHER_NAMES.length)],
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

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateLifeContext(): LifeContext {
  return {
    friendName: pickRandom(FRIEND_NAMES),
    city:       pickRandom(CITIES),
    profession: pickRandom(PROFESSIONS),
    churchName: pickRandom(CHURCH_NAMES),
    spouseName: pickRandom(SPOUSE_NAMES),
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

function pickBirthProfile(): BirthProfile {
  const totalWeight = BIRTH_PROFILES.reduce((s, p) => s + p.weight, 0);
  let r = Math.random() * totalWeight;
  for (const profile of BIRTH_PROFILES) {
    r -= profile.weight;
    if (r <= 0) return profile;
  }
  return BIRTH_PROFILES[0];
}

function randomInRange([min, max]: [number, number]): number {
  return Math.floor(min + Math.random() * (max - min));
}

export function generateBirthStats(): {
  stats: Record<StatName, number>;
  profileName: string;
} {
  const profile = pickBirthProfile();
  const stats: Record<StatName, number> = {
    foi: randomInRange(profile.stats.foi),
    paix: randomInRange(profile.stats.paix),
    physique: randomInRange(profile.stats.physique),
    finances: randomInRange(profile.stats.finances),
  };
  return { stats, profileName: profile.name };
}

/* ─── TITRES ET HÉRITAGE ─── */

export const TITLES: Title[] = [
  {
    id: 'prodige',
    name: 'Le Prodige',
    description: 'Atteint 100 ans avec les 4 jauges > 50%',
    condition: (m) => m.ageAtDeath >= 100 && m.successRate >= 60,
    bonus: { foi: 5, paix: 5 },
  },
  {
    id: 'combattant',
    name: 'Le Combattant',
    description: 'A survécu à 30+ événements avec un taux > 70%',
    condition: (m) => m.totalEvents >= 30 && m.successRate >= 70,
    bonus: { physique: 5, foi: 3 },
  },
  {
    id: 'sage',
    name: 'Le Sage',
    description: 'A débloqué 30+ versets dans le Codex',
    condition: (m) => m.totalVersesUnlocked >= 30,
    bonus: { paix: 5, foi: 3 },
  },
  {
    id: 'fervent',
    name: 'Le Fervent',
    description: 'A atteint le Flow max (100) au moins une fois',
    condition: (m) => m.maxFlow >= 100,
    bonus: { foi: 8 },
  },
  {
    id: 'anakazo',
    name: 'L\'Anakazo',
    description: 'Combo max ≥ 10',
    condition: (m) => m.maxCombo >= 10,
    bonus: { physique: 3, finances: 3 },
  },
  {
    id: 'star',
    name: 'La Star',
    description: 'Taux de réussite > 85%',
    condition: (m) => m.successRate > 85 && m.totalEvents >= 15,
    bonus: { foi: 4, paix: 4, finances: 4 },
  },
  {
    id: 'survivant',
    name: 'Le Survivant',
    description: 'A survécu à 5+ événements en cascade',
    condition: (m) => m.causeOfDeath === null && m.totalEvents >= 20,
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

export function createInitialState(inheritance?: Inheritance): GameState {
  const { stats, profileName } = generateBirthStats();
  const parentNames = generateParentNames();
  const lifeContext = generateLifeContext();
  const state: GameState = {
    age: 0,
    profileName,
    parentNames,
    lifeContext,
    actionPoints: 2,
    actionsThisYear: [],
    amiRelationship: 50,
    crisesRemaining: 2,
    stats: inheritance?.bonus
      ? {
          foi: Math.min(100, stats.foi + (inheritance.bonus.foi || 0)),
          paix: Math.min(100, stats.paix + (inheritance.bonus.paix || 0)),
          physique: Math.min(100, stats.physique + (inheritance.bonus.physique || 0)),
          finances: Math.min(100, stats.finances + (inheritance.bonus.finances || 0)),
        }
      : stats,
    difficulty: 1,
    flow: { value: 33, palier: 1, timeToAnswer: 0, burnoutRate: 0 },
    combo: 0,
    maxCombo: 0,
    journal: [
      {
        age: 0,
        text: `Élias est né à ${lifeContext.city}. Ses parents : ${parentNames.father} et ${parentNames.mother}. Profil: ${profileName}. Il deviendra ${lifeContext.profession}.${
          inheritance?.title
            ? ` Héritage: "${inheritance.title.name}" (bonus actif).`
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
  if (palier === 3) return 3; // -3 physique par tour
  if (palier === 2) return 1; // -1 physique par tour
  return 0;
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
    if (val <= 0 && newCrises > 0) {
      corrected[key as StatName] = 3;
      newCrises--;
      const label = STAT_LABELS[key] ?? key;
      crisisMessage = `[CRISE] La jauge de ${label} a touché zéro. Une grâce divine a relevé Élias (${newCrises} grâce${newCrises !== 1 ? 's' : ''} restante${newCrises !== 1 ? 's' : ''}).`;
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
    if (c.type === 'birth_profile') {
      if (state.profileName === c.profileName) {
        return { ...event, title: variant.title, description: variant.description };
      }
    } else if (c.type === 'stat_check' && c.stat && c.operator && c.value !== undefined) {
      const statValue = state.stats[c.stat];
      const match =
        (c.operator === 'gt' && statValue > c.value) ||
        (c.operator === 'lt' && statValue < c.value) ||
        (c.operator === 'gte' && statValue >= c.value) ||
        (c.operator === 'lte' && statValue <= c.value);
      if (match) {
        return { ...event, title: variant.title, description: variant.description };
      }
    }
  }
  return event;
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

export function generateEvent(state: GameState): AfflictionEvent | null {
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

  // Événements disponibles pour l'âge + filtrés par stats + spawnProbability
  const available = filterEventsByStats(getEventsForAge(state.age), state)
    .filter((e) => e.spawnProbability === undefined || Math.random() < e.spawnProbability);
  if (available.length === 0) return null;

  // Priorité aux arcs déjà commencés
  const arcEventIds = state.completedArcs
    .flatMap((a) => {
      const arc = getArcById(a.arcId);
      return arc ? arc.eventIds : [];
    });
  const remainingArcEvents = available.filter(
    (e) => e.storyArcId && !arcEventIds.includes(e.id)
  );

  // SRS: priorité aux versets avec erreurs
  const srsPriorities = getSrsPriorityVerses(state.codex);
  const srsEvents = available.filter((e) =>
    srsPriorities.includes(e.correctVerseId)
  );

  // Choix du pool: arcs non finis > SRS > tout
  let pool = remainingArcEvents.length > 0
    ? remainingArcEvents
    : srsEvents.length > 0
    ? srsEvents
    : available;

  // Sélection aléatoire — exclure les 5 événements récents si le pool le permet
  const deduped = pool.filter((e) => !state.recentEventIds.includes(e.id));
  const finalPool = deduped.length > 0 ? deduped : pool;
  const event = finalPool[Math.floor(Math.random() * finalPool.length)];
  const allDecoys = assignDecoys();
  const fullEvent = allDecoys.find((e) => e.id === event.id) || event;

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
  const event = state.currentEvent;
  if (!event) throw new Error('Aucun événement actif');

  const correct = chosenVerseId === event.correctVerseId;
  const verse = getVerseById(event.correctVerseId)!;
  const newState = { ...state };
  const newStats = { ...state.stats };
  const newFlow = { ...state.flow };
  const newCodex = { ...state.codex };

  if (correct) {
    // === SUCCÈS ===

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

    // Bonus combo — paliers progressifs
    if (newState.combo === 5) {
      newStats.foi  = Math.min(MAX_STAT, newStats.foi + 3);
      newStats.paix = Math.min(MAX_STAT, newStats.paix + 2);
      newState.journal = [...(newState.journal || state.journal), { age: state.age, text: '[COMBO x5] Ferveur montante — Foi +3, Paix +2', type: 'milestone' as const }];
    } else if (newState.combo === 10) {
      newStats.foi      = Math.min(MAX_STAT, newStats.foi + 5);
      newStats.paix     = Math.min(MAX_STAT, newStats.paix + 5);
      newStats.physique = Math.min(MAX_STAT, newStats.physique + 3);
      newState.journal = [...(newState.journal || state.journal), { age: state.age, text: '[COMBO x10] Le feu de Dieu — Foi +5, Paix +5, Corps +3', type: 'milestone' as const }];
    } else if (newState.combo === 20) {
      newStats.foi      = Math.min(MAX_STAT, newStats.foi + 8);
      newStats.paix     = Math.min(MAX_STAT, newStats.paix + 8);
      newStats.physique = Math.min(MAX_STAT, newStats.physique + 5);
      newStats.finances = Math.min(MAX_STAT, newStats.finances + 5);
      newState.journal = [...(newState.journal || state.journal), { age: state.age, text: '[COMBO x20] PRODIGE — toutes stats +bonus', type: 'milestone' as const }];
    } else if (newState.combo > 0 && newState.combo % 5 === 0) {
      // Paliers suivants (25, 30, ...) : +3 foi
      newStats.foi = Math.min(MAX_STAT, newStats.foi + 3);
    }

    // Codex: débloquer le verset
    newCodex[verse.id] = {
      ...(newCodex[verse.id] || { verseId: verse.id, unlocked: false, timesUsed: 0, errorCount: 0 }),
      unlocked: true,
      unlockedAtAge: newCodex[verse.id]?.unlockedAtAge || state.age,
      timesUsed: (newCodex[verse.id]?.timesUsed || 0) + 1,
    };

    newState.lastEventResult = 'success';
    newState.journal = [
      ...state.journal,
      {
        age: state.age,
        text: `[VICTOIRE] ${event.title} surmonté par ${verse.reference} (COMBO:${newState.combo})`,
        type: 'success',
        verseRef: verse.reference,
      },
    ];

    // Arc narratif: tracker rencontre + complétion
    if (event.storyArcId && event.arcSequence) {
      const arc = getArcById(event.storyArcId);
      // Marquer l'arc comme rencontré
      if (!state.encounteredArcIds.includes(event.storyArcId)) {
        newState.encounteredArcIds = [...state.encounteredArcIds, event.storyArcId];
      }
      if (arc && event.arcSequence === arc.eventIds.length) {
        newState.completedArcs = [
          ...state.completedArcs,
          { arcId: event.storyArcId, completedAtAge: state.age },
        ];
        newState.journal = [
          ...newState.journal,
          {
            age: state.age,
            text: `[ARC COMPLÉTÉ] ${arc.name} — "${arc.description}"`,
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

    // Flow: pénalité asymétrique
    newFlow.value = calculateFlowPenalty(newFlow.value);
    newFlow.palier = getFlowPalier(newFlow.value);

    // Stats: malus
    for (const [stat, impact] of Object.entries(event.statImpactOnFail)) {
      newStats[stat as StatName] = Math.max(
        MIN_STAT,
        (newStats[stat as StatName] || 0) + impact
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
    let newQueued = [...state.queuedCascadeEvents];
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
  }

  // Burnout rate update
  newFlow.burnoutRate = calculateBurnoutRate(newFlow.palier);

  // Fenêtre glissante des événements récents (évite répétitions)
  newState.recentEventIds = [
    event.id,
    ...state.recentEventIds.slice(0, 9),
  ];

  newState.stats = newStats;
  newState.flow = newFlow;
  newState.codex = newCodex;
  newState.totalEvents = state.totalEvents + 1;
  const successes = newState.journal.filter((j) => j.type === 'success').length;
  newState.successRate = Math.round((successes / newState.totalEvents) * 100);

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
  call_friend: (s) => ({ statDelta: { paix: 3 },               label: `Appel à ${s.lifeContext.friendName} — Paix +3`, amiDelta: 8 }),
  read_word:   () => ({ statDelta: { foi: 3, paix: 1 },        label: 'Lecture de la Parole — Foi +3, Paix +1' }),
};

export function applyPlayerAction(
  state: GameState,
  action: import('../types/game').PlayerAction
): ActionEffect | null {
  if (state.actionPoints <= 0) return null;
  if (state.actionsThisYear.includes(action)) return null;

  const effectFn = ACTION_EFFECTS[action];
  if (!effectFn) return null;

  const { statDelta, label, amiDelta } = effectFn(state);
  const newStats = { ...state.stats };

  for (const [stat, val] of Object.entries(statDelta)) {
    newStats[stat as string] = Math.min(
      MAX_STAT,
      Math.max(MIN_STAT, (newStats[stat as string] || 0) + (val ?? 0))
    );
  }

  const journalEntry: import('../types/game').JournalEntry = {
    age: state.age,
    text: label,
    type: 'micro',
  };

  return {
    label,
    newState: {
      ...state,
      stats: newStats,
      actionPoints: state.actionPoints - 1,
      actionsThisYear: [...state.actionsThisYear, action],
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
  // Reset actions volontaires — 2 points avant 60 ans, 3 points senior
  newState.actionPoints = newAge >= 60 ? 3 : 2;
  newState.actionsThisYear = [];

  // Retirer les cascades déclenchées
  newState.queuedCascadeEvents = state.queuedCascadeEvents.filter(
    (q) => q.triggerAge !== newAge
  );

  // Pénalité de vieillissement
  if (newAge > 40) {
    newStats.physique = Math.max(MIN_STAT, newStats.physique - 1);
  }
  if (newAge > 60) {
    newStats.physique = Math.max(MIN_STAT, newStats.physique - 2);
    newStats.paix     = Math.max(MIN_STAT, newStats.paix     - 1);
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

  // Flow décroît naturellement si inactif
  if (newState.flow.value > 0 && newState.phase !== 'event') {
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
  if (newAge === 0)  ageEvents.push('[NAISSANCE] Élias vient de naître.');
  if (newAge === 15) ageEvents.push('[ADOLESCENCE] Élias entre dans l\'adolescence. Les premiers choix commencent.');
  if (newAge === 25) ageEvents.push('[JEUNE ADULTE] Élias prend sa vie en main. Le combat intérieur s\'intensifie.');
  if (newAge === 30) ageEvents.push('[MATURITÉ] 30 ans. La vie forge ce que la foi doit porter. Les fondations se testent.');
  if (newAge === 40) ageEvents.push('[PIVOT] 40 ans. Le corps commence à parler. Ce qui était acquis doit être renouvelé.');
  if (newAge === 50) ageEvents.push('[PROFONDEUR] 50 ans. Ce qui comptait avant compte moins. Ce qui était flou devient clair.');
  if (newAge === 60) ageEvents.push('[SAGESSE] 60 ans. Élias marche vers la sagesse. Les dernières grandes batailles approchent.');
  if (newAge === 80) ageEvents.push('[GLORIEUX] Les dernières forteresses tombent. Le Prodige achève sa course.');

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
  // Pas d'épreuves interactives avant 5 ans — le bébé/très jeune enfant ne choisit pas de versets
  const shouldGenerate =
    newAge >= 5 &&
    (hasCascade || Math.random() < 0.55 || state.failedVerseIds.length > 0);

  let eventGenerated = false;
  if (shouldGenerate) {
    const event = generateEvent(newState);
    if (event) {
      newState.currentEvent = event;
      newState.phase = 'event';
      eventGenerated = true;
    }
  }

  // Micro-événements passifs (indépendants des épreuves)
  if (Math.random() < 0.55) {
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
  for (const title of TITLES) {
    if (title.condition(metrics)) return title;
  }
  return null;
}
