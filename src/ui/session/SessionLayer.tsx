/**
 * The session over the view: the other members' cameras (a frustum, a dot
 * and a name where each one is, and their pointer), the marks, the "look
 * here" requests, following, and the panel. The drawing is SVG updated in
 * its own animation frame and only when the camera or a presence changed,
 * never through React and never touching the engine's frame.
 */

import { useEffect, useRef, useState } from 'react';
import { list, t, useLang } from '../../i18n';
import type { Engine } from '../../render/engine';
import { session } from '../../session/client';
import { registerBuiltInDocs } from '../../session/docs';
import { browserKey, eraseAll, eraseMine, isMine, useMarks } from '../../session/marks';
import { applyPose, cameraSig, pointUnder, presence, presenceClock, sameSig } from '../../session/presence';
import { autosave } from '../../session/sessionFile';
import { rankOf, useSessionStore, type LookRequest } from '../../session/store';
import { useRaceStore } from '../../state/raceStore';
import { useStore } from '../../state/store';
import { SLICE_WORDS } from '../../session/viewSlices';
import { Icon } from '../shell/Icon';
import { usePlanStore } from '../../state/planStore';
import { useAnimationFrame, useEngine } from '../EngineContext';
import { toast } from '../shell/kit';
import { chooseSessionFile, SessionPanel } from './SessionPanel';
import { readAutosave } from '../../session/sessionFile';
import { restoreSession } from '../../session/sessionOpen';
import { urlIntent } from './sessionUrl';
import { registerRoomDoc } from '../../session/room';
import { RoomPrompts } from './RoomPrompts';
import { useVideoAuto } from './VideoSection';
import './session.css';

type V3 = { x: number; y: number; z: number };
const SVG = 'http://www.w3.org/2000/svg';

/** A member's colour, the same in every viewer. */
export function memberColor(id: number): string {
  return `hsl(${(id * 137.508) % 360} 85% 62%)`;
}

const add = (a: V3, b: V3, k = 1): V3 => ({ x: a.x + b.x * k, y: a.y + b.y * k, z: a.z + b.z * k });
const cross = (a: V3, b: V3): V3 => ({ x: a.y * b.z - a.z * b.y, y: a.z * b.x - a.x * b.z, z: a.x * b.y - a.y * b.x });
const norm = (a: V3): V3 => {
  const l = Math.hypot(a.x, a.y, a.z) || 1;
  return { x: a.x / l, y: a.y / l, z: a.z / l };
};

interface PeerEls {
  g: SVGGElement;
  frustum: SVGPathElement;
  dot: SVGCircleElement;
  label: SVGTextElement;
  /** The pointer in the world: the ray from their camera, a ring on what it hit, a stalk and the name. */
  ray: SVGPathElement;
  ring: SVGPathElement;
  stalk: SVGPathElement;
  tip: SVGCircleElement;
  cursorLabel: SVGTextElement;
}

function makePeer(svg: SVGSVGElement, color: string): PeerEls {
  const g = document.createElementNS(SVG, 'g');
  g.setAttribute('class', 'peer');
  g.style.setProperty('--c', color);
  const el = <K extends 'path' | 'circle' | 'text'>(tag: K, cls: string) => {
    const e = document.createElementNS(SVG, tag);
    e.setAttribute('class', cls);
    return e;
  };
  const frustum = el('path', 'peer-frustum');
  const dot = el('circle', 'peer-dot');
  dot.setAttribute('r', '5');
  const label = el('text', 'peer-label');
  const ray = el('path', 'peer-ray');
  const ring = el('path', 'peer-ring');
  const stalk = el('path', 'peer-stalk');
  const tip = el('circle', 'peer-tip');
  tip.setAttribute('r', '3.5');
  const cursorLabel = el('text', 'peer-label small');
  const pointer = document.createElementNS(SVG, 'g');
  pointer.setAttribute('class', 'peer-pointer');
  pointer.append(ray, ring, stalk, tip, cursorLabel);
  g.append(frustum, dot, label, pointer);
  svg.appendChild(g);
  return { g, frustum, dot, label, ray, ring, stalk, tip, cursorLabel };
}

/** A pointer left still this long fades out, ms. */
const POINTER_STILL_MS = 5000;

