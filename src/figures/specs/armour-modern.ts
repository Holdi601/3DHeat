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
import type { AddOn, GroundSpec, GunSpec } from '../ground';
import { ABRAMS, ABRAMS_TURRET, hull, LEO1, LEO2, LEO2_WEDGE, run, T72, T72B_TURRET, T80, TANKS, turret } from './tanks';
import { HMMWV, KAMAZ_43101, MAN_HX } from './base';
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
G['pt-76'] = { cls: 'light-tank', chassis: 'tracked', length: 7.63, width: 3.15, hullHeight: 1.55, roadWheels: 6, roadWheelRadius: 0.35, trackProfile: run(7.2, 0.85, [3.5, 0.55], [-3.6, 0.62], -3.0, 3.0), running: { wheels: [-2.75, -1.65, -0.55, 0.55, 1.65, 2.75] }, hullOutline: { top: [[-3.8, 1.35], [-3.6, 1.55], [1.6, 1.55], [3.8, 0.95]], bottom: [[-3.8, 0.75], [2.6, 0.7], [3.8, 0.95]], plan: [[-3.8, 1.5], [2.8, 1.55], [3.8, 1.2]], round: 8, stations: 12 }, turret: turret(1.2, [[-1.0, 0.7], [-0.7, 1.0], [0.5, 1.05], [1.0, 0.7]], [[-1.0, 0.5], [0.6, 0.6], [1.0, 0.45]], 2.6, 1.0), guns: [{ mount: 'turret', length: 3.4, calibre: 0.076, muzzle: true, extractor: 0.7, at: 0.5 }] };
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
// the 30 mm and the Spike launcher on its side (7.6 x 3.9 m, 3.6 m).
G['puma'] = { cls: 'ifv', chassis: 'tracked', length: 7.6, width: 3.9, hullHeight: 2.35, roadWheels: 6, roadWheelRadius: 0.33, skirts: true, skirt: [[-3.7, 0.45], [3.5, 0.45], [3.7, 1.0], [3.7, 1.9], [-3.7, 1.9]], trackProfile: run(7.4, 1.0, [3.65, 0.7], [-3.65, 0.7], -3.0, 3.0), hullOutline: { top: [[-3.8, 2.2], [-3.6, 2.35], [1.4, 2.35], [3.8, 1.4]], bottom: [[-3.8, 1.0], [3.6, 1.0], [3.8, 1.2]], plan: [[-3.8, 1.95], [3.2, 1.95], [3.8, 1.6]], round: 12, stations: 12 }, turret: turret(0.1, [[-1.0, 0.8], [-0.8, 1.0], [0.9, 1.0], [1.2, 0.7]], [[-1.0, 0.5], [0.9, 0.55], [1.2, 0.4]], 10, 1.2), guns: [{ mount: 'turret', length: 3.0, calibre: 0.03, at: 0.5 }], addOns: [tb(-0.3, -1.15, 0.45, 1.1, 0.3, 0.35)] };
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
// Type 16 MCV (2016): a long 8x8 with evenly spaced axles and a Type 10-like turret with the 105 mm (8.45 x 2.98 m, 2.87 m).
G['type-16-mcv'] = { cls: 'tank-destroyer', ...CENTAURO, length: 8.45, width: 2.98, axleAt: [0.75, 0.27, -0.27, -0.75], hullOutline: wheeledHull(8.45, 1.9, 1.15, 1.49, 1.9), turret: turret(-0.4, [[-2.0, 1.1], [-1.6, 1.35], [0.8, 1.4], [1.7, 1.0], [2.0, 0.5]], [[-2.0, 0.6], [0.8, 0.72], [2.0, 0.45]], 10, 1.95) };
// Namer (2008): the Merkava Mk 4 hull as a heavy carrier - no turret, a raised troop compartment and a remote station.
G['namer'] = { ...MK4, cls: 'apc-tracked', turret: undefined, guns: undefined, addOns: [hb(-1.6, 0, 1.95, 4.0, 3.2, 0.5), hb(-0.6, 0.6, 2.45, 0.6, 0.5, 0.45, DARK), hb(-0.05, 0.6, 2.52, 1.0, 0.07, 0.07, DARK)] };

