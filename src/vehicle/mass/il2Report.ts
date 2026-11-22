/**
 * IL-2 Sturmovik (Great Battles) mission reports for the mass analysis: the
 * text logs a server or the game writes with `mission_text_log = 1`
 * (`missionReport(<date>)[<n>].txt`, one mission in numbered pieces, read
 * together). Each line is `T:<tick> AType:<n> ...`, ticks at 50 a second.
 * What the hit analysis takes:
 *
 *   AType 0   mission start: its file, date, and each country's coalition
 *   AType 2   a hit: AMMO (the round, recorded), AID shooter, TID target
 *   AType 3   damage: DMG (share of the target's strength, recorded),
 *             AID, TID, POS (the target's place)
 *   AType 4   a kill: AID, TID, POS
 *   AType 10  a player's aircraft: its id, its pilot's, the player's name
 *   AType 12  an object: ID, TYPE (the aircraft, vehicle, bot or turret),
 *             COUNTRY, PID (the object it is part of: a bot's aircraft)
 *   AType 16, 17, 18  a bot gone, an object's new place, a bail-out
 *             (BOTID, PARENTID)
 *
 * A hit on a bot (`BotPilot_...`, `BotGunner_...`) is a hit on its aircraft's
 * crew: it counts on the aircraft, with the crew effects (`pilot` or
 * `gunner`, `crewKilled` on the bot's kill). The report has no hit point,
 * no way in and no speed: those stay unknown; a distance only where both
 * places were written within half a second of the hit (derived).
 */

import {
  allocColumns,
  EFFECT_BIT,
  FATAL_WINDOW,
  FLAG_ATTACKER_AI,
  FLAG_DIST,
  FLAG_VICTIM_AI,
  FLAG2_CALIBRE_NAMED,
  FLAG2_DAMAGE,
  FLAG2_RESULT_DERIVED,
  NONE16,
  NONE8,
  R_KILL,
  R_UNKNOWN,
  sliceColumns,
  type HitBlock,
  type HitMatch,
} from './types';
import { il2Ammo } from './ammo';

/** A mission report's file name: the mission's stamp and the piece's number. */
export const IL2_REPORT = /^missionReport\((.+?)\)\[(\d+)\]\.txt$/i;

const TICKS = 50;
/** Seconds after a hit within which a kill or bail-out is put down to it. */
const KILL_WINDOW = 60;
/** Seconds within which two places count as written at the same time (a distance worked out). */
const SAME_TIME = 0.5;

/** A line's fields: `Key:value` pairs (keys upper-cased), the value up to the next key; `POS(x,y,z)` as its own. */
export function il2Fields(line: string): Map<string, string> {
  const out = new Map<string, string>();
  const pos = /POS\(([^)]*)\)/.exec(line);
  if (pos) out.set('POS', pos[1]);
  const body = pos ? line.slice(0, pos.index) + line.slice(pos.index + pos[0].length) : line;
  const re = /([A-Za-z][A-Za-z0-9]*):/g;
  const keys: { k: string; at: number; end: number }[] = [];
  for (let m = re.exec(body); m; m = re.exec(body)) {
    // A key starts a word: a time's `14:30:0` or a list's `101:1,201:2` holds no key.
    if (m.index > 0 && !/\s/.test(body[m.index - 1])) continue;
    keys.push({ k: m[1].toUpperCase(), at: m.index, end: m.index + m[0].length });
  }
  for (let i = 0; i < keys.length; i++) out.set(keys[i].k, body.slice(keys[i].end, i + 1 < keys.length ? keys[i + 1].at : body.length).trim());
  return out;
}

const posOf = (s: string | undefined): [number, number, number] | null => {
  if (!s) return null;
  const v = s.split(',').map(Number);
  return v.length === 3 && v.every(Number.isFinite) ? [v[0], v[1], v[2]] : null;
};

class Dict {
  readonly list: string[] = [''];
  private readonly m = new Map<string, number>([['', 0]]);
  code(s: string): number {
    let c = this.m.get(s);
    if (c === undefined) {
      c = this.list.length;
      this.list.push(s);
      this.m.set(s, c);
    }
    return c;
  }
}

interface Obj {
  type: string;
  country: string;
  parent: string;
  player: string;
  at: [number, number, number] | null;
  atT: number;
}

