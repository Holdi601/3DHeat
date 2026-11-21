import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { autoMap } from '../../data/automap';
import {
  describeSelection,
  filesFromDataTransfer,
  filterDataFiles,
  openPicker,
  totalBytes,
  type PickedFile,
} from '../../data/filePick';
import { expandContainers } from '../../data/container';
import { loadMatchesBeside } from '../../state/matchStore';
import { loadLayoutFiles, noteLayoutModes } from '../../state/levelLayoutsStore';
import { noteR6Maps } from '../../data/r6Level';
import { noteFrostbiteMaps } from '../../data/frostbiteLevel';
import { loader, type LoaderProgress } from '../../data/loader';
import type { SelectionSize, SourcePreview } from '../../data/sourcePreview';
import { DELIMITERS } from '../../data/csv';
import { isElapsedAxis } from '../../data/automap';
import {
  checkFit,
  estimateFootprint,
  estimateLoadSeconds,
  formatBytes,
  formatDuration,
} from '../../data/memory';
import { validateMapping } from '../../data/validate';
import { formatCount } from '../../data/synth';
import { useStore } from '../../state/store';
import { TIME_UNIT_LABELS, type ColumnMapping, type TimeUnit } from '../../state/types';
import { Check, Rich, Section, Select } from '../controls';
import { list, num, t } from '../../i18n';
import { prepareUnits } from '../replay/units';
import { NumberBox } from '../NumberBox';
import { SortControl } from '../sort/SortControl';
import { useSort, useSorted } from '../sort/useSort';
import { LoadPlan, type LoadPlanResult } from './LoadPlan';
import { MemoryPanel } from './MemoryPanel';
import { recallChoice, rememberChoice, sourceKey } from '../../data/columnProfile';
import { activeClauses } from '../../data/rowFilter';
import { noteDataFiles, useDataHandoff } from '../../session/dataRefs';
import { DatasetSummary } from './DatasetPanel';
import { DATA_EXTENSIONS, openSessionFile, RecentSession } from './OpenData';
import { downloadSession } from '../../session/sessionFile';
import { SessionOpenReport } from '../session/SessionPanel';
import { useEngine } from '../EngineContext';
import { setPendingLoad } from '../../state/pendingLoad';
import { pickIdentity, type PickIdentity } from '../../data/pickIdentity';
import { noteWantedLevel } from './autoLevel';

const NO_COLUMNS: string[] = [];

const delimiterOptions = (): Array<{ value: string; label: string }> => [
  { value: ',', label: t('heat.sourcePanel.delimiter.comma') },
  { value: ';', label: t('heat.sourcePanel.delimiter.semicolon') },
  { value: '\t', label: t('heat.sourcePanel.delimiter.tab') },
  { value: '|', label: t('heat.sourcePanel.delimiter.pipe') },
  { value: ' ', label: t('heat.sourcePanel.delimiter.space') },
];

/** A time unit as the menu names it. */
function timeUnitLabel(u: TimeUnit): string {
  switch (u) {
    case 'seconds':
      return t('heat.sourcePanel.timeUnit.seconds');
    case 'milliseconds':
      return t('heat.sourcePanel.timeUnit.milliseconds');
    case 'microseconds':
      return t('heat.sourcePanel.timeUnit.microseconds');
    case 'nanoseconds':
      return t('heat.sourcePanel.timeUnit.nanoseconds');
    case 'unix_seconds':
      return t('heat.sourcePanel.timeUnit.unixSeconds');
    case 'unix_milliseconds':
      return t('heat.sourcePanel.timeUnit.unixMilliseconds');
    case 'iso8601':
      return t('heat.sourcePanel.timeUnit.iso8601');
    default:
      return TIME_UNIT_LABELS[u as TimeUnit] ?? u;
  }
}

/**
 * File selection and column mapping.
 *
 * The mapping is guessed on preview and applied immediately, so the common case
 * is "select, Load, done". Every guess stays visible and overridable, because a
 * wrong axis or time unit is easy to spot on screen but impossible to fix
 * without these controls.
 */
