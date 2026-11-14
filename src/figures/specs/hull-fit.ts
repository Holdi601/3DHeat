/**
 * Hull heights and lengths fitted to the War Thunder reference. Where public sources do not fix a hull's proportions
 * well enough for the side view (the user's call, 2026-11-14: hits and events have to land on the right spot of the
 * vehicle), the figure may be fitted to the reference silhouette. `ky` scales every height of the hull about the ground
 * (deck, the hull outline's top and belly, its section's true heights, hull add-ons, the open compartment's floor, a
 * half-track's fenders), the running gear's wheels and track run staying as they are and the turret riding the new
 * deck; `kl` scales the hull's lengths about its middle (the outline, the track run and its wheels, the turrets' and
 * hull guns' places, add-ons, stowage), the gun barrels staying as long as they are. Found by measuring each figure at
 * several scales and keeping the one that matched the side and turret-side views best; listed in sources.md as fitted
 * to the WT reference.
 */

import type { GroundSpec } from '../ground';
import type { Outline, P2, SectionShape } from '../parts';

/** A hull's fitted height and length scale. */
export interface HullFit {
  ky?: number;
  kl?: number;
}

export const HULL_FIT: Record<string, HullFit> = {
  '2s1-gvozdika': { ky: 1.067 },
  '2s3-akatsiya': { ky: 1.027 },
  'amd-35': { ky: 1.04 },
  'arl-44': { ky: 0.969, kl: 0.969 },
  'armoured-train-car': { kl: 0.8 },
  'as-42': { ky: 0.972, kl: 1.056 },
  'as-42-47': { kl: 1.028 },
  'bkan-1c': { ky: 0.87 },
  'bmp-1': { ky: 1.107 },
  'bt-7': { ky: 1.043 },
  'btr-152a': { kl: 1.024 },
  'btr-zd': { kl: 1.024 },
  'celere-sahariano': { ky: 0.932, kl: 1.174 },
  'challenger-2': { kl: 0.959 },
  'churchill-gun-carrier': { kl: 0.956 },
  'churchill-i': { kl: 0.946 },
  cm52: { ky: 1.164, kl: 0.969 },
  conqueror: { ky: 1.026 },
  'daimler-armoured-car': { ky: 1.03 },
  'fiat-6616': { ky: 1.153, kl: 0.989 },
  'flakpanzer-38t': { kl: 1.083 },
  'flakpanzer-i': { ky: 1.127, kl: 0.968 },
  'gaz-aaa-dshk': { kl: 0.944 },
  'gaz-mm-72k': { ky: 1.101, kl: 0.946 },
  'ho-ni-i': { ky: 1.035 },
  'ito-90m': { ky: 1.071, kl: 1.024 },
  'kv-1': { ky: 1.043 },
  'l-62-anti-ii': { ky: 0.905 },
  'lorraine-37l': { ky: 1.25 },
  'lvt-4-zis-2': { ky: 1.099, kl: 0.988 },
  'lvt-a1': { kl: 0.957 },
  'lvtdgb-m40': { kl: 0.96 },
  m109: { kl: 0.959 },
  'm16-mgmc': { ky: 1.012 },
  'm3-gmc': { kl: 0.978 },
  'm3-stuart': { kl: 0.984 },
  'm36-jackson': { ky: 0.974 },
  'm42-duster': { ky: 1.09 },
  'm50-ontos': { ky: 1.059, kl: 0.835 },
  'm53-59': { ky: 1.179 },
  m55: { ky: 1.034 },
  'm8-scott': { ky: 1.206 },
  'p-40': { kl: 0.948 },
  palmaria: { ky: 0.915 },
  'panther-a': { ky: 1.026 },
  'pvkv-iii': { ky: 1.052, kl: 0.933 },
  'pz-iii-e': { kl: 0.961 },
  'pz-iii-h': { ky: 1.01, kl: 0.974 },
  'pz-iii-l': { ky: 1.012, kl: 0.979 },
  'pz-iv-e': { kl: 0.983 },
  'pz-iv-f1': { kl: 0.967 },
  ratel: { ky: 1.038, kl: 1.031 },
  'rooikat-za-35': { ky: 1.22 },
  'sarc-mk4': { ky: 1.065 },
  'sav-m43': { ky: 1.011 },
  'sdkfz-251-21': { ky: 1.096 },
  'semovente-m43': { kl: 0.93 },
  'sidam-25': { ky: 1.239, kl: 1.057 },
  skink: { kl: 1.017 },
  'spj-fm43-44': { kl: 0.887 },
  'steam-locomotive': { ky: 1.128, kl: 0.981 },
  'stug-iii-d': { ky: 0.987 },
  'stug-iii-g': { ky: 1.014 },
  'su-122-54': { ky: 1.058 },
  'su-76m': { kl: 0.977 },
  't-44': { ky: 1.015 },
  't-44-100': { ky: 0.953 },
  't-44-122': { ky: 0.984 },
  t92: { ky: 1.057 },
  tetrarch: { ky: 1.026 },
  'tiger-i-h1': { ky: 1.027 },
  'tiger-ii-h': { kl: 0.957 },
  'tiger-ii-p': { kl: 0.964 },
  tortoise: { kl: 0.97 },
  'type-1-chi-he': { kl: 1.011 },
  'type-63-twin-25': { ky: 1.25 },
  'type-97-chi-ha-kai': { ky: 1.069 },
  'yag-10-29k': { ky: 1.13 },
  'zerstorer-45': { ky: 1.112 },
  'zis-30': { ky: 0.964 },
  'zrinyi-ii': { kl: 0.972 },
  'zsu-37': { ky: 0.837 },
  'zsu-57-2': { kl: 0.964 },
};

