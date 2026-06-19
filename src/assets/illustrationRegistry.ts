/**
 * @file illustrationRegistry.ts
 * @module assets/illustrationRegistry
 * @description Registre d'assets — map `assetId → IllustrationEntry`.
 *
 *   Principe ASSET-READY : chaque slot résout AUJOURD'HUI en placeholder (couleur + label
 *   dérivé de l'émetteur) et POINTERA PLUS TARD vers de l'art réel (avatar, illustration
 *   de lieu/objet) **sans refactor** — seul le `type` et la `value` changeront dans cette map.
 *
 *   Sources d'assetId :
 *   - `src/engine/messageSender.ts` — génère `elias__<sender>__<iconKey>` pour chaque événement
 *   - `src/engine/avatarExpression.ts` — ajoute un suffixe `__<expression>` à l'assetId de base
 *
 *   Convention des assetId :
 *   - `elias__heaven__heaven_<category>`             — émetteur Ciel (état neutre)
 *   - `elias__heaven__heaven_<category>__<expr>`     — variante d'expression (T-32)
 *   - `elias__adversary__adversary_<cat>`            — émetteur Adversaire (état neutre)
 *   - `elias__adversary__adversary_<cat>__<expr>`    — variante d'expression (T-32)
 *   - `elias__entourage__entourage_<arcId>`          — émetteur Entourage (état neutre)
 *   - `elias__entourage__entourage_<arcId>__<expr>`  — variante d'expression (T-32)
 *   - `elias__conscience__conscience_inner`          — émetteur Conscience (état neutre)
 *   - `elias__conscience__conscience_inner__<expr>`  — variante d'expression (T-32)
 *
 *   Expressions disponibles (T-32) : challenge | joy | victory | defeat | warning
 *   L'expression `neutral` n'a pas de suffixe — l'assetId de base EST le neutre.
 *
 *   @see src/engine/messageSender.ts       — construction des assetId de base (T-20)
 *   @see src/engine/avatarExpression.ts    — dérivation des expressions (T-32)
 *   @see src/components/JournalBubble.tsx  — consommateur principal (T-21 / T-31 / T-32)
 *   @since itér. 50 / T-31 ; expressions T-32 itér. 51
 */

/* ─── Type principal ──────────────────────────────────────────────────────── */

/**
 * Une entrée d'illustration dans le registre.
 *
 * - `type: 'placeholder'` → `value` est une couleur CSS hex (ex. `#fbbf24`).
 *   Résolution minimale fonctionnelle, toujours disponible.
 * - `type: 'image'` → `value` est une URL/path vers un fichier image (future art).
 * - `type: 'svg'`   → `value` est une clé de composant SVG inline (future art).
 *
 * `label` : nom lisible en français pour l'accessibilité (aria-label, alt…).
 */
export interface IllustrationEntry {
  type: 'placeholder' | 'image' | 'svg';
  value: string;
  label: string;
}

/* ─── Couleurs de placeholder par émetteur ────────────────────────────────── */
//
// Ces couleurs sont identiques à celles de SENDER_COLORS dans messageSender.ts
// et AFFLICTION_COLORS dans afflictionColors.ts. Elles sont re-déclarées ici
// (plutôt qu'importées) pour que ce module reste indépendant : il EST la source
// de vérité visuelle pour les assets, pas un consommateur du moteur.

const _HEAVEN_COLOR     = '#fbbf24'; // Or — lumière divine
const _ADVERSARY_COLOR  = '#ef4444'; // Rouge — opposition
const _ENTOURAGE_COLOR  = '#34d399'; // Vert menthe — chaleur humaine
const _CONSCIENCE_COLOR = '#c084fc'; // Violet doux — intériorité

