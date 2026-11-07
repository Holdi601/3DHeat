/**
 * Missiles, bombs and rockets as they fly: body length and diameter, the
 * sets of fins and wings that tell them apart (an AIM-9's canards and rollerons,
 * an AIM-120's mid-body wings, a Kh-29's big forward fins, a bomb's box tail),
 * a seeker's glass nose or a bomb's round one. Published lengths and
 * diameters; fin spans and positions from general shape (estimates).
 * Aliases: the names DCS and Tacview give weapons, lower case.
 */

import type { Named, SpecSet } from './index';
import type { FixedWingSpec, MissileFigureSpec } from '../air';
import type { P2 } from '../parts';

const M: Named<MissileFigureSpec> = {};

// ---------------------------------------------------------------- air-to-air

M['aim-54'] = { cls: 'aam', length: 3.96, diameter: 0.38, nose: 'ogive', fins: [{ at: 0.82, span: 0.91, chord: 0.6 }, { at: 0.5, span: 0.6, chord: 0.7 }] };
M['r-60'] = { cls: 'aam', length: 2.09, diameter: 0.12, nose: 'blunt', fins: [{ at: 0.1, span: 0.2, chord: 0.1 }, { at: 0.85, span: 0.39, chord: 0.18 }] };
M['r-40'] = { cls: 'aam', length: 6.2, diameter: 0.31, nose: 'ogive', fins: [{ at: 0.2, span: 0.9, chord: 0.4 }, { at: 0.85, span: 1.45, chord: 0.8 }] };
M['mica'] = { cls: 'aam', length: 3.1, diameter: 0.16, nose: 'ogive', fins: [{ at: 0.6, span: 0.3, chord: 0.8 }, { at: 0.92, span: 0.56, chord: 0.15 }] };
M['meteor-aam'] = { cls: 'aam', length: 3.67, diameter: 0.178, nose: 'ogive', fins: [{ at: 0.92, span: 0.45, chord: 0.15 }] };
M['iris-t'] = { cls: 'aam', length: 2.94, diameter: 0.127, nose: 'blunt', fins: [{ at: 0.4, span: 0.25, chord: 0.5 }, { at: 0.93, span: 0.45, chord: 0.12 }] };
M['pl-12'] = { cls: 'aam', length: 3.93, diameter: 0.203, nose: 'ogive', fins: [{ at: 0.45, span: 0.45, chord: 0.35 }, { at: 0.9, span: 0.6, chord: 0.25 }] };
M['super-530'] = { cls: 'aam', length: 3.54, diameter: 0.263, nose: 'ogive', fins: [{ at: 0.78, span: 0.9, chord: 0.8 }] };

// ---------------------------------------------------------------- air-to-ground and anti-ship

M['agm-88'] = { cls: 'agm', length: 4.17, diameter: 0.254, nose: 'ogive', fins: [{ at: 0.4, span: 1.12, chord: 0.8 }, { at: 0.9, span: 0.7, chord: 0.3 }] };
M['agm-84'] = { cls: 'agm', length: 3.84, diameter: 0.343, nose: 'ogive', fins: [{ at: 0.6, span: 0.91, chord: 0.5, x: true }, { at: 0.95, span: 0.7, chord: 0.2, x: true }] };
M['agm-154'] = { cls: 'agm', length: 4.1, diameter: 0.33, nose: 'round', fins: [{ at: 0.92, span: 0.8, chord: 0.2 }], wings: { span: 2.7, chord: 0.3, at: 0.35 } };
M['agm-158'] = { cls: 'cruise-missile', length: 4.27, diameter: 0.55, nose: 'round', fins: [{ at: 0.95, span: 0.7, chord: 0.25 }], wings: { span: 2.4, chord: 0.35, at: 0.45 } };
M['kh-29'] = { cls: 'agm', length: 3.9, diameter: 0.38, nose: 'blunt', fins: [{ at: 0.15, span: 0.75, chord: 0.3 }, { at: 0.85, span: 1.1, chord: 0.5 }] };
M['kh-25'] = { cls: 'agm', length: 3.7, diameter: 0.275, nose: 'blunt', fins: [{ at: 0.15, span: 0.5, chord: 0.2 }, { at: 0.85, span: 0.76, chord: 0.4 }] };
M['kh-31'] = { cls: 'agm', length: 4.7, diameter: 0.36, nose: 'ogive', fins: [{ at: 0.45, span: 0.9, chord: 0.5 }, { at: 0.9, span: 0.9, chord: 0.3 }] };
M['kh-58'] = { cls: 'agm', length: 4.8, diameter: 0.38, nose: 'ogive', fins: [{ at: 0.75, span: 1.17, chord: 1.0 }] };
M['kh-59'] = { cls: 'cruise-missile', length: 5.7, diameter: 0.38, nose: 'ogive', fins: [{ at: 0.15, span: 0.6, chord: 0.2 }, { at: 0.95, span: 0.7, chord: 0.25 }], wings: { span: 1.3, chord: 0.4, at: 0.55 } };
M['vikhr'] = { cls: 'atgm', length: 2.75, diameter: 0.13, nose: 'cone', fins: [{ at: 0.15, span: 0.35, chord: 0.12 }, { at: 0.9, span: 0.38, chord: 0.12 }] };
M['tow'] = { cls: 'atgm', length: 1.17, diameter: 0.152, nose: 'round', fins: [{ at: 0.45, span: 0.46, chord: 0.08 }, { at: 0.9, span: 0.34, chord: 0.06, x: true }] };
M['exocet'] = { cls: 'anti-ship', length: 4.7, diameter: 0.348, nose: 'ogive', fins: [{ at: 0.62, span: 1.1, chord: 0.6, x: true }, { at: 0.95, span: 0.8, chord: 0.25, x: true }] };
M['p-500-bazalt'] = { cls: 'anti-ship', length: 11.7, diameter: 0.88, nose: 'cone', fins: [{ at: 0.95, span: 1.6, chord: 0.6, x: true }], wings: { span: 2.6, chord: 0.9, at: 0.6 } };

