/**
 * Turret places fitted to the War Thunder reference. Where public sources do not fix a turret's place along the hull,
 * the figure may be fitted to the reference silhouette (the user's call, 2026-11-14): hits and events have to land on
 * the right spot of the vehicle. Each entry moves the figure's main turret, and the parts riding on it (cupola,
 * mantlet, bins), forward (+) or back (-) along the hull by that many metres from where its spec puts it; the guns on
 * the turret move with it. Found by measuring each figure with its turret at several places and keeping the one that
 * matched the side and turret-side views best; listed in sources.md as fitted to the WT reference.
 */

import type { GroundSpec } from '../ground';

export const TURRET_FIT: Record<string, number> = {
  'ab-41': 0.6,
  'bt-42': 0.45,
  'bt-5': 0.3,
  centurion: 0.3,
  hummel: -0.6,
  'ito-90m': -0.6,
  jagdpanther: -0.15,
  'landsverk-l60': 0.15,
  'm10-gmc': 0.3,
  'm16-mgmc': -0.3,
  'm22-locust': 0.3,
  m2a4: 0.3,
  'm8-scott': -0.15,
  'marder-iii': 0.15,
  'panther-d': -0.45,
  'sdkfz-222': 0.3,
  'sdkfz-251-21': -0.15,
  'sidam-25': -0.6,
  'su-100p': 0.3,
  'su-76m': 0.15,
  't-80-light': -0.45,
  t20: 0.45,
  't34-heavy': 0.15,
  'type-1-chi-he': 0.45,
  'type-97-chi-ha-kai': 0.45,
};

/** Moves the listed figures' turrets in place (a part rides the turret when it stands at the turret's own place and height). */
export function fitTurrets(G: Record<string, GroundSpec>): void {
  for (const [name, dx] of Object.entries(TURRET_FIT)) {
    const s = G[name];
    const t = s?.turret;
    if (!s || !t) continue;
    const rides = (q: { x: number; up?: number }) => q.x === t.x && (q.up ?? 0) === (t.up ?? 0);
    G[name] = { ...s, turret: { ...t, x: t.x + dx }, turrets: s.turrets?.map((q) => (rides(q) ? { ...q, x: q.x + dx } : q)) };
  }
}
