import { useGameStore } from '../stores/gameStore';
import { STORY_ARCS } from '../data/storyArcs';
import { EVENT_DATABASE, getEventById } from '../data/events';
import { getArcShape, getArcProgress, type StepView } from '../engine/arcProgress';
import { Handshake, BookOpen, Landmark, Zap, Sparkles, Users, Hammer, Home, Church, Building2, Heart } from 'lucide-react';

const ARC_ICONS: Record<string, React.ReactNode> = {
  'arc-louise':   <Handshake size={10} strokeWidth={1.5} />,
  'arc-mathias':  <BookOpen size={10} strokeWidth={1.5} />,
  'arc-heritage': <Landmark size={10} strokeWidth={1.5} />,
  'arc-tentation':<Zap size={10} strokeWidth={1.5} />,
  'arc-guerison': <Sparkles size={10} strokeWidth={1.5} />,
  'arc-ami':      <Users size={10} strokeWidth={1.5} />,
  'arc-metier':   <Hammer size={10} strokeWidth={1.5} />,
  'arc-parents':  <Home size={10} strokeWidth={1.5} />,
  'arc-eglise':   <Church size={10} strokeWidth={1.5} />,
  'arc-ville':    <Building2 size={10} strokeWidth={1.5} />,
  'arc-conjoint': <Heart size={10} strokeWidth={1.5} />,
};

const ARC_SHORT: Record<string, string> = {
  'arc-louise':   'Louise',
  'arc-mathias':  'Mathias',
  'arc-heritage': 'Héritage',
  'arc-tentation':'Pouvoir',
  'arc-guerison': 'Guérison',
};

/* Couleurs du bandeau de pas (B-2) */
const STEP_DONE = '#34d399';
const STEP_CURRENT = '#fbbf24';
const STEP_TODO = 'var(--text-muted)';
const STEP_CONNECTOR = 'rgba(167,139,250,0.3)';
const STEP_BRANCH = 'rgba(167,139,250,0.45)';

/** ● vécu · ◆ bifurcation · ○ à venir — la couleur porte le statut (vécu/en cours/à venir). */
function stepGlyph(s: StepView): string {
  return s.isFork ? '◆' : s.status === 'todo' ? '○' : '●';
}
function stepColor(s: StepView): string {
  return s.status === 'current' ? STEP_CURRENT : s.status === 'done' ? STEP_DONE : STEP_TODO;
}

/** Remplace {ami}/{ville}/{métier}/{église}/{conjoint} dans les noms d'arcs */
function resolveArcName(name: string, city: string, friendName: string, profession: string, churchName: string, spouseName: string): string {
  return name
    .replace(/\{ville\}/g,    city)
    .replace(/\{ami\}/g,      friendName)
    .replace(/\{métier\}/g,   profession)
    .replace(/\{église\}/g,   churchName)
    .replace(/\{conjoint\}/g, spouseName);
}

