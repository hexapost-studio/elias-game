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
  Crown,
  Church,
  BookOpen,
  Award,
  Star,
  Zap,
  Music,
  Moon,
} from './components/IconSystem';
import { DebugView } from './components/DebugView';
import { Onboarding } from './components/Onboarding';
import { LexiconMenu } from './components/LexiconMenu';
import { ArcTracker } from './components/ArcTracker';
import { MainMenu } from './components/MainMenu';
import { loadGame, hasSeenOnboarding, markOnboardingDone } from './data/persistence';
import { initJuice, playSuccess, playFail, playClick, playCombo, playLevelUp, screenShake, spawnParticles, setShakeContainer, glowFlash, startAmbient, stopAmbient, isAmbientPlaying } from './engine/juice';
import { AI_AVAILABLE, generateJournalEntry, generateDynamicEvent, pickVerseForAge } from './services/aiNarrator';
import { pickDecoys } from './data/events';
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
  const [showVerseConfirm, setShowVerseConfirm] = useState(false);
  const [showCodex, setShowCodex] = useState(false);
  const [showLexicon, setShowLexicon] = useState(false);
  const [showMainMenu, setShowMainMenu] = useState(false);
  const [showNewGameConfirm, setShowNewGameConfirm] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [loading, setLoading] = useState(true);
  const [ambientOn, setAmbientOn] = useState(false);
  const journalRef = useRef<HTMLDivElement>(null);

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
        setShowResult(true);
        const timer = setTimeout(() => {
          setShowResult(false);
          dismissResult();
        }, 1500);
        return () => clearTimeout(timer);
      } else {
        // Échec → confirmation manuelle, le joueur doit lire le verset
        playFail();
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

  // ── Journal vivant : entrée IA à chaque anniversaire ─────────────────────
  useEffect(() => {
    if (!AI_AVAILABLE || age === 0 || phase === 'gameover') return;
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

    generateJournalEntry(age, stats, recentTitles, successRate)
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
    if (!AI_AVAILABLE || phase !== 'idle' || generatingAiEvent || pendingAiEvent) return;
    // 1 chance sur 3 de générer un événement IA pour la prochaine fois
    if (Math.random() > 0.33) return;

    setGeneratingAiEvent(true);
    generateDynamicEvent(age, stats)
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

      {/* Title bar avec burger menu */}
      <div id="title-bar" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingLeft: 8, paddingRight: 8 }}>
        <button
          className="burger-btn"
          onClick={() => { playClick(); setShowMainMenu(true); }}
          aria-label="Menu principal"
        >
          <span /><span /><span />
        </button>
        <div className="game-title">
          <Church size={12} strokeWidth={1.5} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 8 }} />
          ÉLIAS
          <Zap size={12} strokeWidth={1.5} style={{ display: 'inline', verticalAlign: 'middle', marginLeft: 8 }} />
        </div>
        <div style={{ width: 26 }} />
      </div>

      <StatBar />
      <FlowBar />
      <ArcTracker />

      <div id="elias-section">
        <EliasPortrait />
        <div className="elias-age-label" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
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
        <span>{totalEvents} épreuves · {successRate}%</span>
        <span style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          {combo > 2 && (
            <span className="combo-badge">
              <Zap size={11} strokeWidth={2} style={{ display: 'inline', verticalAlign: 'middle' }} />
              x{combo}
            </span>
          )}
          {/* Raccourcis rapides — menu complet via burger */}
          <button
            onClick={() => { playClick(); setShowCodex(true); }}
            title="Codex des versets"
            style={{
              padding: '2px 9px',
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
          <button
            onClick={() => {
              const next = !ambientOn;
              setAmbientOn(next);
              next ? startAmbient() : stopAmbient();
            }}
            title={ambientOn ? 'Couper la musique' : 'Activer la musique'}
            style={{
              padding: '3px 8px',
              border: '1px solid var(--border-subtle)',
              borderRadius: 10,
              background: ambientOn ? 'rgba(245,158,11,0.15)' : 'var(--bg-card)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
            }}
          >
            <img
              src={ambientOn
                ? '/ui/travelbook/UI_TravelBook_IconPause01a.png'
                : '/ui/travelbook/UI_TravelBook_IconPlay01a.png'}
              alt={ambientOn ? 'pause' : 'play'}
              style={{
                height: 10,
                imageRendering: 'pixelated',
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
          style={{ opacity: phase === 'result' ? 0.5 : 1, transition: 'opacity 0.3s' }}
        >
          {journal.length === 0 ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)', fontSize: 12, fontStyle: 'italic' }}>
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
                      ) : (
                        <><span style={{ opacity: 0.4 }}>{entry.age}a</span> {entry.text}</>
                      )}
                    </div>
                  );
                }
                // Entrée IA
                return (
                  <div key={`ai-${idx}`} style={{
                    padding: '6px 0 6px 10px',
                    borderBottom: '1px solid rgba(245,158,11,0.1)',
                    borderLeft: '2px solid rgba(245,158,11,0.4)',
                    fontSize: 11,
                    lineHeight: 1.65,
                    fontStyle: 'italic',
                    color: entry.generating ? 'var(--text-muted)' : 'var(--text-secondary)',
                    animation: 'fadeIn 0.4s ease',
                    marginBottom: 2,
                  }}>
                    {entry.generating ? (
                      <span style={{ opacity: 0.5 }}>
                        <span style={{ opacity: 0.4 }}>{entry.age}a</span> ✦ Élias écrit dans son journal...
                      </span>
                    ) : (
                      <>
                        <span style={{ opacity: 0.4 }}>{entry.age}a</span>
                        {' '}
                        <span style={{ color: 'rgba(245,158,11,0.6)', marginRight: 4 }}>✦</span>
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
          <div style={{ fontSize: 48, marginBottom: 8, color: 'var(--success)' }}>✦</div>
          <div className="result-verse" style={{ color: 'var(--success)' }}>VICTOIRE</div>
        </div>
      )}

      {/* Échec — confirmation manuelle avec verset complet */}
      {showVerseConfirm && currentEvent && (() => {
        const verse = getVerseById(currentEvent.correctVerseId);
        return (
          <div
            style={{
              position: 'absolute', inset: 0, zIndex: 15,
              background: 'rgba(10,5,20,0.93)',
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              padding: '24px 20px',
              animation: 'fadeIn 0.2s ease',
            }}
          >
            <div style={{ fontSize: 36, marginBottom: 12, color: 'var(--danger)' }}>✕</div>

            <div style={{ fontSize: 11, color: 'var(--danger)', fontWeight: 700, letterSpacing: 1.5, marginBottom: 16, textTransform: 'uppercase' }}>
              Épreuve non surmontée
            </div>

            {/* Carte verset */}
            <div style={{
              width: '100%',
              background: '#f5d4a0',
              borderRadius: 12,
              padding: '20px 18px',
              marginBottom: 20,
              border: '2px solid rgba(139,58,38,0.4)',
              backgroundImage: 'url(/ui/travelbook/UI_TravelBook_BookPageRight01a.png)',
              backgroundSize: 'cover',
              imageRendering: 'pixelated',
            }}>
              <div style={{ fontSize: 10, color: '#8b5a38', fontWeight: 700, letterSpacing: 1, marginBottom: 8, textTransform: 'uppercase' }}>
                La bonne réponse
              </div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 700, color: '#6b2020', marginBottom: 10, letterSpacing: 1 }}>
                {verse?.reference}
              </div>
              <div style={{ fontSize: 13, color: '#3a1f10', lineHeight: 1.75, fontStyle: 'italic' }}>
                « {verse?.text} »
              </div>
              <div style={{ marginTop: 12, fontSize: 10, color: '#8b5a38', borderTop: '1px solid rgba(139,58,38,0.2)', paddingTop: 8 }}>
                Catégorie : {currentEvent.category.replace(/_/g, ' ')}
              </div>
            </div>

            <button
              onClick={() => { setShowVerseConfirm(false); dismissResult(); }}
              style={{
                padding: '14px 40px',
                background: 'var(--accent-violet)',
                border: 'none',
                borderRadius: 12,
                color: 'white',
                fontFamily: 'var(--font-display)',
                fontSize: 13,
                fontWeight: 700,
                letterSpacing: 2,
                cursor: 'pointer',
                boxShadow: '0 0 20px rgba(245,158,11,0.35)',
              }}
            >
              J'AI COMPRIS{' '}
              <img
                src="/ui/travelbook/UI_TravelBook_IconTick01a.png"
                alt="✓"
                style={{ height: 10, imageRendering: 'pixelated', verticalAlign: 'middle', marginLeft: 6,
                  filter: 'brightness(0) invert(1)' }}
              />
            </button>

            <div style={{ marginTop: 10, fontSize: 10, color: 'var(--text-muted)' }}>
              Le verset est ajouté à ton Codex pour révision
            </div>
          </div>
        );
      })()}

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

      {showCodex && <CodexMenu onClose={() => setShowCodex(false)} />}
      {showLexicon && <LexiconMenu onClose={() => setShowLexicon(false)} />}

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
        />
      )}

      {/* Confirmation Nouvelle Partie */}
      {showNewGameConfirm && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 300,
          background: 'rgba(5,2,12,0.9)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: 24, animation: 'fadeIn 0.2s ease',
        }}>
          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid rgba(251,113,133,0.3)',
            borderRadius: 16, padding: '28px 24px',
            maxWidth: 300, width: '100%', textAlign: 'center',
          }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>🔄</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 14, color: '#fb7185', fontWeight: 700, letterSpacing: 1, marginBottom: 8 }}>
              NOUVELLE PARTIE
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: 24 }}>
              La partie en cours sera perdue.{currentTitle && (
                <><br /><span style={{ color: 'var(--accent-gold)' }}>
                  Le titre « {currentTitle.name} » sera préservé comme héritage.
                </span></>
              )}
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={() => setShowNewGameConfirm(false)}
                style={{
                  flex: 1, padding: '12px 0', background: 'transparent',
                  border: '1px solid var(--border-subtle)', borderRadius: 10,
                  color: 'var(--text-muted)', fontFamily: 'var(--font-display)',
                  fontSize: 11, fontWeight: 700, cursor: 'pointer',
                }}
              >
                ANNULER
              </button>
              <button
                onClick={() => { setShowNewGameConfirm(false); initGame(); }}
                style={{
                  flex: 1, padding: '12px 0', background: 'rgba(251,113,133,0.15)',
                  border: '1px solid rgba(251,113,133,0.4)', borderRadius: 10,
                  color: '#fb7185', fontFamily: 'var(--font-display)',
                  fontSize: 11, fontWeight: 700, cursor: 'pointer',
                }}
              >
                RECOMMENCER
              </button>
            </div>
          </div>
        </div>
      )}

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
          background: '#120d07', display: 'flex',
          alignItems: 'center', justifyContent: 'center',
          fontFamily: "'Cinzel', serif", color: '#f59e0b',
          fontSize: 14, letterSpacing: 2,
        }}>
          CHARGEMENT...
        </div>
      )}
    </div>
  );
}

export default App;
