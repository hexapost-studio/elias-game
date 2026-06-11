import type { MicroEvent, LifeContext } from '../types/game';

export const MICRO_EVENTS: MicroEvent[] = [
  // ═══ 0-6 ans — Moments narratifs rares (probability < 1 = rare mais possible) ═══
  {
    id: 'micro-infant-001',
    text: 'Tu arrives au monde en pleurant. {père} répète à mi-voix dans le couloir : "Merci, Seigneur. Merci." Il ne sait pas encore que ce murmure sera le premier son que tu mémoriseras.',
    ageRange: [0, 0],
    statBonus: { foi: 1, paix: 1 },
  },
  {
    id: 'micro-infant-002',
    text: 'Un ancien de l\'église pose sa main rugueuse sur ton front de nourrisson et prononce quelque chose à voix basse. Tes parents échangent un regard. Toi, tu dors — mais ton esprit a enregistré chaque mot.',
    ageRange: [0, 1],
    statBonus: { foi: 2 },
  },
  {
    id: 'micro-infant-003',
    text: '{père} t\'apprend à dire son nom et "merci à Dieu" en même temps. Les deux arrivent dans le même souffle. {mère} rit aux larmes. Pour eux, ce sont tes premiers mots. Pour toi, c\'est déjà le monde dans sa totalité.',
    ageRange: [1, 2],
    statBonus: { paix: 2, foi: 1 },
  },
  {
    id: 'micro-infant-004',
    text: '{mère} s\'agenouille chaque nuit avant d\'éteindre la lumière. Tu fais semblant de dormir pour l\'observer. Ses lèvres bougent sans bruit. Tu sais que c\'est pour toi. Tu ne comprendras le poids de ces prières que des décennies plus tard.',
    ageRange: [2, 4],
    statBonus: { foi: 2, paix: 1 },
  },
  {
    id: 'micro-infant-005',
    text: 'C\'est le dimanche de la Pentecôte. L\'église est bondée, les chants ébranlent les murs. Tu t\'agrippes à la jupe de {mère} et tu regardes tout ça les yeux écarquillés. Quelque chose en toi reconnaît cet endroit avant même de pouvoir le nommer.',
    ageRange: [3, 5],
    statBonus: { foi: 3 },
  },
  {
    id: 'micro-infant-006',
    text: 'La nuit, entre le sommeil et l\'éveil, tu entends quelque chose — pas une voix, pas un rêve. Une certitude posée en toi comme une graine qu\'on ne voit pas encore mais qui est déjà vivante.',
    ageRange: [4, 6],
    statBonus: { foi: 2, paix: 2 },
  },

  // ═══ 0-6 ans — Petite enfance ═══
  {
    id: 'micro-001',
    text: '{père} te porte sur ses épaules en traversant le marché animé du quartier.',
    ageRange: [1, 5],
    statBonus: { paix: 2 },
  },
  {
    id: 'micro-002',
    text: '{mère} t\'endort en chantant un cantique. Tu reconnais déjà la mélodie.',
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
    text: '{mère} t\'apprend à faire du pain. Tu es son assistant le plus enthousiaste.',
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
    text: '{père} te montre à faire du vélo. Il court à côté puis te lâche sans te prévenir.',
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
    text: 'Tu réussis un examen important. {mère} prépare ton plat préféré pour fêter ça.',
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
    text: 'Tu obtiens ton diplôme. {mère} pleure de joie. {père} serre la main de tout le monde.',
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
    text: 'Un ami t\'invite à un séminaire sur la Parole. Tu prends six pages de notes et tu rentres envahi.',
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
    text: '{église} ouvre une deuxième salle de culte. Tu y as contribué de tes mains et de ton temps.',
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
    text: 'Tu te souviens d\'un verset que {mère} t\'a appris à 5 ans. Il est toujours là, intact dans ta mémoire.',
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

  // ═══ VIE QUOTIDIENNE ═══
  {
    id: 'micro-056',
    text: '{père} entre dans ta chambre à l\'aube. Il pose sa main sur ta tête et prie en murmurant. Tu fais semblant de dormir.',
    ageRange: [1, 14],
    statBonus: { foi: 2, paix: 3 },
  },
  {
    id: 'micro-057',
    text: 'La lumière s\'éteint sans prévenir. En quelques minutes, toute la maison se rassemble autour de bougies. Les histoires commencent.',
    ageRange: [2, 20],
    statBonus: { paix: 2 },
  },
  {
    id: 'micro-058',
    text: 'Au marché avec {mère}, les odeurs et les couleurs te dépassent. Elle t\'apprend le nom de chaque légume, chaque épice.',
    ageRange: [3, 12],
    statBonus: { paix: 2 },
  },
  {
    id: 'micro-059',
    text: 'La rentrée scolaire. Nouveaux cahiers, nouvelle trousse, odeur de plastique neuf. L\'année commence.',
    ageRange: [6, 18],
    statBonus: { paix: 1 },
  },
  {
    id: 'micro-060',
    text: 'Tu reçois ton premier téléphone. Pendant une semaine, tu ne sais plus quoi en faire — et tu ne le poses plus.',
    ageRange: [10, 17],
    statBonus: { paix: 1 },
  },
  {
    id: 'micro-061',
    text: 'La Coupe d\'Afrique est à la télé. Toute la famille crie sur le même but. Ça résonne dans tout l\'immeuble.',
    ageRange: [5, 50],
    statBonus: { paix: 2 },
  },
  {
    id: 'micro-062',
    text: 'Le 25 décembre, tu portes des vêtements neufs pour la première fois de l\'année. La messe est longue, mais la joie est réelle.',
    ageRange: [3, 20],
    statBonus: { paix: 3, foi: 1 },
  },
  {
    id: 'micro-063',
    text: 'La vigile du Nouvel An se termine à l\'aube. Tu rentres avec le soleil qui se lève. Quelque chose s\'est renouvelé à l\'intérieur.',
    ageRange: [5, 55],
    statBonus: { foi: 3, paix: 2 },
  },
  {
    id: 'micro-064',
    text: 'Embouteillage monstre sur le périphérique. Deux heures pour vingt kilomètres. Tu finis par prier les yeux ouverts.',
    ageRange: [18, 55],
    statBonus: { foi: 1 },
  },
  {
    id: 'micro-065',
    text: 'Courses du samedi matin. Liste en main, tu traverses le marché ou le supermarché. Un rituel hebdomadaire.',
    ageRange: [20, 60],
    statBonus: { paix: 1 },
  },
  {
    id: 'micro-066',
    text: 'Le dimanche, la cuisine sent bon depuis le matin. Le repas est long, mais personne ne presse.',
    ageRange: [20, 65],
    statBonus: { paix: 3 },
  },
  {
    id: 'micro-067',
    text: 'Café du matin, journal ou téléphone. Le monde tourne. Tu te demandes comment prier pour tout ça.',
    ageRange: [30, 75],
    statBonus: { foi: 1 },
  },
  {
    id: 'micro-068',
    text: 'La coupure de courant tombe pile pendant les devoirs. À la bougie, tout semble plus calme — et plus compliqué.',
    ageRange: [8, 18],
  },
  {
    id: 'micro-069',
    text: 'Les vendeurs du quartier crient leurs prix depuis l\'aube. Tu connais leurs voix par cœur sans avoir appris leurs noms.',
    ageRange: [5, 60],
    statBonus: { paix: 1 },
  },
  {
    id: 'micro-070',
    text: 'Les premières pluies de la saison tombent enfin. La terre libère une odeur profonde. Tout le monde respire différemment.',
    ageRange: [1, 90],
    statBonus: { paix: 2 },
  },

  // ═══ PARENTS NOMMÉS ═══
  {
    id: 'micro-071',
    text: '{mère} chante en cuisinant. Toujours les mêmes cantiques depuis que tu es petit. Tu en connais tous les mots sans jamais avoir décidé de les apprendre.',
    ageRange: [1, 16],
    statBonus: { paix: 3, foi: 1 },
  },
  {
    id: 'micro-072',
    text: '{père} rentre épuisé ce soir. Tu vois le poids sur ses épaules. Tu ne dis rien, mais tu retiens une prière dans ta tête.',
    ageRange: [8, 20],
    statBonus: { foi: 1 },
  },
  {
    id: 'micro-073',
    text: '{mère} est hospitalisée. Tu passes une partie de la nuit assis dans le couloir des urgences, la Bible ouverte sur les genoux.',
    ageRange: [10, 45],
    statBonus: { foi: 2, paix: -2 },
  },
  {
    id: 'micro-074',
    text: 'Le jour de ta remise de diplôme, {père} pleure. C\'est la première fois que tu le vois pleurer. Tu ne l\'oublieras jamais.',
    ageRange: [17, 30],
    statBonus: { paix: 4, finances: 2 },
  },
  {
    id: 'micro-075',
    text: '{mère} appelle chaque dimanche à la même heure. Parfois tu es trop fatigué pour décrocher. Mais quand elle ne rappelle pas, tu t\'inquiètes.',
    ageRange: [20, 55],
    statBonus: { paix: 2 },
  },
  {
    id: 'micro-076',
    text: '{mère} ne peut plus vraiment vivre seule. Tu prépares la chambre du fond. C\'est une grâce et un poids à la fois.',
    ageRange: [45, 80],
    statBonus: { foi: 2, paix: 1 },
  },
  {
    id: 'micro-077',
    text: 'Tu poses des fleurs sur la tombe de {père}. Le silence du cimetière est différent des autres silences. Tu lui parles quand même.',
    ageRange: [25, 75],
    statBonus: { foi: 2, paix: 1 },
  },
  {
    id: 'micro-078',
    text: 'Avant une grande décision, tu vas voir {père}. Il ne te donne pas de réponse. Il prie avec toi. C\'est mieux.',
    ageRange: [10, 35],
    statBonus: { foi: 3, paix: 2 },
  },
  {
    id: 'micro-079',
    text: 'Tu appelles {mère} depuis l\'autre bout du monde, tard dans la nuit — c\'est l\'aube chez elle. Sa voix efface la distance d\'un coup.',
    ageRange: [20, 50],
    statBonus: { paix: 3 },
  },
  {
    id: 'micro-080',
    text: 'Tu prépares le repas de famille annuel avec {mère}. La même recette depuis trente ans, le même geste pour la sauce.',
    ageRange: [18, 55],
    statBonus: { paix: 3 },
  },

  // ═══ AMIS ═══
  {
    id: 'micro-081',
    text: '{ami} et toi, vous avez décidé que vous seriez amis pour la vie derrière la cour de récréation. C\'était simple comme ça.',
    ageRange: [5, 12],
    statBonus: { paix: 3 },
  },
  {
    id: 'micro-082',
    text: '{ami} te convainc de sécher les cours une après-midi. Vous passez l\'heure à vous sentir coupables. Le sermon du soir vous vise directement.',
    ageRange: [13, 18],
    statBonus: { paix: -1 },
  },
  {
    id: 'micro-083',
    text: '{ami} partage ses notes de méditation biblique avec toi. Les passages soulignés en rouge disent quelque chose sur ce que {ami} traverse. Tu commences à faire pareil.',
    ageRange: [14, 22],
    statBonus: { foi: 3, paix: 1 },
  },
  {
    id: 'micro-084',
    text: '{ami} déménage sans vraiment te prévenir. Tu l\'apprends par quelqu\'un d\'autre. L\'amitié a ses silences douloureux.',
    ageRange: [14, 25],
    statBonus: { paix: -2 },
  },
  {
    id: 'micro-085',
    text: 'Dix ans plus tard, tu retrouves {ami} sur les réseaux. {ami} a changé, toi aussi. Mais quelque chose reste intact.',
    ageRange: [22, 45],
    statBonus: { paix: 3 },
  },
  {
    id: 'micro-086',
    text: '{ami} traverse une période très difficile. Tu passes le voir tous les jeudis soirs depuis trois mois. Ce n\'est pas grand-chose, mais c\'est tout.',
    ageRange: [27, 55],
    statBonus: { paix: 2, foi: 1 },
  },
  {
    id: 'micro-087',
    text: '{ami} te pose des questions sur ta foi que tu n\'avais jamais posées toi-même. Vous débattez jusqu\'à minuit. Tu rentres secoué — et plus solide.',
    ageRange: [18, 38],
    statBonus: { foi: 3 },
  },
  {
    id: 'micro-088',
    text: '{ami} propose de créer un groupe de responsabilité à deux. Vous vous envoyez un verset par semaine. Ça dure des années.',
    ageRange: [20, 40],
    statBonus: { foi: 2, paix: 2 },
  },
  {
    id: 'micro-089',
    text: 'Un proche est mort subitement. Trente-huit ans. Tu n\'avais pas vu ça venir. Tu ne savais pas que la douleur pouvait ressembler à ça.',
    ageRange: [25, 65],
    statBonus: { paix: -3, foi: 1 },
  },
  {
    id: 'micro-090',
    text: '{ami} se marie. Tu es au premier rang. En voyant {ami} avancer vers l\'autel, tu réalises combien de chemin vous avez fait ensemble.',
    ageRange: [22, 50],
    statBonus: { paix: 3 },
  },
  {
    id: 'micro-091',
    text: '{ami} te connaît depuis plus de vingt ans. {ami} connaît tes pires côtés et est encore là. C\'est une grâce rare.',
    ageRange: [30, 75],
    statBonus: { paix: 3, foi: 1 },
  },
  {
    id: 'micro-092',
    text: 'Les gens viennent te voir pour te parler de leurs problèmes. Tu ne sais pas quand tu es devenu cet ami-là. Mais tu acceptes ce rôle.',
    ageRange: [32, 70],
    statBonus: { paix: 2, foi: 1 },
  },

  // ═══ PROFESSION / CARRIÈRE ═══
  {
    id: 'micro-093',
    text: 'La famille se réunit pour décider de ton orientation. Tu veux travailler dans le domaine de {métier}. Chacun a un avis différent. Au fond, tu sais ce que tu veux.',
    ageRange: [16, 21],
    statBonus: { finances: 1 },
  },
  {
    id: 'micro-094',
    text: 'Premier stage. Tout t\'est encore étranger dans ce métier de {métier}. Tu arrives une heure en avance. Les collègues arrivent à l\'heure exacte. Tu apprends vite.',
    ageRange: [18, 24],
    statBonus: { finances: 1, paix: 1 },
  },
  {
    id: 'micro-095',
    text: 'Entretien d\'embauche. Tu répètes ta présentation depuis une semaine. Dans la salle d\'attente, un verset te revient.',
    ageRange: [19, 28],
    statBonus: { foi: 2 },
  },
  {
    id: 'micro-096',
    text: 'Tu es embauché comme {métier}. Le premier appel que tu passes, c\'est à {père}. Il dit "Je savais". {mère} pleure un peu.',
    ageRange: [20, 30],
    statBonus: { finances: 3, paix: 3 },
  },
  {
    id: 'micro-097',
    text: 'Premier salaire de {métier} versé. Tu comptes les billets deux fois. La dîme en premier, comme tu l\'as toujours entendu. Et ensuite tu manges bien.',
    ageRange: [20, 32],
    statBonus: { foi: 3, finances: 2 },
  },
  {
    id: 'micro-098',
    text: 'Un collègue propage des rumeurs sur toi. Tu choisis de ne pas répondre. Cette retenue te coûte plus qu\'il ne le verra jamais.',
    ageRange: [22, 55],
    statBonus: { paix: -2, foi: 1 },
  },
  {
    id: 'micro-099',
    text: 'Tu es promu. Ton supérieur annonce ton nom dans la salle de réunion. Tu rappelles tes parents en sortant, comme la première fois.',
    ageRange: [24, 50],
    statBonus: { finances: 3, paix: 2 },
  },
  {
    id: 'micro-100',
    text: 'Tu formes un jeune {métier}. Il te pose des questions que tu avais oublié de te poser. Tu réalises que tu en sais plus que tu ne pensais.',
    ageRange: [28, 65],
    statBonus: { paix: 2, foi: 1 },
  },
  {
    id: 'micro-101',
    text: 'Ton projet entrepreneurial ne décolle pas comme prévu. Tu fais le bilan dans un café vide. Recommencer ou pivoter.',
    ageRange: [21, 48],
    statBonus: { finances: -2, foi: 1 },
  },
  {
    id: 'micro-102',
    text: 'Période de chômage. Les matins sont lourds. Tu te forces à maintenir la prière quotidienne. C\'est plus difficile que tu l\'aurais cru.',
    ageRange: [22, 65],
    statBonus: { finances: -2, foi: 2 },
  },
  {
    id: 'micro-103',
    text: 'Tu signes un contrat important. La plume tremble légèrement. Tu te souviens d\'où tu es parti.',
    ageRange: [25, 58],
    statBonus: { finances: 4, paix: 2 },
  },
  {
    id: 'micro-104',
    text: 'Pot de départ à la retraite — trente ans de {métier}. Des collègues que tu ne soupçonnais pas prennent la parole. Tu découvres l\'impact que tu as eu sans le chercher.',
    ageRange: [58, 72],
    statBonus: { paix: 4, foi: 2 },
  },
  {
    id: 'micro-105',
    text: 'On t\'a préféré quelqu\'un d\'autre pour le poste. Tu rentres chez toi avec une paix surprenante. Le plan de Dieu a ses propres calendriers.',
    ageRange: [24, 58],
    statBonus: { foi: 3, paix: 1 },
  },
  {
    id: 'micro-106',
    text: 'Travailler depuis chez soi mélange tout : les enfants, les appels, la cuisine, les réunions. Tu improvises. Tout le monde improvise.',
    ageRange: [24, 65],
    statBonus: { paix: -1 },
  },
  {
    id: 'micro-107',
    text: 'On t\'invite à prendre la parole lors d\'une conférence. Tu acceptes malgré la peur. Après, quelqu\'un te dit : "ça m\'a aidé."',
    ageRange: [22, 50],
    statBonus: { finances: 2, paix: 2 },
  },

  // ═══ VOYAGE ═══
  {
    id: 'micro-108',
    text: 'Première fois que tu quittes {ville}. Depuis la vitre du car, tu regardes défiler un pays que tu ne connaissais pas.',
    ageRange: [8, 20],
    statBonus: { paix: 2 },
  },
  {
    id: 'micro-109',
    text: 'Voyage en car pour voir les grands-parents au village. Quinze heures de route, de la musique gospel, des vendeurs à chaque arrêt. Une fête.',
    ageRange: [3, 18],
    statBonus: { paix: 3 },
  },
  {
    id: 'micro-110',
    text: 'Tu montes dans un avion pour la première fois. La sensation du décollage, les nuages vus de l\'intérieur. Tu penses au Psaume 139.',
    ageRange: [14, 32],
    statBonus: { paix: 3, foi: 2 },
  },
  {
    id: 'micro-111',
    text: 'Tu arrives en Europe par une nuit froide, loin de {ville}. Le froid, les néons, les visages inconnus. Tu es seul et tu sais pourquoi tu es venu.',
    ageRange: [17, 32],
    statBonus: { paix: -1, finances: 1 },
  },
  {
    id: 'micro-112',
    text: 'Retour à {ville} après plusieurs années à l\'étranger. À l\'aéroport, les odeurs, les voix, la chaleur — quelque chose en toi se remet en place.',
    ageRange: [22, 55],
    statBonus: { paix: 4, foi: 2 },
  },
  {
    id: 'micro-113',
    text: '{église} organise une conférence dans une autre ville. Trois jours, des gens de partout, une Parole qui tombe sur toi au moment juste.',
    ageRange: [14, 50],
    statBonus: { foi: 4, paix: 2 },
  },
  {
    id: 'micro-114',
    text: 'Mission dans une église de village, à six heures de piste. Ils n\'ont pas grand-chose. La puissance du culte te dépasse.',
    ageRange: [18, 55],
    statBonus: { foi: 4, paix: 3 },
  },
  {
    id: 'micro-115',
    text: 'Pour la première fois, tu vois la mer. Tu restes debout longtemps sans bouger. C\'est trop grand pour être compris tout de suite.',
    ageRange: [10, 40],
    statBonus: { paix: 4, foi: 1 },
  },
  {
    id: 'micro-116',
    text: 'Voyage en train — long trajet, paysage qui défile. Tu lis, tu regardes, tu te souviens. Le voyage et la réflexion ne se séparent pas.',
    ageRange: [16, 55],
    statBonus: { paix: 2 },
  },
  {
    id: 'micro-117',
    text: 'Depuis longtemps tu penses à Jérusalem. Ce n\'est pas encore possible, mais la promesse reste intacte dans un coin de ta foi.',
    ageRange: [28, 80],
    statBonus: { foi: 2 },
  },

  // ═══ SAISONS ET ENVIRONNEMENT ═══
  {
    id: 'micro-118',
    text: 'Anniversaire de {église} : trois services dans la journée, des témoignages, des larmes, de la joie. Tu rentres vidé et plein en même temps.',
    ageRange: [8, 65],
    statBonus: { foi: 4, paix: 2 },
  },
  {
    id: 'micro-119',
    text: 'Le samedi matin dans le quartier : les vendeurs, les appels, les enfants, les klaxons. La vie reprend son rythme avant que tu te sois réveillé.',
    ageRange: [3, 65],
    statBonus: { paix: 1 },
  },
  {
    id: 'micro-120',
    text: 'La saison fraîche commence. Tu retrouves un vieux pull dans le fond d\'un tiroir. Il sent encore l\'hiver d\'il y a deux ans.',
    ageRange: [5, 75],
    statBonus: { paix: 1 },
  },
  {
    id: 'micro-121',
    text: 'L\'arbre de la cour donne des fruits pour la première fois depuis des années. Personne n\'en parle, mais tout le monde en prend.',
    ageRange: [8, 80],
    statBonus: { paix: 2, foi: 1 },
  },
  {
    id: 'micro-122',
    text: 'La lumière coupe en plein culte. Le pasteur continue de parler dans le noir. Les gens continuent de louer. Personne ne bouge.',
    ageRange: [10, 75],
    statBonus: { foi: 3, paix: 2 },
  },
  {
    id: 'micro-123',
    text: 'Orage violent cette nuit. Les éclairs illuminent la chambre. Tu te souviens d\'un verset sur la voix de Dieu dans la tempête.',
    ageRange: [2, 80],
    statBonus: { foi: 1, paix: 1 },
  },
  {
    id: 'micro-124',
    text: 'Dernier culte de l\'année. On fait le bilan à voix haute. Chacun dit un mot de gratitude. Tu as du mal à t\'arrêter.',
    ageRange: [10, 75],
    statBonus: { foi: 3, paix: 3 },
  },
  {
    id: 'micro-125',
    text: 'La saison sèche amène la poussière et les toux. Tout le monde boit plus d\'eau. La vie continue quand même.',
    ageRange: [3, 70],
  },
];

export function getMicroEventForAge(
  age: number,
  parentNames?: { father: string; mother: string },
  lifeContext?: LifeContext
): MicroEvent | null {
  const available = MICRO_EVENTS.filter((e) => {
    if (age < e.ageRange[0] || age > e.ageRange[1]) return false;
    if (e.probability !== undefined && Math.random() > e.probability) return false;
    return true;
  });
  if (available.length === 0) return null;

  const selected = available[Math.floor(Math.random() * available.length)];

  let text = selected.text;
  if (parentNames) {
    text = text
      .replace(/\{père\}/g, parentNames.father)
      .replace(/\{mère\}/g, parentNames.mother);
  }
  if (lifeContext) {
    text = text
      .replace(/\{ami\}/g, lifeContext.friendName)
      .replace(/\{ville\}/g, lifeContext.city)
      .replace(/\{métier\}/g, lifeContext.profession)
      .replace(/\{église\}/g, lifeContext.churchName);
  }

  return { ...selected, text };
}
