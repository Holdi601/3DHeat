#!/usr/bin/env node
/**
 * Tacview ACMI recordings (.acmi, .zip.acmi, .txt.acmi) to Parquet, a whole
 * folder at a time, for the many-match overlay: one Parquet file per
 * recording, the folder tree kept, so a map or a scenario loads as one folder.
 *
 *   node tools/acmi-to-parquet.mjs <in-folder> <out-folder> [--jobs N] [--theatre Id] [--server Name] [--rounds file.json ...] [--force] [--loose]
 *
 * Each recording is read twice as a stream (`src/data/acmiStream.ts`, the
 * same reading as the viewer's own ACMI loader): first for its properties
 * and where it is, then for the rows. Nothing of the file is left out:
 *
 *   <name>.parquet         every row at a real place - each position, and each
 *                          event or removal at the object it names - with the
 *                          columns of the viewer's ACMI table and a column for
 *                          every property the recording carries; object by
 *                          object, each object's rows in time order. `Actor`
 *                          (player or ai) and `Launcher` (a weapon's: the unit
 *                          nearest where it appeared) are worked out here
 *   <name>.effects.parquet the same for shells, bullets, shrapnel, flares and
 *                          chaff (`EFFECT`): millions of objects a server
 *                          evening, kept apart so a folder loads its units
 *                          The events the recording leaves unsaid - launch,
 *                          gun burst, hit, miss, damage, kill, death, crash,
 *                          take-off, landing, touch and go, stop, rearm,
 *                          ejection, spawn - are worked out as Tacview's
 *                          debriefing does (`src/data/acmiEvents.ts`), each a
 *                          row of its own at its object (`Inferred`), with
 *                          Shooter, Target, Weapon, OtherVehicle, OtherType,
 *                          Airfield, Detail and Rounds
 *                          An airfield or FARP that changes sides where the
 *                          recording shows it is a `capture` row at the pad
 *                          (Detail "Red to Blue", Airfield its name)
 *   <name>.events.parquet  the rows at no place: comments, events about no
 *                          object seen, objects that never got a position, and
 *                          a row each time the recording's own properties
 *                          change (RecordingInfo, as JSON)
 *
 * Every row says where the recording comes from and who won
 * (`src/data/dcsOutcome.ts`, docs/data-formats.md#outcome-columns): `server`
 * (by the header's Title, Author and Comments, or --server) and `mission`;
 * `round`, `won`, `matchWon` and `roundEndReason` from a rounds file
 * (--rounds, format heat3d-dcs-rounds: a server's campaigns, who won each,
 * and where that was read), empty where none says - a server's recording
 * shows no winner; and on an aircraft's rows its `sortie` (1, 2, ... from
 * take-off to take-off), how it ended (`sortieResult`: landed, landed
 * damaged, ejected, shot down, destroyed, crashed, despawned, airborne at
 * end, no takeoff) and its kills (`sortieKills`). A round spans many
 * sessions (recordings): `campaign` names it, `session` and `sessionStart`
 * place this one in it, `heldRed`/`heldBlue` count the places each side held
 * at its start, and the places taken since the session before are `capture`
 * rows at the start marked between missions (a chained rounds file, made by
 * `dcs-campaign-rounds.mjs`, says them). The `acmi` footer's
 * `outcome` holds the server, its rounds, the result with its source, the
 * captures and the sorties by how they ended.
 *
 * Positions are east and north metres (X, Y) on the plane touching the earth
 * at the origin of the theatre the recording is in (`src/world/theatres.ts`,
 * picked from where its positions lie, or named with --theatre), so every
 * recording of one map shares one plane with that theatre's world backdrop.
 * A recording on no known theatre keeps its own reference. The `heat3d`
 * footer says how to read the file; the `acmi` footer holds the recording's
 * properties, its theatre and the count of its lines by kind.
 *
 * The files of a recording are then packed into one, `<name>.3dheat`
 * (docs/container.md, read back whole before the loose files go); --loose
 * keeps them as separate files.
 *
 * A file already converted (output newer than the recording) is skipped
 * unless --force. Outputs are written under a temporary name and renamed when
 * whole, so a stopped run leaves no half file.
 */

import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';
import { Worker, isMainThread, parentPort, workerData } from 'node:worker_threads';
import { describe, verifyContainer, writeContainer } from './container.mjs';
import { readText } from './acmi-read.mjs';

const SELF = fileURLToPath(import.meta.url);
const ROOT = path.resolve(path.dirname(SELF), '..');
/** Rows a row group. */
const GROUP_ROWS = 250_000;
/**
 * What a DCS server writes by the million and nobody flies: shells, bullets,
 * shrapnel, flares and chaff (four objects in five, a third of the rows).
 * They go to their own file beside the recording's, so the many-match overlay
 * reads the units of a folder and these only when asked.
 */
const EFFECT = /(^|\+)(Shell|Bullet|Shrapnel|Decoy|Flare|Chaff)(\+|$)/i;

function stemOf(name) {
  return name.replace(/\.(zip|txt)\.acmi$/i, '').replace(/\.acmi$/i, '');
}

/** What a weapon is by its Tacview type (a decoy is not one: it is dropped, not aimed). */
const WEAPON = /(^|\+)(Weapon|Missile|Rocket|Bomb|Torpedo|Projectile|Shell|Bullet|Grenade)(\+|$)/i;
/** What is no one's: decoys, debris, map objects. */
const NO_ONE = /Decoy|Flare|Chaff|Shrapnel|Debris|Container|Bullseye|Navaid|Waypoint|Misc|Aerodrome|FARP/i;
/** How far (m) and how long (s) from a weapon's first sample its launcher may have been. */
const LAUNCH_REACH_M = 1500;
const LAUNCH_WINDOW_S = 3;
/** How near (m) a unit not sampled within the window must be. */
const STILL_REACH_M = 400;
const CELL_M = 2000;

