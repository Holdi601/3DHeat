import { useRef } from 'react';
import { useAnimationFrame, useEngine } from '../EngineContext';
import { useObjectivesStore } from '../../state/objectivesStore';
import { t } from '../../i18n';
import type { ObjectiveLabel } from '../../render/objectives';
import './objectives.css';

/** Pixels kept between two labels. */
const GAP = 3;

function textOf(l: ObjectiveLabel): string {
  switch (l.kind) {
    case 'zone':
      return l.text;
    case 'spawn':
      return l.text ? t('objectives.label.spawnCount', { count: Number(l.text) }) : t('objectives.label.spawn');
    default:
      return t(`objectives.label.${l.kind}`);
  }
}

const css = (rgb: [number, number, number]) => `rgb(${Math.round(rgb[0] * 255)},${Math.round(rgb[1] * 255)},${Math.round(rgb[2] * 255)})`;

/**
 * The objectives' words over the view: a zone's letter in its owner's colour,
 * a spawn's count, what a marker is. The more important first where two
 * would cover each other (zones, then airfields, spawns, targets), the
 * nearer first among equals; the rest are left out until there is room.
 */
export function ObjectiveLabels() {
  const engine = useEngine();
  const on = useObjectivesStore((s) => s.on && s.labels);
  const root = useRef<HTMLDivElement>(null);
  const pool = useRef<HTMLDivElement[]>([]);

  useAnimationFrame(() => {
    const host = root.current;
    if (!engine || !host) return;
    const labels = engine.objectiveDraw.labels;
    const W = engine.canvas.clientWidth;
    const H = engine.canvas.clientHeight;
    const cam = engine.cameraPose().position;
    const placed: {
      x: number;
      y: number;
      w: number;
      h: number;
      l: ObjectiveLabel;
      s: string;
    }[] = [];
    const order = labels.map((l) => ({ l, d: Math.hypot(l.x - cam.x, l.y - cam.y, l.z - cam.z) })).sort((a, b) => b.l.priority - a.l.priority || a.d - b.d);
    for (const { l } of order) {
      const p = engine.project(l.x, l.y, l.z);
      if (!p || p.x < -40 || p.y < -40 || p.x > W + 40 || p.y > H + 40) continue;
      const s = textOf(l);
      const w = l.kind === 'zone' ? 24 : 12 + s.length * 6.5;
      const h = l.kind === 'zone' ? 24 : 18;
      // A zone's letter sits on it; the rest a little above their place.
      const y = l.kind === 'zone' ? p.y : p.y - 12;
      const hit = placed.some((q) => Math.abs(q.x - p.x) * 2 < q.w + w + GAP * 2 && Math.abs(q.y - y) * 2 < q.h + h + GAP * 2);
      if (hit) continue;
      placed.push({ x: p.x, y, w, h, l, s });
    }
    if (pool.current[0] && pool.current[0].parentNode !== host) pool.current = [];
    const nodes = pool.current;
    while (nodes.length < placed.length) {
      const el = document.createElement('div');
      host.appendChild(el);
      nodes.push(el);
    }
    nodes.forEach((el, i) => {
      const q = placed[i];
      if (!q) {
        if (el.style.display !== 'none') el.style.display = 'none';
        return;
      }
      el.style.display = '';
      const cls = `objective-label ${q.l.kind}`;
      if (el.className !== cls) el.className = cls;
      if (el.textContent !== q.s) el.textContent = q.s;
      const c = css(q.l.rgb);
      if (el.style.getPropertyValue('--c') !== c) el.style.setProperty('--c', c);
      el.style.transform = `translate(${q.x.toFixed(1)}px, ${q.y.toFixed(1)}px) translate(-50%, -50%)`;
    });
  }, on && !!engine);

  if (!on || !engine) return null;
  return <div className="objective-labels" ref={root} />;
}
