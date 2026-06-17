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

### Itération 3 — Révélations de capacités (« l'univers s'étend »)
- **Recherche** : A Dark Room — le monde se dévoile au fil du jeu ; la croissance se
  *ressent* quand chaque nouveau pouvoir est annoncé.
- **Analyse** : Élias active des mécaniques à des âges précis (agir à 8, saisons à 10,
  mémorisation accrue à 16, référence seule à 51, sagesse à 60) — mais le joueur ne
  l'apprenait jamais. Seuils vérifiés dans le code et `balance.json` avant d'écrire.
- **Consensus** : table DÉCLARATIVE âge → annonce, poussée comme entrée « milestone »
  (réutilise l'UI de journal existante, zéro UI nouvelle). Critère : annonce pile au palier,
  alignée sur les mécaniques réelles, aucune année ordinaire polluée.
- **Application** : `src/engine/reveals.ts` (`CAPABILITY_REVEALS`, `revealsAtAge`, purs),
  appel dans `advanceAge`.
- **Résultat** : à 8/10/16/51/60 ans, le journal annonce la nouvelle capacité acquise.
  5 tests (82 verts), tsc + build OK.
- **Rétro / process** : avant d'écrire les textes d'annonce, j'ai **vérifié chaque seuil
  dans le code source réel** (`age <= 15 ? 1 : 2`, `seniorMinAge: 60`) — règle de process
  ajoutée : *une annonce au joueur doit être tracée jusqu'à la mécanique qu'elle décrit*,
  sinon on ment au joueur. Table déclarative = ajout d'un palier = 1 ligne.
- **Rollback** : `git revert <hash itération 3>`.

### Itération 4 — Réactions de victoire contextuelles (juice)
- **Recherche** : le juice des grands jeux récompense le beat répété par de la *variété*
  (pas le même feedback 500 fois). L'utilisateur a explicitement demandé « fun, juice ».
- **Analyse** : surmonter une épreuve = le moment le plus répété d'Élias, et il affichait
  toujours « VICTOIRE ». Le câblage juice (son/particules/shake) était bon, mais le *texte*
  était figé.
- **Consensus** : un système de réaction varié selon combo / catégorie vaincue / saison.
  Critère : bannière qui monte avec le combo, sous-ligne thématique optionnelle, déterministe
  testable, jamais bloquant (la bannière suffit seule).
- **Application** : `src/engine/reactions.ts` (`pickVictoryBanner`, `pickVictorySubline`,
  purs), figé dans la branche succès de l'effet de résultat, sous-ligne animée dans le flash.
- **Résultat** : « INARRÊTABLE / EN FEU » sur gros combo, « La peur a reculé » après une
  épreuve d'angoisse, etc. 8 tests (90 verts), tsc + build OK.
- **Rétro / process** : en lintant les fichiers touchés j'ai relevé de la **dette eslint
  pré-existante** dans `App.tsx` (`Math.random` en rendu L593, init de ref L392, ternaires
  d'effet L776/998). Non liée à l'itération → laissée intacte, mais **mise en réserve** comme
  candidate « durcissement normes AAA ». Process amélioré : lint ciblé sur les fichiers
  touchés à chaque itération pour ne jamais *ajouter* de dette, sans s'éparpiller à corriger
  l'existant dans la même passe.
- **Rollback** : `git revert <hash itération 4>`.

### Itération 5 — Vignette d'ouverture (« à chaque lancement, une nouvelle aventure »)
- **Recherche** : 80 Days — l'OUVERTURE donne le ton et diffère à chaque partie ; c'est
  le premier levier de rejouabilité perçue.
- **Analyse** : la naissance d'Élias affichait une ligne factuelle de structure identique
  à chaque run. Le premier écran lu par le joueur était plat et répétitif.
- **Consensus** : une vignette PURE et SEEDÉE (gabarit atmosphère + pressentiment d'Appel),
  branchée dans le journal de naissance. Critère : variée, slots toujours résolus, intègre
  ville + Appel, réversible (retour à une ligne factuelle = 1 edit dans `createInitialState`).
- **Application** : `src/engine/opening.ts` (`generateOpeningVignette`, pure/seedée),
  appel dans le journal de naissance de `createInitialState`, tests `tests/opening.test.ts`.
- **Résultat** : chaque partie s'ouvre sur une amorce évocatrice variée (« Le jour se lève
  sur Béthel… sa route penche vers celle du Berger »). 6 tests (95 verts), tsc + build OK.
- **Rétro / process** : le test d'intégration « même seed → même ouverture » a échoué et
  a RÉVÉLÉ un fait d'architecture : `generateLifeContext`/`generateParentNames`/`generateBirthStats`
  utilisent encore `Math.random`, pas le seed → la naissance n'est PAS reproductible par graine.
  Seul le « run spine » (Appel, saisons, vignette) est seedé. J'ai corrigé l'hypothèse du test
  (au lieu de forcer le code) et mis le fait en réserve. Règle de process ajoutée : *un test qui
  échoue peut révéler une vérité d'archi — vérifier la source AVANT de « réparer », parfois c'est
  l'attente qui est fausse, pas le code.*
- **Rollback** : `git revert <hash itération 5>`.

### Réserve (analysée, non encore planifiée)
- **Déterminisation complète de la naissance / graine partageable** (roguelite, partie 2) :
  faire passer `generateLifeContext`/`generateParentNames`/`generateBirthStats` par le `Rng`
  seedé → même graine = même destinée → graines de monde partageables (rejouer/défier un run).
- **Durcissement normes AAA** : nettoyer la dette eslint d'`App.tsx` (pureté du rendu).
- **Codex vivant** (80 Days) : variété de texte à la révision des versets.
- **Conséquences ramifiées** : choix narratif altérant durablement la run (gros scope).
- **Onboarding zéro-friction** : soigner les premières minutes (Prologue/Onboarding existants).
