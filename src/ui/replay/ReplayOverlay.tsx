import { useEffect, useRef } from 'react';
import { useStore } from '../../state/store';
import { braa, useReplayStore } from '../../state/replayStore';
import { useAnimationFrame, useEngine } from '../EngineContext';
import { eventRows, trackName, unitsPerMetre } from './replayData';
import { num, t } from '../../i18n';
import './replay.css';

/**
 * Over box replay: each live track's name (and, in full, its height and
 * speed), the range and bearing between a picked pair, and the events of the
 * last seconds where they happened. Built straight into the DOM each frame -
 * tracks come and go every frame, and React would re-render the sidebar with
 * them. A click on a name follows it; a shift-click picks it for the pair.
 */
export function ReplayOverlay() {
  const engine = useEngine();
  const dataset = useStore((s) => s.dataset);
  const mode = useStore((s) => s.mode);
  const root = useRef<HTMLDivElement>(null);
  const line = useRef<SVGLineElement>(null);
  const lineText = useRef<HTMLDivElement>(null);
  const nodes = useRef(new Map<number, HTMLDivElement>());
  const events = useRef(new Map<number, HTMLDivElement>());
  const history = useRef(new Map<number, { x: number; y: number; z: number; t: number; speed: number }>());
  const on = mode === 'team' && !!dataset;

  useEffect(() => {
    // A new dataset: no labels of the old one.
    for (const el of nodes.current.values()) el.remove();
    for (const el of events.current.values()) el.remove();
    nodes.current.clear();
    events.current.clear();
    history.current.clear();
  }, [dataset]);

  useAnimationFrame(() => {
    const host = root.current;
    if (!engine || !host || !dataset) return;
    const r = useReplayStore.getState();
    const now = engine.live.playhead;
    // Shown in metres whatever the data's unit.
    const k = unitsPerMetre(dataset);
    const seen = new Set<number>();
    const pos = new Map<number, { x: number; y: number; z: number }>();
    for (const tr of engine.liveTracks) {
      pos.set(tr.person, tr);
      // Speed from the track's own last position, eased.
      const h = history.current.get(tr.person);
      if (!h) history.current.set(tr.person, { x: tr.x, y: tr.y, z: tr.z, t: now, speed: 0 });
      else if (now > h.t + 0.05) {
        const v = Math.hypot(tr.x - h.x, tr.y - h.y, tr.z - h.z) / (now - h.t);
        h.speed = h.speed ? h.speed * 0.7 + v * 0.3 : v;
        h.x = tr.x;
        h.y = tr.y;
        h.z = tr.z;
        h.t = now;
      } else if (now < h.t) history.current.set(tr.person, { x: tr.x, y: tr.y, z: tr.z, t: now, speed: 0 });
      if (r.labels === 'off') continue;
      seen.add(tr.person);
      let el = nodes.current.get(tr.person);
      if (!el) {
        el = document.createElement('div');
        el.className = 'replay-label';
        const person = tr.person;
        el.onclick = (e) => {
          if (e.shiftKey) useReplayStore.getState().pick(person);
          else useReplayStore.getState().toggleFollow(person);
        };
        host.appendChild(el);
        nodes.current.set(tr.person, el);
      }
      const p = engine.project(tr.x, tr.y, tr.z);
      if (!p) {
        el.style.display = 'none';
        continue;
      }
      el.style.display = '';
      el.style.transform = `translate(${p.x.toFixed(1)}px, ${(p.y - 6).toFixed(1)}px) translate(-50%, -100%)`;
      const name = trackName(dataset, tr.person, tr.row);
      const speed = history.current.get(tr.person)?.speed ?? 0;
      const text = r.labels === 'full' ? `${name} · ${t('replay.label.alt', { m: num(tr.y / k, 0) })} · ${t('replay.label.speed', { kmh: num((speed / k) * 3.6, 0) })}` : name;
      if (el.textContent !== text) el.textContent = text;
      el.classList.toggle('followed', r.follow === tr.person);
      el.classList.toggle('picked', r.pairFrom === tr.person || (r.pair !== null && r.pair.includes(tr.person)));
    }
    for (const [person, el] of nodes.current) {
      if (seen.has(person)) continue;
      el.remove();
      nodes.current.delete(person);
    }

    // The pair: a line between them and its numbers at the middle.
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
        lineText.current.style.transform = `translate(${((pa.x + pb.x) / 2).toFixed(1)}px, ${((pa.y + pb.y) / 2).toFixed(1)}px) translate(-50%, -50%)`;
        lineText.current.textContent = t('replay.braa', {
          bearing: String(Math.round(m.bearing)).padStart(3, '0'),
          range: m.slant >= 1000 ? t('replay.km', { v: num(m.slant / 1000, 1) }) : t('replay.m', { v: num(m.slant, 0) }),
          dy: (m.dy >= 0 ? '+' : '−') + num(Math.abs(m.dy), 0),
        });
      } else {
        line.current.style.display = 'none';
        lineText.current.style.display = 'none';
      }
    }

    // Events of the last ten seconds, where they happened, fading.
    const ev = eventRows(dataset);
    const shown = new Set<number>();
    if (ev && dataset.time) {
      for (let i = 0; i < ev.rows.length; i++) {
        const row = ev.rows[i];
        const age = now - dataset.time[row];
        if (age < 0 || age > 10) continue;
        const p = engine.project(dataset.px[row], dataset.py[row], dataset.pz[row]);
        if (!p) continue;
        shown.add(row);
        let el = events.current.get(row);
        if (!el) {
          el = document.createElement('div');
          el.className = 'replay-event';
          el.textContent = ev.labels[i];
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
    </div>
  );
}
