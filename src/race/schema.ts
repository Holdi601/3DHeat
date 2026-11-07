/**
 * The channels a lap can carry, by their canonical names, and how each one is
 * shown.
 *
 * This table is the one place a channel is described. Every source - FH
 * Companion's lap files, Forza's Data Out, the Assetto Corsa games' shared
 * memory, iRacing's `.ibt` - is read into these names, and everything that
 * draws a lap asks this table how to show what it finds:
 *
 * - the **graphs** offer every channel a lap has, grouped as here, and show
 *   the ones marked `graph` unless the user picks otherwise;
 * - the **input panel** draws every `input` channel present: a bar per pedal,
 *   the wheel, the gear, a lamp per on/off aid, a readout per level;
 * - the **car** draws every per-wheel channel with a `glyph` (tyre colour,
 *   slip ring, suspension pad, brake glow, wear band, load bar) and lights a
 *   lamp on its roof for each active `lamp` channel;
 * - the **value table** on each car's card lists everything else.
 *
 * So a game with more telemetry needs its channels named here - one line each
 * - and nothing that draws them changes. A channel that is not here at all is
 * still read, graphed and tabled under its own name (see `channelInfo`).
 *
 * Per-wheel channels are stored as `name.FL`, `name.FR`, `name.RL`, `name.RR`.
 *
 * What a channel is called, and its short name, are messages in the user's
 * language: `race.channel.<name>.label` and `race.channel.<name>.short`.
 */

import { num, t } from '../i18n';

export type Wheel = 'FL' | 'FR' | 'RL' | 'RR';
export const WHEELS: readonly Wheel[] = ['FL', 'FR', 'RL', 'RR'];

const WHEEL_NAMES: Record<Wheel, string> = {
  FL: 'race.channel.wheel.FL',
  FR: 'race.channel.wheel.FR',
  RL: 'race.channel.wheel.RL',
  RR: 'race.channel.wheel.RR',
};

/** A wheel's short name, in the user's language: FL, FR, RL, RR. */
export function wheelName(wheel: Wheel): string {
  return t(WHEEL_NAMES[wheel]);
}

/** How a per-wheel channel is drawn on the car and on its card. See `glyph.ts`. */
export type WheelGlyph =
  'tyreColour' | 'suspensionBar' | 'slipRing' | 'brakeGlow' | 'wearBand' | 'loadBar';

/** How a channel appears on the input panel. */
export type InputKind = 'pedal' | 'steering' | 'gear' | 'lamp' | 'level';

export type ChannelGroup =
  | 'timing'
  | 'position'
  | 'motion'
  | 'inputs'
  | 'aids'
  | 'engine'
  | 'tyres'
  | 'suspension'
  | 'brakes'
  | 'wheels'
  | 'other';

/** Group order, for the graph picker and the value table. */
export const GROUPS: ChannelGroup[] = [
  'motion',
  'inputs',
  'engine',
  'aids',
  'tyres',
  'brakes',
  'suspension',
  'wheels',
  'other',
  'timing',
  'position',
];

const GROUP_LABELS: Record<ChannelGroup, string> = {
  timing: 'race.channel.group.timing',
  position: 'race.channel.group.position',
  motion: 'race.channel.group.motion',
  inputs: 'race.channel.group.inputs',
  aids: 'race.channel.group.aids',
  engine: 'race.channel.group.engine',
  tyres: 'race.channel.group.tyres',
  suspension: 'race.channel.group.suspension',
  brakes: 'race.channel.group.brakes',
  wheels: 'race.channel.group.wheels',
  other: 'race.channel.group.other',
};

/** A group's name, in the user's language. */
export function groupLabel(group: ChannelGroup): string {
  return t(GROUP_LABELS[group]);
}

