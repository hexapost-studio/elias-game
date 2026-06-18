/**
 * @file echoLink.ts
 * @module engine/echoLink
 * @description Module pur (zéro React, zéro state) — amplifie la mémoire narrative en
 *   rendant VISIBLE le lien entre un choix passé et un événement conditionné présent.
 *
 *   Quand un event avec `prerequisites` est sur le point d'être présenté, ce module
 *   génère une entrée de journal de type « rappel » — une bulle sobre qui dit :
 *   « À 22 ans, tu as pardonné à Louise — c'est pourquoi cette porte s'ouvre. »
 *
 *   Ton : évangéliste, grâce > punition. La bulle célèbre la fidélité passée ou
 *   nomme humblement le chemin ouvert par une épreuve traversée.
 *
 *   Dérivation de l'émetteur :
 *   - Rappel de flag pardonné/positif → `heaven` (la grâce porte ses fruits)
 *   - Rappel d'arc/event complété positif → `heaven`
 *   - Rappel neutre ou verset débloqué → `conscience`
 *   (le sender est encodé dans l'entrée via un marqueur `[ECHO_LINK]` lisible par
 *   `deriveSenderFromJournalEntry` qui le traitera comme un milestone céleste.)
 *
 *   Pur et testable hors React. Réversible : retirer ce module + son usage dans
 *   `gameEngine.ts`, et les bulles de rappel disparaissent sans rien casser.
 *
 *   @see src/engine/echoes.ts             — mémoire narrative (traits + arcs)
 *   @see src/engine/messageSender.ts      — dérivation émetteur
 *   @see src/engine/gameEngine.ts         — consomme `buildEchoLinkEntry`
 *   @see docs/ROADMAP.md T-22
 *   @since itér. 39
 */

import type { AfflictionEvent, GameState, JournalEntry, EventRequirement } from '../types/game';
import { getEventById } from '../data/events';
import { getArcById } from '../data/storyArcs';
import { getVerseById } from '../data/verses';

/* ─── Helpers internes ─────────────────────────────────────────────────────── */

/**
 * Détermine l'âge approximatif auquel un prerequisite source a été rencontré,
 * en cherchant dans le journal de l'état courant.
 * Retourne `null` si introuvable (ne bloque pas — le rappel s'affiche sans âge).
 */
function findAgeInJournal(state: GameState, eventId: string): number | null {
  // Cherche d'abord dans answeredArcEventIds + journal (succès ou échec)
  for (const entry of state.journal) {
    if (
      entry.text.includes(eventId.substring(0, 12)) &&
      (entry.type === 'success' || entry.type === 'fail')
    ) {
      return entry.age;
    }
  }
  return null;
}

/** Libellé court d'un prerequisite selon son type. */
function prereqLabel(req: EventRequirement): string | null {
  switch (req.kind) {
    case 'flag': {
      // Libellés mémorisés pour les flags connus — ton grâce > punition
      const FLAG_LABELS: Record<string, string> = {
        louise_pardonnee: 'tu as choisi le pardon face à Louise',
        // Extensible : ajouter ici tout flag narratif déclaré dans les events
      };
      return FLAG_LABELS[req.flagId] ?? null;
    }

    case 'event_completed':
    case 'event_succeeded':
    case 'event_failed': {
      const src = getEventById(req.eventId);
      if (!src) return null;
      if (req.kind === 'event_succeeded') return `tu as surmonté « ${src.title} »`;
      if (req.kind === 'event_failed')    return `tu as traversé « ${src.title} »`;
      return `tu as rencontré « ${src.title} »`;
    }

    case 'arc_completed': {
      const arc = getArcById(req.arcId);
      if (!arc) return null;
      return `tu as accompli l'arc « ${arc.name} »`;
    }

    case 'verse_unlocked': {
      const verse = getVerseById(req.verseId);
      if (!verse) return null;
      return `tu as reçu le verset ${verse.reference}`;
    }

    default:
      // Satisfait le narrowing TypeScript exhaustif
      return null;
  }
}

