import { useEffect, useRef } from 'react';
import { useStore } from '../../state/store';
import { braa, useReplayStore } from '../../state/replayStore';
import { useInspectStore } from '../../state/inspectStore';
import { rgbToCss, teamBaseColor } from '../../render/colors';
import { useAnimationFrame, useEngine } from '../EngineContext';
import { defaultEventKinds, eventRows, eventWords, markedInView, unitsPerMetre } from './replayData';
import { allFields, fieldName, fieldShort, fieldText, isNumeric, type FieldContext } from './fields';
import { personAt, unitsOf, type Unit } from './units';
import { groundProbe, teamName } from './replayView';
import { labelCategory, labelRank, ruleFields } from './labelRules';
import { isOverlay } from '../../match/overlay';
import { limitSide } from './altitudeLimits';
import { num, t } from '../../i18n';
import type { Engine } from '../../render/engine';
import './replay.css';
import { unitPrefs } from '../../state/unitsStore';
import { lookAtUnit } from './pair';

/** Pixels a click may be off a unit and still be on it. */
const HIT_PX = 16;

interface Placed {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
  person: number;
}

/** Select a unit and follow it with the camera. */
export function selectAndFollow(unit: Unit, person: number): void {
  useReplayStore.setState({ selected: unit.key, follow: person, followUnit: unit.key });
}

/**
 * Over the match replay: each live unit's label - the fields the viewer
 * chose, placed so they do not pile up - a card of every field for the unit
 * under the pointer, the range and bearing between a picked pair, and the
 * events of the last seconds where they happened. Built straight into the DOM
 * each frame - units come and go every frame, and React would re-render the
 * sidebar with them.
 *
 * A click on a label or a unit selects it (its data top left) and follows it;
 * a shift-click picks it for the pair. While following, the wheel moves the
 * camera in and out.
 */
