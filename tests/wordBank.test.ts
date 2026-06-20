import { describe, it, expect } from 'vitest';
import { buildWordBankChallenge } from '../src/engine/wordBank';

const TEXT = 'Car ce n\'est pas un esprit de timidité que Dieu nous a donné, mais un esprit de force.';
const WORD = 'timidité';
const DECOYS = ['peur', 'faiblesse', 'doute'];
const EVENT_ID = 'e-test-001';

describe('buildWordBankChallenge — texte masqué', () => {
  it('remplace le mot par ____', () => {
    const { displayText } = buildWordBankChallenge(TEXT, WORD, DECOYS, EVENT_ID);
    expect(displayText).toContain('____');
    expect(displayText).not.toContain(WORD);
  });

  it('conserve le reste du texte intact', () => {
    const { displayText } = buildWordBankChallenge(TEXT, WORD, DECOYS, EVENT_ID);
    expect(displayText).toContain('esprit de force');
    expect(displayText).toContain('Dieu nous a donné');
  });

  it('remplacement insensible à la casse', () => {
    const text = 'La Timidité est un piège.';
    const { displayText } = buildWordBankChallenge(text, 'timidité', DECOYS, EVENT_ID);
    expect(displayText).toBe('La ____ est un piège.');
  });

  it('remplace uniquement la première occurrence', () => {
    const text = 'amour amour amour';
    const { displayText } = buildWordBankChallenge(text, 'amour', [], EVENT_ID);
    expect(displayText).toBe('____ amour amour');
  });

  it('mot absent du texte → displayText inchangé', () => {
    const { displayText } = buildWordBankChallenge('Bonjour monde.', 'absent', DECOYS, EVENT_ID);
    expect(displayText).toBe('Bonjour monde.');
  });
});

describe('buildWordBankChallenge — chips', () => {
  it('chips contient exactement le mot correct + leurres', () => {
    const { chips } = buildWordBankChallenge(TEXT, WORD, DECOYS, EVENT_ID);
    expect([...chips].sort()).toEqual([WORD, ...DECOYS].sort());
    expect(chips).toHaveLength(DECOYS.length + 1);
  });

  it('correctChip est le mot masqué', () => {
    const { correctChip } = buildWordBankChallenge(TEXT, WORD, DECOYS, EVENT_ID);
    expect(correctChip).toBe(WORD);
  });

  it('même eventId → même ordre de chips (déterminisme)', () => {
    const a = buildWordBankChallenge(TEXT, WORD, DECOYS, EVENT_ID);
    const b = buildWordBankChallenge(TEXT, WORD, DECOYS, EVENT_ID);
    expect(a.chips).toEqual(b.chips);
  });

  it('eventIds différents → ordres (en général) différents', () => {
    const a = buildWordBankChallenge(TEXT, WORD, DECOYS, 'evt-AAA');
    const b = buildWordBankChallenge(TEXT, WORD, DECOYS, 'evt-ZZZ');
    // Avec 4 éléments, la probabilité d'égalité aléatoire est 1/24 — très improbable
    expect(a.chips).not.toEqual(b.chips);
  });

  it('sans leurres → chips contient seulement le mot correct', () => {
    const { chips } = buildWordBankChallenge(TEXT, WORD, [], EVENT_ID);
    expect(chips).toEqual([WORD]);
  });

  it('ne mute pas le tableau de leurres en entrée', () => {
    const decoys = ['a', 'b', 'c'];
    buildWordBankChallenge(TEXT, WORD, decoys, EVENT_ID);
    expect(decoys).toEqual(['a', 'b', 'c']);
  });
});

describe('buildWordBankChallenge — cas réels de versets', () => {
  it('verset de Matt 11.28 — repos masqué', () => {
    const text = 'Venez à moi, vous tous qui êtes fatigués et chargés, et je vous donnerai du repos.';
    const { displayText, correctChip } = buildWordBankChallenge(text, 'repos', ['paix', 'salut', 'joie'], 'e-lourd-001');
    expect(displayText).toContain('____');
    expect(correctChip).toBe('repos');
    expect(displayText).toContain('fatigués');
  });

  it('verset Rom 8.1 — condamnation masquée', () => {
    const text = 'Il n\'y a donc maintenant aucune condamnation pour ceux qui sont en Jésus-Christ.';
    const { displayText } = buildWordBankChallenge(text, 'condamnation', ['punition', 'jugement', 'péché'], 'e-culpa-004');
    expect(displayText).toBe('Il n\'y a donc maintenant aucune ____ pour ceux qui sont en Jésus-Christ.');
  });
});
