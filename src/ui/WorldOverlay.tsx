import { useEffect, useRef } from 'react';
import { useStore } from '../state/store';
import type { WorldLabel } from '../world/backdrop';
import { worldStreamer } from '../world/stream';
import type { GroundPins } from '../world/groundPins';
import { groundPinsSteps } from '../world/pinsOfData';
import type { Dataset, GeoPlacement } from '../state/types';
import { useAnimationFrame, useEngine } from './EngineContext';

/**
 * What a world backdrop shows over the canvas and does while the view moves:
 * the names of towns and airfields where they are, and - for a streamed
 * theatre - the tiles round the camera, chosen a few times a second
 * (src/world/stream). Mounted with the canvas, not in a panel, so it runs
 * with the panel closed.
 */

/**
 * Farthest a name of each kind is written, metres from the camera: at least
 * `near`, and `perHeight` times the camera's height above the names, so
 * climbing shows more of the map's names and fewer of the small ones crowd.
 */
const REACH: Record<WorldLabel['kind'], { near: number; perHeight: number; max: number }> = {
  city: { near: 60_000, perHeight: 12, max: 600_000 },
  airfield: { near: 30_000, perHeight: 8, max: 200_000 },
  town: { near: 20_000, perHeight: 5, max: 90_000 },
  village: { near: 6_000, perHeight: 2, max: 20_000 },
};
const PRIORITY: Record<WorldLabel['kind'], number> = { city: 0, airfield: 1, town: 2, village: 3 };
/** Most names on screen at once. */
const MAX_LABELS = 70;
/** How often the streamed tiles are chosen again, milliseconds. */
const STREAM_EVERY = 250;

/** Each dataset's ground pins: worked out once, in slices between frames; 'busy' while they are. */
const pinsOf = new WeakMap<Dataset, GroundPins | null | 'busy'>();

/**
 * The ground pins of `d` for a streamed level on `placement`: null when there
 * are none to take (no data, data on another plane, no vehicles), undefined
 * while they are still being worked out.
 */
function pinsFor(d: Dataset | null, placement: GeoPlacement): GroundPins | null | undefined {
  const g = d?.geo;
  const p = placement.geo;
  if (!d || !g || g.lat0 !== p.lat0 || g.lon0 !== p.lon0 || g.projection !== p.projection) return null;
  const have = pinsOf.get(d);
  if (have === 'busy') return undefined;
  if (have !== undefined) return have;
  pinsOf.set(d, 'busy');
  const steps = groundPinsSteps(d);
  const slice = () => {
    const end = performance.now() + 4;
    for (;;) {
      const r = steps.next();
      if (r.done) return void pinsOf.set(d, r.value);
      if (performance.now() >= end) break;
    }
    setTimeout(slice, 0);
  };
  setTimeout(slice, 0);
  return undefined;
}

export function WorldOverlay() {
  const engine = useEngine();
  const level = useStore((s) => (s.level?.kind === 'model' ? s.level : null));
  const root = useRef<HTMLDivElement>(null);
  const nodes = useRef<HTMLDivElement[]>([]);
  const streamed = !!level?.stream;

  // ---- names: the level's own, and the streamed tiles'
  useAnimationFrame(() => {
    const host = root.current;
    if (!engine || !host) return;
    const own = level?.labels ?? [];
    // A streamed name the level already gives (a DCS level's towns under the real world) is written once.
    const named = worldStreamer.running && own.length ? new Set(own.map((l) => l.text.toLowerCase())) : null;
    const streamed = named ? worldStreamer.labels.filter((l) => !named.has(l.text.toLowerCase())) : worldStreamer.labels;
    const labels = worldStreamer.running ? [...own, ...streamed] : own;
    if (!labels.length) {
      for (const el of nodes.current) el.style.display = 'none';
      return;
    }
    const eye = engine.cameraPose().position;
    const scale = level?.placement?.axes?.scale || 1;
    const near: Array<{ l: WorldLabel; d: number }> = [];
    for (const l of labels) {
      const d = Math.hypot(l.x - eye.x, l.y - eye.y, l.z - eye.z) / scale;
      const r = REACH[l.kind];
      const height = Math.abs(eye.y - l.y) / scale;
      if (d <= Math.min(r.max, Math.max(r.near, height * r.perHeight))) near.push({ l, d });
    }
    near.sort((a, b) => PRIORITY[a.l.kind] - PRIORITY[b.l.kind] || a.d - b.d);
    const shown = near.slice(0, MAX_LABELS);
    while (nodes.current.length < shown.length) {
      const el = document.createElement('div');
      host.appendChild(el);
      nodes.current.push(el);
    }
    const w = host.clientWidth;
    const h = host.clientHeight;
    nodes.current.forEach((el, i) => {
      const s = shown[i];
      const p = s ? engine.project(s.l.x, s.l.y, s.l.z) : null;
      if (!s || !p || p.x < -50 || p.y < -20 || p.x > w + 50 || p.y > h + 20) {
        el.style.display = 'none';
        return;
      }
      el.style.display = '';
      const cls = `world-label ${s.l.kind}`;
      if (el.className !== cls) el.className = cls;
      if (el.textContent !== s.l.text) el.textContent = s.l.text;
      el.style.transform = `translate(${p.x.toFixed(1)}px, ${p.y.toFixed(1)}px) translate(-50%, -100%)`;
    });
  }, !!level);

  // ---- the streamed theatre: tiles round the camera
  useEffect(() => {
    if (!engine) return;
    worldStreamer.onChange = () => engine.invalidate(2);
    const timer = window.setInterval(() => {
      const lv = useStore.getState().level;
      if (lv?.kind === 'model' && lv.stream && lv.placement) {
        // The recording's vehicles' ground under it (`groundPins.ts`): waited for, so the tiles are built once, with it.
        const pins = pinsFor(useStore.getState().dataset, lv.placement);
        if (pins === undefined) return;
        worldStreamer.start({ placement: lv.placement, imagery: lv.stream.imagery, runways: lv.stream.runways, dcs: lv.stream.dcs ?? null, pins });
        worldStreamer.update(engine.cameraPose().position);
      } else if (worldStreamer.running) worldStreamer.stop();
    }, STREAM_EVERY);
    return () => {
      window.clearInterval(timer);
      worldStreamer.onChange = null;
    };
  }, [engine]);
  useEffect(() => {
    if (!streamed && worldStreamer.running) worldStreamer.stop();
  }, [streamed]);

  return <div className="world-labels" ref={root} />;
}
