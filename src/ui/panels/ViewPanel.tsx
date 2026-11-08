import { MAX_PLAN_SPRITES } from '../../render/types';
import { useCallback, useEffect, useState } from 'react';
import {
  MIN_GPU_BUDGET,
  MIN_RAM_BUDGET,
  detectBudgets,
  formatBytes,
} from '../../data/memory';
import { probeHostMemory } from '../../data/hostMemory';
import { ISOMETRIC_PITCH, MIN_FLY_SPEED, VIEW_PRESETS } from '../../render/camera';
import { classifyRenderer } from '../../render/gpuClass';

const ISO_PRESETS = Object.keys(VIEW_PRESETS).filter((k) => VIEW_PRESETS[k].group === 'iso');
const ORTHO_PRESETS = Object.keys(VIEW_PRESETS).filter((k) => VIEW_PRESETS[k].group === 'ortho');

/**
 * Named fields of view, in vertical degrees.
 *
 * Labelled by what they do rather than by a focal length: nobody choosing a view
 * of a heatmap is thinking in millimetres, and the 35mm equivalents would be wrong
 * anyway since these are vertical rather than diagonal angles.
 */
const fovPresets = (): Array<[string, number]> => [
  [t('heat.viewPanel.camera.fovPreset.flat', { deg: 20 }), 20],
  [t('heat.viewPanel.camera.fovPreset.long', { deg: 35 }), 35],
  [t('heat.viewPanel.camera.fovPreset.normal', { deg: 50 }), 50],
  [t('heat.viewPanel.camera.fovPreset.wide', { deg: 65 }), 65],
  [t('heat.viewPanel.camera.fovPreset.veryWide', { deg: 90 }), 90],
];

/** A view preset's name on its button; the names themselves are keys. */
function presetLabel(name: string): string {
  switch (name) {
    case 'Iso NE':
      return t('heat.viewPanel.camera.preset.isoNE');
    case 'Iso NW':
      return t('heat.viewPanel.camera.preset.isoNW');
    case 'Iso SE':
      return t('heat.viewPanel.camera.preset.isoSE');
    case 'Iso SW':
      return t('heat.viewPanel.camera.preset.isoSW');
    case 'Top':
      return t('heat.viewPanel.camera.preset.top');
    case 'Bottom':
      return t('heat.viewPanel.camera.preset.bottom');
    case 'Front':
      return t('heat.viewPanel.camera.preset.front');
    case 'Back':
      return t('heat.viewPanel.camera.preset.back');
    case 'Left':
      return t('heat.viewPanel.camera.preset.left');
    case 'Right':
      return t('heat.viewPanel.camera.preset.right');
    default:
      return name.replace('Iso ', '');
  }
}
import { useStore } from '../../state/store';
import { Check, NumberField, Rich, Section, Segmented, Slider } from '../controls';
import { useEngine } from '../EngineContext';
import { CameraPose } from './CameraPose';
import { JumpTo } from './JumpTo';
import { num, t } from '../../i18n';
import { lengthText, unitPrefs, useUnits } from '../../state/unitsStore';

