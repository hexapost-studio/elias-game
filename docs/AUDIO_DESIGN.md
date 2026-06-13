# AUDIO DESIGN — Élias : Le Combat d'une Vie

> Document de référence complet : état actuel, assets à produire, prompts Suno, et guide d'intégration.
> Mise à jour : 2026-06-12

---

## 1. ÉTAT ACTUEL

### Musique de fond

| Fichier | Chemin | Problème |
|---|---|---|
| `soundtrack-1.mp3` | `public/audio/` | Générique — aucun lien avec la saison spirituelle |
| `soundtrack-2.mp3` | `public/audio/` | Générique — lecture aléatoire (shuffle) |
| `soundtrack-3.mp3` | `public/audio/` | Générique — lecture aléatoire (shuffle) |

> Le moteur (`juice.ts`) lit ces 3 pistes en shuffle aléatoire. L'objectif est de les remplacer par **1 piste par saison spirituelle** + 1 thème principal, et de câbler la transition automatique via `SEASON_TRACKS`.

### Sons UI

| Fichier | Chemin | Source | Usage actuel |
|---|---|---|---|
| `click-a.ogg` | `public/sounds/` | Kenney | Clic bouton |
| `click-b.ogg` | `public/sounds/` | Kenney | Clic succès |
| `switch-a.ogg` | `public/sounds/` | Kenney | Transition / milestone |
| `switch-b.ogg` | `public/sounds/` | Kenney | Transition échec |
| `tap-a.ogg` | `public/sounds/` | Kenney | Tap combo |
| `tap-b.ogg` | `public/sounds/` | Kenney | Tap secondaire |

### Sons procéduraux (Web Audio API — déjà en place, ne pas modifier)

| Type | Déclencheur | Description technique |
|---|---|---|
| `success` | Bonne réponse | Arpège C5→E5→G5, oscillateurs sine, 0.3s |
| `fail` | Mauvaise réponse | Sawtooth 200→60Hz descendant, 0.3s |
| `levelup` | Passage d'année | Arpège triangle G4→B4→D5→G5, 0.4s |
| `combo` | Combo ×3+ | Sparkle haute fréquence 1200–1600Hz, 0.15s |

---

## 2. ASSETS À PRODUIRE

### 2A. Musique de fond — 6 fichiers MP3

| Fichier cible | Saison | Âge(s) concernés | Durée cible | Format |
|---|---|---|---|---|
| `ambient-reveil.mp3` | ✦ Réveil | 0–9, 20–29 | 2–3 min, loopable | MP3 320kbps |
| `ambient-desert.mp3` | ◈ Désert | 10–19, 40–49, 70–79 | 2–3 min, loopable | MP3 320kbps |
| `ambient-persecution.mp3` | ⚔ Épreuve | 30–39, 50–59, 80–89 | 2–3 min, loopable | MP3 320kbps |
| `ambient-abondance.mp3` | ✧ Abondance | 60–69, 90–99 | 2–3 min, loopable | MP3 320kbps |
| `ambient-grace.mp3` | ◎ Grâce | fin de vie / titres élevés | 2–3 min, loopable | MP3 320kbps |
| `menu-theme.mp3` | — | Écran titre / menus | 45 sec, loopable | MP3 320kbps |

### 2B. Sons d'événements — 7 fichiers OGG

| Fichier cible | Déclencheur | Durée |
|---|---|---|
| `sfx-verse-correct.ogg` | Bonne réponse (remplace sons procéduraux optionnellement) | 2s |
| `sfx-verse-fail.ogg` | Mauvaise réponse | 2s |
| `sfx-age-advance.ogg` | Clic bouton "+1 ÂGE SUIVANT" | 3s |
| `sfx-season-transition.ogg` | Changement de saison spirituelle | 4s |
| `sfx-crisis-grace.ogg` | Grâce de crise (stat tombe à 0, sauvé) | 4s |
| `sfx-gameover.ogg` | Mort / fin de partie | 6s |
| `sfx-title-unlock.ogg` | Nouveau titre débloqué | 3s |

