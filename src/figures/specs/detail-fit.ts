/**
 * Details fitted to the War Thunder reference. Where public sources do not fix a figure's running gear, gun or roof
 * details well enough (the user's call, 2026-11-14: hits and events have to land on the right spot of the vehicle),
 * they may be fitted to the reference silhouette, a few control values per figure, found by measuring the figure at
 * many settings and keeping each step that matched the reference better; listed in sources.md as fitted to the WT
 * reference.
 *
 * Ground: `bd` thickens the track (a share of its band), `wr` the road wheels' radius, `es` the sprocket's and idler's
 * (shares); `ws` spreads the road wheels about their middle (a share), `wx` moves them forward (a share of the half
 * length); `ef` and `eb` stretch the track's run forward and back (shares of the half length at its end); `hf` and `hr`
 * stretch the hull outline's front and rear halves (shares) over the same track. The main gun: `gl` lengthens it, `gc`
 * thickens it (shares), `ga` raises it on the turret (a share of the turret's height). `cu` stands a cupola this high
 * (metres) on the turret roof, `cx` forward of the turret's middle (a share of its length; default 15 % back); `ma`
 * puts a mantlet this deep (metres) on the turret front round the gun.
 *
 * Aircraft (the top view): `wt` rounds the wing tips (the chord taken in over the outer tenth), `wk` rakes them (the
 * tip's leading edge moved back, metres per metre of chord); `nw` widens the fuselage's plan ahead of the wing, `nt`
 * its nose tip (shares); `rw` its plan behind the wing; `sn` scales the spinner; `tc` the tailplane's chord; `ew` the
 * engine nacelles' diameter (shares).
 */

import type { FixedWingSpec } from '../air';
import type { AddOn, GroundSpec } from '../ground';
import type { Outline, P2 } from '../parts';

/** A ground figure's detail controls. */
export interface GroundDetailFit {
  bd?: number;
  wr?: number;
  es?: number;
  ws?: number;
  wx?: number;
  ef?: number;
  eb?: number;
  hf?: number;
  hr?: number;
  gl?: number;
  gc?: number;
  ga?: number;
  cu?: number;
  cx?: number;
  ma?: number;
}

/** An aircraft's detail controls. */
export interface AirDetailFit {
  wt?: number;
  wk?: number;
  nw?: number;
  nt?: number;
  rw?: number;
  sn?: number;
  tc?: number;
  ew?: number;
}

