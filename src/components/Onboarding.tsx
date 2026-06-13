import { useState } from 'react';
import { ChevronRight } from './IconSystem';

const STEPS = [
  {
    icon: '✦',
    title: 'Vivez la vie d\'Élias',
    description: 'Vous incarnez Élias, de sa naissance à sa mort. Chaque année apporte son lot d\'épreuves. Votre mission : garder ses 4 jauges vitales au-dessus de zéro.',
    detail: [
      'Foi — votre connexion à Dieu',
      'Paix — votre santé mentale',
      'Physique — votre corps',
      'Finances — votre prospérité',
    ],
    color: '#c084fc',
  },
  {
    icon: '▸',
    title: 'Choisissez le bon verset',
    description: 'Face à chaque épreuve, 4 références bibliques s\'offrent à vous. Une seule est correcte. Plus vous répondez vite, plus votre Flow monte, plus les gains de stats sont importants.',
    detail: [
      'Niveau 1 : texte complet affiché',
      'Niveau 2 : référence seulement',
      'Niveau 3 (Hardcore) : frappe libre',
    ],
    color: '#f59e0b',
  },
  {
    icon: '✦',
    title: 'Débloquez le Codex et les Titres',
    description: 'Chaque verset utilisé avec succès rejoint votre Grimoire. Complétez-les tous. Terminez une partie pour débloquer un Titre et son héritage pour la prochaine run.',
    detail: [
      'Codex : versets à collectionner',
      'Titres : Prodige, Combattant, Sage...',
      'Héritage : bonus de stats inter-run',
    ],
    color: '#10b981',
  },
  {
    icon: '✦',
    title: 'Une dernière chose...',
    description: 'Ce jeu t\'aide à mémoriser les Écritures. Mais souviens-toi : ta valeur devant Dieu ne dépend pas de ta connaissance des versets. Si tu te trompes dans le jeu, ce n\'est pas un échec spirituel. C\'est juste une occasion d\'apprendre.',
    detail: [
      'Le but est d\'apprendre la Parole, pas d\'être parfait',
      'Chaque erreur est une chance de mémoriser un verset',
      'Dieu ne t\'aime pas plus si tu gagnes au jeu',
    ],
    color: '#c084fc',
  },
];

const TOTAL_STEPS = STEPS.length + 1; // +1 for interactive step

const TUTORIAL_CHOICES = [
  { ref: 'Jean 3.16', correct: false },
  { ref: 'Romains 8.28', correct: false },
  { ref: 'Psaume 27.1', correct: true },
  { ref: 'Proverbes 3.5-6', correct: false },
];

interface OnboardingProps {
  onComplete: () => void;
}

