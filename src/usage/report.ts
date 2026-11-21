/**
 * The usage report: from the events (IndexedDB export or the local jsonl
 * files) and the command index, what is used, how it is reached, and - for
 * what is not used - why it might not be. Unused is never read as unneeded:
 * a feature nobody touches may be hidden, unclear, hard to reach or broken,
 * and each of those is told apart by its own evidence.
 *
 * Classes, the first that fits:
 * - possibly broken: clicks that changed nothing, errors right after a use,
 *   or "this doesn't work" feedback;
 * - confusing: tried and then undone, closed within 3 s, toggled back and
 *   forth, rage-clicked, or "I don't understand this";
 * - unclear: its help read more often than it was used;
 * - hard to reach: used, but at a high click cost for how often (typical
 *   steps from rest, panel scroll), found by wandering then the palette, or
 *   only ever reached through the palette;
 * - too hidden: never on screen;
 * - seen, not tried: on screen with its section opened on purpose, never used;
 * - fine but unused: on screen in passing, nothing wrong seen;
 * - used.
 *
 * Pure (no DOM, no imports but the schema), so the settings page and
 * tools/usage-report.mjs build the same report.
 */

import { FPS_BUCKETS, FRICTION, type UsageEvent } from './schema.ts';

/** An entry of the command index (tools/commandIndex.ts). */
export interface IndexEntry {
  tab: string;
  mode?: string;
  path: string[];
  label?: string;
  /** The task group it is in, and whether it is folded under More. */
  task?: string;
  more?: boolean;
}

export type FeatureClass = 'possibly-broken' | 'confusing' | 'unclear' | 'hard-to-reach' | 'too-hidden' | 'seen-not-tried' | 'fine-but-unused' | 'used';
export const CLASS_ORDER: FeatureClass[] = ['possibly-broken', 'confusing', 'unclear', 'hard-to-reach', 'too-hidden', 'seen-not-tried', 'fine-but-unused', 'used'];

export interface FeatureRow {
  id: string;
  /** Uses (a click, a key, a setting changed, a palette run). */
  uses: number;
  /** Opened or revealed: a section, panel, group, or a setting the palette showed. */
  opens: number;
  /** Ms on screen. */
  seenMs: number;
  /** Ms its section or panel was open. */
  openMs: number;
  help: number;
  friction: Partial<Record<(typeof FRICTION)[number], number>>;
  errors: number;
  feedback: Array<{ v: string; note?: string }>;
  /** Uses by source. */
  src: Record<string, number>;
  /** Least clicks from rest by the panel's structure (the index), when known. */
  pathStatic: number | null;
  /** Typical (median) and least steps the recorded uses took. */
  pathTypical: number | null;
  pathLeast: number | null;
  /** Median panel scroll before a use, px. */
  scrollPx: number | null;
  /** Whether a smoke suite exercises it; null when not checked. */
  smoke: boolean | null;
  /** In the command index (a feature the panel has), or only seen in the events. */
  indexed: boolean;
  dev: boolean;
  cls: FeatureClass;
  evidence: string[];
}

export interface Report {
  from: number;
  to: number;
  events: number;
  sessions: number;
  activeMs: number;
  workspaces: Array<{ ws: string; ms: number }>;
  modes: Array<{ mode: string; ms: number }>;
  backends: Record<string, number>;
  screens: Record<string, number>;
  loads: Array<{ method: string; count: number; types: string[]; medianMs: number | null; rows: number[] }>;
  fps: Array<{ ws: string; buckets: Record<string, number> }>;
  degrades: number;
  features: FeatureRow[];
  friction: Array<{ id: string; kind: string; n: number }>;
  misses: Array<{ q: string; n: number }>;
  searches: number;
  feedback: Array<{ id: string; v: string; note?: string; t: number }>;
}

const median = (xs: number[]) => {
  if (!xs.length) return null;
  const s = [...xs].sort((a, b) => a - b);
  return s[s.length >> 1];
};

