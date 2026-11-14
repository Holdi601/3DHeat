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
