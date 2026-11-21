/**
 * The usage statistics' eyes on the page: installed once by App, every
 * listener passive and in the capture phase, every handler a few compares
 * and at most a push (`record`). Nothing here runs on the frame path: the
 * frame rate is read from motion.ts's ring by a five-second timer, the
 * controls on screen from an IntersectionObserver, and the totals written
 * when the recorder flushes in idle time.
 *
 * What it sees, by feature id (features.ts), never by what is on the screen:
 * - a click on a control (`use`, its source and the steps it took), a change
 *   of a field (`set`, the value only for a fixed choice), a key from the
 *   shortcut table (`use`, source key);
 * - the workspace, view mode, task group, folds and overlays, from the stores;
 * - data loaded (from `notePick` and the stores): how, the file types, the
 *   rows as a power of ten, how long it took;
 * - friction: rage clicks, clicks that changed nothing, undo right after a
 *   use, errors shown, tooltips read for over a second;
 * - active time per workspace and mode, frame-rate buckets per workspace, the
 *   quality switch turning extras off, and the time each control was on
 *   screen.
 */

import type { Engine } from '../render/engine';
import { has, keyOf } from '../i18n';
import { useStore } from '../state/store';
import { useRaceStore } from '../state/raceStore';
import { useHelpStore } from '../state/helpStore';
import { useMatchStore } from '../state/matchStore';
import { usePlanStore } from '../state/planStore';
import { useReplayStore } from '../state/replayStore';
import { useInspectStore } from '../state/inspectStore';
import { useShell } from '../ui/shell/shellStore';
import { SHORTCUTS, type ShortcutScope } from '../ui/shell/shortcuts';
import { recentFrames, useMotion } from '../ui/motion';
import { flush, onFlush, probeLocal, record, usageOn, useUsage } from './recorder';
import { areaOf, controlOf, featureOf, isDevTool } from './features';
import { isActive, noteActive, notePick, sourceNow, noteError, noteFriction, noteOpen, notePaletteOpen, noteSet, noteStep, noteUndo, noteUse, setPanelScroll, takePick, where, withSource } from './hooks';
import { fpsBucket, rowsBucket, screenBucket, type Source } from './schema';
import { openFeedback } from './feedbackStore';

let engine: Engine | null = null;
/** The engine, once it runs: its backend goes into the page load's event. */
export function setUsageEngine(e: Engine | null): void {
  engine = e;
  if (e) sessionStart();
}

// ---------------------------------------------------------------- session

let started = false;
function sessionStart(): void {
  if (started || !usageOn()) return;
  started = true;
  const backend = engine?.live.backend;
  record({
    k: 'session',
    v: backend === 'webgpu' || backend === 'webgl2' ? backend : 'none',
    id: screenBucket(screen?.width ?? innerWidth, screen?.height ?? innerHeight),
    ws: where.ws as never,
  });
}

// ---------------------------------------------------------------- keys

const SCOPES_OF: Record<string, ShortcutScope[]> = {
  heat: ['shell', 'view', 'replay', 'camera'],
  match: ['shell', 'view', 'replay', 'camera'],
  race: ['shell', 'race', 'camera'],
  plan: ['shell', 'tactics'],
  vehicle: ['shell', 'camera'],
};
/** Keys the stores already report (workspace, overlays, view modes) or that only close things. */
const BY_STORE = new Set(['palette', 'sheet', 'help', 'workspace', 'close', 'modes', 'clear', 'cancel', 'look', 'wheel', 'tools', 'toolLetters']);
/** Keys held to fly: counted once per stretch, not per press. */
const HELD = new Set(['fly', 'arrows', 'up', 'down', 'boost', 'slow']);
const CAP: Record<string, string> = { Space: ' ', Esc: 'Escape', '↑': 'ArrowUp', '↓': 'ArrowDown', '←': 'ArrowLeft', '→': 'ArrowRight', PgDn: 'PageDown', PgUp: 'PageUp', Delete: 'Delete', Backspace: 'Backspace', Enter: 'Enter', Home: 'Home' };

interface Combo {
  id: string;
  scope: ShortcutScope;
  ctrl: boolean;
  shift: boolean;
  alt: boolean;
  /** Key values it answers to. */
  keys: Set<string>;
}

