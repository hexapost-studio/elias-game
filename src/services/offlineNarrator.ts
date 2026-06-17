/**
 * @file offlineNarrator.ts
 * @description Narrateur « journal vivant » SANS IA.
 *
 * La narration IA (aiNarrator.ts) exige un backend que presque aucun joueur n'a
 * configuré. Ce module produit un journal intime varié et contextuel par
 * composition de templates + slot-filling pondéré — donc chaque année a une voix,
 * même hors-ligne. L'IA, quand elle est branchée, reste prioritaire (bonus).
 *
 * Sources de variété (→ des centaines de combinaisons) :
 *  - stade de vie (enfant / ado / adulte / senior)
 *  - saison spirituelle courante
 *  - Appel / Destinée
 *  - dernier trait gagné (narrationHook)
 *  - série de victoires / d'échecs récents
 *  - stat dominante / stat la plus faible
 *  - actions volontaires de l'année (prière, jeûne, service, appel à l'ami…)
 *  - contexte de vie (ville, ami, église, métier, conjoint, parents)
 *
 * Déterministe si on passe un rng seedé (tests / reproductibilité), vivant sinon.
 */
import type {
  StatName, SpiritualSeasonName, Calling, EarnedTrait, LifeContext,
} from '../types/game';
import { getTraitById } from '../data/traits';

export type LifeStage = 'enfant' | 'ado' | 'adulte' | 'senior';

export interface OfflineJournalContext {
  age: number;
  stats: Record<StatName, number>;
  season?: SpiritualSeasonName;
  calling?: Calling;
  traits?: EarnedTrait[];
  /** Traits gagnés précisément cette année (priorité narrative). */
  newTraitIds?: string[];
  /** Résultats des dernières épreuves (les plus récentes en dernier). */
  recentResults?: ('success' | 'fail')[];
  successRate?: number;
  lifeContext?: LifeContext;
  parentNames?: { father: string; mother: string };
  actionsThisYear?: string[];
}

type Rng = () => number;

function stageOf(age: number): LifeStage {
  if (age >= 60) return 'senior';
  if (age >= 18) return 'adulte';
  if (age >= 12) return 'ado';
  return 'enfant';
}

function pick<T>(rng: Rng, arr: readonly T[]): T {
  return arr[Math.floor(rng() * arr.length)] ?? arr[0];
}

/* ─── Banques de fragments ─── */

const STAGE_MUSING: Record<LifeStage, string[]> = {
  enfant: [
    'Le monde est grand et je commence à peine à le regarder.',
    'Je ne comprends pas tout, mais j\'écoute, et je retiens.',
    'On m\'a parlé de Dieu aujourd\'hui, et quelque chose en moi a dit oui.',
    'Je grandis vite. Les grands le disent souvent en me regardant.',
  ],
  ado: [
    'Je cherche qui je suis vraiment, sous le regard des autres.',
    'Tout me touche plus fort en ce moment — la joie comme la peine.',
    'Je veux que ma vie compte. Je ne sais pas encore comment.',
    'Il y a des jours où je doute de tout, et d\'autres où je brûle.',
  ],
  adulte: [
    'Les choix pèsent désormais leur vrai poids.',
    'Personne ne porte mes décisions à ma place. C\'est à moi de tenir.',
    'Je découvre que la fidélité, c\'est surtout les jours ordinaires.',
    'Le temps file, et je veux qu\'il file dans la bonne direction.',
  ],
  senior: [
    'Je regarde derrière moi et je vois une main qui m\'a tenu tout du long.',
    'Ce qui comptait avant compte moins. Ce qui était flou est devenu clair.',
    'Il me reste à transmettre plus qu\'à conquérir.',
    'La paix a un goût que la jeunesse ne connaît pas encore.',
  ],
};

const SEASON_REFLECTION: Record<SpiritualSeasonName, string[]> = {
  'Réveil': [
    'Une ferveur neuve me réveille avant même le jour.',
    'Tout semble possible — comme si le ciel s\'était rapproché.',
  ],
  'Désert': [
    'Le ciel me paraît silencieux, et pourtant je continue de marcher.',
    'C\'est sec, autour de moi et au-dedans. J\'apprends à avoir soif.',
  ],
  'Persécution': [
    'On me regarde de travers pour ce que je crois. Je ne plierai pas.',
    'L\'opposition s\'est faite plus dure cette année. Ma foi se trempe au feu.',
  ],
  'Abondance': [
    'Les portes s\'ouvrent, et je veille à garder mon cœur droit dans la bénédiction.',
    'Il y a du fruit partout — je n\'oublie pas d\'où il vient.',
  ],
  'Grâce': [
    'Je n\'ai rien mérité de ce repos, et c\'est exactement ce qui le rend doux.',
    'Une couverture invisible semble posée sur cette saison.',
  ],
};

const STAT_LOW: Record<StatName, string[]> = {
  foi: ['Ma foi vacille, et je m\'accroche à ce que je sais plus qu\'à ce que je sens.'],
  paix: ['La paix me fuit ces temps-ci ; mon cœur s\'agite pour un rien.'],
  physique: ['Le corps tire la sonnette d\'alarme. Je n\'ai plus vingt ans dans les os.'],
  finances: ['L\'argent manque, et la tentation de l\'inquiétude rôde.'],
};

const STAT_HIGH: Record<StatName, string[]> = {
  foi: ['Ma foi est solide comme un roc — rien ne semble pouvoir l\'ébranler.'],
  paix: ['Une paix profonde m\'habite, même quand tout s\'agite dehors.'],
  physique: ['Le corps suit, vigoureux ; je rends grâce pour cette force.'],
  finances: ['Je ne manque de rien, et j\'ai même de quoi tendre la main.'],
};

