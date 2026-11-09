/**
 * Ground vehicles of the two world wars and between them: tanks with their
 * many turret and hull shapes (multi-turret tanks, sponsons, casemates,
 * rhomboid WWI tanks), self-propelled guns, half-tracks, armoured cars,
 * trucks, field and AA guns, and the trains a WWII map runs. One figure
 * serves every game that has the vehicle (DCS WWII assets, IL-2, Battlefield,
 * War Thunder).
 *
 * Lengths are of the hull without the gun unless a comment says otherwise;
 * values are rounded published figures, `est` an estimate.
 */

import type { Named, SpecSet } from './index';
import type { GroundSpec } from '../ground';

const G: Named<GroundSpec> = {};

// ---------------------------------------------------------------- Soviet

// T-34/76: five big road wheels, the sloped hull, a small turret well forward (hull 5.92 m, 3.0 x 2.45 m).
G['t-34-76'] = { cls: 'medium-tank', chassis: 'tracked', length: 5.92, width: 3.0, hullHeight: 1.55, roadWheels: 5, hull: 'tank', turret: { x: 0.75, length: 2.4, width: 2.1, height: 0.8, shape: 'sloped', slope: 0.18 }, guns: [{ mount: 'turret', length: 2.0, calibre: 0.076 }] };
// T-34/76 1943: the hexagonal "nut" turret, a little wider.
G['t-34-76-1943'] = { ...G['t-34-76'], turret: { x: 0.75, length: 2.4, width: 2.4, height: 0.8, shape: 'sloped', slope: 0.2 } };
// T-34-85: the bigger three-man turret, centred, and its long 85 mm (hull 6.1 m, 8.15 m with gun).
G['t-34-85'] = { cls: 'medium-tank', chassis: 'tracked', length: 6.1, width: 3.0, hullHeight: 1.55, roadWheels: 5, hull: 'tank', turret: { x: 0.45, length: 2.9, width: 2.5, height: 0.85, shape: 'cast' }, guns: [{ mount: 'turret', length: 3.6, calibre: 0.085 }], cupola: true };
// SU-122: a T-34 hull with a casemate and the short 122 mm howitzer (6.95 m overall, 3.0 x 2.32 m).
G['su-122'] = { cls: 'sp-gun', chassis: 'tracked', length: 6.0, width: 3.0, hullHeight: 1.45, roadWheels: 5, hull: 'tank', turret: { x: 0.6, length: 3.4, width: 2.7, height: 0.85, shape: 'casemate' }, guns: [{ mount: 'turret', length: 1.2, calibre: 0.122, at: 0.35 }] };
// SU-85 / SU-100: the same casemate with a long gun.
G['su-100'] = { ...G['su-122'], cls: 'tank-destroyer', guns: [{ mount: 'turret', length: 4.6, calibre: 0.1, at: 0.4 }] };
// KV-1 1941/1942: six road wheels, a big boxy welded turret (6.75 x 3.32 x 2.71 m).
G['kv-1'] = { cls: 'heavy-tank', chassis: 'tracked', length: 6.75, width: 3.32, hullHeight: 1.75, roadWheels: 6, hull: 'ww2', turret: { x: 0.3, length: 2.9, width: 2.6, height: 0.95, shape: 'sloped', slope: 0.1 }, guns: [{ mount: 'turret', length: 2.3, calibre: 0.076 }] };
// KV-1s: lighter, a lower cast turret with a cupola.
G['kv-1s'] = { ...G['kv-1'], width: 3.25, turret: { x: 0.2, length: 2.8, width: 2.4, height: 0.8, shape: 'cast' }, cupola: true };
// KV-2: the tall box turret with the 152 mm howitzer (6.95 x 3.32 x 3.24 m).
G['kv-2'] = { ...G['kv-1'], turret: { x: 0.0, length: 3.2, width: 2.6, height: 1.55, shape: 'box' }, guns: [{ mount: 'turret', length: 2.6, calibre: 0.152, at: 0.4 }] };
// IS-2: a long hull, the big cast turret and 122 mm (hull 6.77 m, 3.07 x 2.73 m).
G['is-2'] = { cls: 'heavy-tank', chassis: 'tracked', length: 6.77, width: 3.07, hullHeight: 1.6, roadWheels: 6, hull: 'tank', turret: { x: 0.3, length: 3.2, width: 2.6, height: 0.95, shape: 'cast' }, guns: [{ mount: 'turret', length: 4.3, calibre: 0.122 }], cupola: true };
// SU-152 / ISU-152: a KV hull with a tall casemate and the 152 mm (hull 6.75 m, 8.95 m with gun).
G['su-152'] = { cls: 'sp-gun', chassis: 'tracked', length: 6.75, width: 3.25, hullHeight: 1.55, roadWheels: 6, hull: 'ww2', turret: { x: 0.9, length: 3.6, width: 2.9, height: 1.0, shape: 'casemate' }, guns: [{ mount: 'turret', length: 3.0, calibre: 0.152, at: 0.4 }] };
// T-70: a small turret offset to the left, five road wheels (4.29 x 2.32 x 2.04 m).
G['t-70'] = { cls: 'light-tank', chassis: 'tracked', length: 4.29, width: 2.32, hullHeight: 1.25, roadWheels: 5, hull: 'tank', turret: { x: 0.1, length: 1.6, width: 1.4, height: 0.65, shape: 'sloped', side: -0.3 }, guns: [{ mount: 'turret', length: 1.4, calibre: 0.045 }] };
// T-60: smaller still, a 20 mm (4.1 x 2.3 x 1.75 m).
G['t-60'] = { ...G['t-70'], length: 4.1, hullHeight: 1.15, guns: [{ mount: 'turret', length: 1.2, calibre: 0.02 }] };
// BT-7: four big road wheels, a conical turret (5.66 x 2.29 x 2.42 m).
G['bt-7'] = { cls: 'light-tank', chassis: 'tracked', length: 5.66, width: 2.29, hullHeight: 1.45, roadWheels: 4, hull: 'tank', turret: { x: 0.4, length: 2.0, width: 1.9, height: 0.75, shape: 'sloped', slope: 0.18 }, guns: [{ mount: 'turret', length: 1.8, calibre: 0.045 }] };
// T-26: small, two-man turret (4.65 x 2.44 x 2.24 m).
G['t-26'] = { cls: 'light-tank', chassis: 'tracked', length: 4.65, width: 2.44, hullHeight: 1.35, roadWheels: 8, hull: 'ww2', turret: { x: 0.1, length: 1.9, width: 1.8, height: 0.7, shape: 'cylinder' }, guns: [{ mount: 'turret', length: 1.8, calibre: 0.045 }] };
// T-28: three turrets - the main and two MG turrets ahead of it (7.44 x 2.87 x 2.82 m).
G['t-28'] = { cls: 'medium-tank', chassis: 'tracked', length: 7.44, width: 2.87, hullHeight: 1.7, roadWheels: 12, hull: 'ww2', turret: { x: -0.2, length: 2.4, width: 2.2, height: 0.9, shape: 'cylinder' }, turrets: [{ x: 1.9, length: 0.9, width: 0.9, height: 0.65, shape: 'cylinder', side: -0.65 }, { x: 1.9, length: 0.9, width: 0.9, height: 0.65, shape: 'cylinder', side: 0.65 }], guns: [{ mount: 'turret', length: 1.6, calibre: 0.076 }, { mount: 'turret', turret: 1, length: 0.8, calibre: 0.01 }, { mount: 'turret', turret: 2, length: 0.8, calibre: 0.01 }] };
// T-35: five turrets in three levels (9.72 x 3.2 x 3.43 m).
G['t-35'] = { cls: 'heavy-tank', chassis: 'tracked', length: 9.72, width: 3.2, hullHeight: 1.75, roadWheels: 16, hull: 'ww2', skirts: true, turret: { x: 0.2, length: 2.3, width: 2.2, height: 0.9, shape: 'cylinder', up: 0.4 }, turrets: [{ x: 2.6, length: 1.6, width: 1.6, height: 0.7, shape: 'cylinder', side: 0.6 }, { x: 2.0, length: 1.0, width: 1.0, height: 0.6, shape: 'cylinder', side: -0.85 }, { x: -1.8, length: 1.6, width: 1.6, height: 0.7, shape: 'cylinder', side: -0.6 }, { x: -2.4, length: 1.0, width: 1.0, height: 0.6, shape: 'cylinder', side: 0.85 }], guns: [{ mount: 'turret', length: 1.2, calibre: 0.076 }, { mount: 'turret', turret: 1, length: 2.0, calibre: 0.045 }, { mount: 'turret', turret: 3, length: 2.0, calibre: 0.045 }] };
// SU-76M: an open casemate at the back of a light chassis (5.0 x 2.72 x 2.1 m).
G['su-76m'] = { cls: 'sp-gun', chassis: 'tracked', length: 5.0, width: 2.72, hullHeight: 1.25, roadWheels: 6, hull: 'tank', turret: { x: -0.9, length: 2.2, width: 2.4, height: 0.85, shape: 'open' }, guns: [{ mount: 'turret', length: 2.9, calibre: 0.076, at: 0.7 }] };

