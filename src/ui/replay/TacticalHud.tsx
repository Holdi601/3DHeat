import { useEffect, useMemo, useRef, useState, type MouseEvent } from 'react';
import { useStore } from '../../state/store';
import { useReplayStore } from '../../state/replayStore';
import { useAnimationFrame, useEngine } from '../EngineContext';
import { flightSeries, PARAM_BY_ID, valueAt } from '../../data/flight';
import { MotionModel, emptySample } from '../../figures/motion';
import { formatValue } from './fields';
import { unitsOf } from './units';
import { unitCategory } from './objectType';
import { defaultEventKinds, eventRows, unitsPerMetre } from './replayData';
import { eventWords } from './EventList';
import { classifyEvent, isCut, nextShot, type DirectorEvent, type Shot } from './director';
import { unitPrefs } from '../../state/unitsStore';
import { int, t } from '../../i18n';
import type { Dataset } from '../../state/types';
import type { Engine } from '../../render/engine';
import './tacticalHud.css';

/** A recorded event as the display lists it. */
interface HudEvent extends DirectorEvent {
  label: string;
}

/** The recording's events in time order, the noisy kinds (each shell, each puff) left out. */
function hudEvents(d: Dataset): HudEvent[] {
  const ev = eventRows(d);
  if (!ev) return [];
  const keep = new Set(defaultEventKinds(ev.labels));
  const out: HudEvent[] = [];
  for (let i = 0; i < ev.rows.length; i++) {
    const label = ev.labels[i];
    if (!keep.has(label)) continue;
    out.push({
      time: d.time ? d.time[ev.rows[i]] : 0,
      person: ev.persons[i],
      kind: classifyEvent(label),
      label,
    });
  }
  // A recording that writes a kill row also writes the victim's death row(s) for it; count the kill once.
  // Only recordings with nothing but death rows (a shooter-less death list) keep those as kills.
  const victimSide = /death|died|dead/i;
  if (out.some((e) => e.kind === 'kill' && !victimSide.test(e.label))) {
    for (const e of out) if (e.kind === 'kill' && victimSide.test(e.label)) e.kind = 'other';
  }
  return out.sort((a, b) => a.time - b.time);
}

/** Events at or before `t`: how many. */
function countUpTo(list: HudEvent[], t: number): number {
  let lo = 0;
  let hi = list.length;
  while (lo < hi) {
    const m = (lo + hi) >> 1;
    if (list[m].time <= t) lo = m + 1;
    else hi = m;
  }
  return lo;
}

/** The display face, from Google Fonts (SIL Open Font License); the system monospace until it loads, or without a network. */
function ensureFont(): void {
  if (document.getElementById('tac-font')) return;
  const l = document.createElement('link');
  l.id = 'tac-font';
  l.rel = 'stylesheet';
  l.href = 'https://fonts.googleapis.com/css2?family=Share+Tech+Mono&display=swap';
  document.head.appendChild(l);
}

const clock = (s: number) => {
  const a = Math.max(0, s);
  const m = Math.floor(a / 60);
  return `${String(m).padStart(2, '0')}:${(a - m * 60).toFixed(1).padStart(4, '0')}`;
};

const TELEMETRY = ['tas', 'alt', 'g', 'heading', 'vs', 'mach'] as const;
const sample = emptySample();

