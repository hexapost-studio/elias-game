# CLAUDE.md — Élias : Le Combat d'une Vie

Contexte de travail pour Claude Code. Lu à chaque session : garder **court et à jour**, pointer
vers les docs détaillés plutôt que les recopier.

## Le projet

Life-simulator chrétien façon BitLife (âge 0–100) où les épreuves se résolvent en choisissant le
**bon verset biblique**. Public : communauté francophone EJP/ICC. Stack : **React 19 + TypeScript +
Vite + Zustand + localforage** (PWA).

- Branche de travail : **`feat/exceptional-game`**.
- Boucle d'amélioration autonome, journal vivant : **`docs/ITERATION_LOG.md`** (source de vérité du
  processus). Cadrage produit des grands chantiers : **`docs/DESIGN_PARTIE2.md`**. GDD : `docs/GDD_ELIAS.md`.

## Règles d'or (invariants — NON négociables)

1. **Réversible** : 1 itération = 1 commit `git revert`-able.
2. **Modulaire** : « systèmes, pas features ». Logique en **module pur** (testable), le `.tsx` ne fait que mapper.
3. **Dériver plutôt qu'ajouter du state** : reconstruire l'affichage depuis l'état présent (ex. `engine/arcProgress.ts`).
4. **Normes AAA** : rendu **pur** (jamais de `setState`-in-effect), `prefers-reduced-motion` respecté, pas de gore.
   (1 exception assumée + justifiée : génération du journal vivant dans `App.tsx` — voir itér. 31.)
5. **Vérifié AVANT commit** : `bash tools/qa-gate.sh` vert (typecheck réel + `vitest` + `build` + `validate` + lint-diff).
6. **JAMAIS de dette ajoutée** : comparer **par fichier touché** vs `HEAD`. Le lint `react-hooks/*` est
   à **0** (assaini itér. 21–31) **et** la dette de **TYPE** est à **0** (baseline `tools/tsc-baseline.txt`
   = 0, assainie itér. 32). Garder ces deux compteurs à zéro : ne jamais committer une régression.
7. **Ton évangéliste, grâce > punition** : l'échec ouvre un chemin plus humble, jamais avilissant.

## Vérification (tout vert avant de committer)

```bash
bash tools/qa-gate.sh   # PORTE : typecheck + vitest + build + validate (188 v / 342 e) + cohérence-doc + lint-diff
# (compte de tests volatile → non épinglé ici ; `node tools/status.mjs --tests` donne le vrai nombre)
```

⚠️ **`npx tsc --noEmit` seul est un NO-OP** ici : le `tsconfig.json` racine a `files:[]` + `references`,
donc rien n'est vérifié. Le vrai typecheck est `npx tsc -p tsconfig.app.json --noEmit` (ou `tsc -b`) —
c'est ce que fait la porte, avec un **ratchet** vs `tools/tsc-baseline.txt`. Détail des étapes
individuelles : `npx vitest run`, `npx vite build`, `npm run validate`.

Vérif **comportementale** optionnelle (hors porte, sans navigateur dans la QA auto) : skill `run-elias`
(`scripts/smoke.mjs` = boot + parcours + 0 erreur console ; `drive.mjs` = captures). Pilotage Playwright.

## Patrons & conventions

- **RNG seedé** : `src/engine/rng.ts` (`mulberry32`/`hashSeed`). La graine ne pilote que le *backbone*
  (naissance/appel/saisons) — **jamais** la divergence narrative (pilotée par le CHOIX → déterminisme préservé).
- **Save-compat** : spread-merge `createInitialState`/`hydrateFromSave` **+** whitelist explicite dans
  `saveGame` (`src/data/persistence.ts`). Tout nouveau champ d'état doit être ajouté à la whitelist, sinon perdu.
  🛡️ **Garde automatique (itér.89/G-5)** : `tests/persistence.test.ts` échoue si un champ de
  `createInitialState` n'est ni whitelisté ni explicitement exclu — le bug itér.81 ne peut plus revenir.
