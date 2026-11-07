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
import { cowlLip, type Cowl, type FixedWingSpec } from '../air';
import type { Outline, P2 } from '../parts';
import { AIRCRAFT, jet, piston, type Piston } from './aircraft';

type Spec = FixedWingSpec & { cls: string };

const A: Record<string, Spec> = {};
/** War Thunder propeller aircraft that had no figure, mapped to their own or the nearest of their family (from the public wiki's vehicle lists). */
const ALIASES: Record<string, string> = {
  'pbj_1j': 'b-25',
  'pbj_1h': 'b-25h',
  'fr_1_fireball': 'fr-1-fireball',
  'fw_190a_8_mistel': 'mistel-2',
  'ju_88g_1_mistel': 'ju-88-mistel',
  'bv-155b-1': 'bv-155',
  'bb-1': 'su-2',
  'yak-4': 'yak-4',
  'ar_2': 'sb-2',
  'yak_2_kabb': 'yak-4',
  'i_185_m82': 'i-185',
  'i_185_m71_standard': 'i-185',
  'il_8_1944': 'il-8',
  'itp_m1': 'itp',
  'tu-2_postwar': 'tu-2',
  'tu-2_postwar_late': 'tu-2',
  'tu-2_postwar_china': 'tu-2',
  'tu-2_postwar_late_hungary': 'tu-2',
  'b_48_firecrest': 'firecrest',
  'thunderbolt_mk1': 'p-47d-razorback',
  'mb_5': 'mb-5',
  'ki_48_2_otsu': 'ki-48',
  'j5n1': 'j5n1',
  'ki_93_1_ko': 'ki-93',
  'j6k1': 'ki-84',
  'd_510c': 'd-510',
  'd_510': 'd-510',
  'breda_88': 'breda-88',
  'br_20_dr': 'br-20',
  'br_20m_m1': 'br-20',
  'fc_20_bis': 'bf-110',
  'sm_91': 'sm-91',
  'sm_92': 'sm-92',
  'd_500': 'd-510',
  'd_501': 'd-510',
  'a-35b': 'vengeance',
  'vg_33': 'vg-33',
  'j6b': 'j6b',
  'saab_b17bs': 'saab-17bs',
  'saab_b17b': 'saab-17',
  'saab_b17a': 'saab-17',
  'saab_b3c': 'ju-86',
  're_2000_j20': 're-2000',
  'ffvs_j22_a': 'ffvs-j22',
  'ffvs_j22_b': 'ffvs-j22',
  'j9_early': 'p-35',
  's_199': 's-199',
};

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

/** A radial nacelle's open cowl at its front, mirrored to both sides. */
function cowlOf(n: Nac): Cowl {
  return { x: n.x, side: n.y, up: n.z, radius: n.r * (n.wide ?? 1), height: n.r };
}

function nacelle(n: Nac): Outline {
  // A radial's nacelle starts behind its cowl's lip (drawn by the builder from `cowlOf`).
  if (n.kind === 'radial') n = { ...n, x: n.x - cowlLip(Math.max(n.r, n.r * (n.wide ?? 1))) };
  const L = n.x - n.back;
  const f0 = n.kind === 'radial' ? 0.99 : n.kind === 'jet' ? 0.92 : 0.32;
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
  /**
   * The cockpit's glazing from `front` back to `back`: the body's top there is cut down to the sill (default
   * half a metre under the crown) and a narrower glass hood stands to the old crown, so the canopy reads from
   * the front as well as the side.
   */
  hood?: { front: number; back: number; sill?: number; w?: number };
  /** Glass over the nose ahead of this station (a glazed bomber nose). */
  glazed?: number;
  /** The wing's thickness as a share of its chord (default 0.16, an estimate); 0 for the builder's thin default (biplanes). */
  thick?: number;
}

/** The body's top, bottom or half-width at `x` from its stations. */
function rowAt(rows: Row[], x: number, k: 1 | 2 | 3): number {
  for (let i = 1; i < rows.length; i++) {
    const [x0] = rows[i - 1];
    const [x1] = rows[i];
    if ((x0 - x) * (x1 - x) <= 0) return x0 === x1 ? rows[i][k] : rows[i - 1][k] + ((rows[i][k] - rows[i - 1][k]) * (x - x0)) / (x1 - x0);
  }
  return x > rows[0][0] ? rows[0][k] : rows[rows.length - 1][k];
}

/** Cuts the body's top down under a hood and returns the body and the hood's glass. */
function hooded(rows: Row[], h: NonNullable<MP['hood']>): { body: Row[]; glass: Outline } {
  const inside = rows.filter(([x]) => x < h.front && x > h.back);
  const ends: Row[] = [h.front, h.back].map((x) => [x, rowAt(rows, x, 1), rowAt(rows, x, 2), rowAt(rows, x, 3)]);
  const crown = Math.max(...[...inside, ...ends].map((r) => r[1]));
  const sill = h.sill ?? crown - 0.5;
  const body = [...rows.filter(([x]) => x > h.front), ends[0], [h.front - 0.01, Math.min(ends[0][1], sill), ends[0][2], ends[0][3]] as Row, ...inside.map(([x, t, b, w]) => [x, Math.min(t, sill), b, w] as Row), [h.back + 0.01, Math.min(ends[1][1], sill), ends[1][2], ends[1][3]] as Row, ends[1], ...rows.filter(([x]) => x < h.back)];
  const L = h.front - h.back;
  const w = h.w ?? Math.min(0.5, Math.max(...[...inside, ...ends].map((r) => r[3])) * 0.72);
  const tops: P2[] = [ends[0], ...inside, ends[1]].map(([x, t]) => [x, Math.max(t, sill + 0.05)]);
  const glass: Outline = { top: tops, bottom: [[h.front, sill - 0.3], [h.back, sill - 0.3]], plan: [[h.front, w * 0.55], [h.front - L * 0.25, w], [h.back + L * 0.2, w], [h.back, w * 0.7]], round: 2.4, stations: 12 };
  return { body, glass };
}

/**
 * A multi-engined aircraft from its outlines, the propellers at the nacelles' fronts.
 */
