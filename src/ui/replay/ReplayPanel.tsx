import { useMemo, useState } from 'react';
import { Check, Section, Segmented, Slider } from '../controls';
import { TrackGraph } from './TrackGraph';
import { useStore } from '../../state/store';
import { FOLLOW_MODES, LABEL_CATEGORIES, labelFieldsFor, useReplayStore, type FollowMode, type LabelCategory, type UnitSystem } from '../../state/replayStore';
import { dropLinesOn } from './replayData';
import { datasetFields, inFieldOrder } from './fields';
import { FieldPicker } from './FieldPicker';
import { personAt, sortUnits, unitsOf } from './units';
import { UnitList } from './UnitList';
import { EventList } from './EventList';
import { BookmarkPanel } from './BookmarkPanel';
import { DisplayPanel } from './DisplayPanel';
import { StatsPanel } from './StatsPanel';
import { num, t } from '../../i18n';
import { usePlayhead } from './hooks';
import './replay.css';

/**
 * The match replay's sidebar: the camera on a unit, the units, the events,
 * bookmarks, the tactical display, statistics, and the labels.
 */
export function ReplayPanel() {
  return (
    <>
      <CameraPanel />
      <UnitList />
      <EventList />
      <BookmarkPanel />
      <DisplayPanel />
      <StatsPanel />
      <LabelPanel />
    </>
  );
}

/** Views that sit some distance from the unit, where the distance slider means something. */
const DISTANT: FollowMode[] = ['chase', 'orbit', 'fixed', 'target', 'satellite'];
/** Views that need a second unit. */
const NEEDS_TARGET: FollowMode[] = ['padlock', 'target'];

