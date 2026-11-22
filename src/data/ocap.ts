/**
 * OCAP recordings of Arma 3 missions (`.json`, or gzipped `.json.gz`), read
 * into a table the viewer loads like any other: one row per entity per
 * captured frame, and one row per event at the place it happened.
 *
 * OCAP ("Operation Capture And Playback", github.com/OCAP2) records on the
 * server only - an addon loaded with -serverMod and an extension - and writes
 * one JSON file per mission. The layout read here is the one OCAP2's own web
 * player reads: OCAP2/web `ui/src/data/decoders/jsonDecoder.ts` (MIT, commit
 * 09268b9, 2026-11), checked against two public recordings, one from the
 * original OCAP layout and one from OCAP2:
 *
 *   { missionName, worldName, missionAuthor, captureDelay (s per frame),
 *     endFrame, times: [{frameNum, systemTimeUTC, ...}],
 *     entities: [{ id, type: "unit" | "vehicle", name, side, group, role,
 *                  isPlayer, class (vehicles), startFrameNum,
 *                  positions, framesFired: [[frame, [x, y, z?]], ...] }],
 *     events: [[frame, kind, ...], ...], Markers: [...] }
 *
 * A unit's positions are one per frame from startFrameNum:
 *   [[x, y, z?], dir, alive, inVehicle, name, isPlayer, role?, group?, side?]
 * where alive is 0 dead, 1 alive, 2 unconscious, and inVehicle is 0, 1, or
 * (newest recorders) the id of the vehicle. A vehicle's are
 *   [[x, y, z?], dir, alive, [crew ids], [firstFrame, lastFrame]?]
 * the last element, when there, saying the state holds for those frames.
 * An empty entry repeats the one before. Positions are Arma's world metres,
 * x east and y north from the map's south-west corner; z is height above sea
 * level (absent in the original layout). dir is a compass bearing, degrees.
 *
 * Events: [f, "killed" | "hit", victim, [killer, weapon] or ["null"], metres],
 * [f, "connected" | "disconnected", name], [f, "captured", [what, name, side,
 * [x, y, z]]], [f, "endMission", [side, text]], [f, "generalEvent", text], and
 * others (tickets, counters, snapshots). A unit's `framesFired` are
 * [frame, [x, y, z?]]: where each shot went. `Markers` are the map's markers:
 * [type, text, firstFrame, lastFrame, player, color, side, [[frame, [x, y, z?],
 * dir?, alpha?], ...], size?, shape?, brush?]. `times` say, now and then, the
 * server's clock (systemTimeUTC), the in-game date and the time multiplier.
 *
 * What is kept: a dead unit or wreck once, at the frame it died, and not again
 * until it lives (a respawn): a heat of corpses standing on one spot for the
 * rest of the mission says nothing. Events go where they happened: a kill or a
 * hit on the victim's place (Event `killed ← killer (weapon, d m)`) and on the
 * killer's (`kill → victim (...)`); a connect where that player is, when the
 * player has a unit then; getting in and out of a vehicle (`getin → Hunter`,
 * written by 3DHeat's own recorder) at the unit. Each shot is a row at its
 * shooter (`fired`, with TargetX/Y/Z where it went, and its Distance). Each
 * marker is an object of its own (`marker`), a row wherever it was put.
 * Events about no one in particular (the mission's end, messages, tickets,
 * counters, a kill whose victim is not in the recording) are rows of the
 * object "Mission", at the middle of everything recorded, with what they say
 * in Text.
 *
 * Columns: Time (s from the start), Frame, X east, Y north, Z (metres),
 * Object (name and id), Side (WEST, EAST, GUER, CIV; a vehicle's is its
 * crew's, or its last crew's when empty, else CIV), Heading (degrees), Vehicle (a vehicle's own
 * name), Type (Infantry, Car, Tank, Helicopter...), Alive (1, 0 dead, 2
 * unconscious), InVehicle, Riding (the vehicle a unit is in), Crew, Group,
 * Role, Player, Shots (fired in that frame), Event, Killer, Victim, Weapon,
 * Distance, Mission, World, Recording, TargetX/Y/Z (where a shot went),
 * Text (a marker's or an event's own text), Color, Shape (a marker's shape,
 * brush and size), GameDate and UTC (the in-game date and the server's clock
 * at that frame, from `times`), TimeMultiplier, Info (the recording's own
 * fields - author, versions, tags... - as JSON).
 *
 * Added to these: Game (Arma 3 or Arma Reforger), Map (the world by the name
 * players know it, `armaWorlds.ts`), Faction (where the recording says it,
 * or a Reforger side's stock faction), Unit (what a vehicle is in words the
 * figures and model packs know: Reforger's catalogue id, an Arma 3 vehicle's
 * real counterpart, `armaUnits.ts`), Won (1 on the side the mission's end
 * names as the winner, 0 on the other fighting sides; empty without a
 * winner), Winner and EndReason (the end message), Date (when the recording
 * began) and Duration (seconds recorded). An Arma 3 vehicle's TurretYaw and
 * GunPitch (degrees, the yaw right of the hull's heading and up from level)
 * are toward where its crew's shots went, at the frames they fired: the
 * recording keeps no turret, but its shots say where the guns pointed (a
 * shot without a height says no pitch). Not an aircraft's (helicopters'
 * door guns fire out of either side).
 *
 * Arma Reforger: OCAP2's recorder for Reforger (github.com/OCAP2/addon-reforger,
 * its receiver's `builder.go`, 2026-02) writes the same layout, with
 * `extensionBuild` "reforger", the world as its world file
 * (`worlds/MP/CTI_Campaign_Eden.ent`), no markers or shots, and positions as
 * the engine has them: [x east, y up, z north]. Read as such, the table's X,
 * Y, Z are east, north and height as for Arma 3, and the hints keep the
 * engine's frame (north is +z, as in the Reforger levels the Reforger
 * extractor writes); the facing is the column Yaw. 3DHeat's own Reforger
 * recorder (exporters/watcher/mods/reforger, `.jsonl`: a header line, then
 * entity, frame and event lines) is read the same way, with its faction keys.
 */

