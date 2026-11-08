import { useRef } from 'react';
import { MIN_FLY_SPEED } from '../render/camera';
import { useStore } from '../state/store';
import { useAnimationFrame, useEngine } from './EngineContext';
import { useJogDrag } from './Jog';
import { num, t } from '../i18n';
import { unitPrefs } from '../state/unitsStore';
import { FT } from '../units/units';

/**
 * Fly speed, over the viewport, draggable.
 *
 * Speed is the one camera setting you need to change *while* flying, and until
 * now it was the only one with no visible state: the wheel adjusted a number
 * that lived in a collapsed panel, so the way you discovered you were too fast
 * was by shooting past the building you were aiming at, with nothing on screen
 * to say by how much.
 *
 * Framing a map sets the speed from the size of the map — some thousands of
 * units a second on an eight-kilometre level — which is right for crossing it
 * and two or three decades too fast for looking at a doorway. So the readout is
 * also the control: drag it down and it slows, geometrically, the same gesture
 * and the same rate law as the handles beside the sliders.
 *
 * Written to the DOM directly rather than through state, like `StatsOverlay`,
 * because the wheel changes the speed every notch and re-rendering the tree for
 * a number that updates continuously is the sort of thing that shows up as
 * stutter while flying.
 */
export function SpeedOverlay() {
  const engine = useEngine();
  const flySpeed = useStore((s) => s.camera.flySpeed);
  const projection = useStore((s) => s.camera.projection);
  const patchCamera = useStore((s) => s.patchCamera);
  const bounds = useStore((s) =>
    s.level && s.level.kind === 'model' ? s.level.bounds : (s.dataset?.bounds ?? null),
  );
  const readout = useRef<HTMLElement>(null);
  const scale = useRef<HTMLElement>(null);

  // The level's size when there is one, the data's otherwise — the same rule the
  // slice uses, so "across" means the same thing in both places.
  const extent = bounds
    ? Math.max(
        bounds.maxX - bounds.minX,
        bounds.maxY - bounds.minY,
        bounds.maxZ - bounds.minZ,
      )
    : 0;

  const { active, offset, handlers } = useJogDrag({
    value: flySpeed,
    onChange: (v) => patchCamera({ flySpeed: v }),
    min: MIN_FLY_SPEED,
    max: 20_000,
    ceiling: 200_000,
    // In ratios, not in metres per second. Two centimetres a second and two
    // kilometres a second are both ordinary here, and the useful operation at
    // either end is "half as fast", never "one less".
    proportional: true,
  });

  useAnimationFrame(() => {
    if (!engine) return;
    // From the camera, not from the store: the wheel writes to the camera and
    // the store catches up a frame later, so reading the store here would show
    // a number that lags every notch.
    const v = engine.camera.speed;
    setText(readout, format(v));
    // What that speed means in time rather than in units — the number people
    // actually want when deciding whether to slow down. A metre-scale level and
    // a centimetre-scale one produce the same reading here.
    setText(scale, extent > 0 ? t('heat.speedOverlay.toCross', { time: formatSpan(extent / Math.max(1e-6, v)) }) : '');
  }, !!engine);

  // Orthographic has no forward motion, so it has no fly speed to show; the
  // wheel is a zoom there instead.
  if (projection === 'orthographic') return null;

  return (
    <div
      className={`speed-hud${active ? ' active' : ''}`}
      title={t('heat.speedOverlay.title')}
      {...handlers}
    >
      <span className="grip" style={{ transform: `translateY(${-offset * 5}px)` }} />
      <span className="body">
        <b ref={readout}>—</b>
        <i ref={scale} />
      </span>
    </div>
  );
}

/**
 * Enough precision to see a change at every magnitude, and no more.
 *
 * Two centimetres a second and twenty thousand are both legitimate here, so a
 * fixed number of decimals is either noise at one end or a value that appears
 * frozen while it is being dragged at the other.
 */
function format(v: number): string {
  if (!Number.isFinite(v)) return '—';
  if (unitPrefs().altitude === 'ft') {
    // Feet a second where lengths are in feet: a camera's pace, not a vehicle's.
    const f = v / FT;
    return t('units.v.fts', { v: num(f, f >= 100 ? 0 : f >= 10 ? 1 : f >= 1 ? 2 : 3) });
  }
  if (v >= 1000) return t('heat.speedOverlay.kms', { value: num(v / 1000, 2) });
  return t('heat.speedOverlay.ms', { value: num(v, v >= 100 ? 0 : v >= 10 ? 1 : v >= 1 ? 2 : 3) });
}

/** How long the whole scene takes to cross, kept short enough to sit on one line. */
function formatSpan(seconds: number): string {
  if (!Number.isFinite(seconds)) return '—';
  if (seconds >= 3600) return t('heat.speedOverlay.hours', { value: num(seconds / 3600, 0) });
  if (seconds >= 60) return t('heat.speedOverlay.minutes', { value: num(seconds / 60, 0) });
  return t('heat.speedOverlay.seconds', { value: num(seconds, seconds >= 10 ? 0 : 1) });
}

function setText(ref: { current: HTMLElement | null }, v: string): void {
  const el = ref.current;
  if (el && el.textContent !== v) el.textContent = v;
}
