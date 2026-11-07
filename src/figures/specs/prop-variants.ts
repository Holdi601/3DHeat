/**
 * Transports, bombers, piston and First World War aircraft drawn from their
 * own outlines, each variant whose silhouette differs as a figure of its own:
 * the fuselage from its side profile and plan (a glazed or solid nose, the
 * stepped cockpit, turrets, gondolas, sponsons), the wing's half planform,
 * the nacelles as bodies of their own (a fat radial cowl, a slim inline, a
 * jet pod), the fins as they stand (single, twin endplates, T) and the
 * tailplane's planform.
 *
 * Length, span and height are published values. Girths, chords, the places
 * of nacelles, fins and turrets are judged from the general shape of the
 * real aircraft (estimates, not traced from any drawing or game model).
 * Coordinates: forward from the aircraft's middle, out from the centre line,
 * up from the fuselage axis; metres. A published height stands on the
 * wheels; the figures fly, so their fins are placed from it less the gear.
 */

import type { SpecSet } from './index';
import type { FixedWingSpec } from '../air';
import type { Outline, P2 } from '../parts';
import { AIRCRAFT, jet, piston, type Piston } from './aircraft';

type Spec = FixedWingSpec & { cls: string };

const A: Record<string, Spec> = {};
const ALIASES: Record<string, string> = {};

// ---------------------------------------------------------------- helpers

/** A fuselage station: forward position, top, bottom, half-width. */
type Row = [number, number, number, number];
/** A wing, tailplane or fin station: out from the root (or up), leading edge, trailing edge. */
type Edge = [number, number, number];

/** A body from its stations, nose to tail. */
function fus(rows: Row[], round: number | P2[] = 2.4, stations = 28): Outline {
  return { top: rows.map(([x, t]) => [x, t] as P2), bottom: rows.map(([x, , b]) => [x, b] as P2), plan: rows.map(([x, , , w]) => [x, w] as P2), round, stations };
}

/** A half planform from its stations, root to tip, the tip rounded over `r` as half an ellipse. */
function planOf(rows: Edge[], r = 0): P2[] {
  const le: P2[] = rows.map(([y, l]) => [l, y]);
  const te: P2[] = rows.map(([y, , t]) => [t, y]);
  if (r <= 0 || rows.length < 2) return [...le, ...te.reverse()];
  const [Y, l1, t1] = rows[rows.length - 1];
  const [y0, l0, t0] = rows[rows.length - 2];
  const f = Math.max(0, Math.min(1, (Y - r - y0) / (Y - y0)));
  const la = l0 + (l1 - l0) * f;
  const ta = t0 + (t1 - t0) * f;
  le.pop();
  te.pop();
  const c = (la + ta) / 2;
  const h = (la - ta) / 2;
  const arc: P2[] = [];
  for (let i = 0; i <= 8; i++) {
    const th = (i / 8) * Math.PI;
    arc.push([c + h * Math.cos(th), Y - r + r * Math.sin(th)]);
  }
  return [...le, ...arc, ...te.reverse()];
}

/** An engine nacelle: its front, its back, radius, the height of its axis; radial cowls blunt, inlines pointed, jets open. */
interface Nac {
  y: number;
  x: number;
  back: number;
  r: number;
  z: number;
  kind?: 'radial' | 'inline' | 'jet';
  /** Extra depth below (radiators, gear bays), at its deepest. */
  below?: number;
  /** Width over height (oval cowls). */
  wide?: number;
  /** No propeller on it (a jet, or a nacelle whose propeller is drawn elsewhere). */
  noProp?: boolean;
  /** Where its propeller turns, when not at the front (a pusher). */
  propX?: number;
}

function nacelle(n: Nac): Outline {
  const L = n.x - n.back;
  const f0 = n.kind === 'radial' ? 0.86 : n.kind === 'jet' ? 0.92 : 0.32;
  const w = n.r * (n.wide ?? 1);
  const d = n.below ?? 0;
  const tail = n.kind === 'jet' ? 0.6 : 0.2;
  return {
    top: [[n.x, n.z + n.r * f0], [n.x - n.r * 0.7, n.z + n.r], [n.x - L * 0.5, n.z + n.r * 0.92], [n.back, n.z + n.r * tail]],
    bottom: [[n.x, n.z - n.r * f0], [n.x - n.r * 0.7, n.z - n.r - d * 0.4], [n.x - L * 0.45, n.z - n.r - d], [n.back, n.z - n.r * tail]],
    plan: [[n.x, w * f0], [n.x - n.r * 0.7, w], [n.x - L * 0.5, w * 0.92], [n.back, w * tail]],
    side: n.y,
    round: n.kind === 'jet' ? 2 : 2.3,
    stations: 12,
  };
}

/** A small round body: a turret dome, a blister, a radome; `up` positive stands on top, negative hangs below. */
function dome(x: number, z: number, r: number, len = r * 2, up = 1, side?: number): Outline {
  return { top: [[x + len / 2, z], [x + len * 0.2, z + Math.max(0, up) * r], [x - len * 0.2, z + Math.max(0, up) * r], [x - len / 2, z]], bottom: [[x + len / 2, z], [x + len * 0.2, z + Math.min(0, up) * r - (up > 0 ? 0.1 : 0)], [x - len * 0.2, z + Math.min(0, up) * r - (up > 0 ? 0.1 : 0)], [x - len / 2, z]], plan: [[x + len / 2, 0.04], [x + len * 0.2, r], [x - len * 0.2, r], [x - len / 2, 0.04]], side, round: 2, stations: 6 };
}

/** A thin upright plate as a body: a strut, a pylon, a winglet, an inner fin. */
function post(x0: number, x1: number, zTop: number, zBottom: number, half: number, side?: number, rake = 0): Outline {
  return { top: [[x0, zTop], [x1, zTop]], bottom: [[x0 - rake, zBottom], [x1 - rake, zBottom]], plan: [[x0, half], [x1, half]], side, round: 4, stations: 2 };
}

/** A fixed main wheel on its leg (in a spat when asked), standing on `ground`. */
function wheel(x: number, y: number, top: number, ground: number, r: number, spat = false): Outline[] {
  const zc = ground + r;
  const len = spat ? r * 2.8 : r * 2;
  const w = spat ? 0.2 : 0.1;
  return [
    { top: [[x + len / 2, zc], [x + len * 0.25, zc + r * 0.9], [x - len * 0.3, zc + r * 0.85], [x - len / 2, zc + r * 0.2]], bottom: [[x + len / 2, zc], [x + len * 0.25, zc - r * 0.9], [x - len * 0.3, zc - r * 0.9], [x - len / 2, zc]], plan: [[x + len / 2, 0.03], [x + len * 0.25, w], [x - len * 0.3, w], [x - len / 2, 0.03]], side: y, round: 2, stations: 6 },
    post(x + 0.1, x - 0.1, top, zc, 0.06, y),
  ];
}

/**
 * A fin as a body of its true root thickness (`half` each side), so it shows
 * edge-on from the front; its top and bottom at each station are where an
 * upright line there crosses the outline.
 */
function finBody(fin: P2[], half: number, side?: number): Outline {
  const xs0 = fin.map((p) => p[0]);
  const x0 = Math.min(...xs0);
  const x1 = Math.max(...xs0);
  const xs = [...new Set([...xs0, ...Array.from({ length: 13 }, (_, i) => x0 + ((x1 - x0) * i) / 12)])].sort((a, b) => b - a);
  const top: P2[] = [];
  const bottom: P2[] = [];
  for (const x0i of xs) {
    const x = Math.min(x1 - 1e-6, Math.max(x0 + 1e-6, x0i));
    const zs: number[] = [];
    for (let i = 0; i < fin.length; i++) {
      const [ax, az] = fin[i];
      const [bx, bz] = fin[(i + 1) % fin.length];
      if ((ax - x) * (bx - x) <= 0 && ax !== bx) zs.push(az + ((bz - az) * (x - ax)) / (bx - ax));
    }
    if (zs.length < 2) continue;
    top.push([x0i, Math.max(...zs)]);
    bottom.push([x0i, Math.min(...zs)]);
  }
  const plan: P2[] = top.map(([x]) => [x, half]);
  return { top, bottom, plan, side, round: 6, stations: 2 };
}

interface MP {
  cls: string;
  length: number;
  span: number;
  height: number;
  body: Row[];
  round?: number | P2[];
  wing: Edge[];
  tipR?: number;
  /** Height of the wing's mid-plane at the root, and its dihedral. */
  wingUp: number;
  dihedral?: number;
  nacelles?: Nac[];
  /** A propeller at the nose (a centre engine), at this forward position. */
  noseProp?: number;
  /** Propeller diameter and blades. */
  prop?: [number, number];
  /** The fin's outline, (forward, up) from the axis. */
  fin: P2[];
  /** Two fins at the tailplane's tips, this far apart, instead of one on the centre line. */
  twin?: number;
  tail: Edge[];
  tailR?: number;
  tailUp: number;
  extra?: Outline[];
  rotodome?: { x: number; diameter: number };
  /** One engine in the nose, its propeller on the body axis (single-engined biplanes). */
  nose?: boolean;
}

/**
 * A multi-engined aircraft from its outlines. The propellers stand at the
 * nacelles' fronts: the builder puts wing propellers on the wing's leading
 * edge at its mount height, so the wing's reference edge is set through the
 * nacelle fronts (its sweep from the innermost to the outermost), and the
 * wing's mid-plane is where the propellers turn.
 */
function mp(o: MP): Spec {
  const bh = Math.max(...o.body.map((r) => Math.max(Math.abs(r[1]), Math.abs(r[2]))));
  const bodyHeight = 2 * bh;
  const bodyWidth = 2 * Math.max(...o.body.map((r) => r[3]));
  const root = o.wing[0];
  const tip = o.wing[o.wing.length - 1];
  const rootChord = root[1] - root[2];
  const props = (o.nacelles ?? []).filter((n) => n.kind !== 'jet' && !n.noProp).map((n) => ({ y: n.y, x: n.propX ?? n.x + 0.1 }));
  if (o.noseProp !== undefined) props.unshift({ y: 0, x: o.noseProp });
  const ys = [...new Set(props.map((p) => p.y))].sort((a, b) => a - b);
  let tanS = 0;
  let le0 = root[1];
  if (ys.length) {
    const a = props.find((p) => p.y === ys[0])!;
    const b = props.find((p) => p.y === ys[ys.length - 1])!;
    tanS = ys.length > 1 ? (a.x - b.x) / (b.y - a.y) : 0;
    le0 = a.x - 0.11 + a.y * tanS;
  }
  const finTop = Math.max(...o.fin.map((p) => p[1]));
  const b0 = o.twin ? (o.tailUp - 0.35 * finTop) / 0.65 : 0;
  return {
    cls: o.cls,
    length: o.length,
    span: o.span,
    height: o.height,
    bodyWidth,
    bodyHeight,
    fuselage: fus(o.body, o.round ?? 2.4),
    bodies: [...(o.nacelles ?? []).map(nacelle), finBody(o.fin, Math.max(0.05, Math.min(0.35, (Math.max(...o.fin.map((p) => p[0])) - Math.min(...o.fin.map((p) => p[0]))) * 0.035)), o.twin ? o.twin / 2 : undefined), ...(o.extra ?? [])],
    wing: { x: le0 - rootChord / 2, span: o.span, rootChord, tipChord: tip[1] - tip[2], sweep: (Math.atan(tanS) * 180) / Math.PI, mount: o.wingUp / (bodyHeight * 0.4), dihedral: o.dihedral ?? 0 },
    wingPlan: planOf(o.wing, o.tipR ?? 0),
    tail: { kind: o.twin ? 'h' : 'single', finHeight: finTop, finChord: 2, spacing: o.twin, tailSpan: 2 * o.tail[o.tail.length - 1][0], tailChord: o.tail[0][1] - o.tail[0][2], finBase: 0, planeUp: o.tailUp },
    finPlan: o.twin ? o.fin.map(([x, z]) => [x, z - b0] as P2) : o.fin,
    tailPlan: planOf(o.tail, o.tailR ?? 0),
    engines: o.nose ? { kind: 'nose-prop', count: 1 } : ys.length ? { kind: 'wing-props', count: ys.length * 2, diameter: 0.05, length: 0.02, at: ys.map((y) => y / (o.span / 2)) } : undefined,
    propeller: o.prop ? { diameter: o.prop[0], blades: o.prop[1] } : undefined,
    rotodome: o.rotodome,
    canopy: { x: 0, length: 0, kind: 'none' },
  };
}

/** Moves the stations ahead of `front` forward and those behind `rear` back: a stretched fuselage. */
function stretch(rows: Row[], front: number, rear: number, fwd: number, aft: number): Row[] {
  return rows.map(([x, t, b, w]) => [x > front ? x + fwd : x < rear ? x - aft : x, t, b, w]);
}
const shiftP = (p: P2[], dx: number): P2[] => p.map(([x, z]) => [x + dx, z]);
const shiftE = (e: Edge[], dx: number): Edge[] => e.map(([y, l, t]) => [y, l + dx, t + dx]);

// ---------------------------------------------------------------- tactical transports

// C-130 Hercules: the round-nosed tube with the stepped flight deck, the high straight wing, four turboprop
// nacelles hanging under it, the main-gear sponsons low on the sides, the upswept rear with its ramp and a
// tall fin with a dorsal fillet (C-130H 29.79 x 40.41 x 11.84 m; the C-130J-30 stretched to 34.37 m, six-bladed
// propellers).
function c130(length: number, blades: number): Spec {
  const d = (length - 29.79) / 2;
  const body = stretch([[14.9, -0.45, -0.85, 0.12], [14.4, 0.4, -1.5, 0.9], [13.6, 1.0, -1.9, 1.5], [12.8, 1.7, -2.1, 1.9], [12.0, 2.15, -2.2, 2.08], [10.5, 2.3, -2.25, 2.15], [-5.0, 2.3, -2.25, 2.15], [-8.0, 2.25, -1.4, 2.0], [-11.0, 2.15, -0.2, 1.7], [-13.5, 1.9, 0.9, 1.1], [-14.9, 1.6, 1.3, 0.4]], 6, -6, d, d);
  return mp({
    cls: 'transport', length, span: 40.41, height: 11.84,
    body, round: 3,
    wing: [[0, 3.2, -1.7], [10, 3.0, -1.1], [20.2, 2.7, 0.0]], tipR: 0.8, wingUp: 1.95, dihedral: 2,
    nacelles: [{ y: 5.2, x: 6.2, back: -1.8, r: 0.62, z: 1.95, below: 0.25, wide: 0.9 }, { y: 10.0, x: 5.9, back: -1.6, r: 0.6, z: 1.95 + 0.17, below: 0.25, wide: 0.9 }],
    prop: [4.11, blades],
    fin: shiftP([[-6.0, 2.2], [-8.0, 3.4], [-10.7, 8.6], [-13.3, 8.65], [-14.2, 4.0], [-14.7, 2.0]], -d),
    tail: shiftE([[0, -10.2, -14.4], [8.0, -12.4, -14.4]], -d), tailR: 0.3, tailUp: 1.9,
    extra: [{ top: [[4.2, -1.0], [-4.0, -1.0]], bottom: [[4.2, -1.4], [3.0, -2.35], [-3.0, -2.35], [-4.0, -1.4]], plan: [[4.2, 0.1], [3.0, 0.5], [-3.0, 0.5], [-4.0, 0.1]], side: 2.0, round: 3, stations: 8 }],
  });
}
A['c-130h-hercules'] = c130(29.79, 4);
A['c-130j-30'] = c130(34.37, 6);

