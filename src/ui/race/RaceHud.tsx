import { useMemo, useSyncExternalStore, type ReactNode } from 'react';
import { timeAt } from '../../race/align';
import { rgbCss, slipColor, temperatureColor, travelColor } from '../../race/geometry';
import { litLamps, wheelGlyphValues } from '../../race/glyph';
import { formatLapTime, type LapTrace } from '../../race/lap';
import { frameTimes, inputWindow, stateAt, type CarState } from '../../race/replay';
import { lapColors } from '../../race/scene';
import {
  CHANNELS,
  channelInfo,
  formatValue,
  GROUPS,
  type ChannelInfo,
  type WheelGlyph,
  withUnit,
} from '../../race/schema';
import { raceClock, raceHover, useRaceStore } from '../../state/raceStore';
import { int, t } from '../../i18n';
import { WheelTable } from './RaceHelp';
import { signed } from './RacePanel';
import { lengthArg, unitPrefs } from '../../state/unitsStore';
import { formatLength, symbolOf } from '../../units/format';
import { toSpeed } from '../../units/units';

const W = 64;
const H = 104;
// FL, FR, RL, RR: the car points up the card.
const WHEEL_AT: [number, number][] = [
  [14, 26],
  [50, 26],
  [14, 80],
  [50, 80],
];

/** How far the drawn wheel turns at full lock, degrees. */
const WHEEL_LOCK = 180;
/** Seconds of input history in the trace. */
const TRACE_SECONDS = 6;

function clamp01(v: number): number {
  return Math.max(0, Math.min(1, Number.isFinite(v) ? v : 0));
}

/** Where a glyph draws on the card's car: one wheel, and which side is outside. */
interface CardWheel {
  x: number;
  y: number;
  outside: number;
  value: number;
}

/**
 * The glyphs on the car on each card, by kind - the flat twin of
 * `WHEEL_GLYPHS` in glyph.ts. The tyre's own colour is drawn with the tyre.
 */
const CARD_GLYPHS: Record<WheelGlyph, (w: CardWheel) => ReactNode> = {
  tyreColour: () => null,
  slipRing: ({ x, y, value }) => (
    <circle
      cx={x}
      cy={y}
      r={12}
      fill="none"
      stroke={rgbCss(slipColor(value))}
      strokeWidth={2}
      opacity={Math.max(0.2, Math.min(1, (value - 0.3) / 0.7))}
    />
  ),
  suspensionBar: ({ x, y, outside, value }) => (
    <rect
      x={x + outside * 10 - 1.5}
      y={y + 9 - clamp01(value) * 18}
      width={3}
      height={clamp01(value) * 18}
      fill={rgbCss(travelColor(value))}
    />
  ),
  brakeGlow: ({ x, y, value }) => (
    <circle
      cx={x}
      cy={y}
      r={2.6}
      fill={rgbCss([
        0.25 + 0.75 * clamp01(value),
        0.2 + 0.25 * clamp01(value),
        0.2 - 0.1 * clamp01(value),
      ])}
    />
  ),
  wearBand: ({ x, y, value }) => (
    <rect
      x={x - 6}
      y={y - 11}
      width={12}
      height={22}
      rx={3}
      fill="none"
      stroke={rgbCss([
        0.9 + 0.1 * clamp01(value),
        0.9 - 0.7 * clamp01(value),
        0.9 - 0.7 * clamp01(value),
      ])}
      strokeWidth={1.2}
    />
  ),
  loadBar: ({ x, y, outside, value }) => {
    const load = Math.min(1.2, Math.max(0, value));
    return (
      <rect
        x={x - outside * 9 - 1.5}
        y={y + 9 - load * 15}
        width={3}
        height={load * 15}
        fill="#c9d1dc"
        opacity={0.8}
      />
    );
  },
};

/** Glyphs drawn over the tyre rather than under it. */
const OVER_TYRE: WheelGlyph[] = ['brakeGlow', 'wearBand'];

