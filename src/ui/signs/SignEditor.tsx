/**
 * The chart panel of a volume, opened from its button in the world: the
 * volume's signs, "Add chart", and the chosen sign's chart - its kind, what
 * it measures, what it groups by, what it compares, which rows it keeps, how
 * it sorts - and how it stands in the world. Every change shows on the sign
 * at once; the rows are always those inside this volume, under the view's
 * filters and time window.
 */

import { useMemo } from 'react';
import { CHART_KINDS, DIFF_MODES, SORT_MODES, normalizeSpec, type ChartKind, type ChartSpec, type DiffMode, type GroupKey, type MeasureKind, type SortMode } from '../../charts/types';
import { sendChartBlock, type ChartBlock } from '../../charts/block';
import { num, t } from '../../i18n';
import { useStore } from '../../state/store';
import { volumeBounds, type Volume } from '../../volumes/volume';
import { outcomeColumns } from '../../data/outcome';
import type { Engine } from '../../render/engine';
import { useEngine } from '../EngineContext';
import { signClient } from '../../volumes/signs/client';
import type { Sign } from '../../volumes/signs/sign';
import { useSignStore } from '../../volumes/signs/store';
import { Check, NumberField, Select } from '../controls';
import { toast } from '../shell/kit';
import { groupName, signTitle } from './signText';
import { addChartTo } from './addChart';

/** Measures a kind can show. */
function measuresFor(kind: ChartKind): MeasureKind[] {
  if (kind === 'pie') return ['count', 'share'];
  if (kind === 'histogram' || kind === 'scatter' || kind === 'tiles') return ['count'];
  if (kind === 'stacked') return ['count', 'share', 'perMin'];
  return ['count', 'share', 'perMin', 'mean', 'median', 'pct', 'winShare', 'kd'];
}

/** Send a sign to the analysis documents as a chart block; without documents, copy it. */
export async function sendSign(sign: Sign, volume: Volume): Promise<void> {
  const d = signClient.results.get(sign.id);
  if (!d) return;
  const ds = useStore.getState().dataset;
  const block: ChartBlock = {
    schema: 'heat3d.chartBlock/1',
    type: 'chart',
    id: `c${Date.now().toString(36)}`,
    title: signTitle(sign),
    spec: sign.spec,
    source: { kind: 'volume', volumeId: volume.id, volumeName: volume.name, dataset: ds?.name ?? '', scope: scopeText() },
    data: structuredClone(d),
    at: Date.now(),
  };
  if (await sendChartBlock(block)) {
    toast(t('charts.send.sent'));
    return;
  }
  try {
    await navigator.clipboard.writeText(JSON.stringify(block));
    toast(t('charts.send.copied'));
  } catch {
    toast(t('charts.send.failed'), 'bad');
  }
}

function scopeText(): string {
  const s = useStore.getState();
  const parts: string[] = [];
  if (s.timeline.mode !== 'all') parts.push(t('charts.scope.window', { s: num(s.timeline.playhead, 0) }));
  if (s.filters.length) parts.push(t('charts.scope.filters', { n: s.filters.length }));
  return parts.join(', ');
}

