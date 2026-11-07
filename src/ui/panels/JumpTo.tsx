import { useRef, useState } from 'react';
import { t } from '../../i18n';
import { isIdentityAxes, parseNumber, type YawConvention } from '../../render/pose';
import { useInspectStore } from '../../state/inspectStore';
import { useStore } from '../../state/store';
import { Check, Segmented } from '../controls';
import { useEngine } from '../EngineContext';
import { jumpFromText } from '../inspectFormat';

/**
 * Inspecting the view: the camera readout, click-to-pick, the yaw convention,
 * and going to a typed point.
 *
 * The jump box takes a point the way it arrives from anywhere - `x, y, z` or
 * `x y z`, with a decimal point or a decimal comma, or a whole pose pasted from
 * the readout - and either stands the camera on it or looks at it from a
 * sensible distance. A yaw and pitch typed beside it (or pasted with it) turn
 * the camera too; read in the convention chosen here, so a game's own yaw from
 * a capture tool's table can be typed as it is.
 */
export function JumpTo() {
  const engine = useEngine();
  const axes = useStore((s) => s.dataset?.axes ?? null);
  const showCamera = useInspectStore((s) => s.showCamera);
  const pickOnClick = useInspectStore((s) => s.pickOnClick);
  const convention = useInspectStore((s) => s.yawConvention);
  const patch = useInspectStore((s) => s.patch);
  const [mode, setMode] = useState<'look' | 'stand'>('look');
  const [error, setError] = useState<string | null>(null);
  const point = useRef<HTMLInputElement>(null);
  const yaw = useRef<HTMLInputElement>(null);
  const pitch = useRef<HTMLInputElement>(null);

  const go = () => {
    if (!engine) return;
    const angle = (el: HTMLInputElement | null): number | null | undefined => {
      const text = el?.value.trim() ?? '';
      return text ? (parseNumber(text) ?? undefined) : null;
    };
    const y = angle(yaw.current);
    const p = angle(pitch.current);
    if (y === undefined || p === undefined) {
      setError(t('heat.inspect.jump.badAngle'));
      return;
    }
    const why = jumpFromText(engine, point.current?.value ?? '', mode, axes, convention, { yaw: y, pitch: p });
    setError(why);
    if (!why) point.current?.blur();
  };

  const onKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') go();
    if (e.key === 'Escape') (e.target as HTMLInputElement).blur();
  };

  return (
    <div className="field">
      <div className="label">
        <span>{t('heat.inspect.title')}</span>
      </div>
      <Check
        label={t('heat.inspect.showCamera')}
        checked={showCamera}
        onChange={(v) => patch({ showCamera: v })}
        title={t('heat.inspect.showCameraTitle', { key: 'C' })}
      />
      <Check
        label={t('heat.inspect.pickOnClick')}
        checked={pickOnClick}
        onChange={(v) => {
          patch({ pickOnClick: v });
          if (!v) engine?.inspector.clear();
        }}
        title={t('heat.inspect.pickOnClickTitle')}
      />
      <div className="label" style={{ marginTop: 6 }}>
        <span>{t('heat.inspect.yawConvention')}</span>
      </div>
      <Segmented<YawConvention>
        value={convention}
        options={[
          { value: 'viewer', label: t('heat.inspect.convention.viewer'), title: t('heat.inspect.convention.viewerTitle') },
          { value: 'game', label: t('heat.inspect.convention.game'), title: t('heat.inspect.convention.gameTitle') },
        ]}
        onChange={(v) => patch({ yawConvention: v })}
      />

      <div className="label" style={{ marginTop: 8 }}>
        <span>{t('heat.inspect.jump.title')}</span>
      </div>
      <input
        ref={point}
        type="text"
        className="mono"
        placeholder={t('heat.inspect.jump.placeholder')}
        title={t('heat.inspect.jump.pointTitle')}
        onKeyDown={onKey}
        spellCheck={false}
      />
      <div className="row" style={{ marginTop: 4 }}>
        <label style={{ fontSize: 10, color: 'var(--text-faint)', flex: 1 }}>
          {t('heat.inspect.jump.yaw')}
          <input ref={yaw} type="text" inputMode="decimal" placeholder="—" onKeyDown={onKey} />
        </label>
        <label style={{ fontSize: 10, color: 'var(--text-faint)', flex: 1 }}>
          {t('heat.inspect.jump.pitch')}
          <input ref={pitch} type="text" inputMode="decimal" placeholder="—" onKeyDown={onKey} />
        </label>
      </div>
      <div className="row" style={{ marginTop: 4 }}>
        <Segmented<'look' | 'stand'>
          value={mode}
          options={[
            { value: 'look', label: t('heat.inspect.jump.lookAt'), title: t('heat.inspect.jump.lookAtTitle') },
            { value: 'stand', label: t('heat.inspect.jump.standHere'), title: t('heat.inspect.jump.standHereTitle') },
          ]}
          onChange={setMode}
        />
        <button onClick={go}>{t('heat.inspect.jump.go')}</button>
      </div>
      {error && (
        <div className="hint" style={{ color: 'var(--warm)' }}>
          {error}
        </div>
      )}
      <div className="hint">
        {isIdentityAxes(axes) ? t('heat.inspect.jump.hint', { key: 'G' }) : t('heat.inspect.jump.hintDataFrame', { key: 'G' })}
      </div>
    </div>
  );
}
