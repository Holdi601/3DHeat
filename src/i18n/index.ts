/**
 * The viewer in the user's language.
 *
 * Every word the viewer shows comes through `t(key, values)` from a catalog
 * per language - `locales/<language>/<part>.json`, one file per part of the
 * viewer, keys spelled out in full (`race.panel.load`) - in the ICU message
 * syntax (see message.ts). English is the source, loaded with the viewer;
 * any other language is fetched when it is chosen. A message a translation
 * lacks is said in English.
 *
 * The language is the browser's, the first of its languages the viewer
 * speaks, unless one was picked (kept in this browser). Numbers go through
 * `num`, lists through `list`, so a decimal comma and the language's own "and"
 * come with the words. React re-renders on a change through `useLang`; what was
 * worked out in words - the race analysis - is worked out again.
 */

import { create } from 'zustand';
import { detect, LANGUAGES } from './languages';
import { formatMessage, type Values } from './message';

export { LANGUAGES } from './languages';

type Catalog = Record<string, string>;

const english: Catalog = Object.assign(
  {},
  ...Object.values(import.meta.glob<Catalog>('./locales/en/*.json', { eager: true, import: 'default' })),
);
const others = import.meta.glob<Catalog>(['./locales/*/*.json', '!./locales/en/*.json'], { import: 'default' });

let current = 'en';

/**
 * The locale `Intl` is asked for, where our tag alone would get another
 * country's rules: Portuguese is Portugal's (Brazil's plural takes 0 as one),
 * Norwegian is Bokmål, Chinese is the mainland's and Taiwan's.
 */
const INTL: Record<string, string> = { pt: 'pt-PT', no: 'nb', zh: 'zh-CN', 'zh-Hant': 'zh-TW' };
const intl = () => INTL[current] ?? current;
let catalog: Catalog = english;

/** Run on a written message that carries a mark (U+2063): the units module's `reword`, set by it. */
let marked: ((text: string) => string) | null = null;
const MARK = '⁣';

/** Sets what a message with marked values goes through once written (`units/inText.ts`). */
export function setMarkedText(fn: ((text: string) => string) | null): void {
  marked = fn;
}

/** The message `key` in the current language, `values` filled in. */
export function t(key: string, values: Values = {}): string {
  const text = catalog[key] ?? english[key];
  if (text === undefined) {
    if (import.meta.env.DEV) console.warn(`i18n: no message "${key}"`);
    return key;
  }
  let out: string;
  try {
    out = formatMessage(text, values, intl());
  } catch {
    // A broken translation must not break the viewer: say it in English.
    out = formatMessage(english[key] ?? key, values, 'en');
  }
  return marked && out.includes(MARK) ? marked(out) : out;
}

/** Whether a message exists, in English at least. */
export function has(key: string): boolean {
  return key in english;
}

/** The current language's tag. */
export function lang(): string {
  return current;
}

/**
 * A number with `digits` decimals, written the current language's way - its
 * decimal mark, no grouping: a distance of 3108 m stays one number in every
 * language. '—' for none.
 */
export function num(value: number, digits = 0): string {
  if (!Number.isFinite(value)) return '—';
  return numbers(digits, false).format(value);
}

/** A whole number with the language's digit grouping: a count, a size. */
export function int(value: number): string {
  if (!Number.isFinite(value)) return '—';
  return numbers(0, true).format(Math.round(value));
}

/**
 * Items joined the language's way: "a, b and c" (`and`), "a, b or c" (`or`),
 * or one after the other with the language's comma (`unit`: "a, b, c",
 * "a、b、c").
 */
export function list(items: string[], type: 'and' | 'or' | 'unit' = 'and'): string {
  if (items.length <= 1) return items.join('');
  if (type === 'unit') return items.join(t('common.listSeparator'));
  const kind = type === 'and' ? 'conjunction' : 'disjunction';
  const key = `${current}|${kind}`;
  let f = lists.get(key);
  if (!f) lists.set(key, (f = new Intl.ListFormat(intl(), { type: kind, style: 'long' })));
  return f.format(items);
}

const numberFormats = new Map<string, Intl.NumberFormat>();
function numbers(digits: number, grouping: boolean): Intl.NumberFormat {
  const key = `${current}|${digits}|${grouping}`;
  let f = numberFormats.get(key);
  if (!f) {
    f = new Intl.NumberFormat(intl(), { minimumFractionDigits: digits, maximumFractionDigits: digits, useGrouping: grouping });
    numberFormats.set(key, f);
  }
  return f;
}
const lists = new Map<string, Intl.ListFormat>();

const STORAGE = 'heat3d.language';

/** The picked language, or 'auto' for the browser's; kept in this browser. */
function stored(): string {
  try {
    return localStorage.getItem(STORAGE) ?? 'auto';
  } catch {
    return 'auto';
  }
}

function browserLanguages(): readonly string[] {
  return typeof navigator !== 'undefined' ? (navigator.languages ?? [navigator.language]) : ['en'];
}

interface LangState {
  /** What was picked: a language's tag, or 'auto'. */
  choice: string;
  /** The language spoken now. */
  lang: string;
}

export const useLangStore = create<LangState>(() => ({ choice: 'auto', lang: 'en' }));

/** The current language, for a component to re-render when it changes. */
export function useLang(): string {
  return useLangStore((s) => s.lang);
}

const listeners = new Set<(lang: string) => void>();

/** Run `fn` after every change of language. */
export function onLanguageChange(fn: (lang: string) => void): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

/** Speak `choice` - a language's tag, or 'auto' for the browser's - and keep it. */
export async function setLanguage(choice: string): Promise<void> {
  const code = choice === 'auto' || !LANGUAGES.some((l) => l.code === choice) ? detect(browserLanguages()) : choice;
  let next: Catalog = english;
  if (code !== 'en') {
    const parts = Object.entries(others).filter(([path]) => path.startsWith(`./locales/${code}/`));
    next = Object.assign({}, ...(await Promise.all(parts.map(([, load]) => load()))));
  }
  try {
    if (choice === 'auto') localStorage.removeItem(STORAGE);
    else localStorage.setItem(STORAGE, choice);
  } catch {
    // Not kept: the choice lasts until the page is closed.
  }
  const changed = code !== current;
  current = code;
  catalog = next;
  numberFormats.clear();
  lists.clear();
  if (typeof document !== 'undefined') document.documentElement.lang = code;
  useLangStore.setState({ choice, lang: code });
  if (changed) for (const fn of listeners) fn(code);
}

/** The language at start: the one kept, or the browser's. */
export function startLanguage(): Promise<void> {
  return setLanguage(stored());
}
