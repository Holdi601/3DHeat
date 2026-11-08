/**
 * Recognition cues: what people look at to tell a type from its neighbours,
 * beside the silhouette's area match (an outline can match well and still
 * miss the one thing that names the vehicle, such as interleaved road wheels).
 *
 * Each entry covers one figure or a family of figures. A cue may carry a
 * check on the figure's spec that proves the feature is modelled; a cue known
 * to be missing (the kernel cannot draw it yet) is marked `modelled: false`
 * with a note, and is listed rather than failed by the test. A cue with
 * neither is a reminder still to be checked.
 *
 * Written from the real vehicles' published appearance; no game data.
 */

import type { GroundSpec } from '../ground';
import type { FixedWingSpec, HeliSpec } from '../air';
import type { NavalSpec } from '../naval';
import { SPEC_SETS } from './index';

export interface Cue<S = unknown> {
  cue: string;
  /** True when the spec models the cue. */
  check?(spec: S): boolean;
  /** Known not modelled yet. */
  modelled?: false;
  note?: string;
}

interface SpecOf {
  ground: GroundSpec;
  air: FixedWingSpec;
  heli: HeliSpec;
  naval: NavalSpec;
}

export type CueDomain = keyof SpecOf;

export interface CueEntry<D extends CueDomain = CueDomain> {
  domain: D;
  /** The figures the cues apply to (a family key covers several). */
  figures: string[];
  cues: Cue<SpecOf[D]>[];
}

/** A figure's spec as the catalogue builds it: the last spec set that names it wins. */
export function specOf<D extends CueDomain>(domain: D, name: string): SpecOf[D] | undefined {
  for (let i = SPEC_SETS.length - 1; i >= 0; i--) {
    const s = SPEC_SETS[i][domain]?.[name];
    if (s) return s as unknown as SpecOf[D];
  }
  return undefined;
}

const entry =
  <D extends CueDomain>(domain: D) =>
  (figures: string | string[], cues: Cue<SpecOf[D]>[]): CueEntry<D> => ({ domain, figures: typeof figures === 'string' ? [figures] : figures, cues });
const ground = entry('ground');
const air = entry('air');

// Ground checks.
const muzzle = (s: GroundSpec) => !!s.guns?.some((g) => g.muzzle);
const noMuzzle = (s: GroundSpec) => !s.guns?.some((g) => g.muzzle);
const wheels = (s: GroundSpec) => s.running?.wheels.length ?? s.roadWheels ?? 0;
const rollers = (s: GroundSpec) => s.running?.rollers?.length ?? 0;
const mainGun = (s: GroundSpec) => s.guns?.find((g) => g.mount === 'turret' && !g.turret) ?? s.guns?.[0];
const roofGun = (s: GroundSpec) => !!s.guns?.some((g) => g.mount === 'top');
const turretShape = (s: GroundSpec) => !!s.turret?.outline;
const hullShape = (s: GroundSpec) => !!s.hullOutline;
const lean = (min: number) => (s: GroundSpec) => (s.hullLean ?? 0.06) >= min;
/** A cast turret: drawn smooth from its outline, the casting's rounded walls (an outline `round` under 5). */
const castTurret = (s: GroundSpec) => typeof s.turret?.outline?.round === 'number' && s.turret.outline.round < 5;
/** An open-topped turret or compartment: its `well` cut into the outline. */
const openTurret = (s: GroundSpec) => !!s.turret?.well;
/** A short flat step in the hull's top line ahead of the deck: the 1943 IS-2's driver's plate over a short glacis. */
const glacisStep = (s: GroundSpec) => {
  const t = (s.hullOutline?.top ?? []).filter((p) => p[0] > 1.5);
  return t.some((p, i) => i > 0 && p[0] - t[i - 1][0] > 0.3 && Math.abs(p[1] - t[i - 1][1]) < 0.1);
};
const openPart = (s: GroundSpec) => !!s.turrets?.some((t) => !!t.well);
/** The highest point of the extra turrets and parts (cupolas, mounts) over the ground. */
const partTop = (s: GroundSpec) => Math.max(0, ...(s.turrets ?? []).map((t) => s.hullHeight + (t.up ?? 0) + Math.max(...(t.outline?.top ?? [[0, t.height]]).map((p) => p[1]))));

// German ground parts (cupolas, plates, mounts drawn as parts of the figure).
const partsOf = (s: GroundSpec) => s.turrets ?? [];
const interleave = (kind: 'full' | 'overlap') => (s: GroundSpec) => s.running?.interleave === kind;
/** A round cupola (a circle's plan) of a cupola's size: tall with vision slits, or low and cast. */
const cupolaOf = (lo: number, hi: number) => (s: GroundSpec) => partsOf(s).some((t) => t.outline?.plan.length === 5 && t.width >= 0.5 && t.width <= 0.8 && t.height >= lo && t.height < hi);
const drumCupola = cupolaOf(0.3, 0.5);
const lowCupola = cupolaOf(0.1, 0.3);
/** A part hung behind the hull's rear plate by more than `d`. */
const behindHull = (d: number) => (s: GroundSpec) => partsOf(s).some((t) => !!t.outline && Math.min(...t.outline.plan.map((p) => p[0])) < -s.length / 2 - d);
/** A thin plate on the turret's sides, `lo` to `hi` long, at least `out` from the centre line. */
const turretSidePlate = (lo: number, hi: number, out: number) => (s: GroundSpec) => partsOf(s).some((t) => t.width <= 0.2 && t.length >= lo && t.length <= hi && Math.abs(t.side ?? 0) >= out);
const saukopf = (s: GroundSpec) => [s.turret, ...partsOf(s)].some((t) => t?.outline?.round === 2.4);
const ballMg = (s: GroundSpec) => partsOf(s).some((t) => t.outline?.round === 2.4 && (t.side ?? 0) > 0.5);
const openWell = (s: GroundSpec) => !!s.openTop && !!s.well;
/** Skirt plates (Schuerzen) along both sides of the hull. */
const hullSkirts = (s: GroundSpec) => partsOf(s).filter((t) => t.width <= 0.06 && t.length > 3).length >= 2;
/** Skirt plates round the turret's sides. */
const turretSkirts = (s: GroundSpec) => partsOf(s).filter((t) => t.width <= 0.06 && t.length >= 1.5 && t.length <= 2.5 && (t.up ?? 0) >= 0).length >= 2;
/** A stowage bin on the turret's back. */
const turretBin = (s: GroundSpec) => partsOf(s).some((t) => (t.up ?? 0) >= 0 && !!t.outline && Math.min(...t.outline.plan.map((p) => p[0])) <= -1.5 && t.width >= 0.8);
const pz4Running = (s: GroundSpec) => wheels(s) === 8 && rollers(s) === 4;

