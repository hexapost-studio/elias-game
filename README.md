# Élias — Le Combat d'une Vie

> Simulateur de vie biblique pour la communauté EJP/ICC.  
> Jouer en ligne → **[elias-game-seven.vercel.app](https://elias-game-seven.vercel.app)**

---

## C'est quoi ?

Élias est un jeu de simulation de vie inspiré de BitLife, conçu pour la communauté EJP/ICC (Église de Jésus-Christ, Prodige). Le personnage traverse une vie complète — de la naissance à 100 ans — en affrontant des épreuves réelles : disputes familiales, maladies, déménagements, crises d'église, pertes d'emploi.

Chaque épreuve demande de mémoriser et reconnaître un verset biblique. Répondre juste préserve les stats. Échouer entraîne des conséquences en cascade.

---

## Comment jouer

### La boucle de jeu

1. **Cliquer `+ ÂGE`** — Élias vieillit d'un an, un événement apparaît (ou pas)
2. **Lire l'épreuve** — une situation de vie concrète liée à un verset
3. **Choisir le bon verset** parmi 4 propositions
4. **Succès** → stats préservées, Flow augmente, verset ajouté au Codex
5. **Échec** → stats pénalisées, verset à réviser, possible cascade d'événements
6. **Mourir à 100 ans** (ou avant si les stats tombent à 0) → score, titre, héritage

### Les 4 stats

| Stat | Ce qu'elle représente | Tombe si… |
|---|---|---|
| **Foi** | Relation avec Dieu | Doutes, découragement, échecs répétés |
| **Paix** | État intérieur | Rejets, disputes, amertume |
| **Corps** | Santé physique | Maladies, fatigue, négligence |
| **Finances** | Stabilité matérielle | Chômage, crises, mauvaises décisions |

### Le Flow

Barre spéciale qui monte avec les combos de bonnes réponses. Trois paliers :

| Palier | Multiplicateur | Effet |
|---|---|---|
| **REPOS** | ×1 | Normal |
| **FERVEUR** | ×1.5 | Bonus versets augmentés |
| **FEU DE DIEU** | ×2.5 | Bonus max — Corps -3 par succès |

### Actions volontaires (2 pts/an · 3 pts après 60 ans)

Chaque année, Élias peut accomplir 2 actions spirituelles indépendamment des événements :

| Action | Effet |
|---|---|
| 🙏 Prier | Foi +4, Paix +1 |
| ✦ Jeûner | Foi +5, Corps -2 |
| 🤝 Servir | Paix +4, Finances +1 |
| 📞 Appeler {ami} | Paix +3, Amitié +8 |
| 📖 Lire la Parole | Foi +3, Paix +1 |

### Grâces divines

Élias commence chaque partie avec **2 grâces**. Si une stat tombe à 0 suite à un événement, la grâce se consume et la stat remonte à 3 (mort évitée). À 0 grâce : mort immédiate si une stat tombe à zéro.

### Déclin naturel

À partir de l'âge adulte, deux stats diminuent passivement (plancher : 1, ne cause jamais de mort seul) :
- Foi : -1 tous les 2 ans à partir de 20 ans
- Paix : -1 tous les 2 ans à partir de 25 ans

### Difficultés progressives

| Niveau | Mode |
|---|---|
| Niveau 1 | Texte du verset visible |
| Niveau 2 | Référence seule (Psaume 23:4) |
| Niveau 3 | Frappe libre du début du verset |

---

## Les événements

### Structure par stade de vie

Le même événement a une dimension différente selon l'âge d'Élias :

| Événement | Enfant (0-11) | Ado (12-17) | Adulte (18-59) | Senior (60+) |
|---|---|---|---|---|
| **Parents se disputent** | Caché sous l'oreiller | Médiateur impuissant | Tiraillé entre eux | Blessures héritées de génération |
| **Perte d'emploi** | Angoisse vague, incomprise | Honte au lycée | TOI qui perds ton emploi | Retraite forcée avant l'heure |
| **Déménagement** | Personne ne t'a demandé ton avis | Perd ses amis, son premier amour | Ta décision, ta famille la subit | Quitter la maison de 30 ans |
| **Inondation** | Regarde ses jouets couler | Mobilisé pour aider | Tout reconstruire de zéro | Sait déjà que rien ne dure |

---

## Arcs narratifs

Séquences d'événements personnalisés qui suivent Élias sur plusieurs décennies. Chaque arc est lié au contexte de vie unique du personnage (prénom de l'ami, ville, métier, église, conjoint·e).