import { GrowableF64 } from './growable';
import { armaWorldOf, isReforgerWorldName } from './armaWorlds';
import { arma3RealVehicle, reforgerFactionOfSide, reforgerUnitId, sideOfFaction, winnerOfText } from './armaUnits';

export interface OcapTable {
  columns: string[];
  /** Per column: numbers (NaN for absent) or strings. */
  data: (Float64Array | string[])[];
  numeric: boolean[];
  rows: number;
  /** The mission's name, or the file's. */
  title: string;
  world: string;
  /** Seconds per frame. */
  captureDelay: number;
  /** Recorded in Arma Reforger: positions in the engine's frame (see the hints). */
  reforger: boolean;
  /** Arma 3 or Arma Reforger. */
  game: string;
  /** The world as players know it (`Everon`, `Altis`). */
  map: string;
}

/** Thrown for a file that is JSON of some other kind, or no JSON at all. */
export class NotOcapError extends Error {}

/**
 * Whether a file name is an OCAP recording: what OCAP writes and what its web
 * player serves, and 3DHeat's own Reforger recorder's `.jsonl` (not the mass
 * analysis's gzipped `3dheat-index.jsonl.gz`).
 */
export function isOcapName(name: string): boolean {
  return /\.json(\.gz)?$/i.test(name) || /\.jsonl$/i.test(name);
}

/** The text of a recording, gunzipped when it is gzip (by its bytes, whatever its name). */
export async function ocapText(file: Blob): Promise<string> {
  const head = new Uint8Array(await file.slice(0, 2).arrayBuffer());
  if (head[0] === 0x1f && head[1] === 0x8b) {
    const stream = file.stream().pipeThrough(new DecompressionStream('gzip'));
    return new Response(stream).text();
  }
  return new TextDecoder('utf-8').decode(new Uint8Array(await file.arrayBuffer()));
}

/** OCAP's vehicle classes as the words the figure matcher knows. */
const TYPE_OF_CLASS: Record<string, string> = {
  unit: 'Infantry',
  man: 'Infantry',
  car: 'Car',
  truck: 'Truck',
  apc: 'APC',
  tank: 'Tank',
  heli: 'Helicopter',
  plane: 'Plane',
  sea: 'Boat',
  parachute: 'Parachute',
  'static-weapon': 'Static weapon',
  'static-mortar': 'Mortar',
};

export type Raw = unknown[];
export interface RawEntity {
  id?: number;
  type?: string;
  name?: string;
  side?: string;
  group?: string;
  role?: string;
  isPlayer?: number | boolean;
  class?: string;
  /** 3DHeat's Reforger recorder: the faction key; its prefab. */
  faction?: string;
  prefab?: string;
  startFrameNum?: number;
  positions?: Raw[];
  framesFired?: Raw[];
}
export interface RawRecording {
  missionName?: string;
  worldName?: string;
  extensionBuild?: string;
  captureDelay?: number;
  endFrame?: number;
  entities?: RawEntity[];
  events?: Raw[];
  times?: { frameNum?: number; systemTimeUTC?: string; date?: string; timeMultiplier?: number; time?: number }[];
  Markers?: Raw[];
}

/** A marker's side, as OCAP numbers it: its value plus one indexes this. */
const MARKER_SIDES = ['GLOBAL', 'EAST', 'WEST', 'GUER', 'CIV'];

/** One entity's state at one frame, decoded from its entry when wanted. */
interface State {
  x: number;
  y: number;
  z: number;
  dir: number;
  alive: number;
  /** Units: 0/1, or a vehicle id. */
  inVehicle: number;
  /** Vehicles: the ids of who is in it. */
  crew: number[];
  name: string;
  isPlayer: number;
  role: string;
  group: string;
  side: string;
  /** The entry kept no height (the original layout's people): a unit riding a vehicle then takes the vehicle's. */
  flat?: boolean;
}

const str = (v: unknown): string => (typeof v === 'string' ? v : v === undefined || v === null ? '' : String(v));
const numOr = (v: unknown, d: number): number => (typeof v === 'number' && Number.isFinite(v) ? v : d);

/**
 * An entity and where its entries stand in time: entry i covers frames
 * from[i]..to[i]. Entries are decoded when read, not kept decoded: a long
 * mission holds millions of them, and the parsed JSON already holds them once.
 */
interface Track {
  e: RawEntity;
  unit: boolean;
  /** Positions as Reforger writes them: [x, up, north]. */
  upY: boolean;
  entries: Raw[];
  from: Int32Array;
  to: Int32Array;
}

function trackOf(e: RawEntity, upY = false): Track {
  const entries = Array.isArray(e.positions) ? e.positions : [];
  const unit = e.type === 'unit';
  const from = new Int32Array(entries.length);
  const to = new Int32Array(entries.length);
  let frame = numOr(e.startFrameNum, 0);
  for (let i = 0; i < entries.length; i++) {
    const r = entries[i];
    // A vehicle's [first, last] frames, when there, are absolute frame numbers.
    const range = !unit && Array.isArray(r) && Array.isArray(r[4]) ? (r[4] as unknown[]) : null;
    from[i] = range ? numOr(range[0], frame) : frame;
    to[i] = Math.max(from[i], range ? numOr(range[1], from[i]) : frame);
    frame = to[i] + 1;
  }
  return { e, unit, upY, entries, from, to };
}

