import { describe, expect, it } from 'vitest';
import { domainOfWord, isVehicleField, VEHICLE_FIELDS, wrongForDomain } from './kindFields';

describe('a unit card by what the unit is', () => {
  it("reads the kind words games use", () => {
    expect(['tank', 'spaa', 'apc'].map(domainOfWord)).toEqual(['ground', 'ground', 'ground']);
    expect(['aircraft', 'helicopter', 'typeFighter'].map(domainOfWord)).toEqual(['air', 'air', 'air']);
    expect(['ship', 'destroyer', 'boat'].map(domainOfWord)).toEqual(['sea', 'sea', 'sea']);
    expect(domainOfWord('')).toBeNull();
  });

  it('shows no flight data for a tank or a ship, and no turret for an aircraft', () => {
    for (const f of ['mach', 'aoa', 'g', 'energy', 'tas', 'ias']) {
      expect(wrongForDomain(f, 'ground')).toBe(true);
      expect(wrongForDomain(f, 'sea')).toBe(true);
      expect(wrongForDomain(f, 'air')).toBe(false);
    }
    for (const f of ['gs', 'heading', 'hitsTaken', 'vehicleInfo']) expect(wrongForDomain(f, 'ground')).toBe(false);
    expect(wrongForDomain('turretHeading', 'air')).toBe(true);
    expect(VEHICLE_FIELDS.every(isVehicleField)).toBe(true);
  });
});
