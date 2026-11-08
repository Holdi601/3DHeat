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
import { lerpPoly, type Outline, type P2 } from '../parts';
import { SPEC_SETS } from './index';
import { DOMAIN_SPECS } from '../catalog';
import type { AirshipSpec, EmplacementSpec } from '../small';
import { AIRSHIPS, EMPLACEMENTS } from './generic';
import { NAVAL_CUES } from './cues-naval';
import { HELI_CUES } from './cues-heli';
import { JET_CUES } from './cues-jets';
import { MORE_AIR_CUES } from './cues-air';

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
  /** Own-builder figures: airships and balloons, emplacements. */
  airship: AirshipSpec;
  emplacement: EmplacementSpec;
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
  if (domain === 'airship') return AIRSHIPS[name] as SpecOf[D] | undefined;
  if (domain === 'emplacement') return EMPLACEMENTS[name] as SpecOf[D] | undefined;
  const d = domain as 'ground' | 'air' | 'heli' | 'naval';
  for (let i = SPEC_SETS.length - 1; i >= 0; i--) {
    const s = SPEC_SETS[i][d]?.[name];
    if (s) return s as unknown as SpecOf[D];
  }
  // The generic class figures and first types the catalogue starts from.
  return DOMAIN_SPECS[d][name] as unknown as SpecOf[D] | undefined;
}

const entry =
  <D extends CueDomain>(domain: D) =>
  (figures: string | string[], cues: Cue<SpecOf[D]>[]): CueEntry<D> => ({ domain, figures: typeof figures === 'string' ? [figures] : figures, cues });
const ground = entry('ground');
const air = entry('air');
const airship = entry('airship');
const emplacement = entry('emplacement');
/** Envelope length over diameter. */
const slender = (s: AirshipSpec) => s.length / s.diameter;

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

// Air checks.
type Air = FixedWingSpec;
const bodiesOf = (s: Air) => s.bodies ?? [];
const front = (o: Outline) => Math.max(...o.plan.map((p) => p[0]));
const back = (o: Outline) => Math.min(...o.plan.map((p) => p[0]));
const halfWidth = (o: Outline) => Math.max(...o.plan.map((p) => p[1]));
const lowest = (o: Outline) => Math.min(...o.bottom.map((p) => p[1]));
const highest = (o: Outline) => Math.max(...o.top.map((p) => p[1]));
const out = (o: Outline) => Math.abs(o.side ?? 0);
const noseX = (s: Air) => (s.fuselage ? front(s.fuselage) : s.length / 2);
const tailX = (s: Air) => (s.fuselage ? back(s.fuselage) : -s.length / 2);
const topAt = (s: Air, x: number) => (s.fuselage ? lerpPoly(s.fuselage.top, x) : s.bodyHeight / 2);
const bottomAt = (s: Air, x: number) => (s.fuselage ? lerpPoly(s.fuselage.bottom, x) : -s.bodyHeight / 2);
const depthAt = (s: Air, x: number) => topAt(s, x) - bottomAt(s, x);
const glassFront = (s: Air) => Math.max(-99, ...(s.glass ?? []).map(front));
/** A bulge out of a profile line between x0 and x1 (forward, back): beyond the line at both ends by `d`, upwards (1) or down (-1). */
const bump = (line: P2[] | undefined, x0: number, x1: number, dir: 1 | -1, d = 0.06) => {
  const inner = (line ?? []).filter((q) => q[0] < x0 && q[0] > x1).map((q) => q[1] * dir);
  return !!line && inner.length > 0 && Math.max(...inner) >= Math.max(lerpPoly(line, x0) * dir, lerpPoly(line, x1) * dir) + d;
};
/** The wing root's leading edge: the foremost point of the planform (the outermost of several). */
const rootLE = (s: Air): P2 => (s.wingPlan ?? [[s.wing.x + s.wing.rootChord / 2, 0] as P2]).reduce((a, q) => (q[0] > a[0] || (q[0] === a[0] && q[1] > a[1]) ? q : a));
const planSpan = (s: Air) => Math.max(...(s.wingPlan ?? [[0, s.span / 2] as P2]).map((q) => q[1]));
/** The leading edge's sweep from the root's foremost point to the tip's, degrees. */
const leSweep = (s: Air) => {
  const p = s.wingPlan;
  if (!p) return s.wing.sweep ?? 0;
  const y1 = planSpan(s);
  const tip = Math.max(...p.filter((q) => q[1] >= y1 - 0.05).map((q) => q[0]));
  const [x0, y0] = rootLE(s);
  return (Math.atan2(x0 - tip, y1 - y0) * 180) / Math.PI;
};
/** The wing's chord `y` out. */
const chordAt = (s: Air, y: number) => {
  const p = s.wingPlan ?? [];
  const x: number[] = [];
  p.forEach((a, i) => {
    const b = p[(i + 1) % p.length];
    if ((a[1] - y) * (b[1] - y) <= 0 && a[1] !== b[1]) x.push(a[0] + ((b[0] - a[0]) * (y - a[1])) / (b[1] - a[1]));
  });
  return x.length ? Math.max(...x) - Math.min(...x) : 0;
};
/** Square-cut tips: the chord at 99 % of the half span still over a third of the root's. */
const squareTips = (s: Air) => chordAt(s, planSpan(s) * 0.99) >= 0.35 * chordAt(s, 0.05);
const roundTips = (s: Air) => chordAt(s, planSpan(s) * 0.99) < 0.25 * chordAt(s, 0.05);
/** A strake along the wing root: a leading-edge run inboard swept back more than 63 degrees over 0.4 m or more. */
const lerxPlan = (s: Air) => {
  const p = s.wingPlan ?? [];
  const tip = p.findIndex((q) => q[1] === planSpan(s));
  return p.slice(0, tip).some((a, i) => a[0] - p[i + 1][0] >= 0.4 && p[i + 1][1] > a[1] && a[0] - p[i + 1][0] >= 2 * (p[i + 1][1] - a[1]));
};
/** A leading edge stepped forward on its way out: a dogtooth (snag). */
const dogtooth = (s: Air) => {
  const p = s.wingPlan ?? [];
  const tip = p.findIndex((q) => q[1] === planSpan(s));
  return p.slice(1, tip + 1).some((q, i) => q[1] > p[i][1] && q[0] > p[i][0] + 0.1);
};
const dihedral = (s: Air) => s.wing.dihedral ?? 0;
const jets = (n: number) => (s: Air) => s.engines?.kind === 'internal' && s.engines.count === n;
const nozzleX = (s: Air) => Math.min(...(s.engines?.nozzles ?? [[-s.length / 2, 0, 0]]).map((q) => q[0]));
const bubbleHood = (s: Air) => s.canopy?.kind === 'bubble';
const framedHood = (s: Air) => s.canopy?.kind === 'framed';
const tandemHood = (s: Air) => s.canopy?.kind === 'tandem';
const singleFin = (s: Air) => s.tail.kind === 'single';
const twinFins = (s: Air) => s.tail.kind === 'twin';
const uprightTwins = (s: Air) => twinFins(s) && !s.tail.cant;
const tailless = (s: Air) => !s.tail.tailSpan;
/** Stores at the wing tips: a body centred at least 90 % of the half span out (tip tanks, missiles, pods). */
const tipStores = (s: Air) => bodiesOf(s).some((b) => out(b) >= (s.span / 2) * 0.9);
/** A thin plate under the body on its centre line. */
const ventralFin = (s: Air) => bodiesOf(s).some((b) => !b.side && halfWidth(b) <= 0.05 && highest(b) < 0);
/** A tail cone reaching `d` behind the nozzles. */
const sting = (d: number) => (s: Air) => tailX(s) < nozzleX(s) - d;
/** Long nozzles beyond the tail (thrust vectoring). */
const longNozzles = (s: Air) => bodiesOf(s).some((b) => out(b) >= 0.8 && back(b) < nozzleX(s) - 0.4);
/** A broad flat strake on the centre line ahead of the wing (LERX as a body). */
const lerxBody = (s: Air) => !!s.lerx || bodiesOf(s).some((b) => !b.side && halfWidth(b) >= 1.5 && front(b) > rootLE(s)[0] - 1);
/** A propeller of `n` blades. */
const blades = (n: number) => (s: Air) => (s.propeller?.blades ?? s.props?.[0]?.blades) === n;
const radial = (s: Air) => !!s.cowls?.length;
const inline = (s: Air) => s.engines?.kind === 'nose-prop' && !radial(s);
/** Two engines on the wing, their propellers mirrored. */
const twinProps = (s: Air) => (s.props?.length ?? 0) === 2 && !!s.props?.every((p) => Math.abs(p.side) > s.bodyWidth / 2);
/** Radiators under both wings: thin bodies hung under the wing well out from the body. */
const underwingRads = (s: Air) => bodiesOf(s).some((b) => out(b) >= 0.8 && out(b) <= s.span * 0.25 && highest(b) < 0 && halfWidth(b) <= 0.4);
/** Thin struts or posts by the tail, off the centre line. */
const tailStruts = (s: Air) => bodiesOf(s).some((b) => halfWidth(b) <= 0.05 && out(b) > 0.1 && front(b) < tailX(s) + 2);
/** A belly radiator: the profile's bottom bulging down between x0 and x1. */
const bellyBath = (x0: number, x1: number) => (s: Air) => bump(s.fuselage?.bottom, x0, x1, -1);
/** A deep body: fuselage depth over length. */
const deepBody = (k: number) => (s: Air) => !!s.fuselage && (Math.max(...s.fuselage.top.map((p) => p[1])) - Math.min(...s.fuselage.bottom.map((p) => p[1]))) / s.length >= k;
/** A glazed nose: a glass body reaching within a metre of the nose. */
const glazedNose = (s: Air) => (s.glass ?? []).some((g) => front(g) > noseX(s) - 1);
/** An open nose intake: the body still 0.6 m deep a quarter metre behind its lip. */
const noseIntake = (s: Air) => depthAt(s, noseX(s) - 0.25) >= 0.6;
/** A radome over a chin intake: the nose's tip above the axis, the intake's lower lip well below it behind. */
const radomeChin = (s: Air) => topAt(s, noseX(s)) >= 0.1 && bottomAt(s, noseX(s) - 1.2) < bottomAt(s, noseX(s)) - 0.6;

const AIR_CUES: Record<string, CueEntry> = {
  'f-86k': air('f-86k', [
    { cue: 'radome over the chin intake (Sabre Dog nose)', check: radomeChin },
    { cue: 'swept wing, low on the body with slight dihedral', check: (s) => leSweep(s) >= 30 && s.wing.mount! < 0 && dihedral(s) > 0 },
    { cue: 'bubble canopy', check: bubbleHood },
    { cue: 'single jet, nozzle under the tail', check: jets(1) },
    { cue: 'tailplane with dihedral low on the fin', check: (s) => (s.tail.planeDihedral ?? 0) >= 5 && (s.tail.planeUp ?? 0) < 1 },
  ]),
  'f-86f': air('f-86f', [
    { cue: 'open oval nose intake', check: (s) => noseIntake(s) && !radomeChin(s) },
    { cue: 'swept wing, low on the body with slight dihedral', check: (s) => leSweep(s) >= 30 && s.wing.mount! < 0 && dihedral(s) > 0 },
    { cue: 'bubble canopy well back from the nose', check: (s) => bubbleHood(s) && glassFront(s) < noseX(s) - 1.2 },
    { cue: 'tailplane with dihedral low on the fin', check: (s) => (s.tail.planeDihedral ?? 0) >= 5 && (s.tail.planeUp ?? 0) < 1 },
    { cue: 'single jet, nozzle under the tail', check: jets(1) },
  ]),
  'eurofighter-typhoon': air('eurofighter-typhoon', [
    { cue: 'canards far forward under the cockpit, drooped', check: (s) => !!s.canard && (s.canard.dihedral ?? 0) <= -5 },
    { cue: 'cranked delta wing, no tailplane', check: (s) => leSweep(s) >= 45 && tailless(s) },
    { cue: 'single fin', check: singleFin },
    { cue: 'twin engines side by side', check: jets(2) },
    { cue: 'smiling chin intake', check: (s) => bodiesOf(s).some((b) => !b.side && !!b.section && lowest(b) < bottomAt(s, front(b) - 0.5) - 0.3) },
  ]),
  'hunter-f1': air('hunter-f1', [
    { cue: 'intakes in the wing roots', check: (s) => bodiesOf(s).some((b) => out(b) >= 0.5 && out(b) <= 1.2 && Math.abs(front(b) - rootLE(s)[0]) < 0.3) },
    { cue: 'swept mid wing', check: (s) => leSweep(s) >= 30 && Math.abs(s.wing.mount ?? 0) <= 0.5 },
    { cue: 'clean leading edge, no dogtooth (the F.6 has one)', check: (s) => !dogtooth(s) },
    { cue: 'tailplane set up the fin', check: (s) => (s.tail.planeUp ?? 0) > 0.5 },
    { cue: 'single jet, bubble canopy', check: (s) => jets(1)(s) && bubbleHood(s) },
  ]),
  'su-30mki': air('su-30mki', [
    { cue: 'canards', check: (s) => !!s.canard },
    { cue: 'twin upright fins on the tail booms', check: uprightTwins },
    { cue: 'widely spaced engine nacelles, thrust-vectoring nozzles', check: (s) => jets(2)(s) && longNozzles(s) },
    { cue: 'tandem two-seat canopy', check: tandemHood },
    { cue: 'tail sting between the nozzles', check: sting(1.5) },
  ]),
  'su-30': air('su-30', [
    { cue: 'no canards (the MKI family has them)', check: (s) => !s.canard },
    { cue: 'twin upright fins on the tail booms', check: uprightTwins },
    { cue: 'widely spaced engine nacelles under a flat body', check: (s) => jets(2)(s) && bodiesOf(s).some((b) => out(b) >= 1 && front(b) - back(b) > 6) },
    { cue: 'tandem two-seat canopy', check: tandemHood },
    { cue: 'tail sting between the nozzles', check: sting(1.5) },
  ]),
  'f-15c': air(['f-15c', 'f-15e'], [
    { cue: 'twin upright fins', check: uprightTwins },
    { cue: 'raked box intakes beside the cockpit', check: (s) => bodiesOf(s).some((b) => out(b) >= 1 && front(b) > rootLE(s)[0] + 1) },
    { cue: 'large shoulder wing with clipped tips, slight anhedral', check: (s) => (s.wing.mount ?? 0) > 0 && dihedral(s) < 0 && leSweep(s) >= 40 },
    { cue: 'wide flat body between the engines', check: (s) => s.bodyWidth >= 2.5 && jets(2)(s) },
    { cue: 'no canards, stabilators behind the wing', check: (s) => !s.canard && !!s.tail.tailSpan },
  ]),
  'f-15c-hood': air('f-15c', [{ cue: 'high single-seat bubble canopy', check: bubbleHood }]),
  'f-15e': air('f-15e', [
    { cue: 'conformal fuel tanks along the intake trunks', check: (s) => bodiesOf(s).some((b) => out(b) >= 1.5 && out(b) <= 2.5 && front(b) < 3 && halfWidth(b) >= 0.2) },
    { cue: 'two seats under one long canopy', check: tandemHood },
  ]),
  'f-a-18e': air('f-a-18e', [
    { cue: 'twin fins canted outward', check: (s) => twinFins(s) && (s.tail.cant ?? 0) >= 15 },
    { cue: 'broad LERX from the wing to the cockpit', check: lerxBody },
    { cue: 'rectangular raked intakes under the LERX', check: (s) => bodiesOf(s).some((b) => out(b) >= 0.8 && out(b) <= 1.4 && lowest(b) < -0.8) },
    { cue: 'dogtooth in the wing leading edge', check: dogtooth },
    { cue: 'missiles on the wing tips', check: tipStores },
  ]),
  'f-104g': air(['f-104g', 'f-104'], [
    { cue: 'T-tail', check: (s) => s.tail.kind === 't' },
    { cue: 'tiny thin wing with strong anhedral', check: (s) => dihedral(s) <= -8 && s.span / s.length < 0.45 },
    { cue: 'half-cone intakes on the body sides', check: (s) => bodiesOf(s).some((b) => out(b) >= 0.5 && out(b) <= 1 && front(b) > rootLE(s)[0]) },
    { cue: 'long needle body with a nose probe', check: (s) => s.length / s.span > 2.4 && bodiesOf(s).some((b) => !b.side && front(b) > noseX(s) + 0.5) },
    { cue: 'ventral fin under the tail', check: ventralFin },
  ]),
  'f-104g-tips': air('f-104g', [{ cue: 'tip tanks', check: (s) => bodiesOf(s).some((b) => out(b) >= s.span * 0.45 && halfWidth(b) >= 0.25) }]),
  'f-104-tips': air('f-104', [{ cue: 'Sidewinders on the wing tips, the small early fin', check: (s) => tipStores(s) && s.tail.finHeight < 1.8 }]),
  'su-17m4': air('su-17m4', [
    { cue: 'swing wing: outer panels pivoting on a fixed glove', check: (s) => !!s.swing },
    { cue: 'nose intake with a shock cone', check: (s) => noseIntake(s) && bodiesOf(s).some((b) => !b.side && halfWidth(b) >= 0.2 && front(b) > noseX(s) + 0.2) },
    { cue: 'tall fences on the gloves', check: (s) => bodiesOf(s).some((b) => halfWidth(b) <= 0.05 && out(b) >= 1.5) },
    { cue: 'ram-air scoop at the fin root', check: (s) => bodiesOf(s).some((b) => !b.side && back(b) < -2 && lowest(b) > topAt(s, front(b)) - 0.3) },
    { cue: 'large single swept fin, single jet', check: (s) => singleFin(s) && jets(1)(s) },
  ]),
  rafale: air('rafale', [
    { cue: 'close-coupled canards just ahead of the wing', check: (s) => !!s.canard && s.canard.x - s.canard.chord / 2 - rootLE(s)[0] < 0.6 },
    { cue: 'delta wing, no tailplane', check: (s) => leSweep(s) >= 42 && tailless(s) },
    { cue: 'split intakes low on the sides under the canards', check: (s) => bodiesOf(s).some((b) => out(b) >= 0.6 && lowest(b) < -0.6) },
    { cue: 'twin engines side by side, one fin', check: (s) => jets(2)(s) && singleFin(s) },
  ]),
  'f-5e': air('f-5e', [
    { cue: 'Sidewinders on the wing-tip rails', check: tipStores },
    { cue: 'two small engines side by side', check: jets(2) },
    { cue: 'small LERX ahead of a thin swept wing', check: (s) => lerxPlan(s) && leSweep(s) >= 20 },
    { cue: 'small intakes on the sides behind the cockpit', check: (s) => bodiesOf(s).some((b) => out(b) >= 0.4 && out(b) <= 0.9 && front(b) < glassFront(s)) },
    { cue: 'long pointed shark nose', check: (s) => depthAt(s, noseX(s) - 0.8) < 0.5 },
  ]),
  'p-39': air('p-39', [
    { cue: 'engine behind the pilot: the cockpit over the wing root', check: (s) => glassFront(s) > rootLE(s)[0] - 0.4 },
    { cue: 'carburettor scoop on the back behind the canopy', check: (s) => bump(s.fuselage?.top, -0.1, -1.6, 1) },
    { cue: 'car-door framed cockpit', check: framedHood },
    { cue: 'slim inline nose, three blades', check: (s) => inline(s) && blades(3)(s) },
  ]),
  'bf-109-f': air(['bf-109-f', 'bf-109-e'], [
    { cue: 'slim pointed inline nose, narrow body', check: (s) => inline(s) && s.bodyWidth < 1.2 },
    { cue: 'radiators under both wings', check: underwingRads },
    { cue: 'oil cooler under the nose', check: (s) => bump(s.fuselage?.bottom, 3.4, 2.4, -1, 0.04) || bodiesOf(s).some((b) => !b.side && front(b) > noseX(s) - 1.5 && highest(b) < 0) },
    { cue: 'low framed canopy', check: framedHood },
  ]),
  'bf-109-f-tips': air('bf-109-f', [
    { cue: 'rounded wing tips', check: roundTips },
    { cue: 'no tailplane struts (the E has them)', check: (s) => !tailStruts(s) },
  ]),
  'bf-109-e': air('bf-109-e', [
    { cue: 'square-cut wing tips', check: squareTips },
    { cue: 'struts under the tailplane', check: tailStruts },
  ]),
  'p-51a': air('p-51a', [
    { cue: 'carburettor scoop on top of the nose', check: (s) => bodiesOf(s).some((b) => !b.side && front(b) > 2 && lowest(b) >= 0.3) },
    { cue: 'belly radiator scoop behind the wing', check: bellyBath(1.0, -1.5) },
    { cue: 'framed hood faired into the back (razorback)', check: (s) => framedHood(s) && !bump(s.fuselage?.top, -2.2, -4, 1) },
    { cue: 'straight laminar wing, three blades', check: (s) => leSweep(s) < 10 && blades(3)(s) },
  ]),
  'p-51d-mustang': air('p-51d-mustang', [
    { cue: 'bubble canopy over a cut-down deck', check: bubbleHood },
    { cue: 'belly radiator scoop behind the wing', check: bellyBath(1.0, -1.5) },
    { cue: 'dorsal fillet ahead of the fin', check: (s) => bump(s.fuselage?.top, -2.2, -4, 1) },
    { cue: 'straight laminar wing, four blades', check: (s) => leSweep(s) < 10 && blades(4)(s) },
  ]),
  'yak-9': air('yak-9', [
    { cue: 'radiator bath under the wing centre', check: bellyBath(1.0, -0.7) },
    { cue: 'cut-down rear deck behind the hood', check: bubbleHood },
    { cue: 'slim inline nose, three blades', check: (s) => inline(s) && blades(3)(s) },
    { cue: 'tapered wing with rounded tips and dihedral', check: (s) => dihedral(s) >= 4 && roundTips(s) },
  ]),
  'f4u-corsair': air('f4u-corsair', [
    { cue: 'inverted gull wing', check: (s) => !!s.wing.gull },
    { cue: 'very long nose, the cockpit far back', check: (s) => (s.length / 2 - glassFront(s)) / s.length >= 0.37 },
    { cue: 'big round radial cowl', check: radial },
    { cue: 'large three-bladed propeller', check: (s) => blades(3)(s) && (s.propeller?.diameter ?? 0) >= 3.9 },
  ]),
  hurricane: air('hurricane', [
    { cue: 'radiator bath under the wing centre', check: bellyBath(2.0, 0) },
    { cue: 'deep humped fuselage', check: deepBody(0.17) },
    { cue: 'framed canopy, inline nose, three blades', check: (s) => framedHood(s) && inline(s) && blades(3)(s) },
    { cue: 'thick broad wing with dihedral', check: (s) => dihedral(s) >= 3 && chordAt(s, 0.5) >= 2.4 },
  ]),
  'fw-190-a8': air('fw-190-a8', [
    { cue: 'big round radial cowl', check: radial },
    { cue: 'bulged clear hood', check: bubbleHood },
    { cue: 'short straight-tapered wing', check: (s) => leSweep(s) < 10 && s.span / s.length < 1.2 },
    { cue: 'three-bladed propeller with a big spinner', check: (s) => blades(3)(s) && (s.propeller?.spinner ?? 0) > 0 },
  ]),
  'a-26-invader': air('a-26-invader', [
    { cue: 'two radials in nacelles on the wing', check: (s) => twinProps(s) && radial(s) },
    { cue: 'solid gun nose (the C has glazing)', check: (s) => !glazedNose(s) },
    { cue: 'remote turret on the back', check: (s) => bump(s.fuselage?.top, 1.41, 0.28, 1) },
    { cue: 'mid wing, tall single fin', check: (s) => (s.wing.mount ?? -1) >= -0.1 && singleFin(s) && s.tail.finHeight >= 3 },
  ]),
  'b-18': air('b-18', [
    { cue: 'very deep bomber body', check: deepBody(0.16) },
    { cue: 'glazed shark nose', check: glazedNose },
    { cue: 'two radials in nacelles on the wing', check: (s) => twinProps(s) && radial(s) },
    { cue: 'low DC-2 wing, flat centre section, outer panels with dihedral', check: (s) => (s.wing.mount ?? 0) < 0 && !!s.wing.outerDihedral },
  ]),
  'f4u-4': air('f4u-4', [
    { cue: 'inverted gull wing', check: (s) => !!s.wing.gull },
    { cue: 'very long nose, the cockpit far back', check: (s) => (s.length / 2 - glassFront(s)) / s.length >= 0.37 },
    { cue: 'chin scoop under the cowl (the -4)', check: (s) => bodiesOf(s).some((b) => !b.side && front(b) > noseX(s) - 1 && highest(b) < 0) },
    { cue: 'radial cowl, four-bladed propeller', check: (s) => radial(s) && blades(4)(s) },
  ]),
  'me-262-u4': air('me-262-u4', [
    { cue: 'two jet nacelles slung under the wing', check: (s) => bodiesOf(s).some((b) => out(b) >= 1.5 && highest(b) < 0 && halfWidth(b) >= 0.35) },
    { cue: 'triangular body section, wide at the chines', check: (s) => !!s.fuselage?.section },
    { cue: 'swept outer wing leading edge', check: (s) => leSweep(s) >= 10 },
    { cue: 'long 50 mm gun barrel out of the nose', check: (s) => bodiesOf(s).some((b) => !b.side && front(b) > noseX(s) + 1 && halfWidth(b) <= 0.1) },
  ]),
  'f8f-bearcat': air('f8f-bearcat', [
    { cue: 'big radial on a short body', check: (s) => radial(s) && s.length / s.span < 0.85 },
    { cue: 'bubble canopy', check: bubbleHood },
    { cue: 'four-bladed propeller', check: blades(4) },
    { cue: 'tall fin', check: (s) => s.tail.finHeight >= 1.6 },
  ]),
  'pby-catalina': air('pby-catalina', [
    { cue: 'parasol wing on a pylon over the hull', check: (s) => (s.wing.mount ?? 0) > 1 && bodiesOf(s).some((b) => !b.side && lowest(b) > 0.5) },
    { cue: 'deep flying-boat hull', check: deepBody(0.15) },
    { cue: 'two radials on the wing', check: (s) => twinProps(s) && radial(s) },
    { cue: 'waist gun blisters', check: (s) => bodiesOf(s).some((b) => out(b) >= 0.5 && out(b) <= 1.5 && back(b) < 0) },
  ]),
  'i-16': air('i-16', [
    { cue: 'stubby barrel body behind a big radial', check: (s) => radial(s) && s.length / s.span < 0.75 },
    { cue: 'short broad wing', check: (s) => chordAt(s, 0.5) >= 1.8 },
    { cue: 'small open or framed cockpit', check: framedHood },
  ]),
  'p-40e': air('p-40e', [
    { cue: 'deep chin radiator under the nose', check: (s) => bump(s.fuselage?.bottom, noseX(s) - 0.2, noseX(s) - 3, -1) || depthAt(s, noseX(s) - 1.2) >= 1.2 },
    { cue: 'framed hood, inline nose, three blades', check: (s) => framedHood(s) && inline(s) && blades(3)(s) },
    { cue: 'tapered wing with dihedral', check: (s) => dihedral(s) >= 5 },
  ]),
  'tu-2': air('tu-2', [
    { cue: 'two radials in nacelles on the wing', check: (s) => twinProps(s) && radial(s) },
    { cue: 'twin fins on the tailplane tips', check: (s) => s.tail.kind === 'h' },
    { cue: 'glazed nose', check: glazedNose },
    { cue: 'mid wing', check: (s) => (s.wing.mount ?? -1) >= 0 },
  ]),
  'me-410': air('me-410', [
    { cue: 'two inline engines in nacelles on the wing', check: (s) => twinProps(s) && !radial(s) },
    { cue: 'remote barbettes on the body sides', check: (s) => bodiesOf(s).some((b) => out(b) >= 0.3 && out(b) <= 1 && back(b) < 0) },
    { cue: 'single fin', check: singleFin },
  ]),
  pbm: air('pbm', [
    { cue: 'twin fins on the tailplane tips', check: (s) => s.tail.kind === 'h' },
    { cue: 'floats on struts under the wing', check: (s) => bodiesOf(s).some((b) => out(b) >= s.span * 0.3 && highest(b) < 0) },
    { cue: 'two radials on a high wing', check: (s) => twinProps(s) && radial(s) && (s.wing.mount ?? 0) > 0.5 },
    { cue: 'gull wing', check: (s) => !!s.wing.outerDihedral && dihedral(s) >= 10 && s.wing.outerDihedral.deg < dihedral(s) / 2 },
  ]),
  'su-2': air('su-2', [
    { cue: 'radial cowl, three blades', check: (s) => radial(s) && blades(3)(s) },
    { cue: 'long framed two-seat canopy', check: framedHood },
    { cue: 'low wing with dihedral', check: (s) => (s.wing.mount ?? 0) < 0 && dihedral(s) >= 4 },
  ]),
  'jas-39e': air('jas-39e', [
    { cue: 'close-coupled canards on the intakes', check: (s) => !!s.canard && (s.canard.up ?? 0) > 0.3 },
    { cue: 'delta wing, no tailplane', check: (s) => leSweep(s) >= 40 && tailless(s) },
    { cue: 'side intakes', check: (s) => bodiesOf(s).some((b) => out(b) >= 0.4 && out(b) <= 0.9) },
    { cue: 'single engine, single fin', check: (s) => jets(1)(s) && singleFin(s) },
    { cue: 'missiles on the wing tips', check: tipStores },
  ]),
  'mig-29smt': air('mig-29smt', [
    { cue: 'twin fins, slightly canted', check: (s) => twinFins(s) && (s.tail.cant ?? 0) > 0 },
    { cue: 'broad LERX', check: lerxBody },
    { cue: 'engine nacelles slung apart under the body', check: (s) => bodiesOf(s).some((b) => out(b) >= 0.8 && lowest(b) < -0.8) },
    { cue: 'humped dorsal spine (SMT)', check: (s) => bodiesOf(s).some((b) => !b.side && highest(b) > 1.2) },
  ]),
  'yak-4': air('yak-4', [
    { cue: 'two inline engines in nacelles', check: (s) => twinProps(s) && !radial(s) },
    { cue: 'twin fins on the tailplane tips', check: (s) => s.tail.kind === 'h' },
    { cue: 'glazed nose', check: glazedNose },
  ]),
  'f2a-buffalo': air('f2a-buffalo', [
    { cue: 'barrel body behind a big radial', check: (s) => radial(s) && s.bodyWidth / s.length > 0.15 },
    { cue: 'long framed canopy over a high spine', check: (s) => framedHood(s) && bodiesOf(s).some((b) => !b.side && highest(b) > 0.8) },
    { cue: 'mid-low wing, three blades', check: (s) => blades(3)(s) && (s.wing.mount ?? 0) < 0 },
  ]),
  'su-33': air('su-33', [
    { cue: 'canards ahead of the LERX', check: (s) => !!s.canard },
    { cue: 'twin upright fins', check: uprightTwins },
    { cue: 'short tail sting (cut for the deck)', check: (s) => sting(1)(s) && tailX(s) > -10.5 },
    { cue: 'single-seat bubble', check: bubbleHood },
  ]),
  'p-47d': air('p-47d', [
    { cue: 'huge radial and deep body', check: (s) => radial(s) && deepBody(0.16)(s) },
    { cue: 'bubble canopy (late D)', check: bubbleHood },
    { cue: 'elliptic wing with rounded tips', check: roundTips },
    { cue: 'four-bladed propeller', check: blades(4) },
  ]),
  'yak-1': air(['yak-1', 'yak-7b'], [
    { cue: 'framed hood faired into a high spine', check: (s) => framedHood(s) && bodiesOf(s).some((b) => !b.side && highest(b) > 0.4 && back(b) < -3) },
    { cue: 'slim inline nose, three blades', check: (s) => inline(s) && blades(3)(s) },
    { cue: 'radiator bath under the wing centre', check: (s) => bump(s.fuselage?.bottom, 1.2, -1.0, -1, 0.04) },
  ]),
  'he-112': air('he-112', [
    { cue: 'elliptic wing', check: roundTips },
    { cue: 'radiator under the belly', check: (s) => bodiesOf(s).some((b) => !b.side && highest(b) < 0 && halfWidth(b) >= 0.25) },
    { cue: 'inline nose, three blades', check: (s) => inline(s) && blades(3)(s) },
  ]),
  'recon-micro-uav': air('recon-micro-uav', [
    { cue: 'hand-launched size, about a metre long', check: (s) => s.length < 1.5 && s.span < 2 },
    { cue: 'straight wing on top of a slim body', check: (s) => (s.wing.mount ?? 0) > 0.5 && (s.wing.sweep ?? 0) < 5 && s.bodyWidth < 0.2 },
    { cue: 'two-bladed nose propeller', check: (s) => s.engines?.kind === 'nose-prop' && s.propeller?.blades === 2 },
    { cue: 'small conventional tail', check: (s) => singleFin(s) && (s.tail.tailSpan ?? 0) > 0 },
  ]),
  'su-24m': air('su-24m', [
    { cue: 'swing wing on a shoulder glove', check: (s) => !!s.swing && (s.wing.mount ?? 0) > 0 },
    { cue: 'wide flat body over two engines side by side', check: (s) => jets(2)(s) && s.bodyWidth >= 3 },
    { cue: 'side-by-side two-seat cockpit', check: (s) => (s.glass ?? []).some((g) => halfWidth(g) >= 0.6) },
    { cue: 'single tall fin', check: (s) => singleFin(s) && s.tail.finHeight >= 3 },
  ]),
  'a-1-skyraider': air('a-1-skyraider', [
    { cue: 'big radial, four blades', check: (s) => radial(s) && blades(4)(s) },
    { cue: 'long broad straight wing', check: (s) => s.span / s.length > 1.2 && chordAt(s, 0.5) >= 2.5 },
    { cue: 'bubble canopy', check: bubbleHood },
    { cue: 'tall broad fin', check: (s) => s.tail.finHeight >= 2 },
  ]),
  'la-7': air('la-7', [
    { cue: 'radial cowl, bubble hood', check: (s) => radial(s) && bubbleHood(s) },
    { cue: 'oil cooler under the body behind the wing', check: (s) => bodiesOf(s).some((b) => !b.side && highest(b) < 0 && back(b) < -1) },
    { cue: 'supercharger intakes in the wing roots', check: (s) => bodiesOf(s).some((b) => out(b) >= 0.4 && out(b) <= 1 && front(b) > 1) },
  ]),
  'ju-87-stuka': air('ju-87-stuka', [
    { cue: 'inverted gull wing', check: (s) => !!s.wing.gull },
    { cue: 'fixed main wheels in spats', check: (s) => !!s.fixedGear },
    { cue: 'long framed two-seat greenhouse', check: (s) => framedHood(s) && (s.canopy?.length ?? 0) >= 2.5 },
    { cue: 'inline nose with the deep chin radiator', check: (s) => inline(s) && depthAt(s, noseX(s) - 1.2) >= 1.2 },
  ]),
  'p-63': air('p-63', [
    { cue: 'engine behind the pilot: the cockpit over the wing root', check: (s) => glassFront(s) > rootLE(s)[0] - 0.4 },
    { cue: 'carburettor scoop on the back behind the canopy', check: (s) => bodiesOf(s).some((b) => !b.side && highest(b) >= 0.9 && front(b) < glassFront(s)) },
    { cue: 'car-door framed cockpit, four blades', check: (s) => framedHood(s) && blades(4)(s) },
    { cue: 'tall fin', check: (s) => s.tail.finHeight >= 1.8 },
  ]),
};