/** The section's stations along x and true heights scaled. */
function scaledSection(o: Outline, kl: number, ky: number): SectionShape | undefined {
  const s = o.section;
  if (!s) return undefined;
  const up = (sh: P2[]): P2[] => (o.sectionAbs ? sh.map(([u, w]): P2 => [u * ky, w]) : sh);
  return typeof s[0] === 'object' && !Array.isArray(s[0]) ? (s as { x: number; shape: P2[] }[]).map((p) => ({ x: p.x * kl, shape: up(p.shape) })) : up(s as P2[]);
}

/** The spec with its hull `kl` times as long and `ky` times as high. */
export function scaleHull(s: GroundSpec, kl: number, ky: number): GroundSpec {
  const pt = (p: P2[]): P2[] => p.map(([x, y]): P2 => [x * kl, y * ky]);
  const px = (p: P2[]): P2[] => p.map(([x, y]): P2 => [x * kl, y]);
  const xs = (a?: number[]) => a?.map((x) => x * kl);
  const o = s.hullOutline;
  return {
    ...s,
    length: s.length * kl,
    hullHeight: s.hullHeight * ky,
    ...(o ? { hullOutline: { ...o, top: pt(o.top), bottom: pt(o.bottom), plan: px(o.plan), round: Array.isArray(o.round) ? px(o.round) : o.round, section: scaledSection(o, kl, ky) } } : {}),
    ...(s.trackProfile ? { trackProfile: px(s.trackProfile) } : {}),
    ...(s.running ? { running: { ...s.running, wheels: s.running.wheels.map((x) => x * kl), rollers: xs(s.running.rollers) } } : {}),
    ...(s.skirt ? { skirt: pt(s.skirt) } : {}),
    ...(s.turret ? { turret: { ...s.turret, x: s.turret.x * kl } } : {}),
    ...(s.turrets ? { turrets: s.turrets.map((t) => ({ ...t, x: t.x * kl })) } : {}),
    ...(s.guns ? { guns: s.guns.map((g) => (g.x !== undefined && (g.mount === 'hull' || g.mount === 'sponson') ? { ...g, x: g.x * kl } : g)) } : {}),
    ...(s.boxes ? { boxes: s.boxes.map((b) => ({ ...b, x: b.x * kl, length: b.length * kl })) } : {}),
    ...(s.addOns ? { addOns: s.addOns.map((a) => (a.on === 'hull' ? { ...a, at: [a.at[0] * kl, a.at[1], a.at[2] * ky], size: [a.size[0] * kl, a.size[1], a.size[2] * ky] } : a)) } : {}),
    ...(s.well ? { well: { ...s.well, rear: s.well.rear * kl, front: s.well.front * kl, ...(s.well.floor !== undefined ? { floor: s.well.floor * ky } : {}) } } : {}),
    ...(s.halftrack ? { halftrack: { ...s.halftrack, rear: s.halftrack.rear !== undefined ? s.halftrack.rear * kl : undefined, front: s.halftrack.front !== undefined ? s.halftrack.front * kl : undefined, fender: s.halftrack.fender !== undefined ? s.halftrack.fender * ky : undefined } } : {}),
    ...(s.bonnet !== undefined ? { bonnet: s.bonnet * kl } : {}),
    ...(s.overall !== undefined ? { overall: s.overall * kl } : {}),
    ...(s.overallFrom !== undefined ? { overallFrom: s.overallFrom * kl } : {}),
    ...(s.bogieAt ? { bogieAt: xs(s.bogieAt) } : {}),
  } as GroundSpec;
}

/** Scales the listed figures' hulls in place. */
export function fitHulls(G: Record<string, GroundSpec>): void {
  for (const [name, f] of Object.entries(HULL_FIT)) {
    const s = G[name];
    if (s) G[name] = scaleHull(s, f.kl ?? 1, f.ky ?? 1);
  }
}
