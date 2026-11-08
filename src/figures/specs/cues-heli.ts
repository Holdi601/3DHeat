/**
 * Recognition cues for helicopters (see cues.ts): what a recognition manual
 * names first - the rotor (blade count, coaxial, the tail rotor's side or a
 * fenestron), the cockpit (stepped tandem, bubble, cabin), the landing gear
 * (skids, wheels, a tail wheel), stub wings and what hangs on them, sights and
 * radars on the mast or the nose.
 *
 * Written from the real helicopters' published appearance (US Army technical
 * and recognition manuals, published dimensions); no game data.
 */

import type { HeliSpec } from '../air';
import type { Outline } from '../parts';
import type { Cue, CueEntry } from './cues';

const heli = (figures: string | string[], cues: Cue<HeliSpec>[]): CueEntry<'heli'> => ({ domain: 'heli', figures: typeof figures === 'string' ? [figures] : figures, cues });

// Checks on a helicopter spec.
const bodiesOf = (s: HeliSpec) => [...(s.bodies ?? []), ...(s.oneSide ?? [])];
const topOf = (o: Outline) => Math.max(...o.top.map((p) => p[1]));
const frontOf = (o: Outline) => Math.max(...o.plan.map((p) => p[0]));
const noseX = (s: HeliSpec) => (s.fuselage ? frontOf(s.fuselage) : s.length / 2);
const blades = (n: number): Cue<HeliSpec> => ({ cue: `${n}-blade main rotor`, check: (s) => (s.blades ?? 4) === n });
const skids: Cue<HeliSpec> = { cue: 'skid landing gear', check: (s) => !!(s.skidAt || s.skids) };
const wheels: Cue<HeliSpec> = { cue: 'wheeled landing gear', check: (s) => !!(s.wheelAt?.length || s.wheels) };
const tailWheel: Cue<HeliSpec> = { cue: 'tail wheel under the boom', check: (s) => !!s.wheelAt?.some((w) => w[1] === 0 && w[0] < 0) };
const stubs: Cue<HeliSpec> = { cue: 'stub wings with weapon pylons', check: (s) => !!s.stubs };
const fenestron: Cue<HeliSpec> = { cue: 'fenestron: the tail fan shrouded in the fin', check: (s) => s.tailRotor === 'fenestron' };
const trLeft: Cue<HeliSpec> = { cue: 'tail rotor on the left of the fin', check: (s) => s.tailRotorSide === -1 };
const trRight: Cue<HeliSpec> = { cue: 'tail rotor on the right of the fin', check: (s) => (s.tailRotorSide ?? 1) === 1 && (s.tailRotor ?? 'conventional') === 'conventional' };
const tandem: Cue<HeliSpec> = { cue: 'stepped tandem cockpits, gunner in front and pilot raised behind', check: (s) => (s.glass?.length ?? 0) + (s.glassOutlines?.length ?? 0) >= 2 };
const mastSight = (cue: string): Cue<HeliSpec> => ({ cue, check: (s) => !!s.mastDome });
const noMastSight = (cue: string): Cue<HeliSpec> => ({ cue, check: (s) => !s.mastDome });
const coaxial: Cue<HeliSpec> = { cue: 'two coaxial contra-rotating rotors, no tail rotor', check: (s) => s.rotors === 'coaxial' && s.tailRotor === 'none' };
const noseTurret: Cue<HeliSpec> = { cue: 'sight turret at the nose tip', check: (s) => bodiesOf(s).some((b) => frontOf(b) >= noseX(s) - 0.4 && !b.side) };
const chinGun: Cue<HeliSpec> = { cue: 'gun under the chin', check: (s) => !!s.guns?.some((g) => g[0] > 0 && g[2] < -0.3) };
const shoulderEngines: Cue<HeliSpec> = { cue: 'engine nacelles standing off the shoulders', check: (s) => bodiesOf(s).some((b) => (b.side ?? 0) >= 0.5 && topOf(b) > 0.5) };
const scissor: Cue<HeliSpec> = { cue: 'scissor (X) tail rotor', check: (s) => !!s.tailScissor };
const anhedral: Cue<HeliSpec> = { cue: 'stub wings drooping with marked anhedral', check: (s) => !!s.stubs && (s.stubAt?.[2] ?? 0) >= 8 };
const twinFins: Cue<HeliSpec> = { cue: 'twin fins at the tailplane tips', check: (s) => !!s.twinFins };
const tailplane: Cue<HeliSpec> = { cue: 'tailplane on the boom', check: (s) => !!s.tailPlan };
const cabin = (cue: string): Cue<HeliSpec> => ({ cue, check: (s) => s.cabin === 'cabin' || s.cabin === 'boxy' });
const bubble = (cue: string): Cue<HeliSpec> => ({ cue, check: (s) => s.cabin === 'bubble' });
/** Tubes or pods out on both sides (missile launchers on stubs, outriggers or a beam). */
const sideStores = (cue: string, n = 2): Cue<HeliSpec> => ({ cue, check: (s) => (s.bodies ?? []).filter((b) => (b.side ?? 0) >= 0.9 && topOf(b) < 1.2).length >= n });

