# GDD — ÉLIAS : LE COMBAT D'UNE VIE

**Version :** 1.0 — **Date :** 2026-06-13  
**Plateforme :** PWA (Web, mobile-first)  
**Genre :** Life simulator / Bible memorization / Narrative  
**Public :** Chrétiens évangéliques francophones (18-45 ans, France + Afrique)

---

## 1. CONCEPT

### Pitch
Incarnez Élias, de la naissance à la mort. Chaque année apporte des épreuves que seul un verset biblique peut surmonter. Mémorisez les Écritures, gardez vos 4 jauges vitales au-dessus de zéro, et terminez votre course avec un titre qui bénira votre prochaine vie.

### Unique Selling Proposition
**Seul life simulator chrétien avec apprentissage biblique par SRS.**  
BitLife × Bible Trivia × système d'héritage roguelite.

### Tone
- Solennel mais pas austère
- Pédagogique mais pas moralisateur  
- Narratif immersif (2e personne, descriptions évocatrices)
- La difficulté fait partie du propos : la vie chrétienne est un combat

### Inspiration design
- **BitLife** — vie qui défile année par année, choix binaires
- **Slay the Spire** — système de récompense après chaque défi
- **Hades** — l'échec fait progresser (héritage, codex)
- **Persona 5** — relations avec rangs et bonus débloquables
- **Celeste** — accessibilité, assist mode, bienveillance dans la difficulté

---

## 2. PUBLIC CIBLE

### Primaire
- **Âge :** 18-45 ans
- **Profil :** Chrétien évangélique/charismatique pratiquant
- **Langue :** Français (France + Afrique subsaharienne francophone)
- **Plateforme :** Mobile (PWA), navigation one-handed portrait
- **Contexte :** Temps de méditation quotidien, trajets, veillées

### Secondaire
- Curieux de spiritualité
- Joueurs de BitLife cherchant une variante "avec du sens"
- Étudiants en théologie / groupes de jeunes d'église

### Ce que le joueur cherche
1. Apprendre la Parole en s'amusant
2. Ressentir une progression spirituelle
3. Avoir un défi rejouable
4. Partager son histoire avec sa communauté

### Ce que le jeu N'EST PAS
- Un jeu pour "tous" — le lexique EJP/ICC et les références bibliques présupposent un initié
- Un catéchisme — le jeu n'explique pas la Bible, il la fait mémoriser
- Un jeu casual sans effort — la mémorisation est le cœur du gameplay

---

## 3. CORE LOOP

```mermaid
graph TD
    A[Nouvelle Partie] --> B[Prologue 6-14 ans<br/>5 choix → profil personnalisé]
    B --> C[Année N<br/>Actions volontaires<br/>(prier/jeûner/servir/appeler/lire)]
    C --> D[+1 ÂGE<br/>Vieillissement / décroissance]
    D --> E{Épreuve ?<br/>55% chance}
    E -->|Oui| F[4 versets proposés]
    F --> G[Joueur choisit]
    G -->|Correct| H[+stats × Flow<br/>+combo<br/>Codex débloqué]
    G -->|Faux| I[-stats<br/>-Flow, reset combo<br/>Cascade possible]
    H --> J{Âge ≥ 100<br/>ou stat ≤ 0 ?}
    I --> J
    J -->|Non| C
    J -->|Oui| K[...]
    K --> L[Titre débloqué ?]
    L --> M[Héritage pour prochaine vie]
    M --> N[Partager / Nouvelle Partie]
    N --> A
```

### Boucle minute-par-minute
1. Lire le contexte narratif de l'année
2. Choisir 0-3 actions volontaires
3. Cliquer "+1 ÂGE" 
4. (si épreuve) Lire l'événement → 4 choix de versets → sélectionner
5. Voir le résultat (succès/échec) + feed-back VFX
6. Recommencer

---

## 4. SYSTÈMES DE JEU