function mp(o: MP): Spec {
  const glass: Outline[] = [];
  if (o.hood) {
    const c = hooded(o.body, o.hood);
    o = { ...o, body: c.body };
    glass.push(c.glass);
  }
  if (o.glazed !== undefined) {
    // The nose glazing: the body ahead of the station, a hair proud of it.
    const g = o.glazed;
    const nose = o.body.filter(([x]) => x > g);
    const r: Row[] = [...nose, [g, rowAt(o.body, g, 1), rowAt(o.body, g, 2), rowAt(o.body, g, 3)]];
    glass.push({ top: r.map(([x, t]) => [x + 0.02, t + 0.02] as P2), bottom: r.map(([x, , b]) => [x + 0.02, b - 0.02] as P2), plan: r.map(([x, , , w]) => [x + 0.02, w + 0.02] as P2), round: o.round ?? 2.4, stations: 10 });
  }
  const bh = Math.max(...o.body.map((r) => Math.max(Math.abs(r[1]), Math.abs(r[2]))));
  const bodyHeight = 2 * bh;
  const bodyWidth = 2 * Math.max(...o.body.map((r) => r[3]));
  const root = o.wing[0];
  const tip = o.wing[o.wing.length - 1];
  const rootChord = root[1] - root[2];
  // Propellers where they turn: at each nacelle's front (or a pusher's back), both sides, at the nacelle's own height; a centre engine at the nose.
  const [pd, pb] = o.prop ?? [0, 0];
  const props: NonNullable<FixedWingSpec['props']> = o.prop && !o.nose
    ? (o.nacelles ?? []).filter((n) => n.kind !== 'jet' && !n.noProp).flatMap((n) => [-1, 1].map((sd) => ({ x: n.propX ?? n.x + 0.1, side: sd * n.y, up: n.z, diameter: pd, blades: pb, spinner: n.kind === 'radial' && n.propX === undefined ? n.r * 0.4 : undefined })))
    : [];
  if (o.noseProp !== undefined && o.prop) props.push({ x: o.noseProp, side: 0, up: (o.body[0][1] + o.body[0][2]) / 2, diameter: pd, blades: pb });
  const finTop = o.fin.length ? Math.max(...o.fin.map((p) => p[1])) : 0;
  const b0 = o.twin ? (o.tailUp - 0.35 * finTop) / 0.65 : 0;
  return {
    cls: o.cls,
    length: o.length,
    span: o.span,
    height: o.height,
    bodyWidth,
    bodyHeight,
    fuselage: fus(o.body, o.round ?? 2.4),
    bodies: [...(o.nacelles ?? []).map(nacelle), ...(o.extra ?? [])],
    // The fin as thick at its root as a real one, so it shows edge-on from the front (an airfoil, thinning to its tip).
    finThickness: o.fin.length ? 2 * Math.max(0.05, Math.min(0.35, (Math.max(...o.fin.map((p) => p[0])) - Math.min(...o.fin.map((p) => p[0]))) * 0.035)) : undefined,
    wing: { x: root[1] - rootChord / 2, span: o.span, rootChord, tipChord: tip[1] - tip[2], sweep: 0, mount: o.wingUp / (bodyHeight * 0.4), dihedral: o.dihedral ?? 0, thicknessRatio: o.thick === 0 ? undefined : o.thick ?? 0.16 },
    wingPlan: planOf(o.wing, o.tipR ?? 0),
    tail: { kind: !o.fin.length ? 'none' : o.twin ? 'h' : 'single', finHeight: finTop, finChord: 2, spacing: o.twin, tailSpan: o.tail.length ? 2 * o.tail[o.tail.length - 1][0] : 0, tailChord: o.tail.length ? o.tail[0][1] - o.tail[0][2] : 0, finBase: 0, planeUp: o.tailUp },
    finPlan: !o.fin.length ? undefined : o.twin ? o.fin.map(([x, z]) => [x, z - b0] as P2) : o.fin,
    tailPlan: o.tail.length ? planOf(o.tail, o.tailR ?? 0) : undefined,
    engines: o.nose ? { kind: 'nose-prop', count: 1 } : undefined,
    props,
    propeller: o.prop ? { diameter: o.prop[0], blades: o.prop[1] } : undefined,
    cowls: (o.nacelles ?? []).filter((n) => n.kind === 'radial' && n.y > 0).map(cowlOf),
    rotodome: o.rotodome,
    canopy: { x: 0, length: 0, kind: 'none' },
    glass: glass.length ? glass : undefined,
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
    cls: 'ww2-heavy-bomber', length, span: 33.53, height: 5.49, hood: { front: 7.8, back: 5.8 }, glazed: length < 20.5 ? 9.0 : undefined,
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
  glazed: 12.6,
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
function b25(nose: Row[], length: number, turretX: number, glazed?: number): Spec {
  return mp({
    cls: 'ww2-bomber', length, span: 20.6, height: 4.98, hood: { front: 5.8, back: 3.9 }, glazed,
    body: [...nose, [5.4, 1.05, -0.92, 0.7], [4.4, 1.15, -0.95, 0.7], [-1, 1.0, -0.95, 0.68], [-5, 0.85, -0.55, 0.55], [-7.4, 0.65, -0.05, 0.35], [-8.07, 0.55, 0.15, 0.3]],
    wing: [[0, 2.4, -0.9], [3.6, 2.3, -0.95], [10.3, 0.9, -0.1]], tipR: 0.35, wingUp: 0.35, dihedral: 2.5,
    nacelles: [{ y: 2.95, x: 4.0, back: -2.9, r: 0.68, z: 0.35, kind: 'radial', below: 0.15 }],
    prop: [3.84, 3],
    fin: [[-6.4, -0.4], [-6.5, 2.4], [-6.8, 2.7], [-7.8, 2.7], [-8.0, 2.4], [-8.0, -0.4], [-7.8, -0.7], [-6.6, -0.7]], twin: 6.6,
    tail: [[0, -6.2, -7.9], [3.3, -6.4, -7.9]], tailUp: 0.4,
    extra: [dome(turretX, 1.0, 0.45, 1.1)],
  });
}
A['b-25'] = b25([[8.07, 0.0, -0.35, 0.15], [7.6, 0.4, -0.7, 0.55], [6.9, 0.6, -0.85, 0.65], [6.0, 0.7, -0.9, 0.68]], 16.13, 3.2, 6.6);
A['b-25h'] = b25([[7.77, 0.0, -0.4, 0.2], [7.3, 0.5, -0.75, 0.6], [6.5, 0.68, -0.88, 0.68], [5.8, 0.75, -0.9, 0.7]], 15.54, 4.2);

// He 111H: the stepless, fully glazed nose blending into the body, the ventral gondola, an elliptic-tipped wing
// tapered both ways, inlines with annular radiators, a tall rounded fin (16.4 x 22.6 x 4.0 m).
A['he-111'] = mp({
  cls: 'ww2-bomber', length: 16.4, span: 22.6, height: 4.0,
  glazed: 5.6,
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
    cls: gondola ? 'ww2-bomber' : 'ww2-heavy-fighter', length: 14.36, span: 20.08, height: 4.85, ...(gondola ? { glazed: 4.2 } : { hood: { front: 5.9, back: 3.8 } }),
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
  hood: { front: 4.6, back: 0.9 },
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
  hood: { front: 5.2, back: 2.4 }, glazed: 6.0,
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
  hood: { front: 6.9, back: 5.0, sill: 0.75 }, glazed: 8.0,
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
function a26(nose: Row[], glazed?: number): Spec {
  return mp({
    cls: 'ww2-bomber', length: 15.24, span: 21.34, height: 5.64, hood: { front: 4.8, back: 2.0 }, glazed,
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
A['a-26c'] = a26([[7.62, -0.05, -0.35, 0.25], [7.25, 0.4, -0.65, 0.5], [6.6, 0.62, -0.82, 0.6], [5.9, 0.68, -0.85, 0.6]], 6.3);

// A-20G Havoc: a very deep, narrow body with a solid gun nose, a shoulder wing, radials, a tall fin (14.63 x 18.69 x 5.36 m).
const A20: MP = {
  cls: 'ww2-bomber', length: 14.63, span: 18.69, height: 5.36,
  hood: { front: 4.4, back: 2.4 },
  body: [[7.32, -0.1, -0.6, 0.2], [6.8, 0.5, -0.95, 0.55], [5.8, 0.75, -1.1, 0.6], [4.7, 0.9, -1.1, 0.6], [4.0, 1.2, -1.1, 0.6], [2.8, 1.2, -1.1, 0.6], [2.0, 0.95, -1.1, 0.6], [-3, 0.85, -0.8, 0.5], [-7.32, 0.6, 0.05, 0.12]], round: 2.6,
  wing: [[0, 2.0, -1.4], [9.35, 0.5, -0.5]], tipR: 0.35, wingUp: 0.55, dihedral: 5,
  nacelles: [{ y: 2.6, x: 3.4, back: -2.6, r: 0.72, z: 0.55, kind: 'radial', below: 0.3 }],
  prop: [3.5, 3],
  fin: [[-4.5, 0.9], [-6.0, 1.3], [-6.6, 3.3], [-7.3, 3.4], [-7.5, 0.6]],
  tail: [[0, -5.8, -7.4], [3.3, -6.4, -7.3]], tailR: 0.3, tailUp: 1.0,
  extra: [dome(-1.0, 0.9, 0.4, 1.0)],
};
A['a-20g'] = mp(A20);
// A-20B: the same airframe with the glazed bombardier's nose (14.48 m).
A['a-20b'] = mp({ ...A20, length: 14.48, glazed: 5.7 });

// Blenheim Mk I: the short glazed nose, a mid-low wing, radials, the dorsal turret, a small fin (12.12 x 17.17 x 3.0 m);
// the Mk IV's longer nose with the cockpit set back (12.98 m).
function blenheim(nose: Row[], length: number): Spec {
  return mp({
    cls: 'ww2-bomber', length, span: 17.17, height: 3.0, glazed: nose[nose.length - 1][0] - 0.2,
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
  hood: { front: 5.6, back: 4.2 },
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
  hood: { front: 7.0, back: 5.2 },
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
  glazed: 6.2,
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
  hood: { front: 6.0, back: 4.6, sill: 0.95 },
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
  hood: { front: 7.6, back: 5.6 }, glazed: 8.6,
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
    cls, length, span: 16.52, height: 5.3, hood: { front: 4.9, back: 2.3 }, glazed: cls === 'ww2-bomber' ? 5.6 : undefined,
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
    cls: 'ww2-heavy-fighter', length, span: 16.27, height: finTop > 1.3 ? 4.13 : 3.3, hood: { front: 4.6, back: 0.2 },
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
  hood: { front: 5.6, back: 3.4 }, glazed: 4.4,
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
    glazed: -1.0,
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
  hood: { front: 8.6, back: 6.4 },
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
  /** Its own fin outline, (forward, up) from the fin's root on the fuselage. */
  finOutline?: P2[];
  bodies?: Outline[];
}

/** A single-engined piston aircraft from `piston`, with a razorback spine, its own fin and its own lumps. */
function one(p: One): Spec {
  const s = piston(p);
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
// The radiators under the wings and the oil cooler under the nose (estimates).
const BF109 = { cls: 'ww2-fighter', span: 9.92, height: 2.6, w: 0.45, h: 0.58, wing: 'round' as const, le: 1.3, root: 2.15, tip: 1.05, sweep: 3, fin: 1.25, finRoot: 1.3, roundFin: true, tailSpan: 3.0, tailRoot: 0.9, prop: 3.0, blades: 3, spinner: 0.34, rads: [0.95, 1.3, 1.3, 0.22] as [number, number, number, number] };
const BF109_OIL = belly(3.4, 2.5, -0.35, -0.78, 0.2);
A['bf-109-f'] = one({ ...BF109, length: 8.94, canopy: { x: 0.6, length: 1.6, kind: 'framed' }, bodies: [BF109_OIL] });
A['bf-109-g6'] = one({ ...BF109, length: 9.02, canopy: { x: 0.6, length: 1.6, kind: 'framed' }, bodies: [BF109_OIL, bulge(2.75, 1.6, 0.35, 0.15, 0.16, 0.42)] });
A['bf-109-k4'] = one({ ...BF109, length: 8.95, fin: 1.5, finRoot: 1.45, canopy: { x: 0.6, length: 1.6, kind: 'bubble' }, bodies: [BF109_OIL, bulge(3.1, 1.2, 0.35, 0.13, 0.11, 0.42)] });

// Spitfire: the elliptic wing, a long thin nose, a rounded fin. Mk V: the short Merlin nose, three blades (9.12 x 11.23 x 3.02 m);
// Mk IX: the longer nose, four blades (9.47 x 11.23 x 3.86 m); Mk XIV: the long Griffon nose, five blades, the broad
// fin, the cut-down rear deck and teardrop hood (9.96 x 11.23 x 3.86 m).
// The radiators under both wings (the Mk V's smaller pair stands for its radiator and oil cooler; estimates).
const SPIT = { cls: 'ww2-fighter', span: 11.23, w: 0.45, h: 0.62, spinner: 0.32, wing: 'elliptic' as const, le: 1.45, root: 2.6, tip: 0.3, fin: 1.35, finRoot: 1.3, roundFin: true, tailSpan: 3.3, tailRoot: 1.0 };
A['spitfire-mk-v'] = one({ ...SPIT, length: 9.12, height: 3.02, le: 1.2, canopy: { x: -0.3, length: 1.5, kind: 'framed' }, razor: true, prop: 3.25, blades: 3, rads: [0.75, 1.55, 1.2, 0.2] });
A['spitfire-mk-ix'] = one({ ...SPIT, length: 9.47, height: 3.86, canopy: { x: -0.3, length: 1.5, kind: 'framed' }, razor: true, prop: 3.3, blades: 4, rads: [0.95, 1.55, 1.35, 0.26] });
A['spitfire-mk-xiv'] = one({ ...SPIT, length: 9.96, height: 3.86, le: 1.6, fin: 1.6, finRoot: 1.5, canopy: { x: -0.4, length: 1.5, kind: 'bubble' }, prop: 3.15, blades: 5, rads: [1.05, 1.55, 1.45, 0.3], bodies: [bulge(3.6, 2.4, 0.4, 0.12, 0.1, 0.36)] });

// P-51 Mustang: the belly radiator scoop, a straight square-tipped laminar wing. B: the razorback and the framed
// (Malcolm) hood (9.83 x 11.28 x 4.16 m); D: the cut-down deck, the bubble and a dorsal fin fillet (9.83 x 11.28 x 4.08 m).
const P51 = { cls: 'ww2-fighter', length: 9.83, span: 11.28, w: 0.52, h: 0.72, wing: 'square' as const, le: 1.5, root: 2.75, tip: 1.2, sweep: 1, fin: 1.5, finRoot: 1.8, tailSpan: 4.1, tailRoot: 1.1, prop: 3.4, blades: 4, scoop: [-1.2, 2.2, 0.35] as [number, number, number] };
A['p-51b'] = one({ ...P51, height: 4.16, canopy: { x: -0.1, length: 1.5, kind: 'framed' }, razor: true });
A['p-51d-mustang'] = one({ ...P51, height: 4.08, canopy: { x: -0.1, length: 1.8, kind: 'bubble' }, finOutline: filletFin(9.83, 1.8, 1.1, 1.5, 0.75) });

// P-47 Thunderbolt: the huge round body and radial with the turbo duct under the cowl, a round-tipped wing; the
// razorback's spine runs to the fin, the D-25 on has the bubble (11.0 x 12.42 x 4.47 m).
const P47 = { cls: 'ww2-fighter', length: 11.0, span: 12.42, height: 4.47, w: 0.72, h: 1.0, cowl: 0.72, cowlH: 0.85, waist: 0.66, radial: true, wing: 'round' as const, le: 1.8, root: 2.9, tip: 1.3, sweep: 2, fin: 1.6, finRoot: 1.8, roundFin: true, tailSpan: 4.6, tailRoot: 1.2, prop: 3.7, blades: 4, bodies: [belly(4.6, 2.4, -0.7, -1.2, 0.5)] };
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
// The La-7's long low hood with the glazed fairing behind it, the oil cooler under the rear body and the
// supercharger's intakes in the wing roots' leading edges (estimates).
A['la-7'] = one({ ...LA, length: 8.6, height: 2.54, canopy: { x: -0.55, length: 1.9, kind: 'bubble' }, hood: 0.42, scoop: [-1.3, 1.2, 0.24], bodies: [bulge(1.75, 0.95, -0.42, 0.11, 0.13, 0.62)] });
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
    wing: main.rows, tipR: (main.rows === lowerRows ? lc : o.chord) * 0.3, wingUp: main.z, dihedral: o.dihedral ?? (layout === 'bi' || layout === 'tri' ? 2.5 : 1), thick: layout === 'mono' || layout === 'parasol' ? 0.1 : 0,
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

// ---------------------------------------------------------------- more War Thunder types with their own silhouettes

// Ki-27 "Nate": a slim radial monoplane with fixed spatted gear and a long canopy (7.53 x 11.31 x 3.25 m); the A5M and other
// fixed-gear monoplane fighters map here.
A['ki-27'] = one({ cls: 'ww2-fighter', length: 7.53, span: 11.31, height: 3.25, w: 0.55, h: 0.62, radial: true, wing: 'round', le: 1.3, root: 2.2, tip: 0.9, sweep: 4, dihedral: 4, fin: 1.3, finRoot: 1.3, roundFin: true, tailSpan: 3.4, tailRoot: 0.9, canopy: { x: -0.2, length: 1.6, kind: 'framed' }, razor: true, prop: 2.9, blades: 2, gear: true });
// F2A Buffalo: a barrel body behind the radial, a mid-low round-tipped wing, the framed canopy on a razorback (8.03 x 10.67 x 3.66 m).
A['f2a-buffalo'] = one({ cls: 'ww2-fighter', length: 8.03, span: 10.67, height: 3.66, w: 0.7, h: 0.8, radial: true, wing: 'round', le: 1.4, root: 2.4, tip: 1.2, sweep: 3, mount: -0.3, dihedral: 5, fin: 1.4, finRoot: 1.3, roundFin: true, tailSpan: 4.2, tailRoot: 1.1, canopy: { x: 0.0, length: 1.8, kind: 'framed' }, razor: true, prop: 3.15, blades: 3 });
// Sea Fury: the big radial, five blades, a near-elliptic wing, the bubble and a dorsal fillet (10.57 x 11.7 x 4.84 m).
A['sea-fury'] = one({ cls: 'ww2-fighter', length: 10.57, span: 11.7, height: 4.84, w: 0.68, h: 0.8, radial: true, wing: 'elliptic', le: 1.7, root: 2.9, tip: 0.6, fin: 1.75, finRoot: 1.7, tailSpan: 4.6, tailRoot: 1.2, canopy: { x: -0.3, length: 1.6, kind: 'bubble' }, prop: 3.81, blades: 5, finOutline: filletFin(10.57, 1.7, 1.0, 1.75, 0.8) });

// P-61 Black Widow: a central nacelle with the glazed nose and dorsal turret, two booms carrying the radials forward
// and the twin fins aft, the tailplane between them (15.11 x 20.12 x 4.47 m).
A['p-61'] = mp({
  cls: 'ww2-heavy-fighter', length: 15.11, span: 20.12, height: 4.47,
  hood: { front: 5.4, back: 1.6 }, glazed: 6.4,
  body: [[7.55, 0.0, -0.45, 0.3], [7.1, 0.55, -0.7, 0.7], [6.0, 0.85, -0.9, 0.85], [5.0, 1.2, -0.95, 0.85], [2.0, 1.2, -0.95, 0.85], [-1.0, 0.9, -0.8, 0.75], [-2.8, 0.5, -0.3, 0.3]],
  wing: [[0, 2.6, -1.4], [3.2, 2.6, -1.4], [10.06, 1.0, -0.4]], tipR: 0.4, wingUp: 0.2, dihedral: 3,
  nacelles: [{ y: 2.6, x: 4.6, back: -7.0, r: 0.75, z: 0.2, kind: 'radial', below: 0.2 }],
  prop: [3.7, 4],
  fin: [[-5.6, -0.5], [-5.7, 2.2], [-6.3, 2.5], [-7.4, 2.5], [-7.55, 2.1], [-7.55, -0.5], [-7.2, -0.8], [-5.9, -0.8]], twin: 5.2,
  tail: [[0, -5.8, -7.2], [2.6, -5.8, -7.2]], tailUp: 0.9,
  extra: [dome(1.4, 1.2, 0.45, 1.0)],
});

// PV-2 Harpoon: the Lockheed twin (Hudson, Ventura, Harpoon) - a deep body with a dorsal turret, radials, and twin
// oval fins on the tailplane's tips (15.87 x 22.86 x 3.63 m).
A['pv-2'] = mp({
  cls: 'ww2-bomber', length: 15.87, span: 22.86, height: 3.63,
  hood: { front: 5.8, back: 4.0 },
  body: [[7.93, -0.1, -0.5, 0.25], [7.4, 0.5, -0.85, 0.7], [6.4, 0.85, -1.05, 0.9], [5.2, 1.15, -1.1, 0.92], [3.0, 1.15, -1.1, 0.92], [-2, 1.0, -0.95, 0.85], [-5.5, 0.75, -0.4, 0.55], [-7.93, 0.5, 0.1, 0.15]],
  wing: [[0, 2.6, -1.6], [11.43, 0.6, -0.5]], tipR: 0.5, wingUp: -0.1, dihedral: 5,
  nacelles: [{ y: 3.0, x: 4.4, back: -2.4, r: 0.75, z: -0.1, kind: 'radial', below: 0.2 }],
  prop: [3.7, 3],
  fin: [[-6.0, 0.6], [-6.2, 1.7], [-6.8, 2.2], [-7.5, 2.1], [-7.9, 1.2], [-7.9, 0.0], [-7.5, -0.7], [-6.7, -0.85], [-6.1, -0.4]], twin: 6.6,
  tail: [[0, -6.1, -7.8], [3.3, -6.3, -7.8]], tailUp: 0.5,
  extra: [dome(-0.6, 1.0, 0.5, 1.1)],
});

// Ju 87 G: the Stuka with a 37 mm cannon pod under each wing, long barrels reaching ahead of the nose (11.5 x 15.0 x 3.88 m).
const STUKA = AIRCRAFT.air!['ju-87-stuka'];
A['ju-87-g'] = { ...STUKA, cls: 'ww2-attack', span: 15.0, bodies: [...(STUKA.bodies ?? []), { top: [[4.4, -0.85], [2.4, -0.82], [1.6, -0.7], [-0.6, -0.72]], bottom: [[4.4, -0.93], [2.4, -0.96], [1.6, -1.2], [-0.6, -1.0]], plan: [[4.4, 0.05], [2.4, 0.06], [1.6, 0.22], [-0.6, 0.1]], side: 2.9, round: 2, stations: 8 }] };

// ---------------------------------------------------------------- WWI pushers, multi-engined biplanes, seaplanes

interface Bipe {
  cls?: string;
  length: number;
  span: number;
  height: number;
  lower?: number;
  body: Row[];
  round?: number;
  /** The lower wing's height and leading edge, the gap to the upper wing, chords, stagger, bays of struts. */
  lz: number;
  le: number;
  gap: number;
  chord: number;
  lowerChord?: number;
  stagger?: number;
  bays: number;
  nacelles?: Nac[];
  prop: [number, number];
  fin: P2[];
  twin?: number;
  tail: Edge[];
  tailUp: number;
  /** Open tail booms (a pusher's): from the wings' trailing edge, this far out, to the tail, converging to `yTo` out there. */
  booms?: { y: number; from: number; to: number; zTo: number; yTo?: number };
  /** Wheels: forward position, out, the ground's height, radius. */
  gear?: [number, number, number, number][];
  extra?: Outline[];
}

/** A biplane with engines in nacelles (or a pusher nacelle), its upper wing, struts, booms and wheels. */
function bipe(o: Bipe): Spec {
  const uz = o.lz + o.gap;
  const ux = o.le + (o.stagger ?? 0);
  const lc = o.lowerChord ?? o.chord;
  const us = o.span / 2;
  const ls = (o.lower ?? o.span) / 2;
  const extra: Outline[] = [wingBody([[0, ux, ux - o.chord], [us, ux, ux - o.chord]], uz, o.chord * 0.3)];
  for (let i = 1; i <= o.bays; i++) {
    const y = (Math.min(us, ls) * i) / (o.bays + 0.4);
    for (const k of [0.2, 0.75]) extra.push(post(ux - o.chord * k + 0.04, ux - o.chord * k - 0.04, uz, o.lz, 0.035, y, o.stagger ?? 0));
  }
  if (o.booms) {
    // Each boom in short straight pieces, so it can close in towards the tail; a tube of 12 cm (a little heavier than
    // the real ones, so it still reads at a distance), and a cross strut between the upper and lower boom halfway.
    const b = o.booms;
    const yTo = b.yTo ?? b.y;
    const n = 6;
    for (const z0 of [uz, o.lz]) {
      for (let i = 0; i < n; i++) {
        const f0 = i / n;
        const f1 = (i + 1) / n;
        const x0 = b.from + (b.to - b.from) * f0;
        const x1 = b.from + (b.to - b.from) * f1;
        const za = z0 + (b.zTo - z0) * f0;
        const zb = z0 + (b.zTo - z0) * f1;
        extra.push({ top: [[x0 + 0.04, za + 0.06], [x1, zb + 0.06]], bottom: [[x0 + 0.04, za - 0.06], [x1, zb - 0.06]], plan: [[x0 + 0.04, 0.06], [x1, 0.06]], side: b.y + (yTo - b.y) * (f0 + f1) / 2, round: 2, stations: 2 });
      }
    }
    const xm = (b.from + b.to) / 2;
    extra.push(post(xm + 0.04, xm - 0.04, (uz + b.zTo) / 2, (o.lz + b.zTo) / 2, 0.035, (b.y + yTo) / 2));
  }
  for (const [x, y, g, r] of o.gear ?? []) extra.push(...wheel(x, y, o.lz, g, r));
  return mp({
    cls: o.cls ?? 'ww1-bomber', length: o.length, span: o.span, height: o.height,
    body: o.body, round: o.round ?? 5,
    wing: [[0, o.le, o.le - lc], [ls, o.le, o.le - lc]], tipR: lc * 0.3, wingUp: o.lz, dihedral: 1.5, thick: 0,
    nacelles: o.nacelles, prop: o.prop, fin: o.fin, twin: o.twin, tail: o.tail, tailR: 0.3, tailUp: o.tailUp,
    extra: [...extra, ...(o.extra ?? [])],
  });
}

// Airco DH.2: a short nacelle with the pilot in front and the rotary pushing behind, open booms to the tail (7.68 x 8.61 x 2.91 m).
A['airco-dh2'] = bipe({ cls: 'biplane', length: 7.68, span: 8.61, height: 2.91, body: [[3.84, 0.05, -0.35, 0.2], [3.4, 0.45, -0.45, 0.38], [2.0, 0.5, -0.45, 0.42], [1.0, 0.4, -0.38, 0.4], [0.6, 0.25, -0.25, 0.25]], lz: -0.35, le: 2.0, gap: 1.45, chord: 1.45, bays: 2, nacelles: [{ y: 0, x: 1.0, back: 0.4, r: 0.45, z: 0.05, kind: 'radial', propX: 0.3 }], prop: [2.6, 2], booms: { y: 0.85, from: 0.55, to: -3.3, zTo: 0.15, yTo: 0.25 }, fin: [[-3.0, -0.2], [-3.0, 1.0], [-3.4, 1.15], [-3.84, 0.9], [-3.84, -0.1]], tail: [[0, -2.6, -3.6], [1.4, -2.8, -3.5]], tailUp: 0.15, gear: [[2.4, 0.7, -1.35, 0.3]] });
// F.E.2b: the two-seat pusher, the gunner in the nose, two bays, open booms (9.83 x 14.55 x 3.85 m).
A['fe-2b'] = bipe({ cls: 'biplane-two-seat', length: 9.83, span: 14.55, height: 3.85, body: [[4.92, 0.0, -0.35, 0.3], [4.5, 0.55, -0.5, 0.5], [3.0, 0.65, -0.55, 0.55], [1.2, 0.55, -0.45, 0.5], [0.6, 0.3, -0.3, 0.3]], lz: -0.5, le: 2.3, gap: 1.9, chord: 1.75, bays: 2, nacelles: [{ y: 0, x: 1.0, back: 0.2, r: 0.5, z: 0.1, propX: 0.15 }], prop: [2.9, 4], booms: { y: 1.4, from: 0.55, to: -3.9, zTo: 0.2, yTo: 0.9 }, fin: [[-3.9, -0.2], [-3.9, 1.2], [-4.3, 1.4], [-4.92, 1.1], [-4.92, -0.1]], tail: [[0, -3.4, -4.6], [1.9, -3.6, -4.5]], tailUp: 0.2, gear: [[2.6, 0.9, -1.6, 0.38], [4.0, 0, -1.6, 0.2]] });
// Gotha G.V: a slim box body with the nose gunner, two pusher engines between the wings, three bays (12.36 x 23.7 x 4.3 m).
A['gotha-g5'] = bipe({ length: 12.36, span: 23.7, height: 4.3, lower: 21.7, body: [[6.18, 0.3, -0.55, 0.45], [5.6, 0.65, -0.65, 0.6], [3.0, 0.7, -0.7, 0.65], [-2, 0.55, -0.5, 0.5], [-5.6, 0.3, -0.05, 0.12]], lz: -0.6, le: 2.4, gap: 2.3, chord: 2.5, bays: 3, nacelles: [{ y: 2.8, x: 2.0, back: -1.6, r: 0.55, z: 0.5, propX: -1.75 }], prop: [3.1, 2], fin: [[-4.6, 0.5], [-5.4, 0.6], [-6.0, 1.6], [-6.18, 1.4], [-6.18, 0.0], [-5.0, 0.4]], tail: [[0, -4.6, -6.0], [3.0, -4.8, -6.0]], tailUp: 0.55, gear: [[2.6, 2.8, -2.2, 0.5]] });
// Handley Page O/400: a long box body, two tractor engines between the wings, four bays, a biplane tail with twin fins (19.16 x 30.48 x 6.71 m).
A['handley-page-o400'] = bipe({ length: 19.16, span: 30.48, height: 6.71, body: [[9.58, 0.3, -0.9, 0.5], [9.0, 0.8, -1.0, 0.7], [6.0, 0.9, -1.0, 0.75], [-3, 0.7, -0.6, 0.55], [-8.6, 0.4, -0.05, 0.15]], lz: -0.9, le: 3.0, gap: 3.0, chord: 3.0, bays: 4, nacelles: [{ y: 3.5, x: 4.2, back: 0.2, r: 0.7, z: 0.6 }], prop: [3.4, 4], fin: [[-7.6, -0.4], [-7.6, 1.8], [-8.0, 2.0], [-9.4, 2.0], [-9.58, 1.6], [-9.58, -0.4]], twin: 3.6, tail: [[0, -7.4, -9.4], [2.6, -7.6, -9.4]], tailUp: 0.5, gear: [[3.0, 3.5, -3.0, 0.7]], extra: [wingBody([[0, -7.4, -9.4], [2.6, -7.6, -9.4]], 1.9, 0.3, 0.08)] });
// Airco DH.10 Amiens: two tractor engines between the wings, three bays, a single fin (12.08 x 19.96 x 4.42 m).
A['airco-dh10'] = bipe({ length: 12.08, span: 19.96, height: 4.42, body: [[6.04, 0.2, -0.55, 0.45], [5.6, 0.65, -0.65, 0.6], [3.0, 0.7, -0.7, 0.65], [-2, 0.55, -0.5, 0.5], [-5.6, 0.3, -0.05, 0.12]], lz: -0.65, le: 2.0, gap: 2.1, chord: 2.2, bays: 3, nacelles: [{ y: 2.7, x: 3.6, back: 0.0, r: 0.55, z: 0.4 }], prop: [3.0, 2], fin: [[-4.6, 0.5], [-5.3, 0.7], [-5.8, 1.9], [-6.04, 1.8], [-6.04, 0.0]], tail: [[0, -4.4, -5.8], [2.6, -4.6, -5.8]], tailUp: 0.55, gear: [[2.4, 2.7, -2.1, 0.5]] });
// Caproni Ca.5: a central nacelle with a pusher, two tractor engines at the fronts of twin booms, triple rudders (12.62 x 23.4 x 4.48 m).
A['caproni-ca5'] = bipe({ length: 12.62, span: 23.4, height: 4.48, body: [[6.31, 0.2, -0.5, 0.4], [5.8, 0.7, -0.6, 0.6], [3.0, 0.7, -0.7, 0.65], [0.5, 0.6, -0.6, 0.6], [-0.2, 0.3, -0.3, 0.3]], lz: -0.6, le: 1.8, gap: 2.3, chord: 2.4, bays: 3, nacelles: [{ y: 0, x: 0.0, back: -0.6, r: 0.5, z: 0, propX: -0.7 }, { y: 2.4, x: 3.2, back: -5.6, r: 0.45, z: 0 }], prop: [2.9, 2], fin: [[-5.0, -0.4], [-5.0, 1.2], [-5.4, 1.4], [-6.31, 1.3], [-6.31, -0.4]], twin: 4.8, tail: [[0, -4.8, -6.31], [2.6, -4.8, -6.31]], tailUp: 0.4, gear: [[2.0, 1.0, -2.1, 0.45]], extra: [post(-5.0, -6.3, 1.3, -0.4, 0.05)] });
// Ilya Muromets: a long box body with the glazed cabin, four tractor engines on the lower wing, four bays (17.1 x 29.8 x 4.0 m).
A['ilya-muromets'] = bipe({ length: 17.1, span: 29.8, height: 4.0, lower: 21.0, body: [[8.55, 0.4, -0.9, 0.6], [8.0, 0.9, -1.0, 0.8], [5.0, 0.9, -1.0, 0.8], [-2, 0.6, -0.6, 0.55], [-8.3, 0.3, 0.0, 0.15]], lz: -0.9, le: 3.0, gap: 2.4, chord: 2.6, bays: 4, nacelles: [{ y: 2.6, x: 4.2, back: 2.0, r: 0.4, z: -0.5 }, { y: 5.2, x: 4.0, back: 1.8, r: 0.4, z: -0.5 }], prop: [2.8, 2], fin: [[-7.0, 0.3], [-8.0, 0.4], [-8.55, 1.4], [-8.55, 0.0]], tail: [[0, -6.0, -8.4], [3.2, -6.2, -8.4]], tailUp: 0.35, gear: [[3.0, 2.6, -2.0, 0.5]] });
// Hansa-Brandenburg W.12: a two-seat biplane on twin floats, its rudder hanging below the tail (9.65 x 11.2 x 3.3 m).
const W12 = ww1({ cls: 'biplane-two-seat', length: 9.65, span: 11.2, height: 3.3, chord: 1.7, gap: 1.6, stagger: 0.2, engine: 'inline', rudder: 'round', crew: 2, retract: true, depth: 1.1, prop: 2.8 });
A['hansa-brandenburg-w12'] = { ...W12, finPlan: [[-3.8, 0.15], [-4.825, 0.2], [-4.825, -0.9], [-4.4, -1.1], [-3.8, -0.4]], bodies: [...(W12.bodies ?? []), ...[{ top: [[3.6, -1.35], [2.8, -1.25], [-1.8, -1.3]], bottom: [[3.6, -1.5], [2.8, -1.85], [-1.8, -1.6]], plan: [[3.6, 0.1], [2.8, 0.35], [-1.8, 0.1]], side: 1.2, round: 3, stations: 8 } as Outline, post(2.2, 2.1, -0.5, -1.3, 0.04, 1.0), post(-0.2, -0.3, -0.5, -1.3, 0.04, 1.0)]] };

// ---------------------------------------------------------------- odd ones out

// Horten Ho 229: a flying wing, the cockpit and two jets buried in its thick centre, no fin (7.47 x 16.76 x 2.81 m).
A['horten-ho-229'] = mp({ cls: 'flying-wing', length: 7.47, span: 16.76, height: 2.81, body: [[3.74, 0.1, -0.3, 0.3], [2.5, 0.55, -0.5, 0.8], [1.0, 0.7, -0.55, 1.1], [-1.5, 0.5, -0.4, 1.2], [-3.74, 0.1, -0.05, 0.4]], wing: [[0, 2.6, -3.7], [3.0, 1.6, -3.0], [8.38, -2.6, -3.3]], tipR: 0.3, wingUp: 0, dihedral: 2, nacelles: [{ y: 0.95, x: 2.4, back: -2.6, r: 0.42, z: 0, kind: 'jet' }], fin: [], tail: [], tailUp: 0 });
// Armstrong Whitworth AW.52: a big swept flying wing with fins at the tips, the jets in the centre (11.4 x 27.43 x 4.45 m).
A['aw-52'] = mp({ cls: 'flying-wing', length: 11.4, span: 27.43, height: 4.45, body: [[5.7, 0.2, -0.4, 0.5], [4.2, 0.9, -0.7, 1.1], [1.0, 1.0, -0.7, 1.6], [-3.5, 0.6, -0.4, 1.4], [-5.0, 0.2, -0.1, 0.5]], wing: [[0, 3.6, -5.0], [4.0, 2.0, -3.6], [13.7, -4.4, -5.7]], tipR: 0.2, wingUp: 0, dihedral: 3, nacelles: [{ y: 1.6, x: 2.4, back: -4.6, r: 0.5, z: 0, kind: 'jet' }], fin: [[-4.0, -0.2], [-4.6, 2.0], [-5.6, 2.0], [-5.7, -0.2]], twin: 26.8, tail: [], tailUp: 0 });
// Waco CG-4A: a boxy glider fuselage with the hinged nose, a high braced wing, fixed wheels (14.8 x 25.5 x 3.7 m).
A['cg-4a'] = mp({ cls: 'glider', length: 14.8, span: 25.5, height: 3.7, body: [[7.4, 0.4, -0.8, 0.6], [7.0, 0.85, -1.0, 0.85], [5.8, 1.0, -1.05, 0.9], [0, 1.0, -1.05, 0.9], [-3, 0.85, -0.4, 0.6], [-7.4, 0.5, 0.25, 0.1]], round: 6, wing: [[0, 2.5, -0.4], [12.75, 2.1, 0.1]], tipR: 0.4, wingUp: 1.05, nacelles: [], fin: [[-4.6, 0.9], [-6.0, 1.4], [-6.8, 2.9], [-7.4, 2.9], [-7.4, 0.4]], tail: [[0, -6.0, -7.4], [3.3, -6.3, -7.4]], tailUp: 0.7, extra: [post(1.4, 1.3, 0.95, -0.9, 0.05, 2.4, -0.6), ...wheel(1.6, 1.2, -1.0, -2.2, 0.38)] });
// XF-85 Goblin: a tiny egg-shaped parasite fighter with the nose intake, swept folding wings and a cluster of tail fins (4.53 x 6.44 x 2.53 m).
A['xf-85-goblin'] = { ...jet({ cls: 'jet-fighter', length: 4.53, span: 6.44, height: 2.53, w: 0.6, h: 0.7, intake: 'nose', wingPlan: [[0.9, 0], [0.9, 0.6], [-0.9, 3.22], [-1.5, 3.22], [-0.9, 0.6], [-0.9, 0]], mount: 0.2, fin: [[-1.2, 0], [-2.0, 0], [-2.3, 0.9], [-1.8, 0.9]], tail: [[-1.6, 0], [-2.0, 0.9], [-2.3, 0.9], [-2.3, 0]], planeUp: 0, canopy: { x: 0.6, length: 0.9, kind: 'bubble' } }) };
// Ba 349 Natter: a rocket interceptor with a short straight wing and a cruciform tail, its nose a battery of rockets (6.02 x 4.0 x 2.25 m).
A['ba-349-natter'] = { ...jet({ cls: 'rocket-plane', length: 6.02, span: 4.0, height: 2.25, w: 0.45, h: 0.45, intake: 'nose', wingPlan: [[0.5, 0], [0.5, 0.45], [0.5, 2.0], [-0.5, 2.0], [-0.5, 0.45], [-0.5, 0]], mount: 0, fin: [[-2.0, -0.9], [-2.6, -0.9], [-3.0, 0.9], [-2.4, 0.9]], tail: [[-2.2, 0], [-2.6, 1.0], [-3.0, 1.0], [-3.0, 0]], planeUp: 0, canopy: { x: 1.0, length: 0.8, kind: 'framed' } }) };

// ---------------------------------------------------------------- four-engined bombers and the Hampden

// Short Stirling: a long slab-sided body, a short broad mid wing with four Hercules, a tall single fin (26.59 x 30.2 x 6.93 m).
A['stirling'] = mp({ hood: { front: 10.6, back: 8.4 }, glazed: 12.0, cls: 'ww2-heavy-bomber', length: 26.59, span: 30.2, height: 6.93, body: [[13.3, 0.3, -0.6, 0.5], [12.6, 1.0, -1.1, 0.9], [11.0, 1.4, -1.4, 1.0], [9.8, 1.75, -1.45, 1.0], [-6, 1.6, -1.45, 1.0], [-11, 1.2, -0.6, 0.75], [-13.3, 0.8, 0.2, 0.4]], round: 3.2, wing: [[0, 3.0, -2.8], [15.1, 1.0, -0.6]], tipR: 0.5, wingUp: -0.2, dihedral: 4, nacelles: [{ y: 4.4, x: 4.6, back: -2.6, r: 0.75, z: -0.2, kind: 'radial', below: 0.4 }, { y: 8.4, x: 4.0, back: -2.0, r: 0.75, z: 0.1, kind: 'radial', below: 0.4 }], prop: [4.0, 3], fin: [[-7, 1.6], [-9.6, 2.5], [-11.6, 5.4], [-12.8, 5.6], [-13.4, 5.0], [-13.3, 1.0]], tail: [[0, -10.2, -13.0], [5.6, -11.4, -12.9]], tailR: 0.4, tailUp: 0.8, extra: [dome(-1.5, 1.6, 0.5, 1.2)] });
// Handley Page Halifax B Mk III: a deep body with the nose glazing, four Hercules, big square twin fins (21.82 x 31.75 x 6.32 m).
A['halifax'] = mp({ hood: { front: 8.6, back: 6.6 }, glazed: 9.6, cls: 'ww2-heavy-bomber', length: 21.82, span: 31.75, height: 6.32, body: [[10.91, 0.0, -0.5, 0.4], [10.3, 0.8, -0.9, 0.85], [9.0, 1.2, -1.2, 0.95], [7.8, 1.55, -1.3, 0.98], [-4, 1.45, -1.3, 0.95], [-8.5, 1.1, -0.6, 0.7], [-10.91, 0.8, 0.1, 0.35]], round: 3, wing: [[0, 3.0, -2.4], [15.88, 0.6, -0.8]], tipR: 0.5, wingUp: -0.1, dihedral: 4, nacelles: [{ y: 3.8, x: 4.4, back: -2.8, r: 0.72, z: -0.1, kind: 'radial', below: 0.2 }, { y: 7.8, x: 3.8, back: -2.4, r: 0.72, z: 0.2, kind: 'radial', below: 0.2 }], prop: [3.9, 3], fin: [[-8.3, -0.8], [-8.4, 2.2], [-8.8, 2.5], [-10.4, 2.5], [-10.6, 2.1], [-10.6, -0.8], [-10.2, -1.1], [-8.6, -1.1]], twin: 7.6, tail: [[0, -8.0, -10.4], [3.8, -8.2, -10.4]], tailUp: 0.6, extra: [dome(-1.0, 1.45, 0.55, 1.2)] });
// Pe-8: four inlines in long nacelles (gunners in the inboard ones), a mid-low wing, a single fin (23.59 x 39.13 x 6.2 m).
A['pe-8'] = mp({ hood: { front: 9.4, back: 7.6 }, glazed: 10.6, cls: 'ww2-heavy-bomber', length: 23.59, span: 39.13, height: 6.2, body: [[11.8, 0.0, -0.6, 0.4], [11.2, 0.8, -1.0, 0.9], [9.8, 1.3, -1.25, 1.0], [8.6, 1.6, -1.3, 1.05], [-5, 1.45, -1.25, 1.0], [-9.5, 1.1, -0.5, 0.7], [-11.8, 0.8, 0.1, 0.3]], wing: [[0, 3.4, -3.4], [19.57, 0.4, -1.2]], tipR: 0.6, wingUp: -0.4, dihedral: 3, nacelles: [{ y: 4.6, x: 5.4, back: -4.0, r: 0.7, z: -0.4, below: 0.2 }, { y: 9.4, x: 4.6, back: -1.6, r: 0.6, z: 0.05, below: 0.2 }], prop: [4.1, 3], fin: [[-6, 1.4], [-9.0, 2.2], [-10.8, 4.8], [-11.6, 5.0], [-12.0, 4.4], [-11.8, 0.8]], tail: [[0, -9.0, -11.8], [6.0, -10.2, -11.6]], tailR: 0.4, tailUp: 0.7, extra: [dome(2, 1.6, 0.5, 1.2)] });
// Fw 200 Condor: a slim round body with the ventral gondola, a long low wing, four BMW 132 radials (23.45 x 32.85 x 6.3 m).
A['fw-200'] = mp({ hood: { front: 10.4, back: 8.4 }, cls: 'ww2-heavy-bomber', length: 23.45, span: 32.85, height: 6.3, body: [[11.73, -0.1, -0.6, 0.3], [11.2, 0.65, -0.95, 0.8], [10.0, 1.1, -1.15, 1.05], [8.8, 1.4, -1.2, 1.1], [-6, 1.3, -1.15, 1.05], [-10, 0.95, -0.4, 0.6], [-11.73, 0.7, 0.1, 0.2]], round: 2.2, wing: [[0, 3.4, -2.4], [16.43, 0.6, -0.6]], tipR: 0.6, wingUp: -0.75, dihedral: 6, nacelles: [{ y: 3.6, x: 4.6, back: -1.2, r: 0.68, z: -0.6, kind: 'radial' }, { y: 7.4, x: 4.0, back: -0.8, r: 0.68, z: -0.2, kind: 'radial' }], prop: [3.3, 3], fin: [[-6.5, 1.2], [-9.0, 1.8], [-10.6, 4.4], [-11.4, 4.5], [-11.9, 3.8], [-11.73, 0.7]], tail: [[0, -8.8, -11.5], [5.4, -9.8, -11.4]], tailR: 0.5, tailUp: 0.6, extra: [{ top: [[7, -0.9], [-1, -0.9]], bottom: [[7, -1.2], [6, -1.65], [0, -1.6], [-1, -1.1]], plan: [[7, 0.3], [6, 0.5], [0, 0.45], [-1, 0.2]], round: 3, stations: 6 }, dome(4, 1.4, 0.5, 1.2)] });
// Piaggio P.108B: four radials, a deep body, a single fin, remote turrets on the outer nacelles (22.92 x 32.0 x 6.0 m).
A['p-108'] = mp({ hood: { front: 9.8, back: 7.6 }, glazed: 10.6, cls: 'ww2-heavy-bomber', length: 22.92, span: 32.0, height: 6.0, body: [[11.46, 0.0, -0.5, 0.4], [10.8, 0.9, -0.9, 0.9], [9.4, 1.25, -1.2, 1.0], [8.0, 1.55, -1.3, 1.0], [-5, 1.4, -1.2, 1.0], [-9.5, 1.0, -0.5, 0.65], [-11.46, 0.7, 0.1, 0.25]], wing: [[0, 3.2, -2.6], [16, 0.6, -0.8]], tipR: 0.5, wingUp: -0.2, dihedral: 5, nacelles: [{ y: 4.0, x: 4.6, back: -2.2, r: 0.72, z: -0.2, kind: 'radial' }, { y: 8.2, x: 4.0, back: -1.8, r: 0.72, z: 0.2, kind: 'radial' }], prop: [3.8, 3], fin: [[-6.5, 1.3], [-9, 2.0], [-10.6, 4.6], [-11.3, 4.7], [-11.6, 4.0], [-11.46, 0.7]], tail: [[0, -8.8, -11.4], [5.4, -9.6, -11.3]], tailR: 0.4, tailUp: 0.6, extra: [dome(0.6, 0.95, 0.35, 0.9, 1, 8.2)] });
// TB-3: a corrugated monoplane giant, a thick low wing with four inlines, fixed wheels, a single fin (24.4 x 41.8 x 8.5 m).
A['tb-3'] = mp({ cls: 'ww2-heavy-bomber', length: 24.4, span: 41.8, height: 8.5, body: [[12.2, 0.2, -0.8, 0.6], [11.0, 1.1, -1.2, 0.9], [8, 1.4, -1.4, 1.0], [-4, 1.1, -1.0, 0.8], [-12.2, 0.5, 0.1, 0.15]], round: 4, wing: [[0, 4.0, -4.0], [20.9, 1.0, -1.0]], tipR: 0.4, wingUp: -0.6, dihedral: 3, nacelles: [{ y: 4.4, x: 5.4, back: 1.4, r: 0.55, z: -0.4 }, { y: 9.6, x: 4.8, back: 1.2, r: 0.55, z: -0.1 }], prop: [4.0, 2], fin: [[-8.8, 1.0], [-10.6, 1.4], [-11.6, 3.5], [-12.2, 3.5], [-12.2, 0.4]], tail: [[0, -9.4, -12.0], [5.6, -10.0, -12.0]], tailUp: 0.8, extra: [...wheel(3.0, 4.4, -1.1, -3.4, 0.75)] });
// G8N Renzan: four radials, a mid wing, a tall single fin (22.94 x 32.54 x 7.2 m).
A['g8n'] = mp({ hood: { front: 9.8, back: 7.6 }, glazed: 10.6, cls: 'ww2-heavy-bomber', length: 22.94, span: 32.54, height: 7.2, body: [[11.47, 0.0, -0.6, 0.4], [10.8, 0.9, -1.05, 0.95], [9.4, 1.35, -1.3, 1.05], [8.0, 1.6, -1.35, 1.1], [-5, 1.45, -1.3, 1.05], [-9.5, 1.1, -0.5, 0.7], [-11.47, 0.8, 0.1, 0.3]], wing: [[0, 3.4, -2.6], [16.27, 0.4, -0.9]], tipR: 0.5, wingUp: -0.1, dihedral: 4, nacelles: [{ y: 4.0, x: 4.6, back: -2.4, r: 0.75, z: -0.1, kind: 'radial' }, { y: 8.0, x: 4.0, back: -2.0, r: 0.75, z: 0.2, kind: 'radial' }], prop: [3.6, 4], fin: [[-6, 1.4], [-9.0, 2.4], [-10.4, 5.2], [-11.2, 5.4], [-11.6, 4.8], [-11.47, 0.8]], tail: [[0, -8.8, -11.4], [5.0, -9.8, -11.3]], tailR: 0.4, tailUp: 0.7 });
// Hampden: the "flying suitcase" - a deep narrow front body, a thin boom to twin fins, two Pegasus radials (16.33 x 21.08 x 4.55 m).
A['hampden'] = mp({ hood: { front: 6.6, back: 3.2 }, glazed: 7.0, cls: 'ww2-bomber', length: 16.33, span: 21.08, height: 4.55, body: [[8.17, 0.0, -0.6, 0.4], [7.6, 0.7, -0.95, 0.55], [6.2, 1.3, -1.25, 0.55], [4.2, 1.35, -1.3, 0.55], [1.0, 1.2, -1.25, 0.55], [-0.5, 0.9, -0.6, 0.4], [-2.0, 0.6, 0.1, 0.25], [-7.9, 0.5, 0.25, 0.18], [-8.17, 0.45, 0.25, 0.1]], round: 3, wing: [[0, 2.8, -1.8], [10.54, 0.6, -0.4]], tipR: 0.4, wingUp: -0.2, dihedral: 6, nacelles: [{ y: 2.9, x: 4.0, back: -1.6, r: 0.72, z: -0.2, kind: 'radial' }], prop: [3.5, 3], fin: [[-6.9, -0.6], [-7.0, 1.5], [-7.4, 1.8], [-8.0, 1.8], [-8.17, 1.4], [-8.17, -0.6], [-7.9, -0.9], [-7.1, -0.9]], twin: 4.6, tail: [[0, -6.6, -8.1], [2.3, -6.8, -8.1]], tailUp: 0.4 });

// ---------------------------------------------------------------- Japanese and Italian fighters and attack aircraft

const SM = { cls: 'ww2-fighter', roundFin: true };
// Ki-43 Hayabusa: a slim radial with a long, light round-tipped wing and the bubble (8.92 x 10.84 x 3.27 m).
A['ki-43'] = one({ ...SM, length: 8.92, span: 10.84, height: 3.27, w: 0.55, h: 0.62, radial: true, wing: 'round', le: 1.5, root: 2.3, tip: 1.0, sweep: 3, dihedral: 6, fin: 1.3, finRoot: 1.3, tailSpan: 3.4, tailRoot: 0.9, canopy: { x: -0.4, length: 1.5, kind: 'bubble' }, prop: 2.9, blades: 3 });
// Ki-61 Hien: an inline (Ha-40) with a long nose, the radiator under the body, a long high-aspect wing (8.94 x 12.0 x 3.7 m); Ki-100 the same airframe with a radial (8.82 m).
A['ki-61'] = one({ ...SM, length: 8.94, span: 12.0, height: 3.7, w: 0.5, h: 0.62, wing: 'tapered', le: 1.5, root: 2.4, tip: 1.0, sweep: 3, dihedral: 6, fin: 1.4, finRoot: 1.4, tailSpan: 3.6, tailRoot: 1.0, canopy: { x: -0.3, length: 1.5, kind: 'framed' }, razor: true, prop: 3.0, blades: 3, scoop: [-0.6, 1.4, 0.3] });
A['ki-100'] = one({ ...SM, length: 8.82, span: 12.0, height: 3.75, w: 0.6, h: 0.66, radial: true, wing: 'tapered', le: 1.5, root: 2.4, tip: 1.0, sweep: 3, dihedral: 6, fin: 1.4, finRoot: 1.4, tailSpan: 3.6, tailRoot: 1.0, canopy: { x: -0.3, length: 1.5, kind: 'bubble' }, prop: 3.0, blades: 3 });
// Ki-44 Shoki: a stubby radial interceptor with a short wing (8.84 x 9.45 x 3.25 m).
A['ki-44'] = one({ ...SM, length: 8.84, span: 9.45, height: 3.25, w: 0.62, h: 0.68, radial: true, wing: 'tapered', le: 1.4, root: 2.2, tip: 1.0, sweep: 3, dihedral: 6, fin: 1.3, finRoot: 1.3, tailSpan: 3.4, tailRoot: 0.95, canopy: { x: -0.2, length: 1.5, kind: 'bubble' }, prop: 2.95, blades: 3 });
// N1K2-J Shiden-Kai: a radial with a mid wing and the framed canopy on a raised spine (9.38 x 11.99 x 3.96 m).
A['n1k2'] = one({ ...SM, length: 9.38, span: 11.99, height: 3.96, w: 0.65, h: 0.72, radial: true, wing: 'tapered', le: 1.6, root: 2.5, tip: 1.1, sweep: 3, mount: -0.3, dihedral: 5, fin: 1.5, finRoot: 1.5, tailSpan: 4.2, tailRoot: 1.1, canopy: { x: -0.3, length: 1.6, kind: 'framed' }, razor: true, prop: 3.3, blades: 4 });
// J2M Raiden: a fat body behind a long radial cowl, the small canopy set well back (9.95 x 10.8 x 3.95 m).
A['j2m'] = one({ ...SM, length: 9.95, span: 10.8, height: 3.95, w: 0.72, h: 0.8, radial: true, wing: 'tapered', le: 1.6, root: 2.4, tip: 1.1, sweep: 3, dihedral: 6, fin: 1.45, finRoot: 1.5, tailSpan: 4.2, tailRoot: 1.1, canopy: { x: -1.0, length: 1.4, kind: 'framed' }, razor: true, prop: 3.3, blades: 4 });
// A7M Reppu: the Zero's big successor, a long wing and the bubble (10.99 x 14.0 x 4.28 m).
A['a7m'] = one({ ...SM, length: 10.99, span: 14.0, height: 4.28, w: 0.68, h: 0.75, radial: true, wing: 'round', le: 1.8, root: 2.8, tip: 1.2, sweep: 3, dihedral: 6, fin: 1.6, finRoot: 1.6, tailSpan: 4.6, tailRoot: 1.2, canopy: { x: -0.3, length: 1.6, kind: 'bubble' }, prop: 3.6, blades: 4 });
// B6N Tenzan: a radial torpedo bomber with the long three-seat greenhouse and a forward-raked fin (10.87 x 14.89 x 3.8 m).
A['b6n'] = one({ cls: 'ww2-attack', length: 10.87, span: 14.89, height: 3.8, w: 0.65, h: 0.8, radial: true, wing: 'tapered', le: 2.0, root: 3.1, tip: 1.2, sweep: 3, dihedral: 6, fin: 1.6, finRoot: 1.6, tailSpan: 4.8, tailRoot: 1.2, canopy: { x: -0.4, length: 3.8, kind: 'framed' }, razor: true, prop: 3.4, blades: 4, finOutline: [[-5.435 + 1.6, 0], [-5.435 + 0.05, 0], [-5.435 + 0.25, 1.6], [-5.435 + 1.1, 1.6]] });
// D4Y Suisei: a slim inline dive bomber with the long two-seat greenhouse (10.22 x 11.5 x 3.74 m).
A['d4y'] = one({ cls: 'ww2-attack', length: 10.22, span: 11.5, height: 3.74, w: 0.5, h: 0.65, wing: 'tapered', le: 1.6, root: 2.6, tip: 1.1, sweep: 3, dihedral: 6, fin: 1.45, finRoot: 1.5, roundFin: true, tailSpan: 3.9, tailRoot: 1.0, canopy: { x: -0.4, length: 3.0, kind: 'framed' }, razor: true, prop: 3.2, blades: 3 });
// B7A Ryusei: an inverted gull wing on a big radial attack aircraft (11.49 x 14.4 x 4.07 m).
A['b7a'] = one({ cls: 'ww2-attack', length: 11.49, span: 14.4, height: 4.07, w: 0.65, h: 0.8, radial: true, wing: 'round', le: 1.8, root: 3.0, tip: 1.3, sweep: 3, gull: true, mount: -0.9, dihedral: 9, fin: 1.6, finRoot: 1.7, roundFin: true, tailSpan: 4.8, tailRoot: 1.2, canopy: { x: -0.2, length: 2.8, kind: 'framed' }, razor: true, prop: 3.5, blades: 4 });
// Re.2000 Falco I: a radial with a round-tipped wing and the framed canopy (7.99 x 11.0 x 3.2 m); Re.2001: the DB 601 inline, a radiator under the wings (8.36 m); Re.2005: the longer DB 605 nose (8.73 m).
A['re-2000'] = one({ ...SM, length: 7.99, span: 11.0, height: 3.2, w: 0.62, h: 0.7, radial: true, wing: 'round', le: 1.5, root: 2.5, tip: 1.1, sweep: 3, dihedral: 6, fin: 1.3, finRoot: 1.3, tailSpan: 3.6, tailRoot: 1.0, canopy: { x: -0.4, length: 1.5, kind: 'framed' }, razor: true, prop: 3.05, blades: 3 });
A['re-2001'] = one({ ...SM, length: 8.36, span: 11.0, height: 3.15, w: 0.5, h: 0.62, wing: 'round', le: 1.5, root: 2.5, tip: 1.1, sweep: 3, dihedral: 6, fin: 1.3, finRoot: 1.3, tailSpan: 3.6, tailRoot: 1.0, canopy: { x: -0.4, length: 1.5, kind: 'framed' }, razor: true, prop: 3.0, blades: 3, scoop: [-0.2, 1.2, 0.25] });
A['re-2005'] = one({ ...SM, length: 8.73, span: 11.0, height: 3.15, w: 0.5, h: 0.62, wing: 'round', le: 1.4, root: 2.5, tip: 1.0, sweep: 3, dihedral: 6, fin: 1.4, finRoot: 1.4, tailSpan: 3.6, tailRoot: 1.0, canopy: { x: -0.5, length: 1.5, kind: 'framed' }, razor: true, prop: 3.0, blades: 3, scoop: [-0.4, 1.2, 0.25] });
// MC.205 Veltro: the MC.202 with the longer DB 605 nose and its two chin oil coolers (8.85 x 10.58 x 3.04 m).
A['mc-205'] = one({ ...SM, length: 8.85, span: 10.58, height: 3.04, w: 0.48, h: 0.62, wing: 'round', le: 1.3, root: 2.3, tip: 1.1, sweep: 3, fin: 1.3, finRoot: 1.3, tailSpan: 3.2, tailRoot: 0.9, canopy: { x: -0.5, length: 1.4, kind: 'framed' }, razor: true, prop: 3.05, blades: 3, scoop: [0.0, 1.2, 0.3], bodies: [bulge(3.6, 2.6, -0.42, 0.12, 0.12, 0.25)] });
// G.55 Centauro: an inline with a long body, a big ventral radiator, a tall fin (9.37 x 11.85 x 3.77 m).
A['g-55'] = one({ ...SM, length: 9.37, span: 11.85, height: 3.77, w: 0.52, h: 0.66, wing: 'tapered', le: 1.5, root: 2.6, tip: 1.1, sweep: 3, dihedral: 6, fin: 1.55, finRoot: 1.5, tailSpan: 3.8, tailRoot: 1.0, canopy: { x: -0.4, length: 1.5, kind: 'framed' }, razor: true, prop: 3.1, blades: 3, scoop: [-0.4, 1.6, 0.35] });
// G.50 Freccia and MC.200 Saetta: stubby radials with the cockpit on a raised hump (G.50 7.8 x 10.98 x 3.28 m; MC.200 8.19 x 10.58 x 3.05 m).
A['g-50'] = one({ ...SM, length: 7.8, span: 10.98, height: 3.28, w: 0.62, h: 0.7, radial: true, wing: 'tapered', le: 1.4, root: 2.4, tip: 1.1, sweep: 3, dihedral: 6, fin: 1.3, finRoot: 1.3, tailSpan: 3.6, tailRoot: 1.0, canopy: { x: -0.2, length: 1.4, kind: 'bubble' }, razor: true, prop: 2.9, blades: 3 });
A['mc-200'] = one({ ...SM, length: 8.19, span: 10.58, height: 3.05, w: 0.62, h: 0.7, radial: true, wing: 'round', le: 1.4, root: 2.3, tip: 1.1, sweep: 3, fin: 1.3, finRoot: 1.3, tailSpan: 3.4, tailRoot: 0.9, canopy: { x: -0.2, length: 1.4, kind: 'bubble' }, razor: true, prop: 3.05, blades: 3 });

// ---------------------------------------------------------------- multi-engined types from a few numbers

interface Tw {
  cls: string;
  length: number;
  span: number;
  height: number;
  /** The body's half-width and half-depth at its widest. */
  w: number;
  h: number;
  /**
   * glazed: a stepless glass nose (He 111, Il-4); stepped: a glass nose under a stepped cockpit (B-25); solid: a
   * solid nose under the stepped cockpit; cockpit: the crew's glazing is the nose itself (Ju 88, He 219).
   */
  nose: 'glazed' | 'stepped' | 'solid' | 'cockpit';
  /** The windscreen's distance behind the nose tip and the hood's length (defaults 0.2 and 0.15 of the length). */
  cockpit?: number;
  hoodLen?: number;
  radial?: boolean;
  /** Engines: out along the half span (default 0.27), the nacelle's radius, its back as a share of the root chord behind the leading edge (default 1.0); a second pair out at `outer` (four engines). */
  nacY?: number;
  nacR?: number;
  nacBack?: number;
  outer?: number;
  /** A third engine in the nose (trimotors). */
  noseEngine?: boolean;
  /** Wing: root and tip chords (default 14 % and 5.5 % of the span), its height as a share of h (-1 low, 1 high), dihedral, the root's leading edge. */
  root?: number;
  tip?: number;
  wingZ?: number;
  dihedral?: number;
  le?: number;
  /** Twin fins on the tailplane's tips; the fin's height above the tail; the tailplane's span. */
  twinTail?: boolean;
  finH?: number;
  tailSpan?: number;
  prop: [number, number];
  /** Turret domes on top and under the body, at these forward positions. */
  turrets?: number[];
  belly?: number[];
  /** A flying boat's hull: deep, the step under the wing, the rear swept up to the tail. */
  boat?: boolean;
  extra?: Outline[];
}

/**
 * A twin- or four-engined aircraft from its published size and a few judged proportions (estimates): the
 * body's girth, the cockpit and nose, the nacelles' size and place, the tail.
 */
function tw(o: Tw): Spec {
  const L = o.length;
  const n = L / 2;
  const t = -n;
  const { h, w } = o;
  const hl = o.hoodLen ?? Math.min(2.6, L * 0.15);
  const xw = n - (o.cockpit ?? L * 0.2);
  const nose: Row[] = o.noseEngine
    ? [[n, 0.7 * h, -0.7 * h, 0.7 * w], [n - 0.3, 0.8 * h, -0.8 * h, 0.8 * w], [n - L * 0.1, 0.85 * h, -0.95 * h, 0.9 * w], [xw + 0.1, 0.8 * h, -h, w], [xw - 0.3, h + 0.45, -h, w], [xw - hl + 0.2, h + 0.4, -h, w], [xw - hl - 0.4, h, -h, w]]
    : o.nose === 'glazed'
    ? [[n, 0.05 * h, -0.35 * h, 0.25 * w], [n - 0.35, 0.55 * h, -0.75 * h, 0.65 * w], [n - L * 0.07, 0.85 * h, -0.95 * h, 0.88 * w], [n - L * 0.14, h, -h, w]]
    : o.nose === 'cockpit'
    ? [[n, 0.1 * h, -0.5 * h, 0.35 * w], [n - 0.4, 0.75 * h, -0.85 * h, 0.75 * w], [n - 0.9, h + 0.3, -h, 0.95 * w], [n - 0.9 - hl, h + 0.3, -h, w], [n - 1.4 - hl, h, -h, w]]
    : [[n, -0.1 * h, -0.5 * h, 0.25 * w], [n - 0.4, 0.4 * h, -0.8 * h, 0.65 * w], [n - L * 0.08, 0.6 * h, -0.95 * h, 0.88 * w], [xw + 0.1, 0.72 * h, -h, w], [xw - 0.3, h + 0.45, -h, w], [xw - hl + 0.2, h + 0.4, -h, w], [xw - hl - 0.4, h, -h, w]];
  const root = o.root ?? o.span * 0.14;
  const tip = o.tip ?? o.span * 0.055;
  const le = o.le ?? root * 0.6 + L * 0.02;
  const s = o.span / 2;
  const sw = (root - tip) * 0.3;
  const step = le - root * 0.85;
  const rest: Row[] = o.boat
    ? [[Math.min(-0.05 * L, step + 1), h, -1.25 * h, w], [step, h, -1.25 * h, w], [step - 0.05, h, -0.9 * h, w], [t + L * 0.25, 0.9 * h, 0.0, 0.6 * w], [t + 0.5, 0.85 * h, 0.55 * h, 0.2 * w], [t, 0.8 * h, 0.7 * h, 0.1 * w]]
    : [[-0.08 * L, h, -h, w], [t + L * 0.22, 0.72 * h, -0.5 * h, 0.66 * w], [t + 0.6, 0.5 * h, 0.05 * h, 0.22 * w], [t, 0.45 * h, 0.2 * h, 0.1 * w]];
  const body = [...nose, ...rest.filter(([x]) => x < nose[nose.length - 1][0] - 0.2)];
  const wz = (o.wingZ ?? -0.3) * h;
  const dih = o.dihedral ?? 5;
  const r = o.nacR ?? (o.radial ? Math.max(0.55, o.span * 0.036) : Math.max(0.48, o.span * 0.03));
  const kind = o.radial ? ('radial' as const) : ('inline' as const);
  const nacs: Nac[] = [{ y: (o.nacY ?? 0.27) * s, x: le + r * 2.6, back: le - root * (o.nacBack ?? 1.0), r, z: wz, kind, below: 0.15 }];
  if (o.outer) {
    const y = o.outer * s;
    const l2 = le - (sw * y) / s;
    const c2 = root - ((root - tip) * y) / s;
    nacs.push({ y, x: l2 + r * 2.4, back: l2 - c2 * 0.9, r, z: wz + y * Math.tan((dih * Math.PI) / 180), kind, below: 0.15 });
  }
  const fc = L * 0.12;
  const fh = o.finH ?? Math.max(1.2, o.height * 0.42);
  const top = 0.55 * h;
  const fin: P2[] = o.twinTail
    ? [[t + fc * 0.9, -fh * 0.25], [t + fc * 0.9, fh * 0.75], [t + fc * 0.7, fh], [t + 0.15, fh], [t, fh * 0.8], [t, -fh * 0.35], [t + 0.2, -fh * 0.45], [t + fc * 0.7, -fh * 0.4]]
    : [[t + fc * 1.4, top], [t + fc * 0.75, top + fh * 0.35], [t + fc * 0.45, top + fh], [t + 0.12, top + fh * 0.98], [t - 0.05, top + fh * 0.6], [t + 0.05, 0.3 * h]];
  const ts = o.tailSpan ?? o.span * 0.33;
  const tc = L * 0.09;
  const ex: Outline[] = [...(o.turrets ?? []).map((x) => dome(x, h * 0.95, 0.45, 1.1)), ...(o.belly ?? []).map((x) => dome(x, -h * 0.95, 0.45, 1.1, -1)), ...(o.extra ?? [])];
  const cockpitNose = o.nose === 'cockpit';
  return mp({
    cls: o.cls, length: L, span: o.span, height: o.height,
    body, round: o.boat ? [[n, 2.4], [step, 3], [t, 2.4]] : 2.3,
    hood: o.nose === 'glazed' || cockpitNose ? undefined : { front: xw, back: xw - hl },
    glazed: o.nose === 'glazed' || o.nose === 'stepped' ? n - L * 0.1 : cockpitNose ? n - 1.0 - hl : undefined,
    wing: [[0, le, le - root], [s, le - sw, le - sw - tip]], tipR: tip * 0.4, wingUp: wz, dihedral: dih,
    nacelles: nacs,
    noseProp: o.noseEngine ? n + 0.1 : undefined,
    prop: o.prop,
    fin, twin: o.twinTail ? ts * 0.95 : undefined,
    tail: [[0, t + tc + 0.3, t + 0.3], [ts / 2, t + tc * 0.7 + 0.3, t + 0.35]], tailR: tc * 0.3, tailUp: o.twinTail ? 0.4 * h : 0.45 * h,
    extra: ex,
  });
}

// Twin-engined fighters and fighter-bombers. Me 210: the Me 410's forerunner, mapped to it.
// Do 335 Pfeil: push-pull, one engine in the nose and one driving the tail propeller behind the cruciform tail (13.85 x 13.8 x 5.0 m).
A['do-335'] = mp({
  cls: 'ww2-heavy-fighter', length: 13.85, span: 13.8, height: 5.0,
  body: [[6.92, 0.55, -0.55, 0.55], [6.5, 0.65, -0.7, 0.62], [5.0, 0.7, -0.8, 0.65], [3.6, 0.72, -0.8, 0.62], [3.1, 1.15, -0.8, 0.6], [1.4, 1.1, -0.8, 0.6], [0.8, 0.72, -0.8, 0.62], [-2.5, 0.65, -0.65, 0.58], [-5.4, 0.45, -0.4, 0.4], [-6.6, 0.35, -0.3, 0.3]],
  hood: { front: 3.2, back: 1.3 },
  wing: [[0, 1.6, -1.9], [6.9, 0.4, -0.9]], tipR: 0.3, wingUp: -0.35, dihedral: 4,
  nacelles: [{ y: 0, x: -6.0, back: -6.6, r: 0.3, z: 0, propX: -6.85 }],
  noseProp: 7.0,
  prop: [3.5, 3],
  fin: [[-4.6, -1.6], [-5.6, -1.7], [-6.2, -0.6], [-6.2, 0.6], [-5.6, 1.9], [-4.6, 1.8], [-4.4, 0.0]],
  tail: [[0, -4.4, -6.0], [2.6, -5.0, -5.9]], tailR: 0.3, tailUp: 0,
});
// F7F Tigercat: a slim body with the cockpit over the wing's leading edge, big radials in long nacelles, a tall single fin (13.83 x 15.7 x 4.83 m).
A['f7f'] = tw({ cls: 'ww2-heavy-fighter', length: 13.83, span: 15.7, height: 4.83, w: 0.62, h: 0.75, nose: 'solid', cockpit: 4.6, hoodLen: 1.6, radial: true, nacR: 0.72, nacY: 0.3, nacBack: 1.2, wingZ: 0.1, dihedral: 4, finH: 2.6, prop: [4.0, 3] });
// He 219 Uhu: the cockpit glazing at the very nose, annular-cowled engines, a high wing and twin fins (15.33 x 18.5 x 4.1 m).
A['he-219'] = tw({ cls: 'ww2-heavy-fighter', length: 15.33, span: 18.5, height: 4.1, w: 0.62, h: 0.8, nose: 'cockpit', hoodLen: 2.2, radial: true, nacR: 0.65, nacY: 0.27, nacBack: 1.3, wingZ: 0.4, dihedral: 4, twinTail: true, finH: 1.7, tailSpan: 6.0, prop: [3.6, 3] });
// J1N1 Gekko: a long greenhouse over a slim body, radials, a single fin (12.18 x 16.98 x 4.56 m).
A['j1n1'] = tw({ cls: 'ww2-heavy-fighter', length: 12.18, span: 16.98, height: 4.56, w: 0.6, h: 0.75, nose: 'solid', cockpit: 2.2, hoodLen: 4.0, radial: true, nacR: 0.65, wingZ: 0, finH: 2.2, prop: [3.2, 3] });
// Ki-45 Toryu: a slim body under a long two-seat greenhouse, radials, a single fin (11.0 x 15.02 x 3.7 m); the Ki-96, Ki-102 and Ki-109 are its family.
A['ki-45'] = tw({ cls: 'ww2-heavy-fighter', length: 11.0, span: 15.02, height: 3.7, w: 0.55, h: 0.7, nose: 'solid', cockpit: 2.3, hoodLen: 3.0, radial: true, nacR: 0.62, wingZ: -0.2, finH: 1.9, prop: [3.0, 3] });
// Ki-83: a long slim fighter, the cockpit far forward, big radials, a single fin (12.5 x 15.5 x 4.6 m).
A['ki-83'] = tw({ cls: 'ww2-heavy-fighter', length: 12.5, span: 15.5, height: 4.6, w: 0.55, h: 0.7, nose: 'solid', cockpit: 2.6, hoodLen: 2.2, radial: true, nacR: 0.68, nacBack: 1.1, wingZ: -0.3, finH: 2.1, prop: [3.4, 4] });
// Whirlwind: a slim body with the bubble hood, Peregrines in long low nacelles, the tailplane high on the fin (9.83 x 13.72 x 3.2 m).
A['whirlwind'] = tw({ cls: 'ww2-heavy-fighter', length: 9.83, span: 13.72, height: 3.2, w: 0.48, h: 0.62, nose: 'solid', cockpit: 3.3, hoodLen: 1.5, nacR: 0.5, nacY: 0.24, nacBack: 1.1, wingZ: -0.4, finH: 1.7, tailSpan: 4.4, prop: [3.2, 3] });
A['whirlwind'] = { ...A['whirlwind'], tail: { ...A['whirlwind'].tail, planeUp: 1.6 } };
// Welkin: a very long, narrow wing, the pressure cabin's small bubble, Merlins, a single fin (12.67 x 21.34 x 4.83 m).
A['welkin'] = tw({ cls: 'ww2-heavy-fighter', length: 12.67, span: 21.34, height: 4.83, w: 0.55, h: 0.7, nose: 'solid', cockpit: 3.2, hoodLen: 1.4, nacR: 0.58, nacY: 0.22, root: 2.9, tip: 1.0, wingZ: 0.2, finH: 2.1, prop: [3.5, 4] });
// Ta 154: a high wing, annular-cowled Jumos, the cockpit at the front of a slim body, a single fin (12.45 x 16.3 x 3.5 m).
A['ta-154'] = tw({ cls: 'ww2-heavy-fighter', length: 12.45, span: 16.3, height: 3.5, w: 0.55, h: 0.72, nose: 'solid', cockpit: 1.8, hoodLen: 2.0, radial: true, nacR: 0.6, wingZ: 0.7, dihedral: 3, finH: 1.9, prop: [3.4, 3] });
// Potez 63: a slim body under a long greenhouse, small radials, twin fins (11.07 x 16.0 x 3.62 m).
A['potez-63'] = tw({ cls: 'ww2-heavy-fighter', length: 11.07, span: 16.0, height: 3.62, w: 0.5, h: 0.68, nose: 'solid', cockpit: 2.1, hoodLen: 3.6, radial: true, nacR: 0.55, wingZ: -0.3, twinTail: true, finH: 1.5, tailSpan: 4.8, prop: [2.9, 3] });
// Ro.57: a small single-seat twin with radials and a single fin (8.77 x 12.5 x 2.92 m).
A['ro-57'] = tw({ cls: 'ww2-heavy-fighter', length: 8.77, span: 12.5, height: 2.92, w: 0.48, h: 0.62, nose: 'solid', cockpit: 3.2, hoodLen: 1.4, radial: true, nacR: 0.58, wingZ: -0.4, finH: 1.5, prop: [2.8, 3] });
// Breda Ba.88 Lince: a slim body, the cockpit forward, radials under a shoulder wing, twin fins (10.79 x 15.6 x 3.1 m).
A['breda-88'] = tw({ cls: 'ww2-heavy-fighter', length: 10.79, span: 15.6, height: 3.1, w: 0.55, h: 0.7, nose: 'solid', cockpit: 2.8, hoodLen: 2.2, radial: true, nacR: 0.6, wingZ: 0.5, twinTail: true, finH: 1.4, tailSpan: 4.6, prop: [3.0, 3] });
// Br.693: the single-seat assault twin, the cockpit well back, radials, twin fins (9.67 x 15.36 x 3.19 m).
A['br-693'] = tw({ cls: 'ww2-attack', length: 9.67, span: 15.36, height: 3.19, w: 0.5, h: 0.65, nose: 'solid', cockpit: 3.0, hoodLen: 1.6, radial: true, nacR: 0.6, wingZ: -0.1, twinTail: true, finH: 1.3, tailSpan: 4.4, prop: [2.9, 3] });
// IA 58 Pucara: a tandem two-seat counter-insurgency twin, turboprops on a low wing, a T-tail (14.25 x 14.5 x 5.36 m).
A['ia-58'] = tw({ cls: 'attack', length: 14.25, span: 14.5, height: 5.36, w: 0.55, h: 0.75, nose: 'solid', cockpit: 3.1, hoodLen: 2.6, nacR: 0.5, nacY: 0.32, nacBack: 1.2, wingZ: -0.5, dihedral: 7, finH: 2.8, tailSpan: 4.6, prop: [2.6, 3] });
A['ia-58'] = { ...A['ia-58'], tail: { ...A['ia-58'].tail, planeUp: 0.4 + 2.7 } };

// Twin-engined bombers.
// Il-4 (DB-3F): a long pointed glazed nose, the stepped cockpit, radials, a single fin (14.8 x 21.44 x 4.1 m).
A['il-4'] = tw({ cls: 'ww2-bomber', length: 14.8, span: 21.44, height: 4.1, w: 0.62, h: 0.8, nose: 'stepped', cockpit: 3.2, hoodLen: 1.8, radial: true, nacR: 0.72, nacBack: 1.0, wingZ: -0.1, finH: 2.0, prop: [3.25, 3], turrets: [-1.6] });
// SB-2: a slim body with the glazed nose, the cockpit on top, inline engines with frontal radiators, a single fin (12.27 x 20.33 x 3.6 m); the Ar-2 dive bomber is its development.
A['sb-2'] = tw({ cls: 'ww2-bomber', length: 12.27, span: 20.33, height: 3.6, w: 0.5, h: 0.7, nose: 'stepped', cockpit: 2.6, hoodLen: 1.5, nacR: 0.55, nacBack: 0.9, wingZ: 0, finH: 1.9, prop: [3.25, 3], turrets: [-1.5] });
// Er-2: a long body with the cockpit offset forward, inline engines on a gull-ish wing, twin fins (16.42 x 23.0 x 4.82 m).
A['er-2'] = tw({ cls: 'ww2-bomber', length: 16.42, span: 23.0, height: 4.82, w: 0.6, h: 0.85, nose: 'stepped', cockpit: 3.3, hoodLen: 2.2, nacR: 0.62, nacBack: 1.1, wingZ: -0.2, twinTail: true, finH: 1.9, tailSpan: 6.6, prop: [3.6, 3], turrets: [-1.8] });
// Yak-4 (Yak-2): a slim body with the glazed nose and the cockpit forward, inlines, twin fins (10.18 x 14.0 x 3.85 m).
A['yak-4'] = tw({ cls: 'ww2-bomber', length: 10.18, span: 14.0, height: 3.85, w: 0.45, h: 0.62, nose: 'stepped', cockpit: 2.2, hoodLen: 1.8, nacR: 0.5, wingZ: -0.1, twinTail: true, finH: 1.3, tailSpan: 4.4, prop: [3.0, 3] });
// Ki-48: a glazed nose under the stepped cockpit, radials on a mid wing, a single fin (12.75 x 17.47 x 3.8 m).
A['ki-48'] = tw({ cls: 'ww2-bomber', length: 12.75, span: 17.47, height: 3.8, w: 0.55, h: 0.72, nose: 'stepped', cockpit: 2.9, hoodLen: 2.4, radial: true, nacR: 0.65, wingZ: 0, finH: 1.8, prop: [3.0, 3] });
// P1Y Ginga: a slim body with the glazed nose, radials, a mid wing, a single fin (15.0 x 20.0 x 4.3 m).
A['p1y1'] = tw({ cls: 'ww2-bomber', length: 15.0, span: 20.0, height: 4.3, w: 0.6, h: 0.8, nose: 'stepped', cockpit: 3.2, hoodLen: 2.6, radial: true, nacR: 0.65, wingZ: -0.1, finH: 2.0, prop: [3.3, 4] });
// He 177 Greif: a long body with the glazed nose, two coupled engines in great nacelles, a single fin (22.0 x 31.44 x 6.4 m).
A['he-177'] = tw({ cls: 'ww2-heavy-bomber', length: 22.0, span: 31.44, height: 6.4, w: 0.95, h: 1.25, nose: 'glazed', radial: true, nacR: 1.0, nacY: 0.3, nacBack: 1.05, wingZ: -0.1, finH: 3.0, prop: [4.5, 4], turrets: [3.0, -3.5] });
// LeO 451: a slim body with the glazed nose, radials, twin oval fins on the tailplane's tips (17.17 x 22.52 x 5.24 m).
A['leo-451'] = tw({ cls: 'ww2-bomber', length: 17.17, span: 22.52, height: 5.24, w: 0.62, h: 0.9, nose: 'stepped', cockpit: 4.6, hoodLen: 2.2, radial: true, nacR: 0.7, wingZ: -0.2, twinTail: true, finH: 2.0, tailSpan: 6.4, prop: [3.2, 3] });
// Martin B-10 (Model 139): a round body with the nose turret, two separate cockpits under long canopies, radials, a single fin (13.64 x 21.48 x 4.7 m).
A['b-10'] = tw({ cls: 'ww2-bomber', length: 13.64, span: 21.48, height: 4.7, w: 0.6, h: 0.78, nose: 'stepped', cockpit: 3.2, hoodLen: 4.2, radial: true, nacR: 0.65, wingZ: -0.3, finH: 2.0, prop: [3.2, 3] });
// B-18 Bolo: the DC-2's wing on a deep bomber body with the glazed nose, radials, a single fin (17.62 x 27.28 x 4.62 m).
A['b-18'] = tw({ cls: 'ww2-bomber', length: 17.62, span: 27.28, height: 4.62, w: 0.8, h: 1.15, nose: 'stepped', cockpit: 3.6, hoodLen: 1.8, radial: true, nacR: 0.72, nacY: 0.22, wingZ: -0.5, finH: 2.2, prop: [3.4, 3], turrets: [-2.0] });
// Martin Maryland: a slim, very deep-chested body, radials on a mid wing, a single fin (14.22 x 18.69 x 4.57 m); the Baltimore is its family.
A['maryland'] = tw({ cls: 'ww2-bomber', length: 14.22, span: 18.69, height: 4.57, w: 0.48, h: 0.9, nose: 'stepped', cockpit: 3.6, hoodLen: 1.6, radial: true, nacR: 0.66, wingZ: 0, finH: 2.0, prop: [3.3, 3] });
// BR.20 Cicogna: a deep body with the glazed nose, radials, a dorsal turret, twin fins (16.17 x 21.56 x 4.3 m).
A['br-20'] = tw({ cls: 'ww2-bomber', length: 16.17, span: 21.56, height: 4.3, w: 0.7, h: 0.95, nose: 'stepped', cockpit: 3.4, hoodLen: 2.0, radial: true, nacR: 0.7, wingZ: -0.3, twinTail: true, finH: 1.8, tailSpan: 6.6, prop: [3.4, 3], turrets: [-1.0] });
// Ju 86 (the Swedish B3): a slim box body with the glazed nose, radials (the B3C's Pegasus), twin fins (17.87 x 22.5 x 4.7 m).
A['ju-86'] = tw({ cls: 'ww2-bomber', length: 17.87, span: 22.5, height: 4.7, w: 0.65, h: 0.95, nose: 'stepped', cockpit: 3.8, hoodLen: 1.8, radial: true, nacR: 0.68, wingZ: -0.6, twinTail: true, finH: 1.7, tailSpan: 7.2, prop: [3.3, 3], turrets: [-2.4] });
// Z.1007 bis Alcione: three radials (one in the nose), a deep body, twin fins (18.35 x 24.8 x 5.22 m).
A['z-1007'] = tw({ cls: 'ww2-bomber', length: 18.35, span: 24.8, height: 5.22, w: 0.7, h: 1.0, nose: 'solid', noseEngine: true, cockpit: 4.2, hoodLen: 2.2, radial: true, nacR: 0.65, nacY: 0.3, wingZ: -0.1, twinTail: true, finH: 2.0, tailSpan: 6.8, prop: [3.2, 3], turrets: [-0.6] });

// Four-engined bombers and flying boats.
// Me 264: a slim body with the stepless glazed nose, four BMW 801s on a long high-aspect wing, twin fins (20.11 x 39.4 x 4.29 m).
A['me-264'] = tw({ cls: 'ww2-heavy-bomber', length: 20.11, span: 39.4, height: 4.29, w: 0.95, h: 1.15, nose: 'glazed', radial: true, nacR: 0.72, nacY: 0.22, outer: 0.44, root: 4.6, tip: 1.6, wingZ: 0.4, dihedral: 3, twinTail: true, finH: 2.0, tailSpan: 8.0, prop: [3.6, 3] });
// G5N Shinzan: a big body with the glazed nose, four radials, twin fins (31.02 x 42.14 x 7.6 m).
A['g5n'] = tw({ cls: 'ww2-heavy-bomber', length: 31.02, span: 42.14, height: 7.6, w: 1.25, h: 1.6, nose: 'stepped', cockpit: 5.2, hoodLen: 2.6, radial: true, nacR: 0.85, nacY: 0.2, outer: 0.42, root: 5.8, tip: 2.0, wingZ: 0, dihedral: 4, twinTail: true, finH: 3.0, tailSpan: 10.6, prop: [3.6, 3], turrets: [5.0, -4.0] });
// Shackleton MR.2: the Lincoln's wing and tail on a deep body, four Griffons with contra-rotating propellers, a long nose (23.6 x 36.58 x 5.1 m).
A['shackleton'] = tw({ cls: 'ww2-heavy-bomber', length: 23.6, span: 36.58, height: 5.1, w: 0.95, h: 1.3, nose: 'stepped', cockpit: 5.6, hoodLen: 2.2, nacR: 0.75, nacY: 0.21, outer: 0.42, root: 5.6, tip: 1.6, wingZ: 0.1, dihedral: 4, twinTail: true, finH: 2.4, tailSpan: 10.0, prop: [4.0, 6], turrets: [1.0] });
// Short Sunderland: a deep two-deck boat hull, the high wing with four radials, a tall single fin (Mk V 26.0 x 34.39 x 10.52 m).
A['sunderland'] = tw({ cls: 'flying-boat', length: 26.0, span: 34.39, height: 10.52, w: 1.6, h: 2.0, nose: 'solid', cockpit: 4.4, hoodLen: 2.6, boat: true, radial: true, nacR: 0.75, nacY: 0.19, outer: 0.38, root: 6.0, tip: 2.4, wingZ: 0.9, dihedral: 3, finH: 4.6, tailSpan: 12.0, prop: [3.8, 3] });
// H8K "Emily": a deep, narrow boat hull, four radials on a high wing, a tall single fin (28.13 x 38.0 x 9.15 m).
A['h8k'] = tw({ cls: 'flying-boat', length: 28.13, span: 38.0, height: 9.15, w: 1.3, h: 1.95, nose: 'solid', cockpit: 5.0, hoodLen: 2.4, boat: true, radial: true, nacR: 0.75, nacY: 0.2, outer: 0.4, root: 6.0, tip: 2.0, wingZ: 0.95, dihedral: 3, finH: 4.8, tailSpan: 12.0, prop: [3.6, 4] });
// H6K "Mavis": a slim hull, the parasol wing on struts with four radials, twin fins (25.63 x 40.0 x 6.27 m).
A['h6k'] = tw({ cls: 'flying-boat', length: 25.63, span: 40.0, height: 6.27, w: 1.1, h: 1.3, nose: 'solid', cockpit: 4.6, hoodLen: 2.2, boat: true, radial: true, nacR: 0.6, nacY: 0.16, outer: 0.33, root: 4.8, tip: 2.0, wingZ: 2.6, dihedral: 0, twinTail: true, finH: 2.2, tailSpan: 9.0, prop: [3.4, 3],
  extra: [post(1.0, -1.8, 3.3, 1.2, 0.12, 0.9), post(0.6, -1.2, 3.3, 0.6, 0.06, 3.0, -0.3)] });
// PBM Mariner: a deep hull, the gull wing with two big radials, twin canted fins (24.4 x 35.97 x 8.38 m); the Be-6 has the same layout.
A['pbm'] = tw({ cls: 'flying-boat', length: 24.4, span: 35.97, height: 8.38, w: 1.25, h: 1.75, nose: 'solid', cockpit: 4.4, hoodLen: 2.4, boat: true, radial: true, nacR: 0.85, nacY: 0.26, root: 5.4, tip: 1.8, wingZ: 0.95, dihedral: 6, twinTail: true, finH: 2.8, tailSpan: 9.0, prop: [4.2, 3] });
A['be-6'] = tw({ cls: 'flying-boat', length: 23.5, span: 33.0, height: 7.64, w: 1.2, h: 1.7, nose: 'stepped', cockpit: 4.4, hoodLen: 2.2, boat: true, radial: true, nacR: 0.8, nacY: 0.26, root: 5.0, tip: 1.8, wingZ: 0.95, dihedral: 6, twinTail: true, finH: 2.6, tailSpan: 8.6, prop: [4.0, 4] });

// ---------------------------------------------------------------- more single-engined types

// FR-1 Fireball: a stubby radial fighter with a jet in its tail, the bubble, a straight wing (9.85 x 12.19 x 4.15 m).
A['fr-1-fireball'] = one({ cls: 'ww2-fighter', length: 9.85, span: 12.19, height: 4.15, w: 0.62, h: 0.72, radial: true, wing: 'square', le: 1.4, root: 2.6, tip: 1.3, sweep: 2, dihedral: 5, fin: 1.8, finRoot: 1.7, tailSpan: 4.6, tailRoot: 1.1, canopy: { x: 0.9, length: 1.7, kind: 'bubble' }, prop: 3.3, blades: 3 });
// BV 155 B: a high-altitude fighter with a very long, narrow wing, the radiators under it, the cockpit well back (12.0 x 20.33 x 3.0 m, height about).
A['bv-155'] = one({ cls: 'ww2-fighter', length: 12.0, span: 20.33, height: 3.0, w: 0.52, h: 0.66, wing: 'tapered', le: 1.0, root: 3.0, tip: 1.0, sweep: 3, dihedral: 5, fin: 1.8, finRoot: 1.8, roundFin: true, tailSpan: 5.0, tailRoot: 1.2, canopy: { x: -1.4, length: 1.6, kind: 'bubble' }, prop: 3.6, blades: 4, rads: [0.2, 2.4, 1.8, 0.35] });
// Su-2 (BB-1): a radial light bomber with the long two-seat greenhouse and the gunner's turret at its back, a mid-low wing (10.46 x 14.3 x 3.75 m).
A['su-2'] = one({ cls: 'ww2-attack', length: 10.46, span: 14.3, height: 3.75, w: 0.68, h: 0.8, radial: true, wing: 'tapered', le: 1.7, root: 3.0, tip: 1.3, sweep: 4, mount: -0.5, dihedral: 6, fin: 1.6, finRoot: 1.6, roundFin: true, tailSpan: 4.8, tailRoot: 1.2, canopy: { x: -0.4, length: 3.4, kind: 'framed' }, prop: 3.25, blades: 3 });
// I-185: a short, fat radial fighter, the framed hood on a raised spine (8.05 x 9.8 x 2.5 m).
A['i-185'] = one({ cls: 'ww2-fighter', length: 8.05, span: 9.8, height: 2.5, w: 0.66, h: 0.72, radial: true, wing: 'tapered', le: 1.4, root: 2.4, tip: 1.0, sweep: 3, dihedral: 5, fin: 1.2, finRoot: 1.3, roundFin: true, tailSpan: 3.6, tailRoot: 0.95, canopy: { x: -0.4, length: 1.5, kind: 'framed' }, razor: true, prop: 3.0, blades: 3 });
// Firecrest (B-48): the big Centaurus radial, an inverted gull wing, the bubble well forward (11.86 x 13.56 x 4.11 m).
A['firecrest'] = one({ cls: 'ww2-attack', length: 11.86, span: 13.56, height: 4.11, w: 0.68, h: 0.8, radial: true, wing: 'tapered', le: 1.8, root: 3.2, tip: 1.3, sweep: 3, gull: true, mount: -0.9, dihedral: 8, fin: 1.9, finRoot: 2.0, tailSpan: 5.2, tailRoot: 1.3, canopy: { x: 0.6, length: 1.7, kind: 'bubble' }, prop: 4.0, blades: 5 });
// MB 5: a long Griffon nose with contra-rotating propellers, the radiator under the body, the bubble (11.5 x 10.67 x 3.4 m).
A['mb-5'] = one({ cls: 'ww2-fighter', length: 11.5, span: 10.67, height: 3.4, w: 0.5, h: 0.68, wing: 'square', le: 1.3, root: 2.6, tip: 1.3, sweep: 1, dihedral: 5, fin: 1.7, finRoot: 1.8, tailSpan: 4.2, tailRoot: 1.1, canopy: { x: -0.8, length: 1.7, kind: 'bubble' }, prop: 3.6, blades: 6, scoop: [-1.4, 2.4, 0.36] });
// D.510: an inline monoplane with the radiator under its nose, the open cockpit, fixed spatted gear (7.94 x 12.09 x 2.42 m); the D.500 and D.501 look alike.
A['d-510'] = one({ cls: 'ww2-fighter', length: 7.94, span: 12.09, height: 2.42, w: 0.5, h: 0.62, wing: 'round', le: 1.2, root: 2.4, tip: 1.0, sweep: 3, dihedral: 4, fin: 1.2, finRoot: 1.2, roundFin: true, tailSpan: 3.4, tailRoot: 0.9, canopy: { x: -0.4, length: 0.8, kind: 'framed' }, hood: 0.3, prop: 2.9, blades: 3, gear: true, scoop: [2.6, 1.0, 0.35] });
// A-35 Vengeance: a big radial dive bomber with the long greenhouse and the W-shaped wing (12.12 x 14.63 x 4.67 m).
A['vengeance'] = one({ cls: 'ww2-attack', length: 12.12, span: 14.63, height: 4.67, w: 0.68, h: 0.9, radial: true, wing: 'tapered', le: 2.0, root: 3.4, tip: 1.3, sweep: -4, mount: -0.2, dihedral: 2, fin: 2.0, finRoot: 2.2, tailSpan: 5.4, tailRoot: 1.4, canopy: { x: 0.2, length: 4.0, kind: 'framed' }, prop: 3.6, blades: 3 });
// VG-33: a small inline fighter of wood, the radiator under the body, the framed hood on a razorback (8.55 x 10.8 x 3.31 m).
A['vg-33'] = one({ cls: 'ww2-fighter', length: 8.55, span: 10.8, height: 3.31, w: 0.46, h: 0.6, wing: 'tapered', le: 1.3, root: 2.3, tip: 1.0, sweep: 3, dihedral: 6, fin: 1.2, finRoot: 1.3, roundFin: true, tailSpan: 3.4, tailRoot: 0.9, canopy: { x: -0.3, length: 1.5, kind: 'framed' }, razor: true, prop: 3.0, blades: 3, scoop: [-0.3, 1.4, 0.3] });
// Saab 17: a radial dive bomber with the long two-seat greenhouse, the big main-gear fairings under the wing (9.8 x 13.7 x 4.0 m); the S 17BS on floats.
A['saab-17'] = one({ cls: 'ww2-attack', length: 9.8, span: 13.7, height: 4.0, w: 0.62, h: 0.78, radial: true, wing: 'tapered', le: 1.7, root: 2.9, tip: 1.2, sweep: 4, dihedral: 6, fin: 1.6, finRoot: 1.7, roundFin: true, tailSpan: 4.6, tailRoot: 1.2, canopy: { x: -0.2, length: 3.2, kind: 'framed' }, prop: 3.2, blades: 3, gear: true });
A['saab-17bs'] = { ...A['saab-17'], fixedGear: false, floats: true };
// FFVS J 22: a short, slim radial fighter of wood, the framed hood (7.8 x 10.0 x 3.6 m).
A['ffvs-j22'] = one({ cls: 'ww2-fighter', length: 7.8, span: 10.0, height: 3.6, w: 0.6, h: 0.66, radial: true, wing: 'tapered', le: 1.3, root: 2.2, tip: 1.0, sweep: 4, dihedral: 6, fin: 1.3, finRoot: 1.3, roundFin: true, tailSpan: 3.4, tailRoot: 0.9, canopy: { x: -0.2, length: 1.6, kind: 'framed' }, razor: true, prop: 2.9, blades: 3 });
// Seversky P-35 (the Swedish J 9): a radial fighter with a long framed canopy, a round-tipped wing (8.18 x 10.97 x 2.97 m).
A['p-35'] = one({ cls: 'ww2-fighter', length: 8.18, span: 10.97, height: 2.97, w: 0.62, h: 0.72, radial: true, wing: 'round', le: 1.5, root: 2.6, tip: 1.2, sweep: 3, dihedral: 6, fin: 1.4, finRoot: 1.4, roundFin: true, tailSpan: 4.0, tailRoot: 1.0, canopy: { x: -0.2, length: 2.4, kind: 'framed' }, razor: true, prop: 3.0, blades: 3 });
// P-43 Lancer: the P-35's successor with the turbocharger's duct under the body (8.68 x 10.97 x 4.27 m).
A['p-43'] = one({ cls: 'ww2-fighter', length: 8.68, span: 10.97, height: 4.27, w: 0.62, h: 0.78, radial: true, wing: 'round', le: 1.5, root: 2.6, tip: 1.2, sweep: 3, dihedral: 6, fin: 1.5, finRoot: 1.5, roundFin: true, tailSpan: 4.0, tailRoot: 1.0, canopy: { x: -0.1, length: 1.9, kind: 'framed' }, razor: true, prop: 3.2, blades: 3, scoop: [-0.6, 1.8, 0.3] });
// P-26 Peashooter: a wire-braced low wing, the open cockpit, the radial, fixed spatted gear (7.18 x 8.52 x 3.04 m).
A['p-26'] = one({ cls: 'ww2-fighter', length: 7.18, span: 8.52, height: 3.04, w: 0.55, h: 0.62, radial: true, wing: 'round', le: 1.1, root: 1.9, tip: 1.2, sweep: 2, dihedral: 6, fin: 1.1, finRoot: 1.1, roundFin: true, tailSpan: 3.0, tailRoot: 0.8, canopy: { x: -0.4, length: 0.8, kind: 'framed' }, hood: 0.35, razor: true, prop: 2.7, blades: 2, gear: true });
// A5M "Claude": an open-cockpit radial monoplane with an elliptic wing and fixed spatted gear (7.57 x 11.0 x 3.2 m).
A['a5m'] = one({ cls: 'ww2-fighter', length: 7.57, span: 11.0, height: 3.2, w: 0.55, h: 0.62, radial: true, wing: 'elliptic', le: 1.3, root: 2.2, tip: 0.5, dihedral: 4, fin: 1.2, finRoot: 1.2, roundFin: true, tailSpan: 3.4, tailRoot: 0.9, canopy: { x: -0.3, length: 0.9, kind: 'framed' }, hood: 0.35, razor: true, prop: 2.9, blades: 2, gear: true });
// Ki-43-I: the Hayabusa with its first two-bladed propeller (8.83 x 11.44 x 3.27 m).
A['ki-43-i'] = one({ ...SM, length: 8.83, span: 11.44, height: 3.27, w: 0.55, h: 0.62, radial: true, wing: 'round', le: 1.5, root: 2.3, tip: 1.0, sweep: 3, dihedral: 6, fin: 1.3, finRoot: 1.3, tailSpan: 3.4, tailRoot: 0.9, canopy: { x: -0.4, length: 1.5, kind: 'bubble' }, prop: 2.9, blades: 2 });
// Ki-61-II: the longer Ha-140 nose and a bigger wing (9.16 x 12.0 x 3.7 m).
A['ki-61-ii'] = one({ ...SM, length: 9.16, span: 12.0, height: 3.7, w: 0.5, h: 0.62, wing: 'tapered', le: 1.3, root: 2.5, tip: 1.0, sweep: 3, dihedral: 6, fin: 1.5, finRoot: 1.5, tailSpan: 3.8, tailRoot: 1.0, canopy: { x: -0.5, length: 1.5, kind: 'framed' }, razor: true, prop: 3.0, blades: 3, scoop: [-0.8, 1.4, 0.3] });
// Avia S-199: the Bf 109 G airframe with the heavier Jumo 211, its deeper cowl, the big intake and broad paddle blades (8.94 x 9.92 x 2.59 m).
A['s-199'] = one({ ...BF109, length: 8.94, h: 0.6, spinner: 0.38, prop: 3.2, canopy: { x: 0.6, length: 1.6, kind: 'framed' }, bodies: [belly(3.6, 2.4, -0.35, -0.85, 0.26), bulge(3.2, 2.2, -0.05, 0.12, 0.12, 0.42)] });
// Bf 109 B/C: the Jumo 210, its big radiator under the nose, two blades, the early square-tipped wing (8.55 x 9.87 x 2.45 m).
A['bf-109-b'] = one({ ...BF109, length: 8.55, span: 9.87, height: 2.45, wing: 'square', tip: 1.2, spinner: 0.24, rads: undefined, canopy: { x: 0.5, length: 1.5, kind: 'framed' }, prop: 3.1, blades: 2, bodies: [belly(3.1, 2.0, -0.35, -0.9, 0.28)] });
// P-63 Kingcobra: the P-39 grown, a taller pointed fin, four blades, a laminar wing (9.96 x 11.68 x 3.84 m).
A['p-63'] = one({ cls: 'ww2-fighter', length: 9.96, span: 11.68, height: 3.84, w: 0.54, h: 0.7, wing: 'tapered', le: 1.2, root: 2.6, tip: 1.1, sweep: 2, fin: 1.9, finRoot: 1.9, tailSpan: 4.3, tailRoot: 1.1, canopy: { x: 1.5, length: 1.5, kind: 'framed' }, razor: true, prop: 3.6, blades: 4, bodies: [{ top: [[0.5, 0.72], [0.1, 1.0], [-0.8, 0.88], [-1.3, 0.62]], bottom: [[0.5, 0.5], [-1.3, 0.5]], plan: [[0.5, 0.1], [0.1, 0.22], [-1.3, 0.14]], round: 2.4, stations: 6 }] });
// He 112: a Jumo inline with an elliptic-tipped wing and a near-bubble hood (9.22 x 9.09 x 3.82 m).
A['he-112'] = one({ cls: 'ww2-fighter', length: 9.22, span: 9.09, height: 3.82, w: 0.48, h: 0.62, wing: 'elliptic', le: 1.3, root: 2.4, tip: 0.5, dihedral: 6, fin: 1.3, finRoot: 1.4, roundFin: true, tailSpan: 3.4, tailRoot: 0.9, canopy: { x: -0.3, length: 1.6, kind: 'bubble' }, prop: 3.0, blades: 3, scoop: [0.0, 1.2, 0.3] });
// Ki-32: an inline light bomber with fixed spatted gear and the long two-seat greenhouse (11.64 x 15.0 x 2.9 m).
A['ki-32'] = one({ cls: 'ww2-attack', length: 11.64, span: 15.0, height: 2.9, w: 0.62, h: 0.78, wing: 'tapered', le: 1.8, root: 3.0, tip: 1.3, sweep: 3, dihedral: 6, fin: 1.6, finRoot: 1.7, roundFin: true, tailSpan: 4.6, tailRoot: 1.2, canopy: { x: 0.0, length: 3.2, kind: 'framed' }, prop: 3.2, blades: 3, gear: true, scoop: [3.4, 1.4, 0.3] });
// TBD Devastator: a long low-wing torpedo bomber under a very long greenhouse, the radial (10.67 x 15.24 x 4.6 m).
A['tbd-1'] = one({ cls: 'ww2-attack', length: 10.67, span: 15.24, height: 4.6, w: 0.62, h: 0.82, radial: true, wing: 'tapered', le: 1.9, root: 3.2, tip: 1.4, sweep: 3, mount: -0.7, dihedral: 5, fin: 1.7, finRoot: 1.7, roundFin: true, tailSpan: 5.0, tailRoot: 1.3, canopy: { x: 0.0, length: 4.6, kind: 'framed' }, prop: 3.2, blades: 3 });
// SB2U Vindicator (and the V-156): a radial dive bomber with a long greenhouse and a tall fin (10.36 x 12.8 x 4.34 m).
A['sb2u'] = one({ cls: 'ww2-attack', length: 10.36, span: 12.8, height: 4.34, w: 0.62, h: 0.78, radial: true, wing: 'tapered', le: 1.8, root: 3.0, tip: 1.3, sweep: 3, dihedral: 6, fin: 1.8, finRoot: 1.8, roundFin: true, tailSpan: 4.8, tailRoot: 1.2, canopy: { x: 0.0, length: 3.8, kind: 'framed' }, prop: 3.2, blades: 2 });
// OS2U Kingfisher: a radial scout with the long greenhouse on one big central float and two small wing floats (10.31 x 10.95 x 4.61 m).
A['os2u'] = one({ cls: 'ww2-recon', length: 10.31, span: 10.95, height: 4.61, w: 0.58, h: 0.72, radial: true, wing: 'tapered', le: 1.4, root: 2.3, tip: 1.0, sweep: 2, mount: -0.3, dihedral: 4, fin: 1.6, finRoot: 1.6, roundFin: true, tailSpan: 3.8, tailRoot: 1.0, canopy: { x: -0.1, length: 3.4, kind: 'framed' }, prop: 2.7, blades: 2,
  bodies: [{ top: [[4.0, -1.55], [3.2, -1.3], [-1.6, -1.35], [-3.0, -1.55]], bottom: [[4.0, -1.7], [3.2, -2.1], [0.2, -2.15], [-3.0, -1.7]], plan: [[4.0, 0.1], [3.2, 0.42], [-1.6, 0.35], [-3.0, 0.08]], round: 3, stations: 8 }, post(1.6, 1.2, -0.6, -1.4, 0.05), post(-0.2, -0.6, -0.6, -1.4, 0.05), { top: [[1.4, -0.9], [0.9, -0.75], [-0.6, -0.8]], bottom: [[1.4, -1.0], [0.9, -1.15], [-0.6, -0.95]], plan: [[1.4, 0.04], [0.9, 0.18], [-0.6, 0.04]], side: 4.6, round: 3, stations: 6 }, post(1.0, 0.7, 0.1, -0.85, 0.03, 4.6)] });
// Ar 196: a radial scout on two big floats, the long greenhouse (11.0 x 12.4 x 4.45 m).
A['ar-196'] = { ...one({ cls: 'ww2-recon', length: 11.0, span: 12.4, height: 4.45, w: 0.58, h: 0.75, radial: true, wing: 'tapered', le: 1.6, root: 2.4, tip: 1.2, sweep: 2, mount: -0.3, dihedral: 4, fin: 1.6, finRoot: 1.7, roundFin: true, tailSpan: 4.2, tailRoot: 1.1, canopy: { x: -0.2, length: 3.2, kind: 'framed' }, prop: 3.0, blades: 3 }), floats: true };
// N1K1 Kyofu: a radial fighter on one big central float and two wing floats, the framed hood (10.59 x 12.0 x 4.75 m).
A['n1k1'] = one({ cls: 'ww2-fighter', length: 10.59, span: 12.0, height: 4.75, w: 0.65, h: 0.72, radial: true, wing: 'tapered', le: 1.6, root: 2.5, tip: 1.1, sweep: 3, mount: -0.3, dihedral: 5, fin: 1.6, finRoot: 1.6, tailSpan: 4.2, tailRoot: 1.1, canopy: { x: -0.3, length: 1.7, kind: 'framed' }, razor: true, prop: 3.3, blades: 3,
  bodies: [{ top: [[4.2, -1.55], [3.4, -1.3], [-1.8, -1.35], [-3.2, -1.55]], bottom: [[4.2, -1.7], [3.4, -2.1], [0.2, -2.15], [-3.2, -1.7]], plan: [[4.2, 0.1], [3.4, 0.42], [-1.8, 0.35], [-3.2, 0.08]], round: 3, stations: 8 }, post(1.8, 1.4, -0.6, -1.4, 0.05), post(-0.2, -0.6, -0.6, -1.4, 0.05), { top: [[1.6, -0.9], [1.1, -0.75], [-0.5, -0.8]], bottom: [[1.6, -1.0], [1.1, -1.15], [-0.5, -0.95]], plan: [[1.6, 0.04], [1.1, 0.18], [-0.5, 0.04]], side: 5.0, round: 3, stations: 6 }, post(1.2, 0.9, 0.2, -0.85, 0.03, 5.0)] });
// Firefly: the Griffon's chin radiator, two seats under separate hoods, a square-tipped wing (Mk I 11.46 x 13.56 x 4.14 m).
A['firefly'] = one({ cls: 'ww2-fighter', length: 11.46, span: 13.56, height: 4.14, w: 0.58, h: 0.75, wing: 'square', le: 1.6, root: 2.9, tip: 1.3, sweep: 2, dihedral: 5, fin: 1.7, finRoot: 1.8, roundFin: true, tailSpan: 4.8, tailRoot: 1.2, canopy: { x: 0.0, length: 3.0, kind: 'tandem' }, prop: 3.9, blades: 3, bodies: [belly(5.0, 3.6, -0.45, -1.15, 0.45)] });
// Wyvern: a long turboprop striker with contra-rotating propellers, the bubble high over the nose (12.88 x 13.42 x 4.57 m).
A['wyvern'] = one({ cls: 'attack', length: 12.88, span: 13.42, height: 4.57, w: 0.62, h: 0.8, wing: 'tapered', le: 1.4, root: 3.1, tip: 1.4, sweep: 2, mount: -0.6, dihedral: 6, fin: 2.0, finRoot: 2.2, tailSpan: 5.6, tailRoot: 1.4, canopy: { x: 1.2, length: 1.8, kind: 'bubble' }, prop: 4.0, blades: 8 });
// AM Mauler: the huge R-4360 radial, the bubble, a straight wing (12.55 x 15.24 x 5.13 m).
A['am-1'] = one({ cls: 'ww2-attack', length: 12.55, span: 15.24, height: 5.13, w: 0.72, h: 0.92, radial: true, wing: 'tapered', le: 1.9, root: 3.4, tip: 1.4, sweep: 2, dihedral: 6, fin: 2.2, finRoot: 2.3, tailSpan: 5.8, tailRoot: 1.5, canopy: { x: 1.0, length: 1.9, kind: 'bubble' }, prop: 4.2, blades: 4 });
// Firebrand: the Centaurus radial on a long body, the bubble far back, a big wing (TF.4 11.86 x 15.63 x 4.04 m).
A['firebrand'] = one({ cls: 'ww2-attack', length: 11.86, span: 15.63, height: 4.04, w: 0.68, h: 0.85, radial: true, wing: 'tapered', le: 1.8, root: 3.3, tip: 1.4, sweep: 2, dihedral: 5, fin: 2.0, finRoot: 2.0, roundFin: true, tailSpan: 5.6, tailRoot: 1.4, canopy: { x: -1.2, length: 1.7, kind: 'bubble' }, prop: 4.0, blades: 4 });
// Ba.65: a radial attack monoplane with the open cockpit (9.65 x 12.1 x 3.2 m).
A['ba-65'] = one({ cls: 'ww2-attack', length: 9.65, span: 12.1, height: 3.2, w: 0.66, h: 0.75, radial: true, wing: 'tapered', le: 1.6, root: 2.8, tip: 1.2, sweep: 3, dihedral: 5, fin: 1.4, finRoot: 1.5, roundFin: true, tailSpan: 4.0, tailRoot: 1.1, canopy: { x: -0.2, length: 1.0, kind: 'framed' }, hood: 0.35, razor: true, prop: 3.1, blades: 3 });

// Biplanes.
// CR.32: the Fiat inline with its radiator under the nose, a sesquiplane with W struts (7.45 x 9.5 x 2.63 m).
A['cr-32'] = ww1({ cls: 'ww2-fighter', length: 7.45, span: 9.5, height: 2.63, lower: 7.6, lowerChord: 1.2, chord: 1.6, gap: 1.35, stagger: 0.45, engine: 'radiator', rudder: 'round', half: 0.45, depth: 1.05, prop: 2.7 });
// Hs 123: a radial sesquiplane dive bomber with a single strut each side (8.33 x 10.5 x 3.2 m).
A['hs-123'] = ww1({ cls: 'ww2-attack', length: 8.33, span: 10.5, height: 3.2, lower: 8.0, lowerChord: 1.1, chord: 1.7, gap: 1.5, stagger: 0.4, engine: 'rotary', rudder: 'round', half: 0.55, depth: 1.2, spats: true, prop: 2.9 });
// F3F: a barrel-bodied radial biplane, the gear retracting into the deep body (7.06 x 9.75 x 2.84 m).
A['f3f'] = ww1({ cls: 'ww2-fighter', length: 7.06, span: 9.75, height: 2.84, chord: 1.4, gap: 1.4, stagger: 0.4, engine: 'rotary', rudder: 'round', half: 0.6, depth: 1.3, retract: true, prop: 2.7 });

// ---------------------------------------------------------------- the last family stand-ins (sizes from public references)

// J5N1 Tenrai: a single-seat twin interceptor, Homare radials on a low wing, the cockpit above it, a single fin (11.46 x 14.4 x 2.38 m).
A['j5n1'] = tw({ cls: 'ww2-heavy-fighter', length: 11.46, span: 14.4, height: 2.38, w: 0.55, h: 0.7, nose: 'solid', cockpit: 4.2, hoodLen: 1.6, radial: true, nacR: 0.68, nacBack: 1.1, wingZ: -0.6, finH: 1.9, prop: [3.4, 4] });
// Ki-93: a two-seat heavy fighter, the tandem cockpit far forward, Ha-214 radials with six-bladed propellers, the gun gondola under the body (14.215 x 19.0 x 4.85 m).
A['ki-93'] = tw({ cls: 'ww2-heavy-fighter', length: 14.215, span: 19.0, height: 4.85, w: 0.65, h: 0.85, nose: 'solid', cockpit: 2.4, hoodLen: 2.8, radial: true, nacR: 0.8, nacBack: 1.1, wingZ: -0.6, finH: 2.2, prop: [3.8, 6],
  extra: [{ top: [[4.6, -0.7], [-1.6, -0.7]], bottom: [[4.6, -0.95], [3.6, -1.25], [-0.6, -1.2], [-1.6, -0.85]], plan: [[4.6, 0.2], [3.6, 0.38], [-0.6, 0.35], [-1.6, 0.15]], round: 2.4, stations: 8 }] });
// TIS (MA): a two-seat strike twin, AM-38F inlines under the wing, twin fins on the tailplane's tips (11.7 x 15.5 m; the height an estimate).
A['tis-ma'] = tw({ cls: 'ww2-heavy-fighter', length: 11.7, span: 15.5, height: 3.6, w: 0.55, h: 0.72, nose: 'solid', cockpit: 3.0, hoodLen: 2.6, nacR: 0.55, nacBack: 1.0, wingZ: -0.3, twinTail: true, finH: 1.4, tailSpan: 4.8, prop: [3.2, 3] });
// Su-8: a two-seat armoured attack twin, big M-71F radials, twin rudders (13.58 x 20.5 x 5.085 m).
A['su-8'] = tw({ cls: 'ww2-attack', length: 13.58, span: 20.5, height: 5.085, w: 0.7, h: 0.9, nose: 'solid', cockpit: 3.0, hoodLen: 2.6, radial: true, nacR: 0.85, nacBack: 1.1, wingZ: -0.4, twinTail: true, finH: 1.9, tailSpan: 6.2, prop: [4.0, 3] });
// MB.174: a slim glazed nose under the stepped cockpit, Gnome-Rhone radials, twin fins (12.23 x 17.92 x 3.55 m); the MB.175 looks alike.
A['mb-174'] = tw({ cls: 'ww2-bomber', length: 12.23, span: 17.92, height: 3.55, w: 0.55, h: 0.75, nose: 'stepped', cockpit: 3.0, hoodLen: 2.0, radial: true, nacR: 0.66, wingZ: -0.3, twinTail: true, finH: 1.5, tailSpan: 5.2, prop: [3.0, 3] });
// SM.81 Pipistrello: three radials (one in the nose), fixed main wheels in big spats, a low wing, a single fin, turrets top and bottom (18.3 x 24.0 x 4.3 m).
A['s-81'] = tw({ cls: 'ww2-bomber', length: 18.3, span: 24.0, height: 4.3, w: 0.75, h: 1.0, nose: 'solid', noseEngine: true, cockpit: 4.0, hoodLen: 2.2, radial: true, nacR: 0.65, nacY: 0.3, wingZ: -0.7, finH: 2.0, prop: [3.2, 3], turrets: [-1.0], belly: [-3.0],
  extra: wheel(2.4, 3.6, -0.9, -2.9, 0.55, true) });
// Qing-6: the Chinese Be-6, its radials replaced by turboprops in slimmer nacelles (23.0 x 33.0 m; the height as the Be-6's).
A['qing-6'] = tw({ cls: 'flying-boat', length: 23.0, span: 33.0, height: 7.64, w: 1.2, h: 1.7, nose: 'stepped', cockpit: 4.4, hoodLen: 2.2, boat: true, nacR: 0.6, nacY: 0.26, nacBack: 1.2, root: 5.0, tip: 1.8, wingZ: 0.95, dihedral: 6, twinTail: true, finH: 2.6, tailSpan: 8.6, prop: [3.9, 4] });

/**
 * A twin-boom layout: a short central nacelle (none on the SM.92), the engines at the booms' fronts, the booms
 * running back to twin fins with the tailplane between them.
 */
function booms(o: { cls: string; length: number; span: number; height: number; nacelle?: Row[]; hood?: { front: number; back: number }; y: number; r: number; radial?: boolean; front: number; finH: number; prop: [number, number]; root: number; tip: number; wingZ: number; glass?: Outline }): Spec {
  const n = o.length / 2;
  const le = o.root * 0.55;
  const s = o.span / 2;
  const sw = (o.root - o.tip) * 0.3;
  const body: Row[] = o.nacelle ?? [[le, 0.2, -0.2, 0.2], [le - o.root, 0.2, -0.2, 0.2]];
  const spec = mp({
    cls: o.cls, length: o.length, span: o.span, height: o.height,
    body, hood: o.hood,
    wing: [[0, le, le - o.root], [s, le - sw, le - sw - o.tip]], tipR: o.tip * 0.4, wingUp: o.wingZ, dihedral: 4,
    nacelles: [{ y: o.y, x: o.front, back: -n + 0.4, r: o.r, z: 0, kind: o.radial ? 'radial' : 'inline', below: 0.1 }],
    prop: o.prop,
    fin: [[-n + 1.3, -o.finH * 0.35], [-n + 1.3, o.finH * 0.8], [-n + 1.0, o.finH], [-n + 0.15, o.finH], [-n, o.finH * 0.8], [-n, -o.finH * 0.4], [-n + 0.3, -o.finH * 0.5], [-n + 1.1, -o.finH * 0.45]], twin: 2 * o.y,
    tail: [[0, -n + 1.4, -n + 0.2], [o.y + 0.6, -n + 1.3, -n + 0.25]], tailUp: 0.2,
  });
  if (o.glass) spec.glass = [...(spec.glass ?? []), o.glass];
  return spec;
}
// SM.91: a central nacelle for the crew between two booms carrying the DB 605s forward and the fins aft (13.25 x 19.7 x 3.85 m).
A['sm-91'] = booms({ cls: 'ww2-heavy-fighter', length: 13.25, span: 19.7, height: 3.85, nacelle: [[4.4, 0.0, -0.45, 0.3], [3.9, 0.55, -0.65, 0.6], [3.0, 1.1, -0.75, 0.7], [0.4, 1.1, -0.75, 0.7], [-0.6, 0.7, -0.65, 0.6], [-2.6, 0.35, -0.3, 0.25]], hood: { front: 3.4, back: 0.2 }, y: 2.6, r: 0.55, front: 4.6, finH: 1.6, prop: [3.3, 3], root: 3.0, tip: 1.1, wingZ: -0.1 });
// SM.92: no central nacelle, the crew in the left boom; the DB 605s at the booms' fronts, twin fins (13.7 x 18.55 x 4.15 m).
A['sm-92'] = booms({ cls: 'ww2-heavy-fighter', length: 13.7, span: 18.55, height: 4.15, y: 2.5, r: 0.62, front: 4.8, finH: 1.7, prop: [3.3, 3], root: 3.0, tip: 1.1, wingZ: 0,
  glass: { top: [[3.4, 0.5], [3.0, 0.95], [1.2, 0.95], [0.6, 0.6]], bottom: [[3.4, 0.3], [0.6, 0.3]], plan: [[3.4, 0.25], [3.0, 0.4], [1.2, 0.4], [0.6, 0.3]], side: -2.5, round: 2.4, stations: 8 } });
// Fokker G.I: a short glazed central nacelle, Mercury radials at the front of twin booms, twin fins (10.87 x 17.16 x 3.8 m).
A['fokker-g1'] = booms({ cls: 'ww2-heavy-fighter', length: 10.87, span: 17.16, height: 3.8, nacelle: [[4.4, 0.0, -0.45, 0.3], [4.0, 0.5, -0.65, 0.6], [3.0, 0.95, -0.72, 0.68], [0.2, 0.95, -0.72, 0.68], [-0.8, 0.6, -0.6, 0.55], [-2.2, 0.3, -0.3, 0.25]], hood: { front: 3.4, back: -0.2 }, y: 2.2, r: 0.65, radial: true, front: 3.9, finH: 1.5, prop: [3.0, 3], root: 2.7, tip: 1.0, wingZ: 0.2 });

// BV 138: a short boat hull with the bow turret, a high wing, three diesels (the middle one high on a pylon over the
// hull), the outer nacelles running back into booms with twin fins (19.85 x 26.94 x 5.9 m).
A['bv-138'] = mp({
  cls: 'flying-boat', length: 19.85, span: 26.94, height: 5.9,
  body: [[7.4, 0.4, -0.7, 0.55], [7.0, 0.9, -1.1, 0.95], [5.6, 1.1, -1.35, 1.05], [1.0, 1.1, -1.4, 1.05], [0.9, 1.1, -1.05, 1.0], [-2.6, 0.95, -0.55, 0.8], [-4.2, 0.6, -0.1, 0.35]], round: [[7.4, 2.4], [1, 3], [-4.2, 2.4]],
  hood: { front: 5.6, back: 3.8 },
  wing: [[0, 2.6, -1.3], [13.47, 1.4, -0.4]], tipR: 0.5, wingUp: 1.6, dihedral: 2,
  nacelles: [{ y: 3.8, x: 3.6, back: -9.6, r: 0.5, z: 1.4, below: 0.1 }, { y: 0, x: 3.2, back: -1.2, r: 0.5, z: 2.6 }],
  prop: [3.3, 3],
  fin: [[-8.4, -0.2], [-8.5, 2.2], [-8.9, 2.5], [-9.7, 2.5], [-9.9, 2.1], [-9.9, -0.5], [-9.4, -0.7], [-8.6, -0.6]], twin: 7.6,
  tail: [[0, -8.2, -9.8], [4.0, -8.3, -9.7]], tailUp: 1.6,
  extra: [post(2.0, 0.6, 2.2, 1.0, 0.2), dome(6.6, 0.85, 0.5, 1.1)],
});

// Single-engined.
// ITP (M-1): a slim inline fighter, the radiators in the wing centre fed from the roots, the oil cooler under the engine (9.2 x 10.0 m; the height an estimate).
A['itp'] = one({ cls: 'ww2-fighter', length: 9.2, span: 10.0, height: 3.0, w: 0.48, h: 0.62, wing: 'tapered', le: 1.3, root: 2.4, tip: 1.0, sweep: 3, dihedral: 6, fin: 1.3, finRoot: 1.3, roundFin: true, tailSpan: 3.6, tailRoot: 0.95, canopy: { x: -0.5, length: 1.5, kind: 'framed' }, razor: true, prop: 3.1, blades: 3, bodies: [belly(3.6, 2.6, -0.35, -0.8, 0.22)] });
// Il-8: the Il-2 grown, its radiator scoop on top of the cowl, two seats under one long canopy (12.9 x 14.6 m; the height an estimate).
A['il-8'] = one({ cls: 'ww2-attack', length: 12.9, span: 14.6, height: 4.2, w: 0.65, h: 0.82, wing: 'tapered', le: 1.8, root: 3.2, tip: 1.3, sweep: 10, dihedral: 6, fin: 1.6, finRoot: 1.8, roundFin: true, tailSpan: 4.8, tailRoot: 1.3, canopy: { x: 0.2, length: 3.0, kind: 'framed' }, razor: true, prop: 3.8, blades: 4,
  bodies: [{ top: [[4.0, 0.55], [3.5, 0.95], [2.4, 0.9], [2.0, 0.6]], bottom: [[4.0, 0.4], [2.0, 0.4]], plan: [[4.0, 0.2], [3.5, 0.3], [2.0, 0.2]], round: 2.4, stations: 6 }] });
// Su-6: an armoured attack aircraft with the big M-71 radial and four blades (9.243 x 13.58 m); the single-seater (height an estimate),
// the two-seat S2A with the gunner's cockpit behind (3.89 m), and the AM-42 two-seater's inline nose (size as the S2A, an estimate).
const SU6 = { cls: 'ww2-attack', length: 9.243, span: 13.58, height: 3.89, w: 0.66, h: 0.8, radial: true, wing: 'tapered' as const, le: 1.8, root: 2.7, tip: 1.2, sweep: 4, dihedral: 6, fin: 1.6, finRoot: 1.6, roundFin: true, tailSpan: 4.4, tailRoot: 1.2, prop: 3.25, blades: 4 };
A['su-6'] = one({ ...SU6, canopy: { x: -0.2, length: 1.6, kind: 'framed' }, razor: true });
A['su-6-2'] = one({ ...SU6, canopy: { x: -0.6, length: 2.8, kind: 'framed' } });
A['su-6-am42'] = one({ ...SU6, radial: false, w: 0.6, canopy: { x: -0.6, length: 2.8, kind: 'framed' }, scoop: [0.2, 1.6, 0.3] });
// BTD Destroyer: the R-3350 radial on a mid-wing dive bomber, the bubble over the nose (11.77 x 14.64 x 5.05 m).
A['btd-1'] = one({ cls: 'ww2-attack', length: 11.77, span: 14.64, height: 5.05, w: 0.72, h: 0.9, radial: true, wing: 'tapered', le: 1.8, root: 3.2, tip: 1.4, sweep: 3, mount: -0.2, dihedral: 4, fin: 2.0, finRoot: 2.1, tailSpan: 5.6, tailRoot: 1.4, canopy: { x: 1.2, length: 1.8, kind: 'bubble' }, prop: 4.0, blades: 4 });
// A2D Skyshark: the Skyraider's shape around a turboprop with a six-bladed contra-rotating propeller, the bubble, a taller fin (12.55 x 15.24 x 5.21 m).
A['a2d'] = one({ cls: 'attack', length: 12.55, span: 15.24, height: 5.21, w: 0.66, h: 0.85, wing: 'tapered', le: 1.8, root: 3.3, tip: 1.4, sweep: 3, dihedral: 6, fin: 2.4, finRoot: 2.4, tailSpan: 5.8, tailRoot: 1.4, canopy: { x: 0.9, length: 1.8, kind: 'bubble' }, spinner: 0.4, prop: 4.3, blades: 6 });
// Ki-87: a big Ha-219 radial fighter, four blades, the turbo-supercharger in the rear body (11.82 x 13.423 x 4.503 m).
A['ki-87'] = one({ ...SM, length: 11.82, span: 13.423, height: 4.503, w: 0.72, h: 0.85, radial: true, wing: 'tapered', le: 1.8, root: 2.8, tip: 1.2, sweep: 3, dihedral: 6, fin: 1.8, finRoot: 1.9, tailSpan: 4.6, tailRoot: 1.2, canopy: { x: -0.4, length: 1.7, kind: 'framed' }, razor: true, prop: 3.6, blades: 4, bodies: [belly(-0.8, -2.6, -0.6, -1.0, 0.3)] });
// Ki-94-II: a high-altitude fighter with the Ha-219 radial, the pressure cabin's small hood well back, a long wing (12.0 x 14.0 x 4.65 m).
A['ki-94-ii'] = one({ ...SM, length: 12.0, span: 14.0, height: 4.65, w: 0.7, h: 0.82, radial: true, wing: 'tapered', le: 1.7, root: 3.0, tip: 1.1, sweep: 3, dihedral: 6, fin: 1.8, finRoot: 1.9, tailSpan: 4.6, tailRoot: 1.2, canopy: { x: -1.0, length: 1.5, kind: 'bubble' }, prop: 3.6, blades: 4 });
// Jaktfalken (J 6B): a radial biplane fighter, fixed gear (7.5 x 8.8 x 3.46 m).
A['j6b'] = ww1({ cls: 'ww2-fighter', length: 7.5, span: 8.8, height: 3.46, chord: 1.5, gap: 1.5, stagger: 0.45, engine: 'rotary', rudder: 'round', half: 0.5, depth: 1.1, prop: 2.8 });

// ---------------------------------------------------------------- War Thunder replay ids that borrowed a figure

// MB.157: the MB.152's airframe round the bigger Gnome-Rhone 14R in a long, tight cowl with its intake under the cowl,
// the cockpit set back (9.7 x 10.7 m; the height an estimate from the MB.152's 3.03 m).
A['mb-157'] = one({ cls: 'ww2-fighter', length: 9.7, span: 10.7, height: 3.03, w: 0.6, h: 0.7, cowl: 0.66, radial: true, wing: 'tapered', le: 1.3, root: 2.3, tip: 1.1, sweep: 3, dihedral: 6, fin: 1.3, finRoot: 1.4, roundFin: true, tailSpan: 3.6, tailRoot: 1.0, canopy: { x: -0.7, length: 1.6, kind: 'framed' }, razor: true, prop: 3.2, blades: 3, bodies: [belly(4.3, 3.0, -0.45, -0.92, 0.28)] });

// XP-55 Ascender: a canard pusher - the all-moving foreplane at the nose, the cockpit ahead of the swept wing, the
// Allison in the rear body turning a three-bladed pusher behind it, the fins standing above and below the wing well out
// on each side (9.02 x 12.37 x 3.05 m; sweep, chords, foreplane and fin sizes are estimates).
A['xp-55'] = (() => {
  const s = mp({
    cls: 'ww2-fighter', length: 9.02, span: 12.37, height: 3.05,
    hood: { front: 2.0, back: 0.3 },
    body: [[4.51, 0.0, -0.25, 0.12], [4.2, 0.3, -0.45, 0.32], [3.4, 0.5, -0.6, 0.48], [2.4, 0.62, -0.65, 0.56], [1.7, 1.08, -0.65, 0.6], [0.6, 1.08, -0.65, 0.63], [-0.2, 0.75, -0.65, 0.65], [-1.8, 0.65, -0.62, 0.62], [-3.0, 0.52, -0.5, 0.5], [-3.9, 0.36, -0.36, 0.34], [-4.4, 0.24, -0.24, 0.2]],
    wing: [[0, 0.7, -2.7], [6.185, -2.5, -3.5]], tipR: 0.2, wingUp: -0.2, dihedral: 3,
    fin: [],
    tail: [], tailUp: 0,
    extra: [
      // The fins on each wing, above and below it, and the wing-root intakes.
      finBody([[-1.45, 0.05], [-2.2, 0.75], [-2.55, 1.05], [-3.25, 1.05], [-3.4, 0.05], [-3.3, -0.55], [-2.75, -0.6], [-1.9, -0.45]], 0.06, 4.1),
      bulge(0.6, -0.9, -0.15, 0.18, 0.2, 0.62),
    ],
  });
  return { ...s, canard: { x: 3.7, span: 3.4, chord: 0.8 }, props: [{ x: -4.6, side: 0, up: 0, diameter: 3.1, blades: 3 }] };
})();

// VB 10: a big single-seat fighter with two Hispano 12Z in tandem, one ahead of the cockpit and one behind it, both turning
// the six-bladed contra-rotating propeller in the long nose; the cockpit near the middle under a bubble, the radiator bath
// under the wing, a single fin (12.98 x 15.49 x 5.2 m; propeller and radiator sizes are estimates).
A['vb-10'] = (() => {
  const s = mp({
    cls: 'ww2-fighter', length: 12.98, span: 15.49, height: 5.2,
    hood: { front: 2.6, back: 0.6, sill: 0.72 },
    body: [[6.49, 0.15, -0.25, 0.16], [6.1, 0.45, -0.55, 0.42], [5.0, 0.62, -0.72, 0.56], [3.2, 0.7, -0.8, 0.6], [2.7, 1.22, -0.8, 0.6], [1.0, 1.22, -0.8, 0.6], [0.4, 0.78, -0.8, 0.6], [-2.0, 0.72, -0.72, 0.56], [-4.5, 0.5, -0.4, 0.34], [-6.49, 0.35, 0.0, 0.1]],
    wing: [[0, 3.1, -0.6], [7.745, 1.1, -0.05]], tipR: 0.4, wingUp: -0.45, dihedral: 6,
    noseProp: 6.62, prop: [3.4, 3],
    fin: [[-4.0, 0.55], [-5.3, 0.95], [-5.9, 2.35], [-6.45, 2.45], [-6.8, 1.6], [-6.7, 0.2]],
    tail: [[0, -5.1, -6.6], [2.7, -5.7, -6.5]], tailR: 0.3, tailUp: 0.4,
    extra: [{ top: [[1.7, -0.7], [-1.8, -0.7]], bottom: [[1.7, -0.85], [1.1, -1.22], [-1.0, -1.22], [-1.8, -0.78]], plan: [[1.7, 0.3], [1.1, 0.42], [-1.0, 0.4], [-1.8, 0.2]], round: 3, stations: 8 }],
  });
  return { ...s, props: [...(s.props ?? []), { x: 6.36, side: 0, up: s.props![0].up, diameter: 3.4, blades: 3 }] };
})();

// B-34 / PV-1 Ventura: the Lockheed twin before the Harpoon - the shorter wing, the smaller oval fins, the glazed
// bombardier's nose, the dorsal turret and the stepped ventral gun position behind the bomb bay (15.7 x 19.96 x 3.6 m).
A['b-34'] = mp({
  cls: 'ww2-bomber', length: 15.7, span: 19.96, height: 3.6,
  hood: { front: 5.6, back: 3.9 }, glazed: 6.7,
  body: [[7.85, 0.0, -0.45, 0.25], [7.4, 0.5, -0.8, 0.65], [6.4, 0.85, -1.05, 0.88], [5.2, 1.15, -1.1, 0.92], [3.0, 1.15, -1.1, 0.92], [-2, 1.0, -0.95, 0.85], [-5.5, 0.75, -0.4, 0.55], [-7.85, 0.5, 0.1, 0.15]],
  wing: [[0, 2.6, -1.6], [9.98, 0.7, -0.4]], tipR: 0.5, wingUp: -0.1, dihedral: 5,
  nacelles: [{ y: 3.0, x: 4.3, back: -2.4, r: 0.75, z: -0.1, kind: 'radial', below: 0.2 }],
  prop: [3.7, 3],
  fin: [[-6.25, 0.5], [-6.4, 1.45], [-6.9, 1.85], [-7.5, 1.75], [-7.8, 1.0], [-7.8, 0.0], [-7.45, -0.55], [-6.8, -0.65], [-6.3, -0.3]], twin: 6.0,
  tail: [[0, -6.2, -7.75], [3.0, -6.4, -7.7]], tailUp: 0.5,
  extra: [dome(-0.6, 1.0, 0.5, 1.1), { top: [[-1.2, -0.75], [-3.8, -0.55]], bottom: [[-1.2, -0.95], [-1.6, -1.22], [-3.3, -1.0], [-3.8, -0.6]], plan: [[-1.2, 0.5], [-1.6, 0.55], [-3.3, 0.35], [-3.8, 0.2]], round: 3, stations: 8 }],
});

// MS.410: the MS.406 with the new wing and the radiator fixed down under the body instead of retracting into it (8.2 x 10.6 m;
// the radiator's size an estimate).
A['ms-410'] = { ...AIRCRAFT.air!['ms-406'], length: 8.2, span: 10.6, bodies: [...(AIRCRAFT.air!['ms-406'].bodies ?? []), belly(0.7, -0.8, -0.5, -1.05, 0.33)] };

// Hs 129 B-3: the B-2 with the 75 mm BK 7.5 in its pod under the body, the long barrel and brake reaching far past the
// nose (9.75 x 14.2 x 3.25 m; the pod and the barrel's reach are estimates).
A['hs-129b-3'] = { ...A['hs-129'], bodies: [...A['hs-129'].bodies!,
  { top: [[2.2, -0.68], [-1.6, -0.66]], bottom: [[2.2, -0.86], [1.6, -1.18], [-1.0, -1.18], [-1.6, -0.78]], plan: [[2.2, 0.16], [1.6, 0.3], [-1.0, 0.3], [-1.6, 0.1]], round: 2.6, stations: 8 },
  { top: [[6.3, -0.86], [2.2, -0.86]], bottom: [[6.3, -1.02], [2.2, -1.04]], plan: [[6.3, 0.07], [2.2, 0.08]], round: 2, stations: 4 },
  { top: [[6.45, -0.82], [6.0, -0.82]], bottom: [[6.45, -1.06], [6.0, -1.06]], plan: [[6.45, 0.11], [6.0, 0.11]], round: 2, stations: 4 },
] };

// P-47N: the long-range Thunderbolt - the bigger wing with squared tips, the bubble and the dorsal fin fillet (11.13 x 12.98 x 4.47 m).
A['p-47n'] = one({ ...P47, length: 11.13, span: 12.98, wing: 'square', tip: 1.45, canopy: { x: 0.2, length: 1.8, kind: 'bubble' }, finOutline: filletFin(11.13, 1.8, 1.1, 1.6, 0.8) });

// P-51 / A-36 / Mustang I and IA: the Allison nose - the carburettor intake on top behind the spinner, no chin scoop, three
// blades, the framed hood on the razorback (9.83 x 11.28 x 3.71 m).
A['p-51a'] = one({ ...P51, height: 3.71, prop: 3.1, blades: 3, canopy: { x: -0.1, length: 1.5, kind: 'framed' }, razor: true, bodies: [{ top: [[3.95, 0.6], [3.6, 0.82], [2.7, 0.74], [2.4, 0.6]], bottom: [[3.95, 0.5], [2.4, 0.5]], plan: [[3.95, 0.12], [3.6, 0.15], [2.4, 0.1]], round: 3, stations: 6 }] });

// F4U-4 Corsair: the -1D's airframe with the R-2800-18W, the chin intake under the cowl and four blades (10.27 x 12.5 x 4.5 m).
A['f4u-4'] = { ...AIRCRAFT.air!['f4u-corsair'], length: 10.27, propeller: { diameter: 3.96, blades: 4 }, bodies: [...(AIRCRAFT.air!['f4u-corsair'].bodies ?? []), belly(4.75, 3.7, -0.55, -0.98, 0.32)] };

// Firefly FR.4: the Griffon 74 without the chin radiator, the radiators moved into fairings ahead of the wing roots, the
// clipped square tips and four blades (11.56 x 12.55 x 4.37 m; the fairings' sizes are estimates).
A['firefly-mk4'] = one({ cls: 'ww2-fighter', length: 11.56, span: 12.55, height: 4.37, w: 0.58, h: 0.75, wing: 'square', le: 1.6, root: 2.9, tip: 1.6, sweep: 2, dihedral: 5, fin: 1.75, finRoot: 1.9, roundFin: true, tailSpan: 4.8, tailRoot: 1.2, canopy: { x: 0.0, length: 3.0, kind: 'tandem' }, prop: 3.96, blades: 4,
  bodies: [{ top: [[2.8, -0.3], [2.2, -0.2], [0.6, -0.25]], bottom: [[2.8, -0.55], [2.2, -0.68], [0.6, -0.55]], plan: [[2.8, 0.22], [2.2, 0.36], [0.6, 0.32]], side: 0.9, round: 2.4, stations: 6 }] });

// Mistel 2: the guided Ju 88 G-1 bomb with its shaped-charge warhead in place of the cockpit, the bigger squared G-series fin
// and BMW 801 radials, the Fw 190 A-8 riding above it on two struts at its wing roots and one under its tail; drawn as one
// (Ju 88 G-1 span 20.08 m, the lower part about 14.8 m long with the warhead; the Fw 190 A-8 9.0 x 10.5 m; the warhead's
// shape, the struts and the Fw 190's place over it are estimates).
function mistelLower(): Spec {
  return mp({
    cls: 'ww2-bomber', length: 14.8, span: 20.08, height: 4.85,
    body: [[7.62, 0.0, -0.06, 0.05], [7.1, 0.05, -0.12, 0.07], [6.9, 0.25, -0.35, 0.28], [6.0, 0.62, -0.7, 0.62], [5.0, 0.82, -0.85, 0.74], [3.6, 0.85, -0.85, 0.72], [-1, 0.85, -0.85, 0.7], [-4.5, 0.65, -0.45, 0.5], [-7.18, 0.45, 0.1, 0.12]], round: 2.2,
    wing: [[0, 2.2, -1.4], [10.04, 0.6, -0.9]], tipR: 0.5, wingUp: -0.45, dihedral: 5,
    nacelles: [{ y: 2.75, x: 3.8, back: -2.6, r: 0.66, z: -0.45, kind: 'radial', below: 0.15 }],
    prop: [3.5, 3],
    fin: [[-3.9, 0.75], [-5.2, 1.0], [-6.0, 2.75], [-7.2, 2.8], [-7.45, 2.3], [-7.3, 0.4]],
    tail: [[0, -5.2, -7.0], [3.5, -5.8, -6.9]], tailR: 0.5, tailUp: 0.45,
  });
}
A['ju-88-mistel'] = mistelLower();
A['mistel-2'] = (() => {
  const s = mistelLower();
  // The Fw 190: its axis this high over the Ju 88's and its middle this far forward.
  const zc = 2.5;
  const xc = -0.9;
  const fw: Row[] = ([[4.5, 0.55, -0.55, 0.6], [3.9, 0.66, -0.68, 0.64], [2.6, 0.62, -0.66, 0.6], [1.2, 0.6, -0.62, 0.55], [-1.0, 0.5, -0.5, 0.45], [-3.0, 0.36, -0.3, 0.28], [-4.5, 0.26, -0.05, 0.1]] as Row[]).map(([x, t, b, w]) => [x + xc, t + zc, b + zc, w]);
  const mount = (z: number) => z / (s.bodyHeight * 0.4);
  return {
    ...s,
    cls: 'ww2-bomber',
    height: 6.6,
    bodies: [
      ...s.bodies!,
      fus(fw, 2.4),
      finBody([[xc - 3.55, zc + 0.3], [xc - 4.05, zc + 0.9], [xc - 4.35, zc + 1.35], [xc - 4.8, zc + 1.35], [xc - 4.95, zc + 0.9], [xc - 4.85, zc + 0.2]], 0.06),
      // The struts: a pair from the Fw 190's wing roots down to the Ju 88's back, one under its tail.
      post(xc + 0.95, xc + 0.7, zc - 0.45, 0.8, 0.06, 0.75, 0.2),
      post(xc - 3.2, xc - 3.4, zc - 0.25, 0.6, 0.06),
    ],
    extraWings: [
      { x: xc + 0.45, span: 10.5, rootChord: 2.3, tipChord: 1.05, sweep: 5, mount: mount(zc - 0.4), dihedral: 6, thicknessRatio: 0.15 },
      { x: xc - 4.0, span: 3.65, rootChord: 0.95, tipChord: 0.55, sweep: 8, mount: mount(zc + 0.1) },
    ],
    glass: [...(s.glass ?? []), { top: [[xc + 1.2, zc + 0.58], [xc + 0.8, zc + 1.05], [xc - 0.2, zc + 1.05], [xc - 0.9, zc + 0.56]], bottom: [[xc + 1.2, zc + 0.42], [xc - 0.9, zc + 0.42]], plan: [[xc + 1.2, 0.15], [xc + 0.8, 0.3], [xc - 0.2, 0.3], [xc - 0.9, 0.12]], round: 2.4, stations: 10 }],
    props: [...(s.props ?? []), { x: xc + 4.6, side: 0, up: zc, diameter: 3.3, blades: 3 }],
  };
})();

// Jets that War Thunder lists among these.
// B-66B Destroyer: the A-3's shape - a shoulder wing swept 36 degrees with two J71 pods on pylons, a tall swept fin with the tailplane on it (22.8 x 22.1 x 7.19 m).
A['b-66'] = mp({
  cls: 'jet-bomber', length: 22.8, span: 22.1, height: 7.19,
  body: [[11.4, -0.2, -0.6, 0.2], [10.8, 0.6, -1.0, 0.8], [9.6, 1.1, -1.1, 1.0], [8.4, 1.15, -1.15, 1.05], [-4, 1.1, -1.1, 1.0], [-8.5, 0.9, -0.45, 0.65], [-11.4, 0.6, 0.1, 0.2]], round: 2.2,
  hood: { front: 9.4, back: 7.6 },
  wing: [[0, 3.2, -2.6], [3.5, 0.6, -3.4], [11.05, -5.2, -6.6]], tipR: 0.3, wingUp: 0.9, dihedral: -2,
  nacelles: [{ y: 3.6, x: 3.6, back: -1.4, r: 0.6, z: -0.4, kind: 'jet' }],
  fin: [[-5.6, 1.0], [-7.6, 1.6], [-10.4, 5.3], [-12.0, 5.3], [-11.6, 0.6]],
  tail: [[0, -9.0, -11.4], [4.3, -11.0, -12.0]], tailR: 0.2, tailUp: 2.6,
  extra: [post(2.6, 0.4, 0.75, -0.2, 0.12, 3.6, 0.6)],
});
// Yak-30 (Yak-30D): a small swept-wing jet fighter with the nose intake and the tailplane partway up the fin (8.6 x 8.5 m; the height an estimate).
A['yak-30'] = jet({ cls: 'jet-fighter', length: 8.6, span: 8.5, height: 3.3, w: 0.55, h: 0.65, intake: 'nose', wingPlan: [[0.9, 0], [0.9, 0.6], [-1.3, 4.25], [-2.1, 4.25], [-1.6, 0.6], [-1.6, 0]], mount: -0.1, dihedral: -2, fin: [[-1.8, 0], [-3.9, 0], [-4.4, 1.9], [-3.6, 1.9]], tail: [[-3.0, 0], [-3.6, 1.6], [-4.2, 1.6], [-4.3, 0]], planeUp: 0.9, canopy: { x: 1.4, length: 1.3, kind: 'bubble' } });
// IAR-93 (J-22 Orao): a shoulder wing swept 35 degrees, intakes beside the cockpit, two Vipers, a single swept fin (13.2 x 9.4 m as listed; height 4.52 m).
A['iar-93'] = jet({ cls: 'attack', length: 13.2, span: 9.4, height: 4.52, w: 0.75, h: 0.75, intake: 'side', engines: 2, wingPlan: [[0.6, 0], [0.6, 0.9], [-2.0, 4.7], [-2.8, 4.7], [-3.0, 0.9], [-3.0, 0]], mount: 0.8, dihedral: -4, fin: [[-2.8, 0], [-5.9, 0], [-6.6, 2.4], [-5.4, 2.4]], tail: [[-4.6, 0], [-5.6, 2.1], [-6.4, 2.1], [-6.5, 0]], planeUp: 0.3, canopy: { x: 3.2, length: 1.8, kind: 'bubble' } });

export const PROP_VARIANTS: SpecSet = { air: A, aliases: ALIASES };
