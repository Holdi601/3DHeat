import { useRef } from 'react';
import { useStore } from '../../state/store';
import { useReplayStore } from '../../state/replayStore';
import { useAnimationFrame, useEngine } from '../EngineContext';
import { flightSeries, PARAM_BY_ID, valueAt } from '../../data/flight';
import { MotionModel, emptySample } from '../../figures/motion';
import { formatValue } from './fields';
import { unitsOf } from './units';
import { t } from '../../i18n';
import './replay.css';
import { unitPrefs } from '../../state/unitsStore';
import { cameraTracks } from '../../render/lookAids';

const GREEN = 'rgba(124, 255, 138, 0.92)';
const sample = emptySample();

/** Where a world pitch line (degrees) crosses the view's middle column, pixels below the middle: `focal` the focal length in pixels. */
export function ladderY(cameraPitch: number, linePitchDeg: number, focal: number): number {
  const d = cameraPitch - (linePitchDeg * Math.PI) / 180;
  // Past ±90° off the view the line is behind the camera.
  return Math.abs(d) >= Math.PI / 2 - 0.01 ? NaN : focal * Math.tan(d);
}

/** A compass heading (degrees) of the fly camera's yaw: yaw 0 looks north, yaw grows to the left. */
export function headingOfYaw(yaw: number): number {
  return ((((-yaw * 180) / Math.PI) % 360) + 360) % 360;
}

/**
 * The cockpit view's head-up display, as Tacview draws one: the horizon and a
 * pitch ladder (the real horizon of the view, rolling with it), the flight
 * path marker where the unit is going, a heading tape, and speed, height,
 * G, Mach and angle of attack from the unit's flight data.
 */