---

## 3. INSPIRATIONS PAR PISTE

| Piste | Style | Références directes |
|---|---|---|
| `ambient-reveil` | Piano cristallin + cordes légères + harpe | Journey OST (Austin Wintory — "Nascence"), Ori and the Blind Forest (Gareth Coker), Gris OST |
| `ambient-desert` | Oud + drone tamboura + flûte ney, silence habité | Dune Part One OST (Hans Zimmer), Assassin's Creed Origins (Sarah Schachner), Ólafur Arnalds |
| `ambient-persecution` | Cordes tremolo + cuivres graves, pas de résolution | The Last of Us OST (Gustavo Santaolalla), Hollow Knight OST (Christopher Larkin), Hades OST (Darren Korb) |
| `ambient-abondance` | Orchestre généreux + harpe + groove pizzicato | Ori and the Will of the Wisps (Gareth Coker), Abzû OST (Austin Wintory), Florence OST (Kevin Penkin) |
| `ambient-grace` | Chœur a cappella + orgue + violon solo | Sigur Rós (Ára bátur), Arvo Pärt (Spiegel im Spiegel), Henryk Górecki (Symphony No. 3) |
| `menu-theme` | Thème épique court, cor + chœur + cordes | The Prince of Egypt (Hans Zimmer), Celeste OST (Lena Raine — "Resurrections"), Hades main menu |

---

## 4. PROMPTS SUNO

> Coller directement dans Suno. Activer **"Instrumental"** avant de générer.
> Pour les stings courts, utiliser le mode **Custom** et préciser `[sting]` + durée.

---

### AMBIENT-REVEIL — Saison ✦ Réveil

```
[instrumental] [ambient] [cinematic] [loopable]

A gentle, luminous piano melody played softly, like a child discovering light for the first time.
Sparse crystalline notes linger in the air. Warm string ensemble breathes slowly underneath,
barely moving. Occasional harp glissando. No drums. Tender and wondering, like the first page
of a story. Fades into itself seamlessly for looping.

[Instrumentation: solo piano, string quartet, harp, soft pad synth]
[Mood: wonder, innocence, spiritual awakening, hope]
[Tempo: slow, 58 BPM]
[Reference: Journey OST by Austin Wintory, Ori and the Blind Forest, Gris OST]
[Duration: 2-3 minutes, loopable ending]
[no vocals] [no lyrics]
```

---

### AMBIENT-DESERT — Saison ◈ Désert

```
[instrumental] [ambient] [world music] [cinematic] [loopable]

A lone oud plays a slow, searching melody in a minor mode. Long silences between phrases.
A deep tamboura drone sustains underneath, resonating like hot sand. Distant wind textures.
No percussion. The feeling of wandering alone in a vast spiritual wasteland, questioning,
enduring. Ancient Middle Eastern scales. Sparse, patient, aching.

[Instrumentation: oud, tamboura drone, ethnic flute (ney), ambient wind texture, sparse strings]
[Mood: solitude, spiritual dryness, searching, endurance, sacred loneliness]
[Tempo: very slow, 45 BPM or free time]
[Reference: Dune Part One OST Hans Zimmer, Assassin's Creed Origins OST Sarah Schachner, Ólafur Arnalds]
[Duration: 2-3 minutes, loopable ending]
[no vocals] [no lyrics]
```

---

### AMBIENT-PERSECUTION — Saison ⚔ Épreuve

```
[instrumental] [cinematic] [dark ambient] [tension] [loopable]

Cello and viola in tremolo, sustained and unsettled. Low brass breathes in slowly, heavy and
oppressive. No resolution, no release — only the weight of endurance. Occasional distant
percussion like a heartbeat slowing down. Dark, contemplative, heavy. Not violent but relentless.
The sound of spiritual warfare fought in silence. Minor key, unresolved cadences.

[Instrumentation: string ensemble tremolo, low brass, contrabass, minimal percussion, low pad]
[Mood: persecution, spiritual warfare, gravity, suffering with dignity, inner battle]
[Tempo: slow, 52 BPM, rubato]
[Reference: The Last of Us OST Gustavo Santaolalla, Hollow Knight OST Christopher Larkin, Hades OST Darren Korb]
[Duration: 2-3 minutes, loopable ending]
[no vocals] [no lyrics]
```

