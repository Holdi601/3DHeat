import { describe, expect, it, vi } from 'vitest';
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

  // A large overlay has a million units: what made that slow was a locale compare (or a key built) per comparison,
  // n log n of them. Counted rather than timed, so a busy machine cannot fail it: one key per unit, no locale compare.
  it('sorts many units with one key each, never a compare per pair', () => {
    const n = 50_000;
    const many = Array.from({ length: n }, (_, i) => mk(`Unit ${(i * 7919) % n}`));
    const normalize = vi.spyOn(String.prototype, 'normalize');
    const localeCompare = vi.spyOn(String.prototype, 'localeCompare');
    try {
      const out = sortUnits(many);
      expect(normalize.mock.calls.length).toBeLessThanOrEqual(n);
      expect(localeCompare).not.toHaveBeenCalled();
      expect(out.map((u) => u.name).slice(0, 3)).toEqual(['Unit 0', 'Unit 1', 'Unit 2']);
      expect(out[n - 1].name).toBe(`Unit ${n - 1}`);
      let unordered = 0;
      for (let i = 1; i < n; i++) if (Number(out[i].name.slice(5)) <= Number(out[i - 1].name.slice(5))) unordered++;
      expect(unordered).toBe(0);
    } finally {
      normalize.mockRestore();
      localeCompare.mockRestore();
    }
  });
});
