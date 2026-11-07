import { describe, expect, it } from 'vitest';
import type { Dataset } from '../../state/types';
import { computeStats, csvField, eventRole, flightPhases, statsCsv, telemetryCsv } from './stats';
import { autoBookmarks, autoKind, bookmarkKey, parseBookmarks } from './bookmarks';
import { categoryOfShape, shapeOf, unitCategory } from './objectType';
import { labelCategory, labelRank, ruleFields } from './labelRules';
import { linePath, niceLength, niceTicks, robustSpanOf, spanOf, xyPath, zoomSpan } from './charts';
import { fromMap, frameBox, headingOnMap, toMap, zoomAt } from './tacmap';
import { chartUnits } from './ChartDock';
import { unitsOf } from './units';
import { DEFAULT_AIDS, DEFAULT_LABEL_RULES, readAids, readRules } from '../../state/replayStore';
import { killWeapon, parseWtMatch } from '../../match/wtMatch';
import { ladderY, headingOfYaw } from './CockpitHud';
import { niceBar } from './TacticalMap';

const cat = (name: string, values: string[]) => {
  const categories = [...new Set(values)];
  return {
    name,
    kind: 'category',
    data: Uint32Array.from(values.map((v) => categories.indexOf(v))),
    min: 0,
    max: categories.length - 1,
    categories,
  };
};

/**
 * Two fighters and a tank: A takes off (slow on the ground, then fast and
 * climbing), launches twice, hits B, kills B; B dies (written twice, as War
 * Thunder does), and its killer is named; the tank only drives.
 */
function match(): Dataset {
  type Row = [
    person: number,
    t: number,
    x: number,
    y: number,
    player: string,
    ai: string,
    kind: string,
    event: string,
    other: string,
  ];
  const rows: Row[] = [];
  // A: 0-10 s rolling at 10 m/s on the ground, then 10-60 s flying at 150 m/s, climbing.
  for (let t = 0; t <= 60; t += 0.5) {
    const air = t > 10;
    const x = air ? 100 + (t - 10) * 150 : t * 10;
    const y = air ? (t - 10) * 20 : 0;
    rows.push([0, t, x, y, 'A', 'false', 'fighter', 'position', '']);
  }
  // B flies level at 2000 m until it dies at 40 s.
  for (let t = 0; t <= 40; t += 0.5)
    rows.push([1, t, 5000 - t * 150, 2000, 'B', 'false', 'fighter', 'position', '']);
  // The tank.
  for (let t = 0; t <= 60; t += 1)
    rows.push([2, t, 300 + t * 5, 0, 'Tank #7', 'true', 'tank', 'position', '']);
  rows.push([0, 20, 1600, 200, 'A', 'false', 'fighter', 'launch', '']);
  rows.push([0, 30, 3100, 400, 'A', 'false', 'fighter', 'launch', '']);
  rows.push([1, 31, 350, 2000, 'B', 'false', 'fighter', 'hit_critical', 'A']);
  rows.push([0, 40, 4600, 600, 'A', 'false', 'fighter', 'kill', 'B']);
  rows.push([0, 40, 4600, 600, 'A', 'false', 'fighter', 'shot', 'B']);
  rows.push([1, 40, -1000, 2000, 'B', 'false', 'fighter', 'death', 'A']);
  rows.push([1, 40.2, -1000, 2000, 'B', 'false', 'fighter', 'dead', '']);
  rows.sort((a, b) => a[1] - b[1]);
  return {
    name: 'test match',
    count: rows.length,
    px: Float32Array.from(rows.map((r) => r[2])),
    py: Float32Array.from(rows.map((r) => r[3])),
    pz: new Float32Array(rows.length),
    time: Float32Array.from(rows.map((r) => r[1])),
    personId: Uint32Array.from(rows.map((r) => r[0])),
    personLabels: ['A #1', 'B #2', 'Tank #7 #3'],
    personTeam: Uint16Array.from([0, 1, 1]),
    teamLabels: ['Blue', 'Red'],
    timeSorted: true,
    sessionId: null,
    sessionLabels: [],
    timeRange: [0, 60],
    bounds: { minX: -1000, minY: 0, minZ: 0, maxX: 8000, maxY: 2000, maxZ: 0 },
    yaw: null,
    pitch: null,
    attrs: [
      cat(
        'player',
        rows.map((r) => r[4]),
      ),
      cat(
        'ai',
        rows.map((r) => r[5]),
      ),
      cat(
        'kind',
        rows.map((r) => r[6]),
      ),
      cat(
        'event',
        rows.map((r) => r[7]),
      ),
      cat(
        'other',
        rows.map((r) => r[8]),
      ),
    ],
  } as unknown as Dataset;
}

