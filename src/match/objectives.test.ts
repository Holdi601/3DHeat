import { describe, expect, it } from 'vitest';
import { battleMode, buildTimeline, modeFromName, parseObjectives, toWorld, zoneAt } from './objectives';
import { ObjectiveLayerDraw } from '../render/objectives';

const zone = {
  type: 'capture_zone',
  team: null,
  name: 'A',
  letter: 'A',
  shape: 'sphere',
  position: [100, 10, 200],
  radius: 140,
  ownerAtStart: 0,
};

describe('objectives', () => {
  it('reads what a match document lists, by layer', () => {
    const list = parseObjectives([
      {
        type: 'spawn',
        team: 1,
        name: 't1_spawn_01',
        shape: 'points',
        radius: 20,
        points: [
          [1, 2, 3],
          [5, 2, 3],
        ],
        used: 7,
      },
      zone,
      {
        type: 'helipad',
        team: 2,
        name: 'h',
        shape: 'point',
        position: [0, 0, 0],
      },
      {
        type: 'battle_area',
        team: null,
        name: 'b',
        shape: 'box',
        position: [0, 0, 0],
        size: [100, 10, 50],
        heading: 90,
      },
      { type: 'bombing_target', name: 'x' },
    ]);
    expect(list.map((o) => o.layer)).toEqual(['spawns', 'zones', 'airfields', 'areas']);
    expect(list[0].position).toEqual([3, 2, 3]);
    expect(list[0].used).toBe(7);
    expect(list[1].letter).toBe('A');
  });

  it('follows a zone through a capture, and says who took it', () => {
    const rows = [
      { time: 5, event: 'state', zone: 'A', owner: 0, progress: 0 },
      { time: 72, event: 'progress', zone: 'A', owner: NaN, progress: -6 },
      { time: 80, event: 'progress', zone: 'A', owner: NaN, progress: -54 },
      { time: 85, event: 'captured', zone: 'A', owner: 1, progress: -100 },
      { time: 200, event: 'neutralised', zone: 'A', owner: 0, progress: 0 },
    ];
    const tl = buildTimeline('m', rows);
    const a = tl.zones.get('A');
    expect(zoneAt(a, 0, 2)).toEqual({ owner: 2, progress: 0 });
    expect(zoneAt(a, 81)).toEqual({ owner: 0, progress: -54 });
    expect(zoneAt(a, 90)).toEqual({ owner: 1, progress: -100 });
    expect(tl.events).toEqual([
      { time: 85, zone: 'A', team: 1, kind: 'captured' },
      { time: 200, zone: 'A', team: 1, kind: 'neutralised' },
    ]);
  });

  it('puts a point where the rows are, and knows a battle by its mode', () => {
    expect(
      toWorld([1, 2, 3], {
        up: 'y',
        flipX: false,
        flipY: false,
        flipZ: true,
        scale: 1,
      }),
    ).toEqual([1, 2, -3]);
    expect(
      toWorld([1, 2, 3], {
        up: 'z',
        flipX: false,
        flipY: false,
        flipZ: false,
        scale: 2,
      }),
    ).toEqual([2, 6, 4]);
    expect(modeFromName('avg_rheinland_RB_Conq1_2026-11-08_11-55-10_2b315cb7001df05a_server')).toBe('Conq1');
    expect(modeFromName('avg_rheinland_RB_Dom_2026-11-08_12-11-03_x_server.parquet')).toBe('Dom');
    expect(
      battleMode({
        battle: { missionMode: 'Dom', missionModeName: 'Domination' },
      }),
    ).toEqual({ mode: 'Dom', modeName: 'Domination' });
    expect(battleMode({ mission: 'rheinland_Conq2' }).mode).toBe('Conq2');
  });

  it('draws a zone in its owner colour with the capture ring as far as it has come', () => {
    const objectives = parseObjectives([zone]);
    const timeline = buildTimeline('m', [
      { time: 0, event: 'state', zone: 'A', owner: 0, progress: 0 },
      { time: 10, event: 'progress', zone: 'A', owner: NaN, progress: 50 },
    ]);
    const draw = new ObjectiveLayerDraw();
    const layers = {
      zones: true,
      spawns: true,
      airfields: true,
      areas: true,
      targets: true,
    };
    const frame = (t: number) =>
      draw.build(
        {
          sources: [{ match: 'm', objectives, timeline, offset: 0 }],
          axes: null,
          layers,
          t,
          teamColor: (n) => (n === 2 ? [0, 0, 1] : [1, 0, 0]),
          ground: null,
          ready: () => true,
          groundKey: null,
        },
        null,
        0,
      );
    const before = frame(5);
    const during = frame(20);
    // Half a ring more, in team 2's colour, on the ground at the zone's height.
    expect(during.count).toBeGreaterThan(before.count);
    const last = (during.count - 1) * 7;
    expect([...during.data!.subarray(last + 3, last + 6)]).toEqual([0, 0, 1]);
    expect(during.data![last + 1]).toBeCloseTo(11.2, 3);
    expect(draw.labels.map((l) => [l.kind, l.text])).toEqual([['zone', 'A']]);
    expect(frame(5).count).toBe(before.count);
  });
});
