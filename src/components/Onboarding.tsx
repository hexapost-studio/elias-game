import { useState } from 'react';
import { ChevronRight, BookOpen, Zap, Award, XIcon } from './IconSystem';

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
    color: '#7c3aed',
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
    icon: '🏆',
    title: 'Débloquez le Codex et les Titres',
    description: 'Chaque verset utilisé avec succès rejoint votre Grimoire. Complétez-les tous. Terminez une partie pour débloquer un Titre et son héritage pour la prochaine run.',
    detail: [
      'Codex : 66 versets à collectionner',
      'Titres : Prodige, Combattant, Sage...',
      'Héritage : bonus de stats inter-run',
    ],
    color: '#10b981',
  },
];

interface OnboardingProps {
  onComplete: () => void;
}

export function Onboarding({ onComplete }: OnboardingProps) {
  const [step, setStep] = useState(0);

  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: '#0f0a1a',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 32,
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {/* Dots */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 40 }}>
        {STEPS.map((_, i) => (
          <div
            key={i}
            style={{
              width: i === step ? 24 : 8,
              height: 8,
              borderRadius: 4,
              background: i === step ? current.color : '#333',
              transition: 'all 0.3s',
            }}
          />
        ))}
      </div>

      {/* Icon */}
      <div
        style={{
          width: 80,
          height: 80,
          borderRadius: 40,
          background: `${current.color}22`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 36,
          marginBottom: 24,
          border: `2px solid ${current.color}44`,
        }}
      >
        {current.icon}
      </div>

      {/* Title */}
      <h1
        style={{
          fontFamily: "'Cinzel', serif",
          fontSize: 20,
          fontWeight: 700,
          color: current.color,
          textAlign: 'center',
          marginBottom: 12,
          letterSpacing: 1,
        }}
      >
        {current.title}
      </h1>

      {/* Description */}
      <p
        style={{
          fontSize: 14,
          lineHeight: 1.7,
          color: '#b8a9d4',
          textAlign: 'center',
          maxWidth: 320,
          marginBottom: 20,
        }}
      >
        {current.description}
      </p>

      {/* Detail list */}
      <div
        style={{
          background: '#1a1228',
          borderRadius: 12,
          padding: '12px 16px',
          border: '1px solid #2d2147',
          marginBottom: 32,
          width: '100%',
          maxWidth: 320,
        }}
      >
        {current.detail.map((d, i) => (
          <div
            key={i}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '4px 0',
              fontSize: 12,
              color: '#7b6b9e',
            }}
          >
            <div
              style={{
                width: 4,
                height: 4,
                borderRadius: 2,
                background: current.color,
                flexShrink: 0,
              }}
            />
            {d}
          </div>
        ))}
      </div>

      {/* Buttons */}
      <div style={{ display: 'flex', gap: 12 }}>
        {!isLast && (
          <button
            onClick={() => setStep((s) => s + 1)}
            style={{
              padding: '12px 28px',
              background: current.color,
              color: 'white',
              border: 'none',
              borderRadius: 10,
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: "'Cinzel', serif",
              letterSpacing: 1,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
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
              background: current.color,
              color: 'white',
              border: 'none',
              borderRadius: 10,
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: "'Cinzel', serif",
              letterSpacing: 1,
            }}
          >
            COMMENCER
          </button>
        )}
        <button
          onClick={onComplete}
          style={{
            padding: '12px 20px',
            background: 'transparent',
            color: '#666',
            border: '1px solid #333',
            borderRadius: 10,
            fontSize: 12,
            cursor: 'pointer',
          }}
        >
          PASSER
        </button>
      </div>
    </div>
  );
}
