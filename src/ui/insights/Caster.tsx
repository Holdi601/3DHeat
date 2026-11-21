/**
 * Caster mode: one replay's moments on a timeline - first blood, multi-kills,
 * trades, clutches, objectives, the comeback, who stands out and who has a
 * hard match, the long shots - each with a commentator's line. A click goes
 * there: the playhead just before it, the replay on, the camera flown to the
 * action and then following the player. Played as a list, each moment runs
 * to its end and the next follows. The lines are the viewer's own; on request
 * the external model writes them instead.
 */

import { useEffect, useMemo, useRef } from 'react';
import { create } from 'zustand';
import { int, lang, t, useLang } from '../../i18n';
import { castPrompt, parseCastLines } from '../../insights/ai/prompt';
import { useAi } from '../../insights/ai/settings';
import { findMoments, type Moment } from '../../insights/cast/moments';
import { castMatch, castSource, trackAt, type CastSource } from '../../insights/cast/source';
import { CANON } from '../../data/canonical';
import { matchesAreSessions, matchesOf, pickMatches } from '../../match/matches';
import type { Engine } from '../../render/engine';
import { useStore } from '../../state/store';
import type { Dataset } from '../../state/types';
import { useEngine } from '../EngineContext';
import { selectAndFollow } from '../replay/ReplayOverlay';
import { clock } from '../replay/hooks';
import { flyTo } from '../replay/replayView';
import { SortControl } from '../sort/SortControl';
import { useSort, useSorted } from '../sort/useSort';
import { AiSettingsButton } from './AiSettings';
import { labelOf } from './say';
import { useAiStream } from './useAiStream';
import { startCinema, stopCinema, useCinema } from './cinemaStore';

interface CastState {
  key: string | null;
  src: CastSource | null;
  moments: Moment[];
  current: number;
  playing: boolean;
  set: (p: Partial<Omit<CastState, 'set'>>) => void;
}

/** Milliseconds after going to a moment before the playing list checks whether it has ended. */
const SETTLE_MS = 500;

const useCast = create<CastState>((set) => ({ key: null, src: null, moments: [], current: -1, playing: false, set: (p) => set(p) }));

/** A moment's line in the viewer's language. */
export function momentLine(m: Moment, src: CastSource, d: Dataset): string {
  const who = (u: number) => (u >= 0 ? (src.players[u]?.name ?? t('insights.cast.someone')) : t('insights.cast.someone'));
  const team = m.team >= 0 ? (d.teamLabels[m.team] ?? String(m.team)) : '';
  const p = m.params;
  const cls = typeof p.class === 'string' && p.class ? labelOf(CANON.vehicleClass, p.class) : t('insights.cast.peers');
  const values: Record<string, string | number> = { ...p, actor: who(m.actor), other: who(m.other), team, class: cls };
  if (typeof p.victim === 'number') values.victim = who(p.victim);
  if (typeof p.secs === 'number') values.secs = `${p.secs} s`;
  if (typeof p.distance === 'number') values.distance = `${int(p.distance)} m`;
  let key = `insights.cast.say.${m.kind}`;
  if (m.kind === 'clutch') key = `insights.cast.say.clutch${p.outcome === 'won' ? 'Won' : p.outcome === 'lost' ? 'Lost' : 'Open'}`;
  if (m.kind === 'firstBlood' && p.round) key = 'insights.cast.say.firstBloodRound';
  if (typeof p.fromPct === 'number') values.fromPct = `${p.fromPct}%`;
  if (typeof p.toPct === 'number') values.toPct = `${p.toPct}%`;
  const line = t(key, values);
  // Whether the side went on to win the round.
  return typeof p.result === 'string' && m.kind !== 'clutch' ? `${line.replace(/[.!。]\s*$/, '')} ${t('insights.cast.result', { result: p.result })}` : line;
}

/**
 * Go to a moment: its round played, the playhead before it, the camera on it
 * - and, while the list plays (`follow`), then following its player. A moment
 * picked by hand stays where the camera was flown: following the player
 * afterwards carried the camera off to wherever the player was (a long shot's
 * shooter is far from its victim), which read as the jump being undone. The
 * flight also holds the tactical display's director (`flyTo`).
 */