/** Following a unit: which view, how far, the target, the measured pair and the chart of the unit. */
function CameraPanel() {
  const dataset = useStore((s) => s.dataset);
  const follow = useReplayStore((s) => s.follow);
  const followUnit = useReplayStore((s) => s.followUnit);
  const selected = useReplayStore((s) => s.selected);
  const followMode = useReplayStore((s) => s.followMode);
  const followDistance = useReplayStore((s) => s.followDistance);
  const target = useReplayStore((s) => s.target);
  const pair = useReplayStore((s) => s.pair);
  const pairFrom = useReplayStore((s) => s.pairFrom);
  const dropLines = useReplayStore((s) => s.dropLines);
  const hud = useReplayStore((s) => s.hud);
  const now = usePlayhead(1000);
  const r = useReplayStore.getState;
  const index = useMemo(() => (dataset ? unitsOf(dataset) : null), [dataset]);
  if (!dataset || !index) return null;
  const nameOf = (person: number) => index.units[index.personUnit[person]]?.name ?? String(person);
  // The chart is of the followed unit, else the selected one.
  const chartUnit = index.byKey.get(followUnit ?? selected ?? '') ?? null;
  const chartPerson = follow ?? (chartUnit ? personAt(chartUnit, now) : null);
  const setMode = (v: FollowMode) => {
    r().patchSaved({ followMode: v });
    // From straight above a chase distance shows a few metres of ground: start higher.
    if (v === 'satellite' && r().followDistance < 1500) r().setFollowDistance(3000);
    // The measured pair names a target when none is set.
    if (NEEDS_TARGET.includes(v) && !r().target && pair && follow !== null) {
      const other = pair[0] === follow ? pair[1] : pair[1] === follow ? pair[0] : null;
      const u = other !== null ? index.units[index.personUnit[other]] : undefined;
      if (u) r().setTarget(u.key);
    }
  };
  // Targets: everyone but the followed unit, weapons only while they fly.
  const targets = sortUnits(index.units.filter((u) => u.key !== followUnit && (u.kind !== 'weapon' || u.spans.some(([a, b]) => a <= now && now <= b))));

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
            options={FOLLOW_MODES.map((m) => ({ value: m, label: t(`replay.follow.${m}`), title: t(`replay.follow.${m}Title`) }))}
            onChange={setMode}
          />
          {DISTANT.includes(followMode) && (
            <Slider
              label={t('replay.followDistance')}
              value={followDistance}
              min={2}
              max={20000}
              logarithmic
              onChange={(v) => r().setFollowDistance(v)}
              format={(v) => (v >= 1000 ? t('replay.km', { v: num(v / 1000, 1) }) : t('replay.m', { v: num(v, 0) }))}
            />
          )}
          {NEEDS_TARGET.includes(followMode) && (
            <div className="field">
              <div className="label">
                <span>{t('replay.target.label')}</span>
                {target && (
                  <button className="small link" onClick={() => r().swapTarget()} title={t('replay.target.swapTitle')}>
                    {t('replay.target.swap')}
                  </button>
                )}
              </div>
              <select value={target ?? ''} onChange={(e) => r().setTarget(e.target.value || null)}>
                <option value="">{t('replay.target.none')}</option>
                {targets.map((u) => (
                  <option key={u.key} value={u.key}>
                    {u.name}
                    {u.vehicle && !u.name.startsWith(u.vehicle) ? ` · ${u.vehicle}` : ''}
                  </option>
                ))}
              </select>
              {!target && <div className="hint">{t('replay.target.hint')}</div>}
            </div>
          )}
          {(followMode === 'cockpit' || followMode === 'padlock') && <Check label={t('replay.hud.show')} checked={hud} onChange={(v) => r().patchSaved({ hud: v })} title={t('replay.hud.showTitle')} />}
          {(followMode === 'cockpit' || followMode === 'fixed' || followMode === 'satellite') && (
            <button className="small" onClick={() => r().resetView()}>
              {t('replay.follow.reset')}
            </button>
          )}
          <div className="hint">{t(`replay.follow.${followMode}Keys`)}</div>
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

/** What the labels over the units say, and how: for every unit, and by rules for each kind of object. */
function LabelPanel() {
  const dataset = useStore((s) => s.dataset);
  const labels = useReplayStore((s) => s.labels);
  const declutter = useReplayStore((s) => s.declutter);
  const units = useReplayStore((s) => s.units);
  const labelFields = useReplayStore((s) => s.labelFields);
  const rules = useReplayStore((s) => s.labelRules);
  const [tab, setTab] = useState<'all' | LabelCategory>('all');
  const fields = useMemo(() => (dataset ? datasetFields(dataset) : []), [dataset]);
  const r = useReplayStore.getState;
  if (!dataset) return null;
  const rule = tab === 'all' ? null : rules[tab];
  return (
    <Section title={t('replay.labels.title')}>
      <Check label={t('replay.labels.show')} checked={labels} onChange={(v) => r().patchSaved({ labels: v })} />
      <Check label={t('replay.labels.declutter')} checked={declutter} onChange={(v) => r().patchSaved({ declutter: v })} title={t('replay.labels.declutterTitle')} />
      <Segmented<UnitSystem>
        value={units}
        options={[
          { value: 'metric', label: t('replay.system.metric') },
          { value: 'imperial', label: t('replay.system.imperial'), title: t('replay.system.imperialTitle') },
        ]}
        onChange={(v) => r().patchSaved({ units: v })}
      />
      <div className="hint">{t('replay.labels.rulesHint')}</div>
      <Segmented<'all' | LabelCategory>
        value={tab}
        options={[{ value: 'all' as const, label: t('replay.labels.cat.all') }, ...LABEL_CATEGORIES.map((c) => ({ value: c, label: t(`replay.labels.cat.${c}`), title: t(`replay.labels.cat.${c}Title`) }))]}
        onChange={setTab}
      />
      {rule === null ? (
        <>
          <div className="hint">{t('replay.labels.fieldsHint')}</div>
          <FieldPicker available={fields} chosen={labelFieldsFor(dataset, labelFields)} onChange={(next) => r().patchSaved({ labelFields: inFieldOrder(next) })} />
          <button className="small link" onClick={() => r().patchSaved({ labelFields: null })}>
            {t('replay.labels.reset')}
          </button>
        </>
      ) : (
        <>
          <Check label={t('replay.labels.ruleShow')} checked={rule.show} onChange={(v) => r().setRule(tab as LabelCategory, { show: v })} title={t('replay.labels.ruleShowTitle')} />
          <div className="field">
            <div className="label">
              <span>{t('replay.labels.priority')}</span>
            </div>
            <select value={rule.priority} onChange={(e) => r().setRule(tab as LabelCategory, { priority: Number(e.target.value) })} title={t('replay.labels.priorityTitle')}>
              {[5, 4, 3, 2, 1].map((p) => (
                <option key={p} value={p}>
                  {t(`replay.labels.priority${p}`)}
                </option>
              ))}
            </select>
          </div>
          <Check
            label={t('replay.labels.ownFields')}
            checked={rule.fields !== null}
            onChange={(v) => r().setRule(tab as LabelCategory, { fields: v ? labelFieldsFor(dataset, labelFields) : null })}
            title={t('replay.labels.ownFieldsTitle')}
          />
          {rule.fields !== null && <FieldPicker available={fields} chosen={rule.fields} onChange={(next) => r().setRule(tab as LabelCategory, { fields: inFieldOrder(next) })} />}
        </>
      )}
    </Section>
  );
}