- **Réglages transverses** : `useSyncExternalStore` (cf. `settings/textSpeed.ts`, `settings/seenText.ts`).
- **Sources de données** : arcs = `src/data/storyArcs.ts` (lu par le code) **et** `game/data/storyArcs.json`
  (lu par le validateur — garder synchro) ; events = `game/data/events.json` (342) ; versets = `game/data/verses.json` (188).
  ⚙️ Compteurs DÉRIVÉS (ne pas recopier à la main, ils dérivent) : `node tools/status.mjs` ; `--check` rougit si cette prose ment.
- **Branchement narratif (B)** : modèle « **spine canonique + variantes hors-spine** » — `arc.eventIds[]` =
  un id par position (goulets de convergence) ; variantes flag-gated hors `eventIds` ; cascades `-c` =
  détours d'échec (≠ bifurcations). Helpers purs : `engine/gameEngine.ts isArcStepUnlocked`,
  `engine/storyGraph.ts validateStoryGraph` (DFS itératif), `engine/arcProgress.ts` (visualizer).

## État des itérations (36 livrées)

| # | Livrable | Commit |
|---|---|---|
| 1–8 | Flow lecture, échos, révélations, réactions victoire, vignette, codex vivant, réactions revers, durcissement AAA | (voir log) |
| 9 | **D** — Identité du personnage (saisie nom, propagation) | `73ed5ad` / `11fea21` |
| 10 | **A** — Graines partageables (naissance déterministe, graine actionnable) | `abeb0dc` |
| 11 | Smart skip « texte déjà-lu → instantané » | `6fa599a` |
| 12 | **B-1** — Branchement moteur (flags + DFS + arc-louise) | `30f2068` |
| 13 | **B-2** — Visualizer du branchement (bandeau de pas `●─●─◆─○`) | `e9ef1f1` |
| 14 | Onboarding zéro-friction — tuto enchaîne sur le Prologue (1ʳᵉ vie nommée) | `d4518a6` |
| 15 | Feedback précoce — le Prologue rattrape [ÉVEIL]/[SAISONS] (mode d'emploi ActionPanel) | `d59310a` |
| 16 | Récompense de collection — chaque verset qui rejoint le Grimoire est célébré (`[GRIMOIRE]`) | `117ae97` |
| 17 | Fix — un bonus de combo conserve son annonce de journal `[COMBO xN]` | `b05095d` |
| 18 | Déparkage feedback Supabase (clé publishable + MCP + tests hermétiques) | `67e1495` |
| 19 | Boucle feedback live — table Supabase créée, durcie (anti-spam), vérifiée bout-en-bout | `7135262` |
| 20 | Correctifs playtest — « +1 » de jauge discret + verset révélé même en cas d'erreur (tuto) | `9bb3ea9` |
| 21 | Assainissement lint — lots A/B/C (sûr/typage/fast-refresh), lint 67→27 | `1bdc150`/`356a6c8`/`2d01cc4` |
| 21bis | Orchestration — `docs/ROADMAP.md` + `tools/qa-gate.sh` + agent `release-lead` | `d15aea6` |
| 22–29 | **Phase 1 lint hooks** (T-1..T-8) : useTypewriter, StatBar, DailyVerse, DevPanel, DebugView, ActionPanel, ShareCard, VerseChoices → 0 | `e970477`…`e7510ee` |
| 30 | **Fix CRITIQUE** : la porte QA ne typecheckait rien (`tsc --noEmit` no-op) → `tsc -p` + ratchet baseline | `7d801ca` |
| 31 | **Phase 1 / T-9** : `App.tsx` 12 erreurs hooks → 0 (5 sous-commits, vérif navigateur). **`react-hooks/* = 0` projet.** | `283d1c9`…`88568b7` |
| 32 | **Phase 1bis / T-T1..T-T5** : 12 erreurs de TYPE → 0 (baseline 12→0, smoke vert). **Dette de type = 0.** | `ce9b604`…`7197c64` |
| 33 | **Fix** : le verset s'affiche EN ENTIER dans le journal, succès comme échec (asymétrie corrigée) | `cef5b66` |
| 34 | **Piste M** : harnais `tools/survival-sim.ts` (headless, hors porte) — mesure l'âge médian de mort / routine | `6c46312` |
| 35 | **Piste B** : rééquilibrage senior MESURÉ (inversion supprimée, victoire(100) atteignable, ≥60 ans 3-17 %→94-97 %) | `fc027bf` |
| 36 | **Phase 3 backlog** : fil polyphonique 7 Days-like (T-20..T-32) + principe **asset-ready** | `8c004b2` |
| 69 | **Fluidité roman-visuel** : scène lue AVANT le verset (`descDone` gate, principe ①) + fix panneau Appel (`createPortal`) + musique réparée & **choix d'album** | `e6112e8` |
| 70 | **Polish éditorial** : 9 échos décennaux de **jeunesse** (choix 18-38 ans → rappel à 58-82, principe ④) — contenu pur, 320→329 events | `24310ac` |
| 71 | **Arc-ami : {ami} évolue + cohérence** : 5 scènes hors-spine (doute/mariage/chute/égarement/éveil, `spawnProbability`) + flag `ami_parti` (anti-réapparition posthume) + 3 contradictions long-terme corrigées | `db52c75` |
| 72 | **Finances jouables** (correctif playtest) : la pauvreté ne tue plus (`checkGameOver` saute finances) + action **Travailler** (+Argent −Corps) | `8e9dc2a` |
| 73 | **Leurres plus proches** (correctif playtest) : `pickDecoys` en 3 paliers (même cat. + tag commun → même cat. → autre cat.) — distracteurs pertinents, jamais hors-sujet | `02a144e` |
| 74 | **Le mode wordBank apparaît** (correctif playtest + bug latent) : intention auteur honorée dès la 1ʳᵉ découverte + garde `canWordBank` (plus d'écran vide sur event sans champ) | `e028b7f` |
| 75 | **Musique débloquée au 1ᵉʳ geste** (correctif playtest) : `armAudioUnlock` — resume `AudioContext` + relance la piste muette par l'autoplay (contexte créé hors geste = suspendu) | `d0a4139` |
| 76 | **Levier physique mesuré** : survie liée à la précision — usure du corps à l'échec (`FAIL_PHYSIQUE_PENALTY`) + action **Repos/sabbat** (plein tour, ralentit sans banquer) ; victoire(100) = exploit de maîtrise (0%→69% selon précision), mesuré au survival-sim | `bac0352` |
| 77 | **Réconciliation docs — clôture Phase 4 (v0.2.0)** : itér. 69-76 tracées dans la ROADMAP (miroir de HEAD), T-34 coché (cible ≥8 atteinte : 8/9/8 sur 334 events), T-40 audio parqué (bloqué-assets), v0.2.0 actée | `923c753` |
| 78 | **Le tutoriel ne casse plus le rendu** (playtest finalisation) : `TutorialOverlay` appelait `onDone()` (setState d'App) pendant son rendu → erreur React inter-composants. `useTargetRect` + flag `measured`, `finish()` en effet. Smoke : 0 erreur console | `ae3a7bb` |
| 79 | **Témoignage de fin de vie incassable** : couverture de l'état viral (partage WhatsApp) — `testimonyGenerator` testé sur états limites (mort précoce/journal vide/victoire/vie pleine), 4 tests. Générateur déjà défensif, aucun correctif | `5734003` |
| 80 | **Cohérence PWA** (polish livraison) : manifest `lang:'fr'`+`dir:'ltr'` (vite-plugin-pwa émettait `en` par défaut, incohérent avec `<html lang="fr">`). Audit assets de prod : 13 img + 3 icônes, 0 cassé | `07f6cfc` |
| 81 | **Save-compat (bug GRAVE)** : `saveGame` ne whitelistait pas `playerName`/`calling`/`seed`/`traits` → recharger réinitialisait le nom, re-tirait la vocation au hasard, changeait la graine, vidait les traits. Whitelist complétée + garde `tests/persistence.test.ts` | `3775f2e` |
| 82 | **Tour guidé : dernière étape avalée** (trouvé en revue de code) : `useTargetRect` ne réinitialisait pas la mesure au changement de cible → la cascade de saut des étapes absentes (`.event-card`/`#choices-area`, idle) débordait sur `.btn-age`. État clé sur `selector` + garde `tests/tutorialOverlay.test.tsx` | `f4af4f8` |
| 83 | **Phase F close — v0.3.0 « livrable »** : passe de finalisation (itér. 77-82) actée dans la ROADMAP (Definition v0.3.0 ✅). Jouable bout-en-bout, 0 erreur console, save fiable, PWA valide, 510 tests verts | `01c2f73` |
| 84 | **Persistance du codex cross-parties** : module pur `codexMemory.ts` (`mergeCodex` accumulation) + codex « à vie » (clé dédiée sans expiration, cache boot) seedé aux 3 entrées de partie. Débloque `completion`/`reference` + priorité SRS d'une vie à l'autre. +10 tests | `681e7c7` |
| 85 | **Phase 5 lot 1 + T-40 résolu** : 8 échos décennaux (contenu pur, 334→342 events, prerequisites réels, versets accordés, ton grâce>punition) ; **constat T-40** — audio des saisons déjà réglé (saisons mappées sur soundtracks présents, pas d'asset à produire) | `f5c262d` |
| 86 | **Audit méthode/outillage → Phase G** : constat « cœur = système, 3 couches linéaires (UI 419 inline styles, statut narré qui dérive, App.tsx 1293 l.) + méthode réactive ». 6 tâches G-1..G-6 dans la ROADMAP (doc-only) | _(ce commit)_ |

**Propositions D, A, B : COMPLÈTES.** **Phase 1 (hooks) + Phase 1bis (type) : COMPLÈTES** (`react-hooks/* = 0`, dette de type = 0).
**Phase 2 (contenu + équilibrage senior) : COMPLÈTE** (arcs/seniors présents, courbe rééquilibrée et mesurée).
**Phase 3 (fil polyphonique) : COMPLÈTE** (T-20..T-32 livrés). **Phase 4 (v0.2.0) : CLOSE** (itér. 77 — T-34 atteint, T-39 tranché ;
T-40 audio parqué hors code). **Phase F (v0.3.0 « livrable ») : CLOSE** (itér. 77-82 — jouable bout-en-bout, 0 erreur console,
save fiable, PWA valide, 510 tests). **Apprentissage persistant** (itér. 84) : codex « à vie » cross-parties (`codexMemory.ts`) →
`completion`/`reference` atteignables, priorité SRS conservée. **Prochaine file = Phase 5 « De quiz à roman visuel »** : densité
narrative éditoriale + TestimonyCard/ChapterCard (cf. `docs/ROADMAP.md` + `docs/DESIGN_PARTIE2.md`). Mesure : `tools/survival-sim.ts` ; playtest : skill `run-elias`.

## Réserve (analysée, non planifiée)

- ~~**Assainissement lint hooks**~~ → **livré itér. 21–31** (`react-hooks/* = 0`).
- ~~**Phase 1bis — dette de TYPE**~~ → **livré itér. 32** (12 erreurs → 0, baseline `tools/tsc-baseline.txt` = 0).
  Prochaine file tracée en `docs/ROADMAP.md` : **Phase 2** (contenu).
- ~~**Onboarding zéro-friction**~~ → **livré itér. 14** (tuto → Prologue). Reste à creuser : première
  récompense précoce, micro-feedback dans les toutes premières années.
- ~~**Contenu (Phase 2) — arcs + senior**~~ → **livré PR #12** (vérifié itér. 32) ; ~~**équilibrage senior (T-16)**~~
  → **mesuré + tuné itér. 34-35** (Piste M/B, harnais `tools/survival-sim.ts`). Reste **T-17** mode découverte (Tier 4 Phase 3).
- **Phase 3 — fil polyphonique (anti-routine / rejouabilité)** : direction active, inspirée *7 Days* / chat-narratif.
  La vie = un fil de messages de 4 émetteurs (Ciel / Adversaire / Entourage / Conscience), Élias répond par un verset ;
  émetteur **dérivé** de `category`+`storyArcId`. **Principe asset-ready** : slots `assetId` pour brancher l'art
  (avatars, lieux, objets) sans refactor. File complète T-20..T-32 dans `docs/ROADMAP.md`.
- **Save-scumming / slots multiples** (à évaluer en contexte procédural).
- ~~**Feedback/bug-report Supabase**~~ → **livré itér. 18–19 + infra close** (clé publishable dans
  `.env.local`, MCP `supabase` authentifié, table `feedback` créée — RLS activé, insert anonyme).