---

### AMBIENT-ABONDANCE — Saison ✧ Abondance

```
[instrumental] [orchestral] [cinematic] [uplifting] [loopable]

A warm, generous orchestral piece that opens with a flowing harp arpeggio. Strings enter with
a broad, breathing melody — hopeful but not triumphant, settled and grounded. Light woodwinds
add color. A gentle groove emerges from pizzicato cello. The feeling of harvest after a long
season of planting. Radiant and at peace, like afternoon light over water.

[Instrumentation: full strings, harp, oboe, clarinet, light pizzicato groove, subtle French horn]
[Mood: abundance, gratitude, fruitfulness, warm joy, spiritual harvest]
[Tempo: moderate, 72 BPM]
[Reference: Ori and the Will of the Wisps OST Gareth Coker, Abzû OST Austin Wintory, Florence OST Kevin Penkin]
[Duration: 2-3 minutes, loopable ending]
[no vocals] [no lyrics]
```

---

### AMBIENT-GRACE — Saison ◎ Grâce

```
[instrumental] [choral] [sacred] [minimalist] [loopable]

A small mixed choir hums a slow, ancient-sounding melody, wordless vowels only. Underneath,
a pipe organ sustains a deep, resonant chord that barely moves. Violin plays a single melodic
line above, sparse and dignified. Long reverb, cathedral space. The sound of a long life
carried with grace. Peaceful, majestic, timeless. Every note has space around it.

[Instrumentation: SATB choir wordless, pipe organ, solo violin, long reverb, silence]
[Mood: grace, wisdom, peace, eternity, completion, spiritual maturity]
[Tempo: very slow, 44 BPM, free time]
[Reference: Sigur Rós Ára bátur, Arvo Pärt Spiegel im Spiegel, Henryk Górecki Symphony No. 3]
[Duration: 2-3 minutes, loopable ending]
[no vocals] [no lyrics]
```

---

### MENU-THEME — Écran titre

```
[instrumental] [cinematic] [epic] [theme]

A bold, memorable theme that opens with a single low piano note, then builds slowly. A heroic
brass melody enters — not bombastic but dignified, like a calling rather than a battle. Choir
joins on the second phrase, swelling. Strings underneath build momentum. The theme should feel
like the beginning of a long journey of faith, not a war. Resolves on a hopeful, open chord.
Designed to loop seamlessly after 45 seconds.

[Instrumentation: piano, French horn lead, full string orchestra, mixed choir, light timpani]
[Mood: epic calling, spiritual purpose, beginning of a journey, faith, gravitas]
[Tempo: moderate, 66 BPM, rubato at the end]
[Reference: The Prince of Egypt Hans Zimmer The Burning Bush, Hades main menu, Celeste OST Lena Raine Resurrections]
[Duration: 45 seconds, loopable]
[no vocals] [no lyrics]
```

---

### SFX-VERSE-CORRECT — Bonne réponse

```
[sting] [instrumental] [2 seconds]

A single, pure bell tone rings out — like a Tibetan singing bowl struck gently — followed by
a soft rising harmonic that blooms and fades. Clean, resonant, spiritual. The sound of a truth
recognized.

[Instrumentation: singing bowl, resonant bell, soft string harmonic]
[Mood: rightness, clarity, spiritual affirmation]
[Duration: 2 seconds]
[no vocals] [no lyrics]
```

---

### SFX-VERSE-FAIL — Mauvaise réponse

```
[sting] [instrumental] [2 seconds]

A low, muffled thud, like a heavy stone falling onto earth. A single cello note descends slowly
into silence. No sharpness — weight, not punishment. Reverb trails off into darkness.

[Instrumentation: low cello, sub bass thud, long reverb tail]
[Mood: weight, missed moment, gravity, not aggression]
[Duration: 2 seconds]
[no vocals] [no lyrics]
```

