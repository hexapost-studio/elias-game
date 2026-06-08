import { useGameStore } from '../stores/gameStore';

export function Journal() {
  const journal = useGameStore((s) => s.journal);

  if (journal.length === 0) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        color: 'var(--text-muted)',
        fontSize: 13,
        fontStyle: 'italic',
      }}>
        Le voyage d'Élias commence...
      </div>
    );
  }

  return null; // Journal is rendered inside App.tsx directly
}