const COMBOS: Combo[] = SHORTCUTS.flatMap((s) =>
  s.keys.flatMap((parts) => {
    const cap = parts[parts.length - 1];
    const mods = new Set(parts.slice(0, -1));
    let keys: string[];
    const range = /^(\d)…(\d)$/.exec(cap);
    if (range) keys = Array.from({ length: Number(range[2]) - Number(range[1]) + 1 }, (_, i) => String(Number(range[1]) + i));
    else if (CAP[cap]) keys = [CAP[cap]];
    else if (/^F\d+$/.test(cap) || cap.length === 1) keys = [cap.length === 1 ? cap.toLowerCase() : cap];
    else return []; // Drag, Wheel, a modifier on its own
    return [{ id: s.id, scope: s.scope, ctrl: mods.has('Ctrl'), shift: mods.has('Shift'), alt: mods.has('Alt'), keys: new Set(keys) }];
  }),
);

function inTextField(el: EventTarget | null): boolean {
  const e = el as HTMLElement | null;
  if (!e?.tagName) return false;
  if (e.tagName === 'TEXTAREA' || e.isContentEditable || e.tagName === 'SELECT') return true;
  return e.tagName === 'INPUT' && !/^(checkbox|radio|range|button)$/.test((e as HTMLInputElement).type);
}

/** The shortcut a key press is on this workspace, or null. */
export function shortcutOf(ev: Pick<KeyboardEvent, 'key' | 'code' | 'ctrlKey' | 'metaKey' | 'shiftKey' | 'altKey'>, ws: string): string | null {
  const scopes = SCOPES_OF[ws] ?? ['shell'];
  const ctrl = ev.ctrlKey || ev.metaKey;
  const key = ev.key.length === 1 ? ev.key.toLowerCase() : ev.key;
  // Shift+1 types "!": the digit is in the code.
  const digit = /^(Digit|Numpad)(\d)$/.exec(ev.code)?.[2];
  for (const scope of scopes)
    for (const c of COMBOS) {
      if (c.scope !== scope || c.ctrl !== ctrl || c.alt !== ev.altKey) continue;
      const hit = c.keys.has(key) || (digit !== undefined && c.keys.has(digit));
      if (!hit) continue;
      // A symbol's shift is the keyboard's business (`?` is Shift+/ on some).
      if (c.shift !== ev.shiftKey && /^[a-z0-9]$|^F\d+$|^Arrow|^Page|^(Escape|Enter|Home|Delete|Backspace| )$/.test(key)) continue;
      return c.id;
    }
  return null;
}

// ---------------------------------------------------------------- clicks

const clicks: Array<{ x: number; y: number; t: number }> = [];
let rageAt = -1e9;

function rage(ev: PointerEvent): void {
  const t = ev.timeStamp;
  clicks.push({ x: ev.clientX, y: ev.clientY, t });
  while (clicks.length > 4 || (clicks.length && t - clicks[0].t > 1000)) clicks.shift();
  const near = clicks.filter((c) => Math.abs(c.x - ev.clientX) < 24 && Math.abs(c.y - ev.clientY) < 24);
  if (near.length >= 3 && t - rageAt > 2000) {
    rageAt = t;
    const target = ev.target as Element | null;
    // Clicks on the view are how one flies and picks: only the panels' controls rage.
    if (!target?.closest?.('canvas')) noteFriction('rage', featureOf(target) ?? areaOf(target));
  }
}

/** Whether anything changed since a click: a store, the page, the camera, the window's focus. */
let changed = false;
let watching = 0;
let mo: MutationObserver | null = null;
const camSum = () => {
  const p = engine?.camera.position;
  return p ? p.x + p.y * 3 + p.z * 7 + (engine!.camera.yaw ?? 0) * 11 + (engine!.camera.pitch ?? 0) * 13 : 0;
};

/** After a click on a button: nothing changed within a second is a click that did nothing. */
function watchEffect(id: string): void {
  if (typeof MutationObserver === 'undefined') return;
  changed = false;
  const cam = camSum();
  mo ??= new MutationObserver(() => {
    changed = true;
    mo?.disconnect();
  });
  mo.observe(document.body, { subtree: true, childList: true, attributes: true, characterData: true });
  const token = ++watching;
  window.setTimeout(() => {
    mo?.disconnect();
    if (token !== watching) return;
    if (!changed && camSum() === cam && document.hasFocus()) noteFriction('dead', id);
  }, 1000);
}

function onPointerDown(ev: PointerEvent): void {
  noteActive();
  if (!usageOn()) return;
  const t = ev.target as Element | null;
  const s: Source = t?.closest?.('.quick-bar') ? 'quick' : t?.closest?.('.usage-menu') ? 'context' : t?.closest?.('.palette') ? 'palette' : 'button';
  withSource(s, 600);
  rage(ev);
}

const BY_STORE_PREFIX = /^(ws|task|more|panel|mode):/;