export function ReplayOverlay() {
  const engine = useEngine();
  const dataset = useStore((s) => s.dataset);
  const mode = useStore((s) => s.mode);
  const root = useRef<HTMLDivElement>(null);
  const line = useRef<SVGLineElement>(null);
  const lineText = useRef<HTMLDivElement>(null);
  const hover = useRef<HTMLDivElement>(null);
  const nodes = useRef(new Map<number, HTMLDivElement>());
  const events = useRef(new Map<number, HTMLDivElement>());
  const cursor = useRef<{ x: number; y: number } | null>(null);
  const placed = useRef<Placed[]>([]);
  const suppressPick = useRef(0);
  const on = mode === 'team' && !!dataset;

  useEffect(() => {
    // A new dataset: no labels of the old one.
    for (const el of nodes.current.values()) el.remove();
    for (const el of events.current.values()) el.remove();
    nodes.current.clear();
    events.current.clear();
    const r = useReplayStore.getState();
    useReplayStore.setState({ follow: null, followUnit: null, selected: null, pair: null, pairFrom: null, eventUnit: null, target: null, targetPerson: null, chart: { ...r.chart, units: [] } });
  }, [dataset]);

  // The pointer, for the hover card; clicks on units; the wheel while following.
  useEffect(() => {
    if (!engine || !on) return;
    const canvas = engine.canvas;
    let down: { x: number; y: number; travel: number } | null = null;
    const local = (e: MouseEvent) => {
      const r = canvas.getBoundingClientRect();
      return { x: e.clientX - r.left, y: e.clientY - r.top };
    };
    const onMove = (e: MouseEvent) => {
      if (down) down.travel += Math.abs(e.movementX) + Math.abs(e.movementY);
      const p = local(e);
      const inside = p.x >= 0 && p.y >= 0 && p.x <= canvas.clientWidth && p.y <= canvas.clientHeight;
      cursor.current = inside && e.buttons === 0 && !document.pointerLockElement ? p : null;
    };
    const onDown = (e: MouseEvent) => {
      if (e.target !== canvas || e.button !== 0) return;
      down = { ...local(e), travel: 0 };
    };
    const onUp = (e: MouseEvent) => {
      const d = down;
      down = null;
      if (!d || e.button !== 0 || d.travel > 4) return;
      const ds = useStore.getState().dataset;
      if (!ds) return;
      const hit = nearestTrack(engine, d.x, d.y, placed.current);
      if (hit === null) return;
      const u = unitsOf(ds);
      const unit = u.units[u.personUnit[hit]];
      if (!unit) return;
      if (e.shiftKey) useReplayStore.getState().pick(hit);
      // Ctrl or Alt: the camera stays on the followed unit and looks at this one.
      else if (e.ctrlKey || e.altKey) lookAtUnit(unit, hit);
      else selectAndFollow(unit, hit);
      // The click also asked the inspector what is there; the unit is the answer.
      suppressPick.current = performance.now() + 1500;
      engine.inspector.clear();
    };
    const onWheel = (e: WheelEvent) => {
      if (e.target !== canvas || useReplayStore.getState().follow === null) return;
      e.preventDefault();
      e.stopPropagation();
      const perNotch = e.deltaMode === 1 ? 3 : e.deltaMode === 2 ? 1 : 100;
      const notches = Math.max(-4, Math.min(4, e.deltaY / perNotch));
      const r = useReplayStore.getState();
      r.setFollowDistance(r.followDistance * 1.18 ** notches);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mousedown', onDown);
    window.addEventListener('mouseup', onUp);
    // Capturing, so it is answered before the fly camera turns it into fly speed.
    window.addEventListener('wheel', onWheel, { capture: true, passive: false });
    const unsub = useInspectStore.subscribe((s, prev) => {
      const p = s.pick;
      if (!p || p === prev.pick) return;
      if (performance.now() < suppressPick.current) {
        if (p.kind !== 'pending') engine.inspector.clear();
        return;
      }
      // A click that found a drawn sample of a unit: that unit.
      if (p.kind !== 'data' || p.row === undefined || !p.dataset?.personId || useStore.getState().mode !== 'team') return;
      const person = p.dataset.personId[p.row];
      const u = unitsOf(p.dataset);
      const unit = u.units[u.personUnit[person]];
      if (!unit) return;
      selectAndFollow(unit, person);
      engine.inspector.clear();
    });
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mousedown', onDown);
      window.removeEventListener('mouseup', onUp);
      window.removeEventListener('wheel', onWheel, { capture: true });
      unsub();
    };
  }, [engine, on]);

  useAnimationFrame(() => {
    const host = root.current;
    if (!engine || !host || !dataset) return;
    const r = useReplayStore.getState();
    const s = useStore.getState();
    const now = engine.live.playhead;
    const k = unitsPerMetre(dataset);
    const ui = unitsOf(dataset);
    const session = s.team.session;
    const groundAt = groundProbe(engine, dataset);
    const team = (i: number) => teamName(dataset, i);
    // The figure overlay has a figure per player per round: labels and markers only when asked.
    const overlayed = isOverlay(dataset);
    const showLabels = overlayed ? r.overlayLabels : r.labels;

    // The followed unit moves on to its next life when one ends.
    if (r.followUnit) {
      const u = ui.byKey.get(r.followUnit);
      if (u) {
        const p = personAt(u, now);
        if (p !== r.follow && engine.liveTracks.some((tr) => tr.person === p)) r.followTo(p);
      }
    }

    // The target of the padlock and target views likewise.
    if (r.target) {
      const u = ui.byKey.get(r.target);
      const p = u ? personAt(u, now) : null;
      if (p !== null && p !== r.targetPerson && engine.liveTracks.some((tr) => tr.person === p)) useReplayStore.setState({ targetPerson: p });
    }

    const pos = new Map<number, { x: number; y: number; z: number }>();
    for (const tr of engine.liveTracks) pos.set(tr.person, tr);
    const refPos = r.follow !== null ? pos.get(r.follow) : undefined;
    const ref = r.follow !== null && refPos ? { person: r.follow, pos: refPos } : null;
    const ctxOf = (unit: Unit, person: number, p: { x: number; y: number; z: number }): FieldContext => ({
      d: dataset,
      unit,
      person,
      time: now,
      session,
      units: unitPrefs(),
      pos: p,
      k,
      ref: ref && ref.person !== person ? ref : null,
      groundAt,
    });

    // ---- labels, most important first, each where it does not cover another
    const cam = engine.cameraPose().position;
    const weaponMarks = useStore.getState().team.weaponMarks;
    const order = engine.liveTracks
      .map((tr) => {
        const unit = ui.units[ui.personUnit[tr.person]];
        const special =
          r.follow === tr.person ? 0 : unit && r.selected === unit.key ? 1 : r.pair?.includes(tr.person) || r.pairFrom === tr.person || r.targetPerson === tr.person ? 2 : null;
        // Each kind of object labelled by its own rule; the units in question by theirs.
        // Decoys and shells are never labelled; weapons only as their rule (or "drop lines and labels on weapons") says.
        const base = unit ? r.labelRules[labelCategory(dataset, unit, special !== null)] : r.labelRules.ground;
        const rule = unit && special === null && (unit.decoy || (unit.kind === 'weapon' && weaponMarks)) ? { ...base, show: !unit.decoy } : base;
        const rank = labelRank(special, rule.priority);
        return { tr, unit, rank, rule, dist: Math.hypot(tr.x - cam.x, tr.y - cam.y, tr.z - cam.z) };
      })
      .sort((a, b) => a.rank - b.rank || a.dist - b.dist);
    const out: Placed[] = [];
    const seen = new Set<number>();
    const W = host.clientWidth;
    const H = host.clientHeight;
    // The labels' size, as the viewer set it; the layout below is in the same scale.
    const scale = r.labelScale;
    if (host.style.getPropertyValue('--label-scale') !== String(scale)) host.style.setProperty('--label-scale', String(scale));
    const limits = r.limits.on && (r.limits.floor !== null || r.limits.ceiling !== null) ? r.limits : null;
    // One label a unit: its newest track. A track that has just ended can still be drawn beside the next for a moment.
    const newest = new Map<Unit, number>();
    for (const { tr, unit } of order) {
      if (!unit) continue;
      const was = newest.get(unit);
      const start = (p: number) => unit.spans[unit.persons.indexOf(p)]?.[0] ?? 0;
      if (was === undefined || start(tr.person) > start(was)) newest.set(unit, tr.person);
    }
    for (const { tr, unit, rank, rule } of order) {
      if (!unit || newest.get(unit) !== tr.person) continue;
      if (!showLabels && rank > 1) continue;
      // A kind of object whose rule hides its labels is labelled only when it is one in question.
      if (rank > 2 && !rule.show) continue;
      const p = engine.project(tr.x, tr.y, tr.z);
      if (!p || p.x < -50 || p.y < -50 || p.x > W + 50 || p.y > H + 50) continue;
      const c = ctxOf(unit, tr.person, tr);
      const head: string[] = [];
      const nums: string[] = [];
      for (const f of ruleFields(dataset, rule, r.labelFields)) {
        const v = fieldText(c, f, team);
        if (!v) continue;
        if (isNumeric(f)) nums.push(`${fieldShort(f)} ${v}`);
        else head.push(v);
      }
      if (!head.length) head.push(unit.name);
      const lines = [head.join(' · ')];
      if (nums.length) lines.push(nums.join(' · '));
      const text = lines.join('\n');
      // Sized from the text rather than measured: a layout read per label per frame costs more than it buys.
      const w = (Math.max(...lines.map((l) => l.length)) * 6.2 + 12) * scale;
      const h = (lines.length * 14 + 4) * scale;
      // Clear of the figure: as far out as about six metres of it reach on screen, within reason.
      const up = engine.project(tr.x, tr.y + 8 * k, tr.z);
      const m = Math.max(rank === 0 ? 22 : 10, Math.min(110, up ? Math.hypot(up.x - p.x, up.y - p.y) : 10));
      const spots = [
        [-w / 2, -h - m],
        [m + 2, -h / 2],
        [-w - m - 2, -h / 2],
        [-w / 2, m],
        [m, -h - m * 0.7],
        [-w - m, -h - m * 0.7],
      ];
      let at: [number, number] | null = null;
      for (const [dx, dy] of spots) {
        const box = { x0: p.x + dx, y0: p.y + dy, x1: p.x + dx + w, y1: p.y + dy + h };
        if (!r.declutter || rank <= 1 || !out.some((o) => o.x0 < box.x1 && box.x0 < o.x1 && o.y0 < box.y1 && box.y0 < o.y1)) {
          at = [box.x0, box.y0];
          out.push({ ...box, person: tr.person });
          break;
        }
      }
      if (!at) continue;
      seen.add(tr.person);
      let el = nodes.current.get(tr.person);
      if (!el) {
        el = document.createElement('div');
        el.className = 'replay-label';
        host.appendChild(el);
        nodes.current.set(tr.person, el);
      }
      el.style.transform = `translate(${at[0].toFixed(1)}px, ${at[1].toFixed(1)}px)`;
      if (el.textContent !== text) el.textContent = text;
      const color = unit.team >= 0 ? rgbToCss(teamBaseColor(unit.team)) : '#9aa3ad';
      if (el.style.borderLeftColor !== color) el.style.borderLeftColor = color;
      el.classList.toggle('followed', r.follow === tr.person);
      el.classList.toggle('selected', r.selected === unit.key);
      el.classList.toggle('picked', r.pairFrom === tr.person || (r.pair !== null && r.pair.includes(tr.person)));
      el.classList.toggle('ai', unit.kind !== 'player');
      // Outside the altitude restriction: the label turns red.
      el.classList.toggle('alarm', !!limits && unit.kind !== 'weapon' && limitSide(tr.y / k, limits) !== 0);
    }
    placed.current = out;
    for (const [person, el] of nodes.current) {
      if (seen.has(person)) continue;
      el.remove();
      nodes.current.delete(person);
    }

    // ---- the card under the pointer: every field the unit has
    const card = hover.current;
    if (card) {
      const at = cursor.current;
      const hit = at ? nearestTrack(engine, at.x, at.y, out, true) : null;
      const tr = hit !== null ? pos.get(hit) : undefined;
      const unit = hit !== null ? ui.units[ui.personUnit[hit]] : undefined;
      if (at && hit !== null && tr && unit) {
        const c = ctxOf(unit, hit, tr);
        const rows: string[] = [];
        for (const f of allFields()) {
          if (f === 'name') continue;
          const v = fieldText(c, f, team);
          if (v) rows.push(`<span>${esc(fieldName(f))}</span><b>${esc(v)}</b>`);
        }
        const html = `<div class="hh">${esc(unit.name)}</div><div class="hg">${rows.join('')}</div><div class="hf">${esc(t('replay.hoverHint'))}</div>`;
        if (card.innerHTML !== html) card.innerHTML = html;
        card.style.display = '';
        const cw = card.offsetWidth;
        const ch = card.offsetHeight;
        const x = at.x + 18 + cw > W ? at.x - 18 - cw : at.x + 18;
        const y = Math.max(4, Math.min(H - ch - 4, at.y - ch / 2));
        card.style.transform = `translate(${x.toFixed(0)}px, ${y.toFixed(0)}px)`;
      } else if (card.style.display !== 'none') card.style.display = 'none';
    }

    // ---- the pair: a line between them and its numbers at the middle
    const a = r.pair ? pos.get(r.pair[0]) : undefined;
    const b = r.pair ? pos.get(r.pair[1]) : undefined;
    const pa = a ? engine.project(a.x, a.y, a.z) : null;
    const pb = b ? engine.project(b.x, b.y, b.z) : null;
    if (line.current && lineText.current) {
      if (a && b && pa && pb) {
        const m = braa({ x: a.x / k, y: a.y / k, z: a.z / k }, { x: b.x / k, y: b.y / k, z: b.z / k });
        line.current.setAttribute('x1', String(pa.x));
        line.current.setAttribute('y1', String(pa.y));
        line.current.setAttribute('x2', String(pb.x));
        line.current.setAttribute('y2', String(pb.y));
        line.current.style.display = '';
        lineText.current.style.display = '';
        // Line of sight, as Tacview draws it: red and dashed where the ground is between them.
        const blocked = r.aids.lineOfSight && losBlocked(engine, a, b);
        line.current.setAttribute('stroke', blocked ? '#ff5a5a' : '#ffd166');
        line.current.setAttribute('stroke-dasharray', blocked ? '3 5' : '6 4');
        lineText.current.classList.toggle('blocked', blocked);
        lineText.current.style.transform = `translate(${((pa.x + pb.x) / 2).toFixed(1)}px, ${((pa.y + pb.y) / 2).toFixed(1)}px) translate(-50%, -50%)`;
        lineText.current.textContent = t('replay.braa', {
          bearing: String(Math.round(m.bearing) % 360).padStart(3, '0'),
          range: m.slant >= 1000 ? t('replay.km', { v: num(m.slant / 1000, 1) }) : t('replay.m', { v: num(m.slant, 0) }),
          dy: (m.dy >= 0 ? '+' : '−') + num(Math.abs(m.dy), 0),
        });
      } else {
        line.current.style.display = 'none';
        lineText.current.style.display = 'none';
      }
    }

    // ---- events of the last ten seconds, where they happened, fading
    const ev = eventRows(dataset);
    const shown = new Set<number>();
    const kinds = new Set((r.eventKinds ?? (ev ? defaultKindsOf(ev.labels) : [])).filter(markedInView));
    if (ev && dataset.time && (!overlayed || r.overlayMarkers)) {
      // From the first event at most ten seconds old: the rows are in time order.
      let lo = 0;
      let hi = ev.rows.length;
      while (lo < hi) {
        const mid = (lo + hi) >> 1;
        if (dataset.time[ev.rows[mid]] < now - 10) lo = mid + 1;
        else hi = mid;
      }
      for (let i = lo; i < ev.rows.length && shown.size < 60; i++) {
        const row = ev.rows[i];
        const age = now - dataset.time[row];
        if (age < 0) break;
        if (session >= 0 && dataset.sessionId && dataset.sessionId[row] !== session) continue;
        if (!kinds.has(ev.labels[i])) continue;
        const p = engine.project(dataset.px[row], dataset.py[row], dataset.pz[row]);
        if (!p) continue;
        shown.add(row);
        let el = events.current.get(row);
        if (!el) {
          el = document.createElement('div');
          el.className = 'replay-event';
          const words = eventWords(ev.texts[i] ? `${ev.labels[i]}: ${ev.texts[i]}` : ev.labels[i]);
          el.textContent = words.length > 60 ? `${words.slice(0, 59)}…` : words;
          host.appendChild(el);
          events.current.set(row, el);
        }
        el.style.opacity = String(1 - age / 10);
        el.style.transform = `translate(${p.x.toFixed(1)}px, ${p.y.toFixed(1)}px) translate(-50%, -50%)`;
      }
    }
    for (const [row, el] of events.current) {
      if (shown.has(row)) continue;
      el.remove();
      events.current.delete(row);
    }
  }, on);

  if (!on) return null;
  return (
    <div className="replay-overlay" ref={root}>
      <svg className="replay-pair">
        <line ref={line} stroke="#ffd166" strokeWidth={1.5} strokeDasharray="6 4" style={{ display: 'none' }} />
      </svg>
      <div className="replay-braa" ref={lineText} style={{ display: 'none' }} />
      <div className="replay-hover" ref={hover} style={{ display: 'none' }} />
    </div>
  );
}

