import { useGameStore } from '../stores/gameStore';
import { STORY_ARCS } from '../data/storyArcs';
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
  const currentEvent    = useGameStore((s) => s.currentEvent);
  const lifeContext     = useGameStore((s) => s.lifeContext);

  const completedIds = new Set(completedArcs.map((a) => a.arcId));
  const activeArcId = currentEvent?.storyArcId ?? null;
  const hasAnyArc = encounteredArcIds.length > 0 || completedIds.size > 0;

  if (!hasAnyArc) return null;

  return (
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

      <style>{`
        @keyframes arcPulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.6; }
        }
      `}</style>
    </div>
  );
}