// Propeller aircraft checks.
const engineCount = (s: Air) => s.props?.length || (s.engines?.kind === 'wing-props' ? s.engines.count : s.engines?.kind === 'nose-prop' ? 1 : 0);
const engines = (n: number) => (s: Air) => engineCount(s) === n;
const lowWing = (s: Air) => (s.wing.mount ?? 0) < 0;
const highWing = (s: Air) => (s.wing.mount ?? 0) > 0.4;
/** A biplane's upper wing: `upperWing`, or a wide body on the centre line above the lower one. */
const biplane = (s: Air) => !!s.upperWing || bodiesOf(s).some((b) => !b.side && halfWidth(b) >= s.span * 0.35 && lowest(b) > 0);
/** Wheels that stay down: `fixedGear`, or wheel bodies hanging well under the body. */
const fixedWheels = (s: Air) => !!s.fixedGear || bodiesOf(s).some((b) => out(b) >= 0.4 && out(b) <= s.span * 0.25 && lowest(b) < bottomAt(s, front(b)) - 0.5);
const floatGear = (s: Air) => !!s.floats || bodiesOf(s).some((b) => lowest(b) < bottomAt(s, 0) - 0.8 && front(b) - back(b) >= s.length * 0.4);
/** An elliptical wing: round tips, the chord at half span still over eight tenths of the root's. */
const elliptic = (s: Air) => roundTips(s) && chordAt(s, planSpan(s) * 0.5) >= 0.8 * chordAt(s, 0.05);
/** A true gull: the inner panels climbing steeply, the outer ones bent to a gentler dihedral. */
const trueGull = (s: Air) => !!s.wing.outerDihedral && dihedral(s) >= 10 && s.wing.outerDihedral.deg < dihedral(s) / 2;
/** An inverted gull: the inner panels drooping, the outer ones climbing (or the builder's gull). */
const invGull = (s: Air) => !!s.wing.gull || (!!s.wing.outerDihedral && dihedral(s) < 0 && s.wing.outerDihedral.deg > 0);
const hTail = (s: Air) => s.tail.kind === 'h';
const hoodAft = (k: number) => (s: Air) => (noseX(s) - glassFront(s)) / s.length >= k;
const longHood = (m: number) => (s: Air) => (s.glass ?? []).some((g) => front(g) - back(g) >= m) || (s.canopy?.length ?? 0) >= m;
const nacellesAhead = (s: Air) => bodiesOf(s).some((b) => out(b) >= 1 && front(b) >= noseX(s) - 0.6);
const finTop = (s: Air) => Math.max(s.tail.finHeight, ...(s.finPlan ?? []).map((p) => p[1]));

type C = Cue<Air>;
const radialN = (n: number): C => ({ cue: `radial cowl, ${n}-bladed propeller`, check: (s) => radial(s) && blades(n)(s) });
const inlineN = (n: number): C => ({ cue: `slim inline nose, ${n}-bladed propeller`, check: (s) => inline(s) && blades(n)(s) });
const BUBBLE: C = { cue: 'bubble canopy', check: bubbleHood };
const FRAMED: C = { cue: 'framed canopy', check: framedHood };
const LOW: C = { cue: 'low wing with dihedral', check: (s) => lowWing(s) && dihedral(s) >= 3 };
const RADIALS2: C = { cue: 'two radials in nacelles on the wing', check: (s) => twinProps(s) && radial(s) };
const INLINES2: C = { cue: 'two inline engines in nacelles on the wing', check: (s) => twinProps(s) && !radial(s) };
const FOUR: C = { cue: 'four engines on the wing', check: engines(4) };
const THREE: C = { cue: 'three engines, one in the nose', check: engines(3) };
const GLASS_NOSE: C = { cue: 'glazed nose', check: glazedNose };
const SOLID_NOSE: C = { cue: 'solid nose', check: (s) => !glazedNose(s) };
const FIN: C = { cue: 'single fin', check: singleFin };
const TWIN_FINS: C = { cue: 'twin fins on the tailplane tips', check: hTail };
const BIPLANE: C = { cue: 'biplane wings joined by struts', check: biplane };
const FIXED: C = { cue: 'fixed main wheels', check: fixedWheels };
const OPEN: C = { cue: 'open cockpit', check: (s) => !s.glass };
const ELLIPTIC: C = { cue: 'elliptical wing', check: elliptic };
const UNDER_RADS: C = { cue: 'radiators under both wings', check: underwingRads };
const BELLY: C = { cue: 'radiator bath under the body', check: (s) => bodiesOf(s).some((b) => !b.side && highest(b) < 0) || bellyBath(1.5, -2.5)(s) };
const FLOATS: C = { cue: 'floats under the wing or body', check: floatGear };
const fighter = (eng: C, hood: C, ...more: C[]): C[] => [eng, hood, LOW, ...more];

const PROP_CUES: Record<string, CueEntry> = {
  // Single-engined fighters.
  spitfires: air(['spitfire-mk-v', 'spitfire-mk-ix', 'spitfire-mk-xiv'], [ELLIPTIC, UNDER_RADS, { cue: 'slim pointed inline nose', check: inline }]),
  'spitfire-mk-v': air('spitfire-mk-v', [inlineN(3), FRAMED]),
  'spitfire-mk-ix': air('spitfire-mk-ix', [inlineN(4), FRAMED, { cue: 'longer Merlin 60 nose than the Mk V', check: (s) => s.length >= 9.4 }]),
  'spitfire-mk-xiv': air('spitfire-mk-xiv', [inlineN(5), BUBBLE, { cue: 'long Griffon nose', check: (s) => s.length >= 9.9 }]),
  'a6m-zero': air('a6m-zero', [...fighter(radialN(3), FRAMED), { cue: 'long greenhouse canopy', check: longHood(2.2) }, { cue: 'round wing tips', check: roundTips }]),
  'p-36': air('p-36', fighter(radialN(3), FRAMED, { cue: 'razorback behind the canopy', check: (s) => !bubbleHood(s) })),
  'il-2': air(['il-2', 'il-2-1941'], [inlineN(3), FRAMED, { cue: 'deep armoured nose', check: (s) => depthAt(s, noseX(s) - 1.6) >= 1.0 }, { cue: 'swept outer wing leading edge', check: (s) => leSweep(s) >= 4 }]),
  'lagg-3': air('lagg-3', fighter(inlineN(3), FRAMED, BELLY)),
  'ki-61': air(['ki-61', 'ki-61-ii'], fighter(inlineN(3), FRAMED, BELLY, { cue: 'long slender wing', check: (s) => s.span / s.length >= 1.28 })),
  're-2000': air('re-2000', fighter(radialN(3), FRAMED, { cue: 'short barrel body', check: (s) => s.length / s.span < 0.75 })),
  'yak-3': air('yak-3', fighter(inlineN(3), BUBBLE, BELLY, { cue: 'small short wing', check: (s) => s.span <= 9.3 })),
  'bf-109-g6': air(['bf-109-g6', 'bf-109-k4'], [inlineN(3), UNDER_RADS, LOW, { cue: 'gun-cover bulges ahead of the cockpit', check: (s) => bodiesOf(s).some((b) => out(b) > 0 && out(b) < 0.6 && front(b) > glassFront(s) && lowest(b) > 0) }]),
  'bf-109-g6-hood': air('bf-109-g6', [FRAMED]),
  'bf-109-k4-hood': air('bf-109-k4', [{ cue: 'clear-view Erla hood', check: bubbleHood }]),
  'bf-109-b': air('bf-109-b', fighter(inlineN(2), FRAMED)),
  'mig-3': air('mig-3', fighter(inlineN(3), FRAMED, { cue: 'very long nose, the cockpit far back', check: hoodAft(0.3) })),
  'p-51b': air('p-51b', fighter(inlineN(4), FRAMED, { cue: 'belly radiator scoop behind the wing', check: (s) => bodiesOf(s).some((b) => !b.side && highest(b) < 0) || bellyBath(1.0, -1.5)(s) })),
  'f6f-hellcat': air('f6f-hellcat', fighter(radialN(3), FRAMED, { cue: 'deep body, the cowl drooping under the spinner', check: deepBody(0.12) })),
  j2m: air('j2m', fighter(radialN(4), FRAMED, { cue: 'fat short body behind the big radial', check: (s) => s.length / s.span >= 0.85 })),
  'ki-44': air('ki-44', fighter(radialN(3), BUBBLE, { cue: 'short wing', check: (s) => s.span < 10 })),
  'ki-84': air('ki-84', fighter(radialN(4), BUBBLE)),
  'p-47d-razorback': air('p-47d-razorback', fighter(radialN(4), FRAMED, { cue: 'deep oval body', check: deepBody(0.14) }, { cue: 'razorback spine to the fin', check: (s) => !bubbleHood(s) })),
  'p-47n': air('p-47n', fighter(radialN(4), BUBBLE, { cue: 'deep oval body', check: deepBody(0.14) })),
  'fw-190-d9': air(['fw-190-d9', 'ta-152h'], [{ cue: 'annular radiator: an inline that looks like a radial', check: radial }, BUBBLE, LOW, { cue: 'long nose and stretched tail', check: (s) => s.length >= 10 }]),
  'ta-152h': air('ta-152h', [{ cue: 'very long wing', check: (s) => s.span >= 14 }]),
  'la-5': air('la-5', fighter(radialN(3), FRAMED)),
  'la-11': air('la-11', fighter(radialN(3), BUBBLE)),
  'ki-43': air('ki-43', fighter(radialN(3), BUBBLE)),
  'ki-43-i': air('ki-43-i', fighter(radialN(2), BUBBLE)),
  'ki-100': air('ki-100', fighter(radialN(3), BUBBLE)),
  'mc-200': air('mc-200', fighter(radialN(3), BUBBLE)),
  'mc-202': air(['mc-202', 'mc-205'], fighter(inlineN(3), FRAMED)),
  'g-50': air('g-50', fighter(radialN(3), BUBBLE)),
  'g-55': air('g-55', fighter(inlineN(3), FRAMED)),
  're-2001': air(['re-2001', 're-2005'], fighter(inlineN(3), FRAMED)),
  'i-185': air('i-185', fighter(radialN(3), FRAMED)),
  'd-520': air('d-520', fighter(inlineN(3), FRAMED)),
  'ms-406': air(['ms-406', 'ms-410'], fighter(inlineN(3), FRAMED)),
  typhoon: air('typhoon', fighter(inlineN(4), BUBBLE, { cue: 'deep chin radiator', check: (s) => depthAt(s, noseX(s) - 1.3) >= 1.2 })),
  'tempest-v': air('tempest-v', fighter(inlineN(4), BUBBLE, { cue: 'deep chin radiator', check: (s) => depthAt(s, noseX(s) - 1.3) >= 1.2 })),
  'f4f-wildcat': air('f4f-wildcat', [radialN(3), FRAMED, { cue: 'mid wing on a stubby barrel body', check: (s) => (s.wing.mount ?? -1) > -0.3 && s.length / s.span < 0.8 }]),
  n1k2: air('n1k2', [radialN(4), FRAMED, { cue: 'low-mid wing', check: (s) => (s.wing.mount ?? -1) > -0.3 }]),
  a7m: air('a7m', fighter(radialN(4), BUBBLE)),
  'sea-fury': air('sea-fury', fighter(radialN(5), BUBBLE, ELLIPTIC)),
  'iar-80': air('iar-80', fighter(radialN(3), BUBBLE)),
  'ffvs-j22': air('ffvs-j22', fighter(radialN(3), FRAMED)),
  'p-43': air(['p-43', 'p-35'], fighter(radialN(3), FRAMED)),
  'cw-21': air('cw-21', fighter(radialN(3), FRAMED)),
  myrsky: air('myrsky', fighter(radialN(3), FRAMED)),
  'mb-152': air(['mb-152', 'mb-157'], fighter(radialN(3), FRAMED)),
  'he-100': air('he-100', fighter(inlineN(3), FRAMED)),
  'vg-33': air(['vg-33', 'itp', 's-199'], fighter(inlineN(3), FRAMED)),
  'cr-714': air('cr-714', fighter(inlineN(2), FRAMED)),
  'yak-1b': air('yak-1b', fighter(inlineN(3), BUBBLE)),
  firefly: air(['firefly', 'firefly-mk4'], [{ cue: 'long two-seat canopy', check: tandemHood }, LOW, { cue: 'Griffon inline nose', check: inline }]),
  'p-26': air('p-26', [radialN(2), FIXED, { cue: 'wire-braced low wing', check: lowWing }]),
  'ki-27': air(['ki-27', 'a5m'], [radialN(2), FIXED, LOW]),
  'fokker-d21': air('fokker-d21', [radialN(3), FIXED, LOW]),
  'd-510': air('d-510', [inlineN(3), FIXED, LOW]),
  // Biplanes.
  biplanes: air(['gladiator', 'cr-42', 'cr-32', 'he-51', 'i-153', 'i-15', 'i-15bis', 'ki-10', 'f3f', 'bf2c', 'hs-123', 'swordfish', 'u-2-po-2', 'j6b', 'fokker-d7', 'spad-13'], [BIPLANE]),
  gladiator: air('gladiator', [radialN(3), { cue: 'enclosed sliding hood', check: framedHood }, FIXED, { cue: 'single-bay wings of equal span', check: (s) => planSpan(s) >= s.span * 0.45 }]),
  'cr-42': air('cr-42', [radialN(2), OPEN, { cue: 'spatted main wheels', check: fixedWheels }, { cue: 'lower wing much shorter than the upper', check: (s) => planSpan(s) <= s.span * 0.36 }]),
  'cr-32': air('cr-32', [inlineN(2), OPEN, FIXED]),
  'he-51': air('he-51', [inlineN(2), OPEN, FIXED, { cue: 'two-bay wings', check: (s) => bodiesOf(s).filter((b) => halfWidth(b) <= 0.04 && out(b) > 1).length >= 4 }]),
  'i-153': air('i-153', [radialN(2), OPEN, { cue: 'retracting main wheels', check: (s) => !fixedWheels(s) }, { cue: 'gull upper wing (Chaika)', modelled: false, note: 'the upper wing is drawn straight' }]),
  'i-15': air(['i-15', 'i-15bis'], [radialN(2), OPEN, FIXED]),
  'ki-10': air('ki-10', [inlineN(2), OPEN, FIXED]),
  f3f: air(['f3f', 'bf2c'], [radialN(2), { cue: 'enclosed hood', check: framedHood }, { cue: 'retracting main wheels', check: (s) => !fixedWheels(s) }]),
  'hs-123': air('hs-123', [radialN(2), OPEN, FIXED, { cue: 'sesquiplane: the lower wing narrow and short', check: (s) => planSpan(s) <= s.span * 0.4 }]),
  swordfish: air('swordfish', [radialN(3), { cue: 'big two-bay biplane, open cockpits', check: (s) => s.span >= 13.5 && !s.glass }, FIXED]),
  // Two-seat and naval attack aircraft.
  'sb2c-helldiver': air('sb2c-helldiver', [radialN(4), { cue: 'long two-seat greenhouse', check: longHood(2.5) }, { cue: 'big square-cut fin', check: (s) => finTop(s) >= 1.6 }]),
  'ju-87': air(['ju-87-b', 'ju-87-g', 'ju-87-d5'], [{ cue: 'inverted gull wing', check: invGull }, { cue: 'fixed main wheels in spats', check: fixedWheels }, { cue: 'long framed two-seat greenhouse', check: longHood(2.5) }, inlineN(3)]),
  'ju-87-g': air('ju-87-g', [{ cue: 'two 37 mm gun pods under the wings', check: (s) => bodiesOf(s).some((b) => out(b) >= 1.5 && highest(b) < 0) }]),
  b7a: air('b7a', [radialN(4), { cue: 'inverted gull wing', check: invGull }, { cue: 'long greenhouse', check: longHood(2.5) }]),
  firecrest: air('firecrest', [radialN(5), { cue: 'inverted gull wing', check: invGull }, BUBBLE]),
  b6n: air('b6n', [radialN(4), { cue: 'long three-seat greenhouse', check: longHood(2.5) }, LOW]),
  d4y: air('d4y', [inlineN(3), { cue: 'long two-seat greenhouse', check: longHood(2.5) }, LOW]),
  sb2u: air(['sb2u', 'sbd-dauntless', 'tbd-1', 'tbf-avenger', 'b5n-kate'], [{ cue: 'radial cowl', check: radial }, { cue: 'long greenhouse', check: longHood(2.5) }, LOW]),
  'd3a-val': air('d3a-val', [radialN(3), FIXED, { cue: 'long greenhouse', check: longHood(2.5) }]),
  'ki-32': air('ki-32', [inlineN(3), FIXED]),
  'saab-17': air('saab-17', [radialN(3), { cue: 'big fixed main-wheel fairings', check: fixedWheels }]),
  'saab-17bs': air('saab-17bs', [radialN(3), FLOATS]),
  'ar-196': air('ar-196', [radialN(3), FLOATS, { cue: 'long greenhouse', check: longHood(2.5) }]),
  os2u: air('os2u', [radialN(2), FLOATS]),
  n1k1: air('n1k1', [radialN(3), FLOATS]),
  'il-10': air('il-10', [inlineN(4), FRAMED, { cue: 'deep armoured nose', check: (s) => depthAt(s, noseX(s) - 1.6) >= 1.0 }]),
  'su-6': air(['su-6', 'su-6-2'], [radialN(4), FRAMED, LOW]),
  'su-6-am42': air('su-6-am42', [inlineN(4), FRAMED, LOW]),
  'ba-65': air('ba-65', [radialN(3), FRAMED, LOW]),
  // Twin-engined fighters.
  'p-38j': air('p-38j', [{ cue: 'twin booms from the engine nacelles', check: (s) => !!s.booms || s.tail.kind === 'twin' }, { cue: 'short central nacelle', check: (s) => tailX(s) > -s.length / 2 + 2 }, { cue: 'tailplane joining the booms', check: (s) => s.tail.tailSpan >= 4 }]),
  'mosquito-fb': air(['mosquito-fb', 'mosquito'], [INLINES2, FIN, { cue: 'shoulder wing', check: (s) => (s.wing.mount ?? 0) > 0 }]),
  'mosquito-fb-nose': air('mosquito-fb', [SOLID_NOSE]),
  'mosquito-nose': air('mosquito', [GLASS_NOSE]),
  'ki-45': air('ki-45', [RADIALS2, FIN, SOLID_NOSE, { cue: 'long two-seat greenhouse', check: longHood(2.5) }]),
  beaufighter: air('beaufighter', [RADIALS2, FIN, { cue: 'big Hercules nacelles level with the stubby nose', check: nacellesAhead }]),
  'bf-110': air(['bf-110', 'bf-110g'], [INLINES2, TWIN_FINS, { cue: 'long greenhouse', check: longHood(2) }]),
  f7f: air('f7f', [RADIALS2, FIN, SOLID_NOSE]),
  'potez-63': air('potez-63', [RADIALS2, TWIN_FINS, { cue: 'long greenhouse', check: longHood(3) }]),
  whirlwind: air('whirlwind', [INLINES2, { cue: 'tailplane high on the fin', check: (s) => (s.tail.planeUp ?? 0) >= 1.2 }]),
  'do-335': air('do-335', [{ cue: 'push-pull: propellers at nose and tail', check: (s) => (s.props ?? []).some((p) => p.x < -s.length / 2 + 0.5) }, { cue: 'cruciform tail', check: (s) => (s.finPlan ?? []).some((p) => p[1] < -1) }]),
  // Twin-engined bombers.
  'do-217': air('do-217', [RADIALS2, GLASS_NOSE, TWIN_FINS, { cue: 'shoulder wing on a slim pencil body', check: (s) => (s.wing.mount ?? 0) > 0.3 }]),
  'pe-2': air('pe-2', [INLINES2, GLASS_NOSE, TWIN_FINS, LOW]),
  'sb-2': air('sb-2', [INLINES2, GLASS_NOSE, FIN]),
  'b-25': air(['b-25', 'b-25h'], [RADIALS2, TWIN_FINS, { cue: 'mid wing', check: (s) => (s.wing.mount ?? 0) > 0.3 }, { cue: 'wing nearly flat beyond the nacelles (the slight gull)', check: (s) => dihedral(s) < 2 }]),
  'b-25-nose': air('b-25', [GLASS_NOSE]),
  'b-25h-nose': air('b-25h', [SOLID_NOSE]),
  'er-2': air('er-2', [INLINES2, GLASS_NOSE, TWIN_FINS, { cue: 'inverted gull wing, the engines at the low bend', check: invGull }]),
  'ju-88': air('ju-88', [RADIALS2, { cue: 'bug-eye glazed cockpit at the nose', check: glazedNose }, FIN, { cue: 'gondola under the nose', check: (s) => bodiesOf(s).some((b) => !b.side && highest(b) < 0) || bump(s.fuselage?.bottom, noseX(s) - 1, noseX(s) - 5, -1) }]),
  'ju-88c': air('ju-88c', [RADIALS2, SOLID_NOSE, FIN]),
  'a-20g': air('a-20g', [RADIALS2, SOLID_NOSE, FIN, { cue: 'shoulder wing', check: (s) => (s.wing.mount ?? 0) > 0.3 }]),
  'he-111': air('he-111', [INLINES2, { cue: 'stepless glazed nose', check: glazedNose }, FIN, LOW]),
  'il-4': air('il-4', [RADIALS2, { cue: 'long pointed glazed nose', check: glazedNose }, FIN]),
  'ki-49': air('ki-49', [RADIALS2, GLASS_NOSE, FIN]),
  'ki-21': air('ki-21', [RADIALS2, GLASS_NOSE, FIN, { cue: 'long stepped canopy', check: longHood(2.4) }]),
  'ki-67': air('ki-67', [RADIALS2, GLASS_NOSE, FIN, { cue: 'tall fin with a long dorsal fillet', check: (s) => finTop(s) >= 2.5 }]),
  p1y1: air('p1y1', [RADIALS2, GLASS_NOSE, FIN]),
  'g4m-betty': air('g4m-betty', [RADIALS2, GLASS_NOSE, FIN, { cue: 'fat cigar body', check: deepBody(0.1) }]),
  'b-26-marauder': air('b-26-marauder', [RADIALS2, GLASS_NOSE, FIN, { cue: 'round cigar body', check: (s) => s.bodyWidth >= 1.4 }]),
  'pv-2': air(['pv-2', 'b-34'], [RADIALS2, TWIN_FINS]),
  beaufort: air('beaufort', [RADIALS2, GLASS_NOSE, { cue: 'dorsal turret amidships behind the wing', check: (s) => bump(s.fuselage?.top, 0.4, -0.9, 1, 0.15) }, { cue: 'nacelles slung low under a wing of strong dihedral', check: (s) => dihedral(s) >= 6 }]),
  hudson: air('hudson', [RADIALS2, GLASS_NOSE, { cue: 'twin oval fins set inboard on the tailplane', check: hTail }, { cue: 'dorsal turret well aft', check: (s) => bump(s.fuselage?.top, -2.8, -4.2, 1, 0.3) }]),
  hampden: air('hampden', [RADIALS2, TWIN_FINS, GLASS_NOSE, { cue: 'deep narrow forward body, slim tail boom', check: (s) => depthAt(s, noseX(s) - 3) >= 2 * depthAt(s, tailX(s) + 3) }]),
  wellington: air('wellington', [RADIALS2, FIN, { cue: 'high-aspect wing with dihedral', check: (s) => s.span / s.length >= 1.3 && dihedral(s) >= 2 }]),
  'hs-129': air(['hs-129', 'hs-129b-3'], [RADIALS2, FIN, { cue: 'the cockpit far forward in a small body', check: hoodAft(0) }]),
  'leo-451': air(['leo-451', 'br-20', 'ju-86', 'mb-174'], [RADIALS2, TWIN_FINS, GLASS_NOSE]),
  maryland: air(['maryland', 'b-10', 'ki-48'], [RADIALS2, FIN, GLASS_NOSE]),
  'fw-189': air('fw-189', [{ cue: 'twin booms', check: (s) => hTail(s) || !!s.booms }, { cue: 'glazed central nacelle', check: glazedNose }, { cue: 'two small inline engines', check: (s) => twinProps(s) && !radial(s) }]),
  'saab-b18': air(['saab-b18a', 'saab-b18b'], [GLASS_NOSE, { cue: 'twin fins', check: (s) => s.tail.kind === 'h' || s.tail.kind === 'twin' }]),
  'saab-b18a': air('saab-b18a', [RADIALS2]),
  'saab-b18b': air('saab-b18b', [INLINES2]),
  // Four-engined bombers, trimotors and flying boats.
  'b-29': air('b-29', [FOUR, { cue: 'radials on a long, slender wing', check: (s) => radial(s) && s.span / s.length >= 1.35 }, { cue: 'glazed round nose without a step', check: glazedNose }, FIN]),
  'b-17': air(['b-17g', 'b-17e'], [FOUR, FIN, { cue: 'big fin with a long dorsal fillet', check: (s) => finTop(s) >= 3 }]),
  lancaster: air(['lancaster', 'halifax'], [FOUR, TWIN_FINS]),
  'lancaster-nose': air('lancaster', [{ cue: 'nose turret over the bomb-aimer blister', modelled: false, note: 'the nose is drawn solid' }]),
  halifax: air(['halifax', 'stirling'], [GLASS_NOSE]),
  stirling: air('stirling', [FOUR, FIN, { cue: 'very tall stance, the fin high', check: (s) => finTop(s) >= 3 }]),
  'b-24': air(['b-24', 'p-108', 'g5n', 'me-264'], [FOUR, GLASS_NOSE]),
  'pb4y-2-privateer': air('pb4y-2-privateer', [FOUR, FIN, { cue: 'radial cowls', check: radial }, { cue: 'tall single fin', check: (s) => finTop(s) >= 3.5 }]),
  'sm-79': air(['sm-79', 's-81'], [THREE, { cue: 'radial cowls', check: radial }, FIN]),
  'sm-79-hump': air('sm-79', [{ cue: 'hunchback fairing behind the cockpit', check: (s) => Math.max(...(s.fuselage?.top ?? []).map((p) => p[1])) - topAt(s, noseX(s) - 1) >= 0.4 }]),
  'z-1007': air('z-1007', [THREE, TWIN_FINS]),
  'ju-52': air('ju-52', [THREE, FIXED]),
  h8k: air(['h8k', 'sunderland'], [FOUR, { cue: 'deep flying-boat hull', check: deepBody(0.12) }, { cue: 'high wing', check: highWing }]),
  'be-6': air('be-6', [{ cue: 'gull wing, the engines at its bend', check: trueGull }, RADIALS2, TWIN_FINS]),
};

