import { useEffect, useState, useRef, useMemo } from 'react';
import { useGameStore } from './stores/gameStore';
import { StatBar } from './components/StatBar';
import { FlowBar } from './components/FlowBar';
import { Journal } from './components/Journal';
import { VerseChoices } from './components/VerseChoices';
import { CodexMenu } from './components/CodexMenu';
import { EliasPortrait } from './components/EliasPortrait';
import { getVerseById } from './data/verses';
import { computeFinalMetrics, determineTitle } from './engine/gameEngine';
import {
  ENEMY_COMPONENTS,
  AFFLICTION_ICONS,
  AFFLICTION_COLORS,
  Crown,
  Church,
  BookOpen,
  Award,
  Star,
  Zap,
} from './components/IconSystem';
import { DebugView } from './components/DebugView';
import { Onboarding } from './components/Onboarding';
import { loadGame, hasSeenOnboarding, markOnboardingDone } from './data/persistence';
import { initJuice, playSuccess, playFail, playClick, playCombo, playLevelUp, screenShake, spawnParticles, setShakeContainer, glowFlash } from './engine/juice';
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
    currentEvent,
    lastEventResult,
    gameOver,
    currentTitle,
    inheritance,
    codex,
    stats,
    initGame,
    ageUp,
    dismissResult,
    hydrateFromSave,
  } = useGameStore();

  const [showResult, setShowResult] = useState(false);
  const [showCodex, setShowCodex] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [loading, setLoading] = useState(true);
  const journalRef = useRef<HTMLDivElement>(null);

  const state = useGameStore.getState();
  // Init juice + load save + onboarding
  useEffect(() => {
    async function init() {
      initJuice();
      const seen = await hasSeenOnboarding();
      if (!seen) {
        setShowOnboarding(true);
      } else {
        const saved = await loadGame();
        if (saved) hydrateFromSave(saved);
      }
      setLoading(false);
    }
    init();
  }, []);

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
        if (containerRef.current) {
          spawnParticles(containerRef.current, 'success', 10);
          glowFlash(containerRef.current, 'rgba(16, 185, 129, 0.3)');
        }
      } else {
        playFail();
        screenShake(6, 400);
        if (containerRef.current) {
          spawnParticles(containerRef.current, 'fail', 6);
        }
      }
      setShowResult(true);
      const timer = setTimeout(() => {
        setShowResult(false);
        dismissResult();
      }, 1500);
      return () => clearTimeout(timer);
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

  // Enemy SVG component for current event
  const EnemySvg = currentEvent
    ? ENEMY_COMPONENTS[currentEvent.category]
    : null;

  // ─── GAME OVER ───
  if (gameOver?.isOver) {
    const isVictory = gameOver.reason === 'victory';
    if (isVictory) playLevelUp();
    else playFail();
    const unlockedCount = Object.values(codex).filter((c) => c.unlocked).length;
    const metrics = computeFinalMetrics(state);
    const title = determineTitle(metrics);

    return (
      <div id="game-container">
        <BackgroundParticles />
        <div id="vignette" />
        <div id="gameover-screen">
          <div style={{ marginBottom: 8, color: isVictory ? 'var(--accent-gold)' : 'var(--text-muted)' }}>
            {isVictory
              ? <Crown size={48} strokeWidth={1} />
              : <Church size={48} strokeWidth={1} />
            }
          </div>

          <div className="gameover-title">
            {isVictory ? 'VILLE OUVERTE' : 'COURSE TERMINÉE'}
          </div>

          {title && (
            <div className="title-badge">
              <Star size={14} strokeWidth={1.5} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 6 }} />
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
                <Award size={12} strokeWidth={1.5} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 4 }} />
                Héritage débloqué
              </div>
              {title.description}<br />
              <span style={{ color: 'var(--color-foi)', fontSize: 11 }}>
                Bonus : {Object.entries(title.bonus)
                  .map(([s, v]) => `${s.charAt(0).toUpperCase() + s.slice(1)} +${v}`)
                  .join(' · ')}
              </span>
            </div>
          )}

          <button className="btn-restart" onClick={initGame}>
            NOUVELLE PARTIE {title ? '✦ HÉRITAGE' : ''}
          </button>
        </div>
        <DebugView />
      </div>
    );
  }

  // ─── MAIN GAME ───
  return (
    <div id="game-container" ref={containerRef}>
      <BackgroundParticles />
      <div id="vignette" />

      {/* Title */}
      <div id="title-bar">
        <div className="game-title">
          <Church size={12} strokeWidth={1.5} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 8 }} />
          ÉLIAS
          <Zap size={12} strokeWidth={1.5} style={{ display: 'inline', verticalAlign: 'middle', marginLeft: 8 }} />
        </div>
      </div>

      <StatBar />
      <FlowBar />

      <div id="elias-section">
        <EliasPortrait />
        <div className="elias-age-label">
          <span>{age}</span> ANS · NIVEAU {difficulty}
        </div>
      </div>

      <div id="info-bar">
        <span>{totalEvents} épreuves · {successRate}%</span>
        <span style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {combo > 2 && (
            <span className="combo-badge">
              <Zap size={11} strokeWidth={2} style={{ display: 'inline', verticalAlign: 'middle' }} />
              x{combo}
            </span>
          )}
          <button
            onClick={() => { playClick(); setShowCodex(true); }}
            style={{
              padding: '2px 10px',
              border: '1px solid var(--border-subtle)',
              borderRadius: 12,
              fontSize: 10,
              background: 'var(--bg-card)',
              cursor: 'pointer',
              color: 'var(--text-muted)',
              fontFamily: 'var(--font-body)',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
            }}
          >
            <BookOpen size={10} strokeWidth={1.5} />
            CODEX
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
          style={{ opacity: phase === 'result' ? 0.5 : 1, transition: 'opacity 0.3s' }}
        >
          {journal.length === 0 ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)', fontSize: 12, fontStyle: 'italic' }}>
              Le voyage d'Élias commence...
            </div>
          ) : (
            journal.map((entry, i) => (
              <div key={i} className={`journal-entry entry-${entry.type}`}>
                {entry.type === 'milestone' ? (
                  <span>{entry.text}</span>
                ) : (
                  <><span style={{ opacity: 0.4 }}>{entry.age}a</span> {entry.text}</>
                )}
              </div>
            ))
          )}
        </div>

        {/* Choices overlay pendant un événement */}
        {phase === 'event' && (
          <div id="choices-area">
            <VerseChoices />
          </div>
        )}
      </div>

      {/* Result flash */}
      {showResult && lastEventResult && currentEvent && (
        <div className={`result-flash ${lastEventResult}`}>
          <div style={{ fontSize: 48, marginBottom: 8, color: lastEventResult === 'success' ? 'var(--success)' : 'var(--danger)' }}>
            {lastEventResult === 'success' ? '✦' : '✕'}
          </div>
          <div className="result-verse" style={{ color: lastEventResult === 'success' ? 'var(--success)' : 'var(--danger)' }}>
            {lastEventResult === 'success'
              ? 'VICTOIRE'
              : getVerseById(currentEvent.correctVerseId)?.reference}
          </div>
        </div>
      )}

      <div id="action-area">
        {phase === 'idle' && (
          <button className="btn-age" onClick={() => { playClick(); ageUp(); }}>
            +1 ÂGE SUIVANT
          </button>
        )}
      </div>

      {showCodex && <CodexMenu onClose={() => setShowCodex(false)} />}
      <DebugView />

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
        <div style={{
          position: 'fixed', inset: 0, zIndex: 10000,
          background: '#0f0a1a', display: 'flex',
          alignItems: 'center', justifyContent: 'center',
          fontFamily: "'Cinzel', serif", color: '#7c3aed',
          fontSize: 14, letterSpacing: 2,
        }}>
          CHARGEMENT...
        </div>
      )}
    </div>
  );
}

export default App;
