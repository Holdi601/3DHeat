import { describe, expect, it } from 'vitest';
import { parseBlk, blkChild, blkStr } from './blk';
import { readWtMission } from './wt';
import { missionToPlan, readMission } from './index';
import { planToMission } from './fromPlan';
import { newWtMissionText, patchWtMissionText, writeWtBlk } from './wtWrite';
import { routeOf } from '../plan';

/** A small user mission as the editor saves one, every name and number made up. */
const MISSION = `selected_tag:t=""
bin_dump_file:t=""
mission_settings{
  player{
    army:i=1
    wing:t="hawk"
  }
  mission{
    level:t="levels/test_level.bin"
    type:t="singleMission"
    environment:t="9"
    weather:t="cloudy"
    stars{
      year:i=1943
      month:i=7
      day:i=5
    }
  }
}
triggers{
  isCategory:b=yes
  is_enabled:b=yes
  attack{
    is_enabled:b=yes
    actions{
      unitAttackTarget{
        object:t="hawk"
        target:t="column"
      }
    }
  }
}
units{
  armada{
    name:t="hawk"
    tm:m=[[0.0, 0.0, 1.0] [0.0, 1.0, 0.0] [-1.0, 0.0, 0.0] [1000.0, 1500.0, 2000.0]]
    unit_class:t="bf-109f-4"
    // the flight
    props{
      army:i=1
      count:i=2
      attack_type:t="fire_at_will"
    }
    way{
      hawk_wp_01{
        type:t="normal"
        tm:m=[[1.0, 0.0, 0.0] [0.0, 1.0, 0.0] [0.0, 0.0, 1.0] [1000.0, 1500.0, 6000.0]]
        props{
          speed:r=360.0
        }
      }
      hawk_wp_02{
        type:t="normal"
        tm:m=[[1.0, 0.0, 0.0] [0.0, 1.0, 0.0] [0.0, 0.0, 1.0] [5000.0, 1500.0, 6000.0]]
        props{
          speed:r=360.0
        }
      }
    }
  }
  tankModels{
    name:t="column"
    tm:m=[[1.0, 0.0, 0.0] [0.0, 1.0, 0.0] [0.0, 0.0, 1.0] [3000.0, 20.0, 4000.0]]
    unit_class:t="germ_pzkpfw_V_ausf_d_panther"
    props{
      army:i=2
      count:i=3
      attack_type:t="hold_fire"
    }
    way{
    }
  }
}
areas{
  target_zone{
    type:t="Sphere"
    tm:m=[[300.0, 0.0, 0.0] [0.0, 300.0, 0.0] [0.0, 0.0, 300.0] [3000.0, 20.0, 4000.0]]
  }
}
`;

const planOf = () => missionToPlan(readWtMission(MISSION, 'test.blk'));

describe('the BLK reader', () => {
  it('reads parameters with their types, blocks, comments and spans', () => {
    const b = parseBlk('a:i=3\nb{ c:t="x~"y" // note\n d:p2=1.5, 2 }\n');
    expect(b.params[0]).toMatchObject({ name: 'a', type: 'i', raw: '3' });
    const c = blkChild(b, 'b')!;
    expect(blkStr(c, 'c')).toBe('x"y');
    expect(c.params[1]).toMatchObject({ type: 'p2', raw: '1.5, 2' });
    expect('a:i=3\nb{ c:t="x~"y" // note\n d:p2=1.5, 2 }\n'.slice(c.open, c.end)).toBe('{ c:t="x~"y" // note\n d:p2=1.5, 2 }');
    expect(() => parseBlk('a{ b:i=1')).toThrow(/line 1/);
  });
});

