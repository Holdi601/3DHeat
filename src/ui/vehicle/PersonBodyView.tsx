/**
 * Over the view in the person-hit analysis: the body, its regions coloured
 * by the metric picked, the hit points where the data has them, the colour
 * key, and the region under the pointer. Drag to turn the body; the buttons
 * turn it to the front, the side and the back. Drawn on a 2D canvas only
 * when something changed (`person/body.ts`).
 */

import { useEffect, useMemo, useRef, useState } from 'react';
import { int, num, t } from '../../i18n';
import { showPersonHit, usePersonHits } from '../../person/client';
import { bodyOfPack, drawBody, genericBody, rampCss, type Body, type BodyPicker } from '../../person/body';
import { platesVersion } from '../../vehicle/plates';
import { REGIONS, ZONE_OF_REGION, ZONES } from '../../person/types';

export function PersonBodyView() {
  const s = usePersonHits();
  const canvas = useRef<HTMLCanvasElement>(null);
  const picker = useRef<BodyPicker>(Object.assign(() => -1, { mark: () => -1 }));
  const [yaw, setYaw] = useState(0);
  const [hover, setHover] = useState(-1);
  const [size, setSize] = useState({ w: 600, h: 600 });
  const [packTick, setPackTick] = useState(0);
  const r = s.result;

  // The body: the pack model asked once (it arrives later), else the generic one.
  const body: Body = useMemo(() => {
    void packTick;
    if (s.figure !== 'generic') {
      const [game, unit] = s.figure.split(':');
      const b = bodyOfPack(game, unit);
      if (b) return b;
    }
    return genericBody();
  }, [s.figure, packTick]);
  useEffect(() => {
    if (s.figure === 'generic') return;
    const v0 = platesVersion();
    const id = window.setInterval(() => {
      if (platesVersion() !== v0) {
        setPackTick((n) => n + 1);
        window.clearInterval(id);
      }
    }, 250);
    return () => window.clearInterval(id);
  }, [s.figure]);

  useEffect(() => {
    const el = canvas.current?.parentElement;
    if (!el) return;
    const ro = new ResizeObserver(() => setSize({ w: el.clientWidth, h: el.clientHeight }));
    ro.observe(el);
    setSize({ w: el.clientWidth, h: el.clientHeight });
    return () => ro.disconnect();
  }, []);

  // Each region's colour: its own value (fine) or its zone's (coarse).
  const fill = useMemo(() => {
    if (!r) return REGIONS.map(() => '');
    return REGIONS.map((name) => {
      const k = r.mode === 'fine' ? REGIONS.indexOf(name) : ZONES.indexOf(ZONE_OF_REGION[name]);
      const v = r.values[k];
      return Number.isFinite(v) ? rampCss((v - r.lo) / (r.hi - r.lo)) : '';
    });
  }, [r]);

  useEffect(() => {
    const c = canvas.current;
    if (!c) return;
    const dpr = window.devicePixelRatio || 1;
    // Only a new size reallocates the canvas: a redraw paints over the one it has.
    const w = Math.max(1, Math.round(size.w * dpr)), h = Math.max(1, Math.round(size.h * dpr));
    if (c.width !== w) c.width = w;
    if (c.height !== h) c.height = h;
    const ctx = c.getContext('2d');
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const css = getComputedStyle(c);
    const bg = css.getPropertyValue('--bg').trim() || '#14161a';
    const hoverRegion = hover >= 0 ? hover : -1;
    const marks = r && r.marks.x.length ? { x: r.marks.x, y: r.marks.y, z: r.marks.z, colour: Array.from(r.marks.kill, (k) => (k === 1 ? '#ff4d4d' : '#e8e8e8')) } : null;
    picker.current = drawBody(ctx, size.w, size.h, body, { yaw, pitch: 8, fill, noData: '#5a5f68', background: bg.startsWith('#') ? bg : '#14161a', hover: hoverRegion, marks });
  }, [body, yaw, fill, hover, size, r]);

  const drag = useRef<{ x: number; y: number; yaw: number } | null>(null);
  const regionText = (k: number) => {
    if (!r || k < 0) return null;
    const name = REGIONS[k];
    const idx = r.mode === 'fine' ? k : ZONES.indexOf(ZONE_OF_REGION[name]);
    const st = (r.mode === 'fine' ? r.regions : r.zones)[idx];
    if (!st) return null;
    const label = r.mode === 'fine' ? t(`phits.region.${name}`) : t(`phits.region.${ZONES[idx]}`);
    return t('phits.hud.region', {
      region: label,
      hits: st.hits,
      share: Number.isFinite(st.share) ? `${num(st.share * 100, 0)} %` : '-',
      damage: Number.isFinite(st.damage) ? num(st.damage, 0) : '-',
      kill: Number.isFinite(st.killRate) ? `${num(st.killRate * 100, 0)} %` : '-',
      absorbed: Number.isFinite(st.absorbed) ? num(st.absorbed, 0) : '-',
    });
  };

  return (
    <div className="person-body" data-phits="body">
      <canvas
        ref={canvas}
        style={{ width: '100%', height: '100%', display: 'block', cursor: drag.current ? 'grabbing' : 'grab' }}
        onPointerDown={(e) => {
          drag.current = { x: e.clientX, y: e.clientY, yaw };
          (e.target as HTMLElement).setPointerCapture(e.pointerId);
        }}
        onPointerMove={(e) => {
          if (drag.current) setYaw(drag.current.yaw + (e.clientX - drag.current.x) * 0.6);
          else {
            const rect = (e.target as HTMLElement).getBoundingClientRect();
            setHover(picker.current(e.clientX - rect.left, e.clientY - rect.top));
          }
        }}
        onPointerUp={(e) => {
          // A click (no drag): the mark under the pointer opens its hit's card.
          const d = drag.current;
          drag.current = null;
          if (!d || !r || Math.hypot(e.clientX - d.x, e.clientY - d.y) > 4) return;
          const rect = (e.target as HTMLElement).getBoundingClientRect();
          const k = picker.current.mark(e.clientX - rect.left, e.clientY - rect.top);
          if (k >= 0 && k < r.marks.index.length) void showPersonHit(r.marks.index[k]);
        }}
        onPointerLeave={() => setHover(-1)}
      />
      <div className="vehicle-hud person-hud" data-phits="hud">
        <div className="vehicle-hud-name">{t('phits.hud.title')}</div>
        {r && <div className="vehicle-hud-sub">{t('phits.hud.hits', { kept: int(r.kept), placed: int(r.placed) })}</div>}
        {r && (
          <>
            <div className="vehicle-hud-sub">{t(`phits.metric.${s.metric}`)}</div>
            <div className="vehicle-ramp" style={{ background: `linear-gradient(to right, ${[0, 0.25, 0.5, 0.75, 1].map(rampCss).join(', ')})` }} />
            <div className="vehicle-ramp-ends">
              <span>{s.metric === 'share' || s.metric === 'killRate' ? `${num(r.lo * 100, 0)} %` : num(r.lo, 0)}</span>
              <span>{s.metric === 'share' || s.metric === 'killRate' ? `${num(r.hi * 100, 0)} %` : num(r.hi, 0)}</span>
            </div>
          </>
        )}
        {hover >= 0 && <div className="vehicle-hud-sub" data-phits="hover">{regionText(hover)}</div>}
        {r && r.marks.x.length > 0 && <div className="hint">{t('phits.hud.pickMark')}</div>}
        <div className="row wrap" style={{ marginTop: 6 }}>
          <button onClick={() => setYaw(0)}>{t('phits.hud.front')}</button>
          <button onClick={() => setYaw(90)}>{t('phits.hud.side')}</button>
          <button onClick={() => setYaw(180)}>{t('phits.hud.back')}</button>
        </div>
        {body.name === 'generic' && s.figure !== 'generic' && <div className="hint">{t('phits.hud.noPack')}</div>}
      </div>
    </div>
  );
}