/** An index entry's feature id. */
export function indexId(e: IndexEntry): string {
  const last = e.path[e.path.length - 1];
  return e.label ? `ctl:${last}/${e.label}` : `sec:${last}`;
}

/** Least clicks from rest (heat workspace, every group shown, sections closed, folds folded). */
export function staticPath(e: IndexEntry): number {
  return (e.tab !== 'heat' ? 1 : 0) + (e.more ? 1 : 0) + e.path.length + (e.label ? 1 : 0);
}

/** Feature ids the viewer has besides the index: keys, workspaces, groups, modes. */
export interface Extra {
  id: string;
  path: number;
}

export interface ReportInput {
  events: UsageEvent[];
  index?: IndexEntry[];
  extras?: Extra[];
  /** Feature ids a smoke suite covers; absent when not checked. */
  smoke?: Set<string>;
}

/** Builds the report. */
export function buildReport({ events, index = [], extras = [], smoke }: ReportInput): Report {
  const rows = new Map<string, FeatureRow>();
  const row = (id: string): FeatureRow => {
    let r = rows.get(id);
    if (!r) {
      r = {
        id, uses: 0, opens: 0, seenMs: 0, openMs: 0, help: 0, friction: {}, errors: 0, feedback: [], src: {},
        pathStatic: null, pathTypical: null, pathLeast: null, scrollPx: null, smoke: smoke ? smoke.has(id) : null,
        indexed: false, dev: false, cls: 'used', evidence: [],
      };
      rows.set(id, r);
    }
    return r;
  };
  for (const e of index) {
    const r = row(indexId(e));
    r.indexed = true;
    const p = staticPath(e);
    r.pathStatic = r.pathStatic === null ? p : Math.min(r.pathStatic, p);
  }
  for (const x of extras) {
    const r = row(x.id);
    r.indexed = true;
    r.pathStatic = r.pathStatic === null ? x.path : Math.min(r.pathStatic, x.path);
  }

  const paths = new Map<string, number[]>();
  const scrolls = new Map<string, number[]>();
  const sessions = new Set<string>();
  const ws = new Map<string, number>();
  const modes = new Map<string, number>();
  const backends: Record<string, number> = {};
  const screens: Record<string, number> = {};
  const loads = new Map<string, { count: number; types: Set<string>; ms: number[]; rows: number[] }>();
  const fps = new Map<string, Record<string, number>>();
  const friction = new Map<string, number>();
  const misses = new Map<string, number>();
  const feedback: Report['feedback'] = [];
  let degrades = 0;
  let searches = 0;
  let activeMs = 0;
  let from = Infinity;
  let to = 0;

  for (const e of events) {
    sessions.add(e.s);
    from = Math.min(from, e.t);
    to = Math.max(to, e.t);
    const r = e.id && !e.id.startsWith('data:') && !e.id.startsWith('scr:') ? row(e.id) : null;
    if (r && e.dev) r.dev = true;
    switch (e.k) {
      case 'session':
        if (e.v) backends[e.v] = (backends[e.v] ?? 0) + 1;
        if (e.id) screens[e.id.slice(4)] = (screens[e.id.slice(4)] ?? 0) + 1;
        break;
      case 'time':
        activeMs += e.ms ?? 0;
        if (e.ws) ws.set(e.ws, (ws.get(e.ws) ?? 0) + (e.ms ?? 0));
        if (e.mode) modes.set(e.mode, (modes.get(e.mode) ?? 0) + (e.ms ?? 0));
        break;
      case 'use':
      case 'set':
        if (!r) break;
        if (e.src) r.src[e.src] = (r.src[e.src] ?? 0) + 1;
        // Done by the viewer itself (a mode switched by a load, a panel opening itself): not a use.
        if (e.src === 'auto') break;
        r.uses++;
        if (e.n !== undefined) (paths.get(r.id) ?? paths.set(r.id, []).get(r.id)!).push(e.n);
        if (e.sc !== undefined) (scrolls.get(r.id) ?? scrolls.set(r.id, []).get(r.id)!).push(e.sc * 100);
        break;
      case 'open':
        if (r) {
          if (e.src) r.src[e.src] = (r.src[e.src] ?? 0) + 1;
          if (e.src === 'auto') break;
          r.opens++;
          // A workspace, a group, a fold or an overlay is used by opening it.
          if (/^(panel|ws|task|more):/.test(r.id)) r.uses++;
        }
        break;
      case 'close':
        if (r && e.ms) r.openMs += e.ms;
        break;
      case 'help':
        if (r) r.help++;
        break;
      case 'friction': {
        if (!r || !e.v) break;
        const k = e.v as (typeof FRICTION)[number];
        r.friction[k] = (r.friction[k] ?? 0) + 1;
        const key = `${r.id}|${k}`;
        friction.set(key, (friction.get(key) ?? 0) + 1);
        break;
      }
      case 'error':
        if (r) r.errors++;
        break;
      case 'seen':
        if (r) r.seenMs += e.ms ?? 0;
        break;
      case 'search':
        searches++;
        if (e.q) misses.set(e.q.toLowerCase(), (misses.get(e.q.toLowerCase()) ?? 0) + 1);
        break;
      case 'pick':
        break;
      case 'load': {
        const m = e.v ?? 'other';
        const l = loads.get(m) ?? loads.set(m, { count: 0, types: new Set(), ms: [], rows: [] }).get(m)!;
        l.count++;
        if (e.id) for (const t of e.id.slice(5).split('+')) l.types.add(t);
        if (e.ms !== undefined) l.ms.push(e.ms);
        if (e.n !== undefined) l.rows.push(e.n);
        break;
      }
      case 'fps': {
        const w = e.ws ?? '?';
        const b = fps.get(w) ?? fps.set(w, {}).get(w)!;
        const name = FPS_BUCKETS[e.n ?? 0] ?? '?';
        b[name] = (b[name] ?? 0) + (e.ms ?? 0);
        break;
      }
      case 'degrade':
        degrades++;
        break;
      case 'feedback':
        if (r && e.v) {
          r.feedback.push({ v: e.v, ...(e.note ? { note: e.note } : {}) });
          feedback.push({ id: r.id, v: e.v, ...(e.note ? { note: e.note } : {}), t: e.t });
        }
        break;
    }
  }

  for (const r of rows.values()) {
    const p = paths.get(r.id);
    if (p) {
      r.pathTypical = median(p);
      r.pathLeast = Math.min(...p);
    }
    const s = scrolls.get(r.id);
    if (s) r.scrollPx = median(s);
    classify(r);
  }
  // Errors not after any feature are their own rows (`err:js`); they stay listed.
  const features = [...rows.values()].sort((a, b) => CLASS_ORDER.indexOf(a.cls) - CLASS_ORDER.indexOf(b.cls) || b.uses - a.uses || b.opens - a.opens || a.id.localeCompare(b.id));

  return {
    from: Number.isFinite(from) ? from : 0,
    to,
    events: events.length,
    sessions: sessions.size,
    activeMs,
    workspaces: [...ws].map(([w, ms]) => ({ ws: w, ms })).sort((a, b) => b.ms - a.ms),
    modes: [...modes].map(([m, ms]) => ({ mode: m, ms })).sort((a, b) => b.ms - a.ms),
    backends,
    screens,
    loads: [...loads].map(([method, l]) => ({ method, count: l.count, types: [...l.types].sort(), medianMs: median(l.ms), rows: l.rows })).sort((a, b) => b.count - a.count),
    fps: [...fps].map(([w, buckets]) => ({ ws: w, buckets })),
    degrades,
    features,
    friction: [...friction].map(([k, n]) => ({ id: k.split('|')[0], kind: k.split('|')[1], n })).sort((a, b) => b.n - a.n),
    misses: [...misses].map(([q, n]) => ({ q, n })).sort((a, b) => b.n - a.n),
    searches,
    feedback: feedback.sort((a, b) => b.t - a.t),
  };
}