// C-17A Globemaster III: a fat tube, the high wing swept 25 degrees with winglets, four turbofan pods on pylons,
// big gear fairings low on the sides, the upswept rear and the T-tail (53.04 x 51.75 x 16.79 m).
A['c-17a'] = mp({
  cls: 'transport', length: 53.04, span: 51.75, height: 16.79,
  body: [[26.52, -0.6, -1.6, 0.25], [25.8, 0.8, -2.6, 1.8], [24.6, 2.1, -3.1, 2.8], [23.0, 3.0, -3.3, 3.3], [21.0, 3.3, -3.35, 3.42], [-8, 3.4, -3.35, 3.42], [-14, 3.3, -1.8, 3.3], [-19, 3.1, 0.5, 2.6], [-22.5, 2.9, 1.9, 1.4], [-24.0, 2.7, 2.3, 0.4]], round: 2.6,
  wing: [[0, 6.5, -5.0], [8, 2.25, -6.0], [24.6, -6.6, -9.5]], tipR: 0.3, wingUp: 3.0, dihedral: -3,
  nacelles: [{ y: 7.3, x: 5.0, back: -0.6, r: 1.15, z: 1.1, kind: 'jet' }, { y: 13.6, x: 1.6, back: -4.0, r: 1.15, z: 0.4, kind: 'jet' }],
  fin: [[-13.0, 3.3], [-15.5, 4.3], [-21.6, 12.0], [-24.8, 12.0], [-24.0, 2.7]],
  tail: [[0, -19.2, -24.0], [9.9, -24.6, -26.5]], tailR: 0.2, tailUp: 12.1,
  extra: [
    post(4.0, 1.0, 2.9, 1.8, 0.2, 7.3),
    post(0.6, -2.4, 2.6, 1.1, 0.2, 13.6),
    { top: [[5, -0.8], [-9, -0.8]], bottom: [[5, -1.6], [3, -3.8], [-6, -3.8], [-9, -1.5]], plan: [[5, 0.1], [3, 0.9], [-6, 0.9], [-9, 0.1]], side: 3.0, round: 3, stations: 8 },
    // Winglets, standing up at the tips.
    post(-6.4, -9.2, 4.4, 1.7, 0.08, 25.4, 1.4),
  ],
});

// Il-76: the glazed navigator's nose over a chin radome, a high anhedral wing swept 25 degrees, four pods on
// pylons, big gear sponsons, the T-tail and the tail gunner's turret (Il-76MD 46.59 x 50.5 x 14.76 m).
const IL76 = {
  cls: 'transport', length: 46.59, span: 50.5, height: 14.76,
  body: [[23.3, -0.6, -1.3, 0.3], [22.6, 0.5, -2.0, 1.3], [21.5, 1.3, -2.6, 1.9], [20.2, 2.0, -2.75, 2.25], [19.0, 2.4, -2.8, 2.4], [-8, 2.45, -2.45, 2.4], [-14, 2.4, -1.4, 2.3], [-19, 2.2, 0.4, 1.7], [-21.5, 2.0, 1.2, 1.0], [-23.3, 1.8, 1.4, 0.6]] as Row[], round: 2.4,
  wing: [[0, 4.5, -5.0], [9, 0.1, -7.2], [25.25, -7.8, -10.8]] as Edge[], tipR: 0.3, wingUp: 2.3, dihedral: -3,
  nacelles: [{ y: 6.8, x: 3.7, back: -1.7, r: 0.85, z: 0.8, kind: 'jet' }, { y: 12.6, x: 0.9, back: -4.5, r: 0.85, z: 0.15, kind: 'jet' }] as Nac[],
  fin: [[-12.0, 2.4], [-14.5, 3.6], [-19.3, 10.8], [-22.2, 10.8], [-21.8, 2.0]] as P2[],
  tail: [[0, -18.3, -22.6], [8.7, -21.8, -23.3]] as Edge[], tailR: 0.2, tailUp: 10.8,
};
const IL76_EXTRA: Outline[] = [
  post(2.6, -0.4, 1.9, 0.9, 0.18, 6.8),
  post(-0.2, -3.2, 1.6, 0.3, 0.18, 12.6),
  { top: [[6, -1.0], [-7, -1.0]], bottom: [[6, -1.5], [4.5, -3.4], [-5.5, -3.4], [-7, -1.5]], plan: [[6, 0.1], [4.5, 0.8], [-5.5, 0.8], [-7, 0.1]], side: 2.3, round: 3, stations: 8 },
];
A['il-76md'] = mp({
  ...IL76,
  extra: [...IL76_EXTRA, { top: [[22.2, -1.5], [18, -1.5]], bottom: [[22.2, -1.8], [21, -3.1], [19.0, -3.1], [18, -2.6]], plan: [[22.2, 0.3], [21, 1.1], [19, 1.1], [18, 0.5]], round: 2.4, stations: 8 }],
});
// A-50: the Il-76 with a solid nose and refuelling probe, the rotodome on its pylons, no tail turret (46.59 x 50.5 x 14.76 m).
A['a-50'] = mp({
  ...IL76, cls: 'awacs',
  body: [[23.3, -0.3, -0.9, 0.2], [22.6, 0.8, -1.8, 1.4], [21.5, 1.7, -2.5, 2.0], [20.2, 2.2, -2.75, 2.3], [19.0, 2.4, -2.8, 2.4], [-8, 2.45, -2.45, 2.4], [-14, 2.4, -1.4, 2.3], [-19, 2.2, 0.4, 1.7], [-21.5, 2.0, 1.4, 0.9], [-23.3, 1.8, 1.7, 0.2]],
  extra: [...IL76_EXTRA, post(20.5, 20.3, 3.2, 2.0, 0.1), { top: [[23.6, 2.6], [20.4, 2.7]], bottom: [[23.6, 2.5], [20.4, 2.5]], plan: [[23.6, 0.08], [20.4, 0.1]], round: 2, stations: 4 }],
  rotodome: { x: -4.0, diameter: 9.0 },
});

// An-26: a high wing whose outer panels droop, two turboprops in long nacelles running past the trailing edge,
// the upswept rear with its ramp and a tall fin with a long dorsal fillet (23.8 x 29.2 x 8.58 m).
const AN26 = {
  cls: 'transport', length: 23.8, span: 29.2, height: 8.58,
  body: [[11.9, -0.3, -0.8, 0.2], [11.3, 0.6, -1.3, 1.0], [10.4, 1.25, -1.45, 1.4], [9.5, 1.5, -1.5, 1.45], [-3, 1.5, -1.5, 1.45], [-6.5, 1.45, -0.6, 1.35], [-9.5, 1.35, 0.4, 0.9], [-11.9, 1.2, 0.9, 0.25]] as Row[],
  wing: [[0, 2.2, -1.4], [4.2, 2.1, -1.3], [14.6, 0.9, -0.2]] as Edge[], tipR: 0.4, wingUp: 1.3, dihedral: -2,
  nacelles: [{ y: 3.95, x: 4.6, back: -3.8, r: 0.62, z: 1.3, below: 0.45, wide: 0.85 }] as Nac[],
  prop: [3.9, 4] as [number, number],
  fin: [[-5.0, 1.5], [-7.8, 2.6], [-9.8, 6.0], [-11.6, 6.0], [-11.8, 1.2]] as P2[],
  tail: [[0, -8.6, -11.0], [4.95, -9.9, -11.2]] as Edge[], tailR: 0.3, tailUp: 1.6,
};
A['an-26'] = mp(AN26);
// An-30: the survey An-26 with a fully glazed navigator's nose and the flight deck raised above it (24.26 x 29.2 x 8.32 m).
A['an-30'] = mp({ ...AN26, cls: 'recon', length: 24.26, height: 8.32, body: [[12.13, -0.55, -1.0, 0.35], [11.6, 0.3, -1.35, 0.95], [10.7, 0.95, -1.5, 1.35], [9.8, 1.8, -1.5, 1.45], [8.4, 1.8, -1.5, 1.45], [7.4, 1.5, -1.5, 1.45], [-3, 1.5, -1.5, 1.45], [-6.5, 1.45, -0.6, 1.35], [-9.5, 1.35, 0.4, 0.9], [-12.0, 1.2, 0.9, 0.25]] });

// ---------------------------------------------------------------- jet transports, tankers, AWACS

/** The Boeing 707 family (C-135, E-3): a low wing swept 35 degrees, four pods hung ahead of it, a swept fin. */
function b707(cls: string, length: number, span: number, height: number, podR: number, podLen: number, extra: Outline[] = [], rotodome?: { x: number; diameter: number }): Spec {
  const h = length / 2;
  const s = span / 2;
  const tipLe = 4.8 - (s - 0) * Math.tan((37 * Math.PI) / 180);
  const pods: Nac[] = [7.2, 12.4].map((y, i) => {
    const le = 4.8 - y * Math.tan((37 * Math.PI) / 180);
    return { y, x: le + podLen * 0.62, back: le + podLen * 0.62 - podLen, r: podR, z: -1.3 + y * 0.12 - podR - 0.45, kind: 'jet' as const, wide: 0.95 + i * 0 };
  });
  return mp({
    cls, length, span, height,
    body: [[h, -0.3, -0.9, 0.2], [h - 0.8, 0.8, -1.5, 1.2], [h - 2.0, 1.65, -1.85, 1.7], [h - 3.3, 1.95, -1.95, 1.83], [-h + 10.8, 1.95, -1.95, 1.83], [-h + 5.8, 1.85, -1.2, 1.5], [-h + 2.3, 1.6, -0.1, 0.9], [-h, 1.3, 0.7, 0.2]],
    wing: [[0, 4.8, -4.4], [7.5, -0.9, -5.4], [s, tipLe, tipLe - 2.0]], tipR: 0.3, wingUp: -1.3, dihedral: 7,
    nacelles: pods,
    fin: [[-h + 9.3, 1.9], [-h + 6.3, 3.0], [-h + 2.6, 9.3], [-h + 0.2, 9.3], [-h + 0.4, 1.4]],
    tail: [[0, -h + 5.6, -h + 1.3], [6.35, -h + 1.0, -h - 0.2]], tailR: 0.2, tailUp: 0.8,
    extra: [...pods.map((p) => post(p.x - 0.8, p.back + 0.6, -1.3 + p.y * 0.12, p.z + p.r * 0.8, 0.15, p.y)), ...extra],
    rotodome,
  });
}
// KC-135R Stratotanker: the 707 shape on a shorter body, fat CFM56 pods, the refuelling boom under the tail (41.53 x 39.88 x 12.7 m).
A['kc-135'] = b707('tanker', 41.53, 39.88, 12.7, 1.05, 4.9, [{ top: [[-15.5, -1.3], [-21.5, -1.5]], bottom: [[-15.5, -1.6], [-21.5, -1.7]], plan: [[-15.5, 0.25], [-21.5, 0.15]], round: 2, stations: 4 }]);
// E-3A Sentry: the 707-320 with slim TF33 pods and the 9.1 m rotodome on two struts aft of the wing (46.61 x 44.42 x 12.6 m).
A['e-3a'] = b707('awacs', 46.61, 44.42, 12.6, 0.75, 6.0, [], { x: -6.5, diameter: 9.14 });

// E-2C Hawkeye: a stubby body under its 7.3 m rotodome, a high straight wing with two turboprops in long
// nacelles, and four fins on the tailplane (17.56 x 24.56 x 5.58 m); the E-2D's eight-bladed propellers.
function e2(blades: number): Spec {
  return mp({
    cls: 'awacs', length: 17.56, span: 24.56, height: 5.58,
    body: [[8.78, -0.2, -0.6, 0.15], [8.2, 0.5, -0.95, 0.75], [7.2, 0.9, -1.1, 0.95], [6.3, 1.15, -1.15, 1.0], [-2, 1.15, -1.15, 1.0], [-5.5, 1.0, -0.4, 0.75], [-8.78, 0.75, 0.25, 0.25]],
    wing: [[0, 2.4, -1.0], [12.28, 1.6, 0.2]], tipR: 0.4, wingUp: 0.85,
    nacelles: [{ y: 3.9, x: 4.6, back: -1.8, r: 0.55, z: 0.85, below: 0.4, wide: 0.9 }],
    prop: [4.11, blades],
    fin: [[-6.4, -0.4], [-7.5, -0.4], [-7.9, 3.3], [-6.9, 3.3]], twin: 8.0,
    tail: [[0, -6.4, -8.0], [4.0, -6.8, -7.9]], tailR: 0.2, tailUp: 0.6,
    extra: [post(-6.5, -7.6, 3.0, -0.3, 0.06, 1.75)],
    rotodome: { x: -0.8, diameter: 7.32 },
  });
}
A['e-2c'] = e2(4);
A['e-2d'] = e2(8);

// Yak-40: a straight low wing, two engines in pods either side of the rear fuselage and the third in the tail
// fed from a dorsal intake, the T-tail (20.36 x 25.0 x 6.5 m).
A['yak-40'] = mp({
  cls: 'transport', length: 20.36, span: 25.0, height: 6.5,
  body: [[10.18, -0.25, -0.6, 0.15], [9.5, 0.55, -1.05, 0.85], [8.3, 1.05, -1.25, 1.15], [7.3, 1.25, -1.3, 1.2], [-4, 1.25, -1.3, 1.2], [-7.5, 1.15, -0.5, 1.0], [-10.18, 0.9, 0.4, 0.3]],
  wing: [[0, 2.6, -1.4], [12.5, 2.0, 0.7]], tipR: 0.3, wingUp: -0.8, dihedral: 5,
  nacelles: [{ y: 1.75, x: -3.4, back: -7.6, r: 0.6, z: 0.65, kind: 'jet' }],
  fin: [[-5.6, 1.2], [-7.4, 2.0], [-9.0, 4.2], [-10.2, 4.2], [-10.1, 1.0]],
  tail: [[0, -8.4, -10.3], [3.75, -9.8, -10.6]], tailR: 0.2, tailUp: 4.25,
  extra: [{ top: [[-3.0, 1.2], [-3.6, 1.85], [-6.0, 1.85], [-7.0, 1.2]], bottom: [[-3.0, 1.0], [-7.0, 1.0]], plan: [[-3.0, 0.3], [-3.6, 0.5], [-6.0, 0.45], [-7.0, 0.3]], round: 3, stations: 8 }],
});