const STREAK_WIN = [
  'Victoire après victoire — je n\'ose pas y croire, et pourtant.',
  'Je suis porté ; chaque épreuve tombe l\'une après l\'autre.',
  'Il y a un élan en moi que rien n\'arrête en ce moment.',
];

const STREAK_FAIL = [
  'Je tombe, je me relève, je tombe encore. Mais je me relève toujours.',
  'Rien ne va comme je voudrais. J\'apprends à tenir dans le creux.',
  'Cette année m\'a mis à terre plus d\'une fois. Je ne lâche pas pour autant.',
];

const ACTION_LINE: Record<string, (lc?: LifeContext) => string> = {
  pray: () => 'J\'ai prié plus que d\'habitude — et le secret m\'a rendu plus fort.',
  fast: () => 'J\'ai jeûné cette année ; mon corps a faibli pour que mon esprit s\'élève.',
  serve: (lc) => `J'ai servi à ${lc?.churchName ?? 'l\'église'}, et donner m'a rempli.`,
  call_friend: (lc) => `J'ai repris contact avec ${lc?.friendName ?? 'un ami'} ; l'amitié sincère répare.`,
  read_word: () => 'J\'ai lu la Parole avec faim, et elle m\'a parlé droit au cœur.',
};

/* ─── Génération ─── */

function lowestStat(stats: Record<StatName, number>): StatName {
  return (Object.entries(stats) as [StatName, number][]).sort((a, b) => a[1] - b[1])[0][0];
}
function highestStat(stats: Record<StatName, number>): StatName {
  return (Object.entries(stats) as [StatName, number][]).sort((a, b) => b[1] - a[1])[0][0];
}

function fillSlots(s: string, ctx: OfflineJournalContext): string {
  const lc = ctx.lifeContext;
  const pn = ctx.parentNames;
  return s
    .replace(/\{ami\}/g, lc?.friendName ?? 'mon ami')
    .replace(/\{ville\}/g, lc?.city ?? 'ma ville')
    .replace(/\{métier\}/g, lc?.profession ?? 'mon travail')
    .replace(/\{église\}/g, lc?.churchName ?? 'mon église')
    .replace(/\{conjoint\}/g, lc?.spouseName ?? 'mon aimé(e)')
    .replace(/\{père\}/g, pn?.father ?? 'mon père')
    .replace(/\{mère\}/g, pn?.mother ?? 'ma mère');
}

/**
 * Produit une entrée de journal intime (1ère personne), 1 à 2 phrases.
 * Compose un « ouvreur » (signal le plus saillant) + parfois une touche de contexte.
 */
export function generateOfflineJournal(
  ctx: OfflineJournalContext,
  rng: Rng = Math.random,
): string {
  const stage = stageOf(ctx.age);
  const openers: string[] = [];

  // 1. Trait fraîchement gagné = priorité narrative absolue.
  const freshTrait = (ctx.newTraitIds ?? [])
    .map((id) => getTraitById(id)?.narrationHook)
    .filter((h): h is string => !!h);
  if (freshTrait.length > 0) openers.push(...freshTrait, ...freshTrait); // double poids

  // 2. Séries d'épreuves.
  const last3 = (ctx.recentResults ?? []).slice(-3);
  if (last3.length >= 2 && last3.every((r) => r === 'success')) openers.push(...STREAK_WIN);
  if (last3.length >= 2 && last3.every((r) => r === 'fail')) openers.push(...STREAK_FAIL);

  // 3. Actions volontaires de l'année.
  for (const a of ctx.actionsThisYear ?? []) {
    const fn = ACTION_LINE[a];
    if (fn) openers.push(fn(ctx.lifeContext));
  }

  // 4. Saison spirituelle.
  if (ctx.season && SEASON_REFLECTION[ctx.season]) openers.push(...SEASON_REFLECTION[ctx.season]);

  // 5. Extrêmes de stats.
  const low = lowestStat(ctx.stats);
  const high = highestStat(ctx.stats);
  if (ctx.stats[low] <= 30) openers.push(...STAT_LOW[low]);
  if (ctx.stats[high] >= 80) openers.push(...STAT_HIGH[high]);

  // 6. Filet : musing propre au stade de vie (toujours disponible).
  openers.push(...STAGE_MUSING[stage]);

  const opener = pick(rng, openers);

  // Touche de contexte occasionnelle (Appel ou ami) pour ancrer la voix.
  const tails: string[] = [];
  if (ctx.calling && rng() < 0.33) {
    tails.push(`Au fond, je sens que ma route est celle ${aOf(ctx.calling)} — ${ctx.calling.tagline.toLowerCase()}.`);
  }
  if (ctx.lifeContext?.friendName && rng() < 0.2) {
    tails.push(`{ami} n'est jamais loin quand le sol tremble.`);
  }
  const tail = tails.length > 0 && rng() < 0.6 ? ' ' + pick(rng, tails) : '';

  return fillSlots(opener + tail, ctx).trim();
}

/** Article + nom d'appel pour une tournure naturelle ("du Berger", "de l'Évangéliste"). */
function aOf(calling: Calling): string {
  const n = calling.name.replace(/^(Le |La |L'|Les )/, '');
  const lower = n.toLowerCase();
  if (/^[aeiouéèêh]/.test(lower)) return `de l'${n}`;
  return `du ${n}`;
}