export function CockpitHud() {
  const engine = useEngine();
  const dataset = useStore((s) => s.dataset);
  const mode = useStore((s) => s.mode);
  const follow = useReplayStore((s) => s.follow);
  const followMode = useReplayStore((s) => s.followMode);
  const hud = useReplayStore((s) => s.hud);
  const canvas = useRef<HTMLCanvasElement>(null);
  const on =
    !!engine &&
    !!dataset &&
    mode === 'team' &&
    follow !== null &&
    hud &&
    (followMode === 'cockpit' || followMode === 'padlock') &&
    // Through a recorded camera there is no cockpit to have a HUD.
    !cameraTracks(dataset).persons[follow];

  useAnimationFrame(() => {
    const c = canvas.current;
    if (!engine || !dataset || !c || follow === null) return;
    const w = c.clientWidth;
    const h = c.clientHeight;
    const dpr = window.devicePixelRatio || 1;
    if (c.width !== Math.round(w * dpr) || c.height !== Math.round(h * dpr)) {
      c.width = Math.round(w * dpr);
      c.height = Math.round(h * dpr);
    }
    const g = c.getContext('2d');
    if (!g) return;
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    g.clearRect(0, 0, w, h);
    const s = useStore.getState();
    const r = useReplayStore.getState();
    const cam = engine.camera;
    const focal = h / (2 * Math.tan((s.camera.fov * Math.PI) / 360));
    const cx = w / 2;
    const cy = h / 2;
    g.strokeStyle = GREEN;
    g.fillStyle = GREEN;
    g.lineWidth = 1.5;
    g.font = '13px ui-monospace, Consolas, monospace';
    g.textBaseline = 'middle';

    // ---- horizon and pitch ladder, turned with the view's roll
    g.save();
    g.beginPath();
    g.rect(cx - w * 0.14, cy - h * 0.32, w * 0.28, h * 0.64);
    g.clip();
    g.translate(cx, cy);
    g.rotate(cam.roll);
    for (let deg = -90; deg <= 90; deg += 5) {
      const y = ladderY(cam.pitch, deg, focal);
      if (!Number.isFinite(y) || Math.abs(y) > h) continue;
      const half = deg === 0 ? w * 0.12 : deg % 10 === 0 ? 70 : 38;
      const gap = deg === 0 ? 40 : 22;
      g.setLineDash(deg < 0 ? [7, 5] : []);
      g.beginPath();
      g.moveTo(-half, y);
      g.lineTo(-gap, y);
      g.moveTo(gap, y);
      g.lineTo(half, y);
      if (deg !== 0) {
        // The ends turned toward the horizon.
        const tip = deg > 0 ? 7 : -7;
        g.moveTo(-half, y);
        g.lineTo(-half, y + tip);
        g.moveTo(half, y);
        g.lineTo(half, y + tip);
      }
      g.stroke();
      g.setLineDash([]);
      if (deg !== 0 && deg % 10 === 0) {
        g.textAlign = 'left';
        g.fillText(String(Math.abs(deg)), half + 5, y);
        g.textAlign = 'right';
        g.fillText(String(Math.abs(deg)), -half - 5, y);
      }
    }
    g.restore();

    // ---- the middle, and the flight path marker where the unit is going
    g.beginPath();
    g.moveTo(cx - 14, cy);
    g.lineTo(cx - 5, cy);
    g.lineTo(cx, cy + 6);
    g.lineTo(cx + 5, cy);
    g.lineTo(cx + 14, cy);
    g.stroke();
    const tr = engine.liveTracks.find((x) => x.person === follow);
    const m = MotionModel.of(dataset);
    if (tr && m && m.at(follow, engine.live.playhead, s.team.session, sample)) {
      const sp = Math.hypot(sample.vx, sample.vy, sample.vz);
      if (sp > 1e-3) {
        const far = 1e5 / sp;
        const p = engine.project(
          tr.x + sample.vx * far,
          tr.y + sample.vy * far,
          tr.z + sample.vz * far,
        );
        if (p && Math.abs(p.x - cx) < w * 0.3 && Math.abs(p.y - cy) < h * 0.35) {
          g.beginPath();
          g.arc(p.x, p.y, 6, 0, Math.PI * 2);
          g.moveTo(p.x - 6, p.y);
          g.lineTo(p.x - 16, p.y);
          g.moveTo(p.x + 6, p.y);
          g.lineTo(p.x + 16, p.y);
          g.moveTo(p.x, p.y - 6);
          g.lineTo(p.x, p.y - 12);
          g.stroke();
        }
      }
    }

    // ---- heading tape
    const hdg = headingOfYaw(cam.yaw);
    const tapeW = Math.min(360, w * 0.4);
    const pxPerDeg = tapeW / 60;
    const ty = cy - h * 0.36;
    g.save();
    g.beginPath();
    g.rect(cx - tapeW / 2, ty - 22, tapeW, 40);
    g.clip();
    g.textAlign = 'center';
    for (let d = Math.floor((hdg - 35) / 5) * 5; d <= hdg + 35; d += 5) {
      const x = cx + (d - hdg) * pxPerDeg;
      g.beginPath();
      g.moveTo(x, ty);
      g.lineTo(x, ty + (d % 10 === 0 ? 9 : 5));
      g.stroke();
      if (d % 10 === 0) {
        const v = ((d % 360) + 360) % 360;
        g.fillText(String(v / 10).padStart(2, '0'), x, ty - 9);
      }
    }
    g.restore();
    g.beginPath();
    g.moveTo(cx, ty + 12);
    g.lineTo(cx - 5, ty + 19);
    g.lineTo(cx + 5, ty + 19);
    g.closePath();
    g.fill();

    // ---- the unit's numbers
    const series = flightSeries(dataset, follow, s.team.session);
    const now = engine.live.playhead;
    const val = (id: string) => (series ? valueAt(series, id, now) : NaN);
    const fmt = (id: string) => {
      const v = val(id);
      return Number.isFinite(v) ? formatValue(PARAM_BY_ID[id].kind, v, unitPrefs()) : '—';
    };
    const box = (x: number, y: number, text: string, align: CanvasTextAlign) => {
      g.textAlign = align;
      const tw = g.measureText(text).width + 12;
      const bx = align === 'right' ? x - tw : x;
      g.strokeRect(bx, y - 11, tw, 22);
      g.fillText(text, align === 'right' ? x - 6 : x + 6, y);
    };
    const left = cx - w * 0.14 - 10;
    const right = cx + w * 0.14 + 10;
    box(left, cy, fmt('ias'), 'right');
    box(right, cy, fmt('alt'), 'left');
    g.textAlign = 'right';
    g.fillText(`${t('replay.hud.tas')} ${fmt('tas')}`, left, cy + 26);
    g.fillText(`M ${Number.isFinite(val('mach')) ? val('mach').toFixed(2) : '—'}`, left, cy + 44);
    g.fillText(`G ${Number.isFinite(val('g')) ? val('g').toFixed(1) : '—'}`, left, cy + 62);
    g.fillText(`α ${Number.isFinite(val('aoa')) ? val('aoa').toFixed(1) : '—'}`, left, cy + 80);
    g.textAlign = 'left';
    g.fillText(`${t('replay.hud.vs')} ${fmt('vs')}`, right, cy + 26);
    const agl = val('agl');
    if (Number.isFinite(agl)) g.fillText(`${t('replay.hud.agl')} ${fmt('agl')}`, right, cy + 44);
    const index = unitsOf(dataset);
    const u = index.units[index.personUnit[follow]];
    g.textAlign = 'center';
    g.fillText(u ? u.name : '', cx, cy + h * 0.36);
    if (r.followMode === 'padlock') g.fillText(t('replay.hud.padlock'), cx, cy + h * 0.36 + 18);
  }, on);

  if (!on) return null;
  return <canvas className="cockpit-hud" ref={canvas} />;
}