// ---------------------------------------------------------------- piston transports

// C-47 Skytrain / DC-3: a round nose with the stepped windscreen, a low wing whose outer panels sweep their
// leading edge back, two radials, a fin with a curving dorsal fillet (19.43 x 28.96 x 5.16 m).
const C47 = {
  cls: 'transport', length: 19.43, span: 28.96, height: 5.16,
  body: [[9.72, -0.1, -0.5, 0.15], [9.3, 0.5, -0.95, 0.7], [8.4, 0.95, -1.25, 1.05], [7.6, 1.3, -1.3, 1.17], [3.0, 1.3, -1.3, 1.17], [-3, 1.2, -1.05, 1.05], [-6.5, 1.0, -0.4, 0.8], [-9.72, 0.7, 0.35, 0.15]] as Row[],
  wing: [[0, 3.6, -0.8], [3.0, 3.6, -0.85], [14.48, 0.5, -1.0]] as Edge[], tipR: 0.6, wingUp: -0.8, dihedral: 5,
  nacelles: [{ y: 2.9, x: 5.2, back: -1.6, r: 0.72, z: -0.8, kind: 'radial', below: 0.15 }] as Nac[],
  prop: [3.51, 3] as [number, number],
  fin: [[-3.5, 1.15], [-6.5, 1.7], [-8.4, 4.3], [-9.2, 4.4], [-9.75, 3.6], [-9.7, 0.7]] as P2[],
  tail: [[0, -6.9, -9.6], [4.3, -7.8, -9.4]] as Edge[], tailR: 0.5, tailUp: 0.6,
};
A['c-47'] = mp(C47);
// Li-2: the Soviet DC-3, its military version with the dorsal gun turret behind the cabin roof (19.65 x 28.81 x 5.15 m).
A['li-2'] = mp({ ...C47, length: 19.65, span: 28.81, height: 5.15, extra: [dome(0.6, 1.25, 0.5, 1.2)] });

// Ju 52/3m: a slab-sided corrugated box, a thick low wing tapered both ways, three radials (one in the nose), fixed
// main wheels under the nacelles, a round-topped fin (18.9 x 29.25 x 4.5 m).
A['ju-52'] = mp({
  cls: 'transport', length: 18.9, span: 29.25, height: 4.5,
  body: [[9.45, -0.1, -0.85, 0.35], [9.0, 0.35, -1.1, 0.7], [8.3, 0.4, -1.15, 0.72], [7.6, 0.7, -1.15, 0.8], [6.6, 1.25, -1.15, 0.95], [5.6, 1.4, -1.15, 0.95], [-3, 1.35, -1.0, 0.9], [-6.5, 1.1, -0.3, 0.65], [-9.45, 0.85, 0.4, 0.15]], round: [[9.4, 2.2], [7.5, 3.5], [-9.45, 4]],
  wing: [[0, 3.6, -2.0], [14.6, 1.0, -0.3]], tipR: 0.5, wingUp: -0.55, dihedral: 4,
  nacelles: [{ y: 4.6, x: 5.0, back: 0.6, r: 0.6, z: -0.55, kind: 'radial' }],
  noseProp: 9.55,
  prop: [3.4, 3],
  fin: [[-5.8, 1.1], [-7.2, 1.5], [-8.0, 3.0], [-8.6, 3.2], [-9.2, 2.9], [-9.5, 0.8]],
  tail: [[0, -7.6, -9.3], [3.6, -8.0, -9.2]], tailR: 0.4, tailUp: 0.7,
  extra: [...wheel(2.6, 2.6, -0.8, -2.6, 0.5, true)],
});

// ---------------------------------------------------------------- four-engined bombers

const B17 = AIRCRAFT.air!['b-17g'];
// B-17: the top turret behind the cockpit and the ball turret under the waist; the G adds the chin turret under
// the glazed nose (22.66 x 31.62 x 5.82 m); the E has no chin turret.
const B17_TURRETS = [dome(6.6, 1.35, 0.55, 1.3), dome(-1.6, -1.15, 0.55, 1.2, -1), finBody((B17.finPlan ?? []).map(([x, h]) => [x, h + (B17.tail.finBase ?? 0)] as P2), 0.25)];
A['b-17e'] = { ...B17, length: 22.5, canopy: { x: 0, length: 0, kind: 'none' }, bodies: [...(B17.bodies ?? []), ...B17_TURRETS] };
A['b-17g'] = { ...B17, canopy: { x: 0, length: 0, kind: 'none' }, bodies: [...(B17.bodies ?? []), ...B17_TURRETS, dome(10.3, -0.8, 0.65, 1.2, -1)] };

// B-24 Liberator: a deep slab-sided body, the long narrow Davis wing on its shoulder, tall oval nacelles,
// twin oval fins on the tailplane's tips (B-24D 20.47 x 33.53 x 5.49 m; the J's nose turret, 20.6 m).
function b24(nose: Row[], length: number): Spec {
  return mp({
    cls: 'ww2-heavy-bomber', length, span: 33.53, height: 5.49,
    body: [...nose, [7.4, 1.55, -1.7, 1.22], [6.4, 1.75, -1.7, 1.22], [-2, 1.7, -1.7, 1.2], [-6, 1.5, -1.0, 1.0], [-9.0, 1.2, -0.1, 0.55], [-10.24, 1.0, 0.3, 0.35]], round: 3.6,
    wing: [[0, 2.4, -2.0], [16.77, 1.0, -0.5]], tipR: 0.5, wingUp: 1.3, dihedral: 3,
    nacelles: [{ y: 4.5, x: 4.7, back: -2.2, r: 0.62, z: 1.3, wide: 0.75, below: 0.5, kind: 'radial' }, { y: 8.6, x: 4.1, back: -1.8, r: 0.62, z: 1.75, wide: 0.75, below: 0.45, kind: 'radial' }],
    prop: [3.53, 3],
    fin: [[-8.0, 0.9], [-8.3, 1.9], [-8.9, 2.55], [-9.6, 2.6], [-10.2, 2.1], [-10.4, 0.9], [-10.2, -0.3], [-9.6, -0.8], [-8.9, -0.8], [-8.3, -0.3]], twin: 7.9,
    tail: [[0, -8.0, -10.0], [3.95, -8.2, -9.9]], tailUp: 1.0,
    extra: [dome(6.0, 1.7, 0.5, 1.2), dome(-2.8, -1.6, 0.5, 1.1, -1)],
  });
}
A['b-24'] = b24([[10.24, -0.1, -1.0, 0.4], [9.6, 0.6, -1.45, 1.0], [8.6, 1.1, -1.65, 1.2]], 20.47);
A['b-24j'] = b24([[10.3, 0.35, -0.75, 0.5], [9.8, 0.65, -1.3, 0.85], [9.0, 0.95, -1.55, 1.15], [8.4, 1.15, -1.65, 1.2]], 20.6);

// B-29 Superfortress: a long round tube with the stepless glazed nose, a high-aspect mid wing, four radials in long
// nacelles, remote turret blisters top and bottom and the great fin with its dorsal fillet (30.18 x 43.05 x 8.46 m).
A['b-29'] = mp({
  cls: 'ww2-heavy-bomber', length: 30.18, span: 43.05, height: 8.46,
  body: [[15.09, -0.2, -0.9, 0.35], [14.6, 0.65, -1.3, 1.0], [13.6, 1.3, -1.45, 1.4], [12.3, 1.45, -1.45, 1.45], [-8, 1.45, -1.45, 1.45], [-12, 1.3, -0.9, 1.2], [-14.5, 1.0, -0.2, 0.6], [-15.09, 0.8, 0.1, 0.4]], round: 2.1,
  wing: [[0, 3.0, -2.6], [21.53, -0.5, -2.4]], tipR: 0.6, wingUp: 0, dihedral: 4.5,
  nacelles: [{ y: 5.1, x: 4.4, back: -3.6, r: 0.85, z: 0, kind: 'radial', below: 0.2 }, { y: 10.2, x: 3.8, back: -3.2, r: 0.85, z: 0.4, kind: 'radial', below: 0.2 }],
  prop: [5.05, 4],
  fin: [[-6.5, 1.45], [-10.0, 2.3], [-12.0, 5.2], [-13.2, 5.4], [-14.4, 5.0], [-15.0, 1.0]],
  tail: [[0, -10.2, -14.0], [6.7, -12.0, -13.8]], tailR: 0.5, tailUp: 0.3,
  extra: [dome(8.6, 1.4, 0.4, 1.0), dome(-4.0, 1.4, 0.4, 1.0), dome(6.0, -1.4, 0.4, 1.0, -1), dome(-5.0, -1.4, 0.4, 1.0, -1)],
});

// ---------------------------------------------------------------- twin-engined bombers

// B-25 Mitchell: the slim body with a glazed nose, the wing's inner panels raised and outer panels flat, radials
// in nacelles running far past the trailing edge, twin fins on the tailplane's tips, the tail gunner's glazing
// (B-25J 16.13 x 20.6 x 4.98 m); the B-25H a short solid gun nose (15.54 m).
function b25(nose: Row[], length: number, turretX: number): Spec {
  return mp({
    cls: 'ww2-bomber', length, span: 20.6, height: 4.98,
    body: [...nose, [5.4, 1.05, -0.92, 0.7], [4.4, 1.15, -0.95, 0.7], [-1, 1.0, -0.95, 0.68], [-5, 0.85, -0.55, 0.55], [-7.4, 0.65, -0.05, 0.35], [-8.07, 0.55, 0.15, 0.3]],
    wing: [[0, 2.4, -0.9], [3.6, 2.3, -0.95], [10.3, 0.9, -0.1]], tipR: 0.35, wingUp: 0.35, dihedral: 2.5,
    nacelles: [{ y: 2.95, x: 4.0, back: -2.9, r: 0.68, z: 0.35, kind: 'radial', below: 0.15 }],
    prop: [3.84, 3],
    fin: [[-6.4, -0.4], [-6.5, 2.4], [-6.8, 2.7], [-7.8, 2.7], [-8.0, 2.4], [-8.0, -0.4], [-7.8, -0.7], [-6.6, -0.7]], twin: 6.6,
    tail: [[0, -6.2, -7.9], [3.3, -6.4, -7.9]], tailUp: 0.4,
    extra: [dome(turretX, 1.0, 0.45, 1.1)],
  });
}
A['b-25'] = b25([[8.07, 0.0, -0.35, 0.15], [7.6, 0.4, -0.7, 0.55], [6.9, 0.6, -0.85, 0.65], [6.0, 0.7, -0.9, 0.68]], 16.13, 3.2);
A['b-25h'] = b25([[7.77, 0.0, -0.4, 0.2], [7.3, 0.5, -0.75, 0.6], [6.5, 0.68, -0.88, 0.68], [5.8, 0.75, -0.9, 0.7]], 15.54, 4.2);

// He 111H: the stepless, fully glazed nose blending into the body, the ventral gondola, an elliptic-tipped wing
// tapered both ways, inlines with annular radiators, a tall rounded fin (16.4 x 22.6 x 4.0 m).
A['he-111'] = mp({
  cls: 'ww2-bomber', length: 16.4, span: 22.6, height: 4.0,
  body: [[8.2, 0.1, -0.35, 0.2], [7.8, 0.65, -0.75, 0.6], [7.0, 0.95, -0.95, 0.8], [6.0, 1.05, -1.05, 0.85], [2, 1.05, -1.05, 0.85], [-3, 0.85, -0.75, 0.65], [-6.5, 0.6, -0.2, 0.35], [-8.2, 0.45, 0.15, 0.1]], round: 2.2,
  wing: [[0, 3.4, -2.0], [11.3, 0.6, -0.6]], tipR: 1.2, wingUp: -0.4, dihedral: 5,
  nacelles: [{ y: 3.2, x: 4.3, back: -2.4, r: 0.62, z: -0.4, kind: 'radial', below: 0.2 }],
  prop: [3.5, 3],
  fin: [[-5.4, 0.8], [-6.8, 1.4], [-7.6, 2.55], [-8.1, 2.7], [-8.6, 2.4], [-8.4, 0.4]],
  tail: [[0, -6.4, -8.4], [3.0, -7.0, -8.0]], tailR: 0.7, tailUp: 0.4,
  extra: [{ top: [[4.6, -0.8], [-0.5, -0.8]], bottom: [[4.6, -1.0], [3.8, -1.45], [0.5, -1.45], [-0.5, -0.95]], plan: [[4.6, 0.2], [3.8, 0.5], [0.5, 0.5], [-0.5, 0.2]], round: 2.6, stations: 8 }, dome(0.4, 0.95, 0.35, 1.2)],
});

// Ju 88A-4: the bug-eye glazed cockpit at the nose, the Bola gondola under it, a straight tapered wing,
// annular-cowled engines that look like radials, a tall round-topped fin (14.36 x 20.08 x 4.85 m); the C-6
// heavy fighter a solid nose and no gondola.
function ju88(nose: Row[], gondola: boolean): Spec {
  return mp({
    cls: gondola ? 'ww2-bomber' : 'ww2-heavy-fighter', length: 14.36, span: 20.08, height: 4.85,
    body: [...nose, [3.6, 0.85, -0.85, 0.72], [-1, 0.85, -0.85, 0.7], [-4.5, 0.65, -0.45, 0.5], [-7.18, 0.45, 0.1, 0.12]], round: 2.2,
    wing: [[0, 2.2, -1.4], [10.04, 0.6, -0.9]], tipR: 0.5, wingUp: -0.45, dihedral: 5,
    nacelles: [{ y: 2.75, x: 3.7, back: -2.6, r: 0.62, z: -0.45, kind: 'radial', below: 0.15 }],
    prop: [3.5, 3],
    fin: [[-3.9, 0.75], [-5.4, 1.1], [-6.4, 2.45], [-6.8, 2.6], [-7.3, 2.45], [-7.2, 0.4]],
    tail: [[0, -5.2, -7.0], [3.5, -5.8, -6.9]], tailR: 0.5, tailUp: 0.45,
    extra: gondola ? [{ top: [[5.2, -0.6], [2.4, -0.6]], bottom: [[5.2, -0.75], [4.6, -1.2], [3.0, -1.15], [2.4, -0.8]], plan: [[5.2, 0.2], [4.6, 0.38], [3.0, 0.35], [2.4, 0.15]], round: 2.4, stations: 6 }] : [],
  });
}
A['ju-88'] = ju88([[7.18, -0.25, -0.6, 0.25], [6.9, 0.35, -0.75, 0.6], [6.3, 0.85, -0.8, 0.75], [5.5, 1.15, -0.85, 0.75], [4.4, 1.15, -0.85, 0.75]], true);
A['ju-88c'] = ju88([[7.18, -0.1, -0.45, 0.2], [6.7, 0.35, -0.7, 0.6], [6.0, 0.7, -0.8, 0.72], [5.4, 1.05, -0.85, 0.75], [4.4, 1.1, -0.85, 0.75]], false);

