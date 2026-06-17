# Dossier de conception — Partie 2 d'Élias

> **À lire en premier la prochaine fois.** Ce document fige la réflexion de la boucle
> d'amélioration (cf. `docs/ITERATION_LOG.md`, itér. 1–8) et prépare la suite.
>
> **Décision prise : on fera `D` puis `A`.** (Identité du personnage → Graines partageables.)
> Le reste (B, C) est cadré ici mais reporté.

---

## 0. Insight cadre — et où Élias se situe vraiment

> « Un jeu purement textuel n'est pas un livre numérique, c'est une **base de données
> interactive**. L'UX repose sur la gestion des états, le routage conditionnel entre nœuds
> narratifs, et l'ergonomie de lecture. »

C'est vrai **en principe**. Mais attention à ne pas plaquer sur Élias une architecture qui
n'est pas la sienne. Il faut distinguer deux familles :

| | **VN / fiction interactive** (Twine, Ren'Py, *Academical*) | **Élias aujourd'hui** |
|---|---|---|
| Modèle | Graphe **nœuds → arêtes** écrit à la main | **Procédural** : événements tirés d'une base, pas un graphe écrit |
| Progression | On suit des branches narratives | Simulation de vie 0→100 ans, épreuves résolues par le bon verset |
| État | Variables/flags accumulés sur le parcours | Stats + `codex` + `traits`/`completedArcs` (Zustand + localforage) |
| Hasard | Aucun (déterministe par les choix) | `mulberry32` seedé pour la « colonne vertébrale » + `Math.random` pour le fin |

**Conséquence : on n'adopte PAS un backend nœuds/arêtes (cf. §6).** En revanche, presque
toutes les *features structurelles* et *principes UX* des moteurs textuels sérieux
s'appliquent — et c'est exactement ce que la boucle a commencé à installer (flow de lecture,
échos, réactions). Ce qui suit relie ces principes à nos 4 propositions.

Référence visuelle de branchement (à garder en tête pour `B`) :
**Plot graphs des scénarios jouables d'*Academical* visualisés dans Twine** —
<https://www.researchgate.net/figure/Plot-graphs-for-two-of-Academicals-playable-scenarios-visualized-in-the-Twine-authoring_fig1_342866309>
→ illustre les **goulets d'étranglement** (branches qui divergent puis convergent) et la
**lisibilité d'un graphe narratif** : c'est la forme cible si on introduit du vrai branchement.

---

## 1. Les 4 propositions (vue d'ensemble)

| | Proposition | Scope | Risque | Impact ressenti | Statut |
|---|---|---|---|---|---|
| **D** | **Identité du personnage** (saisir un nom, semer l'identité) | Moyen, borné | Faible | **Fort** (racine du retour « ça ne nous ressemble pas ») | ✅ **LIVRÉ** (itér. 9) |
| **A** | **Graines partageables** (déterminiser toute la naissance) | Moyen, moteur | Moyen | Fort (rejouabilité, « rejoue ma vie ») | ✅ **LIVRÉ** (itér. 10) |
| **B** | **Conséquences ramifiées** (vrai branchement narratif) | Gros | Élevé | Très fort | 🟡 **B-1 LIVRÉ** (itér. 12 : moteur flags + branchement + DFS + arc-louise) ; **B-2 visualizer = PROCHAIN** (itér. 13) |
| **C** | **Assainissement lint global** (~60 `set-state-in-effect`) | Gros, fastidieux | Élevé | Nul côté joueur (qualité) | Chantier à part |

> Pourquoi `D` puis `A` : `D` adresse le retour joueur n°1 et est borné/peu risqué ; `A` le
> complète naturellement (l'identité saisie devient une **graine de destinée partageable**).
> `B` est le plus « exceptionnel » mais aussi le plus lourd — il mérite son propre cycle une
> fois `D`+`A` stabilisés. `C` est de la dette pure, à traiter hors boucle juice.

---

## 2. QoL / UX structurelles — état d'Élias vs cible

Dans un jeu 100 % textuel, l'absence d'outils de confort **détruit la rétention**. État des
lieux honnête (à re-vérifier dans le code avant d'agir — cf. `[[feedback-context-window]]`) :

| Feature | Rôle narratif | Élias aujourd'hui | Action |
|---|---|---|---|
| **State tracking (variables silencieuses)** | Se « souvenir » d'un choix mineur pour altérer plus tard | ✅ `traits`, `completedArcs`, `codex`, échos (itér. 2) **+ `state.flags` de conséquence (itér. 12)** | ✅ étendu par `B-1` |
| **Log / Backlog** | Retrouver le contexte, anti-clic-trop-vite | ✅ Journal existant (scroll arrière) | Vérifier profondeur ; OK a priori |
| **Smart Skip / Fast-forward** | S'arrête au texte **non lu** → rejouabilité | ✅ **LIVRÉ (itér. 11)** : système « texte déjà-lu → instantané, neuf → animé + ✦ nouveau » par empreinte de contenu (`settings/seenText.ts`) | — |
| **Goulets d'étranglement** | Illusion de liberté sans explosion combinatoire | ✅ **LIVRÉ (itér. 12)** : modèle « spine + variantes hors-spine », `eventIds[]` = goulets de convergence (arc-louise diverge séq 3, converge séq 4) | Cœur de `B-1` ✅ |
| **Save-scumming (slots multiples)** | Oser les choix risqués | ⚠️ 1 sauvegarde auto (localforage) | À évaluer avec `B` (sinon peu utile en procédural) |
| **Branching Visualizer** | Biais de complétion (voir les chemins grisés) | ❌ | **Cible de `B-2` (itér. 13)** : `ArcTracker.tsx` piloté par `state.flags`+`answeredArcEventIds` (forme = graphe *Academical*) |
| **Flavor text (« le mythe du choix »)** | Choix A et B → même résultat, mais phrase d'intro adaptée. Coût `if/else`, impact immersion massif | ✅ Très présent : réactions victoire/revers (itér. 4/7), codex vivant (itér. 6), vignette (itér. 5) | **C'est notre force actuelle — continuer** |
| **Pacing par le clic** | Isoler une phrase/un mot sur écran vide = impact dramatique impossible en littérature | ✅ Amorcé par le typewriter (itér. 1) | Exploiter dans `B` pour les beats forts |

**Lecture** : la boucle a déjà couvert l'essentiel du **flavor text** et du **pacing** (nos
points forts). Les manques structurels (**smart skip vers le non-lu**, **visualizer**,
**branchement**) dépendent tous de `A`/`B`. Donc l'ordre `D → A → (skip) → B` est cohérent.

---

## 3. `D` — Identité du personnage (prochain cycle)

**Problème (racine du feedback « ça ne nous ressemble pas »)** : le nom est codé en dur
« Élias », et ville/ami/profession/parents/conjoint sont **tous** des `Math.random()` sur des
listes fixes dans `gameEngine.ts`. Le seul vrai input joueur = 5 choix binaires du Prologue.

**Cible (bornée, peu risquée, réversible)** :
1. Un champ **nom** (et éventuellement ville d'origine) saisi à la création — écran Prologue
   ou juste avant `createInitialState`.
2. Le nom se **propage** partout où « Élias » est affiché (vignette d'ouverture itér. 5,
   journal, game over). Repérer les occurrences en dur avant de coder.
3. Valeur par défaut « Élias » si le joueur ne saisit rien → **aucune régression**.
4. Persister dans l'état de jeu (compatible save : champ optionnel, fallback sur défaut).

**Patrons à réutiliser** : « dériver d'un état déjà daté plutôt qu'ajouter du state » quand
possible ; module pur pour toute logique de nom ; vérifier les early-returns / hooks.
**Critère de réussite** : le joueur voit *son* nom dès l'ouverture ; partie sans saisie =
identique à aujourd'hui ; `tsc` + tests + build verts.

> Lien avec `A` : une fois le nom saisi, il devient une **entrée de graine** — deux joueurs
> avec le même nom + même seed obtiennent la même destinée (cf. §4).

---

## 4. `A` — Graines partageables (cycle suivant)

**Constat technique (révélé à l'itér. 5)** : `createInitialState` n'est **pas** déterministe
par seed. `generateBirthStats()`, `generateParentNames()`, `generateLifeContext()` utilisent
`Math.random`, donc ville/parents/profession diffèrent à seed égal. Seule la « colonne
vertébrale » (Appel, saisons, vignette) est seedée.

**Cible** : faire passer **toute la naissance** par le `Rng` seedé (`mulberry32(seed)`), de
sorte que **même graine = même destinée**. Débloque :
- « **Rejoue ma vie** » : partager un seed = partager une trajectoire de départ reproductible.
- Défis communautaires (« qui s'en sort le mieux avec la graine 12345 ? ») **sans backend**.
- **Smart skip** crédible (rejouer une vie connue en accéléré jusqu'au non-vu).
- Tests d'intégration enfin déterministes (on pourra réactiver l'assertion retirée à l'itér. 5).

**Plan** :
1. Ajouter un paramètre `rng: Rng` (injecté) à `generateBirthStats/ParentNames/LifeContext`,
   remplacer chaque `Math.random()` par `rng()` (helpers `rngPick`/`rngInt` existent déjà).
2. `createInitialState(seed)` instancie **un** `mulberry32(seed)` et le fait circuler.
3. Afficher/copier le seed (et le nom de `D`) sur l'écran de fin → « partager cette vie ».
4. Réactiver le test « même seed → même ouverture » (itér. 5) en assertion de détermination.
5. **Réversibilité** : le défaut (seed aléatoire à la naissance) reste ; on n'enlève rien.

**Risque** : moteur de création de partie → couvrir par tests avant/après (mêmes stats de
départ attendues pour un seed fixe). Garde anti-régression obligatoire.

---

## 5. `B` — Conséquences ramifiées (🟡 B-1 livré itér. 12 ; B-2 visualizer = itér. 13)

Le plus « exceptionnel » : un choix narratif qui **altère durablement** la run. C'est ici
qu'entrent le **graphe**, les **goulets d'étranglement** et la **visualisation** (réf.
*Academical*/Twine au §0). C'est aussi là que les **algorithmes de graphe** servent vraiment.

> **État (itér. 12) — `B-1` headless livré.** Implémentation **plus légère** que l'esquisse
> `StoryNode`/`StoryEdge` ci-dessous : pas de nouveau type de graphe en données, on **greffe** le
> branchement sur l'existant. (1) Flags de conséquence : `state.flags: Record<string,boolean>`,
> posés par `setsFlagsOnSuccess?/OnFail?` dans `validateChoice`, lus par `EventRequirement` `kind:'flag'`.
> (2) Modèle **« spine canonique + variantes hors-spine »** : `arc.eventIds[]` reste un id par position
> (les goulets de convergence) ; les variantes partagent `storyArcId`+`arcSequence` mais sont hors
> `eventIds` ; le helper pur `isArcStepUnlocked` déverrouille « une étape N-1 répondue » (robuste aux
> variantes). (3) Validation = `engine/storyGraph.ts` `validateStoryGraph()` (DFS itératif LIFO, cf. §5.2),
> en garde CI (`tests/storyGraph.test.ts`). Arc exemplaire **arc-louise** : réussir/échouer la séquence 2
> aiguille deux variantes de séquence 3 (`arc-louise-3` apaisé / `arc-louise-3-hard` exigeant) qui
> convergent sur `arc-louise-4`. **Reste B-2** : le visualizer (`ArcTracker.tsx`).

### 5.1 Modèle (léger, modulaire, sans casser le procédural)
On **ne remplace pas** la simulation par un graphe global. On introduit des **arcs ramifiés
locaux** : des mini-graphes nœuds→arêtes greffés sur certains événements/arcs, avec des
**flags de conséquence** dans l'état (pattern « state tracking »). Les branches **convergent**
sur des goulets pour éviter l'explosion combinatoire.

```ts
// Esquisse — un arc ramifié = un petit graphe validable
interface StoryNode { id: string; text: string; choices: StoryEdge[]; }
interface StoryEdge { label: string; to: string; conditions?: Flags; sets?: Flags; }
```

### 5.2 DFS comme outil de **validation** (pas de déplacement)
Le DFS excelle pour répondre à *« un chemin existe-t-il ? »* et pour le **tri topologique**
(ordre des prérequis d'arcs/talents). Usages concrets pour `B` :
- **Atteignabilité** : depuis le nœud d'entrée d'un arc, **toutes les fins** sont-elles
  atteignables ? Sinon → contenu mort (à corriger en amont, comme on valide un niveau
  procédural avant de le servir).
- **Pas d'impasse** : aucun nœud sans sortie (hors fins explicites).
- **Prérequis cohérents** (tri topo DFS) : aucun arc n'exige un flag qu'aucun chemin ne pose.

DFS **itératif** (jamais récursif en JS/TS → « Maximum call stack size exceeded » sur gros
graphes). À placer en **test de cohérence du contenu** (CI), adapté de la grille au graphe :

```ts
/** Toutes les fins d'un arc sont-elles atteignables depuis son entrée ? (DFS itératif, LIFO) */
function allEndingsReachable(nodes: Map<string, StoryNode>, entry: string): boolean {
  const stack = [entry];
  const visited = new Set<string>([entry]);
  while (stack.length > 0) {
    const id = stack.pop()!;               // LIFO = signature du DFS
    const node = nodes.get(id);
    if (!node) return false;               // arête pointant vers un nœud inexistant
    for (const edge of node.choices) {
      if (!visited.has(edge.to)) { visited.add(edge.to); stack.push(edge.to); }
    }
  }
  // fins = nœuds sans choix ; on vérifie qu'elles sont toutes dans `visited`
  return [...nodes.values()].filter((n) => n.choices.length === 0)
    .every((end) => visited.has(end.id));
}
```

### 5.3 Quel algo pour quoi (mémo)
- **DFS** → « un chemin existe-t-il ? », génération, **tri topologique** (arbres de
  quêtes/talents), IA tour-par-tour (Minimax + **élagage alpha-bêta**).
- **BFS** → le plus proche (ennemi le plus proche, propagation), chemin en *nombre de pas*.
- **A\*** → déplacement **optimal** vers une cible pondérée.
→ Pour Élias, on n'a **pas** de déplacement spatial : seuls **DFS** (validation/topo) et,
éventuellement, BFS (distance narrative en nb de nœuds) sont pertinents.

---

## 6. Horizon « stack web / LiveOps » — référence, NON adopté maintenant

La piste **Next.js + Supabase** (tables `nodes`/`edges`/`player_sessions`, RLS, Server
Components, Optimistic UI, prefetching, Edge caching, Server Actions anti-triche) est une
**architecture de référence valable**… **pour un autre jeu**. Pour Élias, on **ne** bascule
**pas** dessus, parce que ça contredit nos invariants :

- **Offline-first / sans IA** (exigence explicite) : Élias est une **PWA** qui doit tourner
  sans réseau ni clés. Un backend nœuds/arêtes rendrait le jeu dépendant du cloud.
- **Procédural, pas node-graph** : nos « nœuds » sont générés, pas écrits — le modèle
  `nodes`/`edges` ne colle qu'à la part **ramifiée** (`B`), et là on le garde **local** (§5.1).
- **« Ne rien casser »** : migrer l'état vers PostgreSQL = réécriture du cœur. Hors de
  question dans la boucle.

**Ce qu'on en retient quand même** (idées, pas la stack) :
- **State tracking** par flags JSON → déjà notre direction pour `B`.
- **Optimistic UI / latence < 50 ms** → on l'a déjà (tout est local/instantané).
- **Server Actions anti-triche** → non pertinent (jeu solo, pas de score serveur). Si un jour
  **leaderboards de graines** (`A`) : *là* seulement, un envoi best-effort type **feedback
  Supabase** (déjà câblé, cf. ci-dessous) suffirait, sans réécrire le moteur.

> **Parking** : le **feedback/bug-report Supabase** reste partiellement câblé
> (`onOpenFeedback` dans `App.tsx`) et **en attente** des `VITE_SUPABASE_URL` +
> `VITE_SUPABASE_ANON_KEY` de l'utilisateur. C'est le **seul** point de contact cloud prévu,
> anonyme et optionnel (le jeu marche sans).

---

## 7. Prochaines itérations (format boucle)

À reprendre dans `docs/ITERATION_LOG.md` au même format (Recherche → Analyse → Consensus →
Application → Rétro → Rollback) :

- **Itér. 9 — `D` Identité du personnage** : champ nom (défaut « Élias »), propagation,
  persistance save-compatible. Critère : son nom dès l'ouverture, zéro régression sans saisie.
- **Itér. 10 — `A` Graines partageables** : `rng` injecté dans toute la naissance, partage du
  seed, réactivation du test de détermination. Critère : même graine = mêmes stats/identité de
  départ ; garde anti-régression verte.
- **Itér. 11 — *smart skip vers le non-lu*** (débloqué par `A`) : système « texte déjà-lu →
  instantané » par empreinte de contenu (`settings/seenText.ts`), badge ✦ nouveau dans `VerseChoices`.
- **Puis** : **`B`** (arcs ramifiés + validation DFS + visualizer à la *Academical*) comme cycle dédié.
- **`C`** (lint global) : chantier séparé, fichier par fichier, hors boucle juice.

**Invariants à ne jamais lâcher** : réversible (1 commit/itér.), modulaire, **systèmes pas
features**, normes AAA (rendu pur, reduced-motion, skip), vérifié (`tsc`+test+build) avant
commit, **jamais ajouter de dette**, ton **évangéliste sans gore** (la grâce plutôt que la
punition — cf. itér. 7).
