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

### Itération 6 — Codex vivant (variété + encouragement à la révision des versets)
- **Recherche** : 80 Days (codex vivant) — un moment RÉPÉTÉ ne doit jamais sonner deux fois
  pareil ; le texte « vit ».
- **Analyse** : la révision flash-card du Grimoire est le cœur évangéliste (mémoriser la
  Parole) et le moment le plus répété du méta-jeu, or il affichait des invites FIGÉES
  (« Appuyer pour révéler », « Essaie de réciter… ») et aucune respiration spirituelle au
  moment de la révélation.
- **Consensus** : un module PUR seedé PAR CARTE (via `hashSeed(verseId)` → stable, ne clignote
  pas au re-render, mais diffère d'une carte à l'autre) qui varie les invites et ajoute un court
  encouragement selon la catégorie d'affliction. Display-only, zéro state, réversible.
- **Application** : ajout du primitif réutilisable `hashSeed` (FNV-1a) dans `rng.ts` ;
  `src/engine/reviewPrompts.ts` (`reviewPromptsFor`, pur) ; branché dans `FlashCardMode`
  (`CodexMenu.tsx`) ; tests `tests/reviewPrompts.test.ts`.
- **Résultat** : chaque verset révisé a sa propre invite + un encouragement sur-mesure
  (« ✦ Cette parole chasse la crainte », « ✦ Ton épée pour le combat »…). 6 tests (101 verts),
  tsc + lint + build OK.
- **Rétro / process** : besoin d'un hasard STABLE indexé par string (l'id de verset) sans
  Math.random → extrait en primitif partagé (`hashSeed`) plutôt qu'enfoui dans le module, pour
  réutilisation future (toute UI voulant un « vivant non clignotant » par id). Règle de process
  ajoutée : *quand un besoin de hasard se répète, le remonter en primitif de `rng.ts` plutôt que
  le dupliquer.* Patron « pur + seedé par identité d'élément » validé pour les composants React.
- **Rollback** : `git revert <hash itération 6>`.

### Itération 7 — Réactions de revers (grâce) — symétrie du système de résultat
- **Recherche** : un système de feedback de résultat n'est complet que s'il couvre les DEUX
  issues. L'itér.4 a varié la victoire ; l'échec restait figé (« Épreuve non surmontée »).
- **Analyse** : surmonter / ne pas surmonter sont les deux beats les plus répétés. Surtout, dans
  un jeu ÉVANGÉLISTE, l'échec ne doit pas condamner : il ouvre sur la grâce et le relèvement.
  Le libellé d'échec était à la fois figé ET légèrement punitif — contre-thème.
- **Consensus** : ÉTENDRE `reactions.ts` (cohésion, pas de nouveau fichier) avec un libellé de
  revers varié + un encouragement de grâce TOUJOURS présent, jamais punitif. Pur, seedé, calculé
  dans l'effet (pas le rendu) → pas de clignotement, AAA-pur. Réversible.
- **Application** : `pickSetbackLabel`, `pickSetbackEncouragement` dans `reactions.ts` ; state
  `setback` dans `App.tsx` (posé dans la branche échec de l'effet de résultat), libellé + ligne
  de grâce `.verse-fail-grace` dans l'overlay de confirmation ; tests étendus.
- **Résultat** : l'échec affiche un libellé varié (« Le combat continue », « Pas cette fois ») +
  « ✦ La grâce est nouvelle chaque matin. Relève-toi. ». 2 tests (103 verts), tsc + build OK.
- **Rétro / process** : règle ajoutée — *un système de feedback se conçoit symétriquement
  (succès ET échec) ; livrer une seule moitié laisse un trou ressenti.* Le ton (grâce, pas
  punition) découle directement de l'identité évangéliste : un système juice doit servir le
  THÈME, pas juste la dopamine. En lintant, la dette App.tsx pré-existante (Math.random L596,
  ref L395, no-unused-expressions L779/1007) reste isolée — candidate forte pour l'itér. suivante.
- **Rollback** : `git revert <hash itération 7>`.

### Itération 8 — Durcissement normes AAA (pureté du rendu de `App.tsx`)
- **Recherche** : exigence explicite « normes AAA / bonnes pratiques ». En React, le rendu
  doit être PUR et IDEMPOTENT : pas de `Math.random` ni d'effet de bord (son) pendant le rendu.
- **Analyse** : 4 dettes répétées dans `App.tsx`, relevées au fil des itér. 1–7 et mises en
  réserve : (a) `Math.random` en rendu (verset de secours game over, L596), (b) son de fin de
  partie joué EN rendu via garde de ref (L392), (c)+(d) ternaire utilisé comme instruction
  (`no-unused-expressions`, toggles ambiance).
- **Consensus** : itération de QUALITÉ bornée aux 4 dettes cataloguées, zéro changement de
  comportement, réversible. Pas de refonte large (cf. découverte ci-dessous).
- **Application** : (a) index du verset de secours dérivé d'un état stable `(age + unlockedCount)`
  → rendu pur ; (b) son de fin déplacé dans un `useEffect` dédié (clé `gameOver.isOver/reason`) ;
  (c)+(d) `next ? a() : b()` → `if (next) a(); else b();`.
- **Résultat** : les 4 règles ciblées ne renvoient plus aucun hit dans `App.tsx` (26→22 erreurs
  ESLint sur le fichier), comportement identique. 103 verts, tsc + build OK.
- **Rétro / process** : en mesurant `npm run lint`, DÉCOUVERTE — la base était déjà ROUGE à
  l'échelle du projet (67 problèmes, surtout `react-hooks/set-state-in-effect` du plugin
  expérimental), bien au-delà des 4 dettes d'`App.tsx`. Décision : NE PAS tout corriger d'un coup
  (gros refactor risqué → viole « ne rien casser »). Règle de process ajoutée : *quand on ouvre un
  chantier qualité, mesurer d'abord l'ampleur réelle ; livrer un périmètre borné et re-scoper le
  reste en réserve, plutôt que de se laisser aspirer.* L'invariant tenu reste : **ne jamais
  AJOUTER de dette** (lint ciblé par itération) — la base rouge globale est un chantier à part.