export function SignEditor({ volume }: { volume: Volume }) {
  const engine = useEngine();
  const dataset = useStore((s) => s.dataset);
  const editor = useSignStore((s) => s.editor);
  const signs = useSignStore((s) => s.signs);
  const st = useSignStore.getState();
  const mine = signs.filter((s) => s.volumeId === volume.id);
  const sign = mine.find((s) => s.id === editor?.signId) ?? null;

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

  const setSpec = (patch: Partial<ChartSpec>) => {
    if (!sign) return;
    st.update(sign.id, { spec: normalizeSpec({ ...sign.spec, ...patch }) });
  };
  const add = () => addChartTo(volume.id);

  const sp = sign?.spec;
  const kindHint = (k: ChartKind) => t(`charts.kind.${k}Hint`);
  const rows = signClient.rowsInside[volume.id];
  const result = sign ? signClient.results.get(sign.id) : undefined;

  return (
    <div className="vsign-panel" role="dialog" aria-label={t('charts.panel.title', { name: volume.name })}>
      <div className="vsign-panel-head">
        <span className="vsign-swatch" style={{ ['--vol' as string]: volume.color }} />
        <strong>{t('charts.panel.title', { name: volume.name })}</strong>
        <button type="button" className="icon" title={t('charts.panel.close')} onClick={() => st.closeEditor()}>
          ✕
        </button>
      </div>
      <div className="hint">{rows !== undefined ? t('charts.panel.rows', { n: num(rows, 0) }) : t('charts.panel.rowsWait')}</div>
      <div className="vsign-list">
        {mine.map((s) => (
          <div key={s.id} className={`vsign-item${s.id === sign?.id ? ' on' : ''}`}>
            <button type="button" className="vsign-item-name" onClick={() => st.openEditor(volume.id, s.id)} title={t('charts.panel.editTitle')}>
              {signTitle(s)}
            </button>
            <button type="button" title={t('charts.sign.removeTitle')} onClick={() => st.remove(s.id)}>
              ✕
            </button>
          </div>
        ))}
        <button type="button" className="primary vsign-add" onClick={add} title={t('charts.panel.addTitle')}>
          {t('charts.panel.add')}
        </button>
      </div>
      {sign && sp && (
        <div className="vsign-form">
          <label className="field">
            <div className="label">
              <span>{t('charts.field.title')}</span>
            </div>
            <input type="text" value={sign.title} placeholder={signTitle({ ...sign, title: '' })} onChange={(e) => st.update(sign.id, { title: e.target.value })} />
          </label>
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
              options={DIFF_MODES.filter((d) => (d !== 'teams' || teamOpts.length >= 2) && (d !== 'outcome' || !!signClientMetaWon())).map((d) => ({ value: d, label: t(`charts.diffName.${d}`) }))}
              onChange={(d) => d && setSpec({ diff: d, ...(d === 'inout' && sp.measure.kind === 'count' ? { measure: { kind: 'share' as const } } : {}), ...(d === 'teams' && !sp.teams && teamOpts.length >= 2 ? { teams: [teamOpts[0].value, teamOpts[1].value] as [string, string] } : {}) })}
            />
          )}
          {sp.diff === 'teams' && sp.teams && (
            <div className="row">
              <Select label={t('charts.field.teamA')} value={sp.teams[0]} options={teamOpts} onChange={(v) => v && setSpec({ teams: [v, sp.teams![1]] })} />
              <Select label={t('charts.field.teamB')} value={sp.teams[1]} options={teamOpts} onChange={(v) => v && setSpec({ teams: [sp.teams![0], v] })} />
            </div>
          )}
          {!!signClientMetaWon() && (
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
          {sp.filter?.column && <FilterValues sign={sign} column={sp.filter.column} onChange={(values) => setSpec({ filter: { ...sp.filter, values } })} />}
          {(sp.kind === 'bar' || sp.kind === 'stacked' || sp.kind === 'pie' || sp.kind === 'matrix') && (
            <div className="row">
              <Select<SortMode> label={t('charts.field.sort')} value={sp.sort} options={SORT_MODES.map((m) => ({ value: m, label: t(`charts.sort.${m}`) }))} onChange={(m) => m && setSpec({ sort: m })} />
              <NumberField label={t('charts.field.top')} value={sp.top ?? (sp.kind === 'pie' ? 5 : sp.kind === 'matrix' ? 8 : 12)} step={1} onChange={(n) => setSpec({ top: sp.kind === 'pie' ? Math.min(5, n) : n })} />
            </div>
          )}
          <div className="field">
            <div className="label">
              <span>{t('charts.field.stand')}</span>
            </div>
            <div className="seg">
              {(['billboard', 'fixed'] as const).map((m) => (
                <button key={m} type="button" className={sign.mode === m ? 'on' : ''} title={t(`charts.mode.${m}Title`)} onClick={() => st.update(sign.id, { mode: m, ...(m === 'fixed' ? { yaw: faceCameraYaw(engine, volume) } : {}) })}>
                  {t(`charts.mode.${m}`)}
                </button>
              ))}
            </div>
          </div>
          {sign.mode === 'fixed' && (
            <button type="button" onClick={() => st.update(sign.id, { yaw: faceCameraYaw(engine, volume) })} title={t('charts.mode.faceTitle')}>
              {t('charts.mode.face')}
            </button>
          )}
          <Check label={t('charts.field.upToNow')} checked={sign.upToNow} title={t('charts.field.upToNowTitle')} onChange={(v) => st.update(sign.id, { upToNow: v })} />
          <div className="row" style={{ gap: 4 }}>
            <button type="button" onClick={() => void sendSign(sign, volume)} title={t('charts.sign.sendTitle')} disabled={!result}>
              {t('charts.send.button')}
            </button>
            <button type="button" onClick={() => st.add(volume.id, sign.spec, { mode: sign.mode, yaw: sign.yaw, scale: sign.scale, upToNow: sign.upToNow })} title={t('charts.panel.duplicateTitle')}>
              {t('charts.panel.duplicate')}
            </button>
          </div>
          {result && <div className="hint">{t('charts.panel.built', { n: num(result.rows, 0) })}</div>}
        </div>
      )}
    </div>
  );
}

function signClientMetaWon(): boolean {
  return !!outcomeColumns(useStore.getState().dataset).round;
}

/** The heading a board turns to so it faces the camera. */
export function faceCameraYaw(engine: Engine | null, v: Volume): number {
  const c = engine?.cameraPose().position;
  if (!c) return 0;
  const b = volumeBounds(v);
  return Math.atan2(c.x - (b.min[0] + b.max[0]) / 2, c.z - (b.min[2] + b.max[2]) / 2);
}

function FilterValues({ sign, column, onChange }: { sign: Sign; column: string; onChange: (v: string[]) => void }) {
  const dataset = useStore((s) => s.dataset);
  const cats = dataset?.attrs.find((a) => a.name === column)?.categories ?? [];
  const on = new Set(sign.spec.filter?.values ?? []);
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

