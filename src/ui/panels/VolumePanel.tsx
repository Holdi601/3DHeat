import { useEffect, useMemo, useRef, useState } from 'react';
import { Check, NumberField, Section, Segmented } from '../controls';
import { useEngine } from '../EngineContext';
import { num, t, useLang } from '../../i18n';
import { useStore } from '../../state/store';
import { selectedVolume, useVolumeStore, type DrawKind } from '../../volumes/store';
import { gpuVolumeFit } from '../../volumes/gpu';
import { computeStatsAsync, SELECTION_ID, type ColumnStats, type StatsResult, type VolumeStats } from '../../volumes/stats';
import { currentScope, scopeKey } from '../../volumes/scope';
import { downloadBlob, exportTest, saveSink, selectRows, statsCsv, statsJson, writeRows, type ExportFormat } from '../../volumes/export';
import { shapeHeights, volumesFromJson, volumesToJson, withHeights, type Volume, type VolumeFilter } from '../../volumes/volume';

const TOOLS: { kind: DrawKind; label: string; title: string }[] = [
  { kind: 'box', label: 'volumes.tool.box', title: 'volumes.tool.boxTitle' },
  { kind: 'ngon', label: 'volumes.tool.ngon', title: 'volumes.tool.ngonTitle' },
  { kind: 'polygon', label: 'volumes.tool.polygon', title: 'volumes.tool.polygonTitle' },
  { kind: 'cylinder', label: 'volumes.tool.cylinder', title: 'volumes.tool.cylinderTitle' },
  { kind: 'sphere', label: 'volumes.tool.sphere', title: 'volumes.tool.sphereTitle' },
];

const pct = (v: number) => `${num(v * 100, v < 0.001 ? 3 : v < 0.1 ? 2 : 1)}%`;
const big = (v: number | null) => (v === null ? '—' : num(v, 0));
const dec = (v: number) => (Number.isFinite(v) ? num(v, Math.abs(v) >= 100 ? 1 : Math.abs(v) >= 1 ? 2 : 4) : '—');

/** Seconds as h:mm:ss or m:ss. */
function duration(s: number | null): string {
  if (s === null) return '—';
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = Math.floor(s % 60);
  return h > 0 ? `${h}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}` : `${m}:${String(sec).padStart(2, '0')}`;
}

/** A small bar chart of counts. */
function Bars({ values, color }: { values: number[]; color: string }) {
  const max = Math.max(1, ...values);
  const w = 100 / Math.max(1, values.length);
  return (
    <svg viewBox="0 0 100 24" preserveAspectRatio="none" style={{ width: '100%', height: 24, display: 'block' }}>
      {values.map((v, i) => (
        <rect key={i} x={i * w} y={24 - (v / max) * 24} width={Math.max(0.2, w - 0.3)} height={(v / max) * 24} fill={color} />
      ))}
    </svg>
  );
}

/**
 * Volumes: draw boxes, prisms, cylinders and spheres in the level, measure the
 * data inside them, filter the views by them and export what they hold.
 */