- **Rollback** : `git revert <hash itération 8>`.

### Itération 9 — Identité du personnage (proposition `D`)
- **Recherche** : retour joueur n°1 — « ça ne nous ressemble pas ». Racine identifiée au cadrage
  (cf. `docs/DESIGN_PARTIE2.md` §3) : nom codé en dur « Élias », identité 100 % `Math.random`.
  Décision figée du dossier Partie 2 : **`D` puis `A`**. Cette itération = `D`, bornée et réversible.
- **Analyse** : le seul vrai input joueur était les 5 choix du Prologue. Aucune saisie d'identité.
  « Élias » apparaît en dur dans la vignette (`opening.ts`), le journal de naissance (`gameStore`),
  les libellés de game over, l'en-tête du journal, l'export et la carte de partage (`App`/`ShareCard`).
- **Consensus** : ajouter un **module PUR** `engine/identity.ts` (`resolvePlayerName` → défaut « Élias »
  = zéro régression ; `personalize` gère l'élision « d'Élias » → « de {nom} »), un champ
  `playerName` à l'état (save-compatible via le merge `hydrateFromSave`), un écran de **saisie du nom**
  en tête du Prologue, et **propager** le nom partout où « Élias » s'affichait. Token `{nom}` dans
  la vignette seedée → reste pur et déterministe. `initGame` **préserve** le nom au redémarrage.
- **Application** : `engine/identity.ts` (neuf) ; `playerName` dans `types/game.ts` ;
  `createInitialState(inh, seed, playerName?)` + token `{nom}` dans `opening.ts` ; écran d'identité +
  `PrologueResult.name` dans `Prologue.tsx` ; `startWithPrologue` pose+personnalise, `initGame`
  préserve dans `gameStore.ts` ; surfaces visibles dans `App.tsx`/`ShareCard.tsx`/`Journal.tsx` ;
  `tests/identity.test.ts` (neuf, 8 cas).
- **Résultat** : le joueur saisit son nom à la naissance (vide → « Élias », **zéro régression**) ; il
  le voit dès l'ouverture, dans tout le journal, au game over et au partage. `tsc` + **111 tests** +
  build verts. Aucune dette lint ajoutée (les 3 hits `ShareCard` sont pré-existants, lignes non touchées).