let followTimer = 0;
/** When the last moment was gone to: the playhead is the old one until the engine takes the seek. */
let wentAt = 0;
export function goToMoment(m: Moment, src: CastSource, d: Dataset, engine: Engine | null, follow = true): void {
  wentAt = performance.now();
  if (useStore.getState().mode !== 'team') {
    // Into the replay first: it settles its own session and playhead as it opens, then the moment.
    useStore.getState().setMode('team');
    clearTimeout(followTimer);
    followTimer = window.setTimeout(() => goToMoment(m, src, d, engine, follow), 150);
    return;
  }
  const st = useStore.getState();
  // A match of rounds plays one round at a time: the one the moment is in.
  const r = src.input.rounds[m.round];
  if (r && r.session !== undefined && src.input.rounds.length > 1 && !matchesAreSessions(d) && st.team.session !== r.session) st.patchTeam({ session: r.session });
  if (r?.filter && src.input.rounds.length > 1) {
    const f = r.filter;
    const col = 'column' in f ? f.column : '';
    st.setFilters([...st.filters.filter((x) => !('column' in x && x.column === col)), f]);
  }
  st.seek(m.from);
  clearTimeout(followTimer);
  // The caster's own camera: a move without a cut, subtitles and the subjects ringed (CasterCinema.tsx).
  if (useCinema.getState().on) {
    startCinema(m, src);
    return;
  }
  if (engine) flyTo(engine, d, { x: m.x, y: m.y, z: m.z }, 120);
  if (follow && m.actor >= 0) {
    const at = trackAt(src, m.actor, m.time);
    // After the flight: following straight away would cut it short.
    if (at) followTimer = window.setTimeout(() => selectAndFollow(src.units.units[at.unit], at.track), engine ? 650 : 0);
  }
}

/** The caster's camera and subtitles: on or off, and back to it after taking the camera over. */
function CinemaControls() {
  const on = useCinema((s) => s.on);
  const subtitles = useCinema((s) => s.subtitles);
  const held = useCinema((s) => s.held);
  const moment = useCinema((s) => s.moment);
  return (
    <div className="row wrap" style={{ gap: 8, alignItems: 'center' }}>
      <label title={t('analysis.cinema.onTitle')}>
        <input type="checkbox" checked={on} onChange={(e) => useCinema.getState().set({ on: e.target.checked })} /> {t('analysis.cinema.on')}
      </label>
      {on && (
        <label title={t('analysis.cinema.subtitlesTitle')}>
          <input type="checkbox" checked={subtitles} onChange={(e) => useCinema.getState().set({ subtitles: e.target.checked })} /> {t('analysis.cinema.subtitles')}
        </label>
      )}
      {on && held && moment && (
        <button onClick={() => useCinema.getState().set({ held: false, shot: useCinema.getState().shot + 1 })} title={t('analysis.cinema.resumeTitle')}>
          {t('analysis.cinema.resume')}
        </button>
      )}
    </div>
  );
}

