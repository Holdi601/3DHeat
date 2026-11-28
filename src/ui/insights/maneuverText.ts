/**
 * A maneuver said in plain words, as the Maneuvers tab and its 3D labels say
 * it: who made it (a unit by its name and vehicle, a group by its side and
 * size), what the kind means, what happened, and whether it worked - kills
 * and losses counted over the time named, a missile defence by whether the
 * aircraft got away. A kind that claims a purpose (a crank is flown to beat a
 * missile) is named by what was seen when the data cannot show the purpose.
 */

import { int, t } from '../../i18n';
import type { Maneuver, PathOwner } from '../../insights/maneuver/types';
import { isUnassignedLabel } from '../../render/colors';
import type { Dataset } from '../../state/types';
import { unitsOf, vehicleOf } from '../replay/units';

export const clock = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

/** A maneuver's name in the viewer's language, with its variant. */
export function maneuverName(m: { kind: string; variant?: string }): string {
  const k = t(`maneuver.kind.${m.kind}`);
  return m.variant ? `${k} (${t(`maneuver.variant.${m.variant}`)})` : k;
}

const MISSILE = new Set(['crank', 'notch', 'drag', 'pump']);

/** Whether a maneuver is a missile defence (the aircraft's answer to a shot). */
export const isMissileDefence = (m: Pick<Maneuver, 'kind'>): boolean => MISSILE.has(m.kind);

/** A side as players say it: "Team 1" for a bare number or letter, else its own name. */
export function sideName(teams: string[], team: number): string {
  const l = (teams[team] ?? '').trim();
  if (!l) return t('mview.team', { name: team >= 0 ? String(team) : '?' });
  return /^[\dA-Za-z]{1,2}$/.test(l) ? t('mview.team', { name: l }) : l;
}

/** A unit by its name, and its vehicle where the data names one: "Name (F-5C)". */
export function unitName(ds: Dataset, person: number): string {
  if (person < 0 || person >= ds.personLabels.length) return t('mview.someone');
  const idx = unitsOf(ds);
  const u = idx.units[idx.personUnit[person]];
  const raw = ds.personLabels[person] ?? '';
  // A track label carries its life's id ("name #1f001"): the name without it.
  const name = u?.name || raw.replace(/\s+#[0-9a-f]+$/i, '') || raw;
  const veh = u ? vehicleOf(u, person) : '';
  // A unit named after its vehicle (an AI tank, a drone) says it once.
  return veh && !name.toLowerCase().includes(veh.toLowerCase()) ? `${name} (${veh})` : name;
}

/** Whose a drawn path is, in a few words: a unit's name, a group's side, a missile. */
export function ownerName(ds: Dataset, o: PathOwner): string {
  if (o.weapon) return t('mview.missile');
  if (o.unit >= 0) return unitName(ds, o.unit);
  // A group's way by its side alone: how many made the maneuver is said in the list.
  return sideName(ds.teamLabels, o.team);
}

/** The maneuver's name in the list: what was seen, where the data does not show it was meant. */
export function titleOf(m: Maneuver): string {
  if (isMissileDefence(m) && m.intent !== 'shown') return t(`mview.plain.${m.kind}`);
  return maneuverName(m);
}

/** Who made it: the unit, or the units of a side. */
export function whoOf(ds: Dataset, m: Maneuver): string {
  if (m.units.length === 1) return unitName(ds, m.units[0]);
  return t('mview.group', { side: sideName(ds.teamLabels, m.team), n: m.units.length });
}

export type Tag = 'worked' | 'failed' | 'even' | 'none' | 'escaped' | 'shotDown';

/** The one-word result: worked or not, a missile defence the data cannot show was meant by what happened to the aircraft. */
export function tagOf(m: Maneuver): Tag {
  const o = m.outcome;
  if (isMissileDefence(m) && m.intent !== 'shown') return o.losses > 0 ? 'shotDown' : 'escaped';
  if (o.paid === 1) return 'worked';
  if (o.paid === 0) return 'failed';
  return o.kills + o.losses > 0 ? 'even' : 'none';
}

/** What happened, in a sentence or two. */
export function happenedOf(ds: Dataset, m: Maneuver): string[] {
  const who = whoOf(ds, m);
  if (isMissileDefence(m)) {
    const foe = m.foes?.length ? unitName(ds, m.foes[0]) : m.against >= 0 ? sideName(ds.teamLabels, m.against) : t('mview.someone');
    const secs = int(Number(m.evidence.heldS) || 0);
    const how = t(`mview.how.${m.kind}`);
    const seen = (m.paths.length && m.owners?.some((o) => o.weapon)) || Number(m.evidence.missiles) > 0;
    const key = m.intent === 'shown' ? 'mview.dodge.shown' : seen ? 'mview.dodge.late' : 'mview.dodge.unseen';
    return [t(key, { foe, who, how, secs })];
  }
  const out = [t('mview.who', { who }), t('mview.when', { from: clock(m.t0), to: clock(m.t1) })];
  // Against a side, not the neutral map objects of an unassigned team.
  if (m.against >= 0 && !isUnassignedLabel(String(ds.teamLabels[m.against] ?? ''))) out.push(t('mview.against', { side: sideName(ds.teamLabels, m.against) }));
  return out;
}

/** Whether it worked, in a sentence: the kills and losses over the time they were counted. */
export function resultOf(m: Maneuver): string {
  const o = m.outcome;
  if (isMissileDefence(m)) {
    const shown = m.intent === 'shown';
    if (o.losses > 0) return t(shown ? 'mview.res.shotDown' : 'mview.res.lost', { secs: int(o.lostAfter ?? 0) });
    return t(shown ? 'mview.res.escaped' : 'mview.res.stillFlying');
  }
  const v = { from: clock(o.from ?? m.t0), to: clock(o.until ?? m.t1), kills: int(o.kills), losses: int(o.losses) };
  const tag = tagOf(m);
  // Kinds judged their own way: a withdrawal by whether the losing stopped, a ring by the surrounded enemies lost.
  if (m.kind === 'withdrawal' && o.paid !== null) return `${t(o.paid ? 'mview.res.withdrew' : 'mview.res.stillLosing')} ${t('mview.res.counts', v)}`;
  const pocket = Number(m.evidence.pocket) || 0;
  const pocketLost = Number(m.evidence.pocketLosses) || 0;
  if (m.kind === 'encirclement' && o.paid === 1 && pocket > 0 && pocketLost * 2 >= pocket) {
    return `${t('mview.res.encircled', { lost: int(pocketLost), of: int(pocket) })} ${t('mview.res.counts', v)}`;
  }
  const main = t(tag === 'worked' ? 'mview.res.worked' : tag === 'failed' ? 'mview.res.failed' : tag === 'even' ? 'mview.res.even' : 'mview.res.none', v);
  return o.captures > 0 ? `${main} ${t('mview.res.captures', { n: o.captures })}` : main;
}