const TIGER_I: Cue<GroundSpec>[] = [
  { cue: 'interleaved Schachtel road wheels, eight stations a side', check: (s) => interleave('full')(s) && wheels(s) === 8 },
  { cue: 'horseshoe turret wall, one curved plate round sides and rear', check: (s) => !!s.turret?.outline?.section && (s.turret?.outline?.plan.length ?? 0) >= 8 },
  { cue: 'long 88 mm with a double-baffle muzzle brake', check: muzzle },
  { cue: 'broad flat mantlet across the turret front', check: turretShape },
  { cue: 'slab-sided box hull, near-upright front plate, wide fenders', check: (s) => hullShape(s) && (s.hullLean ?? 0.06) < 0.2 },
];

const TIGER_II: Cue<GroundSpec>[] = [
  { cue: 'nine overlapping road wheels a side', check: (s) => wheels(s) >= 9 },
  { cue: 'overlapping (not triple) wheel rows', check: interleave('overlap') },
  { cue: 'small conical Saukopf mantlet', check: saukopf },
  { cue: 'very long 88 mm L/71 with a muzzle brake', check: (s) => muzzle(s) && (mainGun(s)?.length ?? 0) > 4.5 },
  { cue: 'Panther-style sloped glacis and sides', check: lean(0.3) },
  { cue: 'wide tracks seen from the front', check: (s) => (s.trackWidth ?? 0) >= 0.75 },
];

const PANTHER: Cue<GroundSpec>[] = [
  { cue: 'interleaved road wheels, eight stations a side', check: (s) => interleave('full')(s) && wheels(s) === 8 },
  { cue: 'steep sloped glacis and sloped upper sides', check: lean(0.4) },
  { cue: 'long slim 75 mm L/70', check: (s) => (mainGun(s)?.length ?? 0) > 3.5 },
  { cue: 'shaped turret and mantlet', check: turretShape },
];

const STUART: Cue<GroundSpec>[] = [
  { cue: 'four road wheels a side in two bogies, trailing idler on the ground', check: (s) => wheels(s) === 4 },
  { cue: 'small 37 mm in a narrow turret', check: (s) => (mainGun(s)?.calibre ?? 1) < 0.05 },
  { cue: 'machine gun on the turret roof', check: roofGun },
];

const PZ_IV: Cue<GroundSpec>[] = [
  { cue: 'eight small road wheels a side in leaf-spring pairs', check: (s) => wheels(s) === 8 },
  { cue: 'four return rollers', check: (s) => rollers(s) === 4 },
  { cue: 'boxy hull with the turret offset to the left', check: hullShape },
  { cue: 'two-piece hatch doors in the turret sides', check: turretSidePlate(0.5, 0.8, 0.85) },
];

const PZ_III: Cue<GroundSpec>[] = [
  { cue: 'six road wheels a side on torsion bars', check: (s) => wheels(s) === 6 },
  { cue: 'three return rollers', check: (s) => rollers(s) === 3 },
  { cue: 'centred box turret with side hatches and a cupola at the rear', check: turretShape },
];

const IS_2: Cue<GroundSpec>[] = [
  { cue: 'huge 122 mm with a double-baffle muzzle brake', check: (s) => muzzle(s) && (mainGun(s)?.calibre ?? 0) >= 0.11 },
  { cue: 'six road wheels, three return rollers', check: (s) => wheels(s) === 6 && rollers(s) === 3 },
  { cue: 'large rounded cast turret', check: castTurret },
  { cue: 'sloped hull sides above the tracks', check: lean(0.25) },
];

