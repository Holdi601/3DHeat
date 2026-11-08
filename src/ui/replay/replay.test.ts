import { describe, expect, it } from 'vitest';
import { braa, useReplayStore } from '../../state/replayStore';
import { defaultEventKinds, eventBursts, eventRows, markedInView, trackName } from './replayData';
import { personAt, prettyVehicle, sortUnits, unitsOf } from './units';
import { allFields, formatValue } from './fields';
import { matchesOf, pickMatches } from '../../match/matches';
import { buildOverlay, isOverlay, overlayGroups } from '../../match/overlay';
import { useStore } from '../../state/store';
import { has } from '../../i18n';
import type { Dataset } from '../../state/types';
import { PRESET_UNITS } from '../../units/units';

describe('debrief', () => {
  it('reads bearing, range and height from one track to another, north being -z', () => {
    const m = braa({ x: 0, y: 1000, z: 0 }, { x: 1000, y: 1500, z: -1000 });
    expect(m.bearing).toBeCloseTo(45);
    expect(m.ground).toBeCloseTo(Math.SQRT2 * 1000);
    expect(m.dy).toBe(500);
    expect(braa({ x: 0, y: 0, z: 0 }, { x: 0, y: 0, z: 10 }).bearing).toBeCloseTo(180);
    expect(braa({ x: 0, y: 0, z: 0 }, { x: -10, y: 0, z: 0 }).bearing).toBeCloseTo(270);
  });

  it('names tracks without Tacview ids, and an unmanned one by its type', () => {
    const d = { personLabels: ['Viper 1 (F-16C_50) #101', '(T-90A) #401', 'player7'] } as unknown as Dataset;
    expect(trackName(d, 0, 0)).toBe('Viper 1 (F-16C_50)');
    expect(trackName(d, 1, 0)).toBe('T-90A');
    expect(trackName(d, 2, 0)).toBe('player7');
  });

  it('finds the event rows in time order', () => {
    const d = {
      count: 4,
      time: new Float32Array([3, 1, 2, 0]),
      personId: new Uint32Array([0, 1, 1, 0]),
      attrs: [{ name: 'Event', kind: 'category', data: new Uint32Array([1, 0, 2, 0]), min: 0, max: 2, categories: ['position', 'Destroyed', 'TakenOff'] }],
    } as unknown as Dataset;
    const e = eventRows(d)!;
    expect(Array.from(e.rows)).toEqual([2, 0]);
    expect(e.labels).toEqual(['TakenOff', 'Destroyed']);
    expect(Array.from(e.persons)).toEqual([1, 0]);
  });

  it('picks a pair with two shift-clicks and follows with one click', () => {
    const r = useReplayStore.getState();
    r.clearPair();
    r.pick(3);
    r.pick(5);
    expect(useReplayStore.getState().pair).toEqual([3, 5]);
    r.toggleFollow(5);
    expect(useReplayStore.getState().follow).toBe(5);
    useReplayStore.getState().toggleFollow(5);
    expect(useReplayStore.getState().follow).toBeNull();
  });
});