/**
 * Player or AI for every row, and a weapon's launcher: Tacview names neither.
 * A DCS AI's pilot is its group's name with a number ("Senaki-patrol-Cap-01")
 * or its own name; a player's is the player's. A weapon is given to the unit
 * nearest where it appeared, within a few seconds and 1.5 km (each unit's
 * last place kept in 2 km cells), and is that unit's player or AI.
 */
class Launchers {
  constructor() {
    /** id -> { x, y, alt, t, label, actor, cell } of the units seen. */
    this.units = new Map();
    this.cells = new Map();
    /** weapon id -> { launcher, actor } */
    this.weapons = new Map();
  }

  static actorOf(p) {
    const pilot = (p.get('Pilot') ?? '').trim();
    if (!pilot) return 'ai';
    // Ships and fixed objects are the mission's, whatever their pilot field says ("Blue Stennis").
    if (/(^|\+)(Sea|Watercraft|Static|Building|Bullseye)(\+|$)/i.test(p.get('Type') ?? '')) return 'ai';
    const g = (p.get('Group') ?? '').trim().toLowerCase();
    const pl = pilot.toLowerCase();
    if ((g && pl.startsWith(g)) || pl === (p.get('Name') ?? '').trim().toLowerCase()) return 'ai';
    return 'player';
  }

  row(row, p, label, x, y, t) {
    if (!row.id) return { actor: '', launcher: '', id: null };
    const type = p.get('Type') ?? '';
    if (WEAPON.test(type)) {
      let w = this.weapons.get(row.id);
      if (!w) {
        w = this.nearest(x, y, row.alt, t) ?? { launcher: '', actor: '', id: null };
        this.weapons.set(row.id, w);
      }
      if (row.event === 'Removed') this.weapons.delete(row.id);
      return w;
    }
    const actor = NO_ONE.test(type) ? '' : Launchers.actorOf(p);
    if (row.event === 'Removed') this.forget(row.id);
    else if (actor && Number.isFinite(x) && Number.isFinite(y)) this.place(row.id, { id: row.id, x, y, alt: Number.isFinite(row.alt) ? row.alt : 0, t, label, actor });
    return { actor, launcher: '', id: null };
  }

  place(id, u) {
    const cell = `${Math.floor(u.x / CELL_M)},${Math.floor(u.y / CELL_M)}`;
    const old = this.units.get(id);
    if (old && old.cell !== cell) this.cells.get(old.cell)?.delete(id);
    if (!old || old.cell !== cell) {
      let c = this.cells.get(cell);
      if (!c) this.cells.set(cell, (c = new Set()));
      c.add(id);
    }
    u.cell = cell;
    this.units.set(id, u);
  }

  forget(id) {
    const old = this.units.get(id);
    if (old) this.cells.get(old.cell)?.delete(id);
    this.units.delete(id);
  }

  nearest(x, y, alt, t) {
    if (!Number.isFinite(x) || !Number.isFinite(y)) return null;
    const cx = Math.floor(x / CELL_M);
    const cy = Math.floor(y / CELL_M);
    let best = null;
    let score = Infinity;
    for (let i = -1; i <= 1; i++)
      for (let j = -1; j <= 1; j++)
        for (const id of this.cells.get(`${cx + i},${cy + j}`) ?? []) {
          const u = this.units.get(id);
          if (!u) continue;
          const d = Math.hypot(u.x - x, u.y - y, u.alt - (Number.isFinite(alt) ? alt : u.alt));
          const dt = Math.abs(t - u.t);
          // A unit not sampled lately stands where it was (a SAM launcher is written once): only close by.
          if (d > (dt > LAUNCH_WINDOW_S ? STILL_REACH_M : LAUNCH_REACH_M)) continue;
          // Nearer in time counts as nearer in place: a fast aircraft's samples are far apart.
          const s = d + Math.min(dt, LAUNCH_WINDOW_S * 10) * 100;
          if (s < score) {
            score = s;
            best = u;
          }
        }
    return best ? { launcher: best.label, actor: best.actor, id: best.id } : null;
  }
}

// ---------------------------------------------------------------------------
// One recording, in a worker.

