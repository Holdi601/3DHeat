import { describe, expect, it } from 'vitest';
import { sortUnits, vehicleOf, type Unit } from './units';

const unit: Unit = {
  key: 'p',
  name: 'p',
  vehicle: 'Challenger 2 TES',
  vehicles: ['Challenger 2 TES', 'Challenger 2', 'ADATS (M113)'],
  kind: 'player',
  team: 0,
  persons: [76, 177, 173],
  spans: [
    [15, 110],
    [115, 190],
    [192, 340],
  ],
};

describe('a player who changes vehicle', () => {
  it('is named by the vehicle of the life on show', () => {
    expect(vehicleOf(unit, 173)).toBe('ADATS (M113)');
    expect(vehicleOf(unit, 177)).toBe('Challenger 2');
    expect(vehicleOf(unit, 76)).toBe('Challenger 2 TES');
  });

  it('falls back to the first vehicle for a track it does not know', () => {
    expect(vehicleOf(unit, 999)).toBe('Challenger 2 TES');
  });
});

describe('sorting units', () => {
  const mk = (name: string): Unit => ({ ...unit, key: name, name });
  it('orders names ignoring case and accents, numbers by value', () => {
    const names = sortUnits([mk('Unit 10'), mk('unit 9'), mk('Émile'), mk('alpha'), mk('Zulu')]).map((u) => u.name);
    expect(names).toEqual(['alpha', 'Émile', 'unit 9', 'Unit 10', 'Zulu']);
  });

  it('sorts a million units quickly', () => {
    const many = Array.from({ length: 1_000_000 }, (_, i) => mk(`Unit ${(i * 7919) % 1_000_000}`));
    const t0 = performance.now();
    const out = sortUnits(many);
    expect(out[0].name).toBe('Unit 0');
    expect(performance.now() - t0).toBeLessThan(4000);
  });
});