// ---------------------------------------------------------------- German

// Pz.Kpfw. III (H, L, M): six road wheels, a box turret; the L/M with the long 50 mm (hull 5.52 m, 2.95 x 2.5 m).
G['pz-iii-h'] = { cls: 'medium-tank', chassis: 'tracked', length: 5.52, width: 2.95, hullHeight: 1.6, roadWheels: 6, hull: 'ww2', turret: { x: 0.05, length: 2.2, width: 2.0, height: 0.75, shape: 'sloped', slope: 0.15 }, guns: [{ mount: 'turret', length: 1.6, calibre: 0.05 }], cupola: true };
G['pz-iii-l'] = { ...G['pz-iii-h'], guns: [{ mount: 'turret', length: 2.6, calibre: 0.05 }] };
// Pz.Kpfw. IV: eight small road wheels, a box turret, the gun by mark: F1 short, G long, H longer with skirts (hull 5.92 m, 2.88 x 2.68 m).
G['pz-iv-f1'] = { cls: 'medium-tank', chassis: 'tracked', length: 5.92, width: 2.88, hullHeight: 1.65, roadWheels: 8, hull: 'ww2', turret: { x: 0.1, length: 2.4, width: 2.1, height: 0.8, shape: 'sloped', slope: 0.15 }, guns: [{ mount: 'turret', length: 1.3, calibre: 0.075 }], cupola: true };
G['pz-iv-g'] = { ...G['pz-iv-f1'], guns: [{ mount: 'turret', length: 2.9, calibre: 0.075 }] };
G['pz-iv-h'] = { ...G['pz-iv-f1'], width: 3.33, skirts: true, guns: [{ mount: 'turret', length: 3.3, calibre: 0.075 }], turrets: [{ x: 0.0, length: 2.9, width: 2.8, height: 0.7, shape: 'box', up: 0.1 }] };
// Pz.Kpfw. 38(t): four big road wheels, a small riveted turret (4.61 x 2.14 x 2.25 m).
G['pz-38t'] = { cls: 'light-tank', chassis: 'tracked', length: 4.61, width: 2.14, hullHeight: 1.45, roadWheels: 4, hull: 'ww2', turret: { x: 0.2, length: 1.7, width: 1.6, height: 0.75, shape: 'box' }, guns: [{ mount: 'turret', length: 1.3, calibre: 0.037 }] };
// Pz.Kpfw. II (4.81 x 2.22 x 1.99 m).
G['pz-ii'] = { cls: 'light-tank', chassis: 'tracked', length: 4.81, width: 2.22, hullHeight: 1.3, roadWheels: 5, hull: 'ww2', turret: { x: 0.2, length: 1.6, width: 1.5, height: 0.65, shape: 'sloped', side: 0.15 }, guns: [{ mount: 'turret', length: 1.0, calibre: 0.02 }] };
// Tiger I: a boxy hull with a near-upright front, eight interleaved wheels, the horseshoe turret and 88 mm (hull 6.32 m, 3.56 x 3.0 m).
G['tiger-i'] = { cls: 'heavy-tank', chassis: 'tracked', length: 6.32, width: 3.56, hullHeight: 1.9, roadWheels: 8, hull: 'ww2', turret: { x: 0.0, length: 3.0, width: 2.9, height: 0.95, shape: 'box' }, guns: [{ mount: 'turret', length: 4.6, calibre: 0.088 }], cupola: true };
// Tiger II (Henschel): sloped hull and a long sloped turret, the 88 mm L/71 (hull 7.38 m, 3.75 x 3.09 m).
G['tiger-ii'] = { cls: 'heavy-tank', chassis: 'tracked', length: 7.38, width: 3.75, hullHeight: 1.9, roadWheels: 9, hull: 'tank', turret: { x: -0.1, length: 3.9, width: 2.8, height: 0.9, shape: 'sloped', slope: 0.18 }, guns: [{ mount: 'turret', length: 5.8, calibre: 0.088 }], cupola: true };
// Panther D / G: sloped hull, the sloped turret, 75 mm L/70 (hull 6.87 m, 3.42 x 2.99 m).
G['panther'] = { cls: 'medium-tank', chassis: 'tracked', length: 6.87, width: 3.42, hullHeight: 1.85, roadWheels: 8, hull: 'tank', skirts: true, turret: { x: -0.15, length: 3.1, width: 2.6, height: 0.9, shape: 'sloped', slope: 0.2 }, guns: [{ mount: 'turret', length: 4.6, calibre: 0.075 }], cupola: true };
// Jagdpanther: the Panther hull carried up into a full-width casemate, the 88 mm through its front (hull 6.87 m, 9.87 m with gun).
G['jagdpanther'] = { cls: 'tank-destroyer', chassis: 'tracked', length: 6.87, width: 3.42, hullHeight: 1.6, roadWheels: 8, hull: 'tank', skirts: true, turret: { x: 0.1, length: 5.2, width: 3.2, height: 1.0, shape: 'casemate', slope: 0.12 }, guns: [{ mount: 'turret', length: 4.5, calibre: 0.088, at: 0.45 }] };
// Jagdpanzer IV L/70: low, the casemate on a Pz IV hull, its long 75 mm (hull 5.92 m, 3.17 x 1.85 m).
G['jagdpanzer-iv'] = { cls: 'tank-destroyer', chassis: 'tracked', length: 5.92, width: 3.17, hullHeight: 1.1, roadWheels: 8, hull: 'tank', skirts: true, turret: { x: 0.3, length: 4.3, width: 2.9, height: 0.75, shape: 'casemate', slope: 0.15 }, guns: [{ mount: 'turret', length: 3.3, calibre: 0.075, at: 0.45 }] };
// StuG III: a low casemate on the Pz III hull; C/D with the short gun, F/G long (hull 5.38 m, 2.95 x 2.16 m).
G['stug-iii-g'] = { cls: 'assault-gun', chassis: 'tracked', length: 5.38, width: 2.95, hullHeight: 1.3, roadWheels: 6, hull: 'ww2', turret: { x: 0.6, length: 3.4, width: 2.7, height: 0.8, shape: 'casemate', slope: 0.1 }, guns: [{ mount: 'turret', length: 2.8, calibre: 0.075, at: 0.45 }] };
G['stug-iii-d'] = { ...G['stug-iii-g'], guns: [{ mount: 'turret', length: 1.0, calibre: 0.075, at: 0.45 }] };
// StuG IV: the casemate on a Pz IV hull, eight small wheels.
G['stug-iv'] = { ...G['stug-iii-g'], length: 5.92, roadWheels: 8 };
// Brummbär (Sturmpanzer IV): a tall box casemate with a short 150 mm (hull 5.93 m, 2.88 x 2.52 m).
G['brummbar'] = { cls: 'assault-gun', chassis: 'tracked', length: 5.93, width: 2.88, hullHeight: 1.65, roadWheels: 8, hull: 'ww2', skirts: true, turret: { x: 0.5, length: 3.2, width: 2.7, height: 0.9, shape: 'casemate', slope: 0.06 }, guns: [{ mount: 'turret', length: 0.8, calibre: 0.15, at: 0.4 }] };
// Sturmtiger: a Tiger hull, a high box casemate and the 38 cm mortar (6.28 x 3.57 x 2.85 m).
G['sturmtiger'] = { cls: 'assault-gun', chassis: 'tracked', length: 6.28, width: 3.57, hullHeight: 1.9, roadWheels: 8, hull: 'ww2', turret: { x: 0.7, length: 3.6, width: 3.3, height: 0.95, shape: 'casemate', slope: 0.06 }, guns: [{ mount: 'turret', length: 0.6, calibre: 0.38, at: 0.4 }] };
// Elefant / Ferdinand: the casemate at the back, the engine forward, the long 88 mm (hull 6.8 m, 8.14 m overall, 3.38 x 2.97 m).
G['elefant'] = { cls: 'tank-destroyer', chassis: 'tracked', length: 6.8, width: 3.38, hullHeight: 1.75, roadWheels: 6, hull: 'ww2', turret: { x: -1.2, length: 3.8, width: 3.1, height: 1.15, shape: 'casemate', slope: 0.08 }, guns: [{ mount: 'turret', length: 5.3, calibre: 0.088, at: 0.5 }] };
// Marder III H: an open casemate on the Pz 38(t) (4.95 m overall, 2.15 x 2.48 m).
G['marder-iii'] = { cls: 'tank-destroyer', chassis: 'tracked', length: 4.65, width: 2.15, hullHeight: 1.3, roadWheels: 4, hull: 'ww2', turret: { x: -0.4, length: 1.8, width: 2.0, height: 1.0, shape: 'open' }, guns: [{ mount: 'turret', length: 2.9, calibre: 0.075, at: 0.6 }] };
// Wespe: an open casemate at the back of a Pz II with the 10.5 cm (4.81 x 2.28 x 2.3 m).
G['wespe'] = { cls: 'sp-artillery', chassis: 'tracked', length: 4.81, width: 2.28, hullHeight: 1.3, roadWheels: 5, hull: 'ww2', turret: { x: -1.0, length: 2.2, width: 2.2, height: 0.9, shape: 'open' }, guns: [{ mount: 'turret', length: 2.6, calibre: 0.105, at: 0.6, elevation: 0.12 }] };
// Hummel: the 15 cm on the Pz III/IV chassis in a tall open casemate (7.17 x 2.97 x 2.81 m).
G['hummel'] = { cls: 'sp-artillery', chassis: 'tracked', length: 7.17, width: 2.97, hullHeight: 1.5, roadWheels: 8, hull: 'ww2', turret: { x: -1.1, length: 3.3, width: 2.8, height: 1.2, shape: 'open' }, guns: [{ mount: 'turret', length: 3.3, calibre: 0.15, at: 0.6, elevation: 0.12 }] };
// Flakpanzer IV Wirbelwind: an open multi-sided turret with four 2 cm (5.92 x 2.9 x 2.76 m).
G['wirbelwind'] = { ...G['pz-iv-f1'], cls: 'spaa', cupola: false, turret: { x: 0.0, length: 2.2, width: 2.2, height: 0.8, shape: 'open' }, guns: [{ mount: 'turret', count: 4, length: 1.6, calibre: 0.02, at: 0.75, elevation: 0.45, spread: 0.35 }] };
// Möbelwagen: the Pz IV with high fold-down walls round a 3.7 cm.
G['mobelwagen'] = { ...G['pz-iv-f1'], cls: 'spaa', cupola: false, turret: { x: 0.0, length: 3.2, width: 2.8, height: 1.3, shape: 'open' }, guns: [{ mount: 'turret', length: 2.4, calibre: 0.037, at: 0.8, elevation: 0.5 }] };
// Sd.Kfz. 251 half-track: the armoured bonnet, open troop box, tracks behind the front wheels (5.8 x 2.1 x 1.75 m).
G['sdkfz-251'] = { cls: 'halftrack', chassis: 'halftrack', length: 5.8, width: 2.1, hullHeight: 1.75, roadWheels: 6, wheelRadius: 0.45, hull: 'box', bonnet: 1.6, openTop: true, guns: [{ mount: 'top', length: 1.2, calibre: 0.008 }] };
// The 251 with Wurfrahmen 40 rocket frames along its sides.
G['sdkfz-251-wurfrahmen'] = { ...G['sdkfz-251'], cls: 'mlrs', missiles: [{ mount: 'hull', rows: 1, cols: 3, length: 1.0, diameter: 0.32, elevation: 0.5, x: -0.6, side: 1.15, up: 0.1, boxes: true }, { mount: 'hull', rows: 1, cols: 3, length: 1.0, diameter: 0.32, elevation: 0.5, x: -0.6, side: -1.15, up: 0.1, boxes: true }] };
// Sd.Kfz. 7 artillery tractor: a bonnet, an open crew body with benches (6.85 x 2.35 x 2.62 m); with the Flakvierling on the back.
G['sdkfz-7'] = { cls: 'halftrack', chassis: 'halftrack', length: 6.85, width: 2.35, hullHeight: 1.45, roadWheels: 6, wheelRadius: 0.5, hull: 'open', bonnet: 1.8, openTop: true };
G['sdkfz-7-flakvierling'] = { ...G['sdkfz-7'], cls: 'spaa', turret: { x: -1.5, length: 1.3, width: 1.5, height: 0.6, shape: 'open' }, guns: [{ mount: 'turret', count: 4, length: 1.6, calibre: 0.02, at: 0.75, elevation: 0.45, spread: 0.35 }] };
// Sd.Kfz. 10 light half-track (4.75 x 1.93 x 1.62 m); with a 2 cm Flak 38.
G['sdkfz-10'] = { cls: 'halftrack', chassis: 'halftrack', length: 4.75, width: 1.93, hullHeight: 1.2, roadWheels: 5, wheelRadius: 0.4, hull: 'open', bonnet: 1.5, openTop: true };
G['sdkfz-10-flak'] = { ...G['sdkfz-10'], cls: 'spaa', turret: { x: -1.0, length: 0.8, width: 1.0, height: 0.6, shape: 'open' }, guns: [{ mount: 'turret', length: 1.9, calibre: 0.02, at: 0.8, elevation: 0.5 }] };
// Sd.Kfz. 222 four-wheeled armoured car with its open turret (4.8 x 1.95 x 2.0 m).
G['sdkfz-222'] = { cls: 'scout-car', chassis: 'wheeled', length: 4.8, width: 1.95, hullHeight: 1.5, axles: 2, wheelRadius: 0.45, hull: 'boat', turret: { x: -0.2, length: 1.4, width: 1.4, height: 0.45, shape: 'open' }, guns: [{ mount: 'turret', length: 1.4, calibre: 0.02, elevation: 0.1 }] };
// Sd.Kfz. 234/2 Puma: eight wheels, the long hull, a closed turret with the 50 mm (6.8 x 2.33 x 2.38 m).
G['sdkfz-234-puma'] = { cls: 'scout-car', chassis: 'wheeled', length: 6.0, width: 2.33, hullHeight: 1.65, axles: 4, wheelRadius: 0.5, hull: 'boat', turret: { x: 0.0, length: 1.9, width: 1.6, height: 0.7, shape: 'sloped', slope: 0.18 }, guns: [{ mount: 'turret', length: 2.3, calibre: 0.05 }] };
// Sd.Kfz. 232 (8-Rad): the older eight-wheeler, shorter and narrower, a small turret with the 20 mm KwK 30 (5.85 x 2.2 x 2.35 m).
G['sdkfz-232'] = { ...G['sdkfz-234-puma'], length: 5.85, width: 2.2, turret: { x: 0.0, length: 1.5, width: 1.4, height: 0.7, shape: 'sloped', slope: 0.18 }, guns: [{ mount: 'turret', length: 1.0, calibre: 0.02 }] };
// Kettenkrad: see the ride figures. Kübelwagen, Schwimmwagen, Horch staff car.
G['kubelwagen'] = { cls: 'jeep', chassis: 'wheeled', length: 3.74, width: 1.6, hullHeight: 1.0, axles: 2, hull: 'open', open: true, wheelRadius: 0.36 };
G['schwimmwagen'] = { cls: 'jeep', chassis: 'wheeled', length: 3.83, width: 1.48, hullHeight: 1.0, axles: 2, hull: 'boat', open: true, wheelRadius: 0.34 };
G['horch-901'] = { cls: 'jeep', chassis: 'wheeled', length: 4.44, width: 1.68, hullHeight: 1.1, axles: 2, hull: 'open', open: true, wheelRadius: 0.42 };
G['horch-830'] = { cls: 'civilian-car', chassis: 'wheeled', length: 4.7, width: 1.7, hullHeight: 1.55, axles: 2, hull: 'car', wheelRadius: 0.38 };
// Opel Blitz 3-ton: bonnet, cab, covered bed (6.02 x 2.27 x 2.18 m); as a tanker.
G['opel-blitz'] = { cls: 'truck', chassis: 'wheeled', length: 6.02, width: 2.27, hullHeight: 2.6, axles: 2, wheelRadius: 0.45, hull: 'truck', cab: { length: 1.5, height: 2.18, bonnet: 1.5 }, bed: 'covered' };
G['opel-blitz-tanker'] = { ...G['opel-blitz'], bed: 'tank', hullHeight: 2.0 };
// Krupp Protze six-wheeled light truck (5.1 x 1.96 x 2.0 m).
G['krupp-protze'] = { cls: 'truck', chassis: 'wheeled', length: 5.1, width: 1.96, hullHeight: 2.0, axles: 3, axleAt: [0.65, -0.35, -0.7], wheelRadius: 0.42, hull: 'truck', cab: { length: 1.4, height: 1.8, bonnet: 1.3, glass: false }, bed: 'covered' };

