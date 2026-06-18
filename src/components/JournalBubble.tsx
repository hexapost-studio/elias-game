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
import { ENEMY_COMPONENTS } from './iconMeta';

/* ─── Helpers ──────────────────────────────────────────────────────────────── */

/**
 * Détermine si une entrée doit s'afficher à droite (réponse d'Élias).
 *
 * Règle : les entrées `success` et `fail` sont des réponses d'Élias (il a agi).
 * Les milestones de type victoire/échec restent à droite aussi (conscience).
 * Les `conscience` sender restent à droite.
 */
function isSelfEntry(entry: JournalEntry, sender: MessageSender): boolean {
  if (entry.type === 'success' || entry.type === 'fail' || entry.type === 'moral') return true;
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

/**
 * T-28 : pour un émetteur adversaire, extrait la clé de catégorie depuis l'iconKey.
 * `adversary_peur_angoisse` → `peur_angoisse`
 * `adversary_generic`       → `generic` (pas de SVG ennemi, retourne null)
 */
function extractEnemyCategory(sender: MessageSender): string | null {
  if (sender.sender !== 'adversary') return null;
  // iconKey = `adversary_<category>` où category peut contenir des underscores
  const prefix = 'adversary_';
  if (!sender.iconKey.startsWith(prefix)) return null;
  const category = sender.iconKey.slice(prefix.length);
  // Vérifier qu'un composant SVG existe pour cette catégorie
  return category in ENEMY_COMPONENTS ? category : null;
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

  // T-28 : composant SVG ennemi si disponible pour cet adversaire
  const enemyCategory = extractEnemyCategory(sender);
  const EnemySvg = enemyCategory !== null ? ENEMY_COMPONENTS[enemyCategory] : null;

  return (
    <div className={`jb-row ${isRight ? 'jb-row--right' : 'jb-row--left'}`}>
      {/* Avatar — gauche uniquement (à droite = implicite : c'est Élias) */}
      {!isRight && (
        <div
          className="jb-avatar"
          style={{ '--jb-color': sender.color } as React.CSSProperties}
          aria-hidden="true"
        >
          {/* T-28 : icône SVG ennemi si disponible, sinon lettre initiale */}
          {EnemySvg !== null ? <EnemySvg size={28} /> : avatarLetter(sender.iconKey)}
        </div>
      )}

      <div className="jb-bubble-col">
        {/* Nom de l'émetteur (gauche) ou âge (droite) */}
        {!isRight ? (
          <div className="jb-sender-name" style={{ color: sender.color }}>
            {sender.displayName}
            {/* T-28 : sous-titre « voix de l'adversaire » pour les bulles ennemies */}
            {sender.sender === 'adversary' && (
              <span className="jb-sender-subtitle"> — voix de l'adversaire</span>
            )}
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