/** Entry i's state; an empty or broken entry repeats the one before. `prev` carries a unit's last name. */
function decode(t: Track, i: number, prev: State | null): State | null {
  let r = t.entries[i];
  // An empty entry repeats the last one that is not.
  while ((!Array.isArray(r) || r.length === 0 || !Array.isArray(r[0])) && i > 0) r = t.entries[--i];
  if (!Array.isArray(r) || !Array.isArray(r[0])) return null;
  const p = r[0] as unknown[];
  const x = numOr(p[0], NaN);
  const y = numOr(p[t.upY ? 2 : 1], NaN);
  if (!Number.isFinite(x) || !Number.isFinite(y)) return null;
  const e = t.e;
  const s: State = {
    x,
    y,
    z: numOr(p[t.upY ? 1 : 2], 0),
    ...(p.length < 3 ? { flat: true } : {}),
    dir: numOr(r[1], 0),
    alive: numOr(r[2], 1),
    inVehicle: 0,
    crew: [],
    name: str(e.name),
    isPlayer: e.isPlayer === true || e.isPlayer === 1 ? 1 : 0,
    role: str(e.role),
    group: str(e.group),
    side: str(e.side),
  };
  if (t.unit) {
    s.inVehicle = numOr(r[3], 0);
    // A name per frame (a unit a player takes over); a blank one keeps the last.
    s.name = str(r[4]) || prev?.name || s.name;
    if (r.length > 5) s.isPlayer = r[5] === true || r[5] === 1 ? 1 : 0;
    if (typeof r[6] === 'string' && r[6]) s.role = r[6];
    if (typeof r[7] === 'string' && r[7]) s.group = r[7];
    if (typeof r[8] === 'string' && r[8]) s.side = r[8];
  } else if (Array.isArray(r[3])) {
    s.crew = (r[3] as unknown[]).filter((c): c is number => typeof c === 'number');
  }
  return s;
}

/** The entry that covers frame f, or -1. */
function entryAt(t: Track, f: number): number {
  let lo = 0;
  let hi = t.from.length - 1;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    if (t.to[mid] < f) lo = mid + 1;
    else if (t.from[mid] > f) hi = mid - 1;
    else return mid;
  }
  return -1;
}

/**
 * An event's kind, the Event column: a word a filter can list (`killed`,
 * `kill`, `hit` on the victim, `hits` on the shooter, `fired`, `marker`,
 * `connected`, `endMission`...), whatever the mission. What it says in full
 * (`killed ← Smith (MX 6.5 mm, 212 m)`) is the Detail column: a long mission
 * has more different ones than a filter can hold.
 */
function shortEvent(e: string): string {
  if (!e) return '';
  if (/^hit\s*→/.test(e)) return 'hits';
  if (/^marker gone/.test(e)) return 'marker gone';
  return /^[A-Za-z_]+/.exec(e)?.[0] ?? e;
}

/** A recording's date from its file name, as OCAP names them: 2026_10_27__23_33_Name.json. */
function dateFromName(name: string): string {
  const m = /^(\d{4})_(\d{2})_(\d{2})__(\d{2})_(\d{2})/.exec(name);
  return m ? `${m[1]}-${m[2]}-${m[3]} ${m[4]}:${m[5]}` : '';
}

interface EventCols {
  event: string;
  killer?: string;
  victim?: string;
  weapon?: string;
  distance?: number;
  target?: [number, number, number];
  text?: string;
  color?: string;
  shape?: string;
  side?: string;
}

/**
 * 3DHeat's own Reforger recorder (exporters/watcher/mods/reforger) as an OCAP
 * recording: its `header` line the mission, its `entity` lines the entities
 * (the faction key kept, its side as OCAP's), its `frame` lines their
 * entries in the engine's [x, up, north] (a unit missing from a frame keeps
 * its last entry), its `event` lines OCAP's events as they are. A line cut
 * short (a crash mid-write) is skipped.
 */
function fromHeat3dReforger(text: string): RawRecording {
  let header: Record<string, unknown> | null = null;
  type Ent = RawEntity & { positions: Raw[]; next: number };
  const ents = new Map<number, Ent>();
  const events: Raw[] = [];
  let endFrame = 0;
  for (const line of text.split('\n')) {
    if (!line.trim()) continue;
    let o: Record<string, unknown>;
    try {
      o = JSON.parse(line) as Record<string, unknown>;
    } catch {
      continue;
    }
    if (o.type === 'header') header = o;
    else if (o.type === 'entity' && typeof o.id === 'number') {
      const vehicle = o.kind === 'vehicle';
      const faction = str(o.faction);
      const start = numOr(o.frame, 0);
      ents.set(o.id, {
        id: o.id, type: vehicle ? 'vehicle' : 'unit', name: str(o.name), side: sideOfFaction(faction) || 'CIV', faction,
        group: o.group === undefined || o.group === null ? '' : String(o.group), role: vehicle ? '' : str(o.prefab),
        isPlayer: numOr(o.playerId, 0) > 0 ? 1 : 0, class: vehicle ? str(o.class) || 'car' : undefined, prefab: str(o.prefab),
        startFrameNum: start, positions: [], next: start,
      });
    } else if (o.type === 'frame') {
      const f = numOr(o.frame, NaN);
      if (!Number.isFinite(f)) continue;
      endFrame = Math.max(endFrame, f);
      for (const u of Array.isArray(o.units) ? (o.units as unknown[][]) : []) {
        // [id, x, up, north, dir, alive, vehicle id or -1, player id or 0]
        const e = Array.isArray(u) ? ents.get(u[0] as number) : undefined;
        if (!e || e.type !== 'unit' || f < e.next) continue;
        const entry: Raw = [[u[1], u[2], u[3]], u[4], u[5], numOr(u[6], -1) >= 0 ? u[6] : 0, e.name, numOr(u[7], 0) > 0 ? 1 : 0];
        if (!e.positions.length) e.startFrameNum = f;
        else for (const last = e.positions[e.positions.length - 1]; e.next < f; e.next++) e.positions.push(last);
        e.positions.push(entry);
        e.next = f + 1;
      }
      for (const v of Array.isArray(o.vehicles) ? (o.vehicles as unknown[][]) : []) {
        // [id, x, up, north, dir, alive, [crew]]: an entry per frame range.
        const e = Array.isArray(v) ? ents.get(v[0] as number) : undefined;
        if (!e || e.type !== 'vehicle' || f < e.next) continue;
        const last = e.positions[e.positions.length - 1];
        if (last) (last[4] as number[])[1] = f - 1;
        e.positions.push([[v[1], v[2], v[3]], v[4], v[5], Array.isArray(v[6]) ? v[6] : [], [f, f]]);
        e.next = f + 1;
      }
    } else if (o.type === 'event' && Array.isArray(o.event)) events.push(o.event as Raw);
    else if (o.type === 'end') endFrame = Math.max(endFrame, numOr(o.frame, 0));
  }
  if (!header || header.format !== 'heat3d-reforger') throw new NotOcapError('no heat3d-reforger header');
  // A vehicle's last state holds to the end.
  for (const e of ents.values()) {
    const last = e.positions[e.positions.length - 1];
    if (e.type === 'vehicle' && last) (last[4] as number[])[1] = Math.max((last[4] as number[])[0], endFrame);
  }
  return {
    missionName: str(header.mission),
    worldName: str(header.worldFile) || str(header.world),
    extensionBuild: 'reforger',
    captureDelay: numOr(header.captureDelay, 1),
    endFrame,
    times: header.startedUtc ? [{ frameNum: 0, systemTimeUTC: str(header.startedUtc) }] : [],
    entities: [...ents.values()].map(({ next: _next, ...e }) => e),
    events,
    Markers: [],
  };
}

