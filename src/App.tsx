import { useEffect, useState, useRef, useMemo, lazy, Suspense } from 'react';
import { useGameStore } from './stores/gameStore';
import { StatBar } from './components/StatBar';
import { FlowBar } from './components/FlowBar';
import { VerseChoices } from './components/VerseChoices';
import { EliasPortrait } from './components/EliasPortrait';
import { getVerseById } from './data/verses';
import { computeFinalMetrics, determineTitle, SPIRITUAL_SEASONS } from './engine/gameEngine';
import {
  ENEMY_COMPONENTS,
  Crown,
  Church,
  BookOpen,
  Award,
  Star,
  Zap,
  Music,
  Moon,
  RotateCw,
} from './components/IconSystem';
import { DebugView } from './components/DebugView';
import { Onboarding } from './components/Onboarding';
import { Prologue } from './components/Prologue';
import type { PrologueResult } from './components/Prologue';
import { ArcTracker } from './components/ArcTracker';
import { DailyVerse } from './components/DailyVerse';
import { MainMenu } from './components/MainMenu';

const CodexMenu  = lazy(() => import('./components/CodexMenu').then(m => ({ default: m.CodexMenu })));
const LexiconMenu = lazy(() => import('./components/LexiconMenu').then(m => ({ default: m.LexiconMenu })));
import { loadGame, hasSeenOnboarding, markOnboardingDone } from './data/persistence';
import { initJuice, playSuccess, playFail, playClick, playCombo, playLevelUp, screenShake, spawnParticles, setShakeContainer, glowFlash, startAmbient, stopAmbient, isAmbientPlaying, setAmbientPlaybackRate, playTheme, crossfadeTo, playSeasonTrack } from './engine/juice';
import { isAiEnabled, generateJournalEntry, generateDynamicEvent, pickVerseForAge } from './services/aiNarrator';
import DevPanel from './components/DevPanel';
import { pickDecoys } from './data/events';
import { ShareCard } from './components/ShareCard';
import { ActionPanel } from './components/ActionPanel';
import type { AfflictionEvent } from './types/game';
import './index.css';

function BackgroundParticles() {
  const particles = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      size: `${1 + Math.random() * 2}px`,
      duration: `${8 + Math.random() * 12}s`,
      delay: `${Math.random() * 10}s`,
      opacity: `${0.2 + Math.random() * 0.3}`,
    }));
  }, []);

  return (
    <div id="bg-particles">
      {particles.map((p) => (
        <div
          key={p.id}
          className="particle"
          style={{
            left: p.left,
            width: p.size,
            height: p.size,
            opacity: p.opacity,
            animationDuration: p.duration,
            animationDelay: p.delay,
          }}
        />
      ))}
    </div>
  );
}

