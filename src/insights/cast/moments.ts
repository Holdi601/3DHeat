/**
 * The caster's moments in one replay: what a commentator would stop on -
 * first blood, multi-kills, trades, a last player alive against several, an
 * objective changing hands, a comeback, the player who stands out (or
 * struggles) against others in the same kind of vehicle, a kill from far away.
 *
 * Pure: kills and captures in, moments out, in persons, teams and seconds of
 * the dataset's own clock (`source.ts` reads them from the loaded match). Each
 * moment has the instant of its action, the window to play round it, the
 * player to follow and a weight for how much it matters; its words are said
 * by the viewer (`insights.cast.say.<kind>`) or, on request, by an external
 * model.
 */

import type { FilterSpec } from '../../state/types';

export interface CastKill {
  time: number;
  /** Person indices; -1 when the data does not say. */
  killer: number;
  victim: number;
  killerTeam: number;
  victimTeam: number;
  /** Vehicle class of each side (`Vehicle class` / `Target class`); '' when unknown. */
  killerClass: string;
  victimClass: string;
  /** Where it happened (the victim, else the killer). */
  x: number;
  y: number;
  z: number;
  /** Metres between killer and victim; null without both places. */
  distance: number | null;
  /** The round (segment) it falls in, an index into `CastInput.rounds`. */
  round: number;
}

export interface CastCapture {
  time: number;
  round: number;
  person: number;
  team: number;
  x: number;
  y: number;
  z: number;
}

export interface CastRound {
  start: number;
  end: number;
  /** Players in the round, by team index. */
  roster: Map<number, Set<number>>;
  /** The dataset session it is, where the match's rounds are sessions. */
  session?: number;
  /** The filter that shows only this round (a round column's value), where the data has one. */
  filter?: FilterSpec;
  /** The team that won the round (the data's `won` column), where it says. */
  winner?: number;
}

export interface CastInput {
  kills: CastKill[];
  captures: CastCapture[];
  rounds: CastRound[];
  /**
   * Whether the data names the victim of most kills. Then a kill without one
   * (a kill credit with nothing seen dying) is not shown as a kill on screen:
   * it neither chains into a multi-kill nor opens the match.
   */
  victimsNamed?: boolean;
}

/** One kill a moment is made of: who shot whom, when, and in what. The camera frames each in turn. */
export interface Beat {
  time: number;
  killer: number;
  victim: number;
  killerClass: string;
  victimClass: string;
}

export const MOMENT_KINDS = ['firstBlood', 'multiKill', 'trade', 'clutch', 'swing', 'objective', 'comeback', 'standout', 'struggle', 'longRange', 'turning'] as const;
export type MomentKind = (typeof MOMENT_KINDS)[number];

export interface Moment {
  id: string;
  kind: MomentKind;
  /** The instant of the action, and the window to play round it. */
  time: number;
  from: number;
  to: number;
  /** Who to follow; the other party (victim, the traded killer). -1 when none. */
  actor: number;
  other: number;
  team: number;
  x: number;
  y: number;
  z: number;
  /** The round it is in, an index into `CastInput.rounds` (played in their order; their clocks may overlap). */
  round: number;
  /** 0..1, how much it matters. */
  weight: number;
  /** The kills it is made of, in time order (none for a capture). */
  beats?: Beat[];
  /** Values of its sentence: counts, seconds, metres; persons and teams by index under `actor`/`other`/`team`/`victim`. */
  params: Record<string, number | string>;
}

export interface MomentOptions {
  /** Seconds between kills that still chain into one multi-kill. */
  chainGap: number;
  /** Seconds within which a kill trades the one before. */
  tradeWindow: number;
  /** Seconds played before a moment's action: `lead` for the least of them, up to `maxLead` for the weightiest. */
  lead: number;
  maxLead: number;
  /** Seconds played after it. */
  tail: number;
  /** At most this many moments, the weightiest. */
  max: number;
}

export const MOMENT_DEFAULTS: MomentOptions = { chainGap: 8, tradeWindow: 5, lead: 4, maxLead: 8, tail: 3, max: 40 };

