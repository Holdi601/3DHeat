/**
 * The caster on screen: the camera moved to each moment without a cut, a
 * subtitle with the moment's line and its numbers, and rings round the
 * player and the other party with their names.
 *
 * Each frame the camera's target frames the subjects where they are now (the
 * engine places their tracks, `castTracks`), circling slowly; the camera
 * follows the target on springs (insights/cast/cinema.ts). When anything else
 * moves the camera - the viewer flying, a unit followed - the caster lets go
 * and offers to resume, as the tactical display's director does.
 */

import { useEffect, useRef } from 'react';
import { int, t, useLang } from '../../i18n';
import { CameraSpring, azimuthTo, framingPose, FRAMING_DEFAULTS, ORBIT_DEG_S, poseMoved, smoothFor, subjectsCentre, type Pose, type Vec3 } from '../../insights/cast/cinema';
import { trackAt } from '../../insights/cast/source';
import { useReplayStore } from '../../state/replayStore';
import { useStore } from '../../state/store';
import { useAnimationFrame, useEngine } from '../EngineContext';
import { clock } from '../replay/hooks';
import { unitsPerMetre } from '../replay/replayData';
import { momentLine } from './Caster';
import { castTracks, holdCinema, resumeCinema, stopCinema, useCinema } from './cinemaStore';
import './insights.css';

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
  const rings = useRef<HTMLDivElement>(null);
  const drive = useRef({ spring: new CameraSpring(), last: null as Pose | null, t: 0, az: 0, smooth: 0.6, shot: -1 });
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
    const now = engine.live.playhead;
    const k = unitsPerMetre(dataset);
    // The subjects: the player and the other party, the life they are in now.
    const persons: number[] = [];
    for (const pl of [m.actor, m.other]) {
      const at = pl >= 0 ? trackAt(s, pl, now) : null;
      if (at) persons.push(at.track);
    }
    castTracks.clear();
    if (!st.held) for (const p of persons) castTracks.add(p);
    const placed = persons.map((p) => engine.liveTracks.find((tr) => tr.person === p)).filter((x): x is NonNullable<typeof x> => !!x);
    const pts: Vec3[] = placed.length ? placed.map((p) => ({ x: p.x, y: p.y, z: p.z })) : [{ x: m.x, y: m.y, z: m.z }];

    // The rings and names, held or not.
    const host = rings.current;
    if (host) {
      const kids = host.children;
      for (let i = 0; i < kids.length; i++) {
        const el = kids[i] as HTMLElement;
        const tr = placed[i];
        const p = tr ? engine.project(tr.x, tr.y, tr.z) : null;
        if (!p) {
          if (el.style.display !== 'none') el.style.display = 'none';
          continue;
        }
        el.style.display = '';
        el.style.transform = `translate(${p.x.toFixed(1)}px, ${p.y.toFixed(1)}px)`;
      }
    }
    if (st.held) return;

    // Someone else moved the camera since the last frame: let go.
    const cur = engine.cameraPose();
    const d = drive.current;
    if (useReplayStore.getState().follow !== null || (d.last && poseMoved(cur, d.last, k))) {
      d.last = null;
      holdCinema();
      return;
    }
    const { centre, spread } = subjectsCentre(pts);
    const framing = { ...FRAMING_DEFAULTS, unitsPerMetre: k };
    const t = performance.now();
    if (d.shot !== st.shot || !d.spring.started) {
      // A new move: from where the camera is, keeping its heading towards the subject.
      d.shot = st.shot;
      d.az = azimuthTo(cur.position, centre, 0);
      const target = framingPose(centre, spread, d.az, framing);
      const dist = Math.hypot(target.position.x - cur.position.x, target.position.y - cur.position.y, target.position.z - cur.position.z);
      d.smooth = smoothFor(dist, Math.max(framing.minDistance * k, spread * framing.spreadFactor));
      d.spring.reset(cur, Math.hypot(centre.x - cur.position.x, centre.y - cur.position.y, centre.z - cur.position.z));
      d.t = t;
    }
    const dt = Math.min(0.1, Math.max(0, (t - d.t) / 1000));
    d.t = t;
    // A slow circle round the fight while it plays.
    if (useStore.getState().timeline.playing) d.az += ((ORBIT_DEG_S * Math.PI) / 180) * dt;
    const target = framingPose(centre, spread, d.az, framing);
    const pose = d.spring.step(target, centre, dt, d.smooth);
    engine.setCameraPose(pose.position, pose.forward);
    // What the engine has now, as it rounds it: the next frame compares against this.
    d.last = engine.cameraPose();
  }, active);

  useEffect(() => () => castTracks.clear(), []);

  if (!active || !moment || !src || !dataset) return null;
  const names = [moment.actor, moment.other].map((p) => (p >= 0 ? (src.players[p]?.name ?? '') : '')).filter((n, i) => n || i === 0);
  const multi = src.input.rounds.length > 1;
  const start = multi ? src.input.rounds[moment.round].start : src.match.start;
  const chips: string[] = [];
  chips.push(t('analysis.cinema.at', { time: clock(moment.time - start) }));
  if (multi) chips.push(t('analysis.cinema.round', { n: int(moment.round + 1) }));
  if (typeof moment.params.distance === 'number') chips.push(t('analysis.cinema.distance', { m: int(moment.params.distance) }));
  return (
    <>
      <div className="cast-rings" ref={rings}>
        {names.map((n, i) => (
          <div key={i} className={`cast-ring ${i === 0 ? 'actor' : 'other'}`}>
            <span>{n}</span>
          </div>
        ))}
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
