/**
 * What each car is called, where the lap file does not say.
 *
 * Newer FH Companion lap files carry the car's name; older ones only its
 * number. The name is also in the lap library's folders -
 * `<course>/<class>/<name> '<yy> (car<number>)/<tune>/<tag>/<lap>.json` -
 * which a folder pick or a dropped folder brings along. And once one lap
 * has named a car, every lap in the same car can be called that: the laps
 * loaded together, and laps loaded later in this browser.
 */

import type { LapTrace } from './lap';

/** A car folder of the lap library: the name and the number, or the number alone. */
const NAMED = /^(.+) \(car(\d+)\)$/;
const NUMBERED = /^car(\d+)$/;

/** The car a lap library path names, from its innermost car folder. */
export function carFromPath(path: string): { name?: string; ordinal?: number } {
  const parts = path.split(/[\\/]/).slice(0, -1).reverse();
  for (const part of parts) {
    const named = NAMED.exec(part);
    if (named) return { name: named[1].trim(), ordinal: Number(named[2]) };
    const numbered = NUMBERED.exec(part);
    if (numbered) return { ordinal: Number(numbered[1]) };
  }
  return {};
}

/**
 * The course a lap library path is in, from its course folder - `<name>
 * (course_<start>_to_<end>)`, or the bare `course_...` of a course without a
 * name - or null outside the library. The key is the name and the start: a
 * run that never finished is kept under the same name and start with where
 * it stopped as its end (in `unfinished/`), and is still that course.
 */
export function courseFromPath(path: string): { key: string; name: string } | null {
  for (const part of path.split(/[\\/]/).slice(0, -1)) {
    const named = /^(.+) \((course_[^()]*)\)$/.exec(part);
    const bare = /^course_-?\d/.test(part) ? part : null;
    const id = named ? named[2] : bare;
    if (!id) continue;
    const start = /^course_(-?\d+(?:\.\d+)?_-?\d+(?:\.\d+)?)_to_/.exec(id)?.[1] ?? id;
    const name = named ? named[1] : id;
    return { key: `${name}|${start}`, name };
  }
  return null;
}

const KEY = 'heat3d.carNames';

function remembered(): Record<string, string> {
  try {
    const raw = localStorage.getItem(KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    return parsed && typeof parsed === 'object' ? (parsed as Record<string, string>) : {};
  } catch {
    return {};
  }
}

function remember(names: Record<string, string>): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(names));
  } catch {
    // A private window or blocked storage: the names last as long as the laps.
  }
}

/** One game's car number, as a key: the same number is another car in another game. */
function keyOf(lap: LapTrace): string | null {
  return lap.car.ordinal !== undefined && Number.isFinite(lap.car.ordinal) ? `${lap.game}:${lap.car.ordinal}` : null;
}

/**
 * Give every unnamed lap the name another lap in the same car has - among
 * `laps`, or remembered from laps loaded before - and remember the names
 * `laps` bring. Changes the laps in place.
 */
export function nameCars(laps: LapTrace[]): void {
  const known = remembered();
  let learned = false;
  for (const lap of laps) {
    const key = keyOf(lap);
    if (key && lap.car.name && known[key] !== lap.car.name) {
      known[key] = lap.car.name;
      learned = true;
    }
  }
  for (const lap of laps) {
    const key = keyOf(lap);
    if (key && !lap.car.name && known[key]) lap.car = { ...lap.car, name: known[key] };
  }
  if (learned) remember(known);
}