/** Couleurs des afflictions (palette complète — conserve la cohérence visuelle). */
const AFFLICTION_PALETTE: Record<string, string> = {
  peur_angoisse:        '#8b5cf6',
  impudicite_addiction: '#ef4444',
  finances_paresse:     '#f59e0b',
  amertume_rejet:       '#6b7280',
  combat_spirituel:     '#f97316',
  identite_appel:       '#a78bfa',
  doute_incredulite:    '#94a3b8',
  orgueil_independance: '#dc2626',
  culpabilite:          '#a8a29e',
  sterilite:            '#e9d5ff',
  maladie_guerison:     '#4ade80',
  echec_reussite:       '#fb923c',
  tristesse_joie:       '#f472b6',
  decouragement:        '#60a5fa',
  lourdeur_fatigue:     '#a3e635',
};

/** Couleurs catégories « ciel » (croissance / foi). */
const HEAVEN_PALETTE: Record<string, string> = {
  heaven_saint_esprit:        '#38bdf8',
  heaven_parole_de_dieu:      '#fde68a',
  heaven_amour_de_dieu:       '#fb7185',
  heaven_direction_divine:    '#34d399',
  heaven_priere:              '#c4b5fd',
  heaven_soif_de_dieu:        '#7dd3fc',
  heaven_obeissance:          '#86efac',
  heaven_identite_appel:      '#a78bfa',
  heaven_abondance_financiere:'#fbbf24',
  heaven_victory:             '#fbbf24',
  heaven_milestone:           '#fbbf24',
};

/* ─── Helpers ─────────────────────────────────────────────────────────────── */

function placeholder(value: string, label: string): IllustrationEntry {
  return { type: 'placeholder', value, label };
}

/* ─── Registre principal ──────────────────────────────────────────────────── */

/**
 * Registre complet de toutes les illustrations connues.
 * Chaque clé = un `assetId` au format `elias__<sender>__<iconKey>`.
 *
 * Pour brancher un asset réel : changer `type` en `'image'` ou `'svg'` et
 * `value` vers le path/URL/clé — aucune autre modification requise.
 */