| Arc | Événements | Âges | Contexte |
|---|---|---|---|
| 🤝 Arc-ami | 8 | 8–90 | `{ami}` (amitié, relation long terme) |
| ⚒️ Arc-métier | 5 | 16–65 | `{métier}` (orientation, crise, héritage pro) |
| 🏠 Arc-parents | 6 | 10–75 | `{père}` / `{mère}` (conflit, maladie, deuil) |
| ⛪ Arc-église | 4 | 18–65 | `{église}` (service, leadership, crise interne) |
| 🏙️ Arc-ville | 3 | 8–45 | `{ville}` (départ, diaspora, retour aux racines) |
| 💍 Arc-conjoint | 6 | 22–90 | `{conjoint}` (rencontre, mariage, crise, deuil) |

Complèter un arc débloque un titre + verset de récompense.

### Le contexte de vie (`lifeContext`)

À la naissance, le moteur génère un profil unique pour Élias :

```typescript
{
  friendName:  'Barnabas',     // ami fidèle
  city:        'Kinshasa',     // ville d'origine
  profession:  'enseignant',   // métier
  churchName:  'Église Bethel',
  spouseName:  'Angèle',       // futur·e conjoint·e
}
```

Ces valeurs remplacent `{ami}`, `{ville}`, `{métier}`, `{église}`, `{conjoint}` dans tous les titres, descriptions et noms d'arcs.

---

### Catégories d'épreuves (23 au total)

Peur/angoisse · Amertume/rejet · Orgueil/indépendance · Culpabilité · Découragement · Maladie/guérison · Tristesse/joie · Lourdeur/fatigue · Doute/incrédulité · Obéissance · Identité/appel · Combat spirituel · Prière · Parole de Dieu · Saint-Esprit · Soif de Dieu · Direction divine · Impudicité/addiction · Finances/paresse · Abondance financière · Stérilité · Échec/réussite · Amour de Dieu

### Types d'événements (200+ au total)

- **Épreuves personnelles** (core events) — peur, tentation, rejet, maladie, doute
- **Enfance (0-10 ans)** — 10 événements spécifiques aux premières années de vie
- **Famille** — 12 événements autour de la cellule familiale : disputes des parents, chômage, maladie grave, déménagement, deuil, animal de compagnie, remariage, grand-parent qui vient habiter
- **Environnement** — 10 événements externes qui influencent la vie d'Élias : coupure de courant, inondation, violence dans le quartier, crise politique, pasteur qui part, église divisée
- **Arcs narratifs** (voir section dédiée) — séquences d'événements liés à la vie personnalisée d'Élias

### Événements en cascade

Certains événements déclenchent automatiquement un second événement (le chômage du père peut entraîner un déménagement, la maladie grave peut entraîner un deuil). Ces cascades sont définies dans `src/data/events.ts` via la propriété `cascade`.

---

## Le Codex

Chaque verset mémorisé (réponse correcte) est débloqué dans le Codex. Le SRS (Spaced Repetition System) le remet en jeu plus souvent si tu l'as raté récemment.

**200 versets** couvrent les 23 catégories avec les références officielles du livre EJP/ICC (p.1–p.95).

---

## Stack technique

| Couche | Technologie |
|---|---|
| Framework | React 19 + TypeScript 5 + Vite 8 |
| Style | Tailwind CSS v4 + CSS custom properties |
| État | Zustand |
| Audio | HTMLAudioElement (3 MP3) + Web Audio API (SFX) |
| Persistance | localforage (IndexedDB) |
| Tests | Vitest |
| PWA | vite-plugin-pwa (offline, installable) |
| Déploiement | Vercel (auto-deploy sur push GitHub) |

### Structure du projet