export const GROUND_DETAIL_FIT: Record<string, GroundDetailFit> = {
  '2s1-gvozdika': { wr: 0.3, eb: -0.04, ef: -0.04, hr: -0.06, gl: -0.12 },
  '2s19-msta': { wr: 0.05, eb: -0.16, ef: -0.16, hr: 0.03 },
  '2s25-sprut-sd': { wr: 0.3, ef: -0.04 },
  '2s3-akatsiya': { ef: -0.04, hf: -0.03, gl: -0.06 },
  '9a331-tor-m1': { bd: -0.25, wr: 0.2, eb: -0.12, ef: -0.08, hr: 0.03 },
  'a13-cruiser': { bd: 0.25, wr: 0.05, hr: -0.09, ws: -0.04 },
  a7v: { hf: 0.03 },
  'ac1-sentinel': { wr: 0.1, eb: -0.08, hf: -0.03 },
  'ac4-thunderbolt': { ga: -0.2 },
  'adats-m113': { es: 0.1, hr: 0.09, wx: 0.03, ma: 0.15 },
  ajax: { bd: 0.25, wr: 0.3, eb: -0.2, ef: -0.12 },
  'amc-35': { ef: -0.04, hf: -0.03, ws: -0.04 },
  'amx-10p': { bd: 0.25, eb: -0.08, ef: -0.08, gl: -0.36 },
  'amx-50': { eb: -0.04, hr: 0.06 },
  'arl-44': { bd: -0.25, ef: -0.12, hr: 0.03, hf: -0.06 },
  'armoured-train-car': { hf: -0.09 },
  'as-42-47': { hr: -0.09 },
  'asu-57': { bd: -0.25, eb: -0.12, ef: -0.04, hr: 0.06, cu: 0.12, gl: -0.06 },
  'asu-85': { eb: -0.08, ef: -0.04 },
  'b1-bis': { eb: -0.08, hr: -0.03 },
  'bkan-1c': { bd: 0.25, ef: -0.08, gc: -0.5, ga: -0.1 },
  'black-prince': { es: -0.1, ga: -0.05 },
  'bm-13-katyusha': { hf: -0.015 },
  'bmp-1': { bd: -0.5, wr: 0.3, hr: -0.03, hf: 0.03 },
  'bmpt-72': { wr: 0.3, eb: -0.04, ef: -0.08, hr: 0.09 },
  'bmpt-terminator': { bd: 0.25, eb: -0.08, es: -0.2, hf: -0.03 },
  'bofors-40mm-emplaced': { cu: 0.06, ma: 0.075 },
  'bt-42': { ef: -0.04, hr: -0.06, ws: -0.04 },
  'bt-5': { wr: 0.05, ws: -0.04 },
  'btr-152a': { hf: -0.03 },
  'btr-152d': { ma: 0.45 },
  'btr-zd': { bd: 0.5, eb: -0.08, ef: -0.08, hr: -0.03, hf: 0.03 },
  'c13-t90': { wr: 0.3, eb: -0.04, ef: -0.04, gc: -0.25 },
  'cckw-bofors': { hr: 0.15, hf: -0.09, ma: 0.3 },
  'cckw-m45': { ma: 0.15 },
  'celere-sahariano': { ef: -0.12, gl: -0.06 },
  'centauro-120': { hr: -0.03, hf: 0.06, gl: 0.06, ga: 0.05 },
  'challenger-2': { eb: -0.08, es: -0.1, hr: 0.06, hf: 0.03, ws: 0.04 },
  'challenger-2-tes': { eb: -0.12, es: -0.1, hr: 0.03, ws: 0.04 },
  'challenger-a30': { bd: 0.25, wr: 0.05, eb: 0.04, gl: -0.06, gc: -0.25, ga: -0.05 },
  'char-2c': { eb: -0.04, ef: -0.2 },
  charioteer: { wr: 0.05, eb: -0.08, ef: -0.08, hf: -0.06, gc: 0.5 },
  'churchill-gun-carrier': { ef: 0.08, es: -0.3 },
  'churchill-i': { es: -0.3, ga: -0.1 },
  'churchill-iii': { es: -0.2, ga: -0.2 },
  'churchill-vii': { es: -0.1, gc: -0.25 },
  coelian: { eb: -0.04, ef: -0.08 },
  comet: { eb: -0.08, ef: -0.04, hr: 0.06, hf: -0.03 },
  'concept-3': { hr: -0.03, hf: -0.03, cu: 0.12, gc: 0.25, ma: 0.45 },
  conway: { hf: -0.03, gl: 0.12 },
  'crusader-aa': { wr: 0.1, ef: -0.04, hf: 0.03, ws: -0.08 },
  'crusader-ii': { wr: 0.25, ef: -0.04 },
  'crusader-iii': { wr: 0.1, ef: -0.04, hr: -0.03, hf: -0.03, ga: -0.1 },
  'dicker-max': { eb: -0.04, ef: 0.04, hr: 0.03, hf: -0.03, gc: 0.25 },
  eitan: { hf: -0.09 },
  'elc-901': { bd: 0.25, eb: -0.04, ef: -0.04, hf: -0.03, gl: -0.18 },
  'elc-bis': { eb: 0.04, ef: -0.08, es: 0.1, hr: 0.09 },
  elefant: { eb: -0.04, hr: 0.03, hf: -0.03 },
  ferdinand: { hr: 0.03, hf: -0.03, gc: 0.5 },
  'fiat-6616': { cu: 0.12, ma: 0.45, hf: -0.03 },
  'fiat-m13-40': { wr: 0.05, ef: 0.04, gl: -0.06, ga: 0.05 },
  'flakpanzer-i': { hf: -0.03, ws: -0.08 },
  'gaz-aaa-dshk': { hf: -0.06, ga: -0.3 },
  'gaz-mm-72k': { hf: -0.06, ga: 0.05 },
  grant: { bd: 0.25, eb: -0.04, ef: 0.04, gl: 0.06 },
  'harry-hopkins': { bd: 0.25, gl: -0.06, ws: -0.04, wx: 0.03 },
  hetzer: { wr: 0.05, ef: -0.16, hr: 0.03, hf: 0.03 },
  'ho-i': { bd: 0.25, eb: -0.04, cu: 0.12, gl: -0.12, gc: 0.25, ga: -0.05 },
  'ho-ni-i': { wr: 0.05, ef: -0.04, ga: 0.2 },
  'ho-ni-iii': { bd: 0.25, eb: -0.04, ef: -0.04, hf: 0.06, ga: 0.2 },
  'ho-ri-production': { wr: 0.3, gc: -0.25, ga: 0.1 },
  'ho-ri-prototype': { eb: -0.04, ws: -0.12 },
  'ho-ro': { bd: 0.5, eb: 0.04, ef: -0.04, hf: -0.03, gl: 0.06, gc: 0.75, ga: -0.05 },
  'hotchkiss-h35': { bd: -1, wr: 0.1, gl: -0.3 },
  hummel: { wr: 0.15, ef: 0.04, es: 0.5, hf: 0.03 },
  'ikv-72': { bd: 1, eb: -0.04, es: -0.1 },
  'is-1': { wr: 0.2, ef: -0.04 },
  'is-2': { wr: 0.2, ef: -0.04, es: -0.1, hr: 0.09 },
  'is-2-1943': { wr: 0.2, ef: -0.04, cu: 0.12 },
  'is-3': { bd: 0.25, wx: -0.06 },
  'isu-122': { wr: 0.05, ef: -0.08, ga: -0.05, ws: -0.04 },
  'isu-122s': { bd: -0.25, ef: -0.08, hf: 0.03 },
  'ito-90m': { hr: -0.03 },
  jagdpanther: { eb: -0.2, ef: -0.12 },
  'jagdpanzer-iv': { eb: 0.04, ef: -0.04, hr: -0.09, gl: 0.06 },
  'jagdpanzer-iv-l70': { bd: 0.25, es: 0.1, hr: -0.03, hf: 0.03 },
  jagdtiger: { ef: -0.2 },
  kanonenjagdpanzer: { ef: -0.08, hr: 0.06, hf: -0.06, ws: -0.04, wx: -0.03 },
  kugelblitz: { wr: 0.05, es: 0.1, hr: -0.03 },
  'kv-1': { hf: -0.03, ws: -0.12 },
  'kv-1s': { wr: 0.05, cu: 0.12, gc: 0.5, ga: 0.05, wx: -0.03 },
  'kv-2': { wr: 0.1, eb: -0.04, ef: 0.04, cu: 0.12, gl: -0.06, gc: 0.25, ga: -0.05 },
  'kv-220': { wr: 0.1, es: -0.1, hf: -0.09, gc: 0.75 },
  'kv-8': { bd: 0.5, eb: -0.04 },
  'kv-85': { cu: 0.12, gl: -0.06 },
  'l-62-anti-ii': { eb: -0.04, ef: -0.04, ws: -0.08 },
  'l3-33-cc': { wr: 0.3, eb: 0.04, ef: 0.08, es: 0.1, ga: -0.05 },
  'l6-40': { bd: 0.5, wr: 0.05, eb: 0.04, hf: -0.03, gl: -0.36 },
  'lancia-3ro-100': { hf: -0.03, gc: 0.25, ma: 0.3 },
  'landsverk-l60': { wr: 0.05, eb: -0.04 },
  'leopard-2a4m-can': { hr: -0.03, cu: 0.24, gc: 0.25 },
  'lorraine-37l': { wr: 0.05, hr: -0.06, hf: -0.03, ws: -0.12 },
  'lorraine-40t': { hr: 0.06, hf: 0.03 },
  'm-51': { wr: 0.05, eb: -0.04, ef: -0.04, hr: 0.03, hf: -0.06 },
  'm10-gmc': { bd: -1, wr: 0.05, eb: -0.2, hr: 0.03, gc: 0.25 },
  m103: { ef: -0.04 },
  m109: { bd: 0.25, wr: 0.25, hf: 0.03 },
  m109a1: { bd: -0.5, ef: -0.04, gc: 0.25 },
  m113: { bd: -0.5, wr: 0.1, hr: 0.03, ws: -0.12 },
  'm16-mgmc': { hr: 0.03, cu: 0.06 },
  'm163-vulcan': { wr: 0.3, ef: -0.04, cu: 0.12, gl: -0.3 },
  'm18-hellcat': { wr: 0.25, ef: -0.08, ga: 0.05 },
  'm19-mgmc': { bd: -0.75, wr: 0.3, eb: -0.04, ef: -0.04, hr: 0.06 },
  'm1a1-abrams': { bd: 0.25, wr: 0.2, eb: -0.04, ef: -0.04, es: -0.2 },
  'm22-locust': { eb: -0.08, es: 0.1, ws: 0.04 },
  'm24-chaffee': { bd: 0.25, wr: 0.25 },
  'm26-super-pershing': { ef: -0.08, cu: 0.12 },
  'm2a2-light-tank': { hr: -0.06, gl: -0.24 },
  'm2a3-bradley': { bd: 0.25, ef: 0.04 },
  m2a4: { eb: -0.2, hr: -0.06 },
  'm3-gmc': { hr: 0.015 },
  'm3-lee': { eb: -0.12, ef: 0.04, hr: -0.03, cu: 0.12 },
  'm3-stuart': { eb: -0.08, es: 0.3, hr: 0.03, cu: 0.24, gl: -0.3 },
  'm36-jackson': { eb: -0.2, ef: -0.08, hf: -0.03 },
  'm3a1-stuart': { bd: 0.25, eb: -0.12 },
  'm4-sherman': { bd: 0.5, eb: -0.08, hf: -0.03 },
  'm4-t26': { bd: 0.25, eb: -0.08, wx: 0.03 },
  m41: { eb: -0.08, ef: -0.12, hf: -0.03, gc: 0.25 },
  'm42-duster': { wr: 0.3, ef: -0.12, es: -0.2 },
  m44: { bd: 0.75, wr: 0.05, ef: -0.12, gc: -0.25 },
  'm47-patton': { ef: -0.04, hr: -0.03, hf: -0.03, cu: 0.12, ga: -0.05 },
  'm4a1-76': { bd: 0.25, eb: -0.04, hr: 0.03, hf: -0.03, cu: 0.12 },
  'm4a2-76': { bd: 0.25, eb: -0.04, hr: 0.03, hf: -0.03, cu: 0.12, gl: -0.06, gc: 0.5 },
  'm4a3-105': { eb: -0.16, ef: -0.04, ga: 0.05 },
  'm4a3e2-76': { bd: 0.25, ef: -0.04, hr: 0.06 },
  'm4a3e2-jumbo': { bd: 0.75, hr: 0.03, hf: -0.03, cu: 0.12, gl: 0.12, ga: 0.1 },
  m4a3e8: { eb: -0.08, ef: -0.04, hr: 0.03, hf: -0.03, gc: 0.5, ga: 0.05 },
  'm4a4-cn-75-50': { eb: -0.04, hr: 0.03, wx: 0.03 },
  'm4a4-firefly': { eb: -0.04, hr: 0.06, gc: -0.25, ga: -0.15 },
  'm4a4-sherman': { bd: 0.5, wr: 0.05, eb: -0.04, hr: 0.03, hf: -0.03, gl: -0.06 },
  'm50-ontos': { eb: 0.04, hr: -0.09, hf: 0.09, wx: 0.12 },
  'm53-59': { hr: -0.06, hf: -0.03, gl: -0.18 },
  m55: { wr: 0.1, hf: -0.06, ws: -0.04 },
  'm551-sheridan': { wr: 0.05, eb: -0.04, ef: -0.04, hr: -0.03, gl: -0.06 },
  'm56-scorpion': { eb: -0.04, ef: -0.08, hf: -0.03 },
  'm5a1-stuart': { bd: 0.25, es: -0.2, hr: -0.03, gl: 0.06 },
  'm64-taiwan': { bd: 0.25, wr: 0.15, eb: -0.04, ef: -0.12, hr: 0.03, hf: -0.03 },
  m6a1: { ef: -0.04, hr: 0.06, hf: -0.03 },
  m6a2e1: { bd: 0.25, hr: 0.03, cu: 0.12, ga: -0.05 },
  'm7-priest': { bd: 0.25, wr: 0.15, eb: -0.2, hr: -0.03 },
  'm728-cev': { bd: -0.25, wr: 0.1, ef: -0.04, es: -0.1, hr: 0.03, hf: 0.06, gl: -0.06, gc: -0.25 },
  'm8-greyhound': { hf: -0.03, gl: -0.18, hr: -0.06 },
  'm8-scott': { wr: 0.1, eb: -0.08, ef: 0.04, es: 0.5, hr: 0.09 },
  'm8a1-gmc': { wr: 0.15, ef: -0.04, hr: 0.03, hf: 0.03 },
  'marder-iii': { bd: -0.25, eb: 0.04, ef: -0.04, hr: -0.06 },
  'marmon-herrington-vi': { cu: 0.12, ga: -0.1, ma: 0.3, cx: 0.3 },
  'marmon-herrington-vi-2pdr': { ma: 0.15, hf: 0.03 },
  'matilda-ii': { eb: -0.08, ef: -0.12, hr: -0.03, hf: -0.03 },
  'merkava-mk3d': { hr: 0.03, gc: -0.25, ga: -0.15 },
  'na-to': { bd: 0.5, ef: 0.08, hr: 0.09, hf: -0.06 },
  nashorn: { bd: 0.25, ga: -0.05 },
  neubaufahrzeug: { bd: 0.25, ef: -0.12, hr: 0.03, hf: -0.06, cu: 0.12, gc: 1 },
  'object-416': { wr: 0.1, ef: -0.04, ga: -0.15 },
  ostwind: { wr: 0.1, ef: -0.04, hr: -0.03, ga: -0.15 },
  otomatic: { bd: 0.25, wr: 0.05, eb: -0.04, cu: 0.12 },
  'p-40': { wr: 0.05, hf: 0.06, ga: -0.05, ws: -0.08 },
  'p7t-aa': { cu: 0.12, hr: -0.09 },
  palmaria: { eb: 0.04, ef: -0.04, hf: -0.03, gc: -0.25, ga: -0.1 },
  'panhard-ebr': { hf: -0.03, gc: 0.25, ma: 0.3 },
  'panther-a': { wr: 0.05, eb: -0.08, ef: -0.08, hr: 0.03, gl: 0.06 },
  'panther-d': { eb: -0.2, ef: -0.12, cu: 0.12 },
  'panther-f': { bd: -0.25, eb: -0.04, ef: -0.04, cu: 0.12, gc: 0.25, ws: 0.04 },
  'panzerjager-i': { wr: 0.1, eb: -0.04, es: 0.1, ga: -0.05, ws: -0.04 },
  'panzerwerfer-42': { hf: -0.015, hr: -0.06 },
  'pbv-301': { wr: 0.1, eb: 0.04, ef: -0.04, gl: -0.24, ga: 0.05 },
  'pgz-09': { bd: 0.5, eb: -0.04, ef: -0.08, hr: -0.03, ws: -0.04, wx: 0.03 },
  'pt-76': { bd: 0.25, wr: 0.3, ef: -0.12, hr: -0.06 },
  puma: { wr: 0.3, eb: -0.12, ef: -0.08, hr: 0.03, hf: 0.03, gl: -0.06 },
  'putilov-garford': { hr: 0.09, gl: 0.18, gc: 0.75, ga: 0.05 },
  'pvkv-iii': { bd: 0.25, wr: 0.05, eb: 0.04 },
  'pvkv-iv': { eb: -0.04, ef: -0.08, ga: -0.05 },
  'pvkv-m43-1963': { bd: 0.25, wr: 0.3, hf: -0.06, gl: -0.06 },
  'pz-35t': { bd: -1, wr: 0.3, eb: 0.04, ef: -0.08, es: 0.1, hr: -0.03, cu: 0.12 },
  'pz-38t': { bd: -0.5, hr: -0.09 },
  'pz-ii': { bd: 0.25, wr: 0.05, hf: -0.03, gl: -0.18, ga: 0.1 },
  'pz-iii-b': { wr: 0.2 },
  'pz-iii-e': { bd: -0.25, wr: 0.15, eb: -0.2 },
  'pz-iii-m': { bd: -1, wr: 0.2, hr: 0.06, hf: -0.03 },
  'pz-iii-n': { bd: -0.25, wr: 0.2, eb: -0.2, hr: 0.06 },
  'pz-iv-e': { wr: 0.05, eb: 0.04, hf: 0.03, cu: 0.12, gc: 0.75 },
  'pz-iv-f1': { wr: 0.15, es: 0.1, cu: 0.24, gc: 0.25, ga: 0.05 },
  'pz-iv-f2': { bd: 0.25, wr: 0.05, eb: 0.04, ef: -0.04, es: 0.1, hr: -0.03, hf: -0.06 },
  'pz-iv-g': { wr: 0.05, hf: -0.03, ws: 0.04 },
  'pz-iv-j': { bd: 0.5, eb: 0.04, ef: -0.04 },
  'pz-sfl-ic': { bd: -0.25, wr: 0.05, eb: -0.04, ga: -0.05, ws: -0.04 },
  'pzh-2000': { wr: 0.3, ef: -0.04, hr: -0.06, hf: -0.03 },
  'r3-t20': { hr: -0.06, gl: -0.36, ga: 0.1 },
  'ram-i': { bd: 0.75, eb: -0.2, hr: -0.06, hf: 0.03 },
  'ram-ii': { eb: -0.16, ga: 0.05 },
  ratel: { hr: 0.03, ma: 0.15 },
  'renault-d2': { eb: -0.12, ef: -0.2, hf: -0.09, cu: 0.12 },
  'ro-go': { bd: 0.25, wr: 0.1, ef: -0.04 },
  'rooikat-105': { ma: 0.45 },
  'ru-251': { eb: 0.04, ef: -0.08, hf: -0.06, ga: -0.05 },
  'sarc-mk4': { hr: 0.03, hf: 0.06, gl: -0.18, ma: 0.15 },
  'sau-40': { eb: 0.04, hr: 0.03, hf: -0.03, gc: -0.25, ga: -0.2 },
  'sav-m43': { bd: 0.25, wr: 0.1, hr: -0.03, hf: -0.03, gl: -0.06 },
  'sdkfz-140-1': { wr: 0.05, eb: 0.04, ef: -0.08, gl: 0.06, ga: -0.15 },
  'sdkfz-251': { hf: -0.03 },
  'sdkfz-6-2': { hr: 0.03, cu: 0.48, ga: 0.05, ma: 0.45, gl: -0.06 },
  'sdkfz-9-flak37': { hr: -0.03, hf: 0.03, cu: 0.48, ma: 0.45 },
  'semovente-75-34': { wr: 0.05, es: -0.1, hr: 0.03 },
  'semovente-m43': { bd: 0.25, wr: 0.05, ef: 0.04, es: -0.1, hr: 0.03, hf: 0.03, gc: -0.25, ga: -0.05, ws: -0.04 },
  'sidam-25': { bd: 1, eb: 0.04, cu: 0.12, ma: 0.45 },
  skink: { bd: 0.5, eb: -0.16 },
  'somua-s35': { eb: 0.04, ef: -0.12 },
  'spj-fm43-44': { hr: -0.06, gl: -0.3 },
  'steam-locomotive': { hr: -0.007 },
  'strv-74': { cu: 0.12, ma: 0.15 },
  'strv-m31': { ef: -0.04, hf: -0.03, ga: -0.15 },
  'strv-m40l': { wr: 0.05, eb: -0.04, es: 0.2, ga: -0.05 },
  'strv-m42': { wr: 0.1, eb: -0.04, ef: -0.08, cu: 0.12 },
  'stug-iii-d': { bd: -0.5, eb: -0.04, ef: -0.04, hr: -0.06 },
  'stug-iii-f': { wr: 0.05, hr: 0.06, hf: 0.03 },
  'stug-iii-g': { eb: -0.2, ef: -0.04 },
  'sturer-emil': { wr: 0.05, eb: -0.04, ef: -0.04, gl: 0.06, gc: 0.25, ws: -0.08 },
  'sturmpanzer-ii': { wr: 0.05, eb: -0.04, hr: -0.03, gl: -0.24, gc: 0.25 },
  sturmtiger: { bd: 0.25, eb: -0.12, gl: 0.06, ga: 0.05 },
  'su-100': { ef: -0.08, hr: -0.09, gc: 0.5 },
  'su-100p': { bd: 0.25, wr: 0.05, eb: -0.04, ef: -0.04, ws: -0.04 },
  'su-122': { ef: -0.04, hr: -0.03, gl: -0.06, gc: 0.5 },
  'su-122-54': { wr: 0.15, ef: -0.04, hr: -0.06, hf: 0.03 },
  'su-152': { hr: -0.06, hf: 0.09, ga: -0.05 },
  'su-5-1': { wr: 0.05, hr: -0.06, gl: -0.06 },
  'su-76m': { bd: 0.25, wr: 0.1, ef: -0.08 },
  'sub-i-ii': { bd: 0.5, wr: 0.05, hr: -0.06, hf: 0.03 },
  't-126': { wr: 0.3, eb: 0.04, hf: -0.06 },
  't-26': { bd: 0.25, wr: 0.25, ef: -0.12 },
  't-28': { eb: -0.12 },
  't-34-100': { bd: 0.25, wr: 0.05, ef: -0.08, gc: 0.25, ws: -0.04 },
  't-34-1940': { wr: 0.15, gl: -0.12, gc: 0.25 },
  't-34-76': { bd: 0.5, eb: -0.04, ef: -0.04, gc: 0.5 },
  't-34-85': { bd: 0.25, wr: 0.05, eb: -0.04, ef: -0.12 },
  't-44': { bd: 0.25, wr: 0.1, eb: 0.04, ef: -0.04, hr: 0.06, cu: 0.12, gc: 0.25, ws: -0.04 },
  't-44-100': { wr: 0.05, ef: -0.04, es: -0.1, cu: 0.12 },
  't-44-122': { bd: -0.75, wr: 0.15, ef: -0.04, hr: 0.03 },
  't-50': { ef: -0.04, ga: -0.05, ws: -0.08 },
  't-60': { eb: -0.08, hr: -0.03, hf: 0.03, gl: -0.06, ga: 0.05 },
  't-70': { wr: 0.15, es: 0.2, cu: 0.12, gl: -0.36 },
  't-72b3': { bd: 0.25, wr: 0.1, eb: 0.04, ef: -0.08, cu: 0.12, ga: 0.05 },
  't-72b3-arena-m': { wr: 0.1, eb: 0.04, ef: -0.08, es: -0.1, hr: 0.06, hf: -0.03 },
  't-80-light': { wr: 0.25, eb: 0.04, hf: 0.03, cu: 0.12, gl: -0.06 },
  't-80ue1': { bd: 0.25, wr: 0.2, eb: 0.08, ef: -0.04, es: -0.1, hr: 0.06 },
  't-80uk': { eb: 0.08, ef: -0.12, es: -0.1, hr: 0.09, cu: 0.24 },
  't-90a': { bd: 0.25, wr: 0.15, eb: -0.04, ef: -0.12, es: -0.1, hr: 0.09, hf: -0.03 },
  t1e1: { gl: 0.06, ws: -0.04, wx: -0.03 },
  't1e1-90': { bd: 0.25, ga: 0.05 },
  t20: { wr: 0.15, eb: -0.04, ef: -0.04, es: -0.1, gc: 0.25, ga: -0.05 },
  t25: { ef: -0.04, cu: 0.12, gl: -0.06, ga: -0.05, ws: -0.04 },
  t29: { wr: 0.05, ef: -0.04, hr: 0.03, gl: 0.06, gc: -0.25 },
  t30: { bd: 0.25, ef: -0.08, gl: -0.06, gc: -0.5 },
  't34-heavy': { ef: -0.08, ws: -0.08 },
  t55e1: { hr: -0.06, hf: -0.03, ga: -0.05, ma: 0.45 },
  t77e1: { wr: 0.2, cu: 0.36, ga: -0.05 },
  t92: { ef: 0.16, gl: -0.12, gc: 0.25 },
  't95-medium': { wr: 0.3, ef: -0.04, hr: -0.03, hf: 0.09 },
  'ta-se': { wr: 0.3, eb: 0.04, hf: -0.09, cu: 0.12, gl: 0.06 },
  'tcm-20': { hr: -0.12, hf: 0.12 },
  tetrarch: { hr: -0.09, ws: -0.04 },
  'tiger-i-h1': { wr: 0.05, eb: -0.2, ef: -0.08, hr: 0.03, hf: -0.03, cu: 0.12, gc: 0.5 },
  'tiger-ii-h': { eb: -0.08, ef: -0.16 },
  'tiger-ii-p': { eb: -0.16, ef: -0.2, gc: 0.25 },
  tortoise: { eb: -0.08, ef: -0.08 },
  'turan-i': { bd: -0.25, wr: 0.05, eb: -0.08, ef: -0.08, hf: -0.03, cu: 0.12 },
  'turan-ii': { bd: 0.25, eb: -0.04, ef: -0.04, hr: -0.06, cu: 0.12, gc: 0.75 },
  'type-1-chi-he': { bd: 0.75, ef: -0.04, cu: 0.24 },
  'type-3-chi-nu': { bd: -0.5, wr: 0.3, ef: -0.04, es: 0.1, cu: 0.12, gc: 0.5 },
  'type-60-sprg': { wr: 0.05, ef: -0.04, hr: -0.09, ws: -0.04 },
  'type-61': { wr: 0.3, ef: -0.12, hr: 0.09 },
  'type-62-light': { eb: 0.04, ef: -0.08, gc: 0.25 },
  'type-63-twin-25': { bd: -1.25, wr: 0.25, ef: -0.08, hr: -0.09 },
  'type-65-spaa': { wr: 0.25, ef: -0.12, hr: 0.03, hf: -0.03, cu: 0.24 },
  'type-90': { wr: 0.3, eb: -0.16, ef: -0.08, hr: 0.06, hf: 0.03 },
  'type-95-so-ki': { ga: -0.2 },
  'type-97-chi-ha': { bd: 0.5, wr: 0.05, eb: 0.04, es: 0.1, cu: 0.12, ws: -0.04 },
  'type-97-chi-ha-kai': { bd: 0.25, cu: 0.24, ga: 0.05, ws: -0.04 },
  'type-98-ke-ni': { bd: 0.25, wr: 0.1, eb: 0.04, ef: -0.04, hr: 0.03, hf: -0.03 },
  'ush-204-gk': { hr: -0.03, gl: -0.18 },
  valentine: { wr: 0.15, hr: 0.03, ga: 0.05, ws: -0.08 },
  'valentine-archer': { wr: 0.3, eb: 0.04, hr: 0.09, ga: 0.05 },
  'valentine-ix': { bd: 0.25, ga: -0.1, ws: -0.08 },
  'valentine-xi': { wr: 0.25, eb: -0.08 },
  'vfw-flak-41': { ef: -0.08, hr: 0.09, hf: -0.03, ga: -0.05 },
  'vk-3002m': { eb: -0.2, ef: -0.2 },
  waffentrager: { eb: -0.08, ga: -0.15 },
  wiesel: { bd: 0.25, eb: 0.08, hr: -0.09, hf: 0.03, gl: -0.24 },
  wirbelwind: { wr: 0.15, ef: 0.04, es: -0.1, hr: -0.03, gl: -0.36 },
  'wz-1001': { cu: 0.12, ga: -0.2 },
  'wz-141': { hf: 0.03, ws: -0.04, wx: 0.03 },
  'wz-551': { hr: -0.03, cu: 0.12 },
  'yag-10-29k': { hr: 0.06, cu: 0.24, ga: -0.05, ma: 0.45 },
  'zbd-04a': { bd: -0.75, eb: 0.04, hr: -0.03, ga: -0.1 },
  'zerstorer-45': { bd: 0.25, cu: 0.12, ma: 0.15 },
  'zis-30': { eb: -0.04, ef: -0.08 },
  'zrinyi-ii': { ef: -0.08 },
  'zsu-23-4-shilka': { wr: 0.3, eb: -0.04, cu: 0.12 },
  'zsu-37-2': { wr: 0.05, ef: 0.04, ga: -0.1, ws: -0.08 },
  'zsu-57-2': { bd: 0.5, wr: 0.25, ef: -0.12, es: -0.1, hr: 0.03 },
  'ztz-99-era': { eb: -0.2, ef: -0.2, hr: -0.03 },
  'ztz-99a': { bd: -0.25, wr: 0.05, ef: -0.04, gc: -0.5, ga: 0.1 },
};