/** The match a report says: its mission file, start and the stamp in its name. */
export function il2Match(text: string, fileName: string, index: number): HitMatch {
  const stamp = IL2_REPORT.exec(fileName)?.[1] ?? '';
  const m = /^(\d{4})-(\d{2})-(\d{2})_(\d{2})-(\d{2})-(\d{2})$/.exec(stamp);
  const first = /AType:0\b[^\n]*/.exec(text)?.[0] ?? '';
  const f = il2Fields(first);
  const file = (f.get('MFILE') ?? '').replace(/\\/g, '/');
  return {
    id: stamp || fileName.replace(/\.txt$/i, ''),
    file: index,
    map: file.split('/').slice(-1)[0]?.replace(/\.msnbin$|\.mission$/i, '') ?? '',
    mode: f.get('GTYPE') ?? '',
    started: m ? Date.UTC(+m[1], +m[2] - 1, +m[3], +m[4], +m[5], +m[6]) : NaN,
    gameVersion: '',
    converterVersion: '',
    winner: '',
  };
}

/** The coalition a country is in, by the mission start's `CNTRS` (`101:1,201:2`): IL-2's 1 is the Allies, 2 the Axis. */
function coalitions(cntrs: string): Map<string, string> {
  const out = new Map<string, string>();
  for (const p of cntrs.split(',')) {
    const [c, s] = p.split(':');
    if (c) out.set(c.trim(), s === '1' ? 'Allies' : s === '2' ? 'Axis' : s ? `side ${s.trim()}` : '');
  }
  return out;
}