```
elias-game/
├── src/
│   ├── App.tsx                  # Composant racine, boucle UI principale
│   ├── components/
│   │   ├── StatBar.tsx          # Barres de stats
│   │   ├── FlowBar.tsx          # Barre de Flow (REPOS/FERVEUR/FEU DE DIEU)
│   │   ├── ActionPanel.tsx      # Actions volontaires (2 pts/an)
│   │   ├── ArcTracker.tsx       # Suivi des arcs narratifs (noms résolus)
│   │   ├── DevPanel.tsx         # Panel dev (mode ?dev, test IA)
│   │   ├── EliasPortrait.tsx    # Portrait pixel art avec réactions CSS
│   │   ├── VerseChoices.tsx     # Boutons de réponse
│   │   ├── Journal.tsx          # Journal de vie
│   │   ├── CodexMenu.tsx        # Bibliothèque de versets débloqués
│   │   ├── LexiconMenu.tsx      # Vocabulaire EJP/ICC
│   │   ├── MainMenu.tsx         # Menu burger
│   │   └── IconSystem.tsx       # Icônes
│   ├── data/
│   │   ├── events.ts            # 200+ événements avec variantes byAge + arcs
│   │   ├── storyArcs.ts         # 11 arcs narratifs (arc-ami, arc-métier, etc.)
│   │   ├── verses.ts            # 200 versets EJP/ICC
│   │   └── lexicon-ejp-icc.ts   # 18 termes clés du vocabulaire EJP/ICC
│   ├── engine/
│   │   ├── gameEngine.ts        # Moteur de jeu (stats, flow, SRS, arcs)
│   │   └── juice.ts             # Audio (3 MP3) + VFX (shake, particles)
│   ├── services/
│   │   └── aiNarrator.ts        # IA narrative (optionnel)
│   ├── stores/
│   │   └── gameStore.ts         # État global Zustand
│   └── types/
│       └── game.ts              # Types TypeScript du jeu
├── public/
│   ├── elias-avatar.png         # Sprite pixel art du personnage
│   └── audio/                   # 3 soundtracks MP3
├── tests/                       # Suites Vitest
└── references/                  # GDD source, documentation interne
```

---

## Installer et lancer en local

```bash
git clone https://github.com/hexapost-studio/elias-game.git
cd elias-game
npm install
npm run dev       # Dev server sur http://localhost:5173
npm run test      # Tests unitaires
npm run build     # Build production
```

---

## Ajouter du contenu

### Ajouter un verset (`src/data/verses.ts`)

```typescript
{
  id: 'v-peur-015',             // préfixe catégorie + numéro
  reference: 'Psaume 27:1',
  text: 'L\'Éternel est ma lumière et mon salut — de qui aurais-je crainte ?',
  category: 'peur_angoisse',
  tags: ['lumière', 'salut', 'crainte'],
  statImpact: { foi: 4, paix: 3 },
  difficulty: 1,                // 1 = facile, 2 = moyen, 3 = difficile
},
```

### Ajouter un événement (`src/data/events.ts`)

Événement simple :
```typescript
{
  id: 'e-fam-020',
  title: 'La lettre d\'expulsion',
  description: 'Le propriétaire a glissé une lettre sous la porte. Tu as 30 jours pour quitter l\'appartement.',
  ageRange: [18, 60],
  category: 'decouragement',
  correctVerseId: 'v-decour-001',
  decoyVerseIds: [],             // généré automatiquement si vide
  statImpactOnFail: { foi: -3, paix: -4, physique: -1, finances: -5 },
  thematicFlavor: 'Précarité',
},
```

Événement avec variantes par âge (`byAge`) :
```typescript
{
  id: 'e-fam-020',
  title: 'La lettre d\'expulsion',
  description: 'Le propriétaire a glissé une lettre sous la porte. Tu as 30 jours.',
  ageRange: [5, 70],
  category: 'decouragement',
  correctVerseId: 'v-decour-001',
  decoyVerseIds: [],
  statImpactOnFail: { foi: -3, paix: -4, physique: -1, finances: -5 },
  byAge: {
    enfant: {
      description: 'Maman pleure en lisant une lettre. Papa dit qu\'on va devoir partir.',
      statImpactOnFail: { finances: -1, paix: -1 },
    },
    ado: {
      description: 'On doit quitter l\'appartement. Tu dois changer d\'école encore.',
      statImpactOnFail: { paix: -2 },
    },
    adulte: {
      description: 'Le propriétaire exige que tu partes. 30 jours pour trouver quelque chose.',
      statImpactOnFail: { finances: -2 },
    },
    senior: {
      description: 'À ton âge, reconstruire un foyer semble insurmontable. Mais tu l\'as déjà fait.',
      statImpactOnFail: { physique: -2, finances: -1 },
    },
  },
},
```

> **Note technique** : les `statImpactOnFail` dans `byAge` sont **additifs** par rapport au root. Si le root est `{ finances: -5 }` et la variante adulte ajoute `{ finances: -2 }`, le résultat final est `-7`.

---

## IA narrative (optionnel)

