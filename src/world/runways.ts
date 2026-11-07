import type { GeoBox } from './tiles';

/**
 * Runways from OurAirports: every runway's two ends as surveyed, its width
 * and surface. The data is in the public domain; one CSV for the whole world
 * (about 4 MB), downloaded only when a backdrop asks for runways and kept in
 * the tile cache like the tiles.
 *
 * OpenStreetMap's aeroway layer draws most runways too, but not every one,
 * and as a polygon or a line whose ends are whatever the mapper traced. The
 * ends here are the thresholds' coordinates, which is what a landing is
 * judged against. Runways without end coordinates (many small fields) are
 * left out rather than guessed.
 */
export const OURAIRPORTS_RUNWAYS = 'https://davidmegginson.github.io/ourairports-data/runways.csv';

export interface Runway {
  airport: string;
  /** The two ends, [lat, lon] degrees: the low-numbered end first. */
  le: [number, number];
  he: [number, number];
  leIdent: string;
  heIdent: string;
  /** Metres; 30 when the list has no width. */
  width: number;
  surface: string;
}

const FEET = 0.3048;

/** One CSV line's fields: commas inside quotes kept, doubled quotes undoubled. */
export function csvFields(line: string): string[] {
  const out: string[] = [];
  let cur = '';
  let quoted = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (quoted) {
      if (c === '"') {
        if (line[i + 1] === '"') {
          cur += '"';
          i++;
        } else quoted = false;
      } else cur += c;
    } else if (c === '"') quoted = true;
    else if (c === ',') {
      out.push(cur);
      cur = '';
    } else cur += c;
  }
  out.push(cur);
  return out;
}

/** The runways of OurAirports' runways.csv that have both ends and are not closed. */
export function parseRunways(text: string): Runway[] {
  const lines = text.split(/\r?\n/);
  const head = csvFields(lines[0] ?? '');
  const col = (name: string) => head.indexOf(name);
  const c = {
    airport: col('airport_ident'),
    width: col('width_ft'),
    surface: col('surface'),
    closed: col('closed'),
    leIdent: col('le_ident'),
    leLat: col('le_latitude_deg'),
    leLon: col('le_longitude_deg'),
    heIdent: col('he_ident'),
    heLat: col('he_latitude_deg'),
    heLon: col('he_longitude_deg'),
  };
  if (c.leLat < 0 || c.leLon < 0 || c.heLat < 0 || c.heLon < 0) return [];
  const out: Runway[] = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line) continue;
    const f = csvFields(line);
    if (f[c.closed] === '1') continue;
    const le: [number, number] = [Number(f[c.leLat]), Number(f[c.leLon])];
    const he: [number, number] = [Number(f[c.heLat]), Number(f[c.heLon])];
    if (!f[c.leLat] || !f[c.heLat] || !f[c.leLon] || !f[c.heLon] || ![...le, ...he].every(Number.isFinite)) continue;
    const w = Number(f[c.width]);
    out.push({
      airport: f[c.airport] ?? '',
      le,
      he,
      leIdent: f[c.leIdent] ?? '',
      heIdent: f[c.heIdent] ?? '',
      width: Number.isFinite(w) && w > 0 ? w * FEET : 30,
      surface: f[c.surface] ?? '',
    });
  }
  return out;
}

/** The runways with at least one end inside a box. */
export function runwaysIn(runways: Runway[], box: GeoBox): Runway[] {
  const inside = (p: [number, number]) => p[0] >= box.south && p[0] <= box.north && p[1] >= box.west && p[1] <= box.east;
  return runways.filter((r) => inside(r.le) || inside(r.he));
}
