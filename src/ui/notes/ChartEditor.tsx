/**
 * A document's chart block set up: what is counted (a Compare statistic),
 * grouped how, over which rows, one side or two - the chart spec of
 * `charts/spec.ts` - checked against the loaded columns as it is typed, and
 * counted when saved (in the Compare worker, `charts/run.ts`).
 */

import { useMemo, useState } from 'react';
import { t, useLang } from '../../i18n';
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

/** Counts a chart block again and keeps its numbers in the document. */
export async function refreshChart(docId: string, blockId: string, playhead: number): Promise<void> {
  const ds = useStore.getState().dataset;
  const doc = useNotes.getState().book.docs.find((d) => d.id === docId);
  const b = doc?.blocks[blockId];
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

  const save = async () => {
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
        <label className="field-line">
          <span>{t('notes.chart.title')}</span>
          <input type="text" value={spec.title ?? ''} onChange={(e) => patch({ title: e.target.value })} aria-label={t('notes.chart.title')} />
        </label>
        <label className="field-line">
          <span>{t('notes.chart.kind')}</span>
          <select value={spec.kind} onChange={(e) => patch({ kind: e.target.value })} aria-label={t('notes.chart.kind')}>
            <option value="bar">{t('notes.chart.kindBar')}</option>
            <option value="line">{t('notes.chart.kindLine')}</option>
            <option value="tiles">{t('notes.chart.kindTiles')}</option>
          </select>
        </label>
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
        {problem && <div className="hint" style={{ color: 'var(--warn)' }}>{t(problem.key, problem.values)}</div>}
        {!dataset && <div className="hint">{t('notes.chart.noData')}</div>}
      </div>
      <div className="dialog-actions">
        <button type="button" onClick={onClose}>
          {t('notes.cancel')}
        </button>
        <button type="button" className="primary" disabled={busy || !spec.measure.expr.trim()} onClick={() => void save()}>
          {busy ? t('notes.chart.counting') : t('notes.save')}
        </button>
      </div>
    </Dialog>
  );
}
