import { useEffect, useRef, useState } from 'react';
import { useStore } from '../../state/store';
import { useReplayStore } from '../../state/replayStore';
import { useAnimationFrame, useEngine } from '../EngineContext';
import { geoFrame, type GeoFrame } from '../../world/geoFrame';
import { latLonLabel, latLonLines, latLonStep, mgrsLabel, mgrsLines, mgrsStep, type GridLine } from '../../world/geoGrid';
import { glideslopes, type Glideslope } from '../../world/glideslope';
import { OURAIRPORTS_RUNWAYS, parseRunways, runwaysIn } from '../../world/runways';
import { cachedFetch } from '../../world/cache';
import { declination } from '../../world/wmm';
import { toMgrs } from '../../world/mgrs';
import { groundProbe } from './replayView';
import { num, t } from '../../i18n';
import type { Engine } from '../../render/engine';
import type { Dataset } from '../../state/types';
import './replay.css';

/** Glideslopes per recording placement, once downloaded; what the panel says of them. */
export type GlideState = { status: 'idle' | 'loading' | 'done' | 'failed'; slopes: Glideslope[] };
const glideCache = new Map<string, GlideState>();
const listeners = new Set<() => void>();

function placeKey(d: Dataset): string {
  return d.geo ? `${d.geo.projection}:${d.geo.lat0.toFixed(4)},${d.geo.lon0.toFixed(4)}:${d.bounds.minX},${d.bounds.maxX},${d.bounds.minZ},${d.bounds.maxZ}` : '';
}

/** The glideslopes of the runways near a recording: downloaded (OurAirports, kept offline) when first asked for. */
export function glideslopesFor(d: Dataset): GlideState {
  const frame = geoFrame(d);
  if (!frame) return { status: 'failed', slopes: [] };
  const key = placeKey(d);
  const hit = glideCache.get(key);
  if (hit) return hit;
  const state: GlideState = { status: 'loading', slopes: [] };
  glideCache.set(key, state);
  const b = d.bounds;
  const corners = [
    frame.latLon(b.minX, b.minY, b.minZ),
    frame.latLon(b.maxX, b.minY, b.minZ),
    frame.latLon(b.minX, b.minY, b.maxZ),
    frame.latLon(b.maxX, b.minY, b.maxZ),
  ];
  // The recording's area and 20 nautical miles round it: the approaches flown into it.
  const pad = 0.4;
  const box = {
    south: Math.min(...corners.map((c) => c[0])) - pad,
    north: Math.max(...corners.map((c) => c[0])) + pad,
    west: Math.min(...corners.map((c) => c[1])) - pad,
    east: Math.max(...corners.map((c) => c[1])) + pad,
  };
  void cachedFetch(OURAIRPORTS_RUNWAYS)
    .then((f) => {
      const list = f.bytes ? runwaysIn(parseRunways(new TextDecoder().decode(f.bytes)), box) : [];
      glideCache.set(key, { status: 'done', slopes: list.flatMap((r) => glideslopes(r)) });
    })
    .catch(() => glideCache.set(key, { status: 'failed', slopes: [] }))
    .finally(() => listeners.forEach((l) => l()));
  return state;
}

/** Re-render when the glideslopes arrive. */
export function useGlideslopes(d: Dataset | null, on: boolean): GlideState | null {
  const [, bump] = useState(0);
  useEffect(() => {
    const l = () => bump((x) => x + 1);
    listeners.add(l);
    return () => void listeners.delete(l);
  }, []);
  return d && on ? glideslopesFor(d) : null;
}

/** A polyline of places at a height through the view, as SVG path data; pieces behind the camera left out. */
function pathOf(engine: Engine, frame: GeoFrame, pts: [number, number, number][], W: number, H: number): string {
  let d = '';
  let pen = false;
  for (const [lat, lon, h] of pts) {
    const w = frame.world(lat, lon, h);
    const p = engine.project(w.x, w.y, w.z);
    // Far outside the view a projection runs away; lift the pen there.
    if (!p || Math.abs(p.x) > W * 8 || Math.abs(p.y) > H * 8) {
      pen = false;
      continue;
    }
    d += `${pen ? 'L' : 'M'}${p.x.toFixed(1)},${p.y.toFixed(1)}`;
    pen = true;
  }
  return d;
}