- **Rétro / process** : un test de déterminisme sur le **journal complet** de `createInitialState` a
  échoué — rappel salutaire que **ville/parents viennent encore de `Math.random`** (c'est `A`, pas `D`).
  Recentré l'assertion sur la part réellement seedée (vignette pure). Règle confirmée : *tester
  exactement le périmètre seedé du cycle, ne pas anticiper la déterminisation que `A` apportera.*
  `D` ouvre naturellement `A` : le nom saisi devient une **entrée de graine partageable**.
- **Rollback** : `git revert <hash itération 9>`.

#### Itération 9bis — Cohérence (revue) : nom dans les entrées de journal en cours de partie
- **Déclencheur** : revue de cohérence demandée par l'utilisateur avant d'enchaîner sur `A`.
  Constat : la propagation de l'itér. 9 couvrait la naissance/vignette/game over/partage, mais
  PAS les textes **générés pendant la run** — un joueur « Marie » revoyait « Élias » dès 15 ans.
- **Correctif** : nom propagé au message de crise, à l'entrée de trait, aux jalons d'âge (0/15/25/60),
  aux révélations (via `personalize`), et aux prompts du narrateur IA (param `playerName`, défaut
  « Élias »). Descriptions de saison laissées telles quelles (jamais affichées → vérifié). 2 tests
  neufs verrouillent la propagation in-run. tsc + build OK, zéro dette lint.
- **Rétro / process** : *une feature de « personnalisation » doit balayer TOUTES les sources de
  texte joueur, y compris celles générées par le moteur en cours de partie — pas seulement les
  écrans d'entrée/sortie.* Le grep initial doit couvrir `engine/` autant que `components/`.
- **Rollback** : `git revert <hash 9bis>`.

### Itération 10 — Graines partageables (proposition `A`)
- **Recherche** : décision figée `D → A`. Constat révélé à l'itér. 5 : `createInitialState` n'était
  PAS déterministe par graine — `generateBirthStats/ParentNames/LifeContext` tiraient sur `Math.random`,
  donc ville/parents/profession/stats différaient à graine égale. Seule la « colonne vertébrale »
  (Appel, saisons, vignette) était seedée.
- **Analyse** : pour « même graine = même destinée », toute la naissance doit passer par le `Rng`
  seedé déjà instancié dans `createInitialState` (`mulberry32(seed)`). Helpers `rngPick`/`rngWeightedPick`/
  `rngInt` existaient déjà. Anti-régression clé : conserver la **distribution** (l'ancien `randomInRange`
  était exclusif en haut `[min,max[` → garder cette formule, pas `rngInt` inclusif).
- **Consensus** : (1) injecter `rng` dans les 3 fonctions de naissance ; (2) éviter la « graine morte »
  (incohérence type 9bis) en la rendant **actionnable** : action store `initGameWithSeed`, bouton
  « REJOUER CETTE GRAINE » au game over (rejoue son monde), champ graine optionnel au dialogue Nouvelle
  Partie (rejouer une graine partagée, sans prologue) ; (3) afficher/copier la graine (game over + ShareCard
  + export) ; (4) réactiver/ajouter les tests de déterminisme. Réversible (défaut = graine aléatoire).
- **Application** : `generateBirthStats(rng)/ParentNames(rng)/LifeContext(rng)`, `pickBirthProfile` via
  `rngWeightedPick`, `rngInRange` exclusif ; `createInitialState` fait circuler son `rng` unique ;
  `initGameWithSeed` (store) ; bouton + champ graine (`App.tsx`) ; graine dans `ShareCard`/export ; maj des
  2 appelants `generateBirthStats()` des tests ; `tests/seeds.test.ts` (neuf, 5 cas).
- **Résultat** : même graine = même monde + stats de départ ; on peut rejouer sa vie et jouer une graine
  partagée. 118 tests verts (5 neufs), tsc + build OK, zéro dette lint ajoutée (gameEngine 10→10, App 21→21).
- **Rétro / process** : clarification de conception — **la graine seule** détermine le monde ; le nom est
  cosmétique (indépendant du RNG de naissance), donc rejouer la graine d'un ami reproduit *son monde* sous
  *son propre nom*. C'est plus simple et plus cohérent que le « nom+graine » évoqué au cadrage (§3/§4) — la
  destinée n'a pas à dépendre du nom. Leçon 9bis appliquée d'emblée : la graine est livrée **actionnable**,
  pas juste affichée.
- **Rollback** : `git revert <hash itération 10>`.

### Réserve (analysée, non encore planifiée)
- ✅ ~~Déterminisation complète de la naissance / graine partageable~~ → **livré itér. 10**.
- **Smart skip vers le non-lu** (débloqué par `A`) : rejouer une vie connue en accéléré jusqu'au
  contenu non encore vu (cf. `docs/DESIGN_PARTIE2.md` §2).
- **Conséquences ramifiées (`B`)** : arcs narratifs locaux (nœuds→arêtes) + flags de conséquence +
  validation DFS d'atteignabilité + visualizer à la *Academical* (cf. `DESIGN_PARTIE2.md` §5). Gros cycle dédié.
- **Assainissement lint global (chantier dédié)** : ~60 erreurs `react-hooks/set-state-in-effect`
  / `purity` / `refs` réparties dans le projet (base déjà rouge avant la boucle). À traiter
  fichier par fichier, hors boucle juice, avec garde anti-régression (gros scope, risqué).
- **Codex vivant** (80 Days) : variété de texte à la révision des versets.
- **Conséquences ramifiées** : choix narratif altérant durablement la run (gros scope).
- **Onboarding zéro-friction** : soigner les premières minutes (Prologue/Onboarding existants).
