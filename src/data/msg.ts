/**
 * What the data code has to say, said where it is shown.
 *
 * The ingest and model workers have no language - the viewer's is chosen on
 * the main thread - so what they have to tell the user leaves them as a
 * message: a catalog key and its values (`Msg`), said in the viewer's language
 * by `say` once it is back on the main thread. Numbers travel as numbers and
 * are written the reading language's way only then.
 *
 * Until the main thread lends its language (`speakWith`, from the store),
 * `say` speaks the English catalog with numbers as the host writes them -
 * which is what a worker says, and what a test hears.
 */

import { formatMessage, type Values } from '../i18n/message';
import type { Dataset } from '../state/types';

/** A message: a catalog key and the values to fill in. */
export interface Msg {
  key: string;
  values?: MsgValues;
}

export type MsgValues = Record<string, MsgValue>;

/**
 * A value for a message: put in as it is (text, or a number for a plural),
 * another message said first, a number written the reading language's way -
 * whole (`int`), with `digits` decimals (`num`), or as the ordinal category
 * ("one", "two", "few", "other") a `select` picks "1st", "2nd", "3rd" by - or
 * several names or whole messages one after the other, `between` them a
 * separator such as ", ", " · " or a line break.
 */
export type MsgValue =
  | string
  | number
  | Msg
  | { int: number }
  | { num: number; digits: number }
  | { ordinal: number }
  | { each: Array<string | Msg>; between: string };

export function msg(key: string, values?: MsgValues): Msg {
  return values ? { key, values } : { key };
}

/** An error that says what is wrong as a message, so the main thread can say it in its language. */
export class MsgError extends Error {
  readonly msg: Msg;
  constructor(m: Msg) {
    super(say(m));
    this.msg = m;
  }
}

/** What an error says: its message when it carries one, or its text. */
export function errorMsg(err: unknown): Msg | string {
  if (err instanceof MsgError) return err.msg;
  return err instanceof Error ? err.message : String(err);
}

/** How the main thread speaks: the i18n module's own functions. */
export interface Speaker {
  t: (key: string, values: Values) => string;
  int: (n: number) => string;
  num: (n: number, digits: number) => string;
  lang: () => string;
}

const english: Record<string, string> = Object.assign(
  {},
  ...Object.values(
    import.meta.glob<Record<string, string>>(['../i18n/locales/en/data.json', '../i18n/locales/en/state.json'], {
      eager: true,
      import: 'default',
    }),
  ),
);

/** English, numbers as the host writes them - as this code spoke before it had a language to speak in. */
const host: Speaker = {
  t: (key, values) => formatMessage(english[key] ?? key, values, 'en'),
  int: (n) => n.toLocaleString(),
  num: (n, digits) => n.toFixed(digits),
  lang: () => 'en',
};

let speaker = host;

/** Say every message in the viewer's language from now on. Called once, on the main thread. */
export function speakWith(s: Speaker): void {
  speaker = s;
}

/** A message in the viewer's language; text that is not a message, as it is. */
export function say(m: Msg | string): string {
  if (typeof m === 'string') return m;
  const values: Values = {};
  if (m.values) for (const [k, v] of Object.entries(m.values)) values[k] = value(v);
  return speaker.t(m.key, values);
}

function value(v: MsgValue): string | number {
  if (typeof v !== 'object') return v;
  if ('key' in v) return say(v);
  if ('int' in v) return speaker.int(v.int);
  if ('num' in v) return speaker.num(v.num, v.digits);
  if ('each' in v) return v.each.map(say).join(v.between);
  return ordinalRules(speaker.lang()).select(v.ordinal);
}

const ordinals = new Map<string, Intl.PluralRules>();
function ordinalRules(lang: string): Intl.PluralRules {
  let r = ordinals.get(lang);
  if (!r) ordinals.set(lang, (r = new Intl.PluralRules(lang, { type: 'ordinal' })));
  return r;
}

/**
 * Say a dataset's name and warnings from its messages, in the language of the
 * moment: where it is built, again when it reaches the main thread, and again
 * whenever the language changes.
 */
export function sayDataset(ds: Dataset): void {
  const s = ds.said;
  if (!s) return;
  ds.name = [say(s.name), ...s.notes.map(say)].join(' · ');
  ds.warnings = s.warnings.map(say);
}

/**
 * A table of labels, each said when it is read.
 *
 * For a `Record` of labels that other code indexes like plain text: the keys
 * stay, and every read says its message in the language of the moment.
 */
export function sayingTable<K extends string>(keys: Record<K, string>): Record<K, string> {
  const out = {} as Record<K, string>;
  for (const k of Object.keys(keys) as K[]) {
    Object.defineProperty(out, k, { get: () => say(msg(keys[k])), enumerable: true });
  }
  return out;
}
