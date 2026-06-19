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

### Itération 11 — Smart skip « texte déjà-lu » (débloqué par `A`)
- **Recherche** : suite figée `… → (skip) → B`. Le doc (§2) cadre le smart skip comme « s'arrêter au
  texte **non-lu** ». Constat d'architecture : contrairement à un VN pur, nos **trials sont interactifs**
  (les réponses ne sont pas dans la graine) → un « fast-forward jusqu'à l'âge N » s'arrêterait à chaque
  trial (gain faible). La **seule** surface narrative animée que le joueur « lit » est
  `currentEvent.description`, révélée au typewriter dans `VerseChoices` (le journal est du texte brut).
- **Analyse** : la vraie valeur = système ambiant « texte déjà lu → instantané, texte neuf → animé +
  repère », actif sur **toutes** les parties (pas que les replays), et reconnaissant un beat **par
  empreinte de contenu** (donc d'une partie à l'autre, ce que la graine déterministe rend fiable).
  Choix utilisateur confirmé (3 options présentées) : cette voie plutôt que « skip de l'intro » ou
  « fast-forward à l'âge N » (déconseillé).
- **Consensus** : (1) module autonome `settings/seenText.ts` calqué sur `textSpeed` —
  `textKey` (empreinte `hashSeed`, normalisée, `''` si vide), `isSeen`/`markSeen` persistés localStorage,
  plafond souple `MAX_KEYS` (events IA = texte unique → borner), `clearSeen` ; (2) dans `VerseChoices`,
  `useTypewriter(desc, { enabled: !alreadySeen })` (lecture **synchrone** = pas de course d'anim),
  badge `✦ nouveau` dérivé de `!alreadySeen` (aucun `setState`-in-effect ajouté), `markSeen` au `descDone` ;
  (3) CSS `.scene-new-badge` discret, `prefers-reduced-motion` respecté. Réversible : retirer le fichier
  + 1 import rend tout « neuf ».
- **Application** : `settings/seenText.ts` (neuf) ; 3 lignes + 1 effet + badge dans `VerseChoices.tsx` ;
  `.scene-new-badge` + keyframes dans `index.css` ; `tests/seenText.test.ts` (neuf, 8 cas).
- **Résultat** : un beat déjà lu s'affiche d'un bloc (plus de re-frappe d'une scène connue au replay),
  un beat neuf s'anime et porte « ✦ nouveau » puis est classé une fois lu. 126 tests verts (8 neufs),
  tsc + build OK, zéro dette lint ajoutée (`VerseChoices` 4→4, `seenText.ts` 0).
- **Rétro / process** : 1er jet utilisait `useState`+`useEffect` pour figer le badge → a introduit une
  erreur `set-state-in-effect` (lint 4→5). Corrigé en dérivant le badge **purement** de `!alreadySeen` :
  le badge s'efface ~juste après la fin de lecture (le beat vient d'être classé) — comportement *plus*
  juste (« lu → classé ») ET zéro dette. Leçon : préférer une dérivation pure d'un état déjà présent à
  un miroir en `state` (rappel du patron « dériver plutôt qu'ajouter du state »).
- **Rollback** : `git revert <hash itération 11>`.

### Itération 12 — Conséquences ramifiées `B-1` (moteur headless du branchement)
- **Recherche** : `B` est le plus gros levier d'exception (cf. `DESIGN_PARTIE2.md` §5). Constat de
  code : les 11 arcs (`storyArcs.ts`) sont **strictement linéaires** (`eventIds[]` + `arcSequence`) ;
  l'unique canal de branchement-par-choix existant (`EventRequirement` `event_succeeded`/`event_failed`)
  est **de fait cassé** — `filterEventsByPrerequisites` matche `journal.text.includes(id.substring(0,12))`,
  or le journal n'embarque que le **titre**, jamais l'id → ne matche jamais de façon fiable. Manque aussi
  toute **validation de cohérence** (contenu mort derrière un flag jamais posé).
- **Analyse** : livrer le **système headless** d'abord (flags + branchement + validation DFS + 1 arc
  exemplaire), visualizer reporté à l'itér. 13 (choix utilisateur, 2 options présentées). Garde le commit
  en `.ts`/`.json`/tests → dette lint triviale (la base react-hooks vit dans les `.tsx`, non touchés).
- **Décisions d'archi** : (1) divergence pilotée par le **CHOIX** (succès/échec), **jamais** par le RNG →
  préserve le déterminisme des graines ; (2) **« spine canonique + variantes hors-spine »** —
  `eventIds[]` reste un id par position (le **goulet** de convergence), les variantes partagent
  `storyArcId`+`arcSequence` mais sont **hors** `eventIds` (précédent : les cascades `-c`) ; un seul
  **Ajustement A** rend le déverrouillage robuste (« étape N-1 répondue » = un event répondu de l'arc
  était à la séquence N-1, au lieu d'un id positionnel) ; (3) **flags > réparer le hack journal** :
  `state.flags` posés déterministe­ment ; (4) **grâce, pas punition** : l'échec ne pose pas de « mauvais
  flag », il n'ouvre que la variante plus exigeante (absence de flag = chemin plus humble, jamais avilissant).
- **Application** : type `EventRequirement` + `flag` ; `setsFlagsOnSuccess?/OnFail?` + `GameState.flags` ;
  `createInitialState.flags={}` + whitelist `saveGame` (sinon perdu) ; pose des flags dans `validateChoice`
  (branches succès/échec, additif, gardes `?? {}`) ; lecture `case 'flag'` dans `filterEventsByPrerequisites`
  (exporté pour test) ; **Ajustement A** extrait en helper pur **exporté** `isArcStepUnlocked` (dédupliqué
  depuis `generateEvent`). Contenu exemplaire **arc-louise** (spine→4) : `arc-louise-2` succès pose
  `louise_pardonnee` ; `arc-louise-3` (apaisé) gardé `flag:true` ; **neuf** `arc-louise-3-hard` (hors-spine,
  `flag:false`, le chemin plus long) ; **neuf** `arc-louise-4` (séq 4 = goulet, épilogue partagé +
  complétion). Module pur neuf `engine/storyGraph.ts` : `validateStoryGraph(arcs, events)` — **DFS
  itératif (pile LIFO, jamais récursif)** validant atteignabilité / absence d'orphelin / cohérence des
  flags (pas de contenu mort). `tests/storyGraph.test.ts` (neuf, 13 cas : garde CI sur données réelles +
  cas synthétiques d'échec + pose/branchement/convergence/déterminisme/non-régression linéaire).
- **Résultat** : un choix narratif (réussir vs échouer `arc-louise-2`) altère **durablement** la run et
  aiguille deux variantes de séquence 3 qui **convergent** sur `arc-louise-4`. 139 tests verts (13 neufs),
  tsc + build + `npm run validate` (186 events) OK, **zéro** dette lint ajoutée (les `.ts` touchés
  restent 11→11 ; `storyGraph.ts` & tests = 0). Réversible : 1 commit.
- **Rétro / process** : plutôt qu'exposer l'inline de `generateEvent` aux tests, le prédicat d'Ajustement A
  a été **extrait** en helper pur exporté (`isArcStepUnlocked`) — testable **et** dédupliqué (« systèmes
  pas features »). Le branchement se teste à deux niveaux purs : `filterEventsByPrerequisites` (aiguillage
  par flag) + `isArcStepUnlocked` (convergence), sans dépendre du RNG de `generateEvent`.
- **Rollback** : `git revert <hash itération 12>`.

### Itération 13 — Conséquences ramifiées `B-2` (visualizer du branchement)
- **Recherche** : `B-1` (itér. 12) a câblé le branchement **dans le moteur**, mais il restait
  **invisible** pour le joueur — pas de « biais de complétion » (voir les chemins grisés, donner envie
  de rejouer, cf. *Academical*/Twine §0). Le `ArcTracker.tsx` existant n'affichait qu'une **bande de
  pastilles** (une par arc), sans étapes internes ni branches.
- **Analyse** : rendre B-1 **lisible** sans nouveau state — tout est déjà dérivable de
  `answeredArcEventIds` + `currentEvent` + `EVENT_DATABASE`. Forme retenue (choix utilisateur, 3 maquettes
  ASCII comparées) : **« bandeau de pas en ligne »** sous les pastilles, l'arc actif déplié en
  `●─●─◆─○` + sous-ligne grisée `╲┄◌` pour la variante non prise.
- **Application** : module pur neuf `engine/arcProgress.ts` — `getArcShape` (forme : séquences →
  variantes, **cascades `-c` exclues** car détours d'échec, pas de vraies bifurcations) + `getArcProgress`
  (overlay joueur : `done`/`current`/`todo`, `takenId` vs `skippedIds`). `ArcTracker.tsx` : 2ᵉ ligne
  monospace dérivée (dots colorés par statut, `◆` bifurcation, sous-ligne grisée révélée **seulement
  une fois la branche choisie** — ne spoile pas), légende « arc · étape n/N ». Rendu **100 % pur**
  (aucun `useState`/`useEffect` ajouté) ; **bonus AAA** : garde `@media (prefers-reduced-motion: reduce)`
  ajoutée sur `arcPulse` (l'ancienne pulsation des pastilles n'était pas gardée — lacune corrigée
  en passant). `tests/arcProgress.test.ts` (neuf, 6 cas : fork louise, voie grâce/exigeante, branche
  non révélée avant choix, non-régression `arc-heritage`).
- **Résultat** : pendant un beat d'arc, le joueur voit sa progression `●─●─◆─○`, la **bifurcation**
  à venir, et — une fois le choix fait — la **variante ratée en grisé** (envie de rejouer). 145 tests
  verts (6 neufs), tsc + build + `npm run validate` (186 events) OK, **zéro** dette lint
  (`ArcTracker.tsx` 0→0, `arcProgress.ts` & tests 0). Réversible : 1 commit.
- **Rétro / process** : 1er jet comptait les cascades `-c` (arc-taggées) comme variantes → `seq 1`
  paraissait bifurqué (test rouge `['arc-louise-1','arc-louise-1-c']`). Corrigé en **excluant les cibles
  de `cascadeEventId`** : seul le vrai embranchement (flag-gated, `arc-louise-3-hard`, qui n'est cascade
  de personne) reste un `◆`. Leçon : distinguer *détour d'échec* (cascade) de *divergence persistante*
  (branche de conséquence). Logique extraite en module pur **testée** ; le `.tsx` ne fait que mapper.
- **Rollback** : `git revert <hash itération 13>`.

### Itération 14 — Onboarding zéro-friction (la première vie n'est jamais anonyme)
- **Recherche** : le parcours d'un nouveau joueur était `load → <Onboarding> (tuto) → onComplete:
  setShowOnboarding(false) + markOnboardingDone() → état PAR DÉFAUT` (`createInitialState`, âge 0,
  nom « Élias », identité random, bouton « +1 ÂGE SUIVANT » nu). Le **Prologue** — saisie du nom
  (itér. 9 / **D**) **et** choix formateurs des stats — n'était atteignable **que** via *menu →
  Nouvelle Partie → RECOMMENCER* (`App.tsx`). Donc la feature construite contre le feedback joueur
  *« le personnage ne nous ressemble pas »* était **invisible pendant la première vie**, la plus
  décisive pour la rétention.
- **Analyse** : invariant à poser — *un nouveau joueur ne commence jamais une vie par défaut ; la
  création de personnage fait partie de l'onboarding*. Fix déjà à moitié là (le `<Prologue>` est câblé
  et appelle `startWithPrologue`) → il suffit de **brancher le Prologue à la fin du tuto**. Pur wiring
  d'orchestration (légitimement dans `App.tsx`, pas de nouvelle logique à extraire).
- **Application** : dans `App.tsx`, `<Onboarding onComplete>` ajoute `setShowPrologue(true)` après
  `markOnboardingDone()`. Une ligne. Le reste de la chaîne (nom → 4 choix → vie nommée à 14 ans, journal
  personnalisé) existait déjà.
- **Résultat** : tuto → naissance (nom + choix) → première vie personnalisée, sans détour par le menu.
  145 tests verts (inchangé — wiring), tsc + build + `npm run validate` (186 events) OK, **zéro** dette
  lint (`App.tsx` 22→22, base déjà rouge non aggravée). Réversible : 1 commit.
- **Cas-limite** : fermeture pendant le Prologue → `markOnboardingDone` déjà posé → au reload, état
  par défaut jouable (identique à avant) ou relance via *Nouvelle Partie*. Joueurs existants (onboarding
  vu + save) inchangés. Pas de régression.
- **Rollback** : `git revert <hash itération 14>`.

### Itération 15 — Feedback précoce (le Prologue rattrape les capacités déjà acquises)
- **Recherche** : suite à l'itér. 14, la 1ʳᵉ vie passe par le Prologue, qui démarre à **14 ans**. Or
  les révélations de capacités (`reveals.ts`, système « l'univers s'étend » façon *A Dark Room*) se
  déclenchent à l'âge EXACT (`revealsAtAge`, `r.age === newAge`). Un joueur Prologue ne franchit donc
  jamais 8 ni 10 → il rate **[ÉVEIL]** (l'`ActionPanel` prier/jeûner/servir/lire, pourtant affiché dès
  `age >= 8`, donc présent à 14) et **[SAISONS]**. Il a l'outil d'agentivité central **sans mode
  d'emploi** : c'est le « manque de feedback/récompense précoce » du feedback joueur.
- **Analyse** : rattraper au handoff du Prologue les paliers déjà actifs (≤ âge de départ), en
  réutilisant les textes + l'UI journal `milestone` existants. Pas de doublon (le joueur ne re-franchit
  jamais 8/10) ; les paliers futurs (16/51/60) arrivent naturellement par `advanceAge`. Seul
  `startWithPrologue` (âge 14) est concerné — les parties par graine/restart démarrent à 0 et franchissent
  8/10 normalement.
- **Application** : helper pur neuf `reveals.ts revealsUpToAge(age)` (paliers ≤ age). Dans
  `gameStore.startWithPrologue`, on append `revealsUpToAge(state.age)` au journal de naissance,
  personnalisé au nom du joueur. `tests/reveals.test.ts` : +4 cas (rattrape 8 & 10 à 14 ; jamais 16/51/60 ;
  rien avant 8 ; borne ≤ inclusive à 8).
- **Résultat** : dès la fin du Prologue, le joueur lit [ÉVEIL] (à quoi sert l'`ActionPanel`) et [SAISONS]
  juste avant sa 1ʳᵉ année jouée. 149 tests verts (+4), tsc + build + `npm run validate` (186 events) OK,
  **zéro** dette lint (`reveals.ts`/`gameStore.ts`/test à 0). Logique pure testée ; le store ne fait que mapper.
- **Rollback** : `git revert <hash itération 15>`.

### Itération 16 — Récompense de collection (le Grimoire enfin tangible)
- **Recherche** : l'onboarding promet « chaque verset utilisé avec succès rejoint votre Grimoire »
  (étape 3 du tuto), mais **rien dans le jeu ne le signalait** — toute victoire produisait le même
  `[VICTOIRE]`, qu'un verset soit neuf ou déjà collecté. La mécanique de collection — pilier du
  « manque de récompenses » du feedback joueur — n'avait **aucun feedback en jeu**.
- **Analyse** : célébrer le moment où un verset est débloqué pour la 1ʳᵉ fois, **dès le tout premier**
  (récompense précoce) jusqu'au corpus complet. Réutiliser le langage « milestone journal » déjà employé
  par combos / arcs / révélations (cohérence, zéro UI nouvelle). Tiers : ouverture (1er), paliers
  (10/25/50), complet (= total), sinon progression `(n/total)`.
- **Application** : module pur neuf `engine/collection.ts` — `countUnlocked(codex)` +
  `collectionRewardText(ref, count, total)`. Dans `validateChoice` (succès), on capture `wasUnlocked`
  AVANT le déblocage et, si `!wasUnlocked`, on append une entrée `milestone` **après** `[VICTOIRE]`
  (avec `...newState.journal` pour survivre au rebâtissage du journal). `tests/collection.test.ts`
  (+6 : comptage, chaque tier, entrée ordinaire). NB : bug pré-existant non touché (l'entrée combo
  ligne ~950 est écrasée par la reconstruction `[VICTOIRE]` ligne ~972) — hors scope.
- **Résultat** : au tout premier verset gagné, « ✦ Ton Grimoire s'ouvre… » ; ensuite chaque verset
  neuf est marqué, avec paliers spéciaux à 10/25/50 et fermeture du livre à 118. 155 tests verts (+6),
  tsc + build + `npm run validate` (118 versets / 186 events) OK, **zéro** dette lint (`gameEngine.ts`
  10→10, module/test à 0). Logique pure testée ; le moteur ne fait que mapper vers le journal.
- **Rollback** : `git revert <hash itération 16>`.

### Itération 17 — Fix : un bonus de combo conserve son annonce de journal
- **Recherche** : repéré pendant l'itér. 16. À un palier de combo (5/10/20, `balance.json`),
  `validateChoice` posait bien l'entrée `[COMBO xN] Bonus : …` dans `newState.journal`… mais le bloc
  `[VICTOIRE]` juste en dessous **reconstruisait** le journal depuis `...state.journal` (l'original),
  **écrasant** l'entrée combo. Le bonus s'appliquait aux stats, mais sa ligne n'apparaissait jamais —
  une récompense gagnée mais invisible.
- **Analyse** : bug d'accumulation classique (repartir de l'état d'entrée au lieu de l'état en cours
  de construction). Fix minimal : le bloc `[VICTOIRE]` doit étendre `...newState.journal`. Ordre
  résultant `[COMBO xN]` puis `[VICTOIRE]` — l'annonce du palier précède le résumé de victoire, lecture
  cohérente. Aucun test n'assertait l'ordre du succès (les tests journal portent sur `journal[0]` = naissance).
- **Application** : une ligne (`...state.journal` → `...newState.journal`) + commentaire d'avertissement.
  `tests/gameEngine.test.ts` : +1 régression (combo porté à 5 → les deux entrées `[COMBO x5]` ET
  `[VICTOIRE]` coexistent).
- **Résultat** : le bonus de combo est désormais visible au journal là où il est gagné. 156 tests verts
  (+1), tsc + build + `npm run validate` OK, **zéro** dette lint (`gameEngine.ts` 10→10). Réversible.
- **Rétro / process** : illustre la règle « dériver/accumuler depuis l'état en cours, jamais re-partir
  de l'entrée » — le même piège que les réassignations successives de `journal`. Garde-fou : test de
  coexistence des entrées.
- **Rollback** : `git revert <hash itération 17>`.

### Itération 18 — Déparkage du feedback Supabase (config fournie par l'utilisateur)
- **Recherche** : le service `services/feedback.ts` (bug-report joueur) était complet mais PARKÉ faute
  de config Supabase. L'utilisateur a fourni l'URL du projet + une clé `sb_publishable_…` (nouveau
  nommage Supabase) ; or le code lisait `VITE_SUPABASE_ANON_KEY` (ancien JWT).
- **Application** : (1) `remoteConfig()` lit désormais `VITE_SUPABASE_PUBLISHABLE_KEY` en priorité,
  repli sur `VITE_SUPABASE_ANON_KEY` — via `||` (pas `??`) pour qu'une variable **vide** bascule aussi
  sur le repli ; (2) `.env.local` renseigné (gitignore — non commité) ; (3) `.env.local.example` mis à
  jour (les deux nommages) ; (4) serveur MCP `supabase` ajouté à `.mcp.json` (scope projet). Tests
  `feedback.test.ts` rendus **hermétiques** : `beforeEach` neutralise toute config Supabase héritée de
  `.env.local` (Vitest la charge — sinon les tests « sans Supabase » tentaient un vrai POST réseau) ;
  +1 cas « publishable prioritaire sur anon ».
- **Résultat** : le feedback in-game POST vers Supabase dès que la table `feedback` existe (SQL dans
  `GDD_ELIAS.md` / `docs`). 157 tests verts (+1), tsc + build + `validate` OK, zéro dette lint. Sans
  table/clé → repli local intact (aucun retour perdu).
- **Reste à la charge de l'utilisateur** (hors code) : authentifier le MCP (`/mcp` → supabase) et créer
  la table `feedback` + policy `anon insert` (RLS) — SQL prêt dans le GDD.
- **Rollback** : `git revert <hash itération 18>` (+ retirer le bloc Supabase de `.env.local`).

### Itération 19 — Boucle feedback live (infra Supabase close)
- **Recherche** : l'itér. 18 avait câblé le code mais laissé deux étapes hors-code à l'utilisateur :
  authentifier le MCP `supabase` et créer la table `feedback`. Une fois le MCP authentifié, la boucle
  pouvait enfin être fermée et vérifiée bout-en-bout (jusqu'ici le feedback retombait sur la file locale).
- **Application** (DB via MCP — pas de code applicatif touché) : (1) table `public.feedback` créée,
  schéma conforme à `toRow()` du service (`kind/message/contact/diagnostics/app_version/created_at`) ;
  (2) RLS activé + policy `anon insert feedback` (insert anonyme, **aucune** lecture publique) ;
  (3) contrainte anti-spam `feedback_message_len` (`char_length(btrim(message)) between 1 and 4000`) —
  l'endpoint REST est ouvert à `anon`, donc un POST direct contourne le cap UI de 1000 car. ;
  (4) docs : `GDD_ELIAS.md` (annexe SQL durcie) + `CLAUDE.md` (réserve close).
- **Vérification bout-en-bout** : POST anonyme réel (clé publishable, chemin exact de `postToSupabase`)
  → **HTTP 201** ; lecture de contrôle → ligne présente ; POST message blanc → **HTTP 400** (contrainte
  OK) ; ligne de test supprimée → table à 0. Advisors sécurité : 1 WARN `rls_policy_always_true` attendu
  et assumé (insert anon volontaire). Migrations enregistrées dans l'historique Supabase.
- **Résultat** : le feedback in-game part **réellement** vers Supabase. Aucun code applicatif modifié →
  157 tests inchangés, tsc/build/validate inchangés. Repli local intact si la config disparaît.
- **Rollback** : `git revert <hash itération 19>` (docs) ; côté DB `drop table public.feedback;` ou
  reset de migration `20260617173941` / `20260617130015`.

### Itération 20 — Deux correctifs de feedback playtest (retours joueur)
- **Recherche** : deux remontées joueur. (1) Sur les jauges (`StatBar`), qui ont déjà icône PNG +
  barre PNG + valeur chiffrée, l'indicateur flottant `+N/-N` faisait doublon visuel trop voyant
  (halo lumineux, gras, 11px). (2) Dans le **tuto d'intro** (`Onboarding`), une réponse *fausse* ne
  révélait que la **référence** (« Psaume 27.1 »), jamais le **texte** du verset — donc « on connaît
  pas le verset » alors que le but du jeu est de le mémoriser. La réponse *juste* l'affichait déjà.
- **Application** (présentation pure, `.tsx`) : (1) `StatBar` — le flottant devient discret (9px,
  poids 600, `opacity 0.7`, halo remplacé par une ombre portée légère, teintes adoucies). Aucun
  effet ajouté → la baseline lint du fichier (1 `set-state-in-effect` préexistant) est inchangée.
  (2) `Onboarding` — le bloc « faux » affiche désormais le verset complet
  (`✦ Psaume 27.1 — "L'Éternel est ma lumière et mon salut"`), à parité avec le bloc « juste ».
- **Résultat** : feedback visuel des stats moins criard ; le verset cible est appris quel que soit le
  résultat dès le tuto. 157 tests verts (inchangés), tsc + build + `validate` OK, **zéro** nouvelle
  dette lint (StatBar 1→1, Onboarding 0→0).
- **Rollback** : `git revert <hash itération 20>`.

### Itération 21 — Assainissement lint (chantier dédié, par lots de risque croissant)
- **Recherche** : la base ESLint était rouge (67 problèmes / 62 erreurs). Décision de l'attaquer en
  lots **du plus sûr au plus risqué**, chaque lot = 1 commit revertable, les 4 portes vertes entre
  chaque (invariant 5), zéro nouvelle dette par fichier (invariant 6).
- **Lot A — 27 erreurs sûres** (`1bdc150`) : `no-unused-vars` (20) + `no-empty` (4, catch commentés)
  + `prefer-const` (3). Imports/vars/consts morts retirés (App, MainMenu, DebugView, LexiconMenu +
  CATEGORY_BG, gameEngine, test) ; destructuring `_` → trous ; `let`→`const`. Zéro changement de
  comportement. Lint 67→40.
- **Lot B — 8 `no-explicit-any` typés** (`356a6c8`) : `loader.ts` (RawVerse + RawLexiconEntry),
  `persistence.ts` (`getItem<Partial<GameState> & {timestamp?}>`, `Inheritance` sur save/load),
  `gameEngine.ts` (`(s as any).callFriendCount` → champ déjà typé), `analytics.ts` (window typé).
  Lint 40→32.
- **Lot C — fast-refresh `only-export-components` ×5** (`2d01cc4`) : `IconSystem.tsx` n'exporte plus
  que des composants ; les 5 maps (AFFLICTION_ICONS/COLORS, STAT_ICONS/COLORS, ENEMY_COMPONENTS)
  déménagent dans `src/components/iconMeta.tsx` (contenu identique) ; importeurs redirigés (VerseChoices,
  App). Lint 32→27.
- **Résultat (lots A-C)** : lint **67→27** problèmes. 157 tests verts (inchangés), tsc/build/validate
  OK à chaque lot. **Reste 27 erreurs hooks** (set-state-in-effect 11, purity 7, exhaustive-deps 5,
  rules-of-hooks 2, refs 2) = refactors de rendu risqués → pilotés ensuite par l'agent `release-lead`
  (cf. `docs/ROADMAP.md`).
- **Rollback** : `git revert` de chaque hash de lot indépendamment.

### Itération 21bis — Orchestration : agent `release-lead` + porte QA sans navigateur
- **Recherche** : pour finir le lint risqué puis le contenu sans gaspiller d'effort, mise en place
  d'une file de tâches et d'un orchestrateur autonome, avec une QA déterministe **sans Playwright**.
- **Application** : (1) `docs/ROADMAP.md` — file DONE/IN-PROGRESS/TODO (Phase 1 hooks par fichier,
  Phase 2 contenu), source de vérité de la *file* (le LOG reste celle du *process*) ; (2)
  `tools/qa-gate.sh` — porte unique `tsc + vitest + build + validate` + **diff lint par fichier**
  vs HEAD (la base étant rouge, on compare au lieu d'exiger zéro) ; (3) `.claude/agents/release-lead.md`
  — agent séquentiel autonome (1 tâche = 1 commit, fait respecter les 7 invariants, pause entre phases).
- **Résultat** : socle d'exécution prêt. Aucun code applicatif touché.
- **Rollback** : `git revert <hash itération 21bis>`.

### Itération 22 — Phase 1 / T-1 : `useTypewriter.ts` (set-state-in-effect ×1 → 0)
- **Recherche** : le hook gardait `count` en state et le re-synchronisait dans l'effet
  (`setCount(text.length)` hors animation, `setCount(0)` au démarrage) → 1
  `react-hooks/set-state-in-effect`. La valeur hors animation est pourtant **dérivable**
  du rendu (= `text.length`), et le reset au changement de texte relève du pattern React
  « state-on-prop-change » (pendant le rendu, pas dans un effet).
- **Application** (dérivation pendant le rendu, invariant 3) : `revealed` (state) ne pilote
  plus que la révélation animée (rAF) ; `count = animated ? revealed : text.length` est
  **dérivé** au rendu. L'effet ne fait plus aucun setState hors animation (early-return).
  Reset au changement de `text` via un state-marqueur `prevText` comparé pendant le rendu
  (`if (prevText !== text) { setPrevText(text); setRevealed(0); }`) — pas de ref-en-rendu
  (évité pour ne pas déclencher `react-hooks/refs`), pas d'effet. `skip()` pose
  `setRevealed(text.length)` depuis un handler (hors effet, autorisé).
- **Test** : `tests/useTypewriter.test.ts` (jsdom, `@testing-library/react` `renderHook`,
  rAF/`performance.now` stubés → déterministe) — 6 cas : révélation progressive, `done`,
  `skip`, reset au changement de texte (pas de flash), cps ∞ et `enabled:false` dérivés.
- **Résultat** : `useTypewriter.ts` **1 → 0** erreur hooks. Porte QA verte
  (tsc + vitest 163 verts + build + validate), zéro nouvelle dette lint. Comportement
  préservé (rendu identique à l'œil, plus performant car moins de setState).
- **Rollback** : `git revert <hash itér. 22>`.

### Itération 23 — Phase 1 / T-2 : `StatBar.tsx` (set-state-in-effect ×1 → 0)
- **Recherche** : `StatBar` détectait les variations de stats dans un effet `[stats]`
  (diff vs `prevStatsRef`) et émettait les floats `+N/-N` via `setFloats` **dans** l'effet
  → 1 `react-hooks/set-state-in-effect`. Ces floats sont des artefacts d'animation liés à
  la *transition* (non dérivables de l'état présent), donc on ne peut pas simplement les
  dériver au rendu.
- **Application** (souscription store + helper pur, invariants 2/4) : la détection passe
  d'un effet de rendu à une **souscription Zustand** (`useGameStore.subscribe((state,
  prevState) => …)`). Le listener s'exécute hors du cycle de rendu (comme un gestionnaire
  d'événement) → `setFloats` y est légitime, plus aucun set-state-in-effect. L'effet ne
  fait que poser/retirer la souscription (`return unsubscribe`). Logique extraite, pure et
  déterministe, dans `src/engine/statFloats.ts` (`diffStatFloats`/`addFloats`/`removeFloat`
  + `emptyFloatMap`, ids injectés) — `StatBar` redevient un mappeur.
- **Test** : `tests/statFloats.test.ts` (8 cas) — détection hausse/baisse/multi-stats,
  immutabilité de la map, retrait par (stat, id), no-op sans changement.
- **Résultat** : `StatBar.tsx` **1 → 0**. Porte QA verte (tsc + vitest 171 + build +
  validate), zéro nouvelle dette. Comportement visuel inchangé.
- **Rollback** : `git revert <hash itér. 23>`.

### Itération 24 — Phase 1 / T-3 : `DailyVerse.tsx` (set-state-in-effect ×1 → 0)
- **Recherche** : le verset du jour était posé en state via un effet d'init `[]`
  (`setVerse(...)`) → 1 `set-state-in-effect`, alors qu'il est **entièrement fonction de
  la date** → dérivable au rendu (invariant 3).
- **Application** : helper pur `src/engine/dailyVerse.ts` (`dayOfYear`, `verseOfDay`,
  déterministe par date) ; `DailyVerse` calcule `verseOfDay(new Date(), POOL)` pendant le
  rendu — plus de `useState`/`useEffect`. (`new Date()` au rendu ne déclenche pas
  `react-hooks/purity` : la valeur est stable sur la passe de rendu.)
- **Test** : `tests/dailyVerse.test.ts` (5 cas) — jour de l'année, cycle sur le pool,
  stabilité intra-journée, appartenance au pool.
- **Résultat** : `DailyVerse.tsx` **1 → 0**. Porte QA verte (tsc + vitest 176 + build +
  validate), zéro nouvelle dette. Rendu identique.
- **Rollback** : `git revert <hash itér. 24>`.

### Itération 25 — Phase 1 / T-4 : `DevPanel.tsx` (set-state-in-effect ×2 → 0)
- **Recherche** : deux effets fautifs. (1) effet `[]` `setVisible(isDevMode())` = init
  dérivable. (2) effet `[tapCount]` qui, au seuil de 7 taps, faisait
  `setVisible(true)`/`setTapCount(0)` **dans** l'effet → conséquence d'un événement (tap)
  mal placée.
- **Application** : (1) visibilité en **init paresseuse** `useState(isDevMode)` — plus
  d'effet. (2) le franchissement du seuil passe dans un handler `handleTap` (event), pas
  dans un effet. L'effet résiduel ne **débounce** que le compteur : son unique `setState`
  part d'un `setTimeout` différé (hors cycle de rendu) → non flaggé.
- **Test** : `tests/devPanel.test.tsx` (jsdom, `@testing-library/react`, service IA mocké,
  localStorage en mémoire) — 4 cas : caché par défaut, visible si flag, 7 taps activent +
  posent le flag, 6 taps insuffisants.
- **Résultat** : `DevPanel.tsx` **2 → 0**. Porte QA verte (tsc + vitest 180 + build +
  validate), zéro nouvelle dette. Comportement dev-tool préservé.
- **Rollback** : `git revert <hash itér. 25>`.

### Itération 26 — Phase 1 / T-5 : `DebugView.tsx` (set-state-in-effect ×1 + exhaustive-deps ×2 → 0)
- **Recherche** : un seul effet « timer » concentrait les 3 erreurs : `setTimeLeft`/
  `setChosenIds` synchrones (set-state-in-effect) + deps manquantes (`currentEvent`,
  `phase`) + expression complexe `phase === 'event'` dans le tableau de deps.
- **Application** (dérivation + état-marqueur + helper pur) : (1) l'ordre des propositions
  est **dérivé** au rendu via un mélange seedé sur l'id de l'événement —
  `src/engine/choiceOrder.ts` (`seededShuffle` Fisher–Yates + `shuffledChoiceIds`,
  déterministe, ne mute pas) — plus de `chosenIds` en state. (2) le reset du chrono à
  l'arrivée d'un événement passe en **state-on-prop-change pendant le rendu**
  (`prevEventKey`). (3) l'effet résiduel ne pilote QUE l'intervalle (système externe),
  deps propres `[active, eventKey]`, son `setTimeLeft` partant du tick différé.
- **Test** : `tests/choiceOrder.test.ts` (6 cas) — déterminisme par seed, permutation
  conservée, non-mutation, stabilité par id d'événement.
- **Résultat** : `DebugView.tsx` **3 → 0** (errorCount 0, warningCount 0). Porte QA verte
  (tsc + vitest 186 + build + validate), zéro nouvelle dette. Bonus : ordre des choix
  désormais reproductible.
- **Rollback** : `git revert <hash itér. 26>`.

### Itération 27 — Phase 1 / T-6 : `ActionPanel.tsx` (rules-of-hooks ×1 → 0)
- **Recherche** : `const useAction = useGameStore((s) => s.useAction)` — la méthode du
  store, liée sous un nom préfixé `use…`, était prise pour un Hook React ; son appel dans
  le `onClick` déclenchait `react-hooks/rules-of-hooks` (« Hook dans un callback »). Faux
  positif dû au nom, pas un vrai Hook.
- **Application** : pur renommage de la liaison locale `useAction` → `runAction` (et son
  appel). Zéro changement de comportement, aucune logique extraite.
- **Résultat** : `ActionPanel.tsx` **1 → 0** (errors 0, warnings 0). Porte QA verte
  (tsc + vitest 186 + build + validate), zéro nouvelle dette. (Renommage trivial → pas de
  nouveau test dédié.)
- **Rollback** : `git revert <hash itér. 27>`.

### Itération 28 — Phase 1 / T-7 : `ShareCard.tsx` (purity ×1 + refs ×1 + exhaustive-deps ×1 → 0)
- **Recherche** : (1) `useRef(BIBLE_QUOTES[Math.floor(Math.random()…)])` appelait
  `Math.random()` au rendu → `react-hooks/purity` ; (2) `quoteRef.current` lu au rendu →
  `react-hooks/refs` ; (3) l'effet d'auto-copie `[]` appelait `handleCopy` (closure sur
  `shareText`) → `exhaustive-deps`.
- **Application** : (1+2) la citation est tirée **une seule fois** via l'initialiseur
  paresseux `useState(() => …)` (autorisé à être impur, hors rendu) → plus de
  `Math.random` au rendu ni de ref-au-rendu ; (3) logique de copie extraite en helper
  `copyToClipboard(text)` (presse-papier + repli `execCommand`), réutilisée par
  `handleCopy`/`handleShare` ; l'effet d'auto-copie devient auto-suffisant et dépend de
  `[shareText]` (primitive stable sur la vie de la carte) → dépendance honnête.
- **Test** : `tests/shareCard.test.tsx` (jsdom, clipboard + timers mockés) — 4 cas : résumé
  rendu, **citation stable entre deux rendus** (tirage unique), bouton COPIER, auto-copie
  ~300 ms après montage.
- **Résultat** : `ShareCard.tsx` **3 → 0** (errors 0, warnings 0). Porte QA verte
  (tsc + vitest 190 + build + validate), zéro nouvelle dette.
- **Rollback** : `git revert <hash itér. 28>`.

### Itération 29 — Phase 1 / T-8 : `VerseChoices.tsx` (purity ×1 + refs ×1 + rules-of-hooks ×1 → 0)
- **Recherche** : (1) l'ordre des propositions était posé en state via `setState` au rendu +
  `Math.random` → `purity` ; (2) un `timerRef` lu au rendu → `refs` ; (3) des Hooks après un
  `return null` conditionnel → `rules-of-hooks`.
- **Application** : (1) ordre **dérivé au rendu** par un mélange seedé sur l'id de l'événement,
  helper pur `src/engine/choiceOrder.ts` (`shuffledChoiceIds`) testé `tests/choiceOrder.test.ts` —
  déterministe, sans `Math.random` ni state ; (2) le timer devient un `useEffect` à intervalle
  local nettoyé par son `return` (plus de ref-au-rendu) ; (3) tous les Hooks remontés avant la
  sortie anticipée `if (!isActive) return null`. **Finition** : la ligne morte
  `if (timerRef.current) clearInterval(...)` de `handleChoose`, restée orpheline après la suppression
  du ref, a été retirée (l'arrêt est assuré par le cleanup de l'effet).
- **Résultat** : `VerseChoices.tsx` **3 → 0**. `tsc -b` inchangé (12, baseline préexistante), vitest
  190, build + validate OK, zéro nouvelle dette.
- **Rollback** : `git revert <hash itér. 29>`.

### Itération 30 — Correctif CRITIQUE : la porte QA ne typecheckait RIEN
- **Recherche** : `npx tsc --noEmit` (étape 1 de `tools/qa-gate.sh` ET toutes les vérifs « tsc OK » de
  la session) est un **NO-OP** : le `tsconfig.json` racine a `"files": []` + `references`, donc sans
  `-p`/`-b` tsc ne vérifie aucun fichier (exit 0 systématique). Le vrai typecheck est
  `tsc -p tsconfig.app.json --noEmit`, qui révèle **12 erreurs de type préexistantes** (masquées depuis
  le début). Découvert en finissant T-8 : un `timerRef` non déclaré passait `tsc --noEmit` sans broncher.
- **Mesure** : baseline `tsc -b` à `6d6c722` (début de session) = **26** erreurs ; à HEAD post-T-8 = **12**.
  La session a donc **réduit** la dette de type (le nettoyage lint A/B/C a supprimé des `no-unused`
  qui étaient aussi des erreurs TS). Les 12 restantes sont préexistantes (CodexMenu, Prologue, App,
  events/verses/gameEngine casts, +1 dans loader introduit par le lot B — à traiter).
- **Application** : `qa-gate.sh` étape 1 fait désormais un **vrai** typecheck (`tsc -p tsconfig.node.json`
  + `tsc -p tsconfig.app.json`) avec **ratchet** vs `tools/tsc-baseline.txt` (=12) : interdit toute
  régression, tolère la baseline connue (même philosophie que le lint « déjà rouge »).
- **Résultat** : la porte attrape maintenant les régressions de type. Aucune correction des 12 erreurs
  dans ce commit (tâche dédiée, cf. ROADMAP Phase 1bis).
- **Rollback** : `git revert <hash itér. 30>`.

### Itération 31 — Phase 1 / T-9 : `App.tsx` (12 erreurs hooks → 0, en 5 sous-commits vérifiés au navigateur)
- **Recherche** : le « monstre » de la Phase 1 — 5 purity + 5 set-state-in-effect + 2 exhaustive-deps
  dans le fichier de rendu central, mêlant état UI et effets de bord (son, particules, IA). Ces effets
  ne sont PAS validables par la porte sans navigateur → vérif `run-elias` réintégrée pour cette tâche.
- **Sous-commits** (1 famille à la fois, porte QA + smoke navigateur à chaque) :
  - **T-9a** purity ×5 : `BackgroundParticles` — `Math.random` au rendu (`useMemo`) → initialiseur
    paresseux `useState(() => …)`.
  - **T-9b** L293 : reset des modales de fin → « reset state on prop change » au rendu (suivi `prevOver`).
  - **T-9c** L199 : `setAmbientOn(false)` sur `reducedSounds` → reset au rendu + `stopAmbient()` en effet.
  - **T-9d** L226 : **result flash dérivé** — `showResult`/`showVerseConfirm` dérivés de
    (`phase`+`lastEventResult`), bannière/revers tirés par un **RNG seedé sur l'id d'événement**
    (déterministe, stable, plus de `Math.random` au rendu) ; 4 `useState` supprimés ; l'effet ne garde
    que le juice impératif + l'auto-dismiss en callback de timer (deps honnêtes). **Vérif navigateur** :
    flash succès auto-dismiss + modale d'échec (verset révélé, grâce) affichée puis fermée, 0 erreur console.
  - **T-9e** : `generatingAiEvent` `useState`→`useRef` (garde non rendue → supprime un set-state-in-effect) ;
    `hydrateFromSave` ajouté aux deps de l'effet d'init ; **1 exception ASSUMÉE** (eslint-disable justifié)
    sur la génération du journal vivant — contenu narratif aléatoire accumulé + raffiné async = cas
    légitime « effet qui produit des données » (retrait complet = remonter la génération dans `advanceAge`,
    évolution future notée).
- **Résultat** : **`react-hooks/* = 0 sur tout le projet`** (la base était à 67 problèmes en début de
  chantier itér. 21). `tsc -b` inchangé (12 baseline), vitest 190, build + validate OK. Chaque sous-commit
  revertable, smoke navigateur vert (journal se peuple, jeu progresse, 0 erreur console).
- **Rollback** : `git revert` de chaque sous-commit (T-9a…T-9e) indépendamment.

### Itération 50 — T-31 : registre d'assets `illustrationRegistry.ts` + branchement `JournalBubble`
- **Recherche** : le principe ASSET-READY (T-20) exige un slot `assetId` résolu en placeholder
  aujourd'hui, pointant vers de l'art réel demain **sans refactor**. `messageSender.ts` génère
  les assetId (`elias__<sender>__<iconKey>`) pour tous les events ; `JournalBubble.tsx` les
  utilisait déjà pour les avatars via une lettre initiale dérivée inline (`avatarLetter`).
  Manquait : le registre centralisé qui fait le lien et que les futurs assets viendront remplir.
- **Application** :
  - **`src/assets/illustrationRegistry.ts`** (module pur, zéro React) — type `IllustrationEntry
    { type, value, label }` ; map `ILLUSTRATION_REGISTRY` couvrant les 36 assetId générés par
    `messageSender.ts` (11 heaven + 16 adversary + 9 entourage + 1 conscience) ; fonction
    `resolveAsset(assetId)` avec fallbacks par préfixe de sender (garantie : jamais undefined).
    Couleurs re-déclarées localement (source de vérité visuelle autonome, non consommatrice du moteur).
  - **`src/components/JournalBubble.tsx`** — refactor avatar minimal : suppression de `avatarLetter`
    (dérivation inline sur iconKey), remplacement par `avatarLetterFromRegistry(sender.assetId)`
    qui passe par `resolveAsset()` pour le label. Import `resolveAsset` ajouté.
  - **`tests/illustrationRegistry.test.ts`** — 52 tests : structure générale, couverture par
    émetteur (heaven/adversary/entourage/conscience), résolution directe, fallbacks (5 cas),
    invariant asset-ready, sémantique des labels.
- **Résultat** : porte QA verte — 0 erreur type, 400 tests (28 fichiers), build OK, validate 226
  events, lint-diff 0 → 0 sur les fichiers touchés. Le registre est prêt à recevoir de l'art réel :
  seul `type` et `value` d'une entrée changeront, aucun consommateur ne sera refactoré.
- **Rollback** : `git revert <hash>` — revert de l'import dans JournalBubble + suppression du module.

### Itération 36 — Phase 3 préparée : backlog « fil polyphonique » + principe asset-ready
- **Recherche** : étude game-design avec le porteur autour de *7 Days* (Buff Studio) / chat-narratif.
  Diagnostic : on décroche après l'âge 18-25 (« trop routinier, sans différenciation »). Les 5 piliers de
  7 Days (chat immédiat, poids réel des choix, rythme snackable, portraits expressifs, dilemmes moraux)
  tombent sur des systèmes **déjà présents** d'Élias — le manque est la *mise en scène* + la *visibilité*.
- **Vision (validée)** : la vie d'Élias = un **fil de messages** de 4 émetteurs — **Ciel/Esprit**,
  **Adversaire** (1 voix par affliction), **Entourage** (amis/famille/collègues/église), **Conscience** —
  auxquels Élias **répond par un verset**. L'émetteur se **dérive** de `category`+`storyArcId` (zéro migration ;
  le champ `tone` du type n'est rempli sur aucun des 186 events → non utilisé).
- **Application** : file complète **T-20..T-32** ajoutée en `docs/ROADMAP.md` (Phase 3), priorisée par impact
  en 4 tiers + transverse, miroir dans la task-list. **Principe transverse ASSET-READY** (non négociable) :
  tout émetteur/event/**lieu**/**objet** expose un slot `assetId` résolu en placeholder (couleur+icône) tant que
  l'art manque, et pointera vers de l'illustration **sans refactor** (T-31 registre, T-32 expressions).
- **Résultat** : backlog prêt ; tête de file **T-20** `src/engine/messageSender.ts` (module pur dérivant
  l'identité d'émetteur + `assetId`), puis T-21 (bulles attribuées) + T-22 (echoes visibles) pour la différenciation.
- **Vérif** : porte QA verte (doc-only). **Rollback** : `git revert` du commit `docs(itér.36)`.

### Itération 35 — Piste B : rééquilibrage de la courbe de survie (mesuré avant/après)
- **Recherche** : le harnais (itér. 34) a prouvé 3 pathologies : (1) **inversion de difficulté**
  (mieux répondre = mourir plus tôt), (2) **physique = compte à rebours sans récupération** →
  victoire (100) inatteignable, (3) finances tuent les joueurs imprécis tôt. Cause de l'inversion :
  **burnout appliqué PAR épreuve** (palier3 −3 physique) → la précision pousse au palier 3 et se punit.
- **Application** (pur `game/config/balance.json`, zéro code gameplay — réversible) :
  - burnout palier3 3→**1**, palier2 1→**0** (tue l'inversion).
  - vieillissement senior physique : `physiqueDeclineRateOld` 2→**1** (61+ : −2/an au lieu de −3).
  - finances `adult` (26-45) 3→**2** (adoucit la mort-finances du début/milieu).
  - **combos = voie de récupération du PHYSIQUE** (clé) : `physique` ajouté/renforcé aux paliers
    x5/x10/x20 (+4/+8/+12) et au `repeatBonus` (+4). La compétence (séries) restaure le corps →
    récompense le skill ET ouvre la fin de vie aux experts. Thème : la vigueur divine (`lourdeur_fatigue`).
  - test `calculateBurnoutRate` mis à jour au nouveau contrat (palier2=0, palier3=1).
- **Mesure (N=1000, scénario « avec actions », médiane d'âge / ≥80 ans / =100 ans)** :

  | précision | AVANT (itér.34) | APRÈS (itér.35) |
  |---|---|---|
  | 50 % | **62** / 0 % / 0 % (inversion) | **71** / 11 % / 0 % |
  | 65 % | 49 / 0 % / 0 % | 71 / 12 % / 0 % |
  | 75 % | 44 / 0 % / 0 % | 71 / 13 % / 1 % |
  | 85 % | **42** / 0 % / 0 % | **75** / 34 % / 6 % |

  → **inversion supprimée** (courbe monotone : mieux jouer = vivre plus longtemps), ≥60 ans passe de
  ~3-17 % à ~94-97 %, et la **victoire (100) devient atteignable** pour l'excellence (6 % à 85 %).
  Gradient de maîtrise net (≥80 ans : 11 %→34 % selon la précision). La fin de vie reste un vrai
  défi (physique), pas un mur.
- **Vérif** : `bash tools/qa-gate.sh` vert (vitest 190 avec tests burnout mis à jour, build, validate),
  smoke `run-elias` vert (0 erreur console), avant/après chiffré par `tools/survival-sim.ts`.
- **Limite connue / pont vers la suite** : la médiane reste plafonnée par le physique (~71) ; aller
  plus loin demanderait une voie de récupération du physique hors-combo (action « repos » / design),
  à étudier avec la Piste C (contenu) et l'axe game-design « différenciation / rejouabilité ».
- **Rollback** : `git revert` du commit (config + 1 test).

### Itération 34 — Piste M : harnais de simulation de survie (mesure avant tuning)
- **Recherche** : audit du jeu (2 agents Explore + chiffres). Verdict : **tous les systèmes du GDD
  sont implémentés et câblés** (Flow/Combo/Cascade/SRS/Codex/Titres+héritage/saisons émergentes/
  4 leviers de rejouabilité/IA fallback). Déficit réel = **contenu** (13/23 catégories ≤5 events,
  variantes narratives 6.5 %) et **équilibrage senior non mesuré**. La ROADMAP (T-16) exige
  « re-simuler avant de tuner » — or aucun harnais n'existait.
- **Application** : `tools/survival-sim.ts` (headless, `npx tsx`, **hors bundle + hors porte QA** :
  `tools/` n'est dans aucun `include` tsconfig, le fichier ne matche pas `*.test.`). Rejoue N=1000
  vies 0→100 en pilotant l'engine réel (`createInitialState`→`advanceAge`→`validateChoice`→
  `checkGameOver`), à précision p ∈ {50,65,75,85}%, 2 scénarios (réponses seules / avec actions).
- **Résultat MESURÉ (N=1000)** — contredit les estimations « à la main » du GDD et de l'audit :
  - **Personne n'atteint 100 (victoire) ; quasi personne n'atteint 80.** Même à 85 % de précision,
    âge médian ≈ 37 (réponses seules) / 42 (avec actions).
  - **Inversion de difficulté** : *mieux* répondre fait mourir *plus tôt* (50 % → médian 62 ;
    85 % → 42, avec actions). Cause : haute précision ⇒ Flow élevé ⇒ palier 3 ⇒ **burnout −3
    physique/an**, et **aucune action ne restaure le physique** (jeûner en coûte). La mort passe
    de *finances* (faible précision) à *physique* (haute précision, 88-98 %).
  - **events distincts/vie : 22-44** → routine intra-run faible confirmée ; le problème de routine
    est inter-runs (pool + variantes), pas intra-run.
- **Conséquence (n'a RIEN tuné — c'est l'objet de la Piste B)** : cibles claires pour le rééquilibrage —
  (1) rendre la victoire (100) atteignable ; (2) ouvrir une voie de récupération du **physique** et
  adoucir le burnout senior ; (3) lisser la pression *finances* début/milieu. À chiffrer avec ce
  harnais avant/après.
- **Vérif** : porte QA verte (lint du nouveau fichier 0→0, le reste inchangé). `npx tsx tools/survival-sim.ts`.
- **Rollback** : `git revert` du commit (suppression d'un pur outil, zéro impact gameplay).

### Itération 33 — Fix : le verset s'affiche EN ENTIER dans le journal (succès comme échec)
- **Recherche** : bug rapporté — après avoir répondu à une épreuve, qu'on ait raison ou tort, le verset doit
  s'afficher en entier dans le chat (journal). Or l'entrée `[VICTOIRE]` ne portait que la **référence**, alors
  que `[ECHEC]` affichait déjà le **texte complet** : asymétrie.
- **Application** : `src/engine/gameEngine.ts` — l'entrée de succès inclut désormais `: "{texte}"` comme l'échec
  (1 ligne ; rendu du chat identique pour les deux types d'entrée).
- **Vérif** : porte QA verte ; **pilotage navigateur réel** (`run-elias`) — succès *et* échec affichent le verset
  complet dans le chat, 0 erreur console. **Rollback** : `git revert` du commit `fix(itér.33)`.

### Itération 32 — Phase 1bis : dette de TYPE (12 erreurs → 0, en 5 commits T-T1…T-T5)
- **Recherche** : depuis la porte réparée (itér. 30), le vrai typecheck `tsc -p tsconfig.app.json`
  exposait **12 erreurs de type préexistantes**, tolérées via le ratchet `tools/tsc-baseline.txt` (=12).
  Objectif : les corriger une à une et ramener la baseline à 0, sans dette ni changement de comportement.
- **Commits** (1 lot de fichiers = 1 commit, porte QA verte + baseline décrémentée à chaque) :
  - **T-T1** `game/data/loader.ts` (12→10) : l'import cassé (`'../types/game'`) rendait les types `any`
    et **masquait** les casts en aval. Réparé (`'../../src/types/game'`), `RawVerse.impact/diff` aligné sur
    la forme JSON réelle (calque `src/data/verses.ts`), `category→AfflictionCategory`, events via `unknown`.
  - **T-T2** `src/components/CodexMenu.tsx` (10→8) : `CAT_LABELS`/`CAT_COLORS` ne couvrent que les 8
    catégories d'origine → type honnête `Partial<Record<AfflictionCategory,string>>` (usages déjà tolérants).
  - **T-T3** `src/components/Prologue.tsx` (8→6) : `val` possibly undefined → `(val ?? 0)` ; `setAccumulated`
    complète le champ requis `name`.
  - **T-T4** `src/data/events.ts` + `src/data/verses.ts` (6→4) : casts JSON→type (`as unknown as
    AfflictionEvent[]` car `ageRange` JSON s'infère `number[]` ≠ tuple ; `category→AfflictionCategory`).
  - **T-T5** `src/engine/gameEngine.ts` (3) + `src/App.tsx` (1) (4→0) : index `newStats` par `keyof` ;
    retrait du membre mort `&& newState.phase !== 'event'` (phase toujours `'idle'` à ce stade) ;
    **App.tsx** `phase === 'gameover'` (jamais vrai) → vrai signal `gameOver?.isOver`. Ce dernier est la
    **seule correction touchant le runtime** (l'effet « journal vivant » court-circuite désormais en fin
    de partie — intention manifeste du garde mort, couvert par l'exception exhaustive-deps assumée).
- **Résultat** : `npx tsc -p tsconfig.app.json --noEmit` → **0 erreur** (baseline 12→0). Porte QA verte à
  chaque commit (vitest 190, build, validate 118v/186e, lint-diff 0 régression). Vérif comportementale du
  changement runtime : smoke `run-elias` vert (jeu monté, 20 entrées de journal, 1 épreuve, 0 erreur console).
- **Rollback** : `git revert` de chaque commit T-T1…T-T5 indépendamment.

### Itération 37 — T-20 : `messageSender.ts` — dérivation d'émetteur (module pur + tests)
- **Recherche** : Phase 3 / fil polyphonique (T-20..T-32). La vision : la vie d'Élias = un fil de
  messages de 4 émetteurs (Ciel / Adversaire / Entourage / Conscience). T-20 = fondation pure :
  un module qui dérive l'identité de l'émetteur depuis les données déjà présentes (`category` +
  `storyArcId`) — zéro migration, zéro refactor existant. Sources lues : `types/game.ts`
  (`AfflictionEvent`, `JournalEntry`, `AfflictionCategory`), `data/storyArcs.ts` (11 arcs),
  `components/iconMeta.tsx` (`AFFLICTION_COLORS`, `ENEMY_COMPONENTS`).
- **Application** : `src/engine/messageSender.ts` (module pur, 0 import React, 0 state).
  - Type exporté `MessageSender` : `{ sender, displayName, color, iconKey, assetId }`.
  - Type exporté `SenderKind` : `'heaven' | 'adversary' | 'entourage' | 'conscience'`.
  - `deriveMessageSender(event)` : règle de priorité — arc-entourage prime > catégorie-ciel > catégorie-affliction > conscience.
  - `deriveSenderFromJournalEntry(entry)` : dérive depuis le `type` et les marqueurs textuels.
  - **Principe asset-ready** : `assetId` = `elias__<sender>__<iconKey>` — TOUJOURS rempli, stable,
    pointera vers de l'art (T-31) sans refactor.
  - Tests : `tests/messageSender.test.ts` — 39 tests couvrant les 4 émetteurs + invariants asset-ready
    + edge case catégorie inconnue + priorité arc-entourage sur category.
- **Résultat** : porte QA verte — typecheck 0 erreur, 229 tests passés (22 fichiers), build OK,
  validate 118v/186e, lint-diff 0→0 sur les 2 fichiers touchés.
- **Rollback** : `git revert` du commit `feat(itér.37)`.

### Itération 38 — T-21 : Journal = fil de bulles attribuées (émetteur + couleur + icône)
- **Recherche** : T-21 mappe T-20 (`messageSender.ts`) sur l'UI. Le journal existant dans
  `App.tsx` rendait les entrées comme liste de texte plat avec classes CSS (`entry-success`,
  `entry-fail`, etc.). L'objectif : transformer ce fil en bulles de chat attribuées, avec
  positionnement gauche/droite selon l'émetteur (heaven/adversary/entourage = gauche ;
  conscience + réponses d'Élias = droite). Sources lues : `src/App.tsx` (rendu journal lignes
  878–932), `src/engine/messageSender.ts` (T-20), `src/types/game.ts` (`JournalEntry`,
  `AfflictionCategory`), `src/index.css` (classes journal existantes).
- **Application** :
  - Nouveau composant `src/components/JournalBubble.tsx` — rendu pur (0 state, 0 effect) :
    - `isSelfEntry()` — détermine la position droite (`success`, `fail`, `conscience`).
    - `avatarLetter()` — dérive la lettre d'avatar de l'`iconKey` (asset-ready pour T-31).
    - Milestones = bande pleine largeur centrée (`.jb-milestone`).
    - Bulles standard : avatar + nom émetteur au-dessus + bulle colorée gauche ou droite.
    - `assetId` exposé via `--jb-color` CSS var + lettre de l'`iconKey` — slot pour T-31.
  - Nouvelles classes CSS dans `src/index.css` : `.jb-row`, `.jb-avatar`, `.jb-bubble-col`,
    `.jb-sender-name`, `.jb-age-tag`, `.jb-bubble`, `.jb-bubble--*`, `.jb-milestone`,
    `.jb-milestone-icon`, `.jb-milestone-text` ; `prefers-reduced-motion` respecté.
  - `App.tsx` : import de `JournalBubble` + `deriveSenderFromJournalEntry` ; rendu journal
    principal remplacé par `<JournalBubble entry={…} sender={msgSender} />` ; entrées IA
    conservent leur rendu textuel.
- **Résultat** : porte QA verte — typecheck 0/0, 229 tests passés (22 fichiers), build OK,
  validate 118v/186e, lint-diff 0→0 sur les 2 fichiers touchés (`App.tsx`, `JournalBubble.tsx`).
- **Rollback** : `git revert` du commit `feat(itér.38)`.

### Itération 39 — T-22 : Conséquences visibles — bulles de rappel quand prerequisites actifs

- **Recherche** : T-22 amplifie le système `echoes.ts` existant pour rendre VISIBLE la causalité
  narrative. Quand un event avec `prerequisites` est déclenché, une bulle de rappel sobre dit
  explicitement le lien : « Il y a 13 ans (à 32 ans), tu as choisi le pardon face à Louise.
  Ce chemin-là ouvre maintenant cette porte. » Sources lues : `src/engine/echoes.ts`,
  `src/engine/messageSender.ts`, `src/types/game.ts` (structures `EventRequirement`, `AfflictionEvent`,
  `JournalEntry`), `src/engine/gameEngine.ts` (boucle `advanceAge` + `filterEventsByPrerequisites`),
  `src/App.tsx` (rendu journal, injection `JournalBubble`). 39 events avec prerequisites dans la base.
  2 events flag-based (`louise_pardonnee`) + 36 event_completed + 1 verse_unlocked.

- **Application** :
  - Nouveau module pur `src/engine/echoLink.ts` — `buildEchoLinkEntry(event, state)` :
    - `prereqLabel(req)` : dérive un libellé court (« tu as surmonté … », « tu as pardonné à Louise »)
      pour chaque type de `EventRequirement` (flag / event_completed / event_succeeded / event_failed /
      arc_completed / verse_unlocked). Flags connus enregistrés dans `FLAG_LABELS`.
    - `prereqAge(req, state)` : retrouve l'âge de la source dans le journal, les arcs complétés, ou
      le codex. Retourne `null` si inconnu — la bulle s'affiche quand même sans âge.
    - `formatRecallText(label, age, currentAge)` : formule le texte sobre (avec durée écoulée si ≥2 ans).
    - `hasEchoLink(event)` : prédicat léger (pour éviter l'appel inutile).
    - Marqueur `[ECHO_LINK]` dans le texte → capté par `deriveSenderFromJournalEntry` → sender `heaven`.
  - `src/engine/messageSender.ts` : ajout de `'[ECHO_LINK]'` dans `heavenMarkers` du milestone handler.
  - `src/engine/gameEngine.ts` : import de `buildEchoLinkEntry` + injection dans `advanceAge` juste
    avant `newState.currentEvent = event` (la bulle précède l'épreuve dans le journal).
  - Tests : `tests/echoLink.test.ts` — 23 tests couvrant : `hasEchoLink`, sans prerequisites,
    flag connu (louise_pardonnee avec âge + texte), flag inconnu → null, event_completed connu/inconnu,
    event_succeeded / event_failed, verse_unlocked, format de la JournalEntry, multiple prerequisites.

- **Résultat** : porte QA verte — typecheck 0 erreur (baseline 0), 252 tests passés (23 fichiers),
  build OK, validate 118v/186e, lint-diff 0→0 sur les 4 fichiers touchés.

- **Rollback** : `git revert` du commit `feat(itér.39)`.

### Itération 40 — T-23 Variantes narratives 6.5 % → 22 % (tueur de routine)

- **Recherche** : `applyNarrativeVariant()` est déjà câblée dans `generateEvent` (gameEngine.ts
  lignes 779, 795, 853). Elle cherche `event.narrativeVariants[]` et applique la première variante
  dont la condition (`season` / `calling` / `stat_check` / `has_trait` / `birth_profile`) correspond
  à l'état courant. Seuls 12 events sur 186 (6.5 %) l'exploitaient — pourtant c'est le mécanisme
  le moins coûteux pour briser la routine.

- **Analyse** : 45 events prioritaires identifiés (âge 15-45, catégories
  `combat_spirituel`, `identite_appel`, `amertume_rejet`, `peur_angoisse`, `doute_incredulite`,
  `tristesse_joie`, `decouragement`, `finances_paresse`, hors cascades). Objectif : enrichir 28-30
  de ces events pour dépasser 38/186 (20 %).

- **Application** :
  - Enrichissement de `game/data/events.json` : 29 events enrichis (blocs thématiques) :
    - Bloc jeunesse (âge 8-25) : `e-fond-001`, `e-choix-001..006` (6 events)
    - Bloc vie productive (âge 26-50) : `e-prod-003`, `e-prod-006`, `e-prod-008`,
      `e-decour-001/002`, `e-joie-001/002`, `e-ami-002`, `e-fin-001/002` (10 events)
    - Arcs narratifs : `arc-louise-2`, `arc-mathias-2/3`, `arc-tentation-4`, `arc-guerison-1`,
      `arc-parents-1/2/3`, `arc-eglise-1/2`, `arc-ville-1/2`, `arc-conjoint-3` (13 events)
  - Chaque event reçoit 2 variantes : une sur `season` + une sur `calling`, toutes dans le
    ton évangéliste (grâce > punition, l'épreuve ouvre un chemin plus humble).
  - Résultat : 41/186 events avec variantes = **22.0 %** (vs 6.5 % avant).
  - Aucun fichier TypeScript modifié — enrichissement de données pur, zéro refactor.

- **Résultat** : porte QA verte — typecheck 0 erreur (baseline 0), 252 tests passés (23 fichiers),
  build OK, validate 118v/186e, lint-diff (aucun .ts/.tsx touché). Seuil ≥20 % atteint : 22.0 %.

- **Rollback** : `git revert` du commit `feat(itér.40)`.

### Itération 41 — T-24 Chapitres de vie — carte de décennie + cliffhanger

- **Recherche** : `advanceAge` dans `gameEngine.ts` (lignes 1380-1401) gère déjà les transitions
  de saison aux bornes de décennie (`newAge % 10 === 0`). `JournalBubble.tsx` rend les milestones
  comme bandes pleine-largeur (`.jb-milestone`). La `JournalEntry` supporte `type: 'milestone'`.
  Le moteur n'avait pas de notion de « chapitre de vie » — chaque décennie était anonyme.

- **Analyse** : scope exact = 10 décennies nommées (L'Éveil … L'Accomplissement) + 9 cliffhangers
  (âges 9, 19, …, 89). Module pur `lifeChapters.ts` pour respecter l'invariant 2. Branchement
  dans `advanceAge` après la transition de saison (saison déjà calculée = disponible). Style CSS
  distinct pour les cartes de chapitre (violet / plus grand) vs milestones ordinaires (doré / petit).

- **Application** :
  - `src/engine/lifeChapters.ts` (nouveau module pur) :
    - `CHAPTERS[10]` : données des 10 décennies (titre, thème, texte cliffhanger).
    - `getChapterIntro(age, season, callingId?)` → `JournalEntry` `[CHAPITRE]` type milestone.
    - `getDecadeCliffhanger(age, playerName)` → `JournalEntry` `[CLIFFHANGER]` type milestone, ou
      `null` si âge non-X9 ou age ≥ 90.
    - `isDecadeStart(age)` / `isDecadeEnd(age)` — prédicats purs consommés par gameEngine.
    - `seasonLabel()` : mappe `Persécution` → `Épreuve` (lisible).
  - `src/engine/gameEngine.ts` : import + injection dans `advanceAge` après le bloc de transition
    de saison — `isDecadeStart(newAge)` → carte d'intro (saison déjà calculée) ;
    `isDecadeEnd(newAge)` → cliffhanger.
  - `src/components/JournalBubble.tsx` : détection de `[CHAPITRE]` / `[CLIFFHANGER]` en tête
    de texte → classe CSS supplémentaire (`jb-milestone--chapter` / `jb-milestone--cliffhanger`) ;
    l'icône ronde est masquée pour ces types (texte seul, centré).
  - `src/index.css` : 3 blocs ajoutés — `.jb-milestone--chapter` (violet `#c084fc`, padding 10px,
    bordure 2px, texte 13px non-italique 600), `.jb-milestone--cliffhanger` (or, bordure pointillée,
    texte 12px italique), `prefers-reduced-motion` étendu aux deux classes.
  - `tests/lifeChapters.test.ts` : 35 tests — `isDecadeStart` (5), `isDecadeEnd` (5),
    `getChapterIntro` (15), `getDecadeCliffhanger` (10).

- **Résultat** : porte QA verte — typecheck 0 erreur (baseline 0), **287 tests passés** (24 fichiers,
  +35 nouveaux), build OK, validate 118v/186e, lint-diff 0→0 sur les 4 fichiers touchés
  (`JournalBubble.tsx`, `gameEngine.ts`, `lifeChapters.ts`, `lifeChapters.test.ts`).

- **Rollback** : `git revert` du commit `feat(itér.41)`.

### Itération 42 — T-25 Ambition de run — progression de l'Appel visible

- **Recherche** : `GameState` contient déjà `completedArcs`, `encounteredArcIds`,
  `answeredArcEventIds` — toute la progression peut être dérivée sans nouveau champ.
  `STORY_ARCS` (11 arcs) n'a pas de `callingId` — les arcs sont universels ; le `Calling`
  apporte le titre, l'icône et la couleur de l'ambition. Pattern de référence :
  `arcProgress.ts` (dérivation pure) + `ArcTracker.tsx` (composant zéro-state).

- **Analyse** : scope = (a) module pur `runAmbition.ts` avec deux fonctions : `deriveRunAmbition`
  (liste triée active→done→locked avec stepsCompleted/stepsTotal) et `getCallingProgress`
  (percent/completed/active/total) ; (b) composant `AmbitionTracker.tsx` zéro-state-métier —
  bouton discret « MON APPEL » qui ouvre un panneau coulissant en bas d'écran ; (c) branchement
  minimal dans `App.tsx` — le badge Appel statique est remplacé par `AmbitionTracker`.
  Résolution des templates `{ville}/{ami}/…` dans le composant (côté présentation, pas dans
  le module pur). `prefers-reduced-motion` respecté : transition de barre désactivée via CSS.

- **Application** :
  - `src/engine/runAmbition.ts` (nouveau module pur) :
    - `deriveRunAmbition(state)` → `AmbitionStep[]` triée (active/done/locked),
      `stepsCompleted` = count des eventIds de l'arc présents dans `answeredArcEventIds`
      (sauf si terminé → stepsTotal).
    - `getCallingProgress(state)` → `{ completed, active, total, percent }`.
    - Exports : types `AmbitionStepStatus`, `AmbitionStep`, `CallingProgress`.
  - `tests/runAmbition.test.ts` : 15 tests — statuts (locked/active/done), tri,
    stepsCompleted, percent, edge cases (tous terminés, aucun rencontré).
  - `src/components/AmbitionTracker.tsx` (nouveau composant) :
    - Sélecteurs atomiques Zustand (4 champs) — pas de sélection du state entier.
    - Panneau en `role="dialog"`, Escape pour fermer, overlay clic extérieur.
    - Barre `role="progressbar"` accessible + étapes par arc avec mini-barres de sous-étapes.
    - `StepRow` isolée — reçoit les données résolues (templates) par props.
    - `@media (prefers-reduced-motion: reduce)` : transition de barre = none.
  - `src/App.tsx` : import + remplacement du badge Appel statique par `<AmbitionTracker />`.

- **Résultat** : porte QA verte — typecheck 0 erreur (baseline 0), **299 tests passés** (25 fichiers,
  +15 nouveaux dans `runAmbition.test.ts`), build OK, validate 118v/186e, lint-diff 0→0 sur les
  4 fichiers touchés (`App.tsx`, `AmbitionTracker.tsx`, `runAmbition.ts`, `runAmbition.test.ts`).
  Commit : `3613095`.

- **Rollback** : `git revert 3613095`.

### Itération 43 — Audit de cohérence + renommages avant Tier 3

- **Recherche** : inspection complète des marqueurs de journal, noms d'émetteurs, composants et
  classes CSS produits par T-20..T-25 (itér. 37-42). Vérification de la cohérence style/casse/convention
  sur tout le corpus source + tests.

- **Analyse** : incohérences identifiées :
  1. **`[ARC COMPLÉTÉ]` avec espace et accent** — incohérent avec `[ECHO_LINK]`, `[CHAPITRE]`,
     `[CLIFFHANGER]` qui utilisent des underscores et pas d'accents.
  2. **7 marqueurs de jalons d'âge disparates** — `[ADOLESCENCE]`, `[JEUNE ADULTE]`, `[MATURITÉ]`,
     `[PIVOT]`, `[PROFONDEUR]`, `[SAGESSE]`, `[GLORIEUX]` représentent tous la même chose (milestone
     d'âge) mais ont des noms différents. Avec le système T-24 (`[CHAPITRE]`) qui couvre déjà le
     contenu de chaque décennie, ces marqueurs doivent être unifiés sous un nom fonctionnel unique.
  3. **Commentaire erroné dans `messageSender.ts`** — ligne 234 cite `[RÉVEIL]` mais le marqueur
     réel dans `reveals.ts` est `[ÉVEIL]`.
  4. **`heavenMarkers` incomplet** — `[CHAPITRE]`, `[CLIFFHANGER]`, `[JALON]` absents de la liste
     de reconnaissance de l'émetteur `heaven` dans `deriveSenderFromJournalEntry`.

- **Application** :
  - `src/engine/gameEngine.ts` :
    - `[ARC COMPLÉTÉ]` → `[ARC_COMPLET]` (underscores, sans accent, cohérent avec la convention Phase 3).
    - `[ADOLESCENCE]`, `[JEUNE ADULTE]`, `[MATURITÉ]`, `[PIVOT]`, `[PROFONDEUR]`, `[SAGESSE]`,
      `[GLORIEUX]` → tous unifiés en `[JALON]` (marqueur fonctionnel unique pour les bornes d'âge).
  - `src/engine/messageSender.ts` :
    - Commentaire : `[RÉVEIL]` corrigé en `[ÉVEIL]`.
    - `heavenMarkers` : `[ARC COMPLÉTÉ]` remplacé par `[ARC_COMPLET]` ; `[CHAPITRE]`, `[CLIFFHANGER]`,
      `[JALON]` ajoutés (assure la bonne attribution de l'émetteur pour tous les nouveaux types).
  - `tests/identity.test.ts` : recherche `'ADOLESCENCE'` → `'[JALON]'`.
  - `tests/messageSender.test.ts` : `[ARC COMPLÉTÉ]` → `[ARC_COMPLET]` (× 2) ; `[JEUNE ADULTE]`
    → `[JALON]` dans le test de jalons de vie.

- **Résultat** : porte QA verte — typecheck 0 erreur, **299 tests passés**, build OK, validate
  118v/186e, lint-diff 0→0 sur les 4 fichiers touchés. Aucune fonctionnalité ne change —
  les marqueurs sont uniquement de la donnée texte lue en dérivation.

- **Rollback** : `git revert <hash itér. 43>`.

### Itération 44 — T-26 Bulle entrante + indicateur « ... en train d'écrire »

- **Recherche** : les meilleures messageries (iMessage, WhatsApp, 7 Days) montrent l'émetteur
  « en train d'écrire » (3 points animés) avant d'afficher le message. Appliqué aux épreuves
  d'Élias : quand un nouvel event arrive, simuler l'arrivée d'un message de chat — pause de
  1.2s avec l'indicateur, puis bulle + `useTypewriter` habituel.

- **Analyse** : `VerseChoices.tsx` est le point d'entrée naturel — il connaît `currentEvent`
  et gère déjà le reset-on-prop-change du timer. L'émetteur est dérivé de `deriveMessageSender`
  (T-20, pur, zéro state). Le pattern correct pour le délai : état `isTyping` déclenché dans
  le reset-on-prop-change (pendant le rendu) + `setTimeout` dans un `useEffect` pour le basculer
  à `false` après 1200ms. Cas `prefers-reduced-motion` : `typingDuration()` retourne 0 →
  `isTyping` ne passe jamais à `true` (géré au reset, aucun setState synchrone dans l'effet).

- **Application** :
  - `src/components/TypingIndicator.tsx` — composant pur : 3 points animés CSS
    (`@keyframes ti-bounce` avec délai échelonné 0/0.2s/0.4s), `jb-avatar` (réutilise la
    même classe que `JournalBubble`), `isTyping: boolean` pour afficher/cacher (return null).
    `role="status"` + `aria-label` pour l'accessibilité.
  - `src/components/VerseChoices.tsx` — ajout de `isTyping` (state), `typingTimerRef` (ref),
    `typingDuration()` (helper pur), import `TypingIndicator` + `deriveMessageSender`. Reset
    dans le bloc `prevEventKey` existant. Effet timer minimal (1 seul `useState` dans le
    callback différé). Contenu de l'épreuve masqué avec `{!isTyping && <> ... </>}`.
  - `src/index.css` — classes `.typing-indicator-row`, `.typing-indicator-bubble`,
    `.typing-indicator-name`, `.typing-indicator-dots`, `.typing-indicator-dot{--1/2/3}`,
    `@keyframes ti-bounce`. `prefers-reduced-motion` : animation none, points statiques visibles.

- **Résultat** : porte QA verte — typecheck 0 erreur, 299 tests passés, build OK, validate
  118v/186e, lint-diff 0→0 sur les 2 fichiers touchés. Bulle entrante animée avec indicateur
  de frappe 1.2s avant chaque nouvelle épreuve ; accessibilité `prefers-reduced-motion`
  respectée (pas de typing du tout — épreuve apparaît immédiatement).

- **Rollback** : `git revert <hash itér. 44>`.

### Itération 45 — T-27 Versets = chips de réponse → bulle envoyée

- **Recherche** : iMessage et WhatsApp transforment les suggestions rapides en bulles envoyées
  au tap — animation scale+glissement vers la droite, puis la bulle apparait côté envoyeur.
  Appliqué aux choix de versets d'Élias : la réponse d'Élias devient visible avant que le
  store ne traite le résultat, ce qui renforce l'immersion « conversation » amorcée par T-26.

- **Analyse** : `VerseChoices.tsx` gère déjà le flux tap → `chooseVerse()`. Le delta minimal :
  (1) remplacer les `.btn-choice` rectangulaires par des `.verse-chip` pills colorés selon
  l'émetteur (via `--vc-color: eventSender.color`), (2) introduire un state `sendingChipId`
  (string|null) déclenché dans le handler (hors render — conforme react-hooks), (3) afficher
  une `.verse-bubble-sent` droite indigo pendant le délai 400ms, (4) appeler `chooseVerse()`
  dans le callback différé du `setTimeout` en vérifiant via `currentEventKeyRef` que l'event
  n'a pas changé. `prefers-reduced-motion` : `chipSendDelay()` retourne 0 → chemin direct.
  Contrainte ESLint résolue : accès à `sendTimerRef.current` dans le reset-on-prop-change du
  rendu était interdit (`react-hooks/refs`). Solution : `currentEventKeyRef` sert de token de
  validation côté callback, sans accès à la ref depuis le rendu.

- **Application** :
  - `src/components/VerseChoices.tsx` — ajout de `chipSendDelay()` (helper pur), `sendingChipId`
    (state, reset dans le bloc prevEventKey), `currentEventKeyRef` (ref consultée uniquement dans
    le handler), `handleChoose` modifié (délai 400ms → `setSendingChipId` → bulle → `chooseVerse`),
    rendu des chips refactorisé : `verse-chip` pills au lieu de `btn-choice` rectangulaires,
    badge lettre teinté de la couleur de l'émetteur, `verse-bubble-sent-row` insérée au-dessus
    des chips pendant l'animation. Import `CSSProperties` pour typer les custom properties CSS.
  - `src/index.css` — `.verse-chip` (pill, `--vc-color`, fond translucide teinté), `.verse-chip:hover`,
    `.verse-chip:active`, `.verse-chip--sending` (`@keyframes chip-send` scale+translateX+opacity),
    `@media prefers-reduced-motion` (animation: none, opacity: 0), `.verse-bubble-sent-row`
    (justify-content: flex-end + fadeIn), `.verse-bubble-sent` (fond indigo #4f46e5, coin
    bas-droit aplati, ombre colorée).

- **Résultat** : porte QA verte — typecheck 0 erreur, 299 tests passés, build OK, validate
  118v/186e, lint-diff 0→0 sur les 2 fichiers touchés. Les versets deviennent des chips pills
  tintées par la couleur de l'émetteur ; le tap déclenche une bulle indigo droite (réponse
  d'Élias) pendant 400ms avant que l'app ne traite le résultat. `prefers-reduced-motion` :
  transition immédiate sans animation.

- **Rollback** : `git revert <hash itér. 45>`.

### Itération 46 — T-28 Voix de l'adversaire nommées — couleur + icône par affliction

- **Recherche** : dans les jeux d'horreur narrative (Hades, Disco Elysium, Slay the Princess),
  chaque voix ennemie a une identité visuelle propre — couleur, icône, sous-titre. T-28 applique
  ce principe aux 14 afflictions d'Élias : chaque voix (La Peur, Le Doute, L'Orgueil…) obtient
  sa propre couleur HUD dérivée de `AFFLICTION_COLORS` et son SVG ennemi depuis `ENEMY_COMPONENTS`
  (8 silhouettes déjà disponibles). Un sous-titre « voix de l'adversaire » renforce l'identité.

- **Analyse** : `buildAdversarySender()` dans `messageSender.ts` utilisait `SENDER_COLORS.adversary`
  (rouge générique #ef4444) pour tous les adversaires. `AFFLICTION_COLORS` et `ENEMY_COMPONENTS`
  existaient déjà dans `iconMeta.tsx`. Problème architectural : `messageSender.ts` est un module pur
  (zéro React) qui ne peut pas importer du JSX — or `iconMeta.tsx` contient des composants inline.
  Solution : extraire la map de couleurs dans `src/engine/afflictionColors.ts` (module pur `.ts`),
  et dans `iconMeta.tsx` importer et ré-exporter via assignation (`const X = _x`) pour rétrocompatibilité.
  Le re-export direct `export { X } from '...'` déclenchait 4 erreurs `react-refresh/only-export-components`
  là où l'assignation `export const X = _x` (identique au comportement HEAD) n'en déclenche aucune.

- **Application** :
  - `src/engine/afflictionColors.ts` (nouveau) — module pur : `AFFLICTION_COLORS` (23 catégories,
    palette distincte rouge/violet/orange/gris/bleu par affliction). Source de vérité pour le moteur.
  - `src/engine/messageSender.ts` — `buildAdversarySender()` : `color = AFFLICTION_COLORS[category] ?? SENDER_COLORS.adversary` ;
    import depuis le module pur (pas de JSX).
  - `src/components/iconMeta.tsx` — importe `afflictionColors.ts` et ré-exporte via `export const AFFLICTION_COLORS = _af`
    (rétrocompatibilité pour `VerseChoices.tsx`) ; commentaire mis à jour.
  - `src/components/JournalBubble.tsx` — helper `extractEnemyCategory()` : extrait la catégorie depuis
    l'`iconKey` adversaire et vérifie la présence dans `ENEMY_COMPONENTS`. Avatar gauche : affiche
    `<EnemySvg size={28} />` si SVG disponible, sinon lettre initiale. Sous-titre `jb-sender-subtitle`
    pour tous les émetteurs adversaires.
  - `src/index.css` — `.jb-sender-subtitle` (9px, italic, opacity 0.55).

- **Résultat** : porte QA verte — typecheck 0 erreur, 299 tests passés, build OK, validate 118v/186e,
  lint-diff 0→0 sur les 4 fichiers touchés. Chaque voix adversaire a désormais sa couleur distinctive
  (La Peur = violet #8b5cf6, Le Doute = bleu-gris #94a3b8, L'Orgueil = rouge #dc2626, etc.) et
  son icône SVG si disponible (8 afflictions sur 14 couvertes). Le sous-titre « voix de l'adversaire »
  renforce l'identité narrative sans alourdir la lecture.

- **Rollback** : `git revert <hash itér. 46>`.

### Itération 47 — T-29 Choix moraux — dilemmes d'acte (schéma + moteur + UI + 3 events)

- **Recherche** : *Disco Elysium* et *80 Days* opposent deux modes de résolution distincts : le
  choix de *savoir* (le bon verset, la bonne réponse) et le choix d'*agir* (quelle attitude, quel
  acte concret). T-29 introduit cette deuxième couche : des dilemmes moraux où Élias choisit un
  acte (« Dire la vérité » / « Mentir pour protéger » / « Garder le silence »), pas un verset.
  Les flags posés par ces choix alimentent le branchement narratif (système B déjà en place).

- **Analyse** : le schéma `AfflictionEvent` (game.ts) ne permettait que des events à verset.
  Un nouveau champ optionnel `moralChoices?: MoralChoice[]` suffit pour le discriminer — si présent
  et non vide, c'est un dilemme moral. Le moteur (`gameEngine.ts`) court-circuite les leurres de
  verset pour ces events. L'UI (`App.tsx`) route vers `MoralChoicePanel` au lieu de `VerseChoices`.
  Le journal reçoit un type `'moral'` afficher à droite (voix d'Élias, côté conscience).

- **Application** :
  - `src/types/game.ts` — `MoralChoice` interface + `moralChoices?` sur `AfflictionEvent` +
    type `'moral'` dans `JournalEntry.type`.
  - `src/engine/moralChoice.ts` (nouveau) — module pur : `isMoralEvent(event): boolean` +
    `applyMoralChoice(state, choice): GameState` (flags, deltas, journal, phase→result).
  - `src/components/MoralChoicePanel.tsx` (nouveau) — composant léger : 2-3 boutons d'acte,
    style grave (fond sombre, violet doux), bulle de confirmation post-choix, reset-on-prop-change,
    prefers-reduced-motion respecté.
  - `src/stores/gameStore.ts` — nouvelle action `chooseMoral(choice)` + import `applyMoralChoice`.
  - `src/App.tsx` — import + branchement `isMoralEvent` : si moral → `<MoralChoicePanel />`,
    sinon → `<VerseChoices />` (invariant : 0 cas spécial dans le moteur).
  - `src/components/JournalBubble.tsx` — `isSelfEntry` étend à `'moral'` (côté Élias).
  - `src/engine/messageSender.ts` — `deriveSenderFromJournalEntry` : cas `'moral'` → conscience.
  - `src/engine/gameEngine.ts` — `generateEvent` : si l'event sélectionné est moral, skip les leurres.
  - `src/index.css` — styles `.moral-panel`, `.moral-choice-btn`, `.moral-chosen-bubble`,
    `.jb-bubble--moral` + media query `prefers-reduced-motion`.
  - `game/data/events.json` — 3 events moraux ajoutés (e-moral-001..003) : trahison d'ami /
    mensonge au travail / pardon difficile (âges 18-55, catégories `amertume_rejet`/`orgueil_independance`).
  - `tools/validate-data.cjs` — validation adaptée : events moraux exemptés de `correctVerseId`,
    leurs `MoralChoice[]` validés à la place (id, label, flagsSet non vide).
  - `tests/moralChoice.test.ts` (nouveau) — 18 tests : isMoralEvent (4) + applyMoralChoice (14).

- **Résultat** : porte QA verte — typecheck 0 erreur (baseline 0), 317 tests passés (26 fichiers,
  +18 moraux), build OK, validate 118v/189e (dont 3 moraux) ZERO erreur, lint-diff 0→0 sur les
  9 fichiers touchés.

### Itération 48 — T-30 Contenu C1 — catégories enrichies + 13 events seniors 75-100

- **Recherche** : audit de `game/data/events.json` (189 events à l'entrée). Distribution par
  catégorie : 8 catégories à exactement 2 events — `saint_esprit`, `parole_de_dieu`, `priere`,
  `soif_de_dieu`, `obeissance`, `lourdeur_fatigue`, `maladie_guerison`, `sterilite`. Pool seniors
  (minAge ≥ 75) : seulement 7 events (e-bilan-010, e-senior-003..008). Toutes les catégories
  concernées ont des versets disponibles (3-4 chacune).

- **Analyse** : les catégories pauvres coupent des arcs thématiques importants de la vie spirituelle
  (prière, obéissance, Saint-Esprit, soif de Dieu, guérison) en ne proposant qu'un seul event de
  chaque type en jeu réel. Pour les seniors 75-100, seuls 7 events couvrent 25 ans de vie — les
  thèmes transmission, fragilité du corps, réconciliations tardives, proximité de la mort et héritage
  spirituel étaient totalement absents.

- **Application** : enrichissement JSON pur de `game/data/events.json` — aucun TypeScript modifié.
  - 24 nouveaux events pour les 8 catégories pauvres (3 events par catégorie), versets existants,
    âges variés (16-85), ton évangéliste sobre (grâce > punition dans chaque description et flavor).
  - 13 nouveaux events seniors (e-senior-009..021, minAge entre 75 et 93) :
    - Transmission de foi (e-senior-009 : petit-fils, e-senior-013 : lettres testament spirituel)
    - Bilan de vie et grâce (e-senior-010 : nuit d'insomnie à 78 ans)
    - Fragilité du corps (e-senior-011 : dépendance acceptée)
    - Paix intérieure (e-senior-012 : paix qui dépasse)
    - Réconciliations tardives (e-senior-014 : message après 15 ans)
    - Proximité de la mort (e-senior-015 : mort d'un ami proche, e-senior-020 : sanctification tardive)
    - Don de sagesse (e-senior-016 : mentorat)
    - Intercession du vieil âge (e-senior-017)
    - Gratitude de soir (e-senior-018), abandon de la maison (e-senior-019)
    - Joie à contre-courant (e-senior-021)

- **Résultat** : `npm run validate` vert : 118 versets / 226 events (dont 3 moraux) — ZERO erreur.
  Porte QA verte (typecheck 0, 317 tests passés, build OK, validate OK, lint-diff : aucun .ts/.tsx
  touché). Pool 75-100 : 7 → 20 events (minAge ≥ 75). Total 189 → 226 events (+37).
  Catégories pauvres : toutes les 8 portées de 2 → 5 events.
  Commit `6dd95e8`.

- **Rollback** : `git revert 6dd95e8`.

### Itération 49 — T-17 Mode découverte — entraînement sans conséquence de stats

- **Recherche** : les jeux de mémorisation (Duolingo, Anki) montrent qu'un mode sans enjeu
  réduit le stress d'apprentissage et augmente la rétention. Pour Élias, le frein à l'exploration
  des arcs est la peur de perdre des stats sur un verset mal mémorisé. Un mode d'entraînement
  pur préserve l'enjeu du mode normal tout en offrant un filet pédagogique.

- **Analyse** : `validateChoice` dans `gameEngine.ts` est le point unique d'application des deltas.
  Court-circuiter proprement ce point (module pur `applyDiscoveryChoice`) satisfait l'invariant 2
  (modulaire). Le flag `discoveryMode: boolean` dans `GameState` est un dérivé d'état propre —
  il suit le cycle save/load via la whitelist de `persistence.ts`.

- **Application** :
  - `src/types/game.ts` : champ `discoveryMode: boolean` (défaut `false`, JSDoc clair).
  - `src/engine/gameEngine.ts` : fonction pure `applyDiscoveryChoice` (bypass stats, révèle verset,
    marque codex, injecte `[DÉCOUVERTE]` dans le journal) + délégation dans `validateChoice` quand
    `state.discoveryMode === true`. Initialisation à `false` dans `createInitialState`.
  - `src/stores/gameStore.ts` : action `toggleDiscoveryMode()` (bascule + saveGame).
  - `src/data/persistence.ts` : `discoveryMode` ajouté à la whitelist de `saveGame`.
  - `src/components/DevPanel.tsx` : toggle `useGameStore` dans le panneau dev (bouton bleu distinctif).
  - `src/App.tsx` : badge visuel `DECOUVERTE` dans l'`info-bar` (bleu, discret, conditionnel sur `discoveryMode`).
  - `tests/discoveryMode.test.ts` : 10 tests de la logique pure (`applyDiscoveryChoice` + délégation).

- **Résultat** : porte QA verte — typecheck 0, 400 tests passés (+10), build OK,
  validate 118v/226e, lint-diff 0 sur tous les fichiers touchés. Mode découverte accessible via
  le DevPanel (7 taps coin bas-droite ou `?dev` dans l'URL), badge bleu discret dans le HUD
  quand actif. Pas de conséquence de stats, verset toujours révélé, codex toujours mis à jour.

- **Rollback** : `git revert <hash itér. 49>`.

### Itération 51 — T-32 Expressions d'avatar — ton/résultat pilotent l'état de la bulle

- **Recherche** : les jeux type « 7 Days to Die » ou les VN enrichis attribuent des expressions
  émotionnelles distinctes à chaque personnage selon le contexte : l'adversaire provoque AVANT la
  réponse, triomphe si Élias échoue, est brisé s'il réussit. Cette différenciation visuelle/sémantique
  renforce la lecture émotionnelle de chaque moment. Élias avait déjà un registre d'assets asset-ready
  (T-31) et un émetteur dérivé (T-20) — il manquait la couche d'expression.

- **Analyse** : `JournalEntry.type` porte déjà toute l'information nécessaire : `'event'` = avant
  réponse, `'success'` / `'fail'` = résultats. Combiné à `SenderKind`, on peut dériver 6 expressions
  sans aucun nouveau state. `resolveAsset` a déjà un fallback automatique pour les assetId inconnus
  → les variantes d'expression non enregistrées dégradent gracieusement vers le placeholder de base.

- **Application** :
  - `src/engine/avatarExpression.ts` (nouveau module pur) :
    - Type `AvatarExpression = 'neutral' | 'challenge' | 'victory' | 'defeat' | 'warning' | 'joy'`
    - `deriveExpression(entry, sender)` : 7 types d'entrée × 4 senders → expression déterministe
      (ex. `event+adversary → challenge`, `fail+adversary → victory`, `success+adversary → defeat`,
      `event+heaven → joy`, `milestone+* → neutral`)
    - `expressionToAssetSuffix(expr)` : `neutral → ''`, autres → `__<expr>`
    - `buildExpressionAssetId(baseId, expr)` : compose l'assetId enrichi
  - `src/assets/illustrationRegistry.ts` — 75 variantes d'expression ajoutées :
    - Heaven : joy/victory/warning pour `heaven_victory`, `heaven_milestone`, catégories fréquentes
    - Adversary : challenge/victory/defeat pour generic/cascade + 5 afflictions nommées (peur,
      doute, amertume, combat spirituel, orgueil, découragement)
    - Entourage : challenge/joy/warning pour 7-8 arcs (ami/parents/église/métier/conjoint/mathias/louise)
    - Conscience : victory/warning/joy
  - `src/components/JournalBubble.tsx` — `resolveExpressionAssetId(entry, sender)` calculé au rendu
    (pur, zéro state, zéro effet) ; passe l'assetId enrichi à `avatarLetterFromRegistry()`.
    Milestone = neutre (suffixe vide = assetId de base). SVG ennemi T-28 prioritaire sur la lettre.
  - `tests/avatarExpression.test.ts` (nouveau) : 46 tests couvrant toutes les combinaisons
    (type×sender), les suffixes, la composition d'assetId et l'intégration avec `resolveAsset`.
  - `tests/illustrationRegistry.test.ts` — 2 assertions de comptage mises à jour (16 base / 9 base
    sans les variantes T-32 ; assertions supplémentaires vérifiant que le total dépasse la base).

- **Résultat** : porte QA verte — typecheck 0 erreur (baseline 0), 447 tests passés (29 fichiers,
  +46 avatarExpression), build OK, validate 118v/226e, lint-diff 0 sur les 5 fichiers touchés.
  Commit `c27fc19`.

- **Rollback** : `git revert c27fc19`.

### Réserve (analysée, non encore planifiée)
- ✅ ~~Déterminisation complète de la naissance / graine partageable~~ → **livré itér. 10**.
- ✅ ~~Smart skip vers le non-lu~~ → **livré itér. 11** (système « texte déjà-lu → instantané »).
- **Conséquences ramifiées (`B`)** : arcs narratifs locaux (nœuds→arêtes) + flags de conséquence +
  validation DFS d'atteignabilité + visualizer à la *Academical* (cf. `DESIGN_PARTIE2.md` §5). Gros cycle dédié.
- ✅ ~~**Assainissement lint hooks (chantier dédié)**~~ → **livré itér. 21–31** : `react-hooks/* = 0`
  sur tout le projet (67→0), fichier par fichier avec porte QA + vérif navigateur. Reste tracé en
  `docs/ROADMAP.md` : **Phase 1bis** = 12 erreurs de TYPE préexistantes (révélées par la porte
  réparée à l'itér. 30) ; **Phase 2** = contenu.
- **Codex vivant** (80 Days) : variété de texte à la révision des versets.
- **Conséquences ramifiées** : choix narratif altérant durablement la run (gros scope).
- **Onboarding zéro-friction** : soigner les premières minutes (Prologue/Onboarding existants).
