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
bash tools/qa-gate.sh   # PORTE UNIQUE : typecheck réel + vitest (190) + build + validate (118 v / 186 e) + lint-diff
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
- **Réglages transverses** : `useSyncExternalStore` (cf. `settings/textSpeed.ts`, `settings/seenText.ts`).
- **Sources de données** : arcs = `src/data/storyArcs.ts` (lu par le code) **et** `game/data/storyArcs.json`
  (lu par le validateur — garder synchro) ; events = `game/data/events.json` (186) ; versets = `game/data/verses.json` (118).
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
| 78 | **Le tutoriel ne casse plus le rendu** (playtest finalisation) : `TutorialOverlay` appelait `onDone()` (setState d'App) pendant son rendu → erreur React inter-composants. `useTargetRect` + flag `measured`, `finish()` en effet. Smoke : 0 erreur console | _(ce commit)_ |

**Propositions D, A, B : COMPLÈTES.** **Phase 1 (hooks) + Phase 1bis (type) : COMPLÈTES** (`react-hooks/* = 0`, dette de type = 0).
**Phase 2 (contenu + équilibrage senior) : COMPLÈTE** (arcs/seniors présents, courbe rééquilibrée et mesurée).
**Phase 3 (fil polyphonique) : COMPLÈTE** (T-20..T-32 livrés). **Phase 4 (v0.2.0) : CLOSE** (itér. 77 — T-34 atteint, T-39 tranché ;
T-40 audio parqué hors code). **Prochaine file = Phase 5 « De quiz à roman visuel »** : densité narrative éditoriale +
TestimonyCard/ChapterCard (cf. `docs/ROADMAP.md` + `docs/DESIGN_PARTIE2.md`). Mesure : `tools/survival-sim.ts` ; playtest : skill `run-elias`.

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
