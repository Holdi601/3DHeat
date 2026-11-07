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

const M: Named<MissileFigureSpec> = {};

// ---------------------------------------------------------------- air-to-air

M['aim-54'] = { cls: 'aam', length: 3.96, diameter: 0.38, nose: 'ogive', fins: [{ at: 0.82, span: 0.91, chord: 0.6 }, { at: 0.5, span: 0.6, chord: 0.7 }] };
M['aim-9x'] = { cls: 'aam', length: 3.02, diameter: 0.127, nose: 'blunt', fins: [{ at: 0.18, span: 0.2, chord: 0.12 }, { at: 0.9, span: 0.45, chord: 0.2 }] };
M['r-27et'] = { cls: 'aam', length: 4.5, diameter: 0.26, nose: 'blunt', fins: [{ at: 0.35, span: 0.8, chord: 0.7 }, { at: 0.88, span: 0.8, chord: 0.35 }] };
M['r-77'] = { cls: 'aam', length: 3.6, diameter: 0.2, nose: 'ogive', fins: [{ at: 0.45, span: 0.4, chord: 0.35 }, { at: 0.95, span: 0.7, chord: 0.12, x: true }] };
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

// The V-1 flying bomb: a stubby wing, the pulse jet riding on top at the tail (8.32 x 5.37 m).
const A: Named<FixedWingSpec> = {
  'v-1': { cls: 'cruise-missile', length: 8.32, span: 5.37, height: 1.42, bodyWidth: 0.84, bodyHeight: 0.84, nose: 0.25, wing: { x: -0.3, span: 5.37, rootChord: 1.4, tipChord: 1.4, sweep: 0, mount: 0 }, tail: { kind: 'single', finHeight: 0.8, finChord: 1.0, tailSpan: 1.8, tailChord: 0.6 }, engines: { kind: 'tail-top', count: 1, diameter: 0.58 } },
};

/** DCS and Tacview weapon names (lower case) to the figures here and in the starter set. */
const ALIASES: Record<string, string> = {
  'aim-9m': 'aim-9m', 'aim-9l': 'aim-9m', 'aim-9p': 'aim-9m', 'aim-9x': 'aim-9x', 'aim-120b': 'aim-120c', 'aim-120c': 'aim-120c', 'aim_120c': 'aim-120c', 'aim_120': 'aim-120c', 'aim-7m': 'aim-7m', 'aim-7f': 'aim-7m', 'aim-7mh': 'aim-7m', 'aim_54a_mk47': 'aim-54', 'aim_54c_mk47': 'aim-54', 'aim-54': 'aim-54',
  'r-73': 'r-73', 'r-27r': 'r-27r', 'r-27er': 'r-27r', 'r-27t': 'r-27et', 'r-27et': 'r-27et', 'r-77': 'r-77', 'r-60': 'r-60', 'r-60m': 'r-60', 'r-40r': 'r-40', 'r-40t': 'r-40', 'mica_r': 'mica', 'mica_t': 'mica', 'super_530d': 'super-530', 'pl-12': 'pl-12', 'sd-10': 'pl-12',
  'agm-65d': 'agm-65d', 'agm-65e': 'agm-65d', 'agm-65g': 'agm-65d', 'agm-65h': 'agm-65d', 'agm-65k': 'agm-65d', 'agm_88': 'agm-88', 'agm-88c': 'agm-88', 'agm_84d': 'agm-84', 'agm-84': 'agm-84', 'agm-84e': 'agm-84', 'agm_154': 'agm-154', 'agm_154a': 'agm-154', 'agm_154c': 'agm-154', 'agm-114k': 'agm-114-hellfire', 'agm_114k': 'agm-114-hellfire', 'agm-158': 'agm-158',
  'kh-29l': 'kh-29', 'kh-29t': 'kh-29', 'kh-25ml': 'kh-25', 'kh-25mpu': 'kh-25', 'kh-31a': 'kh-31', 'kh-31p': 'kh-31', 'kh-58u': 'kh-58', 'kh-59m': 'kh-59', 'vikhr_m': 'vikhr', '9m127': 'vikhr', 'bgm_71d': 'tow', 'tow': 'tow', 'exocet': 'exocet', 'am39': 'exocet', 'p-500': 'p-500-bazalt',
  'mk-82': 'mk-82', 'mk_82': 'mk-82', 'mk-83': 'mk-83', 'mk_83': 'mk-83', 'mk-84': 'mk-84', 'mk_84': 'mk-84', 'gbu-12': 'gbu-12', 'gbu_12': 'gbu-12', 'gbu-10': 'gbu-10', 'gbu_10': 'gbu-10', 'gbu-31': 'gbu-31-jdam', 'gbu_31': 'gbu-31-jdam', 'gbu-38': 'gbu-31-jdam', 'gbu_38': 'gbu-31-jdam',
  'fab-250': 'fab-250', 'fab_250': 'fab-250', 'fab-500': 'fab-500', 'fab_500': 'fab-500', 'kab-500': 'kab-500', 'kab_500kr': 'kab-500', 'cbu-87': 'cbu-87', 'cbu_87': 'cbu-87', 'cbu-97': 'cbu-87',
  'sc_250': 'ww2-bomb-250', 'sc_500': 'ww2-bomb-500', 'an_m64': 'ww2-bomb-500', 'an-m64': 'ww2-bomb-500', 'fab-100': 'ww2-bomb-250',
  'hydra_70': 'hydra-70', 'hydra-70': 'hydra-70', 'ffar': 'hydra-70', 's-8kom': 's-8', 's_8kom': 's-8', 's-8': 's-8', 's-24b': 's-24', 's_24b': 's-24', 'rs-82': 'rs-82', 'rs_82': 'rs-82', 'bgm-109': 'bgm-109-tomahawk', 'bgm_109': 'bgm-109-tomahawk', 'tomahawk': 'bgm-109-tomahawk',
  '5v55': '5v55', '48n6': '5v55', '9m38': '9m38', '9m38m1': '9m38', '3m9': '3m9', '3m9m3': '3m9', 'v-750': 'v-750', 'sa2v755': 'v-750', 'mim_104': 'mim-104', 'mim-104': 'mim-104', 'mim_23': 'mim-23', 'mim-23': 'mim-23', 'fim_92': 'stinger', 'fim-92': 'stinger', 'stinger': 'stinger', 'igla': 'stinger',
};

export const MUNITIONS: SpecSet = { missile: M, air: A, aliases: ALIASES };
