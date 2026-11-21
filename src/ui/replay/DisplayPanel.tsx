import { useMemo } from 'react';
import { Check, Section, Segmented, Slider } from '../controls';
import { useStore } from '../../state/store';
import {
  SCOPES,
  useReplayStore,
  type DisplayAids,
  type MapView,
  type Scope,
} from '../../state/replayStore';
import { tacticalColumns, type AidMissing } from '../../render/tactical';
import { num, t } from '../../i18n';
import { useUnits } from '../../state/unitsStore';
import { formatLong } from '../../units/format';
import { aimOf } from '../../figures/aim';
import { cameraTracks } from '../../render/lookAids';
import { unitsOf } from './units';
import { selectAndFollow } from './ReplayOverlay';

/** A display aid's "for whom" choice. */
function ScopeSelect({
  label,
  title,
  value,
  onChange,
  missing,
}: {
  label: string;
  title: string;
  value: Scope;
  onChange: (s: Scope) => void;
  /** True, or what the recording lacks (the columns, and whether a newer conversion writes them). */
  missing?: boolean | AidMissing;
}) {
  const why = typeof missing === 'object' ? missing : null;
  // Which columns are missing, and for a file converted before its converter wrote them, that converting it again adds them.
  const detail = why ? t(why.olderConverter ? 'ranges.recording.olderConverter' : 'ranges.recording.noColumn', { columns: why.columns }) : '';
  return (
    <div className="field scope-field" title={detail ? `${title}\n\n${detail}` : title}>
      <div className="label">
        <span>{label}</span>
        {missing && <span className="dim">{t('replay.aids.notInData')}</span>}
      </div>
      {detail && <div className="hint">{detail}</div>}
      <select value={value} onChange={(e) => onChange(e.target.value as Scope)}>
        {SCOPES.map((s) => (
          <option key={s} value={s}>
            {t(`replay.scope.${s}`)}
          </option>
        ))}
      </select>
    </div>
  );
}

/**
 * The tactical display: velocity vectors and the path ahead, nose and lift
 * lines, radar cones, locks and engagement domes - each for no unit, the
 * ones in question, all, or one kind - the line of sight of the measured
 * pair, the 2D map and the chart window.
 */