/** The other members' cameras and pointers over the view. */
function PresenceOverlay({ engine }: { engine: Engine }) {
  const svg = useRef<SVGSVGElement>(null);
  const els = useRef(new Map<number, PeerEls>());
  const last = useRef<{ sig: number[] | null; v: number; fade: number }>({ sig: null, v: -1, fade: 0 });
  const joined = useSessionStore((s) => s.state === 'joined');
  useAnimationFrame(() => {
    const root = svg.current;
    if (!root) return;
    const sig = cameraSig(engine);
    // A still pointer fades: the overlay looks again every half second for it.
    const fade = Math.floor(performance.now() / 500);
    if (sameSig(last.current.sig, sig) && last.current.v === presenceClock.v && last.current.fade === fade) return;
    last.current = { sig, v: presenceClock.v, fade };
    const st = useSessionStore.getState();
    const tab = useRaceStore.getState().tab;
    const me = engine.cameraPose().position;
    const now = performance.now();
    if (els.current.size && els.current.values().next().value?.g.parentNode !== root) els.current.clear();
    const seen = new Set<number>();
    const xy = (q: { x: number; y: number }) => `${q.x.toFixed(1)} ${q.y.toFixed(1)}`;
    for (const [id, p] of presence) {
      // Only those in the same workspace: a board's camera means nothing over a heatmap.
      if (p.tab && p.tab !== tab) continue;
      seen.add(id);
      let e = els.current.get(id);
      if (!e) {
        e = makePeer(root, memberColor(id));
        els.current.set(id, e);
      }
      const name = st.members.find((m) => m.id === id)?.name ?? '';
      const pos = p.pose.position;
      const f = norm(p.pose.forward);
      // A frustum of a size that reads from here: a tenth of the distance to it.
      const d = Math.max(0.5, Math.hypot(pos.x - me.x, pos.y - me.y, pos.z - me.z) * 0.1);
      let right = cross(f, { x: 0, y: 1, z: 0 });
      if (Math.hypot(right.x, right.y, right.z) < 1e-4) right = { x: 1, y: 0, z: 0 };
      right = norm(right);
      const up = norm(cross(right, f));
      const hh = Math.tan(((p.pose.fov || 60) * Math.PI) / 360) * d;
      const hw = hh * (p.pose.aspect || 1.6);
      const c = add(pos, f, d);
      const corners = [add(add(c, right, -hw), up, hh), add(add(c, right, hw), up, hh), add(add(c, right, hw), up, -hh), add(add(c, right, -hw), up, -hh)];
      const apex = engine.project(pos.x, pos.y, pos.z);
      const cs = corners.map((q) => engine.project(q.x, q.y, q.z));
      let path = '';
      if (apex && cs.every(Boolean)) {
        const pts = cs as { x: number; y: number }[];
        for (const q of pts) path += `M${xy(apex)}L${xy(q)}`;
        path += `M${pts.map(xy).join('L')}Z`;
      }
      e.frustum.setAttribute('d', path);
      if (apex) {
        e.dot.setAttribute('cx', apex.x.toFixed(1));
        e.dot.setAttribute('cy', apex.y.toFixed(1));
        e.label.setAttribute('x', (apex.x + 8).toFixed(1));
        e.label.setAttribute('y', (apex.y - 8).toFixed(1));
        if (e.label.textContent !== name) e.label.textContent = name;
        e.dot.style.display = e.label.style.display = '';
      } else {
        e.dot.style.display = e.label.style.display = 'none';
      }
      // The pointer as a point in the world: a ring lying on what the ray hit, sized
      // for this viewer's distance so it reads at any zoom, a stalk up from it with the
      // name on top, and the ray from their camera to it.
      const q = p.cursor;
      const tip = q ? engine.project(q.x, q.y, q.z) : null;
      const pointer = e.tip.parentNode as SVGGElement;
      if (q && tip) {
        const dist = Math.max(0.5, Math.hypot(q.x - me.x, q.y - me.y, q.z - me.z));
        const r = dist * 0.018;
        let ring = '';
        let pen = false;
        for (let i = 0; i <= 24; i++) {
          const a = (i / 24) * Math.PI * 2;
          const s = engine.project(q.x + Math.cos(a) * r, q.y, q.z + Math.sin(a) * r);
          if (!s) {
            pen = false;
            continue;
          }
          ring += `${pen ? 'L' : 'M'}${xy(s)}`;
          pen = true;
        }
        e.ring.setAttribute('d', ring);
        const top = engine.project(q.x, q.y + r * 3, q.z);
        e.stalk.setAttribute('d', top ? `M${xy(tip)}L${xy(top)}` : '');
        e.tip.setAttribute('cx', tip.x.toFixed(1));
        e.tip.setAttribute('cy', tip.y.toFixed(1));
        const at = top ?? tip;
        e.cursorLabel.setAttribute('x', (at.x + 6).toFixed(1));
        e.cursorLabel.setAttribute('y', (at.y - 4).toFixed(1));
        if (e.cursorLabel.textContent !== name) e.cursorLabel.textContent = name;
        e.ray.setAttribute('d', apex ? `M${xy(apex)}L${xy(tip)}` : '');
        pointer.style.display = '';
        pointer.style.opacity = now - p.cursorMoved > POINTER_STILL_MS ? '0' : '1';
      } else {
        pointer.style.display = 'none';
      }
    }
    for (const [id, e] of els.current) {
      if (!seen.has(id)) {
        e.g.remove();
        els.current.delete(id);
      }
    }
  }, joined);
  if (!joined) return null;
  return <svg ref={svg} className="session-presence" aria-hidden="true" />;
}