export function VolumePanel() {
  useLang();
  const engine = useEngine();
  const dataset = useStore((s) => s.dataset);
  const vs = useVolumeStore();
  const { volumes, selected, filter, drawing, ngonSides, statsLayout, focusNonce } = vs;
  const sel = selectedVolume(vs);
  const dropped = useMemo(() => new Set(gpuVolumeFit(volumes).dropped), [volumes]);
  const fileRef = useRef<HTMLInputElement>(null);

  // ---- live statistics: recomputed when the volumes, the filters or the window change
  const [stats, setStats] = useState<StatsResult | null>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const timeline = useStore((st) => st.timeline);
  const filters = useStore((st) => st.filters);
  const teamVisibility = useStore((st) => st.teamVisibility);
  const mode = useStore((st) => st.mode);
  const session = useStore((st) => st.team.session);
  // Whole seconds: a playing window recounts at most once a second.
  const playhead = Math.floor(engine?.live.playhead ?? timeline.playhead);
  const scope = useMemo(
    () => currentScope(useStore.getState(), playhead),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [dataset, timeline.mode, timeline.window, timeline.windowSeconds, timeline.defaultLifetime, filters, teamVisibility, mode, session, playhead],
  );
  const key = scopeKey(scope);
  const visibleVolumes = useMemo(() => volumes.filter((v) => v.visible), [volumes]);
  useEffect(() => {
    if (!dataset || visibleVolumes.length === 0) {
      setStats(null);
      setProgress(null);
      return;
    }
    const ctl = new AbortController();
    const timer = setTimeout(() => {
      setProgress(0);
      computeStatsAsync(dataset, visibleVolumes, scope, useStore.getState().heat.radius, t('volumes.stats.selection'), {
        signal: ctl.signal,
        onProgress: (f) => setProgress(f),
      })
        .then((r) => {
          setStats(r);
          setProgress(null);
        })
        .catch(() => undefined);
    }, 250);
    return () => {
      clearTimeout(timer);
      ctl.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataset, visibleVolumes, key]);

  // ---- export
  const [format, setFormat] = useState<ExportFormat>('csv');
  const [shownOnly, setShownOnly] = useState(true);
  const [exporting, setExporting] = useState<{ phase: string; f: number; ctl: AbortController } | null>(null);
  const [exportMsg, setExportMsg] = useState<string | null>(null);
  const runExport = async (which: string | null) => {
    if (!dataset) return;
    const base = (dataset.name || 'data').replace(/[^\w.-]+/g, '_').slice(0, 60);
    const name = `${base}-${which ? (volumes.find((v) => v.id === which)?.name ?? 'volume').replace(/[^\w.-]+/g, '_') : 'volumes'}.${format}`;
    const sink = await saveSink(name, format === 'csv' ? 'text/csv' : 'application/vnd.apache.parquet');
    if (!sink) return;
    const ctl = new AbortController();
    setExportMsg(null);
    try {
      setExporting({ phase: t('volumes.export.selecting'), f: 0, ctl });
      const rows = await selectRows(dataset, exportTest(volumes, which), shownOnly ? scope : null, {
        signal: ctl.signal,
        onProgress: (f) => setExporting({ phase: t('volumes.export.selecting'), f, ctl }),
      });
      setExporting({ phase: t('volumes.export.writing'), f: 0, ctl });
      await writeRows(dataset, rows, volumes, format, sink, {
        signal: ctl.signal,
        onProgress: (f) => setExporting({ phase: t('volumes.export.writing'), f, ctl }),
      });
      setExportMsg(t('volumes.export.done', { rows: num(rows.length, 0), name }));
    } catch (e) {
      setExportMsg((e as Error).name === 'AbortError' ? t('volumes.export.cancelled') : String((e as Error).message ?? e));
    } finally {
      setExporting(null);
    }
  };

  const importFile = async (file: File) => {
    try {
      const list = volumesFromJson(await file.text());
      vs.addMany(list);
      setExportMsg(t('volumes.io.imported', { count: list.length }));
    } catch {
      setExportMsg(t('volumes.io.badFile'));
    }
  };

  const shownStats = stats?.volumes.filter((s) => (statsLayout === 'compare' ? true : s.id === (sel?.id ?? (stats.volumes.length > 1 ? SELECTION_ID : stats.volumes[0]?.id)))) ?? [];

  return (
    <Section key={focusNonce} title={t('volumes.title')} defaultOpen={focusNonce > 0 || volumes.length > 0}>
      {!dataset && <div className="hint">{t('volumes.noData')}</div>}
      <div className="row" style={{ flexWrap: 'wrap', gap: 4 }}>
        {TOOLS.map((tool) => (
          <button
            key={tool.kind}
            className={drawing === tool.kind ? 'on' : ''}
            title={t(tool.title)}
            onClick={() => (drawing === tool.kind ? vs.cancelDraw() : vs.startDraw(tool.kind))}
          >
            {tool.kind === 'ngon' ? t(tool.label, { sides: ngonSides }) : t(tool.label)}
          </button>
        ))}
      </div>
      {drawing === 'ngon' && <NumberField label={t('volumes.tool.sides')} value={ngonSides} step={1} onChange={vs.setNgonSides} />}
      <div className="hint">{drawing ? t(`volumes.hint.${drawing}`) : volumes.length ? t('volumes.hint.edit') : t('volumes.hint.start')}</div>

      <Segmented<VolumeFilter>
        value={filter}
        options={[
          { value: 'off', label: t('volumes.filter.off'), title: t('volumes.filter.offTitle') },
          { value: 'inside', label: t('volumes.filter.inside'), title: t('volumes.filter.insideTitle') },
          { value: 'outside', label: t('volumes.filter.outside'), title: t('volumes.filter.outsideTitle') },
        ]}
        onChange={vs.setFilter}
      />

      {volumes.map((v) => (
        <VolumeRow key={v.id} v={v} selected={v.id === selected} dropped={dropped.has(v.id)} />
      ))}
      {sel && <VolumeEditor v={sel} />}

      <div className="row" style={{ flexWrap: 'wrap', gap: 4, marginTop: 6 }}>
        <button disabled={vs.past.length === 0} onClick={vs.undo} title={t('volumes.io.undoTitle')}>
          {t('volumes.io.undo')}
        </button>
        <button disabled={vs.future.length === 0} onClick={vs.redo} title={t('volumes.io.redoTitle')}>
          {t('volumes.io.redo')}
        </button>
        <button disabled={volumes.length === 0} onClick={() => downloadBlob('volumes.json', new Blob([volumesToJson(volumes)], { type: 'application/json' }))}>
          {t('volumes.io.save')}
        </button>
        <button onClick={() => fileRef.current?.click()}>{t('volumes.io.load')}</button>
        <button disabled={volumes.length === 0} onClick={vs.clear}>
          {t('volumes.io.clear')}
        </button>
        <input
          ref={fileRef}
          type="file"
          accept=".json,application/json"
          style={{ display: 'none' }}
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) void importFile(f);
            e.target.value = '';
          }}
        />
      </div>

      {dataset && visibleVolumes.length > 0 && (
        <>
          <h4 style={{ margin: '10px 0 4px' }}>{t('volumes.stats.title')}</h4>
          <Segmented
            value={statsLayout}
            options={[
              { value: 'selected', label: t('volumes.stats.one') },
              { value: 'compare', label: t('volumes.stats.compare') },
            ]}
            onChange={vs.setStatsLayout}
          />
          {progress !== null && <div className="hint">{t('volumes.stats.counting', { pct: num(progress * 100, 0) })}</div>}
          {stats && statsLayout === 'compare' && <CompareTable stats={stats} />}
          {stats && statsLayout === 'selected' && shownStats.map((s) => <StatsView key={s.id} s={s} stats={stats} />)}
          {stats && (
            <div className="row" style={{ gap: 4, marginTop: 6 }}>
              <button onClick={() => downloadBlob('volume-stats.csv', new Blob([statsCsv(stats)], { type: 'text/csv' }))}>{t('volumes.export.statsCsv')}</button>
              <button onClick={() => downloadBlob('volume-stats.json', new Blob([statsJson(stats, volumes)], { type: 'application/json' }))}>
                {t('volumes.export.statsJson')}
              </button>
            </div>
          )}

          <h4 style={{ margin: '10px 0 4px' }}>{t('volumes.export.title')}</h4>
          <Segmented<ExportFormat>
            value={format}
            options={[
              { value: 'csv', label: 'CSV' },
              { value: 'parquet', label: 'Parquet' },
            ]}
            onChange={setFormat}
          />
          <Check label={t('volumes.export.shownOnly')} checked={shownOnly} onChange={setShownOnly} title={t('volumes.export.shownOnlyTitle')} />
          {exporting ? (
            <div className="row" style={{ gap: 6, alignItems: 'center' }}>
              <span className="hint">
                {exporting.phase} {num(exporting.f * 100, 0)}%
              </span>
              <button onClick={() => exporting.ctl.abort()}>{t('volumes.export.cancel')}</button>
            </div>
          ) : (
            <div className="row" style={{ gap: 4, flexWrap: 'wrap' }}>
              <button onClick={() => void runExport(null)} title={t('volumes.export.allTitle')}>
                {t('volumes.export.all')}
              </button>
              {sel && <button onClick={() => void runExport(sel.id)}>{t('volumes.export.one', { name: sel.name })}</button>}
            </div>
          )}
        </>
      )}
      {exportMsg && <div className="hint">{exportMsg}</div>}
    </Section>
  );
}

