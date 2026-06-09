import type { AfflictionEvent, LifeStage } from '../types/game';
import { VERSE_DATABASE } from './verses';

export function pickDecoys(
  correctId: string,
  category: string,
  count: number = 3
): string[] {
  const sameCategory = VERSE_DATABASE.filter(
    (v) => v.category === category && v.id !== correctId
  );
  const others = VERSE_DATABASE.filter((v) => v.category !== category);
  const pool = [...sameCategory, ...others];
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count).map((v) => v.id);
}

export const EVENT_DATABASE: AfflictionEvent[] = [
  // ═══ 0-10 ans — Enfance ═══
  {
    id: 'e-enf-001',
    title: 'Le cauchemar nocturne',
    description:
      'Tu te réveilles en pleurs au cœur de la nuit. Une ombre dans ta chambre te fait trembler. Tu cries mais personne ne vient.',
    ageRange: [0, 7],
    category: 'peur_angoisse',
    correctVerseId: 'v-peur-001',
    decoyVerseIds: [],
    statImpactOnFail: { foi: -2, paix: -4, physique: -1, finances: 0 },
    thematicFlavor: 'Peurs d\'enfant',
  },
  {
    id: 'e-enf-002',
    title: 'Peur du noir',
    description:
      'La lumière éteinte, chaque ombre devient un monstre. Tu n\'oses pas fermer les yeux. L\'obscurité semble sans fin.',
    ageRange: [0, 8],
    category: 'peur_angoisse',
    correctVerseId: 'v-peur-004',
    decoyVerseIds: [],
    statImpactOnFail: { foi: -1, paix: -4, physique: -1, finances: 0 },
    thematicFlavor: 'Nuit d\'enfant',
  },
  {
    id: 'e-enf-003',
    title: 'La fièvre qui dure',
    description:
      'Cloué au lit depuis trois jours, tu souffres et tu ne comprends pas pourquoi Dieu laisse les petits enfants avoir mal.',
    ageRange: [0, 10],
    category: 'maladie_guerison',
    correctVerseId: 'v-gueris-001',
    decoyVerseIds: [],
    statImpactOnFail: { foi: -3, paix: -3, physique: -5, finances: 0 },
    thematicFlavor: 'Enfant malade',
  },
  {
    id: 'e-enf-004',
    title: 'Le bébé qui prend tout',
    description:
      'Depuis l\'arrivée de ton petit frère, papa et maman ne s\'occupent plus de toi. Une jalousie brûlante envahit ton cœur.',
    ageRange: [1, 9],
    category: 'amertume_rejet',
    correctVerseId: 'v-amer-002',
    decoyVerseIds: [],
    statImpactOnFail: { foi: -2, paix: -4, physique: 0, finances: 0 },
    thematicFlavor: 'Rivalité fraternelle',
  },
  {
    id: 'e-enf-005',
    title: 'La colère du refus',
    description:
      'Maman a encore dit non. Une rage monte en toi, tu veux tout casser. Tu ne comprends pas pourquoi tu n\'as pas le droit.',
    ageRange: [1, 9],
    category: 'orgueil_independance',
    correctVerseId: 'v-orgueil-001',
    decoyVerseIds: [],
    statImpactOnFail: { foi: -2, paix: -4, physique: -1, finances: 0 },
    thematicFlavor: 'Caractère',
  },
  {
    id: 'e-enf-006',
    title: 'Le premier jour d\'école',
    description:
      'La maîtresse est inconnue, les enfants aussi. La peur de ne rien savoir faire paralyse ta gorge dès le matin.',
    ageRange: [3, 7],
    category: 'peur_angoisse',
    correctVerseId: 'v-peur-003',
    decoyVerseIds: [],
    statImpactOnFail: { foi: -1, paix: -4, physique: -2, finances: 0 },
    thematicFlavor: 'Séparation',
  },
  {
    id: 'e-enf-007',
    title: 'Le jouet cassé',
    description:
      'Tu as cassé le jouet préféré de ton frère en jouant sans permission. Le mensonge te semble plus simple que d\'avouer.',
    ageRange: [2, 10],
    category: 'culpabilite',
    correctVerseId: 'v-culpa-001',
    decoyVerseIds: [],
    statImpactOnFail: { foi: -3, paix: -3, physique: 0, finances: 0 },
    thematicFlavor: 'Vérité difficile',
  },
  {
    id: 'e-enf-008',
    title: 'L\'ami qui ne joue plus',
    description:
      'Ton seul ami de la cour a choisi quelqu\'un d\'autre. Tu manges seul, invisible, le cœur serré sans savoir pourquoi.',
    ageRange: [4, 10],
    category: 'amertume_rejet',
    correctVerseId: 'v-amer-003',
    decoyVerseIds: [],
    statImpactOnFail: { foi: -2, paix: -5, physique: -1, finances: 0 },
    thematicFlavor: 'Amitié perdue',
  },
  {
    id: 'e-enf-009',
    title: 'Désobéir en cachette',
    description:
      'Papa a interdit cette émission. Dès qu\'il sort, la tentation est trop forte. Tu regardes, sachant que c\'est mal.',
    ageRange: [4, 11],
    category: 'obeissance',
    correctVerseId: 'v-obeis-001',
    decoyVerseIds: [],
    statImpactOnFail: { foi: -3, paix: -2, physique: 0, finances: 0 },
    thematicFlavor: 'Autorité parentale',
  },
  {
    id: 'e-enf-010',
    title: 'La honte à la récitation',
    description:
      'Debout devant la classe, tu as oublié le verset. Les mots se figent. Les rires fusent et la honte te brûle le visage.',
    ageRange: [5, 10],
    category: 'decouragement',
    correctVerseId: 'v-decour-001',
    decoyVerseIds: [],
    statImpactOnFail: { foi: -2, paix: -3, physique: -2, finances: 0 },
    thematicFlavor: 'Honte publique',
  },

  // ═══ Vie de famille — Parents, fratrie, maison ═══
  {
    id: 'e-fam-001',
    title: 'Les parents se disputent',
    description:
      'Les cris de tes parents traversent les murs de ta chambre. La maison tremble de tension. Tu serres ton oreiller en priant que ça s\'arrête.',
    ageRange: [2, 70],
    category: 'peur_angoisse',
    correctVerseId: 'v-peur-002',
    decoyVerseIds: [],
    statImpactOnFail: { foi: -2, paix: -6, physique: -1, finances: 0 },
    thematicFlavor: 'Foyer en tension',
    cascadeEventId: 'e-fam-001-c',
    byAge: {
      enfant: {
        description: 'Les cris de tes parents traversent les murs de ta chambre. La maison tremble. Tu serres ton oreiller en priant que ça s\'arrête.',
        statImpactOnFail: { paix: -2 },
        thematicFlavor: 'Enfant pris en étau',
      },
      ado: {
        description: 'Tes parents se disputent encore. Tu essaies de jouer les médiateurs mais personne ne t\'écoute vraiment. Tu fuis dans ta chambre, honteux.',
        statImpactOnFail: { foi: -1, paix: -1 },
        thematicFlavor: 'Faux adulte',
      },
      adulte: {
        description: 'Tes parents vieillissants se déchirent encore. Tu es tiraillé entre eux, contraint de prendre parti dans un conflit qui t\'écrase depuis l\'enfance.',
        statImpactOnFail: { paix: 1, finances: -1 },
        thematicFlavor: 'Blessures héritées',
      },
      senior: {
        description: 'Tes parents âgés se querellent sur des questions d\'héritage. À ton âge, tu mesures combien les blessures non guéries voyagent de génération en génération.',
        statImpactOnFail: { foi: 1, paix: -1, physique: 1 },
        thematicFlavor: 'Transmission des blessures',
      },
    },
  },
  {
    id: 'e-fam-001-c',
    title: 'Un foyer qui se fracture',
    description:
      'Les disputes n\'ont pas cessé. Tes parents ne dorment plus dans la même chambre. Le mot "séparation" flotte dans l\'air sans être dit.',
    ageRange: [3, 16],
    category: 'amertume_rejet',
    correctVerseId: 'v-amer-001',
    decoyVerseIds: [],
    statImpactOnFail: { foi: -4, paix: -6, physique: -2, finances: 0 },
    thematicFlavor: 'Famille brisée',
  },
  {
    id: 'e-fam-002',
    title: 'La perte d\'emploi',
    description:
      'Papa rentre tôt depuis un mois. Il ne parle plus, mange peu. Le mot "licencié" flotte dans l\'air. L\'argent manque et la peur s\'installe.',
    ageRange: [3, 75],
    category: 'decouragement',
    correctVerseId: 'v-decour-002',
    decoyVerseIds: [],
    statImpactOnFail: { foi: -2, paix: -3, physique: -1, finances: -5 },
    thematicFlavor: 'Précarité familiale',
    cascadeEventId: 'e-fam-002-c',
    byAge: {
      enfant: {
        description: 'Papa rentre tôt depuis un mois. Il ne parle plus, mange peu. L\'argent manque. Tu ne comprends pas tout, mais tu sens que quelque chose s\'est cassé.',
        statImpactOnFail: { finances: -1, physique: 1 },
        thematicFlavor: 'Inquiétude d\'enfant',
      },
      ado: {
        description: 'Papa a perdu son emploi. L\'ambiance à la maison est lourde. Tu te demandes si tu dois trouver un petit boulot pour aider. La honte te ronge à l\'école.',
        statImpactOnFail: { foi: -1, finances: -1 },
        thematicFlavor: 'Honte adolescente',
      },
      adulte: {
        description: 'Tu as été licencié ce matin. Ton contrat, ta routine, ton identité — tout s\'est effondré en un email. Comment nourrir ta famille ? Comment prier quand le vide te répond ?',
        statImpactOnFail: { foi: -2, paix: -2, finances: -3 },
        thematicFlavor: 'Identité brisée',
      },
      senior: {
        description: 'La retraite forcée est arrivée avant l\'heure. Des décennies de travail effacées du jour au lendemain. Tu dois apprendre à exister sans ce rôle qui te définissait.',
        statImpactOnFail: { foi: -1, paix: -2, physique: -2 },
        thematicFlavor: 'Fin de carrière',
      },
    },
  },
  {
    id: 'e-fam-002-c',
    title: 'La honte des fins de mois',
    description:
      'Les voisins savent que papa est au chômage. Tu entends les murmures. À l\'école, tu dis que ça va. Mais à l\'intérieur, tout s\'effondre.',
    ageRange: [5, 20],
    category: 'culpabilite',
    correctVerseId: 'v-culpa-002',
    decoyVerseIds: [],
    statImpactOnFail: { foi: -3, paix: -4, physique: -1, finances: -3 },
    thematicFlavor: 'Honte sociale',
  },
  {
    id: 'e-fam-003',
    title: 'Maman à l\'hôpital',
    description:
      'On a emmené maman d\'urgence cette nuit. Papa dit que ça va, mais ses yeux ne mentent pas. Le silence de la maison est assourdissant.',
    ageRange: [1, 16],
    category: 'maladie_guerison',
    correctVerseId: 'v-gueris-002',
    decoyVerseIds: [],
    statImpactOnFail: { foi: -4, paix: -5, physique: -1, finances: 0 },
    thematicFlavor: 'Maladie parentale',
  },
  {
    id: 'e-fam-004',
    title: 'Le déménagement',
    description:
      'Les cartons sont partout. Une ville inconnue attend ta famille. Tu laisses ta chambre, tes amis, ton église. Un arrachement brutal.',
    ageRange: [3, 75],
    category: 'amertume_rejet',
    correctVerseId: 'v-amer-004',
    decoyVerseIds: [],
    statImpactOnFail: { foi: -2, paix: -5, physique: -1, finances: 0 },
    thematicFlavor: 'Exile intérieur',
    byAge: {
      enfant: {
        description: 'Les cartons sont partout. Demain tu quitteras ta chambre, tes amis et ton école. Tu ne veux pas partir. Personne ne t\'a demandé ton avis.',
        statImpactOnFail: { paix: -2, physique: -1 },
        thematicFlavor: 'Arrachement',
      },
      ado: {
        description: 'Tu déménages à 200 km de tout ce que tu connais. Tes amis, ton groupe de jeunes, ton premier amour — tout ça s\'arrête net. Tu n\'as pas choisi ça.',
        statImpactOnFail: { foi: -1, paix: -2 },
        thematicFlavor: 'Identité brisée',
      },
      adulte: {
        description: 'Le travail t\'oblige à partir. Tu dois tout recommencer : trouver un logement, une église, un réseau. Ta famille accepte mais tu vois leur peine. C\'est ta décision à porter.',
        statImpactOnFail: { paix: -2, finances: -2 },
        thematicFlavor: 'Responsabilité adulte',
      },
      senior: {
        description: 'Quitter la maison où tu as élevé tes enfants pour rejoindre ta famille dans une autre ville. Chaque mur de cette maison raconte une histoire. Tu dois tout laisser.',
        statImpactOnFail: { paix: -3, physique: -1 },
        thematicFlavor: 'Mémoire et deuil',
      },
    },
  },
  {
    id: 'e-fam-005',
    title: 'Grand-mère est partie',
    description:
      'Grand-mère ne se réveillera plus. Son fauteuil est vide, son rire manque déjà. C\'est la première fois que la mort entre vraiment dans ta vie.',
    ageRange: [4, 80],
    category: 'tristesse_joie',
    correctVerseId: 'v-joie-003',
    decoyVerseIds: [],
    statImpactOnFail: { foi: -4, paix: -4, physique: -2, finances: 0 },
    thematicFlavor: 'Deuil familial',
    byAge: {
      enfant: {
        description: 'Grand-mère ne se réveillera plus. Son fauteuil est vide. Tu ne comprends pas bien ce que "morte" veut dire, mais son absence fait un trou immense.',
        statImpactOnFail: { paix: -2 },
        thematicFlavor: 'Premier deuil',
      },
      ado: {
        description: 'Grand-mère est partie cette nuit. C\'est la première mort qui te touche vraiment. Tu dois être fort pour ta famille, mais au fond de toi quelque chose s\'est brisé.',
        statImpactOnFail: { foi: -1, paix: -1 },
        thematicFlavor: 'Choc du deuil',
      },
      adulte: {
        description: 'Tu as perdu grand-mère. Tu organises les funérailles, tu soutiens ta famille. Mais quand tout le monde est parti, tu réalises que tu n\'as pas encore pleuré.',
        statImpactOnFail: { paix: -1, physique: -1 },
        thematicFlavor: 'Deuil gelé',
      },
      senior: {
        description: 'Tu enternes ta mère aujourd\'hui. Vous avez eu vos disputes, vos silences, vos réconciliations. Maintenant tu deviens la génération la plus ancienne de ta famille.',
        statImpactOnFail: { foi: -2, physique: -2 },
        thematicFlavor: 'Transmission',
      },
    },
  },
  {
    id: 'e-fam-006',
    title: 'L\'animal de compagnie',
    description:
      'La famille a adopté un chiot. Tu promets d\'en prendre soin chaque jour. Mais les jeux t\'attirent plus que cette responsabilité silencieuse.',
    ageRange: [3, 13],
    category: 'obeissance',
    correctVerseId: 'v-obeis-002',
    decoyVerseIds: [],
    statImpactOnFail: { foi: -2, paix: -2, physique: -1, finances: 0 },
    thematicFlavor: 'Responsabilité',
    cascadeEventId: 'e-fam-006-c',
  },
  {
    id: 'e-fam-006-c',
    title: 'L\'animal ne mange plus',
    description:
      'Depuis quelques jours, ton chien ne mange plus. Il gémit dans son coin. Tu sais que c\'est peut-être ta négligence qui l\'a rendu malade.',
    ageRange: [4, 15],
    category: 'culpabilite',
    correctVerseId: 'v-culpa-003',
    decoyVerseIds: [],
    statImpactOnFail: { foi: -2, paix: -3, physique: -1, finances: 0 },
    thematicFlavor: 'Conséquences',
    cascadeEventId: 'e-fam-006-c2',
  },
  {
    id: 'e-fam-006-c2',
    title: 'La mort du chien',
    description:
      'Cette nuit, ton chien est mort. Papa a creusé un trou dans le jardin. C\'est la première fois que tu pleures pour quelque chose que tu aimais.',
    ageRange: [5, 16],
    category: 'tristesse_joie',
    correctVerseId: 'v-joie-002',
    decoyVerseIds: [],
    statImpactOnFail: { foi: -3, paix: -4, physique: -2, finances: 0 },
    thematicFlavor: 'Premier deuil',
  },
  {
    id: 'e-fam-007',
    title: 'Une famille qui s\'agrandit',
    description:
      'Maman attend un bébé. Bientôt ta chambre sera partagée, les câlins aussi. Quelque chose en toi résiste à cette nouvelle joie.',
    ageRange: [2, 12],
    category: 'orgueil_independance',
    correctVerseId: 'v-orgueil-002',
    decoyVerseIds: [],
    statImpactOnFail: { foi: -2, paix: -3, physique: 0, finances: 0 },
    thematicFlavor: 'Fraternité',
  },
  {
    id: 'e-fam-008',
    title: 'Le cousin qui débarque',
    description:
      'Ton cousin Joël arrive pour six mois. Il dort dans ta chambre, mange dans ton assiette, prend ta place. La patience devient un combat quotidien.',
    ageRange: [4, 18],
    category: 'orgueil_independance',
    correctVerseId: 'v-orgueil-003',
    decoyVerseIds: [],
    statImpactOnFail: { foi: -2, paix: -4, physique: 0, finances: -1 },
    thematicFlavor: 'Cohabitation',
  },
  {
    id: 'e-fam-009',
    title: 'Papa absent depuis des mois',
    description:
      'Ton père travaille dans une autre ville depuis six mois. Il a promis de revenir souvent. Mais les appels se font rares et sa chaise reste vide.',
    ageRange: [5, 20],
    category: 'amertume_rejet',
    correctVerseId: 'v-amer-005',
    decoyVerseIds: [],
    statImpactOnFail: { foi: -3, paix: -5, physique: -1, finances: 0 },
    thematicFlavor: 'Père absent',
  },
  {
    id: 'e-fam-010',
    title: 'Grand-père vient habiter',
    description:
      'Grand-père est malade, lent, parfois confus. Il vient vivre chez vous. Prendre soin de lui chaque jour demande un amour que tu n\'as pas encore.',
    ageRange: [8, 35],
    category: 'obeissance',
    correctVerseId: 'v-obeis-003',
    decoyVerseIds: [],
    statImpactOnFail: { foi: -2, paix: -3, physique: -2, finances: 0 },
    thematicFlavor: 'Soin des anciens',
  },
  {
    id: 'e-fam-011',
    title: 'Le remariage de papa',
    description:
      'Papa a annoncé qu\'il se remarie. Cet inconnu vivra dans ta maison. Tout ce que tu pensais savoir de ta famille vient de changer en un instant.',
    ageRange: [8, 30],
    category: 'amertume_rejet',
    correctVerseId: 'v-amer-006',
    decoyVerseIds: [],
    statImpactOnFail: { foi: -4, paix: -5, physique: -1, finances: 0 },
    thematicFlavor: 'Famille recomposée',
  },
  {
    id: 'e-fam-012',
    title: 'Maladie grave dans la famille',
    description:
      'Le médecin a prononcé un mot que tu ne comprenais pas encore : cancer. Papa reste assis sans bouger. Tout le monde fait semblant de sourire.',
    ageRange: [10, 60],
    category: 'maladie_guerison',
    correctVerseId: 'v-gueris-003',
    decoyVerseIds: [],
    statImpactOnFail: { foi: -5, paix: -5, physique: -2, finances: -2 },
    thematicFlavor: 'Maladie grave',
  },

  // ═══ Environnement — Quartier, société, église ═══
  {
    id: 'e-ext-001',
    title: 'Coupure de courant prolongée',
    description:
      'L\'électricité est coupée depuis cinq jours. Les cours se font à la bougie. La ville attend dans la chaleur et l\'incertitude sans réponse.',
    ageRange: [4, 50],
    category: 'decouragement',
    correctVerseId: 'v-decour-003',
    decoyVerseIds: [],
    statImpactOnFail: { foi: -2, paix: -2, physique: -2, finances: -1 },
    thematicFlavor: 'Contraintes extérieures',
  },
  {
    id: 'e-ext-002',
    title: 'L\'inondation',
    description:
      'La pluie ne s\'arrête pas. L\'eau monte dans les rues, puis sous la porte. Tout ce que votre famille possède est emporté par le courant.',
    ageRange: [3, 80],
    category: 'decouragement',
    correctVerseId: 'v-decour-001',
    decoyVerseIds: [],
    statImpactOnFail: { foi: -4, paix: -4, physique: -3, finances: -4 },
    thematicFlavor: 'Catastrophe',
    byAge: {
      enfant: {
        description: 'L\'eau est entrée dans la maison cette nuit. Maman a pris les affaires importantes, papa portait le bébé. Toi tu regardais tes jouets disparaître sous l\'eau.',
        statImpactOnFail: { paix: -1, finances: 0 },
        thematicFlavor: 'Perte d\'enfance',
      },
      ado: {
        description: 'Ton quartier est sous l\'eau. L\'école est fermée, les amis sont dispersés. Tu aides ta famille à vider la maison. C\'est la première fois que tu te sens vraiment utile.',
        statImpactOnFail: { foi: -1 },
        thematicFlavor: 'Crise mobilisatrice',
      },
      adulte: {
        description: 'Ton appartement est inondé. Tu as tout perdu : les meubles, les documents, les photos. En une nuit, des années de travail se retrouvent dans la boue.',
        statImpactOnFail: { paix: -2, finances: -2 },
        thematicFlavor: 'Tout reconstruire',
      },
      senior: {
        description: 'Tu as tout perdu dans l\'inondation. Ce n\'est pas la première fois que Dieu te laisse recommencer de zéro. Tu sais maintenant que les biens ne comptent pas. Mais les genoux font mal.',
        statImpactOnFail: { physique: -2, finances: -1 },
        thematicFlavor: 'Résilience acquise',
      },
    },
  },
  {
    id: 'e-ext-003',
    title: 'Le pasteur quitte l\'église',
    description:
      'Le pasteur a annoncé son départ. Les membres se disputent, certains partent. Tu te demandes si l\'Église est vraiment aussi solide qu\'on te l\'a dit.',
    ageRange: [10, 50],
    category: 'doute_incredulite',
    correctVerseId: 'v-doute-002',
    decoyVerseIds: [],
    statImpactOnFail: { foi: -5, paix: -3, physique: 0, finances: 0 },
    thematicFlavor: 'Crise communautaire',
    cascadeEventId: 'e-ext-003-c',
  },
  {
    id: 'e-ext-003-c',
    title: 'L\'église divisée',
    description:
      'La communauté s\'est scindée en deux. Des familles que tu connaissais depuis toujours ne se parlent plus. Tu ne sais plus où est ta place.',
    ageRange: [12, 55],
    category: 'doute_incredulite',
    correctVerseId: 'v-doute-005',
    decoyVerseIds: [],
    statImpactOnFail: { foi: -6, paix: -4, physique: 0, finances: 0 },
    thematicFlavor: 'Schisme',
  },
  {
    id: 'e-ext-004',
    title: 'La pénurie alimentaire',
    description:
      'Les marchés sont vides depuis des semaines. Papa compte chaque franc. On mange moins, on parle peu. La peur du lendemain est silencieuse.',
    ageRange: [5, 60],
    category: 'lourdeur_fatigue',
    correctVerseId: 'v-lourd-001',
    decoyVerseIds: [],
    statImpactOnFail: { foi: -3, paix: -3, physique: -3, finances: -4 },
    thematicFlavor: 'Disette',
  },
  {
    id: 'e-ext-005',
    title: 'Le voisin dans le besoin',
    description:
      'Ta voisine frappe à la porte, les yeux rouges. Son mari l\'a chassée avec ses enfants. Dieu te demande peut-être de faire quelque chose.',
    ageRange: [8, 70],
    category: 'direction_divine',
    correctVerseId: 'v-direct-001',
    decoyVerseIds: [],
    statImpactOnFail: { foi: -3, paix: -2, physique: 0, finances: -1 },
    thematicFlavor: 'Prochain',
  },
  {
    id: 'e-ext-006',
    title: 'Violence dans le quartier',
    description:
      'Des coups de feu ont réveillé le quartier cette nuit. La porte est fermée à double tour. L\'angoisse de l\'inconnu t\'empêche de dormir.',
    ageRange: [5, 80],
    category: 'peur_angoisse',
    correctVerseId: 'v-peur-005',
    decoyVerseIds: [],
    statImpactOnFail: { foi: -3, paix: -5, physique: -2, finances: 0 },
    thematicFlavor: 'Insécurité',
    byAge: {
      enfant: {
        description: 'Des cris ont traversé la nuit. Maman vous a tous mis sous les lits. Tu fermes les yeux très fort en comptant pour ne pas entendre.',
        statImpactOnFail: { paix: -2 },
        thematicFlavor: 'Effroi d\'enfant',
      },
      ado: {
        description: 'Un garçon de ton école a été blessé ce soir dans une bagarre. Tu le connaissais. La violence est sortie des écrans et est entrée dans ta vie réelle.',
        statImpactOnFail: { foi: -2, paix: -1 },
        thematicFlavor: 'Réalité brutale',
      },
      adulte: {
        description: 'Le quartier est devenu dangereux. Tu dois décider si tu restes pour ta communauté ou tu pars pour protéger ta famille. Aucun des deux choix n\'est juste.',
        statImpactOnFail: { paix: -2, finances: -1 },
        thematicFlavor: 'Décision impossible',
      },
      senior: {
        description: 'Tu vis dans ce quartier depuis 30 ans. Aujourd\'hui il est méconnaissable. Tu refuses de partir, mais tu te demandes si ton courage est de la sagesse ou de la fierté.',
        statImpactOnFail: { foi: -1, physique: -2 },
        thematicFlavor: 'Fidélité au territoire',
      },
    },
  },
  {
    id: 'e-ext-007',
    title: 'Agitation politique',
    description:
      'Les nouvelles sont mauvaises. Les manifestants bloquent les routes, les écoles ferment. Ta famille attend, enfermée, dans l\'incertitude.',
    ageRange: [12, 70],
    category: 'peur_angoisse',
    correctVerseId: 'v-peur-008',
    decoyVerseIds: [],
    statImpactOnFail: { foi: -3, paix: -4, physique: -1, finances: -2 },
    thematicFlavor: 'Crise sociale',
  },
  {
    id: 'e-ext-008',
    title: 'L\'ami qui déménage',
    description:
      'Ton meilleur ami part dans une autre ville ce week-end. Vous avez grandi ensemble. Sa maison sera vide et tu ne sais pas comment vivre ça.',
    ageRange: [6, 30],
    category: 'amertume_rejet',
    correctVerseId: 'v-amer-008',
    decoyVerseIds: [],
    statImpactOnFail: { foi: -2, paix: -4, physique: -1, finances: 0 },
    thematicFlavor: 'Séparation',
  },
  {
    id: 'e-ext-009',
    title: 'Changer d\'école',
    description:
      'Nouveaux couloirs, nouvelles règles, aucun visage connu. Dans cette école, tu repars de zéro. La peur de ne pas trouver ta place te paralyse.',
    ageRange: [6, 20],
    category: 'peur_angoisse',
    correctVerseId: 'v-peur-009',
    decoyVerseIds: [],
    statImpactOnFail: { foi: -2, paix: -4, physique: -2, finances: 0 },
    thematicFlavor: 'Nouveau départ forcé',
  },
  {
    id: 'e-ext-010',
    title: 'La crise économique',
    description:
      'Le pays traverse une crise sévère. Les prix doublent, le travail se raréfie. Ta famille resserre les rangs. La foi est mise à l\'épreuve.',
    ageRange: [14, 80],
    category: 'lourdeur_fatigue',
    correctVerseId: 'v-lourd-002',
    decoyVerseIds: [],
    statImpactOnFail: { foi: -3, paix: -3, physique: -2, finances: -5 },
    thematicFlavor: 'Précarité systémique',
  },

  // ═══ 0-15 ans — Fondations ═══
  {
    id: 'e-fond-001',
    title: 'Le harcèlement scolaire',
    description:
      'À l\'école, un groupe d\'élèves se moque de toi chaque jour à cause de ta foi. La peur te serre le ventre.',
    ageRange: [8, 15],
    category: 'peur_angoisse',
    correctVerseId: 'v-peur-006',
    decoyVerseIds: [],
    statImpactOnFail: { foi: -3, paix: -5, physique: -2, finances: 0 },
    thematicFlavor: 'Pression des pairs',
    cascadeEventId: 'e-fond-001-c',
  },
  {
    id: 'e-fond-001-c',
    title: 'L\'isolement scolaire',
    description:
      'Le harcèlement non traité t\'a isolé. Tu n\'as plus d\'amis à l\'école et le rejet te ronge.',
    ageRange: [9, 16],
    category: 'amertume_rejet',
    correctVerseId: 'v-amer-005',
    decoyVerseIds: [],
    statImpactOnFail: { foi: -3, paix: -6, physique: -2, finances: -1 },
    cascadeEventId: 'e-fond-001-c2',
  },
  {
    id: 'e-fond-001-c2',
    title: 'La dépression naissante',
    description:
      'Le rejet permanent t\'a plongé dans une profonde tristesse. Tu ne vois plus d\'issue.',
    ageRange: [10, 17],
    category: 'peur_angoisse',
    correctVerseId: 'v-peur-007',
    decoyVerseIds: [],
    statImpactOnFail: { foi: -5, paix: -8, physique: -4, finances: 0 },
  },
  {
    id: 'e-fond-002',
    title: 'La tentation de tricher',
    description:
      'Ton voisin te montre ses réponses. Personne ne regarde. La facilité te tend les bras.',
    ageRange: [8, 15],
    category: 'orgueil_independance',
    correctVerseId: 'v-orgueil-003',
    decoyVerseIds: [],
    statImpactOnFail: { foi: -4, paix: -3, physique: 0, finances: 0 },
    cascadeEventId: 'e-fond-002-c',
  },
  {
    id: 'e-fond-002-c',
    title: 'La réputation compromise',
    description:
      'Ton mensonge a été découvert. Les profs ne te font plus confiance. La honte t\'écrase.',
    ageRange: [9, 16],
    category: 'amertume_rejet',
    correctVerseId: 'v-amer-003',
    decoyVerseIds: [],
    statImpactOnFail: { foi: -5, paix: -5, physique: -1, finances: -1 },
  },
  {
    id: 'e-fond-003',
    title: 'Le rejet familial',
    description:
      'Tes parents ne comprennent pas ta foi et s\'en moquent. Tu te sens seul et incompris chez toi.',
    ageRange: [6, 14],
    category: 'amertume_rejet',
    correctVerseId: 'v-amer-005',
    decoyVerseIds: [],
    statImpactOnFail: { foi: -4, paix: -5, physique: -1, finances: -1 },
    cascadeEventId: 'e-fond-003-c',
  },
  {
    id: 'e-fond-003-c',
    title: 'La rébellion silencieuse',
    description:
      'Le rejet familial t\'a rendu amer. Tu te renfermes et refuses toute autorité.',
    ageRange: [7, 15],
    category: 'orgueil_independance',
    correctVerseId: 'v-orgueil-001',
    decoyVerseIds: [],
    statImpactOnFail: { foi: -5, paix: -4, physique: -1, finances: -2 },
  },
  {
    id: 'e-fond-004',
    title: 'La peur du noir',
    description:
      'Tu as 8 ans et tu fais des cauchemars chaque nuit. La peur du noir te paralyse.',
    ageRange: [6, 10],
    category: 'peur_angoisse',
    correctVerseId: 'v-peur-001',
    decoyVerseIds: [],
    statImpactOnFail: { foi: -2, paix: -4, physique: -2, finances: 0 },
  },
  {
    id: 'e-fond-005',
    title: 'Le premier appel',
    description:
      'À l\'école du dimanche, tu sens quelque chose remuer dans ton cœur. Dieu t\'appelle, mais c\'est intimidant.',
    ageRange: [8, 14],
    category: 'identite_appel',
    correctVerseId: 'v-ident-003',
    decoyVerseIds: [],
    statImpactOnFail: { foi: -3, paix: -2, physique: 0, finances: 0 },
  },

  // ═══ 16-25 ans — Choix ═══
  {
    id: 'e-choix-001',
    title: 'La pression des études',
    description:
      'Les examens approchent. La charge est écrasante, les nuits sont courtes. L\'angoisse monte.',
    ageRange: [16, 25],
    category: 'peur_angoisse',
    correctVerseId: 'v-peur-004',
    decoyVerseIds: [],
    statImpactOnFail: { foi: -2, paix: -5, physique: -3, finances: 1 },
    cascadeEventId: 'e-choix-001-c',
  },
  {
    id: 'e-choix-001-c',
    title: 'Le décrochage scolaire',
    description:
      'L\'angoisse non maîtrisée t\'a poussé à abandonner. Les notes chutent, l\'avenir s\'assombrit.',
    ageRange: [17, 26],
    category: 'finances_paresse',
    correctVerseId: 'v-fin-004',
    decoyVerseIds: [],
    statImpactOnFail: { foi: -3, paix: -4, physique: -1, finances: -8 },
  },
  {
    id: 'e-choix-002',
    title: 'La tentation pornographique',
    description:
      'Un ami te montre un site. La curiosité te dévore. Personne ne le saurait jamais.',
    ageRange: [14, 22],
    category: 'impudicite_addiction',
    correctVerseId: 'v-imput-004',
    decoyVerseIds: [],
    statImpactOnFail: { foi: -4, paix: -3, physique: -2, finances: 0 },
    cascadeEventId: 'e-choix-002-c',
  },
  {
    id: 'e-choix-002-c',
    title: 'L\'addiction cachée',
    description:
      'Cette habitude est devenue un piège. Tu passes des heures seul, la culpabilité te ronge.',
    ageRange: [15, 25],
    category: 'impudicite_addiction',
    correctVerseId: 'v-imput-001',
    decoyVerseIds: [],
    statImpactOnFail: { foi: -6, paix: -4, physique: -3, finances: -1 },
  },
  {
    id: 'e-choix-003',
    title: 'La tentation de l\'argent facile',
    description:
      'Un "faux modèle" te propose un plan pour devenir riche rapidement sans diplôme.',
    ageRange: [16, 24],
    category: 'finances_paresse',
    correctVerseId: 'v-fin-004',
    decoyVerseIds: [],
    statImpactOnFail: { foi: -3, paix: -2, physique: 0, finances: -5 },
    cascadeEventId: 'e-choix-003-c',
  },
  {
    id: 'e-choix-003-c',
    title: 'L\'endettement',
    description:
      'Le plan a échoué. Tu es endetté et les créanciers te harcèlent.',
    ageRange: [17, 25],
    category: 'finances_paresse',
    correctVerseId: 'v-fin-008',
    decoyVerseIds: [],
    statImpactOnFail: { foi: -3, paix: -5, physique: -2, finances: -10 },
  },
  {
    id: 'e-choix-004',
    title: 'Le doute sur l\'orientation',
    description:
      'Tes parents veulent médecine. Tu sens un appel différent. Est-ce ta volonté ou celle de Dieu ?',
    ageRange: [16, 22],
    category: 'doute_incredulite',
    correctVerseId: 'v-doute-005',
    decoyVerseIds: [],
    statImpactOnFail: { foi: -4, paix: -4, physique: -1, finances: 0 },
  },
  {
    id: 'e-choix-005',
    title: 'La relation toxique',
    description:
      'Cette personne te manipule, mais tu as peur de la solitude. Tu sais que c\'est mauvais mais tu restes.',
    ageRange: [18, 25],
    category: 'amertume_rejet',
    correctVerseId: 'v-amer-001',
    decoyVerseIds: [],
    statImpactOnFail: { foi: -3, paix: -6, physique: -2, finances: -1 },
    cascadeEventId: 'e-choix-005-c',
  },
  {
    id: 'e-choix-005-c',
    title: 'Le cœur brisé',
    description:
      'La rupture est arrivée. La douleur est immense et l\'amertume menace de s\'installer pour toujours.',
    ageRange: [19, 26],
    category: 'amertume_rejet',
    correctVerseId: 'v-amer-002',
    decoyVerseIds: [],
    statImpactOnFail: { foi: -5, paix: -8, physique: -2, finances: -2 },
  },
  {
    id: 'e-choix-006',
    title: 'La soif de Dieu',
    description:
      'Un réveil spirituel traverse ta ville. Tu sens un feu brûler en toi, mais les moqueries de tes amis refroidissent ton élan.',
    ageRange: [16, 24],
    category: 'identite_appel',
    correctVerseId: 'v-ident-006',
    decoyVerseIds: [],
    statImpactOnFail: { foi: -5, paix: -2, physique: 0, finances: 0 },
  },

  // ═══ 26-60 ans — Production ═══
  {
    id: 'e-prod-001',
    title: 'La perte d\'emploi',
    description:
      'L\'entreprise licencie. Les factures s\'accumulent. La peur du lendemain te paralyse.',
    ageRange: [26, 55],
    category: 'peur_angoisse',
    correctVerseId: 'v-peur-003',
    decoyVerseIds: [],
    statImpactOnFail: { foi: -3, paix: -5, physique: -2, finances: -8 },
    cascadeEventId: 'e-prod-001-c',
  },
  {
    id: 'e-prod-001-c',
    title: 'La spirale de la pauvreté',
    description:
      'Sans emploi, les dettes s\'accumulent. Le crédit est coupé. Tu frappes à toutes les portes, fermées.',
    ageRange: [27, 56],
    category: 'finances_paresse',
    correctVerseId: 'v-fin-005',
    decoyVerseIds: [],
    statImpactOnFail: { foi: -4, paix: -5, physique: -3, finances: -10 },
  },
  {
    id: 'e-prod-002',
    title: 'La tentation adultère',
    description:
      'Un(e) collègue montre un intérêt marqué. Ton couple traverse une crise. Personne ne le saurait.',
    ageRange: [28, 50],
    category: 'impudicite_addiction',
    correctVerseId: 'v-imput-005',
    decoyVerseIds: [],
    statImpactOnFail: { foi: -6, paix: -5, physique: -1, finances: -3 },
    cascadeEventId: 'e-prod-002-c',
  },
  {
    id: 'e-prod-002-c',
    title: 'Le foyer brisé',
    description:
      'L\'infidélité a été découverte. Ton conjoint demande le divorce. La famille vole en éclats.',
    ageRange: [29, 51],
    category: 'amertume_rejet',
    correctVerseId: 'v-amer-004',
    decoyVerseIds: [],
    statImpactOnFail: { foi: -7, paix: -8, physique: -3, finances: -6 },
  },
  {
    id: 'e-prod-003',
    title: 'L\'amertume au travail',
    description:
      'Ton collègue a été promu à ta place. L\'injustice te ronge. Tu travailles deux fois plus.',
    ageRange: [26, 50],
    category: 'amertume_rejet',
    correctVerseId: 'v-amer-006',
    decoyVerseIds: [],
    statImpactOnFail: { foi: -3, paix: -5, physique: -2, finances: -2 },
    cascadeEventId: 'e-prod-003-c',
  },
  {
    id: 'e-prod-003-c',
    title: 'La démission amère',
    description:
      'L\'amertume t\'a poussé à démissionner sans plan. Maintenant tu es au chômage sans perspective.',
    ageRange: [27, 51],
    category: 'finances_paresse',
    correctVerseId: 'v-fin-010',
    decoyVerseIds: [],
    statImpactOnFail: { foi: -3, paix: -4, physique: -1, finances: -6 },
  },
  {
    id: 'e-prod-004',
    title: 'La maladie',
    description:
      'Le diagnostic tombe. Les nuits sont longues, les traitements douloureux. Le découragement guette.',
    ageRange: [30, 60],
    category: 'peur_angoisse',
    correctVerseId: 'v-peur-007',
    decoyVerseIds: [],
    statImpactOnFail: { foi: -4, paix: -6, physique: -8, finances: -4 },
    cascadeEventId: 'e-prod-004-c',
  },
  {
    id: 'e-prod-004-c',
    title: 'La chronicité',
    description: 'La maladie s\'est installée. Les traitements lourds t\'épuisent. La foi vacille.',
    ageRange: [31, 61],
    category: 'doute_incredulite',
    correctVerseId: 'v-doute-002',
    decoyVerseIds: [],
    statImpactOnFail: { foi: -7, paix: -5, physique: -6, finances: -5 },
  },
  {
    id: 'e-prod-005',
    title: 'Le burn-out spirituel',
    description:
      'Tu sers, tu travailles, tu gères tout. Ta foi était vive mais maintenant c\'est mécanique.',
    ageRange: [28, 50],
    category: 'doute_incredulite',
    correctVerseId: 'v-doute-001',
    decoyVerseIds: [],
    statImpactOnFail: { foi: -7, paix: -5, physique: -3, finances: -1 },
    cascadeEventId: 'e-prod-005-c',
  },
  {
    id: 'e-prod-005-c',
    title: 'L\'abandon du ministère',
    description:
      'Le burn-out t\'a poussé à tout abandonner. Tu as quitté l\'église et renié ton appel.',
    ageRange: [29, 51],
    category: 'combat_spirituel',
    correctVerseId: 'v-combat-003',
    decoyVerseIds: [],
    statImpactOnFail: { foi: -10, paix: -5, physique: -2, finances: -3 },
  },
  {
    id: 'e-prod-006',
    title: 'Le combat générationnel',
    description:
      'Les mêmes schémas destructeurs se répètent : divorce, pauvreté. On te dit que c\'est l\'héritage.',
    ageRange: [26, 45],
    category: 'combat_spirituel',
    correctVerseId: 'v-combat-002',
    decoyVerseIds: [],
    statImpactOnFail: { foi: -5, paix: -4, physique: -2, finances: -3 },
    cascadeEventId: 'e-prod-006-c',
  },
  {
    id: 'e-prod-006-c',
    title: 'La forteresse ancrée',
    description:
      'Le pattern générationnel s\'est renforcé. Tes enfants reproduisent les mêmes erreurs.',
    ageRange: [30, 50],
    category: 'combat_spirituel',
    correctVerseId: 'v-combat-001',
    decoyVerseIds: [],
    statImpactOnFail: { foi: -6, paix: -5, physique: -1, finances: -4 },
  },
  {
    id: 'e-prod-007',
    title: 'L\'appel au leadership',
    description:
      'On te propose un ministère ou un poste à responsabilité. La peur de ne pas être à la hauteur te paralyse.',
    ageRange: [28, 50],
    category: 'identite_appel',
    correctVerseId: 'v-ident-004',
    decoyVerseIds: [],
    statImpactOnFail: { foi: -4, paix: -3, physique: -1, finances: 1 },
  },
  {
    id: 'e-prod-008',
    title: 'La paresse installée',
    description:
      'Le confort t\'a endormi. Tu fais le minimum depuis des années. Des plus jeunes te dépassent.',
    ageRange: [35, 55],
    category: 'finances_paresse',
    correctVerseId: 'v-fin-002',
    decoyVerseIds: [],
    statImpactOnFail: { foi: -2, paix: -3, physique: -1, finances: -6 },
    cascadeEventId: 'e-prod-008-c',
  },
  {
    id: 'e-prod-008-c',
    title: 'La stagnation professionnelle',
    description:
      'La paresse t\'a rattrapé. Tu es au même poste depuis 10 ans, sans perspective. Les autres avancent.',
    ageRange: [36, 56],
    category: 'finances_paresse',
    correctVerseId: 'v-fin-010',
    decoyVerseIds: [],
    statImpactOnFail: { foi: -2, paix: -3, physique: -1, finances: -5 },
  },

  // ═══ 60+ ans — Bilan ═══
  {
    id: 'e-bilan-001',
    title: 'La solitude',
    description:
      'Les amis sont partis. Les enfants ont leur vie. Les jours sont longs et le silence pèse.',
    ageRange: [60, 90],
    category: 'peur_angoisse',
    correctVerseId: 'v-peur-010',
    decoyVerseIds: [],
    statImpactOnFail: { foi: -3, paix: -6, physique: -2, finances: 0 },
  },
  {
    id: 'e-bilan-002',
    title: 'Le doute sur l\'héritage',
    description:
      'As-tu vraiment accompli ce pour quoi Dieu t\'avait appelé ? As-tu été fidèle ?',
    ageRange: [60, 95],
    category: 'doute_incredulite',
    correctVerseId: 'v-doute-002',
    decoyVerseIds: [],
    statImpactOnFail: { foi: -5, paix: -5, physique: -1, finances: 0 },
  },
  {
    id: 'e-bilan-003',
    title: 'La bataille finale',
    description:
      'Le diable sait que son temps est court. Une dernière tentation massive se présente.',
    ageRange: [65, 95],
    category: 'combat_spirituel',
    correctVerseId: 'v-combat-006',
    decoyVerseIds: [],
    statImpactOnFail: { foi: -8, paix: -4, physique: -3, finances: -1 },
  },
  {
    id: 'e-bilan-004',
    title: 'L\'orgueil spirituel',
    description:
      'Tu as vu tant de choses que tu penses tout savoir. La fierté t\'isole des plus jeunes.',
    ageRange: [60, 90],
    category: 'orgueil_independance',
    correctVerseId: 'v-orgueil-004',
    decoyVerseIds: [],
    statImpactOnFail: { foi: -4, paix: -3, physique: 0, finances: 0 },
  },
  {
    id: 'e-bilan-005',
    title: 'La transmission',
    description:
      'Dieu te demande de former des jeunes. Mais la chair lutte pour garder le contrôle.',
    ageRange: [60, 85],
    category: 'combat_spirituel',
    correctVerseId: 'v-combat-005',
    decoyVerseIds: [],
    statImpactOnFail: { foi: -4, paix: -3, physique: -1, finances: -1 },
  },
  // ═══ NOUVEAUX — Remplir les âges 61-100 ═══
  {
    id: 'e-bilan-006',
    title: 'La perte du conjoint',
    description:
      'Après une vie entière ensemble, ton conjoint est parti. La solitude est un gouffre et la foi vacille devant l\'absence.',
    ageRange: [65, 95],
    category: 'amertume_rejet',
    correctVerseId: 'v-amer-007',
    decoyVerseIds: [],
    statImpactOnFail: { foi: -6, paix: -8, physique: -3, finances: -4 },
  },
  {
    id: 'e-bilan-007',
    title: 'La tentation du regret',
    description:
      'Tu repenses à tous les chemins que tu n\'as pas pris. Le regret et le "et si..." menacent de voler la paix de tes dernières années.',
    ageRange: [65, 90],
    category: 'doute_incredulite',
    correctVerseId: 'v-doute-006',
    decoyVerseIds: [],
    statImpactOnFail: { foi: -5, paix: -6, physique: -1, finances: 0 },
  },
  {
    id: 'e-bilan-008',
    title: 'Les enfants ingrats',
    description:
      'Tes enfants adultes te négligent. Ils ont leur vie et ne prennent pas de tes nouvelles. L\'amertume veut s\'installer dans ton cœur.',
    ageRange: [65, 90],
    category: 'amertume_rejet',
    correctVerseId: 'v-amer-009',
    decoyVerseIds: [],
    statImpactOnFail: { foi: -4, paix: -6, physique: -1, finances: -1 },
  },
  {
    id: 'e-bilan-009',
    title: 'La maladie longue',
    description:
      'Les années pèsent. Le corps ne suit plus. Chaque jour est une lutte contre la douleur et la lassitude.',
    ageRange: [70, 95],
    category: 'peur_angoisse',
    correctVerseId: 'v-peur-009',
    decoyVerseIds: [],
    statImpactOnFail: { foi: -3, paix: -4, physique: -8, finances: -3 },
    cascadeEventId: 'e-bilan-009-c',
  },
  {
    id: 'e-bilan-009-c',
    title: 'La dépression du soir',
    description:
      'La maladie t\'a cloué au lit. Les nuits sont interminables et l\'esprit de mort rôde. C\'est le combat le plus dur de ta vie.',
    ageRange: [71, 96],
    category: 'combat_spirituel',
    correctVerseId: 'v-combat-008',
    decoyVerseIds: [],
    statImpactOnFail: { foi: -8, paix: -6, physique: -5, finances: -1 },
  },
  {
    id: 'e-bilan-010',
    title: 'La couronne de vie',
    description:
      'Tu sens que la fin approche. Mais au lieu de la peur, une paix étrange t\'envahit. Tu vois ta vie défiler et comprends le plan.',
    ageRange: [80, 100],
    category: 'identite_appel',
    correctVerseId: 'v-ident-007',
    decoyVerseIds: [],
    statImpactOnFail: { foi: -3, paix: -3, physique: -2, finances: 0 },
  },
  // ═══════════════════════════════════════════════════
  // ARCS NARRATIFS — Histoires multi-événements
  // ═══════════════════════════════════════════════════
  //
  // Chaque arc est une séquence d'événements liés par storyArcId.
  // Les événements incluent des variantes narratives selon le profil
  // et des conditions de stats pour une expérience personnalisée.
  //
  // --- Arc 1: Le pardon de Louise ---
  {
    id: 'arc-louise-1',
    title: 'Le message de Louise',
    description:
      'Tu reçois un message d\'une amie d\'enfance que tu n\'as pas vue depuis 15 ans. Louise te demande pardon pour ce qui s\'est passé. Une vieille blessure se rouvre.',
    ageRange: [30, 45],
    category: 'amertume_rejet',
    correctVerseId: 'v-amer-004',
    decoyVerseIds: [],
    statImpactOnFail: { foi: -4, paix: -5, physique: -1, finances: 0 },
    storyArcId: 'arc-louise',
    arcSequence: 1,
    thematicFlavor: 'Pardon et réconciliation',
    narrativeVariants: [
      {
        condition: { type: 'birth_profile', profileName: 'Éprouvé' },
        title: 'Le message de Louise — Épreuve passée',
        description: 'Tu as toujours porté cette blessure. Le message de Louise te prend au dépourvu. La cicatrice semblait refermée mais la douleur est encore là. Elle demande humblement ta réconciliation.'
      },
    ],
    cascadeEventId: 'arc-louise-1-c',
  },
  {
    id: 'arc-louise-1-c',
    title: 'La rancune',
    description: 'Tu as ignoré le message de Louise. L\'amertume grandit dans ton cœur et elle revient te hanter.',
    ageRange: [31, 46],
    category: 'amertume_rejet',
    correctVerseId: 'v-amer-006',
    decoyVerseIds: [],
    statImpactOnFail: { foi: -5, paix: -6, physique: -1, finances: -1 },
    storyArcId: 'arc-louise',
    arcSequence: 1,
  },
  {
    id: 'arc-louise-2',
    title: 'Les retrouvailles',
    description:
      'Tu as accepté de voir Louise. Elle est assise en face de toi, les larmes aux yeux. L\'atmosphère est lourde de 15 ans de silence. Elle te dit: "J\'ai eu tort, et ça me ronge depuis tout ce temps."',
    ageRange: [31, 46],
    category: 'amertume_rejet',
    correctVerseId: 'v-amer-009',
    decoyVerseIds: [],
    statImpactOnFail: { foi: -3, paix: -6, physique: -1, finances: 0 },
    storyArcId: 'arc-louise',
    arcSequence: 2,
    minStat: { paix: 20 },
    thematicFlavor: 'Réconciliation et vulnérabilité',
    cascadeEventId: 'arc-louise-2-c',
  },
  {
    id: 'arc-louise-2-c',
    title: 'Le divorce des cœurs',
    description: 'La rencontre a tourné au conflit. Les vieilles blessures se sont rouvertes et vous repartez plus divisés que jamais.',
    ageRange: [32, 47],
    category: 'amertume_rejet',
    correctVerseId: 'v-amer-001',
    decoyVerseIds: [],
    statImpactOnFail: { foi: -5, paix: -7, physique: -2, finances: -1 },
  },
  {
    id: 'arc-louise-3',
    title: 'La libération',
    description:
      'Le pardon a été scellé. Louise te serre dans ses bras. Tu sens un poids immense quitter tes épaules. La paix que tu n\'attendais plus envahit ton cœur. Une nouvelle page s\'ouvre.',
    ageRange: [32, 47],
    category: 'amertume_rejet',
    correctVerseId: 'v-amer-002',
    decoyVerseIds: [],
    statImpactOnFail: { foi: -2, paix: -3, physique: 0, finances: 0 },
    storyArcId: 'arc-louise',
    arcSequence: 3,
    minStat: { paix: 25 },
    thematicFlavor: 'La paix retrouvée',
    narrativeVariants: [
      {
        condition: { type: 'stat_check', stat: 'paix', operator: 'gt', value: 60 },
        title: 'La libération — Ceux qui consolent',
        description: 'Non seulement tu as pardonné, mais tu sens une onction de consolation monter en toi. Tu réalises que cette épreuve t\'a préparé à en aider d\'autres à traverser le même chemin de pardon. Une nouvelle dimension de ton ministère s\'ouvre.'
      }
    ],
  },
  // --- Arc 2: Le disciple Mathias ---
  {
    id: 'arc-mathias-1',
    title: 'La demande de Mathias',
    description:
      'Un jeune homme de l\'église, Mathias, vient te voir après le culte. "J\'ai observé ta vie," te dit-il. "Je veux apprendre à marcher comme tu marches. Acceptes-tu de me former?" Son regard est sincère, presque suppliant.',
    ageRange: [28, 50],
    category: 'identite_appel',
    correctVerseId: 'v-ident-004',
    decoyVerseIds: [],
    statImpactOnFail: { foi: -4, paix: -2, physique: 0, finances: 0 },
    storyArcId: 'arc-mathias',
    arcSequence: 1,
    thematicFlavor: 'Le poids du mentorat',
    narrativeVariants: [
      {
        condition: { type: 'stat_check', stat: 'foi', operator: 'gt', value: 70 },
        title: 'La demande de Mathias — Père spirituel',
        description: 'Mathias te regarde comme un fils regarde son père dans la foi. Tu sens le poids de cette responsabilité mais aussi la joie de voir une génération se lever. "Prends ton temps," lui réponds-tu. "Ce chemin est exigeant mais tu n\'es pas seul."'
      },
    ],
    cascadeEventId: 'arc-mathias-1-c',
  },
  {
    id: 'arc-mathias-1-c',
    title: 'Le jeune homme repoussé',
    description: 'Tu as refusé de former Mathias, prétextant le manque de temps. Il est reparti la tête basse. Une occasion de transmission perdue.',
    ageRange: [29, 51],
    category: 'orgueil_independance',
    correctVerseId: 'v-orgueil-003',
    decoyVerseIds: [],
    statImpactOnFail: { foi: -5, paix: -3, physique: 0, finances: 0 },
  },
  {
    id: 'arc-mathias-2',
    title: 'La première leçon',
    description:
      'Mathias est assis dans ton bureau, un carnet à la main, prêt à tout noter. "Par où commence-t-on?" demande-t-il avec l\'enthousiasme des débutants. Tu ouvres ta Bible et tu sens l\'Esprit te guider sur ce qu\'il a besoin d\'entendre.',
    ageRange: [29, 51],
    category: 'identite_appel',
    correctVerseId: 'v-ident-006',
    decoyVerseIds: [],
    statImpactOnFail: { foi: -3, paix: -2, physique: 0, finances: 0 },
    storyArcId: 'arc-mathias',
    arcSequence: 2,
    minStat: { foi: 30 },
    cascadeEventId: 'arc-mathias-2-c',
  },
  {
    id: 'arc-mathias-2-c',
    title: 'L\'enseignement vide',
    description: 'Tu n\'étais pas préparé. La leçon était creuse et Mathias est reparti déçu, dubitatif sur ce qu\'il a vu en toi.',
    ageRange: [30, 52],
    category: 'doute_incredulite',
    correctVerseId: 'v-doute-002',
    decoyVerseIds: [],
    statImpactOnFail: { foi: -5, paix: -3, physique: -1, finances: 0 },
  },
  {
    id: 'arc-mathias-3',
    title: 'L\'épreuve du disciple',
    description:
      'Mathias traverse une crise de foi. Un drame familial l\'a ébranlé et il remet tout en question. "Si Dieu est bon, pourquoi ça?" te lance-t-il, les poings serrés. Son regard brûle de douleur et de colère.',
    ageRange: [32, 55],
    category: 'doute_incredulite',
    correctVerseId: 'v-doute-001',
    decoyVerseIds: [],
    statImpactOnFail: { foi: -5, paix: -4, physique: -1, finances: 0 },
    storyArcId: 'arc-mathias',
    arcSequence: 3,
    minStat: { foi: 35 },
    cascadeEventId: 'arc-mathias-3-c',
  },
  {
    id: 'arc-mathias-3-c',
    title: 'Le disciple perdu',
    description: 'Tu n\'as pas su répondre à ses questions. Mathias s\'est éloigné de l\'église et de la foi. Le poids de cet échec te suit.',
    ageRange: [33, 56],
    category: 'amertume_rejet',
    correctVerseId: 'v-amer-005',
    decoyVerseIds: [],
    statImpactOnFail: { foi: -6, paix: -5, physique: -1, finances: 0 },
  },
  {
    id: 'arc-mathias-4',
    title: 'La moisson du mentor',
    description:
      'Mathias se tient devant l\'église, la Bible à la main. Il prêche avec une onction que tu reconnais — elle vient de Dieu, mais elle porte aussi quelque chose de tes années d\'investissement en lui. Il te regarde et hoche la tête. "Merci, Père."',
    ageRange: [35, 60],
    category: 'identite_appel',
    correctVerseId: 'v-ident-002',
    decoyVerseIds: [],
    statImpactOnFail: { foi: -3, paix: -2, physique: 0, finances: 1 },
    storyArcId: 'arc-mathias',
    arcSequence: 4,
    minStat: { foi: 40 },
    thematicFlavor: 'La multiplication spirituelle',
  },
  // --- Arc 3: L'héritage du père ---
  {
    id: 'arc-heritage-1',
    title: 'La lettre du passé',
    description:
      'En vidant la maison de tes parents décédés, tu trouves une lettre cachée dans un vieux livre. Elle révèle un secret que ton père n\'a jamais eu le courage de te dire sur ses origines et un héritage spirituel laissé à l\'abandon.',
    ageRange: [35, 55],
    category: 'identite_appel',
    correctVerseId: 'v-ident-001',
    decoyVerseIds: [],
    statImpactOnFail: { foi: -3, paix: -3, physique: 0, finances: -1 },
    storyArcId: 'arc-heritage',
    arcSequence: 1,
    thematicFlavor: 'Héritage et racines',
    narrativeVariants: [
      {
        condition: { type: 'birth_profile', profileName: 'Financier' },
        title: 'La lettre du passé — Trésor caché',
        description: 'Parmi les papiers de ton père, une enveloppe épaisse attire ton attention. Ce n\'est pas de l\'argent, mais quelque chose de bien plus précieux: les mémoires de ton grand-père, un homme de prière qui a marqué toute une région. Ton père n\'a jamais osé marcher dans ses traces.'
      },
    ],
    cascadeEventId: 'arc-heritage-1-c',
  },
  {
    id: 'arc-heritage-1-c',
    title: 'La lettre ignorée',
    description: 'Tu as rangé la lettre sans la lire. Le passé reste enterré et les bénédictions des pères restent scellées.',
    ageRange: [36, 56],
    category: 'finances_paresse',
    correctVerseId: 'v-fin-004',
    decoyVerseIds: [],
    statImpactOnFail: { foi: -3, paix: -2, physique: 0, finances: -3 },
  },
  {
    id: 'arc-heritage-2',
    title: 'La quête des racines',
    description:
      'Tu décides de remonter le fil de cette histoire. Le voyage te mène dans le village de tes ancêtres. Là, des anciens te racontent qui était vraiment ton grand-père — un homme dont la foi a transformé toute une communauté.',
    ageRange: [36, 58],
    category: 'identite_appel',
    correctVerseId: 'v-ident-003',
    decoyVerseIds: [],
    statImpactOnFail: { foi: -3, paix: -2, physique: -1, finances: -2 },
    storyArcId: 'arc-heritage',
    arcSequence: 2,
    minStat: { foi: 30 },
    cascadeEventId: 'arc-heritage-2-c',
  },
  {
    id: 'arc-heritage-2-c',
    title: 'Les racines coupées',
    description: 'Les habitants du village sont méfiants. Tu repars sans rien apprendre. Un pan entier de ton identité te reste inconnu.',
    ageRange: [37, 59],
    category: 'amertume_rejet',
    correctVerseId: 'v-amer-005',
    decoyVerseIds: [],
    statImpactOnFail: { foi: -4, paix: -3, physique: -1, finances: -1 },
  },
  {
    id: 'arc-heritage-3',
    title: 'Le trône restauré',
    description:
      'Tu te tiens devant l\'assemblée des anciens. Le livre des mémoires de ta famille est ouvert. Tu sens que tu n\'es pas seulement le fruit de tes choix, mais aussi le dépositaire d\'un héritage spirituel que Dieu restaure à travers toi. La bénédiction des générations t\'atteint enfin.',
    ageRange: [38, 60],
    category: 'identite_appel',
    correctVerseId: 'v-ident-005',
    decoyVerseIds: [],
    statImpactOnFail: { foi: -2, paix: -2, physique: 0, finances: 1 },
    storyArcId: 'arc-heritage',
    arcSequence: 3,
    minStat: { foi: 35 },
    thematicFlavor: 'Bénédiction générationnelle',
  },
  // --- Arc 4: La tentation du pouvoir ---
  {
    id: 'arc-tentation-1',
    title: 'La promotion inattendue',
    description:
      'Ton supérieur te convoque. "Nous avons vu ton travail," dit-il. "Je te propose de prendre la direction du département. Le salaire triple, mais les responsabilités aussi." L\'offre est flatteuse, presque trop belle.',
    ageRange: [25, 40],
    category: 'orgueil_independance',
    correctVerseId: 'v-orgueil-005',
    decoyVerseIds: [],
    statImpactOnFail: { foi: -3, paix: -2, physique: -1, finances: 2 },
    storyArcId: 'arc-tentation',
    arcSequence: 1,
    thematicFlavor: 'L\'orgueil et l\'ambition',
    narrativeVariants: [
      {
        condition: { type: 'birth_profile', profileName: 'Santé fragile' },
        title: 'La promotion — Le fardeau',
        description: 'L\'offre est alléchante, mais tu connais tes limites. Le poste demande 60h par semaine. Ta santé déjà fragile pourrait ne pas tenir. Pourtant, refuser une telle promotion serait vu comme un manque d\'ambition. Le dilemme te serre la poitrine.'
      },
    ],
    cascadeEventId: 'arc-tentation-1-c',
  },
  {
    id: 'arc-tentation-1-c',
    title: 'L\'orgueil du titre',
    description: 'Tu as accepté la promotion sans réfléchir. Le titre t\'est monté à la tête et tu commences à négliger ta vie spirituelle.',
    ageRange: [26, 41],
    category: 'orgueil_independance',
    correctVerseId: 'v-orgueil-001',
    decoyVerseIds: [],
    statImpactOnFail: { foi: -5, paix: -3, physique: -2, finances: 3 },
  },
  {
    id: 'arc-tentation-2',
    title: 'Les compromis du pouvoir',
    description:
      'Ton nouveau poste exige des décisions que ta conscience n\'approuve pas. Licenciements, petits arrangements, comptes à falsifier. "C\'est comme ça que ça marche en haut," te dit un collègue. "Tu t\'y feras."',
    ageRange: [26, 42],
    category: 'orgueil_independance',
    correctVerseId: 'v-orgueil-003',
    decoyVerseIds: [],
    statImpactOnFail: { foi: -5, paix: -4, physique: -1, finances: 2 },
    storyArcId: 'arc-tentation',
    arcSequence: 2,
    minStat: { foi: 25 },
    cascadeEventId: 'arc-tentation-2-c',
  },
  {
    id: 'arc-tentation-2-c',
    title: 'La conscience assoupie',
    description: 'Tu as cédé. Les compromis s\'accumulent et ta foi s\'affaiblit. Le succès professionnel semble tout justifier.',
    ageRange: [27, 43],
    category: 'doute_incredulite',
    correctVerseId: 'v-doute-003',
    decoyVerseIds: [],
    statImpactOnFail: { foi: -7, paix: -4, physique: -2, finances: 2 },
  },
  {
    id: 'arc-tentation-3',
    title: 'Le miroir brisé',
    description:
      'Un subordonné te regarde avec des yeux pleins de reproche. Tu réalises que tu es en train de devenir ce que tu dénonçais. Le décalage entre ce que tu prêches le dimanche et ce que tu fais la semaine est devenu un gouffre. Le miroir de la Parole te montre une vérité difficile.',
    ageRange: [28, 45],
    category: 'orgueil_independance',
    correctVerseId: 'v-orgueil-002',
    decoyVerseIds: [],
    statImpactOnFail: { foi: -6, paix: -5, physique: -2, finances: 1 },
    storyArcId: 'arc-tentation',
    arcSequence: 3,
    minStat: { paix: 20 },
    thematicFlavor: 'Le réveil de la conscience',
    cascadeEventId: 'arc-tentation-3-c',
  },
  {
    id: 'arc-tentation-3-c',
    title: 'La chute',
    description: 'Le gouffre est trop grand. Tu as quitté l\'église pour te consacrer entièrement à ta carrière. Le Prodige est devenu un étranger pour lui-même.',
    ageRange: [29, 46],
    category: 'combat_spirituel',
    correctVerseId: 'v-combat-003',
    decoyVerseIds: [],
    statImpactOnFail: { foi: -8, paix: -4, physique: -2, finances: 2 },
  },
  {
    id: 'arc-tentation-4',
    title: 'La croisée des chemins',
    description:
      'Face à la glace, tu prends une décision radicale. Tu démissionnes. Tes collègues pensent que tu es fou de quitter un tel poste. Mais pour la première fois depuis des mois, tu respires. Le chemin de l\'intégrité est étroit, mais il mène à la vie.',
    ageRange: [29, 47],
    category: 'combat_spirituel',
    correctVerseId: 'v-combat-005',
    decoyVerseIds: [],
    statImpactOnFail: { foi: -5, paix: -4, physique: -1, finances: -5 },
    storyArcId: 'arc-tentation',
    arcSequence: 4,
    minStat: { foi: 30 },
    thematicFlavor: 'L\'intégrité retrouvée',
  },
  {
    id: 'arc-tentation-5',
    title: 'Le témoignage du feu',
    description:
      'Des mois plus tard, ton ancien collègue te contacte. "Ce que tu as fait m\'a marqué," dit-il. "J\'ai quitté la boîte aussi. Et je me suis tourné vers Dieu." Le sacrifice n\'était pas vain. Ton intégrité a allumé une flamme chez les autres.',
    ageRange: [31, 50],
    category: 'identite_appel',
    correctVerseId: 'v-ident-002',
    decoyVerseIds: [],
    statImpactOnFail: { foi: -3, paix: -2, physique: 0, finances: 1 },
    storyArcId: 'arc-tentation',
    arcSequence: 5,
    minStat: { foi: 35 },
    thematicFlavor: 'Le fruit de l\'intégrité',
  },
  // --- Arc 5: Le chemin de guérison ---
  {
    id: 'arc-guerison-1',
    title: 'Le diagnostic',
    description:
      'Le médecin repose son stylo. Les mots qu\'il prononce te traversent comme une épée: "Je suis désolé, c\'est sérieux." Le monde s\'arrête. Dans le silence du cabinet, tu n\'entends plus que les battements de ton coeur et la question qui monte: "Pourquoi moi?"',
    ageRange: [35, 65],
    category: 'peur_angoisse',
    correctVerseId: 'v-peur-003',
    decoyVerseIds: [],
    statImpactOnFail: { foi: -5, paix: -6, physique: -5, finances: -3 },
    storyArcId: 'arc-guerison',
    arcSequence: 1,
    thematicFlavor: 'L\'annonce qui change tout',
    cascadeEventId: 'arc-guerison-1-c',
  },
  {
    id: 'arc-guerison-1-c',
    title: 'Le refus du diagnostic',
    description: 'Tu refuses d\'accepter la maladie. Le déni te pousse à ignorer les traitements et la situation empire année après année.',
    ageRange: [36, 66],
    category: 'doute_incredulite',
    correctVerseId: 'v-doute-001',
    decoyVerseIds: [],
    statImpactOnFail: { foi: -5, paix: -5, physique: -6, finances: -4 },
  },
  {
    id: 'arc-guerison-2',
    title: 'La traversée de la vallée',
    description:
      'Les traitements sont lourds. Certains jours, tu n\'as même pas la force de prier. Les nuits sont longues et la douleur est une compagne constante. Mais dans le silence de l\'aube, une présence que tu ne vois pas te visite. Une paix inexplicable, comme un baume sur une plaie à vif, descend sur ton lit d\'hôpital.',
    ageRange: [36, 67],
    category: 'peur_angoisse',
    correctVerseId: 'v-peur-007',
    decoyVerseIds: [],
    statImpactOnFail: { foi: -4, paix: -6, physique: -4, finances: -2 },
    storyArcId: 'arc-guerison',
    arcSequence: 2,
    minStat: { foi: 25 },
    cascadeEventId: 'arc-guerison-2-c',
    narrativeVariants: [
      {
        condition: { type: 'stat_check', stat: 'foi', operator: 'gt', value: 60 },
        title: 'La vallée — La visite céleste',
        description: 'Dans ta chambre d\'hôpital, une lumière douce traverse les rideaux. Tu sens une main invisible presser la tienne. La douleur ne disparaît pas, mais elle devient supportable. Tu comprends que traverser la vallée avec Lui est différent que de la traverser seul. Une force que tu ne peux expliquer te soulève.'
      },
    ],
  },
  {
    id: 'arc-guerison-2-c',
    title: 'L\'amertume du malade',
    description: 'La maladie t\'a rendu amer. Tu t\'es enfermé dans la plainte et le rejet de Dieu. Les visiteurs se sont faits rares.',
    ageRange: [37, 68],
    category: 'amertume_rejet',
    correctVerseId: 'v-amer-006',
    decoyVerseIds: [],
    statImpactOnFail: { foi: -6, paix: -6, physique: -3, finances: -2 },
  },
  {
    id: 'arc-guerison-3',
    title: 'Le témoignage vivant',
    description:
      'Le jour du verdict est arrivé. Les examens montrent une rémission inexplicable. Le médecin secoue la tête: "Médicalement, ça n\'a pas de sens." Tu sais, toi, ce qui s\'est passé dans cette chambre d\'hôpital pendant les longues nuits de veille. La guérison n\'est pas seulement physique — elle est totale.',
    ageRange: [38, 70],
    category: 'identite_appel',
    correctVerseId: 'v-peur-006',
    decoyVerseIds: [],
    statImpactOnFail: { foi: -3, paix: -3, physique: -2, finances: -1 },
    storyArcId: 'arc-guerison',
    arcSequence: 3,
    minStat: { foi: 30 },
    thematicFlavor: 'La restauration complète',
  },
];

