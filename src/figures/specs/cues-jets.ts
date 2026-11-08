/**
 * Recognition cues for jet aircraft families (see cues.ts) the earlier air
 * entries left out: what a recognition manual names first - the engines'
 * number and where the air goes in (nose, chin, sides, under), the wing
 * (straight, swept, delta, swing, high or low), the tail (single, twin, T,
 * none), canards and strakes, the canopy.
 *
 * Written from the real aircraft's published appearance (US recognition
 * manuals, published data); no game data.
 */

import type { FixedWingSpec } from '../air';
import { lerpPoly, type Outline, type P2 } from '../parts';
import type { Cue, CueEntry } from './cues';

type Air = FixedWingSpec;
const jet = (figures: string | string[], cues: Cue<Air>[]): CueEntry<'air'> => ({ domain: 'air', figures: typeof figures === 'string' ? [figures] : figures, cues });

// Checks on a fixed-wing spec (as cues.ts measures them).
const front = (o: Outline) => Math.max(...o.plan.map((p) => p[0]));
const halfWidth = (o: Outline) => Math.max(...o.plan.map((p) => p[1]));
const noseX = (s: Air) => (s.fuselage ? front(s.fuselage) : s.length / 2);
const topAt = (s: Air, x: number) => (s.fuselage ? lerpPoly(s.fuselage.top, x) : s.bodyHeight / 2);
const bottomAt = (s: Air, x: number) => (s.fuselage ? lerpPoly(s.fuselage.bottom, x) : -s.bodyHeight / 2);
const planSpan = (s: Air) => Math.max(...(s.wingPlan ?? [[0, s.span / 2] as P2]).map((q) => q[1]));
const rootLE = (s: Air): P2 => (s.wingPlan ?? [[s.wing.x + s.wing.rootChord / 2, 0] as P2]).reduce((a, q) => (q[0] > a[0] || (q[0] === a[0] && q[1] > a[1]) ? q : a));
/** The leading edge's sweep from the root's foremost point to the tip's, degrees (a swing wing at its own sweep). */
const sweepOf = (s: Air) => {
  if (s.swing) return s.swing.sweep;
  const p = s.wingPlan;
  if (!p) return s.wing.sweep ?? 0;
  const y1 = planSpan(s);
  const tip = Math.max(...p.filter((q) => q[1] >= y1 - 0.05).map((q) => q[0]));
  const [x0, y0] = rootLE(s);
  return (Math.atan2(x0 - tip, y1 - y0) * 180) / Math.PI;
};
/** An open nose intake: the body still 0.6 m deep a quarter metre behind its lip. */
const openNose = (s: Air) => topAt(s, noseX(s) - 0.25) - bottomAt(s, noseX(s) - 0.25) >= 0.6;
/** A strake along the wing root: in the planform (a run swept over 63 degrees), or a broad flat body ahead of the wing. */
const strakes = (s: Air) => {
  if (s.lerx) return true;
  const p = s.wingPlan ?? [];
  const tip = p.findIndex((q) => q[1] === planSpan(s));
  if (p.slice(0, tip).some((a, i) => a[0] - p[i + 1][0] >= 0.4 && p[i + 1][1] > a[1] && a[0] - p[i + 1][0] >= 2 * (p[i + 1][1] - a[1]))) return true;
  return (s.bodies ?? []).some((b) => !b.side && halfWidth(b) >= 1.5 && front(b) > rootLE(s)[0] - 1);
};
const engines = (n: number): Cue<Air> => ({ cue: n === 1 ? 'one jet engine' : `${n} jet engines`, check: (s) => s.engines?.count === n });
const swept = (min: number, cue = `swept wing, ${min} degrees or more`): Cue<Air> => ({ cue, check: (s) => sweepOf(s) >= min });
const straight = (cue = 'straight wing'): Cue<Air> => ({ cue, check: (s) => sweepOf(s) < 20 });
const tailless = (cue = 'tailless delta wing, no tailplane'): Cue<Air> => ({ cue, check: (s) => s.tail.tailSpan <= 0.5 || s.tail.kind === 'none' });
const tailedDelta: Cue<Air> = { cue: 'delta wing with a separate tailplane', check: (s) => sweepOf(s) >= 50 && s.tail.tailSpan > 1 };
const highWing: Cue<Air> = { cue: 'wing high on the body', check: (s) => (s.wing.mount ?? 0) > 0 };
const lowWing: Cue<Air> = { cue: 'wing low on the body', check: (s) => (s.wing.mount ?? 0) < 0 };
const tTail: Cue<Air> = { cue: 'T-tail, the tailplane on top of the fin', check: (s) => s.tail.kind === 't' };
const twinFins: Cue<Air> = { cue: 'twin fins', check: (s) => s.tail.kind === 'twin' };
const singleFin: Cue<Air> = { cue: 'single fin', check: (s) => s.tail.kind === 'single' || s.tail.kind === 't' };
const canard: Cue<Air> = { cue: 'canard foreplanes', check: (s) => !!s.canard };
const swing: Cue<Air> = { cue: 'swing wing', check: (s) => !!s.swing };
const lerx: Cue<Air> = { cue: 'wing-root strakes (LERX) along the forebody', check: strakes };
const tandem: Cue<Air> = { cue: 'tandem two-seat canopy', check: (s) => s.canopy?.kind === 'tandem' || (s.glass?.length ?? 0) >= 2 || (s.glass ?? []).some((g) => front(g) - Math.min(...g.plan.map((p) => p[0])) >= 2.6) };
const bubble: Cue<Air> = { cue: 'bubble canopy', check: (s) => s.canopy?.kind === 'bubble' };
const anhedral: Cue<Air> = { cue: 'wing with anhedral', check: (s) => (s.wing.dihedral ?? 0) < 0 };
const droopTail: Cue<Air> = { cue: 'tailplane with marked anhedral', check: (s) => (s.tail.planeDihedral ?? 0) <= -5 };
const booms: Cue<Air> = { cue: 'twin tail booms', check: (s) => !!s.booms || (s.bodies ?? []).some((b) => Math.abs(b.side ?? 0) >= 1 && front(b) - Math.min(...b.plan.map((p) => p[0])) >= 3) };
const noseIntake: Cue<Air> = { cue: 'round nose intake', check: openNose };
/** Intakes elsewhere (sides, chin, under the wing roots): the nose closed by a radome or solid. */
const sideIntakes: Cue<Air> = { cue: 'intakes on the body sides, the nose closed', check: (s) => !openNose(s) };
const chinIntake: Cue<Air> = { cue: 'intake under the nose, the nose closed', check: (s) => !openNose(s) };
const underIntakes: Cue<Air> = { cue: 'intakes under the wing roots, the nose closed', check: (s) => !openNose(s) };