function onClick(ev: MouseEvent): void {
  if (!usageOn()) return;
  const target = ev.target as Element | null;
  if (!target?.closest || target.closest('.palette, .usage-menu, .usage-feedback')) return;
  const ctl = controlOf(target);
  if (!ctl || ctl.closest('.section[data-section] > header')) return;
  // Fields report on change; the label around one passes its click to it.
  if (/^(INPUT|SELECT|TEXTAREA|OPTION)$/.test(ctl.tagName) || (ctl.tagName === 'LABEL' && ctl.querySelector('input, select'))) return;
  const id = featureOf(ctl);
  if (!id || BY_STORE_PREFIX.test(id)) return;
  if (/undo/i.test(id)) noteUndo();
  noteUse(id, { el: ctl, dev: isDevTool(ctl), src: (ctl.closest('.quick-bar') ? 'quick' : undefined) as Source | undefined });
  watchEffect(id);
}

const ENUM_VALUE = /^[a-z0-9][a-z0-9_+.-]{0,31}$/;

function onChange(ev: Event): void {
  if (!usageOn()) return;
  const el = ev.target as HTMLInputElement | HTMLSelectElement | null;
  if (!el?.tagName || el.closest('.palette, .usage-feedback')) return;
  if (el instanceof HTMLInputElement && el.type === 'file') {
    // Files picked: how, and their types (the names go no further than `notePick`).
    const files = [...(el.files ?? [])];
    if (!files.length) return;
    const method = el.hasAttribute('webkitdirectory') ? 'folder' : el.closest('.session-actions, .session-panel') ? 'session' : el.closest('.catalog') ? 'catalogue' : 'files';
    notePick(method, files.map((f) => f.name), { dev: isDevTool(el) });
    return;
  }
  const id = featureOf(el);
  if (!id) return;
  let v: string | undefined;
  if (el instanceof HTMLInputElement && (el.type === 'checkbox' || el.type === 'radio')) v = el.type === 'checkbox' ? (el.checked ? 'on' : 'off') : undefined;
  else if (el instanceof HTMLSelectElement) {
    // The choice, only when the option is one of the viewer's own words (a fixed list), never a name from the data.
    const opt = el.selectedOptions[0];
    const named = opt && opt.value && ENUM_VALUE.test(opt.value) && keyOfOption(opt);
    v = named ? opt.value : undefined;
  }
  noteSet(id, v, { el, dev: isDevTool(el) });
}

const keyOfOption = (o: HTMLOptionElement) => {
  const k = keyOf(o.textContent?.trim() ?? '');
  return !!k && has(k);
};

function onKeyDown(ev: KeyboardEvent): void {
  noteActive();
  if (!usageOn() || ev.repeat || ev.isComposing) return;
  if (inTextField(ev.target)) return;
  const id = shortcutOf(ev, where.ws);
  if ((ev.ctrlKey || ev.metaKey) && ev.code === 'KeyZ' && !ev.shiftKey) noteUndo();
  if (!id) return;
  withSource('key', 600);
  if (BY_STORE.has(id) || id === 'undo' || id === 'redo') return;
  if (HELD.has(id)) {
    const t = ev.timeStamp;
    if (t - (heldAt.get(id) ?? -1e9) < 3000) {
      heldAt.set(id, t);
      return;
    }
    heldAt.set(id, t);
  }
  noteUse(`cmd:${id}`, { src: 'key' });
}
const heldAt = new Map<string, number>();

// ---------------------------------------------------------------- hover help

let hoverEl: Element | null = null;
let hoverAt = 0;

function onPointerOver(ev: PointerEvent): void {
  if (!usageOn()) return;
  const el = (ev.target as Element | null)?.closest?.('[data-tip], [title]') ?? null;
  if (el === hoverEl) return;
  if (hoverEl && ev.timeStamp - hoverAt > 1000 && !hoverEl.closest('canvas')) {
    const id = featureOf(hoverEl);
    if (id) record({ k: 'help', id, src: 'hover', ws: where.ws as never });
  }
  hoverEl = el;
  hoverAt = ev.timeStamp;
}

// ---------------------------------------------------------------- feedback menu

function onContextMenu(ev: MouseEvent): void {
  if (!usageOn()) return;
  const t = ev.target as Element | null;
  if (!t?.closest?.('.sidebar, .quick-bar, .settings-popover, .timeline-bar, .tabs, .task-bar, .brand, .help-panel') || inTextField(t)) return;
  const id = featureOf(t);
  if (!id) return;
  ev.preventDefault();
  openFeedback(id, ev.clientX, ev.clientY);
}

// ---------------------------------------------------------------- side panel scroll