/**
 * Over the view of a recording placed on the earth: the latitude and
 * longitude grid or the MGRS grid, on the ground under the camera; the
 * glideslopes of the runways about; and, with magnetic headings on, a
 * compass with true and magnetic north and the declination (WMM).
 */
export function GeoOverlay() {
  const engine = useEngine();
  const dataset = useStore((s) => s.dataset);
  const geo = useReplayStore((s) => s.geo);
  const frame = dataset ? geoFrame(dataset) : null;
  const slopes = useGlideslopes(dataset, geo.glideslope && !!frame);
  const grid = useRef<SVGPathElement>(null);
  const gsPath = useRef<SVGPathElement>(null);
  const gsEdge = useRef<SVGPathElement>(null);
  const labels = useRef<SVGGElement>(null);
  const compass = useRef<SVGGElement>(null);
  const compassText = useRef<HTMLDivElement>(null);
  const zone = useRef<HTMLDivElement>(null);
  const on = !!engine && !!frame && (geo.grid !== 'off' || geo.glideslope || geo.magnetic);

  useAnimationFrame(() => {
    if (!engine || !frame || !dataset) return;
    const W = engine.canvas.clientWidth;
    const H = engine.canvas.clientHeight;
    const cam = engine.cameraPose();
    const [clat, clon] = frame.latLon(cam.position.x, cam.position.y, cam.position.z);
    const ground = groundProbe(engine, dataset)(cam.position.x, cam.position.y, cam.position.z) ?? dataset.bounds.minY;
    const height = Math.max(50, cam.position.y - ground);
    const [, , groundH] = frame.latLon(cam.position.x, ground, cam.position.z);
    const texts: { x: number; y: number; s: string; cls: string }[] = [];
    const firstOnScreen = (pts: [number, number, number][]) => {
      for (const [lat, lon, h] of pts) {
        const w = frame.world(lat, lon, h);
        const p = engine.project(w.x, w.y, w.z);
        if (p && p.x > 30 && p.x < W - 60 && p.y > 30 && p.y < H - 20) return p;
      }
      return null;
    };

    // ---- the grid, on the ground under the camera
    let gd = '';
    if (geo.grid !== 'off') {
      const span = Math.min(2e6, Math.max(2000, height * 5));
      let lines: GridLine[];
      let step: number;
      if (geo.grid === 'latlon') {
        const degLat = span / 111000;
        const degLon = degLat / Math.max(0.05, Math.cos((clat * Math.PI) / 180));
        step = latLonStep(degLat * 2, 6);
        lines = latLonLines({ south: clat - degLat, north: clat + degLat, west: clon - degLon, east: clon + degLon }, step);
      } else {
        step = mgrsStep(span * 2, 5);
        lines = mgrsLines(clat, clon, span, step).lines;
      }
      for (const l of lines) {
        const pts = l.pts.map(([la, lo]) => [la, lo, groundH] as [number, number, number]);
        gd += pathOf(engine, frame, pts, W, H);
        const at = firstOnScreen(pts);
        if (at && texts.length < 60)
          texts.push({ x: at.x, y: at.y, s: l.kind === 'lat' || l.kind === 'lon' ? latLonLabel(l.kind, l.value) : mgrsLabel(l.value, step), cls: 'geo-grid-label' });
      }
    }
    grid.current?.setAttribute('d', gd);

    // ---- glideslopes within 60 km of the camera
    let sp = '';
    let se = '';
    if (slopes?.status === 'done') {
      for (const g of slopes.slopes) {
        const dlat = (g.threshold[0] - clat) * 111000;
        const dlon = (g.threshold[1] - clon) * 111000 * Math.cos((clat * Math.PI) / 180);
        if (Math.hypot(dlat, dlon) > 60000 + height) continue;
        const path = g.path.map((p) => [p.lat, p.lon, p.h] as [number, number, number]);
        sp += pathOf(engine, frame, path, W, H);
        se += pathOf(engine, frame, g.upper.map((p) => [p.lat, p.lon, p.h]), W, H);
        se += pathOf(engine, frame, g.lower.map((p) => [p.lat, p.lon, p.h]), W, H);
        // A tick down to the ground at every nautical mile.
        for (const p of g.path) {
          if (Math.abs(p.nm - Math.round(p.nm)) > 1e-6 || p.nm === 0) continue;
          se += pathOf(engine, frame, [[p.lat, p.lon, p.h], [p.lat, p.lon, g.elevation]], W, H);
        }
        const end = g.path[g.path.length - 1];
        const w = frame.world(end.lat, end.lon, end.h);
        const at = engine.project(w.x, w.y, w.z);
        if (at && at.x > 0 && at.x < W && at.y > 0 && at.y < H && texts.length < 80) texts.push({ x: at.x, y: at.y, s: `${g.airport} ${g.ident} · 3°`, cls: 'geo-gs-label' });
      }
    }
    gsPath.current?.setAttribute('d', sp);
    gsEdge.current?.setAttribute('d', se);

    // ---- labels, from a pool
    const g = labels.current;
    if (g) {
      while (g.childNodes.length < texts.length) g.appendChild(document.createElementNS('http://www.w3.org/2000/svg', 'text'));
      g.childNodes.forEach((n, i) => {
        const el = n as SVGTextElement;
        const tx = texts[i];
        if (!tx) {
          if (el.style.display !== 'none') el.style.display = 'none';
          return;
        }
        el.style.display = '';
        el.setAttribute('x', tx.x.toFixed(0));
        el.setAttribute('y', tx.y.toFixed(0));
        el.setAttribute('class', tx.cls);
        if (el.textContent !== tx.s) el.textContent = tx.s;
      });
    }

    // ---- the compass: true north up the screen's heading, magnetic north beside it
    // The zone and 100 km square under the camera, for reading the MGRS grid.
    if (zone.current) {
      const z = geo.grid === 'mgrs' ? toMgrs(clat, clon, 2) : '';
      if (zone.current.textContent !== z) zone.current.textContent = z;
      zone.current.style.display = z ? '' : 'none';
    }
    if (compass.current && compassText.current) {
      compass.current.style.display = geo.magnetic ? '' : 'none';
      compassText.current.style.display = geo.magnetic ? '' : 'none';
      if (geo.magnetic) {
        const f = cam.forward;
        const view = (Math.atan2(f.x, -f.z) * 180) / Math.PI;
        const ms = dataset.epochMs !== null ? dataset.epochMs + engine.live.playhead * 1000 : null;
        const decl = declination(clat, clon, Math.max(0, cam.position.y), ms);
        compass.current.querySelector('.true')?.setAttribute('transform', `rotate(${(-view).toFixed(1)})`);
        compass.current.querySelector('.mag')?.setAttribute('transform', `rotate(${(decl - view).toFixed(1)})`);
        const txt = t('replay.geo.declination', { v: num(Math.abs(decl), 1), side: decl >= 0 ? 'E' : 'W' });
        if (compassText.current.textContent !== txt) compassText.current.textContent = txt;
      }
    }
  }, on);

  if (!on) return null;
  return (
    <div className="geo-overlay">
      <svg className="geo-svg">
        <path ref={grid} className="geo-grid" />
        <path ref={gsEdge} className="geo-gs-edge" />
        <path ref={gsPath} className="geo-gs" />
        <g ref={labels} />
      </svg>
      <div className="geo-compass">
        <svg width={64} height={64} viewBox="-32 -32 64 64">
          <g ref={compass}>
            <circle r={28} className="geo-compass-ring" />
            <g className="true">
              <path d="M0,-26 L5,-8 L0,-12 L-5,-8 Z" className="geo-compass-true" />
              <text y={-14} x={8} className="geo-compass-n">
                N
              </text>
            </g>
            <g className="mag">
              <line x1={0} y1={0} x2={0} y2={-24} className="geo-compass-mag" />
              <text y={-24} x={3} className="geo-compass-m">
                M
              </text>
            </g>
          </g>
        </svg>
        <div ref={compassText} className="geo-compass-text" />
        <div ref={zone} className="geo-compass-text" />
      </div>
    </div>
  );
}