---

### SFX-AGE-ADVANCE — Passage d'une année

```
[sting] [instrumental] [3 seconds]

A gentle whoosh like wind turning a page, followed by a single ascending string chord that
lingers — the feeling of time moving forward. Light, inevitable, slightly bittersweet.

[Instrumentation: string chord, wind texture, harp touch]
[Mood: time passing, forward movement, gentle inevitability]
[Duration: 3 seconds]
[no vocals] [no lyrics]
```

---

### SFX-SEASON-TRANSITION — Changement de saison spirituelle

```
[sting] [cinematic] [atmospheric] [4 seconds]

A deep cinematic sweep — low pad rises, then a bright chord strikes above it like light breaking
through clouds. The world shifting. Sense of entering a new chapter. Resolves on an open,
suspended chord.

[Instrumentation: low pad sweep, orchestral brass hit, cymbal shimmer, string chord]
[Mood: world-shift, new chapter, spiritual transition, gravity + hope]
[Duration: 4 seconds]
[no vocals] [no lyrics]
```

---

### SFX-CRISIS-GRACE — Grâce de crise

```
[sting] [cinematic] [dramatic] [4 seconds]

Begins with a deep, rumbling impact — the edge of disaster. Then a single high violin note
pierces upward, followed immediately by a warm choir chord that blooms. Dark to light in one
breath. The sound of being caught before you fall.

[Instrumentation: sub bass impact, solo violin ascent, SATB choir swell]
[Mood: saved at the last moment, divine intervention, dramatic relief]
[Duration: 4 seconds]
[no vocals] [no lyrics]
```

---

### SFX-GAMEOVER — Fin de partie

```
[sting] [cinematic] [elegiac] [6 seconds]

A single low note on the organ, held long. A choir slowly hums a final chord — not sad, but
solemn. Like closing a book. Fades completely to silence.

[Instrumentation: pipe organ, wordless choir, long fade]
[Mood: completion, solemnity, end of a life — neither triumph nor defeat]
[Duration: 6 seconds, must end in silence]
[no vocals] [no lyrics]
```

---

### SFX-TITLE-UNLOCK — Nouveau titre débloqué

```
[sting] [instrumental] [fanfare] [3 seconds]

A short two-bar brass fanfare — French horn lead, two measures, triumphant but measured.
Not cartoonish. Like a knighthood being conferred. Timpani strike on the final note.

[Instrumentation: French horn, trumpet, light timpani]
[Mood: earned achievement, solemnity, honor, spiritual recognition]
[Duration: 3 seconds]
[no vocals] [no lyrics]
```

---

## 5. ORDRE DE GÉNÉRATION RECOMMANDÉ

| # | Fichier | Raison |
|---|---|---|
| 1 | `ambient-desert.mp3` | Saison la plus longue (3 décennies sur 10) |
| 2 | `ambient-persecution.mp3` | Tension maximale — impact émotionnel fort |
| 3 | `menu-theme.mp3` | Première impression du jeu |
| 4 | `sfx-verse-correct.ogg` + `sfx-verse-fail.ogg` | Entendus des centaines de fois par partie |
| 5 | `ambient-reveil.mp3` | Début de chaque nouvelle partie |
| 6 | `sfx-season-transition.ogg` + `sfx-crisis-grace.ogg` | Moments clés mémorables |
| 7 | `ambient-abondance.mp3` + `ambient-grace.mp3` | Saisons tardives |
| 8 | `sfx-age-advance.ogg` + `sfx-gameover.ogg` + `sfx-title-unlock.ogg` | UI polish final |

---

## 6. SOURCES ROYALTY-FREE ALTERNATIVES

Si Suno ne produit pas le résultat voulu sur une piste :