// Checks for the remaining ground figures of all nations.
const cal = (lo: number, hi = 1) => (s: GroundSpec) => (mainGun(s)?.calibre ?? 0) >= lo && (mainGun(s)?.calibre ?? 0) < hi;
const gunLen = (lo: number, hi = 99) => (s: GroundSpec) => (mainGun(s)?.length ?? 0) >= lo && (mainGun(s)?.length ?? 0) < hi;
const run = (w: number, r?: number) => (s: GroundSpec) => wheels(s) === w && (r === undefined || rollers(s) === r);
const axles = (n: number) => (s: GroundSpec) => s.axles === n;
/** No traversing turret: the gun in a fixed casemate or behind a shield (the spec's turret only a mantlet). */
const casemate = (s: GroundSpec) => !s.turret || s.turret.length < 0.8;
/** Open above: an open turret, an open part, an open-topped compartment. */
const openAbove = (s: GroundSpec) => openTurret(s) || openPart(s) || s.turret?.shape === 'open' || !!s.openTop;
/** Barrels: the guns times their count (both sides doubled: turret-side guns always are), and barrels drawn as add-on tubes. */
const barrels = (s: GroundSpec) =>
  (s.guns ?? []).reduce((a, g) => a + (g.count ?? 1) * (g.both || g.mount === 'turret-side' ? 2 : 1), 0) + (s.addOns ?? []).filter((a) => a.kind === 'tube').reduce((a, t) => a + (t.mirror ? 2 : 1), 0);
const guns = (n: number) => (s: GroundSpec) => barrels(s) >= n;
const hullGun = (s: GroundSpec) => !!s.guns?.some((g) => g.mount === 'hull' || g.mount === 'sponson');
const radar = (s: GroundSpec) => !!s.radars?.length;
const rockets = (s: GroundSpec) => !!s.missiles?.length;
/** A missile on its rail or a launcher box: the spec's missiles, or a long slim box added on. */
const launcher = (s: GroundSpec) => rockets(s) || (s.addOns ?? []).some((a) => a.kind === 'box' && a.size[0] >= 0.8 && a.size[0] >= 2 * a.size[1]);
/** Open walls drawn as plates round a dark floor. */
const slabWalls = (s: GroundSpec) => (s.addOns ?? []).filter((a) => a.kind === 'slab').length >= 3;
/** The turret's centre forward of the hull's middle by at least `lo` (negative: set back). */
const turretAt = (lo: number, hi = 9) => (s: GroundSpec) => (s.turret?.x ?? 0) >= lo && (s.turret?.x ?? 0) < hi;
/** The turret off the centre line, to the right (1) or the left (-1). */
const turretOff = (sign: 1 | -1) => (s: GroundSpec) => sign * (s.turret?.side ?? 0) > 0.1;
const skirted = (s: GroundSpec) => !!s.skirts || hullSkirts(s);
/** A cast hull: drawn smooth from its outline. */
const castHull = (s: GroundSpec) => typeof s.hullOutline?.round === 'number' && s.hullOutline.round < 5;
/** Tracks run round the hull (or under skirts) with no road wheels drawn. */
const wrapTracks = (s: GroundSpec) => s.chassis === 'tracked' && !s.running && !s.roadWheels;
const lorry = (n: number) => (s: GroundSpec) => s.chassis === 'wheeled' && s.axles === n;
const cupolaAny = (s: GroundSpec) => !!s.cupola || cupolaOf(0.1, 0.6)(s) || partTop(s) > s.hullHeight + (s.turret?.height ?? 0) + 0.1;
const tall = (h: number) => (s: GroundSpec) => s.hullHeight >= h;
const low = (h: number) => (s: GroundSpec) => s.hullHeight <= h;
const turretH = (h: number) => (s: GroundSpec) => (s.turret?.height ?? 0) >= h;
const turretL = (l: number) => (s: GroundSpec) => (s.turret?.length ?? 0) >= l;

const SHERMAN: Cue<GroundSpec>[] = [
  { cue: 'three VVSS bogies a side, the return roller on top of each', check: run(6) },
  { cue: 'tall hull with a sloped glacis and the transmission cover at the nose', check: (s) => hullShape(s) && tall(1.8)(s) },
];
const T34: Cue<GroundSpec>[] = [
  { cue: 'five large Christie road wheels a side, no return rollers', check: run(5, 0) },
  { cue: 'sharply sloped glacis and upper hull sides', check: lean(0.5) },
];
const KV: Cue<GroundSpec>[] = [
  { cue: 'small road wheels on torsion bars, three return rollers', check: (s) => wheels(s) >= 6 && rollers(s) === 3 },
  { cue: 'long slab-sided hull with wide tracks', check: (s) => hullShape(s) && (s.trackWidth ?? 0) >= 0.65 },
];
const ISU: Cue<GroundSpec>[] = [
  { cue: 'tall casemate on the IS hull, the gun offset to the right', check: (s) => casemate(s) && turretOff(1)(s) },
  { cue: 'six road wheels, three return rollers', check: run(6, 3) },
];
const SU_T34: Cue<GroundSpec>[] = [
  { cue: 'T-34 hull with a casemate, no turret', check: (s) => casemate(s) && lean(0.5)(s) },
  { cue: 'five large Christie road wheels a side', check: run(5, 0) },
];
const CHI_HA_RUN: Cue<GroundSpec>[] = [{ cue: 'six road wheels in bell-crank pairs, four return rollers', check: run(6, 4) }];
const VALENTINE: Cue<GroundSpec>[] = [
  { cue: 'six road wheels: two large and four small in two bogies, three return rollers', check: run(6, 3) },
  { cue: 'low narrow hull with the engine deck stepping down', check: (s) => hullShape(s) && s.hullHeight <= 1.65 },
];
const CHURCHILL: Cue<GroundSpec>[] = [
  { cue: 'long tracks run over the hull, the small bogies behind panniers', check: wrapTracks },
  { cue: 'long box hull over seven metres', check: (s) => s.length > 7 },
];
const M41_HULL: Cue<GroundSpec>[] = [{ cue: 'M41 running gear: five road wheels, three return rollers', check: run(5, 3) }];
const ITALIAN_M: Cue<GroundSpec>[] = [{ cue: 'eight small road wheels in two leaf-sprung bogies, three return rollers', check: run(8, 3) }];
const STRV_M41: Cue<GroundSpec>[] = [{ cue: 'four large road wheels a side, two return rollers (Pz 38(t) type)', check: run(4, 2) }];
const M6: Cue<GroundSpec>[] = [
  { cue: 'eight road wheels in paired bogies, four return rollers', check: run(8, 4) },
  { cue: 'very tall hull with twin machine guns in the bow', check: (s) => tall(2)(s) && hullGun(s) },
];
const CCKW: Cue<GroundSpec>[] = [{ cue: 'GMC CCKW six-wheeled lorry with a bonneted cab', check: lorry(3) }];
const M109: Cue<GroundSpec>[] = [
  { cue: 'seven road wheels a side, no return rollers', check: run(7, 0) },
  { cue: 'huge box turret over the rear half', check: (s) => turretAt(-9, -0.5)(s) && turretH(1.4)(s) },
  { cue: '155 mm with a muzzle brake', check: (s) => muzzle(s) && cal(0.15)(s) },
];
const SEMOVENTE: Cue<GroundSpec>[] = [{ cue: 'low casemate on the M13/M15 chassis, no turret', check: casemate }];
const CHI_HA_TURRET: Cue<GroundSpec>[] = [{ cue: 'turret offset to the right of the centre line', check: turretOff(1) }];

