import { useEffect, useRef, useState } from 'react';
import { pathLength, poseAlong, prepare, retimeKey, type Keyframe, type SegmentEase } from '../../render/campath';
import { NumberBox } from '../NumberBox';
import { renderPath, type RecordProgress, type VideoContainer } from '../../render/record';
import { pathsToJson, readPaths, usePathLibrary } from '../../render/pathLibrary';
import { useStore } from '../../state/store';
import { Rich, Section, Segmented, Slider } from '../controls';
import { useEngine } from '../EngineContext';
import { int, num, t } from '../../i18n';

/**
 * Camera path: keyframes, a scrub to preview them, and a render.
 *
 * Keyframes are captured from wherever the camera is rather than typed. Flying
 * to a viewpoint is the natural way to choose one, and a panel that asked for six
 * numbers per key would mean composing a shot arithmetically.
 *
 * The render is the reason the panel exists. Playback draws a stochastic estimate
 * that only becomes exact once the view holds still, so recording a moving camera
 * in real time records the grain; the offline pass parks the camera at each output
 * frame, waits for the picture to become exact, and writes that. See
 * `render/record.ts`.
 */
export function PathPanel() {
  const engine = useEngine();
  const path = useStore((s) => s.path);
  const patchPath = useStore((s) => s.patchPath);
  const dataset = useStore((s) => s.dataset);
  const timeline = useStore((s) => s.timeline);

  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState<RecordProgress | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const abort = useRef<AbortController | null>(null);
  const url = useRef<string | null>(null);

  // Revoke the previous object URL when a new render replaces it, and on
  // unmount. A held blob URL keeps the whole video alive in memory, and these run
  // to tens of megabytes.
  useEffect(
    () => () => {
      if (url.current) URL.revokeObjectURL(url.current);
    },
    [],
  );

  const keys = prepare(path.keys);

  const capture = () => {
    if (!engine) return;
    const c = engine.camera;
    const fov = useStore.getState().camera.fov;
    // Placed at the end, evenly re-spaced. Even spacing is the useful default:
    // keys are captured in the order the shot runs, and a key that lands on top
    // of another because both were captured "at the end" is a discontinuity.
    const next: Keyframe[] = [
      ...keys,
      { u: 1, x: c.position.x, y: c.position.y, z: c.position.z, yaw: c.yawDegrees, pitch: c.pitchDegrees, fov },
    ];
    patchPath({ keys: respace(next) });
  };

  // A key's time, seconds into the video; kept between its neighbours, and
  // the last key's is the duration (`retimeKey`).
  const setKeyTime = (i: number, sec: number) => {
    const next = retimeKey(keys, i, sec, path.seconds);
    if (next) patchPath(next);
  };
  const setKeyEase = (i: number, ease: SegmentEase) => patchPath({ keys: keys.map((k, j) => (j === i ? { ...k, ease } : k)) });

  const removeKey = (i: number) => {
    const next = keys.filter((_, j) => j !== i);
    patchPath({ keys: respace(next) });
  };

  const goTo = (k: Keyframe) => {
    if (!engine) return;
    engine.camera.position.set(k.x, k.y, k.z);
    engine.camera.setOrientationDegrees(k.yaw, k.pitch);
    engine.camera.moved = true;
    useStore.getState().patchCamera({ fov: k.fov });
  };

  // Preview: drive the camera from the path while the scrub is being used, so a
  // path can be judged before spending minutes rendering it.
  useEffect(() => {
    if (!engine || !path.showPreview) return;
    const pose = poseAlong(path.keys, path.preview, path.easing, path.timing);
    if (!pose) return;
    engine.camera.position.set(pose.x, pose.y, pose.z);
    engine.camera.setOrientationDegrees(pose.yaw, pose.pitch);
    engine.camera.moved = true;
    const s = useStore.getState();
    if (Math.abs(s.camera.fov - pose.fov) > 1e-4) s.patchCamera({ fov: pose.fov });
    // The playhead too, since a render moves both together and a preview that
    // only moved the camera would show the wrong data at every position.
    if (s.dataset) {
      const [lo, hi] = [s.dataset.timeRange[0], s.dataset.timeRange[1]];
      s.seek(lo + (hi - lo) * path.preview);
    }
  }, [engine, path.showPreview, path.preview, path.easing, path.keys, path.timing]);

  const run = async () => {
    if (!engine) return;
    setBusy(true);
    setError(null);
    setResult(null);
    setProgress(null);
    abort.current = new AbortController();
    try {
      const out = await renderPath(engine, {
        keys: path.keys,
        easing: path.easing,
        timing: path.timing,
        container: path.container,
        size: outputSize(path),
        seconds: path.seconds,
        fps: path.fps,
        kbps: path.kbps,
        maxWaitFrames: path.maxWaitFrames,
        onProgress: setProgress,
        signal: abort.current.signal,
      });
      if (url.current) URL.revokeObjectURL(url.current);
      url.current = URL.createObjectURL(out.blob);
      const a = document.createElement('a');
      a.href = url.current;
      a.download = `3dheat-${out.width}x${out.height}-${out.frames}f.${out.ext}`;
      a.click();
      const summary = {
        count: out.frames,
        width: int(out.width),
        height: int(out.height),
        size: num(out.blob.size / 1e6, 1),
        unconverged: out.unconverged,
      };
      setResult(
        out.unconverged > 0
          ? t('heat.pathPanel.resultInexact', summary)
          : t('heat.pathPanel.resultExact', summary),
      );
    } catch (e) {
      const cancelled = (e instanceof DOMException && e.name === 'AbortError') || abort.current?.signal.aborted;
      setError(cancelled ? t('heat.pathPanel.cancelled') : e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
      abort.current = null;
    }
  };

  const frames = Math.max(1, Math.round(path.seconds * path.fps));
  const metres = pathLength(path.keys, path.easing);

  return (
    <Section title={t('heat.pathPanel.title')}>
      <div className="hint">{t('heat.pathPanel.hint')}</div>

      <div className="row">
        <button onClick={capture} disabled={busy || !engine}>
          {t('heat.pathPanel.addKey')}
        </button>
        <button onClick={() => patchPath({ keys: [] })} disabled={busy || keys.length === 0}>
          {t('heat.pathPanel.clear')}
        </button>
      </div>

      {keys.length === 0 ? (
        <div className="hint">{t('heat.pathPanel.noKeys')}</div>
      ) : (
        <div className="keylist">
          {keys.map((k, i) => (
            <div className="keyrow" key={i}>
              <button className="link" title={t('heat.pathPanel.goTo')} onClick={() => goTo(k)}>
                {i + 1}
              </button>
              <span className="mono">
                {t('heat.pathPanel.keyPosition', { x: num(k.x, 0), y: num(k.y, 0), z: num(k.z, 0) })}
              </span>
              <span className="dim">
                {t('heat.pathPanel.keyAngles', { yaw: num(k.yaw, 0), pitch: num(k.pitch, 0) })}
              </span>
              {path.timing === 'keys' && (
                <NumberBox
                  className="key-time"
                  min={0}
                  step={0.1}
                  digits={2}
                  value={k.u * path.seconds}
                  disabled={busy}
                  title={i === keys.length - 1 && keys.length > 1 ? t('analysis.path.lastKeyTimeTitle') : t('analysis.path.keyTimeTitle')}
                  aria-label={t('analysis.path.keyTimeTitle')}
                  onChange={(sec) => setKeyTime(i, sec)}
                />
              )}
              {i < keys.length - 1 && (
                <select value={k.ease ?? 'none'} disabled={busy} title={t('analysis.path.easeTitle')} onChange={(e) => setKeyEase(i, e.target.value as SegmentEase)}>
                  {(['none', 'in', 'out', 'inOut'] as const).map((v) => (
                    <option key={v} value={v}>
                      {t(`analysis.path.ease.${v}`)}
                    </option>
                  ))}
                </select>
              )}
              <button className="link" title={t('heat.pathPanel.remove')} onClick={() => removeKey(i)} disabled={busy}>
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      {keys.length >= 2 && (
        <>
          <div className="field">
            <div className="label">
              <span>{t('heat.pathPanel.interpolation')}</span>
            </div>
            <Segmented<'smooth' | 'linear'>
              value={path.easing}
              options={[
                {
                  value: 'smooth',
                  label: t('heat.pathPanel.smooth'),
                  title: t('heat.pathPanel.smoothTitle'),
                },
                {
                  value: 'linear',
                  label: t('heat.pathPanel.straight'),
                  title: t('heat.pathPanel.straightTitle'),
                },
              ]}
              onChange={(easing) => patchPath({ easing })}
            />
          </div>
          <div className="field">
            <div className="label">
              <span>{t('analysis.path.timing')}</span>
            </div>
            <Segmented<'keys' | 'constant'>
              value={path.timing}
              options={[
                { value: 'keys', label: t('analysis.path.timingKeys'), title: t('analysis.path.timingKeysTitle') },
                { value: 'constant', label: t('analysis.path.timingConstant'), title: t('analysis.path.timingConstantTitle') },
              ]}
              onChange={(timing) => patchPath({ timing })}
            />
          </div>
          {path.timing === 'keys' && (
            <button onClick={() => patchPath({ keys: respace(keys) })} disabled={busy} title={t('analysis.path.evenTitle')}>
              {t('analysis.path.even')}
            </button>
          )}
          <div className="hint">
            {metres > 0
              ? t('heat.pathPanel.travel', {
                  units: num(metres, 0),
                  perSecond: num(metres / Math.max(0.001, path.seconds), 1),
                })
              : t('heat.pathPanel.noTravel')}
          </div>
        </>
      )}

      {keys.length >= 1 && (
        <>
          <label className="check" title={t('heat.pathPanel.previewTitle')}>
            <input
              type="checkbox"
              checked={path.showPreview}
              onChange={(e) => patchPath({ showPreview: e.target.checked })}
            />
            {t('heat.pathPanel.preview')}
          </label>
          {path.showPreview && (
            <Slider
              label={t('heat.pathPanel.position')}
              value={path.preview}
              min={0}
              max={1}
              step={0.001}
              onChange={(preview) => patchPath({ preview })}
              format={(v) => t('heat.pathPanel.percent', { value: num(v * 100, 1) })}
            />
          )}
        </>
      )}

      <Slider
        label={t('heat.pathPanel.duration')}
        value={path.seconds}
        min={1}
        max={120}
        ceiling={3600}
        step={0.5}
        onChange={(seconds) => patchPath({ seconds })}
        format={(v) => t('heat.pathPanel.seconds', { value: num(v, 1) })}
      />
      <Slider
        label={t('heat.pathPanel.frameRate')}
        value={path.fps}
        min={6}
        max={60}
        ceiling={240}
        step={1}
        onChange={(fps) => patchPath({ fps })}
        format={(v) => t('heat.pathPanel.fps', { value: num(v, 0) })}
      />
      <Slider
        label={t('heat.pathPanel.bitrate')}
        value={path.kbps}
        min={1000}
        max={60_000}
        ceiling={400_000}
        logarithmic
        onChange={(kbps) => patchPath({ kbps })}
        format={(v) => t('heat.pathPanel.mbps', { value: num(v / 1000, 1) })}
        hint={t('heat.pathPanel.bitrateHint')}
      />
      <Slider
        label={t('heat.pathPanel.waitCap')}
        value={path.maxWaitFrames}
        min={2}
        max={600}
        ceiling={10_000}
        step={1}
        onChange={(maxWaitFrames) => patchPath({ maxWaitFrames })}
        format={(v) => t('heat.pathPanel.frames', { count: Math.round(v) })}
        hint={t('heat.pathPanel.waitCapHint')}
      />

      <div className="field">
        <div className="label">
          <span>{t('analysis.video.container')}</span>
        </div>
        <Segmented<VideoContainer>
          value={path.container}
          options={[
            { value: 'mp4', label: 'MP4', title: t('analysis.video.mp4Title') },
            { value: 'mkv', label: 'MKV', title: t('analysis.video.mkvTitle') },
            { value: 'webm', label: 'WebM', title: t('analysis.video.webmTitle') },
          ]}
          onChange={(container) => patchPath({ container })}
        />
      </div>
      <div className="field">
        <div className="label">
          <span>{t('analysis.video.size')}</span>
        </div>
        <select value={path.size} disabled={busy} onChange={(e) => patchPath({ size: e.target.value as typeof path.size })}>
          <option value="canvas">{t('analysis.video.sizeCanvas')}</option>
          <option value="720">1280 × 720</option>
          <option value="1080">1920 × 1080</option>
          <option value="1440">2560 × 1440</option>
          <option value="2160">3840 × 2160</option>
          <option value="custom">{t('analysis.video.sizeCustom')}</option>
        </select>
        {path.size === 'custom' && (
          <span className="row" style={{ gap: 4 }}>
            <input type="number" min={16} max={8192} step={2} value={path.width} disabled={busy} onChange={(e) => patchPath({ width: Math.max(16, Math.min(8192, Number(e.target.value) || 16)) })} aria-label={t('analysis.video.width')} />
            ×
            <input type="number" min={16} max={8192} step={2} value={path.height} disabled={busy} onChange={(e) => patchPath({ height: Math.max(16, Math.min(8192, Number(e.target.value) || 16)) })} aria-label={t('analysis.video.height')} />
          </span>
        )}
      </div>

      <SavedPaths busy={busy} />

      <div className="hint">
        <Rich text={t('heat.pathPanel.summary', { count: frames, window: timeline.window })} />
        {timeline.mode === 'all'
          ? ` ${t('heat.pathPanel.switchesToPlay', { all: t('heat.timeline.all'), play: t('heat.timeline.play') })}`
          : ''}
        {dataset ? '' : ` · ${t('heat.pathPanel.noDataset')}`}
      </div>

      <div className="row">
        <button onClick={() => void run()} disabled={busy || !engine || !dataset}>
          {busy ? t('heat.pathPanel.rendering') : t('heat.pathPanel.render')}
        </button>
        {busy && <button onClick={() => abort.current?.abort()}>{t('heat.pathPanel.cancel')}</button>}
      </div>

      {progress && busy && (
        <div className="hint">
          {t('heat.pathPanel.progress', {
            frame: int(progress.frame),
            total: int(progress.total),
            waited: int(progress.waited),
            size: num(progress.bytes / 1e6, 1),
          })}
          {progress.unconverged > 0
            ? ` · ${t('heat.pathPanel.notExact', { count: progress.unconverged })}`
            : ''}
        </div>
      )}
      {result && <div className="hint" style={{ color: 'var(--good)' }}>{result}</div>}
      {error && <div className="hint" style={{ color: 'var(--bad)' }}>{error}</div>}
    </Section>
  );
}

/** The video's size for the panel's choice; null: the canvas's own. */
function outputSize(p: { size: string; width: number; height: number }): { width: number; height: number } | null {
  switch (p.size) {
    case '720':
      return { width: 1280, height: 720 };
    case '1080':
      return { width: 1920, height: 1080 };
    case '1440':
      return { width: 2560, height: 1440 };
    case '2160':
      return { width: 3840, height: 2160 };
    case 'custom':
      return { width: p.width, height: p.height };
    default:
      return null;
  }
}

/** Named paths kept in this browser, and to and from a file (render/pathLibrary.ts). */
function SavedPaths({ busy }: { busy: boolean }) {
  const path = useStore((s) => s.path);
  const lib = usePathLibrary();
  const [name, setName] = useState('');
  const [note, setNote] = useState<string | null>(null);
  const file = useRef<HTMLInputElement>(null);
  const save = () => {
    if (!path.keys.length) return;
    lib.save({ name: name.trim() || t('analysis.path.defaultName', { n: lib.paths.length + 1 }), keys: path.keys, easing: path.easing, timing: path.timing, seconds: path.seconds, fps: path.fps });
    setName('');
  };
  const load = (id: string) => {
    const p = lib.paths.find((x) => x.id === id);
    if (p) useStore.getState().patchPath({ keys: p.keys.map((k) => ({ ...k })), easing: p.easing, timing: p.timing, seconds: p.seconds, fps: p.fps });
  };
  const exportAll = () => {
    const blob = new Blob([pathsToJson(lib.paths)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = '3dheat-camera-paths.json';
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  };
  const importFile = async (f: File | undefined) => {
    if (!f) return;
    try {
      const n = lib.merge(readPaths(JSON.parse(await f.text())));
      setNote(t('analysis.path.imported', { n: int(n) }));
    } catch {
      setNote(t('analysis.path.importFailed'));
    }
  };
  return (
    <div className="saved-paths">
      <div className="label">
        <span>{t('analysis.path.saved')}</span>
      </div>
      <div className="row" style={{ gap: 4 }}>
        <input type="text" value={name} placeholder={t('analysis.path.namePlaceholder')} onChange={(e) => setName(e.target.value)} disabled={busy} />
        <button onClick={save} disabled={busy || !path.keys.length}>
          {t('analysis.path.save')}
        </button>
      </div>
      {lib.paths.map((p) => (
        <div className="keyrow" key={p.id}>
          <button className="link" onClick={() => load(p.id)} disabled={busy} title={t('analysis.path.loadTitle')}>
            {p.name}
          </button>
          <span className="dim">{t('analysis.path.summary', { keys: int(p.keys.length), seconds: num(p.seconds, 1) })}</span>
          <button
            className="link"
            onClick={() => {
              const n = window.prompt(t('analysis.path.renamePrompt'), p.name);
              if (n !== null) lib.rename(p.id, n);
            }}
            title={t('analysis.path.rename')}
          >
            ✎
          </button>
          <button className="link" onClick={() => lib.remove(p.id)} title={t('analysis.path.delete')}>
            ×
          </button>
        </div>
      ))}
      <div className="row" style={{ gap: 4 }}>
        <button onClick={exportAll} disabled={!lib.paths.length}>
          {t('analysis.path.export')}
        </button>
        <button onClick={() => file.current?.click()}>{t('analysis.path.import')}</button>
        <input ref={file} type="file" accept=".json,application/json" style={{ display: 'none' }} onChange={(e) => void importFile(e.target.files?.[0])} />
      </div>
      {note && <div className="hint">{note}</div>}
    </div>
  );
}

/**
 * Spread keys evenly over 0..1, keeping their order.
 *
 * Keyframes are captured one at a time with no way to know how many there will
 * be, so their positions have to be assigned after the fact. Even spacing means
 * "hold each shot the same length of time", which is the right default; a key can
 * still be moved by re-capturing the shot in a different order.
 */
function respace(keys: Keyframe[]): Keyframe[] {
  if (keys.length === 0) return keys;
  if (keys.length === 1) return [{ ...keys[0], u: 0 }];
  return keys.map((k, i) => ({ ...k, u: i / (keys.length - 1) }));
}