export function SourcePanel() {
  const engine = useEngine();
  const setDataset = useStore((s) => s.setDataset);
  // Not the whole load state: its progress changes ten times a second while a
  // load runs, and the panel below it is hundreds of controls (`LoadProgress`).
  const loadActive = useStore((s) => s.load.active);
  const loadError = useStore((s) => s.load.error);
  const setLoad = useStore((s) => s.setLoad);

  const [picked, setPicked] = useState<PickedFile[]>([]);
  /** What the pick is, as its containers say: game, map, how many matches. */
  const [identity, setIdentity] = useState<PickIdentity | null>(null);
  /** The pick has been loaded: the load card stands down until the next one. */
  const [loadedPick, setLoadedPick] = useState(false);
  const [skipped, setSkipped] = useState<Array<{ name: string; reason: string }>>([]);
  const [preview, setPreview] = useState<SourcePreview | null>(null);
  const [mapping, setMapping] = useState<ColumnMapping | null>(null);
  const [size, setSize] = useState<SelectionSize | null>(null);
  const budgets = useStore((s) => s.budgets);
  const [stride, setStride] = useState(1);
  const [strideTouched, setStrideTouched] = useState(false);
  const [hot, setHot] = useState(false);
  const [showSample, setShowSample] = useState(false);
  /** The pre-filter's expected rows and the kept text columns' label bytes (`LoadPlan`). */
  const [plan, setPlan] = useState<LoadPlanResult | null>(null);
  const dropRef = useRef<HTMLDivElement>(null);
  /** Files handed over to be loaded at once (a session file's data): loaded as soon as they can be. */
  const autoLoad = useRef(false);

  const patch = (p: Partial<ColumnMapping>) =>
    setMapping((m) => (m ? { ...m, ...p } : m));

  const accept = useCallback(
    async (chosen: PickedFile[], delimiter?: string) => {
      // A `.3dheat` container stands for its match's table (docs/container.md).
      const { files: raw, failed } = await expandContainers(chosen);
      // The battles' match documents and objectives with them, for the match tab and the level.
      void loadMatchesBeside(chosen.map((f) => f.file));
      // A level's `.layouts.json` picked with the data, and the modes the tables are played in, for its layout.
      void loadLayoutFiles(chosen.map((f) => f.file));
      void noteLayoutModes(chosen.map((f) => f.file));
      // The Siege maps they are on, for the level panel to offer the R6 tool's levels.
      void noteR6Maps(chosen.map((f) => f.file));
      // The Battlefield maps they are on (a `map` column), for the level panel to offer those levels.
      void noteFrostbiteMaps(chosen.map((f) => f.file));
      const { accepted, skipped: bad } = filterDataFiles(raw);
      for (const name of failed) bad.push({ name, reason: t('data.filePick.notData') });
      setSkipped(bad);
      setPicked(accepted);
      setLoadedPick(false);
      const who = pickIdentity(chosen, accepted);
      setIdentity(who);
      // The level the files are on, to load by itself once they are (`autoLevel.ts`).
      noteWantedLevel(who.gameId, who.map);
      setPreview(null);
      setMapping(null);
      setSize(null);
      setPlan(null);
      setStride(1);
      setStrideTouched(false);
      if (accepted.length === 0) {
        setLoad({ error: bad.length ? t('heat.sourcePanel.noLoadable') : null });
        return;
      }
      setLoad({ active: true, label: t('heat.sourcePanel.readingSchema'), fraction: null, rowsSoFar: 0, error: null });
      try {
        // Schema comes from the first file — a folder of telemetry shares one.
        // Row counts come from every file, because deciding whether a selection
        // fits in memory needs the total, and a Parquet footer read is cheap.
        const p = await loader.preview(accepted[0].file, delimiter);
        setPreview(p);
        const guessed = autoMap({
          columns: p.columns,
          rows: p.rows,
          numeric: p.numeric,
          logicalTypes: p.logicalTypes,
          hints: p.hints,
          constant: p.constant,
          // The preview samples one file, so the mapping has to be told how many
          // are coming: a column holding one value per file — which region, which
          // test run — looks constant in that sample and would be dropped as
          // unfilterable, exactly when merging the files makes it worth having.
          fileCount: accepted.length,
        });
        // What was kept and pre-filtered for this kind of source last time (`LoadPlan`).
        const recalled = recallChoice(sourceKey(p.columns), p.columns);
        setMapping({
          ...guessed,
          ...(recalled
            ? {
                extra: recalled.extra,
                ...(recalled.onDemand ? { onDemand: recalled.onDemand } : {}),
                extraNumeric: { ...guessed.extraNumeric, ...recalled.extraNumeric },
                rowFilter: recalled.rowFilter,
              }
            : {}),
          delimiter: p.delimiter,
        });
        setLoad({ active: true, label: t('heat.sourcePanel.countingRows'), fraction: null, rowsSoFar: 0, error: null });
        setSize(await loader.measure(accepted.map((f) => f.file)));
        setLoad({ active: false, label: '', fraction: null, error: null });
      } catch (err) {
        setLoad({
          active: false,
          label: '',
          fraction: null,
          error: err instanceof Error ? err.message : String(err),
        });
      }
    },
    [setLoad],
  );

  // Files handed over from the session (the host's data) or a packed session file: as if picked here.
  useEffect(
    () =>
      useDataHandoff.subscribe((s, prev) => {
        if (s.nonce !== prev.nonce && s.files?.length) {
          autoLoad.current = s.load;
          void accept(s.picked ?? s.files.map((file) => ({ file, relativePath: file.name })));
        }
      }),
    [accept],
  );

  const pick = async (directory: boolean, multiple: boolean) => {
    autoLoad.current = false;
    const files = await openPicker(directory, multiple);
    if (files.length > 0) await accept(files);
  };

  const rePreview = async (delimiter: string) => {
    patch({ delimiter });
    if (!picked.length || preview?.format !== 'csv') return;
    try {
      const p = await loader.preview(picked[0].file, delimiter);
      setPreview(p);
      setMapping({
        ...autoMap({ columns: p.columns, rows: p.rows, numeric: p.numeric, fileCount: picked.length }),
        delimiter,
      });
    } catch {
      /* keep the previous preview; the separator is probably wrong */
    }
  };

  const doLoad = async () => {
    if (!mapping || !preview || picked.length === 0) return;
    const onProgress = (p: LoaderProgress) =>
      setLoad({ active: true, label: p.label, fraction: p.fraction, rowsSoFar: p.rows });
    setLoad({ active: true, label: t('heat.sourcePanel.loading'), fraction: 0, rowsSoFar: 0, error: null });
    rememberChoice(sourceKey(preview.columns), {
      extra: mapping.extra,
      ...(mapping.onDemand ? { onDemand: mapping.onDemand } : {}),
      extraNumeric: mapping.extraNumeric,
      rowFilter: mapping.rowFilter ?? [],
    });
    const filtering = activeClauses(mapping.rowFilter).length > 0;
    try {
      const ds = await loader.ingest(
        picked.map((p) => p.file),
        mapping,
        preview.columns,
        describeSelection(picked),
        stride,
        // Exact for Parquet, estimated for CSV; either way it lets the builder
        // allocate once instead of growing. Under a pre-filter only a count over
        // every file is exact enough: an estimate would read as a short load.
        filtering ? (plan?.exact ? plan.rows : 0) : (size?.rows ?? 0),
        onProgress,
      );
      // The unit index a few milliseconds a frame, before the first render would build it all at once.
      setLoad({ active: true, label: t('heat.sourcePanel.indexing'), fraction: null, rowsSoFar: ds.count, error: null });
      await prepareUnits(ds);
      setDataset(ds);
      // What the data is, by content, for the session and its file.
      noteDataFiles(picked.map((p) => p.file));
      // Recordings the load started together (`recordingsAligned`) are watched together, not the busiest alone.
      if (ds.recordingsAligned) useStore.getState().patchTeam({ session: -1 });
      setLoad({ active: false, label: '', fraction: null, rowsSoFar: ds.count, error: null });
      setLoadedPick(true);
    } catch (err) {
      setLoad({
        active: false,
        label: '',
        fraction: null,
        error: err instanceof Error ? err.message : String(err),
      });
    }
  };

  // The same array while the preview is, so the selects keep their option lists.
  const columns = preview?.columns;
  const pickedFiles = useMemo(() => picked.map((p) => p.file), [picked]);
  const columnOptions = useMemo(() => (columns ?? []).map((c) => ({ value: c, label: c })), [columns]);
  const columnSort = useSort<string>(
    'source.columns',
    [
      { id: 'name', label: t('ui.sort.name'), key: (c) => c },
      { id: 'order', label: t('ui.sort.order'), key: null },
    ],
    'name',
  );
  const sortedColumns = useSorted(columns ?? NO_COLUMNS, columnSort);

  const validation = mapping ? validateMapping(mapping, preview) : null;
  const totalRows = size?.rows ?? 0;
  // What the pre-filter is expected to keep, which is what a stride then thins.
  const keptRows = mapping && activeClauses(mapping.rowFilter).length > 0 && plan ? plan.rows : totalRows;
  const loadRows = Math.floor(keptRows / Math.max(1, stride));
  // The file count matters to the estimate: merging more than one adds a
  // `Source file` column, four bytes a row that no mapping mentions.
  const footprint = mapping ? estimateFootprint(mapping, loadRows, picked.length, plan ? plan.labels / Math.max(1, stride) : 0) : null;
  const fit = footprint ? checkFit(footprint, budgets) : null;
  // Full-size fit, so the panel can propose a stride before one is chosen.
  const fullFootprint = mapping && keptRows > 0 ? estimateFootprint(mapping, keptRows, picked.length, plan?.labels ?? 0) : null;
  const fullFit = fullFootprint ? checkFit(fullFootprint, budgets) : null;
  const excessBytes = fullFootprint ? Math.max(0, fullFootprint.peakBytes - budgets.ram) : 0;
  // The rows a parse reads are every row, a stride thins them only afterwards; the kept columns are what each costs.
  const loadSeconds = mapping ? estimateLoadSeconds(keptRows, 6 + mapping.extra.length, Math.min(budgets.cpu, picked.length)) : 0;
  // Not before the load plan has settled what the load reads (`LoadPlanResult.ready`).
  const canLoad = !!validation?.ok && !loadActive && fit?.verdict !== 'too-big' && !!plan?.ready;
  /**
   * Whether the columns want a look before loading: no reading instructions came
   * with the files, or the guess left something to check. Only then is the
   * mapping open; a file that says what its columns are loads with one click.
   */
  const columnsState: 'ok' | 'unsure' | 'bad' | null = !validation
    ? null
    : validation.errors.length > 0
      ? 'bad'
      : validation.warnings.length > 0 || !preview?.hints
        ? 'unsure'
        : 'ok';

  // The pick, summed up for the load card in the middle of the view (`LoadCard.tsx`).
  const goRef = useRef<() => void>(() => undefined);
  goRef.current = () => void doLoad();
  const dismissRef = useRef<() => void>(() => undefined);
  dismissRef.current = () => {
    setPicked([]);
    setPreview(null);
    setMapping(null);
    setSize(null);
    setPlan(null);
    setIdentity(null);
  };
  const pickName = picked.length ? describeSelection(picked) : '';
  const pickBytes = picked.length ? totalBytes(picked) : 0;
  useEffect(() => {
    if (!picked.length || loadedPick) {
      setPendingLoad(null);
      return;
    }
    setPendingLoad(
      {
        name: pickName,
        files: picked.length,
        matches: identity?.matches ?? picked.length,
        bytes: pickBytes,
        rows: size ? loadRows : null,
        // The converter's own name for its game where its hints give one (`"game": "War Thunder"`).
        game: hintedGame(preview?.hints) ?? identity?.game ?? null,
        map: identity?.map ?? null,
        // Still reading until the load plan has looked at every column.
        columns: columnsState === 'bad' || plan?.ready ? columnsState : null,
        verdict: fit?.verdict ?? null,
        stride,
        seconds: size ? loadSeconds : null,
        canLoad,
      },
      () => goRef.current(),
      () => dismissRef.current(),
    );
  }, [picked.length, loadedPick, pickName, pickBytes, identity, size, loadRows, loadSeconds, preview, columnsState, plan?.ready, fit?.verdict, stride, canLoad]);
  // The card goes with the panel's pick.
  useEffect(() => () => setPendingLoad(null), []);
  useEffect(() => {
    if (!autoLoad.current || !canLoad || !size) return;
    autoLoad.current = false;
    void doLoad();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canLoad, size]);

  // Pre-fill the stride that makes an oversized selection fit, but never
  // override a value that was set deliberately.
  const suggested = fullFit?.suggestedStride ?? 1;
  useEffect(() => {
    // Back down to 1 as well, when a pre-filter or a dropped column makes the load fit.
    if (!strideTouched) setStride(Math.max(1, suggested));
  }, [suggested, strideTouched]);

  return (
    <>
      <Section title={t('heat.sourcePanel.title')} defaultOpen>
        {/* What is loaded first, then the ways to open data: real data is the first step. */}
        <DatasetSummary />
        <div className="row wrap">
          {/* Not the primary button: over an empty view the start screen's Open files is, and after a pick Load is. */}
          <button onClick={() => void pick(false, true)}>
            {t('heat.sourcePanel.openFiles')}
          </button>
          <button onClick={() => void pick(true, true)}>{t('heat.sourcePanel.openFolder')}</button>
          <button onClick={() => openSessionFile()} title={t('heat.sourcePanel.openSessionTitle')}>
            {t('heat.sourcePanel.openSession')}
          </button>
          <button onClick={() => void downloadSession(engine, false)} title={t('heat.sourcePanel.saveSessionTitle')}>
            {t('heat.sourcePanel.saveSession')}
          </button>
        </div>
        <RecentSession />
        <div className="source-session-report">
          <SessionOpenReport />
        </div>
        <div
          ref={dropRef}
          className={`dropzone${hot ? ' hot' : ''}`}
          onDragOver={(e) => {
            e.preventDefault();
            setHot(true);
          }}
          onDragLeave={() => setHot(false)}
          onDrop={async (e) => {
            e.preventDefault();
            setHot(false);
            void accept(await filesFromDataTransfer(e.dataTransfer));
          }}
          onClick={() => void pick(false, true)}
        >
          {t('heat.sourcePanel.drop')}
          <br />
          <span style={{ opacity: 0.7 }}>{DATA_EXTENSIONS}</span>
        </div>

        {picked.length > 0 && (
          <div className="hint">
            <b>{describeSelection(picked)}</b>
            <br />
            {size
              ? t('heat.sourcePanel.selectionRows', {
                  count: picked.length,
                  size: num(totalBytes(picked) / 1e6, 1),
                  exact: size.exact ? 'yes' : 'no',
                  rows: formatCount(size.rows),
                })
              : t('heat.sourcePanel.selection', { count: picked.length, size: num(totalBytes(picked) / 1e6, 1) })}
          </div>
        )}
        {skipped.length > 0 && (
          <div className="hint">
            {t(skipped.length > 4 ? 'heat.sourcePanel.skippedMore' : 'heat.sourcePanel.skipped', {
              count: skipped.length,
              files: list(
                skipped.slice(0, 4).map((s) => t('heat.sourcePanel.skippedFile', { name: s.name, reason: s.reason })),
                'unit',
              ),
            })}
          </div>
        )}

        <LoadProgress />
        {loadError && <div className="err">{loadError}</div>}

        {validation && validation.errors.length > 0 && (
          <div className="err">
            {validation.errors.map((e, i) => (
              <div key={i}>· {e}</div>
            ))}
          </div>
        )}
        {validation && validation.warnings.length > 0 && (
          <div className="hint" style={{ color: 'var(--warm)' }}>
            {validation.warnings.map((w, i) => (
              <div key={i}>· {w}</div>
            ))}
          </div>
        )}
        {validation && validation.notes.length > 0 && (
          <div className="hint">
            {validation.notes.map((n, i) => (
              <div key={i}>· {n}</div>
            ))}
          </div>
        )}

        {footprint && fit && size && (
          <div className="field">
            <div className="label">
              <span>{t('heat.sourcePanel.memory')}</span>
              <span
                className="val"
                style={{
                  color:
                    fit.verdict === 'too-big'
                      ? 'var(--bad)'
                      : fit.verdict === 'tight'
                        ? 'var(--warm)'
                        : 'var(--good)',
                }}
              >
                {fit.verdict === 'fits'
                  ? t('heat.sourcePanel.fits')
                  : fit.verdict === 'tight'
                    ? t('heat.sourcePanel.tight')
                    : t('heat.sourcePanel.wontFit')}
              </span>
            </div>
            <div className="hint">
              {t('heat.sourcePanel.footprintRows', {
                rows: formatCount(loadRows),
                perRow: num(footprint.steadyPerRow, 0),
              })}
              <br />
              {t('heat.sourcePanel.footprintRam', {
                resident: formatBytes(footprint.steadyBytes),
                peak: formatBytes(footprint.peakBytes),
              })}
              <br />
              {t('heat.sourcePanel.footprintGpu', {
                gpu: formatBytes(footprint.gpuBytes),
                duration: formatDuration(loadSeconds),
              })}
              {budgets.gpuName ? (
                <>
                  <br />
                  {budgets.gpuName}
                </>
              ) : null}
            </div>
            {fit.messages.map((m, i) => (
              <div
                key={i}
                className="hint"
                style={{ color: fit.verdict === 'too-big' ? 'var(--bad)' : 'var(--warm)' }}
              >
                {m}
              </div>
            ))}

            <div className="row">
              <span style={{ color: 'var(--text-dim)', fontSize: 11 }}>{t('heat.sourcePanel.strideBefore')}</span>
              <input
                className="narrow"
                type="number"
                min={1}
                step={1}
                value={stride}
                onChange={(e) => {
                  setStrideTouched(true);
                  setStride(Math.max(1, Math.floor(Number(e.target.value) || 1)));
                }}
              />
              <span style={{ color: 'var(--text-dim)', fontSize: 11 }}>
                {stride === 1 ? t('heat.sourcePanel.strideAll') : t('heat.sourcePanel.strideAfter')}
              </span>
            </div>

            <div className="hint">
              {t('heat.sourcePanel.budget', {
                ram: formatBytes(budgets.ram),
                gpu: formatBytes(budgets.gpu),
                place: `${t('heat.viewPanel.performance')} → ${t('heat.viewPanel.budgets')}`,
              })}
            </div>
          </div>
        )}

        {mapping && preview && (
          <button className="primary" disabled={!canLoad} onClick={doLoad}>
            {fit?.verdict === 'too-big'
              ? t('heat.sourcePanel.tooLarge')
              : stride > 1
                ? t('heat.sourcePanel.loadStride', { count: picked.length, stride: num(stride, 0) })
                : t('heat.sourcePanel.load', { count: picked.length })}
          </button>
        )}
      </Section>

      <MemoryPanel />

      {mapping && preview && size && (
        <LoadPlan
          files={pickedFiles}
          preview={preview}
          mapping={mapping}
          setMapping={setMapping}
          totalRows={totalRows}
          excessBytes={excessBytes}
          onPlan={setPlan}
        />
      )}

      {mapping && preview && (
        // Under Advanced while the files say what their columns are: opened by itself only when the guess wants a look.
        <Section
          key={columnsState === 'ok' ? 'advanced' : 'mapping'}
          title={columnsState === 'ok' ? t('heat.sourcePanel.mappingAdvanced') : t('heat.sourcePanel.mapping')}
          defaultOpen={columnsState !== 'ok'}
        >
          {preview.format === 'csv' && (
            <div className="field">
              <div className="label">
                <span>{t('heat.sourcePanel.separator')}</span>
                <span className="val">{describeDelimiter(mapping.delimiter)}</span>
              </div>
              <select value={mapping.delimiter} onChange={(e) => void rePreview(e.target.value)}>
                {delimiterOptions().map((d) => (
                  <option key={d.value} value={d.value}>
                    {d.label}
                  </option>
                ))}
                {!DELIMITERS.includes(mapping.delimiter as never) &&
                  !delimiterOptions().some((d) => d.value === mapping.delimiter) && (
                    <option value={mapping.delimiter}>
                      {t('heat.sourcePanel.customDelimiter', { delimiter: describeDelimiter(mapping.delimiter) })}
                    </option>
                  )}
              </select>
              <input
                type="text"
                maxLength={1}
                placeholder={t('heat.sourcePanel.typeDelimiter')}
                onChange={(e) => e.target.value && void rePreview(e.target.value)}
              />
            </div>
          )}

          <div className="hint">
            <Rich text={t('heat.sourcePanel.positionHint')} />
          </div>
          <Select
            label="X"
            value={mapping.x}
            options={columnOptions}
            allowEmpty
            onChange={(x) => patch({ x })}
          />
          <Select
            label="Y"
            value={mapping.y}
            options={columnOptions}
            allowEmpty
            onChange={(y) => patch({ y })}
          />
          <Select
            label="Z"
            value={mapping.z}
            options={columnOptions}
            allowEmpty
            onChange={(z) => patch({ z })}
          />

          <div className="field">
            <div className="label">
              <span>{t('heat.sourcePanel.upAxis')}</span>
            </div>
            <select
              value={mapping.axes.up}
              onChange={(e) =>
                patch({ axes: { ...mapping.axes, up: e.target.value as 'y' | 'z' } })
              }
            >
              <option value="z">{t('heat.sourcePanel.zUp')}</option>
              <option value="y">{t('heat.sourcePanel.yUp')}</option>
            </select>
            <div className="hint">{t('heat.sourcePanel.upAxisHint')}</div>
          </div>

          <div className="field">
            <div className="label">
              <span>{t('heat.sourcePanel.unitScale')}</span>
              <span className="val">×{mapping.axes.scale}</span>
            </div>
            <div className="row">
              <button onClick={() => patch({ axes: { ...mapping.axes, scale: 1 } })}>
                {t('heat.sourcePanel.scaleMetres', { value: num(1, 0) })}
              </button>
              <button onClick={() => patch({ axes: { ...mapping.axes, scale: 0.01 } })}>
                {t('heat.sourcePanel.scaleCentimetres', { value: num(0.01, 2) })}
              </button>
              <NumberBox
                className="narrow"
                step={0.01}
                digits={6}
                value={mapping.axes.scale}
                onChange={(v) => patch({ axes: { ...mapping.axes, scale: v || 1 } })}
              />
            </div>
          </div>

          <div className="row">
            <Check
              label={t('heat.sourcePanel.flip', { axis: 'X' })}
              checked={mapping.axes.flipX}
              onChange={(flipX) => patch({ axes: { ...mapping.axes, flipX } })}
            />
            <Check
              label={t('heat.sourcePanel.flip', { axis: 'Y' })}
              checked={mapping.axes.flipY}
              onChange={(flipY) => patch({ axes: { ...mapping.axes, flipY } })}
            />
            <Check
              label={t('heat.sourcePanel.flip', { axis: 'Z' })}
              checked={mapping.axes.flipZ}
              onChange={(flipZ) => patch({ axes: { ...mapping.axes, flipZ } })}
            />
          </div>

          <Select
            label={t('heat.sourcePanel.time')}
            value={mapping.time}
            options={columnOptions}
            allowEmpty
            onChange={(time) => patch({ time })}
          />
          {!mapping.time && (
            <div className="hint" style={{ color: 'var(--warm)' }}>
              {t('heat.sourcePanel.noTime', { all: t('heat.timeline.all') })}
            </div>
          )}
          {mapping.time && isElapsedAxis(mapping.time) && (
            <div className="hint">{t('heat.sourcePanel.elapsedTime')}</div>
          )}
          {mapping.time && (
            <div className="field">
              <div className="label">
                <span>{t('heat.sourcePanel.timeUnitLabel')}</span>
              </div>
              <select
                value={mapping.timeUnit}
                onChange={(e) => patch({ timeUnit: e.target.value as TimeUnit })}
              >
                {(Object.keys(TIME_UNIT_LABELS) as TimeUnit[]).map((u) => (
                  <option key={u} value={u}>
                    {timeUnitLabel(u)}
                  </option>
                ))}
              </select>
              {preview.format === 'parquet' &&
                /TIMESTAMP|DATE/i.test(preview.logicalTypes[mapping.time] ?? '') && (
                  <div className="hint">
                    {t('heat.sourcePanel.parquetTime', { format: 'Parquet', type: preview.logicalTypes[mapping.time] })}
                  </div>
                )}
            </div>
          )}

          <Select
            label={t('heat.sourcePanel.personId')}
            value={mapping.personId}
            options={columnOptions}
            allowEmpty
            onChange={(personId) => patch({ personId })}
          />
          <Select
            label={t('heat.sourcePanel.session')}
            value={mapping.sessionId}
            options={columnOptions}
            allowEmpty
            onChange={(sessionId) => patch({ sessionId })}
          />
          <div className="hint">{t('heat.sourcePanel.sessionHint')}</div>
          <Select
            label={t('heat.sourcePanel.team')}
            value={mapping.teamId}
            options={columnOptions}
            allowEmpty
            onChange={(teamId) => patch({ teamId })}
          />
          <div className="hint">{t('heat.sourcePanel.teamHint')}</div>

          <div className="field">
            <div className="label">
              <span>{t('heat.sourcePanel.look')}</span>
            </div>
            <select
              value={mapping.lookMode}
              onChange={(e) =>
                patch({ lookMode: e.target.value as ColumnMapping['lookMode'] })
              }
            >
              <option value="none">{t('heat.sourcePanel.lookNone')}</option>
              <option value="yawPitch">{t('heat.sourcePanel.lookYawPitch')}</option>
              <option value="vector">{t('heat.sourcePanel.lookVector')}</option>
            </select>
          </div>
          {mapping.lookMode === 'yawPitch' && (
            <>
              <Select
                label={t('heat.sourcePanel.yaw')}
                value={mapping.yaw}
                options={columnOptions}
                allowEmpty
                onChange={(yaw) => patch({ yaw })}
              />
              <Select
                label={t('heat.sourcePanel.pitch')}
                value={mapping.pitch}
                options={columnOptions}
                allowEmpty
                onChange={(pitch) => patch({ pitch })}
              />
              <div className="field">
                <div className="label">
                  <span>{t('heat.sourcePanel.angleUnit')}</span>
                </div>
                <select
                  value={mapping.angleUnit}
                  onChange={(e) =>
                    patch({ angleUnit: e.target.value as 'degrees' | 'radians' })
                  }
                >
                  <option value="degrees">{t('heat.sourcePanel.degrees')}</option>
                  <option value="radians">{t('heat.sourcePanel.radians')}</option>
                </select>
              </div>
            </>
          )}
          {mapping.lookMode === 'vector' && (
            <>
              <Select
                label={t('heat.sourcePanel.dir', { axis: 'X' })}
                value={mapping.dirX}
                options={columnOptions}
                allowEmpty
                onChange={(dirX) => patch({ dirX })}
              />
              <Select
                label={t('heat.sourcePanel.dir', { axis: 'Y' })}
                value={mapping.dirY}
                options={columnOptions}
                allowEmpty
                onChange={(dirY) => patch({ dirY })}
              />
              <Select
                label={t('heat.sourcePanel.dir', { axis: 'Z' })}
                value={mapping.dirZ}
                options={columnOptions}
                allowEmpty
                onChange={(dirZ) => patch({ dirZ })}
              />
            </>
          )}

          <div className="field">
            <div className="label">
              <span>{t('heat.sourcePanel.keepForFiltering')}</span>
              <span className="val">{mapping.extra.length}</span>
            </div>
            <div className="hint">{t('heat.sourcePanel.keepHint', { bytes: 4 })}</div>
            {preview.columns.length > 1 && <SortControl sort={columnSort} />}
            <div className="team-list">
              {sortedColumns.map((c) => {
                const on = mapping.extra.includes(c);
                return (
                  <div className="team-row" key={c}>
                    <input
                      type="checkbox"
                      checked={on}
                      onChange={(e) =>
                        patch({
                          extra: e.target.checked
                            ? [...mapping.extra, c]
                            : mapping.extra.filter((n) => n !== c),
                          byHand: e.target.checked
                            ? [...(mapping.byHand ?? []), c]
                            : (mapping.byHand ?? []).filter((n) => n !== c),
                        })
                      }
                    />
                    <span className="name" title={c}>
                      {c}
                    </span>
                    {on && (
                      <select
                        style={{ width: 88 }}
                        value={(mapping.extraNumeric[c] ?? true) ? 'number' : 'category'}
                        onChange={(e) =>
                          patch({
                            extraNumeric: {
                              ...mapping.extraNumeric,
                              [c]: e.target.value === 'number',
                            },
                          })
                        }
                      >
                        <option value="number">{t('heat.sourcePanel.range')}</option>
                        <option value="category">{t('heat.sourcePanel.category')}</option>
                      </select>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <Check label={t('heat.sourcePanel.sample')} checked={showSample} onChange={setShowSample} />
          {showSample && (
            <div
              style={{
                overflow: 'auto',
                maxHeight: 200,
                fontSize: 10,
                fontFamily: 'ui-monospace, monospace',
                border: '1px solid var(--line)',
                borderRadius: 4,
              }}
            >
              <table style={{ borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    {preview.columns.map((c) => (
                      <th
                        key={c}
                        style={{
                          padding: '3px 6px',
                          textAlign: 'left',
                          position: 'sticky',
                          top: 0,
                          background: 'var(--panel-2)',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {c}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {preview.rows.slice(0, 12).map((r, i) => (
                    <tr key={i}>
                      {preview.columns.map((_, ci) => (
                        <td
                          key={ci}
                          style={{
                            padding: '2px 6px',
                            whiteSpace: 'nowrap',
                            color: 'var(--text-dim)',
                            maxWidth: 160,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          {r[ci] ?? ''}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Section>
      )}
    </>
  );
}

/**
 * A running load: what it is doing, how far, and Cancel. Its own component so
 * the progress, which changes ten times a second, redraws this and not the
 * panel round it (a mapping of a hundred columns took over a second of the
 * main thread across a load when it redrew with every report).
 */
export function LoadProgress() {
  const load = useStore((s) => s.load);
  if (!load.active) return null;
  return (
    <>
      <div className="hint">
        {load.rowsSoFar > 0 ? t('heat.sourcePanel.progressRows', { label: load.label, rows: formatCount(load.rowsSoFar) }) : load.label}
      </div>
      <div className="bar">
        <div style={{ width: `${((load.fraction ?? 0) * 100).toFixed(1)}%` }} />
      </div>
      <button onClick={() => loader.dispose()}>{t('heat.sourcePanel.cancel')}</button>
    </>
  );
}

/** The game a file's hints name, when they name one as text. */
function hintedGame(hints: unknown): string | null {
  const g = hints && typeof hints === 'object' ? (hints as { game?: unknown }).game : null;
  return typeof g === 'string' && g.trim() ? g.trim() : null;
}

function describeDelimiter(d: string): string {
  if (d === '\t') return t('heat.sourcePanel.tab');
  if (d === ' ') return t('heat.sourcePanel.space');
  return d;
}
