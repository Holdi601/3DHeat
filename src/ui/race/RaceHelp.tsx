/**
 * The help mode on the race tab: the key to its colours, each wheel's values
 * on a car's card, and a label at each wheel of the car in focus. A glyph the
 * loaded laps do not carry is not explained, since nothing would show it.
 */

import { useMemo, useRef, useSyncExternalStore } from 'react';
import { t } from '../../i18n';
import { carBody } from '../../race/carMatch';
import { at, CAUSE_COLORS, deltaColor, headingFrame, mix, rgbCss, slipColor, temperatureColor, travelColor, type Rgb } from '../../race/geometry';
import { GLYPH_COLORS, wheelPlaces, WHEEL_HEIGHT } from '../../race/glyph';
import { frameTimes, stateAt, type CarState } from '../../race/replay';
import { lapColors, mistakeColor } from '../../race/scene';
import { channelInfo, CHANNELS, formatValue, wheelName, type Wheel, type WheelGlyph } from '../../race/schema';
import { useHelpStore } from '../../state/helpStore';
import { raceClock, raceHover, useRaceStore } from '../../state/raceStore';
import { useAnimationFrame, useEngine } from '../EngineContext';
import { KeyGroup, KeyRamp, KeyRow } from '../help/HelpPanel';
import { causeLabel } from './RacePanel';

/** Each glyph's ramp in the key, and the words for its ends. */
const GLYPH_KEYS: Record<WheelGlyph, { label: () => string; color: (t: number) => Rgb; low: () => string; middle?: () => string; high: () => string }> = {
  tyreColour: {
    label: () => t('help.race.tyre'),
    color: temperatureColor,
    low: () => t('help.race.tyreLow'),
    middle: () => t('help.race.tyreMiddle'),
    high: () => t('help.race.tyreHigh'),
  },
  slipRing: {
    label: () => t('help.race.slip'),
    color: slipColor,
    low: () => t('help.race.slipLow'),
    middle: () => t('help.race.slipMiddle'),
    high: () => t('help.race.slipHigh'),
  },
  suspensionBar: {
    label: () => t('help.race.travel'),
    color: travelColor,
    low: () => t('help.race.travelLow'),
    middle: () => t('help.race.travelMiddle'),
    high: () => t('help.race.travelHigh'),
  },
  brakeGlow: {
    label: () => t('help.race.brake'),
    color: GLYPH_COLORS.brakeGlow,
    low: () => t('help.race.tyreLow'),
    high: () => t('help.race.tyreHigh'),
  },
  wearBand: {
    label: () => t('help.race.wear'),
    color: GLYPH_COLORS.wearBand,
    low: () => t('help.race.wearLow'),
    high: () => t('help.race.wearHigh'),
  },
  loadBar: {
    label: () => t('help.race.load'),
    color: GLYPH_COLORS.loadBar,
    low: () => t('help.race.loadLow'),
    high: () => t('help.race.loadHigh'),
  },
};

const WHEELS: Wheel[] = ['FL', 'FR', 'RL', 'RR'];

const GLYPH_ORDER: WheelGlyph[] = ['tyreColour', 'slipRing', 'suspensionBar', 'brakeGlow', 'wearBand', 'loadBar'];