// Catalogue pass (remaining ground figures): a few more spec probes.
const chassisIs = (c: GroundSpec['chassis']) => (s: GroundSpec) => s.chassis === c;
const adds = (kind: string, n = 1, on?: 'turret' | 'hull') => (s: GroundSpec) => (s.addOns ?? []).filter((a) => a.kind === kind && (!on || a.on === on)).length >= n;
const evacuator = (s: GroundSpec) => !!mainGun(s)?.extractor;
const sleeved = (s: GroundSpec) => !!mainGun(s)?.sleeve;
const noTurret = (s: GroundSpec) => !s.turret;
const angular = (s: GroundSpec) => typeof s.turret?.outline?.round === 'number' && s.turret.outline.round >= 5;
const longHull = (l: number) => (s: GroundSpec) => s.length >= l;
const shortHull = (l: number) => (s: GroundSpec) => s.length < l;
const wideHull = (w: number) => (s: GroundSpec) => s.width >= w;
const cabbed = (s: GroundSpec) => !!s.cab;
const outrig = (s: GroundSpec) => !!s.outriggers;
/** Missile rounds drawn: rows times columns, both sides on a turret-side mount. */
const rounds = (n: number) => (s: GroundSpec) => (s.missiles ?? []).reduce((t, m) => t + m.rows * m.cols * (m.mount === 'turret-side' ? 2 : 1), 0) >= n;
const longRod = (min: number) => (s: GroundSpec) => (s.addOns ?? []).some((a) => a.kind === 'tube' && !!a.to && Math.hypot(a.to[0] - a.at[0], a.to[1] - a.at[1], a.to[2] - a.at[2]) >= min);
const shortTurret = (l: number) => (s: GroundSpec) => !!s.turret && s.turret.length < l;
/** An arrow-head turret front: the plan narrows to under a third of its width and the roof drops toward the nose. */
const wedgeTurret = (s: GroundSpec) => {
  const o = s.turret?.outline;
  if (!o) return false;
  const nose = o.plan.reduce((a, p) => (p[0] > a[0] ? p : a));
  const roof = Math.max(...o.top.map((p) => p[1]));
  const top = o.top.reduce((a, p) => (p[0] > a[0] ? p : a));
  return nose[1] <= halfWidth(o) / 3 && top[1] <= roof * 0.6;
};

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
  'flak-36-88mm-emplaced': ground('flak-36-88mm-emplaced', [
    { cue: 'the 88 on its cruciform platform with its shield', check: (s) => s.chassis === 'pedestal' && (mainGun(s)?.length ?? 0) > 4.5 && partsOf(s).some((t) => t.width >= 2 && t.length <= 0.1) },
    { cue: 'in a round pit behind an earth parapet', check: (s) => (s.addOns ?? []).filter((a) => a.on === 'hull' && a.kind === 'box').length >= 16 },
  ]),
  'flak-43-37mm': ground(['flak-43-37mm', 'flak-43-37mm-emplaced'], [
    { cue: 'low pedestal mount on a triangular platform with three jacks', check: (s) => s.chassis === 'pedestal' && (s.addOns ?? []).some((a) => a.kind === 'slab' && a.plane === 'plan' && a.poly?.length === 3) },
    { cue: 'broad gun shield', check: (s) => partsOf(s).some((t) => t.width >= 1.5 && t.length <= 0.1) },
    { cue: 'long 37 mm with a conical flash hider', check: (s) => muzzle(s) && cal(0.037, 0.04)(s) && gunLen(2.5)(s) },
    { cue: 'clip tray on the left of the gun', check: (s) => (s.addOns ?? []).some((a) => a.on === 'turret' && a.at[1] < 0) },
  ]),
  'flak-43-37mm-emplaced': ground('flak-43-37mm-emplaced', [{ cue: 'in a round pit behind an earth parapet', check: (s) => (s.addOns ?? []).filter((a) => a.on === 'hull' && a.kind === 'box').length >= 16 }]),
  'flak-36-88mm': ground('flak-36-88mm', [
    { cue: 'cruciform platform with four outriggers', check: (s) => s.chassis === 'pedestal' && !s.bare },
    { cue: 'tall gun shield', check: (s) => partsOf(s).some((t) => t.width >= 2 && t.length <= 0.1) },
    { cue: 'very long 88 mm barrel', check: (s) => (mainGun(s)?.length ?? 0) > 4.5 },
    { cue: 'gun on a central pedestal', check: (s) => s.chassis === 'pedestal' },
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
  ...AIR_CUES,
  ...PROP_CUES,
  ...NAVAL_CUES,
  ...HELI_CUES,
  ...JET_CUES,
  ...MORE_AIR_CUES,

  // The remaining ground figures, all nations: families first, then each figure in replay rank order.
  shermans: ground(['m4a1-sherman', 'm4a4-sherman', 'm4a1-76', 'm4a2-76', 'm4a3e2-76', 'm4a3e2-jumbo', 'm4a4-firefly', 'm4a4-cn-75-50', 'm4-t26'], SHERMAN),
  't-34s': ground(['t-34-1940', 't-34-1941', 't-34-76', 't-34-100'], T34),
  kvs: ground(['kv-1', 'kv-2', 'kv-1s', 'kv-85', 'kv-8', 'kv-220'], KV),
  isus: ground(['isu-122', 'isu-122s', 'isu-152'], ISU),
  'su-t34s': ground(['su-85', 'su-100', 'su-122'], SU_T34),
  'chi-ha-running': ground(['type-97-chi-ha', 'type-97-chi-ha-kai', 'type-1-chi-he', 'type-3-chi-nu', 'ho-i', 'ho-ni-i', 'ho-ni-iii', 'ho-ro'], CHI_HA_RUN),
  'chi-ha-turret': ground(['type-97-chi-ha', 'type-97-chi-ha-kai'], CHI_HA_TURRET),
  valentines: ground(['valentine', 'valentine-ix', 'valentine-xi', 'valentine-archer', 'valentine-aa'], VALENTINE),
  churchills: ground(['churchill-i', 'churchill-iii', 'churchill-vii', 'churchill-gun-carrier', 'black-prince'], CHURCHILL),
  'm41-hulls': ground(['m42-duster', 'm64-taiwan'], M41_HULL),
  'italian-m': ground(['fiat-m13-40', 'semovente-75-18', 'semovente-75-34', 'semovente-m43'], ITALIAN_M),
  semoventi: ground(['semovente-75-18', 'semovente-75-34', 'semovente-m43'], SEMOVENTE),
  'strv-m41s': ground(['sav-m43', 'sav-m43-1944', 'pvkv-iii', 'pvkv-iv', 'strv-m40l', 'pbv-301'], STRV_M41),
  m6s: ground(['m6a1', 'm6a2e1', 't1e1', 't1e1-90'], M6),
  cckws: ground(['cckw-bofors', 'cckw-m45'], CCKW),
  m109s: ground(['m109', 'm109a1'], M109),

  'type-97-chi-ha-kai': ground('type-97-chi-ha-kai', [
    { cue: 'Shinhoto turret: larger, with a rear bustle', check: turretL(1.8) },
    { cue: 'long 47 mm in place of the short 57 mm', check: (s) => cal(0.045, 0.05)(s) && gunLen(1.5)(s) },
    { cue: 'riveted hull with the stepped superstructure', check: hullShape },
  ]),
  'lvtdgb-m40': ground('lvtdgb-m40', [
    { cue: 'three-axle bonneted lorry', check: (s) => lorry(3)(s) && !!s.cab?.bonnet },
    { cue: '40 mm Bofors on the open load bed', check: guns(1) },
  ]),
  't34-heavy': ground(['t34-heavy', 't30'], [
    { cue: 'eight road wheels, four return rollers', check: run(8, 4) },
    { cue: 'huge cast turret with a long overhang behind', check: (s) => castTurret(s) && turretL(3.5)(s) },
    { cue: 'rangefinder or vision ports bulging from the turret sides', check: (s) => partsOf(s).some((t) => Math.abs(t.side ?? 0) >= 1.3) },
  ]),
  't34-heavy-gun': ground('t34-heavy', [{ cue: 'very long 120 mm', check: (s) => cal(0.12)(s) && gunLen(5.5)(s) }]),
  t30: ground('t30', [{ cue: 'short thick 155 mm', check: (s) => cal(0.15)(s) && gunLen(0, 5.5)(s) }]),
  'type-1-chi-he': ground('type-1-chi-he', [
    { cue: 'welded hull with flat plates, longer than the Chi-Ha', check: (s) => hullShape(s) && s.length > 5.6 },
    { cue: 'angular three-man turret with the 47 mm', check: (s) => turretShape(s) && cal(0.045, 0.05)(s) },
  ]),
  centurion: ground('centurion', [
    { cue: 'six road wheels in Horstmann pairs behind skirt plates', check: (s) => wheels(s) === 6 && skirted(s) },
    { cue: 'large turret with the 105 mm L7 and its bore evacuator', check: (s) => turretL(3.5)(s) && cal(0.105, 0.11)(s) },
    { cue: "commander's cupola on the turret roof", check: cupolaAny },
  ]),
  'gaz-mm-72k': ground('gaz-mm-72k', [
    { cue: 'light lorry, two axles', check: lorry(2) },
    { cue: 'single 25 mm 72-K on the load bed behind the cab', check: (s) => guns(1)(s) && turretAt(-9, -0.5)(s) },
    { cue: 'bed sides folded down flat as the gun crew platform', check: (s) => partsOf(s).filter((t) => t.height <= 0.06 && t.width >= 0.3).length >= 2 },
  ]),
  'm48-patton': ground('m48-patton', [
    { cue: 'six road wheels a side, small return rollers', check: (s) => wheels(s) === 6 && rollers(s) >= 3 },
    { cue: 'boat-shaped cast hull', check: castHull },
    { cue: 'big round cast turret with the 90 mm and a T-shaped muzzle brake', check: (s) => castTurret(s) && muzzle(s) && cal(0.09)(s) },
  ]),
  '2s1-gvozdika': ground('2s1-gvozdika', [
    { cue: 'seven road wheels a side, no return rollers', check: run(7, 0) },
    { cue: 'turret at the back with the 122 mm and its muzzle brake', check: (s) => turretAt(-9, -0.5)(s) && muzzle(s) },
    { cue: 'flat amphibious hull with a sharp nose', check: (s) => hullShape(s) && low(1.65)(s) },
  ]),
  'type-97-chi-ha': ground('type-97-chi-ha', [
    { cue: 'small turret with the short 57 mm', check: (s) => cal(0.057, 0.06)(s) && gunLen(0, 1.2)(s) },
    { cue: 'riveted hull with the stepped superstructure', check: hullShape },
  ]),
  'su-100p': ground('su-100p', [
    { cue: 'six road wheels, three return rollers', check: run(6, 3) },
    { cue: 'gun house at the back, the 100 mm with a muzzle brake over the hull', check: (s) => turretAt(-9, -1)(s) && muzzle(s) },
  ]),
  m2a4: ground('m2a4', [
    { cue: 'four road wheels in two VVSS bogies, the idler raised', check: run(4) },
    { cue: 'tall narrow riveted hull with sponson machine guns', check: (s) => tall(1.8)(s) && partsOf(s).length >= 4 },
    { cue: 'small turret with the 37 mm', check: cal(0.03, 0.04) },
  ]),
  'bmp-1': ground('bmp-1', [
    { cue: 'very low hull with a long flat ribbed glacis', check: (s) => hullShape(s) && s.length / s.hullHeight > 4 },
    { cue: 'small conical turret with the 73 mm', check: (s) => castTurret(s) && cal(0.07, 0.08)(s) },
    { cue: 'six road wheels, three return rollers', check: run(6, 3) },
    { cue: 'Malyutka missile on its rail over the gun', check: launcher },
  ]),
  'pt-76': ground('pt-76', [
    { cue: 'long boat-shaped hull, six road wheels, no return rollers', check: (s) => run(6, 0)(s) && s.length > 6.5 },
    { cue: 'flat conical turret forward, the 76 mm with a muzzle brake', check: (s) => castTurret(s) && turretAt(0.3)(s) && muzzle(s) },
  ]),
  'ab-41': ground('ab-41', [
    { cue: 'four big wheels at the corners, a spare on each side', check: axles(2) },
    { cue: 'L6/40 turret with the 20 mm Breda', check: (s) => turretShape(s) && cal(0.02, 0.025)(s) },
    { cue: 'symmetrical hull, driven from both ends', check: hullShape },
  ]),
  'crusader-aa': ground('crusader-aa', [
    { cue: 'five large Christie road wheels a side', check: run(5) },
    { cue: 'tall open-backed turret with the 40 mm Bofors', check: (s) => turretH(1)(s) && cal(0.04, 0.045)(s) },
  ]),
  'btr-zd': ground('btr-zd', [
    { cue: 'BTR-D: small low airborne hull', check: (s) => hullShape(s) && low(1.4)(s) },
    { cue: 'ZU-23-2 twin 23 mm on the roof', check: guns(2) },
  ]),
  'm4-t26': ground('m4-t26', [{ cue: 'M26 Pershing turret with the 90 mm on the Sherman hull', check: (s) => castTurret(s) && muzzle(s) && cal(0.09)(s) }]),
  'm4a3e2-76': ground(['m4a3e2-76', 'm4a3e2-jumbo'], [
    { cue: 'thick flat-sided Jumbo turret', check: turretShape },
    { cue: 'extended end connectors widening the tracks', check: (s) => s.width > 2.9 },
  ]),
  'm4a3e2-76-gun': ground('m4a3e2-76', [{ cue: 'long 76 mm with a muzzle brake', check: (s) => muzzle(s) && gunLen(3)(s) }]),
  'm4a3e2-jumbo': ground('m4a3e2-jumbo', [{ cue: 'short 75 mm', check: (s) => cal(0.075, 0.076)(s) && gunLen(0, 2.5)(s) }]),
  kanonenjagdpanzer: ground('kanonenjagdpanzer', [
    { cue: 'very low casemate, the 90 mm low in the glacis', check: (s) => casemate(s) && hullGun(s) && low(1.2)(s) },
    { cue: 'five road wheels, three return rollers', check: run(5, 3) },
  ]),
  'sav-m43': ground(['sav-m43', 'sav-m43-1944'], [{ cue: 'tall box casemate with the gun low in its front', check: casemate }]),
  'sav-m43-gun': ground('sav-m43', [{ cue: 'short 105 mm howitzer', check: (s) => cal(0.1)(s) && gunLen(0, 1.6)(s) }]),
  'sav-m43-1944': ground('sav-m43-1944', [{ cue: 'longer 75 mm', check: (s) => cal(0.075, 0.08)(s) && gunLen(1.6)(s) }]),
  'm26-super-pershing': ground('m26-super-pershing', [
    { cue: 'very long 90 mm T15 with its muzzle brake', check: (s) => muzzle(s) && gunLen(5)(s) },
    { cue: 'six road wheels, five return rollers', check: run(6, 5) },
    { cue: 'Pershing cast turret with extra armour on its face', check: (s) => castTurret(s) && partsOf(s).some((t) => t.height >= 1 && t.width >= 2.5) },
  ]),
  'lvt-4-zis-2': ground('lvt-4-zis-2', [
    { cue: 'LVT boat hull, the grousered tracks run round its sides', check: (s) => wrapTracks(s) || (s.chassis === 'tracked' && !s.running) },
    { cue: 'ZiS-2 57 mm behind its shield in the open cargo well', check: (s) => casemate(s) && cal(0.057, 0.06)(s) },
    { cue: 'long and wide, near eight metres', check: (s) => s.length > 7.5 },
  ]),
  'm3-gmc': ground('m3-gmc', [
    { cue: 'half-track: front wheels and the rear track unit', check: (s) => s.chassis === 'halftrack' },
    { cue: '75 mm with its shield in the open rear compartment', check: (s) => cal(0.075)(s) && openAbove(s) },
  ]),
  'su-100': ground('su-100', [
    { cue: 'long 100 mm', check: (s) => cal(0.1)(s) && gunLen(4.5)(s) },
    { cue: "commander's cupola on the right of the casemate roof", check: (s) => partsOf(s).some((t) => (t.side ?? 0) > 0.4 && t.width <= 0.7 && t.width >= 0.5) },
  ]),
  'su-122': ground('su-122', [{ cue: 'short M-30S howitzer in a big rounded mantlet', check: (s) => cal(0.12)(s) && gunLen(0, 1.5)(s) }]),
  'pvkv-iv': ground('pvkv-iv', [{ cue: 'turret with the long 57 mm and a muzzle brake', check: (s) => cal(0.057, 0.06)(s) && muzzle(s) }]),
  charioteer: ground('charioteer', [
    { cue: 'Cromwell hull, five large road wheels', check: run(5) },
    { cue: 'big thin-walled turret with the 20-pounder', check: (s) => turretL(2.5)(s) && cal(0.08)(s) && gunLen(4)(s) },
  ]),
  'bt-5': ground(['bt-5', 'bt-42'], [{ cue: 'four big Christie road wheels a side, no return rollers', check: run(4, 0) }]),
  'bt-5-turret': ground('bt-5', [{ cue: 'cylindrical turret with the 45 mm', check: (s) => turretShape(s) && cal(0.045, 0.05)(s) }]),
  'bt-42': ground('bt-42', [{ cue: 'tall box turret with the 114 mm howitzer', check: (s) => turretH(1)(s) && cal(0.11)(s) }]),
  'churchill-gun-carrier': ground('churchill-gun-carrier', [{ cue: '3-inch gun low in a fixed box casemate', check: (s) => casemate(s) && cal(0.075)(s) }]),
  'p-40': ground('p-40', [
    { cue: 'eight small road wheels in pairs, three return rollers', check: run(8, 3) },
    { cue: 'turret with sloped sides and the 75 mm L/34', check: (s) => turretShape(s) && cal(0.075, 0.08)(s) },
  ]),
  conqueror: ground('conqueror', [
    { cue: 'huge cast turret with the 120 mm and bore evacuator', check: (s) => turretL(4.5)(s) && cal(0.12)(s) },
    { cue: 'fire-control cupola on top of the turret back', check: cupolaAny },
    { cue: 'skirt plates over four Horstmann pairs, eight road wheels', check: (s) => skirted(s) && wheels(s) === 8 },
  ]),
  'marmon-herrington-vi': ground(['marmon-herrington-vi', 'marmon-herrington-vi-2pdr'], [
    { cue: 'large eight-wheeled armoured car', check: axles(4) },
    { cue: 'tall box hull with sloped plates', check: (s) => hullShape(s) && tall(1.9)(s) },
  ]),
  'marmon-herrington-vi-2pdr': ground('marmon-herrington-vi-2pdr', [{ cue: 'turret with the 2-pounder', check: cal(0.04, 0.045) }]),
  'mh-vi-6pdr': ground('marmon-herrington-vi', [{ cue: 'turret with the 6-pounder', check: cal(0.057, 0.06) }]),
  'zsu-57-2': ground('zsu-57-2', [
    { cue: 'twin 57 mm with muzzle brakes', check: (s) => guns(2)(s) && muzzle(s) },
    { cue: 'big open-topped turret with sloped walls', check: (s) => openAbove(s) || slabWalls(s) },
    { cue: 'T-54-based hull with four road wheels a side', check: run(4) },
  ]),
  'kv-1': ground('kv-1', [{ cue: 'welded box turret with the 76 mm', check: (s) => turretShape(s) && cal(0.076, 0.08)(s) }]),
  'type-61': ground('type-61', [
    { cue: 'six road wheels a side', check: (s) => wheels(s) === 6 },
    { cue: 'cast turret with the 90 mm and a T-shaped muzzle brake', check: (s) => castTurret(s) && muzzle(s) },
    { cue: "commander's cupola with a machine gun", check: cupolaAny },
  ]),
  'ho-ni-i': ground('ho-ni-i', [
    { cue: 'open three-sided gun shield on the Chi-Ha hull, no turret', check: casemate },
    { cue: 'Type 90 field gun with a muzzle brake', check: (s) => cal(0.075)(s) && muzzle(s) },
  ]),
  'bkan-1c': ground('bkan-1c', [
    { cue: 'huge armoured gun house over the rear', check: (s) => turretAt(-9, -1)(s) && turretH(2)(s) },
    { cue: 'very long 155 mm with a muzzle brake', check: (s) => muzzle(s) && gunLen(7)(s) },
    { cue: 'Strv 103 running gear: six road wheels', check: run(6) },
  ]),
  '52-k-85mm': ground('52-k-85mm', [
    { cue: 'long 85 mm with a multi-baffle muzzle brake', check: (s) => muzzle(s) && cal(0.085)(s) },
    { cue: 'four-wheeled carriage with outriggers', check: axles(2) },
  ]),
  t25: ground('t25', [
    { cue: 'six road wheels, three return rollers', check: run(6, 3) },
    { cue: 'cast turret with the 90 mm and its muzzle brake', check: (s) => castTurret(s) && muzzle(s) && cal(0.09)(s) },
  ]),
  't-34-1940': ground('t-34-1940', [
    { cue: 'short L-11 76 mm with its recoil sleeve', check: (s) => gunLen(0, 1.6)(s) && guns(2)(s) },
    { cue: 'small turret overhanging the engine deck', check: turretShape },
  ]),
  ratel: ground('ratel', [
    { cue: 'large six-wheeled car, wheels evenly spaced', check: axles(3) },
    { cue: 'very tall slab-sided hull', check: (s) => hullShape(s) && tall(2.2)(s) },
    { cue: 'turret with the 20 mm', check: cal(0.02, 0.025) },
  ]),
  valentine: ground('valentine', [{ cue: 'small two-man turret with the 2-pounder', check: cal(0.04, 0.045) }]),
  'm8-greyhound': ground('m8-greyhound', [
    { cue: 'six wheels on three evenly spaced axles', check: axles(3) },
    { cue: 'open-topped turret with the 37 mm', check: (s) => openTurret(s) && cal(0.037, 0.04)(s) },
    { cue: 'low wide hull with sloped plates', check: (s) => hullShape(s) && low(1.6)(s) },
  ]),
  'm56-scorpion': ground('m56-scorpion', [
    { cue: 'long 90 mm on a pedestal behind a small shield', check: (s) => casemate(s) && gunLen(4)(s) },
    { cue: 'four big road wheels, no return rollers', check: run(4, 0) },
    { cue: 'open flat platform, no armour but the gun shield', check: (s) => casemate(s) && low(1.2)(s) },
  ]),
  'ikv-72': ground('ikv-72', [
    { cue: 'very low casemate with the 75 mm', check: (s) => casemate(s) && low(1)(s) },
    { cue: 'five road wheels a side', check: run(5) },
  ]),
  'l-62-anti-ii': ground('l-62-anti-ii', [
    { cue: 'open-topped turret with the 40 mm Bofors', check: (s) => openAbove(s) && cal(0.04, 0.045)(s) },
    { cue: 'five road wheels, two return rollers', check: run(5, 2) },
  ]),
  'vk-3002m': ground('vk-3002m', [
    { cue: 'interleaved road wheels, eight stations a side', check: (s) => interleave('full')(s) && wheels(s) === 8 },
    { cue: 'Panther-like sloped glacis and sides', check: lean(0.5) },
    { cue: '75 mm L/70 with a muzzle brake', check: (s) => muzzle(s) && gunLen(3.5)(s) },
  ]),
  'ho-ni-iii': ground('ho-ni-iii', [{ cue: 'fully enclosed casemate with the 75 mm', check: (s) => casemate(s) && cal(0.075)(s) && muzzle(s) }]),
  'kv-2': ground('kv-2', [{ cue: 'huge tall box turret with the 152 mm howitzer', check: (s) => turretH(1.3)(s) && cal(0.15)(s) }]),
  'zsu-37': ground('zsu-37', [
    { cue: 'SU-76M chassis: six road wheels, three return rollers', check: run(6, 3) },
    { cue: 'tall box superstructure over the rear with the 37 mm', check: (s) => partsOf(s).some((t) => t.height >= 1.2 && t.width >= 2) && cal(0.037)(s) },
  ]),
  'type-95-so-ki': ground('type-95-so-ki', [
    { cue: 'tall box hull, four road wheels, two return rollers', check: (s) => run(4, 2)(s) && tall(1.9)(s) },
    { cue: 'rail wheels carried at the hull front and back', check: (s) => partsOf(s).filter((t) => t.width > 1.5 && t.length < 0.5).length >= 2 },
    { cue: 'small machine-gun turret', check: cal(0, 0.01) },
  ]),
  'ito-90m': ground('ito-90m', [
    { cue: "tracking radar's round face and the sight between the missile boxes", check: adds('slab', 1, 'turret') },
    { cue: 'six-wheeled lorry chassis', check: axles(3) },
    { cue: 'missile launcher and radar on the bed', check: (s) => rockets(s) && radar(s) },
  ]),
  'valentine-xi': ground('valentine-xi', [{ cue: 'turret with the 75 mm', check: cal(0.075, 0.08) }]),
  'is-1': ground('is-1', [
    { cue: 'large cast turret with the 85 mm', check: (s) => castTurret(s) && cal(0.085, 0.09)(s) },
    { cue: 'six road wheels, three return rollers', check: run(6, 3) },
    { cue: 'sloped hull sides above the tracks', check: lean(0.25) },
  ]),
  'amx-13': ground('amx-13', [
    { cue: 'oscillating turret set far back', check: turretAt(-9, -0.5) },
    { cue: 'long 75 mm with a muzzle brake', check: (s) => muzzle(s) && gunLen(4)(s) },
    { cue: 'five road wheels, low hull with the engine in front', check: (s) => wheels(s) === 5 && low(1.4)(s) },
  ]),
  'zerstorer-45': ground('zerstorer-45', [
    { cue: 'four 30 mm in an open-topped turret', check: (s) => guns(4)(s) && openTurret(s) },
    { cue: 'Panzer IV hull: eight small road wheels, four return rollers', check: run(8, 4) },
  ]),
  'a13-cruiser': ground('a13-cruiser', [
    { cue: 'four large Christie road wheels a side', check: run(4, 0) },
    { cue: 'angular turret with the 2-pounder', check: (s) => turretShape(s) && cal(0.04, 0.045)(s) },
  ]),
  'cckw-bofors': ground('cckw-bofors', [{ cue: '40 mm Bofors on the load bed', check: (s) => cal(0.04, 0.045)(s) && turretAt(-9, -1)(s) }]),
  m44: ground(['m44', 'm55'], [
    { cue: 'gun house at the back over a spade', check: turretAt(-9, -0.5) },
    { cue: 'six road wheels, three return rollers', check: run(6, 3) },
  ]),
  'm44-open': ground('m44', [{ cue: 'open-topped box with the 155 mm', check: (s) => openAbove(s) && cal(0.15)(s) }]),
  m55: ground('m55', [{ cue: 'closed box turret with the 203 mm', check: (s) => !openAbove(s) && cal(0.2)(s) }]),
  'semovente-m43': ground('semovente-m43', [{ cue: 'wide low casemate with the 105 mm', check: (s) => cal(0.105)(s) && s.width >= 2.3 }]),
  'strv-m40l': ground('strv-m40l', [{ cue: 'turret with the 37 mm and twin machine guns', check: (s) => cal(0.037, 0.04)(s) && guns(3)(s) }]),
  'm4a2-76': ground('m4a2-76', [{ cue: 'T23 turret with the 76 mm and its muzzle brake', check: (s) => castTurret(s) && muzzle(s) && cal(0.076, 0.08)(s) }]),
  'fiat-6616': ground('fiat-6616', [
    { cue: 'low four-wheeled car', check: (s) => axles(2)(s) && low(1.5)(s) },
    { cue: 'small turret with the 20 mm', check: cal(0.02, 0.025) },
  ]),
  'pvkv-iii': ground('pvkv-iii', [{ cue: 'turret with the long 57 mm', check: (s) => cal(0.057, 0.06)(s) && gunLen(2.5)(s) }]),
  'fiat-m13-40': ground('fiat-m13-40', [{ cue: 'riveted hull with the 47 mm in a small turret', check: (s) => hullShape(s) && cal(0.047, 0.05)(s) }]),
  'm42-duster': ground('m42-duster', [{ cue: 'open-topped turret with twin 40 mm', check: (s) => openAbove(s) && guns(2)(s) && cal(0.04, 0.045)(s) }]),
  'zrinyi-ii': ground('zrinyi-ii', [
    { cue: 'low casemate with the short 105 mm howitzer', check: (s) => casemate(s) && cal(0.105)(s) },
    { cue: 'Turan running gear: eight small road wheels, five return rollers', check: run(8, 5) },
  ]),
  'm4a1-sherman': ground(['m4a1-sherman', 'm4a1-76'], [{ cue: 'cast hull with rounded edges', check: castHull }]),
  'm4a1-sherman-gun': ground('m4a1-sherman', [{ cue: 'short 75 mm in the rounded cast turret', check: (s) => castTurret(s) && gunLen(0, 2.6)(s) }]),
  'm4a1-76': ground('m4a1-76', [{ cue: 'T23 turret with the 76 mm and its muzzle brake', check: (s) => castTurret(s) && muzzle(s) }]),
  't-34-100': ground('t-34-100', [{ cue: 'T-34-85 turret with the long 100 mm and its muzzle brake', check: (s) => castTurret(s) && muzzle(s) && cal(0.1)(s) }]),
  'm53-59': ground('m53-59', [
    { cue: 'six-wheeled Praga with a sloped armoured cab', check: (s) => axles(3)(s) && hullShape(s) },
    { cue: 'twin 30 mm on the rear bed with muzzle brakes', check: (s) => guns(2)(s) && muzzle(s) && turretAt(-9, -1)(s) },
  ]),
  turan: ground(['turan-i', 'turan-ii'], [
    { cue: 'eight small road wheels in pairs, five return rollers', check: run(8, 5) },
    { cue: 'riveted hull with a tall turret', check: (s) => hullShape(s) && turretShape(s) },
  ]),
  'turan-i': ground('turan-i', [{ cue: 'long 40 mm', check: cal(0.04, 0.045) }]),
  'turan-ii': ground('turan-ii', [{ cue: 'short 75 mm', check: (s) => cal(0.075)(s) && gunLen(0, 1.2)(s) }]),
  'btr-152': ground(['btr-152a', 'btr-152d'], [
    { cue: 'six-wheeled armoured lorry with a long bonnet', check: axles(3) },
    { cue: 'open-topped troop compartment', check: openAbove },
  ]),
  'btr-152a': ground('btr-152a', [{ cue: 'twin 14.5 mm ZPTU-2 in the back', check: guns(2) }]),
  'btr-152d': ground('btr-152d', [{ cue: 'quad 14.5 mm ZPTU-4 in the back', check: guns(4) }]),
  'valentine-archer': ground('valentine-archer', [{ cue: 'open casemate with the 17-pounder pointing back', check: (s) => casemate(s) && muzzle(s) }]),
  ram: ground(['ram-i', 'ram-ii'], [
    { cue: 'cast hull with side doors, three VVSS bogies', check: (s) => castHull(s) && run(6)(s) },
    { cue: 'rounded cast turret', check: castTurret },
  ]),
  'ram-i': ground('ram-i', [{ cue: '2-pounder in the turret', check: cal(0.04, 0.045) }]),
  'ram-ii': ground('ram-ii', [{ cue: '6-pounder in the turret', check: cal(0.057, 0.06) }]),
  'pbv-301': ground('pbv-301', [
    { cue: 'tall box APC hull', check: tall(2) },
    { cue: 'small turret with the 20 mm', check: cal(0.02, 0.025) },
  ]),
  'daimler-armoured-car': ground('daimler-armoured-car', [
    { cue: 'small four-wheeled car', check: (s) => axles(2)(s) && s.length < 4.2 },
    { cue: 'two-man turret with the 2-pounder', check: cal(0.04, 0.045) },
  ]),
  tetrarch: ground('tetrarch', [
    { cue: 'four large road wheels a side, no return rollers', check: run(4, 0) },
    { cue: 'small turret with the 2-pounder', check: cal(0.04, 0.045) },
  ]),
  'rail-boxcar': ground('rail-boxcar', [{ cue: 'long enclosed box car on the rails', check: (s) => s.chassis === 'rail' && s.length > 12 }]),
  'tcm-20': ground('tcm-20', [
    { cue: 'half-track: front wheels and the rear track unit', check: (s) => s.chassis === 'halftrack' },
    { cue: 'twin 20 mm in the open rear compartment', check: (s) => guns(2)(s) && openAbove(s) },
  ]),
  'churchill-i': ground('churchill-i', [{ cue: '3-inch howitzer low in the hull front, 2-pounder in the turret', check: (s) => hullGun(s) && cal(0.04, 0.045)(s) }]),
  'panhard-ebr': ground('panhard-ebr', [
    { cue: 'eight wheels, the middle four steel and retractable', check: axles(4) },
    { cue: 'oscillating turret with the 75 mm and a muzzle brake', check: (s) => turretShape(s) && muzzle(s) },
    { cue: 'symmetrical hull, driven from both ends', check: hullShape },
  ]),
  't-44-100': ground(['t-44-100', 't-44-122'], [
    { cue: 'five large road wheels, no return rollers', check: run(5, 0) },
    { cue: 'cast turret set back on a low flat hull', check: (s) => castTurret(s) && turretAt(-9, 0)(s) },
  ]),
  't-44-122': ground('t-44-122', [{ cue: 'long 122 mm with a muzzle brake', check: (s) => cal(0.12)(s) && muzzle(s) }]),
  't-44-100-gun': ground('t-44-100', [{ cue: 'long 100 mm', check: (s) => cal(0.1)(s) && gunLen(4)(s) }]),
  'm24-chaffee': ground('m24-chaffee', [
    { cue: 'five road wheels, three return rollers', check: run(5, 3) },
    { cue: 'light 75 mm in a rounded turret', check: (s) => castTurret(s) && cal(0.075, 0.08)(s) },
    { cue: 'wide low hull with sloped plates', check: (s) => hullShape(s) && s.width > 2.8 },
  ]),
  'object-416': ground('object-416', [
    { cue: 'very low hull with the turret at the back', check: (s) => low(1.2)(s) && turretAt(-9, -1)(s) },
    { cue: 'flat cast turret with the 100 mm', check: (s) => castTurret(s) && cal(0.1)(s) },
  ]),
  'pzh-2000': ground('pzh-2000', [
    { cue: 'very large turret at the rear with the long 155 mm', check: (s) => turretAt(-9, -1)(s) && gunLen(7)(s) && muzzle(s) },
    { cue: 'seven road wheels behind skirts', check: (s) => wheels(s) === 7 && skirted(s) },
  ]),
  'flakpanzer-gepard': ground('flakpanzer-gepard', [
    { cue: 'twin 35 mm on the turret sides', check: guns(2) },
    { cue: 'search radar on the turret back, tracking radar in front', check: radar },
    { cue: 'Leopard 1 hull: seven road wheels behind skirts', check: (s) => wheels(s) === 7 && skirted(s) },
  ]),
  't-10m': ground('t-10m', [
    { cue: 'seven road wheels a side', check: (s) => wheels(s) === 7 },
    { cue: '122 mm with a multi-baffle muzzle brake', check: (s) => muzzle(s) && cal(0.12)(s) },
    { cue: 'large rounded cast turret', check: castTurret },
  ]),
  'bofors-40mm': ground('bofors-40mm', [
    { cue: '40 mm with its cone flash hider', check: (s) => muzzle(s) && cal(0.04, 0.045)(s) },
    { cue: 'four-wheeled carriage', check: axles(2) },
  ]),
  skink: ground('skink', [
    { cue: 'cast turret with four 20 mm Polstens', check: (s) => castTurret(s) && guns(4)(s) },
    { cue: 'Grizzly (M4A1) cast hull, three VVSS bogies', check: (s) => castHull(s) && run(6)(s) },
  ]),
  'su-122-54': ground('su-122-54', [
    { cue: 'T-54 hull with a casemate, five road wheels', check: (s) => casemate(s) && run(5)(s) },
    { cue: 'long 122 mm with a fume extractor', check: (s) => cal(0.12)(s) && gunLen(4)(s) },
  ]),
  'm4a4-firefly': ground('m4a4-firefly', [{ cue: 'long 17-pounder with a muzzle brake', check: (s) => muzzle(s) && gunLen(3)(s) }]),
  'm4a4-sherman': ground(['m4a4-sherman', 'm4a4-firefly', 'm4a4-cn-75-50'], [{ cue: 'long welded hull for the multibank engine', check: (s) => s.length > 6 }]),
  'm4a4-cn-75-50': ground('m4a4-cn-75-50', [{ cue: 'long French 75 mm SA 50 with a muzzle brake', check: (s) => muzzle(s) && gunLen(3.5)(s) }]),
  'armoured-train-car': ground('armoured-train-car', [
    { cue: 'long armoured car on the rails', check: (s) => s.chassis === 'rail' && s.length > 12 },
    { cue: 'gun turrets at both ends', check: guns(2) },
  ]),
  '2s3-akatsiya': ground('2s3-akatsiya', [
    { cue: 'six road wheels, four return rollers', check: run(6, 4) },
    { cue: 'large turret at the back, the 152 mm with a muzzle brake', check: (s) => turretAt(-9, -1)(s) && muzzle(s) && cal(0.15)(s) },
  ]),
  'amx-10p': ground('amx-10p', [
    { cue: 'five road wheels, three return rollers', check: run(5, 3) },
    { cue: 'boxy amphibious hull', check: (s) => hullShape(s) && tall(1.8)(s) },
    { cue: 'small turret with the 20 mm', check: cal(0.02, 0.025) },
  ]),
  'ho-ri': ground(['ho-ri-production', 'ho-ri-prototype'], [
    { cue: 'very long hull, eight road wheels, four return rollers', check: (s) => run(8, 4)(s) && s.length > 7 },
    { cue: 'casemate with the long 105 mm', check: (s) => casemate(s) && cal(0.105)(s) && gunLen(6)(s) },
  ]),
  t92: ground('t92', [
    { cue: 'very wide flat turret at the back with the 76 mm', check: (s) => turretAt(-9, -0.5)(s) && (s.turret?.width ?? 0) >= 2.8 },
    { cue: 'four road wheels a side', check: run(4) },
  ]),
  tortoise: ground('tortoise', [
    { cue: 'huge casemate, the 32-pounder in a ball mount', check: (s) => casemate(s) && cal(0.09)(s) },
    { cue: 'tracks running round the hull, two track units a side', check: wrapTracks },
  ]),
  'valentine-ix': ground('valentine-ix', [{ cue: 'turret with the 6-pounder', check: cal(0.057, 0.06) }]),
  'pz-35t': ground('pz-35t', [
    { cue: 'eight small road wheels in pairs, four return rollers', check: run(8, 4) },
    { cue: 'riveted hull with a small turret and the 37 mm', check: (s) => hullShape(s) && cal(0.037, 0.04)(s) },
  ]),
  'char-2c': ground('char-2c', [
    { cue: 'huge ten-metre tracked hull', check: (s) => s.length > 10 },
    { cue: 'front turret with the 75 mm, machine-gun turret at the back', check: (s) => cal(0.075)(s) && partsOf(s).length >= 1 },
  ]),
  'is-3': ground('is-3', [
    { cue: 'pike nose: the glacis plates meet in a point', check: hullShape },
    { cue: 'low bowl-shaped cast turret', check: (s) => castTurret(s) && (s.turret?.height ?? 1) < 0.9 },
    { cue: '122 mm with a muzzle brake', check: (s) => muzzle(s) && cal(0.12)(s) },
    { cue: 'six road wheels, three return rollers', check: run(6, 3) },
  ]),
  'celere-sahariano': ground('celere-sahariano', [
    { cue: 'five large Christie road wheels a side', check: run(5) },
    { cue: 'turret with the 47 mm', check: cal(0.047, 0.05) },
  ]),
  'sarc-mk4': ground('sarc-mk4', [
    { cue: 'four-wheeled armoured car', check: axles(2) },
    { cue: 'turret with the 2-pounder', check: cal(0.04, 0.045) },
  ]),
  lorraine: ground(['lorraine-37l', 'lorraine-155'], [{ cue: 'small low Lorraine 37L carrier, six road wheels', check: (s) => run(6)(s) && low(1)(s) }]),
  'lorraine-155': ground('lorraine-155', [{ cue: '155 mm on an open mount at the back', check: (s) => casemate(s) && cal(0.15)(s) }]),
  elc: ground(['elc-bis', 'elc-901'], [
    { cue: 'tiny low tank, four road wheels', check: (s) => run(4)(s) && low(1)(s) },
    { cue: 'turret set back with the 90 mm and a muzzle brake', check: (s) => turretAt(-9, -0.3)(s) && muzzle(s) },
  ]),
  'spj-fm43-44': ground('spj-fm43-44', [{ cue: 'casemate with the short 150 mm', check: (s) => casemate(s) && cal(0.15)(s) }]),
  'sidam-25': ground('sidam-25', [
    { cue: 'M113 hull, five road wheels', check: run(5, 0) },
    { cue: 'turret with four 25 mm', check: guns(4) },
  ]),
  'panzerwerfer-42': ground('panzerwerfer-42', [
    { cue: 'Maultier half-track', check: (s) => s.chassis === 'halftrack' },
    { cue: 'ten-tube rocket launcher on the roof', check: rockets },
  ]),
  't-26': ground('t-26', [
    { cue: 'eight small road wheels in pairs, four return rollers', check: run(8, 4) },
    { cue: 'turret offset right with a bustle and the 45 mm', check: (s) => turretOff(1)(s) && cal(0.045, 0.05)(s) },
  ]),
  'harry-hopkins': ground('harry-hopkins', [
    { cue: 'four large road wheels a side', check: run(4) },
    { cue: 'flat-sided sloped turret with the 2-pounder', check: (s) => turretShape(s) && cal(0.04, 0.045)(s) },
  ]),
  cm52: ground('cm52', [
    { cue: 'two-axle bonneted lorry', check: (s) => lorry(2)(s) && !!s.cab?.bonnet },
    { cue: 'multiple machine-gun mount on the load bed', check: guns(2) },
  ]),
  'kv-220': ground('kv-220', [
    { cue: 'lengthened hull, seven road wheels a side', check: (s) => wheels(s) === 7 },
    { cue: 'large turret with the 85 mm', check: (s) => turretL(2.8)(s) && cal(0.085)(s) },
  ]),
  'as-42': ground(['as-42', 'as-42-47'], [
    { cue: 'open-topped four-wheeled car', check: (s) => axles(2)(s) && openAbove(s) },
  ]),
  // The jerrycan racks belong to the desert Sahariana body; the Metropolitana carried ammunition boxes there instead.
  'as-42-sahariano': ground('as-42-sahariano', [{ cue: 'jerrycans racked along the sides', check: (s) => partsOf(s).filter((t) => Math.abs(t.side ?? 0) > 0.9).length >= 2 }]),
  'as-42-metropolitana': ground('as-42', [{ cue: 'ammunition boxes along the sides, no jerrycan racks', modelled: false, note: 'side boxes not drawn: no dimensioned source' }]),
  'as-42-gun': ground('as-42', [{ cue: '20 mm on a pedestal', check: cal(0.02, 0.025) }]),
  'as-42-47': ground('as-42-47', [{ cue: '47 mm on a pedestal', check: cal(0.047, 0.05) }]),
  'type-3-chi-nu': ground('type-3-chi-nu', [{ cue: 'large hexagonal turret with the 75 mm', check: (s) => turretShape(s) && cal(0.075)(s) && (s.turret?.width ?? 0) >= 1.9 }]),
  'gaz-aaa-4m': ground(['gaz-aaa-4m', 'gaz-aaa-dshk'], [{ cue: 'three-axle GAZ-AAA lorry', check: axles(3) }]),
  'gaz-aaa-4m-guns': ground('gaz-aaa-4m', [{ cue: 'quad Maxim on the load bed', check: guns(4) }]),
  'gaz-aaa-dshk': ground('gaz-aaa-dshk', [{ cue: 'single DShK on a pedestal on the load bed', check: (s) => guns(1)(s) && cal(0.012, 0.015)(s) }]),
  comet: ground('comet', [
    { cue: 'five large road wheels, return rollers on top', check: (s) => run(5)(s) && rollers(s) >= 3 },
    { cue: 'turret with the 77 mm HV', check: (s) => turretShape(s) && cal(0.076, 0.08)(s) },
  ]),
  'strv-74': ground('strv-74', [
    { cue: 'big tall turret with the 75 mm and a muzzle brake', check: (s) => turretH(1.2)(s) && muzzle(s) },
    { cue: 'six road wheels, four return rollers', check: run(6, 4) },
  ]),
  'semovente-75-18': ground('semovente-75-18', [{ cue: 'short 75/18 howitzer', check: (s) => cal(0.075)(s) && gunLen(0, 1.2)(s) }]),
  'semovente-75-34': ground('semovente-75-34', [{ cue: 'longer 75/34 gun', check: (s) => cal(0.075)(s) && gunLen(1.5)(s) }]),
  conway: ground('conway', [
    { cue: 'Centurion hull, six road wheels behind skirts', check: (s) => wheels(s) === 6 && skirted(s) },
    { cue: 'huge tall box turret with the 120 mm', check: (s) => turretH(1.5)(s) && cal(0.12)(s) },
  ]),
  'm40-rr': ground('m40-rr', [{ cue: '106 mm recoilless rifle on its tripod', check: (s) => s.chassis === 'static' && !!s.addOns?.length }]),
  'm7-priest': ground('m7-priest', [
    { cue: 'pulpit: round machine-gun ring at the front right', check: (s) => partsOf(s).some((t) => (t.side ?? 0) > 0.5 && t.height > 0.3) },
    { cue: '105 mm howitzer offset left in an open superstructure', check: (s) => turretOff(-1)(s) && cal(0.105)(s) && openAbove(s) },
    { cue: 'three VVSS bogies a side', check: run(6) },
  ]),
  palmaria: ground('palmaria', [
    { cue: 'large turret with the long 155 mm and a muzzle brake', check: (s) => turretL(4)(s) && muzzle(s) && cal(0.15)(s) },
    { cue: 'OF-40 hull, seven road wheels behind skirts', check: (s) => wheels(s) === 7 && skirted(s) },
  ]),
  'm50-ontos': ground('m50-ontos', [
    { cue: 'six 106 mm recoilless rifles on the small turret', check: guns(6) },
    { cue: 'tiny hull, three road wheels a side', check: run(3) },
  ]),
  'challenger-2': ground('challenger-2', [
    { cue: 'six road wheels behind skirts', check: (s) => wheels(s) === 6 && skirted(s) },
    { cue: 'long slab-sided turret with the 120 mm', check: (s) => turretL(4.5)(s) && cal(0.12)(s) },
    { cue: "commander's sight on the turret roof", check: cupolaAny },
  ]),  'challenger-2-tes': ground('challenger-2-tes', [
    { cue: 'Dorchester packs along the hull sides over the skirts', check: (s) => !!s.addOns?.some((a) => a.on === 'hull' && a.kind === 'box' && !!a.mirror && a.size[0] > 5 && a.at[1] > s.width / 2) },
    { cue: 'armour packs on the turret sides', check: (s) => !!s.addOns?.some((a) => a.on === 'turret' && a.kind === 'box' && !!a.mirror && a.size[0] > 2) },
    { cue: 'slat armour round the engine bay', check: (s) => (s.addOns ?? []).filter((a) => a.on === 'hull' && !!a.metal && a.at[0] < -2.5).length >= 2 },
    { cue: "the jammers' bird table with its four aerials over the turret back", check: (s) => (s.addOns ?? []).filter((a) => a.on === 'turret' && a.kind === 'tube' && a.at[0] < -1.5).length >= 4 },
    { cue: 'reactive armour across the nose', check: (s) => !!s.addOns?.some((a) => a.on === 'hull' && a.kind === 'box' && a.at[0] > s.length / 2 - 0.4) },
  ]),

  't-126': ground('t-126', [
    { cue: 'six road wheels, three return rollers', check: run(6, 3) },
    { cue: 'small welded turret with the 45 mm', check: (s) => turretShape(s) && cal(0.045, 0.05)(s) },
  ]),
  'm8a1-gmc': ground('m8a1-gmc', [
    { cue: 'open-topped turret with the 75 mm howitzer', check: (s) => openTurret(s) && cal(0.075)(s) },
    { cue: 'M5 Stuart hull, four road wheels a side', check: run(4) },
  ]),
  'type-63-twin-25': ground('type-63-twin-25', [
    { cue: 'twin 25 mm', check: guns(2) },
    { cue: 'four road wheels a side', check: run(4) },
  ]),
  'm19-mgmc': ground('m19-mgmc', [
    { cue: 'twin 40 mm in an open turret at the back', check: (s) => guns(2)(s) && turretAt(-9, -1)(s) },
    { cue: 'M24 running gear: five road wheels', check: run(5) },
  ]),
  'ho-i': ground('ho-i', [{ cue: 'short 75 mm in a Chi-Nu-type turret', check: (s) => cal(0.075)(s) && gunLen(0, 1.8)(s) }]),
  'concept-3': ground('concept-3', [
    { cue: 'eight-wheeled hull', check: axles(4) },
    { cue: 'turret with the long gun', check: (s) => turretShape(s) && gunLen(3)(s) },
  ]),
  'yag-10-29k': ground('yag-10-29k', [
    { cue: 'heavy three-axle YaG-10 lorry', check: axles(3) },
    { cue: '76 mm AA gun on the load bed', check: (s) => cal(0.076)(s) && turretAt(-9, -1)(s) },
  ]),
  'churchill-iii': ground('churchill-iii', [{ cue: 'welded slab-sided turret with the 6-pounder', check: (s) => turretShape(s) && cal(0.057, 0.06)(s) }]),
  'churchill-vii': ground('churchill-vii', [{ cue: 'cast-and-welded turret with the 75 mm', check: (s) => turretShape(s) && cal(0.075, 0.076)(s) }]),
  'black-prince': ground('black-prince', [{ cue: 'wider hull and big turret with the 17-pounder', check: (s) => s.width > 3.3 && muzzle(s) && gunLen(3)(s) }]),
  puma: ground('puma', [
    { cue: 'six road wheels behind skirts', check: (s) => wheels(s) === 6 && skirted(s) },
    { cue: 'low unmanned turret with the 30 mm', check: (s) => cal(0.03, 0.035)(s) && (s.turret?.height ?? 1) < 0.6 },
    { cue: "Spike launcher on the turret's left side", check: (s) => (s.addOns ?? []).some((a) => a.on === 'turret' && a.kind === 'box' && a.at[1] <= -1) },
    { cue: "commander's periscope head on its post over the turret's rear", check: (s) => adds('drum', 1, 'turret')(s) && (s.addOns ?? []).some((a) => a.on === 'turret' && a.metal && a.at[2] >= 1) },
  ]),
  'cckw-m45': ground('cckw-m45', [{ cue: 'quad .50 Maxson mount on the load bed', check: guns(2) }]),
  grant: ground('grant', [
    { cue: '75 mm in a sponson on the right side of the hull', check: (s) => (s.guns?.length ?? 0) >= 2 },
    { cue: 'British cast turret with a bustle, no cupola', check: castTurret },
    { cue: 'very tall slab-sided hull', check: tall(2.2) },
  ]),
  'su-5-1': ground('su-5-1', [
    { cue: 'T-26 chassis: eight small road wheels, four return rollers', check: run(8, 4) },
    { cue: '76 mm field gun behind a shield on the open rear deck', check: (s) => casemate(s) && cal(0.076)(s) },
  ]),
  waffentrager: ground('waffentrager', [
    { cue: '88 mm on an open mount with a shield', check: (s) => casemate(s) && muzzle(s) && gunLen(6)(s) },
    { cue: 'small chassis, five road wheels, two return rollers', check: run(5, 2) },
  ]),
  'r3-t20': ground('r3-t20', [
    { cue: 'small four-wheeled car', check: (s) => axles(2)(s) && s.length < 5 },
    { cue: 'turret with the 20 mm', check: cal(0.02, 0.025) },
  ]),
  staghound: ground('staghound', [
    { cue: 'large four-wheeled car', check: (s) => axles(2)(s) && s.length > 5.3 },
    { cue: 'cast turret with the 37 mm', check: (s) => castTurret(s) && cal(0.037, 0.04)(s) },
  ]),
  'sub-i-ii': ground('sub-i-ii', [
    { cue: 'tall box hull, five road wheels', check: (s) => run(5)(s) && tall(1.8)(s) },
    { cue: 'small turret with the 20 mm', check: cal(0.02, 0.025) },
  ]),
  'wz-141': ground('wz-141', [
    { cue: 'low hull, five road wheels, two return rollers', check: run(5, 2) },
    { cue: 'flat turret set back with the 105 mm', check: (s) => turretAt(-9, -0.5)(s) && cal(0.1)(s) },
  ]),
  't-70': ground('t-70', [
    { cue: 'five road wheels, three return rollers', check: run(5, 3) },
    { cue: 'small turret offset left with the 45 mm', check: (s) => turretOff(-1)(s) && cal(0.045, 0.05)(s) },
  ]),
  m103: ground('m103', [
    { cue: 'seven road wheels a side, open to view (no skirts)', check: (s) => wheels(s) === 7 && !skirted(s) },
    { cue: 'cast hull with a rounded nose', check: castHull },
    { cue: 'huge cast turret with the long 120 mm', check: (s) => castTurret(s) && cal(0.12)(s) && gunLen(6)(s) },
  ]),
  'su-152': ground('su-152', [
    { cue: 'KV hull with a tall casemate', check: (s) => casemate(s) && run(6, 3)(s) },
    { cue: 'short thick 152 mm with a muzzle brake', check: (s) => muzzle(s) && cal(0.15)(s) && gunLen(0, 3)(s) },
  ]),
  'challenger-a30': ground('challenger-a30', [
    { cue: 'lengthened Cromwell hull, six road wheels', check: run(6) },
    { cue: 'very tall turret with the 17-pounder', check: (s) => turretH(1)(s) && muzzle(s) },
  ]),
  'leopard-2a6': ground('leopard-2a6', [
    { cue: 'seven road wheels behind skirts', check: (s) => wheels(s) === 7 && skirted(s) },
    { cue: 'long 120 mm L/55', check: (s) => cal(0.12)(s) && gunLen(6)(s) },
    { cue: 'wedge armour on the turret front', check: wedgeTurret },
  ]),
  's-60-57mm': ground('s-60-57mm', [{ cue: 'long 57 mm on a four-wheeled carriage', check: (s) => axles(2)(s) && guns(1)(s) }]),
  'kv-8': ground('kv-8', [{ cue: 'small 45 mm in the turret beside the flame gun', check: (s) => cal(0.045, 0.05)(s) && guns(2)(s) }]),
  'zis-12-94km': ground('zis-12-94km', [
    { cue: 'two-axle ZiS-12 lorry', check: axles(2) },
    { cue: 'twin 25 mm on the load bed', check: guns(2) },
  ]),
  'm6a2e1': ground('m6a2e1', [{ cue: 'huge turret with the 105 mm', check: (s) => turretL(3.5)(s) && cal(0.105)(s) }]),
  'm6a1': ground('m6a1', [{ cue: 'cast turret with the 3-inch gun', check: (s) => castTurret(s) && cal(0.076)(s) }]),
  t1e1: ground(['t1e1', 't1e1-90'], [{ cue: 'cast hull and big cast turret', check: (s) => castHull(s) && castTurret(s) }]),
  't1e1-gun': ground('t1e1', [{ cue: '3-inch gun with a coaxial 37 mm', check: (s) => cal(0.076)(s) && guns(4)(s) }]),
  't1e1-90': ground('t1e1-90', [{ cue: '90 mm in the M6 turret', check: cal(0.09) }]),
  'type-62-light': ground('type-62-light', [
    { cue: 'five road wheels, no return rollers', check: run(5, 0) },
    { cue: 'T-54-like cast turret with the 85 mm', check: (s) => castTurret(s) && cal(0.085)(s) },
  ]),
  'type-60-sprg': ground('type-60-sprg', [
    { cue: 'twin 106 mm recoilless rifles on the hull side', check: guns(2) },
    { cue: 'tiny low tracked carrier', check: (s) => low(1.2)(s) && s.length < 4.5 },
  ]),
  'strv-m31': ground('strv-m31', [
    { cue: 'four road wheels, two return rollers', check: run(4, 2) },
    { cue: 'turret with the 37 mm', check: cal(0.037, 0.04) },
  ]),
  'panzerjager-i': ground('panzerjager-i', [
    { cue: 'Panzer I chassis: five road wheels, three return rollers', check: run(5, 3) },
    { cue: '47 mm behind an open three-sided shield', check: (s) => casemate(s) && cal(0.047, 0.05)(s) },
  ]),
  'arl-44': ground('arl-44', [
    { cue: 'long hull, the running gear covered by side skirts', check: wrapTracks },
    { cue: 'big turret with the 90 mm and a muzzle brake', check: (s) => turretL(3.5)(s) && muzzle(s) },
  ]),
  'steam-locomotive': ground('steam-locomotive', [{ cue: 'long locomotive on the rails', check: (s) => s.chassis === 'rail' && s.length > 15 }]),
  'pvkv-m43-1963': ground('pvkv-m43-1963', [
    { cue: 'casemate with the 75 mm and a muzzle brake', check: (s) => casemate(s) && muzzle(s) },
    { cue: 'six road wheels, three return rollers', check: run(6, 3) },
  ]),
  'flakpanzer-i': ground('flakpanzer-i', [
    { cue: 'Panzer I chassis: five road wheels, three return rollers', check: run(5, 3) },
    { cue: '20 mm Flak 38 on the open rear deck', check: (s) => cal(0.02, 0.025)(s) && turretAt(-9, 0)(s) },
  ]),
  t55e1: ground('t55e1', [
    { cue: 'eight-wheeled hull', check: axles(4) },
    { cue: 'open-topped turret with the 76 mm', check: (s) => openAbove(s) && cal(0.076)(s) },
  ]),
  'wz-551': ground('wz-551', [
    { cue: 'six-wheeled APC hull', check: axles(3) },
    { cue: 'turret with the 25 mm', check: cal(0.025, 0.03) },
  ]),
  somua: ground(['somua-s35', 'sau-40'], [
    { cue: 'running gear behind armoured skirts', check: wrapTracks },
    { cue: 'cast hull', check: castHull },
  ]),
  'somua-s35': ground('somua-s35', [{ cue: 'cast APX turret with the 47 mm', check: (s) => castTurret(s) && cal(0.047, 0.05)(s) }]),
  'sau-40': ground('sau-40', [{ cue: '75 mm in a casemate', check: (s) => casemate(s) && cal(0.075)(s) }]),
  'm2a2-light-tank': ground('m2a2-light-tank', [
    { cue: 'two small turrets side by side, machine guns only', check: (s) => turretOff(-1)(s) && cal(0, 0.02)(s) },
    { cue: 'four road wheels in two VVSS bogies', check: run(4) },
  ]),
  'm2a3-bradley': ground('m2a3-bradley', [
    { cue: 'six road wheels behind skirts', check: (s) => wheels(s) === 6 && skirted(s) },
    { cue: 'turret offset right with the 25 mm', check: (s) => turretOff(1)(s) && cal(0.025, 0.03)(s) },
    { cue: 'TOW box launcher on the turret side', check: launcher },
  ]),
  't95-medium': ground('t95-medium', [
    { cue: 'six road wheels, no return rollers', check: run(6, 0) },
    { cue: 'low cast turret with the 90 mm', check: (s) => castTurret(s) && cal(0.09)(s) },
  ]),
  't-34-76': ground('t-34-76', [{ cue: 'hexagonal turret with the 76 mm F-34', check: (s) => turretShape(s) && gunLen(1.6)(s) }]),
  'm1a1-90mm-aa': ground('m1a1-90mm-aa', [{ cue: 'long 90 mm on its towed carriage', check: (s) => s.chassis === 'towed' && cal(0.09)(s) }]),
  rooikat: ground(['rooikat-za-35', 'rooikat-105'], [{ cue: 'eight-wheeled hull', check: axles(4) }]),
  'rooikat-za-35': ground('rooikat-za-35', [
    { cue: 'twin 35 mm on the turret sides', check: guns(2) },
    { cue: 'radar on the turret', check: radar },
  ]),
  'rooikat-105': ground('rooikat-105', [{ cue: 'turret with the 105 mm and a muzzle brake', check: (s) => muzzle(s) && cal(0.105)(s) }]),
  'asu-57': ground('asu-57', [
    { cue: 'tiny low hull, open above', check: (s) => low(1)(s) && openAbove(s) },
    { cue: 'long 57 mm with a multi-baffle muzzle brake', check: (s) => muzzle(s) && gunLen(2.5)(s) },
  ]),
  't30-heavy': ground('t30', [{ cue: 'eight road wheels, four return rollers', check: run(8, 4) }]),
  'type-4-chi-to': ground('type-4-chi-to', [
    { cue: 'seven road wheels, three return rollers', check: run(7, 3) },
    { cue: 'big turret with the long 75 mm', check: (s) => turretL(2.5)(s) && gunLen(3)(s) },
  ]),
  'renault-d2': ground('renault-d2', [
    { cue: 'running gear behind armoured skirts', check: wrapTracks },
    { cue: 'cast APX turret with the 47 mm', check: (s) => castTurret(s) && cal(0.047, 0.05)(s) },
  ]),
  'diesel-locomotive': ground('diesel-locomotive', [{ cue: 'long diesel locomotive on the rails', check: (s) => s.chassis === 'rail' && s.length > 15 }]),
  'l3-33-cc': ground('l3-33-cc', [
    { cue: 'tiny tankette', check: (s) => s.length < 3.5 },
    { cue: '20 mm Solothurn in the hull front', check: (s) => casemate(s) && cal(0.02, 0.025)(s) },
  ]),
  'tpk-641': ground('tpk-641', [
    { cue: 'three-axle bonneted lorry', check: (s) => lorry(3)(s) && !!s.cab?.bonnet },
    { cue: 'twin AA guns on the load bed', check: guns(2) },
  ]),
  'm64-taiwan': ground('m64-taiwan', [{ cue: 'open-topped turret with the 76 mm', check: (s) => openAbove(s) && cal(0.076)(s) }]),
  'ru-251': ground('ru-251', [
    { cue: 'six road wheels, three return rollers', check: run(6, 3) },
    { cue: 'flat turret with the 90 mm and a muzzle brake', check: (s) => muzzle(s) && cal(0.09)(s) },
  ]),
  'm1a1-abrams': ground('m1a1-abrams', [
    { cue: 'seven road wheels behind skirts', check: (s) => wheels(s) === 7 && skirted(s) },
    { cue: 'flat angular turret with long slab sides', check: turretL(5) },
    { cue: '120 mm smoothbore', check: cal(0.12) },
    { cue: "commander's weapon station: a tall cupola with the .50", check: (s) => (s.addOns ?? []).some((a) => a.on === 'turret' && a.kind === 'drum' && a.size[2] >= 0.35) },
    { cue: 'bustle rack round the turret back', check: (s) => (s.addOns ?? []).some((a) => a.on === 'turret' && a.metal && a.at[0] <= -3) },
  ]),
  'ta-se': ground('ta-se', [
    { cue: 'four road wheels, two return rollers', check: run(4, 2) },
    { cue: 'small open turret with the 20 mm', check: cal(0.02, 0.025) },
  ]),
  'ush-204-gk': ground('ush-204-gk', [
    { cue: 'four-wheeled car', check: axles(2) },
    { cue: 'turret with the 20 mm', check: cal(0.02, 0.025) },
  ]),
  wiesel: ground('wiesel', [
    { cue: 'tiny tracked carrier', check: (s) => s.length < 4 && run(4)(s) },
    { cue: '20 mm on a small mount', check: cal(0.02, 0.025) },
  ]),
  'ho-ro': ground('ho-ro', [{ cue: '150 mm howitzer behind a tall shield, no turret', check: (s) => casemate(s) && cal(0.15)(s) }]),
  'lancia-3ro-100': ground('lancia-3ro-100', [
    { cue: 'heavy two-axle lorry', check: axles(2) },
    { cue: '100 mm gun on the load bed', check: (s) => cal(0.1)(s) && turretAt(-9, -0.5)(s) },
  ]),
  'su-85': ground('su-85', [{ cue: 'long 85 mm without a muzzle brake', check: (s) => noMuzzle(s) && cal(0.085)(s) }]),
  'vfw-flak-41': ground('vfw-flak-41', [
    { cue: 'long 88 mm Flak 41 on the deck', check: (s) => muzzle(s) && gunLen(5)(s) },
    { cue: 'lengthened Panzer IV running gear', check: (s) => wheels(s) === 8 && rollers(s) === 4 },
  ]),
  cromwell: ground('cromwell', [
    { cue: 'five large Christie road wheels', check: run(5) },
    { cue: 'square welded turret with the 75 mm', check: (s) => turretShape(s) && cal(0.075)(s) },
  ]),
  m113: ground('m113', [
    { cue: 'aluminium box hull with a rear ramp', check: (s) => hullShape(s) && tall(1.8)(s) },
    { cue: 'five road wheels, no return rollers', check: run(5, 0) },
  ]),
  'zsu-37-2': ground('zsu-37-2', [
    { cue: 'twin 37 mm with muzzle brakes', check: (s) => guns(2)(s) && muzzle(s) },
    { cue: 'radar on the turret', check: radar },
  ]),
  ac: ground(['ac1-sentinel', 'ac4-thunderbolt'], [
    { cue: 'cast hull with rounded edges', check: castHull },
    { cue: 'three bogies of paired road wheels', check: (s) => wheels(s) === 6 },
  ]),
  'ac1-sentinel': ground('ac1-sentinel', [{ cue: 'cast turret with the 2-pounder', check: (s) => castTurret(s) && cal(0.04, 0.045)(s) }]),
  'ac4-thunderbolt': ground('ac4-thunderbolt', [{ cue: 'long 17-pounder with a muzzle brake', check: (s) => muzzle(s) && gunLen(4)(s) }]),
  'type-98-ke-ni': ground('type-98-ke-ni', [
    { cue: 'four road wheels, two return rollers', check: run(4, 2) },
    { cue: 'small turret with the 37 mm', check: cal(0.037, 0.04) },
  ]),
  'm728-cev': ground('m728-cev', [
    { cue: 'short fat 165 mm demolition gun', check: (s) => cal(0.16)(s) && gunLen(0, 2)(s) },
    { cue: 'A-frame boom folded back over the turret', check: longRod(4) },
  ]),
  'm551-sheridan': ground('m551-sheridan', [
    { cue: 'five road wheels, no return rollers', check: run(5, 0) },
    { cue: 'short fat 152 mm gun-launcher', check: (s) => cal(0.15)(s) && gunLen(0, 2)(s) },
  ]),
  'p7t-aa': ground('p7t-aa', [
    { cue: 'small half-track', check: (s) => s.chassis === 'halftrack' },
    { cue: 'quad machine guns in the open back', check: (s) => guns(4)(s) && openAbove(s) },
  ]),
  '2s19-msta': ground('2s19-msta', [
    { cue: 'six road wheels behind skirts', check: (s) => wheels(s) === 6 && skirted(s) },
    { cue: 'very large turret with the long 152 mm', check: (s) => turretL(4)(s) && muzzle(s) && gunLen(6)(s) },
  ]),
  't-60': ground('t-60', [
    { cue: 'four road wheels, three return rollers', check: run(4, 3) },
    { cue: 'small turret offset left with the 20 mm', check: (s) => turretOff(-1)(s) && cal(0.02, 0.025)(s) },
  ]),
  'zsu-23-4-shilka': ground('zsu-23-4-shilka', [
    { cue: 'four 23 mm cannon', check: guns(4) },
    { cue: 'radar dish on the turret back', check: radar },
    { cue: 'six road wheels, no return rollers', check: run(6, 0) },
  ]),
  'dicker-max': ground('dicker-max', [
    { cue: 'tall open casemate with the long 105 mm and a muzzle brake', check: (s) => casemate(s) && muzzle(s) && cal(0.105)(s) },
    { cue: 'Panzer IV running gear', check: run(8, 4) },
  ]),
  'l6-40': ground('l6-40', [
    { cue: 'four road wheels, three return rollers', check: run(4, 3) },
    { cue: 'small turret offset right with the 20 mm', check: (s) => turretOff(1)(s) && cal(0.02, 0.025)(s) },
  ]),
  ystervark: ground('ystervark', [
    { cue: 'two-axle mine-protected lorry', check: lorry(2) },
    { cue: '20 mm on the load bed', check: guns(1) },
  ]),
  'ro-go': ground('ro-go', [
    { cue: 'nine small road wheels a side', check: (s) => wheels(s) === 9 },
    { cue: 'main turret with the 70 mm and machine-gun sub-turrets', check: (s) => guns(3)(s) && partsOf(s).length >= 2 },
  ]),
  t77e1: ground('t77e1', [
    { cue: 'six .50 machine guns in one turret', check: guns(6) },
    { cue: 'M24 running gear: five road wheels, three return rollers', check: run(5, 3) },
  ]),
  bosvark: ground('bosvark', [
    { cue: 'three-axle lorry', check: lorry(3) },
    { cue: 'ZU-23-2 twin 23 mm on the load bed', check: guns(2) },
  ]),
  'isu-152': ground('isu-152', [{ cue: 'short thick 152 mm with a muzzle brake', check: (s) => muzzle(s) && cal(0.15)(s) }]),
  'isu-122': ground('isu-122', [{ cue: 'long 122 mm without a muzzle brake', check: (s) => noMuzzle(s) && cal(0.12)(s) }]),
  'isu-122s': ground('isu-122s', [{ cue: 'long 122 mm with a muzzle brake', check: (s) => muzzle(s) && cal(0.12)(s) }]),
  'amc-35': ground('amc-35', [
    { cue: 'five road wheels, three return rollers', check: run(5, 3) },
    { cue: 'turret with the 47 mm', check: cal(0.047, 0.05) },
  ]),
  'kv-1s': ground('kv-1s', [{ cue: 'smaller cast turret with a cupola', check: (s) => castTurret(s) && cupolaAny(s) }]),
  'kv-85': ground('kv-85', [{ cue: 'IS-type cast turret with the 85 mm', check: (s) => castTurret(s) && cal(0.085)(s) }]),
  neubaufahrzeug: ground('neubaufahrzeug', [
    { cue: '75 mm and 37 mm in one main turret', check: guns(2) },
    { cue: 'machine-gun sub-turrets fore and aft', check: (s) => partsOf(s).length >= 2 },
    { cue: 'running gear behind armoured skirts', check: wrapTracks },
  ]),
  'hotchkiss-h35': ground('hotchkiss-h35', [
    { cue: 'cast hull', check: castHull },
    { cue: 'cast APX-R turret with the 37 mm', check: (s) => castTurret(s) && cal(0.037, 0.04)(s) },
    { cue: 'six road wheels, two return rollers', check: run(6, 2) },
  ]),
  'sturer-emil': ground('sturer-emil', [
    { cue: 'very long 128 mm in an open casemate', check: (s) => casemate(s) && cal(0.128)(s) && gunLen(5)(s) },
    { cue: 'six road wheels, three return rollers', check: run(6, 3) },
  ]),
  'na-to': ground('na-to', [{ cue: '75 mm behind a shield on an open deck', check: (s) => casemate(s) && cal(0.075)(s) }]),
  'putilov-garford': ground('putilov-garford', [
    { cue: 'tall lorry body', check: (s) => axles(2)(s) && tall(2.4)(s) },
    { cue: '76 mm in a turret at the back', check: (s) => turretAt(-9, -1)(s) && cal(0.076)(s) },
  ]),
  '2s25-sprut-sd': ground('2s25-sprut-sd', [
    { cue: 'seven road wheels behind skirts', check: (s) => wheels(s) === 7 && skirted(s) },
    { cue: 'long 125 mm without a muzzle brake', check: (s) => noMuzzle(s) && cal(0.125)(s) },
  ]),
  't-90a': ground('t-90a', [
    { cue: 'six road wheels behind skirts', check: (s) => wheels(s) === 6 && skirted(s) },
    { cue: 'flat turret with the 125 mm', check: cal(0.125) },
    { cue: "commander's cupola", check: cupolaAny },
  ]),
  'm1097-avenger': ground('m1097-avenger', [
    { cue: 'HMMWV with the missile turret on the back', check: (s) => axles(2)(s) && rockets(s) },
  ]),
  'm163-vulcan': ground('m163-vulcan', [
    { cue: 'M113 hull, five road wheels', check: run(5, 0) },
    { cue: 'open turret with the Vulcan and its radar', check: (s) => openAbove(s) && radar(s) },
  ]),
  'valentine-aa': ground('valentine-aa', [{ cue: 'twin 20 mm in the turret', check: guns(2) }]),
  a7v: ground('a7v', [
    { cue: 'huge armoured box over the tracks', check: (s) => wrapTracks(s) && tall(2.5)(s) },
    { cue: '57 mm in the front', check: cal(0.057) },
  ]),
  't-34-1941': ground('t-34-1941', [{ cue: 'longer 76 mm F-34', check: gunLen(1.6) }]),
  'c13-t90': ground('c13-t90', [
    { cue: 'five road wheels, no return rollers', check: run(5, 0) },
    { cue: 'turret with the 90 mm and a muzzle brake', check: (s) => muzzle(s) && cal(0.09)(s) },
  ]),
  'bm-13-katyusha': ground('bm-13-katyusha', [
    { cue: 'three-axle lorry', check: axles(3) },
    { cue: 'rocket rails over the bed', check: rockets },
  ]),
  // ---------------------------------------------------------------- catalogue pass: remaining ground figures
  // Soviet and Chinese MBTs: T-54/55 and Type 59/69, T-62, T-64, T-72, T-80, T-90.
  't-54-55': ground(['t-55a', 'to-55', 'type-69-2', 'ztz-59a', 'ztz-59d1'], [
    { cue: 'five evenly spaced road wheels, no return rollers', check: (s) => run(5, 0)(s) },
    { cue: 'low cast dome turret', check: castTurret },
    { cue: 'long gun with a fume extractor near the muzzle', check: (s) => evacuator(s) && gunLen(5)(s) },
  ]),
  't-55a': ground('t-55a', [{ cue: 'D-10T 100 mm, no skirts', check: (s) => cal(0.1, 0.105)(s) && !skirted(s) }]),
  'to-55': ground('to-55', [
    { cue: 'flame gun beside the 100 mm', modelled: false, note: 'the coaxial flame projector is too small to draw' },
    { cue: 'T-55 turret and hull', check: (s) => castTurret(s) && cal(0.1, 0.105)(s) },
  ]),
  'type-69-2': ground('type-69-2', [
    { cue: 'rubber side skirts', check: skirted },
    { cue: 'smoothbore 100 mm with an evacuator', check: (s) => cal(0.1, 0.105)(s) && evacuator(s) },
  ]),
  'ztz-59a': ground('ztz-59a', [{ cue: 'rifled 105 mm with a thermal sleeve and an evacuator', check: (s) => cal(0.105, 0.11)(s) && sleeved(s) && evacuator(s) }]),
  'ztz-59d1': ground('ztz-59d1', [
    { cue: 'ERA blocks on the turret front and glacis', check: adds('box', 10) },
    { cue: 'side skirts', check: skirted },
    { cue: 'rifled 105 mm with a thermal sleeve', check: (s) => cal(0.105, 0.11)(s) && sleeved(s) },
  ]),
  't-62': ground(['t-62', 'it-1'], [
    { cue: 'five road wheels, wider gaps toward the rear, no return rollers', check: run(5, 0) },
    { cue: 'round cast turret further back than the T-55', check: castTurret },
  ]),
  't-62-gun': ground('t-62', [{ cue: '115 mm smoothbore with an evacuator part way along', check: (s) => cal(0.115, 0.12)(s) && evacuator(s) }]),
  'it-1': ground('it-1', [
    { cue: 'no gun: the missile launcher rises from the turret roof', check: (s) => !s.guns?.length && longRod(0.8)(s) },
    { cue: 'flattened T-62 type turret', check: (s) => castTurret(s) && (s.turret?.height ?? 1) <= 0.75 },
  ]),
  't-64': ground(['t-64a', 't-64b'], [
    { cue: 'six small road wheels close together', check: run(6) },
    { cue: 'low cast turret with the 125 mm', check: (s) => castTurret(s) && cal(0.125)(s) },
    { cue: '125 mm with a thermal sleeve and evacuator', check: (s) => sleeved(s) && evacuator(s) },
  ]),
  't-64a': ground('t-64a', [{ cue: 'spring-out gill plates on the fenders, no skirts', check: (s) => !s.skirts && adds('box', 4, 'hull')(s) }]),
  't-64b': ground('t-64b', [{ cue: 'rubber skirts and the Kobra antenna on the roof', check: (s) => skirted(s) && adds('box', 2, 'turret')(s) }]),
  't-72': ground(['t-72a', 't-72av', 't-72b', 't-72b-1989', 't-72b3', 't-90', 't-90m'], [
    { cue: 'six large road wheels behind rubber skirts', check: (s) => run(6)(s) && skirted(s) },
    { cue: '125 mm with a thermal sleeve and an evacuator', check: (s) => cal(0.125)(s) && sleeved(s) && evacuator(s) },
    { cue: "commander's cupola with the machine gun", check: cupolaAny },
  ]),
  't-72a': ground('t-72a', [
    { cue: 'plain cast turret, smoke dischargers on its front', check: (s) => castTurret(s) && adds('box', 1, 'turret')(s) },
    { cue: 'searchlight right of the gun', check: adds('blob', 1, 'turret') },
  ]),
  't-72av': ground('t-72av', [{ cue: 'Kontakt-1 bricks on the turret and glacis', check: (s) => adds('box', 5, 'turret')(s) && adds('box', 10, 'hull')(s) }]),
  't-72b': ground('t-72b', [
    { cue: 'thicker cast cheeks ("Super Dolly Parton")', check: castTurret },
    { cue: 'Kontakt-1 rows on turret and glacis', check: (s) => adds('box', 5, 'turret')(s) && adds('box', 10, 'hull')(s) },
  ]),
  't-72b-k5': ground(['t-72b-1989', 't-72b3', 't-72b3-arena-m', 't-90'], [
    { cue: 'squared Kontakt-5 brow over the turret front', check: angular },
    { cue: 'K-5 plate on the glacis, boxes on the front skirts', check: adds('box', 4, 'hull') },
  ]),
  't-72b3': ground(['t-72b3', 't-72b3-arena-m'], [{ cue: 'Sosna-U sight box on the roof', check: adds('box', 2, 'turret') }]),
  't-72b3-arena-m': ground('t-72b3-arena-m', [
    { cue: "Arena-M radar head on its mast over the turret's rear", check: (s) => (s.addOns ?? []).some((a) => a.on === 'turret' && a.kind === 'drum' && a.at[2] >= 1.5 && a.size[0] >= 0.6) },
    { cue: "launcher boxes along the turret's sides", check: (s) => (s.addOns ?? []).filter((a) => a.on === 'turret' && a.kind === 'box' && a.mirror && Math.abs(a.at[1]) >= 1.3).length >= 2 },
  ]),
  't-90': ground('t-90', [{ cue: 'Shtora dazzlers either side of the gun', check: adds('box', 3, 'turret') }]),
  't-90m': ground('t-90m', [
    { cue: 'welded turret with a long bustle', check: (s) => angular(s) && turretL(4)(s) },
    { cue: 'Relikt on the skirts and glacis', check: adds('box', 6, 'hull') },
  ]),
  't-80': ground(['t-80b', 't-80u', 't-80ud', 't-80ue1', 't-80uk', 't-80bvm'], [
    { cue: 'six road wheels with rubber skirts, long flat engine deck', check: (s) => run(6)(s) && skirted(s) && longHull(7)(s) },
    { cue: '125 mm with a thermal sleeve', check: (s) => cal(0.125)(s) && sleeved(s) },
  ]),
  't-80b': ground('t-80b', [{ cue: 'T-64 type cast turret, searchlight right of the gun', check: (s) => castTurret(s) && adds('blob', 1, 'turret')(s) }]),
  't-80u': ground(['t-80u', 't-80ud', 't-80ue1', 't-80uk'], [
    { cue: 'Kontakt-5 horseshoe round the turret front', check: (s) => angular(s) && (s.turret?.width ?? 0) >= 3.1 },
    { cue: 'stowage box round the turret back', check: adds('box', 2, 'turret') },
    { cue: 'K-5 on the glacis and front skirts', check: adds('box', 4, 'hull') },
  ]),
  't-80uk': ground('t-80uk', [
    { cue: 'Shtora dazzler lamps either side of the gun', check: (s) => (s.addOns ?? []).some((a) => a.on === 'turret' && a.kind === 'box' && a.mirror && a.at[0] >= 1.6 && a.size[1] >= 0.35) },
    { cue: "aerosol grenade launcher clusters on the turret's sides", check: (s) => (s.addOns ?? []).some((a) => a.on === 'turret' && a.metal && a.mirror && Math.abs(a.at[1]) >= 1.3) },
    { cue: 'command radio mast', modelled: false, note: 'raised only at the halt' },
  ]),
  't-80ud': ground('t-80ud', [{ cue: 'taller grilled diesel engine deck', check: adds('box', 5, 'hull') }]),
  't-80ue1': ground('t-80ue1', [{ cue: 'Sosna-U box on the roof', check: adds('box', 4, 'turret') }]),
  't-80bvm': ground('t-80bvm', [{ cue: 'Relikt on turret and skirts, slat armour round the engine', check: adds('box', 7, 'hull') }]),
  't-84-oplot-m': ground('t-84-oplot-m', [
    { cue: 'welded turret with a big bustle', check: (s) => angular(s) && turretL(4.2)(s) },
    { cue: 'Nizh/Duplet modules on the hull and skirts', check: adds('box', 6, 'hull') },
    { cue: 'six road wheels behind skirts', check: (s) => run(6)(s) && skirted(s) },
  ]),
  'bmpt-terminator': ground(['bmpt-terminator', 'bmpt-72'], [
    { cue: 'T-72 hull, six road wheels', check: run(6) },
    { cue: "twin 30 mm cannon in an armoured housing on the module's roof", check: (s) => guns(2)(s) && cal(0.03, 0.031)(s) && (mainGun(s)?.at ?? 0) > 1 },
    { cue: 'armoured Ataka launcher boxes either side of the module', check: (s) => (s.addOns ?? []).some((a) => a.on === 'turret' && a.kind === 'box' && a.mirror && a.size[0] >= 2) },
    { cue: "commander's sight on its post at the module's rear", check: (s) => (s.addOns ?? []).some((a) => a.on === 'turret' && a.kind === 'drum' && a.at[0] < -0.8) },
    { cue: "slat armour round the hull's back", check: (s) => (s.addOns ?? []).some((a) => a.on === 'hull' && a.metal && a.size[1] <= 0.06 && a.mirror) },
  ]),
  'bmpt-only': ground('bmpt-terminator', [
    { cue: 'grenade launcher pods on the front fenders', check: (s: GroundSpec) => (s.addOns ?? []).some((a) => a.on === 'hull' && a.kind === 'box' && a.mirror && a.at[0] >= 2.5 && a.at[2] < 1.4 && a.size[1] >= 0.4) },
    { cue: 'Relikt along the screens', check: adds('box', 6, 'hull') },
  ]),
  'bmpt-72': ground('bmpt-72', [{ cue: 'no grenade launcher pods, thicker launcher boxes', check: (s) => !((s: GroundSpec) => (s.addOns ?? []).some((a) => a.on === 'hull' && a.kind === 'box' && a.mirror && a.at[0] >= 2.5 && a.at[2] < 1.4 && a.size[1] >= 0.4))(s) && (s.addOns ?? []).some((a) => a.on === 'turret' && a.kind === 'box' && a.mirror && a.size[1] >= 0.5) }]),
  // Chinese MBTs.
  'ztz-88': ground('ztz-88', [
    { cue: 'six road wheels, three return rollers, short skirts', check: (s) => run(6, 3)(s) && skirted(s) },
    { cue: 'T-55 like cast turret with the 105 mm', check: (s) => castTurret(s) && cal(0.105)(s) },
  ]),
  'ztz-96': ground(['ztz-96', 'ztz-96b'], [
    { cue: 'six road wheels behind skirts', check: (s) => run(6)(s) && skirted(s) },
    { cue: 'welded angular turret with the 125 mm', check: (s) => angular(s) && cal(0.125)(s) },
  ]),
  'ztz-96b': ground('ztz-96b', [
    { cue: 'arrow-head add-on armour on the turret front', check: (s) => turretL(4.3)(s) && adds('box', 1, 'turret')(s) },
    { cue: 'short T-72-like hull, six road wheels behind skirts', check: (s) => run(6)(s) && skirted(s) && !longHull(7.2)(s) },
    { cue: 'add-on plate over the upper glacis', check: (s) => (s.addOns ?? []).filter((a) => a.on === 'hull' && a.kind === 'box' && (a.pitch ?? 0) < 0).length >= 1 },
    { cue: '125 mm with an evacuator', check: (s) => cal(0.125)(s) && evacuator(s) },
  ]),
  'ztz-99a': ground('ztz-99a', [
    { cue: 'six road wheels behind skirts, long hull', check: (s) => run(6)(s) && skirted(s) && longHull(7.5)(s) },
    { cue: 'arrow-shaped turret front coming to a point well ahead of the mantlet', check: (s) => angular(s) && turretL(5.6)(s) && s.turret!.outline!.plan.at(-1)![0] - (s.turret?.gunX ?? 9) >= 0.5 },
    { cue: 'reactive bricks over the glacis', check: (s) => (s.addOns ?? []).filter((a) => a.on === 'hull' && a.kind === 'box' && (a.pitch ?? 0) < 0).length >= 4 },
    { cue: 'reactive boxes on the front of the skirts', check: (s) => (s.addOns ?? []).filter((a) => a.on === 'hull' && a.kind === 'box' && Math.abs(a.at[1]) > s.width / 2).length >= 3 },
    { cue: "commander's panoramic sight on the roof", check: adds('drum', 1, 'turret') },
    { cue: '125 mm with a sleeve and evacuator', check: (s) => cal(0.125)(s) && evacuator(s) },
  ]),  'ztz-99-era': ground('ztz-99-era', [
    { cue: 'reactive boxes over the turret cheeks angled into an arrowhead', check: (s) => (s.addOns ?? []).filter((a) => a.on === 'turret' && a.kind === 'box' && !!a.mirror && (a.yaw ?? 0) < -0.4).length >= 1 },
    { cue: 'reactive bricks over the glacis', check: (s) => (s.addOns ?? []).filter((a) => a.on === 'hull' && a.kind === 'box' && (a.pitch ?? 0) < 0).length >= 4 },
  ]),

  'ztz-99': ground(['ztz-99', 'ztz-99-era'], [
    { cue: 'six road wheels behind skirts, long hull', check: (s) => run(6)(s) && skirted(s) && longHull(7.5)(s) },
    { cue: 'long angular turret with a pointed front', check: (s) => angular(s) && turretL(5)(s) },
    { cue: '125 mm with a sleeve and evacuator', check: (s) => cal(0.125)(s) && evacuator(s) },
  ]),
  'mbt-2000': ground('mbt-2000', [
    { cue: 'six road wheels behind skirts', check: (s) => run(6)(s) && skirted(s) },
    { cue: 'welded turret with a bustle rack, 125 mm', check: (s) => angular(s) && cal(0.125)(s) },
  ]),
  // Leopard 2 family.
  'leopard-2': ground(['leopard-2a4', 'leopard-2a4m-can', 'leopard-2a5', 'leopard-2a7', 'strv-122', 'strv-121b', 'leopard-2pl'], [
    { cue: 'seven road wheels behind skirts', check: (s) => run(7)(s) && skirted(s) },
    { cue: 'flat-sided welded turret, 120 mm with an evacuator', check: (s) => angular(s) && cal(0.12)(s) && evacuator(s) },
    { cue: 'stowage bin across the turret rear', check: (s) => adds('box', 1, 'turret')(s) || adds('drum', 1, 'turret')(s) },
  ]),
  'leopard-2a4': ground(['leopard-2a4', 'strv-121b'], [{ cue: 'upright flat turret front, no wedges', check: (s) => !wedgeTurret(s) }]),
  'leopard-2-wedge': ground(['leopard-2a5', 'leopard-2a7', 'strv-122'], [{ cue: 'arrow-head wedge armour on the turret front', check: wedgeTurret }]),
  'leopard-2a7': ground('leopard-2a7', [
    { cue: 'long L55 gun', check: gunLen(6) },
    { cue: 'add-on armour on the hull front and skirts', check: adds('box', 6, 'hull') },
  ]),
  'strv-122': ground('strv-122', [{ cue: 'thick roof armour and armoured skirts', check: adds('box', 4, 'hull') }]),
  'leopard-2a4m-can': ground('leopard-2a4m-can', [
    { cue: 'short L/44 gun', check: (s) => cal(0.12)(s) && gunLen(5, 6)(s) },
    { cue: 'upright add-on modules squaring the turret front and down its sides, no wedge', check: (s) => !wedgeTurret(s) && turretL(4.4)(s) && (s.turret?.width ?? 0) >= 3.35 },
    { cue: 'armour module on the hull front, armoured skirts', check: adds('box', 6, 'hull') },
    { cue: "slat panels on the turret bustle and the hull's back", check: (s) => (s.addOns ?? []).filter((a) => a.metal && a.kind === 'box' && Math.min(a.size[0], a.size[1]) <= 0.1 && a.size[2] >= 0.5).length >= 2 },
  ]),
  'leopard-2pl': ground('leopard-2pl', [{ cue: 'upright add-on modules on the 2A4 turret front, no wedges', check: (s) => !wedgeTurret(s) && turretL(4.5)(s) }]),
  // Leopard 1 family.
  'leopard-1': ground(['leopard-1', 'leopard-1a1', 'leopard-1a1a1', 'leopard-1a3', 'leopard-1a5', 'leopard-c2-mexas'], [
    { cue: 'seven road wheels', check: run(7) },
    { cue: 'L7 105 mm with an evacuator', check: (s) => cal(0.105)(s) && evacuator(s) },
    { cue: "commander's cupola", check: cupolaAny },
  ]),
  'leopard-1-cast': ground(['leopard-1', 'leopard-1a1', 'leopard-1a1a1'], [{ cue: 'cast turret with sloped sides', check: castTurret }]),
  'leopard-1a1': ground(['leopard-1a1', 'leopard-1a1a1'], [{ cue: 'thermal sleeve and rubber skirts', check: (s) => sleeved(s) && skirted(s) }]),
  'leopard-1a1a1': ground('leopard-1a1a1', [{ cue: 'bolted spaced armour on the turret', check: adds('box', 3, 'turret') }]),
  'leopard-1a3': ground(['leopard-1a3', 'leopard-1a5'], [{ cue: 'welded angular turret', check: angular }]),
  'leopard-1a5': ground('leopard-1a5', [{ cue: 'wedge-faced add-on turret with the EMES 18 box', check: adds('box', 1, 'turret') }]),
  'leopard-c2-mexas': ground('leopard-c2-mexas', [
    { cue: 'MEXAS armour slabs round the turret', check: (s) => (s.turret?.width ?? 0) >= 3.3 },
    { cue: 'armour panels on the hull sides', check: adds('box', 6, 'hull') },
  ]),
  'turm-iii': ground('turm-iii', [
    { cue: 'Leopard 1 hull, seven road wheels', check: run(7) },
    { cue: 'low flat turret with a 105 mm', check: (s) => cal(0.105)(s) && (s.turret?.height ?? 1) <= 0.8 },
  ]),
  // M1 Abrams and M10 Booker.
  abrams: ground(['m1-abrams', 'm1ip-abrams', 'm1a2-abrams', 'm1a2-sep', 'm1a2c-sepv3'], [
    { cue: 'seven road wheels behind deep skirts', check: (s) => run(7)(s) && skirted(s) },
    { cue: 'low flat-faced welded turret with a long bustle', check: (s) => angular(s) && turretL(5)(s) },
    { cue: 'bustle rack and stowage boxes on the turret', check: adds('box', 2, 'turret') },
  ]),
  'abrams-105': ground(['m1-abrams', 'm1ip-abrams'], [{ cue: 'M68 105 mm with a thermal sleeve and an evacuator', check: (s) => cal(0.105, 0.11)(s) && sleeved(s) && evacuator(s) }]),
  'm1ip-abrams': ground('m1ip-abrams', [{ cue: 'longer turret with the thicker front armour', check: turretL(5.4) }]),
  'abrams-120': ground(['m1a2-abrams', 'm1a2-sep', 'm1a2c-sepv3'], [{ cue: 'M256 120 mm smoothbore with an evacuator', check: (s) => cal(0.12)(s) && evacuator(s) }]),
  'm1a2-abrams': ground(['m1a2-abrams', 'm1a2-sep', 'm1a2c-sepv3'], [{ cue: "commander's independent thermal viewer on the roof", check: adds('drum', 1, 'turret') }]),
  'm1a2c-sepv3': ground('m1a2c-sepv3', [{ cue: 'armour on the front of the hull and more roof gear', check: (s) => adds('box', 1, 'hull')(s) && adds('box', 4, 'turret')(s) }]),
  'm10-booker': ground('m10-booker', [
    { cue: 'seven road wheels behind skirts', check: (s) => run(7)(s) && skirted(s) },
    { cue: 'flat welded turret with the 105 mm', check: (s) => angular(s) && cal(0.105)(s) },
  ]),
  // M60 / Patton family.
  patton: ground(['m60', 'm60a1', 'm60a3', 'magach-6', 'magach-7', 'm60a2', 'cm-11'], [
    { cue: 'six road wheels, three return rollers', check: run(6, 3) },
    { cue: 'straight-sloped M60 glacis, no bow step', check: hullShape },
    { cue: 'M19 cupola on the turret roof', check: adds('drum', 1, 'turret') },
  ]),
  'm60': ground(['m60', 'cm-11'], [{ cue: 'rounded M48 type cast turret', check: (s) => castTurret(s) && !turretL(4.2)(s) }]),
  'm60a1': ground(['m60a1', 'm60a3', 'magach-6'], [{ cue: 'long needle-nosed cast turret', check: (s) => castTurret(s) && turretL(4.3)(s) }]),
  'm60-105': ground(['m60', 'm60a1', 'm60a3', 'magach-6', 'magach-7', 'cm-11'], [{ cue: 'M68 105 mm with an evacuator', check: (s) => cal(0.105, 0.11)(s) && evacuator(s) }]),
  'm60a3': ground('m60a3', [{ cue: 'thermal sleeve on the gun, laser rangefinder', check: sleeved }]),
  'magach-6': ground('magach-6', [{ cue: 'Blazer ERA bricks on turret and hull', check: (s) => adds('box', 10, 'turret')(s) && adds('box', 8, 'hull')(s) }]),
  'magach-7': ground('magach-7', [
    { cue: 'squared passive armour shell round the turret', check: (s) => angular(s) && (s.turret?.width ?? 0) >= 3.3 },
    { cue: 'side skirts', check: skirted },
  ]),
  'm60a2': ground('m60a2', [
    { cue: 'narrow "Starship" turret with a stub 152 mm', check: (s) => cal(0.15)(s) && gunLen(0, 3)(s) && (s.turret?.width ?? 9) < 2.8 },
  ]),
  'cm-11': ground('cm-11', [{ cue: 'thermal sleeve on the 105 mm', check: sleeved }]),
  // T54E1/E2, T58, T95, MBT-70.
  't54e1': ground(['t54e1', 't58'], [
    { cue: 'oscillating turret: the gun rides in the upper half', check: (s) => partsOf(s).length >= 1 && !!s.guns?.some((g) => g.turret) },
    { cue: 'M48/M103 running gear with many return rollers', check: (s) => rollers(s) >= 5 },
  ]),
  't54e2': ground('t54e2', [
    { cue: 'conventional long turret with the 120 mm', check: (s) => turretL(4.5)(s) && cal(0.12)(s) },
    { cue: 'six road wheels, five return rollers', check: run(6, 5) },
  ]),
  't58': ground('t58', [{ cue: '155 mm with an evacuator', check: (s) => cal(0.155)(s) && evacuator(s) }]),
  't95e1': ground('t95e1', [
    { cue: 'six road wheels, no return rollers', check: run(6, 0) },
    { cue: 'compact turret with the 90 mm smoothbore', check: (s) => cal(0.09, 0.1)(s) && evacuator(s) },
  ]),
  'mbt-70': ground(['mbt-70', 'kpz-70', 'xm803'], [
    { cue: 'six road wheels behind skirts, low hull', check: (s) => run(6)(s) && skirted(s) && low(1.4)(s) },
    { cue: 'wide flat turret over the whole hull', check: (s) => (s.turret?.width ?? 0) >= 3.2 && turretL(4.2)(s) },
  ]),
  'mbt-70-152': ground(['mbt-70', 'xm803'], [{ cue: 'stubby 152 mm gun-launcher', check: (s) => cal(0.15)(s) && gunLen(0, 4)(s) }]),
  'kpz-70': ground('kpz-70', [{ cue: 'long 120 mm with an evacuator', check: (s) => cal(0.12)(s) && evacuator(s) }]),
  't95-super-heavy': ground('t95-super-heavy', [
    { cue: 'low casemate, the 105 mm fixed in the hull front', check: (s) => noTurret(s) && hullGun(s) },
    { cue: 'very wide: double tracks each side', check: wideHull(4.3) },
  ]),
  // Merkava family.
  merkava: ground(['merkava-mk1', 'merkava-mk2', 'merkava-mk3', 'merkava-mk3d', 'merkava-mk4', 'merkava-mk4m', 'namer'], [
    { cue: 'six road wheels behind skirts', check: (s) => run(6)(s) && skirted(s) },
    { cue: 'engine in front: long sloped nose, door in the back', check: hullShape },
  ]),
  'merkava-turret': ground(['merkava-mk1', 'merkava-mk2', 'merkava-mk3', 'merkava-mk3d', 'merkava-mk4', 'merkava-mk4m'], [
    { cue: 'long narrow wedge turret set well back', check: (s) => turretAt(-9, -0.8)(s) && turretL(4.5)(s) },
  ]),
  'merkava-105': ground(['merkava-mk1', 'merkava-mk2'], [{ cue: '105 mm with thermal sleeve and evacuator', check: (s) => cal(0.105, 0.11)(s) && evacuator(s) }]),
  'merkava-mk2': ground('merkava-mk2', [{ cue: 'add-on armour on the turret front and sides', check: adds('box', 3, 'turret') }]),
  'merkava-120': ground(['merkava-mk3', 'merkava-mk3d', 'merkava-mk4', 'merkava-mk4m'], [
    { cue: 'long 120 mm smoothbore, no evacuator', check: (s) => cal(0.12)(s) && !evacuator(s) },
    { cue: 'bigger angular turret with modular armour', check: (s) => angular(s) && turretL(5.2)(s) },
  ]),
  'merkava-mk3': ground(['merkava-mk3', 'merkava-mk3d'], [
    { cue: 'armour boxes on the hull and skirts', check: adds('box', 3, 'hull') },
    { cue: 'ball-and-chain curtain under the turret bustle', check: (s) => !!s.addOns?.some((a) => a.on === 'turret' && a.kind === 'box' && a.at[0] < -2 && a.size[1] > 2) },
  ]),
  'merkava-mk3d': ground('merkava-mk3d', [
    { cue: 'Dor Dalet turret: front modules swept into a long wedge ahead of the mantlet', check: (s) => s.turret!.outline!.plan.at(-1)![0] - (s.turret?.gunX ?? 9) >= 0.4 },
    { cue: "Baz commander's sight head on the roof", check: adds('drum', 1, 'turret') },
  ]),
  'merkava-mk4m': ground('merkava-mk4m', [{ cue: 'Trophy radar panels and launchers on the turret sides', check: adds('box', 2, 'turret') }]),
  namer: ground('namer', [
    { cue: 'no turret: tall troop compartment on the Merkava 4 hull', check: (s) => noTurret(s) && !s.guns?.length },
    { cue: 'remote weapon station on the roof', check: cupolaAny },
  ]),
  sholef: ground('sholef', [
    { cue: 'Merkava hull, six road wheels behind skirts', check: (s) => run(6)(s) && skirted(s) },
    { cue: 'huge box turret at the back with a long 155 mm', check: (s) => turretH(1.5)(s) && cal(0.155)(s) && gunLen(7)(s) },
  ]),
  // Chieftain, Challenger, Khalid and Vickers.
  chieftain: ground(['chieftain-mk3', 'chieftain-mk10', 'chieftain-900', 'chieftain-marksman', 'challenger-1', 'challenger-ds'], [
    { cue: 'six road wheels in pairs behind skirt plates', check: (s) => run(6)(s) && skirted(s) },
    { cue: 'reclined driver: very shallow glacis', check: hullShape },
  ]),
  'chieftain-gun': ground(['chieftain-mk3', 'chieftain-mk10', 'chieftain-900', 'challenger-1', 'challenger-ds'], [
    { cue: 'long L11 120 mm with sleeve and evacuator', check: (s) => cal(0.12)(s) && sleeved(s) && evacuator(s) },
  ]),
  'chieftain-mk3': ground(['chieftain-mk3', 'chieftain-mk10'], [{ cue: 'cast turret sloping to a flat roof', check: castTurret }]),
  'chieftain-mk10': ground('chieftain-mk10', [{ cue: 'Stillbrew armour pads on the turret front', check: adds('box', 2, 'turret') }]),
  'chieftain-900': ground('chieftain-900', [{ cue: 'squared composite-armour turret', check: angular }]),
  'chieftain-marksman': ground('chieftain-marksman', [
    { cue: 'Marksman turret: twin 35 mm and a radar on the roof', check: (s) => guns(2)(s) && radar(s) },
  ]),
  'challenger-1': ground(['challenger-1', 'challenger-ds'], [
    { cue: 'flat-faced Chobham turret', check: angular },
    { cue: 'longer, taller hull than the Chieftain', check: longHull(8) },
  ]),
  'challenger-ds': ground('challenger-ds', [{ cue: 'add-on armour on the hull sides and front', check: adds('box', 6, 'hull') }]),
  vickers: ground(['vickers-mbt-mk1', 'vickers-mbt-mk3'], [
    { cue: 'six road wheels, three return rollers', check: run(6, 3) },
    { cue: 'L7 105 mm with an evacuator', check: (s) => cal(0.105, 0.11)(s) && evacuator(s) },
    { cue: "commander's cupola", check: cupolaAny },
  ]),
  'vickers-mbt-mk1': ground('vickers-mbt-mk1', [{ cue: 'flat welded turret', check: angular }]),
  'vickers-mbt-mk3': ground('vickers-mbt-mk3', [{ cue: 'cast turret front, thermal sleeve', check: (s) => castTurret(s) && sleeved(s) }]),
  'vickers-mk7': ground('vickers-mk7', [
    { cue: 'Leopard 2 hull, seven road wheels behind skirts', check: (s) => run(7)(s) && skirted(s) },
    { cue: 'long angular turret with the 120 mm', check: (s) => angular(s) && turretL(4.8)(s) && cal(0.12)(s) },
  ]),
  'vickers-mk11': ground('vickers-mk11', [
    { cue: 'six-wheeled armoured car', check: lorry(3) },
    { cue: 'large turret with a 105 mm and a muzzle brake', check: (s) => cal(0.105)(s) && muzzle(s) },
  ]),
  'olifant-mk2': ground('olifant-mk2', [
    { cue: 'Centurion hull: six road wheels behind skirt plates', check: (s) => run(6)(s) && skirted(s) },
    { cue: 'cast Centurion turret with add-on armour', check: (s) => castTurret(s) && adds('box', 2, 'turret')(s) },
    { cue: 'L7 105 mm with an evacuator', check: (s) => cal(0.105)(s) && evacuator(s) },
  ]),
  // Japanese MBTs and wheeled vehicles.
  'type-74': ground('type-74', [
    { cue: 'five road wheels, no return rollers, no skirts', check: (s) => run(5, 0)(s) && !skirted(s) },
    { cue: 'low rounded cast turret', check: castTurret },
    { cue: 'L7 type 105 mm', check: cal(0.105, 0.11) },
  ]),
  'type-90': ground('type-90', [
    { cue: 'six road wheels behind skirts', check: (s) => run(6)(s) && skirted(s) },
    { cue: 'boxy welded turret with vertical sides and a bustle autoloader', check: (s) => angular(s) && turretL(3.9)(s) },
    { cue: '120 mm with an evacuator', check: (s) => cal(0.12)(s) && evacuator(s) },
  ]),
  'type-10': ground('type-10', [
    { cue: 'five road wheels behind skirts', check: (s) => run(5)(s) && skirted(s) },
    { cue: 'angular modular turret with a long bustle', check: (s) => angular(s) && turretL(4.5)(s) },
  ]),
  'type-16-mcv': ground('type-16-mcv', [
    { cue: 'eight-wheeled armoured car', check: lorry(4) },
    { cue: 'angular turret with a 105 mm, sleeve and evacuator', check: (s) => angular(s) && cal(0.105)(s) && evacuator(s) },
  ]),
  // Leclerc, Ariete, Arjun.
  leclerc: ground(['leclerc', 'leclerc-xlr', 'msc'], [
    { cue: 'six road wheels behind skirts', check: (s) => run(6)(s) && skirted(s) },
    { cue: 'flat angular turret with a long autoloader bustle', check: (s) => angular(s) && turretL(4)(s) },
    { cue: '120 mm L/52 without an evacuator', check: (s) => cal(0.12)(s) && !evacuator(s) },
  ]),
  'leclerc-xlr': ground('leclerc-xlr', [{ cue: 'added armour packs on hull and turret, RWS', check: (s) => adds('box', 4, 'turret')(s) && adds('box', 6, 'hull')(s) }]),
  embt: ground('embt', [
    { cue: 'Leopard 2 hull: seven road wheels behind skirts', check: (s) => run(7)(s) && skirted(s) },
    { cue: 'Leclerc type turret with the 120 mm, no evacuator', check: (s) => angular(s) && cal(0.12)(s) && !evacuator(s) },
  ]),
  ariete: ground(['ariete', 'ariete-amv'], [
    { cue: 'seven road wheels behind skirts', check: (s) => run(7)(s) && skirted(s) },
    { cue: 'long welded wedge-fronted turret with bustle', check: (s) => angular(s) && turretL(4.5)(s) },
    { cue: '120 mm with an evacuator', check: (s) => cal(0.12)(s) && evacuator(s) },
  ]),
  'ariete-amv': ground('ariete-amv', [{ cue: 'add-on armour blocks on the turret', check: adds('box', 4, 'turret') }]),
  arjun: ground('arjun', [
    { cue: 'seven road wheels behind skirts, long hull', check: (s) => run(7)(s) && skirted(s) },
    { cue: 'boxy welded turret, 120 mm with an evacuator', check: (s) => angular(s) && evacuator(s) },
  ]),
  // Strv 103, Ikv 91, TAM and light tanks.
  'strv-103': ground('strv-103', [
    { cue: 'no turret: the 105 mm fixed in the hull', check: (s) => noTurret(s) && hullGun(s) },
    { cue: 'four road wheels a side', check: run(4) },
    { cue: 'long gun with an evacuator', check: (s) => gunLen(5)(s) && evacuator(s) },
  ]),
  'ikv-91': ground('ikv-91', [
    { cue: 'turret well forward on a low amphibious hull', check: (s) => turretAt(0.4)(s) && low(1.35)(s) },
    { cue: 'six road wheels, no return rollers', check: run(6, 0) },
    { cue: 'low-pressure 90 mm, no muzzle brake', check: (s) => cal(0.09)(s) && noMuzzle(s) },
  ]),
  tam: ground('tam', [
    { cue: 'Marder-type hull, engine forward, turret at the back', check: turretAt(-9, -0.6) },
    { cue: 'six road wheels, three return rollers', check: run(6, 3) },
    { cue: '105 mm with sleeve and evacuator', check: (s) => cal(0.105)(s) && sleeved(s) && evacuator(s) },
  ]),
  'vfm-5': ground('vfm-5', [
    { cue: 'five road wheels, two return rollers', check: run(5, 2) },
    { cue: 'angular turret with a 105 mm', check: (s) => angular(s) && cal(0.105)(s) },
  ]),
  stingray: ground('stingray', [
    { cue: 'six road wheels, three return rollers', check: run(6, 3) },
    { cue: 'low-recoil 105 mm with a pepperpot brake', check: (s) => cal(0.105)(s) && muzzle(s) },
    { cue: 'welded turret with a bustle', check: angular },
  ]),
  'light-105': ground(['ccvl', 'm8-ags', 'th-400', 'ttd', 'harimau', 'vt-5'], [
    { cue: 'road wheels behind side skirts', check: skirted },
    { cue: 'welded angular turret with a 105 mm', check: (s) => angular(s) && cal(0.105, 0.11)(s) },
  ]),
  ccvl: ground('ccvl', [{ cue: 'five road wheels', check: run(5) }]),
  'm8-ags': ground('m8-ags', [{ cue: 'six road wheels, low turret with autoloader', check: (s) => run(6)(s) && (s.turret?.height ?? 1) <= 0.6 }]),
  'six-105': ground(['th-400', 'ttd', 'harimau', 'vt-5'], [{ cue: 'six road wheels', check: run(6) }]),
  'wz-1001': ground('wz-1001', [
    { cue: 'ZTZ-99 long hull, six road wheels behind skirts', check: (s) => run(6)(s) && skirted(s) && longHull(7.5)(s) },
    { cue: 'very long 125 mm (L/54) reaching far past the nose', check: (s) => (s.guns ?? []).some((g) => g.calibre >= 0.12 && g.length >= 6.5) },
    { cue: '125 mm with a sleeve and evacuator', check: (s) => cal(0.125)(s) && evacuator(s) },
  ]),
  'ags-teledyne': ground('ags-teledyne', [
    { cue: 'small overhead mount: gun over a low cradle turret', check: (s) => shortTurret(2.5)(s) && cal(0.105)(s) },
    { cue: 'six road wheels behind skirts', check: (s) => run(6)(s) && skirted(s) },
  ]),
  'mars-15': ground('mars-15', [
    { cue: 'five road wheels behind skirts', check: (s) => run(5)(s) && skirted(s) },
    { cue: 'welded turret with a 90 mm', check: (s) => angular(s) && cal(0.09, 0.1)(s) },
  ]),
  // Soviet prototypes and heavy tanks.
  'object-122mt': ground('object-122mt', [
    { cue: 'six road wheels, three return rollers', check: run(6, 3) },
    { cue: 'cast dome turret with a 120 mm and an evacuator', check: (s) => castTurret(s) && cal(0.12)(s) && evacuator(s) },
  ]),
  'object-140': ground('object-140', [
    { cue: 'six road wheels, three return rollers', check: run(6, 3) },
    { cue: 'very flat cast turret with the 100 mm', check: (s) => castTurret(s) && cal(0.1, 0.105)(s) && evacuator(s) },
  ]),
  'object-435': ground('object-435', [
    { cue: 'six road wheels, three return rollers', check: run(6, 3) },
    { cue: 'cast turret with a 115 mm smoothbore', check: (s) => castTurret(s) && cal(0.115, 0.12)(s) },
  ]),
  'object-685': ground('object-685', [
    { cue: 'six road wheels, five return rollers', check: run(6, 5) },
    { cue: '100 mm with an evacuator', check: (s) => cal(0.1, 0.105)(s) && evacuator(s) },
  ]),
  'object-906': ground('object-906', [
    { cue: 'PT-76 type hull: six road wheels, no return rollers', check: run(6, 0) },
    { cue: 'small cast turret with the 85 mm', check: (s) => castTurret(s) && cal(0.085, 0.09)(s) },
  ]),
  'object-120': ground('object-120', [
    { cue: 'big turret at the very back', check: turretAt(-9, -1.2) },
    { cue: 'extremely long 152 mm with a muzzle brake', check: (s) => cal(0.15)(s) && gunLen(8)(s) && muzzle(s) },
    { cue: 'seven road wheels', check: run(7) },
  ]),
  'is-6': ground('is-6', [
    { cue: 'six road wheels, three return rollers', check: run(6, 3) },
    { cue: 'IS type cast turret with the 122 mm and a muzzle brake', check: (s) => castTurret(s) && cal(0.122)(s) && muzzle(s) },
  ]),
  'kv-122': ground('kv-122', [
    { cue: 'KV-1 hull and running gear', check: run(6, 3) },
    { cue: 'IS type cast turret with the 122 mm and a muzzle brake', check: (s) => castTurret(s) && cal(0.122)(s) && muzzle(s) },
  ]),
  'kv-1e': ground('kv-1e', [
    { cue: 'KV-1 running gear: six road wheels, three return rollers', check: run(6, 3) },
    { cue: 'bolted-on appliqué plates on hull and turret', check: (s) => partsOf(s).length >= 1 },
    { cue: 'welded box turret with the 76 mm', check: (s) => angular(s) && cal(0.076)(s) },
  ]),
  'kv-7': ground('kv-7', [
    { cue: 'fixed casemate on the KV hull', check: (s) => casemate(s) && run(6, 3)(s) },
    { cue: 'three guns side by side: 76 mm between two 45 mm', check: guns(3) },
  ]),
  smk: ground('smk', [
    { cue: 'two turrets in line, the rear one raised over the front', check: (s) => guns(2)(s) && partsOf(s).length >= 1 },
    { cue: 'eight road wheels, four return rollers', check: run(8, 4) },
  ]),
  't-35': ground('t-35', [
    { cue: 'five turrets: big 76 mm turret in the middle', check: (s) => guns(3)(s) && partsOf(s).length >= 2 },
    { cue: 'very long hull with skirted running gear', check: (s) => longHull(9)(s) && wrapTracks(s) },
  ]),
  'su-100y': ground('su-100y', [
    { cue: 'huge box casemate on the T-100 hull', check: (s) => casemate(s) && longHull(8.5)(s) },
    { cue: 'long naval 130 mm', check: (s) => cal(0.13)(s) && gunLen(5)(s) },
    { cue: 'eight road wheels, four return rollers', check: run(8, 4) },
  ]),
  't-34-late': ground(['t-34-1942', 't-34-57', 't-34-57-1943', 't-34-76-1943'], T34),
  't-34-1942': ground(['t-34-1942', 't-34-76-1943'], [{ cue: 'hexagonal turret with the 76 mm', check: (s) => cal(0.076)(s) && (s.turret?.width ?? 0) >= 2.1 }]),
  't-34-57': ground(['t-34-57', 't-34-57-1943'], [{ cue: 'very long thin 57 mm ZiS-4', check: (s) => cal(0.057, 0.06)(s) && gunLen(2.8)(s) }]),
  // German.
  'tiger-i-old': ground('tiger-i', TIGER_I),
  'tiger-ii-old': ground('tiger-ii', TIGER_II),
  maus: ground('maus', [
    { cue: 'enormous hull with skirts over the running gear', check: (s) => skirted(s) && longHull(9)(s) },
    { cue: 'massive turret with the 128 mm and a coaxial 75 mm', check: (s) => cal(0.128)(s) && turretL(4.2)(s) },
  ]),
  brummbar: ground('brummbar', [
    { cue: 'Panzer IV hull with a sloped casemate', check: (s) => casemate(s) && pz4Running(s) },
    { cue: 'short stubby 150 mm howitzer', check: (s) => cal(0.15)(s) && gunLen(0, 1)(s) },
  ]),
  'stug-iv': ground('stug-iv', [
    { cue: 'StuG III casemate on the Panzer IV hull', check: (s) => pz4Running(s) && !!s.guns?.some((g) => g.turret) },
    { cue: '75 mm L/48 with a muzzle brake', check: (s) => cal(0.075)(s) && muzzle(s) },
  ]),
  'pz-iv-70-a': ground('pz-iv-70-a', [
    { cue: 'tall casemate on the Panzer IV hull', check: (s) => casemate(s) && pz4Running(s) },
    { cue: 'very long 75 mm L/70, no muzzle brake', check: (s) => cal(0.075)(s) && gunLen(3.5)(s) && noMuzzle(s) },
  ]),
  'pz-iv-e': ground('pz-iv-e', [
    { cue: 'Panzer IV running gear', check: pz4Running },
    { cue: 'short stub 75 mm L/24', check: (s) => cal(0.075)(s) && gunLen(0, 1.5)(s) },
  ]),
  // British.
  'a33-excelsior': ground('a33-excelsior', [
    { cue: 'six road wheels, three return rollers (US T1 type)', check: run(6, 3) },
    { cue: 'Cromwell-like welded turret with the 75 mm', check: (s) => cal(0.075)(s) && turretShape(s) },
  ]),
  'churchill-iv': ground('churchill-iv', [
    { cue: 'long hull with tracks over the top and many small bogie wheels', check: (s) => wrapTracks(s) && longHull(7)(s) },
    { cue: 'cast turret with the 6-pounder', check: (s) => castTurret(s) && cal(0.057)(s) },
  ]),
  'tog-ii': ground('tog-ii', [
    { cue: 'enormously long hull with all-round tracks', check: (s) => wrapTracks(s) && longHull(10)(s) },
    { cue: 'turret with the 17-pounder', check: (s) => cal(0.076)(s) && muzzle(s) },
  ]),
  independent: ground('independent', [
    { cue: 'big main turret with four machine-gun turrets round it', check: (s) => partsOf(s).length >= 4 },
    { cue: 'eight road wheels, four return rollers', check: run(8, 4) },
  ]),
  'mark-v-male': ground('mark-v-male', [
    { cue: 'rhomboid hull with the tracks running round it', check: (s) => wrapTracks(s) && tall(2.2)(s) },
    { cue: '6-pounders in sponsons on both sides', check: (s) => guns(2)(s) && cal(0.057)(s) },
  ]),
  // French and Italian.
  'saint-chamond': ground('saint-chamond', [
    { cue: 'very long box body overhanging the short tracks', check: (s) => longHull(8.5)(s) && wrapTracks(s) },
    { cue: '75 mm in the nose', check: (s) => casemate(s) && cal(0.075)(s) },
  ]),
  'fcm-36': ground('fcm-36', [
    { cue: 'faceted welded hull and turret', check: (s) => hullShape(s) && angular(s) },
    { cue: 'short 37 mm', check: (s) => cal(0.037, 0.04)(s) && gunLen(0, 1)(s) },
  ]),
  'renault-r35': ground('renault-r35', [
    { cue: 'five road wheels, two return rollers', check: run(5, 2) },
    { cue: 'cast APX-R turret with the 37 mm', check: (s) => castTurret(s) && cal(0.037, 0.04)(s) },
  ]),
  'amr-35-zt3': ground('amr-35-zt3', [
    { cue: 'small tankette with a 25 mm in a casemate', check: (s) => casemate(s) && cal(0.025, 0.03)(s) },
    { cue: 'four road wheels, two return rollers', check: run(4, 2) },
  ]),
  'lorraine-40t': ground('lorraine-40t', [
    { cue: 'oscillating turret with the 100 mm', check: (s) => cal(0.1)(s) && !!s.guns?.some((g) => g.turret) },
    { cue: 'four large road wheels, no return rollers', check: run(4, 0) },
  ]),
  'somua-sm': ground('somua-sm', [
    { cue: 'seven road wheels, no return rollers', check: run(7, 0) },
    { cue: 'long turret with the 100 mm and a muzzle brake', check: (s) => cal(0.1)(s) && muzzle(s) && turretL(3.5)(s) },
  ]),
  'fiat-m11-39': ground('fiat-m11-39', [
    ...ITALIAN_M,
    { cue: '37 mm in the hull, small machine-gun turret offset left', check: (s) => hullGun(s) && turretOff(-1)(s) },
  ]),
  'semovente-l40': ground('semovente-l40', [
    { cue: 'small casemate on the L6 hull', check: casemate },
    { cue: '47 mm offset in the front plate', check: cal(0.047, 0.05) },
  ]),
  // Hungarian and Swedish.
  'toldi-iia': ground('toldi-iia', [
    { cue: 'four road wheels, two return rollers', check: run(4, 2) },
    { cue: 'turret with the 40 mm and a muzzle brake', check: (s) => cal(0.04)(s) && muzzle(s) },
  ]),
  'turan-iii': ground('turan-iii', [
    { cue: 'eight road wheels in bogies, five return rollers', check: run(8, 5) },
    { cue: 'turret with the long 75 mm', check: cal(0.075) },
  ]),
  'zrinyi-i': ground('zrinyi-i', [
    { cue: 'low casemate on the Turán hull', check: (s) => casemate(s) && run(8, 5)(s) },
    { cue: 'long 75 mm with a muzzle brake', check: (s) => cal(0.075)(s) && muzzle(s) },
  ]),
  'pvkv-ii': ground('pvkv-ii', [
    { cue: 'casemate on the Strv m/41 hull: four road wheels', check: (s) => casemate(s) && run(4, 2)(s) },
    { cue: 'long 75 mm with a muzzle brake', check: (s) => cal(0.075)(s) && muzzle(s) },
  ]),
  'pvkv-m43': ground('pvkv-m43', [
    { cue: 'large casemate, six road wheels', check: (s) => casemate(s) && run(6, 3)(s) },
    { cue: 'long 75 mm', check: (s) => cal(0.075)(s) && gunLen(3)(s) },
  ]),
  'strv-m39': ground('strv-m39', [
    { cue: 'four road wheels, two return rollers', check: run(4, 2) },
    { cue: 'turret with a 37 mm and two machine guns', check: (s) => guns(3)(s) && cal(0.037, 0.04)(s) },
  ]),
  // Japanese.
  'ka-chi': ground('ka-chi', [
    { cue: 'amphibious hull, turret well forward', check: turretAt(0.4) },
    { cue: 'eight road wheels, four return rollers', check: run(8, 4) },
  ]),
  'type-2-ka-mi': ground('type-2-ka-mi', [
    { cue: 'boxy amphibious hull', check: wideHull(2.6) },
    { cue: 'four road wheels, two return rollers', check: run(4, 2) },
    { cue: 'small turret with the 37 mm', check: cal(0.037, 0.04) },
  ]),
  'type-94-tk': ground('type-94-tk', [
    { cue: 'tiny tankette, four road wheels', check: (s) => shortHull(3.5)(s) && run(4)(s) },
    { cue: 'machine-gun turret offset to the rear left', check: (s) => turretAt(-9, -0.2)(s) && turretOff(-1)(s) },
  ]),
  'type-95-ha-go': ground('type-95-ha-go', [
    { cue: 'turret offset to the left', check: turretOff(-1) },
    { cue: 'four road wheels in bell-crank pairs, two return rollers', check: run(4, 2) },
    { cue: 'short 37 mm', check: (s) => cal(0.037, 0.04)(s) && gunLen(0, 1.2)(s) },
  ]),
  'type-89-i-go': ground('type-89-i-go', [
    { cue: 'skirted running gear with many small wheels', check: wrapTracks },
    { cue: 'short 57 mm in a domed turret with a cupola', check: (s) => cal(0.057)(s) && gunLen(0, 1)(s) },
  ]),
  // US WW2.
  'm4a2-sherman': ground('m4a2-sherman', [
    ...SHERMAN,
    { cue: 'short 75 mm M3 in the cast turret', check: (s) => cal(0.075)(s) && castTurret(s) },
  ]),
  'm4-calliope': ground('m4-calliope', [
    ...SHERMAN,
    { cue: 'rocket launcher frame over the turret', check: (s) => rockets(s) && rounds(30)(s) },
  ]),
  't18e2-boarhound': ground('t18e2-boarhound', [
    { cue: 'large eight-wheeled armoured car', check: lorry(4) },
    { cue: 'turret with the 57 mm', check: cal(0.057) },
  ]),
  // BMP, BMD and Chinese IFVs.
  'bmp-2': ground(['bmp-2', 'bmp-2m'], [
    { cue: 'six road wheels, three return rollers', check: run(6, 3) },
    { cue: 'pointed ribbed bow, turret just ahead of the middle', check: (s) => hullShape(s) && turretAt(0.2)(s) },
    { cue: 'long thin 30 mm 2A42', check: (s) => cal(0.03, 0.031)(s) && gunLen(2.5)(s) },
  ]),
  'bmp-2-atgm': ground('bmp-2', [{ cue: 'Konkurs launcher on the turret roof', check: adds('box', 1, 'turret') }]),
  'bmp-2m': ground('bmp-2m', [{ cue: 'Berezhok launchers either side of the turret', check: adds('box', 2, 'turret') }]),
  'bmp-3': ground(['bmp-3', 'zbd-04a'], [
    { cue: 'six road wheels, five return rollers', check: run(6, 5) },
    { cue: 'turret with the stubby 100 mm launcher-gun', check: (s) => cal(0.1)(s) && gunLen(0, 3)(s) },
  ]),  'zbd-04a': ground('zbd-04a', [
    { cue: 'armoured skirts and bolted plates on the hull sides', check: (s) => skirted(s) && !!s.addOns?.some((a) => a.on === 'hull' && !!a.mirror) },
    { cue: 'add-on plate over the upper glacis', check: (s) => (s.addOns ?? []).filter((a) => a.on === 'hull' && a.kind === 'box' && (a.pitch ?? 0) < 0).length >= 1 },
  ]),

  'bmd-4': ground('bmd-4', [
    { cue: 'small low airborne hull, five road wheels', check: (s) => run(5)(s) && shortHull(6.5)(s) },
    { cue: 'Bakhcha turret with the 100 mm', check: (s) => cal(0.1)(s) && gunLen(0, 3)(s) },
  ]),
  '2s38': ground('2s38', [
    { cue: 'BMP-3 hull: six road wheels, five return rollers', check: run(6, 5) },
    { cue: 'tall turret with a long 57 mm and muzzle brake', check: (s) => cal(0.057)(s) && gunLen(4)(s) && turretH(1)(s) },
  ]),
  'khrizantema-s': ground('khrizantema-s', [
    { cue: 'BMP-3 hull, no turret', check: (s) => run(6, 5)(s) && noTurret(s) },
    { cue: 'twin missile arms and the radar dome rising from the deck', check: adds('tube', 2, 'hull') },
  ]),
  'shturm-s': ground('shturm-s', [
    { cue: 'MT-LB hull: six road wheels, no return rollers', check: run(6, 0) },
    { cue: 'retractable missile launcher on the roof', check: adds('tube', 1, 'hull') },
  ]),
  // CV90.
  cv90: ground(['cv90', 'cv9030', 'cv9035', 'cv90120', 'lvkv-90'], [
    { cue: 'seven road wheels behind skirts', check: (s) => run(7)(s) && skirted(s) },
    { cue: 'tall hull with a steep nose', check: tall(1.7) },
  ]),
  'cv90-40': ground(['cv90', 'lvkv-90'], [{ cue: 'turret with the 40 mm Bofors', check: cal(0.04, 0.045) }]),
  cv9030: ground('cv9030', [{ cue: 'turret with the 30 mm Bushmaster II', check: cal(0.03, 0.031) }]),
  cv9035: ground('cv9035', [{ cue: 'turret with the 35 mm Bushmaster III', check: cal(0.035, 0.04) }]),
  cv90120: ground('cv90120', [{ cue: 'tank turret with a 120 mm smoothbore', check: (s) => cal(0.12)(s) && turretL(3.5)(s) }]),
  'lvkv-90': ground('lvkv-90', [{ cue: 'search radar on the turret roof', check: radar }]),
  // British and Italian IFVs, FV430 and CVR(T).
  'fv510-warrior': ground(['fv510-warrior', 'desert-warrior'], [
    { cue: 'six road wheels behind short skirts', check: (s) => run(6)(s) && skirted(s) },
    { cue: 'tall slab-sided hull, turret in the middle', check: (s) => tall(1.8)(s) && turretAt(-0.3, 0.3)(s) },
  ]),
  'warrior-gun': ground('fv510-warrior', [{ cue: 'RARDEN 30 mm', check: cal(0.03, 0.031) }]),
  'desert-warrior': ground('desert-warrior', [{ cue: '25 mm turret with a TOW launcher', check: (s) => cal(0.025, 0.03)(s) && adds('box', 1, 'turret')(s) }]),
  dardo: ground('dardo', [
    { cue: 'six road wheels behind skirts', check: (s) => run(6)(s) && skirted(s) },
    { cue: 'turret with the 25 mm and TOW launchers', check: (s) => cal(0.025, 0.03)(s) && adds('box', 1, 'turret')(s) },
  ]),
  'fv107-scimitar': ground('fv107-scimitar', [
    { cue: 'small CVR(T) hull: five road wheels', check: (s) => run(5, 0)(s) && shortHull(5)(s) },
    { cue: 'small turret with the RARDEN 30 mm', check: cal(0.03, 0.031) },
  ]),
  'fv102-striker': ground('fv102-striker', [
    { cue: 'CVR(T) hull with the Swingfire box on the back', check: (s) => run(5, 0)(s) && rounds(5)(s) },
  ]),
  'fv438-swingfire': ground('fv438-swingfire', [
    { cue: 'FV432 hull: five road wheels, two return rollers', check: run(5, 2) },
    { cue: 'two Swingfire boxes on the roof', check: rounds(2) },
  ]),
  falcon: ground('falcon', [
    { cue: 'FV433 hull: five road wheels', check: run(5, 2) },
    { cue: 'open turret with twin 30 mm', check: (s) => guns(2)(s) && cal(0.03, 0.031)(s) },
  ]),
  // Bradley, M113 and Marder families.
  'm2-bradley': ground('m2-bradley', [
    { cue: 'six road wheels behind short skirts', check: (s) => run(6)(s) && skirted(s) },
    { cue: 'turret offset right with the 25 mm', check: (s) => turretOff(1)(s) && cal(0.025, 0.03)(s) },
    { cue: 'TOW box on the turret side', check: adds('box', 1, 'turret') },
  ]),
  'adats-bradley': ground('adats-bradley', [
    { cue: 'Bradley hull, six road wheels', check: run(6) },
    { cue: 'ADATS turret: four missile boxes each side and a radar', check: (s) => rounds(4)(s) && radar(s) },
  ]),
  'adats-m113': ground('adats-m113', [
    { cue: "M113A3's armoured fuel tanks either side of the rear ramp", check: (s) => !!s.addOns?.some((a) => a.on === 'hull' && !!a.mirror && a.at[0] < -s.length / 2) },
    { cue: 'M113 hull, five road wheels', check: run(5, 0) },
    { cue: 'ADATS turret: four missile boxes each side and a radar', check: (s) => rounds(4)(s) && radar(s) },
  ]),
  'm113-family': ground(['m113-tow', 'm901-itv', 'c13-tua', 'machbet'], [
    { cue: 'M113 box hull: five road wheels, no return rollers', check: run(5, 0) },
    { cue: 'flat-topped aluminium box with a sloped nose', check: hullShape },
  ]),
  'm113-tow': ground(['m113-tow', 'c13-tua'], [{ cue: 'TOW launcher on the roof', check: adds('box', 2, 'hull') }]),
  'm901-itv': ground('m901-itv', [{ cue: '"hammerhead" twin TOW launcher on a raised arm', check: adds('box', 2, 'hull') }]),
  machbet: ground('machbet', [
    { cue: 'open turret with the Vulcan', check: openAbove },
    { cue: 'radar on the turret', check: radar },
  ]),
  'm48-chaparral': ground('m48-chaparral', [
    { cue: 'M730 carrier: five road wheels', check: run(5, 0) },
    { cue: 'turret with four Chaparral rails', check: rounds(4) },
  ]),
  'spz-12-3': ground('spz-12-3', [
    { cue: 'five road wheels, no return rollers', check: run(5, 0) },
    { cue: 'small 20 mm turret offset to the right', check: (s) => turretOff(1)(s) && cal(0.02, 0.025)(s) },
  ]),
  'pbv-302-bill': ground('pbv-302-bill', [
    { cue: 'five road wheels, no return rollers', check: run(5, 0) },
    { cue: '20 mm turret offset left at the front', check: (s) => turretOff(-1)(s) && turretAt(0.5)(s) },
    { cue: 'Bill missile launcher on the roof', check: adds('tube', 1, 'hull') },
  ]),
  marder: ground(['marder-1a1', 'marder-1a3', 'marder-clovis', 'marder-df105', 'begleitpanzer-57', 'roland-marder'], [
    { cue: 'Marder hull: six road wheels, three return rollers', check: run(6, 3) },
    { cue: 'tall hull with a sloped nose', check: (s) => hullShape(s) && tall(1.8)(s) },
  ]),
  'marder-1a1': ground(['marder-1a1', 'marder-1a3'], [{ cue: 'two-man turret with the 20 mm and a MILAN', check: (s) => cal(0.02, 0.025)(s) && adds('box', 1, 'turret')(s) }]),
  'marder-1a3': ground('marder-1a3', [{ cue: 'bolted add-on armour on the hull', check: (s) => wideHull(3.35)(s) && adds('box', 1, 'hull')(s) }]),
  'marder-105': ground(['marder-clovis', 'marder-df105'], [{ cue: 'low turret with a 105 mm and a muzzle brake', check: (s) => cal(0.105)(s) && muzzle(s) }]),
  'begleitpanzer-57': ground('begleitpanzer-57', [{ cue: 'tall turret with the 57 mm Bofors and a TOW', check: (s) => cal(0.057)(s) && turretH(1)(s) }]),
  'roland-marder': ground(['roland-marder', 'amx-30-roland'], [
    { cue: 'Roland turret: a missile each side and the search radar', check: (s) => rounds(1)(s) && (radar(s) || adds('slab', 1, 'turret')(s)) },
  ]),
  raketenjagdpanzer: ground('raketenjagdpanzer', [
    { cue: 'low casemate hull, no turret', check: (s) => noTurret(s) && low(1.2)(s) },
    { cue: 'five road wheels, three return rollers', check: run(5, 3) },
    { cue: 'missile launcher rising from the roof', check: adds('tube', 1, 'hull') },
  ]),
  'ikv-103': ground('ikv-103', [
    { cue: 'very low casemate hull', check: (s) => casemate(s) && low(1.0)(s) },
    { cue: 'short 105 mm howitzer with a muzzle brake', check: (s) => cal(0.105)(s) && muzzle(s) },
  ]),
  'udes-33': ground('udes-33', [{ cue: 'low tracked hull, five road wheels, no turret', check: (s) => run(5, 0)(s) && noTurret(s) }]),
  'type-60-atm': ground('type-60-atm', [
    { cue: 'tiny low carrier, five road wheels', check: (s) => run(5, 0)(s) && low(1.1)(s) },
    { cue: 'twin missile rails at the back', check: adds('box', 2, 'hull') },
  ]),
  'type-75-mlrs': ground('type-75-mlrs', [
    { cue: 'five road wheels, no return rollers', check: run(5, 0) },
    { cue: 'box of 30 rocket tubes on the deck', check: adds('tube', 30, 'hull') },
  ]),
  t114: ground('t114', [{ cue: 'small boxy carrier on four road wheels with a cupola', check: (s) => run(4)(s) && adds('drum', 1, 'hull')(s) }]),
  xm800t: ground('xm800t', [
    { cue: 'five road wheels, no return rollers', check: run(5, 0) },
    { cue: 'small turret with the 20 mm', check: cal(0.02, 0.025) },
  ]),
  'rdf-lt': ground('rdf-lt', [
    { cue: 'small five-wheeled light tank', check: (s) => run(5, 0)(s) && shortHull(5.5)(s) },
    { cue: 'low turret with a 75 mm and a muzzle brake', check: (s) => cal(0.075)(s) && muzzle(s) },
  ]),
  alecto: ground('alecto', [
    { cue: 'small open-topped casemate', check: casemate },
    { cue: 'short 95 mm howitzer', check: (s) => cal(0.095)(s) && gunLen(0, 2)(s) },
  ]),
  'universal-carrier': ground('universal-carrier', [
    { cue: 'small open-topped carrier, three road wheels', check: (s) => run(3)(s) && low(1.2)(s) },
    { cue: 'Bren gun in the front', check: hullGun },
  ]),
  efv: ground('efv', [
    { cue: 'very long planing hull with a pointed bow', check: longHull(9) },
    { cue: 'turret with the 30 mm', check: cal(0.03, 0.031) },
  ]),
  ajax: ground('ajax', [
    { cue: 'sight heads on the turret roof', check: adds('drum', 2, 'turret') },
    { cue: 'tall hull, seven road wheels behind skirts', check: (s) => run(7)(s) && skirted(s) && tall(2)(s) },
    { cue: 'turret with the 40 mm CTA', check: cal(0.04, 0.045) },
  ]),
  'kf41-lynx': ground('kf41-lynx', [
    { cue: 'tall hull, six road wheels behind skirts', check: (s) => run(6)(s) && skirted(s) && tall(2)(s) },
    { cue: 'Lance turret with the 35 mm', check: cal(0.035, 0.04) },
  ]),
  'hunter-afv': ground('hunter-afv', [
    { cue: 'tall hull, six road wheels behind skirts', check: (s) => run(6)(s) && skirted(s) },
    { cue: 'turret with the 30 mm', check: cal(0.03, 0.031) },
  ]),
  qn506: ground('qn506', [
    { cue: 'Type 59 hull: five road wheels, no return rollers', check: run(5, 0) },
    { cue: 'boxy fire-support turret with a 30 mm and missiles', check: (s) => angular(s) && cal(0.03)(s) && adds('box', 2, 'turret')(s) },
  ]),
  'wz-305': ground('wz-305', [
    { cue: 'Type 59/69 hull: five road wheels', check: run(5, 0) },
    { cue: 'open turret with twin 57 mm', check: (s) => openAbove(s) && guns(2)(s) },
  ]),
  'ptz-89': ground('ptz-89', [
    { cue: 'six road wheels, three return rollers', check: run(6, 3) },
    { cue: 'turret at the back with a long 120 mm', check: (s) => turretAt(-9, -0.8)(s) && cal(0.12)(s) },
  ]),
  'amx-10m-acra': ground('amx-10m-acra', [
    { cue: 'AMX-10P hull: six road wheels', check: run(6, 3) },
    { cue: 'turret with the 142 mm ACRA launcher', check: cal(0.14) },
  ]),
  // AMX-30 family (the AMX-50, AMX-40 and AMX-32 aliases share this figure).
  'amx-30': ground(['amx-30', 'amx-30-auf1', 'amx-30-roland'], [{ cue: 'five road wheels a side', check: run(5) }]),
  'amx-30-tank': ground('amx-30', [
    { cue: 'cast turret with a rounded front', check: castTurret },
    { cue: 'CN-105-F1 with a thermal sleeve, no evacuator', check: (s) => cal(0.105)(s) && sleeved(s) && !evacuator(s) },
    { cue: "commander's cupola with the 7.62", check: cupolaAny },
  ]),
  'amx-30-auf1': ground('amx-30-auf1', [{ cue: 'huge turret with the 155 mm and muzzle brake', check: (s) => turretH(1.4)(s) && cal(0.155)(s) && muzzle(s) }]),
  // Wheeled armour.
  'eight-wheeled': ground(['boxer', 'boxer-rct30', 'btr-82a', 'btr-3e1', 'freccia-ifv', 'centauro', 'centauro-120', 'centauro-2', 'vbci', 'patria-amv', 'eitan', 'badger-ifv', 'cm-34', 'type-24-icv', 'type-25-rcv', 'm1128-stryker-mgs', 'm1296-stryker-dragoon', 'luchs', 'radpanzer-90', 'vbc-pt2', 'class-3-p', 'ztl-11', 'rooikat', 'lav-ad'], [
    { cue: 'eight wheels on four axles', check: lorry(4) },
  ]),
  boxer: ground(['boxer', 'boxer-rct30'], [{ cue: 'very tall box hull with a mission module', check: tall(2.3) }]),
  'boxer-plain': ground('boxer', [{ cue: 'no turret: RWS on the roof', check: noTurret }]),
  'boxer-rct30': ground('boxer-rct30', [{ cue: 'unmanned turret with the 30 mm', check: cal(0.03, 0.031) }]),
  btr: ground(['btr-82a', 'btr-3e1'], [{ cue: 'boat-shaped hull, gaps between the second and third axles', check: hullShape }]),
  'btr-82a': ground('btr-82a', [{ cue: 'small turret near the front with the 30 mm', check: (s) => turretAt(0.8)(s) && cal(0.03, 0.031)(s) }]),
  'btr-3e1': ground('btr-3e1', [{ cue: 'Shkval turret with the 30 mm and missile boxes', check: (s) => cal(0.03, 0.031)(s) && adds('box', 2, 'turret')(s) }]),
  'cannon-ifv-30': ground(['patria-amv', 'eitan', 'badger-ifv', 'cm-34', 'type-24-icv', 'type-25-rcv', 'm1296-stryker-dragoon'], [{ cue: 'turret with a 30 mm', check: cal(0.03, 0.031) }]),
  eitan: ground('eitan', [
    { cue: 'high flat-sided 8x8 hull with a long sloped nose', check: (s) => lorry(4)(s) && tall(2.3)(s) && hullShape(s) },
    { cue: 'small low unmanned turret over the middle of the hull', check: (s) => turretAt(-0.5, 0.5)(s) && (s.turret?.height ?? 1) <= 0.6 },
  ]),
  'cannon-ifv-25': ground(['freccia-ifv', 'vbci', 'vbc-pt2'], [{ cue: 'turret with a 25 mm', check: cal(0.025, 0.03) }]),
  centauro: ground(['centauro', 'centauro-120', 'centauro-2'], [{ cue: 'tank turret over the rear half, long gun with an evacuator', check: (s) => evacuator(s) && gunLen(5)(s) }]),
  'centauro-105': ground('centauro', [{ cue: '105 mm with the multi-baffle muzzle brake', check: (s) => cal(0.105, 0.11)(s) && muzzle(s) }]),
  'centauro-120': ground('centauro-120', [{ cue: 'bigger turret with the 120 mm and its muzzle brake', check: (s) => cal(0.12)(s) && muzzle(s) && turretL(4.2)(s) }]),
  'centauro-2': ground('centauro-2', [{ cue: 'bigger turret with the 120 mm', check: (s) => cal(0.12)(s) && turretL(4.2)(s) }]),
  'm1128-stryker-mgs': ground('m1128-stryker-mgs', [{ cue: 'low unmanned turret with the 105 mm and muzzle brake', check: (s) => cal(0.105)(s) && muzzle(s) && (s.turret?.height ?? 1) <= 0.55 }]),
  luchs: ground('luchs', [{ cue: 'boat hull with the 20 mm turret amidships', check: (s) => cal(0.02, 0.025)(s) && turretAt(-0.4, 0.4)(s) }]),
  'radpanzer-90': ground('radpanzer-90', [{ cue: 'Luchs hull with a 105 mm turret', check: cal(0.105) }]),
  'fire-support-105': ground(['class-3-p', 'ztl-11', 'ptl-02', 'wma-301'], [{ cue: 'tank turret with a gun and a muzzle brake', check: (s) => muzzle(s) && gunLen(5)(s) }]),
  'six-wheeled': ground(['ptl-02', 'wma-301', 'aft09', 'jaguar-ebrc', 'amx-10rc', 'ba-10', 'vickers-mk11', 'hq-7-telar'], [{ cue: 'six wheels on three axles', check: lorry(3) }]),
  'rooikat-gun': ground('rooikat', [{ cue: 'turret with the long 76 mm and an evacuator', check: (s) => cal(0.076)(s) && evacuator(s) }]),
  'lav-ad': ground('lav-ad', [{ cue: 'turret with a 25 mm and Stinger boxes on both sides', check: (s) => cal(0.025)(s) && rounds(4)(s) }]),
  'amx-10rc': ground('amx-10rc', [{ cue: 'turret with the 105 mm and a muzzle brake', check: (s) => cal(0.105)(s) && muzzle(s) }]),
  'jaguar-ebrc': ground('jaguar-ebrc', [{ cue: 'turret with the 40 mm CTA and missile box', check: (s) => cal(0.04, 0.045)(s) && adds('box', 1, 'turret')(s) }]),
  aft09: ground('aft09', [{ cue: 'missile launcher turret at the back', check: (s) => turretAt(-9, -1)(s) && adds('box', 4, 'turret')(s) }]),
  'four-wheeled': ground(['aml-90', 'fv721-fox', 'ba-64', 'csaba', 'pbil-m40', 'vab', 'vab-mephisto'], [{ cue: 'four wheels on two axles', check: lorry(2) }]),
  'aml-90': ground('aml-90', [{ cue: 'small car with a big turret: 90 mm and muzzle brake', check: (s) => cal(0.09)(s) && muzzle(s) && shortHull(4.2)(s) }]),
  'fv721-fox': ground('fv721-fox', [{ cue: 'small car with the RARDEN turret', check: (s) => cal(0.03, 0.031)(s) && shortHull(4.5)(s) }]),
  'ba-64': ground('ba-64', [{ cue: 'tiny faceted car with a machine-gun turret', check: (s) => shortHull(4)(s) && turretShape(s) }]),
  csaba: ground('csaba', [{ cue: 'turret with a 20 mm rifle', check: cal(0.02, 0.025) }]),
  'pbil-m40': ground('pbil-m40', [{ cue: 'turret with the 20 mm', check: cal(0.02, 0.025) }]),
  'ba-10': ground('ba-10', [{ cue: 'turret at the rear with the 45 mm', check: (s) => turretAt(-9, -0.3)(s) && cal(0.045)(s) }]),
  vab: ground(['vab', 'vab-mephisto'], [{ cue: 'tall boxy APC with a sloped nose', check: (s) => tall(2)(s) && noTurret(s) }]),
  'vab-mephisto': ground('vab-mephisto', [{ cue: 'HOT launcher on the roof', check: adds('box', 2, 'hull') }]),
  // Self-propelled anti-aircraft guns and missile vehicles.
  'zsu-23-4m4': ground('zsu-23-4m4', [
    { cue: 'six road wheels, no return rollers', check: run(6, 0) },
    { cue: 'wide flat turret with four 23 mm', check: (s) => guns(4)(s) && cal(0.023, 0.025)(s) },
    { cue: 'radar dish on the turret, Igla pods', check: (s) => radar(s) && rockets(s) },
  ]),
  '2k22-tunguska': ground('2k22-tunguska', [
    { cue: 'six road wheels behind skirts', check: (s) => run(6)(s) && skirted(s) },
    { cue: 'twin 30 mm on each side of the turret', check: guns(4) },
    { cue: 'missile tubes beside the guns', check: rounds(4) },
  ]),
  'm247-sergeant-york': ground('m247-sergeant-york', [
    { cue: 'M48 hull: six road wheels, three return rollers', check: run(6, 3) },
    { cue: 'twin 40 mm on the turret sides', check: guns(2) },
    { cue: 'two radar dishes on the turret', check: (s) => (s.radars?.length ?? 0) >= 2 },
  ]),
  'itpsv-90': ground('itpsv-90', [
    { cue: 'twin 35 mm turret with two radars', check: (s) => guns(2)(s) && (s.radars?.length ?? 0) >= 2 },
    { cue: 'seven road wheels behind skirts', check: (s) => run(7)(s) && skirted(s) },
  ]),
  'type-87-spaag': ground('type-87-spaag', [
    { cue: 'Type 74 hull: five road wheels', check: run(5) },
    { cue: 'twin 35 mm and search and tracking radars', check: (s) => guns(2)(s) && (s.radars?.length ?? 0) >= 2 },
  ]),
  'chieftain-marksman-run': ground('chieftain-marksman', [{ cue: 'twin 35 mm on the turret sides', check: guns(2) }]),
  'pgz-95': ground('pgz-95', [
    { cue: 'six road wheels, three return rollers', check: run(6, 3) },
    { cue: 'tall turret with four 25 mm barrels', check: (s) => guns(4)(s) && turretH(1)(s) },
  ]),  'pgz-09': ground('pgz-09', [
    { cue: 'six road wheels, three return rollers, a big hull', check: (s) => run(6, 3)(s) && tall(1.8)(s) },
    { cue: 'large box turret with a 35 mm cannon in a pod on each side', check: (s) => turretL(2.8)(s) && !!s.guns?.some((g) => g.mount === 'turret-side' && g.calibre >= 0.035 && g.calibre < 0.04) },
    { cue: "tracking radar's dish on the turret face", check: (s) => !!s.radars?.some((r) => r.kind === 'dish' && r.x > 0) },
    { cue: 'search radar folded over the turret back', check: (s) => !!s.radars?.some((r) => r.kind === 'panel' && !!r.back && r.x < 0) },
  ]),

  '9a35-strela-10': ground('9a35-strela-10', [
    { cue: 'MT-LB hull: six road wheels', check: run(6, 0) },
    { cue: 'small turret at the back with four missile boxes', check: (s) => turretAt(-9, -1)(s) && adds('box', 4, 'turret')(s) },
  ]),
  '9a33-osa': ground('9a33-osa', [
    { cue: 'boat-shaped six-wheeled amphibious hull', check: (s) => lorry(3)(s) && s.hull === 'boat' },
    { cue: 'turret with the radar and missile rails', check: adds('slab', 3, 'turret') },
  ]),
  '9a331-tor-m1': ground('9a331-tor-m1', [
    { cue: 'six road wheels, four return rollers', check: run(6, 4) },
    { cue: 'tall box turret with the radar on top', check: turretH(1.5) },
    { cue: "search antenna leaning back over the turret's rear", check: (s) => (s.addOns ?? []).some((a) => a.kind === 'slab' && a.at[0] < -1 && (a.pitch ?? 0) < 0) },
    { cue: 'tracking array on the sloped turret front', check: (s) => (s.addOns ?? []).some((a) => a.kind === 'slab' && a.at[0] > 1 && (a.pitch ?? 0) > 0) },
    { cue: "TV-optical tracker box on the roof's front left", check: (s) => (s.addOns ?? []).some((a) => a.kind === 'box' && a.metal && a.at[0] > 0.5 && a.at[1] < 0) },
  ]),
  buk: ground(['9a310-buk-telar', 'buk-m3-9a317m', '9s18-snow-drift'], [
    { cue: 'long GM-569 hull: six road wheels, four return rollers', check: (s) => run(6, 4)(s) && longHull(9)(s) },
  ]),
  '9a310-buk-telar': ground('9a310-buk-telar', [{ cue: 'four missiles on the turntable', check: adds('tube', 4, 'hull') }]),
  'buk-m3-9a317m': ground('buk-m3-9a317m', [{ cue: 'missile canisters on the turntable', check: adds('box', 6, 'hull') }]),
  '9s18-snow-drift': ground('9s18-snow-drift', [{ cue: 'large folding radar antenna on the hull', check: (s) => noTurret(s) && adds('body', 1, 'hull')(s) }]),
  'm270-mlrs': ground('m270-mlrs', [
    { cue: 'Bradley-derived hull: six road wheels', check: run(6, 3) },
    { cue: 'two six-rocket pods in the launcher box', check: rounds(12) },
  ]),
  'tracked-rapier': ground('tracked-rapier', [
    { cue: 'M548 type carrier: five road wheels', check: run(5, 0) },
    { cue: 'launcher with four missiles each side', check: rounds(4) },
  ]),
  'stormer-hvm': ground('stormer-hvm', [
    { cue: 'six road wheels, no return rollers', check: run(6, 0) },
    { cue: 'eight Starstreak tubes on the roof', check: rounds(8) },
  ]),
  nomads: ground('nomads', [
    { cue: 'five road wheels, no return rollers', check: run(5, 0) },
    { cue: 'missile pods and radar on a round turret', check: (s) => rockets(s) && radar(s) },
  ]),
  'asrad-r': ground(['asrad-r', 'elde-98'], [
    { cue: 'articulated two-unit tracked carrier', check: (s) => wheels(s) >= 8 && (s.width ?? 9) < 2.4 },
    { cue: 'missile launcher on the rear unit', check: rockets },
  ]),
  'elde-98': ground('elde-98', [{ cue: 'radar panel on the launcher', check: radar }]),
  'pantsir-s1': ground('pantsir-s1', [
    { cue: 'eight-wheeled truck with the turret at the back', check: (s) => lorry(4)(s) && turretAt(-9, -1.5)(s) },
    { cue: 'two 30 mm and six missiles each side', check: (s) => guns(2)(s) && rounds(12)(s) },
  ]),
  'hq-7-telar': ground('hq-7-telar', [{ cue: 'turret with four missile boxes and a radar', check: (s) => rounds(4)(s) && adds('slab', 1, 'turret')(s) }]),
  humraam: ground('humraam', [
    { cue: 'HMMWV chassis', check: lorry(2) },
    { cue: 'AMRAAM rails on the back', check: rockets },
  ]),
  antelope: ground('antelope', [
    { cue: 'four-wheeled light truck', check: (s) => lorry(2)(s) && cabbed(s) },
    { cue: 'launcher turret on the bed', check: adds('box', 4, 'hull') },
  ]),
  // Missile launchers, radars and their trucks.
  'sam-trucks': ground(['samp-t-launcher', 'sky-sabre-launcher', 'spyder-launcher', 'type-81-tansam-launcher', 'flarakrad', 'iris-t-slm-launcher', 'iris-t-slm-str', 'pantsir-s1', '30n6-flap-lid', '5p85s-s-300-tel', 'scud-b-tel', 'bm-30-smerch', 'hq-11', 'bm-21-grad', 'p-19-flat-face', 'patriot-m901-launcher', 'hemtt-tanker', 'm939', 'kamaz-43101', 'zil-131-covered'], [
    { cue: 'truck cab at the front', check: cabbed },
  ]),
  'samp-t-launcher': ground(['samp-t-launcher', 'sky-sabre-launcher'], [{ cue: 'eight missile canisters raised on the bed', check: rounds(8) }]),
  'spyder-launcher': ground('spyder-launcher', [{ cue: 'four missile canisters on the bed', check: rounds(4) }]),
  'type-81-tansam-launcher': ground('type-81-tansam-launcher', [{ cue: 'four missiles on a turntable launcher', check: rounds(4) }]),
  flarakrad: ground('flarakrad', [{ cue: 'Roland-type launcher and radar on the bed', check: (s) => rockets(s) && radar(s) }]),
  'iris-t-slm-launcher': ground('iris-t-slm-launcher', [{ cue: 'launcher box on the bed, outriggers', check: (s) => outrig(s) && adds('box', 3, 'hull')(s) }]),
  'iris-t-slm-str': ground('iris-t-slm-str', [{ cue: 'radar on a mast over the bed', check: adds('body', 1, 'hull') }]),
  '30n6-flap-lid': ground('30n6-flap-lid', [{ cue: 'eight-wheeled MAZ with the flat radar array', check: (s) => lorry(4)(s) && adds('body', 1, 'hull')(s) }]),
  '5p85s-s-300-tel': ground('5p85s-s-300-tel', [{ cue: 'four big missile tubes over the MAZ chassis', check: (s) => lorry(4)(s) && adds('body', 2, 'hull')(s) }]),
  'scud-b-tel': ground('scud-b-tel', [{ cue: 'MAZ-543 with the single big missile', check: (s) => lorry(4)(s) && adds('body', 1, 'hull')(s) }]),
  'bm-30-smerch': ground('bm-30-smerch', [{ cue: 'twelve heavy rocket tubes on the MAZ-543', check: (s) => lorry(4)(s) && adds('tube', 12, 'hull')(s) }]),
  'hq-11': ground('hq-11', [{ cue: 'eight-wheeled launcher truck with missile tubes', check: (s) => lorry(4)(s) && adds('tube', 2, 'hull')(s) }]),
  'bm-21-grad': ground('bm-21-grad', [{ cue: 'forty rocket tubes on the Ural', check: (s) => lorry(3)(s) && adds('tube', 40, 'hull')(s) }]),
  'p-19-flat-face': ground('p-19-flat-face', [{ cue: 'radar cabin with the antenna on the truck', check: adds('body', 1, 'hull') }]),
  'patriot-m901-launcher': ground('patriot-m901-launcher', [{ cue: 'semitrailer with the four-canister launcher', check: (s) => longHull(15)(s) && adds('box', 4, 'hull')(s) }]),
  'patriot-mpq-53': ground('patriot-mpq-53', [
    { cue: 'radar trailer', check: chassisIs('trailer') },
    { cue: 'large phased-array face', check: adds('slab', 3, 'hull') },
  ]),
  'nasams-mpq-64-sentinel': ground('nasams-mpq-64-sentinel', [
    { cue: 'one-axle radar trailer with outriggers', check: (s) => chassisIs('trailer')(s) && outrig(s) },
    { cue: 'rotating flat antenna on top', check: adds('slab', 1, 'hull') },
  ]),
  'nasams-launcher': ground('nasams-launcher', [
    { cue: 'two-axle launcher trailer with outriggers', check: (s) => chassisIs('trailer')(s) && outrig(s) },
    { cue: 'six canisters in a box', check: adds('box', 1, 'hull') },
  ]),
  'hawk-m192-launcher': ground('hawk-m192-launcher', [
    { cue: 'trailer launcher with three missiles', check: (s) => chassisIs('trailer')(s) && adds('tube', 3, 'hull')(s) },
  ]),
  'hawk-radar': ground(['hawk-mpq-46-hpir', 'hawk-mpq-55-cwar'], [
    { cue: 'one-axle radar trailer with outriggers', check: (s) => chassisIs('trailer')(s) && outrig(s) },
  ]),
  'hawk-mpq-46-hpir': ground('hawk-mpq-46-hpir', [{ cue: 'twin dish antennas', check: adds('slab', 2, 'hull') }]),
  'hawk-mpq-55-cwar': ground('hawk-mpq-55-cwar', [{ cue: 'twin flat antennas back to back', check: adds('slab', 2, 'hull') }]),
  'rapier-launcher': ground('rapier-launcher', [
    { cue: 'small launcher on outriggers, two missiles each side', check: (s) => outrig(s) && adds('tube', 4, 'hull')(s) },
  ]),
  's-75-launcher': ground('s-75-launcher', [
    { cue: 'emplaced turntable with one long two-stage missile', check: (s) => chassisIs('pedestal')(s) && adds('tube', 2, 'hull')(s) },
  ]),
  'snr-75-fan-song': ground('snr-75-fan-song', [{ cue: 'radar cabin with trough antennas on a trailer', check: (s) => chassisIs('trailer')(s) && adds('slab', 2, 'hull')(s) }]),
  '64n6-big-bird': ground('64n6-big-bird', [{ cue: 'semitrailer with the big back-to-back array', check: (s) => chassisIs('trailer')(s) && adds('slab', 2, 'hull')(s) }]),
  '55g6-nebo': ground('55g6-nebo', [{ cue: 'huge lattice array of yagi elements', check: (s) => chassisIs('static')(s) && adds('tube', 40, 'hull')(s) }]),
  'fps-117': ground('fps-117', [{ cue: 'static flat-faced radar array', check: (s) => chassisIs('static')(s) && adds('slab', 1, 'hull')(s) }]),
  // Lorries, cars and trailers.
  'hemtt-tanker': ground('hemtt-tanker', [{ cue: 'eight-wheeled HEMTT with a tank body', check: (s) => lorry(4)(s) && adds('body', 1, 'hull')(s) }]),
  'six-wheel-lorry': ground(['m939', 'kamaz-43101', 'zil-131-covered', 'studebaker-us6', 'gmc-cckw', 'type-94-truck'], [{ cue: 'three axles', check: lorry(3) }]),
  m939: ground(['m939', 'kamaz-43101', 'zil-131-covered'], [{ cue: 'cargo body or tank on the frame', check: adds('body', 1, 'hull') }]),
  'kamaz-43101': ground('kamaz-43101', [{ cue: 'forward-control cab over the engine', check: (s) => cabbed(s) && !s.cab?.bonnet }]),
  'gmc-cckw': ground('gmc-cckw', CCKW),
  'two-axle-lorry': ground(['zis-5', 'gaz-aa', 'opel-blitz', 'opel-blitz-tanker', 'dodge-wc', 'ush-405', 'breda-501', 'autocannone-90-53'], [{ cue: 'two axles', check: lorry(2) }]),
  'bonnet-lorry': ground(['zis-5', 'gaz-aa', 'opel-blitz', 'opel-blitz-tanker', 'dodge-wc', 'studebaker-us6', 'type-94-truck'], [{ cue: 'bonneted cab', check: hullShape }]),
  'opel-blitz-tanker': ground('opel-blitz-tanker', [{ cue: 'low tank body behind the cab', check: low(2.2) }]),
  'autocannone-90-53': ground('autocannone-90-53', [{ cue: '90/53 on the open bed', check: (s) => cal(0.09)(s) && gunLen(4)(s) }]),
  'breda-501': ground('breda-501', [{ cue: 'gun on the back of the lorry', check: guns(1) }]),
  'fiat-6614-firos': ground('fiat-6614-firos', [
    { cue: 'four-wheeled APC', check: lorry(2) },
    { cue: 'rocket launcher on the roof', check: adds('drum', 1, 'hull') },
  ]),
  'r3-t106': ground('r3-t106', [
    { cue: 'small four-wheeled car', check: (s) => lorry(2)(s) && shortHull(5)(s) },
    { cue: 'recoilless rifle on the back', check: adds('tube', 1, 'hull') },
  ]),
  'light-car': ground(['willys-mb', 'kubelwagen', 'gaz-67', 'horch-901', 'type-95-kurogane', 'gaz-m1', 'm1025-humvee', 'm1045-hmmwv-tow'], [
    { cue: 'small four-wheeled car', check: (s) => lorry(2)(s) && shortHull(5)(s) },
  ]),
  humvee: ground(['m1025-humvee', 'm1045-hmmwv-tow'], [{ cue: 'wide low HMMWV body', check: wideHull(2.1) }]),
  'generator-trailer': ground('generator-trailer', [{ cue: 'one-axle trailer with a box load', check: (s) => chassisIs('trailer')(s) && axles(1)(s) }]),
  bulldozer: ground('bulldozer', [
    { cue: 'tracked tractor with a dozer blade in front', check: (s) => chassisIs('tracked')(s) && adds('slab', 1, 'hull')(s) },
    { cue: 'no turret or gun', check: (s) => noTurret(s) && !s.guns?.length },
  ]),
  // Half-tracks.
  'sdkfz-7': ground(['sdkfz-7', 'sdkfz-7-flakvierling'], [
    { cue: 'half-track: front wheels, long interleaved track unit', check: (s) => chassisIs('halftrack')(s) && wheels(s) >= 6 },
    { cue: 'open crew body', check: openAbove },
  ]),
  'sdkfz-7-flakvierling': ground('sdkfz-7-flakvierling', [{ cue: 'quad 20 mm on the rear bed', check: (s) => guns(4)(s) && turretAt(-9, -1)(s) }]),
  'm3-halftrack': ground('m3-halftrack', [
    { cue: 'half-track: front axle and rear track unit', check: (s) => !!s.halftrack },
    { cue: 'open-topped armoured body', check: openWell },
    { cue: '.50 on a ring mount', check: roofGun },
  ]),
  // Railway.
  rail: ground(['rail-flat-car', 'rail-passenger-car', 'rail-open-wagon', 'rail-tank-car', 'ww2-goods-wagon', 'electric-locomotive'], [{ cue: 'railway vehicle on bogies or axles', check: chassisIs('rail') }]),
  'rail-flat-car': ground('rail-flat-car', [{ cue: 'flat deck with low or no sides', check: low(1.4) }]),
  'rail-passenger-car': ground('rail-passenger-car', [{ cue: 'long coach body with a curved roof', check: (s) => longHull(20)(s) && adds('body', 1, 'hull')(s) }]),
  'rail-open-wagon': ground('rail-open-wagon', [{ cue: 'open box sides, no roof', check: adds('box', 8, 'hull') }]),
  'rail-tank-car': ground('rail-tank-car', [{ cue: 'cylindrical tank with a dome', check: (s) => adds('body', 1, 'hull')(s) && adds('drum', 1, 'hull')(s) }]),
  'ww2-goods-wagon': ground('ww2-goods-wagon', [{ cue: 'tall closed boxcar', check: tall(3.5) }]),
  'electric-locomotive': ground('electric-locomotive', [{ cue: 'long locomotive body with cabs at both ends', check: (s) => longHull(30)(s) && adds('body', 2, 'hull')(s) }]),
  // Towed and emplaced guns.
  'towed-at': ground(['pak-36', 'pak-38', 'pak-40', 'qf-6-pounder', '53-k-45mm'], [
    { cue: 'split-trail carriage with a gun shield', check: chassisIs('towed') },
  ]),
  'pak-36': ground('pak-36', [{ cue: 'small 37 mm, no muzzle brake', check: (s) => cal(0.037, 0.04)(s) && noMuzzle(s) }]),
  'pak-38': ground('pak-38', [{ cue: '50 mm with a muzzle brake', check: (s) => cal(0.05)(s) && muzzle(s) }]),
  'pak-40': ground('pak-40', [{ cue: 'long 75 mm with a double-baffle muzzle brake', check: (s) => cal(0.075)(s) && muzzle(s) && gunLen(3)(s) }]),
  'qf-6-pounder': ground('qf-6-pounder', [{ cue: '57 mm 6-pounder', check: cal(0.057) }]),
  '53-k-45mm': ground('53-k-45mm', [{ cue: '45 mm on wire-spoked wheels', check: cal(0.045) }]),
  '72-k-25mm': ground('72-k-25mm', [{ cue: '25 mm on a four-wheeled carriage', check: (s) => chassisIs('towed')(s) && axles(2)(s) && cal(0.025)(s) }]),
  'emplaced-aa': ground(['flak-38-20mm', 'flakvierling-38', 'type-96-25mm', 'type-88-75mm', 'type-3-80mm'], [
    { cue: 'emplaced on a cruciform base', check: chassisIs('pedestal') },
  ]),
  'flak-38-20mm': ground('flak-38-20mm', [{ cue: 'single 20 mm', check: (s) => cal(0.02, 0.025)(s) && !guns(2)(s) }]),
  'flakvierling-38': ground('flakvierling-38', [{ cue: 'four 20 mm in a square', check: guns(4) }]),
  'type-96-25mm': ground('type-96-25mm', [{ cue: 'twin 25 mm', check: guns(2) }]),
  'type-88-75mm': ground('type-88-75mm', [{ cue: 'long 75 mm on a central pedestal', check: cal(0.075) }]),
  'type-3-80mm': ground('type-3-80mm', [{ cue: 'long 80 mm on a central pedestal', check: (s) => cal(0.08)(s) && gunLen(3.5)(s) }]),
  // Self-propelled howitzers and the rest.
  spg155: ground(['as90', 'k9-firtina', 'plz-05'], [
    { cue: 'huge box turret over the rear half', check: (s) => turretH(1.15)(s) && turretAt(-9, -0.3)(s) },
    { cue: 'long 155 mm with a muzzle brake and an evacuator', check: (s) => cal(0.155)(s) && muzzle(s) && evacuator(s) },
  ]),
  as90: ground('as90', [{ cue: 'six road wheels behind skirts', check: (s) => run(6)(s) && skirted(s) }]),
  'k9-firtina': ground('k9-firtina', [{ cue: 'six road wheels, three return rollers', check: run(6, 3) }]),
  'plz-05': ground('plz-05', [{ cue: 'seven road wheels behind skirts', check: (s) => run(7)(s) && skirted(s) }]),
  otomatic: ground('otomatic', [
    { cue: 'Leopard 1 hull: seven road wheels', check: run(7) },
    { cue: 'tall turret with a long 76 mm and a muzzle brake', check: (s) => turretH(1.2)(s) && cal(0.076)(s) && muzzle(s) },
    { cue: 'search radar on the turret', check: (s) => adds('slab', 1, 'turret')(s) || radar(s) },
  ]),
  'ram-3-7-aa': ground('ram-3-7-aa', [
    { cue: 'Ram hull: three VVSS bogies a side', check: run(6, 0) },
    { cue: 'long 3.7 inch AA gun on an open mount', check: (s) => cal(0.09)(s) && gunLen(4)(s) },
  ]),
  'sk-105': ground('sk-105', [
    { cue: 'five road wheels, three return rollers', check: run(5, 3) },
    { cue: 'oscillating FL-12 turret with the 105 mm', check: (s) => cal(0.105)(s) && !!s.guns?.some((g) => g.turret) },
  ]),
  'type-63-amphibious': ground('type-63-amphibious', [
    { cue: 'PT-76 type hull: six road wheels, no return rollers', check: run(6, 0) },
    { cue: 'cast turret with the 85 mm', check: (s) => castTurret(s) && cal(0.085)(s) },
  ]),
  'vt1-2': ground('vt1-2', [
    { cue: 'turretless hull with twin 120 mm side by side', check: (s) => noTurret(s) && guns(2)(s) },
    { cue: 'seven road wheels behind skirts', check: (s) => run(7)(s) && skirted(s) },
  ]),
  'amx-50': ground(['amx-50', 'amx-50-120'], [
    { cue: 'nine overlapping road wheels, five return rollers', check: (s) => interleave('overlap')(s) && run(9, 5)(s) },
    { cue: 'oscillating turret: collar and long upper body with the gun', check: (s) => partsOf(s).length >= 1 && !!s.guns?.some((g) => g.turret) },
    { cue: 'big sloped hull, taller than the AMX-30', check: (s) => hullShape(s) && tall(1.9)(s) },
  ]),
  'amx-50-120': ground('amx-50-120', [{ cue: 'long 120 mm with a muzzle brake', check: (s) => cal(0.12)(s) && muzzle(s) }]),
  'amx-50-100': ground('amx-50', [{ cue: '100 mm with a muzzle brake', check: (s) => cal(0.1, 0.105)(s) && muzzle(s) }]),
  // The generic 6x6 army truck (the class figure).
  truck: ground('truck', [
    { cue: 'three-axle army lorry', check: lorry(3) },
    { cue: 'cab forward of a long cargo body', check: (s) => !!s.cab && s.cab.length < s.length * 0.35 },
    { cue: 'canvas tilt over the cargo bed', check: (s) => s.bed === 'covered' },
  ]),
  // A trailer-mounted anti-aircraft searchlight (150 cm class).
  searchlight: emplacement('searchlight', [
    { cue: 'big drum lamp on a pedestal', check: (s) => s.kind === 'searchlight' },
    { cue: 'lamp taller than a man, on outrigger feet', check: (s) => s.kind === 'searchlight' },
  ]),
  // Rigid airship (Zeppelin L 30 class, 198 x 23.9 m).
  zeppelin: airship('zeppelin', [
    { cue: 'very long slim cylindrical hull', check: (s) => slender(s) > 7 },
    { cue: 'cruciform tail fins', check: (s) => !s.balloon },
    { cue: 'control car forward and engine cars along the keel', check: (s) => (s.gondolas ?? 0) >= 3 },
  ]),
  // Non-rigid blimp (C class, 59 x 12 m).
  blimp: airship('blimp', [
    { cue: 'short tapered envelope', check: (s) => slender(s) > 4 && slender(s) < 6 },
    { cue: 'cruciform tail fins', check: (s) => !s.balloon },
    { cue: 'one small car under the middle', check: (s) => s.gondolas === 1 },
  ]),
  'barrage-balloon': airship('barrage-balloon', [
    { cue: 'fat short envelope', check: (s) => slender(s) < 3 },
    { cue: 'three inflated tail lobes', check: (s) => !!s.balloon },
    { cue: 'no car', check: (s) => !s.gondolas },
  ]),
  'observation-balloon': airship('observation-balloon', [
    { cue: 'sausage-shaped envelope, longer than a barrage balloon', check: (s) => slender(s) >= 3 && s.length > 20 },
    { cue: 'three inflated tail lobes', check: (s) => !!s.balloon },
  ]),
  // The generic flying capital ship that stands for every game-invented one.
  titan: airship('titan', [
    { cue: 'hull hundreds of metres long', check: (s) => s.length >= 300 },
    { cue: 'cruciform tail fins', check: (s) => !s.balloon },
  ]),
  m35a2: ground('m35a2', [
    { cue: 'bonneted 2.5-ton 6x6, smaller than the M939', check: (s) => lorry(3)(s) && !!s.cab?.bonnet && shortHull(7.5)(s) },
    { cue: 'cargo bed with a tilt', check: adds('body', 1, 'hull') },
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