export interface ChannelInfo {
  /** What it is called, in the user's language. */
  label: string;
  /** The unit the value is stored in. */
  unit: string;
  /** One value per sample, or one per wheel per sample. */
  kind: 'scalar' | 'wheel';
  group: ChannelGroup;
  /**
   * The range a display maps onto a colour or bar: what counts as cold and hot,
   * slack and compressed. Not a clamp on the data.
   */
  display?: [number, number];
  /** How to draw it on the car's wheels, if at all. */
  glyph?: WheelGlyph;
  /** How it appears on the input panel, if at all. */
  input?: InputKind;
  /** Short name on a pedal, a lamp or a level readout. */
  short?: string;
  /** A pedal's or a lamp's colour (CSS); a lamp's also lights on the car's roof. */
  lamp?: string;
  /** Graphed unless the user picks otherwise. */
  graph?: boolean;
  /** Steps rather than blends between samples: a gear, a flag, a count. */
  stepped?: boolean;
  /** Shown multiplied by `scale`, in `unit`, to `digits` places, on a fixed `range` if given. */
  show?: { scale?: number; unit?: string; digits?: number; range?: [number, number] };
  /** Order within its group; lower first. */
  order?: number;
}

/**
 * A channel as the table writes it: what it is called, and its short name if
 * it has one (`short: true`), are messages - see `worded`.
 */
type Entry = Omit<ChannelInfo, 'label' | 'short'> & { short?: true };

const pct = { scale: 100, unit: '%', digits: 0, range: [0, 100] as [number, number] };
const degC = { digits: 0 };
const DEG = 180 / Math.PI;
const G = 1 / 9.80665;