/** The car from above: whatever the lap's per-wheel channels say, by glyph, and the steering. */
function TopDown({ car, color }: { car: CarState; color: string }) {
  const steer = Number.isFinite(car.steer) ? car.steer * 28 : 0;
  return (
    <svg
      width={W}
      height={H}
      viewBox={`0 0 ${W} ${H}`}
      className="topdown"
      aria-label={t('race.ui.hud.carFromAbove')}
    >
      <rect x={17} y={8} width={30} height={88} rx={9} fill="none" stroke={color} strokeWidth={3} />
      <rect x={22} y={40} width={20} height={24} rx={4} fill={color} opacity={0.35} />
      <path
        d="M26 16 L32 10 L38 16"
        fill="none"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
      />
      {WHEEL_AT.map(([x, y], w) => {
        const g = wheelGlyphValues(car, w);
        const fill =
          g.tyreColour !== undefined ? rgbCss(temperatureColor(g.tyreColour)) : '#3a3f47';
        const outside = w % 2 === 0 ? -1 : 1;
        const kinds = Object.entries(g) as [WheelGlyph, number][];
        const draw = (over: boolean) =>
          kinds
            .filter(([kind]) => OVER_TYRE.includes(kind) === over)
            .map(([kind, value]) => (
              <g key={kind}>{CARD_GLYPHS[kind]({ x, y, outside, value })}</g>
            ));
        return (
          <g key={w}>
            {draw(false)}
            <rect
              x={x - 4.5}
              y={y - 9}
              width={9}
              height={18}
              rx={2}
              fill={fill}
              transform={w < 2 ? `rotate(${steer} ${x} ${y})` : undefined}
            />
            {draw(true)}
          </g>
        );
      })}
    </svg>
  );
}

/** The channels this moment has with a given input kind, in the table's order. */
function inputs(car: CarState, kind: ChannelInfo['input']): [string, ChannelInfo, number][] {
  return Object.entries(car.values)
    .filter(([name]) => CHANNELS[name]?.input === kind)
    .map(([name, v]): [string, ChannelInfo, number] => [name, CHANNELS[name], v])
    .sort((a, b) => (a[1].order ?? 99) - (b[1].order ?? 99));
}

/**
 * The driver's hands and feet at this moment, from whatever the lap carries,
 * as the channel table says: the wheel for the steering, a bar per pedal, the
 * gear, a lamp per aid or switch (lit while on), a readout per level.
 */