export const AIR_DETAIL_FIT: Record<string, AirDetailFit> = {
  a2d: { wt: 0.3 },
  'a6m-zero': { wt: 0.9, tc: 0.1 },
  'am-1': { sn: 0.45 },
  'ar-234': { nt: -0.3, tc: -0.2, rw: 0.12 },
  'b-17g': { wk: -0.25, rw: 0.18 },
  'b-18': { tc: 0.05 },
  'b-29': { nw: 0.12, tc: -0.1, nt: -0.15 },
  'ba-65': { tc: -0.1, rw: -0.06 },
  'bf-109-e': { wt: -0.3, tc: 0.1 },
  'bf-109-g6': { wk: 0.5, sn: -0.15 },
  'bf-110': { rw: -0.12 },
  'br-20': { wt: 0.3, nw: 0.06, tc: 0.1 },
  'btd-1': { nw: 0.06, tc: -0.1, rw: 0.36, sn: 0.6 },
  'bv-238': { nt: -0.6, nw: -0.18, tc: -0.2 },
  'c-3604': { wt: -0.3, rw: -0.36 },
  'cr-714': { wt: 0.3, nt: 0.3, rw: -0.12 },
  'cw-21': { wt: 0.3, wk: 0.25, nt: 0.15, tc: -0.1, rw: -0.06 },
  'do-217': { tc: 0.1, rw: -0.12 },
  'do-335': { nt: -0.6, tc: 0.1, rw: 0.06 },
  'er-2': { nt: 0.3, tc: 0.1, rw: 0.24 },
  'eurofighter-typhoon': { nt: -0.3 },
  'f-104': { nt: -0.15, tc: 0.1, rw: 0.06 },
  'f-104g': { nt: -0.15, tc: 0.1, rw: 0.06 },
  'f-15c': { nt: -0.3, tc: 0.1, wk: 0.25 },
  'f-15e': { nt: -0.3, tc: 0.2 },
  'f-16c': { wt: -0.3, tc: 0.1 },
  'f-4b': { nw: 0.06, rw: 0.18 },
  'f-5e': { nt: -0.45, ew: -0.2 },
  'f-82e': { tc: 0.2 },
  'f-84g': { wt: -0.3, nt: -0.45, tc: 0.2, rw: -0.06 },
  'f-86f': { wt: 0.3, nt: 0.45, nw: 0.12, tc: -0.1, rw: 0.12 },
  'f-86k': { wk: 0.25, tc: 0.1, wt: -0.3 },
  'f-a-18e': { nt: -0.45 },
  'f-a-18f': { nt: -0.45 },
  'f2a-buffalo': { wk: -0.5, tc: 0.1, rw: 0.06 },
  'f3d-1': { rw: 0.24 },
  f3f: { wt: 0.6, nt: -0.3, tc: 0.1, rw: 0.12 },
  'f4u-4': { wk: -0.25, rw: -0.12 },
  'f4u-corsair': { wk: -0.5, rw: -0.06 },
  f7f: { nt: -0.15, nw: -0.06, tc: -0.2, rw: -0.18 },
  'f8f-bearcat': { nt: -0.15, tc: 0.2, sn: -0.15 },
  'ffvs-j22': { rw: -0.12 },
  firebrand: { nt: 0.15, rw: -0.36, sn: 0.3 },
  firecrest: { nw: 0.12, rw: -0.06, sn: -0.15 },
  'firefly-mk4': { tc: 0.1, rw: -0.24 },
  'fokker-g1': { nw: -0.06, tc: 0.1, rw: -0.06 },
  'fw-189': { wt: 0.6, wk: -0.25 },
  'fw-190-a8': { wt: -0.3, nt: 0.15, nw: 0.06, rw: 0.06 },
  h8k: { tc: -0.1, rw: -0.06 },
  'he-100': { wt: -0.3, nt: 0.15, tc: -0.1, rw: -0.18 },
  'he-111': { tc: 0.1 },
  'he-112': { wt: 0.6, nt: 0.15, tc: 0.1, rw: -0.18 },
  'he-112a': { nt: 0.15, tc: 0.1, rw: -0.12 },
  'he-162': { tc: -0.2 },
  'hs-129': { wt: 0.3, tc: 0.3 },
  hudson: { wt: 0.6, tc: 0.1, rw: 0.06 },
  'hunter-f1': { wt: -0.9, nw: -0.06, rw: 0.06, nt: 0.15 },
  hurricane: { wt: -0.3, nw: 0.06 },
  'i-153': { nt: -0.15, tc: 0.2, rw: 0.36 },
  'i-16': { sn: 0.075 },
  'i-185': { wt: 0.3, sn: 0.3 },
  'ia-58': { wt: -0.6, tc: 0.1 },
  'iar-80': { wk: -0.75, nt: -0.3, tc: -0.1, rw: -0.12, sn: 0.3 },
  'il-10': { wt: -0.3, rw: -0.06 },
  'il-2': { tc: 0.1 },
  'il-2-1941': { tc: 0.1 },
  'il-4': { tc: 0.4, rw: 0.06 },
  j1n1: { wt: -0.6, rw: -0.06 },
  'jaguar-gr1': { nt: -0.15, rw: 0.06 },
  'jas-39e': { wk: -0.25, nt: 0.3, rw: 0.06 },
  'ju-88c': { rw: -0.12 },
  'ki-21': { tc: 0.1, rw: 0.24 },
  'ki-43': { wk: -0.25, rw: -0.36 },
  'ki-43-i': { wk: -0.25, nt: 0.15, rw: -0.36, sn: 0.3 },
  'ki-44': { wt: -0.3, nt: 0.15, tc: -0.1, rw: -0.06 },
  'ki-45': { nw: -0.06, rw: 0.18 },
  'ki-49': { tc: 0.1, rw: 0.06 },
  'ki-61': { tc: 0.1, rw: 0.12 },
  'ki-67': { wt: -0.3, rw: 0.18 },
  'l-39': { nt: -0.3, tc: 0.1, ew: -0.4 },
  'la-11': { wk: -0.75, nt: 0.15, rw: -0.18, sn: 0.3 },
  'lagg-3': { wk: -0.25, nt: 0.45, rw: -0.3, sn: 0.15 },
  'lightning-f6': { wt: -0.3, nt: 0.15, tc: 0.2, wk: -0.25 },
  'mb-152': { tc: 0.2, rw: -0.12 },
  'mb-157': { tc: 0.2, rw: -0.12, sn: 0.15 },
  'me-262': { nw: 0.06 },
  'me-262-u4': { nw: 0.06, tc: 0.1 },
  'me-264': { wt: 0.3, nw: 0.12, rw: 0.06 },
  'mig-21f-13': { nw: -0.06, tc: 0.1, rw: 0.06, nt: 0.15 },
  'mig-3': { wt: -0.3, nt: 0.45 },
  'mig-35': { nt: 0.3, tc: -0.1 },
  'ms-406': { wk: -0.25, nt: 0.15, tc: -0.1, rw: -0.06 },
  'ms-410': { wk: -0.5, nt: 0.15, tc: -0.1, sn: 0.15 },
  myrsky: { tc: -0.1, rw: -0.12, sn: 0.15 },
  n1k2: { wt: -0.3, tc: -0.1, rw: 0.06 },
  narval: { nt: -0.6, tc: 0.2 },
  'nc-223': { nt: -0.6 },
  'p-108': { tc: 0.1, rw: -0.06 },
  'p-35': { wk: -0.75, nw: 0.06, tc: 0.2 },
  'p-36': { wk: -0.25, tc: 0.1, rw: -0.12 },
  'p-39': { wt: -0.6, nt: -0.15 },
  'p-43': { wk: -0.5, tc: 0.1 },
  'p-47d': { wt: -0.3, nt: -0.15, tc: -0.1, rw: -0.06 },
  'p-47d-razorback': { wt: -0.9 },
  'p-51a': { wk: -0.5, nw: 0.06, rw: -0.06 },
  'p-51b': { nt: 0.15, nw: 0.06, rw: -0.06 },
  'p-51d-mustang': { nt: 0.15, tc: 0.1, rw: 0.18 },
  'p-59a': { nt: -0.3, nw: -0.06, tc: 0.2 },
  'p-61': { wt: -0.9, tc: 0.5 },
  'p-63': { nw: -0.12, rw: 0.06 },
  pbm: { nt: -0.3, tc: -0.1 },
  'pby-catalina': { rw: -0.06 },
  'pe-2': { tc: 0.1 },
  'pe-8': { wt: 0.3, nw: 0.06 },
  'potez-63': { tc: 0.2, rw: -0.12 },
  rafale: { nw: 0.12, rw: 0.06 },
  're-2000': { wk: -0.5, nt: 0.15, tc: 0.1 },
  're-2001': { wk: -0.75, nt: 0.15, tc: 0.1, rw: -0.24 },
  're-2005': { wk: -0.5, nt: 0.3, tc: 0.1, rw: -0.18 },
  's-199': { nt: 0.15, nw: 0.06, tc: -0.2, rw: -0.06 },
  'saab-105': { nt: -0.45, nw: -0.06, tc: 0.5, rw: 0.12 },
  'saab-b18a': { wk: 0.25, nt: -0.3, rw: 0.18 },
  'saab-j21a': { nt: -0.6, nw: -0.12, tc: 0.3 },
  'saab-t18b': { nt: 0.15, rw: 0.36 },
  'sb-2': { tc: 0.5, rw: -0.06 },
  'sb2c-helldiver': { tc: 0.1, rw: 0.06, sn: 0.45 },
  sb2u: { tc: -0.2, sn: 0.45 },
  'sea-fury': { wt: -0.9, nw: 0.06, rw: -0.18 },
  'sm-91': { wk: 0.25, nt: -0.45, wt: -0.3 },
  'spitfire-mk-ix': { tc: 0.3 },
  'spitfire-mk-v': { tc: 0.2 },
  'spitfire-mk-xiv': { tc: 0.1 },
  stirling: { tc: 0.2 },
  'su-17m4': { tc: 0.1, wt: -0.3 },
  'su-2': { wk: -0.25, tc: 0.1, rw: 0.06, sn: 0.15 },
  'su-24m': { nt: 0.6, nw: -0.18, tc: 0.2, ew: -0.1 },
  'su-33': { wk: 0.25 },
  'su-34': { nt: -0.15, nw: -0.12 },
  'su-6-2': { wt: 0.3, nt: 0.15, rw: -0.06 },
  'su-7b': { nt: -0.15, tc: 0.3, ew: -0.4 },
  'su-9-1946': { nt: -0.3, rw: -0.06 },
  'ta-152h': { nt: -0.15, tc: -0.1, rw: -0.12 },
  'ta-154': { tc: -0.1, wt: 0.15 },
  'tbd-1': { nt: 0.15, tc: 0.1 },
  'tis-ma': { wt: 0.3, tc: 0.3 },
  'tu-2': { nw: -0.06, rw: -0.12 },
  typhoon: { wt: -0.3, rw: 0.06 },
  'vb-10': { wk: 0.25, tc: 0.2 },
  vengeance: { wt: -0.6, rw: -0.06, sn: 0.15 },
  'vg-33': { nt: 0.15, tc: -0.1, rw: -0.06, sn: 0.15 },
  wellington: { tc: -0.1, rw: -0.06 },
  'yak-15': { wk: -0.25, nt: -0.45, nw: 0.06, rw: 0.06 },
  'yak-3': { nt: 0.45, rw: -0.24 },
  'yak-4': { tc: 0.2 },
};

