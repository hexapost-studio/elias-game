import { useEffect, useRef } from 'react';
import {
  setAmbientPlaybackRate, startAmbient, crossfadeTo, seasonTrackPath, albumTrack,
} from '../engine/juice';

interface AmbientMusicArgs {
  ambientOn: boolean;
  musicAlbum: string;
  spiritualSeason: Parameters<typeof seasonTrackPath>[0];
  stats: { foi: number; paix: number; physique: number; finances: number };
}

/**
 * useAmbientMusic — pilotage de la musique d'ambiance, extrait d'App.tsx (G-4 / itér.96).
 * Comportement IDENTIQUE. Les SETTERS d'état (`setAmbientOn`, `setMusicAlbum`) restent dans App
 * (toggles MainMenu, déverrouillage autoplay) ; ce hook ne consomme que les VALEURS et applique
 * les effets audio impératifs.
 *
 *  - ralenti dynamique : la piste ralentit quand une jauge est critique.
 *  - sélection unifiée : album choisi (fixe/auto/shuffle) + saison de vie, dédupliquée par une
 *    "signature" (`lastMusicSig`) pour ne pas relancer la piste si l'input n'a pas vraiment changé.
 */
export function useAmbientMusic({ ambientOn, musicAlbum, spiritualSeason, stats }: AmbientMusicArgs): void {
  const lastMusicSig = useRef('');

  // Dynamic music: slow the track slightly when any stat is critically low
  useEffect(() => {
    if (!ambientOn) return;
    const min = Math.min(stats.foi, stats.paix, stats.physique, stats.finances);
    setAmbientPlaybackRate(min <= 20 ? 0.92 : min <= 35 ? 0.96 : 1.0);
  }, [stats, ambientOn]);

  // Sélection musicale unifiée : album choisi + saison de vie.
  //  - 'auto'    → suit la saison (piste réelle, en boucle jusqu'au prochain virage)
  //  - 'shuffle' → toutes les pistes au hasard (autoAdvance)
  //  - album fixe → une piste en boucle
  // Une "signature" évite de relancer la piste quand l'input n'a pas vraiment changé
  // (ex. la saison bascule mais on est en album fixe → on ne coupe rien).
  useEffect(() => {
    if (!ambientOn) { lastMusicSig.current = ''; return; }

    let sig: string;
    let action: () => void;
    if (musicAlbum === 'shuffle') {
      sig = 'shuffle';
      action = () => startAmbient();
    } else if (musicAlbum === 'auto') {
      const path = seasonTrackPath(spiritualSeason);
      sig = 'auto:' + (path ?? 'none');
      action = path ? () => crossfadeTo(path, true) : () => startAmbient();
    } else {
      sig = 'album:' + musicAlbum;
      const path = albumTrack(musicAlbum);
      action = () => crossfadeTo(path, true);
    }

    if (sig === lastMusicSig.current) return;
    lastMusicSig.current = sig;
    action();
  }, [ambientOn, musicAlbum, spiritualSeason]);
}