function Inputs({ car }: { car: CarState }) {
  const steering = inputs(car, 'steering')[0];
  const steer =
    steering && Number.isFinite(steering[2]) ? Math.max(-1, Math.min(1, steering[2])) : 0;
  // As a pedal box has them, left to right: clutch, brake, throttle.
  const pedals = inputs(car, 'pedal').reverse();
  const gear = inputs(car, 'gear')[0];
  const lamps = inputs(car, 'lamp');
  const lit = new Set(litLamps(car).map((l) => l.name));
  const levels = inputs(car, 'level');
  const bar = 44;
  return (
    <div className="hud-inputs" aria-label={t('race.ui.hud.inputs')}>
      {steering && (
        <svg width={64} height={70} viewBox="0 0 64 70" className="wheel">
          <g transform={`rotate(${steer * WHEEL_LOCK} 32 30)`}>
            <circle cx={32} cy={30} r={24} fill="none" stroke="#8d96a5" strokeWidth={5} />
            <path d="M8 30 H56 M32 30 V54" stroke="#8d96a5" strokeWidth={4} strokeLinecap="round" />
            <circle cx={32} cy={30} r={6} fill="#2a3038" stroke="#8d96a5" strokeWidth={2} />
            <rect x={29.5} y={3} width={5} height={7} rx={1.5} fill="#ffb14a" />
          </g>
          <text x={32} y={68} textAnchor="middle" className="hud-num">
            {withUnit(`${steer >= 0 ? '' : '−'}${int(Math.abs(Math.round(steer * 100)))}`, '%')}
          </text>
        </svg>
      )}
      <div className="hud-pedals">
        {pedals.map(([name, info, v]) => {
          const [lo, hi] = info.display ?? [0, 1];
          const level = clamp01((v - lo) / (hi - lo));
          return (
            <div key={name} className="hud-pedal" title={info.label}>
              <span className="mono">{Number.isFinite(v) ? int(level * 100) : '–'}</span>
              <span className="track" style={{ height: bar }}>
                <i style={{ height: `${level * 100}%`, background: info.lamp ?? '#c9d1dc' }} />
              </span>
              <span className="mono lbl">{info.short ?? name}</span>
            </div>
          );
        })}
      </div>
      <div className="hud-gear">
        {gear && (
          <span className="mono">
            {Number.isFinite(gear[2])
              ? gear[2] < 0
                ? t('race.ui.hud.reverse')
                : gear[2] === 0
                  ? t('race.ui.hud.neutral')
                  : int(gear[2])
              : '–'}
          </span>
        )}
        {lamps.map(([name, info]) => (
          <span
            key={name}
            className={`hb${lit.has(name) ? ' on' : ''}`}
            style={lit.has(name) ? { background: info.lamp, borderColor: info.lamp } : undefined}
            title={info.label}
          >
            {info.short ?? name}
          </span>
        ))}
      </div>
      {levels.length > 0 && (
        <div className="hud-levels">
          {levels.map(([name, info, v]) => (
            <div key={name} title={info.label}>
              <span className="lbl">{info.short ?? name}</span>{' '}
              <span className="mono">{formatValue(info, v)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * The last few seconds of the driver's inputs, ending at this moment: what
 * they did on the way into it. Every pedal the lap carries in one lane, in its
 * own colour, and the steering in another, each on its own scale.
 */
function InputTrace({ lap, time }: { lap: LapTrace; time: number }) {
  const w = 330;
  const pedalH = 26;
  const steerH = 18;
  const gap = 4;
  const pedals = Object.entries(CHANNELS)
    .filter(([name, info]) => info.input === 'pedal' && lap.channels[name])
    .sort((a, b) => (b[1].order ?? 99) - (a[1].order ?? 99));
  const steering = Object.keys(CHANNELS).find(
    (name) => CHANNELS[name].input === 'steering' && lap.channels[name],
  );
  const win = inputWindow(lap, time, TRACE_SECONDS, [
    ...pedals.map(([name]) => name),
    ...(steering ? [steering] : []),
  ]);
  const x = (at: number) => w + (at / TRACE_SECONDS) * w;
  const line = (values: Float32Array, y: (v: number) => number) => {
    let d = '';
    for (let k = 0; k < win.count; k++) {
      const v = values[k];
      if (!Number.isFinite(v)) continue;
      d += `${d ? 'L' : 'M'}${x(win.at[k]).toFixed(1)},${y(v).toFixed(1)}`;
    }
    return d;
  };
  const steerTop = pedalH + gap;
  const steerY = (v: number) =>
    steerTop + steerH / 2 - (Math.max(-1, Math.min(1, v)) * (steerH - 2)) / 2;
  return (
    <svg
      width={w}
      height={pedalH + gap + steerH}
      className="hud-trace"
      aria-label={t('race.ui.hud.trace', { seconds: TRACE_SECONDS })}
    >
      <rect x={0} y={0} width={w} height={pedalH} className="lane" />
      <rect x={0} y={steerTop} width={w} height={steerH} className="lane" />
      <line x1={0} x2={w} y1={steerTop + steerH / 2} y2={steerTop + steerH / 2} className="mid" />
      {pedals.map(([name, info]) => {
        const [lo, hi] = info.display ?? [0, 1];
        return (
          <path
            key={name}
            d={line(
              win.values[name],
              (v) => 1 + (1 - clamp01((v - lo) / (hi - lo))) * (pedalH - 2),
            )}
            stroke={info.lamp ?? '#c9d1dc'}
            className="trace"
          />
        );
      })}
      {steering && (
        <path d={line(win.values[steering], steerY)} stroke="#dfe4ec" className="trace" />
      )}
    </svg>
  );
}

/**
 * Everything else the lap carries at this moment, whatever it is: each scalar
 * not already on the card, and each per-wheel channel as four values - so a
 * game that sends more shows more, named from the channel table or, failing
 * that, from its own name.
 */
function Values({ car }: { car: CarState }) {
  const order = (i: ChannelInfo) => GROUPS.indexOf(i.group) * 1000 + (i.order ?? 99);
  const scalars = Object.entries(car.values)
    .filter(([name]) => !CHANNELS[name]?.input)
    .map(([name, v]): [string, ChannelInfo, number] => [name, channelInfo(name), v])
    .sort((a, b) => order(a[1]) - order(b[1]));
  const wheels = Object.entries(car.wheels)
    .map(([family, v]): [string, ChannelInfo, number[]] => [family, channelInfo(family, true), v])
    .sort((a, b) => order(a[1]) - order(b[1]));
  return (
    <div className="hud-values">
      {scalars.map(([name, info, v]) => (
        <div key={name} className="row" title={name}>
          <span className="lbl">{info.label}</span>
          <span className="mono">{formatValue(info, v)}</span>
        </div>
      ))}
      {wheels.map(([family, info, v]) => (
        <div
          key={family}
          className="row"
          title={t('race.ui.hud.wheels', { family })}
        >
          <span className="lbl">{info.label}</span>
          <span className="mono">
            {v
              .map((x) => formatValue({ ...info, show: { ...info.show, unit: '' }, unit: '' }, x))
              .join(' ')}
          </span>
        </div>
      ))}
    </div>
  );
}

export function RaceHud() {
  const clock = useSyncExternalStore(raceClock.subscribe, raceClock.snapshot);
  const hover = useSyncExternalStore(raceHover.subscribe, raceHover.snapshot);
  const laps = useRaceStore((s) => s.laps);
  const hidden = useRaceStore((s) => s.hidden);
  const analysis = useRaceStore((s) => s.analysis);
  const motions = useRaceStore((s) => s.motions);
  const offsets = useRaceStore((s) => s.offsets);
  const mode = useRaceStore((s) => s.replay.mode);
  const follow = useRaceStore((s) => s.follow);
  const details = useRaceStore((s) => s.view.hudDetails);
  const patchView = useRaceStore((s) => s.patchView);
  const colors = useMemo(() => lapColors({ laps }), [laps]);
  if (!analysis) return null;
  const times = frameTimes(analysis.alignment, mode, clock, offsets, hover);
  const ref = analysis.alignment.laps.find((l) => l.lap === analysis.alignment.reference)!;
  const visible = laps.filter((l) => !hidden[l.id]).slice(0, 6);

  return (
    <div className="race-hud">
      {hover !== null && (
        <div className="hud-cursor mono">{t('race.ui.hud.cursor', { m: lengthArg(hover) })}</div>
      )}
      {visible.map((lap) => {
        const m = motions.get(lap.id);
        if (!m) return null;
        const at = times.get(lap.id) ?? clock;
        const car = stateAt(m, at);
        const aligned = analysis.alignment.laps.find((l) => l.lap === lap);
        // The gap where this car is now: its time to here against the reference's.
        const gap =
          aligned && lap !== ref.lap
            ? timeAt(aligned, analysis.alignment.grid, car.distance) -
              timeAt(ref, analysis.alignment.grid, car.distance)
            : Number.NaN;
        const color = rgbCss(colors.get(lap.id)!);
        return (
          <div key={lap.id} className={`hud-card${follow === lap.id ? ' on' : ''}`}>
            <div className="hud-head">
              <i style={{ background: color }} />
              <span className="hud-name">{lap.label}</span>
              <span className="mono hud-gap">
                {lap === ref.lap ? t('race.ui.hud.reference') : withUnit(signed(gap, 2), 's')}
              </span>
              <button
                className={`icon hud-more${details ? ' on' : ''}`}
                title={details ? t('race.ui.hud.hideValues') : t('race.ui.hud.showValues')}
                onClick={() => patchView({ hudDetails: !details })}
              >
                ⋯
              </button>
            </div>
            <div className="hud-body">
              <TopDown car={car} color={color} />
              <div className="hud-read">
                <div className="hud-speed mono">
                  {int(toSpeed(car.speed, unitPrefs().speed))}
                  <small> {symbolOf(unitPrefs().speed)}</small>
                </div>
                <div className="mono hud-line">{formatLapTime(car.time)}</div>
                <div className="mono hud-line">{formatLength(car.distance, unitPrefs(), 0)}</div>
              </div>
              <Inputs car={car} />
            </div>
            <InputTrace lap={lap} time={car.time} />
            <WheelTable car={car} />
            {details && <Values car={car} />}
          </div>
        );
      })}
    </div>
  );
}
