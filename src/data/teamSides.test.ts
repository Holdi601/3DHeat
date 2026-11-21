import { describe, expect, it } from 'vitest';
import type { Dataset } from '../state/types';
import { mapKeyOf, sideSwaps, TEAM_RAW, withTeamSides } from './teamSides';

/**
 * Matches of one map: in each, the units of team `west` start at x = -500 and the others at x = +500, then
 * move about; a unit per team and match, two rows each.
 */
function matches(west: ('1' | '2')[], map = 'avg_test_AB_Dom_'): Dataset {
  const px: number[] = [], pz: number[] = [], team: number[] = [], person: number[] = [], session: number[] = [], time: number[] = [];
  const labels: string[] = [];
  west.forEach((w, s) => {
    for (const t of [0, 1]) {
      const p = labels.length;
      labels.push(`unit ${s}-${t}`);
      const x = (t === 0) === (w === '1') ? -500 : 500;
      for (const k of [0, 1]) {
        px.push(x + k * (x < 0 ? 900 : -900));
        pz.push(30 * s);
        team.push(t);
        person.push(p);
        session.push(s);
        time.push(k);
      }
    }
  });
  const n = px.length;
  return {
    count: n,
    px: Float32Array.from(px),
    py: new Float32Array(n),
    pz: Float32Array.from(pz),
    time: Float32Array.from(time),
    timeSorted: false,
    teamId: Uint16Array.from(team),
    teamLabels: ['1', '2'],
    personId: Uint32Array.from(person),
    personLabels: labels,
    personTeam: null,
    personSlot: null,
    teamSizes: null,
    sessionId: Uint32Array.from(session),
    sessionLabels: west.map((_, s) => `${map}2026-11-2${s}_12-00-00_server`),
    attrs: [],
  } as unknown as Dataset;
}

describe('team sides', () => {
  it('reads the map off a session name', () => {
    expect(mapKeyOf('avg_greece_AB_Dom_2026-11-20_22-52-09_72c412c10011726e_server')).toBe('avg_greece_AB_Dom_');
    expect(mapKeyOf('match 3')).toBe('');
  });

  it('numbers each match by where its teams start, team 1 the west side, the data’s own team kept', () => {
    const d = matches(['1', '2', '1', '2']);
    const { swaps, check } = sideSwaps(d, d.teamId!);
    expect(check).toEqual({ sessions: 4, swapped: 2, skipped: 0 });
    expect(swaps.map((s) => s?.swap)).toEqual([false, true, false, true]);
    const out = withTeamSides(d, true)!.dataset;
    // Every match's west unit is team 1 (index 0) now, from its first row on.
    for (let r = 0; r < out.count; r += 2) expect(out.teamId![r]).toBe(d.px[r] < 0 ? 0 : 1);
    const raw = out.attrs.find((a) => a.name === TEAM_RAW)!;
    expect(Array.from(raw.data)).toEqual(Array.from(d.teamId!));
    expect(Array.from(out.teamSizes!)).toEqual([4, 4]);
    // And back.
    const back = withTeamSides(out, false)!.dataset;
    expect(Array.from(back.teamId!)).toEqual(Array.from(d.teamId!));
    expect(back.attrs.some((a) => a.name === TEAM_RAW)).toBe(false);
    // Lined up again from the kept column, not from the lined-up teams.
    expect(Array.from(withTeamSides(out, true)!.dataset.teamId!)).toEqual(Array.from(out.teamId!));
  });

  it('leaves a match without two teams as it is', () => {
    const d = matches(['2']);
    d.teamLabels[1] = 'none';
    expect(withTeamSides(d, true)).toBeNull();
  });
});