export function Caster() {
  useLang();
  const engine = useEngine();
  const dataset = useStore((s) => s.dataset);
  const filters = useStore((s) => s.filters);
  const session = useStore((s) => s.team.session);
  const cast = useCast();
  const ai = useAi();
  const stream = useAiStream('cast');
  const match = useMemo(() => (dataset ? castMatch(dataset, filters, session) : null), [dataset, filters, session]);
  const key = dataset && match ? `${dataset.id}|${match.index}` : null;
  const set = useMemo(() => (dataset ? matchesOf(dataset) : null), [dataset]);
  const listRef = useRef<HTMLOListElement>(null);

  // A new match: its moments, worked out when asked or when the tab is open on it.
  useEffect(() => {
    if (!dataset || !match || cast.key === key) return;
    const src = castSource(dataset, match);
    const moments = src ? findMoments(src.input) : [];
    useCast.getState().set({ key, src, moments, current: -1, playing: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataset, key]);

  // The list plays: each moment to its end, then the next.
  useEffect(() => {
    if (!cast.playing || !engine || !dataset || !cast.src) return;
    const id = window.setInterval(() => {
      const s = useCast.getState();
      const m = s.moments[s.current];
      if (!m || !s.src) return;
      // Just gone to it: the engine may not have taken the seek yet, and its old playhead is past this one's end.
      if (performance.now() - wentAt < SETTLE_MS) return;
      if (engine.live.playhead >= m.to) {
        const next = s.current + 1;
        if (next >= s.moments.length) {
          s.set({ playing: false });
          useStore.getState().setPlaying(false);
          return;
        }
        s.set({ current: next });
        goToMoment(s.moments[next], s.src, dataset, engine);
      }
    }, 200);
    return () => window.clearInterval(id);
  }, [cast.playing, engine, dataset, cast.src]);

  // The current moment in view in the list.
  useEffect(() => {
    listRef.current?.querySelector('.ins-moment.on')?.scrollIntoView({ block: 'nearest' });
  }, [cast.current]);

  // The list's order only: playing, Previous and Next keep to time.
  const indices = useMemo(() => cast.moments.map((_, i) => i), [cast.moments]);
  const sort = useSort<number>(
    'insights.moments',
    [
      { id: 'time', label: t('ui.sort.time'), key: (i) => cast.moments[i]?.time, kind: 'number', dir: 'asc' },
      { id: 'importance', label: t('ui.sort.importance'), key: (i) => cast.moments[i]?.weight, kind: 'number' },
      { id: 'kind', label: t('ui.sort.kind'), key: (i) => (cast.moments[i] ? t(`insights.cast.kind.${cast.moments[i].kind}`) : null) },
      { id: 'player', label: t('ui.sort.player'), key: (i) => { const u = cast.moments[i]?.actor ?? -1; return u >= 0 ? cast.src?.players[u]?.name : null; } },
    ],
    'time',
  );
  const order = useSorted(indices, sort, [cast.moments, cast.src]);

  if (!dataset) return null;
  if (!match) {
    return (
      <div className="ins-cast">
        <div className="hint">{t('insights.cast.pickMatch')}</div>
        <select value="" onChange={(e) => e.target.value !== '' && pickMatches(dataset, [Number(e.target.value)])}>
          <option value="">—</option>
          {set?.entries.map((e) => (
            <option key={e.index} value={e.index}>
              {e.id}
            </option>
          ))}
        </select>
      </div>
    );
  }
  if (cast.key === key && !cast.src) return <div className="hint">{t('insights.cast.unavailable')}</div>;
  const src = cast.src;
  if (!src || cast.key !== key) return null;
  if (!cast.moments.length) return <div className="hint">{t('insights.cast.none')}</div>;

  // Playing the list, each moment then follows its player; a moment picked by hand keeps the camera where it went.
  const go = (i: number, play = cast.playing) => {
    cast.set({ current: i, playing: play });
    goToMoment(cast.moments[i], src, dataset, engine, play);
    if (play) useStore.getState().setPlaying(true);
  };
  const mine = stream.about === key;
  const aiLines = parseCastLines(mine ? stream.text : '');
  const line = (m: Moment) => aiLines.get(m.id) ?? momentLine(m, src, dataset);
  const writeLines = () => {
    const cls = (c: string) => (c ? labelOf(CANON.vehicleClass, c) : '');
    stream.start(
      castPrompt(cast.moments, { player: (u) => src.players[u]?.name ?? '', team: (x) => dataset.teamLabels[x] ?? String(x), className: cls }, { language: lang(), names: ai.names }),
      key!,
    );
  };
  const cur = cast.moments[cast.current];
  const kills = src.input.kills.filter((k) => k.killer >= 0).length;

  return (
    <div className="ins-cast">
      <div className="hint">{t('insights.cast.summary', { n: int(cast.moments.length), kills: int(kills), match: match.id })}</div>
      <div className="row wrap" style={{ gap: 6 }}>
        {cast.playing ? (
          <button
            onClick={() => {
              cast.set({ playing: false });
              useStore.getState().setPlaying(false);
              stopCinema();
            }}
          >
            {t('insights.cast.stop')}
          </button>
        ) : (
          <button onClick={() => go(Math.max(0, cast.current), true)}>{t('insights.cast.play')}</button>
        )}
        <button onClick={() => go(Math.max(0, cast.current - 1))} disabled={cast.current <= 0}>
          {t('insights.cast.prev')}
        </button>
        <button onClick={() => go(Math.min(cast.moments.length - 1, cast.current + 1))} disabled={cast.current >= cast.moments.length - 1}>
          {t('insights.cast.next')}
        </button>
      </div>
      <CinemaControls />
      {cur && (
        <div className="ins-cast-now" aria-live="polite">
          <span className="ins-moment-kind">{t(`insights.cast.kind.${cur.kind}`)}</span> {line(cur)}
        </div>
      )}
      {cast.moments.length > 1 && <SortControl sort={sort} />}
      <ol className="ins-list ins-moments" ref={listRef}>
        {order.map((i) => [cast.moments[i], i] as const).map(([m, i]) => (
          <li key={m.id} className={`ins-moment${i === cast.current ? ' on' : ''}`}>
            <button className="ins-head" onClick={() => go(i)} title={t('insights.cast.jumpTitle')}>
              <span className="ins-bar" aria-hidden>
                <span style={{ width: `${Math.round(m.weight * 100)}%` }} />
              </span>
              <span className="ins-text">
                <span className="ins-moment-time">{src.input.rounds.length > 1 ? `#${m.round + 1} ` : ''}
                  {clock(m.time - (src.input.rounds.length > 1 ? src.input.rounds[m.round].start : match.start))}</span>{' '}
                <span className="ins-moment-kind">{t(`insights.cast.kind.${m.kind}`)}</span> {line(m)}
              </span>
            </button>
          </li>
        ))}
      </ol>
      <div className="row wrap" style={{ gap: 6, alignItems: 'center', marginTop: 6 }}>
        <AiSettingsButton />
        {ai.enabled && (
          <button onClick={writeLines} disabled={stream.running}>
            {t('insights.cast.aiLines')}
          </button>
        )}
        {mine && stream.running && <button onClick={stream.cancel}>{t('insights.ai.cancel')}</button>}
      </div>
      {mine && stream.running && !stream.text && <div className="hint">{t('insights.ai.writing')}</div>}
      {mine && stream.error && <div className="hint ins-err">{stream.error}</div>}
    </div>
  );
}