/** The marks over the view, and the tool that sets, draws and erases them. */
function MarksOverlay({ engine }: { engine: Engine }) {
  useLang();
  const svg = useRef<SVGSVGElement>(null);
  const visible = useMarks((s) => s.visible);
  const tool = useMarks((s) => s.tool);
  const count = useMarks((s) => (s.doc.pins?.length ?? 0) + (s.doc.strokes?.length ?? 0));
  const last = useRef<{ sig: number[] | null; doc: unknown; draft: V3[] | null }>({ sig: null, doc: null, draft: null });
  const draft = useRef<V3[] | null>(null);
  const els = useRef(new Map<string, SVGElement>());
  const [ask, setAsk] = useState<{ x: number; y: number; at: V3 } | null>(null);
  const [text, setText] = useState('');
  const role = useSessionStore((s) => s.role);
  const state = useSessionStore((s) => s.state);

  useAnimationFrame(() => {
    const root = svg.current;
    if (!root) return;
    const doc = useMarks.getState().doc;
    const sig = cameraSig(engine);
    if (sameSig(last.current.sig, sig) && last.current.doc === doc && last.current.draft === draft.current) return;
    last.current = { sig, doc, draft: draft.current };
    const css = (c: [number, number, number]) => `rgb(${Math.round(c[0] * 255)},${Math.round(c[1] * 255)},${Math.round(c[2] * 255)})`;
    const line = (pts: V3[]) => {
      let d = '';
      let pen = false;
      for (const q of pts) {
        const s = engine.project(q.x, q.y, q.z);
        if (!s) {
          pen = false;
          continue;
        }
        d += `${pen ? 'L' : 'M'}${s.x.toFixed(1)} ${s.y.toFixed(1)}`;
        pen = true;
      }
      return d;
    };
    // Each mark keeps its element: a frame only moves them (a new one made, a gone one taken out).
    const pool = els.current;
    // Drawn into a new layer (hidden and shown again): start over.
    if (pool.size && pool.values().next().value?.parentNode !== root) pool.clear();
    const seen = new Set<string>();
    const el = (id: string, make: () => SVGElement) => {
      let e = pool.get(id);
      if (!e) {
        e = make();
        pool.set(id, e);
        root.appendChild(e);
      }
      seen.add(id);
      return e;
    };
    for (const s of doc.strokes) {
      const p = el(s.id, () => {
        const p = document.createElementNS(SVG, 'path');
        p.setAttribute('class', 'mark-stroke');
        p.style.stroke = css(s.color);
        p.style.strokeWidth = String(s.width);
        return p;
      });
      p.setAttribute('d', line(s.points));
    }
    const d = el('~draft', () => {
      const p = document.createElementNS(SVG, 'path');
      p.setAttribute('class', 'mark-stroke draft');
      return p;
    });
    d.setAttribute('d', draft.current ? line(draft.current) : '');
    for (const pin of doc.pins) {
      const g = el(pin.id, () => {
        const g = document.createElementNS(SVG, 'g');
        g.setAttribute('class', 'mark-pin');
        g.style.setProperty('--c', css(pin.color));
        const c = document.createElementNS(SVG, 'path');
        c.setAttribute('d', 'M0 0l-6 -12a7 7 0 1 1 12 0z');
        const label = document.createElementNS(SVG, 'text');
        label.setAttribute('x', '10');
        label.setAttribute('y', '-10');
        g.append(c, label);
        return g;
      });
      // As text, never markup: a note is someone else's words.
      const text = pin.text + (pin.author ? ` — ${pin.author}` : '');
      const label = g.lastChild as SVGTextElement;
      if (label.textContent !== text) label.textContent = text;
      const s = engine.project(pin.at.x, pin.at.y, pin.at.z);
      if (s) g.setAttribute('transform', `translate(${s.x.toFixed(1)} ${s.y.toFixed(1)})`);
      (g as SVGGElement).style.display = s ? '' : 'none';
    }
    for (const [id, e] of pool) {
      if (!seen.has(id)) {
        e.remove();
        pool.delete(id);
      }
    }
  }, visible && (count > 0 || tool !== 'off'));

  const myName = () => useSessionStore.getState().name || '';
  const at = (e: React.PointerEvent) => {
    const r = engine.canvas.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };
  const mayErase = (key: string) => state !== 'joined' || isMine(key) || rankOf(role) >= rankOf('elevated');
  const nearest = (x: number, y: number): string | null => {
    const doc = useMarks.getState().doc;
    let best: string | null = null;
    let bestD = 14;
    for (const p of doc.pins) {
      const s = engine.project(p.at.x, p.at.y, p.at.z);
      if (s && Math.hypot(s.x - x, s.y - 6 - y) < bestD && mayErase(p.key)) {
        bestD = Math.hypot(s.x - x, s.y - 6 - y);
        best = p.id;
      }
    }
    for (const st of doc.strokes) {
      if (!mayErase(st.key)) continue;
      for (const q of st.points) {
        const s = engine.project(q.x, q.y, q.z);
        if (s && Math.hypot(s.x - x, s.y - y) < bestD) {
          bestD = Math.hypot(s.x - x, s.y - y);
          best = st.id;
        }
      }
    }
    return best;
  };

  return (
    <>
      {visible && <svg ref={svg} className="session-marks" aria-hidden="true" />}
      {tool !== 'off' && (
        <div
          className={`session-mark-capture ${tool}`}
          onPointerDown={(e) => {
            if (e.button !== 0) return;
            const p = at(e);
            if (tool === 'erase') {
              const id = nearest(p.x, p.y);
              if (id) useMarks.getState().remove(id);
              return;
            }
            const w = pointUnder(engine, p.x, p.y);
            if (!w) return;
            if (tool === 'pin') {
              setAsk({ x: p.x, y: p.y, at: w });
              setText('');
              return;
            }
            (e.target as HTMLElement).setPointerCapture(e.pointerId);
            draft.current = [w];
          }}
          onPointerMove={(e) => {
            if (!draft.current) return;
            const p = at(e);
            const w = pointUnder(engine, p.x, p.y);
            if (w) draft.current = [...draft.current, w];
          }}
          onPointerUp={() => {
            if (!draft.current) return;
            useMarks.getState().addStroke(draft.current, myName(), browserKey());
            draft.current = null;
          }}
        />
      )}
      {ask && (
        <form
          className="session-pin-ask"
          style={{ left: ask.x, top: ask.y }}
          onSubmit={(e) => {
            e.preventDefault();
            useMarks.getState().addPin(ask.at, text, myName(), browserKey());
            setAsk(null);
          }}
        >
          <input autoFocus value={text} maxLength={200} placeholder={t('session.marks.pinText')} aria-label={t('session.marks.pinText')} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => e.key === 'Escape' && setAsk(null)} />
          <button type="submit" className="primary small">
            {t('session.marks.setPin')}
          </button>
        </form>
      )}
    </>
  );
}

