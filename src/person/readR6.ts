/**
 * A Rainbow Six Siege match's kills as hits on operators (a `.3dheat` the
 * r6-replay converter writes). The replay keeps kills, not damage: each kill
 * is one hit that killed, with the weapon, whether it was a headshot and both
 * operators; the distance and the angle against the way the victim faced are
 * derived from the killer's place on the kill row, the victim's on the death
 * row and the victim's own samples. Armour (the operator's rating) is not in
 * the replay.
 */

import { angleFromFacing, BlockBuilder, HG_HEAD, SRC_DERIVED, SRC_RECORDED, type PersonBlock, type PersonMatch } from './types';
import { r6Class } from './weapons';
import type { TableColumns } from './table';

export const R6_EVENTS = ['kill', 'death', 'position'];
export const R6_NUMBERS = ['x', 'y', 'z', 'dirX', 'dirY', 'dirZ', 'headshot', 'won', 'round'];
export const R6_TEXTS = ['event', 'player', 'other', 'operator', 'otherOperator', 'weapon', 'weaponClass', 'side'];

export function isR6Table(available: Set<string>, game: string): boolean {
  return game === 'r6siege' || (available.has('otherOperator') && available.has('operator') && available.has('event'));
}

export function extractR6Hits(c: TableColumns, match: PersonMatch): PersonBlock {
  const t0 = performance.now();
  const txt = (name: string, r: number): string => {
    const col = c.txt[name];
    return col ? col.dict[col.ids[r]] : '';
  };
  const num = (name: string, r: number): number => c.num[name]?.[r] ?? NaN;
  const ev = c.txt.event!;
  const tracks = new Map<string, { t: number[]; r: number[] }>();
  const deaths = new Map<string, number[]>();
  const kills: number[] = [];
  for (let r = 0; r < c.rows; r++) {
    const e = ev.dict[ev.ids[r]];
    const who = txt('player', r);
    if (e === 'kill') kills.push(r);
    else if (e === 'death') {
      const list = deaths.get(who);
      if (list) list.push(r);
      else deaths.set(who, [r]);
    } else if (e === 'position' && who && Number.isFinite(num('dirX', r))) {
      let tr = tracks.get(who);
      if (!tr) tracks.set(who, (tr = { t: [], r: [] }));
      tr.t.push(c.time[r]);
      tr.r.push(r);
    }
  }
  const sampleBefore = (who: string, t: number): number => {
    const tr = tracks.get(who);
    if (!tr) return -1;
    let lo = 0, hi = tr.t.length - 1, best = -1;
    while (lo <= hi) {
      const mid = (lo + hi) >> 1;
      if (tr.t[mid] <= t) {
        best = mid;
        lo = mid + 1;
      } else hi = mid - 1;
    }
    return best >= 0 && t - tr.t[best] <= 1 ? tr.r[best] : -1;
  };
  const b = new BlockBuilder(kills.length);
  for (const r of kills) {
    const t = c.time[r];
    const victim = txt('other', r), shooter = txt('player', r);
    const i = b.row();
    const { num: N, int: I, src: S } = b.cols;
    N.time[i] = t;
    I.game[i] = 4;
    I.round[i] = Number.isFinite(num('round', r)) ? num('round', r) : 0;
    b.text(i, 'victim', victim);
    b.text(i, 'shooter', shooter);
    b.text(i, 'victimRole', txt('otherOperator', r));
    I.kill[i] = 1;
    S.kill[i] = SRC_RECORDED;
    const hs = num('headshot', r);
    if (hs > 0) {
      I.hitgroup[i] = HG_HEAD;
      S.hitgroup[i] = SRC_RECORDED;
    }
    const weapon = txt('weapon', r);
    b.text(i, 'weapon', weapon);
    S.weapon[i] = weapon ? SRC_RECORDED : 0;
    b.text(i, 'weaponClass', r6Class(txt('weaponClass', r), weapon));
    const sSide = txt('side', r);
    b.text(i, 'shooterSide', sSide);
    // The victim's death row of the same moment: their place and side.
    const d = (deaths.get(victim) ?? []).find((k) => Math.abs(c.time[k] - t) < 0.5) ?? -1;
    const vSide = d >= 0 ? txt('side', d) : '';
    b.text(i, 'victimSide', vSide);
    I.team[i] = vSide && vSide === sSide ? 1 : 0;
    const won = d >= 0 ? num('won', d) : NaN;
    I.won[i] = Number.isFinite(won) ? (won > 0 ? 1 : 0) : -1;
    const sx = num('x', r), sy = num('y', r), sz = num('z', r);
    const vx = d >= 0 ? num('x', d) : NaN, vy = d >= 0 ? num('y', d) : NaN, vz = d >= 0 ? num('z', d) : NaN;
    N.x[i] = vx;
    N.y[i] = vy;
    N.z[i] = vz;
    if (Number.isFinite(sx) && Number.isFinite(vx)) {
      N.distance[i] = Math.hypot(sx - vx, sy - vy, sz - vz);
      S.distance[i] = SRC_DERIVED;
      N.elevation[i] = (Math.atan2(sz - vz, Math.hypot(sx - vx, sy - vy)) * 180) / Math.PI;
      const s = sampleBefore(victim, t);
      if (s >= 0) {
        N.angle[i] = angleFromFacing(num('dirX', s), num('dirY', s), sx - vx, sy - vy);
        if (Number.isFinite(N.angle[i])) S.angle[i] = SRC_DERIVED;
      }
    }
  }
  match.game = 'r6siege';
  return b.done(match, c.rows, performance.now() - t0);
}