function VolumeRow({ v, selected, dropped }: { v: Volume; selected: boolean; dropped: boolean }) {
  const vs = useVolumeStore.getState();
  return (
    <div
      className="row"
      style={{ gap: 4, alignItems: 'center', padding: '2px 4px', borderRadius: 4, background: selected ? 'rgba(255,255,255,0.08)' : undefined }}
      onClick={() => vs.select(v.id)}
    >
      <input type="checkbox" checked={v.visible} title={t('volumes.row.visible')} onChange={(e) => vs.update(v.id, { visible: e.target.checked })} />
      <input type="color" value={v.color} title={t('volumes.row.color')} style={{ width: 22, height: 18, padding: 0, border: 0 }} onChange={(e) => vs.update(v.id, { color: e.target.value })} />
      <input type="text" value={v.name} style={{ flex: '1 1 80px', minWidth: 60, width: 'auto' }} onChange={(e) => vs.update(v.id, { name: e.target.value })} />
      <select value={v.op} title={t('volumes.row.opTitle')} style={{ flex: '0 0 auto', width: 84 }} onChange={(e) => vs.update(v.id, { op: e.target.value === 'exclude' ? 'exclude' : 'include' })}>
        <option value="include">{t('volumes.row.include')}</option>
        <option value="exclude">{t('volumes.row.exclude')}</option>
      </select>
      <button title={t('volumes.row.duplicate')} onClick={() => vs.duplicate(v.id)}>
        ⧉
      </button>
      <button title={t('volumes.row.delete')} onClick={() => vs.remove(v.id)}>
        ✕
      </button>
      {dropped && (
        <span className="hint" style={{ color: 'var(--warm)' }} title={t('volumes.row.droppedTitle')}>
          !
        </span>
      )}
    </div>
  );
}