const isTeamkill = (k: CastKill) => k.killerTeam >= 0 && k.killerTeam === k.victimTeam;
const fair = (k: CastKill) => k.killer >= 0 && k.killer !== k.victim && !isTeamkill(k);
const round1 = (v: number) => Math.round(v * 10) / 10;
const beat = (k: CastKill): Beat => ({ time: k.time, killer: k.killer, victim: k.victim, killerClass: k.killerClass, victimClass: k.victimClass });
/** Fixed-wing aircraft (`VEHICLE_CLASSES`): their bombs and rockets fall a long way before they kill. */
const WINGS = new Set(['fighter', 'attack', 'bomber', 'otherAir']);
const AIR = new Set([...WINGS, 'helicopter']);
/** Seconds of lead-in before a moment's first action: longer for the ones that matter more. */
export const leadFor = (weight: number, opt: MomentOptions = MOMENT_DEFAULTS) => opt.lead + (opt.maxLead - opt.lead) * Math.max(0, Math.min(1, weight));

export function findMoments(input: CastInput, opt: MomentOptions = MOMENT_DEFAULTS): Moment[] {
  const kills = [...input.kills].sort((a, b) => a.round - b.round || a.time - b.time);
  // A kill seen on screen: a fair one, with its victim where the data names victims.
  const seen = (k: CastKill) => fair(k) && (k.victim >= 0 || !input.victimsNamed);
  const out: Omit<Moment, 'id'>[] = [];
  const at = (k: CastKill) => ({ x: k.x, y: k.y, z: k.z, round: k.round });
  const win = (t0: number, t1 = t0) => ({ from: t0 - opt.lead, to: t1 + opt.tail });
  const multiRound = input.rounds.length > 1;

  // First blood: of the match, and of each round where there are rounds.
  const firstOf = new Map<number, CastKill>();
  for (const k of kills) if (seen(k) && !firstOf.has(k.round)) firstOf.set(k.round, k);
  let firstEver = true;
  for (const [r, k] of [...firstOf].sort((a, b) => a[0] - b[0])) {
    out.push({
      kind: 'firstBlood', time: k.time, ...win(k.time), actor: k.killer, other: k.victim, team: k.killerTeam, ...at(k),
      weight: firstEver ? 0.55 : 0.3, params: { round: multiRound ? r + 1 : 0 }, beats: [beat(k)],
    });
    firstEver = false;
  }

  // Multi-kills: one player's kills each within `chainGap` of the last, in one round.
  const byKiller = new Map<number, CastKill[]>();
  for (const k of kills) if (seen(k)) (byKiller.get(k.killer) ?? byKiller.set(k.killer, []).get(k.killer)!).push(k);
  for (const [p, ks] of byKiller) {
    let s = 0;
    for (let i = 1; i <= ks.length; i++) {
      if (i < ks.length && ks[i].round === ks[i - 1].round && ks[i].time - ks[i - 1].time <= opt.chainGap) continue;
      const n = i - s;
      if (n >= 2) {
        const a = ks[s];
        const b = ks[i - 1];
        out.push({
          kind: 'multiKill', time: a.time, ...win(a.time, b.time), actor: p, other: b.victim, team: a.killerTeam, ...at(b),
          weight: Math.min(1, 0.25 + 0.25 * (n - 1)), params: { n, secs: round1(b.time - a.time) }, beats: ks.slice(s, i).map(beat),
        });
      }
      s = i;
    }
  }

  // Trades: A kills B, and a teammate of B kills A soon after.
  for (let i = 0; i < kills.length; i++) {
    const a = kills[i];
    if (!seen(a)) continue;
    for (let j = i + 1; j < kills.length && kills[j].time - a.time <= opt.tradeWindow; j++) {
      const b = kills[j];
      if (!seen(b) || b.round !== a.round || b.victim !== a.killer || b.killer === a.victim) continue;
      if (a.victimTeam < 0 || b.killerTeam !== a.victimTeam) continue;
      out.push({
        kind: 'trade', time: b.time, ...win(a.time, b.time), actor: b.killer, other: a.killer, team: b.killerTeam, ...at(b),
        weight: 0.35, params: { victim: a.victim, secs: round1(b.time - a.time) }, beats: [beat(a), beat(b)],
      });
      break;
    }
  }

  // Clutches: in a round without respawns, the last of a team against the rest.
  input.rounds.forEach((r, ri) => {
    const rk = kills.filter((k) => k.round === ri);
    const deaths = new Map<number, number>();
    for (const k of rk) if (k.victim >= 0) deaths.set(k.victim, (deaths.get(k.victim) ?? 0) + 1);
    if ([...deaths.values()].some((n) => n > 1)) return; // respawns: nobody is ever the last
    const alive = new Map<number, Set<number>>();
    for (const [team, ps] of r.roster) if (team >= 0) alive.set(team, new Set(ps));
    if (alive.size < 2) return;
    const started = new Set<number>();
    for (let i = 0; i < rk.length; i++) {
      const k = rk[i];
      if (k.victim < 0) continue;
      alive.get(k.victimTeam)?.delete(k.victim);
      for (const [team, ps] of alive) {
        if (ps.size !== 1 || started.has(team)) continue;
        const against = [...alive].filter(([t]) => t !== team).reduce((n, [, s]) => n + s.size, 0);
        if (against < 1) continue;
        started.add(team);
        const actor = [...ps][0];
        // How it ends: every opponent down first, the player down, or neither by the round's end.
        const left = new Map([...alive].map(([t, s]) => [t, new Set(s)] as const));
        let outcome = 'open';
        let end = r.end;
        let took = 0;
        const beats: Beat[] = [];
        for (let j = i + 1; j < rk.length; j++) {
          const q = rk[j];
          if (q.killer === actor && fair(q)) {
            took++;
            if (seen(q)) beats.push(beat(q));
          }
          if (q.victim === actor) beats.push(beat(q));
          if (q.victim < 0) continue;
          left.get(q.victimTeam)?.delete(q.victim);
          if (q.victim === actor) {
            outcome = 'lost';
            end = q.time;
            break;
          }
          if ([...left].every(([t, s]) => t === team || s.size === 0)) {
            outcome = 'won';
            end = q.time;
            break;
          }
        }
        out.push({
          kind: 'clutch', time: k.time, from: k.time - opt.lead, to: Math.min(r.end, end) + opt.tail, actor, other: -1, team, ...at(k), beats,
          weight: Math.min(1, (against >= 2 ? 0.45 : 0.3) + 0.1 * (against - 1) + (outcome === 'won' ? 0.25 : 0)),
          params: { against, outcome, kills: took },
        });
      }
    }
  });

  // Objectives: each capture; one by the other side soon after the last is a swing.
  const caps = [...input.captures].sort((a, b) => a.round - b.round || a.time - b.time);
  caps.forEach((c, i) => {
    const prev = i > 0 ? caps[i - 1] : null;
    const swing = !!prev && prev.round === c.round && prev.team >= 0 && c.team >= 0 && prev.team !== c.team && c.time - prev.time <= 90;
    out.push({
      kind: swing ? 'swing' : 'objective', time: c.time, ...win(c.time), actor: c.person, other: -1, team: c.team, x: c.x, y: c.y, z: c.z, round: c.round,
      weight: swing ? 0.5 : 0.25, params: swing ? { secs: Math.round(c.time - prev!.time) } : {}, beats: [],
    });
  });

  // A comeback: a team that was well behind on kills (or rounds) takes the lead and keeps it.
  const comeback = findComeback(kills, input.rounds);
  if (comeback) out.push({ ...comeback, ...win(comeback.time) });

  out.push(...players(kills, win, seen));

  // Long shots: the farthest kills, where the data gives both places.
  // How far apart the two were when the kill was written is the length of the shot only for a target that went
  // down where it was hit and a shooter that stayed where it fired: not an aircraft shot down (it flies on, or falls,
  // before it counts), nor an aeroplane's bomb or rocket (it fell a long way while the aeroplane flew on).
  const shot = (k: CastKill) => seen(k) && k.distance !== null && !AIR.has(k.victimClass) && !WINGS.has(k.killerClass);
  const dist = kills.filter(shot).map((k) => k.distance!) as number[];
  if (dist.length >= 3) {
    const sorted = [...dist].sort((a, b) => a - b);
    const median = sorted[sorted.length >> 1];
    const p90 = sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * 0.9))];
    const cut = Math.max(p90, median * 2);
    const far = kills.filter((k) => shot(k) && k.distance! >= cut && k.distance! > 0).sort((a, b) => b.distance! - a.distance!).slice(0, 3);
    const top = far[0]?.distance ?? 1;
    for (const k of far) {
      out.push({
        kind: 'longRange', time: k.time, ...win(k.time), actor: k.killer, other: k.victim, team: k.killerTeam, ...at(k),
        weight: 0.25 + 0.3 * (k.distance! / top), params: { distance: Math.round(k.distance!) }, beats: [beat(k)],
      });
    }
  }

  out.push(...turningPoints(kills, input.rounds, win, seen));

  // The outcome weighs: a moment of the side that went on to win its round counts for more, and says so.
  for (const m of out) {
    const w = input.rounds[m.round]?.winner;
    if (w === undefined || m.team < 0 || 'result' in m.params) continue;
    const won = w === m.team;
    m.params.result = won ? 'won' : 'lost';
    if (won) m.weight = Math.min(1, m.weight + WON_BONUS);
  }

  // The lead-in: a few seconds before the first action, more for the moments that matter more.
  for (const m of out) m.from = m.from + opt.lead - leadFor(m.weight, opt);

  // The weightiest, no kind taking more than a third: a match of rounds has a clutch in most of them.
  const perKind = Math.max(3, Math.ceil(opt.max / 3));
  const taken = new Map<MomentKind, number>();
  // One clip a spell: a multi-kill that opens a standout's busiest spell (the same player, the same first kill) is told by the standout.
  const spell = (m: Omit<Moment, 'id'>) => (m.beats?.length ? `${m.actor}:${m.round}:${m.beats[0].time}` : '');
  const spells = new Set(out.filter((m) => m.kind === 'standout').map(spell));
  return out
    .filter((m) => m.kind !== 'multiKill' || !spells.has(spell(m)))
    .sort((a, b) => b.weight - a.weight || a.time - b.time)
    .filter((m) => {
      const n = taken.get(m.kind) ?? 0;
      taken.set(m.kind, n + 1);
      return n < perKind;
    })
    .slice(0, opt.max)
    .sort((a, b) => a.round - b.round || a.time - b.time || b.weight - a.weight)
    .map((m, i) => ({ ...m, id: `m${i + 1}` }));
}

