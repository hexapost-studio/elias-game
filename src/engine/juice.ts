/** Système audio procédural + VFX — Web Audio API + Kenney sounds */
import { CONFIG } from '../../game/data/loader';

let audioCtx: AudioContext | null = null;
let masterCompressor: DynamicsCompressorNode | null = null;
const buffers: Record<string, AudioBuffer> = {};
let loaded = false;

const SOUND_FILES = [
  'click-a', 'click-b', 'switch-a', 'switch-b', 'tap-a', 'tap-b',
];

async function initAudio(): Promise<void> {
  if (loaded) return;
  audioCtx = new AudioContext();
  // Compresseur maître — évite le clipping quand plusieurs sons jouent simultanément
  masterCompressor = audioCtx.createDynamicsCompressor();
  masterCompressor.threshold.value = -18;
  masterCompressor.knee.value = 10;
  masterCompressor.ratio.value = 4;
  masterCompressor.attack.value = 0.003;
  masterCompressor.release.value = 0.15;
  masterCompressor.connect(audioCtx.destination);
  const promises = SOUND_FILES.map(async (name) => {
    const resp = await fetch(`/sounds/${name}.ogg`);
    const arrayBuf = await resp.arrayBuffer();
    buffers[name] = await audioCtx!.decodeAudioData(arrayBuf);
  });
  await Promise.all(promises);
  loaded = true;
}

function getMasterOutput(): AudioNode {
  return masterCompressor ?? audioCtx!.destination;
}

function play(name: string, volume: number = 0.5, rate: number = 1.0): void {
  if (!audioCtx || !buffers[name]) return;
  if (audioCtx.state === 'suspended') audioCtx.resume();
  const source = audioCtx.createBufferSource();
  const gain = audioCtx.createGain();
  source.buffer = buffers[name];
  gain.gain.value = volume;
  source.playbackRate.value = rate;
  source.connect(gain).connect(getMasterOutput());
  source.start(0);
}

/** Sons procéduraux (synthétisés, pas de fichiers) */
function playProcedural(type: 'success' | 'fail' | 'levelup' | 'combo'): void {
  if (!audioCtx) return;
  if (audioCtx.state === 'suspended') audioCtx.resume();
  const ctx = audioCtx;
  const now = ctx.currentTime;

  const out = getMasterOutput();
  if (type === 'success') {
    // Rising chime: C5 → E5 → G5
    [523, 659, 784].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0, now + i * 0.08);
      gain.gain.linearRampToValueAtTime(0.10, now + i * 0.08 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 0.3);
      osc.connect(gain).connect(out);
      osc.start(now + i * 0.08);
      osc.stop(now + i * 0.08 + 0.3);
    });
  } else if (type === 'fail') {
    // Low descending buzz
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(200, now);
    osc.frequency.exponentialRampToValueAtTime(60, now + 0.3);
    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
    osc.connect(gain).connect(out);
    osc.start(now);
    osc.stop(now + 0.3);
  } else if (type === 'levelup') {
    // Ascending arpeggio
    [392, 494, 587, 784].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0, now + i * 0.1);
      gain.gain.linearRampToValueAtTime(0.08, now + i * 0.1 + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.1 + 0.4);
      osc.connect(gain).connect(out);
      osc.start(now + i * 0.1);
      osc.stop(now + i * 0.1 + 0.4);
    });
  } else if (type === 'combo') {
    // Sparkle: high fast notes
    for (let i = 0; i < 3; i++) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = 1200 + Math.random() * 400;
      gain.gain.setValueAtTime(0.05, now + i * 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.05 + 0.15);
      osc.connect(gain).connect(out);
      osc.start(now + i * 0.05);
      osc.stop(now + i * 0.05 + 0.15);
    }
  }
}

/* ─── VFX: SCREEN SHAKE ─── */

let shakeContainer: HTMLElement | null = null;

export function setShakeContainer(el: HTMLElement): void {
  shakeContainer = el;
}

