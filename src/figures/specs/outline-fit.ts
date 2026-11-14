/**
 * Outline shapes fitted to the War Thunder reference. Where public sources do not fix a figure's outline well enough
 * (the user's call, 2026-11-14: hits and events have to land on the right spot of the vehicle), its own outline may be
 * reshaped toward the reference silhouette, a few control values per figure, found by measuring the figure at many
 * settings and keeping each step that matched the reference better; listed in sources.md as fitted to the WT reference.
 *
 * Ground (the hull outline's side profile, as shares of the hull's height or half length): `t0`..`t4` raise the top
 * at the rear end, the rear quarter, the middle, the front quarter and the nose (each fading to nothing at the next);
 * `gx` moves the bend between the deck and the glacis forward (+) or back, `rx` the one at the rear plate; `bo`
 * raises the hull's bottom, `bf` and `bb` only at its front and rear ends; `tk` raises the track's upper run (as a
 * share of its height). The turret's outline: `tf` and `tr` raise its roof at the front and rear (shares of its
 * height), `tl` and `tb` lengthen its front and its rear (bustle).
 *
 * Aircraft (the wing's plan and the fuselage): `sw` sweeps the wing back (metres per metre out), `tp` widens its tip
 * chord against its root's (as a share at the tip); `ts` widens the tailplane, `tx` moves it forward (shares of the
 * length); `nl` lengthens the fuselage ahead of the wing, `tl` behind it (the tail riding the end); `fd` and `rd`
 * deepen the fuselage's front and rear; `cn` raises the canopy; `fh` heightens the fin.
 */

import type { FixedWingSpec } from '../air';
import type { GroundSpec, TurretSpec } from '../ground';
import type { Outline, P2 } from '../parts';

/** A ground figure's outline controls. */
export interface GroundOutlineFit {
  t0?: number;
  t1?: number;
  t2?: number;
  t3?: number;
  t4?: number;
  gx?: number;
  rx?: number;
  bo?: number;
  bf?: number;
  bb?: number;
  tk?: number;
  tf?: number;
  tr?: number;
  tl?: number;
  tb?: number;
}

/** An aircraft's outline controls. */
export interface AirOutlineFit {
  sw?: number;
  tp?: number;
  ts?: number;
  tx?: number;
  nl?: number;
  tl?: number;
  fd?: number;
  rd?: number;
  cn?: number;
  fh?: number;
}