function App() {
  const {
    age,
    phase,
    difficulty,
    combo,
    totalEvents,
    successRate,
    flow,
    crisesRemaining,
    currentEvent,
    lastEventResult,
    gameOver,
    currentTitle,
    inheritance,
    codex,
    stats,
    lifeContext,
    parentNames,
    actionsThisYear,
    spiritualSeason,
    initGame,
    startWithPrologue,
    ageUp,
    dismissResult,
    hydrateFromSave,
  } = useGameStore();

  const [showResult, setShowResult] = useState(false);
  const [showVerseConfirm, setShowVerseConfirm] = useState(false);
  const [showCodex, setShowCodex] = useState(false);
  const [showLexicon, setShowLexicon] = useState(false);
  const [showMainMenu, setShowMainMenu] = useState(false);
  const [showNewGameConfirm, setShowNewGameConfirm] = useState(false);
  const [showPrologue, setShowPrologue] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [loading, setLoading] = useState(true);
  const [ambientOn, setAmbientOn] = useState(false);
  const [showShareCard, setShowShareCard] = useState(false);
  const [showLifeReview, setShowLifeReview] = useState(false);
  // Accessibilité
  const [dyslexicMode, setDyslexicMode] = useState(false);
  const [reducedSounds, setReducedSounds] = useState(false);
  const [slowTimer, setSlowTimer] = useState(false);
  const journalRef = useRef<HTMLDivElement>(null);
  const gameOverSoundPlayed = useRef(false);

  // ── IA narrative ──────────────────────────────────────────────────────────
  type AiJournalEntry = { age: number; text: string; generating: boolean };
  const [aiJournalEntries, setAiJournalEntries] = useState<AiJournalEntry[]>([]);
  const [pendingAiEvent, setPendingAiEvent] = useState<AfflictionEvent | null>(null);
  const [generatingAiEvent, setGeneratingAiEvent] = useState(false);

  const state = useGameStore.getState();
  // Init juice + load save + onboarding
  useEffect(() => {
    async function init() {
      initJuice();
      playTheme();
      const seen = await hasSeenOnboarding();
      if (!seen) {
        setShowOnboarding(true);
      } else {
        const saved = await loadGame();
        if (saved) hydrateFromSave(saved);
      }
      // Charger les préférences d'accessibilité
      try {
        const prefsRaw = localStorage.getItem('accessibility-prefs');
        if (prefsRaw) {
          const prefs = JSON.parse(prefsRaw);
          setDyslexicMode(prefs.dyslexicMode ?? false);
          setReducedSounds(prefs.reducedSounds ?? false);
          setSlowTimer(prefs.slowTimer ?? false);
        }
      } catch {}
      setLoading(false);
    }
    init();
  }, []);

  // Appliquer la classe dyslexic-mode sur #root
  useEffect(() => {
    const root = document.getElementById('root');
    if (!root) return;
    if (dyslexicMode) {
      root.classList.add('dyslexic-mode');
    } else {
      root.classList.remove('dyslexic-mode');
    }
    // Sauvegarder les préférences
    localStorage.setItem('accessibility-prefs', JSON.stringify({ dyslexicMode, reducedSounds, slowTimer }));
  }, [dyslexicMode, reducedSounds, slowTimer]);

  // Appliquer slow-timer sur game-container
  useEffect(() => {
    const container = document.getElementById('game-container');
    if (!container) return;
    if (slowTimer) {
      container.classList.add('slow-timer');
    } else {
      container.classList.remove('slow-timer');
    }
  }, [slowTimer]);

  // Appliquer reducedSounds
  useEffect(() => {
    if (reducedSounds) {
      stopAmbient();
      setAmbientOn(false);
    }
  }, [reducedSounds]);

  const journal = state.journal;

  // Scroll journal
  useEffect(() => {
    if (!showResult && phase === 'idle') {
      journalRef.current?.scrollTo({
        top: journalRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  });

  // Result flash + juice
  const containerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (containerRef.current) setShakeContainer(containerRef.current);
  }, []);

  useEffect(() => {
    if (phase === 'result' && lastEventResult) {
      if (lastEventResult === 'success') {
        playSuccess();
        // Haptic feedback : succès
        try { navigator.vibrate([5, 50, 10]); } catch {}
        if (containerRef.current) {
          spawnParticles(containerRef.current, 'success', 10);
          glowFlash(containerRef.current, 'rgba(16, 185, 129, 0.3)');
        }
        setShowResult(true);
        const timer = setTimeout(() => {
          setShowResult(false);
          dismissResult();
        }, 1500);
        return () => clearTimeout(timer);
      } else {
        // Échec → confirmation manuelle, le joueur doit lire le verset
        playFail();
        // Haptic feedback : échec
        try { navigator.vibrate(20); } catch {}
        screenShake(6, 400);
        if (containerRef.current) {
          spawnParticles(containerRef.current, 'fail', 6);
        }
        setShowVerseConfirm(true);
      }
    }
  }, [phase, lastEventResult]);

  // Combo sound
  const prevCombo = useRef(0);
  useEffect(() => {
    if (combo >= 5 && combo > prevCombo.current) {
      playCombo();
      if (containerRef.current) {
        spawnParticles(containerRef.current, 'combo', 5);
      }
    }
    prevCombo.current = combo;
  }, [combo]);

  // Level up sound
  const prevAge = useRef(0);
  useEffect(() => {
    if (age > 0 && age !== prevAge.current && [15, 25, 60, 80].includes(age)) {
      playLevelUp();
    }
    prevAge.current = age;
  }, [age]);

  // Reset game-over sound guard when a new game begins
  useEffect(() => {
    if (!gameOver?.isOver) {
      gameOverSoundPlayed.current = false;
      setShowShareCard(false);
      setShowLifeReview(false);
    }
  }, [gameOver?.isOver]);

  // Dynamic music: slow the track slightly when any stat is critically low
  useEffect(() => {
    if (!ambientOn) return;
    const min = Math.min(stats.foi, stats.paix, stats.physique, stats.finances);
    setAmbientPlaybackRate(min <= 20 ? 0.92 : min <= 35 ? 0.96 : 1.0);
  }, [stats, ambientOn]);

  // Season crossfade: quand la saison spirituelle change, bascule la piste
  // Les fichiers ambient-*.mp3 doivent exister dans public/audio/
  // Si absents, le .catch() silencieux gère l'erreur (rien ne joue)
  useEffect(() => {
    if (!ambientOn || !spiritualSeason) return;
    const seasonSlug = spiritualSeason
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // enlève accents
      .toLowerCase();
    crossfadeTo(`/audio/ambient-${seasonSlug}.mp3`);
  }, [spiritualSeason, ambientOn]);

  // ── Journal vivant : entrée IA à chaque anniversaire ─────────────────────
  useEffect(() => {
    if (!isAiEnabled() || age === 0 || phase === 'gameover') return;
    const s = useGameStore.getState();
    const recentTitles = s.journal
      .filter((e) => e.type !== 'milestone')
      .slice(-5)
      .map((e) => e.text.replace(/^\d+a\s+/, '').split('.')[0]);

    // Ajouter un placeholder "en génération..."
    setAiJournalEntries((prev) => [
      ...prev.filter((e) => e.age !== age),
      { age, text: '', generating: true },
    ]);

    generateJournalEntry(age, stats, recentTitles, successRate, lifeContext, parentNames, actionsThisYear)
      .then((text) => {
        if (!text) {
          setAiJournalEntries((prev) => prev.filter((e) => !(e.age === age && e.generating)));
          return;
        }
        setAiJournalEntries((prev) =>
          prev.map((e) => (e.age === age && e.generating ? { age, text, generating: false } : e))
        );
      })
      .catch(() =>
        setAiJournalEntries((prev) => prev.filter((e) => !(e.age === age && e.generating)))
      );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [age]);

  // ── Événements dynamiques : pré-génération en arrière-plan ───────────────
  useEffect(() => {
    if (!isAiEnabled() || phase !== 'idle' || generatingAiEvent || pendingAiEvent) return;
    // 1 chance sur 3 de générer un événement IA pour la prochaine fois
    if (Math.random() > 0.33) return;

    setGeneratingAiEvent(true);
    generateDynamicEvent(age, stats, lifeContext, parentNames)
      .then((narrative) => {
        if (!narrative) { setGeneratingAiEvent(false); return; }
        const event: AfflictionEvent = {
          id:              `ai-${Date.now()}`,
          title:           narrative.title,
          description:     narrative.description,
          ageRange:        [age, age + 2],
          category:        narrative.category,
          correctVerseId:  narrative.verseId,
          decoyVerseIds:   pickDecoys(narrative.verseId, narrative.category),
          statImpactOnFail: { foi: -3, paix: -3, physique: -1, finances: -1 },
          thematicFlavor:  narrative.thematicFlavor,
        };
        setPendingAiEvent(event);
        setGeneratingAiEvent(false);
      })
      .catch(() => setGeneratingAiEvent(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  // Enemy SVG component for current event
  const EnemySvg = currentEvent
    ? ENEMY_COMPONENTS[currentEvent.category]
    : null;

  // ─── GAME OVER ───
  if (gameOver?.isOver) {
    const isVictory = gameOver.reason === 'victory';
    if (!gameOverSoundPlayed.current) {
      gameOverSoundPlayed.current = true;
      if (isVictory) playLevelUp();
      else playFail();
    }
    const unlockedCount = Object.values(codex).filter((c) => c.unlocked).length;
    const metrics = computeFinalMetrics(state);
    const title = determineTitle(metrics);

    // Merge journal for life review
    type MixedEntry =
      | { kind: 'normal'; i: number; age: number; type: string; text: string }
      | { kind: 'ai'; age: number; text: string };
    const normalEntries: MixedEntry[] = state.journal.map((e, i) => ({
      kind: 'normal', i, age: e.age ?? 0, type: e.type, text: e.text,
    }));
    const aiEntries: MixedEntry[] = aiJournalEntries
      .filter(e => !e.generating)
      .map(e => ({ kind: 'ai', age: e.age, text: e.text }));
    const mergedJournal = [...normalEntries, ...aiEntries].sort((a, b) => a.age - b.age);

    const handleExportJournal = async () => {
      const lines = [
        `=== La vie d'Élias ===`,
        `Âge : ${age} ans · Réussite : ${successRate}% · Combo max : ×${state.maxCombo}`,
        ...(title ? [`Titre : ${title.name}`] : []),
        '',
        ...mergedJournal.map(e =>
          e.kind === 'normal'
            ? `${e.age}a : ${e.text}`
            : `${e.age}a ✦ ${e.text}`
        ),
        '',
        `Joue Élias ➜ ${window.location.origin}`,
      ].join('\n');
      try {
        await navigator.clipboard.writeText(lines);
      } catch {
        const ta = document.createElement('textarea');
        ta.value = lines;
        ta.style.cssText = 'position:fixed;opacity:0;';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      }
    };

    return (
      <div id="game-container">
        <BackgroundParticles />
        <div id="vignette" />

        {/* Life Review overlay */}
        {showLifeReview ? (
          <div className="life-review-screen">
            <div className="life-review-header">
              <button
                onClick={() => setShowLifeReview(false)}
                className="btn-back-text"
              >
                ← Retour
              </button>
              <div className="life-review-header-title">
                MA VIE
              </div>
              <button
                onClick={handleExportJournal}
                className="btn-copy"
              >
                COPIER
              </button>
            </div>
            <div className="life-review-content">
              {mergedJournal.length === 0 ? (
                <div className="codex-empty-text" style={{ padding: '40px 0' }}>
                  Aucune entrée de journal.
                </div>
              ) : (
                mergedJournal.map((entry, idx) => {
                  if (entry.kind === 'normal') {
                    return (
                      <div key={`r-n-${entry.i}`} className={`journal-entry entry-${entry.type}`}>
                        {entry.type === 'milestone' ? (
                          <span>{entry.text}</span>
                        ) : entry.type === 'micro' ? (
                          <><span className="entry-age-before">{entry.age}a</span>{' '}
                          <span className="entry-separator">·</span>
                          {entry.text}</>
                        ) : (
                          <><span className="entry-age-before">{entry.age}a</span> {entry.text}</>
                        )}
                      </div>
                    );
                  }
                  return (
                    <div key={`r-ai-${idx}`} className="journal-ai-entry">
                      <span className="entry-age-tag">{entry.age}a</span>
                      {' '}<span className="entry-star">✦</span>
                      {entry.text}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        ) : (
          <div id="gameover-screen">
            <div style={{ marginBottom: 8 }}>
              {isVictory
                ? <Crown size={48} strokeWidth={1} style={{ color: 'var(--accent-gold)' }} />
                : <Church size={48} strokeWidth={1} style={{ color: 'var(--text-muted)' }} />
              }
            </div>

            <div className="gameover-title">
              {isVictory ? 'VILLE OUVERTE' : 'COURSE TERMINÉE'}
            </div>

            {title && (
              <div className="title-badge">
                <Star size={14} strokeWidth={1.5} className="inline-icon-no-mr" />
                {title.name}
              </div>
            )}

            <div className="gameover-stats">
              <div>Âge : <strong>{age}</strong> ans</div>
              <div>Épreuves : <strong>{totalEvents}</strong></div>
              <div>Réussite : <strong>{successRate}%</strong></div>
              <div>Combo max : <strong>{state.maxCombo}</strong></div>
              <div>Flow max : <strong>{Math.round(flow.value)}</strong></div>
              <div>Codex : <strong>{unlockedCount}</strong>/{Object.keys(codex).length}</div>
            </div>

            {title && (
              <div className="inheritance-box">
                <div style={{ color: 'var(--accent-gold)', marginBottom: 4, fontWeight: 600 }}>
                  <Award size={12} strokeWidth={1.5} className="inline-icon" />
                  Héritage débloqué
                </div>
                {title.description}<br />
                <span className="bonus-text">
                  Bonus : {Object.entries(title.bonus)
                    .map(([s, v]) => `${s.charAt(0).toUpperCase() + s.slice(1)} +${v}`)
                    .join(' · ')}
                </span>
              </div>
            )}

            {/* Conclusion narrative */}
            <div className="gameover-conclusion" style={{ margin: '16px 0', textAlign: 'center' }}>
              <div style={{ fontSize: 12, color: 'var(--accent-gold)', fontWeight: 600, marginBottom: 8 }}>
                Que retenir de cette vie ?
              </div>
              <div style={{
                fontSize: 14, lineHeight: 1.6, color: 'var(--text-secondary)',
                fontStyle: 'italic', marginBottom: 12,
              }}>
                « {(() => {
                  const titleVerses: Record<string, string> = {
                    'Le Prodige': "Car je connais les projets que j'ai formés sur vous, dit l'Éternel... Jérémie 29.11",
                    'La Star': 'Je puis tout par celui qui me fortifie. Philippiens 4.13',
                    "L'Anakazo": 'Fortifie-toi et prends courage ! Josué 1.9',
                    'Le Fervent': "L'Éternel est ma lumière et mon salut. Psaume 27.1",
                    'Le Combattant': "J'ai combattu le bon combat, j'ai achevé la course. 2 Timothée 4.7",
                    'Le Sage': 'La crainte de l\'Éternel est le commencement de la sagesse. Proverbes 9.10',
                    'Le Survivant': 'Je puis tout par celui qui me fortifie. Philippiens 4.13',
                  };
                  if (title && titleVerses[title.name]) return titleVerses[title.name];
                  const fallbackVerses = [
                    "Car ce n'est pas un esprit de timidité que Dieu nous a donnés... 2 Timothée 1.7",
                    "L'Éternel est ma lumière et mon salut: de qui aurai-je peur ? Psaume 27.1",
                    'Je vous laisse la paix, je vous donne ma paix. Jean 14.27',
                    'Nous savons que toutes choses concourent au bien de ceux qui aiment Dieu. Romains 8.28',
                  ];
                  return fallbackVerses[Math.floor(Math.random() * fallbackVerses.length)];
                })() } »
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.5, marginBottom: 8 }}>
                {(() => {
                  if (stats.foi > 70) return "Élias a marché avec Dieu jusqu'au bout.";
                  if (stats.paix > 70) return "La paix d'Élias a traversé les tempêtes.";
                  if (stats.physique > 70) return 'Élias a combattu le bon combat jusqu\'à la fin.';
                  if (stats.finances > 70) return 'Élias a été fidèle dans les petites et grandes choses.';
                  return "Élias a terminé sa course. La grâce l'attendait au bout du chemin.";
                })()}
              </div>
            </div>

            <DailyVerse />

            {/* Secondary actions */}
            <div className="btn-row">
              <button
                onClick={() => setShowLifeReview(true)}
                className="btn-secondary"
              >
                JOURNAL
              </button>
              <button
                onClick={() => setShowShareCard(true)}
                className="btn-share-alt"
              >
                PARTAGER
              </button>
            </div>

            <button className="btn-restart" onClick={initGame}>
              NOUVELLE PARTIE {title ? '✦ HÉRITAGE' : ''}
            </button>
          </div>
        )}

        {/* Share card modal */}
        {showShareCard && (
          <ShareCard
            age={age}
            successRate={successRate}
            maxCombo={state.maxCombo}
            titleName={title?.name ?? null}
            isVictory={isVictory}
            completedArcsCount={state.completedArcs.length}
            onClose={() => setShowShareCard(false)}
          />
        )}

        {import.meta.env.DEV && <DebugView />}
      </div>
    );
  }

  // ─── MAIN GAME ───
  return (
    <div id="game-container" ref={containerRef}>
      <BackgroundParticles />
      <div id="vignette" />

      {/* Title bar avec burger menu */}
      <div id="title-bar" className="compact">
        <button
          className="burger-btn"
          onClick={() => { playClick(); setShowMainMenu(true); }}
          aria-label="Menu principal"
        >
          <span /><span /><span />
        </button>
        <div className="game-title">
          <Church size={12} strokeWidth={1.5} className="inline-icon-no-mr" style={{ marginRight: 8 }} />
          ÉLIAS
          <Zap size={12} strokeWidth={1.5} className="inline-icon-no-mr" style={{ marginLeft: 8 }} />
        </div>
        <div className="title-spacer" />
      </div>

      <StatBar />
      <FlowBar />
      <ArcTracker />

      <div id="elias-section">
        <EliasPortrait />
        <div className="elias-age-label age-label-column">
          <span><span>{age}</span> ANS</span>
          {(() => {
            let label = 'ENFANT';
            let bg = 'rgba(134,239,172,0.15)';
            let border = 'rgba(134,239,172,0.4)';
            let color = '#86efac';
            if (age >= 80) { label = 'VÉTÉRAN';  bg = 'rgba(251,146,60,0.15)'; border = 'rgba(251,146,60,0.4)'; color = '#fb923c'; }
            else if (age >= 60) { label = 'AÎNÉ'; bg = 'rgba(253,230,138,0.15)'; border = 'rgba(253,230,138,0.4)'; color = '#fde68a'; }
            else if (age >= 30) { label = 'ADULTE'; bg = 'rgba(245,158,11,0.15)'; border = 'rgba(245,158,11,0.4)'; color = '#f59e0b'; }
            else if (age >= 18) { label = 'JEUNE ADULTE'; bg = 'rgba(251,191,36,0.12)'; border = 'rgba(251,191,36,0.35)'; color = '#fbbf24'; }
            else if (age >= 12) { label = 'ADOLESCENT'; bg = 'rgba(147,197,253,0.15)'; border = 'rgba(147,197,253,0.4)'; color = '#93c5fd'; }
            return (
              <span className="life-stage-badge" style={{ background: bg, borderColor: border, color }}>
                {label}
              </span>
            );
          })()}
        </div>
      </div>

      <div id="info-bar">
        <span className="info-bar-item">
          <span>{totalEvents} épreuves · {successRate}%</span>
          {crisesRemaining < 2 && (
            <span title="Grâces de crise restantes" className="crisis-badge" style={{ color: crisesRemaining === 0 ? '#ef4444' : '#f87171' }}>
              {'♡'.repeat(crisesRemaining)}{'♥'.repeat(Math.max(0, 2 - crisesRemaining))}
            </span>
          )}
        </span>
        <span className="info-bar-item">
          {/* Badge saison spirituelle */}
          {(() => {
            const s = SPIRITUAL_SEASONS[spiritualSeason ?? 'Réveil'];
            return (
              <span
                title={`Saison : ${s.label}`}
                className="badge-season"
                style={{
                  border: `1px solid ${s.color}55`,
                  background: `${s.color}18`,
                  color: s.color,
                }}
              >
                {s.icon} {s.label}
              </span>
            );
          })()}
          {combo > 2 && (() => {
            const nextMilestone = combo < 5 ? 5 : combo < 10 ? 10 : combo < 20 ? 20 : null;
            const tierColor = combo >= 20 ? '#a78bfa' : combo >= 10 ? '#fb923c' : combo >= 5 ? '#fbbf24' : '#f59e0b';
            return (
              <span className="combo-badge" style={{ background: `linear-gradient(135deg, ${tierColor}, #92400e)`, fontSize: combo >= 10 ? 13 : 11, padding: combo >= 5 ? '4px 14px' : '3px 12px' }}>
                <Zap size={combo >= 10 ? 13 : 11} strokeWidth={2} className="inline-icon-no-mr" />
                x{combo}
                {nextMilestone && <span className="combo-next">{nextMilestone}</span>}
              </span>
            );
          })()}
          {/* Raccourcis rapides — menu complet via burger */}
          <button
            onClick={() => { playClick(); setShowCodex(true); }}
            title="Codex des versets"
            className="btn-codex"
          >
            <BookOpen size={10} strokeWidth={1.5} />
            CODEX
          </button>
          <button
            onClick={() => {
              const next = !ambientOn;
              setAmbientOn(next);
              next ? startAmbient() : stopAmbient();
            }}
            title={ambientOn ? 'Couper la musique' : 'Activer la musique'}
            className="btn-music"
            style={{ background: ambientOn ? 'rgba(245,158,11,0.15)' : 'var(--bg-card)' }}
          >
            <img
              src={ambientOn
                ? '/ui/travelbook/UI_TravelBook_IconPause01a.png'
                : '/ui/travelbook/UI_TravelBook_IconPlay01a.png'}
              alt={ambientOn ? 'pause' : 'play'}
              className="music-icon"
              style={{
                filter: ambientOn
                  ? 'brightness(2) saturate(2) hue-rotate(260deg)'
                  : 'brightness(1.5) saturate(0.5)',
              }}
            />
          </button>
        </span>
      </div>

      <div id="content-area">
        {/* Enemy SVG background */}
        {EnemySvg && phase === 'event' && (
          <div id="enemy-overlay">
            <EnemySvg size={140} />
          </div>
        )}

        {/* Journal toujours visible */}
        <div
          ref={journalRef}
          id="journal-area"
          className={phase === 'result' ? 'journal-area-dimmed' : 'journal-area-normal'}
        >
          {journal.length === 0 ? (
            <div className="journal-empty">
              Le voyage d'Élias commence...
            </div>
          ) : (
            (() => {
              // Fusionner entrées normales + entrées IA, triées par âge
              type MixedEntry =
                | { kind: 'normal'; i: number; age: number; type: string; text: string }
                | { kind: 'ai'; age: number; text: string; generating: boolean };

              const normal: MixedEntry[] = journal.map((e, i) => ({
                kind: 'normal', i, age: e.age ?? 0, type: e.type, text: e.text,
              }));
              const ai: MixedEntry[] = aiJournalEntries.map((e) => ({
                kind: 'ai', age: e.age, text: e.text, generating: e.generating,
              }));
              const all = [...normal, ...ai].sort((a, b) => a.age - b.age);

              return all.map((entry, idx) => {
                if (entry.kind === 'normal') {
                  return (
                    <div key={`n-${entry.i}`} className={`journal-entry entry-${entry.type}`}>
                      {entry.type === 'milestone' ? (
                        <span>{entry.text}</span>
                      ) : entry.type === 'micro' ? (
                        <><span className="entry-age-before">{entry.age}a</span>{' '}
                        <span className="entry-separator">·</span>
                        {entry.text}</>
                      ) : (
                        <><span className="entry-age-before">{entry.age}a</span> {entry.text}</>
                      )}
                    </div>
                  );
                }
                // Entrée IA
                return (
                  <div key={`ai-${idx}`} className={`journal-ai-entry${entry.generating ? ' generating' : ''}`}>
                    {entry.generating ? (
                      <span className="entry-age-tag">
                        <span>{entry.age}a</span> ✦ Élias écrit dans son journal...
                      </span>
                    ) : (
                      <>
                        <span className="entry-age-tag">{entry.age}a</span>
                        {' '}
                        <span className="entry-star">✦</span>
                        {entry.text}
                      </>
                    )}
                  </div>
                );
              });
            })()
          )}
        </div>

        {/* Choices overlay pendant un événement */}
        {phase === 'event' && (
          <div id="choices-area">
            <VerseChoices />
          </div>
        )}
      </div>

      {/* Succès flash (auto-dismiss) */}
      {showResult && currentEvent && (
        <div className="result-flash success">
          <div className="result-flash-icon" style={{ color: 'var(--success)' }}>✦</div>
          <div className="result-verse" style={{ color: 'var(--success)' }}>VICTOIRE</div>
        </div>
      )}

      {/* Échec — confirmation manuelle avec verset complet */}
      {showVerseConfirm && currentEvent && (() => {
        const verse = getVerseById(currentEvent.correctVerseId);
        return (
          <div className="verse-confirm-overlay">
            <div className="result-flash-icon" style={{ color: 'var(--danger)' }}>✕</div>

            <div className="verse-fail-label">
              Épreuve non surmontée
            </div>

            {/* Carte verset */}
            <div className="verse-confirm-card">
              <div className="verse-confirm-label">
                La bonne réponse
              </div>
              <div className="verse-ref-text">
                {verse?.reference}
              </div>
              <div className="verse-body-text">
                « {verse?.text} »
              </div>
              <div className="verse-category-line">
                Catégorie : {currentEvent.category.replace(/_/g, ' ')}
              </div>
            </div>

            <button
              onClick={() => { setShowVerseConfirm(false); dismissResult(); }}
              className="btn-primary"
            >
              J'AI COMPRIS{' '}
              <img
                src="/ui/travelbook/UI_TravelBook_IconTick01a.png"
                alt="✓"
                className="tick-icon"
              />
            </button>

            <div className="verse-confirm-footer">
              Le verset est ajouté à ton Codex pour révision
            </div>
          </div>
        );
      })()}

      {age >= 8 && <ActionPanel />}

      <div id="action-area">
        {phase === 'idle' && (
          <button className="btn-age" onClick={() => {
            playClick();
            ageUp(pendingAiEvent ?? undefined);
            setPendingAiEvent(null);
          }}>
            +1 ÂGE SUIVANT
          </button>
        )}
      </div>

      <Suspense fallback={null}>
        {showCodex && <CodexMenu onClose={() => setShowCodex(false)} />}
        {showLexicon && <LexiconMenu onClose={() => setShowLexicon(false)} />}
      </Suspense>

      {/* Menu burger principal */}
      {showMainMenu && (
        <MainMenu
          onClose={() => setShowMainMenu(false)}
          onOpenCodex={() => setShowCodex(true)}
          onOpenLexicon={() => setShowLexicon(true)}
          onNewGame={() => { setShowMainMenu(false); setShowNewGameConfirm(true); }}
          ambientOn={ambientOn}
          onToggleAmbient={() => {
            const next = !ambientOn;
            setAmbientOn(next);
            next ? startAmbient() : stopAmbient();
          }}
          currentTitle={currentTitle?.name ?? null}
          age={age}
          successRate={successRate}
          dyslexicMode={dyslexicMode}
          reducedSounds={reducedSounds}
          slowTimer={slowTimer}
          onToggleDyslexic={() => {
            setDyslexicMode((prev) => !prev);
            playClick();
          }}
          onToggleReducedSounds={() => {
            const next = !reducedSounds;
            setReducedSounds(next);
            if (next) {
              stopAmbient();
              setAmbientOn(false);
            }
            playClick();
          }}
          onToggleSlowTimer={() => {
            setSlowTimer((prev) => !prev);
            playClick();
          }}
        />
      )}

      {/* Confirmation Nouvelle Partie */}
      {showNewGameConfirm && (
        <div className="confirm-dialog">
          <div className="confirm-dialog-content">
            <RotateCw size={32} strokeWidth={1.5} className="confirm-icon" />
            <div className="confirm-dialog-title">
              NOUVELLE PARTIE
            </div>
            <div className="confirm-dialog-text">
              La partie en cours sera perdue.{currentTitle && (
                <><br /><span className="confirm-inheritance-text">
                  Le titre « {currentTitle.name} » sera préservé comme héritage.
                </span></>
              )}
            </div>
            <div className="btn-row">
              <button
                onClick={() => setShowNewGameConfirm(false)}
                className="btn-cancel"
              >
                ANNULER
              </button>
              <button
                onClick={() => { setShowNewGameConfirm(false); setShowPrologue(true); }}
                className="btn-danger"
              >
                RECOMMENCER
              </button>
            </div>
          </div>
        </div>
      )}

      {import.meta.env.DEV && <DebugView />}

      {/* Prologue interactif */}
      {showPrologue && (
        <Prologue
          onComplete={(result: PrologueResult) => {
            setShowPrologue(false);
            startWithPrologue(result);
          }}
        />
      )}

      {/* Onboarding */}
      {showOnboarding && (
        <Onboarding
          onComplete={() => {
            setShowOnboarding(false);
            markOnboardingDone();
          }}
        />
      )}

      {/* Loading */}
      {loading && (
        <div className="loading-screen">
          CHARGEMENT...
        </div>
      )}

      {import.meta.env.DEV && <DevPanel />}
    </div>
  );
}

export default App;
