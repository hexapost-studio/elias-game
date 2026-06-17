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
- [ ] **T-3** `src/components/DailyVerse.tsx` — set-state-in-effect ×1
- [ ] **T-4** `src/components/DevPanel.tsx` — set-state-in-effect ×2
- [ ] **T-5** `src/components/DebugView.tsx` — set-state-in-effect ×1 + exhaustive-deps ×2
- [ ] **T-6** `src/components/ActionPanel.tsx` — rules-of-hooks ×1
- [ ] **T-7** `src/components/ShareCard.tsx` — purity ×1 + refs ×1 + exhaustive-deps ×1
- [ ] **T-8** `src/components/VerseChoices.tsx` — purity ×1 + refs ×1 + rules-of-hooks ×1
- [ ] **T-9** `src/App.tsx` — purity ×5 + exhaustive-deps ×2 + set-state-in-effect ×5 (**à découper en sous-commits**)

> ⏸ **PAUSE OBLIGATOIRE en fin de Phase 1** : rendre la main avant la Phase 2 (nature différente).

### Phase 2 — Contenu (GDD §11.1 C1)
- [ ] **T-10** Events arc **ami** (~6) — respecter `src/data/event-schema.ts` + `npm run validate`
- [ ] **T-11** Events arc **métier** (~6)
- [ ] **T-12** Events arc **parents** (~6)
- [ ] **T-13** Events arc **église** (~6)
- [ ] **T-14** Events arc **ville** (~6)
- [ ] **T-15** Events âges **90-100** (paliers de fin de vie quasi vides)
- [ ] **T-16** Rééquilibrage **courbe difficulté senior** (le joueur meurt avant 60 ans)
- [ ] **T-17** **Mode découverte** (entraînement sans conséquence de stats)

## 🎯 Definition of a new version (v0.1.0)
Atteinte quand :
1. **Phase 1 verte** : `npx eslint . -f json` → **0** erreur `react-hooks/*` sur les 9 fichiers ciblés.
2. **≥ 3 arcs C1 jouables** (events présents, `npm run validate` vert).
3. **4 portes QA vertes** sur HEAD (`bash tools/qa-gate.sh` → exit 0).
