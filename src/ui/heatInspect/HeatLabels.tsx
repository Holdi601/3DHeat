/**
 * Heat labels: the hottest places in view named with their heat, and in a
 * signed mode (difference) the most negative too; in team heat, with the
 * group that holds most of it.
 *
 * Read from the CPU-side field (render/heatField.ts), rebuilt between frames
 * when what is drawn changes. Which places get a label is chosen again only
 * when the field changes or the camera comes to rest, so the labels do not
 * flicker while the view moves; each frame only moves them with their places.
 */

import { useEffect, useRef } from 'react';
import { int, num, t, useLang } from '../../i18n';
import { pickHeatLabels, visibleCells, type HeatLabel } from '../../render/heatStack';
import { useInspectStore } from '../../state/inspectStore';
import { useStore } from '../../state/store';
import { useAnimationFrame, useEngine } from '../EngineContext';
import './heatInspect.css';

/** How often the field and the camera are looked at, ms. */
const POLL_MS = 250;

/** The words of a label. */
export function labelText(l: HeatLabel, groupName: (g: number) => string, signed: boolean): string {
  const v = num(l.value, Math.abs(l.value) >= 100 ? 0 : 1);
  const value = signed && l.value > 0 ? `+${v}` : v;
  if (l.group >= 0 && l.share > 0) {
    return t('analysis.labels.group', { value: v, group: groupName(l.group), share: num(l.share * 100, 0) });
  }
  return t(l.side > 0 ? 'analysis.labels.hot' : 'analysis.labels.cold', { value, rank: int(l.rank), rows: int(l.rows) });
}

export function HeatLabels() {
  useLang();
  const engine = useEngine();
  const on = useInspectStore((s) => s.heatLabels);
  const count = useInspectStore((s) => s.heatLabelCount);
  const dataset = useStore((s) => s.dataset);
  const root = useRef<HTMLDivElement>(null);
  const labels = useRef<HeatLabel[]>([]);
  const signed = useRef(false);
  const nodes = useRef<HTMLDivElement[]>([]);

  // Off the frame: keep the field current, and choose the labels when it or the resting camera changes.
  useEffect(() => {
    if (!on || !engine) return;
    let version = -1;
    let pose = '';
    let lastPose = '';
    let chosen = '';
    const id = window.setInterval(() => {
      void engine.heatField.ensure();
      const f = engine.heatField.latest;
      const c = engine.cameraPose();
      const now = [c.position.x, c.position.y, c.position.z, c.forward.x, c.forward.y, c.forward.z].map((v) => v.toPrecision(5)).join(',');
      const resting = now === lastPose;
      lastPose = now;
      if (!f || !engine.heatReading()) {
        if (labels.current.length) labels.current = [];
        return;
      }
      if (f.n === 0) {
        labels.current = [];
        return;
      }
      const key = `${engine.canvas.clientWidth}x${engine.canvas.clientHeight}|${count}`;
      if (engine.heatField.version === version && (now === pose || !resting) && key === chosen) return;
      version = engine.heatField.version;
      pose = now;
      chosen = key;
      const cells = visibleCells(f, (x, y, z) => engine.project(x, y, z), engine.canvas.clientWidth, engine.canvas.clientHeight);
      labels.current = pickHeatLabels(f, cells, count);
      signed.current = f.signed;
    }, POLL_MS);
    return () => {
      window.clearInterval(id);
      labels.current = [];
    };
  }, [on, engine, count, dataset]);

  useAnimationFrame(() => {
    const host = root.current;
    if (!engine || !host) return;
    const list = labels.current;
    const W = engine.canvas.clientWidth;
    const H = engine.canvas.clientHeight;
    const d = useStore.getState().dataset;
    const name = (g: number) => String(d?.teamLabels[g] ?? g);
    if (nodes.current[0] && nodes.current[0].parentNode !== host) nodes.current = [];
    const pool = nodes.current;
    while (pool.length < list.length) {
      const el = document.createElement('div');
      host.appendChild(el);
      pool.push(el);
    }
    pool.forEach((el, i) => {
      const l = list[i];
      const p = l ? engine.project(l.x, l.y, l.z) : null;
      if (!l || !p || p.x < -60 || p.y < -30 || p.x > W + 60 || p.y > H + 30) {
        if (el.style.display !== 'none') el.style.display = 'none';
        return;
      }
      if (el.style.display === 'none') el.style.display = '';
      const cls = `heat-label ${l.side > 0 ? 'hot' : 'cold'}${l.rank === 1 ? ' top' : ''}`;
      if (el.className !== cls) el.className = cls;
      const text = labelText(l, name, signed.current);
      if (el.textContent !== text) el.textContent = text;
      el.style.transform = `translate(${p.x.toFixed(1)}px, ${p.y.toFixed(1)}px) translate(-50%, -130%)`;
    });
  }, on && !!engine);

  if (!on || !engine) return null;
  return <div className="heat-labels" ref={root} data-count={labels.current.length} />;
}