export function CameraPanel() {
  useUnits();
  const engine = useEngine();
  const camera = useStore((s) => s.camera);
  const patchCamera = useStore((s) => s.patchCamera);
  const showGrid = useStore((s) => s.showGrid);
  const showAxes = useStore((s) => s.showAxes);
  const toggle = useStore((s) => s.toggle);

  return (
    <Section title={t('heat.viewPanel.camera.title')}>
      <div className="field">
        <div className="label">
          <span>{t('heat.viewPanel.camera.projection')}</span>
        </div>
        <Segmented
          value={camera.projection}
          options={[
            {
              value: 'perspective' as const,
              label: t('heat.viewPanel.camera.perspective'),
              title: t('heat.viewPanel.camera.perspectiveTitle'),
            },
            {
              value: 'orthographic' as const,
              label: t('heat.viewPanel.camera.parallel'),
              title: t('heat.viewPanel.camera.parallelTitle'),
            },
          ]}
          // Through the engine, not the store: switching that way solves for the
          // other projection's scale so the subject keeps its size, and remembers
          // the perspective pose to come back to.
          onChange={(projection) => engine?.setProjection(projection)}
        />
        {camera.projection === 'orthographic' ? (
          <div className="hint">
            {t('heat.viewPanel.camera.parallelHint', { perspective: t('heat.viewPanel.camera.perspective') })}
          </div>
        ) : (
          <div className="hint">
            {t('heat.viewPanel.camera.perspectiveHint', { parallel: t('heat.viewPanel.camera.parallel') })}
          </div>
        )}
      </div>

      <div className="field">
        <div className="label">
          <span>{t('heat.viewPanel.camera.isometric')}</span>
        </div>
        <div className="row wrap">
          {ISO_PRESETS.map((name) => (
            <button
              key={name}
              title={VIEW_PRESETS[name].title}
              onClick={() => engine?.applyPreset(name)}
            >
              {presetLabel(name)}
            </button>
          ))}
        </div>
        <div className="hint">
          {t('heat.viewPanel.camera.isometricHint', { pitch: num(Math.abs(ISOMETRIC_PITCH), 3) })}
        </div>
      </div>

      <div className="field">
        <div className="label">
          <span>{t('heat.viewPanel.camera.elevations')}</span>
        </div>
        <div className="row wrap">
          {ORTHO_PRESETS.map((name) => (
            <button
              key={name}
              title={VIEW_PRESETS[name].title}
              onClick={() => engine?.applyPreset(name)}
            >
              {presetLabel(name)}
            </button>
          ))}
        </div>
      </div>

      <div className="row">
        <button
          className={camera.projection === 'perspective' ? '' : 'primary'}
          disabled={camera.projection === 'perspective'}
          title={t('heat.viewPanel.camera.backTitle')}
          onClick={() => engine?.setProjection('perspective')}
        >
          {t('heat.viewPanel.camera.back')}
        </button>
        <button
          title={VIEW_PRESETS.Perspective.title}
          onClick={() => engine?.applyPreset('Perspective')}
        >
          {t('heat.viewPanel.camera.threeQuarter')}
        </button>
      </div>

      <Slider
        label={t('heat.viewPanel.camera.fov')}
        value={camera.fov}
        min={10}
        max={140}
        // A perspective divide needs the angle strictly under a half turn.
        ceiling={179}
        step={0.5}
        onChange={(fov) => patchCamera({ fov })}
        format={(v) => t('heat.viewPanel.camera.degrees', { value: num(v, 1) })}
        hint={
          camera.projection === 'perspective'
            ? t('heat.viewPanel.camera.fovHint')
            : t('heat.viewPanel.camera.fovParallelHint', { perspective: t('heat.viewPanel.camera.perspective') })
        }
      />
      <div className="row wrap">
        {fovPresets().map(([label, deg]) => (
          <button
            key={deg}
            className={Math.abs(camera.fov - deg) < 0.26 ? 'on' : ''}
            title={t('heat.viewPanel.camera.fovPresetTitle', { deg })}
            onClick={() => patchCamera({ fov: deg })}
          >
            {label}
          </button>
        ))}
      </div>
      <Slider
        label={t('heat.viewPanel.camera.flySpeed')}
        value={camera.flySpeed}
        // Down to the camera's own floor, which is slow enough to hold a
        // position against a doorway rather than merely to move slowly.
        min={MIN_FLY_SPEED}
        max={20000}
        ceiling={200_000}
        logarithmic
        // Five decades of useful range with fine control needed at both ends, so
        // the handle works in ratios: half as fast, not one metre slower.
        proportional
        onChange={(flySpeed) => patchCamera({ flySpeed })}
        format={(v) => (unitPrefs().altitude === 'ft' ? t('units.v.fts', { v: num(v / 0.3048, v < 3 ? 3 : 0) }) : t('heat.viewPanel.camera.metresPerSecond', { value: num(v, v < 10 ? 3 : 0) }))}
        hint={t('heat.viewPanel.camera.flySpeedHint', { shift: 'Shift', alt: 'Alt' })}
      />
      <div className="row">
        <NumberField
          label={t('heat.viewPanel.camera.near')}
          value={camera.near}
          step={0.1}
          onChange={(near) => patchCamera({ near })}
        />
        <NumberField
          label={t('heat.viewPanel.camera.far')}
          value={camera.far}
          step={100}
          onChange={(far) => patchCamera({ far })}
        />
      </div>
      <Check
        label={t('heat.viewPanel.camera.invertY')}
        checked={camera.invertY}
        onChange={(invertY) => patchCamera({ invertY })}
      />

      <DepthOfField />

      <GamepadControls />

      <CameraPose />

      <JumpTo />

      <div className="row">
        <button onClick={() => engine?.frameDataset()}>{t('heat.viewPanel.camera.frame', { key: 'F' })}</button>
      </div>

      <div className="row">
        <Check label={t('heat.viewPanel.camera.grid')} checked={showGrid} onChange={() => toggle('showGrid')} />
        <Check label={t('heat.viewPanel.camera.axes')} checked={showAxes} onChange={() => toggle('showAxes')} />
      </div>

      <div className="field">
        <div className="label">
          <span>{t('heat.viewPanel.camera.mirror')}</span>
        </div>
        <div className="row">
          {(['x', 'y', 'z'] as const).map((axis) => (
            <Check
              key={axis}
              label={axis.toUpperCase()}
              checked={camera.mirror[axis]}
              onChange={(on) => patchCamera({ mirror: { ...camera.mirror, [axis]: on } })}
              title={t('heat.viewPanel.camera.mirrorTitle', { axis: axis.toUpperCase() })}
            />
          ))}
        </div>
        <div className="hint">{t('heat.viewPanel.camera.mirrorHint')}</div>
      </div>
    </Section>
  );
}

