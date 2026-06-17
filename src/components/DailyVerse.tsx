import { verseOfDay } from '../engine/dailyVerse';

const VERSE_OF_DAY_POOL = [
  { ref: '2 Timothée 1.7', text: "Car ce n'est pas un esprit de timidité que Dieu nous a donnés..." },
  { ref: 'Psaume 27.1', text: "L'Éternel est ma lumière et mon salut: de qui aurai-je peur ?" },
  { ref: 'Jérémie 29.11', text: "Car je connais les projets que j'ai formés sur vous, dit l'Éternel..." },
  { ref: 'Philippiens 4.13', text: "Je puis tout par celui qui me fortifie." },
  { ref: 'Romains 8.28', text: "Nous savons que toutes choses concourent au bien de ceux qui aiment Dieu." },
  { ref: 'Ésaïe 41.10', text: "Ne crains rien, car je suis avec toi..." },
  { ref: 'Josué 1.9', text: "Fortifie-toi et prends courage ! Ne t'effraie point..." },
  { ref: 'Jean 14.27', text: "Je vous laisse la paix, je vous donne ma paix." },
];

export function DailyVerse() {
  // Dérivé pendant le rendu : le verset du jour est entièrement fonction de la date,
  // donc aucun state ni effet (invariant 3). Déterministe pour une journée donnée.
  const verse = verseOfDay(new Date(), VERSE_OF_DAY_POOL);

  return (
    <div style={{
      padding: '14px 16px',
      margin: '8px 12px',
      background: 'rgba(251,191,36,0.06)',
      border: '1px solid rgba(251,191,36,0.18)',
      borderRadius: 12,
    }}>
      <div style={{ fontSize: 9, color: 'var(--accent-gold)', letterSpacing: 1, fontWeight: 600, marginBottom: 6, textTransform: 'uppercase' }}>
        ✦ Verset du jour
      </div>
      <div style={{ fontSize: 12, lineHeight: 1.65, color: 'var(--text-secondary)', fontStyle: 'italic', marginBottom: 6 }}>
        « {verse.text} »
      </div>
      <div style={{ fontSize: 10, color: 'var(--accent-gold)', fontWeight: 600 }}>
        {verse.ref}
      </div>
    </div>
  );
}
