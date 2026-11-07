import { useRef, useState } from 'react';
import { useAnimationFrame, useEngine } from '../EngineContext';
import { t } from '../../i18n';
import { directionFromYawPitch } from '../../render/pose';
import { useInspectStore } from '../../state/inspectStore';
import { useStore } from '../../state/store';
import { cameraInFrame, poseToWorld } from '../inspectFormat';

/**
 * Numeric camera pose.
 *
 * Flying is how you explore; typing coordinates is how you reproduce a view, and
 * a telemetry viewer needs both — "look at this from exactly here" is most of
 * what gets shared about a finding.
 *
 * The fields show the live pose while they are not being edited, and stop
 * following it the moment one is focused, so a value cannot be overwritten
 * mid-keystroke by the camera drifting underneath.
 */
export function CameraPose() {
  const engine = useEngine();
  const [editing, setEditing] = useState(false);
  const refs = {
    x: useRef<HTMLInputElement>(null),
    y: useRef<HTMLInputElement>(null),
    z: useRef<HTMLInputElement>(null),
    yaw: useRef<HTMLInputElement>(null),
    pitch: useRef<HTMLInputElement>(null),
  };

  // The same frame and yaw as the readout over the view and the jump box: the
  // data's own coordinates, whatever axes the view has inverted, and the yaw
  // convention chosen in this panel.
  const axes = useStore((s) => s.dataset?.axes ?? null);
  const convention = useInspectStore((s) => s.yawConvention);

  useAnimationFrame(() => {
    if (!engine || editing) return;
    const set = (el: HTMLInputElement | null, v: number) => {
      if (!el) return;
      const s = v.toFixed(2);
      if (el.value !== s) el.value = s;
    };
    const c = cameraInFrame(engine, axes, convention);
    set(refs.x.current, c.position.x);
    set(refs.y.current, c.position.y);
    set(refs.z.current, c.position.z);
    set(refs.yaw.current, c.yaw);
    set(refs.pitch.current, c.pitch);
  }, !!engine);

  const applyPosition = () => {
    if (!engine) return;
    const x = Number(refs.x.current?.value);
    const y = Number(refs.y.current?.value);
    const z = Number(refs.z.current?.value);
    if ([x, y, z].every(Number.isFinite)) {
      engine.setCameraPose(poseToWorld(engine, { x, y, z }, axes, convention).position, null);
    }
  };
  const applyRotation = () => {
    if (!engine) return;
    const yaw = Number(refs.yaw.current?.value);
    const pitch = Number(refs.pitch.current?.value);
    if (Number.isFinite(yaw) && Number.isFinite(pitch)) {
      engine.setCameraPose(null, directionFromYawPitch(convention, yaw, pitch));
    }
  };

  const field = (
    key: keyof typeof refs,
    label: string,
    apply: () => void,
    step: number,
  ) => (
    <label style={{ fontSize: 10, color: 'var(--text-faint)', flex: 1 }}>
      {label}
      <input
        ref={refs[key]}
        type="number"
        step={step}
        defaultValue="0"
        onFocus={() => setEditing(true)}
        onBlur={() => {
          apply();
          setEditing(false);
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            apply();
            (e.target as HTMLInputElement).blur();
          }
        }}
      />
    </label>
  );

  const copyPose = () => {
    if (!engine) return;
    const c = cameraInFrame(engine, axes, convention);
    const p = c.position;
    // A game yaw says so, so the jump box reads it back as one.
    const text = `pos ${p.x.toFixed(2)} ${p.y.toFixed(2)} ${p.z.toFixed(
      2,
    )} · yaw ${c.yaw.toFixed(2)} · pitch ${c.pitch.toFixed(2)}${convention === 'game' ? ' (game yaw)' : ''}`;
    void navigator.clipboard?.writeText(text);
  };

  return (
    <div className="field">
      <div className="label">
        <span>{t('heat.cameraPose.pose')}</span>
        <button
          className="del"
          title={t('heat.cameraPose.copyTitle')}
          onClick={copyPose}
        >
          {t('heat.cameraPose.copy')}
        </button>
      </div>
      <div className="row">
        {field('x', 'X', applyPosition, 1)}
        {field('y', 'Y', applyPosition, 1)}
        {field('z', 'Z', applyPosition, 1)}
      </div>
      <div className="row">
        {field('yaw', t('heat.cameraPose.yaw'), applyRotation, 1)}
        {field('pitch', t('heat.cameraPose.pitch'), applyRotation, 1)}
      </div>
      <div className="hint">{t('heat.cameraPose.hint', { key: 'Enter' })}</div>
    </div>
  );
}