// ---------------------------------------------------------------- SAMs in flight

M['5v55'] = { cls: 'sam', length: 7.25, diameter: 0.508, nose: 'ogive', fins: [{ at: 0.92, span: 1.1, chord: 0.3 }] };
M['9m38'] = { cls: 'sam', length: 5.55, diameter: 0.4, nose: 'ogive', fins: [{ at: 0.55, span: 0.86, chord: 1.6 }, { at: 0.95, span: 0.86, chord: 0.25 }] };
M['3m9'] = { cls: 'sam', length: 5.8, diameter: 0.335, nose: 'ogive', fins: [{ at: 0.45, span: 1.24, chord: 0.8, x: true }, { at: 0.95, span: 1.0, chord: 0.3 }] };
M['v-750'] = { cls: 'sam', length: 10.6, diameter: 0.65, nose: 'ogive', fins: [{ at: 0.12, span: 0.8, chord: 0.3 }, { at: 0.55, span: 1.7, chord: 0.8 }, { at: 0.95, span: 2.6, chord: 0.8, x: true }] };
M['mim-104'] = { cls: 'sam', length: 5.31, diameter: 0.41, nose: 'cone', fins: [{ at: 0.95, span: 0.92, chord: 0.5, x: true }] };
M['mim-23'] = { cls: 'sam', length: 5.08, diameter: 0.37, nose: 'ogive', fins: [{ at: 0.75, span: 1.19, chord: 1.4 }] };
M['stinger'] = { cls: 'manpads', length: 1.52, diameter: 0.07, nose: 'blunt', fins: [{ at: 0.12, span: 0.13, chord: 0.05 }, { at: 0.95, span: 0.2, chord: 0.06 }] };

// ---------------------------------------------------------------- bombs and rockets