export function screenShake(intensity: number = 4, duration: number = 300): void {
  if (!shakeContainer) return;
  const el = shakeContainer;
  const start = performance.now();

  function frame() {
    const elapsed = performance.now() - start;
    if (elapsed > duration) {
      el.style.transform = '';
      return;
    }
    const decay = 1 - elapsed / duration;
    const x = (Math.random() - 0.5) * intensity * decay;
    const y = (Math.random() - 0.5) * intensity * decay;
    el.style.transform = `translate(${x}px, ${y}px)`;
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

/* ─── PARTICLES ─── */

export function spawnParticles(
  container: HTMLElement,
  type: 'success' | 'fail' | 'combo',
  count: number = 8
): void {
  const images: Record<string, string[]> = {
    success: ['/assets/flare.png', '/assets/star.png', '/assets/spark.png'],
    fail: ['/assets/smoke.png'],
    combo: ['/assets/flare.png', '/assets/star.png', '/assets/light.png'],
  };

  const pool = images[type] || images.success;

  for (let i = 0; i < count; i++) {
    const el = document.createElement('div');
    const img = pool[Math.floor(Math.random() * pool.length)];
    const size = 16 + Math.random() * 16;
    const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.5;
    const dist = 60 + Math.random() * 80;
    const dx = Math.cos(angle) * dist;
    const dy = Math.sin(angle) * dist;
    const dur = 400 + Math.random() * 400;

    el.style.cssText = `
      position: absolute; pointer-events: none; z-index: 20;
      width: ${size}px; height: ${size}px;
      left: 50%; top: 50%;
      margin-left: -${size / 2}px; margin-top: -${size / 2}px;
      background: url(${img}) center/contain no-repeat;
      opacity: ${type === 'fail' ? 0.5 : 1};
      animation: particleFly ${dur}ms ease-out forwards;
      --dx: ${dx}px; --dy: ${dy}px;
    `;
    container.appendChild(el);
    setTimeout(() => el.remove(), dur + 50);
  }
}

/* ─── GLOW FLASH ─── */

export function glowFlash(el: HTMLElement, color: string = '#10b981'): void {
  el.style.transition = 'box-shadow 0.15s ease';
  el.style.boxShadow = `0 0 30px ${color}`;
  setTimeout(() => {
    el.style.boxShadow = '';
  }, 400);
}

/* ─── MUSIC MANAGER — UNE SEULE SOURCE À LA FOIS ─── */

const SOUNDTRACK_PATHS = [
  '/audio/soundtrack-1.mp3',
  '/audio/soundtrack-2.mp3',
  '/audio/soundtrack-3.mp3',
  '/audio/soundtrack-4.mp3',
  '/audio/soundtrack-5.mp3',
  '/audio/soundtrack-6.mp3',
  '/audio/soundtrack-explore-the-fire.mp3',
];

let MUSIC_VOLUME = CONFIG.music?.volume ?? 0.38;       // Volume cible
const FADE_IN_SEC  = CONFIG.music?.fadeInSec ?? 2.5;     // Durée fondu ouverture
const FADE_OUT_SEC = CONFIG.music?.fadeOutSec ?? 1.8;    // Durée fondu fermeture

let musicActive = false;
let currentAudio: HTMLAudioElement | null = null;
let currentGain: GainNode | null = null;
let currentSource: MediaElementAudioSourceNode | null = null;
let trackIndex = 0;
let playlist: string[] = [];
let autoAdvance = false;      // true = playlist, false = single track
let fadeCleanupTimer: ReturnType<typeof setTimeout> | null = null;

export function isAmbientPlaying(): boolean {
  return musicActive;
}

/** Nettoie la piste en cours (fade out + déconnexion). */
function killCurrentSource(): void {
  if (fadeCleanupTimer) { clearTimeout(fadeCleanupTimer); fadeCleanupTimer = null; }

  // Fade out sur le gain existant
  if (currentGain && audioCtx) {
    const ctx = audioCtx;
    const g = currentGain;
    g.gain.cancelScheduledValues(ctx.currentTime);
    g.gain.setValueAtTime(g.gain.value, ctx.currentTime);
    g.gain.linearRampToValueAtTime(0, ctx.currentTime + FADE_OUT_SEC);
  }

  // Déconnexion propre après le fondu
  fadeCleanupTimer = setTimeout(() => {
    if (currentAudio) {
      currentAudio.onended = null;
      currentAudio.pause();
      currentAudio = null;
    }
    if (currentSource) {
      try { currentSource.disconnect(); } catch { /* ignore */ }
      currentSource = null;
    }
    if (currentGain) {
      try { currentGain.disconnect(); } catch { /* ignore */ }
      currentGain = null;
    }
  }, (FADE_OUT_SEC + 0.1) * 1000);
}

/* ─── MAPPING SAISON → PISTE ───
 * Les saisons pointent vers des pistes RÉELLES (les soundtracks existants).
 * (Auparavant : ambient-{saison}.mp3, fichiers absents → la musique mourait en
 *  silence dès le 1er changement de saison. Bug corrigé itér.69.) */

const SEASON_TRACKS: Record<string, string> = {
  'Réveil':      '/audio/soundtrack-1.mp3',
  'Désert':      '/audio/soundtrack-5.mp3',
  'Persécution': '/audio/soundtrack-explore-the-fire.mp3',
  'Abondance':   '/audio/soundtrack-3.mp3',
  'Grâce':       '/audio/soundtrack-2.mp3',
};

/** Piste réelle pour une saison donnée (null si saison inconnue/absente). */
export function seasonTrackPath(season: string | null | undefined): string | null {
  if (!season) return null;
  return SEASON_TRACKS[season] ?? null;
}

/* ─── ALBUMS — le joueur peut figer une ambiance pour sa partie ─── */

export interface MusicAlbum { id: string; label: string; sub: string }

/** Catalogue d'albums proposé au joueur. 'auto' = réactif à la saison,
 *  'shuffle' = toutes les pistes au hasard, le reste = une piste fixe en boucle. */
export const MUSIC_ALBUMS: MusicAlbum[] = [
  { id: 'auto',    label: 'Auto',             sub: 'La musique suit la saison de vie' },
  { id: 'shuffle', label: 'Aléatoire',        sub: 'Toutes les pistes, au hasard' },
  { id: 'st1',     label: 'Ambiance I',       sub: 'Recueillement' },
  { id: 'st2',     label: 'Ambiance II',      sub: 'Grâce' },
  { id: 'st3',     label: 'Ambiance III',     sub: 'Élévation' },
  { id: 'st4',     label: 'Ambiance IV',      sub: 'Marche' },
  { id: 'st5',     label: 'Ambiance V',       sub: 'Désert' },
  { id: 'st6',     label: 'Ambiance VI',      sub: 'Veillée' },
  { id: 'fire',    label: 'Explore the Fire', sub: 'Combat' },
];

const ALBUM_TRACKS: Record<string, string> = {
  st1:  '/audio/soundtrack-1.mp3',
  st2:  '/audio/soundtrack-2.mp3',
  st3:  '/audio/soundtrack-3.mp3',
  st4:  '/audio/soundtrack-4.mp3',
  st5:  '/audio/soundtrack-5.mp3',
  st6:  '/audio/soundtrack-6.mp3',
  fire: '/audio/soundtrack-explore-the-fire.mp3',
};

/** Piste fixe d'un album (fallback : 1ʳᵉ piste de la playlist). */
export function albumTrack(id: string): string {
  return ALBUM_TRACKS[id] ?? SOUNDTRACK_PATHS[0];
}

const ALBUM_KEY = 'elias-music-album';

/** Album choisi, persisté entre les sessions (défaut : 'auto'). */
export function getStoredAlbum(): string {
  try { return localStorage.getItem(ALBUM_KEY) || 'auto'; } catch { return 'auto'; }
}

export function storeAlbum(id: string): void {
  try { localStorage.setItem(ALBUM_KEY, id); } catch { /* ignore */ }
}

/** Joue UNE piste — stop ce qui jouait avant. */
function playTrack(path: string, fadeIn = true, loop = false): void {
  if (!audioCtx || !musicActive) return;
  const ctx = audioCtx;

  // Tuer la précédente
  killCurrentSource();

  const audio = new Audio(path);
  audio.crossOrigin = 'anonymous';
  audio.preload = 'auto';
  audio.loop = loop;

  const source = ctx.createMediaElementSource(audio);
  const gain = ctx.createGain();

  gain.gain.value = fadeIn ? 0 : MUSIC_VOLUME;
  if (fadeIn) {
    gain.gain.linearRampToValueAtTime(MUSIC_VOLUME, ctx.currentTime + FADE_IN_SEC);
  }

  source.connect(gain).connect(getMasterOutput());
  audio.play().catch(() => { /* autoplay blocked or 404 — ignore */ });

  // Fin de piste : avance dans la playlist (sauf si loop activé)
  audio.onended = () => {
    if (!musicActive || !autoAdvance || playlist.length === 0) return;
    trackIndex = (trackIndex + 1) % playlist.length;
    playTrack(playlist[trackIndex], true);
  };

  currentAudio  = audio;
  currentSource = source;
  currentGain   = gain;
}

function _handleVisibility() {
  if (document.hidden) {
    if (currentAudio) currentAudio.pause();
  } else {
    if (musicActive && currentAudio) currentAudio.play().catch(() => {});
  }
}

/* ─── EXPORTS PUBLICS ─── */

/** Joue le thème du menu (une seule fois, pas de boucle). */
export function playTheme(): void {
  autoAdvance = false;
  playlist = [];

  if (!musicActive) {
    musicActive = true;
    if (audioCtx?.state === 'suspended') audioCtx.resume();
    document.addEventListener('visibilitychange', _handleVisibility);
  }

  playTrack('/audio/theme.mp3', true);
}

/** Joue la playlist en shuffle (musique d'ambiance). Stop le thème s'il jouait.
 *  Le crossfade saisonnier est géré par le useEffect dans App.tsx. */
export function startAmbient(): void {
  if (!musicActive) {
    musicActive = true;
    if (audioCtx?.state === 'suspended') audioCtx.resume();
    document.addEventListener('visibilitychange', _handleVisibility);
  }

  autoAdvance = true;
  playlist = [...SOUNDTRACK_PATHS];
  trackIndex = Math.floor(Math.random() * playlist.length);
  playTrack(playlist[trackIndex], true);
}

/**
 * Joue la piste d'une saison en boucle (loop). Utilisé quand les fichiers
 * ambient-{season}.mp3 existeront dans public/audio/.
 * Si le fichier n'existe pas, le .catch() silencieux gère l'erreur.
 */
export function playSeasonTrack(seasonName: string): void {
  const path = SEASON_TRACKS[seasonName];
  if (!path) return;

  autoAdvance = false;
  playlist = [];

  if (!musicActive) {
    musicActive = true;
    if (audioCtx?.state === 'suspended') audioCtx.resume();
    document.addEventListener('visibilitychange', _handleVisibility);
  }

  playTrack(path, true, true); // loop = true, la piste tourne jusqu'à la prochaine saison
}

/** Crossfade vers une piste quelconque (transition de saison / album figé).
 *  `loop` : true pour qu'une piste fixe tourne jusqu'au prochain changement. */
export function crossfadeTo(path: string, loop = false): void {
  if (!path) return;

  autoAdvance = false;
  playlist = [];

  if (!musicActive) {
    musicActive = true;
    if (audioCtx?.state === 'suspended') audioCtx.resume();
    document.addEventListener('visibilitychange', _handleVisibility);
  }

  playTrack(path, true, loop);
}

/** Arrête toute musique. */
export function stopAmbient(): void {
  if (!musicActive) return;
  musicActive = false;
  autoAdvance = false;
  playlist = [];

  killCurrentSource();
  document.removeEventListener('visibilitychange', _handleVisibility);
}

export function stopTheme(): void {
  // Alias : stopAmbient fait la même chose (une seule source)
  stopAmbient();
}

export function setAmbientPlaybackRate(rate: number): void {
  if (!currentAudio) return;
  const clamped = Math.max(0.8, Math.min(1.2, rate));
  const current = currentAudio.playbackRate;
  const steps = 20;
  const delta = (clamped - current) / steps;
  let i = 0;
  const ramp = setInterval(() => {
    if (!currentAudio || i >= steps) { clearInterval(ramp); return; }
    currentAudio.playbackRate = Math.max(0.8, Math.min(1.2, currentAudio.playbackRate + delta));
    i++;
  }, 100);
}

export function setAmbientVolume(v: number): void {
  MUSIC_VOLUME = Math.max(0, Math.min(1, v));
  if (currentGain && audioCtx) {
    currentGain.gain.cancelScheduledValues(audioCtx.currentTime);
    currentGain.gain.setValueAtTime(MUSIC_VOLUME, audioCtx.currentTime);
  }
}

export function getAmbientVolume(): number {
  return MUSIC_VOLUME;
}

/* ─── INIT ─── */

let initPromise: Promise<void> | null = null;

export async function initJuice(): Promise<void> {
  if (initPromise) return initPromise;
  initPromise = (async () => {
    try { await initAudio(); } catch { /* no audio */ }
  })();
  return initPromise;
}

export function playSound(name: string, volume?: number, rate?: number): void {
  play(name, volume, rate);
}

export function playSuccess(): void {
  playProcedural('success');
  play('click-b', 0.3, 1.2);
}

export function playFail(): void {
  playProcedural('fail');
  play('switch-b', 0.4, 0.8);
}

export function playCombo(): void {
  playProcedural('combo');
  play('tap-a', 0.2, 1.5);
}

export function playClick(): void {
  play('click-a', 0.3, 0.92 + Math.random() * 0.16);
}

export function playLevelUp(): void {
  playProcedural('levelup');
  play('switch-a', 0.3, 1.3);
}
