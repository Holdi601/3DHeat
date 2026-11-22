/**
 * A VALORANT match's hits on players from Riot's esports game data (one
 * `.json` or `.json.gz` per map: a list of events - snapshots of every
 * player about once a second, `damageEvent`, `playerDied`, rounds decided).
 *
 * Per hit the file records where it landed (head, body, legs), its damage,
 * whether it killed and - in newer files - its weapon and whether it went
 * through a wall. The snapshots give the shields worn, both players' places,
 * the way the victim faced and their speed: distance and angle are derived
 * from them (positions are centimetres). The shield's share is the game's
 * rule, checked on the snapshots: a shield takes two thirds of each hit
 * until it is gone, each point of it a point of health kept.
 */

import { angleFromFacing, BlockBuilder, hitGroupOf, SRC_DERIVED, SRC_RECORDED, type PersonBlock, type PersonMatch } from './types';
import { valorantWeapon } from './weapons';

/** The shield's share of a hit. */
export const SHIELD_SHARE = 2 / 3;

type Id = { value?: number } | undefined;
type Vec = { x?: number; y?: number; z?: number } | undefined;
interface Fallback {
  fallback?: { guid?: string; displayName?: string };
}
interface AliveState {
  health?: number;
  armor?: number;
  position?: Vec;
  viewVector?: Vec;
  velocity?: Vec;
  equippedItem?: { displayName?: string; guid?: string };
}
interface SnapPlayer {
  playerId?: Id;
  aliveState?: AliveState | null;
  inventory?: { displayName?: string; guid?: string }[];
  timeseries?: { timestamp?: { omittingPauses?: string }; position?: Vec; viewVector?: Vec; velocity?: Vec }[];
}
interface Event {
  metadata?: { eventTime?: { omittingPauses?: string }; gameVersion?: string; wallTime?: string; currentGamePhase?: { roundNumber?: number } };
  snapshot?: { players?: SnapPlayer[] };
  configuration?: {
    teams?: { teamId?: Id; name?: string; playersInTeam?: Id[] }[];
    players?: { playerId?: Id; displayName?: string; selectedAgent?: Fallback }[];
    selectedMap?: { fallback?: { displayName?: string; guid?: string } };
  };
  damageEvent?: { location?: string; causerId?: Id; victimId?: Id; damageAmount?: number; damageDealt?: number; killEvent?: boolean; wallPen?: boolean; weapon?: Fallback; ability?: Fallback; hazard?: unknown };
  roundStarted?: { roundNumber?: number };
  roundDecided?: { result?: { roundNumber?: number; winningTeam?: Id } };
  gameDecided?: unknown;
}

/** Whether a parsed file is a VALORANT game data list. */
export function isValorantGame(doc: unknown): doc is Event[] {
  if (!Array.isArray(doc) || !doc.length) return false;
  for (let k = 0; k < Math.min(doc.length, 50); k++) {
    const e = doc[k] as Record<string, unknown> | null;
    if (e && typeof e === 'object' && ('platformGameId' in e || 'configuration' in e) && 'metadata' in e) return true;
  }
  return false;
}

const secs = (s: string | undefined): number => (s ? parseFloat(s) : NaN);

interface Track {
  t: number[];
  x: number[];
  y: number[];
  z: number[];
  fx: number[];
  fy: number[];
  speed: number[];
}

/** The last snapshot state of a player at or before a time: health, shields, and the most shields in the round. */
interface Life {
  t: number;
  health: number;
  armor: number;
  roundMax: number;
}

function at(tr: Track | undefined, t: number, within = 1.2): number {
  if (!tr || !tr.t.length) return -1;
  let lo = 0, hi = tr.t.length - 1;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (tr.t[mid] < t) lo = mid + 1;
    else hi = mid;
  }
  if (lo > 0 && Math.abs(tr.t[lo - 1] - t) <= Math.abs(tr.t[lo] - t)) lo--;
  return Math.abs(tr.t[lo] - t) <= within ? lo : -1;
}