export function ArcTracker() {
  const completedArcs   = useGameStore((s) => s.completedArcs);
  const encounteredArcIds = useGameStore((s) => s.encounteredArcIds);
  const answeredArcEventIds = useGameStore((s) => s.answeredArcEventIds);
  const currentEvent    = useGameStore((s) => s.currentEvent);
  const lifeContext     = useGameStore((s) => s.lifeContext);

  const completedIds = new Set(completedArcs.map((a) => a.arcId));
  const activeArcId = currentEvent?.storyArcId ?? null;
  const hasAnyArc = encounteredArcIds.length > 0 || completedIds.size > 0;

  if (!hasAnyArc) return null;

  // — Bandeau de pas de l'arc actif (B-2) : dérivé, aucun nouveau state.
  const activeArc = activeArcId ? STORY_ARCS.find((a) => a.id === activeArcId) ?? null : null;
  const progress = activeArc
    ? getArcProgress(getArcShape(activeArc, EVENT_DATABASE), answeredArcEventIds, currentEvent?.id ?? null)
    : [];
  const forkStep = progress.find((s) => s.skippedIds.length > 0) ?? null;
  const forkSub = forkStep
    ? {
        indent: 2 * (forkStep.seq - 1) + 1,
        title:
          'Variante non prise : ' +
          forkStep.skippedIds.map((id) => getEventById(id)?.title ?? id).join(', '),
      }
    : null;
  const currentStep = progress.find((s) => s.status === 'current');
  const seqLabel = currentStep?.seq ?? progress.filter((s) => s.status === 'done').length;
  const arcLabel = activeArc
    ? ARC_SHORT[activeArc.id] ??
      resolveArcName(activeArc.name, lifeContext.city, lifeContext.friendName, lifeContext.profession, lifeContext.churchName, lifeContext.spouseName)
    : '';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          alignItems: 'center',
          gap: 6,
          padding: '4px 0 2px',
        }}
      >
        {STORY_ARCS.map((arc) => {
          const completed = completedIds.has(arc.id);
          const active = activeArcId === arc.id;
          const encountered = encounteredArcIds.includes(arc.id);
          const visible = completed || encountered;

          if (!visible) return null;

          return (
            <div
              key={arc.id}
              title={`${resolveArcName(arc.name, lifeContext.city, lifeContext.friendName, lifeContext.profession, lifeContext.churchName, lifeContext.spouseName)}${completed ? ' (complété)' : active ? ' (en cours)' : ''}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 3,
                padding: '2px 7px',
                borderRadius: 10,
                fontSize: 9,
                fontWeight: 600,
                letterSpacing: 0.3,
                border: '1px solid',
                borderColor: completed
                  ? 'rgba(16,185,129,0.5)'
                  : active
                  ? 'rgba(245,158,11,0.7)'
                  : 'rgba(167,139,250,0.25)',
                background: completed
                  ? 'rgba(16,185,129,0.12)'
                  : active
                  ? 'rgba(245,158,11,0.15)'
                  : 'rgba(167,139,250,0.06)',
                color: completed
                  ? '#34d399'
                  : active
                  ? '#fbbf24'
                  : 'var(--text-muted)',
                animation: active ? 'arcPulse 2s ease-in-out infinite' : 'none',
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', fontSize: 10 }}>{ARC_ICONS[arc.id] ?? <span style={{ fontSize: 10 }}>◆</span>}</span>
              <span>{ARC_SHORT[arc.id] ?? resolveArcName(arc.name, lifeContext.city, lifeContext.friendName, lifeContext.profession, lifeContext.churchName, lifeContext.spouseName)}</span>
              {completed && <span style={{ fontSize: 8 }}>✓</span>}
            </div>
          );
        })}
      </div>

      {activeArc && progress.length > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, paddingBottom: 2 }}>
          <div
            style={{
              fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
              whiteSpace: 'pre',
              lineHeight: 1.05,
              fontSize: 11,
            }}
          >
            <div>
              {progress.map((s, i) => (
                <span key={`step-${s.seq}`}>
                  {i > 0 && <span style={{ color: STEP_CONNECTOR }}>─</span>}
                  <span
                    title={`Étape ${s.seq}${s.isFork ? ' · bifurcation' : ''}`}
                    style={{ color: stepColor(s) }}
                  >
                    {stepGlyph(s)}
                  </span>
                </span>
              ))}
            </div>
            {forkSub && (
              <div style={{ color: STEP_BRANCH }}>
                {' '.repeat(forkSub.indent)}
                <span title={forkSub.title}>╲┄◌</span>
              </div>
            )}
          </div>
          <span style={{ fontSize: 9, color: 'var(--text-muted)', letterSpacing: 0.3 }}>
            {arcLabel} · étape {seqLabel}/{activeArc.eventIds.length}
          </span>
        </div>
      )}

      <style>{`
        @keyframes arcPulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.6; }
        }
        @media (prefers-reduced-motion: reduce) {
          [style*="arcPulse"] { animation: none !important; }
        }
      `}</style>
    </div>
  );
}