const TABLE: Record<string, Entry> = {
  time: { unit: 's', kind: 'scalar', group: 'timing' },
  distance: { unit: 'm', kind: 'scalar', group: 'timing' },
  x: { unit: 'm', kind: 'scalar', group: 'position' },
  y: { unit: 'm', kind: 'scalar', group: 'position' },
  z: { unit: 'm', kind: 'scalar', group: 'position' },

  // Inputs.
  throttle: {
    unit: '',
    kind: 'scalar',
    group: 'inputs',
    display: [0, 1],
    input: 'pedal',
    short: true,
    lamp: '#46d17f',
    graph: true,
    show: pct,
    order: 1,
  },
  brake: {
    unit: '',
    kind: 'scalar',
    group: 'inputs',
    display: [0, 1],
    input: 'pedal',
    short: true,
    lamp: '#ff5d5d',
    graph: true,
    show: pct,
    order: 2,
  },
  clutch: {
    unit: '',
    kind: 'scalar',
    group: 'inputs',
    display: [0, 1],
    input: 'pedal',
    short: true,
    lamp: '#4da3ff',
    graph: true,
    show: pct,
    order: 3,
  },
  handbrake: {
    unit: '',
    kind: 'scalar',
    group: 'inputs',
    display: [0, 1],
    input: 'lamp',
    short: true,
    lamp: '#ff6a3d',
    graph: true,
    show: pct,
    order: 4,
  },
  steer: {
    unit: '',
    kind: 'scalar',
    group: 'inputs',
    display: [-1, 1],
    input: 'steering',
    graph: true,
    show: { scale: 100, unit: '%', digits: 0, range: [-100, 100] },
    order: 5,
  },
  gear: {
    unit: '',
    kind: 'scalar',
    group: 'inputs',
    input: 'gear',
    graph: true,
    stepped: true,
    show: { digits: 0 },
    order: 6,
  },

  // Aids and settings: lamps light while an aid acts, levels read out.
  absActive: {
    unit: '',
    kind: 'scalar',
    group: 'aids',
    display: [0, 1],
    input: 'lamp',
    short: true,
    lamp: '#ffb14a',
    stepped: true,
    show: { digits: 0 },
    order: 1,
  },
  tcActive: {
    unit: '',
    kind: 'scalar',
    group: 'aids',
    display: [0, 1],
    input: 'lamp',
    short: true,
    lamp: '#ffb14a',
    stepped: true,
    show: { digits: 0 },
    order: 2,
  },
  drs: {
    unit: '',
    kind: 'scalar',
    group: 'aids',
    display: [0, 1],
    input: 'lamp',
    short: true,
    lamp: '#46d17f',
    show: { digits: 0 },
    order: 3,
  },
  pitLimiter: {
    unit: '',
    kind: 'scalar',
    group: 'aids',
    display: [0, 1],
    input: 'lamp',
    short: true,
    lamp: '#4da3ff',
    stepped: true,
    show: { digits: 0 },
    order: 4,
  },
  brakeBias: {
    unit: '',
    kind: 'scalar',
    group: 'aids',
    input: 'level',
    short: true,
    show: { scale: 100, unit: '%', digits: 1 },
    order: 5,
  },
  absLevel: {
    unit: '',
    kind: 'scalar',
    group: 'aids',
    input: 'level',
    short: true,
    stepped: true,
    show: { digits: 0 },
    order: 6,
  },
  tcLevel: {
    unit: '',
    kind: 'scalar',
    group: 'aids',
    input: 'level',
    short: true,
    stepped: true,
    show: { digits: 0 },
    order: 7,
  },

  // Motion.
  speed: {
    unit: 'm/s',
    kind: 'scalar',
    group: 'motion',
    graph: true,
    show: { scale: 3.6, unit: 'km/h', digits: 0 },
    order: 0,
  },
  latAcc: {
    unit: 'm/s²',
    kind: 'scalar',
    group: 'motion',
    show: { scale: G, unit: 'g', digits: 2 },
    order: 1,
  },
  longAcc: {
    unit: 'm/s²',
    kind: 'scalar',
    group: 'motion',
    show: { scale: G, unit: 'g', digits: 2 },
    order: 2,
  },
  vertAcc: {
    unit: 'm/s²',
    kind: 'scalar',
    group: 'motion',
    show: { scale: G, unit: 'g', digits: 2 },
    order: 3,
  },
  yaw: {
    unit: 'rad',
    kind: 'scalar',
    group: 'motion',
    show: { scale: DEG, unit: '°', digits: 0 },
    order: 4,
  },
  pitch: {
    unit: 'rad',
    kind: 'scalar',
    group: 'motion',
    show: { scale: DEG, unit: '°', digits: 1 },
    order: 5,
  },
  roll: {
    unit: 'rad',
    kind: 'scalar',
    group: 'motion',
    show: { scale: DEG, unit: '°', digits: 1 },
    order: 6,
  },
  yawRate: {
    unit: 'rad/s',
    kind: 'scalar',
    group: 'motion',
    show: { scale: DEG, unit: '°/s', digits: 0 },
    order: 7,
  },
  // The car's velocity in its own frame - x to the right, z forwards - and
  // what follows from it: the angle between where the car points and where it
  // goes. Derived when a game sends a heading and a world velocity instead.
  latVel: {
    unit: 'm/s',
    kind: 'scalar',
    group: 'motion',
    show: { scale: 3.6, unit: 'km/h', digits: 1 },
    order: 8,
  },
  longVel: {
    unit: 'm/s',
    kind: 'scalar',
    group: 'motion',
    show: { scale: 3.6, unit: 'km/h', digits: 0 },
    order: 9,
  },
  vertVel: {
    unit: 'm/s',
    kind: 'scalar',
    group: 'motion',
    show: { digits: 2 },
    order: 10,
  },
  bodySlip: {
    unit: 'rad',
    kind: 'scalar',
    group: 'motion',
    display: [0, 0.6],
    show: { scale: DEG, unit: '°', digits: 1 },
    order: 11,
  },
  loose: {
    unit: '',
    kind: 'scalar',
    group: 'wheels',
    stepped: true,
    show: { digits: 0 },
    order: 0.5,
  },
  airborne: {
    unit: '',
    kind: 'scalar',
    group: 'motion',
    input: 'lamp',
    short: true,
    lamp: '#7fd4ff',
    stepped: true,
    show: { digits: 0 },
    order: 12,
  },
  lateral: {
    unit: 'm',
    kind: 'scalar',
    group: 'motion',
    show: { digits: 1 },
    order: 8,
  },

  // Engine.
  rpm: {
    unit: 'rpm',
    kind: 'scalar',
    group: 'engine',
    show: { digits: 0 },
    order: 1,
  },
  power: {
    unit: 'W',
    kind: 'scalar',
    group: 'engine',
    show: { scale: 0.001, unit: 'kW', digits: 0 },
    order: 2,
  },
  torque: {
    unit: 'N m',
    kind: 'scalar',
    group: 'engine',
    show: { digits: 0 },
    order: 3,
  },
  boost: {
    unit: '',
    kind: 'scalar',
    group: 'engine',
    input: 'level',
    short: true,
    show: { digits: 2 },
    order: 4,
  },
  fuel: {
    unit: '',
    kind: 'scalar',
    group: 'engine',
    input: 'level',
    short: true,
    show: { digits: 1 },
    order: 5,
  },
  waterTemp: {
    unit: '°C',
    kind: 'scalar',
    group: 'engine',
    show: degC,
    order: 6,
  },
  oilTemp: {
    unit: '°C',
    kind: 'scalar',
    group: 'engine',
    show: degC,
    order: 7,
  },

  // Tyres.
  tireTemp: {
    unit: '°C',
    kind: 'wheel',
    group: 'tyres',
    display: [40, 130],
    glyph: 'tyreColour',
    show: degC,
    order: 1,
  },
  tireTempInner: {
    unit: '°C',
    kind: 'wheel',
    group: 'tyres',
    display: [40, 130],
    show: degC,
    order: 2,
  },
  tireTempMiddle: {
    unit: '°C',
    kind: 'wheel',
    group: 'tyres',
    display: [40, 130],
    show: degC,
    order: 3,
  },
  tireTempOuter: {
    unit: '°C',
    kind: 'wheel',
    group: 'tyres',
    display: [40, 130],
    show: degC,
    order: 4,
  },
  tirePressure: {
    unit: 'psi',
    kind: 'wheel',
    group: 'tyres',
    show: { digits: 1 },
    order: 5,
  },
  tireWear: {
    unit: '',
    kind: 'wheel',
    group: 'tyres',
    display: [0, 1],
    glyph: 'wearBand',
    show: pct,
    order: 6,
  },
  slipRatio: {
    unit: '',
    kind: 'wheel',
    group: 'tyres',
    display: [-1.5, 1.5],
    glyph: 'slipRing',
    show: { digits: 2 },
    order: 7,
  },
  slipAngle: {
    unit: '',
    kind: 'wheel',
    group: 'tyres',
    display: [-1.5, 1.5],
    glyph: 'slipRing',
    show: { digits: 2 },
    order: 8,
  },
  combinedSlip: {
    unit: '',
    kind: 'wheel',
    group: 'tyres',
    display: [0, 1.5],
    glyph: 'slipRing',
    show: { digits: 2 },
    order: 9,
  },
  slipIndex: {
    unit: '',
    kind: 'wheel',
    group: 'tyres',
    display: [0, 1],
    glyph: 'slipRing',
    show: { digits: 2 },
    order: 9.5,
  },
  camber: {
    unit: 'rad',
    kind: 'wheel',
    group: 'tyres',
    show: { scale: DEG, unit: '°', digits: 2 },
    order: 10,
  },

  // Brakes.
  brakeTemp: {
    unit: '°C',
    kind: 'wheel',
    group: 'brakes',
    display: [100, 900],
    glyph: 'brakeGlow',
    show: degC,
    order: 1,
  },
  padLife: {
    unit: '',
    kind: 'wheel',
    group: 'brakes',
    display: [0, 1],
    show: pct,
    order: 2,
  },
  discLife: {
    unit: '',
    kind: 'wheel',
    group: 'brakes',
    display: [0, 1],
    show: pct,
    order: 3,
  },

  // Suspension.
  suspension: {
    unit: '',
    kind: 'wheel',
    group: 'suspension',
    display: [0, 1],
    glyph: 'suspensionBar',
    show: pct,
    order: 1,
  },
  suspensionM: {
    unit: 'm',
    kind: 'wheel',
    group: 'suspension',
    show: { scale: 1000, unit: 'mm', digits: 0 },
    order: 2,
  },
  wheelLoad: {
    unit: 'N',
    kind: 'wheel',
    group: 'suspension',
    display: [0, 12000],
    glyph: 'loadBar',
    show: { digits: 0 },
    order: 3,
  },

  // Wheels and surface.
  wheelSpeed: {
    unit: 'rad/s',
    kind: 'wheel',
    group: 'wheels',
    show: { digits: 0 },
    order: 1,
  },
  wheelSurfaceSpeed: {
    unit: 'm/s',
    kind: 'wheel',
    group: 'wheels',
    show: { scale: 3.6, unit: 'km/h', digits: 0 },
    order: 1.2,
  },
  groundContact: {
    unit: '',
    kind: 'wheel',
    group: 'wheels',
    stepped: true,
    show: { digits: 0 },
    order: 1.5,
  },
  rumble: {
    unit: '',
    kind: 'wheel',
    group: 'wheels',
    stepped: true,
    show: { digits: 0 },
    order: 2,
  },
  surfaceRumble: {
    unit: '',
    kind: 'wheel',
    group: 'wheels',
    show: { digits: 2 },
    order: 3,
  },
  puddle: {
    unit: '',
    kind: 'wheel',
    group: 'wheels',
    show: { digits: 2 },
    order: 4,
  },
};