### 4.1 STATS (4 jauges, 0-100)

| Stat | Rôle | Décroît quand | Monte quand |
|------|------|---------------|-------------|
| **Foi** | Connexion à Dieu, débloque les events de croissance | -1/2ans (20+) | Verset correct, prier, lire |
| **Paix** | Santé mentale, résistance au découragement | -1/2ans (25+), malus cascade | Verset correct, servir, appeler |
| **Physique** | Corps, endurance, survie au burnout | -1/an (40+), burnout Palier 2/3 | Verset correct, sport |
| **Finances** | Ressources matérielles, survie économique | -2/3/1/an selon âge (LOGEMENT) | Verset correct, servir |

**⚠ PROBLÈME :** Les 4 stats sont symétriques. Finances n'a pas de mécanique propre (pas d'achat, pas de dépenses choix).  
**→ SOLUTION :** Système d'argent avec achats (voir section 12)

### 4.2 FLOW (3 paliers)

| Palier | Valeur | Affichage | Timer | Multiplicateur | Burnout |
|--------|--------|-----------|-------|----------------|---------|
| 1 (Apprentissage) | 0-33 | Texte complet | **Aucun** | ×1.0 | 0 |
| 2 (Transition) | 34-66 | Référence seule | 30s | ×1.5 | -1 physique/an |
| 3 (Hardcore) | 67-100 | Référence seule | 15s | ×2.5 | -3 physique/an |

**✅ BON :** Le timer adaptatif (Palier 1 sans timer) est correct depuis le correctif gaming.

**⚠ PROBLÈME :** Le Flow monte vite (20 max par bonne réponse) mais descend de 2/an. Sur 100 ans, le joueur passe 80% du temps en Palier 1. Le Palier 3 est presque inaccessible.  
**→ SOLUTION :** Réduire le decay naturel à 1/an, ou ajouter des "bonus de Flow" via les actions.

### 4.3 COMBO

- Chaque bonne réponse → +1 combo
- Palier x5 → Foi +3, Paix +2
- Palier x10 → Toutes stats +3-5
- Palier x20 → Toutes stats +5-8
- Erreur → reset à 0

**✅ BON :** Barre de combo visuelle segmentée (rajoutée).

**⚠ PROBLÈME :** Entre 0 et 5, rien ne se passe. Le joueur ne "sent" pas la progression.  
**→ SOLUTION :** Ajouter un feedback visuel à chaque palier +2/+3/+4.

### 4.4 CASCADE

- Échec sur un événement avec `cascadeEventId` → événement dérivé programmé à +1 an
- Max 3 niveaux de profondeur
- Prérequis : les cascades profondes requièrent leur parent (corrigé)

**✅ BON :** Système fonctionnel et cohérent.

### 4.5 SRS (Spaced Repetition)

- Les versets les plus souvent ratés ont plus de chances de réapparaître
- Priorité dans la sélection des événements

**⚠ PROBLÈME :** Le SRS ne priorise QUE les versets avec `errorCount > 0`. Un verset jamais vu a la même priorité qu'un verset maîtrisé.  
**→ SOLUTION :** Ajouter un poids décroissant pour les versets non vus depuis longtemps (lastErrorAge).

### 4.6 CODEX

- 122 versets à collectionner
- Chaque utilisation réussie → débloqué + compteur timesUsed
- Chaque échec → errorCount + lastErrorAge

**✅ BON :** Filtres par catégorie, progression visible.

### 4.7 TITRES & HÉRITAGE (7 titres)

| Titre | Condition | Bonus |
|-------|-----------|-------|
| Le Prodige | 100 ans + 60% réussite | Foi +5, Paix +5 |
| La Star | >85% réussite, 15+ events | Foi +4, Paix +4, Fin +4 |
| L'Anakazo | Combo max ≥ 10 | Physique +3, Fin +3 |
| Le Fervent | Flow max ≥ 100 | Foi +8 |
| Le Combattant | 30+ events, 70% réussite | Physique +5, Foi +3 |
| Le Sage | 30+ versets débloqués | Paix +5, Foi +3 |
| Le Survivant | 20+ events sans mourir | Physique +8 |

