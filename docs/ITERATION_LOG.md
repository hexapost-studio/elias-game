# Boucle d'amélioration — Élias

Jeu chrétien évangéliste, 100 % textuel, **sans IA**. On vise l'exception en
s'inspirant des codes des meilleurs (VN / fiction interactive : *Slay the Princess*,
*80 Days*, *Citizen Sleeper*, *A Dark Room*, *Steins;Gate*…), **sans gore ni bizarrerie**.

## Règles d'or (invariants)
1. **Réversible** — chaque itération = 1 commit atomique. Rollback = `git revert <hash>`.
2. **Modulaire** — on ajoute/branche un système, on ne casse rien d'existant. Suppression = retirer 1 module + 1 import.
3. **Systèmes, pas features** — on conçoit une mécanique réutilisable, pas un cas particulier.
4. **Normes AAA** — accessibilité (reduced-motion, skip), perf (rAF, pas de re-render inutile), graceful degradation.
5. **Vérifié** — `tsc` + tests + build verts avant commit. Sinon, pas de commit.

## Le cycle (répété jusqu'à épuisement du crédit)
```
RECHERCHE   → quel code/principe des meilleurs jeux applique-t-on ?
ANALYSE     → où est le manque dans Élias ? quel levier a le plus d'impact ?
CONSENSUS   → on tranche : 1 système, scope clair, critère de réussite
APPLICATION → code modulaire + test + tsc/build
RÉTRO       → résultat, ce qu'on améliore dans le process, commit (= point de rollback)
```
Chaque tour, on **améliore aussi le process** (noté dans la rétro).

---

## Itérations

### Socle — checkpoint `992f380`
État de départ : feedback in-game + 4 leviers de rejouabilité (Appel, saisons, traits,
narrateur offline). 60 tests verts. Point de restauration avant la boucle.

### Itération 1 — Système de présentation du texte (« Flow de lecture »)
- **Recherche** : l'optimisation n°1 des VN/IF citées = contrôler le *rythme de révélation*
  du texte (machine à écrire) pour le *pacing* dramatique, + une fonction **Skip**.
- **Analyse** : la description d'événement (`currentEvent.description`) — le moment où le
  joueur *lit la scène* avant de choisir — s'affiche d'un bloc, sans rythme. C'est le
  battement de cœur d'un jeu textuel, aujourd'hui plat.
- **Consensus** : créer un **système de vitesse de lecture** réactif + un hook machine à
  écrire réutilisable. Critère : texte révélé progressivement, tap = skip, réglage
  persistant (instant/naturel/lent), respect de `prefers-reduced-motion`.
- **Application** : `src/settings/textSpeed.ts` (module réactif `useSyncExternalStore` +
  helper pur `charsToShow`), `src/hooks/useTypewriter.ts`, intégration `VerseChoices`,
  contrôle dans `MainMenu`, tests `tests/textSpeed.test.ts`.
- **Résultat** : description d'événement révélée progressivement, curseur clignotant,
  tap = skip, réglage instant/naturel/lent persistant dans le menu, respect reduced-motion.
  Le flavor n'apparaît qu'une fois la scène lue. 9 tests ajoutés (69 verts), build OK.
- **Rétro / process** : le module réactif autonome (`useSyncExternalStore`) a évité tout
  prop-drilling → à réutiliser comme **patron des futurs réglages/systèmes transverses**.
  Amélioration du process : avant de coder, vérifier les **règles des hooks** dans le
  composant cible (ici `VerseChoices` a un `return null` conditionnel → hook placé en
  amont). Prochaine fois : repérer les early-returns dès l'analyse.
- **Rollback** : `git revert <hash itération 1>`.

### Itération 2 — Mémoire narrative à rappels (« echoes »)
- **Recherche** : force des grands jeux textuels (*Citizen Sleeper*, *Steins;Gate*) — les
  moments pivots RÉSONNENT plus tard ; les rappels littéraires créent la continuité.
- **Analyse** : dans Élias, chaque événement est isolé. Les traits et arcs sont pourtant
  des moments DATÉS (`earnedAtAge`, `completedAtAge`) → matière à rappels, déjà en mémoire.
  (Juice du choix de verset déjà bien câblé → on ne touche pas, gain marginal.)
- **Consensus** : un système d'échos **dérivé** de l'état (comme `traits.ts`), zéro nouveau
  champ → save-compatible. Le narrateur tisse occasionnellement un rappel d'un moment ancien
  (recul ≥ 5 ans). Critère : rappels déterministes seedés, slots résolus, jamais dominants.
- **Application** : `src/engine/echoes.ts` (`deriveEchoes`, `pickEchoCallback`, purs),
  branché dans `offlineNarrator` (tail à double poids), `App.tsx` passe `deriveEchoes(state)`.
- **Résultat** : le journal évoque parfois « mes 20 ans, quand je suis devenu X » des années
  plus tard. 8 tests (77 verts), tsc + build OK.
- **Rétro / process** : la stratégie « dériver d'un état déjà daté plutôt qu'ajouter du state »
  se confirme comme **patron par défaut** (save-compat + testabilité pure). Process amélioré :
  *vérifier d'abord si le besoin est déjà câblé* (le juice l'était) avant de prévoir du travail
  — un check de 2 commandes a évité une itération à faible valeur.
- **Rollback** : `git revert <hash itération 2>`.

### Itération 3 — _(à définir)_
Pistes en réserve : expansion minimaliste (A Dark Room, annonce des systèmes débloqués) ·
codex vivant (80 Days, variété de révision) · conséquences ramifiées (choix narratif).