/** A table entry with its words: read in the current language each time they are shown. */
function worded(name: string, entry: Entry): ChannelInfo {
  const { short, ...info } = entry;
  Object.defineProperty(info, 'label', { enumerable: true, get: () => t(`race.channel.${name}.label`) });
  if (short) Object.defineProperty(info, 'short', { enumerable: true, get: () => t(`race.channel.${name}.short`) });
  return info as ChannelInfo;
}

export const CHANNELS: Record<string, ChannelInfo> = Object.fromEntries(
  Object.entries(TABLE).map(([name, entry]) => [name, worded(name, entry)]),
);

/** Channels that are the lap's frame rather than something to look at. */
const FRAME = new Set(['time', 'distance', 'x', 'y', 'z', 'delta']);

export function wheelChannel(name: string, wheel: Wheel): string {
  return `${name}.${wheel}`;
}

/** `tireTemp.FL` -> ['tireTemp', 'FL']; `speed` -> ['speed', null]. */
export function splitChannel(id: string): [string, Wheel | null] {
  const dot = id.lastIndexOf('.');
  if (dot > 0) {
    const w = id.slice(dot + 1);
    if ((WHEELS as readonly string[]).includes(w)) return [id.slice(0, dot), w as Wheel];
  }
  return [id, null];
}

