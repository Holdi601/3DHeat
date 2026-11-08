/**
 * The viewer's units (`units/units.ts`): one setting for every panel, label,
 * chart and export, kept in this browser. A viewer who had the replay's old
 * "aviation" switch on starts in the aviation preset.
 */

import { create } from 'zustand';
import { formatLength } from '../units/format';
import { setMarkedText } from '../i18n';
import { lengthArg as markLength, reword, speedArg as markSpeed } from '../units/inText';
import { DEFAULT_UNIT_SETTINGS, toAltitude, readUnitSettings, resolveUnits, type Quantity, type UnitPrefs, type UnitPreset, type UnitSettings } from '../units/units';

const KEY = 'heat3d.units';

function load(): UnitSettings {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return readUnitSettings(JSON.parse(raw));
    // The replay's own switch, before there was one for everything.
    const old = JSON.parse(localStorage.getItem('heat3d.replay') ?? 'null');
    if (old && old.units === 'imperial') return { preset: 'aviation', overrides: {} };
  } catch {
    // Storage blocked or broken: the default.
  }
  return DEFAULT_UNIT_SETTINGS;
}

function save(s: UnitSettings): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(s));
  } catch {
    // Not kept, still used.
  }
}

interface UnitsState {
  settings: UnitSettings;
  /** The units in force. */
  prefs: UnitPrefs;
  setPreset(p: UnitPreset): void;
  /** One quantity's own unit; null goes back to the preset's. */
  setUnit<Q extends Quantity>(q: Q, u: UnitPrefs[Q] | null): void;
}

const initial = load();

export const useUnitsStore = create<UnitsState>((set, get) => ({
  settings: initial,
  prefs: resolveUnits(initial),
  setPreset(p) {
    // A preset is a fresh start: the quantities set apart go back to it.
    const settings: UnitSettings = { preset: p, overrides: {} };
    save(settings);
    set({ settings, prefs: resolveUnits(settings) });
  },
  setUnit(q, u) {
    const overrides = { ...get().settings.overrides };
    if (u === null) delete overrides[q];
    else overrides[q] = u;
    const settings: UnitSettings = { preset: get().settings.preset, overrides };
    save(settings);
    set({ settings, prefs: resolveUnits(settings) });
  },
}));

/** The units in force, outside React. */
export function unitPrefs(): UnitPrefs {
  return useUnitsStore.getState().prefs;
}

/** The units in force; re-renders when they change. */
export function useUnits(): UnitPrefs {
  return useUnitsStore((s) => s.prefs);
}

/**
 * A length (a size, a radius, a short distance) in metres or feet as the
 * viewer chose, `digits` decimals for the number as shown.
 */
export function lengthText(m: number, digits: (shown: number) => number = (v) => (Math.abs(v) < 10 ? 2 : 0)): string {
  const u = unitPrefs();
  return formatLength(m, u, digits(Math.abs(toAltitude(m, u.altitude))));
}

// Sentences with marked speeds and lengths (the race analysis) said in the viewer's units.
setMarkedText((text) => reword(text, unitPrefs()));

/** A speed (m/s) for a sentence: in the viewer's unit, its unit word put right where the sentence has one (`units/inText.ts`). */
export function speedArg(ms: number, digits = 0): string {
  return markSpeed(ms, unitPrefs(), digits);
}

/** A length (metres) for a sentence, as `speedArg`. */
export function lengthArg(m: number, digits = 0): string {
  return markLength(m, unitPrefs(), digits);
}
