/**
 * @file event-schema.ts
 * @description Contrat de données pour la génération d'événements Élias.
 *
 * Ce fichier remplit trois rôles :
 *   1. SCHÉMA         — Définit la structure exacte d'un événement généré par IA
 *   2. RÈGLES         — Expose les contraintes de balance et narratives
 *   3. PROMPT TEMPLATE — Fournit le prompt système prêt à l'emploi pour Claude API
 *
 * ─── WORKFLOW ──────────────────────────────────────────────────────────────────
 *
 *  verse.ts  ──→  generate-events.ts  ──→  Claude API
 *                        │
 *                        ↓
 *               validateGeneratedEvent()
 *                        │
 *              ┌─────────┴─────────┐
 *           VALIDE             INVALIDE
 *              │                   │
 *         events.ts            queue erreurs
 *
 * ─── POUR AJOUTER UNE NOUVELLE CATÉGORIE ──────────────────────────────────────
 *
 *  1. Ajouter la valeur dans AfflictionCategory (src/types/game.ts)
 *  2. Ajouter la couleur dans AFFLICTION_COLORS (src/components/IconSystem.tsx)
 *  3. Ajouter le libellé dans CATEGORY_META ci-dessous
 *  4. Ajouter les versets correspondants dans VERSE_DATABASE (src/data/verses.ts)
 *  5. Lancer le script : npx ts-node scripts/generate-events.ts --cat <category>
 *
 * @see scripts/generate-events.ts   — CLI de génération IA
 * @see src/data/event-validator.ts  — fonctions de validation
 * @see src/data/events.ts           — base de données finale
 */

import type { AfflictionCategory, EventTone, StatName } from '../types/game';

// ─── SCHÉMA D'UN ÉVÉNEMENT GÉNÉRÉ ────────────────────────────────────────────

/**
 * Structure attendue en sortie du modèle IA.
 * Sous-ensemble strict de AfflictionEvent — les champs auto-générés
 * (decoyVerseIds, storyArcId, etc.) sont ajoutés en post-traitement.
 */
export interface GeneratedEvent {
  /** Format: "e-{catShort}-{3digits}" ex: "e-priere-042". Doit être unique. */
  id: string;

  /** Max 7 mots. Situation présente, neutre, sans jugement. Ex: "La nuit de découragement" */
  title: string;

  /**
   * 2-3 phrases max. Vue subjective (Tu/On te/Ton).
   * La situation doit APPELER naturellement le verset correct comme réponse.
   * Min: 80 caractères. Max: 300 caractères.
   */
  description: string;

  /** [ageMin, ageMax]. Vérifier la cohérence sémantique (ex: stérilité ≥ 25). */
  ageRange: [number, number];

  /** Catégorie principale. Détermine le pool de leurres et la couleur HUD. */
  category: AfflictionCategory;

  /**
   * Ton narratif. Doit être cohérent avec la description.
   * Ex: description de bureau → tone = 'professionnel'
   */
  tone: EventTone;

  /** ID du verset à deviner. Doit exister dans VERSE_DATABASE. */
  correctVerseId: string;

  /**
   * Niveau de difficulté du verset (hérité du verset, pas inventé).
   * 1 = texte complet affiché / 2 = snippet / 3 = référence seule
   */
  difficulty: 1 | 2 | 3;

  /**
   * Impacts sur les stats EN CAS D'ÉCHEC.
   * Règles : total absolu ≤ 20, max 2 stats ≠ 0, chaque valeur entre -3 et -12.
   * Stats non touchées = 0 (ne pas omettre).
   */
  statImpactOnFail: Record<StatName, number>;

  /** 3-5 mots. Contexte/sous-thème. Ex: "Pression professionnelle", "Nuit d'angoisse" */
  thematicFlavor?: string;

  /**
   * Termes EJP/ICC utilisés dans la description.
   * Permet de valider la cohérence avec le Lexique.
   * Ex: ['Couloir', 'Prodige', 'Saison']
   */
  ejpTerms?: string[];

  /**
   * Condition de stat minimale pour que l'événement apparaisse.
   * Ex: { foi: 40 } = l'événement ne se déclenche que si Foi ≥ 40.
   */
  minStat?: Partial<Record<StatName, number>>;

  /**
   * Condition de stat maximale.
   * Ex: { finances: 30 } = seulement si Finances ≤ 30.
   */
  maxStat?: Partial<Record<StatName, number>>;
}

// ─── MÉTADONNÉES PAR CATÉGORIE ────────────────────────────────────────────────

