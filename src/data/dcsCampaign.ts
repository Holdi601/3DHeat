/**
 * A DCS server's campaign rounds from its recordings alone. A persistent
 * server keeps the campaign across mission restarts: each recording (one
 * session, restart to restart) begins with the ground units and statics of
 * both sides where the campaign left them, written once at the start. So the
 * sessions of one server and map, in time order, chain into rounds:
 *
 *   places    the ground in 0.02-degree cells (about 2 km); a cell is a side's
 *             where at least three quarters of the units there at a session's
 *             start are that side's (`placesOf`)
 *   contested the places seen held by both sides at some session's start
 *   captures  between two sessions, a place held by the other side now: taken
 *             between the missions (or during the earlier one)
 *   reset     a session whose places differ from the last one's in more than
 *             `RESET_SHARE` of them: the layout of a new round, not a step of
 *             the old one (a server checked moved at most a third of its
 *             places between sessions, and nine in ten at a new round); the
 *             earlier sessions are a round that ended
 *   rotated   a round whose map the server left for another (the other map's
 *             sessions begin after its last and go on): ended too
 *   winner    of an ended round: the side holding every place at the last
 *             session's start, the other none (`capture`, high confidence),
 *             else the side holding more of the contested ones (medium at
 *             twice the other's, else low; low for a round ended by a map
 *             change); none at a tie. An open round has no winner, only who
 *             is ahead.
 *
 * The last session's start can be hours before the round's end, so the side
 * ahead then is no proof: checked against a server that publishes its winners
 * (docs/tacview-acmi.md), it named every one of them. A server whose sessions
 * all begin alike (no contested place) keeps no state between them: its
 * sessions are not chained.
 */

import { dcsMission, type DcsRound, type DcsSide } from './dcsOutcome.ts';

/** A unit or static of a side at a session's start. */
export interface StartUnit {
  lat: number;
  lon: number;
  color: string;
}

/** A session: one recording's start. */
export interface SessionStart {
  file: string;
  server: string;
  title: string;
  /** RecordingTime, Unix seconds. */
  start: number;
  units: StartUnit[];
}

export const CELL_DEG = 0.02;
/** Seconds of a session's start read for its layout: the units are written in the first frames. */
export const START_S = 180;
/** What holds ground: units, ships and statics of a side (not aircraft, weapons or map marks). */
export const START_UNIT = /(^|\+)(Ground|Sea|Static|Building|Aerodrome|FARP)(\+|$)/i;
export const NOT_START_UNIT = /Weapon|Missile|Rocket|Bomb|Shell|Bullet|Projectile|Bullseye|Navaid|Waypoint|Decoy|Flare|Chaff|Parachutist|(^|\+)Air(\+|$)/i;
export const RESET_SHARE = 0.6;
/** How soon (s) after a map's last session another map of the server must begin for the server to have moved on. */
const ROTATE_S = 12 * 3600;
/** Sessions the other map must have after that. */
const ROTATE_MIN_SESSIONS = 3;

type Side = DcsSide;

/** The places of a session: cell key -> the side holding it. */
export function placesOf(units: readonly StartUnit[], cell = CELL_DEG): Map<string, Side> {
  const n = new Map<string, [number, number]>();
  for (const u of units) {
    if ((u.color !== 'Red' && u.color !== 'Blue') || !Number.isFinite(u.lat) || !Number.isFinite(u.lon)) continue;
    const c = u.color === 'Red' ? 0 : 1;
    const k = `${Math.round(u.lat / cell)},${Math.round(u.lon / cell)}`;
    let a = n.get(k);
    if (!a) n.set(k, (a = [0, 0]));
    a[c]++;
  }
  const out = new Map<string, Side>();
  for (const [k, [r, b]] of n) {
    if (r >= 0.75 * (r + b)) out.set(k, 'Red');
    else if (b >= 0.75 * (r + b)) out.set(k, 'Blue');
  }
  return out;
}

