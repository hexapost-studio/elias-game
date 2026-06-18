/**
 * @file JournalBubble.tsx
 * @module components/JournalBubble
 * @description Rendu pur d'une entrée de journal comme bulle de chat attribuée.
 *
 *   - Bulle GAUCHE  : heaven / adversary / entourage (l'événement qui arrive)
 *   - Bulle DROITE  : conscience + entrées-réponse d'Élias (success / fail + verset)
 *   - Couleur de la bulle dérivée de `MessageSender.color`
 *   - Avatar = cercle coloré + première lettre du `iconKey` (asset-ready pour T-31)
 *   - prefers-reduced-motion : animation désactivée automatiquement
 *
 *   @see src/engine/messageSender.ts  — dérivation de l'émetteur (T-20)
 *   @see docs/ROADMAP.md T-21
 *   @since itér. 38
 */

import type { JournalEntry } from '../types/game';
import type { MessageSender } from '../engine/messageSender';

/* ─── Helpers ──────────────────────────────────────────────────────────────── */

/**
 * Détermine si une entrée doit s'afficher à droite (réponse d'Élias).
 *
 * Règle : les entrées `success` et `fail` sont des réponses d'Élias (il a agi).
 * Les milestones de type victoire/échec restent à droite aussi (conscience).
 * Les `conscience` sender restent à droite.
 */
function isSelfEntry(entry: JournalEntry, sender: MessageSender): boolean {
  if (entry.type === 'success' || entry.type === 'fail') return true;
  if (sender.sender === 'conscience') return true;
  return false;
}

/**
 * Dérive la première lettre lisible de l'iconKey pour l'avatar placeholder.
 * ex. `heaven_esprit` → `E`, `adversary_peur_angoisse` → `P`
 */
function avatarLetter(iconKey: string): string {
  const parts = iconKey.split('_');
  // Ignorer le préfixe émetteur (premier segment), prendre la 2e partie
  const meaningful = parts[1] ?? parts[0] ?? '?';
  return meaningful[0]?.toUpperCase() ?? '?';
}

/* ─── Composant ────────────────────────────────────────────────────────────── */

interface JournalBubbleProps {
  entry: JournalEntry;
  sender: MessageSender;
}

export function JournalBubble({ entry, sender }: JournalBubbleProps) {
  const isRight = isSelfEntry(entry, sender);

  // Milestone pur (saison, naissance, réveil) → bande pleine largeur centrée
  if (entry.type === 'milestone') {
    const isChapter = entry.text.startsWith('[CHAPITRE]');
    const isCliffhanger = entry.text.startsWith('[CLIFFHANGER]');
    const extraClass = isChapter
      ? ' jb-milestone--chapter'
      : isCliffhanger
      ? ' jb-milestone--cliffhanger'
      : '';
    return (
      <div
        className={`jb-milestone${extraClass}`}
        style={{ '--jb-color': sender.color } as React.CSSProperties}
      >
        {(isChapter || isCliffhanger) ? null : (
          <span className="jb-milestone-icon">{avatarLetter(sender.iconKey)}</span>
        )}
        <span className="jb-milestone-text">{entry.text}</span>
      </div>
    );
  }

  return (
    <div className={`jb-row ${isRight ? 'jb-row--right' : 'jb-row--left'}`}>
      {/* Avatar — gauche uniquement (à droite = implicite : c'est Élias) */}
      {!isRight && (
        <div
          className="jb-avatar"
          style={{ '--jb-color': sender.color } as React.CSSProperties}
          aria-hidden="true"
        >
          {avatarLetter(sender.iconKey)}
        </div>
      )}

      <div className="jb-bubble-col">
        {/* Nom de l'émetteur (gauche) ou âge (droite) */}
        {!isRight ? (
          <div className="jb-sender-name" style={{ color: sender.color }}>
            {sender.displayName}
            {entry.age > 0 && <span className="jb-age-tag"> · {entry.age}a</span>}
          </div>
        ) : (
          <div className="jb-sender-name jb-sender-name--right">
            {entry.age > 0 && <span className="jb-age-tag">{entry.age}a</span>}
          </div>
        )}

        {/* Bulle de texte */}
        <div
          className={`jb-bubble jb-bubble--${entry.type}`}
          style={{ '--jb-color': sender.color } as React.CSSProperties}
        >
          {entry.text}
        </div>
      </div>

      {/* Avatar Élias (droite) */}
      {isRight && (
        <div
          className="jb-avatar jb-avatar--self"
          aria-hidden="true"
        >
          É
        </div>
      )}
    </div>
  );
}