/**
 * Depth of field.
 *
 * A presentation control rather than an analysis one, so it is off by default and
 * tucked behind a summary: the default view should show the data, not an
 * interpretation of it. It earns its place for screenshots and for talking through
 * a level, where softening the geometry behind the data makes the data read.
 */
function DepthOfField() {
  useUnits();
  const engine = useEngine();
  const camera = useStore((s) => s.camera);
  const patchCamera = useStore((s) => s.patchCamera);
  const dof = camera.dof;
  const patch = (p: Partial<typeof dof>) => patchCamera({ dof: { ...dof, ...p } });

  return (
    <details className="budgets">
      <summary>{dof.enabled ? t('heat.viewPanel.dof.titleOn') : t('heat.viewPanel.dof.title')}</summary>
      <Check label={t('heat.viewPanel.dof.enabled')} checked={dof.enabled} onChange={(enabled) => patch({ enabled })} />
      <div className="hint">
        <Rich text={t('heat.viewPanel.dof.hint')} />
      </div>
      {dof.enabled && (
        <>
          <Check
            label={t('heat.viewPanel.dof.autoFocus')}
            checked={dof.autoFocus}
            onChange={(autoFocus) => patch({ autoFocus })}
            title={t('heat.viewPanel.dof.autoFocusTitle')}
          />
          {!dof.autoFocus && (
            <Slider
              label={t('heat.viewPanel.dof.focusDistance')}
              value={dof.focusDistance}
              min={1}
              max={200000}
              ceiling={1e7}
              logarithmic
              onChange={(focusDistance) => patch({ focusDistance })}
              format={(v) => lengthText(v, (s) => (s < 100 ? 1 : 0))}
            />
          )}
          {dof.autoFocus && (
            <div className="hint">
              {t('heat.viewPanel.dof.focusedAt', { value: num(engine?.camera.focusDistance ?? 0, 0) })}
            </div>
          )}
          <Slider
            label={t('heat.viewPanel.dof.aperture')}
            value={dof.aperture}
            min={0.02}
            max={2}
            ceiling={32}
            logarithmic
            onChange={(aperture) => patch({ aperture })}
            format={(v) => t('heat.viewPanel.dof.plusMinusPercent', { value: num(v * 100, 0) })}
            hint={t('heat.viewPanel.dof.apertureHint')}
          />
          <Slider
            label={t('heat.viewPanel.dof.maxBlur')}
            value={dof.maxBlur}
            min={1}
            max={48}
            ceiling={256}
            step={1}
            onChange={(maxBlur) => patch({ maxBlur })}
            format={(v) => t('heat.viewPanel.dof.pixels', { value: num(v, 0) })}
            hint={t('heat.viewPanel.dof.maxBlurHint')}
          />
        </>
      )}
    </details>
  );
}

