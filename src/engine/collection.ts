/**
 * @file collection.ts
 * @description Récompense de collection — célébrer chaque verset qui REJOINT le Grimoire.
 *
 * L'onboarding promet « chaque verset utilisé avec succès rejoint votre Grimoire », mais rien
 * dans le jeu ne le signalait : toute victoire produisait le même `[VICTOIRE]`. Ce module fournit
 * le texte de récompense au moment où un verset est débloqué pour la 1ʳᵉ fois — du tout premier
 * (récompense précoce) au Grimoire complet. Pur & testable ; réutilise l'UI journal `milestone`
 * (aucune UI nouvelle). Réversible : retirer l'appel dans `validateChoice` et les versets se
 * collectionnent silencieusement comme avant.
 */
import type { CodexEntry } from '../types/game';

/** Nombre de versets actuellement débloqués dans le Codex. */
export function countUnlocked(codex: Record<string, CodexEntry>): number {
  let n = 0;
  for (const id in codex) {
    if (codex[id]?.unlocked) n++;
  }
  return n;
}

/**
 * Texte de récompense quand un verset rejoint le Grimoire (1ʳᵉ fois).
 * `count` = total débloqué APRÈS celui-ci ; `total` = corpus complet.
 * Tiers : complet (= total), ouverture (1er), paliers (10/25/50), sinon entrée standard.
 */
export function collectionRewardText(reference: string, count: number, total: number): string {
  if (count >= total) {
    return `[GRIMOIRE] ✦ Grimoire COMPLET — les ${total} versets sont à toi. « ${reference} » referme le livre.`;
  }
  if (count === 1) {
    return `[GRIMOIRE] ✦ Ton Grimoire s'ouvre : « ${reference} » en est le tout premier verset.`;
  }
  if (count === 10 || count === 25 || count === 50) {
    return `[GRIMOIRE] ✦ ${count} versets rassemblés. « ${reference} » rejoint ton Grimoire.`;
  }
  return `[GRIMOIRE] « ${reference} » rejoint ton Grimoire (${count}/${total}).`;
}
