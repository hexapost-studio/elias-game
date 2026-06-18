# ROADMAP — Élias (file de tâches du `release-lead`)

> File pilotée par l'agent `.claude/agents/release-lead.md`.
> **1 tâche cochée = 1 commit revert-able + 1 entrée dans `docs/ITERATION_LOG.md`.**
> Cette ROADMAP est la source de vérité de la *file* (quoi / dans quel ordre / état).
> `ITERATION_LOG.md` reste la source de vérité du *process* (pourquoi / comment / preuve QA / rollback).
> Porte QA obligatoire avant chaque commit : `bash tools/qa-gate.sh` (sans Playwright).

## 🟢 DONE
- [x] **T-A** lint lot A — 27 erreurs sûres (no-unused-vars/no-empty/prefer-const) → itér. 21 / `1bdc150`
- [x] **T-B** lint lot B — `no-explicit-any` ×8 typés → itér. 21 / `356a6c8`
- [x] **T-C** lint lot C — fast-refresh `only-export-components` ×5 (iconMeta) → itér. 21 / `2d01cc4`

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
- [ ] **T-17** **Mode découverte** (entraînement sans conséquence de stats) — reporté (Tier 4, voir Phase 3)

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
- [ ] **T-26** Épreuve = **bulle entrante** + indicateur « … en train d'écrire » (`useTypewriter`, `prefers-reduced-motion`).
- [ ] **T-27** Versets = **chips de réponse** → bulle envoyée (réponse d'Élias) → réponse de la voix.
- [ ] **T-28** **Voix de l'adversaire nommées/typées** (La Peur, Le Doute, l'Amertume…) via couleurs + SVG existants.

### Tier 4 — Agence, profondeur & contenu
- [ ] **T-29** **Choix moraux** (sous-type d'event : 2-3 *actes* qui posent des flags, au-delà du verset) — schéma + `validate`.
- [ ] **T-30** **Contenu C1** : 8 catégories à 2 events → ≥5 ; +12-15 events seniors 75-100 (le pool, après la mise en scène).
- [ ] **T-17** **Mode découverte** (entraînement sans conséquence de stats).

### Transverse — Intégration graphique (continu, au fil de l'arrivée des assets)
- [ ] **T-31** **Registre d'assets** (`src/assets/illustrationRegistry.ts`) : map `assetId`→illustration pour
      émetteurs (avatars entourage/adversaire), **lieux** (ville/église), **objets** ; résout en placeholder tant
      que l'art manque. Consommé par T-20/T-21 **dès le départ** (asset-ready) ; rempli progressivement.
- [ ] **T-32** **Expressions d'avatar** (3-4 par émetteur, façon 7 Days) pilotées par ton/résultat — activées dès
      que les assets existent (zéro refactor grâce à T-31).

## 🎯 Definition of a new version (v0.1.0)
Atteinte quand :
1. **Phase 1 verte** : `npx eslint . -f json` → **0** erreur `react-hooks/*` sur les 9 fichiers ciblés.
2. **≥ 3 arcs C1 jouables** (events présents, `npm run validate` vert).
3. **4 portes QA vertes** sur HEAD (`bash tools/qa-gate.sh` → exit 0).
