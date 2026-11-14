/**
 * Turret places and sizes fitted to the War Thunder reference. Where public sources do not fix a turret's place or
 * size, the figure may be fitted to the reference silhouette (the user's call, 2026-11-14): hits and events have to
 * land on the right spot of the vehicle. A number moves the figure's main turret, and the parts riding on it (cupola,
 * mantlet, bins), forward (+) or back (-) along the hull by that many metres from where its spec puts it; the guns on
 * the turret move with it. An object may also raise (+) or lower (-) it by dy metres, and scale the turret's body
 * about its centre: kl its length, kw its width, kh its height, the parts on it scaled with it. Found by measuring
 * each figure with its turret at several places, heights and sizes and keeping the one that matched the side and
 * turret-side views best; listed in sources.md as fitted to the WT reference.
 */

import type { GroundSpec, TurretSpec } from '../ground';

/** A turret's fitted place (metres along the hull) and body scale. */
export interface TurretFit {
  dx?: number;
  dy?: number;
  kl?: number;
  kw?: number;
  kh?: number;
}

export const TURRET_FIT: Record<string, number | TurretFit> = {
  'a13-cruiser': { dx: 0.3, kh: 1.1 },
  'ab-41': { dx: 0.6, kl: 0.9 },
  'amx-10p': -0.45,
  'amx-50': -0.15,
  'asu-85': { kh: 0.9 },
  'b1-bis': 0.3,
  'bmp-1': { kl: 1.1 },
  'bt-42': { dx: 0.45, kl: 0.9 },
  'bt-5': { dx: 0.3, kl: 0.81 },
  'bt-7': 0.15,
  'btr-152a': 0.45,
  'cckw-m45': { kh: 1.1 },
  centurion: { dx: 0.3, dy: -0.08, kl: 0.9 },
  'challenger-2': { kh: 1.1 },
  charioteer: 0.15,
  'crusader-aa': { kh: 0.9 },
  'crusader-ii': { kl: 1.1, kh: 0.81 },
  'crusader-iii': { kh: 0.9 },
  'fiat-6616': { kl: 1.1 },
  'fiat-m13-40': { kl: 0.9 },
  hummel: -0.6,
  'is-2': { kl: 1.1 },
  'is-2-1943': { kl: 1.1 },
  'ito-90m': { dx: -0.6, kh: 1.21 },
  jagdpanther: -0.15,
  jagdtiger: { kl: 0.9 },
  kugelblitz: { kh: 0.9 },
  'l-62-anti-ii': 0.15,
  'landsverk-l60': 0.15,
  'lvt-a1': { kh: 0.9 },
  'm-51': { dy: 0.08 },
  'm10-gmc': { dx: 0.3, kl: 1.21 },
  m109: { dy: -0.08, kh: 0.81 },
  m109a1: { kh: 0.9 },
  'm16-mgmc': -0.3,
  'm22-locust': 0.3,
  m2a4: { dx: 0.3, kl: 0.9 },
  'm3-lee': { kl: 0.9 },
  'm3-stuart': { dy: -0.08, kh: 1.1 },
  'm4-t26': -0.3,
  m41: { kl: 1.1 },
  'm42-duster': { dx: 0.45, kh: 1.1 },
  m44: { dx: 0.3, kl: 1.1 },
  'm46-patton': { kl: 1.1 },
  'm4a3-105': { dy: 0.08 },
  'm53-59': -0.45,
  'm56-scorpion': { dx: 0.15, kh: 0.9 },
  'm5a1-stuart': { kl: 0.9 },
  'm8-greyhound': { kh: 0.9 },
  'm8-scott': -0.15,
  'marder-iii': { dx: 0.15, dy: -0.08 },
  'marmon-herrington-vi-2pdr': { kl: 1.1 },
  'matilda-ii': { kl: 0.9 },
  nashorn: { kh: 1.1 },
  ostwind: { kl: 1.21 },
  'p-40': { dx: 0.3, kh: 0.9 },
  'panther-a': { kl: 1.1 },
  'panther-d': { dx: -0.45, kl: 1.1 },
  'panther-f': { kl: 1.1 },
  'pbv-301': { dx: -0.45, kh: 1.1 },
  'pvkv-iii': { dx: -0.3, kh: 1.1 },
  'pvkv-iv': { kh: 0.9 },
  'pz-35t': { kl: 0.9 },
  'pz-38t': { kl: 0.9 },
  'pz-iii-h': { dy: -0.08 },
  'pz-iv-e': { kh: 0.9 },
  'pz-iv-f1': { dy: -0.08, kl: 1.331 },
  'pz-iv-f2': { dy: -0.08 },
  'pz-sfl-ic': 0.15,
  ratel: { dx: 0.3, kl: 1.1 },
  'rooikat-za-35': { dx: 0.3, kl: 1.1 },
  'sav-m43': { kh: 1.1 },
  'sdkfz-222': 0.3,
  'sdkfz-234-puma': { kh: 0.9 },
  'sdkfz-251-21': { dx: -0.15, dy: 0.08 },
  'sidam-25': { dx: -0.6, kl: 1.21 },
  skink: -0.3,
  'spj-fm43-44': -0.3,
  'strv-m40l': { dy: -0.08 },
  'strv-m42': { kl: 1.21 },
  'stug-iii-d': -0.3,
  'su-100': { dy: -0.08 },
  'su-100p': 0.3,
  'su-122': -0.15,
  'su-122-54': 0.3,
  'su-76m': 0.15,
  't-26': -0.3,
  't-34-1940': { kh: 0.9 },
  't-34-85': { kl: 1.1 },
  't-44': { dy: -0.08 },
  't-80-light': -0.45,
  't1e1-90': { dx: 0.3, kl: 0.9 },
  t20: 0.45,
  t29: { dy: -0.08 },
  't34-heavy': 0.15,
  tetrarch: { kl: 0.9 },
  'turan-i': { kl: 1.1 },
  'type-1-chi-he': { dx: 0.45, kh: 0.9 },
  'type-61': { dx: 0.3, kl: 1.1 },
  'type-97-chi-ha': { kl: 1.1 },
  'type-97-chi-ha-kai': 0.45,
  valentine: { kh: 0.9 },
  'valentine-archer': -0.3,
  'valentine-xi': { kl: 1.1 },
  'vk-3002m': { kl: 1.1 },
  'zerstorer-45': { kh: 1.21 },
};

