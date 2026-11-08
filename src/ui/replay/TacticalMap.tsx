import { useEffect, useMemo, useRef, useState } from 'react';
import { useStore } from '../../state/store';
import { useReplayStore } from '../../state/replayStore';
import { rgbToCss, teamBaseColor } from '../../render/colors';
import { useAnimationFrame, useEngine } from '../EngineContext';
import { t, useLang } from '../../i18n';
import { flightSeries, sampleIndex } from '../../data/flight';
import { unitsOf, type Unit } from './units';
import { unitShape, type ObjectShape } from './objectType';
import { unitsPerMetre } from './replayData';
import { autoBookmarks } from './bookmarks';
import { selectAndFollow } from './ReplayOverlay';
import { bullseyes } from './fields';
import { niceLength } from './charts';
import { fromMap, frameBox, headingOnMap, toMap, zoomAt, type MapView } from './tacmap';
import './replay.css';
import { unitPrefs } from '../../state/unitsStore';
import type { UnitSystem } from '../../state/replayStore';
import { formatLength, formatLong } from '../../units/format';
import { fromAltitude, longUnitMetres } from '../../units/units';
import { VolumeGestures } from '../../volumes/gestures';
import { drawVolumesOnMap, mapHost } from '../../volumes/mapDraw';
import { useVolumeStore } from '../../volumes/store';

interface Drawn {
  x: number;
  y: number;
  person: number;
  unit: Unit;
}

/** One symbol: its outline as the shape says, along its heading. */
function symbol(
  g: CanvasRenderingContext2D,
  shape: ObjectShape,
  x: number,
  y: number,
  dir: [number, number],
  filled: boolean,
  color: string,
): void {
  g.save();
  g.translate(x, y);
  g.rotate(Math.atan2(dir[0], -dir[1]));
  g.beginPath();
  switch (shape) {
    case 'jet':
      g.moveTo(0, -8);
      g.lineTo(6, 6);
      g.lineTo(0, 3);
      g.lineTo(-6, 6);
      g.closePath();
      break;
    case 'heli':
      g.arc(0, 0, 5, 0, Math.PI * 2);
      g.moveTo(-8, -1);
      g.lineTo(8, -1);
      break;
    case 'sea':
      g.moveTo(0, -9);
      g.lineTo(4, -3);
      g.lineTo(4, 7);
      g.lineTo(-4, 7);
      g.lineTo(-4, -3);
      g.closePath();
      break;
    case 'weapon':
      g.moveTo(0, -6);
      g.lineTo(0, 3);
      break;
    case 'person':
      g.arc(0, 0, 3.5, 0, Math.PI * 2);
      break;
    default:
      g.rect(-5, -5, 10, 10);
      g.moveTo(0, -5);
      g.lineTo(0, -10);
  }
  g.strokeStyle = color;
  g.fillStyle = color;
  g.lineWidth = shape === 'weapon' ? 2 : 1.5;
  if (filled && shape !== 'weapon') {
    g.globalAlpha = 0.85;
    g.fill();
    g.globalAlpha = 1;
    g.strokeStyle = 'rgba(0,0,0,0.6)';
    g.lineWidth = 1;
  }
  g.stroke();
  g.restore();
}

/**
 * The tactical map: the match from above, north up, each live unit as a
 * symbol of its kind (filled for players, outlined for AI) turned to its
 * heading, with its trail of the last seconds, its name, a scale bar, range
 * rings around the followed unit, the 3D camera's place and view, and the
 * kills and deaths of the last seconds. In a corner of the view or over all
 * of it; drag to pan, wheel to zoom, a click on a unit follows it.
 */
