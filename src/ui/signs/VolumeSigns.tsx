/**
 * The chart signs in the world: beside each shown volume a small chart
 * button, anchored at its top corner and drawn at the same size at any zoom;
 * and the volume's signs, each a chart of the rows inside it, standing beside
 * it as a billboard (facing the screen, its size in pixels) or a fixed board
 * (standing in the world, turned to a heading, its size in world units).
 *
 * Drawn as a DOM layer over the view, which costs least and stays sharp:
 * each sign's chart is painted to its canvas only when its data, its size or
 * the hover changes, a few signs a frame at most (`PAINT_BUDGET_MS`); a frame
 * only moves the elements (a transform each, written when it changed). A
 * fixed board is mapped onto its four projected corners with a projective
 * transform. Whether the level hides a sign is asked of the level's surface
 * along the line of sight (a CPU ray against the level's index, a few signs
 * at a time, never a GPU readback); a hidden sign fades back.
 */

import { useEffect, useMemo, useRef, useState } from 'react';
import { ChartTable, paintChart, fillTooltip, entityOf } from '../../charts/ChartView';
import type { ChartData } from '../../charts/types';
import { hitAt, type Hit } from '../../charts/draw';
import { readTheme } from '../../charts/palette';
import { t, useLang } from '../../i18n';
import type { Engine } from '../../render/engine';
import { useStore } from '../../state/store';
import { useVolumeStore } from '../../volumes/store';
import type { Vec3, Volume } from '../../volumes/volume';
import { noteSignMs, signClient, signTiming } from '../../volumes/signs/client';
import { signAnchor, volumeWidth, SIGN_H, SIGN_HEAD, SIGN_W, type Sign } from '../../volumes/signs/sign';
import { liveSigns, useSignStore } from '../../volumes/signs/store';
import { useAnimationFrame, useEngine } from '../EngineContext';
import { Icon } from '../shell/Icon';
import { applyMarkFilter } from './markFilter';
import { SignEditor, sendSign } from './SignEditor';
import { diffText, signTitle } from './signText';
import './signs.css';

/** Most milliseconds a frame spends painting sign canvases. */
const PAINT_BUDGET_MS = 2;
/** How often signs are tested against the level for being hidden, ms, and how many per test. */
const OCCLUDE_EVERY = 160;
const OCCLUDE_BATCH = 6;
/** A fixed board's element is laid out this much larger than a billboard, so it stays sharp when near. */
const BOARD_RES = 1.4;

interface Placed {
  root: HTMLDivElement;
  canvas: HTMLCanvasElement | null;
  hits: Hit[];
  hover: Hit | null;
  /** Last transform written, to skip writing the same. */
  tf: string;
  occluded: boolean;
  /** The world point tested for being hidden. */
  probe: Vec3 | null;
}

/** The projective transform mapping a w x h element onto four screen points (top left, top right, bottom right, bottom left). */
export function quadMatrix(w: number, h: number, q: { x: number; y: number }[]): string | null {
  const [p0, p1, p2, p3] = q;
  const dx1 = p1.x - p2.x;
  const dx2 = p3.x - p2.x;
  const dy1 = p1.y - p2.y;
  const dy2 = p3.y - p2.y;
  const sx = p0.x - p1.x + p2.x - p3.x;
  const sy = p0.y - p1.y + p2.y - p3.y;
  const den = dx1 * dy2 - dx2 * dy1;
  if (Math.abs(den) < 1e-9) return null;
  const g = (sx * dy2 - dx2 * sy) / den;
  const hh = (dx1 * sy - sx * dy1) / den;
  const a = p1.x - p0.x + g * p1.x;
  const b = p3.x - p0.x + hh * p3.x;
  const d = p1.y - p0.y + g * p1.y;
  const e = p3.y - p0.y + hh * p3.y;
  const m = [a / w, d / w, 0, g / w, b / h, e / h, 0, hh / h, 0, 0, 1, 0, p0.x, p0.y, 0, 1];
  if (!m.every(Number.isFinite)) return null;
  return `matrix3d(${m.map((v) => +v.toFixed(6)).join(',')})`;
}