// Pe-2: a slim body with the long canopy and glazed lower nose, inline nacelles, a dihedral wing, twin fins on
// the tailplane's tips (12.66 x 17.16 x 3.5 m).
A['pe-2'] = mp({
  cls: 'ww2-bomber', length: 12.66, span: 17.16, height: 3.5,
  body: [[6.33, -0.15, -0.4, 0.15], [5.9, 0.3, -0.6, 0.5], [5.0, 0.55, -0.75, 0.6], [4.2, 0.95, -0.75, 0.62], [2.0, 0.95, -0.75, 0.62], [0.8, 0.75, -0.75, 0.6], [-3, 0.6, -0.5, 0.45], [-6.33, 0.4, 0.0, 0.12]],
  wing: [[0, 1.8, -1.4], [8.58, 0.5, -0.55]], tipR: 0.4, wingUp: -0.3, dihedral: 7,
  nacelles: [{ y: 2.25, x: 3.0, back: -2.4, r: 0.5, z: -0.3, below: 0.15 }],
  prop: [3.0, 3],
  fin: [[-5.2, 0.2], [-5.4, 1.35], [-5.9, 1.55], [-6.4, 1.4], [-6.5, -0.2], [-6.2, -0.5], [-5.5, -0.45]], twin: 4.7,
  tail: [[0, -5.2, -6.5], [2.35, -5.4, -6.4]], tailUp: 0.5,
});

// Tu-2: twin big radials, a stepped high canopy over a glazed nose, a mid-high wing, twin fins (13.8 x 18.86 x 4.13 m).
A['tu-2'] = mp({
  cls: 'ww2-bomber', length: 13.8, span: 18.86, height: 4.13,
  body: [[6.9, -0.2, -0.5, 0.2], [6.4, 0.4, -0.75, 0.6], [5.6, 0.65, -0.9, 0.7], [4.8, 1.15, -0.9, 0.72], [3.0, 1.15, -0.9, 0.72], [2.0, 0.8, -0.9, 0.7], [-3, 0.7, -0.6, 0.55], [-6.9, 0.45, 0.05, 0.12]],
  wing: [[0, 2.1, -1.5], [9.43, 0.6, -0.7]], tipR: 0.45, wingUp: 0.2, dihedral: 4,
  nacelles: [{ y: 2.75, x: 3.4, back: -2.6, r: 0.72, z: 0.2, kind: 'radial', below: 0.2 }],
  prop: [3.8, 3],
  fin: [[-5.3, 0.3], [-5.5, 1.65], [-6.0, 1.85], [-6.6, 1.7], [-6.8, -0.4], [-6.4, -0.7], [-5.6, -0.6]], twin: 5.6,
  tail: [[0, -5.2, -6.8], [2.8, -5.5, -6.7]], tailUp: 0.5,
});

// B-26 Marauder: a round cigar body, a shoulder wing, big four-bladed radials, a tall fin, the top turret aft (17.8 x 21.65 x 6.55 m).
A['b-26-marauder'] = mp({
  cls: 'ww2-bomber', length: 17.8, span: 21.65, height: 6.55,
  body: [[8.9, -0.1, -0.5, 0.2], [8.4, 0.5, -0.85, 0.7], [7.5, 0.85, -0.95, 0.9], [6.6, 1.05, -0.95, 0.95], [-2, 0.98, -0.95, 0.95], [-6, 0.8, -0.6, 0.75], [-8.4, 0.55, -0.1, 0.4], [-8.9, 0.4, 0.05, 0.25]], round: 2.1,
  wing: [[0, 2.4, -1.4], [10.83, 0.7, -0.4]], tipR: 0.4, wingUp: 0.35,
  nacelles: [{ y: 2.9, x: 4.1, back: -3.0, r: 0.75, z: 0.35, kind: 'radial', below: 0.2 }],
  prop: [4.04, 4],
  fin: [[-4.8, 0.95], [-6.8, 1.6], [-7.6, 3.9], [-8.4, 4.1], [-9.0, 3.8], [-8.9, 0.4]],
  tail: [[0, -6.8, -8.8], [3.9, -7.6, -8.7]], tailR: 0.4, tailUp: 0.6,
  extra: [dome(-2.5, 0.95, 0.45, 1.1)],
});

// A-26 Invader: a narrow body with the clamshell canopy, a laminar mid wing, radials, a tall fin, remote turrets
// top and bottom (15.24 x 21.34 x 5.64 m); the B's solid gun nose, the C's rounder glazed one.
function a26(nose: Row[]): Spec {
  return mp({
    cls: 'ww2-bomber', length: 15.24, span: 21.34, height: 5.64,
    body: [...nose, [5.0, 0.7, -0.85, 0.6], [4.4, 1.2, -0.85, 0.6], [2.6, 1.2, -0.85, 0.6], [1.8, 0.85, -0.85, 0.6], [-3, 0.7, -0.6, 0.5], [-7.62, 0.45, 0.05, 0.12]],
    wing: [[0, 2.0, -1.5], [10.67, 0.6, -0.6]], tipR: 0.35, wingUp: 0, dihedral: 4,
    nacelles: [{ y: 2.8, x: 3.9, back: -2.6, r: 0.75, z: 0, kind: 'radial', below: 0.2 }],
    prop: [3.8, 3],
    fin: [[-4.5, 0.7], [-6.3, 1.2], [-7.0, 3.4], [-7.7, 3.5], [-7.9, 0.4]],
    tail: [[0, -6.2, -7.6], [3.6, -6.9, -7.6]], tailR: 0.3, tailUp: 0.4,
    extra: [dome(-1.8, 0.7, 0.35, 0.9), dome(-1.4, -0.85, 0.35, 0.9, -1)],
  });
}
A['a-26-invader'] = a26([[7.62, -0.1, -0.45, 0.2], [7.1, 0.45, -0.75, 0.55], [6.2, 0.65, -0.85, 0.6]]);
A['a-26c'] = a26([[7.62, -0.05, -0.35, 0.25], [7.25, 0.4, -0.65, 0.5], [6.6, 0.62, -0.82, 0.6], [5.9, 0.68, -0.85, 0.6]]);

// A-20G Havoc: a very deep, narrow body with a solid gun nose, a shoulder wing, radials, a tall fin (14.63 x 18.69 x 5.36 m).
A['a-20g'] = mp({
  cls: 'ww2-bomber', length: 14.63, span: 18.69, height: 5.36,
  body: [[7.32, -0.1, -0.6, 0.2], [6.8, 0.5, -0.95, 0.55], [5.8, 0.75, -1.1, 0.6], [4.7, 0.9, -1.1, 0.6], [4.0, 1.2, -1.1, 0.6], [2.8, 1.2, -1.1, 0.6], [2.0, 0.95, -1.1, 0.6], [-3, 0.85, -0.8, 0.5], [-7.32, 0.6, 0.05, 0.12]], round: 2.6,
  wing: [[0, 2.0, -1.4], [9.35, 0.5, -0.5]], tipR: 0.35, wingUp: 0.55, dihedral: 5,
  nacelles: [{ y: 2.6, x: 3.4, back: -2.6, r: 0.72, z: 0.55, kind: 'radial', below: 0.3 }],
  prop: [3.5, 3],
  fin: [[-4.5, 0.9], [-6.0, 1.3], [-6.6, 3.3], [-7.3, 3.4], [-7.5, 0.6]],
  tail: [[0, -5.8, -7.4], [3.3, -6.4, -7.3]], tailR: 0.3, tailUp: 1.0,
  extra: [dome(-1.0, 0.9, 0.4, 1.0)],
});

// Blenheim Mk I: the short glazed nose, a mid-low wing, radials, the dorsal turret, a small fin (12.12 x 17.17 x 3.0 m);
// the Mk IV's longer nose with the cockpit set back (12.98 m).
function blenheim(nose: Row[], length: number): Spec {
  return mp({
    cls: 'ww2-bomber', length, span: 17.17, height: 3.0,
    body: [...nose, [3.6, 0.85, -0.85, 0.75], [-1, 0.8, -0.85, 0.7], [-4, 0.6, -0.5, 0.5], [-6.06, 0.4, 0.0, 0.12]],
    wing: [[0, 2.0, -1.4], [8.59, 0.6, -0.4]], tipR: 0.45, wingUp: -0.3, dihedral: 6,
    nacelles: [{ y: 2.4, x: 3.3, back: -1.9, r: 0.65, z: -0.3, kind: 'radial', below: 0.15 }],
    prop: [3.3, 3],
    fin: [[-3.8, 0.7], [-5.0, 0.95], [-5.6, 1.7], [-6.1, 1.8], [-6.4, 1.5], [-6.2, 0.4]],
    tail: [[0, -4.8, -6.2], [2.8, -5.3, -6.1]], tailR: 0.4, tailUp: 0.45,
    extra: [dome(-1.2, 0.8, 0.45, 1.1)],
  });
}
A['blenheim'] = blenheim([[6.06, -0.1, -0.6, 0.3], [5.7, 0.55, -0.75, 0.65], [5.0, 0.8, -0.8, 0.75]], 12.12);
A['blenheim-iv'] = blenheim([[6.49, -0.2, -0.55, 0.25], [6.1, 0.2, -0.7, 0.6], [5.3, 0.45, -0.8, 0.72], [4.5, 0.85, -0.85, 0.75]], 12.98);

// Beaufighter TF X: a stubby body barely longer than the great Hercules nacelles ahead of it, a mid wing, the big
// dorsal fin fillet (12.6 x 17.63 x 4.83 m).
A['beaufighter'] = mp({
  cls: 'ww2-heavy-fighter', length: 12.6, span: 17.63, height: 4.83,
  body: [[6.3, 0.0, -0.55, 0.35], [6.0, 0.65, -0.7, 0.65], [5.4, 0.95, -0.8, 0.75], [4.6, 0.95, -0.85, 0.75], [-1, 0.85, -0.85, 0.72], [-4, 0.65, -0.45, 0.5], [-6.3, 0.45, 0.05, 0.12]],
  wing: [[0, 2.5, -1.4], [8.82, 0.9, -0.4]], tipR: 0.45, wingUp: 0, dihedral: 6,
  nacelles: [{ y: 2.65, x: 6.2, back: -1.6, r: 0.8, z: 0, kind: 'radial', below: 0.2 }],
  prop: [3.9, 3],
  fin: [[-3.6, 0.8], [-5.0, 1.1], [-5.6, 2.4], [-6.1, 2.5], [-6.6, 2.1], [-6.4, 0.45]],
  tail: [[0, -4.9, -6.5], [3.0, -5.4, -6.4]], tailR: 0.4, tailUp: 0.5,
});

// Wellington: nose and tail turrets on a deep geodetic body, a long tapered mid wing, radials, a tall rounded fin (19.69 x 26.26 x 5.31 m).
A['wellington'] = mp({
  cls: 'ww2-bomber', length: 19.69, span: 26.26, height: 5.31,
  body: [[9.85, 0.1, -0.45, 0.35], [9.3, 0.6, -0.8, 0.7], [8.3, 0.85, -1.05, 0.9], [6.7, 1.25, -1.15, 0.92], [5.5, 1.25, -1.2, 0.92], [-2, 1.15, -1.15, 0.9], [-6, 0.9, -0.6, 0.7], [-9.0, 0.6, 0.0, 0.35], [-9.85, 0.45, 0.15, 0.3]],
  wing: [[0, 2.8, -2.4], [13.13, 0.2, -1.1]], tipR: 0.7, wingUp: 0, dihedral: 5,
  nacelles: [{ y: 2.95, x: 4.6, back: -2.2, r: 0.75, z: 0, kind: 'radial', below: 0.2 }],
  prop: [3.7, 3],
  fin: [[-5.5, 1.1], [-7.6, 1.9], [-8.4, 3.4], [-9.0, 3.6], [-9.6, 3.2], [-9.6, 0.6]],
  tail: [[0, -7.3, -9.5], [4.6, -8.2, -9.3]], tailR: 0.5, tailUp: 0.5,
});

// Do 217: the "flying pencil" with a bulbous glazed cockpit, a shoulder wing, BMW 801 radials, twin square fins (17.3 x 19.0 x 4.97 m).
A['do-217'] = mp({
  cls: 'ww2-bomber', length: 17.3, span: 19.0, height: 4.97,
  body: [[8.65, 0.0, -0.5, 0.3], [8.2, 0.75, -0.75, 0.75], [7.4, 1.0, -0.85, 0.85], [6.4, 1.0, -0.85, 0.8], [5.2, 0.75, -0.8, 0.7], [-3, 0.65, -0.65, 0.6], [-7, 0.5, -0.3, 0.4], [-8.65, 0.4, 0.0, 0.15]],
  wing: [[0, 2.4, -1.2], [9.5, 0.8, -0.4]], tipR: 0.5, wingUp: 0.45, dihedral: 4,
  nacelles: [{ y: 2.9, x: 4.3, back: -2.5, r: 0.75, z: 0.45, kind: 'radial', below: 0.2 }],
  prop: [3.8, 3],
  fin: [[-7.0, -0.6], [-7.0, 1.55], [-7.2, 1.7], [-8.4, 1.7], [-8.6, 1.5], [-8.6, -0.6], [-8.4, -0.75], [-7.2, -0.75]], twin: 6.7,
  tail: [[0, -7.0, -8.6], [3.35, -7.2, -8.6]], tailUp: 0.5,
});

// SM.79 Sparviero: three radials (one in the nose), the "hunchback" fairing behind the cockpit, the ventral
// gondola, a low wing, a single fin (16.2 x 21.2 x 4.6 m).
A['sm-79'] = mp({
  cls: 'ww2-bomber', length: 16.2, span: 21.2, height: 4.6,
  body: [[8.1, -0.15, -0.95, 0.42], [7.7, 0.35, -1.05, 0.68], [7.1, 0.55, -1.05, 0.72], [6.4, 1.0, -1.05, 0.75], [5.0, 1.25, -1.05, 0.75], [3.6, 1.55, -1.05, 0.75], [1.6, 1.45, -1.05, 0.75], [0.6, 1.0, -1.0, 0.75], [-3, 0.85, -0.85, 0.65], [-8.1, 0.5, 0.1, 0.12]], round: 2.8,
  wing: [[0, 2.8, -1.6], [10.6, 0.9, -0.4]], tipR: 0.5, wingUp: -0.55, dihedral: 5,
  nacelles: [{ y: 3.4, x: 4.6, back: -1.6, r: 0.7, z: -0.55, kind: 'radial' }],
  noseProp: 8.2,
  prop: [3.2, 3],
  fin: [[-5.2, 0.85], [-6.6, 1.3], [-7.4, 2.6], [-8.0, 2.7], [-8.5, 2.3], [-8.3, 0.5]],
  tail: [[0, -6.4, -8.0], [3.2, -6.9, -7.9]], tailR: 0.4, tailUp: 0.5,
  extra: [{ top: [[2.2, -0.9], [-2.2, -0.9]], bottom: [[2.2, -1.0], [1.6, -1.45], [-1.6, -1.4], [-2.2, -1.0]], plan: [[2.2, 0.2], [1.6, 0.45], [-1.6, 0.4], [-2.2, 0.2]], round: 3, stations: 6 }],
});

