#!/usr/bin/env node
/**
 * Tacview ACMI recordings (.acmi, .zip.acmi, .txt.acmi) to Parquet, a whole
 * folder at a time, for the many-match overlay: one Parquet file per
 * recording, the folder tree kept, so a map or a scenario loads as one folder.
 *
 *   node tools/acmi-to-parquet.mjs <in-folder> <out-folder> [--jobs N] [--theatre Id] [--force]
 *
 * Each recording is read twice as a stream (`src/data/acmiStream.ts`, the
 * same reading as the viewer's own ACMI loader): first for its properties
 * and where it is, then for the rows. Nothing of the file is left out:
 *
 *   <name>.parquet         every row at a real place - each position, and each
 *                          event or removal at the object it names - with the
 *                          columns of the viewer's ACMI table and a column for
 *                          every property the recording carries
 *   <name>.events.parquet  the rows at no place: comments, events about no
 *                          object seen, objects that never got a position, and
 *                          a row each time the recording's own properties
 *                          change (RecordingInfo, as JSON)
 *
 * Positions are east and north metres (X, Y) on the plane touching the earth
 * at the origin of the theatre the recording is in (`src/world/theatres.ts`,
 * picked from where its positions lie, or named with --theatre), so every
 * recording of one map shares one plane with that theatre's world backdrop.
 * A recording on no known theatre keeps its own reference. The `heat3d`
 * footer says how to read the file; the `acmi` footer holds the recording's
 * properties, its theatre and the count of its lines by kind.
 *
 * A file already converted (output newer than the recording) is skipped
 * unless --force. Outputs are written under a temporary name and renamed when
 * whole, so a stopped run leaves no half file.
 */

import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';
import { Worker, isMainThread, parentPort, workerData } from 'node:worker_threads';

const SELF = fileURLToPath(import.meta.url);
const ROOT = path.resolve(path.dirname(SELF), '..');
/** Rows a row group. */
const GROUP_ROWS = 250_000;

function stemOf(name) {
  return name.replace(/\.(zip|txt)\.acmi$/i, '').replace(/\.acmi$/i, '');
}

// ---------------------------------------------------------------------------
// Reading a recording as text, a piece at a time.

/** Where the first member of a zip lies: its method and the byte range of its data. */
function zipMember(file) {
  const fd = fs.openSync(file, 'r');
  try {
    const size = fs.fstatSync(fd).size;
    const tail = Math.min(size, 65557);
    const buf = Buffer.alloc(tail);
    fs.readSync(fd, buf, 0, tail, size - tail);
    let eocd = -1;
    for (let i = tail - 22; i >= 0; i--)
      if (buf.readUInt32LE(i) === 0x06054b50) {
        eocd = i;
        break;
      }
    if (eocd < 0) throw new Error('not a zip: no end of central directory');
    const cdAt = buf.readUInt32LE(eocd + 16);
    const cd = Buffer.alloc(46);
    fs.readSync(fd, cd, 0, 46, cdAt);
    if (cd.readUInt32LE(0) !== 0x02014b50) throw new Error('zip central directory not found');
    const method = cd.readUInt16LE(10);
    const csize = cd.readUInt32LE(20);
    const local = cd.readUInt32LE(42);
    const lh = Buffer.alloc(30);
    fs.readSync(fd, lh, 0, 30, local);
    const start = local + 30 + lh.readUInt16LE(26) + lh.readUInt16LE(28);
    return { method, start, end: start + csize };
  } finally {
    fs.closeSync(fd);
  }
}

/** Feeds the recording's text to `push`, piece by piece. */
async function readText(file, push) {
  const head = Buffer.alloc(4);
  const fd = fs.openSync(file, 'r');
  fs.readSync(fd, head, 0, 4, 0);
  fs.closeSync(fd);
  let stream;
  if (head.readUInt32LE(0) === 0x04034b50) {
    const m = zipMember(file);
    if (m.method !== 0 && m.method !== 8) throw new Error(`zip method ${m.method} is not supported`);
    const raw = fs.createReadStream(file, { start: m.start, end: Math.max(m.start, m.end - 1), highWaterMark: 1 << 20 });
    stream = m.method === 8 ? raw.pipe(zlib.createInflateRaw({ chunkSize: 1 << 20 })) : raw;
  } else stream = fs.createReadStream(file, { highWaterMark: 1 << 20 });
  const dec = new TextDecoder('utf-8');
  for await (const chunk of stream) push(dec.decode(chunk, { stream: true }));
  const rest = dec.decode();
  if (rest) push(rest);
}

// ---------------------------------------------------------------------------
// One recording, in a worker.

