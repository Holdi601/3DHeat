/**
 * Recognition cues for the aircraft the earlier entries left out (see
 * cues.ts): the engines' number and where they sit (in the body, in pods
 * under the wing, a nose propeller, a pusher), the wing's place and shape
 * (high, low, parasol, swept, straight, swing, anhedral), the tail (single,
 * twin, T, V, none), canards, booms, the canopy.
 *
 * Written from the real aircraft's published appearance (recognition
 * manuals, three-view drawings, published data); no game data.
 */

import type { FixedWingSpec } from '../air';
import { lerpPoly, type Outline, type P2 } from '../parts';
import type { Cue, CueEntry } from './cues';

type Air = FixedWingSpec;
const air = (figures: string | string[], cues: Cue<Air>[]): CueEntry<'air'> => ({ domain: 'air', figures: typeof figures === 'string' ? [figures] : figures, cues });

// Checks on a fixed-wing spec.
const front = (o: Outline) => Math.max(...o.plan.map((p) => p[0]));
const back = (o: Outline) => Math.min(...o.plan.map((p) => p[0]));
const halfWidth = (o: Outline) => Math.max(...o.plan.map((p) => p[1]));
const out = (o: Outline) => Math.abs(o.side ?? 0);
const bodiesOf = (s: Air) => s.bodies ?? [];
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
/** Engine pods or nacelles off the body: bodies set out at least a metre, long enough for an engine (each mirrored pair counts once). */
const pods = (s: Air, min = 2) => bodiesOf(s).filter((b) => out(b) >= 1 && front(b) - back(b) >= min).length;
const jets = (n: number) => (s: Air) => s.engines?.kind === 'internal' && s.engines.count === n;
const props = (s: Air) => s.props?.length ?? (s.propeller ? 1 : 0);
const blades = (n: number) => (s: Air) => (s.propeller?.blades ?? s.props?.[0]?.blades) === n;
const dihedral = (s: Air) => s.wing.dihedral ?? 0;
const mount = (s: Air) => s.wing.mount ?? 0;
const tipTanks = (s: Air) => bodiesOf(s).some((b) => out(b) >= (s.span / 2) * 0.85 && halfWidth(b) >= 0.2);
const glazedNose = (s: Air) => (s.glass ?? []).some((g) => front(g) > noseX(s) - 1);

const E = (n: number): Cue<Air> => ({ cue: n === 1 ? 'one jet engine' : `${n} jet engines`, check: jets(n) });
const swept = (min: number, cue = `swept wing, ${min} degrees or more`): Cue<Air> => ({ cue, check: (s) => sweepOf(s) >= min });
const straight = (cue = 'straight wing'): Cue<Air> => ({ cue, check: (s) => sweepOf(s) < 20 });
const highWing: Cue<Air> = { cue: 'wing high on the body', check: (s) => mount(s) > 0.3 };
const lowWing: Cue<Air> = { cue: 'wing low on the body', check: (s) => mount(s) < -0.3 };
const midWing: Cue<Air> = { cue: 'wing at mid height on the body', check: (s) => Math.abs(mount(s)) <= 0.3 };
const anhedral: Cue<Air> = { cue: 'wing with anhedral', check: (s) => dihedral(s) < 0 };
const droopTail: Cue<Air> = { cue: 'tailplane with marked anhedral', check: (s) => (s.tail.planeDihedral ?? 0) <= -5 };
const singleFin: Cue<Air> = { cue: 'single fin', check: (s) => s.tail.kind === 'single' || s.tail.kind === 't' };
const twinFins: Cue<Air> = { cue: 'twin fins', check: (s) => s.tail.kind === 'twin' };
const tTail: Cue<Air> = { cue: 'T-tail, the tailplane on top of the fin', check: (s) => s.tail.kind === 't' };
const vTail: Cue<Air> = { cue: 'V-tail', check: (s) => s.tail.kind === 'v' };
const raisedPlane: Cue<Air> = { cue: 'tailplane set up the fin', check: (s) => (s.tail.planeUp ?? 0) >= 0.5 };
const tailless: Cue<Air> = { cue: 'delta wing, no tailplane', check: (s) => s.tail.tailSpan <= 0.5 };
const tailplane: Cue<Air> = { cue: 'conventional tailplane', check: (s) => s.tail.tailSpan > 1 };
const canard: Cue<Air> = { cue: 'canard foreplanes', check: (s) => !!s.canard };
const swing: Cue<Air> = { cue: 'swing wing', check: (s) => !!s.swing };
const bubble: Cue<Air> = { cue: 'bubble canopy', check: (s) => s.canopy?.kind === 'bubble' };
const framed: Cue<Air> = { cue: 'framed canopy', check: (s) => s.canopy?.kind === 'framed' };
const tandem: Cue<Air> = { cue: 'tandem two-seat canopy', check: (s) => s.canopy?.kind === 'tandem' || (s.glass?.length ?? 0) >= 2 || (s.glass ?? []).some((g) => front(g) - back(g) >= 2.6) };
const noseIntake: Cue<Air> = { cue: 'round nose intake', check: openNose };
const sideIntakes: Cue<Air> = { cue: 'intakes on the body sides, the nose closed', check: (s) => !openNose(s) };
const underPods = (n: number, cue = `${n * 2} engines in pods or nacelles on the wings`): Cue<Air> => ({ cue, check: (s) => pods(s) >= n });
const tips: Cue<Air> = { cue: 'tip tanks', check: tipTanks };
const glassNose: Cue<Air> = { cue: 'glazed nose', check: glazedNose };

