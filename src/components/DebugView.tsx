import { useEffect, useRef, useState } from 'react';
import { useGameStore } from '../stores/gameStore';
import { getVerseById } from '../data/verses';
import '../debug.css';

const FLOW_MAX_TIME = 15;
const STAT_NAMES: Record<string, string> = { foi: 'Foi', paix: 'Paix', physique: 'Physique', finances: 'Finances' };
const STAT_COLORS: Record<string, string> = { foi: '#a78bfa', paix: '#34d399', physique: '#f87171', finances: '#fbbf24' };

export function DebugView() {
  const store = useGameStore();
  const { age, stats, flow, combo, phase, currentEvent, lastEventResult, difficulty, totalEvents, successRate, gameOver, codex, journal, queuedCascadeEvents, inheritance } = store;

  const [visible, setVisible] = useState(false);
  const [timeLeft, setTimeLeft] = useState(FLOW_MAX_TIME);
  const [chosenIds, setChosenIds] = useState<string[]>([]);
  const journalRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Timer
  useEffect(() => {
    if (phase === 'event' && visible) {
      setTimeLeft(FLOW_MAX_TIME);
      setChosenIds([currentEvent!.correctVerseId, ...currentEvent!.decoyVerseIds].sort(() => Math.random() - 0.5));
      timerRef.current = setInterval(() => setTimeLeft(t => Math.max(0, t - 0.1)), 100);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [phase === 'event', visible]);

  useEffect(() => {
    if (visible) journalRef.current?.scrollTo({ top: journalRef.current.scrollHeight, behavior: 'smooth' });
  }, [journal.length, visible]);

  const handleChoose = (verseId: string) => {
    if (lastEventResult) return;
    const timeSpent = FLOW_MAX_TIME - timeLeft;
    store.chooseVerse(verseId, Math.round(timeSpent * 10) / 10);
  };

  const unlockedCount = Object.values(codex).filter(c => c.unlocked).length;

  const hasAnswered = lastEventResult !== null;
  const isUrgent = timeLeft <= 5;

  // --- GAME OVER ---
  if (gameOver?.isOver) {
    return (
      <>
        <button id="debug-toggle" onClick={() => setVisible(v => !v)}>
          {visible ? '✕ FERMER DEBUG' : '⚙ DEBUG MODE'}
        </button>
        {visible && (
          <div id="debug-view">
            <div className="dbg-header">
              <span className="dbg-title">ÉLIAS — PLAYTEST DEBUG</span>
              <div className="dbg-header-actions">
                <button className="dbg-btn" onClick={() => setVisible(false)}>FERMER</button>
              </div>
            </div>
            <div className="dbg-main">
              <div className="dbg-gameover">
                <div className="dbg-gameover-title">{gameOver.reason === 'victory' ? 'VICTOIRE — VILLE OUVERTE' : 'GAME OVER'}</div>
                <div className="dbg-gameover-stats">
                  Âge: {age} · Épreuves: {totalEvents} · Réussite: {successRate}%<br />
                  Combo max: {store.maxCombo} · Flow max: {flow.value} · Codex: {unlockedCount}/{Object.keys(codex).length}
                </div>
                <button className="dbg-btn primary" onClick={() => store.initGame()} style={{ padding: '8px 24px', fontSize: 13 }}>
                  NOUVELLE PARTIE
                </button>
              </div>
            </div>
            <div className="dbg-footer">
              <span>Game Over — {gameOver.reason}</span>
              {inheritance.title && <span className="highlight">Héritage: {inheritance.title.name}</span>}
            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <>
      <button id="debug-toggle" onClick={() => setVisible(v => !v)}>
        {visible ? '✕ FERMER DEBUG' : '⚙ DEBUG MODE'}
      </button>

      {visible && (
        <div id="debug-view">
          {/* Header */}
          <div className="dbg-header">
            <span className="dbg-title">ÉLIAS — PLAYTEST DEBUG</span>
            <div className="dbg-header-actions">
              <button className="dbg-btn" onClick={() => setVisible(false)}>FERMER</button>
            </div>
          </div>

          {/* Main */}
          <div className="dbg-main">
            {/* Stats panel */}
            <div className="dbg-stats">
              <div className="dbg-section-title">Élias — {age} ans</div>
              <div className="dbg-stat-row"><span className="dbg-stat-name">Âge</span><span className="dbg-stat-value">{age}</span></div>
              <div className="dbg-stat-row"><span className="dbg-stat-name">Niveau</span><span className="dbg-stat-value">{difficulty}</span></div>
              <div className="dbg-stat-row"><span className="dbg-stat-name">Phase</span><span className="dbg-stat-value">{phase}</span></div>
              <div className="dbg-stat-row"><span className="dbg-stat-name">Flow</span><span className="dbg-stat-value">{flow.value} (palier {flow.palier})</span></div>
              <div className="dbg-stat-row"><span className="dbg-stat-name">Combo</span><span className="dbg-stat-value">{combo}</span></div>
              <div className="dbg-stat-row"><span className="dbg-stat-name">Épreuves</span><span className="dbg-stat-value">{totalEvents}</span></div>
              <div className="dbg-stat-row"><span className="dbg-stat-name">Réussite</span><span className="dbg-stat-value">{successRate}%</span></div>
              <div className="dbg-stat-row"><span className="dbg-stat-name">Codex</span><span className="dbg-stat-value">{unlockedCount}/{Object.keys(codex).length}</span></div>

              <div className="dbg-section-title">Jauges vitales</div>
              {(Object.keys(stats) as Array<keyof typeof stats>).map(key => (
                <div key={key}>
                  <div className="dbg-stat-row">
                    <span className="dbg-stat-name">{STAT_NAMES[key]}</span>
                    <span className="dbg-stat-value" style={{ color: STAT_COLORS[key] }}>{stats[key]}</span>
                  </div>
                  <div className="dbg-stat-bar">
                    <div className="dbg-stat-fill" style={{ width: `${Math.max(0, stats[key])}%`, background: STAT_COLORS[key] }} />
                  </div>
                </div>
              ))}

              <div className="dbg-section-title">Cascades programmées</div>
              {queuedCascadeEvents.length === 0 ? (
                <div style={{ fontSize: 10, color: '#666' }}>Aucune</div>
              ) : (
                queuedCascadeEvents.map((q, i) => (
                  <div key={i} style={{ fontSize: 10, color: '#f59e0b', marginBottom: 2 }}>
                    → âge {q.triggerAge}: {q.eventId}
                  </div>
                ))
              )}
            </div>

            {/* Journal */}
            <div className="dbg-journal" ref={journalRef}>
              {journal.map((entry, i) => (
                <div key={i} className="dbg-entry">
                  <span className="age">[{entry.age}a]</span>{' '}
                  {entry.type === 'success' && <span className="success">✓ </span>}
                  {entry.type === 'fail' && <span className="fail">✕ </span>}
                  {entry.type === 'cascade' && <span className="cascade">~ </span>}
                  {entry.type === 'milestone' && <span className="milestone">◆ </span>}
                  {entry.text}
                  {entry.verseRef && <span className="verse-ref"> [{entry.verseRef}]</span>}
                </div>
              ))}
            </div>

            {/* Event panel */}
            <div className="dbg-event-panel">
              {phase === 'event' && currentEvent ? (
                <>
                  <div className="dbg-timer">
                    <div className="dbg-timer-bar">
                      <div className="dbg-timer-fill" style={{
                        width: `${(timeLeft / FLOW_MAX_TIME) * 100}%`,
                        background: isUrgent ? '#ef4444' : '#7c3aed',
                      }} />
                    </div>
                    <div style={{ fontSize: 10, color: isUrgent ? '#ef4444' : '#666', marginTop: 2, textAlign: 'right' }}>
                      {timeLeft.toFixed(1)}s
                    </div>
                  </div>

                  <div className="dbg-event-card">
                    <div className="dbg-event-title">
                      [{currentEvent.category}] {currentEvent.title}
                    </div>
                    <div className="dbg-event-desc">{currentEvent.description}</div>
                    {currentEvent.thematicFlavor && (
                      <div style={{ fontSize: 10, color: '#f59e0b', marginTop: 6, fontStyle: 'italic' }}>
                        {currentEvent.thematicFlavor}
                      </div>
                    )}
                    <div style={{ fontSize: 10, color: '#666', marginTop: 4 }}>
                      correct: {currentEvent.correctVerseId} · cascade: {currentEvent.cascadeEventId || 'none'}
                    </div>
                  </div>

                  <div className="dbg-choices">
                    {chosenIds.map((verseId, i) => {
                      const verse = getVerseById(verseId);
                      if (!verse) return null;
                      const isCorrect = verseId === currentEvent.correctVerseId;
                      let cls = 'dbg-choice';
                      if (hasAnswered) cls += isCorrect ? ' correct' : ' wrong';

                      return (
                        <button key={verseId} className={cls} onClick={() => handleChoose(verseId)} disabled={hasAnswered}>
                          <strong>{String.fromCharCode(65 + i)}.</strong>{' '}
                          {verse.reference} — {verse.text.slice(0, 60)}
                          {hasAnswered && ` ${isCorrect ? '✓' : '✕'}`}
                        </button>
                      );
                    })}
                  </div>
                </>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', flex: 1, gap: 12 }}>
                  <div style={{ fontSize: 11, color: '#666', textAlign: 'center' }}>
                    Aucun événement actif<br />
                    Cliquez sur "Âge Suivant" pour continuer
                  </div>
                  <button className="dbg-btn primary" onClick={() => store.ageUp()} style={{ padding: '10px 24px', fontSize: 14 }}>
                    +1 ÂGE SUIVANT
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="dbg-footer">
            <span>Élias · <span className="highlight">{age} ans</span></span>
            <span>Flow: <span className="highlight">{flow.value}</span> · Combo: <span className="highlight">{combo}</span> · Codex: <span className="highlight">{unlockedCount}</span></span>
            <span>État: <span className={phase === 'event' ? 'highlight' : ''}>{phase}</span></span>
          </div>
        </div>
      )}
    </>
  );
}
