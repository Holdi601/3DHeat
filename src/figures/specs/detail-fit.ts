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

export const GROUND_DETAIL_FIT: Record<string, GroundDetailFit> = {};

export const AIR_DETAIL_FIT: Record<string, AirDetailFit> = {};

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
    if ((f.cu ?? 0) > 0) add.push({ on: 'turret', kind: 'drum', at: [t.length * (f.cx ?? -0.15), 0, roof + f.cu! / 2 - 0.03], size: [0.7, 0.7, f.cu! + 0.06] });
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
