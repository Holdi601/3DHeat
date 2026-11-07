import { useEffect, useRef, useState } from 'react';
import { num, t } from '../i18n';
import type { Engine } from '../render/engine';
import { formatPose, isIdentityAxes } from '../render/pose';
import { useInspectStore } from '../state/inspectStore';
import { useStore } from '../state/store';
import { useAnimationFrame, useEngine } from './EngineContext';
import { cameraInFrame, copyText, jumpFromText } from './inspectFormat';

/**
 * Where the camera is, over the view.
 *
 * The pose box in the View panel has the same numbers, but it is at the bottom
 * of a collapsed panel, and "where am I" is a question asked while flying, with
 * the eyes on the view. Written to the DOM on the frame clock like
 * `StatsOverlay`, so a moving camera costs no React work.
 *
 * `C` copies it as one line the jump box reads back; `G` opens a box under it to
 * paste a point or a pose into, without going to the View panel.
 */
export function CameraReadout() {
  const engine = useEngine();
  const axes = useStore((s) => s.dataset?.axes ?? null);
  const convention = useInspectStore((s) => s.yawConvention);
  const patch = useInspectStore((s) => s.patch);
  const [copied, setCopied] = useState(false);
  const focusJump = useInspectStore((s) => s.focusJump);
  const [jumping, setJumping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const field = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (focusJump > 0) setJumping(true);
  }, [focusJump]);
  useEffect(() => {
    if (jumping) field.current?.focus();
  }, [jumping, focusJump]);
  const x = useRef<HTMLElement>(null);
  const y = useRef<HTMLElement>(null);
  const z = useRef<HTMLElement>(null);
  const yaw = useRef<HTMLElement>(null);
  const pitch = useRef<HTMLElement>(null);

  useAnimationFrame(() => {
    if (!engine) return;
    const c = cameraInFrame(engine, axes, convention);
    setText(x, num(c.position.x, 2));
    setText(y, num(c.position.y, 2));
    setText(z, num(c.position.z, 2));
    setText(yaw, t('heat.inspect.degrees', { value: num(c.yaw, 1) }));
    setText(pitch, t('heat.inspect.degrees', { value: num(c.pitch, 1) }));
  }, !!engine);

  const copy = () => {
    if (!engine) return;
    void copyCameraPose(engine).then((ok) => {
      setCopied(ok);
      if (ok) setTimeout(() => setCopied(false), 1200);
    });
  };

  return (
    <div className="cam-readout">
      <div className="cam-line">
        <span className="k">x</span>
        <b ref={x}>—</b>
        <span className="k">y</span>
        <b ref={y}>—</b>
        <span className="k">z</span>
        <b ref={z}>—</b>
      </div>
      <div className="cam-line">
        <span className="k">{t('heat.inspect.yaw')}</span>
        <b ref={yaw}>—</b>
        <span className="k">{t('heat.inspect.pitch')}</span>
        <b ref={pitch}>—</b>
        <span className="tag" title={t('heat.inspect.conventionTitle')}>
          {convention === 'game' ? t('heat.inspect.convention.gameShort') : t('heat.inspect.convention.viewerShort')}
        </span>
        {!isIdentityAxes(axes) && (
          <span className="tag" title={t('heat.inspect.dataFrameTitle')}>
            {t('heat.inspect.dataFrame')}
          </span>
        )}
      </div>
      <div className="cam-actions">
        <button className="link" onClick={copy} title={t('heat.inspect.copyCameraTitle', { key: 'C' })}>
          {copied ? t('heat.inspect.copied') : t('heat.inspect.copy')}
        </button>
        <button className="link" onClick={() => setJumping((v) => !v)} title={t('heat.inspect.goToTitle', { key: 'G' })}>
          {t('heat.inspect.goTo')}
        </button>
        <button className="link" onClick={() => patch({ showCamera: false })} title={t('heat.inspect.hideCameraTitle')}>
          ×
        </button>
      </div>
      {jumping && (
        <>
          <input
            ref={field}
            type="text"
            className="mono"
            placeholder={t('heat.inspect.jump.placeholder')}
            title={t('heat.inspect.jump.pointTitle')}
            spellCheck={false}
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                setJumping(false);
                setError(null);
              }
              if (e.key !== 'Enter' || !engine) return;
              const why = jumpFromText(engine, e.currentTarget.value, 'look', axes, convention);
              setError(why);
              // Done with: the box closes, and the keys fly the camera again.
              if (!why) setJumping(false);
            }}
          />
          {error && <div className="err">{error}</div>}
        </>
      )}
    </div>
  );
}

/**
 * Put the camera's pose on the clipboard, as the readout says it. Also the `C`
 * key's action, so it works with the readout hidden.
 */
export function copyCameraPose(engine: Engine | null): Promise<boolean> {
  if (!engine) return Promise.resolve(false);
  const axes = useStore.getState().dataset?.axes ?? null;
  const convention = useInspectStore.getState().yawConvention;
  const c = cameraInFrame(engine, axes, convention);
  return copyText(formatPose(c.position, c.yaw, c.pitch, convention));
}

function setText(ref: { current: HTMLElement | null }, v: string): void {
  const el = ref.current;
  if (el && el.textContent !== v) el.textContent = v;
}