/** A small War Thunder-like table: two players (one with two tracks), an AI tank, a weapon flight. */
function wtLike(): Dataset {
  const persons = ['Pilot A #95001', 'Pilot A #95002', 'Pz.Kpfw. III Ausf. J1 #2a001', 'Pilot A bomb #w1', 'Pilot B #80001'];
  const rows = [
    // person, time, x, player, ai, vehicle, life, event, other
    [0, 0, 0, 'Pilot A', 'false', 'I-185 (M-82)', '149#1', 'position', ''],
    [2, 0, 10, 'Pz.Kpfw. III Ausf. J1 #42', 'true', 'Pz.Kpfw. III Ausf. J1', '42#1', 'position', ''],
    [4, 0, 20, 'Pilot B', 'false', 'P-43A-1', '128#1', 'position', ''],
    [0, 1, 1, 'Pilot A', 'false', 'I-185 (M-82)', '149#1', 'shot', 'Pilot B'],
    [0, 1.5, 1, 'Pilot A', 'false', 'I-185 (M-82)', '149#1', 'shot', 'Pilot B'],
    [0, 2, 2, 'Pilot A', 'false', 'I-185 (M-82)', '149#1', 'shot', 'Pilot B'],
    [3, 2, 2, 'Pilot A', 'false', '', 'wa1', 'position', ''],
    [4, 3, 21, 'Pilot B', 'false', 'P-43A-1', '128#1', 'death', 'Pilot A'],
    [1, 10, 5, 'Pilot A', 'false', 'I-185 (M-82)', '149#2', 'position', ''],
  ] as const;
  const cat = (name: string, values: string[]) => {
    const categories = [...new Set(values)];
    return { name, kind: 'category', data: Uint32Array.from(values.map((v) => categories.indexOf(v))), min: 0, max: categories.length - 1, categories };
  };
  return {
    count: rows.length,
    px: Float32Array.from(rows.map((r) => r[2])),
    py: new Float32Array(rows.length),
    pz: new Float32Array(rows.length),
    time: Float32Array.from(rows.map((r) => r[1])),
    personId: Uint32Array.from(rows.map((r) => r[0])),
    personLabels: persons,
    personTeam: Uint16Array.from([0, 0, 1, 0, 1]),
    teamLabels: ['1', '2'],
    timeSorted: true,
    sessionId: null,
    sessionLabels: [],
    timeRange: [0, 10],
    bounds: { minX: 0, minY: 0, minZ: 0, maxX: 21, maxY: 0, maxZ: 0 },
    yaw: null,
    pitch: null,
    attrs: [
      cat('player', rows.map((r) => r[3])),
      cat('ai', rows.map((r) => r[4])),
      cat('VehicleName', rows.map((r) => r[5])),
      cat('life', rows.map((r) => r[6])),
      cat('event', rows.map((r) => r[7])),
      cat('other', rows.map((r) => r[8])),
    ],
  } as unknown as Dataset;
}

describe('units', () => {
  it('joins a player\'s tracks, tells AI and weapons apart and names AI by vehicle', () => {
    const d = wtLike();
    const { units, personUnit, aiFrom } = unitsOf(d);
    expect(aiFrom).toBe('column');
    const om = units.find((u) => u.key === 'Pilot A')!;
    expect(om.kind).toBe('player');
    expect(om.persons).toEqual([0, 1]);
    expect(om.vehicle).toBe('I-185 (M-82)');
    const tank = units[personUnit[2]];
    expect(tank.kind).toBe('ai');
    expect(tank.name).toBe('Pz.Kpfw. III Ausf. J1 #42');
    expect(units[personUnit[3]].kind).toBe('weapon');
    // The life at a moment: the first track until the second starts, the second after.
    expect(personAt(om, 1)).toBe(0);
    expect(personAt(om, 10)).toBe(1);
    expect(sortUnits(units.filter((u) => u.kind === 'player')).map((u) => u.name)).toEqual(['Pilot A', 'Pilot B']);
  });

  it('falls back when nothing says what is AI', () => {
    const d = wtLike();
    d.attrs = d.attrs.filter((a) => a.name !== 'ai');
    expect(unitsOf(d).aiFrom).toBe('none');
    expect(prettyVehicle('germ_pzkpfw_III_ausf_J')).toBe('pzkpfw III ausf J');
  });

  it('collapses a burst of the same into one line, and leaves the effects out by default', () => {
    const d = wtLike();
    const ev = eventRows(d)!;
    const idx = ev.rows.map((_, i) => i);
    const other = d.attrs.find((a) => a.name === 'other')!;
    const bursts = eventBursts(d, ev, Array.from(idx), (i) => `${ev.persons[i]}|${other.categories![(other.data as Uint32Array)[ev.rows[i]]]}`);
    expect(bursts.map((b) => [ev.labels[b.first], b.count])).toEqual([
      ['shot', 3],
      ['death', 1],
    ]);
    expect(defaultEventKinds(['kill', 'explosion', 'flak', 'gun_shot', 'shot'])).toEqual(['kill', 'shot']);
    expect(markedInView('kill')).toBe(true);
    expect(markedInView('shot')).toBe(false);
  });

  it('formats values metric and aviation', () => {
    expect(formatValue('altitude', 1000, PRESET_UNITS.metric)).toBe('1000 m');
    expect(formatValue('altitude', 1000, PRESET_UNITS.aviation)).toBe('3281 ft');
    expect(formatValue('speed', 100, PRESET_UNITS.metric)).toBe('360 km/h');
    expect(formatValue('speed', 100, PRESET_UNITS.aviation)).toBe('194 kt');
    expect(formatValue('heading', 5, PRESET_UNITS.metric)).toBe('005°');
    expect(formatValue('g', 4.23, PRESET_UNITS.metric)).toBe('4.2 g');
  });

  it('has a name and an abbreviation for every field', () => {
    for (const f of allFields()) {
      expect(has(`replay.field.${f}`), f).toBe(true);
      expect(has(`replay.short.${f}`), f).toBe(true);
    }
    for (const k of ['player', 'ai', 'weapon']) {
      expect(has(`replay.kind.${k}`)).toBe(true);
      expect(has(`replay.units.${k}`)).toBe(true);
    }
    for (const g of ['who', 'relative', 'flight', 'energy', 'systems']) expect(has(`replay.fieldGroup.${g}`)).toBe(true);
  });
});

