/**
 * @file TypingIndicator.tsx
 * @module components/TypingIndicator
 * @description Composant pur — indicateur « en train d'écrire » façon messagerie.
 *
 *   Affiche l'émetteur avec 3 points animés (bounce échelonné) pendant ~1.2s
 *   avant que la bulle de l'épreuve n'apparaisse.
 *
 *   - Reçoit `sender: MessageSender` pour la couleur et le nom.
 *   - Reçoit `isTyping: boolean` — si false, ne rend rien (null).
 *   - `prefers-reduced-motion` : animation CSS désactivée (les points restent
 *     visibles mais statiques, durée réduite à 0 géré côté appelant).
 *
 *   @see src/engine/messageSender.ts  — dérivation de l'émetteur
 *   @see src/components/VerseChoices.tsx — orchestration du délai
 *   @since itér. 44
 */

import type { MessageSender } from '../engine/messageSender';

/* ─── Helpers ──────────────────────────────────────────────────────────────── */

/**
 * Dérive la première lettre lisible de l'iconKey pour l'avatar placeholder.
 * Réplique la logique de JournalBubble (même source : iconKey).
 */
function avatarLetter(iconKey: string): string {
  const parts = iconKey.split('_');
  const meaningful = parts[1] ?? parts[0] ?? '?';
  return meaningful[0]?.toUpperCase() ?? '?';
}

/* ─── Composant ────────────────────────────────────────────────────────────── */

interface TypingIndicatorProps {
  /** Émetteur dont on simule la frappe (couleur + nom + avatar). */
  sender: MessageSender;
  /** Afficher l'indicateur (true) ou le cacher (false). */
  isTyping: boolean;
}

/**
 * Indicateur « … en train d'écrire » : 3 points CSS animés avec délai échelonné.
 * Retourne null si `isTyping` est false — pas de place réservée dans le layout.
 */
export function TypingIndicator({ sender, isTyping }: TypingIndicatorProps) {
  if (!isTyping) return null;

  return (
    <div
      className="typing-indicator-row"
      role="status"
      aria-label={`${sender.displayName} est en train d'écrire…`}
    >
      {/* Avatar — cohérent avec JournalBubble */}
      <div
        className="jb-avatar"
        style={{ '--jb-color': sender.color } as React.CSSProperties}
        aria-hidden="true"
      >
        {avatarLetter(sender.iconKey)}
      </div>

      <div className="typing-indicator-bubble">
        {/* Nom de l'émetteur */}
        <div className="typing-indicator-name" style={{ color: sender.color }}>
          {sender.displayName}
        </div>

        {/* Conteneur des 3 points */}
        <div
          className="typing-indicator-dots"
          style={{ '--ti-color': sender.color } as React.CSSProperties}
          aria-hidden="true"
        >
          <span className="typing-indicator-dot typing-indicator-dot--1" />
          <span className="typing-indicator-dot typing-indicator-dot--2" />
          <span className="typing-indicator-dot typing-indicator-dot--3" />
        </div>
      </div>
    </div>
  );
}
