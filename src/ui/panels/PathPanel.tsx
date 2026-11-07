import { useEffect, useRef, useState } from 'react';
import { pathLength, poseAt, prepare, type Keyframe } from '../../render/campath';
import { renderPath, type RecordProgress } from '../../render/record';
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
    const pose = poseAt(path.keys, path.preview, path.easing);
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
  }, [engine, path.showPreview, path.preview, path.easing, path.keys]);

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
      a.download = `3dheat-${out.width}x${out.height}-${out.frames}f.webm`;
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