/**
 * Référence humaine pour chaque catégorie.
 * Utilisée par le script de génération pour construire le prompt IA
 * et par le Codex pour l'affichage de progression.
 */
export const CATEGORY_META: Record<AfflictionCategory, {
  /** Libellé affiché dans le Codex */
  label: string;
  /** Page de référence dans le livre EJP/ICC */
  bookPage: number;
  /** Orientation principale: 'victoire' = vaincre X | 'croissance' = manifester Y */
  orientation: 'victoire' | 'croissance';
  /** Mots-clés de ton pour guider la génération IA */
  toneKeywords: string[];
  /** Abbréviation pour les IDs (ex: 'priere' → 'priere') */
  idShort: string;
}> = {
  // ── Catégories originales ──────────────────────────────────────────────────
  peur_angoisse:        { label: 'Peur & Angoisse',           bookPage: 45, orientation: 'victoire',  toneKeywords: ['peur', 'angoisse', 'nuit', 'cauchemar', 'tremblement'],    idShort: 'peur'    },
  impudicite_addiction: { label: 'Impudicité & Addictions',   bookPage: 52, orientation: 'victoire',  toneKeywords: ['tentation', 'chair', 'habitude', 'secret', 'honte'],        idShort: 'imput'   },
  finances_paresse:     { label: 'Finances & Paresse',        bookPage: 62, orientation: 'victoire',  toneKeywords: ['dettes', 'factures', 'travail', 'procrastination', 'argent'],idShort: 'fin'     },
  amertume_rejet:       { label: 'Amertume & Rejet',          bookPage: 42, orientation: 'victoire',  toneKeywords: ['blessure', 'trahison', 'pardon', 'rancœur', 'injustice'],   idShort: 'amer'    },
  combat_spirituel:     { label: 'Combat Spirituel',          bookPage: 90, orientation: 'victoire',  toneKeywords: ['ennemi', 'attaque', 'résistance', 'armure', 'oppression'],  idShort: 'combat'  },
  identite_appel:       { label: 'Identité & Appel',          bookPage:  1, orientation: 'croissance',toneKeywords: ['appel', 'destinée', 'couloir', 'qui je suis', 'mission'],   idShort: 'ident'   },
  doute_incredulite:    { label: 'Doute & Incrédulité',       bookPage: 13, orientation: 'victoire',  toneKeywords: ['doute', 'question', 'foi faible', 'preuve', 'silence'],     idShort: 'doute'   },
  orgueil_independance: { label: 'Orgueil & Indépendance',    bookPage: 78, orientation: 'victoire',  toneKeywords: ['fierté', 'autosuffisance', 'contrôle', 'humilité', 'chute'],idShort: 'orgueil' },
  // ── Nouvelles catégories ──────────────────────────────────────────────────
  saint_esprit:         { label: 'Le Saint-Esprit',           bookPage:  6, orientation: 'croissance',toneKeywords: ['souffle', 'dons', 'langue', 'onction', 'feu intérieur'],   idShort: 'esprit'  },
  parole_de_dieu:       { label: 'La Parole de Dieu',         bookPage:  9, orientation: 'croissance',toneKeywords: ['Parole', 'Bible', 'méditation', 'décret', 'lumière'],       idShort: 'parole'  },
  amour_de_dieu:        { label: "Manifester l'Amour",        bookPage: 17, orientation: 'croissance',toneKeywords: ['aimer', 'servir', 'prochain', 'générosité', 'agapé'],       idShort: 'amour'   },
  direction_divine:     { label: 'Direction Divine',          bookPage: 23, orientation: 'croissance',toneKeywords: ['choix', 'carrefour', 'guidance', 'paix intérieure', 'voix'],idShort: 'direct'  },
  priere:               { label: 'La Prière',                 bookPage: 26, orientation: 'croissance',toneKeywords: ['prière', 'intercession', 'jeûne', 'persistance', 'ferveur'],idShort: 'priere'  },
  soif_de_dieu:         { label: 'La Soif de Dieu',           bookPage: 29, orientation: 'croissance',toneKeywords: ['soif', 'intimité', 'présence', 'désert', 'rencontre'],      idShort: 'soif'    },
  obeissance:           { label: "L'Obéissance",              bookPage: 32, orientation: 'croissance',toneKeywords: ['obéir', 'instruction', 'sacrifice', 'confiance', 'pas'],    idShort: 'obeis'   },
  culpabilite:          { label: 'Vaincre la Culpabilité',    bookPage: 38, orientation: 'victoire',  toneKeywords: ['culpabilité', 'condamnation', 'honte passée', 'pardon'],    idShort: 'culpa'   },
  sterilite:            { label: 'Vaincre la Stérilité',      bookPage: 59, orientation: 'victoire',  toneKeywords: ['attente', 'grossesse', 'vision', 'barrenness', 'espoir'],   idShort: 'steril'  },
  abondance_financiere: { label: 'Abondance & Dîme',          bookPage: 66, orientation: 'croissance',toneKeywords: ['dîme', 'offrande', 'récolte', 'semence', 'bénédiction'],   idShort: 'abond'   },
  maladie_guerison:     { label: 'Maladies & Guérison',       bookPage: 69, orientation: 'victoire',  toneKeywords: ['maladie', 'médecin', 'diagnostic', 'guérison', 'corps'],   idShort: 'gueris'  },
  echec_reussite:       { label: "Vaincre l'Échec",           bookPage: 72, orientation: 'victoire',  toneKeywords: ['échec', 'honte', 'relèvement', 'recommencer', 'réussite'],  idShort: 'echec'   },
  tristesse_joie:       { label: 'Tristesse & Joie de Dieu',  bookPage: 81, orientation: 'victoire',  toneKeywords: ['tristesse', 'larmes', 'joie', 'deuil', 'célébration'],     idShort: 'joie'    },
  decouragement:        { label: 'Découragement & Persévérance',bookPage:84, orientation: 'victoire', toneKeywords: ['découragement', 'abandon', 'tenir', 'persévérer', 'marathon'],idShort: 'decour' },
  lourdeur_fatigue:     { label: 'Lourdeur & Vigueur Divine', bookPage: 87, orientation: 'victoire',  toneKeywords: ['fatigue', 'épuisement', 'lourdeur', 'force', 'repos'],     idShort: 'lourd'   },
};

