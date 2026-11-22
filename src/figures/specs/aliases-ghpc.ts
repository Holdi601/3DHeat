/**
 * Gunner, HEAT, PC! vehicle names, as its recorder mod writes them (the
 * game's own unit names, `Vehicle`, and display names, `VehicleName`), mapped
 * to catalogue figures. The game models Cold War armour of the late 1980s, all
 * of it real designs, so each maps to its own figure. Both spellings are kept:
 * with the dash and space a display name has, and without, as an id has them.
 * The names are those the game shows; the recorder's first files will say
 * whether its ids differ.
 */

import type { SpecSet } from './index';

// No name may mean two figures across the sets (specs.test.ts): one another set maps already is left to it.
const NAMES: Array<[string[], string]> = [
  [['m1'], 'm1-abrams'],
  [['m1ip', 'm1ip abrams', 'm1 ip'], 'm1ip-abrams'],
  [['m1a1', 'm1a1 abrams'], 'm1a1-abrams'],
  [['m60a1', 'm60a1 rise', 'm60a1 rise passive', 'm60a1 aos'], 'm60a1'],
  [['m60a3', 'm60a3 tts'], 'm60a3'],
  [['m2 bradley', 'm2bradley', 'm2a0', 'm3 bradley', 'm3bradley'], 'm2-bradley'],
  [['m2a2', 'm2a2 bradley'], 'm2a2-bradley'],
  [['m113', 'm113a1', 'm113a2', 'm113a3'], 'm113'],
  [['t-72', 't72'], 't-72a'],
  [['t-72m', 't72m', 't-72m1', 't72m1', 't-72a', 't72a'], 't-72a'],
  [['t-72 ural', 't72ural', 't-72 uralvd', 't72uralvd'], 't-72-ural'],
  [['t-64a', 't64a', 't-64a 1981', 't-64a 1983', 't-64a 1984'], 't-64a'],
  [['t-64b', 't64b'], 't-64b'],
  [['t-62', 't62'], 't-62'],
  [['t-55a', 't55a', 't-55', 't55'], 't-55a'],
  [['t-54a', 't54a', 't-54', 't54'], 't-54'],
  [['t-80b', 't80b'], 't-80b'],
  [['bmp-1', 'bmp1'], 'bmp-1'],
  [['bmp-1p', 'bmp1p'], 'bmp-1p'],
  [['bmp-2', 'bmp2'], 'bmp-2'],
  [['brdm-2', 'brdm2'], 'brdm-2'],
  [['btr-60pb', 'btr60pb', 'btr-60', 'btr60'], 'btr-60'],
  [['btr-70', 'btr70'], 'btr-70'],
  [['pt-76b', 'pt76b', 'pt-76', 'pt76'], 'pt-76'],
  [['ural-375d', 'ural375d', 'ural', 'ural-375'], 'ural-4320'],
  [['uaz-469', 'uaz469'], 'uaz-469'],
  [['leopard 1a3', 'leopard1a3', 'leopard a3'], 'leopard-1a3'],
  [['leopard a1a1', 'leopard 1a1a1', 'leopard1a1a1'], 'leopard-1a1a1'],
  [['leopard 1a1', 'leopard1a1', 'leopard a1'], 'leopard-1a1'],
  [['marder 1a2', 'marder1a2', 'marder a1+', 'marder 1a1', 'marder1a1', 'marder a1'], 'marder-1a1'],
  [['marder 1a3', 'marder1a3'], 'marder-1a3'],
];

const ALIASES: Record<string, string> = {};
for (const [names, figure] of NAMES) for (const name of names) ALIASES[name] = figure;

export const GHPC_ALIASES: SpecSet = { aliases: ALIASES };