/** Sets a row's class and the evidence for it. */
export function classify(r: FeatureRow): void {
  const f = r.friction;
  const ev: string[] = [];
  const dead = f.dead ?? 0;
  const broken = r.feedback.filter((x) => x.v === 'broken').length;
  const unclearFb = r.feedback.filter((x) => x.v === 'unclear').length;
  const abandoned = (f.undo ?? 0) + (f['quick-close'] ?? 0) + (f.toggle ?? 0) + (f.rage ?? 0);
  const tries = r.uses + r.opens;
  const paletteOnly = r.uses >= 2 && (r.src.palette ?? 0) === r.uses;
  if (dead || r.errors || broken) {
    if (dead) ev.push(`${dead} click(s) changed nothing`);
    if (r.errors) ev.push(`${r.errors} error(s) right after use`);
    if (broken) ev.push(`${broken}x "this doesn't work"`);
    r.cls = 'possibly-broken';
  } else if (unclearFb || (abandoned >= 2 && abandoned * 3 >= tries)) {
    if (f.undo) ev.push(`undone ${f.undo}x right after`);
    if (f['quick-close']) ev.push(`closed within 3 s ${f['quick-close']}x`);
    if (f.toggle) ev.push(`toggled back and forth ${f.toggle}x`);
    if (f.rage) ev.push(`rage clicks ${f.rage}x`);
    if (unclearFb) ev.push(`${unclearFb}x "I don't understand this"`);
    r.cls = 'confusing';
  } else if (r.help >= 3 && r.help >= r.uses) {
    ev.push(`help read ${r.help}x, used ${r.uses}x`);
    r.cls = 'unclear';
  } else if (r.uses > 0 && (paletteOnly || (f.lost ?? 0) > 0 || (r.uses >= 2 && ((r.pathTypical ?? 0) >= 4 || (r.scrollPx ?? 0) >= 1500)))) {
    // Costly for how often: a one-off far down a panel is not a layout problem; the same reach twice is.
    if ((r.pathTypical ?? 0) >= 4) ev.push(`typically ${r.pathTypical} steps from rest (least ${r.pathLeast}${r.pathStatic !== null ? `, ${r.pathStatic} by layout` : ''}), used ${r.uses}x`);
    if (paletteOnly) ev.push('only ever reached through Ctrl+K');
    if (f.lost) ev.push(`looked for ${f.lost}x in the panels, then found in the palette`);
    if ((r.scrollPx ?? 0) >= 1500) ev.push(`panel scrolled ${r.scrollPx} px to reach it`);
    r.cls = 'hard-to-reach';
  } else if (r.uses === 0 && r.opens === 0 && r.seenMs === 0) {
    // A key or a palette command has no control to be seen: never used, it is undiscovered.
    const keyOnly = /^(cmd|mode|cam):/.test(r.id);
    ev.push(keyOnly ? 'a key or command with no control on screen; never used' : r.pathStatic !== null ? `never on screen; ${r.pathStatic} clicks from rest by layout` : 'never on screen');
    r.cls = 'too-hidden';
  } else if (r.uses === 0 && r.opens > 0 && !r.id.startsWith('sec:')) {
    ev.push(`on screen ${Math.round(r.seenMs / 1000)} s, opened ${r.opens}x, never used`);
    r.cls = 'seen-not-tried';
  } else if (r.uses === 0 && r.id.startsWith('sec:') && r.opens > 0 && r.openMs < 10_000) {
    ev.push(`opened ${r.opens}x for ${Math.round(r.openMs / 1000)} s in all`);
    r.cls = 'seen-not-tried';
  } else if (r.uses === 0 && r.opens === 0) {
    ev.push(`on screen ${Math.round(r.seenMs / 1000)} s in passing, nothing wrong seen`);
    r.cls = 'fine-but-unused';
  } else {
    if (r.uses) ev.push(`used ${r.uses}x`);
    if (r.opens) ev.push(`opened ${r.opens}x`);
    r.cls = 'used';
  }
  if (r.help && r.cls !== 'unclear') ev.push(`help read ${r.help}x`);
  if (r.smoke === false && r.cls === 'possibly-broken') ev.push('no smoke step covers it');
  r.evidence = ev;
}

