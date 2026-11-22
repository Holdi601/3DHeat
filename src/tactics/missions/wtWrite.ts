/**
 * A plan written back as a War Thunder user mission (`.blk`, text): the
 * mission it was made from, patched, or a new one for a level.
 *
 * **Patch.** Each unit block the board left as it was stays byte for byte. A
 * unit moved or turned gets a new matrix (its axes kept when it only moved);
 * a unit changed to another figure a new `unit_class`; a changed weapons
 * state a new `attack_type`; a route whose waypoints moved gets their
 * positions, one with waypoints added or taken away a new `way` block (the
 * waypoints that stay keep their text). A figure no unit block holds becomes
 * a new block in `units`; a unit block whose figure was taken off the board
 * is taken out. Triggers, objectives, areas and everything else stay.
 *
 * **New.** A minimal single mission on a level: the plan's units, the first
 * Blue one the player's, the plan's time of day, weather and date.
 *
 * War Thunder's tasks live in the mission's triggers rather than at
 * waypoints: only the weapons state (`attack_type`) has a place in a unit
 * block, so every other board task is listed as a warning.
 */

import { blkChild, blkMatrix, blkParam, blkReal, blkStr, blkText, lineIndent, parseBlk, type BlkBlock } from './blk';
import { applyEdits, takeSpan, type TextEdit } from './luaWrite';
import { alignRoute, type ExportWarning, type MissionExportSummary } from './dcsWrite';
import { WT_ROE, WT_UNIT_BLOCKS, wtLevelName, wtMatrix, wtYaw } from './wt';
import { WT_ALIASES } from '../../figures/specs/aliases-wt';
import { CATALOG } from '../../figures/catalog';
import type { MissionGroup, MissionState, MissionWaypoint, UnitCategory } from './index';

const BLOCK_OF: Partial<Record<UnitCategory, string>> = { air: 'armada', heli: 'armada', ground: 'tankModels', infantry: 'infantryUnits', sea: 'ships' };
const ATTACK_TYPE: Record<string, string> = Object.fromEntries(Object.entries(WT_ROE).map(([k, v]) => [v, k]));
const DOMAIN: Partial<Record<UnitCategory, string>> = { air: 'air', heli: 'heli', ground: 'ground', sea: 'sea' };

let byFigure: Map<string, string> | null = null;
/** A War Thunder unit class for a figure: one the game names it by, else one of its kind of unit. */
export function wtClassFor(kind: string, c: UnitCategory): { type: string; guessed: boolean } {
  if (!byFigure) {
    byFigure = new Map();
    for (const [id, fig] of Object.entries(WT_ALIASES.aliases ?? {})) if (!byFigure.has(fig)) byFigure.set(fig, id);
  }
  const own = byFigure.get(kind);
  if (own) return { type: own, guessed: false };
  for (const [fig, id] of byFigure) if (CATALOG[fig]?.domain === DOMAIN[c]) return { type: id, guessed: true };
  return { type: '', guessed: true };
}

const flat = (a: { x: number; z: number }, b: { x: number; z: number }) => Math.hypot(a.x - b.x, a.z - b.z);
const angle = (a: number, b: number) => Math.abs(Math.atan2(Math.sin(a - b), Math.cos(a - b)));
const game = (p: { x: number; y: number; z: number }) => [p.x, p.y, -p.z];
const isAir = (c: UnitCategory) => c === 'air' || c === 'heli';

/** The axis rows of a unit facing `yaw` (the heading, clockwise from north), each as long as `scale`. */
function axes(yaw: number, scale = 1): number[][] {
  return [
    [Math.sin(yaw) * scale, 0, Math.cos(yaw) * scale],
    [0, scale, 0],
    [-Math.cos(yaw) * scale, 0, Math.sin(yaw) * scale],
  ];
}

/** A block as text: `name{`, its lines one level in, `}`; a line that is an array is a block in it. */
type Line = string | [string, Line[]];
function blockText(name: string, lines: Line[], indent: string, step: string): string {
  const inner = indent + step;
  const body = lines.map((l) => (typeof l === 'string' ? `${inner}${l}\n` : `${inner}${blockText(l[0], l[1], inner, step)}\n`)).join('');
  return `${name}{\n${body}${indent}}`;
}