**⚠ PROBLÈME :** Les conditions sont statiques. Pas de titres conditionnés par des arcs narratifs complétés, des saisons traversées, ou des relations.

### 4.8 SAISONS SPIRITUELLES (10 décennies)

| Âge | Saison | Effet |
|-----|--------|-------|
| 0-9 | Réveil | identite_appel ×2 |
| 10-19 | Désert | doute ×2, soif ×2 |
| 20-29 | Réveil | idem 0-9 |
| 30-39 | Persécution | combat ×2.5 |
| 40-49 | Désert | idem 10-19 |
| 50-59 | Abondance | finances ×2.5 |
| 60-69 | Grâce | saint_esprit ×2 |
| 70-79 | Désert | idem |
| 80-89 | Abondance | idem |
| 90-99 | Grâce | idem |

**⚠ PROBLÈME :** Les saisons n'ont QU'un effet de multiplicateur de catégorie. Pas de gameplay spécifique : pas d'événements de saison, pas de musique qui change, pas de visuel.  
**→ SOLUTION :** Événements uniques par saison + transition narrative + musique adaptée.

### 4.9 ACTIONS VOLONTAIRES

| Action | Effet de base | Fidélité ×3 | Fidélité ×5 |
|--------|---------------|-------------|-------------|
| Prier | Foi +4, Paix +1 | Foi +6, Paix +1 | Foi +8, Paix +2 |
| Jeûner | Foi +5, Physique -2 | Foi +7, Physique -2 | Foi +10, Physique -2 |
| Servir | Paix +4, Fin +1 | Paix +6, Fin +1 | Paix +8, Fin +2 |
| Appeler {ami} | Paix +3, Ami +8 | Paix +4, Ami +10 | Paix +6, Ami +12 |
| Lire | Foi +3, Paix +1 | Foi +4, Paix +1 | Foi +6, Paix +2 |

**⚠ PROBLÈME :** Aucune action n'a d'effet SUR LE MONDE. Elles ne font que monter des stats. Dans BitLife, "travailler" donne de l'argent qui sert à acheter des biens. Ici, prier 100 fois ou 0 fois, le jeu est le même.  
**→ SOLUTION :** Débloquer des bonus passifs par paliers d'actions cumulées (ex: 50 prières → "Homme de prière" → malus réduit de 10%).

### 4.10 AMI (callFriendCount)

| Paliers | Bonus débloqué |
|---------|----------------|
| 5 appels | Paix +1 bonus permanent |
| 10 appels | Paix +2 |
| 20 appels | Paix +3, amitié + delta |

**✅ BON :** Système ajouté (correctif gaming).  
**⚠ PROBLÈME :** Pas d'événements autour de l'ami AU-DELÀ des 4 events dédiés. Pas d'histoire qui suit l'ami sur toute la vie.

### 4.11 PRÉREQUIS (arbre de déblocage)

5 types de gates :
- `event_completed` — événement rencontré
- `event_succeeded` — événement réussi
- `event_failed` — événement échoué (arcs de rédemption)
- `verse_unlocked` — verset débloqué dans le codex
- `arc_completed` — arc terminé

**✅ BON :** Système flexible, bien intégré.  
**⚠ PROBLÈME :** Seulement 11 events l'utilisent. Le potentiel est sous-exploité.

---

## 5. PROGRESSION & DIFFICULTÉ

### Courbe actuelle

```
Difficulté
    ^
  3 |                  ████████████ (61+ ans)
  2 |        ████████████████████████ (16-60 ans)
  1 |  ██████ (0-15 ans)
    +---------------------------------> Âge
    0    15    30    45    60    75    100
```

### Problèmes de courbe