// G4M "Betty": a fat cigar body with glazed nose and tail cone, a mid wing, radials, a single rounded fin (19.97 x 24.88 x 6.0 m).
A['g4m-betty'] = mp({
  cls: 'ww2-bomber', length: 19.97, span: 24.88, height: 6.0,
  body: [[9.99, 0.0, -0.4, 0.3], [9.5, 0.6, -0.85, 0.8], [8.5, 1.05, -1.1, 1.05], [7.3, 1.3, -1.1, 1.1], [5.5, 1.25, -1.1, 1.1], [-3, 1.1, -1.05, 1.05], [-7, 0.85, -0.55, 0.75], [-9.4, 0.6, 0.0, 0.4], [-9.99, 0.5, 0.15, 0.3]], round: 2.1,
  wing: [[0, 3.0, -1.9], [12.44, 0.6, -0.6]], tipR: 0.8, wingUp: 0, dihedral: 6,
  nacelles: [{ y: 3.2, x: 4.6, back: -2.0, r: 0.8, z: 0, kind: 'radial', below: 0.2 }],
  prop: [3.4, 3],
  fin: [[-5.8, 1.1], [-7.6, 1.6], [-8.6, 3.5], [-9.3, 3.65], [-9.9, 3.2], [-9.8, 0.5]],
  tail: [[0, -7.6, -9.6], [4.0, -8.4, -9.4]], tailR: 0.5, tailUp: 0.4,
});

// Mosquito: a slim wooden body, the tapered round-tipped wing, Merlins in nacelles running past the trailing edge,
// an elegant curved fin; the B Mk XVI's glazed nose (13.57 x 16.52 x 5.3 m), the FB Mk VI's solid gun nose (12.43 m).
function mosquito(nose: Row[], length: number, cls: string): Spec {
  return mp({
    cls, length, span: 16.52, height: 5.3,
    body: [...nose, [4.4, 1.05, -0.82, 0.68], [3.0, 1.0, -0.82, 0.68], [2.2, 0.8, -0.82, 0.68], [-2, 0.7, -0.7, 0.6], [-5, 0.5, -0.3, 0.4], [-6.3, 0.4, -0.05, 0.2], [-length / 2, 0.35, 0.05, 0.12]],
    wing: [[0, 2.4, -1.3], [8.26, 0.7, -0.3]], tipR: 0.7, wingUp: -0.05, dihedral: 3,
    nacelles: [{ y: 2.45, x: 3.9, back: -2.4, r: 0.6, z: -0.05, below: 0.15 }],
    prop: [3.7, 3],
    fin: [[-3.9, 0.65], [-5.4, 1.0], [-6.1, 2.2], [-6.5, 2.35], [-6.9, 2.1], [-6.8, 0.35]],
    tail: [[0, -5.2, -6.8], [3.0, -5.7, -6.6]], tailR: 0.5, tailUp: 0.3,
  });
}
A['mosquito'] = mosquito([[6.78, 0.0, -0.35, 0.15], [6.3, 0.45, -0.65, 0.5], [5.4, 0.75, -0.8, 0.65]], 13.57, 'ww2-bomber');
A['mosquito-fb'] = mosquito([[6.2, 0.05, -0.4, 0.22], [5.8, 0.55, -0.7, 0.55], [5.2, 0.8, -0.8, 0.66]], 12.43, 'ww2-heavy-fighter');

// Bf 110: a slim body under the long greenhouse, a low wing with square-cut tips, inline engines, twin fins on the
// tailplane's tips (C 12.3 x 16.27 x 3.3 m); the G's bigger rudders and blunter nose (12.07 m).
function bf110(length: number, finTop: number, finBack: number): Spec {
  const h = length / 2;
  return mp({
    cls: 'ww2-heavy-fighter', length, span: 16.27, height: finTop > 1.3 ? 4.13 : 3.3,
    body: [[h, 0.0, -0.35, 0.15], [h - 0.45, 0.4, -0.6, 0.5], [4.9, 0.6, -0.72, 0.6], [4.1, 1.0, -0.75, 0.62], [0.6, 0.95, -0.75, 0.62], [-0.4, 0.7, -0.72, 0.6], [-3.5, 0.55, -0.45, 0.45], [-6.15, 0.4, 0.0, 0.12]],
    wing: [[0, 2.0, -1.3], [8.14, 0.6, -0.5]], tipR: 0.3, wingUp: -0.45, dihedral: 6,
    nacelles: [{ y: 2.3, x: 3.4, back: -1.9, r: 0.55, z: -0.45, below: 0.15 }],
    prop: [3.1, 3],
    fin: [[-4.9, -0.5], [-5.0, finTop - 0.15], [-5.3, finTop], [finBack + 0.3, finTop], [finBack, finTop - 0.25], [finBack, -0.55], [finBack + 0.3, -0.75], [-5.2, -0.75]], twin: 4.9,
    tail: [[0, -4.8, -6.1], [2.45, -5.0, -6.0]], tailUp: 0.4,
  });
}
A['bf-110'] = bf110(12.3, 1.25, -6.2);
A['bf-110g'] = bf110(12.07, 1.5, -6.4);

// Me 410 Hornisse: the glazed cockpit at the front of a short nose, the remote barbettes bulging from the body's
// sides, inline engines in annular cowls, a single fin (12.48 x 16.35 x 4.28 m).
A['me-410'] = mp({
  cls: 'ww2-heavy-fighter', length: 12.48, span: 16.35, height: 4.28,
  body: [[6.24, -0.05, -0.6, 0.3], [5.9, 0.55, -0.75, 0.65], [5.1, 0.95, -0.8, 0.75], [3.9, 0.95, -0.8, 0.75], [3.0, 0.7, -0.8, 0.72], [-2, 0.65, -0.6, 0.6], [-4.8, 0.5, -0.25, 0.4], [-6.24, 0.4, 0.05, 0.12]],
  wing: [[0, 2.1, -1.4], [8.18, 0.4, -0.6]], tipR: 0.35, wingUp: -0.4, dihedral: 6,
  nacelles: [{ y: 2.3, x: 3.4, back: -2.3, r: 0.62, z: -0.4, kind: 'radial', below: 0.15 }],
  prop: [3.5, 3],
  fin: [[-4.0, 0.6], [-5.2, 0.9], [-5.8, 2.3], [-6.3, 2.4], [-6.6, 2.0], [-6.4, 0.4]],
  tail: [[0, -5.0, -6.4], [3.1, -5.5, -6.3]], tailR: 0.3, tailUp: 0.35,
  extra: [{ top: [[-0.6, 0.3], [-2.8, 0.2]], bottom: [[-0.6, -0.3], [-2.8, -0.2]], plan: [[-0.6, 0.05], [-1.2, 0.25], [-2.8, 0.05]], side: 0.7, round: 2, stations: 6 }],
});

// Hs 129B: a triangular-section body with a tiny armoured cockpit, Gnome-Rhone radials, a low wing, one fin (9.75 x 14.2 x 3.25 m).
A['hs-129'] = mp({
  cls: 'ww2-attack', length: 9.75, span: 14.2, height: 3.25,
  body: [[4.88, -0.1, -0.5, 0.3], [4.5, 0.4, -0.65, 0.55], [3.6, 0.7, -0.75, 0.6], [2.6, 0.75, -0.78, 0.6], [-1, 0.65, -0.75, 0.55], [-3.5, 0.45, -0.35, 0.35], [-4.88, 0.3, 0.0, 0.1]], round: [[4.8, 2.2], [3.5, 1.6], [-4.88, 2]],
  wing: [[0, 1.8, -1.2], [7.1, 0.4, -0.4]], tipR: 0.3, wingUp: -0.5, dihedral: 6,
  nacelles: [{ y: 1.95, x: 2.6, back: -1.8, r: 0.6, z: -0.5, kind: 'radial', below: 0.1 }],
  prop: [2.6, 3],
  fin: [[-3.0, 0.45], [-4.0, 0.7], [-4.5, 1.7], [-5.0, 1.75], [-5.1, 0.3]],
  tail: [[0, -3.9, -5.0], [2.3, -4.3, -4.9]], tailR: 0.3, tailUp: 0.3,
  extra: [dome(2.9, 0.72, 0.32, 0.9)],
});

// Fw 189: a fully glazed central nacelle, two booms carrying the Argus engines forward and the fins aft, the
// tailplane joining them (12.03 x 18.4 x 3.1 m).
A['fw-189'] = {
  ...mp({
    cls: 'ww2-recon', length: 12.03, span: 18.4, height: 3.1,
    body: [[4.2, 0.0, -0.45, 0.3], [3.8, 0.55, -0.6, 0.6], [2.8, 0.75, -0.7, 0.7], [0.5, 0.75, -0.7, 0.7], [-1.6, 0.55, -0.5, 0.5], [-2.6, 0.3, -0.2, 0.15]],
    wing: [[0, 1.9, -0.9], [2.0, 1.9, -0.9], [9.2, 0.6, -0.3]], tipR: 0.4, wingUp: 0,
    nacelles: [{ y: 1.8, x: 3.5, back: -5.4, r: 0.5, z: 0, below: 0.1 }],
    prop: [2.6, 2],
    fin: [[-4.6, -0.7], [-4.7, 1.2], [-5.0, 1.3], [-5.9, 1.3], [-6.0, 1.0], [-6.0, -0.6], [-5.6, -0.8]], twin: 3.6,
    tail: [[0, -4.7, -5.9], [1.8, -4.7, -5.9]], tailUp: 0.25,
  }),
};

// PBY Catalina: a boat hull with waist blisters, the parasol wing on its pylon, radials on the wing, a tall fin with
// the tailplane raised on it (19.47 x 31.7 x 6.15 m).
A['pby-catalina'] = mp({
  cls: 'flying-boat', length: 19.47, span: 31.7, height: 6.15,
  body: [[9.74, -0.4, -1.0, 0.35], [9.3, 0.3, -1.3, 0.8], [8.0, 0.75, -1.4, 1.0], [6.5, 0.95, -1.45, 1.05], [2, 1.0, -1.45, 1.05], [1.0, 0.95, -1.2, 1.0], [-4, 0.8, -0.6, 0.8], [-8, 0.5, 0.15, 0.4], [-9.74, 0.45, 0.35, 0.2]], round: 3,
  wing: [[0, 1.6, -2.2], [6, 1.6, -2.2], [15.85, 0.9, -0.9]], tipR: 0.5, wingUp: 2.6,
  nacelles: [{ y: 2.95, x: 3.4, back: -1.8, r: 0.68, z: 2.5, kind: 'radial' }],
  prop: [3.6, 3],
  fin: [[-5.0, 0.8], [-7.0, 1.6], [-8.6, 4.0], [-9.6, 4.1], [-9.9, 3.4], [-9.7, 0.5]],
  tail: [[0, -7.6, -9.4], [3.7, -8.2, -9.3]], tailR: 0.4, tailUp: 1.6,
  extra: [post(1.6, -2.6, 2.6, 0.8, 0.3), dome(-3.6, 0.55, 0.45, 1.6, 1, 0.9)],
});

// ---------------------------------------------------------------- early jets

// Me 262: a triangular-section body, the wing's leading edge swept, the Jumo pods slung under it, a fin with the
// tailplane partway up (10.6 x 12.6 x 3.5 m).
A['me-262'] = mp({
  cls: 'jet-fighter', length: 10.6, span: 12.6, height: 3.5,
  body: [[5.3, -0.1, -0.35, 0.15], [4.8, 0.3, -0.55, 0.5], [3.8, 0.5, -0.7, 0.65], [1.6, 0.85, -0.75, 0.7], [0.2, 0.85, -0.75, 0.7], [-0.8, 0.55, -0.75, 0.7], [-3.5, 0.45, -0.45, 0.45], [-5.3, 0.3, 0.0, 0.1]], round: [[5.3, 2.2], [3, 2.8], [-5.3, 3]],
  wing: [[0, 1.6, -1.2], [1.8, 1.5, -1.3], [6.3, 0.0, -0.7]], tipR: 0.25, wingUp: -0.55, dihedral: 6,
  nacelles: [{ y: 2.0, x: 2.5, back: -1.6, r: 0.45, z: -1.0, kind: 'jet' }],
  fin: [[-3.2, 0.4], [-4.2, 0.6], [-4.7, 1.6], [-5.2, 1.65], [-5.5, 1.2], [-5.4, 0.3]],
  tail: [[0, -4.1, -5.2], [2.2, -4.6, -5.1]], tailUp: 0.8,
});

// Ar 234B Blitz: a slim body with the fully glazed nose cockpit, a straight shoulder wing, two Jumo pods under it, one fin (12.64 x 14.41 x 4.29 m).
A['ar-234'] = mp({
  cls: 'jet-bomber', length: 12.64, span: 14.41, height: 4.29,
  body: [[6.32, -0.1, -0.4, 0.2], [6.0, 0.5, -0.55, 0.55], [5.4, 0.75, -0.65, 0.65], [4.4, 0.8, -0.7, 0.65], [0, 0.7, -0.7, 0.6], [-4, 0.5, -0.45, 0.4], [-6.32, 0.35, 0.0, 0.1]],
  wing: [[0, 1.6, -1.1], [7.2, 0.6, -0.3]], tipR: 0.3, wingUp: 0.55,
  nacelles: [{ y: 2.1, x: 2.6, back: -1.4, r: 0.48, z: -0.1, kind: 'jet' }],
  fin: [[-3.8, 0.5], [-5.0, 0.75], [-5.6, 2.1], [-6.1, 2.15], [-6.4, 1.7], [-6.3, 0.35]],
  tail: [[0, -4.9, -6.2], [2.4, -5.3, -6.1]], tailUp: 0.5,
});

// ---------------------------------------------------------------- single-engined pistons by variant

interface One extends Piston {
  /** The spine stays high from the canopy back to the fin (a razorback), instead of the cut-down deck. */
  razor?: boolean;
  /** Its own fin outline, (forward, up) from the fin's root on the fuselage. */
  finOutline?: P2[];
  bodies?: Outline[];
}

