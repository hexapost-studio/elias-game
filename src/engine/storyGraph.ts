/**
 * Validation de cohérence du graphe narratif (B — conséquences ramifiées).
 *
 * Module PUR : aucune dépendance React, aucun RNG, aucune lecture de l'état de jeu.
 * Il prend explicitement `arcs` + `events` en paramètres (donc testable hors données réelles)
 * et vérifie que le contenu ramifié tient debout AVANT qu'un joueur n'y tombe :
 *
 *  (a) atteignabilité  — chaque event d'arc (spine + variantes hors-spine) est atteignable
 *      depuis l'entrée de l'arc, en explorant l'UNION des assignations de flags (DFS) ;
 *  (b) pas d'orphelin  — tout event de séquence N>1 a au moins une étape à la séquence N-1
 *      (les séquences d'un arc sont contiguës à partir de 1) ;
 *  (c) cohérence des flags — tout flag requis « à vrai » par un prérequis est effectivement
 *      posé par un event pouvant survenir AVANT (sinon contenu mort derrière un flag jamais posé).
 *
 * Le parcours est un DFS ITÉRATIF (pile LIFO explicite, jamais récursif) — honore la
 * contrainte du design §5.2 et évite tout « Maximum call stack » sur de longs arcs.
 */
import type { StoryArc, AfflictionEvent } from '../types/game';

export interface StoryGraphReport {
  ok: boolean;
  errors: string[];
}

/** Référence d'un event qui POSE un flag, avec sa position d'arc (pour l'ordonnancement). */
interface FlagSetter {
  eventId: string;
  arcId?: string;
  seq?: number;
}

export function validateStoryGraph(
  arcs: StoryArc[],
  events: AfflictionEvent[]
): StoryGraphReport {
  const errors: string[] = [];

  const eventsById = new Map<string, AfflictionEvent>();
  for (const e of events) eventsById.set(e.id, e);

  // events groupés par arc (spine ET variantes hors-spine partagent storyArcId)
  const eventsByArc = new Map<string, AfflictionEvent[]>();
  for (const e of events) {
    if (!e.storyArcId) continue;
    const list = eventsByArc.get(e.storyArcId);
    if (list) list.push(e);
    else eventsByArc.set(e.storyArcId, [e]);
  }

  // Index global des poseurs de flags (succès ou échec) — pour la cohérence (c).
  const settersByFlag = new Map<string, FlagSetter[]>();
  const addSetter = (flagId: string, e: AfflictionEvent) => {
    const ref: FlagSetter = { eventId: e.id, arcId: e.storyArcId, seq: e.arcSequence };
    const list = settersByFlag.get(flagId);
    if (list) list.push(ref);
    else settersByFlag.set(flagId, [ref]);
  };
  for (const e of events) {
    for (const f of e.setsFlagsOnSuccess ?? []) addSetter(f, e);
    for (const f of e.setsFlagsOnFail ?? []) addSetter(f, e);
  }

  for (const arc of arcs) {
    const arcEvents = eventsByArc.get(arc.id) ?? [];
    const length = arc.eventIds.length;

    // — Spine bien formée : chaque eventIds[i] existe et est à la séquence i+1.
    arc.eventIds.forEach((id, i) => {
      const ev = eventsById.get(id);
      if (!ev) {
        errors.push(`[${arc.id}] event de spine introuvable: ${id}`);
        return;
      }
      if (ev.arcSequence !== i + 1) {
        errors.push(
          `[${arc.id}] ${id} attendu en séquence ${i + 1}, trouvé ${ev.arcSequence ?? 'aucune'}`
        );
      }
    });

    // — Bornes de séquence + regroupement par séquence.
    const bySeq = new Map<number, AfflictionEvent[]>();
    for (const e of arcEvents) {
      const s = e.arcSequence;
      if (s == null) {
        errors.push(`[${arc.id}] ${e.id} taggé à l'arc mais sans arcSequence`);
        continue;
      }
      if (s < 1 || s > length) {
        errors.push(`[${arc.id}] ${e.id} en séquence ${s} hors bornes [1, ${length}]`);
      }
      const list = bySeq.get(s);
      if (list) list.push(e);
      else bySeq.set(s, [e]);
    }

    // (b) Pas d'orphelin : toute séquence N>1 présente doit avoir une séquence N-1 présente.
    for (const seq of bySeq.keys()) {
      if (seq > 1 && !bySeq.has(seq - 1)) {
        const orphans = bySeq.get(seq)!.map((e) => e.id).join(', ');
        errors.push(`[${arc.id}] séquence ${seq} orpheline (aucune étape ${seq - 1}): ${orphans}`);
      }
    }

    // (a) Atteignabilité : DFS itératif depuis les events de séquence 1, arêtes seq N → seq N+1.
    const visited = new Set<string>();
    const stack: AfflictionEvent[] = [...(bySeq.get(1) ?? [])];
    while (stack.length > 0) {
      const node = stack.pop()!;
      if (visited.has(node.id)) continue;
      visited.add(node.id);
      const next = bySeq.get((node.arcSequence ?? 0) + 1) ?? [];
      for (const n of next) {
        if (!visited.has(n.id)) stack.push(n);
      }
    }
    for (const e of arcEvents) {
      if (e.arcSequence != null && !visited.has(e.id)) {
        errors.push(`[${arc.id}] ${e.id} inatteignable depuis l'entrée de l'arc`);
      }
    }
  }

  // (c) Cohérence des flags : un prérequis « flag à vrai » exige un poseur pouvant survenir avant.
  // Un prérequis « flag à faux » est satisfait par l'absence par défaut → aucun poseur requis.
  for (const e of events) {
    for (const req of e.prerequisites ?? []) {
      if (req.kind !== 'flag') continue;
      if ((req.value ?? true) === false) continue; // absence = défaut, jamais du contenu mort
      const setters = settersByFlag.get(req.flagId);
      if (!setters || setters.length === 0) {
        errors.push(
          `flag "${req.flagId}" requis par ${e.id} mais jamais posé (contenu mort)`
        );
        continue;
      }
      // Au moins un poseur doit pouvoir précéder le requérant :
      // même arc avec séquence antérieure, OU poseur d'un autre arc / sans séquence (non ordonnable).
      const reachableInTime = setters.some((s) => {
        if (s.arcId !== e.storyArcId) return true;
        if (s.seq == null || e.arcSequence == null) return true;
        return s.seq < e.arcSequence;
      });
      if (!reachableInTime) {
        errors.push(
          `flag "${req.flagId}" posé trop tard pour ${e.id} (aucun poseur antérieur dans l'arc)`
        );
      }
    }
  }

  return { ok: errors.length === 0, errors };
}