// ---------------------------------------------------------------- American, British, Commonwealth

// M4 Sherman (M4A2/M4A3 75): a tall hull with a sloped glacis, three bogies a side, the cast turret (5.84 x 2.62 x 2.74 m).
G['m4-sherman'] = { cls: 'medium-tank', chassis: 'tracked', length: 5.84, width: 2.62, hullHeight: 1.85, roadWheels: 6, hull: 'tank', turret: { x: 0.2, length: 2.4, width: 2.2, height: 0.85, shape: 'cast' }, guns: [{ mount: 'turret', length: 2.3, calibre: 0.075 }], cupola: true };
// M4A3(76)W and Easy Eight: the T23 turret and long 76 mm.
G['m4a3-76'] = { ...G['m4-sherman'], length: 5.9, turret: { x: 0.1, length: 2.8, width: 2.4, height: 0.9, shape: 'cast' }, guns: [{ mount: 'turret', length: 3.6, calibre: 0.076 }] };
// Sherman Firefly: the M4A4 (a longer hull) with the 17-pounder (6.06 x 2.62 x 2.74 m).
G['m4a4-firefly'] = { ...G['m4-sherman'], length: 6.06, guns: [{ mount: 'turret', length: 4.2, calibre: 0.076 }] };
// Sherman Calliope: the rocket rack of 60 tubes over the turret.
G['m4-calliope'] = { ...G['m4-sherman'], missiles: [{ mount: 'turret-top', rows: 3, cols: 12, length: 2.6, diameter: 0.115, pod: true, elevation: 0.05, x: 0.4, up: 0.8 }] };
// M3 Lee / Grant: a tall hull, the 75 mm in a sponson on the right, a 37 mm turret on top and a cupola turret on that (5.64 x 2.72 x 3.12 m).
G['m3-lee'] = { cls: 'medium-tank', chassis: 'tracked', length: 5.64, width: 2.72, hullHeight: 2.05, roadWheels: 6, hull: 'ww2', turret: { x: 0.0, length: 1.9, width: 1.7, height: 0.6, shape: 'cast', side: -0.25 }, turrets: [{ x: -0.1, length: 0.8, width: 0.8, height: 0.45, shape: 'cylinder', side: -0.25, up: 0.6 }], guns: [{ mount: 'turret', length: 1.6, calibre: 0.037 }, { mount: 'sponson', x: 1.0, side: 0.95, at: 0.62, length: 1.6, calibre: 0.075 }] };
// M3 Stuart (4.53 x 2.24 x 2.64 m).
G['m3-stuart'] = { cls: 'light-tank', chassis: 'tracked', length: 4.53, width: 2.24, hullHeight: 1.75, roadWheels: 4, hull: 'ww2', turret: { x: 0.0, length: 1.7, width: 1.5, height: 0.8, shape: 'sloped' }, guns: [{ mount: 'turret', length: 1.3, calibre: 0.037 }] };
// M24 Chaffee (5.56 x 3.0 x 2.77 m).
G['m24-chaffee'] = { cls: 'light-tank', chassis: 'tracked', length: 5.56, width: 3.0, hullHeight: 1.6, roadWheels: 5, hull: 'tank', turret: { x: 0.1, length: 2.3, width: 2.0, height: 0.8, shape: 'cast' }, guns: [{ mount: 'turret', length: 2.8, calibre: 0.075 }] };
// M26 Pershing (6.33 x 3.51 x 2.78 m).
G['m26-pershing'] = { cls: 'heavy-tank', chassis: 'tracked', length: 6.33, width: 3.51, hullHeight: 1.75, roadWheels: 6, hull: 'tank', turret: { x: 0.0, length: 3.2, width: 2.7, height: 0.9, shape: 'cast' }, guns: [{ mount: 'turret', length: 4.3, calibre: 0.09 }], cupola: true };
// M10 GMC: an open five-sided turret with the 3-inch (hull 5.97 m, 3.05 x 2.57 m).
G['m10-gmc'] = { cls: 'tank-destroyer', chassis: 'tracked', length: 5.97, width: 3.05, hullHeight: 1.75, roadWheels: 6, hull: 'tank', turret: { x: 0.0, length: 2.5, width: 2.4, height: 0.75, shape: 'open' }, guns: [{ mount: 'turret', length: 3.2, calibre: 0.076, at: 0.55 }] };
// M18 Hellcat (5.28 x 2.87 x 2.57 m).
G['m18-hellcat'] = { cls: 'tank-destroyer', chassis: 'tracked', length: 5.28, width: 2.87, hullHeight: 1.6, roadWheels: 5, hull: 'tank', turret: { x: 0.0, length: 2.4, width: 2.3, height: 0.7, shape: 'open' }, guns: [{ mount: 'turret', length: 3.3, calibre: 0.076, at: 0.55 }] };
// M36 Jackson: the M10 hull with a 90 mm open turret.
G['m36-jackson'] = { ...G['m10-gmc'], turret: { x: -0.2, length: 2.8, width: 2.5, height: 0.8, shape: 'open' }, guns: [{ mount: 'turret', length: 4.3, calibre: 0.09, at: 0.55 }] };
// M7 Priest: the 105 mm in an open casemate, the MG pulpit at the front right (6.02 x 2.88 x 2.54 m).
G['m7-priest'] = { cls: 'sp-artillery', chassis: 'tracked', length: 6.02, width: 2.88, hullHeight: 1.6, roadWheels: 6, hull: 'tank', turret: { x: -0.4, length: 3.2, width: 2.7, height: 0.8, shape: 'open' }, turrets: [{ x: 1.3, length: 0.9, width: 0.9, height: 0.6, shape: 'cylinder', side: 0.8, up: 0.3 }], guns: [{ mount: 'turret', length: 2.3, calibre: 0.105, at: 0.55, elevation: 0.1 }] };
// M12 GMC: the 155 mm open on the back of an M3 hull, a spade behind (6.74 x 2.67 x 2.88 m).
G['m12-gmc'] = { cls: 'sp-artillery', chassis: 'tracked', length: 6.74, width: 2.67, hullHeight: 1.7, roadWheels: 6, hull: 'ww2', spade: true, turret: { x: -1.6, length: 1.8, width: 2.4, height: 0.6, shape: 'open' }, guns: [{ mount: 'turret', length: 4.6, calibre: 0.155, at: 0.8, elevation: 0.12 }] };
// M4 high-speed tractor: a tracked box with a cab (5.03 x 2.46 x 2.51 m).
G['m4-tractor'] = { cls: 'tractor', chassis: 'tracked', length: 5.03, width: 2.46, hullHeight: 1.6, roadWheels: 4, hull: 'box', boxes: [{ x: 0.6, length: 2.4, height: 0.9, width: 2.3 }] };
// M30 cargo carrier: an open tracked carrier (est 5.9 x 2.88 x 2.0 m).
G['m30-cargo-carrier'] = { cls: 'tractor', chassis: 'tracked', length: 5.9, width: 2.88, hullHeight: 1.7, roadWheels: 6, hull: 'box', openTop: true };
// M3 and M2A1 half-tracks: bonnet, front wheels, open armoured body, tracks behind (6.18 x 2.22 x 2.26 m).
G['m3-halftrack'] = { cls: 'halftrack', chassis: 'halftrack', length: 6.18, width: 2.22, hullHeight: 1.85, roadWheels: 4, wheelRadius: 0.45, hull: 'box', bonnet: 1.7, openTop: true, guns: [{ mount: 'top', length: 1.6, calibre: 0.013 }] };
G['m2a1-halftrack'] = { ...G['m3-halftrack'], length: 5.96 };
// M3 GMC: the half-track with a 75 mm firing over the cab.
G['m3-gmc'] = { ...G['m3-halftrack'], cls: 'tank-destroyer', guns: [{ mount: 'hull', length: 2.6, calibre: 0.075, x: -0.2, at: 1.15 }] };
// M16 MGMC: the half-track with the quad .50 turret in the back.
G['m16-mgmc'] = { ...G['m3-halftrack'], cls: 'spaa', turret: { x: -1.2, length: 1.0, width: 0.9, height: 0.8, shape: 'box' }, guns: [{ mount: 'turret-side', count: 2, length: 1.6, calibre: 0.013, elevation: 0.35, at: 0.55, spread: 0.2 }] };
// M8 Greyhound: six wheels, the open-topped turret with a 37 mm (5.0 x 2.54 x 2.25 m).
G['m8-greyhound'] = { cls: 'scout-car', chassis: 'wheeled', length: 5.0, width: 2.54, hullHeight: 1.5, axles: 3, axleAt: [0.6, -0.25, -0.65], wheelRadius: 0.48, hull: 'boat', turret: { x: 0.0, length: 1.8, width: 1.7, height: 0.6, shape: 'open' }, guns: [{ mount: 'turret', length: 1.5, calibre: 0.037 }] };
// T17E1 Staghound (5.49 x 2.69 x 2.36 m).
G['staghound'] = { cls: 'scout-car', chassis: 'wheeled', length: 5.49, width: 2.69, hullHeight: 1.6, axles: 2, wheelRadius: 0.55, hull: 'boat', turret: { x: 0.0, length: 2.0, width: 1.8, height: 0.7, shape: 'cast' }, guns: [{ mount: 'turret', length: 1.6, calibre: 0.037 }] };
// Daimler armoured car (3.96 x 2.44 x 2.24 m) and Humber Mk IV (4.57 x 2.18 x 2.34 m).
G['daimler-armoured-car'] = { cls: 'scout-car', chassis: 'wheeled', length: 3.96, width: 2.44, hullHeight: 1.55, axles: 2, wheelRadius: 0.5, hull: 'boat', turret: { x: 0.0, length: 1.5, width: 1.4, height: 0.65, shape: 'sloped' }, guns: [{ mount: 'turret', length: 1.5, calibre: 0.04 }] };
G['humber-mk4'] = { ...G['daimler-armoured-car'], length: 4.57, width: 2.18, hullHeight: 1.65 };
// Universal Carrier: small, open, four road wheels (3.65 x 2.06 x 1.57 m).
G['universal-carrier'] = { cls: 'apc-tracked', chassis: 'tracked', length: 3.65, width: 2.06, hullHeight: 1.1, roadWheels: 3, hull: 'box', openTop: true, guns: [{ mount: 'hull', length: 1.2, calibre: 0.008, at: 1.0, side: -0.4 }] };
// Willys MB (3.36 x 1.58 x 1.32 m); GAZ-67 (3.35 x 1.69 x 1.7 m); Kurogane.
G['willys-mb'] = { cls: 'jeep', chassis: 'wheeled', length: 3.36, width: 1.58, hullHeight: 0.95, axles: 2, hull: 'open', open: true, wheelRadius: 0.36 };
G['gaz-67'] = { ...G['willys-mb'], length: 3.35, width: 1.69 };
// GMC CCKW 353 (6.9 x 2.24 x 2.8 m), as a tanker; Studebaker US6 (6.2 x 2.24 x 2.8 m); Bedford QL (6.0 x 2.26 x 3.0 m); Ford G917 (est).
G['gmc-cckw'] = { cls: 'truck', chassis: 'wheeled', length: 6.9, width: 2.24, hullHeight: 2.8, axles: 3, axleAt: [0.7, -0.35, -0.7], wheelRadius: 0.48, hull: 'truck', cab: { length: 1.5, height: 2.2, bonnet: 1.6 }, bed: 'covered' };
G['gmc-cckw-tanker'] = { ...G['gmc-cckw'], bed: 'tank', hullHeight: 2.1 };
G['studebaker-us6'] = { ...G['gmc-cckw'], length: 6.2 };
G['bedford-ql'] = { cls: 'truck', chassis: 'wheeled', length: 6.0, width: 2.26, hullHeight: 3.0, axles: 2, wheelRadius: 0.5, hull: 'truck', cab: { length: 1.8, height: 2.6 }, bed: 'covered' };
G['ford-g917'] = { cls: 'truck', chassis: 'wheeled', length: 6.2, width: 2.2, hullHeight: 2.5, axles: 2, wheelRadius: 0.45, hull: 'truck', cab: { length: 1.4, height: 2.1, bonnet: 1.5 }, bed: 'covered' };
// Dodge WC54 ambulance (4.7 x 1.98 x 2.3 m).
G['dodge-wc'] = { cls: 'truck', chassis: 'wheeled', length: 4.7, width: 1.98, hullHeight: 2.3, axles: 2, wheelRadius: 0.42, hull: 'truck', cab: { length: 1.0, height: 2.0, bonnet: 1.3 }, bed: 'box' };
// Morris C9B: a Bofors on a light truck (est 5.2 x 2.2 m).
G['morris-c9b'] = { cls: 'spaa', chassis: 'wheeled', length: 5.2, width: 2.2, hullHeight: 1.1, axles: 2, wheelRadius: 0.48, hull: 'truck', cab: { length: 1.4, height: 2.0, bonnet: 1.2 }, bed: 'flat', turret: { x: -1.2, length: 1.4, width: 1.6, height: 0.5, shape: 'box' }, guns: [{ mount: 'turret', length: 2.8, calibre: 0.04, elevation: 0.45, at: 1.1 }] };
// Cromwell IV / Centaur IV: five big road wheels, a box turret (6.35 x 2.91 x 2.83 m).
G['cromwell'] = { cls: 'medium-tank', chassis: 'tracked', length: 6.35, width: 2.91, hullHeight: 1.75, roadWheels: 5, hull: 'ww2', turret: { x: 0.2, length: 2.4, width: 2.2, height: 0.9, shape: 'box' }, guns: [{ mount: 'turret', length: 2.3, calibre: 0.075 }] };
G['centaur-cs'] = { ...G['cromwell'], guns: [{ mount: 'turret', length: 1.4, calibre: 0.095 }] };
// Churchill IV / VII: a long low hull with the tracks overhung, a box turret (7.44 x 3.25 x 2.74 m); the gun carrier a casemate.
G['churchill'] = { cls: 'heavy-tank', chassis: 'tracked', length: 7.44, width: 3.25, hullHeight: 1.9, roadWheels: 11, hull: 'ww2', skirts: true, turret: { x: 0.3, length: 2.4, width: 2.2, height: 0.85, shape: 'box' }, guns: [{ mount: 'turret', length: 2.4, calibre: 0.075 }] };
G['churchill-gun-carrier'] = { ...G['churchill'], cls: 'tank-destroyer', turret: { x: 0.6, length: 3.4, width: 2.4, height: 0.8, shape: 'casemate' }, guns: [{ mount: 'turret', length: 3.2, calibre: 0.076, at: 0.45, side: -0.4 }] };
// Matilda II: full-length skirts, a small cast turret (5.61 x 2.59 x 2.52 m).
G['matilda-ii'] = { cls: 'medium-tank', chassis: 'tracked', length: 5.61, width: 2.59, hullHeight: 1.75, roadWheels: 5, hull: 'ww2', skirts: true, turret: { x: 0.1, length: 2.0, width: 1.8, height: 0.75, shape: 'cast' }, guns: [{ mount: 'turret', length: 1.5, calibre: 0.04 }] };
// Valentine (5.41 x 2.63 x 2.27 m); the Archer with its 17-pounder pointing back; the AA version.
G['valentine'] = { cls: 'light-tank', chassis: 'tracked', length: 5.41, width: 2.63, hullHeight: 1.5, roadWheels: 6, hull: 'ww2', turret: { x: 0.1, length: 1.9, width: 1.8, height: 0.7, shape: 'sloped' }, guns: [{ mount: 'turret', length: 1.6, calibre: 0.057 }] };
G['valentine-archer'] = { ...G['valentine'], cls: 'tank-destroyer', turret: { x: -0.6, length: 2.4, width: 2.2, height: 0.7, shape: 'open' }, guns: [{ mount: 'hull', length: -3.6, calibre: 0.076, x: -0.6, at: 1.3 }] };
G['valentine-aa'] = { ...G['valentine'], cls: 'spaa', turret: { x: 0.1, length: 1.9, width: 1.8, height: 0.7, shape: 'open' }, guns: [{ mount: 'turret', count: 2, length: 1.8, calibre: 0.02, elevation: 0.45, at: 0.8, spread: 0.3 }] };
// Tetrarch: four big road wheels, a small turret (4.11 x 2.31 x 2.12 m).
G['tetrarch'] = { cls: 'light-tank', chassis: 'tracked', length: 4.11, width: 2.31, hullHeight: 1.35, roadWheels: 4, hull: 'ww2', turret: { x: 0.0, length: 1.7, width: 1.6, height: 0.7, shape: 'sloped' }, guns: [{ mount: 'turret', length: 1.5, calibre: 0.04 }] };
// Bedford MWD light truck (est 4.4 x 2.0 m).
G['bedford-mwd'] = { cls: 'truck', chassis: 'wheeled', length: 4.4, width: 2.0, hullHeight: 2.2, axles: 2, wheelRadius: 0.42, hull: 'truck', cab: { length: 1.2, height: 2.0, bonnet: 1.2 }, bed: 'covered' };
// BA-10 six-wheeled armoured car (4.65 x 2.07 x 2.21 m); BA-64 small (3.67 x 1.52 x 1.9 m).
G['ba-10'] = { cls: 'scout-car', chassis: 'wheeled', length: 4.65, width: 2.07, hullHeight: 1.6, axles: 3, axleAt: [0.6, -0.3, -0.7], wheelRadius: 0.45, hull: 'box', bonnet: 1.0, turret: { x: -0.3, length: 1.5, width: 1.4, height: 0.6, shape: 'cylinder' }, guns: [{ mount: 'turret', length: 1.4, calibre: 0.045 }] };
G['ba-64'] = { cls: 'scout-car', chassis: 'wheeled', length: 3.67, width: 1.52, hullHeight: 1.45, axles: 2, wheelRadius: 0.4, hull: 'boat', turret: { x: -0.2, length: 0.9, width: 0.9, height: 0.45, shape: 'open' }, guns: [{ mount: 'turret', length: 1.0, calibre: 0.008 }] };
// GAZ-AA (5.34 x 2.04 x 1.97 m), GAZ-MM with a 72-K, ZiS-5 (6.06 x 2.24 x 2.16 m), ZiS-6 with BM-13 rails.
G['gaz-aa'] = { cls: 'truck', chassis: 'wheeled', length: 5.34, width: 2.04, hullHeight: 1.1, axles: 2, wheelRadius: 0.42, hull: 'truck', cab: { length: 1.3, height: 1.97, bonnet: 1.4 }, bed: 'flat' };
G['gaz-aa-aa'] = { ...G['gaz-aa'], cls: 'spaa', turret: { x: -1.2, length: 0.9, width: 0.9, height: 0.4, shape: 'box' }, guns: [{ mount: 'turret', count: 4, length: 1.0, calibre: 0.008, elevation: 0.5, at: 1.4, spread: 0.18 }] };
G['gaz-mm-72k'] = { ...G['gaz-aa'], cls: 'spaa', turret: { x: -1.2, length: 1.0, width: 1.0, height: 0.4, shape: 'box' }, guns: [{ mount: 'turret', length: 2.0, calibre: 0.025, elevation: 0.5, at: 1.2 }] };
G['zis-5'] = { cls: 'truck', chassis: 'wheeled', length: 6.06, width: 2.24, hullHeight: 1.15, axles: 2, wheelRadius: 0.45, hull: 'truck', cab: { length: 1.4, height: 2.16, bonnet: 1.5 }, bed: 'flat' };
G['zis-5-72k'] = { ...G['zis-5'], cls: 'spaa', turret: { x: -1.3, length: 1.0, width: 1.0, height: 0.4, shape: 'box' }, guns: [{ mount: 'turret', length: 2.0, calibre: 0.025, elevation: 0.5, at: 1.2 }] };
G['bm-13-katyusha'] = { cls: 'mlrs', chassis: 'wheeled', length: 6.55, width: 2.24, hullHeight: 1.2, axles: 3, axleAt: [0.7, -0.35, -0.7], wheelRadius: 0.45, hull: 'truck', cab: { length: 1.4, height: 2.16, bonnet: 1.5 }, bed: 'flat', missiles: [{ mount: 'hull', rows: 2, cols: 8, length: 5.0, diameter: 0.132, rail: true, elevation: 0.2, x: -0.9, up: 0.6 }] };
// GAZ-M1 staff car (4.63 x 1.77 x 1.67 m).
G['gaz-m1'] = { cls: 'civilian-car', chassis: 'wheeled', length: 4.63, width: 1.77, hullHeight: 1.6, axles: 2, hull: 'car', wheelRadius: 0.38 };