1. **Palier 1 (0-15) :** Trop facile. Avec le prologue, le joueur commence à 14 ans directement — mieux.
2. **Palier 2 (16-60) :** Bon équilibre. Sweet spot.
3. **Palier 3 (61+) :** Trop dur. Le joueur a survécu 60 ans, mérite une récompense, pas une punition renforcée.
4. **Âges 96-100 :** Presque aucun événement (1-2 disponibles). Le joueur clique dans le vide.

### Solution courbe idéale

```diff
- Senior : difficulté max, peu d'events
+ Senior : difficulté stabilisée, events de conclusion, récompenses de fin de vie
```

---

## 6. ÉCONOMIE & ÉQUILIBRAGE

### Gains moyens par action
- **Bonne réponse :** +5-8 stat cible × multiplicateur Flow
- **Action volontaire :** +3-5 stat cible
- **Micro-événement passif :** +1-3 aléatoire
- **Vieillissement :** -1 à -3 sur physique (40+), décroissance foi/paix (20+)

### Pertes moyennes
- **Mauvaise réponse :** -3 à -5 sur 2-3 stats
- **Cascade :** -4 à -6 (cumulable sur 3 ans)
- **Burnout Palier 3 :** -3 physique/an
- **Logement (nouveau) :** -2 à -3 finances/an

### Impact sur la durée de vie
- Un joueur moyen meurt vers **30-50 ans** (erreurs + vieillissement)
- Un bon joueur atteint **60-80 ans**
- Un excellent joueur (Codex 80%+) atteint **100 ans**

**⚠ PROBLÈME :** Le joueur moyen ne voit JAMAIS les âges 60+. Pas de contenu senior, pas de titres, pas de conclusion. Il abandonne avant la fin.

---

## 7. NARRATIF

### Personnage : Élias
- **Profil :** Façonné par les choix du prologue (courageux/sage/réservé...)
- **Âge :** 0-100 ans (gameplay actif dès 14 ans avec le prologue)
- **Contexte :** Naît à {ville}, parents {père} et {mère}, ami principal {ami}
- **Vocation :** {métier}, généré aléatoirement

### Style d'écriture
- Deuxième personne ("Tu réalises que...")
- Descriptif mais pas lyrique
- 2-4 phrases par événement
- Utilisation de templates {ami}, {ville}, {église} pour personnaliser
- Riche en détails concrets (pas de généralités spirituelles)

### Arcs narratifs (6 terminés, 5 non implémentés)

| Arc | Statut | Événements |
|-----|--------|------------|
| Le pardon de Louise | ✅ | 3 |
| Le disciple Mathias | ✅ | 4 |
| L'héritage du père | ✅ | 3 |
| La tentation du pouvoir | ✅ | 5 |
| Le chemin de guérison | ✅ | 3 |
| Une amitié pour la vie | ❌ | 8 (events dans le JSON mais pas dans storyArcs.json ?) |
| Le chemin du métier | ❌ | 5 |
| L'héritage des parents | ❌ | 6 |
| La maison de Dieu | ❌ | 4 |
| Enfant de {ville} | ❌ | 3 |
| L'alliance de {conjoint} | ❌ | 6 |

**⚠ PROBLÈME :** 5 arcs (ami, métier, parents, église, ville, conjoint) sont définis dans `src/data/storyArcs.ts` mais n'ont **PAS D'ÉVÉNEMENTS** dans `game/data/events.json`. Les eventIds référencés (arc-ami-1, arc-metier-1...) n'existent pas.

**⚠ PROBLÈME CONNEXE :** `game/data/storyArcs.json` a été créé par notre script d'extraction depuis `src/data/storyArcs.ts`. Il contient les 11 arcs. Mais seuls 6 ont des événements réels.

---

## 8. UI/UX

### Écrans principaux