/** Heights of an aircraft's new waypoints drawn on the ground: the height before them. */
function lifted(route: MissionWaypoint[], isNew: (i: number) => boolean, c: UnitCategory, warn: (n: number) => void): number[] {
  let last = c === 'heli' ? 150 : 1500;
  let n = 0;
  const out = route.map((w, i) => {
    if (isAir(c) && isNew(i) && w.onGround) {
      n++;
      return last;
    }
    if (!w.onGround && w.at.y > 30) last = w.at.y;
    return w.at.y;
  });
  if (n) warn(n);
  return out;
}

function waypointLines(w: MissionWaypoint, y: number): Line[] {
  return [
    'type:t="normal"',
    `tm:m=${blkMatrix([[1, 0, 0], [0, 1, 0], [0, 0, 1], game({ ...w.at, y })])}`,
    ['props', [`speed:r=${blkReal((w.speed ?? 10) * 3.6)}`, 'moveType:t="MOVETO_STRAIGHT"', 'shouldKeepFormation:b=no', 'tas:b=no', 'canUsePathFinder:b=no']],
  ];
}

class WtPatch {
  readonly edits: TextEdit[] = [];
  readonly warnings: ExportWarning[] = [];
  readonly names = new Set<string>();
  step = '  ';
  constructor(readonly text: string) {}
  replace(start: number, end: number, text: string) {
    this.edits.push({ start, end, text });
  }
  /** Sets a parameter of a block: its value replaced, else a line added at the block's end. */
  set(b: BlkBlock, name: string, type: string, value: string) {
    const p = blkParam(b, name);
    if (p) {
      if (this.text.slice(p.valueStart, p.valueEnd) !== value) this.replace(p.valueStart, p.valueEnd, value);
      return;
    }
    this.insertAtEnd(b, `${name}:${type}=${value}`);
  }
  /** A line (or a block's text) added as the last thing in a block. */
  insertAtEnd(b: BlkBlock, text: string) {
    const ind = lineIndent(this.text, b.start) + this.step;
    const ls = this.text.lastIndexOf('\n', b.close - 1) + 1;
    if (this.text.slice(ls, b.close).trim() === '' && ls > b.open) this.replace(ls, ls, `${ind}${text}\n`);
    else this.replace(b.close, b.close, ` ${text} `);
  }
  unique(base: string) {
    let n = base || 'unit';
    for (let i = 2; this.names.has(n); i++) n = `${base}_${String(i).padStart(2, '0')}`;
    this.names.add(n);
    return n;
  }
}