/** The to-fix list: possibly broken first, unused ones without a smoke step at the very top. */
export function toFix(r: Report): FeatureRow[] {
  const score = (x: FeatureRow) => (x.uses === 0 ? 2 : 0) + (x.smoke === false ? 1 : 0);
  return r.features.filter((x) => x.cls === 'possibly-broken').sort((a, b) => score(b) - score(a) || b.uses - a.uses);
}

/** Features flagged for a shortcut or a better place: cost (typical steps) times uses, highest first. */
export function reachCost(r: Report): FeatureRow[] {
  return r.features
    .filter((x) => x.uses > 0 && x.pathTypical !== null && x.pathTypical >= 4)
    .sort((a, b) => b.uses * (b.pathTypical ?? 0) - a.uses * (a.pathTypical ?? 0));
}

const dur = (ms: number) => (ms >= 3_600_000 ? `${(ms / 3_600_000).toFixed(1)} h` : ms >= 60_000 ? `${Math.round(ms / 60_000)} min` : `${Math.round(ms / 1000)} s`);

/**
 * The report as text, for the terminal. `name` turns an id into words
 * (the English label); `all` lists every feature, not only the top.
 */
export function formatReport(r: Report, o: { name?: (id: string) => string; top?: number; all?: boolean } = {}): string {
  const top = o.top ?? 25;
  const nm = (id: string) => (o.name ? `${o.name(id)}  [${id}]` : id);
  const out: string[] = [];
  const h = (s: string) => out.push('', s, '-'.repeat(s.length));
  out.push(`3DHeat usage: ${r.events} events, ${r.sessions} page loads, ${dur(r.activeMs)} active` + (r.events ? `, ${new Date(r.from).toISOString().slice(0, 10)} to ${new Date(r.to).toISOString().slice(0, 10)}` : ''));
  h('Time by workspace and view mode');
  for (const w of r.workspaces) out.push(`  ${w.ws.padEnd(10)} ${dur(w.ms).padStart(9)}  ${r.activeMs ? Math.round((w.ms / r.activeMs) * 100) : 0}%`);
  for (const m of r.modes) out.push(`  mode ${m.mode.padEnd(16)} ${dur(m.ms).padStart(9)}`);
  out.push(`  backends: ${Object.entries(r.backends).map(([k, v]) => `${k} ${v}`).join(', ') || '-'};  screens: ${Object.entries(r.screens).map(([k, v]) => `${k} ${v}`).join(', ') || '-'}`);
  h('Data loads');
  for (const l of r.loads) out.push(`  ${l.method.padEnd(10)} ${String(l.count).padStart(5)}x  types ${l.types.join(', ') || '-'}  median ${l.medianMs !== null ? dur(l.medianMs) : '-'}  rows 10^${median(l.rows) ?? '-'}`);
  h(`Top features by use (top ${top})`);
  const used = r.features.filter((x) => x.uses > 0).sort((a, b) => b.uses - a.uses).slice(0, top);
  for (const x of used) {
    const srcs = Object.entries(x.src).sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k} ${v}`).join(', ');
    out.push(`  ${String(x.uses).padStart(5)}  ${nm(x.id)}`);
    out.push(`         via ${srcs}; steps typical ${x.pathTypical ?? '-'}, least ${x.pathLeast ?? '-'}, by layout ${x.pathStatic ?? '-'}${x.scrollPx ? `; scrolled ${x.scrollPx} px` : ''}`);
  }
  h(`Top sections and panels by time open (top ${top})`);
  for (const x of r.features.filter((x) => x.openMs > 0).sort((a, b) => b.openMs - a.openMs).slice(0, top)) out.push(`  ${dur(x.openMs).padStart(9)}  ${nm(x.id)}  (opened ${x.opens}x)`);
  h('To fix first: possibly broken (unused and without a smoke step on top)');
  const fix = toFix(r);
  if (!fix.length) out.push('  none seen');
  for (const x of fix) out.push(`  ${nm(x.id)}: ${x.evidence.join('; ')}${x.smoke === null ? '' : x.smoke ? '; smoke: yes' : '; smoke: NO'}`);
  h('Hard to reach for how often it is used (shortcut, quick bar or a better place?)');
  const hard = r.features.filter((x) => x.cls === 'hard-to-reach');
  const cost = reachCost(r).filter((x) => x.cls !== 'hard-to-reach').slice(0, 10);
  if (!hard.length && !cost.length) out.push('  none seen');
  for (const x of [...hard, ...cost]) out.push(`  ${nm(x.id)}: ${x.evidence.join('; ') || `typically ${x.pathTypical} steps, used ${x.uses}x`}`);
  h('Friction hot spots');
  if (!r.friction.length) out.push('  none seen');
  for (const f of r.friction.slice(0, top)) out.push(`  ${String(f.n).padStart(4)}  ${f.kind.padEnd(14)} ${nm(f.id)}`);
  h(`Palette searches that found nothing (${r.misses.length} distinct of ${r.searches} searches)`);
  if (!r.misses.length) out.push('  none');
  for (const m of r.misses.slice(0, top)) out.push(`  ${String(m.n).padStart(4)}  "${m.q}"`);
  h('Feedback');
  if (!r.feedback.length) out.push('  none');
  for (const f of r.feedback) out.push(`  ${new Date(f.t).toISOString().slice(0, 10)}  ${f.v.padEnd(8)} ${nm(f.id)}${f.note ? `: ${f.note}` : ''}`);
  h('Frame rate by workspace (time per bucket)');
  for (const f of r.fps) out.push(`  ${f.ws.padEnd(10)} ${FPS_BUCKETS.map((b) => `${b} ${dur(f.buckets[b] ?? 0)}`).join('  ')}`);
  out.push(`  quality switch turned extras off ${r.degrades}x`);
  h('Unused features, by why');
  const counts = new Map<FeatureClass, number>();
  for (const x of r.features) counts.set(x.cls, (counts.get(x.cls) ?? 0) + 1);
  out.push(`  ${CLASS_ORDER.map((c) => `${c} ${counts.get(c) ?? 0}`).join(' · ')}`);
  for (const c of ['too-hidden', 'seen-not-tried', 'fine-but-unused'] as FeatureClass[]) {
    const list = r.features.filter((x) => x.cls === c);
    out.push(`  ${c} (${list.length})${o.all ? ':' : `, first ${Math.min(top, list.length)}:`}`);
    for (const x of o.all ? list : list.slice(0, top)) out.push(`    ${nm(x.id)}: ${x.evidence.join('; ')}${x.smoke === null ? '' : x.smoke ? '; smoke: yes' : '; smoke: no'}`);
  }
  if (o.all) {
    h('Every feature');
    out.push('  class            uses opens seen  steps(typ/least/layout) smoke  id');
    for (const x of r.features)
      out.push(`  ${x.cls.padEnd(16)} ${String(x.uses).padStart(4)} ${String(x.opens).padStart(5)} ${dur(x.seenMs).padStart(6)}  ${`${x.pathTypical ?? '-'}/${x.pathLeast ?? '-'}/${x.pathStatic ?? '-'}`.padEnd(23)} ${x.smoke === null ? '-' : x.smoke ? 'yes' : 'no'}    ${nm(x.id)}${x.dev ? ' (dev)' : ''}`);
  }
  return out.join('\n');
}