async function convert(job, theatres) {
  const { AcmiStreamReader, acmiObjectLabel, tangentPlane } = await import(new URL('../src/data/acmiStream.ts', import.meta.url).href);
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

  // The columns: the viewer's ACMI table, then every property.
  const FIXED_NUM = ['Time', 'X', 'Y', 'Altitude', 'Heading', 'Pitch', 'Roll', 'Latitude', 'Longitude'];
  const FIXED_TEXT = ['Object', 'Coalition', 'Type', 'Name', 'Pilot', 'Group', 'Country', 'Color', 'Event', 'Recording', 'EventObjects', 'RecordingInfo'];
  const OWN_TEXT = new Set(['Type', 'Name', 'Pilot', 'Group', 'Country', 'Coalition', 'Color']);
  const hasUV = r1.rowsWithUV > 0;
  const taken = new Set([...FIXED_NUM, ...FIXED_TEXT, ...(hasUV ? ['U', 'V'] : [])]);
  // A property named like a column of the table keeps its value under its name and " (property)".
  const colName = (k) => (taken.has(k) ? `${k} (property)` : k);
  const numKeys = [...r1.numericKeys].filter((k) => !r1.textKeys.has(k)).sort();
  const textKeys = [...r1.textKeys].filter((k) => !OWN_TEXT.has(k)).sort();
  const order = ['Time', 'X', 'Y', 'Altitude', 'Object', 'Coalition', 'Heading', 'Pitch', 'Roll', 'Type', 'Name', 'Pilot', 'Group', 'Country', 'Color', 'Event', 'Latitude', 'Longitude', 'Recording', 'EventObjects', 'RecordingInfo', ...(hasUV ? ['U', 'V'] : [])];
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
      extra: ['Type', 'Name', 'Pilot', 'Group', 'Country', 'Event', 'Altitude', 'Roll', 'Latitude', 'Longitude', 'EventObjects', ...columns.slice(order.length).map((c) => c.name)],
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

  fs.mkdirSync(path.dirname(job.output), { recursive: true });
  const main = out(job.output);
  const sideFile = job.output.replace(/\.parquet$/, '.events.parquet');
  const side = out(sideFile);
  const at = Object.fromEntries(columns.map((c, j) => [c.name, j]));
  const J = (k) => at[k];
  const [jT, jX, jY, jA, jH, jP, jR, jLat, jLon, jU, jV] = ['Time', 'X', 'Y', 'Altitude', 'Heading', 'Pitch', 'Roll', 'Latitude', 'Longitude', 'U', 'V'].map(J);
  const [jObj, jCo, jTy, jNa, jPi, jGr, jCn, jCl, jEv, jRec, jEvo, jInfo] = ['Object', 'Coalition', 'Type', 'Name', 'Pilot', 'Group', 'Country', 'Color', 'Event', 'Recording', 'EventObjects', 'RecordingInfo'].map(J);
  const props = columns.map((c, j) => [j, c]).filter(([, c]) => c.prop);
  let infoVersion = -1;
  const labels = new WeakMap();
  let mainRows = 0;
  const reader = new AcmiStreamReader((row) => {
    const o = row.placed ? main : side;
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
    // The label of an object's rows, worked out once per set of its properties (each object has its own).
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
    for (const [j, c] of props) {
      const v = p.get(c.prop);
      b[j][i] = c.num ? (v === undefined || v === '' ? NaN : Number(v)) : (v ?? '');
    }
    if (row.placed) mainRows++;
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
    sb[jLat][k] = reader.refLat;
    sb[jLon][k] = reader.refLon;
    [sb[jX][k], sb[jY][k]] = project(reader.refLat, reader.refLon);
    sb[jA][k] = 0;
  };
  await readText(job.input, (s) => reader.push(s));
  reader.end();
  info(reader.lastTime);
  const meta = {
    title: reader.title,
    recording,
    theatre: theatre?.id ?? null,
    origin,
    reference: { lat: reader.refLat, lon: reader.refLon, time: reader.refTime },
    globals: reader.globals,
    completeness: reader.completeness(),
    rows: { placed: mainRows, other: reader.rows - mainRows },
  };
  const kv = [
    { key: 'heat3d', value: JSON.stringify(hints) },
    { key: 'acmi', value: JSON.stringify(meta) },
  ];
  const wrote = main.finish(kv);
  const sideRows = side.finish(kv);
  if (!sideRows) fs.rmSync(`${sideFile}.part`, { force: true });
  return { rows: wrote, sideRows, theatre: theatre?.id ?? null, ms: performance.now() - t0, columns: columns.length };
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
  const jobsArg = flag('--jobs');
  const theatre = flag('--theatre') ?? null;
  const [inDir, outDir] = args;
  if (!inDir || !outDir) {
    console.error('usage: node tools/acmi-to-parquet.mjs <in-folder> <out-folder> [--jobs N] [--theatre Id] [--force]');
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
    if (!force && fs.existsSync(output) && fs.statSync(output).mtimeMs >= fs.statSync(input).mtimeMs) {
      skipped++;
      continue;
    }
    jobs.push({ input, output, theatre, bytes: fs.statSync(input).size });
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
