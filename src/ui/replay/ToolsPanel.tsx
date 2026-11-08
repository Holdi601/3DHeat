import { useMemo, useState } from 'react';
import { Check, Section, Segmented } from '../controls';
import { useStore } from '../../state/store';
import { useReplayStore, type GridKind } from '../../state/replayStore';
import type { Dataset } from '../../state/types';
import { applyReshape, alignStarts, reshapeOf, sourceSeconds, type ShiftGroup } from '../../data/reshape';
import { canWriteAcmi, recordingAcmi, recordingCsv } from '../../data/exportRecording';
import { geoFrame } from '../../world/geoFrame';
import { sortUnits, unitsOf } from './units';
import { download } from './stats';
import { clock, usePlayhead } from './hooks';
import { useGlideslopes } from './GeoOverlay';
import { altitudeCrossings } from './altitudeLimits';
import { formatValue } from './fields';
import { selectAndFollow } from './ReplayOverlay';
import { MediaPanel } from './Media';
import { num, t } from '../../i18n';
import { useUnits } from '../../state/unitsStore';
import { unitSymbol } from '../../units/format';
import { fromAltitude, toAltitude } from '../../units/units';

/** The sidebar sections of the replay's tools: time shift and trim, map and position, audio and video. */
export function ToolsPanels() {
  return (
    <>
      <TimePanel />
      <MapPanel />
      <MediaPanel />
    </>
  );
}

/** Groups a shift can move, of the dataset as loaded: each unit, and each recording when there are several. */
function shiftGroups(o: Dataset): (ShiftGroup & { label: string })[] {
  const out: (ShiftGroup & { label: string })[] = [];
  if (o.sessionLabels.length > 1)
    o.sessionLabels.forEach((l, i) => out.push({ name: `s:${l}`, session: i, label: t('replay.time.recording', { name: l }) }));
  for (const u of sortUnits(unitsOf(o).units.filter((u) => u.kind !== 'weapon'))) out.push({ name: `u:${u.key}`, persons: u.persons, label: u.name });
  return out;
}

/** Put a reshaped recording in the view, keeping the moment and the session played. */
function show(was: Dataset, next: Dataset, playhead: number, allSessions = false): void {
  if (next === was) return;
  const s = useStore.getState();
  const session = s.team.session;
  const label = session >= 0 ? was.sessionLabels[session] : null;
  const at = sourceSeconds(was, playhead);
  s.setDataset(next);
  const i = label !== null && !allSessions ? next.sessionLabels.indexOf(label) : -1;
  useStore.setState((st) => ({ team: { ...st.team, session: allSessions ? -1 : i >= 0 ? i : st.team.session } }));
  const t0 = sourceSeconds(next, 0);
  useStore.getState().seek(Math.max(next.timeRange[0], Math.min(next.timeRange[1], at - t0)));
}

/**
 * Time shift (Tacview's: one unit's flight or a whole recording moved in
 * time, to fly two sorties side by side or line two recordings of one fight
 * up), trim (cut the recording to a span) and export of what is left.
 */
