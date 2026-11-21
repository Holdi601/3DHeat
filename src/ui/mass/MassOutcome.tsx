/**
 * Mass analysis, Outcome (docs/outcome-analysis.md): what goes with winning
 * on each map - the zones a side holds in each part of the round, the routes
 * it opens along, first blood, keeping together, pushing out, falling back,
 * objectives, what it fields - each pattern's win rate with and without it,
 * per map and side. The zones and routes are drawn in the view coloured by
 * the difference (teal more, orange less, grey none), by window or at a
 * moment (the time slider). A pattern loads its matches, won against lost,
 * jumps to an example, goes to the analysis document or stands as a chart
 * sign on its place.
 */

import { useEffect, useMemo } from 'react';
import { int, list, num, t, useLang } from '../../i18n';
import { useMass } from '../../mass/client';
import {
  cancelOutcome, compareFinding, COMPARE_MATCHES, drawOutcome, frameFinding, openExample, refreshOutcomeMap, resultFindings, resultGroups, runOutcome, useOutcome,
} from '../../mass/outcomeClient';
import type { OutcomeGroupBy, OutcomeResult } from '../../mass/massWorker';
import { DEFAULT_OPTIONS, type GroupSummary, type OutcomeFinding } from '../../outcome/analyze';
import { clockText, detailText, leadText, sayFinding } from '../../outcome/narrate';
import { cssColor, FULL_DELTA } from '../../outcome/view';
import type { SharedChartBlock } from '../../notes/sharedChart';
import { takeChartBlock } from '../notes/actions';
import { useVolumeStore } from '../../volumes/store';
import { useSignStore } from '../../volumes/signs/store';
import { toast } from '../shell/kit';
import { Segmented } from '../controls';
import { useEngine } from '../EngineContext';
import type { Engine } from '../../render/engine';

const pct = (v: number) => (Number.isFinite(v) ? `${num(v * 100, 0)}%` : '—');
const MAX_LIST = 120;

