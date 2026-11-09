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
  const setDataset = useStore((s) => s.setDataset);
  const load = useStore((s) => s.load);
  const setLoad = useStore((s) => s.setLoad);

  const [picked, setPicked] = useState<PickedFile[]>([]);
  const [skipped, setSkipped] = useState<Array<{ name: string; reason: string }>>([]);
  const [preview, setPreview] = useState<SourcePreview | null>(null);
  const [mapping, setMapping] = useState<ColumnMapping | null>(null);
  const [size, setSize] = useState<SelectionSize | null>(null);
  const budgets = useStore((s) => s.budgets);
  const [stride, setStride] = useState(1);
  const [strideTouched, setStrideTouched] = useState(false);
  const [hot, setHot] = useState(false);
  const [showSample, setShowSample] = useState(false);
  const dropRef = useRef<HTMLDivElement>(null);

  const patch = (p: Partial<ColumnMapping>) =>
    setMapping((m) => (m ? { ...m, ...p } : m));

  const accept = useCallback(
    async (raw: PickedFile[], delimiter?: string) => {
      const { accepted, skipped: bad } = filterDataFiles(raw);
      setSkipped(bad);
      setPicked(accepted);
      setPreview(null);
      setMapping(null);
      setSize(null);
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
        setMapping({
          ...autoMap({
            columns: p.columns,
            rows: p.rows,
            numeric: p.numeric,
            logicalTypes: p.logicalTypes,
            hints: p.hints,
            // The preview samples one file, so the mapping has to be told how many
            // are coming: a column holding one value per file — which region, which
            // test run — looks constant in that sample and would be dropped as
            // unfilterable, exactly when merging the files makes it worth having.
            fileCount: accepted.length,
          }),
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

  const pick = async (directory: boolean, multiple: boolean) => {
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
    try {
      const ds = await loader.ingest(
        picked.map((p) => p.file),
        mapping,
        preview.columns,
        describeSelection(picked),
        stride,
        // Exact for Parquet, estimated for CSV; either way it lets the builder
        // allocate once instead of growing.
        size?.rows ?? 0,
        onProgress,
      );
      // The unit index a few milliseconds a frame, before the first render would build it all at once.
      setLoad({ active: true, label: t('heat.sourcePanel.indexing'), fraction: null, rowsSoFar: ds.count, error: null });
      await prepareUnits(ds);
      setDataset(ds);
      setLoad({ active: false, label: '', fraction: null, rowsSoFar: ds.count, error: null });
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
  const columnOptions = useMemo(() => (columns ?? []).map((c) => ({ value: c, label: c })), [columns]);

  const validation = mapping ? validateMapping(mapping, preview) : null;
  const totalRows = size?.rows ?? 0;
  const loadRows = Math.floor(totalRows / Math.max(1, stride));
  // The file count matters to the estimate: merging more than one adds a
  // `Source file` column, four bytes a row that no mapping mentions.
  const footprint = mapping ? estimateFootprint(mapping, loadRows, picked.length) : null;
  const fit = footprint ? checkFit(footprint, budgets) : null;
  // Full-size fit, so the panel can propose a stride before one is chosen.
  const fullFit =
    mapping && totalRows > 0
      ? checkFit(estimateFootprint(mapping, totalRows, picked.length), budgets)
      : null;
  const loadSeconds = estimateLoadSeconds(loadRows);
  const canLoad = !!validation?.ok && !load.active && fit?.verdict !== 'too-big';

  // Pre-fill the stride that makes an oversized selection fit, but never
  // override a value that was set deliberately.
  const suggested = fullFit?.suggestedStride ?? 1;
  useEffect(() => {
    if (suggested > 1 && !strideTouched) setStride(suggested);
  }, [suggested, strideTouched]);

  return (
    <>
      <Section title={t('heat.sourcePanel.title')} defaultOpen>
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
          <span style={{ opacity: 0.7 }}>.parquet · .csv · .tsv · .acmi · .json · .gpx · .kml · .kmz · .nmea · .igc · .fit</span>
        </div>

        <div className="row wrap">
          <button onClick={() => void pick(false, false)}>{t('heat.sourcePanel.oneFile')}</button>
          <button onClick={() => void pick(false, true)}>{t('heat.sourcePanel.files')}</button>
          <button onClick={() => void pick(true, true)}>{t('heat.sourcePanel.folder')}</button>
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

        {load.active && (
          <>
            <div className="hint">
              {load.rowsSoFar > 0
                ? t('heat.sourcePanel.progressRows', { label: load.label, rows: formatCount(load.rowsSoFar) })
                : load.label}
            </div>
            <div className="bar">
              <div style={{ width: `${((load.fraction ?? 0) * 100).toFixed(1)}%` }} />
            </div>
            <button onClick={() => loader.dispose()}>{t('heat.sourcePanel.cancel')}</button>
          </>
        )}
        {load.error && <div className="err">{load.error}</div>}

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

      {mapping && preview && (
        <Section title={t('heat.sourcePanel.mapping')} defaultOpen>
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
              <input
                className="narrow"
                type="number"
                step={0.01}
                value={mapping.axes.scale}
                onChange={(e) =>
                  patch({ axes: { ...mapping.axes, scale: Number(e.target.value) || 1 } })
                }
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
            <div className="team-list">
              {preview.columns.map((c) => {
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

function describeDelimiter(d: string): string {
  if (d === '\t') return t('heat.sourcePanel.tab');
  if (d === ' ') return t('heat.sourcePanel.space');
  return d;
}
