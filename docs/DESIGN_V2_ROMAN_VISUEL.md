# ÉLIAS — DESIGN DOCUMENT V2 : ROMAN VISUEL INTERACTIF BIBLIQUE
**Version :** 2.0 — **Date :** 2026-06-22
**Statut :** Document de référence actif — remplace la vision produit du GDD v1.0 sur le positionnement genre.

> **Objectif :** repositionner Élias sur le genre "roman visuel interactif" (7 Jours! /
> histoires interactives), en faire un outil d'apprentissage biblique profond grâce aux
> principes neuro-psychologiques de mémorisation. Aucun refactor du moteur —
> recadrage de la couche narrative et UX. L'architecture existante est déjà celle d'un
> roman visuel — elle ne se présente pas encore comme telle.

---

## PARTIE 1 — POSITIONNEMENT GENRE

### 1.1 Le genre cible : 7 Jours! / Roman visuel à choix

**7 Jours!** (Buff Studio) est un roman visuel à choix multiples structuré en chapitres.
C'est le genre le plus proche d'Élias — et le plus efficace pour ancrer des apprentissages.

| Système | Mécanisme | Effet de rétention |
|---|---|---|
| **Chapitres cliffhangers** | Chaque épisode finit sur une tension non résolue | FOMO → le joueur revient |
| **Personnages attachants** | Noms, personnalités distinctes, évolution visible | Empathie → engagement émotionnel |
| **Choix à conséquences immédiates** | Le dialogue change MAINTENANT selon le choix | Agentivité → sentiment de contrôle |
| **Timer / urgence** | Certains choix ont un compteur | Pression → décision émotionnelle |
| **Révélations progressives** | Le mystère se dévoile couche par couche | Curiosité = dopamine |

**Ce qu'Élias a déjà :** fil polyphonique (Ciel/Adversaire/Entourage/Conscience), arcs narratifs,
cliffhangers de décennie (`lifeChapters.ts`), chapitres, bulles de dialogue, timer de flow.

**Écart principal :** Élias se présente comme un *quiz spirituel* alors que son moteur est déjà
celui d'un *roman visuel interactif*. La différence est de **présentation**, pas d'architecture.

### 1.2 Histoires interactives (Episode, Choices) — ce qui s'adapte

- Identité visible du personnage → avatars expressifs via `avatarExpression.ts` (itér.51, présent)
- Relations nommées avec progression → {ami}, {conjoint}, {père}, {mère} existent, pas encore des *personnages*
- Choix moraux fréquents → `moralChoices` existe (3 events), doit être 15-20% des events
- Résultats visibles immédiats → les flags posent des conséquences — les rendre VISIBLES dans le dialogue

---

## PARTIE 2 — PRINCIPES NEUROERGONOMIQUES DE MÉMORISATION BIBLIQUE

> Ce qui distingue Élias de toute autre app biblique : **les versets sont appris en contexte**,
> liés à une situation émotionnelle vécue. C'est exactement ce que la neuroscience recommande
> pour le transfert à long terme (utiliser le verset en vie réelle).

### 2.1 Les 8 principes — état d'Élias et adaptation

**① Encodage Émotionnel** (amygdale + hippocampe)
> Souvenirs formés pendant une émotion forte : consolidés avec 3-5× plus d'efficacité.

- **Principe :** la situation narrative DOIT créer de l'émotion AVANT que le verset soit proposé.
  Le verset est la RÉPONSE à l'émotion, pas un quiz abstrait.
- **Action :** réécrire les events pour créer une tension narrative réelle dans les 2 premières
  phrases, AVANT d'introduire le choix. L'event doit faire ressentir quelque chose.
- **Exemple à éviter :** "Tu dois choisir comment réagir à cette situation difficile."
- **Exemple cible :** "Ton téléphone sonne à 2h du matin. C'est l'hôpital. La voix à l'autre bout est calme — trop calme."

---

**② Rappel Actif** (testing effect — Roediger & Karpicke, 2006)
> Se tester sur une information est 2-3× plus efficace que la relire.

- **Principe :** chaque choix de verset EST un rappel actif. Le word bank force la GÉNÉRATION
  (encore plus efficace que la reconnaissance à 4 options).
- **Action :** augmenter la proportion de word bank pour les versets déjà vus au moins une fois.
  Implémenter la progression dynamique du `questionType` selon l'historique du joueur.

---

**③ Répétition Espacée** (Ebbinghaus — déjà implémenté)
> Les révisions à intervalles croissants ancrent la mémoire à long terme.

