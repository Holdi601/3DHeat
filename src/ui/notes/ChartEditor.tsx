/**
 * A document's chart block set up, with every kind of the chart module
 * (`charts/`): bars, stacked bars, line, area, histogram, donut, tiles,
 * matrix, scatter. Bars, line and tiles may be counted with a Compare
 * expression (`charts/exprSpec.ts`: a statistic, grouped, over which rows,
 * one side or two - checked against the loaded columns as it is typed and
 * counted in the Compare worker), or like every other kind with the chart
 * settings a volume's sign uses (`ChartSpecFields`), counted over all the
 * data, the rows the view shows, or the rows inside a volume (`charts/run.ts`).
 * Either way the block is drawn by the chart module, as the signs are.
 */

import { useMemo, useState } from 'react';
import { t, useLang } from '../../i18n';
import { runChart } from '../../charts/run';
import { localizeChart } from '../../charts/format';
import { CHART_KINDS, normalizeSpec, type ChartKind, type ChartSpec } from '../../charts/types';
import type { ChartBlock } from '../../charts/block';
import { useVolumeStore } from '../../volumes/store';
import { ChartSpecFields } from '../charts/ChartSpecFields';
import { specTitle } from '../signs/signText';
import { exprChartProblem, computeExprChart } from '../../charts/exprRun';
import { DEFAULT_EXPR_CHART, type ExprChartGroupBy, type ExprChartSpec } from '../../charts/exprSpec';
import { useStore } from '../../state/store';
import { currentScope } from '../../volumes/scope';
import { useNotes } from '../../notes/store';
import type { DocBlock } from '../../notes/model';
import { useEngine } from '../EngineContext';
import { Dialog, toast } from '../shell/kit';
import { stopViewKeys } from './keys';
import { insertBlock } from './actions';

const MEASURES = ['count()', 'kills()', 'deaths()', 'kills() / deaths()', 'presence()', 'players()', 'avg(speed)'];

/** Where a module chart block's rows come from: all the data or the rows the view shows, inside a volume or not. */
interface ModuleSource {
  kind: 'data' | 'volume';
  rows: 'all' | 'view';
  volumeId?: string;
  volumeName?: string;
  dataset: string;
  scope: string;
}

type ModuleBlock = Extract<DocBlock, { type: 'chartBlock' }>['block'];
const EXPR_KINDS: ChartKind[] = ['bar', 'line', 'tiles'];

/** Counts a module chart over its rows (`charts/run.ts`), its labels said in words. */
async function countModule(spec: ChartSpec, rows: 'all' | 'view', volumeId: string | null, playhead: number) {
  const ds = useStore.getState().dataset!;
  const volume = volumeId ? (useVolumeStore.getState().volumes.find((v) => v.id === volumeId) ?? null) : null;
  const data = await runChart(ds, spec, { scope: rows === 'view' ? currentScope(useStore.getState(), playhead) : null, volume });
  return { data: localizeChart(data), volume };
}

/** A module chart block as a document keeps it: the shared block (`charts/block.ts`) and where its rows came from. */
function moduleBlock(spec: ChartSpec, title: string, data: ChartBlock['data'], rows: 'all' | 'view', volume: { id: string; name: string } | null, dataset: string): ModuleBlock {
  const source: ModuleSource = {
    kind: volume ? 'volume' : 'data',
    rows,
    ...(volume ? { volumeId: volume.id, volumeName: volume.name } : {}),
    dataset,
    scope: rows === 'view' ? t('charts.doc.rowsView') : t('charts.doc.rowsAll'),
  };
  const block = { schema: 'heat3d.chartBlock/1', type: 'chart', id: `c${Date.now().toString(36)}`, title, spec, source, data, at: Date.now() };
  return block as unknown as ModuleBlock;
}

