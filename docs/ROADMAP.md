# ROADMAP — Élias (file de tâches du `release-lead`)

> File pilotée par l'agent `.claude/agents/release-lead.md`.
> **1 tâche cochée = 1 commit revert-able + 1 entrée dans `docs/ITERATION_LOG.md`.**
> Cette ROADMAP est la source de vérité de la *file* (quoi / dans quel ordre / état).
> `ITERATION_LOG.md` reste la source de vérité du *process* (pourquoi / comment / preuve QA / rollback).
> Porte QA obligatoire avant chaque commit : `bash tools/qa-gate.sh` (sans Playwright).

## ⏭️ PROCHAINE SESSION — file priorisée (au 2026-06-29, après itér.97)

> **État** : Phase G 5/6 close (G-1/2/3/5/6). Reste **G-4** (découpe `App.tsx`, 1293→**1175** l.) puis **Phase 5 lot 2**.
> Rituel par tâche : 1 extraction/lot = 1 commit · `bash tools/qa-gate.sh` VERT · vérif rendu `e2e.mjs --until restart` (0 err console) · entrée ITERATION_LOG · case cochée ici. Démarrer : `node tools/status.mjs`.

1. **G-4 ext.4 — `useLivingJournal`** : sortir l'effet « journal vivant » (offline + IA) d'`App.tsx`.
   ⚠️ Il PORTE l'exception assumée `react-hooks/set-state-in-effect` (génération de contenu) → **mettre à
   jour la réf de l'invariant CLAUDE.md §4** (« …dans `App.tsx` » → « …dans le hook `useLivingJournal` »).
   Params : age/gameOver/stats/season/calling/traits/successRate/lifeContext/parentNames/actionsThisYear/
   playerName + `setAiJournalEntries`. Relocaliser imports `deriveEchoes`/`generateOfflineJournal`/
   `generateJournalEntry`/`isAiEnabled` (vérifier orphelins dans App).
2. **G-4 ext.5 — bootstrap d'init** (`useAppBootstrap`) : l'effet de montage (juice/lifetime-codex/onboarding/
   save/prefs/flush). Prop-surface = setters ; garder la charge prefs VERBATIM (cf. bug latent ci-dessous).
