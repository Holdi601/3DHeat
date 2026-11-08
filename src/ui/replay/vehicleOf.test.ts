import { describe, expect, it } from 'vitest';
import { vehicleOf, type Unit } from './units';

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