1. **Onboarding** — 4 écrans de tutoriel + 1 exercice interactif
2. **Prologue** — 5 choix de 6 à 14 ans (NOUVEAU)
3. **Jeu principal** — StatBar + FlowBar + Journal + Event + Actions
4. **Menu burger** — DailyVerse, Codex, Lexique, Accessibilité, Nouvelle Partie
5. **Codex** — Liste des versets avec filtres
6. **Lexique** — Glossaire EJP/ICC
7. **Game Over** — Stats, Titre, Citation, Partager, Nouvelle Partie

### Flux de navigation

```
Onboarding → Prologue → Jeu ←→ Menu burger
                            ↓
                         Game Over
                            ↓
                      Nouvelle Partie
                      (avec ou sans prologue)
```

### État de l'accessibilité
- ✅ Police dyslexique (toggle)
- ✅ Sons réduits (toggle)
- ✅ Timer long ×2 (toggle)
- ✅ Haptic feedback (vibrate API)
- ❌ Mode daltonien
- ❌ Taille de police adjustable

---

## 9. CONTENU — MATRICE COMPLÈTE

### Versets : 122 uniques, 23 catégories

| Catégorie | Nb versets | Nb events | Ratio | Statut |
|-----------|-----------|-----------|-------|--------|
| peur_angoisse | 10 | 15 | 1.5 | ✅ |
| impudicite_addiction | 10 | 6 | 0.6 | ✅ |
| finances_paresse | 10 | 11 | 1.1 | ✅ |
| amertume_rejet | 10 | 21 | 2.1 | ✅ |
| combat_spirituel | 8 | 11 | 1.4 | ✅ |
| identite_appel | 8 | 16 | 2.0 | ✅ |
| doute_incredulite | 6 | 11 | 1.8 | ✅ |
| orgueil_independance | 6 | 10 | 1.7 | ✅ |
| saint_esprit | 4 | 2 | 0.5 | ✅ |
| parole_de_dieu | 4 | 2 | 0.5 | ✅ |
| amour_de_dieu | 6 | 4 | 0.7 | ✅ |
| direction_divine | 5 | 2 | 0.4 | ✅ |
| priere | 3 | 2 | 0.7 | ✅ |
| soif_de_dieu | 3 | 2 | 0.7 | ✅ |
| obeissance | 3 | 2 | 0.7 | ✅ |
| culpabilite | 3 | 2 | 0.7 | ✅ |
| sterilite | 5 | 1 | 0.2 | ⚠ (1 event seulement) |
| abondance_financiere | 3 | 2 | 0.7 | ✅ |
| maladie_guerison | 3 | 2 | 0.7 | ✅ |
| echec_reussite | 3 | 2 | 0.7 | ✅ |
| tristesse_joie | 3 | 2 | 0.7 | ✅ |
| decouragement | 3 | 2 | 0.7 | ✅ |
| lourdeur_fatigue | 3 | 2 | 0.7 | ✅ |

**Total : 122 versets, 122 événements (~1:1 ratio)**

---

## 10. AUDIO

### Pistes existantes (7 + 1 thème)

| Piste | Usage | Durée |
|-------|-------|-------|
| theme.mp3 | Lancement (one-shot) | ~2min |
| soundtrack-1 à 6 | Rotation ambiante | 2-8min chacune |
| soundtrack-explore-the-fire | Rotation ambiante | ~5min |
| Sons UI (6 fichiers .ogg) | Clics, succès, échec | <1s chacun |

### Problèmes audio
- Les soundtracks sont génériques — pas liées aux saisons spirituelles
- Pas de musique "triste" pour les échecs ni "triomphante" pour les victoires
- Pas de transition entre les pistes (juste un fondu enchaîné)

---

## 11. PROBLÈMES IDENTIFIÉS — CE QU'ON A RATÉ

### 11.1 OUBLIS CRITIQUES (restants après correctifs)

