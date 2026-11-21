/**
 * Motion for the whole viewer: the durations and easings as tokens, one
 * animation loop for every tween, and the quality switch that turns motion and
 * visual extras off while the 3D view struggles.
 *
 * Tokens. `DUR` and `EASE` are the only durations and curves a panel should
 * use; CSS reads the same values as custom properties (`--motion-fast`,
 * `--motion-base`, `--motion-slow`, `--motion-ease`), set on the root by
 * `applyMotionVars` and set to 0 when motion is off, so a stylesheet written
 * with them switches off with everything else.
 *
 * One loop. `useTween` animates numbers (a bar's height, a slice's angle) on a
 * single shared requestAnimationFrame callback that runs only while something
 * moves. It touches only the component that asked; nothing reads layout.
 *
 * Quality. The engine hands every frame's duration to `noteFrame` (it
 * measures it anyway). The rolling median over the last second decides: above
 * 33 ms (under 30 fps) motion and extras go off at once; they come back after
 * three seconds below 25 ms - the gap between the two keeps it from flickering.
 * The setting (Auto / Always on / Always off) is kept in this browser; the
 * system's reduced-motion preference always wins. The root carries
 * `data-motion="off"` and `data-quality="low"` for stylesheets.
 */

import { useEffect, useRef, useState } from 'react';
import { create } from 'zustand';

/** Durations, ms. */
export const DUR = { fast: 180, base: 300, slow: 500, chart: 450 } as const;
/** Delay between the entries of a list or the marks of a chart, ms; capped by `STAGGER_MAX` in all. */
export const STAGGER = 28;
export const STAGGER_MAX = 260;

/** Ease-out curves: as CSS, and as functions of t in [0, 1]. */
export const EASE = {
  out: 'cubic-bezier(0.22, 1, 0.36, 1)',
  inOut: 'cubic-bezier(0.65, 0, 0.35, 1)',
} as const;
export const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
export const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

export type MotionSetting = 'auto' | 'on' | 'off';

interface MotionState {
  setting: MotionSetting;
  /** The frame rate is too low (auto only). */
  degraded: boolean;
  /** The system asks for reduced motion. */
  reduced: boolean;
  setSetting: (s: MotionSetting) => void;
}

const KEY = '3dheat.motion';

function loadSetting(): MotionSetting {
  try {
    const v = localStorage.getItem(KEY);
    return v === 'on' || v === 'off' ? v : 'auto';
  } catch {
    return 'auto';
  }
}

function reducedNow(): boolean {
  try {
    return typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
  } catch {
    return false;
  }
}

export const useMotion = create<MotionState>((set) => ({
  setting: loadSetting(),
  degraded: false,
  reduced: reducedNow(),
  setSetting: (setting) => {
    try {
      localStorage.setItem(KEY, setting);
    } catch {
      // Not kept: it lasts the session.
    }
    set({ setting });
  },
}));

/** Whether things animate now. */
export function motionOn(s: Pick<MotionState, 'setting' | 'degraded' | 'reduced'> = useMotion.getState()): boolean {
  if (s.reduced || s.setting === 'off') return false;
  return s.setting === 'on' || !s.degraded;
}

/** Whether visual extras (glow, shadow, blur) are drawn now. */
export function extrasOn(s: Pick<MotionState, 'setting' | 'degraded'> = useMotion.getState()): boolean {
  return s.setting === 'on' || (s.setting === 'auto' && !s.degraded);
}

/** The hook form: re-renders when motion turns on or off. */
export function useMotionOn(): boolean {
  return useMotion((s) => motionOn(s));
}

/** The CSS custom properties and root attributes, kept in step with the state. */
export function applyMotionVars(): () => void {
  if (typeof document === 'undefined') return () => {};
  const root = document.documentElement;
  const apply = (s: MotionState) => {
    const on = motionOn(s);
    root.style.setProperty('--motion-fast', on ? `${DUR.fast}ms` : '0ms');
    root.style.setProperty('--motion-base', on ? `${DUR.base}ms` : '0ms');
    root.style.setProperty('--motion-slow', on ? `${DUR.slow}ms` : '0ms');
    root.style.setProperty('--motion-ease', EASE.out);
    root.dataset.motion = on ? 'on' : 'off';
    root.dataset.quality = extrasOn(s) ? 'high' : 'low';
  };
  apply(useMotion.getState());
  const unsub = useMotion.subscribe(apply);
  let mq: MediaQueryList | null = null;
  const onMq = () => useMotion.setState({ reduced: reducedNow() });
  try {
    mq = matchMedia('(prefers-reduced-motion: reduce)');
    mq.addEventListener('change', onMq);
  } catch {
    mq = null;
  }
  return () => {
    unsub();
    mq?.removeEventListener('change', onMq);
  };
}

// ---------------------------------------------------------------------------
// The quality switch, fed by the engine's frames

/** Off above this median frame time over `WINDOW_MS`, back on after `RECOVER_MS` below `ON_MS`. */
export const OFF_MS = 33;
export const ON_MS = 25;
const WINDOW_MS = 1000;
const RECOVER_MS = 3000;
const RING = 256;

const ring = new Float32Array(RING);
const stamps = new Float64Array(RING);
let head = 0;
let filled = 0;
let lastEval = 0;
let goodSince = -1;
const scratch: number[] = [];