describe('matches', () => {
  it('finds the matches by column, and picks one by filter', () => {
    const d = wtLike();
    d.attrs.push({ name: 'match', kind: 'category', data: Uint32Array.from([0, 0, 0, 0, 0, 0, 1, 1, 1]), min: 0, max: 1, categories: ['a', 'b'] });
    const set = matchesOf(d);
    expect(set.via).toBe('column');
    expect(set.entries.map((e) => [e.id, e.rows, e.start, e.end])).toEqual([
      ['a', 6, 0, 2],
      ['b', 3, 2, 10],
    ]);
    useStore.setState({ dataset: d, filters: [] });
    const b = pickMatches(d, [1]);
    expect(useStore.getState().filters).toEqual([{ kind: 'categories', column: 'match', allowed: [1] }]);
    expect(b?.maxX).toBe(21);
    pickMatches(d, null);
    expect(useStore.getState().filters).toEqual([]);
  });
});

describe('figure overlay', () => {
  it('starts each round at zero and makes each player in each round a thing of its own', () => {
    const d = wtLike();
    // Two rounds as sessions: round b is rows 6 and 8 (from 2 s), round a the rest.
    d.sessionId = Uint32Array.from([0, 0, 0, 0, 0, 0, 1, 0, 1]);
    d.sessionLabels = ['m #01', 'm #02'];
    const g = overlayGroups(d)!;
    expect(g.groups.map((x) => [x.id, x.start])).toEqual([
      ['m #01', 0],
      ['m #02', 2],
    ]);
    const o = buildOverlay(d, { groups: null, colour: 'group', only: null })!;
    expect(isOverlay(o)).toBe(true);
    expect(o.count).toBe(9);
    expect(o.timeRange[1] - o.timeRange[0]).toBeCloseTo(8);
    expect(o.teamLabels.sort()).toEqual(['m #01', 'm #02']);
    expect(o.personLabels.filter((l) => l.startsWith('Pilot A #95001')).sort()).toEqual(['Pilot A #95001 · m #01']);
    // Only the rounds Pilot B (person 4) is in: round a.
    const only = buildOverlay(d, { groups: null, colour: 'team', only: [4] })!;
    expect(only.count).toBe(7);
  });
});
