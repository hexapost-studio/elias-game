/**
 * @file identity.ts
 * @description Identité du personnage (itér. 9 — proposition D du dossier Partie 2).
 *
 * Le nom était codé en dur « Élias » et toute l'identité (ville/parents/profession) tirée
 * au hasard : racine du retour joueur « ça ne nous ressemble pas ». Ce module PUR normalise
 * un nom saisi (défaut « Élias » → AUCUNE régression sans saisie) et personnalise un texte
 * narratif en y substituant le nom du joueur.
 *
 * Pur, sans état, sans IA, sans RNG. Réversible (revenir à « Élias » en dur).
 */

/** Nom par défaut — conservé si le joueur ne saisit rien (compat saves + zéro régression). */
export const DEFAULT_NAME = 'Élias';

/** Longueur max d'un nom affiché (UI + journal restent lisibles). */
export const MAX_NAME_LEN = 18;

/**
 * Normalise un nom saisi : espaces compressés, trim, longueur bornée.
 * Vide / nul → nom par défaut. Garantit une chaîne sûre pour l'état et l'affichage.
 */
export function resolvePlayerName(raw?: string | null): string {
  const t = (raw ?? '').replace(/\s+/g, ' ').trim();
  if (!t) return DEFAULT_NAME;
  return t.length > MAX_NAME_LEN ? t.slice(0, MAX_NAME_LEN).trim() : t;
}

/**
 * Substitue le nom du joueur au nom par défaut dans un texte narratif déjà écrit.
 * Gère l'élision française (« d'Élias » → « de Marie ») avant le remplacement simple.
 * Si le nom est le défaut, renvoie le texte inchangé (no-op → zéro coût/risque).
 */
export function personalize(text: string, name: string): string {
  if (name === DEFAULT_NAME) return text;
  return text
    .replaceAll(`d'${DEFAULT_NAME}`, `de ${name}`)
    .replaceAll(DEFAULT_NAME, name);
}
