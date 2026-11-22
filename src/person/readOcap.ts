/**
 * An Arma 3 OCAP recording's hits on soldiers (a `.json` or `.json.gz` the
 * OCAP server or recorder writes; the layout is in `data/ocap.ts`).
 *
 * The recording keeps per hit who was hit, by whom, with which weapon and
 * magazine (`L85A3 [5.56 mm AP]`), and the distance; and per kill the same.
 * It has no hit zone, no damage and no loadout. Derived here: the calibre and
 * type from the magazine's name (or, where the install's catalogue lists the
 * magazine, from the ammunition it loads), the armour as an estimate where the
 * unit's role is a soldier class of the game (its default vest and helmet,
 * `armaGear.ts`), the angle against the way the victim faced
 * (both units' places at that frame, the victim's bearing), both units' speed,
 * and whether the victim's side won (the mission's end, where it names one).
 */

import { angleFromFacing, BlockBuilder, SRC_DERIVED, SRC_ESTIMATE, SRC_RECORDED, type PersonBlock, type PersonMatch } from './types';
import { armaMagazineFacts, armaRoleArmour } from './armaGear';
import { armaAmmo, classOfName, splitOcapWeapon } from './weapons';

interface Entity {
  id?: number;
  type?: string;
  name?: string;
  side?: string;
  isPlayer?: number;
  role?: string;
  startFrameNum?: number;
  positions?: unknown[];
}
interface Recording {
  captureDelay?: number;
  worldName?: string;
  missionName?: string;
  entities?: Entity[];
  events?: unknown[];
}

export function isOcapRecording(doc: unknown): doc is Recording {
  return !!doc && typeof doc === 'object' && !Array.isArray(doc) && Array.isArray((doc as Recording).entities) && Array.isArray((doc as Recording).events);
}

type Pos = { x: number; y: number; z: number; dir: number; alive: number };

/** A unit's state at a frame: its entry there, an empty entry repeating the last. */
function posAt(e: Entity, f: number): Pos | null {
  const list = e.positions ?? [];
  const k = Math.min(list.length - 1, f - (e.startFrameNum ?? 0));
  for (let j = k; j >= 0 && j > k - 600; j--) {
    const p = list[j] as unknown[] | undefined;
    if (!Array.isArray(p) || !p.length) continue;
    const xyz = p[0] as number[];
    if (!Array.isArray(xyz)) continue;
    return { x: xyz[0], y: xyz[1], z: xyz.length > 2 ? xyz[2] : NaN, dir: typeof p[1] === 'number' ? p[1] : NaN, alive: typeof p[2] === 'number' ? p[2] : 1 };
  }
  return null;
}

const SIDE: Record<string, string> = { WEST: 'BLUFOR', EAST: 'OPFOR', GUER: 'Independent', IND: 'Independent', CIV: 'Civilian' };