describe('War Thunder user missions', () => {
  it('reads units, sides, routes, weapons states, areas, level, time and date', () => {
    const m = readWtMission(MISSION, 'test.blk');
    expect(m.map).toBe('War Thunder: test_level');
    expect(m.info).toMatchObject({ start: 9 * 3600, date: { year: 1943, month: 7, day: 5 }, weather: { preset: 'cloudy' } });
    expect(m.groups.map((g) => [g.name, g.side, g.category])).toEqual([
      ['hawk', 'blue', 'air'],
      ['column', 'red', 'ground'],
    ]);
    const hawk = m.groups[0];
    // z mirrored; facing north is yaw 0.
    expect(hawk.units[0].at).toEqual({ x: 1000, y: 1500, z: -2000 });
    expect(hawk.units[0].yaw).toBeCloseTo(0);
    expect(hawk.route.map((w) => w.at.z)).toEqual([-2000, -6000, -6000]);
    expect(hawk.route[1].speed).toBeCloseTo(100);
    expect(m.groups[1].route[0].tasks).toEqual([{ name: 'attack_type', kind: 'roe', state: 'hold' }]);
    expect(m.places[0]).toMatchObject({ kind: 'zone', radius: 300 });
  });

  it('writes the file back unchanged when the board is unchanged, and changes only what moved', () => {
    const plan = planOf();
    expect(patchWtMissionText(MISSION, planToMission(plan)).text).toBe(MISSION);
    const hawk = plan.figures.find((f) => f.label === 'hawk')!;
    routeOf(plan, hawk.id, 0)!.points[2].x = 5500;
    const tank = plan.figures.find((f) => f.label === 'column')!;
    // It faced east; now north.
    tank.keys[0] = { ...tank.keys[0], yaw: 0 };
    plan.tasks.find((t) => t.kind === 'roe' && t.figures.includes(tank.id))!.state = 'free';
    const r = patchWtMissionText(MISSION, planToMission(plan));
    expect(r.summary.changed.sort()).toEqual(['column', 'hawk']);
    const a = MISSION.split('\n');
    const b = r.text.split('\n');
    expect(a.filter((l, i) => l !== b[i]).map((l) => l.trim().split('=')[0])).toEqual(['tm:m', 'tm:m', 'attack_type:t']);
    const m = readWtMission(r.text, 'x.blk');
    expect(m.groups[0].route[2].at.x).toBe(5500);
    expect(m.groups[1].units[0].yaw).toBeCloseTo(0);
    expect(m.groups[1].route[0].tasks?.[0].state).toBe('free');
  });

  it('adds waypoints and units, takes units out, keeps triggers', () => {
    const plan = planOf();
    const hawk = plan.figures.find((f) => f.label === 'hawk')!;
    routeOf(plan, hawk.id, 0)!.points.push({ x: 9000, y: 0, z: -9000 });
    plan.figures = plan.figures.filter((f) => f.label !== 'column');
    const layer = plan.layers.find((l) => l.name === 'Red')!.id;
    plan.figures.push({ id: 'n1', kind: 'm1a2-abrams', team: 'red', label: 'New tank', keys: { 0: { x: 100, y: 10, z: -100, yaw: 0 } }, from: 0, layer });
    // A new plan object, as every board edit makes one (routes are worked out once per plan).
    const edited = { ...plan, arrows: [...plan.arrows, { id: 'na', step: 0, team: 'red', style: 'move' as const, points: [{ x: 100, y: 10, z: -100 }, { x: 600, y: 10, z: -100 }], figure: 'n1', layer }] };
    const r = patchWtMissionText(MISSION, planToMission(edited));
    expect(r.summary.removed).toEqual(['column']);
    expect(r.summary.added).toEqual(['New_tank']);
    const m = readWtMission(r.text, 'x.blk');
    expect(m.groups.map((g) => g.name)).toEqual(['hawk', 'New_tank']);
    // Drawn on the ground: flown at the height before it.
    expect(m.groups[0].route[3].at).toEqual({ x: 9000, y: 1500, z: -9000 });
    expect(m.groups[1].units[0].type).toBe('us_m1a2_abrams');
    expect(m.groups[1].route[1].at.x).toBe(600);
    expect(r.text).toContain('unitAttackTarget{');
    expect(r.text).toContain('hawk_wp_02{');
  });

  it('makes a new mission on a level, the first Blue unit the player', async () => {
    const plan = { ...planOf(), mission: undefined };
    const { text, summary } = newWtMissionText('test_level', planToMission(plan));
    expect(summary.mode).toBe('new');
    const m = readWtMission(text, 'new.blk');
    expect(m.map).toBe('War Thunder: test_level');
    expect(m.groups).toHaveLength(2);
    expect(blkStr(blkChild(blkChild(parseBlk(text), 'mission_settings'), 'player'), 'wing')).toBe('hawk');
    const out = writeWtBlk(planToMission(plan), null, 'test_level');
    expect((await readMission('new.blk', out.bytes)).groups).toHaveLength(2);
  });
});
