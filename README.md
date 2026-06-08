# Élias — Le Combat d'une Vie

**Life Simulator** textuel inspiré de BitLife, avec mémorisation stratégique de versets bibliques basée sur le modèle EJP/ICC.

## Concept

- Vous incarnez **Élias**, un personnage qui vieillit de 6 à 100 ans.
- À chaque âge, des **épreuves de vie** surviennent (peur, tentation, rejet, dette, combat spirituel).
- Votre mission : choisir le **verset biblique correct** parmi 4 propositions.
- Les 4 jauges (Foi, Paix, Physique, Finances) montent ou descendent selon vos choix.
- **Game Over** si une jauge tombe à zéro. **Victoire** si Élias atteint 100 ans.

## Mécaniques clés

- **Système de Combo** : réponses correctes consécutives boostent les stats.
- **Spaced Repetition** : les versets échoués sont réintroduits plus tard.
- **Difficulté Progressive** : Niveau 1 (texte visible) → Niveau 2 (référence seule) → Niveau 3 (frappe libre).
- **Lexique EJP/ICC** : Prodige, Chair, Anakazo, Cordeau de mesure, Ville ouverte, Faux Modèles.
- **PWA** : installation sur mobile, jeu hors-ligne.

## Stack

- **React 19** + **TypeScript 5**
- **Vite 8** + **Tailwind CSS 4**
- **Zustand** (état global)
- **Vitest** (tests)
- **vite-plugin-pwa** (PWA offline)
- **localforage** (persistance IndexedDB)

## Structure du projet

```
elias-game/
├── src/
│   ├── components/       # UI (StatBar, Journal, VerseChoices)
│   ├── data/             # Verse DB (60+ entrées), Events (40+), Lexicon EJP/ICC
│   ├── engine/           # Moteur de jeu pur (testable sans UI)
│   ├── stores/           # Zustand store
│   └── types/            # TypeScript types
├── tests/                # Tests Vitest (8 suites, 20+ tests)
├── references/           # GDD source, documentation
├── index.html            # PWA-ready
├── vite.config.ts        # Tailwind + PWA config
└── package.json
```

## Démarrage

```bash
npm install
npm run dev        # Dev server sur :5173
npm run test       # Tests unitaires
npm run build      # Build production
```

## Doctrine EJP/ICC

Le jeu est nourri par le lexique des communautés EJP (Église Jeunes Prodiges) et ICC (Impact Centre Chrétien). Voir `src/data/lexicon-ejp-icc.ts` pour les 18 termes clés.

---

**hexapost.studio** — Construit pour former une génération de Prodiges
