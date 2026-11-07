import { describe, expect, it } from 'vitest';
import { CATALOG } from './catalog';
import { figureFor, figureForName, figureForType } from './match';
import { FigureReplay } from './replay';
import { CUBE_STRIDE } from '../data/tracks';
import type { Dataset } from '../state/types';

describe('matching data to figures', () => {
  it('finds named types by name, spelling and prefix', () => {
    expect(figureForName('f-16c')).toBe('f-16c');
    expect(figureForName('F-16C')).toBe('f-16c');
    expect(figureForName('F-16C_50')).toBe('f-16c');
    expect(figureForName('ZSU-23-4 Shilka')).toBe('zsu-23-4-shilka');
    expect(figureForName('Mi-24P')).toBe('mi-24p-hind');
    expect(figureForName('qwerty')).toBeNull();
  });

  it('maps type tags and icons to a class figure', () => {
    const cls = (tags: string) => {
      const f = figureForType(tags);
      return f ? CATALOG[f].cls : null;
    };
    expect(['heli-attack', 'heli-transport']).toContain(cls('Air+Rotorcraft'));
    expect(['multirole', 'fighter', 'attack']).toContain(cls('Air+FixedWing'));
    expect(cls('Ground+Heavy+Armor+Vehicle+Tank')).toBe('mbt');
    expect(cls('MediumTank')).toBe('mbt');
    expect(['spaa', 'sam']).toContain(cls('Ground+AntiAircraft'));
    expect(['aam', 'agm']).toContain(cls('Weapon+Missile'));
    expect(cls('Sea+Watercraft+Warship')).toBe('destroyer');
    expect(cls('Ground+Light+Human+Infantry')).toBe('soldier');
    expect(figureForType('Misc+Shrapnel')).toBeNull();
  });

  it('does not take a name from another domain than the type says', () => {
    // Arma's Typhoon is a truck, not the Hawker fighter of that name.
    const truck = figureFor(['Typhoon'], ['Car']);
    expect(truck).not.toBeNull();
    expect(CATALOG[truck!].domain).toBe('ground');
    // A bare helicopter type is a plain helicopter, not an attack one.
    expect(CATALOG[figureFor(['Mi-290 Taru'], ['Helicopter'])!].cls).not.toBe('heli-attack');
    expect(CATALOG[figureFor([], ['Mortar'])!].domain).toBe('ground');
  });

  it('prefers the name over the type', () => {
    expect(figureFor(['Su-27'], ['Air+FixedWing'])).toBe('su-27');
    expect(figureFor(['Unknown thing'], ['Air+Rotorcraft'])).not.toBeNull();
  });
});

describe('figure replay', () => {
  const dataset = (withTypes: boolean): Dataset =>
    ({
      attrs: withTypes
        ? [
            { name: 'Name', kind: 'category', data: new Uint32Array([0, 1, 2]), min: 0, max: 2, categories: ['F-16C', 'T-90A', 'Mystery'] },
            { name: 'Type', kind: 'category', data: new Uint32Array([0, 1, 2]), min: 0, max: 2, categories: ['Air+FixedWing', 'Ground+Tank', 'Misc+Container'] },
          ]
        : [],
      yaw: new Float32Array(3),
      personId: new Uint32Array([0, 1, 2]),
    }) as unknown as Dataset;
  const cubes = new Float32Array(3 * CUBE_STRIDE);
  for (let i = 0; i < 3; i++) cubes.set([i * 20, 0, 0, 0.2, 0.5, 0.9, 0, 0], i * CUBE_STRIDE);
  const rows = new Int32Array([0, 1, 2]);

  it('draws known things as figures and leaves the unknown a box', () => {
    const fr = new FigureReplay();
    const d = dataset(true);
    fr.build(d, cubes, 3, rows, { scale: 1, unknown: fr.knowsTypes(d) ? 'box' : 'soldier' });
    expect(fr.tris.count).toBeGreaterThan(300);
    expect(fr.restCount).toBe(1);
    expect(fr.rest[0]).toBe(40);
  });

  it('draws everyone as a soldier when the data says nothing about what they are', () => {
    const fr = new FigureReplay();
    const d = dataset(false);
    fr.build(d, cubes, 3, rows, { scale: 1, unknown: fr.knowsTypes(d) ? 'box' : 'soldier' });
    expect(fr.restCount).toBe(0);
    expect(fr.tris.count).toBeGreaterThan(3 * 50);
  });
});