export const ILLUSTRATION_REGISTRY: Record<string, IllustrationEntry> = {

  /* ── Heaven — catégories de croissance / foi ──────────────────────────── */
  'elias__heaven__heaven_saint_esprit':         placeholder(HEAVEN_PALETTE.heaven_saint_esprit,        "L'Esprit Saint"),
  'elias__heaven__heaven_parole_de_dieu':       placeholder(HEAVEN_PALETTE.heaven_parole_de_dieu,      'La Parole de Dieu'),
  'elias__heaven__heaven_amour_de_dieu':        placeholder(HEAVEN_PALETTE.heaven_amour_de_dieu,       "L'Amour de Dieu"),
  'elias__heaven__heaven_direction_divine':     placeholder(HEAVEN_PALETTE.heaven_direction_divine,    'La Direction divine'),
  'elias__heaven__heaven_priere':               placeholder(HEAVEN_PALETTE.heaven_priere,              'La Prière'),
  'elias__heaven__heaven_soif_de_dieu':         placeholder(HEAVEN_PALETTE.heaven_soif_de_dieu,        'La Soif de Dieu'),
  'elias__heaven__heaven_obeissance':           placeholder(HEAVEN_PALETTE.heaven_obeissance,          "L'Obéissance"),
  'elias__heaven__heaven_identite_appel':       placeholder(HEAVEN_PALETTE.heaven_identite_appel,      "L'Identité et l'Appel"),
  'elias__heaven__heaven_abondance_financiere': placeholder(HEAVEN_PALETTE.heaven_abondance_financiere,"L'Abondance financière"),
  /* Heaven — entrées de journal spéciales */
  'elias__heaven__heaven_victory':   placeholder(HEAVEN_PALETTE.heaven_victory,   'Victoire spirituelle'),
  'elias__heaven__heaven_milestone': placeholder(HEAVEN_PALETTE.heaven_milestone, 'Jalon de vie'),

  /* ── Adversary — afflictions nommées ─────────────────────────────────── */
  'elias__adversary__adversary_peur_angoisse':        placeholder(AFFLICTION_PALETTE.peur_angoisse,        'La Peur'),
  'elias__adversary__adversary_impudicite_addiction': placeholder(AFFLICTION_PALETTE.impudicite_addiction, 'La Convoitise'),
  'elias__adversary__adversary_finances_paresse':     placeholder(AFFLICTION_PALETTE.finances_paresse,     'La Paresse'),
  'elias__adversary__adversary_amertume_rejet':       placeholder(AFFLICTION_PALETTE.amertume_rejet,       "L'Amertume"),
  'elias__adversary__adversary_combat_spirituel':     placeholder(AFFLICTION_PALETTE.combat_spirituel,     "L'Adversaire"),
  'elias__adversary__adversary_doute_incredulite':    placeholder(AFFLICTION_PALETTE.doute_incredulite,    'Le Doute'),
  'elias__adversary__adversary_orgueil_independance': placeholder(AFFLICTION_PALETTE.orgueil_independance, "L'Orgueil"),
  'elias__adversary__adversary_culpabilite':          placeholder(AFFLICTION_PALETTE.culpabilite,          'La Condamnation'),
  'elias__adversary__adversary_sterilite':            placeholder(AFFLICTION_PALETTE.sterilite,            "L'Attente vide"),
  'elias__adversary__adversary_maladie_guerison':     placeholder(AFFLICTION_PALETTE.maladie_guerison,     'La Souffrance'),
  'elias__adversary__adversary_echec_reussite':       placeholder(AFFLICTION_PALETTE.echec_reussite,       "L'Échec"),
  'elias__adversary__adversary_tristesse_joie':       placeholder(AFFLICTION_PALETTE.tristesse_joie,       'La Tristesse'),
  'elias__adversary__adversary_decouragement':        placeholder(AFFLICTION_PALETTE.decouragement,        'Le Découragement'),
  'elias__adversary__adversary_lourdeur_fatigue':     placeholder(AFFLICTION_PALETTE.lourdeur_fatigue,     'La Fatigue'),
  /* Adversary — entrées journal spéciales */
  'elias__adversary__adversary_generic':  placeholder(_ADVERSARY_COLOR, "L'Adversaire"),
  'elias__adversary__adversary_cascade':  placeholder(_ADVERSARY_COLOR, 'Conséquence de chute'),

  /* ── Entourage — arcs relationnels ───────────────────────────────────── */
  'elias__entourage__entourage_arc-ami':      placeholder(_ENTOURAGE_COLOR, 'Ton ami'),
  'elias__entourage__entourage_arc-parents':  placeholder(_ENTOURAGE_COLOR, 'Tes parents'),
  'elias__entourage__entourage_arc-eglise':   placeholder(_ENTOURAGE_COLOR, "L'église"),
  'elias__entourage__entourage_arc-metier':   placeholder(_ENTOURAGE_COLOR, 'Ton milieu professionnel'),
  'elias__entourage__entourage_arc-ville':    placeholder(_ENTOURAGE_COLOR, 'Ta ville'),
  'elias__entourage__entourage_arc-conjoint': placeholder(_ENTOURAGE_COLOR, 'Ton conjoint(e)'),
  'elias__entourage__entourage_arc-mathias':  placeholder(_ENTOURAGE_COLOR, 'Mathias'),
  'elias__entourage__entourage_arc-heritage': placeholder(_ENTOURAGE_COLOR, 'Ton héritage'),
  'elias__entourage__entourage_arc-louise':   placeholder(_ENTOURAGE_COLOR, 'Louise'),

  /* ── Conscience ───────────────────────────────────────────────────────── */
  'elias__conscience__conscience_inner': placeholder(_CONSCIENCE_COLOR, 'Ta conscience'),

  /* ════════════════════════════════════════════════════════════════════════
   * T-32 — Variantes d'expression (ton/résultat pilotent l'état de la bulle)
   *
   * Format : `<assetId_base>__<expression>`
   * Expressions : challenge | joy | victory | defeat | warning
   * (neutral = pas de suffixe = assetId de base ci-dessus)
   *
   * Aujourd'hui : même couleur de placeholder que la base, label enrichi
   * « <Nom> — <état> » pour distinguer visuellement et tester.
   * L'art réel pointera ici sans refactor (principe asset-ready).
   * ══════════════════════════════════════════════════════════════════════ */

  /* ── Heaven — expressions ─────────────────────────────────────────────── */
  // joy : avant l'event (le Ciel envoie, encouragement proactif)
  'elias__heaven__heaven_victory__joy':     placeholder(HEAVEN_PALETTE.heaven_victory,   "L'Esprit — jubilation"),
  'elias__heaven__heaven_milestone__joy':   placeholder(HEAVEN_PALETTE.heaven_milestone, "L'Esprit — joie proactive"),
  // victory : après succès d'Élias (célébration)
  'elias__heaven__heaven_victory__victory': placeholder(HEAVEN_PALETTE.heaven_victory,   "L'Esprit — victoire célébrée"),
  // warning : après un échec d'Élias (grâce + appel à revenir)
  'elias__heaven__heaven_victory__warning': placeholder(HEAVEN_PALETTE.heaven_victory,   "L'Esprit — appel à revenir"),
  // Variantes catégories heaven les plus fréquentes
  'elias__heaven__heaven_saint_esprit__joy':     placeholder(HEAVEN_PALETTE.heaven_saint_esprit,   "L'Esprit Saint — joie"),
  'elias__heaven__heaven_saint_esprit__victory': placeholder(HEAVEN_PALETTE.heaven_saint_esprit,   "L'Esprit Saint — victoire"),
  'elias__heaven__heaven_saint_esprit__warning': placeholder(HEAVEN_PALETTE.heaven_saint_esprit,   "L'Esprit Saint — avertissement"),
  'elias__heaven__heaven_direction_divine__joy':     placeholder(HEAVEN_PALETTE.heaven_direction_divine, 'La Direction divine — guidance'),
  'elias__heaven__heaven_direction_divine__victory': placeholder(HEAVEN_PALETTE.heaven_direction_divine, 'La Direction divine — accomplissement'),
  'elias__heaven__heaven_direction_divine__warning': placeholder(HEAVEN_PALETTE.heaven_direction_divine, 'La Direction divine — rappel'),
  'elias__heaven__heaven_milestone__victory': placeholder(HEAVEN_PALETTE.heaven_milestone, 'Jalon de vie — célébration'),
  'elias__heaven__heaven_milestone__warning': placeholder(HEAVEN_PALETTE.heaven_milestone, 'Jalon de vie — mise en garde'),

  /* ── Adversary — expressions ──────────────────────────────────────────── */
  // challenge : avant la réponse (l'adversaire provoque)
  'elias__adversary__adversary_generic__challenge':  placeholder(_ADVERSARY_COLOR, "L'Adversaire — provocateur"),
  'elias__adversary__adversary_cascade__challenge':  placeholder(_ADVERSARY_COLOR, 'Conséquence — aggravation'),
  // victory : après un échec d'Élias (l'adversaire triomphe)
  'elias__adversary__adversary_generic__victory':    placeholder(_ADVERSARY_COLOR, "L'Adversaire — triomphant"),
  'elias__adversary__adversary_cascade__victory':    placeholder(_ADVERSARY_COLOR, 'Conséquence — emprise'),
  // defeat : après un succès d'Élias (l'adversaire est brisé)
  'elias__adversary__adversary_generic__defeat':     placeholder(_ADVERSARY_COLOR, "L'Adversaire — brisé"),
  'elias__adversary__adversary_cascade__defeat':     placeholder(_ADVERSARY_COLOR, 'Conséquence — levée'),
  // Variantes des afflictions nommées (challenge / victory / defeat)
  'elias__adversary__adversary_peur_angoisse__challenge': placeholder(AFFLICTION_PALETTE.peur_angoisse, 'La Peur — menaçante'),
  'elias__adversary__adversary_peur_angoisse__victory':   placeholder(AFFLICTION_PALETTE.peur_angoisse, 'La Peur — envahissante'),
  'elias__adversary__adversary_peur_angoisse__defeat':    placeholder(AFFLICTION_PALETTE.peur_angoisse, 'La Peur — dissipée'),
  'elias__adversary__adversary_doute_incredulite__challenge': placeholder(AFFLICTION_PALETTE.doute_incredulite, 'Le Doute — insinuant'),
  'elias__adversary__adversary_doute_incredulite__victory':   placeholder(AFFLICTION_PALETTE.doute_incredulite, 'Le Doute — installé'),
  'elias__adversary__adversary_doute_incredulite__defeat':    placeholder(AFFLICTION_PALETTE.doute_incredulite, 'Le Doute — dissous'),
  'elias__adversary__adversary_amertume_rejet__challenge': placeholder(AFFLICTION_PALETTE.amertume_rejet, "L'Amertume — acide"),
  'elias__adversary__adversary_amertume_rejet__victory':   placeholder(AFFLICTION_PALETTE.amertume_rejet, "L'Amertume — enfouie"),
  'elias__adversary__adversary_amertume_rejet__defeat':    placeholder(AFFLICTION_PALETTE.amertume_rejet, "L'Amertume — pardonnée"),
  'elias__adversary__adversary_combat_spirituel__challenge': placeholder(AFFLICTION_PALETTE.combat_spirituel, "L'Adversaire — attaquant"),
  'elias__adversary__adversary_combat_spirituel__victory':   placeholder(AFFLICTION_PALETTE.combat_spirituel, "L'Adversaire — dominant"),
  'elias__adversary__adversary_combat_spirituel__defeat':    placeholder(AFFLICTION_PALETTE.combat_spirituel, "L'Adversaire — vaincu"),
  'elias__adversary__adversary_orgueil_independance__challenge': placeholder(AFFLICTION_PALETTE.orgueil_independance, "L'Orgueil — séducteur"),
  'elias__adversary__adversary_orgueil_independance__victory':   placeholder(AFFLICTION_PALETTE.orgueil_independance, "L'Orgueil — enraciné"),
  'elias__adversary__adversary_orgueil_independance__defeat':    placeholder(AFFLICTION_PALETTE.orgueil_independance, "L'Orgueil — brisé"),
  'elias__adversary__adversary_decouragement__challenge': placeholder(AFFLICTION_PALETTE.decouragement, 'Le Découragement — pesant'),
  'elias__adversary__adversary_decouragement__victory':   placeholder(AFFLICTION_PALETTE.decouragement, 'Le Découragement — paralysant'),
  'elias__adversary__adversary_decouragement__defeat':    placeholder(AFFLICTION_PALETTE.decouragement, 'Le Découragement — levé'),

  /* ── Entourage — expressions ──────────────────────────────────────────── */
  // challenge : interpelle Élias (une situation relationnelle difficile)
  'elias__entourage__entourage_arc-ami__challenge':      placeholder(_ENTOURAGE_COLOR, 'Ton ami — en difficulté'),
  'elias__entourage__entourage_arc-parents__challenge':  placeholder(_ENTOURAGE_COLOR, 'Tes parents — inquiets'),
  'elias__entourage__entourage_arc-eglise__challenge':   placeholder(_ENTOURAGE_COLOR, "L'église — en tension"),
  'elias__entourage__entourage_arc-metier__challenge':   placeholder(_ENTOURAGE_COLOR, 'Ton milieu — exigeant'),
  'elias__entourage__entourage_arc-ville__challenge':    placeholder(_ENTOURAGE_COLOR, 'Ta ville — éprouvante'),
  'elias__entourage__entourage_arc-conjoint__challenge': placeholder(_ENTOURAGE_COLOR, 'Ton conjoint(e) — blessé(e)'),
  'elias__entourage__entourage_arc-mathias__challenge':  placeholder(_ENTOURAGE_COLOR, 'Mathias — en crise'),
  'elias__entourage__entourage_arc-louise__challenge':   placeholder(_ENTOURAGE_COLOR, 'Louise — bouleversée'),
  // joy : encouragement, joie partagée
  'elias__entourage__entourage_arc-ami__joy':      placeholder(_ENTOURAGE_COLOR, 'Ton ami — rayonnant'),
  'elias__entourage__entourage_arc-parents__joy':  placeholder(_ENTOURAGE_COLOR, 'Tes parents — fiers'),
  'elias__entourage__entourage_arc-eglise__joy':   placeholder(_ENTOURAGE_COLOR, "L'église — unie"),
  'elias__entourage__entourage_arc-metier__joy':   placeholder(_ENTOURAGE_COLOR, 'Ton milieu — porteur'),
  'elias__entourage__entourage_arc-conjoint__joy': placeholder(_ENTOURAGE_COLOR, 'Ton conjoint(e) — comblé(e)'),
  'elias__entourage__entourage_arc-mathias__joy':  placeholder(_ENTOURAGE_COLOR, 'Mathias — en paix'),
  'elias__entourage__entourage_arc-louise__joy':   placeholder(_ENTOURAGE_COLOR, 'Louise — apaisée'),
  // warning : après un échec d'Élias (inquiétude, mise en garde)
  'elias__entourage__entourage_arc-ami__warning':      placeholder(_ENTOURAGE_COLOR, 'Ton ami — préoccupé'),
  'elias__entourage__entourage_arc-parents__warning':  placeholder(_ENTOURAGE_COLOR, 'Tes parents — peinés'),
  'elias__entourage__entourage_arc-eglise__warning':   placeholder(_ENTOURAGE_COLOR, "L'église — attristée"),
  'elias__entourage__entourage_arc-metier__warning':   placeholder(_ENTOURAGE_COLOR, 'Ton milieu — critique'),
  'elias__entourage__entourage_arc-conjoint__warning': placeholder(_ENTOURAGE_COLOR, 'Ton conjoint(e) — blessé(e)'),
  'elias__entourage__entourage_arc-mathias__warning':  placeholder(_ENTOURAGE_COLOR, 'Mathias — déçu'),
  'elias__entourage__entourage_arc-louise__warning':   placeholder(_ENTOURAGE_COLOR, 'Louise — inquiète'),

  /* ── Conscience — expressions ─────────────────────────────────────────── */
  'elias__conscience__conscience_inner__victory': placeholder(_CONSCIENCE_COLOR, 'Ta conscience — apaisée'),
  'elias__conscience__conscience_inner__warning': placeholder(_CONSCIENCE_COLOR, 'Ta conscience — troublée'),
  'elias__conscience__conscience_inner__joy':     placeholder(_CONSCIENCE_COLOR, 'Ta conscience — exultante'),
};

