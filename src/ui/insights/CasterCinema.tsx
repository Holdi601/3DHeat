/**
 * The caster on screen: the camera moved to each moment without a cut, the
 * units in it ringed, named and lit while the rest of the view dims, a short
 * caption next to the one acting, and the subtitle with the moment's line.
 *
 * Each frame the camera's target is a shot of the kill playing now (one of
 * the moment's beats): the shooter and the one shot from the side, or from
 * behind the shooter when they are far apart, or one unit circled
 * (insights/cast/cinema.ts `shotFor`). The camera follows the target on
 * springs, rising over the ground on a long move, and the field of view
 * eases to the shot's. While it travels to a new moment the replay waits;
 * once it is there the replay plays the lead-in and the moment. When anything
 * else moves the camera - the viewer flying, a unit followed - the caster
 * lets go and offers to resume, as the tactical display's director does.
 */

import { useEffect, useRef, useState } from 'react';
import { int, t, useLang } from '../../i18n';
import { CameraSpring, azimuthTo, craneLift, easeFov, ORBIT_DEG_S, pixelsAcross, poseMoved, shotFor, smoothFor, type Pose, type Shot, type Subject } from '../../insights/cast/cinema';
import type { Beat, Moment } from '../../insights/cast/moments';
import { trackAt } from '../../insights/cast/source';
import { useReplayStore } from '../../state/replayStore';
import { useStore } from '../../state/store';
import { useAnimationFrame, useEngine } from '../EngineContext';
import { clock } from '../replay/hooks';
import { unitsPerMetre } from '../replay/replayData';
import { momentLine } from './Caster';
import { castTracks, holdCinema, resumeCinema, setCinemaFov, stopCinema, useCinema } from './cinemaStore';
import './insights.css';

/** Seconds the camera stays on a kill after it, before it moves on to the next. */
const BEAT_HOLD = 1.5;
/** Seconds before a kill the line from the shooter to the one shot shows. */
const AIM_BEFORE = 4;
/** Longest the replay waits for the camera to arrive, seconds. */
const GLIDE_MAX = 4;
/** How dark the rest of the view goes. */
const DIM = 0.55;
/** Vehicle classes in the air: drawn bigger, framed from further. */
const AIR = new Set(['fighter', 'attack', 'bomber', 'otherAir', 'helicopter']);
/** Length of a unit, metres: an aircraft, anything else. */
const SIZE_AIR = 16;
const SIZE_GROUND = 8;

/** The kill being shown at `now`: the next one to come, or the one just done, or the last. */
export function beatAt(beats: Beat[], now: number): number {
  for (let i = 0; i < beats.length; i++) if (beats[i].time >= now - BEAT_HOLD) return i;
  return beats.length - 1;
}

/** Who the camera frames for a beat: the one acting and the one acted on (players), with their classes. */
function castOf(m: Moment, b: Beat | null): { player: number; cls: string }[] {
  const out = b ? [{ player: b.killer, cls: b.killerClass }, { player: b.victim, cls: b.victimClass }] : [{ player: m.actor, cls: '' }, { player: m.other, cls: '' }];
  return out.filter((x) => x.player >= 0);
}

/** The caption next to the one acting: a few plain words for what happens. */
export function captionOf(m: Moment, bi: number): string {
  const p = m.params;
  const n = m.beats?.length ?? 0;
  switch (m.kind) {
    case 'firstBlood':
      return p.round ? t('caster.cap.firstBloodRound', { round: int(Number(p.round)) }) : t('caster.cap.firstBlood');
    case 'multiKill':
      return t('caster.cap.multiKill', { i: int(Math.max(1, bi + 1)), n: int(Number(p.n ?? n)) });
    case 'trade':
      return bi <= 0 ? t('caster.cap.tradeFirst') : t('caster.cap.tradeBack', { secs: `${p.secs} s` });
    case 'clutch':
      return t('caster.cap.clutch', { against: int(Number(p.against)) });
    case 'swing':
      return t('caster.cap.swing');
    case 'objective':
      return t('caster.cap.objective');
    case 'comeback':
      return t('caster.cap.comeback');
    case 'standout':
      return t('caster.cap.standout', { kills: int(Number(p.kills)) });
    case 'struggle':
      return t('caster.cap.struggle', { deaths: int(Number(p.deaths)) });
    case 'longRange':
      return t('caster.cap.longRange', { distance: `${int(Number(p.distance))} m` });
    case 'turning':
      return t('caster.cap.turning', { fromPct: `${p.fromPct}%`, toPct: `${p.toPct}%` });
  }
  return '';
}