let lastScroll = -1e9;
function onScroll(ev: Event): void {
  const t = ev.target as Element | null;
  if (!t?.classList?.contains('sidebar')) return;
  noteActive();
  if (ev.timeStamp - lastScroll > 400) noteStep();
  lastScroll = ev.timeStamp;
}

// ---------------------------------------------------------------- time, frame rate, exposure

const timeMs = new Map<string, number>();
const fpsMs = new Map<string, number>();
const seenMs = new Map<string, number>();
let lastTick = 0;
const TICK = 5000;

const visible = new Set<Element>();
const idOf = new WeakMap<Element, string | null>();
const observed = new WeakSet<Element>();
let io: IntersectionObserver | null = null;
const EXPOSED =
  '.sidebar .section[data-section] > header, .sidebar .section.open > .body :is(button, select, input, summary, [role="button"]), .quick-bar button, .task-bar button, .tabs button, .more-toggle, .timeline-bar button, .brand button';

function discover(): void {
  if (typeof IntersectionObserver === 'undefined') return;
  io ??= new IntersectionObserver(
    (entries) => {
      for (const e of entries) if (e.isIntersecting) visible.add(e.target);
      else visible.delete(e.target);
    },
    { threshold: 0.5 },
  );
  for (const el of document.querySelectorAll(EXPOSED)) {
    if (observed.has(el)) continue;
    observed.add(el);
    io.observe(el);
  }
}

function tick(): void {
  const t = performance.now();
  const dt = lastTick ? Math.min(TICK * 3, t - lastTick) : 0;
  lastTick = t;
  if (!usageOn() || !dt) return;
  if (!isActive() || document.visibilityState !== 'visible') return;
  const key = `${where.ws}|${where.mode}`;
  timeMs.set(key, (timeMs.get(key) ?? 0) + dt);
  const f = recentFrames(t);
  if (f.count >= 5 && f.medianMs > 0) {
    const k = `${where.ws}|${fpsBucket(1000 / f.medianMs)}`;
    fpsMs.set(k, (fpsMs.get(k) ?? 0) + dt);
  }
  const ids = new Set<string>();
  for (const el of visible) {
    if (!el.isConnected) {
      visible.delete(el);
      io?.unobserve(el);
      continue;
    }
    let id = idOf.get(el);
    if (id === undefined) idOf.set(el, (id = featureOf(el)));
    if (id) ids.add(id);
  }
  for (const id of ids) seenMs.set(id, (seenMs.get(id) ?? 0) + dt);
  const idle = typeof requestIdleCallback === 'function' ? requestIdleCallback : (cb: () => void) => window.setTimeout(cb, 0);
  idle(discover);
}

function writeTotals(): void {
  const ms = (x: number) => Math.min(864e5, Math.round(x));
  for (const [k, v] of timeMs) {
    const [ws, mode] = k.split('|');
    record({ k: 'time', ws: ws as never, ...(mode ? { mode } : {}), ms: ms(v) });
  }
  for (const [k, v] of fpsMs) {
    const [ws, b] = k.split('|');
    record({ k: 'fps', ws: ws as never, n: Number(b), ms: ms(v) });
  }
  for (const [id, v] of seenMs) if (v >= 500) record({ k: 'seen', id, ms: ms(v) });
  timeMs.clear();
  fpsMs.clear();
  seenMs.clear();
}

// ---------------------------------------------------------------- stores