function newUnitBlock(p: WtPatch, g: MissionGroup, indent: string, sides: string[]): string | null {
  const block = BLOCK_OF[g.category];
  const u = g.units[0];
  if (!block || !u) {
    p.warnings.push({ code: 'static', group: g.name });
    return null;
  }
  const cls = u.type ? { type: u.type, guessed: false } : wtClassFor(u.figure ?? '', g.category);
  if (!cls.type) {
    p.warnings.push({ code: 'type-guess', what: `${u.name} → ?` });
    return null;
  }
  if (cls.guessed) p.warnings.push({ code: 'type-guess', what: `${u.name} → ${cls.type}` });
  if (g.units.length > 1) p.warnings.push({ code: 'wt-count', group: g.name, n: g.units.length });
  const name = p.unique(g.name.replace(/\s+/g, '_'));
  g.name = name;
  const army = g.side === 'red' || sides.indexOf(g.side) === 1 ? 2 : 1;
  const route = g.route.length ? g.route : [{ at: u.at }];
  const alts = lifted(route, () => true, g.category, (n) => p.warnings.push({ code: 'ground', group: name, n }));
  const roe = route.flatMap((w) => w.tasks ?? []).find((t) => t.kind === 'roe')?.state;
  for (const t of route.flatMap((w) => w.tasks ?? [])) if (t.kind !== 'roe') p.warnings.push({ code: 'wt-task', group: name, what: t.name });
  const props: Line[] = [`army:i=${army}`, 'count:i=1'];
  if (isAir(g.category))
    props.push('free_distance:r=70.0', 'floating_distance:r=50.0', 'minimum_distance_to_earth:r=20.0', 'altLimit:r=6000.0', `attack_type:t="${ATTACK_TYPE[roe ?? ''] ?? 'fire_at_will'}"`, 'skill:i=4', [
      'plane',
      ['wing_formation:t="Diamond"', 'row_distances:r=3.0', 'col_distances:r=3.0', 'super_formation:t="Diamond"', 'super_row_distances:r=1.5', 'super_col_distances:r=1.5', 'ai_skill:t="NORMAL"', 'task:t="FLY_WAYPOINT"'],
    ]);
  else props.push('formation_type:t="rows"', 'formation_div:i=3', 'formation_step:p2=2.5, 2.0', 'formation_noise:p2=0.1, 0.1', 'uniqueName:t=""', `attack_type:t="${ATTACK_TYPE[roe ?? ''] ?? 'fire_at_will'}"`);
  const way: Line[] = route.slice(1).map((w, i) => [`${name}_wp_${String(i + 1).padStart(2, '0')}`, waypointLines(w, alts[i + 1])]);
  const lines: Line[] = [
    `name:t=${blkText(name)}`,
    `tm:m=${blkMatrix([...axes(u.yaw), game({ ...u.at, y: alts[0] })])}`,
    `unit_class:t=${blkText(cls.type)}`,
    'objLayer:i=1',
    'closed_waypoints:b=no',
    'isShipSpline:b=no',
    'shipTurnRadius:r=100.0',
    'weapons:t=""',
    ...[0, 1, 2, 3].map((k) => `bullets${k}:t=""`),
    ...[0, 1, 2, 3].map((k) => `bulletsCount${k}:i=0`),
    ['props', props],
    ['way', way],
  ];
  return blockText(block, lines, indent, p.step);
}

function patchUnit(p: WtPatch, b: BlkBlock, g: MissionGroup): boolean {
  const before = p.edits.length;
  const u = g.units[0];
  const tm = wtMatrix(b);
  const tmp = blkParam(b, 'tm');
  if (!u || !tm || !tmp) return false;
  if (g.units.length > 1) p.warnings.push({ code: 'wt-count', group: g.name, n: g.units.length });
  const pos = game(u.at);
  const moved = Math.hypot(pos[0] - tm[3][0], pos[1] - tm[3][1], pos[2] - tm[3][2]) > 0.5;
  const turned = angle(wtYaw(tm[0]), u.yaw) > 0.003;
  if (moved || turned) p.replace(tmp.valueStart, tmp.valueEnd, blkMatrix([...(turned ? axes(u.yaw, Math.hypot(...tm[0]) || 1) : tm.slice(0, 3)), pos]));
  if (!u.type) {
    const cls = wtClassFor(u.figure ?? '', g.category);
    if (cls.type && cls.type.toLowerCase() !== blkStr(b, 'unit_class').toLowerCase()) {
      p.set(b, 'unit_class', 't', blkText(cls.type));
      p.warnings.push({ code: 'retyped', group: g.name, what: cls.type });
    }
  }
  const tasks = g.route.flatMap((w) => w.tasks ?? []);
  for (const t of tasks) if (t.kind !== 'roe') p.warnings.push({ code: 'wt-task', group: g.name, what: t.name });
  const props = blkChild(b, 'props');
  const roe = tasks.find((t) => t.kind === 'roe')?.state;
  const want = roe ? ATTACK_TYPE[roe] : undefined;
  if (props && want && want !== blkStr(props, 'attack_type')) p.set(props, 'attack_type', 't', blkText(want));
  else if (roe && !want) p.warnings.push({ code: 'state', group: g.name, what: roe });
  // The route: the unit's place, then its `way`.
  if (g.category !== 'static') {
    const way = blkChild(b, 'way');
    const old = (way?.blocks ?? []).map((w) => ({ b: w, m: wtMatrix(w) })).filter((w): w is { b: BlkBlock; m: number[][] } => !!w.m);
    const oldAt = [{ x: tm[3][0], z: -tm[3][2] }, ...old.map((w) => ({ x: w.m[3][0], z: -w.m[3][2] }))];
    const route = g.route.length ? g.route : [{ at: u.at }];
    const m = alignRoute(
      route.map((w) => w.at),
      oldAt,
    );
    const alts = lifted(route, (i) => m[i] < 0, g.category, (n) => p.warnings.push({ code: 'ground', group: g.name, n }));
    const movedAt = route.map((w, i) => m[i] < 0 || (i > 0 && (flat(w.at, oldAt[m[i]]) > 0.5 || Math.abs(alts[i] - old[m[i] - 1].m[3][1]) > 0.5)));
    route.forEach((w, i) => {
      if (i === 0 || m[i] <= 0) return;
      const o = old[m[i] - 1];
      const t = blkParam(o.b, 'tm')!;
      if (movedAt[i]) p.replace(t.valueStart, t.valueEnd, blkMatrix([...o.m.slice(0, 3), game({ ...w.at, y: alts[i] })]));
      const op = blkChild(o.b, 'props');
      const was = Number(blkParam(op, 'speed')?.raw ?? NaN);
      if (op && w.speed !== undefined && (movedAt[i] || movedAt[i - 1]) && Math.abs(was - w.speed * 3.6) > 1) p.set(op, 'speed', 'r', blkReal(w.speed * 3.6));
    });
    const identity = route.length === oldAt.length && m.every((j, i) => j === i);
    if (!identity) {
      const indent = way ? lineIndent(p.text, way.start) : lineIndent(p.text, b.start) + p.step;
      for (const o of old) p.names.add(o.b.name);
      const items = route.slice(1).map((w, k) => {
        const i = k + 1;
        if (m[i] > 0) return takeSpan(p.text, old[m[i] - 1].b.start, old[m[i] - 1].b.end, p.edits);
        return blockText(p.unique(`${g.name}_wp_${String(i).padStart(2, '0')}`), waypointLines(w, alts[i]), indent + p.step, p.step);
      });
      const body = items.map((t) => `${indent}${p.step}${t}\n`).join('');
      if (way) {
        takeSpan(p.text, way.open + 1, way.close, p.edits);
        p.replace(way.open + 1, way.close, `\n${body}${indent}`);
      } else p.insertAtEnd(b, `way{\n${body}${indent}}`);
    }
  }
  return p.edits.length !== before;
}