function LookCard({ r, engine }: { r: LookRequest; engine: Engine }) {
  const drop = () => useSessionStore.setState((s) => ({ looks: s.looks.filter((x) => x.id !== r.id) }));
  useEffect(() => {
    const id = window.setTimeout(drop, 30_000);
    return () => window.clearTimeout(id);
  });
  return (
    <div className="session-look" role="alert">
      <div className="session-look-who" style={{ color: memberColor(r.from) }}>
        {r.follow ? t('session.look.asksFollow', { name: r.fromName }) : t('session.look.asks', { name: r.fromName })}
      </div>
      {r.note && <div className="session-look-note">{r.note}</div>}
      <div className="session-actions">
        <button
          type="button"
          className="primary small"
          onClick={() => {
            applyPose(engine, r.pose);
            if (r.follow) session.followMember(r.from, 'peer');
            drop();
          }}
        >
          {r.follow ? t('session.look.acceptFollow') : t('session.look.accept')}
        </button>
        <button type="button" className="small" onClick={drop}>
          {r.follow ? t('session.look.decline') : t('session.look.dismiss')}
        </button>
      </div>
    </div>
  );
}

const nameOf = (id: number) => useSessionStore.getState().members.find((m) => m.id === id)?.name ?? '?';

/** What changed, in words: "the heat settings and the filters". */
function whatChanged(keys: string[]): string {
  const words = [...new Set(keys.map((k) => SLICE_WORDS[k] ?? 'other'))];
  return list(words.map((w) => t(`session.sync.what.${w}`)));
}