/**
 * Gamepad settings plus a live connection readout.
 *
 * The readout matters more than it looks: the Gamepad API hides pads until the
 * page has seen one input event from them, so a plugged-in controller that does
 * nothing is the expected first experience and needs explaining rather than
 * debugging.
 */
function GamepadControls() {
  const gamepad = useStore((s) => s.camera.gamepad);
  const patchCamera = useStore((s) => s.patchCamera);
  const [pads, setPads] = useState<Array<{ id: string; standard: boolean }>>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (typeof navigator === 'undefined' || !navigator.getGamepads) return;
    const scan = () => {
      const found: Array<{ id: string; standard: boolean }> = [];
      for (const pad of navigator.getGamepads()) {
        // Layout as well as name: a device the viewer is ignoring has to be
        // visible here, or "my stick does nothing" has no answer on screen.
        if (pad?.connected) found.push({ id: pad.id, standard: pad.mapping === 'standard' });
      }
      // Compare as a string so an unchanged list does not re-render every tick.
      const key = (l: typeof found) => l.map((p) => `${p.standard ? 's' : '-'}${p.id}`).join('|');
      setPads((prev) => (key(prev) === key(found) ? prev : found));
    };
    scan();
    // Polling rather than the connect/disconnect events alone: those only fire
    // while the page is focused, so a pad woken during a background tab would
    // otherwise never appear here.
    const timer = window.setInterval(scan, 500);
    window.addEventListener('gamepadconnected', scan);
    window.addEventListener('gamepaddisconnected', scan);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener('gamepadconnected', scan);
      window.removeEventListener('gamepaddisconnected', scan);
    };
  }, []);

  const patch = (p: Partial<typeof gamepad>) => patchCamera({ gamepad: { ...gamepad, ...p } });

  return (
    <div className="field">
      <div className="label">
        <span>{t('heat.viewPanel.gamepad.title')}</span>
        <button className="link" onClick={() => setOpen(!open)}>
          {open ? t('heat.viewPanel.gamepad.hide') : t('heat.viewPanel.gamepad.settings')}
        </button>
      </div>
      <Check
        label={t('heat.viewPanel.gamepad.enabled')}
        checked={gamepad.enabled}
        onChange={(enabled) => patch({ enabled })}
      />
      <div className="hint" data-testid="gamepad-status">
        {pads.length === 0
          ? t('heat.viewPanel.gamepad.none')
          : pads.map((pad) => {
              const followed = gamepad.deviceId === null ? pad.standard : gamepad.deviceId === pad.id;
              return (
                <div key={pad.id} className="mono">
                  {followed ? '● ' : '○ '}
                  {pad.id}
                  {!pad.standard && (
                    <>
                      {' '}
                      <span className="muted">
                        {followed
                          ? t('heat.viewPanel.gamepad.notXInputUsed', { api: 'XInput' })
                          : t('heat.viewPanel.gamepad.notXInputIgnored', { api: 'XInput' })}
                      </span>
                    </>
                  )}
                </div>
              );
            })}
      </div>
      {/*
        Flight gear reports itself through the same API as a pad but does not rest
        at centre — a twist axis or a throttle lever sits at full deflection — so
        following one uncommanded means a camera that spins on its own. Ignored by
        default, listed above so it is visible, and opt-in here for anyone who does
        want to fly with it.
      */}
      {pads.some((p) => !p.standard) && (
        <label className="row">
          <span>{t('heat.viewPanel.gamepad.device')}</span>
          <select
            data-testid="gamepad-device"
            value={gamepad.deviceId ?? ''}
            onChange={(e) => patch({ deviceId: e.target.value === '' ? null : e.target.value })}
          >
            <option value="">{t('heat.viewPanel.gamepad.xinputOnly', { api: 'XInput' })}</option>
            {pads.map((pad) => (
              <option key={pad.id} value={pad.id}>
                {pad.id}
              </option>
            ))}
          </select>
        </label>
      )}
      {open && (
        <>
          <div className="hint">
            {t('heat.viewPanel.gamepad.hint', { rb: 'RB', lb: 'LB', a: 'A', y: 'Y' })}
          </div>
          <Slider
            label={t('heat.viewPanel.gamepad.lookSpeed')}
            value={gamepad.lookSpeed}
            min={20}
            max={540}
            ceiling={5000}
            step={5}
            onChange={(lookSpeed) => patch({ lookSpeed })}
            format={(v) => t('heat.viewPanel.gamepad.degreesPerSecond', { value: num(v, 0) })}
          />
          <Slider
            label={t('heat.viewPanel.gamepad.deadzone')}
            value={gamepad.deadzone}
            min={0}
            max={0.5}
            // A worn stick can need most of its travel ignored; at 1 nothing
            // gets through at all.
            ceiling={0.95}
            step={0.01}
            onChange={(deadzone) => patch({ deadzone })}
            format={(v) => t('heat.viewPanel.gamepad.percent', { value: num(v * 100, 0) })}
            hint={t('heat.viewPanel.gamepad.deadzoneHint')}
          />
          <Slider
            label={t('heat.viewPanel.gamepad.curve')}
            value={gamepad.curve}
            min={1}
            max={4}
            ceiling={16}
            step={0.1}
            onChange={(curve) => patch({ curve })}
            format={(v) =>
              v <= 1.01 ? t('heat.viewPanel.gamepad.linear') : t('heat.viewPanel.gamepad.power', { value: num(v, 1) })
            }
            hint={t('heat.viewPanel.gamepad.curveHint')}
          />
          <div className="row">
            <Check
              label={t('heat.viewPanel.gamepad.invertY')}
              checked={gamepad.invertY}
              onChange={(invertY) => patch({ invertY })}
            />
            <Check
              label={t('heat.viewPanel.gamepad.swap')}
              checked={gamepad.swapSticks}
              onChange={(swapSticks) => patch({ swapSticks })}
            />
          </div>
        </>
      )}
    </div>
  );
}