const mean = (q: P2[]) => q.reduce((a, p) => a + p[0], 0) / Math.max(1, q.length);

/** A ground figure with its details fitted. */
export function detailGround(s: GroundSpec, f: GroundDetailFit): GroundSpec {
  let r = s;
  const L2 = s.length / 2;
  if (s.chassis === 'tracked' && (f.bd || f.wr || f.es || f.ws || f.wx || f.ef || f.eb)) {
    const g = { ...s.gearFit };
    if (f.bd) g.band = (g.band ?? 1) * (1 + f.bd);
    if (f.wr) g.wheel = (g.wheel ?? 1) * (1 + f.wr);
    if (f.es) g.end = (g.end ?? 1) * (1 + f.es);
    if (f.ws) g.spread = (g.spread ?? 0) + f.ws;
    if (f.wx) g.shift = (g.shift ?? 0) + f.wx * L2;
    if (f.ef) g.front = (g.front ?? 0) + f.ef * L2;
    if (f.eb) g.rear = (g.rear ?? 0) + f.eb * L2;
    r = { ...r, gearFit: g };
  }
  const o = s.hullOutline;
  if (o && o.top.length > 1 && (f.hf || f.hr)) {
    const xs = o.top.map((p) => p[0]);
    const xc = (Math.min(...xs) + Math.max(...xs)) / 2;
    const sx = (x: number) => (x > xc ? xc + (x - xc) * (1 + (f.hf ?? 0)) : xc + (x - xc) * (1 + (f.hr ?? 0)));
    const m = (q: P2[]) => q.map(([x, y]): P2 => [sx(x), y]);
    const hull: Outline = { ...o, top: m(o.top), bottom: m(o.bottom), plan: m(o.plan) };
    r = { ...r, hullOutline: hull };
  }
  const t = s.turret;
  if (s.guns && (f.gl || f.gc || f.ga)) {
    r = {
      ...r,
      guns: s.guns.map((g) =>
        g.mount === 'turret' && !g.turret
          ? { ...g, length: g.length * (1 + (f.gl ?? 0)), calibre: g.calibre * (1 + (f.gc ?? 0)), ...(f.ga ? { at: (g.at ?? 0.48) + f.ga } : {}) }
          : g
      ),
    };
  }
  if (t && ((f.cu ?? 0) > 0 || (f.ma ?? 0) > 0)) {
    const roof = t.outline ? Math.max(...t.outline.top.map((p) => p[1])) : t.height;
    const front = t.outline ? Math.max(...t.outline.top.map((p) => p[0])) : t.length / 2;
    const add: AddOn[] = [];
    // In an open turret, which has no roof, it stands up from the floor (the gun mount's sights and seats).
    const lo = t.shape === 'open' ? 0 : roof - 0.06;
    if ((f.cu ?? 0) > 0) add.push({ on: 'turret', kind: 'drum', at: [t.length * (f.cx ?? -0.15), 0, (lo + roof + f.cu!) / 2], size: [0.7, 0.7, roof + f.cu! - lo] });
    if ((f.ma ?? 0) > 0) {
      const g = r.guns?.find((x) => x.mount === 'turret' && !x.turret);
      const up = t.height * (g?.at ?? 0.48);
      add.push({ on: 'turret', kind: 'box', at: [front + f.ma! / 2 - 0.05, 0, up], size: [f.ma! + 0.1, t.width * 0.45, Math.min(t.height * 0.6, 0.7)] });
    }
    r = { ...r, addOns: [...(r.addOns ?? []), ...add] };
  }
  return r;
}

