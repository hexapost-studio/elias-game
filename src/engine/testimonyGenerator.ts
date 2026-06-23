/**
 * testimonyGenerator.ts — Génère le témoignage de fin de vie d'Élias.
 *
 * Format : témoignage d'église francophone EJP/ICC.
 * Structuré depuis RunMetrics + journal + calling + titre.
 * Module PUR — aucun import React, testable.
 */
import type { GameState, JournalEntry, RunMetrics } from '../types/game';

export interface Testimony {
  /** Ligne d'identité : "[Nom], [calling] — mort à [âge] ans" */
  identity: string;
  /** Phrase d'ouverture contextuelle */
  opening: string;
  /** Épreuve fondatrice (event le plus mémorable du journal) */
  foundingTrial: string | null;
  /** Tournant de vie (premier arc complété ou moment fort) */
  lifeTurning: string | null;
  /** Dernière victoire (dernier event réussi) */
  lastVictory: string | null;
  /** Ligne de stats (versets, combo, titre) */
  stats: string;
  /** Citation biblique liée au calling */
  bibleQuote: string;
  /** Invitation à rejouer */
  replaySeed: string;
  /** Texte complet formaté pour le partage */
  fullText: string;
}

// ── Citations par calling ────────────────────────────────────────────────────

const CALLING_QUOTES: Record<string, string> = {
  berger:        '"Le Seigneur est mon berger; je ne manquerai de rien." — Psaume 23:1',
  evangeliste:   '"Allez par tout le monde et prêchez l\'Évangile à toute créature." — Marc 16:15',
  batisseur:     '"Si l\'Éternel ne bâtit la maison, ceux qui la bâtissent travaillent en vain." — Psaume 127:1',
  intercesseur:  '"La prière fervente du juste a une grande efficace." — Jacques 5:16',
  combattant:    '"J\'ai combattu le bon combat, j\'ai achevé la course, j\'ai gardé la foi." — 2 Timothée 4:7',
  disciple:      '"Venez, suivez-moi, et je vous ferai pêcheurs d\'hommes." — Matthieu 4:19',
};

const DEFAULT_QUOTE = '"Car c\'est moi qui connais les projets que j\'ai formés sur vous, projets de paix et non de malheur." — Jérémie 29:11';

// ── Phrases d'ouverture par calling × saison finale ──────────────────────────

function buildOpening(
  playerName: string,
  callingId: string | undefined,
  spiritualSeason: string,
  isVictory: boolean,
  age: number,
): string {
  if (isVictory) {
    const victoryLines: Record<string, string> = {
      berger:      `${playerName} a pris soin des siens jusqu'à l'âge de ${age} ans. Sa maison était ouverte. Son cœur aussi.`,
      evangeliste: `${playerName} a porté la Bonne Nouvelle jusqu'au bout de sa vie. À ${age} ans, la flamme brillait encore.`,
      batisseur:   `${playerName} a bâti ce qui dure — non pas en pierre, mais en vies transformées. ${age} ans de chantier fidèle.`,
      intercesseur:`${playerName} a veillé dans la prière jusqu'à l'âge de ${age} ans. Le ciel a entendu.`,
      combattant:  `${playerName} a tenu bon jusqu'à ${age} ans. Il/elle n'a pas abandonné le terrain.`,
      disciple:    `${playerName} a marché dans les pas de son Maître pendant ${age} ans. Chaque épreuve l'a rendu(e) plus semblable à Lui.`,
    };
    return victoryLines[callingId ?? ''] ?? `${playerName} a achevé sa course à ${age} ans. La grâce l'attendait au bout du chemin.`;
  }

  const seasonLines: Record<string, string> = {
    Réveil:      `${playerName} est parti(e) en plein réveil — dans la saison où Dieu faisait des choses nouvelles.`,
    Désert:      `${playerName} est parti(e) dans la saison du désert. Ce silence-là aussi avait un sens.`,
    Persécution: `${playerName} est parti(e) sous la pression — mais sans avoir renié sa foi.`,
    Abondance:   `${playerName} est parti(e) dans la saison de l'abondance. Dieu avait été fidèle jusqu'au bout.`,
    Grâce:       `${playerName} est parti(e) dans la saison de la grâce. Quelle façon de partir.`,
  };
  return seasonLines[spiritualSeason] ?? `${playerName} a terminé sa course. La grâce l'attendait au bout du chemin.`;
}

// ── Extraction des moments clés du journal ───────────────────────────────────

function extractKeyMoments(journal: JournalEntry[]): {
  founding: string | null;
  turning: string | null;
  lastWin: string | null;
} {
  // Épreuve fondatrice : premier [VICTOIRE] ou [SUCCÈS] marquant dans la première moitié de vie
  const successes = journal.filter(e => e.type === 'success' && e.verseRef);
  const firstSuccess = successes[0] ?? null;
  const founding = firstSuccess
    ? `À ${firstSuccess.age} ans — ${firstSuccess.text.replace(/^\[.*?\]\s*/, '').slice(0, 80)}…`
    : null;

  // Tournant : success event avec un verseRef différent, dans la tranche 30-60 ans
  const midSuccess = successes.find(e => e.age >= 28 && e.age <= 62 && e !== firstSuccess);
  const turning = midSuccess
    ? `À ${midSuccess.age} ans — ${midSuccess.text.replace(/^\[.*?\]\s*/, '').slice(0, 80)}…`
    : null;

  // Dernière victoire
  const lastSuccess = successes[successes.length - 1];
  const lastWin = lastSuccess && lastSuccess !== firstSuccess && lastSuccess !== midSuccess
    ? `À ${lastSuccess.age} ans — ${lastSuccess.text.replace(/^\[.*?\]\s*/, '').slice(0, 80)}…`
    : null;

  return { founding, turning, lastWin };
}

// ── Fonction principale ───────────────────────────────────────────────────────

export function generateTestimony(
  state: GameState,
  metrics: RunMetrics,
  titleName: string | null,
  unlockedVerses: number,
): Testimony {
  const { playerName, calling, spiritualSeason, seed } = state;
  const isVictory = metrics.ageAtDeath >= 100;

  const identity = `🙏 ${playerName}${calling ? `, ${calling.name}` : ''} — ${metrics.ageAtDeath} ans`;
  const opening = buildOpening(playerName, calling?.id, spiritualSeason, isVictory, metrics.ageAtDeath);
  const { founding, turning, lastWin } = extractKeyMoments(state.journal);

  const statParts = [`${unlockedVerses} versets mémorisés`];
  if (metrics.maxCombo >= 5) statParts.push(`combo max ×${metrics.maxCombo}`);
  if (titleName) statParts.push(`titre : ${titleName}`);
  const stats = statParts.join(' · ');

  const bibleQuote = CALLING_QUOTES[calling?.id ?? ''] ?? DEFAULT_QUOTE;
  const replaySeed = `Graine ${seed} — rejoue cette vie sur Élias`;

  const lines: string[] = [
    identity,
    '',
    opening,
    '',
  ];
  if (founding) lines.push(`◆ ${founding}`, '');
  if (turning)  lines.push(`◆ ${turning}`, '');
  if (lastWin)  lines.push(`◆ ${lastWin}`, '');
  lines.push(stats, '', bibleQuote, '', replaySeed);

  return {
    identity,
    opening,
    foundingTrial: founding,
    lifeTurning: turning,
    lastVictory: lastWin,
    stats,
    bibleQuote,
    replaySeed,
    fullText: lines.join('\n'),
  };
}
