/**
 * @file reveals.ts
 * @description « Révélations » de capacités — l'univers s'étend textuellement avec l'âge.
 *
 * Inspiré de A Dark Room : le monde se dévoile au fil du jeu. Dans Élias, des mécaniques
 * s'activent à des âges précis (agir soi-même, saisons, mémorisation accrue, sagesse du
 * grand âge) mais le joueur ne l'apprenait jamais — la croissance n'était pas RESSENTIE.
 *
 * Table DÉCLARATIVE (âge → annonce). `advanceAge` y lit les paliers franchis et pousse
 * une entrée de journal « milestone » (réutilise l'UI existante, aucune UI nouvelle).
 * Modulaire & réversible : retirer ce module + son appel dans advanceAge, et les paliers
 * passent simplement sans annonce (rien ne casse).
 *
 * ⚠️ Les âges DOIVENT rester alignés sur les mécaniques réelles :
 *   - 8  : ActionPanel (App.tsx `age >= 8`)
 *   - 10 : saisons émergentes (gameEngine `newAge >= 10`)
 *   - 16 : texte de verset partiel (VerseChoices `age <= 15 ? 1 : 2`)
 *   - 51 : référence seule (VerseChoices `age <= 50 ? 2 : 3`)
 *   - 60 : palier senior (balance.json actionPoints.seniorMinAge)
 */

export interface Reveal {
  age: number;
  text: string;
}

export const CAPABILITY_REVEALS: Reveal[] = [
  {
    age: 8,
    text: "[ÉVEIL] Élias grandit : il peut désormais agir de lui-même — prier, jeûner, servir, lire la Parole. Chaque geste posé nourrit l'âme avant l'épreuve.",
  },
  {
    age: 10,
    text: "[SAISONS] La vie de foi a ses saisons — réveil, désert, grâce. Elles vont et viennent sans qu'on les choisisse ; apprends à traverser chacune.",
  },
  {
    age: 16,
    text: "[MÉMOIRE] Élias n'est plus un enfant : on ne lui souffle plus tout le verset. Il faut maintenant s'en souvenir davantage par le cœur.",
  },
  {
    age: 51,
    text: "[MAÎTRISE] Les années ont creusé leur sillon. Les versets ne s'affichent plus en clair — c'est du cœur qu'ils doivent monter, au bon moment.",
  },
  {
    age: 60,
    text: "[TRANSMETTRE] Vient l'âge de la sagesse. Le temps n'est plus de conquérir mais de transmettre — et de tenir, fidèle, jusqu'au bout de la course.",
  },
];

/** Révélations dont le palier est franchi exactement à cet âge (0, 1 ou plusieurs). */
export function revealsAtAge(age: number): Reveal[] {
  return CAPABILITY_REVEALS.filter((r) => r.age === age);
}