/** A fixed board's corners in the world: top left, top right, bottom right, bottom left. */
export function boardCorners(s: Sign, v: Volume): Vec3[] {
  const a = signAnchor(v);
  const b: Vec3 = [a[0] + s.offset[0], a[1] + s.offset[1], a[2] + s.offset[2]];
  const W = volumeWidth(v) * s.scale;
  const H = (W * (s.collapsed ? SIGN_HEAD : SIGN_H + SIGN_HEAD)) / SIGN_W;
  const r: Vec3 = [Math.cos(s.yaw) * (W / 2), 0, -Math.sin(s.yaw) * (W / 2)];
  return [
    [b[0] - r[0], b[1] + H, b[2] - r[2]],
    [b[0] + r[0], b[1] + H, b[2] + r[2]],
    [b[0] + r[0], b[1], b[2] + r[2]],
    [b[0] - r[0], b[1], b[2] - r[2]],
  ];
}

/** Whether the level's surface lies between the camera and a point. */
function hiddenByLevel(engine: Engine, p: Vec3): boolean {
  const o = engine.cameraPose().position;
  const dx = p[0] - o.x;
  const dy = p[1] - o.y;
  const dz = p[2] - o.z;
  const len = Math.hypot(dx, dy, dz);
  if (len < 1e-6) return false;
  const hit = engine.inspector.surfaceHit({ origin: o, dir: { x: dx / len, y: dy / len, z: dz / len } });
  if (!hit) return false;
  return Math.hypot(hit.x - o.x, hit.y - o.y, hit.z - o.z) < len * 0.985;
}