export const MORE_AIR_CUES: Record<string, CueEntry> = {
  // Catalogue aircraft by unit count (round v5).
  'mirage-f1': air('mirage-f1', [E(1), highWing, swept(40), { cue: 'tailplane behind a swept wing (not a delta like the Mirage III)', check: (s) => s.tail.tailSpan > 1 }, sideIntakes, bubble]),
  'mirage-f1b': air('mirage-f1b', [E(1), highWing, swept(40), tailplane, sideIntakes, tandem]),
  'ww2-fighter': air('ww2-fighter', [{ cue: 'one propeller in the nose', check: (s) => s.engines?.kind === 'nose-prop' }, lowWing, bubble]),
  'me-262': air('me-262', [underPods(1, 'two jets in nacelles under the wings'), lowWing, swept(15, 'lightly swept outer wing'), singleFin]),
  'c-130h-hercules': air('c-130h-hercules', [{ cue: 'four turboprops', check: (s) => props(s) === 4 }, highWing, { cue: 'four-bladed propellers', check: blades(4) }, singleFin, raisedPlane]),
  'av-8a': air('av-8a', [highWing, anhedral, droopTail, sideIntakes, bubble]),
  'av-8b': air('av-8b', [highWing, anhedral, droopTail, sideIntakes, bubble]),
  'av-8b-plus': air('av-8b-plus', [highWing, anhedral, droopTail, sideIntakes, bubble]),
  'sea-harrier-frs1': air('sea-harrier-frs1', [highWing, anhedral, droopTail, sideIntakes, bubble]),
  'il-28': air('il-28', [underPods(1, 'two jets in nacelles under the wings'), straight(), glassNose, singleFin]),
  'etendard-iv': air('etendard-iv', [E(1), midWing, swept(40), sideIntakes, bubble]),
  etendard: air('etendard', [E(1), midWing, swept(40), sideIntakes, bubble]),
  'vtol-gunship': air('vtol-gunship', [{ cue: 'two prop rotors at the wing tips', check: (s) => s.engines?.kind === 'wing-props' && s.engines.count === 2 }, twinFins, tandem]),
  'vtol-transport': air('vtol-transport', [{ cue: 'two prop rotors at the wing tips', check: (s) => s.engines?.kind === 'wing-props' && s.engines.count === 2 }, highWing, singleFin]),
  'drone-fixed': air('drone-fixed', [{ cue: 'pusher propeller at the tail', check: (s) => s.engines?.kind === 'pusher' }, vTail, { cue: 'long straight wing, wider than the body is long', check: (s) => s.span > s.length }]),
  'mig-9': air('mig-9', [noseIntake, straight(), raisedPlane, bubble]),
  'ar-234': air('ar-234', [underPods(1, 'two jets in nacelles under the wings'), highWing, straight(), singleFin]),
  'f-22': air('f-22', [E(2), twinFins, swept(40, 'diamond wing'), sideIntakes, bubble]),
  'mig-25pd': air('mig-25pd', [E(2), twinFins, highWing, anhedral, sideIntakes]),
  'a-6e': air('a-6e', [E(2), midWing, swept(20), singleFin, sideIntakes]),
  'yak-15': air('yak-15', [noseIntake, straight(), bubble]),
  'saab-105': air('saab-105', [tTail, highWing, anhedral, bubble]),
  'saab-j21a': air('saab-j21a', [{ cue: 'pusher propeller between twin booms', check: (s) => (s.props ?? []).some((p) => p.side === 0) }, twinFins, bubble, { cue: 'twin tail booms', check: (s) => bodiesOf(s).some((b) => out(b) >= 1 && front(b) - back(b) >= 3) }]),
  'd-371': air('d-371', [{ cue: 'parasol wing over the body', check: (s) => mount(s) > 1.5 }, singleFin, { cue: 'three-bladed propeller', check: blades(3) }]),
  'canberra-b8': air('canberra-b8', [{ cue: 'engines in nacelles out on the wings', check: (s) => !!s.engines?.nozzles?.every((n) => Math.abs(n[1]) > 1.5) }, straight(), { cue: 'offset fighter-style canopy', check: (s) => s.canopy?.kind === 'bubble' }, singleFin]),
  'multirole-jet': air('multirole-jet', [E(1), { cue: 'intakes on the body sides', check: (s) => s.intakes === 'side' }, singleFin]),
  'f-14b': air('f-14b', [swing, E(2), twinFins, tandem]),
  'f-35a': air('f-35a', [E(1), twinFins, sideIntakes, bubble]),
  'f-117a': air('f-117a', [vTail, E(2), swept(50), framed]),
  'b-52h': air('b-52h', [underPods(2, 'eight engines in four paired pods'), highWing, swept(30), singleFin]),
  'b-1b': air('b-1b', [swing, E(4), canard, singleFin]),
  'su-57': air('su-57', [E(2), twinFins, swept(40), bubble]),
  'eurofighter-typhoon-t': air('eurofighter-typhoon-t', [canard, tailless, E(2), tandem]),
  'jf-17': air('jf-17', [E(1), sideIntakes, singleFin, bubble]),
  'h-6k': air('h-6k', [E(2), swept(30), singleFin, framed]),
  'mb-339': air('mb-339', [E(1), lowWing, straight(), tips, tandem]),
};