/** Typed heights and turn for the selected volume. */
function VolumeEditor({ v }: { v: Volume }) {
  const vs = useVolumeStore.getState();
  const [floor, ceil] = shapeHeights(v.shape);
  const s = v.shape;
  const deg = 180 / Math.PI;
  return (
    <div style={{ marginTop: 4 }}>
      <NumberField label={t('volumes.edit.floor')} value={Number(floor.toFixed(3))} onChange={(f) => vs.update(v.id, { shape: withHeights(s, f, ceil) })} />
      <NumberField label={t('volumes.edit.ceil')} value={Number(ceil.toFixed(3))} onChange={(c) => vs.update(v.id, { shape: withHeights(s, floor, c) })} />
      {s.kind === 'box' && (
        <>
          <NumberField label={t('volumes.edit.yaw')} value={Number((s.yaw * deg).toFixed(2))} onChange={(a) => vs.update(v.id, { shape: { ...s, yaw: a / deg } })} />
          <NumberField label={t('volumes.edit.pitch')} value={Number((s.pitch * deg).toFixed(2))} onChange={(a) => vs.update(v.id, { shape: { ...s, pitch: a / deg } })} />
          <NumberField label={t('volumes.edit.roll')} value={Number((s.roll * deg).toFixed(2))} onChange={(a) => vs.update(v.id, { shape: { ...s, roll: a / deg } })} />
        </>
      )}
      {(s.kind === 'sphere' || s.kind === 'cylinder') && (
        <NumberField label={t('volumes.edit.radius')} value={Number(s.radius.toFixed(3))} onChange={(r) => vs.update(v.id, { shape: { ...s, radius: Math.max(1e-3, r) } })} />
      )}
    </div>
  );
}

function Line({ label, value }: { label: string; value: string }) {
  return (
    <div className="line">
      <span>{label}</span>
      <b>{value}</b>
    </div>
  );
}

function StatsView({ s }: { s: VolumeStats; stats: StatsResult }) {
  const [open, setOpen] = useState<string | null>(null);
  return (
    <div className="overlay" style={{ position: 'static', minWidth: 0, marginTop: 6, borderLeft: `3px solid ${s.color}` }}>
      <b>{s.name}</b>
      <Line label={t('volumes.stats.rows')} value={`${big(s.rows)} · ${pct(s.shareShown)}`} />
      <Line label={t('volumes.stats.rowsAll')} value={`${big(s.rowsAll)} · ${pct(s.shareAll)}`} />
      {s.persons !== null && <Line label={t('volumes.stats.players')} value={big(s.persons)} />}
      {s.teams !== null && <Line label={t('volumes.stats.teams')} value={big(s.teams)} />}
      {s.sessions !== null && <Line label={t('volumes.stats.matches')} value={big(s.sessions)} />}
      {s.dwell !== null && <Line label={t('volumes.stats.dwell')} value={duration(s.dwell)} />}
      {s.entries !== null && <Line label={t('volumes.stats.entries')} value={`${big(s.entries)} / ${big(s.exits)}`} />}
      <Line label={t('volumes.stats.peak')} value={t('volumes.stats.density', { v: dec(s.peakDensity), cell: dec(s.cellSize) })} />
      <Line label={t('volumes.stats.mean')} value={dec(s.meanDensity)} />
      {s.volume !== null && <Line label={t('volumes.stats.size')} value={t('volumes.stats.sizeValue', { v: dec(s.volume), a: dec(s.footprint ?? 0) })} />}
      {s.timeHist && (
        <>
          <div className="hint">{t('volumes.stats.time')}</div>
          <Bars values={s.timeHist} color={s.color} />
        </>
      )}
      <hr />
      {s.columns.map((c) => (
        <ColumnView key={c.name} c={c} open={open === c.name} toggle={() => setOpen(open === c.name ? null : c.name)} color={s.color} />
      ))}
    </div>
  );
}

