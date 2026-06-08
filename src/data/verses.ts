import type { VerseEntry } from '../types/game';

/**
 * Base de données initiale des versets — 60+ entrées.
 * 4 catégories principales + lexique EJP/ICC.
 * Structurée pour Spaced Repetition et matching sémantique.
 */
export const VERSE_DATABASE: VerseEntry[] = [
  // ═══════════════════════════════════════════════
  // CATÉGORIE 1 — PEUR & ANGOISSE
  // ═══════════════════════════════════════════════
  {
    id: 'v-peur-001',
    reference: '2 Timothée 1.7',
    text: 'Car ce n\'est pas un esprit de timidité que Dieu nous a donné, mais un esprit de force, d\'amour et de sagesse.',
    category: 'peur_angoisse',
    tags: ['peur', 'timidité', 'crainte', 'force', 'amour', 'sagesse', 'esprit'],
    statImpact: { foi: 3, paix: 4 },
    difficulty: 1,
  },
  {
    id: 'v-peur-002',
    reference: 'Psaume 27.1',
    text: 'L\'Éternel est ma lumière et mon salut: de qui aurai-je peur? L\'Éternel est le rempart de ma vie: de qui aurai-je crainte?',
    category: 'peur_angoisse',
    tags: ['peur', 'crainte', 'lumière', 'salut', 'rempart', 'protection'],
    statImpact: { foi: 3, paix: 3 },
    difficulty: 1,
  },
  {
    id: 'v-peur-003',
    reference: 'Ésaïe 41.10',
    text: 'Ne crains rien, car je suis avec toi; Ne promène pas des regards inquiets, car je suis ton Dieu; Je te fortifie, je viens à ton secours, Je te soutiens de ma droite triomphante.',
    category: 'peur_angoisse',
    tags: ['crainte', 'inquiétude', 'secours', 'force', 'présence', 'dieu'],
    statImpact: { foi: 2, paix: 4 },
    difficulty: 1,
  },
  {
    id: 'v-peur-004',
    reference: 'Philippiens 4.6-7',
    text: 'Ne vous inquiétez de rien; mais en toute chose faites connaître vos besoins à Dieu par des prières et des supplications, avec des actions de grâces. Et la paix de Dieu, qui surpasse toute intelligence, gardera vos cœurs et vos pensées en Jésus-Christ.',
    category: 'peur_angoisse',
    tags: ['inquiétude', 'prière', 'paix', 'supplication', 'action de grâce'],
    statImpact: { paix: 5, foi: 2 },
    difficulty: 2,
  },
  {
    id: 'v-peur-005',
    reference: 'Psaume 56.3-4',
    text: 'Quand je suis dans la crainte, En toi je me confie. Je me confie en Dieu, je ne crains rien: Que peuvent me faire des hommes?',
    category: 'peur_angoisse',
    tags: ['crainte', 'confiance', 'hommes', 'protection'],
    statImpact: { foi: 2, paix: 3 },
    difficulty: 2,
  },
  {
    id: 'v-peur-006',
    reference: 'Josué 1.9',
    text: 'Ne t\'ai-je pas donné cet ordre: Fortifie-toi et prends courage? Ne t\'effraie point et ne t\'épouvante point, car l\'Éternel, ton Dieu, est avec toi dans tout ce que tu entreprendras.',
    category: 'peur_angoisse',
    tags: ['courage', 'force', 'effroi', 'entreprise', 'ordre'],
    statImpact: { foi: 3, paix: 2, physique: 1 },
    difficulty: 1,
  },
  {
    id: 'v-peur-007',
    reference: 'Jean 14.27',
    text: 'Je vous laisse la paix, je vous donne ma paix. Je ne vous donne pas comme le monde donne. Que votre cœur ne se trouble point, et ne s\'alarme point.',
    category: 'peur_angoisse',
    tags: ['paix', 'trouble', 'alarme', 'cœur', 'monde'],
    statImpact: { paix: 5, foi: 1 },
    difficulty: 1,
  },
  {
    id: 'v-peur-008',
    reference: 'Psaume 34.5',
    text: 'Quand on tourne vers lui les regards, on est radieux de joie, et le visage ne se couvre pas de honte.',
    category: 'peur_angoisse',
    tags: ['regard', 'joie', 'honte', 'radieux', 'dieu'],
    statImpact: { foi: 2, paix: 2 },
    difficulty: 2,
  },
  {
    id: 'v-peur-009',
    reference: 'Romains 8.15',
    text: 'Et vous n\'avez point reçu un esprit de servitude pour être encore dans la crainte; mais vous avez reçu un Esprit d\'adoption, par lequel nous crions: Abba! Père!',
    category: 'peur_angoisse',
    tags: ['servitude', 'crainte', 'adoption', 'père', 'esprit', 'filiation'],
    statImpact: { foi: 4, paix: 3 },
    difficulty: 2,
  },
  {
    id: 'v-peur-010',
    reference: '1 Pierre 5.7',
    text: 'Déchargez-vous sur lui de tous vos soucis, car lui-même prend soin de vous.',
    category: 'peur_angoisse',
    tags: ['soucis', 'charge', 'soin', 'confiance', 'abandon'],
    statImpact: { paix: 3, foi: 2 },
    difficulty: 1,
  },

  // ═══════════════════════════════════════════════
  // CATÉGORIE 2 — IMPUDICITÉ & ADDICTIONS
  // ═══════════════════════════════════════════════
  {
    id: 'v-imput-001',
    reference: '1 Corinthiens 6.15-20',
    text: 'Ne savez-vous pas que vos corps sont les membres de Christ?… Fuyez l\'impudicité. Quelque autre péché qu\'un homme commette, ce péché est hors du corps; mais celui qui se livre à l\'impudicité pèche contre son propre corps. Ne savez-vous pas que votre corps est le temple du Saint-Esprit?',
    category: 'impudicite_addiction',
    tags: ['corps', 'temple', 'impudicité', 'esprit', 'péché', 'sainteté'],
    statImpact: { foi: 4, physique: 3 },
    difficulty: 2,
  },
  {
    id: 'v-imput-002',
    reference: 'Galates 5.1',
    text: 'C\'est pour la liberté que Christ nous a affranchis. Demeurez donc fermes, et ne vous laissez pas mettre de nouveau sous le joug de la servitude.',
    category: 'impudicite_addiction',
    tags: ['liberté', 'affranchi', 'joug', 'servitude', 'ferme', 'christ'],
    statImpact: { foi: 4, paix: 2 },
    difficulty: 1,
  },
  {
    id: 'v-imput-003',
    reference: 'Romains 6.14',
    text: 'Car le péché n\'aura point de pouvoir sur vous, puisque vous êtes, non sous la loi, mais sous la grâce.',
    category: 'impudicite_addiction',
    tags: ['péché', 'loi', 'grâce', 'pouvoir', 'liberté'],
    statImpact: { foi: 3, paix: 2 },
    difficulty: 1,
  },
  {
    id: 'v-imput-004',
    reference: '2 Timothée 2.22',
    text: 'Fuis les passions de la jeunesse, et recherche la justice, la foi, l\'amour, la paix, avec ceux qui invoquent le Seigneur d\'un cœur pur.',
    category: 'impudicite_addiction',
    tags: ['passions', 'jeunesse', 'justice', 'foi', 'amour', 'paix', 'cœur pur'],
    statImpact: { foi: 3, paix: 2, physique: 2 },
    difficulty: 1,
  },
  {
    id: 'v-imput-005',
    reference: '1 Corinthiens 10.13',
    text: 'Aucune tentation ne vous est survenue qui n\'ait été humaine, et Dieu, qui est fidèle, ne permettra pas que vous soyez tentés au-delà de vos forces; mais avec la tentation il préparera aussi le moyen d\'en sortir, afin que vous puissiez la supporter.',
    category: 'impudicite_addiction',
    tags: ['tentation', 'force', 'issue', 'fidèle', 'supporter'],
    statImpact: { foi: 3, paix: 2, physique: 1 },
    difficulty: 2,
  },
  {
    id: 'v-imput-006',
    reference: 'Colossiens 3.5',
    text: 'Faites donc mourir les membres qui sont sur la terre, l\'impudicité, l\'impureté, les passions, les mauvais désirs, et la cupidité, qui est une idolâtrie.',
    category: 'impudicite_addiction',
    tags: ['mortifier', 'impureté', 'passions', 'désirs', 'cupidité', 'idolâtrie'],
    statImpact: { foi: 3, physique: 2 },
    difficulty: 2,
  },
  {
    id: 'v-imput-007',
    reference: 'Éphésiens 5.18',
    text: 'Ne vous enivrez pas de vin, car c\'est de la débauche; mais soyez remplis de l\'Esprit.',
    category: 'impudicite_addiction',
    tags: ['ivresse', 'vin', 'débauche', 'esprit', 'plénitude'],
    statImpact: { foi: 3, physique: 2, paix: 1 },
    difficulty: 1,
  },
  {
    id: 'v-imput-008',
    reference: 'Proverbes 5.3-5',
    text: 'Car les lèvres de la femme étrangère distillent le miel, et son palais est plus doux que l\'huile; mais à la fin, elle est amère comme l\'absinthe, aiguë comme un glaive à deux tranchants. Ses pieds descendent vers la mort.',
    category: 'impudicite_addiction',
    tags: ['séduction', 'mort', 'amertume', 'tranchant', 'piège'],
    statImpact: { foi: 2, physique: 3, paix: -1 },
    difficulty: 3,
  },
  {
    id: 'v-imput-009',
    reference: 'Romains 8.13',
    text: 'Si vous vivez selon la chair, vous mourrez; mais si par l\'Esprit vous faites mourir les actions du corps, vous vivrez.',
    category: 'impudicite_addiction',
    tags: ['chair', 'esprit', 'mort', 'vie', 'actions', 'corps'],
    statImpact: { foi: 4, physique: 2 },
    difficulty: 2,
  },
  {
    id: 'v-imput-010',
    reference: 'Tite 2.11-12',
    text: 'Car la grâce de Dieu, source de salut pour tous les hommes, a été manifestée. Elle nous enseigne à renoncer à l\'impiété et aux convoitises du monde, et à vivre dans le siècle présent selon la sagesse, la justice et la piété.',
    category: 'impudicite_addiction',
    tags: ['grâce', 'renoncement', 'convoitises', 'impiété', 'sagesse', 'piété'],
    statImpact: { foi: 3, paix: 2 },
    difficulty: 2,
  },

  // ═══════════════════════════════════════════════
  // CATÉGORIE 3 — FINANCES & PARESSE
  // ═══════════════════════════════════════════════
  {
    id: 'v-fin-001',
    reference: 'Philippiens 4.19',
    text: 'Et mon Dieu pourvoira à tous vos besoins selon sa richesse, avec gloire, en Jésus-Christ.',
    category: 'finances_paresse',
    tags: ['besoins', 'richesse', 'gloire', 'pourvoira', 'providence'],
    statImpact: { foi: 2, finances: 5 },
    difficulty: 1,
  },
  {
    id: 'v-fin-002',
    reference: 'Proverbes 6.9-11',
    text: 'Jusques à quand, paresseux, seras-tu couché? Quand te lèveras-tu de ton sommeil? Un peu de sommeil, un peu d\'assoupissement, un peu croiser les mains pour dormir! Et la pauvreté te surprendra comme un rôdeur, et la disette comme un homme en armes.',
    category: 'finances_paresse',
    tags: ['paresse', 'sommeil', 'pauvreté', 'disette', 'diligence'],
    statImpact: { foi: -1, finances: -4, physique: -1 },
    difficulty: 1,
  },
  {
    id: 'v-fin-003',
    reference: 'Deutéronome 8.18',
    text: 'Souviens-toi de l\'Éternel, ton Dieu, car c\'est lui qui te donne la force d\'acquérir des richesses, afin de confirmer son alliance qu\'il a jurée à tes pères.',
    category: 'finances_paresse',
    tags: ['richesses', 'force', 'alliance', 'mémoire', 'dieu'],
    statImpact: { foi: 2, finances: 4 },
    difficulty: 1,
  },
  {
    id: 'v-fin-004',
    reference: 'Proverbes 10.4',
    text: 'Celui qui agit d\'une main lâche s\'appauvrit, mais la main des diligents enrichit.',
    category: 'finances_paresse',
    tags: ['diligence', 'pauvreté', 'richesse', 'main', 'lâche'],
    statImpact: { finances: 4, foi: 1 },
    difficulty: 1,
  },
  {
    id: 'v-fin-005',
    reference: 'Malachie 3.10',
    text: 'Apportez à la maison du trésor toutes les dîmes, afin qu\'il y ait de la nourriture dans ma maison; mettez-moi ainsi à l\'épreuve, dit l\'Éternel des armées. Et vous verrez si je n\'ouvre pas les écluses des cieux, si je ne répands pas sur vous la bénédiction en abondance.',
    category: 'finances_paresse',
    tags: ['dîme', 'offrande', 'bénédiction', 'épreuve', 'abondance', 'trésor'],
    statImpact: { foi: 3, finances: 4 },
    difficulty: 2,
  },
  {
    id: 'v-fin-006',
    reference: 'Proverbes 13.11',
    text: 'La richesse mal acquise diminue, mais celui qui amasse peu à peu l\'augmente.',
    category: 'finances_paresse',
    tags: ['richesse', 'acquise', 'amasse', 'patience', 'intégrité'],
    statImpact: { finances: 3, foi: 1 },
    difficulty: 2,
  },
  {
    id: 'v-fin-007',
    reference: '2 Corinthiens 9.6',
    text: 'Sachez-le, celui qui sème peu moissonnera peu, et celui qui sème abondamment moissonnera abondamment.',
    category: 'finances_paresse',
    tags: ['semence', 'moisson', 'abondance', 'générosité', 'récolte'],
    statImpact: { foi: 2, finances: 3 },
    difficulty: 1,
  },
  {
    id: 'v-fin-008',
    reference: 'Proverbes 22.7',
    text: 'Le riche domine sur les pauvres, et celui qui emprunte est l\'esclave de celui qui prête.',
    category: 'finances_paresse',
    tags: ['dette', 'esclavage', 'emprunt', 'domination', 'richesse'],
    statImpact: { finances: -3, foi: -1 },
    difficulty: 2,
  },
  {
    id: 'v-fin-009',
    reference: 'Ecclésiaste 5.18',
    text: 'Voici ce que j\'ai vu: c\'est pour l\'homme une chose bonne de manger, de boire, et de jouir du bien-être au milieu de tout le travail qu\'il fait sous le soleil, pendant le nombre des jours de vie que Dieu lui a donnés.',
    category: 'finances_paresse',
    tags: ['travail', 'jouissance', 'bien-être', 'vie', 'don'],
    statImpact: { paix: 2, finances: 2, physique: 1 },
    difficulty: 2,
  },
  {
    id: 'v-fin-010',
    reference: 'Proverbes 21.5',
    text: 'Les projets de l\'homme diligent ne mènent qu\'à l\'abondance, mais celui qui agit avec hâte n\'arrive qu\'à la disette.',
    category: 'finances_paresse',
    tags: ['diligence', 'projets', 'abondance', 'hâte', 'disette'],
    statImpact: { finances: 4, foi: 1 },
    difficulty: 1,
  },

  // ═══════════════════════════════════════════════
  // CATÉGORIE 4 — AMERTUME & REJET
  // ═══════════════════════════════════════════════
  {
    id: 'v-amer-001',
    reference: 'Éphésiens 4.31',
    text: 'Que toute amertume, toute animosité, toute colère, toute clameur, toute calomnie, et toute espèce de méchanceté, disparaissent du milieu de vous.',
    category: 'amertume_rejet',
    tags: ['amertume', 'colère', 'calomnie', 'méchanceté', 'animosité', 'pardon'],
    statImpact: { paix: 4, foi: 2 },
    difficulty: 1,
  },
  {
    id: 'v-amer-002',
    reference: 'Jérémie 31.3',
    text: 'De loin l\'Éternel se montre à moi: Je t\'aime d\'un amour éternel; C\'est pourquoi je te conserve ma bonté.',
    category: 'amertume_rejet',
    tags: ['amour', 'éternel', 'bonté', 'rejet', 'élu'],
    statImpact: { foi: 4, paix: 3 },
    difficulty: 1,
  },
  {
    id: 'v-amer-003',
    reference: 'Romains 8.1',
    text: 'Il n\'y a donc maintenant aucune condamnation pour ceux qui sont en Jésus-Christ.',
    category: 'amertume_rejet',
    tags: ['condamnation', 'culpabilité', 'jugement', 'christ', 'liberté'],
    statImpact: { foi: 4, paix: 3 },
    difficulty: 1,
  },
  {
    id: 'v-amer-004',
    reference: 'Matthieu 6.14-15',
    text: 'Si vous pardonnez aux hommes leurs offenses, votre Père céleste vous pardonnera aussi; mais si vous ne pardonnez pas aux hommes, votre Père ne vous pardonnera pas non plus vos offenses.',
    category: 'amertume_rejet',
    tags: ['pardon', 'offenses', 'père', 'réconciliation', 'condition'],
    statImpact: { foi: 3, paix: 3 },
    difficulty: 1,
  },
  {
    id: 'v-amer-005',
    reference: 'Psaume 27.10',
    text: 'Car mon père et ma mère m\'abandonnent, mais l\'Éternel me recueille.',
    category: 'amertume_rejet',
    tags: ['abandon', 'père', 'mère', 'recueil', 'rejet', 'solitude'],
    statImpact: { foi: 5, paix: 3 },
    difficulty: 1,
  },
  {
    id: 'v-amer-006',
    reference: 'Hébreux 12.15',
    text: 'Veillez à ce que nul ne se prive de la grâce de Dieu; à ce qu\'aucune racine d\'amertume, poussant des rejetons, ne produise du trouble, et que plusieurs n\'en soient infectés.',
    category: 'amertume_rejet',
    tags: ['racine', 'amertume', 'grâce', 'trouble', 'infection', 'veille'],
    statImpact: { paix: 3, foi: 2, physique: -1 },
    difficulty: 2,
  },
  {
    id: 'v-amer-007',
    reference: '1 Jean 4.18',
    text: 'Il n\'y a pas de crainte dans l\'amour, mais l\'amour parfait bannit la crainte; car la crainte implique un châtiment, et celui qui craint n\'est pas parfait dans l\'amour.',
    category: 'amertume_rejet',
    tags: ['crainte', 'amour', 'parfait', 'châtiment', 'bannir'],
    statImpact: { foi: 3, paix: 4 },
    difficulty: 2,
  },
  {
    id: 'v-amer-008',
    reference: 'Éphésiens 1.6',
    text: 'À la louange de la gloire de sa grâce qu\'il nous a accordée en son Bien-Aimé.',
    category: 'amertume_rejet',
    tags: ['louange', 'gloire', 'grâce', 'bien-aimé', 'acceptation'],
    statImpact: { foi: 3, paix: 2 },
    difficulty: 2,
  },
  {
    id: 'v-amer-009',
    reference: 'Colossiens 3.13',
    text: 'Supportez-vous les uns les autres, et pardonnez-vous réciproquement si l\'un a sujet de se plaindre de l\'autre. Comme le Seigneur vous a pardonné, pardonnez-vous aussi.',
    category: 'amertume_rejet',
    tags: ['pardon', 'support', 'plainte', 'réciprocité', 'seigneur'],
    statImpact: { foi: 2, paix: 3 },
    difficulty: 1,
  },
  {
    id: 'v-amer-010',
    reference: 'Sophonie 3.17',
    text: 'L\'Éternel, ton Dieu, est au milieu de toi, comme un héros qui sauve; Il fera de toi sa plus grande joie; Il gardera le silence dans son amour; Il aura pour toi des transports d\'allégresse.',
    category: 'amertume_rejet',
    tags: ['joie', 'allégresse', 'héros', 'salut', 'amour', 'présence'],
    statImpact: { foi: 4, paix: 3 },
    difficulty: 2,
  },

  // ═══════════════════════════════════════════════
  // CATÉGORIE EJP/ICC — COMBAT SPIRITUEL & CHAIR
  // ═══════════════════════════════════════════════
  {
    id: 'v-combat-001',
    reference: 'Éphésiens 6.12',
    text: 'Car nous n\'avons pas à lutter contre la chair et le sang, mais contre les dominations, contre les autorités, contre les princes de ce monde de ténèbres, contre les esprits méchants dans les lieux célestes.',
    category: 'combat_spirituel',
    tags: ['lutte', 'chair', 'sang', 'dominations', 'ténèbres', 'esprits', 'combat'],
    statImpact: { foi: 4, paix: 2, physique: 1 },
    difficulty: 2,
  },
  {
    id: 'v-combat-002',
    reference: '2 Corinthiens 10.4-5',
    text: 'Car les armes de notre combat ne sont pas charnelles, mais elles sont puissantes, par la vertu de Dieu, pour renverser des forteresses. Nous renversons les raisonnements et toute hauteur qui s\'élève contre la connaissance de Dieu.',
    category: 'combat_spirituel',
    tags: ['armes', 'forteresses', 'raisonnements', 'hauteur', 'connaissance', 'combat'],
    statImpact: { foi: 5, paix: 2 },
    difficulty: 2,
  },
  {
    id: 'v-combat-003',
    reference: 'Jacques 4.7',
    text: 'Soumettez-vous donc à Dieu; résistez au diable, et il fuira loin de vous.',
    category: 'combat_spirituel',
    tags: ['soumission', 'résistance', 'diable', 'fuite', 'autorité'],
    statImpact: { foi: 3, paix: 3 },
    difficulty: 1,
  },
  {
    id: 'v-combat-004',
    reference: '1 Jean 4.4',
    text: 'Vous, petits enfants, vous êtes de Dieu, et vous les avez vaincus, parce que celui qui est en vous est plus grand que celui qui est dans le monde.',
    category: 'combat_spirituel',
    tags: ['victoire', 'vaincus', 'plus grand', 'monde', 'enfants', 'dieu'],
    statImpact: { foi: 4, paix: 2 },
    difficulty: 1,
  },
  {
    id: 'v-combat-005',
    reference: 'Romains 8.37',
    text: 'Mais dans toutes ces choses nous sommes plus que vainqueurs par celui qui nous a aimés.',
    category: 'combat_spirituel',
    tags: ['vainqueurs', 'amour', 'victoire', 'triomphe', 'christ'],
    statImpact: { foi: 3, paix: 2, physique: 1 },
    difficulty: 1,
  },
  {
    id: 'v-combat-006',
    reference: 'Apocalypse 12.11',
    text: 'Ils l\'ont vaincu à cause du sang de l\'Agneau et à cause de la parole de leur témoignage, et ils n\'ont pas aimé leur vie jusqu\'à craindre la mort.',
    category: 'combat_spirituel',
    tags: ['vaincu', 'sang', 'agneau', 'témoignage', 'mort', 'victoire'],
    statImpact: { foi: 5, paix: 2, physique: 1 },
    difficulty: 3,
  },
  {
    id: 'v-combat-007',
    reference: 'Ésaïe 54.17',
    text: 'Toute arme fabriquée contre toi sera sans effet, et toute langue qui s\'élèvera en justice contre toi, tu la condamneras. Tel est l\'héritage des serviteurs de l\'Éternel.',
    category: 'combat_spirituel',
    tags: ['armes', 'langue', 'justice', 'héritage', 'serviteurs', 'protection'],
    statImpact: { foi: 4, paix: 3, finances: 1 },
    difficulty: 2,
  },
  {
    id: 'v-combat-008',
    reference: 'Galates 5.16',
    text: 'Marchez selon l\'Esprit, et vous n\'accomplirez pas les désirs de la chair.',
    category: 'combat_spirituel',
    tags: ['esprit', 'chair', 'désirs', 'marche', 'victoire'],
    statImpact: { foi: 3, physique: 2 },
    difficulty: 1,
  },

  // ═══════════════════════════════════════════════
  // CATÉGORIE EJP/ICC — IDENTITÉ & APPEL
  // ═══════════════════════════════════════════════
  {
    id: 'v-ident-001',
    reference: 'Jérémie 29.11',
    text: 'Car je connais les projets que j\'ai formés sur vous, dit l\'Éternel, projets de paix et non de malheur, afin de vous donner un avenir et de l\'espérance.',
    category: 'identite_appel',
    tags: ['projets', 'avenir', 'espérance', 'paix', 'destinée', 'plan'],
    statImpact: { foi: 4, paix: 3 },
    difficulty: 1,
  },
  {
    id: 'v-ident-002',
    reference: 'Éphésiens 2.10',
    text: 'Car nous sommes son ouvrage, ayant été créés en Jésus-Christ pour de bonnes œuvres que Dieu a préparées d\'avance, afin que nous les pratiquions.',
    category: 'identite_appel',
    tags: ['ouvrage', 'création', 'bonnes œuvres', 'préparées', 'destinée'],
    statImpact: { foi: 3, paix: 2, finances: 1 },
    difficulty: 1,
  },
  {
    id: 'v-ident-003',
    reference: 'Psaume 139.13-14',
    text: 'Car c\'est toi qui as formé mes reins, qui m\'as tissé dans le sein de ma mère. Je te loue de ce que je suis une créature si merveilleuse. Tes œuvres sont admirables, et mon âme le reconnaît bien.',
    category: 'identite_appel',
    tags: ['création', 'merveilleux', 'louange', 'identité', 'tissé', 'reins'],
    statImpact: { foi: 3, paix: 2 },
    difficulty: 1,
  },
  {
    id: 'v-ident-004',
    reference: '1 Pierre 2.9',
    text: 'Vous êtes une race élue, un sacerdoce royal, une nation sainte, un peuple acquis, afin que vous annonciez les vertus de celui qui vous a appelés des ténèbres à son admirable lumière.',
    category: 'identite_appel',
    tags: ['élu', 'sacerdoce', 'royal', 'saint', 'acquis', 'lumière', 'ténèbres'],
    statImpact: { foi: 4, paix: 2 },
    difficulty: 2,
  },
  {
    id: 'v-ident-005',
    reference: 'Proverbes 18.16',
    text: 'Les dons d\'un homme lui élargissent la voie, et lui donnent accès auprès des grands.',
    category: 'identite_appel',
    tags: ['dons', 'voie', 'accès', 'grands', 'faveur', 'destinée'],
    statImpact: { foi: 1, finances: 3, paix: 1 },
    difficulty: 2,
  },
  {
    id: 'v-ident-006',
    reference: 'Ésaïe 43.1',
    text: 'Ne crains rien, car je te rachète, je t\'appelle par ton nom: tu es à moi!',
    category: 'identite_appel',
    tags: ['rachat', 'nom', 'appartenance', 'crainte', 'appelé'],
    statImpact: { foi: 4, paix: 3 },
    difficulty: 1,
  },
  {
    id: 'v-ident-007',
    reference: 'Psaume 20.5',
    text: 'Que l\'Éternel accomplisse tous tes desseins!',
    category: 'identite_appel',
    tags: ['desseins', 'accomplissement', 'plan', 'volonté'],
    statImpact: { foi: 2, finances: 2, paix: 1 },
    difficulty: 1,
  },
  {
    id: 'v-ident-008',
    reference: 'Deutéronome 28.13',
    text: 'L\'Éternel fera de toi la tête et non la queue, tu seras toujours en haut et jamais en bas, si tu obéis aux commandements de l\'Éternel.',
    category: 'identite_appel',
    tags: ['tête', 'queue', 'haut', 'bas', 'domination', 'obéissance'],
    statImpact: { foi: 2, finances: 3, paix: 1 },
    difficulty: 2,
  },

  // ═══════════════════════════════════════════════
  // CATÉGORIE EJP/ICC — DOUTE & INCRÉDULITÉ
  // ═══════════════════════════════════════════════
  {
    id: 'v-doute-001',
    reference: 'Marc 11.24',
    text: 'C\'est pourquoi je vous dis: tout ce que vous demanderez en priant, croyez que vous l\'avez reçu, et vous le verrez s\'accomplir.',
    category: 'doute_incredulite',
    tags: ['prière', 'foi', 'croyance', 'réception', 'accomplissement'],
    statImpact: { foi: 4, paix: 2 },
    difficulty: 1,
  },
  {
    id: 'v-doute-002',
    reference: 'Hébreux 11.1',
    text: 'Or la foi est une ferme assurance des choses qu\'on espère, une démonstration de celles qu\'on ne voit pas.',
    category: 'doute_incredulite',
    tags: ['foi', 'assurance', 'espérance', 'démonstration', 'invisible'],
    statImpact: { foi: 4, paix: 2 },
    difficulty: 1,
  },
  {
    id: 'v-doute-003',
    reference: 'Jacques 1.6',
    text: 'Mais qu\'il demande avec foi, sans douter; car celui qui doute est semblable au flot de la mer, agité par le vent et poussé de côté et d\'autre.',
    category: 'doute_incredulite',
    tags: ['doute', 'foi', 'vague', 'vent', 'instabilité'],
    statImpact: { foi: -2, paix: -2 },
    difficulty: 1,
  },
  {
    id: 'v-doute-004',
    reference: 'Matthieu 17.20',
    text: 'Si vous aviez de la foi comme un grain de sénévé, vous diriez à cette montagne: Transporte-toi d\'ici là, et elle se transporterait; rien ne vous serait impossible.',
    category: 'doute_incredulite',
    tags: ['foi', 'grain', 'sénevé', 'montagne', 'impossible', 'miracle'],
    statImpact: { foi: 4, paix: 1, physique: 1 },
    difficulty: 2,
  },
  {
    id: 'v-doute-005',
    reference: 'Psaume 37.5',
    text: 'Recommande ton sort à l\'Éternel, mets en lui ta confiance, et il agira.',
    category: 'doute_incredulite',
    tags: ['confiance', 'recommandation', 'action', 'sort', 'seigneur'],
    statImpact: { foi: 3, paix: 2, finances: 1 },
    difficulty: 1,
  },
  {
    id: 'v-doute-006',
    reference: '2 Corinthiens 5.7',
    text: 'Car nous marchons par la foi et non par la vue.',
    category: 'doute_incredulite',
    tags: ['foi', 'marche', 'vue', 'confiance', 'invisible'],
    statImpact: { foi: 3, paix: 1 },
    difficulty: 1,
  },

  // ═══════════════════════════════════════════════
  // CATÉGORIE EJP/ICC — ORGUEIL & INDÉPENDANCE
  // ═══════════════════════════════════════════════
  {
    id: 'v-orgueil-001',
    reference: 'Proverbes 16.18',
    text: 'L\'orgueil précède la ruine, et la fierté spirituelle précède la chute.',
    category: 'orgueil_independance',
    tags: ['orgueil', 'ruine', 'chute', 'fierté', 'humilité'],
    statImpact: { foi: -2, paix: -2, finances: -1 },
    difficulty: 1,
  },
  {
    id: 'v-orgueil-002',
    reference: 'Jacques 4.6',
    text: 'Dieu résiste aux orgueilleux, mais il fait grâce aux humbles.',
    category: 'orgueil_independance',
    tags: ['orgueil', 'humilité', 'grâce', 'résistance', 'dieu'],
    statImpact: { foi: 3, paix: 2 },
    difficulty: 1,
  },
  {
    id: 'v-orgueil-003',
    reference: 'Philippiens 2.3',
    text: 'Ne faites rien par esprit de parti ou par vaine gloire, mais que l\'humilité vous fasse regarder les autres comme étant au-dessus de vous-mêmes.',
    category: 'orgueil_independance',
    tags: ['humilité', 'gloire', 'parti', 'autres', 'estime'],
    statImpact: { foi: 2, paix: 3 },
    difficulty: 2,
  },
  {
    id: 'v-orgueil-004',
    reference: 'Proverbes 11.2',
    text: 'Quand vient l\'orgueil, vient aussi l\'ignominie; mais la sagesse est avec les humbles.',
    category: 'orgueil_independance',
    tags: ['orgueil', 'ignominie', 'sagesse', 'humilité'],
    statImpact: { foi: 2, paix: 2, finances: -1 },
    difficulty: 2,
  },
  {
    id: 'v-orgueil-005',
    reference: 'Matthieu 23.12',
    text: 'Quiconque s\'élèvera sera abaissé, et quiconque s\'abaissera sera élevé.',
    category: 'orgueil_independance',
    tags: ['élévation', 'abaissement', 'humilité', 'orgueil', 'principe'],
    statImpact: { foi: 2, paix: 2 },
    difficulty: 1,
  },
  {
    id: 'v-orgueil-006',
    reference: '1 Pierre 5.5-6',
    text: 'De même, vous qui êtes jeunes, soumettez-vous aux anciens. Et tous, dans vos rapports mutuels, revêtez-vous d\'humilité; car Dieu résiste aux orgueilleux, mais il fait grâce aux humbles. Humiliez-vous donc sous la puissante main de Dieu, afin qu\'il vous élève au temps convenable.',
    category: 'orgueil_independance',
    tags: ['humilité', 'soumission', 'anciens', 'élévation', 'grâce', 'temps'],
    statImpact: { foi: 3, paix: 2, finances: 1 },
    difficulty: 2,
  },
];

/** Index par catégorie pour recherche rapide */
export const VERSES_BY_CATEGORY = VERSE_DATABASE.reduce<
  Record<string, VerseEntry[]>
>((acc, v) => {
  if (!acc[v.category]) acc[v.category] = [];
  acc[v.category].push(v);
  return acc;
}, {});

/** Récupère un verset par son ID */
export function getVerseById(id: string): VerseEntry | undefined {
  return VERSE_DATABASE.find((v) => v.id === id);
}

/** Récupère N versets d'une catégorie donnée */
export function getVersesByCategory(
  category: string,
  limit?: number
): VerseEntry[] {
  const verses = VERSES_BY_CATEGORY[category] || [];
  return limit ? verses.slice(0, limit) : verses;
}

/** Récupère toutes les catégories disponibles */
export function getAllCategories(): string[] {
  return Object.keys(VERSES_BY_CATEGORY);
}

/** Compte total de versets */
export const TOTAL_VERSES = VERSE_DATABASE.length;