/**
 * A recording's document, whichever recorder wrote it, and whether it is
 * Reforger's (its recorder says so, or its world is a world file); throws
 * `NotOcapError` for anything else.
 */
export function readOcapDocument(text: string): { doc: RawRecording; reforger: boolean } {
  let doc: RawRecording;
  if (/^\s*\{\s*"type"\s*:\s*"header"/.test(text.slice(0, 200))) doc = fromHeat3dReforger(text);
  else {
    try {
      doc = JSON.parse(text) as RawRecording;
    } catch {
      throw new NotOcapError('not JSON');
    }
  }
  if (!doc || typeof doc !== 'object' || !Array.isArray(doc.entities) || typeof doc.captureDelay !== 'number') throw new NotOcapError('no entities or captureDelay');
  return { doc, reforger: /reforger/i.test(str(doc.extensionBuild)) || isReforgerWorldName(str(doc.worldName)) };
}

/** An entity's first place and facing: [east, north, height], compass degrees; null when it has none. */
export function firstPlaceOf(e: RawEntity, reforger: boolean): { x: number; y: number; z: number; dir: number; frame: number } | null {
  const t = trackOf(e, reforger);
  for (let i = 0; i < t.entries.length; i++) {
    const s = decode(t, i, null);
    if (s) return { x: s.x, y: s.y, z: s.z, dir: s.dir, frame: t.from[i] };
  }
  return null;
}

/** An entity's path, a place every `step` frames: [frame, east, north, height][]. */
export function pathOf(e: RawEntity, reforger: boolean, step: number): number[][] {
  const t = trackOf(e, reforger);
  const out: number[][] = [];
  let next = -Infinity;
  for (let i = 0; i < t.entries.length; i++) {
    if (t.to[i] < next) continue;
    const s = decode(t, i, null);
    if (!s) continue;
    out.push([Math.max(t.from[i], next), s.x, s.y, s.z]);
    next = Math.max(t.from[i], next) + step;
  }
  return out;
}

/** Parses an OCAP recording into the table. `name` is the file's name without its extension. */
export function parseOcap(text: string, name = 'recording'): OcapTable {
  const { doc, reforger } = readOcapDocument(text);
  const delay = doc.captureDelay! > 0 ? doc.captureDelay! : 1;
  const mission = str(doc.missionName) || name;
  const world = str(doc.worldName);
  const where = armaWorldOf(world, reforger);
  const game = reforger ? 'Arma Reforger' : 'Arma 3';
  const map = where?.name ?? world;
  const times = Array.isArray(doc.times) ? doc.times : [];
  const started = str((times.find((t) => t?.frameNum === 0) ?? times[0])?.systemTimeUTC);
  const date = started ? started.slice(0, 16).replace('T', ' ') : dateFromName(name);
  // Two evenings of the same mission are two sessions.
  const recording = date ? `${mission} (${date})` : mission;

  const tracks = new Map<number, Track>();
  for (const e of doc.entities ?? []) if (e && typeof e === 'object' && typeof e.id === 'number') tracks.set(e.id, trackOf(e, reforger));
  // An entity's label and type word, made once: a long mission has millions of rows of each.
  const labels = new Map<RawEntity, string>();
  const label = (e: RawEntity) => {
    let l = labels.get(e);
    if (l === undefined) {
      l = e.type === 'mission' ? 'Mission' : e.type === 'marker' ? `${str(e.name)} #M${-999 - e.id!}` : `${str(e.name) || str(e.class) || str(e.type)} #${e.id}`;
      labels.set(e, l);
    }
    return l;
  };
  const typeWords = new Map<RawEntity, string>();
  const typeWord = (e: RawEntity, unit: boolean) => {
    let w = typeWords.get(e);
    if (w === undefined) {
      w = e.type === 'marker' ? 'Marker' : e.type === 'mission' ? 'Mission' : (TYPE_OF_CLASS[unit ? 'unit' : str(e.class)] ?? (str(e.class) || 'Vehicle'));
      typeWords.set(e, w);
    }
    return w;
  };
  const stateAt = (id: number, f: number): State | null => {
    const t = tracks.get(id);
    const i = t ? entryAt(t, f) : -1;
    return i >= 0 ? decode(t!, i, null) : null;
  };

  // Who rides in what, from the vehicles' crews: per unit, stretches [from, to, vehicle] in time order.
  const riding = new Map<number, number[][]>();
  for (const t of tracks.values()) {
    if (t.unit) continue;
    for (let i = 0; i < t.entries.length; i++) {
      const r = t.entries[i];
      if (!Array.isArray(r) || !Array.isArray(r[3])) continue;
      for (const c of r[3] as unknown[]) {
        if (typeof c !== 'number') continue;
        let list = riding.get(c);
        if (!list) riding.set(c, (list = []));
        const last = list[list.length - 1];
        // Frames on end in the same vehicle are one stretch.
        if (last && last[2] === t.e.id && last[1] === t.from[i] - 1) last[1] = t.to[i];
        else list.push([t.from[i], t.to[i], t.e.id!]);
      }
    }
  }
  for (const list of riding.values()) list.sort((a, b) => a[0] - b[0]);

  // Who won: the side the mission's end names, else the one its message does.
  let winner = '';
  let endText = '';
  for (const ev of Array.isArray(doc.events) ? doc.events : []) {
    if (!Array.isArray(ev) || ev[1] !== 'endMission') continue;
    const d = Array.isArray(ev[2]) ? (ev[2] as unknown[]) : ev.slice(2);
    endText = str(d[1]) || endText;
    winner = sideOfFaction(str(d[0])) || winnerOfText(endText) || winner;
  }
  const FIGHTING = new Set(['WEST', 'EAST', 'GUER']);
  if (winner) FIGHTING.add(winner);
  const duration = numOr(doc.endFrame, 0) * delay;

  const shots = new Map<number, Map<number, number>>();
  for (const t of tracks.values()) {
    const fired = t.e.framesFired;
    if (!Array.isArray(fired) || !fired.length) continue;
    const m = new Map<number, number>();
    for (const ff of fired) if (Array.isArray(ff) && typeof ff[0] === 'number') m.set(ff[0], (m.get(ff[0]) ?? 0) + 1);
    shots.set(t.e.id!, m);
  }

  const TIME = new GrowableF64();
  const FRAME = new GrowableF64();
  const X = new GrowableF64();
  const Y = new GrowableF64();
  const Z = new GrowableF64();
  const HEAD = new GrowableF64();
  const ALIVE = new GrowableF64();
  const INVEH = new GrowableF64();
  const CREW = new GrowableF64();
  const PLAYER = new GrowableF64();
  const SHOTS = new GrowableF64();
  const DIST = new GrowableF64();
  const TX = new GrowableF64();
  const TY = new GrowableF64();
  const TZ = new GrowableF64();
  const MULT = new GrowableF64();
  const WON = new GrowableF64();
  const YAW = reforger ? new GrowableF64() : null;
  const TYAW = new GrowableF64();
  const GPITCH = new GrowableF64();
  const S = { Object: [] as string[], Side: [] as string[], Vehicle: [] as string[], Type: [] as string[], Riding: [] as string[], Group: [] as string[], Role: [] as string[], Event: [] as string[], Killer: [] as string[], Victim: [] as string[], Weapon: [] as string[], Text: [] as string[], Color: [] as string[], Shape: [] as string[], GameDate: [] as string[], UTC: [] as string[], Faction: [] as string[], Unit: [] as string[], Detail: [] as string[] };
  // What each vehicle is, worked out once.
  const unitOf = new Map<number, string>();
  const unitWord = (e: RawEntity): string => {
    let u = unitOf.get(e.id!);
    if (u === undefined) {
      u = e.type !== 'vehicle' ? '' : reforger ? reforgerUnitId(str(e.prefab)) || reforgerUnitId(str(e.name)) : arma3RealVehicle(str(e.name), str(e.class));
      unitOf.set(e.id!, u);
    }
    return u;
  };
  // The clock entries in frame order: each row gets the last one by its frame.
  const clock = times.filter((c) => c && typeof c.frameNum === 'number').sort((a, b) => a.frameNum! - b.frameNum!);
  const clockAt = (f: number) => {
    let lo = 0;
    let hi = clock.length - 1;
    let k = -1;
    while (lo <= hi) {
      const mid = (lo + hi) >> 1;
      if (clock[mid].frameNum! <= f) {
        k = mid;
        lo = mid + 1;
      } else hi = mid - 1;
    }
    return k >= 0 ? clock[k] : null;
  };
  // Where everything was, for placing what happened nowhere in particular.
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;

  /** The vehicle a unit sits in at frame f: from the crews, else the id newer recorders write in place of the flag. */
  const vehicleOf = (id: number, f: number, s: State): RawEntity | null => {
    for (const [from, to, v] of riding.get(id) ?? []) {
      if (from > f) break;
      if (to >= f) return tracks.get(v)?.e ?? null;
    }
    if (s.inVehicle > 1 || (s.inVehicle === 1 && tracks.get(1)?.unit === false)) {
      const v = tracks.get(s.inVehicle);
      if (v && !v.unit) return v.e;
    }
    return null;
  };

  /**
   * A vehicle is on the side of who is in it, an empty one on the side of who
   * left it, and one nobody has used yet civilian, as OCAP's own player has it.
   */
  const lastSide = new Map<number, string>();
  const sideOf = (t: Track, f: number, s: State): string => {
    if (t.unit || t.e.type === 'marker' || t.e.type === 'mission') return s.side;
    for (const c of s.crew) {
      const cs = stateAt(c, f);
      if (cs?.side) {
        lastSide.set(t.e.id!, cs.side);
        return cs.side;
      }
    }
    return lastSide.get(t.e.id!) ?? (str(t.e.side) || 'CIV');
  };

  // Where each Arma 3 vehicle's crew shot, per frame: what its turret and gun pointed at (the last shot of a frame).
  // Not an aircraft's: its pilot's guns and rockets point where it flies, its door gunners out of either side.
  const aims = new Map<number, Map<number, number[]>>();
  if (!reforger)
    for (const t of tracks.values()) {
      const fired = t.e.framesFired;
      if (!t.unit || !Array.isArray(fired)) continue;
      for (const ff of fired) {
        if (!Array.isArray(ff) || typeof ff[0] !== 'number' || !Array.isArray(ff[1])) continue;
        const s = stateAt(t.e.id!, ff[0]);
        const v = s ? vehicleOf(t.e.id!, ff[0], s) : null;
        if (!v || /heli|plane|parachute/i.test(str(v.class))) continue;
        const p = ff[1] as unknown[];
        let m = aims.get(v.id!);
        if (!m) aims.set(v.id!, (m = new Map()));
        m.set(ff[0], [numOr(p[0], NaN), numOr(p[1], NaN), numOr(p[2], NaN)]);
      }
    }

  const push = (t: Track, f: number, s: State, ev?: EventCols) => {
    if (ev?.side !== undefined) s = { ...s, side: ev.side };
    const e = t.e;
    const v = t.unit ? vehicleOf(e.id!, f, s) : null;
    TIME.push(f * delay);
    FRAME.push(f);
    X.push(s.x);
    Y.push(s.y);
    // A rider with no height of its own (the original layout) is as high as its vehicle: a helicopter's crew in it.
    Z.push(v && s.flat ? (stateAt(v.id!, f)?.z ?? s.z) : s.z);
    HEAD.push(s.dir);
    ALIVE.push(s.alive);
    INVEH.push(t.unit ? (v || s.inVehicle ? 1 : 0) : NaN);
    CREW.push(t.unit ? NaN : s.crew.length);
    PLAYER.push(t.unit ? s.isPlayer : NaN);
    SHOTS.push(ev ? NaN : (shots.get(e.id!)?.get(f) ?? 0));
    DIST.push(ev?.distance ?? NaN);
    S.Object.push(label(e));
    const side = sideOf(t, f, s);
    S.Side.push(side);
    S.Faction.push(t.unit || e.type === 'vehicle' ? str(e.faction) || (reforger ? reforgerFactionOfSide(side) : '') : '');
    S.Unit.push(unitWord(e));
    WON.push(winner && FIGHTING.has(side) && e.type !== 'mission' && e.type !== 'marker' ? (side === winner ? 1 : 0) : NaN);
    YAW?.push(180 - s.dir);
    // The turret toward the crew's shot of this frame: its bearing less the hull's heading, its rise over the distance.
    const aim = !t.unit && !ev ? aims.get(e.id!)?.get(f) : undefined;
    if (aim && Number.isFinite(aim[0]) && Number.isFinite(aim[1])) {
      const dx = aim[0] - s.x;
      const dy = aim[1] - s.y;
      let yaw = ((Math.atan2(dx, dy) * 180) / Math.PI - s.dir) % 360;
      if (yaw > 180) yaw -= 360;
      if (yaw <= -180) yaw += 360;
      TYAW.push(yaw);
      GPITCH.push(Number.isFinite(aim[2]) ? (Math.atan2(aim[2] - s.z, Math.hypot(dx, dy)) * 180) / Math.PI : NaN);
    } else {
      TYAW.push(NaN);
      GPITCH.push(NaN);
    }
    // A marker's text or the mission names no vehicle (a marker "A2-1 Tigris" is no tank to draw).
    S.Vehicle.push(t.unit || e.type === 'marker' || e.type === 'mission' ? '' : str(e.name));
    S.Type.push(typeWord(e, t.unit));
    S.Riding.push(v ? str(v.name) : '');
    S.Group.push(t.unit ? s.group : '');
    S.Role.push(t.unit ? s.role : '');
    S.Event.push(ev ? shortEvent(ev.event) : '');
    S.Detail.push(ev?.event ?? '');
    S.Killer.push(ev?.killer ?? '');
    S.Victim.push(ev?.victim ?? '');
    S.Weapon.push(ev?.weapon ?? '');
    TX.push(ev?.target ? ev.target[0] : NaN);
    TY.push(ev?.target ? ev.target[1] : NaN);
    TZ.push(ev?.target ? ev.target[2] : NaN);
    S.Text.push(ev?.text ?? '');
    S.Color.push(ev?.color ?? '');
    S.Shape.push(ev?.shape ?? '');
    const c = clockAt(f);
    S.GameDate.push(str(c?.date));
    S.UTC.push(str(c?.systemTimeUTC));
    MULT.push(numOr(c?.timeMultiplier, NaN));
    if (s.x < minX) minX = s.x;
    if (s.x > maxX) maxX = s.x;
    if (s.y < minY) minY = s.y;
    if (s.y > maxY) maxY = s.y;
  };

  // Every frame of every entity; the dead once, where they died.
  for (const t of tracks.values()) {
    let prev: State | null = null;
    let dead = false;
    for (let i = 0; i < t.entries.length; i++) {
      const s = decode(t, i, prev);
      if (!s) continue;
      prev = s;
      for (let f = t.from[i]; f <= t.to[i]; f++) {
        if (s.alive === 0) {
          if (dead) break;
          dead = true;
        } else dead = false;
        push(t, f, s);
      }
    }
  }

  // Every shot, at its shooter, with where it went.
  for (const t of tracks.values()) {
    const fired = t.e.framesFired;
    if (!Array.isArray(fired)) continue;
    for (const ff of fired) {
      if (!Array.isArray(ff) || typeof ff[0] !== 'number' || !Array.isArray(ff[1])) continue;
      const f = ff[0];
      const p = ff[1] as unknown[];
      const s = stateAt(t.e.id!, f);
      const tx = numOr(p[0], NaN);
      const ty = numOr(p[1], NaN);
      if (!s || !Number.isFinite(tx) || !Number.isFinite(ty)) continue;
      const tz = numOr(p[2], s.z);
      const d = Math.hypot(tx - s.x, ty - s.y, tz - s.z);
      push(t, f, s, { event: `fired (${Math.round(d)} m)`, target: [tx, ty, tz], distance: d });
    }
  }

  // The map's markers: each its own object, a row wherever it was put. One put far off the map (more than 5 km
  // beyond everything that moved: a line's stray point, a marker parked off the edge) is left out, as it would
  // stretch the view's extent over empty kilometres.
  const markers = Array.isArray(doc.Markers) ? doc.Markers : [];
  const OFF = 5000;
  const seen = Number.isFinite(minX);
  const [x0, x1, y0, y1] = [minX - OFF, maxX + OFF, minY - OFF, maxY + OFF];
  markers.forEach((m, k) => {
    if (!Array.isArray(m) || m.length < 8 || !Array.isArray(m[7])) return;
    const type = str(m[0]);
    const text = str(m[1]);
    const last = numOr(m[3], -1);
    const side = MARKER_SIDES[numOr(m[6], -1) + 1] ?? 'GLOBAL';
    const size = Array.isArray(m[8]) ? (m[8] as unknown[]).map((v) => str(v)).join('x') : '';
    const shape = [str(m[9]), str(m[10]), size].filter(Boolean).join(' ');
    const e: RawEntity = { id: -1000 - k, type: 'marker', name: text ? `marker ${text}` : `marker ${type}`, side };
    const track: Track = { e, unit: false, upY: false, entries: [], from: new Int32Array(0), to: new Int32Array(0) };
    let placed = false;
    let at: State | null = null;
    (m[7] as unknown[]).forEach((pos) => {
      if (!Array.isArray(pos) || typeof pos[0] !== 'number' || !Array.isArray(pos[1])) return;
      const p = pos[1] as unknown[];
      const x = numOr(p[0], NaN);
      const y = numOr(p[1], NaN);
      if (!Number.isFinite(x) || !Number.isFinite(y)) return;
      if (seen && (x < x0 || x > x1 || y < y0 || y > y1)) return;
      at = { x, y, z: numOr(p[2], 0), dir: numOr(pos[2], 0), alive: 1, inVehicle: 0, crew: [], name: e.name!, isPlayer: 0, role: '', group: '', side };
      const first = !placed;
      placed = true;
      push(track, pos[0], at, { event: first ? `marker ${type}${text ? `: ${text}` : ''}` : '', text, color: str(m[5]), shape, side });
    });
    if (at && last >= 0) push(track, last, at, { event: `marker gone${text ? `: ${text}` : ''}`, text, color: str(m[5]), shape, side });
  });

  // What happened nowhere in particular is the mission's, at the middle of everything recorded.
  const missionTrack: Track = { e: { id: -1, type: 'mission', name: 'Mission', side: '' }, unit: false, upY: false, entries: [], from: new Int32Array(0), to: new Int32Array(0) };
  const pending: [number, EventCols][] = [];
  const nowhere = (f: number, ev: EventCols) => pending.push([f, ev]);

  // Events where they happened.
  const units = [...tracks.values()].filter((t) => t.unit);
  const unitNamed = (who: string, f: number): [Track, State] | null => {
    if (!who) return null;
    for (const t of units) {
      const s = stateAt(t.e.id!, f);
      if (s && (s.name === who || str(t.e.name) === who)) return [t, s];
    }
    return null;
  };
  const nameAt = (t: Track | undefined, f: number) => (t ? stateAt(t.e.id!, f)?.name || str(t.e.name) : '');
  for (const ev of Array.isArray(doc.events) ? doc.events : []) {
    if (!Array.isArray(ev) || typeof ev[0] !== 'number' || typeof ev[1] !== 'string') continue;
    const f = ev[0];
    const kind = ev[1];
    if (kind === 'killed' || kind === 'hit') {
      const victim = typeof ev[2] === 'number' ? tracks.get(ev[2]) : undefined;
      // [killer, weapon]; ["null"] when nobody did it.
      const by = Array.isArray(ev[3]) ? (ev[3] as unknown[]) : [];
      const killer = typeof by[0] === 'number' ? tracks.get(by[0]) : undefined;
      const weapon = str(by[1]);
      const d = numOr(ev[4], NaN);
      const distance = d >= 0 ? d : NaN;
      const vName = nameAt(victim, f);
      const kName = killer && killer !== victim ? nameAt(killer, f) : '';
      const how = [weapon, Number.isFinite(distance) ? `${Math.round(distance)} m` : ''].filter(Boolean).join(', ');
      const tail = how ? ` (${how})` : '';
      const cols = { killer: kName, victim: vName, weapon, distance };
      const vs = victim ? (stateAt(victim.e.id!, f) ?? stateAt(victim.e.id!, f - 1)) : null;
      if (victim && vs) push(victim, f, vs, { event: `${kind}${kName ? ` ← ${kName}` : ''}${tail}`, ...cols });
      const ks = killer && killer !== victim ? stateAt(killer.e.id!, f) : null;
      if (killer && ks) push(killer, f, ks, { event: `${kind === 'killed' ? 'kill' : 'hit'} → ${vName || '?'}${tail}`, ...cols });
      if (!(victim && vs) && !(killer && ks)) nowhere(f, { event: `${kind}${tail}`, ...cols, text: JSON.stringify(ev.slice(2)) });
    } else if (kind === 'connected' || kind === 'disconnected') {
      const who = str(ev[2]);
      // A player connects before their unit exists, and leaves after it is gone: the next or last frame will do.
      const hit = unitNamed(who, f) ?? unitNamed(who, kind === 'connected' ? f + 1 : f - 1);
      if (hit) push(hit[0], f, hit[1], { event: `${kind}: ${who}` });
      else nowhere(f, { event: `${kind}: ${who}`, text: who });
    } else if (kind === 'getin' || kind === 'getout') {
      // 3DHeat's own recorder (exporters/watcher/mods/arma3): [f, "getin" | "getout", unit, vehicle].
      const u = typeof ev[2] === 'number' ? tracks.get(ev[2]) : undefined;
      const v = typeof ev[3] === 'number' ? tracks.get(ev[3]) : undefined;
      const s = u ? (stateAt(u.e.id!, f) ?? stateAt(u.e.id!, f - 1)) : null;
      if (u && s) push(u, f, s, { event: `${kind} ${kind === 'getin' ? '→' : '←'} ${v ? str(v.e.name) || '?' : '?'}` });
    } else if (kind === 'captured' || kind === 'contested' || kind === 'capturedFlag' || kind === 'terminalHackStarted' || kind === 'terminalHackCanceled') {
      const data = Array.isArray(ev[2]) ? (ev[2] as unknown[]) : [];
      const named = kind === 'captured' || kind === 'contested';
      const who = str(named ? data[1] : data[0]);
      const what = named ? str(data[0]) : '';
      const hit = unitNamed(who, f);
      if (hit) push(hit[0], f, hit[1], { event: `${kind}${what ? ` ${what}` : ''}: ${who}` });
      else nowhere(f, { event: `${kind}${what ? ` ${what}` : ''}: ${who}`, text: JSON.stringify(data) });
    } else {
      // The mission's end, messages, tickets, counters, snapshots: what they say, as they say it.
      const data = ev.slice(2);
      const said = data.length === 1 && typeof data[0] === 'string' ? data[0] : JSON.stringify(data.length === 1 ? data[0] : data);
      const named = kind === 'endMission' && Array.isArray(data[0]) ? str((data[0] as unknown[])[0]) : '';
      // A faction key (3DHeat's Reforger recorder) as its side.
      const side = sideOfFaction(named) || named;
      const text = kind === 'endMission' && Array.isArray(data[0]) ? str((data[0] as unknown[])[1]) : said;
      nowhere(f, { event: `${kind}: ${text}`, text: said, side });
    }
  }
  if (pending.length) {
    const cx = Number.isFinite(minX) ? (minX + maxX) / 2 : 0;
    const cy = Number.isFinite(minY) ? (minY + maxY) / 2 : 0;
    const at: State = { x: cx, y: cy, z: 0, dir: 0, alive: 1, inVehicle: 0, crew: [], name: 'Mission', isPlayer: 0, role: '', group: '', side: '' };
    for (const [f, ev] of pending) push(missionTrack, f, at, ev);
  }

  const n = TIME.length;
  const fill = (v: string) => new Array<string>(n).fill(v);
  // The recording's own fields, but for what the table already holds row by row.
  const own: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(doc as Record<string, unknown>)) if (!['entities', 'events', 'Markers', 'times'].includes(k)) own[k] = v;
  const columns = ['Time', 'Frame', 'X', 'Y', 'Z', 'Object', 'Side', 'Heading', 'Vehicle', 'Type', 'Alive', 'InVehicle', 'Riding', 'Crew', 'Group', 'Role', 'Player', 'Shots', 'Event', 'Killer', 'Victim', 'Weapon', 'Distance', 'Mission', 'World', 'Recording', 'TargetX', 'TargetY', 'TargetZ', 'Text', 'Color', 'Shape', 'GameDate', 'UTC', 'TimeMultiplier', 'Info', 'Game', 'Map', 'Faction', 'Unit', 'Won', 'Winner', 'EndReason', 'Date', 'Duration', 'Detail', 'TurretYaw', 'GunPitch', ...(YAW ? ['Yaw'] : [])];
  const data: (Float64Array | string[])[] = [
    TIME.finish(), FRAME.finish(), X.finish(), Y.finish(), Z.finish(), S.Object, S.Side, HEAD.finish(), S.Vehicle, S.Type,
    ALIVE.finish(), INVEH.finish(), S.Riding, CREW.finish(), S.Group, S.Role, PLAYER.finish(), SHOTS.finish(),
    S.Event, S.Killer, S.Victim, S.Weapon, DIST.finish(), fill(mission), fill(world), fill(recording),
    TX.finish(), TY.finish(), TZ.finish(), S.Text, S.Color, S.Shape, S.GameDate, S.UTC, MULT.finish(), fill(JSON.stringify(own)),
    fill(game), fill(map), S.Faction, S.Unit, WON.finish(), fill(winner), fill(endText), fill(date), new Float64Array(n).fill(duration), S.Detail,
    TYAW.finish(), GPITCH.finish(),
    ...(YAW ? [YAW.finish()] : []),
  ];
  return { columns, data, numeric: data.map((d) => d instanceof Float64Array), rows: n, title: mission, world, captureDelay: delay, reforger, game, map };
}