export function TacticalMap() {
  const engine = useEngine();
  const dataset = useStore((s) => s.dataset);
  const mode = useStore((s) => s.mode);
  const map = useReplayStore((s) => s.map);
  const mapTrail = useReplayStore((s) => s.mapTrail);
  const mapNames = useReplayStore((s) => s.mapNames);
  const canvas = useRef<HTMLCanvasElement>(null);
  const view = useRef<MapView | null>(null);
  const drawn = useRef<Drawn[]>([]);
  const [centred, setCentred] = useState(true);
  const centredRef = useRef(centred);
  centredRef.current = centred;
  useLang();
  const on = !!engine && !!dataset && map !== 'off' && mode === 'team';
  const index = useMemo(() => (dataset ? unitsOf(dataset) : null), [dataset]);
  // Volumes are drawn and edited here as on the 3D view (volumes/gestures.ts).
  const gest = useMemo(
    () =>
      new VolumeGestures(
        mapHost(
          (x, z) => {
            const c = canvas.current;
            return view.current && c ? toMap(view.current, c.clientWidth, c.clientHeight, x, z) : null;
          },
          (px, py) => {
            const c = canvas.current;
            return view.current && c ? fromMap(view.current, c.clientWidth, c.clientHeight, px, py) : null;
          },
          () => useStore.getState().dataset,
        ),
      ),
    [],
  );

  // A new recording or size: framed whole again.
  useEffect(() => {
    view.current = null;
  }, [dataset, map]);

  // Drag to pan, wheel to zoom, click to follow.
  useEffect(() => {
    const c = canvas.current;
    if (!c || !on) return;
    let drag: { x: number; y: number; moved: number } | null = null;
    let volumeDrag = false;
    const local = (e: MouseEvent): [number, number] => {
      const r = c.getBoundingClientRect();
      return [e.clientX - r.left, e.clientY - r.top];
    };
    const down = (e: PointerEvent) => {
      if (e.button !== 0) return;
      c.setPointerCapture(e.pointerId);
      e.stopPropagation();
      const [lx, ly] = local(e);
      if (gest.down(lx, ly, { shift: e.shiftKey, alt: e.altKey })) {
        volumeDrag = true;
        return;
      }
      drag = { x: e.clientX, y: e.clientY, moved: 0 };
    };
    const move = (e: PointerEvent) => {
      if (volumeDrag || !drag) {
        const [lx, ly] = local(e);
        gest.move(lx, ly, { shift: e.shiftKey, alt: e.altKey });
        return;
      }
      if (!view.current) return;
      const dx = e.clientX - drag.x;
      const dy = e.clientY - drag.y;
      drag.moved += Math.abs(dx) + Math.abs(dy);
      drag.x = e.clientX;
      drag.y = e.clientY;
      if (drag.moved > 3) {
        view.current = {
          ...view.current,
          cx: view.current.cx - dx * view.current.upp,
          cz: view.current.cz - dy * view.current.upp,
        };
        if (centredRef.current) setCentred(false);
      }
    };
    const up = (e: PointerEvent) => {
      if (volumeDrag) {
        volumeDrag = false;
        const [lx, ly] = local(e);
        gest.up(lx, ly, { shift: e.shiftKey, alt: e.altKey });
        return;
      }
      const d = drag;
      drag = null;
      if (!d || d.moved > 3) return;
      const r = c.getBoundingClientRect();
      const x = e.clientX - r.left;
      const y = e.clientY - r.top;
      let best: Drawn | null = null;
      let bd = 12;
      for (const s of drawn.current) {
        const dd = Math.hypot(s.x - x, s.y - y);
        if (dd < bd) {
          bd = dd;
          best = s;
        }
      }
      if (best) {
        selectAndFollow(best.unit, best.person);
        setCentred(true);
      } else gest.click(x, y);
    };
    const dbl = (e: MouseEvent) => {
      if (gest.dblclick()) e.stopPropagation();
    };
    const wheel = (e: WheelEvent) => {
      if (!view.current) return;
      e.preventDefault();
      e.stopPropagation();
      const r = c.getBoundingClientRect();
      view.current = zoomAt(
        view.current,
        r.width,
        r.height,
        e.clientX - r.left,
        e.clientY - r.top,
        Math.pow(1.0015, e.deltaY),
      );
    };
    c.addEventListener('pointerdown', down);
    c.addEventListener('pointermove', move);
    c.addEventListener('pointerup', up);
    c.addEventListener('wheel', wheel, { passive: false });
    c.addEventListener('dblclick', dbl);
    return () => {
      c.removeEventListener('dblclick', dbl);
      c.removeEventListener('pointerdown', down);
      c.removeEventListener('pointermove', move);
      c.removeEventListener('pointerup', up);
      c.removeEventListener('wheel', wheel);
    };
  }, [on, gest]);

  useAnimationFrame(() => {
    const c = canvas.current;
    if (!engine || !dataset || !index || !c) return;
    const w = c.clientWidth;
    const h = c.clientHeight;
    if (!w || !h) return;
    const dpr = window.devicePixelRatio || 1;
    if (c.width !== Math.round(w * dpr) || c.height !== Math.round(h * dpr)) {
      c.width = Math.round(w * dpr);
      c.height = Math.round(h * dpr);
    }
    const g = c.getContext('2d');
    if (!g) return;
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    const r = useReplayStore.getState();
    const tracks = engine.liveTracks;
    const k = unitsPerMetre(dataset);
    const b = dataset.bounds;
    if (!view.current) view.current = frameBox(b.minX, b.maxX, b.minZ, b.maxZ, w, h);
    const followed = r.follow !== null ? tracks.find((tr) => tr.person === r.follow) : undefined;
    if (centredRef.current && followed)
      view.current = { ...view.current, cx: followed.x, cz: followed.z };
    const v = view.current;
    const now = engine.live.playhead;
    const session = useStore.getState().team.session;

    g.fillStyle = 'rgba(14, 17, 22, 0.92)';
    g.fillRect(0, 0, w, h);

    // ---- a grid at the scale bar's spacing
    const bar = niceBar((w * 0.3 * v.upp) / k, unitPrefs());
    const step = bar * k;
    if (step / v.upp > 12) {
      g.strokeStyle = 'rgba(255,255,255,0.06)';
      g.lineWidth = 1;
      g.beginPath();
      const [x0, z0] = fromMap(v, w, h, 0, 0);
      const [x1, z1] = fromMap(v, w, h, w, h);
      for (let x = Math.ceil(x0 / step) * step; x <= x1; x += step) {
        const [px] = toMap(v, w, h, x, 0);
        g.moveTo(px, 0);
        g.lineTo(px, h);
      }
      for (let z = Math.ceil(z0 / step) * step; z <= z1; z += step) {
        const [, py] = toMap(v, w, h, 0, z);
        g.moveTo(0, py);
        g.lineTo(w, py);
      }
      g.stroke();
    }
    // The data's extent.
    const [bx0, by0] = toMap(v, w, h, b.minX, b.minZ);
    const [bx1, by1] = toMap(v, w, h, b.maxX, b.maxZ);
    g.strokeStyle = 'rgba(255,255,255,0.18)';
    g.setLineDash([4, 4]);
    g.strokeRect(bx0, by0, bx1 - bx0, by1 - by0);
    g.setLineDash([]);

    // ---- bullseyes, with rings at the scale bar's spacing
    for (const [team, bull] of bullseyes(dataset)) {
      const [bx, by] = toMap(v, w, h, bull.x, bull.z);
      g.strokeStyle = team >= 0 ? rgbToCss(teamBaseColor(team)) : 'rgba(255,255,255,0.6)';
      g.globalAlpha = 0.6;
      g.lineWidth = 1;
      for (let i = 1; i <= 4; i++) {
        g.beginPath();
        g.arc(bx, by, (bar * i * k) / v.upp, 0, Math.PI * 2);
        g.stroke();
      }
      g.globalAlpha = 1;
      g.beginPath();
      g.arc(bx, by, 5, 0, Math.PI * 2);
      g.moveTo(bx - 9, by);
      g.lineTo(bx + 9, by);
      g.moveTo(bx, by - 9);
      g.lineTo(bx, by + 9);
      g.stroke();
    }

    // ---- range rings around the followed unit
    if (followed) {
      const [fx, fy] = toMap(v, w, h, followed.x, followed.z);
      g.strokeStyle = 'rgba(111,182,255,0.28)';
      g.fillStyle = 'rgba(111,182,255,0.7)';
      g.font = '10px system-ui, sans-serif';
      for (let i = 1; i <= 3; i++) {
        const rr = (bar * i * k) / v.upp;
        g.beginPath();
        g.arc(fx, fy, rr, 0, Math.PI * 2);
        g.stroke();
        g.fillText(distanceText(bar * i, unitPrefs()), fx + rr * 0.71 + 2, fy - rr * 0.71 - 2);
      }
    }

    // ---- trails
    const shapes = new Map<number, ObjectShape>();
    const units: (Unit | undefined)[] = tracks.map(
      (tr) => index.units[index.personUnit[tr.person]],
    );
    if (mapTrail > 0) {
      g.lineWidth = 1.2;
      for (let i = 0; i < tracks.length; i++) {
        const tr = tracks[i];
        const u = units[i];
        if (!u) continue;
        const shape = unitShape(dataset, u);
        shapes.set(tr.person, shape);
        const s = flightSeries(dataset, tr.person, session);
        if (!s) continue;
        const end = sampleIndex(s, now);
        if (end < 0) continue;
        const since = now - (shape === 'weapon' ? Math.min(mapTrail, 20) : mapTrail);
        g.strokeStyle = u.team >= 0 ? rgbToCss(teamBaseColor(u.team)) : '#9aa3ad';
        g.globalAlpha = 0.55;
        g.beginPath();
        // From where it is now back along its samples; a gap (a respawn) lifts the pen.
        const [nx, ny] = toMap(v, w, h, tr.x, tr.z);
        g.moveTo(nx, ny);
        let prevT = now;
        for (let j = end; j >= 0 && s.time[j] >= since; j--) {
          const [px, py] = toMap(v, w, h, s.x[j] * k, s.z[j] * k);
          if (prevT - s.time[j] > 10) g.moveTo(px, py);
          else g.lineTo(px, py);
          prevT = s.time[j];
        }
        g.stroke();
        g.globalAlpha = 1;
      }
    }

    // ---- kills and deaths of the last ten seconds
    const marks = autoBookmarks(dataset);
    g.lineWidth = 2;
    for (let i = marks.length - 1; i >= 0; i--) {
      const m = marks[i];
      const age = now - m.time;
      if (age < 0) continue;
      if (age > 10) break;
      if (m.kind !== 'death') continue;
      const [px, py] = toMap(v, w, h, dataset.px[m.row], dataset.pz[m.row]);
      g.strokeStyle = `rgba(255,110,90,${(1 - age / 10).toFixed(2)})`;
      g.beginPath();
      g.moveTo(px - 5, py - 5);
      g.lineTo(px + 5, py + 5);
      g.moveTo(px + 5, py - 5);
      g.lineTo(px - 5, py + 5);
      g.stroke();
    }

    // ---- the units
    const out: Drawn[] = [];
    g.font = '11px system-ui, sans-serif';
    const order = tracks
      .map((_, i) => i)
      .sort(
        (a, bb) =>
          (shapes.get(tracks[a].person) === 'weapon' ? 0 : 1) -
          (shapes.get(tracks[bb].person) === 'weapon' ? 0 : 1),
      );
    for (const i of order) {
      const tr = tracks[i];
      const u = units[i];
      if (!u) continue;
      const [px, py] = toMap(v, w, h, tr.x, tr.z);
      if (px < -20 || py < -20 || px > w + 20 || py > h + 20) continue;
      const shape = shapes.get(tr.person) ?? unitShape(dataset, u);
      const color = u.team >= 0 ? rgbToCss(teamBaseColor(u.team)) : '#9aa3ad';
      symbol(g, shape, px, py, headingOnMap(tr.yaw), u.kind === 'player', color);
      const isFollowed = r.follow === tr.person;
      const isTarget = r.targetPerson === tr.person;
      if (isFollowed || isTarget || r.selected === u.key) {
        g.strokeStyle = isFollowed ? '#6fb6ff' : isTarget ? '#ffd166' : '#ffffff';
        g.lineWidth = 1.5;
        g.beginPath();
        g.arc(px, py, 11, 0, Math.PI * 2);
        g.stroke();
      }
      if (mapNames && shape !== 'weapon' && (u.kind === 'player' || isFollowed || isTarget)) {
        g.fillStyle = 'rgba(232,234,238,0.9)';
        g.fillText(u.name, px + 10, py + 4);
      }
      out.push({ x: px, y: py, person: tr.person, unit: u });
    }
    drawn.current = out;

    // ---- the volumes, their handles and the shape being drawn
    const vol = useVolumeStore.getState();
    // A tool put down elsewhere (Esc on the view, the panel) drops a polygon half drawn here.
    if (!vol.drawing && gest.polygonPoints().length > 0) gest.cancel();
    drawVolumesOnMap(g, vol.volumes, vol.selected, gest, (x, z) => toMap(v, w, h, x, z));

    // ---- the 3D camera: where it is and which way it looks
    const cam = engine.cameraPose();
    const [cx, cy] = toMap(v, w, h, cam.position.x, cam.position.z);
    const fl = Math.hypot(cam.forward.x, cam.forward.z);
    if (fl > 1e-3 && cx > -10 && cy > -10 && cx < w + 10 && cy < h + 10) {
      const a = Math.atan2(cam.forward.z, cam.forward.x);
      g.fillStyle = 'rgba(255,255,255,0.12)';
      g.strokeStyle = 'rgba(255,255,255,0.6)';
      g.lineWidth = 1;
      g.beginPath();
      g.moveTo(cx, cy);
      g.arc(cx, cy, 34, a - 0.5, a + 0.5);
      g.closePath();
      g.fill();
      g.stroke();
    }

    // ---- scale bar and north
    const len = (bar * k) / v.upp;
    g.strokeStyle = '#e8eaee';
    g.fillStyle = '#e8eaee';
    g.lineWidth = 2;
    g.beginPath();
    g.moveTo(12, h - 14);
    g.lineTo(12 + len, h - 14);
    g.moveTo(12, h - 19);
    g.lineTo(12, h - 9);
    g.moveTo(12 + len, h - 19);
    g.lineTo(12 + len, h - 9);
    g.stroke();
    g.font = '11px system-ui, sans-serif';
    g.fillText(distanceText(bar, unitPrefs()), 16, h - 20);
    g.beginPath();
    g.moveTo(w - 18, 12);
    g.lineTo(w - 13, 26);
    g.lineTo(w - 23, 26);
    g.closePath();
    g.fill();
    g.fillText(t('replay.map.north'), w - 22, 38);
  }, on);

  if (!on) return null;
  const set = (p: Partial<{ map: 'off' | 'pip' | 'full' }>) =>
    useReplayStore.getState().patchSaved(p);
  return (
    <div className={`tac-map ${map}`} onPointerDown={(e) => e.stopPropagation()}>
      <canvas ref={canvas} />
      <div className="tm-tools">
        <button
          className={`small${centred ? ' on' : ''}`}
          onClick={() => setCentred(!centred)}
          title={t('replay.map.centreTitle')}
        >
          ⌖
        </button>
        <button
          className="small"
          onClick={() => {
            view.current = null;
            setCentred(false);
          }}
          title={t('replay.map.fitTitle')}
        >
          ⤢
        </button>
        <button
          className="small"
          onClick={() => set({ map: map === 'pip' ? 'full' : 'pip' })}
          title={t('replay.map.sizeTitle')}
        >
          {map === 'pip' ? '▢' : '▭'}
        </button>
        <button className="small" onClick={() => set({ map: 'off' })} title={t('replay.map.close')}>
          ×
        </button>
      </div>
    </div>
  );
}

/** A scale bar's length in metres, round in the units shown: 1, 2 or 5 of the long unit (km, mi, NM) or the short one (m, ft). */
export function niceBar(maxMetres: number, units: UnitSystem): number {
  const long = longUnitMetres(units.distance);
  if (maxMetres >= long) return niceLength(maxMetres / long) * long;
  const short = fromAltitude(1, units.altitude);
  return niceLength(maxMetres / short) * short;
}

/** A map distance with its unit: the long unit from one of it up, else the short one. */
export function distanceText(metres: number, units: UnitSystem): string {
  const digits = (v: number) => (Math.abs(v - Math.round(v)) < 1e-6 || v >= 10 ? 0 : 1);
  const long = longUnitMetres(units.distance);
  if (metres >= long) {
    return formatLong(metres, units, digits(metres / long));
  }
  return formatLength(metres, units, 0);
}
