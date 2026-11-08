import { useEffect, useRef, useState } from 'react';
import { useStore } from '../../state/store';
import { useRaceStore } from '../../state/raceStore';
import { probeHostMemory } from '../../data/hostMemory';
import { markOverlay } from '../../match/overlay';
import { int, num, t, useLang } from '../../i18n';
import { Check, Section, Segmented } from '../controls';
import { useEngine } from '../EngineContext';
import { leanBudget, leanOverlayOf, loadLeanOverlay, overlayFiles, recolour, type LeanColour } from '../../overlay/lean/load';
import { useLeanStore } from '../../overlay/lean/leanState';

const MB = 1e6;

/**
 * The match overlay for many matches: their Parquet files read straight into
 * GPU tracks (overlay/lean), never as a full dataset - load progress and
 * cancel, then what was read, what it costs and whether anything was thinned,
 * the colouring, and the death markers.
 */
export function LeanOverlayPanel() {
  useLang();
  const engine = useEngine();
  const dataset = useStore((s) => s.dataset);
  const progress = useLeanStore((s) => s.progress);
  const error = useLeanStore((s) => s.error);
  const markers = useLeanStore((s) => s.markers);
  const markerSeconds = useLeanStore((s) => s.markerSeconds);
  const overlay = leanOverlayOf(dataset);
  const files = useRef<HTMLInputElement>(null);
  const folder = useRef<HTMLInputElement>(null);
  const [, tick] = useState(0);
  // The GPU's figures (bytes held, the dart size the frame time steers) move on their own: looked at twice a second.
  useEffect(() => {
    if (!overlay && !progress) return;
    const id = setInterval(() => tick((n) => n + 1), 500);
    return () => clearInterval(id);
  }, [overlay, progress]);

  const start = async (list: FileList | null) => {
    const picked = overlayFiles(Array.from(list ?? []));
    if (!picked.length) return;
    useLeanStore.getState().handle?.cancel();
    const host = await probeHostMemory();
    const budget = leanBudget({
      gpuMaxBufferBytes: engine?.gpuTracksMaxBytes ?? 0,
      vramBytes: host?.vramBytes ?? null,
      freeBytes: host?.freeBytes ?? null,
      totalBytes: host?.totalBytes ?? null,
      deviceMemoryGB: (navigator as { deviceMemory?: number }).deviceMemory ?? null,
    });
    const startedMs = performance.now();
    const name = picked.length === 1 ? picked[0].name.replace(/\.parquet$/i, '') : t('lean.name', { count: picked.length });
    const handle = loadLeanOverlay(picked, name, budget, (p) => {
      const prev = useLeanStore.getState().progress;
      if (p.phase === 'planned')
        useLeanStore.setState({
          progress: {
            ...(prev ?? {
              done: 0,
              total: 0,
              rows: 0,
              totalRows: 0,
              startedMs,
            }),
            phase: 'planned',
            samples: p.samples,
            keys: p.keys,
            level: p.level,
          },
        });
      else useLeanStore.setState({ progress: { ...prev, ...p, startedMs } });
    });
    useLeanStore.setState({
      handle,
      error: null,
      progress: {
        phase: 'footers',
        done: 0,
        total: picked.length,
        rows: 0,
        totalRows: 0,
        startedMs,
      },
    });
    try {
      const o = await handle.promise;
      markOverlay(o.built.dataset);
      const s = useStore.getState();
      s.setDataset(o.built.dataset);
      useRaceStore.getState().setTab('heat');
      s.setMode('team');
      s.patchTeam({ figures: true });
      // Played back, not every sample at once: the overlay keeps no samples but its keys on the GPU.
      s.patchTimeline({ mode: 'play' });
      s.seek(o.built.dataset.timeRange[0]);
      useLeanStore.setState({ overlay: o, progress: null, handle: null });
    } catch (e) {
      const err = e as Error & { detail?: string };
      useLeanStore.setState({
        progress: null,
        handle: null,
        error: err.message === 'cancelled' ? null : { key: err.message, detail: err.detail },
      });
    }
  };

  const info = overlay && engine ? engine.gpuTracksInfo() : null;
  const b = overlay?.built;
  const secs = progress ? (performance.now() - progress.startedMs) / 1000 : 0;
  const frac = progress && progress.total ? progress.done / progress.total : 0;
  const colour = (c: LeanColour) => {
    if (!overlay) return;
    const next = recolour(overlay, c);
    useLeanStore.setState({ overlay: next });
    tick((n) => n + 1);
  };
  const row = (k: string, v: string) => (
    <>
      <span>{t(k)}</span>
      <b>{v}</b>
    </>
  );
  return (
    <>
      {/* Outside the section, so the pickers are there while it is folded too. */}
      <input ref={files} data-lean="files" type="file" accept=".parquet" multiple hidden onChange={(e) => void start(e.target.files).finally(() => (e.target.value = ''))} />
      <input
        ref={(el) => {
          folder.current = el;
          el?.setAttribute('webkitdirectory', '');
        }}
        data-lean="folder"
        type="file"
        multiple
        hidden
        onChange={(e) => void start(e.target.files).finally(() => (e.target.value = ''))}
      />
      <Section title={t('lean.title')} defaultOpen={!!overlay || !!progress} right={b ? <span className="count">{int(b.groups.length)}</span> : undefined}>
        <div className="hint">{t('lean.hint')}</div>
        <div className="row wrap" style={{ gap: 6, margin: '4px 0' }}>
          <button className="small" disabled={!!progress} onClick={() => files.current?.click()}>
            {t('lean.pickFiles')}
          </button>
          <button className="small" disabled={!!progress} onClick={() => folder.current?.click()}>
            {t('lean.pickFolder')}
          </button>
        </div>
        {progress && (
          <div className="lean-progress">
            <div className="hint">
              {t(`lean.phase.${progress.phase}`)} ·{' '}
              {t('lean.progress', {
                done: int(progress.done),
                total: int(progress.total),
                rows: int(progress.rows),
                seconds: num(secs, 1),
              })}
            </div>
            <div
              style={{
                height: 4,
                background: 'var(--line, #333)',
                borderRadius: 2,
                margin: '4px 0',
              }}
            >
              <div
                style={{
                  height: 4,
                  width: `${Math.round(frac * 100)}%`,
                  background: 'var(--accent, #4af)',
                  borderRadius: 2,
                }}
              />
            </div>
            {progress.keys !== undefined && progress.samples !== undefined && (
              <div className="hint">
                {t(progress.level ? 'lean.plannedThin' : 'lean.planned', {
                  samples: int(progress.samples),
                  keys: int(progress.keys),
                })}
              </div>
            )}
            <button className="small" onClick={() => useLeanStore.getState().handle?.cancel()}>
              {t('lean.cancel')}
            </button>
          </div>
        )}
        {error && <div className="hint warn">{t(`lean.error.${error.key}`, { detail: error.detail ?? '' })}</div>}
        {b && overlay && (
          <>
            <div
              className="kv lean-stats"
              style={{
                display: 'grid',
                gridTemplateColumns: 'auto 1fr',
                gap: '2px 10px',
                margin: '6px 0',
              }}
            >
              {row('lean.stat.matches', int(b.groups.length))}
              {row('lean.stat.units', int(b.tracks))}
              {row('lean.stat.rows', int(b.rows))}
              {row('lean.stat.samples', int(b.samples))}
              {row(
                'lean.stat.keys',
                b.tolerance
                  ? t('lean.keysThin', {
                      keys: int(b.keys),
                      metres: num(b.tolerance, 2),
                    })
                  : t('lean.keysAll', { keys: int(b.keys) }),
              )}
              {row(
                'lean.stat.memory',
                t('lean.megabytes', {
                  cpu: int(overlay.store.bytes / MB),
                  gpu: int(info?.gpuMB ?? 0),
                }),
              )}
              {row('lean.stat.load', t('lean.seconds', { seconds: num(overlay.loadMs / 1000, 1) }))}
              {row(
                'lean.stat.budget',
                t(`lean.limit.${overlay.budget.limit}`, {
                  keys: int(overlay.budget.maxKeys),
                }),
              )}
              {info && row('lean.stat.dart', t('lean.pixels', { px: num(info.dartPx, 1) }))}
              {b.markers.count > 0 && row('lean.stat.deaths', int(b.markers.count))}
            </div>
            {overlay.skipped.length > 0 && (
              <div className="hint warn">
                {t('lean.skipped', {
                  count: overlay.skipped.length,
                  files: overlay.skipped.slice(0, 3).join(', '),
                })}
              </div>
            )}
            <Segmented<LeanColour>
              value={overlay.colour}
              options={[
                { value: 'team', label: t('lean.byTeam') },
                { value: 'group', label: t('lean.byMatch') },
              ]}
              onChange={colour}
            />
            {b.markers.count > 0 && (
              <>
                <Check label={t('lean.markers')} checked={markers} onChange={(v) => useLeanStore.setState({ markers: v })} />
                {markers && (
                  <Segmented<string>
                    value={String(markerSeconds)}
                    options={[
                      {
                        value: '10',
                        label: t('lean.seconds', { seconds: 10 }),
                      },
                      {
                        value: '30',
                        label: t('lean.seconds', { seconds: 30 }),
                      },
                      {
                        value: '120',
                        label: t('lean.seconds', { seconds: 120 }),
                      },
                      { value: '0', label: t('lean.markerAll') },
                    ]}
                    onChange={(v) => useLeanStore.setState({ markerSeconds: Number(v) })}
                  />
                )}
              </>
            )}
          </>
        )}
      </Section>
    </>
  );
}