/**
 * How the viewer reads the table: Arma's map, height up, headings as compass
 * bearings. An Arma 3 recording's north is the world's -Z, so a heading of 0
 * looks north, as for ACMI. A Reforger recording keeps the engine's frame
 * (north +Z), the frame of the Reforger levels, and faces by Yaw (the bearing
 * turned into that frame); like those levels it shows mirrored unless the
 * view's world axis is inverted.
 */
export function ocapHints(t?: Pick<OcapTable, 'reforger'>): {
  axes: { up: 'z'; flipY: boolean };
  columns: Record<string, unknown>;
} {
  const reforger = !!t?.reforger;
  return {
    axes: { up: 'z', flipY: !reforger },
    columns: {
      x: 'X',
      y: 'Y',
      z: 'Z',
      time: 'Time',
      timeUnit: 'seconds',
      personId: 'Object',
      teamId: 'Side',
      sessionId: 'Recording',
      lookMode: 'yawPitch',
      yaw: reforger ? 'Yaw' : 'Heading',
      angleUnit: 'degrees',
      // Unit before Vehicle: the figures take the first name they know. Date, Duration and EndReason, the same on
      // every row of a recording, stay in the table for the mapping step and the mass analysis.
      extra: ['Unit', 'Vehicle', 'Type', 'Game', 'Map', 'Faction', 'Won', 'Winner', 'Event', 'Alive', 'InVehicle', 'Riding', 'Group', 'Role', 'Player', 'Shots', 'Killer', 'Victim', 'Weapon', 'Distance', 'Crew', 'Mission', 'World', 'Frame', 'TargetX', 'TargetY', 'TargetZ', 'Text', 'Color', 'Shape', 'GameDate', 'TimeMultiplier', 'TurretYaw', 'GunPitch'],
    },
  };
}