interface Phase {
  /** The beat shown, -1 for none. */
  beat: number;
  /** Whole seconds to the beat's kill, 0 once it is done or there is none. */
  count: number;
  /** The one shot is down. */
  down: boolean;
}

export function CasterCinema() {
  useLang();
  const engine = useEngine();
  const moment = useCinema((s) => s.moment);
  const src = useCinema((s) => s.src);
  const held = useCinema((s) => s.held);
  const subtitles = useCinema((s) => s.subtitles);
  const on = useCinema((s) => s.on);
  const mode = useStore((s) => s.mode);
  const dataset = useStore((s) => s.dataset);
  const svg = useRef<SVGSVGElement>(null);
  const tags = useRef<HTMLDivElement>(null);
  const [phase, setPhase] = useState<Phase>({ beat: -1, count: 0, down: false });
  const drive = useRef({
    spring: new CameraSpring(),
    last: null as Pose | null,
    t: 0,
    shot: -1,
    smooth: 0.6,
    since: 0,
    waitPlay: false,
    fov: 0,
    dim: 0,
    phase: phase,
    /** What the camera moved with last frame: the shot's anchor and the tracks it was of. */
    anchor: null as { x: number; y: number; z: number; key: string } | null,
    kind: null as Shot['kind'] | null,
  });
  const active = !!engine && !!moment && !!src && !!dataset && mode === 'team';

  // Off, or out of the replay: stop filming.
  useEffect(() => {
    if ((!on || mode !== 'team') && useCinema.getState().moment) stopCinema();
  }, [on, mode]);

  useAnimationFrame(() => {
    const st = useCinema.getState();
    const m = st.moment;
    const s = st.src;
    if (!engine || !m || !s || !dataset) return;
    const d = drive.current;
    const now = engine.live.playhead;
    const k = unitsPerMetre(dataset);
    const beats = m.beats ?? [];
    const bi = beats.length ? beatAt(beats, now) : -1;
    const b = bi >= 0 ? beats[bi] : null;

    // The subjects: the life each is in at the kill (or now), where the engine draws it.
    const cast = castOf(m, b);
    const tracks: number[] = [];
    const sizes: number[] = [];
    for (const c of cast) {
      const at = trackAt(s, c.player, b ? b.time : now);
      if (!at) continue;
      tracks.push(at.track);
      sizes.push((AIR.has(c.cls) ? SIZE_AIR : SIZE_GROUND) * k);
    }
    castTracks.clear();
    for (const p of tracks) castTracks.add(p);
    const placed = tracks.map((p) => engine.liveTracks.find((tr) => tr.person === p) ?? null);
    const subjects: Subject[] = [];
    placed.forEach((p, i) => p && subjects.push({ x: p.x, y: p.y, z: p.z, size: sizes[i] }));
    if (!subjects.length) subjects.push({ x: m.x, y: m.y, z: m.z, size: SIZE_GROUND * k });

    // What the caption and tags say: React only when it changes, a few times a moment.
    const next: Phase = { beat: bi, count: b && now < b.time ? Math.ceil(b.time - now) : 0, down: !!b && now >= b.time };
    if (next.beat !== d.phase.beat || next.count !== d.phase.count || next.down !== d.phase.down) {
      d.phase = next;
      setPhase(next);
    }

    const canvas = engine.canvas;
    const W = canvas.clientWidth;
    const H = canvas.clientHeight;
    const cur = engine.cameraPose();
    const tNow = performance.now();
    const dt = Math.min(0.1, Math.max(0, (tNow - d.t) / 1000));
    d.t = tNow;

    // Someone else moved the camera since the last frame: let go.
    if (!st.held && (useReplayStore.getState().follow !== null || (d.last && poseMoved(cur, d.last, k)))) {
      d.last = null;
      d.waitPlay = false;
      holdCinema();
    }
    const filming = !useCinema.getState().held;

    if (filming) {
      const centre = { x: 0, y: 0, z: 0 };
      for (const p of subjects) {
        centre.x += p.x / subjects.length;
        centre.y += p.y / subjects.length;
        centre.z += p.z / subjects.length;
      }
      let az = azimuthTo(cur.position, centre, 0);
      // A slow circle round one unit while it plays.
      if (subjects.length === 1 && useStore.getState().timeline.playing) az += ((ORBIT_DEG_S * Math.PI) / 180) * dt;
      const fovNow = useStore.getState().camera.fov;
      const shot = shotFor(subjects, az, { fov: fovNow, aspect: W / Math.max(1, H), heightPx: H }, k, d.kind);
      d.kind = shot.kind;
      const framing = Math.hypot(shot.position.x - shot.look.x, shot.position.y - shot.look.y, shot.position.z - shot.look.z);
      const remaining = Math.hypot(shot.position.x - cur.position.x, shot.position.y - cur.position.y, shot.position.z - cur.position.z);
      if (d.shot !== st.shot || !d.spring.started) {
        // A new moment: from where the camera is; the replay waits until the camera is there.
        d.shot = st.shot;
        d.smooth = smoothFor(remaining, framing);
        d.spring.reset(cur, Math.hypot(centre.x - cur.position.x, centre.y - cur.position.y, centre.z - cur.position.z));
        d.since = tNow;
        d.fov = fovNow;
        d.waitPlay = st.pendingPlay;
        d.anchor = null;
        if (st.pendingPlay) {
          useCinema.setState({ pendingPlay: false });
          if (useStore.getState().timeline.playing) useStore.getState().setPlaying(false);
        }
      }
      const arrived = remaining < Math.max(0.15 * framing, 2 * k);
      const gliding = (tNow - d.since) / 1000;
      if (d.waitPlay && ((arrived && gliding > 0.3) || gliding > GLIDE_MAX)) {
        d.waitPlay = false;
        useStore.getState().setPlaying(true);
      }
      // Following once there: a steady spring, eased in from the move's.
      if (arrived) d.smooth += (0.55 - d.smooth) * Math.min(1, dt * 2);
      const lift = craneLift(remaining, framing);
      const target: Pose = { position: { x: shot.position.x, y: shot.position.y + lift, z: shot.position.z }, forward: { x: 0, y: 0, z: -1 } };
      // Along with the subjects' own move (the shooter's, behind the shooter): no lag behind a fast unit.
      const anchor = shot.kind === 'shoulder' ? subjects[0] : centre;
      // The same anchor as last frame: the same kind of shot of the same units, each placed or not.
      const key = `${shot.kind}|${tracks.join(',')}|${placed.map((p) => (p ? 1 : 0)).join('')}`;
      const a0 = d.anchor;
      if (a0 && a0.key === key && d.spring.started) {
        const dx = anchor.x - a0.x;
        const dy = anchor.y - a0.y;
        const dz = anchor.z - a0.z;
        // Not a seek or a respawn: a move a unit can make in a frame.
        if (Math.hypot(dx, dy, dz) < 400 * k * Math.max(dt, 1 / 30)) d.spring.carry(dx, dy, dz);
      }
      d.anchor = { x: anchor.x, y: anchor.y, z: anchor.z, key };
      const pose = d.spring.step(target, shot.look, dt, d.smooth);
      engine.setCameraPose(pose.position, pose.forward);
      d.fov = easeFov(d.fov || fovNow, shot.fov, dt);
      setCinemaFov(d.fov);
      // What the engine has now, as it rounds it: the next frame compares against this.
      d.last = engine.cameraPose();
    }

    // The rings, the dimmed rest, the line from the shooter, the tags: where the units are drawn.
    d.dim += ((filming && placed.some(Boolean) ? DIM : 0) - d.dim) * Math.min(1, dt * 4);
    const fov = useStore.getState().camera.fov;
    const eye = engine.cameraPose().position;
    const marks = placed.map((p, i) => {
      if (!p) return null;
      const q = engine.project(p.x, p.y, p.z);
      if (!q || q.x < -200 || q.y < -200 || q.x > W + 200 || q.y > H + 200) return null;
      const dist = Math.hypot(p.x - eye.x, p.y - eye.y, p.z - eye.z);
      const r = Math.max(16, Math.min(160, pixelsAcross(sizes[i], dist, fov, H) * 0.6 + 10));
      return { x: q.x, y: q.y, r };
    });
    const el = svg.current;
    if (el) {
      el.setAttribute('viewBox', `0 0 ${W} ${H}`);
      const dimRect = el.querySelector<SVGRectElement>('.cast-dim-rect');
      if (dimRect) dimRect.setAttribute('opacity', d.dim.toFixed(3));
      for (let i = 0; i < 2; i++) {
        const mk = marks[i] ?? null;
        const hole = el.querySelector<SVGCircleElement>(`.cast-hole-${i}`);
        const ring = el.querySelector<SVGCircleElement>(`.cast-ring-${i}`);
        for (const c of [hole, ring]) {
          if (!c) continue;
          if (!mk) {
            c.setAttribute('r', '0');
            continue;
          }
          c.setAttribute('cx', mk.x.toFixed(1));
          c.setAttribute('cy', mk.y.toFixed(1));
          c.setAttribute('r', (c === hole ? mk.r * 1.8 : mk.r).toFixed(1));
        }
      }
      const aim = el.querySelector<SVGLineElement>('.cast-aim');
      const a0 = marks[0];
      const a1 = marks[1];
      if (aim) {
        if (b && a0 && a1 && now >= b.time - AIM_BEFORE && now <= b.time + 0.6) {
          aim.setAttribute('x1', a0.x.toFixed(1));
          aim.setAttribute('y1', a0.y.toFixed(1));
          aim.setAttribute('x2', a1.x.toFixed(1));
          aim.setAttribute('y2', a1.y.toFixed(1));
          aim.style.display = '';
        } else aim.style.display = 'none';
      }
    }
    const host = tags.current;
    if (host) {
      // The caption by the one acting (the one it is about, for a hard match), else by whoever is in view.
      const lead = m.kind === 'struggle' ? 1 : 0;
      const kids = host.children;
      for (let i = 0; i < kids.length; i++) {
        const tag = kids[i] as HTMLElement;
        const role = tag.dataset.role;
        const mk = role === 'cap' ? (marks[lead] ?? marks[1 - lead] ?? null) : (marks[role === 'a' ? 0 : 1] ?? null);
        if (!mk) {
          if (tag.style.display !== 'none') tag.style.display = 'none';
          continue;
        }
        if (tag.style.display === 'none') tag.style.display = '';
        if (role === 'cap') {
          // Beside the ring, on the side with room: the replay's own label of the unit is above it, the subtitle below.
          const w = tag.firstElementChild ? (tag.firstElementChild as HTMLElement).offsetWidth : 200;
          const right = mk.x + mk.r + 14 + w <= W - 8 || mk.x - mk.r - 14 - w < 8;
          const x = right ? Math.min(W - 8 - w, mk.x + mk.r + 14) : Math.max(8, mk.x - mk.r - 14 - w);
          const y = Math.max(60, Math.min(H - 200, mk.y - 24));
          tag.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px)`;
        } else {
          tag.style.transform = `translate(${(mk.x + mk.r * 0.72 + 4).toFixed(1)}px, ${(mk.y + mk.r * 0.5).toFixed(1)}px)`;
        }
      }
    }
  }, active);

  useEffect(() => () => castTracks.clear(), []);
  // A new moment: the line and the tags start over.
  useEffect(() => {
    drive.current.phase = { beat: -1, count: 0, down: false };
    setPhase(drive.current.phase);
  }, [moment]);

  if (!active || !moment || !src || !dataset) return null;
  const beats = moment.beats ?? [];
  const b = phase.beat >= 0 ? (beats[phase.beat] ?? null) : null;
  const cast = castOf(moment, b);
  const nameOf = (pl: number | undefined) => (pl !== undefined && pl >= 0 ? (src.players[pl]?.name ?? '') : '');
  const multi = src.input.rounds.length > 1;
  const start = multi ? src.input.rounds[moment.round].start : src.match.start;
  const chips: string[] = [];
  chips.push(t('analysis.cinema.at', { time: clock(moment.time - start) }));
  if (multi) chips.push(t('analysis.cinema.round', { n: int(moment.round + 1) }));
  if (typeof moment.params.distance === 'number') chips.push(t('analysis.cinema.distance', { m: int(moment.params.distance) }));
  const caption = captionOf(moment, phase.beat);
  return (
    <>
      <svg className="cast-overlay" ref={svg} aria-hidden>
        <defs>
          <radialGradient id="cast-soft">
            <stop offset="0.55" stopColor="#000" />
            <stop offset="1" stopColor="#fff" />
          </radialGradient>
          <mask id="cast-holes" maskUnits="userSpaceOnUse">
            <rect x="-10000" y="-10000" width="20000" height="20000" fill="#fff" />
            <circle className="cast-hole-0" r="0" fill="url(#cast-soft)" />
            <circle className="cast-hole-1" r="0" fill="url(#cast-soft)" />
          </mask>
        </defs>
        <rect className="cast-dim-rect" x="-10000" y="-10000" width="20000" height="20000" fill="#000" opacity="0" mask="url(#cast-holes)" />
        <line className="cast-aim" style={{ display: 'none' }} />
        <circle className="cast-ring-0 actor" r="0" />
        <circle className={`cast-ring-1 other${phase.down ? ' down' : ''}`} r="0" />
      </svg>
      <div className="cast-tags" ref={tags}>
        {cast[0] && (
          <div className="cast-tag actor" data-role="a" style={{ display: 'none' }}>
            {nameOf(cast[0].player)}
          </div>
        )}
        {cast[1] && (
          <div className={`cast-tag other${phase.down ? ' down' : ''}`} data-role="b" style={{ display: 'none' }}>
            {nameOf(cast[1].player)}
            {phase.down && <span className="cast-tag-state">{t('caster.down')}</span>}
          </div>
        )}
        {caption && (
          <div className="cast-caption" data-role="cap" style={{ display: 'none' }}>
            <div className="cast-caption-box">
              <span className="cast-caption-kind">{t(`insights.cast.kind.${moment.kind}`)}</span>
              <span className="cast-caption-line">{caption}</span>
              {phase.count > 0 && <span className="cast-caption-count">{t('caster.soon', { s: int(phase.count) })}</span>}
            </div>
          </div>
        )}
      </div>
      {subtitles && (
        <div className="cast-subtitle" aria-live="polite">
          <div className="cast-sub-kind">
            {t(`insights.cast.kind.${moment.kind}`)}
            {chips.map((c) => (
              <span key={c} className="cast-chip">
                {c}
              </span>
            ))}
          </div>
          <div className="cast-sub-line">{momentLine(moment, src, dataset)}</div>
          <div className="cast-sub-actions">
            {held && (
              <button onClick={resumeCinema} title={t('analysis.cinema.resumeTitle')}>
                {t('analysis.cinema.resume')}
              </button>
            )}
            <button className="link" onClick={stopCinema} title={t('analysis.cinema.closeTitle')}>
              ×
            </button>
          </div>
        </div>
      )}
    </>
  );
}