| # | Problème | Gravité | Solution |
|---|----------|---------|----------|
| C1 | 5 arcs narratifs SANS événements (ami, métier, parents, église, ville, conjoint) | 🔴 | Créer les ~30 events manquants |
| C2 | Âges 96-100 : quasiment aucun événement | 🔴 | Ajouter 5+ events fin de vie |
| C3 | Sterilite : 5 versets pour 1 seul événement | 🟠 | Ajouter 1-2 events |
| C4 | Le joueur moyen ne voit jamais 60+ ans (meurt avant) | 🟠 | Revoir courbe difficulté senior |
| C5 | Pas de mode "entraînement" sans conséquence | 🟠 | Mode découverte (sans perte de stats) |

### 11.2 INCOHÉRENCES

| # | Problème | Détail |
|---|----------|--------|
| I1 | `game/data/storyArcs.json` contient 11 arcs mais seuls 6 ont des events | Les eventIds des 5 arcs manquants ne pointent nulle part |
| I2 | Le titre "Le Survivant" nécessite 20+ events sans mourir MAIS la condition utilise `causeOfDeath === null` | Si le joueur meurt à 99 ans de vieillesse (victoire), `causeOfDeath` est null → il obtient le titre "Survivant" même en mourant |
| I3 | Le "Prologue" skip à 14 ans mais la génération d'événements commence à 5 ans | Aucun événement entre 5 et 14 ans si on skip le prologue. Le joueur fait +1 ÂGE 10 fois sans rien. |
| I4 | `createInitialCodex()` crée le codex avec TOUS les versets du JSON | Mais si un verset est ajouté au JSON après la création du codex, il n'apparaît pas — le codex n'est pas dynamique |
| I5 | Le dossier `ui/` à la racine du projet est VIDE (c'est un vestige du plan de migration) | Supprimer ou documenter |

### 11.3 FEATURES MAL INTÉGRÉES

| # | Feature | Problème |
|---|---------|----------|
| F1 | **IA narrative** (`src/services/aiNarrator.ts`) | Appelle OpenRouter pour générer du texte. Mais : pas de fallback, pas de cache, pas de clé API par défaut. Si l'utilisateur n'a pas configuré .env, les promesses reject silencieusement. Le joueur ne voit jamais la différence. |
| F2 | **DevPanel** (`src/components/DevPanel.tsx`) | Présent dans le build de production. Toggle visible ? Il faudrait le masquer en production. |
| F3 | **microEvents.json** inexistant | `game/data/loader.ts` charge `microEvents.json` qui n'existe pas. Les micro-événements sont chargés via `src/data/microEvents.ts` directement par l'engine, pas par le loader. |
| F4 | **DebugView** | Toujours visible en production (toggle dans le coin). Utile en dev, gênant en prod. |

### 11.4 OPPORTUNITÉS MANQUÉES

| # | Opportunité | Impact |
|---|-------------|--------|
| O1 | **Défis quotidiens** : "Trouve le verset qui correspond à cette situation" | Rétention ×5 |
| O2 | **Mode multijoueur** : comparer ses stats avec des amis | Viralité |
| O3 | **Créateur d'arcs** : l'utilisateur crée ses propres événements dans le jeu | UGC, durée de vie infinie |
| O4 | **Badges saisonniers** : "Survivre à la saison du Désert" débloque un badge | Engagement court-terme |
| O5 | **Notification push** : "Reviens, Élias a besoin de toi" | Rétention |
| O6 | **Wrap APK** (PWA → Android) | Distribution ×10 |
| O7 | **Version iOS** (PWA Safari) : tester et optimiser | Distribution |

---

## 12. ÉVOLUTIVITÉ — CE QU'IL FAUT POUVOIR FAIRE

### Facilité actuelle (✅)
- ✅ Ajouter un verset : `game/data/verses.json` + `npm run validate`
- ✅ Ajouter un événement : `npm run add-event`
- ✅ Ajouter un arc narratif : `npm run add-arc`
- ✅ Modifier l'équilibrage : `game/config/balance.json`
- ✅ Modifier l'audio : ajouter MP3 dans `public/audio/` + éditer `juice.ts`

### Facilité à créer (🚧)
- 🚧 **Ajouter une langue :** Les textes sont dans les JSON (traduisibles) MAIS les textes UI sont en dur dans les composants React. Besoin d'un système i18n.
- 🚧 **Ajouter un nouveau type d'action :** Modifier `gameEngine.ts` + `ActionPanel.tsx`. Pas documenté.
- 🚧 **Ajouter une nouvelle stat :** Câblé dans tout le code (types, engine, UI, sauvegarde). Refactor majeur.
- 🚧 **Modifier le core loop :** L'engine est en `gameEngine.ts` (1230 lignes). Pas découpé en modules.

### Prochaine grande étape technique
Découper `gameEngine.ts` en modules spécialisés :

```bash
src/engine/
├── flow.ts          # Système de Flow (gain, pénalité, paliers)
├── combat.ts        # Validation des choix, stats, combo
├── aging.ts         # Vieillissement, décroissance, milestones
├── actions.ts       # Actions volontaires (prier, jeûner...)
├── cascade.ts       # Système de cascade
├── codex.ts         # Codex, SRS
├── titles.ts        # Titres et héritage
├── seasons.ts       # Saisons spirituelles
├── prerequisites.ts # Arbre de prérequis
├── narrative.ts     # Variantes narratives, templates
└── gameEngine.ts    # Orchestrateur (appelle les modules)
```

---

## 13. ROADMAP

### Faits (30+ interventions, 12 PRs)
```
[██████████████████████████████████████████████] 100%
```

### Court terme — FAIT (PR #12)
- [x] Créer les ~30 events des 5 arcs narratifs manquants → **76 events créés** (6 arcs)
- [x] Ajouter 5+ events pour les âges 90-100 → **5 events senior**
- [x] Ajouter 1-2 events pour sterilite → **1 event** (total: 2)
- [x] Masquer DevPanel + DebugView en production → `import.meta.env.DEV`

### Prochaine session — ce qui rapporte le plus (3-4h)
1. **Wrap APK Android** (10 min) `npx @pwabuilder/cli` → jeu publiable sur stores
2. **Ajuster courbe difficulté senior** (1h) — baisser la difficulté 61+ pour que le joueur voie la fin
3. **Découper gameEngine.ts** (2h) — 1325 lignes → 10 modules spécialisés
4. **Mode découverte** (2h) — entraînement sans perte de stats pour apprendre les versets

### Session suivante (1 semaine)
- [ ] Système de badges saisonniers (récompenses visibles pour chaque saison traversée)
- [ ] Défis quotidiens (verset du jour avec défi associé)
- [ ] i18n : structure pour traduction anglaise
- [ ] Notifications push (rappel quotidien)

### Plus tard (1 mois+)
- [ ] Créateur d'arcs in-game
- [ ] Mode multijoueur (comparaison de stats entre joueurs)
- [ ] Nouveaux types d'actions (voyager, étudier, fonder une famille)

---

## ANNEXE : GLOSSAIRE

| Terme | Définition |
|-------|------------|
| **Flow** | Jauge de concentration qui monte avec les bonnes réponses rapides |
| **Combo** | Séquence de bonnes réponses consécutives |
| **Cascade** | Chaîne d'événements déclenchée par un échec |
| **SRS** | Spaced Repetition System — les versets difficiles reviennent plus souvent |
| **Codex** | Collection des versets débloqués |
| **Palier** | Niveau de Flow avec ses propres règles |
| **Burnout** | Perte de physique liée au Flow élevé |
| **Grâce** | Sauvegarde quand une stat touche zéro |
| **Héritage** | Bonus transmis à la prochaine partie |
| **Arc** | Suite d'événements qui racontent une histoire continue |
| **Prérequis** | Condition à remplir pour qu'un événement apparaisse |