M['mk-83'] = { cls: 'bomb', length: 3.0, diameter: 0.356, nose: 'round', fins: [{ at: 0.82, span: 0.49, chord: 0.5, x: true }] };
M['mk-84'] = { cls: 'bomb', length: 3.28, diameter: 0.46, nose: 'round', fins: [{ at: 0.82, span: 0.64, chord: 0.6, x: true }] };
M['gbu-12'] = { cls: 'guided-bomb', length: 3.33, diameter: 0.273, nose: 'blunt', fins: [{ at: 0.12, span: 0.4, chord: 0.25 }, { at: 0.88, span: 0.95, chord: 0.45 }] };
M['gbu-10'] = { cls: 'guided-bomb', length: 4.32, diameter: 0.46, nose: 'blunt', fins: [{ at: 0.12, span: 0.5, chord: 0.3 }, { at: 0.88, span: 1.6, chord: 0.7 }] };
M['gbu-31-jdam'] = { cls: 'guided-bomb', length: 3.88, diameter: 0.46, nose: 'round', fins: [{ at: 0.4, span: 0.6, chord: 0.5 }, { at: 0.9, span: 0.95, chord: 0.45, x: true }] };
M['fab-250'] = { cls: 'bomb', length: 1.96, diameter: 0.325, nose: 'round', bulge: 1.05, fins: [{ at: 0.82, span: 0.41, chord: 0.45, x: true }] };
M['fab-500'] = { cls: 'bomb', length: 2.42, diameter: 0.4, nose: 'round', bulge: 1.05, fins: [{ at: 0.82, span: 0.5, chord: 0.55, x: true }] };
M['kab-500'] = { cls: 'guided-bomb', length: 3.05, diameter: 0.35, nose: 'blunt', fins: [{ at: 0.15, span: 0.6, chord: 0.35 }, { at: 0.85, span: 0.75, chord: 0.5 }] };
M['cbu-87'] = { cls: 'cluster-bomb', length: 2.34, diameter: 0.4, nose: 'round', fins: [{ at: 0.88, span: 0.6, chord: 0.4 }] };
M['ww2-bomb-250'] = { cls: 'bomb', length: 1.64, diameter: 0.368, nose: 'round', bulge: 1.05, fins: [{ at: 0.85, span: 0.5, chord: 0.5, x: true }] };
M['ww2-bomb-500'] = { cls: 'bomb', length: 2.0, diameter: 0.47, nose: 'round', bulge: 1.05, fins: [{ at: 0.85, span: 0.64, chord: 0.6, x: true }] };
M['hydra-70'] = { cls: 'rocket', length: 1.06, diameter: 0.07, nose: 'cone', fins: [{ at: 0.95, span: 0.2, chord: 0.05, x: true }] };
M['s-8'] = { cls: 'rocket', length: 1.57, diameter: 0.08, nose: 'cone', fins: [{ at: 0.95, span: 0.25, chord: 0.06, x: true }] };
M['s-24'] = { cls: 'rocket', length: 2.33, diameter: 0.24, nose: 'cone', fins: [{ at: 0.92, span: 0.6, chord: 0.25, x: true }] };
M['rs-82'] = { cls: 'rocket', length: 0.6, diameter: 0.082, nose: 'round', fins: [{ at: 0.85, span: 0.2, chord: 0.15, x: true }] };

// ---------------------------------------------------------------- variants by outline

/** A missile body's profile: a nose of `nose` share of the length rounding from radius `tip` to `r`, then straight. */
function seeker(nose: number, tip: number, r: number): P2[] {
  return [[0, tip], [nose * 0.35, r * 0.62], [nose * 0.7, r * 0.92], [nose, r], [1, r]];
}

// Sidewinder (127 mm): the B with a hemispherical seeker, small triangular canards and short wings (2.83 m); the
// D/G/H with a pointed seeker and long pointed canards (2.87 m); the J/P with cropped double-delta canards (3.07 m);
// the L/M with the big double-delta canards and broad wings (2.87 m); the X with tiny fixed strakes and small
// clipped tail fins, no canards (3.02 m).
M['aim-9b'] = { cls: 'aam', length: 2.83, diameter: 0.127, nose: 'blunt', profile: seeker(0.04, 0.035, 0.0635), fins: [{ at: 0.1, span: 0.36, chord: 0.2, tip: 0 }, { at: 0.8, span: 0.53, chord: 0.45, tip: 0.2 }] };
M['aim-9d'] = { cls: 'aam', length: 2.87, diameter: 0.127, nose: 'ogive', profile: seeker(0.07, 0.008, 0.0635), fins: [{ at: 0.1, span: 0.5, chord: 0.3, tip: 0 }, { at: 0.8, span: 0.63, chord: 0.5, tip: 0.2 }] };
M['aim-9p'] = { cls: 'aam', length: 3.07, diameter: 0.127, nose: 'blunt', profile: seeker(0.04, 0.035, 0.0635), fins: [{ at: 0.08, span: 0.56, chord: 0.3, tip: 0.06 }, { at: 0.8, span: 0.58, chord: 0.48, tip: 0.2 }] };
M['aim-9m'] = { cls: 'aam', length: 2.87, diameter: 0.127, nose: 'blunt', profile: seeker(0.04, 0.035, 0.0635), fins: [{ at: 0.07, span: 0.64, chord: 0.33, tip: 0.05 }, { at: 0.8, span: 0.64, chord: 0.5, tip: 0.2 }] };
M['aim-9x'] = { cls: 'aam', length: 3.02, diameter: 0.127, nose: 'blunt', profile: seeker(0.04, 0.035, 0.0635), fins: [{ at: 0.12, span: 0.18, chord: 0.25, tip: 0 }, { at: 0.88, span: 0.44, chord: 0.3, tip: 0.18 }] };

