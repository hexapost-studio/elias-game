import { useEffect, useRef, useState } from 'react';
import { useGameStore } from '../stores/gameStore';
import { getVerseById } from '../data/verses';
import { Clock } from './IconSystem';
import { AFFLICTION_ICONS, AFFLICTION_COLORS } from './iconMeta';
import { useTypewriter } from '../hooks/useTypewriter';
import { textKey, isSeen, markSeen } from '../settings/seenText';
import { shuffledChoiceIds } from '../engine/choiceOrder';
import { deriveMessageSender } from '../engine/messageSender';
import { TypingIndicator } from './TypingIndicator';

const PALIER_TIMER: Record<number, number | null> = {
  1: null,   // Pas de timer
  2: 30,     // 30s
  3: 15,     // 15s
};

/** Durée de l'indicateur de frappe en ms (0 si prefers-reduced-motion). */
function typingDuration(): number {
  try {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 1200;
  } catch {
    return 1200;
  }
}

export function VerseChoices() {
  const currentEvent = useGameStore((s) => s.currentEvent);
  const chooseVerse = useGameStore((s) => s.chooseVerse);
  const difficulty = useGameStore((s) => s.difficulty);
  const age = useGameStore((s) => s.age);
  const lastEventResult = useGameStore((s) => s.lastEventResult);
  const phase = useGameStore((s) => s.phase);
  const flowPalier = useGameStore((s) => s.flow.palier);

  // Difficulté effective : la plus haute entre le choix du joueur et l'âge actuel
  // Plus on vieillit, plus on doit se rappeler les versets sans aide
  const ageDifficulty = age <= 15 ? 1 : age <= 50 ? 2 : 3;
  const effectiveDifficulty = Math.max(difficulty, ageDifficulty) as typeof difficulty;

  const maxTime = PALIER_TIMER[flowPalier] ?? 0;
  const [timeLeft, setTimeLeft] = useState(maxTime);

  // ── Indicateur de frappe (T-26) ──────────────────────────────────────────
  // `isTyping` démarre à true quand un nouvel événement arrive et repasse à
  // false après typingDuration() ms via un setTimeout dans l'effet.
  const [isTyping, setIsTyping] = useState(false);
  const typingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Reset state-on-prop-change : à chaque nouvel événement, démarrer le typing.
  // Fait pendant le rendu pour éviter un cycle état→effet→état.
  const isActive = !!currentEvent && phase === 'event';
  const hasAnswered = lastEventResult !== null;

  // Ordre des propositions DÉRIVÉ au rendu (mélange seedé sur l'id de l'événement) :
  // déterministe, sans Math.random ni state ni ref-au-rendu.
  const shuffledIds = isActive
    ? shuffledChoiceIds(currentEvent.id, currentEvent.correctVerseId, currentEvent.decoyVerseIds)
    : [];

  // Reset state-on-prop-change (pendant le rendu, pas dans un effet) : à chaque nouvel
  // événement le chrono repart de maxTime ET le typing redémarre.
  // `prefers-reduced-motion` : on ne déclenche pas le typing du tout (durée = 0).
  const eventKey = isActive ? currentEvent.id : null;
  const [prevEventKey, setPrevEventKey] = useState(eventKey);
  if (prevEventKey !== eventKey) {
    setPrevEventKey(eventKey);
    setTimeLeft(maxTime);
    // Démarrer le typing seulement si la durée > 0 (respecte prefers-reduced-motion).
    // Si durée = 0, isTyping reste false → bulle apparaît immédiatement.
    setIsTyping(eventKey !== null && typingDuration() > 0);
  }

  // Effet de fin du typing : bascule isTyping→false après le délai via setTimeout.
  // Le setState est dans le callback du timer (différé, pas synchrone dans l'effet)
  // → conforme à la règle react-hooks/set-state-in-effect qui autorise les callbacks
  // différés (abonnements, timers). Le prefers-reduced-motion est géré en amont
  // (reset-on-prop-change : isTyping reste false, l'effet ne s'exécute pas).
  useEffect(() => {
    if (!isTyping) return;
    typingTimerRef.current = setTimeout(() => {
      setIsTyping(false);
    }, typingDuration());
    return () => {
      if (typingTimerRef.current !== null) clearTimeout(typingTimerRef.current);
    };
  }, [isTyping]);

  // Révélation « machine à écrire » de la scène (pacing littéraire).
  const description = currentEvent?.description ?? '';
  // Smart skip : un beat déjà lu s'affiche d'un bloc ; un beat neuf s'anime + porte « ✦ nouveau ».
  const sceneKey = textKey(description);
  const alreadySeen = isSeen(sceneKey);
  const isNewScene = sceneKey !== '' && !alreadySeen;
  const { shown: shownDescription, done: descDone, skip: skipDescription } =
    useTypewriter(description, { enabled: !alreadySeen });

  // File le beat une fois entièrement révélé (texte neuf seulement) → « lu, classé ».
  useEffect(() => {
    if (descDone && sceneKey !== '' && !isSeen(sceneKey)) markSeen(sceneKey);
  }, [descDone, sceneKey]);

  // L'effet ne pilote QUE le décompte (système externe). Son setState part du tick
  // différé → pas de set-state-in-effect. Tous les Hooks sont appelés AVANT toute sortie
  // anticipée (cf. plus bas), donc plus de rules-of-hooks.
  const timerRunning = isActive && maxTime > 0 && !hasAnswered;
  useEffect(() => {
    if (!timerRunning) return;
    const id = setInterval(() => {
      setTimeLeft((t) => (t <= 0 ? 0 : Math.round((t - 0.1) * 10) / 10));
    }, 100);
    return () => clearInterval(id);
  }, [timerRunning, eventKey]);

  if (!isActive) return null;

  // Dériver l'émetteur pour la couleur + le nom de l'indicateur de frappe (T-26).
  // Dérivé au rendu depuis l'état présent (invariant 3 — pas de state supplémentaire).
  const eventSender = deriveMessageSender(currentEvent);

  const timeSpent = maxTime - timeLeft;
  const CatIcon = AFFLICTION_ICONS[currentEvent.category] || Clock;
  const catColor = AFFLICTION_COLORS[currentEvent.category] || 'var(--text-muted)';
  const isUrgent = maxTime > 0 && timeLeft <= Math.min(5, maxTime * 0.3);
  const noTimer = maxTime <= 0;

  const handleChoose = (verseId: string) => {
    if (hasAnswered) return;
    // L'intervalle est arrêté par le cleanup de l'effet (hasAnswered→timerRunning false).
    const finalTime = Math.max(0.1, timeSpent);
    // Haptic feedback : vibration courte
    try { navigator.vibrate(5); } catch { /* vibrate non supporté */ }
    chooseVerse(verseId, Math.round(finalTime * 10) / 10);
  };

  const showFullText = effectiveDifficulty === 1 && flowPalier === 1;
  const showPartialText = effectiveDifficulty <= 2 && flowPalier <= 2 && !showFullText;

  return (
    <div>
      {/* Indicateur « en train d'écrire » — apparaît ~1.2s avant la bulle de l'épreuve (T-26) */}
      <TypingIndicator sender={eventSender} isTyping={isTyping} />

      {/* Contenu de l'épreuve — masqué pendant le typing pour laisser la place à l'indicateur */}
      {!isTyping && <>

      {/* Timer — caché en palier 1 (pas de pression) */}
      {!noTimer && (
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <div className="timer-bar" style={{ background: 'rgba(255,255,255,0.08)' }}>
          <div
            className="timer-fill"
            style={{
              width: `${maxTime > 0 ? (timeLeft / maxTime) * 100 : 0}%`,
              background: isUrgent ? 'var(--danger)' : 'var(--accent-violet)',
              boxShadow: isUrgent ? '0 0 8px var(--danger)' : 'none',
            }}
          />
        </div>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, fontWeight: 600, color: isUrgent ? 'var(--danger)' : 'var(--text-muted)', minWidth: 40, justifyContent: 'flex-end', fontVariantNumeric: 'tabular-nums' }}>
          <Clock size={10} strokeWidth={2} />
          {timeLeft.toFixed(1)}s
        </span>
      </div>
      )}

      {/* Event card */}
      <div className="event-card">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
          <span style={{ color: catColor, display: 'flex' }}>
            <CatIcon size={18} strokeWidth={1.5} />
          </span>
          <div className="event-title" style={{ marginBottom: 0 }}>
            {currentEvent.title}
          </div>
          {isNewScene && (
            <span className="scene-new-badge" title="Scène jamais lue">
              ✦ nouveau
            </span>
          )}
        </div>
        <div
          className="event-description"
          onClick={!descDone ? skipDescription : undefined}
          style={{ cursor: !descDone ? 'pointer' : 'default' }}
          title={!descDone ? 'Toucher pour tout afficher' : undefined}
        >
          {shownDescription}
          {!descDone && <span className="tw-caret" aria-hidden="true">▋</span>}
        </div>
        {currentEvent.thematicFlavor && descDone && (
          <div className="event-flavor">{currentEvent.thematicFlavor}</div>
        )}
      </div>

      {/* Choices */}
      {shuffledIds.map((verseId, i) => {
        const verse = getVerseById(verseId);
        if (!verse) return null;

        const isCorrect = verseId === currentEvent.correctVerseId;
        let btnClass = 'btn-choice';
        if (hasAnswered) {
          btnClass += isCorrect ? ' correct' : ' wrong';
        }

        let displayText: string;
        if (showFullText) {
          displayText = `${verse.reference} — "${verse.text.slice(0, 50)}..."`;
        } else if (showPartialText) {
          displayText = `${verse.reference} — "${verse.text.slice(0, 20)}..."`;
        } else {
          displayText = verse.reference;
        }

        const slotImg = hasAnswered
          ? isCorrect
            ? '/ui/travelbook/UI_TravelBook_Slot01b.png'
            : '/ui/travelbook/UI_TravelBook_Slot01c.png'
          : '/ui/travelbook/UI_TravelBook_Slot01a.png';

        return (
          <button
            key={verseId}
            className={btnClass}
            onClick={() => handleChoose(verseId)}
            disabled={hasAnswered}
            style={{ display: 'flex', alignItems: 'center', gap: 10 }}
          >
            {/* Pixel art slot badge */}
            <span style={{ position: 'relative', flexShrink: 0, width: 22, height: 22 }}>
              <img
                src={slotImg}
                alt=""
                style={{
                  position: 'absolute',
                  inset: 0,
                  width: '100%',
                  height: '100%',
                  imageRendering: 'pixelated',
                  opacity: hasAnswered ? (isCorrect ? 0.9 : 0.6) : 0.55,
                }}
              />
              {hasAnswered ? (
                /* Pixel art tick ou cross après réponse */
                <img
                  src={isCorrect
                    ? '/ui/travelbook/UI_TravelBook_IconTick01a.png'
                    : '/ui/travelbook/UI_TravelBook_IconCross01a.png'}
                  alt={isCorrect ? '✓' : '✕'}
                  style={{
                    position: 'absolute',
                    inset: 0,
                    width: '55%',
                    height: '55%',
                    margin: 'auto',
                    imageRendering: 'pixelated',
                    filter: isCorrect
                      ? 'brightness(0) saturate(1) invert(1) sepia(1) saturate(4) hue-rotate(100deg)'
                      : 'brightness(0) saturate(1) invert(1) sepia(1) saturate(6) hue-rotate(320deg)',
                  }}
                />
              ) : (
                <span style={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: 'var(--font-display)',
                  fontSize: 9,
                  fontWeight: 700,
                  color: 'var(--text-muted)',
                  letterSpacing: 0,
                }}>
                  {String.fromCharCode(65 + i)}
                </span>
              )}
            </span>
            <span style={{ flex: 1, textAlign: 'left' }}>{displayText}</span>
          </button>
        );
      })}

      </>}
    </div>
  );
}