describe('statistics', () => {
  it('reads what an event means, a shot that names a victim being a shot-down', () => {
    expect(eventRole('kill', true)).toBe('kill');
    expect(eventRole('dead', false)).toBe('death');
    expect(eventRole('Destroyed', false)).toBe('death');
    expect(eventRole('TakenOff: Viper 1 has taken off from Batumi', false)).toBe('takeoff');
    expect(eventRole('Landed', false)).toBe('landing');
    expect(eventRole('launch', false)).toBe('shot');
    expect(eventRole('hurt', true)).toBe('hit');
    expect(eventRole('hit_severe', true)).toBe('hit');
    expect(eventRole('shot', false)).toBe('shot');
    expect(eventRole('shot', true)).toBeNull();
    expect(eventRole('position', false)).toBeNull();
  });

  it('counts take-offs and landings once a change has held, and an air spawn as none', () => {
    const t = Array.from({ length: 41 }, (_, i) => i);
    // Ground 0-9, air 10-29, a one-second bounce at 20, ground 30-40.
    const ground = (i: number) => i < 10 || i >= 30 || i === 20;
    const p = flightPhases(t, (i) => (i === 20 ? !ground(i) : ground(i)), 3);
    expect(p.takeoffs).toBe(1);
    expect(p.landings).toBe(1);
    expect(p.takeoffTimes).toEqual([10]);
    expect(p.landingTimes).toEqual([30]);
    expect(p.airborne).toBeCloseTo(20, 6);
    const spawn = flightPhases(t, () => false);
    expect(spawn.takeoffs).toBe(0);
    expect(spawn.airborne).toBeCloseTo(40, 6);
  });

  it('counts kills, deaths (once a moment), shots, hits and a take-off from a recording', () => {
    const m = computeStats(match(), -1);
    const a = m.units.find((u) => u.key === 'A')!;
    const b = m.units.find((u) => u.key === 'B')!;
    expect(a.kills).toBe(1);
    expect(a.shots).toBe(2);
    expect(a.hits).toBe(1);
    expect(a.hitRatio).toBeCloseTo(0.5);
    expect(a.category).toBe('air');
    expect(a.takeoffs).toBe(1);
    expect(a.landings).toBe(0);
    expect(a.groundFrom).toBe('estimate');
    expect(a.maxAlt).toBeGreaterThan(900);
    expect(a.maxSpeed).toBeGreaterThan(140);
    expect(b.deaths).toBe(1);
    expect(b.hitsTaken).toBe(1);
    const tank = m.units.find((u) => u.name.startsWith('Tank'))!;
    expect(tank.category).toBe('ground');
    expect(Number.isNaN(tank.airborne)).toBe(true);
    expect(m.teams.map((x) => [x.team, x.kills, x.deaths])).toEqual([
      [0, 1, 0],
      [1, 0, 1],
    ]);
  });

  it('credits the killer a death names when the recording writes no kills', () => {
    const d = match();
    const ev = d.attrs.find((x) => x.name === 'event')!;
    ev.categories = ev.categories!.map((c) => (c === 'kill' ? 'kill_unused' : c));
    expect(computeStats(d, -1).units.find((u) => u.key === 'A')!.kills).toBe(1);
  });

  it('writes CSV with quotes where needed and SI values', () => {
    expect(csvField('a,b')).toBe('"a,b"');
    expect(csvField('say "hi"')).toBe('"say ""hi"""');
    expect(csvField(1.23456)).toBe('1.235');
    expect(csvField(NaN)).toBe('');
    const csv = statsCsv(computeStats(match(), -1), (t) => ['Blue', 'Red'][t]);
    const [head, ...lines] = csv.trim().split('\n');
    expect(head.split(',')).toContain('hit_ratio');
    expect(lines.find((l) => l.startsWith('A,'))).toContain(
      ',Blue,player,air,1,1,0,2,1,0,0.5,1,0,',
    );
  });

  it("samples a unit's telemetry at a rate", () => {
    const s = {
      person: 0,
      rows: new Uint32Array(3),
      time: Float64Array.from([0, 1, 2]),
      x: Float64Array.from([0, 1, 2]),
      y: new Float64Array(3),
      z: new Float64Array(3),
      values: { tas: Float64Array.from([10, 11, 12]) },
      source: {},
    };
    const csv = telemetryCsv([{ name: 'U', s }], ['tas'], 2)
      .trim()
      .split('\n');
    expect(csv[0]).toBe('time_s,unit,x_m,y_m,z_m,tas');
    expect(csv.length).toBe(1 + 5);
    expect(csv[2]).toBe('0.5,U,0,0,0,10');
  });
});

