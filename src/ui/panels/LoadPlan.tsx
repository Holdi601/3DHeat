import { memo, useEffect, useMemo, useRef, useState } from 'react';
import { loader } from '../../data/loader';
import type { SourcePreview } from '../../data/sourcePreview';
import {
  defaultOnDemand,
  dropToFit,
  forgetChoice,
  profileSample,
  sourceKey,
  suggestColumns,
  labelBytes,
  type ColumnProfile,
  type ImportanceReason,
} from '../../data/columnProfile';
import { activeClauses, expectedMatches, type MatchCount, type RowFilterClause } from '../../data/rowFilter';
import { formatBytes } from '../../data/memory';
import { onDemandEligible } from '../../data/columnSource';
import { formatCount } from '../../data/synth';
import type { ColumnMapping } from '../../state/types';
import { num, t } from '../../i18n';
import { Section } from '../controls';

/**
 * The load's plan, before Load is pressed: which rows to read (the pre-filter)
 * and which columns to keep (with what each one costs).
 *
 * Both act while the files are read, so a row or a column left out here never
 * takes memory at all — unlike the filter panel, which hides rows already
 * resident. The choice is remembered per kind of source (`sourceKey`), so the
 * next load of the same game's tables starts from it.
 */

export interface LoadPlanResult {
  /** Rows the load is expected to keep after the pre-filter: `totalRows` without one. */
  rows: number;
  /** Whether `rows` was counted over every file rather than estimated from a sample. */
  exact: boolean;
  /** Category label bytes the kept text columns add (see `labelBytes`). */
  labels: number;
}

/** Column names that usually hold what a quick filter is for. */
const QUICK: Array<{ id: string; re: RegExp }> = [
  { id: 'event', re: /^(event|events|event.?type|type|kind|action)$/i },
  { id: 'class', re: /^(class|vehicle.?class|vehicle.?type|unit.?type|category|role)$/i },
  { id: 'map', re: /^(map|level|map.?name|mode|game.?mode)$/i },
  { id: 'won', re: /^(won|win|round.?won|match.?won|is.?win(ner)?|victory|outcome|result)$/i },
];

const KILL_LIKE = /kill|death|died|dead|destroy|frag/i;