export function PerfPanel() {
  const budget = useStore((s) => s.budget);
  const patchBudget = useStore((s) => s.patchBudget);

  return (
    <Section title={t('heat.viewPanel.performance')}>
      <div className="hint">{t('heat.viewPanel.perf.hint')}</div>
      <Check
        label={t('heat.viewPanel.perf.exact')}
        checked={budget.exact}
        onChange={(exact) => patchBudget({ exact })}
        title={t('heat.viewPanel.perf.exactTitle')}
      />
      {budget.exact && <div className="hint">{t('heat.viewPanel.perf.exactHint')}</div>}
      <Check
        label={t('heat.viewPanel.perf.adaptive')}
        checked={budget.adaptive}
        onChange={(adaptive) => patchBudget({ adaptive })}
        title={t('heat.viewPanel.perf.adaptiveTitle')}
      />
      <Slider
        label={t('heat.viewPanel.perf.targetFps')}
        value={budget.targetFps}
        min={20}
        max={240}
        ceiling={1000}
        step={1}
        onChange={(targetFps) => patchBudget({ targetFps })}
        format={(v) => num(v, 0)}
      />
      <Slider
        label={budget.adaptive ? t('heat.viewPanel.perf.startingSprites') : t('heat.viewPanel.perf.sprites')}
        value={budget.splatsPerFrame}
        min={64 * 1024}
        max={MAX_PLAN_SPRITES}
        // Enough to splat a large load in a single frame; the most one plan can carry.
        ceiling={MAX_PLAN_SPRITES}
        logarithmic
        onChange={(splatsPerFrame) => patchBudget({ splatsPerFrame })}
        format={(v) => t('heat.viewPanel.perf.millions', { value: num(v / 1e6, 2) })}
      />
      <Slider
        label={t('heat.viewPanel.perf.heatResolution')}
        value={budget.heatScale}
        min={0.25}
        max={1}
        step={0.05}
        onChange={(heatScale) => patchBudget({ heatScale })}
        format={(v) => t('heat.viewPanel.perf.percent', { value: num(v * 100, 0) })}
        hint={t('heat.viewPanel.perf.heatResolutionHint')}
      />
      <Check
        label={t('heat.viewPanel.perf.progressive')}
        checked={budget.progressive}
        onChange={(progressive) => patchBudget({ progressive })}
        title={t('heat.viewPanel.perf.progressiveTitle')}
      />
      <ResourceBudgets />
    </Section>
  );
}