/** The key to the race tab's colours. */
export function RaceKey() {
  const laps = useRaceStore((s) => s.laps);
  const colors = useMemo(() => lapColors({ laps }), [laps]);
  const channels = new Set(laps.flatMap((l) => Object.keys(l.channels)));
  const has = (family: string) => [...channels].some((c) => c === family || c.startsWith(`${family}.`));
  const glyphs = GLYPH_ORDER.filter((g) => Object.entries(CHANNELS).some(([name, info]) => info.glyph === g && has(name)));
  const pedals = Object.entries(CHANNELS).filter(([name, info]) => info.input === 'pedal' && has(name));
  const lamps = Object.entries(CHANNELS).filter(([name, info]) => info.input === 'lamp' && has(name));
  return (
    <>
      <KeyGroup title={t('help.race.wheels')}>
        {glyphs.length ? (
          glyphs.map((g) => {
            const k = GLYPH_KEYS[g];
            return <KeyRamp key={g} label={k.label()} color={k.color} low={k.low()} middle={k.middle?.()} high={k.high()} />;
          })
        ) : (
          <KeyRow>{t('help.race.noWheels')}</KeyRow>
        )}
      </KeyGroup>
      <KeyGroup title={t('help.race.car')}>
        <KeyRow>{t('help.race.lapColour')}</KeyRow>
        <div className="help-chips">
          {laps.slice(0, 8).map((lap) => (
            <span key={lap.id}>
              <i style={{ background: rgbCss(colors.get(lap.id)!) }} />
              {lap.label}
            </span>
          ))}
        </div>
        <KeyRow color="#ffffff">{t('help.race.followed')}</KeyRow>
        <KeyRamp
          label={t('help.race.taillights')}
          color={(v) => (v < 0.05 ? [0.3, 0.04, 0.04] : mix([0.6, 0.05, 0.05], [1, 0.15, 0.1], v))}
          low={t('help.race.taillightsLow')}
          high={t('help.race.taillightsHigh')}
        />
        <KeyRow color={rgbCss([1, 0.2, 0.14])}>{t('help.race.crash')}</KeyRow>
        <KeyRow color="#ffa81f">{t('help.race.hit')}</KeyRow>
        {lamps.length > 0 && (
          <>
            <KeyRow>{t('help.race.lamps')}</KeyRow>
            <div className="help-chips">
              {lamps.map(([name, info]) => (
                <span key={name}>
                  <i style={{ background: info.lamp ?? '#ffb14a' }} />
                  {info.label}
                </span>
              ))}
            </div>
          </>
        )}
      </KeyGroup>
      {pedals.length > 0 && (
        <KeyGroup title={t('help.race.cards')}>
          <KeyRow>{t('help.race.pedals')}</KeyRow>
          <div className="help-chips">
            {pedals.map(([name, info]) => (
              <span key={name}>
                <i style={{ background: info.lamp ?? '#c9d1dc' }} />
                {info.label}
              </span>
            ))}
          </div>
          <KeyRow color="#dfe4ec">{t('help.race.steering')}</KeyRow>
        </KeyGroup>
      )}
      <KeyGroup title={t('help.race.track')}>
        <KeyRamp
          label={t('help.race.where')}
          color={(v) => deltaColor(v * 2 - 1, 1)}
          low={t('help.race.gained')}
          middle={t('help.race.level')}
          high={t('help.race.lost')}
        />
        <KeyRow>{t('help.race.why')}</KeyRow>
        <div className="help-chips">
          {Object.entries(CAUSE_COLORS)
            .filter(([k]) => k !== 'context')
            .map(([k, c]) => (
              <span key={k}>
                <i style={{ background: rgbCss(c) }} />
                {causeLabel(k)}
              </span>
            ))}
        </div>
        <KeyRamp label={t('help.race.mistakes')} color={mistakeColor} low={t('race.ui.view.fewLaps')} high={t('race.ui.view.mostLaps')} />
        <KeyRow>{t('help.race.strips')}</KeyRow>
      </KeyGroup>
    </>
  );
}

/** The wheel channels a moment has that are drawn on the wheels: their name, glyph and four values. */
function wheelRows(car: CarState): { family: string; glyph: WheelGlyph; values: number[] }[] {
  const rows: { family: string; glyph: WheelGlyph; values: number[] }[] = [];
  for (const [family, values] of Object.entries(car.wheels)) {
    const glyph = CHANNELS[family]?.glyph;
    if (glyph && values.some(Number.isFinite)) rows.push({ family, glyph, values: [...values] });
  }
  return rows.sort((a, b) => GLYPH_ORDER.indexOf(a.glyph) - GLYPH_ORDER.indexOf(b.glyph));
}

/** What a value of a glyph looks like, in the glyph's own colour. */
function glyphCss(family: string, glyph: WheelGlyph, value: number): string {
  const [lo, hi] = CHANNELS[family]?.display ?? [0, 1];
  const v = glyph === 'slipRing' ? Math.abs(value) : (value - lo) / (hi - lo);
  return rgbCss(GLYPH_COLORS[glyph](Math.max(0, Math.min(1, Number.isFinite(v) ? v : 0))));
}