function TimePanel() {
  const dataset = useStore((s) => s.dataset);
  const now = usePlayhead(500);
  const [group, setGroup] = useState('');
  const [seconds, setSeconds] = useState(0);
  const [from, setFrom] = useState<number | null>(null);
  const [to, setTo] = useState<number | null>(null);
  const reshape = dataset ? reshapeOf(dataset) : null;
  const original = reshape?.original ?? dataset;
  const groups = useMemo(() => (original ? shiftGroups(original) : []), [original]);
  if (!dataset || !original || !dataset.time) return null;
  const shifts = reshape?.shifts ?? {};
  const trim = reshape?.trim ?? null;
  const start = dataset.timeRange[0];
  const apply = (nextShifts: Record<string, number>, nextTrim: [number, number] | null, allSessions = false) =>
    show(dataset, applyReshape(dataset, groups, nextShifts, nextTrim), now, allSessions);
  const chosen = groups.find((g) => g.name === group) ?? null;
  const name = (key: string) => groups.find((g) => g.name === key)?.label ?? key;
  const abs = (rel: number) => sourceSeconds(dataset, rel);
  const csvName = dataset.name.replace(/[^\w.-]+/g, '_').slice(0, 60) || 'recording';

  return (
    <Section title={t('replay.time.title')}>
      <div className="hint">{t('replay.time.shiftHint')}</div>
      <div className="field">
        <select value={group} onChange={(e) => setGroup(e.target.value)}>
          <option value="">{t('replay.time.pick')}</option>
          {groups.map((g) => (
            <option key={g.name} value={g.name}>
              {g.label}
              {shifts[g.name] ? ` (${shifts[g.name] > 0 ? '+' : ''}${num(shifts[g.name], 1)} s)` : ''}
            </option>
          ))}
        </select>
      </div>
      {chosen && (
        <div className="row">
          <input className="narrow" type="number" step={1} value={seconds} onChange={(e) => setSeconds(Number(e.target.value) || 0)} title={t('replay.time.secondsTitle')} />
          <span className="dim">{t('replay.time.seconds')}</span>
          <button onClick={() => apply({ ...shifts, [chosen.name]: (shifts[chosen.name] ?? 0) + seconds }, trim)} disabled={!seconds}>
            {t('replay.time.shift')}
          </button>
        </div>
      )}
      {Object.keys(shifts).length > 0 && (
        <div className="time-shifts">
          {Object.entries(shifts).map(([k, v]) => (
            <div key={k} className="hint">
              {t('replay.time.shifted', { name: name(k), v: (v > 0 ? '+' : '') + num(v, 1) })}{' '}
              <button
                className="small link"
                onClick={() => {
                  const next = { ...shifts };
                  delete next[k];
                  apply(next, trim);
                }}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
      {original.sessionLabels.length > 1 && (
        <button onClick={() => apply({ ...shifts, ...Object.fromEntries(Object.entries(alignStarts(original)).map(([l, v]) => [`s:${l}`, v])) }, trim, true)} title={t('replay.time.alignTitle')}>
          {t('replay.time.align')}
        </button>
      )}

      <div className="label-row">{t('replay.time.trim')}</div>
      <div className="row">
        <button className="small" onClick={() => setFrom(now)}>
          {t('replay.time.from')}
        </button>
        <span className="mono">{clock((from ?? start) - start)}</span>
        <button className="small" onClick={() => setTo(now)}>
          {t('replay.time.to')}
        </button>
        <span className="mono">{clock((to ?? dataset.timeRange[1]) - start)}</span>
      </div>
      <div className="row">
        <button
          disabled={from === null && to === null}
          onClick={() => {
            const a = abs(from ?? dataset.timeRange[0]);
            const b = abs(to ?? dataset.timeRange[1]);
            setFrom(null);
            setTo(null);
            apply(shifts, [Math.min(a, b), Math.max(a, b)]);
          }}
          title={t('replay.time.trimTitle')}
        >
          {t('replay.time.cut')}
        </button>
        {trim && (
          <button onClick={() => apply(shifts, null)} title={t('replay.time.untrimTitle')}>
            {t('replay.time.untrim')}
          </button>
        )}
      </div>
      <div className="row">
        <button onClick={() => download(`${csvName}.csv`, recordingCsv(dataset))} title={t('replay.time.csvTitle')}>
          {t('replay.time.csv')}
        </button>
        {canWriteAcmi(dataset) && (
          <button onClick={() => download(`${csvName}.txt.acmi`, recordingAcmi(dataset) ?? '', 'text/plain')} title={t('replay.time.acmiTitle')}>
            {t('replay.time.acmi')}
          </button>
        )}
      </div>
      <div className="hint">{t('replay.time.keys')}</div>
    </Section>
  );
}

/**
 * Where things are on the earth: the latitude and longitude or MGRS grid,
 * magnetic headings, glideslopes, and an altitude restriction with its
 * crossings.
 */
function MapPanel() {
  const dataset = useStore((s) => s.dataset);
  const session = useStore((s) => s.team.session);
  const geo = useReplayStore((s) => s.geo);
  const limits = useReplayStore((s) => s.limits);
  const units = useUnits();
  const placed = !!dataset && !!geoFrame(dataset);
  const slopes = useGlideslopes(dataset, geo.glideslope && placed);
  const crossings = useMemo(() => (dataset ? altitudeCrossings(dataset, session, limits) : []), [dataset, session, limits]);
  if (!dataset) return null;
  const r = useReplayStore.getState;
  const toShown = (m: number | null) => (m === null ? '' : String(Math.round(toAltitude(m, units.altitude))));
  const fromShown = (s: string) => (s.trim() === '' || !Number.isFinite(Number(s)) ? null : fromAltitude(Number(s), units.altitude));
  const start = dataset.timeRange[0];
  return (
    <Section title={t('replay.geo.title')}>
      {!placed && <div className="hint">{t('replay.geo.notPlaced')}</div>}
      {placed && (
        <>
          <div className="field">
            <div className="label">
              <span>{t('replay.geo.grid')}</span>
            </div>
            <Segmented<GridKind>
              value={geo.grid}
              options={[
                { value: 'off', label: t('replay.geo.gridOff') },
                { value: 'latlon', label: t('replay.geo.gridLatLon'), title: t('replay.geo.gridLatLonTitle') },
                { value: 'mgrs', label: 'MGRS', title: t('replay.geo.gridMgrsTitle') },
              ]}
              onChange={(v) => r().setGeo({ grid: v })}
            />
          </div>
          <Check label={t('replay.geo.magnetic')} checked={geo.magnetic} onChange={(v) => r().setGeo({ magnetic: v })} title={t('replay.geo.magneticTitle')} />
          <Check label={t('replay.geo.glideslope')} checked={geo.glideslope} onChange={(v) => r().setGeo({ glideslope: v })} title={t('replay.geo.glideslopeTitle')} />
          {slopes && (
            <div className="hint">
              {slopes.status === 'loading'
                ? t('replay.geo.glideLoading')
                : slopes.status === 'failed'
                  ? t('replay.geo.glideFailed')
                  : t('replay.geo.glideCount', { n: slopes.slopes.length / 2 })}
            </div>
          )}
        </>
      )}
      <Check label={t('replay.limits.on')} checked={limits.on} onChange={(v) => r().setLimits({ on: v })} title={t('replay.limits.onTitle')} />
      {limits.on && (
        <>
          <div className="row">
            <label>
              {t('replay.limits.floor')}{' '}
              <input className="narrow" type="number" value={toShown(limits.floor)} onChange={(e) => r().setLimits({ floor: fromShown(e.target.value) })} />
            </label>
            <label>
              {t('replay.limits.ceiling')}{' '}
              <input className="narrow" type="number" value={toShown(limits.ceiling)} onChange={(e) => r().setLimits({ ceiling: fromShown(e.target.value) })} />
            </label>
            <span className="dim">{unitSymbol('altitude', units)}</span>
          </div>
          <div className="hint">{t('replay.limits.count', { n: crossings.filter((c) => c.kind !== 'backInside').length })}</div>
          <div className="limit-list">
            {crossings.slice(0, 300).map((c, i) => (
              <button
                key={i}
                className={`limit-row ${c.kind}`}
                onClick={() => {
                  useStore.getState().seek(c.time);
                  selectAndFollow(c.unit, c.person);
                }}
              >
                <span className="mono">{clock(c.time - start)}</span> {c.unit.name} · {t(`replay.limits.${c.kind}`)} · {formatValue('altitude', c.alt, units)}
              </button>
            ))}
          </div>
        </>
      )}
    </Section>
  );
}