/** The session's "follow me" (from the host or an admin): followed only when this viewer says yes. */
function FollowAskCard() {
  const leader = useSessionStore((s) => s.followAsk);
  useSessionStore((s) => s.members);
  if (leader === null) return null;
  return (
    <div className="session-look" role="alert">
      <div className="session-look-who" style={{ color: memberColor(leader) }}>
        {t('session.look.asksFollow', { name: nameOf(leader) })}
      </div>
      <div className="session-hint">{t('session.followBar.hint')}</div>
      <div className="session-actions">
        <button type="button" className="primary small" onClick={() => session.answerFollow(true)}>
          {t('session.look.acceptFollow')}
        </button>
        <button type="button" className="small" onClick={() => session.answerFollow(false)}>
          {t('session.look.decline')}
        </button>
      </div>
    </div>
  );
}

/** The host changed the view: take it too, not this time, or never. */
function SyncPendingCard() {
  const p = useSessionStore((s) => s.syncPending);
  if (!p) return null;
  return (
    <div className="session-look session-sync-card" role="alert">
      <div className="session-look-who" style={{ color: memberColor(p.from) }}>
        {t('session.sync.hostChanged', { name: nameOf(p.from), what: whatChanged(p.keys) })}
      </div>
      <div className="session-actions">
        <button type="button" className="primary small" onClick={() => session.answerSync('take')}>
          {t('session.sync.applyToo')}
        </button>
        <button type="button" className="small" onClick={() => session.answerSync('ignore')}>
          {t('session.sync.ignore')}
        </button>
        <button type="button" className="small" onClick={() => session.answerSync('never')}>
          {t('session.sync.ignoreAll')}
        </button>
      </div>
    </div>
  );
}

/** "Switch to my view" from someone. */
function SyncAskCards() {
  const asks = useSessionStore((s) => s.syncAsks);
  useEffect(() => {
    if (!asks.length) return;
    const id = window.setTimeout(() => {
      const cut = Date.now() - 60_000;
      const st = useSessionStore.getState();
      st.patch({ syncAsks: st.syncAsks.filter((a) => a.at > cut) });
    }, 61_000);
    return () => window.clearTimeout(id);
  }, [asks]);
  return (
    <>
      {asks.map((a) => (
        <div key={a.id} className="session-look session-sync-card" role="alert">
          <div className="session-look-who" style={{ color: memberColor(a.from) }}>
            {t('session.sync.asks', { name: a.fromName })}
          </div>
          <div className="session-actions">
            <button type="button" className="primary small" onClick={() => session.answerAsk(a.id, true)}>
              {t('session.sync.switch')}
            </button>
            <button type="button" className="small" onClick={() => session.answerAsk(a.id, false)}>
              {t('session.look.decline')}
            </button>
          </div>
        </div>
      ))}
    </>
  );
}