/** Counts a chart block again and keeps its numbers in the document. */
export async function refreshChart(docId: string, blockId: string, playhead: number): Promise<void> {
  const ds = useStore.getState().dataset;
  const doc = useNotes.getState().book.docs.find((d) => d.id === docId);
  const b = doc?.blocks[blockId];
  if (ds && doc && b?.type === 'chartBlock') {
    // A module chart (made here or sent from a sign): over its volume while it is there, else over the data.
    const src = (b.block.source ?? {}) as Partial<ModuleSource>;
    const spec = normalizeSpec(b.block.spec as Partial<ChartSpec>);
    const rows = src.rows === 'view' ? 'view' : 'all';
    try {
      const { data, volume } = await countModule(spec, rows, src.volumeId ?? null, playhead);
      const now = useNotes.getState().book.docs.find((d) => d.id === docId);
      if (!now) return;
      const block = { ...moduleBlock(spec, b.block.title, data, rows, volume, ds.name), id: b.block.id ?? blockId };
      useNotes.getState().updateDoc(docId, { blocks: { ...now.blocks, [blockId]: { ...b, block } } });
      if (src.volumeId && !volume) toast(t('charts.doc.volumeGone'), 'info');
    } catch (e) {
      toast(t('notes.chart.failed', { message: String(e) }), 'bad', 4000);
    }
    return;
  }
  if (!ds || !doc || !b || b.type !== 'chart') {
    if (!ds) toast(t('notes.chart.noData'), 'bad');
    return;
  }
  try {
    const data = await computeExprChart(ds, b.spec, currentScope(useStore.getState(), playhead));
    const now = useNotes.getState().book.docs.find((d) => d.id === docId);
    if (!now) return;
    useNotes.getState().updateDoc(docId, { blocks: { ...now.blocks, [blockId]: { ...b, data } } });
  } catch (e) {
    const err = e as { key?: string; values?: Record<string, string | number> };
    toast(err.key ? t(`versus.err.${err.key}`, err.values) : t('notes.chart.failed', { message: String(e) }), 'bad', 4000);
  }
}

const groupValue = (g: ExprChartGroupBy) => (!g ? 'none' : g.by === 'column' ? `col:${g.column}` : g.by);

