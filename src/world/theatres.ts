import type { AxisMapping, Bounds, GeoReference } from '../state/types';
import { boxCentre, geoBoxOf, knownProjection, type GeoBox } from './tiles';

/**
 * Known real-world theatres: the parts of the earth a game's map covers, so a
 * backdrop can be built for a whole map rather than only for one recording.
 *
 * The boxes are facts, not code, gathered in the backdrop research notes:
 * DCS terrains from their published Transverse Mercator parameters and editor
 * bounds, IL-2 maps from their published sizes and the towns at their edges.
 * `approx` marks a box that is a rough estimate (the research could not check
 * it against a primary source); those are good enough for a coarse backdrop
 * and to pick a sub-area in, not for a border.
 *
 * `origin` is the theatre's tangent-plane reference: whole degrees near the
 * detailed area. The Watcher's DCS adapter places its tables on the same
 * point for the same theatre (exporters/watcher, `THEATRES` in
 * heat3d_watch/adapters/dcs.py), so a DCS table and the theatre's backdrop
 * share one plane and line up without moving anything. Data on any other
 * reference is lined up by moving the backdrop (`reproject.ts`).
 *
 * `detail` is where the theatre's detailed area is, the default middle of a
 * sub-area to build finely.
 */
export interface Theatre {
  id: string;
  game: 'dcs' | 'il2';
  /** The map's own name, as the game calls it; not translated. */
  name: string;
  box: GeoBox;
  origin: { lat: number; lon: number };
  detail: { lat: number; lon: number };
  /** The box is a rough estimate. */
  approx?: boolean;
  /** The map shows a past era, so present-day roads and towns are anachronistic on it. */
  historical?: boolean;
}

const box = (south: number, north: number, west: number, east: number): GeoBox => ({ south, north, west, east });

export const THEATRES: readonly Theatre[] = [
  // DCS World. Ids are DCS's own theatre names where known (mission.theatre).
  { id: 'Caucasus', game: 'dcs', name: 'Caucasus', box: box(38.9, 48.4, 26.8, 49.3), origin: { lat: 42, lon: 42 }, detail: { lat: 42.18, lon: 42.48 } },
  { id: 'Nevada', game: 'dcs', name: 'Nevada', box: box(35.3, 38.3, -118.6, -112.4), origin: { lat: 36, lon: -115 }, detail: { lat: 36.24, lon: -115.03 } },
  { id: 'Normandy', game: 'dcs', name: 'Normandy 2', box: box(48.2, 51.2, -5.8, 2.2), origin: { lat: 49, lon: 0 }, detail: { lat: 49.18, lon: -0.37 }, historical: true },
  { id: 'TheChannel', game: 'dcs', name: 'The Channel', box: box(49.7, 51.6, -0.1, 3.4), origin: { lat: 51, lon: 2 }, detail: { lat: 51.0, lon: 1.6 }, historical: true },
  { id: 'Syria', game: 'dcs', name: 'Syria', box: box(31.9, 37.7, 29.3, 42.4), origin: { lat: 34, lon: 36 }, detail: { lat: 33.6, lon: 36.0 } },
  { id: 'PersianGulf', game: 'dcs', name: 'Persian Gulf', box: box(24.1, 27.9, 52.3, 59.6), origin: { lat: 26, lon: 56 }, detail: { lat: 26.4, lon: 56.2 } },
  { id: 'MarianaIslands', game: 'dcs', name: 'Marianas', box: box(12.5, 16.0, 143.5, 146.5), origin: { lat: 13, lon: 145 }, detail: { lat: 13.45, lon: 144.8 }, approx: true },
  { id: 'MarianaIslandsWWII', game: 'dcs', name: 'Marianas WWII', box: box(12.5, 16.0, 143.5, 146.5), origin: { lat: 13, lon: 145 }, detail: { lat: 13.45, lon: 144.8 }, approx: true, historical: true },
  { id: 'Falklands', game: 'dcs', name: 'South Atlantic', box: box(-56, -46, -76, -55), origin: { lat: -52, lon: -58 }, detail: { lat: -51.7, lon: -58.0 }, approx: true },
  { id: 'SinaiMap', game: 'dcs', name: 'Sinai', box: box(25.9, 34.5, 28.1, 37.3), origin: { lat: 30, lon: 33 }, detail: { lat: 30.1, lon: 32.6 } },
  { id: 'Afghanistan', game: 'dcs', name: 'Afghanistan', box: box(23.0, 38.7, 60.3, 75.0), origin: { lat: 35, lon: 69 }, detail: { lat: 34.95, lon: 69.27 }, approx: true },
  { id: 'Kola', game: 'dcs', name: 'Kola', box: box(63.9, 74.2, -7.7, 52.1), origin: { lat: 69, lon: 33 }, detail: { lat: 68.97, lon: 33.08 }, approx: true },
  { id: 'GermanyCW', game: 'dcs', name: 'Germany Cold War', box: box(49.5, 54.5, 6.5, 14.5), origin: { lat: 51, lon: 10 }, detail: { lat: 50.55, lon: 9.68 }, approx: true, historical: true },
  { id: 'Iraq', game: 'dcs', name: 'Iraq', box: box(29.0, 37.5, 38.5, 48.5), origin: { lat: 33, lon: 44 }, detail: { lat: 33.3, lon: 44.4 }, approx: true },
  // IL-2 Great Battles: every box an estimate (no official bounds are published).
  { id: 'il2-stalingrad', game: 'il2', name: 'Stalingrad', box: box(47.5, 50.0, 42.0, 46.5), origin: { lat: 49, lon: 44 }, detail: { lat: 48.7, lon: 44.5 }, approx: true, historical: true },
  { id: 'il2-moscow', game: 'il2', name: 'Moscow', box: box(54.3, 57.0, 33.3, 38.3), origin: { lat: 56, lon: 37 }, detail: { lat: 55.75, lon: 37.6 }, approx: true, historical: true },
  { id: 'il2-kuban', game: 'il2', name: 'Kuban', box: box(43.9, 46.9, 35.5, 40.3), origin: { lat: 45, lon: 38 }, detail: { lat: 44.9, lon: 38.0 }, approx: true, historical: true },
  { id: 'il2-rheinland', game: 'il2', name: 'Rheinland', box: box(49.5, 53.0, 3.0, 9.5), origin: { lat: 51, lon: 6 }, detail: { lat: 51.5, lon: 6.0 }, approx: true, historical: true },
  { id: 'il2-normandy', game: 'il2', name: 'Normandy', box: box(48.0, 51.5, -2.5, 2.6), origin: { lat: 49, lon: 0 }, detail: { lat: 49.18, lon: -0.37 }, approx: true, historical: true },
  { id: 'il2-prokhorovka', game: 'il2', name: 'Prokhorovka', box: box(50.4, 51.4, 35.8, 37.6), origin: { lat: 51, lon: 37 }, detail: { lat: 51.04, lon: 36.73 }, approx: true, historical: true },
  { id: 'il2-velikie-luki', game: 'il2', name: 'Velikie Luki', box: box(55.8, 56.9, 29.6, 31.5), origin: { lat: 56, lon: 31 }, detail: { lat: 56.34, lon: 30.52 }, approx: true, historical: true },
  { id: 'il2-arras', game: 'il2', name: 'Arras', box: box(49.6, 50.9, 1.8, 3.9), origin: { lat: 50, lon: 3 }, detail: { lat: 50.29, lon: 2.78 }, approx: true, historical: true },
  { id: 'il2-odessa', game: 'il2', name: 'Odessa', box: box(45.3, 47.6, 29.5, 33.6), origin: { lat: 46, lon: 31 }, detail: { lat: 46.48, lon: 30.73 }, approx: true, historical: true },
  { id: 'il2-leningrad', game: 'il2', name: 'Finnish Gulf / Leningrad', box: box(59.2, 61.2, 26.7, 31.3), origin: { lat: 60, lon: 30 }, detail: { lat: 59.94, lon: 30.31 }, approx: true, historical: true },
  { id: 'il2-korea', game: 'il2', name: 'Korea', box: box(34.5, 41.0, 124.0, 130.0), origin: { lat: 40, lon: 125 }, detail: { lat: 40.1, lon: 124.4 }, approx: true, historical: true },
];

