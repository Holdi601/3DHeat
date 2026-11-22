import { describe, expect, it } from 'vitest';
import { il2PartLabel, plateTitle } from './il2parts';

describe('IL-2 damage-model part names', () => {
  it('reads the region from the part number', () => {
    expect(il2PartLabel('Cf.10200')).toBe('fuselage 1, bottom');
    expect(il2PartLabel('Object044.10213')).toBe('fuselage 2, right');
    expect(il2PartLabel('Object026.11110')).toBe('right wing 1, bottom');
    expect(il2PartLabel('Object038.11140')).toBe('left wing 3, bottom');
    expect(il2PartLabel('Ailer_L.12240')).toBe('left aileron');
    expect(il2PartLabel('Ailer_R.12245')).toBe('right aileron');
    expect(il2PartLabel('RN.12450')).toBe('rudder');
    expect(il2PartLabel('14143.14161')).toBe('engine 1');
    expect(il2PartLabel('Blade0.15101')).toBe('propeller 1');
    expect(il2PartLabel('Glass_unD01.23000')).toBe('glass');
    expect(il2PartLabel('11180')).toBe('left wing 5, bottom');
    expect(il2PartLabel('GearL1')).toBe('left landing gear');
    expect(il2PartLabel('Blister3')).toBe('canopy');
  });

  it('leaves other games’ names alone', () => {
    expect(il2PartLabel('hull_front_dm')).toBeNull();
    expect(plateTitle('hull_front_dm')).toBe('hull front');
    expect(plateTitle('Cf.10200')).toBe('fuselage 1, bottom (Cf.10200)');
  });
});
