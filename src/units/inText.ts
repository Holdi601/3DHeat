/**
 * Units inside sentences: the race analysis says "braked 40 m earlier, from
 * 182 km/h" in messages whose unit words are part of the translation. A value
 * that is a speed or a length is handed to the message marked (`speedArg`,
 * `lengthArg`) and already in the viewer's units; when the message is
 * written out (`reword`, run by `t` on any text with a mark), each mark is
 * taken away and, where the message puts the metric unit word right after
 * the number, that word becomes the viewer's unit's. A number with no unit
 * word after it (the first of "from 182 down to 95 km/h") is converted all
 * the same, so a sentence never mixes the two.
 */

import { num, t } from '../i18n';
import { toAltitude, toSpeed, type UnitPrefs } from './units';

/** The invisible mark round a converted number: kind letter after the first, the number between. */
export const MARK = '⁣';

/** A speed (m/s) as a marked number in the viewer's speed unit. */
export function speedArg(ms: number, u: UnitPrefs, digits = 0): string {
  if (!Number.isFinite(ms)) return num(ms, digits);
  return `${MARK}S${num(toSpeed(ms, u.speed), digits)}${MARK}`;
}

/** A length (metres) as a marked number in the viewer's length unit (m or ft). */
export function lengthArg(m: number, u: UnitPrefs, digits = 0): string {
  if (!Number.isFinite(m)) return num(m, digits);
  return `${MARK}L${num(toAltitude(m, u.altitude), digits)}${MARK}`;
}

/** What follows the number in a "{v} unit" message, in the current language: " km/h". */
function suffixOf(key: string): string {
  const s = t(key, { v: '\u0001' });
  const i = s.indexOf('\u0001');
  return i >= 0 ? s.slice(i + 1) : '';
}

const SPEED_KEY: Record<UnitPrefs['speed'], string> = { kmh: 'race.channel.unit.kmh', ms: 'race.channel.unit.metrePerSecond', kt: 'replay.unit.kt', mph: 'units.v.mph' };
const LENGTH_KEY: Record<UnitPrefs['altitude'], string> = { m: 'race.channel.unit.metre', ft: 'replay.unit.ft' };

/** `text` with its marks taken away and the metric unit word after each marked number made the viewer's. */
export function reword(text: string, u: UnitPrefs): string {
  if (!text.includes(MARK)) return text;
  const words: Record<string, [string, string]> = {
    S: [suffixOf('race.channel.unit.kmh'), suffixOf(SPEED_KEY[u.speed])],
    L: [suffixOf('race.channel.unit.metre'), suffixOf(LENGTH_KEY[u.altitude])],
  };
  const re = new RegExp(`${MARK}([SL])([^${MARK}]*)${MARK}`, 'g');
  let out = '';
  let last = 0;
  for (let m = re.exec(text); m; m = re.exec(text)) {
    out += text.slice(last, m.index) + m[2];
    last = m.index + m[0].length;
    const [from, to] = words[m[1]];
    // The unit word right after the number, and not the start of a longer one ("m/s²" after a length is not its unit).
    if (from && from !== to && text.startsWith(from, last) && !/^[\p{L}/²³]/u.test(text.slice(last + from.length, last + from.length + 1))) {
      out += to;
      last += from.length;
    }
  }
  return out + text.slice(last);
}