export function VolumeSigns() {
  const engine = useEngine();
  const lang = useLang();
  const dataset = useStore((s) => s.dataset);
  const volumes = useVolumeStore((s) => s.volumes);
  const signs = useSignStore((s) => s.signs);
  const hidden = useSignStore((s) => s.hidden);
  const editor = useSignStore((s) => s.editor);
  const root = useRef<HTMLDivElement>(null);
  const tip = useRef<HTMLDivElement>(null);
  const buttons = useRef(new Map<string, HTMLButtonElement>());
  const leaders = useRef(new Map<string, SVGLineElement>());
  const placed = useRef(new Map<string, Placed>());
  const dirty = useRef(new Set<string>());
  const occludeAt = useRef(0);
  const occludeNext = useRef(0);
  const [, setTick] = useState(0);

  useEffect(() => {
    signClient.start(engine);
    return () => signClient.stop();
  }, [engine]);

  // Results in: their signs repaint (no React render). React renders only when
  // what the boards say around the chart changes: a first result, a sample
  // note, a build starting or ending (an empty set).
  const flags = useRef(new Map<string, string>());
  useEffect(() => signClient.subscribe((ids) => {
    let render = ids.size === 0;
    for (const id of ids) {
      dirty.current.add(id);
      const d = signClient.results.get(id);
      const f = d ? `${!!d.sampled}` : '';
      if (flags.current.get(id) !== f) {
        flags.current.set(id, f);
        render = true;
      }
    }
    if (render) setTick((n) => n + 1);
  }), []);
  useEffect(() => {
    const restyle = () => {
      if (root.current) signClient.restyle(readTheme(root.current));
    };
    restyle();
    const mo = new MutationObserver(restyle);
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme', 'class'] });
    return () => mo.disconnect();
  }, [lang]);

  const shown = useMemo(() => (dataset ? volumes.filter((v) => v.visible) : []), [dataset, volumes]);
  const byId = useMemo(() => new Map(volumes.map((v) => [v.id, v])), [volumes]);
  const anchors = useMemo(() => new Map(shown.map((v) => [v.id, signAnchor(v)])), [shown]);
  const live = useMemo(() => (dataset && !hidden ? liveSigns(signs, volumes) : []), [dataset, hidden, signs, volumes]);

  useAnimationFrame(() => {
    const f0 = performance.now();
    place();
    const ms = performance.now() - f0;
    signTiming.frameMax = Math.max(signTiming.frameMax, ms);
    signTiming.frameSum += ms;
    signTiming.frames++;
    noteSignMs(signTiming.frameMs, ms);
  }, !!engine && shown.length > 0);

  /** A frame's sign work: buttons and signs moved, a few hidden-by-the-level tests, dirty canvases painted. */
  function place(): void {
    if (!engine || !root.current) return;
    const w = root.current.clientWidth;
    const h = root.current.clientHeight;
    const on = (p: { x: number; y: number } | null, m = 40) => !!p && p.x > -m && p.y > -m && p.x < w + m && p.y < h + m;
    // The buttons, at their corners.
    for (const v of shown) {
      const el = buttons.current.get(v.id);
      const a = anchors.get(v.id);
      if (!el || !a) continue;
      const p = engine.project(a[0], a[1], a[2]);
      const tf = on(p) ? `translate(${p!.x.toFixed(1)}px, ${p!.y.toFixed(1)}px)` : 'none';
      if (el.dataset.tf !== tf) {
        el.dataset.tf = tf;
        el.style.display = tf === 'none' ? 'none' : '';
        if (tf !== 'none') el.style.transform = tf;
      }
    }
    // The signs: a billboard beside its corner, a board on its four corners.
    for (const s of live) {
      const pl = placed.current.get(s.id);
      const v = byId.get(s.volumeId);
      const a = anchors.get(s.volumeId);
      const line = leaders.current.get(s.id);
      if (!pl || !v || !a) continue;
      let tf = 'none';
      let lx = NaN;
      let ly = NaN;
      let ax = NaN;
      let ay = NaN;
      const pa = engine.project(a[0], a[1], a[2]);
      if (s.mode === 'billboard') {
        if (on(pa, 2000)) {
          const x = pa!.x + s.px[0];
          const y = pa!.y + s.px[1];
          tf = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px)`;
          const sw = SIGN_W * s.scale;
          const sh = (s.collapsed ? SIGN_HEAD : SIGN_H + SIGN_HEAD) * s.scale;
          // The leader from the corner to the sign's nearest edge point.
          lx = Math.max(x, Math.min(x + sw, pa!.x));
          ly = Math.max(y, Math.min(y + sh, pa!.y));
          ax = pa!.x;
          ay = pa!.y;
          pl.probe = a;
        }
      } else {
        const c = boardCorners(s, v);
        const q = c.map((p) => engine.project(p[0], p[1], p[2]));
        if (q.every((p) => !!p) && q.some((p) => on(p))) {
          let qq = q as { x: number; y: number }[];
          // Seen from behind, the board reads the right way round: its left and right swap.
          const cross = (qq[1].x - qq[0].x) * (qq[3].y - qq[0].y) - (qq[1].y - qq[0].y) * (qq[3].x - qq[0].x);
          if (cross < 0) qq = [qq[1], qq[0], qq[3], qq[2]];
          const bw = SIGN_W * BOARD_RES;
          const bh = (s.collapsed ? SIGN_HEAD : SIGN_H + SIGN_HEAD) * BOARD_RES;
          tf = quadMatrix(bw, bh, qq) ?? 'none';
          if (pa && on(pa, 2000)) {
            ax = pa.x;
            ay = pa.y;
            lx = (qq[2].x + qq[3].x) / 2;
            ly = (qq[2].y + qq[3].y) / 2;
          }
          pl.probe = [(c[0][0] + c[2][0]) / 2, (c[0][1] + c[2][1]) / 2, (c[0][2] + c[2][2]) / 2];
        }
      }
      if (pl.tf !== tf) {
        pl.tf = tf;
        pl.root.style.display = tf === 'none' ? 'none' : '';
        if (tf !== 'none') pl.root.style.transform = tf;
      }
      if (line) {
        const show = tf !== 'none' && Number.isFinite(lx) && Math.hypot(lx - ax, ly - ay) > 6;
        line.style.display = show ? '' : 'none';
        if (show) {
          line.setAttribute('x1', ax.toFixed(1));
          line.setAttribute('y1', ay.toFixed(1));
          line.setAttribute('x2', lx.toFixed(1));
          line.setAttribute('y2', ly.toFixed(1));
        }
      }
    }
    // Hidden behind the level? A few signs (and buttons) a test, the test a few times a second.
    const now = performance.now();
    if (now - occludeAt.current >= OCCLUDE_EVERY) {
      occludeAt.current = now;
      const items: { key: string; p: Vec3 | null; el: HTMLElement; pl?: Placed }[] = [
        ...shown.map((v) => ({ key: v.id, p: anchors.get(v.id) ?? null, el: buttons.current.get(v.id)! })),
        ...live.map((s) => ({ key: s.id, p: placed.current.get(s.id)?.probe ?? null, el: placed.current.get(s.id)?.root as HTMLElement, pl: placed.current.get(s.id) })),
      ].filter((x) => !!x.el);
      for (let k = 0; k < Math.min(OCCLUDE_BATCH, items.length); k++) {
        const it = items[(occludeNext.current + k) % items.length];
        const hid = !!it.p && hiddenByLevel(engine, it.p);
        if ((it.el.dataset.occluded === '1') !== hid) it.el.dataset.occluded = hid ? '1' : '0';
      }
      occludeNext.current = items.length ? (occludeNext.current + OCCLUDE_BATCH) % items.length : 0;
    }
    // Paint the dirty signs, within the frame's budget.
    if (dirty.current.size) {
      const t0 = performance.now();
      for (const id of [...dirty.current]) {
        if (performance.now() - t0 > PAINT_BUDGET_MS) break;
        dirty.current.delete(id);
        paintSign(id);
      }
    }
  }

  const paintSign = (id: string) => {
    const pl = placed.current.get(id);
    const s = useSignStore.getState().signs.find((x) => x.id === id);
    const d = signClient.results.get(id);
    if (!pl || !pl.canvas || !s || !d || s.collapsed || s.table) return;
    const k = s.mode === 'fixed' ? BOARD_RES : s.scale;
    pl.hits = paintChart(pl.canvas, d, readTheme(pl.root), SIGN_W * k, SIGN_H * k, pl.hover ? { s: pl.hover.s, g: pl.hover.g } : null, signClient.nowOn(d));
  };

  const register = (id: string, el: HTMLDivElement | null, canvas: HTMLCanvasElement | null) => {
    if (!el) {
      placed.current.delete(id);
      return;
    }
    const old = placed.current.get(id);
    if (old && old.root === el && old.canvas === canvas) return;
    placed.current.set(id, { root: el, canvas, hits: [], hover: null, tf: '', occluded: false, probe: null });
    dirty.current.add(id);
  };

  if (!dataset) return null;
  return (
    <div className="vsigns" ref={root}>
      <svg className="vsign-leaders" aria-hidden="true">
        {live.map((s) => (
          <line
            key={s.id}
            ref={(el) => {
              if (el) leaders.current.set(s.id, el);
              else leaders.current.delete(s.id);
            }}
            stroke={byId.get(s.volumeId)?.color ?? '#888'}
          />
        ))}
      </svg>
      {shown.map((v) => {
        const n = signs.filter((s) => s.volumeId === v.id).length;
        const open = editor?.volumeId === v.id;
        return (
          <button
            key={v.id}
            type="button"
            className={`vsign-btn${open ? ' on' : ''}`}
            ref={(el) => {
              if (el) buttons.current.set(v.id, el);
              else buttons.current.delete(v.id);
            }}
            style={{ display: 'none', ['--vol' as string]: v.color }}
            aria-label={t('charts.btn.label', { name: v.name })}
            title={t('charts.btn.title', { name: v.name })}
            onClick={() => (open ? useSignStore.getState().closeEditor() : useSignStore.getState().openEditor(v.id))}
          >
            <Icon name="compare" size={14} />
            {n > 0 && <span className="vsign-count">{n}</span>}
          </button>
        );
      })}
      {live.map((s) => (
        <SignBoard
          key={s.id}
          sign={s}
          volume={byId.get(s.volumeId)!}
          engine={engine}
          register={register}
          placedOf={(id) => placed.current.get(id)}
          repaint={(id) => {
            dirty.current.add(id);
            paintSign(id);
          }}
          tip={tip}
        />
      ))}
      <div className="chart-tip vsign-tip" ref={tip} style={{ display: 'none' }} />
      {editor && byId.get(editor.volumeId) && <SignEditor volume={byId.get(editor.volumeId)!} />}
    </div>
  );
}

function SignBoard({
  sign,
  volume,
  engine,
  register,
  placedOf,
  repaint,
  tip,
}: {
  sign: Sign;
  volume: Volume;
  engine: Engine | null;
  register: (id: string, el: HTMLDivElement | null, c: HTMLCanvasElement | null) => void;
  placedOf: (id: string) => Placed | undefined;
  repaint: (id: string) => void;
  tip: React.RefObject<HTMLDivElement | null>;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const st = useSignStore.getState();
  const k = sign.mode === 'fixed' ? BOARD_RES : sign.scale;
  const w = SIGN_W * k;
  const bodyH = SIGN_H * k;
  const result = signClient.results.get(sign.id);
  const building = signClient.isBuilding || !result;

  useEffect(() => {
    register(sign.id, rootRef.current, canvasRef.current);
  });
  useEffect(() => () => register(sign.id, null, null), [sign.id]);
  // A size, a mode or a fold changes the canvas: paint again.
  useEffect(() => repaint(sign.id), [sign.scale, sign.mode, sign.collapsed, sign.table, sign.spec]);

  /** Drag the header: a billboard by pixels, a board over the ground (Shift: up and down). */
  const onHeadDown = (e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest('button') || !engine) return;
    e.preventDefault();
    const el = e.currentTarget as HTMLElement;
    el.setPointerCapture(e.pointerId);
    const x0 = e.clientX;
    const y0 = e.clientY;
    const start = { px: sign.px, offset: sign.offset };
    const a = signAnchor(volume);
    const base: Vec3 = [a[0] + sign.offset[0], a[1] + sign.offset[1], a[2] + sign.offset[2]];
    // Screen pixels per world unit along x, z and y at the board: solve the drag back into the world.
    const P = engine.project(base[0], base[1], base[2]);
    const PX = engine.project(base[0] + 1, base[1], base[2]);
    const PZ = engine.project(base[0], base[1], base[2] + 1);
    const PY = engine.project(base[0], base[1] + 1, base[2]);
    const move = (ev: PointerEvent) => {
      const dx = ev.clientX - x0;
      const dy = ev.clientY - y0;
      if (sign.mode === 'billboard') {
        useSignStore.getState().preview(sign.id, { px: [start.px[0] + dx, start.px[1] + dy] });
        return;
      }
      if (!P || !PX || !PZ || !PY) return;
      if (ev.shiftKey) {
        const uy = PY.y - P.y;
        const wy = Math.abs(uy) > 1e-6 ? dy / uy : 0;
        useSignStore.getState().preview(sign.id, { offset: [start.offset[0], start.offset[1] + wy, start.offset[2]] });
        return;
      }
      const ax = PX.x - P.x;
      const ay = PX.y - P.y;
      const bx = PZ.x - P.x;
      const by = PZ.y - P.y;
      const det = ax * by - bx * ay;
      if (Math.abs(det) < 1e-9) return;
      const u = (dx * by - bx * dy) / det;
      const v = (ax * dy - dx * ay) / det;
      useSignStore.getState().preview(sign.id, { offset: [start.offset[0] + u, start.offset[1], start.offset[2] + v] });
    };
    const up = () => {
      el.removeEventListener('pointermove', move);
      el.removeEventListener('pointerup', up);
      el.removeEventListener('pointercancel', up);
      useSignStore.getState().settle();
    };
    el.addEventListener('pointermove', move);
    el.addEventListener('pointerup', up);
    el.addEventListener('pointercancel', up);
  };

  /** Drag the corner grip: the size. */
  const onGripDown = (e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const el = e.currentTarget as HTMLElement;
    el.setPointerCapture(e.pointerId);
    const x0 = e.clientX;
    const s0 = sign.scale;
    const width = rootRef.current?.getBoundingClientRect().width || SIGN_W;
    const move = (ev: PointerEvent) => {
      const f = Math.max(0.4, Math.min(4, s0 * (1 + (ev.clientX - x0) / width)));
      useSignStore.getState().preview(sign.id, { scale: +f.toFixed(3) });
    };
    const up = () => {
      el.removeEventListener('pointermove', move);
      el.removeEventListener('pointerup', up);
      useSignStore.getState().settle();
    };
    el.addEventListener('pointermove', move);
    el.addEventListener('pointerup', up);
  };

  const onMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const pl = placedOf(sign.id);
    const d = signClient.results.get(sign.id);
    if (!pl || !d) return;
    // The canvas may be drawn through a projective transform: measure in its own pixels.
    const sx = (e.nativeEvent.offsetX / e.currentTarget.clientWidth) * (SIGN_W * k);
    const sy = (e.nativeEvent.offsetY / e.currentTarget.clientHeight) * (SIGN_H * k);
    const h = hitAt(pl.hits, sx, sy);
    if (h?.s !== pl.hover?.s || h?.g !== pl.hover?.g) {
      pl.hover = h;
      repaint(sign.id);
    }
    const el = tip.current;
    const host = el?.parentElement?.getBoundingClientRect();
    if (!el || !host) return;
    if (!h) {
      el.style.display = 'none';
      return;
    }
    fillTooltip(el, d, h);
    el.style.display = '';
    el.style.transform = `translate(${(e.clientX - host.left + 14).toFixed(0)}px, ${(e.clientY - host.top + 14).toFixed(0)}px)`;
  };
  const onLeave = () => {
    const pl = placedOf(sign.id);
    if (pl?.hover) {
      pl.hover = null;
      repaint(sign.id);
    }
    if (tip.current) tip.current.style.display = 'none';
  };
  const onClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const pl = placedOf(sign.id);
    const d = signClient.results.get(sign.id);
    if (!pl || !d) return;
    const sx = (e.nativeEvent.offsetX / e.currentTarget.clientWidth) * (SIGN_W * k);
    const sy = (e.nativeEvent.offsetY / e.currentTarget.clientHeight) * (SIGN_H * k);
    const h = hitAt(pl.hits, sx, sy);
    const ent = h ? entityOf(d, h) : null;
    if (ent?.filter) applyMarkFilter(ent.filter, ent.label);
  };

  const title = signTitle(sign);
  const diff = diffText(sign.spec);
  return (
    <div
      ref={rootRef}
      className={`vsign ${sign.mode}${sign.collapsed ? ' collapsed' : ''}`}
      style={{ width: w, ['--vol' as string]: volume.color, ['--k' as string]: String(k), display: 'none' }}
      data-sign={sign.id}
      role="figure"
      aria-label={title}
    >
      <div className="vsign-head" style={{ height: SIGN_HEAD * k }} onPointerDown={onHeadDown} title={t('charts.sign.dragTitle')}>
        <span className="vsign-swatch" />
        <span className="vsign-title">
          {title}
          {diff && <span className="vsign-diff"> · {diff}</span>}
        </span>
        <button type="button" title={sign.collapsed ? t('charts.sign.expand') : t('charts.sign.collapse')} onClick={() => st.update(sign.id, { collapsed: !sign.collapsed })}>
          {sign.collapsed ? '▸' : '▾'}
        </button>
        {!sign.collapsed && (
          <>
            <button type="button" title={t('charts.sign.tableTitle')} aria-pressed={sign.table} className={sign.table ? 'on' : ''} onClick={() => st.update(sign.id, { table: !sign.table })}>
              ▤
            </button>
            <button type="button" title={t('charts.sign.editTitle')} onClick={() => st.openEditor(sign.volumeId, sign.id)}>
              ✎
            </button>
            <button type="button" title={t('charts.sign.sendTitle')} onClick={() => void sendSign(sign, volume)}>
              ⇪
            </button>
          </>
        )}
        <button type="button" title={t('charts.sign.removeTitle')} onClick={() => st.remove(sign.id)}>
          ✕
        </button>
      </div>
      {!sign.collapsed && (
        <div className="vsign-body" style={{ height: bodyH }}>
          {sign.table && result ? (
            <SignTable sign={sign} />
          ) : (
            <canvas ref={canvasRef} style={{ width: w, height: bodyH }} onPointerMove={onMove} onPointerLeave={onLeave} onClick={onClick} />
          )}
          {building && <div className="vsign-wait">{signClient.isBuilding ? t('charts.sign.building') : t('charts.sign.counting')}</div>}
          {result?.sampled && <div className="vsign-note" title={t('charts.sign.sampledTitle')}>{t('charts.sign.sampled')}</div>}
          <div className="vsign-grip" onPointerDown={onGripDown} title={t('charts.sign.sizeTitle')} />
        </div>
      )}
    </div>
  );
}

function SignTable({ sign }: { sign: Sign }) {
  const d = signClient.results.get(sign.id);
  if (!d) return null;
  // The same table the charts module writes for any chart.
  return <SignTableBody d={d} />;
}

function SignTableBody({ d }: { d: ChartData }) {
  return (
    <div className="vsign-table">
      <ChartTable data={d} />
    </div>
  );
}
