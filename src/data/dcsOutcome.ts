/**
 * Who won on a DCS multiplayer server, and how each sortie ended: what a
 * Tacview recording of a persistent PvP server can say about the outcome
 * contract (docs/data-formats.md#outcome-columns), read by the ACMI converter
 * (`tools/acmi-to-parquet.mjs`).
 *
 *   server     the server or campaign a recording comes from, by the names
 *              its own header carries (Title, Author, Comments); `dcsServer`
 *   rounds     a server's campaign rounds and who won them, from a rounds
 *              file (`DcsRounds`, format `heat3d-dcs-rounds`): a recording
 *              of such a server says neither, so the rounds come from what
 *              the server publishes, with their source named
 *   sorties    each aircraft's flights, from take-off to the landing,
 *              ejection, shot down, crash or removal that ended them, and
 *              the kills in each (`AcmiSorties`, from the events
 *              `acmiEvents.ts` works out)
 *   captures   an airfield or FARP changing sides where the recording shows
 *              it: the same pad written in another colour, or removed and
 *              written again at its place in another (`PadOwners`)
 *
 * Nothing is guessed: a round no rounds file names, or a side a recording
 * does not show, leaves the outcome empty.
 */

import { acmiKindOf } from './acmiEvents.ts';

// ---------------------------------------------------------------------------
// The server.

/** What kind of play a server is: player against player, or players against the mission's AI. */
export type DcsServerKind = 'pvp' | 'pve';

export interface DcsServer {
  /** The server or campaign, as one name for all its recordings ('' where the header names none). */
  server: string;
  /** The mission: the recording's Title without its version or campaign month. */
  mission: string;
  /** PvP or PvE where known. */
  kind: DcsServerKind | null;
}

/** Known servers: the header fields that name them. First match wins. */
const KNOWN: { server: string; kind: DcsServerKind; title?: RegExp; author?: RegExp; comments?: RegExp }[] = [
  { server: 'Blue Flag', kind: 'pvp', title: /^BlueFlag[_ -]/i, author: /^Blue\s?Flag$/i },
  { server: 'SPS Contention', kind: 'pvp', title: /^SPS-Contention/i, author: /^SPS Admin$/i, comments: /Contention by Strike Package Studios/i },
  { server: 'Growling Sidewinder', kind: 'pvp', author: /^GS Admin$/i, comments: /Growling Sidewinder/i },
];

/** Authors that name no one. */
const GENERIC_AUTHOR = /^(admin|administrator|server|host|dcs|unknown|)$/i;

/** The mission's name: the Title without a version (`_V7.7.99`, `_Version_4.1.5`, `_v.16.9`, `_1.3`) or campaign year and month (`_2014_04`, `_2014`). */
export function dcsMission(title: string): string {
  return title
    .trim()
    .replace(/[_ -](v(ersion)?[_ .]?)?\d+(\.\d+)+$/i, '')
    .replace(/_\d{4}(_\d{2})?$/, '')
    .replace(/_/g, ' ')
    .trim();
}

/**
 * The server a recording comes from, by its header: a known server's Title,
 * Author or Comments, else the Author where it names someone, else none.
 * `override` (the converter's --server) names it outright.
 */
export function dcsServer(globals: Readonly<Record<string, string>>, override = ''): DcsServer {
  const title = globals.Title ?? '';
  const author = (globals.Author ?? '').trim();
  const comments = globals.Comments ?? '';
  const mission = dcsMission(title);
  const known = KNOWN.find((k) => (k.title && k.title.test(title)) || (k.author && k.author.test(author)) || (k.comments && k.comments.test(comments)));
  if (override) return { server: override, mission, kind: known?.server === override ? known.kind : null };
  if (known) return { server: known.server, mission, kind: known.kind };
  return { server: GENERIC_AUTHOR.test(author) ? '' : author, mission, kind: null };
}

// ---------------------------------------------------------------------------
// The rounds, from what a server publishes.

/** A side as a recording colours it. */
export type DcsSide = 'Red' | 'Blue';