// ─── RÈGLES DE BALANCE ────────────────────────────────────────────────────────

/**
 * Règles de balance des événements.
 * Le validator rejette tout événement qui viole ces contraintes.
 *
 * Pourquoi ces valeurs ?
 *  - maxTotalStatLoss: 20 → Une défaite totale vide une jauge en ~5 échecs
 *  - maxSingleStatLoss: 12 → Une seule stat ne peut pas tuer en 1 coup
 *  - minTotalStatLoss: 5 → Un événement trop doux n'engage pas le joueur
 *  - maxStatsAffected: 2 → Punir 3-4 stats en même temps est frustrant
 *  - minAge, maxAge → La vie d'Élias va de 0 à 100
 */
export const BALANCE_RULES = {
  maxTotalStatLoss:  20,   // Somme des valeurs absolues des impacts négatifs
  maxSingleStatLoss: 12,   // Impact maximal d'une seule stat (valeur absolue)
  minTotalStatLoss:  5,    // Impact minimal total (en valeur absolue) pour que l'épreuve ait du sens
  maxStatsAffected:  2,    // Nombre maximum de stats avec une valeur ≠ 0
  minAge:            0,
  maxAge:            100,
} as const;

/**
 * Règles narratives de qualité.
 * Garantissent la lisibilité et la cohérence du contenu.
 */
export const NARRATIVE_RULES = {
  descriptionMinChars: 80,   // En dessous = trop abstrait, trop vague
  descriptionMaxChars: 300,  // Au-dessus = le joueur ne lit plus
  titleMaxWords:       7,    // Titre de rubrique, pas de phrase complète
  verseLinked:         true, // La situation doit appeler le verset correct
  firstPersonRequired: true, // "Tu...", "On te...", "Ton..." — pas de "Il"
} as const;

/**
 * Règles de vocabulaire EJP/ICC.
 * Maintiennent le ton spécifique à la communauté cible.
 */
export const EJP_RULES = {
  /** Mots trop génériques ou d'un autre courant doctrinal — à éviter */
  forbiddenWords: ['péché', 'Satan', 'enfer', 'démon', 'diable', 'malédiction'],

  /** Vocabulaire EJP/ICC à préférer */
  preferredVocab: [
    'chair', 'ennemi', 'adversaire',       // Alternative aux mots interdits
    'Prodige', 'Couloir', 'Saison',         // Sociolecte EJP
    'Ferveur', 'Anakazo', 'Cordeau',        // Termes doctrinaux
    'Vision', 'Appel', 'Mandat',            // Appel et destinée
    'Cœur pur', 'Muraille de feu',          // Images doctrinales
  ],

  /** Patterns de début de phrase — cohérence vue subjective */
  allowedStartPatterns: [
    'Tu ', 'Ton ', 'Ta ', 'Tes ',
    'On te ', 'Une ', 'Un ', 'Le ', 'La ', 'Les ',
    'Dans ', 'Ce ', 'Cette ',
  ],
} as const;