Le jeu fonctionne **entièrement sans IA**. L'IA ajoute deux fonctionnalités si configurée :

- **Journal vivant** : à chaque anniversaire, une entrée de journal à la 1ère personne adaptée aux stats et événements vécus
- **Événements dynamiques** : des événements inédits générés en cours de partie selon la stat la plus faible

### Configurer

Copier `.env.local.example` → `.env.local` et choisir un backend :

**Option 1 — Ollama (auto-hébergé, gratuit, aucun compte)**
```env
VITE_OLLAMA_URL=http://localhost:11434
VITE_OLLAMA_MODEL=llama3.2
```
Installer Ollama : [ollama.ai](https://ollama.ai) → `ollama pull llama3.2`  
Proxmox / VM réseau : `VITE_OLLAMA_URL=http://192.168.x.x:11434`

**Option 2 — Groq (cloud, gratuit, compte requis)**
```env
VITE_GROQ_API_KEY=gsk_xxxxxxxxxxxxxx
```
Compte gratuit : [console.groq.com](https://console.groq.com) → API Keys

**Option 3 — OpenRouter (cloud, modèles gratuits disponibles)**
```env
VITE_AI_ENDPOINT=https://openrouter.ai/api/v1/chat/completions
VITE_AI_KEY=sk-or-v1-xxxxxxxxxxxx
VITE_AI_MODEL=mistralai/mistral-7b-instruct:free
```
Compte gratuit : [openrouter.ai](https://openrouter.ai) → Keys  
Modèles gratuits : `mistralai/mistral-7b-instruct:free`, `google/gemma-2-9b-it:free`, `meta-llama/llama-3.2-3b-instruct:free`

**Option 4 — Endpoint custom (n8n, LM Studio, etc.)**
```env
VITE_AI_ENDPOINT=https://mon-serveur/v1/chat/completions
VITE_AI_KEY=optionnel
VITE_AI_MODEL=nom-du-modele
```

**Sans IA (par défaut)** — Ne rien configurer. Le jeu est identique, sans les entrées de journal générées.

### Mode dev (test IA sans exposer aux joueurs)

Ajouter `?dev` à l'URL ou taper 7 fois dans le coin bas-droit pour ouvrir le **DevPanel** flottant. Permet d'activer/désactiver l'IA, changer de modèle, et voir le statut en temps réel — invisible pour les joueurs normaux.

### Comment l'IA s'intègre sans casser le jeu

Les événements IA sont **pré-générés en arrière-plan** pendant que le joueur lit l'événement actuel. Si le moteur de jeu génère un événement statique pour l'âge suivant, l'événement IA est ignoré (le statique a toujours la priorité). Le journal IA est stocké séparément de l'état de jeu et fusionné à l'affichage, triés par âge.

---

## Titres de fin de vie

| Titre | Condition |
|---|---|
| Le Témoin Fidèle | 100 ans, toutes stats > 50% |
| Le Vainqueur | 30+ épreuves, taux de réussite > 70% |
| Le Mémoriseur | 30+ versets débloqués |
| L'Homme de Flow | Flow max atteint |
| Le Combo Master | Combo ≥ 10 |
| L'Intègre | Taux de réussite > 85% |
| Le Survivant | 5+ événements en cascade |

Le titre obtenu débloque un **héritage** pour la partie suivante (bonus de stat de départ).

---

## Lexique EJP/ICC

Termes du vocabulaire communautaire utilisés dans le jeu :

| Terme | Signification |
|---|---|
| Prodige | Jeune croyant en formation spirituelle intense |
| Couloir | Période de transition et d'épreuve |
| Saison | Période spirituelle définie (formation, déploiement…) |
| Anakazo | Contraindre, pousser vers le haut (Luc 14:23) |
| Chair | Nature charnelle opposée à l'Esprit |
| Cordeau de mesure | Standard de Dieu pour une vie droite |
| Ville ouverte | Esprit sans protection spirituelle |
| Faux Modèles | Leaders ou personnes dont l'exemple est trompeur |
| Ferveur | Intensité de la vie spirituelle |

---

## GitHub

[github.com/hexapost-studio/elias-game](https://github.com/hexapost-studio/elias-game)

Les contributions au contenu (versets, événements, variantes `byAge`) sont bienvenues via Pull Request.

---

*Développé par Hexapost Studio pour la communauté EJP/ICC.*  
*Construit pour former une génération de Prodiges.*