3. **G-4 ext.6 — `<GameOverlays>`** : montage des overlays. Gros prop-surface, **2 branches de rendu**
   (gameOver vs jeu) → faire posément, peut se scinder (overlays jeu d'abord). Alternative : extraire le
   `<GameOverScreen>` (bloc `if overNow`) d'abord (chunk contigu plus cohérent).
   → Quand `App.tsx` est « raisonnable », **clore G-4** (cocher dans la section Phase G).
4. **Phase 5 lot 2 — densité narrative** (expérience joueur) : réécrire ~15-20 épreuves de **spine** plates
   pour créer de la tension AVANT le verset (candidates repérées : `e-bilan-002/003/004/005`, `e-fond-002`,
   `e-prod-*` ; **PAS** les cascades `-c`). Ton grâce>punition. `npm run validate` + relire au rendu.

**Différé (décision explicite, ne pas faire en « refactor pur »)** : `useAccessibilityPrefs` — l'extraire
CHANGERAIT le comportement (corrige un bug LATENT : l'effet de persist écrit les défauts au montage avant
le chargement async → les prefs ne survivent pas au reload). À traiter comme un **FIX explicite + testé**,
hors G-4. Cf. ITERATION_LOG itér.95.

**Outils prêts** : `tools/status.mjs` (état dérivé + `--check`), `e2e.mjs` (parcours réel), `code-review-graph`
(analyse d'impact avant un changement transverse — politique G-5b).

## 🟢 DONE
- [x] **T-A** lint lot A — 27 erreurs sûres (no-unused-vars/no-empty/prefer-const) → itér. 21 / `1bdc150`
- [x] **T-B** lint lot B — `no-explicit-any` ×8 typés → itér. 21 / `356a6c8`
- [x] **T-C** lint lot C — fast-refresh `only-export-components` ×5 (iconMeta) → itér. 21 / `2d01cc4`

## 🟢 DONE — hors-file (correctifs playtest itér. 69-76)
> Travail livré **en réaction aux playtests**, hors de la file planifiée. Tracé ici a posteriori
> (itér. de réconciliation) pour que la ROADMAP redevienne le miroir fidèle de HEAD — la dérive
> venait de ce que ces lignes ne vivaient que dans `CLAUDE.md` / `ITERATION_LOG.md`.
- [x] **itér. 69** Fluidité roman-visuel (scène lue avant le verset, fix panneau Appel, choix d'album) → `e6112e8`
- [x] **itér. 70** Polish éditorial : 9 échos décennaux de jeunesse (320→329 events) → `24310ac`
- [x] **itér. 71** Arc-ami : {ami} évolue (5 scènes hors-spine) + flag `ami_parti` + 3 contradictions corrigées → `db52c75`
- [x] **itér. 72** Finances jouables : la pauvreté ne tue plus + action **Travailler** → `8e9dc2a`
- [x] **itér. 73** Leurres plus proches : `pickDecoys` en 3 paliers (distracteurs pertinents) → `02a144e`
- [x] **itér. 74** Mode wordBank honoré dès la 1ʳᵉ découverte + garde `canWordBank` → `e028b7f`
- [x] **itér. 75** Musique débloquée au 1ᵉʳ geste (`armAudioUnlock`) → `d0a4139`
- [x] **itér. 76** Levier physique mesuré (survie ↔ précision : `FAIL_PHYSIQUE_PENALTY` + action **Repos/sabbat**) → `bac0352`
- [x] **itér. 77** Réconciliation docs — clôture Phase 4 (v0.2.0) → `923c753`
- [x] **itér. 78** Le tutoriel ne casse plus le rendu (setState inter-composants `TutorialOverlay`→`App`), trouvé au playtest → `ae3a7bb`
- [x] **itér. 79** Témoignage de fin de vie incassable — couverture de l'état viral `testimonyGenerator` (4 tests, états limites) → `5734003`
- [x] **itér. 80** Cohérence PWA — manifest `lang:'fr'` (était `en` par défaut), audit assets de prod 0 cassé → `07f6cfc`
- [x] **itér. 81** **Save-compat (bug grave)** — `saveGame` whitelist complétée (`playerName`/`calling`/`seed`/`traits`) : recharger ne perd plus l'identité. Garde `tests/persistence.test.ts` → `3775f2e`
- [x] **itér. 82** Tour guidé — `useTargetRect` clé sur le `selector` : la dernière étape (`.btn-age`) n'est plus avalée par la cascade de saut des étapes absentes. Trouvé en revue de code. Garde `tests/tutorialOverlay.test.tsx` → _(à committer)_

## 🟡 IN-PROGRESS  (≤ 1 tâche à la fois — invariant 1 = atomicité)
- (vide)

## 🔵 TODO  (tête de file = prochaine tâche)

### Phase 1 — Assainissement hooks (27 erreurs restantes, par fichier, du + sûr au + risqué)
- [x] **T-1** `src/hooks/useTypewriter.ts` — set-state-in-effect ×1 → 0 (dérivation rendu + test jsdom) → itér. 22 / `e9440b1`
- [x] **T-2** `src/components/StatBar.tsx` — set-state-in-effect ×1 → 0 (souscription store + helper pur) → itér. 23 / `871f74a`
- [x] **T-3** `src/components/DailyVerse.tsx` — set-state-in-effect ×1 → 0 (dérivation rendu, helper pur) → itér. 24 / `f7421b2`
- [x] **T-4** `src/components/DevPanel.tsx` — set-state-in-effect ×2 → 0 (init paresseuse + handler de seuil) → itér. 25 / `9070680`
- [x] **T-5** `src/components/DebugView.tsx` — set-state-in-effect ×1 + exhaustive-deps ×2 → 0 (ordre seedé dérivé + état-marqueur + helper pur) → itér. 26 / `7ee47cf`
- [x] **T-6** `src/components/ActionPanel.tsx` — rules-of-hooks ×1 → 0 (renommage useAction→runAction, faux positif) → itér. 27 / `4003612`
- [x] **T-7** `src/components/ShareCard.tsx` — purity ×1 + refs ×1 + exhaustive-deps ×1 → 0 (init paresseuse du tirage + helper copie + deps honnêtes) → itér. 28 / `63132ba`
- [x] **T-8** `src/components/VerseChoices.tsx` — purity ×1 + refs ×1 + rules-of-hooks ×1 → 0 (ordre seedé dérivé `choiceOrder.ts` + timer en effet + Hooks remontés) → itér. 29
- [x] **T-9** `src/App.tsx` — purity ×5 + exhaustive-deps ×2 + set-state-in-effect ×5 → 0 (5 sous-commits T-9a..e, vérif navigateur) → itér. 31 / `283d1c9`→`88568b7`
      ↳ **Phase 1 TERMINÉE : `react-hooks/* = 0` sur tout le projet.** (1 exception assumée+justifiée : génération du journal vivant.)

### Phase 1bis — Dette de TYPE révélée (le `tsc --noEmit` était creux — cf. itér. 30) — ✅ TERMINÉE (itér. 32)
> Le vrai typecheck (`tsc -p tsconfig.app.json`) exposait **12 erreurs préexistantes** masquées depuis
> le début. Baseline `tools/tsc-baseline.txt` ramenée **12 → 0**.
- [x] **T-T1** `game/data/loader.ts` (2→0 — import réparé + casts JSON→type alignés sur src/data) → itér. 32
- [x] **T-T2** `src/components/CodexMenu.tsx` (2→0 — `Partial<Record<AfflictionCategory,…>>`) → itér. 32
- [x] **T-T3** `src/components/Prologue.tsx` (2→0 — `val ?? 0` + champ `name` complété) → itér. 32
- [x] **T-T4** `src/data/events.ts` + `src/data/verses.ts` (2→0 — casts JSON→type) → itér. 32
- [x] **T-T5** `src/engine/gameEngine.ts` (3) + `src/App.tsx` (1 — `gameOver?.isOver`) → itér. 32
      ↳ **Phase 1bis TERMINÉE : dette de TYPE = 0.** (`npx tsc -p tsconfig.app.json --noEmit` → 0 erreur.)

> ⏸ **PAUSE OBLIGATOIRE en fin de Phase 1/1bis** : rendre la main avant la Phase 2 (nature différente).

### Phase 2 — Contenu (GDD §11.1 C1)
> ⚠️ **Réconciliation itér. 32** : T-10…T-15 étaient déjà livrés par la PR #12 (`50c3c8a`
> « 6 arcs manquants + events senior ») **avant** la rédaction de ces lignes — vérifié sur HEAD
> (`npm run validate` vert, 186 events, tous les spines d'arc présents). Cochés a posteriori.
- [x] **T-10** Events arc **ami** — 8 events de spine + 8 cascades d'échec (âges 8–78) → PR #12 / vérifié itér. 32
- [x] **T-11** Events arc **métier** — spine 5/5 → PR #12 / vérifié itér. 32
- [x] **T-12** Events arc **parents** — spine 6/6 → PR #12 / vérifié itér. 32
- [x] **T-13** Events arc **église** — spine 4/4 → PR #12 / vérifié itér. 32
- [x] **T-14** Events arc **ville** — spine 3/3 → PR #12 / vérifié itér. 32
- [x] **T-15** Events âges **90-100** — chaque âge 90→100 couvert par 7 à 15 events → PR #12 / vérifié itér. 32
- [x] **T-16** Rééquilibrage **courbe difficulté senior** — outillé par `tools/survival-sim.ts` (itér. 34) puis
      tuné/mesuré (itér. 35, Piste B) : inversion supprimée, victoire(100) atteignable, ≥60 ans ~3-17 %→94-97 %.
- [x] **T-17** **Mode découverte** (entraînement sans conséquence de stats) — reporté (Tier 4, voir Phase 3) → itér. 49

## Phase 3 — Fluidité & rejouabilité : le « fil polyphonique » (inspiré 7 Days / chat-narratif)

> **But** : casser le décrochage post-18-25 ans (« trop routinier, sans différenciation »). Verdict d'audit
> (itér. 32-34) : **tous les systèmes existent** ; le manque est la *mise en scène* et la *visibilité*.
> Vision (validée avec le porteur) : la vie d'Élias = un **fil de messages** de 4 émetteurs — **le Ciel/l'Esprit**,
> **l'adversaire** (une voix par affliction), **l'entourage** (amis/famille/collègues/église), **la conscience** —
> auxquels Élias **répond par un verset**. L'émetteur se **dérive** de `category` + `storyArcId` (zéro migration).
>
> **🎨 Principe transverse « ASSET-READY » (NON négociable sur cette phase)** : tout émetteur / event / **lieu**
> (ville, église) / **objet** expose un *slot d'illustration* (`assetId`) qui résout aujourd'hui en placeholder
> dérivé (couleur + icône `AFFLICTION_COLORS`/`ENEMY_COMPONENTS`) et **pointera plus tard vers de l'art**
> (avatars, illustrations de lieux/objets) **sans refactor**. Les visuels arriveront au fil du temps ; le code
> doit déjà avoir le trou prévu. Cf. T-31/T-32.
>
> 1 tâche = 1 commit revert-able + porte QA verte. Priorité = impact sur la différenciation.

### Tier 1 — Différenciation (impact max, réutilise l'existant) ← **tête de file**
- [x] **T-20** `src/engine/messageSender.ts` (module **pur** + tests) — dérive `{ sender, displayName, color,
      iconKey, assetId }` d'un event/entrée de journal (Ciel / Adversaire / Entourage / Conscience). **Fondation
      + porte d'entrée asset-ready.** → itér. 37 / `bb3d09e`
- [x] **T-21** **Journal = fil de bulles attribuées** (le `.tsx` mappe T-20) : nom + couleur + icône d'émetteur,
      bulles gauche/droite, `assetId`→placeholder. `JournalBubble.tsx` + CSS pur. → itér. 38
- [x] **T-22** **Conséquences visibles (echoes amplifiés)** — bulle de rappel `[ECHO_LINK]` injectée avant chaque épreuve
      conditionée (prerequisites actifs) : libellé sobre + âge source si disponible. Module pur `echoLink.ts` + 23 tests. → itér. 39
- [x] **T-23** **Variantes narratives 6.5 %→22 %** — 29 events enrichis (Appel/saison), 41/186 events
      conditionnés, `applyNarrativeVariant` (déjà câblé) exploitée pleinement. → itér. 40

### Tier 2 — Rythme & direction
- [x] **T-24** **Chapitres de vie** : carte d'intro de décennie (thème/saison) + **cliffhanger** de fin de décennie.
      Module pur `lifeChapters.ts` + 35 tests, branché dans `advanceAge`, CSS distinct `[CHAPITRE]`/`[CLIFFHANGER]`. → itér. 41
- [x] **T-25** **Ambition de run** : module pur `runAmbition.ts` (deriveRunAmbition + getCallingProgress) + composant `AmbitionTracker.tsx` (bouton « MON APPEL » + panneau coulissant, prefers-reduced-motion, 15 tests) → itér. 42 / `3613095`

### Tier 3 — Reskin « conversation » complet (UX)
- [x] **T-26** Épreuve = **bulle entrante** + indicateur « … en train d'écrire » (`TypingIndicator.tsx`, `prefers-reduced-motion`, CSS `ti-bounce`). → itér. 44
- [x] **T-27** Versets = **chips de réponse** → bulle envoyée (réponse d'Élias) → réponse de la voix. → itér. 45
- [x] **T-28** **Voix de l'adversaire nommées/typées** (La Peur, Le Doute, l'Amertume…) via couleurs + SVG existants. → itér. 46

### Tier 4 — Agence, profondeur & contenu
- [x] **T-29** **Choix moraux** (sous-type d'event : 2-3 *actes* qui posent des flags, au-delà du verset) — schéma + `validate`. → itér. 47
- [x] **T-30** **Contenu C1** : 8 catégories à 2 events → ≥5 ; +13 events seniors 75-100. Total 189→226 events. → itér. 48 / `6dd95e8`
- [x] **T-17** **Mode découverte** (entraînement sans conséquence de stats) → itér. 49

### Transverse — Intégration graphique (continu, au fil de l'arrivée des assets)
- [x] **T-31** **Registre d'assets** (`src/assets/illustrationRegistry.ts`) : map `assetId`→illustration pour
      émetteurs (avatars entourage/adversaire), **lieux** (ville/église), **objets** ; résout en placeholder tant
      que l'art manque. Consommé par T-20/T-21 **dès le départ** (asset-ready) ; rempli progressivement.
      → itér. 50 / 36 assetId couverts, `JournalBubble` branché sur `resolveAsset()`, 52 tests.
- [x] **T-32** **Expressions d'avatar** (6 expressions × 4 émetteurs) pilotées par ton/résultat — module pur
      `avatarExpression.ts` + ~75 variantes dans `illustrationRegistry.ts` + branché `JournalBubble`. → itér. 51 / `c27fc19`

## 🎯 Definition of a new version (v0.1.0)
Atteinte quand :
1. **Phase 1 verte** : `npx eslint . -f json` → **0** erreur `react-hooks/*` sur les 9 fichiers ciblés.
2. **≥ 3 arcs C1 jouables** (events présents, `npm run validate` vert).
3. **4 portes QA vertes** sur HEAD (`bash tools/qa-gate.sh` → exit 0).

---

## Phase 4 — Équilibre contenu & polish déterministe (v0.2.0)

> **Audit itér. 51 (2026-06-20)** : diagnostic corrigé après vérification du code.
> T-33/T-35/T-36/T-38 étaient de **faux trous** — déjà implémentés (voir détail ci-dessous).
> Seul T-34 est un vrai manque de contenu. Nouveau trou détecté : `pickDecoys` non seedé.
>
> **Faux trous confirmés (ne pas réimplémenter) :**
> - T-33 leurres : `pickDecoys()` (`src/data/events.ts:13`) génère les leurres à la volée si `decoyVerseIds` vide.
> - T-35 SRS : `getSrsPriorityVerses()` (`gameEngine.ts:388`) branché dans `advanceAge` lignes 822-832.
> - T-36 titres : `determineTitle()` + `computeFinalMetrics()` (`gameEngine.ts:1593,1632`) + affiché App.tsx.
> - T-38 graine : `ShareCard.tsx:64` affiche déjà `Graine : ${seed} (rejoue la même vie)`.
> - T-37 saisons audio : code en place (`juice.ts:playSeasonTrack`), manque = assets `.mp3`, pas du code.

### Tier 1 — Équilibre contenu (RÉEL)
- [x] **T-34** **Catégories sous-représentées** — **cible atteinte organiquement** (itér. 53→76).
      Vérifié sur HEAD (334 events) : `impudicite_addiction` **8**, `culpabilite` **9**,
      `abondance_financiere` **8** — toutes ≥ 8. Et `amertume_rejet` est descendu de 19 % → **14,4 %**
      (48/334) par enrichissement des autres, comme souhaité. Mesuré : `node -e` de comptage par
      catégorie sur `game/data/events.json`. **Aucune rédaction nécessaire** → coché à la
      réconciliation (cf. Definition v0.2.0).

### Tier 2 — Déterminisme & qualité
- [x] **T-39** **`pickDecoys` seedé ?** — DÉCISION (2026-06-20) : **garder `Math.random()`**.
      `pickDecoys` est appelé avec `recentVerseIds` en exclusion (gameEngine.ts:853) → variété
      pédagogique intentionnelle. La graine pilote le backbone, pas les leurres (couche présentation).
      Le CHOIX seul pilote la divergence narrative — CLAUDE.md §RNG seedé.

### Tier 3 — Assets audio saisons
- [x] **T-40** ✅ **RÉSOLU (constat itér.85)** — plus besoin d'`ambient-{saison}.mp3`. `juice.ts`
      (`SEASON_TRACKS`, l.253-261) mappe les 5 saisons vers des `soundtrack-N.mp3` **présents** dans
      `public/audio/` (8 fichiers). Le blocage d'origine (fichiers absents → musique muette) est
      supprimé par ce remappage. Aucune production d'asset nécessaire.

### 🎯 Definition of v0.2.0 — ✅ ATTEINTE (réconciliation, cf. itér. de clôture)
Atteinte quand :
1. ✅ Catégories `impudicite_addiction`/`culpabilite`/`abondance_financiere` à ≥ 8 events (T-34 : 8/9/8) + `npm run validate` vert.
2. ✅ Décision T-39 prise + appliquée (garder `Math.random()` — couche présentation, cf. CLAUDE.md §RNG seedé).
3. ✅ `bash tools/qa-gate.sh` → exit 0.
> T-40 (audio) reste ouvert mais **ne gate pas** v0.2.0 (production d'assets, hors code).
> **Prochaine file : Phase 5 « De quiz à roman visuel »** (densité narrative + Testimony/Chapter) —
> cf. plan d'organisation + `docs/DESIGN_PARTIE2.md`.

---

## Phase F — Finalisation « jeu livrable » (v0.3.0) — ✅ ATTEINTE (itér. 77-82)

> Passe de finalisation pilotée en orchestrateur (playtest réel + audit + revue de code).
> But : un jeu **jouable de bout en bout, robuste et installable** — pas de nouveau contenu, on
> durcit l'existant. Chaque défaut trouvé = 1 commit revert-able + garde de test.

- [x] **F-1** Réconciliation docs (itér. 69-76 dans la ROADMAP) + clôture v0.2.0 → itér. 77 / `923c753`
- [x] **F-2** Bug de rendu du tutoriel (`setState` inter-composants `TutorialOverlay`→`App`) → itér. 78 / `ae3a7bb`
- [x] **F-3** Témoignage de fin de vie incassable (couverture de l'état viral) → itér. 79 / `5734003`
- [x] **F-4** Cohérence PWA (manifest `lang:'fr'`) + audit assets de prod (0 cassé) → itér. 80 / `07f6cfc`
- [x] **F-5** **Bug GRAVE save-compat** : recharger perdait nom/vocation/graine/traits → itér. 81 / `3775f2e`
- [x] **F-6** Tour guidé : dernière étape avalée (trouvé en revue de code) → itér. 82 / `f4af4f8`

### 🎯 Definition of v0.3.0 « livrable » — ✅ ATTEINTE
1. ✅ Jouable naissance → mort → témoignage → rejouer (interaction verset vérifiée au playtest).
2. ✅ **0 erreur console** sur parcours réel (smoke `run-elias`).
3. ✅ Sauvegarde fiable : recharger préserve l'identité (garde `tests/persistence.test.ts`).
4. ✅ PWA installable valide (manifest cohérent, SW + workbox, 0 asset cassé).
5. ✅ 510 tests verts, dette type = 0, `react-hooks/* = 0`, `bash tools/qa-gate.sh` → exit 0.

### Reste hors-périmètre « livrable » (enrichissement, non bloquant)
- [x] **T-40** audio saisons → **RÉSOLU** (constat itér.85) : saisons mappées sur soundtracks présents.
- **Phase 5** densité narrative éditoriale (réécriture d'épreuves + échos décennaux) :
  - [x] **Lot 1** — 8 échos décennaux (342 events) → itér. 85.
  - [ ] **Lot 2+** — réécriture de ~15-20 épreuves (tension avant le verset) + échos restants (à la demande).
- [x] **Décision produit tranchée** → **apprentissage persistant cross-parties** (façon SRS) :
  codex « à vie » accumulé, types `completion`/`reference` désormais atteignables → itér. 84 / `codexMemory.ts`.

---

## Phase G — Dette systémique & méthode (issu de l'audit itér.85)

> **Constat d'audit** : le cœur (moteur/tests/données/outillage) est un vrai SYSTÈME qui grandit ;
> mais **3 couches sont restées LINÉAIRES** (à retoucher à chaque fois) + la méthode est **réactive**
> (rattrape les trous au lieu de les prévenir). Cette phase transforme ces 3 couches en systèmes et
> rend la porte/le suivi fiables. ROI décroissant — Tier 1 d'abord (rapide, anti-gaspillage).

### Tier 1 — Anti-gaspillage (rapide, à faire en premier)
- [x] **G-1** (audit C) **Fixer le trou de la porte QA** → itér. 87. Cause réelle (mesurée) : `console.log(nombre)`
      de Node colorise en TTY → `count_errs` renvoyait `\033[33m1\033[39m`, la comparaison `-gt` échouait
      en silence et tombait sur ✓ (régression lint MASQUÉE). Le remède noté ici (`tr -dc '0-9'`) était faux
      (gardait les chiffres des codes couleur). Corrigé à la **source** : `process.stdout.write(String(n))`.
      Critère vérifié : fichier fabriqué à +1 erreur → porte ROUGE. Porte complète verte.
- [x] **G-2** (audit B) **Statut dérivé, pas narré** → itér. 88. `tools/status.mjs` (module pur
      `deriveStatus`/`checkDocs` + CLI) GÉNÈRE l'état (events/versets/dilemmes, dernière itér., HEAD,
      `--tests` → compte vitest réel) depuis git + `game/data/*`. `--check` rougit si la prose canonique
      de CLAUDE.md ment — révélait 4 valeurs stales (118 v/186 e → 188/342), corrigées. **Câblé étape
      5/6 de la porte QA** (anti-dérive permanent, pas un outil qui dort). +3 tests. Effort : faible.

### Tier 2 — Systématiser l'UI (le plus gros écart : 419 styles inline / 27 tokens)
- [x] **G-3** (audit A) **Design tokens** — SYSTÈME LIVRÉ + cœur gameplay migré (itér.90-94).
      - [x] **Lot 0 — système** (itér.90) : `src/styles/tokens.ts` (`color`→`var(--…)` donc rendu
            identique + thème en 1 endroit ; échelles `space`/`radius`/`fontSize`/`weight`/`tracking` ;
            helper composable `alpha(rgb,a)`). Contrat verrouillé par `tests/tokens.test.ts`.
      - [x] **Lot 1 — ActionPanel** (itér.90) : migré à valeur byte-identique (référence du patron).
      - [x] **Lot 2 — CodexMenu** (itér.91) : migré à valeur byte-identique (couleurs→tokens,
            `12→fontSize.md`/`8→radius.md`/`700→weight.bold`…). Shadowing local `color` résolu
            (`catColor`). Démarré par `release-lead` (coupé par limite session), revu + validé + commité par le lead.
      - [x] **Lot 3 — AmbitionTracker** (itér.93) : migration partielle sûre (couleurs `var(--…)`
            + nombres du barème) ; laissés littéraux la couleur DYNAMIQUE de l'appel (`${callingColor}…`)
            et les hex sémantiques #34d399/#fbbf24 (hors :root). Rendu identique.
      - [x] **Lot 4 — ShareCard** (itér.94) : `var()`+barème migrés ; rgba/hex one-off (#4ade80/#a78bfa) laissés.
      - **Différés à dessein** (palette BESPOKE hors `:root`, faible gain / risque de dérive de teinte
        non détectable par la porte ni le harnais) : `Onboarding` (splash plein écran, `'Cinzel',serif`
        ≠ `--font-display`, hex sépia uniques) et `LexiconMenu` (UI « livre/parchemin », bruns uniques).
        Le SYSTÈME tokens est livré et le **cœur gameplay** (ActionPanel/CodexMenu/AmbitionTracker/ShareCard)
        est migré. Ré-ouvrable si ces écrans sont retravaillés visuellement.

### Tier 3 — Composition & prévention
- [~] **G-4** (audit D) **Découper `App.tsx`** — EN COURS (1 extraction = 1 commit, vérifié `e2e.mjs`).
      - [x] **Extraction 1 — `useGameFeedbackFx`** (itér.95) : 5 effets de juice impératif (result/
            gameOver/combo/level-up + reset) + 3 refs de garde sortis en hook. Rendu identique, e2e vert.
      - [x] **Extraction 2 — `useAmbientMusic`** (itér.96) : 2 effets musique (ralenti dynamique +
            sélection unifiée album/saison) + ref `lastMusicSig` sortis ; setters d'état restés dans App.
            Rendu/audio identiques, e2e vert.
      - [x] **Extraction 3 — `useAiEventPrefetch`** (itér.97) : pré-génération d'événement IA (bonus)
            + ref `generatingAiEvent` sortis ; imports `generateDynamicEvent`/`pickDecoys` relocalisés.
            Rendu identique, e2e --until restart vert. **App.tsx : 1293 → 1175 lignes.**
      - [ ] **Extractions suivantes** (au besoin) : `useLivingJournal` (journal vivant — porte l'exception
            assumée set-state-in-effect, cf. invariant CLAUDE.md §4 → mettre à jour la référence), bootstrap
            d'init, et `<GameOverlays>` (gros prop-surface, 2 branches de rendu → à faire posément).
      - **Différé** : `useAccessibilityPrefs` — l'extraction CHANGERAIT le comportement (corrige un bug
        latent de persistance des prefs, non vérifiable par e2e) → à traiter comme un FIX explicite, pas
        un refactor pur. Documenté dans l'ITERATION_LOG itér.95.
- [x] **G-5** **Prévention > réaction** → itér. 89. (a) Garde SYSTÉMIQUE (pas juste une note) :
      `tests/persistence.test.ts` confronte `Object.keys(createInitialState())` aux clés réellement
      persistées par `saveGame` (via le mock localforage) → un champ ni whitelisté ni explicitement
      exclu fait ROUGIR la porte ⇒ le bug itér.81 est désormais impossible. Politique liée dans
      CLAUDE.md §Save-compat. (b) MCP `code-review-graph` : **adopté pour les refactors transverses
      G-3/G-4** (analyse d'impact AVANT), hors contenu. +1 test. Effort : faible.
- [x] **G-6** **Harnais e2e stable** → itér. 92. `e2e.mjs` paramétré (`--until birth|death|restart`,
      `--port`/`--max-steps`/`--name`/`--shots`) dans `.claude/skills/run-elias/scripts/`. Gère le gate
      `descDone` (clic `.event-description`), « J'AI COMPRIS », le ChapterCard de décennie (« CONTINUER → »),
      le TestimonyCard (« VOIR LE BILAN DE VIE → »), la mort (`.btn-restart`) et le restart. **Validé en
      réel** : naissance→mort→restart, 0 erreur console (confirme au passage que les migrations de tokens
      G-3 ne cassent rien à l'écran). Documenté dans `SKILL.md`. Effort : moyen.

> Note méthode : la porte QA est **sans navigateur** par choix → les bugs de RENDU (cf. itér.78)
> lui échappent. G-1 peut ajouter le `smoke` (0 erreur console) en étape optionnelle non bloquante.