/** A change from someone went in: who, what, and a way back, for a few seconds. */
function SyncAppliedNote() {
  const a = useSessionStore((s) => s.syncApplied);
  const back = useSessionStore((s) => s.syncBack);
  const [, tick] = useState(0);
  useEffect(() => {
    if (!a) return;
    const id = window.setTimeout(() => tick((n) => n + 1), 6100);
    return () => window.clearTimeout(id);
  }, [a]);
  if (!a || Date.now() - a.at > 6000) return null;
  return (
    <div className="session-look session-sync-note" role="status">
      <div>{t('session.sync.changed', { name: nameOf(a.from), what: whatChanged(a.keys) })}</div>
      {back && (
        <div className="session-actions">
          <button type="button" className="small" onClick={() => session.syncBack()}>
            {t('session.sync.back')}
          </button>
        </div>
      )}
    </div>
  );
}

/** Looking through a member's eyes: whose, their data, and the way back. */
function PeekBar() {
  const peek = useSessionStore((s) => s.peek);
  const data = useSessionStore((s) => s.peekData);
  useSessionStore((s) => s.members);
  if (peek === null) return null;
  const mine = useStore.getState().dataset?.name ?? '';
  return (
    <div className="session-follow-bar session-peek-bar" role="status" style={{ borderColor: memberColor(peek) }}>
      <Icon name="eye" size={16} />
      <span>
        {t('session.peek.seeing', { name: nameOf(peek) })}
        {data && data !== mine ? ` ${t('session.peek.otherData', { data })}` : ''}
      </span>
      <button type="button" className="primary small" onClick={() => session.endPeek()}>
        {t('session.peek.back')}
      </button>
    </div>
  );
}

/**
 * Follows the leader's camera while this viewer said yes to it: their place,
 * smoothly, and their look until this viewer turns the camera itself - from
 * then on it looks around freely from where they are, until it asks for
 * their look again. Stop (or the X) ends it at once.
 */
function FollowDriver({ engine }: { engine: Engine }) {
  useLang();
  const leader = useSessionStore((s) => (s.state === 'joined' ? s.followPeer : null));
  const peek = useSessionStore((s) => s.peek);
  useSessionStore((s) => s.members);
  const lastT = useRef(0);
  const own = useRef(false);
  const lastSet = useRef<V3 | null>(null);
  const [freeLook, setFreeLook] = useState(false);
  useEffect(() => {
    own.current = false;
    lastSet.current = null;
    setFreeLook(false);
  }, [leader]);
  useAnimationFrame(() => {
    const id = useSessionStore.getState().followPeer;
    const p = id !== null ? presence.get(id) : undefined;
    const now = performance.now();
    const dt = lastT.current ? Math.min(1000, now - lastT.current) : 16;
    lastT.current = now;
    if (!p) return;
    // The camera turned since the last frame, and not by this: the viewer looks around.
    const f = engine.cameraPose().forward;
    const was = lastSet.current;
    if (was && !own.current && Math.hypot(f.x - was.x, f.y - was.y, f.z - was.z) > 2e-3) {
      own.current = true;
      setFreeLook(true);
    }
    // Smoothed by time, not by frames: a slow frame catches up as far as a fast one would have.
    const k = 1 - Math.exp(-dt / 70);
    if (own.current) {
      const c = engine.cameraPose().position;
      const q = p.pose.position;
      engine.setCameraPose({ x: c.x + (q.x - c.x) * k, y: c.y + (q.y - c.y) * k, z: c.z + (q.z - c.z) * k }, null);
    } else applyPose(engine, p.pose, k);
    lastSet.current = engine.cameraPose().forward;
  }, leader !== null);
  if (leader === null || peek !== null) return null;
  const stop = () => session.followMember(null);
  return (
    <div className="session-follow-bar" role="status">
      <span>{t('session.followBar.following', { name: nameOf(leader) })}</span>
      {freeLook ? (
        <button
          type="button"
          className="small"
          onClick={() => {
            own.current = false;
            lastSet.current = null;
            setFreeLook(false);
          }}
        >
          {t('session.followBar.theirLook')}
        </button>
      ) : (
        <span className="session-hint">{t('session.followBar.lookAround')}</span>
      )}
      <button type="button" className="small" onClick={stop}>
        {t('session.stopFollow')}
      </button>
      <button type="button" className="ghost icon-btn" aria-label={t('session.stopFollow')} title={t('session.stopFollow')} onClick={stop}>
        <Icon name="close" size={14} />
      </button>
    </div>
  );
}