export const GROUND_OUTLINE_FIT: Record<string, GroundOutlineFit> = {
  '2s1-gvozdika': { t4: 0.35, tl: 0.18, tb: 0.36, bb: 0.06 },
  '2s25-sprut-sd': { t4: 0.25, tf: 0.08, tl: -0.36 },
  '2s3-akatsiya': { t3: 0.2, gx: -0.05, tk: 0.08 },
  'a13-cruiser': { t0: -0.05, gx: 0.05, bo: -0.12, tr: 0.08, tl: -0.06, tk: 0.16 },
  'ab-41': { t4: -0.25, t3: 0.05, t1: -0.05, bo: -0.04, tf: -0.08, tl: -0.12, tb: -0.06, t2: -0.05 },
  'amx-10p': { t4: 0.3, bo: -0.04, tf: 0.08, tr: 0.16, tl: -0.36 },
  'amx-50': { t4: 0.15, t0: 0.05, t3: 0.1, tf: 0.08 },
  'arl-44': { t4: 0.1, t3: 0.05, tf: 0.08, tl: -0.06 },
  'armoured-train-car': { t4: 0.25, t0: 0.1, t3: 0.15, gx: -0.2, bo: 0.08, tf: 0.08, tl: 0.06, tb: 0.06 },
  'as-42': { t4: 0.05, t0: 0.15, t3: 0.25, rx: 0.1, tf: -0.48, tr: -0.08, tl: -0.06, tb: 0.06 },
  'as-42-47': { t0: 0.15, t3: 0.2, gx: 0.2, rx: 0.1, tf: -0.48, tr: -0.08, tl: 0.18, tb: 0.12 },
  'asu-85': { bo: -0.04, tf: -0.08, tr: -0.08, t0: -0.05, t3: 0.05 },
  'b1-bis': { t4: -0.2, t0: -0.05, t3: 0.05, t1: -0.05, gx: -0.05, tf: -0.08, tl: 0.12, tk: -0.08 },
  'bkan-1c': { t3: 0.5, tf: -0.4, tl: 0.36 },
  'bmp-1': { t4: -0.15, gx: -0.2, rx: 0.1, bo: -0.04, tf: -0.16, tl: 0.12, tb: 0.06, tk: -0.08, bf: -0.12 },
  'bofors-40mm-emplaced': { tf: 0.48, tl: -0.03, tb: -0.3, tr: 0.32 },
  'bt-42': { t4: -0.05, t0: 0.05, gx: -0.05, tr: 0.08 },
  'bt-5': { t4: -0.05, gx: -0.15, bo: 0.04, tr: -0.08, tb: 0.06 },
  'btr-152a': { t0: 0.1, t3: 0.05, t1: -0.3, gx: 0.05, tl: 0.12, tb: -0.36, bf: -0.06, bb: 0.06 },
  'btr-zd': { t3: 0.25, gx: 0.1, bb: -0.06, t4: 0.1, t0: -0.05 },
  'cckw-bofors': { t0: 0.05, t3: 0.05, bo: -0.08, bb: -0.06, gx: -0.05 },
  'cckw-m45': { t4: 0.05, t0: 0.3, tf: 0.16, tl: -0.36, bf: -0.06 },
  'celere-sahariano': { t0: -0.15, t3: 0.05, tf: -0.16, tr: -0.08, tl: -0.06, tb: -0.36 },
  'challenger-2': { t4: 0.1, t0: 0.1, t3: 0.05, bo: -0.04, tf: 0.48, tr: 0.08, tl: 0.18, tk: 0.24 },
  'char-2c': { gx: -0.2, tf: -0.24 },
  charioteer: { t3: 0.05, t1: 0.05, gx: -0.05, tr: -0.08, tk: 0.16 },
  'churchill-gun-carrier': { t0: -0.2, gx: -0.05, t2: 0.1 },
  'churchill-i': { t4: -0.05, tl: 0.36, tb: 0.06 },
  coelian: { tr: 0.24, tl: 0.06, tb: -0.24, t0: 0.05 },
  comet: { t1: -0.05, tr: 0.08, tl: -0.12, tk: 0.16 },
  'crusader-aa': { gx: 0.1, tb: -0.12, bb: -0.12, t4: -0.1 },
  'crusader-ii': { t1: -0.05, gx: 0.05, bo: 0.04, tf: 0.08, tl: 0.06, t4: -0.05, t0: 0.05 },
  'crusader-iii': { rx: 0.05, tl: 0.12, tb: 0.06, bb: -0.12 },
  'daimler-armoured-car': { t4: 0.1, t0: -0.05, rx: 0.05, bo: -0.08, tr: -0.08, tb: 0.24 },
  'elc-901': { t4: -0.05, t3: 0.2, bo: -0.12, tf: 0.08, tl: 0.06, tb: -0.24, tk: 0.16, bb: -0.06 },
  'elc-bis': { t4: 0.3, t0: 0.2, t3: 0.2, t1: -0.05, bo: -0.16, tf: 0.24, tr: 0.24, tb: 0.06 },
  ferdinand: { t4: 0.1, t1: -0.1, gx: -0.05, tl: 0.06, tk: 0.08 },
  'fiat-6616': { t0: 0.05, t3: 0.05, t1: -0.05, gx: -0.1, bo: -0.04, tl: 0.36, tb: -0.06, t4: 0.05 },
  'fiat-m13-40': { t4: -0.1, t0: 0.1, t1: -0.05, tr: -0.24, tb: -0.06, bb: -0.06, t2: 0.1 },
  'flakpanzer-gepard': { t4: -0.05 },
  'flakpanzer-i': { t4: -0.05, gx: -0.2, tf: 0.32, tr: -0.08, tb: 0.12 },
  'gaz-aaa-4m': { t4: -0.05, t0: 0.1, t3: -0.05, gx: -0.2, bo: -0.16, tl: -0.06, bb: 0.12 },
  'gaz-aaa-dshk': { t4: 0.1, t0: 0.05, t3: 0.05, gx: -0.2, tf: -0.32, tr: -0.48, t2: 0.1 },
  'gaz-mm-72k': { t4: 0.1, t0: 0.05, t3: -0.05, gx: -0.15, tb: 0.06 },
  'harry-hopkins': { t0: -0.05, bo: -0.04, tf: -0.08, tr: -0.08, t4: -0.05 },
  'ho-i': { t4: -0.05, t0: -0.1, t1: 0.05, tf: -0.16, tr: -0.08, tl: 0.06 },
  'ho-ni-i': { t0: 0.05, rx: -0.05, tf: 0.16, tl: 0.06, tk: 0.08, t2: 0.1 },
  'ho-ni-iii': { t0: -0.1, gx: 0.05, tl: -0.06, tk: 0.08, t2: 0.05, t4: 0.05 },
  hummel: { t4: 0.05, tk: -0.24, bf: -0.06, t2: 0.1, t0: -0.05, t3: 0.05 },
  'ikv-72': { t0: 0.05, bo: -0.04, tf: 0.08, tr: 0.08, gx: 0.05 },
  'is-1': { t4: 0.1, t0: 0.1, t3: 0.1, gx: -0.05, rx: 0.2, tr: 0.16, tb: 0.06, bb: -0.06 },
  'is-2': { t4: 0.05, t0: 0.05, t3: 0.1, t1: 0.05, tf: 0.08, tr: 0.16, bb: -0.06 },
  'is-2-1943': { t4: 0.05, t0: 0.05, t1: 0.05, rx: 0.1, tr: 0.08, tk: 0.08, t3: 0.05 },
  'ito-90m': { t4: 0.05, t0: 0.1, t3: 0.15, t1: 0.05, gx: 0.2, bo: 0.04, tf: 0.4, tr: 0.08, tb: 0.06, bf: 0.06, t2: -0.1 },
  'jagdpanzer-iv-l70': { t4: 0.05, t0: 0.05, t1: 0.05, tf: 0.16, tr: 0.08 },
  jagdtiger: { t0: 0.05, gx: -0.1, rx: 0.2, tf: -0.08, tr: -0.32 },
  kanonenjagdpanzer: { t0: 0.4, bo: -0.2, bb: -0.06, t4: 0.15 },
  kugelblitz: { t1: 0.05, gx: 0.05, tl: 0.36, tb: 0.06, t0: -0.05 },
  'kv-1': { t0: -0.05, t1: 0.05, gx: -0.1 },
  'l-62-anti-ii': { t4: 0.05, t0: 0.15, t3: 0.05, bo: 0.04, bf: 0.06 },
  'landsverk-l60': { t4: 0.15, tf: -0.08, tk: 0.08, bb: 0.06, t0: -0.05 },
  'leopard-2a6': { tl: 0.06, t0: 0.05 },
  'lorraine-37l': { t4: -0.05, gx: 0.2, bf: -0.12, tk: -0.08 },
  'm-51': { t0: 0.05, t3: 0.2, tf: -0.08, tr: 0.08, tl: -0.06, tb: 0.36 },
  'm10-gmc': { t1: 0.1, tl: 0.06, tb: 0.24 },
  m109: { t4: 0.35, t3: 0.1, bo: -0.28, tf: -0.16, tr: -0.08 },
  m109a1: { t4: 0.2, t3: 0.2, gx: 0.05, tr: -0.08, tl: -0.24 },
  'm16-mgmc': { t3: 0.05, bo: -0.04, bf: 0.06, bb: -0.06 },
  'm18-hellcat': { t0: -0.1, rx: 0.05, tl: 0.06 },
  'm19-mgmc': { t0: 0.35, t3: 0.15, gx: -0.1, tr: -0.08, tl: 0.06, tb: -0.12 },
  'm1a1-abrams': { t4: 0.15, t0: 0.15, t1: -0.05, tf: 0.4, tr: 0.48, tl: 0.06, tb: -0.18 },
  'm24-chaffee': { t3: 0.05, bo: -0.08, tf: 0.16, tr: -0.16, tl: 0.18 },
  'm26-super-pershing': { tf: 0.24, tb: 0.18 },
  'm2a3-bradley': { t4: 0.1, t0: 0.05, t3: 0.1, t1: 0.05, tr: 0.16, tb: 0.06, bf: -0.12 },
  m2a4: { t4: 0.05, t1: 0.1, gx: -0.05, tr: 0.08, tl: -0.12, tb: 0.06 },
  'm3-gmc': { t0: 0.05, t3: 0.05, t1: -0.15, bo: -0.04 },
  'm3-lee': { gx: -0.05, tf: -0.16, tr: 0.08, tl: 0.06, tk: -0.16, t2: 0.05, t0: 0.05 },
  'm3-stuart': { t4: -0.25, t0: 0.05, t3: -0.1, tf: 0.08, tr: 0.08, tl: -0.12, tb: -0.3, tk: -0.08 },
  'm36-jackson': { t4: 0.05, t0: 0.15, t1: -0.1, tl: 0.06, tb: 0.06, t3: 0.05 },
  'm3a1-stuart': { t4: -0.15, t3: -0.05, gx: -0.1, tr: 0.08, tk: -0.24, t2: 0.05 },
  'm3a3-stuart': { t3: 0.05, t1: 0.05, rx: 0.05, bo: 0.04, tf: -0.08, tb: -0.06, t0: -0.05 },
  'm4-t26': { gx: -0.05, tb: 0.12 },
  m41: { t4: 0.15, gx: 0.05 },
  'm42-duster': { t4: 0.05, t3: 0.05, t1: 0.05, tk: 0.16, t0: -0.05 },
  m44: { t4: 0.25, t0: 0.05, t3: 0.05, gx: -0.05 },
  'm47-patton': { t4: 0.2, t0: 0.15, t1: 0.15, tf: -0.08, tr: -0.08 },
  'm4a1-sherman': { t3: 0.2, t1: 0.05, gx: -0.05, rx: 0.05, tf: -0.08, tb: 0.12, t4: -0.05 },
  'm4a2-76': { t4: -0.15, gx: -0.05, tf: -0.08, tr: 0.08, tl: 0.12, tb: 0.12, bb: -0.18 },
  'm4a3-105': { t4: -0.05, t0: 0.1, t3: 0.05, t1: 0.05, tf: 0.08, tl: -0.06, bb: -0.12, t2: 0.1 },
  'm4a3e2-76': { t4: -0.05, t0: 0.2, t3: 0.05, tr: 0.16, tl: -0.12, tb: 0.24 },
  'm4a3e2-jumbo': { t4: -0.05, t0: 0.2, rx: -0.05, tr: 0.08, tl: -0.06, tb: 0.18 },
  m4a3e8: { t4: -0.2, tf: -0.08, tr: 0.08, tl: -0.06, tb: 0.12, bb: -0.18 },
  'm4a4-firefly': { t0: 0.05, t3: 0.15, tr: -0.08, bb: -0.18 },
  'm50-ontos': { t0: 0.1, bo: -0.28, tk: -0.08, bf: -0.06, t2: -0.15 },
  'm53-59': { t4: 0.1, tf: 0.08, tr: 0.16, tl: -0.06, tb: 0.06 },
  m55: { t4: 0.05, t0: 0.5, t1: 0.05, gx: 0.05, tl: -0.06 },
  'm56-scorpion': { t4: 0.05, t3: 0.05, gx: -0.1, tr: -0.16, tl: 0.12, tb: 0.06, bb: 0.24 },
  'm5a1-stuart': { t3: 0.05, tf: -0.08, tb: 0.06, t0: 0.05 },
  'm8-greyhound': { t4: 0.2, t3: 0.1, t1: -0.05, tb: 0.06 },
  'm8-scott': { t3: 0.1, rx: -0.1, tf: 0.08, tl: 0.3, tb: -0.12, tk: -0.08, t2: 0.05 },
  'marder-iii': { gx: -0.05, tf: -0.08, tr: -0.08, t3: 0.2 },
  'marmon-herrington-vi-2pdr': { t4: -0.25, gx: -0.1, bo: -0.16, tl: 0.3, tb: -0.06, bf: 0.06 },
  'matilda-ii': { t4: -0.05, bo: 0.04, tf: -0.08, tl: 0.06 },
  nashorn: { t4: 0.1, t0: -0.1, gx: 0.05, tl: -0.18, t2: 0.05 },
  'object-416': { t4: 0.2, bo: -0.12, tb: 0.06 },
  ostwind: { t1: 0.05, tf: -0.08, tb: -0.12 },
  'p-40': { t4: 0.15, t0: -0.1, tf: -0.08, tb: -0.24, t2: 0.05 },
  'p7t-aa': { t4: 0.3, t0: 0.05, t3: 0.05 },
  palmaria: { t0: 0.15, gx: -0.05, tl: 0.06, tb: -0.24, tk: 0.08 },
  'panhard-ebr': { bo: -0.2, tr: 0.32, tb: 0.18, bb: 0.06, t4: -0.05 },
  'panther-a': { t4: 0.05, bo: -0.04, tl: -0.06 },
  'panther-d': { bo: -0.08, t4: -0.05 },
  'panther-f': { t4: -0.05, tb: -0.06 },
  'panther-g': { t4: 0.05, tl: 0.06, tb: 0.06 },
  'panzerjager-i': { t4: 0.15, t3: 0.25, gx: -0.2, tf: 0.32, tl: 0.12 },
  'panzerwerfer-42': { t4: 0.05 },
  'pbv-301': { t0: -0.15, t3: -0.05, gx: -0.05, tf: 0.08, tl: -0.18, tb: 0.06, t2: 0.05 },
  puma: { bo: -0.04, tf: 0.08, tr: 0.08, tb: 0.06, t2: 0.1 },
  'pvkv-iii': { t4: 0.1, t3: 0.05, gx: -0.2, tr: 0.16, tb: 0.18 },
  'pvkv-iv': { t3: 0.05, tb: -0.06, t2: -0.05 },
  'pz-35t': { t4: 0.15, tf: -0.16, tl: -0.12, tb: 0.18, tk: 0.16 },
  'pz-38t': { gx: -0.05, tf: -0.08, tk: 0.08 },
  'pz-ii': { t4: 0.15, t0: 0.05, gx: -0.05, tf: -0.16, tr: 0.08, tl: -0.3, tk: -0.08, bb: -0.06 },
  'pz-iii-b': { t1: -0.05, gx: -0.15, tl: -0.06 },
  'pz-iii-e': { t0: -0.05, gx: -0.1, tf: -0.16, tl: 0.36, tb: -0.06 },
  'pz-iii-l': { t4: 0.1, t0: -0.05, gx: -0.2, tk: -0.16 },
  'pz-iii-m': { t4: 0.2, t3: 0.05, t1: -0.05, gx: -0.05, rx: 0.05, tl: 0.12, tb: 0.36 },
  'pz-iii-n': { tl: 0.24, tb: 0.06 },
  'pz-iv-f1': { t4: -0.05, gx: 0.05, tf: -0.16, tl: 0.06, tb: 0.12 },
  'pz-iv-f2': { gx: 0.05, tf: -0.08, tb: 0.18 },
  'pz-sfl-ic': { t4: 0.1, t0: 0.05, t3: 0.05, tr: -0.08, tb: -0.3, t2: 0.05 },
  'pzh-2000': { t4: 0.5, t0: 0.5, t3: 0.25, tl: 0.06 },
  'r3-t20': { t4: -0.05, t0: -0.05, t3: 0.1, t1: -0.05, tf: 0.24, tr: 0.16, tl: -0.36, tb: -0.18, bb: -0.06 },
  'ram-i': { t4: 0.1, t0: 0.05, t3: 0.05, t1: 0.15, tf: 0.08, tl: -0.12, tb: 0.24 },
  'rooikat-105': { t4: 0.15, t0: 0.05, t3: 0.05, bo: -0.04, tf: 0.16, tr: 0.08, tb: 0.36, bf: -0.06 },
  'rooikat-za-35': { t1: -0.05, bo: -0.04, tr: 0.08, tb: -0.06, t2: 0.05 },
  'sarc-mk4': { t4: 0.05, t0: -0.1, t1: 0.05, gx: 0.15, bo: -0.12, tf: 0.08, tr: 0.08, tl: 0.36, tb: 0.36 },
  'sav-m43': { t4: 0.4, t0: -0.05, t1: -0.05, gx: 0.05, tf: 0.08 },
  'sav-m43-1944': { t4: 0.4, t0: -0.15, gx: -0.05, tr: 0.08, tl: -0.12 },
  'sdkfz-140-1': { t0: -0.1, gx: 0.2, tl: 0.06, tb: -0.06 },
  'sdkfz-234-puma': { t4: -0.1, t3: 0.05, gx: -0.1, bo: -0.16, tr: -0.08, tl: 0.12, tb: -0.06 },
  'sdkfz-251-21': { gx: -0.15, t2: 0.1, t0: -0.05 },
  'sdkfz-6-2': { t4: -0.05, bo: -0.04, tf: 0.08, bf: -0.24, bb: -0.12 },
  'semovente-75-18': { t1: 0.1, gx: 0.05, tf: -0.08, tr: -0.08, bb: -0.06 },
  'semovente-m43': { t4: 0.1, t0: -0.15, t3: -0.05, t1: -0.05, tf: -0.08, tr: -0.08, tl: -0.06 },
  'sidam-25': { t4: -0.15, bo: -0.08 },
  skink: { t3: 0.15, tr: 0.08, tl: -0.18, bb: -0.12, t2: 0.2 },
  'spj-fm43-44': { t4: 0.05, t1: 0.05, tf: -0.08, tl: -0.06, tk: 0.08 },
  staghound: { t3: 0.05, gx: 0.05, bo: -0.16, tf: -0.08, tl: -0.36, tb: -0.24, bf: -0.06 },
  'strv-74': { t4: 0.2, t0: -0.05, t3: 0.05, tf: -0.16, tb: 0.06 },
  'strv-m31': { t4: -0.1, tf: -0.08, tr: -0.48, tl: 0.24, tb: -0.36, tk: 0.08 },
  'strv-m40l': { t4: 0.1, t0: -0.1, tr: 0.16, tl: -0.12 },
  'strv-m42': { t4: 0.05, t0: -0.1, t3: 0.15, t1: -0.2, gx: 0.1, tk: 0.08, bf: 0.06, t2: 0.05 },
  'stug-iii-d': { t0: 0.05, t1: 0.1, rx: 0.2, bo: 0.04, tb: -0.24, t2: 0.05 },
  'stug-iii-f': { t0: 0.1, t1: 0.2, tl: -0.06, tb: -0.06 },
  'stug-iii-g': { t0: 0.1, t1: 0.2, gx: -0.05, tf: -0.08, tl: 0.12, tb: 0.06, bb: -0.18 },
  'su-100': { t4: 0.1, t0: 0.15, gx: 0.2, bo: -0.04, tf: 0.24, tl: 0.06, tk: 0.16 },
  'su-100p': { t4: 0.05, t0: 0.35, t1: 0.05, bo: -0.04, tb: -0.36, tk: 0.32 },
  'su-122': { t4: 0.05, gx: 0.05, t1: 0.05 },
  'su-122-54': { t4: 0.5, t0: 0.1, t3: -0.05, t1: 0.1, rx: 0.2 },
  'su-76m': { t4: 0.15, gx: 0.1, bb: -0.06, t2: 0.2 },
  'sub-i-ii': { t4: 0.05, bo: -0.12, tf: -0.48, tl: -0.36, tb: 0.36 },
  't-10m': { t4: -0.1, tl: 0.24, tk: -0.08 },
  't-126': { t4: 0.25, t0: -0.05, t3: 0.05, t1: -0.05, tf: -0.08, tb: -0.24, bf: 0.06 },
  't-26': { t0: -0.2, gx: -0.2, tf: -0.08, tr: -0.08, tl: -0.24, tk: 0.08 },
  't-28': { t4: 0.05, t1: -0.05, gx: -0.2, tb: -0.18 },
  't-34-100': { t3: -0.05, tr: 0.08, tb: 0.06 },
  't-34-1940': { t0: 0.15, gx: -0.1, rx: 0.15, tf: -0.08, tb: -0.06, tk: 0.16 },
  't-34-85': { t4: -0.05, t0: 0.05, t1: 0.25, rx: 0.15, tf: 0.32, tk: 0.08 },
  't-44-122': { t4: 0.1, t0: 0.15, t1: 0.1, gx: 0.05, rx: -0.05, bo: -0.04, tb: -0.06 },
  't-50': { t4: 0.05, t0: 0.1, t3: 0.15, tf: -0.16, tr: 0.16, tb: -0.06, tk: 0.16 },
  't-80-light': { t4: 0.1, t3: 0.15, gx: -0.05, bo: -0.04, tf: -0.08, tb: 0.06 },
  't1e1-90': { t4: 0.1, t0: -0.05, t3: 0.05, tr: 0.24, tl: 0.06, tb: -0.06, tk: 0.16 },
  t20: { t4: 0.4, t3: 0.1, bo: -0.04, tr: 0.08, tb: -0.12 },
  t25: { t4: 0.15, t0: -0.05, t3: 0.05, tr: 0.08 },
  t29: { t0: -0.15, bo: -0.04, tr: 0.16, tl: 0.18, tb: -0.12, tk: 0.08 },
  't34-heavy': { t4: 0.1, t0: -0.1, t3: 0.1, tf: -0.08, tl: 0.06 },
  t92: { t4: 0.05, t1: -0.05, rx: 0.05, bo: -0.24, tr: 0.16, tb: -0.06, tk: -0.08, bb: -0.12 },
  'tcm-20': { t4: -0.1, t3: -0.05, t1: 0.1, tf: -0.24, tr: 0.08, tl: -0.3, tb: 0.36 },
  tetrarch: { bo: -0.04, tf: 0.08, tr: -0.16, bb: -0.06, t0: 0.05, t1: 0.05 },
  'tiger-i-e': { gx: 0.05, bo: -0.08 },
  'tiger-i-h1': { t3: 0.05, tl: 0.06, tb: 0.18 },
  'tiger-ii-p': { t4: 0.05, tf: 0.08 },
  'turan-i': { t4: 0.2, t3: 0.05, tf: -0.08, tk: 0.16 },
  'type-1-chi-he': { t4: 0.15, t0: -0.1, tk: 0.16 },
  'type-63-twin-25': { t4: 0.1, t0: 0.25, t3: -0.15, t1: 0.5, rx: 0.2, bo: -0.12, tk: 0.16 },
  'type-95-so-ki': { t4: -0.15, t0: -0.1, gx: -0.2, bo: 0.08, tl: 0.12, tb: 0.36, tk: 0.16 },
  'type-97-chi-ha-kai': { t3: 0.05, gx: 0.05, rx: 0.05, tb: 0.06, tk: 0.08 },
  valentine: { t0: -0.05, rx: -0.05, tl: -0.18 },
  'valentine-archer': { t3: 0.1, t1: -0.05, gx: 0.05, rx: -0.05, bo: -0.16, tf: -0.08 },
  'valentine-ix': { t1: 0.05, gx: -0.05, tf: 0.08, tl: 0.12, tb: 0.18 },
  'valentine-xi': { gx: -0.05, tb: -0.06 },
  'vk-3002m': { bo: -0.08, tf: -0.08, tb: 0.12 },
  waffentrager: { t4: 0.45, t3: 0.15, rx: -0.05, tf: 0.08, bb: 0.06 },
  wirbelwind: { t4: 0.05, t1: 0.05, tf: 0.4, tr: 0.32, tl: -0.06, tb: 0.36, tk: -0.08 },
  'yag-10-29k': { t0: 0.1, gx: -0.1, bo: -0.08, t2: -0.05 },
  'zerstorer-45': { t4: 0.3, t0: -0.2, t3: 0.25, tf: 0.16 },
  'zis-12-94km': { t4: 0.15, t3: 0.05, gx: -0.05, bo: -0.04, tf: -0.16, tr: -0.16, tb: -0.06 },
  'zis-30': { t4: 0.1, t0: 0.35, t3: 0.35, tf: -0.08, tb: 0.06 },
  'zrinyi-ii': { t4: 0.35, t0: 0.1, t3: -0.1, t1: -0.35, tf: -0.08, tk: 0.16 },
  'zsu-23-4-shilka': { t4: 0.05, t3: 0.05, tr: 0.16, tb: 0.24 },
  'zsu-37': { t3: 0.1, bo: -0.04, tk: 0.08, bf: 0.06, t2: 0.45 },
  'zsu-57-2': { t4: 0.2, t0: 0.1, t3: 0.1, tk: 0.08 },
};