/** Récupère un événement par son ID */
export function getEventById(id: string): AfflictionEvent | undefined {
  return EVENT_DATABASE.find((e) => e.id === id);
}

/** Récupère les événements disponibles pour un âge donné */
export function getEventsForAge(age: number): AfflictionEvent[] {
  return EVENT_DATABASE.filter(
    (e) => age >= e.ageRange[0] && age <= e.ageRange[1]
  );
}

/** Assigne les leurres (appelé à chaque génération) */
export function assignDecoys(): AfflictionEvent[] {
  return EVENT_DATABASE.map((event) => ({
    ...event,
    decoyVerseIds:
      event.decoyVerseIds.length > 0
        ? event.decoyVerseIds
        : pickDecoys(event.correctVerseId, event.category),
  }));
}

export const TOTAL_EVENTS = EVENT_DATABASE.length;

/**
 * Résout un événement pour un âge donné.
 * Si l'événement a un `byAge` pour le stade correspondant,
 * les champs description / statImpactOnFail / thematicFlavor sont remplacés.
 */
export function resolveEventForAge(event: AfflictionEvent, age: number): AfflictionEvent {
  const stage: LifeStage =
    age >= 60 ? 'senior'
    : age >= 18 ? 'adulte'
    : age >= 12 ? 'ado'
    : 'enfant';

  const variant = event.byAge?.[stage];
  if (!variant) return event;

  return {
    ...event,
    description: variant.description,
    thematicFlavor: variant.thematicFlavor ?? event.thematicFlavor,
    statImpactOnFail: variant.statImpactOnFail
      ? {
          foi:      (event.statImpactOnFail.foi      ?? 0) + (variant.statImpactOnFail.foi      ?? 0),
          paix:     (event.statImpactOnFail.paix     ?? 0) + (variant.statImpactOnFail.paix     ?? 0),
          physique: (event.statImpactOnFail.physique ?? 0) + (variant.statImpactOnFail.physique ?? 0),
          finances: (event.statImpactOnFail.finances ?? 0) + (variant.statImpactOnFail.finances ?? 0),
        }
      : event.statImpactOnFail,
  };
}