describe('bookmarks', () => {
  it("marks kills, deaths once a moment, and the recording's own bookmarks", () => {
    expect(autoKind('Bookmark: Merge begins')).toBe('bookmark');
    expect(autoKind('Message')).toBe('message');
    expect(autoKind('kill')).toBe('kill');
    expect(autoKind('Destroyed')).toBe('death');
    expect(autoKind('position')).toBeNull();
    const marks = autoBookmarks(match());
    expect(marks.map((m) => [m.kind, m.time])).toEqual([
      ['kill', 40],
      ['death', 40],
    ]);
  });

  it('keeps bookmarks per recording and reads back only well-formed ones', () => {
    expect(bookmarkKey({ name: 'a.parquet', count: 10 })).toBe('heat3d.bookmarks.a.parquet|10');
    const list = parseBookmarks(
      JSON.stringify([
        {
          id: 'x',
          time: 5,
          label: 'later',
          camera: { p: [1, 2, 3], f: [0, 0, -1] },
          follow: { unit: 'A', mode: 'cockpit', distance: 60 },
          target: 'B',
          made: 2,
        },
        {
          id: 'y',
          time: 1,
          label: '',
          camera: { p: [1, 2, 3], f: [0, 0, -1] },
          follow: null,
          made: 1,
        },
        { id: 'bad', time: 'no', camera: {} },
      ]),
    );
    expect(list.map((b) => b.id)).toEqual(['y', 'x']);
    expect(list[1].follow).toEqual({ unit: 'A', mode: 'cockpit', distance: 60 });
    expect(list[0].target).toBeNull();
    expect(parseBookmarks('not json')).toEqual([]);
  });
});

describe('object kinds and label rules', () => {
  it('reads what a thing is from type tags, game kinds and names', () => {
    expect(shapeOf(['Air+FixedWing'], [])).toBe('jet');
    expect(shapeOf(['Air+Rotorcraft'], [])).toBe('heli');
    expect(shapeOf(['Sea+Watercraft+AircraftCarrier'], [])).toBe('sea');
    expect(shapeOf(['Weapon+Missile'], [])).toBe('weapon');
    expect(shapeOf(['Ground+Heavy+Armor+Vehicle+Tank'], [])).toBe('ground');
    expect(shapeOf(['aircraft'], [])).toBe('jet');
    expect(shapeOf(['spaa'], [])).toBe('ground');
    expect(categoryOfShape('heli')).toBe('air');
    expect(categoryOfShape('person')).toBe('ground');
  });

  it('labels each unit by its own rule, the ones in question first', () => {
    const d = match();
    const { units } = unitsOf(d);
    const a = units.find((u) => u.key === 'A')!;
    const tank = units.find((u) => u.name.startsWith('Tank'))!;
    expect(unitCategory(d, a)).toBe('air');
    expect(labelCategory(d, a, false)).toBe('air');
    expect(labelCategory(d, tank, false)).toBe('ai');
    expect(labelCategory(d, tank, true)).toBe('selected');
    expect(labelRank(0, 1)).toBe(0);
    expect(labelRank(null, 5)).toBeLessThan(labelRank(null, 1));
    expect(ruleFields(d, { show: true, fields: ['name', 'g'], priority: 3 }, null)).toEqual([
      'name',
      'g',
    ]);
    expect(ruleFields(d, { show: true, fields: null, priority: 3 }, ['name'])).toEqual(['name']);
  });

  it('reads saved rules and aids, dropping what is not one', () => {
    expect(readRules(null)).toEqual(DEFAULT_LABEL_RULES);
    const r = readRules({ air: { show: false, fields: ['alt'], priority: 9 }, ai: 'x' });
    expect(r.air).toEqual({
      show: false,
      fields: ['alt'],
      priority: DEFAULT_LABEL_RULES.air.priority,
    });
    expect(r.ai).toEqual(DEFAULT_LABEL_RULES.ai);
    expect(readAids({ vectors: 'air', vectorSeconds: -1, radar: 'nonsense' })).toEqual({
      ...DEFAULT_AIDS,
      vectors: 'air',
    });
  });
});