function ColumnView({ c, open, toggle, color }: { c: ColumnStats; open: boolean; toggle: () => void; color: string }) {
  const head =
    c.kind === 'category'
      ? c.top[0]
        ? `${c.top[0].label} ${pct(c.top[0].share)}`
        : '—'
      : t('volumes.stats.meanOf', { v: dec(c.mean), all: dec(c.overallMean) });
  return (
    <div>
      <div className="line" style={{ cursor: 'pointer' }} onClick={toggle}>
        <span>
          {open ? '▾' : '▸'} {c.name}
        </span>
        <b>{head}</b>
      </div>
      {open && c.kind === 'category' && (
        <table style={{ width: '100%', fontSize: 11 }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'left' }}>{t('volumes.stats.value')}</th>
              <th>{t('volumes.stats.count')}</th>
              <th>{t('volumes.stats.share')}</th>
              <th title={t('volumes.stats.liftTitle')}>{t('volumes.stats.lift')}</th>
            </tr>
          </thead>
          <tbody>
            {c.top.map((v) => (
              <tr key={v.label}>
                <td style={{ maxWidth: 110, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{v.label}</td>
                <td style={{ textAlign: 'right' }}>{big(v.count)}</td>
                <td style={{ textAlign: 'right' }}>{pct(v.share)}</td>
                <td style={{ textAlign: 'right', color: v.lift > 1.2 ? 'var(--warm)' : undefined }}>{num(v.lift, 2)}×</td>
              </tr>
            ))}
          </tbody>
          {c.distinct > c.top.length && (
            <tfoot>
              <tr>
                <td colSpan={4} className="hint">
                  {t('volumes.stats.more', { count: c.distinct - c.top.length })}
                </td>
              </tr>
            </tfoot>
          )}
        </table>
      )}
      {open && c.kind === 'number' && (
        <div>
          <Line label={t('volumes.stats.range')} value={`${dec(c.min)} … ${dec(c.max)}`} />
          <Line label={t('volumes.stats.median')} value={`≈${dec(c.median)}`} />
          <Line label={t('volumes.stats.p5p95')} value={`≈${dec(c.p5)} … ≈${dec(c.p95)}`} />
          <Bars values={c.hist} color={color} />
        </div>
      )}
    </div>
  );
}

/** Every volume side by side: the headline numbers in one table. */
function CompareTable({ stats }: { stats: StatsResult }) {
  const rows: [string, (s: VolumeStats) => string][] = [
    [t('volumes.stats.rows'), (s) => big(s.rows)],
    [t('volumes.stats.share'), (s) => pct(s.shareShown)],
    [t('volumes.stats.players'), (s) => big(s.persons)],
    [t('volumes.stats.dwell'), (s) => duration(s.dwell)],
    [t('volumes.stats.entries'), (s) => big(s.entries)],
    [t('volumes.stats.peak'), (s) => dec(s.peakDensity)],
    [t('volumes.stats.mean'), (s) => dec(s.meanDensity)],
  ];
  // The top value of each categorical column, per volume: what differs between them.
  const cats = stats.volumes[0]?.columns.filter((c) => c.kind === 'category').map((c) => c.name) ?? [];
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', fontSize: 11 }}>
        <thead>
          <tr>
            <th />
            {stats.volumes.map((s) => (
              <th key={s.id} style={{ color: s.color }}>
                {s.name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map(([label, f]) => (
            <tr key={label}>
              <td>{label}</td>
              {stats.volumes.map((s) => (
                <td key={s.id} style={{ textAlign: 'right' }}>
                  {f(s)}
                </td>
              ))}
            </tr>
          ))}
          {cats.map((name) => (
            <tr key={name}>
              <td>{name}</td>
              {stats.volumes.map((s) => {
                const c = s.columns.find((x) => x.name === name);
                const top = c && c.kind === 'category' ? c.top[0] : null;
                return (
                  <td key={s.id} style={{ textAlign: 'right' }} title={top ? `${pct(top.share)} · ${num(top.lift, 2)}×` : ''}>
                    {top ? top.label : '—'}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
