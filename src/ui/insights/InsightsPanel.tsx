/**
 * Insights: what the built-in detectors (`src/insights`) found in the data,
 * strongest first, one sentence each. A click shows it - the camera on the
 * place, the filters that isolate it - and opens its numbers: the effect with
 * its interval, the test, the counts. Counted in a worker when the panel is
 * first opened on a dataset, and again on request; a change of filters or
 * data marks the list as stale rather than recounting under the user's hands.
 */

import { useEffect, useMemo, useRef } from 'react';
import { CANON } from '../../data/canonical';
import { insightText, labelOf } from './say';
import { showInsight, volumeFor } from '../../insights/apply';
import { analysisScope, runInsights } from '../../insights/run';
import { useInsights } from '../../insights/store';
import type { Insight } from '../../insights/types';
import { int, num, t, useLang } from '../../i18n';
import { useStore } from '../../state/store';
import { currentScope, scopeKey } from '../../volumes/scope';
import { Section } from '../controls';
import { useEngine } from '../EngineContext';
import './insights.css';

export function InsightsPanel() {
  useLang();
  const dataset = useStore((s) => s.dataset);
  if (!dataset) return null;
  return (
    <Section title={t('insights.title')}>
      <InsightsBody />
    </Section>
  );
}

function useAnalysisKey(): string {
  const dataset = useStore((s) => s.dataset);
  const filters = useStore((s) => s.filters);
  const teamVisibility = useStore((s) => s.teamVisibility);
  const mode = useStore((s) => s.mode);
  const session = useStore((s) => s.team.session);
  return useMemo(
    () => (dataset ? `${dataset.id}|${scopeKey(analysisScope(currentScope(useStore.getState(), 0)))}` : ''),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [dataset, filters, teamVisibility, mode, session],
  );
}

function InsightsBody() {
  const engine = useEngine();
  const st = useInsights();
  const key = useAnalysisKey();
  const ctl = useRef<AbortController | null>(null);

  const run = () => {
    const s = useStore.getState();
    const ds = s.dataset;
    if (!ds) return;
    ctl.current?.abort();
    const c = new AbortController();
    ctl.current = c;
    const k = key;
    useInsights.getState().set({ running: true, progress: 0, error: null });
    runInsights(ds, currentScope(s, 0), s.level, { signal: c.signal, onProgress: (f) => useInsights.getState().set({ progress: f }) })
      .then((report) => useInsights.getState().set({ report, key: k, running: false, selected: null }))
      .catch((e) => {
        if ((e as Error).name !== 'AbortError') useInsights.getState().set({ running: false, error: String((e as Error).message ?? e) });
      });
  };

  // First opened on this dataset: count. A new dataset drops the old report.
  const dsId = key.split('|')[0];
  useEffect(() => {
    const cur = useInsights.getState();
    if (cur.key && cur.key.split('|')[0] !== dsId) cur.set({ report: null, key: null, selected: null, before: null });
    if (!useInsights.getState().report && !useInsights.getState().running) run();
    return () => ctl.current?.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dsId]);

  const r = st.report;
  const stale = !!r && st.key !== key && st.before === null;
  const pick = (ins: Insight) => {
    const s = useInsights.getState();
    const before = s.before ?? useStore.getState().filters;
    s.set({ selected: ins.id, before });
    showInsight(ins, engine, before);
  };
  const restore = () => {
    const s = useInsights.getState();
    if (s.before) useStore.getState().setFilters(s.before);
    s.set({ before: null, selected: null });
  };
  const copy = () => r && navigator.clipboard?.writeText(JSON.stringify(r, null, 1)).catch(() => undefined);

  return (
    <div className="ins">
      <div className="row wrap" style={{ gap: 6 }}>
        <button onClick={run} disabled={st.running} title={t('insights.runTitle')}>
          {r ? t('insights.rerun') : t('insights.run')}
        </button>
        {st.before && (
          <button onClick={restore} title={t('insights.resetTitle')}>
            {t('insights.reset')}
          </button>
        )}
        {r && (
          <button className="link" onClick={copy} title={t('insights.copyTitle')}>
            {t('insights.copy')}
          </button>
        )}
      </div>
      {st.running && <div className="hint">{t('insights.counting', { pct: `${num(st.progress * 100, 0)}%` })}</div>}
      {st.error && <div className="hint" style={{ color: 'var(--warm)' }}>{t('insights.error', { error: st.error })}</div>}
      {stale && !st.running && <div className="hint" style={{ color: 'var(--warm)' }}>{t('insights.stale')}</div>}
      {r && (
        <>
          <div className="hint">
            {t('insights.summary', { n: int(r.insights.length), rows: int(r.dataset.shownRows), matches: int(r.dataset.matches) })}
          </div>
          {r.insights.length === 0 && <div className="hint">{t('insights.none', { fdr: `${num(r.fdr * 100)}%` })}</div>}
          <ol className="ins-list">
            {r.insights.map((ins) => (
              <InsightRow key={ins.id} ins={ins} samples={r.dataset.exposure === 'samples'} open={st.selected === ins.id} onPick={() => pick(ins)} />
            ))}
          </ol>
          <Skipped />
        </>
      )}
    </div>
  );
}