export function valorantHits(doc: Event[], match: PersonMatch): PersonBlock {
  const t0 = performance.now();
  const names = new Map<number, string>();
  const teamOf = new Map<number, number>();
  const teamName = new Map<number, string>();
  const guidName = new Map<string, string>();
  const tracks = new Map<number, Track>();
  /** What each player held at each snapshot: the weapon of a hit whose event does not name one (older files). */
  const held = new Map<number, { t: number[]; name: string[] }>();
  const track = (id: number): Track => {
    let tr = tracks.get(id);
    if (!tr) tracks.set(id, (tr = { t: [], x: [], y: [], z: [], fx: [], fy: [], speed: [] }));
    return tr;
  };
  const push = (id: number, t: number, p: Vec, f: Vec, v: Vec) => {
    if (!p || !Number.isFinite(t)) return;
    const tr = track(id);
    if (tr.t.length && t <= tr.t[tr.t.length - 1]) return;
    tr.t.push(t);
    tr.x.push(p.x ?? NaN);
    tr.y.push(p.y ?? NaN);
    tr.z.push(p.z ?? NaN);
    tr.fx.push(f?.x ?? NaN);
    tr.fy.push(f?.y ?? NaN);
    tr.speed.push(v ? Math.hypot(v.x ?? 0, v.y ?? 0) / 100 : NaN);
  };
  // First pass: who is who, the weapons' names, every player's places.
  for (const e of doc) {
    if (e.configuration) {
      for (const p of e.configuration.players ?? []) if (p.playerId?.value !== undefined) names.set(p.playerId.value, (p.displayName ?? '').trim() || `player ${p.playerId.value}`);
      for (const tm of e.configuration.teams ?? []) {
        if (tm.teamId?.value === undefined) continue;
        teamName.set(tm.teamId.value, tm.name ?? String(tm.teamId.value));
        for (const p of tm.playersInTeam ?? []) if (p?.value !== undefined) teamOf.set(p.value, tm.teamId.value);
      }
      if (!match.map) match.map = e.configuration.selectedMap?.fallback?.displayName ?? '';
    }
    if (!match.gameVersion && e.metadata?.gameVersion) match.gameVersion = e.metadata.gameVersion;
    if (!Number.isFinite(match.started) && e.metadata?.wallTime) match.started = Date.parse(e.metadata.wallTime);
    const snap = e.snapshot;
    if (!snap?.players?.length) continue;
    const t = secs(e.metadata?.eventTime?.omittingPauses);
    for (const p of snap.players) {
      const id = p.playerId?.value;
      if (id === undefined) continue;
      for (const it of p.inventory ?? []) if (it.guid && it.displayName) guidName.set(it.guid.toUpperCase(), it.displayName);
      const a = p.aliveState;
      if (a?.equippedItem?.guid && a.equippedItem.displayName) guidName.set(a.equippedItem.guid.toUpperCase(), a.equippedItem.displayName);
      if (a?.equippedItem?.displayName && Number.isFinite(t)) {
        let h = held.get(id);
        if (!h) held.set(id, (h = { t: [], name: [] }));
        h.t.push(t);
        h.name.push(a.equippedItem.displayName);
      }
      if (p.timeseries?.length) for (const s of p.timeseries) push(id, secs(s.timestamp?.omittingPauses), s.position, s.viewVector, s.velocity);
      else if (a) push(id, t, a.position, a.viewVector, a.velocity);
    }
  }
  // Second pass: the hits, in order, with each victim's health and shields carried from snapshot to snapshot.
  const life = new Map<number, Life>();
  const b = new BlockBuilder(1024);
  let round = 0;
  const roundOfRow: number[] = [];
  const winners = new Map<number, number>();
  for (const e of doc) {
    const t = secs(e.metadata?.eventTime?.omittingPauses);
    if (e.roundStarted) {
      round = typeof e.roundStarted.roundNumber === 'number' ? e.roundStarted.roundNumber : round + 1;
      for (const l of life.values()) l.roundMax = 0;
    }
    const rn = e.metadata?.currentGamePhase?.roundNumber;
    if (typeof rn === 'number' && rn > round) round = rn;
    if (e.roundDecided?.result) {
      const r = e.roundDecided.result.roundNumber ?? round;
      if (e.roundDecided.result.winningTeam?.value !== undefined) winners.set(r, e.roundDecided.result.winningTeam.value);
    }
    if (e.snapshot?.players?.length) {
      for (const p of e.snapshot.players) {
        const id = p.playerId?.value;
        const a = p.aliveState;
        if (id === undefined || !a || typeof a.health !== 'number') continue;
        const armor = typeof a.armor === 'number' ? a.armor : 0;
        const l = life.get(id);
        life.set(id, { t, health: a.health, armor, roundMax: Math.max(l?.roundMax ?? 0, armor) });
      }
      continue;
    }
    const d = e.damageEvent;
    if (!d) continue;
    const victim = d.victimId?.value, causer = d.causerId?.value;
    if (victim === undefined) continue;
    const i = b.row();
    roundOfRow.push(round);
    const { num: N, int: I, src: S } = b.cols;
    N.time[i] = t;
    I.game[i] = 2;
    I.round[i] = round;
    b.text(i, 'victim', names.get(victim) ?? `player ${victim}`);
    b.text(i, 'shooter', causer !== undefined ? (names.get(causer) ?? `player ${causer}`) : 'world');
    const vTeam = teamOf.get(victim), sTeam = causer !== undefined ? teamOf.get(causer) : undefined;
    b.text(i, 'victimSide', vTeam !== undefined ? (teamName.get(vTeam) ?? '') : '');
    b.text(i, 'shooterSide', sTeam !== undefined ? (teamName.get(sTeam) ?? '') : '');
    I.team[i] = vTeam !== undefined && vTeam === sTeam ? 1 : 0;
    I.hitgroup[i] = hitGroupOf(d.location ?? '');
    S.hitgroup[i] = d.location ? SRC_RECORDED : 0;
    I.kill[i] = typeof d.killEvent === 'boolean' ? (d.killEvent ? 1 : 0) : -1;
    S.kill[i] = typeof d.killEvent === 'boolean' ? SRC_RECORDED : 0;
    if (typeof d.wallPen === 'boolean') {
      I.penetrated[i] = d.wallPen ? 1 : 0;
      S.penetration[i] = SRC_RECORDED;
    }
    // The damage: the whole hit is recorded; shields take two thirds of it until they are gone.
    const total = typeof d.damageAmount === 'number' ? d.damageAmount : NaN;
    const l = life.get(victim);
    if (Number.isFinite(total) && l) {
      const armorLost = Math.max(0, Math.min(l.armor, total * SHIELD_SHARE));
      N.armorBefore[i] = l.armor;
      N.healthBefore[i] = l.health;
      N.armorDamage[i] = armorLost;
      N.absorbed[i] = armorLost;
      N.damage[i] = total - armorLost;
      const dealt = typeof d.damageDealt === 'number' ? d.damageDealt : NaN;
      N.damageRaw[i] = Number.isFinite(dealt) ? dealt - armorLost : NaN;
      S.damage[i] = SRC_DERIVED;
      S.absorbed[i] = SRC_DERIVED;
      const kind = l.roundMax >= 40 ? 'heavy shield' : l.roundMax >= 20 ? 'light shield' : l.roundMax > 0 ? 'regen shield' : 'none';
      b.text(i, 'armor', l.armor > 0 || kind === 'none' ? kind : `${kind} (spent)`);
      S.armor[i] = SRC_DERIVED;
      l.armor -= armorLost;
      l.health = Math.max(0, l.health - (total - armorLost));
    } else if (Number.isFinite(total)) {
      N.damage[i] = total;
      S.damage[i] = SRC_RECORDED;
    }
    // The weapon: the event's (newer files), else what the shooter held.
    const guid = d.weapon?.fallback?.guid?.toUpperCase();
    let weapon = (d.weapon?.fallback?.displayName || (guid ? guidName.get(guid) : '')) ?? '';
    if (d.ability) weapon = 'ability';
    else if (d.hazard) weapon = 'hazard';
    let weaponSrc = weapon ? SRC_RECORDED : 0;
    // Older files: what the shooter held at the snapshot before the hit (not for ability damage, `GENERAL`).
    if (!weapon && causer !== undefined && causer !== victim && d.location && d.location !== 'GENERAL') {
      const h = held.get(causer);
      if (h) {
        let k = -1;
        for (let lo = 0, hi = h.t.length - 1; lo <= hi; ) {
          const mid = (lo + hi) >> 1;
          if (h.t[mid] <= t) {
            k = mid;
            lo = mid + 1;
          } else hi = mid - 1;
        }
        if (k >= 0 && t - h.t[k] <= 1.5) {
          weapon = h.name[k];
          weaponSrc = SRC_DERIVED;
        }
      }
    }
    if (weapon) {
      b.text(i, 'weapon', weapon);
      S.weapon[i] = weaponSrc;
      const f = valorantWeapon(weapon);
      b.text(i, 'weaponClass', weapon === 'ability' ? 'ability' : weapon === 'hazard' ? 'hazard' : f.cls);
      b.text(i, 'ammoType', weapon === 'ability' ? 'ability' : f.ammoType);
    }
    // Places: distance, angle, speeds.
    const vt = tracks.get(victim), st = causer !== undefined ? tracks.get(causer) : undefined;
    const vk = at(vt, t), sk = at(st, t);
    if (vk >= 0) {
      N.x[i] = vt!.x[vk];
      N.y[i] = vt!.y[vk];
      N.z[i] = vt!.z[vk];
      N.victimSpeed[i] = vt!.speed[vk];
      if (Number.isFinite(vt!.speed[vk])) {
        b.text(i, 'victimState', vt!.speed[vk] < 0.5 ? 'standing' : vt!.speed[vk] < 3.5 ? 'walking' : 'running');
        S.victimMove[i] = SRC_DERIVED;
      }
    }
    if (sk >= 0) {
      N.shooterSpeed[i] = st!.speed[sk];
      if (Number.isFinite(st!.speed[sk])) {
        b.text(i, 'shooterState', st!.speed[sk] < 0.5 ? 'standing' : st!.speed[sk] < 3.5 ? 'walking' : 'running');
        S.shooterMove[i] = SRC_DERIVED;
      }
    }
    if (vk >= 0 && sk >= 0 && causer !== victim) {
      const dx = st!.x[sk] - vt!.x[vk], dy = st!.y[sk] - vt!.y[vk], dz = st!.z[sk] - vt!.z[vk];
      N.distance[i] = Math.hypot(dx, dy, dz) / 100;
      S.distance[i] = SRC_DERIVED;
      N.angle[i] = angleFromFacing(vt!.fx[vk], vt!.fy[vk], dx, dy);
      N.elevation[i] = (Math.atan2(dz, Math.hypot(dx, dy)) * 180) / Math.PI;
      if (Number.isFinite(N.angle[i])) S.angle[i] = SRC_DERIVED;
    }
  }
  // Won: the victim's team won the round.
  for (let i = 0; i < b.n; i++) {
    const w = winners.get(roundOfRow[i]);
    const side = b.dicts.victimSide.list[b.cols.txt.victimSide[i]];
    if (w !== undefined && side) b.cols.int.won[i] = teamName.get(w) === side ? 1 : 0;
  }
  match.game = 'valorant';
  return b.done(match, doc.length, performance.now() - t0);
}