const APACHES: Cue<HeliSpec>[] = [
  noseTurret,
  { cue: 'avionics bays along the cockpit cheeks', check: (s) => bodiesOf(s).some((b) => (b.side ?? 0) >= 0.6 && topOf(b) <= 0.1) },
  shoulderEngines,
  { cue: 'scissor tail rotor high on the left of the fin', check: (s) => !!s.tailScissor && s.tailRotorSide === -1 },
  { cue: 'long-legged main wheels and a tail wheel', check: (s) => tailWheel.check!(s) && !!s.wheelAt?.some((w) => w[1] > 0.8) },
  chinGun,
];

const COBRAS: Cue<HeliSpec>[] = [{ cue: 'very narrow tandem body, about a metre wide', check: (s) => s.bodyWidth <= 1.0 }, tandem, skids, stubs, chinGun];

const HINDS: Cue<HeliSpec>[] = [
  blades(5),
  anhedral,
  { cue: 'nose wheel and main wheels on struts', check: (s) => (s.wheelAt?.length ?? 0) >= 2 },
  { cue: 'two engines side by side on the roof', check: (s) => bodiesOf(s).some((b) => (b.side ?? 0) >= 0.4 && topOf(b) > 1.5) },
  { cue: 'deep troop cabin behind the cockpit', check: (s) => s.bodyHeight >= 2.2 },
];