export const LoadPlan = memo(function LoadPlan({
  files,
  preview,
  mapping,
  setMapping,
  totalRows,
  excessBytes,
  onPlan,
}: {
  files: File[];
  preview: SourcePreview;
  mapping: ColumnMapping;
  setMapping: (m: ColumnMapping) => void;
  totalRows: number;
  /** Bytes the load is over its RAM budget by, 0 when it fits. */
  excessBytes: number;
  onPlan: (p: LoadPlanResult) => void;
}) {
  const [profile, setProfile] = useState<ColumnProfile[] | null>(null);
  const [count, setCount] = useState<MatchCount | null>(null);
  const [counting, setCounting] = useState(false);
  const [adding, setAdding] = useState('');
  const key = useMemo(() => sourceKey(preview.columns), [preview.columns]);

  // The profile: the footer and the first rows of the first file, or the preview's sample.
  const first = files[0];
  useEffect(() => {
    let live = true;
    setProfile(null);
    if (preview.format === 'parquet' && first) {
      loader.profile(first).then(
        (p) => live && setProfile(p),
        () => live && setProfile(profileSample(preview.columns, preview.rows, preview.numeric, preview.rowCount)),
      );
    } else {
      setProfile(profileSample(preview.columns, preview.rows, preview.numeric, preview.rowCount));
    }
    return () => {
      live = false;
    };
  }, [first, preview]);

  const clauses = mapping.rowFilter ?? [];
  const active = activeClauses(clauses);
  const activeKey = JSON.stringify(active);
  const countable = preview.format === 'parquet';

  // Recount on every change, a moment after the last one, from the filter columns alone.
  const seq = useRef(0);
  const runCount = (timeMs: number) => {
    const mine = ++seq.current;
    if (!active.length || !countable) {
      setCount(null);
      setCounting(false);
      return;
    }
    setCounting(true);
    loader.count(files, active, timeMs).then(
      (c) => {
        if (mine !== seq.current) return;
        setCount(c);
        setCounting(false);
      },
      () => mine === seq.current && setCounting(false),
    );
  };
  useEffect(() => {
    const h = setTimeout(() => runCount(1500), 250);
    return () => clearTimeout(h);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeKey, files]);

  const expected = active.length && count ? expectedMatches(count, totalRows) : totalRows;
  const exact = !active.length || (count?.exact ?? false);
  const labels = labelBytes(profile, mapping, expected);
  useEffect(() => {
    onPlan({ rows: expected, exact, labels });
  }, [expected, exact, labels, onPlan]);

  const setClauses = (next: RowFilterClause[]) => setMapping({ ...mapping, rowFilter: next });
  const byName = (name: string) => profile?.find((p) => p.name === name) ?? null;
  const addClause = (column: string, values?: string[]) => {
    if (!column || clauses.some((c) => c.column === column)) return;
    const p = byName(column);
    const asSet = !!p && p.values.length > 0 && (p.text || !p.capped);
    setClauses([
      ...clauses,
      asSet ? { column, kind: 'set', values: values ?? [] } : { column, kind: 'range', min: null, max: null },
    ]);
  };

  const quick = useMemo(() => {
    const out: Array<{ label: string; column: string }> = [];
    const cols = preview.columns;
    for (const q of QUICK) {
      const c = cols.find((n) => q.re.test(n.replace(/[\s-]/g, '_')));
      if (c) out.push({ label: t(`heat.loadPlan.quick.${q.id}`), column: c });
    }
    if (mapping.teamId) out.push({ label: t('heat.loadPlan.quick.team'), column: mapping.teamId });
    if (mapping.time) out.push({ label: t('heat.loadPlan.quick.time'), column: mapping.time });
    return out.filter((q, i) => out.findIndex((o) => o.column === q.column) === i);
  }, [preview.columns, mapping.teamId, mapping.time]);

  const eventColumn = quick.find((q) => QUICK[0].re.test(q.column.replace(/[\s-]/g, '_')))?.column ?? null;
  const killValues = eventColumn ? (byName(eventColumn)?.values ?? []).map((v) => v.value).filter((v) => KILL_LIKE.test(v)) : [];

  // Columns left in the files until needed (`columnSource.ts`): Parquet only.
  const canLater = preview.format === 'parquet';
  const later = canLater ? (mapping.onDemand ?? []) : [];
  // Proposed once a source's columns are known and nothing was chosen for it
  // yet: the ordinary measures wait in the files.
  const proposed = useRef<string | null>(null);
  useEffect(() => {
    if (!profile || !canLater || mapping.onDemand !== undefined || proposed.current === key) return;
    proposed.current = key;
    const wait = defaultOnDemand(profile, mapping);
    setMapping({ ...mapping, extra: mapping.extra.filter((n) => !wait.includes(n)), onDemand: wait });
  }, [profile, canLater, mapping, key, setMapping]);

  const suggestions = useMemo(
    // A column read later costs the load nothing, and is not one to drop.
    () => (profile ? suggestColumns(profile, mapping, Math.max(1, expected)) : []).map((s) => ({ ...s, later: later.includes(s.name) })),
    [profile, mapping, expected, later],
  );
  const drop = excessBytes > 0 ? dropToFit(suggestions, excessBytes) : [];
  const dropLater = canLater ? drop.filter((n) => onDemandEligible(n)) : [];

  const toggleKeep = (name: string, keep: boolean) => {
    const p = byName(name);
    setMapping({
      ...mapping,
      extra: keep ? [...mapping.extra, name] : mapping.extra.filter((n) => n !== name),
      onDemand: (mapping.onDemand ?? []).filter((n) => n !== name),
      extraNumeric: keep && p ? { ...mapping.extraNumeric, [name]: mapping.extraNumeric[name] ?? !p.text } : mapping.extraNumeric,
    });
  };
  const setLater = (names: string[], wait: boolean) => {
    const rest = (mapping.onDemand ?? []).filter((n) => !names.includes(n));
    const extra = mapping.extra.filter((n) => !names.includes(n));
    setMapping({ ...mapping, extra: wait ? extra : [...extra, ...names], onDemand: wait ? [...rest, ...names] : rest });
  };

  return (
    <>
      <Section title={t('heat.loadPlan.filterTitle')} defaultOpen={active.length > 0}>
        <div className="hint">{t('heat.loadPlan.filterHint')}</div>
        {quick.length > 0 && (
          <div className="row wrap">
            {killValues.length > 0 && eventColumn && (
              <button
                onClick={() =>
                  setClauses([...clauses.filter((c) => c.column !== eventColumn), { column: eventColumn, kind: 'set', values: killValues }])
                }
              >
                {t('heat.loadPlan.killsOnly')}
              </button>
            )}
            {quick.map((q) => (
              <button key={q.column} disabled={clauses.some((c) => c.column === q.column)} onClick={() => addClause(q.column)}>
                {q.label}
              </button>
            ))}
          </div>
        )}
        <div className="row">
          <select value={adding} onChange={(e) => setAdding(e.target.value)} style={{ flex: 1 }}>
            <option value="">{t('heat.loadPlan.anyColumn')}</option>
            {preview.columns
              .filter((c) => !clauses.some((x) => x.column === c))
              .map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
          </select>
          <button
            disabled={!adding}
            onClick={() => {
              addClause(adding);
              setAdding('');
            }}
          >
            {t('heat.loadPlan.add')}
          </button>
        </div>

        {clauses.map((c, ci) => {
          const p = byName(c.column);
          const replace = (next: RowFilterClause) => setClauses(clauses.map((x, i) => (i === ci ? next : x)));
          return (
            <div className="field" key={c.column} data-testid={`prefilter-${c.column}`}>
              <div className="label">
                <span>{c.column}</span>
                <button onClick={() => setClauses(clauses.filter((_, i) => i !== ci))}>{t('heat.loadPlan.remove')}</button>
              </div>
              {c.kind === 'set' ? (
                <>
                  <div className="row">
                    <button onClick={() => replace({ ...c, values: (p?.values ?? []).map((v) => v.value) })}>{t('heat.loadPlan.all')}</button>
                    <button onClick={() => replace({ ...c, values: [] })}>{t('heat.loadPlan.none')}</button>
                    {p?.capped && <span className="hint">{t('heat.loadPlan.moreValues', { shown: p.values.length })}</span>}
                  </div>
                  <div className="team-list">
                    {(p?.values ?? c.values.map((value) => ({ value, count: 0 }))).map((v) => (
                      <label className="team-row" key={v.value}>
                        <input
                          type="checkbox"
                          checked={c.values.includes(v.value)}
                          onChange={(e) =>
                            replace({ ...c, values: e.target.checked ? [...c.values, v.value] : c.values.filter((x) => x !== v.value) })
                          }
                        />
                        <span className="name" title={v.value}>
                          {v.value === '' ? t('heat.loadPlan.empty') : v.value}
                        </span>
                        {v.count > 0 && <span className="val">{formatCount(v.count)}</span>}
                      </label>
                    ))}
                  </div>
                  {c.values.length === 0 && <div className="hint">{t('heat.loadPlan.noneTicked')}</div>}
                </>
              ) : (
                <div className="row">
                  <input
                    className="narrow"
                    type="number"
                    placeholder={p?.min !== null && p?.min !== undefined ? String(p.min) : t('heat.loadPlan.open')}
                    value={c.min ?? ''}
                    onChange={(e) => replace({ ...c, min: e.target.value === '' ? null : Number(e.target.value) })}
                  />
                  <span style={{ color: 'var(--text-dim)', fontSize: 11 }}>{t('heat.loadPlan.to')}</span>
                  <input
                    className="narrow"
                    type="number"
                    placeholder={p?.max !== null && p?.max !== undefined ? String(p.max) : t('heat.loadPlan.open')}
                    value={c.max ?? ''}
                    onChange={(e) => replace({ ...c, max: e.target.value === '' ? null : Number(e.target.value) })}
                  />
                </div>
              )}
            </div>
          );
        })}

        {active.length > 0 && (
          <div className="hint" data-testid="prefilter-count">
            {!countable
              ? t('heat.loadPlan.textUncounted')
              : counting && !count
                ? t('heat.loadPlan.counting')
                : count
                  ? t(count.exact ? 'heat.loadPlan.keepsExact' : 'heat.loadPlan.keepsAbout', {
                      kept: formatCount(expected),
                      rows: formatCount(totalRows),
                      percent: num(totalRows ? (expected / totalRows) * 100 : 0, expected / Math.max(1, totalRows) < 0.01 ? 2 : 1),
                      files: count.scannedFiles,
                      total: count.files,
                      skipped: count.groupsSkipped,
                      groups: count.groups,
                    })
                  : null}
            {countable && count && !count.exact && (
              <>
                {' '}
                <button onClick={() => runCount(Number.POSITIVE_INFINITY)} disabled={counting}>
                  {t('heat.loadPlan.countAll')}
                </button>
              </>
            )}
          </div>
        )}
      </Section>

      {profile && (
        <ColumnCosts
          key={excessBytes > 0 ? 'over' : 'fits'}
          suggestions={suggestions}
          drop={drop}
          excessBytes={excessBytes}
          onKeep={toggleKeep}
          canLater={canLater}
          onLater={(name, wait) => setLater([name], wait)}
          laterSuggested={dropLater.length}
          onLaterSuggested={() => setLater(dropLater, true)}
          onDropSuggested={() =>
            setMapping({ ...mapping, extra: mapping.extra.filter((n) => !drop.includes(n)) })
          }
          onForget={() => forgetChoice(key)}
        />
      )}
    </>
  );
});

function reasonLabel(r: ImportanceReason): string {
  return t(`heat.loadPlan.reason.${r}`);
}

/** Per column: what keeping it costs and how much it matters, the cheapest way to fit first. */
function ColumnCosts({
  suggestions,
  drop,
  excessBytes,
  onKeep,
  canLater,
  onLater,
  laterSuggested,
  onLaterSuggested,
  onDropSuggested,
  onForget,
}: {
  suggestions: Array<ReturnType<typeof suggestColumns>[number] & { later: boolean }>;
  drop: string[];
  excessBytes: number;
  onKeep: (name: string, keep: boolean) => void;
  canLater: boolean;
  onLater: (name: string, later: boolean) => void;
  laterSuggested: number;
  onLaterSuggested: () => void;
  onDropSuggested: () => void;
  onForget: () => void;
}) {
  const kept = suggestions.filter((s) => s.kept).reduce((a, s) => a + s.bytes, 0);
  const waiting = suggestions.filter((s) => s.later).length;
  return (
    <Section title={t('heat.loadPlan.columnsTitle')} defaultOpen={excessBytes > 0}>
      <div role="dialog" aria-label={t('heat.loadPlan.columnsTitle')} data-testid="column-costs">
        <div className="hint">{t('heat.loadPlan.columnsHint', { kept: formatBytes(kept) })}</div>
        {waiting > 0 && <div className="hint" data-testid="columns-later-note">{t('heat.loadPlan.laterNote', { count: waiting })}</div>}
        {excessBytes > 0 && (
          <div className="hint" style={{ color: 'var(--bad)' }}>
            {t('heat.loadPlan.over', { over: formatBytes(excessBytes) })}{' '}
            {laterSuggested > 0 && (
              <button onClick={onLaterSuggested}>{t('heat.loadPlan.laterSuggested', { count: laterSuggested })}</button>
            )}{' '}
            {drop.length > 0 && (
              <button onClick={onDropSuggested}>{t('heat.loadPlan.dropSuggested', { count: drop.length })}</button>
            )}
          </div>
        )}
        <div className="team-list">
          {suggestions.map((s) => (
            <label className="team-row" key={s.name} title={reasonLabel(s.reason)}>
              <input type="checkbox" checked={s.kept || s.later} disabled={s.rank === 0} onChange={(e) => onKeep(s.name, e.target.checked)} />
              <span className="name" style={drop.includes(s.name) ? { color: 'var(--warm)' } : undefined}>
                {s.name}
              </span>
              {canLater && s.rank > 0 && onDemandEligible(s.name) && (s.kept || s.later) && (
                // A span, not a label: the row is the keep box's label already.
                <span className="val" title={t('heat.loadPlan.laterTitle')} style={{ color: 'var(--text-dim)' }}>
                  <input type="checkbox" data-testid={`later-${s.name}`} checked={s.later} onChange={(e) => onLater(s.name, e.target.checked)} />
                  {t('heat.loadPlan.later')}
                </span>
              )}
              <span className="val" style={{ minWidth: 64, textAlign: 'right', ...(s.later ? { color: 'var(--text-dim)' } : {}) }}>
                {formatBytes(s.bytes)}
              </span>
              <span className="val" style={{ minWidth: 72, color: 'var(--text-dim)' }}>
                {t(`heat.loadPlan.rank.${s.rank}`)}
              </span>
            </label>
          ))}
        </div>
        <div className="row">
          <span className="hint">{t('heat.loadPlan.remembered')}</span>
          <button onClick={onForget}>{t('heat.loadPlan.forget')}</button>
        </div>
      </div>
    </Section>
  );
}