function InsightRow({ ins, samples, open, onPick }: { ins: Insight; samples: boolean; open: boolean; onPick: () => void }) {
  const text = insightText(ins, samples);
  const c = ins.confidence;
  return (
    <li className={`ins-item${open ? ' open' : ''}`}>
      <button className="ins-head" onClick={onPick} title={t('insights.showTitle')}>
        <span className="ins-bar" aria-hidden>
          <span style={{ width: `${Math.round(ins.strength * 100)}%` }} />
        </span>
        <span className="ins-text">{text}</span>
        <span className="ins-tags">
          <span className={`ins-conf ${c.level}`}>{t(`insights.conf.${c.level}`)}</span>
          <span>{t(`insights.det.${ins.detector}`)}</span>
          {ins.subject.vehicleClass && <span>{labelOf(CANON.vehicleClass, ins.subject.vehicleClass)}</span>}
        </span>
      </button>
      {open && <Details ins={ins} />}
    </li>
  );
}

const fmtRatio = (v: number | null) => (v !== null && Number.isFinite(v) ? `${num(v, v >= 10 ? 1 : 2)}×` : '∞');
const fmtP = (p: number) => (p <= 0 ? '< 1e-300' : p < 1e-4 ? p.toExponential(1) : num(p, p < 0.01 ? 4 : 3));

function Details({ ins }: { ins: Insight }) {
  const e = ins.effect;
  const c = ins.confidence;
  return (
    <div className="ins-details">
      <div>{t('insights.effect', { value: fmtRatio(e.value), raw: fmtRatio(e.raw), lo: fmtRatio(e.lo), hi: fmtRatio(e.hi) })}</div>
      <div>{t('insights.test', { p: fmtP(c.p), q: fmtP(c.q), tests: int(c.tests) })}</div>
      <dl>
        {Object.entries(ins.evidence).map(([k, v]) => (
          <div key={k}>
            <dt>{k}</dt>
            <dd>{typeof v === 'number' ? (Number.isInteger(v) ? int(v) : num(v, 2)) : v}</dd>
          </div>
        ))}
      </dl>
      {ins.place && (
        <button onClick={() => volumeFor(ins)} title={t('insights.volumeTitle')}>
          {t('insights.volume')}
        </button>
      )}
    </div>
  );
}

function Skipped() {
  const r = useInsights((s) => s.report);
  const off = r?.detectors.filter((d) => !d.ran) ?? [];
  if (!off.length) return null;
  return (
    <div className="hint">
      {t('insights.skipped', { list: off.map((d) => `${t(`insights.det.${d.id}`)} (${t(d.skipped ?? '')})`).join('; ') })}
    </div>
  );
}