export const CUES: Record<string, CueEntry> = {
  'm-51': ground('m-51', [
    { cue: 'long 105 mm with a large muzzle brake', check: (s) => muzzle(s) && (mainGun(s)?.length ?? 0) > 4 },
    { cue: 'HVSS running gear: six paired road wheels a side', check: (s) => wheels(s) === 6 },
    { cue: 'T23 turret with a counterweight bustle', check: turretShape },
    { cue: 'commander vision cupola on the turret roof', check: (s) => partTop(s) > 2.75 },
    { cue: 'Sherman hull with a sloped glacis', check: hullShape },
  ]),
  'm3-lee': ground('m3-lee', [
    { cue: '75 mm in a sponson on the right side of the hull', check: (s) => (s.guns?.length ?? 0) >= 2 },
    { cue: 'small 37 mm turret on top with a machine-gun cupola', check: (s) => (s.turrets?.length ?? 0) >= 2 },
    { cue: 'very tall slab-sided hull', check: (s) => s.hullHeight >= 2.2 },
    { cue: 'three VVSS bogies a side, return roller on top of each', check: (s) => wheels(s) === 6 },
  ]),
  'm8-scott': ground('m8-scott', [
    { cue: 'open-topped turret', check: openTurret },
    { cue: 'short 75 mm howitzer in a big rounded mantlet', check: (s) => (mainGun(s)?.length ?? 9) < 1.5 },
    { cue: '.50 machine gun on a ring at the turret rear', check: roofGun },
    { cue: 'M5 Stuart hull: sloped glacis, four road wheels a side', check: (s) => wheels(s) === 4 },
  ]),
  stuart: ground(['m5a1-stuart', 'm3a3-stuart', 'm3a1-stuart', 'm3-stuart'], STUART),
  'm3-stuart': ground('m3-stuart', [
    { cue: 'drum cupola on the turret roof (the M3A1 has none)', check: (s) => partTop(s) > 2.45 },
    { cue: 'upright riveted box hull, sponsons over the tracks', check: hullShape },
  ]),
  'm5a1-stuart': ground(['m5a1-stuart', 'm3a3-stuart'], [
    { cue: 'sloped glacis and sloped upper sides', check: hullShape },
    { cue: 'turret with a rear radio bustle', check: turretShape },
  ]),
  'm3a1-stuart': ground('m3a1-stuart', [
    { cue: 'upright riveted or welded box hull', check: hullShape },
    { cue: 'round-sided turret without a cupola', check: (s) => turretShape(s) && !s.cupola },
  ]),
  'tiger-i': ground(['tiger-i-e', 'tiger-i-h1'], TIGER_I),
  'tiger-i-h1': ground('tiger-i-h1', [
    { cue: 'tall drum cupola with vision slits (early)', check: drumCupola },
    { cue: 'Feifel air filters on the rear plate (early)', check: behindHull(0.25) },
    { cue: 'smoke dischargers either side of the turret front', check: turretSidePlate(0.3, 0.5, 1.1) },
  ]),
  'tiger-i-e': ground('tiger-i-e', [
    { cue: 'low cast cupola with periscopes (late)', check: lowCupola },
    { cue: 'spare track links hung on the turret sides', check: turretSidePlate(1.0, 1.5, 1.1) },
  ]),
  'tiger-ii': ground(['tiger-ii-h', 'tiger-ii-p'], TIGER_II),
  'tiger-ii-h': ground('tiger-ii-h', [{ cue: 'Henschel turret: flat sloped front plate, long flat sides', check: (s) => turretShape(s) && (s.turret?.slope ?? 0) > 0 }]),
  'tiger-ii-p': ground('tiger-ii-p', [
    { cue: 'Porsche turret: rounded front, curved left wall with the cupola bulge', check: (s) => typeof s.turret?.outline?.round === 'number' && s.turret.outline.round < 5 && partsOf(s).some((t) => (t.side ?? 0) < -0.8 && t.width >= 0.75) },
  ]),
  'm18-hellcat': ground('m18-hellcat', [
    { cue: 'open-topped turret', check: openTurret },
    { cue: '76 mm with a muzzle brake', check: muzzle },
    { cue: 'five road wheels a side, four return rollers', check: (s) => wheels(s) === 5 && rollers(s) === 4 },
    { cue: '.50 machine gun on the turret ring', check: roofGun },
    { cue: 'low, sloped hull', check: hullShape },
  ]),
  'm22-locust': ground('m22-locust', [
    { cue: 'tiny airborne tank, under four metres long', check: (s) => s.length < 4.2 },
    { cue: 'four road wheels a side in two bogies', check: (s) => wheels(s) === 4 },
    { cue: 'small cast turret with a 37 mm', check: (s) => (mainGun(s)?.calibre ?? 1) < 0.05 },
  ]),
  't-50': ground('t-50', [
    { cue: 'sloped armour all round', check: lean(0.3) },
    { cue: 'six small road wheels a side on torsion bars, three return rollers', check: (s) => wheels(s) === 6 && rollers(s) === 3 },
    { cue: 'small faceted turret with a cupola', check: turretShape },
    { cue: 'short 45 mm', check: (s) => (mainGun(s)?.calibre ?? 1) < 0.06 },
  ]),
  m41: ground('m41', [
    { cue: '76 mm with a muzzle brake and a bore evacuator', check: (s) => muzzle(s) && !!mainGun(s)?.extractor },
    { cue: 'five road wheels a side, three return rollers', check: (s) => wheels(s) === 5 && rollers(s) === 3 },
    { cue: 'wide angular turret with a long bustle', check: turretShape },
    { cue: 'commander cupola', check: (s) => !!s.cupola },
  ]),
  '61-k-37mm': ground('61-k-37mm', [
    { cue: 'four-wheeled carriage, two axles', check: (s) => s.chassis === 'towed' && s.axles === 2 },
    { cue: 'long thin barrel with a flash hider', check: (s) => (mainGun(s)?.length ?? 0) > 2 },
    { cue: 'small gun shield', check: (s) => (s.turrets?.length ?? 0) >= 2 },
    { cue: 'outriggers folded out to the sides', check: (s) => s.chassis === 'towed' && (s.axles ?? 1) >= 2 },
  ]),
  't-34-85': ground('t-34-85', [
    { cue: 'five large Christie road wheels a side, no return rollers', check: (s) => wheels(s) === 5 && rollers(s) === 0 },
    { cue: 'steep sloped glacis and sides', check: lean(0.5) },
    { cue: 'large three-man cast turret', check: castTurret },
    { cue: '85 mm without a muzzle brake', check: (s) => noMuzzle(s) && (mainGun(s)?.length ?? 0) > 3 },
  ]),
  'amd-35': ground('amd-35', [
    { cue: 'four-wheeled armoured car', check: (s) => s.chassis === 'wheeled' && s.axles === 2 },
    { cue: 'faceted sloped hull, driving positions at both ends', check: hullShape },
    { cue: 'small turret with a 25 or 47 mm', check: turretShape },
  ]),
  'bt-7': ground('bt-7', [
    { cue: 'four large Christie road wheels a side, no return rollers', check: (s) => wheels(s) === 4 && rollers(s) === 0 },
    { cue: 'pointed nose', check: hullShape },
    { cue: 'cylindrical or conical turret with a 45 mm', check: (s) => turretShape(s) && (mainGun(s)?.calibre ?? 1) < 0.06 },
  ]),
  'pz-iv': ground(['pz-iv-f1', 'pz-iv-f2'], PZ_IV),
  'pz-iv-f1': ground('pz-iv-f1', [{ cue: 'short stub 75 mm L/24, no muzzle brake', check: (s) => noMuzzle(s) && (mainGun(s)?.length ?? 9) < 2 }]),
  'pz-iv-f2': ground('pz-iv-f2', [
    { cue: 'long 75 mm L/43 with a ball muzzle brake', check: (s) => muzzle(s) && (mainGun(s)?.length ?? 0) > 2 },
    { cue: 'external mantlet round the long gun', check: (s) => partsOf(s).some((t) => t.length >= 0.3 && t.width >= 0.7 && t.width <= 0.9 && t.height <= 0.4) },
  ]),
  'm4a3-105': ground('m4a3-105', [
    { cue: 'short 105 mm howitzer', check: (s) => (mainGun(s)?.length ?? 9) < 2.5 && (mainGun(s)?.calibre ?? 0) >= 0.1 },
    { cue: 'thick rounded howitzer mantlet', check: (s) => !!s.turrets?.some((t) => typeof t.outline?.round === 'number' && t.outline.round < 3) },
    { cue: 'Sherman hull, six road wheels a side', check: (s) => hullShape(s) && wheels(s) === 6 },
  ]),
  'm16-mgmc': ground('m16-mgmc', [
    { cue: 'half-track: wheels at the front, tracks at the rear', check: (s) => s.chassis === 'halftrack' },
    { cue: 'quad .50 Maxson mount', check: (s) => !!s.guns?.some((g) => g.mount === 'turret-side' && (g.count ?? 1) >= 2) },
    { cue: 'open armoured body', check: (s) => !!s.openTop },
    { cue: 'front roller or winch on the bumper', check: (s) => !!s.turrets?.some((t) => Math.min(...(t.outline?.plan ?? [[0, 0]]).map((p) => p[0])) > s.length / 2 - 0.5) },
  ]),
  'f-86k': air('f-86k', [
    { cue: 'radome over the chin intake (Sabre Dog nose)', modelled: false, note: 'nose drawn plain' },
    { cue: 'swept wing', check: (s) => !!s.wingPlan || (s.wing?.sweep ?? 0) >= 25 },
    { cue: 'bubble canopy', check: (s) => s.canopy?.kind === 'bubble' },
    { cue: 'single jet, nozzle under the tail', check: (s) => s.engines?.count === 1 },
  ]),
  'eurofighter-typhoon': air('eurofighter-typhoon', [
    { cue: 'canards ahead of the wing', check: (s) => !!s.canard },
    { cue: 'cranked delta wing, no tailplane', check: (s) => (s.wing?.sweep ?? 0) >= 45 && !s.tail?.tailSpan },
    { cue: 'single fin', check: (s) => s.tail?.kind === 'single' },
    { cue: 'twin engines side by side', check: (s) => s.engines?.count === 2 },
    { cue: 'smiling chin intake', modelled: false, note: 'intake not drawn separately' },
  ]),
  'flak-36-88mm': ground('flak-36-88mm', [
    { cue: 'cruciform platform with four outriggers', check: (s) => s.chassis === 'pedestal' && !s.bare },
    { cue: 'tall gun shield', check: (s) => partsOf(s).some((t) => t.width >= 2 && t.length <= 0.1) },
    { cue: 'very long 88 mm barrel', check: (s) => (mainGun(s)?.length ?? 0) > 4.5 },
    { cue: 'gun on a central pedestal', check: (s) => s.chassis === 'pedestal' },
  ]),
  'hunter-f1': air('hunter-f1', [
    { cue: 'intakes in the wing roots', modelled: false, note: 'intakes not drawn' },
    { cue: 'swept mid wing', check: (s) => !!s.wingPlan || (s.wing?.sweep ?? 0) >= 30 },
    { cue: 'tailplane set up the fin', check: (s) => (s.tail?.planeUp ?? 0) > 0.5 },
    { cue: 'single jet, bubble canopy', check: (s) => s.engines?.count === 1 && s.canopy?.kind === 'bubble' },
  ]),
  'crusader-ii': ground('crusader-ii', [
    { cue: 'five large Christie road wheels a side', check: (s) => wheels(s) === 5 },
    { cue: 'long low hull', check: (s) => s.length / s.hullHeight > 3 },
    { cue: 'many-sided turret with a 2-pounder', check: (s) => turretShape(s) && (mainGun(s)?.calibre ?? 1) < 0.05 },
  ]),
  jagdpanther: ground('jagdpanther', [
    { cue: 'no turret: one sloped casemate with the hull', check: (s) => !!s.turret?.fixed || s.turret?.shape === 'casemate' || hullShape(s) },
    { cue: '88 mm L/71 with a muzzle brake in a ball mantlet', check: (s) => muzzle(s) && (mainGun(s)?.length ?? 0) > 4.5 },
    { cue: 'interleaved road wheels, eight stations a side', check: (s) => interleave('full')(s) && wheels(s) === 8 },
    { cue: 'steep sloped sides and front', check: lean(0.4) },
    { cue: 'gun low in a Saukopf mantlet in the glacis', check: saukopf },
  ]),
  't-28': ground('t-28', [
    { cue: 'three turrets: main 76 mm and two front machine-gun turrets', check: (s) => (s.turrets?.length ?? 0) >= 2 },
    { cue: 'long hull', check: (s) => s.length > 7 },
    { cue: 'armoured skirts over the small road wheels', check: (s) => s.chassis === 'tracked' && !s.running },
  ]),
  'su-30mki': air('su-30mki', [
    { cue: 'canards', check: (s) => !!s.canard },
    { cue: 'twin fins', check: (s) => s.tail?.kind === 'twin' },
    { cue: 'widely spaced engine nacelles, thrust-vectoring nozzles', check: (s) => s.engines?.count === 2 },
    { cue: 'tandem two-seat canopy', check: (s) => s.canopy?.kind === 'tandem' },
    { cue: 'tail sting between the nozzles', modelled: false, note: 'spec has no sting' },
  ]),
  panther: ground(['panther-d', 'panther-a', 'panther-g', 'panther-f'], PANTHER),
  'panther-a': ground(['panther-d', 'panther-a', 'panther-g'], [
    { cue: 'double-baffle muzzle brake', check: muzzle },
    { cue: 'rounded cast mantlet', check: (s) => partsOf(s).some((t) => t.outline?.round === 3 && t.width >= 0.9) },
  ]),
  'panther-d': ground('panther-d', [
    { cue: 'tall drum cupola (early)', check: drumCupola },
    { cue: 'smoke dischargers on the turret sides', check: turretSidePlate(0.3, 0.5, 1.1) },
    { cue: 'no ball machine gun in the glacis (letterbox flap)', check: (s) => !ballMg(s) },
  ]),
  'panther-a2': ground(['panther-a', 'panther-g'], [
    { cue: 'low cast cupola with periscopes', check: lowCupola },
    { cue: 'ball machine gun in the glacis', check: ballMg },
  ]),
  'panther-g': ground('panther-g', [{ cue: 'upper side one straight plate, less steeply sloped', check: (s) => (s.hullLean ?? 1) < 0.5 }]),
  'panther-f': ground('panther-f', [
    { cue: 'narrow Schmalturm turret with rangefinder ears', check: (s) => turretShape(s) && partsOf(s).some((t) => t.outline?.plan.length === 3 && Math.abs(t.side ?? 0) > 0.9) },
    { cue: 'small conical Saukopf mantlet, the L/70 without a muzzle brake', check: (s) => saukopf(s) && noMuzzle(s) },
  ]),
  'is-2': ground(['is-2', 'is-2-1943'], IS_2),
  'is-2-1943': ground('is-2-1943', [{ cue: 'stepped cast nose (the 1944 has a straight glacis)', check: glacisStep }]),
  'is-2-1944': ground('is-2', [{ cue: 'straight one-piece glacis (the 1943 has a stepped nose)', check: (s) => hullShape(s) && !glacisStep(s) }]),
  'marder-iii': ground('marder-iii', [
    { cue: 'open-topped fighting compartment', check: openWell },
    { cue: '75 mm PaK 40 with a muzzle brake', check: muzzle },
    { cue: 'Pz 38(t) running gear: four large road wheels a side', check: (s) => wheels(s) === 4 },
  ]),
  'pz-iii': ground(['pz-iii-e', 'pz-iii-h', 'pz-iii-l'], PZ_III),
  'pz-iii-e': ground('pz-iii-e', [{ cue: '37 mm in the internal twin mantlet', check: (s) => (mainGun(s)?.calibre ?? 1) < 0.04 }]),
  'pz-iii-h': ground('pz-iii-h', [{ cue: 'short 50 mm L/42', check: (s) => (mainGun(s)?.length ?? 9) < 2.5 }]),
  'pz-iii-l': ground('pz-iii-l', [
    { cue: 'long 50 mm L/60', check: (s) => (mainGun(s)?.length ?? 0) > 2.5 },
    { cue: 'spaced armour plate over the mantlet', check: (s) => partsOf(s).some((t) => t.length <= 0.1 && t.width >= 0.9 && t.width <= 1.1) },
  ]),
  ostwind: ground('ostwind', [
    { cue: 'six-sided open-topped turret', check: (s) => !!s.turret?.well },
    { cue: 'single 37 mm Flak 43', check: (s) => (mainGun(s)?.calibre ?? 1) < 0.05 },
    { cue: 'Pz IV running gear: eight road wheels, four return rollers', check: (s) => wheels(s) === 8 && rollers(s) === 4 },
  ]),
  'pz-38t': ground('pz-38t', [
    { cue: 'four large road wheels a side in leaf-spring pairs', check: (s) => wheels(s) === 4 },
    { cue: 'riveted box hull', check: hullShape },
    { cue: 'small turret with a 37 mm', check: (s) => (mainGun(s)?.calibre ?? 1) < 0.05 },
    { cue: 'two return rollers', check: (s) => rollers(s) === 2 },
  ]),
  wirbelwind: ground('wirbelwind', [
    { cue: 'nine-sided open-topped turret', check: (s) => !!s.turret?.well },
    { cue: 'quadruple 20 mm Flakvierling', check: (s) => (mainGun(s)?.count ?? 1) === 4 },
    { cue: 'Pz IV running gear: eight road wheels, four return rollers', check: (s) => wheels(s) === 8 && rollers(s) === 4 },
  ]),
  'hummel-nashorn': ground(['hummel', 'nashorn'], [
    { cue: 'tall open-topped compartment at the back', check: (s) => openWell(s) && (s.well?.rear ?? 0) < -2 },
    { cue: 'driver in his own small box at the front left', check: (s) => partsOf(s).some((t) => (t.side ?? 0) < -0.4 && t.length <= 0.7) },
    { cue: 'Pz IV running gear: eight road wheels, four return rollers', check: (s) => wheels(s) === 8 && rollers(s) === 4 },
  ]),
  hummel: ground('hummel', [{ cue: 'short thick 150 mm howitzer, no muzzle brake', check: (s) => noMuzzle(s) && (mainGun(s)?.calibre ?? 0) >= 0.15 }]),
  nashorn: ground('nashorn', [{ cue: 'very long 88 mm PaK 43 with a muzzle brake', check: (s) => muzzle(s) && (mainGun(s)?.length ?? 0) > 4 }]),
  wespe: ground('wespe', [
    { cue: 'open-topped compartment at the back', check: (s) => openWell(s) && (s.well?.rear ?? 0) < -2 },
    { cue: '105 mm howitzer with a muzzle brake', check: (s) => muzzle(s) && (mainGun(s)?.calibre ?? 0) >= 0.1 },
    { cue: 'Pz II running gear: five road wheels, four return rollers', check: (s) => wheels(s) === 5 && rollers(s) === 4 },
  ]),
  'sdkfz-251': ground(['sdkfz-251', 'sdkfz-251-9', 'sdkfz-251-21'], [
    { cue: 'half-track: wheels at the front, tracks at the rear', check: (s) => s.chassis === 'halftrack' },
    { cue: 'interleaved road wheels (Schachtellaufwerk)', check: interleave('full') },
    { cue: 'open troop compartment', check: openWell },
    { cue: 'faceted armoured body, pointed sloped bonnet', check: hullShape },
    { cue: 'front wheels on their own track, inside the body', check: (s) => (s.halftrack?.axleTrack ?? 9) < s.width },
  ]),
  'sdkfz-251-9': ground('sdkfz-251-9', [{ cue: 'short 75 mm L/24 behind a small shield', check: (s) => (mainGun(s)?.calibre ?? 0) >= 0.075 && (mainGun(s)?.length ?? 9) < 2 }]),
  'sdkfz-251-21': ground('sdkfz-251-21', [{ cue: 'three MG 151 side by side (Drilling)', check: (s) => (mainGun(s)?.count ?? 1) === 3 }]),
  'sdkfz-6-2': ground('sdkfz-6-2', [
    { cue: 'half-track: wheels at the front, tracks at the rear', check: (s) => s.chassis === 'halftrack' },
    { cue: 'interleaved road wheels', check: interleave('full') },
    { cue: '37 mm Flak on the flat platform behind the cab', check: (s) => (mainGun(s)?.calibre ?? 1) < 0.04 },
  ]),
  'pz-iv-g': ground('pz-iv-g', [
    { cue: 'stowage bin on the turret back', check: turretBin },
    { cue: 'long 75 mm L/43 with a double-baffle muzzle brake', check: (s) => muzzle(s) && (mainGun(s)?.length ?? 0) > 2 },
    { cue: 'eight road wheels in leaf-spring pairs, four return rollers', check: pz4Running },
    { cue: 'no skirts', check: (s) => !hullSkirts(s) },
  ]),
  'pz-iv-h': ground(['pz-iv-h', 'pz-iv-j'], [
    { cue: 'skirts along the hull and round the turret', check: (s) => hullSkirts(s) && turretSkirts(s) },
    { cue: 'long 75 mm L/48 with a double-baffle muzzle brake', check: (s) => muzzle(s) && (mainGun(s)?.length ?? 0) > 2.6 },
    { cue: 'eight road wheels in leaf-spring pairs', check: (s) => wheels(s) === 8 },
  ]),
  'pz-iv-h4': ground('pz-iv-h', [{ cue: 'four return rollers, the big muffler across the back', check: (s) => rollers(s) === 4 && behindHull(0.2)(s) }]),
  'pz-iv-j': ground('pz-iv-j', [{ cue: 'three return rollers, two upright exhausts at the back (late)', check: (s) => rollers(s) === 3 && behindHull(0.1)(s) }]),
  'stug-iii': ground(['stug-iii-d', 'stug-iii-f', 'stug-iii-g'], [
    { cue: 'no turret: a low casemate, the gun just right of the centre', check: (s) => !!s.turret?.fixed },
    { cue: 'Pz III running gear: six road wheels, three return rollers', check: (s) => wheels(s) === 6 && rollers(s) === 3 },
  ]),
  'stug-iii-d': ground('stug-iii-d', [
    { cue: 'short 75 mm L/24, no muzzle brake', check: (s) => noMuzzle(s) && (mainGun(s)?.length ?? 9) < 1.5 },
    { cue: 'no cupola', check: (s) => !lowCupola(s) && !drumCupola(s) },
  ]),
  'stug-iii-f': ground('stug-iii-f', [{ cue: 'long 75 mm L/43 with a muzzle brake in a box mantlet', check: (s) => muzzle(s) && !saukopf(s) }]),
  'stug-iii-g': ground('stug-iii-g', [
    { cue: "commander's cupola at the casemate's back left", check: lowCupola },
    { cue: 'cast Saukopf mantlet (late)', check: saukopf },
    { cue: 'skirts over the running gear', check: hullSkirts },
  ]),
  'jagdpanzer-iv': ground(['jagdpanzer-iv', 'jagdpanzer-iv-l70'], [
    { cue: 'low casemate, the glacis meeting the nose in a sharp edge', check: hullShape },
    { cue: 'gun left of the centre', check: (s) => (s.turret?.side ?? 0) < 0 },
    { cue: 'Pz IV running gear: eight road wheels, four return rollers', check: pz4Running },
    { cue: 'skirts over the running gear', check: hullSkirts },
  ]),
  'jagdpanzer-iv-l48': ground('jagdpanzer-iv', [{ cue: '75 mm L/48 with a muzzle brake', check: muzzle }]),
  'jagdpanzer-iv-l70': ground('jagdpanzer-iv-l70', [{ cue: 'very long 75 mm L/70 without a muzzle brake, overhanging the nose', check: (s) => noMuzzle(s) && (mainGun(s)?.length ?? 0) > 3.5 }]),
  kugelblitz: ground('kugelblitz', [
    { cue: 'ball turret set into the deck', check: (s) => typeof s.turret?.outline?.round === 'number' && s.turret.outline.round <= 2 },
    { cue: 'twin 30 mm MK 103', check: (s) => (mainGun(s)?.count ?? 1) === 2 && (mainGun(s)?.calibre ?? 0) >= 0.03 },
    { cue: 'Pz IV running gear: eight road wheels, four return rollers', check: pz4Running },
  ]),
  'pz-ii': ground('pz-ii', [
    { cue: 'five road wheels on leaf springs, four return rollers', check: (s) => wheels(s) === 5 && rollers(s) === 4 },
    { cue: 'small turret offset to the left with the 20 mm', check: (s) => (s.turret?.side ?? 0) < 0 && (mainGun(s)?.calibre ?? 1) <= 0.02 },
    { cue: 'low box hull with a short sloped nose', check: (s) => hullShape(s) && s.hullHeight < 1.6 },
  ]),
  'sturmpanzer-ii': ground('sturmpanzer-ii', [
    { cue: 'six road wheels on the lengthened Pz II hull, four return rollers', check: (s) => wheels(s) === 6 && rollers(s) === 4 },
    { cue: 'low compartment with the tall shield across its front', check: turretShape },
    { cue: 'short thick 150 mm sIG 33', check: (s) => (mainGun(s)?.calibre ?? 0) >= 0.15 && (mainGun(s)?.length ?? 9) < 2 },
  ]),
  hetzer: ground('hetzer', [
    { cue: 'low hull sloped on every side', check: (s) => hullShape(s) && s.hullHeight < 2 },
    { cue: 'gun right of the centre in a Saukopf in the glacis', check: (s) => saukopf(s) && (s.turret?.side ?? 0) > 0 },
    { cue: 'four large road wheels a side', check: (s) => wheels(s) === 4 },
  ]),
  ferdinand: ground(['ferdinand', 'elefant'], [
    { cue: 'six road wheels in three Porsche bogies', check: (s) => wheels(s) === 6 },
    { cue: 'tall box casemate at the back', check: (s) => hullShape(s) && (s.hullOutline?.top ?? []).some((p) => p[0] < 0 && p[1] > 2.5) },
    { cue: 'long 88 mm L/71 from the casemate front', check: (s) => (mainGun(s)?.length ?? 0) > 4 },
  ]),
  elefant: ground('elefant', [
    { cue: "commander's cupola on the casemate roof and a ball machine gun in the hull front (1944)", check: (s) => lowCupola(s) && partsOf(s).some((t) => t.outline?.round === 2.4 && (t.side ?? 0) > 0.3) },
  ]),
  jagdtiger: ground('jagdtiger', [
    { cue: 'huge box casemate on the Tiger II hull', check: (s) => !!s.turret && hullShape(s) },
    { cue: '128 mm without a muzzle brake', check: (s) => noMuzzle(s) && (mainGun(s)?.calibre ?? 0) >= 0.12 },
    { cue: 'nine overlapping road wheels a side', check: (s) => wheels(s) === 9 && interleave('overlap')(s) },
  ]),
  sturmtiger: ground('sturmtiger', [
    { cue: 'stubby 380 mm rocket mortar', check: (s) => (mainGun(s)?.calibre ?? 0) >= 0.3 },
    { cue: 'box casemate at the front of the Tiger I hull', check: hullShape },
    { cue: 'Tiger I interleaved road wheels', check: interleave('full') },
    { cue: 'loading crane on the casemate', check: (s) => partsOf(s).some((t) => t.width <= 0.15 && t.height >= 0.4 && Math.abs(t.side ?? 0) > 1) },
  ]),
  'sdkfz-234-puma': ground('sdkfz-234-puma', [
    { cue: 'eight wheels under a long double-ended hull', check: (s) => s.chassis === 'wheeled' && s.axles === 4 },
    { cue: 'oval turret with a 50 mm in a Saukopf mantlet', check: (s) => saukopf(s) && muzzle(s) },
    { cue: 'faceted hull sloped fore and aft', check: hullShape },
  ]),
  'sdkfz-222': ground('sdkfz-222', [
    { cue: 'four-wheeled armoured car', check: (s) => s.chassis === 'wheeled' && s.axles === 2 },
    { cue: 'faceted hull, sides undercut below the waist', check: hullShape },
    { cue: 'small open ten-sided turret with a wire grid over it', check: (s) => turretShape(s) && partsOf(s).length > 0 },
    { cue: '20 mm KwK 30', check: (s) => (mainGun(s)?.calibre ?? 1) <= 0.02 },
  ]),
  'pz-iii-m': ground(['pz-iii-m', 'pz-iii-n'], [
    { cue: 'six road wheels a side on torsion bars, three return rollers', check: (s) => wheels(s) === 6 && rollers(s) === 3 },
    { cue: 'skirts along the hull and round the turret', check: (s) => hullSkirts(s) && turretSkirts(s) },
  ]),
  'pz-iii-m2': ground('pz-iii-m', [{ cue: 'long 50 mm L/60 with the spaced plate before the mantlet', check: (s) => (mainGun(s)?.length ?? 0) > 2.5 }]),
  'pz-iii-n': ground('pz-iii-n', [{ cue: 'short stub 75 mm L/24', check: (s) => (mainGun(s)?.calibre ?? 0) >= 0.075 && (mainGun(s)?.length ?? 9) < 1.5 }]),
  'pz-sfl-ic': ground('pz-sfl-ic', [
    { cue: 'five big overlapping road wheels a side, no return rollers', check: (s) => wheels(s) === 5 && rollers(s) === 0 && interleave('overlap')(s) },
    { cue: 'open-topped turret', check: (s) => !!s.turret?.well },
    { cue: 'long 50 mm with a muzzle brake', check: (s) => muzzle(s) && (mainGun(s)?.calibre ?? 0) >= 0.05 },
  ]),
  'sdkfz-140-1': ground('sdkfz-140-1', [
    { cue: 'Pz 38(t) running gear: four large road wheels a side', check: (s) => wheels(s) === 4 },
    { cue: 'open ten-sided turret with a 20 mm', check: (s) => !!s.turret?.well && (mainGun(s)?.calibre ?? 1) <= 0.02 },
    { cue: 'riveted box hull', check: hullShape },
  ]),
  'flakpanzer-38t': ground('flakpanzer-38t', [
    { cue: 'open armoured box on the rear of the hull', check: (s) => partsOf(s).some((t) => !!t.well) },
    { cue: 'single 20 mm Flak 38 behind a shield', check: (s) => (mainGun(s)?.calibre ?? 1) <= 0.02 },
    { cue: 'Pz 38(t) running gear: four large road wheels a side', check: (s) => wheels(s) === 4 },
  ]),
  'sdkfz-9-flak37': ground('sdkfz-9-flak37', [
    { cue: 'long heavy half-track: wheels at the front, tracks at the rear', check: (s) => s.chassis === 'halftrack' && s.length > 8 },
    { cue: 'interleaved road wheels', check: interleave('full') },
    { cue: '88 mm on the platform behind the cab', check: (s) => (mainGun(s)?.calibre ?? 0) >= 0.088 && (mainGun(s)?.length ?? 0) > 4 },
  ]),
  'tiger-p': ground('tiger-p', [
    { cue: 'Porsche running gear: three two-wheel bogies a side', check: (s) => wheels(s) === 6 },
    { cue: 'Tiger I turret with the horseshoe wall', check: (s) => !!s.turret?.outline?.section },
    { cue: '88 mm with a double-baffle muzzle brake', check: muzzle },
  ]),
  coelian: ground('coelian', [
    { cue: 'Panther hull and interleaved running gear', check: (s) => interleave('full')(s) && wheels(s) === 8 },
    { cue: 'broad sloped flak turret with twin 37 mm', check: (s) => turretShape(s) && (mainGun(s)?.count ?? 1) === 2 },
    { cue: 'steep sloped glacis and sloped upper sides', check: lean(0.4) },
  ]),
  'm36-jackson': ground('m36-jackson', [
    { cue: 'open-topped round turret with a long bustle', check: (s) => openTurret(s) && (s.turret?.length ?? 0) > 2.5 },
    { cue: '90 mm with a double-baffle muzzle brake', check: (s) => muzzle(s) && (mainGun(s)?.calibre ?? 0) >= 0.09 },
    { cue: 'M10 hull: sloped upper sides, three VVSS bogies a side', check: (s) => hullShape(s) && wheels(s) === 6 },
  ]),
  'm10-gmc': ground('m10-gmc', [
    { cue: 'open-topped five-sided turret', check: openTurret },
    { cue: 'counterweights hung on the turret back', check: (s) => (s.turrets?.length ?? 0) >= 2 },
    { cue: '3-inch gun without a muzzle brake', check: (s) => noMuzzle(s) && (mainGun(s)?.calibre ?? 0) >= 0.076 },
  ]),
  'm26-pershing': ground('m26-pershing', [
    { cue: 'six road wheels, five return rollers', check: (s) => wheels(s) === 6 && rollers(s) === 5 },
    { cue: 'long 90 mm with a muzzle brake', check: (s) => muzzle(s) && (mainGun(s)?.calibre ?? 0) >= 0.09 },
    { cue: 'big cast turret', check: castTurret },
    { cue: 'long flat hull with a sloped glacis', check: (s) => hullShape(s) && s.length / s.width > 1.7 },
  ]),
  t29: ground('t29', [
    { cue: 'very long 105 mm without a muzzle brake', check: (s) => noMuzzle(s) && (mainGun(s)?.length ?? 0) > 5 },
    { cue: 'rangefinder ears on the turret sides', check: (s) => !!s.turrets?.some((t) => Math.abs(t.side ?? 0) > 1.3) },
    { cue: 'huge cast turret', check: castTurret },
    { cue: 'eight road wheels a side', check: (s) => wheels(s) === 8 },
  ]),
  t20: ground('t20', [
    { cue: 'paired road wheels in three bogies', check: (s) => wheels(s) === 6 },
    { cue: 'low hull, wider than a Sherman', check: (s) => s.width >= 3 && s.hullHeight < 1.7 },
    { cue: 'cast turret with a 76 mm, no muzzle brake', check: (s) => castTurret(s) && noMuzzle(s) },
  ]),
  'zis-30': ground('zis-30', [
    { cue: 'tiny tracked tractor', check: (s) => s.length < 3.6 },
    { cue: 'long 57 mm on an open mount at the back', check: (s) => (mainGun(s)?.calibre ?? 0) >= 0.057 && (mainGun(s)?.length ?? 0) > 3 },
    { cue: 'tall flat gun shield', check: (s) => partTop(s) > 2.0 },
    { cue: 'four road wheels a side in two bogies', check: (s) => wheels(s) === 4 },
  ]),
  'su-76m': ground('su-76m', [
    { cue: 'open-topped fighting compartment at the rear', check: openPart },
    { cue: '76 mm ZiS-3 with a muzzle brake', check: muzzle },
    { cue: 'six road wheels, three return rollers', check: (s) => wheels(s) === 6 && rollers(s) === 3 },
    { cue: 'low sloped front hull', check: hullShape },
  ]),
  'm4-sherman': ground('m4-sherman', [
    { cue: 'three VVSS bogies a side, a return roller on top of each', check: (s) => wheels(s) === 6 },
    { cue: 'short 75 mm without a muzzle brake', check: (s) => noMuzzle(s) && (mainGun(s)?.length ?? 9) < 2.6 },
    { cue: 'tall hull with a sloped glacis', check: hullShape },
    { cue: 'small rounded cast turret', check: castTurret },
  ]),
  m4a3e8: ground('m4a3e8', [
    { cue: 'HVSS: paired road wheels, the return rollers apart', check: (s) => wheels(s) === 6 && rollers(s) === 3 },
    { cue: '76 mm with a muzzle brake', check: muzzle },
    { cue: 'T23 cast turret with its bustle', check: castTurret },
    { cue: 'commander vision cupola on the turret roof', check: (s) => partTop(s) > 2.75 },
  ]),
  'crusader-iii': ground('crusader-iii', [
    { cue: 'five large Christie road wheels a side', check: (s) => wheels(s) === 5 },
    { cue: 'long low hull', check: (s) => s.length / s.hullHeight > 3 },
    { cue: 'many-sided turret with the 6-pounder', check: (s) => turretShape(s) && (mainGun(s)?.calibre ?? 0) >= 0.057 },
  ]),
  'matilda-ii': ground('matilda-ii', [
    { cue: 'armoured skirts over the whole running gear', check: (s) => s.chassis === 'tracked' && !s.running },
    { cue: 'small cast turret with a 2-pounder', check: (s) => castTurret(s) && (mainGun(s)?.calibre ?? 1) < 0.05 },
    { cue: 'cast hull, narrow and tall for its length', check: (s) => hullShape(s) && s.width / s.length < 0.5 },
  ]),
  'b1-bis': ground('b1-bis', [
    { cue: 'tracks run round the whole tall hull', check: (s) => s.chassis === 'tracked' && !s.running },
    { cue: '75 mm howitzer low in the hull front and a 47 mm in the turret', check: (s) => (s.guns?.length ?? 0) >= 2 },
    { cue: 'small cast APX turret on top', check: castTurret },
  ]),
  'asu-85': ground('asu-85', [
    { cue: 'low casemate with the 85 mm and its muzzle brake', check: muzzle },
    { cue: 'six road wheels a side, no return rollers', check: (s) => wheels(s) === 6 && rollers(s) === 0 },
    { cue: 'sloped hull sides', check: lean(0.3) },
  ]),
  't-80-light': ground('t-80-light', [
    { cue: 'five small road wheels a side, three return rollers', check: (s) => wheels(s) === 5 && rollers(s) === 3 },
    { cue: 'small turret with a 45 mm', check: (s) => turretShape(s) && (mainGun(s)?.calibre ?? 1) < 0.05 },
    { cue: 'short sloped hull', check: (s) => hullShape(s) && s.length < 4.5 },
  ]),
  'landsverk-l60': ground('landsverk-l60', [
    { cue: 'four large road wheels a side, two return rollers', check: (s) => wheels(s) === 4 && rollers(s) === 2 },
    { cue: 'small turret with a 37 mm', check: (s) => turretShape(s) && (mainGun(s)?.calibre ?? 1) < 0.05 },
    { cue: 'low hull with a sloped front', check: hullShape },
  ]),
  'lvt-a1': ground('lvt-a1', [
    { cue: 'boat hull, the grousered tracks run round its sides', check: (s) => s.chassis === 'tracked' && !s.running },
    { cue: 'long and wide, near eight metres', check: (s) => s.length > 7.5 },
    { cue: 'small turret with a 37 mm', check: (s) => (mainGun(s)?.calibre ?? 1) < 0.05 },
  ]),
  't-44': ground('t-44', [
    { cue: 'five large road wheels, the wide gap behind the first', check: (s) => wheels(s) === 5 },
    { cue: '85 mm without a muzzle brake', check: (s) => noMuzzle(s) && (mainGun(s)?.calibre ?? 0) >= 0.085 },
    { cue: 'cast turret set well back on a low flat hull', check: (s) => castTurret(s) && (s.turret?.x ?? 0) < 0 },
  ]),
  'strv-m42': ground('strv-m42', [
    { cue: 'six road wheels a side, three return rollers', check: (s) => wheels(s) === 6 && rollers(s) === 3 },
    { cue: 'large turret with a short 75 mm', check: turretShape },
    { cue: 'Landsverk hull with a stepped front', check: hullShape },
  ]),
};