export function theatreById(id: string): Theatre | undefined {
  return THEATRES.find((t) => t.id === id);
}

/** The tangent plane a theatre's backdrop is built on when no data says otherwise. */
export function theatreGeo(t: Theatre): GeoReference {
  return { lat0: t.origin.lat, lon0: t.origin.lon, projection: 'tangent-plane' };
}

/** The theatre whose box holds a point, the smallest first; undefined when none does. */
export function theatreAt(lat: number, lon: number): Theatre | undefined {
  const area = (t: Theatre) => (t.box.north - t.box.south) * (t.box.east - t.box.west);
  return THEATRES.filter((t) => lat >= t.box.south && lat <= t.box.north && lon >= t.box.west && lon <= t.box.east).sort(
    (a, b) => area(a) - area(b),
  )[0];
}

/** DCS terrain folders (Mods/terrains/<folder>, as the DCS converter names a theatre) whose id here differs. */
const DCS_FOLDERS: Record<string, string> = { GermanyColdWar: 'GermanyCW', MarianasWWII: 'MarianaIslandsWWII', Sinai: 'SinaiMap' };

/** The theatre a DCS terrain folder is; undefined for one not listed. */
export function theatreOfDcsFolder(folder: string): Theatre | undefined {
  const th = theatreById(DCS_FOLDERS[folder] ?? folder);
  return th?.game === 'dcs' ? th : undefined;
}

/**
 * The theatre recorded data is on: the one holding the middle of the data's
 * extent, else the one holding its reference. A Tacview file's reference is
 * often a whole degree outside the map (a DCS Caucasus recording names 38 N
 * 36 E, in the Turkish uplands), so the extent decides first.
 */
export function theatreOfData(geo: GeoReference, bounds: Bounds | null | undefined, axes: AxisMapping | null | undefined): Theatre | undefined {
  // The Watcher's DCS tables name their theatre.
  const named = geo.theatre ? theatreOfDcsFolder(geo.theatre) : undefined;
  if (named) return named;
  if (bounds && Number.isFinite(bounds.minX) && knownProjection(geo)) {
    try {
      const c = boxCentre(geoBoxOf(geo, bounds, axes, 0));
      const th = theatreAt(c.lat, c.lon);
      if (th) return th;
    } catch {
      // The reference decides.
    }
  }
  return theatreAt(geo.lat0, geo.lon0);
}
