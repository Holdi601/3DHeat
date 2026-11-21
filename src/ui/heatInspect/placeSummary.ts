/**
 * What a hot spot is made of, in plain words: the rows under the pick (the
 * heat stack, `render/heatStack.ts`) tallied by what happened, by which unit,
 * with which weapon and by whom, each weighed by what it adds to the heat
 * there. Names are the data's own plain ones where it has them (a short
 * vehicle name beside the id), else the game's unit catalogue's
 * (`figures/unitcatalog.ts`), else the id made readable.
 *
 * Runs once a stack is read, over its rows only (a few thousand at most):
 * never on the frame path.
 */

import { CANON } from '../../data/canonical';
import { catalogName } from '../../figures/unitcatalog';
import { weaponColumn } from '../../breakdown/breakdownRun';
import type { AttributeColumn, Dataset } from '../../state/types';

export interface Share {
  label: string;
  /** Of the heat of the rows that say it, 0..1. */
  share: number;
  rows: number;
}

export interface PlaceSummary {
  rows: number;
  matches: number;
  units: number;
  events: Share[];
  vehicles: Share[];
  weapons: Share[];
  people: Share[];
  teams: Share[];
  /** Kill rows here, and death rows here; null where the data logs no deaths (they are its kills' victims). */
  kills: number;
  deaths: number | null;
}

const MISSING = /^(|nan|null|none|-|—|n\/a|undefined)$/i;
const VEHICLE_NAME = /^(vehicle.?short.?name|short.?name|unit.?short.?name|display.?name|unit.?display.?name)$/i;
const VEHICLE_ID = /^(vehicle|unit|unit.?type|vehicle.?type|aircraft|plane|tank|ship)$/i;
const WEAPON_NAME = /^(weapon.?name|ammo.?name|weapon.?display.?name)$/i;
const AMMO_ID = /^(ammo|ammo.?type|shell|hit.?shell|projectile)$/i;
const RAW_EVENT = /^(event|event.?name|type)$/i;

const cat = (ds: Dataset, re: RegExp): AttributeColumn | null => ds.attrs.find((a) => a.kind === 'category' && !!a.categories && re.test(a.name)) ?? null;

/** An id made readable: the catalogue's name, else words for its underscores ("88mm_pzgr_39" -> "88 mm pzgr 39"). */
export function plainName(raw: string): string {
  const s = raw.trim();
  if (!s) return s;
  const hit = catalogName(s) || catalogName(s.replace(/_(sm|\d+)$/i, ''));
  if (hit) return hit;
  if (!/[_]/.test(s)) return s;
  return s.replace(/_/g, ' ').replace(/(\d)(mm|cm)\b/gi, '$1 $2').replace(/\s+/g, ' ').trim();
}

class Tally {
  private w = new Map<string, [number, number]>();
  private total = 0;
  add(label: string, weight: number): void {
    if (MISSING.test(label.trim())) return;
    const e = this.w.get(label);
    if (e) {
      e[0] += weight;
      e[1]++;
    } else this.w.set(label, [weight, 1]);
    this.total += weight;
  }
  top(n: number): Share[] {
    if (!(this.total > 0)) return [];
    return [...this.w].sort((a, b) => b[1][0] - a[1][0]).slice(0, n).map(([label, [w, rows]]) => ({ label, share: w / this.total, rows }));
  }
}

/** The tally of a stack's rows (`rows`, each adding `contrib` to the heat there). */
export function summarisePlace(ds: Dataset, rows: ArrayLike<number>, contrib: ArrayLike<number>, top = 3): PlaceSummary {
  const canon = cat(ds, new RegExp(`^${CANON.event}$`));
  const raw = ds.attrs.find((a) => a !== canon && a.kind === 'category' && !!a.categories && RAW_EVENT.test(a.name)) ?? null;
  const vName = cat(ds, VEHICLE_NAME);
  const vId = vName ? null : cat(ds, VEHICLE_ID);
  const wName = cat(ds, WEAPON_NAME);
  const wId = weaponColumn(ds) ?? cat(ds, AMMO_ID);
  const events = new Tally(), vehicles = new Tally(), weapons = new Tally(), people = new Tally(), teams = new Tally();
  const matches = new Set<number>(), units = new Set<number>();
  let kills = 0, deaths = 0;
  const died = new Set<string>();
  const label = (a: AttributeColumn | null, r: number) => (a ? (a.categories![a.data[r]] ?? '') : '');
  const named = new Map<string, string>();
  const nice = (s: string) => {
    let v = named.get(s);
    if (v === undefined) named.set(s, (v = plainName(s)));
    return v;
  };
  for (let i = 0; i < rows.length; i++) {
    const r = rows[i];
    const w = Math.abs(contrib[i]) || 0;
    const cls = label(canon, r);
    const ev = label(raw, r);
    if (cls === 'kill') kills++;
    else if (cls === 'death') {
      // One death logged twice at the same moment (War Thunder's `dead` and `death`) counts once.
      const key = `${ds.personId ? ds.personId[r] : -1}:${ds.sessionId ? ds.sessionId[r] : 0}:${ds.time ? Math.round(ds.time[r]) : r}`;
      if (!died.has(key)) {
        died.add(key);
        deaths++;
      }
    }
    // The class and, where the game's own word differs, that word: "damage (fire on)".
    const evLabel = cls && ev && ev.toLowerCase() !== cls ? `${cls} (${ev.replace(/_/g, ' ')})` : cls || ev.replace(/_/g, ' ');
    events.add(evLabel, w);
    const v = vName ? label(vName, r) : vId ? nice(label(vId, r)) : '';
    if (v) vehicles.add(v, w);
    const wn = wName ? label(wName, r) : '';
    const wp = wn && !MISSING.test(wn.trim()) ? wn : wId ? nice(label(wId, r)) : '';
    if (wp) weapons.add(wp, w);
    if (ds.personId) {
      const p = ds.personId[r];
      units.add(p);
      people.add(ds.personLabels[p] ?? '', w);
    }
    if (ds.teamId) teams.add(ds.teamLabels[ds.teamId[r]] ?? '', w);
    if (ds.sessionId) matches.add(ds.sessionId[r]);
  }
  // No death rows at all in the data: its deaths are the victims of its kills, not rows of their own.
  const logsDeaths = !!canon?.categories?.includes('death');
  return {
    rows: rows.length,
    matches: ds.sessionId ? matches.size : 1,
    units: units.size,
    events: events.top(top),
    vehicles: vehicles.top(top),
    weapons: weapons.top(top),
    people: people.top(top),
    teams: teams.top(top),
    kills,
    deaths: logsDeaths ? deaths : null,
  };
}