/**
 * Retrouve l'âge associé à un prerequisite depuis le journal ou les données d'état.
 * Retourne `null` si l'âge est inconnu.
 */
function prereqAge(req: EventRequirement, state: GameState): number | null {
  switch (req.kind) {
    case 'flag': {
      // Pour les flags, on cherche l'event qui le pose via le journal
      // (heuristique : on parcourt le journal pour un success ou fail d'un event connu)
      // En pratique les flags sont posés lors du validateChoice → le journal contient la réponse.
      // On tente de trouver un success autour du flagId comme heuristique légère.
      const flagEventMap: Record<string, string> = {
        louise_pardonnee: 'arc-louise-2',
      };
      const srcEventId = flagEventMap[req.flagId];
      if (srcEventId) return findAgeInJournal(state, srcEventId);
      return null;
    }

    case 'event_completed':
    case 'event_succeeded':
    case 'event_failed':
      return findAgeInJournal(state, req.eventId);

    case 'arc_completed': {
      const completed = state.completedArcs.find((a) => a.arcId === req.arcId);
      return completed ? completed.completedAtAge : null;
    }

    case 'verse_unlocked': {
      const codexEntry = state.codex[req.verseId];
      return codexEntry?.unlockedAtAge ?? null;
    }

    default:
      return null;
  }
}

/**
 * Formule le texte sobre de la bulle de rappel.
 * Ton : sobre, évangéliste, porteur d'espérance.
 */
function formatRecallText(label: string, age: number | null, currentAge: number): string {
  if (age !== null && age !== currentAge) {
    const yearsAgo = currentAge - age;
    if (yearsAgo >= 2) {
      return `Il y a ${yearsAgo} ans (à ${age} ans), ${label}. Ce chemin-là ouvre maintenant cette porte.`;
    }
    return `À ${age} ans, ${label}. Ce chemin-là ouvre maintenant cette porte.`;
  }
  // Âge inconnu — formulation intemporelle
  const label0 = label[0]?.toUpperCase() ?? '';
  const labelRest = label.slice(1);
  return `${label0}${labelRest}. Ce chemin parcouru ouvre maintenant cette porte.`;
}

/* ─── API publique ─────────────────────────────────────────────────────────── */

/**
 * Génère une entrée de journal « rappel de causalité » pour un event conditionné.
 *
 * Retourne `null` si :
 * - l'event n'a pas de prerequisites, ou
 * - aucun prerequisite actif ne peut être formulé en texte lisible.
 *
 * La bulle générée porte le marqueur `[ECHO_LINK]` afin que
 * `deriveSenderFromJournalEntry` l'identifie comme un milestone céleste (sender heaven).
 *
 * @param event        L'événement qui va être présenté au joueur.
 * @param state        L'état courant de la partie (pour accéder au journal, arcs, codex).
 * @returns            Une `JournalEntry` de type `milestone`, ou `null`.
 */
export function buildEchoLinkEntry(
  event: AfflictionEvent,
  state: GameState,
): JournalEntry | null {
  if (!event.prerequisites || event.prerequisites.length === 0) return null;

  // Chercher le premier prerequisite qui peut être formulé de façon lisible
  for (const req of event.prerequisites) {
    const label = prereqLabel(req);
    if (!label) continue;

    const age = prereqAge(req, state);
    const text = `[ECHO_LINK] ${formatRecallText(label, age, state.age)}`;
    return {
      age: state.age,
      text,
      type: 'milestone',
    };
  }

  return null;
}

/**
 * Vérifie si un event conditionné mérite une bulle de rappel.
 * Prédicat léger — utilisé pour éviter d'appeler `buildEchoLinkEntry` inutilement.
 *
 * @param event  L'événement candidat.
 * @returns      `true` si l'event a des prerequisites formulables.
 */
export function hasEchoLink(event: AfflictionEvent): boolean {
  return Boolean(event.prerequisites && event.prerequisites.length > 0);
}