// AMRAAM (178 mm, 3.66 m): the A/B with cropped-delta mid wings 0.53 m across; the C/D with them clipped to fit an
// internal bay (0.45 m).
M['aim-120b'] = { cls: 'aam', length: 3.66, diameter: 0.178, nose: 'ogive', profile: seeker(0.12, 0.006, 0.089), fins: [{ at: 0.42, span: 0.53, chord: 0.35, tip: 0.08 }, { at: 0.86, span: 0.45, chord: 0.35, tip: 0.18 }] };
M['aim-120c'] = { cls: 'aam', length: 3.66, diameter: 0.178, nose: 'ogive', profile: seeker(0.12, 0.006, 0.089), fins: [{ at: 0.42, span: 0.45, chord: 0.3, tip: 0.13 }, { at: 0.86, span: 0.45, chord: 0.35, tip: 0.2 }] };

// R-27 (230 mm): the "butterfly" wings forward and the tail fins; R the radar nose (4.08 m), T the IR seeker's blunt
// dome (3.7 m); ER and ET the long-range ones with a fatter, longer motor (260 mm; 4.78 m and 4.5 m).
const R27_FINS = (L: number): MissileFigureSpec['fins'] => [{ at: 1.1 / L, span: 0.77, chord: 0.75, tip: 0.35 }, { at: 1 - 0.5 / L, span: 0.8, chord: 0.35, tip: 0.2 }];
M['r-27r'] = { cls: 'aam', length: 4.08, diameter: 0.23, nose: 'ogive', profile: seeker(0.13, 0.006, 0.115), fins: R27_FINS(4.08) };
M['r-27t'] = { cls: 'aam', length: 3.7, diameter: 0.23, nose: 'blunt', profile: seeker(0.05, 0.05, 0.115), fins: R27_FINS(3.7) };
M['r-27er'] = { cls: 'aam', length: 4.78, diameter: 0.26, nose: 'ogive', profile: [...seeker(0.11, 0.006, 0.115).slice(0, 4), [0.42, 0.115], [0.47, 0.13], [1, 0.13]], fins: R27_FINS(4.78) };
M['r-27et'] = { cls: 'aam', length: 4.5, diameter: 0.26, nose: 'blunt', profile: [...seeker(0.045, 0.05, 0.115).slice(0, 4), [0.38, 0.115], [0.43, 0.13], [1, 0.13]], fins: R27_FINS(4.5) };
// R-77: small mid strakes and the lattice tail fins (drawn solid) (3.6 m, 200 mm).
M['r-77'] = { cls: 'aam', length: 3.6, diameter: 0.2, nose: 'ogive', profile: seeker(0.12, 0.006, 0.1), fins: [{ at: 0.42, span: 0.38, chord: 0.6, tip: 0.1 }, { at: 0.95, span: 0.7, chord: 0.08, tip: 0.08 }] };

// Maverick (305 mm, 2.49 m): the TV and IIR seekers' round glass dome (A/B/D/G/K) or the laser seeker's pointed
// faceted nose (E/L).
M['agm-65d'] = { cls: 'agm', length: 2.49, diameter: 0.305, nose: 'blunt', profile: seeker(0.06, 0.09, 0.1525), fins: [{ at: 0.5, span: 0.72, chord: 1.05, tip: 0.18 }] };
M['agm-65e'] = { cls: 'agm', length: 2.49, diameter: 0.305, nose: 'cone', profile: seeker(0.14, 0.01, 0.1525), fins: [{ at: 0.5, span: 0.72, chord: 1.05, tip: 0.18 }] };
// Hellfire: the laser K's rounded faceted nose (1.63 m); the Longbow L's longer radar nose (1.78 m).
M['agm-114l'] = { cls: 'agm', length: 1.78, diameter: 0.178, nose: 'ogive', profile: seeker(0.16, 0.008, 0.089), fins: [{ at: 0.3, span: 0.33, chord: 0.14, tip: 0.05 }, { at: 0.86, span: 0.33, chord: 0.2, tip: 0.1 }] };
// Kh-29 (380 mm): L the laser seeker's pointed glass nose (3.875 m), T the TV seeker's big round dome (3.9 m).
const KH29_FINS: MissileFigureSpec['fins'] = [{ at: 0.12, span: 0.75, chord: 0.3, tip: 0.1 }, { at: 0.82, span: 1.1, chord: 0.55, tip: 0.25 }];
M['kh-29l'] = { cls: 'agm', length: 3.875, diameter: 0.38, nose: 'ogive', profile: seeker(0.11, 0.02, 0.19), fins: KH29_FINS };
M['kh-29t'] = { cls: 'agm', length: 3.9, diameter: 0.38, nose: 'blunt', profile: seeker(0.05, 0.12, 0.19), fins: KH29_FINS };
// Kh-25MP / MPU: the anti-radiation Kh-25 with a long pointed radome (4.35 m).
M['kh-25mp'] = { cls: 'agm', length: 4.35, diameter: 0.275, nose: 'ogive', profile: seeker(0.15, 0.006, 0.1375), fins: [{ at: 0.15, span: 0.5, chord: 0.2, tip: 0.08 }, { at: 0.85, span: 0.76, chord: 0.4, tip: 0.18 }] };

