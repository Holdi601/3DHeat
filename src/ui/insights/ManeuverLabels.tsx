/**
 * The picked maneuver's labels over the 3D view: each drawn way's owner (the
 * unit by its name, a group by its side, the missile) at the way's end, in
 * the way's colour, so the reader sees who flew or drove which line. A label
 * that would cover another moves down until it is clear.
 */

import { useRef } from 'react';
import { useManeuverLines } from '../../insights/maneuver/lines';
import { useAnimationFrame, useEngine } from '../EngineContext';
import { useReplayStore } from '../../state/replayStore';
import './maneuvers.css';

const css = (rgb: [number, number, number]) => `rgb(${Math.round(rgb[0] * 255)},${Math.round(rgb[1] * 255)},${Math.round(rgb[2] * 255)})`;

export function ManeuverLabels() {
  const engine = useEngine();
  const on = useManeuverLines((s) => s.tags.length > 0);
  const root = useRef<HTMLDivElement>(null);
  const pool = useRef<HTMLDivElement[]>([]);

  useAnimationFrame(() => {
    const host = root.current;
    if (!engine || !host) return;
    const tags = useManeuverLines.getState().tags;
    const W = engine.canvas.clientWidth;
    const H = engine.canvas.clientHeight;
    const k = useReplayStore.getState().labelScale;
    const placed: { x: number; y: number; w: number; h: number; i: number }[] = [];
    tags.forEach((l, i) => {
      const p = engine.project(l.x, l.y, l.z);
      if (!p || p.x < -40 || p.y < -40 || p.x > W + 40 || p.y > H + 40) return;
      const w = (14 + l.text.length * 6.5) * k;
      const h = 18 * k;
      let y = p.y - 14 * k;
      for (let n = 0; n < tags.length && placed.some((q) => Math.abs(q.x - p.x) * 2 < q.w + w && Math.abs(q.y - y) * 2 < q.h + h); n++) y += h + 2;
      placed.push({ x: p.x, y, w, h, i });
    });
    if (pool.current[0] && pool.current[0].parentNode !== host) pool.current = [];
    const nodes = pool.current;
    while (nodes.length < placed.length) {
      const el = document.createElement('div');
      el.className = 'mv-label';
      host.appendChild(el);
      nodes.push(el);
    }
    nodes.forEach((el, n) => {
      const q = placed[n];
      if (!q) {
        if (el.style.display !== 'none') el.style.display = 'none';
        return;
      }
      const l = tags[q.i];
      el.style.display = '';
      if (el.textContent !== l.text) el.textContent = l.text;
      const c = css(l.rgb);
      if (el.style.getPropertyValue('--c') !== c) el.style.setProperty('--c', c);
      el.style.transform = `translate(${q.x.toFixed(1)}px, ${q.y.toFixed(1)}px) translate(-50%, -50%)`;
    });
  }, on && !!engine);

  if (!on || !engine) return null;
  return <div className="mv-labels" ref={root} />;
}
