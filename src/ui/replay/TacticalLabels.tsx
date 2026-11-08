import { useRef } from 'react';
import { useStore } from '../../state/store';
import { useReplayStore, type Scope } from '../../state/replayStore';
import { useAnimationFrame, useEngine } from '../EngineContext';
import { axesOfTrack, bodyDirection, locksAt } from '../../render/tactical';
import { unitsOf } from './units';
import { unitCategory } from './objectType';
import { unitsPerMetre } from './replayData';
import { formatValue } from './fields';
import { t } from '../../i18n';
import type { Dataset } from '../../state/types';
import './replay.css';

/** Most engagement lines drawn at once: the nearest pairs first. */
const MAX_LINES = 60;

const fixedCache = new WeakMap<Dataset, Set<number>>();

/** Tracks that are no one to engage: the recording's own events, navaids, bullseyes, waypoints and other static markers. */
function markers(d: Dataset): Set<number> {
  let out = fixedCache.get(d);
  if (out) return out;
  out = new Set<number>();
  d.personLabels.forEach((l, p) => {
    if (l === '(recording)') out!.add(p);
  });
  const type = d.attrs.find((a) => a.kind === 'category' && /^type$/i.test(a.name.trim()));
  if (type?.categories && d.personId) {
    const fixed = type.categories.map((c) => /navaid|bullseye|waypoint|static/i.test(c));
    const ids = type.data as Uint32Array;
    for (let r = 0; r < d.count; r++) if (fixed[ids[r]]) out.add(d.personId[r]);
  }
  fixedCache.set(d, out);
  return out;
}

/**
 * Words over the tactical display's lines: each lock line's target and range
 * (Tacview's lock labels), and the multiple-engagement lines - from each unit
 * in scope to every opponent within the set range, with the range on each.
 */
