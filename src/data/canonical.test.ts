import { describe, expect, it } from 'vitest';
import { DatasetBuilder, type SourceBlock } from './builder';
import { CANON, canonicalColumns, eventKindOf, vehicleClassOf } from './canonical';
import type { AttributeColumn, Dataset } from '../state/types';

function block(n: number, p: Partial<SourceBlock>): SourceBlock {
  return {
    rows: n,
    px: p.px ?? new Float32Array(n),
    py: p.py ?? new Float32Array(n),
    pz: p.pz ?? new Float32Array(n),
    time: p.time ?? null,
    timeIsAbsolute: p.timeIsAbsolute ?? false,
    yaw: null,
    pitch: null,
    personIds: p.personIds ?? null,
    personLabels: p.personLabels ?? [],
    teamIds: null,
    teamLabels: [],
    sessionIds: p.sessionIds ?? null,
    sessionLabels: p.sessionLabels ?? [],
    attrs: p.attrs ?? [],
    rejected: 0,
    sourceName: p.sourceName,
  };
}

/** A text column of `values`, one per row. */
function cat(name: string, values: string[]) {
  const labels = [...new Set(values)];
  return { name, kind: 'category' as const, data: Uint32Array.from(values, (v) => labels.indexOf(v)), categories: labels };
}

function labelsOf(d: Dataset, name: string): string[] {
  const a = d.attrs.find((x) => x.name === name) as AttributeColumn;
  return Array.from(a.data as Uint32Array, (i) => a.categories![i]);
}

describe('event taxonomy', () => {
  it('maps each game its own way onto one set', () => {
    expect(eventKindOf('kill')).toBe('kill');
    expect(eventKindOf('Destroyed')).toBe('death');
    expect(eventKindOf('destroyed')).toBe('destroyed');
    expect(eventKindOf('Removed')).toBe('despawn');
    expect(eventKindOf('TakenOff')).toBe('takeoff');
    expect(eventKindOf('hit_critical')).toBe('hit');
    expect(eventKindOf('module_destroyed')).toBe('damage');
    expect(eventKindOf('gun_shot')).toBe('fire');
    expect(eventKindOf('')).toBe('position');
    expect(eventKindOf('something_new')).toBe('other');
  });

  it('classes vehicles by the figure catalogue', () => {
    expect(vehicleClassOf(['F-16C_50'], ['Air+FixedWing'])).toBe('fighter');
    expect(vehicleClassOf(['UH-1H'], ['Air+Rotorcraft'])).toBe('helicopter');
    expect(vehicleClassOf(['AIM_120C'], ['Weapon+Missile'])).toBe('weapon');
  });

  it('classes prefixed model names, drones, riders and plain class words', () => {
    // Nation and category words before the model.
    expect(vehicleClassOf(['DEU_Tank_Tiger_I'], [])).toBe('tank');
    expect(vehicleClassOf(['DEU_Air_Fokker_Dr1'], [])).toBe('fighter');
    // A name shared with a jet, typed as a helicopter, is the helicopter.
    expect(vehicleClassOf(['Venom'], ['Helicopter'])).toBe('helicopter');
    // Drones are no helicopters, riders no armoured cars, jet skis no tanks.
    expect(vehicleClassOf(['quadcopter'], [])).toBe('otherAir');
    expect(vehicleClassOf([''], ['drone / UAV'])).toBe('otherAir');
    expect(vehicleClassOf(['horse'], [])).toBe('infantry');
    expect(vehicleClassOf(['jet ski'], [])).toBe('ship');
    // Class words a converter writes.
    expect(vehicleClassOf([''], ['on foot'])).toBe('infantry');
    expect(vehicleClassOf([''], ['anti-air vehicle'])).toBe('spaa');
    expect(vehicleClassOf([''], ['attack plane'])).toBe('attack');
    expect(vehicleClassOf([''], ['scout helicopter'])).toBe('helicopter');
  });
});