const kindCache = new WeakMap<string[], string[]>();
function defaultKindsOf(labels: string[]): string[] {
  let k = kindCache.get(labels);
  if (!k) kindCache.set(labels, (k = defaultEventKinds(labels)));
  return k;
}

/**
 * The live track under a canvas point: a label there, else the figure drawn there, else the nearest unit within reach.
 * A `hover`, asked each frame, may answer from a pick a few frames old (`Engine.figureAt`).
 */
function nearestTrack(engine: Engine, x: number, y: number, labels: Placed[], hover = false): number | null {
  for (let i = labels.length - 1; i >= 0; i--) {
    const l = labels[i];
    if (x >= l.x0 && x <= l.x1 && y >= l.y0 && y <= l.y1) return l.person;
  }
  // The figure as drawn - turned, and grown to its smallest size on screen - that the pointer is on.
  const onFigure = engine.figureAt(x, y, hover);
  if (onFigure !== null) return onFigure;
  let best: number | null = null;
  let bestD = HIT_PX;
  for (const tr of engine.liveTracks) {
    const p = engine.project(tr.x, tr.y, tr.z);
    if (!p) continue;
    const d = Math.hypot(p.x - x, p.y - y);
    if (d < bestD) {
      bestD = d;
      best = tr.person;
    }
  }
  return best;
}

/** Whether the level's surface is between two points (on its index; false while it cannot say). */
function losBlocked(engine: Engine, a: { x: number; y: number; z: number }, b: { x: number; y: number; z: number }): boolean {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const dz = b.z - a.z;
  const len = Math.hypot(dx, dy, dz);
  if (len < 1e-6) return false;
  const hit = engine.inspector.surfaceHit({ origin: a, dir: { x: dx / len, y: dy / len, z: dz / len } });
  if (!hit) return false;
  const along = Math.hypot(hit.x - a.x, hit.y - a.y, hit.z - a.z);
  // Not the ground right under either end (a tank sits on it).
  return along > len * 0.02 && along < len * 0.98;
}

function esc(s: string): string {
  return s.replace(/[&<>"]/g, (c) => (c === '&' ? '&amp;' : c === '<' ? '&lt;' : c === '>' ? '&gt;' : '&quot;'));
}
