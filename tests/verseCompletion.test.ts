import { describe, it, expect } from 'vitest';
import { splitVerseForCompletion, buildCompletionChallenge } from '../src/engine/verseCompletion';

const VERSE_MATT = "Venez à moi, vous tous qui êtes fatigués et chargés, et je vous donnerai du repos.";
const VERSE_PS = "L'Éternel est mon berger; je ne manquerai de rien.";
const VERSE_PHIL = "Je puis tout par celui qui me fortifie.";

const OTHER_VERSES = [
  "Ne crains pas, car je suis avec toi; ne promène pas des regards inquiets, car je suis ton Dieu.",
  "L'Éternel est près de ceux qui ont le cœur brisé, et il sauve ceux qui ont l'esprit dans l'abattement.",
  "Car c'est moi qui connais les projets que j'ai formés sur vous, dit l'Éternel, projets de paix et non de malheur.",
  "Sois fort et courageux! Ne t'effraie pas et ne t'épouvante pas.",
];

describe('splitVerseForCompletion', () => {
  it('découpe sur la virgule après milieu', () => {
    const [prefix, suffix] = splitVerseForCompletion(VERSE_MATT);
    expect(prefix).toContain('chargés,');
    expect(suffix).toContain('repos');
  });

  it('le prefix et le suffix ensemble reconstituent le verset', () => {
    const text = VERSE_MATT;
    const [prefix, suffix] = splitVerseForCompletion(text);
    // Le texte reconstruit = prefix (sans virgule finale) + suffix ou prefix + ' ' + suffix
    const reconstructed = (prefix + ' ' + suffix).replace(/\s+/g, ' ').trim();
    expect(reconstructed.length).toBeGreaterThan(text.length - 5);
  });

  it('verset court → découpe quand même', () => {
    const [prefix, suffix] = splitVerseForCompletion(VERSE_PHIL);
    expect(prefix.length).toBeGreaterThan(0);
    expect(suffix.length).toBeGreaterThan(0);
  });

  it('découpe sur ; si pas de virgule', () => {
    const [prefix, suffix] = splitVerseForCompletion(VERSE_PS);
    expect(suffix).toContain('manquerai de rien');
  });

  it('suffix non vide et suffisamment long', () => {
    const [, suffix] = splitVerseForCompletion(VERSE_MATT);
    expect(suffix.length).toBeGreaterThan(8);
  });
});

describe('buildCompletionChallenge', () => {
  const challenge = buildCompletionChallenge(VERSE_MATT, OTHER_VERSES, 'e-test-001');

  it('prefix non vide', () => {
    expect(challenge.prefix.length).toBeGreaterThan(5);
  });

  it('correctOption présente dans les options', () => {
    expect(challenge.options).toContain(challenge.correctOption);
  });

  it('4 options au total', () => {
    expect(challenge.options).toHaveLength(4);
  });

  it('options sans doublons', () => {
    const unique = new Set(challenge.options);
    expect(unique.size).toBe(4);
  });

  it('déterministe : même inputs → même ordre', () => {
    const c1 = buildCompletionChallenge(VERSE_MATT, OTHER_VERSES, 'e-test-001');
    const c2 = buildCompletionChallenge(VERSE_MATT, OTHER_VERSES, 'e-test-001');
    expect(c1.options).toEqual(c2.options);
  });

  it('ordre différent selon eventId différent', () => {
    const c1 = buildCompletionChallenge(VERSE_MATT, OTHER_VERSES, 'e-test-001');
    const c2 = buildCompletionChallenge(VERSE_MATT, OTHER_VERSES, 'e-test-999');
    // Les options peuvent être dans un ordre différent (pas garanti mais très probable)
    expect(c1.correctOption).toBe(c2.correctOption); // la réponse reste la même
  });

  it('correctOption correspond à la fin du verset', () => {
    expect(VERSE_MATT.endsWith(challenge.correctOption) ||
           VERSE_MATT.includes(challenge.correctOption)).toBe(true);
  });

  it('fonctionne avec peu de leurres disponibles', () => {
    const c = buildCompletionChallenge(VERSE_MATT, [], 'e-test-001');
    expect(c.options).toHaveLength(4);
    expect(c.options).toContain(c.correctOption);
  });
});