- **Statut :** SRS câblé (`getSrsPriorityVerses()` à `gameEngine.ts:388`, `errorCount`, `lastErrorAge`).
- **Amélioration :** ajouter un poids décroissant pour les versets JAMAIS vus — actuellement le SRS
  ne priorise que les versets ratés, les versets non rencontrés ont le même poids que les maîtrisés.

---

**④ Encodage Contextuel** (contextual binding theory)
> La mémoire est associative : le contexte d'apprentissage devient un "cue" de rappel en vie réelle.

- **Principe :** un joueur qui apprend Jean 14.27 dans un event "nuit d'angoisse avant une opération"
  retrouvera ce verset EN VIE RÉELLE dans une nuit similaire. Le contexte narratif EST la clé mnémotechnique.
- **Action :** les situations des events doivent être ultra-spécifiques et reconnaissables.
  Éviter les généralisations ("tu traverses une épreuve") ; préférer le concret ("tu es assis dans
  la salle d'attente des urgences depuis 4 heures").
- **Système existant :** les échos décennaux (events à 50+ ans qui citent un choix de 20 ans) exploitent
  exactement ce principe — le contexte passé ressurgit pour ancrer le présent.

---

**⑤ Effet de Génération** (Slamecka & Graf, 1978)
> Les informations qu'on produit soi-même sont mieux retenues que celles qu'on reçoit.

- **Principe :** word bank (génère le mot) > choice (reconnaît le verset) > lecture passive.
- **Action :** créer un 3ème type de question `'completion'` — le début du verset est affiché,
  le joueur choisit la bonne fin parmi 4 options. Encore plus générateur que le word bank.
  ```
  "Venez à moi, vous tous qui êtes fatigués et chargés, ___"
  → [et je vous donnerai du repos] · [et je vous bénirai] · ...
  ```

---

**⑥ Entrelacement** (interleaving — Kornell & Bjork, 2008)
> Mélanger les types d'exercices est plus efficace que les bloquer, même si ça semble plus dur.

- **Action :** résoudre le `questionType` dynamiquement selon l'historique avec CE verset :
  ```
  jamais vu     → 'choice'      (4 versets entiers, texte complet affiché)
  vu 1 fois     → 'wordBank'    (mot-clé masqué à retrouver)
  vu 3 fois     → 'completion'  (fin du verset à retrouver)
  vu 5+ fois    → 'reference'   (donner la référence du texte affiché)
  ```
  Le champ `questionType` du JSON devient un *défaut* que le moteur peut surcharger.

---

**⑦ Auto-référence** (self-reference effect — Rogers et al., 1977)
> Les informations liées à SOI-MÊME sont retenues 2× mieux que les informations générales.

- **Principe :** le joueur EST Élias. {nom}, {ville}, {ami}, {conjoint} personnalisent l'expérience.
- **Action :** les events doivent utiliser les slots de personnalisation ({ami}, {ville}, {église})
  aussi souvent que possible. Une situation qui pourrait arriver AU JOUEUR LUI-MÊME est retenue
  mieux qu'une situation générique.

---

**⑧ Supériorité narrative** (story superiority effect — Bruner, 1990)
> Les informations intégrées dans une histoire sont retenues 22× mieux que les listes de faits.

- **Principe :** chaque verset est appris DANS UNE HISTOIRE (l'event). La qualité narrative
  des events n'est pas esthétique — elle est directement pédagogique.
- **Conséquence :** rédiger les events comme des micro-nouvelles, pas comme des scénarios de quiz.
  Chaque event doit avoir : un personnage, une tension, un contexte sensoriel, une décision.

---

### 2.2 KPI cognitifs cibles (mesurables après 30 parties)

| Niveau | Objectif | Comment le vérifier |
|---|---|---|
| **Reconnaissance** | 40+ versets identifiables à leur référence | `codex.timesUsed >= 1` pour 40+ entrées |
| **Rappel partiel** | 20+ versets complétables depuis leur début | Taux de réussite en mode 'completion' |
| **Transfert** | Le joueur cite spontanément un verset dans une situation réelle | Qualitatif — feedback utilisateur |

Le transfert (niveau 3) est le vrai KPI. C'est ce qui différencie Élias d'une app de flashcards.

---

## PARTIE 3 — SYSTÈMES EXISTANTS SOUS-EXPLOITÉS

| Système | Fichier | Potentiel inexploité |
|---|---|---|
| Fil polyphonique (4 voix) | `src/engine/messageSender.ts` | Déjà des bulles — doit être vécu comme un roman visuel avec de la tension |
| Personnages nommés | `lifeContext` dans `GameState` | {ami}/{conjoint}/{père}/{mère} = des slots, pas des personnages avec une trajectoire |
| Arcs narratifs | `src/data/storyArcs.ts` | Devraient être vécus comme des CHAPITRES avec intro/outro dédiés |
| moralChoices | `AfflictionEvent.moralChoices` | 3 events — devrait être ~15-20% des events (≈60 events) |
| Cliffhangers de décennie | `src/engine/lifeChapters.ts` | Existe, peu mis en valeur visuellement (juste du texte dans le journal) |
| Flags de conséquence | `GameState.flags` | 11 events utilisent `prerequisites` — potentiel ×10 avec échos décennaux |
| SRS (`errorCount`) | `gameEngine.ts:388` | Ne priorise que les ratés — pas les jamais vus |
| questionType | `AfflictionEvent.questionType` | Statique — devrait évoluer selon l'historique du joueur (voir principe ⑥) |

---

## PARTIE 4 — NOUVEAUX SYSTÈMES À IMPLÉMENTER

### A — Progression de difficulté par verset (principe ⑥)

**Module :** `src/engine/verseProgression.ts` (pur, testable)
```ts
export function resolveQuestionType(
  verseId: string,
  codex: Record<string, CodexEntry>,
  eventDefault?: 'choice' | 'wordBank' | 'completion' | 'reference'
): 'choice' | 'wordBank' | 'completion' | 'reference' {
  const entry = codex[verseId];
  if (!entry || entry.timesUsed === 0) return 'choice';
  if (entry.timesUsed === 1) return eventDefault === 'wordBank' ? 'wordBank' : 'choice';
  if (entry.timesUsed < 5) return 'completion';
  return 'reference';
}
```
**Branchement :** dans `gameEngine.ts`, avant de poser `currentEvent` dans le state, surcharger
`questionType` via `resolveQuestionType(event.correctVerseId, state.codex, event.questionType)`.

**Types à ajouter** dans `src/types/game.ts` :
```ts
// Étendre AfflictionEvent.questionType :
questionType?: 'choice' | 'wordBank' | 'completion' | 'reference';
```

---

### B — Type 'completion' (principe ⑤)

**Module :** `src/engine/verseCompletion.ts` (pur)
```ts
export interface CompletionChallenge {
  prefix: string;       // début du verset (jusqu'à la virgule ou 60% du texte)
  options: string[];    // [correct, ...3 leurres], mélangés
  correctOption: string;
}
export function buildCompletionChallenge(
  verseText: string,
  decoyEndings: string[],
  seed: number,
): CompletionChallenge
```
Les leurres de fin peuvent être générés à partir des fins d'autres versets de la même catégorie.

**UI :** nouveau bloc dans `src/components/VerseChoices.tsx` quand `questionType === 'completion'` —
affiche `prefix + "___"` et 4 chips de complétion. Même pattern que wordBank.

---

### C — Échos décennaux (principe ④ — 0 code, que du contenu)

Events à 50-75 ans qui citent NOMMÉMENT un choix fait à 20-35 ans, via `prerequisites` existants.

**Pattern JSON :**
```json
{
  "id": "e-echo-[arc]-[N]ans",
  "title": "[Titre évocateur du passé revisité]",
  "description": "Trente ans ont passé. [Nom du personnage de l'arc] t'appelle. Il/elle te dit que ce soir-là — quand tu as choisi [résultat de l'arc] — ça a tout changé pour lui/elle.",
  "prerequisites": [{ "kind": "event_succeeded", "eventId": "[dernier event de l'arc]" }],
  "ageRange": [52, 78],
  "category": "[même catégorie que l'arc]",
  "correctVerseId": "[verset de l'arc ou verset de gratitude/mémoire]"
}
```

**Échos prioritaires à créer (20 events) :**
- Arc-louise (pardon) → écho à 55-70 (Louise transformée, 30 ans après)
- Arc-ami (amitié) → écho à 60-75 ({ami} face à sa propre épreuve, vient chercher du soutien)
- Arc-metier (vocation) → écho à 55-70 (un ancien collègue revient témoigner)
- Arc-parents (héritage) → écho à 65-80 (découverte d'un héritage spirituel inattendu)
- Dilemmes moraux (3 events) → écho à 10-20 ans après (le flag posé revient dans une nouvelle situation)

---

### D — Témoignage de fin de vie partageable

**Composant :** `src/components/TestimonyCard.tsx`

Structure du témoignage (procédural, depuis `RunMetrics` + `journal` + `calling`) :
```
🙏 [playerName], [calling.name] — [âge] ans
"[phrase d'ouverture selon calling.tagline + spiritualSeason finale]"

◆ L'épreuve fondatrice : [journal entry la plus impactante — delta stat max]
◆ Le tournant de vie : [premier arc complété]
◆ La dernière victoire : [dernier event réussi dans le journal]

[N] versets mémorisés · Combo max : [maxCombo] · Titre : [currentTitle.name]
Graine [seed] — "Rejoue cette vie"
[citation biblique liée au calling]
```

**Déclenchement :** dans `App.tsx`, au `phase === 'gameOver'`, afficher `TestimonyCard` AVANT
l'écran game-over existant. CTA : "Partager mon témoignage" (Canvas → image) + "Continuer".

**Ce qui existe déjà :** `RunMetrics`, `journal`, `currentTitle`, `seed`, `calling`, `ShareCard.tsx`
(pattern Canvas à réutiliser).

---

### E — ChapterCard intro de décennie (roman visuel)

**Composant :** `src/components/ChapterCard.tsx`

Écran plein écran déclenché par `isDecadeStart(age)` (déjà dans `lifeChapters.ts`) :
```
╔═══════════════════════════════╗
║   CHAPITRE 3 — LA TRAVERSÉE  ║
║   Saison : Désert · 30-39 ans ║
║                                ║
║ "Dans ce chapitre, une        ║
║  rencontre va marquer ta foi   ║
║  pour les trente ans à venir." ║
║                                ║
║         [Continuer →]          ║
╚═══════════════════════════════╝
```
- Bloque 2 secondes (ou tap immédiat pour passer) → `prefers-reduced-motion` respecté
- Le texte de promesse vient de `getChapterIntro(age, season)` (déjà dans `lifeChapters.ts`)
- Différent du journal : c'est un ÉCRAN, pas une entrée

---

### F — Challenge du jour

**Module :** `src/engine/dailyChallenge.ts` (pur)
```ts
import { mulberry32 } from './rng';
import type { AfflictionEvent } from '../types/game';

export function getDailyChallengeEventId(events: AfflictionEvent[]): string {
  const day = Math.floor(Date.now() / 86_400_000); // stable sur 24h
  const rng = mulberry32(day);
  return events[Math.floor(rng() * events.length)].id;
}

export function getDailyChallengeLabel(): string {
  return new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' });
}
```

**UI :** bouton "Épreuve du [date]" sur l'écran d'accueil/prologue.
**Mode :** stats fictives (ne modifie pas la partie en cours), résultat partageable en texte :
`"J'ai répondu à l'épreuve du [date] avec [verset] ✓ — Élias, le jeu"`

---

## PARTIE 5 — PLAN D'IMPLÉMENTATION (ordre prioritaire)

| # | Système | Type | Effort | Impact |
|---|---|---|---|---|
| 1 | **Échos décennaux** (20 events) | Contenu pur | 0 code / 2h rédaction | Très élevé |
| 2 | **Réécriture tension narrative** (20 events) | Éditorial | 0 code / 2h rédaction | Très élevé |
| 3 | **Progression questionType dynamique** | Code (module pur + moteur) | 1h code + tests | Élevé |
| 4 | **Type 'completion'** | Code (module + UI) | 2h | Élevé |
| 5 | **Témoignage de fin de vie** | Code (composant) | 2h | Élevé (viralité) |
| 6 | **ChapterCard** intro/outro décennie | Code (composant léger) | 1h | Moyen |
| 7 | **Challenge du jour** | Code (module pur + UI) | 1h | Moyen (rétention) |

---

## PARTIE 6 — INVARIANTS (ne pas toucher)

- Architecture moteur (`gameEngine.ts`) — on ajoute, on ne réécrit pas
- Format JSON (`events.json`, `verses.json`) — on étend, on ne migre pas
- Porte QA (`bash tools/qa-gate.sh`) — verte avant chaque commit
- Ton évangéliste — la difficulté croissante par verset n'est jamais humiliante ni punitive
- PWA offline-first — tout nouveau système fonctionne sans réseau
- Dette = 0 — `react-hooks/* = 0`, baseline typescript = 0

---

## VÉRIFICATION PAR SYSTÈME

| Système | Test | Commande |
|---|---|---|
| Progression questionType | Déterminisme + edge cases (≥12 cas) | `npx vitest run tests/verseProgression.test.ts` |
| Type completion | Split texte, leurres, ordre seedé | `npx vitest run tests/verseCompletion.test.ts` |
| Échos décennaux | prerequisites pointent vers des IDs existants | `npm run validate` |
| Témoignage | Apparaît à game over, contenu non vide | `run-elias` (smoke.mjs) |
| Challenge du jour | Même date → même eventId | `npx vitest run tests/dailyChallenge.test.ts` |
| Intégration globale | Zéro régression | `bash tools/qa-gate.sh` |

---

*Source de vérité du processus : `docs/ITERATION_LOG.md`. File d'exécution : `docs/ROADMAP.md`.*