// ─── PROMPT TEMPLATE ─────────────────────────────────────────────────────────

/**
 * Template de prompt système pour Claude API.
 *
 * Remplace les variables {{...}} avec les données du verset cible
 * avant d'envoyer à l'API.
 *
 * @example
 * ```typescript
 * import Anthropic from '@anthropic-ai/sdk';
 * import { buildPrompt } from './event-schema';
 * import { VERSE_DATABASE } from './verses';
 *
 * const verse = VERSE_DATABASE.find(v => v.id === 'v-priere-001')!;
 * const prompt = buildPrompt({ verse, ageMin: 20, ageMax: 40, tone: 'intime', count: 3 });
 *
 * const client = new Anthropic();
 * const response = await client.messages.create({
 *   model: 'claude-opus-4-8',
 *   max_tokens: 2048,
 *   system: SYSTEM_PROMPT,
 *   messages: [{ role: 'user', content: prompt }],
 * });
 * ```
 */
export const SYSTEM_PROMPT = `
Tu es un game designer senior pour ÉLIAS — un simulateur de vie chrétienne (style BitLife)
destiné à la communauté EJP/ICC en France et en Afrique francophone.

TON RÔLE:
Générer des événements de jeu en JSON valide. Chaque événement est une épreuve
qu'Élias traverse. Le joueur doit choisir le bon verset biblique pour la surmonter.

PERSONNAGE:
Élias, chrétien afro, vivant en France ou en Afrique. Il grandit (0→100 ans),
traverse des épreuves spirituelles, relationnelles et professionnelles.

RÈGLES ABSOLUES (violation = événement rejeté):
1. La description doit APPELER naturellement le verset correct comme réponse.
   Le lien verse-situation doit être évident, pas forçé.
2. Rédige en français — ton EJP/ICC: direct, incarné, concret. Pas de religieux-générique.
3. Vue subjective: commence par "Tu", "Ton", "Ta", "On te", "Une", "Un", "Ce"...
4. 2-3 phrases max dans description. Entre 80 et 300 caractères.
5. Impact stat (fail): total absolu ≤ 20, max 2 stats touchées, chaque stat entre -3 et -12.
6. Mots INTERDITS: péché, Satan, enfer, démon, diable, malédiction.
   Utiliser à la place: chair, ennemi, adversaire.
7. Termes EJP/ICC préférés: Prodige, Couloir, Saison, Ferveur, Anakazo, Vision, Mandat.

FORMAT DE SORTIE: Tableau JSON uniquement, sans texte autour.
[
  { ... événement 1 ... },
  { ... événement 2 ... }
]
`.trim();

/**
 * Construit le prompt utilisateur pour un lot d'événements.
 *
 * @param params.verse        Verset cible (doit exister dans VERSE_DATABASE)
 * @param params.ageMin       Âge minimum de l'événement
 * @param params.ageMax       Âge maximum de l'événement
 * @param params.tone         Ton narratif souhaité
 * @param params.count        Nombre d'événements à générer (recommandé: 3-5)
 */
export function buildGenerationPrompt(params: {
  verse: { id: string; reference: string; text: string; category: string };
  ageMin: number;
  ageMax: number;
  tone: EventTone;
  count: number;
  nextIdStart: number;
}): string {
  const { verse, ageMin, ageMax, tone, count, nextIdStart } = params;
  const meta = CATEGORY_META[verse.category as AfflictionCategory];

  return `
VERSET À RELIER: ${verse.reference}
TEXTE: "${verse.text}"
CATÉGORIE: ${verse.category} — ${meta?.label ?? verse.category}
TRANCHE D'ÂGE: ${ageMin}-${ageMax} ans
TON REQUIS: ${tone} (mots-clés: ${meta?.toneKeywords?.slice(0, 4).join(', ') ?? ''})
NOMBRE À GÉNÉRER: ${count}
IDs à utiliser: e-${meta?.idShort ?? verse.category}-${String(nextIdStart).padStart(3, '0')} à ${String(nextIdStart + count - 1).padStart(3, '0')}

Génère ${count} événements JSON distincts pour ce verset.
Chaque événement doit avoir une situation différente (âge, contexte, enjeu).
Retourne uniquement le tableau JSON, sans texte autour.
  `.trim();
}
