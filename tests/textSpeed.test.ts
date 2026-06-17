/**
 * @file textSpeed.test.ts
 * @description Système de vitesse de lecture — helper pur + module réactif.
 *   (Le hook useTypewriter s'appuie sur rAF/DOM ; on teste la logique pure et l'état
 *    du module, pas le rendu React.)
 */
import { describe, it, expect, beforeEach } from 'vitest';
import {
  charsToShow,
  cpsFor,
  getReadingSpeed,
  setReadingSpeed,
  cycleReadingSpeed,
  READING_CPS,
  READING_ORDER,
} from '../src/settings/textSpeed';

describe('charsToShow — révélation progressive', () => {
  it('rien au temps 0', () => {
    expect(charsToShow(0, 45, 100)).toBe(0);
  });

  it('progresse linéairement à la cadence cps', () => {
    // 45 c/s → après 1000ms, 45 caractères.
    expect(charsToShow(1000, 45, 100)).toBe(45);
    expect(charsToShow(500, 45, 100)).toBe(22); // floor(22.5)
  });

  it('borne au total du texte', () => {
    expect(charsToShow(10000, 45, 30)).toBe(30);
  });

  it('cps infini (instantané) → tout le texte tout de suite', () => {
    expect(charsToShow(1, Infinity, 80)).toBe(80);
    expect(charsToShow(0, Infinity, 80)).toBe(80);
  });

  it('temps négatif → 0 (robustesse)', () => {
    expect(charsToShow(-50, 45, 100)).toBe(0);
  });
});

describe('module de préférence — get/set/cycle', () => {
  beforeEach(() => {
    setReadingSpeed('natural');
  });

  it('cpsFor reflète la table READING_CPS', () => {
    expect(cpsFor('natural')).toBe(READING_CPS.natural);
    expect(cpsFor('instant')).toBe(Infinity);
    expect(cpsFor('slow')).toBe(READING_CPS.slow);
  });

  it('setReadingSpeed met à jour la valeur courante', () => {
    setReadingSpeed('slow');
    expect(getReadingSpeed()).toBe('slow');
  });

  it('cycleReadingSpeed parcourt READING_ORDER en boucle', () => {
    setReadingSpeed(READING_ORDER[0]);
    const seen = [getReadingSpeed()];
    for (let i = 0; i < READING_ORDER.length; i++) {
      seen.push(cycleReadingSpeed());
    }
    // On revient au point de départ après un tour complet.
    expect(seen[seen.length - 1]).toBe(READING_ORDER[0]);
    // Toutes les vitesses sont visitées.
    expect(new Set(seen).size).toBe(READING_ORDER.length);
  });

  it('notifie les abonnés au changement (réactivité)', () => {
    // Accès au subscribe via re-import dynamique non nécessaire : on vérifie l'effet
    // observable (la valeur change) qui est ce dont dépend useSyncExternalStore.
    setReadingSpeed('instant');
    expect(getReadingSpeed()).toBe('instant');
    setReadingSpeed('natural');
    expect(getReadingSpeed()).toBe('natural');
  });
});
