/**
 * Modern armour by variant: tanks, IFVs and APCs whose silhouettes differ
 * (turret armour packages, ERA, sights, bustle racks, skirts, side profile,
 * road wheels) as figures of their own, so a T-72A is told from a T-72B and
 * a B3, a Leopard 2A4 from an A5, A6 and A7, an M1 from an M1A1 and an M1A2.
 *
 * Sizes are published values; outlines and the placing of add-on armour,
 * sights and racks are judged from the general shape of the real vehicle in
 * public photographs (estimates, not traced from any drawing or game model).
 * Turret add-ons are placed forward from the turret's centre and up from its
 * base, side positive to the right; hull add-ons forward from the middle and
 * up from the ground.
 */

import type { Named, SpecSet } from './index';
import type { AddOn, AddOnMount, GroundSpec, GunSpec } from '../ground';
import type { Outline, P2 } from '../parts';
import { ABRAMS, ABRAMS_TURRET, hull, LEO1, LEO2, LEO2_WEDGE, run, T72, T72B_TURRET, T80, TANKS, turret } from './tanks';
import { bonnetCab, FMTV, forwardCab, GAZ_66, GM_CHASSIS, HEMTT, HMMWV, KAMAZ_43101, KRAZ_255, KRAZ_6322, M548, M939, MAN_HX, MAZ_543, MZKT_7930, PICKUP, TRAILER, URAL_4320, ZIL_131 } from './base';
import { AIR_DEFENCE } from './air-defence';
import { GROUND_MODERN } from './ground-modern';

const G: Named<GroundSpec> = {};
const ALIASES: Record<string, string> = {};
const base = (n: string) => TANKS.ground![n];

// ---------------------------------------------------------------- add-on helpers

type Opt = Partial<AddOn>;
/** A block on the turret. */
const tb = (x: number, s: number, u: number, l: number, w: number, h: number, o: Opt = {}): AddOn => ({ on: 'turret', kind: 'box', at: [x, s, u], size: [l, w, h], ...o });
/** A block on the hull. */
const hb = (x: number, s: number, u: number, l: number, w: number, h: number, o: Opt = {}): AddOn => ({ on: 'hull', kind: 'box', at: [x, s, u], size: [l, w, h], ...o });
const M: Opt = { mirror: true };
const DARK: Opt = { metal: true };

/**
 * Plates on the upper glacis of a `hull(L, ..., deck, ..., glacis, nose)`:
 * one thick plate (Kontakt-5, Relikt, a passive module), or rows and columns
 * of bricks with gaps between them (Kontakt-1, Blazer).
 */
function glacis(L: number, deck: number, len: number, nose: number, t: number, width: number, rows = 1, cols = 1, gap = 0.12): AddOn[] {
  const a = Math.atan2(deck - nose, len);
  const out: AddOn[] = [];
  const slope = len / Math.cos(a);
  for (let r = 0; r < rows; r++) {
    const f = (r + 0.5) / rows;
    const x = L / 2 - len + f * len + Math.sin(a) * t * 0.5;
    const u = deck - f * (deck - nose) + Math.cos(a) * t * 0.5;
    for (let c = 0; c < cols; c++) {
      const s = -width / 2 + ((c + 0.5) * width) / cols;
      out.push(hb(x, s, u, slope / rows - (rows > 1 ? gap : 0), width / cols - (cols > 1 ? gap : 0), t, { pitch: -a }));
    }
  }
  return out;
}

/** Skirt-mounted ERA or armour boxes along the front of the skirts, both sides. */
const skirtBoxes = (x0: number, x1: number, side: number, u: number, h: number, n: number, t = 0.14): AddOn[] =>
  Array.from({ length: n }, (_, i) => hb(x0 + ((x1 - x0) * (i + 0.5)) / n, side, u, ((x1 - x0) / n) * 0.9, t, h, M));

/** Slat (bar) armour round the engine compartment: both sides and the back, standing off the hull. */
const slats = (x0: number, x1: number, side: number, u: number, h: number): AddOn[] => [hb((x0 + x1) / 2, side, u, x1 - x0, 0.06, h, { ...M, ...DARK }), hb(x0 - 0.15, 0, u, 0.06, side * 2, h, DARK)];

// ---------------------------------------------------------------- T-72

// T-72 hull: 6.86 m, deck 1.4, upper glacis 1.9 m long down to a 0.95 m nose (see `sovietHull`).
const T72_GLACIS = (t: number, rows = 1, cols = 1) => glacis(6.86, 1.4, 1.9, 0.95, t, 2.9, rows, cols);
// The IR searchlight right of the gun and the 902 smoke dischargers on the turret front's sides.
const LUNA = (x: number, s: number, u: number): AddOn => ({ on: 'turret', kind: 'blob', at: [x, s, u], size: [0.32, 0.38, 0.38], metal: true });
const SMOKE_902 = (x: number, s: number, u: number): AddOn => tb(x, s, u, 0.55, 0.18, 0.18, { ...M, ...DARK, yaw: 0.5 });
// Kontakt-1 on a cast turret: bricks in a row round each cheek's upper front and along the roof's front edge.
const K1_TURRET = (front: number, cheek: number, roof: number): AddOn[] => [
  tb(front - 0.12, 0.42, roof * 0.62, 0.4, 0.32, 0.12, { ...M, pitch: -0.55 }),
  tb(front - 0.38, cheek * 0.55, roof * 0.66, 0.4, 0.32, 0.12, { ...M, pitch: -0.5, yaw: -0.35 }),
  tb(front - 0.75, cheek * 0.78, roof * 0.6, 0.4, 0.32, 0.12, { ...M, pitch: -0.45, yaw: -0.7 }),
  tb(front - 0.75, 0.32, roof * 0.95, 0.4, 0.32, 0.1, { ...M, pitch: -0.2 }),
  tb(front - 1.15, cheek * 0.62, roof * 0.9, 0.4, 0.3, 0.1, { ...M, pitch: -0.15, yaw: -0.9 }),
];
// The K-5 "brow": the cast dome squared at the front and lifted level with the roof by the wedge containers.
const K5_TURRET = turret(0.25, [[-1.55, 0.85], [-1.2, 1.3], [-0.3, 1.47], [0.6, 1.58], [1.55, 1.56], [1.88, 1.12], [1.95, 0.5]], [[-1.55, 0.4], [-1.0, 0.72], [0.2, 0.84], [1.5, 0.82], [1.95, 0.5]], 5, 1.85);
// Relikt: bigger, squarer containers on the front and down the turret's sides.
const RELIKT_TURRET = turret(0.25, [[-1.55, 0.95], [-1.2, 1.45], [0.6, 1.66], [1.65, 1.62], [1.98, 1.15], [2.02, 0.5]], [[-1.55, 0.42], [-1.0, 0.74], [0.2, 0.86], [1.6, 0.86], [2.02, 0.52]], 7, 1.9);
// Sosna-U: the gunner's sight head on the roof left of the gun; the commander's PK PAN panoramic head on the right.
const SOSNA = tb(0.85, -0.62, 1.0, 0.5, 0.5, 0.4);
const PK_PAN = { on: 'turret', kind: 'drum', at: [-0.2, 0.72, 1.12], size: [0.36, 0.36, 0.5] } as AddOn;

// T-72 "Ural" (1973): no skirts but four spring-out "gill" plates on each fender's front half, the optical
// rangefinder's bulge on the turret's right front, the searchlight, no smoke dischargers.
G['t-72-ural'] = { cls: 'mbt', ...T72, skirts: false, addOns: [...[2.5, 1.85, 1.2, 0.55].map((x) => hb(x, 1.82, 0.7, 0.6, 0.04, 0.55, { ...M, yaw: 0.55 })), { on: 'turret', kind: 'blob', at: [0.95, 1.2, 0.6], size: [0.3, 0.3, 0.26] }, LUNA(1.35, 0.8, 0.72)] };
// T-72A (1979): the rangefinder gone, full rubber side skirts, the 902B smoke dischargers on the turret front.
G['t-72a'] = { cls: 'mbt', ...T72, addOns: [SMOKE_902(0.85, 1.3, 0.5), LUNA(1.35, 0.8, 0.72)] };
// T-72AV: the A with Kontakt-1 bricks on the turret and the glacis.
G['t-72av'] = { cls: 'mbt', ...T72, addOns: [SMOKE_902(0.7, 1.35, 0.45), LUNA(1.35, 0.8, 0.72), ...K1_TURRET(1.55, 1.4, 0.8), ...T72_GLACIS(0.1, 3, 5)] };
// T-72B (1985): the thicker "Super Dolly Parton" cheeks, Kontakt-1 on the turret and in rows on the glacis.
G['t-72b'] = { cls: 'mbt', ...T72, turret: T72B_TURRET, addOns: [SMOKE_902(0.7, 1.42, 0.45), LUNA(1.5, 0.82, 0.74), ...K1_TURRET(1.7, 1.5, 0.84), ...T72_GLACIS(0.1, 3, 5)] };
// T-72B obr. 1989: Kontakt-5 - the squared brow on the turret, a thick plate on the glacis, boxes on the front skirts.
const T72B89_ADD = [SMOKE_902(0.6, 1.5, 0.45), LUNA(1.75, 0.82, 0.74), ...T72_GLACIS(0.22), ...skirtBoxes(1.0, 3.2, 1.78, 0.62, 0.42, 3)];
G['t-72b-1989'] = { cls: 'mbt', ...T72, turret: K5_TURRET, addOns: T72B89_ADD };
// T-72B3 (2011): the 1989 tank with the Sosna-U sight box on the roof.
G['t-72b3'] = { cls: 'mbt', ...T72, turret: K5_TURRET, addOns: [...T72B89_ADD, SOSNA] };
// T-72B3M (B3 obr. 2016): Relikt on the turret, its sides and the skirts, the commander's panoramic sight, slat armour round the engine deck.
G['t-72b3m'] = { cls: 'mbt', ...T72, turret: RELIKT_TURRET, addOns: [SMOKE_902(0.4, 1.62, 0.45), ...T72_GLACIS(0.26), ...skirtBoxes(0.2, 3.2, 1.8, 0.6, 0.5, 4, 0.18), SOSNA, PK_PAN, ...slats(-3.3, -1.3, 1.9, 1.15, 0.95)] };

// ---------------------------------------------------------------- T-80

// T-80 hull 7.0 m: deck 1.4, glacis 1.95 m down to 0.95 m.
const T80_GLACIS = (t: number, rows = 1, cols = 1) => glacis(7.0, 1.4, 1.95, 0.95, t, 2.9, rows, cols);
const T80U_TURRET = base('t-80u').turret!;
// T-80B (1978): the T-64-shaped cast turret, the smoke dischargers, the searchlight; the long flat turbine deck.
G['t-80b'] = { cls: 'mbt', ...T80, addOns: [SMOKE_902(0.7, 1.3, 0.45), LUNA(1.3, 0.8, 0.7)] };
// T-80BV: Kontakt-1 on the turret and glacis.
G['t-80bv'] = { cls: 'mbt', ...T80, addOns: [SMOKE_902(0.6, 1.35, 0.45), LUNA(1.3, 0.8, 0.7), ...K1_TURRET(1.5, 1.38, 0.76), ...T80_GLACIS(0.1, 3, 5)] };
// T-80U (1985): the Kontakt-5 horseshoe, a stowage box round the turret's back, the K-5 glacis plate and skirt boxes.
const T80U_ADD = [SMOKE_902(0.7, 1.55, 0.45), ...T80_GLACIS(0.22), ...skirtBoxes(1.1, 3.3, 1.78, 0.6, 0.42, 3), tb(-1.75, 0, 0.35, 0.45, 2.1, 0.5), { on: 'turret', kind: 'drum', at: [-0.3, 0.6, 0.9], size: [0.55, 0.55, 0.25] } as AddOn];
G['t-80u'] = { cls: 'mbt', ...T80, turret: T80U_TURRET, addOns: T80U_ADD };
// T-80UD: the diesel - a taller, grilled engine deck and the commander's remote 12.7 mm mount on the cupola.
G['t-80ud'] = { cls: 'mbt', ...T80, turret: T80U_TURRET, addOns: [...T80U_ADD, hb(-2.4, 0, 1.5, 2.0, 2.9, 0.22), tb(-0.3, 0.6, 1.15, 0.6, 0.35, 0.3, DARK), tb(0.25, 0.6, 1.2, 1.2, 0.06, 0.06, DARK)] };
// T-80BVM (2017): the BV with Relikt on the turret and skirts, Sosna-U, slat armour round the engine deck.
G['t-80bvm'] = { cls: 'mbt', ...T80, turret: { ...RELIKT_TURRET, x: 0.3 }, addOns: [SMOKE_902(0.4, 1.62, 0.45), ...T80_GLACIS(0.26), ...skirtBoxes(0.2, 3.3, 1.8, 0.6, 0.5, 4, 0.18), SOSNA, ...slats(-3.4, -1.2, 1.9, 1.15, 0.95)] };

// ---------------------------------------------------------------- T-64

const T64 = base('t-64bv');
// T-64 hull 6.54 m: glacis 1.8 m from the 1.4 m deck to a 0.95 m nose.
const T64_GLACIS = (t: number, rows = 1, cols = 1) => glacis(6.54, 1.4, 1.8, 0.95, t, 2.8, rows, cols);
// T-64A (1969): small road wheels close together, the low cast turret, gill plates on the fenders, no skirts.
G['t-64a'] = { ...T64, skirts: false, addOns: [...[2.4, 1.8, 1.2, 0.6].map((x) => hb(x, 1.7, 0.7, 0.55, 0.04, 0.5, { ...M, yaw: 0.55 })), LUNA(1.35, 0.8, 0.7)] };
// T-64B (1976): rubber skirts, the smoke dischargers, the Kobra guidance antenna on the roof.
G['t-64b'] = { ...T64, addOns: [SMOKE_902(0.7, 1.28, 0.45), LUNA(1.35, 0.8, 0.7), tb(0.2, 0.75, 0.82, 0.2, 0.2, 0.22, DARK)] };
// T-64BV (1985): the B with Kontakt-1.
G['t-64bv'] = { ...T64, addOns: [SMOKE_902(0.6, 1.3, 0.45), LUNA(1.35, 0.8, 0.7), ...K1_TURRET(1.55, 1.3, 0.72), ...T64_GLACIS(0.1, 3, 5)] };
// T-64BM Bulat (2005): Nizh ERA boxes squaring the whole turret front and sides, ERA skirts, slat armour behind.
G['t-64bm-bulat'] = { ...T64, turret: turret(0.35, [[-1.4, 0.9], [-1.1, 1.38], [0.8, 1.58], [1.75, 1.5], [1.95, 0.95], [2.0, 0.45]], [[-1.4, 0.4], [-0.8, 0.7], [0.2, 0.8], [1.6, 0.8], [2.0, 0.48]], 8, 1.85), addOns: [...T64_GLACIS(0.24), ...skirtBoxes(0.0, 3.1, 1.75, 0.62, 0.5, 4, 0.18), ...slats(-3.2, -1.4, 1.8, 1.15, 0.9), SMOKE_902(0.4, 1.55, 0.45)] };

// ---------------------------------------------------------------- T-90

// T-90 (1992): the T-72B obr. 1989 cast turret and K-5, the Shtora dazzler boxes either side of the gun.
const SHTORA = tb(1.85, 0.62, 0.42, 0.3, 0.4, 0.3, M);
G['t-90'] = { cls: 'mbt', ...T72, width: 3.78, turret: K5_TURRET, turrets: undefined, addOns: [...T72B89_ADD, SHTORA, tb(0.4, 0.95, 0.9, 0.2, 0.2, 0.15, { ...M, ...DARK })] };
// T-90A (2004): the welded turret with its flat roof and faceted sides, K-5 wedges and Shtora (see tanks.ts).
const T90A = base('t-90a');
G['t-90a'] = { ...T90A, turrets: undefined, addOns: [...T72B89_ADD, tb(1.85, 0.62, 0.42, 0.3, 0.4, 0.3, M)] };
// T-90M (2020): Relikt, the box bustle, the commander's panoramic sight, slat armour round the engine deck.
G['t-90m'] = { ...base('t-90m'), turrets: undefined, addOns: [...T72_GLACIS(0.26), ...skirtBoxes(0.2, 3.2, 1.9, 0.6, 0.5, 4, 0.18), tb(0.95, -0.62, 1.0, 0.5, 0.5, 0.35), { ...PK_PAN, at: [-0.4, 0.72, 1.08] }, ...slats(-3.3, -1.3, 1.95, 1.15, 0.95)] };

// ---------------------------------------------------------------- Leopard 2

// Leopard 2 hull 7.72 m: a short steep glacis (1.4 m) from the 1.75 m deck to a 1.2 m nose.
const LEO2_GLACIS = (t: number) => glacis(7.72, 1.75, 1.4, 1.2, t, 3.2);
// Commander and gunner sit right: the EMES 15 gunner's sight box on the roof's right front, the PERI R17 head behind it;
// smoke dischargers in fours on the turret's rear sides.
const PERI = (x: number, h = 0.36): AddOn => ({ on: 'turret', kind: 'drum', at: [x, 0.78, 0.84 + h / 2], size: [0.38, 0.38, h] });
const LEO2_SMOKE = tb(-0.9, 1.7, 0.62, 0.75, 0.2, 0.26, { ...M, ...DARK });
const L44: GunSpec = { mount: 'turret', length: 5.3, calibre: 0.12, extractor: 0.5, at: 0.45 };
const L55: GunSpec = { mount: 'turret', length: 6.6, calibre: 0.12, extractor: 0.45, at: 0.45 };
// 2A4 (1985): the upright slab-fronted box turret, the EMES box and PERI, small bins at the back.
G['leopard-2a4'] = { cls: 'mbt', ...LEO2, guns: [L44], addOns: [tb(1.25, 0.72, 0.9, 0.75, 0.55, 0.16), PERI(0.35), LEO2_SMOKE, tb(-2.35, 1.05, 0.4, 0.3, 0.6, 0.45, M)] };
// 2A5 (1995): the arrowhead wedge on the turret front, the PERI moved back and raised, a big stowage box across the
// turret's back, heavier front skirt sections.
const A5_ADD = [PERI(-0.7, 0.5), LEO2_SMOKE, tb(-2.45, 0, 0.42, 0.45, 2.6, 0.55), ...skirtBoxes(1.6, 3.7, 1.9, 0.62, 0.55, 2, 0.12)];
G['leopard-2a5'] = { cls: 'mbt', ...LEO2, turret: LEO2_WEDGE, guns: [L44], addOns: A5_ADD };
// 2A6 (2001): the 2A5 with the long L/55.
G['leopard-2a6'] = { cls: 'mbt', ...LEO2, turret: LEO2_WEDGE, guns: [L55], addOns: A5_ADD };
// 2A7 / 2A7V (2014): the A6 with an armour module on the hull front, thick add-on modules along the turret's sides,
// the remote weapon station on the roof, heavy skirts all along.
G['leopard-2a7'] = { cls: 'mbt', ...LEO2, turret: LEO2_WEDGE, guns: [L55], addOns: [PERI(-0.7, 0.5), LEO2_SMOKE, tb(-2.45, 0, 0.42, 0.45, 2.6, 0.55), ...LEO2_GLACIS(0.28), hb(3.95, 0, 0.98, 0.3, 3.3, 0.5), tb(0.55, 1.78, 0.42, 1.9, 0.26, 0.7, M), tb(-1.2, -0.75, 1.08, 0.55, 0.45, 0.45, DARK), ...skirtBoxes(-3.4, 3.7, 1.92, 0.6, 0.6, 5, 0.16)] };
// Leopard 2PL (2020): the 2A4 with Rheinmetall's add-on wedge - blunter and shorter than the A5's - and plates down the turret's sides; L/44.
G['leopard-2pl'] = { cls: 'mbt', ...LEO2, turret: turret(-0.35, [[-2.25, 1.35], [-1.9, 1.62], [1.6, 1.72], [2.3, 1.38], [2.55, 0.6]], [[-2.25, 0.72], [-2.0, 0.82], [1.6, 0.9], [2.55, 0.62]], 12, 2.4), guns: [L44], addOns: [PERI(0.0, 0.42), LEO2_SMOKE, tb(-0.2, 1.75, 0.45, 2.2, 0.14, 0.62, M), tb(-2.35, 1.05, 0.4, 0.3, 0.6, 0.45, M)] };
// Strv 122 (1996): the 2A5-type wedge with extra armour on the turret roof, heavier skirts, Swedish dischargers; L/44.
G['strv-122'] = { cls: 'mbt', ...LEO2, turret: LEO2_WEDGE, guns: [L44], addOns: [PERI(-0.7, 0.5), tb(0.2, 0, 0.92, 2.6, 2.7, 0.1), tb(-1.3, 1.7, 0.66, 0.5, 0.25, 0.32, { ...M, ...DARK }), tb(-2.45, 0, 0.42, 0.45, 2.6, 0.55), ...skirtBoxes(-3.0, 3.7, 1.92, 0.6, 0.55, 4, 0.14)] };
// Leopard 2E (2006): the A6-type wedge and L/55 with thicker turret side armour.
G['leopard-2e'] = { cls: 'mbt', ...LEO2, turret: LEO2_WEDGE, guns: [L55], addOns: [...A5_ADD, tb(0.2, 1.74, 0.45, 2.0, 0.18, 0.66, M)] };

// ---------------------------------------------------------------- Leopard 1

// The cast turret of the Leopard 1 to 1A2 (1A1A1 with bolted-on spaced plates); the welded one of the 1A3 / 1A4 / 1A5.
const LEO1_CAST = base('leopard-1a3').turret!;
const L7: GunSpec = { mount: 'turret', length: 5.4, calibre: 0.105, extractor: 0.55, at: 0.45 };
// Leopard 1 (1965): the cast turret, the L7 without a sleeve, no skirts.
G['leopard-1'] = { cls: 'mbt', ...LEO1, skirts: false, turret: LEO1_CAST, guns: [L7] };
// Leopard 1A1 (1974): rubber skirts and the thermal sleeve on the gun.
G['leopard-1a1'] = { cls: 'mbt', ...LEO1, turret: LEO1_CAST, guns: [{ ...L7, sleeve: 0.7 }] };
// Leopard 1A1A1: Blohm + Voss spaced plates bolted round the cast turret's front and sides and over the mantlet.
G['leopard-1a1a1'] = { cls: 'mbt', ...LEO1, turret: LEO1_CAST, guns: [{ ...L7, sleeve: 0.7 }], addOns: [tb(1.1, 0.85, 0.5, 0.9, 0.55, 0.62, { ...M, yaw: -0.45 }), tb(-0.1, 1.42, 0.48, 1.7, 0.12, 0.62, M), tb(1.78, 0, 0.48, 0.22, 1.0, 0.55)] };
// Leopard 1A3 / 1A4: the welded spaced-armour turret with its wedge mantlet.
G['leopard-1a3'] = { cls: 'mbt', ...LEO1 };
// Leopard 1A5 (1987): the welded turret with the EMES 18 sight box on the roof.
G['leopard-1a5'] = { cls: 'mbt', ...LEO1, addOns: [tb(0.75, 0.68, 1.06, 0.75, 0.5, 0.2)] };
// Leopard C2 MEXAS: MEXAS modules boxing in the turret's front and sides, a module on the glacis, thick skirts.
G['leopard-c2-mexas'] = { cls: 'mbt', ...LEO1, turret: turret(-0.1, [[-1.85, 1.0], [-1.3, 1.6], [0.8, 1.7], [1.8, 1.55], [2.1, 0.75]], [[-1.85, 0.52], [-1.2, 0.98], [0.8, 1.06], [1.85, 0.86], [2.1, 0.6]], 8, 2.0), addOns: [...glacis(7.09, 1.6, 1.5, 1.1, 0.22, 2.9), ...skirtBoxes(-3.2, 3.4, 1.75, 0.6, 0.55, 5, 0.16), tb(0.75, 0.68, 1.12, 0.75, 0.5, 0.2)] };

// ---------------------------------------------------------------- Abrams

// The commander's weapon station: a tall cupola ringed with vision blocks and its .50 (M1, M1A1).
const CWS: AddOn[] = [{ on: 'turret', kind: 'drum', at: [-0.4, 0.72, 1.04], size: [0.78, 0.78, 0.4] }, tb(-0.1, 0.72, 1.2, 1.1, 0.07, 0.07, DARK)];
// The bustle rack round the turret's back; the CITV head on the left of the roof (M1A2 on).
const RACK = tb(-3.15, 0, 0.55, 0.6, 3.0, 0.45, DARK);
const CITV = { on: 'turret', kind: 'drum', at: [0.9, -0.62, 1.06], size: [0.42, 0.42, 0.45] } as AddOn;
const CROWS = [tb(-0.4, 0.72, 1.1, 0.6, 0.5, 0.48, DARK), tb(0.1, 0.72, 1.18, 0.9, 0.07, 0.07, DARK)];
const M256: GunSpec = { mount: 'turret', length: 5.3, calibre: 0.12, extractor: 0.55, at: 0.5 };
const ABRAMS_PLAIN = { ...ABRAMS, cupola: false, rws: false };
// M1 (1980): the 105 mm M68 with its extractor well out, a shorter turret front, the CWS cupola.
const M1_TURRET = turret(-0.55, [[-2.85, 1.45], [-2.4, 1.72], [0.9, 1.8], [1.6, 1.55], [2.2, 0.95], [2.38, 0.5]], [[-2.85, 0.62], [-2.5, 0.78], [1.4, 0.84], [2.1, 0.6], [2.38, 0.42]], 9, 2.3);
const M68: GunSpec = { mount: 'turret', length: 5.4, calibre: 0.105, sleeve: 0.65, extractor: 0.68, at: 0.5 };
G['m1-abrams'] = { cls: 'mbt', ...ABRAMS_PLAIN, turret: M1_TURRET, guns: [M68], addOns: [...CWS, RACK] };
// IPM1 (1984): the M1 with the thicker, longer turret front of the M1A1; still the 105.
G['m1ip-abrams'] = { cls: 'mbt', ...ABRAMS_PLAIN, turret: ABRAMS_TURRET, guns: [M68], addOns: [...CWS, RACK] };
// M1A1 (1985): the 120 mm M256.
G['m1a1-abrams'] = { cls: 'mbt', ...ABRAMS_PLAIN, guns: [M256], addOns: [...CWS, RACK] };
// M1A2 (1992): the CITV on the roof's left, a low commander's hatch in place of the CWS.
G['m1a2-abrams'] = { cls: 'mbt', ...ABRAMS_PLAIN, guns: [M256], addOns: [CITV, { on: 'turret', kind: 'drum', at: [-0.4, 0.72, 0.92], size: [0.8, 0.8, 0.16] }, tb(-0.2, 0.72, 1.05, 0.9, 0.07, 0.07, DARK), RACK] };
// M1A2 SEP (v1 / v2): the CITV and, on the v2, the CROWS remote station over the commander's hatch.
G['m1a2-sep'] = { cls: 'mbt', ...ABRAMS_PLAIN, guns: [M256], addOns: [CITV, ...CROWS, RACK] };
// M1A2C / SEPv3 (2017): Trophy launchers and radar boxes on the turret's sides, the armoured APU box on the back deck's left, CROWS-LP.
G['m1a2c-sepv3'] = { cls: 'mbt', ...ABRAMS_PLAIN, guns: [M256], addOns: [CITV, ...CROWS, RACK, tb(0.6, 1.92, 0.5, 0.9, 0.42, 0.55, M), hb(-3.35, -1.2, 1.78, 0.8, 0.95, 0.48)] };
// AbramsX (2022, demonstrator): a smaller, lower unmanned turret with the remote station on top and the XM360 (estimate).
G['abrams-x'] = { cls: 'mbt', ...ABRAMS_PLAIN, turret: turret(-0.4, [[-2.3, 1.25], [-1.9, 1.6], [0.9, 1.66], [1.8, 1.35], [2.3, 0.7], [2.42, 0.4]], [[-2.3, 0.52], [-1.9, 0.62], [1.2, 0.66], [2.42, 0.36]], 10, 2.3), guns: [{ mount: 'turret', length: 5.6, calibre: 0.12, sleeve: 0.8, at: 0.5 }], addOns: [tb(-0.4, 0, 0.82, 0.75, 0.6, 0.42, DARK), tb(0.6, 1.72, 0.42, 0.8, 0.3, 0.42, M)] };

// ---------------------------------------------------------------- Challenger

const CR2 = base('challenger-2');
// Challenger 1 (1983): the slab Chobham turret with the TOGS thermal barbette on its right, the L11 rifled gun.
G['challenger-1'] = { ...CR2, guns: [{ mount: 'turret', length: 5.6, calibre: 0.12, sleeve: 0.8, extractor: 0.5, at: 0.45 }], addOns: [tb(0.3, 1.85, 0.5, 1.5, 0.45, 0.55)] };
// Challenger 2 (1998): the commander's VS 580 sight head on the roof's left, the gunner's sight on the right front.
G['challenger-2'] = { ...CR2, addOns: [{ on: 'turret', kind: 'drum', at: [0.9, -0.62, 1.06], size: [0.42, 0.42, 0.4] }, tb(1.35, 0.62, 0.95, 0.5, 0.4, 0.2)] };
// Challenger 3 (2027): the L55A1 smoothbore, the Orion commander's sight raised high, Trophy on the turret's sides, a remote station.
G['challenger-3'] = { ...CR2, guns: [{ mount: 'turret', length: 6.6, calibre: 0.12, sleeve: 0.85, at: 0.45 }], addOns: [{ on: 'turret', kind: 'drum', at: [0.9, -0.62, 1.16], size: [0.45, 0.45, 0.6] }, tb(1.35, 0.62, 0.98, 0.55, 0.45, 0.26), tb(0.7, 1.85, 0.5, 0.9, 0.42, 0.55, M), tb(-1.3, 0.6, 1.05, 0.6, 0.45, 0.4, DARK)] };

// ---------------------------------------------------------------- Leclerc

const LECLERC = base('leclerc');
// Commander on the left: his HL-70 panoramic head; the gunner's sight box on the right; Galix dischargers at the back.
const LECLERC_ADD = [{ on: 'turret', kind: 'drum', at: [0.6, -0.65, 1.15], size: [0.42, 0.42, 0.5] } as AddOn, tb(1.25, 0.65, 1.0, 0.55, 0.45, 0.2), tb(-1.3, 1.66, 0.7, 0.9, 0.22, 0.3, { ...M, ...DARK })];
G['leclerc'] = { ...LECLERC, addOns: LECLERC_ADD };
// Leclerc XLR (2024): add-on modules on the turret's sides and the glacis, heavier skirts, the remote station, slat armour at the back.
G['leclerc-xlr'] = { ...LECLERC, addOns: [...LECLERC_ADD, tb(0.2, 1.75, 0.45, 2.2, 0.2, 0.62, M), ...glacis(6.88, 1.6, 1.4, 1.1, 0.24, 3.1), ...skirtBoxes(-2.6, 3.2, 1.92, 0.6, 0.6, 4, 0.16), tb(-0.6, 0.65, 1.15, 0.55, 0.45, 0.42, DARK), ...slats(-3.6, -2.0, 1.95, 1.2, 0.9)] };

// ---------------------------------------------------------------- Merkava

const MK4 = base('merkava-mk4');
// The ball-and-chain curtain hanging under the turret bustle (Mk 2 on).
const CHAINS = tb(-2.5, 0, 0.12, 0.3, 2.4, 0.5, DARK);
// Merkava Mk 1 (1979): the long, narrow, sharply sloped turret, the 105 mm, no curtain.
const MK1_TURRET = turret(-1.0, [[-2.3, 0.95], [-1.9, 1.35], [0.2, 1.4], [1.6, 0.9], [2.35, 0.3]], [[-2.3, 0.62], [-0.4, 0.72], [2.35, 0.28]], 8, 2.25);
const MK_105: GunSpec = { mount: 'turret', length: 5.4, calibre: 0.105, sleeve: 0.7, extractor: 0.55, at: 0.45 };
G['merkava-mk1'] = { ...MK4, turret: MK1_TURRET, guns: [MK_105] };
// Mk 2 (1983): appliqué plates on the turret's sides, the chain curtain, the 60 mm mortar on the roof.
G['merkava-mk2'] = { ...MK4, turret: MK1_TURRET, guns: [MK_105], addOns: [tb(-0.7, 1.45, 0.38, 1.8, 0.16, 0.55, M), { ...CHAINS, at: [-2.3, 0, 0.12] }, tb(-1.4, -0.6, 0.85, 0.7, 0.12, 0.12, DARK)] };
// Mk 3 (1989): a bigger, squarer turret of bolt-on modules, the 120 mm, the curtain, skirt modules.
G['merkava-mk3'] = { ...MK4, turret: turret(-1.1, [[-2.6, 1.1], [-2.2, 1.58], [0.4, 1.62], [1.9, 1.05], [2.7, 0.35]], [[-2.6, 0.72], [-0.4, 0.82], [2.7, 0.3]], 12, 2.5), addOns: [CHAINS, ...skirtBoxes(-1.0, 3.4, 1.93, 0.62, 0.55, 3, 0.12)] };
// Mk 4 (2004): the long rounded arrowhead with its big bustle, the curtain, the commander's sight; Mk 4M adds Trophy.
const MK4_ADD = [{ ...CHAINS, at: [-2.6, 0, 0.12] } as AddOn, { on: 'turret', kind: 'drum', at: [-0.3, 0.7, 0.95], size: [0.4, 0.4, 0.35] } as AddOn];
G['merkava-mk4'] = { ...MK4, addOns: MK4_ADD };
G['merkava-mk4m'] = { ...MK4, addOns: [...MK4_ADD, tb(-0.4, 1.62, 0.45, 0.8, 0.4, 0.5, M)] };

// ---------------------------------------------------------------- Japan, Korea, Italy

// Type 90 (1990): six road wheels, a slab box turret with an upright face, a big bustle (hull 7.5 x 3.43 m, 2.3 m).
G['type-90'] = { ...base('type-90'), roadWheels: 6, trackProfile: run(7.3, 0.9, [3.65, 0.6], [-3.65, 0.68], -3.0, 2.95), hullOutline: hull(7.5, 3.43, 1.5, 0.88, 1.3, 1.1, 0.15) };
// Type 10 (2012): five road wheels, a lighter hull, the angular wedge turret with modular faces (hull 7.42 x 3.24 m, 2.3 m).
G['type-10'] = { ...base('type-10'), length: 7.42, roadWheels: 5, roadWheelRadius: 0.38, trackProfile: run(7.2, 0.9, [3.6, 0.6], [-3.6, 0.68], -2.9, 2.9), hullOutline: hull(7.42, 3.24, 1.45, 0.86, 1.4, 1.05, 0.15), addOns: [tb(-0.3, 0.7, 0.95, 0.4, 0.4, 0.3)] };
// K1 (1987): the Abrams-like faceted turret, smaller, on a six-wheeled hull; the 105 mm; K1A1 the 120 mm (hull 7.48 x 3.6 m, 2.25 m).
const K1: GroundSpec = { chassis: 'tracked', length: 7.48, width: 3.6, hullHeight: 1.5, roadWheels: 6, roadWheelRadius: 0.36, skirts: true, trackProfile: run(7.3, 0.9, [3.65, 0.6], [-3.65, 0.7], -3.0, 2.95), hullOutline: hull(7.48, 3.6, 1.5, 0.86, 2.0, 1.0, 0.15), turret: turret(-0.4, [[-2.5, 1.35], [-2.1, 1.6], [0.8, 1.68], [1.6, 1.45], [2.2, 0.85], [2.35, 0.45]], [[-2.5, 0.6], [-2.2, 0.72], [1.3, 0.78], [2.1, 0.58], [2.35, 0.4]], 9, 2.3), guns: [M68], cupola: true, addOns: [tb(-2.85, 0, 0.5, 0.5, 2.8, 0.42, DARK)] };
G['k1'] = { cls: 'mbt', ...K1 };
G['k1a1'] = { cls: 'mbt', ...K1, guns: [M256] };
// C1 Ariete (1995): a long welded turret with a sloped face and big bustle (hull 7.59 x 3.6 m, 2.5 m); the AMV upgrade
// with add-on modules on the turret front and sides.
const ARIETE = { ...base('ariete'), roadWheels: 7, trackProfile: run(7.4, 0.92, [3.7, 0.62], [-3.7, 0.7], -3.0, 3.0), hullOutline: hull(7.59, 3.6, 1.65, 0.9, 1.5, 1.15, 0.15) };
G['ariete'] = { ...ARIETE, addOns: [tb(-0.2, 0.7, 0.95, 0.4, 0.4, 0.4)] };
G['ariete-amv'] = { ...ARIETE, addOns: [tb(-0.2, 0.7, 0.95, 0.4, 0.4, 0.4), tb(1.6, 0.9, 0.4, 0.9, 0.7, 0.55, { ...M, yaw: -0.6 }), tb(-0.3, 1.72, 0.4, 2.0, 0.16, 0.55, M), tb(-1.2, -0.6, 1.0, 0.5, 0.4, 0.4, DARK)] };

// ---------------------------------------------------------------- Patton and M60

// Open running gear, no skirts: six road wheels, the return rollers above (M48 five, M60 three; estimates), the idler
// at the front and the sprocket high at the back (M48 hull 6.82 x 3.63 m; M60 6.95 x 3.63 m).
const PATTON_RUN = run(6.8, 1.02, [3.3, 0.68], [-3.4, 0.78], -2.55, 2.5);
const PATTON_WHEELS = [-2.3, -1.42, -0.54, 0.34, 1.22, 2.1];
const M19_CUPOLA: AddOn[] = [{ on: 'turret', kind: 'drum', at: [-0.4, 0.68, 1.12], size: [0.9, 0.9, 0.48] }, tb(0.0, 0.68, 1.2, 0.9, 0.07, 0.07, DARK)];
const PATTON: GroundSpec = { chassis: 'tracked', length: 6.95, width: 3.63, hullHeight: 1.65, roadWheels: 6, roadWheelRadius: 0.33, trackProfile: PATTON_RUN, running: { wheels: PATTON_WHEELS, rollers: [-1.6, 0, 1.6] }, hullOutline: { top: [[-3.47, 1.35], [-3.3, 1.65], [1.4, 1.65], [3.0, 1.15], [3.47, 0.9]], bottom: [[-3.47, 1.0], [3.2, 1.0], [3.47, 0.9]], plan: [[-3.47, 1.55], [2.6, 1.6], [3.47, 1.15]], round: 4, stations: 14 } };
const M48_TURRET = turret(0.1, [[-1.9, 0.8], [-1.5, 1.3], [0.2, 1.5], [1.2, 1.3], [1.75, 0.8], [1.9, 0.45]], [[-1.9, 0.4], [-1.3, 0.8], [0.0, 0.9], [1.2, 0.65], [1.9, 0.35]], 2.4, 1.85);
// M48 Patton (1953): the round "turtle" cast turret, five return rollers, the 90 mm with its blast deflector; M48A5 the 105.
G['m48-patton'] = { cls: 'mbt', ...PATTON, length: 6.82, running: { wheels: PATTON_WHEELS, rollers: [-2.0, -1.0, 0, 1.0, 2.0] }, turret: M48_TURRET, guns: [{ mount: 'turret', length: 4.4, calibre: 0.09, muzzle: true, extractor: 0.75, at: 0.45 }], addOns: M19_CUPOLA };
const M60A1_TURRET = turret(0.0, [[-2.1, 0.85], [-1.6, 1.35], [0.2, 1.55], [1.1, 1.35], [2.0, 0.7], [2.35, 0.4]], [[-2.1, 0.45], [-1.4, 0.85], [0.1, 0.92], [1.2, 0.7], [2.35, 0.35]], 2.8, 2.3);
const M60_GUN: GunSpec = { mount: 'turret', length: 5.4, calibre: 0.105, extractor: 0.6, at: 0.45 };
const M60_RACK = tb(-2.35, 0, 0.45, 0.45, 2.0, 0.4, DARK);
// M60 (1960): the Patton-style turret on the new hull, the 105.
G['m60'] = { cls: 'mbt', ...PATTON, turret: M48_TURRET, guns: [M60_GUN], addOns: M19_CUPOLA };
// M60A1 (1962): the long "needle nose" turret.
G['m60a1'] = { cls: 'mbt', ...PATTON, turret: M60A1_TURRET, guns: [M60_GUN], addOns: [...M19_CUPOLA, M60_RACK] };
// M60A3 (TTS): the A1 with the thermal sleeve, the laser rangefinder and smoke dischargers on the turret's sides.
G['m60a3'] = { cls: 'mbt', ...PATTON, turret: M60A1_TURRET, guns: [{ ...M60_GUN, sleeve: 0.8 }], addOns: [...M19_CUPOLA, M60_RACK, tb(0.7, 1.4, 0.55, 0.5, 0.2, 0.3, { ...M, ...DARK, yaw: 0.4 })] };
// M60A2 "Starship" (1974): a low, narrow, very long turret with the big cupola on top and the short 152 mm gun-launcher.
G['m60a2'] = { cls: 'mbt', ...PATTON, turret: turret(-0.3, [[-2.6, 0.8], [-2.0, 1.2], [0.0, 1.35], [1.2, 1.0], [1.9, 0.45]], [[-2.6, 0.45], [-1.6, 0.7], [0.4, 0.72], [1.9, 0.32]], 6, 1.85), guns: [{ mount: 'turret', length: 2.4, calibre: 0.152, at: 0.45 }], addOns: [{ on: 'turret', kind: 'drum', at: [-0.6, 0, 0.98], size: [1.05, 1.05, 0.55] }, tb(-0.1, 0, 1.1, 1.0, 0.07, 0.07, DARK)] };
// Magach 6 (Blazer): the M60A1 with Blazer ERA bricks round the turret's front and sides and in rows on the glacis.
const BLAZER: AddOn[] = [];
for (const [x, s, yaw] of [[2.0, 0.45, -0.6], [1.6, 0.85, -0.6], [1.15, 1.2, -0.35], [0.6, 1.45, -0.1], [0.0, 1.55, 0], [-0.6, 1.5, 0], [-1.2, 1.35, 0.2]] as const) BLAZER.push(tb(x, s, 0.55, 0.5, 0.18, 0.4, { ...M, yaw }));
for (const x of [1.6, 1.0, 0.4]) BLAZER.push(tb(x, 0.55, 0.88, 0.5, 0.45, 0.12, M));
G['magach-6'] = { cls: 'mbt', ...PATTON, turret: M60A1_TURRET, guns: [{ ...M60_GUN, sleeve: 0.8 }], addOns: [...M19_CUPOLA, M60_RACK, ...BLAZER, ...glacis(6.95, 1.65, 2.07, 0.9, 0.1, 2.9, 2, 5)] };
// Magach 7 (1990s): passive armour boxing the turret into an angular shape, armoured skirts.
G['magach-7'] = { cls: 'mbt', ...PATTON, skirts: true, turret: turret(0.0, [[-2.1, 0.95], [-1.6, 1.62], [0.6, 1.72], [1.6, 1.55], [2.3, 0.9], [2.5, 0.45]], [[-2.1, 0.5], [-1.4, 0.95], [0.6, 1.0], [1.8, 0.8], [2.5, 0.45]], 8, 2.4), guns: [{ ...M60_GUN, sleeve: 0.8 }], addOns: [{ on: 'turret', kind: 'drum', at: [-0.4, 0.68, 1.15], size: [0.8, 0.8, 0.35] }, M60_RACK, ...glacis(6.95, 1.65, 2.07, 0.9, 0.2, 3.0)] };

// ---------------------------------------------------------------- Chieftain, T-84, ZTZ-96

// Chieftain (1966): a long low hull, the reclined driver; the long cast turret sloped back with no mantlet, bazooka plates
// over the running gear, the L11 (hull 7.52 x 3.5 m, 2.9 m). Mk 3 / 5 with the IR searchlight box on the turret's left.
const CHIEFTAIN: GroundSpec = { chassis: 'tracked', length: 7.52, width: 3.5, hullHeight: 1.55, roadWheels: 6, roadWheelRadius: 0.32, skirts: true, trackProfile: run(7.3, 0.95, [3.65, 0.62], [-3.65, 0.72], -3.0, 2.95), hullOutline: hull(7.52, 3.5, 1.55, 0.88, 2.2, 0.95, 0.15), turret: turret(-0.2, [[-2.3, 0.95], [-1.8, 1.45], [0.2, 1.55], [1.3, 1.25], [2.1, 0.6], [2.3, 0.35]], [[-2.3, 0.5], [-1.6, 0.82], [0.2, 0.88], [1.3, 0.6], [2.3, 0.25]], 3, 2.2), guns: [{ mount: 'turret', length: 5.6, calibre: 0.12, sleeve: 0.8, extractor: 0.5, at: 0.4 }], cupola: true };
const SEARCHLIGHT = tb(0.0, -1.62, 0.55, 1.2, 0.36, 0.66);
G['chieftain-mk3'] = { cls: 'mbt', ...CHIEFTAIN, addOns: [SEARCHLIGHT] };
// Mk 10 / 11: Stillbrew armour - thick blocks on the turret's front cheeks; the Mk 11 the TOGS barbette in place of the searchlight.
const STILLBREW = tb(1.0, 0.95, 0.42, 0.9, 0.7, 0.6, { ...M, yaw: -0.45 });
G['chieftain-mk10'] = { cls: 'mbt', ...CHIEFTAIN, addOns: [SEARCHLIGHT, STILLBREW] };
G['chieftain-mk11'] = { cls: 'mbt', ...CHIEFTAIN, addOns: [STILLBREW, tb(0.1, 1.68, 0.5, 1.4, 0.42, 0.55)] };
// T-84 Oplot-M (2009): the T-80UD hull with a welded turret under Nizh ERA and a large bustle box (hull 7.08 x 3.78 m).
G['t-84-oplot-m'] = { cls: 'mbt', ...T80, length: 7.08, width: 3.78, turret: turret(0.2, [[-2.3, 1.2], [-1.6, 1.45], [0.5, 1.62], [1.6, 1.55], [2.0, 1.0], [2.1, 0.5]], [[-2.3, 0.62], [-1.6, 0.7], [0.6, 0.84], [1.6, 0.82], [2.1, 0.5]], 8, 1.95), addOns: [...T80_GLACIS(0.24), ...skirtBoxes(0.3, 3.4, 1.9, 0.6, 0.5, 4, 0.16), { on: 'turret', kind: 'drum', at: [-0.2, 0.75, 1.1], size: [0.4, 0.4, 0.5] }, hb(-2.4, 0, 1.5, 2.0, 2.9, 0.22)] };
// ZTZ-96 (1997): a T-72-like hull, a welded turret with an upright front; ZTZ-96B (2016) arrowhead ERA on the front, a bustle box.
const ZTZ96 = { ...T72, length: 6.9, width: 3.5 };
G['ztz-96'] = { cls: 'mbt', ...ZTZ96, turret: turret(0.2, [[-1.8, 1.0], [-1.4, 1.45], [0.5, 1.55], [1.5, 1.45], [1.85, 0.9], [1.95, 0.45]], [[-1.8, 0.5], [-1.2, 0.75], [0.6, 0.8], [1.95, 0.45]], 8, 1.85) };
G['ztz-96b'] = { cls: 'mbt', ...ZTZ96, turret: turret(0.2, [[-2.2, 1.1], [-1.4, 1.45], [0.5, 1.55], [1.4, 1.35], [2.1, 0.8], [2.3, 0.4]], [[-2.2, 0.55], [-1.2, 0.75], [0.6, 0.82], [2.3, 0.38]], 8, 2.1), addOns: [...T72_GLACIS(0.2), tb(-0.3, 0.7, 0.95, 0.4, 0.4, 0.3)] };

// ---------------------------------------------------------------- light tanks and gun carriers

// PT-76 (1951): a long boat hull, six road wheels and no return rollers, the small conical turret far forward, the 76 mm (7.63 x 3.15 m, 2.26 m).
G['pt-76'] = { cls: 'light-tank', chassis: 'tracked', length: 6.91, width: 3.15, hullHeight: 1.55, roadWheels: 6, roadWheelRadius: 0.35, trackProfile: run(7.2, 0.85, [3.5, 0.55], [-3.6, 0.62], -3.0, 3.0), running: { wheels: [-2.75, -1.65, -0.55, 0.55, 1.65, 2.75] }, hullOutline: { top: [[-3.8, 1.35], [-3.6, 1.55], [1.6, 1.55], [3.8, 0.95]], bottom: [[-3.8, 0.75], [2.6, 0.7], [3.8, 0.95]], plan: [[-3.8, 1.5], [2.8, 1.55], [3.8, 1.2]], round: 8, stations: 12 }, turret: turret(1.2, [[-1.0, 0.7], [-0.7, 1.0], [0.5, 1.05], [1.0, 0.7]], [[-1.0, 0.5], [0.6, 0.6], [1.0, 0.45]], 2.6, 1.0), guns: [{ mount: 'turret', length: 3.4, calibre: 0.076, muzzle: true, extractor: 0.7, at: 0.5 }] };
// FV101 Scorpion (1972): a small aluminium hull, five big road wheels, a small box turret with the short 76 mm (4.79 x 2.2 m, 2.1 m);
// FV107 Scimitar the same with the long thin 30 mm RARDEN.
const CVRT: GroundSpec = { chassis: 'tracked', length: 4.79, width: 2.2, hullHeight: 1.35, roadWheels: 5, roadWheelRadius: 0.3, trackProfile: run(4.6, 0.8, [2.3, 0.55], [-2.3, 0.6], -1.8, 1.9), running: { wheels: [-1.6, -0.8, 0, 0.8, 1.6] }, hullOutline: { top: [[-2.4, 1.1], [-2.3, 1.35], [0.7, 1.35], [2.4, 0.85]], bottom: [[-2.4, 0.6], [2.0, 0.6], [2.4, 0.85]], plan: [[-2.4, 1.1], [2.4, 1.0]], round: 10, stations: 10 }, turret: turret(-0.3, [[-0.9, 0.8], [-0.6, 0.95], [0.6, 0.95], [0.95, 0.7]], [[-0.9, 0.55], [0.6, 0.6], [0.95, 0.4]], 8, 0.9) };
G['fv101-scorpion'] = { cls: 'light-tank', ...CVRT, guns: [{ mount: 'turret', length: 1.6, calibre: 0.076, at: 0.45 }] };
G['fv107-scimitar'] = { cls: 'light-tank', ...CVRT, guns: [{ mount: 'turret', length: 2.6, calibre: 0.03, at: 0.45 }] };
// M551 Sheridan (1967): a light aluminium hull, five road wheels, the turret with the short fat 152 mm and the shielded cupola (6.3 x 2.82 m, 2.95 m).
G['m551-sheridan'] = { cls: 'light-tank', chassis: 'tracked', length: 6.3, width: 2.82, hullHeight: 1.6, roadWheels: 5, roadWheelRadius: 0.38, trackProfile: run(6.0, 0.9, [3.0, 0.6], [-3.0, 0.65], -2.4, 2.4), running: { wheels: [-2.1, -1.05, 0, 1.05, 2.1] }, hullOutline: hull(6.3, 2.82, 1.6, 0.9, 1.6, 1.0, 0.2, 6), turret: turret(-0.1, [[-1.5, 0.9], [-1.1, 1.2], [0.6, 1.25], [1.25, 0.9], [1.4, 0.5]], [[-1.5, 0.5], [-0.9, 0.75], [0.6, 0.78], [1.4, 0.45]], 4, 1.35), guns: [{ mount: 'turret', length: 1.5, calibre: 0.152, at: 0.45 }], addOns: [{ on: 'turret', kind: 'drum', at: [-0.3, 0.55, 0.98], size: [0.7, 0.7, 0.4] }, tb(0.15, 0.55, 1.05, 0.08, 0.9, 0.55)] };
// 2S25 Sprut-SD (2005): a long airborne hull, seven road wheels, a low welded turret with the long 125 mm (7.08 x 3.15 m, 2.72 m).
G['2s25-sprut-sd'] = { cls: 'light-tank', chassis: 'tracked', length: 7.08, width: 3.15, hullHeight: 1.6, roadWheels: 7, roadWheelRadius: 0.3, skirts: true, trackProfile: run(6.9, 0.9, [3.45, 0.6], [-3.45, 0.65], -2.9, 2.9), hullOutline: hull(7.08, 3.15, 1.6, 0.9, 1.6, 1.05, 0.15), turret: turret(0.1, [[-1.8, 1.0], [-1.4, 1.35], [0.8, 1.4], [1.6, 1.0], [1.8, 0.5]], [[-1.8, 0.5], [0.9, 0.6], [1.8, 0.35]], 8, 1.75), guns: [{ mount: 'turret', length: 6.0, calibre: 0.125, sleeve: 0.55, extractor: 0.62, at: 0.45 }] };
// MBT-70 / KPz 70 (1967): a low hull on six wheels, the driver in the low pointed turret; the 152 mm gun-launcher (US) or a 120 mm (German) (6.99 x 3.51 m).
const MBT70: GroundSpec = { chassis: 'tracked', length: 6.99, width: 3.51, hullHeight: 1.35, roadWheels: 6, roadWheelRadius: 0.34, skirts: true, trackProfile: run(6.8, 0.85, [3.4, 0.55], [-3.4, 0.62], -2.8, 2.8), hullOutline: hull(6.99, 3.51, 1.35, 0.8, 2.2, 0.85, 0.15), turret: turret(-0.3, [[-2.1, 1.1], [-1.6, 1.6], [0.6, 1.65], [1.7, 1.2], [2.4, 0.4]], [[-2.1, 0.55], [-1.2, 0.8], [0.6, 0.85], [2.4, 0.3]], 6, 2.3), cupola: true };
G['mbt-70'] = { cls: 'mbt', ...MBT70, guns: [{ mount: 'turret', length: 3.8, calibre: 0.152, at: 0.45 }] };
G['kpz-70'] = { cls: 'mbt', ...MBT70, guns: [{ mount: 'turret', length: 5.4, calibre: 0.12, extractor: 0.5, at: 0.45 }] };
// TAM (1983): the Marder's hull with the engine in front, the turret far back, the 105 mm (6.75 x 3.12 m, 2.43 m).
G['tam'] = { cls: 'mbt', chassis: 'tracked', length: 6.75, width: 3.12, hullHeight: 1.65, roadWheels: 6, roadWheelRadius: 0.33, trackProfile: run(6.5, 0.95, [3.25, 0.65], [-3.25, 0.65], -2.6, 2.6), running: { wheels: [-2.3, -1.4, -0.5, 0.4, 1.3, 2.2], rollers: [-1.4, 0, 1.4] }, hullOutline: { top: [[-3.37, 1.45], [-3.2, 1.65], [0.6, 1.65], [3.37, 0.95]], bottom: [[-3.37, 0.95], [3.2, 0.95], [3.37, 0.95]], plan: [[-3.37, 1.5], [3.37, 1.45]], round: 8, stations: 12 }, turret: turret(-1.0, [[-1.6, 1.0], [-1.2, 1.3], [0.6, 1.35], [1.4, 1.0], [1.6, 0.5]], [[-1.6, 0.55], [0.6, 0.62], [1.6, 0.42]], 8, 1.55), guns: [{ mount: 'turret', length: 5.2, calibre: 0.105, sleeve: 0.7, extractor: 0.55, at: 0.45 }], cupola: true };
// B1 Centauro (1991): an 8x8 with a pointed nose and the turret amidships, the 105 mm; Centauro II (2018) longer, the 120 mm in a bigger turret (7.4 x 3.05 m; 8.26 m).
const CENTAURO: GroundSpec = { chassis: 'wheeled', length: 7.4, width: 3.05, hullHeight: 1.85, axles: 4, axleAt: [0.78, 0.4, -0.25, -0.65], wheelRadius: 0.6, hullOutline: { top: [[-3.7, 1.6], [-3.5, 1.85], [1.4, 1.85], [3.7, 1.15]], bottom: [[-3.7, 0.65], [3.0, 0.65], [3.7, 1.0]], plan: [[-3.7, 1.42], [2.8, 1.5], [3.7, 1.1]], round: 8, stations: 12 }, turret: turret(-0.2, [[-1.9, 1.0], [-1.4, 1.3], [0.8, 1.4], [1.6, 1.1], [1.9, 0.6]], [[-1.9, 0.55], [-1.2, 0.8], [0.8, 0.85], [1.9, 0.5]], 8, 1.85), guns: [{ mount: 'turret', length: 5.2, calibre: 0.105, sleeve: 0.7, extractor: 0.55, at: 0.45 }], cupola: true };
G['centauro'] = { cls: 'tank-destroyer', ...CENTAURO };
G['centauro-2'] = { cls: 'tank-destroyer', ...CENTAURO, length: 8.26, axleAt: [0.78, 0.42, -0.22, -0.62], hullOutline: { top: [[-4.13, 1.65], [-3.9, 1.9], [1.5, 1.9], [4.13, 1.15]], bottom: [[-4.13, 0.65], [3.4, 0.65], [4.13, 1.0]], plan: [[-4.13, 1.42], [3.2, 1.5], [4.13, 1.1]], round: 8, stations: 12 }, turret: turret(-0.3, [[-2.2, 1.15], [-1.7, 1.45], [0.9, 1.5], [1.8, 1.2], [2.1, 0.6]], [[-2.2, 0.6], [-1.4, 0.85], [0.9, 0.9], [2.1, 0.55]], 10, 2.05), guns: [{ mount: 'turret', length: 6.0, calibre: 0.12, sleeve: 0.75, extractor: 0.5, at: 0.45 }] };

// ---------------------------------------------------------------- BMP, BMD, BTR-D

/** A thin barrel lying along x as a dark block: a second, coaxial gun beside the main one. */
const barrel = (x: number, s: number, u: number, l: number, d = 0.07): AddOn => tb(x + l / 2, s, u, l, d, d, DARK);
// BMP-1 / BMP-2 hull (6.74 x 2.94 m): the long ribbed glacis running back from a sharp bow to the turret, six road wheels
// and three return rollers, the troop compartment's roof behind; the BMP-2 a little wider (3.15 m).
const BMP_HULL = { top: [[-3.37, 1.5], [-3.2, 1.62], [0.2, 1.65], [3.37, 0.82]], bottom: [[-3.37, 0.85], [2.9, 0.75], [3.37, 0.82]], plan: [[-3.37, 1.42], [2.6, 1.47], [3.37, 1.05]], round: 8, stations: 12 } as GroundSpec['hullOutline'];
const BMP: GroundSpec = { chassis: 'tracked', length: 6.74, width: 2.94, hullHeight: 1.65, roadWheels: 6, roadWheelRadius: 0.33, trackProfile: run(6.6, 0.9, [3.25, 0.62], [-3.3, 0.62], -2.75, 2.7), running: { wheels: [-2.45, -1.5, -0.55, 0.4, 1.35, 2.3], rollers: [-1.5, 0, 1.5] }, hullOutline: BMP_HULL };
const BMP1_TURRET = turret(0.55, [[-0.9, 0.8], [-0.6, 1.0], [0.5, 1.0], [0.9, 0.7]], [[-0.9, 0.42], [0.3, 0.55], [0.9, 0.35]], 2.2, 0.9);
const BMP2_TURRET = turret(0.4, [[-1.0, 0.95], [-0.7, 1.2], [0.5, 1.2], [1.0, 0.85]], [[-1.0, 0.55], [0.3, 0.7], [1.0, 0.45]], 2.4, 1.0);
const GUN_73: GunSpec = { mount: 'turret', length: 1.4, calibre: 0.073, at: 0.5 };
const GUN_2A42: GunSpec = { mount: 'turret', length: 2.9, calibre: 0.03, at: 0.5, elevation: 0.05 };
const MALYUTKA = tb(0.85, 0, 0.72, 0.85, 0.14, 0.14, DARK);
const KONKURS = tb(-0.1, 0.18, 0.88, 1.25, 0.18, 0.18, DARK);
// BMP-1 (1966): the small cone turret with the short 73 mm and the Malyutka rail over it.
G['bmp-1'] = { cls: 'ifv', ...BMP, turret: BMP1_TURRET, guns: [GUN_73], addOns: [MALYUTKA] };
// BMP-1P: the Malyutka swapped for a Konkurs tube on the roof.
G['bmp-1p'] = { cls: 'ifv', ...BMP, turret: BMP1_TURRET, guns: [GUN_73], addOns: [{ ...KONKURS, at: [0.0, 0.0, 0.7] }] };
// BMP-2 (1980): the wider two-man turret, the long thin 30 mm, the Konkurs launcher on the roof.
G['bmp-2'] = { cls: 'ifv', ...BMP, width: 3.15, turret: BMP2_TURRET, guns: [GUN_2A42], addOns: [KONKURS] };
// BMP-2M Berezhok: two pairs of Kornet tubes on the turret's sides, a sight box on the roof.
G['bmp-2m'] = { cls: 'ifv', ...BMP, width: 3.15, turret: BMP2_TURRET, guns: [GUN_2A42], addOns: [tb(0.1, 1.38, 0.5, 1.3, 0.3, 0.38, M), tb(0.3, -0.45, 0.82, 0.4, 0.35, 0.3)] };
// BMP-3 (1987): a longer, higher hull with the engine at the back, open running gear with five return rollers, the flat
// turret with the 100 mm and the coaxial 30 mm side by side (7.14 x 3.15 m, 2.3 m).
const BMP3_TURRET = turret(0.2, [[-1.1, 1.1], [-0.8, 1.35], [0.6, 1.38], [1.15, 1.0]], [[-1.1, 0.5], [0.5, 0.6], [1.15, 0.4]], 6, 1.1);
const BMP3_WEAPONS = { guns: [{ mount: 'turret', length: 2.6, calibre: 0.1, at: 0.5, elevation: 0.04 } as GunSpec] };
const BMP3: GroundSpec = { chassis: 'tracked', length: 7.14, width: 3.15, hullHeight: 1.75, roadWheels: 6, roadWheelRadius: 0.32, trackProfile: run(6.9, 0.9, [3.4, 0.62], [-3.45, 0.65], -2.85, 2.85), running: { wheels: [-2.6, -1.6, -0.6, 0.4, 1.4, 2.4], rollers: [-2.2, -1.1, 0, 1.1, 2.2] }, hullOutline: { top: [[-3.57, 1.65], [-3.4, 1.75], [1.0, 1.75], [2.6, 1.45], [3.57, 0.95]], bottom: [[-3.57, 0.85], [3.2, 0.8], [3.57, 0.95]], plan: [[-3.57, 1.52], [2.8, 1.57], [3.57, 1.2]], round: 8, stations: 12 }, turret: BMP3_TURRET, ...BMP3_WEAPONS, addOns: [barrel(1.1, 0.35, 0.32, 2.9)] };
G['bmp-3'] = { cls: 'ifv', ...BMP3 };
// BMP-3 with the ERA kit: Kaktus panels on the front and the hull's sides, slat armour at the back.
G['bmp-3-era'] = { cls: 'ifv', ...BMP3, addOns: [barrel(1.1, 0.35, 0.32, 2.9), ...glacis(7.14, 1.45, 0.97, 0.95, 0.18, 2.9), hb(-0.2, 1.62, 1.35, 5.0, 0.16, 0.6, M), ...slats(-3.8, -2.6, 1.7, 1.3, 1.0)] };
// BMD-1 (1969): a small airborne hull with a very sharp bow, five small road wheels, the BMP-1 turret (5.4 x 2.63 m, 1.97 m).
const BMD_HULL = { top: [[-2.7, 1.2], [-2.55, 1.32], [0.0, 1.35], [1.5, 1.28], [2.7, 0.7]], bottom: [[-2.7, 0.7], [2.2, 0.62], [2.7, 0.7]], plan: [[-2.7, 1.25], [1.4, 1.3], [2.7, 0.45]], round: 8, stations: 12 } as GroundSpec['hullOutline'];
const BMD: GroundSpec = { chassis: 'tracked', length: 5.4, width: 2.63, hullHeight: 1.35, roadWheels: 5, roadWheelRadius: 0.26, trackProfile: run(5.2, 0.75, [2.55, 0.5], [-2.6, 0.55], -2.15, 2.1), running: { wheels: [-1.85, -0.95, -0.05, 0.85, 1.75], rollers: [-1.0, 0.8] }, hullOutline: BMD_HULL };
G['bmd-1'] = { cls: 'ifv', ...BMD, turret: { ...BMP1_TURRET, x: 0.3 }, guns: [GUN_73], addOns: [MALYUTKA] };
// BMD-2 (1985): the BMD-1 hull with a small one-man turret and the 30 mm.
G['bmd-2'] = { cls: 'ifv', ...BMD, turret: turret(0.3, [[-0.8, 0.75], [-0.5, 0.92], [0.5, 0.92], [0.85, 0.65]], [[-0.8, 0.45], [0.4, 0.52], [0.85, 0.35]], 2.4, 0.85), guns: [GUN_2A42], addOns: [{ ...KONKURS, at: [-0.1, 0.18, 0.62] }] };
// BMD-3 (1990): a bigger, boxier hull on five road wheels, the BMP-2 turret (6.0 x 3.13 m, 2.25 m).
const BMD3: GroundSpec = { chassis: 'tracked', length: 6.0, width: 3.13, hullHeight: 1.45, roadWheels: 5, roadWheelRadius: 0.3, trackProfile: run(5.8, 0.82, [2.85, 0.55], [-2.9, 0.6], -2.4, 2.35), running: { wheels: [-2.05, -1.05, -0.05, 0.95, 1.95], rollers: [-1.0, 1.0] }, hullOutline: { top: [[-3.0, 1.3], [-2.85, 1.45], [0.6, 1.45], [3.0, 0.75]], bottom: [[-3.0, 0.75], [2.5, 0.68], [3.0, 0.75]], plan: [[-3.0, 1.5], [2.2, 1.55], [3.0, 0.8]], round: 8, stations: 12 } };
G['bmd-3'] = { cls: 'ifv', ...BMD3, turret: { ...BMP2_TURRET, x: 0.2 }, guns: [GUN_2A42], addOns: [{ ...KONKURS, at: [-0.1, 0.18, 0.88] }] };
// BMD-4 (2004): the BMD-3 hull with the BMP-3's 100 mm + 30 mm module.
G['bmd-4'] = { cls: 'ifv', ...BMD3, length: 6.1, turret: { ...BMP3_TURRET, x: 0.1 }, ...BMP3_WEAPONS, addOns: [barrel(1.1, 0.35, 0.32, 2.9)] };
// BTR-D (1974): the BMD-1 stretched to six road wheels, no turret, a raised troop compartment (6.36 x 2.63 m).
G['btr-d'] = { cls: 'apc-tracked', ...BMD, length: 6.36, roadWheels: 6, trackProfile: run(6.1, 0.75, [3.0, 0.5], [-3.05, 0.55], -2.6, 2.55), running: { wheels: [-2.3, -1.4, -0.5, 0.4, 1.3, 2.2], rollers: [-1.2, 1.0] }, hullOutline: { top: [[-3.18, 1.55], [-3.0, 1.62], [0.4, 1.62], [1.6, 1.3], [3.18, 0.7]], bottom: [[-3.18, 0.7], [2.6, 0.62], [3.18, 0.7]], plan: [[-3.18, 1.25], [1.8, 1.3], [3.18, 0.45]], round: 8, stations: 12 } };

// ---------------------------------------------------------------- BTR

// BTR 8x8s: a boat hull with sides sloping in, the axles in pairs with a gap between; the BPU-1 cone turret with the 14.5 mm
// well forward. BTR-60PB (7.56 x 2.83 m, 2.31 m) evenly spaced axles; BTR-70 (7.54 x 2.8 m, 2.24 m) a lower, longer rear
// deck; BTR-80 (7.65 x 2.9 m, 2.41 m) a taller engine compartment with the big side door; BTR-82A the 30 mm turret.
const BPU1 = turret(1.1, [[-0.6, 0.55], [-0.4, 0.68], [0.4, 0.68], [0.6, 0.5]], [[-0.6, 0.42], [0.3, 0.5], [0.6, 0.35]], 2.2, 0.6);
const KPVT: GunSpec = { mount: 'turret', length: 1.6, calibre: 0.0145, at: 0.5 };
const btrHull = (L: number, deck: number, rear: number): GroundSpec['hullOutline'] => ({ top: [[-L / 2, rear], [-L / 2 + 0.3, deck], [1.6, deck], [2.6, deck - 0.25], [L / 2, 1.05]], bottom: [[-L / 2, 0.95], [-L / 2 + 0.8, 0.55], [2.8, 0.55], [L / 2, 0.95]], plan: [[-L / 2, 1.2], [-2.5, 1.42], [2.0, 1.42], [L / 2, 0.62]], round: 5, stations: 14 });
const BTR = (L: number, W: number, deck: number, rear: number, axleAt: number[]): GroundSpec => ({ chassis: 'wheeled', length: L, width: W, hullHeight: deck, axles: 4, axleAt, wheelRadius: 0.55, hullOutline: btrHull(L, deck, rear) });
G['btr-60'] = { cls: 'apc-wheeled', ...BTR(7.56, 2.83, 1.95, 1.6, [0.62, 0.25, -0.2, -0.57]), turret: BPU1, guns: [KPVT] };
G['btr-70'] = { cls: 'apc-wheeled', ...BTR(7.54, 2.8, 1.95, 1.55, [0.6, 0.27, -0.24, -0.58]), turret: BPU1, guns: [KPVT] };
G['btr-80'] = { cls: 'apc-wheeled', ...BTR(7.65, 2.9, 2.0, 1.9, [0.6, 0.25, -0.22, -0.56]), turret: BPU1, guns: [KPVT], addOns: [tb(-0.5, 0, 0.45, 0.25, 0.9, 0.2, DARK)] };
// BTR-82A (2013): the larger BPPU turret with the 30 mm 2A72.
G['btr-82a'] = { cls: 'apc-wheeled', ...BTR(7.65, 2.9, 2.0, 1.9, [0.6, 0.25, -0.22, -0.56]), turret: turret(1.0, [[-0.8, 0.7], [-0.5, 0.85], [0.5, 0.85], [0.8, 0.6]], [[-0.8, 0.5], [0.4, 0.58], [0.8, 0.4]], 3, 0.8), guns: [GUN_2A42] };
// BTR-90 (1994): a bigger, taller 8x8 with the BMP-2 turret (7.64 x 3.2 m, 2.98 m).
G['btr-90'] = { cls: 'ifv', ...BTR(7.64, 3.2, 2.15, 2.0, [0.6, 0.25, -0.22, -0.56]), turret: { ...BMP2_TURRET, x: 0.6 }, guns: [GUN_2A42], addOns: [KONKURS] };

// ---------------------------------------------------------------- Bradley, Marder, Puma, CV90, Warrior

// Bradley (6.55 x 3.28 m, 2.98 m; 3.6 m wide with the A2's appliqué): a tall box hull with a steep upper front, six road
// wheels behind skirts, the turret offset right with the folding TOW box on its left and the 25 mm.
const BRADLEY: GroundSpec = { chassis: 'tracked', length: 6.55, width: 3.28, hullHeight: 2.05, roadWheels: 6, roadWheelRadius: 0.31, skirts: true, trackProfile: run(6.4, 0.95, [3.15, 0.7], [-3.2, 0.65], -2.6, 2.55), hullOutline: { top: [[-3.27, 1.95], [-3.1, 2.05], [1.2, 2.05], [3.27, 1.2]], bottom: [[-3.27, 0.95], [3.0, 0.95], [3.27, 1.05]], plan: [[-3.27, 1.6], [3.27, 1.55]], round: 12, stations: 12 }, turret: turret(0.0, [[-1.2, 0.95], [-0.9, 1.05], [0.9, 1.05], [1.2, 0.85]], [[-1.2, 0.75], [0.9, 0.8], [1.2, 0.55]], 8, 1.15, { side: 0.35 }), guns: [{ mount: 'turret', length: 2.2, calibre: 0.025, at: 0.45 }] };
const TOW_BOX = tb(-0.1, -1.3, 0.5, 1.3, 0.45, 0.5);
const BRADLEY_A2 = { ...BRADLEY, width: 3.6 };
const APPLIQUE = [hb(-0.7, 1.72, 1.5, 5.0, 0.14, 0.7, M), tb(1.25, 0, 0.42, 0.25, 1.9, 0.55), ...skirtBoxes(-3.0, 3.0, 1.82, 0.62, 0.62, 5, 0.12)];
// M2 (A0, 1981): plain hull sides, light skirts.
G['m2-bradley'] = { cls: 'ifv', ...BRADLEY, addOns: [TOW_BOX] };
// M2A2 (1988): bolted appliqué over the hull's sides and the turret's front, heavy skirts; the ODS with the laser rangefinder and stowage.
G['m2a2-bradley'] = { cls: 'ifv', ...BRADLEY_A2, addOns: [TOW_BOX, ...APPLIQUE] };
G['m2a2-ods-bradley'] = { cls: 'ifv', ...BRADLEY_A2, addOns: [TOW_BOX, ...APPLIQUE, tb(0.9, 0.7, 0.85, 0.4, 0.35, 0.25), hb(-2.6, 0, 2.15, 1.0, 2.6, 0.2, DARK)] };
// M2A3 / M3A3 (2000): the commander's independent viewer on its post at the turret's right rear.
G['m2a3-bradley'] = { cls: 'ifv', ...BRADLEY_A2, addOns: [TOW_BOX, ...APPLIQUE, { on: 'turret', kind: 'drum', at: [-0.8, 0.75, 1.25], size: [0.4, 0.4, 0.5] }, tb(-0.8, 0.75, 0.95, 0.15, 0.15, 0.3, DARK)] };
// Marder 1 (1971): a long sloped glacis, six road wheels and three return rollers in the open, the small turret with the
// 20 mm carried outside above its roof, the Milan on its side (6.79 x 3.24 m, 2.98 m); the 1A3 (1988) with thick appliqué
// on the hull's sides and the turret, and stowage bins.
const MARDER: GroundSpec = { chassis: 'tracked', length: 6.79, width: 3.24, hullHeight: 1.9, roadWheels: 6, roadWheelRadius: 0.33, trackProfile: run(6.6, 0.95, [3.3, 0.65], [-3.3, 0.65], -2.65, 2.6), running: { wheels: [-2.35, -1.45, -0.55, 0.35, 1.25, 2.15], rollers: [-1.4, 0, 1.4] }, hullOutline: { top: [[-3.4, 1.75], [-3.25, 1.9], [0.9, 1.9], [3.4, 0.95]], bottom: [[-3.4, 0.95], [3.2, 0.95], [3.4, 0.95]], plan: [[-3.4, 1.55], [3.4, 1.5]], round: 10, stations: 12 }, turret: turret(0.2, [[-0.9, 0.85], [-0.6, 1.0], [0.6, 1.0], [0.9, 0.8]], [[-0.9, 0.45], [0.7, 0.5], [0.9, 0.35]], 8, 0.9), guns: [{ mount: 'turret', length: 2.6, calibre: 0.02, at: 1.45 }] };
const MILAN = tb(-0.1, -1.05, 0.65, 1.2, 0.16, 0.16, DARK);
G['marder-1a1'] = { cls: 'ifv', ...MARDER, addOns: [MILAN] };
G['marder-1a3'] = { cls: 'ifv', ...MARDER, width: 3.38, addOns: [MILAN, hb(-0.3, 1.68, 1.55, 5.4, 0.16, 0.65, M), tb(0.0, 1.05, 0.25, 1.6, 0.14, 0.45, M)] };
// Puma (2015): a broad flat box with side armour modules down to the skirts, six road wheels, the low unmanned turret with
// the 30 mm and the Spike launcher on its side, the commander's periscope head on its post over the turret's rear (7.6 x
// 3.9 m, 3.6 m to the periscope's top).
G['puma'] = { cls: 'ifv', chassis: 'tracked', length: 7.6, width: 3.9, hullHeight: 2.35, roadWheels: 6, roadWheelRadius: 0.33, skirts: true, skirt: [[-3.7, 0.45], [3.5, 0.45], [3.7, 1.0], [3.7, 1.9], [-3.7, 1.9]], trackProfile: run(7.4, 1.0, [3.65, 0.7], [-3.65, 0.7], -3.0, 3.0), hullOutline: { top: [[-3.8, 2.2], [-3.6, 2.35], [1.4, 2.35], [3.8, 1.4]], bottom: [[-3.8, 1.0], [3.6, 1.0], [3.8, 1.2]], plan: [[-3.8, 1.95], [3.2, 1.95], [3.8, 1.6]], round: 12, stations: 12 }, turret: turret(0.1, [[-1.0, 0.8], [-0.8, 1.0], [0.9, 1.0], [1.2, 0.7]], [[-1.0, 0.5], [0.9, 0.55], [1.2, 0.4]], 10, 1.2), guns: [{ mount: 'turret', length: 3.0, calibre: 0.03, at: 0.5 }], addOns: [tb(-0.3, -1.15, 0.45, 1.1, 0.3, 0.35), { on: 'turret', kind: 'drum', at: [-0.65, -0.55, 0.78], size: [0.2, 0.2, 0.46] }, tb(-0.65, -0.55, 1.13, 0.42, 0.34, 0.24, DARK)] };
// CV90 (Strf 9040, 1993): a high box hull, seven road wheels, the two-man turret with the 40 mm in its shroud (6.47 x 3.1 m, 2.7 m);
// CV9030 the 30 mm, CV9035 the longer 35 mm and a bustle, CV90120 / CV90105 a tank turret with the big gun.
const CV90: GroundSpec = { chassis: 'tracked', length: 6.47, width: 3.1, hullHeight: 1.75, roadWheels: 7, roadWheelRadius: 0.3, skirts: true, trackProfile: run(6.3, 0.9, [3.15, 0.62], [-3.15, 0.65], -2.6, 2.55), hullOutline: { top: [[-3.24, 1.65], [-3.1, 1.75], [1.2, 1.75], [3.24, 1.0]], bottom: [[-3.24, 0.9], [3.0, 0.9], [3.24, 1.0]], plan: [[-3.24, 1.52], [3.24, 1.45]], round: 10, stations: 12 }, turret: turret(0.0, [[-1.3, 0.95], [-1.0, 1.15], [0.7, 1.2], [1.2, 0.9], [1.35, 0.55]], [[-1.3, 0.55], [0.7, 0.65], [1.35, 0.45]], 8, 1.3), guns: [{ mount: 'turret', length: 2.8, calibre: 0.04, sleeve: 0.75, at: 0.5 }] };
G['cv90'] = { cls: 'ifv', ...CV90 };
G['cv9030'] = { cls: 'ifv', ...CV90, guns: [{ mount: 'turret', length: 2.9, calibre: 0.03, at: 0.5 }] };
G['cv9035'] = { cls: 'ifv', ...CV90, turret: turret(-0.1, [[-1.6, 1.0], [-1.2, 1.2], [0.7, 1.25], [1.2, 0.95], [1.4, 0.55]], [[-1.6, 0.6], [0.7, 0.68], [1.4, 0.45]], 8, 1.35), guns: [{ mount: 'turret', length: 3.3, calibre: 0.035, at: 0.5 }] };
G['cv90120'] = { cls: 'light-tank', ...CV90, length: 6.62, turret: turret(-0.3, [[-1.9, 1.2], [-1.5, 1.5], [0.8, 1.55], [1.6, 1.1], [1.9, 0.6]], [[-1.9, 0.6], [0.8, 0.7], [1.9, 0.45]], 10, 1.85), guns: [{ mount: 'turret', length: 5.3, calibre: 0.12, sleeve: 0.7, at: 0.45 }] };
// FV510 Warrior (1988): a box hull, six road wheels under light skirts, the turret with the RARDEN 30 mm (6.34 x 3.03 m, 2.79 m);
// Desert Warrior the 25 mm turret with TOW boxes; Warrior TES with appliqué and slat armour.
const WARRIOR: GroundSpec = { chassis: 'tracked', length: 6.34, width: 3.03, hullHeight: 1.9, roadWheels: 6, roadWheelRadius: 0.32, skirts: true, trackProfile: run(6.2, 0.95, [3.1, 0.65], [-3.1, 0.65], -2.5, 2.45), hullOutline: { top: [[-3.17, 1.8], [-3.0, 1.9], [1.2, 1.9], [3.17, 1.0]], bottom: [[-3.17, 0.95], [2.9, 0.95], [3.17, 1.0]], plan: [[-3.17, 1.5], [3.17, 1.45]], round: 10, stations: 12 }, turret: turret(0.0, [[-1.1, 0.95], [-0.8, 1.15], [0.7, 1.15], [1.1, 0.85]], [[-1.1, 0.55], [0.7, 0.65], [1.1, 0.45]], 8, 1.1), guns: [{ mount: 'turret', length: 2.6, calibre: 0.03, at: 0.5 }] };
G['fv510-warrior'] = { cls: 'ifv', ...WARRIOR };
G['desert-warrior'] = { cls: 'ifv', ...WARRIOR, guns: [{ mount: 'turret', length: 2.2, calibre: 0.025, at: 0.5 }], addOns: [tb(-0.2, 1.3, 0.5, 1.2, 0.4, 0.45, M)] };
G['warrior-tes'] = { cls: 'ifv', ...WARRIOR, width: 3.4, addOns: [hb(-0.2, 1.62, 1.6, 5.8, 0.14, 0.7, M), ...skirtBoxes(-3.0, 3.0, 1.7, 0.62, 0.6, 5, 0.12), ...slats(-3.6, -2.0, 1.75, 1.3, 1.0)] };

// ---------------------------------------------------------------- Stryker, Boxer, LAV-25

// Stryker (6.95 x 2.72 m, 2.64 m): an angular hull with sides sloping in, a steep nose, four axles; the RWS on the roof.
const STRYKER: GroundSpec = { chassis: 'wheeled', length: 6.95, width: 2.72, hullHeight: 2.25, axles: 4, axleAt: [0.66, 0.31, -0.28, -0.63], wheelRadius: 0.55, hullOutline: { top: [[-3.47, 2.1], [-3.3, 2.25], [1.7, 2.25], [3.47, 1.25]], bottom: [[-3.47, 0.6], [3.0, 0.6], [3.47, 0.9]], plan: [[-3.47, 1.33], [2.8, 1.36], [3.47, 1.0]], round: 6, stations: 12 } };
const STRYKER_RWS = [hb(0.4, 0.35, 2.48, 0.6, 0.5, 0.42, DARK), hb(0.95, 0.35, 2.55, 1.0, 0.07, 0.07, DARK)];
G['m1126-stryker'] = { cls: 'apc-wheeled', ...STRYKER, addOns: STRYKER_RWS };
// M1134 ATGM: the raised twin TOW launcher on the roof.
G['m1134-stryker-atgm'] = { cls: 'apc-wheeled', ...STRYKER, addOns: [hb(-0.4, 0, 2.75, 1.4, 0.7, 0.55), hb(-0.4, 0, 2.38, 0.3, 0.3, 0.3, DARK)] };
// M1130 CV: whip and mast antennas, extra boxes on the roof.
G['m1130-stryker-cv'] = { cls: 'apc-wheeled', ...STRYKER, addOns: [...STRYKER_RWS, hb(-1.5, 0, 2.4, 1.5, 1.8, 0.25), hb(-2.6, 1.1, 3.4, 0.05, 0.05, 2.2, { ...M, ...DARK })] };
// M1296 Dragoon: the unmanned MCT-30 turret and its 30 mm.
G['m1296-stryker-dragoon'] = { cls: 'ifv', ...STRYKER, turret: turret(0.3, [[-0.8, 0.6], [-0.6, 0.7], [0.6, 0.7], [0.8, 0.5]], [[-0.8, 0.4], [0.6, 0.45], [0.8, 0.3]], 8, 0.8), guns: [{ mount: 'turret', length: 2.9, calibre: 0.03, at: 0.5 }] };
// M1128 MGS: a low, long unmanned turret with the 105 mm.
G['m1128-stryker-mgs'] = { cls: 'tank-destroyer', ...STRYKER, turret: turret(-0.2, [[-1.7, 0.75], [-1.3, 0.92], [0.8, 0.92], [1.3, 0.6]], [[-1.7, 0.45], [0.8, 0.5], [1.3, 0.35]], 10, 1.25), guns: [{ mount: 'turret', length: 5.0, calibre: 0.105, extractor: 0.55, muzzle: true, at: 0.5 }] };
// Boxer (2009): a tall 8x8 drive module with the mission module on top, a long sloped nose (7.93 x 2.99 m, 2.37 m hull roof);
// with the RWS (armoured transport) or the RCT30 turret (Schakal).
const BOXER: GroundSpec = { chassis: 'wheeled', length: 7.93, width: 2.99, hullHeight: 2.37, axles: 4, axleAt: [0.72, 0.36, -0.28, -0.64], wheelRadius: 0.62, hullOutline: { top: [[-3.97, 2.2], [-3.8, 2.37], [1.6, 2.37], [3.0, 2.05], [3.97, 1.3]], bottom: [[-3.97, 0.6], [3.4, 0.6], [3.97, 0.95]], plan: [[-3.97, 1.45], [3.5, 1.5], [3.97, 1.2]], round: 8, stations: 12 } };
G['boxer'] = { cls: 'apc-wheeled', ...BOXER, addOns: [hb(0.6, 0.4, 2.6, 0.6, 0.5, 0.45, DARK), hb(1.15, 0.4, 2.68, 1.0, 0.07, 0.07, DARK)] };
G['boxer-rct30'] = { cls: 'ifv', ...BOXER, turret: turret(0.0, [[-1.0, 0.8], [-0.8, 1.0], [0.9, 1.0], [1.2, 0.7]], [[-1.0, 0.5], [0.9, 0.55], [1.2, 0.4]], 10, 1.2), guns: [{ mount: 'turret', length: 3.0, calibre: 0.03, at: 0.5 }] };
// LAV-25 (1983): a long sloped front, the axles paired front and back, the two-man turret with the 25 mm (6.39 x 2.5 m, 2.69 m).
G['lav-25'] = { cls: 'ifv', chassis: 'wheeled', length: 6.39, width: 2.5, hullHeight: 1.95, axles: 4, axleAt: [0.66, 0.36, -0.3, -0.6], wheelRadius: 0.5, hullOutline: { top: [[-3.2, 1.85], [-3.0, 1.95], [0.9, 1.95], [3.2, 1.1]], bottom: [[-3.2, 0.6], [2.8, 0.6], [3.2, 0.9]], plan: [[-3.2, 1.22], [2.6, 1.25], [3.2, 0.85]], round: 6, stations: 12 }, turret: turret(0.0, [[-0.9, 0.8], [-0.7, 0.95], [0.6, 0.95], [0.9, 0.7]], [[-0.9, 0.55], [0.6, 0.6], [0.9, 0.4]], 6, 0.9), guns: [{ mount: 'turret', length: 2.2, calibre: 0.025, at: 0.5 }] };

// ---------------------------------------------------------------- tracked carriers

// M113 (1960): the aluminium box with its steep front plate, five road wheels and no return rollers, the commander's .50
// (4.86 x 2.69 m, 2.5 m); M113 with a TOW on a pedestal; M901 ITV the "hammerhead" TOW launcher raised on its arm.
const M113: GroundSpec = { chassis: 'tracked', length: 4.86, width: 2.69, hullHeight: 1.85, roadWheels: 5, roadWheelRadius: 0.31, trackProfile: run(4.7, 0.8, [2.3, 0.55], [-2.35, 0.5], -1.9, 1.85), running: { wheels: [-1.6, -0.8, 0, 0.8, 1.6] }, hullOutline: { top: [[-2.43, 1.85], [1.1, 1.85], [2.43, 1.2]], bottom: [[-2.43, 0.8], [1.9, 0.8], [2.43, 1.2]], plan: [[-2.43, 1.32], [2.43, 1.3]], round: 14, stations: 10 } };
const CUPOLA_50 = [hb(0.4, -0.35, 2.02, 0.6, 0.6, 0.3), hb(0.95, -0.35, 2.12, 0.9, 0.06, 0.06, DARK)];
G['m113'] = { cls: 'apc-tracked', ...M113, addOns: CUPOLA_50 };
G['m113-tow'] = { cls: 'atgm', ...M113, addOns: [hb(0.0, 0, 2.2, 0.15, 0.15, 0.6, DARK), hb(0.1, 0, 2.55, 1.3, 0.25, 0.25)] };
G['m901-itv'] = { cls: 'atgm', ...M113, addOns: [hb(-0.2, 0.5, 2.2, 0.2, 0.2, 0.7, DARK), hb(0.0, 0.5, 2.75, 1.0, 0.9, 0.55)] };
// FV432 (1963): a steel box with an upright front plate, five road wheels and two return rollers, the exhaust on the left (5.25 x 2.8 m, 2.28 m).
G['fv432'] = { cls: 'apc-tracked', ...M113, length: 5.25, width: 2.8, roadWheels: 5, trackProfile: run(5.1, 0.85, [2.5, 0.6], [-2.55, 0.55], -2.0, 2.0), running: { wheels: [-1.75, -0.88, 0, 0.88, 1.75], rollers: [-0.9, 0.9] }, hullOutline: { top: [[-2.62, 1.88], [1.6, 1.88], [2.3, 1.4], [2.62, 1.3]], bottom: [[-2.62, 0.85], [2.3, 0.85], [2.62, 1.0]], plan: [[-2.62, 1.38], [2.62, 1.36]], round: 14, stations: 10 }, addOns: [hb(0.6, -0.4, 2.05, 0.6, 0.6, 0.35), hb(-0.5, -1.45, 1.5, 1.4, 0.15, 0.15, DARK)] };
// MT-LB (1970): a long flat hull with the raised cab at the front, six road wheels and no rollers, the small MG turret on the cab (6.45 x 2.85 m, 1.87 m).
G['mt-lb'] = { cls: 'apc-tracked', chassis: 'tracked', length: 6.45, width: 2.85, hullHeight: 1.6, roadWheels: 6, roadWheelRadius: 0.3, trackProfile: run(6.2, 0.8, [3.05, 0.55], [-3.1, 0.5], -2.6, 2.6), running: { wheels: [-2.4, -1.45, -0.5, 0.45, 1.4, 2.35] }, hullOutline: { top: [[-3.22, 1.5], [-3.0, 1.6], [1.4, 1.6], [1.6, 1.75], [2.6, 1.75], [3.22, 1.0]], bottom: [[-3.22, 0.7], [2.9, 0.65], [3.22, 1.0]], plan: [[-3.22, 1.38], [3.22, 1.38]], round: 12, stations: 12 }, turret: turret(2.1, [[-0.4, 0.4], [0.35, 0.4], [0.45, 0.25]], [[-0.4, 0.38], [0.45, 0.3]], 2.4, 0.4, { side: 0.6, up: 0.15 }), guns: [{ mount: 'turret', length: 0.9, calibre: 0.008, at: 0.5 }] };
// AAV-7A1 (1972): a tall boat hull with an upturned bow, six road wheels, the small weapon station on the right front (7.94 x 3.27 m, 3.26 m).
G['aav-7a1'] = { cls: 'apc-tracked', chassis: 'tracked', length: 7.94, width: 3.27, hullHeight: 2.6, roadWheels: 6, roadWheelRadius: 0.32, skirts: true, trackProfile: run(7.2, 0.95, [3.3, 0.7], [-3.6, 0.6], -3.1, 2.7), hullOutline: { top: [[-3.97, 2.45], [-3.8, 2.6], [1.8, 2.6], [3.97, 1.6]], bottom: [[-3.97, 0.95], [3.0, 0.95], [3.97, 1.5]], plan: [[-3.97, 1.6], [3.2, 1.62], [3.97, 1.2]], round: 12, stations: 12 }, turret: turret(1.4, [[-0.6, 0.55], [0.55, 0.55], [0.7, 0.4]], [[-0.6, 0.6], [0.7, 0.5]], 6, 0.65, { side: 0.85 }), guns: [{ mount: 'turret', length: 1.3, calibre: 0.04, at: 0.5 }] };
// BMPT Terminator (2011): the T-72 hull, a turret with twin 30 mm cannons and two armoured Ataka launchers either side.
G['bmpt-terminator'] = { cls: 'ifv', ...T72, turret: turret(0.1, [[-1.6, 0.95], [-1.2, 1.35], [0.8, 1.4], [1.5, 1.0], [1.7, 0.45]], [[-1.6, 0.5], [0.8, 0.62], [1.7, 0.4]], 8, 1.6), guns: [{ mount: 'turret', count: 2, length: 2.9, calibre: 0.03, spread: 0.4, at: 0.6 }], addOns: [tb(-0.1, 1.6, 0.9, 2.0, 0.42, 0.5, M), ...T72_GLACIS(0.22)] };
// HS.30 / SPz 12-3 (1959): a low hull on five road wheels, the small 20 mm turret offset right (5.56 x 2.54 m, 1.85 m).
G['spz-12-3'] = { cls: 'ifv', chassis: 'tracked', length: 5.56, width: 2.54, hullHeight: 1.45, roadWheels: 5, roadWheelRadius: 0.32, trackProfile: run(5.4, 0.8, [2.65, 0.55], [-2.7, 0.55], -2.1, 2.1), running: { wheels: [-1.8, -0.9, 0, 0.9, 1.8] }, hullOutline: { top: [[-2.78, 1.3], [-2.6, 1.45], [0.8, 1.45], [2.78, 0.85]], bottom: [[-2.78, 0.75], [2.5, 0.75], [2.78, 0.85]], plan: [[-2.78, 1.25], [2.78, 1.2]], round: 10, stations: 10 }, turret: turret(0.6, [[-0.55, 0.45], [0.5, 0.45], [0.6, 0.3]], [[-0.55, 0.42], [0.6, 0.3]], 6, 0.6, { side: 0.5 }), guns: [{ mount: 'turret', length: 1.8, calibre: 0.02, at: 0.5 }] };

// ---------------------------------------------------------------- wheeled carriers and recon

// A wheeled hull from its length, deck, nose height and half-width, a long sloped front ending in a V bow.
const wheeledHull = (L: number, deck: number, nose: number, hw: number, front = 1.6, belly = 0.6): GroundSpec['hullOutline'] => ({ top: [[-L / 2, deck - 0.15], [-L / 2 + 0.2, deck], [L / 2 - front, deck], [L / 2, nose]], bottom: [[-L / 2, belly + 0.2], [-L / 2 + 0.5, belly], [L / 2 - 0.6, belly], [L / 2, nose - 0.15]], plan: [[-L / 2, hw - 0.1], [-L / 2 + 0.4, hw], [L / 2 - front * 0.6, hw], [L / 2, hw * 0.6]], round: 6, stations: 12 });
const wheeledTurret = (x: number, l: number, hw: number, h: number): GroundSpec['turret'] => turret(x, [[-l / 2, hw * 0.85], [-l / 2 + 0.25, hw], [l / 2 - 0.3, hw], [l / 2, hw * 0.7]], [[-l / 2, h * 0.85], [l / 2 - 0.3, h], [l / 2, h * 0.75]], 6, l / 2);
// BRDM-2 (1962): a 4x4 boat hull, the BPU-1 turret amidships (5.75 x 2.37 m, 2.31 m); BRDM-2 Malyutka no turret, six
// missiles on an arm raised from the hull; BRDM-1 smaller and open (5.7 x 2.25 m).
const BRDM: GroundSpec = { chassis: 'wheeled', length: 5.75, width: 2.37, hullHeight: 1.8, axles: 2, axleAt: [0.55, -0.42], wheelRadius: 0.55, hullOutline: wheeledHull(5.75, 1.8, 1.05, 1.18, 1.8) };
G['brdm-2'] = { cls: 'scout-car', ...BRDM, turret: { ...BPU1, x: -0.2 }, guns: [KPVT] };
G['brdm-2-malyutka'] = { cls: 'atgm', ...BRDM, missiles: [{ mount: 'hull', rows: 1, cols: 6, length: 0.86, diameter: 0.125, elevation: 0.1, x: -0.4, up: 0.45 }] };
G['brdm-1'] = { cls: 'scout-car', ...BRDM, length: 5.7, width: 2.25, hullHeight: 1.6, openTop: true, hullOutline: wheeledHull(5.7, 1.6, 1.0, 1.12, 1.6) };
// AML-90 / Eland-90 (1961): a small 4x4 with the big H-90 turret and its 90 mm (3.79 x 1.97 m, 2.07 m).
G['aml-90'] = { cls: 'scout-car', chassis: 'wheeled', length: 3.79, width: 1.97, hullHeight: 1.35, axles: 2, axleAt: [0.55, -0.55], wheelRadius: 0.48, hullOutline: wheeledHull(3.79, 1.35, 0.9, 0.98, 1.0, 0.45), turret: wheeledTurret(-0.1, 1.6, 0.85, 0.7), guns: [{ mount: 'turret', length: 2.8, calibre: 0.09, muzzle: true, at: 0.5 }] };
// Panhard EBR (1951): a long 8x8 pointed at both ends, the oscillating FL-11 turret with its long gun (6.15 x 2.42 m, 2.32 m).
G['panhard-ebr'] = { cls: 'scout-car', chassis: 'wheeled', length: 6.15, width: 2.42, hullHeight: 1.5, axles: 4, axleAt: [0.75, 0.25, -0.25, -0.75], wheelRadius: 0.6, hullOutline: { top: [[-3.07, 1.0], [-2.3, 1.5], [2.3, 1.5], [3.07, 1.0]], bottom: [[-3.07, 0.8], [-2.3, 0.55], [2.3, 0.55], [3.07, 0.8]], plan: [[-3.07, 0.8], [-2.3, 1.2], [2.3, 1.2], [3.07, 0.8]], round: 6, stations: 12 }, turret: turret(0.0, [[-1.1, 0.8], [-0.8, 1.0], [0.8, 1.0], [1.1, 0.75]], [[-1.1, 0.5], [0.8, 0.7], [1.1, 0.5]], 4, 1.05), guns: [{ mount: 'turret', length: 3.8, calibre: 0.075, muzzle: true, at: 0.55 }] };
// AMX-10RC (1981): a boxy 6x6 with a big turret and the 105 mm (6.36 x 2.95 m, 2.66 m).
G['amx-10rc'] = { cls: 'tank-destroyer', chassis: 'wheeled', length: 6.36, width: 2.95, hullHeight: 1.75, axles: 3, axleAt: [0.6, 0.0, -0.6], wheelRadius: 0.6, hullOutline: wheeledHull(6.36, 1.75, 1.1, 1.47, 1.4), turret: wheeledTurret(-0.3, 2.4, 1.15, 0.85), guns: [{ mount: 'turret', length: 4.6, calibre: 0.105, muzzle: true, at: 0.5 }] };
// Rooikat (1989): an 8x8 with a long sloped nose and the turret amidships, the 76 mm (7.09 x 2.9 m, 2.8 m); the 105 mm version.
G['rooikat'] = { cls: 'tank-destroyer', chassis: 'wheeled', length: 7.09, width: 2.9, hullHeight: 1.85, axles: 4, axleAt: [0.7, 0.33, -0.3, -0.67], wheelRadius: 0.62, hullOutline: wheeledHull(7.09, 1.85, 1.15, 1.45, 2.0), turret: wheeledTurret(-0.3, 2.4, 1.15, 0.8), guns: [{ mount: 'turret', length: 4.0, calibre: 0.076, extractor: 0.6, at: 0.5 }] };
// FV721 Fox (1973): a small 4x4 with the RARDEN turret (4.2 x 2.13 m, 2.2 m).
G['fv721-fox'] = { cls: 'scout-car', chassis: 'wheeled', length: 4.2, width: 2.13, hullHeight: 1.5, axles: 2, axleAt: [0.55, -0.55], wheelRadius: 0.48, hullOutline: wheeledHull(4.2, 1.5, 1.0, 1.06, 1.2, 0.45), turret: wheeledTurret(-0.2, 1.4, 0.8, 0.6), guns: [{ mount: 'turret', length: 2.6, calibre: 0.03, at: 0.5 }] };
// Fiat 6616 (1977): a 4x4 with a two-man turret, the 20 mm or (Cockerill) a 90 mm (5.37 x 2.5 m, 2.03 m).
G['fiat-6616'] = { cls: 'scout-car', chassis: 'wheeled', length: 5.37, width: 2.5, hullHeight: 1.5, axles: 2, axleAt: [0.55, -0.5], wheelRadius: 0.55, hullOutline: wheeledHull(5.37, 1.5, 1.0, 1.25, 1.4), turret: wheeledTurret(-0.2, 1.5, 0.85, 0.55), guns: [{ mount: 'turret', length: 1.9, calibre: 0.02, at: 0.5 }] };
// Ratel (1976): a tall 6x6 box with the turret forward, the 20 mm, 90 mm or ZT3 missiles (7.21 x 2.52 m, 2.92 m).
G['ratel'] = { cls: 'ifv', chassis: 'wheeled', length: 7.21, width: 2.52, hullHeight: 2.35, axles: 3, axleAt: [0.6, -0.1, -0.6], wheelRadius: 0.6, hullOutline: wheeledHull(7.21, 2.35, 1.5, 1.26, 1.8, 0.7), turret: wheeledTurret(0.3, 1.6, 0.85, 0.6), guns: [{ mount: 'turret', length: 2.0, calibre: 0.02, at: 0.5 }] };
// Luchs (1975): a boat-shaped 8x8 with the 20 mm turret over the middle, the rear steering station (7.74 x 2.98 m, 2.84 m);
// Radpanzer 90 a bigger turret with the 105 mm.
const LUCHS: GroundSpec = { chassis: 'wheeled', length: 7.74, width: 2.98, hullHeight: 2.1, axles: 4, axleAt: [0.7, 0.32, -0.32, -0.7], wheelRadius: 0.62, hullOutline: { top: [[-3.87, 1.5], [-3.2, 2.1], [2.4, 2.1], [3.87, 1.4]], bottom: [[-3.87, 1.2], [-3.2, 0.65], [3.2, 0.65], [3.87, 1.2]], plan: [[-3.87, 0.9], [-3.0, 1.49], [3.0, 1.49], [3.87, 0.9]], round: 6, stations: 12 } };
G['luchs'] = { cls: 'scout-car', ...LUCHS, turret: wheeledTurret(-0.2, 1.6, 0.85, 0.55), guns: [{ mount: 'turret', length: 1.9, calibre: 0.02, at: 0.5 }] };
G['radpanzer-90'] = { cls: 'tank-destroyer', ...LUCHS, turret: wheeledTurret(-0.4, 2.6, 1.25, 0.8), guns: [{ mount: 'turret', length: 5.2, calibre: 0.105, sleeve: 0.7, extractor: 0.55, at: 0.5 }] };
// VBCI (2008): a tall angular 8x8, the Dragar 25 mm turret (7.6 x 2.98 m, 3.0 m); Patria AMV (7.7 x 2.8 m) and Freccia
// (the Centauro hull as an IFV) with their turrets; Jaguar EBRC (2021) a 6x6 with the 40 mm CTA turret and its missile box.
G['vbci'] = { cls: 'ifv', chassis: 'wheeled', length: 7.6, width: 2.98, hullHeight: 2.35, axles: 4, axleAt: [0.72, 0.38, -0.28, -0.62], wheelRadius: 0.62, hullOutline: wheeledHull(7.6, 2.35, 1.4, 1.49, 1.8), turret: wheeledTurret(0.6, 1.6, 0.8, 0.6), guns: [{ mount: 'turret', length: 2.3, calibre: 0.025, at: 0.5 }] };
G['patria-amv'] = { cls: 'ifv', chassis: 'wheeled', length: 7.7, width: 2.8, hullHeight: 2.3, axles: 4, axleAt: [0.72, 0.37, -0.28, -0.63], wheelRadius: 0.62, hullOutline: wheeledHull(7.7, 2.3, 1.2, 1.4, 2.2), turret: wheeledTurret(-0.3, 2.0, 0.95, 0.7), guns: [{ mount: 'turret', length: 3.0, calibre: 0.03, at: 0.5 }] };
G['freccia'] = { cls: 'ifv', ...CENTAURO, hullOutline: { top: [[-3.7, 2.05], [-3.5, 2.2], [1.4, 2.2], [3.7, 1.15]], bottom: [[-3.7, 0.65], [3.0, 0.65], [3.7, 1.0]], plan: [[-3.7, 1.42], [2.8, 1.5], [3.7, 1.1]], round: 8, stations: 12 }, hullHeight: 2.2, turret: wheeledTurret(0.3, 1.6, 0.85, 0.6), guns: [{ mount: 'turret', length: 2.3, calibre: 0.025, at: 0.5 }] };
G['jaguar-ebrc'] = { cls: 'scout-car', chassis: 'wheeled', length: 7.8, width: 2.99, hullHeight: 2.2, axles: 3, axleAt: [0.65, 0.05, -0.55], wheelRadius: 0.65, hullOutline: wheeledHull(7.8, 2.2, 1.3, 1.49, 2.2), turret: wheeledTurret(-0.4, 2.0, 1.0, 0.7), guns: [{ mount: 'turret', length: 2.8, calibre: 0.04, sleeve: 0.6, at: 0.5 }], addOns: [tb(-0.2, -1.25, 0.5, 1.4, 0.4, 0.45)] };
// Fuchs (1979): a 6x6 with the big V bow and tall flat sides (6.83 x 2.98 m, 2.37 m); VAB (1976): a 4x4 box with a sloped
// front and the windscreen (5.98 x 2.49 m, 2.06 m); VAB Mephisto with its HOT launcher raised on the roof.
G['tpz-fuchs'] = { cls: 'apc-wheeled', chassis: 'wheeled', length: 6.83, width: 2.98, hullHeight: 2.3, axles: 3, axleAt: [0.55, 0.0, -0.5], wheelRadius: 0.6, hullOutline: { top: [[-3.41, 2.2], [-3.2, 2.3], [1.8, 2.3], [3.41, 1.4]], bottom: [[-3.41, 0.7], [2.2, 0.6], [3.41, 1.0]], plan: [[-3.41, 1.4], [2.0, 1.49], [3.41, 0.7]], round: 8, stations: 12 } };
const VAB: GroundSpec = { chassis: 'wheeled', length: 5.98, width: 2.49, hullHeight: 2.06, axles: 2, axleAt: [0.6, -0.4], wheelRadius: 0.55, hullOutline: { top: [[-2.99, 1.95], [-2.8, 2.06], [1.6, 2.06], [2.99, 1.25]], bottom: [[-2.99, 0.65], [2.5, 0.6], [2.99, 0.9]], plan: [[-2.99, 1.22], [2.5, 1.24], [2.99, 1.0]], round: 10, stations: 12 } };
G['vab'] = { cls: 'apc-wheeled', ...VAB, addOns: [hb(0.6, 0, 2.2, 0.6, 0.6, 0.25)] };
G['vab-mephisto'] = { cls: 'atgm', ...VAB, addOns: [hb(-0.6, 0, 2.6, 1.4, 1.0, 0.6), hb(-0.6, 0, 2.25, 0.3, 0.3, 0.3, DARK)] };
// WZ-551 (1995): a 6x6 boat hull with the 25 mm turret (6.65 x 2.8 m, 2.85 m).
G['wz-551'] = { cls: 'apc-wheeled', chassis: 'wheeled', length: 6.65, width: 2.8, hullHeight: 2.15, axles: 3, axleAt: [0.6, 0.0, -0.55], wheelRadius: 0.58, hullOutline: wheeledHull(6.65, 2.15, 1.2, 1.4, 1.8), turret: wheeledTurret(0.2, 1.5, 0.8, 0.6), guns: [{ mount: 'turret', length: 2.3, calibre: 0.025, at: 0.5 }] };
// ZBD-04A (2011): a BMP-3-like hull with the 100 mm + 30 mm turret; ZBD-05 (2006) a long amphibious hull with its planing bow (9.5 x 3.6 m) and a 30 mm turret.
G['zbd-04a'] = { cls: 'ifv', ...BMP3, length: 7.2, addOns: [barrel(1.1, 0.35, 0.32, 2.9), ...glacis(7.2, 1.45, 0.97, 0.95, 0.15, 2.9)] };
G['zbd-05'] = { cls: 'ifv', chassis: 'tracked', length: 9.5, width: 3.6, hullHeight: 1.95, roadWheels: 6, roadWheelRadius: 0.32, skirts: true, trackProfile: run(7.4, 0.9, [3.0, 0.62], [-4.3, 0.6], -3.8, 2.6), hullOutline: { top: [[-4.75, 1.85], [-4.5, 1.95], [1.6, 1.95], [4.75, 1.05]], bottom: [[-4.75, 0.95], [3.0, 0.9], [4.75, 1.05]], plan: [[-4.75, 1.75], [3.6, 1.8], [4.75, 1.5]], round: 10, stations: 12 }, turret: turret(-0.6, [[-1.0, 0.95], [-0.7, 1.15], [0.6, 1.15], [1.0, 0.8]], [[-1.0, 0.5], [0.6, 0.6], [1.0, 0.42]], 6, 1.0), guns: [{ mount: 'turret', length: 2.9, calibre: 0.03, at: 0.5 }] };
// Light tanks on tracks from the War Thunder trees: Cadillac Gage CCVL (1985: an angular hull, the M68 in a low turret, 6.2 x 2.69 m)
// and the Ru 251 (1960s: a Leopard-like light tank with a 90 mm, 6.3 x 3.0 m).
G['ccvl'] = { cls: 'light-tank', chassis: 'tracked', length: 6.2, width: 2.69, hullHeight: 1.5, roadWheels: 5, roadWheelRadius: 0.32, skirts: true, trackProfile: run(6.0, 0.85, [3.0, 0.55], [-3.0, 0.6], -2.4, 2.4), hullOutline: hull(6.2, 2.69, 1.5, 0.85, 1.8, 0.95, 0.15), turret: turret(-0.4, [[-1.9, 1.0], [-1.5, 1.25], [0.6, 1.3], [1.4, 1.0], [1.7, 0.5]], [[-1.9, 0.5], [0.6, 0.6], [1.7, 0.4]], 8, 1.65), guns: [M68] };
G['ru-251'] = { cls: 'light-tank', chassis: 'tracked', length: 6.3, width: 3.0, hullHeight: 1.5, roadWheels: 6, roadWheelRadius: 0.31, trackProfile: run(6.1, 0.85, [3.05, 0.6], [-3.05, 0.6], -2.5, 2.5), running: { wheels: [-2.25, -1.35, -0.45, 0.45, 1.35, 2.25], rollers: [-1.3, 0, 1.3] }, hullOutline: hull(6.3, 3.0, 1.5, 0.85, 1.6, 1.0, 0.15), turret: turret(-0.2, [[-1.6, 0.95], [-1.2, 1.25], [0.6, 1.3], [1.3, 0.95], [1.5, 0.5]], [[-1.6, 0.5], [0.6, 0.62], [1.5, 0.42]], 6, 1.45), guns: [{ mount: 'turret', length: 4.4, calibre: 0.09, muzzle: true, at: 0.45 }], cupola: true };

// ---------------------------------------------------------------- self-propelled artillery

// M109 (1963): a low hull with seven road wheels and no rollers, the big box turret over the back half; the short M126
// howitzer with its muzzle brake (hull 6.11 x 3.15 m, 3.28 m); M109A1 (1973) the long M185; M109A6 Paladin (1994) a
// longer bustle, side armour on the turret, the M284.
const M109: GroundSpec = { chassis: 'tracked', length: 6.11, width: 3.15, hullHeight: 1.6, roadWheels: 7, roadWheelRadius: 0.3, trackProfile: run(5.95, 0.9, [2.95, 0.6], [-2.95, 0.65], -2.45, 2.4), running: { wheels: [-2.15, -1.43, -0.71, 0.01, 0.73, 1.45, 2.17] }, hullOutline: { top: [[-3.05, 1.5], [-2.9, 1.6], [1.6, 1.6], [3.05, 1.0]], bottom: [[-3.05, 0.9], [2.8, 0.9], [3.05, 1.0]], plan: [[-3.05, 1.55], [3.05, 1.5]], round: 12, stations: 10 }, turret: turret(-0.9, [[-1.9, 1.45], [1.6, 1.5], [2.0, 1.2]], [[-1.9, 1.45], [1.5, 1.5], [2.0, 1.15]], 12, 1.95), cupola: true };
G['m109'] = { cls: 'sp-artillery', ...M109, guns: [{ mount: 'turret', length: 3.6, calibre: 0.155, muzzle: true, extractor: 0.5, at: 0.4, elevation: 0.05 }] };
G['m109a1'] = { cls: 'sp-artillery', ...M109, guns: [{ mount: 'turret', length: 6.0, calibre: 0.155, muzzle: true, extractor: 0.45, at: 0.4, elevation: 0.05 }] };
G['m109-paladin'] = { cls: 'sp-artillery', ...M109, turret: turret(-1.0, [[-2.4, 1.45], [1.6, 1.55], [2.0, 1.2]], [[-2.4, 1.4], [1.5, 1.5], [2.0, 1.15]], 12, 1.95), guns: [{ mount: 'turret', length: 6.1, calibre: 0.155, muzzle: true, at: 0.4, elevation: 0.05 }], addOns: [tb(0.2, 1.55, 0.55, 2.4, 0.12, 0.8, M)] };
// M44 (1953): the howitzer in an open-topped box over the back (6.16 x 3.24 m); M55 (1956) the same chassis with a big closed turret and the 8-inch.
const M44_HULL: GroundSpec = { chassis: 'tracked', length: 6.16, width: 3.24, hullHeight: 1.5, roadWheels: 6, roadWheelRadius: 0.32, trackProfile: run(6.0, 0.9, [3.0, 0.6], [-3.0, 0.6], -2.45, 2.45), running: { wheels: [-2.2, -1.32, -0.44, 0.44, 1.32, 2.2], rollers: [-1.3, 0, 1.3] }, hullOutline: hull(6.16, 3.24, 1.5, 0.88, 1.2, 1.05, 0.1, 8) };
G['m44'] = { cls: 'sp-artillery', ...M44_HULL, turret: { x: -1.2, length: 3.4, width: 3.1, height: 1.2, shape: 'open' }, guns: [{ mount: 'turret', length: 3.6, calibre: 0.155, muzzle: true, at: 0.6, elevation: 0.12 }] };
G['m55'] = { cls: 'sp-artillery', ...M44_HULL, turret: turret(-1.2, [[-1.7, 1.5], [1.4, 1.55], [1.75, 1.25]], [[-1.7, 1.45], [1.4, 1.5], [1.75, 1.2]], 10, 1.7), guns: [{ mount: 'turret', length: 5.0, calibre: 0.203, at: 0.45, elevation: 0.08 }] };
// M110A2 (1977): the bare 8-inch on an open mount over the back, five road wheels, the spade (5.72 x 3.15 m).
G['m110a2'] = { cls: 'sp-artillery', chassis: 'tracked', length: 5.72, width: 3.15, hullHeight: 1.5, roadWheels: 5, roadWheelRadius: 0.35, trackProfile: run(5.5, 0.9, [2.75, 0.6], [-2.75, 0.6], -2.3, 2.25), running: { wheels: [-2.0, -1.0, 0, 1.0, 2.0] }, hullOutline: hull(5.72, 3.15, 1.5, 0.88, 1.0, 1.1, 0.1, 8), turret: { x: -1.6, length: 1.6, width: 2.2, height: 0.8, shape: 'open' }, guns: [{ mount: 'turret', length: 7.6, calibre: 0.203, elevation: 0.15, at: 0.6 }], addOns: [hb(-3.1, 0, 0.6, 0.3, 2.6, 0.9, { pitch: 0.6 })] };
// 2S1 Gvozdika (1971): the long low MT-LB-derived boat hull on seven road wheels, the low rounded turret behind, the 122 mm (7.26 x 2.85 m, 2.73 m).
G['2s1-gvozdika'] = { cls: 'sp-artillery', chassis: 'tracked', length: 7.26, width: 2.85, hullHeight: 1.6, roadWheels: 7, roadWheelRadius: 0.3, trackProfile: run(6.9, 0.8, [3.4, 0.55], [-3.45, 0.5], -2.95, 2.95), running: { wheels: [-2.7, -1.8, -0.9, 0, 0.9, 1.8, 2.7] }, hullOutline: { top: [[-3.63, 1.5], [-3.4, 1.6], [1.6, 1.6], [3.63, 0.9]], bottom: [[-3.63, 0.7], [3.0, 0.65], [3.63, 0.9]], plan: [[-3.63, 1.4], [3.0, 1.42], [3.63, 1.1]], round: 8, stations: 12 }, turret: turret(-0.9, [[-1.3, 1.0], [-0.9, 1.2], [0.9, 1.2], [1.4, 0.8]], [[-1.3, 0.6], [0.8, 0.7], [1.4, 0.45]], 6, 1.35), guns: [{ mount: 'turret', length: 4.3, calibre: 0.122, muzzle: true, extractor: 0.55, at: 0.45, elevation: 0.05 }] };
// 2S3 Akatsiya (1971): six road wheels and four return rollers, the big rounded turret over the back, the 152 mm (7.76 x 3.25 m, 3.05 m).
G['2s3-akatsiya'] = { cls: 'sp-artillery', chassis: 'tracked', length: 7.76, width: 3.25, hullHeight: 1.6, roadWheels: 6, roadWheelRadius: 0.35, trackProfile: run(7.4, 0.95, [3.65, 0.65], [-3.65, 0.6], -3.0, 3.0), running: { wheels: [-2.7, -1.6, -0.5, 0.6, 1.7, 2.8], rollers: [-2.2, -0.7, 0.8, 2.3] }, hullOutline: hull(7.76, 3.25, 1.6, 0.92, 1.8, 1.05, 0.1, 8), turret: turret(-1.2, [[-1.8, 1.25], [-1.4, 1.5], [1.2, 1.55], [1.9, 1.1]], [[-1.8, 1.1], [1.2, 1.3], [1.9, 0.95]], 4, 1.85), guns: [{ mount: 'turret', length: 4.6, calibre: 0.152, muzzle: true, extractor: 0.55, at: 0.45, elevation: 0.05 }] };
// 2S19 Msta-S (1989): the T-72 / T-80 running gear, the big slab turret, the long 152 mm with its brake (hull 7.15 x 3.38 m, 2.99 m).
G['2s19-msta'] = { cls: 'sp-artillery', ...T72, length: 7.15, width: 3.38, trackProfile: run(7.0, 0.88, [3.5, 0.62], [-3.5, 0.7], -2.85, 2.8), hullOutline: hull(7.15, 3.38, 1.4, 0.8, 1.9, 0.95, 0.15), turret: turret(-0.8, [[-2.4, 1.55], [1.8, 1.6], [2.1, 1.3]], [[-2.4, 1.3], [1.8, 1.35], [2.1, 1.05]], 12, 2.05), guns: [{ mount: 'turret', length: 7.1, calibre: 0.152, muzzle: true, extractor: 0.5, at: 0.45, elevation: 0.05 }], cupola: true, addOns: [] };

// ---------------------------------------------------------------- air defence on tracks and trucks

// M247 Sergeant York (1985): the M48A5 hull, a big turret with the twin 40 mm on its sides, the search dish on the back of the roof.
G['m247-sergeant-york'] = { cls: 'spaa', ...PATTON, length: 6.82, turret: { x: -0.3, length: 3.2, width: 2.8, height: 1.15, shape: 'box' }, guns: [{ mount: 'turret-side', count: 1, length: 2.8, calibre: 0.04, elevation: 0.15, at: 0.55 }], radars: [{ kind: 'dish', x: -1.2, up: 0.55, size: 1.4, back: true }, { kind: 'dish', x: 1.65, up: -0.45, size: 0.8 }] };
// Chieftain Marksman (1980s): the Chieftain hull with the Marksman turret, twin 35 mm on its sides, the search radar on top.
G['chieftain-marksman'] = { cls: 'spaa', ...CHIEFTAIN, turret: { x: -0.4, length: 2.8, width: 2.6, height: 1.0, shape: 'box' }, guns: [{ mount: 'turret-side', count: 1, length: 3.2, calibre: 0.035, elevation: 0.15, at: 0.5 }], radars: [{ kind: 'panel', x: -0.6, up: 0.55, size: 1.6, height: 0.5 }], cupola: false };
// Type 87 (1987): the Gepard's layout on the Type 74's five-wheeled hull - twin 35 mm, search radar on top, tracking dish in front.
G['type-87-spaag'] = { ...base('type-74'), cls: 'spaa', turret: { x: -0.4, length: 3.0, width: 2.2, height: 1.0, shape: 'box' }, guns: [{ mount: 'turret-side', count: 1, length: 3.2, calibre: 0.035, elevation: 0.15, at: 0.45 }], radars: [{ kind: 'panel', x: -1.3, up: 0.7, size: 1.7, height: 0.45 }, { kind: 'dish', x: 1.6, up: 0.3, size: 0.9 }] };
// OTO Melara SIDAM 25: the M113 with a one-man turret and four 25 mm in two pairs (Mistral version with missile boxes).
G['sidam-25'] = { cls: 'spaa', ...M113, turret: { x: -0.3, length: 1.5, width: 1.4, height: 0.7, shape: 'box' }, guns: [{ mount: 'turret-side', count: 2, length: 2.0, calibre: 0.025, spread: 0.2, elevation: 0.2, at: 0.5 }] };
// Lvkv 90 (1990s): the CV90 hull with a bigger AA turret, the 40 mm and the search radar on its back.
G['lvkv-90'] = { cls: 'spaa', ...CV90, turret: turret(-0.3, [[-1.6, 1.05], [-1.2, 1.2], [0.7, 1.25], [1.2, 0.95], [1.35, 0.55]], [[-1.6, 0.75], [0.7, 0.85], [1.35, 0.55]], 8, 1.3), guns: [{ mount: 'turret', length: 2.8, calibre: 0.04, sleeve: 0.75, at: 0.5, elevation: 0.2 }], radars: [{ kind: 'panel', x: -1.5, up: 0.6, size: 1.5, height: 0.4 }] };
// ADATS: the turret with four missile boxes each side and the search radar on top, on an M113 or a Bradley.
const ADATS = { turret: { x: -0.3, length: 1.8, width: 1.4, height: 1.0, shape: 'box' as const }, missiles: [{ mount: 'turret-side' as const, rows: 2, cols: 2, length: 2.2, diameter: 0.17, boxes: true, elevation: 0.15, up: 0.55 }], radars: [{ kind: 'panel' as const, x: -0.4, up: 0.55, size: 1.2, height: 0.4 }] };
G['adats-m113'] = { cls: 'sam', ...M113, ...ADATS };
G['adats-bradley'] = { cls: 'sam', ...BRADLEY, ...ADATS, guns: undefined };
// AMX-30 Roland (1977): the AMX-30 hull with the Roland turret, its two launch tubes and the search radar on top.
const ROLAND = { turret: { x: -0.4, length: 1.8, width: 1.4, height: 1.0, shape: 'box' as const }, missiles: [{ mount: 'turret-side' as const, rows: 1, cols: 2, length: 2.6, diameter: 0.27, elevation: 0.25, up: 0.75 }], radars: [{ kind: 'panel' as const, x: -0.1, up: 0.55, size: 1.6, height: 0.35 }, { kind: 'dish' as const, x: 0.9, up: 0.0, size: 0.55 }] };
G['amx-30-roland'] = { ...base('amx-30'), cls: 'sam', ...ROLAND, guns: undefined, cupola: false };
// FV102 Striker: the CVR(T) hull with the five-box Swingfire launcher raised at the back; FV438: the FV432 with two Swingfire boxes on top.
G['fv102-striker'] = { cls: 'atgm', ...CVRT, turret: undefined, guns: undefined, missiles: [{ mount: 'hull', rows: 1, cols: 5, length: 1.6, diameter: 0.22, boxes: true, elevation: 0.35, x: -1.2, up: 0.3 }] };
G['fv438-swingfire'] = { ...G['fv432'], cls: 'atgm', missiles: [{ mount: 'hull', rows: 1, cols: 2, length: 1.6, diameter: 0.3, boxes: true, elevation: 0.3, x: -0.8, up: 0.3 }] };
// Stormer (1980s): a long six-wheeled CVR(T)-family hull; the HVM version with eight missile boxes raised on the roof (5.27 x 2.4 m).
G['stormer-hvm'] = { cls: 'sam', chassis: 'tracked', length: 5.27, width: 2.4, hullHeight: 1.6, roadWheels: 6, roadWheelRadius: 0.27, trackProfile: run(5.1, 0.8, [2.5, 0.55], [-2.55, 0.55], -2.1, 2.05), running: { wheels: [-1.85, -1.1, -0.35, 0.4, 1.15, 1.9] }, hullOutline: { top: [[-2.63, 1.45], [-2.5, 1.6], [0.9, 1.6], [2.63, 0.9]], bottom: [[-2.63, 0.65], [2.3, 0.65], [2.63, 0.9]], plan: [[-2.63, 1.2], [2.63, 1.12]], round: 10, stations: 10 }, missiles: [{ mount: 'hull', rows: 2, cols: 4, length: 1.4, diameter: 0.18, boxes: true, elevation: 0.2, x: -0.4, up: 0.45 }] };

// Truck- and HMMWV-borne launchers (estimates of the launcher boxes on a published chassis): SAMP/T's eight Aster canisters
// raised near upright on an 8x8; Sky Sabre's eight CAMM canisters and SPYDER's four on a 6x6; Type 81's four rails on a
// 6x6; Flarakrad's Roland turret on an 8x8; HUMRAAM's four AMRAAM rails on the back of an HMMWV.
G['samp-t-launcher'] = { cls: 'sam', ...MAN_HX, length: 10.4, axles: 4, axleAt: [0.75, 0.45, -0.35, -0.65], bed: 'flat', hullHeight: 1.4, missiles: [{ mount: 'hull', rows: 2, cols: 4, length: 5.5, diameter: 0.45, boxes: true, elevation: 1.25, x: -2.6, up: 1.6 }] };
G['sky-sabre-launcher'] = { cls: 'sam', ...MAN_HX, bed: 'flat', hullHeight: 1.4, missiles: [{ mount: 'hull', rows: 2, cols: 4, length: 3.3, diameter: 0.25, boxes: true, elevation: 1.3, x: -2.0, up: 1.2 }] };
G['spyder-launcher'] = { cls: 'sam', ...MAN_HX, bed: 'flat', hullHeight: 1.4, missiles: [{ mount: 'hull', rows: 1, cols: 4, length: 3.2, diameter: 0.3, boxes: true, elevation: 0.55, x: -1.6, up: 0.9 }] };
G['type-81-tansam-launcher'] = { cls: 'sam', ...MAN_HX, bed: 'flat', hullHeight: 1.4, missiles: [{ mount: 'hull', rows: 2, cols: 2, length: 2.7, diameter: 0.16, rail: true, elevation: 0.35, x: -1.8, up: 0.65 }] };
G['flarakrad'] = { cls: 'sam', ...MAN_HX, bed: 'flat', hullHeight: 1.4, ...ROLAND, turret: { ...ROLAND.turret, x: -2.0 } };
G['humraam'] = { cls: 'sam', ...HMMWV, missiles: [{ mount: 'hull', rows: 2, cols: 2, length: 3.65, diameter: 0.18, rail: true, elevation: 0.35, x: -1.1, up: -0.35 }] };

// M10 Booker (2023): the ASCOD-derived hull on seven road wheels under skirts, a low faceted Abrams-like turret with a
// long bustle and the 105 mm XM35 (hull about 7.3 x 3.6 m, 2.9 m: estimates from published photographs and weight class).
G['m10-booker'] = { cls: 'light-tank', chassis: 'tracked', length: 7.3, width: 3.6, hullHeight: 1.75, roadWheels: 7, roadWheelRadius: 0.32, skirts: true, trackProfile: run(7.1, 0.95, [3.55, 0.65], [-3.55, 0.7], -2.95, 2.9), hullOutline: hull(7.3, 3.6, 1.75, 0.9, 1.6, 1.1, 0.15), turret: turret(-0.6, [[-2.5, 1.2], [-2.1, 1.5], [0.8, 1.55], [1.6, 1.3], [2.1, 0.8], [2.25, 0.45]], [[-2.5, 0.55], [-2.1, 0.65], [1.2, 0.72], [2.0, 0.55], [2.25, 0.4]], 9, 2.2), guns: [{ mount: 'turret', length: 5.2, calibre: 0.105, sleeve: 0.7, extractor: 0.6, at: 0.5 }], addOns: [tb(-0.4, 0.7, 0.95, 0.6, 0.5, 0.45, DARK), tb(0.8, -0.6, 0.85, 0.4, 0.4, 0.35)] };

// ---------------------------------------------------------------- Gepard, Shilka, Tunguska

// Gepard (1976): the Leopard 1 hull lengthened (7.68 x 3.27 m), the box turret with a 35 mm on each side, the search radar
// folded on the back of the roof, the tracking dish in front; 1A2 the same outline.
G['flakpanzer-gepard'] = { cls: 'spaa', ...LEO1, length: 7.68, trackProfile: run(7.5, 0.92, [3.75, 0.62], [-3.75, 0.72], -3.1, 3.05), hullOutline: hull(7.68, 3.27, 1.6, 0.86, 1.5, 1.1, 0.2), turret: { x: -0.2, length: 3.2, width: 2.2, height: 1.0, shape: 'box' }, guns: [{ mount: 'turret-side', count: 1, length: 3.2, calibre: 0.035, elevation: 0.15, at: 0.45 }], radars: [{ kind: 'panel', x: -1.4, up: 0.75, size: 1.9, height: 0.5 }, { kind: 'dish', x: 1.75, up: 0.35, size: 1.0 }], cupola: false };
// ZSU-23-4 Shilka (1965): a low light hull on six road wheels with no rollers, the wide flat turret with the four 23 mm in
// a pair of pairs, the Tobol dish on its post at the back (6.5 x 3.08 m, 2.25 m); M4 with the bigger box on the turret's back.
const SHILKA: GroundSpec = { chassis: 'tracked', length: 6.5, width: 3.08, hullHeight: 1.4, roadWheels: 6, roadWheelRadius: 0.33, trackProfile: run(6.2, 0.8, [3.05, 0.55], [-3.1, 0.6], -2.6, 2.6), running: { wheels: [-2.4, -1.45, -0.5, 0.45, 1.4, 2.35] }, hullOutline: { top: [[-3.25, 1.25], [-3.0, 1.4], [1.6, 1.4], [3.25, 0.85]], bottom: [[-3.25, 0.65], [2.8, 0.6], [3.25, 0.85]], plan: [[-3.25, 1.5], [3.25, 1.45]], round: 10, stations: 12 }, turret: turret(0.35, [[-1.55, 1.25], [1.3, 1.42], [1.6, 1.1]], [[-1.55, 0.7], [1.3, 0.75], [1.6, 0.5]], 10, 1.5), guns: [{ mount: 'turret', count: 4, length: 2.0, calibre: 0.023, spread: 0.18, elevation: 0.25, at: 0.45 }], radars: [{ kind: 'dish', x: -1.0, up: 0.75, size: 1.25 }] };
G['zsu-23-4-shilka'] = { cls: 'spaa', ...SHILKA };
G['zsu-23-4m4'] = { cls: 'spaa', ...SHILKA, addOns: [tb(-1.75, 0, 0.45, 0.5, 2.6, 0.6)], missiles: [{ mount: 'turret-side', rows: 1, cols: 1, length: 1.6, diameter: 0.1, elevation: 0.2, up: 0.85 }] };
// 2K22 Tunguska (1982): the long GM-352 hull on six road wheels, the big turret with a 30 mm pair and four missile tubes
// each side, the search radar on the back and the tracker on the front (7.93 x 3.24 m, 3.36 m radar up).
G['2k22-tunguska'] = { cls: 'spaa', chassis: 'tracked', length: 7.93, width: 3.24, hullHeight: 1.65, roadWheels: 6, roadWheelRadius: 0.33, skirts: true, trackProfile: run(7.7, 0.9, [3.8, 0.6], [-3.8, 0.62], -3.2, 3.2), hullOutline: { top: [[-3.97, 1.55], [-3.8, 1.65], [2.2, 1.65], [3.97, 1.05]], bottom: [[-3.97, 0.85], [3.6, 0.85], [3.97, 1.05]], plan: [[-3.97, 1.6], [3.97, 1.55]], round: 12, stations: 12 }, turret: { x: 0.2, length: 3.4, width: 2.5, height: 1.0, shape: 'tall' }, guns: [{ mount: 'turret-side', count: 2, length: 2.6, calibre: 0.03, spread: 0.2, elevation: 0.2, at: 0.35 }], missiles: [{ mount: 'turret-side', rows: 2, cols: 2, length: 2.6, diameter: 0.17, boxes: true, elevation: 0.2, x: -0.3, up: 1.05 }], radars: [{ kind: 'panel', x: -1.2, up: 0.55, size: 2.3, height: 0.7 }, { kind: 'dish', x: 1.6, up: 0.5, size: 0.9 }] };

// ---------------------------------------------------------------- K9, PLZ-05, DANA

// K9 Thunder (1999): six road wheels and three return rollers, the long sloped-front turret over the back, the 155 mm L/52
// with its brake and extractor (hull 7.44 x 3.4 m, 2.73 m).
G['k9-firtina'] = { cls: 'sp-artillery', chassis: 'tracked', length: 7.44, width: 3.4, hullHeight: 1.55, roadWheels: 6, roadWheelRadius: 0.33, trackProfile: run(7.2, 0.9, [3.6, 0.6], [-3.6, 0.62], -3.0, 3.0), running: { wheels: [-2.7, -1.65, -0.6, 0.45, 1.5, 2.55], rollers: [-1.6, 0, 1.6] }, hullOutline: hull(7.44, 3.4, 1.55, 0.88, 1.8, 1.0, 0.1, 10), turret: turret(-0.9, [[-2.3, 1.5], [1.4, 1.58], [2.1, 1.1]], [[-2.3, 1.15], [1.2, 1.2], [2.1, 0.75]], 12, 2.0), guns: [{ mount: 'turret', length: 8.0, calibre: 0.155, muzzle: true, extractor: 0.5, at: 0.45, elevation: 0.05 }], cupola: true };
// PLZ-05 (2008): a long angular turret with a sharply sloped face and a big bustle, the 155 mm L/54 (hull about 7.3 x 3.4 m).
G['plz-05'] = { cls: 'sp-artillery', chassis: 'tracked', length: 7.3, width: 3.4, hullHeight: 1.6, roadWheels: 7, roadWheelRadius: 0.3, skirts: true, trackProfile: run(7.1, 0.9, [3.55, 0.6], [-3.55, 0.62], -2.95, 2.95), hullOutline: hull(7.3, 3.4, 1.6, 0.88, 1.8, 1.0, 0.1, 10), turret: turret(-0.8, [[-2.6, 1.5], [1.0, 1.62], [2.2, 1.0]], [[-2.6, 1.2], [0.8, 1.3], [2.2, 0.65]], 10, 2.1), guns: [{ mount: 'turret', length: 8.3, calibre: 0.155, muzzle: true, extractor: 0.5, at: 0.4, elevation: 0.05 }] };
// ShKH vz. 77 DANA (1980): a Tatra 8x8 with the armoured cab in front, the split gun housing amidships with the 152 mm
// laid forward over the cab, the engine at the back (about 8.9 x 2.8 m hull, 2.85 m; estimates).
G['dana-vz77'] = { cls: 'sp-artillery', chassis: 'wheeled', length: 8.87, width: 2.8, hullHeight: 2.0, axles: 4, axleAt: [0.75, 0.42, -0.35, -0.68], wheelRadius: 0.6, hullOutline: { top: [[-4.43, 1.9], [-4.2, 2.0], [2.6, 2.0], [3.4, 2.3], [4.0, 2.3], [4.43, 1.4]], bottom: [[-4.43, 0.75], [4.1, 0.75], [4.43, 1.0]], plan: [[-4.43, 1.35], [4.43, 1.35]], round: 10, stations: 14 }, turret: turret(-0.6, [[-1.8, 1.25], [1.6, 1.3], [1.8, 1.0]], [[-1.8, 0.85], [1.5, 0.9], [1.8, 0.65]], 10, 1.75), guns: [{ mount: 'turret', length: 5.0, calibre: 0.152, muzzle: true, at: 0.6, elevation: 0.04 }] };

// ---------------------------------------------------------------- War Thunder odd units

// Dardo (1998) / VCC-80: a box hull on six road wheels under skirts, the Hitfist turret with the 25 mm and a TOW tube each side (6.7 x 3.0 m, 2.64 m).
G['dardo'] = { cls: 'ifv', ...WARRIOR, length: 6.7, width: 3.0, guns: [{ mount: 'turret', length: 2.3, calibre: 0.025, at: 0.5 }], addOns: [tb(-0.1, 1.25, 0.5, 1.3, 0.25, 0.25, M)] };
// Olifant Mk 2 (2007): the Centurion with add-on armour boxing the turret's front and sides, a new engine deck, full skirts.
G['olifant-mk2'] = { ...base('centurion'), addOns: [tb(1.35, 0.9, 0.5, 0.9, 0.7, 0.75, { ...M, yaw: -0.45 }), tb(-0.1, 1.68, 0.5, 2.2, 0.16, 0.75, M), ...skirtBoxes(-3.4, 3.6, 1.75, 0.6, 0.6, 5, 0.12), hb(-2.6, 0, 1.92, 2.2, 2.8, 0.25)] };
// Chieftain 900 (1982): the Chieftain hull with a squarer, slab-sided Chobham turret.
G['chieftain-900'] = { cls: 'mbt', ...CHIEFTAIN, turret: turret(-0.3, [[-2.3, 1.1], [-1.9, 1.55], [1.2, 1.62], [1.9, 1.3], [2.15, 0.75]], [[-2.3, 0.65], [-1.6, 0.85], [1.4, 0.9], [2.15, 0.6]], 12, 2.1) };
// Type 63 APC (1963) with the twin 25 mm turret: a box hull on four large road wheels (5.48 x 2.98 m).
G['type-63-twin-25'] = { cls: 'spaa', chassis: 'tracked', length: 5.48, width: 2.98, hullHeight: 1.9, roadWheels: 4, roadWheelRadius: 0.38, trackProfile: run(5.3, 0.85, [2.6, 0.55], [-2.65, 0.55], -2.0, 2.0), running: { wheels: [-1.65, -0.55, 0.55, 1.65] }, hullOutline: { top: [[-2.74, 1.8], [-2.6, 1.9], [1.0, 1.9], [2.74, 1.0]], bottom: [[-2.74, 0.85], [2.5, 0.85], [2.74, 1.0]], plan: [[-2.74, 1.45], [2.74, 1.4]], round: 12, stations: 10 }, turret: { x: -0.2, length: 1.4, width: 1.4, height: 0.6, shape: 'box' }, guns: [{ mount: 'turret', count: 2, length: 2.0, calibre: 0.025, spread: 0.3, elevation: 0.3, at: 0.5 }] };
// ASRAD-R on the Bv 206 (estimate): the articulated two-car carrier drawn as one low tracked body, the RBS 70 launcher on the front car.
G['asrad-r'] = { cls: 'sam', chassis: 'tracked', length: 6.9, width: 1.87, hullHeight: 1.9, roadWheels: 8, roadWheelRadius: 0.2, hull: 'box', missiles: [{ mount: 'hull', rows: 2, cols: 2, length: 1.6, diameter: 0.2, boxes: true, elevation: 0.2, x: 1.2, up: 0.4 }] };
// M8 AGS (1995): the CCVL's layout grown to six road wheels, the low turret with the 105 mm (6.2 x 2.69 m).
G['m8-ags'] = { ...G['ccvl'], roadWheels: 6 };
// Type 16 MCV (2016): a long 8x8 with evenly spaced axles and a Type 10-like turret with the 105 mm (8.45 m with the gun
// forward, 2.98 m wide, 2.87 m high; the hull's 7.1 m is an estimate from photos, the gun overhanging the nose).
G['type-16-mcv'] = { cls: 'tank-destroyer', ...CENTAURO, length: 7.1, width: 2.98, axleAt: [0.75, 0.27, -0.27, -0.75], hullOutline: wheeledHull(7.1, 1.9, 1.15, 1.49, 1.9), turret: turret(-0.4, [[-2.0, 1.1], [-1.6, 1.35], [0.8, 1.4], [1.7, 1.0], [2.0, 0.5]], [[-2.0, 0.6], [0.8, 0.72], [2.0, 0.45]], 10, 1.95) };
// Namer (2008): the Merkava Mk 4 hull as a heavy carrier - no turret, a raised troop compartment and a remote station.
G['namer'] = { ...MK4, cls: 'apc-tracked', turret: undefined, guns: undefined, addOns: [hb(-1.6, 0, 1.95, 4.0, 3.2, 0.5), hb(-0.6, 0.6, 2.45, 0.6, 0.5, 0.45, DARK), hb(-0.05, 0.6, 2.52, 1.0, 0.07, 0.07, DARK)] };

// War Thunder post-war ids that had no figure (from the public wiki's trees): each to its own figure where it has one,
// otherwise to the vehicle it is built on or derived from.
Object.assign(ALIASES, {
  us_t95: 't95-medium', us_t95e1: 't95e1', us_m728: 'm728-cev', us_t114: 't114', us_t54e1: 't54e1', us_t54e2: 't54e2', us_t58: 't58', us_xm_800t: 'xm800t',
  us_stingray: 'stingray', jp_stingray: 'stingray', us_xm_803: 'xm803', us_m1296_dragoon: 'm1296-stryker-dragoon', us_efv_p1: 'efv', us_xm_8: 'm8-ags', us_ags_teledyne: 'ags-teledyne', us_m1_ip_abrams: 'm1ip-abrams', us_rdf_lt: 'rdf-lt',
  germ_marder_df_105: 'marder-df105', fr_marder_df_105: 'marder-df105', germ_marder_clovis: 'marder-clovis', fr_marder_clovis: 'marder-clovis', germ_erprobungstrager_3_achs_turm: 'turm-iii', germ_sk105_a2: 'sk-105', germ_begleitpanzer_57: 'begleitpanzer-57',
  germ_vt_1_2: 'vt1-2', germ_th_800_bismark: 'class-3-p', germ_th_400: 'th-400', germ_embt: 'embt', fr_embt: 'embt',
  ussr_object_906: 'object-906', ussr_object_416: 'object-416', ussr_object_120: 'object-120', ussr_to_55: 'to-55', ussr_object_685: 'object-685', ussr_it_1: 'it-1', ussr_9p149: 'shturm-s', ussr_object_435: 'object-435',
  ussr_2s25: '2s25-sprut-sd', ussr_2s25m: '2s25-sprut-sd', ussr_9p157: 'khrizantema-s', ussr_object_140: 'object-140', ussr_2s38: '2s38', ussr_t_80ue1_sm: 't-80ue1',
  uk_vickers_mbt_mk_1: 'vickers-mbt-mk1', uk_vijayanta: 'vickers-mbt-mk1', uk_vickers_mbt_mk_3: 'vickers-mbt-mk3', uk_vickers_mk_11: 'vickers-mk11', uk_vickers_mk7: 'vickers-mk7', uk_falcon: 'falcon', uk_tracked_rapier: 'tracked-rapier',
  uk_badger: 'badger-ifv', uk_vfm_5: 'vfm-5', uk_ttd: 'ttd', uk_ajax: 'ajax', uk_challenger_1_mk_3_gulf: 'challenger-ds',
  jp_type_75_mlrs: 'type-75-mlrs', jp_type_16_mcv_prot: 'type-16-mcv', jp_type_16_mod: 'type-16-mcv', jp_type_16: 'type-16-mcv', jp_btr_3e1: 'btr-3e1', jp_icv_ifv_prototype: 'type-24-icv', jp_icv_prototype: 'type-25-rcv',
  jp_harimau: 'harimau', jp_type_03_chusam_fcs: 'nasams-mpq-64-sentinel', jp_type_03_chusam_launcher: 'sky-sabre-launcher',
  cn_zts_63_1980: 'type-63-amphibious', cn_type_86: 'bmp-1', cn_wz_305: 'wz-305', cn_ztz_59a: 'ztz-59a', cn_type_59d: 'ztz-59d1', cn_cm_25: 'm113-tow', cn_ptz_89: 'ptz-89', cn_ztz_88b: 'ztz-88', cn_ztz_88a: 'ztz-88',
  cn_ptl_02: 'ptl-02', cn_hj_9: 'aft09', cn_cm11: 'cm-11', cn_cm_34: 'cm-34', cn_object_122tm: 'object-122mt', cn_wma_301: 'wma-301', cn_type_69_2g: 'type-69-2', cn_mbt2000: 'mbt-2000', cn_mbt2000_sm: 'mbt-2000',
  cn_antelope_tc_1l_ads: 'antelope', cn_ztl_11: 'ztl-11', cn_qn506: 'qn506', cn_vt_5: 'vt-5', cn_wz_1001: 'wz-1001',
  it_c13_t90: 'c13-t90', it_oto_r3_106sr: 'r3-t106', it_fiat_6614_firos: 'fiat-6614-firos', it_vbc_pt2: 'vbc-pt2', it_c13_tua: 'c13-tua', it_otomatic: 'otomatic', it_kf_41: 'kf41-lynx',
  fr_lorraine_40t: 'lorraine-40t', fr_amx_10m_acra: 'amx-10m-acra', fr_somua_sm: 'somua-sm', fr_mars_15: 'mars-15', fr_vcac_mephisto: 'vab-mephisto', fr_msc: 'msc',
  sw_k9_vidar: 'k9-firtina', sw_itpsv_90: 'itpsv-90', sw_udes_33: 'udes-33', sw_pbv_302_bill: 'pbv-302-bill', sw_strv121b_christian2: 'strv-121b', sw_eldenhet_98: 'elde-98', sw_nomads: 'nomads', sw_t_80u: 't-80u',
  il_machbet: 'machbet', il_hunter_afv: 'hunter-afv', il_eitan: 'eitan', il_namer_rcws_30: 'namer', il_namer_tsrikhon: 'namer',
  cn_hq_11: 'hq-11', sw_landsverk_ush_405: 'ush-405',
});

// ---------------------------------------------------------------- SAM and MLRS variants

const AD = (n: string) => AIR_DEFENCE.ground![n];
const GM = (n: string) => GROUND_MODERN.ground![n];
// S-300V (1988) on the GM-830 family (about 9.5 x 3.4 m; estimates): 9A83 with four 9M83 canisters raised upright behind
// its illuminator mast; 9A82 with two bigger 9M82 canisters.
const GM830 = { ...AD('9a310-buk-telar'), length: 9.5, width: 3.38, turret: undefined, radars: undefined, missiles: undefined };
G['s-300v-9a83'] = { ...GM830, cls: 'sam', missiles: [{ mount: 'hull', rows: 1, cols: 4, length: 7.5, diameter: 0.9, elevation: 1.45, x: -2.4, up: 2.3 }], radars: [{ kind: 'panel', x: 1.2, up: 2.2, size: 2.2, height: 1.6, hull: true, mast: 'pole' }] };
G['s-300v-9a82'] = { ...GM830, cls: 'sam', missiles: [{ mount: 'hull', rows: 1, cols: 2, length: 9.9, diameter: 1.2, elevation: 1.45, x: -2.2, up: 3.5 }], radars: [{ kind: 'panel', x: 1.4, up: 2.2, size: 2.2, height: 1.6, hull: true, mast: 'pole' }] };
// Buk-M2 9A317 (2008): the phased-array face on the turret's front in place of the dish; Buk-M3 9A317M (2016): six missiles in closed canisters.
const BUK = AD('9a310-buk-telar');
const BUK_FACE = { kind: 'panel' as const, x: 1.3, up: -0.1, size: 1.8, height: 1.3, tilt: 0.3, mast: 'none' as const, depth: 0.3 };
G['buk-m2-9a317'] = { ...BUK, radars: [BUK_FACE] };
G['buk-m3-9a317m'] = { ...BUK, missiles: [{ mount: 'turret-top', rows: 2, cols: 3, length: 5.6, diameter: 0.45, boxes: true, elevation: 0.08, x: -0.6, up: 0.35 }], radars: [BUK_FACE] };
// Osa (9.14 x 2.75 m): the boat-shaped amphibious 6x6 with evenly spaced axles; 9A33BM3 the missiles in six closed
// canisters, 9A33BM2 four bare on their rails.
const OSA = { ...AD('9a33-osa'), axleAt: [0.55, 0.0, -0.55], hullOutline: { top: [[-4.57, 1.7], [-4.3, 2.0], [1.8, 2.0], [4.57, 1.1]], bottom: [[-4.57, 1.0], [-3.8, 0.6], [3.6, 0.6], [4.57, 1.1]], plan: [[-4.57, 0.9], [-3.8, 1.37], [3.4, 1.37], [4.57, 0.8]], round: 6, stations: 14 } as GroundSpec['hullOutline'] };
G['9a33-osa'] = { ...OSA };
G['9a33bm2-osa'] = { ...OSA, missiles: [{ mount: 'turret-side', rows: 2, cols: 1, length: 3.15, diameter: 0.21, rail: true, elevation: 0.2, up: 0.55 }] };
// Pantsir-SM (2019): the S1 with a bigger, taller search radar face.
const PANTSIR = AD('pantsir-s1');
G['pantsir-sm'] = { ...PANTSIR, radars: [{ kind: 'panel', x: -0.4, up: 0.6, size: 2.6, height: 1.6, depth: 0.35 }, ...(PANTSIR.radars ?? []).slice(1)] };
// Tornado-G: the Grad's 40 tubes on a KamAZ-5350; Tornado-S: the Smerch's twelve on the MAZ-543M.
G['tornado-g'] = { cls: 'mlrs', ...KAMAZ_43101, bed: 'flat', hullHeight: 1.45, missiles: [{ mount: 'hull', rows: 4, cols: 10, length: 3.0, diameter: 0.122, elevation: 0.28, x: -1.7, up: 1.1 }] };
G['tornado-s'] = { ...GM('bm-30-smerch'), missiles: [{ mount: 'hull', rows: 3, cols: 4, length: 7.6, diameter: 0.3, pod: true, elevation: 0.1, x: -2.2, up: 0.8 }] };
// M270 (1983): the Bradley-derived carrier with the armoured cab in front, six road wheels and rollers in the open, two
// launcher pods side by side over the back (6.86 x 2.97 m, 2.6 m).
G['m270-mlrs'] = { cls: 'mlrs', chassis: 'tracked', length: 6.86, width: 2.97, hullHeight: 1.15, roadWheels: 6, roadWheelRadius: 0.31, trackProfile: run(6.6, 0.95, [3.25, 0.65], [-3.3, 0.65], -2.7, 2.65), running: { wheels: [-2.45, -1.5, -0.55, 0.4, 1.35, 2.3], rollers: [-1.5, 0, 1.5] }, hullOutline: { top: [[-3.43, 1.15], [1.3, 1.15], [1.45, 2.55], [3.1, 2.55], [3.43, 1.7]], bottom: [[-3.43, 0.85], [3.1, 0.85], [3.43, 1.2]], plan: [[-3.43, 1.45], [3.43, 1.45]], round: 12, stations: 14 }, missiles: [{ mount: 'hull', rows: 2, cols: 3, length: 4.2, diameter: 0.3, pod: true, elevation: 0.1, x: -1.0, up: 0.5, side: 0.72 }, { mount: 'hull', rows: 2, cols: 3, length: 4.2, diameter: 0.3, pod: true, elevation: 0.1, x: -1.0, up: 0.5, side: -0.72 }] };

// ---------------------------------------------------------------- light vehicles

/** A two-axle vehicle from its side profile's roof line (back to front) and its half-width: jeeps, MRAPs, buses. */
const car = (L: number, W: number, top: [number, number][], axleAt: number[], r: number, belly = 0.6, round = 10): GroundSpec => ({ chassis: 'wheeled', length: L, width: W, hullHeight: Math.max(...top.map((p) => p[1])), axles: axleAt.length, axleAt, wheelRadius: r, hullOutline: { top, bottom: [[-L / 2, belly + 0.1], [-L / 2 + 0.3, belly], [L / 2 - 0.3, belly], [L / 2, belly + 0.15]], plan: [[-L / 2, W / 2 - 0.05], [L / 2 - 0.3, W / 2 - 0.05], [L / 2, W / 2 - 0.2]], round, stations: 16 } });
// HMMWV hardtop (M1025 / M1043 / M1045, 4.57 x 2.16 m, 1.83 m): the roof running back to the tail; the M1043 with the gunner's
// shield ring and MG, the M1045 with its TOW launcher on the roof.
const HMMWV_HARD = car(4.57, 2.16, [[-2.28, 1.75], [-2.2, 1.83], [0.35, 1.83], [0.75, 1.3], [2.1, 1.22], [2.28, 1.0]], [0.72, -0.62], 0.45, 0.65, 12);
G['m1025-humvee'] = { cls: 'jeep', ...HMMWV_HARD, addOns: [hb(-0.4, 0, 2.0, 0.9, 0.9, 0.3), hb(0.2, 0, 2.08, 0.9, 0.07, 0.07, DARK)] };
G['m1043-hmmwv-mg'] = { cls: 'jeep', ...HMMWV_HARD, addOns: [hb(-0.4, 0, 2.05, 0.9, 1.0, 0.4), hb(-0.05, 0, 2.15, 0.1, 0.8, 0.45), hb(0.35, 0, 2.15, 0.9, 0.07, 0.07, DARK)] };
G['m1045-hmmwv-tow'] = { cls: 'atgm', ...HMMWV_HARD, addOns: [hb(-0.4, 0, 2.05, 0.5, 0.5, 0.4, DARK), hb(-0.3, 0, 2.35, 1.3, 0.25, 0.25)] };
// MRAPs: M-ATV (6.24 x 2.49 m, 2.7 m) a sloped bonnet before the tall crew cell; MaxxPro (6.5 x 2.7 m, 3.05 m) a tall box
// with a short nose; JLTV (6.2 x 2.5 m, 2.6 m) a long sloped bonnet; GAZ Tigr (5.7 x 2.4 m, 2.4 m) a rounded bonnet.
const RING = (x: number, u: number): AddOn[] => [hb(x, 0, u + 0.2, 0.9, 1.0, 0.4), hb(x + 0.45, 0, u + 0.3, 0.9, 0.07, 0.07, DARK)];
G['m-atv'] = { cls: 'mrap', ...car(6.24, 2.49, [[-3.12, 2.35], [-3.0, 2.45], [-0.1, 2.45], [0.6, 1.75], [2.6, 1.6], [3.12, 1.3]], [0.62, -0.6], 0.55, 0.8), addOns: RING(-0.8, 2.45) };
G['maxxpro'] = { cls: 'mrap', ...car(6.5, 2.7, [[-3.25, 2.9], [-3.1, 3.0], [1.6, 3.0], [2.2, 2.0], [3.25, 1.8]], [0.55, -0.6], 0.55, 0.85, 12), addOns: RING(-0.6, 3.0) };
G['jltv'] = { cls: 'mrap', ...car(6.2, 2.5, [[-3.1, 2.3], [-2.95, 2.45], [-0.2, 2.45], [0.5, 1.8], [2.7, 1.65], [3.1, 1.35]], [0.62, -0.6], 0.55, 0.75), addOns: RING(-0.9, 2.45) };
G['gaz-tigr'] = { cls: 'mrap', ...car(5.7, 2.4, [[-2.85, 2.2], [-2.7, 2.3], [0.2, 2.3], [0.8, 1.6], [2.6, 1.45], [2.85, 1.2]], [0.62, -0.58], 0.5, 0.65, 6) };
// UAZ-469 (4.03 x 1.79 m, 2.05 m) and Land Rover 109 (4.45 x 1.69 m, 2.0 m): soft tops behind a short bonnet.
G['uaz-469'] = { cls: 'jeep', ...car(4.03, 1.79, [[-2.0, 1.9], [-1.9, 1.98], [0.25, 2.0], [0.45, 1.55], [1.8, 1.3], [2.0, 1.1]], [0.6, -0.6], 0.4, 0.55) };
G['land-rover-109'] = { cls: 'jeep', ...car(4.45, 1.69, [[-2.22, 1.95], [-2.1, 2.0], [0.3, 2.0], [0.5, 1.5], [2.0, 1.35], [2.22, 1.2]], [0.55, -0.68], 0.4, 0.55, 14) };
// A city bus (12.0 x 2.55 m, 3.1 m): a long box with a near-upright front, the axles set in from the ends.
G['bus'] = { cls: 'bus', ...car(12.0, 2.55, [[-6.0, 2.9], [-5.8, 3.05], [5.6, 3.1], [6.0, 2.3]], [0.55, -0.52], 0.5, 0.45, 14) };
// Wheeled armour: Otokar Cobra (5.24 x 2.23 m, 2.1 m) a rounded 4x4 with a sloped nose; Marauder (6.9 x 2.7 m, 2.8 m) and
// Titan-S (6.0 x 2.55 m, 2.6 m) tall MRAP boxes behind a short bonnet; GAZ Vodnik (5.13 x 2.45 m, 2.0 m) a boxy 4x4 with a bonnet.
G['otokar-cobra'] = { cls: 'scout-car', ...car(5.24, 2.23, [[-2.62, 1.85], [-2.4, 2.0], [0.6, 2.0], [2.3, 1.3], [2.62, 1.15]], [0.6, -0.55], 0.5, 0.55, 6), addOns: RING(-0.2, 2.0) };
G['marauder'] = { cls: 'mrap', ...car(6.9, 2.7, [[-3.45, 2.7], [-3.3, 2.8], [1.4, 2.8], [2.1, 1.95], [3.45, 1.75]], [0.6, -0.55], 0.62, 0.85, 12), addOns: RING(-0.6, 2.8) };
G['za-spn-titan'] = { cls: 'mrap', ...car(6.0, 2.55, [[-3.0, 2.5], [-2.85, 2.6], [0.9, 2.6], [1.6, 1.85], [3.0, 1.65]], [0.6, -0.55], 0.6, 0.8, 12), addOns: RING(-0.5, 2.6) };
G['gaz-vodnik'] = { cls: 'mrap', ...car(5.13, 2.45, [[-2.56, 2.0], [-2.45, 2.05], [0.3, 2.05], [0.8, 1.45], [2.4, 1.35], [2.56, 1.15]], [0.6, -0.58], 0.55, 0.6, 12) };
// Crotale (1971): the P4R 4x4 acquisition-launcher with a turret carrying two missile boxes either side and the tracking
// dish between them (6.22 x 2.65 m; estimates for the turret).
G['crotale'] = { cls: 'sam', ...car(6.22, 2.65, [[-3.11, 1.95], [-2.9, 2.05], [1.6, 2.05], [3.11, 1.3]], [0.55, -0.55], 0.55, 0.7, 12), turret: { x: -0.6, length: 1.4, width: 1.2, height: 0.9, shape: 'box' }, missiles: [{ mount: 'turret-side', rows: 2, cols: 1, length: 2.9, diameter: 0.25, boxes: true, elevation: 0.2, up: 0.55 }], radars: [{ kind: 'dish', x: 0.6, up: 0.2, size: 0.8, mast: 'none' }] };
// M6 Linebacker (1997): the Bradley A2 with a four-round Stinger box in place of the TOW box.
G['m6-linebacker'] = { cls: 'spaa', ...BRADLEY_A2, addOns: [tb(-0.1, -1.3, 0.6, 1.6, 0.5, 0.5), ...APPLIQUE] };
// LAV-AD (1996): the LAV hull with a turret carrying two 4-round Stinger pods and the GAU-12.
G['lav-ad'] = { ...G['lav-25'], cls: 'spaa', turret: turret(0.0, [[-1.0, 0.85], [-0.8, 1.0], [0.6, 1.0], [1.0, 0.75]], [[-1.0, 0.75], [0.6, 0.8], [1.0, 0.55]], 8, 1.0), guns: [{ mount: 'turret', length: 2.0, calibre: 0.025, at: 0.4 }], missiles: [{ mount: 'turret-side', rows: 2, cols: 2, length: 1.6, diameter: 0.14, boxes: true, elevation: 0.15, up: 0.6 }] };
// 2S9 Nona (1981): the BTR-D hull with a low turret and its short 120 mm gun-mortar.
G['2s9-nona'] = { ...G['btr-d'], cls: 'sp-artillery', turret: turret(-0.2, [[-1.0, 0.9], [-0.7, 1.0], [0.7, 1.0], [1.0, 0.8]], [[-1.0, 0.5], [0.7, 0.6], [1.0, 0.45]], 4, 1.0), guns: [{ mount: 'turret', length: 1.8, calibre: 0.12, at: 0.45, elevation: 0.05 }] };
// Wiesel 1 (1989): a tiny air-portable tracked carrier, the driver at the front left, the TOW or 20 mm on a mount at the
// right (3.55 x 1.82 m, 1.83 m); Wiesel 2 longer with five road wheels (4.78 m).
const WIESEL: GroundSpec = { chassis: 'tracked', length: 3.55, width: 1.82, hullHeight: 1.1, roadWheels: 4, roadWheelRadius: 0.22, trackProfile: run(3.45, 0.6, [1.72, 0.42], [-1.72, 0.45], -1.35, 1.35), running: { wheels: [-1.15, -0.4, 0.35, 1.1] }, hullOutline: { top: [[-1.78, 0.95], [-1.65, 1.1], [0.6, 1.1], [1.78, 0.6]], bottom: [[-1.78, 0.5], [1.5, 0.5], [1.78, 0.6]], plan: [[-1.78, 0.9], [1.78, 0.85]], round: 10, stations: 10 } };
G['wiesel'] = { cls: 'light-tank', ...WIESEL, turret: { x: -0.2, length: 0.8, width: 0.6, height: 0.4, shape: 'box', side: 0.3 }, guns: [{ mount: 'turret', length: 1.6, calibre: 0.02 }] };
// M50 Ontos (1956): a small high box on three road wheels, six 106 mm recoilless rifles clustered on its small turret (3.83 x 2.6 m, 2.13 m).
G['m50-ontos'] = { cls: 'tank-destroyer', chassis: 'tracked', length: 3.83, width: 2.6, hullHeight: 1.45, roadWheels: 3, roadWheelRadius: 0.3, trackProfile: run(3.7, 0.75, [1.85, 0.5], [-1.85, 0.45], -1.35, 1.3), running: { wheels: [-1.0, 0.0, 1.0] }, hullOutline: { top: [[-1.92, 1.4], [0.9, 1.45], [1.92, 0.75]], bottom: [[-1.92, 0.6], [1.6, 0.6], [1.92, 0.75]], plan: [[-1.92, 1.25], [1.92, 1.2]], round: 12, stations: 10 }, turret: { x: -0.3, length: 0.9, width: 0.8, height: 0.4, shape: 'box' }, guns: [{ mount: 'turret-side', count: 3, length: 3.4, calibre: 0.106, spread: 0.25, at: 0.6 }] };

// ================================================================ sites, launchers, trucks and rail by their outlines
//
// Air-defence sites, trailers, pedestal launchers, MLRS, trucks and rail vehicles, each built from its own parts so that
// one variant is told from the next by its silhouette: antennas and reflectors as plates of their true outline, masts
// and booms as tubes, missiles with their fins, shelters, tilts and tanks of their own size. Sizes are published values;
// antenna, shelter and fin sizes are estimates judged from public photographs (`est`), never traced from a drawing or a
// game model. Hull add-ons are placed forward from the middle and up from the ground.

// ---------------------------------------------------------------- part helpers

type V3 = [number, number, number];
/** A flat part of any outline on the hull, `t` thick: 'side' upright along the vehicle, 'front' across it, 'plan' level. */
const sl = (at: V3, poly: P2[], t: number, plane: AddOn['plane'] = 'side', o: Opt = {}): AddOn => ({ on: 'hull', kind: 'slab', at, size: [t, 0, 0], poly, plane, ...o });
/** A round tube on the hull from `a` to `b`, `d` across (`d1` at `b`). */
const rod = (a: V3, b: V3, d: number, o: Opt = {}, d1 = d): AddOn => ({ on: 'hull', kind: 'tube', at: a, to: b, size: [d, d1, 0], ...o });
/** An outline body on the hull (its outline in the vehicle's frame unless `at` moves it). */
const ob = (outline: Outline, o: Opt = {}, at: V3 = [0, 0, 0]): AddOn => ({ on: 'hull', kind: 'body', at, size: [1, 1, 1], outline, ...o });
/** An upright drum on the hull: diameter `d`, height `h`, centred at (x, s, u). */
const hd = (x: number, s: number, u: number, d: number, h: number, o: Opt = {}): AddOn => ({ on: 'hull', kind: 'drum', at: [x, s, u], size: [d, d, h], ...o });
/** A block on the hull from `x0` to `x1` and from `u0` to `u1`, `w` wide. */
const bx = (x0: number, x1: number, s: number, u0: number, u1: number, w: number, o: Opt = {}): AddOn => hb((x0 + x1) / 2, s, (u0 + u1) / 2, x1 - x0, w, u1 - u0, o);
const LT: Opt = { paint: 'light' };
const DK: Opt = { paint: 'dark' };
const MT: Opt = { paint: 'metal' };
const GL: Opt = { paint: 'glass' };
const TY: Opt = { paint: 'tyre' };
/** A rectangle of half-sizes `a` (first axis) and `b` about (a0, b0). */
const rect = (a: number, b: number, a0 = 0, b0 = 0): P2[] => [[a0 - a, b0 - b], [a0 + a, b0 - b], [a0 + a, b0 + b], [a0 - a, b0 + b]];
/** An ellipse of half-axes `a` and `b` about (a0, b0). */
const ellipse = (a: number, b: number, n = 20, a0 = 0, b0 = 0): P2[] => Array.from({ length: n }, (_, i) => [a0 + a * Math.cos((2 * Math.PI * i) / n), b0 + b * Math.sin((2 * Math.PI * i) / n)] as P2);
/** A rectangle of half-sizes `a` and `b` with its corners cut by `c`. */
const chamfer = (a: number, b: number, c: number, a0 = 0, b0 = 0): P2[] => ([[-a + c, -b], [a - c, -b], [a, -b + c], [a, b - c], [a - c, b], [-a + c, b], [-a, b - c], [-a, -b + c]] as P2[]).map(([p, q]) => [a0 + p, b0 + q] as P2);
/** A point `d` along a direction raised `e` radians (and turned `yaw`) from `p`, offset `n` square to it upward. */
const along = (p: V3, e: number, d: number, n = 0, yaw = 0): V3 => [p[0] + (d * Math.cos(e) - n * Math.sin(e)) * Math.cos(yaw), p[1] + (d * Math.cos(e) - n * Math.sin(e)) * Math.sin(yaw), p[2] + d * Math.sin(e) + n * Math.cos(e)];
/** A block `l` long whose back end is at `p`, raised `e` and turned `yaw`: launch beams, canister packs, booms. */
const beam = (p: V3, e: number, l: number, w: number, h: number, o: Opt = {}, yaw = 0): AddOn => ({ on: 'hull', kind: 'box', at: along(p, e, l / 2, 0, yaw), size: [l, w, h], pitch: e, yaw, ...o });
/** Parts of a weapon mount drawn from add-ons, so replay can turn them with mount `m` - and raise them with its gun, `gun`. */
const onMount = (m: AddOnMount, parts: AddOn[], gun = false): AddOn[] => parts.map((a) => ({ ...a, mount: m, ...(gun ? { elevates: true } : {}) }));

/**
 * A missile: length, body diameter, nose length, a booster stage at the tail (length, diameter), and fin sets - root
 * from and to, tip from and to (along from the tail), span out from the body, standing as a '+', an 'x', level only
 * ('-') or upright only ('|').
 */
interface Msl { len: number; d: number; nose: number; boost?: [number, number]; fins?: [number, number, number, number, number, ('+' | 'x' | '-' | '|')?][] }

/** A bare missile lying forward from its tail `t`, raised `e` and turned `yaw` radians, in light paint. */
function missile(t: V3, e: number, m: Msl, yaw = 0, o: Opt = LT): AddOn[] {
  const P = (x: number) => along(t, e, x, 0, yaw);
  const [bl, bd] = m.boost ?? [0, m.d];
  const out: AddOn[] = [];
  if (bl > 0) out.push(rod(P(0), P(bl), bd, o));
  out.push(rod(P(bl), P(m.len - m.nose), m.d, o), rod(P(m.len - m.nose), P(m.len), m.d, o, 0));
  for (const [r0, r1, t0, t1, span, cross = '+'] of m.fins ?? []) {
    const R = (r1 <= bl ? bd : m.d) / 2;
    const poly: P2[] = [[r0, R], [t0, R + span], [t1, R + span], [r1, R], [r1, -R], [t1, -R - span], [t0, -R - span], [r0, -R]];
    const rolls = cross === '-' ? [Math.PI / 2] : cross === '|' ? [0] : cross === 'x' ? [Math.PI / 4, -Math.PI / 4] : [0, Math.PI / 2];
    for (const roll of rolls) out.push(sl(t, poly, 0.04, 'side', { ...o, pitch: e, yaw, roll }));
  }
  return out;
}

/** A four-legged lattice mast at (x, s) from `u0` to `u1`, its legs `foot` and `head` out from the middle, braced at `n` levels. */
function tower(x: number, s: number, u0: number, u1: number, foot: number, head: number, n = 4, leg = 0.12): AddOn[] {
  const out: AddOn[] = [];
  const half = (f: number) => foot + (head - foot) * f;
  const corners: P2[] = [[-1, -1], [1, -1], [1, 1], [-1, 1]];
  for (const [a, b] of corners) out.push(rod([x + a * foot, s + b * foot, u0], [x + a * head, s + b * head, u1], leg, MT));
  for (let i = 0; i <= n; i++) {
    const f0 = i / (n + 1);
    const f1 = (i + 1) / (n + 1);
    const u = u0 + (u1 - u0) * f1;
    const h = half(f1);
    if (i < n) out.push(hb(x, s - h, u, 2 * h, 0.06, 0.06, DARK), hb(x, s + h, u, 2 * h, 0.06, 0.06, DARK), hb(x - h, s, u, 0.06, 2 * h, 0.06, DARK), hb(x + h, s, u, 0.06, 2 * h, 0.06, DARK));
    // One diagonal across each face of the bay.
    for (let c = 0; c < 4; c++) {
      const [a0, b0] = corners[c];
      const [a1, b1] = corners[(c + 1) % 4];
      out.push(rod([x + a0 * half(f0), s + b0 * half(f0), u0 + (u1 - u0) * f0], [x + a1 * h, s + b1 * h, u], leg * 0.5, MT));
    }
  }
  return out;
}

/** A shelter or van body from `x0` to `x1`, `w` wide, from `u0` up to `u1`, its edges a little rounded. */
const kung = (x0: number, x1: number, w: number, u0: number, u1: number, o: Opt = {}, round = 8): AddOn => ob({ top: [[x0, u1 - 0.08], [x0 + 0.06, u1], [x1 - 0.06, u1], [x1, u1 - 0.08]], bottom: [[x0, u0], [x1, u0]], plan: [[x0, w / 2], [x1, w / 2]], round, stations: 4 }, o);

/** A cargo body from `x0` (back) to `x1`: the platform at `u0`, board sides `side` high, and a canvas tilt up to `top` over bows (0 for none). */
function cargo(x0: number, x1: number, w: number, u0: number, side: number, top = 0): AddOn[] {
  const out: AddOn[] = [bx(x0, x1, 0, u0 - 0.14, u0, w)];
  if (side > 0) out.push(bx(x0, x1, w / 2 - 0.03, u0, u0 + side, 0.06, M), bx(x0, x0 + 0.06, 0, u0, u0 + side, w), bx(x1 - 0.08, x1, 0, u0, u0 + side + (top ? 0 : 0.3), w));
  if (top > 0) out.push(ob({ top: [[x0, top - 0.2], [x0 + 0.3, top], [x1 - 0.3, top], [x1, top - 0.2]], bottom: [[x0, u0 + 0.02], [x1, u0 + 0.02]], plan: [[x0, w / 2 - 0.01], [x1, w / 2 - 0.01]], round: 5, stations: 6 }, { shade: 0.62 }));
  return out;
}

/** A tank body on a truck from `x0` to `x1`: an oval barrel `w` wide from `u0` to `u1`, ends rounded, a walkway and filler domes on top. */
function tankBody(x0: number, x1: number, w: number, u0: number, u1: number, domes = 1): AddOn[] {
  const r = Math.min(0.35, (u1 - u0) * 0.25);
  const out: AddOn[] = [ob({ top: [[x0, u1 - r], [x0 + r, u1], [x1 - r, u1], [x1, u1 - r]], bottom: [[x0, u0 + r], [x0 + r, u0], [x1 - r, u0], [x1, u0 + r]], plan: [[x0, w / 2 - r], [x0 + r, w / 2], [x1 - r, w / 2], [x1, w / 2 - r]], round: 2.6, stations: 10 }, { shade: 0.8 })];
  for (let i = 0; i < domes; i++) out.push(hd(x0 + ((x1 - x0) * (i + 0.5)) / domes, 0, u1 + 0.1, 0.55, 0.25));
  out.push(bx(x0 + 0.2, x1 - 0.2, 0, u1 - 0.02, u1 + 0.04, 0.5, DARK));
  return out;
}

/**
 * A semitrailer's frame from `x0` (back) to `x1` (front): a deck at `deck`, the gooseneck over the front `nl` at `neck`
 * (the same as the deck for a flat trailer), the beams under it, and the landing legs it stands on when unhitched.
 */
function semiFrame(x0: number, x1: number, w: number, deck: number, neck: number, nl: number, legs = true): AddOn[] {
  const g = x1 - nl;
  const poly: P2[] = neck > deck + 0.05 ? [[x0, deck - 0.3], [g - 0.5, deck - 0.3], [g, neck - 0.3], [x1, neck - 0.3], [x1, neck], [g - 0.6, neck], [g - 0.6, deck], [x0, deck]] : [[x0, deck - 0.3], [x1, deck - 0.3], [x1, deck], [x0, deck]];
  const out: AddOn[] = [sl([0, 0, 0], poly, w, 'side'), bx(x0 + 0.3, g - 0.2, 0, deck - 0.75, deck - 0.3, 0.9, DARK)];
  const lx = g + Math.min(0.6, nl * 0.3);
  if (legs) for (const s of [-1, 1]) out.push(rod([lx, s * (w / 2 - 0.35), neck - 0.3], [lx, s * (w / 2 - 0.35), 0.12], 0.13, MT), hb(lx, s * (w / 2 - 0.35), 0.06, 0.35, 0.35, 0.12, DARK));
  return out;
}

/** A turntable base on a cross of four outrigger arms reaching `reach` out, their jack pads on the ground; the platform `h` high. */
function crossBase(reach: number, h: number, platL: number, platW: number): AddOn[] {
  const out: AddOn[] = [bx(-platL / 2, platL / 2, 0, h * 0.45, h, platW)];
  for (const [x, s] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
    const end: V3 = [x * reach, s * reach, 0.25];
    const start: V3 = [x * platL * 0.4, s * platW * 0.4, h * 0.7];
    out.push(rod(start, end, 0.26, MT), hd(end[0], end[1], 0.08, 0.55, 0.16, DARK), rod([end[0], end[1], 0.1], [end[0], end[1], 0.5], 0.14, MT));
  }
  return out;
}

// ---------------------------------------------------------------- SA-2 S-75 battery

// V-750 (S-75): 10.6 m, a 0.5 m body on the 0.65 m booster with its four big fins, cropped-delta wings at mid-body, small
// control fins ahead of the booster and canards at the nose (fin sizes est).
const V750: Msl = { len: 10.6, d: 0.5, nose: 1.6, boost: [2.9, 0.65], fins: [[0.0, 1.8, 0.05, 0.75, 0.95], [4.6, 6.8, 4.8, 5.6, 0.6], [3.0, 3.6, 3.05, 3.35, 0.3], [8.4, 8.9, 8.45, 8.7, 0.25]] };
// SM-90 launcher (base est): a cross of outriggers, the turntable, the cradle's side plates, the long launch beam pivoted at
// its back with the elevating ram, the missile riding on top of the beam.
const S75_PIVOT: V3 = [-1.2, 0, 2.2];
const S75_E = 0.5;
G['s-75-launcher'] = { cls: 'sam', chassis: 'pedestal', bare: true, length: 6.5, width: 6.5, hullHeight: 1.3, addOns: [
  ...crossBase(3.2, 1.0, 3.2, 2.0), hd(0, 0, 1.15, 2.2, 0.3, DARK),
  sl([0, 0.55, 0], [[-1.8, 1.25], [0.9, 1.25], [-0.5, 2.45], [-1.5, 2.45]], 0.12, 'side', M),
  beam(along(S75_PIVOT, S75_E, -0.5), S75_E, 8.6, 0.45, 0.4), rod([0.9, 0, 1.3], along(S75_PIVOT, S75_E, 2.6), 0.2, MT),
  ...missile(along(S75_PIVOT, S75_E, -0.7, 0.62), S75_E, V750),
] };
// SNR-75 Fan Song (antenna sizes est): the antenna cabin on a two-axle trailer; on its roof the antenna group turning on its
// ring - the horizontal trough (UV-10) in the middle, the upright trough (UV-11) at its left end, two small LORO dishes above.
G['snr-75-fan-song'] = { cls: 'radar', chassis: 'trailer', length: 8.0, width: 2.7, hullHeight: 1.3, axles: 2, axleAt: [0.45, -0.55], wheelRadius: 0.5, addOns: [
  kung(-3.7, 2.4, 2.5, 1.3, 3.5), hd(1.0, 0, 3.65, 1.4, 0.3, DARK), bx(0.4, 1.3, 0, 3.7, 4.2, 1.2),
  sl([1.4, 0.2, 4.7], rect(0.45, 1.8), 0.08, 'front', { ...LT, roll: Math.PI / 2, pitch: 0.3, curve: 0.3 }), rod([2.15, -1.4, 4.45], [2.15, 1.8, 4.45], 0.12, DK),
  sl([1.4, -1.95, 4.9], rect(0.45, 1.5), 0.08, 'front', { ...LT, pitch: 0.3, curve: 0.3 }), rod([2.05, -1.95, 3.6], [2.05, -1.95, 6.2], 0.12, DK),
  ...[-0.3, 0.9].map((s) => sl([1.25, s, 5.75], ellipse(0.42, 0.42, 14), 0.06, 'front', { ...LT, curve: 0.12 })), rod([0.9, 0.3, 4.2], [0.9, 0.3, 5.6], 0.14, MT),
] };
// RD-75 Amazonka (est): the range-finding radar's dish on a mast over its cabin on a small trailer.
G['rd-75-amazonka'] = { cls: 'radar', chassis: 'trailer', length: 5.0, width: 2.2, hullHeight: 1.2, axles: 1, wheelRadius: 0.45, addOns: [
  kung(-2.4, 0.9, 2.1, 1.2, 2.5), rod([-0.6, 0, 2.5], [-0.6, 0, 3.4], 0.25, MT), hd(-0.6, 0, 3.45, 0.6, 0.2, DARK),
  sl([-0.4, 0, 3.75], ellipse(0.8, 0.8, 18), 0.07, 'front', { ...LT, pitch: 0.3, curve: 0.25 }), rod([-0.4, 0, 3.75], [0.35, 0, 3.95], 0.06, DK),
] };
// ZiL-131V tractor (6.9 x 2.5 m), which tows the S-75's PR-11 transloader: the bonneted cab, the spare wheel upright behind
// it, the fifth-wheel plate over the rear tandem, the mudguards, no body.
G['zil-131-s-75-tractor'] = { cls: 'truck', ...ZIL_131, bed: 'none', addOns: [
  rod([0.2, 0, 1.55], [-0.12, 0, 1.55], 1.08, TY), bx(-0.4, 0.3, 0, 0.9, 1.1, 2.3),
  hb(-2.0, 0, 1.25, 1.3, 1.4, 0.12, DARK), bx(-3.1, -0.9, 1.0, 1.15, 1.22, 0.5, M), bx(-3.52, -3.3, 0, 0.75, 1.15, 2.2),
  bx(-0.6, 0.2, -1.05, 0.85, 1.2, 0.45), bx(-1.0, 0.25, 1.05, 0.85, 1.15, 0.4),
] };
// PR-11 transloader (est): a semitrailer standing on its landing legs, the V-750 lying booster aft on its two cradles, ready to
// be backed onto a launcher's beam.
G['s-75-trailer'] = { cls: 'truck', chassis: 'trailer', bare: true, length: 11.0, width: 2.5, hullHeight: 1.3, axles: 1, axleAt: [-0.6], wheelRadius: 0.5, addOns: [
  ...semiFrame(-4.6, 4.8, 2.3, 1.25, 1.4, 1.6), ...[-3.2, 1.6].map((x) => sl([x, 0, 0], [[-0.15, 1.25], [0.15, 1.25], [0.15, 1.6], [-0.15, 1.6]], 1.0, 'side', DARK)),
  ...missile([-5.4, 0, 1.95], 0, V750),
] };

// ---------------------------------------------------------------- SA-3 S-125 battery

// V-601 (S-125): 6.09 m, 0.375 m on a 0.55 m booster with big fins, cropped-delta wings at the back of the body, canards
// near the nose (fin sizes est).
const V601: Msl = { len: 6.09, d: 0.375, nose: 0.9, boost: [2.25, 0.55], fins: [[0.0, 1.05, 0.05, 0.5, 0.62, 'x'], [2.4, 3.6, 2.5, 3.0, 0.42, 'x'], [4.9, 5.3, 4.95, 5.15, 0.2, 'x']] };
// 5P73 launcher (base est): the cross of outriggers, the turntable with its column, a launch arm each side carrying a
// missile on top and one slung under it.
const S125_E = 0.42;
G['s-125-launcher'] = { cls: 'sam', chassis: 'pedestal', bare: true, length: 5.5, width: 5.5, hullHeight: 1.0, addOns: [
  ...crossBase(2.7, 0.8, 2.6, 1.6), hd(0, 0, 0.95, 1.8, 0.3, DARK), bx(-0.9, 0.5, 0, 1.05, 2.0, 1.2),
  rod([-0.5, -1.2, 2.0], [-0.5, 1.2, 2.0], 0.3, MT),
  ...[-1, 1].flatMap((s) => [beam([-0.9, s * 1.15, 2.0], S125_E, 5.2, 0.25, 0.35), ...missile(along([-0.9, s * 1.15, 2.0], S125_E, -0.4, 0.45), S125_E, V601), ...missile(along([-0.9, s * 1.15, 2.0], S125_E, -0.4, -0.45), S125_E, V601)]),
] };
// SNR-125 Low Blow (antenna sizes est): the antenna cabin on a two-axle trailer; on its roof the two big trough antennas
// crossed at 45 degrees, leaning back, the command dish beside them and the small LORO dish.
G['snr-125-low-blow'] = { cls: 'radar', chassis: 'trailer', length: 7.5, width: 2.7, hullHeight: 1.5, axles: 2, axleAt: [0.4, -0.55], wheelRadius: 0.5, addOns: [
  kung(-3.4, 1.9, 2.5, 1.5, 3.7), hd(0.6, 0, 3.85, 1.6, 0.3, DARK), bx(0.0, 1.0, 0, 3.9, 4.6, 1.0),
  ...[1, -1].map((r) => sl([1.0, 0, 5.4], rect(2.1, 0.42), 0.08, 'front', { ...LT, roll: r * 0.785, pitch: 0.4 })), rod([0.6, 0, 4.4], [1.6, 0, 5.3], 0.2, MT),
  sl([1.3, 1.85, 4.7], ellipse(0.7, 0.7, 16), 0.06, 'front', { ...LT, pitch: 0.3, curve: 0.18 }), rod([0.9, 1.4, 4.2], [0.9, 1.85, 4.6], 0.12, MT),
  sl([1.4, -1.6, 4.3], ellipse(0.35, 0.35, 12), 0.05, 'front', { ...LT, curve: 0.1 }),
] };
// P-19 Flat Face (antenna est): the ZiL-131 with its van body, the mast at the back of the roof carrying two elliptical
// reflectors one above the other, their feed horns on booms.
const ZIL_KUNG = kung(-3.52, 0.22, 2.45, 0.86, 2.95);
G['p-19-flat-face'] = { cls: 'radar', ...ZIL_131, bed: 'none', addOns: [
  ZIL_KUNG, rod([-2.4, 0, 2.95], [-2.4, 0, 5.9], 0.26, MT), hd(-2.4, 0, 3.05, 0.9, 0.2, DARK),
  ...[4.05, 5.55].flatMap((u) => [sl([-2.1, 0, u], ellipse(2.5, 0.68, 24), 0.08, 'front', { ...LT, pitch: 0.2, curve: 0.5 }), rod([-2.3, 0, u - 0.5], [-0.9, 0, u - 0.2], 0.07, DK), hb(-0.85, 0, u - 0.2, 0.3, 0.3, 0.25, DARK)]),
] };

// ---------------------------------------------------------------- SA-5 S-200 and the long-range radars

// 5V21 (S-200): 10.8 m, a 0.86 m body, four strap-on boosters round its tail with their own small fins, four big
// low-aspect delta wings (2.85 m span) and small ailerons (booster and fin sizes est).
const V5V21: Msl = { len: 10.8, d: 0.86, nose: 2.4, fins: [[3.2, 7.2, 3.4, 4.1, 1.0, 'x']] };
function strapOns(t: V3, e: number, ring: number, len: number, d: number): AddOn[] {
  const out: AddOn[] = [];
  for (const [n, s] of [[1, 1], [1, -1], [-1, 1], [-1, -1]]) {
    const o = (p: V3): V3 => [p[0], p[1] + (s * ring) / Math.SQRT2, p[2]];
    const a = o(along(t, e, 0, (n * ring) / Math.SQRT2));
    const b = o(along(t, e, len - 0.6, (n * ring) / Math.SQRT2));
    out.push(rod(a, b, d, LT), rod(b, o(along(t, e, len, (n * ring) / Math.SQRT2)), d, LT, 0));
  }
  return out;
}
// 5P72 launcher (est): a heavy base on its outriggers, the turntable and the launcher's housing, the single heavy beam with
// the 5V21 on top of it at its fixed elevation.
const S200_PIVOT: V3 = [-1.8, 0, 2.7];
const S200_E = 0.6;
G['s-200-launcher'] = { cls: 'sam', chassis: 'pedestal', bare: true, length: 7.0, width: 7.0, hullHeight: 1.6, addOns: [
  ...crossBase(3.5, 1.0, 5.0, 3.0), hd(0, 0, 1.2, 3.2, 0.4, DARK), bx(-2.8, 0.6, 0, 1.4, 2.6, 2.4),
  sl([0, 1.05, 0], [[-2.8, 2.5], [0.4, 2.5], [-1.2, 3.3], [-2.4, 3.3]], 0.15, 'side', M),
  beam(along(S200_PIVOT, S200_E, -0.6), S200_E, 9.4, 0.75, 0.6), rod([0.6, 0, 2.5], along(S200_PIVOT, S200_E, 3.2), 0.28, MT),
  ...missile(along(S200_PIVOT, S200_E, -0.5, 0.95), S200_E, V5V21), ...strapOns(along(S200_PIVOT, S200_E, -0.5, 0.95), S200_E, 0.68, 4.9, 0.48),
] };
// 5N62 Square Pair (est): the antenna cabin on its turntable over a round base, the big main dish on its front left and the
// smaller dish on the right, the feeds on their tripods.
G['5n62-square-pair'] = { cls: 'radar', chassis: 'static', bare: true, length: 6.5, width: 6.0, hullHeight: 2.6, addOns: [
  hd(0, 0, 0.6, 6.0, 1.2), hd(0, 0, 1.35, 4.2, 0.3, DARK), kung(-2.0, 1.4, 3.4, 1.5, 3.3),
  sl([1.9, -0.7, 4.3], ellipse(2.6, 2.6, 28), 0.12, 'front', { ...LT, pitch: 0.2, curve: 0.7 }), rod([1.6, -0.7, 2.6], [1.9, -0.7, 3.0], 0.3, MT),
  ...[[-1.6, 3.2], [0.2, 2.4], [-0.7, 6.0]].map(([s, u]) => rod([2.0, s, u], [3.8, -0.7, 4.6], 0.07, DK)), hb(3.9, -0.7, 4.6, 0.4, 0.4, 0.4, DARK),
  sl([1.6, 2.4, 3.6], ellipse(0.9, 0.9, 18), 0.08, 'front', { ...LT, pitch: 0.2, curve: 0.25 }), rod([1.6, 2.4, 3.6], [2.5, 2.4, 3.8], 0.06, DK),
] };
// P-14 Tall King (published about 32 m wide; height and frame est): the great open-mesh reflector on its turning truss at
// ground level, the horizontal feed array before it on its booms.
const P14 = (s: number, z: number): V3 => [-(z - 7.4) * Math.tan(0.25) + 3.0 * (s / 16) ** 2 - 0.15, s, z];
G['p-14-tall-king'] = { cls: 'radar', chassis: 'static', bare: true, length: 6.0, width: 6.0, hullHeight: 1.5, addOns: [
  hd(0, 0, 0.35, 7.0, 0.7, DARK), kung(-2.6, 0.8, 2.4, 0.7, 2.9),
  sl([0, 0, 7.4], rect(16, 5.4), 0.15, 'front', { ...LT, pitch: 0.25, curve: 3.0 }),
  ...[-12, -6, 0, 6, 12].flatMap((s) => [rod([-2.5, s * 0.3, 0.7], P14(s, 11.5), 0.18, MT), rod([2.5, s * 0.3, 0.7], P14(s, 3.0), 0.18, MT)]),
  rod([0.5, -14, 2.5], [0.5, 14, 2.5], 0.2, MT), rod([7.5, -7.5, 6.2], [7.5, 7.5, 6.2], 0.45, LT),
  ...[-5, 5].flatMap((s) => [rod([0.4, s, 2.6], [7.5, s, 6.2], 0.15, MT), rod([-0.8, s, 11.0], [7.5, s, 6.2], 0.12, MT)]),
] };
// ST-68U / 19J6 Tin Shield (array est 9.5 x 3.4 m): the curved reflector and its feed array turning on a lattice mast over
// the equipment cabin on its trailer.
G['19j6-tin-shield'] = { cls: 'radar', chassis: 'trailer', length: 10.0, width: 2.6, hullHeight: 1.4, axles: 2, axleAt: [0.45, -0.5], wheelRadius: 0.5, addOns: [
  kung(-4.9, 0.0, 2.5, 1.4, 3.6), ...tower(1.6, 0, 1.4, 6.9, 1.0, 0.45, 3), hd(1.6, 0, 7.05, 1.4, 0.3, DARK),
  sl([1.3, 0, 8.7], rect(4.75, 1.7), 0.12, 'front', { ...LT, pitch: 0.15, curve: 0.9 }), hb(3.0, 0, 8.2, 0.35, 6.4, 0.45, LT),
  ...[-2.5, 2.5].map((s) => rod([1.6, s * 0.6, 7.2], [3.0, s, 8.2], 0.1, MT)), rod([0.9, 0, 7.2], [1.1, 0, 10.2], 0.18, MT),
] };

// ---------------------------------------------------------------- SA-10 S-300PS battery

// 5P85S / 5P85D TEL on the MAZ-543 (13.0 m overall with the canisters; canisters 7.25 x 0.85 m est): the four round
// canisters raised upright at the back on the erector's frame, its jacks on the ground; the S carries the battery's control
// cabin behind the cabs and its mast, the D only a small generator box.
const S300_BASE: V3 = [-6.15, 0, 1.25];
const S300_PACK: AddOn[] = [
  ...[-0.46, 0.46].flatMap((a) => [-0.46, 0.46].map((s) => rod([S300_BASE[0] + a, s, S300_BASE[2]], [S300_BASE[0] + a + 0.35, s, S300_BASE[2] + 7.25], 0.85))),
  ...[0.25, 3.6, 7.0].map((u) => hb(S300_BASE[0] + (0.35 * u) / 7.25, 0, S300_BASE[2] + u, 1.95, 1.95, 0.22, DARK)),
  sl([0, 1.1, 0], [[-5.2, 1.5], [-4.8, 1.5], [-5.0, 7.6], [-5.4, 7.6]], 0.3, 'side', { ...M, ...DARK }),
  rod([-3.2, 0, 1.7], [-5.0, 0, 5.0], 0.25, MT), ...[-1, 1].map((s) => rod([-5.5, s * 1.3, 1.4], [-6.3, s * 1.7, 0.1], 0.2, MT)),
  ...[-1, 1].map((s) => hb(-6.3, s * 1.7, 0.06, 0.5, 0.5, 0.12, DARK)), bx(-5.85, 2.9, 0, 1.4, 1.55, 3.0),
];
G['5p85s-s-300-tel'] = { cls: 'sam', ...MAZ_543, addOns: [...MAZ_543.addOns!, ...S300_PACK, kung(0.6, 3.05, 2.9, 1.5, 3.05), rod([0.9, -1.0, 3.05], [0.9, -1.0, 5.6], 0.1, MT), hb(0.9, -1.0, 5.6, 0.5, 0.5, 0.1, DARK)] };
G['5p85d-s-300-tel'] = { cls: 'sam', ...MAZ_543, addOns: [...MAZ_543.addOns!, ...S300_PACK, kung(1.6, 3.05, 1.9, 1.5, 2.35)] };
// 30N6 Flap Lid on the MAZ-7910 (5N63S, antenna est 3.3 x 3.3 m): the long antenna-post cabin behind the cabs, the turning
// post on its roof carrying the flat phased-array face leaning back and the small LORO arrays either side.
G['30n6-flap-lid'] = { cls: 'radar', ...MAZ_543, addOns: [
  ...MAZ_543.addOns!, kung(-5.85, 2.95, 2.95, 1.5, 3.6), hd(-1.4, 0, 3.8, 2.4, 0.4, DARK), bx(-2.4, -0.6, 0, 3.9, 5.0, 1.8),
  sl([-1.0, 0, 5.75], chamfer(1.65, 1.65, 0.35), 0.6, 'front', { ...LT, pitch: 0.35 }), ...[-1, 1].map((s) => sl([-1.1, s * 2.15, 5.1], rect(0.35, 0.65), 0.2, 'front', { ...LT, pitch: 0.35 })),
  ...[-1, 1].map((s) => rod([-1.6, s * 0.5, 4.6], [-1.3, s * 1.9, 5.0], 0.12, MT)),
] };
// 64N6 Big Bird (array est 6.4 x 4.6 m): the two-faced array back to back, turning on its post over the semitrailer's
// equipment cabins (drawn unhitched from its MAZ-7410 tractor).
G['64n6-big-bird'] = { cls: 'radar', chassis: 'trailer', bare: true, length: 13.0, width: 3.1, hullHeight: 1.6, axles: 3, axleAt: [-0.45, -0.62, -0.79], wheelRadius: 0.55, addOns: [
  ...semiFrame(-6.3, 6.5, 3.0, 1.6, 1.75, 2.4), kung(-6.3, -1.6, 2.95, 1.6, 3.5), kung(1.8, 4.0, 2.95, 1.6, 3.3), hd(0.2, 0, 2.6, 2.4, 2.0, DARK), hd(0.2, 0, 3.75, 1.4, 0.3, MT),
  hb(0.2, 0, 6.2, 1.2, 6.4, 4.6), ...[0.83, -0.43].map((x) => sl([x, 0, 6.2], rect(3.15, 2.25), 0.06, 'front', LT)),
] };
// 76N6 Clam Shell (tower about 24 m; antenna est 6.6 x 3.0 m): the 40V6 lattice mast on its cross of outriggers, the
// curved reflector and its feed on the top platform.
G['76n6-clam-shell'] = { cls: 'radar', chassis: 'static', bare: true, length: 8.0, width: 8.0, hullHeight: 0.6, addOns: [
  bx(-4.0, 4.0, 0, 0, 0.6, 1.0, DARK), bx(-0.5, 0.5, 0, 0, 0.6, 8.0, DARK), ...tower(0, 0, 0.6, 23.2, 1.8, 0.55, 7, 0.16),
  hb(0, 0, 23.35, 1.8, 1.8, 0.3), hd(0, 0, 23.7, 1.2, 0.4, DARK),
  sl([0.4, 0, 25.2], ellipse(3.3, 1.5, 22), 0.15, 'front', { ...LT, pitch: 0.15, curve: 0.7 }), rod([0.2, 0, 23.9], [2.6, 0, 24.8], 0.14, DK), hb(2.75, 0, 24.85, 0.5, 0.7, 0.5, DARK),
] };
// 54K6 command post: the MAZ-543 with the long equipment van behind its cabs, the air-conditioning boxes and a whip mast.
G['54k6-s-300-cp'] = { cls: 'sam-cp', ...MAZ_543, addOns: [...MAZ_543.addOns!, kung(-5.85, 2.95, 2.95, 1.5, 3.45), hb(-5.3, 0, 3.6, 0.8, 1.6, 0.3, DARK), hb(1.5, 0.8, 3.6, 0.9, 0.8, 0.3, DARK), rod([-4.6, -1.1, 3.45], [-4.6, -1.1, 6.6], 0.08, MT)] };

// ---------------------------------------------------------------- Pantsir, HQ-7, Tor, Roland

// Pantsir-S1 on the KamAZ-6560 8x8 (est 10.6 x 2.55 m, 4.5 m with the radar up): the cab-over cab, the equipment box behind
// it, the combat module at the back - its turret with the round tracking-radar face on the front, the twin 30 mm pairs low
// on its sides, six canisters in a pack above each, the search array on the turret's back.
G['pantsir-s1'] = { ...AD('pantsir-s1'), cab: { length: 2.4, height: 3.0, outline: forwardCab(10.6, 2.55, 0.6, 2.4, 3.0, 0.3, 0.55, 12) }, bed: 'none',
  turret: turret(-2.6, [[-1.3, 0.8], [-1.1, 0.95], [1.0, 0.95], [1.3, 0.7]], [[-1.3, 1.1], [-1.0, 1.3], [0.9, 1.3], [1.3, 0.75]], 10, 1.25, { up: 0.25 }),
  radars: undefined, addOns: [
    bx(-5.3, 2.75, 0, 0.95, 1.6, 2.45), kung(-0.6, 2.75, 2.45, 1.6, 2.95), hd(-2.6, 0, 1.75, 2.0, 0.3, DARK),
    { on: 'turret', kind: 'slab', at: [1.32, 0, 0.75], size: [0.15, 0, 0], poly: ellipse(0.5, 0.5, 16), plane: 'front', paint: 'light' },
    { on: 'turret', kind: 'box', at: [-0.7, 0, 1.6], size: [0.6, 0.5, 0.6], metal: true },
    { on: 'turret', kind: 'slab', at: [-0.8, 0, 2.3], size: [0.3, 0, 0], poly: rect(1.1, 0.75), plane: 'front', pitch: -0.35, paint: 'light' },
  ] };
// HQ-7 TELAR (est 7.2 x 3.0 m): the boat-nosed 6x6, its turret with two missile boxes on each side and the tracking dish
// and TV between them; the STR the same carrier with the search antenna turning on a low turret.
const HQ7: GroundSpec = { chassis: 'wheeled', length: 7.2, width: 3.0, hullHeight: 1.9, axles: 3, axleAt: [0.62, -0.05, -0.62], wheelRadius: 0.55, hullOutline: wheeledHull(7.2, 1.9, 1.1, 1.45, 1.8, 0.6) };
G['hq-7-telar'] = { ...AD('hq-7-telar'), ...HQ7, turret: turret(-0.6, [[-0.9, 0.6], [-0.7, 0.7], [0.6, 0.7], [0.9, 0.45]], [[-0.9, 0.75], [-0.6, 0.9], [0.6, 0.9], [0.9, 0.55]], 8, 0.85), radars: undefined, addOns: [
  { on: 'turret', kind: 'slab', at: [1.0, 0, 0.55], size: [0.08, 0, 0], poly: ellipse(0.4, 0.4, 14), plane: 'front', curve: 0.1, paint: 'light' },
  { on: 'turret', kind: 'box', at: [0.85, 0.0, 1.05], size: [0.4, 0.3, 0.3], metal: true },
] };
G['hq-7-str'] = { ...AD('hq-7-str'), ...HQ7, turret: turret(-0.6, [[-0.8, 0.6], [-0.6, 0.7], [0.6, 0.7], [0.8, 0.5]], [[-0.8, 0.5], [-0.5, 0.6], [0.5, 0.6], [0.8, 0.4]], 8, 0.8), radars: undefined, addOns: [
  { on: 'turret', kind: 'box', at: [-0.1, 0, 0.85], size: [0.4, 0.4, 0.5], metal: true },
  { on: 'turret', kind: 'slab', at: [0.0, 0, 1.55], size: [0.12, 0, 0], poly: rect(1.3, 0.45), plane: 'front', pitch: 0.35, curve: 0.2, paint: 'light' },
  { on: 'turret', kind: 'box', at: [0.05, 0, 2.1], size: [0.15, 1.6, 0.15], paint: 'light' },
] };
// 9K330 Tor (1986) on the GM-355 (7.5 x 3.3 m, 5.1 m with the antenna up): the tall slab-sided turret holding the upright
// missile cells, the tracking array on its sloped front, the search antenna on its arm leaning over the turret's back.
G['9k330-tor'] = { ...AD('9a331-tor-m1'), ...GM_CHASSIS, length: 7.5, width: 3.3, hullHeight: 1.6, turret: turret(-0.4, [[-1.5, 1.1], [-1.3, 1.2], [1.25, 1.2], [1.5, 1.0]], [[-1.5, 1.5], [-1.3, 1.65], [0.9, 1.65], [1.5, 1.05]], 12, 1.4), radars: undefined, addOns: [
  { on: 'turret', kind: 'slab', at: [1.3, 0, 0.75], size: [0.25, 0, 0], poly: chamfer(0.65, 0.55, 0.12), plane: 'front', pitch: 0.55, paint: 'light' },
  { on: 'turret', kind: 'box', at: [-1.2, 0, 1.95], size: [0.5, 0.8, 0.6], metal: true },
  { on: 'turret', kind: 'slab', at: [-1.45, 0, 2.6], size: [0.18, 0, 0], poly: rect(1.4, 0.45), plane: 'front', pitch: -0.45, curve: 0.2, paint: 'light' },
  { on: 'turret', kind: 'box', at: [0.3, 0, 1.68], size: [1.6, 1.8, 0.05], metal: true },
] };
// Roland on the Marder (6.9 x 3.24 m): the Roland turret over the hull's middle, a launch tube on an arm each side, the
// folding search antenna on its roof and the tracking dish on the front.
G['roland-marder'] = { ...MARDER, cls: 'spaa', length: 6.9, turret: turret(-0.4, [[-0.9, 0.62], [-0.7, 0.72], [0.7, 0.72], [0.9, 0.55]], [[-0.9, 0.85], [-0.6, 1.0], [0.6, 1.0], [0.9, 0.7]], 8, 0.85), guns: undefined,
  missiles: [{ mount: 'turret-side', rows: 1, cols: 1, length: 2.6, diameter: 0.27, elevation: 0.25, up: 0.6 }], radars: undefined, addOns: [
    { on: 'turret', kind: 'box', at: [0.2, 0, 0.55], size: [0.3, 1.8, 0.3], metal: true },
    { on: 'turret', kind: 'slab', at: [-0.2, 0, 1.3], size: [0.1, 0, 0], poly: rect(0.8, 0.22), plane: 'front', pitch: 0.3, paint: 'light' },
    { on: 'turret', kind: 'slab', at: [0.95, 0, 0.45], size: [0.06, 0, 0], poly: ellipse(0.28, 0.28, 12), plane: 'front', curve: 0.06, paint: 'light' },
  ] };

// ---------------------------------------------------------------- Rapier and Hawk

// Rapier missile: 2.24 m, 0.133 m, four wings at mid-body and the tail fins (fin sizes est).
const RAPIER: Msl = { len: 2.24, d: 0.133, nose: 0.32, fins: [[0.9, 1.4, 1.0, 1.25, 0.17, 'x'], [0.0, 0.25, 0.0, 0.15, 0.14, 'x']] };
// Rapier FSA launcher (4.06 x 1.76 m, 2.13 m): a single-axle trailer on its levelling jacks, the drum in the middle with the
// surveillance antenna on top, two missiles on an arm each side.
G['rapier-launcher'] = { cls: 'sam', chassis: 'trailer', length: 4.06, width: 1.76, hullHeight: 0.85, axles: 1, wheelRadius: 0.4, outriggers: true, addOns: [
  hd(-0.3, 0, 1.35, 1.0, 1.0), hd(-0.3, 0, 2.0, 0.55, 0.3, DARK), hb(-0.3, 0, 2.3, 0.4, 1.0, 0.35, LT),
  ...[-1, 1].flatMap((s) => [bx(-0.6, 0.0, s * 0.62, 1.1, 1.75, 0.18, DARK), ...[1.25, 1.62].flatMap((u) => missile([-1.1, s * 0.78, u], 0.12, RAPIER))]),
] };
// Rapier optical tracker (est): the tracker head on its tripod, the optics in front and the operator's sight.
G['rapier-tracker'] = { cls: 'sam-cp', chassis: 'pedestal', bare: true, length: 1.6, width: 1.6, hullHeight: 1.0, addOns: [
  ...[[0.8, 0], [-0.45, 0.7], [-0.45, -0.7]].map(([x, s]) => rod([0, 0, 1.0], [x, s, 0], 0.06, MT)), hd(0, 0, 1.05, 0.35, 0.2, DARK),
  hb(0, 0, 1.35, 0.6, 0.5, 0.45), rod([0.25, -0.12, 1.4], [0.5, -0.12, 1.4], 0.2, DK), rod([0.25, 0.14, 1.45], [0.45, 0.14, 1.45], 0.12, DK), hb(-0.45, 0, 1.25, 0.3, 0.4, 0.15, DARK),
] };
// Rapier Blindfire DN 181 (est): the tracking radar in its upright drum-shaped housing over the electronics cabinet, on a
// single-axle trailer on its jacks.
G['rapier-blindfire'] = { cls: 'radar', chassis: 'trailer', length: 4.0, width: 1.9, hullHeight: 1.0, axles: 1, wheelRadius: 0.4, outriggers: true, addOns: [
  bx(-1.6, 0.4, 0, 1.0, 2.1, 1.6), hd(-0.6, 0, 2.15, 0.9, 0.1, DARK), hd(-0.6, 0, 2.85, 1.3, 1.3, { shade: 0.95 }), { on: 'hull', kind: 'blob', at: [-0.6, 0, 3.5], size: [1.3, 1.3, 0.35] },
] };

// MIM-23 Hawk: 5.08 m, 0.37 m, its long-chord clipped-delta wings at the back (1.19 m span).
const HAWK: Msl = { len: 5.08, d: 0.37, nose: 0.75, fins: [[0.1, 2.0, 0.15, 0.6, 0.41, 'x']] };
// M192 launcher (est 4.9 x 3.25 m with outriggers): the two-wheeled carriage on its four jacks, the pedestal and the cross
// beam with three launch beams, the missiles hung under them.
const HAWK_E = 0.3;
G['hawk-m192-launcher'] = { cls: 'sam', chassis: 'trailer', bare: true, length: 4.9, width: 2.2, hullHeight: 0.9, axles: 1, axleAt: [-0.15], wheelRadius: 0.45, addOns: [
  bx(-2.0, 1.4, 0, 0.6, 0.95, 1.3), rod([1.4, 0, 0.8], [2.45, 0, 0.5], 0.12, MT),
  ...[[1.2, 1], [1.2, -1], [-1.8, 1], [-1.8, -1]].map(([x, s]) => rod([x, s * 0.6, 0.8], [x + Math.sign(x) * 0.4, s * 1.62, 0.12], 0.12, MT)),
  hd(-0.4, 0, 1.25, 1.1, 0.6, DARK), sl([-0.4, 0.55, 0], [[-0.6, 1.5], [0.6, 1.5], [0.25, 2.2], [-0.25, 2.2]], 0.12, 'side', M), hb(-0.4, 0, 2.15, 0.4, 2.5, 0.3),
  ...[-0.95, 0, 0.95].flatMap((s) => [beam([-1.7, s, 2.35], HAWK_E, 3.4, 0.18, 0.22, DARK), ...missile(along([-1.9, s, 2.35], HAWK_E, 0, -0.35), HAWK_E, HAWK)]),
] };
// AN/MPQ-50 pulse acquisition radar (est): the wide curved reflector leaning back on its pedestal, the feed horn on its
// boom, the IFF bar along its top; on a trailer on its jacks.
G['hawk-mpq-50-par'] = { cls: 'radar', chassis: 'trailer', length: 4.8, width: 2.2, hullHeight: 1.2, axles: 1, wheelRadius: 0.45, outriggers: true, addOns: [
  bx(-1.6, 0.2, 0, 1.2, 1.7, 1.6), hd(-0.4, 0, 1.6, 0.8, 0.8, DARK),
  sl([0.0, 0, 2.75], rect(2.15, 0.78), 0.08, 'front', { ...LT, pitch: 0.3, curve: 0.45 }), rod([-0.4, 0, 2.0], [1.4, 0, 2.35], 0.1, DK), hb(1.45, 0, 2.4, 0.35, 0.35, 0.35, DARK),
  hb(-0.3, 0, 3.6, 0.15, 3.8, 0.22, LT),
] };
// AN/MPQ-46 high-power illuminator (est): two round dishes side by side on a common mount over its cabinet.
G['hawk-mpq-46-hpir'] = { cls: 'radar', chassis: 'trailer', length: 4.6, width: 2.2, hullHeight: 1.2, axles: 1, wheelRadius: 0.45, outriggers: true, addOns: [
  bx(-1.8, 0.0, 0, 1.2, 2.1, 1.6), hd(-0.4, 0, 2.3, 0.7, 0.6, DARK), hb(-0.4, 0, 2.7, 0.6, 1.4, 0.4),
  ...[-0.78, 0.78].flatMap((s) => [sl([-0.1, s, 2.9], ellipse(0.66, 0.66, 18), 0.07, 'front', { ...LT, pitch: 0.2, curve: 0.18 }), rod([-0.1, s, 2.9], [0.6, s, 3.05], 0.06, DK)]),
] };
// AN/MPQ-55 continuous-wave acquisition radar (est): two flat antennas back to back turning on a pedestal.
G['hawk-mpq-55-cwar'] = { cls: 'radar', chassis: 'trailer', length: 4.2, width: 2.2, hullHeight: 1.2, axles: 1, wheelRadius: 0.45, outriggers: true, addOns: [
  bx(-1.4, 0.0, 0, 1.2, 1.9, 1.6), hd(-0.3, 0, 2.15, 0.6, 0.6, DARK), hb(-0.3, 0, 2.95, 0.6, 1.9, 1.0),
  ...[0.02, -0.62].map((x) => sl([x, 0, 2.95], rect(0.95, 0.5), 0.05, 'front', LT)),
] };
// Hawk platoon command post (est): the shelter on its two-wheeled trailer, the air-conditioner on its front and a whip.
G['hawk-pcp'] = { cls: 'sam-cp', chassis: 'trailer', length: 5.0, width: 2.2, hullHeight: 1.2, axles: 1, wheelRadius: 0.45, addOns: [
  kung(-2.5, 1.0, 2.1, 1.2, 3.2), hb(1.15, 0, 2.3, 0.3, 1.2, 0.7, DARK), rod([-2.2, 0.8, 3.2], [-2.2, 0.8, 5.6], 0.06, MT),
] };

// ---------------------------------------------------------------- Patriot battery

// The M901 launcher's pack: four canisters (est 6.1 x 0.9 m each), two by two, raised 38 degrees toward the back of the
// trailer about the pack's front end, the dark muzzle covers at its raised end; the launcher's frame under it.
const PATRIOT_E = 0.66;
const patriotPack = (x: number, deck: number): AddOn[] => [
  beam([x, 0, deck + 0.55], PATRIOT_E, 6.1, 1.9, 1.9, {}, Math.PI), sl(along([x, 0, deck + 0.55], PATRIOT_E, 6.12, 0, Math.PI), rect(0.9, 0.9), 0.05, 'front', { ...DK, pitch: -PATRIOT_E }),
  bx(x - 3.2, x + 0.4, 0, deck, deck + 0.45, 2.2, DARK), rod([x - 2.6, 0, deck + 0.4], along([x, 0, deck + 0.55], PATRIOT_E, 2.4, -0.9, Math.PI), 0.25, MT),
];
// M901 with its M983 HEMTT tractor (est 16.5 m overall): the tractor's cab and the generator behind it, the M860 semitrailer
// on its two rear axles, the canister pack raised.
G['patriot-m901-launcher'] = { cls: 'sam', chassis: 'wheeled', length: 16.5, width: 2.9, hullHeight: 1.4, axles: 6, axleAt: [0.87, 0.71, 0.36, 0.22, -0.66, -0.8], wheelRadius: 0.62, hull: 'truck', bed: 'none', cab: { length: 2.4, height: 2.84, outline: forwardCab(16.5, 2.44, 0.62, 2.4, 2.84, 0.2, 0.62, 14) }, addOns: [
  bx(4.1, 5.75, 0, 1.0, 2.4, 2.3), hb(3.2, 0, 1.75, 1.0, 1.6, 0.25, DARK),
  ...semiFrame(-8.25, 4.0, 2.8, 1.45, 1.6, 2.0, false), bx(1.8, 3.6, 0, 1.6, 2.7, 2.4), ...patriotPack(-1.6, 1.45),
] };
// M901 on its M860 semitrailer alone (10.4 m), standing on its landing legs.
G['mim-104-patriot-launcher'] = { cls: 'sam', chassis: 'trailer', bare: true, length: 10.4, width: 2.9, hullHeight: 1.4, axles: 2, axleAt: [-0.64, -0.86], wheelRadius: 0.55, addOns: [
  ...semiFrame(-5.2, 5.2, 2.8, 1.45, 1.6, 2.2), bx(3.0, 4.8, 0, 1.6, 2.7, 2.4), ...patriotPack(1.8, 1.45),
] };
// AN/MPQ-53 radar set (est): the shelter on its M860 semitrailer, its front laid back as the antenna face - the big main
// array, the IFF array above it and the small guard arrays at its corners.
G['patriot-mpq-53'] = { cls: 'radar', chassis: 'trailer', bare: true, length: 10.4, width: 2.9, hullHeight: 1.5, axles: 2, axleAt: [-0.64, -0.86], wheelRadius: 0.55, addOns: [
  ...semiFrame(-5.2, 5.2, 2.8, 1.45, 1.6, 2.0), sl([0, 0, 0], [[-5.2, 1.45], [2.2, 1.45], [1.0, 4.2], [-5.2, 4.2]], 2.8, 'side'),
  sl([1.65, 0, 2.85], chamfer(1.25, 1.25, 0.45), 0.12, 'front', { ...LT, pitch: 0.42 }), sl([1.15, 0, 4.0], rect(0.9, 0.18), 0.1, 'front', { ...LT, pitch: 0.42 }),
  ...[[-1.15, 1.85], [1.15, 1.85]].map(([s, u]) => sl([2.05, s, u], rect(0.22, 0.22), 0.1, 'front', { ...LT, pitch: 0.42 })), hb(-4.6, 0, 4.35, 0.8, 1.6, 0.3, DARK),
] };
// Engagement control station (est): the S-280 shelter on an M927 5-ton, the air conditioners on its front, the whip aerials;
// the information and coordination central is the same shelter with its own aerials and the mast base on the roof.
const M939_FLOOR = 0.88;
const PATRIOT_SHELTER: AddOn[] = [kung(-3.95, 0.35, 2.3, M939_FLOOR + 0.15, M939_FLOOR + 2.35), bx(-3.95, 0.35, 0, M939_FLOOR - 0.05, M939_FLOOR + 0.15, 2.3, DARK)];
G['patriot-ecs'] = { cls: 'sam-cp', ...M939, bed: 'none', addOns: [...PATRIOT_SHELTER, ...[-0.6, 0.6].map((s) => hb(-0.1, s, 2.95, 0.5, 0.75, 0.55, DARK)), ...[-1, 1].map((s) => rod([-3.6, s * 1.0, 3.35], [-3.6, s * 1.0, 5.6], 0.06, MT))] };
G['patriot-icc'] = { cls: 'sam-cp', ...M939, bed: 'none', addOns: [...PATRIOT_SHELTER, hb(-0.1, 0.6, 2.95, 0.5, 0.75, 0.55, DARK), hd(-2.2, 0, 3.45, 0.6, 0.2, DARK), rod([-2.2, 0, 3.5], [-2.2, 0, 4.9], 0.12, MT), hb(-2.2, 0, 4.95, 0.3, 1.4, 0.3, LT), rod([-3.6, -1.0, 3.35], [-3.6, -1.0, 5.6], 0.06, MT)] };
// Electric power plant III: the M977 HEMTT carrying two 150 kW generator sets, their exhaust stacks, the fuel tank between.
G['patriot-epp'] = { cls: 'sam-cp', ...HEMTT, bed: 'none', addOns: [
  ...cargo(-5.1, 2.5, 2.4, 1.3, 0), bx(-5.0, -2.5, 0, 1.3, 2.9, 2.2), bx(-1.6, 0.9, 0, 1.3, 2.9, 2.2), bx(-2.45, -1.65, 0, 1.3, 2.3, 1.6, DARK),
  ...[-3.0, 0.4].map((x) => rod([x, 0.8, 2.9], [x, 0.8, 3.5], 0.18, MT)),
] };
// OE-349 antenna mast group (est, masts about 20 m): the truck with its equipment shelter and the two masts raised from the
// back, two antennas at the head of each.
G['patriot-amg'] = { cls: 'radar', ...FMTV, bed: 'none', addOns: [
  kung(-2.0, 1.0, 2.3, 1.1, 2.9), bx(-3.5, -2.0, 0, 0.96, 1.1, 2.3),
  ...[[-2.8, 0.55, 18.5], [-3.2, -0.55, 16.5]].flatMap(([x, s, u]) => [rod([x, s, 1.1], [x, s, u], 0.22, MT, 0.12), hb(x, s - 0.75, u + 0.5, 0.6, 1.0, 1.1, LT), hb(x, s + 0.75, u + 0.5, 0.6, 1.0, 1.1, LT), hb(x, s, u + 0.05, 0.3, 2.6, 0.12, DARK)]),
] };

// ---------------------------------------------------------------- NASAMS, IRIS-T SLM, Roland EWR

// NASAMS canister launcher (est): six AMRAAM canisters, two rows of three, in their frame raised on the trailer's turntable.
G['nasams-launcher'] = { cls: 'sam', chassis: 'trailer', length: 6.4, width: 2.5, hullHeight: 1.1, axles: 2, axleAt: [-0.12, -0.42], wheelRadius: 0.45, outriggers: true, addOns: [
  hd(-0.8, 0, 1.3, 1.4, 0.4, DARK), sl([-0.8, 0.75, 0], [[-1.0, 1.3], [0.6, 1.3], [0.2, 2.2], [-0.8, 2.2]], 0.12, 'side', M),
  beam([-2.4, 0, 2.0], 0.5, 4.2, 1.85, 1.15), sl(along([-2.4, 0, 2.0], 0.5, 4.22), rect(0.88, 0.52), 0.05, 'front', { ...DK, pitch: 0.5 }),
] };
// AN/MPQ-64 Sentinel (est): the flat array and the IFF bar on its top turning on the trailer's pedestal over the electronics.
G['nasams-mpq-64-sentinel'] = { cls: 'radar', chassis: 'trailer', length: 5.4, width: 2.3, hullHeight: 1.1, axles: 1, wheelRadius: 0.45, outriggers: true, addOns: [
  bx(-2.2, 0.6, 0, 1.1, 2.1, 2.1), hd(-0.6, 0, 2.3, 0.8, 0.4, DARK), sl([-0.6, 0, 3.2], rect(1.2, 0.7), 0.35, 'front', { ...LT, pitch: 0.2 }), hb(-0.75, 0, 4.0, 0.15, 2.4, 0.2, LT),
] };
// NASAMS fire distribution centre (est): the shelter on its trailer, its air conditioner and aerials.
G['nasams-cp'] = { cls: 'sam-cp', chassis: 'trailer', length: 5.0, width: 2.2, hullHeight: 1.2, axles: 1, wheelRadius: 0.45, addOns: [
  kung(-2.5, 1.0, 2.1, 1.2, 3.2), hb(-2.65, 0, 2.3, 0.3, 1.2, 0.7, DARK), ...[-1, 1].map((s) => rod([0.7, s * 0.8, 3.2], [0.7, s * 0.8, 5.0], 0.06, MT)),
] };
// IRIS-T SLM launcher on a MAN 6x6 (est): eight canisters, two rows of four, raised upright over the back on their frame,
// the jacks down.
G['iris-t-slm-launcher'] = { cls: 'sam', ...MAN_HX, bed: 'none', outriggers: true, addOns: [
  ...cargo(-4.2, 1.75, 2.45, 1.25, 0), bx(0.6, 1.7, 0, 1.25, 2.6, 2.4), beam([-4.0, 0, 1.6], 1.45, 3.6, 2.1, 1.0), sl(along([-4.0, 0, 1.6], 1.45, 3.62), rect(1.02, 0.47), 0.05, 'front', { ...DK, pitch: 1.45 }),
  ...[-1, 1].map((s) => rod([-3.8, s * 1.1, 1.2], [-4.2, s * 1.5, 0.1], 0.16, MT)),
] };
// TRML-4D radar on a MAN truck (est): the shelter, and the large flat array raised on its turntable on top, leaning back.
G['iris-t-slm-str'] = { cls: 'radar', ...MAN_HX, bed: 'none', addOns: [
  kung(-4.2, 1.75, 2.45, 1.1, 3.4), hd(-1.8, 0, 3.55, 1.2, 0.3, DARK), sl([-1.8, 0, 4.9], rect(1.4, 1.15), 0.4, 'front', { ...LT, pitch: 0.3 }), hb(-1.9, 0, 6.15, 0.15, 2.4, 0.2, LT),
] };
// IRIS-T SLM command post (est): the shelter on a MAN truck, its telescopic mast and aerials.
G['iris-t-slm-cp'] = { cls: 'sam-cp', ...MAN_HX, bed: 'none', addOns: [kung(-4.2, 1.75, 2.45, 1.1, 3.4), rod([-3.8, 0.9, 3.4], [-3.8, 0.9, 6.6], 0.14, MT), hb(-3.8, 0.9, 6.65, 0.25, 0.9, 0.12, DARK), hb(1.2, 0, 3.55, 0.6, 1.4, 0.3, DARK)] };
// Roland early-warning radar (est): a MAN truck with its shelter, the search antenna turning on a short mast over it.
G['roland-ewr'] = { cls: 'radar', ...MAN_HX, bed: 'none', addOns: [
  kung(-4.2, 1.75, 2.45, 1.1, 3.4), rod([-2.6, 0, 3.4], [-2.6, 0, 4.6], 0.25, MT), hd(-2.6, 0, 4.65, 0.6, 0.2, DARK),
  sl([-2.5, 0, 5.05], rect(1.0, 0.3), 0.12, 'front', { ...LT, pitch: 0.2, curve: 0.25 }),
] };

// ---------------------------------------------------------------- early-warning radars and site equipment

/** Yagi elements pointing forward from a frame: rows and columns over `w` by `h` about (x, 0, u). */
const yagis = (x: number, u: number, w: number, h: number, cols: number, rows: number, len: number): AddOn[] => Array.from({ length: cols * rows }, (_, i) => {
  const s = -w / 2 + (w * (i % cols + 0.5)) / cols;
  const z = u - h / 2 + (h * (Math.floor(i / cols) + 0.5)) / rows;
  return rod([x, s, z], [x + len, s, z], 0.12, LT, 0.04);
});
/** An open frame of `w` by `h` about (x, 0, u): its edges and `n` uprights. */
const frame = (x: number, u: number, w: number, h: number, n: number): AddOn[] => [
  ...[u - h / 2, u, u + h / 2].map((z) => rod([x, -w / 2, z], [x, w / 2, z], 0.14, MT)),
  ...Array.from({ length: n }, (_, i) => -w / 2 + (w * i) / (n - 1)).map((s) => rod([x, s, u - h / 2], [x, s, u + h / 2], 0.1, MT)),
];
// 1L13 Nebo-SV (array est 11 x 5 m): the frame of yagi antennas, three rows of six, on its turning mast over the cabin
// on its semitrailer.
G['1l13-nebo-sv'] = { cls: 'radar', chassis: 'trailer', bare: true, length: 11.0, width: 2.7, hullHeight: 1.4, axles: 2, axleAt: [-0.5, -0.7], wheelRadius: 0.5, addOns: [
  ...semiFrame(-5.5, 5.5, 2.6, 1.4, 1.55, 2.0), kung(-5.3, -1.2, 2.5, 1.4, 3.5), ...tower(1.2, 0, 1.55, 3.4, 0.9, 0.5, 1), hd(1.2, 0, 3.5, 1.2, 0.3, DARK),
  ...frame(1.0, 6.1, 11, 5, 7), ...yagis(1.0, 6.1, 11, 5, 6, 3, 2.4),
] };
// 55Zh6 Nebo-U (array est 30 x 10 m): the great yagi array on its ground truss, its cabin underneath.
G['55g6-nebo'] = { cls: 'radar', chassis: 'static', bare: true, length: 8.0, width: 8.0, hullHeight: 1.2, addOns: [
  hd(0, 0, 0.3, 6.0, 0.6, DARK), kung(-3.0, 1.5, 2.5, 0.6, 3.0), ...tower(0, 0, 0.6, 4.0, 3.0, 1.0, 1, 0.2),
  ...frame(0.4, 9.2, 30, 10, 9), ...yagis(0.4, 9.2, 30, 10, 12, 4, 2.6), ...[-10, 10].map((s) => rod([0, s * 0.3, 1.0], [0.4, s, 4.2], 0.2, MT)),
] };
// AN/FPS-117 (est): the flat array and its IFF bar turning on a pedestal over its building; the radome version on a taller
// building; and its equipment shelter.
G['fps-117'] = { cls: 'radar', chassis: 'static', bare: true, length: 8.0, width: 8.0, hullHeight: 3.0, addOns: [
  bx(-4.0, 4.0, 0, 0, 3.0, 8.0), hd(0, 0, 3.6, 2.0, 1.2, DARK), bx(-1.3, 0.3, 0, 4.2, 5.2, 1.6), sl([0.2, 0, 7.0], rect(3.5, 2.0), 0.8, 'front', { ...LT, pitch: 0.1 }), hb(0.0, 0, 9.3, 0.25, 6.0, 0.35, LT),
] };
G['fps-117-dome'] = { cls: 'radar', chassis: 'static', bare: true, length: 14.0, width: 14.0, hullHeight: 6.0, addOns: [
  bx(-6.0, 6.0, 0, 0, 6.0, 12.0), hb(0, 0, 6.15, 13.0, 13.0, 0.3, DARK), { on: 'hull', kind: 'blob', at: [0, 0, 11.6], size: [14.0, 14.0, 12.4], shade: 0.97 },
] };
G['fps-117-ecs'] = { cls: 'sam-cp', chassis: 'static', bare: true, length: 6.0, width: 2.5, hullHeight: 2.6, addOns: [
  bx(-3.0, 3.0, 0, 0.15, 2.65, 2.5), bx(-3.0, 3.0, 0, 0, 0.15, 2.3, DARK), hb(3.2, 0, 1.4, 0.4, 1.4, 1.0, DARK), hb(-1.0, 1.4, 0.4, 0.8, 0.3, 0.8, DARK), ...[-2.0, 2.0].map((x) => rod([x, 0.9, 2.65], [x, 0.9, 4.6], 0.05, MT)),
] };
// 5I57 diesel power station (est): the long engine van on its semitrailer, the radiator grilles at its ends and the exhausts.
G['5i57-generator'] = { cls: 'sam-cp', chassis: 'trailer', bare: true, length: 7.0, width: 2.5, hullHeight: 1.4, axles: 2, axleAt: [-0.45, -0.75], wheelRadius: 0.5, addOns: [
  ...semiFrame(-3.5, 3.5, 2.4, 1.35, 1.35, 1.2), kung(-3.4, 2.4, 2.45, 1.35, 3.3), ...[-3.42, 2.42].map((x) => sl([x, 0, 2.3], rect(0.9, 0.7), 0.04, 'front', DK)),
  ...[-1.6, 0.6].map((x) => rod([x, 0.7, 3.3], [x, 0.7, 3.9], 0.2, MT)),
] };
// GCI station: the ZiL-131 with its van body, a telescopic aerial mast and whips.
G['zil-131-cabin'] = { cls: 'sam-cp', ...ZIL_131, bed: 'none', addOns: [ZIL_KUNG, rod([-3.3, 1.0, 2.95], [-3.3, 1.0, 6.2], 0.12, MT), hb(-3.3, 1.0, 6.25, 0.2, 1.2, 0.1, DARK), rod([-0.2, -1.0, 2.95], [-0.2, -1.0, 4.6], 0.05, MT), hb(-1.6, 0, 3.05, 0.9, 1.2, 0.2, DARK)] };

// ---------------------------------------------------------------- strategic and coastal missiles

// R-17 (Scud-B): 11.16 m, 0.88 m, the long ogive nose, four small tail fins (1.81 m span).
const R17: Msl = { len: 11.16, d: 0.88, nose: 2.9, fins: [[0.0, 1.3, 0.0, 0.65, 0.47, 'x']] };
// 9P117 Scud-B TEL on the MAZ-543 (13.36 m overall): the R-17 lying on its erector, nose just behind the cabs, the folded
// launch table at the back.
G['scud-b-tel'] = { cls: 'mlrs', ...MAZ_543, addOns: [
  ...MAZ_543.addOns!, bx(-6.0, 2.8, 0, 1.5, 1.95, 1.2, DARK), ...[-4.5, 0.5].map((x) => sl([x, 0, 0], [[-0.2, 1.9], [0.2, 1.9], [0.2, 2.4], [-0.2, 2.4]], 1.4, 'side', DARK)),
  ...missile([-7.95, 0, 2.75], 0, R17), hb(-6.4, 0, 1.6, 0.35, 1.8, 1.4, DARK), ...[-1, 1].map((s) => hb(-5.0, s * 1.25, 1.75, 1.6, 0.4, 0.5)),
] };
// 9P78-1 Iskander-M TEL on the MZKT-7930 (13.07 x 3.07 m, 3.3 m): the four-door cab and the long launch compartment with its
// rounded two-piece cover over the two missiles.
G['iskander-tel'] = { cls: 'mlrs', ...MZKT_7930, bed: 'none', addOns: [
  ob({ top: [[-6.35, 2.95], [-6.15, 3.3], [3.1, 3.3], [3.7, 2.95]], bottom: [[-6.35, 1.35], [3.7, 1.35]], plan: [[-6.35, 1.48], [3.7, 1.48]], round: 4, stations: 8 }),
  bx(-6.35, 3.7, 0, 1.15, 1.35, 2.9, DARK), ...[-1, 1].map((s) => rod([-5.6, s * 1.3, 1.3], [-5.9, s * 1.55, 0.1], 0.18, MT)), hb(-1.4, 0, 3.32, 9.4, 0.08, 0.05, DARK),
] };
// HY-2 Silkworm (missile 7.48 m with its booster, 0.76 m, 2.4 m span): the missile on its rail on the launcher trailer, the
// booster slung under its tail, the cropped delta wings and the cruciform tail.
const HY2: Msl = { len: 6.8, d: 0.76, nose: 1.2, fins: [[2.6, 4.7, 2.85, 3.5, 0.82, '-'], [0.0, 1.1, 0.1, 0.6, 0.55]] };
G['silkworm-launcher'] = { cls: 'sam', chassis: 'trailer', length: 9.0, width: 2.8, hullHeight: 1.2, axles: 2, axleAt: [0.25, -0.35], wheelRadius: 0.5, outriggers: true, addOns: [
  hd(-0.4, 0, 1.4, 1.6, 0.4, DARK), sl([-0.4, 0.5, 0], [[-1.4, 1.5], [1.0, 1.5], [0.2, 2.3], [-1.0, 2.3]], 0.15, 'side', M), beam([-3.6, 0, 2.2], 0.2, 7.0, 0.4, 0.35, DARK),
  ...missile(along([-3.6, 0, 2.2], 0.2, -0.2, 0.95), 0.2, HY2), rod(along([-3.6, 0, 2.2], 0.2, -0.6, 0.32), along([-3.6, 0, 2.2], 0.2, 2.0, 0.32), 0.55, LT),
] };
// Silkworm's acquisition radar (est): the ZiL-131 with its van, the trough antenna turning over the roof.
G['silkworm-radar'] = { cls: 'radar', ...ZIL_131, bed: 'none', addOns: [
  ZIL_KUNG, rod([-1.8, 0, 2.95], [-1.8, 0, 3.7], 0.26, MT), hd(-1.8, 0, 3.75, 0.7, 0.2, DARK),
  sl([-1.6, 0, 4.3], rect(0.4, 1.7), 0.08, 'front', { ...LT, roll: Math.PI / 2, pitch: 0.2, curve: 0.25 }), rod([-1.0, -1.6, 4.25], [-1.0, 1.6, 4.25], 0.1, DK),
] };


// ---------------------------------------------------------------- rocket launchers

/** A launcher's tubes, `rows` of counts bottom to top, `d` across at `pitch` spacing, `len` long, from the pack's back `p` raised `e`. */
function tubes(p: V3, e: number, rows: number[], d: number, pitch: number, len: number): AddOn[] {
  const out: AddOn[] = [];
  rows.forEach((n, r) => {
    for (let c = 0; c < n; c++) {
      const s = (c - (n - 1) / 2) * pitch;
      const a = along([p[0], p[1] + s, p[2]], e, 0, r * pitch);
      out.push(rod(a, along([p[0], p[1] + s, p[2]], e, len, r * pitch), d, MT));
    }
  });
  return out;
}
// BM-21 Grad on the Ural-375D (7.35 x 2.4 m, 3.09 m): the forty 122 mm tubes, four rows of ten, on the turntable over the
// rear axles pointing forward over the cab, the lockers behind the cab, the cradle's side plates and the pack's bands.
const GRAD_P: V3 = [-3.55, 0, 1.75];
G['bm-21-grad'] = { cls: 'mlrs', ...URAL_4320, bed: 'none', addOns: [
  bx(-3.685, 0.25, 0, 0.86, 1.05, 2.3), ...[-1, 1].map((s) => bx(-1.1, 0.2, s * 0.95, 1.05, 1.75, 0.55)), hd(-2.4, 0, 1.2, 1.5, 0.3, DARK),
  sl([0, 0.85, 0], [[-3.3, 1.2], [-1.5, 1.2], [-2.6, 1.95], [-3.4, 1.95]], 0.1, 'side', { ...M, ...DARK }),
  ...tubes(GRAD_P, 0.28, [10, 10, 10, 10], 0.13, 0.155, 3.0), ...[0.3, 2.6].map((d) => beam(along(GRAD_P, 0.28, d, 0.23), 0.28, 0.15, 1.7, 0.75, DARK)),
] };
// BM-27 Uragan on the ZiL-135LM 8x8 (9.63 x 2.8 m, 3.23 m): the forward cab ahead of the twin engines' compartment, the
// sixteen 220 mm tubes (rows of six, six and four) over the back pointing forward, the axles spread evenly in pairs.
const URAGAN_P: V3 = [-4.4, 0, 1.75];
G['bm-27-uragan'] = { cls: 'mlrs', chassis: 'wheeled', length: 9.63, width: 2.8, hullHeight: 1.45, axles: 4, axleAt: [0.685, 0.184, -0.128, -0.629], wheelRadius: 0.62, hull: 'truck', bed: 'none', cab: { length: 1.9, height: 2.6, outline: forwardCab(9.63, 2.8, 0.62, 1.9, 2.6, 0.55, 0.5, 8) }, addOns: [
  bx(1.2, 2.85, 0, 0.99, 2.3, 2.6), bx(-4.8, 1.2, 0, 0.95, 1.2, 2.6), hd(-2.9, 0, 1.35, 1.6, 0.3, DARK),
  ...tubes(URAGAN_P, 0.12, [6, 6, 4], 0.24, 0.27, 5.2), ...[0.4, 4.6].map((d) => beam(along(URAGAN_P, 0.12, d, 0.27), 0.12, 0.15, 1.75, 0.95, DARK)),
] };
// BM-30 Smerch on the MAZ-543M (12.1 x 3.05 m, 3.05 m): the twelve 300 mm tubes, three rows of four, laid forward over the
// whole deck to just behind the cabs.
const SMERCH_P: V3 = [-5.6, 0, 2.05];
G['bm-30-smerch'] = { cls: 'mlrs', ...MAZ_543, addOns: [
  ...MAZ_543.addOns!, hd(-3.6, 0, 1.75, 1.8, 0.3, DARK), ...tubes(SMERCH_P, 0.1, [4, 4, 4], 0.33, 0.36, 7.6),
  ...[0.4, 3.6, 7.0].map((d) => beam(along(SMERCH_P, 0.1, d, 0.36), 0.1, 0.15, 1.55, 1.2, DARK)), ...[-1, 1].map((s) => rod([-5.6, s * 1.3, 1.5], [-5.95, s * 1.55, 0.1], 0.2, MT)),
] };
// M142 HIMARS on the FMTV 6x6 (7.0 x 2.4 m, 3.2 m): the armoured cab, the launcher-loader module over the back with its
// boom's side frames and the one six-rocket pod in it, laid forward.
G['m142-himars'] = { cls: 'mlrs', ...FMTV, bed: 'none', cab: { length: 2.3, height: 2.95, outline: forwardCab(7.0, 2.44, 0.6, 2.3, 2.95, 0.15, 0.68, 16) }, addOns: [
  bx(-3.5, 1.05, 0, 0.96, 1.4, 2.3), hd(-1.4, 0, 1.5, 1.5, 0.2, DARK), sl([0, 0.62, 0], [[-3.45, 1.55], [0.95, 1.55], [0.95, 2.95], [-3.45, 3.12]], 0.1, 'side', M),
  bx(-3.4, 0.85, 0, 1.75, 2.75, 1.12), sl([0.86, 0, 2.25], rect(0.5, 0.42), 0.04, 'front', DK), hb(-1.3, 0, 3.12, 4.2, 1.3, 0.08, DARK),
] };
// TOS-1A (2001) on the T-72 hull (6.86 x 3.59 m hull, 2.8 m): the armoured launch box of 24 tubes, four rows of six, on its
// turntable over the engine deck, raised on its rams, the tube mouths in its front face.
const TOS_P: V3 = [-3.0, 0, 2.05];
G['tos-1a'] = { ...T72, cls: 'mlrs', turret: undefined, guns: undefined, cupola: false, addOns: [
  hd(-1.3, 0, 1.55, 2.5, 0.3, DARK), beam(TOS_P, 0.3, 4.3, 2.2, 1.25), ...[-1, 1].map((s) => rod([-0.6, s * 0.8, 1.6], along([TOS_P[0], s * 0.8, TOS_P[2]], 0.3, 2.4, -0.55), 0.2, MT)),
  ...Array.from({ length: 24 }, (_, i) => {
    const a = along([TOS_P[0], -0.75 + (i % 6) * 0.3, TOS_P[2]], 0.3, 4.3, -0.42 + Math.floor(i / 6) * 0.28);
    return rod(a, along(a, 0.3, 0.04), 0.22, DK);
  }),
] };

// ---------------------------------------------------------------- odd vehicles: C-RAM, AA guns, technicals

// LPWS C-RAM (est 14.5 m overall): the Phalanx Block 1B mount on a flatbed semitrailer behind an M983 HEMTT tractor - the
// white radome drum over the six-barrel 20 mm and its ammunition drum, the mount's base and its generator.
const PHALANX = (x: number, u: number): AddOn[] => [
  bx(x - 0.9, x + 0.9, 0, u, u + 0.9, 1.9), hd(x, 0, u + 1.15, 1.4, 0.5, DARK), bx(x - 0.55, x + 0.55, 0, u + 1.4, u + 2.2, 1.0),
  hd(x - 0.15, 0, u + 2.95, 1.0, 1.5, { shade: 0.97 }), { on: 'hull', kind: 'blob', at: [x - 0.15, 0, u + 3.7], size: [1.0, 1.0, 0.7], shade: 0.97 },
  rod(along([x + 0.3, 0, u + 1.85], 0.2, 0), along([x + 0.3, 0, u + 1.85], 0.2, 1.7), 0.26, MT), rod(along([x - 0.7, 0, u + 1.7], 0.2, 0), along([x - 0.7, 0, u + 1.7], 0.2, 1.2), 0.7, MT),
];
G['c-ram-phalanx'] = { cls: 'spaa', chassis: 'wheeled', length: 14.5, width: 2.6, hullHeight: 1.4, axles: 6, axleAt: [0.86, 0.68, 0.33, 0.18, -0.64, -0.8], wheelRadius: 0.62, hull: 'truck', bed: 'none', cab: { length: 2.4, height: 2.84, outline: forwardCab(14.5, 2.44, 0.62, 2.4, 2.84, 0.2, 0.62, 14) }, turret: undefined, guns: undefined, radars: undefined, addOns: [
  bx(3.15, 4.75, 0, 1.0, 2.4, 2.3), hb(2.2, 0, 1.75, 1.0, 1.6, 0.25, DARK), ...semiFrame(-7.25, 3.0, 2.5, 1.4, 1.55, 2.0, false), bx(1.2, 2.8, 0, 1.55, 2.6, 2.3),
  ...PHALANX(-3.2, 1.4),
] };
// ZSU-57-2 (1957): the T-54's hull thinned and shortened onto four big road wheels (6.22 x 3.27 m hull, 2.75 m), the big
// open-topped turret with its sloped walls and the twin 57 mm S-68 with their pepperpot brakes.
G['zsu-57-2'] = { cls: 'spaa', chassis: 'tracked', length: 6.22, width: 3.27, hullHeight: 1.4, roadWheels: 4, roadWheelRadius: 0.4, trackProfile: run(6.0, 0.85, [3.05, 0.6], [-3.05, 0.65], -2.45, 2.4), running: { wheels: [-2.05, -0.7, 0.65, 2.0] }, hullOutline: hull(6.22, 3.27, 1.4, 0.85, 1.6, 0.95, 0.15),
  turret: { x: 0.55, length: 1.0, width: 1.0, height: 0.75, shape: 'box' }, guns: [{ mount: 'turret', count: 2, length: 4.4, calibre: 0.057, spread: 0.42, elevation: 0.2, at: 0.75, muzzle: true }], addOns: [
    sl([0, 1.4, 1.4], [[-2.3, 0], [1.4, 0], [1.15, 1.15], [-2.3, 1.15]], 0.06, 'side', M), sl([1.35, 0, 1.95], rect(1.4, 0.55), 0.06, 'front', { pitch: 0.25 }),
    sl([-2.3, 0, 1.95], rect(1.4, 0.55), 0.06, 'front'), sl([-0.45, 0, 1.45], rect(1.8, 1.35), 0.04, 'plan', DARK),
  ] };
// S-60 57 mm (8.5 x 2.05 m travelling, 2.37 m): the four-wheeled carriage on its jacks with the side arms swung out, the
// upper mount with its shield, the layers' seats, the long L/77 barrel and its pepperpot brake.
const S60_E = 0.35;
const S60_B: V3 = [-0.4, 0, 1.6];
const S60_MOUNT: AddOnMount = { at: [0.3, 0, 1.15], trunnion: S60_B, pitch: S60_E };
G['s-60-57mm'] = { cls: 'towed-aa', chassis: 'towed', bare: true, length: 8.5, width: 2.05, hullHeight: 1.3, axles: 2, axleAt: [0.5, -0.25], wheelRadius: 0.45, addOns: [
  bx(-2.4, 2.9, 0, 0.55, 0.85, 1.3), rod([2.9, 0, 0.7], [4.25, 0, 0.5], 0.12, MT), ...[-1, 1].flatMap((s) => [rod([0.4, s * 0.6, 0.7], [0.4, s * 2.3, 0.15], 0.14, MT), hd(0.4, s * 2.3, 0.06, 0.45, 0.12, DARK)]),
  // The upper carriage with its shields turns on the turntable; the cradle and barrel elevate about the trunnion.
  ...onMount(S60_MOUNT, [hd(0.3, 0, 1.0, 1.3, 0.3, DARK), bx(-0.6, 0.9, 0, 1.15, 1.75, 0.95), sl([1.05, 0, 1.75], rect(0.85, 0.45), 0.05, 'front'), sl([0.65, 0.85, 1.75], rect(0.4, 0.42), 0.05, 'side', M), ...[-1, 1].map((s) => hb(-0.4, s * 0.75, 1.4, 0.4, 0.35, 0.45, DARK))]),
  ...onMount(S60_MOUNT, [rod(S60_B, along(S60_B, S60_E, 4.4), 0.12, MT), rod(S60_B, along(S60_B, S60_E, 1.4), 0.28, MT), rod(along(S60_B, S60_E, 4.2), along(S60_B, S60_E, 4.55), 0.19, MT), beam(along(S60_B, S60_E, -0.6, 0.15), S60_E, 0.8, 0.3, 0.35, DARK)], true),
] };
// KS-19 100 mm (9.45 x 2.35 m travelling, 2.2 m): the heavier four-wheeled carriage on its cross of outriggers, the big
// shield, the equilibrator cylinders over the cradle, the fuze setter and the L/57 barrel with its brake.
const KS19_E = 0.3;
const KS19_B: V3 = [-0.9, 0, 1.75];
G['ks-19-100mm'] = { cls: 'towed-aa', chassis: 'towed', bare: true, length: 9.45, width: 2.35, hullHeight: 1.5, axles: 2, axleAt: [0.42, -0.42], wheelRadius: 0.5, addOns: [
  bx(-3.0, 3.0, 0, 0.6, 1.0, 1.5), rod([3.0, 0, 0.8], [4.7, 0, 0.55], 0.14, MT), ...[-1, 1].flatMap((s) => [rod([0, s * 0.7, 0.8], [0, s * 2.6, 0.15], 0.18, MT), hd(0, s * 2.6, 0.06, 0.55, 0.12, DARK)]),
  hd(0, 0, 1.15, 1.8, 0.3, DARK), bx(-1.3, 0.7, 0, 1.3, 2.0, 1.4), sl([0.95, 0, 1.95], [[-1.1, -0.65], [1.1, -0.65], [1.1, 0.45], [0.6, 0.7], [-0.6, 0.7], [-1.1, 0.45]], 0.06, 'front'),
  sl([0.45, 1.1, 1.9], rect(0.5, 0.55), 0.05, 'side', M), hb(-0.9, 0.95, 1.6, 0.8, 0.4, 0.6, DARK),
  rod(KS19_B, along(KS19_B, KS19_E, 5.8), 0.16, MT), rod(KS19_B, along(KS19_B, KS19_E, 1.8), 0.34, MT), rod(along(KS19_B, KS19_E, 5.55), along(KS19_B, KS19_E, 5.95), 0.24, MT),
  ...[-0.22, 0.22].map((s) => rod(along([KS19_B[0], s, KS19_B[2]], KS19_E, -0.3, 0.35), along([KS19_B[0], s, KS19_B[2]], KS19_E, 1.5, 0.35), 0.16, MT)),
] };
// SON-9 Fire Can (dish est 1.8 m): the gun-laying radar's van on its four-wheeled trailer, the dish on its pedestal on the
// roof, its feed in front.
G['son-9-fire-can'] = { cls: 'radar', chassis: 'trailer', length: 6.5, width: 2.6, hullHeight: 1.2, axles: 2, axleAt: [0.42, -0.5], wheelRadius: 0.5, addOns: [
  kung(-3.1, 2.4, 2.5, 1.2, 3.3), hd(-0.3, 0, 3.5, 0.8, 0.4, DARK), sl([-0.1, 0, 4.4], ellipse(0.9, 0.9, 18), 0.07, 'front', { ...LT, pitch: 0.45, curve: 0.25 }), rod([-0.1, 0, 4.4], [0.65, 0, 4.75], 0.07, DK),
] };

/** The ZU-23-2 mount at (x, s, u): its base, the cradle and the two 23 mm side by side with their flash hiders and the magazines on the receivers, a layer's seat each side. */
function zu23(x: number, s: number, u: number, e = 0.35): AddOn[] {
  const p: V3 = [x - 0.55, s, u + 0.75];
  // The upper carriage turns on the base, the cradle with the guns and magazines elevating about its trunnion.
  const m: AddOnMount = { at: [x, s, u + 0.2], trunnion: p, pitch: e };
  return [
    hd(x, s, u + 0.1, 1.0, 0.2, DARK), ...onMount(m, [bx(x - 0.55, x + 0.35, s, u + 0.2, u + 0.65, 0.6), ...[-1, 1].map((d) => hb(x - 0.35, s + d * 0.6, u + 0.45, 0.45, 0.35, 0.5, DARK))]),
    ...onMount(m, [beam(p, e, 1.0, 0.5, 0.28, DARK), ...[-0.14, 0.14].flatMap((d) => [rod(along([p[0], s + d, p[2]], e, 0.9), along([p[0], s + d, p[2]], e, 2.6), 0.075, MT), rod(along([p[0], s + d, p[2]], e, 2.35), along([p[0], s + d, p[2]], e, 2.6), 0.12, MT), beam(along([p[0], s + d * 1.6, p[2]], e, 0.15, 0.25), e, 0.55, 0.16, 0.22, DARK)])], true),
  ];
}
// ZU-23-2 (4.57 x 1.83 m travelling, 1.87 m): emplaced on its triangular base and three jacks, the wheels at its sides.
G['zu-23-2'] = { cls: 'towed-aa', chassis: 'towed', bare: true, length: 4.57, width: 1.83, hullHeight: 0.9, axles: 1, axleAt: [-0.1], wheelRadius: 0.37, addOns: [
  sl([0, 0, 0.45], [[1.7, -0.12], [1.7, 0.12], [-1.1, 1.05], [-1.3, 0.9], [-1.3, -0.9], [-1.1, -1.05]], 0.14, 'plan', DARK),
  ...[[1.65, 0], [-1.2, 1.0], [-1.2, -1.0]].map(([x, s]) => rod([x, s, 0.45], [x, s, 0.05], 0.12, MT)), rod([1.7, 0, 0.45], [2.28, 0, 0.35], 0.1, MT),
  ...zu23(-0.15, 0, 0.5),
] };
// Ural-375 with a ZU-23-2 on its bed: the low drop sides, the mount standing in the middle of the bed.
G['ural-375-zu-23'] = { cls: 'spaa', ...URAL_4320, bed: 'none', turret: undefined, guns: undefined, addOns: [...cargo(-3.685, 0.25, 2.4, 1.3, 0.5), ...zu23(-1.7, 0, 1.3)] };
/** A pickup's load bed behind its double cab: the floor, the sides, the tailgate. */
const PICKUP_BED = cargo(-2.65, -1.15, 1.8, 0.85, 0.45);
// Technicals on a Land Cruiser / Hilux class pickup (5.3 x 1.85 m): with a ZU-23-2 standing over the bed; with a DShK on a
// tall pintle behind the cab; with a B-8M1 pod of twenty 80 mm rockets (2.71 x 0.52 m) on a frame.
G['technical-zu-23'] = { ...AD('technical-zu-23'), bed: 'none', turret: undefined, guns: undefined, addOns: [...PICKUP_BED, ...zu23(-1.95, 0, 0.85)] };
G['technical-hmg'] = { ...AD('technical-hmg'), bed: 'none', turret: undefined, guns: undefined, addOns: [
  ...PICKUP_BED, rod([-1.55, 0, 0.85], [-1.55, 0, 1.95], 0.08, MT), ...[-0.3, 0.3].map((s) => rod([-1.55, 0, 1.2], [-1.75, s, 0.85], 0.05, MT)),
  bx(-1.85, -1.2, 0, 1.95, 2.15, 0.2, DARK), rod([-1.2, 0, 2.05], [-0.15, 0, 2.2], 0.07, MT), rod([-0.35, 0, 2.17], [-0.1, 0, 2.21], 0.12, MT), hb(-1.6, 0.2, 1.95, 0.3, 0.15, 0.2, DARK),
  rod([-1.2, -0.85, 0.85], [-1.2, -0.85, 1.75], 0.06, MT), rod([-1.2, 0.85, 0.85], [-1.2, 0.85, 1.75], 0.06, MT), rod([-1.2, -0.85, 1.75], [-1.2, 0.85, 1.75], 0.06, MT),
] };
G['technical-rocket'] = { ...AD('technical-rocket'), bed: 'none', missiles: undefined, addOns: [
  ...PICKUP_BED, ...[-0.3, 0.3].map((s) => rod([-1.9, s, 0.85], [-1.9, s * 0.5, 1.35], 0.07, MT)), rod([-1.4, 0, 0.85], [-1.4, 0, 1.45], 0.07, MT),
  rod(along([-3.15, 0, 1.35], 0.2, 0), along([-3.15, 0, 1.35], 0.2, 2.71), 0.52, MT, 0.5), sl(along([-3.15, 0, 1.35], 0.2, 2.72), ellipse(0.24, 0.24, 12), 0.03, 'front', { ...DK, pitch: 0.2 }),
] };

// ---------------------------------------------------------------- odd vehicles: tank destroyers and SPAAG

// ZTD-05 (2006): the ZBD-05's great amphibious hull (9.5 x 3.36 m, 3.1 m), its long sloped bow and trim vane ahead of the
// tracks, six road wheels, the angular turret with the 105 mm, its brake and extractor.
G['ztd-05'] = { cls: 'tank-destroyer', chassis: 'tracked', length: 9.5, width: 3.36, hullHeight: 2.0, roadWheels: 6, roadWheelRadius: 0.34, trackProfile: run(7.6, 0.95, [3.15, 0.65], [-4.45, 0.7], -3.95, 2.75), running: { wheels: [-3.6, -2.35, -1.1, 0.15, 1.4, 2.65], rollers: [-2.9, -0.5, 1.9] },
  hullOutline: { top: [[-4.75, 1.85], [-4.6, 2.0], [1.6, 2.0], [4.75, 0.95]], bottom: [[-4.75, 0.9], [3.3, 0.85], [4.75, 0.95]], plan: [[-4.75, 1.62], [2.6, 1.68], [4.75, 1.35]], round: 8, stations: 14 },
  turret: turret(-0.6, [[-1.7, 1.1], [-1.4, 1.3], [0.9, 1.35], [1.6, 0.95], [1.8, 0.5]], [[-1.7, 0.72], [-1.4, 0.85], [1.0, 0.85], [1.8, 0.5]], 10, 1.75),
  guns: [{ mount: 'turret', length: 5.5, calibre: 0.105, muzzle: true, extractor: 0.55, sleeve: 0.6, at: 0.45 }], addOns: [sl([4.4, 0, 1.25], rect(1.55, 0.25), 0.08, 'front', { pitch: 0.6 }), tb(-0.6, 0.65, 0.95, 0.4, 0.4, 0.25, DARK)] };
// PGZ-95 (2001): a six-wheeled tracked hull (6.71 x 3.24 m), the tall turret with two 25 mm stacked on each side and a
// pair of QW-2 tubes above them, the search radar folded on the turret's back.
G['pgz-95'] = { cls: 'spaa', chassis: 'tracked', length: 6.71, width: 3.24, hullHeight: 1.6, roadWheels: 6, roadWheelRadius: 0.32, trackProfile: run(6.5, 0.9, [3.25, 0.62], [-3.25, 0.65], -2.7, 2.65), running: { wheels: [-2.45, -1.5, -0.55, 0.4, 1.35, 2.3], rollers: [-1.5, 0, 1.5] },
  hullOutline: { top: [[-3.35, 1.5], [-3.2, 1.6], [1.3, 1.6], [3.35, 0.95]], bottom: [[-3.35, 0.9], [3.1, 0.9], [3.35, 0.95]], plan: [[-3.35, 1.55], [3.35, 1.5]], round: 10, stations: 12 },
  turret: turret(-0.4, [[-1.3, 0.95], [-1.1, 1.05], [0.9, 1.05], [1.3, 0.85]], [[-1.3, 1.0], [-1.0, 1.15], [0.8, 1.15], [1.3, 0.7]], 10, 1.2), guns: undefined, radars: undefined, addOns: [
    ...[0.35, 0.65].flatMap((u) => [tb(0.2, 1.22, u, 1.0, 0.22, 0.22, { ...M, ...DARK }), ...[-1, 1].map((s) => ({ on: 'turret', kind: 'tube', at: [0.6, s * 1.22, u], to: [3.0, s * 1.22, u + 0.25], size: [0.08, 0.08, 0], metal: true } as AddOn))]),
    ...[-1, 1].map((s) => ({ on: 'turret', kind: 'tube', at: [-0.4, s * 1.25, 1.05], to: [1.1, s * 1.25, 1.15], size: [0.13, 0.13, 0], paint: 'light' } as AddOn)),
    tb(-1.1, 0, 1.3, 0.4, 0.4, 0.3, DARK), { on: 'turret', kind: 'slab', at: [-1.2, 0, 1.75], size: [0.12, 0, 0], poly: rect(0.85, 0.3), plane: 'front', pitch: -0.4, paint: 'light' },
  ] };
// Kanonenjagdpanzer 4-5 (1966, 6.24 x 2.98 m, 2.09 m): a low hull on five road wheels and three rollers, the casemate with
// its steeply sloped front and inward-leaning sides, the 90 mm just right of the middle with its extractor.
const KANJPZ: GroundSpec = { chassis: 'tracked', length: 6.24, width: 2.98, hullHeight: 1.1, roadWheels: 5, roadWheelRadius: 0.33, trackProfile: run(6.0, 0.85, [3.0, 0.62], [-3.0, 0.62], -2.45, 2.45), running: { wheels: [-2.1, -1.05, 0.0, 1.05, 2.1], rollers: [-1.5, 0, 1.5] },
  hullOutline: { top: [[-3.12, 1.0], [-3.0, 1.1], [2.0, 1.1], [3.12, 0.8]], bottom: [[-3.12, 0.85], [2.9, 0.75], [3.12, 0.8]], plan: [[-3.12, 1.47], [3.12, 1.4]], round: 10, stations: 10 } };
const KANJPZ_CASEMATE = ob({ top: [[-3.0, 1.85], [-2.7, 2.0], [0.2, 2.0], [2.95, 1.1]], bottom: [[-3.0, 1.05], [2.95, 1.05]], plan: [[-3.0, 1.2], [0.0, 1.25], [2.95, 1.2]], round: 3, stations: 12 });
G['kanonenjagdpanzer'] = { cls: 'tank-destroyer', ...KANJPZ, guns: [{ mount: 'hull', length: 3.6, calibre: 0.09, extractor: 0.55, at: 1.3, x: 1.4, side: 0.2 }], addOns: [KANJPZ_CASEMATE, hb(-1.4, 0.55, 2.08, 0.6, 0.6, 0.16, DARK)] };
// Raketenjagdpanzer (Jaguar 1 class): the same casemate without the gun, spaced armour on its front, the HOT launcher on
// its arm on the roof's front.
G['raketenjagdpanzer'] = { cls: 'tank-destroyer', ...KANJPZ, addOns: [KANJPZ_CASEMATE, hb(1.75, 0, 1.45, 0.18, 2.3, 0.8, { pitch: -0.95 }), hb(0.6, 0.45, 2.15, 0.4, 0.4, 0.3, DARK), rod([0.3, 0.45, 2.45], [1.65, 0.45, 2.55], 0.24, MT), hb(-1.4, -0.55, 2.08, 0.6, 0.6, 0.16, DARK)] };
// T95 / T28 super-heavy GMC (1945; 11.1 m with the gun, hull about 7.6 x 4.39 m with the outer tracks, 2.84 m): the low cast
// casemate between double tracks on eight small road wheels each, the 105 mm T5E1 low in its nose, the cupola with its .50.
G['t95-super-heavy'] = { cls: 'tank-destroyer', chassis: 'tracked', length: 7.6, width: 4.39, hullHeight: 1.1, roadWheels: 8, roadWheelRadius: 0.3, trackProfile: run(7.3, 1.05, [3.65, 0.75], [-3.65, 0.72], -3.05, 3.0), running: { wheels: [-2.9, -2.08, -1.25, -0.42, 0.42, 1.25, 2.08, 2.9], rollers: [-2.0, 0, 2.0], band: 0.12 },
  hullOutline: { top: [[-3.8, 1.6], [-3.55, 2.3], [0.6, 2.4], [2.6, 2.0], [3.8, 1.05]], bottom: [[-3.8, 0.95], [3.4, 0.9], [3.8, 1.05]], plan: [[-3.8, 1.35], [-2.0, 1.45], [2.4, 1.45], [3.8, 1.15]], round: 4, stations: 14 },
  guns: [{ mount: 'hull', length: 6.6, calibre: 0.105, at: 1.35, x: 3.3 }], addOns: [
    hb(3.65, 0, 1.45, 0.5, 0.75, 0.75), hd(-1.6, 0.8, 2.55, 0.8, 0.35), hb(-1.4, 0.8, 2.85, 1.0, 0.06, 0.06, DARK),
    ...[-1, 1].map((s) => bx(-3.6, 3.6, s * 1.62, 0.95, 1.12, 0.08, DARK)),
  ] };

// ---------------------------------------------------------------- towed field guns

// L118 light gun (6.1 x 1.78 m, 2.13 m travelling): in action on its firing platform, the arched single box trail, the
// saddle with its recoil system and the L/30 105 mm with its double-baffle brake.
const L118_B: V3 = [-0.55, 0, 1.25];
G['l118-light-gun'] = { cls: 'towed-gun', chassis: 'towed', bare: true, length: 6.1, width: 1.78, hullHeight: 1.0, axles: 1, axleAt: [0.1], wheelRadius: 0.42, addOns: [
  sl([0, 0, 0], [[0.45, 0.72], [-1.2, 0.98], [-2.6, 0.72], [-3.35, 0.14], [-3.6, 0.14], [-3.45, 0.38], [-2.6, 0.95], [-1.2, 1.2], [0.45, 0.98]], 0.32, 'side'), sl([-3.55, 0, 0.25], rect(0.45, 0.22), 0.06, 'front', DARK),
  sl([0.3, 0, 0.03], ellipse(0.85, 0.85, 14), 0.06, 'plan', DARK), rod([0.3, -0.85, 0.42], [0.3, 0.85, 0.42], 0.1, MT),
  hb(0.1, 0, 1.08, 1.0, 0.45, 0.3), rod(L118_B, along(L118_B, 0.2, 3.2), 0.12, MT), rod(along(L118_B, 0.2, 0, -0.18), along(L118_B, 0.2, 1.45, -0.18), 0.2, MT), beam(along(L118_B, 0.2, 3.1), 0.2, 0.25, 0.3, 0.22, DARK),
] };
// M101 / M2A1 105 mm (5.94 x 2.19 m, 1.57 m): the split trail spread with its spades, the flat two-piece shield, the long
// cradle under the short L/22 barrel.
const M101_B: V3 = [-0.45, 0, 1.0];
G['m101-105mm'] = { cls: 'towed-gun', chassis: 'towed', bare: true, length: 5.94, width: 2.19, hullHeight: 1.0, axles: 1, axleAt: [0.2], wheelRadius: 0.5, addOns: [
  rod([0.6, -0.95, 0.5], [0.6, 0.95, 0.5], 0.14, MT), ...[-1, 1].flatMap((s) => [rod([0.4, s * 0.25, 0.65], [-3.3, s * 1.1, 0.14], 0.17, { metal: true }), sl([-3.35, s * 1.12, 0.2], rect(0.3, 0.2), 0.05, 'front', { ...DARK, yaw: s * 0.3 })]),
  sl([0.95, 0, 1.0], [[-0.95, -0.42], [-0.12, -0.42], [-0.12, 0.05], [0.12, 0.05], [0.12, -0.42], [0.95, -0.42], [0.95, 0.38], [-0.95, 0.38]], 0.05, 'front'),
  beam(along(M101_B, 0.15, 0, -0.15), 0.15, 2.0, 0.32, 0.22), rod(M101_B, along(M101_B, 0.15, 2.5), 0.13, MT), hb(-0.55, 0, 0.98, 0.45, 0.35, 0.35, DARK),
] };


// ---------------------------------------------------------------- trucks by body (their cabs are in base.ts)

/** A spare wheel standing upright across the frame behind a cab, at `x`, its middle `u` high. */
const spare = (x: number, u: number, r: number): AddOn => rod([x + 0.15, 0, u], [x - 0.15, 0, u], 2 * r, TY);
// Ural-4320 (7.37 x 2.5 m): the -31 with the armoured cab and the armoured troop body with its firing ports; the ATZ-5
// tanker with its oval tank and the pump cabinet at the back; the flatbed with low drop sides.
G['ural-4320-armoured'] = { cls: 'truck', ...URAL_4320, bed: 'none', cab: { length: 1.9, height: 2.75, bonnet: 1.4, outline: bonnetCab(7.37, 2.5, 0.54, 1.9, 2.75, 1.4, 2.05, 0.04, 0.96, 0.06) }, addOns: [
  ob({ top: [[-3.685, 2.75], [-3.55, 2.95], [0.1, 2.95], [0.25, 2.8]], bottom: [[-3.685, 0.95], [0.25, 0.95]], plan: [[-3.685, 1.24], [0.25, 1.24]], round: 5, stations: 6 }),
  ...[-2.8, -1.6, -0.4].map((x) => sl([x, 1.27, 2.15], rect(0.18, 0.12), 0.03, 'side', { ...DK, ...M })), sl([-3.7, 0, 1.8], rect(0.45, 0.65), 0.03, 'front', DK),
] };
G['ural-4320-tanker'] = { cls: 'truck', ...URAL_4320, bed: 'none', addOns: [bx(-3.685, 0.25, 0, 0.86, 1.1, 2.3, DARK), ...tankBody(-3.0, 0.15, 2.3, 1.15, 2.55, 2), bx(-3.685, -3.05, 0, 1.0, 2.3, 2.4), spare(0.15, 1.65, 0.54)] };
G['ural-4320-flatbed'] = { cls: 'truck', ...URAL_4320, bed: 'none', addOns: cargo(-3.685, 0.25, 2.45, 1.4, 0.55) };
// ZiL-131 (7.04 x 2.5 m): the van body (KUNG) with its rear door; the cargo bed under a canvas tilt (2.98 m).
G['zil-131-kung'] = { cls: 'truck', ...ZIL_131, bed: 'none', addOns: [ZIL_KUNG, sl([-3.54, -0.5, 1.95], rect(0.4, 0.85), 0.03, 'front', DK), bx(-3.75, -3.52, -0.5, 0.6, 0.95, 0.8, DARK)] };
G['zil-131-covered'] = { cls: 'truck', ...ZIL_131, bed: 'none', addOns: cargo(-3.52, 0.22, 2.45, 1.4, 0.5, 2.98) };
// ZiL-4331 (1986; 7.0 x 2.5 m, 2.65 m cab est): a 4x2 with a square cab behind a flat-fronted bonnet, the dual rear wheels,
// the cargo bed under its tilt.
G['zil-4331'] = { cls: 'truck', chassis: 'wheeled', length: 7.0, width: 2.5, hullHeight: 2.9, axles: 2, axleAt: [0.66, -0.44], wheelRadius: 0.5, hull: 'truck', bed: 'none', cab: { length: 1.8, height: 2.65, bonnet: 1.5, outline: bonnetCab(7.0, 2.5, 0.5, 1.8, 2.65, 1.5, 1.65, 0.08, 0.95, 0.15) }, addOns: cargo(-3.5, 0.0, 2.45, 1.35, 0.5, 2.95) };
// ZiL-135 8x8 cargo (9.3 x 2.8 m, 2.6 m): the wide forward cab ahead of the first axle, the twin engines' compartment
// behind it, the axles evenly spread, the long bed under its tilt.
G['zil-135'] = { cls: 'truck', chassis: 'wheeled', length: 9.3, width: 2.8, hullHeight: 2.95, axles: 4, axleAt: [0.677, 0.158, -0.165, -0.684], wheelRadius: 0.62, hull: 'truck', bed: 'none', cab: { length: 1.9, height: 2.6, outline: forwardCab(9.3, 2.8, 0.62, 1.9, 2.6, 0.55, 0.5, 8) }, addOns: [bx(1.05, 2.7, 0, 0.99, 2.3, 2.6), ...cargo(-4.65, 0.9, 2.75, 1.5, 0.55, 2.95)] };
// GAZ-66 (5.66 x 2.34 m, 2.44 m): the cab-over with the bed under a tilt reaching just over the cab's roof.
G['gaz-66'] = { cls: 'truck', ...GAZ_66, bed: 'none', addOns: cargo(-2.83, 0.98, 2.3, 1.3, 0.45, 2.52) };
// GAZ-3307 (6.55 x 2.38 m, 2.35 m): the long sloping bonnet before the small cab, the open bed with board sides.
G['gaz-3307'] = { cls: 'truck', chassis: 'wheeled', length: 6.55, width: 2.38, hullHeight: 2.35, axles: 2, axleAt: [0.6, -0.45], wheelRadius: 0.48, hull: 'truck', bed: 'none', cab: { length: 1.6, height: 2.35, bonnet: 1.6, outline: bonnetCab(6.55, 2.38, 0.48, 1.6, 2.35, 1.6, 1.5, 0.2, 0.8, 0.35) }, addOns: cargo(-3.275, -0.2, 2.35, 1.25, 0.6) };
// KamAZ-43101 (7.9 x 2.5 m, 3.2 m with tilt): the cab-over, the spare wheel behind it, the bed under its tilt.
G['kamaz-43101'] = { cls: 'truck', ...KAMAZ_43101, bed: 'none', addOns: [spare(1.55, 1.55, 0.55), ...cargo(-3.95, 1.35, 2.45, 1.5, 0.5, 3.2)] };
// KrAZ-6322 (9.0 x 2.5 m): the long bonnet, the spare wheel behind the cab, the bed under its tilt.
G['kraz-6322'] = { cls: 'truck', ...KRAZ_6322, bed: 'none', addOns: [spare(0.6, 1.65, 0.6), ...cargo(-4.5, 0.4, 2.45, 1.6, 0.55, 3.05)] };
// KrAZ-255V tractor with a TZ-22 fuel semitrailer (est 16.0 m): the bonneted tractor and the big oval tank on its
// two-axle trailer.
G['kraz-tractor-trailer'] = { cls: 'truck', ...KRAZ_255, length: 16.0, axles: 5, axleAt: [0.82, 0.55, 0.4, -0.65, -0.82], bed: 'none', hullHeight: 2.9, cab: { length: 1.9, height: 2.94, bonnet: 1.8, outline: bonnetCab(16.0, 2.75, 0.67, 1.9, 2.94, 1.8, 2.25, 0.1, 0.8, 0.15) }, addOns: [
  spare(4.1, 1.75, 0.67), hb(3.8, 0, 1.45, 1.2, 1.4, 0.15, DARK), ...semiFrame(-8.0, 3.2, 2.4, 1.3, 1.6, 2.6, false), ...tankBody(-7.9, 2.5, 2.5, 1.45, 3.05, 3),
] };
// MAZ-6303 (9.1 x 2.5 m, 3.2 m): the tall cab-over and the long bed under its tilt.
G['maz-6303'] = { cls: 'truck', chassis: 'wheeled', length: 9.1, width: 2.5, hullHeight: 3.2, axles: 3, axleAt: [0.72, -0.4, -0.72], wheelRadius: 0.55, hull: 'truck', bed: 'none', cab: { length: 2.2, height: 3.0, outline: forwardCab(9.1, 2.5, 0.55, 2.2, 3.0, 0.25, 0.6, 12) }, addOns: cargo(-4.55, 2.2, 2.45, 1.5, 0.55, 3.2) };
// MAZ-7410 class heavy tractor with a fuel semitrailer (est 18.0 m): the wide cab-over and the long oval tank.
G['maz-7410-tractor-trailer'] = { cls: 'truck', chassis: 'wheeled', length: 18.0, width: 2.8, hullHeight: 2.9, axles: 6, axleAt: [0.85, 0.65, 0.53, -0.6, -0.72, -0.84], wheelRadius: 0.6, hull: 'truck', bed: 'none', cab: { length: 2.4, height: 3.1, outline: forwardCab(18.0, 2.8, 0.6, 2.4, 3.1, 0.3, 0.55, 10) }, addOns: [
  hb(5.5, 0, 1.5, 1.2, 1.4, 0.15, DARK), bx(6.0, 6.55, 0, 1.0, 2.6, 2.4), ...semiFrame(-9.0, 5.6, 2.6, 1.3, 1.6, 2.6, false), ...tankBody(-8.9, 4.8, 2.6, 1.45, 3.1, 4),
] };
// M923 / M939 5-ton cargo (7.9 x 2.5 m): the bonnet, the bed with its troop seats under the tilt (3.05 m).
G['m939'] = { cls: 'truck', ...M939, bed: 'none', addOns: cargo(-3.95, 0.4, 2.45, 1.45, 0.55, 3.05) };
// M977 HEMTT cargo (10.2 x 2.44 m, 2.84 m): the cab and the engine box behind it, the drop-side bed and the loading crane at
// its back with the boom laid forward; M978 the tanker with its 2,500-gallon tank and pump cabinet.
G['hemtt'] = { cls: 'truck', ...HEMTT, bed: 'none', addOns: [
  bx(1.2, 2.65, 0, 0.99, 2.25, 2.3), ...cargo(-4.3, 1.1, 2.44, 1.45, 0.6), hd(-4.75, 0.6, 1.9, 0.5, 1.6, DARK), beam([-4.75, 0.6, 2.6], -0.03, 4.2, 0.3, 0.35, DARK),
] };
G['hemtt-tanker'] = { cls: 'truck', ...HEMTT, bed: 'none', addOns: [bx(1.2, 2.65, 0, 0.99, 2.25, 2.3), bx(-5.1, 1.1, 0, 1.1, 1.3, 2.3, DARK), ...tankBody(-4.4, 1.0, 2.35, 1.3, 2.75, 2), bx(-5.1, -4.45, 0, 1.2, 2.5, 2.4)] };
// M1083 MTV (7.0 x 2.44 m): the cab-over and the drop-side bed under its tilt.
G['m1083-fmtv'] = { cls: 'truck', ...FMTV, bed: 'none', addOns: cargo(-3.5, 1.05, 2.44, 1.45, 0.5, 3.0) };
// MAN HX58 6x6 (8.4 x 2.55 m): the cab-over and the bed under its tilt.
G['man-hx'] = { cls: 'truck', ...MAN_HX, bed: 'none', addOns: cargo(-4.2, 1.75, 2.5, 1.55, 0.55, 3.25) };
// HX81 8x8 heavy tractor with a low-loader semitrailer (est 18.5 m): the cab-over, the ballast box and winch behind it, the
// gooseneck over the tractor's rear axles and the low deck behind on three axles.
G['hx81-tractor-trailer'] = { cls: 'truck', ...MAN_HX, length: 18.5, axles: 7, axleAt: [0.86, 0.72, 0.45, 0.33, -0.65, -0.77, -0.89], bed: 'none', hullHeight: 1.0, cab: { length: 2.3, height: 3.1, outline: forwardCab(18.5, 2.55, 0.6, 2.3, 3.1, 0.35, 0.5, 14) }, addOns: [
  bx(5.4, 6.85, 0, 1.0, 2.5, 2.4), hb(3.6, 0, 1.45, 1.2, 1.4, 0.15, DARK), ...semiFrame(-9.25, 4.4, 2.55, 1.0, 1.75, 2.8, false), ...[-1, 1].map((s) => bx(-9.25, 1.6, s * 1.24, 1.0, 1.15, 0.08, DARK)),
] };
// A fire engine (est 8.0 x 2.5 m, 3.2 m): the crew cab-over, the body of lockers, the ladder and hose reel on its roof, the
// light bar.
G['firetruck'] = { cls: 'truck', chassis: 'wheeled', length: 8.0, width: 2.5, hullHeight: 3.0, axles: 2, axleAt: [0.6, -0.5], wheelRadius: 0.55, hull: 'truck', bed: 'none', cab: { length: 2.8, height: 3.0, outline: forwardCab(8.0, 2.5, 0.55, 2.8, 3.0, 0.2, 0.6, 14) }, addOns: [
  kung(-4.0, 1.1, 2.5, 0.75, 2.85), ...[-0.45, 0.45].map((s) => rod([-3.9, s, 3.0], [1.9, s, 3.0], 0.08, MT)), ...[-3.0, -1.5, 0.0, 1.5].map((x) => hb(x, 0, 3.0, 0.06, 0.9, 0.06, DARK)), hd(-1.5, 0, 3.05, 0.9, 0.35, DARK), hb(3.05, 0, 3.1, 0.3, 1.8, 0.15, LT),
] };
// An aircraft tow tractor (est 4.2 x 2.0 m, 2.0 m): the low heavy wedge of a body and the small cab over its back.
G['airport-tug'] = { cls: 'truck', chassis: 'wheeled', length: 4.2, width: 2.0, hullHeight: 1.15, axles: 2, axleAt: [0.6, -0.55], wheelRadius: 0.4, hullOutline: { top: [[-2.1, 1.0], [-1.95, 1.15], [1.4, 1.15], [2.1, 0.75]], bottom: [[-2.1, 0.35], [2.1, 0.35]], plan: [[-2.1, 0.98], [2.1, 0.92]], round: 10, stations: 10 }, addOns: [
  bx(-1.85, -0.6, -0.35, 1.15, 2.05, 1.1), sl([-0.6, -0.35, 1.7], rect(0.45, 0.28), 0.03, 'front', GL), hb(2.15, 0, 0.55, 0.15, 0.4, 0.2, DARK), hb(-2.15, 0, 0.55, 0.15, 0.4, 0.2, DARK),
] };
// LARC-V amphibious cargo carrier (10.67 x 3.05 m, 3.1 m): the aluminium boat hull on four big tyres, the operator's cab at
// the bow, the open cargo well amidships, the engine housing at the stern.
G['larc-v'] = { cls: 'truck', chassis: 'wheeled', length: 10.6, width: 3.05, hullHeight: 2.0, axles: 2, axleAt: [0.42, -0.47], wheelRadius: 0.78, hullOutline: { top: [[-5.3, 1.85], [-5.0, 2.0], [4.6, 2.0], [5.3, 1.9]], bottom: [[-5.3, 1.25], [-4.6, 0.8], [3.4, 0.8], [5.3, 1.6]], plan: [[-5.3, 1.3], [-4.6, 1.52], [3.6, 1.52], [5.3, 1.2]], round: 10, stations: 14 }, addOns: [
  bx(2.6, 4.0, 0, 1.95, 3.1, 2.2), sl([4.02, 0, 2.75], rect(1.0, 0.25), 0.03, 'front', GL), sl([-0.8, 0, 2.01], rect(2.9, 1.3), 0.03, 'plan', DK), bx(-5.0, -3.6, 0, 1.95, 2.45, 2.6),
] };
// A van shelter on a ZiL-131 with a dish on its roof; a shelter on a two-wheeled trailer standing on its corner jacks.
G['van-shelter'] = { cls: 'truck', ...ZIL_131, bed: 'none', radars: undefined, addOns: [ZIL_KUNG, rod([-2.6, 0, 2.95], [-2.6, 0, 3.6], 0.2, MT), sl([-2.4, 0, 4.1], ellipse(0.8, 0.8, 18), 0.07, 'front', { ...LT, pitch: 0.5, curve: 0.22 })] };
G['trailer-shelter'] = { cls: 'truck', ...TRAILER, outriggers: true, addOns: [kung(-2.2, 1.0, 2.1, 1.2, 3.2), sl([-2.22, 0, 2.1], rect(0.4, 0.8), 0.03, 'front', DK)] };
// A flatbed semitrailer (est 13.0 x 2.5 m): the flat deck on its three rear axles and landing legs.
G['flatbed-semitrailer'] = { cls: 'truck', chassis: 'trailer', bare: true, length: 13.0, width: 2.5, hullHeight: 1.45, axles: 3, axleAt: [-0.62, -0.75, -0.88], wheelRadius: 0.5, addOns: [...semiFrame(-6.5, 6.5, 2.5, 1.45, 1.45, 1.6), ...[-1, 1].map((s) => bx(-6.5, 6.5, s * 1.22, 1.45, 1.55, 0.06, DARK))] };
// A crawler dozer (est 6.0 x 3.0 m, 3.4 m; the D9 class): the high-drive track run round its raised sprocket, the engine
// hood forward, the cab and its rollover frame, the curved blade on its push arms and the ripper at the back.
G['bulldozer'] = { cls: 'truck', chassis: 'tracked', length: 6.0, width: 3.0, hullHeight: 1.3, roadWheels: 7, roadWheelRadius: 0.24, trackProfile: [[-2.2, 0], [2.2, 0], [2.6, 0.45], [2.3, 0.8], [-1.3, 1.75], [-2.6, 0.45]],
  hullOutline: { top: [[-2.2, 1.5], [-1.9, 1.7], [2.2, 1.7], [2.4, 1.5]], bottom: [[-2.2, 0.6], [2.4, 0.6]], plan: [[-2.2, 0.9], [2.4, 0.85]], round: 10, stations: 8 }, addOns: [
    bx(0.0, 2.3, 0, 1.7, 2.6, 1.6), rod([2.0, 0, 2.6], [2.0, 0, 3.0], 0.15, MT), bx(-1.9, -0.1, 0, 1.7, 3.3, 1.7), sl([-1.0, 0.86, 2.75], rect(0.85, 0.45), 0.03, 'side', { ...GL, ...M }), bx(-2.0, 0.0, 0, 3.3, 3.45, 1.9, DARK),
    sl([3.55, 0, 0.85], rect(1.7, 0.78), 0.12, 'front', { pitch: 0.12, curve: -0.25, ...MT }), ...[-1, 1].map((s) => rod([3.4, s * 1.3, 0.55], [-0.6, s * 1.55, 0.6], 0.2, MT)),
    beam([-2.4, 0, 1.0], Math.PI - 0.15, 1.0, 1.4, 0.25, DARK), rod([-3.2, 0, 1.15], [-3.4, 0, 0.1], 0.15, MT),
  ] };
// A civilian double-cab pickup (5.3 x 1.85 m) with its load bed.
G['pickup'] = { cls: 'civilian-car', ...PICKUP, bed: 'none', addOns: PICKUP_BED };
// A saloon car (est 4.6 x 1.8 m, 1.45 m): bonnet, glasshouse and boot.
G['car-sedan'] = { cls: 'civilian-car', ...car(4.6, 1.8, [[-2.3, 0.95], [-2.1, 1.02], [-1.2, 1.05], [-0.7, 1.45], [0.55, 1.45], [1.2, 1.0], [2.1, 0.92], [2.3, 0.7]], [0.6, -0.6], 0.32, 0.32, 6) };
// A trolleybus (11.8 x 2.55 m, 3.4 m): the bus body, the equipment fairing on its roof and the two trolley poles trailing up
// to the wires.
G['trolleybus'] = { cls: 'bus', ...car(11.8, 2.55, [[-5.9, 2.95], [-5.75, 3.1], [5.5, 3.1], [5.9, 2.4]], [0.52, -0.5], 0.5, 0.45, 14), radars: undefined, addOns: [
  bx(-1.0, 2.6, 0, 3.1, 3.45, 2.0), ...[-0.3, 0.3].map((s) => rod([1.6, s, 3.5], [-5.6, s * 1.6, 5.6], 0.06, MT)), ...[-0.3, 0.3].map((s) => hb(1.6, s, 3.5, 0.3, 0.2, 0.15, DARK)),
] };
// Chenowth DPV (4.08 x 2.11 m, 2.01 m): the low tub and its tubular roll cage, the engine at the back, the gun on its pintle
// over the cage; Flyer 72 (est 5.3 x 2.0 m) longer with a rack behind the cage; Growler ITV (4.32 x 1.52 m, 1.63 m) a
// narrow open body with a roll bar.
const cage = (x0: number, x1: number, w: number, u0: number, u1: number): AddOn[] => [
  ...[-1, 1].flatMap((s) => [rod([x1, s * w, u0], [x1 - 0.5, s * w, u1], 0.06, MT), rod([x1 - 0.5, s * w, u1], [x0 + 0.3, s * w, u1], 0.06, MT), rod([x0 + 0.3, s * w, u1], [x0, s * w, u0], 0.06, MT), rod([(x0 + x1) / 2, s * w, u0], [(x0 + x1) / 2, s * w, u1], 0.05, MT)]),
  rod([x1 - 0.5, -w, u1], [x1 - 0.5, w, u1], 0.06, MT), rod([x0 + 0.3, -w, u1], [x0 + 0.3, w, u1], 0.06, MT),
];
G['dpv-buggy'] = { cls: 'light-strike', chassis: 'wheeled', length: 4.08, width: 2.11, hullHeight: 1.1, axles: 2, axleAt: [0.62, -0.65], wheelRadius: 0.4, hullOutline: { top: [[-2.04, 0.85], [1.6, 0.85], [2.04, 0.6]], bottom: [[-2.04, 0.4], [2.04, 0.45]], plan: [[-2.04, 0.6], [2.04, 0.45]], round: 8, stations: 8 }, addOns: [
  ...cage(-1.4, 1.0, 0.65, 0.85, 1.75), bx(-2.0, -1.2, 0, 0.6, 1.1, 1.0, DARK), rod([-0.4, 0, 1.75], [-0.4, 0, 2.0], 0.06, MT), rod([-0.6, 0, 2.0], [0.7, 0, 2.0], 0.07, MT),
] };
G['flyer-72'] = { cls: 'light-strike', chassis: 'wheeled', length: 5.3, width: 2.0, hullHeight: 1.1, axles: 2, axleAt: [0.65, -0.6], wheelRadius: 0.45, hullOutline: { top: [[-2.65, 0.95], [1.9, 0.95], [2.65, 0.75]], bottom: [[-2.65, 0.5], [2.65, 0.55]], plan: [[-2.65, 0.9], [2.65, 0.8]], round: 8, stations: 8 }, addOns: [
  ...cage(-0.9, 1.4, 0.85, 0.95, 1.9), bx(-2.6, -1.0, 0, 0.95, 1.3, 1.8), ...[-1, 1].map((s) => rod([-2.6, s * 0.85, 1.3], [-1.0, s * 0.85, 1.3], 0.05, MT)), rod([0.0, 0, 1.9], [0.0, 0, 2.15], 0.06, MT), rod([-0.2, 0, 2.15], [1.1, 0, 2.15], 0.07, MT),
] };
G['growler-itv'] = { cls: 'light-strike', chassis: 'wheeled', length: 4.32, width: 1.52, hullHeight: 1.0, axles: 2, axleAt: [0.62, -0.6], wheelRadius: 0.4, hullOutline: { top: [[-2.16, 0.95], [-0.2, 0.95], [0.4, 1.05], [2.0, 0.95], [2.16, 0.75]], bottom: [[-2.16, 0.45], [2.16, 0.45]], plan: [[-2.16, 0.74], [2.16, 0.68]], round: 8, stations: 10 }, addOns: [
  ...[-1, 1].map((s) => rod([-0.4, s * 0.7, 0.95], [-0.4, s * 0.7, 1.63], 0.06, MT)), rod([-0.4, -0.7, 1.63], [-0.4, 0.7, 1.63], 0.06, MT), ...[-1, 1].map((s) => rod([-0.4, s * 0.7, 1.63], [-1.4, s * 0.7, 0.95], 0.05, MT)),
  sl([0.45, 0, 1.3], rect(0.7, 0.25), 0.03, 'front', { ...GL, pitch: 0.3 }), rod([-1.0, 0, 1.63], [-1.0, 0, 1.9], 0.05, MT), rod([-1.1, 0, 1.9], [0.0, 0, 1.9], 0.06, MT),
] };
// Land Rover 101 Forward Control (4.13 x 1.84 m, 2.14 m): the cab over the front axle with its short, low flat nose, the
// cargo body under a canvas tilt.
G['land-rover-101'] = { cls: 'truck', chassis: 'wheeled', length: 4.13, width: 1.84, hullHeight: 2.14, axles: 2, axleAt: [0.61, -0.63], wheelRadius: 0.45, hull: 'truck', bed: 'none', cab: { length: 1.55, height: 2.14, outline: forwardCab(4.13, 1.84, 0.45, 1.55, 2.14, 0.3, 0.45, 8) }, addOns: cargo(-2.065, 0.45, 1.84, 0.95, 0.4, 2.14) };


// ---------------------------------------------------------------- modern rail

/** A rail vehicle's underframe from end to end at `u`, `w` wide, and its buffers and couplers at both ends. */
const railFrame = (half: number, u: number, w: number): AddOn[] => [
  bx(-half + 0.35, half - 0.35, 0, u - 0.35, u, w, DARK),
  ...[-1, 1].flatMap((e) => [...[-0.85, 0.85].map((s) => rod([e * (half - 0.35), s, u - 0.2], [e * half, s, u - 0.2], 0.36, MT)), rod([e * (half - 0.35), 0, u - 0.25], [e * (half + 0.1), 0, u - 0.25], 0.22, DK)]),
];
/** A handrail along both sides from `x0` to `x1` at `u`, its posts down to `u0`. */
const railing = (x0: number, x1: number, s: number, u0: number, u: number): AddOn[] => [
  rod([x0, s, u], [x1, s, u], 0.04, { ...MT, mirror: true }),
  ...Array.from({ length: Math.max(2, Math.round((x1 - x0) / 1.5) + 1) }, (_, i) => rod([x0 + ((x1 - x0) * i) / Math.max(1, Math.round((x1 - x0) / 1.5)), s, u0], [x0 + ((x1 - x0) * i) / Math.max(1, Math.round((x1 - x0) / 1.5)), s, u], 0.04, { ...MT, mirror: true })),
];
// ChME3 shunter (17.22 x 3.12 m, 4.62 m): the long hood ahead, the tall cab near the back and the short hood behind it,
// the walkways and their handrails along the hoods, on two three-axle bogies.
G['diesel-shunter'] = { cls: 'rail', chassis: 'rail', bare: true, length: 17.22, width: 3.12, hullHeight: 1.75, wheelRadius: 0.525, bogieAt: [4.3, -4.3], bogieAxles: 3, axleSpacing: 1.6, addOns: [
  ...railFrame(8.61, 1.75, 3.1), kung(-2.6, 8.3, 2.2, 1.75, 3.7, {}, 6), kung(-5.7, -2.6, 3.1, 1.75, 4.62, {}, 5), kung(-8.3, -5.7, 2.2, 1.75, 3.55, {}, 6),
  sl([-2.58, 0, 3.9], rect(1.2, 0.35), 0.03, 'front', GL), rod([3.0, 0, 3.7], [3.0, 0, 4.1], 0.3, DK), ...railing(-8.4, -5.8, 1.45, 1.75, 2.75), ...railing(-2.5, 8.4, 1.45, 1.75, 2.75),
] };
// A mainline diesel (est 22.3 x 3.1 m, 5.1 m; the TEP70 / 2TE116 class): the full-width carbody with the raked cab front,
// the roof's radiator fans and exhaust, on two three-axle bogies.
G['diesel-locomotive'] = { cls: 'rail', chassis: 'rail', bare: true, length: 22.3, width: 3.1, hullHeight: 1.75, wheelRadius: 0.525, bogieAt: [7.0, -7.0], bogieAxles: 3, axleSpacing: 1.85, addOns: [
  ...railFrame(11.15, 1.75, 3.1),
  ob({ top: [[-11.0, 4.7], [-10.8, 4.95], [8.6, 4.95], [9.9, 4.6], [11.0, 3.2]], bottom: [[-11.0, 1.75], [11.0, 1.75]], plan: [[-11.0, 1.5], [9.6, 1.55], [11.0, 1.35]], round: 6, stations: 16 }),
  sl([10.15, 0, 3.75], rect(1.2, 0.45), 0.03, 'front', { ...GL, pitch: 0.75 }), ...[-6.0, -3.6, -1.2].map((x) => hd(x, 0, 5.0, 1.4, 0.15, DARK)), hb(2.0, 0, 5.05, 1.6, 0.8, 0.25, DARK),
] };
// VL80 two-section electric (32.8 x 3.16 m, 5.1 m): two carbodies with flat, slightly raked cab faces at the outer ends,
// a pantograph raised on each roof, each section on two two-axle bogies.
G['electric-locomotive'] = { cls: 'rail', chassis: 'rail', bare: true, length: 32.8, width: 3.16, hullHeight: 1.8, wheelRadius: 0.625, bogieAt: [12.1, 4.3, -4.3, -12.1], bogieAxles: 2, axleSpacing: 3.0, addOns: [
  ...railFrame(16.4, 1.8, 3.1),
  ...[-1, 1].flatMap((e) => [
    ob(e > 0 ? { top: [[0.25, 4.5], [0.4, 4.6], [15.3, 4.6], [16.3, 3.9]], bottom: [[0.25, 1.8], [16.3, 1.8]], plan: [[0.25, 1.55], [15.6, 1.58], [16.3, 1.4]], round: 6, stations: 12 } : { top: [[-16.3, 3.9], [-15.3, 4.6], [-0.4, 4.6], [-0.25, 4.5]], bottom: [[-16.3, 1.8], [-0.25, 1.8]], plan: [[-16.3, 1.4], [-15.6, 1.58], [-0.25, 1.55]], round: 6, stations: 12 }),
    sl([e * 15.85, 0, 4.15], rect(1.25, 0.32), 0.03, 'front', { ...GL, pitch: e * 0.6 }), hb(e * 8.0, 0, 4.75, 5.0, 1.4, 0.3, DARK),
    rod([e * 6.0, 0, 4.9], [e * 7.2, 0, 5.75], 0.08, MT), rod([e * 8.4, 0, 4.9], [e * 7.2, 0, 5.75], 0.08, MT), hb(e * 7.2, 0, 5.8, 0.15, 1.9, 0.08, DARK),
  ]),
] };
// A four-axle covered goods wagon (est 14.73 x 3.25 m, 4.7 m): the box body with its arched roof, the sliding doors in the
// middle of each side, on two bogies.
G['rail-boxcar'] = { cls: 'rail', chassis: 'rail', bare: true, length: 14.73, width: 3.25, hullHeight: 1.3, bogieAt: [4.3, -4.3], bogieAxles: 2, axleSpacing: 1.85, addOns: [
  ...railFrame(7.36, 1.3, 2.9), ob({ top: [[-6.95, 4.3], [-6.9, 4.7], [6.9, 4.7], [6.95, 4.3]], bottom: [[-6.95, 1.3], [6.95, 1.3]], plan: [[-6.95, 1.6], [6.95, 1.6]], round: 5, stations: 6 }),
  sl([0, 1.62, 2.8], rect(1.0, 1.15), 0.05, 'side', { ...DK, ...M }),
] };
// A four-axle open wagon (13.92 x 3.13 m, 3.48 m): the walls with their stanchions, open above, on two bogies.
G['rail-open-wagon'] = { cls: 'rail', chassis: 'rail', bare: true, length: 13.92, width: 3.13, hullHeight: 1.4, bogieAt: [4.3, -4.3], bogieAxles: 2, axleSpacing: 1.85, addOns: [
  ...railFrame(6.96, 1.4, 2.9), bx(-6.4, 6.4, 1.5, 1.4, 3.48, 0.08, M), ...[-1, 1].map((e) => bx(e * 6.4 - 0.04, e * 6.4 + 0.04, 0, 1.4, 3.48, 3.08)), sl([0, 0, 1.45], rect(6.3, 1.45), 0.04, 'plan', DK),
  ...[-4.8, -3.2, -1.6, 0, 1.6, 3.2, 4.8].map((x) => hb(x, 1.56, 2.44, 0.12, 0.08, 2.08, M)),
] };
// A four-axle tank wagon (12.02 m over couplers, 3.0 m barrel, 4.75 m): the long barrel on its frame, the filler dome on
// top, the ladders and walkway, on two bogies.
G['rail-tank-car'] = { cls: 'rail', chassis: 'rail', bare: true, length: 12.02, width: 3.0, hullHeight: 1.4, bogieAt: [3.65, -3.65], bogieAxles: 2, axleSpacing: 1.85, addOns: [
  ...railFrame(6.01, 1.4, 2.6), ob({ top: [[-5.45, 3.4], [-5.2, 4.25], [5.2, 4.25], [5.45, 3.4]], bottom: [[-5.45, 2.1], [-5.2, 1.45], [5.2, 1.45], [5.45, 2.1]], plan: [[-5.45, 1.05], [-5.2, 1.5], [5.2, 1.5], [5.45, 1.05]], round: 2, stations: 10 }, { shade: 0.8 }),
  hd(0, 0, 4.4, 0.9, 0.5), hb(0, 0, 4.3, 1.4, 1.0, 0.06, DARK), ...[-1, 1].map((s) => rod([0.6, s * 1.45, 1.4], [0.6, s * 0.8, 4.3], 0.06, MT)),
] };
// A four-axle flat wagon (13.4 x 2.87 m, deck 1.3 m): the deck and its stakes, on two bogies.
G['rail-flat-car'] = { cls: 'rail', chassis: 'rail', bare: true, length: 13.4, width: 2.87, hullHeight: 1.3, bogieAt: [4.85, -4.85], bogieAxles: 2, axleSpacing: 1.85, addOns: [
  ...railFrame(6.7, 1.3, 2.87), bx(-6.6, 6.6, 0, 1.3, 1.45, 2.87), ...[-5.2, -2.6, 0, 2.6, 5.2].map((x) => hb(x, 1.38, 1.8, 0.1, 0.1, 0.7, { ...M, ...DARK })),
] };
// A passenger coach (est 24.0 x 3.1 m, 4.25 m): the long body with its rounded roof, the window band down both sides, the
// gangway bellows at the ends, on two bogies.
G['rail-passenger-car'] = { cls: 'rail', chassis: 'rail', bare: true, length: 24.0, width: 3.1, hullHeight: 1.3, bogieAt: [8.5, -8.5], bogieAxles: 2, axleSpacing: 2.4, addOns: [
  ...railFrame(12.0, 1.3, 2.9), ob({ top: [[-11.6, 4.0], [-11.4, 4.25], [11.4, 4.25], [11.6, 4.0]], bottom: [[-11.6, 1.3], [11.6, 1.3]], plan: [[-11.6, 1.5], [11.6, 1.5]], round: 5, stations: 6 }),
  sl([0, 1.52, 2.65], rect(9.8, 0.45), 0.03, 'side', { ...GL, ...M }), ...[-1, 1].map((e) => bx(e * 11.8 - 0.25, e * 11.8 + 0.25, 0, 1.4, 3.7, 1.4, DARK)),
] };


// ---------------------------------------------------------------- War Thunder prototypes and rarities with their own silhouette

// T95 medium tank (1955; hull est 6.3 x 3.15 m, 2.5 m): a low wedge hull on six road wheels with no return rollers, the
// compact cast turret and the 90 mm smoothbore without a brake.
G['t95-medium'] = { cls: 'mbt', chassis: 'tracked', length: 6.3, width: 3.15, hullHeight: 1.45, roadWheels: 6, roadWheelRadius: 0.38, trackProfile: run(6.1, 0.92, [3.05, 0.62], [-3.05, 0.66], -2.5, 2.45), running: { wheels: [-2.3, -1.38, -0.46, 0.46, 1.38, 2.3] }, hullOutline: hull(6.3, 3.15, 1.45, 0.88, 1.7, 0.95, 0.2),
  turret: turret(0.15, [[-1.6, 0.8], [-1.2, 1.25], [0.3, 1.35], [1.2, 1.1], [1.6, 0.5]], [[-1.6, 0.45], [-1.0, 0.75], [0.3, 0.82], [1.2, 0.62], [1.6, 0.35]], 2.4, 1.55), guns: [{ mount: 'turret', length: 5.0, calibre: 0.09, extractor: 0.5, at: 0.45 }], cupola: true };
// M728 combat engineer vehicle (1965; 7.88 m with the blade, 3.71 m, 3.2 m): the M60A1 with the stubby 165 mm demolition
// gun, the A-frame boom folded back over the turret, the winch on the turret's back and the dozer blade.
G['m728-cev'] = { cls: 'mbt', ...PATTON, turret: M60A1_TURRET, guns: [{ mount: 'turret', length: 1.5, calibre: 0.165, at: 0.45 }], addOns: [
  ...M19_CUPOLA, ...[-1, 1].map((s) => rod([2.0, s * 0.95, 2.35], [-3.0, s * 0.35, 2.8], 0.16, MT)), rod([-3.0, -0.4, 2.8], [-3.0, 0.4, 2.8], 0.16, MT), tb(-2.3, 0, 0.55, 0.6, 1.4, 0.55, DARK),
  sl([3.95, 0, 0.75], rect(1.85, 0.5), 0.12, 'front', { ...MT, curve: -0.2 }), ...[-1, 1].map((s) => rod([3.85, s * 1.4, 0.6], [1.6, s * 1.75, 0.75], 0.15, MT)),
] };
// T114 (1958; 4.46 x 2.33 m, 1.93 m): a small boxy aluminium carrier on four road wheels, its sloped nose and the cupola
// with the .50.
G['t114'] = { cls: 'scout-car', chassis: 'tracked', length: 4.46, width: 2.33, hullHeight: 1.65, roadWheels: 4, roadWheelRadius: 0.3, trackProfile: run(4.3, 0.75, [2.15, 0.55], [-2.15, 0.5], -1.65, 1.65), running: { wheels: [-1.4, -0.47, 0.47, 1.4] }, hullOutline: { top: [[-2.23, 1.55], [-2.1, 1.65], [0.6, 1.65], [2.23, 0.95]], bottom: [[-2.23, 0.6], [1.9, 0.55], [2.23, 0.95]], plan: [[-2.23, 1.15], [2.23, 1.1]], round: 12, stations: 10 },
  addOns: [hd(-0.3, 0.3, 1.8, 0.75, 0.3), hb(0.3, 0.3, 1.9, 1.0, 0.07, 0.07, DARK)] };
// Object 120 "Taran" (1957; hull est 6.9 x 3.12 m, 2.8 m): the front-engined hull on seven road wheels, the big turret at
// the back and the very long 152 mm M-69 with its brake.
G['object-120'] = { cls: 'tank-destroyer', chassis: 'tracked', length: 6.9, width: 3.12, hullHeight: 1.45, roadWheels: 7, roadWheelRadius: 0.3, trackProfile: run(6.7, 0.85, [3.35, 0.6], [-3.35, 0.62], -2.8, 2.75), running: { wheels: [-2.6, -1.73, -0.86, 0, 0.86, 1.73, 2.6] }, hullOutline: hull(6.9, 3.12, 1.45, 0.82, 1.6, 0.95, 0.15),
  turret: turret(-1.6, [[-1.6, 1.0], [-1.3, 1.3], [0.6, 1.4], [1.5, 1.0], [1.8, 0.5]], [[-1.6, 0.85], [-1.2, 1.0], [0.6, 1.05], [1.8, 0.6]], 6, 1.7), guns: [{ mount: 'turret', length: 9.0, calibre: 0.152, muzzle: true, extractor: 0.6, at: 0.5 }] };
// IT-1 (1968; 6.63 x 3.3 m, 2.2 m): the T-62's hull with a low, flatter dome of a turret and no gun, the 3M7 Drakon missile
// raised on its launch arm out of the roof.
const DRAKON: Msl = { len: 1.24, d: 0.18, nose: 0.25, fins: [[0.15, 0.65, 0.25, 0.5, 0.32, 'x']] };
G['it-1'] = { ...base('t-62'), cls: 'tank-destroyer', guns: undefined, cupola: false, turret: turret(0.2, [[-1.4, 0.75], [-1.05, 1.2], [-0.1, 1.38], [0.85, 1.28], [1.35, 0.85], [1.5, 0.4]], [[-1.4, 0.3], [-0.85, 0.6], [0.0, 0.7], [0.85, 0.6], [1.5, 0.25]], 2.2, 1.3), addOns: [
  tb(0.4, 0, 0.75, 0.6, 0.35, 0.25, DARK), { on: 'turret', kind: 'tube', at: [0.3, 0, 0.7], to: [0.55, 0, 1.15], size: [0.12, 0.12, 0], metal: true }, ...missile([0.0, 0, 2.55], 0.05, DRAKON),
] };
// Vickers MBT Mk 1 / Vijayanta (1963; hull 7.92 x 3.17 m, 2.44 m): the flat-decked hull on six road wheels and three
// rollers, the slab-sided welded turret, the L7 with its extractor and no sleeve; Mk 3 (1977) the rounded cast front of
// its turret, the sleeved gun and the smoke dischargers.
const VICKERS: GroundSpec = { chassis: 'tracked', length: 7.92, width: 3.17, hullHeight: 1.65, roadWheels: 6, roadWheelRadius: 0.36, trackProfile: run(7.7, 0.95, [3.85, 0.7], [-3.85, 0.68], -3.2, 3.15), running: { wheels: [-2.85, -1.7, -0.55, 0.6, 1.75, 2.9], rollers: [-1.7, 0, 1.7] }, hullOutline: hull(7.92, 3.17, 1.65, 0.95, 1.9, 1.05, 0.2), cupola: true };
G['vickers-mbt-mk1'] = { cls: 'mbt', ...VICKERS, turret: turret(-0.3, [[-1.9, 1.15], [-1.6, 1.4], [0.9, 1.45], [1.7, 1.05], [1.95, 0.6]], [[-1.9, 0.62], [-1.5, 0.8], [0.9, 0.82], [1.95, 0.45]], 10, 1.85), guns: [{ mount: 'turret', length: 5.4, calibre: 0.105, extractor: 0.55, at: 0.45 }], addOns: [tb(-2.1, 0, 0.4, 0.4, 2.0, 0.4, DARK)] };
G['vickers-mbt-mk3'] = { cls: 'mbt', ...VICKERS, hullOutline: hull(7.92, 3.17, 1.65, 0.95, 2.2, 1.0, 0.2), turret: turret(-0.3, [[-1.9, 1.1], [-1.5, 1.42], [0.6, 1.48], [1.5, 1.1], [1.95, 0.55]], [[-1.9, 0.55], [-1.4, 0.85], [0.6, 0.88], [1.6, 0.6], [1.95, 0.4]], 3.5, 1.85), guns: [{ mount: 'turret', length: 5.4, calibre: 0.105, sleeve: 0.75, extractor: 0.6, at: 0.45 }], addOns: [tb(-2.1, 0, 0.4, 0.4, 2.0, 0.4, DARK), tb(0.6, 1.4, 0.55, 0.45, 0.18, 0.2, { ...M, ...DARK, yaw: 0.4 })] };
// Vickers Mk 7 (1985): the Leopard 2's hull and running gear under the Vickers turret - low and angular with a long bustle -
// and the 120 mm L11 with its sleeve and extractor.
G['vickers-mk7'] = { cls: 'mbt', ...LEO2, turret: turret(-0.5, [[-2.6, 1.2], [-2.3, 1.55], [1.2, 1.65], [2.0, 1.3], [2.4, 0.6]], [[-2.6, 0.62], [-2.3, 0.75], [1.2, 0.8], [2.4, 0.45]], 12, 2.3), guns: [{ mount: 'turret', length: 5.6, calibre: 0.12, sleeve: 0.8, extractor: 0.5, at: 0.45 }], addOns: [tb(0.9, 0.7, 0.92, 0.6, 0.45, 0.25), { on: 'turret', kind: 'drum', at: [-0.2, -0.7, 0.95], size: [0.45, 0.45, 0.4] }] };
// 9P149 Shturm-S (1979): the MT-LB with the launch arm raised out of its roof holding a 9M114 container, the armoured hatch
// box over the launcher well and the guidance sight on the cab.
G['shturm-s'] = { ...G['mt-lb'], cls: 'atgm', turret: undefined, guns: undefined, addOns: [
  bx(-2.6, -0.2, 0, 1.6, 1.75, 1.9, DARK), rod([-1.6, 0, 1.7], [-1.3, 0, 2.6], 0.2, MT), rod(along([-2.2, 0, 2.7], 0.08, 0), along([-2.2, 0, 2.7], 0.08, 1.85), 0.16, LT), hb(2.2, -0.6, 1.95, 0.4, 0.35, 0.35, DARK),
] };
// 9P157-2 Khrizantema-S (2005): the BMP-3's hull with no turret, the radar under its dome over the front of the roof and
// the two launch arms raised either side, each with two missile containers.
G['khrizantema-s'] = { ...BMP3, cls: 'atgm', turret: undefined, guns: undefined, addOns: [
  bx(-1.6, 0.8, 0, 1.75, 1.95, 2.3, DARK), hd(0.9, 0, 2.05, 1.0, 0.5), { on: 'hull', kind: 'blob', at: [0.9, 0, 2.3], size: [1.0, 1.0, 0.5] },
  ...[-1, 1].flatMap((s) => [rod([-0.4, s * 0.95, 1.8], [-0.4, s * 1.05, 2.6], 0.18, MT), ...[-0.12, 0.12].map((d) => rod(along([-1.4, s * 1.05 + d, 2.75], 0.08, 0), along([-1.4, s * 1.05 + d, 2.75], 0.08, 2.1), 0.2, LT))]),
] };
// Falcon (1960s): the FV433 Abbot's hull with the open-backed Falcon turret and its two 30 mm HSS 831L.
G['falcon'] = { ...G['fv432'], cls: 'spaa', turret: { x: -0.5, length: 1.9, width: 1.8, height: 0.75, shape: 'sloped', slope: 0.12 }, guns: [{ mount: 'turret', count: 2, length: 2.6, calibre: 0.03, spread: 0.8, elevation: 0.2, at: 0.45 }], addOns: [] };
// Tracked Rapier (1983; on the M548 family, 6.4 x 2.8 m, 2.78 m): the armoured cab at the front, the launcher turret over the
// back with four missiles on each side and the surveillance radar on its roof.
G['tracked-rapier'] = { ...M548, cls: 'sam', length: 6.4, width: 2.8, turret: { x: -1.3, length: 1.6, width: 1.3, height: 1.0, shape: 'box' }, missiles: [{ mount: 'turret-side', rows: 2, cols: 2, length: 2.24, diameter: 0.133, rail: true, elevation: 0.12, up: 0.55 }], addOns: [
  { on: 'turret', kind: 'box', at: [0.0, 0, 1.25], size: [0.45, 1.1, 0.5], paint: 'light' }, bx(0.6, 2.6, 0, 1.3, 2.4, 2.6),
] };
// Type 75 130 mm MLRS (1975; 5.78 x 2.8 m, 2.67 m): the Type 73 carrier's hull with the box of thirty tubes, five rows of
// six, laid forward on its turntable over the back.
const T75_P: V3 = [-2.7, 0, 1.95];
G['type-75-mlrs'] = { cls: 'mlrs', chassis: 'tracked', length: 5.78, width: 2.8, hullHeight: 1.6, roadWheels: 5, roadWheelRadius: 0.3, trackProfile: run(5.6, 0.85, [2.8, 0.6], [-2.8, 0.55], -2.25, 2.2), running: { wheels: [-1.95, -0.98, 0, 0.98, 1.95] }, hullOutline: { top: [[-2.89, 1.5], [-2.75, 1.6], [1.0, 1.6], [2.89, 0.95]], bottom: [[-2.89, 0.7], [2.6, 0.7], [2.89, 0.95]], plan: [[-2.89, 1.35], [2.89, 1.3]], round: 12, stations: 10 }, addOns: [
  hd(-1.2, 0, 1.7, 1.6, 0.2, DARK), beam(along(T75_P, 0.05, 0, -0.15), 0.05, 2.9, 1.95, 1.0, DARK), ...tubes(T75_P, 0.05, [6, 6, 6, 6, 6], 0.14, 0.16, 2.95),
] };
// EFV (2003; 9.32 x 3.66 m, 3.19 m): the long flat planing hull with its bow plate, the tracks drawn up under it on six road
// wheels, the small Mk 46 turret with its 30 mm.
G['efv'] = { cls: 'apc-tracked', chassis: 'tracked', length: 9.32, width: 3.66, hullHeight: 2.25, roadWheels: 6, roadWheelRadius: 0.32, trackProfile: run(6.8, 0.85, [2.9, 0.6], [-3.85, 0.62], -3.35, 2.4), running: { wheels: [-3.1, -1.95, -0.8, 0.35, 1.5, 2.6] },
  hullOutline: { top: [[-4.66, 2.1], [-4.5, 2.25], [1.2, 2.25], [4.66, 1.2]], bottom: [[-4.66, 1.0], [2.9, 0.9], [4.66, 1.2]], plan: [[-4.66, 1.75], [2.6, 1.83], [4.66, 1.6]], round: 10, stations: 14 },
  turret: turret(0.4, [[-0.9, 0.75], [-0.6, 0.85], [0.6, 0.85], [0.9, 0.6]], [[-0.9, 0.75], [-0.6, 0.9], [0.6, 0.9], [0.9, 0.6]], 8, 0.85), guns: [{ mount: 'turret', length: 2.6, calibre: 0.03, at: 0.5 }] };
// 2S38 (2021): the BMP-3's hull under the big AU-220M module and its long 57 mm with the brake.
G['2s38'] = { ...BMP3, cls: 'spaa', turret: turret(-0.1, [[-1.4, 1.0], [-1.1, 1.25], [0.8, 1.3], [1.4, 0.9]], [[-1.4, 0.85], [-1.0, 1.05], [0.9, 1.05], [1.4, 0.65]], 10, 1.35), guns: [{ mount: 'turret', length: 4.4, calibre: 0.057, muzzle: true, at: 0.5, elevation: 0.08 }], addOns: [tb(-0.3, 0.75, 1.25, 0.5, 0.45, 0.4, DARK)] };
// Machbet (1990s): the M163 with a four-round Stinger box beside its Vulcan.
G['machbet'] = { ...AD('m163-vulcan'), addOns: [{ on: 'turret', kind: 'box', at: [0.2, -1.05, 0.55], size: [1.6, 0.45, 0.45], pitch: 0.15 }] };

// ---------------------------------------------------------------- War Thunder vehicles that borrowed a relative, by their own outline

/** A drum on the turret: a cupola or sight head, diameter `d`, height `h`, centred at (x, s, u) in the turret's frame. */
const td = (x: number, s: number, u: number, d: number, h: number, o: Opt = {}): AddOn => ({ on: 'turret', kind: 'drum', at: [x, s, u], size: [d, d, h], ...o });
/** An oscillating turret: the low collar on the ring (the main turret) and the upper body pivoting on it (`turrets[0]`), its gun on index 1. */
/** The ring a rounded cast turret stands on, filling under its curved sides: `w` across, `h` high. */
const ringOf = (w: number, h = 0.3): AddOn => td(0, 0, h / 2, w, h);
/** A round plan of radius `r` about the turret's centre, as half-widths back to front. */
const circle6 = (r: number): P2[] => [[-r, r * 0.3], [-r * 0.7, r * 0.71], [0, r], [r * 0.7, r * 0.71], [r, r * 0.3]];
const collar = (x: number, r: number, h: number) => turret(x, [[-r, r * 0.6], [-r * 0.7, r * 0.93], [0, r], [r * 0.7, r * 0.93], [r, r * 0.6]], [[-r, h * 0.7], [-r * 0.6, h], [r * 0.6, h], [r, h * 0.7]], 3, r);

// T54E1 (1956; the M48's hull and running gear, 6.82 x 3.63 m, about 3.1 m high: estimate): the oscillating turret - a low
// collar on the ring, the long narrow upper body pivoting on it with the autoloader's bustle far out over the engine deck -
// and the long 120 mm T123E6 with its bore evacuator.
G['t54e1'] = { cls: 'mbt', ...PATTON, length: 6.82, running: { wheels: PATTON_WHEELS, rollers: [-2.0, -1.0, 0, 1.0, 2.0] }, turret: collar(0.15, 1.45, 0.48),
  turrets: [turret(-0.45, [[-3.0, 0.7], [-2.5, 0.92], [-0.6, 1.05], [0.9, 1.05], [1.7, 0.75], [2.15, 0.4]], [[-3.0, 0.3], [-2.5, 0.6], [-0.3, 0.82], [1.0, 0.75], [2.15, 0.32]], 3, 2.1, { up: 0.25 })],
  guns: [{ mount: 'turret', turret: 1, length: 5.9, calibre: 0.12, extractor: 0.6, at: 0.42 }], addOns: [td(-0.6, 0.6, 1.32, 0.7, 0.35), tb(-0.3, 0.6, 1.38, 0.8, 0.07, 0.07, DARK)] };
// T54E2 (1957; the M48's hull, about 3.0 m high: estimate): a conventional cast turret, its long rounded bustle holding the
// autoloader overhanging the engine deck, the same 120 mm with its evacuator.
G['t54e2'] = { cls: 'mbt', ...PATTON, length: 6.82, running: { wheels: PATTON_WHEELS, rollers: [-2.0, -1.0, 0, 1.0, 2.0] },
  turret: turret(0.05, [[-2.95, 0.75], [-2.5, 1.05], [-1.2, 1.35], [0.3, 1.5], [1.3, 1.3], [1.95, 0.7]], [[-2.95, 0.4], [-2.4, 0.72], [-1.0, 0.92], [0.3, 1.0], [1.3, 0.72], [1.95, 0.4]], 2.6, 1.9),
  guns: [{ mount: 'turret', length: 5.9, calibre: 0.12, extractor: 0.6, at: 0.45 }], addOns: [ringOf(2.3), td(-0.5, 0.65, 1.12, 0.75, 0.35), tb(-0.2, 0.65, 1.2, 0.8, 0.07, 0.07, DARK)] };
// M103 hull (6.98 x 3.76 m): seven road wheels and six return rollers, the rounded cast nose.
const M103_HULL: GroundSpec = { chassis: 'tracked', length: 6.98, width: 3.76, hullHeight: 1.7, roadWheels: 7, roadWheelRadius: 0.33, trackProfile: run(6.8, 1.0, [3.4, 0.7], [-3.45, 0.75], -2.95, 2.75), running: { wheels: [-2.75, -1.87, -0.98, -0.1, 0.78, 1.66, 2.54], rollers: [-2.5, -1.5, -0.5, 0.5, 1.5, 2.5] }, hullOutline: hull(6.98, 3.76, 1.7, 0.98, 1.9, 1.05, 0.2, 5) };
// T58 (1953; the M103's hull, about 3.25 m high: estimate): a big oscillating turret - the wide collar and the long upper
// body with its autoloader bustle - and the 155 mm T7.
G['t58'] = { cls: 'heavy-tank', ...M103_HULL, turret: collar(0.0, 1.7, 0.5),
  turrets: [turret(-0.5, [[-3.3, 0.85], [-2.8, 1.15], [-0.8, 1.35], [0.9, 1.35], [1.8, 1.0], [2.35, 0.5]], [[-3.3, 0.4], [-2.8, 0.75], [-0.5, 1.05], [1.0, 0.95], [2.35, 0.4]], 3, 2.3, { up: 0.3 })],
  guns: [{ mount: 'turret', turret: 1, length: 6.2, calibre: 0.155, extractor: 0.55, at: 0.4 }], addOns: [td(-0.8, 0.75, 1.6, 0.8, 0.35), tb(-0.5, 0.75, 1.68, 0.8, 0.07, 0.07, DARK)] };
// Stingray (1984; hull 6.45 x 2.71 m, 2.55 m): six road wheels and three rollers in the open, a long flat deck, the welded
// turret with its flat upright faces and long bustle, the 105 mm LRF with its evacuator and slotted brake, the cupola on the right.
G['stingray'] = { cls: 'light-tank', chassis: 'tracked', length: 6.45, width: 2.71, hullHeight: 1.55, roadWheels: 6, roadWheelRadius: 0.31, trackProfile: run(6.25, 0.88, [3.15, 0.6], [-3.15, 0.66], -2.65, 2.6), running: { wheels: [-2.4, -1.48, -0.56, 0.36, 1.28, 2.2], rollers: [-1.5, 0, 1.5] }, hullOutline: hull(6.45, 2.71, 1.55, 0.86, 1.7, 0.98, 0.15, 8),
  turret: turret(-0.3, [[-2.0, 0.95], [-1.65, 1.2], [0.6, 1.25], [1.3, 1.02], [1.55, 0.55]], [[-2.0, 0.78], [-1.65, 0.9], [0.8, 0.95], [1.55, 0.55]], 10, 1.5),
  guns: [{ mount: 'turret', length: 5.3, calibre: 0.105, extractor: 0.55, muzzle: true, at: 0.45 }], addOns: [td(-0.4, 0.62, 1.1, 0.65, 0.3), tb(0.0, 0.62, 1.18, 0.9, 0.06, 0.06, DARK), tb(0.95, 1.15, 0.6, 0.45, 0.2, 0.25, { ...M, ...DARK, yaw: 0.4 })] };
// XM800T (1971; about 4.6 x 2.44 m, 2.2 m: estimates): the small aluminium scout on five road wheels, a steep bow, the
// small turret amidships with the long thin 20 mm M139.
G['xm800t'] = { cls: 'light-tank', chassis: 'tracked', length: 4.6, width: 2.44, hullHeight: 1.45, roadWheels: 5, roadWheelRadius: 0.28, trackProfile: run(4.45, 0.78, [2.22, 0.55], [-2.22, 0.55], -1.75, 1.75), running: { wheels: [-1.55, -0.78, 0, 0.78, 1.55] }, hullOutline: { top: [[-2.3, 1.3], [-2.15, 1.45], [0.9, 1.45], [2.3, 0.8]], bottom: [[-2.3, 0.6], [1.95, 0.55], [2.3, 0.8]], plan: [[-2.3, 1.18], [2.3, 1.08]], round: 10, stations: 10 },
  turret: turret(-0.2, [[-0.8, 0.62], [-0.55, 0.75], [0.45, 0.75], [0.75, 0.55]], [[-0.8, 0.5], [0.45, 0.6], [0.75, 0.42]], 6, 0.75), guns: [{ mount: 'turret', length: 2.0, calibre: 0.02, at: 0.5 }], addOns: [td(-0.3, -0.35, 0.68, 0.45, 0.2)] };
// XM803 (1971; the MBT-70's hull, 6.99 x 3.51 m): the driver moved down into the hull, so the turret's front is shorter and
// blunter, an M85 cupola in place of the pop-up 20 mm, the 152 mm gun-launcher.
G['xm803'] = { cls: 'mbt', ...MBT70, cupola: false, turret: turret(-0.3, [[-2.2, 1.1], [-1.7, 1.6], [0.5, 1.65], [1.5, 1.32], [2.1, 0.55]], [[-2.2, 0.6], [-1.3, 0.85], [0.5, 0.9], [1.6, 0.66], [2.1, 0.38]], 6, 2.0),
  guns: [{ mount: 'turret', length: 3.8, calibre: 0.152, at: 0.45 }], addOns: [td(-0.5, 0.75, 1.05, 0.8, 0.35), tb(-0.2, 0.75, 1.12, 0.8, 0.07, 0.07, DARK), tb(-2.45, 0, 0.4, 0.45, 2.0, 0.4, DARK)] };
// RDF/LT (1983; about 5.3 x 2.5 m, 2.0 m to the gun: estimates): a small low hull on five road wheels, the flat two-man
// turret with the 75 mm ARES carried above its roof on an external cradle, its muzzle brake.
G['rdf-lt'] = { cls: 'light-tank', chassis: 'tracked', length: 5.3, width: 2.5, hullHeight: 1.3, roadWheels: 5, roadWheelRadius: 0.3, trackProfile: run(5.1, 0.8, [2.55, 0.55], [-2.55, 0.58], -2.05, 2.0), running: { wheels: [-1.85, -0.95, -0.05, 0.85, 1.75] }, hullOutline: hull(5.3, 2.5, 1.3, 0.78, 1.6, 0.85, 0.12, 8),
  turret: turret(-0.4, [[-1.1, 0.85], [-0.8, 1.0], [0.7, 1.0], [1.1, 0.7]], [[-1.1, 0.32], [0.7, 0.38], [1.1, 0.25]], 8, 0.4),
  guns: [{ mount: 'turret', length: 3.6, calibre: 0.075, muzzle: true, at: 1.9 }], addOns: [tb(-0.2, 0, 0.58, 1.6, 0.5, 0.42), tb(-1.0, 0, 0.5, 0.6, 0.35, 0.25, DARK)] };
/** An FL-series oscillating upper body (FL-12, FL-15, FL-20): the tall pointed front, the flat bustle holding the drum magazines; on a collar. */
const flUpper = (x: number, l: number, hw: number, h: number, up: number) => turret(x, [[-l * 0.55, hw * 0.8], [-l * 0.45, hw], [l * 0.15, hw], [l * 0.45, hw * 0.62]], [[-l * 0.55, h * 0.88], [l * 0.12, h], [l * 0.45, h * 0.5]], 6, l * 0.45, { up });
// Marder DF105 (1979; the Marder 1's hull, 6.79 x 3.24 m, about 2.9 m high: estimate): the FL-15 oscillating turret set over
// the hull's middle in place of the 20 mm turret, its long bustle over the troop roof, the 105 mm CN105-57 with its brake.
G['marder-df105'] = { cls: 'light-tank', ...MARDER, turret: collar(-0.3, 1.1, 0.35), turrets: [flUpper(-0.6, 3.2, 1.0, 0.85, 0.3)], guns: [{ mount: 'turret', turret: 1, length: 4.4, calibre: 0.105, muzzle: true, at: 0.6 }], addOns: [td(-0.8, 0.6, 1.2, 0.5, 0.2)] };
// Marder CLOVIS (1984; the DF105 rebuilt, about 3.0 m high: estimate): the bigger, squarer FL-20 upper body with added
// armour, the longer 105 mm CN105 G1 with its double brake and the 20 mm CN20 alongside it.
G['marder-clovis'] = { cls: 'light-tank', ...MARDER, turret: collar(-0.3, 1.15, 0.38), turrets: [turret(-0.65, [[-1.95, 0.9], [-1.7, 1.12], [0.3, 1.15], [1.25, 0.85], [1.6, 0.55]], [[-1.95, 0.85], [-1.6, 0.98], [0.4, 1.0], [1.6, 0.55]], 10, 1.5, { up: 0.32 })],
  guns: [{ mount: 'turret', turret: 1, length: 5.1, calibre: 0.105, muzzle: true, at: 0.55 }, { mount: 'turret', turret: 1, length: 2.0, calibre: 0.02, at: 0.4 }], addOns: [td(-1.0, 0.6, 1.4, 0.5, 0.22), tb(0.9, 0.95, 0.85, 0.4, 0.2, 0.2, { ...M, ...DARK, yaw: 0.3 })] };
// SK-105 Kürassier (1971; hull 5.58 x 2.5 m, 2.53 m): the Saurer hull on five road wheels and three rollers, a steep glacis,
// the FL-12 oscillating turret over the back with its 105 mm; A2 with the ballistic computer's box on the turret's back.
G['sk-105'] = { cls: 'tank-destroyer', chassis: 'tracked', length: 5.58, width: 2.5, hullHeight: 1.45, roadWheels: 5, roadWheelRadius: 0.32, trackProfile: run(5.4, 0.85, [2.7, 0.6], [-2.72, 0.6], -2.15, 2.15), running: { wheels: [-1.95, -0.98, 0, 0.98, 1.95], rollers: [-1.0, 0, 1.0] }, hullOutline: hull(5.58, 2.5, 1.45, 0.82, 1.35, 0.92, 0.1, 8),
  turret: collar(-0.75, 0.95, 0.3), turrets: [flUpper(-1.0, 2.9, 0.95, 0.8, 0.25)], guns: [{ mount: 'turret', turret: 1, length: 4.4, calibre: 0.105, muzzle: true, at: 0.6 }], addOns: [td(-0.9, 0.55, 1.13, 0.45, 0.2), tb(-1.95, 0, 0.75, 0.5, 1.2, 0.45, DARK)] };
// Begleitpanzer 57 (1977; the Marder's hull, about 3.1 m high: estimate): the big Bofors turret with the 57 mm L/70 and its
// brake high in a rounded front, the TOW launcher raised on the turret's left.
G['begleitpanzer-57'] = { cls: 'ifv', ...MARDER, turret: turret(-0.2, [[-1.4, 1.0], [-1.1, 1.22], [0.6, 1.25], [1.25, 1.0], [1.45, 0.6]], [[-1.4, 0.95], [-1.1, 1.1], [0.6, 1.15], [1.45, 0.65]], 4, 1.4), guns: [{ mount: 'turret', length: 4.0, calibre: 0.057, muzzle: true, at: 0.6 }], addOns: [tb(-0.4, -1.4, 0.9, 1.4, 0.3, 0.32), td(-0.6, 0.55, 1.22, 0.5, 0.2)] };
// EMBT (2015; the Leopard 2's hull, 7.72 x 3.7 m): the Leclerc's turret with its upright front, the autoloader bustle and
// the commander's sight on its column, on the German hull and running gear.
G['embt'] = { cls: 'mbt', ...LEO2, turret: { ...LECLERC.turret!, x: -0.35 }, guns: LECLERC.guns, addOns: [...LECLERC_ADD, ...LEO2_GLACIS(0.12)] };
// VT1-2 (1975; about 7.0 x 3.54 m, 2.2 m: estimates): the turretless Versuchsträger on Leopard 2 running gear - a low wedge
// casemate with two 120 mm fixed side by side in its front, aimed by turning the whole vehicle.
G['vt1-2'] = { cls: 'tank-destroyer', chassis: 'tracked', length: 7.0, width: 3.54, hullHeight: 1.6, roadWheels: 7, roadWheelRadius: 0.33, skirts: true, trackProfile: run(6.85, 0.92, [3.42, 0.6], [-3.42, 0.7], -2.85, 2.8), hullOutline: { top: [[-3.5, 1.5], [-3.3, 1.65], [-1.0, 1.65], [0.4, 2.2], [1.6, 2.2], [3.5, 0.95]], bottom: [[-3.5, 0.92], [3.3, 0.92], [3.5, 0.95]], plan: [[-3.5, 1.72], [2.6, 1.77], [3.5, 1.35]], round: 12, stations: 14 },
  guns: [{ mount: 'hull', count: 2, spread: 1.3, length: 5.3, calibre: 0.12, extractor: 0.5, x: 1.6, at: 0.83 }], addOns: [hb(-0.6, 0.9, 2.3, 0.45, 0.45, 0.25, DARK)] };
// TH 400 (1983; about 6.6 x 3.1 m, 2.5 m: estimates): Thyssen-Henschel's light tank on six road wheels, the turret over the
// middle with its sloped front and bustle, the 105 mm with its evacuator.
G['th-400'] = { cls: 'light-tank', chassis: 'tracked', length: 6.6, width: 3.1, hullHeight: 1.55, roadWheels: 6, roadWheelRadius: 0.32, skirts: true, trackProfile: run(6.4, 0.9, [3.2, 0.62], [-3.2, 0.66], -2.65, 2.6), hullOutline: hull(6.6, 3.1, 1.55, 0.86, 1.6, 1.0, 0.12),
  turret: turret(-0.3, [[-2.0, 1.0], [-1.6, 1.3], [0.6, 1.35], [1.4, 1.0], [1.7, 0.5]], [[-2.0, 0.7], [-1.6, 0.85], [0.6, 0.9], [1.7, 0.5]], 10, 1.65), guns: [{ ...L7, sleeve: 0.7 }], addOns: [td(-0.5, 0.65, 1.05, 0.6, 0.3)] };
// Object 906 (1963; about 7.3 x 3.2 m, 2.2 m: estimates): the PT-76's successor - a long low amphibious hull on six road
// wheels, the turret set back to the middle with its rounded cast front, the 85 mm D-58 with its evacuator.
G['object-906'] = { cls: 'light-tank', chassis: 'tracked', length: 7.3, width: 3.2, hullHeight: 1.45, roadWheels: 6, roadWheelRadius: 0.33, trackProfile: run(6.9, 0.82, [3.35, 0.55], [-3.45, 0.6], -2.85, 2.85), running: { wheels: [-2.6, -1.56, -0.52, 0.52, 1.56, 2.6] }, hullOutline: { top: [[-3.65, 1.25], [-3.45, 1.45], [1.3, 1.45], [3.65, 0.9]], bottom: [[-3.65, 0.72], [2.5, 0.68], [3.65, 0.9]], plan: [[-3.65, 1.52], [2.7, 1.58], [3.65, 1.15]], round: 8, stations: 12 },
  turret: turret(0.2, [[-1.2, 0.8], [-0.9, 1.1], [0.5, 1.2], [1.1, 0.85], [1.3, 0.45]], [[-1.2, 0.45], [-0.7, 0.68], [0.4, 0.75], [1.3, 0.35]], 2.4, 1.25), guns: [{ mount: 'turret', length: 4.6, calibre: 0.085, extractor: 0.7, at: 0.45 }], addOns: [ringOf(1.9)] };
// Object 416 (1952; about 6.3 x 3.24 m, 1.8 m: estimates): the very low hull with the engine in front, the flat dome of a
// turret far back holding the driver too, the 100 mm M-63 reaching past the bow.
G['object-416'] = { cls: 'mbt', chassis: 'tracked', length: 6.3, width: 3.24, hullHeight: 1.15, roadWheels: 6, roadWheelRadius: 0.32, trackProfile: run(6.1, 0.82, [3.05, 0.58], [-3.05, 0.62], -2.5, 2.5), running: { wheels: [-2.25, -1.35, -0.45, 0.45, 1.35, 2.25] }, hullOutline: hull(6.3, 3.24, 1.15, 0.8, 2.2, 0.85, 0.1, 6),
  turret: turret(-1.2, [[-1.5, 0.95], [-1.1, 1.35], [0.2, 1.45], [1.1, 1.25], [1.55, 0.7]], [[-1.5, 0.35], [-0.9, 0.62], [0.2, 0.68], [1.2, 0.5], [1.55, 0.25]], 2.2, 1.45), guns: [{ mount: 'turret', length: 5.4, calibre: 0.1, extractor: 0.85, at: 0.45 }], addOns: [ringOf(2.3)] };
// Object 685 (1974; the BMP-3's forerunner, about 7.0 x 3.15 m, 2.4 m: estimates): the BMP-3's long hull with its
// stepped glacis on six road wheels and rollers, a low wedge turret over the middle and the long 100 mm 2A48.
G['object-685'] = { cls: 'light-tank', ...BMP3, length: 7.0, turret: turret(0.1, [[-1.3, 0.95], [-1.0, 1.25], [0.5, 1.3], [1.2, 0.95], [1.4, 0.5]], [[-1.3, 0.5], [-0.9, 0.62], [0.5, 0.68], [1.4, 0.38]], 6, 1.35), guns: [{ mount: 'turret', length: 5.4, calibre: 0.1, extractor: 0.6, at: 0.45 }], addOns: [] };
// Object 140 (1953; about 6.4 x 3.27 m, 2.2 m: estimates): a T-54-like medium on six smaller road wheels with return
// rollers, the lower, flatter cast turret, the 100 mm with its evacuator near the muzzle.
G['object-140'] = { ...base('t-55a'), cls: 'mbt', length: 6.4, roadWheels: 6, roadWheelRadius: 0.32, trackProfile: run(6.2, 0.85, [3.1, 0.62], [-3.1, 0.66], -2.55, 2.5), running: { wheels: [-2.3, -1.38, -0.46, 0.46, 1.38, 2.3], rollers: [-1.4, 0, 1.4] }, hullOutline: hull(6.4, 3.27, 1.45, 0.86, 1.6, 0.95, 0.2),
  turret: turret(0.35, [[-1.4, 0.75], [-1.05, 1.15], [-0.1, 1.3], [0.85, 1.2], [1.3, 0.75], [1.45, 0.35]], [[-1.4, 0.3], [-0.85, 0.58], [0.0, 0.68], [0.85, 0.55], [1.45, 0.22]], 2.0, 1.3), guns: [{ mount: 'turret', length: 5.4, calibre: 0.1, extractor: 0.85, at: 0.4 }], addOns: [ringOf(2.0)] };
// Type 63 amphibious tank (1963; 7.15 x 3.2 m, 2.52 m): the PT-76's boat hull on six road wheels under a bigger cast turret
// set further back, the 85 mm with its evacuator; the 1980s rebuild the same outline.
G['type-63-amphibious'] = { cls: 'light-tank', chassis: 'tracked', length: 7.15, width: 3.2, hullHeight: 1.55, roadWheels: 6, roadWheelRadius: 0.35, trackProfile: run(6.8, 0.85, [3.3, 0.55], [-3.4, 0.62], -2.8, 2.8), running: { wheels: [-2.6, -1.56, -0.52, 0.52, 1.56, 2.6] }, hullOutline: { top: [[-3.58, 1.35], [-3.4, 1.55], [1.5, 1.55], [3.58, 0.95]], bottom: [[-3.58, 0.75], [2.4, 0.7], [3.58, 0.95]], plan: [[-3.58, 1.5], [2.6, 1.6], [3.58, 1.2]], round: 8, stations: 12 },
  turret: turret(0.75, [[-1.3, 0.8], [-1.0, 1.1], [0.5, 1.15], [1.1, 0.85], [1.3, 0.5]], [[-1.3, 0.55], [-0.8, 0.85], [0.5, 0.92], [1.3, 0.5]], 2.6, 1.3), guns: [{ mount: 'turret', length: 4.4, calibre: 0.085, extractor: 0.7, at: 0.45 }], cupola: true, addOns: [ringOf(1.8)] };
// CM-11 Brave Tiger (1990; the M60A3's hull, 6.95 x 3.63 m, 3.1 m): the round M48-type cast turret on the M60 hull, the M68
// with its thermal sleeve, the laser rangefinder's box over the mantlet and a low cupola in place of the M19.
G['cm-11'] = { cls: 'mbt', ...PATTON, turret: M48_TURRET, guns: [{ ...M60_GUN, sleeve: 0.8 }], addOns: [td(-0.4, 0.65, 0.98, 0.75, 0.2), tb(-0.1, 0.65, 1.04, 0.7, 0.07, 0.07, DARK), tb(1.35, 0, 0.98, 0.45, 0.5, 0.3, DARK), tb(0.5, 1.35, 0.6, 0.45, 0.18, 0.2, { ...M, ...DARK, yaw: 0.45 }), M60_RACK] };
// PTZ-89 (1989; about 6.33 x 3.23 m, 2.65 m: estimates): a long tracked hull with the engine in front and six road wheels,
// the big welded turret far back with its flat sides, the 120 mm smoothbore with its evacuator overhanging the bow.
G['ptz-89'] = { cls: 'tank-destroyer', chassis: 'tracked', length: 6.33, width: 3.23, hullHeight: 1.65, roadWheels: 6, roadWheelRadius: 0.32, trackProfile: run(6.15, 0.88, [3.08, 0.62], [-3.08, 0.6], -2.55, 2.5), running: { wheels: [-2.3, -1.4, -0.5, 0.4, 1.3, 2.2], rollers: [-1.4, 0, 1.4] }, hullOutline: hull(6.33, 3.23, 1.65, 0.9, 2.0, 0.95, 0.1, 10),
  turret: turret(-1.15, [[-1.95, 1.15], [-1.6, 1.4], [0.8, 1.45], [1.6, 1.05], [1.85, 0.6]], [[-1.95, 0.85], [-1.6, 1.0], [0.8, 1.0], [1.85, 0.6]], 10, 1.8), guns: [{ mount: 'turret', length: 6.0, calibre: 0.12, extractor: 0.55, at: 0.5 }], addOns: [td(-0.6, 0.7, 1.12, 0.5, 0.25)] };
// MBT-2000 (2001; hull 6.9 x 3.4 m, 2.3 m): the Type 85 family's hull on six small road wheels under skirts, the welded
// turret with its flat upright front and long bustle box, the 125 mm with its sleeve and evacuator.
G['mbt-2000'] = { cls: 'mbt', ...ZTZ96, width: 3.4, skirts: true, turret: turret(0.1, [[-2.35, 1.05], [-1.9, 1.45], [0.5, 1.55], [1.55, 1.48], [1.9, 1.0], [1.95, 0.5]], [[-2.35, 0.6], [-1.9, 0.72], [0.6, 0.8], [1.9, 0.62], [1.95, 0.42]], 10, 1.9),
  guns: [{ mount: 'turret', length: 6.0, calibre: 0.125, sleeve: 0.55, extractor: 0.6, at: 0.45 }], addOns: [td(-0.5, 0.7, 0.92, 0.55, 0.3), tb(1.1, -0.7, 0.92, 0.5, 0.45, 0.3), tb(0.6, 1.5, 0.45, 0.5, 0.18, 0.22, { ...M, ...DARK, yaw: 0.4 })] };
// ZTL-11 (2011; on the ZBL-09's 8x8 hull, 8.0 x 3.0 m, about 2.9 m: estimates): the tall boxy hull with its sloped nose,
// the low wedge turret amidships, the 105 mm with its evacuator and brake.
G['ztl-11'] = { cls: 'tank-destroyer', chassis: 'wheeled', length: 8.0, width: 3.0, hullHeight: 2.15, axles: 4, axleAt: [0.72, 0.37, -0.25, -0.62], wheelRadius: 0.6, hullOutline: wheeledHull(8.0, 2.15, 1.15, 1.5, 2.2),
  turret: turret(-0.6, [[-1.9, 1.05], [-1.5, 1.25], [0.6, 1.3], [1.4, 0.95], [1.7, 0.5]], [[-1.9, 0.62], [-1.5, 0.75], [0.6, 0.8], [1.7, 0.45]], 10, 1.6), guns: [{ mount: 'turret', length: 5.3, calibre: 0.105, extractor: 0.55, muzzle: true, at: 0.5 }], addOns: [td(-0.3, 0.6, 0.9, 0.5, 0.25)] };
// VT5 / ZTQ-15 (2016; hull about 6.8 x 3.3 m, 2.5 m: estimates): six road wheels under skirts, the front-engined hull, the
// turret faced with angular wedge modules and a long bustle, the 105 mm with its sleeve and evacuator.
G['vt-5'] = { cls: 'light-tank', chassis: 'tracked', length: 6.8, width: 3.3, hullHeight: 1.65, roadWheels: 6, roadWheelRadius: 0.33, skirts: true, trackProfile: run(6.6, 0.92, [3.3, 0.62], [-3.3, 0.66], -2.75, 2.7), hullOutline: hull(6.8, 3.3, 1.65, 0.9, 1.9, 1.05, 0.12),
  turret: turret(-0.45, [[-2.2, 1.1], [-1.8, 1.4], [0.5, 1.48], [1.5, 1.2], [2.1, 0.7], [2.25, 0.4]], [[-2.2, 0.65], [-1.8, 0.8], [0.6, 0.86], [1.8, 0.62], [2.25, 0.38]], 9, 2.1), guns: [{ mount: 'turret', length: 5.4, calibre: 0.105, sleeve: 0.7, extractor: 0.55, at: 0.45 }], addOns: [td(-0.5, 0.72, 0.98, 0.5, 0.35), td(0.5, -0.7, 0.98, 0.42, 0.35)] };
// WZ1001(E) LCT (2010s; about 6.9 x 3.2 m, 2.6 m: estimates): a light tank on six road wheels, the high flat-sided turret
// with a short bustle and the 105 mm with its evacuator.
G['wz-1001'] = { cls: 'light-tank', chassis: 'tracked', length: 6.9, width: 3.2, hullHeight: 1.7, roadWheels: 6, roadWheelRadius: 0.33, skirts: true, trackProfile: run(6.7, 0.92, [3.35, 0.62], [-3.35, 0.66], -2.8, 2.75), hullOutline: hull(6.9, 3.2, 1.7, 0.92, 1.7, 1.05, 0.12),
  turret: turret(-0.3, [[-1.8, 1.15], [-1.45, 1.4], [0.8, 1.45], [1.5, 1.15], [1.8, 0.6]], [[-1.8, 0.8], [-1.45, 0.92], [0.8, 0.95], [1.8, 0.6]], 12, 1.75), guns: [{ mount: 'turret', length: 5.4, calibre: 0.105, sleeve: 0.6, extractor: 0.55, at: 0.45 }], addOns: [td(-0.4, 0.7, 1.05, 0.5, 0.3)] };
// WMA301 Assaulter (2010s; about 7.3 x 3.1 m, 2.65 m: estimates): a boxy 6x6 with a sloped nose, the turret set back with
// its long bustle and the 105 mm with its brake.
G['wma-301'] = { cls: 'tank-destroyer', chassis: 'wheeled', length: 7.3, width: 3.1, hullHeight: 2.0, axles: 3, axleAt: [0.65, 0.0, -0.6], wheelRadius: 0.62, hullOutline: wheeledHull(7.3, 2.0, 1.1, 1.55, 1.8),
  turret: turret(-0.7, [[-1.8, 0.95], [-1.45, 1.15], [0.6, 1.2], [1.3, 0.9], [1.55, 0.5]], [[-1.8, 0.62], [0.6, 0.72], [1.55, 0.45]], 10, 1.5), guns: [{ mount: 'turret', length: 5.2, calibre: 0.105, muzzle: true, extractor: 0.6, at: 0.5 }], addOns: [td(-0.4, 0.6, 0.85, 0.45, 0.25)] };
// PTL02 (2002; the WZ-551's 6x6 hull, 6.88 x 2.8 m, 2.6 m): a low flat turret open at the back over the hull's rear, the
// 100 mm with its pepperpot brake and evacuator reaching far past the nose.
const WZ551 = G['wz-551'];
G['ptl-02'] = { ...WZ551, cls: 'tank-destroyer', turret: turret(-1.0, [[-1.3, 0.95], [-1.0, 1.15], [0.6, 1.2], [1.2, 0.85], [1.4, 0.45]], [[-1.3, 0.5], [0.6, 0.55], [1.4, 0.35]], 10, 1.35), guns: [{ mount: 'turret', length: 5.4, calibre: 0.1, muzzle: true, extractor: 0.6, at: 0.5 }] };
// AFT09 (2009; on the WZ-551 6x6): no gun turret - the launcher's box turret over the back with two HJ-9 containers raised
// on its arms each side and the millimetre-wave guidance radar's pod between them.
G['aft09'] = { ...WZ551, cls: 'atgm', turret: turret(-1.4, [[-0.8, 0.75], [-0.6, 0.85], [0.6, 0.85], [0.85, 0.6]], [[-0.8, 0.75], [0.6, 0.8], [0.85, 0.55]], 10, 0.85), guns: undefined,
  addOns: [...[-1, 1].flatMap((s) => [tb(-0.1, s * 1.05, 0.95, 2.0, 0.3, 0.26, { pitch: 0.1 }), tb(-0.1, s * 1.05, 1.27, 2.0, 0.3, 0.26, { pitch: 0.1 })]), td(0.3, 0, 1.05, 0.55, 0.5, LT), tb(-0.2, 0, 0.95, 0.4, 0.4, 0.3, DARK)] };
// CM-34 Clouded Leopard IFV (2018; about 7.95 x 2.7 m, 3.0 m: estimates): the long 8x8 with its sloped nose, the two-man
// turret with the 30 mm Bushmaster II and its sight head.
G['cm-34'] = { cls: 'ifv', chassis: 'wheeled', length: 7.95, width: 2.7, hullHeight: 2.25, axles: 4, axleAt: [0.72, 0.38, -0.25, -0.62], wheelRadius: 0.6, hullOutline: wheeledHull(7.95, 2.25, 1.2, 1.35, 2.2),
  turret: turret(-0.4, [[-1.3, 0.85], [-1.0, 1.0], [0.6, 1.05], [1.15, 0.7]], [[-1.3, 0.6], [0.6, 0.7], [1.15, 0.45]], 10, 1.1), guns: [{ mount: 'turret', length: 3.2, calibre: 0.03, at: 0.5 }], addOns: [td(-0.3, 0.55, 0.85, 0.45, 0.3), tb(-0.6, -1.15, 0.45, 0.6, 0.18, 0.2, { ...DARK, yaw: -0.3 })] };
// HQ-11 launcher on its 8x8 (2020s; about 10.6 x 2.9 m, 3.6 m: estimates): the wide cab-over cab, the equipment box behind
// it and the eight missile canisters, two rows of four, raised near upright over the back.
G['hq-11'] = { cls: 'sam', ...MZKT_7930, length: 10.6, width: 2.9, axles: 4, axleAt: [0.75, 0.48, -0.32, -0.62], bed: 'none', cab: { length: 2.4, height: 3.0, outline: forwardCab(10.6, 2.9, 0.72, 2.4, 3.0, 0.4, 0.5, 12) },
  addOns: [bx(-5.3, 2.9, 0, 1.2, 1.55, 2.8), kung(1.3, 2.85, 2.7, 1.55, 3.0), beam([-3.9, 0, 1.6], 1.35, 4.2, 2.3, 1.15), ...[-1, 1].map((s) => rod([-1.6, s * 0.7, 1.6], along([-3.9, s * 0.7, 1.6], 1.35, 2.0, -0.55), 0.18, MT))] };
// QN506 (2018; the Type 59's hull, 6.2 x 3.27 m): the T-55-like hull under a big flat-sided box turret holding the
// QN-502C missiles in pods on its sides, the 30 mm and the sight mast on top.
G['qn506'] = { ...base('t-55a'), cls: 'atgm', turret: turret(0.1, [[-1.6, 1.15], [-1.3, 1.35], [0.9, 1.4], [1.5, 1.0], [1.65, 0.55]], [[-1.6, 0.85], [-1.3, 1.0], [0.9, 1.0], [1.65, 0.6]], 12, 1.6), guns: [{ mount: 'turret', length: 2.6, calibre: 0.03, at: 0.5 }],
  addOns: [...[-1, 1].map((s) => tb(-0.2, s * 1.45, 0.7, 2.0, 0.35, 0.55)), { on: 'turret', kind: 'tube', at: [-0.6, 0.5, 1.0], to: [-0.6, 0.5, 1.6], size: [0.12, 0.12, 0], metal: true }, td(-0.6, 0.5, 1.7, 0.35, 0.25, DARK)] };
// Badger (2013; Denel's 8x8 on the Patria AMV, about 8.0 x 2.9 m, 2.3 m hull: estimates): the AMV's long hull with its
// sloped nose and the big faceted Mk II turret with sloped sides, the 30 mm and its sight head.
G['badger-ifv'] = { ...G['patria-amv'], cls: 'ifv', length: 8.0, width: 2.9, hullOutline: wheeledHull(8.0, 2.3, 1.2, 1.45, 2.3),
  turret: turret(-0.4, [[-1.5, 0.95], [-1.2, 1.2], [0.5, 1.25], [1.2, 0.95], [1.45, 0.55]], [[-1.5, 0.72], [-1.2, 0.85], [0.5, 0.88], [1.45, 0.5]], 9, 1.4), guns: [{ mount: 'turret', length: 3.0, calibre: 0.03, at: 0.5 }], addOns: [td(-0.5, 0.65, 1.0, 0.5, 0.3), tb(0.2, -1.3, 0.45, 0.7, 0.18, 0.25, { ...M, ...DARK, yaw: -0.3 })] };
// VFM Mk 5 (1986; on a CCVL-type hull, 6.2 x 2.69 m, 2.4 m: estimates): Vickers' light tank turret - low, slab-sided with
// a sloped front and a deep bustle - and the 105 mm L7 with its evacuator; five road wheels in the open.
G['vfm-5'] = { ...G['ccvl'], cls: 'light-tank', skirts: false, running: { wheels: [-2.25, -1.15, -0.05, 1.05, 2.15], rollers: [-1.1, 1.1] }, turret: turret(-0.35, [[-2.05, 0.9], [-1.75, 1.18], [0.5, 1.22], [1.3, 0.95], [1.55, 0.5]], [[-2.05, 0.65], [-1.75, 0.78], [0.6, 0.82], [1.55, 0.48]], 10, 1.5),
  guns: [{ ...L7, length: 5.0 }], addOns: [td(-0.6, 0.6, 0.92, 0.6, 0.25), tb(0.8, 1.15, 0.5, 0.4, 0.18, 0.2, { ...M, ...DARK, yaw: 0.4 })] };
// Ajax (2015; 7.62 x 3.35 m, 3.0 m: estimates of the published size): the tall box hull of the ASCOD family on seven road
// wheels under deep skirts, the wide flat turret with the stubby 40 mm CTA in its mantlet and the sight heads on the roof.
G['ajax'] = { cls: 'light-tank', chassis: 'tracked', length: 7.62, width: 3.35, hullHeight: 2.2, roadWheels: 7, roadWheelRadius: 0.32, skirts: true, skirt: [[-3.6, 0.55], [3.5, 0.55], [3.5, 1.25], [-3.6, 1.25]], trackProfile: run(7.4, 1.0, [3.7, 0.65], [-3.7, 0.7], -3.05, 3.0), hullOutline: { top: [[-3.81, 2.05], [-3.65, 2.2], [1.4, 2.2], [3.81, 1.2]], bottom: [[-3.81, 1.0], [3.5, 1.0], [3.81, 1.2]], plan: [[-3.81, 1.62], [3.81, 1.55]], round: 12, stations: 12 },
  turret: turret(-0.3, [[-1.5, 1.1], [-1.2, 1.3], [0.6, 1.35], [1.25, 1.05], [1.45, 0.6]], [[-1.5, 0.72], [-1.2, 0.82], [0.7, 0.85], [1.45, 0.5]], 10, 1.45), guns: [{ mount: 'turret', length: 2.8, calibre: 0.04, sleeve: 0.5, at: 0.45 }], addOns: [td(-0.3, 0.7, 1.0, 0.55, 0.35), td(0.5, -0.65, 0.98, 0.45, 0.3)] };
// Challenger 1 Mk 3 "Desert Storm" (1991): the Challenger 1 with ROMOR-A bricks over the nose, the Chobham panels hung on
// the hull's sides over the skirts and the long box over the engine deck's back.
G['challenger-ds'] = { ...G['challenger-1'], addOns: [...G['challenger-1'].addOns!, ...glacis(8.3, 1.7, 1.25, 1.15, 0.2, 3.0, 1, 4), hb(0.4, 1.85, 0.95, 6.6, 0.3, 0.75, M), hb(-3.6, 0, 1.75, 0.6, 2.8, 0.5, DARK)] };
// Harimau / Kaplan MT (2018; about 7.0 x 3.2 m, 2.6 m: estimates): a long hull on six road wheels under skirts, the
// Cockerill 3105 turret - big, angular and flat-roofed with a long bustle - the 105 mm with its sleeve and evacuator.
G['harimau'] = { cls: 'light-tank', chassis: 'tracked', length: 7.0, width: 3.2, hullHeight: 1.75, roadWheels: 6, roadWheelRadius: 0.32, skirts: true, trackProfile: run(6.8, 0.95, [3.4, 0.62], [-3.4, 0.66], -2.85, 2.8), hullOutline: hull(7.0, 3.2, 1.75, 0.95, 1.8, 1.05, 0.12),
  turret: turret(-0.5, [[-2.3, 1.1], [-1.95, 1.42], [0.6, 1.48], [1.5, 1.15], [1.85, 0.6]], [[-2.3, 0.7], [-1.95, 0.84], [0.7, 0.88], [1.85, 0.5]], 11, 1.75), guns: [{ mount: 'turret', length: 5.4, calibre: 0.105, sleeve: 0.65, extractor: 0.55, at: 0.45 }], addOns: [td(-0.6, 0.72, 1.05, 0.5, 0.35), td(0.4, -0.75, 1.05, 0.42, 0.35)] };
// OTOMATIC (1987; on the Palmaria's hull, 7.27 x 3.35 m, about 3.5 m with the radar: estimates): the long hull on seven road
// wheels, the very big box turret with the long 76 mm and its brake, the search radar's antenna on the turret's back.
G['otomatic'] = { cls: 'spaa', chassis: 'tracked', length: 7.27, width: 3.35, hullHeight: 1.65, roadWheels: 7, roadWheelRadius: 0.33, skirts: true, trackProfile: run(7.1, 0.95, [3.55, 0.62], [-3.55, 0.7], -2.95, 2.9), hullOutline: hull(7.27, 3.35, 1.65, 0.92, 1.6, 1.1, 0.15),
  turret: turret(-0.4, [[-1.9, 1.35], [-1.6, 1.55], [0.9, 1.6], [1.6, 1.25], [1.85, 0.7]], [[-1.9, 1.15], [-1.6, 1.3], [0.9, 1.3], [1.85, 0.75]], 12, 1.8), guns: [{ mount: 'turret', length: 4.7, calibre: 0.076, muzzle: true, at: 0.55, elevation: 0.15 }],
  addOns: [{ on: 'turret', kind: 'slab', at: [-1.3, 0, 1.75], size: [0.15, 0, 0], poly: rect(1.1, 0.35), plane: 'front', pitch: -0.3, paint: 'light' }, td(-1.3, 0, 1.38, 0.3, 0.2, DARK)] };
// KF41 Lynx (2016; 7.73 x 3.6 m, 3.3 m): the tall flat-sided hull on six road wheels under skirts with its sharp nose, the
// Lance turret with the 35 mm in its long shroud, the sight heads and the missile pod on its side.
G['kf41-lynx'] = { cls: 'ifv', chassis: 'tracked', length: 7.73, width: 3.6, hullHeight: 2.3, roadWheels: 6, roadWheelRadius: 0.33, skirts: true, skirt: [[-3.65, 0.55], [3.55, 0.55], [3.55, 1.3], [-3.65, 1.3]], trackProfile: run(7.5, 1.0, [3.75, 0.68], [-3.75, 0.72], -3.15, 3.05), hullOutline: { top: [[-3.86, 2.15], [-3.7, 2.3], [0.9, 2.3], [3.86, 1.15]], bottom: [[-3.86, 1.0], [3.5, 1.0], [3.86, 1.15]], plan: [[-3.86, 1.75], [3.86, 1.68]], round: 12, stations: 12 },
  turret: turret(-0.6, [[-1.6, 1.0], [-1.3, 1.2], [0.6, 1.25], [1.25, 0.95], [1.45, 0.55]], [[-1.6, 0.7], [-1.3, 0.8], [0.7, 0.82], [1.45, 0.5]], 10, 1.45), guns: [{ mount: 'turret', length: 3.3, calibre: 0.035, sleeve: 0.55, at: 0.45 }], addOns: [td(-0.4, 0.7, 0.98, 0.5, 0.35), td(0.5, -0.6, 0.98, 0.42, 0.3), tb(-0.6, -1.4, 0.6, 1.1, 0.35, 0.4)] };
// C13 T90 (1990s; Otomelara's C13 tracked carrier, about 5.9 x 2.7 m, 2.5 m: estimates): a box hull on five road wheels
// with its sloped nose, the small Cockerill turret with the 90 mm and its brake.
G['c13-t90'] = { cls: 'light-tank', chassis: 'tracked', length: 5.9, width: 2.7, hullHeight: 1.8, roadWheels: 5, roadWheelRadius: 0.3, trackProfile: run(5.7, 0.85, [2.85, 0.58], [-2.85, 0.6], -2.3, 2.25), running: { wheels: [-2.05, -1.03, 0, 1.03, 2.05] }, hullOutline: { top: [[-2.95, 1.7], [-2.8, 1.8], [0.9, 1.8], [2.95, 0.95]], bottom: [[-2.95, 0.8], [2.6, 0.75], [2.95, 0.95]], plan: [[-2.95, 1.35], [2.95, 1.3]], round: 12, stations: 10 },
  turret: turret(-0.2, [[-1.2, 0.85], [-0.95, 1.0], [0.5, 1.05], [1.1, 0.75], [1.25, 0.45]], [[-1.2, 0.6], [0.5, 0.7], [1.25, 0.42]], 8, 1.2), guns: [{ mount: 'turret', length: 3.6, calibre: 0.09, muzzle: true, at: 0.5 }] };
// Fiat 6614 with FIROS 6 (1980s; the 6614 4x4, 5.86 x 2.5 m): the boat-nosed armoured carrier with the box of forty-eight
// 51 mm rockets on its roof.
G['fiat-6614-firos'] = { cls: 'mlrs', chassis: 'wheeled', length: 5.86, width: 2.5, hullHeight: 1.78, axles: 2, axleAt: [0.55, -0.45], wheelRadius: 0.55, hullOutline: wheeledHull(5.86, 1.78, 1.05, 1.25, 1.6), addOns: [hd(-0.6, 0, 1.88, 1.0, 0.2, DARK), beam([-1.6, 0, 2.05], 0.15, 1.6, 1.3, 0.75)] };
// R3 Capraia T106 FA (1980s; about 4.86 x 1.78 m, 1.5 m: estimates): the small low 4x4 scout car with the long 106 mm
// recoilless rifle on its pintle over the back.
G['r3-t106'] = { cls: 'scout-car', chassis: 'wheeled', length: 4.86, width: 1.78, hullHeight: 1.45, axles: 2, axleAt: [0.6, -0.55], wheelRadius: 0.45, hullOutline: wheeledHull(4.86, 1.45, 0.95, 0.89, 1.5, 0.5), addOns: [rod([-1.4, 0, 1.45], [-1.4, 0, 1.85], 0.12, MT), rod([-2.6, 0, 1.95], [0.8, 0, 1.95], 0.16, MT), rod([-2.6, 0, 1.95], [-2.95, 0, 1.95], 0.2, MT, 0.24)] };
// Lorraine 40t (1952; about 6.4 x 3.3 m, 2.85 m: estimates): a pike-nosed hull on four large rubber-tyred road wheels, the
// oscillating turret - collar and long upper body with its drum bustle - and the 100 mm with its brake.
G['lorraine-40t'] = { cls: 'mbt', chassis: 'tracked', length: 6.4, width: 3.3, hullHeight: 1.6, roadWheels: 4, roadWheelRadius: 0.45, trackProfile: run(6.2, 1.0, [3.1, 0.7], [-3.1, 0.7], -2.45, 2.4), running: { wheels: [-2.1, -0.7, 0.7, 2.1] },
  hullOutline: { top: [[-3.2, 1.45], [-3.05, 1.6], [1.4, 1.6], [3.2, 1.0]], bottom: [[-3.2, 1.0], [2.9, 1.0], [3.2, 1.0]], plan: [[-3.2, 1.6], [2.2, 1.65], [3.2, 0.6]], round: 10, stations: 12 },
  turret: collar(0.0, 1.3, 0.45), turrets: [flUpper(-0.4, 4.0, 1.15, 0.9, 0.35)], guns: [{ mount: 'turret', turret: 1, length: 5.0, calibre: 0.1, muzzle: true, at: 0.6 }], addOns: [td(-0.9, 0.6, 1.4, 0.5, 0.22)] };
// AMX-10M ACRA (1970s; about 6.3 x 2.8 m, 2.7 m: estimates): the AMX-10's boxy amphibious hull lengthened to six road
// wheels, the long turret with the fat 142 mm ACRA gun-launcher.
G['amx-10m-acra'] = { cls: 'tank-destroyer', chassis: 'tracked', length: 6.3, width: 2.8, hullHeight: 1.85, roadWheels: 6, roadWheelRadius: 0.3, trackProfile: run(6.1, 0.85, [3.05, 0.6], [-3.05, 0.6], -2.5, 2.45), running: { wheels: [-2.25, -1.35, -0.45, 0.45, 1.35, 2.25], rollers: [-1.3, 0, 1.3] }, hullOutline: { top: [[-3.15, 1.75], [-3.0, 1.85], [0.8, 1.85], [3.15, 0.95]], bottom: [[-3.15, 0.85], [2.8, 0.8], [3.15, 0.95]], plan: [[-3.15, 1.4], [3.15, 1.3]], round: 12, stations: 12 },
  turret: turret(-0.3, [[-1.7, 0.95], [-1.4, 1.15], [0.6, 1.2], [1.3, 0.9], [1.55, 0.5]], [[-1.7, 0.7], [0.6, 0.8], [1.55, 0.5]], 9, 1.5), guns: [{ mount: 'turret', length: 3.2, calibre: 0.142, at: 0.5 }], addOns: [td(-0.6, 0.55, 0.92, 0.5, 0.25)] };
// Pbv 302 (1966; 5.35 x 2.86 m, 2.5 m): the low box hull on five road wheels with no rollers, the small 20 mm turret on
// the front left; with the RBS 56 BILL launcher raised on its post over the back.
G['pbv-302-bill'] = { cls: 'apc-tracked', chassis: 'tracked', length: 5.35, width: 2.86, hullHeight: 1.9, roadWheels: 5, roadWheelRadius: 0.32, trackProfile: run(5.15, 0.85, [2.58, 0.6], [-2.58, 0.6], -2.05, 2.0), running: { wheels: [-1.85, -0.93, 0, 0.93, 1.85] }, hullOutline: { top: [[-2.68, 1.8], [-2.55, 1.9], [1.3, 1.9], [2.68, 1.0]], bottom: [[-2.68, 0.85], [2.4, 0.8], [2.68, 1.0]], plan: [[-2.68, 1.42], [2.68, 1.35]], round: 12, stations: 10 },
  turret: turret(1.0, [[-0.5, 0.45], [-0.35, 0.55], [0.35, 0.55], [0.55, 0.4]], [[-0.5, 0.5], [0.35, 0.55], [0.55, 0.35]], 8, 0.55, { side: -0.6 }), guns: [{ mount: 'turret', length: 2.0, calibre: 0.02, at: 0.5 }],
  addOns: [rod([-1.6, 0.3, 1.9], [-1.6, 0.3, 2.35], 0.12, MT), hb(-1.6, 0.3, 2.45, 0.95, 0.22, 0.22, DARK), hb(-1.45, 0.3, 2.55, 0.25, 0.3, 0.25, DARK)] };
// U-SH 405 (1960; on the Unimog 404, about 4.9 x 2.15 m, 2.1 m: estimates): the small armoured 4x4 body with its sloped
// bonnet, the two 81 mm rocket pods side by side on the roof.
G['ush-405'] = { cls: 'scout-car', chassis: 'wheeled', length: 4.9, width: 2.15, hullHeight: 1.85, axles: 2, axleAt: [0.6, -0.5], wheelRadius: 0.5, hullOutline: { top: [[-2.45, 1.7], [-2.3, 1.85], [0.6, 1.85], [1.3, 1.35], [2.45, 1.2]], bottom: [[-2.45, 0.75], [2.45, 0.75]], plan: [[-2.45, 1.0], [0.8, 1.05], [2.45, 0.85]], round: 10, stations: 12 },
  addOns: [hb(-0.6, 0, 1.95, 0.6, 0.6, 0.2, DARK), ...[-1, 1].map((s) => beam([-1.5, s * 0.35, 2.15], 0.08, 1.8, 0.45, 0.45, DARK))] };
// Eitan (2016; about 8.0 x 3.0 m, 2.6 m hull: estimates): the high 8x8 with its sloped nose and flat sides, the unmanned
// turret with the 30 mm over the hull's middle.
G['eitan'] = { cls: 'ifv', chassis: 'wheeled', length: 8.0, width: 3.0, hullHeight: 2.45, axles: 4, axleAt: [0.72, 0.4, -0.3, -0.62], wheelRadius: 0.62, hullOutline: wheeledHull(8.0, 2.45, 1.25, 1.5, 2.4, 0.65),
  turret: turret(0.0, [[-0.9, 0.7], [-0.7, 0.8], [0.5, 0.8], [0.85, 0.55]], [[-0.9, 0.5], [0.5, 0.55], [0.85, 0.35]], 10, 0.85), guns: [{ mount: 'turret', length: 3.0, calibre: 0.03, at: 0.5 }], addOns: [td(-0.3, 0.5, 0.65, 0.4, 0.3)] };
// Type 62 (1962; 5.55 x 2.86 m, 2.25 m): the Type 59 scaled down - five road wheels with the gap behind the first, no
// rollers - the small round turret well forward, the 85 mm with its evacuator near the muzzle.
G['type-62-light'] = { cls: 'light-tank', chassis: 'tracked', length: 5.55, width: 2.86, hullHeight: 1.35, roadWheels: 5, roadWheelRadius: 0.36, trackProfile: run(5.4, 0.8, [2.7, 0.58], [-2.7, 0.62], -2.15, 2.1), running: { wheels: [-1.95, -1.05, -0.15, 0.75, 1.85] }, hullOutline: hull(5.55, 2.86, 1.35, 0.76, 1.45, 0.9, 0.18, 8),
  turret: turret(0.4, [[-1.15, 0.65], [-0.9, 0.98], [-0.1, 1.1], [0.7, 1.02], [1.1, 0.65], [1.25, 0.3]], [[-1.15, 0.32], [-0.7, 0.62], [0.0, 0.74], [0.7, 0.6], [1.25, 0.22]], 2.4, 1.1), guns: [{ mount: 'turret', length: 4.4, calibre: 0.085, extractor: 0.85, at: 0.4 }], addOns: [ringOf(1.75)] };
// Strv 74 (1958; the Strv m/42's hull, about 6.1 x 2.43 m, 3.0 m: estimates): a narrow hull on six road wheels with
// return rollers, the tall rounded turret with its long bustle and the long 75 mm with its brake.
G['strv-74'] = { cls: 'light-tank', chassis: 'tracked', length: 6.1, width: 2.43, hullHeight: 1.75, roadWheels: 6, roadWheelRadius: 0.27, trackProfile: run(5.9, 0.85, [2.95, 0.58], [-2.95, 0.62], -2.35, 2.35), running: { wheels: [-2.15, -1.3, -0.45, 0.4, 1.25, 2.1], rollers: [-1.7, -0.6, 0.6, 1.7] }, hullOutline: { top: [[-3.05, 1.5], [-2.9, 1.75], [1.3, 1.75], [3.05, 1.0]], bottom: [[-3.05, 0.85], [2.8, 0.8], [3.05, 1.0]], plan: [[-3.05, 1.2], [3.05, 1.15]], round: 12, stations: 12 },
  turret: turret(-0.1, [[-1.75, 0.85], [-1.4, 1.1], [0.6, 1.2], [1.2, 0.95], [1.4, 0.55]], [[-1.75, 0.95], [-1.3, 1.15], [0.5, 1.25], [1.4, 0.75]], 4, 1.35), guns: [{ mount: 'turret', length: 4.5, calibre: 0.075, muzzle: true, at: 0.5 }], addOns: [ringOf(1.8, 0.4), td(-0.6, 0.5, 1.32, 0.5, 0.2)] };
// FV4101 Charioteer (1952; the Cromwell's hull, 6.4 x 3.05 m, 2.6 m): five big Christie wheels, the big thin-walled
// slab-sided turret with its flat roof, the long 20-pounder with its evacuator.
G['charioteer'] = { cls: 'tank-destroyer', chassis: 'tracked', length: 6.4, width: 3.05, hullHeight: 1.75, roadWheels: 5, roadWheelRadius: 0.41, trackProfile: [[-2.35, 0], [2.3, 0], [3.15, 0.55], [2.82, 1.0], [-2.82, 1.0], [-3.15, 0.6]], running: { wheels: [-2.05, -1.03, 0, 1.03, 2.05] }, hullOutline: { top: [[-3.2, 1.3], [-3.1, 1.72], [2.75, 1.75], [2.85, 1.35], [3.2, 1.1]], bottom: [[-3.2, 1.0], [3.2, 1.0]], plan: [[-3.2, 1.45], [3.2, 1.45]], round: 14, stations: 12 },
  turret: turret(-0.1, [[-1.55, 1.15], [-1.4, 1.3], [0.8, 1.3], [1.15, 1.1], [1.25, 0.6]], [[-1.55, 0.82], [-1.4, 0.9], [0.9, 0.92], [1.25, 0.7]], 14, 1.25), guns: [{ mount: 'turret', length: 4.4, calibre: 0.084, extractor: 0.6, at: 0.5 }] };
// FV4004 Conway (1951; the Centurion Mk 3's hull, 7.82 x 3.39 m, about 3.6 m: estimate): the very tall slab-sided box
// turret on the Centurion, its 120 mm L1 with the evacuator.
G['conway'] = { ...base('centurion'), cls: 'tank-destroyer', turret: turret(-0.4, [[-1.8, 1.3], [-1.6, 1.5], [0.9, 1.55], [1.4, 1.35], [1.5, 0.75]], [[-1.8, 1.45], [-1.6, 1.6], [1.0, 1.6], [1.5, 1.1]], 14, 1.45), guns: [{ mount: 'turret', length: 6.6, calibre: 0.12, extractor: 0.55, at: 0.55 }], cupola: false, addOns: [td(-0.8, 0.75, 1.72, 0.6, 0.25)] };
// AMX-30 AuF1 (1977; the AMX-30's hull, 6.7 x 3.15 m, 3.25 m): the big box turret over the middle with its flat sides and
// back, the 155 mm GCT with its brake and evacuator, the 7.62 mm on the roof.
G['amx-30-auf1'] = { ...base('amx-30'), cls: 'sp-artillery', length: 6.7, width: 3.15, cupola: false, turret: turret(-0.4, [[-2.0, 1.45], [1.6, 1.55], [2.0, 1.2], [2.1, 0.65]], [[-2.0, 1.45], [1.6, 1.55], [2.1, 1.0]], 14, 2.05), guns: [{ mount: 'turret', length: 6.2, calibre: 0.155, muzzle: true, extractor: 0.55, at: 0.5, elevation: 0.05 }], addOns: [td(-0.6, 0.85, 1.65, 0.5, 0.2)] };
// Palmaria (1982; on the OF-40's hull, about 7.4 x 2.35 m tracks 3.0 m, 2.87 m: estimates): a long hull on seven road wheels, the
// big turret with its long sloped front and rear magazine, the 155 mm L/41 with its brake and evacuator.
G['palmaria'] = { ...G['otomatic'], cls: 'sp-artillery', turret: turret(-0.8, [[-2.3, 1.35], [-2.0, 1.5], [1.2, 1.55], [2.0, 1.1], [2.2, 0.6]], [[-2.3, 1.15], [-2.0, 1.25], [1.2, 1.25], [2.2, 0.65]], 12, 2.15), guns: [{ mount: 'turret', length: 6.4, calibre: 0.155, muzzle: true, extractor: 0.5, at: 0.45, elevation: 0.04 }], addOns: [td(-0.8, 0.8, 1.35, 0.5, 0.2)] };
// Sholef (1984; the Merkava Mk 1's hull, 7.45 x 3.72 m, about 3.4 m: estimates): the huge slab-sided turret over the back,
// the 155 mm L/52 with its brake reaching far past the nose.
G['sholef'] = { ...G['merkava-mk1'], cls: 'sp-artillery', turret: turret(-1.0, [[-2.6, 1.55], [1.4, 1.65], [2.2, 1.3], [2.4, 0.7]], [[-2.6, 1.55], [1.4, 1.65], [2.4, 1.1]], 14, 2.35), guns: [{ mount: 'turret', length: 8.0, calibre: 0.155, muzzle: true, extractor: 0.5, at: 0.5, elevation: 0.04 }], addOns: [] };
// Bandkanon 1C (1967; about 6.55 x 3.37 m, 3.85 m: estimates): the huge armoured superstructure over the back on Strv 103
// running gear - six road wheels - with the 155 mm L/50 and its brake far forward and the clip magazine at its back.
G['bkan-1c'] = { cls: 'sp-artillery', chassis: 'tracked', length: 6.55, width: 3.37, hullHeight: 1.55, roadWheels: 6, roadWheelRadius: 0.36, trackProfile: run(6.4, 0.9, [3.2, 0.6], [-3.2, 0.65], -2.6, 2.55), running: { wheels: [-2.35, -1.42, -0.48, 0.48, 1.42, 2.35] }, hullOutline: hull(6.55, 3.37, 1.55, 0.92, 1.4, 1.0, 0.1, 10),
  turret: turret(-1.4, [[-2.0, 1.6], [1.6, 1.68], [2.0, 1.3], [2.1, 0.8]], [[-2.0, 2.3], [1.4, 2.3], [2.1, 1.7]], 14, 2.05), guns: [{ mount: 'turret', length: 7.75, calibre: 0.155, muzzle: true, at: 0.62, elevation: 0.03 }], addOns: [tb(-2.35, 0, 1.2, 0.9, 2.8, 1.8)] };
// AMX-10P (1973; 5.78 x 2.78 m, 2.57 m): the boxy amphibious hull with its long sloped glacis on five road wheels and
// three rollers, the small Toucan turret with the 20 mm on the roof's left of centre.
G['amx-10p'] = { cls: 'ifv', chassis: 'tracked', length: 5.78, width: 2.78, hullHeight: 1.9, roadWheels: 5, roadWheelRadius: 0.32, trackProfile: run(5.6, 0.88, [2.8, 0.62], [-2.8, 0.62], -2.25, 2.2), running: { wheels: [-2.0, -1.0, 0, 1.0, 2.0], rollers: [-1.0, 0, 1.0] }, hullOutline: { top: [[-2.89, 1.8], [-2.75, 1.9], [0.6, 1.9], [2.89, 0.95]], bottom: [[-2.89, 0.85], [2.6, 0.8], [2.89, 0.95]], plan: [[-2.89, 1.38], [2.89, 1.32]], round: 12, stations: 12 },
  turret: turret(0.1, [[-0.75, 0.6], [-0.55, 0.72], [0.45, 0.72], [0.75, 0.5]], [[-0.75, 0.55], [0.45, 0.62], [0.75, 0.42]], 8, 0.7, { side: -0.3 }), guns: [{ mount: 'turret', length: 2.0, calibre: 0.02, at: 0.5 }] };
// AMX ELC bis (1955; about 4.0 x 2.25 m, 1.6 m: estimates): the tiny air-portable hunter on four road wheels, the low
// oscillating turret set at the back with its 90 mm reaching well past the bow.
G['elc-bis'] = { cls: 'light-tank', chassis: 'tracked', length: 4.0, width: 2.25, hullHeight: 1.0, roadWheels: 4, roadWheelRadius: 0.3, trackProfile: run(3.9, 0.72, [1.95, 0.5], [-1.95, 0.5], -1.4, 1.4), running: { wheels: [-1.3, -0.43, 0.43, 1.3] }, hullOutline: hull(4.0, 2.25, 1.0, 0.68, 1.4, 0.75, 0.08, 8),
  turret: collar(-0.6, 0.85, 0.28), turrets: [flUpper(-0.75, 2.4, 0.85, 0.45, 0.22)], guns: [{ mount: 'turret', turret: 1, length: 3.6, calibre: 0.09, muzzle: true, at: 0.6 }] };
// Type 60 SPRG (1960; 4.3 x 2.23 m, 1.38 m): the tiny low carrier on five road wheels, the two 106 mm M40 recoilless
// rifles side by side on their raising mount on the right, with the spotting rifle above.
G['type-60-sprg'] = { cls: 'tank-destroyer', chassis: 'tracked', length: 4.3, width: 2.23, hullHeight: 1.1, roadWheels: 5, roadWheelRadius: 0.24, trackProfile: run(4.15, 0.7, [2.08, 0.5], [-2.08, 0.5], -1.65, 1.6), running: { wheels: [-1.5, -0.75, 0, 0.75, 1.5] }, hullOutline: { top: [[-2.15, 1.0], [-2.05, 1.1], [0.9, 1.1], [2.15, 0.65]], bottom: [[-2.15, 0.55], [1.9, 0.5], [2.15, 0.65]], plan: [[-2.15, 1.05], [2.15, 1.0]], round: 12, stations: 10 },
  addOns: [hb(-0.3, 0.55, 1.2, 0.5, 0.5, 0.25, DARK), ...[0.42, 0.72].map((s) => rod([-1.9, s, 1.3], [1.5, s, 1.3], 0.17, MT)), rod([-1.0, 0.57, 1.5], [1.0, 0.57, 1.5], 0.07, MT), hb(0.9, -0.5, 1.2, 0.5, 0.5, 0.25)] };
// Type 60 ATM (1964; the Type 60 carrier family, about 4.3 x 2.2 m: estimates): the small low carrier with its KAM-3D
// missiles on rails, two each side of the raised launcher frame.
G['type-60-atm'] = { ...G['type-60-sprg'], cls: 'atgm', addOns: [hb(-0.5, 0, 1.25, 1.2, 1.6, 0.3), ...[-1, 1].flatMap((s) => [s * 0.45, s * 0.75].map((y) => beam([-0.9, y, 1.45], 0.15, 1.0, 0.12, 0.12, LT)))] };
// BTR-152 (1950; the 6x6 armoured lorry, 6.55 x 2.32 m, 2.04 m): the long bonnet and the open box body on three axles;
// BTR-152A with the ZPTU-2 twin 14.5 mm mount in the body, BTR-152D with the four-barrelled ZPTU-4.
const BTR152: GroundSpec = { chassis: 'wheeled', length: 6.55, width: 2.32, hullHeight: 2.0, axles: 3, axleAt: [0.72, -0.32, -0.7], wheelRadius: 0.5, hullOutline: { top: [[-3.27, 1.95], [-3.1, 2.0], [0.9, 2.0], [1.3, 1.65], [3.0, 1.55], [3.27, 1.3]], bottom: [[-3.27, 0.8], [3.27, 0.8]], plan: [[-3.27, 1.12], [0.9, 1.16], [1.3, 0.8], [3.27, 0.7]], round: 12, stations: 12 }, openTop: true };
G['btr-152a'] = { ...BTR152, cls: 'spaa', turret: turret(-1.0, circle6(0.75), [[-0.75, 0.45], [0.75, 0.45]], 4, 0.6, { up: -0.4 }), guns: [{ mount: 'turret', count: 2, spread: 0.3, length: 1.6, calibre: 0.0145, elevation: 0.3, at: 0.9 }] };
G['btr-152d'] = { ...BTR152, cls: 'spaa', turret: turret(-1.0, circle6(0.8), [[-0.8, 0.5], [0.8, 0.5]], 4, 0.6, { up: -0.4 }), guns: [{ mount: 'turret', count: 4, spread: 0.3, length: 1.6, calibre: 0.0145, elevation: 0.3, at: 1.0 }] };
// R3 T20 FA-HS (1980s; the R3 Capraia 4x4): the small scout car with a one-man turret and its 20 mm.
G['r3-t20'] = { ...G['r3-t106'], addOns: undefined, turret: turret(-0.6, [[-0.6, 0.5], [-0.45, 0.6], [0.4, 0.6], [0.6, 0.42]], [[-0.6, 0.42], [0.4, 0.5], [0.6, 0.35]], 6, 0.6), guns: [{ mount: 'turret', length: 1.8, calibre: 0.02, at: 0.5 }] };
// Type 59 rebuilds (on the Type 59's hull, 6.2 x 3.27 m): ZTZ59A (1980s) the 105 mm with its evacuator and thermal sleeve,
// the laser rangefinder's box over the mantlet and a stowage rack round the turret's back; ZTZ59D1 (1990s) adds the
// wedge of FY-1 bricks round the turret's front and rows on the glacis, and rubber skirts; Type 69-II G (1982) the 100 mm
// smoothbore with its evacuator near the muzzle, the rangefinder box, flat skirts and the bustle rack.
const T59 = base('t-55a');
const GUN_59_105: GunSpec = { mount: 'turret', length: 5.4, calibre: 0.105, sleeve: 0.6, extractor: 0.6, at: 0.4 };
const T59_RF = tb(1.15, 0, 0.88, 0.45, 0.6, 0.25, DARK);
const T59_RACK = tb(-1.45, 0, 0.3, 0.35, 2.0, 0.35, DARK);
const T59_SKIRT: P2[] = [[-2.9, 0.48], [2.6, 0.48], [2.75, 0.82], [-2.9, 0.82]];
G['ztz-59a'] = { ...T59, guns: [GUN_59_105], addOns: [ringOf(2.0), T59_RF, T59_RACK] };
const FY_TURRET: AddOn[] = [...[[1.15, 0.6, -0.35], [0.8, 0.95, -0.7], [0.35, 1.2, -1.0]].map(([x, s, yaw]) => tb(x, s, 0.42, 0.55, 0.22, 0.32, { ...M, yaw, pitch: -0.25 })), tb(0.75, 0.42, 0.72, 0.5, 0.4, 0.12, { ...M, pitch: -0.4 })];
G['ztz-59d1'] = { ...T59, skirts: true, skirt: T59_SKIRT, guns: [GUN_59_105], addOns: [ringOf(2.0), T59_RF, T59_RACK, ...FY_TURRET, ...glacis(6.2, 1.45, 1.6, 0.95, 0.12, 2.6, 2, 4)] };
G['type-69-2'] = { ...T59, skirts: true, skirt: T59_SKIRT, guns: [{ mount: 'turret', length: 5.4, calibre: 0.1, extractor: 0.85, at: 0.4 }], addOns: [ringOf(2.0), T59_RF, T59_RACK] };
// ZTZ-88 (1988; hull 6.33 x 3.37 m, 2.29 m): the Type 80 family's hull on six road wheels with return rollers under flat
// skirts, a larger rounded cast turret, the 105 mm with its evacuator; 88B the same outline with its sleeve.
G['ztz-88'] = { cls: 'mbt', chassis: 'tracked', length: 6.33, width: 3.37, hullHeight: 1.45, roadWheels: 6, roadWheelRadius: 0.32, skirts: true, skirt: [[-3.0, 0.5], [2.75, 0.5], [2.9, 0.86], [-3.0, 0.86]], trackProfile: run(6.15, 0.86, [3.08, 0.62], [-3.08, 0.66], -2.55, 2.5), running: { wheels: [-2.3, -1.4, -0.5, 0.4, 1.3, 2.2], rollers: [-1.4, 0, 1.4] }, hullOutline: hull(6.33, 3.37, 1.45, 0.86, 1.6, 0.95, 0.2),
  turret: turret(0.35, [[-1.45, 0.78], [-1.1, 1.18], [-0.1, 1.35], [0.85, 1.25], [1.3, 0.8], [1.45, 0.38]], [[-1.45, 0.35], [-0.9, 0.66], [0.0, 0.8], [0.85, 0.64], [1.45, 0.25]], 2.4, 1.35), guns: [GUN_59_105], addOns: [ringOf(2.1), T59_RF, T59_RACK] };

// ---------------------------------------------------------------- Tor, Buk, Osa, Strela, Kub and the Shilka's kin by their own outline

/** A slab on the turret: `poly` in its plane about `at` (turret frame), `t` thick. */
const ts = (at: V3, poly: P2[], t: number, plane: AddOn['plane'] = 'front', o: Opt = {}): AddOn => ({ on: 'turret', kind: 'slab', at, size: [t, 0, 0], poly, plane, ...o });
const TOR = G['9k330-tor'];
// 9A331 Tor-M1 (1991; on the GM-355, 7.5 x 3.3 m, 5.1 m with the antenna up): the Tor's tall turret with the TV-optical
// tracker's box added on the roof's front left and the IFF bar along the top of the search antenna.
G['9a331-tor-m1'] = { ...TOR, addOns: [...TOR.addOns!, tb(0.95, -0.8, 1.8, 0.5, 0.45, 0.32, DARK), { on: 'turret', kind: 'box', at: [-1.62, 0, 3.12], size: [0.12, 2.5, 0.12], paint: 'light' }] };
// 9A331M Tor-M2 (2008; on the GM-5955, about 7.6 x 3.3 m, 5.3 m: estimates): a wider, flat-roofed turret for sixteen
// missiles, the search antenna a flat phased array leaning back on its post, the tracking array a bigger flat face.
G['9a331-tor-m2'] = { ...TOR, length: 7.6, turret: turret(-0.4, [[-1.6, 1.15], [-1.4, 1.27], [1.3, 1.27], [1.55, 1.05]], [[-1.6, 1.58], [-1.4, 1.72], [1.0, 1.72], [1.55, 1.05]], 12, 1.45), addOns: [
  ts([1.33, 0, 0.75], chamfer(0.72, 0.62, 0.1), 0.3, 'front', { pitch: 0.5, paint: 'light' }), { on: 'turret', kind: 'box', at: [-1.2, 0, 2.0], size: [0.55, 0.9, 0.6], metal: true },
  ts([-1.5, 0, 2.75], rect(1.55, 0.6), 0.25, 'front', { pitch: -0.3, paint: 'light' }), { on: 'turret', kind: 'box', at: [0.25, 0, 1.75], size: [1.9, 2.2, 0.05], metal: true }, tb(1.0, -0.85, 1.86, 0.5, 0.45, 0.3, DARK),
] };
// 9A310 Buk TELAR (1980; on the GM-569, 9.3 x 3.25 m, 3.8 m): the long hull on six road wheels, the flat turret with the
// round Fire Dome radar housing on its front, the four 9M38 (5.55 m) lying on the launcher's rails above it, their noses
// just behind the radar and their tails overhanging the hull's back.
const M9M38: Msl = { len: 5.55, d: 0.4, nose: 0.9, fins: [[1.0, 3.6, 2.2, 3.1, 0.24, 'x'], [0.0, 0.55, 0.0, 0.3, 0.42, 'x']] };
const BUK_T = turret(-0.8, [[-1.6, 1.05], [-1.3, 1.25], [1.1, 1.25], [1.4, 1.0]], [[-1.6, 0.72], [-1.3, 0.82], [1.1, 0.82], [1.4, 0.62]], 12, 1.4);
const BUK_RAIL = [beam([-4.3, 0, 2.62], 0.03, 4.5, 2.7, 0.12, DARK), ...[-1, 1].map((s) => rod([-1.6, s * 0.8, 2.45], [-1.6, s * 0.8, 2.62], 0.2, MT))];
const BUK_4 = [-1.2, -0.42, 0.42, 1.2].flatMap((y) => missile([-5.0, y, 2.9], 0.03, M9M38));
G['9a310-buk-telar'] = { ...BUK, turret: BUK_T, radars: undefined, missiles: undefined, addOns: [
  { on: 'turret', kind: 'blob', at: [1.75, 0, 0.95], size: [0.95, 1.9, 1.55], shade: 0.95 }, ts([2.2, 0, 0.95], ellipse(0.8, 0.65, 16), 0.06, 'front', { curve: 0.12, paint: 'light' }), ...BUK_RAIL, ...BUK_4,
] };
// 9A317 Buk-M2 (2008): the Fire Dome replaced by the tall flat phased-array antenna standing on the turret's front.
G['buk-m2-9a317'] = { ...G['9a310-buk-telar'], addOns: [ts([1.6, 0, 1.25], chamfer(1.0, 0.95, 0.15), 0.35, 'front', { pitch: 0.15 }), ts([1.8, 0, 1.25], rect(0.85, 0.8), 0.04, 'front', { pitch: 0.15, paint: 'light' }), ...BUK_RAIL, ...BUK_4] };
// 9A317M Buk-M3 (2016): the M2's phased array, and six 9M317M in closed canisters, two rows of three, over the turret.
G['buk-m3-9a317m'] = { ...G['buk-m2-9a317'], addOns: [...G['buk-m2-9a317'].addOns!.slice(0, 2), ...BUK_RAIL, ...[2.75, 3.3].flatMap((u) => [-0.6, 0, 0.6].map((y) => beam([-4.6, y, u], 0.03, 5.9, 0.52, 0.52)))] };
// 9A33BM3 Osa-AKM (1980; the BAZ-5937 amphibian, 9.14 x 2.75 m, 4.2 m): the turret's low round base, three missile
// canisters stacked on each side, the tracking dish on the front with its two small dishes, the folding search antenna on
// its post at the back of the roof.
const OSA_T = turret(-0.4, circle6(1.0), [[-1.0, 0.55], [-0.6, 0.75], [0.6, 0.75], [1.0, 0.55]], 4, 1.0);
const OSA_RADARS: AddOn[] = [
  ts([1.15, 0, 1.25], ellipse(0.55, 0.55, 16), 0.1, 'front', { curve: 0.15, paint: 'light' }), ...[-1, 1].map((s) => ts([1.05, s * 0.75, 0.95], ellipse(0.18, 0.18, 10), 0.08, 'front', { paint: 'light' })),
  { on: 'turret', kind: 'tube', at: [-0.5, 0, 0.7], to: [-0.5, 0, 1.75], size: [0.35, 0.3, 0], metal: true }, ts([-0.65, 0, 2.05], rect(1.2, 0.4), 0.15, 'front', { pitch: -0.4, curve: 0.25, paint: 'light' }),
];
G['9a33-osa'] = { ...OSA, turret: OSA_T, radars: undefined, missiles: undefined, addOns: [...OSA_RADARS, ...[-1, 1].flatMap((s) => [0.6, 0.92, 1.24].map((u) => tb(-0.1, s * 1.3, u, 3.2, 0.3, 0.3, { pitch: 0.1 })))] };
// 9A33BM2 Osa-AK (1975): the same turret with four 9M33 bare on their rails, two each side.
const M9M33: Msl = { len: 3.16, d: 0.21, nose: 0.4, fins: [[2.45, 2.7, 2.5, 2.62, 0.17, 'x'], [0.05, 0.6, 0.1, 0.38, 0.3, 'x']] };
G['9a33bm2-osa'] = { ...OSA, turret: OSA_T, radars: undefined, missiles: undefined, addOns: [...OSA_RADARS, ...[-1, 1].flatMap((s) => [tb(-0.4, s * 1.25, 0.95, 2.4, 0.12, 0.6, DARK), ...[0.75, 1.2].flatMap((u) => missile([-2.0, s * 1.35, 2.0 + u], 0.1, M9M33))])] };
// 9P31 Strela-1 (1968; on the BRDM-2, 5.75 x 2.37 m, 2.3 m): no machine-gun turret - a small pedestal over the middle with
// two square missile canisters each side on its arms, laid level for travel.
G['9p31-strela-1'] = { ...AD('9p31-strela-1'), turret: turret(-0.2, circle6(0.45), [[-0.45, 0.35], [0.45, 0.35]], 4, 0.45), missiles: undefined, addOns: [...[-1, 1].flatMap((s) => [tb(0.0, s * 0.52, 0.4, 0.3, 0.22, 0.35, DARK), ...[0.22, 0.48].map((d) => tb(0.1, s * (0.6 + d), 0.55, 2.0, 0.24, 0.24))])] };
// 9A35 Strela-10 (1976; on the MT-LB, 6.6 x 2.85 m, 3.8 m): the turret over the back with its round-fronted body, the
// four big square canisters on their frame two each side, the ranging radar's horns on the turret front.
G['9a35-strela-10'] = { ...AD('9a35-strela-10'), boxes: undefined, missiles: undefined, turret: turret(-1.4, [[-0.75, 0.6], [-0.55, 0.72], [0.45, 0.72], [0.75, 0.5]], [[-0.75, 0.72], [-0.5, 0.8], [0.5, 0.8], [0.75, 0.6]], 6, 0.75),
  addOns: [hb(2.3, 0, 1.8, 1.5, 2.4, 0.35), ...[-1, 1].flatMap((s) => [tb(0.0, s * 0.82, 0.75, 0.45, 0.14, 0.7, DARK), ...[0.15, 0.5].map((d) => tb(0.1, s * (0.95 + d), 0.95, 2.25, 0.34, 0.34))]), ...[-1, 1].map((s) => tb(0.85, s * 0.3, 0.55, 0.35, 0.25, 0.25, DARK))] };
// 2P25 Kub TEL (1967; on the GM-578, 7.39 x 3.18 m, 3.45 m): the turntable over the back holding three 3M9 (5.8 m) side by
// side on their rails, each with its big cruciform mid-wings and tail fins.
const M3M9: Msl = { len: 5.8, d: 0.335, nose: 0.8, fins: [[2.3, 3.9, 3.0, 3.6, 0.42, 'x'], [0.0, 0.7, 0.05, 0.4, 0.5, 'x']] };
G['2p25-kub-tel'] = { ...AD('2p25-kub-tel'), turret: undefined, missiles: undefined, addOns: [hd(-1.4, 0, 1.75, 1.7, 0.3, DARK), beam([-3.6, 0, 1.9], 0.12, 4.6, 2.2, 0.15, DARK), ...[-0.85, 0, 0.85].flatMap((y) => missile([-4.0, y, 2.35], 0.12, M3M9))] };
// 2K22 Tunguska: the turret's own outline - slab sides and a sloped front - with the search antenna leaning back on its
// post over the rear and the round tracking dish on the front.
G['2k22-tunguska'] = { ...G['2k22-tunguska'], radars: undefined, turret: turret(0.2, [[-1.7, 1.12], [-1.45, 1.25], [1.2, 1.25], [1.7, 0.95]], [[-1.7, 1.0], [-1.45, 1.1], [1.1, 1.1], [1.7, 0.7]], 12, 1.7), addOns: [
  { on: 'turret', kind: 'tube', at: [-1.3, 0, 1.05], to: [-1.3, 0, 1.45], size: [0.3, 0.25, 0], metal: true }, ts([-1.35, 0, 1.75], rect(1.15, 0.35), 0.15, 'front', { pitch: -0.35, curve: 0.15, paint: 'light' }),
  ts([1.75, 0, 0.85], ellipse(0.45, 0.45, 14), 0.1, 'front', { curve: 0.1, paint: 'light' }),
] };
// 9S470 Buk command post (on the GM-579, 9.0 x 3.25 m, about 3.3 m: estimate): the tall equipment cabin over most of the
// hull, its whip antennas, the small sight cupola at the front.
G['9s470-buk-cp'] = { ...AD('9s470-buk-cp'), boxes: undefined, radars: undefined, addOns: [kung(-4.3, 1.5, 3.0, 1.55, 3.3), ...[-1, 1].map((s) => rod([-3.8, s * 1.2, 3.3], [-3.8, s * 1.2, 5.0], 0.05, MT)), hd(2.3, 0.8, 1.75, 0.5, 0.3, DARK)] };
// 9S18M1 Snow Drift (on the GM-567, 9.6 x 3.25 m; antenna about 6.4 x 1.9 m: estimate): the equipment cabin, the wide
// curved search antenna raised high on its mast over the back half, leaning back.
G['9s18-snow-drift'] = { ...AD('9s18-snow-drift'), boxes: undefined, radars: undefined, addOns: [kung(-4.6, 0.6, 3.0, 1.55, 2.95), hd(-2.0, 0, 3.05, 1.3, 0.2, DARK), rod([-2.0, 0, 3.0], [-2.0, 0, 5.1], 0.35, MT), sl([-2.15, 0, 5.85], rect(3.2, 0.95), 0.25, 'front', { pitch: -0.35, curve: 0.45, ...LT })] };
// 1S91 Straight Flush (on the GM-578, 7.39 x 3.18 m, about 4.6 m with the antennas up): the round turret over the back,
// the tracking dish on its front and the search antenna's curved trough on a post above it.
G['1s91-straight-flush'] = { ...AD('1s91-straight-flush'), turret: turret(-0.8, circle6(1.0), [[-1.0, 0.55], [-0.6, 0.75], [0.6, 0.75], [1.0, 0.55]], 4, 1.0), radars: undefined, addOns: [
  ts([0.95, 0, 1.3], ellipse(0.85, 0.85, 16), 0.12, 'front', { curve: 0.2, paint: 'light' }), { on: 'turret', kind: 'tube', at: [-0.1, 0, 0.75], to: [-0.1, 0, 2.2], size: [0.25, 0.2, 0], metal: true }, ts([-0.1, 0, 2.6], rect(1.6, 0.45), 0.15, 'front', { pitch: -0.2, curve: 0.3, paint: 'light' }),
] };
// ZSU-23-4M4 (2012): the Shilka with the bigger electronics box on the turret's back and two Igla launch tubes on each side.
G['zsu-23-4m4'] = { ...G['zsu-23-4m4'], missiles: [{ mount: 'turret-side', rows: 1, cols: 2, length: 1.7, diameter: 0.1, elevation: 0.2, up: 0.85 }] };

// ---------------------------------------------------------------- War Thunder ids with figures of their own (round 2)

/**
 * A weapon on a pedestal on a truck's bed at (x, u): the column `h` high, `n` barrels side by side `spread` apart, `len`
 * long and `d` thick, raised `e`, and a shield `shield` wide in front when given.
 */
function bedMount(x: number, u: number, h: number, n: number, len: number, d: number, e = 0.3, spread = 0.2, shield = 0): AddOn[] {
  const top = u + h;
  // The head turns on the column with its shield, the barrels elevating about where they leave it.
  const m: AddOnMount = { at: [x, 0, top - 0.175], trunnion: [x - 0.25, 0, top + 0.08], pitch: e };
  const out: AddOn[] = [hd(x, 0, u + 0.1, 0.6, 0.2, DARK), rod([x, 0, u + 0.2], [x, 0, top - 0.15], 0.25, MT), ...onMount(m, [hb(x, 0, top, 0.6, 0.3 + spread * (n - 1), 0.35, DARK)])];
  for (let i = 0; i < n; i++) {
    const p: V3 = [x - 0.25, (i - (n - 1) / 2) * spread, top + 0.08];
    out.push(...onMount(m, [rod(p, along(p, e, len), Math.max(0.07, d), MT)], true));
  }
  if (shield > 0) out.push(...onMount(m, [sl([x + 0.4, 0, top + 0.1], rect(shield / 2, 0.45), 0.05, 'front', DARK)]));
  return out;
}

// T95E1 (1957; hull about 6.3 x 3.15 m, 2.85 m): the T95's hull with a longer, more pointed cast turret, no rangefinder,
// the long 90 mm T208 smoothbore with its bore evacuator.
G['t95e1'] = { ...G['t95-medium'], turret: turret(0.1, [[-1.75, 0.8], [-1.3, 1.25], [0.2, 1.35], [1.3, 1.0], [1.85, 0.4]], [[-1.75, 0.45], [-1.1, 0.75], [0.2, 0.82], [1.3, 0.55], [1.85, 0.3]], 2.4, 1.8), guns: [{ mount: 'turret', length: 5.2, calibre: 0.09, extractor: 0.55, at: 0.45 }] };
// Teledyne AGS / Expeditionary Tank (1984; 7.0 x 3.6 m, 2.8 m): the engine in front under a long glacis, the crew in the
// hull, a small low turret far back with the 105 mm riding on top of it in its cradle with the autoloader.
G['ags-teledyne'] = { cls: 'light-tank', chassis: 'tracked', length: 7.0, width: 3.6, hullHeight: 1.55, roadWheels: 6, roadWheelRadius: 0.33, skirts: true, trackProfile: run(6.8, 0.9, [3.4, 0.6], [-3.4, 0.62], -2.8, 2.75), hullOutline: hull(7.0, 3.6, 1.55, 0.85, 2.4, 0.95, 0.1),
  turret: turret(-1.6, [[-1.0, 0.8], [-0.8, 1.0], [0.7, 1.0], [1.0, 0.7]], [[-1.0, 0.45], [0.8, 0.5], [1.0, 0.35]], 8, 0.55), guns: [{ mount: 'turret', length: 5.0, calibre: 0.105, extractor: 0.6, muzzle: true, at: 1.55 }],
  addOns: [tb(0.2, 0, 0.75, 2.2, 0.6, 0.45), tb(-0.6, 0, 0.62, 0.7, 0.4, 0.3, DARK)] };
// Turm III (1966; Leopard 1 hull, 7.09 x 3.37 m): Rheinmetall's big, low, rounded three-axis-stabilised turret with the
// 105 mm L7 and a 20 mm cannon beside it.
G['turm-iii'] = { cls: 'mbt', ...LEO1, turret: turret(-0.3, [[-2.1, 1.0], [-1.6, 1.5], [0.6, 1.6], [1.5, 1.25], [2.0, 0.6]], [[-2.1, 0.45], [-1.4, 0.72], [0.6, 0.78], [1.6, 0.55], [2.0, 0.38]], 3, 1.95), guns: [{ mount: 'turret', length: 5.3, calibre: 0.105, sleeve: 0.6, extractor: 0.55, at: 0.45 }], addOns: [barrel(1.6, 0.6, 0.38, 1.7, 0.08)] };
// Class 3 (P) (1980s; Henschel TH 800 family; about 7.9 x 3.05 m, 2.8 m: estimates): a big 8x8 with the engine at the
// back and a large turret with the 105 mm GT-3.
G['class-3-p'] = { cls: 'tank-destroyer', chassis: 'wheeled', length: 7.9, width: 3.05, hullHeight: 2.0, axles: 4, axleAt: [0.72, 0.38, -0.3, -0.66], wheelRadius: 0.62, hullOutline: wheeledHull(7.9, 2.0, 1.15, 1.52, 1.9), turret: turret(-0.5, [[-2.0, 1.05], [-1.6, 1.35], [0.8, 1.4], [1.6, 1.05], [1.95, 0.55]], [[-2.0, 0.6], [-1.3, 0.75], [0.8, 0.8], [1.95, 0.5]], 10, 1.9), guns: [{ mount: 'turret', length: 5.2, calibre: 0.105, sleeve: 0.6, extractor: 0.55, muzzle: true, at: 0.45 }], cupola: true };
// TO-55 (1968): the T-55 with the ATO-200 flame gun's muzzle beside the 100 mm in place of the coaxial MG, and the DShK.
G['to-55'] = { ...base('t-55a'), addOns: [tb(1.45, 0.34, 0.33, 0.45, 0.14, 0.14, DARK), tb(-0.3, 0.55, 0.92, 0.9, 0.07, 0.07, DARK)] };
// Object 435 (1961; about 6.0 x 3.3 m, 2.2 m: estimates): a short, dense hull with a sharp glacis, small road wheels with
// rollers, the low cast dome in the middle and the 115 mm with its extractor.
G['object-435'] = { cls: 'mbt', chassis: 'tracked', length: 6.0, width: 3.3, hullHeight: 1.4, roadWheels: 6, roadWheelRadius: 0.28, trackProfile: run(5.85, 0.85, [2.92, 0.58], [-2.92, 0.66], -2.45, 2.4), running: { wheels: [-2.2, -1.35, -0.5, 0.35, 1.2, 2.05], rollers: [-1.5, -0.2, 1.1] }, hullOutline: hull(6.0, 3.3, 1.4, 0.78, 1.8, 0.9, 0.1), turret: turret(0.3, [[-1.3, 0.75], [-1.0, 1.15], [-0.1, 1.3], [0.8, 1.2], [1.3, 0.75], [1.45, 0.4]], [[-1.3, 0.35], [-0.8, 0.62], [0.1, 0.7], [0.9, 0.55], [1.45, 0.28]], 2.2, 1.35), guns: [{ mount: 'turret', length: 5.2, calibre: 0.115, extractor: 0.6, at: 0.42 }], cupola: true };
// T-80UE-1 (2005; 7.0 x 3.6 m, 2.2 m): the T-80BV's hull and turbine deck with the T-80UD's welded turret - flat faces,
// a level roof, the Kontakt-5 wedges squaring its front - and the remote 12.7 mm on the cupola.
G['t-80ue1'] = { cls: 'mbt', ...T80, turret: turret(0.3, [[-1.6, 0.95], [-1.3, 1.4], [0.5, 1.55], [1.5, 1.58], [1.88, 1.12], [1.95, 0.5]], [[-1.6, 0.5], [-1.3, 0.72], [1.4, 0.8], [1.95, 0.52]], 8, 1.85), addOns: [...T80U_ADD, tb(-0.3, 0.6, 1.15, 0.6, 0.35, 0.3, DARK), tb(0.25, 0.6, 1.2, 1.2, 0.06, 0.06, DARK)] };
// Vickers Mk 11 (1990; about 6.5 x 3.2 m, 3.5 m; estimates): the Timoney 6x6's very tall slab-sided hull with the VFM 5
// turret and its low-recoil 105 mm.
G['vickers-mk11'] = { cls: 'tank-destroyer', chassis: 'wheeled', length: 6.5, width: 3.2, hullHeight: 2.5, axles: 3, axleAt: [0.66, 0.0, -0.66], wheelRadius: 0.65, hullOutline: { top: [[-3.25, 2.35], [-3.1, 2.5], [1.6, 2.5], [3.25, 1.6]], bottom: [[-3.25, 0.85], [2.8, 0.85], [3.25, 1.3]], plan: [[-3.25, 1.55], [2.6, 1.6], [3.25, 1.3]], round: 14, stations: 12 }, turret: G['vfm-5'].turret, guns: [{ mount: 'turret', length: 5.0, calibre: 0.105, extractor: 0.55, muzzle: true, at: 0.45 }] };
// TTD (1990; about 7.6 x 3.4 m, 2.4 m; estimates): the South African technology demonstrator - a new hull on six road
// wheels under skirts and a big angular welded turret of flat armour modules, the 105 mm GT-7 with sleeve and extractor.
G['ttd'] = { cls: 'mbt', chassis: 'tracked', length: 7.6, width: 3.4, hullHeight: 1.6, roadWheels: 6, roadWheelRadius: 0.36, skirts: true, trackProfile: run(7.4, 0.95, [3.7, 0.65], [-3.7, 0.72], -3.05, 3.0), hullOutline: hull(7.6, 3.4, 1.6, 0.9, 1.6, 1.1, 0.15), turret: turret(-0.4, [[-2.3, 1.3], [-1.9, 1.6], [1.3, 1.68], [1.85, 1.4], [2.05, 0.8]], [[-2.3, 0.72], [1.5, 0.84], [2.05, 0.62]], 14, 2.0), guns: [{ mount: 'turret', length: 5.4, calibre: 0.105, sleeve: 0.7, extractor: 0.55, at: 0.45 }], cupola: true };
// BTR-3E1 (7.65 x 2.9 m, 2.86 m): the BTR-80-shaped boat hull with the diesel at the back and the BM-3M Shturm-M turret - low
// and flat, the long 30 mm, the grenade launcher on its left and the Barrier missile tubes on its right.
G['btr-3e1'] = { cls: 'apc-wheeled', ...BTR(7.65, 2.9, 2.0, 1.9, [0.6, 0.27, -0.25, -0.58]), turret: turret(0.6, [[-0.9, 0.75], [-0.6, 0.9], [0.55, 0.9], [0.9, 0.6]], [[-0.9, 0.42], [0.5, 0.5], [0.9, 0.32]], 8, 0.85), guns: [{ mount: 'turret', length: 2.9, calibre: 0.03, at: 0.5 }], addOns: [tb(0.2, -1.05, 0.45, 1.2, 0.22, 0.22, DARK), tb(-0.1, 1.08, 0.5, 1.5, 0.26, 0.45)] };
// Mitsubishi CTWV (Type 16 family, about 8.4 x 2.98 m): the Type 24 ICV prototype - the taller troop hull with the engine in
// front and a low unmanned turret with the 30 mm Bushmaster; the Type 25 RCV - a bigger manned turret and the sensor mast.
const CTWV: GroundSpec = { chassis: 'wheeled', length: 8.4, width: 2.98, hullHeight: 2.25, axles: 4, axleAt: [0.75, 0.42, -0.3, -0.68], wheelRadius: 0.62, hullOutline: wheeledHull(8.4, 2.25, 1.25, 1.49, 2.0) };
G['type-24-icv'] = { cls: 'ifv', ...CTWV, turret: turret(-0.6, [[-0.9, 0.7], [-0.7, 0.85], [0.6, 0.85], [0.9, 0.6]], [[-0.9, 0.45], [0.6, 0.5], [0.9, 0.35]], 8, 0.85), guns: [{ mount: 'turret', length: 2.6, calibre: 0.03, at: 0.5 }] };
G['type-25-rcv'] = { cls: 'scout-car', ...CTWV, turret: turret(-0.4, [[-1.2, 0.95], [-0.9, 1.15], [0.7, 1.15], [1.2, 0.8]], [[-1.2, 0.65], [0.7, 0.72], [1.2, 0.5]], 8, 1.2), guns: [{ mount: 'turret', length: 2.6, calibre: 0.03, at: 0.5 }], addOns: [hb(-2.6, -0.9, 3.0, 0.15, 0.15, 1.5, DARK), hb(-2.6, -0.9, 3.85, 0.35, 0.5, 0.3, DARK), hd(-3.3, 0.7, 2.35, 0.5, 0.25, LT)] };
// WZ305 (mid-1980s; about 6.2 x 3.3 m, 2.75 m; estimates): the ZSU-57-2's idea on a Type 69 hull - five big road wheels with
// the gap behind the first, no rollers - the open-topped box turret with the twin 57 mm.
G['wz-305'] = { ...T59, cls: 'spaa', cupola: false, turret: { x: -0.2, length: 3.0, width: 2.9, height: 1.15, shape: 'open' }, guns: [{ mount: 'turret', count: 2, length: 4.0, calibre: 0.057, spread: 0.45, elevation: 0.15, muzzle: true, at: 0.6 }], addOns: undefined, skirts: false };
// Object 122MT (1970s; about 6.5 x 3.3 m, 2.3 m; estimates): a cast dome with the 120 mm and its extractor, two missile
// launchers on each cheek, six road wheels and rollers.
G['object-122mt'] = { cls: 'mbt', chassis: 'tracked', length: 6.5, width: 3.3, hullHeight: 1.45, roadWheels: 6, roadWheelRadius: 0.33, trackProfile: run(6.35, 0.88, [3.15, 0.6], [-3.15, 0.68], -2.6, 2.55), running: { wheels: [-2.35, -1.45, -0.55, 0.35, 1.25, 2.15], rollers: [-1.5, 0, 1.5] }, hullOutline: hull(6.5, 3.3, 1.45, 0.82, 1.7, 0.95, 0.15), turret: turret(0.2, [[-1.45, 0.8], [-1.1, 1.25], [-0.1, 1.4], [0.8, 1.3], [1.35, 0.9], [1.55, 0.4]], [[-1.45, 0.38], [-0.9, 0.68], [0.1, 0.78], [0.9, 0.62], [1.55, 0.28]], 2.3, 1.45), guns: [{ mount: 'turret', length: 5.4, calibre: 0.12, extractor: 0.6, at: 0.42 }],
  addOns: [-1, 1].flatMap((s) => [0.5, 0.72].map((u) => tb(0.9, s * 1.12, u, 1.1, 0.17, 0.17, { metal: true }))), cupola: true };
// Antelope (1997; on a Toyota Dyna cab-over light truck, about 4.7 x 1.9 m, 2.8 m; estimates): the trainable mount on the bed
// with its sensor head and two Sky Sword I rails each side.
G['antelope'] = { cls: 'sam', chassis: 'wheeled', length: 4.7, width: 1.9, hullHeight: 1.0, axles: 2, axleAt: [0.62, -0.5], wheelRadius: 0.36, hull: 'truck', cab: { length: 1.5, height: 2.0, outline: forwardCab(4.7, 1.9, 0.36, 1.5, 2.0, 0.3, 0.55, 8) }, bed: 'none',
  addOns: [...cargo(-2.35, 0.7, 1.85, 0.95, 0.3), hd(-0.9, 0, 1.1, 0.55, 0.3, DARK), hb(-0.9, 0, 1.6, 0.25, 0.25, 0.7, DARK), hb(-0.85, 0, 2.1, 0.55, 0.5, 0.45, DARK), ...[-1, 1].flatMap((s) => [0.4, 0.62].map((d) => hb(-0.7, s * d, 2.2, 2.2, 0.13, 0.13, LT)))] };
// VBC (PT2) (late 1990s; the Centauro's hull, about 7.9 x 3.0 m, 2.9 m): the Freccia's second prototype - the raised troop
// compartment and the Dardo's Hitfist turret with the 25 mm, no missiles.
G['vbc-pt2'] = { cls: 'ifv', ...CENTAURO, length: 7.9, hullOutline: { top: [[-3.95, 2.0], [-3.75, 2.15], [0.9, 2.15], [1.3, 1.9], [3.95, 1.15]], bottom: [[-3.95, 0.65], [3.2, 0.65], [3.95, 1.0]], plan: [[-3.95, 1.42], [3.0, 1.5], [3.95, 1.1]], round: 8, stations: 12 }, hullHeight: 2.15, turret: turret(0.1, [[-1.0, 0.8], [-0.8, 0.95], [0.6, 0.98], [1.0, 0.7]], [[-1.0, 0.55], [0.6, 0.62], [1.0, 0.45]], 8, 1.0), guns: [{ mount: 'turret', length: 2.3, calibre: 0.025, at: 0.5 }], cupola: false };
// Freccia (2007; 8.0 x 3.0 m) under a name of its own: the catalogue's 'freccia' is the Italian destroyer class, which
// took the War Thunder ground ids' target.
G['freccia-ifv'] = { ...G['freccia'] };
// C13/TUA (1982; about 5.9 x 2.8 m, 1.9 m hull): the C13 carrier with the TOW-under-armour box - two missiles - raised on its arm.
G['c13-tua'] = { ...G['c13-t90'], cls: 'atgm', turret: undefined, turrets: undefined, guns: undefined, addOns: [hb(-0.6, 0, 1.95, 0.6, 0.6, 0.3, DARK), hb(-0.6, 0, 2.3, 0.3, 0.25, 0.6, DARK), hb(-0.5, 0, 2.75, 1.5, 1.0, 0.5)] };
// Somua SM (1951; 7.6 x 3.3 m, 3.1 m): a King Tiger-like hull of steep plates on seven big road wheels, not interleaved,
// the two-part oscillating turret with the 100 mm and its brake.
G['somua-sm'] = { cls: 'heavy-tank', chassis: 'tracked', length: 7.6, width: 3.3, hullHeight: 1.95, roadWheels: 7, roadWheelRadius: 0.36, trackProfile: run(7.4, 1.0, [3.7, 0.75], [-3.7, 0.7], -3.0, 2.95), running: { wheels: [-2.85, -1.9, -0.95, 0, 0.95, 1.9, 2.85] }, hullOutline: { top: [[-3.8, 1.4], [-3.5, 1.95], [1.3, 1.95], [3.8, 0.95]], bottom: [[-3.8, 1.0], [3.5, 1.0], [3.8, 0.95]], plan: [[-3.8, 1.62], [3.8, 1.6]], round: 8, stations: 12 },
  turret: turret(-0.2, [[-2.1, 0.9], [-1.6, 1.25], [0.6, 1.3], [1.4, 0.95], [1.7, 0.55]], [[-2.1, 0.85], [-1.5, 1.1], [0.6, 1.15], [1.4, 0.85], [1.7, 0.6]], 6, 1.65), guns: [{ mount: 'turret', length: 4.8, calibre: 0.1, muzzle: true, at: 0.55 }], addOns: [tb(0.0, 0, 0.18, 2.3, 2.2, 0.36), tb(-0.6, 0.7, 1.3, 0.8, 0.06, 0.06, DARK), tb(-0.6, -0.7, 1.3, 0.8, 0.06, 0.06, DARK)] };
// MARS 15 (1990; about 6.0 x 2.8 m, 2.4 m; estimates): Creusot-Loire's light tank, the turret behind the middle with the
// long 90 mm CN90 F4.
G['mars-15'] = { cls: 'light-tank', chassis: 'tracked', length: 6.0, width: 2.8, hullHeight: 1.5, roadWheels: 5, roadWheelRadius: 0.33, skirts: true, trackProfile: run(5.85, 0.88, [2.9, 0.6], [-2.9, 0.62], -2.35, 2.3), hullOutline: hull(6.0, 2.8, 1.5, 0.85, 1.6, 0.95, 0.12), turret: turret(-0.5, [[-1.5, 0.95], [-1.2, 1.15], [0.6, 1.2], [1.3, 0.85], [1.55, 0.5]], [[-1.5, 0.6], [0.6, 0.7], [1.55, 0.48]], 10, 1.5), guns: [{ mount: 'turret', length: 4.3, calibre: 0.09, sleeve: 0.6, at: 0.45 }], cupola: true };
// MSC (1986; Leclerc-sized, 6.9 x 3.7 m, 2.5 m): the Leclerc's running prototype - a plainer slab turret, six smoke tubes on
// the front cheeks (none at the back), the 120 mm with its sleeve and no extractor.
G['msc'] = { ...LECLERC, turret: turret(-0.45, [[-2.2, 1.3], [-1.9, 1.55], [1.4, 1.58], [1.75, 1.3], [1.8, 0.7]], [[-2.2, 0.78], [1.5, 0.86], [1.8, 0.7]], 14, 1.8), guns: [{ mount: 'turret', length: 6.2, calibre: 0.12, sleeve: 0.75, at: 0.45 }], addOns: [tb(1.45, 1.25, 0.92, 0.4, 0.35, 0.25, { ...M, ...DARK, yaw: -0.4 }), { on: 'turret', kind: 'drum', at: [0.6, -0.65, 1.0], size: [0.4, 0.4, 0.3] } as AddOn] };
// ItPsv 90 "Leopard" (Finland; the Leopard 2A4 hull, 7.7 x 3.75 m, about 3.0 m): the Marksman turret - big and flat-sided,
// a 35 mm on each side, the search radar on the back of its roof.
G['itpsv-90'] = { cls: 'spaa', ...LEO2, cupola: false, turret: turret(-0.4, [[-1.8, 1.15], [-1.5, 1.35], [1.0, 1.4], [1.6, 1.1]], [[-1.8, 1.0], [1.0, 1.05], [1.6, 0.7]], 12, 1.4), guns: [{ mount: 'turret-side', count: 1, length: 3.2, calibre: 0.035, elevation: 0.12, at: 0.55 }], radars: [{ kind: 'dish', x: -1.3, up: 0.55, size: 1.1 }, { kind: 'dish', x: 1.2, up: 0.2, size: 0.6 }] };
// UDES 33 (1978; about 4.8 x 2.5 m, 2.0 m; estimates): a small low tracked hull on five road wheels with a TOW launcher raised
// on its arm over the back.
G['udes-33'] = { cls: 'atgm', chassis: 'tracked', length: 4.8, width: 2.5, hullHeight: 1.5, roadWheels: 5, roadWheelRadius: 0.3, trackProfile: run(4.65, 0.8, [2.3, 0.55], [-2.33, 0.55], -1.85, 1.85), running: { wheels: [-1.7, -0.85, 0, 0.85, 1.7] }, hullOutline: { top: [[-2.4, 1.4], [-2.2, 1.5], [0.6, 1.5], [2.4, 0.9]], bottom: [[-2.4, 0.75], [2.0, 0.7], [2.4, 0.9]], plan: [[-2.4, 1.2], [2.4, 1.15]], round: 12, stations: 10 }, addOns: [hb(-0.8, 0, 1.6, 0.6, 0.6, 0.2, DARK), hb(-0.8, 0, 1.78, 0.2, 0.2, 0.3, DARK), hb(-0.7, 0, 1.95, 1.4, 0.3, 0.28)] };
// Strv 121B "Christian II" (Leopard 2A4, 7.72 x 3.75 m, 2.79 m): GALIX launchers on the turret sides in place of the 2A4's
// smoke clusters, a thermal sight's head on the EMES box.
G['strv-121b'] = { ...G['leopard-2a4'], addOns: [tb(1.25, 0.72, 0.9, 0.75, 0.55, 0.16), tb(1.25, 0.72, 1.08, 0.5, 0.42, 0.2, DARK), PERI(0.35), ...[0.2, 0.55].map((x) => tb(x, 1.72, 0.75, 0.3, 0.22, 0.22, { ...M, ...DARK, pitch: 0.5 })), tb(-2.35, 1.05, 0.4, 0.3, 0.6, 0.45, M)] };
// EldE 98 (on the Bv410, about 7.6 x 2.3 m; estimates): the articulated two-car carrier - the front car with the Giraffe 1X
// radar on its mast, the rear car with four IRIS-T in their launcher.
G['elde-98'] = { cls: 'sam', chassis: 'tracked', length: 7.6, width: 2.3, hullHeight: 1.7, roadWheels: 10, roadWheelRadius: 0.2, trackProfile: run(7.5, 0.7, [3.75, 0.45], [-3.75, 0.45], -3.4, 3.4), hullOutline: { top: [[-3.8, 1.6], [-3.7, 1.7], [-0.5, 1.7], [-0.45, 0.9], [0.45, 0.9], [0.5, 2.0], [3.0, 2.0], [3.8, 1.2]], bottom: [[-3.8, 0.65], [3.8, 0.75]], plan: [[-3.8, 1.12], [3.8, 1.1]], round: 10, stations: 16 },
  radars: [{ kind: 'panel', x: 1.4, up: 1.8, size: 1.2, height: 0.9, depth: 0.3, hull: true, mast: 'pole' }], missiles: [{ mount: 'hull', rows: 2, cols: 2, length: 3.0, diameter: 0.25, pod: true, elevation: 0.3, x: -2.0, up: 0.45 }] };
// NOMADS (on the ACSV G5, about 6.1 x 2.9 m, 2.6 m; estimates): an M113-descended carrier with the engine in front, a turntable
// over the back with the radar and sight head and two AIM-9X rails each side.
G['nomads'] = { cls: 'sam', chassis: 'tracked', length: 6.1, width: 2.9, hullHeight: 2.0, roadWheels: 5, roadWheelRadius: 0.33, trackProfile: run(5.95, 0.85, [2.95, 0.6], [-2.98, 0.55], -2.4, 2.35), running: { wheels: [-2.1, -1.05, 0, 1.05, 2.1] }, hullOutline: { top: [[-3.05, 1.95], [-2.95, 2.0], [0.9, 2.0], [3.05, 1.2]], bottom: [[-3.05, 0.8], [2.4, 0.8], [3.05, 1.2]], plan: [[-3.05, 1.42], [3.05, 1.38]], round: 12, stations: 10 },
  turret: { x: -1.0, length: 0.9, width: 0.9, height: 0.5, shape: 'cylinder' }, missiles: [{ mount: 'turret-side', rows: 2, cols: 1, length: 3.0, diameter: 0.13, rail: true, elevation: 0.25, up: 0.45 }], radars: [{ kind: 'panel', x: 0.0, up: 0.75, size: 0.9, height: 0.6, depth: 0.25 }] };
// Hunter AFV (2019; 6.9 x 3.4 m, 3.4 m): a tall hull with the engine in front, six road wheels under skirts, the unmanned
// turret with the 30 mm and the twin Spike box on its side.
G['hunter-afv'] = { cls: 'ifv', chassis: 'tracked', length: 6.9, width: 3.4, hullHeight: 2.4, roadWheels: 6, roadWheelRadius: 0.33, skirts: true, trackProfile: run(6.75, 0.95, [3.35, 0.62], [-3.38, 0.62], -2.8, 2.75), hullOutline: { top: [[-3.45, 2.3], [-3.3, 2.4], [0.9, 2.4], [3.45, 1.25]], bottom: [[-3.45, 0.95], [3.0, 0.95], [3.45, 1.25]], plan: [[-3.45, 1.62], [3.45, 1.55]], round: 12, stations: 12 }, turret: turret(-0.6, [[-0.9, 0.75], [-0.7, 0.9], [0.6, 0.9], [0.9, 0.65]], [[-0.9, 0.5], [0.6, 0.6], [0.9, 0.4]], 8, 0.85), guns: [{ mount: 'turret', length: 2.6, calibre: 0.03, at: 0.5 }], addOns: [tb(-0.2, 1.1, 0.75, 1.3, 0.3, 0.45)] };

// Unmapped War Thunder ids. T55E1 (1943; about 6.0 x 2.6 m, 2.0 m; estimates): the Cook "Interceptor" 8x8, low and open, the
// 3-inch gun on its open mount far forward. T92 (1957; 4.8 x 3.15 m, 2.26 m): the airborne light tank - four road wheels, the
// very low wide turret far back with the 76 mm and two small machine-gun cupolas on its roof.
G['t55e1'] = { cls: 'tank-destroyer', chassis: 'wheeled', length: 6.0, width: 2.6, hullHeight: 1.35, axles: 4, axleAt: [0.7, 0.25, -0.25, -0.7], wheelRadius: 0.5, openTop: true, hullOutline: { top: [[-3.0, 1.25], [-2.8, 1.35], [2.4, 1.35], [3.0, 1.05]], bottom: [[-3.0, 0.65], [3.0, 0.65]], plan: [[-3.0, 1.25], [3.0, 1.2]], round: 12, stations: 10 }, turret: { x: 0.6, length: 0.9, width: 1.0, height: 0.4, shape: 'cylinder' }, guns: [{ mount: 'turret', length: 3.6, calibre: 0.076, at: 1.0 }] };
G['t92'] = { cls: 'light-tank', chassis: 'tracked', length: 4.8, width: 3.15, hullHeight: 1.4, roadWheels: 4, roadWheelRadius: 0.36, trackProfile: run(4.65, 0.85, [2.3, 0.6], [-2.33, 0.45], -1.75, 1.75), running: { wheels: [-1.55, -0.5, 0.55, 1.6] }, hullOutline: hull(4.8, 3.15, 1.4, 0.85, 1.3, 0.95, 0.1, 10),
  turret: turret(-0.9, [[-1.3, 1.2], [-1.0, 1.45], [0.6, 1.45], [1.2, 1.0], [1.4, 0.5]], [[-1.3, 0.48], [0.6, 0.6], [1.4, 0.4]], 10, 1.35), guns: [{ mount: 'turret', length: 3.9, calibre: 0.076, muzzle: true, at: 0.42 }], addOns: [td(-0.3, -0.85, 0.7, 0.5, 0.25), td(-0.3, 0.85, 0.7, 0.5, 0.25)] };
// South African: Ystervark (1980s; the SAMIL 20 4x4 with its armoured V-hull cab, about 5.3 x 2.5 m, 3.0 m; estimates) with
// a single 20 mm on its bed; Bosvark (early 1990s; the SAMIL 100 6x6, about 8.6 x 2.5 m, 3.4 m) with a ZU-23-2 on its bed;
// Concept 3 (1979; an 8x8 on Saracen parts, about 6.5 x 2.6 m, 2.6 m) with a Comet-like turret and the 77 mm.
G['ystervark'] = { cls: 'spaa', chassis: 'wheeled', length: 5.3, width: 2.5, hullHeight: 1.2, axles: 2, axleAt: [0.6, -0.55], wheelRadius: 0.55, hull: 'truck', cab: { length: 1.6, height: 2.7, bonnet: 1.4, outline: bonnetCab(5.3, 2.5, 0.55, 1.6, 2.7, 1.4, 1.8, 0.25, 0.8, 0.35) }, bed: 'none', addOns: [...cargo(-2.65, -0.45, 2.3, 1.2, 0.35), ...bedMount(-1.5, 1.2, 0.6, 1, 2.0, 0.02, 0.3, 0.2, 0.9)] };
G['bosvark'] = { cls: 'spaa', chassis: 'wheeled', length: 8.6, width: 2.5, hullHeight: 1.55, axles: 3, axleAt: [0.7, -0.38, -0.68], wheelRadius: 0.6, hull: 'truck', cab: { length: 1.9, height: 2.95, bonnet: 1.6, outline: bonnetCab(8.6, 2.5, 0.6, 1.9, 2.95, 1.6, 2.0, 0.25, 0.85, 0.35) }, bed: 'none', addOns: [...cargo(-4.3, 0.6, 2.4, 1.55, 0.4), ...zu23(-1.8, 0, 1.55)] };
G['concept-3'] = { cls: 'tank-destroyer', chassis: 'wheeled', length: 6.5, width: 2.6, hullHeight: 1.8, axles: 4, axleAt: [0.72, 0.3, -0.3, -0.72], wheelRadius: 0.55, hullOutline: wheeledHull(6.5, 1.8, 1.2, 1.3, 1.6), turret: turret(0.0, [[-1.5, 0.8], [-1.35, 1.0], [0.65, 1.05], [1.0, 0.95], [1.1, 0.72]], [[-1.5, 0.5], [-1.3, 0.68], [0.75, 0.72], [1.1, 0.56]], 8, 1.2), guns: [{ mount: 'turret', length: 3.6, calibre: 0.077, at: 0.45 }] };
// SUB-I-II (late 1960s; about 5.8 x 2.8 m, 2.2 m; estimates): the Type 73 APC's prototype - a tracked box, the engine in
// front, five road wheels, a small 20 mm turret on the roof.
G['sub-i-ii'] = { cls: 'apc-tracked', chassis: 'tracked', length: 5.8, width: 2.8, hullHeight: 1.85, roadWheels: 5, roadWheelRadius: 0.32, trackProfile: run(5.65, 0.85, [2.8, 0.58], [-2.83, 0.55], -2.3, 2.25), running: { wheels: [-2.05, -1.03, 0, 1.03, 2.05] }, hullOutline: { top: [[-2.9, 1.8], [-2.8, 1.85], [0.9, 1.85], [2.9, 1.1]], bottom: [[-2.9, 0.8], [2.4, 0.8], [2.9, 1.1]], plan: [[-2.9, 1.38], [2.9, 1.32]], round: 12, stations: 10 }, turret: turret(0.1, [[-0.6, 0.5], [-0.45, 0.6], [0.4, 0.6], [0.6, 0.45]], [[-0.6, 0.4], [0.6, 0.38]], 6, 0.6), guns: [{ mount: 'turret', length: 1.7, calibre: 0.02, at: 0.5 }] };
// M64 (Taiwan, 1975; about 5.8 x 3.2 m, 2.6 m): the M42 Duster's (M41) hull with the open-topped M18 turret and its 76 mm.
G['m64-taiwan'] = { ...base('m41'), cls: 'light-tank', turret: { x: -0.3, length: 2.3, width: 2.3, height: 0.72, shape: 'open' }, guns: [{ mount: 'turret', length: 3.3, calibre: 0.076, muzzle: true, at: 0.55 }], cupola: false };
// WZ141-1 (1977; 4.66 x 2.4 m, 1.86 m): a tiny aluminium carrier, five road wheels and two rollers, the flat turret at the back
// with a 105 mm recoilless rifle on each side and an HJ-73 on each.
G['wz-141'] = { cls: 'atgm', chassis: 'tracked', length: 4.66, width: 2.4, hullHeight: 1.3, roadWheels: 5, roadWheelRadius: 0.27, trackProfile: run(4.5, 0.78, [2.25, 0.55], [-2.25, 0.5], -1.8, 1.75), running: { wheels: [-1.65, -0.82, 0, 0.82, 1.65], rollers: [-0.9, 0.9] }, hullOutline: hull(4.66, 2.4, 1.3, 0.78, 1.4, 0.85, 0.05, 10),
  turret: turret(-1.0, [[-0.8, 0.7], [-0.6, 0.85], [0.5, 0.85], [0.8, 0.6]], [[-0.8, 0.35], [0.8, 0.32]], 10, 0.8), guns: [{ mount: 'turret-side', count: 1, length: 3.0, calibre: 0.105, at: 0.6 }], addOns: [tb(0.3, 1.2, 0.62, 0.9, 0.12, 0.12, { ...M, paint: 'light' })] };
// Italian: CM52 (1952; the Fiat 6601 4x4, about 6.4 x 2.3 m, 2.7 m) with four 12.7 mm on its bed; Breda 501 (1943; a heavy
// 4x4 with an armoured cab, about 6.5 x 2.4 m, 2.6 m) with the 90/53 behind its shield over the open back.
G['cm52'] = { cls: 'spaa', chassis: 'wheeled', length: 6.4, width: 2.3, hullHeight: 1.2, axles: 2, axleAt: [0.6, -0.5], wheelRadius: 0.5, hull: 'truck', cab: { length: 1.7, height: 2.4, bonnet: 1.5, outline: bonnetCab(6.4, 2.3, 0.5, 1.7, 2.4, 1.5, 1.5, 0.15, 0.75, 0.25) }, bed: 'none', addOns: [...cargo(-3.2, -0.15, 2.2, 1.2, 0.4), ...bedMount(-1.6, 1.2, 0.55, 4, 1.6, 0.02, 0.35, 0.22)] };
G['breda-501'] = { cls: 'tank-destroyer', chassis: 'wheeled', length: 6.5, width: 2.4, hullHeight: 1.3, axles: 2, axleAt: [0.6, -0.5], wheelRadius: 0.55, hull: 'truck', cab: { length: 1.6, height: 2.2, bonnet: 1.6, outline: bonnetCab(6.5, 2.4, 0.55, 1.6, 2.2, 1.6, 1.6, 0.2, 0.8, 0.3) }, bed: 'none', addOns: [...cargo(-3.25, -0.05, 2.35, 1.3, 0.3), ...bedMount(-1.6, 1.3, 1.05, 1, 4.4, 0.09, 0.02, 0.2, 1.6)] };
// French: TPK 6.41 (an ACMAT 6x6 with the twin 20 mm on its bed, about 7.0 x 2.4 m, 2.8 m; estimates); ELC 901 (1956; about
// 3.9 x 2.3 m, 1.6 m): the tiny ELC hull with the small TC901 turret far back and its 90 mm.
G['tpk-641'] = { cls: 'spaa', chassis: 'wheeled', length: 7.0, width: 2.4, hullHeight: 1.3, axles: 3, axleAt: [0.68, -0.38, -0.7], wheelRadius: 0.55, hull: 'truck', cab: { length: 1.7, height: 2.5, bonnet: 1.4, outline: bonnetCab(7.0, 2.4, 0.55, 1.7, 2.5, 1.4, 1.6, 0.15, 0.8, 0.3) }, bed: 'none', addOns: [...cargo(-3.5, 0.0, 2.3, 1.3, 0.4), ...bedMount(-1.8, 1.3, 0.6, 2, 2.2, 0.03, 0.3, 0.4, 1.0)] };
G['elc-901'] = { ...G['elc-bis'], turret: turret(-1.0, [[-0.8, 0.8], [-0.6, 1.0], [0.5, 1.0], [0.85, 0.7]], [[-0.8, 0.45], [0.5, 0.55], [0.85, 0.4]], 8, 0.85), turrets: undefined, guns: [{ mount: 'turret', length: 3.2, calibre: 0.09, muzzle: true, at: 0.5 }] };
// Swedish: Lvtdgb m/40 (1941; a three-axle tractor truck, about 6.5 x 2.3 m, 2.8 m; estimates) with the 40 mm Bofors on its
// bed; U-SH 204 GK (late 1950s; Landsverk's armoured Unimog, engine at the back, about 5.0 x 2.2 m, 2.2 m) with its 20 mm turret.
G['lvtdgb-m40'] = { cls: 'spaa', chassis: 'wheeled', length: 6.5, width: 2.3, hullHeight: 1.25, axles: 3, axleAt: [0.65, -0.4, -0.72], wheelRadius: 0.5, hull: 'truck', cab: { length: 1.6, height: 2.4, bonnet: 1.5, outline: bonnetCab(6.5, 2.3, 0.5, 1.6, 2.4, 1.5, 1.6, 0.15, 0.75, 0.25) }, bed: 'none', addOns: [...cargo(-3.25, -0.1, 2.2, 1.25, 0.35), ...bedMount(-1.7, 1.25, 0.55, 1, 2.6, 0.04, 0.3, 0.2, 1.1)] };
G['ush-204-gk'] = { cls: 'scout-car', chassis: 'wheeled', length: 5.0, width: 2.2, hullHeight: 1.75, axles: 2, axleAt: [0.55, -0.5], wheelRadius: 0.55, hullOutline: { top: [[-2.5, 1.6], [-2.3, 1.75], [1.2, 1.75], [1.8, 1.5], [2.5, 1.2]], bottom: [[-2.5, 0.75], [2.5, 0.75]], plan: [[-2.5, 1.05], [2.5, 1.0]], round: 10, stations: 10 }, turret: turret(0.0, [[-0.7, 0.6], [-0.55, 0.72], [0.5, 0.72], [0.7, 0.55]], [[-0.7, 0.42], [0.7, 0.4]], 8, 0.72), guns: [{ mount: 'turret', length: 1.7, calibre: 0.02, at: 0.5 }] };

// ---------------------------------------------------------------- War Thunder replay ids that borrowed a figure

// M40 106 mm recoilless rifle on its M79 "wheelbarrow" mount, as fielded on the ground (rifle 3.40 m long, 1.12 m high to
// the spotting rifle, legs 1.52 m apart when spread): the pivot standing on a single small wheel under the front of the
// mount and two fixed legs splayed back to the sides, the long thin tube with its breech chamber and flared venturi, the
// .50 spotting rifle along its top, the sight on the left (the bore's height and the legs' run are estimates from photos).
const M40_MOUNT: AddOnMount = { at: [0, 0, 0.7], trunnion: [0, 0, 0.9], pitch: 0 };
G['m40-rr'] = { cls: 'towed-gun', chassis: 'static', bare: true, length: 3.4, width: 1.52, hullHeight: 0.9, addOns: [
  ...[-1, 1].map((s) => rod([-0.05, s * 0.06, 0.66], [-1.05, s * 0.74, 0.03], 0.06, MT)), ...[-1, 1].map((s) => hb(-1.05, s * 0.74, 0.03, 0.18, 0.12, 0.06, DARK)),
  rod([0.05, 0, 0.66], [0.3, 0, 0.16], 0.07, MT), rod([0.3, -0.05, 0.13], [0.3, 0.05, 0.13], 0.26, { paint: 'tyre', segments: 10 }),
  // The cradle turns on the pivot; the rifle, its spotting rifle and sight elevate about the trunnion over it.
  hd(0, 0, 0.7, 0.2, 0.14, DARK), ...onMount(M40_MOUNT, [hb(0, 0, 0.8, 0.45, 0.2, 0.12, DARK)]),
  ...onMount(M40_MOUNT, [rod([-1.35, 0, 0.9], [1.7, 0, 0.9], 0.14, MT), rod([-1.35, 0, 0.9], [-0.6, 0, 0.9], 0.24, MT), rod([-1.7, 0, 0.9], [-1.35, 0, 0.9], 0.26, MT, 0.18),
    rod([-0.5, 0, 1.05], [1.05, 0, 1.05], 0.05, MT), hb(-0.35, 0, 1.02, 0.3, 0.1, 0.08, DARK), hb(-0.3, -0.16, 0.97, 0.25, 0.1, 0.14, DARK)], true),
] };

// ZSU-37-2 Yenisei (6.36 x 3.1 m, 3.33 m): the GM-123 hull of the SU-100P family on six road wheels, the big flat-sided turret
// over the back with the twin 37 mm in its face and the Baikal radar's dome on the roof's rear (turret and dome sizes are
// estimates).
G['zsu-37-2'] = { cls: 'spaa', chassis: 'tracked', length: 6.36, width: 3.1, hullHeight: 1.45, roadWheels: 6, roadWheelRadius: 0.33, trackProfile: run(6.2, 0.88, [3.1, 0.62], [-3.1, 0.58], -2.6, 2.6), running: { wheels: [-2.55, -1.53, -0.51, 0.51, 1.53, 2.55], rollers: [-2.0, -0.7, 0.6, 1.9] }, hullOutline: hull(6.36, 3.1, 1.45, 0.88, 1.5, 1.0, 0.1, 10),
  turret: turret(-0.55, [[-1.6, 1.3], [-1.35, 1.45], [1.0, 1.45], [1.55, 1.15]], [[-1.6, 0.95], [-1.3, 1.05], [1.0, 1.05], [1.55, 0.72]], 12, 1.5), guns: [{ mount: 'turret', count: 2, length: 2.7, calibre: 0.037, spread: 0.55, elevation: 0.3, at: 0.45, muzzle: true }], radars: [{ kind: 'dome', x: -0.75, up: 0.15, size: 1.45, mast: 'none' }], addOns: [tb(-1.0, 0, 0.98, 1.0, 1.1, 0.25, DARK)] };

// ItO 90M (Crotale NG on the Patria XA-181 6x6, about 7.45 x 2.9 m; turret sizes estimates): the boat-nosed six-wheeler with
// the NG turret over its back - four VT1 canisters in a box either side, the tracking radar's round face and the sight between
// them, the flat search antenna on the roof.
G['ito-90m'] = { cls: 'sam', chassis: 'wheeled', length: 7.45, width: 2.9, hullHeight: 2.1, axles: 3, axleAt: [0.62, -0.2, -0.62], wheelRadius: 0.55, hullOutline: wheeledHull(7.45, 2.1, 1.25, 1.45, 2.0, 0.65),
  turret: turret(-1.3, [[-0.95, 0.65], [-0.7, 0.75], [0.6, 0.75], [0.95, 0.5]], [[-0.95, 0.95], [-0.6, 1.1], [0.6, 1.1], [0.95, 0.6]], 8, 0.9), missiles: [{ mount: 'turret-side', rows: 2, cols: 2, length: 2.4, diameter: 0.22, boxes: true, pod: true, elevation: 0.15, up: 0.55 }],
  radars: [{ kind: 'panel', x: -0.25, up: 0.45, size: 1.9, height: 0.6, tilt: 0.3, depth: 0.15 }], addOns: [
    { on: 'turret', kind: 'slab', at: [1.0, 0, 0.6], size: [0.1, 0, 0], poly: ellipse(0.35, 0.35, 14), plane: 'front', curve: 0.08, paint: 'light' },
    tb(0.85, 0, 1.08, 0.4, 0.35, 0.3, DARK),
  ] };

// Airfield radars (generic; no public source says what the game shows). The surveillance radar: a curved reflector with the
// secondary radar's bar on top, turning on a lattice tower over its equipment building (tower about 12 m, reflector about
// 5.5 x 2.7 m: estimates after an ASR-type set). The precision approach radar: a shelter with its tall elevation antenna and
// its wide azimuth antenna facing the runway, on a turntable (estimates after a GCA-type set).
G['airfield-surveillance-radar'] = { cls: 'radar', chassis: 'static', bare: true, length: 6.0, width: 6.0, hullHeight: 0.4, addOns: [
  bx(-3.0, 3.0, 0, 0, 0.3, 6.0, DARK), kung(-2.9, 0.3, 2.6, 0.3, 3.0), ...tower(1.6, 0, 0.3, 12.0, 2.4, 0.9, 5, 0.14),
  hb(1.6, 0, 12.15, 1.4, 1.4, 0.3), hd(1.6, 0, 12.5, 1.0, 0.4, DARK),
  sl([1.9, 0, 14.1], ellipse(2.75, 1.35, 22), 0.12, 'front', { ...LT, pitch: 0.2, curve: 0.8 }), hb(1.75, 0, 15.75, 0.3, 5.0, 0.35, LT),
  rod([1.6, 0, 12.7], [2.8, 0, 13.1], 0.12, MT), hb(2.9, 0, 13.15, 0.35, 0.35, 0.35, DARK), ...[-1, 1].map((s) => rod([1.6, s * 0.4, 12.7], [1.85, s * 2.0, 13.4], 0.08, MT)),
] };
G['airfield-par-radar'] = { cls: 'radar', chassis: 'static', bare: true, length: 6.0, width: 4.5, hullHeight: 0.4, addOns: [
  bx(-3.0, 3.0, 0, 0, 0.35, 4.5, DARK), kung(-2.6, 1.4, 2.5, 0.35, 2.85), hd(1.4, 0, 2.95, 1.6, 0.2, DARK),
  sl([2.0, -0.7, 4.6], rect(0.45, 1.75), 0.18, 'front', LT), sl([2.0, 0.9, 3.55], rect(1.4, 0.4), 0.18, 'front', LT),
  bx(1.5, 2.0, -0.7, 2.9, 3.0, 0.8, DARK), bx(1.5, 2.0, 0.9, 2.9, 3.15, 0.6, DARK),
] };

// Rooikat ZA-35 (on the Rooikat 8x8, 7.09 x 2.9 m): the big flat turret with a 35 mm on each side, the search and tracking
// radars on their mast over its back (the mast raises to 5 m; drawn lowered; turret and radar sizes are estimates).
G['rooikat-za-35'] = { ...G['rooikat'], cls: 'spaa', turret: turret(-0.5, [[-1.6, 1.1], [-1.3, 1.25], [1.0, 1.25], [1.5, 0.95]], [[-1.6, 0.85], [-1.3, 0.95], [1.0, 0.95], [1.5, 0.6]], 10, 1.3), guns: [{ mount: 'turret-side', count: 1, length: 3.2, calibre: 0.035, elevation: 0.15, at: 0.5 }],
  radars: [{ kind: 'panel', x: -1.1, up: 0.6, size: 1.6, height: 0.5, mast: 'pole' }, { kind: 'dish', x: 1.3, up: 0.1, size: 0.65, mast: 'none' }] };
// Rooikat 105 (Mk 1D, the technology demonstrator): the Rooikat with the long 105 mm, its fume extractor and thermal sleeve.
G['rooikat-105'] = { ...G['rooikat'], guns: [{ mount: 'turret', length: 5.5, calibre: 0.105, extractor: 0.55, sleeve: 0.7, muzzle: true, at: 0.5 }] };

ALIASES['us_at_m40'] = 'm40-rr';
ALIASES['ussr_zsu_37_2'] = 'zsu-37-2';
ALIASES['fr_crotale_ng'] = 'ito-90m';
ALIASES['unit_airfield_main_radar_char'] = 'airfield-surveillance-radar';
ALIASES['unit_airfield_flight_radar_char'] = 'airfield-par-radar';
ALIASES['uk_rooikat_za_35'] = 'rooikat-za-35';
ALIASES['uk_rooikat_mttd'] = 'rooikat-105';

// Ural-4320, the plain covered cargo truck: the outlined chassis of ./base.ts under the catalogue's starter name.
G['ural-4320'] = { cls: 'truck', ...URAL_4320 };

export const ARMOUR_MODERN: SpecSet = { ground: G, aliases: ALIASES };
