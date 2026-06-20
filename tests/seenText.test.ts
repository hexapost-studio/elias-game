/**
 * @file seenText.test.ts
 * @description Smart skip « texte déjà-lu » (itér. 11) — empreinte stable des beats et
 * mémoire isSeen/markSeen. Garantit : zéro régression (texte neuf reste neuf), reconnaissance
 * d'un beat d'une partie à l'autre, robustesse aux espaces et au vide.
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { textKey, isSeen, markSeen, clearSeen } from '../src/settings/seenText';

beforeEach(() => {
  clearSeen();
});

describe('textKey', () => {
  it('produit la même empreinte pour un même contenu', () => {
    expect(textKey('À 7 ans, Élias trébuche.')).toBe(textKey('À 7 ans, Élias trébuche.'));
  });

  it('ignore les espaces parasites (normalisation)', () => {
    expect(textKey('  Un   beat   narratif  ')).toBe(textKey('Un beat narratif'));
  });

  it('distingue deux contenus différents', () => {
    expect(textKey('Premier beat')).not.toBe(textKey('Second beat'));
  });

  it('renvoie une chaîne vide pour un texte vide ou blanc', () => {
    expect(textKey('')).toBe('');
    expect(textKey('   ')).toBe('');
  });
});

describe('isSeen / markSeen', () => {
  it('un beat est inconnu tant qu’il n’est pas marqué', () => {
    const k = textKey('Une scène jamais lue');
    expect(isSeen(k)).toBe(false);
    markSeen(k);
    expect(isSeen(k)).toBe(true);
  });

  it('reconnaît un beat ré-encodé depuis le même texte (rejouabilité)', () => {
    markSeen(textKey('À 12 ans, le doute frappe.'));
    // Une autre partie recalcule la clé depuis le même contenu → déjà-lu.
    expect(isSeen(textKey('À 12 ans, le doute frappe.'))).toBe(true);
  });

  it('markSeen est idempotent et no-op sur le vide', () => {
    const k = textKey('Beat répété');
    markSeen(k);
    markSeen(k);
    expect(isSeen(k)).toBe(true);
    // Le vide n’est jamais mémorisé ni « déjà-lu ».
    markSeen('');
    expect(isSeen('')).toBe(false);
  });

  it('clearSeen oublie tout (texte redevient neuf)', () => {
    const k = textKey('À effacer');
    markSeen(k);
    expect(isSeen(k)).toBe(true);
    clearSeen();
    expect(isSeen(k)).toBe(false);
  });
});