export interface CueCount {
  figure: string;
  domain: CueDomain;
  total: number;
  checked: number;
  notModelled: number;
  /** Cues still to be checked or marked (neither a check nor modelled:false). */
  open: number;
  /** Checks that fail on the spec. */
  failed: string[];
  notModelledCues: string[];
  /** No spec for the figure (an own-builder figure or a missing name). */
  noSpec: boolean;
}

/** Per figure: its cues from every entry naming it, counted and checked. */
export function cueCounts(): CueCount[] {
  const by = new Map<string, CueCount>();
  for (const e of Object.values(CUES)) {
    for (const f of e.figures) {
      const spec = specOf(e.domain, f);
      let c = by.get(f);
      if (!c) by.set(f, (c = { figure: f, domain: e.domain, total: 0, checked: 0, notModelled: 0, open: 0, failed: [], notModelledCues: [], noSpec: !spec }));
      for (const q of e.cues) {
        c.total++;
        if (q.modelled === false) {
          c.notModelled++;
          c.notModelledCues.push(q.cue + (q.note ? ` (${q.note})` : ''));
        } else if (q.check) {
          c.checked++;
          if (!spec || !q.check(spec as never)) c.failed.push(q.cue);
        } else c.open++;
      }
    }
  }
  return [...by.values()];
}