/** A single-engined piston aircraft from `piston`, with a razorback spine, its own fin and its own lumps. */
function one(p: One): Spec {
  const s = piston(p);
  const c = p.canopy;
  if (p.razor && s.fuselage) {
    const t = -p.length / 2;
    const top = s.fuselage.top.filter(([x]) => x >= c.x - c.length * 0.45);
    s.fuselage = { ...s.fuselage, top: [...top, [c.x - c.length * 0.55, p.h * 1.12], [t + p.length * 0.3, p.h * 0.85], [t + 0.3, p.h * 0.5], [t, p.h * 0.4]] };
  }
  if (p.finOutline) s.finPlan = p.finOutline;
  if (p.bodies) s.bodies = [...(s.bodies ?? []), ...p.bodies];
  return s;
}

/** A bulge on the body's side (gun breech covers, wing-root intakes), mirrored: from x0 back to x1, at height z. */
function bulge(x0: number, x1: number, z: number, half: number, out: number, side: number): Outline {
  const m = (x0 + x1) / 2;
  return { top: [[x0, z], [m, z + half], [x1, z]], bottom: [[x0, z], [m, z - half], [x1, z]], plan: [[x0, 0.02], [m, out], [x1, 0.02]], side, round: 2, stations: 6 };
}

/** A radiator or cooler under the body: front, back, its top, its deepest. */
function belly(x0: number, x1: number, top: number, deep: number, half: number): Outline {
  const a = x0 - (x0 - x1) * 0.2;
  const b = x0 - (x0 - x1) * 0.75;
  return { top: [[x0, top], [x1, top]], bottom: [[x0, top - (top - deep) * 0.5], [a, deep], [b, deep], [x1, top]], plan: [[x0, half * 0.8], [a, half], [b, half], [x1, half * 0.4]], round: 3, stations: 6 };
}

/** A fin with a dorsal fillet running forward along the spine: root chord, fillet length, height, tip chord (from the fin's root). */
function filletFin(length: number, root: number, fillet: number, height: number, tip: number): P2[] {
  const t = -length / 2;
  return [[t + root + fillet, 0], [t + root, height * 0.28], [t + tip + 0.15, height], [t + 0.15, height * 0.97], [t - 0.05, height * 0.6], [t + 0.05, 0]];
}

// Bf 109: a slim pointed nose, a narrow body, the framed canopy low, a short round-tipped wing (F 8.94 x 9.92 x 2.6 m);
// the G-6's "Beulen" over the cowl guns either side ahead of the windscreen (9.02 m); the K-4's tall fin and rudder,
// the clear Erla hood and faired bulges (8.95 m).
const BF109 = { cls: 'ww2-fighter', span: 9.92, height: 2.6, w: 0.48, h: 0.62, wing: 'round' as const, le: 1.3, root: 2.15, tip: 1.05, sweep: 3, fin: 1.25, finRoot: 1.3, roundFin: true, tailSpan: 3.0, tailRoot: 0.9, prop: 3.0, blades: 3 };
A['bf-109-f'] = one({ ...BF109, length: 8.94, canopy: { x: 0.6, length: 1.6, kind: 'framed' } });
A['bf-109-g6'] = one({ ...BF109, length: 9.02, canopy: { x: 0.6, length: 1.6, kind: 'framed' }, bodies: [bulge(2.75, 1.6, 0.35, 0.15, 0.16, 0.42)] });
A['bf-109-k4'] = one({ ...BF109, length: 8.95, fin: 1.5, finRoot: 1.45, canopy: { x: 0.6, length: 1.6, kind: 'bubble' }, bodies: [bulge(3.1, 1.2, 0.35, 0.13, 0.11, 0.42)] });

// Spitfire: the elliptic wing, a long thin nose, a rounded fin. Mk V: the short Merlin nose, three blades (9.12 x 11.23 x 3.02 m);
// Mk IX: the longer nose, four blades (9.47 x 11.23 x 3.86 m); Mk XIV: the long Griffon nose, five blades, the broad
// fin, the cut-down rear deck and teardrop hood (9.96 x 11.23 x 3.86 m).
const SPIT = { cls: 'ww2-fighter', span: 11.23, w: 0.5, h: 0.66, wing: 'elliptic' as const, le: 1.45, root: 2.6, tip: 0.3, fin: 1.35, finRoot: 1.3, roundFin: true, tailSpan: 3.3, tailRoot: 1.0 };
A['spitfire-mk-v'] = one({ ...SPIT, length: 9.12, height: 3.02, le: 1.2, canopy: { x: -0.3, length: 1.5, kind: 'framed' }, razor: true, prop: 3.25, blades: 3 });
A['spitfire-mk-ix'] = one({ ...SPIT, length: 9.47, height: 3.86, canopy: { x: -0.3, length: 1.5, kind: 'framed' }, razor: true, prop: 3.3, blades: 4 });
A['spitfire-mk-xiv'] = one({ ...SPIT, length: 9.96, height: 3.86, le: 1.6, fin: 1.6, finRoot: 1.5, canopy: { x: -0.4, length: 1.5, kind: 'bubble' }, prop: 3.15, blades: 5 });

// P-51 Mustang: the belly radiator scoop, a straight square-tipped laminar wing. B: the razorback and the framed
// (Malcolm) hood (9.83 x 11.28 x 4.16 m); D: the cut-down deck, the bubble and a dorsal fin fillet (9.83 x 11.28 x 4.08 m).
const P51 = { cls: 'ww2-fighter', length: 9.83, span: 11.28, w: 0.52, h: 0.72, wing: 'square' as const, le: 1.5, root: 2.75, tip: 1.2, sweep: 1, fin: 1.5, finRoot: 1.8, tailSpan: 4.1, tailRoot: 1.1, prop: 3.4, blades: 4, scoop: [-1.2, 2.2, 0.35] as [number, number, number] };
A['p-51b'] = one({ ...P51, height: 4.16, canopy: { x: -0.1, length: 1.5, kind: 'framed' }, razor: true });
A['p-51d-mustang'] = one({ ...P51, height: 4.08, canopy: { x: -0.1, length: 1.8, kind: 'bubble' }, finOutline: filletFin(9.83, 1.8, 1.1, 1.5, 0.75) });

// P-47 Thunderbolt: the huge round body and radial with the turbo duct under the cowl, a round-tipped wing; the
// razorback's spine runs to the fin, the D-25 on has the bubble (11.0 x 12.42 x 4.47 m).
const P47 = { cls: 'ww2-fighter', length: 11.0, span: 12.42, height: 4.47, w: 0.75, h: 0.95, radial: true, wing: 'round' as const, le: 1.8, root: 2.9, tip: 1.3, sweep: 2, fin: 1.6, finRoot: 1.8, roundFin: true, tailSpan: 4.6, tailRoot: 1.2, prop: 3.7, blades: 4, bodies: [belly(4.6, 2.4, -0.7, -1.2, 0.5)] };
A['p-47d'] = one({ ...P47, canopy: { x: 0.2, length: 1.8, kind: 'bubble' } });
A['p-47d-razorback'] = one({ ...P47, canopy: { x: 0.2, length: 1.6, kind: 'framed' }, razor: true });

// Ta 152H: the Fw 190 D's long annular nose and stretched tail on a very long, narrow wing (10.82 x 14.44 x 3.36 m).
A['ta-152h'] = one({ cls: 'ww2-fighter', length: 10.82, span: 14.44, height: 3.36, w: 0.6, h: 0.66, radial: true, wing: 'tapered', le: 1.4, root: 2.4, tip: 0.9, sweep: 3, fin: 1.4, finRoot: 1.6, roundFin: true, tailSpan: 3.65, tailRoot: 0.95, canopy: { x: -0.4, length: 1.8, kind: 'bubble' }, prop: 3.6, blades: 4 });

// ---------------------------------------------------------------- Soviet

// I-16: a stubby barrel with the big radial, a short tapered wing, a small round fin (6.13 x 9.0 x 3.25 m).
A['i-16'] = one({ cls: 'ww2-fighter', length: 6.13, span: 9.0, height: 3.25, w: 0.7, h: 0.7, radial: true, wing: 'tapered', le: 1.0, root: 2.3, tip: 1.3, sweep: 4, mount: -0.5, dihedral: 3, fin: 1.1, finRoot: 1.0, roundFin: true, tailSpan: 3.2, tailRoot: 0.9, canopy: { x: -0.3, length: 1.0, kind: 'framed' }, prop: 2.8, blades: 2 });
// LaGG-3: a slim inline with the radiator under the wing centre and the razorback (8.81 x 9.8 x 2.54 m).
A['lagg-3'] = one({ cls: 'ww2-fighter', length: 8.81, span: 9.8, height: 2.54, w: 0.5, h: 0.62, wing: 'round', le: 1.5, root: 2.4, tip: 1.1, sweep: 4, dihedral: 6, fin: 1.25, finRoot: 1.3, roundFin: true, tailSpan: 3.6, tailRoot: 1.0, canopy: { x: -0.3, length: 1.6, kind: 'framed' }, razor: true, prop: 3.0, blades: 3, scoop: [-0.6, 1.6, 0.3] });
// La-5FN: the radial with the intake on top of the cowl and the oil cooler under it (8.67 x 9.8 x 2.54 m); La-7: no top
// intake, the oil cooler moved under the rear body, a cleaner cowl (8.6 m); La-11: the La-7 with a bigger fin, the
// cooler back in the cowl lip (8.62 x 9.8 x 3.47 m).
const LA = { cls: 'ww2-fighter', span: 9.8, w: 0.62, h: 0.68, radial: true, wing: 'round' as const, le: 1.6, root: 2.5, tip: 1.1, sweep: 4, dihedral: 5, fin: 1.2, finRoot: 1.3, roundFin: true, tailSpan: 3.6, tailRoot: 1.0, prop: 3.1, blades: 3 };
A['la-5'] = one({ ...LA, length: 8.67, height: 2.54, canopy: { x: -0.4, length: 1.5, kind: 'framed' }, bodies: [{ top: [[3.7, 0.55], [3.3, 0.86], [2.5, 0.8], [2.2, 0.55]], bottom: [[3.7, 0.4], [2.2, 0.4]], plan: [[3.7, 0.12], [3.3, 0.22], [2.2, 0.15]], round: 2.4, stations: 6 }, belly(3.6, 2.2, -0.5, -0.88, 0.32)] });
A['la-7'] = one({ ...LA, length: 8.6, height: 2.54, canopy: { x: -0.4, length: 1.5, kind: 'bubble' }, scoop: [-1.2, 1.3, 0.25] });
A['la-11'] = one({ ...LA, length: 8.62, height: 3.47, fin: 1.4, finRoot: 1.45, canopy: { x: -0.4, length: 1.5, kind: 'bubble' }, bodies: [belly(3.9, 3.0, -0.55, -0.78, 0.28)] });
// MiG-3: a long inline nose with the cockpit far back, the radiator under it, a razorback (8.25 x 10.2 x 3.5 m).
A['mig-3'] = one({ cls: 'ww2-fighter', length: 8.25, span: 10.2, height: 3.5, w: 0.5, h: 0.62, wing: 'tapered', le: 1.2, root: 2.5, tip: 1.0, sweep: 5, dihedral: 6, fin: 1.25, finRoot: 1.3, roundFin: true, tailSpan: 3.8, tailRoot: 0.9, canopy: { x: -0.9, length: 1.4, kind: 'framed' }, razor: true, prop: 3.0, blades: 3, scoop: [-0.6, 1.4, 0.3] });
// Yak fighters: inlines with the radiator under the wing centre. Yak-1: the razorback (8.48 x 10.0 x 2.64 m); Yak-1b: the
// cut-down deck and bubble; Yak-7B: the razorback with the longer canopy (2.75 m); Yak-9: the cut-down deck, the chin
// oil cooler (8.55 x 9.74 x 3.0 m); Yak-3: smaller (9.2 m span), the oil coolers in the wing roots, the radiator further back.
const YAK = { cls: 'ww2-fighter', w: 0.5, h: 0.6, wing: 'tapered' as const, le: 1.4, root: 2.4, tip: 1.1, sweep: 4, dihedral: 6, fin: 1.2, finRoot: 1.2, roundFin: true, tailSpan: 3.6, tailRoot: 0.95, prop: 3.0, blades: 3 };
A['yak-1'] = one({ ...YAK, length: 8.48, span: 10.0, height: 2.64, canopy: { x: -0.2, length: 1.5, kind: 'framed' }, razor: true, scoop: [-0.2, 1.4, 0.28] });
A['yak-1b'] = one({ ...YAK, length: 8.48, span: 10.0, height: 2.64, canopy: { x: -0.2, length: 1.5, kind: 'bubble' }, scoop: [-0.2, 1.4, 0.28] });
A['yak-7b'] = one({ ...YAK, length: 8.48, span: 10.0, height: 2.75, canopy: { x: -0.4, length: 2.0, kind: 'framed' }, razor: true, scoop: [-0.2, 1.4, 0.28] });
A['yak-9'] = one({ ...YAK, length: 8.55, span: 9.74, height: 3.0, root: 2.3, tip: 1.0, canopy: { x: -0.3, length: 1.5, kind: 'bubble' }, scoop: [-0.4, 1.5, 0.28], bodies: [belly(3.7, 2.8, -0.3, -0.68, 0.22)] });
A['yak-3'] = one({ ...YAK, length: 8.5, span: 9.2, height: 2.39, le: 1.3, root: 2.2, tip: 0.95, canopy: { x: -0.3, length: 1.3, kind: 'bubble' }, scoop: [-0.9, 1.2, 0.25], bodies: [bulge(1.5, 0.7, -0.35, 0.12, 0.14, 0.5)] });
// Il-10: the Il-2's successor, cleaner, the long two-seat canopy and a tapered wing (11.12 x 13.4 x 4.18 m).
A['il-10'] = one({ cls: 'ww2-attack', length: 11.12, span: 13.4, height: 4.18, w: 0.62, h: 0.8, wing: 'tapered', le: 1.6, root: 3.0, tip: 1.2, sweep: 8, fin: 1.5, finRoot: 1.6, roundFin: true, tailSpan: 4.6, tailRoot: 1.2, canopy: { x: 0.2, length: 2.6, kind: 'framed' }, razor: true, prop: 3.6, blades: 4, scoop: [0.0, 1.4, 0.2] });
// Yak-52: a radial trainer with two seats under one long canopy, a straight wing (7.75 x 9.3 x 2.7 m).
A['yak-52'] = one({ cls: 'trainer', length: 7.75, span: 9.3, height: 2.7, w: 0.5, h: 0.6, radial: true, wing: 'tapered', le: 1.2, root: 2.0, tip: 1.0, sweep: 2, dihedral: 2, fin: 1.3, finRoot: 1.0, tailSpan: 3.2, tailRoot: 0.9, canopy: { x: 0.0, length: 2.4, kind: 'tandem' }, prop: 2.4, blades: 2 });

// ---------------------------------------------------------------- American

