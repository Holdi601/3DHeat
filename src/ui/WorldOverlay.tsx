import { useEffect, useRef } from 'react';
import { worldToData } from '../render/pose';
import type { ModelLevel } from '../render/level';
import { useStore } from '../state/store';
import { backdropLoader } from '../world/backdropLoader';
import type { BackdropResult, WorldLabel } from '../world/backdrop';
import { theatreById } from '../world/theatres';
import { boxAround, eastNorthOf, heightOf, planeInverse } from '../world/tiles';
import { useAnimationFrame, useEngine } from './EngineContext';

/**
 * What a world backdrop shows over the canvas and does while the view moves:
 * the names of towns and airfields where they are, and - for a theatre built
 * to follow the camera - the detailed area built again round the point under
 * the camera once it has settled, larger when it is high, finer when it is
 * low. Mounted with the canvas, not in a panel, so it runs with the panel
 * closed.
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
/** Detailed area sizes the camera's height picks from, kilometres. */
const SIZES = [12, 25, 50, 100, 200];

/** The detailed area's size for a camera this high above sea level: about six times the height. */
export function sizeForHeight(h: number): number {
  const want = (Math.max(0, h) * 6) / 1000;
  return SIZES.find((s) => s >= want) ?? SIZES[SIZES.length - 1];
}

/** A built backdrop's geometry over a level, keeping its look. */
export function withGeometry(level: ModelLevel, r: BackdropResult): ModelLevel {
  const m = r.mesh;
  const tri = (a: Uint32Array) => a.length / 3;
  return {
    ...level,
    vertices: m.vertices,
    colours: m.colours,
    indices: m.indices,
    structureIndices: m.structureIndices,
    structureEdges: m.structureEdges,
    waterIndices: m.waterIndices,
    triangles: tri(m.indices),
    structureTriangles: tri(m.structureIndices),
    waterTriangles: tri(m.waterIndices),
    sourceTriangles: tri(m.indices),
    sourceStructureTriangles: tri(m.structureIndices),
    partNames: m.partNames,
    partClasses: m.partNames.map((n) => (n === 'building' ? 'structure' : n === 'water' ? 'water' : 'ground')),
    partReasons: m.partNames.map(() => level.partReasons?.[0] ?? ''),
    partRuns: { ...m.partRuns, nav: null },
    partBounds: undefined,
    bounds: m.bounds,
    relief: { ...level.relief, lowY: m.groundBand.minY, highY: m.groundBand.maxY },
    labels: r.labels,
    credits: r.credits,
  };
}

export function WorldOverlay() {
  const engine = useEngine();
  const level = useStore((s) => (s.level?.kind === 'model' ? s.level : null));
  const labels = level?.labels;
  const root = useRef<HTMLDivElement>(null);
  const nodes = useRef<HTMLDivElement[]>([]);

  // ---- names
  useEffect(() => {
    for (const el of nodes.current) el.remove();
    nodes.current = [];
  }, [labels]);
  useAnimationFrame(() => {
    const host = root.current;
    if (!engine || !host || !labels?.length) return;
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
  }, !!labels?.length);

  // ---- the detailed area following the camera
  const still = useRef<{ x: number; y: number; z: number; since: number } | null>(null);
  useEffect(() => {
    if (!engine) return;
    const timer = window.setInterval(() => {
      const s = useStore.getState();
      const lv = s.level?.kind === 'model' ? s.level : null;
      const stream = lv?.stream;
      if (!lv || !stream?.follow || !lv.placement || backdropLoader.busy) return;
      const th = theatreById(stream.theatre);
      if (!th) return;
      // Wait for the camera to settle: building while it moves would chase it.
      const pos = engine.cameraPose().position;
      const now = performance.now();
      const last = still.current;
      const moved = !last || Math.hypot(pos.x - last.x, pos.y - last.y, pos.z - last.z) > 1;
      if (moved) {
        still.current = { ...pos, since: now };
        return;
      }
      if (now - last.since < 1500) return;
      const { geo, axes } = lv.placement;
      const d = worldToData(pos, axes);
      const [e, n] = eastNorthOf(geo, d);
      const [lat, lon] = planeInverse(geo)(e, n);
      const b = th.box;
      if (!(lat > b.south && lat < b.north && lon > b.west && lon < b.east)) return;
      const size = sizeForHeight(heightOf(geo, d));
      const dKm = Math.hypot((lat - stream.centre.lat) * 111.2, (lon - stream.centre.lon) * 111.2 * Math.cos((lat * Math.PI) / 180));
      if (size === stream.size && dKm < size * 0.3) return;
      const asked = stream;
      void backdropLoader
        .build({ geo, axes, context: th.box, box: boxAround(lat, lon, size), runways: stream.runways })
        .then((r) => {
          const cur = useStore.getState().level;
          // Only onto the backdrop it was built for, and only if it still follows.
          if (cur?.kind !== 'model' || cur.stream !== asked || !cur.placement) return;
          s.setLevel({ ...withGeometry(cur, r), stream: { ...asked, centre: { lat, lon }, size } });
        })
        .catch(() => undefined);
    }, 1000);
    return () => window.clearInterval(timer);
  }, [engine]);

  return <div className="world-labels" ref={root} />;
}
