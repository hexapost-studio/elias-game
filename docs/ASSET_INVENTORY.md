# INVENTAIRE COMPLET DES ASSETS — Élias

> Document de référence pour toi, une IA, ou un graphiste.
> Chaque élément est listé avec son chemin, son format, ses dimensions, et ce qu'il faudrait pour le remplacer par un asset custom.

---

## 1. POLICES — 2 fichiers

| Asset | Chemin | Format | Usage | À remplacer par |
|-------|--------|--------|-------|-----------------|
| Kenney Future | `public/fonts/KenneyFuture.ttf` | TTF | Titres (âge, game over, boutons) | Police fantasy ou médiévale |
| Inter | Google Fonts (CSS) | Web | Corps du texte (descriptions, journal) | Garder ou changer |

---

## 2. ICÔNES — 20 fichiers SVG

| Asset | Chemin | Usage | Taille idéale |
|-------|--------|-------|---------------|
| Croix | `public/ui/icon_cross.svg` | Icône Foi + afflictions | 24×24px |
| Cercle | `public/ui/icon_circle.svg` | Icône Paix + identité | 24×24px |
| Carré | `public/ui/icon_square.svg` | Icône Physique + finances | 24×24px |
| Check | `public/ui/icon_check.svg` | Validation Codex | 24×24px |
| Flèches | `public/ui/icon_arrow_*.svg` | Navigation | 24×24px |
| Play | `public/ui/icon_play_*.svg` | Bouton lecture | 24×24px |
| Repeat | `public/ui/icon_repeat_*.svg` | Bouton replay | 24×24px |
| Divider | `public/ui/divider.svg` | Séparateur UI | 400×4px |

> **Si tu veux remplacer par des icônes custom** : exporte en SVG, même nom de fichier, même dossier.

---

## 3. BOUTONS — 4 fichiers SVG

| Asset | Chemin | Usage | Dimensions |
|-------|--------|-------|------------|
| Bouton principal | `public/ui/btn_main.svg` | Bouton "+1 Âge suivant" | ~400×60px |
| Bordure de bouton | `public/ui/btn_border.svg` | Contour des choix + cartes | 9-slice / tileable |
| Bouton accent | `public/ui/btn_accent.svg` | Boutons secondaires (Codex) | ~200×40px |
| Bouton doré | `public/ui/btn_gold.svg` | Bouton validation/combo | ~200×40px |

> **Format attendu** : SVG avec fond transparent. Le SVG doit être un rectangle de bouton (9-slice si possible).

---

## 4. BARRES DE STATUT — 3 fichiers SVG

| Asset | Chemin | Usage | Dimensions |
|-------|--------|-------|------------|
| Fond de barre | `public/ui/bar_bg.svg` | Fond des 4 jauges (Foi, Paix, Physique, Finances) | ~80×8px |
| Remplissage | `public/ui/bar_fill.svg` | Barre de progression colorée | ~80×8px |
| Remplissage large | `public/ui/bar_fill_wide.svg` | Jauge de Flow | ~300×8px |

> **Remplacer par** : une barre de vie de RPG ou de jeu mobile. La barre_fill doit pouvoir s'étirer en largeur (le CSS gère la largeur via `width: X%`).

---

## 5. FONDS D'ÉCRAN — 3 fichiers PNG

| Asset | Chemin | Usage | Dimensions |
|-------|--------|-------|------------|
| Cercle lumineux | `public/ui/bg_circle.png` | Texture d'ambiance en fond | 512×512px |
| Flare lumineux | `public/ui/bg_flare.png` | Effet de lumière en haut | 200×200px |
| Glow | `public/ui/bg_glow.png` | Lueur d'ambiance | 512×512px |

> **Remplacer par** : des textures d'ambiance bibliques (vitrail, lumière céleste, parchemin foncé).

---

## 6. PARTICULES — 6 fichiers PNG

| Asset | Chemin | Usage | Dimensions |
|-------|--------|-------|------------|
| Flare | `public/assets/flare.png` | Particule de succès / combo | 64×64px |
| Star | `public/assets/star.png` | Particule de victoire | 64×64px |
| Spark | `public/assets/spark.png` | Particule d'étincelle | 32×32px |
| Smoke | `public/assets/smoke.png` | Particule d'échec | 64×64px |
| Light | `public/assets/light.png` | Particule de lumière | 64×64px |
| Fire | `public/assets/fire.png` | Particule de feu | 64×64px |

> **Remplacer par** : des particules stylisées (croix lumineuses, gouttes de lumière, flammes).

---

## 7. SONS & MUSIQUE

> Document complet avec prompts Suno et guide d'intégration → **[AUDIO_DESIGN.md](./AUDIO_DESIGN.md)**

**Sons UI actuels — Kenney (à remplacer) :**

