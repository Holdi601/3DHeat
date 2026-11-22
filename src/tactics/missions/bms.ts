/**
 * Falcon BMS (4.38): the pilot's data cartridge, `User\Config\<callsign>.ini`
 * (and a TE's copy of it, `Data\Campaign\<TE>.ini`), read onto the board and
 * written back; and a campaign or TE file (`.cam`, `.tac`) read as far as its
 * plain text goes.
 *
 * **The cartridge** is an INI text file (CRLF). Its `[STPT]` section holds,
 * as BMS writes it: `target_0` .. `target_23` (steerpoints 1-24, the route),
 * `target_80` .. `target_98` (steerpoints 81-99), `ppt_0` .. `ppt_14`
 * (pre-planned threats, steerpoints 56-70), `lineSTPT_0` .. `lineSTPT_23`
 * (four lines of six points, steerpoints 31-54) and `wpntarget_0` ..
 * `wpntarget_99` (weapon targets). A steerpoint is `x, y, z, action, name`, a
 * threat `x, y, z, radius, code` (the code a row of BMS's `Ppt.ini`: SA2,
 * AAA ...), a line point `x, y, z`; numbers with six decimals. x is feet north
 * and y feet east of the theatre's south-west corner, z feet down (a
 * steerpoint's elevation as a negative number); an unused entry is all zeros
 * (a steerpoint's action -1 and name "Not set"). The other sections (EWS,
 * MFD, radios ...) are the pilot's own and are kept as they are.
 *
 * **On the board** the theatre's metres: x east, z south (board z = -north),
 * y up. The route is one flight (its lead where steerpoint 1 is); threats are
 * zones of their radius named by their code; lines are lines; steerpoints
 * 81-99 are markers.
 *
 * **Writing** patches only those entries in `[STPT]` (or adds the section),
 * so a file the board did not change comes back the same; a new cartridge
 * holds `[STPT]` alone. BMS loads the callsign `.ini` when the pilot is
 * picked and a TE's `.ini` with the TE; loading a campaign mission clears
 * the cartridge's steerpoints, lines and threats (BMS Technical Manual 11.3).
 *
 * **Campaign and TE files** are a directory of parts (`u32` offset of the
 * directory; there `u32` count, then per part `u8` name length, name, `u32`
 * offset, `u32` size). The `.te` part is text and names the teams; the
 * theatre, time, squadrons, units and flights are in compressed binary parts
 * whose layouts change with the BMS version, which are not read.
 */

import type { Vec3 } from '../plan';
import type { ExportWarning, MissionExportSummary } from './dcsWrite';
import type { MissionImporter, MissionLine, MissionPlace, MissionState, MissionWaypoint } from './index';

/** Feet to metres. */
const FT = 0.3048;
/** BMS's installed theatres (both on the Korea terrain). */
export const BMS_THEATRES = ['Korea KTO', 'Korea TvT'];

const SIDES = [
  {
    id: 'blue',
    name: 'Blue',
    color: [0.26, 0.55, 0.95] as [number, number, number],
  },
  {
    id: 'red',
    name: 'Red',
    color: [0.93, 0.33, 0.27] as [number, number, number],
  },
];

/** Board point of BMS feet (x north, y east, z down). */
export const bmsAt = (x: number, y: number, z: number): Vec3 => ({
  x: y * FT,
  y: -z * FT,
  z: -x * FT,
});
/** BMS feet (x north, y east, z down) of a board point. */
export const bmsFeet = (p: Vec3): [number, number, number] => [-p.z / FT, p.x / FT, -p.y / FT];

// ---------------------------------------------------------------------------
// The INI text

interface IniLine {
  /** Section it is in ('' before the first). */
  section: string;
  key: string | null;
  value: string;
  raw: string;
}

