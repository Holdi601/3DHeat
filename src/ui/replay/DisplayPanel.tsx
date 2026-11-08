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
import { tacticalColumns } from '../../render/tactical';
import { num, t } from '../../i18n';

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
  missing?: boolean;
}) {
  return (
    <div className="field scope-field" title={title}>
      <div className="label">
        <span>{label}</span>
        {missing && <span className="dim">{t('replay.aids.notInData')}</span>}
      </div>
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
        missing={!has.radar}
      />
      <ScopeSelect
        label={t('replay.aids.locks')}
        title={t('replay.aids.locksTitle')}
        value={aids.locks}
        onChange={(v) => set({ locks: v })}
        missing={!has.locks}
      />
      <ScopeSelect
        label={t('replay.aids.engagement')}
        title={t('replay.aids.engagementTitle')}
        value={aids.engagement}
        onChange={(v) => set({ engagement: v })}
        missing={!has.engagement}
      />
      <ScopeSelect
        label={t('replay.aids.sight')}
        title={t('replay.aids.sightTitle')}
        value={aids.pilotSight}
        onChange={(v) => set({ pilotSight: v })}
        missing={!has.sight}
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
        <Slider
          label={t('replay.aids.engagementRange')}
          value={aids.engagementRange / 1000}
          min={1}
          max={200}
          logarithmic
          onChange={(v) => set({ engagementRange: v * 1000 })}
          format={(v) => t('replay.km', { v: num(v, v < 10 ? 1 : 0) })}
        />
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