/** The director's camera for one frame: follow modes for chase, orbit and overview; a still camera for the flyby. */
function film(engine: Engine, d: Dataset, shot: Shot, fly: { shot: Shot | null; from: { x: number; y: number; z: number } }, dt: number, air: boolean): void {
  const r = useReplayStore.getState();
  const c = engine.camera;
  const tr = engine.liveTracks.find((x) => x.person === shot.person);
  if (!tr) return;
  const k = Math.min(1, dt * 1.4);
  if (shot.kind === 'flyby') {
    if (r.follow !== null) useReplayStore.setState({ follow: null, followUnit: null });
    if (fly.shot !== shot) {
      // Ahead of the unit and off to its side, a little above: it comes at the camera and sweeps past.
      const m = MotionModel.of(d);
      const ok = m && m.at(shot.person, engine.live.playhead, useStore.getState().team.session, sample);
      let vx = ok ? sample.vx : -Math.sin(tr.yaw);
      let vz = ok ? sample.vz : Math.cos(tr.yaw);
      const vy = ok ? sample.vy : 0;
      const sp = Math.hypot(vx, vy, vz);
      const upm = unitsPerMetre(d);
      const ahead = Math.max(sp * 3, 40 * upm);
      const h = Math.hypot(vx, vz) || 1;
      vx /= h;
      vz /= h;
      const side = (air ? 60 : 18) * upm;
      fly.from = {
        x: tr.x + vx * ahead - vz * side,
        y: tr.y + (air ? 12 : 4) * upm + (vy / (sp || 1)) * ahead,
        z: tr.z + vz * ahead + vx * side,
      };
      fly.shot = shot;
    }
    engine.placeCamera(fly.from, tr);
    return;
  }
  const mode = shot.kind === 'chase' ? 'chase' : 'orbit';
  if (r.follow !== shot.person || r.followMode !== mode) {
    const index = unitsOf(d);
    useReplayStore.setState({
      follow: shot.person,
      followUnit: index.units[index.personUnit[shot.person]]?.key ?? null,
      followMode: mode,
    });
  }
  const want = shot.kind === 'chase' ? (air ? 45 : 18) : shot.kind === 'orbit' ? (air ? 110 : 40) : air ? 1500 : 350;
  const pitch = shot.kind === 'chase' ? -0.12 : shot.kind === 'orbit' ? -0.32 : -0.7;
  r.setFollowDistance(r.followDistance + (want - r.followDistance) * k);
  c.pitch += (pitch - c.pitch) * k;
  c.yaw += (shot.kind === 'orbit' ? 0.32 : shot.kind === 'overview' ? 0.07 : Math.sin(performance.now() / 2500) * 0.04) * dt;
  c.moved = true;
}

/**
 * The tactical display's screen furniture over the 3D view: the watched
 * unit's telemetry (counters that tick to their values, a G bar, an altitude
 * trace), the kill feed, an event ticker, a scrubber with the events marked,
 * the clock - and the director, which picks the shots from the events.
 */