/** Weight a moment gains when its side went on to win the round. */
export const WON_BONUS = 0.15;
/** Change of win probability a kill needs to be a turning point, and turning points kept at most. */
const TURN_MIN = 0.2;
const TURNS = 6;

/**
 * A side's chance to win an elimination round with `own` against `enemy`
 * alive: a fixed model of the men alive (the prior of `cqb/finish.ts`, without
 * the clock and the plant the caster does not read).
 */
export function aliveWinChance(own: number, enemy: number): number {
  if (own <= 0) return 0;
  if (enemy <= 0) return 1;
  const v = 1.5 * Math.log((own + 0.5) / (enemy + 0.5)) + 0.2 * (own - enemy);
  return 1 / (1 + Math.exp(-v));
}

/** The kills that moved a side's chance to win its round the most: in rounds without respawns, by the men left alive. */
function turningPoints(kills: CastKill[], rounds: CastRound[], win: (t0: number, t1?: number) => { from: number; to: number }, seen: (k: CastKill) => boolean): Omit<Moment, 'id'>[] {
  const all: Omit<Moment, 'id'>[] = [];
  rounds.forEach((r, ri) => {
    const rk = kills.filter((k) => k.round === ri && k.victim >= 0);
    const deaths = new Map<number, number>();
    for (const k of rk) deaths.set(k.victim, (deaths.get(k.victim) ?? 0) + 1);
    if ([...deaths.values()].some((n) => n > 1)) return;
    const teams = [...r.roster.keys()].filter((t) => t >= 0);
    if (teams.length !== 2) return;
    const alive = new Map(teams.map((t) => [t, r.roster.get(t)!.size] as const));
    for (const k of rk) {
      if (!fair(k) || !alive.has(k.killerTeam) || !alive.has(k.victimTeam)) {
        if (alive.has(k.victimTeam)) alive.set(k.victimTeam, Math.max(0, alive.get(k.victimTeam)! - 1));
        continue;
      }
      const own = alive.get(k.killerTeam)!;
      const enemy = alive.get(k.victimTeam)!;
      const before = aliveWinChance(own, enemy);
      const after = aliveWinChance(own, enemy - 1);
      alive.set(k.victimTeam, Math.max(0, enemy - 1));
      const delta = after - before;
      if (delta < TURN_MIN || !seen(k)) continue;
      const result = r.winner === undefined ? undefined : r.winner === k.killerTeam ? 'won' : 'lost';
      all.push({
        kind: 'turning', time: k.time, ...win(k.time), actor: k.killer, other: k.victim, team: k.killerTeam, x: k.x, y: k.y, z: k.z, round: ri,
        // A kill that turned the round its side then won is the moment; one that did not hold, less so.
        weight: Math.min(1, 0.3 + delta + (result === 'won' ? WON_BONUS : 0)),
        params: { victim: k.victim, fromPct: Math.round(before * 100), toPct: Math.round(after * 100), ...(result ? { result } : {}) }, beats: [beat(k)],
      });
    }
  });
  return all.sort((a, b) => b.weight - a.weight).slice(0, TURNS);
}