// War Thunder post-war ids that had no figure (from the public wiki's trees): each to its own figure where it has one,
// otherwise to the vehicle it is built on or derived from.
Object.assign(ALIASES, {
  us_t95: 'm48-patton', us_t95e1: 'm48-patton', us_m728: 'm60a1', us_t114: 'm113', us_t54e1: 'm48-patton', us_t54e2: 'm48-patton', us_t58: 'm103', us_xm_800t: 'fv101-scorpion',
  us_stingray: 'ccvl', jp_stingray: 'ccvl', us_xm_803: 'mbt-70', us_m1296_dragoon: 'm1296-stryker-dragoon', us_efv_p1: 'aav-7a1', us_xm_8: 'm8-ags', us_ags_teledyne: 'm8-ags', us_m1_ip_abrams: 'm1ip-abrams', us_rdf_lt: 'fv101-scorpion',
  germ_marder_df_105: 'tam', fr_marder_df_105: 'tam', germ_marder_clovis: 'marder-1a3', fr_marder_clovis: 'marder-1a3', germ_erprobungstrager_3_achs_turm: 'radpanzer-90', germ_sk105_a2: 'amx-13', germ_begleitpanzer_57: 'marder-1a3',
  germ_vt_1_2: 'strv-103', germ_th_800_bismark: 'cv90', germ_th_400: 'leopard-1a5', germ_embt: 'leopard-2a6', fr_embt: 'leopard-2a6',
  ussr_object_906: 'pt-76', ussr_object_416: 't-55a', ussr_object_120: 't-62', ussr_to_55: 't-55a', ussr_object_685: '2s25-sprut-sd', ussr_it_1: 't-62', ussr_9p149: 'mt-lb', ussr_object_435: 't-64a',
  ussr_2s25: '2s25-sprut-sd', ussr_2s25m: '2s25-sprut-sd', ussr_9p157: 'bmp-3', ussr_object_140: 't-55a', ussr_2s38: 'bmp-3', ussr_t_80ue1_sm: 't-80u',
  uk_vickers_mbt_mk_1: 'centurion', uk_vijayanta: 'centurion', uk_vickers_mbt_mk_3: 'centurion', uk_vickers_mk_11: 'centurion', uk_vickers_mk7: 'leopard-2a4', uk_falcon: 'fv432', uk_tracked_rapier: 'm48-chaparral',
  uk_badger: 'challenger-2', uk_vfm_5: 'ccvl', uk_ttd: 'chieftain-900', uk_ajax: 'cv90', uk_challenger_1_mk_3_gulf: 'challenger-1',
  jp_type_75_mlrs: 'm270-mlrs', jp_type_16_mcv_prot: 'type-16-mcv', jp_type_16_mod: 'type-16-mcv', jp_type_16: 'type-16-mcv', jp_btr_3e1: 'btr-82a', jp_icv_ifv_prototype: 'patria-amv', jp_icv_prototype: 'patria-amv',
  jp_harimau: 'cv90120', jp_type_03_chusam_fcs: 'nasams-mpq-64-sentinel', jp_type_03_chusam_launcher: 'sky-sabre-launcher',
  cn_zts_63_1980: 'pt-76', cn_type_86: 'bmp-1', cn_wz_305: '2s25-sprut-sd', cn_ztz_59a: 't-55a', cn_type_59d: 't-55a', cn_cm_25: 'm113-tow', cn_ptz_89: '2s25-sprut-sd', cn_ztz_88b: 'ztz-96', cn_ztz_88a: 'ztz-96',
  cn_ptl_02: 'wz-551', cn_hj_9: 'wz-551', cn_cm11: 'm60a1', cn_cm_34: 'patria-amv', cn_object_122tm: 't-62', cn_wma_301: 'amx-10rc', cn_type_69_2g: 't-55a', cn_mbt2000: 'ztz-96b', cn_mbt2000_sm: 'ztz-96b',
  cn_antelope_tc_1l_ads: 'm1097-avenger', cn_ztl_11: 'centauro', cn_qn506: 't-55a', cn_vt_5: 'cv90120', cn_wz_1001: 'wz-551',
  it_c13_t90: 'm113', it_oto_r3_106sr: 'fiat-6616', it_fiat_6614_firos: 'fiat-6616', it_vbc_pt2: 'freccia', it_c13_tua: 'm113-tow', it_otomatic: 'flakpanzer-gepard', it_kf_41: 'cv90',
  fr_lorraine_40t: 'amx-30', fr_amx_10m_acra: 'marder-1a3', fr_somua_sm: 'amx-30', fr_mars_15: 'amx-13', fr_vcac_mephisto: 'vab-mephisto', fr_msc: 'leclerc',
  sw_k9_vidar: 'k9-firtina', sw_itpsv_90: 'cv90120', sw_udes_33: 'strv-103', sw_pbv_302_bill: 'm113-tow', sw_strv121b_christian2: 'leopard-2a4', sw_eldenhet_98: 'iris-t-slm-launcher', sw_nomads: 'asrad-r', sw_t_80u: 't-80u',
  il_machbet: 'm163-vulcan', il_hunter_afv: 'm113', il_eitan: 'boxer', il_namer_rcws_30: 'namer', il_namer_tsrikhon: 'namer',
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

export const ARMOUR_MODERN: SpecSet = { ground: G, aliases: ALIASES };
