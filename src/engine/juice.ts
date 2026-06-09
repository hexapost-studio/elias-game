/** Système audio procédural + VFX — Web Audio API + Kenney sounds */

let audioCtx: AudioContext | null = null;
let buffers: Record<string, AudioBuffer> = {};
let loaded = false;

const SOUND_FILES = [
  'click-a', 'click-b', 'switch-a', 'switch-b', 'tap-a', 'tap-b',
];

async function initAudio(): Promise<void> {
  if (loaded) return;
  audioCtx = new AudioContext();
  const promises = SOUND_FILES.map(async (name) => {
    const resp = await fetch(`/sounds/${name}.ogg`);
    const arrayBuf = await resp.arrayBuffer();
    buffers[name] = await audioCtx!.decodeAudioData(arrayBuf);
  });
  await Promise.all(promises);
  loaded = true;
}

function play(name: string, volume: number = 0.5, rate: number = 1.0): void {
  if (!audioCtx || !buffers[name]) return;
  const source = audioCtx.createBufferSource();
  const gain = audioCtx.createGain();
  source.buffer = buffers[name];
  gain.gain.value = volume;
  source.playbackRate.value = rate;
  source.connect(gain).connect(audioCtx.destination);
  source.start(0);
}

/** Sons procéduraux (synthétisés, pas de fichiers) */
function playProcedural(type: 'success' | 'fail' | 'levelup' | 'combo'): void {
  if (!audioCtx) return;
  const ctx = audioCtx;
  const now = ctx.currentTime;

  if (type === 'success') {
    // Rising chime: C5 → E5 → G5
    [523, 659, 784].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0, now + i * 0.08);
      gain.gain.linearRampToValueAtTime(0.15, now + i * 0.08 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 0.3);
      osc.connect(gain).connect(ctx.destination);
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
    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
    osc.connect(gain).connect(ctx.destination);
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
      gain.gain.linearRampToValueAtTime(0.1, now + i * 0.1 + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.1 + 0.4);
      osc.connect(gain).connect(ctx.destination);
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
      gain.gain.setValueAtTime(0.06, now + i * 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.05 + 0.15);
      osc.connect(gain).connect(ctx.destination);
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

/* ─── MUSIQUE D'AMBIANCE — 3 soundtracks MP3 ─── */

const SOUNDTRACK_PATHS = [
  '/audio/soundtrack-1.mp3',
  '/audio/soundtrack-2.mp3',
  '/audio/soundtrack-3.mp3',
];

const AMBIENT_VOLUME = 0.38;  // Volume cible (fond sonore discret)
const FADE_IN_SEC   = 2.5;    // Durée fondu ouverture
const FADE_OUT_SEC  = 1.8;    // Durée fondu fermeture

let ambientRunning = false;
let currentAudio: HTMLAudioElement | null = null;
let ambientGain: GainNode | null = null;
let ambientSource: MediaElementAudioSourceNode | null = null;
let trackIndex = 0;
let fadeOutTimer: ReturnType<typeof setTimeout> | null = null;

export function isAmbientPlaying(): boolean {
  return ambientRunning;
}

/** Charge et joue une piste MP3 dans le contexte Web Audio (pour fade via GainNode). */
function playTrack(path: string, fadeIn = true): void {
  if (!audioCtx || !ambientRunning) return;
  const ctx = audioCtx;

  // Déconnecter la piste précédente si elle existe
  if (ambientSource) {
    try { ambientSource.disconnect(); } catch { /* ignore */ }
    ambientSource = null;
  }
  if (currentAudio) {
    currentAudio.onended = null;
    currentAudio.pause();
    currentAudio = null;
  }

  const audio = new Audio(path);
  audio.crossOrigin = 'anonymous';
  audio.preload = 'auto';

  const source = ctx.createMediaElementSource(audio);
  const gain = ctx.createGain();

  // Fondu entrant
  gain.gain.value = fadeIn ? 0 : AMBIENT_VOLUME;
  if (fadeIn) {
    gain.gain.linearRampToValueAtTime(AMBIENT_VOLUME, ctx.currentTime + FADE_IN_SEC);
  }

  source.connect(gain).connect(ctx.destination);
  audio.play().catch(() => { /* autoplay blocked — ignore */ });

  // Passer à la piste suivante à la fin
  audio.onended = () => {
    if (!ambientRunning) return;
    trackIndex = (trackIndex + 1) % SOUNDTRACK_PATHS.length;
    playTrack(SOUNDTRACK_PATHS[trackIndex], true);
  };

  currentAudio  = audio;
  ambientSource = source;
  ambientGain   = gain;
}

export function startAmbient(): void {
  if (ambientRunning) return;
  ambientRunning = true;

  // Reprendre le contexte audio si suspendu (politique autoplay navigateurs)
  if (audioCtx?.state === 'suspended') audioCtx.resume();

  // Démarrer à une piste aléatoire
  trackIndex = Math.floor(Math.random() * SOUNDTRACK_PATHS.length);
  playTrack(SOUNDTRACK_PATHS[trackIndex], true);
}

export function stopAmbient(): void {
  if (!ambientRunning) return;
  ambientRunning = false;

  // Fondu sortant avant de couper
  if (ambientGain && audioCtx) {
    const ctx = audioCtx;
    const gain = ambientGain;
    gain.gain.cancelScheduledValues(ctx.currentTime);
    gain.gain.setValueAtTime(gain.gain.value, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0, ctx.currentTime + FADE_OUT_SEC);
  }

  // Couper après le fondu
  if (fadeOutTimer) clearTimeout(fadeOutTimer);
  fadeOutTimer = setTimeout(() => {
    if (currentAudio) {
      currentAudio.onended = null;
      currentAudio.pause();
      currentAudio = null;
    }
    if (ambientSource) {
      try { ambientSource.disconnect(); } catch { /* ignore */ }
      ambientSource = null;
    }
    ambientGain = null;
  }, (FADE_OUT_SEC + 0.1) * 1000);
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
  play('click-a', 0.3);
}

export function playLevelUp(): void {
  playProcedural('levelup');
  play('switch-a', 0.3, 1.3);
}