export function Onboarding({ onComplete }: OnboardingProps) {
  const [step, setStep] = useState(0);
  const [tutorialChoice, setTutorialChoice] = useState<number | null>(null);

  const isInteractive = step === TOTAL_STEPS - 1;
  const isLast = step === TOTAL_STEPS - 1;
  const current = !isInteractive ? STEPS[step] : null;
  const activeColor = current?.color ?? '#f59e0b';
  const chosenCorrect = tutorialChoice !== null && TUTORIAL_CHOICES[tutorialChoice].correct;
  const chosenWrong = tutorialChoice !== null && !TUTORIAL_CHOICES[tutorialChoice].correct;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: '#120d07',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 32,
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {/* Titre atmosphérique */}
      <div style={{ textAlign: 'center', marginBottom: 28 }}>
        <div style={{
          fontFamily: "'Kenney Future', 'Cinzel', serif",
          fontSize: 13, fontWeight: 700, letterSpacing: 3,
          color: '#f59e0b', marginBottom: 4,
        }}>
          ÉLIAS
        </div>
        <div style={{ fontSize: 10, color: '#6b4f28', letterSpacing: 2 }}>
          LE COMBAT D'UNE VIE
        </div>
      </div>

      {/* Progress dots */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 40 }}>
        {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
          <div
            key={i}
            style={{
              width: i === step ? 24 : 8,
              height: 8,
              borderRadius: 4,
              background: i === step ? activeColor : i < step ? '#3d2605' : '#2a1a08',
              transition: 'all 0.3s',
            }}
          />
        ))}
      </div>

      {/* Info steps (0-2) */}
      {!isInteractive && current && (
        <>
          <div
            style={{
              width: 80, height: 80, borderRadius: 40,
              background: `${current.color}22`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 36, marginBottom: 24,
              border: `2px solid ${current.color}44`,
            }}
          >
            {current.icon}
          </div>

          <h1 style={{
            fontFamily: "'Cinzel', serif",
            fontSize: 20, fontWeight: 700,
            color: current.color,
            textAlign: 'center', marginBottom: 12, letterSpacing: 1,
          }}>
            {current.title}
          </h1>

          <p style={{
            fontSize: 14, lineHeight: 1.7,
            color: '#c9a97e', textAlign: 'center',
            maxWidth: 320, marginBottom: 20,
          }}>
            {current.description}
          </p>

          <div style={{
            background: '#1c1409', borderRadius: 12,
            padding: '12px 16px', border: '1px solid rgba(245,158,11,0.2)',
            marginBottom: 32, width: '100%', maxWidth: 320,
          }}>
            {current.detail.map((d, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '4px 0', fontSize: 12, color: '#9a7a4a',
              }}>
                <div style={{
                  width: 4, height: 4, borderRadius: 2,
                  background: current.color, flexShrink: 0,
                }} />
                {d}
              </div>
            ))}
          </div>
        </>
      )}

      {/* Interactive step (step 3) */}
      {isInteractive && (
        <>
          <div style={{
            width: 80, height: 80, borderRadius: 40,
            background: 'rgba(245,158,11,0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 32, marginBottom: 20,
            border: '2px solid rgba(245,158,11,0.35)',
          }}>
            ⚔
          </div>

          <h1 style={{
            fontFamily: "'Cinzel', serif",
            fontSize: 18, fontWeight: 700, color: '#f59e0b',
            textAlign: 'center', marginBottom: 10, letterSpacing: 1,
          }}>
            Essayez maintenant
          </h1>

          {/* Mini event card */}
          <div style={{
            background: '#1c1409', border: '1px solid rgba(245,158,11,0.25)',
            borderRadius: 12, padding: '14px 16px',
            width: '100%', maxWidth: 320, marginBottom: 16,
          }}>
            <div style={{
              fontSize: 10, color: '#c084fc', fontWeight: 700,
              letterSpacing: 1.5, marginBottom: 8, textTransform: 'uppercase',
            }}>
              Épreuve · Peur &amp; Angoisse
            </div>
            <div style={{ fontSize: 13, color: '#c9a97e', lineHeight: 1.65 }}>
              La nuit, une peur inexplicable t'envahit. Ton cœur s'emballe. Quel verset apporte la victoire contre la peur ?
            </div>
          </div>

          {/* Choices */}
          <div style={{ width: '100%', maxWidth: 320, marginBottom: 20 }}>
            {TUTORIAL_CHOICES.map((choice, i) => {
              const isChosen = tutorialChoice === i;
              const isCorrectChoice = choice.correct;
              const showCorrect = tutorialChoice !== null && isCorrectChoice;
              const showWrong = isChosen && !isCorrectChoice;

              let bg = 'rgba(28,20,9,0.85)';
              let border = 'rgba(245,158,11,0.2)';
              let color = '#c9a97e';

              if (showCorrect) {
                bg = 'rgba(16,185,129,0.12)';
                border = 'rgba(16,185,129,0.5)';
                color = '#6ee7b7';
              } else if (showWrong) {
                bg = 'rgba(239,68,68,0.12)';
                border = 'rgba(239,68,68,0.5)';
                color = '#fca5a5';
              }

              return (
                <button
                  key={i}
                  onClick={() => { if (tutorialChoice === null) setTutorialChoice(i); }}
                  disabled={tutorialChoice !== null}
                  style={{
                    width: '100%', padding: '10px 14px',
                    marginBottom: 8, textAlign: 'left',
                    background: bg,
                    border: `1px solid ${border}`,
                    borderRadius: 10, cursor: tutorialChoice === null ? 'pointer' : 'default',
                    color, fontSize: 13, fontFamily: "'Inter', sans-serif",
                    transition: 'all 0.2s ease',
                    display: 'flex', alignItems: 'center', gap: 10,
                  }}
                >
                  <span style={{
                    fontSize: 10, fontWeight: 700, letterSpacing: 1,
                    color: showCorrect ? '#6ee7b7' : showWrong ? '#fca5a5' : '#6b5235',
                    minWidth: 16,
                  }}>
                    {showCorrect ? '✓' : showWrong ? '✕' : String.fromCharCode(65 + i)}
                  </span>
                  {choice.ref}
                  {showCorrect && isChosen && (
                    <span style={{ marginLeft: 'auto', fontSize: 10, color: '#6ee7b7' }}>
                      Bonne réponse !
                    </span>
                  )}
                  {showCorrect && !isChosen && (
                    <span style={{ marginLeft: 'auto', fontSize: 10, color: '#6ee7b7', opacity: 0.8 }}>
                      Bonne réponse
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Feedback message */}
          {chosenCorrect && (
            <div style={{
              fontSize: 13, color: '#6ee7b7', marginBottom: 16,
              textAlign: 'center', animation: 'fadeIn 0.3s ease',
            }}>
              ✦ Psaume 27.1 — "L'Éternel est ma lumière et mon salut"<br />
              <span style={{ fontSize: 11, color: '#10b981', opacity: 0.8 }}>
                Tu as reconnu le bon verset contre la peur.
              </span>
            </div>
          )}
          {chosenWrong && (
            <div style={{
              fontSize: 12, color: '#fde68a', marginBottom: 16,
              textAlign: 'center', animation: 'fadeIn 0.3s ease',
              lineHeight: 1.6,
            }}>
              Le verset contre la peur est <strong>Psaume 27.1</strong>.<br />
              <span style={{ fontSize: 11, color: '#c9a97e', opacity: 0.9 }}>
                Tu l'apprendras en jouant — chaque erreur renforce la mémoire.
              </span>
            </div>
          )}
        </>
      )}

      {/* Navigation buttons */}
      <div style={{ display: 'flex', gap: 12 }}>
        {!isLast && (
          <button
            onClick={() => setStep((s) => s + 1)}
            style={{
              padding: '12px 28px',
              background: activeColor,
              color: 'white', border: 'none',
              borderRadius: 10, fontSize: 14,
              fontWeight: 600, cursor: 'pointer',
              fontFamily: "'Cinzel', serif",
              letterSpacing: 1,
              display: 'flex', alignItems: 'center', gap: 8,
            }}
          >
            SUIVANT <ChevronRight size={16} strokeWidth={2} />
          </button>
        )}
        {isLast && (
          <button
            onClick={onComplete}
            style={{
              padding: '12px 28px',
              background: chosenCorrect ? '#10b981' : '#f59e0b',
              color: 'white', border: 'none',
              borderRadius: 10, fontSize: 14,
              fontWeight: 600, cursor: 'pointer',
              fontFamily: "'Cinzel', serif",
              letterSpacing: 1,
              transition: 'background 0.3s ease',
            }}
          >
            COMMENCER
          </button>
        )}
        <button
          onClick={onComplete}
          style={{
            padding: '12px 20px',
            background: 'transparent', color: '#7a5c35',
            border: '1px solid rgba(245,158,11,0.2)', borderRadius: 10,
            fontSize: 12, cursor: 'pointer',
            fontFamily: "'Inter', sans-serif",
          }}
        >
          PASSER
        </button>
      </div>
    </div>
  );
}
