/**
 * Swing wings: the moving outer panels of the swing-wing figures, turned about
 * their pivots, and each figure offered at its end states as figures of their
 * own - `f-14a@spread` (wings forward, take-off and slow flight) and
 * `f-14a@swept` (wings back, high speed) beside `f-14a` at the type's usual
 * sweep in flight. The fixed gloves stay in the figures' own files.
 *
 * Each panel is fitted so its tips meet the published spans at the published
 * end sweeps; the pivot and the panel's chords are estimates from 3-views.
 */

import { atSweep, swingPanel, type FixedWingSpec, type SwingWing } from '../air';
import type { Named, SpecSet } from './index';

type Swing = Omit<SwingWing, 'outer' | 'ref'> & { chord: number; share: number; length: number; tip: number };

/** A panel drawn at the figure's own sweep. */
const S = (p: Swing): SwingWing => ({ pivot: p.pivot, sweep: p.sweep, spread: p.spread, swept: p.swept, mach: p.mach, ref: p.sweep, outer: swingPanel({ ...p }) });

// F-14: 20 degrees spread (19.54 m), 68 swept (11.65 m); shown at 40, its sweep in cruise.
const TOMCAT = S({ pivot: [-1.0, 2.32], chord: 3.0, share: 0.4, sweep: 40, length: 6.02, tip: 1.4, spread: [20, 19.54], swept: [68, 11.65] });
// B-1B: 15 degrees (41.8 m) to 67.5 (24.1 m); shown at 25, its sweep in cruise.
const LANCER = S({ pivot: [-2.0, 4.04], chord: 5.0, share: 0.4, sweep: 25, length: 15.78, tip: 2.3, spread: [15, 41.8], swept: [67.5, 24.1] });
// Tu-160: 20 degrees (55.7 m) to 65 (35.6 m); shown at 35.
const BLACKJACK = S({ pivot: [-2.4, 7.46], chord: 6.0, share: 0.4, sweep: 35, length: 17.72, tip: 2.6, spread: [20, 55.7], swept: [65, 35.6] });
// Tu-22M3: 20 degrees (34.28 m) to 65 (23.3 m); shown at 30, its sweep in cruise.
const BACKFIRE = S({ pivot: [0, 5.1], chord: 5.0, share: 0.4, sweep: 30, length: 11.06, tip: 2.2, spread: [20, 34.28], swept: [65, 23.3] });
// Tornado: 25 degrees (13.91 m) to 67 (8.6 m); shown at 45.
const TORNADO = S({ pivot: [-0.75, 1.52], chord: 2.8, share: 0.4, sweep: 45, length: 4.28, tip: 1.0, spread: [25, 13.91], swept: [67, 8.6] });
// MiG-23 and MiG-27: 16 degrees (13.97 m) to 72 (7.78 m); shown at 45.
const FLOGGER = S({ pivot: [-0.6, 1.66], chord: 2.8, share: 0.4, sweep: 45, length: 3.96, tip: 1.0, spread: [16, 13.97], swept: [72, 7.78] });
// Su-17M and Su-22: 30 degrees (13.68 m) to 63 (10.02 m) out of the big fixed inner wing; shown at 45.
const FITTER = S({ pivot: [-2.38, 2.28], chord: 2.7, share: 0.4, sweep: 45, length: 3.74, tip: 1.0, spread: [30, 13.68], swept: [63, 10.02] });
// Su-24M: 16 degrees (17.64 m) to 69 (10.37 m); shown at 35, its sweep in cruise.
const FENCER = S({ pivot: [-0.6, 1.54], chord: 4.0, share: 0.4, sweep: 35, length: 6.28, tip: 1.3, spread: [16, 17.64], swept: [69, 10.37] });
// F-111A/F: 16 degrees (19.2 m) to 72.5 (9.74 m); the F-111C's long FB-111 wing 21.34 / 10.34 m; shown at 26, cruise.
const AARDVARK = S({ pivot: [-0.2, 1.2], chord: 3.6, share: 0.4, sweep: 26, length: 7.86, tip: 1.4, spread: [16, 19.2], swept: [72.5, 9.74] });
const AARDVARK_LONG = S({ pivot: [-0.2, 1.14], chord: 3.6, share: 0.4, sweep: 26, length: 8.92, tip: 1.4, spread: [16, 21.34], swept: [72.5, 10.34] });

/** The swing-wing figures' outer panels, by catalogue name. */
export const SWING_PANELS: Record<string, SwingWing> = {
  'f-14a': TOMCAT, 'f-14b': TOMCAT, 'f-14d': TOMCAT,
  'b-1b': LANCER,
  'tu-160': BLACKJACK,
  'tu-22m3': BACKFIRE,
  'tornado-ids': TORNADO, 'tornado-adv': TORNADO,
  'mig-23mf': FLOGGER, 'mig-23mld': FLOGGER, 'mig-27k': FLOGGER,
  'su-17m2': FITTER, 'su-17m4': FITTER, 'su-22um3k': FITTER,
  'su-24m': FENCER,
  'f-111a': AARDVARK, 'f-111f': AARDVARK, 'f-111c': AARDVARK_LONG,
};

/** Per swing-wing figure (the plain name), the Mach thresholds replay picks its states by. */
export const SWING_MACH = new Map<string, [number, number]>();

/**
 * The swing-wing figures of the sets before it, with their panels, at their own
 * sweep and at both end states. Goes last in the list, so it sees every
 * figure as finally defined; a figure may also carry its own `swing`.
 */
export function swingStates(sets: SpecSet[]): SpecSet {
  const all: Named<FixedWingSpec> = Object.assign({}, ...sets.map((s) => s.air ?? {}));
  const air: Named<FixedWingSpec> = {};
  for (const [name, spec] of Object.entries(all)) {
    const swing = spec.swing ?? SWING_PANELS[name];
    if (!swing || name.includes('@')) continue;
    const base = { ...spec, swing };
    air[name] = atSweep(base, swing.sweep);
    air[`${name}@spread`] = atSweep(base, swing.spread[0]);
    air[`${name}@swept`] = atSweep(base, swing.swept[0]);
    SWING_MACH.set(name, swing.mach ?? [0.4, 0.8]);
  }
  return { air };
}