export const AIR_OUTLINE_FIT: Record<string, AirOutlineFit> = {
  'a-1-skyraider': { ts: 0.06, fd: -0.08, rd: 0.16, cn: -0.36, fh: 0.08 },
  'a-26-invader': { ts: 0.06, nl: 0.1, fd: 0.08, rd: 0.08, cn: -0.24, fh: 0.08 },
  'a-26c': { ts: 0.06, nl: 0.1, cn: -0.24, fh: 0.08, rd: 0.08 },
  a2d: { tp: 0.12, ts: 0.06, nl: 0.05, fh: 0.08 },
  'a6m-zero': { ts: 0.06 },
  'ar-234': { nl: -0.1, fh: 0.08 },
  'b-18': { tx: 0.015, fd: 0.08, rd: -0.08 },
  'b-25': { ts: -0.06, tx: 0.015, nl: 0.05, fd: 0.24 },
  'b-26-marauder': { sw: 0.04, ts: 0.12, fh: 0.24 },
  'b-29': { tp: -0.12, ts: -0.06, fh: 0.16 },
  'b-34': { tx: 0.015, nl: -0.05, rd: 0.08, fh: 0.08 },
  'bf-109-e': { tp: -0.12, ts: -0.06, tx: -0.03, nl: 0.1, fd: -0.08, fh: 0.08, sw: 0.04 },
  'bf-109-f': { tx: -0.015, nl: 0.1, fh: 0.08, rd: 0.08 },
  'bf-109-k4': { tx: -0.015, nl: 0.1, fh: 0.08 },
  'bf-110': { sw: 0.04, nl: -0.05, fd: 0.24 },
  bf2c: { ts: -0.06, tx: -0.06, rd: 0.16, cn: -0.36 },
  'bv-238': { sw: -0.12, tp: 0.24, ts: -0.12, tx: -0.03, rd: 0.32 },
  'c-3604': { sw: -0.04, tp: 0.12, ts: -0.12, rd: -0.08, cn: -0.12, fh: -0.08, fd: 0.08 },
  'cw-21': { tp: -0.12, ts: -0.06, tx: -0.045, rd: -0.16, fh: -0.08, sw: 0.04 },
  'do-217': { tx: -0.015, nl: 0.3, fd: 0.08, rd: 0.08, fh: 0.16 },
  'do-335': { tp: 0.12, ts: 0.06, tx: -0.03, nl: -0.05, fd: -0.08, rd: 0.32, cn: -0.36, fh: 0.08, sw: 0.04 },
  'er-2': { sw: 0.04, ts: 0.06, nl: -0.05, rd: 0.08, cn: -0.12 },
  'eurofighter-typhoon': { fd: -0.16, tp: -0.06 },
  'f-104': { tp: 0.12, nl: 0.15, sw: -0.04 },
  'f-104g': { tp: 0.12, nl: 0.15 },
  'f-15c': { sw: -0.08, tl: -0.06, rd: 0.08 },
  'f-15e': { sw: -0.08, tx: 0.015, cn: 0.12, tl: -0.06, fd: -0.08 },
  'f-5e': { sw: -0.04, tp: -0.12, nl: -0.05 },
  'f-82e': { sw: -0.16, tp: 0.36, ts: -0.3, tx: -0.03, nl: 0.3, fd: 0.16, rd: -0.08, fh: 0.16 },
  'f-86k': { tp: 0.12 },
  'f-a-18e': { fh: -0.08, rd: -0.08 },
  'f-a-18f': { fh: -0.08, rd: -0.08 },
  'f2a-buffalo': { tx: -0.015 },
  'f3d-1': { tp: 0.12, ts: 0.06, rd: 0.08, cn: -0.24, fh: 0.32 },
  'f4u-4': { tx: 0.015, nl: 0.05, rd: -0.08, cn: 0.12 },
  'f4u-corsair': { nl: 0.05, fd: 0.08 },
  'f6f-hellcat': { rd: -0.16, cn: -0.12, fh: 0.24, fd: 0.08 },
  f7f: { sw: -0.08, tx: 0.015, nl: -0.05, fd: 0.08, rd: 0.08, cn: -0.24, fh: -0.16 },
  'f8f-bearcat': { tx: -0.015, fd: 0.16, rd: 0.24, fh: -0.16 },
  'ffvs-j22': { tp: 0.12, ts: 0.06, fd: 0.16, rd: -0.08, cn: -0.12 },
  firebrand: { sw: -0.04, tp: -0.12, ts: -0.06, tx: -0.015, nl: -0.2, fd: 0.08, cn: -0.36 },
  firecrest: { sw: 0.12, ts: -0.36, tx: -0.06, nl: -0.05, fd: 0.08, rd: 0.24, cn: -0.24, fh: 0.32 },
  'firefly-mk4': { tx: 0.015, fd: 0.08, rd: 0.16, cn: -0.24 },
  'fokker-g1': { sw: -0.08, tp: 0.24, tx: -0.03, nl: 0.1, rd: -0.08, cn: 0.12 },
  'fw-190-d9': { sw: 0.04, ts: 0.06, cn: -0.12 },
  'g4m-betty': { nl: 0.1, fd: -0.08, cn: -0.12, fh: -0.08, ts: 0.06, tx: -0.015 },
  'he-100': { sw: -0.08, tp: -0.12, rd: 0.08, cn: -0.24, fh: 0.08 },
  'he-111': { tx: -0.03, nl: 0.1, rd: -0.16, fh: -0.08, sw: 0.04 },
  'he-112': { sw: 0.04, ts: 0.3, tx: -0.015, fd: 0.24, cn: -0.24 },
  'he-112a': { sw: 0.04, ts: 0.18, tx: -0.03, fd: 0.08, rd: 0.16, cn: -0.24 },
  'he-162': { sw: -0.16, tp: -0.12, ts: 0.24, tx: 0.015, nl: -0.05, fd: -0.08, cn: -0.24, fh: -0.16 },
  'hs-129': { sw: -0.04, tp: 0.12, ts: 0.06, fd: 0.08, rd: 0.08 },
  'hs-129b-3': { tp: -0.12, ts: 0.06, nl: -0.05, fd: -0.08, cn: 0.12 },
  'hunter-f1': { nl: 0.05, rd: -0.08 },
  hurricane: { ts: -0.06, tx: 0.015, rd: 0.08, fh: -0.08 },
  'i-153': { ts: 0.24, tx: -0.045, fd: -0.08, fh: 0.08 },
  'i-16': { tp: 0.12, ts: -0.06, fd: -0.08, rd: -0.08 },
  'i-185': { tp: -0.12, tx: -0.03, fd: -0.08, rd: -0.08, cn: -0.12, ts: -0.06, nl: -0.05 },
  'ia-58': { sw: 0.04, tp: 0.6, ts: 0.06, fd: 0.16, rd: 0.32, cn: -0.36, fh: -0.08 },
  'il-2': { sw: 0.04, tx: -0.015, ts: 0.06 },
  'il-2-1941': { sw: 0.04, tx: -0.015, rd: -0.32, cn: 0.12, ts: 0.06 },
  j1n1: { sw: -0.08, tp: -0.12, ts: 0.06, fh: -0.08 },
  'jaguar-gr1': { ts: -0.06, nl: -0.2, fh: -0.24, sw: 0.04, tx: -0.015 },
  'jas-39e': { sw: 0.04, nl: -0.05, tl: -0.06, rd: 0.08, cn: -0.12, fd: -0.08 },
  'ju-88': { sw: -0.04, tx: -0.015, fd: -0.08 },
  'ki-43': { sw: -0.12, tp: 0.12, ts: 0.24, tx: -0.015, fd: 0.08, cn: -0.48 },
  'ki-43-i': { sw: -0.08, tp: 0.12, ts: 0.24, fd: 0.08, cn: -0.48 },
  'ki-44': { ts: -0.12, tx: 0.015, fd: 0.08, cn: -0.12, nl: 0.1 },
  'ki-45': { sw: -0.04, ts: 0.06, fd: -0.16, rd: 0.08, fh: 0.16 },
  'ki-49': { sw: -0.08, tp: 0.24, ts: 0.12, tx: 0.015, nl: -0.15, fd: -0.08, rd: 0.08, cn: -0.24 },
  'ki-61': { ts: 0.18, tx: -0.015, rd: 0.16, fd: -0.08 },
  'ki-67': { fd: -0.08, cn: -0.24 },
  'l-39': { sw: 0.08, tp: -0.12, ts: 0.18, tx: 0.015, rd: 0.24, cn: -0.6, fh: 0.08 },
  'la-11': { ts: 0.06, rd: 0.32, cn: -0.24 },
  'la-7': { sw: 0.04, ts: -0.06, nl: 0.1, fd: 0.08, cn: -0.12 },
  'lagg-3': { sw: -0.04, tp: -0.12, fd: 0.16, cn: -0.24, fh: -0.08, nl: 0.05 },
  lancaster: { ts: 0.06, tx: -0.015, nl: 0.05, rd: -0.08, tp: 0.12 },
  'lightning-f6': { tp: 0.6, tx: 0.015, nl: -0.2, fd: 0.16, cn: -0.12, fh: 0.24, sw: 0.04, ts: -0.06 },
  'mb-157': { sw: -0.04, tp: -0.12, fd: -0.08, rd: 0.16, cn: -0.24, fh: 0.32 },
  'me-262-u4': { tp: -0.12, tx: 0.015, nl: -0.05, ts: -0.06 },
  'me-264': { ts: -0.12, tx: -0.015, cn: -0.12, fh: 0.16 },
  'me-410': { tx: 0.015, nl: -0.25, rd: 0.08, cn: -0.12, fh: -0.08 },
  'mig-21f-13': { tp: -0.12, nl: -0.15, tl: 0.06, rd: 0.08, fh: -0.24, sw: 0.12, tx: -0.015 },
  'mig-3': { sw: 0.04, tp: -0.12, ts: -0.06, fd: 0.16, rd: -0.08, cn: -0.24 },
  'mosquito-fb': { nl: -0.05, fd: 0.08, cn: -0.12 },
  'ms-406': { sw: -0.04, tx: -0.06, cn: -0.24, nl: 0.05 },
  'ms-410': { sw: -0.04, tx: -0.015, nl: 0.15 },
  myrsky: { ts: -0.06, rd: 0.08, cn: -0.12 },
  narval: { sw: 0.16, ts: -0.12, tx: -0.03, rd: -0.08, cn: -0.12, fh: -0.4 },
  'nc-223': { sw: -0.04, tp: -0.12, ts: -0.24, tx: -0.075, rd: -0.08, cn: -0.12 },
  'p-108': { sw: -0.16, tp: 0.36, ts: -0.12, tx: -0.015, nl: -0.2, fd: -0.16, cn: 0.12, fh: 0.08 },
  'p-36': { sw: -0.12, tp: -0.12, ts: -0.06, fd: 0.16, cn: -0.12 },
  'p-38j': { tx: 0.007, nl: 0.025, rd: -0.04 },
  'p-39': { rd: 0.24 },
  'p-47d': { tp: -0.12, tx: -0.015, nl: 0.05, fd: 0.08, rd: -0.08 },
  'p-47d-razorback': { tp: -0.12, tx: -0.015, nl: 0.05, fd: 0.08, rd: -0.08, fh: -0.08, sw: 0.04 },
  'p-47n': { nl: 0.05, fd: 0.08, rd: -0.08 },
  'p-51a': { tp: 0.12, nl: 0.05, fd: 0.16 },
  'p-51b': { tp: 0.12, nl: 0.05, rd: -0.08, ts: -0.06 },
  'p-59a': { ts: -0.06, tx: -0.045, nl: -0.1, fd: 0.08, rd: 0.08, cn: -0.36 },
  'p-61': { tp: 0.12, nl: -0.05, rd: 0.32, cn: -0.12 },
  'p-63': { ts: -0.06, tx: 0.015, nl: 0.05, fh: -0.08 },
  pbm: { ts: 0.06, tx: -0.015, fh: 0.08 },
  'pby-catalina': { tp: -0.12, cn: -0.24 },
  rafale: { tp: 0.12, nl: -0.05, tl: 0.06, fd: -0.08 },
  're-2000': { sw: -0.04, ts: -0.06, fd: 0.16, cn: -0.36 },
  're-2001': { fd: 0.24, cn: -0.24 },
  're-2005': { sw: -0.04, tp: 0.12, fd: 0.08, cn: -0.24, nl: 0.05 },
  's-199': { sw: -0.04, ts: -0.12, tx: -0.015, nl: 0.1, rd: 0.24, cn: -0.24, fh: -0.08, tp: -0.12 },
  'saab-105': { sw: 0.04, tp: 0.12, ts: 0.18, tx: 0.045, nl: -0.1, fd: 0.16, cn: -0.36 },
  'saab-b18a': { sw: -0.24, tp: -0.12, tx: -0.015, nl: -0.1, fd: -0.08, rd: -0.16, fh: -0.08 },
  'saab-j21a': { tp: 0.24, ts: -0.06, rd: 0.24, cn: -0.12, fh: -0.08, sw: 0.04, tx: -0.03 },
  'saab-t18b': { sw: -0.24, tp: -0.24, tx: -0.015, nl: -0.05, fd: -0.08, cn: -0.24, fh: 0.08 },
  'sb-2': { sw: 0.04, ts: -0.18, nl: 0.05, fd: 0.16, cn: -0.24 },
  'sb2c-helldiver': { sw: -0.08, tp: 0.24, tx: 0.015, nl: -0.05, cn: -0.12 },
  sb2u: { sw: -0.08, ts: -0.06, tx: -0.015, nl: -0.05, cn: -0.24, fh: 0.08 },
  'sea-fury': { sw: -0.04, ts: -0.06, rd: 0.16, cn: -0.24 },
  'sm-91': { sw: -0.08, ts: -0.18, tx: -0.075, fd: -0.08 },
  'spitfire-mk-ix': { tx: -0.015, fd: 0.16, rd: 0.08, cn: -0.12, fh: 0.08, ts: 0.06 },
  'spitfire-mk-v': { sw: -0.04, ts: -0.12, fd: 0.08 },
  'spitfire-mk-xiv': { ts: 0.18, tx: 0.015, nl: -0.05, rd: -0.08, cn: -0.12, fh: 0.4 },
  'su-17m4': { tp: -0.12, ts: -0.12, nl: 0.05 },
  'su-2': { tp: -0.12, fd: -0.08, fh: 0.16, rd: 0.08 },
  'su-24m': { tp: -0.48, tx: 0.03, tl: -0.06, cn: -0.24, fh: -0.08, ts: -0.06 },
  'su-30': { sw: 0.04, tp: 0.12, ts: 0.06, fh: -0.16 },
  'su-30mki': { sw: -0.04, tp: -0.12, ts: 0.06, fd: 0.08, fh: -0.08, rd: 0.08 },
  'su-33': { sw: -0.12, ts: 0.06, tx: 0.015, nl: 0.05, fd: -0.08, fh: -0.16 },
  'su-7b': { sw: -0.04, ts: 0.18, nl: -0.1, fd: -0.24, cn: 0.12 },
  'tbd-1': { ts: 0.06, tx: 0.03, cn: -0.12, fh: 0.16, sw: -0.04, tp: -0.12 },
  'tempest-v': { tp: -0.12, ts: -0.12, fd: 0.08, rd: 0.08, cn: -0.24 },
  'tu-2': { sw: -0.04, tx: 0.015, nl: -0.05, cn: 0.12, fh: 0.16, rd: -0.08 },
  'tu-95m': { ts: -0.36, tx: -0.03, nl: -0.1, rd: -0.08, cn: -0.24 },
  typhoon: { nl: 0.05, fd: 0.08, rd: 0.16, cn: -0.12 },
  'vb-10': { sw: -0.08, tp: 0.12, ts: 0.12, tx: 0.015, nl: -0.15, fd: 0.08, rd: 0.08 },
  vengeance: { tp: -0.12, fh: 0.08 },
  'vg-33': { sw: -0.04, tp: -0.24, ts: 0.06, fd: 0.24, rd: -0.08, cn: -0.12, fh: 0.08 },
  whirlwind: { sw: -0.04, ts: -0.06, tx: -0.015, nl: -0.2, fd: 0.08, cn: -0.12 },
  'xp-55': { sw: 0.08, tp: -0.36, fd: -0.08, rd: 0.08, cn: -0.12, nl: -0.05, tl: 0.06 },
  'yak-1': { tp: 0.12, nl: 0.05, fh: 0.08, cn: 0.12 },
  'yak-3': { tp: -0.12, ts: -0.12, fd: 0.16, cn: -0.24 },
  'yak-4': { tp: 0.12, nl: -0.15, fd: 0.24, cn: -0.24 },
  'yak-7b': { nl: 0.05, fh: 0.08 },
};

