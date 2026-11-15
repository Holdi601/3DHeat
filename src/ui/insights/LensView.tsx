/**
 * The knowledge lens in the Insights panel (`insights/lens.ts`): the picker of
 * the body of literature the findings are judged through, each finding's
 * doctrine and historical parallel with their references (expandable), and
 * the lens metrics computed over the same rows.
 */

import { useMemo } from 'react';
import { create } from 'zustand';
import { int, t } from '../../i18n';
import { fullCite, KB_BY_ID, kbStats, LENSES } from '../../insights/knowledge';
import { domainsOf, ofInsight, ofMetrics, readShows, type LensHit, type LensPick } from '../../insights/lens';
import type { Insight, InsightReport } from '../../insights/types';
import { Select } from '../controls';

/** Outside the panel, like the tab: kept while the sidebar is rebuilt. */
export const useLens = create<{ lens: LensPick }>(() => ({ lens: 'auto' }));

export function LensPicker() {
  const lens = useLens((s) => s.lens);
  const options = useMemo(() => (['auto', ...LENSES] as LensPick[]).map((v) => ({ value: v, label: t(`lens.pick.${v}`) })), []); // eslint-disable-line react-hooks/exhaustive-deps
  return <Select label={t('lens.title')} value={lens} options={options} onChange={(v) => useLens.setState({ lens: v ?? 'auto' })} />;
}

/** The references of knowledge entries, folded. */
export function References({ ids }: { ids: string[] }) {
  const refs = [...new Set(ids.flatMap((id) => KB_BY_ID.get(id)?.refs ?? []))];
  if (!refs.length) return null;
  return (
    <details className="ins-refs">
      <summary>
        {t('lens.refs')} ({int(refs.length)})
      </summary>
      <ol>
        {refs.map((r) => (
          <li key={r}>{fullCite(r)}</li>
        ))}
      </ol>
    </details>
  );
}

function Hit({ h, label }: { h: LensHit; label: string }) {
  const e = KB_BY_ID.get(h.id);
  if (!e) return null;
  return (
    <div className="ins-lens-hit">
      <div>
        <span className="ins-lens-label">{label}</span> <strong>{e.title}</strong>
        {e.when ? ` (${e.when})` : ''} <span className="hint">{h.cites}</span>
      </div>
      <div>{e.type === 'case' && e.outcome ? `${e.outcome} ${e.lesson}` : e.lesson}</div>
      <References ids={[h.id]} />
    </div>
  );
}

/** One finding through the lens: its literature and its parallel. */
export function InsightLens({ ins, report }: { ins: Insight; report: InsightReport }) {
  const lens = useLens((s) => s.lens);
  const rd = useMemo(() => {
    const s = ofInsight(ins);
    return s ? readShows(ins.id, s, lens, domainsOf(report), 1) : null;
  }, [ins, report, lens]);
  if (!rd) return null;
  const lit = rd.literature[0];
  const par = rd.parallels[0];
  if (!lit && !par) return <div className="hint">{t('lens.none')}</div>;
  return (
    <div className="ins-lens">
      {lit && <Hit h={lit} label={t('lens.literature')} />}
      {par && <Hit h={par} label={t('lens.parallel')} />}
    </div>
  );
}

/** The lens metrics of the report, each with its reading and its best literature. */
export function LensMetricsView({ report }: { report: InsightReport }) {
  const lens = useLens((s) => s.lens);
  const items = useMemo(() => {
    const domains = domainsOf(report);
    return [...ofMetrics(report.lens)].map(([id, s]) => ({ id, s, rd: readShows(id, s, lens, domains, 1) }));
  }, [report, lens]);
  const st = kbStats();
  return (
    <details className="ins-lens-metrics">
      <summary>
        {t('lens.metrics')} ({int(items.length)})
      </summary>
      {items.map(({ id, s, rd }) => (
        <div key={id} className="ins-lens-hit">
          <div>
            <strong>{t(`lens.metric.${id.slice(5)}`)}</strong>: {s.why}
          </div>
          {rd.literature[0] && <Hit h={rd.literature[0]} label={t('lens.literature')} />}
          {rd.parallels[0] && <Hit h={rd.parallels[0]} label={t('lens.parallel')} />}
        </div>
      ))}
      <div className="hint">{t('lens.kb', { entries: int(st.entries), refs: int(st.references) })}</div>
    </details>
  );
}
