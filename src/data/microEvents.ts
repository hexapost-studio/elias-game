import type { MicroEvent } from '../types/game';

export const MICRO_EVENTS: MicroEvent[] = [
  // ═══ 0-6 ans — Petite enfance ═══
  {
    id: 'micro-001',
    text: 'Ton père te porte sur ses épaules en traversant le marché animé du quartier.',
    ageRange: [1, 5],
    statBonus: { paix: 2 },
  },
  {
    id: 'micro-002',
    text: 'Ta mère t\'endort en chantant un cantique. Tu reconnais déjà la mélodie.',
    ageRange: [1, 4],
    statBonus: { paix: 2, foi: 1 },
  },
  {
    id: 'micro-003',
    text: 'Tu apprends à marcher. Chaque chute est une leçon que tu ne sais pas encore nommer.',
    ageRange: [1, 2],
    statBonus: { physique: 2 },
  },
  {
    id: 'micro-004',
    text: 'L\'odeur du riz au poulet envahit la maison. C\'est dimanche — il y a du monde et des rires.',
    ageRange: [1, 8],
    statBonus: { paix: 1 },
  },
  {
    id: 'micro-005',
    text: 'Un oncle t\'offre un livre illustré des histoires de la Bible. Tu le regardes des heures.',
    ageRange: [2, 7],
    statBonus: { foi: 2 },
  },
  {
    id: 'micro-006',
    text: 'La famille prie ensemble le soir. Tu imites les adultes sans comprendre tous les mots.',
    ageRange: [2, 6],
    statBonus: { foi: 1, paix: 1 },
  },
  {
    id: 'micro-007',
    text: 'Le chat du quartier vient dormir dans ta chambre. Tu lui donnes un nom solennel.',
    ageRange: [2, 9],
    statBonus: { paix: 2 },
  },
  {
    id: 'micro-008',
    text: 'Il pleut fort et tu n\'iras pas à l\'école aujourd\'hui. La maison sent le bois mouillé.',
    ageRange: [3, 10],
  },

  // ═══ 6-12 ans — Enfance ═══
  {
    id: 'micro-009',
    text: 'À l\'école du dimanche, tu mémorises ton premier verset par cœur. L\'enseignante sourit.',
    ageRange: [6, 12],
    statBonus: { foi: 3 },
  },
  {
    id: 'micro-010',
    text: 'Tu remportes un concours de mémorisation de versets. Premier prix : une petite Bible neuve.',
    ageRange: [7, 13],
    statBonus: { foi: 4, paix: 2 },
  },
  {
    id: 'micro-011',
    text: 'Ton meilleur ami déménage dans une autre ville. Vous promettez de ne pas vous oublier.',
    ageRange: [6, 14],
    statBonus: { paix: -1 },
  },
  {
    id: 'micro-012',
    text: 'Ton équipe remporte le tournoi de foot du quartier. La gloire dure trois jours.',
    ageRange: [7, 14],
    statBonus: { physique: 2, paix: 2 },
  },
  {
    id: 'micro-013',
    text: 'Ta mère t\'apprend à faire du pain. Tu es son assistant le plus enthousiaste.',
    ageRange: [6, 12],
    statBonus: { paix: 2 },
  },
  {
    id: 'micro-014',
    text: 'Une voisine te demande de prier avec elle. C\'est ta première prière dite à voix haute devant quelqu\'un.',
    ageRange: [7, 13],
    statBonus: { foi: 3 },
  },
  {
    id: 'micro-015',
    text: 'Tu lis le livre de Jonas d\'une traite. Tu te demandes si le poisson était vraiment si grand.',
    ageRange: [8, 14],
    statBonus: { foi: 2 },
  },
  {
    id: 'micro-016',
    text: 'Tu apprends à faire du vélo. Ton père court à côté puis te lâche sans te prévenir.',
    ageRange: [6, 10],
    statBonus: { physique: 2, paix: 1 },
  },
  {
    id: 'micro-017',
    text: 'Ton école organise une fête de fin d\'année. Tu danses même si tu ne sais pas danser.',
    ageRange: [7, 14],
    statBonus: { paix: 2 },
  },

  // ═══ 12-18 ans — Adolescence ═══
  {
    id: 'micro-018',
    text: 'Le camp de jeunes de l\'église change quelque chose en toi. Tu rentres différent, plus calme.',
    ageRange: [12, 18],
    statBonus: { foi: 4, paix: 3 },
  },
  {
    id: 'micro-019',
    text: 'Tu apprends à jouer de la guitare pour accompagner la louange. Tes doigts font mal mais tu continues.',
    ageRange: [12, 20],
    statBonus: { foi: 2, paix: 1 },
  },
  {
    id: 'micro-020',
    text: 'Un professeur croit en toi. Il te prête des livres que tu lis en cachette le soir.',
    ageRange: [13, 18],
    statBonus: { paix: 2 },
  },
  {
    id: 'micro-021',
    text: 'Ton groupe de cellule devient ta deuxième famille. Le vendredi soir, tu attends ça toute la semaine.',
    ageRange: [13, 25],
    statBonus: { foi: 2, paix: 3 },
  },
  {
    id: 'micro-022',
    text: 'Tu organises une soirée prière dans ta chambre avec trois amis. Vous restez jusqu\'à minuit.',
    ageRange: [14, 22],
    statBonus: { foi: 3 },
  },
  {
    id: 'micro-023',
    text: 'Tu réussis un examen important. Ta mère prépare ton plat préféré pour fêter ça.',
    ageRange: [12, 22],
    statBonus: { paix: 3, finances: 1 },
  },
  {
    id: 'micro-024',
    text: 'Un prédicateur de passage laisse une parole dans ton cœur que tu ne sauras jamais oublier.',
    ageRange: [12, 20],
    statBonus: { foi: 4 },
  },
  {
    id: 'micro-025',
    text: 'Tu commences un journal de gratitude. Le premier soir, tu écris deux lignes. Puis tu continues.',
    ageRange: [14, 30],
    statBonus: { paix: 2, foi: 1 },
  },

  // ═══ 18-30 ans — Jeunesse ═══
  {
    id: 'micro-026',
    text: 'Tu obtiens ton diplôme. Ta mère pleure de joie. Ton père serre la main de tout le monde.',
    ageRange: [18, 26],
    statBonus: { finances: 3, paix: 3 },
  },
  {
    id: 'micro-027',
    text: 'Tu trouves ton premier appartement. Il est petit, mais il est à toi.',
    ageRange: [18, 28],
    statBonus: { finances: 2, paix: 2 },
  },
  {
    id: 'micro-028',
    text: 'Tu donnes ta première dîme. Ça fait un peu mal. Et en même temps, tu te sens libre.',
    ageRange: [18, 30],
    statBonus: { foi: 3 },
  },
  {
    id: 'micro-029',
    text: 'Un ami t\'invite à un séminaire sur la Parole. Tu prends 6 pages de notes et tu rentres envahi.',
    ageRange: [18, 35],
    statBonus: { foi: 3, paix: 1 },
  },
  {
    id: 'micro-030',
    text: 'Ta première nuit de prière complète se termine au lever du soleil. Tu rentres en paix totale.',
    ageRange: [16, 30],
    statBonus: { foi: 4, paix: 2 },
  },
  {
    id: 'micro-031',
    text: 'Tu es témoin au mariage d\'un ami. La joie de la cérémonie est contagieuse et dure des jours.',
    ageRange: [19, 35],
    statBonus: { paix: 3 },
  },
  {
    id: 'micro-032',
    text: 'Tu rencontres quelqu\'un à l\'église qui va compter dans ta vie. Tu ne le sais pas encore.',
    ageRange: [18, 35],
    statBonus: { paix: 2 },
  },

  // ═══ 30-50 ans — Adulte ═══
  {
    id: 'micro-033',
    text: 'Ton enfant dit ses premiers mots. Tu prends conscience du poids de ce que tu transmets.',
    ageRange: [25, 45],
    statBonus: { paix: 3, foi: 2 },
  },
  {
    id: 'micro-034',
    text: 'Ton entreprise publie son premier bilan positif. Les nuits blanches valaient quelque chose.',
    ageRange: [24, 50],
    statBonus: { finances: 4, paix: 2 },
  },
  {
    id: 'micro-035',
    text: 'Ton église ouvre une deuxième salle de culte. Tu y as contribué de tes mains et de ton temps.',
    ageRange: [25, 60],
    statBonus: { foi: 3, paix: 2 },
  },
  {
    id: 'micro-036',
    text: 'Un témoignage que tu as partagé il y a trois ans touche quelqu\'un aujourd\'hui. Tu l\'apprends par hasard.',
    ageRange: [22, 60],
    statBonus: { foi: 3, paix: 2 },
  },
  {
    id: 'micro-037',
    text: 'Tu passes une semaine de jeûne. Le 5ème jour, quelque chose se dénoue intérieurement.',
    ageRange: [20, 60],
    statBonus: { foi: 5, paix: 2 },
  },
  {
    id: 'micro-038',
    text: 'Ta communauté organise une action humanitaire dans le quartier. Tu consacres ton week-end entier.',
    ageRange: [18, 70],
    statBonus: { paix: 3, foi: 1 },
  },
  {
    id: 'micro-039',
    text: 'Ton fils t\'imite en priant avant de dormir. Tu restes dans l\'embrasure de la porte sans bruit.',
    ageRange: [28, 55],
    statBonus: { paix: 4, foi: 3 },
  },
  {
    id: 'micro-040',
    text: 'Tu retrouves un vieux carnet de notes de tes années de cellule. Tu ris et tu es ému en même temps.',
    ageRange: [28, 60],
    statBonus: { paix: 2, foi: 2 },
  },

  // ═══ 50-70 ans — Maturité ═══
  {
    id: 'micro-041',
    text: 'Ton fils t\'appelle pour te demander un conseil. Il a grandi sans que tu t\'en rendes compte.',
    ageRange: [45, 70],
    statBonus: { paix: 3 },
  },
  {
    id: 'micro-042',
    text: 'Tu es invité comme ancien dans un conseil d\'église. Le poids de cette confiance te touche.',
    ageRange: [45, 75],
    statBonus: { foi: 3, paix: 2 },
  },
  {
    id: 'micro-043',
    text: 'Tu trouves une vieille photo de famille. Les souvenirs remontent comme une vague douce.',
    ageRange: [40, 80],
    statBonus: { paix: 2 },
  },
  {
    id: 'micro-044',
    text: 'Un médecin te dit que tu as la santé d\'un homme bien plus jeune. Tu rentres en chantant.',
    ageRange: [50, 70],
    statBonus: { physique: 3, paix: 2 },
  },
  {
    id: 'micro-045',
    text: 'Ta fille se marie. Tu retiens tes larmes... presque.',
    ageRange: [42, 65],
    statBonus: { paix: 4 },
  },
  {
    id: 'micro-046',
    text: 'Tu prépares un message pour les jeunes de l\'église. Tu mets plus de soin qu\'à n\'importe quoi d\'autre.',
    ageRange: [35, 70],
    statBonus: { foi: 3 },
  },
  {
    id: 'micro-047',
    text: 'Un pasteur cite quelque chose que tu lui as dit il y a vingt ans. Il ne sait pas que c\'est toi.',
    ageRange: [50, 80],
    statBonus: { foi: 3, paix: 2 },
  },

  // ═══ 70-100 ans — Séniorité ═══
  {
    id: 'micro-048',
    text: 'Tu te souviens d\'un verset que ta mère t\'a appris à 5 ans. Il est toujours là, intact dans ta mémoire.',
    ageRange: [65, 100],
    statBonus: { foi: 3, paix: 2 },
  },
  {
    id: 'micro-049',
    text: 'Ton premier petit-enfant apprend à marcher. Tu reconnais quelque chose de toi dans sa démarche.',
    ageRange: [55, 90],
    statBonus: { paix: 4 },
  },
  {
    id: 'micro-050',
    text: 'Tu marches plus lentement maintenant. Mais tu marches encore, et ça compte.',
    ageRange: [70, 100],
    statBonus: { physique: 1, paix: 2 },
  },
  {
    id: 'micro-051',
    text: 'Tu es assis dans la même chaise de prière depuis 30 ans. Elle est à la forme de ton corps.',
    ageRange: [70, 100],
    statBonus: { foi: 3, paix: 3 },
  },
  {
    id: 'micro-052',
    text: 'Une jeune personne te demande de la mentorer. Tu acceptes sans hésiter.',
    ageRange: [60, 95],
    statBonus: { foi: 2, paix: 3 },
  },
  {
    id: 'micro-053',
    text: 'Tu lis la Bible du début à la fin, encore une fois. Tu ne comptes plus combien de fois.',
    ageRange: [60, 100],
    statBonus: { foi: 4 },
  },
  {
    id: 'micro-054',
    text: 'Il fait beau. Tu es assis dans le jardin, les yeux mi-clos. La paix est totale.',
    ageRange: [65, 100],
    statBonus: { paix: 3 },
  },
  {
    id: 'micro-055',
    text: 'Tu repenses à ta vie et tu ne comptes pas les regrets — tu comptes les grâces. Il y en a beaucoup.',
    ageRange: [75, 100],
    statBonus: { paix: 4, foi: 3 },
  },
];

export function getMicroEventForAge(age: number): MicroEvent | null {
  const available = MICRO_EVENTS.filter(
    (e) => age >= e.ageRange[0] && age <= e.ageRange[1]
  );
  if (available.length === 0) return null;
  const probability = available[0].probability ?? 0.5;
  if (Math.random() > probability * 2) {
    // pick randomly from available
    return available[Math.floor(Math.random() * available.length)];
  }
  return available[Math.floor(Math.random() * available.length)];
}