export function DisplayPanel() {
  const dataset = useStore((s) => s.dataset);
  const aids = useReplayStore((s) => s.aids);
  const map = useReplayStore((s) => s.map);
  const mapTrail = useReplayStore((s) => s.mapTrail);
  const mapNames = useReplayStore((s) => s.mapNames);
  const chartOpen = useReplayStore((s) => s.chart.open);
  const has = useMemo(() => (dataset ? tacticalColumns(dataset) : null), [dataset]);
  const units = useUnits();
  const lookOn = useStore((s) => s.team.showLookDirection);
  const hasAim = useMemo(() => (dataset ? !!aimOf(dataset) : false), [dataset]);
  // The recorded cameras, each by its unit and its first track.
  const cameras = useMemo(() => {
    if (!dataset) return [];
    const cams = cameraTracks(dataset);
    if (!cams.any) return [];
    const index = unitsOf(dataset);
    return index.units.filter((u) => u.persons.some((p) => cams.persons[p])).map((u) => ({ unit: u, person: u.persons.find((p) => cams.persons[p]) ?? u.persons[0] }));
  }, [dataset]);
  if (!dataset || !has) return null;
  const r = useReplayStore.getState;
  const set = (p: Partial<DisplayAids>) => r().setAids(p);
  return (
    <Section title={t('replay.aids.title')}>
      <ScopeSelect
        label={t('replay.aids.vectors')}
        title={t('replay.aids.vectorsTitle')}
        value={aids.vectors}
        onChange={(v) => set({ vectors: v })}
      />
      <ScopeSelect
        label={t('replay.aids.pathAhead')}
        title={t('replay.aids.pathAheadTitle')}
        value={aids.pathAhead}
        onChange={(v) => set({ pathAhead: v })}
      />
      <Slider
        label={t('replay.aids.seconds')}
        value={aids.vectorSeconds}
        min={1}
        max={120}
        logarithmic
        onChange={(v) => set({ vectorSeconds: v })}
        format={(v) => t('replay.aids.secondsValue', { v: num(v, v < 10 ? 1 : 0) })}
      />
      <ScopeSelect
        label={t('replay.aids.attitude')}
        title={t('replay.aids.attitudeTitle')}
        value={aids.attitudeLines}
        onChange={(v) => set({ attitudeLines: v })}
      />
      <ScopeSelect
        label={t('replay.aids.radar')}
        title={t('replay.aids.radarTitle')}
        value={aids.radar}
        onChange={(v) => set({ radar: v })}
        missing={has.missing.radar}
      />
      <ScopeSelect
        label={t('replay.aids.locks')}
        title={t('replay.aids.locksTitle')}
        value={aids.locks}
        onChange={(v) => set({ locks: v })}
        missing={has.missing.locks}
      />
      <ScopeSelect
        label={t('replay.aids.links')}
        title={t('replay.aids.linksTitle')}
        value={aids.links}
        onChange={(v) => set({ links: v })}
        missing={has.missing.links}
      />
      <ScopeSelect
        label={t('replay.aids.engagement')}
        title={t('replay.aids.engagementTitle')}
        value={aids.engagement}
        onChange={(v) => set({ engagement: v })}
        missing={has.missing.engagement}
      />
      <ScopeSelect
        label={t('replay.aids.sight')}
        title={t('replay.aids.sightTitle')}
        value={aids.pilotSight}
        onChange={(v) => set({ pilotSight: v })}
        missing={has.missing.sight}
      />
      <Check
        label={t('replay.aids.lockLabels')}
        checked={aids.lockLabels}
        onChange={(v) => set({ lockLabels: v })}
        title={t('replay.aids.lockLabelsTitle')}
      />
      <ScopeSelect
        label={t('replay.aids.engagements')}
        title={t('replay.aids.engagementsTitle')}
        value={aids.engagements}
        onChange={(v) => set({ engagements: v })}
      />
      {aids.engagements !== 'off' && (
        <Segmented
          value={aids.engageBy}
          onChange={(v) => set({ engageBy: v })}
          options={[
            { value: 'exchange', label: t('analysis.engage.byExchange') },
            { value: 'range', label: t('analysis.engage.byRange') },
          ]}
        />
      )}
      {aids.engagements !== 'off' && aids.engageBy === 'exchange' && (
        <>
          <div className="hint">{t('analysis.engage.hint')}</div>
          <Slider
            label={t('analysis.engage.before')}
            value={aids.engageBefore}
            min={0}
            max={60}
            step={0.5}
            onChange={(v) => set({ engageBefore: v })}
            format={(v) => t('analysis.engage.seconds', { s: num(v, v < 10 ? 1 : 0) })}
          />
          <Slider
            label={t('analysis.engage.after')}
            value={aids.engageAfter}
            min={0}
            max={120}
            step={0.5}
            onChange={(v) => set({ engageAfter: v })}
            format={(v) => t('analysis.engage.seconds', { s: num(v, v < 10 ? 1 : 0) })}
          />
        </>
      )}
      {aids.engagements !== 'off' && aids.engageBy === 'range' && (
        <Slider
          label={t('replay.aids.engagementRange')}
          value={aids.engagementRange / 1000}
          min={1}
          max={200}
          logarithmic
          onChange={(v) => set({ engagementRange: v * 1000 })}
          format={(v) => formatLong(v * 1000, units, v < 10 ? 1 : 0)}
        />
      )}
      <ScopeSelect
        label={t('units.look.cones')}
        title={t('units.look.conesTitle')}
        value={aids.look}
        onChange={(v) => set({ look: v })}
      />
      {aids.look !== 'off' && !lookOn && <div className="hint">{t('units.look.needsTeam')}</div>}
      <ScopeSelect
        label={t('units.look.aim')}
        title={t('units.look.aimTitle')}
        value={aids.aim}
        onChange={(v) => set({ aim: v })}
        missing={!hasAim}
      />
      {cameras.length > 0 && (
        <>
          <Check label={t('units.look.camera')} checked={aids.camera} onChange={(v) => set({ camera: v })} title={t('units.look.cameraTitle')} />
          {cameras.map((c) => (
            <button
              key={c.unit.key}
              className="small"
              title={t('units.look.throughTitle')}
              onClick={() => {
                r().patchSaved({ followMode: 'cockpit' });
                selectAndFollow(c.unit, c.person);
              }}
            >
              {cameras.length > 1 ? t('units.look.throughNamed', { name: c.unit.name }) : t('units.look.through')}
            </button>
          ))}
        </>
      )}
      <Check
        label={t('replay.aids.los')}
        checked={aids.lineOfSight}
        onChange={(v) => set({ lineOfSight: v })}
        title={t('replay.aids.losTitle')}
      />
      <div className="field">
        <div className="label">
          <span>{t('replay.map.title')}</span>
          <span className="dim">M</span>
        </div>
        <Segmented<MapView>
          value={map}
          options={[
            { value: 'off', label: t('replay.map.off') },
            { value: 'pip', label: t('replay.map.pip'), title: t('replay.map.pipTitle') },
            { value: 'full', label: t('replay.map.full'), title: t('replay.map.fullTitle') },
          ]}
          onChange={(v) => r().patchSaved({ map: v })}
        />
      </div>
      {map !== 'off' && (
        <>
          <Slider
            label={t('replay.map.trail')}
            value={mapTrail}
            min={0}
            max={600}
            step={5}
            onChange={(v) => r().patchSaved({ mapTrail: v })}
            format={(v) => t('replay.aids.secondsValue', { v: num(v, 0) })}
          />
          <Check
            label={t('replay.map.names')}
            checked={mapNames}
            onChange={(v) => r().patchSaved({ mapNames: v })}
          />
        </>
      )}
      <button
        onClick={() => r().setChart({ open: !chartOpen })}
        title={t('replay.chart.openTitle')}
      >
        {chartOpen ? t('replay.chart.hide') : t('replay.chart.open')}
      </button>
      <div className="hint">{t('replay.aids.keys')}</div>
    </Section>
  );
}