/** A card's table, in the help mode: each thing shown on the wheels, by name, with each wheel's value. */
export function WheelTable({ car }: { car: CarState }) {
  const on = useHelpStore((s) => s.on);
  if (!on) return null;
  const rows = wheelRows(car);
  if (!rows.length) return null;
  return (
    <div className="hud-wheels mono">
      <span />
      {WHEELS.map((w) => (
        <span key={w} className="head">
          {wheelName(w)}
        </span>
      ))}
      {rows.map(({ family, glyph, values }) => (
        <div key={family} style={{ display: 'contents' }}>
          <span className="name">{channelInfo(family, true).label}</span>
          {values.map((v, w) => (
            <span key={w} className="value" style={{ color: glyphCss(family, glyph, v) }}>
              {formatValue(channelInfo(family, true), v)}
            </span>
          ))}
        </div>
      ))}
    </div>
  );
}

/** Below this many pixels between a car's wheels, labels would only cover it. */
const LABELS_FROM = 70;

/** A label at each wheel of the car in focus, saying what is drawn there. */
export function RaceWheelLabels() {
  const on = useHelpStore((s) => s.on);
  const engine = useEngine();
  const laps = useRaceStore((s) => s.laps);
  const analysis = useRaceStore((s) => s.analysis);
  const motions = useRaceStore((s) => s.motions);
  const offsets = useRaceStore((s) => s.offsets);
  const mode = useRaceStore((s) => s.replay.mode);
  const focusId = useRaceStore((s) => s.follow ?? s.focusId);
  const shapes = useRaceStore((s) => s.view.carShapes);
  const packs = useRaceStore((s) => s.carPacks);
  const scale = useRaceStore((s) => s.view.carScale);
  const clock = useSyncExternalStore(raceClock.subscribe, raceClock.snapshot);
  const hover = useSyncExternalStore(raceHover.subscribe, raceHover.snapshot);
  const nodes = useRef<(HTMLDivElement | null)[]>([]);

  const lap = on ? laps.find((l) => l.id === focusId) : undefined;
  const motion = lap ? motions.get(lap.id) : undefined;
  const places: [number, number, number][] = [];
  let rows: ReturnType<typeof wheelRows> = [];
  if (lap && motion && analysis) {
    const when = frameTimes(analysis.alignment, mode, clock, offsets, hover).get(lap.id) ?? clock;
    const car = stateAt(motion, when);
    rows = wheelRows(car);
    const frame = headingFrame(car.x, car.y, car.z, car.heading);
    const road = { ...frame, o: [frame.o[0], frame.o[1] - WHEEL_HEIGHT, frame.o[2]] as [number, number, number] };
    const model = shapes ? carBody(lap, packs).model : undefined;
    for (const w of wheelPlaces(model, motion.wheelSide)) {
      places.push(at(road, w.fx * scale, w.side * scale, w.radius * scale));
    }
  }

  useAnimationFrame(() => {
    if (!engine || !places.length) return;
    const shown = places.map((p) => engine.project(p[0], p[1], p[2]));
    const a = shown[0];
    const b = shown[3];
    const big = a && b && Math.hypot(a.x - b.x, a.y - b.y) > LABELS_FROM;
    // Each label on its wheel's own side of the car, out at the corner, so none covers the car.
    const seen = shown.filter((p) => p !== null) as { x: number; y: number }[];
    const middleX = seen.reduce((sum, p) => sum + p.x, 0) / (seen.length || 1);
    const middleY = seen.reduce((sum, p) => sum + p.y, 0) / (seen.length || 1);
    shown.forEach((p, w) => {
      const el = nodes.current[w];
      if (!el) return;
      if (!p || !big) {
        el.style.display = 'none';
        return;
      }
      el.style.display = '';
      const across = p.x < middleX ? 'calc(-100% - 14px)' : '14px';
      const down = p.y < middleY ? 'calc(-100% - 6px)' : '6px';
      el.style.transform = `translate(${p.x.toFixed(1)}px, ${p.y.toFixed(1)}px) translate(${across}, ${down})`;
    });
  }, places.length > 0);

  if (!places.length || !rows.length) return null;
  return (
    <div className="race-labels">
      {places.map((_, w) => (
        <div
          key={w}
          ref={(el) => {
            nodes.current[w] = el;
          }}
          className="race-label wheel"
        >
          {rows.map(({ family, glyph, values }) => (
            <div key={family}>
              <i style={{ background: glyphCss(family, glyph, values[w]) }} />
              {CHANNELS[family]?.short ?? channelInfo(family, true).label} {formatValue(channelInfo(family, true), values[w])}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
