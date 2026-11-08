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
    // A name that is a tank's figure may have its own figure in the air: the Re.2002 Ariete.
    expect(figureFor(['ariete'], ['aircraft'])).toBe('re-2000');
    expect(figureFor(['ariete'], ['tank'])).toBe('ariete');
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
    expect(fr.batches.list.reduce((n, b) => n + b.mesh.count * b.count, 0)).toBeGreaterThan(300);
    expect(fr.restCount).toBe(1);
    expect(fr.rest[0]).toBe(40);
  });

  it('draws everyone as a soldier when the data says nothing about what they are', () => {
    const fr = new FigureReplay();
    const d = dataset(false);
    fr.build(d, cubes, 3, rows, { scale: 1, unknown: fr.knowsTypes(d) ? 'box' : 'soldier' });
    expect(fr.restCount).toBe(0);
    expect(fr.batches.list.reduce((n, b) => n + b.mesh.count * b.count, 0)).toBeGreaterThan(3 * 50);
  });
});

describe('name matching, exact before prefix', () => {
  it('never lets a shorter name take a longer exact one by its prefix', () => {
    // Every catalogue name, written as data writes it, finds itself, however a shorter name begins it (mig-35 against mig-3).
    // Names that normalise alike (h-6k, the bomber; h6k, the flying boat) are told apart by aliases; the rest must find themselves.
    const key = (n: string) => n.toLowerCase().replace(/[^a-z0-9]+/g, '');
    const count = new Map<string, number>();
    for (const n of Object.keys(CATALOG)) count.set(key(n), (count.get(key(n)) ?? 0) + 1);
    const wrong = Object.keys(CATALOG).filter((n) => count.get(key(n)) === 1 && figureForName(n.replace(/-/g, '_')) !== n && figureForName(n.toUpperCase()) !== n);
    expect(wrong).toEqual([]);
    expect(figureForName('MiG-35')).toBe('mig-35');
    expect(figureForName('mig_35')).toBe('mig-35');
    expect(figureForName('MiG-3')).toBe('mig-3');
    expect(figureForName('H-6K')).toBe('h-6k');
  });
});
