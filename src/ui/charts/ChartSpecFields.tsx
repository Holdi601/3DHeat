/**
 * A chart's settings as form fields, the same wherever a chart is set up -
 * a sign on a volume (`ui/signs/SignEditor.tsx`) and a chart block of an
 * analysis document (`ui/notes/ChartEditor.tsx`): the kind, the measure and
 * its column, what it groups and splits by, the axes, the time, the bins,
 * what it compares, which rows it keeps, how it sorts.
 */

import { useMemo } from 'react';
import { CHART_KINDS, DIFF_MODES, SORT_MODES, normalizeSpec, type ChartKind, type ChartSpec, type DiffMode, type GroupKey, type MeasureKind, type SortMode } from '../../charts/types';
import { outcomeColumns } from '../../data/outcome';
import { t } from '../../i18n';
import { useStore } from '../../state/store';
import { NumberField, Select } from '../controls';
import { groupName } from '../signs/signText';

/** Measures a kind can show. */
export function measuresFor(kind: ChartKind): MeasureKind[] {
  if (kind === 'pie') return ['count', 'share'];
  if (kind === 'histogram' || kind === 'scatter' || kind === 'tiles') return ['count'];
  if (kind === 'stacked') return ['count', 'share', 'perMin'];
  return ['count', 'share', 'perMin', 'mean', 'median', 'pct', 'winShare', 'kd'];
}

/**
 * The fields for a spec. `onChange` gets the spec made whole again
 * (`normalizeSpec`). "Inside vs outside" is offered only where there is a
 * volume (`allowInout`).
 */