function watchStores(): Array<() => void> {
  const offs: Array<() => void> = [];
  const touch = () => {
    changed = true;
  };
  // A store changing is an effect, for the clicks that did nothing.
  for (const s of [useStore, useRaceStore, useShell, useHelpStore, useMatchStore, usePlanStore, useReplayStore, useInspectStore] as Array<{ subscribe: (fn: () => void) => () => void }>)
    offs.push(s.subscribe(touch));

  where.ws = useRaceStore.getState().tab;
  where.mode = useStore.getState().mode;
  offs.push(
    useRaceStore.subscribe((s, p) => {
      if (s.tab === p.tab) return;
      where.ws = s.tab;
      noteOpen(`ws:${s.tab}`, true);
    }),
  );
  offs.push(
    useStore.subscribe((s, p) => {
      if (s.mode !== p.mode) {
        where.mode = s.mode;
        noteUse(`mode:${s.mode}`);
      }
      if (s.dataset !== p.dataset && s.dataset) loaded(s.dataset.count);
      if (s.level && (!p.level || s.level.name !== p.level.name)) loaded();
      if (s.load.error && s.load.error !== p.load.error) noteError('error', 'err:load');
    }),
  );
  offs.push(
    useShell.subscribe((s, p) => {
      if (s.task !== p.task) for (const [ws, task] of Object.entries(s.task)) if (p.task[ws] !== task) noteOpen(`task:${ws}.${task}`, true);
      if (s.more !== p.more) for (const [id, open] of Object.entries(s.more)) if (!!p.more[id] !== open) noteOpen(`more:${id}`, open);
      for (const k of ['palette', 'sheet', 'settings'] as const)
        if (s[k] !== p[k]) {
          if (k === 'palette' && s[k]) notePaletteOpen();
          noteOpen(`panel:${k}`, s[k]);
        }
    }),
  );
  offs.push(useHelpStore.subscribe((s, p) => s.on !== p.on && noteOpen('panel:help', s.on)));
  // A tactics tool picked by its key: which tool (a click on its button is a use of that button).
  offs.push(usePlanStore.subscribe((s, p) => s.tool !== p.tool && sourceNow() === 'key' && noteUse(`tool:${s.tool}`, { src: 'key' })));
  offs.push(
    useMatchStore.subscribe((s, p) => {
      const n = s.docs.length + s.games.length + s.summaries.length;
      if (n > p.docs.length + p.games.length + p.summaries.length) loaded(n);
      if (s.error && s.error !== p.error) noteError('error', 'err:match');
    }),
  );
  offs.push(useMotion.subscribe((s, p) => s.degraded && !p.degraded && record({ k: 'degrade', ws: where.ws as never })));
  return offs;
}

/** Data arrived: how it was picked, its types, rows as a power of ten, the time since the pick. */
function loaded(rows?: number): void {
  if (!usageOn()) return;
  const p = takePick();
  record({
    k: 'load',
    v: p?.method ?? 'other',
    ...(p?.types ? { id: p.types } : {}),
    ...(rows !== undefined ? { n: rowsBucket(rows) } : {}),
    ...(p ? { ms: Math.min(864e5, Math.round(performance.now() - p.at)) } : {}),
    ws: where.ws as never,
    ...(p?.dev ? { dev: 1 } : {}),
  });
}

// ---------------------------------------------------------------- install

/** Installs everything; returns its removal. Cheap while statistics are off: each handler returns at its first line. */
export function installUsage(): () => void {
  if (typeof window === 'undefined') return () => {};
  void probeLocal();
  setPanelScroll((el) => {
    const panel = el?.closest('.sidebar');
    return panel ? Math.min(10000, Math.round(panel.scrollTop / 100)) : undefined;
  });
  const opts = { capture: true, passive: true } as const;
  window.addEventListener('pointerdown', onPointerDown, opts);
  window.addEventListener('click', onClick, opts);
  window.addEventListener('change', onChange, opts);
  window.addEventListener('keydown', onKeyDown, opts);
  window.addEventListener('pointerover', onPointerOver, opts);
  window.addEventListener('contextmenu', onContextMenu, { capture: true });
  document.addEventListener('scroll', onScroll, opts);
  const onError = () => noteError('error', 'err:js');
  window.addEventListener('error', onError);
  window.addEventListener('unhandledrejection', onError);
  const onHide = () => {
    if (!usageOn()) return;
    record({ k: 'end', ws: where.ws as never });
    void flush(true);
  };
  window.addEventListener('pagehide', onHide);
  onFlush(writeTotals);
  const timer = window.setInterval(tick, TICK);
  const offs = watchStores();
  // On when switched on: the page load's event, once.
  offs.push(useUsage.subscribe((s, p) => s.enabled && !p.enabled && engine && sessionStart()));
  if (engine) sessionStart();
  // For the smoke test (tools/smoke-usage.mjs): write the buffer out now. Dev only.
  if (import.meta.env.DEV) (window as unknown as Record<string, unknown>).__3dheat_usage = { flush: () => flush(), state: () => useUsage.getState() };
  return () => {
    window.removeEventListener('pointerdown', onPointerDown, opts);
    window.removeEventListener('click', onClick, opts);
    window.removeEventListener('change', onChange, opts);
    window.removeEventListener('keydown', onKeyDown, opts);
    window.removeEventListener('pointerover', onPointerOver, opts);
    window.removeEventListener('contextmenu', onContextMenu, { capture: true });
    document.removeEventListener('scroll', onScroll, opts);
    window.removeEventListener('error', onError);
    window.removeEventListener('unhandledrejection', onError);
    window.removeEventListener('pagehide', onHide);
    window.clearInterval(timer);
    for (const off of offs) off();
    io?.disconnect();
    io = null;
  };
}