export interface DcsRound {
  /** The server's own id of the round (a campaign number). */
  id: number;
  /** Recordings of this round: their Title matches (a regular expression); none: any of the server's. */
  title?: string;
  /** When it began and ended, ISO 8601 (UTC where no zone is given); no end: still running. */
  start: string;
  end?: string | null;
  /** Who won it; null: no one (rotated, still running, or not said). */
  winner?: DcsSide | null;
  /** How it ended, in the contract's words (`capture`: every airfield and zone taken). */
  endReason?: string | null;
  /** The source's own word for how it stands: won, rotated, in progress. */
  state?: string;
}

/** A rounds file: `{ format: 'heat3d-dcs-rounds', version: 1, server, source, rounds: [...] }`. */
export interface DcsRoundsFile {
  format: 'heat3d-dcs-rounds';
  version: number;
  server: string;
  /** Where the rounds were read: the page, and when. */
  source: string;
  note?: string;
  rounds: DcsRound[];
}

const isoSeconds = (s: string | null | undefined): number => {
  if (!s) return NaN;
  const z = /[zZ]|[+-]\d\d:?\d\d$/.test(s) ? s : `${s}Z`;
  const t = Date.parse(z);
  return Number.isFinite(t) ? t / 1000 : NaN;
};

/** A round as the converter uses it: its window in Unix seconds. */
export interface RoundSpan {
  id: number;
  t0: number;
  t1: number;
  winner: DcsSide | null;
  endReason: string | null;
  state: string | null;
}

/** The rounds of the servers a converter was given, looked up per recording and per row. */
export class DcsRounds {
  readonly files: DcsRoundsFile[];

  constructor(files: readonly unknown[]) {
    this.files = files.filter((f): f is DcsRoundsFile => {
      const d = f as DcsRoundsFile;
      return !!d && d.format === 'heat3d-dcs-rounds' && typeof d.server === 'string' && Array.isArray(d.rounds);
    });
  }

  /**
   * The rounds a recording of `server` titled `title`, running from `t0` to
   * `t1` (Unix seconds), took part in, in time order; the source of them.
   */
  forRecording(server: string, title: string, t0: number, t1: number): { rounds: RoundSpan[]; source: string | null } {
    const f = this.files.find((x) => x.server === server);
    if (!f) return { rounds: [], source: null };
    const rounds: RoundSpan[] = [];
    for (const r of f.rounds) {
      if (r.title) {
        let re: RegExp;
        try {
          re = new RegExp(r.title, 'i');
        } catch {
          continue;
        }
        if (!re.test(title)) continue;
      }
      const a = isoSeconds(r.start);
      const b = r.end ? isoSeconds(r.end) : Infinity;
      if (!Number.isFinite(a) || Number.isNaN(b)) continue;
      if (b <= t0 || a > t1) continue;
      const w = r.winner === 'Red' || r.winner === 'Blue' ? r.winner : null;
      rounds.push({ id: r.id, t0: a, t1: b, winner: w, endReason: w ? (r.endReason ?? null) : null, state: r.state ?? null });
    }
    rounds.sort((p, q) => p.t0 - q.t0);
    return { rounds, source: rounds.length ? f.source : null };
  }
}

/** The round a moment falls in (the last begun before it, not yet over), or null. */
export function roundAt(rounds: readonly RoundSpan[], t: number): RoundSpan | null {
  for (let i = rounds.length - 1; i >= 0; i--) if (rounds[i].t0 <= t) return t < rounds[i].t1 ? rounds[i] : null;
  return null;
}

/** A row's side by its Color (DCS: Red, Blue), or null for a neutral or none. */
export function sideOf(color: string): DcsSide | null {
  const c = color.trim().toLowerCase();
  return c === 'red' ? 'Red' : c === 'blue' ? 'Blue' : null;
}

/** The row's outcome in a round: 1 its side won, 0 it lost, NaN unknown (no round, no winner, or no side). */
export function wonIn(round: RoundSpan | null, color: string): number {
  if (!round || !round.winner) return NaN;
  const s = sideOf(color);
  return s === null ? NaN : s === round.winner ? 1 : 0;
}

// ---------------------------------------------------------------------------
// Sorties.

/**
 * How a sortie ended:
 *
 *   landed           down on a runway, pad or deck
 *   landed damaged   down, after a hit in the air
 *   ejected          the pilot left the aircraft (not shot down after)
 *   shot down        killed in the air
 *   destroyed        killed on the ground
 *   crashed          removed flying low or diving, no hit on it
 *   despawned        removed in the air with no cause seen (a player leaving, a slot change)
 *   airborne at end  still flying when the recording ended
 *   no takeoff       never flew
 */