/** A cell key's centre. */
export function cellCentre(key: string, cell = CELL_DEG): { lat: number; lon: number } {
  const [a, b] = key.split(',').map(Number);
  return { lat: a * cell, lon: b * cell };
}

/** Which campaign a recording belongs to: the server and its map (and era, where the server runs several). */
export function campaignKey(server: string, title: string): string {
  const bf = /^BlueFlag_([A-Za-z]+)/.exec(title);
  if (bf) return `${server} ${bf[1]}`;
  const sps = /^SPS-Contention-([A-Za-z]+)-(CW|SARH-E\d+|Modern-E\d+)/i.exec(title);
  if (sps) return `${server} ${sps[1]} ${sps[2]}`;
  return `${server} ${dcsMission(title)}`.trim();
}

/** How much two sessions' places differ: places gained, lost or changed side, over all places of either. */
export function placeChange(a: ReadonlyMap<string, Side>, b: ReadonlyMap<string, Side>): number {
  let diff = 0;
  let all = 0;
  for (const [k, v] of a) {
    all++;
    const w = b.get(k);
    if (w !== v) diff++;
  }
  for (const k of b.keys()) if (!a.has(k)) {
    all++;
    diff++;
  }
  return all ? diff / all : 0;
}

export interface ChainSession {
  file: string;
  start: number;
  /** Contested places each side held at the start. */
  red: number;
  blue: number;
  /** All places each side held at the start, contested or not. */
  redAll: number;
  blueAll: number;
  /** Places that changed side since the session before (none for a round's first). */
  captures: { key: string; lat: number; lon: number; from: Side; to: Side }[];
}

export interface ChainRound {
  /** The n-th round of the campaign seen, from 1. */
  n: number;
  campaign: string;
  titles: string[];
  sessions: ChainSession[];
  /** How it ended: the next round's layout (reset), the server moved to another map (rotated), or not yet (open). */
  end: 'reset' | 'rotated' | 'open';
  /** When the next round (or the next map) began; null while open. */
  endTime: number | null;
  winner: Side | null;
  endReason: 'capture' | null;
  confidence: 'high' | 'medium' | 'low' | null;
  /** Who was ahead at the last session's start. */
  ahead: Side | null;
}

export interface CampaignChain {
  campaign: string;
  server: string;
  sessions: number;
  contested: number;
  /** Whether the sessions carry state from one to the next (some place changed side). */
  persistent: boolean;
  rounds: ChainRound[];
}

const tally = (places: ReadonlyMap<string, Side>, contested: ReadonlySet<string>) => {
  let red = 0;
  let blue = 0;
  for (const k of contested) {
    const v = places.get(k);
    if (v === 'Red') red++;
    else if (v === 'Blue') blue++;
  }
  return { red, blue };
};