// Bombs: the Paveway II on a Mk 83 (GBU-16, 3.7 m); the Paveway III's bulbous seeker and big folding wings on a
// BLU-109 (GBU-24, 4.39 m); JDAM kits on the Mk 82 (GBU-38, 2.35 m) and Mk 83 (GBU-32, 3.03 m); the Mk 82 with
// the Snakeye's four big retarding blades folded, and with the fat BSU-49 ballute tail (AIR).
M['gbu-16'] = { cls: 'guided-bomb', length: 3.7, diameter: 0.356, nose: 'blunt', fins: [{ at: 0.1, span: 0.45, chord: 0.28, tip: 0.05 }, { at: 0.88, span: 1.3, chord: 0.5, tip: 0.3 }] };
M['gbu-24'] = { cls: 'guided-bomb', length: 4.39, diameter: 0.37, nose: 'blunt', profile: [[0, 0.1], [0.03, 0.17], [0.12, 0.2], [0.18, 0.17], [0.24, 0.185], [0.9, 0.185], [1, 0.15]], fins: [{ at: 0.09, span: 0.6, chord: 0.35, tip: 0.05 }, { at: 0.85, span: 2.0, chord: 0.45, tip: 0.3 }] };
M['gbu-38'] = { cls: 'guided-bomb', length: 2.35, diameter: 0.273, nose: 'round', fins: [{ at: 0.4, span: 0.4, chord: 0.45, tip: 0.3 }, { at: 0.86, span: 0.6, chord: 0.35, x: true }] };
M['gbu-32'] = { cls: 'guided-bomb', length: 3.03, diameter: 0.356, nose: 'round', fins: [{ at: 0.4, span: 0.5, chord: 0.5, tip: 0.35 }, { at: 0.86, span: 0.75, chord: 0.4, x: true }] };
M['mk-82-snakeye'] = { cls: 'bomb', length: 2.2, diameter: 0.273, nose: 'round', fins: [{ at: 0.72, span: 0.6, chord: 0.62, tip: 0.55, x: true }] };
M['mk-82-air'] = { cls: 'bomb', length: 2.3, diameter: 0.273, nose: 'round', profile: [[0, 0.03], [0.08, 0.1], [0.22, 0.1365], [0.6, 0.1365], [0.68, 0.11], [0.72, 0.15], [1, 0.15]], fins: [{ at: 0.72, span: 0.5, chord: 0.25, tip: 0.2, x: true }] };
// KAB-500L: the laser seeker's pointed nose in front of the canards (3.05 m); KAB-1500: the big one (4.6 m, 580 mm).
M['kab-500l'] = { cls: 'guided-bomb', length: 3.05, diameter: 0.35, nose: 'ogive', profile: seeker(0.12, 0.02, 0.175), fins: [{ at: 0.15, span: 0.6, chord: 0.35, tip: 0.1 }, { at: 0.85, span: 0.75, chord: 0.5, tip: 0.3 }] };
M['kab-1500'] = { cls: 'guided-bomb', length: 4.6, diameter: 0.58, nose: 'blunt', fins: [{ at: 0.13, span: 0.9, chord: 0.45, tip: 0.15 }, { at: 0.86, span: 1.2, chord: 0.65, tip: 0.35 }] };