/** Says what the session said: refusals, notices. */
function Notices() {
  const notice = useSessionStore((s) => s.notice);
  useEffect(() => {
    if (!notice) return;
    toast(t(`session.notice.${notice}`), notice === 'stateReplaced' || notice === 'youChanged' ? 'info' : 'bad', 3500);
    useSessionStore.getState().patch({ notice: null });
  }, [notice]);
  return null;
}

export function SessionLayer() {
  useLang();
  const engine = useEngine();
  const looks = useSessionStore((s) => s.looks);
  const state = useSessionStore((s) => s.state);
  const role = useSessionStore((s) => s.role);
  // Video mode by itself when this device cannot draw the session's data (Stage 8).
  useVideoAuto(engine);

  useEffect(() => {
    registerBuiltInDocs();
    // The host's room (its map, catalogue, packs, data): members follow it.
    registerRoomDoc();
    // For the multi-client smoke test (tools/smoke-session.mjs) and the console.
    const hook = (window as unknown as { __heat3dSession?: Record<string, unknown> }).__heat3dSession;
    if (hook) Object.assign(hook, { marks: useMarks, plan: usePlanStore, eraseMine, eraseAll, isMine, browserKey });
    const i = urlIntent();
    if (i.host) {
      let name = 'Host';
      try {
        name = localStorage.getItem('heat3d.session.name') || 'Host';
      } catch {
        /* the default */
      }
      session.join({ url: i.server || undefined, name, hostToken: i.host });
    }
    if (i.join || i.invite) useSessionStore.getState().setPanel(true);
  }, []);

  useEffect(() => {
    session.setEngine(engine);
    if (!engine) return;
    const canvas = engine.canvas;
    const move = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      session.setPointer({ x: e.clientX - r.left, y: e.clientY - r.top });
    };
    const leave = () => session.setPointer(null);
    canvas.addEventListener('pointermove', move);
    canvas.addEventListener('pointerleave', leave);
    return () => {
      canvas.removeEventListener('pointermove', move);
      canvas.removeEventListener('pointerleave', leave);
    };
  }, [engine]);

  // Opening a session file and taking up the autosave, from anywhere (the start screen, the data panel, the palette):
  // the report shows in the data panel and in this panel, the server part is not needed for it.
  useEffect(() => {
    const onOpen = () => chooseSessionFile(engine);
    const onRestore = () => {
      const st = useSessionStore.getState();
      const auto = st.state !== 'joined' ? readAutosave() : null;
      if (auto) void restoreSession(engine, auto, []);
    };
    window.addEventListener('heat3d:open-session', onOpen);
    window.addEventListener('heat3d:restore-session', onRestore);
    return () => {
      window.removeEventListener('heat3d:open-session', onOpen);
      window.removeEventListener('heat3d:restore-session', onRestore);
    };
  }, [engine]);

  // The host keeps a copy in this browser every two minutes.
  useEffect(() => {
    if (state !== 'joined' || role !== 'host') return;
    const id = window.setInterval(() => autosave(engine), 120_000);
    return () => window.clearInterval(id);
  }, [state, role, engine]);

  if (!engine) return null;
  return (
    <>
      <MarksOverlay engine={engine} />
      <PresenceOverlay engine={engine} />
      <FollowDriver engine={engine} />
      <PeekBar />
      <div className="session-looks">
        <FollowAskCard />
        <SyncPendingCard />
        <SyncAskCards />
        <SyncAppliedNote />
        {looks.map((r) => (
          <LookCard key={r.id} r={r} engine={engine} />
        ))}
      </div>
      <SessionPanel />
      <RoomPrompts />
      <Notices />
    </>
  );
}