describe('canonical columns in a load', () => {
  it('adds event type, player or AI and vehicle class, a weapon its launcher', () => {
    // A player's F-16 and an AI MiG; the F-16 fires a missile 30 m from itself.
    const n = 6;
    const b = new DatasetBuilder();
    b.append(
      block(n, {
        time: Float64Array.from([0, 0, 1, 1, 2, 3]),
        px: Float32Array.from([0, 5000, 30, 5000, 900, 2000]),
        personIds: Uint32Array.from([0, 1, 2, 1, 2, 2]),
        personLabels: ['a', 'b', 'w'],
        attrs: [
          cat('Type', ['Air+FixedWing', 'Air+FixedWing', 'Weapon+Missile', 'Air+FixedWing', 'Weapon+Missile', 'Weapon+Missile']),
          cat('Name', ['F-16C_50', 'MiG-21Bis', 'AIM_120C', 'MiG-21Bis', 'AIM_120C', 'AIM_120C']),
          cat('Pilot', ['Viper', 'Kutaisi-patrol-01', '', 'Kutaisi-patrol-01', '', '']),
          cat('Group', ['Gudauta_F-16_1', 'Kutaisi-patrol', '', 'Kutaisi-patrol', '', '']),
          cat('Event', ['', '', '', '', '', 'Destroyed']),
        ],
      }),
    );
    const d = b.finish('t');
    expect(labelsOf(d, CANON.actor)).toEqual(['player', 'ai', 'player', 'ai', 'player', 'player']);
    expect(labelsOf(d, CANON.event)).toEqual(['position', 'position', 'launch', 'position', 'position', 'death']);
    expect(labelsOf(d, CANON.vehicleClass).slice(0, 3)).toEqual(['fighter', 'fighter', 'weapon']);
  });

  it('never takes a thrown object for its thrower: a flight starts with a launch, the rest are not positions', () => {
    expect(eventKindOf('grenade')).toBe('other');
    expect(eventKindOf('projectile')).toBe('other');
    // One thrower: walking, a grenade's flight (3 samples), walking, a second flight a while later.
    const ev = ['position', 'grenade', 'grenade', 'grenade', 'position', 'grenade', 'grenade'];
    const labels = [...new Set(ev)];
    const out = canonicalColumns({
      n: ev.length,
      cats: [{ name: 'event', data: Uint32Array.from(ev, (v) => labels.indexOf(v)), labels }],
      person: new Uint32Array(ev.length),
      session: null,
      time: Float32Array.from([0, 0.1, 0.2, 0.3, 0.4, 5, 5.1]),
      px: new Float32Array(ev.length),
      py: new Float32Array(ev.length),
      pz: new Float32Array(ev.length),
      units: 1,
    });
    const col = out.find((c) => c.name === CANON.event)!;
    expect(Array.from(col.data as Uint32Array, (i) => col.categories![i])).toEqual(['position', 'launch', 'other', 'other', 'position', 'launch', 'other']);
    // Where the source logs its throws, the flights stay out of both.
    const ev2 = ['position', 'throw', 'grenade', 'grenade'];
    const l2 = [...new Set(ev2)];
    const c2 = canonicalColumns({
      n: 4,
      cats: [{ name: 'event', data: Uint32Array.from(ev2, (v) => l2.indexOf(v)), labels: l2 }],
      person: new Uint32Array(4),
      session: null,
      time: Float32Array.from([0, 1, 1, 1.1]),
      px: new Float32Array(4),
      py: new Float32Array(4),
      pz: new Float32Array(4),
      units: 1,
    }).find((c) => c.name === CANON.event)!;
    expect(Array.from(c2.data as Uint32Array, (i) => c2.categories![i])).toEqual(['position', 'launch', 'other', 'other']);
  });

  it('leaves the columns out where the data says nothing', () => {
    expect(canonicalColumns({ n: 2, cats: [], person: null, session: null, time: null, px: new Float32Array(2), py: new Float32Array(2), pz: new Float32Array(2), units: 1 })).toEqual([]);
  });
});

describe('recordings far apart in time', () => {
  const rec = (name: string, t0: number) =>
    block(3, {
      time: Float64Array.from([t0, t0 + 10, t0 + 20]),
      timeIsAbsolute: true,
      sessionIds: new Uint32Array(3),
      sessionLabels: [name],
      sourceName: name,
    });

  it('start together, each from its own start', () => {
    const b = new DatasetBuilder();
    b.append(rec('one', 1.6e9));
    b.append(rec('two', 1.2e9));
    const d = b.finish('t');
    expect(d.recordingsAligned).toBe(2);
    expect(d.epochMs).toBeNull();
    expect(d.timeRange).toEqual([0, 20]);
  });

  it('keep their clock when they are one evening', () => {
    const b = new DatasetBuilder();
    b.append(rec('one', 1000));
    b.append(rec('two', 1030));
    const d = b.finish('t');
    expect(d.recordingsAligned).toBeUndefined();
    expect(d.timeRange).toEqual([0, 50]);
  });
});