// P-40E: the big chin radiator under the nose, a razorback, a round-tipped wing (9.66 x 11.38 x 3.76 m).
A['p-40e'] = one({ cls: 'ww2-fighter', length: 9.66, span: 11.38, height: 3.76, w: 0.52, h: 0.68, wing: 'round', le: 1.5, root: 2.6, tip: 1.2, sweep: 3, dihedral: 6, fin: 1.4, finRoot: 1.5, roundFin: true, tailSpan: 4.0, tailRoot: 1.1, canopy: { x: -0.5, length: 1.5, kind: 'framed' }, razor: true, prop: 3.4, blades: 3, bodies: [belly(4.5, 2.2, -0.4, -1.05, 0.45)] });
// P-39 Airacobra: the cockpit well forward with car doors, the engine behind it fed from a dorsal intake (9.2 x 10.36 x 3.79 m).
A['p-39'] = one({ cls: 'ww2-fighter', length: 9.2, span: 10.36, height: 3.79, w: 0.52, h: 0.68, wing: 'tapered', le: 1.2, root: 2.5, tip: 1.1, sweep: 3, fin: 1.6, finRoot: 1.6, roundFin: true, tailSpan: 4.0, tailRoot: 1.1, canopy: { x: 1.4, length: 1.5, kind: 'framed' }, razor: true, prop: 3.2, blades: 3, bodies: [{ top: [[0.5, 0.7], [0.1, 0.98], [-0.8, 0.85], [-1.3, 0.6]], bottom: [[0.5, 0.5], [-1.3, 0.5]], plan: [[0.5, 0.1], [0.1, 0.22], [-1.3, 0.14]], round: 2.4, stations: 6 }] });
// F6F Hellcat: a deep body behind the big radial, the cockpit on a hump, a square-tipped low wing, a big fin (10.24 x 13.06 x 3.99 m).
A['f6f-hellcat'] = one({ cls: 'ww2-fighter', length: 10.24, span: 13.06, height: 3.99, w: 0.7, h: 0.9, radial: true, wing: 'square', le: 1.8, root: 3.1, tip: 1.6, sweep: 3, mount: -0.7, dihedral: 5, fin: 1.8, finRoot: 1.9, roundFin: true, tailSpan: 5.0, tailRoot: 1.3, canopy: { x: 0.4, length: 1.6, kind: 'framed' }, razor: true, prop: 4.0, blades: 3, bodies: [belly(4.7, 3.4, -0.6, -1.05, 0.38)] });
// SBD Dauntless: a radial dive bomber with the long two-seat greenhouse, a round-tipped wing (10.09 x 12.66 x 4.14 m).
A['sbd-dauntless'] = one({ cls: 'ww2-attack', length: 10.09, span: 12.66, height: 4.14, w: 0.6, h: 0.75, radial: true, wing: 'round', le: 1.9, root: 3.2, tip: 1.4, sweep: 5, dihedral: 6, fin: 1.6, finRoot: 1.6, roundFin: true, tailSpan: 4.6, tailRoot: 1.3, canopy: { x: 0.0, length: 3.0, kind: 'framed' }, razor: true, prop: 3.6, blades: 3 });
// A-1 Skyraider: a big radial, the bubble, a long straight-tapered wing, a tall straight-edged fin (11.84 x 15.25 x 4.78 m).
A['a-1-skyraider'] = one({ cls: 'attack', length: 11.84, span: 15.25, height: 4.78, w: 0.7, h: 0.85, radial: true, wing: 'tapered', le: 1.8, root: 3.4, tip: 1.4, sweep: 3, dihedral: 6, fin: 2.1, finRoot: 2.2, tailSpan: 5.6, tailRoot: 1.4, canopy: { x: 0.8, length: 1.8, kind: 'bubble' }, prop: 4.1, blades: 4 });

// ---------------------------------------------------------------- British, Italian, Romanian, Japanese

// Hurricane: a deep humpbacked body, the radiator under the wing centre, a thick round-tipped wing (9.84 x 12.19 x 4.0 m).
A['hurricane'] = one({ cls: 'ww2-fighter', length: 9.84, span: 12.19, height: 4.0, w: 0.55, h: 0.78, wing: 'round', le: 1.6, root: 2.9, tip: 1.3, sweep: 3, dihedral: 4, fin: 1.45, finRoot: 1.5, roundFin: true, tailSpan: 3.9, tailRoot: 1.1, canopy: { x: -0.2, length: 1.6, kind: 'framed' }, razor: true, prop: 3.4, blades: 3, scoop: [0.0, 1.8, 0.35] });
// Typhoon: the deep "beard" radiator under the nose, a thick wing, the bubble hood (9.73 x 12.67 x 4.66 m).
A['typhoon'] = one({ cls: 'ww2-fighter', length: 9.73, span: 12.67, height: 4.66, w: 0.6, h: 0.78, wing: 'tapered', le: 1.7, root: 3.1, tip: 1.4, sweep: 3, dihedral: 5, fin: 1.6, finRoot: 1.5, roundFin: true, tailSpan: 4.4, tailRoot: 1.2, canopy: { x: 0.0, length: 1.6, kind: 'bubble' }, prop: 4.1, blades: 4, bodies: [belly(4.6, 2.4, -0.45, -1.25, 0.5)] });
// Tempest V: the Typhoon's chin radiator, a thin near-elliptic wing, a longer nose and a dorsal fin fillet (10.26 x 12.5 x 4.9 m).
A['tempest-v'] = one({ cls: 'ww2-fighter', length: 10.26, span: 12.5, height: 4.9, w: 0.6, h: 0.78, wing: 'elliptic', le: 1.7, root: 2.9, tip: 0.5, fin: 1.75, finRoot: 1.8, tailSpan: 4.6, tailRoot: 1.2, canopy: { x: -0.3, length: 1.6, kind: 'bubble' }, prop: 4.3, blades: 4, finOutline: filletFin(10.26, 1.8, 1.0, 1.75, 0.8), bodies: [belly(4.8, 3.2, -0.45, -1.05, 0.42)] });
// MC.202 Folgore: a slim inline, the radiator under the body, a razorback (8.85 x 10.58 x 3.49 m).
A['mc-202'] = one({ cls: 'ww2-fighter', length: 8.85, span: 10.58, height: 3.49, w: 0.48, h: 0.62, wing: 'round', le: 1.4, root: 2.3, tip: 1.1, sweep: 3, fin: 1.3, finRoot: 1.3, roundFin: true, tailSpan: 3.2, tailRoot: 0.9, canopy: { x: -0.3, length: 1.4, kind: 'framed' }, razor: true, prop: 3.05, blades: 3, scoop: [0.0, 1.2, 0.3] });
// IAR 80: a long radial fighter with the cockpit set well back (8.97 x 10.5 x 3.6 m).
A['iar-80'] = one({ cls: 'ww2-fighter', length: 8.97, span: 10.5, height: 3.6, w: 0.6, h: 0.7, radial: true, wing: 'round', le: 1.5, root: 2.4, tip: 1.1, sweep: 3, fin: 1.3, finRoot: 1.4, roundFin: true, tailSpan: 3.6, tailRoot: 1.0, canopy: { x: -1.0, length: 1.6, kind: 'bubble' }, prop: 3.0, blades: 3 });
// D3A "Val": an elliptic wing, fixed spatted gear, the long greenhouse, a long dorsal fillet (10.2 x 14.37 x 3.85 m).
A['d3a-val'] = one({ cls: 'ww2-attack', length: 10.2, span: 14.37, height: 3.85, w: 0.62, h: 0.75, radial: true, wing: 'elliptic', le: 2.0, root: 3.0, tip: 0.6, dihedral: 6, fin: 1.6, finRoot: 1.7, tailSpan: 4.8, tailRoot: 1.2, canopy: { x: 0.2, length: 3.2, kind: 'framed' }, prop: 3.2, blades: 3, gear: true, finOutline: filletFin(10.2, 1.7, 1.8, 1.6, 0.8) });
// B5N "Kate": a long three-seat greenhouse, a low tapered wing, retracted gear (10.3 x 15.52 x 3.7 m).
A['b5n-kate'] = one({ cls: 'ww2-attack', length: 10.3, span: 15.52, height: 3.7, w: 0.62, h: 0.75, radial: true, wing: 'tapered', le: 2.0, root: 3.2, tip: 1.2, sweep: 4, dihedral: 6, fin: 1.6, finRoot: 1.8, roundFin: true, tailSpan: 5.0, tailRoot: 1.3, canopy: { x: -0.4, length: 3.8, kind: 'framed' }, razor: true, prop: 3.4, blades: 3 });
// Ki-84 Hayate: a slim radial fighter, the canopy over a cut-down deck, four blades (9.92 x 11.24 x 3.39 m).
A['ki-84'] = one({ cls: 'ww2-fighter', length: 9.92, span: 11.24, height: 3.39, w: 0.6, h: 0.68, radial: true, wing: 'tapered', le: 1.6, root: 2.4, tip: 1.1, sweep: 4, fin: 1.35, finRoot: 1.4, tailSpan: 3.8, tailRoot: 1.0, canopy: { x: -0.4, length: 1.6, kind: 'bubble' }, prop: 3.1, blades: 4 });

// F-80C Shooting Star: a straight-wing jet with wing-root intakes and tip tanks (10.49 x 11.81 x 3.43 m).
A['f-80c'] = jet({ cls: 'jet-fighter', length: 10.49, span: 11.81, height: 3.43, w: 0.65, h: 0.75, intake: 'root', wingPlan: [[1.4, 0], [1.4, 0.7], [0.9, 5.9], [-0.6, 5.9], [-1.6, 0.7], [-1.6, 0]], mount: -0.4, dihedral: 4, fin: [[-2.6, 0], [-4.8, 0], [-5.4, 1.9], [-4.4, 1.9]], tail: [[-3.9, 0], [-4.3, 1.85], [-5.1, 1.85], [-5.2, 0]], planeUp: 0.2, canopy: { x: 1.6, length: 1.6, kind: 'bubble' }, tipTanks: [2.9, 0.33] });

// ---------------------------------------------------------------- First World War

/** A wing as a thin body (a biplane's upper or a triplane's middle wing): its half planform, at height z. */
function wingBody(rows: Edge[], z: number, tipR = 0, thick = 0.12): Outline {
  const poly = planOf(rows, tipR);
  const xs0 = poly.map((p) => p[0]);
  const x0 = Math.min(...xs0);
  const x1 = Math.max(...xs0);
  const top: P2[] = [];
  const bottom: P2[] = [];
  const plan: P2[] = [];
  for (let i = 0; i <= 16; i++) {
    const xi = x1 - ((x1 - x0) * i) / 16;
    const x = Math.min(x1 - 1e-6, Math.max(x0 + 1e-6, xi));
    let y = 0;
    for (let j = 0; j < poly.length; j++) {
      const [ax, ay] = poly[j];
      const [bx, by] = poly[(j + 1) % poly.length];
      if ((ax - x) * (bx - x) <= 0 && ax !== bx) y = Math.max(y, ay + ((by - ay) * (x - ax)) / (bx - ax));
    }
    top.push([xi, z + thick / 2]);
    bottom.push([xi, z - thick / 2]);
    plan.push([xi, Math.max(0.02, y)]);
  }
  return { top, bottom, plan, round: 12, stations: 2 };
}

interface WW1 {
  cls?: string;
  length: number;
  span: number;
  height: number;
  /** Lower wing span and chord (a sesquiplane's narrow lower wing), default the upper's. */
  lower?: number;
  lowerChord?: number;
  chord: number;
  /** Height between the wings' mid-planes, and how far the upper wing's leading edge stands ahead of the lower's (negative: behind). */
  gap: number;
  stagger?: number;
  /** Rotary: a round cowl; inline: a pointed nose with the engine's top showing; radiator: a blunt flat radiator face. */
  engine: 'rotary' | 'inline' | 'radiator';
  /** comma: an all-moving balanced rudder with no fin (Fokker, Nieuport); round, tri (a triangular fin), spad (a D-shaped rudder). */
  rudder: 'round' | 'comma' | 'tri' | 'spad';
  crew?: number;
  bays?: number;
  layout?: 'bi' | 'tri' | 'parasol' | 'mono';
  /** Fuselage depth (default 0.95) and its half-width (default 0.4). */
  depth?: number;
  half?: number;
  /** The lower wing's leading edge, forward of the middle (default from the length). */
  wingX?: number;
  /** The upper wing's middle span on a triplane. */
  middle?: number;
  prop?: number;
  blades?: number;
  dihedral?: number;
  /** A humped cowl over the guns ahead of the cockpit (Camel). */
  hump?: boolean;
  /** The body fills the gap between the wings (Roland "Walfisch"); or hangs between them, the lower wing under it on struts (Bristol Fighter). */
  deep?: boolean;
  midBody?: boolean;
  /** The gear retracted (I-153), or the wheels in spats. */
  retract?: boolean;
  spats?: boolean;
}