/** The rounds of every campaign the sessions belong to. */
export function chainCampaigns(all: readonly SessionStart[], reset = RESET_SHARE, cell = CELL_DEG): CampaignChain[] {
  const groups = new Map<string, SessionStart[]>();
  for (const s of all) {
    if (!Number.isFinite(s.start)) continue;
    const k = campaignKey(s.server, s.title);
    let g = groups.get(k);
    if (!g) groups.set(k, (g = []));
    g.push(s);
  }
  const out: CampaignChain[] = [];
  for (const [campaign, list] of groups) {
    list.sort((a, b) => a.start - b.start);
    const places = list.map((s) => placesOf(s.units, cell));
    const seen = new Map<string, Set<Side>>();
    for (const p of places) for (const [k, v] of p) {
      let s = seen.get(k);
      if (!s) seen.set(k, (s = new Set()));
      s.add(v);
    }
    const contested = new Set([...seen].filter(([, v]) => v.size > 1).map(([k]) => k));
    const chain: CampaignChain = { campaign, server: list[0].server, sessions: list.length, contested: contested.size, persistent: contested.size > 0, rounds: [] };
    out.push(chain);
    if (!chain.persistent) continue;
    let cur: ChainRound | null = null;
    for (let i = 0; i < list.length; i++) {
      const isReset = i > 0 && placeChange(places[i - 1], places[i]) > reset;
      if (!cur || isReset) {
        if (cur) {
          cur.end = 'reset';
          cur.endTime = list[i].start;
        }
        cur = { n: chain.rounds.length + 1, campaign, titles: [], sessions: [], end: 'open', endTime: null, winner: null, endReason: null, confidence: null, ahead: null };
        chain.rounds.push(cur);
      }
      const captures: ChainSession['captures'] = [];
      if (cur.sessions.length) {
        const a = places[i - 1];
        for (const [k, to] of places[i]) {
          const from = a.get(k);
          if (from && from !== to && contested.has(k)) captures.push({ key: k, ...cellCentre(k, cell), from, to });
        }
      }
      if (!cur.titles.includes(list[i].title)) cur.titles.push(list[i].title);
      let redAll = 0;
      for (const v of places[i].values()) if (v === 'Red') redAll++;
      cur.sessions.push({ file: list[i].file, start: list[i].start, ...tally(places[i], contested), redAll, blueAll: places[i].size - redAll, captures });
    }
  }
  // A map the server left for another: its open round ended when the other began.
  for (const c of out) {
    const last = c.rounds[c.rounds.length - 1];
    if (!last || last.end !== 'open') continue;
    const tEnd = last.sessions[last.sessions.length - 1].start;
    const next = out
      .filter((o) => o !== c && o.server === c.server && o.server)
      .map((o) => {
        const after = allStarts(o).filter((t) => t > tEnd);
        return { first: after[0] ?? Infinity, count: after.length };
      })
      .filter((o) => o.first - tEnd <= ROTATE_S && o.count >= ROTATE_MIN_SESSIONS)
      .sort((a, b) => a.first - b.first)[0];
    if (next) {
      last.end = 'rotated';
      last.endTime = next.first;
    }
  }
  for (const c of out)
    for (const r of c.rounds) {
      const s = r.sessions[r.sessions.length - 1];
      r.ahead = s.red > s.blue ? 'Red' : s.blue > s.red ? 'Blue' : null;
      if (r.end === 'open' || !r.ahead) continue;
      const lead = Math.max(s.red, s.blue);
      const other = Math.min(s.red, s.blue);
      const all = (r.ahead === 'Red' ? s.blueAll : s.redAll) === 0;
      r.winner = r.ahead;
      r.endReason = all ? 'capture' : null;
      r.confidence = all ? 'high' : r.end === 'rotated' ? 'low' : lead >= 2 * other ? 'medium' : 'low';
    }
  return out;
}

/** Every session start of a campaign (its rounds', or none for one not chained). */
function allStarts(c: CampaignChain): number[] {
  return c.rounds.flatMap((r) => r.sessions.map((s) => s.start));
}

const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const iso = (t: number | null) => (t !== null && Number.isFinite(t) ? new Date(t * 1000).toISOString() : null);

/** A chained round as a rounds file's round (`DcsRound`), its sessions and their captures with it. */
export function roundOfChain(r: ChainRound): DcsRound & Record<string, unknown> {
  return {
    id: r.n,
    campaign: `${r.campaign} ${r.n}`,
    title: `^(?:${r.titles.map(escape).join('|')})$`,
    start: iso(r.sessions[0].start)!,
    end: iso(r.endTime),
    winner: r.winner,
    endReason: r.endReason,
    state: r.end === 'open' ? 'open' : r.winner ? `won (${r.end})` : `ended (${r.end}), no side ahead`,
    confidence: r.confidence,
    ahead: r.ahead,
    sessions: r.sessions.map((s) => ({ start: iso(s.start), file: s.file, red: s.red, blue: s.blue, redAll: s.redAll, blueAll: s.blueAll, captures: s.captures.map((c) => ({ lat: c.lat, lon: c.lon, from: c.from, to: c.to })) })),
  };
}