/**
 * Detected RAM, GPU and CPU ceilings, with the chosen budgets inside them.
 *
 * Deliberately one-directional: detection sets both the default and the maximum,
 * and the sliders only go down. Letting someone ask for more memory than the
 * machine has does not produce more memory — it produces an out-of-memory tab
 * crash partway through a load that may have been running for minutes.
 */
function ResourceBudgets() {
  const engine = useEngine();
  const budgets = useStore((s) => s.budgets);
  const setBudgets = useStore((s) => s.setBudgets);
  const backend = useStore((s) => s.stats.backend);

  const redetect = useCallback(
    /**
     * `fresh` forces a new reading from the host rather than reusing the cached
     * one — what the Re-detect button is for, since free memory is the figure most
     * worth re-reading after closing something.
     */
    async (fresh = false) => {
      const r = engine?.rendererInfo();
      const gpu = r
        ? {
            gpuName: r.gpuName,
            maxTextureSize: r.maxTextureSize,
            maxBufferBytes: r.maxBufferBytes,
          }
        : null;
      // Await the host before setting anything, so the panel never shows the
      // capped guess and then replaces it a moment later — a budget that changes
      // by a factor of eight while being read is worse than one that arrives late.
      const host = await probeHostMemory(fresh);
      setBudgets(detectBudgets(gpu, host));
    },
    [engine, setBudgets],
  );

  // The backend comes up asynchronously and the store's first detection ran
  // before it existed — and before the host could be asked — so redo both once
  // there is a context to ask.
  useEffect(() => {
    if (backend && backend !== 'none') void redetect();
  }, [backend, redetect]);

  /** A budget as its slider shows it: the bytes, and whether that is past the detection or the end. */
  const bytesLabel = (v: number, detected: number, ceiling: number) =>
    v > detected * 1.001
      ? t('heat.viewPanel.resources.aboveDetected', { bytes: formatBytes(v) })
      : v >= ceiling * 0.999
        ? t('heat.viewPanel.resources.atMax', { bytes: formatBytes(v) })
        : formatBytes(v);
  const redetectLabel = t('heat.viewPanel.resources.redetect');

  return (
    <details className="budgets" data-testid="resource-budgets">
      <summary>
        {t(
          budgets.ramCeiling > budgets.ramMax * 1.001
            ? 'heat.viewPanel.resources.summaryOf'
            : 'heat.viewPanel.resources.summary',
          {
            ram: formatBytes(budgets.ramMax),
            ceiling: formatBytes(budgets.ramCeiling),
            gpu: formatBytes(budgets.gpuMax),
            cores: budgets.cpuMax,
          },
        )}
      </summary>
      <div className="hint">{t('heat.viewPanel.resources.hint')}</div>
      {!budgets.ramCapped && budgets.ramCeiling > budgets.ramMax * 1.001 && (
        <div className="hint" style={{ color: 'var(--warm)' }}>
          <Rich
            text={[
              t('heat.viewPanel.resources.heldDown'),
              budgets.ramFreeBytes !== null && budgets.ramTotalBytes !== null
                ? t('heat.viewPanel.resources.inUse', {
                    total: formatBytes(budgets.ramTotalBytes),
                    free: formatBytes(budgets.ramFreeBytes),
                    used: formatBytes(budgets.ramTotalBytes - budgets.ramFreeBytes),
                    max: formatBytes(budgets.ramMax),
                    ceiling: formatBytes(budgets.ramCeiling),
                  })
                : t('heat.viewPanel.resources.hardwareAllows', {
                    max: formatBytes(budgets.ramMax),
                    ceiling: formatBytes(budgets.ramCeiling),
                  }),
              t('heat.viewPanel.resources.sliderGoesTo', {
                ceiling: formatBytes(budgets.ramCeiling),
                button: redetectLabel,
              }),
            ].join(' ')}
          />
        </div>
      )}
      {budgets.ramCapped && (
        <div className="hint" style={{ color: 'var(--warm)' }}>
          <Rich
            text={t('heat.viewPanel.resources.capped', {
              api: 'navigator.deviceMemory',
              chrome: 'Chrome',
              edge: 'Edge',
              max: formatBytes(budgets.ramMax),
            })}
          />
        </div>
      )}
      <Slider
        label={t('heat.viewPanel.resources.ram')}
        value={budgets.ram}
        min={MIN_RAM_BUDGET}
        max={budgets.ramCeiling}
        logarithmic
        onChange={(ram) => setBudgets({ ...budgets, ram })}
        format={(v) => bytesLabel(v, budgets.ramMax, budgets.ramCeiling)}
      />
      {budgets.vramBytes === null && (
        <div className="hint" style={{ color: 'var(--warm)' }}>
          {t('heat.viewPanel.resources.gpuInferred', {
            max: formatBytes(budgets.gpuMax),
            ceiling: formatBytes(budgets.gpuCeiling),
          })}
        </div>
      )}
      <Slider
        label={t('heat.viewPanel.resources.gpu')}
        value={budgets.gpu}
        min={MIN_GPU_BUDGET}
        max={budgets.gpuCeiling}
        logarithmic
        onChange={(gpu) => setBudgets({ ...budgets, gpu })}
        format={(v) => bytesLabel(v, budgets.gpuMax, budgets.gpuCeiling)}
      />
      <Slider
        label={t('heat.viewPanel.resources.threads')}
        value={budgets.cpu}
        min={1}
        max={budgets.cpuMax}
        step={1}
        onChange={(cpu) => setBudgets({ ...budgets, cpu })}
        format={(v) => t('heat.viewPanel.resources.threadsOf', { value: num(v, 0), max: num(budgets.cpuMax, 0) })}
        hint={t('heat.viewPanel.resources.threadsHint')}
      />
      <div className="hint">
        <Rich
          text={t('heat.viewPanel.resources.sources', {
            ram: budgets.ramSource,
            gpu: budgets.gpuSource,
            cpu: budgets.cpuSource,
          })}
        />
      </div>
      <div className="hint">
        <Rich
          text={
            budgets.ramCapped
              ? t('heat.viewPanel.resources.derivedCapped')
              : t('heat.viewPanel.resources.derivedServer')
          }
        />
      </div>
      <div className="row">
        <button onClick={() => void redetect(true)}>{redetectLabel}</button>
        {budgets.gpuName ? (
          <span className="mono" title={budgets.gpuName}>
            {classifyRenderer(budgets.gpuName).short}
          </span>
        ) : null}
      </div>
    </details>
  );
}