// Rockets: S-5 (57 mm, 1.4 m), S-13 (122 mm, 2.9 m), S-25 (340 mm, 3.3 m, big tail fins), Zuni (127 mm, 2.79 m).
M['s-5'] = { cls: 'rocket', length: 1.4, diameter: 0.057, nose: 'cone', fins: [{ at: 0.95, span: 0.23, chord: 0.05, tip: 0.05, x: true }] };
M['s-13'] = { cls: 'rocket', length: 2.9, diameter: 0.122, nose: 'cone', fins: [{ at: 0.94, span: 0.35, chord: 0.15, tip: 0.12, x: true }] };
M['s-25'] = { cls: 'rocket', length: 3.3, diameter: 0.34, nose: 'ogive', fins: [{ at: 0.9, span: 0.97, chord: 0.35, tip: 0.3, x: true }] };
M['zuni'] = { cls: 'rocket', length: 2.79, diameter: 0.127, nose: 'ogive', fins: [{ at: 0.95, span: 0.4, chord: 0.12, tip: 0.12, x: true }] };

// SAMs: PAC-3 (MIM-104F) - smaller and slimmer than the PAC-2, with small tail fins (5.2 m, 255 mm); 9M311
// (Tunguska) - the fat booster and the thin dart (2.56 m); 9M330 (Tor) - canards and folding tail (2.9 m, 235 mm);
// Igla - the aerospike on the seeker (1.57 m, 72 mm); Mistral - the pyramidal nose (1.86 m, 90 mm).
M['mim-104f'] = { cls: 'sam', length: 5.2, diameter: 0.255, nose: 'cone', profile: seeker(0.12, 0.005, 0.1275), fins: [{ at: 0.4, span: 0.32, chord: 1.2, tip: 0.3 }, { at: 0.94, span: 0.5, chord: 0.25, tip: 0.15, x: true }] };
M['9m311'] = { cls: 'sam', length: 2.56, diameter: 0.152, nose: 'cone', profile: [[0, 0.004], [0.08, 0.03], [0.14, 0.038], [0.62, 0.038], [0.66, 0.076], [1, 0.076]], fins: [{ at: 0.06, span: 0.16, chord: 0.08, tip: 0.03 }, { at: 0.5, span: 0.24, chord: 0.1, tip: 0.06 }, { at: 0.9, span: 0.32, chord: 0.2, tip: 0.1 }] };
M['9m330'] = { cls: 'sam', length: 2.9, diameter: 0.235, nose: 'ogive', profile: seeker(0.12, 0.006, 0.1175), fins: [{ at: 0.1, span: 0.5, chord: 0.18, tip: 0.05 }, { at: 0.85, span: 0.65, chord: 0.35, tip: 0.2 }] };
M['igla'] = { cls: 'manpads', length: 1.57, diameter: 0.072, nose: 'blunt', spike: 0.07, fins: [{ at: 0.12, span: 0.13, chord: 0.05, tip: 0.02 }, { at: 0.95, span: 0.2, chord: 0.06, tip: 0.05 }] };
M['mistral-sam'] = { cls: 'manpads', length: 1.86, diameter: 0.09, nose: 'cone', profile: seeker(0.09, 0.004, 0.045), fins: [{ at: 0.2, span: 0.18, chord: 0.08, tip: 0.03 }, { at: 0.93, span: 0.2, chord: 0.12, tip: 0.06 }] };

// Anti-ship and cruise: Kh-35 (4.4 m, 420 mm; folding cruciform wings, the intake under the body); P-15 Termit
// (5.8 m, 760 mm; a delta wing and three tail fins); Kh-22 (11.65 m, 920 mm; a delta wing); Kh-55 (6.04 m,
// 514 mm; folding straight wings); AGM-86 ALCM (6.32 m, 620 mm; swept wings).
M['kh-35'] = { cls: 'anti-ship', length: 4.4, diameter: 0.42, nose: 'ogive', profile: [[0, 0.01], [0.08, 0.17], [0.14, 0.21], [0.5, 0.21], [0.55, 0.21], [1, 0.2]], fins: [{ at: 0.42, span: 1.33, chord: 0.6, tip: 0.25, x: true }, { at: 0.92, span: 0.9, chord: 0.3, tip: 0.2, x: true }] };
M['p-15-termit'] = { cls: 'anti-ship', length: 5.8, diameter: 0.76, nose: 'ogive', profile: seeker(0.15, 0.03, 0.38), fins: [{ at: 0.84, span: 1.8, chord: 0.9, tip: 0.3 }], wings: { span: 2.4, chord: 1.2, at: 0.62 } };
M['kh-22'] = { cls: 'anti-ship', length: 11.65, diameter: 0.92, nose: 'ogive', profile: seeker(0.14, 0.02, 0.46), fins: [{ at: 0.87, span: 2.2, chord: 1.3, tip: 0.4 }], wings: { span: 3.0, chord: 2.0, at: 0.62 } };
M['kh-55'] = { cls: 'cruise-missile', length: 6.04, diameter: 0.514, nose: 'round', fins: [{ at: 0.95, span: 1.0, chord: 0.3, tip: 0.2, x: true }], wings: { span: 3.1, chord: 0.4, at: 0.45 } };
M['agm-86'] = { cls: 'cruise-missile', length: 6.32, diameter: 0.62, nose: 'round', fins: [{ at: 0.94, span: 1.2, chord: 0.45, tip: 0.25 }], wings: { span: 3.66, chord: 0.55, at: 0.5 } };