/** `brakeLinePressure` -> 'Brake line pressure'. */
function humanise(name: string): string {
  const words = name
    .replace(/[_.]+/g, ' ')
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .trim();
  return words.charAt(0).toUpperCase() + words.slice(1).toLowerCase();
}

/**
 * What to show for a channel family: its entry in `CHANNELS`, or one made up
 * from its name for a channel no one has described yet - graphed and tabled,
 * never drawn on the car or the input panel, since nothing says how.
 */
export function channelInfo(family: string, perWheel = false): ChannelInfo {
  return (
    CHANNELS[family] ?? {
      label: humanise(family),
      unit: '',
      kind: perWheel ? 'wheel' : 'scalar',
      group: 'other',
      show: { digits: 2 },
    }
  );
}

/** The wheel-channel families a lap carries, e.g. `tireTemp`, `slipRatio`. */
export function wheelFamilies(channels: Iterable<string>): string[] {
  const out = new Set<string>();
  for (const name of channels) {
    const [family, wheel] = splitChannel(name);
    if (wheel) out.add(family);
  }
  return [...out];
}

/** Whether a channel steps rather than blends between samples. */
export function isStepped(id: string): boolean {
  const [family] = splitChannel(id);
  return CHANNELS[family]?.stepped === true;
}

/** One graphable channel: a scalar, or one wheel of a per-wheel family. */
export interface ChannelEntry {
  id: string;
  family: string;
  wheel: Wheel | null;
  info: ChannelInfo;
  /** What the graph and the table call it: `Tyre temperature FL`. */
  label: string;
}