/* ─── API publique ─────────────────────────────────────────────────────────── */

/**
 * Résout un `assetId` en `IllustrationEntry`.
 *
 * Si l'assetId est connu dans le registre, retourne l'entrée correspondante.
 * Sinon, retourne un placeholder générique dérivé du préfixe de l'assetId
 * (ex. `elias__heaven__*` → couleur or).
 *
 * Garantie : ne retourne JAMAIS `undefined` — contrat asset-ready.
 *
 * @example
 *   resolveAsset('elias__adversary__adversary_peur_angoisse')
 *   // → { type: 'placeholder', value: '#8b5cf6', label: 'La Peur' }
 */
export function resolveAsset(assetId: string): IllustrationEntry {
  const entry = ILLUSTRATION_REGISTRY[assetId];
  if (entry !== undefined) return entry;

  // Fallback : dérive la couleur depuis le sender contenu dans l'assetId
  if (assetId.includes('__heaven__'))    return placeholder(_HEAVEN_COLOR,     "L'Esprit");
  if (assetId.includes('__adversary__')) return placeholder(_ADVERSARY_COLOR,  "L'Adversaire");
  if (assetId.includes('__entourage__')) return placeholder(_ENTOURAGE_COLOR,  'Entourage');
  if (assetId.includes('__conscience__')) return placeholder(_CONSCIENCE_COLOR, 'Conscience');

  // Dernier recours — placeholder neutre
  return placeholder('#64748b', 'Élias');
}