// The V-1 flying bomb: a stubby wing, the pulse jet riding on top at the tail (8.32 x 5.37 m).
const A: Named<FixedWingSpec> = {
  'v-1': { cls: 'cruise-missile', length: 8.32, span: 5.37, height: 1.42, bodyWidth: 0.84, bodyHeight: 0.84, nose: 0.25, wing: { x: -0.3, span: 5.37, rootChord: 1.4, tipChord: 1.4, sweep: 0, mount: 0 }, tail: { kind: 'single', finHeight: 0.8, finChord: 1.0, tailSpan: 1.8, tailChord: 0.6 }, engines: { kind: 'tail-top', count: 1, diameter: 0.58 } },
};

/** DCS and Tacview weapon names (lower case) to the figures here and in the starter set. */
const ALIASES: Record<string, string> = {
  'aim-9m': 'aim-9m', 'aim-9l': 'aim-9m', 'aim-9p': 'aim-9p', 'aim-9p5': 'aim-9p', 'aim_9p5': 'aim-9p', 'aim-9j': 'aim-9p', 'aim-9b': 'aim-9b', 'aim_9b': 'aim-9b', 'aim-9e': 'aim-9b', 'aim-9d': 'aim-9d', 'aim-9g': 'aim-9d', 'aim-9h': 'aim-9d', 'aim_9x': 'aim-9x', 'aim_9m': 'aim-9m', 'aim_9l': 'aim-9m', 'aim-9x': 'aim-9x', 'aim-120b': 'aim-120b', 'aim_120b': 'aim-120b', 'aim-120a': 'aim-120b', 'aim-120d': 'aim-120c', 'aim_120d': 'aim-120c', 'aim-120c': 'aim-120c', 'aim_120c': 'aim-120c', 'aim_120': 'aim-120c', 'aim-7m': 'aim-7m', 'aim-7f': 'aim-7m', 'aim-7mh': 'aim-7m', 'aim_54a_mk47': 'aim-54', 'aim_54c_mk47': 'aim-54', 'aim-54': 'aim-54',
  'r-73': 'r-73', 'r-27r': 'r-27r', 'r-27er': 'r-27er', 'r_27er': 'r-27er', 'r-27t': 'r-27t', 'r_27t': 'r-27t', 'r_27r': 'r-27r', 'r_27et': 'r-27et', 'r-77-1': 'r-77', 'r_77': 'r-77', 'r-27et': 'r-27et', 'r-77': 'r-77', 'r-60': 'r-60', 'r-60m': 'r-60', 'r-40r': 'r-40', 'r-40t': 'r-40', 'mica_r': 'mica', 'mica_t': 'mica', 'super_530d': 'super-530', 'pl-12': 'pl-12', 'sd-10': 'pl-12',
  'agm-65d': 'agm-65d', 'agm-65e': 'agm-65e', 'agm_65e': 'agm-65e', 'agm-65l': 'agm-65e', 'agm-114l': 'agm-114l', 'agm_114l': 'agm-114l', 'agm-65g': 'agm-65d', 'agm-65h': 'agm-65d', 'agm-65k': 'agm-65d', 'agm_88': 'agm-88', 'agm-88c': 'agm-88', 'agm_84d': 'agm-84', 'agm-84': 'agm-84', 'agm-84e': 'agm-84', 'agm_154': 'agm-154', 'agm_154a': 'agm-154', 'agm_154c': 'agm-154', 'agm-114k': 'agm-114-hellfire', 'agm_114k': 'agm-114-hellfire', 'agm-158': 'agm-158',
  'kh-29l': 'kh-29l', 'kh_29l': 'kh-29l', 'kh-29t': 'kh-29t', 'kh_29t': 'kh-29t', 'kh-29te': 'kh-29t', 'kh-25ml': 'kh-25', 'kh-25mpu': 'kh-25mp', 'kh-25mp': 'kh-25mp', 'kh_25mpu': 'kh-25mp', 'kh-31a': 'kh-31', 'kh-31p': 'kh-31', 'kh-58u': 'kh-58', 'kh-59m': 'kh-59', 'vikhr_m': 'vikhr', '9m127': 'vikhr', 'bgm_71d': 'tow', 'tow': 'tow', 'exocet': 'exocet', 'am39': 'exocet', 'p-500': 'p-500-bazalt',
  'mk-82': 'mk-82', 'mk_82': 'mk-82', 'mk-83': 'mk-83', 'mk_83': 'mk-83', 'mk-84': 'mk-84', 'mk_84': 'mk-84', 'gbu-12': 'gbu-12', 'gbu_12': 'gbu-12', 'gbu-10': 'gbu-10', 'gbu_10': 'gbu-10', 'gbu-31': 'gbu-31-jdam', 'gbu_31': 'gbu-31-jdam', 'gbu-38': 'gbu-38', 'gbu_38': 'gbu-38', 'gbu-32': 'gbu-32', 'gbu_32_v_2b': 'gbu-32', 'gbu-16': 'gbu-16', 'gbu_16': 'gbu-16', 'gbu-24': 'gbu-24', 'gbu_24': 'gbu-24', 'mk-82snakeye': 'mk-82-snakeye', 'mk_82snakeye': 'mk-82-snakeye', 'mk-82y': 'mk-82-air', 'mk_82air': 'mk-82-air', 'mk-82air': 'mk-82-air',
  'fab-250': 'fab-250', 'fab_250': 'fab-250', 'fab-500': 'fab-500', 'fab_500': 'fab-500', 'kab-500': 'kab-500', 'kab_500kr': 'kab-500', 'kab-500l': 'kab-500l', 'kab_500l': 'kab-500l', 'kab-1500': 'kab-1500', 'kab_1500l': 'kab-1500', 'kab_1500kr': 'kab-1500', 'cbu-87': 'cbu-87', 'cbu_87': 'cbu-87', 'cbu-97': 'cbu-87',
  'sc_250': 'ww2-bomb-250', 'sc_500': 'ww2-bomb-500', 'an_m64': 'ww2-bomb-500', 'an-m64': 'ww2-bomb-500', 'fab-100': 'ww2-bomb-250',
  'hydra_70': 'hydra-70', 'hydra-70': 'hydra-70', 'ffar': 'hydra-70', 's-8kom': 's-8', 's_8kom': 's-8', 's-8': 's-8', 's-24b': 's-24', 's-5': 's-5', 's-5m': 's-5', 's_5m': 's-5', 's-13': 's-13', 's-13of': 's-13', 's-25': 's-25', 's-25ofm': 's-25', 's_25l': 's-25', 'zuni': 'zuni', 'zuni_127': 'zuni', 'kh-35': 'kh-35', 'x_35': 'kh-35', 'p-15': 'p-15-termit', 'p-15u': 'p-15-termit', 'kh-22': 'kh-22', 'x_22': 'kh-22', 'kh-55': 'kh-55', 'x_55': 'kh-55', 'kh-65': 'kh-55', 'agm-86': 'agm-86', 'agm_86': 'agm-86', 'agm-86c': 'agm-86', 's_24b': 's-24', 'rs-82': 'rs-82', 'rs_82': 'rs-82', 'bgm-109': 'bgm-109-tomahawk', 'bgm_109': 'bgm-109-tomahawk', 'tomahawk': 'bgm-109-tomahawk',
  '5v55': '5v55', '48n6': '5v55', '9m38': '9m38', '9m38m1': '9m38', '3m9': '3m9', '3m9m3': '3m9', 'v-750': 'v-750', 'sa2v755': 'v-750', 'mim_104': 'mim-104', 'mim-104': 'mim-104', 'mim_23': 'mim-23', 'mim-23': 'mim-23', 'fim_92': 'stinger', 'fim-92': 'stinger', 'stinger': 'stinger', 'igla': 'igla', 'igla_s': 'igla', '9m39': 'igla', 'mistral': 'mistral-sam', 'pac-3': 'mim-104f', 'mim-104f': 'mim-104f', '9m311': '9m311', '9m330': '9m330', '9m331': '9m330',
};

export const MUNITIONS: SpecSet = { missile: M, air: A, aliases: ALIASES };
