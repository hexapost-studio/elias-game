/**
 * Prologue interactif — remplace les 5 premières années sans gameplay.
 * Le joueur fait 3-5 choix qui construisent le profil d'Élias.
 * À la fin, les stats initiales sont déterminées par les choix,
 * PAS par le RNG des birth profiles.
 */
import { useState } from 'react';
import { ChevronRight, Star } from './IconSystem';

export interface PrologueResult {
  stats: { foi: number; paix: number; physique: number; finances: number };
  profileName: string;
  storyBits: string[];
}

interface Choice {
  id: string;
  text: string;
  impact: Partial<Record<string, number>>;
  story: string;
  trait?: string;
}

interface PrologueStep {
  age: number;
  question: string;
  context: string;
  choices: Choice[];
}

const STEPS: PrologueStep[] = [
  {
    age: 6,
    question: 'Que fais-tu ?',
    context: 'À la récréation, un camarade se fait embêter par des plus grands.',
    choices: [
      { id: 'defend', text: 'Tu prends sa défense', impact: { physique: 4, foi: 2 }, story: 'Élias a défendu le faible. Son courage a impressionné les autres.', trait: 'courageux' },
      { id: 'teacher', text: 'Tu vas chercher un adulte', impact: { paix: 4, finances: 1 }, story: 'Élias a eu la sagesse de chercher de l\'aide.', trait: 'sage' },
      { id: 'observe', text: 'Tu restes à l\'écart, gêné', impact: { paix: 2, foi: 1 }, story: 'Élias n\'est pas intervenu — mais il n\'a pas oublié.', trait: 'réservé' },
    ],
  },
  {
    age: 8,
    question: 'Que fais-tu de cet argent ?',
    context: 'Ta mère te donne un peu d\'argent pour ta fête.',
    choices: [
      { id: 'save', text: 'Tu économises tout', impact: { finances: 5, paix: 1 }, story: 'Élias a appris tôt la valeur de l\'épargne.', trait: 'économe' },
      { id: 'gift', text: 'Tu achètes un petit cadeau pour elle', impact: { paix: 3, foi: 2 }, story: 'Le cœur d\'Élias s\'est réchauffé en voyant le sourire de sa mère.', trait: 'généreux' },
      { id: 'spend', text: 'Tu achètes des bonbons pour les copains', impact: { physique: 2, paix: 2 }, story: 'Élias a partagé sa joie avec ses amis.', trait: 'social' },
    ],
  },
  {
    age: 10,
    question: 'Comment réagis-tu ?',
    context: 'À l\'école du dimanche, on raconte l\'histoire de David et Goliath.',
    choices: [
      { id: 'ask', text: 'Tu poses mille questions', impact: { foi: 4, paix: 2 }, story: 'La foi d\'Élias a commencé par une curiosité insatiable.', trait: 'curieux' },
      { id: 'listen', text: 'Tu écoutes, fasciné en silence', impact: { paix: 3, foi: 2 }, story: 'Une graine a été plantée dans le cœur d\'Élias.', trait: 'contemplatif' },
      { id: 'skeptic', text: 'Tu trouves ça bizarre', impact: { physique: 2, finances: 2 }, story: 'Élias avait besoin de voir pour croire — et ça viendrait.', trait: 'terre-à-terre' },
    ],
  },
  {
    age: 12,
    question: 'Quel est ton rêve ?',
    context: 'Un pasteur demande aux jeunes ce qu\'ils veulent devenir plus tard.',
    choices: [
      { id: 'pastor', text: 'Un serviteur de Dieu', impact: { foi: 5, paix: 2 }, story: 'La vocation d\'Élias a germé ce jour-là.', trait: 'appelé' },
      { id: 'doctor', text: 'Quelqu\'un qui guérit les autres', impact: { physique: 3, paix: 3, finances: 1 }, story: 'Élias voulait être une réponse aux prières des autres.', trait: 'soignant' },
      { id: 'teacher', text: 'Un enseignant qui transmet', impact: { foi: 3, paix: 3, finances: 1 }, story: 'Élias aimait déjà partager ce qu\'il apprenait.', trait: 'enseignant' },
    ],
  },
  {
    age: 14,
    question: 'Comment passes-tu ton temps libre ?',
    context: 'L\'adolescence commence. Les tentations et les opportunités s\'ouvrent.',
    choices: [
      { id: 'sport', text: 'Tu fais du sport avec des amis', impact: { physique: 5, foi: 1 }, story: 'Le corps d\'Élias s\'est forgé dans l\'effort et la camaraderie.', trait: 'athlétique' },
      { id: 'read', text: 'Tu lis et étudies', impact: { foi: 3, paix: 2, finances: 2 }, story: 'Élias a cultivé son esprit — et sa foi en a profité.', trait: 'studieux' },
      { id: 'music', text: 'Tu joues de la musique à l\'église', impact: { foi: 3, paix: 3 }, story: 'La musique a ouvert le cœur d\'Élias à la présence de Dieu.', trait: 'artistique' },
    ],
  },
];

interface PrologueProps {
  onComplete: (result: PrologueResult) => void;
}

