/**
 * Lexique EJP/ICC — Glossaire communautaire.
 * Chaque entrée décrit un terme, son sens spirituel,
 * et comment il est utilisé dans les événements du jeu.
 */
export interface LexiconEntry {
  term: string;
  phonetic?: string;
  meaning: string;
  commonMisinterpretation: string;
  category: 'doctrine' | 'pratique' | 'sociolecte' | 'personnage';
  usageInGame: string;
  verseReference?: string;
}

export const LEXICON_EJP_ICC: LexiconEntry[] = [
  {
    term: 'Prodige',
    meaning: 'Miracle vivant — personne manifestant la puissance de Dieu dans sa vie quotidienne. Le joueur est un "Prodige" en devenir.',
    commonMisinterpretation: 'Ne signifie pas "enfant surdoué" ou "génie intellectuel".',
    category: 'doctrine',
    usageInGame: 'Identité du personnage. Le journal utilise "Prodige" pour désigner Élias en phase de victoire.',
    verseReference: 'Actes 2.19',
  },
  {
    term: 'Star',
    meaning: 'Serviteur actif et exemplaire. Une "star" dans le Royaume est celui qui sert le plus, pas celui qui brille le plus.',
    commonMisinterpretation: 'N\'a rien à voir avec la célébrité ou la notoriété mondaine.',
    category: 'sociolecte',
    usageInGame: 'Titre débloqué après X victoires consécutives. "Élias, Star de la foi."',
    verseReference: 'Daniel 12.3',
  },
  {
    term: 'Chair',
    meaning: 'Nature humaine déchue, l\'ennemi intérieur. Inclut les désirs, l\'orgueil, la rébellion contre Dieu.',
    commonMisinterpretation: 'Ne signifie pas "viande" ou "corps physique". La chair n\'est pas le corps.',
    category: 'doctrine',
    usageInGame: 'Type d\'affliction. "Combat contre la chair" est un événement récurrent.',
    verseReference: 'Galates 5.17',
  },
  {
    term: 'Cordeau de mesure',
    meaning: 'Limitation imposée (par l\'ennemi, la tradition, ou les mentalités) qui empêche la croissance. À briser par la vision.',
    commonMisinterpretation: 'N\'est pas un outil de construction légitime dans ce contexte. C\'est une limite à détruire.',
    category: 'doctrine',
    usageInGame: 'Événement "Cordeau de mesure" où Élias doit briser une limitation héritée.',
    verseReference: 'Zacharie 2.1-4',
  },
  {
    term: 'Ville ouverte',
    meaning: 'État de croissance illimitée, sans murs protecteurs car Dieu est la muraille de feu. Opposition à la ville mesurée/fermée.',
    commonMisinterpretation: 'N\'est pas l\'anarchie ou l\'absence de protection. La protection vient de Dieu directement.',
    category: 'doctrine',
    usageInGame: 'État final du jeu si Élias atteint un âge avancé avec les 4 jauges hautes.',
    verseReference: 'Zacharie 2.5',
  },
  {
    term: 'Anakazo',
    phonetic: 'an-na-ka-zo',
    meaning: 'Force de compulsion — poussée irrésistible pour accomplir sa mission. Ne pas abandonner, forcer le passage.',
    commonMisinterpretation: 'N\'est pas de l\'obstination charnelle ou du forcing humain. C\'est une poussée spirituelle.',
    category: 'pratique',
    usageInGame: 'Mécanique de "poussée" utilisable 1x par partie pour éviter un échec automatique.',
  },
  {
    term: 'Saine Scène',
    meaning: 'Sainte Cène — communion. Prononcé "saine cène" dans le sociolecte EJP.',
    commonMisinterpretation: 'Whisper transcrit "saine scène" à l\'oral. Aucun rapport avec une scène de théâtre.',
    category: 'sociolecte',
    usageInGame: 'Événement spécial de restauration des jauges.',
  },
  {
    term: 'Ras',
    meaning: 'Raccourci oral pour "rema" — reste avec moi, persevere, ne baisse pas les bras.',
    commonMisinterpretation: 'Ne signifie pas "ras-le-bol" ou "ras" comme quantité négligeable.',
    category: 'sociolecte',
    usageInGame: 'Message d\'encouragement dans le journal après un échec: "Ras, Élias. La prochaine fois."',
  },
  {
    term: 'Faux Modèles',
    meaning: 'Influenceurs, célébrités ou connaissances qui prônent une réussite sans Dieu, sans intégrité, ou sans effort véritable.',
    commonMisinterpretation: 'N\'est pas la même chose que des modèles tout court. Le piège est leur séduction.',
    category: 'pratique',
    usageInGame: 'Type d\'événement. Personnage non-joueur qui tente de détourner Élias de son couloir.',
    verseReference: 'Proverbes 1.10',
  },
  {
    term: 'Couloir personnel',
    meaning: 'La voie unique tracée par Dieu pour chaque personne. Refuser la copie des parcours des autres.',
    commonMisinterpretation: 'N\'est pas un chemin étroit rigide. C\'est une direction avec des marges de mouvement.',
    category: 'doctrine',
    usageInGame: 'Jauge de "Couloir" dans le HUD — alerte si le joueur choisit une réponse qui sort de sa destinée.',
  },
  {
    term: 'Quin-quin',
    meaning: 'Relations amoureuses prématurées qui deviennent une distraction massive et un piège de concentration.',
    commonMisinterpretation: 'N\'est pas une condamnation du mariage. C\'est une mise en garde sur le timing (la Saison).',
    category: 'sociolecte',
    usageInGame: 'Événement de tentation avec malus de concentration majeur si Élias succombe.',
    verseReference: 'Ecclésiaste 3.1',
  },
  {
    term: 'Hôtels familiaux',
    meaning: 'Forteresses spirituelles héritées des ancêtres (malédictions générationnelles, patterns destructeurs).',
    commonMisinterpretation: 'N\'a rien à voir avec des hôtels littéraux ou l\'hospitalité.',
    category: 'doctrine',
    usageInGame: 'Événements de "combat générationnel" où Élias doit briser des cycles familiaux.',
  },
  {
    term: '80/20 (Pareto spirituel)',
    meaning: 'Principe de priorisation: 80% des résultats viennent de 20% des efforts bien ciblés. Appliqué à la vie spirituelle.',
    commonMisinterpretation: 'N\'est pas une excuse pour négliger 80% de ses responsabilités.',
    category: 'pratique',
    usageInGame: 'Mécanique de priorisation. Certains événements ont un "coefficient" plus élevé.',
  },
  {
    term: 'La Saison',
    meaning: 'Principe de timing divin (Ecclésiaste 3). Tout a un temps. Discerner la saison évite les efforts mal placés.',
    commonMisinterpretation: 'N\'est pas du fatalisme ("ce n\'est pas ma saison" comme excuse).',
    category: 'doctrine',
    usageInGame: 'Multiplicateur de difficulté. Certains âges sont des "saisons de combat" plus intenses.',
    verseReference: 'Ecclésiaste 3.1-8',
  },
  {
    term: 'Mirror of the Word',
    meaning: 'Se regarder dans la Parole de Dieu comme dans un miroir pour voir qui on est vraiment (Jacques 1.23-25).',
    commonMisinterpretation: 'N\'est pas de l\'introspection psychologique. C\'est une confrontation à la vérité révélée.',
    category: 'pratique',
    usageInGame: 'Action spéciale "Méditation" qui restaure la jauge de Foi.',
    verseReference: 'Jacques 1.23-25',
  },
  {
    term: 'Cœur Pur',
    meaning: 'État de transparence et d\'intégrité sans hypocrisie. Condition pour voir Dieu (Matthieu 5.8).',
    commonMisinterpretation: 'N\'est pas la perfection morale. C\'est l\'honnêteté radicale devant Dieu.',
    category: 'doctrine',
    usageInGame: 'Multiplicateur de combo. Un cœur pur double les gains de stats pendant X tours.',
    verseReference: 'Matthieu 5.8',
  },
  {
    term: 'Ferveur',
    meaning: 'Prière intense et persévérante qui brise les résistances spirituelles. Prière "bouillante".',
    commonMisinterpretation: 'N\'est pas le volume vocal (prière criée). La ferveur est une qualité de foi, pas de décibels.',
    category: 'pratique',
    usageInGame: 'Action spéciale "Prière Fervente" qui brise un malus ou une limitation.',
    verseReference: 'Jacques 5.16',
  },
  {
    term: 'Muraille de feu',
    meaning: 'Protection divine directe qui remplace les défenses humaines (murs physiques, stratégies de protection charnelles).',
    commonMisinterpretation: 'N\'est pas une formule magique. C\'est une promesse conditionnelle liée à la gloire de Dieu.',
    category: 'doctrine',
    usageInGame: 'État de protection maximale activé quand les 4 jauges sont au-dessus de 70%.',
    verseReference: 'Zacharie 2.5',
  },
];

export function searchLexicon(term: string): LexiconEntry | undefined {
  return LEXICON_EJP_ICC.find(
    (e) =>
      e.term.toLowerCase().includes(term.toLowerCase()) ||
      (e.phonetic && e.phonetic.includes(term.toLowerCase()))
  );
}

export function getLexiconByCategory(category: string): LexiconEntry[] {
  return LEXICON_EJP_ICC.filter((e) => e.category === category);
}
