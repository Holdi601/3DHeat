import { useMemo } from 'react';
import { Check, Section, Segmented, Slider } from '../controls';
import { TrackGraph } from './TrackGraph';
import { useStore } from '../../state/store';
import { labelFieldsFor, useReplayStore, type FollowMode, type UnitSystem } from '../../state/replayStore';
import { dropLinesOn } from './replayData';
import { datasetFields, inFieldOrder } from './fields';
import { FieldPicker } from './FieldPicker';
import { personAt, unitsOf } from './units';
import { UnitList } from './UnitList';
import { EventList } from './EventList';
import { num, t } from '../../i18n';
import { usePlayhead } from './hooks';
import './replay.css';

/**
 * The match replay's sidebar: the camera on a unit, the units, the events,
 * the labels and the chart.
 */
export function ReplayPanel() {
  return (
    <>
      <FollowPanel />
      <UnitList />
      <EventList />
      <LabelPanel />
    </>
  );
}

/** Following a unit: how, how far, the measured pair and the chart of the unit. */
function FollowPanel() {
  const dataset = useStore((s) => s.dataset);
  const follow = useReplayStore((s) => s.follow);
  const followUnit = useReplayStore((s) => s.followUnit);
  const selected = useReplayStore((s) => s.selected);
  const followMode = useReplayStore((s) => s.followMode);
  const followDistance = useReplayStore((s) => s.followDistance);
  const pair = useReplayStore((s) => s.pair);
  const pairFrom = useReplayStore((s) => s.pairFrom);
  const dropLines = useReplayStore((s) => s.dropLines);
  const now = usePlayhead(1000);
  const r = useReplayStore.getState;
  const index = useMemo(() => (dataset ? unitsOf(dataset) : null), [dataset]);
  if (!dataset || !index) return null;
  const nameOf = (person: number) => index.units[index.personUnit[person]]?.name ?? String(person);
  // The chart is of the followed unit, else the selected one.
  const chartUnit = index.byKey.get(followUnit ?? selected ?? '') ?? null;
  const chartPerson = follow ?? (chartUnit ? personAt(chartUnit, now) : null);

  return (
    <Section title={t('replay.title')} defaultOpen>
      {follow === null ? (
        <div className="hint">{t('replay.hint')}</div>
      ) : (
        <>
          <div className="hint">
            {t('replay.following', { name: nameOf(follow) })}{' '}
            <button onClick={() => r().stopFollow()}>{t('replay.stop')}</button>
          </div>
          <Segmented<FollowMode>
            value={followMode}
            options={[
              { value: 'chase', label: t('replay.follow.chase'), title: t('replay.follow.chaseTitle') },
              { value: 'orbit', label: t('replay.follow.orbit'), title: t('replay.follow.orbitTitle') },
            ]}
            onChange={(v) => r().patchSaved({ followMode: v })}
          />
          <Slider
            label={t('replay.followDistance')}
            value={followDistance}
            min={2}
            max={20000}
            logarithmic
            onChange={(v) => r().setFollowDistance(v)}
            format={(v) => (v >= 1000 ? t('replay.km', { v: num(v / 1000, 1) }) : t('replay.m', { v: num(v, 0) }))}
          />
          <div className="hint">{t('replay.follow.keys')}</div>
        </>
      )}
      {chartPerson !== null && <TrackGraph person={chartPerson} />}
      {(pair || pairFrom !== null) && (
        <div className="hint">
          {pair ? t('replay.pair', { from: nameOf(pair[0]), to: nameOf(pair[1]) }) : t('replay.pairFrom', { from: nameOf(pairFrom!) })}{' '}
          <button onClick={() => r().clearPair()}>{t('replay.clear')}</button>
        </div>
      )}
      <Check label={t('replay.dropLines')} checked={dropLinesOn(dataset, dropLines)} onChange={(v) => r().setDropLines(v)} title={t('replay.dropLinesTitle')} />
    </Section>
  );
}

/** What the labels over the units say, and how. */
function LabelPanel() {
  const dataset = useStore((s) => s.dataset);
  const labels = useReplayStore((s) => s.labels);
  const labelAi = useReplayStore((s) => s.labelAi);
  const declutter = useReplayStore((s) => s.declutter);
  const units = useReplayStore((s) => s.units);
  const labelFields = useReplayStore((s) => s.labelFields);
  const fields = useMemo(() => (dataset ? datasetFields(dataset) : []), [dataset]);
  const r = useReplayStore.getState;
  if (!dataset) return null;
  return (
    <Section title={t('replay.labels.title')}>
      <Check label={t('replay.labels.show')} checked={labels} onChange={(v) => r().patchSaved({ labels: v })} />
      <Check label={t('replay.labels.ai')} checked={labelAi} onChange={(v) => r().patchSaved({ labelAi: v })} title={t('replay.labels.aiTitle')} />
      <Check label={t('replay.labels.declutter')} checked={declutter} onChange={(v) => r().patchSaved({ declutter: v })} title={t('replay.labels.declutterTitle')} />
      <Segmented<UnitSystem>
        value={units}
        options={[
          { value: 'metric', label: t('replay.system.metric') },
          { value: 'imperial', label: t('replay.system.imperial'), title: t('replay.system.imperialTitle') },
        ]}
        onChange={(v) => r().patchSaved({ units: v })}
      />
      <div className="hint">{t('replay.labels.fieldsHint')}</div>
      <FieldPicker available={fields} chosen={labelFieldsFor(dataset, labelFields)} onChange={(next) => r().patchSaved({ labelFields: inFieldOrder(next) })} />
      <button className="small link" onClick={() => r().patchSaved({ labelFields: null })}>
        {t('replay.labels.reset')}
      </button>
    </Section>
  );
}
