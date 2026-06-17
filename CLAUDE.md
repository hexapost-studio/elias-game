# CLAUDE.md — Élias : Le Combat d'une Vie

Contexte de travail pour Claude Code. Lu à chaque session : garder **court et à jour**, pointer
vers les docs détaillés plutôt que les recopier.

## Le projet

Life-simulator chrétien façon BitLife (âge 0–100) où les épreuves se résolvent en choisissant le
**bon verset biblique**. Public : communauté francophone EJP/ICC. Stack : **React 18 + TypeScript +
Vite + Zustand + localforage** (PWA).

- Branche de travail : **`feat/exceptional-game`**.
- Boucle d'amélioration autonome, journal vivant : **`docs/ITERATION_LOG.md`** (source de vérité du
  processus). Cadrage produit des grands chantiers : **`docs/DESIGN_PARTIE2.md`**. GDD : `docs/GDD_ELIAS.md`.

## Règles d'or (invariants — NON négociables)

1. **Réversible** : 1 itération = 1 commit `git revert`-able.
2. **Modulaire** : « systèmes, pas features ». Logique en **module pur** (testable), le `.tsx` ne fait que mapper.
3. **Dériver plutôt qu'ajouter du state** : reconstruire l'affichage depuis l'état présent (ex. `engine/arcProgress.ts`).
4. **Normes AAA** : rendu **pur** (jamais de `setState`-in-effect), `prefers-reduced-motion` respecté, pas de gore.
5. **Vérifié AVANT commit** : `tsc` + `vitest` + `build` + `validate` verts (voir ci-dessous).
6. **JAMAIS de dette lint ajoutée** : comparer le lint **par fichier touché** vs `HEAD`. La base est déjà
   rouge (~60 `react-hooks/set-state-in-effect` dans les `.tsx`) — ne pas l'aggraver, ne pas la « réparer » au passage.
7. **Ton évangéliste, grâce > punition** : l'échec ouvre un chemin plus humble, jamais avilissant.

## Vérification (tout vert avant de committer)

```bash
npx tsc --noEmit      # types
npx vitest run        # tests (actuellement 157 verts)
npx vite build        # bundle prod
npm run validate      # validateur de données (118 versets, 186 events)
# + diff lint par fichier touché vs HEAD : zéro nouvelle erreur
```

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

## État des itérations (18 livrées)

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
| 20 | Correctifs playtest — « +1 » de jauge discret + verset révélé même en cas d'erreur (tuto) | (ce commit) |

**Propositions D, A, B : COMPLÈTES.** Pas de prochain cycle figé — à choisir avec l'utilisateur.

## Réserve (analysée, non planifiée)

- **Assainissement lint global** (~60 `set-state-in-effect`, base déjà rouge) — chantier dédié, risqué.
- ~~**Onboarding zéro-friction**~~ → **livré itér. 14** (tuto → Prologue). Reste à creuser : première
  récompense précoce, micro-feedback dans les toutes premières années.
- **Save-scumming / slots multiples** (à évaluer en contexte procédural).
- ~~**Feedback/bug-report Supabase**~~ → **livré itér. 18 + infra close** (clé publishable dans
  `.env.local`, MCP `supabase` authentifié, table `feedback` créée — RLS activé, insert anonyme).