// ---------------------------------------------------------------- Japanese and Italian

// Type 97 Chi-Ha (5.52 x 2.33 x 2.23 m), Type 95 Ha-Go (4.38 x 2.06 x 2.13 m), Type 89 I-Go (5.75 x 2.18 x 2.56 m), Type 98 Ke-Ni (4.11 x 2.12 x 1.82 m).
G['type-97-chi-ha'] = { cls: 'medium-tank', chassis: 'tracked', length: 5.52, width: 2.33, hullHeight: 1.5, roadWheels: 6, hull: 'ww2', turret: { x: 0.1, length: 1.9, width: 1.6, height: 0.7, shape: 'cylinder', side: 0.2 }, guns: [{ mount: 'turret', length: 1.0, calibre: 0.057 }] };
G['type-95-ha-go'] = { cls: 'light-tank', chassis: 'tracked', length: 4.38, width: 2.06, hullHeight: 1.45, roadWheels: 4, hull: 'ww2', turret: { x: 0.2, length: 1.5, width: 1.4, height: 0.65, shape: 'cylinder', side: -0.2 }, guns: [{ mount: 'turret', length: 1.2, calibre: 0.037 }] };
G['type-89-i-go'] = { cls: 'medium-tank', chassis: 'tracked', length: 5.75, width: 2.18, hullHeight: 1.65, roadWheels: 9, hull: 'ww2', skirts: true, turret: { x: 0.4, length: 1.6, width: 1.5, height: 0.8, shape: 'cylinder' }, guns: [{ mount: 'turret', length: 0.7, calibre: 0.057 }] };
G['type-98-ke-ni'] = { cls: 'light-tank', chassis: 'tracked', length: 4.11, width: 2.12, hullHeight: 1.2, roadWheels: 4, hull: 'tank', turret: { x: 0.2, length: 1.4, width: 1.3, height: 0.6, shape: 'sloped' }, guns: [{ mount: 'turret', length: 1.2, calibre: 0.037 }] };
// Type 2 Ka-Mi with its pontoons fitted (7.42 x 2.79 x 2.34 m).
G['type-2-ka-mi'] = { cls: 'light-tank', chassis: 'tracked', length: 4.8, width: 2.79, hullHeight: 1.5, roadWheels: 4, hull: 'boat', boxes: [{ x: 3.1, length: 1.4, height: 0.9, up: -0.9 }, { x: -2.9, length: 1.0, height: 0.9, up: -0.9 }], turret: { x: 0.0, length: 1.6, width: 1.5, height: 0.75, shape: 'cylinder' }, guns: [{ mount: 'turret', length: 1.2, calibre: 0.037 }] };
// Type 98 So-Da tracked carrier (est 4.1 x 2.1 x 1.6 m); Type 94 truck (est 5.4 x 1.9 m); Kurogane (3.38 x 1.52 x 1.68 m).
G['type-98-so-da'] = { cls: 'apc-tracked', chassis: 'tracked', length: 4.1, width: 2.1, hullHeight: 1.4, roadWheels: 4, hull: 'box', openTop: true };
G['type-94-truck'] = { cls: 'truck', chassis: 'wheeled', length: 5.4, width: 1.9, hullHeight: 2.2, axles: 3, wheelRadius: 0.4, hull: 'truck', cab: { length: 1.4, height: 2.0, bonnet: 1.2 }, bed: 'covered' };
G['type-95-kurogane'] = { ...G['willys-mb'], length: 3.38, width: 1.52 };
// Fiat M11/39 (4.73 x 2.18 x 2.25 m): a 37 mm in the hull, an MG turret on top.
G['fiat-m11-39'] = { cls: 'light-tank', chassis: 'tracked', length: 4.73, width: 2.18, hullHeight: 1.55, roadWheels: 8, hull: 'ww2', turret: { x: -0.1, length: 1.2, width: 1.1, height: 0.6, shape: 'cylinder', side: -0.25 }, guns: [{ mount: 'hull', length: 1.0, calibre: 0.037, side: 0.4, at: 0.8 }, { mount: 'turret', length: 0.6, calibre: 0.008 }] };
// Fiat M13/40 (4.92 x 2.2 x 2.37 m).
G['fiat-m13-40'] = { cls: 'medium-tank', chassis: 'tracked', length: 4.92, width: 2.2, hullHeight: 1.55, roadWheels: 8, hull: 'ww2', turret: { x: 0.0, length: 1.7, width: 1.5, height: 0.75, shape: 'sloped' }, guns: [{ mount: 'turret', length: 1.5, calibre: 0.047 }] };