| Asset | Chemin | Usage |
|-------|--------|-------|
| click-a.ogg | `public/sounds/click-a.ogg` | Clic sur bouton |
| click-b.ogg | `public/sounds/click-b.ogg` | Clic succès |
| switch-a.ogg | `public/sounds/switch-a.ogg` | Transition / milestone |
| switch-b.ogg | `public/sounds/switch-b.ogg` | Transition échec |
| tap-a.ogg | `public/sounds/tap-a.ogg` | Tap combo |
| tap-b.ogg | `public/sounds/tap-b.ogg` | Tap secondaire |

**Musique de fond — 3 génériques (à remplacer par 1 piste/saison) :**

| Asset | Chemin |
|-------|--------|
| soundtrack-1.mp3 | `public/audio/soundtrack-1.mp3` |
| soundtrack-2.mp3 | `public/audio/soundtrack-2.mp3` |
| soundtrack-3.mp3 | `public/audio/soundtrack-3.mp3` |

> **13 nouveaux assets à produire** (6 MP3 + 7 OGG) — voir [AUDIO_DESIGN.md](./AUDIO_DESIGN.md) section 2.

---

## 8. SILHOUETTES D'ENNEMIS — 6 composants SVG inline

| Asset | Fichier | Usage |
|-------|---------|-------|
| Fear | `src/components/EnemyAssets.tsx` → `EnemyFear` | Fond pendant événement peur |
| Addiction | `src/components/EnemyAssets.tsx` → `EnemyAddiction` | Fond pendant événement addiction |
| Pride | `src/components/EnemyAssets.tsx` → `EnemyPride` | Fond pendant événement orgueil |
| Rejection | `src/components/EnemyAssets.tsx` → `EnemyRejection` | Fond pendant événement rejet |
| Battle | `src/components/EnemyAssets.tsx` → `EnemyBattle` | Fond pendant combat spirituel |
| Doubt | `src/components/EnemyAssets.tsx` → `EnemyDoubt` | Fond pendant événement doute |

> **Remplacer par** : des PNG/SVG d'ambiance (ombre, brouillard, chaînes). Le composant prend un `size` en props et le rend avec `opacity: 0.08`.

---

## 9. PORTRAIT ÉLIAS — 1 composant SVG inline

| Fichier | Usage |
|---------|-------|
| `src/components/EliasPortrait.tsx` | Portrait d'Élias qui change selon l'âge et l'état |

> **Remplacer par** : 4 portraits PNG (enfant, jeune, adulte, vieux) + 2 variantes (succès/échec). Format 64×64px, fond transparent.

---

## 10. ÉLÉMENTS UI SUPPLÉMENTAIRES — Assets Kenney non utilisés

Dans `public/assets/kenney/Vector/*/` — 516 SVGs inutilisés :

| Catégorie | Utilité potentielle |
|-----------|-------------------|
| `button_square_*.svg` | Boutons d'icônes dans le Codex |
| `button_round_*.svg` | Boutons ronds alternatifs |
| `check_*.svg` | Cases à cocher / validation |
| `star_*.svg` | Étoiles pour le Flow |
| `slide_vertical_*.svg` | Barres verticales (alternative) |
| `arrow_*.svg` | Flèches de navigation |

---

## BILAN — Ce qui faut produire pour un jeu unique

| Priorité | Élément | Quantité | Peut être fait par |
|----------|---------|----------|-------------------|
| 🔴 | Portrait Élias (4 âges) | 4 PNG | Graphiste |
| 🔴 | Icônes d'affliction (8) | 8 SVG | IA (Leonardo) |
| 🟡 | Boutons thématiques | 4 SVG | IA |
| 🟡 | Barres de stats | 3 SVG | IA |
| 🟡 | Fonds d'ambiance | 3 PNG | IA |
| 🟢 | Particules VFX | 6 PNG | IA |
| 🟢 | Sons thématiques | 6 OGG | Freesound CC0 |
| 🟢 | Police custom | 1 TTF | Google Fonts |
| 🟢 | Silhouettes ennemies | 6 PNG | IA |

**Temps estimé pour un graphiste** : 2-3 jours pour tout produire.
**Temps estimé pour une IA** (Leonardo/Midjourney) : 4-5 sessions de génération + retouches.

---

## FLUX DE TRAVAIL RECOMMANDÉ

```
1. Graphiste crée les assets dans Figma/Photoshop
   ↓
2. Export en PNG/SVG dans les dossiers correspondants
   ↓
3. L'IA de développement (moi) ou toi fait:
   - Remplacer les fichiers dans public/ui/, public/assets/, public/sounds/
   - Ajuster le CSS si les dimensions changent
   ↓
4. git add → git commit → git push
   ↓
5. Vercel redéploie automatiquement
```

**Règle d'or** : garde exactement le même nom de fichier et les mêmes dimensions que l'original, tu n'as rien à toucher dans le code.