export function Prologue({ onComplete }: PrologueProps) {
  const [step, setStep] = useState(0);
  const [accumulated, setAccumulated] = useState<PrologueResult>({
    stats: { foi: 30, paix: 30, physique: 30, finances: 30 },
    profileName: 'Façonné par ses choix',
    storyBits: [],
  });

  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;

  const handleChoice = (choice: Choice) => {
    const newStats = { ...accumulated.stats };
    for (const [stat, val] of Object.entries(choice.impact)) {
      newStats[stat as keyof typeof newStats] = Math.min(85, (newStats[stat as keyof typeof newStats] || 0) + val);
    }

    const newBits = [...accumulated.storyBits, choice.story];

    // Collect traits pour déterminer le profil
    const traits = [...(step === 0 ? [choice.trait || ''] : []),
      ...(step === 1 ? [choice.trait || ''] : []),
      ...(step === 2 ? [choice.trait || ''] : []),
      ...(step === 3 ? [choice.trait || ''] : []),
      ...(step === 4 ? [choice.trait || ''] : []),
    ].filter(Boolean);

    if (isLast) {
      // Finaliser
      const finalProfile = traits.length >= 3
        ? `Le ${traits[0]} ${traits[1] ? `et ${traits[1]}` : ''}`
        : 'Façonné par ses choix';
      onComplete({
        stats: newStats,
        profileName: finalProfile,
        storyBits: newBits,
      });
    } else {
      setAccumulated({ stats: newStats, profileName: accumulated.profileName, storyBits: newBits });
      setStep(step + 1);
    }
  };

  const progress = ((step) / STEPS.length) * 100;

  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 50,
      background: 'radial-gradient(ellipse at center, #1c1409 0%, #0a0603 100%)',
      display: 'flex', flexDirection: 'column',
      padding: '24px 20px',
      animation: 'fadeIn 0.5s ease',
      overflowY: 'auto',
    }}>
      {/* Progress bar */}
      <div style={{ marginBottom: 20 }}>
        <div style={{
          height: 3, background: 'rgba(245,158,11,0.15)', borderRadius: 2,
          position: 'relative',
        }}>
          <div style={{
            width: `${progress}%`, height: '100%',
            background: 'linear-gradient(90deg, #d97706, #f59e0b)',
            borderRadius: 2, transition: 'width 0.5s ease',
          }} />
        </div>
        <div style={{
          display: 'flex', justifyContent: 'space-between', marginTop: 6,
          fontSize: 9, color: 'var(--text-muted)', letterSpacing: 1,
        }}>
          <span>Enfance</span>
          <span>{step + 1}/{STEPS.length}</span>
        </div>
      </div>

      {/* Age badge */}
      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        padding: '3px 10px', borderRadius: 20,
        background: 'rgba(245,158,11,0.1)',
        border: '1px solid rgba(245,158,11,0.2)',
        alignSelf: 'flex-start', marginBottom: 16,
        fontSize: 10, fontWeight: 600, color: 'var(--accent-gold)',
        letterSpacing: 1,
      }}>
        <Star size={10} strokeWidth={1.5} />
        {current.age} ANS
      </div>

      {/* Context narrative */}
      <div style={{
        fontSize: 14, lineHeight: 1.7, color: 'var(--text-primary)',
        marginBottom: 8, fontWeight: 500,
        fontStyle: 'italic',
      }}>
        {current.context}
      </div>

      {/* Question */}
      <div style={{
        fontSize: 16, fontWeight: 700, color: 'var(--accent-gold)',
        marginBottom: 20, fontFamily: 'var(--font-display)',
        letterSpacing: 0.5,
      }}>
        {current.question}
      </div>

      {/* Choices */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {current.choices.map((choice) => (
          <button
            key={choice.id}
            onClick={() => handleChoice(choice)}
            style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '14px 16px',
              background: 'rgba(245,158,11,0.06)',
              border: '1px solid rgba(245,158,11,0.18)',
              borderRadius: 12,
              cursor: 'pointer',
              textAlign: 'left',
              color: 'var(--text-primary)',
              fontSize: 13, lineHeight: 1.5,
              transition: 'all 0.15s',
              fontFamily: 'var(--font-body)',
              width: '100%',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(245,158,11,0.12)';
              e.currentTarget.style.borderColor = 'rgba(245,158,11,0.35)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(245,158,11,0.06)';
              e.currentTarget.style.borderColor = 'rgba(245,158,11,0.18)';
            }}
          >
            <ChevronRight size={14} strokeWidth={2} style={{ color: 'var(--accent-gold)', flexShrink: 0 }} />
            <span>{choice.text}</span>
          </button>
        ))}
      </div>

      {/* Stats preview (montre l'évolution des stats) */}
      <div style={{ marginTop: 'auto', paddingTop: 20, display: 'flex', gap: 8, justifyContent: 'center' }}>
        {Object.entries(accumulated.stats).map(([stat, val]) => (
          <div key={stat} style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
          }}>
            <div style={{
              fontSize: 8, color: 'var(--text-muted)', textTransform: 'uppercase',
              letterSpacing: 0.5,
            }}>
              {stat === 'foi' ? 'FOI' : stat === 'paix' ? 'PAIX' : stat === 'physique' ? 'CORPS' : 'FINS'}
            </div>
            <div style={{
              fontSize: 12, fontWeight: 700,
              color: val > 60 ? 'var(--success)' : val > 40 ? 'var(--accent-gold)' : 'var(--text-muted)',
            }}>
              {val}
            </div>
          </div>
        ))}
      </div>

      {/* Skip button */}
      <button
        onClick={() => onComplete({
          stats: { foi: 50, paix: 50, physique: 50, finances: 50 },
          profileName: 'Équilibré',
          storyBits: ['Élias a grandi simplement, sans histoire particulière.'],
        })}
        style={{
          marginTop: 12, padding: '8px 0',
          background: 'none', border: 'none',
          color: 'var(--text-muted)', fontSize: 10,
          cursor: 'pointer', textAlign: 'center',
          fontFamily: 'var(--font-body)',
          opacity: 0.6,
        }}
      >
        Passer le prologue →
      </button>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