// ---------------------------------------------------------------- WWI

// Mark IV / Mark V: the rhomboid track frames, a 6-pounder in a sponson each side (8.05 m long, 2.65 m hull, 4.11 m over sponsons, 2.64 m high).
G['mark-v-male'] = { cls: 'ww1-tank', chassis: 'tracked', length: 8.05, width: 2.65, hullHeight: 2.6, hull: 'rhomboid', guns: [{ mount: 'sponson', both: true, x: 0.6, side: 1.55, at: 0.5, length: 1.3, calibre: 0.057 }] };
// The female carried machine guns in smaller sponsons.
G['mark-v-female'] = { ...G['mark-v-male'], guns: [{ mount: 'sponson', both: true, x: 0.6, side: 1.45, at: 0.5, length: 0.8, calibre: 0.008 }] };
// A7V: a big armoured box over a short track run, the 57 mm in the nose (7.34 x 3.1 x 3.3 m).
G['a7v'] = { cls: 'ww1-tank', chassis: 'tracked', length: 7.34, width: 3.1, hullHeight: 1.0, roadWheels: 7, hull: 'box', boxes: [{ x: 0, length: 7.34, height: 2.0, width: 3.1 }, { x: 0.6, length: 1.6, height: 0.5, width: 1.6, up: 2.0 }], guns: [{ mount: 'hull', length: 0.8, calibre: 0.057, x: 3.6, at: 2.1 }] };
// Saint-Chamond: a long box hull overhanging its tracks, the 75 mm in the nose (8.96 x 2.67 x 2.36 m).
G['saint-chamond'] = { cls: 'ww1-tank', chassis: 'tracked', length: 7.9, width: 2.67, hullHeight: 0.9, roadWheels: 8, hull: 'box', boxes: [{ x: 0.3, length: 8.6, height: 1.45, width: 2.67 }, { x: 2.6, length: 0.9, height: 0.35, width: 0.9, side: -0.6, up: 1.45 }], guns: [{ mount: 'hull', length: 1.0, calibre: 0.075, x: 4.6, at: 1.7 }] };
// Schneider CA1: a box with a pointed prow, the short 75 mm on the right (6.32 x 2.05 x 2.3 m).
G['schneider-ca1'] = { cls: 'ww1-tank', chassis: 'tracked', length: 5.2, width: 2.05, hullHeight: 1.0, roadWheels: 6, hull: 'box', boxes: [{ x: 0.2, length: 5.8, height: 1.3, width: 2.05 }], guns: [{ mount: 'hull', length: 0.5, calibre: 0.075, x: 1.8, side: 0.9, at: 1.6 }] };
// Renault FT: a small tank with the first full turret, a tail skid (5.0 x 1.74 x 2.14 m).
G['renault-ft'] = { cls: 'light-tank', chassis: 'tracked', length: 5.0, width: 1.74, hullHeight: 1.45, roadWheels: 4, hull: 'tank', turret: { x: 0.4, length: 1.3, width: 1.2, height: 0.75, shape: 'cast' }, guns: [{ mount: 'turret', length: 0.8, calibre: 0.037 }] };
// Char 2C: the super-heavy, a 75 mm turret forward and an MG turret aft (10.27 x 3.0 x 4.09 m).
G['char-2c'] = { cls: 'ww1-tank', chassis: 'tracked', length: 10.27, width: 3.0, hullHeight: 2.6, roadWheels: 14, hull: 'ww2', skirts: true, turret: { x: 2.4, length: 2.0, width: 1.9, height: 0.9, shape: 'cylinder' }, turrets: [{ x: -3.0, length: 1.5, width: 1.4, height: 0.75, shape: 'cylinder' }], guns: [{ mount: 'turret', length: 1.6, calibre: 0.075 }, { mount: 'turret', turret: 1, length: 0.7, calibre: 0.008 }] };
// WWI armoured cars: Rolls-Royce / Lancia (5.18 x 1.93 x 2.55 m) and Putilov-Garford (5.7 x 2.3 x 2.8 m).
G['rolls-royce-armoured-car'] = { cls: 'scout-car', chassis: 'wheeled', length: 5.18, width: 1.93, hullHeight: 1.6, axles: 2, wheelRadius: 0.45, hull: 'box', bonnet: 1.6, turret: { x: -0.4, length: 1.3, width: 1.3, height: 0.6, shape: 'cylinder' }, guns: [{ mount: 'turret', length: 0.8, calibre: 0.008 }] };
G['putilov-garford'] = { cls: 'scout-car', chassis: 'wheeled', length: 5.7, width: 2.3, hullHeight: 2.0, axles: 2, wheelRadius: 0.5, hull: 'box', bonnet: 1.5, turret: { x: -1.6, length: 1.6, width: 1.6, height: 0.8, shape: 'cylinder' }, guns: [{ mount: 'turret', length: 1.5, calibre: 0.076 }] };
// WWI lorries (Benz, Daimler, Leyland, Jeffery Quad, Crossley, Thornycroft; est 5.0-6.4 x 2.0-2.2 m) and those carrying an AA gun.
G['ww1-lorry'] = { cls: 'truck', chassis: 'wheeled', length: 5.8, width: 2.1, hullHeight: 2.5, axles: 2, wheelRadius: 0.48, hull: 'truck', cab: { length: 1.0, height: 2.2, bonnet: 1.4, glass: false }, bed: 'covered' };
G['ww1-lorry-open'] = { ...G['ww1-lorry'], bed: 'flat', hullHeight: 1.2 };
G['ww1-aa-lorry'] = { ...G['ww1-lorry-open'], cls: 'spaa', turret: { x: -1.5, length: 1.2, width: 1.2, height: 0.5, shape: 'box' }, guns: [{ mount: 'turret', length: 2.4, calibre: 0.076, elevation: 0.5, at: 1.2 }] };