/** One frame's duration, from the engine's own measurement. Cheap: a write, and a small sort four times a second. */
export function noteFrame(ms: number, now: number): void {
  ring[head] = ms;
  stamps[head] = now;
  head = (head + 1) % RING;
  if (filled < RING) filled++;
  if (now - lastEval < 250) return;
  lastEval = now;
  const s = useMotion.getState();
  if (s.setting !== 'auto') return;
  scratch.length = 0;
  for (let i = 0; i < filled; i++) if (now - stamps[i] <= WINDOW_MS) scratch.push(ring[i]);
  if (scratch.length < 5) return;
  scratch.sort((a, b) => a - b);
  const median = scratch[scratch.length >> 1];
  const next = qualityStep(s.degraded, median, now);
  if (next !== s.degraded) useMotion.setState({ degraded: next });
}

/**
 * The frames of the last second: how many, and their median duration. Read
 * by the usage statistics' timer every few seconds, never on the frame path.
 */
export function recentFrames(now: number): { count: number; medianMs: number } {
  const xs: number[] = [];
  for (let i = 0; i < filled; i++) if (now - stamps[i] <= WINDOW_MS) xs.push(ring[i]);
  if (!xs.length) return { count: 0, medianMs: 0 };
  xs.sort((a, b) => a - b);
  return { count: xs.length, medianMs: xs[xs.length >> 1] };
}

/** The hysteresis: the next degraded state from the current one and the rolling median. */
export function qualityStep(degraded: boolean, median: number, now: number): boolean {
  if (!degraded) {
    if (median > OFF_MS) {
      goodSince = -1;
      return true;
    }
    return false;
  }
  if (median < ON_MS) {
    if (goodSince < 0) goodSince = now;
    if (now - goodSince >= RECOVER_MS) {
      goodSince = -1;
      return false;
    }
  } else goodSince = -1;
  return true;
}

// ---------------------------------------------------------------------------
// One loop for every tween

type Tick = (now: number) => boolean;
const ticks = new Set<Tick>();
let raf = 0;

function loop(now: number): void {
  raf = 0;
  for (const t of [...ticks]) if (!t(now)) ticks.delete(t);
  if (ticks.size) raf = requestAnimationFrame(loop);
}

/** Run `tick` every frame until it returns false. */
export function animate(tick: Tick): () => void {
  ticks.add(tick);
  if (!raf && typeof requestAnimationFrame === 'function') raf = requestAnimationFrame(loop);
  return () => ticks.delete(tick);
}

export interface Tweened {
  /** The value shown now. */
  v: number;
  /** 0 when entering or leaving, 1 when settled: an opacity, a draw-in fraction. */
  a: number;
  /** Leaving: drawn until it has faded. */
  gone: boolean;
}

interface Track {
  from: number;
  to: number;
  aFrom: number;
  aTo: number;
  start: number;
  delay: number;
  cur: Tweened;
}

/**
 * Numbers by key, moving to their targets: a new key grows in from `enter`
 * (0 by default), a changed one morphs from where it is, a key no longer
 * there shrinks back to `enter` and fades, then drops out. Staggered by the
 * keys' order. Instant when motion is off.
 */
export function useTween(target: Map<string, number>, opts: { duration?: number; enter?: number; stagger?: boolean } = {}): Map<string, Tweened> {
  const on = useMotionOn();
  const tracks = useRef(new Map<string, Track>());
  const [, force] = useState(0);
  const duration = opts.duration ?? DUR.chart;
  const enter = opts.enter ?? 0;
  const sig = [...target].map(([k, v]) => `${k}=${v}`).join('|');
  useEffect(() => {
    const now = performance.now();
    const tr = tracks.current;
    let i = 0;
    const step = opts.stagger === false ? 0 : Math.min(STAGGER, STAGGER_MAX / Math.max(1, target.size));
    for (const [k, v] of target) {
      const t = tr.get(k);
      const delay = i++ * step;
      if (!t) tr.set(k, { from: enter, to: v, aFrom: 0, aTo: 1, start: now, delay, cur: { v: on ? enter : v, a: on ? 0 : 1, gone: false } });
      else {
        t.from = t.cur.v;
        t.to = v;
        t.aFrom = t.cur.a;
        t.aTo = 1;
        t.start = now;
        t.delay = t.cur.gone ? delay : 0;
        t.cur.gone = false;
      }
    }
    for (const [k, t] of tr)
      if (!target.has(k)) {
        if (!on) {
          tr.delete(k);
          continue;
        }
        if (!t.cur.gone) {
          t.from = t.cur.v;
          t.to = enter;
          t.aFrom = t.cur.a;
          t.aTo = 0;
          t.start = now;
          t.delay = 0;
          t.cur.gone = true;
        }
      }
    if (!on) {
      for (const t of tr.values()) t.cur = { v: t.to, a: 1, gone: false };
      force((x) => x + 1);
      return;
    }
    const stop = animate((time) => {
      let moving = false;
      for (const [k, t] of tr) {
        const p = Math.min(1, Math.max(0, (time - t.start - t.delay) / duration));
        const e = easeOut(p);
        t.cur = { v: t.from + (t.to - t.from) * e, a: t.aFrom + (t.aTo - t.aFrom) * e, gone: t.cur.gone };
        if (p < 1) moving = true;
        else if (t.cur.gone) tr.delete(k);
      }
      force((x) => x + 1);
      return moving;
    });
    return () => {
      stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sig, on, duration, enter]);
  const out = new Map<string, Tweened>();
  for (const [k, t] of tracks.current) out.set(k, t.cur);
  return out;
}