async function convert(job, theatres) {
  const { AcmiStreamReader, acmiObjectLabel, tangentPlane } = await import(new URL('../src/data/acmiStream.ts', import.meta.url).href);
  const { AcmiEventFinder } = await import(new URL('../src/data/acmiEvents.ts', import.meta.url).href);
  const { AcmiSorties, DcsRounds, PadOwners, dcsServer, roundAt, wonIn } = await import(new URL('../src/data/dcsOutcome.ts', import.meta.url).href);
  const t0 = performance.now();
  const name = stemOf(path.basename(job.input));

  // Pass 1: the properties and where the recording is.
  const lats = [];
  const lons = [];
  let placed = 0;
  const r1 = new AcmiStreamReader((row) => {
    if (!row.placed) return;
    if (placed++ % 64 === 0 && lats.length < 50_000) {
      lats.push(row.lat);
      lons.push(row.lon);
    }
  }, name);
  await readText(job.input, (s) => r1.push(s));
  r1.end();
  const median = (a) => {
    const s = Float64Array.from(a).sort();
    return s.length ? s[s.length >> 1] : NaN;
  };
  const mLat = median(lats);
  const mLon = median(lons);
  const area = (t) => (t.box.north - t.box.south) * (t.box.east - t.box.west);
  // The game that wrote the recording narrows the theatres: a DCS Caucasus recording near Krasnodar is not on IL-2's Kuban.
  const source = r1.globals.DataSource ?? '';
  const game = /DCS/i.test(source) ? 'dcs' : /IL-?2/i.test(source) ? 'il2' : null;
  const theatre = job.theatre
    ? theatres.find((t) => t.id === job.theatre)
    : theatres
        .filter((t) => (!game || t.game === game) && mLat >= t.box.south && mLat <= t.box.north && mLon >= t.box.west && mLon <= t.box.east)
        .sort((a, b) => area(a) - area(b))[0];
  const origin = theatre ? theatre.origin : { lat: r1.refLat, lon: r1.refLon };
  const project = tangentPlane(origin.lat, origin.lon);

  // The server and its rounds (`src/data/dcsOutcome.ts`): the header names the server, a rounds file who won.
  // A row's time is the mission's clock (ReferenceTime + t); the rounds are the real one, from RecordingTime.
  const srv = dcsServer(r1.globals, job.server ?? '');
  const recUnix = r1.globals.RecordingTime ? Date.parse(r1.globals.RecordingTime) / 1000 : NaN;
  const { rounds, source: roundsSource } = Number.isFinite(recUnix)
    ? new DcsRounds(job.rounds ?? []).forRecording(srv.server, r1.globals.Title ?? '', recUnix, recUnix + Math.max(0, r1.lastTime ?? 0))
    : { rounds: [], source: null };
  // The round this recording (session) began in: its place in it, who held what at its start, what was taken before.
  const startRound = Number.isFinite(recUnix) ? roundAt(rounds, recUnix) : null;

  // The columns: the viewer's ACMI table, then every property.
  const EVENT_TEXT = ['Shooter', 'Target', 'Weapon', 'OtherVehicle', 'OtherType', 'Airfield', 'Detail', 'Inferred'];
  // Who won (docs/data-formats.md#outcome-columns) and each aircraft's sortie.
  // A campaign round spans many sessions (recordings): `campaign` names it, `session` is this one's place in it.
  const OUTCOME_NUM = ['round', 'session', 'sessionStart', 'heldRed', 'heldBlue', 'won', 'matchWon', 'sortie', 'sortieKills'];
  const OUTCOME_TEXT = ['server', 'mission', 'campaign', 'roundEndReason', 'sortieResult'];
  const OUTCOME = ['server', 'mission', 'campaign', 'round', 'session', 'sessionStart', 'heldRed', 'heldBlue', 'won', 'matchWon', 'roundEndReason', 'sortie', 'sortieResult', 'sortieKills'];
  const FIXED_NUM = ['Time', 'X', 'Y', 'Altitude', 'Heading', 'Pitch', 'Roll', 'Latitude', 'Longitude', 'Rounds', ...OUTCOME_NUM];
  const FIXED_TEXT = ['Object', 'Coalition', 'Type', 'Name', 'Pilot', 'Group', 'Country', 'Color', 'Event', 'Recording', 'EventObjects', 'RecordingInfo', 'Actor', 'Launcher', ...EVENT_TEXT, ...OUTCOME_TEXT];
  const OWN_TEXT = new Set(['Type', 'Name', 'Pilot', 'Group', 'Country', 'Coalition', 'Color']);
  const hasUV = r1.rowsWithUV > 0;
  const taken = new Set([...FIXED_NUM, ...FIXED_TEXT, ...(hasUV ? ['U', 'V'] : [])]);
  // A property named like a column of the table keeps its value under its name and " (property)".
  const colName = (k) => (taken.has(k) ? `${k} (property)` : k);
  const numKeys = [...r1.numericKeys].filter((k) => !r1.textKeys.has(k)).sort();
  const textKeys = [...r1.textKeys].filter((k) => !OWN_TEXT.has(k)).sort();
  const order = ['Time', 'X', 'Y', 'Altitude', 'Object', 'Coalition', 'Heading', 'Pitch', 'Roll', 'Type', 'Name', 'Pilot', 'Group', 'Country', 'Color', 'Event', 'Latitude', 'Longitude', 'Recording', 'EventObjects', 'RecordingInfo', 'Actor', 'Launcher', ...EVENT_TEXT, 'Rounds', ...OUTCOME, ...(hasUV ? ['U', 'V'] : [])];
  const numeric = new Set([...FIXED_NUM, 'U', 'V']);
  const columns = [...order.map((c) => ({ name: c, num: numeric.has(c) })), ...numKeys.map((k) => ({ name: colName(k), num: true, prop: k })), ...textKeys.map((k) => ({ name: colName(k), num: false, prop: k }))];

  const when = r1.globals.RecordingTime ?? (r1.refTime !== null ? new Date(r1.refTime * 1000).toISOString() : '');
  const recording = when ? `${r1.title} ${when.slice(0, 16).replace('T', ' ')}` : `${r1.title} ${name}`;
  const hints = {
    axes: { up: 'z', flipY: true },
    columns: {
      x: 'X',
      y: 'Y',
      z: 'Altitude',
      time: 'Time',
      timeUnit: r1.refTime !== null ? 'unix_seconds' : 'seconds',
      personId: 'Object',
      teamId: 'Coalition',
      sessionId: 'Recording',
      lookMode: 'yawPitch',
      yaw: 'Heading',
      pitch: 'Pitch',
      angleUnit: 'degrees',
      // As the viewer's own reading (`acmiHints`): RecordingInfo for the Match tab's title, briefing and comments.
      extra: ['Type', 'Name', 'Pilot', 'Group', 'Country', 'Event', 'Altitude', 'Roll', 'Latitude', 'Longitude', 'EventObjects', 'RecordingInfo', 'Actor', 'Launcher', ...EVENT_TEXT, 'Rounds', ...OUTCOME, ...columns.slice(order.length).map((c) => c.name)],
    },
    geo: { lat0: origin.lat, lon0: origin.lon, projection: 'tangent-plane', east: 'X', north: 'Y', up: 'Altitude' },
  };

  const { ParquetWriter, fileWriter } = await import('hyparquet-writer');
  // Metres and degrees worked out here, or written to a centimetre or a tenth of a degree, fit a float to well
  // under that; what the recording wrote with more digits (latitude, longitude, U, V, the properties) stays double.
  const FLOAT = new Set(['X', 'Y', 'Altitude', 'Heading', 'Pitch', 'Roll']);
  for (const c of columns) c.float = FLOAT.has(c.name);
  const schema = [
    { name: 'root', num_children: columns.length },
    ...columns.map((c) => (c.num ? { name: c.name, type: c.float ? 'FLOAT' : 'DOUBLE', repetition_type: 'REQUIRED' } : { name: c.name, type: 'BYTE_ARRAY', converted_type: 'UTF8', repetition_type: 'REQUIRED' })),
  ];
  // Text repeats from row to row: a dictionary. A number column too when it has few values for its rows (the
  // time, a property that is mostly absent); else its bytes split, which compresses changing numbers best.
  const encodingOf = (c, data, n) => {
    if (!c.num) return 'RLE_DICTIONARY';
    const seen = new Set();
    const most = n >> 4;
    for (let i = 0; i < n && seen.size <= most; i++) seen.add(data[i]);
    return seen.size <= most ? 'RLE_DICTIONARY' : 'BYTE_STREAM_SPLIT';
  };

  /** A Parquet file filled a row group at a time. */
  const out = (file) => {
    const part = `${file}.part`;
    let w = null;
    const bufs = columns.map((c) => (c.num ? (c.float ? new Float32Array(GROUP_ROWS) : new Float64Array(GROUP_ROWS)) : new Array(GROUP_ROWS)));
    let n = 0;
    let rows = 0;
    const flush = () => {
      if (!n) return;
      if (!w) w = new ParquetWriter({ writer: fileWriter(part), schema, kvMetadata: [], statistics: false });
      w.write({ columnData: columns.map((c, j) => ({ name: c.name, data: n === GROUP_ROWS ? bufs[j] : bufs[j].slice(0, n), encoding: encodingOf(c, bufs[j], n) })), rowGroupSize: GROUP_ROWS });
      rows += n;
      n = 0;
    };
    return {
      bufs,
      next() {
        if (n === GROUP_ROWS) flush();
        return n++;
      },
      finish(kv) {
        flush();
        if (!w) return 0;
        w.kvMetadata = kv;
        w.finish();
        fs.renameSync(part, file);
        return rows;
      },
    };
  };

  /**
   * The same, but the rows held until the end and written object by object (each object's rows in the
   * order read): a track's rows lie together, so the overlay reads a track from one piece of the file
   * and a picked unit's rows from a few row groups, not from all of them.
   */
  const outByObject = (file, keyCol, timeCol) => {
    let cap = 1 << 16;
    let bufs = columns.map((c) => (c.num ? (c.float ? new Float32Array(cap) : new Float64Array(cap)) : new Array(cap)));
    let n = 0;
    const o = {
      bufs,
      next() {
        if (n === cap) {
          cap *= 2;
          bufs = bufs.map((b) => {
            if (Array.isArray(b)) return b;
            const g = new b.constructor(cap);
            g.set(b);
            return g;
          });
          o.bufs = bufs;
        }
        return n++;
      },
      finish(kv, prepare) {
        // What is known only at the end (each aircraft's sortie) is filled in first.
        if (prepare) prepare(bufs, n);
        // A stable counting sort by object, objects in the order first seen.
        const keys = bufs[keyCol];
        const index = new Map();
        const of = new Uint32Array(n);
        for (let i = 0; i < n; i++) {
          let k = index.get(keys[i]);
          if (k === undefined) index.set(keys[i], (k = index.size));
          of[i] = k;
        }
        const start = new Uint32Array(index.size + 1);
        for (let i = 0; i < n; i++) start[of[i] + 1]++;
        for (let k = 0; k < index.size; k++) start[k + 1] += start[k];
        const order = new Uint32Array(n);
        for (let i = 0; i < n; i++) order[start[of[i]]++] = i;
        // Within an object, time order (an event found later than it happened, as a touchdown, comes back to its place).
        const time = bufs[timeCol];
        for (let k = 0, a = 0; k < index.size; a = start[k++]) {
          const b = start[k];
          let sorted = true;
          for (let i = a + 1; i < b && sorted; i++) if (time[order[i]] < time[order[i - 1]]) sorted = false;
          if (!sorted) order.set(Array.from(order.subarray(a, b)).sort((p, q) => time[p] - time[q] || p - q), a);
        }
        const w = out(file);
        for (let i = 0; i < n; i++) {
          const r = w.next();
          const src = order[i];
          for (let j = 0; j < bufs.length; j++) w.bufs[j][r] = bufs[j][src];
        }
        return w.finish(kv);
      },
    };
    return o;
  };

  fs.mkdirSync(path.dirname(job.output), { recursive: true });
  const at0 = columns.findIndex((c) => c.name === 'Object');
  const atT = columns.findIndex((c) => c.name === 'Time');
  const main = outByObject(job.output, at0, atT);
  const sideFile = job.output.replace(/\.parquet$/, '.events.parquet');
  const effects = outByObject(job.output.replace(/\.parquet$/, '.effects.parquet'), at0, atT);
  const side = out(sideFile);
  const at = Object.fromEntries(columns.map((c, j) => [c.name, j]));
  const J = (k) => at[k];
  const [jT, jX, jY, jA, jH, jP, jR, jLat, jLon, jU, jV] = ['Time', 'X', 'Y', 'Altitude', 'Heading', 'Pitch', 'Roll', 'Latitude', 'Longitude', 'U', 'V'].map(J);
  const [jObj, jCo, jTy, jNa, jPi, jGr, jCn, jCl, jEv, jRec, jEvo, jInfo, jAct, jLau] = ['Object', 'Coalition', 'Type', 'Name', 'Pilot', 'Group', 'Country', 'Color', 'Event', 'Recording', 'EventObjects', 'RecordingInfo', 'Actor', 'Launcher'].map(J);
  const [jSh, jTg, jWp, jOv, jOt, jAf, jDt, jInf, jRnd] = [...EVENT_TEXT, 'Rounds'].map(J);
  const [jSrv, jMis, jCamp, jRound, jSess, jSessT, jHeldR, jHeldB, jWon, jMWon, jWhy, jSor, jSorR, jSorK] = OUTCOME.map(J);
  /** A row's server, round and outcome by its side and the real time of its mission time `t`; no sortie yet. */
  let lastRound = null;
  const stamp = (b, i, t, color) => {
    b[jSrv][i] = srv.server;
    b[jMis][i] = srv.mission;
    const wall = recUnix + t;
    if (!lastRound || !(wall >= lastRound.t0 && wall < lastRound.t1)) lastRound = roundAt(rounds, wall);
    const r = lastRound;
    b[jCamp][i] = r ? r.campaign : '';
    b[jRound][i] = r ? r.id : NaN;
    b[jSess][i] = r ? r.session : NaN;
    b[jSessT][i] = recUnix;
    // The contested places each side held at this session's start (a chained rounds file says): the same on every row.
    b[jHeldR][i] = startRound && Number.isFinite(startRound.session) ? startRound.red : NaN;
    b[jHeldB][i] = startRound && Number.isFinite(startRound.session) ? startRound.blue : NaN;
    // A campaign is the round and the match at once: who took it.
    b[jWon][i] = b[jMWon][i] = wonIn(r, color);
    b[jWhy][i] = r && r.winner ? (r.endReason ?? '') : '';
    b[jSor][i] = NaN;
    b[jSorR][i] = '';
    b[jSorK][i] = NaN;
  };
  /** Each aircraft's sorties (by its rows' Object label), and the airfields and FARPs that change sides. */
  const sorties = new AcmiSorties();
  const liveAir = new Map();
  let capture = null;
  let captures = 0;
  /** A colour's coalition as this recording names them (DCS: Red is Allies, Blue Enemies). */
  const coalitionOf = new Map();
  const pads = new PadOwners((c) => {
    capture = c;
  });
  const launchers = new Launchers();
  /** Per object now in the recording, what an event row of its says of it (`AcmiEventFinder` keeps it past its end). */
  const snaps = new Map();
  let eventRows = 0;
  let eventsLost = 0;
  const nameOf = (info) => (info ? (info.p.get('Name') ?? '') : '');
  const typeOf = (info) => (info ? (info.p.get('Type') ?? '') : '');
  const finder = new AcmiEventFinder((e) => {
    const s = e.subjectInfo;
    // The sortie hears every event of an aircraft's, a kill credited after its shooter left too.
    if (AcmiSorties.isAircraft(typeOf(s))) sorties.event(s.label, e.kind, (reader.refTime ?? 0) + e.t, e.detail);
    // An object's row after its end would bring it back: the event stays on the other side's row.
    if (e.subjectGone) {
      eventsLost++;
      return;
    }
    const o = s.effect ? effects : main;
    const i = o.next();
    const b = o.bufs;
    b[jT][i] = (reader.refTime ?? 0) + e.t;
    b[jX][i] = e.x;
    b[jY][i] = e.y;
    b[jA][i] = e.z;
    b[jH][i] = s.head;
    b[jP][i] = s.pitch;
    b[jR][i] = s.roll;
    // Near its object's last sample: its latitude and longitude moved by the metres between.
    const lat = s.lat + (e.y - s.y) / 111320;
    b[jLat][i] = lat;
    b[jLon][i] = s.lon + (e.x - s.x) / (111320 * Math.max(0.01, Math.cos((lat * Math.PI) / 180)));
    if (hasUV) b[jU][i] = b[jV][i] = NaN;
    const p = s.p;
    b[jObj][i] = s.label;
    b[jCo][i] = p.get('Coalition') ?? p.get('Color') ?? '';
    b[jTy][i] = p.get('Type') ?? '';
    b[jNa][i] = p.get('Name') ?? '';
    b[jPi][i] = p.get('Pilot') ?? '';
    b[jGr][i] = p.get('Group') ?? '';
    b[jCn][i] = p.get('Country') ?? '';
    b[jCl][i] = p.get('Color') ?? '';
    b[jEv][i] = e.kind;
    b[jRec][i] = recording;
    b[jEvo][i] = '';
    b[jInfo][i] = '';
    b[jAct][i] = s.actor;
    b[jLau][i] = s.launcher;
    for (const [j, c] of props) {
      const v = p.get(c.prop);
      b[j][i] = c.num ? (v === undefined || v === '' ? NaN : Number(v)) : (v ?? '');
    }
    b[jSh][i] = e.shooterInfo?.label ?? '';
    b[jTg][i] = e.targetInfo?.label ?? '';
    b[jWp][i] = nameOf(e.weaponInfo);
    // The vehicle on the other end: the target's for its shooter and for the weapon, the shooter's for its target.
    const other = e.subject === e.target ? e.shooterInfo : e.targetInfo;
    b[jOv][i] = nameOf(other);
    b[jOt][i] = typeOf(other);
    b[jAf][i] = nameOf(e.airfieldInfo);
    b[jDt][i] = e.detail;
    b[jInf][i] = 'inferred';
    b[jRnd][i] = e.rounds || NaN;
    stamp(b, i, e.t, p.get('Color') ?? '');
    eventRows++;
    if (o === main) mainRows++;
    else effectRows++;
  });
  const props = columns.map((c, j) => [j, c]).filter(([, c]) => c.prop);
  let infoVersion = -1;
  const labels = new WeakMap();
  let mainRows = 0;
  let effectRows = 0;
  const reader = new AcmiStreamReader((row) => {
    const o = !row.placed ? side : EFFECT.test(row.props.get('Type') ?? '') ? effects : main;
    const i = o.next();
    const b = o.bufs;
    b[jT][i] = (reader.refTime ?? 0) + row.t;
    let x = NaN;
    let y = NaN;
    if (Number.isFinite(row.lat) && Number.isFinite(row.lon)) [x, y] = project(row.lat, row.lon);
    b[jX][i] = x;
    b[jY][i] = y;
    b[jA][i] = row.alt;
    const head = Number.isFinite(row.heading) ? row.heading : row.yaw;
    b[jH][i] = head;
    b[jP][i] = row.pitch;
    b[jR][i] = row.roll;
    b[jLat][i] = row.lat;
    b[jLon][i] = row.lon;
    if (hasUV) {
      b[jU][i] = row.u;
      b[jV][i] = row.v;
    }
    const p = row.props;
    // The label of an object's rows, worked out once per object (its properties change in place, so the
    // name and pilot it first had name all its rows: one track, as an id taken anew is a new object).
    let label = row.id ? labels.get(p) : '(recording)';
    if (label === undefined) labels.set(p, (label = acmiObjectLabel(row.id, p)));
    b[jObj][i] = label;
    b[jCo][i] = p.get('Coalition') ?? p.get('Color') ?? '';
    b[jTy][i] = p.get('Type') ?? '';
    b[jNa][i] = p.get('Name') ?? '';
    b[jPi][i] = p.get('Pilot') ?? '';
    b[jGr][i] = p.get('Group') ?? '';
    b[jCn][i] = p.get('Country') ?? '';
    b[jCl][i] = p.get('Color') ?? '';
    b[jEv][i] = row.event;
    b[jRec][i] = recording;
    b[jEvo][i] = row.objects;
    b[jInfo][i] = '';
    // Player or AI, a weapon its launcher's: the unit nearest where it appeared (a recording names none).
    const own = launchers.row(row, p, label, x, y, (reader.refTime ?? 0) + row.t);
    b[jAct][i] = own.actor;
    b[jLau][i] = own.launcher;
    for (const [j, c] of props) {
      const v = p.get(c.prop);
      b[j][i] = c.num ? (v === undefined || v === '' ? NaN : Number(v)) : (v ?? '');
    }
    b[jSh][i] = b[jTg][i] = b[jWp][i] = b[jOv][i] = b[jOt][i] = b[jAf][i] = b[jDt][i] = b[jInf][i] = '';
    b[jRnd][i] = NaN;
    stamp(b, i, row.t, p.get('Color') ?? '');
    if (p.has('Color') && p.has('Coalition') && !coalitionOf.has(p.get('Color'))) coalitionOf.set(p.get('Color'), p.get('Coalition'));
    // What the recording leaves unsaid, from how things move, appear and end.
    if (row.placed && row.id) {
      const type = p.get('Type') ?? '';
      const air = AcmiSorties.isAircraft(type);
      if (row.event === 'Removed') {
        // Flying when it went (asked before the finder forgets it): a sortie's end the removal's judgement may name.
        if (air) {
          sorties.removed(label, (reader.refTime ?? 0) + row.t, finder.airborne(row.id));
          liveAir.delete(label);
        }
        if (PadOwners.isPad(type)) pads.removed(label, row.t);
        finder.removed(row.id, null, row.t);
        snaps.delete(row.id);
      } else if (!row.event) {
        if (air) liveAir.set(label, row.id);
        if (PadOwners.isPad(type)) pads.sample(label, row.t, x, y, row.alt, p.get('Color') ?? '', p.get('Name') ?? '');
        let s = snaps.get(row.id);
        if (!s) snaps.set(row.id, (s = { p, label, effect: o === effects, actor: '', launcher: '', lat: 0, lon: 0, x: 0, y: 0, head: NaN, pitch: NaN, roll: NaN }));
        s.p = p;
        s.actor = own.actor;
        s.launcher = own.launcher;
        s.lat = row.lat;
        s.lon = row.lon;
        s.x = x;
        s.y = y;
        s.head = head;
        s.pitch = row.pitch;
        s.roll = row.roll;
        finder.sample(row.id, null, row.t, x, y, row.alt, p.get('Type') ?? '', s, own.id ?? null, Number(p.get('AGL') ?? NaN));
      }
    }
    if (o === main) mainRows++;
    else if (o === effects) effectRows++;
    // An airfield or FARP that changed sides: a row of its own at the pad, as the events worked out are.
    if (capture) {
      const c = capture;
      capture = null;
      const k = o.next();
      const cb = o.bufs;
      for (let j = 0; j < columns.length; j++) cb[j][k] = cb[j][i];
      cb[jEv][k] = 'capture';
      cb[jEvo][k] = '';
      cb[jAf][k] = c.name;
      cb[jDt][k] = `${c.from} to ${c.to}`;
      cb[jInf][k] = 'inferred';
      captures++;
      eventRows++;
      if (o === main) mainRows++;
      else if (o === effects) effectRows++;
    }
    info(row.t);
  }, name);
  // The recording's own properties, whenever they changed: a row of the side file.
  const info = (t) => {
    if (reader.globalsVersion === infoVersion) return;
    infoVersion = reader.globalsVersion;
    const k = side.next();
    const sb = side.bufs;
    for (let j = 0; j < columns.length; j++) sb[j][k] = columns[j].num ? NaN : '';
    sb[jT][k] = (reader.refTime ?? 0) + t;
    sb[jObj][k] = '(recording)';
    sb[jEv][k] = 'RecordingInfo';
    sb[jRec][k] = recording;
    sb[jInfo][k] = JSON.stringify(reader.globals);
    sb[jAct][k] = '';
    sb[jLau][k] = '';
    stamp(sb, k, t, '');
    sb[jLat][k] = reader.refLat;
    sb[jLon][k] = reader.refLon;
    [sb[jX][k], sb[jY][k]] = project(reader.refLat, reader.refLon);
    sb[jA][k] = 0;
  };
  await readText(job.input, (s) => reader.push(s));
  reader.end();
  finder.finish();
  info(reader.lastTime);
  // The places taken between the session before and this one (a chained rounds file lists them): a capture row
  // each at the place, at the recording's start, marked as between missions.
  const between = startRound && Number.isFinite(startRound.session) ? startRound.captures : [];
  for (const c of between) {
    const k = main.next();
    const cb = main.bufs;
    for (let j = 0; j < columns.length; j++) cb[j][k] = columns[j].num ? NaN : '';
    const [x, y] = project(c.lat, c.lon);
    cb[jT][k] = reader.refTime ?? 0;
    cb[jX][k] = x;
    cb[jY][k] = y;
    cb[jA][k] = 0;
    cb[jLat][k] = c.lat;
    cb[jLon][k] = c.lon;
    cb[jObj][k] = '(campaign)';
    cb[jCo][k] = coalitionOf.get(c.to) ?? c.to;
    cb[jCl][k] = c.to;
    cb[jEv][k] = 'capture';
    cb[jRec][k] = recording;
    cb[jDt][k] = `${c.from} to ${c.to}, between missions`;
    cb[jInf][k] = 'between missions';
    cb[jAct][k] = '';
    cb[jLau][k] = '';
    stamp(cb, k, 0, c.to);
    captures++;
    eventRows++;
    mainRows++;
  }
  // The aircraft still in the recording: flying or down at its end.
  sorties.finish((reader.refTime ?? 0) + reader.lastTime, (label) => (liveAir.has(label) ? finder.airborne(liveAir.get(label)) : null));
  const sortieCount = {};
  for (const [, tr] of sorties.entries()) for (const so of tr.list) sortieCount[so.result] = (sortieCount[so.result] ?? 0) + 1;
  /** Each aircraft row's sortie, its end and its kills, now that every sortie has ended. */
  const fillSorties = (bufs, n) => {
    const obj = bufs[jObj];
    const time = bufs[jT];
    let key = null;
    let list = null;
    for (let i = 0; i < n; i++) {
      if (obj[i] !== key) {
        key = obj[i];
        list = sorties.of(key);
      }
      if (!list.length) continue;
      const so = sorties.at(key, time[i]);
      if (!so) continue;
      bufs[jSor][i] = so.n;
      bufs[jSorR][i] = so.result ?? '';
      bufs[jSorK][i] = so.kills;
    }
  };
  // Who won, and where that is from (as a War Thunder match's `result.source`): a rounds file, or nothing.
  const iso = (u) => (Number.isFinite(u) ? new Date(u * 1000).toISOString() : null);
  const last = rounds.length ? roundAt(rounds, recUnix + reader.lastTime) ?? rounds[rounds.length - 1] : null;
  const outcome = {
    server: srv.server || null,
    mission: srv.mission || null,
    kind: srv.kind,
    result: { winner: last?.winner ?? null, round: last?.id ?? null, campaign: last?.campaign ?? null, endReason: last?.winner ? (last.endReason ?? null) : null, confidence: last?.winner ? (last.confidence ?? null) : null, source: last ? roundsSource : null },
    rounds: rounds.map((r) => ({ id: r.id, campaign: r.campaign, start: iso(r.t0), end: iso(r.t1), winner: r.winner, endReason: r.endReason, state: r.state, confidence: r.confidence })),
    // The campaign round this recording (session) began in: its place in it, and who held what at its start.
    session: startRound ? { campaign: startRound.campaign, round: startRound.id, session: Number.isFinite(startRound.session) ? startRound.session : null, start: iso(recUnix), held: Number.isFinite(startRound.red) ? { Red: startRound.red, Blue: startRound.blue } : null, takenBefore: between.length } : null,
    captures,
    sorties: sortieCount,
  };
  const meta = {
    title: reader.title,
    recording,
    theatre: theatre?.id ?? null,
    origin,
    reference: { lat: reader.refLat, lon: reader.refLon, time: reader.refTime },
    globals: reader.globals,
    completeness: reader.completeness(),
    rows: { placed: mainRows, effects: effectRows, other: reader.rows + eventRows - mainRows - effectRows },
    // The events worked out (`Inferred`), by kind, and those left out (their object already gone).
    inferred: { ...finder.counts, capture: captures, lost: eventsLost },
    outcome,
  };
  const kv = [
    { key: 'heat3d', value: JSON.stringify(hints) },
    { key: 'acmi', value: JSON.stringify(meta) },
  ];
  const wrote = main.finish(kv, fillSorties);
  const effectsWrote = effects.finish(kv);
  const sideRows = side.finish(kv);
  if (!sideRows) fs.rmSync(`${sideFile}.part`, { force: true });
  if (job.container && fs.existsSync(job.output)) {
    const members = [
      ['table', job.output],
      ['effects', job.output.replace(/\.parquet$/, '.effects.parquet')],
      ['events', sideFile],
    ]
      .filter(([, file]) => fs.existsSync(file))
      .map(([role, file]) => ({ role, file }));
    const about = await describe(members);
    await writeContainer(job.container, members, { ...about, game: theatre?.game ?? about.game, converter: { name: 'acmi-to-parquet', version: job.version } });
    await verifyContainer(job.container);
    for (const m of members) fs.rmSync(m.file);
  }
  return { rows: wrote, sideRows: sideRows + effectsWrote, theatre: theatre?.id ?? null, ms: performance.now() - t0, columns: columns.length };
}