export function ChartSpecFields({ spec: sp, onChange, allowInout = true }: { spec: ChartSpec; onChange: (s: ChartSpec) => void; allowInout?: boolean }) {
  const dataset = useStore((s) => s.dataset);
  const cols = useMemo(() => {
    const attrs = dataset?.attrs ?? [];
    return {
      cats: attrs.filter((a) => a.kind === 'category' && a.categories && a.categories.length > 1).map((a) => a.name),
      nums: attrs.filter((a) => a.kind === 'number' && a.max > a.min).map((a) => a.name),
    };
  }, [dataset]);
  const groups = useMemo(() => {
    const out: { value: GroupKey; label: string }[] = [{ value: 'none', label: groupName('none') }];
    if (dataset?.teamId) out.push({ value: 'team', label: groupName('team') });
    if (dataset?.personId) out.push({ value: 'person', label: groupName('person') });
    if (dataset?.sessionId && dataset.sessionLabels.length > 1) out.push({ value: 'session', label: groupName('session') });
    for (const c of cols.cats) out.push({ value: `col:${c}`, label: c });
    return out;
  }, [dataset, cols]);
  const numOpts = useMemo(() => cols.nums.map((c) => ({ value: c, label: c })), [cols]);
  const teamOpts = useMemo(() => (dataset?.teamLabels ?? []).map((l) => ({ value: l, label: l })), [dataset]);
  const hasOutcome = !!outcomeColumns(dataset).round;
  const setSpec = (patch: Partial<ChartSpec>) => onChange(normalizeSpec({ ...sp, ...patch }));
  const kindHint = (k: ChartKind) => t(`charts.kind.${k}Hint`);
  return (
    <>
          <div className="field">
            <div className="label">
              <span>{t('charts.field.kind')}</span>
            </div>
            <div className="vsign-kinds">
              {CHART_KINDS.map((k) => (
                <button
                  key={k}
                  type="button"
                  className={k === sp.kind ? 'on' : ''}
                  title={kindHint(k)}
                  onClick={() => {
                    const ms = measuresFor(k);
                    const patch: Partial<ChartSpec> = { kind: k };
                    if (!ms.includes(sp.measure.kind)) patch.measure = { kind: ms[0] };
                    if ((k === 'histogram' || k === 'scatter') && !sp.x) patch.x = cols.nums[0];
                    if (k === 'scatter' && !sp.y) patch.y = cols.nums[1] ?? cols.nums[0];
                    if (k === 'matrix' && !sp.stack) patch.stack = 'team';
                    if (k === 'stacked' && !sp.stack) patch.stack = dataset?.teamId && sp.group !== 'team' ? 'team' : (groups[1]?.value ?? 'none');
                    setSpec(patch);
                  }}
                >
                  {t(`charts.kind.${k}`)}
                </button>
              ))}
            </div>
          </div>
          {sp.kind !== 'histogram' && sp.kind !== 'scatter' && sp.kind !== 'tiles' && (
            <Select<MeasureKind>
              label={t('charts.field.measure')}
              value={sp.measure.kind}
              options={measuresFor(sp.kind).map((m) => ({ value: m, label: t(`charts.measureName.${m}`) }))}
              onChange={(m) => m && setSpec({ measure: { ...sp.measure, kind: m, column: sp.measure.column ?? cols.nums[0] } })}
            />
          )}
          {(sp.measure.kind === 'mean' || sp.measure.kind === 'median' || sp.measure.kind === 'pct' || sp.kind === 'tiles') && numOpts.length > 0 && (
            <Select
              label={sp.kind === 'tiles' ? t('charts.field.tileColumn') : t('charts.field.column')}
              value={sp.measure.column ?? null}
              options={numOpts}
              allowEmpty={sp.kind === 'tiles'}
              onChange={(c) => setSpec({ measure: { ...sp.measure, column: c ?? undefined } })}
            />
          )}
          {sp.measure.kind === 'pct' && <NumberField label={t('charts.field.percentile')} value={sp.measure.p ?? 90} step={1} onChange={(p) => setSpec({ measure: { ...sp.measure, p } })} />}
          {(sp.kind === 'bar' || sp.kind === 'stacked' || sp.kind === 'pie' || sp.kind === 'matrix') && (
            <Select<GroupKey> label={t('charts.field.group')} value={sp.group} options={groups} onChange={(g) => g && setSpec({ group: g })} />
          )}
          {(sp.kind === 'stacked' || sp.kind === 'matrix') && (
            <Select<GroupKey> label={sp.kind === 'matrix' ? t('charts.field.rowsBy') : t('charts.field.stack')} value={sp.stack ?? 'none'} options={groups} onChange={(g) => g && setSpec({ stack: g })} />
          )}
          {(sp.kind === 'histogram' || sp.kind === 'scatter') && (
            <Select label={sp.kind === 'scatter' ? t('charts.field.x') : t('charts.field.column')} value={sp.x ?? null} options={numOpts} onChange={(c) => c && setSpec({ x: c })} />
          )}
          {sp.kind === 'scatter' && <Select label={t('charts.field.y')} value={sp.y ?? null} options={numOpts} onChange={(c) => c && setSpec({ y: c })} />}
          {(sp.kind === 'line' || sp.kind === 'area') && (
            <Select<'match' | 'real'>
              label={t('charts.field.time')}
              value={sp.time ?? 'match'}
              options={[
                { value: 'match', label: t('charts.time.match') },
                { value: 'real', label: t('charts.time.real') },
              ]}
              onChange={(v) => v && setSpec({ time: v })}
            />
          )}
          {(sp.kind === 'line' || sp.kind === 'area' || sp.kind === 'histogram' || sp.kind === 'scatter') && (
            <NumberField label={t('charts.field.bins')} value={sp.bins ?? (sp.kind === 'scatter' ? 32 : sp.kind === 'histogram' ? 24 : 40)} step={1} onChange={(b) => setSpec({ bins: b })} />
          )}
          {sp.kind !== 'pie' && sp.kind !== 'matrix' && sp.kind !== 'scatter' && (
            <Select<DiffMode>
              label={t('charts.field.diff')}
              value={sp.diff}
              options={DIFF_MODES.filter((d) => (d !== 'inout' || allowInout) && (d !== 'teams' || teamOpts.length >= 2) && (d !== 'outcome' || !!hasOutcome)).map((d) => ({ value: d, label: t(`charts.diffName.${d}`) }))}
              onChange={(d) => d && setSpec({ diff: d, ...(d === 'inout' && sp.measure.kind === 'count' ? { measure: { kind: 'share' as const } } : {}), ...(d === 'teams' && !sp.teams && teamOpts.length >= 2 ? { teams: [teamOpts[0].value, teamOpts[1].value] as [string, string] } : {}) })}
            />
          )}
          {sp.diff === 'teams' && sp.teams && (
            <div className="row">
              <Select label={t('charts.field.teamA')} value={sp.teams[0]} options={teamOpts} onChange={(v) => v && setSpec({ teams: [v, sp.teams![1]] })} />
              <Select label={t('charts.field.teamB')} value={sp.teams[1]} options={teamOpts} onChange={(v) => v && setSpec({ teams: [sp.teams![0], v] })} />
            </div>
          )}
          {!!hasOutcome && (
            <Select<'all' | 'won' | 'lost'>
              label={t('charts.field.outcome')}
              value={sp.filter?.outcome ?? 'all'}
              options={(['all', 'won', 'lost'] as const).map((o) => ({ value: o, label: t(`charts.outcome.${o}`) }))}
              onChange={(o) => setSpec({ filter: { ...sp.filter, outcome: o === 'won' || o === 'lost' ? o : undefined } })}
            />
          )}
          {cols.cats.length > 0 && (
            <Select
              label={t('charts.field.filterColumn')}
              value={sp.filter?.column ?? null}
              allowEmpty
              options={cols.cats.map((c) => ({ value: c, label: c }))}
              onChange={(c) => setSpec({ filter: { ...sp.filter, column: c ?? undefined, values: [] } })}
            />
          )}
          {sp.filter?.column && <FilterValues spec={sp} column={sp.filter.column} onChange={(values) => setSpec({ filter: { ...sp.filter, values } })} />}
          {(sp.kind === 'bar' || sp.kind === 'stacked' || sp.kind === 'pie' || sp.kind === 'matrix') && (
            <div className="row">
              <Select<SortMode> label={t('charts.field.sort')} value={sp.sort} options={SORT_MODES.map((m) => ({ value: m, label: t(`charts.sort.${m}`) }))} onChange={(m) => m && setSpec({ sort: m })} />
              <NumberField label={t('charts.field.top')} value={sp.top ?? (sp.kind === 'pie' ? 5 : sp.kind === 'matrix' ? 8 : 12)} step={1} onChange={(n) => setSpec({ top: sp.kind === 'pie' ? Math.min(5, n) : n })} />
            </div>
          )}
    </>
  );
}

function FilterValues({ spec, column, onChange }: { spec: ChartSpec; column: string; onChange: (v: string[]) => void }) {
  const dataset = useStore((s) => s.dataset);
  const cats = dataset?.attrs.find((a) => a.name === column)?.categories ?? [];
  const on = new Set(spec.filter?.values ?? []);
  return (
    <div className="vsign-values" role="group" aria-label={column}>
      {cats.slice(0, 60).map((c) => (
        <label key={c} className="check">
          <input
            type="checkbox"
            checked={on.has(c)}
            onChange={(e) => {
              const next = new Set(on);
              if (e.target.checked) next.add(c);
              else next.delete(c);
              onChange([...next]);
            }}
          />
          {c}
        </label>
      ))}
    </div>
  );
}

