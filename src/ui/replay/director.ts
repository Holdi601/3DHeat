/**
 * The tactical display's director: which unit the camera watches and how,
 * chosen from the recording's events. A kill coming up gets a sweeping orbit
 * round it, a launch a chase behind the shooter, a hit a flyby; between
 * events the camera moves on to the busiest flying unit and changes the kind
 * of shot each time, so the replay keeps moving without anyone at the wheel.
 * Pure: the HUD drives the camera from the shot it returns.
 */

export type ShotKind = 'chase' | 'orbit' | 'flyby' | 'overview';
export type EventClass = 'kill' | 'launch' | 'hit' | 'other';

export interface DirectorEvent {
  time: number;
  person: number;
  kind: EventClass;
}

export interface DirectorUnit {
  person: number;
  air: boolean;
  /** Metres a second; NaN when unknown. */
  speed: number;
}

export interface Shot {
  person: number;
  kind: ShotKind;
  /** Dataset seconds the shot began. */
  start: number;
  /** When the director may cut away at the latest. */
  until: number;
  /** The event the shot is for, by its time; null between events. */
  event: number | null;
}

export interface DirectorOptions {
  /** Seconds a shot is held at least, so cuts never stutter. */
  minHold: number;
  /** Seconds a shot between events lasts. */
  idleHold: number;
  /** Seconds before an event the camera gets there. */
  lead: number;
  /** Seconds an event's shot lasts past the event. */
  after: number;
}

export const DIRECTOR_DEFAULTS: DirectorOptions = {
  minHold: 3,
  idleHold: 9,
  lead: 3,
  after: 4,
};

const RANK: Record<EventClass, number> = {
  kill: 3,
  launch: 2,
  hit: 1,
  other: 0,
};

/** An event kind as the director weighs it. */
export function classifyEvent(label: string): EventClass {
  const k = label.toLowerCase();
  if (/kill|destroy|shot ?down|crash|death|died|dead/.test(k)) return 'kill';
  if (/launch|fired|missile|bomb|rocket|torpedo|release/.test(k)) return 'launch';
  if (/hit|damage/.test(k)) return 'hit';
  return 'other';
}

/** The shot kind an event is filmed with. */
export function shotForEvent(kind: EventClass): ShotKind {
  return kind === 'kill' ? 'orbit' : kind === 'launch' ? 'chase' : 'flyby';
}

const IDLE_CYCLE: ShotKind[] = ['chase', 'flyby', 'orbit', 'overview'];

/** First index in `events` (time ascending) at or after `t`. */
function lowerBound(events: DirectorEvent[], t: number): number {
  let lo = 0;
  let hi = events.length;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (events[mid].time < t) lo = mid + 1;
    else hi = mid;
  }
  return lo;
}

/** The weightiest event near `now` (from a second ago to `lead` ahead) whose unit is alive, or null. */
export function eventInView(now: number, events: DirectorEvent[], alive: (p: number) => boolean, lead: number): DirectorEvent | null {
  let best: DirectorEvent | null = null;
  for (let i = lowerBound(events, now - 1); i < events.length && events[i].time <= now + lead; i++) {
    const e = events[i];
    if (e.kind === 'other' || !alive(e.person)) continue;
    if (!best || RANK[e.kind] > RANK[best.kind]) best = e;
  }
  return best;
}

/**
 * The shot for `now`: the current one while it must be held or still has
 * time, an event's when one is near, else the next unit and the next kind.
 */
export function nextShot(now: number, current: Shot | null, events: DirectorEvent[], units: DirectorUnit[], opt: DirectorOptions = DIRECTOR_DEFAULTS): Shot | null {
  const alive = new Set(units.map((u) => u.person));
  const live = current !== null && alive.has(current.person) && now >= current.start - 0.5;
  // Held: never cut within the minimum hold, unless the unit is gone or time ran backwards.
  if (live && now < current!.start + opt.minHold) return current;
  const ev = eventInView(now, events, (p) => alive.has(p), opt.lead);
  if (ev) {
    if (live && current!.event === ev.time && current!.person === ev.person) return current;
    // A weightier shot already running for another event holds until it ends.
    if (live && current!.event !== null && now < current!.until) return current;
    return {
      person: ev.person,
      kind: shotForEvent(ev.kind),
      start: now,
      until: Math.max(now + opt.minHold, ev.time + opt.after),
      event: ev.time,
    };
  }
  if (live && now < current!.until) return current;
  if (!units.length) return null;
  // Between events: the fastest flier that is not the one just watched, else anyone.
  const pool = units.filter((u) => u.air);
  const from = pool.length ? pool : units;
  const ranked = [...from].sort((a, b) => (Number.isFinite(b.speed) ? b.speed : -1) - (Number.isFinite(a.speed) ? a.speed : -1) || a.person - b.person);
  const pick = ranked.find((u) => u.person !== current?.person) ?? ranked[0];
  const k = current ? (IDLE_CYCLE.indexOf(current.kind) + 1) % IDLE_CYCLE.length : 0;
  return {
    person: pick.person,
    kind: IDLE_CYCLE[k],
    start: now,
    until: now + opt.idleHold,
    event: null,
  };
}

/** Whether going from one shot to the other is a cut the display marks. */
export function isCut(a: Shot | null, b: Shot | null): boolean {
  return !!b && (!a || a.person !== b.person || a.kind !== b.kind);
}