/** The mission's text with the plan's changes made (`MissionState` from `planToMission`). */
export function patchWtMissionText(text: string, m: MissionState): { text: string; summary: MissionExportSummary } {
  const root = parseBlk(text);
  const p = new WtPatch(text);
  const units = blkChild(root, 'units');
  if (!units) throw new Error('not a War Thunder mission: no units block');
  const byName = new Map<string, BlkBlock>();
  for (const b of units.blocks) {
    const n = blkStr(b, 'name');
    if (n) p.names.add(n);
    if (n && WT_UNIT_BLOCKS[b.name]) byName.set(n, b);
    for (const w of blkChild(b, 'way')?.blocks ?? []) p.names.add(w.name);
  }
  const first = units.blocks.find((b) => blkParam(b, 'name'));
  if (first) {
    const fp = blkParam(first, 'name')!;
    const d = lineIndent(text, fp.start).slice(lineIndent(text, first.start).length);
    if (d) p.step = d;
  }
  const level = wtLevelName(blkStr(blkChild(blkChild(root, 'mission_settings'), 'mission'), 'level'));
  const summary: MissionExportSummary = { mode: 'patch', map: level, groups: 0, units: 0, waypoints: 0, changed: [], added: [], removed: [], untouched: 0, warnings: p.warnings };
  const fresh: MissionGroup[] = [];
  for (const g of m.groups) {
    summary.groups++;
    summary.units += g.units.length;
    summary.waypoints += g.route.length;
    const b = g.ref ? byName.get(g.ref) : undefined;
    if (!b) {
      fresh.push(g);
      continue;
    }
    if (patchUnit(p, b, g)) summary.changed.push(g.name);
  }
  for (const ref of m.removed ?? []) {
    const b = byName.get(ref);
    if (!b) continue;
    const ls = text.lastIndexOf('\n', b.start - 1) + 1;
    const nl = text.indexOf('\n', b.end);
    takeSpan(text, ls, nl < 0 ? text.length : nl + 1, p.edits);
    p.replace(ls, nl < 0 ? text.length : nl + 1, '');
    summary.removed.push(ref);
  }
  if (summary.removed.length) p.warnings.push({ code: 'removed', n: summary.removed.length });
  summary.untouched = byName.size - summary.changed.length - summary.removed.length;
  const indent = (first ? lineIndent(text, first.start) : lineIndent(text, units.start) + p.step) || p.step;
  const added = fresh.map((g) => newUnitBlock(p, g, indent, m.sides.map((s) => s.id))).filter((t, i): t is string => !!t && !!summary.added.push(fresh[i].name));
  if (added.length) {
    const ls = text.lastIndexOf('\n', units.close - 1) + 1;
    const own = text.slice(ls, units.close).trim() === '' && ls > units.open;
    p.replace(own ? ls : units.close, own ? ls : units.close, `${own ? '' : '\n'}${added.map((t) => `${indent}${t}\n`).join('')}`);
  }
  for (const g of fresh) if (isAir(g.category) && summary.added.includes(g.name)) p.warnings.push({ code: 'new-air', group: g.name });
  return { text: applyEdits(text, p.edits), summary };
}