/** A WWI tractor biplane, triplane, parasol or monoplane from its outlines. */
function ww1(o: WW1): Spec {
  const L = o.length;
  const h = L / 2;
  const d = o.depth ?? 0.95;
  const wd = o.half ?? 0.4;
  const t = -h;
  const c = h - L * (o.crew && o.crew > 1 ? 0.33 : 0.4);
  const nose: Row[] =
    o.engine === 'rotary' ? [[h, 0.3, -0.3, 0.3], [h - 0.12, 0.44, -0.44, 0.44], [h - 0.6, d / 2, -d / 2, wd]]
    : o.engine === 'inline' ? [[h, 0.1, -0.1, 0.1], [h - 0.3, 0.32, -0.36, 0.3], [h - 0.9, d / 2, -d / 2, wd]]
    : [[h, 0.4, -0.4, 0.34], [h - 0.1, 0.44, -0.44, 0.36], [h - 0.9, d / 2, -d / 2, wd]];
  const hump: Row[] = o.hump ? [[c + 1.1, d / 2 + 0.1, -d / 2, wd], [c + 0.45, d / 2 + 0.16, -d / 2, wd]] : [];
  const deepB = o.deep ? 0.35 : 0;
  const body: Row[] = [...nose, ...hump, [c + 0.3, d / 2 + deepB, -d / 2 - deepB, wd], [c - (o.crew && o.crew > 1 ? 1.4 : 0.5), d / 2 + deepB * 0.8, -d / 2 - deepB * 0.8, wd * 0.95], [t + 1.6, d * 0.3, -d * 0.2, wd * 0.42], [t + 0.35, d * 0.16, -0.02, 0.06]];
  const lc = o.lowerChord ?? o.chord;
  const lx = o.wingX ?? h - L * 0.27;
  const ux = lx + (o.stagger ?? 0.3);
  const us = o.span / 2;
  const ls = (o.lower ?? o.span) / 2;
  const lz = o.midBody ? -d / 2 - 0.35 : -d / 2 + 0.06;
  const uz = lz + o.gap;
  const layout = o.layout ?? 'bi';
  const upperRows: Edge[] = [[0, ux, ux - o.chord], [us, ux, ux - o.chord]];
  const lowerRows: Edge[] = [[0, lx, lx - lc], [ls, lx, lx - lc]];
  const extra: Outline[] = [dome(c, d / 2 + deepB, 0.2, 0.36)];
  if (o.crew && o.crew > 1) extra.push(dome(c - 1.05, d / 2 + deepB * 0.8, 0.22, 0.5));
  // The upper (or middle) wings as bodies, and the struts between them, raked with the stagger.
  const strut = (x: number, y: number, z0: number, z1: number, rake: number) => post(x + 0.04, x - 0.04, z1, z0, 0.03, y, rake);
  if (layout === 'bi' || layout === 'tri') {
    extra.push(wingBody(upperRows, uz, o.chord * 0.3));
    if (layout === 'tri') {
      const ms = (o.middle ?? (us + ls) / 2) ;
      const mx = (lx + ux) / 2;
      extra.push(wingBody([[0, mx, mx - o.chord], [ms, mx, mx - o.chord]], (lz + uz) / 2, o.chord * 0.3));
    }
    const bays = o.bays ?? 1;
    const at = bays === 2 ? [0.36, 0.72] : [0.62];
    for (const f of at) for (const k of [0.2, 0.75]) extra.push(strut(ux - o.chord * k, Math.min(ls, us) * f / Math.min(1, ls / us), lz, uz, o.stagger ?? 0.3));
    for (const k of [0.25, 0.7]) extra.push(strut(ux - o.chord * k, 0.32, d / 2, uz, 0.15));
  }
  if (layout === 'parasol') for (const k of [0.25, 0.7]) extra.push(strut(ux - o.chord * k, 0.35, d / 2, uz, 0.1));
  if (layout === 'mono') extra.push(post(lx - lc * 0.3, lx - lc * 0.4, d / 2 + 0.75, d / 2, 0.04));
  // Fixed wheels on V legs, and the axle.
  const wx = lx + 0.25;
  const ground = -d / 2 - Math.max(0.85, o.height * 0.32);
  const wr = o.crew && o.crew > 1 ? 0.38 : 0.32;
  if (!o.retract) extra.push(...wheel(wx, 0.8, -d / 2, ground, wr, o.spats), { top: [[wx + 0.05, ground + wr + 0.03], [wx - 0.05, ground + wr + 0.03]], bottom: [[wx + 0.05, ground + wr - 0.03], [wx - 0.05, ground + wr - 0.03]], plan: [[wx + 0.05, 0.85], [wx - 0.05, 0.85]], round: 2, stations: 2 });
  // The tail: fin and rudder by kind, the tailplane on the top longeron.
  const z0 = d * 0.16;
  const fh = Math.min(1.35, o.height * 0.36);
  const fin: P2[] =
    o.rudder === 'comma' ? [[t + 0.45, z0 - 0.35], [t, z0 - 0.15], [t, z0 + fh * 0.55], [t + 0.15, z0 + fh * 0.92], [t + 0.45, z0 + fh], [t + 0.7, z0 + fh * 0.85], [t + 0.55, z0 + 0.15]]
    : o.rudder === 'tri' ? [[t + 1.2, z0], [t, z0 - 0.2], [t - 0.05, z0 + fh * 0.75], [t + 0.2, z0 + fh], [t + 0.55, z0 + fh * 0.95]]
    : o.rudder === 'spad' ? [[t + 0.9, z0], [t, z0 - 0.25], [t, z0 + fh * 0.8], [t + 0.25, z0 + fh], [t + 0.65, z0 + fh * 0.9], [t + 0.9, z0 + 0.35]]
    : [[t + 1.0, z0], [t + 0.05, z0 - 0.15], [t, z0 + fh * 0.6], [t + 0.15, z0 + fh * 0.95], [t + 0.45, z0 + fh], [t + 0.75, z0 + fh * 0.8], [t + 1.0, z0 + 0.25]];
  const ts = Math.max(1.2, o.span * 0.17);
  const main = layout === 'parasol' ? { rows: upperRows, z: uz } : layout === 'mono' ? { rows: upperRows, z: 0.05 } : { rows: lowerRows, z: lz };
  return mp({
    cls: o.cls ?? 'biplane', length: L, span: o.span, height: o.height,
    body, round: [[h, o.engine === 'rotary' ? 2.2 : 3], [h - 0.7, 4], [t, 4]],
    wing: main.rows, tipR: (main.rows === lowerRows ? lc : o.chord) * 0.3, wingUp: main.z, dihedral: o.dihedral ?? (layout === 'bi' || layout === 'tri' ? 2.5 : 1),
    nose: true,
    prop: [o.prop ?? Math.min(2.9, o.span * 0.3), o.blades ?? 2],
    fin,
    tail: [[0, t + 1.45, t + 0.35], [ts, t + 1.1, t + 0.45]], tailR: 0.35, tailUp: z0 - 0.03,
    extra,
  });
}

// Fighters. Spans are the upper wing's; a sesquiplane's lower wing is narrower and shorter.
A['sopwith-camel'] = ww1({ length: 5.72, span: 8.53, height: 2.59, chord: 1.37, gap: 1.5, stagger: 0.45, engine: 'rotary', rudder: 'round', hump: true, dihedral: 5 });
A['sopwith-pup'] = ww1({ length: 5.89, span: 8.08, height: 2.87, chord: 1.55, gap: 1.55, stagger: 0.5, engine: 'rotary', rudder: 'round' });
A['sopwith-snipe'] = ww1({ length: 6.04, span: 9.17, height: 2.67, chord: 1.5, gap: 1.5, stagger: 0.4, engine: 'rotary', rudder: 'round', bays: 2, depth: 1.05, half: 0.45 });
A['sopwith-dolphin'] = ww1({ length: 6.78, span: 9.91, height: 2.59, chord: 1.4, gap: 1.35, stagger: -0.35, engine: 'radiator', rudder: 'round', bays: 2, depth: 1.05 });
A['sopwith-triplane'] = ww1({ length: 5.74, span: 8.08, height: 3.2, chord: 0.99, gap: 1.9, stagger: 0.45, engine: 'rotary', rudder: 'round', layout: 'tri', middle: 4.04 });
A['sopwith-strutter'] = ww1({ cls: 'biplane-two-seat', length: 7.7, span: 10.21, height: 3.12, chord: 1.6, gap: 1.6, stagger: 0.4, engine: 'rotary', rudder: 'round', crew: 2, bays: 2 });
A['se-5a'] = ww1({ length: 6.38, span: 8.11, height: 2.89, chord: 1.52, gap: 1.6, stagger: 0.45, engine: 'radiator', rudder: 'round', bays: 2, depth: 1.05 });
A['spad-7'] = ww1({ length: 6.08, span: 7.82, height: 2.2, chord: 1.4, gap: 1.35, stagger: 0.35, engine: 'radiator', rudder: 'spad', bays: 2, depth: 1.0 });
A['spad-13'] = ww1({ length: 6.25, span: 8.25, height: 2.6, chord: 1.5, gap: 1.4, stagger: 0.35, engine: 'radiator', rudder: 'spad', bays: 2, depth: 1.05, half: 0.45 });
A['nieuport-17'] = ww1({ length: 5.8, span: 8.16, height: 2.4, lower: 7.8, lowerChord: 0.75, chord: 1.2, gap: 1.3, stagger: 0.5, engine: 'rotary', rudder: 'comma' });
A['nieuport-28'] = ww1({ length: 6.2, span: 8.15, height: 2.48, lower: 7.8, lowerChord: 1.0, chord: 1.2, gap: 1.3, stagger: 0.4, engine: 'rotary', rudder: 'comma', bays: 2, depth: 0.9, half: 0.36 });
A['hanriot-hd1'] = ww1({ length: 5.85, span: 8.7, height: 2.94, lower: 7.8, chord: 1.25, gap: 1.45, stagger: 0.4, engine: 'rotary', rudder: 'round' });
A['albatros-d3'] = ww1({ length: 7.33, span: 9.05, height: 2.98, lower: 8.73, lowerChord: 1.0, chord: 1.7, gap: 1.35, stagger: 0.55, engine: 'inline', rudder: 'round', depth: 1.05 });
A['albatros-d5'] = ww1({ length: 7.33, span: 9.05, height: 2.7, lower: 8.73, lowerChord: 1.0, chord: 1.7, gap: 1.3, stagger: 0.55, engine: 'inline', rudder: 'tri', depth: 1.1, half: 0.44 });
A['pfalz-d3'] = ww1({ length: 6.95, span: 9.4, height: 2.67, lower: 8.6, lowerChord: 1.1, chord: 1.65, gap: 1.35, stagger: 0.5, engine: 'inline', rudder: 'round', depth: 1.05 });
A['pfalz-d12'] = ww1({ length: 6.35, span: 9.0, height: 2.7, chord: 1.5, gap: 1.45, stagger: 0.4, engine: 'radiator', rudder: 'round', bays: 2, depth: 1.05 });
A['halberstadt-d2'] = ww1({ length: 7.3, span: 8.8, height: 2.66, chord: 1.5, gap: 1.45, stagger: 0.2, engine: 'inline', rudder: 'comma', bays: 2, depth: 0.95 });
A['fokker-d7'] = ww1({ length: 6.95, span: 8.9, height: 2.75, lower: 7.0, lowerChord: 1.45, chord: 1.65, gap: 1.35, stagger: 0.55, engine: 'radiator', rudder: 'tri', depth: 1.05, half: 0.42 });
A['fokker-dr1'] = ww1({ length: 5.77, span: 7.19, height: 2.95, lower: 5.73, chord: 1.0, gap: 1.75, stagger: 0.3, engine: 'rotary', rudder: 'comma', layout: 'tri', middle: 3.12 });
A['fokker-d8'] = ww1({ length: 5.86, span: 8.4, height: 2.6, chord: 1.55, gap: 1.05, stagger: 0.2, engine: 'rotary', rudder: 'comma', layout: 'parasol' });
A['fokker-e3'] = ww1({ length: 7.3, span: 9.52, height: 2.4, chord: 1.8, gap: 0, stagger: 0, engine: 'rotary', rudder: 'comma', layout: 'mono', wingX: 2.0 });
A['ssw-d4'] = ww1({ length: 5.7, span: 8.35, height: 2.72, chord: 1.0, gap: 1.25, stagger: 0.25, engine: 'rotary', rudder: 'comma', bays: 2, depth: 1.05, half: 0.5, blades: 4, prop: 3.3 });

// Two-seaters: the gunner's cockpit behind the pilot's.
A['airco-dh4'] = ww1({ cls: 'biplane-two-seat', length: 9.35, span: 12.92, height: 3.35, chord: 1.7, gap: 1.75, stagger: 0.4, engine: 'inline', rudder: 'round', crew: 2, bays: 2, depth: 1.15, half: 0.45, prop: 3.0 });
A['breguet-14'] = ww1({ cls: 'biplane-two-seat', length: 8.87, span: 14.36, height: 3.3, chord: 1.9, gap: 1.75, stagger: 0.3, engine: 'radiator', rudder: 'round', crew: 2, bays: 2, depth: 1.2, half: 0.48, prop: 3.0 });
A['bristol-f2b'] = ww1({ cls: 'biplane-two-seat', length: 7.87, span: 11.96, height: 2.97, chord: 1.68, gap: 1.6, stagger: 0.4, engine: 'radiator', rudder: 'round', crew: 2, bays: 2, midBody: true });
A['dfw-c5'] = ww1({ cls: 'biplane-two-seat', length: 7.88, span: 13.27, height: 3.25, lower: 12.4, chord: 1.75, gap: 1.75, stagger: 0.4, engine: 'inline', rudder: 'round', crew: 2, bays: 2, depth: 1.15, prop: 2.9 });
A['re-8'] = ww1({ cls: 'biplane-two-seat', length: 7.85, span: 12.98, height: 3.47, lower: 10.8, chord: 1.7, gap: 1.75, stagger: 0.4, engine: 'inline', rudder: 'round', crew: 2, bays: 2, depth: 1.05, prop: 3.0 });
A['roland-c2'] = ww1({ cls: 'biplane-two-seat', length: 7.7, span: 10.33, height: 2.9, chord: 1.7, gap: 1.55, stagger: 0.3, engine: 'inline', rudder: 'round', crew: 2, deep: true, depth: 1.0, half: 0.5 });
A['halberstadt-cl2'] = ww1({ cls: 'biplane-two-seat', length: 7.3, span: 10.77, height: 2.75, lower: 10.4, chord: 1.6, gap: 1.5, stagger: 0.3, engine: 'inline', rudder: 'round', crew: 2, depth: 1.05 });


// Inter-war biplanes.
A['i-153'] = ww1({ cls: 'ww2-fighter', length: 6.17, span: 10.0, height: 2.8, lower: 7.5, lowerChord: 1.3, chord: 1.55, gap: 1.35, stagger: 0.45, engine: 'rotary', rudder: 'round', retract: true, half: 0.5, depth: 1.1, prop: 2.8 });
A['u-2-po-2'] = ww1({ cls: 'trainer', length: 8.17, span: 11.4, height: 3.1, lower: 10.6, chord: 1.65, gap: 1.7, stagger: 0.4, engine: 'rotary', rudder: 'round', crew: 2, depth: 1.0, prop: 2.4 });
A['christen-eagle'] = ww1({ cls: 'trainer', length: 5.64, span: 6.07, height: 1.98, chord: 1.15, gap: 1.15, stagger: 0.35, engine: 'rotary', rudder: 'round', depth: 0.9, prop: 1.9 });
A['gladiator'] = ww1({ length: 8.36, span: 9.83, height: 3.53, chord: 1.55, gap: 1.6, stagger: 0.45, engine: 'rotary', rudder: 'round', half: 0.5, depth: 1.1, prop: 3.2 });
A['cr-42'] = ww1({ length: 8.25, span: 9.7, height: 3.06, lower: 6.5, lowerChord: 1.05, chord: 1.65, gap: 1.4, stagger: 0.4, engine: 'rotary', rudder: 'round', half: 0.5, depth: 1.1, spats: true, prop: 2.9 });
A['swordfish'] = ww1({ cls: 'biplane-two-seat', length: 10.87, span: 13.87, height: 3.76, chord: 1.75, gap: 1.9, stagger: 0.4, engine: 'rotary', rudder: 'round', crew: 2, bays: 2, depth: 1.25, half: 0.5, prop: 3.2, blades: 3 });
A['he-51'] = ww1({ length: 8.4, span: 11.0, height: 3.2, chord: 1.6, gap: 1.6, stagger: 0.4, engine: 'inline', rudder: 'round', bays: 2, depth: 1.05, prop: 2.9 });

export const PROP_VARIANTS: SpecSet = { air: A, aliases: ALIASES };