export function TacticalHud() {
  const engine = useEngine();
  const dataset = useStore((s) => s.dataset);
  const mode = useStore((s) => s.mode);
  const look = useReplayStore((s) => s.look);
  const follow = useReplayStore((s) => s.follow);
  const on = !!engine && !!dataset && mode === 'team' && look.on;
  const events = useMemo(() => (dataset ? hudEvents(dataset) : []), [dataset]);
  const [upTo, setUpTo] = useState(0);
  const [shot, setShot] = useState<Shot | null>(null);
  const shotRef = useRef<Shot | null>(null);
  const fly = useRef<{
    shot: Shot | null;
    from: { x: number; y: number; z: number };
  }>({ shot: null, from: { x: 0, y: 0, z: 0 } });
  const timing = useRef({ last: performance.now(), eval: 0 });
  const shown = useRef<Record<string, number>>({});
  const values = useRef<Record<string, HTMLSpanElement | null>>({});
  const gBar = useRef<HTMLDivElement>(null);
  const spark = useRef<HTMLCanvasElement>(null);
  const head = useRef<HTMLDivElement>(null);
  const clockEl = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (on) ensureFont();
  }, [on]);
  // The director let go: the camera is the viewer's again, where it was left.
  useEffect(() => {
    if (!look.director) {
      shotRef.current = null;
      setShot(null);
    }
  }, [look.director]);

  // Whether a person flies, worked out the first time the director asks: for every unit at once it held the frame a load ends in.
  const air = useMemo(() => {
    let known: Int8Array | null = null;
    return (p: number): boolean => {
      if (!dataset) return false;
      const index = unitsOf(dataset);
      known ??= new Int8Array(index.personUnit.length).fill(-1);
      if (known[p] < 0) {
        const u = index.units[index.personUnit[p]];
        known[p] = u && unitCategory(dataset, u) === 'air' ? 1 : 0;
      }
      return known[p] === 1;
    };
  }, [dataset]);

  const marks = useMemo(() => {
    if (!dataset) return [];
    const [t0, t1] = dataset.timeRange;
    const span = Math.max(1e-6, t1 - t0);
    return events
      .filter((e) => e.kind !== 'other')
      .slice(0, 600)
      .map((e) => ({
        at: ((e.time - t0) / span) * 100,
        kind: e.kind,
        time: e.time,
      }));
  }, [dataset, events]);

  const subject = shot?.person ?? follow;

  useAnimationFrame(() => {
    if (!engine || !dataset) return;
    const wall = performance.now();
    const dt = Math.min(0.1, (wall - timing.current.last) / 1000);
    timing.current.last = wall;
    const now = engine.live.playhead;
    const look = useReplayStore.getState().look;

    if (look.director) {
      if (wall - timing.current.eval > 250 || !shotRef.current) {
        timing.current.eval = wall;
        const m = MotionModel.of(dataset);
        const session = useStore.getState().team.session;
        const units = engine.liveTracks.map((x) => {
          const flies = air(x.person);
          const ok = m && flies && m.at(x.person, now, session, sample);
          return {
            person: x.person,
            air: flies,
            speed: ok ? Math.hypot(sample.vx, sample.vy, sample.vz) : NaN,
          };
        });
        const next = nextShot(now, shotRef.current, events, units);
        if (isCut(shotRef.current, next)) {
          engine.lookCutAt = wall;
          setShot(next);
        }
        shotRef.current = next;
      }
      if (shotRef.current) film(engine, dataset, shotRef.current, fly.current, dt, air(shotRef.current.person));
    }

    const n = countUpTo(events, now);
    if (n !== upTo) setUpTo(n);
    if (clockEl.current) clockEl.current.textContent = `T+${clock(now - dataset.timeRange[0])}`;
    if (head.current) {
      const [t0, t1] = dataset.timeRange;
      head.current.style.left = `${(Math.max(0, Math.min(1, (now - t0) / Math.max(1e-6, t1 - t0))) * 100).toFixed(3)}%`;
    }

    // Telemetry, each counter easing to its value so the digits run.
    const who = shotRef.current?.person ?? useReplayStore.getState().follow;
    const series = who !== null ? flightSeries(dataset, who, useStore.getState().team.session) : null;
    const prefs = unitPrefs();
    for (const id of TELEMETRY) {
      const el = values.current[id];
      if (!el) continue;
      const v = series ? valueAt(series, id, now) : NaN;
      if (!Number.isFinite(v)) {
        el.textContent = '---';
        delete shown.current[id];
        continue;
      }
      const prev = shown.current[id];
      // Headings wrap: ease along the short way round.
      let next = prev === undefined ? v : prev + (id === 'heading' ? ((((v - prev) % 360) + 540) % 360) - 180 : v - prev) * Math.min(1, dt * 8);
      if (id === 'heading') next = ((next % 360) + 360) % 360;
      shown.current[id] = next;
      el.textContent = id === 'g' || id === 'mach' ? next.toFixed(id === 'g' ? 1 : 2) : formatValue(PARAM_BY_ID[id].kind, next, prefs);
    }
    if (gBar.current) {
      const g = shown.current.g;
      gBar.current.style.width = `${g === undefined ? 0 : Math.max(0, Math.min(100, ((g + 2) / 11) * 100))}%`;
      gBar.current.dataset.hot = g !== undefined && g > 6 ? '1' : '0';
    }
    const cv = spark.current;
    if (cv) {
      const g = cv.getContext('2d');
      if (g) {
        const w = cv.width;
        const h = cv.height;
        g.clearRect(0, 0, w, h);
        if (series) {
          const N = 60;
          const ys: number[] = [];
          for (let i = 0; i < N; i++) ys.push(valueAt(series, 'alt', now - 60 + (i * 60) / (N - 1)));
          const ok = ys.filter(Number.isFinite);
          if (ok.length > 1) {
            const lo = Math.min(...ok);
            const hi = Math.max(...ok, lo + 1);
            const col = getComputedStyle(cv).color;
            g.strokeStyle = col;
            g.lineWidth = 1.5;
            g.beginPath();
            ys.forEach((y, i) => {
              if (!Number.isFinite(y)) return;
              const px = (i / (N - 1)) * w;
              const py = h - 2 - ((y - lo) / (hi - lo)) * (h - 4);
              if (i === 0) g.moveTo(px, py);
              else g.lineTo(px, py);
            });
            g.stroke();
          }
        }
      }
    }
  }, on);

  if (!on || !dataset || !engine) return null;
  const index = unitsOf(dataset);
  const unitName = (p: number) => index.units[index.personUnit[p]]?.name ?? `#${p}`;
  const sub = subject !== null ? index.units[index.personUnit[subject]] : undefined;
  const kills: number[] = [];
  for (let i = upTo - 1; i >= 0 && kills.length < 5; i--) if (events[i].kind === 'kill') kills.push(i);
  const ticker: number[] = [];
  for (let i = upTo - 1; i >= 0 && ticker.length < 7; i--) ticker.push(i);
  const t0 = dataset.timeRange[0];
  const seek = (e: MouseEvent<HTMLDivElement>) => {
    const b = e.currentTarget.getBoundingClientRect();
    const f = Math.max(0, Math.min(1, (e.clientX - b.left) / Math.max(1, b.width)));
    useStore.getState().seek(dataset.timeRange[0] + f * (dataset.timeRange[1] - dataset.timeRange[0]));
  };

  return (
    <div className={`tac-hud tac-${look.colour}`}>
      {shot && <div key={`${shot.person}:${shot.kind}:${shot.start}`} className="tac-cut" />}
      <div className="tac-top">
        <span className="tac-title">{t('replay.look.hudTitle')}</span>
        <span ref={clockEl} className="tac-clock" />
        {look.director && shot && (
          <span className="tac-shot" key={`${shot.person}:${shot.kind}`}>
            {t('replay.look.director')} · {t(`replay.look.shot.${shot.kind}`)} · {unitName(shot.person)}
          </span>
        )}
      </div>
      {look.panels && (
        <>
          <div className="tac-panel tac-telemetry">
            <div className="tac-head">
              <span>{t('replay.look.track')}</span>
              <span className="tac-dim">{sub ? sub.vehicle : ''}</span>
            </div>
            <div className="tac-name">{sub ? sub.name : t('replay.look.noTrack')}</div>
            <div className="tac-grid">
              {TELEMETRY.map((id) => (
                <div key={id} className="tac-cell">
                  <span className="tac-key">{t(`replay.look.tm.${id}`)}</span>
                  <span
                    className="tac-val"
                    ref={(el) => {
                      values.current[id] = el;
                    }}
                  >
                    ---
                  </span>
                </div>
              ))}
            </div>
            <div className="tac-gbar">
              <div ref={gBar} />
              <span className="tac-tick" style={{ left: `${(3 / 11) * 100}%` }} />
              <span className="tac-tick" style={{ left: `${(8 / 11) * 100}%` }} />
            </div>
            <div className="tac-key">{t('replay.look.altTrace')}</div>
            <canvas ref={spark} className="tac-spark" width={220} height={44} />
          </div>
          <div className="tac-right">
            <div className="tac-panel tac-feed">
              <div className="tac-head">
                <span>{t('replay.look.killFeed')}</span>
                <span className="tac-dim">{int(events.slice(0, upTo).filter((e) => e.kind === 'kill').length)}</span>
              </div>
              {kills.length === 0 && <div className="tac-dim">{t('replay.look.none')}</div>}
              {kills.map((i) => (
                <div key={i} className="tac-row tac-kill">
                  <span className="tac-time">{clock(events[i].time - t0)}</span>
                  <span>{unitName(events[i].person)}</span>
                  <span className="tac-dim">{eventWords(events[i].label)}</span>
                </div>
              ))}
            </div>
            <div className="tac-panel tac-ticker">
              <div className="tac-head">
                <span>{t('replay.look.events')}</span>
              </div>
              {ticker.map((i, k) => (
                <div key={i} className={`tac-row tac-${events[i].kind}`} style={{ opacity: 1 - k * 0.11 }}>
                  <span className="tac-time">{clock(events[i].time - t0)}</span>
                  <span>{eventWords(events[i].label)}</span>
                  <span className="tac-dim">{unitName(events[i].person)}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="tac-scrub" onClick={seek} title={t('replay.look.scrubTitle')}>
            {marks.map((m, i) => (
              <span key={i} className={`tac-mark tac-${m.kind}`} style={{ left: `${m.at}%` }} />
            ))}
            <div ref={head} className="tac-head-mark" />
          </div>
        </>
      )}
      <div className="tac-corner tac-tl" />
      <div className="tac-corner tac-tr" />
      <div className="tac-corner tac-bl" />
      <div className="tac-corner tac-br" />
    </div>
  );
}