export const JET_CUES: Record<string, CueEntry> = {
  'jet-f-16s': jet(['f-16c', 'f-16d', 'f-16d-spine'], [engines(1), chinIntake, lerx, singleFin, swept(35, 'cropped delta-like wing, about 40 degrees')]),
  'jet-f-16c': jet('f-16c', [bubble]),
  'jet-f-16-two-seat': jet(['f-16d', 'f-16d-spine'], [tandem]),
  'jet-f-16xl': jet('f-16xl', [engines(1), chinIntake, tailless('cranked-arrow delta, no tailplane')]),
  'jet-tornados': jet(['tornado-ids', 'tornado-adv'], [swing, engines(2), sideIntakes, singleFin, tandem]),
  'jet-canberras': jet(['canberra', 'b-57b'], [engines(2), singleFin, { cue: 'engines in nacelles out on the wings', check: (s) => !!s.engines?.nozzles?.every((n) => Math.abs(n[1]) > 1.5) }]),
  'jet-phantoms': jet(['f-4e', 'f-4j', 'f-4k', 'f-4b'], [engines(2), sideIntakes, droopTail, { cue: 'outer wings bent up', check: (s) => !!s.wing.outerDihedral }, tandem]),
  'jet-hornets': jet(['f-a-18c', 'f-a-18d', 'f-a-18f'], [engines(2), twinFins, lerx, sideIntakes]),
  'jet-jaguars': jet(['jaguar', 'jaguar-gr1', 'jaguar-t2'], [engines(2), highWing, sideIntakes, droopTail]),
  'jet-f-84g': jet('f-84g', [engines(1), noseIntake, straight()]),
  'jet-f-84f': jet('f-84f', [engines(1), noseIntake, swept(35)]),
  'jet-mig-21s': jet(['mig-21bis', 'mig-21mf', 'mig-21f-13', 'j-7e'], [engines(1), noseIntake, tailedDelta]),
  'jet-mig-15s': jet(['mig-15bis', 'mig-17', 'mig-17pf', 'mig-15bis-ish'], [engines(1), noseIntake, swept(35)]),
  'jet-viggen': jet('ajs-37', [canard, engines(1), sideIntakes, tailless('delta main wing, no tailplane')]),
  'jet-f-5a': jet('f-5a', [engines(2), sideIntakes, lowWing]),
  'jet-f-20': jet('f-20', [engines(1), sideIntakes, lowWing]),
  'jet-gripens': jet(['jas-39', 'jas-39d'], [canard, engines(1), sideIntakes, tailless('delta wing, no tailplane')]),
  'jet-fulcrums': jet(['mig-29a', 'mig-29k', 'mig-29-9-13', 'mig-35'], [engines(2), twinFins, underIntakes, lerx]),
  'jet-mirage-deltas': jet(['mirage-2000c', 'mirage-2000d', 'mirage-iii', 'mirage-5'], [engines(1), sideIntakes, tailless()]),
  'jet-mirage-4000': jet('mirage-4000', [engines(2), sideIntakes, tailless()]),
  'jet-kfir': jet('kfir', [engines(1), sideIntakes, canard, tailless()]),
  'jet-a-7s': jet(['a-7', 'a-7k'], [engines(1), { cue: 'wide intake mouth under a small nose radome', check: openNose }, highWing]),
  'jet-g-91': jet('g-91', [engines(1), noseIntake, swept(30)]),
  'jet-g-91y': jet('g-91y', [engines(2), noseIntake, swept(30)]),
  'jet-jh-7': jet('jh-7', [engines(2), highWing, sideIntakes, tandem]),
  'jet-meteors': jet(['meteor', 'meteor-f3', 'meteor-nf'], [engines(2), straight()]),
  'jet-mysteres': jet(['mystere', 'mystere-iv'], [engines(1), noseIntake, swept(30)]),
  'jet-ouragan': jet('ouragan', [engines(1), noseIntake, straight('nearly straight wing')]),
  'jet-flankers': jet(['su-27', 'su-34'], [engines(2), twinFins, underIntakes, lerx]),
  'jet-su-7b': jet('su-7b', [engines(1), noseIntake, swept(55)]),
  'jet-alpha-jets': jet(['alpha-jet-a', 'alpha-jet-e'], [engines(2), highWing, sideIntakes, tandem, anhedral]),
  'jet-aardvarks': jet(['f-111f', 'f-111a', 'f-111c'], [swing, engines(2), sideIntakes, singleFin]),
  'jet-hunters': jet(['hunter', 'hunter-fga9'], [engines(1), sideIntakes, swept(35)]),
  'jet-q-5': jet('q-5', [engines(2), sideIntakes, swept(45)]),
  'jet-frogfoots': jet(['su-25', 'su-25t'], [engines(2), highWing]),
  'jet-su-25': jet('su-25', [sideIntakes]),
  'jet-twin-boom-jets': jet(['vampire', 'venom', 'sea-venom', 'saab-21r'], [booms, engines(1)]),
  'jet-sea-vixen': jet('sea-vixen-faw2', [booms, engines(2)]),
  'jet-a-10c': jet('a-10c', [engines(2), twinFins, straight()]),
  'jet-super-sabres': jet(['f-100d', 'f-100f'], [engines(1), noseIntake, swept(45)]),
  'jet-f-104s': jet('f-104s', [engines(1), sideIntakes, tTail, anhedral]),
  'jet-f-105d': jet('f-105d', [engines(1), sideIntakes, swept(45)]),
  'jet-tomcats': jet(['f-14a', 'f-14d'], [swing, engines(2), twinFins, sideIntakes]),
  'jet-hawks': jet(['hawk-200', 'bae-hawk'], [engines(1), sideIntakes, lowWing]),
  'jet-tunnan': jet('j29-tunnan', [engines(1), noseIntake, swept(25)]),
  'jet-floggers': jet(['mig-23mf', 'mig-23mld', 'mig-27k'], [swing, engines(1), sideIntakes]),
  'jet-fitters': jet(['su-17m2', 'su-22um3k'], [swing, engines(1), noseIntake]),
  'jet-sea-hawk': jet('sea-hawk', [{ cue: 'one engine exhausting through split jet pipes at both wing roots', check: (s) => (s.engines?.nozzles?.length ?? 0) === 2 }, straight()]),
  'jet-vautours': jet(['vautour-iia', 'vautour-iib', 'vautour-iin'], [engines(2), swept(30)]),
  'jet-skyhawks': jet(['a-4e', 'a-4h', 'a-4b', 'a-4f', 'a-4n'], [engines(1), sideIntakes, lowWing]),
  'jet-amx': jet('amx', [engines(1), sideIntakes]),
  'jet-buccaneers': jet(['buccaneer', 'buccaneer-s1'], [engines(2), tTail]),
  'jet-delta-darts': jet(['f-102a-late', 'f-106a'], [engines(1), sideIntakes, tailless()]),
  'jet-f-2a': jet('f-2a', [engines(1), chinIntake]),
  'jet-f-80c': jet('f-80c', [engines(1), sideIntakes, straight()]),
  'jet-crusaders': jet(['f-8e', 'f-8c'], [engines(1), chinIntake, highWing]),
  'jet-panther': jet('f9f-panther', [engines(1), straight()]),
  'jet-cougar': jet('f9f-cougar', [engines(1), swept(30)]),
  'jet-fj-4': jet('fj-4', [engines(1), noseIntake, swept(30)]),
  'jet-he-162': jet('he-162', [twinFins, highWing]),
  'jet-j-10s': jet(['j-10', 'j-10c'], [canard, engines(1), tailless('delta wing, no tailplane')]),
  'jet-j-8b': jet('j-8b', [engines(2), sideIntakes, tailedDelta]),
  'jet-lansens': jet(['j32-lansen', 'j32b'], [engines(1), sideIntakes, swept(30)]),
  'jet-drakens': jet(['j35f', 'j35-draken', 'j35a'], [engines(1), sideIntakes, tailless('double-delta wing, no tailplane')]),
  'jet-l-39': jet('l-39', [engines(1), sideIntakes, straight(), tandem]),
  'jet-la-15': jet('la-15', [engines(1), noseIntake, swept(30), highWing]),
  'jet-lightning': jet('lightning-f6', [engines(2), noseIntake, swept(55)]),
  'jet-mig-19s': jet(['mig-19p', 'mig-19s'], [engines(2), noseIntake, swept(55)]),
  'jet-t-2s': jet(['t-2', 'mitsubishi-f1'], [engines(2), highWing, sideIntakes]),
};