// ---------------------------------------------------------------- field, anti-tank and AA guns

// ZiS-3 76 mm (6.1 x 1.6 x 1.37 m), Pak 40 (6.2 x 2.08 x 1.2 m), Pak 38 (4.75 x 1.85 x 1.05 m), Pak 35/36 (3.4 x 1.65 x 1.17 m).
G['zis-3'] = { cls: 'towed-gun', chassis: 'towed', length: 6.1, width: 1.6, hullHeight: 1.0, axles: 1, wheelRadius: 0.4, guns: [{ mount: 'hull', length: 3.2, calibre: 0.076, at: 0.9, x: 0.1 }] };
G['pak-40'] = { cls: 'towed-gun', chassis: 'towed', length: 6.2, width: 2.08, hullHeight: 0.95, axles: 1, wheelRadius: 0.45, guns: [{ mount: 'hull', length: 3.4, calibre: 0.075, at: 0.85, x: 0.1 }] };
G['pak-38'] = { ...G['pak-40'], length: 4.75, width: 1.85, hullHeight: 0.85, guns: [{ mount: 'hull', length: 2.8, calibre: 0.05, at: 0.85, x: 0.1 }] };
G['pak-36'] = { ...G['pak-40'], length: 3.4, width: 1.65, hullHeight: 0.8, guns: [{ mount: 'hull', length: 1.6, calibre: 0.037, at: 0.85, x: 0.1 }] };
G['m-42-45mm'] = { ...G['pak-36'], length: 4.9, width: 1.63, guns: [{ mount: 'hull', length: 2.8, calibre: 0.045, at: 0.85, x: 0.1 }] };
G['zis-2-57mm'] = { ...G['zis-3'], length: 7.0, guns: [{ mount: 'hull', length: 3.9, calibre: 0.057, at: 0.9, x: 0.1 }] };
// QF 6-pounder (4.8 x 1.8 x 1.3 m), QF 25-pounder (est), QF 18-pounder / FK 96 / Canon de 75 (WWI field guns, est 5.0 x 2.0 m).
G['qf-6-pounder'] = { ...G['pak-40'], length: 4.8, width: 1.8, guns: [{ mount: 'hull', length: 2.6, calibre: 0.057, at: 0.9, x: 0.1 }] };
G['ww1-field-gun'] = { cls: 'towed-gun', chassis: 'towed', length: 5.0, width: 2.0, hullHeight: 1.2, axles: 1, wheelRadius: 0.65, guns: [{ mount: 'hull', length: 2.2, calibre: 0.077, at: 0.85, x: 0.3, elevation: 0.08 }] };
// leFH 18 (6.1 x 1.98 x 1.88 m), M-30 122 mm (5.9 x 1.98 x 1.82 m), ML-20 152 mm (8.18 x 2.35 x 2.27 m), 155 mm M1 (7.3 x 2.44 x 1.8 m), QF 4.5-inch (est).
G['lefh-18'] = { cls: 'towed-gun', chassis: 'towed', length: 6.1, width: 1.98, hullHeight: 1.2, axles: 1, wheelRadius: 0.6, guns: [{ mount: 'hull', length: 2.6, calibre: 0.105, at: 0.95, x: 0.1, elevation: 0.15 }] };
G['m-30-122mm'] = { ...G['lefh-18'], length: 5.9, guns: [{ mount: 'hull', length: 2.6, calibre: 0.122, at: 0.95, x: 0.1, elevation: 0.15 }] };
G['ml-20-152mm'] = { cls: 'towed-gun', chassis: 'towed', length: 8.18, width: 2.35, hullHeight: 1.4, axles: 1, wheelRadius: 0.65, guns: [{ mount: 'hull', length: 4.2, calibre: 0.152, at: 0.95, x: 0.0, elevation: 0.15 }] };
G['m1-155mm-howitzer'] = { ...G['ml-20-152mm'], length: 7.3, width: 2.44 };
G['qf-4-5-howitzer'] = { ...G['lefh-18'], length: 5.0, width: 1.9 };
// 53-K 45 mm (4.0 x 1.63 x 1.2 m).
G['53-k-45mm'] = { ...G['pak-36'], length: 4.0, width: 1.63, guns: [{ mount: 'hull', length: 2.0, calibre: 0.045, at: 0.85, x: 0.1 }] };
// 61-K 37 mm AA on its four-wheeled carriage (5.5 x 1.79 x 2.1 m); 52-K 85 mm (7.05 x 2.15 x 2.25 m); 72-K 25 mm (est); M1A1 90 mm (6.2 x 2.5 x 2.6 m).
G['61-k-37mm'] = { cls: 'towed-aa', chassis: 'towed', length: 5.5, width: 1.79, hullHeight: 1.0, axles: 2, axleAt: [0.6, -0.6], wheelRadius: 0.4, shield: false, guns: [{ mount: 'hull', length: 2.6, calibre: 0.037, elevation: 0.5, at: 1.45, x: -0.3 }] };
G['52-k-85mm'] = { cls: 'towed-aa', chassis: 'towed', length: 7.05, width: 2.15, hullHeight: 1.4, axles: 2, axleAt: [0.6, -0.4], wheelRadius: 0.48, guns: [{ mount: 'hull', length: 4.6, calibre: 0.085, elevation: 0.45, at: 1.3, x: -0.5 }] };
G['72-k-25mm'] = { ...G['61-k-37mm'], length: 4.6, guns: [{ mount: 'hull', length: 2.0, calibre: 0.025, elevation: 0.5, at: 1.45, x: -0.3 }] };
G['m1a1-90mm-aa'] = { ...G['52-k-85mm'], length: 6.2, width: 2.5, guns: [{ mount: 'hull', length: 4.5, calibre: 0.09, elevation: 0.45, at: 1.3, x: -0.5 }] };
// WWI AA guns: QF 13-pounder, 7.7 cm FlaK L/27 (est), on a pedestal.
G['ww1-aa-gun'] = { cls: 'towed-aa', chassis: 'pedestal', length: 3.0, width: 3.0, hullHeight: 1.0, turret: { x: 0, length: 1.0, width: 1.0, height: 0.6, shape: 'box' }, guns: [{ mount: 'turret', length: 2.4, calibre: 0.076, elevation: 0.6, at: 0.6 }] };
// Landing pontoon guns (BF1942 coastal guns, est): a big gun in an open shield on a concrete base.
G['coastal-gun'] = { cls: 'emplacement-gun', chassis: 'pedestal', length: 6.0, width: 6.0, hullHeight: 1.2, turret: { x: 0, length: 3.0, width: 2.8, height: 1.6, shape: 'sloped' }, guns: [{ mount: 'turret', length: 6.5, calibre: 0.15, elevation: 0.08, at: 0.5 }] };

