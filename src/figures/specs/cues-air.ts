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
/** A second wing over the first: a body as wide as the span standing over the body (the builder draws a biplane's upper wing so). */
const upperWing = (s: Air) => bodiesOf(s).find((b) => !b.side && halfWidth(b) >= s.span * 0.4);
const biplane: Cue<Air> = { cue: 'biplane', check: (s) => !!upperWing(s) };
/** A sesquiplane: the lower wing's chord well under the upper one's. */
const sesqui: Cue<Air> = { cue: 'sesquiplane: the lower wing far narrower than the upper', check: (s) => { const u = upperWing(s); return !!u && s.wing.rootChord < (front(u) - back(u)) * 0.75; } };
/** Interplane struts: thin posts out on the wings (each mirrored pair counts once). */
const struts = (s: Air) => bodiesOf(s).filter((b) => halfWidth(b) <= 0.05 && out(b) >= 1).length;
const bays = (n: number): Cue<Air> => ({ cue: n === 1 ? 'single-bay wings, one set of struts a side' : `${n}-bay wings, ${n} sets of struts a side`, check: (s) => struts(s) === n * 2 });
const twoBlade: Cue<Air> = { cue: 'two-bladed propeller', check: blades(2) };
const radial: Cue<Air> = { cue: 'radial engines', check: (s) => (s.cowls?.length ?? 0) > 0 };
const twinProps: Cue<Air> = { cue: 'two engines with propellers on the wings', check: (s) => (s.props?.length ?? 0) === 2 && !!s.props?.every((p) => Math.abs(p.side) > s.bodyWidth / 2) };
const harrier: Cue<Air>[] = [highWing, anhedral, droopTail, sideIntakes];

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
  'nieuport-17': air('nieuport-17', [biplane, sesqui, bays(1), twoBlade]),
  'bristol-f2b': air('bristol-f2b', [biplane, bays(2), { cue: 'body held clear between the wings', check: (s) => mount(s) < -1.5 }, twoBlade]),
  'sopwith-strutter': air('sopwith-strutter', [biplane, twoBlade, singleFin]),
  'spad-7': air('spad-7', [biplane, bays(2), twoBlade]),
  'albatros-d3': air('albatros-d3', [biplane, sesqui, bays(1), twoBlade]),
  'ssw-d4': air('ssw-d4', [biplane, { cue: 'four-bladed propeller', check: blades(4) }]),
  'breguet-14': air('breguet-14', [biplane, bays(2), twoBlade]),
  'halberstadt-cl2': air('halberstadt-cl2', [biplane, bays(1), twoBlade]),
  'sopwith-camel': air('sopwith-camel', [biplane, bays(1), twoBlade]),
  'gotha-g5': air('gotha-g5', [biplane, { cue: 'two pusher engines between the wings', check: (s) => (s.props?.length ?? 0) === 2 }, twoBlade]),
  'ilya-muromets': air('ilya-muromets', [biplane, { cue: 'four engines on the lower wing', check: (s) => props(s) === 4 }]),
  'fury-mk1': air('fury-mk1', [biplane, bays(1), twoBlade]),
  'fury-mk2': air('fury-mk2', [biplane, bays(1), twoBlade]),
  'c-101': air('c-101', [E(1), lowWing, straight(), tandem, singleFin]),
  'yak-130': air('yak-130', [tandem, singleFin, swept(25)]),
  'su-9-1946': air('su-9-1946', [underPods(1, 'two jets in nacelles under the wings'), raisedPlane, bubble]),
  'yak-38': air('yak-38', [highWing, anhedral, sideIntakes, singleFin]),
  's-3b': air('s-3b', [highWing, underPods(1, 'two engine pods under the wings'), singleFin]),
  'il-76md': air('il-76md', [highWing, anhedral, { cue: 'T-tail, the tailplane on top of the fin', check: (s) => (s.tail.planeUp ?? 0) >= 5 }, underPods(2, 'four engines in pods under the wings')]),
  'a-50': air('a-50', [{ cue: 'rotodome on struts over the body', check: (s) => !!s.rotodome }, highWing, anhedral, { cue: 'T-tail, the tailplane on top of the fin', check: (s) => (s.tail.planeUp ?? 0) >= 5 }, underPods(2, 'four engines in pods under the wings')]),
  'kc-135': air('kc-135', [lowWing, swept(30), underPods(2, 'four engines in pods under the wings'), singleFin]),
  'c-47': air('c-47', [twinProps, radial, lowWing, { cue: 'three-bladed propellers', check: blades(3) }]),
  'a-26c': air('a-26c', [twinProps, radial, midWing, singleFin]),
  'p-61': air('p-61', [twinProps, { cue: 'twin tail booms', check: (s) => s.tail.kind === 'h' }, { cue: 'four-bladed propellers', check: blades(4) }, tandem]),
  'horten-ho-229': air('horten-ho-229', [{ cue: 'flying wing, no tail at all', check: (s) => s.tail.kind === 'none' }, swept(25)]),
  'he-177': air('he-177', [twinProps, { cue: 'four-bladed propellers', check: blades(4) }, glassNose, singleFin]),
  'vb-10': air('vb-10', [{ cue: 'contra-rotating propellers in the nose', check: (s) => (s.props?.length ?? 0) === 2 && !!s.props?.every((p) => p.side === 0) }, lowWing, singleFin]),
  'me-163b': air('me-163b', [{ cue: 'tailless swept wing', check: (s) => s.tail.tailSpan <= 0.5 && sweepOf(s) >= 20 }, singleFin, bubble]),
  'f-82e': air('f-82e', [{ cue: 'twin fuselages joined by the wing', check: (s) => bodiesOf(s).some((b) => out(b) >= 2 && front(b) - back(b) >= 8) }, { cue: 'a cockpit in each fuselage', check: (s) => (s.glass?.length ?? 0) === 2 }, { cue: 'four-bladed propellers', check: blades(4) }]),
  'he-115': air('he-115', [twinProps, radial, { cue: 'two big floats', check: (s) => bodiesOf(s).some((b) => out(b) >= 1 && Math.min(...b.bottom.map((p) => p[1])) < bottomAt(s, 0) - 1) }, glassNose]),
  'saab-t18b': air('saab-t18b', [twinProps, twinFins, { cue: 'three-bladed propellers', check: blades(3) }]),
  j29f: air('j29f', [E(1), noseIntake, swept(25), bubble]),
  attacker: air('attacker', [E(1), straight(), sideIntakes, bubble]),
  'v-22-osprey': air('v-22-osprey', [{ cue: 'tilting prop rotors at the wing tips', check: (s) => s.engines?.kind === 'wing-props' && s.engines.count === 2 }, highWing, { cue: 'twin fins on the tailplane ends', check: (s) => s.tail.kind === 'h' }]),
  'ju-87-d': air('ju-87-d', [{ cue: 'one propeller in the nose', check: (s) => s.engines?.kind === 'nose-prop' }, lowWing, framed, { cue: 'three-bladed propeller', check: blades(3) }]),
  'ea-18g': air('ea-18g', [E(2), twinFins, tandem]),
  'f-15d': air('f-15d', [E(2), twinFins, highWing, tandem]),
  'f-16c-cft': air('f-16c-cft', [E(1), { cue: 'intake under the nose, the nose closed', check: (s) => !openNose(s) }, singleFin, bubble]),
  'su-35': air('su-35', [E(2), twinFins, { cue: 'no canards (the Su-30MKI has them)', check: (s) => !s.canard }, bubble]),
  'j-20': air('j-20', [canard, twinFins, E(2), { cue: 'delta wing, no tailplane', check: (s) => s.tail.tailSpan <= 0.5 }]),
  'tu-160': air('tu-160', [swing, E(4), raisedPlane, singleFin]),
  'tu-22m3': air('tu-22m3', [swing, E(2), sideIntakes, singleFin]),
  'tu-95ms': air('tu-95ms', [{ cue: 'four turboprops with contra-rotating propellers', check: (s) => s.engines?.count === 4 && blades(8)(s) }, swept(30), singleFin, midWing]),
  'tu-142': air('tu-142', [{ cue: 'four turboprops with contra-rotating propellers', check: (s) => s.engines?.count === 4 && blades(8)(s) }, swept(30), singleFin, midWing]),
  'tu-95m': air('tu-95m', [{ cue: 'four turboprops with contra-rotating propellers', check: (s) => s.engines?.count === 4 && blades(8)(s) }, swept(30), singleFin, glassNose]),
  'mig-31': air('mig-31', [E(2), twinFins, highWing, anhedral, tandem]),
  'harrier-gr3': air('harrier-gr3', [...harrier, bubble]),
  'sea-harrier-fa2': air('sea-harrier-fa2', [highWing, anhedral, droopTail, { cue: 'blunt radar nose ahead of the raised bubble canopy', check: (s) => s.canopy?.kind === 'bubble' && topAt(s, noseX(s) - 0.25) - bottomAt(s, noseX(s) - 0.25) >= 0.6 }]),
  'harrier-t10': air('harrier-t10', [...harrier, tandem]),
  'a-4m': air('a-4m', [E(1), lowWing, swept(30), sideIntakes, raisedPlane]),
  'su-25ub': air('su-25ub', [E(2), highWing, tandem, singleFin]),
  strikemaster: air('strikemaster', [E(1), lowWing, straight(), tips]),
  'mb-326': air('mb-326', [E(1), lowWing, straight(), tips]),
  'mb-326k': air('mb-326k', [E(1), lowWing, straight(), tips]),
  't-38': air('t-38', [E(2), lowWing, tandem, singleFin]),
  'yak-23': air('yak-23', [noseIntake, straight(), raisedPlane, bubble]),
  'la-200': air('la-200', [noseIntake, swept(35), raisedPlane, bubble]),
  'il-28sh': air('il-28sh', [underPods(1, 'two jets in nacelles under the wings'), straight(), glassNose, singleFin]),
  'tu-14': air('tu-14', [underPods(1, 'two jets in nacelles under the wings'), straight(), glassNose, singleFin]),
  f11f: air('f11f', [E(1), swept(30), sideIntakes, bubble]),
  'hf-24': air('hf-24', [E(2), swept(35), sideIntakes, bubble]),
  'p-59a': air('p-59a', [straight(), midWing, singleFin, bubble]),
  'ffa-p16': air('ffa-p16', [E(1), straight(), sideIntakes, bubble]),
  'yak-141': air('yak-141', [E(1), twinFins, highWing, sideIntakes]),
  'mq-1-predator': air('mq-1-predator', [{ cue: 'pusher propeller at the tail', check: (s) => s.engines?.kind === 'pusher' }, { cue: 'inverted V-tail', check: (s) => s.tail.kind === 'v' }, { cue: 'long thin glider wing', check: (s) => s.span > s.length * 1.5 }, twoBlade]),
  'mq-9-reaper': air('mq-9-reaper', [{ cue: 'pusher propeller at the tail', check: (s) => s.engines?.kind === 'pusher' }, vTail, { cue: 'long thin glider wing', check: (s) => s.span > s.length * 1.5 }, { cue: 'three-bladed propeller', check: blades(3) }]),
  'wing-loong': air('wing-loong', [{ cue: 'pusher propeller at the tail', check: (s) => s.engines?.kind === 'pusher' }, vTail, { cue: 'long thin glider wing', check: (s) => s.span > s.length * 1.5 }]),
  'c-130j-30': air('c-130j-30', [{ cue: 'four turboprops', check: (s) => props(s) === 4 }, { cue: 'six-bladed scimitar propellers', check: blades(6) }, highWing, { cue: 'stretched body', check: (s) => s.length > 33 }]),
  'c-17a': air('c-17a', [underPods(2, 'four engines in pods under the wings'), highWing, anhedral, { cue: 'T-tail, the tailplane on top of the fin', check: (s) => (s.tail.planeUp ?? 0) >= 5 }]),
  'an-26': air('an-26', [twinProps, highWing, anhedral, { cue: 'four-bladed propellers', check: blades(4) }]),
  'an-30': air('an-30', [twinProps, highWing, anhedral, { cue: 'four-bladed propellers', check: blades(4) }]),
  'e-3a': air('e-3a', [{ cue: 'rotodome on struts over the body', check: (s) => !!s.rotodome }, underPods(2, 'four engines in pods under the wings'), lowWing, swept(30)]),
  'e-2c': air('e-2c', [{ cue: 'rotodome over the body', check: (s) => !!s.rotodome }, twinProps, highWing, { cue: 'four fins on the tailplane', check: (s) => s.tail.kind === 'h' }]),
  'yak-40': air('yak-40', [{ cue: 'T-tail, the tailplane on top of the fin', check: (s) => (s.tail.planeUp ?? 0) >= 3 }, lowWing, straight()]),
  'li-2': air('li-2', [twinProps, radial, lowWing]),
  'a-20b': air('a-20b', [twinProps, radial, glassNose, highWing]),
  blenheim: air('blenheim', [twinProps, radial, glassNose]),
  'blenheim-iv': air('blenheim-iv', [twinProps, radial, glassNose]),
  'yak-52': air('yak-52', [{ cue: 'radial engine in the nose', check: (s) => s.engines?.kind === 'nose-prop' && (s.cowls?.length ?? 0) > 0 }, tandem, lowWing, twoBlade]),
  'sopwith-pup': air('sopwith-pup', [biplane, bays(1), twoBlade]),
  'sopwith-snipe': air('sopwith-snipe', [biplane, twoBlade]),
  'sopwith-dolphin': air('sopwith-dolphin', [biplane, twoBlade]),
  'sopwith-triplane': air('sopwith-triplane', [{ cue: 'triplane: three wings', check: (s) => bodiesOf(s).filter((b) => !b.side && halfWidth(b) >= s.span * 0.4).length === 2 }, twoBlade]),
  'se-5a': air('se-5a', [biplane, bays(2), twoBlade]),
  'nieuport-28': air('nieuport-28', [biplane, twoBlade]),
  'hanriot-hd1': air('hanriot-hd1', [biplane, twoBlade]),
  'albatros-d5': air('albatros-d5', [biplane, sesqui, bays(1), twoBlade]),
  'pfalz-d3': air('pfalz-d3', [biplane, bays(1), twoBlade]),
  'pfalz-d12': air('pfalz-d12', [biplane, twoBlade]),
  'halberstadt-d2': air('halberstadt-d2', [biplane, twoBlade]),
  'fokker-dr1': air('fokker-dr1', [{ cue: 'triplane: three wings', check: (s) => bodiesOf(s).filter((b) => !b.side && halfWidth(b) >= s.span * 0.4).length === 2 }, twoBlade]),
  'fokker-d8': air('fokker-d8', [{ cue: 'parasol monoplane wing over the body', check: (s) => mount(s) > 1 && !upperWing(s) }, twoBlade]),
  'fokker-e3': air('fokker-e3', [{ cue: 'monoplane wing on the body', check: (s) => !upperWing(s) && mount(s) < 1 }, twoBlade]),
  'airco-dh4': air('airco-dh4', [biplane, bays(2), twoBlade]),
  'dfw-c5': air('dfw-c5', [biplane, bays(2), twoBlade]),
  're-8': air('re-8', [biplane, bays(2), twoBlade]),
  'roland-c2': air('roland-c2', [biplane, twoBlade]),
  'christen-eagle': air('christen-eagle', [biplane, twoBlade, { cue: 'small modern aerobatic biplane, about 6 m span', check: (s) => s.span < 7 }]),
  'airco-dh2': air('airco-dh2', [biplane, { cue: 'pusher engine behind the nacelle, the tail on booms', check: (s) => (s.props ?? []).some((p) => p.side === 0) && s.engines?.kind !== 'nose-prop' }, twoBlade]),
  'fe-2b': air('fe-2b', [biplane, { cue: 'pusher engine behind the nacelle, the tail on booms', check: (s) => (s.props ?? []).some((p) => p.side === 0) && s.engines?.kind !== 'nose-prop' }]),
  'handley-page-o400': air('handley-page-o400', [biplane, { cue: 'two engines between the wings', check: (s) => (s.props?.length ?? 0) === 2 }, { cue: 'twin fins on a biplane tail', check: (s) => s.tail.kind === 'h' }]),
  'airco-dh10': air('airco-dh10', [biplane, { cue: 'two engines between the wings', check: (s) => (s.props?.length ?? 0) === 2 }, twoBlade]),
  'caproni-ca5': air('caproni-ca5', [biplane, { cue: 'three engines: two tractors and a pusher', check: (s) => (s.props?.length ?? 0) >= 3 }, { cue: 'twin booms to a triple-fin tail', check: (s) => s.tail.kind === 'h' }]),
  'hansa-brandenburg-w12': air('hansa-brandenburg-w12', [biplane, { cue: 'twin floats', check: (s) => bodiesOf(s).some((b) => out(b) >= 0.5 && Math.min(...b.bottom.map((p) => p[1])) < bottomAt(s, 0) - 0.8 && front(b) - back(b) >= 3) }, twoBlade]),
  'aw-52': air('aw-52', [{ cue: 'tailless flying wing', check: (s) => s.tail.tailSpan <= 0.5 }, { cue: 'very broad span for its length', check: (s) => s.span > s.length * 2 }]),
  'cg-4a': air('cg-4a', [{ cue: 'glider: no engines', check: (s) => !s.engines && props(s) === 0 }, highWing, singleFin]),
  'xf-85-goblin': air('xf-85-goblin', [E(1), { cue: 'tiny parasite fighter, under 5 m long', check: (s) => s.length < 5 }, bubble]),
  'ba-349-natter': air('ba-349-natter', [E(1), { cue: 'stubby wing shorter than the body', check: (s) => s.span < s.length }]),
  'pe-8': air('pe-8', [{ cue: 'four engines on the wings', check: (s) => props(s) === 4 }, glassNose, midWing]),
  'fw-200': air('fw-200', [{ cue: 'four radial engines on the wings', check: (s) => props(s) === 4 && (s.cowls?.length ?? 0) > 0 }, lowWing, singleFin]),
  'tb-3': air('tb-3', [{ cue: 'four engines on a thick low wing', check: (s) => props(s) === 4 && mount(s) < 0 }, twoBlade]),
  g8n: air('g8n', [{ cue: 'four radial engines on the wings', check: (s) => props(s) === 4 && (s.cowls?.length ?? 0) > 0 }, { cue: 'four-bladed propellers', check: blades(4) }, glassNose]),
  'he-219': air('he-219', [twinProps, { cue: 'twin fins on the tailplane ends', check: (s) => s.tail.kind === 'h' }, highWing, { cue: 'three-bladed propellers', check: blades(3) }]),
  j1n1: air('j1n1', [twinProps, radial, midWing, singleFin]),
  'ki-83': air('ki-83', [twinProps, radial, { cue: 'four-bladed propellers', check: blades(4) }]),
  welkin: air('welkin', [twinProps, { cue: 'very long high-altitude wing', check: (s) => s.span > s.length * 1.6 }, { cue: 'four-bladed propellers', check: blades(4) }]),
  'ta-154': air('ta-154', [twinProps, highWing, { cue: 'three-bladed propellers', check: blades(3) }]),
  'ro-57': air('ro-57', [twinProps, radial, lowWing]),
  'breda-88': air('breda-88', [twinProps, radial, { cue: 'twin fins on the tailplane ends', check: (s) => s.tail.kind === 'h' }, highWing]),
  'br-693': air('br-693', [twinProps, radial, { cue: 'twin fins on the tailplane ends', check: (s) => s.tail.kind === 'h' }, midWing]),
  'ia-58': air('ia-58', [twinProps, { cue: 'T-tail, the tailplane on top of the fin', check: (s) => (s.tail.planeUp ?? 0) >= 2.5 }, lowWing]),
  shackleton: air('shackleton', [{ cue: 'four engines with contra-rotating propellers', check: (s) => props(s) === 4 && blades(6)(s) }, { cue: 'twin fins on the tailplane ends', check: (s) => s.tail.kind === 'h' }, glassNose]),
};