/** A tent rising from 0 at `c - w` to 1 at `c` and back to 0 at `c + w`. */
const hat = (u: number, c: number, w: number) => Math.max(0, 1 - Math.abs(u - c) / w);

/** The mean x of some points. */
const mean = (q: P2[]) => q.reduce((a, p) => a + p[0], 0) / Math.max(1, q.length);

/** Every x along an outline mapped by `f`, its parts kept as they are. */
function mapX(o: Outline, f: (x: number) => number): Outline {
  const s = o.section;
  return {
    ...o,
    top: o.top.map(([x, y]): P2 => [f(x), y]),
    bottom: o.bottom.map(([x, y]): P2 => [f(x), y]),
    plan: o.plan.map(([x, y]): P2 => [f(x), y]),
    ...(Array.isArray(o.round) ? { round: o.round.map(([x, y]): P2 => [f(x), y]) } : {}),
    ...(s && s.length && !Array.isArray(s[0]) ? { section: (s as { x: number; shape: P2[] }[]).map((p) => ({ ...p, x: f(p.x) })) } : {}),
  };
}

/** The ground figure with its hull, track and turret outlines reshaped. */
export function reshapeGround(s: GroundSpec, f: GroundOutlineFit): GroundSpec {
  let r = s;
  const o = s.hullOutline;
  if (o && o.top.length > 1) {
    const xs = o.top.map((p) => p[0]);
    const x0 = Math.min(...xs);
    const x1 = Math.max(...xs);
    const xc = (x0 + x1) / 2;
    const h2 = Math.max(0.1, (x1 - x0) / 2);
    const H = s.hullHeight;
    const u = (x: number) => (x - xc) / h2;
    const dTop = (x: number) => H * ((f.t0 ?? 0) * hat(u(x), -1, 0.5) + (f.t1 ?? 0) * hat(u(x), -0.5, 0.5) + (f.t2 ?? 0) * hat(u(x), 0, 0.5) + (f.t3 ?? 0) * hat(u(x), 0.5, 0.5) + (f.t4 ?? 0) * hat(u(x), 1, 0.5));
    const dBot = (x: number) => H * ((f.bo ?? 0) + (f.bf ?? 0) * hat(u(x), 1, 0.5) + (f.bb ?? 0) * hat(u(x), -1, 0.5));
    const wx = (x: number) => x + h2 * ((f.gx ?? 0) * hat(u(x), 0.7, 0.3) + (f.rx ?? 0) * hat(u(x), -0.7, 0.3));
    const bottom = o.bottom.map(([x, y]): P2 => [x, Math.max(0.02, y + dBot(x))]);
    const floor = Math.min(...bottom.map((p) => p[1])) + 0.03;
    const top = o.top.map(([x, y]): P2 => [wx(x), Math.max(floor, y + dTop(x))]);
    r = { ...r, hullOutline: { ...o, top, bottom } };
  }
  if (f.tk && s.trackProfile) {
    const ym = Math.max(...s.trackProfile.map((p) => p[1]));
    r = { ...r, trackProfile: s.trackProfile.map(([x, y]): P2 => [x, y > ym * 0.5 ? y + f.tk! * ym : y]) };
  }
  const t = s.turret;
  if (t?.outline && (f.tf || f.tr || f.tl || f.tb)) {
    const to = t.outline;
    const xs = to.top.map((p) => p[0]);
    const x0 = Math.min(...xs);
    const x1 = Math.max(...xs);
    const ht = Math.max(...to.top.map((p) => p[1]));
    const u = (x: number) => (2 * (x - x0)) / Math.max(0.1, x1 - x0) - 1;
    const dTop = (x: number) => ht * ((f.tf ?? 0) * hat(u(x), 1, 2) + (f.tr ?? 0) * hat(u(x), -1, 2));
    const kf = 1 + (f.tl ?? 0);
    const kb = 1 + (f.tb ?? 0);
    const sx = (x: number) => (x > 0 ? x * kf : x * kb);
    const shaped = mapX({ ...to, top: to.top.map(([x, y]): P2 => [x, Math.max(0.02, y + dTop(x))]) }, sx);
    const turret: TurretSpec = { ...t, outline: shaped, ...(t.gunX !== undefined ? { gunX: sx(t.gunX) } : {}) };
    r = { ...r, turret };
  }
  return r;
}

