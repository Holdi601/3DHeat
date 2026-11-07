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
  tb(front - 0.38, cheek * 0.55, roof * 0.66, 0.4, 0.32, 0.12, { ...M, pitch: -0.5, yaw: 0.35 }),
  tb(front - 0.75, cheek * 0.78, roof * 0.6, 0.4, 0.32, 0.12, { ...M, pitch: -0.45, yaw: 0.7 }),
  tb(front - 0.75, 0.32, roof * 0.95, 0.4, 0.32, 0.1, { ...M, pitch: -0.2 }),
  tb(front - 1.15, cheek * 0.62, roof * 0.9, 0.4, 0.3, 0.1, { ...M, pitch: -0.15, yaw: 0.9 }),
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
G['t-72-ural'] = { cls: 'mbt', ...T72, skirts: false, addOns: [...[2.5, 1.85, 1.2, 0.55].map((x) => hb(x, 1.82, 0.7, 0.6, 0.04, 0.55, { ...M, yaw: -0.55 })), { on: 'turret', kind: 'blob', at: [0.95, 1.2, 0.6], size: [0.3, 0.3, 0.26] }, LUNA(1.35, 0.8, 0.72)] };
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
G['t-64a'] = { ...T64, skirts: false, addOns: [...[2.4, 1.8, 1.2, 0.6].map((x) => hb(x, 1.7, 0.7, 0.55, 0.04, 0.5, { ...M, yaw: -0.55 })), LUNA(1.35, 0.8, 0.7)] };
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
G['leopard-1a1a1'] = { cls: 'mbt', ...LEO1, turret: LEO1_CAST, guns: [{ ...L7, sleeve: 0.7 }], addOns: [tb(1.1, 0.85, 0.5, 0.9, 0.55, 0.62, { ...M, yaw: 0.45 }), tb(-0.1, 1.42, 0.48, 1.7, 0.12, 0.62, M), tb(1.78, 0, 0.48, 0.22, 1.0, 0.55)] };
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
G['ariete-amv'] = { ...ARIETE, addOns: [tb(-0.2, 0.7, 0.95, 0.4, 0.4, 0.4), tb(1.6, 0.9, 0.4, 0.9, 0.7, 0.55, { ...M, yaw: 0.6 }), tb(-0.3, 1.72, 0.4, 2.0, 0.16, 0.55, M), tb(-1.2, -0.6, 1.0, 0.5, 0.4, 0.4, DARK)] };

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
for (const [x, s, yaw] of [[2.0, 0.45, 0.6], [1.6, 0.85, 0.6], [1.15, 1.2, 0.35], [0.6, 1.45, 0.1], [0.0, 1.55, 0], [-0.6, 1.5, 0], [-1.2, 1.35, -0.2]] as const) BLAZER.push(tb(x, s, 0.55, 0.5, 0.18, 0.4, { ...M, yaw }));
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
const STILLBREW = tb(1.0, 0.95, 0.42, 0.9, 0.7, 0.6, { ...M, yaw: 0.45 });
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

export const ARMOUR_MODERN: SpecSet = { ground: G, aliases: ALIASES };
