/**
 * A Squad server demo's casualties as hits on soldiers (the table the
 * squad-demo converter writes). Each soldier or bot wounded or killed is one
 * hit that took them down, where they were and which way they faced. The
 * converter's newer tables add the soldier's last damage record the replay
 * carries at that moment (`damage`, `damageType`, the shooter as `other`,
 * `weapon`); older tables have neither the shooter nor the damage.
 */

import { BlockBuilder, SRC_RECORDED, type PersonBlock, type PersonMatch } from './types';
import { classOfName } from './weapons';
import type { TableColumns } from './table';

export const SQUAD_EVENTS = ['wounded', 'death'];
export const SQUAD_NUMBERS = ['x', 'y', 'z', 'speed', 'health', 'damage', 'team'];
export const SQUAD_TEXTS = ['event', 'player', 'other', 'pawn', 'faction', 'weapon', 'damageType', 'otherFaction'];

export function isSquadTable(available: Set<string>): boolean {
  return available.has('event') && available.has('pawn') && available.has('faction') && available.has('squad');
}

export function extractSquadHits(c: TableColumns, match: PersonMatch): PersonBlock {
  const t0 = performance.now();
  const txt = (name: string, r: number): string => {
    const col = c.txt[name];
    return col ? col.dict[col.ids[r]] : '';
  };
  const num = (name: string, r: number): number => c.num[name]?.[r] ?? NaN;
  const b = new BlockBuilder(c.rows);
  // A soldier wounded and then killed is one hit taking them down: the wound counts, the death after it marks it lethal.
  const downed = new Map<string, number>();
  for (let r = 0; r < c.rows; r++) {
    const e = txt('event', r);
    const victim = txt('player', r);
    if (e === 'death' && downed.has(victim)) {
      const i = downed.get(victim)!;
      b.cols.int.kill[i] = 1;
      downed.delete(victim);
      continue;
    }
    const i = b.row();
    const { num: N, int: I, src: S } = b.cols;
    N.time[i] = c.time[r];
    I.game[i] = 5;
    b.text(i, 'victim', victim);
    b.text(i, 'victimRole', txt('pawn', r));
    b.text(i, 'victimSide', txt('faction', r));
    N.x[i] = num('x', r);
    N.y[i] = num('y', r);
    N.z[i] = num('z', r);
    N.victimSpeed[i] = Number.isFinite(num('speed', r)) ? num('speed', r) / 100 : NaN;
    if (Number.isFinite(N.victimSpeed[i])) S.victimMove[i] = SRC_RECORDED;
    I.kill[i] = e === 'death' ? 1 : 0;
    S.kill[i] = SRC_RECORDED;
    if (e === 'wounded') downed.set(victim, i);
    const dmg = num('damage', r);
    if (Number.isFinite(dmg)) {
      N.damage[i] = dmg;
      S.damage[i] = SRC_RECORDED;
    }
    const shooter = txt('other', r);
    if (shooter) {
      b.text(i, 'shooter', shooter);
      b.text(i, 'shooterSide', txt('otherFaction', r));
      I.team[i] = txt('otherFaction', r) && txt('otherFaction', r) === txt('faction', r) ? 1 : 0;
    }
    const weapon = txt('weapon', r) || txt('damageType', r);
    if (weapon) {
      b.text(i, 'weapon', weapon);
      b.text(i, 'weaponClass', classOfName(weapon));
      S.weapon[i] = SRC_RECORDED;
    }
  }
  match.game = 'squad';
  return b.done(match, c.rows, performance.now() - t0);
}