/** Kills (or rounds won by elimination) per team over time; the biggest deficit turned into a lead that held. */
function findComeback(kills: CastKill[], rounds: CastRound[]): Omit<Moment, 'id' | 'from' | 'to'> | null {
  type Step = { time: number; team: number; k: CastKill };
  const steps: Step[] = [];
  let unit: 'kills' | 'rounds' = 'kills';
  if (rounds.length > 1) {
    // A round's winner: as the data says, else the team whose opponents all went down in it.
    rounds.forEach((r, ri) => {
      const rk = kills.filter((k) => k.round === ri && k.victim >= 0);
      if (r.winner !== undefined && rk.length) {
        const k = rk[rk.length - 1];
        steps.push({ time: k.time, team: r.winner, k });
        return;
      }
      const left = new Map([...r.roster].filter(([t]) => t >= 0).map(([t, s]) => [t, new Set(s)] as const));
      for (const k of rk) {
        left.get(k.victimTeam)?.delete(k.victim);
        const standing = [...left].filter(([, s]) => s.size > 0);
        if (left.size >= 2 && standing.length === 1) {
          steps.push({ time: k.time, team: standing[0][0], k });
          break;
        }
      }
    });
    unit = 'rounds';
  } else {
    for (const k of kills) if (fair(k)) steps.push({ time: k.time, team: k.killerTeam, k });
  }
  const teams = [...new Set(steps.map((s) => s.team))].filter((t) => t >= 0);
  if (teams.length !== 2 || steps.length < 4) return null;
  const [a, b] = teams;
  let diff = 0; // a minus b
  let worstA = 0;
  let worstB = 0;
  let leadAt: { team: number; s: Step; deficit: number } | null = null;
  for (const s of steps) {
    const before = diff;
    diff += s.team === a ? 1 : s.team === b ? -1 : 0;
    if (diff < 0 && -diff > worstA) worstA = -diff;
    if (diff > 0 && diff > worstB) worstB = diff;
    if (before <= 0 && diff > 0) leadAt = { team: a, s, deficit: worstA };
    if (before >= 0 && diff < 0) leadAt = { team: b, s, deficit: worstB };
  }
  const need = unit === 'rounds' ? 3 : Math.max(4, Math.round(steps.length * 0.15));
  if (!leadAt || leadAt.deficit < need || (leadAt.team === a ? diff <= 0 : diff >= 0)) return null;
  const k = leadAt.s.k;
  return {
    kind: 'comeback', time: leadAt.s.time, actor: k.killer, other: -1, team: leadAt.team, x: k.x, y: k.y, z: k.z, round: k.round,
    weight: Math.min(1, 0.5 + 0.05 * leadAt.deficit), params: { deficit: leadAt.deficit, unit }, beats: k.killer >= 0 && k.victim >= 0 ? [beat(k)] : [],
  };
}