export function ocapHits(doc: Recording, match: PersonMatch): PersonBlock {
  const t0 = performance.now();
  const dt = typeof doc.captureDelay === 'number' && doc.captureDelay > 0 ? doc.captureDelay : 1;
  const byId = new Map<number, Entity>();
  for (const e of doc.entities ?? []) if (typeof e.id === 'number') byId.set(e.id, e);
  if (!match.map) match.map = doc.worldName ?? '';
  if (!match.mode) match.mode = doc.missionName ?? '';
  const events = (doc.events ?? []).filter((e): e is unknown[] => Array.isArray(e));
  // The winner, where the mission's end names a side.
  let winner = '';
  for (const e of events) if (e[1] === 'endMission' && Array.isArray(e[2]) && typeof e[2][0] === 'string') winner = SIDE[e[2][0]] ?? e[2][0];
  // Hits and kills on units, in order; a kill and a hit of the same shooter on the same unit within a frame are one hit.
  const b = new BlockBuilder(1024);
  const lastHit = new Map<string, { i: number; f: number }>();
  for (const e of events) {
    const kind = e[1];
    if (kind !== 'hit' && kind !== 'killed') continue;
    const f = Number(e[0]);
    const victim = byId.get(Number(e[2]));
    if (!victim || victim.type !== 'unit') continue;
    const by = Array.isArray(e[3]) ? (e[3] as unknown[]) : [];
    const shooter = typeof by[0] === 'number' ? byId.get(by[0]) : undefined;
    const text = typeof by[1] === 'string' ? by[1] : '';
    const metres = typeof e[4] === 'number' && e[4] >= 0 ? e[4] : NaN;
    const key = `${victim.id}|${shooter?.id ?? -1}`;
    if (kind === 'killed') {
      const had = lastHit.get(key);
      if (had && f - had.f <= 1) {
        b.cols.int.kill[had.i] = 1;
        continue;
      }
    }
    const i = b.row();
    const { num: N, int: I, src: S } = b.cols;
    N.time[i] = f * dt;
    I.game[i] = 3;
    b.text(i, 'victim', victim.name ?? '');
    b.text(i, 'shooter', shooter?.name ?? (by[0] === 'null' ? 'unknown' : ''));
    const vSide = SIDE[victim.side ?? ''] ?? victim.side ?? '';
    const sSide = shooter ? (SIDE[shooter.side ?? ''] ?? shooter.side ?? '') : '';
    b.text(i, 'victimSide', vSide);
    b.text(i, 'shooterSide', sSide);
    I.team[i] = vSide && vSide === sSide ? 1 : 0;
    b.text(i, 'victimRole', victim.role ?? '');
    // The armour: the default vest and helmet of the game's soldier of that role and side (an estimate: no loadout recorded).
    const arm = armaRoleArmour(victim.side ?? '', victim.role ?? '');
    if (arm) {
      b.text(i, 'armor', [arm.vest, arm.helmet].filter(Boolean).join(' + ') || 'none');
      S.armor[i] = SRC_ESTIMATE;
    }
    I.kill[i] = kind === 'killed' ? 1 : 0;
    S.kill[i] = SRC_RECORDED;
    if (kind === 'hit') lastHit.set(key, { i, f });
    // The weapon and its magazine.
    const { weapon, magazine } = splitOcapWeapon(text);
    if (weapon) {
      b.text(i, 'weapon', weapon);
      S.weapon[i] = SRC_RECORDED;
      b.text(i, 'ammo', magazine);
      b.text(i, 'weaponClass', classOfName(weapon));
      const a = armaAmmo(magazine, weapon);
      const facts = armaMagazineFacts(magazine);
      if (a && Number.isFinite(a.calibre)) {
        N.calibre[i] = a.calibre;
        S.calibre[i] = SRC_DERIVED;
        b.text(i, 'ammoType', a.ammoType || facts?.ammoType || '');
      } else if (facts && Number.isFinite(facts.calibre)) {
        // The install's catalogue: the magazine's ammunition, its calibre in its class name.
        N.calibre[i] = facts.calibre;
        S.calibre[i] = SRC_DERIVED;
        b.text(i, 'ammoType', a?.ammoType || facts.ammoType);
      } else if (a) b.text(i, 'ammoType', a.ammoType);
    }
    if (Number.isFinite(metres)) {
      N.distance[i] = metres;
      S.distance[i] = SRC_RECORDED;
    }
    const vp = posAt(victim, f), sp = shooter ? posAt(shooter, f) : null;
    if (vp) {
      N.x[i] = vp.x;
      N.y[i] = vp.y;
      N.z[i] = vp.z;
      const before = posAt(victim, f - Math.max(1, Math.round(1 / dt)));
      if (before) {
        const sp1 = Math.hypot(vp.x - before.x, vp.y - before.y) / Math.max(dt, Math.round(1 / dt) * dt);
        N.victimSpeed[i] = sp1;
        b.text(i, 'victimState', sp1 < 0.5 ? 'standing' : sp1 < 3 ? 'walking' : sp1 < 8 ? 'running' : 'in a vehicle');
        S.victimMove[i] = SRC_DERIVED;
      }
    }
    if (vp && sp && Number.isFinite(vp.dir)) {
      // A bearing: 0 north, clockwise; north is +y, east +x.
      const r = (vp.dir * Math.PI) / 180;
      N.angle[i] = angleFromFacing(Math.sin(r), Math.cos(r), sp.x - vp.x, sp.y - vp.y);
      if (Number.isFinite(sp.z) && Number.isFinite(vp.z)) N.elevation[i] = (Math.atan2(sp.z - vp.z, Math.hypot(sp.x - vp.x, sp.y - vp.y)) * 180) / Math.PI;
      if (Number.isFinite(N.angle[i])) S.angle[i] = SRC_DERIVED;
      if (!Number.isFinite(metres)) {
        N.distance[i] = Math.hypot(sp.x - vp.x, sp.y - vp.y, Number.isFinite(sp.z - vp.z) ? sp.z - vp.z : 0);
        S.distance[i] = SRC_DERIVED;
      }
    }
    if (shooter && sp) {
      const before = posAt(shooter, f - Math.max(1, Math.round(1 / dt)));
      if (before) {
        const s1 = Math.hypot(sp.x - before.x, sp.y - before.y) / Math.max(dt, Math.round(1 / dt) * dt);
        N.shooterSpeed[i] = s1;
        b.text(i, 'shooterState', s1 < 0.5 ? 'standing' : s1 < 3 ? 'walking' : s1 < 8 ? 'running' : 'in a vehicle');
        S.shooterMove[i] = SRC_DERIVED;
      }
    }
    if (winner && vSide) I.won[i] = vSide === winner ? 1 : 0;
  }
  match.game = 'arma3';
  return b.done(match, events.length, performance.now() - t0);
}