/** Lines of an INI file as they stand, with their section and key. */
export function parseIni(text: string): IniLine[] {
  let section = '';
  return text.split(/\r?\n/).map((raw) => {
    const s = /^\s*\[([^\]]*)\]/.exec(raw);
    if (s) {
      section = s[1].trim();
      return { section, key: null, value: '', raw };
    }
    const e = raw.indexOf('=');
    if (e < 0 || /^\s*[;#]/.test(raw)) return { section, key: null, value: '', raw };
    return {
      section,
      key: raw.slice(0, e).trim(),
      value: raw.slice(e + 1),
      raw,
    };
  });
}

const nums = (v: string) => v.split(',').map((x) => Number(x.trim()));
const zero = (x: number, y: number) => Math.abs(x) < 1e-6 && Math.abs(y) < 1e-6;

/** The keys of `[STPT]` in BMS's order, with what an unused one holds. */
function stptKeys(): [string, string][] {
  const out: [string, string][] = [];
  const unused = '0.000000, 0.000000, 0.000000, -1, Not set';
  for (let i = 0; i < 24; i++) out.push([`target_${i}`, unused]);
  for (let i = 80; i < 99; i++) out.push([`target_${i}`, unused]);
  for (let i = 0; i < 15; i++) out.push([`ppt_${i}`, '0.000000, 0.000000, 0.000000, 0.000000,']);
  for (let i = 0; i < 24; i++) out.push([`lineSTPT_${i}`, '0.000000, 0.000000, 0.000000']);
  for (let i = 0; i < 100; i++) out.push([`wpntarget_${i}`, unused]);
  return out;
}

// ---------------------------------------------------------------------------
// Reading

/** Waypoint actions BMS writes into a steerpoint (as Falcon 4 numbers them). */
const ACTIONS: Record<number, string> = {
  0: 'Nav',
  1: 'Takeoff',
  2: 'Assemble',
  3: 'Post-assemble',
  7: 'Land',
  8: 'Timing',
  12: 'CAP',
  24: 'Tanker',
};

export function readBmsDtc(text: string, file: string): MissionState {
  const lines = parseIni(text);
  const stpt = new Map<string, string>();
  for (const l of lines) if (l.section.toUpperCase() === 'STPT' && l.key) stpt.set(l.key.toLowerCase(), l.value);
  if (!lines.some((l) => l.key !== null || /^\s*\[/.test(l.raw))) throw new Error('not a Falcon BMS data cartridge (.ini)');
  const title = lines.find((l) => l.section.toUpperCase() === 'MISSION' && l.key?.toLowerCase() === 'title')?.value.trim() || file.replace(/^.*[\\/]/, '').replace(/\.ini$/i, '');
  const notes: string[] = [];
  if (!stpt.size) notes.push('the cartridge has no steerpoints ([STPT]) yet');
  const route: MissionWaypoint[] = [];
  for (let i = 0; i < 24; i++) {
    const v = stpt.get(`target_${i}`);
    if (!v) continue;
    const [x, y, z, action] = nums(v);
    if (!Number.isFinite(x) || zero(x, y)) continue;
    const name = v.split(',').slice(4).join(',').trim();
    route.push({
      at: bmsAt(x, y, z),
      name: `STPT ${i + 1}${name && name !== 'Not set' ? ` ${name}` : ''}`,
      ...(ACTIONS[action] ? { kind: ACTIONS[action] } : {}),
    });
  }
  const places: MissionPlace[] = [];
  for (let i = 80; i < 99; i++) {
    const v = stpt.get(`target_${i}`);
    if (!v) continue;
    const [x, y, z] = nums(v);
    if (Number.isFinite(x) && !zero(x, y))
      places.push({
        name: `STPT ${i + 1}`,
        kind: 'marker',
        at: bmsAt(x, y, z),
      });
  }
  for (let i = 0; i < 15; i++) {
    const v = stpt.get(`ppt_${i}`);
    if (!v) continue;
    const [x, y, z, r] = nums(v);
    if (!Number.isFinite(x) || zero(x, y)) continue;
    const code = v.split(',').slice(4).join(',').trim() || `PPT ${i + 56}`;
    // A threat without a ring (r 0.1: a marker such as an AWACS orbit) is a zone too small to see, so it is written back.
    places.push({
      name: code,
      kind: 'zone',
      at: bmsAt(x, y, z),
      radius: Math.max(r, 0.1) * FT,
      side: 'red',
    });
  }
  const outLines: MissionLine[] = [];
  for (let k = 0; k < 4; k++) {
    const pts: Vec3[] = [];
    for (let i = 6 * k; i < 6 * k + 6; i++) {
      const v = stpt.get(`linestpt_${i}`);
      if (!v) continue;
      const [x, y, z] = nums(v);
      if (Number.isFinite(x) && !zero(x, y)) pts.push(bmsAt(x, y, z));
    }
    if (pts.length >= 2) outLines.push({ name: `Line ${k + 1}`, points: pts });
  }
  const groups = route.length
    ? [
        {
          name: 'Steerpoints',
          side: 'blue',
          category: 'air' as const,
          units: [
            {
              name: 'Ownship',
              type: 'f-16c',
              category: 'air' as const,
              figure: 'f-16c',
              at: route[0].at,
              yaw: 0,
              ref: 'ownship',
              player: true,
            },
          ],
          route,
          ref: 'stpt',
        },
      ]
    : [];
  return {
    format: 'bms-dtc',
    game: 'air',
    title,
    map: 'Falcon BMS: Korea KTO',
    sides: SIDES.map((s) => ({ ...s })),
    groups,
    places,
    notes,
    ...(outLines.length ? { lines: outLines } : {}),
  };
}

/** The parts of a `.cam` / `.tac` / `.trn` file: name, offset, size. */
export function bmsCampaignParts(b: Uint8Array): { name: string; offset: number; size: number }[] {
  const v = new DataView(b.buffer, b.byteOffset, b.byteLength);
  if (b.length < 8) throw new Error('not a Falcon BMS campaign file');
  const dir = v.getUint32(0, true);
  if (dir < 4 || dir + 4 > b.length) throw new Error('not a Falcon BMS campaign file (no directory)');
  const n = v.getUint32(dir, true);
  if (n < 1 || n > 64) throw new Error('not a Falcon BMS campaign file (directory)');
  const out: { name: string; offset: number; size: number }[] = [];
  let p = dir + 4;
  for (let i = 0; i < n; i++) {
    if (p + 1 > b.length) throw new Error('not a Falcon BMS campaign file (directory ends early)');
    const len = b[p++];
    if (p + len + 8 > b.length) throw new Error('not a Falcon BMS campaign file (directory ends early)');
    let name = '';
    for (let j = 0; j < len; j++) name += String.fromCharCode(b[p + j]);
    p += len;
    const offset = v.getUint32(p, true);
    const size = v.getUint32(p + 4, true);
    p += 8;
    if (offset + size > b.length) throw new Error(`not a Falcon BMS campaign file (part ${name} past the end)`);
    out.push({ name, offset, size });
  }
  return out;
}

/** A campaign or TE file: its teams from the text part; the rest is compressed binary, said so. */
export function readBmsCampaign(b: Uint8Array, file: string): MissionState {
  const parts = bmsCampaignParts(b);
  const te = parts.find((p) => /\.te$/i.test(p.name));
  const ver = parts.find((p) => /\.ver$/i.test(p.name));
  const text = (p: { offset: number; size: number }) => new TextDecoder('latin1').decode(b.subarray(p.offset, p.offset + p.size));
  const sides: MissionState['sides'] = [];
  const palette: [number, number, number][] = [
    [0.26, 0.55, 0.95],
    [0.93, 0.33, 0.27],
    [0.35, 0.8, 0.4],
    [0.95, 0.8, 0.3],
    [0.7, 0.5, 0.9],
    [0.8, 0.8, 0.8],
    [0.4, 0.85, 0.85],
    [0.9, 0.55, 0.3],
  ];
  if (te) {
    const ls = text(te)
      .split(/\r?\n/)
      .map((l) => l.trim());
    for (let i = 0; i < ls.length; i++) {
      if (ls[i] !== ':Team') continue;
      const id = ls[i + 1]?.split(/\s+/)[0];
      const n = ls.indexOf(':TeamName', i);
      const name = n > 0 ? ls[n + 1] : '';
      if (id && name)
        sides.push({
          id: `team${id}`,
          name,
          color: palette[sides.length % palette.length],
        });
    }
  }
  const notes = [
    `Falcon BMS ${/\.tac$/i.test(file) ? 'TE' : 'campaign'} file${ver ? ` (version ${text(ver).trim()})` : ''}: ${sides.length ? `teams ${sides.map((s) => s.name).join(', ')}; ` : ''}its theatre, time, squadrons, flights and units are in compressed parts that are not read`,
  ];
  return {
    format: 'bms-cam',
    game: 'air',
    title: file.replace(/^.*[\\/]/, '').replace(/\.(cam|tac|trn)$/i, ''),
    map: '',
    sides: sides.length ? sides : SIDES.map((s) => ({ ...s })),
    groups: [],
    places: [],
    notes,
  };
}

export const bmsDtc: MissionImporter = {
  id: 'bms-dtc',
  name: 'Falcon BMS (data cartridge .ini, .cam, .tac)',
  accepts: (name) => name.endsWith('.ini') || name.endsWith('.cam') || name.endsWith('.tac') || name.endsWith('.trn'),
  read: async (bytes, name) => {
    const file = name.split(/[\\/]/).pop() ?? name;
    if (/\.(cam|tac|trn)$/i.test(name)) return readBmsCampaign(bytes, file);
    return readBmsDtc(new TextDecoder('latin1').decode(bytes), file);
  },
};

// ---------------------------------------------------------------------------
// Writing

/** Two entries the same to half a foot, and in their other fields. */
function same(a: string, b: string): boolean {
  const x = a.split(',');
  const y = b.split(',');
  if (x.length !== y.length) return false;
  return x.every((v, i) => (i < 3 ? Math.abs(Number(v) - Number(y[i])) < 0.5 : i === 3 ? Math.abs(Number(v) - Number(y[i])) <= 0.01 * Math.max(1, Math.abs(Number(v))) : v.trim() === y[i].trim()));
}

/** Two entries at the same place, to half a foot. */
function near(a: string, b: string): boolean {
  const x = nums(a);
  const y = nums(b);
  return Math.abs(x[0] - y[0]) < 0.5 && Math.abs(x[1] - y[1]) < 0.5;
}

const f6 = (v: number) => (Number.isFinite(v) ? v : 0).toFixed(6);
/** A name or code as one INI value: no line breaks or commas (the fields are comma separated). */
const clean = (s: string) => s.replace(/[\r\n,]+/g, ' ').trim();

/** Slots for `n` things: the ones `fixed` gives where it gives one, the rest in the free slots in turn (the cartridge's empty ones first). */
function slots(n: number, size: number, fixed: (i: number) => number | undefined, taken: (slot: number) => boolean): (number | undefined)[] {
  const out: (number | undefined)[] = [];
  const used = new Set<number>();
  for (let i = 0; i < n; i++) {
    const s = fixed(i);
    const ok = s !== undefined && !used.has(s);
    if (ok) used.add(s!);
    out.push(ok ? s : undefined);
  }
  const free = [...Array(size).keys()].filter((s) => !used.has(s)).sort((x, y) => Number(taken(x)) - Number(taken(y)) || x - y);
  return out.map((s) => (s !== undefined ? s : free.shift()));
}

/**
 * The steerpoints, threats and lines of a mission as `[STPT]` values, in the
 * slots the cartridge (`original`, its `[STPT]` entries) had them in; an
 * entry the board left where it was keeps its text. What does not fit is
 * warned of.
 */
export function bmsStptValues(
  m: MissionState,
  original?: Map<string, string>,
): {
  values: Map<string, string>;
  warnings: ExportWarning[];
  counts: { steerpoints: number; threats: number; lines: number };
} {
  const values = new Map<string, string>();
  const warnings: ExportWarning[] = [];
  const orig = (k: string) => original?.get(k);
  const used = (k: string) => {
    const v = orig(k);
    if (!v) return false;
    const [x, y] = nums(v);
    return Number.isFinite(x) && !zero(x, y);
  };
  /** An unused entry: the cartridge's own text where it was unused too. */
  const unused = (k: string, d: string) => {
    const v = orig(k);
    values.set(k, v !== undefined && !used(k) ? v : d);
  };

  // The route: the cartridge's own flight, else the first flight with a route, else the first group with one.
  const flight = m.groups.find((g) => g.ref === 'stpt') ?? m.groups.find((g) => g.category === 'air' && g.route.length >= 1) ?? m.groups.find((g) => g.route.length >= 1);
  const points = flight ? (flight.route.length ? flight.route : flight.units.slice(0, 1).map((u) => ({ at: u.at }) as MissionWaypoint)) : [];
  if (!flight) warnings.push({ code: 'bms-no-route' });
  if (points.length > 24)
    warnings.push({
      code: 'bms-stpt-many',
      group: flight?.name,
      n: points.length,
    });
  const route = points.slice(0, 24);
  const had = [...Array(24).keys()].filter((i) => used(`target_${i}`));
  const steerSlots = slots(
    route.length,
    24,
    (i) => had[i],
    (s) => used(`target_${s}`),
  );
  const steerTaken = new Set<number>();
  route.forEach((w, i) => {
    const slot = steerSlots[i]!;
    steerTaken.add(slot);
    const key = `target_${slot}`;
    const [x, y, z] = bmsFeet(w.at);
    // The cartridge's own steerpoint where it was: kept as it stands; moved, it keeps its height, action and name.
    const was = orig(key);
    const o = was ? nums(was) : null;
    if (was && o && used(key) && Math.abs(o[0] - x) < 0.5 && Math.abs(o[1] - y) < 0.5) {
      values.set(key, was);
      return;
    }
    const keep = was && used(key) ? was.split(',') : null;
    const name = keep ? keep.slice(4).join(',').trim() : clean((w.name ?? '').replace(/^STPT \d+\s*/, '')) || 'Not set';
    const action = keep ? Number(keep[3]) : Number(Object.entries(ACTIONS).find(([, a]) => a === w.kind)?.[0] ?? -1);
    const height = keep ? Number(keep[2]) : Math.min(0, z);
    values.set(key, `${f6(x)}, ${f6(y)}, ${f6(height)}, ${action}, ${name}`);
  });
  for (let i = 0; i < 24; i++) if (!steerTaken.has(i)) unused(`target_${i}`, '0.000000, 0.000000, 0.000000, -1, Not set');

  // Threats: the zones, each in the slot the cartridge had it in (by place, radius and code), new ones in free slots.
  const threats = m.places.filter((p) => p.kind === 'zone');
  if (threats.length > 15) warnings.push({ code: 'bms-ppt-many', n: threats.length });
  const pptValues = threats.slice(0, 15).map((p) => {
    const [x, y] = bmsFeet(p.at);
    const word = clean(p.name).split(/\s+/)[0] ?? '';
    const code = word.length <= 3 ? word.toUpperCase() : word.slice(0, 3).toUpperCase();
    if (clean(p.name).length > 3) warnings.push({ code: 'bms-ppt-code', what: p.name });
    return `${f6(x)}, ${f6(y)}, 0.000000, ${f6(p.radius ? p.radius / FT : 0.1)}, ${code}`;
  });
  const pptKey = (i: number) => `ppt_${i}`;
  const pptSlots = slots(
    pptValues.length,
    15,
    (i) => [...Array(15).keys()].find((s) => used(pptKey(s)) && same(orig(pptKey(s))!, pptValues[i])) ?? [...Array(15).keys()].find((s) => used(pptKey(s)) && near(orig(pptKey(s))!, pptValues[i])),
    (s) => used(pptKey(s)),
  );
  const pptTaken = new Set<number>();
  pptValues.forEach((v, i) => {
    const slot = pptSlots[i]!;
    pptTaken.add(slot);
    const was = orig(pptKey(slot));
    values.set(pptKey(slot), was && used(pptKey(slot)) && same(was, v) ? was : v);
  });
  for (let i = 0; i < 15; i++) if (!pptTaken.has(i)) unused(pptKey(i), '0.000000, 0.000000, 0.000000, 0.000000,');

  // Lines: four of six points, each in the group the cartridge had it in.
  const all = (m.lines ?? []).filter((l) => l.points.length >= 2);
  const lines = all.slice(0, 4);
  if (all.length > 4 || lines.some((l) => l.points.length > 6)) warnings.push({ code: 'bms-lines', n: all.length });
  const lineKey = (k: number, j: number) => `lineSTPT_${6 * k + j}`;
  const feet = lines.map((l) => l.points.slice(0, 6).map((p) => bmsFeet(p)));
  const groupPoints = (k: number) => [0, 1, 2, 3, 4, 5].filter((j) => used(lineKey(k, j))).map((j) => nums(orig(lineKey(k, j))!));
  const matches = (i: number, k: number) => {
    const g = groupPoints(k);
    return g.length === feet[i].length && g.every((q, j) => Math.abs(q[0] - feet[i][j][0]) < 0.5 && Math.abs(q[1] - feet[i][j][1]) < 0.5);
  };
  const lineSlots = slots(
    lines.length,
    4,
    (i) => [0, 1, 2, 3].find((k) => matches(i, k)),
    (k) => groupPoints(k).length > 0,
  );
  const lineTaken = new Set<number>();
  lines.forEach((_, i) => {
    const k = lineSlots[i]!;
    lineTaken.add(k);
    if (matches(i, k)) {
      for (let j = 0; j < 6; j++) {
        const key = lineKey(k, j);
        if (used(key)) values.set(key, orig(key)!);
        else unused(key, '0.000000, 0.000000, 0.000000');
      }
      return;
    }
    for (let j = 0; j < 6; j++) {
      const q = feet[i][j];
      values.set(lineKey(k, j), q ? `${f6(q[0])}, ${f6(q[1])}, 0.000000` : '0.000000, 0.000000, 0.000000');
    }
  });
  for (let k = 0; k < 4; k++) if (!lineTaken.has(k)) for (let j = 0; j < 6; j++) values.set(lineKey(k, j), '0.000000, 0.000000, 0.000000');
  return {
    values,
    warnings,
    counts: {
      steerpoints: route.length,
      threats: pptValues.length,
      lines: lines.length,
    },
  };
}

/**
 * The cartridge for a plan: `original` (the pilot's `.ini`) with its
 * `[STPT]` steerpoints, threats and lines set from the plan and every other
 * line as it was; without one a cartridge of `[STPT]` alone.
 */
export function writeBmsDtc(m: MissionState, original: Uint8Array | null, theatre?: string): { bytes: Uint8Array; summary: MissionExportSummary } {
  const src = original ? new TextDecoder('latin1').decode(original) : '';
  const lines = parseIni(src);
  const own = new Map<string, string>();
  for (const l of lines) if (l.section.toUpperCase() === 'STPT' && l.key) own.set(l.key, l.value);
  const { values, warnings, counts } = bmsStptValues(m, own);
  const nl = '\r\n';
  let text: string;
  if (original) {
    const done = new Set<string>();
    const out: string[] = [];
    let inStpt = false;
    let sawStpt = false;
    const flushMissing = () => {
      for (const [k] of stptKeys()) if (values.has(k) && !done.has(k)) out.push(`${k}=${values.get(k)}`);
      for (const k of values.keys()) done.add(k);
    };
    for (const l of lines) {
      const header = /^\s*\[/.test(l.raw);
      if (header && inStpt) {
        flushMissing();
        inStpt = false;
      }
      if (header && l.section.toUpperCase() === 'STPT') {
        inStpt = true;
        sawStpt = true;
      }
      if (inStpt && l.key && values.has(l.key)) {
        done.add(l.key);
        out.push(`${l.raw.slice(0, l.raw.indexOf('=') + 1)}${values.get(l.key)}`);
        continue;
      }
      out.push(l.raw);
    }
    if (inStpt) {
      // The section ends the file: what it lacks goes before its trailing blank line.
      const tail: string[] = [];
      while (out.length && out[out.length - 1] === '') tail.push(out.pop()!);
      flushMissing();
      out.push(...tail);
    }
    if (!sawStpt && (counts.steerpoints || counts.threats || counts.lines)) {
      while (out.length && out[out.length - 1] === '') out.pop();
      out.push('[STPT]');
      for (const [k, d] of stptKeys()) out.push(`${k}=${values.get(k) ?? d}`);
      out.push('');
    }
    const eol = /\r\n/.test(src) || !/\n/.test(src) ? nl : '\n';
    text = out.join(eol);
  } else {
    warnings.push({ code: 'bms-new' });
    text = ['[STPT]', ...stptKeys().map(([k, d]) => `${k}=${values.get(k) ?? d}`), ''].join(nl);
  }
  const bytes = new Uint8Array(text.length);
  for (let i = 0; i < text.length; i++) bytes[i] = text.charCodeAt(i) & 255;
  const same = original && bytes.length === original.length && bytes.every((b, i) => b === original[i]);
  return {
    bytes: same ? original : bytes,
    summary: {
      mode: original ? 'patch' : 'new',
      map: theatre || 'Korea KTO',
      groups: counts.steerpoints ? 1 : 0,
      units: counts.steerpoints ? 1 : 0,
      waypoints: counts.steerpoints,
      changed: same ? [] : ['STPT'],
      added: [],
      removed: [],
      untouched: same ? 1 : 0,
      warnings,
    },
  };
}