export function MassOutcome() {
  useLang();
  const engine = useEngine();
  const st = useOutcome();
  const filter = useMass((s) => s.filter);
  const progress = useMass((s) => s.progress);
  const r = st.result;
  const groups = useMemo(() => resultGroups(r), [r]);
  const g = groups.find((x) => x.key === st.group) ?? null;
  const stale = !!r && st.resultKey !== JSON.stringify(filter);
  // The zones follow the selection.
  useEffect(() => {
    if (r) void refreshOutcomeMap(engine);
  }, [r, st.group, st.side, st.by, st.window, st.slice]);
  useEffect(() => drawOutcome(engine), [st.focus]);
  const findings = useMemo(() => resultFindings(r).filter((f) => !st.group || f.group === st.group), [r, st.group]);
  const explored = !!g?.exploratory;
  const slices = (st.group && r?.slices[st.group]) || null;
  return (
    <div className="mass-outcome">
      <div className="hint">{t('outcome.intro')}</div>
      <div className="row" style={{ gap: 8, flexWrap: 'wrap', alignItems: 'center', marginTop: 6 }}>
        {!st.running ? (
          <button className="primary" data-testid="outcome-run" onClick={() => void runOutcome(engine)}>
            {r ? t('outcome.rerun') : t('outcome.run')}
          </button>
        ) : (
          <button data-testid="outcome-cancel" onClick={cancelOutcome}>{t('outcome.cancel')}</button>
        )}
        <label className="row" style={{ gap: 4 }} title={t('outcome.computeTitle')}>
          <input type="checkbox" checked={st.compute} onChange={(e) => st.set({ compute: e.target.checked })} />
          {t('outcome.compute')}
        </label>
        <label className="row" style={{ gap: 4 }} title={t('outcome.exploreTitle', { min: OUTCOME_MIN, explore: EXPLORE_MIN })}>
          <input type="checkbox" checked={st.explore} data-testid="outcome-explore" onChange={(e) => st.set({ explore: e.target.checked })} />
          {t('outcome.explore')}
        </label>
        <label className="brk-field" title={t('outcome.groupByTitle')}>
          {t('outcome.groupBy')}
          <select value={st.groupBy} data-testid="outcome-groupby" onChange={(e) => st.set({ groupBy: e.target.value as OutcomeGroupBy })}>
            {(['mission', 'mode', 'map'] as const).map((v) => (
              <option key={v} value={v}>{t(`outcome.groupBy.${v}`)}</option>
            ))}
          </select>
        </label>
      </div>
      {st.running && (
        <div className="row" style={{ gap: 8, alignItems: 'center', marginTop: 4 }}>
          {progress && progress.total > 0 && <progress max={progress.total} value={progress.done} style={{ width: 160 }} />}
          <span className="hint" data-testid="outcome-progress">
            {progress && (progress.phase === 'outcome' || progress.phase === 'moves') ? t(`outcome.phase.${progress.phase}`, { done: progress.done, total: progress.total }) : progress ? t(`mass.phase.${progress.phase}`, { done: progress.done, total: progress.total }) : t('outcome.running')}
          </span>
        </div>
      )}
      {st.error && <div className="hint" style={{ color: 'var(--warm)' }}>{st.error}</div>}
      {!r && !st.running && <div className="hint">{t('outcome.noResult')}</div>}
      {r && (
        <>
          <div className="hint" data-testid="outcome-stats" style={stale ? { opacity: 0.6 } : undefined}>
            {t('outcome.stats', { matches: int(r.matches), read: int(r.read), missing: r.missing, small: r.small, tests: int(r.report.tests), found: int(r.report.findings.length), secs: num(((r.report.ms ?? 0) + (r.explore?.ms ?? 0)) / 1000, 1) })}
          </div>
          {r.computeRan && (
            <div className="hint" data-testid="outcome-computed">
              {t('outcome.computed', { computed: r.computed, failed: r.computeFailed ?? 0, noFile: r.noFile ?? 0, left: r.missing })}
            </div>
          )}
          <Coverage r={r} />
          <Dropped />
          <div className="row" style={{ gap: 8, flexWrap: 'wrap', alignItems: 'center', marginTop: 6 }}>
            <label className="brk-field">
              {t('outcome.group')}
              <select value={st.group ?? ''} onChange={(e) => st.set({ group: e.target.value || null, focus: null })}>
                {groups.map((x) => (
                  <option key={x.key} value={x.key}>{`${x.key} (${x.matches})`}</option>
                ))}
              </select>
            </label>
            {g && (
              <Segmented<string>
                value={String(st.side)}
                options={g.sides.map((s, i) => ({ value: String(i), label: t('outcome.sideWins', { side: s, pct: pct(g.wins[i]?.rate ?? NaN) }) }))}
                onChange={(side) => st.set({ side: Number(side) })}
              />
            )}
            <Segmented<'window' | 'moment'>
              value={st.by}
              options={[
                { value: 'window', label: t('outcome.byWindow') },
                { value: 'moment', label: t('outcome.byMoment') },
              ]}
              onChange={(by) => st.set({ by })}
            />
            {g && st.by === 'window' && (
              <Segmented<string> value={String(st.window)} options={g.windows.map((w, i) => ({ value: String(i), label: `${clockText(w[0])}–${clockText(w[1])}` }))} onChange={(window) => st.set({ window: Number(window) })} />
            )}
            {g && st.by === 'moment' && slices && (
              <label className="row" style={{ gap: 6 }} title={t('outcome.momentTitle')}>
                <input type="range" min={0} max={slices.slices - 1} step={1} value={st.slice} data-testid="outcome-slider" onChange={(e) => st.set({ slice: Number(e.target.value) })} />
                {t('outcome.moment', { from: clockText(st.slice * slices.slice), to: clockText((st.slice + 1) * slices.slice) })}
              </label>
            )}
          </div>
          {g && <GroupLine g={g} />}
          {g?.sidesBy === 'spawn' && <div className="hint">{t('outcome.sidesBySpawn')}</div>}
          {g?.sidesBy === 'place' && <div className="hint">{t('outcome.sidesByPlace')}</div>}
          <Legend />
          <h4 style={{ margin: '10px 0 4px' }}>{explored ? t('outcome.leads', { n: findings.length }) : t('outcome.findings', { n: findings.length })}</h4>
          {explored && g && (
            <div className="outcome-explore-note" data-testid="outcome-explore-note">
              {t('outcome.exploreNote', { rounds: int(g.rounds), min: int(r.minRounds ?? OUTCOME_MIN), arm: int(DEFAULT_OPTIONS.minArm) })}
            </div>
          )}
          {!findings.length && <div className="hint">{explored ? t('outcome.noLeads') : t('outcome.none')}</div>}
          <div className="outcome-list">
            {findings.slice(0, MAX_LIST).map((f) => (
              <FindingRow key={f.id} f={f} engine={engine} rounds={(g?.rounds ?? 0) > (g?.matches ?? 0) * 1.5} sideRounds={g?.wins[f.side]?.n ?? 0} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

/** The rounds a map needs before it is tested, and before it is read as leads (`massWorker.ts`). */
const OUTCOME_MIN = 50;
const EXPLORE_MIN = 8;

/**
 * Every map of the run: its matches and rounds against the rounds it needs, and what became of it - tested,
 * read as leads, too few, without moves. A click picks the map.
 */
function Coverage({ r }: { r: OutcomeResult }) {
  const st = useOutcome();
  const cov = r.coverage ?? [];
  if (!cov.length) return null;
  const min = r.minRounds ?? OUTCOME_MIN;
  const built = new Set(resultGroups(r).map((x) => x.key));
  return (
    <div className="outcome-coverage" data-testid="outcome-coverage">
      <div className="hint">{t('outcome.coverage.head', { min: int(min), arm: int(DEFAULT_OPTIONS.minArm), explore: int(r.exploreMin ?? EXPLORE_MIN) })}</div>
      <table className="brk-table outcome-cov-table">
        <thead>
          <tr>
            <th>{t('outcome.group')}</th>
            <th className="num">{t('outcome.coverage.matches')}</th>
            <th className="num">{t('outcome.coverage.rounds')}</th>
            <th>{t('outcome.coverage.of')}</th>
            <th>{t('outcome.coverage.status')}</th>
          </tr>
        </thead>
        <tbody>
          {cov.map((c) => {
            const can = built.has(c.key);
            return (
              <tr key={c.key} className={`${can ? '' : 'outcome-cov-off'}${st.group === c.key ? ' mass-picked' : ''}`} onClick={can ? () => st.set({ group: c.key, focus: null }) : undefined}>
                <td>{c.key}</td>
                <td className="num">{int(c.matches)}</td>
                <td className="num">{int(c.rounds)}</td>
                <td>
                  <span className="outcome-need" title={t('outcome.coverage.barTitle', { rounds: int(c.rounds), min: int(min) })}>
                    <span style={{ width: `${Math.min(100, (100 * c.rounds) / min)}%` }} />
                  </span>
                  {` ${int(Math.min(c.rounds, min))}/${int(min)}`}
                </td>
                <td className={`outcome-status ${c.status}`}>{t(`outcome.coverage.${c.status}`, { more: int(Math.max(0, min - c.rounds)), missing: int(c.missing) })}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/** The picked map's sides and what of its candidate patterns was tested, and why the rest was not. */
function GroupLine({ g }: { g: GroupSummary }) {
  return (
    <div className="hint" data-testid="outcome-group-line">
      {t('outcome.groupLine', {
        rounds: int(g.rounds),
        sides: list(g.sides.map((s, i) => t('outcome.sideRounds', { side: s, n: int(g.wins[i]?.n ?? 0), k: int(g.wins[i]?.k ?? 0) }))),
        tests: int(g.tests),
        small: g.small ?? 0,
        noContrast: g.noContrast ?? 0,
        arm: int(DEFAULT_OPTIONS.minArm),
      })}
    </div>
  );
}

function Dropped() {
  const r = useOutcome((s) => s.result);
  if (!r) return null;
  const d = r.report.dropped;
  const o = r.report.options;
  const parts = Object.entries(d)
    .filter(([, n]) => n > 0)
    .map(([k, n]) => t(`outcome.drop.${k}`, { n: int(n), fdr: `${num(o.fdr * 100, 0)}%`, min: num(o.minDiff * 100, 0) }));
  return parts.length ? <div className="hint mass-dim">{t('outcome.dropped', { list: list(parts) })}</div> : null;
}

/** The diverging key: teal won more, grey no difference, orange won less. */
function Legend() {
  const stops = [-1, -0.5, 0, 0.5, 1].map((v) => cssColor(v * FULL_DELTA));
  return (
    <div className="row outcome-legend" title={t('outcome.legendTitle')} style={{ gap: 6, alignItems: 'center', marginTop: 6 }}>
      <span className="mass-dim">{t('outcome.legend.less')} −</span>
      <span style={{ display: 'inline-block', width: 140, height: 10, borderRadius: 4, background: `linear-gradient(90deg, ${stops.join(', ')})` }} />
      <span className="mass-dim">+ {t('outcome.legend.more')}</span>
      <span className="mass-dim">
        <span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: 2, background: cssColor(0), verticalAlign: 'middle' }} /> {t('outcome.legend.same')}
      </span>
    </div>
  );
}

function FindingRow({ f, engine, rounds, sideRounds }: { f: OutcomeFinding; engine: Engine | null; rounds: boolean; sideRounds: number }) {
  const focus = useOutcome((s) => s.focus);
  const set = useOutcome((s) => s.set);
  const on = focus === f.id;
  const sentence = f.exploratory ? leadText(f, rounds) : sayFinding(f, rounds);
  return (
    <div className={`outcome-row${on ? ' on' : ''}`} data-testid="outcome-finding">
      <div className="row" style={{ gap: 8, alignItems: 'baseline' }}>
        <span className="outcome-chip" style={{ background: cssColor(f.diff) }} aria-hidden>
          {f.diff > 0 ? '+' : '−'}
        </span>
        <span>{sentence}</span>
      </div>
      <div className="row" style={{ gap: 6, flexWrap: 'wrap', marginTop: 2 }}>
        {f.exploratory && (
          <span className="outcome-badge explore" title={t('outcome.badge.exploreTitle')}>
            {t('outcome.badge.explore')}
          </span>
        )}
        {f.exploratory && <span className="mass-dim">{t('outcome.leadNeed', { need: int(f.need), have: int(sideRounds) })}</span>}
        {f.consequence && (
          <span className="outcome-badge" title={t('outcome.badge.consequenceTitle', { with: pct(f.aheadWith), without: pct(f.aheadWithout) })}>
            {t('outcome.badge.consequence')}
          </span>
        )}
        {f.strengthExplained && <span className="outcome-badge" title={t('outcome.badge.strengthTitle')}>{t('outcome.badge.strength')}</span>}
        {!f.stable && <span className="outcome-badge" title={t('outcome.badge.unstableTitle')}>{t('outcome.badge.unstable')}</span>}
        {f.near > 0 && <span className="outcome-badge" title={t('outcome.badge.nearTitle', { n: f.near })}>{t('outcome.badge.near', { n: f.near })}</span>}
        <span className="mass-dim">{detailText(f)}</span>
      </div>
      <div className="row" style={{ gap: 6, flexWrap: 'wrap', marginTop: 4 }}>
        <button
          title={t('outcome.showTitle')}
          onClick={() => {
            set({ focus: on ? null : f.id, side: f.side, ...(f.feature.window !== undefined ? { by: 'window' as const, window: f.feature.window } : {}) });
            frameFinding(engine, f);
          }}
        >
          {t('outcome.show')}
        </button>
        <button title={t('outcome.compareTitle', { n: COMPARE_MATCHES })} onClick={() => void compareFinding(engine, f).then((n) => n || toast(t('outcome.noFiles')))}>
          {t('outcome.compare')}
        </button>
        <button title={t('outcome.toDocTitle')} onClick={() => toDocument(f, sentence)}>
          {t('outcome.toDoc')}
        </button>
        <button title={t('outcome.signTitle')} onClick={() => void pinSign(engine, f, sentence)}>
          {t('outcome.sign')}
        </button>
        {f.examples.length > 0 && <span className="mass-dim">{t('outcome.examples')}</span>}
        {f.examples.map((e, k) => (
          <button key={k} className="outcome-ex" title={t('outcome.exampleTitle')} onClick={() => void openExample(engine, f, k)}>
            {e.won ? t('outcome.exampleWon') : t('outcome.exampleLost')} {f.examples.slice(0, k + 1).filter((x) => x.won === e.won).length}
          </button>
        ))}
      </div>
    </div>
  );
}

/** The two win rates as a chart block of the open analysis document (or the clipboard). */
function toDocument(f: OutcomeFinding, sentence: string): void {
  const block: SharedChartBlock = {
    schema: 'heat3d.chartBlock/1',
    type: 'chart',
    id: `outcome-${Date.now().toString(36)}`,
    title: sentence,
    spec: { kind: 'bar', source: 'outcome', finding: f.id },
    source: { dataset: f.group, scope: detailText(f) },
    data: {
      kind: 'bar',
      groups: [
        { key: 'with', label: t('outcome.chart.with') },
        { key: 'without', label: t('outcome.chart.without') },
      ],
      series: [{ key: 'won', label: t('outcome.chart.value') }],
      values: [[f.with.rate, f.without.rate]],
      valueLabel: t('outcome.chart.value'),
      rows: f.with.n + f.without.n,
    },
    at: Date.now(),
  };
  if (takeChartBlock(block)) {
    toast(t('outcome.sent'), 'good');
    return;
  }
  void navigator.clipboard?.writeText(JSON.stringify(block)).then(() => toast(t('outcome.copied')));
}

/** The matches with the pattern loaded, a volume on its place, a chart of won against lost beside it. */
async function pinSign(engine: Engine | null, f: OutcomeFinding, sentence: string): Promise<void> {
  const z = f.zone ?? f.routeEnd;
  const pt = f.point;
  if (!z && !pt) {
    toast(t('outcome.signNoPlace'));
    return;
  }
  await compareFinding(engine, f);
  const name = sentence.length > 60 ? `${sentence.slice(0, 57)}…` : sentence;
  const vol = z
    ? useVolumeStore.getState().add({ kind: 'prism', points: [[z.x0, z.z0], [z.x1, z.z0], [z.x1, z.z1], [z.x0, z.z1]], floor: z.y - (z.x1 - z.x0) * 0.2, ceil: z.y + (z.x1 - z.x0) * 0.5 }, name)
    : useVolumeStore.getState().add({ kind: 'cylinder', x: pt![0], z: pt![1], radius: 60, floor: (useOutcome.getState().map?.zones[0]?.y ?? 0) - 20, ceil: (useOutcome.getState().map?.zones[0]?.y ?? 0) + 60 }, name);
  useSignStore.getState().add(vol.id, { kind: 'bar', measure: { kind: 'count' }, group: 'team', diff: 'outcome' });
}