/** The turret's body scaled about its centre: its plan, profile and section, and the gun's place on it. */
function scaled(t: TurretSpec, kl: number, kw: number, kh: number): TurretSpec {
  const o = t.outline;
  const sec = o?.sectionAbs && Array.isArray(o.section) && Array.isArray(o.section[0]) ? (o.section as [number, number][]).map(([h, k]): [number, number] => [h * kh, k]) : o?.section;
  return {
    ...t,
    length: t.length * kl,
    width: t.width * kw,
    height: t.height * kh,
    ...(t.gunX !== undefined ? { gunX: t.gunX * kl } : {}),
    outline: o && { ...o, section: sec, plan: o.plan.map(([x, w]): [number, number] => [x * kl, w * kw]), top: o.top.map(([x, y]): [number, number] => [x * kl, y * kh]), bottom: o.bottom?.map(([x, y]): [number, number] => [x * kl, y * kh]) },
  } as TurretSpec;
}

/** Moves and scales the listed figures' turrets in place (a part rides the turret when it stands at the turret's own place and height). */
export function fitTurrets(G: Record<string, GroundSpec>): void {
  for (const [name, fit] of Object.entries(TURRET_FIT)) {
    const s = G[name];
    const t = s?.turret;
    if (!s || !t) continue;
    const f: TurretFit = typeof fit === 'number' ? { dx: fit } : fit;
    const dx = f.dx ?? 0;
    const dy = f.dy ?? 0;
    const rides = (q: { x: number; up?: number }) => q.x === t.x && (q.up ?? 0) === (t.up ?? 0);
    const k = f.kl || f.kw || f.kh ? (q: TurretSpec) => ({ ...scaled(q, f.kl ?? 1, f.kw ?? 1, f.kh ?? 1), side: (q.side ?? 0) * (f.kw ?? 1) }) : (q: TurretSpec) => q;
    G[name] = { ...s, turret: { ...k(t), x: t.x + dx, up: (t.up ?? 0) + dy }, turrets: s.turrets?.map((q) => (rides(q) ? { ...k(q), x: q.x + dx, up: (q.up ?? 0) + dy } : q)) };
  }
}