export const HELI_CUES: Record<string, CueEntry> = {
  'heli-apaches': heli(['ah-64a', 'ah-64d-apache', 'ah-64d-no-radar', 'ah-64e'], APACHES),
  'heli-ah-64a': heli('ah-64a', [noMastSight('no Longbow radar over the rotor')]),
  'heli-ah-64d': heli(['ah-64d-apache', 'ah-64e'], [mastSight('Longbow radar dome over the rotor')]),
  'heli-ah-64d-no-radar': heli('ah-64d-no-radar', [noMastSight('D-model cheek bays forward to the nose, no Longbow dome')]),
  'heli-ah-64e': heli('ah-64e', [{ cue: 'composite blades with swept tips', check: (s) => !!s.sweptTips }]),
  'heli-cobras': heli(['ah-1g-cobra', 'ah-1s-cobra', 'ah-1w-cobra', 'ah-1z-viper'], COBRAS),
  'heli-cobra-2': heli(['ah-1g-cobra', 'ah-1s-cobra', 'ah-1w-cobra'], [blades(2)]),
  'heli-ah-1s': heli('ah-1s-cobra', [{ cue: 'flat-plate canopy', check: (s) => (s.glassOutlines?.length ?? 0) >= 1 }]),
  'heli-ah-1z': heli('ah-1z-viper', [blades(4), trLeft]),
  'heli-hinds': heli(['mi-24a-hind', 'mi-24d-hind', 'mi-24v-hind', 'mi-24p-hind', 'mi-35m-hind', 'superhind'], HINDS),
  'heli-hind-bubbles': heli(['mi-24d-hind', 'mi-24v-hind', 'mi-24p-hind', 'mi-35m-hind', 'superhind'], [{ cue: 'twin stepped bubble canopies', check: (s) => (s.glass?.length ?? 0) >= 2 }, trLeft]),
  'heli-mi-24a': heli('mi-24a-hind', [{ cue: 'one framed greenhouse cockpit for both crew', check: (s) => (s.glass?.length ?? 0) === 1 }, trRight]),
  'heli-mi-24p': heli('mi-24p-hind', [{ cue: 'twin 30 mm cannon fixed on the right of the nose, no chin turret', check: (s) => (s.guns?.length ?? 0) >= 2 && s.guns!.every((g) => g[1] > 0.5) }]),
  'heli-mi-35m': heli('mi-35m-hind', [{ cue: 'twin cannon turret under the chin', check: (s) => (s.guns?.length ?? 0) >= 2 && s.guns!.every((g) => Math.abs(g[1]) < 0.3) }]),
  'heli-havocs': heli(['mi-28n', 'mi-28-havoc'], [blades(5), tandem, shoulderEngines, scissor, tailWheel, chinGun]),
  'heli-mi-28n': heli('mi-28n', [mastSight('radar dome over the rotor')]),
  'heli-hokums': heli(['ka-50', 'ka-52'], [coaxial, blades(3), stubs, tailplane]),
  'heli-ka-50': heli('ka-50', [{ cue: 'blades with swept-back tips', check: (s) => !!s.sweptTips }]),
  'heli-ka-52': heli('ka-52', [{ cue: 'side-by-side two-seat cockpit, wide nose', check: (s) => !!s.glass?.some((g) => g[3] >= 0.6) }]),
  'heli-ka-29': heli('ka-29', [coaxial, twinFins, cabin('boxy cabin with a broad flat nose'), wheels]),
  'heli-tigers': heli(['tiger-hap', 'tiger-uht'], [tandem, blades(4), stubs, tailWheel]),
  'heli-tiger-uht': heli('tiger-uht', [mastSight('Osiris sight on the mast')]),
  'heli-tiger-hap': heli('tiger-hap', [noMastSight('roof sight over the cockpit, no mast sight'), { cue: 'roof sight over the cockpit', check: (s) => !!s.oneSide?.some((b) => topOf(b) > 1.5) }]),
  'heli-hueys': heli(['uh-1b-huey', 'uh-1h-huey'], [blades(2), skids, cabin('boxy cabin under a big slanted windscreen'), tailplane, trLeft]),
  'heli-alouette-ii': heli('alouette-ii', [
    { cue: 'open lattice tail boom', check: (s) => (s.struts?.length ?? 0) >= 12 },
    bubble('glass bubble cabin'),
    { cue: 'bare engine behind the rotor mast', check: (s) => (s.bodies?.length ?? 0) >= 2 },
    blades(3),
    skids,
  ]),
  'heli-alouette-iii': heli('alouette-iii', [blades(3), { cue: 'fixed tricycle wheels', check: (s) => (s.wheelAt?.length ?? 0) >= 2 }, { cue: 'bare engine on top behind the rotor', check: (s) => (s.bodies?.length ?? 0) >= 1 }, trLeft]),
  'heli-gazelles': heli(['sa-342l', 'sa-342m'], [fenestron, blades(3), skids, bubble('glazed bubble nose')]),
  'heli-sa-342m': heli('sa-342m', [sideStores('HOT missile tubes on a beam across the cabin')]),
  'heli-sa-342l': heli('sa-342l', [{ cue: '20 mm gun on the right of the cabin', check: (s) => !!s.guns?.some((g) => g[1] > 0.5) }]),
  'heli-bo-105s': heli(['bo-105', 'bo-105-pah1', 'bo-105-tow'], [blades(4), skids, { cue: 'tail rotor high on the fin', check: (s) => !!s.tailRotorAt && s.tailRotorAt[1] > 0.8 }]),
  'heli-bo-105-atgm': heli(['bo-105-pah1', 'bo-105-tow'], [sideStores('missile tubes on outriggers both sides')]),
  'heli-lynx': heli(['lynx-ah7', 'aw159-wildcat'], [blades(4), cabin('squat cabin with a short sloping nose')]),
  'heli-lynx-ah7': heli('lynx-ah7', [skids]),
  'heli-wildcat': heli('aw159-wildcat', [wheels, { cue: 'BERP blades with swept paddle tips', check: (s) => !!s.sweptTips }]),
  'heli-mh-60l-dap': heli('mh-60l-dap', [blades(4), tailWheel, { cue: 'ESSS stub wings with pylons', check: (s) => !!s.stubs }]),
  'heli-hips': heli(['mi-8tv', 'mi-8amtsh'], [blades(5), wheels, { cue: 'outriggers with three pylons a side', check: (s) => s.stubs?.pylons === 3 }, { cue: 'long cabin under a tapering boom', check: (s) => s.length > 17 }]),
  'heli-mi-8tv': heli('mi-8tv', [trRight]),
  'heli-mi-8amtsh': heli('mi-8amtsh', [trLeft]),
  'heli-mi-4av': heli('mi-4av', [blades(4), wheels, stubs, { cue: 'radial engine in the nose, cockpit high above it', check: (s) => s.length > 16 }]),
  'heli-oh-58d': heli('oh-58d', [mastSight('ball sight on the mast'), blades(4), skids, trLeft]),
  'heli-z-10': heli('z-10', [tandem, blades(5), stubs, tailWheel]),
  'heli-z-19s': heli(['z-19', 'z-19e'], [tandem, fenestron, stubs]),
  'heli-z-19': heli('z-19', [mastSight('radar dome over the rotor')]),
  'heli-mangustas': heli(['a-129-cbt', 't-129-atak'], [tandem, stubs, tailWheel, chinGun]),
  'heli-a-129': heli('a-129-cbt', [blades(4)]),
  'heli-t-129': heli('t-129-atak', [blades(5)]),
  'heli-z-9w': heli('z-9w', [fenestron, blades(4), stubs, wheels]),
  'heli-h-34s': heli(['h-34', 'wessex'], [blades(4), tailWheel, { cue: 'engine in the nose under a raised cockpit', check: (s) => s.length >= 14 }]),
  'heli-a-109eoa': heli('a-109eoa', [blades(4), wheels, stubs]),
  'heli-ah-56': heli('ah-56-cheyenne', [{ cue: 'pusher propeller at the tail', check: (s) => !!s.pusher }, blades(4), stubs]),
  'heli-little-birds': heli(['ah-6-little-bird', 'md-500-tow'], [bubble('egg-shaped cabin'), skids, { cue: 'thin boom from the cabin top', check: (s) => s.length < 8 }]),
  'heli-ah-6': heli('ah-6-little-bird', [blades(6), { cue: 'planks across the cabin with gun and rocket pods', check: (s) => !!s.stubs }]),
  'heli-comanche': heli('rah-66-comanche', [fenestron, blades(5), tandem]),
  'heli-rooivalk': heli('rooivalk', [tandem, blades(4), stubs, tailWheel]),
  'heli-scouts': heli(['westland-scout', 'westland-wasp'], [blades(4), { cue: 'small cabin with the engine bare behind it', check: (s) => (s.bodies?.length ?? 0) >= 1 }]),
  'heli-scout': heli('westland-scout', [skids]),
  'heli-wasp': heli('westland-wasp', [{ cue: 'four castoring wheels', check: (s) => (s.wheelAt?.length ?? 0) >= 2 && !s.skidAt }]),
  'heli-z-11': heli('z-11', [blades(3), skids, trRight, stubs]),
  'heli-h145m': heli('h145m', [fenestron, blades(4), skids, cabin('tall cabin with rear clamshell doors under the boom')]),
};