function entryOrder(e: ChannelEntry): [number, number, string, number] {
  return [
    GROUPS.indexOf(e.info.group),
    e.info.order ?? 99,
    e.info.label,
    e.wheel ? WHEELS.indexOf(e.wheel) : -1,
  ];
}

/**
 * Every channel any of these channel sets has, in display order - the laps'
 * position and time left out, since they are the frame, not a reading.
 */
export function channelCatalog(sets: Iterable<Record<string, unknown>>): ChannelEntry[] {
  const seen = new Map<string, ChannelEntry>();
  for (const channels of sets) {
    for (const id of Object.keys(channels)) {
      if (seen.has(id) || FRAME.has(id)) continue;
      const [family, wheel] = splitChannel(id);
      const info = channelInfo(family, wheel !== null);
      seen.set(id, {
        id,
        family,
        wheel,
        info,
        label: wheel ? t('race.channel.wheelEntry', { channel: info.label, wheel: wheelName(wheel) }) : info.label,
      });
    }
  }
  return [...seen.values()].sort((a, b) => {
    const x = entryOrder(a);
    const y = entryOrder(b);
    for (let i = 0; i < x.length; i++) {
      if (x[i] < y[i]) return -1;
      if (x[i] > y[i]) return 1;
    }
    return 0;
  });
}

/** The units in the table, each a message that places the number: "{v} km/h". */
const UNITS: Record<string, string> = {
  '%': 'race.channel.unit.percent',
  '°': 'race.channel.unit.degree',
  '°/s': 'race.channel.unit.degreePerSecond',
  '°C': 'race.channel.unit.celsius',
  'km/h': 'race.channel.unit.kmh',
  g: 'race.channel.unit.g',
  kW: 'race.channel.unit.kilowatt',
  W: 'race.channel.unit.watt',
  mm: 'race.channel.unit.millimetre',
  m: 'race.channel.unit.metre',
  s: 'race.channel.unit.second',
  'm/s': 'race.channel.unit.metrePerSecond',
  'm/s²': 'race.channel.unit.metrePerSecondSquared',
  rad: 'race.channel.unit.radian',
  'rad/s': 'race.channel.unit.radianPerSecond',
  rpm: 'race.channel.unit.rpm',
  'N m': 'race.channel.unit.newtonMetre',
  N: 'race.channel.unit.newton',
  psi: 'race.channel.unit.psi',
};

/** A number already written out, with its unit as the language puts it: "123 km/h", "45%". */
export function withUnit(text: string, unit: string): string {
  if (!unit) return text;
  const key = UNITS[unit];
  return key ? t(key, { v: text }) : `${text} ${unit}`;
}

/** A value in the units a person reads it in. */
export function formatValue(info: ChannelInfo, value: number): string {
  if (!Number.isFinite(value)) return '–';
  const show = info.show ?? {};
  return withUnit(num(value * (show.scale ?? 1), show.digits ?? 2), show.unit ?? info.unit);
}