/** The aircraft with its wing plan, tail and fuselage reshaped. */
export function reshapeAircraft(s: FixedWingSpec, f: AirOutlineFit): FixedWingSpec {
  let r = s;
  const L = s.length;
  const wp = s.wingPlan;
  if (wp && wp.length > 2 && (f.sw || f.tp)) {
    const ym = Math.max(...wp.map((p) => p[1]));
    const root = wp.filter((p) => p[1] < ym * 0.02);
    const tip = wp.filter((p) => p[1] > ym * 0.97);
    const xr = mean(root);
    const xt = mean(tip);
    const plan = wp.map(([x, y]): P2 => {
      const v = y / ym;
      const xc = xr + (xt - xr) * v;
      return [xc + (x - xc) * (1 + (f.tp ?? 0) * v) - (f.sw ?? 0) * y, y];
    });
    r = { ...r, wingPlan: plan };
  }
  if (s.tailPlan && (f.ts || f.tx)) r = { ...r, tailPlan: s.tailPlan.map(([x, y]): P2 => [x + (f.tx ?? 0) * L, y * (1 + (f.ts ?? 0))]) };
  if (s.finPlan && f.fh) r = { ...r, finPlan: s.finPlan.map(([x, y]): P2 => [x, y > 0 ? y * (1 + f.fh!) : y]) };
  const fu = s.fuselage;
  if (fu && (f.nl || f.tl || f.fd || f.rd || f.cn)) {
    const xw = s.wing.x;
    const xs = fu.top.map((p) => p[0]);
    const x0 = Math.min(...xs);
    const x1 = Math.max(...xs);
    const kn = 1 + (f.nl ?? 0);
    const kt = 1 + (f.tl ?? 0);
    const sx = (x: number) => (x > xw ? xw + (x - xw) * kn : xw + (x - xw) * kt);
    const w = (x: number) => Math.min(1, Math.max(0, (x - x0) / Math.max(0.1, x1 - x0)));
    const ky = (x: number) => 1 + (f.fd ?? 0) * w(x) + (f.rd ?? 0) * (1 - w(x));
    const deep = (o: Outline): Outline => ({ ...o, top: o.top.map(([x, y]): P2 => [x, y * ky(x)]), bottom: o.bottom.map(([x, y]): P2 => [x, y * ky(x)]) });
    r = { ...r, fuselage: mapX(deep(fu), sx) };
    if (s.glass) r = { ...r, glass: s.glass.map((g) => ({ ...g, ...mapX({ ...g, top: g.top.map(([x, y]): P2 => [x, y * ky(x) * (1 + (f.cn ?? 0))]) }, sx) })) };
    if (s.bodies) r = { ...r, bodies: s.bodies.map((b) => (b.side ? b : { ...b, ...mapX(deep(b), sx) })) };
    if (s.canopy) r = { ...r, canopy: { ...s.canopy, x: sx(s.canopy.x) } };
    // The tail rides the end of the fuselage, its plan kept.
    const ride = (p: P2[]): P2[] => {
      const d = sx(mean(p)) - mean(p);
      return p.map(([x, y]): P2 => [x + d, y]);
    };
    if (f.tl && r.tailPlan) r = { ...r, tailPlan: ride(r.tailPlan) };
    if (f.tl && r.finPlan) r = { ...r, finPlan: ride(r.finPlan) };
    if (f.nl && s.engines?.kind === 'nose-prop') r = { ...r, length: L + 2 * (x1 - xw) * (kn - 1) };
  }
  return r;
}

/** Reshapes the listed figures in place. */
export function fitOutlines(G: Record<string, GroundSpec>, A: Record<string, FixedWingSpec>): void {
  for (const [name, f] of Object.entries(GROUND_OUTLINE_FIT)) if (G[name]) G[name] = reshapeGround(G[name], f);
  for (const [name, f] of Object.entries(AIR_OUTLINE_FIT)) if (A[name]) A[name] = reshapeAircraft(A[name], f);
}