| Source | Usage | Coût |
|---|---|---|
| **Pixabay Music** (pixabay.com/music) | Ambient / cinematic complet | Gratuit — CC0 |
| **Freesound.org** | SFX individuels (bells, impacts, drones) | Gratuit — CC0/CC-BY |
| **Incompetech** (Kevin MacLeod) | Ambient et orchestral thématique | Gratuit — CC-BY |
| **Uppbeat** | Qualité production élevée, style spiritual | ~10$/mois |
| **Artlist.io** | Catalogue vaste, inclut style Ólafur Arnalds | ~200$/an |

---

## 7. INTÉGRATION TECHNIQUE

### Câbler les pistes par saison (juice.ts)

Une fois les fichiers MP3 dans `public/audio/`, remplacer dans `juice.ts` :

```typescript
// AVANT — shuffle aléatoire
const SOUNDTRACK_PATHS = [
  '/audio/soundtrack-1.mp3',
  '/audio/soundtrack-2.mp3',
  '/audio/soundtrack-3.mp3',
];

// APRÈS — piste par saison
import type { SpiritualSeasonName } from '../types/game';

const SEASON_TRACKS: Record<SpiritualSeasonName, string> = {
  'Réveil':      '/audio/ambient-reveil.mp3',
  'Désert':      '/audio/ambient-desert.mp3',
  'Persécution': '/audio/ambient-persecution.mp3',
  'Abondance':   '/audio/ambient-abondance.mp3',
  'Grâce':       '/audio/ambient-grace.mp3',
};
```

La transition de saison est déjà câblée dans `advanceAge()` (gameEngine.ts) — elle émet un
événement journal. Il suffira d'appeler `crossfadeTo(SEASON_TRACKS[newSeason])` depuis `App.tsx`
sur ce changement d'état, en profitant du crossfade existant (`FADE_OUT_SEC` = 1.8s / `FADE_IN_SEC` = 2.5s).

### Câbler les nouveaux SFX (juice.ts)

```typescript
// Ajouter dans SOUND_FILES :
const SOUND_FILES = [
  'click-a', 'click-b', 'switch-a', 'switch-b', 'tap-a', 'tap-b',
  'sfx-verse-correct', 'sfx-verse-fail', 'sfx-age-advance',
  'sfx-season-transition', 'sfx-crisis-grace', 'sfx-gameover', 'sfx-title-unlock',
];

// Ajouter les exports correspondants :
export function playVerseCorrect() { play('sfx-verse-correct', 0.6); }
export function playVerseFail()    { play('sfx-verse-fail', 0.5); }
export function playAgeAdvance()   { play('sfx-age-advance', 0.55); }
// etc.
```

### Format requis

- **Musique de fond** : MP3, 320kbps, 44.1kHz stéréo, fade-in/out naturel sur ~2s en début et fin de fichier
- **SFX** : OGG Vorbis q6, 44.1kHz, mono ou stéréo, silence nul en début de fichier (pas de latence)

---

## 8. CHECKLIST DE LIVRAISON

- [ ] `public/audio/menu-theme.mp3`
- [ ] `public/audio/ambient-reveil.mp3`
- [ ] `public/audio/ambient-desert.mp3`
- [ ] `public/audio/ambient-persecution.mp3`
- [ ] `public/audio/ambient-abondance.mp3`
- [ ] `public/audio/ambient-grace.mp3`
- [ ] `public/sounds/sfx-verse-correct.ogg`
- [ ] `public/sounds/sfx-verse-fail.ogg`
- [ ] `public/sounds/sfx-age-advance.ogg`
- [ ] `public/sounds/sfx-season-transition.ogg`
- [ ] `public/sounds/sfx-crisis-grace.ogg`
- [ ] `public/sounds/sfx-gameover.ogg`
- [ ] `public/sounds/sfx-title-unlock.ogg`
- [ ] Câblage `SEASON_TRACKS` dans `juice.ts`
- [ ] Export des nouvelles fonctions `playVerseCorrect()` etc. dans `juice.ts`
- [ ] Appel crossfade sur transition de saison dans `App.tsx`