export function ChartEditor({ docId, blockId, onClose }: { docId: string; blockId: string | null; onClose: () => void }) {
  useLang();
  const engine = useEngine();
  const dataset = useStore((s) => s.dataset);
  const existing = useNotes((s) => {
    const b = blockId ? s.book.docs.find((d) => d.id === docId)?.blocks[blockId] : undefined;
    return b?.type === 'chart' ? b : undefined;
  });
  const [spec, setSpec] = useState<ExprChartSpec>(() => structuredClone(existing?.spec ?? DEFAULT_EXPR_CHART));
  const [busy, setBusy] = useState(false);
  // The chart module's settings: every kind, and bars, line and tiles when not counted by an expression.
  const existingModule = useNotes((s) => {
    const b = blockId ? s.book.docs.find((d) => d.id === docId)?.blocks[blockId] : undefined;
    return b?.type === 'chartBlock' ? b : undefined;
  });
  const volumes = useVolumeStore((s) => s.volumes);
  const msrc = (existingModule?.block.source ?? {}) as Partial<ModuleSource>;
  const [useModule, setUseModule] = useState(!!existingModule);
  const [mspec, setMspec] = useState<ChartSpec>(() => normalizeSpec((existingModule?.block.spec as Partial<ChartSpec> | undefined) ?? { kind: 'bar', group: dataset?.teamId ? 'team' : 'none' }));
  const [mtitle, setMtitle] = useState(existingModule?.block.title ?? '');
  const [rows, setRows] = useState<'all' | 'view'>(msrc.rows === 'view' ? 'view' : 'all');
  const [volumeId, setVolumeId] = useState<string | null>(msrc.volumeId || null);
  const kind: ChartKind = useModule ? mspec.kind : EXPR_KINDS.includes(spec.kind as ChartKind) ? (spec.kind as ChartKind) : 'bar';
  const nums = useMemo(() => (dataset?.attrs ?? []).filter((a) => a.kind === 'number' && a.max > a.min).map((a) => a.name), [dataset]);
  const pickKind = (k: ChartKind) => {
    if (!useModule && EXPR_KINDS.includes(k)) {
      setSpec((s) => ({ ...s, kind: k }));
      return;
    }
    setUseModule(true);
    setMspec(normalizeSpec({ ...mspec, kind: k, ...(k === 'histogram' || k === 'scatter' ? { x: mspec.x ?? nums[0] } : {}), ...(k === 'scatter' ? { y: mspec.y ?? nums[1] ?? nums[0] } : {}), ...(k === 'matrix' || k === 'stacked' ? { stack: mspec.stack ?? 'team' } : {}) }));
  };
  const columns = useMemo(() => {
    if (!dataset) return [] as string[];
    const out: string[] = [];
    if (dataset.teamId) out.push('team');
    if (dataset.personId) out.push('person');
    if (dataset.sessionId) out.push('match');
    for (const a of dataset.attrs) if (a.kind === 'category' && a.categories && a.categories.length > 1) out.push(a.name);
    return out;
  }, [dataset]);
  const problem = useMemo(() => (dataset ? exprChartProblem(dataset, spec) : null), [dataset, spec]);
  const patch = (p: Partial<ExprChartSpec>) => setSpec((s) => ({ ...s, ...p }));
  const setGroup = (v: string) =>
    patch({ groupBy: v === 'none' ? null : v === 'time' ? { by: 'time', bins: 20 } : v === 'match' || v === 'round' ? { by: v } : { by: 'column', column: v.slice(4), top: 8 } });

  const saveModule = async () => {
    if (!dataset || !useNotes.getState().book.docs.some((d) => d.id === docId)) return onClose();
    setBusy(true);
    try {
      const { data, volume } = await countModule(mspec, rows, volumeId, engine?.live.playhead ?? 0);
      const block = moduleBlock(mspec, mtitle.trim() || specTitle(mspec), data, rows, volume, dataset.name);
      const now = useNotes.getState().book.docs.find((d) => d.id === docId);
      // An expression chart made a module chart keeps its place in the text.
      if (blockId && now) useNotes.getState().updateDoc(docId, { blocks: { ...now.blocks, [blockId]: { id: blockId, type: 'chartBlock', block } } });
      else insertBlock({ type: 'chartBlock', block }, undefined, docId);
    } catch (e) {
      toast(t('notes.chart.failed', { message: String(e) }), 'bad', 4000);
    }
    setBusy(false);
    onClose();
  };

  const save = async () => {
    if (useModule) return saveModule();
    const s = useNotes.getState();
    const doc = s.book.docs.find((d) => d.id === docId);
    if (!doc) return onClose();
    setBusy(true);
    let id = blockId;
    if (id) s.updateDoc(docId, { blocks: { ...doc.blocks, [id]: { ...(doc.blocks[id] as DocBlock & { type: 'chart' }), spec } } });
    else {
      id = insertBlock({ type: 'chart', spec, data: null }, undefined, docId);
    }
    if (dataset && !problem && id) await refreshChart(docId, id, engine?.live.playhead ?? 0);
    setBusy(false);
    onClose();
  };

  return (
    <Dialog title={blockId ? t('notes.chart.editTitle') : t('notes.chart.newTitle')} onClose={onClose} className="chart-editor">
      <div className="note-editor-body" onKeyDown={stopViewKeys}>
        {!useModule && (
          <label className="field-line">
            <span>{t('notes.chart.title')}</span>
            <input type="text" value={spec.title ?? ''} onChange={(e) => patch({ title: e.target.value })} aria-label={t('notes.chart.title')} />
          </label>
        )}
        <div className="field-line">
          <span>{t('notes.chart.kind')}</span>
          <div className="vsign-kinds" role="group" aria-label={t('notes.chart.kind')}>
            {CHART_KINDS.map((k) => (
              <button key={k} type="button" className={k === kind ? 'on' : ''} title={t(`charts.kind.${k}Hint`)} onClick={() => pickKind(k)}>
                {t(`charts.kind.${k}`)}
              </button>
            ))}
          </div>
        </div>
        {EXPR_KINDS.includes(kind) && (
          <div className="field-line">
            <span>{t('charts.doc.countWith')}</span>
            <div className="seg">
              <button type="button" className={useModule ? '' : 'on'} title={t('charts.doc.exprTitle')} onClick={() => (setUseModule(false), setSpec((s) => ({ ...s, kind })))}>
                {t('charts.doc.expr')}
              </button>
              <button type="button" className={useModule ? 'on' : ''} title={t('charts.doc.moduleTitle')} onClick={() => (setUseModule(true), setMspec(normalizeSpec({ ...mspec, kind })))}>
                {t('charts.doc.module')}
              </button>
            </div>
          </div>
        )}
        {useModule && (
          <div className="vsign-form chart-module-form">
            <label className="field-line">
              <span>{t('notes.chart.title')}</span>
              <input type="text" value={mtitle} placeholder={specTitle(mspec)} onChange={(e) => setMtitle(e.target.value)} aria-label={t('notes.chart.title')} />
            </label>
            <ChartSpecFields spec={mspec} onChange={setMspec} allowInout={!!volumeId} />
            <label className="field-line">
              <span>{t('charts.doc.rows')}</span>
              <select value={rows} onChange={(e) => setRows(e.target.value === 'view' ? 'view' : 'all')} aria-label={t('charts.doc.rows')}>
                <option value="all">{t('charts.doc.rowsAll')}</option>
                <option value="view">{t('charts.doc.rowsView')}</option>
              </select>
            </label>
            <label className="field-line">
              <span>{t('charts.doc.volume')}</span>
              <select value={volumeId ?? ''} onChange={(e) => setVolumeId(e.target.value || null)} aria-label={t('charts.doc.volume')}>
                <option value="">{t('charts.doc.volumeNone')}</option>
                {volumes.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name}
                  </option>
                ))}
              </select>
            </label>
          </div>
        )}
        {!useModule && (
          <>
        <label className="field-line">
          <span>{t('notes.chart.measure')}</span>
          <input type="text" list="notes-measures" value={spec.measure.expr} onChange={(e) => patch({ measure: { ...spec.measure, expr: e.target.value } })} aria-label={t('notes.chart.measure')} title={t('notes.chart.measureTitle')} />
          <datalist id="notes-measures">
            {MEASURES.map((m) => (
              <option key={m} value={m} />
            ))}
          </datalist>
        </label>
        <label className="field-line">
          <span>{t('notes.chart.measureName')}</span>
          <input type="text" value={spec.measure.name ?? ''} onChange={(e) => patch({ measure: { ...spec.measure, name: e.target.value || undefined } })} aria-label={t('notes.chart.measureName')} />
        </label>
        <label className="field-line">
          <span>{t('notes.chart.groupBy')}</span>
          <select value={groupValue(spec.groupBy)} onChange={(e) => setGroup(e.target.value)} aria-label={t('notes.chart.groupBy')}>
            <option value="none">{t('notes.chart.groupNone')}</option>
            {columns.map((c) => (
              <option key={c} value={`col:${c}`}>
                {c}
              </option>
            ))}
            <option value="time">{t('notes.chart.groupTime')}</option>
            {dataset?.sessionId && <option value="match">{t('notes.chart.groupMatch')}</option>}
            <option value="round">{t('notes.chart.groupRound')}</option>
          </select>
        </label>
        <label className="field-line">
          <span>{t('notes.chart.filter')}</span>
          <input type="text" value={spec.filter ?? ''} placeholder='team == "Allies"' onChange={(e) => patch({ filter: e.target.value || undefined })} aria-label={t('notes.chart.filter')} title={t('notes.chart.filterTitle')} />
        </label>
        <label className="check">
          <input type="checkbox" checked={!!spec.diff} onChange={(e) => patch({ diff: e.target.checked ? { a: { label: 'A', filter: '' }, b: { label: 'B', filter: '' } } : null })} /> {t('notes.chart.diff')}
        </label>
        {spec.diff &&
          (['a', 'b'] as const).map((k) => (
            <div className="field-line" key={k}>
              <input type="text" className="narrow" value={spec.diff![k].label} onChange={(e) => patch({ diff: { ...spec.diff!, [k]: { ...spec.diff![k], label: e.target.value } } })} aria-label={t('notes.chart.sideLabel')} />
              <input type="text" value={spec.diff![k].filter} placeholder={t('notes.chart.sideFilter')} onChange={(e) => patch({ diff: { ...spec.diff!, [k]: { ...spec.diff![k], filter: e.target.value } } })} aria-label={t('notes.chart.sideFilter')} />
            </div>
          ))}
        <label className="field-line">
          <span>{t('notes.chart.scope')}</span>
          <select value={spec.scope ?? 'all'} onChange={(e) => patch({ scope: e.target.value as 'all' | 'view' })} aria-label={t('notes.chart.scope')}>
            <option value="all">{t('notes.chart.scopeAll')}</option>
            <option value="view">{t('notes.chart.scopeView')}</option>
          </select>
        </label>
          </>
        )}
        {!useModule && problem && <div className="hint" style={{ color: 'var(--warn)' }}>{t(problem.key, problem.values)}</div>}
        {!dataset && <div className="hint">{t('notes.chart.noData')}</div>}
      </div>
      <div className="dialog-actions">
        <button type="button" onClick={onClose}>
          {t('notes.cancel')}
        </button>
        <button type="button" className="primary" disabled={busy || (useModule ? !dataset : !spec.measure.expr.trim())} onClick={() => void save()}>
          {busy ? t('notes.chart.counting') : t('notes.save')}
        </button>
      </div>
    </Dialog>
  );
}