export const SORTIE_RESULTS = ['landed', 'landed damaged', 'ejected', 'shot down', 'destroyed', 'crashed', 'despawned', 'airborne at end', 'no takeoff'] as const;
export type SortieResult = (typeof SORTIE_RESULTS)[number];

export interface Sortie {
  /** 1-based, per aircraft. */
  n: number;
  /** From when its rows count to it (its spawn for the first, its take-off for the next). */
  start: number;
  takeoff: number;
  /** When it ended (landing, ejection, death, crash, removal); NaN: still open. */
  end: number;
  flown: boolean;
  result: SortieResult | null;
  kills: number;
}

/** The events a sortie is made of. */
const SORTIE_EVENTS = new Set(['spawn', 'takeoff', 'landing', 'eject', 'death', 'crash', 'kill']);

interface Track {
  list: Sortie[];
  gone: number;
}

/**
 * Each aircraft's sorties from its events. A sortie runs from one take-off to
 * the next: the ground time before the first take-off and after a landing
 * counts to the sortie it belongs to. Feed it every event of the finder
 * (`event`), each aircraft's removal (`removed`) and the end (`finish`);
 * times as the caller keeps them, keys any value naming one object.
 */
export class AcmiSorties<K> {
  private readonly tracks = new Map<K, Track>();

  /** An aircraft (fixed wing or helicopter) by its Tacview type. */
  static isAircraft(type: string): boolean {
    const k = acmiKindOf(type);
    return k === 'air' || k === 'heli';
  }

  private open(key: K): Track {
    let tr = this.tracks.get(key);
    if (!tr) this.tracks.set(key, (tr = { list: [], gone: NaN }));
    if (!tr.list.length) tr.list.push({ n: 1, start: -Infinity, takeoff: NaN, end: NaN, flown: false, result: null, kills: 0 });
    return tr;
  }

  /** An event of an aircraft's (its subject): spawn, takeoff, landing, eject, death, crash, kill; others are ignored. */
  event(key: K, kind: string, t: number, detail = ''): void {
    if (!SORTIE_EVENTS.has(kind)) return;
    const tr = this.open(key);
    let s = tr.list[tr.list.length - 1];
    switch (kind) {
      case 'takeoff':
        if (s.flown) {
          // Up again after a landing: the next sortie.
          if (!s.result) s.result = 'landed';
          if (Number.isNaN(s.end)) s.end = t;
          s = { n: s.n + 1, start: t, takeoff: t, end: NaN, flown: true, result: null, kills: 0 };
          tr.list.push(s);
        } else {
          s.flown = true;
          s.takeoff = t;
        }
        break;
      case 'landing':
        s.flown = true;
        if (!s.result || s.result === 'ejected') {
          s.result = detail === 'damaged' ? 'landed damaged' : 'landed';
          s.end = t;
        }
        break;
      case 'eject':
        s.flown = true;
        if (!s.result) {
          s.result = 'ejected';
          s.end = t;
        }
        break;
      case 'death':
        if (!s.result || s.result === 'ejected') {
          if (detail === 'shot down') s.flown = true;
          s.result = detail === 'shot down' ? 'shot down' : 'destroyed';
          s.end = t;
        }
        break;
      case 'crash':
        s.flown = true;
        if (!s.result) {
          s.result = 'crashed';
          s.end = t;
        }
        break;
      case 'kill':
        s.kills++;
        break;
      default:
        break;
    }
  }

  /** An aircraft removed at `t`; `airborne`: flying at its last sample (the finder's `airborne`). */
  removed(key: K, t: number, airborne: boolean | null): void {
    const tr = this.tracks.get(key);
    if (!tr) return;
    tr.gone = t;
    const s = tr.list[tr.list.length - 1];
    if (airborne) s.flown = true;
    // The removal's own judgement (shot down, crash) comes after it: the result waits for `finish`.
  }

