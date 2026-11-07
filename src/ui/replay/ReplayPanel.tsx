import { useMemo } from 'react';
import { Check, Section, Segmented, Slider } from '../controls';
import { TrackGraph } from './TrackGraph';
import { useStore } from '../../state/store';
import { useReplayStore, type LabelDetail } from '../../state/replayStore';
import { dropLinesOn, eventRows, trackName } from './replayData';
import { num, t } from '../../i18n';
import './replay.css';

/** mm:ss from the dataset's start. */
function clock(seconds: number): string {
  const s = Math.max(0, seconds);
  const m = Math.floor(s / 60);
  return `${m}:${(s - m * 60).toFixed(1).padStart(4, '0')}`;
}

/**
 * Box replay's debrief controls: names over the tracks, the follow camera,
 * the measured pair, and the recording's events to jump to.
 */
export function ReplayPanel() {
  const dataset = useStore((s) => s.dataset);
  const seek = useStore((s) => s.seek);
  const labels = useReplayStore((s) => s.labels);
  const follow = useReplayStore((s) => s.follow);
  const followDistance = useReplayStore((s) => s.followDistance);
  const pair = useReplayStore((s) => s.pair);
  const pairFrom = useReplayStore((s) => s.pairFrom);
  const dropLines = useReplayStore((s) => s.dropLines);
  const r = useReplayStore.getState;
  const events = useMemo(() => (dataset ? eventRows(dataset) : null), [dataset]);
  if (!dataset) return null;
  const start = dataset.timeRange[0];
  const name = (p: number) => trackName(dataset, p, -1);

  return (
    <Section title={t('replay.title')} defaultOpen>
      <Segmented<LabelDetail>
        value={labels}
        options={[
          { value: 'off', label: t('replay.labels.off') },
          { value: 'name', label: t('replay.labels.name') },
          { value: 'full', label: t('replay.labels.full') },
        ]}
        onChange={(v) => r().setLabels(v)}
      />
      <Check label={t('replay.dropLines')} checked={dropLinesOn(dataset, dropLines)} onChange={(v) => r().setDropLines(v)} title={t('replay.dropLinesTitle')} />
      <div className="hint">{t('replay.hint')}</div>
      {follow !== null && (
        <>
          <div className="hint">
            {t('replay.following', { name: name(follow) })}{' '}
            <button onClick={() => r().stopFollow()}>{t('replay.stop')}</button>
          </div>
          <Slider
            label={t('replay.followDistance')}
            value={followDistance}
            min={2}
            max={5000}
            logarithmic
            onChange={(v) => r().setFollowDistance(v)}
            format={(v) => t('replay.m', { v: num(v, 0) })}
          />
          <TrackGraph person={follow} />
        </>
      )}
      {(pair || pairFrom !== null) && (
        <div className="hint">
          {pair ? t('replay.pair', { from: name(pair[0]), to: name(pair[1]) }) : t('replay.pairFrom', { from: name(pairFrom!) })}{' '}
          <button onClick={() => r().clearPair()}>{t('replay.clear')}</button>
        </div>
      )}
      {events && events.rows.length > 0 && dataset.time && (
        <>
          <div className="hint">{t('replay.events', { count: events.rows.length })}</div>
          <div className="replay-events">
            {Array.from(events.rows.slice(0, 500), (row, i) => (
              <button key={row} onClick={() => seek(dataset.time![row])} title={t('replay.jump')}>
                <span>{clock(dataset.time![row] - start)}</span>
                <span>
                  {events.labels[i]}
                  {events.persons[i] >= 0 ? ` · ${name(events.persons[i])}` : ''}
                </span>
              </button>
            ))}
          </div>
        </>
      )}
    </Section>
  );
}