/** An aircraft with its details fitted. */
export function detailAircraft(s: FixedWingSpec, f: AirDetailFit): FixedWingSpec {
  let r = s;
  const wp = s.wingPlan;
  if (wp && wp.length > 2 && (f.wt || f.wk)) {
    const ym = Math.max(...wp.map((p) => p[1]));
    const tip = wp.filter((p) => p[1] > ym * 0.97);
    const xt = mean(tip);
    const ct = Math.max(0.1, Math.max(...tip.map((p) => p[0])) - Math.min(...tip.map((p) => p[0])));
    const plan = wp.map(([x, y]): P2 => {
      const v = Math.max(0, (y / ym - 0.9) / 0.1);
      // Rounding takes the chord in toward the tip's middle; the rake moves the leading edge (ahead of the middle) back.
      const xr = xt + (x - xt) * (1 - (f.wt ?? 0) * v * v);
      return [x > xt ? xr - (f.wk ?? 0) * ct * v : xr, y];
    });
    r = { ...r, wingPlan: plan };
  }
  const fu = s.fuselage;
  if (fu && (f.nw || f.nt || f.rw)) {
    const xw = s.wing.x;
    const xs = fu.plan.map((p) => p[0]);
    const x1 = Math.max(...xs);
    const n0 = x1 - (x1 - xw) * 0.3;
    const k = (x: number) => (x > xw ? 1 + (f.nw ?? 0) + (x > n0 ? ((f.nt ?? 0) * (x - n0)) / Math.max(0.1, x1 - n0) : 0) : 1 + (f.rw ?? 0));
    r = { ...r, fuselage: { ...fu, plan: fu.plan.map(([x, y]): P2 => [x, y * k(x)]) } };
  }
  if (f.sn && s.propeller?.spinner) {
    const sp = s.propeller.spinner;
    r = { ...r, propeller: { ...s.propeller, spinner: sp * (1 + f.sn), spinnerLength: (s.propeller.spinnerLength ?? sp * 2.3) * (1 + f.sn) } };
  }
  if (f.tc && s.tailPlan) {
    const m = mean(s.tailPlan);
    r = { ...r, tailPlan: s.tailPlan.map(([x, y]): P2 => [m + (x - m) * (1 + f.tc!), y]) };
  }
  if (f.ew && s.engines?.diameter) r = { ...r, engines: { ...s.engines, diameter: s.engines.diameter * (1 + f.ew) } };
  return r;
}

export function fitDetails(G: Record<string, GroundSpec>, A: Record<string, FixedWingSpec>): void {
  for (const [name, f] of Object.entries(GROUND_DETAIL_FIT)) if (G[name]) G[name] = detailGround(G[name], f);
  for (const [name, f] of Object.entries(AIR_DETAIL_FIT)) if (A[name]) A[name] = detailAircraft(A[name], f);
}
