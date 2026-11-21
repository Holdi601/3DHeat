import { describe, expect, it } from 'vitest';
import { cleanName, designation, family, nickname, strongKeys, VehicleNames, vehicleSide } from './vehiclenames';

function filed(): VehicleNames<string> {
  const v = new VehicleNames<string>();
  v.add(['T-72B3'], 'wt:t72b3', 'ground');
  v.add(['2S6', '2S6 "Tunguska"'], 'wt:2s6', 'ground');
  v.add(['M1A2 SEP'], 'wt:m1a2sep', 'ground');
  v.add(['M1A2'], 'wt:m1a2', 'ground');
  v.add(['Leopard 2A4'], 'wt:leo2a4', 'ground');
  v.add(['Leopard 2A6'], 'wt:leo2a6', 'ground');
  v.add(['F-4E'], 'wt:f4e', 'air');
  v.add(['F-4EJ ADTW'], 'wt:f4ej', 'air');
  v.add(['M2A4', 'Light Tank M2A4'], 'wt:m2a4-light-tank', 'ground');
  v.add(['M3 Bradley'], 'wt:m3', 'ground');
  v.add(['SU-57'], 'wt:su57-spg', 'ground');
  v.add(['UH-1B'], 'wt:uh1b', 'heli');
  v.add(['Venom FB.4'], 'wt:venom', 'air');
  v.add(["Char d'assaut \"Saint-Chamond\""], 'wt:saint-chamond', 'ground');
  v.add(['Pz.IV H'], 'wt:pz4h', 'ground');
  v.add(['MiG-29'], 'wt:mig29', 'air');
  v.add(['M2A2'], 'wt:m2a2-bradley', 'ground');
  v.add(['LVT-4/40 Bofors'], 'wt:lvt', 'ground');
  return v;
}

describe('vehicle names across games', () => {
  it('clean a name of what only qualifies it', () => {
    expect(cleanName('T-72B3 obr. 2016')).toBe('T-72B3');
    expect(cleanName('MBT T-72B3')).toBe('T-72B3');
    expect(cleanName('Su-57 (T-50)')).toBe('Su-57');
    expect(cleanName('M1A2C SEP v3')).toBe('M1A2C');
    expect(cleanName('Pz.Kpfw.IV Ausf.H')).toBe('Pz.IV H');
    expect(cleanName('Merkava Mk.IV')).toBe('Merkava Mk 4');
    expect(cleanName('Type 052B Destroyer')).toBe('Type 052B');
  });

  it('read designations, families and nicknames', () => {
    expect(designation('AH-1Z Viper')).toBe('ah1z');
    expect(designation('JAS 39 Gripen')).toBe('jas39');
    expect(designation('M2A4 Bradley')).toBe('');
    expect(family('leopard2a7')).toBe('leopard2');
    expect(family('t72b3')).toBe('t72');
    expect(family('2k22')).toBe('');
    expect(nickname('2S6 "Tunguska"')).toBe('tunguska');
    expect(nickname('2K22 Tunguska')).toBe('tunguska');
    expect(nickname('2K22 Tunguska (night)')).toBe('tunguska');
    expect(strongKeys('Fulcrum')).toContain('mig29');
  });

  it('find the same vehicle under its other names', () => {
    const v = filed();
    expect(v.find(['T-72B3 obr. 2016'], 'ground')).toEqual({ value: 'wt:t72b3', tier: 'same' });
    expect(v.find(['T72B3'], 'ground')?.value).toBe('wt:t72b3');
    expect(v.find(['M1A2 SEP'], 'ground')?.value).toBe('wt:m1a2sep');
    expect(v.find(['M-1 Abrams'], 'ground')?.value).toBe('wt:m1a2');
    expect(v.find(['SA-19 Grison'], 'ground')?.value).toBe('wt:2s6');
    expect(v.find(['Pz.Kpfw. IV Ausf. H'], 'ground')?.value).toBe('wt:pz4h');
    expect(v.find(['MiG-29A Fulcrum'], 'air')?.value).toBe('wt:mig29');
  });

  it('else the nearest of the family, a parent before a sibling', () => {
    const v = filed();
    expect(v.find(['Leopard 2A7'], 'ground')).toEqual({ value: 'wt:leo2a6', tier: 'family' });
    expect(v.find(['F-4E-45MC'], 'air')?.value).toBe('wt:f4e');
    expect(v.find(['UH-1Y Venom'], 'heli')?.value).toBe('wt:uh1b');
  });

  it('else the same nickname, and never across kinds', () => {
    const v = filed();
    expect(v.find(['M2A4 Bradley'], 'ground')).toEqual({ value: 'wt:m3', tier: 'nickname' });
    expect(v.find(['Saint-Chamond'], 'ground')?.value).toBe('wt:saint-chamond');
    expect(v.find(['Su-57 (T-50)'], 'air')).toBeNull();
    expect(v.find(['M2 Browning'], 'ground')).toBeNull();
    expect(v.find(['M2A1'], 'ground')).toBeNull();
    expect(v.find(['40mm Bofors'], 'ground')).toBeNull();
    expect(vehicleSide('air', 'heli-transport')).toBe('heli');
    expect(vehicleSide('air', 'helicopter typeFighter')).toBe('heli');
    expect(vehicleSide('air', 'fighter')).toBe('air');
  });
});
