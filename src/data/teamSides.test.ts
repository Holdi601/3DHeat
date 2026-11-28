import { describe, expect, it } from 'vitest';
import type { Dataset } from '../state/types';
import { mapKeyOf, shownTeamIndex, sideSwaps, TEAM_RAW, withTeamSides } from './teamSides';
import { replayTeamIndex, teamsBySpawns } from './teamSpawns';

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
    expect(check).toEqual({ sessions: 4, swapped: 2, skipped: 0, rounds: 0 });
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

  it('numbers clans that differ from match to match by their side, as teams 1 and 2', () => {
    const d = matches(['1', '2', '1']);
    // Each match its own two clans, in no order of side.
    d.teamLabels = ['alpha', 'bravo', 'charlie', 'delta', 'echo', 'foxtrot'];
    const team = d.teamId!;
    for (let r = 0; r < d.count; r++) team[r] += 2 * d.sessionId![r];
    const out = withTeamSides(d, true)!.dataset;
    expect(out.teamLabels).toEqual(['1', '2']);
    for (let r = 0; r < out.count; r += 2) expect(out.teamId![r]).toBe(d.px[r] < 0 ? 0 : 1);
    // The clans stay in the kept column; a replay's own number still finds its team in its match.
    expect(out.attrs.find((a) => a.name === TEAM_RAW)!.categories).toEqual(d.teamLabels);
    expect(shownTeamIndex(out, 1, 2)).toBe(1);
    expect(shownTeamIndex(out, 1, 3)).toBe(0);
    expect(replayTeamIndex(out, 0, 1, 'delta')).toBe(0);
  });

  it('lines up each round where the teams change ends at half time', () => {
    // One match of four rounds; the clans swap ends after round 2.
    const d = matches(['1', '1', '2', '2']);
    d.sessionLabels = ['match'];
    const round = Float32Array.from(d.sessionId!, (s) => s + 1);
    d.sessionId = new Uint32Array(d.count);
    d.attrs = [{ name: 'round', kind: 'numeric', data: round, min: 1, max: 4 } as never];
    // The same two persons all match long.
    d.personId = Uint32Array.from(d.teamId!);
    d.personLabels = ['clan a player', 'clan b player'];
    d.teamLabels = ['clan a', 'clan b'];
    const r = withTeamSides(d, true)!;
    expect(r.check).toMatchObject({ sessions: 1, swapped: 1, rounds: 4 });
    for (let i = 0; i < r.dataset.count; i += 2) expect(r.dataset.teamId![i]).toBe(d.px[i] < 0 ? 0 : 1);
  });

  it('leaves teams that name their side as they are', () => {
    const d = matches(['1', '2']);
    d.teamLabels = ['CT', 'T'];
    expect(withTeamSides(d, true)).toBeNull();
  });

  it('finds which data team a layout’s spawn team stands for, by where people spawn', () => {
    const d = matches(['2']);
    // Layout team 1 spawns in the east, team 2 in the west; the data's team 1 (index 0) starts east here.
    const pts = [
      { team: 1, x: 520, z: 0 },
      { team: 1, x: 480, z: 10 },
      { team: 2, x: -500, z: 0 },
    ];
    // One unit a team: too few votes to say.
    expect(teamsBySpawns(d, pts, null)).toBeNull();
    const many = matches(['2', '2', '2']);
    const m = teamsBySpawns(many, pts, null)!;
    expect(m.get(1)).toBe(0);
    expect(m.get(2)).toBe(1);
  });
});
