import { useEffect, useRef } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import { isAiEnabled, generateDynamicEvent } from '../services/aiNarrator';
import { pickDecoys } from '../data/events';
import type { AfflictionEvent } from '../types/game';

type GenArgs = Parameters<typeof generateDynamicEvent>;

interface AiEventPrefetchArgs {
  phase: string;
  age: number;
  stats: GenArgs[1];
  lifeContext: GenArgs[2];
  parentNames: GenArgs[3];
  playerName: string;
  pendingAiEvent: AfflictionEvent | null;
  setPendingAiEvent: Dispatch<SetStateAction<AfflictionEvent | null>>;
}

/**
 * useAiEventPrefetch — pré-génération en arrière-plan d'un événement narratif IA (bonus), extraite
 * d'App.tsx (G-4 / itér.97). Comportement IDENTIQUE. No-op si aucun backend IA n'est branché
 * (`isAiEnabled()` faux) ; sinon, 1 chance sur 3 par passage en phase idle. La ref de garde
 * `generatingAiEvent` (anti-concurrence) vit ici avec l'effet.
 */
export function useAiEventPrefetch({
  phase, age, stats, lifeContext, parentNames, playerName, pendingAiEvent, setPendingAiEvent,
}: AiEventPrefetchArgs): void {
  const generatingAiEvent = useRef(false);

  useEffect(() => {
    if (!isAiEnabled() || phase !== 'idle' || generatingAiEvent.current || pendingAiEvent) return;
    // 1 chance sur 3 de générer un événement IA pour la prochaine fois
    if (Math.random() > 0.33) return;

    generatingAiEvent.current = true;
    generateDynamicEvent(age, stats, lifeContext, parentNames, playerName)
      .then((narrative) => {
        if (!narrative) { generatingAiEvent.current = false; return; }
        const event: AfflictionEvent = {
          id:              `ai-${Date.now()}`,
          title:           narrative.title,
          description:     narrative.description,
          ageRange:        [age, age + 2],
          category:        narrative.category,
          correctVerseId:  narrative.verseId,
          decoyVerseIds:   pickDecoys(narrative.verseId, narrative.category),
          statImpactOnFail: { foi: -3, paix: -3, physique: -1, finances: -1 },
          thematicFlavor:  narrative.thematicFlavor,
        };
        setPendingAiEvent(event);
        generatingAiEvent.current = false;
      })
      .catch(() => { generatingAiEvent.current = false; });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);
}