/** Each player against others in the same vehicle class: who stands out, who struggles. */
function players(kills: CastKill[], win: (t0: number, t1?: number) => { from: number; to: number }, seen: (k: CastKill) => boolean): Omit<Moment, 'id'>[] {
  const st = new Map<number, { kills: CastKill[]; deaths: CastKill[]; classes: Map<string, number>; team: number }>();
  const get = (p: number, team: number) => {
    let s = st.get(p);
    if (!s) st.set(p, (s = { kills: [], deaths: [], classes: new Map(), team }));
    if (s.team < 0) s.team = team;
    return s;
  };
  for (const k of kills) {
    if (fair(k)) {
      const s = get(k.killer, k.killerTeam);
      s.kills.push(k);
      if (k.killerClass) s.classes.set(k.killerClass, (s.classes.get(k.killerClass) ?? 0) + 1);
    }
    if (k.victim >= 0) {
      const s = get(k.victim, k.victimTeam);
      s.deaths.push(k);
      if (k.victimClass) s.classes.set(k.victimClass, (s.classes.get(k.victimClass) ?? 0) + 1);
    }
  }
  if (st.size < 4) return [];
  const classOf = (s: { classes: Map<string, number> }) => [...s.classes].sort((a, b) => b[1] - a[1])[0]?.[0] ?? '';
  // Peers: the same class where it has three players or more, everyone otherwise.
  const groups = new Map<string, number[]>();
  for (const [p, s] of st) {
    const c = classOf(s);
    (groups.get(c) ?? groups.set(c, []).get(c)!).push(p);
  }
  const all = [...st.keys()];
  const out: Omit<Moment, 'id'>[] = [];
  const done = new Set<string>();
  // One standout and one hard match a player: the same player against their class and against everyone is one story.
  const told = new Set<string>();
  for (const [c, members] of groups) {
    const peers = members.length >= 3 ? members : all;
    const cls = members.length >= 3 ? c : '';
    if (done.has(cls)) continue;
    done.add(cls);
    const ks = peers.map((p) => st.get(p)!.kills.length);
    const mean = ks.reduce((a, b) => a + b, 0) / ks.length;
    const sd = Math.max(1, Math.sqrt(ks.reduce((a, b) => a + (b - mean) ** 2, 0) / ks.length));
    const ranked = [...peers].sort((a, b) => st.get(b)!.kills.length - st.get(a)!.kills.length);
    const best = st.get(ranked[0])!;
    if (best.kills.length >= 3 && best.kills.length >= mean + 1.5 * sd && !told.has(`s${ranked[0]}`)) {
      told.add(`s${ranked[0]}`);
      // Their busiest half-minute.
      let bi = 0;
      let bn = 0;
      for (let i = 0; i < best.kills.length; i++) {
        let j = i;
        while (j + 1 < best.kills.length && best.kills[j + 1].time - best.kills[i].time <= 30) j++;
        if (j - i + 1 > bn) [bi, bn] = [i, j - i + 1];
      }
      const k = best.kills[bi];
      const busy = best.kills.slice(bi, bi + bn);
      out.push({
        kind: 'standout', time: k.time, ...win(k.time, busy[busy.length - 1].time), actor: ranked[0], other: -1, team: best.team, x: k.x, y: k.y, z: k.z, round: k.round,
        weight: Math.min(1, 0.4 + 0.1 * ((best.kills.length - mean) / sd)), params: { kills: best.kills.length, deaths: best.deaths.length, mean: round1(mean), class: cls },
        beats: busy.filter(seen).map(beat),
      });
    }
    const deathsMean = peers.reduce((a, p) => a + st.get(p)!.deaths.length, 0) / peers.length;
    const worst = [...peers]
      .filter((p) => st.get(p)!.deaths.length >= Math.max(3, deathsMean + 1) && st.get(p)!.kills.length <= Math.max(0, mean - sd))
      .sort((a, b) => st.get(b)!.deaths.length - st.get(a)!.deaths.length)[0];
    if (worst !== undefined && mean >= 1 && !told.has(`w${worst}`)) {
      told.add(`w${worst}`);
      const s = st.get(worst)!;
      const k = s.deaths[s.deaths.length - 1];
      out.push({
        kind: 'struggle', time: k.time, ...win(k.time), actor: worst, other: k.killer, team: s.team, x: k.x, y: k.y, z: k.z, round: k.round,
        weight: 0.2, params: { kills: s.kills.length, deaths: s.deaths.length, mean: round1(mean), class: cls }, beats: [beat(k)],
      });
    }
  }
  return out;
}