  /** The recording is over at `t`; `airborne(key)`: whether an aircraft still in it is flying. */
  finish(t: number, airborne: (key: K) => boolean | null = () => null): void {
    for (const [key, tr] of this.tracks) {
      const s = tr.list[tr.list.length - 1];
      if (s.result) continue;
      if (Number.isNaN(tr.gone)) {
        const air = airborne(key);
        if (air) s.flown = true;
        s.result = s.flown ? (air === false ? 'landed' : 'airborne at end') : 'no takeoff';
        s.end = t;
      } else {
        s.result = s.flown ? 'despawned' : 'no takeoff';
        s.end = tr.gone;
      }
    }
  }

  /** An aircraft's sorties, in order (none for a unit that is not one). */
  of(key: K): readonly Sortie[] {
    return this.tracks.get(key)?.list ?? [];
  }

  /** The sortie a moment of an aircraft's falls in. */
  at(key: K, t: number): Sortie | null {
    const list = this.tracks.get(key)?.list;
    if (!list) return null;
    for (let i = list.length - 1; i >= 0; i--) if (list[i].start <= t) return list[i];
    return list[0] ?? null;
  }

  /** Every sortie, by key. */
  entries(): IterableIterator<[K, Track]> {
    return this.tracks.entries();
  }
}

// ---------------------------------------------------------------------------
// Airfields and FARPs changing sides.

/** A pad: an airfield or a FARP (a carrier is a ship, sunk not taken). */
const PAD = /Aerodrome|FARP|Airport|Airbase/i;
/** How near (m) a pad written again must be to the one removed to be the same place. */
const SAME_PLACE_M = 150;
/** How long (s) after a pad's removal one written again at its place still takes it over. */
const RETAKE_S = 300;

export interface Capture<K> {
  /** The pad now (its key). */
  key: K;
  t: number;
  x: number;
  y: number;
  z: number;
  name: string;
  from: DcsSide | 'Neutral';
  to: DcsSide | 'Neutral';
}

const ownerOf = (color: string): DcsSide | 'Neutral' => sideOf(color) ?? 'Neutral';

/**
 * Airfields and FARPs that change sides where a recording shows it: a pad
 * written again in another colour, or removed and written at the same place
 * (within `SAME_PLACE_M`, by `RETAKE_S`) in another. A pad first written in
 * a colour is no capture: the recording's start, or a new FARP, says nothing
 * of who held it before.
 */
export class PadOwners<K> {
  private readonly pads = new Map<K, { color: string; name: string; x: number; y: number; z: number }>();
  private gone: { t: number; color: string; name: string; x: number; y: number }[] = [];
  private readonly tell: (c: Capture<K>) => void;

  constructor(tell: (c: Capture<K>) => void) {
    this.tell = tell;
  }

  static isPad(type: string): boolean {
    return PAD.test(type) && !/AircraftCarrier|Sea|Watercraft/i.test(type);
  }

  /** A pad's sample (callers pass pads only: `isPad`). */
  sample(key: K, t: number, x: number, y: number, z: number, color: string, name: string): void {
    if (!Number.isFinite(x) || !Number.isFinite(y)) return;
    const p = this.pads.get(key);
    if (p) {
      if (color && p.color && color !== p.color && ownerOf(color) !== ownerOf(p.color))
        this.tell({ key, t, x, y, z, name: name || p.name, from: ownerOf(p.color), to: ownerOf(color) });
      if (color) p.color = color;
      p.x = x;
      p.y = y;
      p.z = z;
      if (name) p.name = name;
      return;
    }
    this.pads.set(key, { color, name, x, y, z });
    this.gone = this.gone.filter((g) => t - g.t <= RETAKE_S);
    let best = -1;
    let bd = SAME_PLACE_M;
    for (let i = 0; i < this.gone.length; i++) {
      const g = this.gone[i];
      const d = Math.hypot(g.x - x, g.y - y);
      if (d <= bd) {
        bd = d;
        best = i;
      }
    }
    if (best < 0) return;
    const g = this.gone[best];
    this.gone.splice(best, 1);
    if (ownerOf(g.color) !== ownerOf(color)) this.tell({ key, t, x, y, z, name: name || g.name, from: ownerOf(g.color), to: ownerOf(color) });
  }

  /** A pad removed at `t`. */
  removed(key: K, t: number): void {
    const p = this.pads.get(key);
    if (!p) return;
    this.pads.delete(key);
    this.gone.push({ t, color: p.color, name: p.name, x: p.x, y: p.y });
  }
}