// ---------------------------------------------------------------- railways

// Steam locomotives with tender: Russian E-class 0-10-0 and Prussian G8 (est 19 m with tender, 3.1 m wide); DRG Class 86 tank engine (13.9 m).
G['steam-locomotive'] = { cls: 'rail', chassis: 'rail', length: 19.0, width: 3.1, hullHeight: 1.6, boiler: { length: 8.5, diameter: 1.8 }, boxes: [{ x: -0.8, length: 2.4, height: 2.6, width: 3.0 }, { x: -6.0, length: 6.6, height: 2.2, width: 3.0 }] };
G['drg-class-86'] = { cls: 'rail', chassis: 'rail', length: 13.9, width: 3.1, hullHeight: 1.6, boiler: { length: 7.5, diameter: 1.7 }, boxes: [{ x: -3.6, length: 3.4, height: 2.6, width: 3.0 }] };
// Diesel shunter (ChME3, 17.2 m), road diesel (ES44AH, 22.3 m), electric (VL80 section, 16.4 m).
G['diesel-shunter'] = { cls: 'rail', chassis: 'rail', length: 17.2, width: 3.2, hullHeight: 1.7, boxes: [{ x: 1.0, length: 10.0, height: 1.8, width: 2.4 }, { x: -6.2, length: 3.0, height: 2.7, width: 3.2 }, { x: 7.6, length: 1.6, height: 1.2, width: 2.4 }] };
G['diesel-locomotive'] = { cls: 'rail', chassis: 'rail', length: 22.3, width: 3.1, hullHeight: 1.7, boxes: [{ x: -1.5, length: 16.0, height: 2.8, width: 2.9 }, { x: 8.6, length: 2.8, height: 2.9, width: 3.1 }] };
G['electric-locomotive'] = { cls: 'rail', chassis: 'rail', length: 32.8, width: 3.2, hullHeight: 1.7, boxes: [{ x: 0, length: 32.0, height: 3.0, width: 3.1 }], radars: [{ kind: 'bar', x: 8.0, up: 3.6, size: 1.6 }, { kind: 'bar', x: -8.0, up: 3.6, size: 1.6 }] };
// Wagons: a covered van, an open wagon, a tank car, a flat car, a passenger coach (est 10-24 m).
G['rail-boxcar'] = { cls: 'rail', chassis: 'rail', length: 14.0, width: 3.0, hullHeight: 1.4, boxes: [{ x: 0, length: 13.6, height: 2.8, width: 3.0 }] };
G['rail-open-wagon'] = { cls: 'rail', chassis: 'rail', length: 14.0, width: 3.0, hullHeight: 1.4, boxes: [{ x: 0, length: 13.6, height: 1.6, width: 3.0 }] };
G['rail-tank-car'] = { cls: 'rail', chassis: 'rail', length: 12.0, width: 3.0, hullHeight: 1.4, boiler: { length: 10.5, diameter: 2.6 } };
G['rail-flat-car'] = { cls: 'rail', chassis: 'rail', length: 14.0, width: 3.0, hullHeight: 1.4, boxes: [{ x: 0, length: 13.6, height: 0.2, width: 3.0 }] };
G['rail-passenger-car'] = { cls: 'rail', chassis: 'rail', length: 24.0, width: 3.1, hullHeight: 1.4, boxes: [{ x: 0, length: 23.6, height: 2.9, width: 3.1 }] };
G['ww2-goods-wagon'] = { cls: 'rail', chassis: 'rail', length: 9.1, width: 2.8, hullHeight: 1.3, boxes: [{ x: 0, length: 8.8, height: 2.6, width: 2.8 }] };
// Armoured train car (BF1 behemoth, est): an armoured box with a turret at each end.
G['armoured-train-car'] = { cls: 'rail', chassis: 'rail', length: 16.0, width: 3.0, hullHeight: 1.4, boxes: [{ x: 0, length: 15.6, height: 2.2, width: 3.0 }], turret: { x: 5.0, length: 2.4, width: 2.2, height: 1.0, shape: 'cylinder', up: 2.2 }, turrets: [{ x: -5.0, length: 2.4, width: 2.2, height: 1.0, shape: 'cylinder', up: 2.2 }], guns: [{ mount: 'turret', length: 2.6, calibre: 0.076 }, { mount: 'turret', turret: 1, length: -2.6, calibre: 0.076 }] };

// T28 / T95 super-heavy: a low casemate on a hull with double tracks each side (11.1 m with gun, 4.39 x 2.84 m).
G['t95-super-heavy'] = { cls: 'tank-destroyer', chassis: 'tracked', length: 7.6, width: 4.39, hullHeight: 1.6, roadWheels: 8, hull: 'tank', skirts: true, turret: { x: 0.5, length: 4.4, width: 3.0, height: 0.9, shape: 'casemate', slope: 0.1 }, guns: [{ mount: 'turret', length: 3.6, calibre: 0.105, at: 0.45 }] };
// Pierce-Arrow AA lorry with a QF 1-pounder.
G['ww1-pom-pom-lorry'] = { ...G['ww1-aa-lorry'], guns: [{ mount: 'turret', length: 1.6, calibre: 0.037, elevation: 0.5, at: 1.2 }] };

export const GROUND_WW2: SpecSet = { ground: G };