export function TacticalLabels() {
  const engine = useEngine();
  const dataset = useStore((s) => s.dataset);
  const aids = useReplayStore((s) => s.aids);
  const root = useRef<HTMLDivElement>(null);
  const lines = useRef<SVGPathElement>(null);
  const pool = useRef<HTMLDivElement[]>([]);
  const on = !!engine && !!dataset && ((aids.lockLabels && aids.locks !== 'off') || aids.engagements !== 'off');

  useAnimationFrame(() => {
    const host = root.current;
    if (!engine || !dataset || !host) return;
    const r = useReplayStore.getState();
    const k = unitsPerMetre(dataset);
    const index = unitsOf(dataset);
    const W = engine.canvas.clientWidth;
    const H = engine.canvas.clientHeight;
    const tracks = engine.liveTracks;
    const pos = new Map<number, (typeof tracks)[number]>();
    for (const tr of tracks) pos.set(tr.person, tr);
    const selected = new Set<number>();
    if (r.follow !== null) selected.add(r.follow);
    if (r.targetPerson !== null) selected.add(r.targetPerson);
    if (r.pair) for (const p of r.pair) selected.add(p);
    const unitOf = (person: number) => index.units[index.personUnit[person]];
    const inScope = (s: Scope, person: number) => {
      if (s === 'off') return false;
      if (s === 'all') return true;
      const u = unitOf(person);
      if (s === 'selected') return selected.has(person) || (!!u && u.key === r.selected);
      return !!u && unitCategory(dataset, u) === s;
    };
    const texts: { x: number; y: number; s: string; cls: string }[] = [];
    const project = (p: { x: number; y: number; z: number }) => engine.project(p.x, p.y, p.z);
    const visible = (p: { x: number; y: number } | null): p is { x: number; y: number } => !!p && p.x > -20 && p.y > -20 && p.x < W + 20 && p.y < H + 20;
    const range = (a: { x: number; y: number; z: number }, b: { x: number; y: number; z: number }) => Math.hypot(b.x - a.x, b.y - a.y, b.z - a.z) / k;

    // ---- lock labels: the target's name and range, along the line toward it
    if (aids.lockLabels && aids.locks !== 'off') {
      for (const tr of tracks) {
        if (!inScope(aids.locks, tr.person) || tr.row < 0) continue;
        const lock = locksAt(dataset, tr.row);
        if (!lock) continue;
        if (lock.persons.length) {
          for (const p of lock.persons) {
            const q = pos.get(p);
            if (!q) continue;
            const at = project({ x: tr.x + (q.x - tr.x) * 0.62, y: tr.y + (q.y - tr.y) * 0.62, z: tr.z + (q.z - tr.z) * 0.62 });
            if (!visible(at)) continue;
            texts.push({ x: at.x, y: at.y, s: t('replay.aids.lockLabel', { name: unitOf(p)?.name ?? '?', range: formatValue('distance', range(tr, q), r.units) }), cls: 'replay-lock' });
          }
        } else if (lock.range > 0) {
          // Locked along angles only: the range at the line's end.
          const dir = bodyDirection(axesOfTrack(tr), lock.az, lock.el);
          const L = lock.range * k;
          const at = project({ x: tr.x + dir[0] * L, y: tr.y + dir[1] * L, z: tr.z + dir[2] * L });
          if (visible(at)) texts.push({ x: at.x, y: at.y, s: t('replay.aids.lockLabel', { name: '—', range: formatValue('distance', lock.range, r.units) }), cls: 'replay-lock' });
        }
      }
    }

    // ---- multiple engagements: each unit in scope to every opponent in range
    let d = '';
    if (aids.engagements !== 'off') {
      const pairs: { a: (typeof tracks)[number]; b: (typeof tracks)[number]; dist: number }[] = [];
      const seen = new Set<string>();
      const fixed = markers(dataset);
      for (const a of tracks) {
        if (fixed.has(a.person)) continue;
        const ua = unitOf(a.person);
        if (!ua || ua.team < 0 || ua.kind === 'weapon' || !inScope(aids.engagements, a.person)) continue;
        for (const b of tracks) {
          const ub = unitOf(b.person);
          if (!ub || ub.team < 0 || ub.team === ua.team || ub.kind === 'weapon' || fixed.has(b.person)) continue;
          const key = a.person < b.person ? `${a.person}:${b.person}` : `${b.person}:${a.person}`;
          if (seen.has(key)) continue;
          const dist = range(a, b);
          if (dist > aids.engagementRange) continue;
          seen.add(key);
          pairs.push({ a, b, dist });
        }
      }
      pairs.sort((x, y) => x.dist - y.dist);
      for (const { a, b, dist } of pairs.slice(0, MAX_LINES)) {
        const pa = project(a);
        const pb = project(b);
        if (!pa || !pb) continue;
        d += `M${pa.x.toFixed(1)},${pa.y.toFixed(1)}L${pb.x.toFixed(1)},${pb.y.toFixed(1)}`;
        const mid = { x: (pa.x + pb.x) / 2, y: (pa.y + pb.y) / 2 };
        if (visible(mid)) texts.push({ x: mid.x, y: mid.y, s: formatValue('distance', dist, r.units), cls: 'replay-engage' });
      }
    }
    lines.current?.setAttribute('d', d);

    // ---- the words, from a pool
    if (pool.current[0] && pool.current[0].parentNode !== host) pool.current = [];
    const nodes = pool.current;
    while (nodes.length < texts.length) {
      const el = document.createElement('div');
      host.appendChild(el);
      nodes.push(el);
    }
    nodes.forEach((el, i) => {
      const tx = texts[i];
      if (!tx) {
        if (el.style.display !== 'none') el.style.display = 'none';
        return;
      }
      el.style.display = '';
      if (el.className !== tx.cls) el.className = tx.cls;
      if (el.textContent !== tx.s) el.textContent = tx.s;
      el.style.transform = `translate(${tx.x.toFixed(1)}px, ${tx.y.toFixed(1)}px) translate(-50%, -50%)`;
    });
  }, on);

  if (!on) return null;
  return (
    <div className="replay-tactical" ref={root}>
      <svg className="replay-pair">
        <path ref={lines} className="replay-engage-line" />
      </svg>
    </div>
  );
}