/** A minimal single mission on a level, with the plan's units (all of them new). */
export function newWtMissionText(level: string, m: MissionState): { text: string; summary: MissionExportSummary } {
  const info = m.info;
  const hour = info?.start !== undefined ? String(Math.round(info.start / 3600) % 24) : 'Day';
  const date = info?.date;
  const base = [
    'selected_tag:t=""',
    'bin_dump_file:t=""',
    'mission_settings{',
    '  player{',
    '    army:i=1',
    '    wing:t=""',
    '  }',
    '  player_teamB{',
    '    army:i=2',
    '  }',
    '  mission{',
    `    level:t=${blkText(`levels/${level}.bin`)}`,
    '    type:t="singleMission"',
    `    environment:t=${blkText(hour)}`,
    `    weather:t=${blkText(info?.weather?.preset ?? 'clear')}`,
    '    restoreType:t="attempts"',
    '    optionalTakeOff:b=no',
    ...(date ? ['    stars{', `      year:i=${date.year}`, `      month:i=${date.month}`, `      day:i=${date.day}`, '    }'] : []),
    '  }',
    '  spectator_points{',
    '  }',
    '}',
    'imports{',
    '}',
    'triggers{',
    '  isCategory:b=yes',
    '  is_enabled:b=yes',
    '}',
    'mission_objectives{',
    '  isCategory:b=yes',
    '  is_enabled:b=yes',
    '}',
    'variables{',
    '}',
    'dialogs{',
    '}',
    'airfields{',
    '}',
    'effects{',
    '}',
    'units{',
    '}',
    'areas{',
    '}',
    'objLayers{',
    '  layer{',
    '    enabled:b=yes',
    '  }',
    '}',
    'wayPoints{',
    '}',
    '',
  ].join('\n');
  const plain: MissionState = { ...m, groups: m.groups.map((g) => ({ ...g, ref: undefined, units: g.units.map((u) => ({ ...u, ref: undefined })) })), removed: [] };
  const r = patchWtMissionText(base, plain);
  // The player flies (or drives) the first Blue unit.
  const player = plain.groups.find((g) => r.summary.added.includes(g.name) && (g.side === 'blue' || g.side === m.sides[0]?.id));
  if (player) r.text = r.text.replace('    wing:t=""', `    wing:t=${blkText(player.name)}`);
  else r.summary.warnings.push({ code: 'wt-player' });
  return { text: r.text, summary: { ...r.summary, mode: 'new', map: level } };
}

/** The mission for a plan: `original` patched when given, else a new mission on `level`. */
export function writeWtBlk(m: MissionState, original: Uint8Array | null, level?: string): { bytes: Uint8Array; summary: MissionExportSummary } {
  const enc = new TextEncoder();
  if (original) {
    const text = new TextDecoder('utf-8').decode(original);
    const r = patchWtMissionText(text, m);
    return { bytes: r.text === text ? original : enc.encode(r.text), summary: r.summary };
  }
  const lv = level || m.map.replace(/^War Thunder:\s*/i, '');
  if (!lv) throw new Error('a new mission needs a level');
  const r = newWtMissionText(lv, m);
  return { bytes: enc.encode(r.text), summary: r.summary };
}