describe('charts and the map', () => {
  it('picks round ticks and scale bars', () => {
    expect(niceTicks(0, 100, 5)).toEqual([0, 20, 40, 60, 80, 100]);
    expect(niceTicks(3, 7, 4)).toEqual([3, 4, 5, 6, 7]);
    expect(niceLength(7300)).toBe(5000);
    expect(niceLength(1999)).toBe(1000);
    expect(niceBar(7300, 'metric')).toBe(5000);
    expect(niceBar(5000, 'imperial')).toBeCloseTo(2 * 1852);
  });

  it('keeps a scale wide enough and leaves out a spike', () => {
    expect(spanOf([[10, 10]], 50, 0)).toEqual([-15, 35]);
    const v = Array.from({ length: 1000 }, (_, i) => (i === 500 ? 400 : i % 10));
    const [lo, hi] = robustSpanOf([v], 1, 0.002, 0);
    expect(lo).toBe(0);
    expect(hi).toBe(9);
  });

  it('draws a line of only what is in view, lifting the pen over gaps', () => {
    const x = [0, 1, 2, 30, 31];
    const y = [0, 1, 0, 1, NaN];
    const d = linePath(x, y, 100, 10, [0, 31], [0, 1]);
    expect(d.split('M').length - 1).toBe(2);
    const part = linePath(x, y, 100, 10, [0, 2], [0, 1]);
    expect(part.startsWith('M0.0,10.0')).toBe(true);
    expect(xyPath([0, 1, 2], [0, 1, 2], [0, 1, 4], 10, 10, [0, 2], [0, 4], 1, 2)).toBe(
      'M5.0,7.5L10.0,0.0',
    );
  });

  it('zooms a time span about a moment, inside the whole', () => {
    const z = zoomSpan([0, 100], [0, 100], 50, 0.5);
    expect(z).toEqual([25, 75]);
    expect(zoomSpan([0, 100], [0, 100], 0, 0.5)).toEqual([0, 50]);
    expect(zoomSpan([25, 75], [0, 100], 50, 10)).toEqual([0, 100]);
  });

  it('maps the world north up and back, framing and zooming about the pointer', () => {
    const v = frameBox(0, 1000, 0, 500, 200, 100, 0);
    expect(v.upp).toBe(5);
    expect(toMap(v, 200, 100, 0, 0)).toEqual([0, 0]);
    expect(fromMap(v, 200, 100, 200, 100)).toEqual([1000, 500]);
    const z = zoomAt(v, 200, 100, 50, 50, 0.5);
    expect(toMap(z, 200, 100, ...fromMap(v, 200, 100, 50, 50))).toEqual([50, 50]);
    const [hx, hy] = headingOnMap(Math.PI / 2);
    expect(hx).toBeCloseTo(1);
    expect(hy).toBeCloseTo(0);
  });

  it('charts the followed, target and selected units, then those added, once each', () => {
    const idx = unitsOf(match());
    expect(chartUnits(idx, ['A', null, 'A', 'B', 'nobody']).map((u) => u.key)).toEqual(['A', 'B']);
  });

  it("places the head-up display's pitch ladder and heading", () => {
    expect(ladderY(0, 0, 500)).toBe(0);
    expect(ladderY(0, 10, 500)).toBeCloseTo(-500 * Math.tan((10 * Math.PI) / 180));
    expect(ladderY((10 * Math.PI) / 180, 10, 500)).toBeCloseTo(0);
    expect(Number.isNaN(ladderY(0, 90, 500))).toBe(true);
    expect(headingOfYaw(0)).toBe(0);
    expect(headingOfYaw(-Math.PI / 2)).toBeCloseTo(90);
  });
});

describe('War Thunder weapon names', () => {
  it('shows the localised weapon name where the summary has one, else the id', () => {
    const g = parseWtMatch({
      format: 'heat3d-wt-replay-match',
      kills: [
        { time: 1, killer: 'A', weapon: 'he_frag_i_t', weaponName: 'HE-FRAG-I-T' },
        { time: 2, killer: 'B', weapon: 'us_aim_120c_5' },
      ],
    });
    expect(killWeapon(g.kills[0])).toBe('HE-FRAG-I-T');
    expect(killWeapon(g.kills[1])).toBe('us_aim_120c_5');
  });
});

describe('timeline marks', () => {
  it('counts marks per pixel column for the density bar', async () => {
    const { markColumns } = await import('./ReplayMarks');
    const cols = markColumns([0, 0.4, 5, 9.99, 12], 10, (t) => t);
    expect(Array.from(cols)).toEqual([2, 0, 0, 0, 0, 1, 0, 0, 0, 1]);
  });
});

describe('bullseye', () => {
  it("reads bearing and range from the team's bullseye object", async () => {
    const { fromBullseye } = await import('./fields');
    const type = cat('Type', ['Navaid+Static+Bullseye', 'Air+FixedWing']);
    const d = {
      count: 2,
      px: Float32Array.from([0, 1000]),
      py: new Float32Array(2),
      pz: Float32Array.from([0, -1000]),
      personId: Uint32Array.from([0, 1]),
      personTeam: Uint16Array.from([0, 0]),
      attrs: [type],
    } as unknown as Dataset;
    const b = fromBullseye(d, 0, { x: 1000, z: -1000 }, 1)!;
    expect(b.bearing).toBeCloseTo(45);
    expect(b.range).toBeCloseTo(Math.SQRT2 * 1000);
    expect(
      fromBullseye({ ...d, attrs: [] } as unknown as Dataset, 0, { x: 0, z: 0 }, 1),
    ).toBeNull();
  });
});