if (!isMainThread) {
  const { theatres } = workerData;
  parentPort.on('message', async (job) => {
    try {
      parentPort.postMessage({ ok: true, job, result: await convert(job, theatres) });
    } catch (e) {
      parentPort.postMessage({ ok: false, job, error: e instanceof Error ? e.stack || e.message : String(e) });
    }
  });
}

// ---------------------------------------------------------------------------
// The folder, in a pool of workers.

async function theatreList() {
  // theatres.ts reaches into the viewer's modules; Vite's runner loads it as the viewer does.
  const { runnerImport } = await import('vite');
  const { module } = await runnerImport(path.join(ROOT, 'src/world/theatres.ts'), { root: ROOT, logLevel: 'silent', configFile: false });
  return module.THEATRES.map((t) => ({ id: t.id, game: t.game, box: t.box, origin: t.origin }));
}

function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (/\.acmi$/i.test(e.name)) out.push(p);
  }
  return out;
}

async function cli() {
  const args = process.argv.slice(2);
  const flag = (k) => {
    const i = args.indexOf(k);
    if (i < 0) return undefined;
    const v = args[i + 1];
    args.splice(i, 2);
    return v;
  };
  const force = args.includes('--force');
  if (force) args.splice(args.indexOf('--force'), 1);
  // Containers are the default; --container says so explicitly.
  if (args.includes('--container')) args.splice(args.indexOf('--container'), 1);
  const loose = args.includes('--loose');
  if (loose) args.splice(args.indexOf('--loose'), 1);
  const version = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8')).version ?? null;
  const jobsArg = flag('--jobs');
  const theatre = flag('--theatre') ?? null;
  const server = flag('--server') ?? '';
  // Rounds files (format heat3d-dcs-rounds, `src/data/dcsOutcome.ts`): who won a server's rounds, from what it publishes.
  const rounds = [];
  for (let f = flag('--rounds'); f !== undefined; f = flag('--rounds')) rounds.push(JSON.parse(fs.readFileSync(f, 'utf8')));
  const [inDir, outDir] = args;
  if (!inDir || !outDir) {
    console.error('usage: node tools/acmi-to-parquet.mjs <in-folder> <out-folder> [--jobs N] [--theatre Id] [--server Name] [--rounds file.json ...] [--force] [--loose]');
    process.exit(2);
  }
  const theatres = await theatreList();
  if (theatre && !theatres.some((t) => t.id === theatre)) {
    console.error(`unknown theatre ${theatre}; known: ${theatres.map((t) => t.id).join(', ')}`);
    process.exit(2);
  }
  const inputs = walk(path.resolve(inDir)).sort();
  const jobs = [];
  let skipped = 0;
  for (const input of inputs) {
    const rel = path.relative(path.resolve(inDir), input);
    const output = path.join(path.resolve(outDir), path.dirname(rel), `${stemOf(path.basename(rel))}.parquet`);
    const container = loose ? null : output.replace(/\.parquet$/, '.3dheat');
    const done = [output, container].find((f) => f && fs.existsSync(f));
    if (!force && done && fs.statSync(done).mtimeMs >= fs.statSync(input).mtimeMs) {
      skipped++;
      continue;
    }
    jobs.push({ input, output, container, version, theatre, server, rounds, bytes: fs.statSync(input).size });
  }
  // The biggest first, so the last to finish is a small one.
  jobs.sort((a, b) => b.bytes - a.bytes);
  const n = Math.max(1, Math.min(Number(jobsArg) || Math.max(1, Math.floor(os.cpus().length / 4)), jobs.length || 1));
  console.log(`${inputs.length} recordings, ${skipped} already converted, ${jobs.length} to do (${(jobs.reduce((a, j) => a + j.bytes, 0) / 1e9).toFixed(2)} GB) on ${n} workers`);
  const t0 = performance.now();
  let done = 0;
  let rows = 0;
  let bytes = 0;
  const failed = [];
  const byTheatre = {};
  await new Promise((resolve) => {
    if (!jobs.length) return resolve();
    let next = 0;
    let running = 0;
    const start = (w) => {
      if (next >= jobs.length) {
        void w.terminate();
        if (--running === 0) resolve();
        return;
      }
      w.postMessage(jobs[next++]);
    };
    for (let i = 0; i < n; i++) {
      const w = new Worker(SELF, { workerData: { theatres } });
      running++;
      w.on('message', (m) => {
        done++;
        if (m.ok) {
          rows += m.result.rows + m.result.sideRows;
          bytes += m.job.bytes;
          byTheatre[m.result.theatre ?? '(none)'] = (byTheatre[m.result.theatre ?? '(none)'] ?? 0) + 1;
          const s = (performance.now() - t0) / 1000;
          console.log(`[${done}/${jobs.length}] ${path.relative(path.resolve(inDir), m.job.input)}: ${m.result.rows} rows (+${m.result.sideRows}), ${m.result.theatre ?? 'no theatre'}, ${(m.result.ms / 1000).toFixed(1)} s; ${(bytes / 1e6 / s).toFixed(1)} MB/s overall`);
        } else {
          failed.push(m.job.input);
          console.error(`[${done}/${jobs.length}] FAILED ${m.job.input}: ${m.error}`);
        }
        start(w);
      });
      w.on('error', (e) => {
        console.error(`worker failed: ${e.stack || e}`);
        if (--running === 0) resolve();
      });
      start(w);
    }
  });
  const s = (performance.now() - t0) / 1000;
  console.log(`done: ${done - failed.length} converted, ${failed.length} failed, ${rows} rows, ${(bytes / 1e9).toFixed(2)} GB in ${s.toFixed(0)} s; theatres ${JSON.stringify(byTheatre)}`);
  if (failed.length) process.exitCode = 1;
}

if (isMainThread) await cli();