/** The hits of one mission report (its pieces read together, in order). */
export function il2ReportHits(text: string, match: HitMatch): Omit<HitBlock, 'rows' | 'kept' | 'ms' | 'native'> {
  const lines = text.split(/\r?\n/);
  const objs = new Map<string, Obj>();
  let sides = new Map<string, string>();
  interface Hit { t: number; aid: string; tid: string; victim: string; ammo: string; crew: '' | 'pilot' | 'gunner'; dmg: number }
  const hits: Hit[] = [];
  const kills: { t: number; aid: string; tid: string }[] = [];
  const bails: { t: number; parent: string }[] = [];
  const root = (id: string): string => {
    let at = id;
    for (let k = 0; k < 8; k++) {
      const o = objs.get(at);
      if (!o || !o.parent || o.parent === '-1' || !objs.has(o.parent)) return at;
      at = o.parent;
    }
    return at;
  };
  const crewOf = (id: string): '' | 'pilot' | 'gunner' => {
    const ty = objs.get(id)?.type ?? '';
    return /^botpilot/i.test(ty) ? 'pilot' : /^botgunner|^botcrew/i.test(ty) ? 'gunner' : '';
  };
  const place = (id: string, p: [number, number, number] | null, t: number) => {
    const o = objs.get(id);
    if (o && p) {
      o.at = p;
      o.atT = t;
    }
  };
  for (const raw of lines) {
    const line = raw.trim();
    const tm = /^T:(\d+)\s+AType:(\d+)\s*/i.exec(line);
    if (!tm) continue;
    const t = Number(tm[1]) / TICKS;
    const a = Number(tm[2]);
    const rest = line.slice(tm[0].length);
    const f = il2Fields(rest);
    if (a === 0) {
      if (f.has('CNTRS')) sides = coalitions(f.get('CNTRS')!);
    } else if (a === 12) {
      const id = f.get('ID') ?? '';
      if (id) objs.set(id, { type: f.get('TYPE') ?? '', country: f.get('COUNTRY') ?? '', parent: f.get('PID') ?? '', player: objs.get(id)?.player ?? '', at: null, atT: NaN });
    } else if (a === 10) {
      const id = f.get('PLID') ?? '';
      const o = objs.get(id) ?? { type: f.get('TYPE') ?? '', country: f.get('COUNTRY') ?? '', parent: '', player: '', at: null, atT: NaN };
      o.player = f.get('NAME') ?? '';
      if (!o.type) o.type = f.get('TYPE') ?? '';
      objs.set(id, o);
      place(id, posOf(f.get('POS')), t);
    } else if (a === 2) {
      const aid = f.get('AID') ?? '-1', tid = f.get('TID') ?? '-1';
      if (tid === '-1' || !objs.has(tid)) continue;
      hits.push({ t, aid, tid, victim: root(tid), ammo: f.get('AMMO') ?? '', crew: crewOf(tid), dmg: 0 });
    } else if (a === 3) {
      const aid = f.get('AID') ?? '-1', tid = f.get('TID') ?? '-1';
      place(tid, posOf(f.get('POS')), t);
      // The damage of the hit of this tick by this shooter on this object.
      const dmg = Number(f.get('DMG'));
      for (let k = hits.length - 1; k >= 0 && hits[k].t >= t - 0.021; k--)
        if (hits[k].aid === aid && hits[k].tid === tid) {
          if (Number.isFinite(dmg)) hits[k].dmg += dmg;
          break;
        }
    } else if (a === 4) {
      kills.push({ t, aid: f.get('AID') ?? '-1', tid: f.get('TID') ?? '-1' });
      place(f.get('TID') ?? '', posOf(f.get('POS')), t);
    } else if (a === 17) place(f.get('ID') ?? '', posOf(f.get('POS')), t);
    else if (a === 16) place(f.get('BOTID') ?? '', posOf(f.get('POS')), t);
    else if (a === 18) bails.push({ t, parent: root(f.get('PARENTID') ?? f.get('BOTID') ?? '') });
  }

  // A hit on a bot counts on its aircraft: folded into the aircraft's hit of the same tick by the same shooter.
  const kept: Hit[] = [];
  const effectsOf: number[] = [];
  for (const h of hits) {
    if (h.crew) {
      let into = -1;
      for (let k = kept.length - 1; k >= 0 && kept[k].t >= h.t - 0.021; k--)
        if (kept[k].aid === h.aid && kept[k].victim === h.victim) {
          into = k;
          break;
        }
      const fx = EFFECT_BIT.crew | EFFECT_BIT[h.crew];
      if (into >= 0) {
        effectsOf[into] |= fx;
        continue;
      }
      kept.push(h);
      effectsOf.push(fx);
      continue;
    }
    kept.push(h);
    effectsOf.push(0);
  }

  const out = allocColumns(kept.length);
  const vehicles = new Dict(), players = new Dict(), teams = new Dict(), types = new Dict(), names = new Dict();
  const sideOf = (id: string) => sides.get(objs.get(id)?.country ?? '') ?? (objs.get(id)?.country ? `country ${objs.get(id)!.country}` : '');
  for (let i = 0; i < kept.length; i++) {
    const h = kept[i];
    const shooter = h.aid !== '-1' ? root(h.aid) : '';
    const v = objs.get(h.victim), s = shooter ? objs.get(shooter) : undefined;
    out.match[i] = 0;
    out.time[i] = h.t;
    out.victim[i] = vehicles.code(v?.type ?? '');
    out.attacker[i] = vehicles.code(s?.type ?? '');
    out.victimPlayer[i] = players.code(v?.player ?? '');
    out.attackerPlayer[i] = players.code(s?.player ?? '');
    out.victimTeam[i] = teams.code(sideOf(h.victim));
    out.attackerTeam[i] = teams.code(shooter ? sideOf(shooter) : '');
    out.part[i] = -1;
    out.lx[i] = out.ly[i] = out.lz[i] = NONE16;
    out.dx[i] = out.dy[i] = out.dz[i] = NONE8;
    out.yaw[i] = out.pitch[i] = NONE16;
    let flags = 0, flags2 = 0;
    // A distance where both places were written about the hit's time.
    const pa = s?.at, pv = v?.at;
    if (pa && pv && Math.abs(s!.atT - h.t) <= SAME_TIME && Math.abs(v!.atT - h.t) <= SAME_TIME) {
      const d = Math.hypot(pv[0] - pa[0], pv[1] - pa[1], pv[2] - pa[2]);
      out.dist[i] = Math.min(0xfffe, Math.round(d * 4));
      out.dh[i] = Math.max(-32767, Math.min(32767, Math.round((pv[1] - pa[1]) * 4)));
      flags |= FLAG_DIST;
    } else {
      out.dist[i] = 0xffff;
      out.dh[i] = NONE16;
    }
    const ammo = il2Ammo(h.ammo);
    out.calibre[i] = ammo.calibre !== null ? Math.min(65535, Math.round(ammo.calibre * 10)) : 0;
    out.ammoType[i] = Math.min(65535, types.code(ammo.type || ammo.kind));
    out.ammoName[i] = Math.min(65535, names.code(ammo.name));
    if (ammo.src !== 'unknown') flags2 |= FLAG2_CALIBRE_NAMED;
    if (h.dmg > 0) {
      out.damage[i] = Math.min(65535, Math.round(h.dmg * 1000));
      flags2 |= FLAG2_DAMAGE;
    }
    out.result[i] = R_UNKNOWN;
    out.effects[i] = effectsOf[i];
    // No player in the aircraft (no AType 10 for it): the AI flew it.
    if (s && !s.player) flags |= FLAG_ATTACKER_AI;
    if (v && !v.player) flags |= FLAG_VICTIM_AI;
    out.flags[i] = flags;
    out.flags2[i] = flags2;
  }

  // Kills: of the aircraft (lethal, the killer's last hit the killing shot) or of a bot (its crew killed).
  const byVictim = new Map<string, number[]>();
  kept.forEach((h, i) => {
    let l = byVictim.get(h.victim);
    if (!l) byVictim.set(h.victim, (l = []));
    l.push(i);
  });
  const lastBefore = (victim: string, t: number, aid: string | null): number => {
    let best = -1;
    for (const i of byVictim.get(victim) ?? []) {
      if (kept[i].t > t + 0.05) break;
      if (kept[i].t >= t - KILL_WINDOW && (aid === null || aid === '-1' || kept[i].aid === aid)) best = i;
    }
    return best;
  };
  for (const k of kills) {
    if (!objs.has(k.tid)) continue;
    const crew = crewOf(k.tid);
    const victim = root(k.tid);
    const last = lastBefore(victim, k.t, k.aid);
    if (last < 0) continue;
    if (crew) {
      // On the shooter's last hit that struck this crew member, else its last hit on the aircraft.
      let on = last;
      for (const i of byVictim.get(victim) ?? []) if (kept[i].t <= k.t + 0.05 && kept[i].t >= k.t - KILL_WINDOW && kept[i].aid === kept[last].aid && out.effects[i] & EFFECT_BIT[crew]) on = i;
      out.effects[on] |= EFFECT_BIT.crew | EFFECT_BIT[crew] | EFFECT_BIT.crewKilled;
      continue;
    }
    out.effects[last] |= EFFECT_BIT.killingShot | EFFECT_BIT.lethal;
    // Its result: the kill, from the report's kill line (the report has no armour result).
    out.result[last] = R_KILL;
    out.flags2[last] |= FLAG2_RESULT_DERIVED;
    for (const i of byVictim.get(victim) ?? []) if (i !== last && kept[i].aid === kept[last].aid && kept[i].t <= kept[last].t && kept[i].t >= kept[last].t - FATAL_WINDOW) out.effects[i] |= EFFECT_BIT.lethal;
  }
  for (const b of bails) {
    const last = lastBefore(b.parent, b.t, null);
    if (last >= 0) out.effects[last] |= EFFECT_BIT.bailout;
  }
  const cols = out.n === kept.length ? out : sliceColumns(out, kept.length);
  return { cols, vehicles: vehicles.list, players: players.list, teams: teams.list, ammoTypes: types.list, ammoNames: names.list, match };
}

/** A mission's report pieces as one file (by the stamp in their names, pieces in order); other files as they are. */
export function groupIl2Reports(files: File[]): File[] {
  const groups = new Map<string, { n: number; f: File }[]>();
  const other: File[] = [];
  for (const f of files) {
    const m = IL2_REPORT.exec(f.name);
    if (!m) {
      other.push(f);
      continue;
    }
    let g = groups.get(m[1]);
    if (!g) groups.set(m[1], (g = []));
    g.push({ n: Number(m[2]), f });
  }
  const joined = [...groups].map(([stamp, g]) => {
    g.sort((a, b) => a.n - b.n);
    const parts: BlobPart[] = [];
    for (const p of g) parts.push(p.f, '\n');
    return new File(parts, `missionReport(${stamp})[0].txt`, { lastModified: Math.max(...g.map((p) => p.f.lastModified)) });
  });
  return [...other, ...joined];
}
